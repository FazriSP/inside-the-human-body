/* eslint-disable no-restricted-globals */
const SHELL_CACHE = 'ithb-shell-cache-v1';
const GLB_CACHE = 'ithb-glb-models-cache-v1';
const RUNTIME_CACHE = 'ithb-runtime-cache-v1';

// Injected during production build by ithbPwaPlugin in vite.config.ts
const PRECACHE_URLS = self.__ITHB_PRECACHE_MANIFEST || [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/models/manifest.json',
];

const LITE_MODEL_URLS = [
  '/models/za-skeletal-full.lite.glb',
  '/models/za-cardiovascular-core.lite.glb',
  '/models/za-respiratory.lite.glb',
  '/models/za-regions-skin.lite.glb',
  '/models/hra-heart.lite.glb',
  '/models/hra-lung.lite.glb',
  '/models/hra-trachea.lite.glb',
  '/models/hra-larynx.lite.glb',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([SHELL_CACHE, GLB_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !allowedCaches.has(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (data.type === 'PRECACHE_LITE_MODELS') {
    event.waitUntil(
      caches
        .open(GLB_CACHE)
        .then((cache) => cache.addAll(LITE_MODEL_URLS))
        .then(() => {
          if (event.source && 'postMessage' in event.source) {
            event.source.postMessage({ type: 'LITE_MODELS_PRECACHED' });
          }
        }),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. CacheFirst strategy for 3D GLB chunks (/models/*.glb)
  if (url.origin === self.location.origin && url.pathname.endsWith('.glb')) {
    event.respondWith(
      caches.open(GLB_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }),
    );
    return;
  }

  // 2. SPA Navigation fallback to cached /index.html when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const cache = await caches.open(SHELL_CACHE);
          cache.put('/index.html', response.clone());
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            Response.error()
          );
        }),
    );
    return;
  }

  // 3. StaleWhileRevalidate strategy for UI shell, scripts, styles, fonts, and manifest
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then(async (response) => {
          if (
            response &&
            response.status === 200 &&
            (url.origin === self.location.origin ||
              url.hostname.includes('fonts.googleapis.com') ||
              url.hostname.includes('fonts.gstatic.com'))
          ) {
            const targetCache = await caches.open(RUNTIME_CACHE);
            targetCache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
