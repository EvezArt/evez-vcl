// Hermes Dashboard Service Worker v1
// Cache-first for static assets, network-first for API calls
const CACHE = 'hermes-v1';

const PRECACHE = [
  '/hermes-ui/',
  '/hermes-ui/index.html',
  '/hermes-ui/manifest.json',
  '/hermes-ui/robots.txt',
  '/hermes-ui/sitemap.xml',
  '/hermes-ui/vcl.html',
  '/hermes-ui/vcl-viewer.html',
  '/hermes-ui/retrocausal-engine.html',
  '/hermes-ui/immutable-ledger.html',
  '/hermes-ui/icons/icon-192.png',
  '/hermes-ui/icons/icon-512.png',
  '/hermes-ui/profiles/steven-crawford-maggard.html',
  '/hermes-ui/profiles/william-hills-ii.html',
  '/hermes-ui/profiles/trevor-barton.html'
];

// Install: cache known resources
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE).catch(err => {
        console.warn('SW pre-cache partial failure:', err);
      });
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // API calls: network-first
  if (url.pathname.startsWith('/hermes-ui/vcl/') || url.pathname.startsWith('/hermes-ui/api/')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Static files: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (res.ok && url.pathname.startsWith('/hermes-ui/')) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback for profiles
        if (url.pathname.includes('/profiles/')) {
          return caches.match('/hermes-ui/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});