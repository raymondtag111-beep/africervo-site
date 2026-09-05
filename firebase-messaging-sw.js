// firebase-messaging-sw.js
// Service worker UNIQUE de l'app : gère à la fois
// 1) l'installabilité / le mode hors-ligne basique (comme l'ancien sw.js)
// 2) la réception des notifications même quand l'application est FERMÉE.
// Il doit rester à la racine du site (même dossier que admin.html).

const CACHE_NAME = 'africervo-admin-v1';
const OFFLINE_URLS = ['/admin.html', '/manifest.json'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => {})
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDKzQenl8G2KjWicO5nypyj3rURi7u-qZM",
    authDomain: "africevo-commandes.firebaseapp.com",
    databaseURL: "https://africevo-commandes-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "africevo-commandes",
    storageBucket: "africevo-commandes.firebasestorage.app",
    messagingSenderId: "207539954871",
    appId: "1:207539954871:web:a80316f58bc3a0df6d5932"
});

const messaging = firebase.messaging();

// Notification reçue pendant que l'app est en arrière-plan ou fermée.
// Le message envoyé par send-notification.js est "data seulement" (aucun
// bloc "notification" au niveau racine) : ça garantit que ce code s'exécute
// TOUJOURS, même app totalement fermée, plutôt que Chrome n'affiche sa
// notification par défaut avec son icône.
messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title = data.title || '🆕 Nouvelle commande AfriCervo !';
    const orderId = data.orderId || '';
    const options = {
        body: data.body || 'Une nouvelle commande vient d\'arriver.',
        icon: data.icon || 'icon-192.png',   // image du produit concerné
        badge: 'icon-192.png',               // petite pastille monochrome (Android) : reste le logo AfriCervo
        vibrate: [200, 100, 200],
        requireInteraction: true,
        // tag unique par commande (ex: "commande-abc123") => chaque nouvelle
        // commande crée SA PROPRE notification, empilée avec les autres,
        // jamais remplacée/combinée.
        tag: data.tag || `commande-${orderId || Date.now()}`,
        data: {
            orderId,
            url: data.url || '/admin.html' + (orderId ? `?order=${orderId}` : '')
        }
    };
    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/admin.html';
    const orderId = event.notification.data && event.notification.data.orderId;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
            const existing = clientsArr.find((c) => c.url.includes('admin.html'));
            if (existing) {
                // Admin déjà ouvert : on lui envoie directement l'ID de la commande
                // à afficher, plutôt que de recharger toute la page.
                existing.postMessage({ type: 'OPEN_ORDER', orderId });
                return existing.focus();
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});