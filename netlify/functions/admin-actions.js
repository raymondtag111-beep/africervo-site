// netlify/functions/admin-actions.js
//
// Actions réservées à l'admin (protégées par la clé ADMIN_API_KEY) :
//   - confirm          : passe la commande en « Confirmée » ET envoie UN SEUL
//                        événement Purchase à Meta (API de Conversions)
//   - blacklist_add    : ajoute un numéro à la liste noire (toute la boutique)
//   - blacklist_remove : retire un numéro de la liste noire
//   - ping             : vérifie que la clé est correcte
//
// Variables d'environnement Netlify nécessaires :
//   ADMIN_API_KEY, FB_CAPI_TOKEN, FIREBASE_SERVICE_ACCOUNT
//   (facultatives : FB_PIXEL_ID, FB_TEST_EVENT_CODE pour tester dans « Événements de test » de Meta)

const crypto = require('crypto');
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

const DEFAULT_PIXEL_ID = '28104829105769495';
const GRAPH_API_VERSION = 'v21.0';

function json(statusCode, obj) {
    return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

function sha256(value) {
    const v = String(value == null ? '' : value).trim().toLowerCase();
    return v ? crypto.createHash('sha256').update(v).digest('hex') : undefined;
}

function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function firstName(full) {
    return String(full || '').trim().split(/\s+/)[0] || '';
}

function cityOnly(raw) {
    return String(raw || '').split(',')[0].trim();
}

async function sendPurchaseToMeta(orderId, o) {
    const token = process.env.FB_CAPI_TOKEN;
    if (!token) throw new Error('FB_CAPI_TOKEN manquant dans Netlify.');
    const pixelId = process.env.FB_PIXEL_ID || DEFAULT_PIXEL_ID;

    const telNorm = o.telNorm || normalizePhoneLocal(o.tel);
    const user = {
        ph: telNorm ? [sha256('228' + telNorm)] : undefined,
        external_id: telNorm ? [sha256(telNorm)] : undefined,
        fn: firstName(o.nom) ? [sha256(firstName(o.nom))] : undefined,
        ct: cityOnly(o.ville) ? [sha256(cityOnly(o.ville))] : undefined,
        country: [sha256('tg')],
        client_ip_address: o.ip || undefined,
        client_user_agent: o.ua || undefined,
        fbp: o.fbp || undefined,
        fbc: o.fbc || undefined,
    };

    const body = {
        data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: orderId, // un seul événement possible par commande
            action_source: 'website',
            event_source_url: o.sourceUrl || undefined,
            user_data: user,
            custom_data: {
                currency: 'XAF',
                value: Number(o.total) || 0,
                content_name: o.produit || undefined,
                content_ids: o.produitId ? [o.produitId] : undefined,
                content_type: 'product',
                num_items: Number(o.quantite) || 1,
                order_id: orderId,
            },
        }],
    };
    if (process.env.FB_TEST_EVENT_CODE) body.test_event_code = process.env.FB_TEST_EVENT_CODE;

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const result = await resp.json().catch(() => ({}));
    if (!resp.ok || result.error) {
        throw new Error((result.error && result.error.message) || ('Meta HTTP ' + resp.status));
    }
    return result;
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Méthode non autorisée' });

    const expected = process.env.ADMIN_API_KEY;
    if (!expected) return json(500, { ok: false, error: 'ADMIN_API_KEY manquante dans Netlify.' });
    const given = event.headers['x-admin-key'] || '';
    if (!given || !safeEqual(given, expected)) return json(401, { ok: false, error: 'Clé admin invalide.' });

    let p;
    try { p = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false, error: 'JSON invalide' }); }

    const db = admin.firestore();

    try {
        if (p.action === 'ping') return json(200, { ok: true });

        if (p.action === 'blacklist_add') {
            const telNorm = normalizePhoneLocal(p.tel);
            if (!telNorm) return json(400, { ok: false, error: 'Numéro invalide.' });
            await db.collection('blacklist').doc(telNorm).set({
                telNorm,
                nom: String(p.nom || '').slice(0, 80),
                motif: String(p.motif || '').slice(0, 200),
                orderId: String(p.orderId || '').slice(0, 60),
                addedAt: new Date().toISOString(),
            });
            return json(200, { ok: true, telNorm });
        }

        if (p.action === 'blacklist_remove') {
            const telNorm = normalizePhoneLocal(p.telNorm || p.tel);
            if (!telNorm) return json(400, { ok: false, error: 'Numéro invalide.' });
            await db.collection('blacklist').doc(telNorm).delete();
            return json(200, { ok: true });
        }

        if (p.action === 'confirm') {
            const orderId = String(p.orderId || '');
            if (!orderId) return json(400, { ok: false, error: 'orderId requis.' });
            const ref = db.collection('commandes').doc(orderId);

            // Réservation atomique : une seule requête peut envoyer l'achat à Meta.
            const reserved = await db.runTransaction(async (tx) => {
                const s = await tx.get(ref);
                if (!s.exists) return { missing: true };
                const d = s.data();
                if (d.metaSent === true) {
                    if (d.status !== 'confirmed' && d.status !== 'delivered') {
                        tx.update(ref, { status: 'confirmed' });
                    }
                    return { already: true };
                }
                const previous = d.status || 'non livre';
                const order = Object.assign({}, d);
                tx.update(ref, {
                    metaSent: true,
                    status: 'confirmed',
                    confirmedAt: new Date().toISOString(),
                });
                return { ok: true, previous, order };
            });

            if (reserved.missing) return json(404, { ok: false, error: 'Commande introuvable.' });
            if (reserved.already) return json(200, { ok: true, already: true });

            try {
                await sendPurchaseToMeta(orderId, reserved.order);
                await ref.update({ metaSentAt: new Date().toISOString() });
                return json(200, { ok: true, sent: true });
            } catch (err) {
                // Échec côté Meta : on annule la réservation pour pouvoir réessayer.
                await ref.update({
                    metaSent: false,
                    status: reserved.previous,
                    confirmedAt: admin.firestore.FieldValue.delete(),
                });
                console.error('Meta CAPI:', err.message);
                return json(502, { ok: false, error: 'Envoi à Meta impossible : ' + err.message });
            }
        }

        return json(400, { ok: false, error: 'Action inconnue.' });
    } catch (err) {
        console.error('admin-actions:', err);
        return json(500, { ok: false, error: 'Erreur serveur.' });
    }
};
