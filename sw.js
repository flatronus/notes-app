const CACHE = 'notes-v1';
const FILES = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Встановлення — кешуємо всі файли
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

// Активація — видаляємо старі кеші
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — спочатку кеш, потім мережа
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
