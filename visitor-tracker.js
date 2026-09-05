// ========================================
// visitor-tracker.js
// Suivi des visiteurs en temps réel, basé sur l'adresse IP publique.
// 1 IP = 1 visiteur (même IP = même visiteur, jamais compté deux fois le même jour).
// ========================================

(function () {
    if (typeof firebase === 'undefined') {
        console.warn('⚠️ visitor-tracker: Firebase non chargé');
        return;
    }

    // Nom lisible de la page actuelle, pour l'affichage en temps réel dans l'admin
    function getPageLabel() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const labels = {
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
        return labels[path] || path.replace('.html', '').replace(/-/g, ' ');
    }

    function sanitizeIp(ip) {
        // Les clés Firebase Realtime Database ne peuvent pas contenir . # $ [ ]
        return ip.replace(/\./g, '_').replace(/:/g, '-');
    }

    function todayKey() {
        return new Date().toISOString().split('T')[0]; // ex: 2026-07-24
    }

    function startTracking(ip) {
        const rtdb = firebase.database();
        const safeIp = sanitizeIp(ip);
        const liveRef = rtdb.ref('visitors/live/' + safeIp);
        const dailyRef = rtdb.ref('visitors/daily/' + todayKey() + '/' + safeIp);

        function updatePresence() {
            liveRef.set({
                ip: ip,
                page: getPageLabel(),
                path: window.location.pathname + window.location.search,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }

        updatePresence();
        // Supprime automatiquement l'entrée si le visiteur ferme l'onglet / perd la connexion
        liveRef.onDisconnect().remove();

        // 1 IP = 1 visiteur, avec l'heure d'arrivée et la dernière page consultée
        dailyRef.once('value').then(function (snap) {
            if (!snap.exists()) {
                dailyRef.set({
                    ip: ip,
                    firstSeen: firebase.database.ServerValue.TIMESTAMP,
                    lastSeen: firebase.database.ServerValue.TIMESTAMP,
                    lastPage: getPageLabel()
                });
            } else {
                dailyRef.update({
                    lastSeen: firebase.database.ServerValue.TIMESTAMP,
                    lastPage: getPageLabel()
                });
            }
        });

        // Rafraîchit la présence toutes les 20 secondes pour rester "en direct"
        const heartbeat = setInterval(updatePresence, 20000);

        window.addEventListener('beforeunload', function () {
            clearInterval(heartbeat);
            liveRef.remove();
        });
    }

    // Récupère l'IP publique du visiteur, puis démarre le suivi
    fetch('https://api.ipify.org?format=json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data && data.ip) {
                startTracking(data.ip);
            }
        })
        .catch(function (err) {
            console.warn('⚠️ visitor-tracker: impossible de récupérer l\'IP', err);
        });
})();