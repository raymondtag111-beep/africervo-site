// =============================================
// product-sync.js - Fichier partagé
// =============================================

// ========== IMPORT DES DONNÉES DE produits-data.js ==========
// ⚠️ ATTENTION : ce fichier doit être chargé APRÈS produits-data.js
// Dans admin.html, l'ordre doit être :
// 1. produits-data.js
// 2. product-sync.js

const ALL_PRODUCTS_DATA = typeof ALL_PRODUCTS !== 'undefined' ? ALL_PRODUCTS : {};

// ========== CONFIGURATION FIREBASE ==========
const firebaseConfig = {
    apiKey: "AIzaSyDKzQenl8G2KjWicO5nypyj3rURi7u-qZM",
    authDomain: "africevo-commandes.firebaseapp.com",
    databaseURL: "https://africevo-commandes-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "africevo-commandes",
    storageBucket: "africevo-commandes.firebasestorage.app",
    messagingSenderId: "207539954871",
    appId: "1:207539954871:web:a80316f58bc3a0df6d5932"
};

// Initialiser Firebase UNE SEULE FOIS
if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialisé depuis product-sync.js');
        }
    } catch(e) {
        console.warn('⚠️ Firebase déjà initialisé ou erreur:', e);
    }
}

const db = firebase.firestore();
const rtdb = firebase.database();

// ========== VARIABLES GLOBALES ==========
let allProducts = [];
let allProductsLoaded = false;
const PRODUCTS_PER_PAGE = 16;
let listeners = [];

// ========== FONCTIONS CACHE ==========
function loadProductsFromCache() {
    const cached = localStorage.getItem('ecom_products');
    if (cached) {
        try {
            allProducts = JSON.parse(cached);
            allProductsLoaded = true;
            console.log('📦 Produits chargés depuis le cache:', allProducts.length);
            return true;
        } catch(e) {
            console.warn('Cache corrompu');
            localStorage.removeItem('ecom_products');
        }
    }
    return false;
}

function saveProductsToCache(products) {
    try {
        localStorage.setItem('ecom_products', JSON.stringify(products));
        console.log('💾 Produits sauvegardés dans le cache');
    } catch(e) {
        console.warn('Impossible de sauvegarder dans le cache');
    }
}

// ========== CHARGEMENT FIREBASE ==========
async function loadProductsFromFirebase(forceRefresh = false) {
    try {
        const snapshot = await db.collection('produits').orderBy('id', 'asc').get();
        if (!snapshot.empty) {
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({ 
                    id: parseInt(doc.id) || doc.id,
                    name: data.name || '',
                    price: data.price || 0,
                    oldPrice: data.oldPrice || 0,
                    stock: data.stock || 0,
                    category: data.category || '',
                    images: data.images || [],
                    img1: data.img1 || '',
                    img1b: data.img1b || '',
                    img2: data.img2 || '',
                    img2b: data.img2b || '',
                    img3: data.img3 || '',
                    img3b: data.img3b || '',
                    img4: data.img4 || '',
                    img5: data.img5 || '',
                    img6: data.img6 || '',
                    imgCentered: data.imgCentered || '',
                    title1: data.title1 || '',
                    desc1: data.desc1 || '',
                    list1: data.list1 || '',
                    title2: data.title2 || '',
                    desc2: data.desc2 || '',
                    list2: data.list2 || '',
                    title3: data.title3 || '',
                    desc3: data.desc3 || '',
                    list3: data.list3 || '',
                    video: data.video || '',
                    description: data.description || '',
                    titleCarousel: data.titleCarousel || '',
                    descCarousel: data.descCarousel || '',
                    listCarousel: data.listCarousel || '',
                    carouselImages: data.carouselImages || [],
                    alertMessage: data.alertMessage || '',
                    reviews: data.reviews || [],
                    faq: data.faq || [],
                    hidden: data.hidden || false,
                    urgence: data.urgence || ''
                });
            });
            
            products.sort((a, b) => a.id - b.id);
            allProducts = products;
            allProductsLoaded = true;
            saveProductsToCache(allProducts);
            console.log('✅ Produits synchronisés depuis Firebase:', allProducts.length);
            return true;
        } else {
            console.log('📭 Firestore vide, import des produits depuis produits-data.js...');
            await importDefaultProducts();
            return true;
        }
    } catch(e) {
        console.warn('⚠️ Erreur de chargement Firebase:', e);
        if (!loadProductsFromCache()) {
            // ✅ Utiliser ALL_PRODUCTS_DATA comme fallback
            allProducts = Object.values(ALL_PRODUCTS_DATA);
            allProductsLoaded = true;
            saveProductsToCache(allProducts);
            console.log('📦 Produits depuis produits-data.js:', allProducts.length);
        }
        return false;
    }
}

// ========== IMPORT DES PRODUITS DEPUIS produits-data.js ==========
async function importDefaultProducts() {
    try {
        const productsData = Object.values(ALL_PRODUCTS_DATA);
        if (productsData.length === 0) {
            console.warn('⚠️ Aucune donnée dans produits-data.js');
            return false;
        }
        
        const batch = db.batch();
        productsData.forEach(p => {
            const ref = db.collection("produits").doc(String(p.id));
            batch.set(ref, p);
        });
        await batch.commit();
        
        allProducts = productsData;
        allProductsLoaded = true;
        saveProductsToCache(allProducts);
        console.log(`✅ ${productsData.length} produits importés depuis produits-data.js`);
        return true;
    } catch(e) {
        console.error('❌ Erreur d\'importation:', e);
        return false;
    }
}

// ========== CRUD ADMIN - AJOUTER ==========
async function addProduct(productData) {
    try {
        const maxId = allProducts.reduce((max, p) => Math.max(max, p.id), 0);
        const newId = maxId + 1;
        const newProduct = { 
            id: newId, 
            hidden: false,
            name: productData.name || '',
            price: productData.price || 0,
            oldPrice: productData.oldPrice || 0,
            stock: productData.stock || 0,
            category: productData.category || '',
            images: productData.images || [],
            img1: productData.img1 || '',
            img1b: productData.img1b || '',
            img2: productData.img2 || '',
            img2b: productData.img2b || '',
            img3: productData.img3 || '',
            img3b: productData.img3b || '',
            img4: productData.img4 || '',
            img5: productData.img5 || '',
            img6: productData.img6 || '',
            imgCentered: productData.imgCentered || '',
            title1: productData.title1 || '',
            desc1: productData.desc1 || '',
            list1: productData.list1 || '',
            title2: productData.title2 || '',
            desc2: productData.desc2 || '',
            list2: productData.list2 || '',
            title3: productData.title3 || '',
            desc3: productData.desc3 || '',
            list3: productData.list3 || '',
            video: productData.video || '',
            description: productData.description || '',
            titleCarousel: productData.titleCarousel || '',
            descCarousel: productData.descCarousel || '',
            listCarousel: productData.listCarousel || '',
            carouselImages: productData.carouselImages || [],
            alertMessage: productData.alertMessage || '',
            reviews: productData.reviews || [],
            faq: productData.faq || [],
            urgence: productData.urgence || ''
        };
        
        const ref = db.collection("produits").doc(String(newId));
        await ref.set(newProduct);
        
        allProducts.push(newProduct);
        allProducts.sort((a, b) => a.id - b.id);
        saveProductsToCache(allProducts);
        
        console.log(`✅ Produit ${newProduct.name} ajouté (ID: ${newId})`);
        return newProduct;
    } catch(e) {
        console.error('❌ Erreur d\'ajout:', e);
        throw e;
    }
}

// ========== CRUD ADMIN - MODIFIER ==========
async function updateProduct(id, productData) {
    try {
        const ref = db.collection("produits").doc(String(id));
        await ref.update(productData);
        
        const index = allProducts.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            allProducts[index] = { ...allProducts[index], ...productData };
            saveProductsToCache(allProducts);
        }
        
        console.log(`✅ Produit ID ${id} mis à jour`);
        return true;
    } catch(e) {
        console.error('❌ Erreur de mise à jour:', e);
        throw e;
    }
}

// ========== CRUD ADMIN - SUPPRIMER ==========
async function deleteProduct(id) {
    try {
        const ref = db.collection("produits").doc(String(id));
        await ref.delete();
        
        allProducts = allProducts.filter(p => p.id !== parseInt(id));
        saveProductsToCache(allProducts);
        
        console.log(`✅ Produit ID ${id} supprimé`);
        return true;
    } catch(e) {
        console.error('❌ Erreur de suppression:', e);
        throw e;
    }
}

// ========== CRUD ADMIN - CACHER/AFFICHER ==========
async function toggleProductVisibility(id) {
    try {
        const product = allProducts.find(p => p.id === parseInt(id));
        if (!product) throw new Error('Produit non trouvé');
        
        const newHidden = !product.hidden;
        const ref = db.collection("produits").doc(String(id));
        await ref.update({ hidden: newHidden });
        
        const index = allProducts.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            allProducts[index].hidden = newHidden;
            saveProductsToCache(allProducts);
        }
        
        console.log(`✅ Produit ID ${id} ${newHidden ? 'caché' : 'affiché'}`);
        return newHidden;
    } catch(e) {
        console.error('❌ Erreur de modification de visibilité:', e);
        throw e;
    }
}

// ========== ÉCOUTE EN TEMPS RÉEL ==========
function listenToProductsChanges(callback) {
    try {
        const unsubscribe = db.collection('produits').orderBy('id', 'asc').onSnapshot((snapshot) => {
            if (snapshot.empty) return;
            
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({ 
                    id: parseInt(doc.id) || doc.id,
                    name: data.name || '',
                    price: data.price || 0,
                    oldPrice: data.oldPrice || 0,
                    stock: data.stock || 0,
                    category: data.category || '',
                    images: data.images || [],
                    img1: data.img1 || '',
                    img1b: data.img1b || '',
                    img2: data.img2 || '',
                    img2b: data.img2b || '',
                    img3: data.img3 || '',
                    img3b: data.img3b || '',
                    img4: data.img4 || '',
                    img5: data.img5 || '',
                    img6: data.img6 || '',
                    imgCentered: data.imgCentered || '',
                    title1: data.title1 || '',
                    desc1: data.desc1 || '',
                    list1: data.list1 || '',
                    title2: data.title2 || '',
                    desc2: data.desc2 || '',
                    list2: data.list2 || '',
                    title3: data.title3 || '',
                    desc3: data.desc3 || '',
                    list3: data.list3 || '',
                    video: data.video || '',
                    description: data.description || '',
                    titleCarousel: data.titleCarousel || '',
                    descCarousel: data.descCarousel || '',
                    listCarousel: data.listCarousel || '',
                    carouselImages: data.carouselImages || [],
                    alertMessage: data.alertMessage || '',
                    reviews: data.reviews || [],
                    faq: data.faq || [],
                    hidden: data.hidden || false,
                    urgence: data.urgence || ''
                });
            });
            products.sort((a, b) => a.id - b.id);
            
            const currentIds = allProducts.map(p => p.id).sort();
            const newIds = products.map(p => p.id).sort();
            
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds) ||
                JSON.stringify(allProducts) !== JSON.stringify(products)) {
                allProducts = products;
                allProductsLoaded = true;
                saveProductsToCache(allProducts);
                if (callback) callback(allProducts);
                console.log('🔄 Mise à jour en temps réel:', products.length, 'produits');
            }
        }, (error) => {
            console.warn('⚠️ Erreur d\'écoute Firebase:', error);
        });
        
        listeners.push(unsubscribe);
        return unsubscribe;
    } catch(e) {
        console.warn('⚠️ Impossible de configurer l\'écoute:', e);
        return null;
    }
}

// ========== FONCTIONS UTILITAIRES ==========
function getVisibleProducts() {
    return allProducts.filter(p => !p.hidden);
}

function getHiddenProducts() {
    return allProducts.filter(p => p.hidden);
}

function getProductById(id) {
    return allProducts.find(p => p.id === parseInt(id));
}

function getProductLink(productId, productName) {
    if (!productName) {
        const p = allProducts.find(x => x.id === productId);
        if (p) productName = p.name;
    }
    if (productName) {
        const slug = createSlug(productName);
        return `${slug}.html`;
    }
    // Pages dynamiques supprimées : chaque nouveau produit doit avoir sa propre page HTML statique.
    return '#page-a-creer';
}

function createSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[éèêë]/g, 'e')
        .replace(/[àâä]/g, 'a')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getAllProducts() {
    return allProducts;
}

function isProductsLoaded() {
    return allProductsLoaded;
}

// ========== EXPOSER LES FONCTIONS ==========
window.productSync = {
    // Variables
    db,
    rtdb,
    getAllProducts,
    getVisibleProducts,
    getHiddenProducts,
    getProductById,
    getProductLink,
    createSlug,
    isProductsLoaded,
    PRODUCTS_PER_PAGE,
    
    // Cache
    loadProductsFromCache,
    saveProductsToCache,
    
    // Firebase
    loadProductsFromFirebase,
    importDefaultProducts,
    listenToProductsChanges,
    
    // CRUD Admin
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    
    // Alias pour compatibilité
    loadProducts: loadProductsFromFirebase,
    listenProducts: listenToProductsChanges
};

console.log('🚀 product-sync.js chargé avec succès');
console.log(`📦 ${allProducts.length} produits disponibles`);