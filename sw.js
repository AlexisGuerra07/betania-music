// Service Worker "kill switch" — se autodestruye y limpia cualquier caché vieja
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));

  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach(client => client.navigate(client.url));

  await self.registration.unregister();
});
