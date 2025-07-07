// 📱 SERVICE WORKER PARA PWA - BETANIA MUSIC V4
// Sistema offline completo con cache inteligente

const CACHE_NAME = 'betania-music-v4.1';
const STATIC_CACHE = 'betania-static-v4.1';
const DYNAMIC_CACHE = 'betania-dynamic-v4.1';

// 📦 RECURSOS PARA CACHEAR
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    // Fallbacks para offline
    './offline.html'
];

// 🎵 DATOS MUSICALES ESENCIALES PARA OFFLINE
const ESSENTIAL_DATA = [
    // URIs de datos SVG para iconos
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAi',
    // Fuentes del sistema
    'font-family: Segoe UI',
    'font-family: Courier New'
];

// 🚀 INSTALACIÓN DEL SERVICE WORKER
self.addEventListener('install', (event) => {
    console.log('🔧 SW Betania V4: Instalando...');
    
    event.waitUntil(
        Promise.all([
            // Cache estático
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('📦 Cacheando recursos estáticos...');
                return cache.addAll(ASSETS_TO_CACHE);
            }),
            // Cache dinámico inicial
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('🎵 Preparando cache dinámico...');
                return cache.put('./api/songs', new Response(JSON.stringify([]), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            })
        ]).then(() => {
            console.log('✅ SW Betania V4: Instalación completada');
            self.skipWaiting();
        }).catch((error) => {
            console.error('❌ Error en instalación SW:', error);
        })
    );
});

// 🔄 ACTIVACIÓN DEL SERVICE WORKER
self.addEventListener('activate', (event) => {
    console.log('🔧 SW Betania V4: Activando...');
    
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Tomar control inmediato
            self.clients.claim()
        ]).then(() => {
            console.log('✅ SW Betania V4: Activado y listo');
            
            // Notificar a clientes sobre actualización
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        message: '🎵 Betania V4 actualizado y listo para usar offline'
                    });
                });
            });
        })
    );
});

// 🌐 ESTRATEGIA DE CACHE PARA REQUESTS
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo manejar requests GET
    if (request.method !== 'GET') return;
    
    // Ignorar requests de extensiones del navegador
    if (request.url.startsWith('chrome-extension://') ||
        request.url.startsWith('moz-extension://') ||
        request.url.startsWith('safari-extension://')) {
        return;
    }
    
    // Ignorar requests a URLs externas (excepto CDNs de fuentes)
    if (!request.url.startsWith(self.location.origin) && 
        !request.url.includes('fonts.googleapis.com') &&
        !request.url.includes('fonts.gstatic.com')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// 🎯 MANEJADOR PRINCIPAL DE REQUESTS
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // 1. RECURSOS ESTÁTICOS (HTML, CSS, JS)
        if (isStaticResource(url.pathname)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // 2. DATOS DINÁMICOS (canciones, setlists)
        if (isDynamicData(url.pathname)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }
        
        // 3. FUENTES Y RECURSOS EXTERNOS
        if (isExternalResource(request.url)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // 4. NAVEGACIÓN (páginas)
        if (request.mode === 'navigate') {
            return await handleNavigation(request);
        }
        
        // 5. FALLBACK GENERAL
        return await networkFirst(request, DYNAMIC_CACHE);
        
    } catch (error) {
        console.error('❌ Error en handleRequest:', error);
        return await getOfflineFallback(request);
    }
}

// 📦 ESTRATEGIA CACHE FIRST (para recursos estáticos)
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Actualizar en background si es necesario
            updateCacheInBackground(request, cache);
            return cachedResponse;
        }
        
        // Si no está en cache, buscar en red
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        console.log('⚠️ Cache first fallback para:', request.url);
        return await getOfflineFallback(request);
    }
}

// 🌐 ESTRATEGIA NETWORK FIRST (para datos dinámicos)
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        console.log('📱 Network first fallback para:', request.url);
        
        // Fallback a cache
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return await getOfflineFallback(request);
    }
}

// 🏠 MANEJAR NAVEGACIÓN (páginas principales)
async function handleNavigation(request) {
    try {
        // Intentar red primero
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
            return response;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        // Fallback a página principal cacheada
        const cache = await caches.open(STATIC_CACHE);
        const cachedIndex = await cache.match('./index.html');
        
        if (cachedIndex) {
            return cachedIndex;
        }
        
        return await getOfflineFallback(request);
    }
}

// 🔄 ACTUALIZAR CACHE EN BACKGROUND
async function updateCacheInBackground(request, cache) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            await cache.put(request, response.clone());
        }
    } catch (error) {
        // Silently fail para updates en background
    }
}

// 📱 FALLBACK OFFLINE
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Para navegación, devolver página offline
    if (request.mode === 'navigate') {
        return new Response(getOfflineHTML(), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    // Para APIs, devolver datos offline básicos
    if (url.pathname.includes('/api/')) {
        return new Response(JSON.stringify({
            offline: true,
            message: 'Datos no disponibles sin conexión',
            cached_songs: []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Para recursos, error 503
    return new Response('Recurso no disponible offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// 🎨 HTML PARA PÁGINA OFFLINE
function getOfflineHTML() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sin conexión - Betania Music V4</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #02312b 0%, #025a45 50%, #079b82 100%);
            color: white; 
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
        }
        .offline-container {
            max-width: 600px;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .offline-icon { 
            font-size: 80px; 
            margin-bottom: 30px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #079b82;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            line-height: 1.6;
            opacity: 0.9;
        }
        .retry-btn { 
            background: #079b82; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 25px; 
            font-size: 16px; 
            cursor: pointer; 
            transition: all 0.3s ease;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .retry-btn:hover {
            background: #02866e;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(7, 155, 130, 0.4);
        }
        .features {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        .features h3 {
            color: #079b82;
            margin-bottom: 15px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 20px;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9em;
        }
        .cached-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(40, 167, 69, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(40, 167, 69, 0.3);
        }
        .cached-info h4 {
            color: #28a745;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">🎵</div>
        <h1>Sin conexión a internet</h1>
        <p>No hay conexión disponible en este momento, pero Betania Music V4 está optimizado para funcionar offline.</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
            🔄 Intentar conectar
        </button>
        
        <div class="cached-info">
            <h4>📱 Funciones Disponibles Offline:</h4>
            <p>✅ Canciones cacheadas • ✅ Editor de acordes • ✅ Transposición • ✅ Diagramas de guitarra</p>
        </div>
        
        <div class="features">
            <h3>🎸 Betania Music V4 - Sistema Completo</h3>
            <div class="features-grid">
                <div class="feature">🎼 Editor avanzado de acordes</div>
                <div class="feature">🎵 Transposición en 12 tonalidades</div>
                <div class="feature">🎸 Diagramas interactivos</div>
                <div class="feature">📱 Funciona completamente offline</div>
                <div class="feature">📋 Sistema de setlist</div>
                <div class="feature">🎤 Modo performance</div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-retry cada 30 segundos
        setTimeout(() => {
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 30000);
        
        // Detectar cuando vuelve la conexión
        window.addEventListener('online', () => {
            window.location.reload();
        });
        
        console.log('📱 Betania V4 - Modo Offline Activo');
    </script>
</body>
</html>`;
}

// 🔍 FUNCIONES DE DETECCIÓN DE TIPO DE RECURSO

function isStaticResource(pathname) {
    return pathname.endsWith('.html') ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.json') ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.svg') ||
           pathname === '/' ||
           pathname === './';
}

function isDynamicData(pathname) {
    return pathname.includes('/api/') ||
           pathname.includes('/songs') ||
           pathname.includes('/setlist') ||
           pathname.includes('/data/');
}

function isExternalResource(url) {
    return url.includes('fonts.googleapis.com') ||
           url.includes('fonts.gstatic.com') ||
           url.includes('cdnjs.cloudflare.com');
}

// 💬 MANEJAR MENSAJES DEL CLIENTE
self.addEventListener('message', (event) => {
    const { type, data } = event.data || {};
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_SONG':
            if (data && data.song) {
                cacheSongData(data.song);
            }
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0]?.postMessage(status);
            });
            break;
    }
});

// 🎵 CACHEAR DATOS DE CANCIÓN ESPECÍFICA
async function cacheSongData(songData) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const songKey = `song_${songData.title.replace(/\s+/g, '_').toLowerCase()}`;
        
        await cache.put(
            `./api/songs/${songKey}`,
            new Response(JSON.stringify(songData), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
        
        console.log('🎵 Canción cacheada:', songData.title);
    } catch (error) {
        console.error('❌ Error cacheando canción:', error);
    }
}

// 🗑️ LIMPIAR TODOS LOS CACHES
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Todos los caches limpiados');
    } catch (error) {
        console.error('❌ Error limpiando caches:', error);
    }
}

// 📊 OBTENER ESTADO DEL CACHE
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status[cacheName] = {
                count: keys.length,
                size: await getCacheSize(cache, keys)
            };
        }
        
        return {
            caches: status,
            version: CACHE_NAME,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('❌ Error obteniendo estado de cache:', error);
        return { error: error.message };
    }
}

// 📏 CALCULAR TAMAÑO DEL CACHE
async function getCacheSize(cache, keys) {
    let totalSize = 0;
    
    for (const key of keys.slice(0, 10)) { // Limitar para performance
        try {
            const response = await cache.match(key);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        } catch (error) {
            // Ignorar errores individuales
        }
    }
    
    return totalSize;
}

// ⚠️ MANEJO DE ERRORES GLOBALES
self.addEventListener('error', (event) => {
    console.error('❌ SW Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ SW Unhandled Rejection:', event.reason);
    event.preventDefault();
});

// 🔔 NOTIFICACIONES PUSH (para futuras funciones)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nueva actualización disponible',
            icon: './logo-192.png',
            badge: './logo-96.png',
            tag: 'betania-update',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir Betania Music'
                },
                {
                    action: 'dismiss',
                    title: 'Cerrar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Betania Music V4',
                options
            )
        );
    }
});

// 📱 MANEJAR CLICS EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

console.log('🎵 SW Betania V4 cargado y listo para funcionar offline');
