const CACHE_NAME = 'finhabit-v1';
const urlsToCache = [
  '/Finhabit-Tracker/',
  '/Finhabit-Tracker/index.html',
  '/Finhabit-Tracker/style.css',
  '/Finhabit-Tracker/app.js',
  '/Finhabit-Tracker/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});