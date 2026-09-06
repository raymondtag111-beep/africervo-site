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

function formatFCFA(n) {
    return n.toLocaleString('fr-FR') + ' FCFA';
}

// Titre : reproduit exactement ce que fait renderProduct() côté navigateur
// (nom du produit + petit drapeau togolais).
function injectTitle(html, name) {
    if (!name) return { out: html, changed: 0 };
    const flag = ' <img src="https://flagcdn.com/tg.svg" alt="Togo" style="width:28px; height:auto; vertical-align:middle; margin-left:10px;">';
    const safeName = name.replace(/"/g, '&quot;');
    const re = /(<div class="product-title" id="productTitle">)[\s\S]*?(<\/div>)/;
    if (re.test(html)) {
        return { out: html.replace(re, `$1${safeName}${flag}$2`), changed: 1 };
    }
    return { out: html, changed: 0 };
}

// Prix : reproduit exactement le calcul et le HTML généré par renderProduct()
// (prix x1, prix x2 = x1.7, ancien prix barré si présent).
function injectPrices(html, price, oldPrice) {
    if (price === undefined || price === null) return { out: html, changed: 0 };
    let out = html;
    let changed = 0;

    const price1 = price || 0;
    const oldPrice1 = oldPrice || 0;
    const price2 = Math.round(price1 * 1.7);
    const oldPrice2 = oldPrice1 > 0 ? Math.round(oldPrice1 * 1.7) : 0;

    let price1Html = formatFCFA(price1);
    if (oldPrice1 > 0 && oldPrice1 > price1) {
        price1Html += ` <span class="old-price">${formatFCFA(oldPrice1)}</span>`;
    }
    const re1 = /(<div class="option-price" id="optionPrice1">)[\s\S]*?(<\/div>)/;
    if (re1.test(out)) { out = out.replace(re1, `$1${price1Html}$2`); changed++; }

    let price2Html = formatFCFA(price2);
    if (oldPrice2 > 0 && oldPrice2 > price2) {
        price2Html += ` <span class="old-price">${formatFCFA(oldPrice2)}</span>`;
    }
    price2Html += ' <span class="small-save">(Économie)</span>';
    const re2 = /(<div class="option-price" id="optionPrice2">)[\s\S]*?(<\/div>)/;
    if (re2.test(out)) { out = out.replace(re2, `$1${price2Html}$2`); changed++; }

    return { out, changed };
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Reproduit exactement le HTML que renderProductCard() génère côté navigateur,
// pour que la grille de la page d'accueil soit déjà là au premier affichage.
function buildProductCardHtml(product, productSlugsMap) {
    const slug = productSlugsMap[product.id];
    const link = slug ? `/${slug}` : `produit.html?id=${product.id}`;
    const heroImages = Array.isArray(product.heroImages) ? product.heroImages.filter(Boolean) : [];
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const productImage = images[0] || heroImages[0] || product.img1 || 'images/default.jpg';
    const price = (product.price || 0).toLocaleString('fr-FR');
    const oldPrice = product.oldPrice ? product.oldPrice.toLocaleString('fr-FR') : '';
    const name = escapeHtml(product.name || '');

    return `        <div class="product">
            <a href="${link}">
                <img src="${productImage}" alt="${name}" onerror="this.src='images/default.jpg'" loading="lazy" decoding="async" width="300" height="300" style="aspect-ratio:1/1;background:#eaeaea;">
            </a>
            <h3>${name}</h3>
            <p class="price">${price} FCFA${oldPrice ? ` <span style="text-decoration:line-through;color:#999;font-weight:400;font-size:12px;">${oldPrice} FCFA</span>` : ''}</p>
            <a href="${link}" class="btn">Commander</a>
        </div>`;
}

async function prerenderHomepage(db) {
    const indexPath = path.join(__dirname, '..', 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.warn('⚠️  index.html introuvable, page d\'accueil ignorée.');
        return;
    }
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Table de correspondance id -> slug, extraite du fichier lui-même
    // (le même objet productSlugs que le JS utilise déjà).
    const slugMatch = html.match(/const productSlugs = \{([\s\S]*?)\};/);
    const productSlugsMap = {};
    if (slugMatch) {
        const entries = slugMatch[1].matchAll(/(\d+):\s*"([a-z0-9-]+)"/g);
        for (const [, id, slug] of entries) productSlugsMap[id] = slug;
    }

    try {
        const snapshot = await db.collection('produits').orderBy('id', 'asc').get();
        const products = snapshot.docs.map(d => d.data()).filter(p => !p.hidden);
        if (products.length === 0) {
            console.log('ℹ️  Page d\'accueil : aucun produit trouvé, ignorée.');
            return;
        }
        const first16 = products.slice(0, 16);
        const cardsHtml = first16.map(p => buildProductCardHtml(p, productSlugsMap)).join('\n');

        const start = html.indexOf('<div class="products" id="productsContainer">');
        const marker = '<div class="pagination" id="paginationContainer"></div>';
        const end = html.indexOf(marker);
        if (start === -1 || end === -1) {
            console.warn('⚠️  Bloc productsContainer introuvable dans index.html, ignoré.');
            return;
        }
        const newHtml = html.slice(0, start)
            + `<div class="products" id="productsContainer">\n${cardsHtml}\n    </div>\n    `
            + html.slice(end);
        fs.writeFileSync(indexPath, newHtml, 'utf-8');
        console.log(`✅ index.html : ${first16.length} carte(s) produit gravée(s) sur la page d'accueil.`);
    } catch (e) {
        console.error('❌ Erreur pré-rendu page d\'accueil (page publiée sans changement) :', e.message);
    }
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
            const data = doc.data();
            let { out, changed } = injectImages(html, urls);
            const videoResult = injectVideo(out, data.video || null);
            out = videoResult.out;
            changed += videoResult.changed;
            const titleResult = injectTitle(out, data.name || null);
            out = titleResult.out;
            changed += titleResult.changed;
            const priceResult = injectPrices(out, data.price, data.oldPrice);
            out = priceResult.out;
            changed += priceResult.changed;
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

    console.log("🔧 Pré-rendu de la grille produits (page d'accueil)...");
    await prerenderHomepage(db);
}

run().catch((e) => {
    // On log l'erreur mais on ne fait PAS échouer le build : mieux vaut publier
    // le site avec les images gérées côté navigateur (comme avant) que de ne
    // rien publier du tout si Firebase est temporairement injoignable.
    console.error("❌ Erreur générale du pré-rendu (le site sera quand même publié) :", e.message);
    process.exit(0);
});
