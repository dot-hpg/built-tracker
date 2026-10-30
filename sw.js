// Keeps the tracker usable offline: the page shell is cached, data is fetched fresh when online.
const SHELL = 'built-shell-v3';
const DATA = 'built-data';
const FILES = ['./', 'index.html', 'd3.min.js', 'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const fresh = url.pathname.includes('/data/') || e.request.mode === 'navigate';
  if (fresh) {
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(DATA).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
