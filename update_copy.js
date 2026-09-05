// update_copy.js
// Met à jour UNIQUEMENT les champs texte (title1-3, desc1-3, list1-3, titleCarousel, descCarousel, listCarousel)
// sur les 16 produits dans Firestore. Ne touche à RIEN d'autre (prix, images, avis, faq, stock...).
//
// Utilise le même dossier que import.js (produit.json, serviceAccountKey.json déjà en place).
// Placez ce fichier + copie_produits.json dans ce même dossier, puis lancez : node update_copy.js

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const copie = require("./copie_produits.json");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function mettreAJourCopie() {
  const ids = Object.keys(copie);
  const batch = db.batch();

  ids.forEach((id) => {
    const ref = db.collection("produits").doc(id);
    batch.update(ref, copie[id]); // .update() = ne touche QUE ces champs, laisse le reste intact
  });

  await batch.commit();
  console.log(`✅ ${ids.length} produits mis à jour avec la nouvelle copie (titres, descriptions, listes, carrousel).`);
  console.log("Aucun autre champ (prix, images, avis, faq, stock) n'a été modifié.");
}

mettreAJourCopie().catch((err) => {
  console.error("❌ Erreur lors de la mise à jour :", err);
  process.exit(1);
});
