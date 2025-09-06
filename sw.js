/**
 * ==========================================
 * 🎵 BETANIA MUSIC - SERVICE WORKER
 * ==========================================
 */

const CACHE_NAME = 'betania-music-v1.0';
const CACHE_VERSION = 1;

// Archivos a cachear para funcionamiento offline
const urlsToCache = [
  '/betania-music/',
  '/betania-music/index.html',
  '/betania-music/styles.css',
  '/betania-music/script.js',
  '/betania-music/manifest.json',
  
  // Iconos PWA
  '/betania-music/assets/icon-16x16.png',
  '/betania-music/assets/icon-32x32.png',
  '/betania-music/assets/icon-72x72.png',
  '/betania-music/assets/icon-96x96.png',
  '/betania-music/assets/icon-128x128.png',
  '/betania-music/assets/icon-144x144.png',
  '/betania-music/assets/icon-152x152.png',
  '/betania-music/assets/icon-192x192.png',
  '/betania-music/assets/icon-384x384.png',
  '/betania-music/assets/icon-512x512.png',
  
  // CDNs comunes (opcional)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// ==========================================
// INSTALACIÓN DEL SERVICE WORKER
// ==========================================

self.addEventListener('install', event => {
  console.log('🎵 Betania Music SW: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📂 Abriendo cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos los archivos cacheados correctamente');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error durante la instalación:', error);
        // Intentar cachear archivos individualmente
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            urlsToCache.map(url => 
              cache.add(url).catch(err => 
                console.warn(`⚠️  No se pudo cachear: ${url}`, err)
              )
            )
          );
        });
      })
  );
});

// ==========================================
// ACTIVACIÓN DEL SERVICE WORKER
// ==========================================

self.addEventListener('activate', event => {
  console.log('🔄 Betania Music SW: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eliminar caches antiguos
            if (cacheName !== CACHE_NAME && cacheName.startsWith('betania-music-')) {
              console.log('🗑️ Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado correctamente');
        // Tomar control de todas las pestañas inmediatamente
        return self.clients.claim();
      })
      .catch(error => {
        console.error('❌ Error durante la activación:', error);
      })
  );
});

// ==========================================
// INTERCEPTACIÓN DE PETICIONES
// ==========================================

self.addEventListener('fetch', event => {
  // Solo interceptar peticiones del mismo origen o recursos específicos
  if (event.request.url.includes('/betania-music/') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Si está en cache, devolverlo
          if (cachedResponse) {
            console.log('📦 Desde cache:', event.request.url);
            return cachedResponse;
          }
          
          // Si no está en cache, intentar descargar
          console.log('🌐 Descargando:', event.request.url);
          return fetch(event.request)
            .then(response => {
              // Verificar que la respuesta sea válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clonar la respuesta (solo se puede leer una vez)
              const responseToCache = response.clone();
              
              // Guardar en cache para futuras peticiones
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.warn('⚠️ No se pudo cachear:', event.request.url, error);
                });
              
              return response;
            })
            .catch(error => {
              console.warn('⚠️ Error descargando:', event.request.url, error);
              
              // Si es una petición de navegación y estamos offline, mostrar página principal
              if (event.request.destination === 'document') {
                return caches.match('/betania-music/index.html');
              }
              
              // Para otros recursos, intentar devolver desde cache sin importar la URL exacta
              return caches.match('/betania-music/')
                .then(fallback => fallback || new Response('Recurso no disponible offline', {
                  status: 503,
                  statusText: 'Service Unavailable'
                }));
            });
        })
    );
  }
});

// ==========================================
// MENSAJES DESDE LA APLICACIÓN
// ==========================================

self.addEventListener('message', event => {
  console.log('📨 Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Forzando actualización del SW...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    // Enviar estado del cache
    caches.open(CACHE_NAME)
      .then(cache => cache.keys())
      .then(keys => {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          cachedUrls: keys.length,
          cacheSize: keys.map(req => req.url)
        });
      });
  }
});

// ==========================================
// NOTIFICACIONES PUSH (preparado para futuro)
// ==========================================

self.addEventListener('push', event => {
  console.log('📬 Push recibido:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva actualización disponible',
      icon: '/betania-music/assets/icon-192x192.png',
      badge: '/betania-music/assets/icon-72x72.png',
      tag: 'betania-music-notification',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 'default'
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir Betania Music',
          icon: '/betania-music/assets/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/betania-music/assets/icon-192x192.png'
        }
      ],
      requireInteraction: false,
      silent: false
    };
    
    event.waitUntil(
      self.registration.showNotification('Betania Music', options)
    );
  }
});

// ==========================================
// CLICKS EN NOTIFICACIONES
// ==========================================

self.addEventListener('notificationclick', event => {
  console.log('🔔 Click en notificación:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/betania-music/')
    );
  } else if (event.action === 'close') {
    // No hacer nada, solo cerrar
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(clientList => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes('/betania-music/') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/betania-music/');
        }
      })
    );
  }
});

// ==========================================
// SINCRONIZACIÓN EN BACKGROUND
// ==========================================

self.addEventListener('sync', event => {
  console.log('🔄 Sync evento:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Función de sincronización en background
 * Útil para sincronizar datos cuando se recupere la conexión
 */
function doBackgroundSync() {
  console.log('🔄 Ejecutando sincronización en background...');
  
  return new Promise((resolve) => {
    // Aquí puedes añadir lógica para:
    // - Sincronizar canciones pendientes
    // - Subir cambios offline
    // - Actualizar base de datos
    
    // Por ahora, solo resolvemos la promesa
    setTimeout(() => {
      console.log('✅ Sincronización completada');
      resolve();
    }, 1000);
  });
}

// ==========================================
// MANEJO DE ERRORES
// ==========================================

self.addEventListener('error', event => {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Promesa rechazada en Service Worker:', event.reason);
  event.preventDefault();
});

// ==========================================
// LOG DE INICIO
// ==========================================

console.log('🎵 Betania Music Service Worker cargado correctamente');
console.log('📦 Cache:', CACHE_NAME);
console.log('🔢 Versión:', CACHE_VERSION);
console.log('📄 Archivos a cachear:', urlsToCache.length);
