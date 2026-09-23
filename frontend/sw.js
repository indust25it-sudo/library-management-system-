/* =========================================================
   LibraX PWA Service Worker
   Comprehensive offline caching, app shell & API resilience
   ========================================================= */

const CACHE_VERSION = 'librax-v1.0.0';
const STATIC_CACHE = `librax-static-${CACHE_VERSION}`;
const API_CACHE = `librax-api-${CACHE_VERSION}`;
const RUNTIME_CACHE = `librax-runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

/* ================= 1. INSTALL EVENT ================= */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Pre-cache local assets first; tolerantly fetch external CDNs
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(new Request(asset, { cache: 'reload' }));
        } catch (err) {
          console.warn(`[PWA SW] Precache warning for ${asset}:`, err.message);
        }
      }
    })
  );
});

/* ================= 2. ACTIVATE EVENT ================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('librax-') && name !== STATIC_CACHE && name !== API_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log(`[PWA SW] Deleting obsolete cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ================= 3. FETCH EVENT ================= */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for standard caching
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'You are currently offline. Changes will not be saved until connectivity is restored.',
            offline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // A. Navigation request (HTML page navigation)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // B. Read-only API Endpoints (/api/books, /api/members, /api/issues, /api/stats, /api/status)
  if (url.pathname.startsWith('/api/')) {
    // Network-First with Cache Fallback for offline usage
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            // Return cached API response with custom header indicating offline cached data
            const headers = new Headers(cached.headers);
            headers.set('X-LibraX-Offline-Cache', 'true');
            return new Response(await cached.blob(), {
              status: cached.status,
              statusText: cached.statusText,
              headers: headers
            });
          }

          return new Response(
            JSON.stringify({
              error: 'Library data is unavailable offline. Reconnect to sync.',
              offline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // C. CDN & Google Fonts (Cache-First)
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // D. Static Assets: JS, CSS, Images, Icons, Manifest (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failure is expected when offline; cached response handles it
        });

      return cachedResponse || fetchPromise;
    })
  );
});

/* ================= 4. MESSAGE EVENT ================= */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
