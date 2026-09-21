// ========================================
// visitor-tracker.js  (version 2)
// Suivi des visiteurs SANS adresse IP.
//
// - 1 téléphone / navigateur = 1 visiteur (identifiant aléatoire gardé dans
//   le stockage du navigateur + cookie de secours). L'IP peut changer, l'identifiant reste.
// - Visiteurs actifs en direct (présence Firebase + signal toutes les 20 s).
// - Pour chaque visiteur du jour : appareil, navigateur, provenance, pages vues avec l'heure.
//
// À charger sur toutes les pages du site, APRÈS l'initialisation de Firebase
// (mêmes scripts firebase-app + firebase-database qu'avant).
// ========================================

(function () {
    'use strict';

    var NODE = 'stats';
    var HEARTBEAT_MS = 20000;
    var MAX_VIEWS_PER_DAY = 60; // limite par visiteur et par jour (anti-abus)

    // ---------- Stockage sécurisé (jamais d'erreur, même en navigation privée) ----------
    function makeStore(type) {
        try {
            var s = window[type], k = '__ac_test';
            s.setItem(k, '1');
            s.removeItem(k);
            return s;
        } catch (e) {
            var mem = {};
            return {
                getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
                setItem: function (k, v) { mem[k] = String(v); },
                removeItem: function (k) { delete mem[k]; }
            };
        }
    }
    var LS = makeStore('localStorage');
    var SS = makeStore('sessionStorage');

    // ---------- Exclusions : admin, robots, et TES propres visites ----------
    // Ouvre une fois ton site avec ?notrack=1 sur ton téléphone pour ne plus jamais t'y compter
    // (?notrack=0 pour réactiver le suivi).
    try {
        var nt = /[?&]notrack=([01])/.exec(window.location.search);
        if (nt) {
            if (nt[1] === '1') LS.setItem('ac_notrack', '1');
            else LS.removeItem('ac_notrack');
        }
    } catch (e) { /* ignore */ }
    if (LS.getItem('ac_notrack') === '1') return;
    if (/admin/i.test(window.location.pathname)) return;
    if (/bot|crawl|spider|slurp|facebookexternalhit|lighthouse|headless|pingdom|gtmetrix/i.test(navigator.userAgent || '')) return;

    // ---------- Utilitaires ----------
    function randHex(bytes) {
        var a = new Uint8Array(bytes), i;
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(a);
        } else {
            for (i = 0; i < bytes; i++) a[i] = Math.floor(Math.random() * 256);
        }
        var out = '';
        for (i = 0; i < a.length; i++) out += ('0' + a[i].toString(16)).slice(-2);
        return out;
    }

    // Identifiant du visiteur (le même à chaque visite, même si l'IP change)
    function getVisitorId() {
        var id = LS.getItem('ac_vid');
        if (!/^[a-f0-9]{32}$/.test(id || '')) {
            var m = /(?:^|;\s*)ac_vid=([a-f0-9]{32})/.exec(document.cookie || '');
            id = m ? m[1] : randHex(16);
        }
        LS.setItem('ac_vid', id);
        try { document.cookie = 'ac_vid=' + id + '; max-age=31536000; path=/; SameSite=Lax'; } catch (e) { /* ignore */ }
        return id;
    }

    // Identifiant de l'onglet (change si on ouvre un nouvel onglet, reste identique en naviguant)
    function getSessionId() {
        var id = SS.getItem('ac_sid');
        if (!/^[a-f0-9]{12}$/.test(id || '')) {
            id = randHex(6);
            SS.setItem('ac_sid', id);
        }
        return id;
    }

    function todayKey() {
        // Date UTC = date de Lomé (Togo est en UTC+0)
        return new Date().toISOString().slice(0, 10);
    }

    function clip(s, n) { return String(s == null ? '' : s).slice(0, n); }

    // Nom lisible de la page actuelle, pour l'affichage dans l'admin
    function getPageLabel() {
        var path = window.location.pathname.split('/').pop() || 'index.html';
        var labels = {
            'index.html': '🏠 Accueil',
            '': '🏠 Accueil',
            'admin.html': '⚙️ Admin',
            'huile-pour-barbe-et-cheveux.html': 'Huile pour barbe et cheveux',
            'montre-connectee-sk40.html': 'Montre connectée SK40',
            'montre-connectee-a58-plus.html': 'Montre connectée A58 plus',
            'diffuseur.html': 'Diffuseur',
            'lime-electrique.html': 'Lime électrique',
            'montre-connectee-h92-ultra3.html': 'Montre connectée H92 Ultra3',
            'mixeur-de-jus-portable.html': 'Mixeur de jus portable',
            'coupe-legume-multifonction.html': 'Coupe légume multifonction',
            'anti-tache-et-acne.html': 'Anti-tache et Acné',
            'mandoline-multifonction.html': 'Mandoline multifonction',
            'patch-detox-kinoki.html': 'Patch Detox Kinoki',
            'ecouteur-intelligent-m6.html': 'Ecouteur intelligent M6',
            'ceinture-anti-douleurs-menstruelles.html': 'Ceinture anti-douleurs menstruelles',
            'moulinex-blender-8-en-1.html': 'Moulinex blender 8 en 1',
            'creme-cindynal-reparation-intense.html': 'Crème cindynal réparation intense'
        };
        return clip(labels[path] || path.replace('.html', '').replace(/-/g, ' '), 100);
    }

    // Appareil / système / navigateur (les navigateurs intégrés Facebook, Instagram, TikTok sont reconnus)
    function parseUA(ua) {
        var os = 'Autre', device = '💻 Ordinateur', browser = 'Navigateur';
        if (/Android/i.test(ua)) { os = 'Android'; device = '📱 Android'; }
        else if (/iPhone|iPod/i.test(ua)) { os = 'iOS'; device = '📱 iPhone'; }
        else if (/iPad/i.test(ua)) { os = 'iPadOS'; device = '📱 iPad'; }
        else if (/Windows/i.test(ua)) { os = 'Windows'; }
        else if (/Mac OS X|Macintosh/i.test(ua)) { os = 'macOS'; }
        else if (/Linux|X11/i.test(ua)) { os = 'Linux'; }

        if (/FBAN|FBAV|FB_IAB/i.test(ua)) browser = 'Facebook (appli)';
        else if (/Instagram/i.test(ua)) browser = 'Instagram (appli)';
        else if (/TikTok|musical_ly|Bytedance/i.test(ua)) browser = 'TikTok (appli)';
        else if (/EdgA?\/|Edg\//i.test(ua)) browser = 'Edge';
        else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
        else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
        else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
        else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
        else if (/Safari/i.test(ua)) browser = 'Safari';
        return { os: os, device: device, browser: browser };
    }

    // Provenance du visiteur (mémorisée pour tout l'onglet : la 1re page décide)
    function detectSource() {
        var cached = SS.getItem('ac_src');
        if (cached) return cached;
        var src = 'Direct';
        try {
            var qs = window.location.search || '';
            var utm = (/[?&]utm_source=([^&]*)/i.exec(qs) || [])[1] || '';
            var host = '';
            try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) { /* pas de referrer */ }
            var s = (decodeURIComponent(utm) + ' ' + host).toLowerCase();
            if (/[?&]fbclid=/i.test(qs) || /facebook|fb\.com|fb\.me/.test(s)) src = 'Facebook';
            else if (/instagram/.test(s)) src = 'Instagram';
            else if (/[?&]ttclid=/i.test(qs) || /tiktok/.test(s)) src = 'TikTok';
            else if (/whatsapp|wa\.me/.test(s)) src = 'WhatsApp';
            else if (/google/.test(s)) src = 'Google';
            else if (host && host !== window.location.hostname) src = host;
        } catch (e) { /* ignore */ }
        src = clip(src, 60);
        SS.setItem('ac_src', src);
        return src;
    }

    // ---------- Démarrage (attend que Firebase soit prêt) ----------
    var tries = 0;
    (function boot() {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.database) {
            start();
            return;
        }
        if (++tries > 20) {
            console.warn('⚠️ visitor-tracker: Firebase non chargé');
            return;
        }
        setTimeout(boot, 500);
    })();

    function start() {
        var db = firebase.database();
        var TS = firebase.database.ServerValue.TIMESTAMP;

        var vid = getVisitorId();
        var sid = getSessionId();
        var info = parseUA(navigator.userAgent || '');
        var label = getPageLabel();
        var path = clip(window.location.pathname, 200);
        var currentDate = todayKey();

        function safe(promise) {
            if (promise && typeof promise.catch === 'function') promise.catch(function () { /* ignore */ });
        }

        // ---- 1. Visiteur du jour + pages vues ----
        function logVisit() {
            var date = todayKey();
            currentDate = date;
            var dayRef = db.ref(NODE + '/daily/' + date + '/' + vid);
            var regKey = 'ac_reg_' + date;
            var first = !LS.getItem(regKey);

            var data = { lastSeen: TS, lastPage: label, device: info.device, os: info.os, browser: info.browser };
            if (first) {
                data.firstSeen = TS;
                data.source = detectSource();
            }

            // nettoyage des anciennes clés du jour précédent
            try {
                for (var i = LS.length - 1; i >= 0; i--) {
                    var k = LS.key(i);
                    if (k && (k.indexOf('ac_reg_') === 0 || k.indexOf('ac_vc_') === 0) && k.indexOf(date) === -1) LS.removeItem(k);
                }
            } catch (e) { /* ignore */ }

            safe(dayRef.update(data).then(function () {
                if (first) LS.setItem(regKey, '1');

                // Anti-doublon (rechargement rapide de la même page) + limite par jour
                var last = SS.getItem('ac_lv') || '';
                var now = Date.now();
                var cKey = 'ac_vc_' + date;
                var count = parseInt(LS.getItem(cKey) || '0', 10) || 0;
                var lastPath = last.split('@')[0];
                var lastTime = parseInt(last.split('@')[1] || '0', 10) || 0;
                if (count >= MAX_VIEWS_PER_DAY) return;
                if (lastPath === path && now - lastTime < 30000) return;

                SS.setItem('ac_lv', path + '@' + now);
                LS.setItem(cKey, String(count + 1));
                return dayRef.child('views').push({ page: label, path: path, t: TS });
            }));
        }

        // ---- 2. Présence en direct ----
        var liveRef = db.ref(NODE + '/live/' + sid);

        function beat() {
            if (todayKey() !== currentDate) logVisit(); // page restée ouverte après minuit
            safe(liveRef.set({ vid: vid, page: label, path: path, device: info.device, lastSeen: TS }));
        }

        // À chaque (re)connexion à Firebase : on ré-arme la suppression automatique et on s'annonce
        db.ref('.info/connected').on('value', function (snap) {
            if (snap.val() === true) {
                liveRef.onDisconnect().remove();
                beat();
            }
        });

        setInterval(beat, HEARTBEAT_MS);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') beat();
        });
        window.addEventListener('pageshow', function (e) { if (e.persisted) beat(); });
        window.addEventListener('pagehide', function () { safe(liveRef.remove()); });

        logVisit();

        // ---- 3. Optionnel : marquer le visiteur comme "a commandé" ----
        // À appeler quand une commande est validée :  AfriCervoTracker.markOrder()
        window.AfriCervoTracker = {
            visitorId: vid,
            markOrder: function () {
                try {
                    safe(db.ref(NODE + '/daily/' + todayKey() + '/' + vid).update({ ordered: true, lastSeen: TS }));
                } catch (e) { /* ignore */ }
            }
        };
    }
})();
