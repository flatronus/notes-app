const CACHE = 'notes-v15';
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

// Fetch — спочатку кеш (миттєвий запуск), оновлення з мережі у фоні (stale-while-revalidate)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request).then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      e.waitUntil(net.catch(() => {}));
      return cached || net;
    })
  );
});
