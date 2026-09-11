// Service Worker mínimo para Betania Music.
// Su único propósito es cumplir el requisito de Chrome para que la app sea
// instalable de verdad (icono propio, sin barra de direcciones al abrirla).
// A PROPÓSITO no cachea nada: cada petición va siempre a la red tal cual,
// para evitar el problema de versiones viejas atascadas en caché que tuvimos antes.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
