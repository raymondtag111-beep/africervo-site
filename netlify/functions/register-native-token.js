// netlify/functions/register-native-token.js
// Reçoit le token FCM envoyé par l'app Android native (AfriCervo Admin) et
// l'enregistre dans la MÊME collection que les tokens web (admin_tokens),
// avec un champ "platform" qui permet à send-notification.js de savoir à
// quel format de message chaque appareil a besoin (voir ce fichier).
// Utilise la MÊME variable d'environnement FIREBASE_SERVICE_ACCOUNT que
// send-notification.js — rien à ajouter côté Netlify si déjà configurée.

const admin = require('firebase-admin');

if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    }
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { token, device } = JSON.parse(event.body || '{}');
        if (!token) {
            return { statusCode: 400, body: JSON.stringify({ error: 'token manquant' }) };
        }

        await admin.firestore().collection('admin_tokens').doc(token).set({
            device: device || 'Android natif',
            platform: 'android-native',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (e) {
        console.error('❌ Erreur enregistrement token natif:', e.message);
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
