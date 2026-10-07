const CACHE_PREFIX = 'cnc-calculator-';
const CACHE_NAME = `${CACHE_PREFIX}v9`;
const PRECACHE_URLS = [
  './', './index.html', './manifest.json', './favicon.png', './icon-192.png', './icon-512.png',
  './din509/form-e.jpg', './din509/form-f.jpg', './din509/form-g.jpg', './din509/form-h.jpg',
];

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

  // Pliki z katalogu /assets/ mają hash w nazwie (Vite: nazwa-HASH.js) — są niezmienne,
  // więc serwujemy je z cache od razu (start aplikacji bez czekania na sieć).
  const isHashedAsset = /\/assets\/[^/]+$/i.test(url.pathname) && !isHTML;

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

  // HTML — od razu z cache, a w tle pobieramy świeżą wersję (stale-while-revalidate).
  // Dzięki temu start aplikacji z ekranu głównego nie czeka na sieć; nowa wersja
  // pojawia się przy kolejnym uruchomieniu.
  if (isHTML) {
    const indexUrl = self.registration.scope + 'index.html';
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match(indexUrl)).then((cached) => {
        const update = fetch(req, { cache: 'no-store' })
          .then((response) => {
            if (response && response.status === 200) {
              const copy1 = response.clone();
              const copy2 = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, copy1);
                cache.put(indexUrl, copy2);
              });
            }
            return response;
          })
          .catch(() => null);
        if (cached) {
          event.waitUntil(update);
          return cached;
        }
        return update.then((response) => response || Response.error());
      }),
    );
    return;
  }

  // Pozostałe żądania — sieć najpierw, cache jako zapas (offline).
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
