
const CACHE_NAME = 'asistencia-z1-v1.2';
const APP_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar la nueva versión
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Eliminar cachés anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name.startsWith('asistencia-z1-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Buscar la versión más reciente cuando haya internet
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache =>
                cache.put(event.request, copy)
              )
            );
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(event.request)) ||
                 (await caches.match('./index.html')) ||
                 Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
