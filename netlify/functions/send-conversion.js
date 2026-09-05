// netlify/functions/send-conversion.js
//
// Reçoit un événement de conversion (ex: Purchase) depuis une page produit,
// et le transmet à Meta Conversions API, côté serveur.
//
// Le jeton d'accès (FB_CAPI_TOKEN) est lu depuis une variable d'environnement
// Netlify — il n'est jamais présent dans le code ni exposé au navigateur.

const crypto = require('crypto');

const PIXEL_ID = '28104829105769495';
const GRAPH_API_VERSION = 'v21.0';
const COUNTRY = 'tg'; // Togo, codé en dur : pas besoin de le demander au client

// Meta exige que les données personnelles (téléphone, nom, ville, pays...)
// soient hashées en SHA-256 avant l'envoi — jamais en clair.
function sha256(value) {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return undefined;
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Met un numéro togolais au format international attendu par Meta (+228XXXXXXXX)
// avant hashage, sans quoi le rapprochement avec le Pixel navigateur est moins fiable.
function normalizePhone(raw) {
    if (!raw) return undefined;
    let digits = String(raw).replace(/[^\d]/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.length === 8) digits = '228' + digits; // format local togolais
    return digits;
}

// Nettoie une valeur "Ville, Quartier" pour ne garder que la ville avant
// le hashage (ex: "Lomé, Tokoin" -> "Lomé"), plus fiable pour le matching.
function normalizeCity(raw) {
    if (!raw) return undefined;
    const city = String(raw).split(',')[0].trim();
    return city || undefined;
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const token = process.env.FB_CAPI_TOKEN;
    if (!token) {
        console.error('FB_CAPI_TOKEN manquant dans les variables d\'environnement Netlify.');
        return { statusCode: 500, body: JSON.stringify({ error: 'Configuration manquante côté serveur.' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'JSON invalide.' }) };
    }

    const {
        eventName,     // ex: 'Purchase'
        eventId,       // même identifiant que celui envoyé au Pixel navigateur (déduplication)
        eventSourceUrl,
        value,
        currency,
        contentName,
        contentIds,
        phone,
        firstName,
        city,          // ville/quartier saisi dans le formulaire
        orderId,       // id du document Firestore de la commande
        fbp,           // cookie _fbp (Pixel navigateur)
        fbc,           // cookie _fbc (clic pub Facebook)
    } = payload;

    if (!eventName) {
        return { statusCode: 400, body: JSON.stringify({ error: 'eventName requis.' }) };
    }

    const clientIp =
        event.headers['x-nf-client-connection-ip'] ||
        (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        undefined;

    const fbEvent = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || undefined,
        action_source: 'website',
        event_source_url: eventSourceUrl || undefined,
        user_data: {
            ph: normalizePhone(phone) ? [sha256(normalizePhone(phone))] : undefined,
            fn: firstName ? [sha256(firstName)] : undefined,
            ct: normalizeCity(city) ? [sha256(normalizeCity(city))] : undefined,
            country: [sha256(COUNTRY)],
            client_ip_address: clientIp,
            client_user_agent: event.headers['user-agent'] || undefined,
            fbp: fbp || undefined,
            fbc: fbc || undefined,
        },
        custom_data: {
            currency: currency || 'XAF',
            value: value !== undefined ? Number(value) : undefined,
            content_name: contentName || undefined,
            content_ids: contentIds || undefined,
            content_type: 'product',
            order_id: orderId || undefined,
        },
    };

    const graphUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;

    try {
        const resp = await fetch(graphUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [fbEvent] }),
        });
        const result = await resp.json();

        if (!resp.ok || result.error) {
            console.error('Erreur Meta Conversions API:', result.error || result);
            return { statusCode: 502, body: JSON.stringify({ error: result.error || 'Échec envoi Meta' }) };
        }

        return { statusCode: 200, body: JSON.stringify({ ok: true, result }) };
    } catch (err) {
        console.error('Erreur réseau vers Meta:', err);
        return { statusCode: 500, body: JSON.stringify({ error: 'Erreur réseau.' }) };
    }
};
