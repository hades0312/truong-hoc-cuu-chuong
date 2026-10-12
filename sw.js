/* Service worker: lưu sẵn toàn bộ game để mở offline sau lần tải đầu, và tự cập nhật khi có bản mới.
 * MỖI LẦN ĐƯA BẢN MỚI LÊN: tăng số trong CACHE ở đây và số ?v= trong index.html. */
var CACHE = 'tientien-v12';
var ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/engine.js', './js/storage.js', './js/audio.js', './js/art.js', './js/art-home.js', './js/ui.js', './js/external.js', './js/install.js', './js/visual.js',
  './js/quiz.js', './js/bank-math.js', './js/bank-science.js', './js/bank-english.js', './js/bank-life.js', './js/bank-home.js', './js/subjects.js', './js/tour.js',
  './js/activities.js', './js/world.js', './js/parent.js', './js/app.js',
  './img/tranh-mac-dinh.svg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];
/* Có thì lưu, không có cũng không sao (ảnh treo trong lớp là ảnh riêng của từng nhà) */
var OPTIONAL = ['./img/lop-hoc-tranh.jpg'];

/* cache: 'reload' — bỏ qua bộ nhớ đệm HTTP của trình duyệt (máy chủ cho giữ js/css nhiều giờ), để bản mới luôn lấy đúng file mới */
function fresh(u) { return new Request(u, { cache: 'reload' }); }

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ASSETS.map(fresh)).then(function () {
      return Promise.all(OPTIONAL.map(function (u) { return c.add(fresh(u)).catch(function () { /* không có file */ }); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    // Các bản từ v9 trở về trước chưa biết tự tải lại khi có bản mới: bản này tải lại giúp những trang đang mở.
    var legacy = keys.some(function (k) { return /^tientien-v[1-9]$/.test(k); });
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }))
      .then(function () { return self.clients.claim(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (list) {
        list.forEach(function (c) {
          try { if (legacy && c.navigate) c.navigate(c.url).catch(function () { /* */ }); } catch (err) { /* trình duyệt không cho: lần mở sau sẽ là bản mới */ }
        });
      });
  }));
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
