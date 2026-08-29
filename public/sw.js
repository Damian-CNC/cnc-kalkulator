const CACHE_PREFIX = 'cnc-calculator-';
const CACHE_NAME = `${CACHE_PREFIX}v6`;
const PRECACHE_URLS = ['./', './index.html', './manifest.json', './favicon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  // Hashed static assets — cache-first for instant subsequent loads.
  const isHashedAsset = /\/assets\/.+\.[a-f0-9]{6,}\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|webp)$/i.test(url.pathname);

  if (isHashedAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Fonts & other cross-origin static assets — cache-first (works offline on the shop floor).
  const isFontOrStatic =
    /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) ||
    /\.(woff2?|ttf|otf|png|jpg|jpeg|svg|webp|json)$/i.test(url.pathname);

  if (isFontOrStatic && !isHTML) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((response) => {
            if (response && (response.status === 200 || response.type === 'opaque')) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // HTML & everything else — network-first with cache fallback (offline).
  event.respondWith(
    fetch(req, isHTML ? { cache: 'no-store' } : undefined)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || (isHTML ? caches.match('./index.html') : undefined)))
  );
});
