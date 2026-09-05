// sync_nouveaux_produits.js
// Crée/normalise dans Firestore les 5 produits liés aux nouvelles pages HTML :
//   14 -> Mini Fer à Repasser Portable   (remplace "Torche Ultra Puissante", même ID conservé)
//   17 -> Écouteurs Buds3 Pro
//   18 -> Mini Alarme Anti-Intrusion
//   19 -> Sèche-Chaussures Électrique
//   20 -> Casque P9 Pro
//
// Utilise .set(..., {merge:true}) : crée le document s'il n'existe pas (17-20),
// ou met à jour tous ces champs sans toucher au reste s'il existe déjà (14).
//
// Placez ce fichier + nouveaux_produits.json dans le même dossier que
// serviceAccountKey.json (celui déjà utilisé par import.js / update_copy.js), puis lancez :
//   node sync_nouveaux_produits.js

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const produits = require("./nouveaux_produits.json");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function synchroniser() {
  const ids = Object.keys(produits);
  const batch = db.batch();

  ids.forEach((id) => {
    const ref = db.collection("produits").doc(id);
    batch.set(ref, produits[id], { merge: true });
  });

  await batch.commit();
  console.log(`✅ ${ids.length} produits synchronisés dans Firestore : ID ${ids.join(", ")}`);
  console.log("   14 = Mini Fer à Repasser Portable (remplace la Torche)");
  console.log("   17 = Écouteurs Buds3 Pro");
  console.log("   18 = Mini Alarme Anti-Intrusion");
  console.log("   19 = Sèche-Chaussures Électrique");
  console.log("   20 = Casque P9 Pro");
  console.log("Rafraîchissez l'admin et l'accueil du site pour les voir apparaître.");
}

synchroniser().catch((err) => {
  console.error("❌ Erreur lors de la synchronisation :", err);
  process.exit(1);
});
