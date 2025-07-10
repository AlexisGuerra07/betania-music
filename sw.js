// 📱 SERVICE WORKER ACTUALIZADO PARA SPA - BETANIA MUSIC V4
// Manejo de rutas SPA y cache inteligente

const CACHE_NAME = 'betania-music-v4.2-spa';
const STATIC_CACHE = 'betania-static-v4.2';
const DYNAMIC_CACHE = 'betania-dynamic-v4.2';

// 📦 RECURSOS PARA CACHEAR
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './js/navigation.js',
    './js/auth.js',
    './js/setlist.js',
    // Fallbacks para offline
    './offline.html'
];

// 🧭 RUTAS SPA QUE DEBEN SERVIR index.html
const SPA_ROUTES = [
    '/',
    '/canciones',
    '/setlist',
    '/grabaciones',
    '/herramientas',
    '/add-song',
    '/login'
];

// 🚀 INSTALACIÓN DEL SERVICE WORKER
self.addEventListener('install', (event) => {
    console.log('🔧 SW Betania V4 SPA: Instalando...');
    
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
            console.log('✅ SW Betania V4 SPA: Instalación completada');
            self.skipWaiting();
        }).catch((error) => {
            console.error('❌ Error en instalación SW:', error);
        })
    );
});

// 🔄 ACTIVACIÓN DEL SERVICE WORKER
self.addEventListener('activate', (event) => {
    console.log('🔧 SW Betania V4 SPA: Activando...');
    
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
            console.log('✅ SW Betania V4 SPA: Activado y listo');
            
            // Notificar a clientes sobre actualización
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        message: '🎵 Betania V4 SPA actualizado y listo'
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
    
    // Ignorar requests a URLs externas (excepto CDNs permitidos)
    if (!request.url.startsWith(self.location.origin) && 
        !request.url.includes('fonts.googleapis.com') &&
        !request.url.includes('fonts.gstatic.com') &&
        !request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    event.respondWith(handleSPARequest(request, url));
});

// 🎯 MANEJADOR PRINCIPAL DE REQUESTS SPA
async function handleSPARequest(request, url) {
    try {
        // 1. NAVEGACIÓN SPA - Servir index.html para rutas SPA
        if (request.mode === 'navigate') {
            return await handleSPANavigation(request, url);
        }
        
        // 2. RECURSOS ESTÁTICOS (HTML, CSS, JS)
        if (isStaticResource(url.pathname)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // 3. API CALLS - Network first con cache fallback
        if (isAPICall(url.pathname)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }
        
        // 4. FUENTES Y RECURSOS EXTERNOS
        if (isExternalResource(request.url)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // 5. IMÁGENES Y MEDIA
        if (isMediaResource(url.pathname)) {
            return await cacheFirst(request, DYNAMIC_CACHE);
        }
        
        // 6. FALLBACK GENERAL
        return await networkFirst(request, DYNAMIC_CACHE);
        
    } catch (error) {
        console.error('❌ Error en handleSPARequest:', error);
        return await getSPAOfflineFallback(request, url);
    }
}

// 🧭 MANEJAR NAVEGACIÓN SPA
async function handleSPANavigation(request, url) {
    try {
        // Intentar red primero para navegación
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            // Cache la respuesta si es exitosa
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
            return response;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('🧭 Navegación SPA offline para:', url.pathname);
        
        // Para rutas SPA, servir index.html desde cache
        if (isSPARoute(url.pathname)) {
            const cache = await caches.open(STATIC_CACHE);
            const cachedIndex = await cache.match('./index.html');
            
            if (cachedIndex) {
                console.log('✅ Sirviendo index.html para ruta SPA:', url.pathname);
                return cachedIndex;
            }
        }
        
        // Fallback general
        return await getSPAOfflineFallback(request, url);
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
        return await getSPAOfflineFallback(request);
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
        
        return await getSPAOfflineFallback(request);
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

// 📱 FALLBACK OFFLINE PARA SPA
async function getSPAOfflineFallback(request, url) {
    const requestUrl = url || new URL(request.url);
    
    // Para navegación SPA, servir index.html offline
    if (request.mode === 'navigate' || isSPARoute(requestUrl.pathname)) {
        const cache = await caches.open(STATIC_CACHE);
        const cachedIndex = await cache.match('./index.html');
        
        if (cachedIndex) {
            return cachedIndex;
        }
        
        // Si no hay index.html cacheado, devolver página offline
        return new Response(getSPAOfflineHTML(), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    // Para APIs, devolver datos offline básicos
    if (isAPICall(requestUrl.pathname)) {
        return new Response(JSON.stringify({
            offline: true,
            message: 'Datos no disponibles sin conexión',
            timestamp: Date.now()
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

// 🎨 HTML PARA PÁGINA OFFLINE SPA
function getSPAOfflineHTML() {
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
            margin: 10px;
        }
        .retry-btn:hover {
            background: #02866e;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(7, 155, 130, 0.4);
        }
        .spa-info {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        .spa-info h3 {
            color: #079b82;
            margin-bottom: 15px;
        }
        .cached-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(40, 167, 69, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(40, 167, 69, 0.3);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">🎵</div>
        <h1>Sin conexión a internet</h1>
        <p>No hay conexión disponible, pero Betania Music V4 funciona completamente offline con navegación SPA.</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
            🔄 Intentar conectar
        </button>
        
        <button class="retry-btn" onclick="goToApp()">
            🎵 Ir a la aplicación
        </button>
        
        <div class="cached-info">
            <h4>📱 Funciones Disponibles Offline:</h4>
            <p>✅ Navegación SPA • ✅ Canciones cacheadas • ✅ Editor de acordes • ✅ Transposición • ✅ Setlist</p>
        </div>
        
        <div class="spa-info">
            <h3>🧭 Navegación SPA Activa</h3>
            <p>La aplicación funciona completamente sin recargas de página, incluso offline.</p>
        </div>
    </div>
    
    <script>
        function goToApp() {
            // Intentar ir a la aplicación principal
            window.location.href = '/';
        }
        
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
        
        console.log('📱 Betania V4 SPA - Modo Offline Activo');
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

function isAPICall(pathname) {
    return pathname.startsWith('/api/') ||
           pathname.includes('/api/') ||
           pathname.startsWith('./api/');
}

function isMediaResource(pathname) {
    return pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.jpeg') ||
           pathname.endsWith('.gif') ||
           pathname.endsWith('.webp') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.mp3') ||
           pathname.endsWith('.mp4') ||
           pathname.endsWith('.webm');
}

function isExternalResource(url) {
    return url.includes('fonts.googleapis.com') ||
           url.includes('fonts.gstatic.com') ||
           url.includes('cdnjs.cloudflare.com');
}

function isSPARoute(pathname) {
    // Normalizar pathname
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    
    // Verificar si es una ruta SPA conocida
    return SPA_ROUTES.includes(normalizedPath) ||
           // O si parece una ruta SPA (sin extensión)
           (!pathname.includes('.') && !pathname.startsWith('/api/'));
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
            
        case 'CACHE_SETLIST':
            if (data && data.setlist) {
                cacheSetlistData(data.setlist);
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
            
        case 'PREFETCH_ROUTE':
            if (data && data.route) {
                prefetchRoute(data.route);
            }
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

// 📋 CACHEAR DATOS DE SETLIST
async function cacheSetlistData(setlistData) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        
        await cache.put(
            './api/setlist',
            new Response(JSON.stringify(setlistData), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
        
        console.log('📋 Setlist cacheado:', setlistData.length, 'canciones');
    } catch (error) {
        console.error('❌ Error cacheando setlist:', error);
    }
}

// 🔄 PREFETCH DE RUTA
async function prefetchRoute(route) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const response = await fetch(route);
        
        if (response && response.status === 200) {
            await cache.put(route, response);
            console.log('🔄 Ruta prefetcheada:', route);
        }
    } catch (error) {
        console.error('❌ Error en prefetch:', error);
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
            timestamp: Date.now(),
            spaEnabled: true
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

console.log('🎵 SW Betania V4 SPA cargado y listo para navegación sin recargas');
