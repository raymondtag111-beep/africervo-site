// netlify/functions/send-notification.js
// Envoie une vraie notification push (FCM) vers l'app AfriCervo Admin
// à chaque fois qu'une commande est créée sur une page produit.
//
// IMPORTANT : ce message doit rester "data seulement" (AUCUN bloc
// "notification" ni "webpush.notification" au niveau du message envoyé
// à Firebase). Dès qu'un de ces blocs est présent, le téléphone affiche
// sa propre notification automatique et IGNORE complètement le code
// personnalisé de firebase-messaging-sw.js (onBackgroundMessage) — qui
// est pourtant celui qui insère l'image, le nom et le prix du produit.
// Les deux styles ne peuvent pas être combinés : "data seulement" est
// le seul moyen de garder la notification riche et personnalisée.
//
// ========== INSTALLATION (une seule fois) ==========
// 1. Place ce fichier exactement ici dans ton projet :
//      netlify/functions/send-notification.js
// 2. À la racine du projet (là où se trouve normalement un package.json,
//    ou crée-en un s'il n'existe pas encore) :
//      npm install firebase-admin
// 3. Sur Netlify → Site settings → Environment variables, ajoute une variable :
//      Nom  : FIREBASE_SERVICE_ACCOUNT
//      Valeur : le contenu ENTIER du fichier JSON téléchargé depuis
//               Firebase Console → ⚙️ Paramètres du projet → Comptes de service
//               → "Générer une nouvelle clé privée" (colle tout le JSON, sur une seule ligne)
// 4. Redéploie le site sur Netlify (un nouveau déploiement est nécessaire
//    pour que la variable d'environnement et la fonction soient prises en compte)

const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        )
    });
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { orderId, clientName, produit, total, icon, imageUrl } = JSON.parse(event.body || '{}');
        const finalIcon = icon || imageUrl || 'icon-192.png';

        const tokensSnap = await admin.firestore().collection('admin_tokens').get();
        const tokens = tokensSnap.docs.map((doc) => doc.id);

        if (tokens.length === 0) {
            console.log('Aucun token enregistré, notification non envoyée.');
            return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'no-tokens' }) };
        }

        const title = '🆕 Nouvelle commande AfriCervo !';
        const body = `${produit || 'Produit'} — ${clientName || 'Client'} (${(total || 0).toLocaleString('fr-FR')} FCFA)`;

        // Message "data seulement" : c'est firebase-messaging-sw.js (onBackgroundMessage)
        // qui construit la notification complète (titre, texte, image du produit,
        // vibration, tag par commande) à partir de ces champs.
        const message = {
            data: {
                title: title,
                body: body,
                orderId: orderId || '',
                icon: finalIcon,
                tag: `commande-${orderId || Date.now()}`,
                url: `/admin.html${orderId ? `?order=${orderId}` : ''}`
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Notifications envoyées : ${response.successCount} succès, ${response.failureCount} échecs`);

        // Nettoyage des tokens invalides/expirés
        const cleanupPromises = [];
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                const errCode = res.error && res.error.code;
                if (
                    errCode === 'messaging/invalid-registration-token' ||
                    errCode === 'messaging/registration-token-not-registered'
                ) {
                    cleanupPromises.push(
                        admin.firestore().collection('admin_tokens').doc(tokens[idx]).delete().catch(() => {})
                    );
                }
            }
        });
        await Promise.all(cleanupPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ sent: response.successCount, failed: response.failureCount, orderId })
        };
    } catch (e) {
        console.error('Erreur envoi notification:', e);
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
