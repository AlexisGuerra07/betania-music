// ============ SERVICE WORKER DE REPERTIA ============
// Estrategia: RED PRIMERO, caché solo si la red falla o tarda demasiado.
//
// Por qué así y no al revés: el problema que tuvimos antes era justo el
// contrario — versiones viejas atascadas en caché. Pidiendo siempre a la red
// primero, cuando hay conexión SIEMPRE ves la última versión que subiste. La
// copia guardada solo entra en juego cuando no hay red (o va tan mal que no
// responde en 3 segundos), para que la app al menos abra sobre el escenario.
//
// Si alguna vez subes una versión rota y se queda guardada, sube el número de
// VERSION de aquí abajo: al activarse borra todas las copias anteriores.
const VERSION = 'repertia-v1';
const TIEMPO_MAXIMO_MS = 3000;

// Lo mínimo para que la app arranque sin red.
const ARCHIVOS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './logo.webp',
    './logo-splash.webp',
    './logo-splash-dark.webp',
    './apple-touch-icon.png',
    './favicon.ico',
    './logo-192.png',
    './logo-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION)
            // addAll falla entero si un archivo no está; así no rompe la instalación.
            .then(cache => Promise.allSettled(ARCHIVOS.map(a => cache.add(a))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(claves => Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
            .then(() => self.clients.claim())
    );
});

function redPrimero(request) {
    return new Promise((resolve) => {
        let resuelto = false;
        const entregar = (respuesta) => {
            if (!resuelto && respuesta) { resuelto = true; resolve(respuesta); }
        };

        // Si la red tarda demasiado (conexión pésima, que es peor que no tener),
        // servimos la copia guardada sin esperar más.
        const reloj = setTimeout(() => {
            caches.match(request).then(entregar);
        }, TIEMPO_MAXIMO_MS);

        fetch(request).then((respuesta) => {
            clearTimeout(reloj);
            // Guardamos la copia aunque ya hayamos servido la de caché por lentitud.
            if (respuesta && respuesta.ok) {
                const copia = respuesta.clone();
                caches.open(VERSION).then(c => c.put(request, copia)).catch(() => {});
            }
            entregar(respuesta);
        }).catch(() => {
            clearTimeout(reloj);
            caches.match(request).then((guardada) => {
                if (guardada) { entregar(guardada); return; }
                // Al abrir la app sin red y sin copia exacta, al menos la página.
                if (request.mode === 'navigate') {
                    caches.match('./index.html').then((inicio) => {
                        entregar(inicio || new Response('Sin conexión', {
                            status: 503,
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        }));
                    });
                    return;
                }
                entregar(new Response('Sin conexión', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                }));
            });
        });
    });
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    // Solo tocamos lo que es de la propia app. Firebase, YouTube, las tipografías
    // y las librerías externas se dejan pasar tal cual: interceptar la conexión
    // en tiempo real de Firestore la rompería.
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(redPrimero(request));
});
