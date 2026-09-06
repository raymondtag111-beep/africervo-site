// netlify/functions/delete-cloudinary-image.js
// Supprime DÉFINITIVEMENT un fichier (image ou vidéo) hébergé sur Cloudinary.
// Appelée automatiquement par admin.html juste après qu'une image de
// remplacement a bien été envoyée : l'ancien fichier ne doit plus jamais
// réapparaître nulle part, ni continuer à occuper de l'espace.
//
// ========== INSTALLATION (une seule fois) ==========
// Sur Netlify → Site settings → Environment variables, ajoute :
//   CLOUDINARY_API_KEY    : ta clé API Cloudinary (Dashboard Cloudinary → Settings → API Keys)
//   CLOUDINARY_API_SECRET : ta clé secrète Cloudinary (même page — ne JAMAIS la mettre dans admin.html)
// (CLOUDINARY_CLOUD_NAME n'a pas besoin d'être secrète, elle est déjà "kcj6rida" dans admin.html,
//  mais tu peux aussi la définir en variable d'environnement si tu préfères.)
// Puis redéploie le site pour que la fonction voie ces variables.

const crypto = require('crypto');

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { publicId, resourceType } = JSON.parse(event.body || '{}');
        if (!publicId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'publicId manquant' }) };
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'kcj6rida';
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!apiKey || !apiSecret) {
            console.warn('⚠️ CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET absentes des variables d\'environnement Netlify.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Variables Cloudinary manquantes côté serveur (voir en-tête de ce fichier).' })
            };
        }

        const type = resourceType === 'video' ? 'video' : 'image';
        const timestamp = Math.floor(Date.now() / 1000);

        // Signature exigée par l'API Cloudinary pour toute opération de suppression
        // (empêche n'importe qui d'appeler l'API en se faisant passer pour nous).
        const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const body = new URLSearchParams();
        body.append('public_id', publicId);
        body.append('timestamp', String(timestamp));
        body.append('api_key', apiKey);
        body.append('signature', signature);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });
        const data = await res.json();

        // data.result vaut "ok" si supprimé, "not found" si déjà absent (pas grave dans les deux cas)
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (e) {
        console.error('❌ Erreur suppression Cloudinary:', e.message);
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
