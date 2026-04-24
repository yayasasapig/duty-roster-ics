const CACHE_NAME = 'a5-roster-v2';
const ASSETS = [
  './',
  './index.html',
  './js/app.js',
  './css/styles.css',
  './data.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap'
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches + check for data.js update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => {
      // After activating, check for data.js update in background
      checkDataUpdate();
      return self.clients.claim();
    })
  );
});

// Background check for data.js update (called on activate and periodically)
async function checkDataUpdate() {
  try {
    const networkData = await fetch('./data.js?t=' + Date.now()).then(r => r.text()).catch(() => null);
    if (!networkData) return;

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('./data.js');
    const cachedData = cachedResponse ? await cachedResponse.text() : '';

    if (networkData !== cachedData) {
      // New data available - store it in cache and notify clients
      const response = new Response(networkData, {
        headers: { 'Content-Type': 'application/javascript' }
      });
      await cache.put('./data.js', response);

      // Notify all clients that new data is available
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_UPDATE_AVAILABLE',
          message: '更表資料已更新，請重新整理以獲取最新版本'
        });
      });
    }
  } catch (e) {
    // Silently fail - no network or other error
  }
}

// Periodically check for updates (every 6 hours while active)
self.addEventListener('message', (event) => {
  if (event.data === 'CHECK_FOR_UPDATE') {
    checkDataUpdate();
  }
});

// Fetch: network-first for API/CDN, cache-first for local files
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // External CDN/api — network first, fall back to cache
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Local assets — cache first, fall back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});