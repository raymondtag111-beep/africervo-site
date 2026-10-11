// netlify/functions/submit-order.js
//
// Enregistre une commande venant d'une page produit, avec les contrôles :
//   1. numéro valide (normalisé : 228 / +228 / 00228 acceptés ou non)
//   2. numéro absent de la liste noire (collection "blacklist", toute la boutique)
//   3. pas de commande avec le même numéro ET le même produit depuis moins de 72 h
// La commande est créée avec le statut "non livre" (= « À confirmer » dans l'admin).
// RIEN n'est envoyé à Meta ici : l'événement Purchase part seulement quand tu
// cliques « Confirmée » dans l'admin (voir admin-actions.js).

const admin = require('firebase-admin');
// Normalisation des numéros togolais : "228 90 12 34 56", "+228 90123456",
// "00228 90123456" et "90123456" donnent tous "90123456" (8 chiffres).
// Retourne null si le numéro n'est pas exploitable.
function normalizePhoneLocal(raw) {
    let d = String(raw == null ? '' : raw).replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('228')) d = d.slice(3);
    return /^\d{8}$/.test(d) ? d : null;
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
}

const DUPLICATE_WINDOW_MS = 72 * 60 * 60 * 1000;

function json(statusCode, obj) {
    return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

function str(v, max) {
    return String(v == null ? '' : v).trim().slice(0, max);
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') return json(405, { ok: false, reason: 'method' });

    let p;
    try { p = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false, reason: 'invalid' }); }

    const nom = str(p.nom, 80);
    const tel = str(p.tel, 30);
    const ville = str(p.ville, 120);
    const note = str(p.note, 500);
    const produit = str(p.produit, 200);
    const produitId = str(p.produitId, 80);
    const quantite = Math.round(Number(p.quantite));
    const total = Number(p.total);

    if (nom.length < 2 || ville.length < 2 || !produit ||
        !/^[a-z0-9-]{2,80}$/.test(produitId) ||
        !(quantite >= 1 && quantite <= 20) ||
        !(total > 0 && total <= 5000000)) {
        return json(400, { ok: false, reason: 'invalid' });
    }

    const telNorm = normalizePhoneLocal(tel);
    if (!telNorm) return json(400, { ok: false, reason: 'invalid_phone' });

    const db = admin.firestore();
    const ip = event.headers['x-nf-client-connection-ip'] ||
        (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || '';
    const ua = str(event.headers['user-agent'], 300);
    const nowIso = new Date().toISOString();

    async function logBlocked(reason) {
        try {
            await db.collection('blocked_attempts').add({
                telNorm, nom, produitId, produit, reason, date: nowIso, ip,
            });
        } catch (e) { console.error('log blocked_attempts:', e.message); }
    }

    try {
        // 1) Liste noire (prioritaire sur le doublon)
        const bl = await db.collection('blacklist').doc(telNorm).get();
        if (bl.exists) {
            await logBlocked('blacklist');
            return json(200, { ok: false, reason: 'blacklist' });
        }

        // 2) Doublon 72 h + création, dans une transaction (évite le double clic / les envois simultanés)
        const since = Date.now() - DUPLICATE_WINDOW_MS;
        const ref = db.collection('commandes').doc();
        const result = await db.runTransaction(async (tx) => {
            const snap = await tx.get(db.collection('commandes').where('telNorm', '==', telNorm));
            const dup = snap.docs.some((d) => {
                const x = d.data();
                return x.produitId === produitId && Date.parse(x.date) >= since;
            });
            if (dup) return { dup: true };
            tx.set(ref, {
                nom, tel, telNorm, ville, note, produit, produitId,
                quantite, total,
                date: nowIso,
                status: 'non livre',
                metaSent: false,
                fbp: str(p.fbp, 200),
                fbc: str(p.fbc, 300),
                sourceUrl: str(p.sourceUrl, 500),
                ip, ua,
            });
            return { dup: false };
        });

        if (result.dup) {
            await logBlocked('duplicate');
            return json(200, { ok: false, reason: 'duplicate' });
        }
        return json(200, { ok: true, orderId: ref.id });
    } catch (err) {
        console.error('submit-order:', err);
        return json(500, { ok: false, reason: 'server' });
    }
};

exports.normalizePhoneLocal = normalizePhoneLocal; // utilisé par les tests
