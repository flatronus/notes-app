const CACHE = 'notes-v10';
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

// Активація — видаляємо всі старі кеші
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — спочатку мережа, потім кеш (network-first щоб завжди був свіжий index.html)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Оновлюємо кеш свіжою версією
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
