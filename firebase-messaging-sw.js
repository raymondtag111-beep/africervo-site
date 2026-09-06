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
// Le message envoyé par send-notification.js contient désormais un vrai bloc
// "notification"/"webpush.notification" : le navigateur affiche donc la
// notification tout seul, de façon fiable sur tous les appareils (Android
// inclus), sans dépendre de ce code. On ne fait plus d'appel manuel à
// showNotification() ici : ça créerait un DOUBLON (bug connu et documenté
// du SDK Firebase quand notification + showNotification manuel coexistent).
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan (affiché automatiquement) :', payload);
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
