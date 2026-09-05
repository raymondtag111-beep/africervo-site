// functions/index.js
// Cloud Function AfriCervo : envoie une notification push (avec son)
// à chaque nouvelle commande créée dans Firestore (collection "commandes").
//
// ⚠️ Cette fonction nécessite le plan Firebase "Blaze" (pay-as-you-go).
// Elle reste GRATUITE dans les limites normales d'usage d'une boutique
// (le plan Blaze inclut le même quota gratuit que Spark + facturation
// uniquement au-delà, ce qui est très improbable pour ce volume).
//
// ========== INSTALLATION (à faire une seule fois) ==========
// 1. Installer les outils Firebase (sur ton PC) :
//      npm install -g firebase-tools
// 2. Se connecter :
//      firebase login
// 3. Depuis le dossier qui contient "functions/" :
//      firebase init functions   (choisis le projet africevo-commandes, langage JavaScript)
//      -> remplace le index.js généré par celui-ci
// 4. Installer les dépendances :
//      cd functions && npm install firebase-admin firebase-functions
// 5. Activer le plan Blaze dans la Console Firebase (Paramètres > Modifier le forfait)
// 6. Déployer :
//      firebase deploy --only functions

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyNewOrder = onDocumentCreated("commandes/{orderId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const order = snap.data();

    // Récupère tous les tokens d'appareils enregistrés (collection admin_tokens)
    const tokensSnap = await admin.firestore().collection("admin_tokens").get();
    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) {
        console.log("Aucun token enregistré, notification non envoyée.");
        return;
    }

    const title = "🆕 Nouvelle commande AfriCervo !";
    const body = `${order.produit || "Produit"} — ${order.nom || "Client"} (${order.total || 0} FCFA)`;

    const message = {
        notification: { title, body },
        tokens: tokens,
        webpush: {
            notification: {
                icon: "icons/icon-192.png",
                badge: "icons/icon-192.png",
                vibrate: [200, 100, 200],
                requireInteraction: true,
                tag: "nouvelle-commande"
            },
            fcmOptions: { link: "/admin.html" }
        },
        android: {
            priority: "high",
            notification: {
                sound: "default",
                channelId: "commandes"
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Notifications envoyées : ${response.successCount} succès, ${response.failureCount} échecs`);

        // Nettoyage : supprime les tokens invalides/expirés
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                const errCode = res.error?.code;
                if (errCode === "messaging/invalid-registration-token" ||
                    errCode === "messaging/registration-token-not-registered") {
                    admin.firestore().collection("admin_tokens").doc(tokens[idx]).delete().catch(() => {});
                }
            }
        });
    } catch (e) {
        console.error("Erreur envoi notifications:", e);
    }
});
