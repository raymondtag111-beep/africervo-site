// scripts/prerender-images.js
//
// Exécuté par Netlify AVANT chaque publication (commande de build).
// Va chercher les vraies données produit sur Firestore, et écrit
// directement les bonnes images dans le HTML de chaque page produit
// — pour que la photo soit déjà là au premier affichage, sans jamais
// avoir à attendre une requête Firebase dans le navigateur du client.
//
// Ne touche à rien d'autre (titre, prix, texte) : ces éléments
// s'affichaient déjà instantanément et correctement.

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PRODUCT_PAGES = [
    "anti-tache-et-acne.html", "casque-p9-pro.html", "ceinture-anti-douleurs-menstruelles.html",
    "coupe-legume-multifonction.html", "creme-cindynal-reparation-intense.html", "diffuseur.html",
    "ecouteur-buds3-pro.html", "ecouteur-intelligent-m6.html", "huile-pour-barbe-et-cheveux.html",
    "lime-electrique.html", "mandoline-multifonction.html", "mini-alarme-anti-intrusion.html",
    "mini-fer-a-repasser-portable.html", "mixeur-de-jus-portable.html", "montre-connectee-a58-plus.html",
    "montre-connectee-h92-ultra3.html", "montre-connectee-sk40.html", "moulinex-blender-8-en-1.html",
    "patch-detox-kinoki.html", "seche-chaussures.html"
];

// Les 5 emplacements image gérés par chaque page (voir renderProduct() dans le HTML)
const IMAGE_SLOTS = ["heroMainImage", "block1Img", "block1Img2", "block2Img", "block2Img2"];

function initFirebase() {
    if (admin.apps.length) return;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT est introuvable pendant le build. " +
            "Sur Netlify, va dans Site configuration -> Environment variables -> " +
            "ouvre FIREBASE_SERVICE_ACCOUNT -> coche aussi 'Builds' dans les contextes " +
            "où la variable doit être disponible (elle n'était peut-être activée que pour 'Functions')."
        );
    }
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

function extractProductId(html) {
    const m = html.match(/const PRODUCT_ID\s*=\s*(\d+);/);
    return m ? m[1] : null;
}

// Détermine la vraie image pour chaque emplacement, uniquement si Firestore
// a une valeur exploitable. Si rien de fiable n'est trouvé, on retourne null
// et on NE TOUCHE PAS à la page (le shimmer + JS géreront comme avant).
function computeImageUrls(data) {
    const heroImages = Array.isArray(data.heroImages) ? data.heroImages.filter(Boolean) : [];
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    const hero = heroImages[0] || data.img1 || images[0] || null;
    return {
        heroMainImage: hero,
        block1Img: data.img1 || null,
        block1Img2: data.img1b || null,
        block2Img: data.img2 || null,
        block2Img2: data.img2b || null,
    };
}

function injectImages(html, urls) {
    let out = html;
    let changed = 0;
    for (const slot of IMAGE_SLOTS) {
        const url = urls[slot];
        if (!url) continue; // pas de donnée fiable : on laisse le shimmer/JS gérer
        const safeUrl = url.replace(/"/g, '&quot;');
        // Fonctionne que la balise ait déjà un src (ancien pré-rendu) ou pas
        // du tout (état actuel : class="img-shimmer" sans src).
        const re = new RegExp(`<img id="${slot}"(\\s+class="img-shimmer")?(\\s+src="[^"]*")?`);
        if (re.test(out)) {
            out = out.replace(re, `<img id="${slot}" src="${safeUrl}"`);
            changed++;
        }
    }
    return { out, changed };
}

// Même principe pour la vidéo produit : on écrit la vraie source directement
// dans le <source> à l'intérieur de <video id="productVideo">.
function injectVideo(html, videoUrl) {
    if (!videoUrl) return { out: html, changed: 0 };
    const safeUrl = videoUrl.replace(/"/g, '&quot;');
    const re = /(<video id="productVideo"[^>]*>\s*<source\s+src=")[^"]*(")/;
    if (re.test(html)) {
        return { out: html.replace(re, `$1${safeUrl}$2`), changed: 1 };
    }
    return { out: html, changed: 0 };
}

async function run() {
    console.log("🔧 Pré-rendu des images produit (build Netlify)...");
    initFirebase();
    const db = admin.firestore();
    const siteDir = path.join(__dirname, '..');

    let totalChanged = 0;
    for (const filename of PRODUCT_PAGES) {
        const filePath = path.join(siteDir, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  ${filename} introuvable, ignoré.`);
            continue;
        }
        const html = fs.readFileSync(filePath, 'utf-8');
        const productId = extractProductId(html);
        if (!productId) {
            console.warn(`⚠️  ${filename} : PRODUCT_ID introuvable, ignoré.`);
            continue;
        }

        try {
            const doc = await db.collection('produits').doc(productId).get();
            if (!doc.exists) {
                console.log(`ℹ️  ${filename} (id ${productId}) : pas encore de document Firestore, ignoré.`);
                continue;
            }
            const urls = computeImageUrls(doc.data());
            let { out, changed } = injectImages(html, urls);
            const videoResult = injectVideo(out, doc.data().video || null);
            out = videoResult.out;
            changed += videoResult.changed;
            if (changed > 0) {
                fs.writeFileSync(filePath, out, 'utf-8');
                totalChanged += changed;
                console.log(`✅ ${filename} : ${changed} image(s) mise(s) à jour.`);
            } else {
                console.log(`— ${filename} : rien à changer.`);
            }
        } catch (e) {
            // Une erreur sur UN produit ne doit jamais faire échouer tout le déploiement.
            console.error(`❌ Erreur sur ${filename} (id ${productId}) :`, e.message);
        }
    }

    console.log(`🏁 Terminé — ${totalChanged} image(s) au total pré-rendues dans le HTML.`);
}

run().catch((e) => {
    // On log l'erreur mais on ne fait PAS échouer le build : mieux vaut publier
    // le site avec les images gérées côté navigateur (comme avant) que de ne
    // rien publier du tout si Firebase est temporairement injoignable.
    console.error("❌ Erreur générale du pré-rendu (le site sera quand même publié) :", e.message);
    process.exit(0);
});
