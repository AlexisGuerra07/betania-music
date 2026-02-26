// Nombre de nuestro caché (si actualizas la app en el futuro, cambia este número a v2, v3, etc.)
const CACHE_NAME = 'betania-music-v1';

// Archivos que queremos guardar en el teléfono para que funcionen sin internet
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALACIÓN: Guardamos los archivos en la memoria caché del móvil/portátil
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierto correctamente');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ACTIVACIÓN: Limpiamos cachés viejos si actualizamos la versión (v2, v3...)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. INTERCEPCIÓN (Fetch): Cuando la app pide algo, miramos primero si está en el caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devolvemos al instante (Offline)
        if (response) {
          return response;
        }
        // Si no está, lo buscamos en internet (Online)
        return fetch(event.request);
      })
  );
});
