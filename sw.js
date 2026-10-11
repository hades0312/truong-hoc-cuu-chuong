/* Service worker: lưu sẵn toàn bộ game để mở offline sau lần tải đầu. */
var CACHE = 'tientien-v7';
var ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/engine.js', './js/storage.js', './js/audio.js', './js/art.js', './js/ui.js', './js/external.js', './js/install.js', './js/visual.js',
  './js/quiz.js', './js/activities.js', './js/world.js', './js/parent.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', function (e) {
  // cache: 'reload' — bỏ qua bộ nhớ đệm HTTP của trình duyệt (máy chủ cho giữ js/css nhiều giờ), để bản mới luôn lấy đúng file mới
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ASSETS.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () { return caches.match('./index.html'); });
  }));
});
