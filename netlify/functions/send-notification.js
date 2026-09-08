// netlify/functions/send-notification.js
// Envoie une vraie notification push (FCM) vers l'app AfriCervo Admin
// à chaque fois qu'une commande est créée sur une page produit.
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
        const finalIcon = icon || imageUrl || 'https://africervo228.netlify.app/icon-192.png';

        const tokensSnap = await admin.firestore().collection('admin_tokens').get();
        if (tokensSnap.empty) {
            console.log('Aucun token enregistré, notification non envoyée.');
            return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'no-tokens' }) };
        }

        // On sépare les appareils web (navigateur/PWA) des appareils avec l'app
        // Android native : ils ont besoin d'un format de message différent pour
        // fonctionner de façon fiable (voir explications plus bas).
        const webTokens = [];
        const nativeTokens = [];
        tokensSnap.docs.forEach((doc) => {
            const platform = (doc.data() || {}).platform;
            if (platform === 'android-native') {
                nativeTokens.push(doc.id);
            } else {
                webTokens.push(doc.id);
            }
        });

        const title = '🆕 Nouvelle commande AfriCervo !';
        const body = `${produit || 'Produit'} — ${clientName || 'Client'} (${(total || 0).toLocaleString('fr-FR')} FCFA)`;
        const clickUrl = `/admin.html${orderId ? `?order=${orderId}` : ''}`;
        const tag = `commande-${orderId || Date.now()}`;

        const sendPromises = [];
        const allTokensInOrder = []; // pour retrouver l'index lors du nettoyage

        if (webTokens.length > 0) {
            // Web : un vrai bloc "notification" + "webpush.notification" est
            // OBLIGATOIRE ici — un message "data seulement" n'est pas fiable sur
            // toutes les versions de Chrome Android (bug connu du SDK Firebase :
            // onBackgroundMessage pas toujours exécuté). Avec ce bloc, c'est le
            // navigateur lui-même qui affiche la notification, de façon fiable,
            // même app fermée.
            sendPromises.push(
                admin.messaging().sendEachForMulticast({
                    notification: { title, body, image: finalIcon },
                    webpush: {
                        notification: {
                            title, body,
                            icon: finalIcon,
                            image: finalIcon,
                            badge: 'icon-192.png',
                            tag,
                            requireInteraction: true,
                            vibrate: [200, 100, 200]
                        },
                        fcmOptions: { link: clickUrl }
                    },
                    data: { orderId: orderId || '', url: clickUrl },
                    tokens: webTokens
                })
            );
            allTokensInOrder.push(...webTokens);
        }

        if (nativeTokens.length > 0) {
            // App Android native : on envoie ICI un message "data seulement"
            // (AUCUN champ "notification" ni "webpush"). C'est ce qui garantit
            // que MyFirebaseMessagingService.onMessageReceived() s'exécute
            // TOUJOURS — même app totalement fermée — pour jouer le son
            // personnalisé. Si on ajoutait un bloc "notification" ici, Android
            // afficherait sa notification par défaut (son du système) sans
            // jamais exécuter notre code quand l'app est fermée.
            sendPromises.push(
                admin.messaging().sendEachForMulticast({
                    data: {
                        title, body,
                        image: finalIcon,
                        orderId: orderId || '',
                        url: clickUrl,
                        tag
                    },
                    tokens: nativeTokens
                })
            );
            allTokensInOrder.push(...nativeTokens);
        }

        const results = await Promise.all(sendPromises);

        let successCount = 0;
        let failureCount = 0;
        const cleanupPromises = [];
        let offset = 0;
        results.forEach((response) => {
            successCount += response.successCount;
            failureCount += response.failureCount;
            response.responses.forEach((res, idx) => {
                if (!res.success) {
                    const errCode = res.error && res.error.code;
                    if (
                        errCode === 'messaging/invalid-registration-token' ||
                        errCode === 'messaging/registration-token-not-registered'
                    ) {
                        const badToken = allTokensInOrder[offset + idx];
                        cleanupPromises.push(
                            admin.firestore().collection('admin_tokens').doc(badToken).delete().catch(() => {})
                        );
                    }
                }
            });
            offset += response.responses.length;
        });
        await Promise.all(cleanupPromises);

        console.log(`Notifications envoyées : ${successCount} succès, ${failureCount} échecs (${webTokens.length} web, ${nativeTokens.length} natif)`);

        return {
            statusCode: 200,
            body: JSON.stringify({ sent: successCount, failed: failureCount, orderId })
        };
    } catch (e) {
        console.error('Erreur envoi notification:', e);
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
