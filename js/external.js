/* external.js: khi link game được bấm từ bên trong một ứng dụng khác (Facebook, Messenger, Zalo, Instagram, TikTok…),
 * trang sẽ mở trong trình duyệt nhúng của ứng dụng đó: không cài được ra màn hình chính và dễ mất tiến độ.
 * File này thử tự chuyển sang trình duyệt thật của máy; không tự chuyển được thì hiện bảng nhắc có nút bấm,
 * cách làm bằng tay và nút sao chép địa chỉ. Bé vẫn có thể chọn "Cứ chơi ở đây". */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var nav = root.navigator, ua = nav.userAgent || '', loc = root.location, doc = root.document;

  /* Dấu hiệu nhận biết trình duyệt nhúng trong từng ứng dụng (thứ tự quan trọng: Messenger trước Facebook) */
  var APPS = [
    [/Zalo/i, 'Zalo'], [/Messenger|Orca/i, 'Messenger'], [/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i, 'Facebook'], [/Instagram/i, 'Instagram'],
    [/Barcelona/i, 'Threads'], [/TikTok|musical_ly|BytedanceWebview|trill_/i, 'TikTok'], [/Line\//i, 'LINE'], [/MicroMessenger/i, 'WeChat'],
    [/Twitter/i, 'X'], [/Snapchat/i, 'Snapchat'], [/KAKAOTALK/i, 'KakaoTalk'], [/Viber/i, 'Viber'], [/; wv\)/, 'một ứng dụng khác']
  ];
  function app() {
    for (var i = 0; i < APPS.length; i++) { if (APPS[i][0].test(ua)) return APPS[i][1]; }
    return null;
  }

  var isIOS = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var iosVer = isIOS ? +((ua.match(/OS (\d+)[_.]/) || [])[1] || 0) : 0;
  var here = loc.origin + loc.pathname;   // địa chỉ game, không kèm tham số
  var tried = [];

  /* Địa chỉ đặc biệt để nhờ hệ điều hành mở trình duyệt thật */
  function target() {
    if (isAndroid) {
      // Android: "intent" mở trình duyệt mặc định; ứng dụng nào không mở được sẽ tải lại trang kèm ?noext=1 (không thử nữa)
      return 'intent://' + loc.host + loc.pathname + '#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=' +
        encodeURIComponent(here + '?noext=1') + ';end';
    }
    if (isIOS) return 'x-safari-https://' + loc.host + loc.pathname; // iPhone/iPad từ iOS 17: mở thẳng Safari
    return here;
  }

  function ss(k, v) { // sessionStorage có thể bị chặn trong trình duyệt nhúng
    try { if (v === undefined) return root.sessionStorage.getItem(k); root.sessionStorage.setItem(k, v); } catch (e) { /* */ }
    return null;
  }

  /* auto = true: thử ngay khi vào trang, chỉ dùng cách không thể làm hỏng trang đang mở.
   * auto = false: người dùng tự bấm nút. */
  function open(auto) {
    var url = target(), name = app();
    tried.push((auto ? 'auto ' : 'tap ') + url);
    if (isAndroid && auto && !/^(Facebook|Messenger|Instagram|Threads|LINE)$/.test(name)) {
      // Ứng dụng chưa chắc hiểu "intent": thử qua khung ẩn để nếu không được thì trang vẫn nguyên vẹn
      var f = doc.createElement('iframe');
      f.style.display = 'none'; f.src = url;
      doc.body.appendChild(f);
      setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 2000);
      return;
    }
    try { loc.href = url; } catch (e) { /* trình duyệt nhúng chặn: người dùng làm theo hướng dẫn bằng tay */ }
  }

  function copy(btn) {
    var done = function () { btn.textContent = 'Đã sao chép: dán vào Safari hoặc Chrome'; };
    try {
      if (nav.clipboard && nav.clipboard.writeText) { nav.clipboard.writeText(here).then(done, legacy); return; }
    } catch (e) { /* */ }
    legacy();
    function legacy() {
      var i = doc.createElement('input');
      i.value = here; i.setAttribute('readonly', ''); i.style.cssText = 'position:fixed;left:0;top:0;opacity:0';
      doc.body.appendChild(i); i.select(); i.setSelectionRange(0, 999);
      try { doc.execCommand('copy'); done(); } catch (e) { btn.textContent = here; }
      doc.body.removeChild(i);
    }
  }

  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function showCard(name) {
    if (doc.getElementById('ext-card')) return;
    var browser = isIOS ? 'Safari' : (isAndroid ? 'Chrome' : 'trình duyệt');
    var wrap = el('div', 'ext-wrap'); wrap.id = 'ext-card'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', 'Mở game bằng trình duyệt');
    var card = el('div', 'ext-card');
    var img = el('img', 'install-app'); img.src = 'icons/icon-192.png'; img.alt = ''; img.width = 84; img.height = 84;
    card.appendChild(img);
    card.appendChild(el('h2', '', 'Mở game bằng ' + browser + ' nhé!'));
    card.appendChild(el('p', '', 'Game đang mở bên trong ' + name + '. Ở đây game không cài được ra màn hình chính và dễ mất tiến độ đã chơi.'));
    var go = el('button', 'btn primary big', 'Mở bằng ' + browser); go.type = 'button'; go.id = 'ext-open';
    go.addEventListener('click', function () { open(false); });
    card.appendChild(go);
    var ol = el('ol', 'steps install-steps');
    ol.appendChild(el('li', '', 'Nếu bấm nút mà không mở được: chạm dấu ⋯ hoặc ⋮ ở góc màn hình.'));
    ol.appendChild(el('li', '', 'Chọn “Mở bằng trình duyệt” (có máy ghi “Mở trong ' + browser + '” hoặc “Open in browser”).'));
    card.appendChild(ol);
    var row = el('div', 'row-actions');
    var cp = el('button', 'btn ghost small', 'Sao chép địa chỉ game'); cp.type = 'button'; cp.id = 'ext-copy';
    cp.addEventListener('click', function () { copy(cp); });
    var stay = el('button', 'btn ghost small', 'Cứ chơi ở đây'); stay.type = 'button'; stay.id = 'ext-stay';
    stay.addEventListener('click', function () { ss('tt-ext-stay', '1'); if (wrap.parentNode) wrap.parentNode.removeChild(wrap); });
    row.appendChild(cp); row.appendChild(stay);
    card.appendChild(row);
    wrap.appendChild(card);
    doc.body.appendChild(wrap);
  }

  function boot() {
    var name = app();
    if (!name || loc.protocol !== 'https:' || ss('tt-ext-stay')) return;
    var again = /[?&]noext=1/.test(loc.search) || ss('tt-ext-tried');
    ss('tt-ext-tried', '1');
    // Tự thử một lần mỗi lượt mở. iPhone/iPad đời cũ (trước iOS 17) không có đường mở Safari nên chỉ hướng dẫn.
    if (!again && (isAndroid || iosVer >= 17)) open(true);
    setTimeout(function () { showCard(name); }, again ? 0 : 700);
  }

  TT.external = { app: app, open: open, url: here, get tried() { return tried.slice(); } };
  // Chờ game tải xong mới thử: chuyển trang giữa chừng sẽ làm trình duyệt ngừng tải các file còn lại,
  // nếu không chuyển được thì bé nhận một trang trắng.
  if (doc.readyState === 'complete') setTimeout(boot, 300);
  else root.addEventListener('load', function () { setTimeout(boot, 300); });
})(window);
