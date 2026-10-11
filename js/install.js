/* install.js: nút "Cài app" — đưa game ra màn hình chính để bé chạm một lần là vào chơi.
 * Mỗi loại thiết bị cài một kiểu: nơi trình duyệt cho phép (Chrome, Edge, Samsung Internet) thì mở hộp cài đặt ngay;
 * nơi không cho (iPhone, iPad, Safari trên Mac, Firefox, mở trong Zalo/Facebook…) thì hiện hướng dẫn đúng với máy đó. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var nav = root.navigator;
  var deferred = null;   // lời mời cài đặt trình duyệt gửi khi trang đủ điều kiện (chỉ dùng được một lần)
  var done = false;

  root.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  root.addEventListener('appinstalled', function () {
    deferred = null; done = true;
    hideButtons();
    TT.ui.closeModal();
    TT.ui.toast('Đã cài xong! Lần sau con chạm vào biểu tượng Cửu chương trên màn hình là vào chơi.', 5200);
  });

  /* Đang chạy như một ứng dụng (mở từ biểu tượng trên màn hình chính) */
  function installed() {
    if (done || nav.standalone === true) return true;
    return !!root.matchMedia && ['standalone', 'fullscreen', 'minimal-ui'].some(function (m) { return root.matchMedia('(display-mode: ' + m + ')').matches; });
  }

  function device() {
    var ua = nav.userAgent || '';
    var ios = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1); // iPad đời mới tự xưng là máy Mac
    var d = {
      ios: ios, ipad: ios && !/iPhone|iPod/.test(ua), android: /Android/i.test(ua),
      inApp: !!(TT.external && TT.external.app()), // mở từ trong ứng dụng khác (xem external.js)
      firefox: /Firefox|FxiOS/i.test(ua), samsung: /SamsungBrowser/i.test(ua), edge: /Edg(e|A|iOS)?\//.test(ua),
      iosOther: /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua), mac: /Macintosh/.test(ua) && !ios
    };
    d.safariMac = d.mac && /Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
    return d;
  }

  function ic(name) { return TT.art.icon(name, 'ico step-ico'); }

  /* Hướng dẫn cho đúng thiết bị đang dùng: {on: tên máy/trình duyệt, steps: [html], note} */
  function guide() {
    var d = device();
    if (!root.isSecureContext) {
      return { on: 'địa chỉ chưa bảo mật', steps: ['Mở game bằng địa chỉ bắt đầu bằng <b>https://</b> (có hình ổ khóa).', 'Rồi bấm lại nút <b>Cài app</b>.'],
        note: 'Trình duyệt chỉ cho cài ứng dụng từ trang https.' };
    }
    if (d.inApp) {
      return { on: 'trang đang mở bên trong một ứng dụng khác (Zalo, Facebook…)', steps: [
        'Chạm dấu ' + ic('dots') + ' hoặc <b>⋯</b> ở góc màn hình.',
        'Chọn <b>“Mở bằng trình duyệt”</b> (' + (d.ios ? 'Safari' : 'Chrome') + ').',
        'Khi game mở trong ' + (d.ios ? 'Safari' : 'Chrome') + ', bấm lại nút <b>Cài app</b>.'
      ], note: 'Địa chỉ game: ' + root.location.host };
    }
    if (d.ios) {
      var where = d.iosOther ? 'ở cuối thanh địa chỉ' : (d.ipad ? 'ở góc trên bên phải' : 'ở thanh dưới cùng');
      return { on: (d.ipad ? 'iPad' : 'iPhone') + (d.iosOther ? '' : ' · Safari'), steps: [
        'Chạm nút <b>Chia sẻ</b> ' + ic('share') + ' ' + where + '.',
        'Kéo xuống và chọn <b>“Thêm vào MH chính”</b> ' + ic('addbox') + '.',
        'Chạm <b>“Thêm”</b>. Biểu tượng Cửu chương sẽ hiện trên màn hình chính.'
      ], note: d.iosOther ? 'Nếu không thấy mục “Thêm vào MH chính”, hãy mở trang này bằng Safari rồi làm lại.' : '' };
    }
    if (d.android) {
      if (d.samsung) {
        return { on: 'điện thoại Samsung · Samsung Internet', steps: [
          'Chạm nút menu <b>≡</b> ở góc dưới bên phải.', 'Chọn <b>“Thêm trang vào”</b> rồi <b>“Màn hình chờ”</b>.', 'Chạm <b>“Thêm”</b>.'] };
      }
      return { on: 'Android · ' + (d.firefox ? 'Firefox' : 'Chrome'), steps: [
        'Chạm dấu ' + ic('dots') + ' ở góc ' + (d.firefox ? 'màn hình' : 'trên bên phải') + '.',
        'Chọn <b>“Thêm vào màn hình chính”</b> (có máy ghi là <b>“Cài đặt ứng dụng”</b>).',
        'Chạm <b>“Cài đặt”</b> hoặc <b>“Thêm”</b>.'] };
    }
    if (d.safariMac) {
      return { on: 'máy Mac · Safari', steps: [
        'Trên thanh menu, chọn <b>Tệp</b> (File) → <b>“Thêm vào Dock…”</b>.', 'Bấm <b>“Thêm”</b>. Game sẽ nằm ở thanh Dock như một ứng dụng.'],
        note: 'Cần Safari 17 (macOS Sonoma) trở lên. Máy cũ hơn có thể dùng Chrome hoặc Edge.' };
    }
    if (d.firefox) {
      return { on: 'máy tính · Firefox', steps: [
        'Firefox trên máy tính chưa cho cài trang web thành ứng dụng.',
        'Mở trang này bằng <b>Chrome</b> hoặc <b>Edge</b>, rồi bấm lại nút <b>Cài app</b>.'],
        note: 'Hoặc nhấn ' + (d.mac ? '⌘' : 'Ctrl') + ' + D để đánh dấu trang cho dễ tìm.' };
    }
    return { on: 'máy tính · ' + (d.edge ? 'Edge' : 'Chrome'), steps: [
      'Bấm biểu tượng cài đặt ' + ic('pc') + ' ở cuối thanh địa chỉ.',
      'Nếu không thấy: mở menu ' + ic('dots') + ' → ' + (d.edge ? '<b>“Ứng dụng”</b> → <b>“Cài đặt trang web này dưới dạng ứng dụng”</b>.' : '<b>“Truyền, lưu và chia sẻ”</b> → <b>“Cài đặt trang dưới dạng ứng dụng”</b>.'),
      'Bấm <b>“Cài đặt”</b>.'] };
  }

  function showGuide() {
    var U = TT.ui, h = U.h, g = guide();
    var ol = h('ol', { class: 'steps install-steps' });
    g.steps.forEach(function (s) { ol.appendChild(h('li', { html: s })); });
    var box = h('div', { class: 'install-box' }, [
      h('img', { class: 'install-app', src: 'icons/icon-192.png', alt: '', width: '84', height: '84' }),
      h('h2', { text: 'Cài game Cửu chương ra màn hình' }),
      h('p', { class: 'muted', text: 'Cách làm trên ' + g.on + ':' }),
      ol,
      g.note ? h('p', { class: 'muted small', text: g.note }) : null,
      h('div', { class: 'row-actions' }, [U.btn('Đã hiểu', 'primary big', U.closeModal)])
    ]);
    U.modal(box, { cls: 'install-modal' });
  }

  /* Bấm nút: có lời mời của trình duyệt thì cài luôn, không thì hướng dẫn từng bước */
  function open() {
    if (installed()) { TT.ui.toast('Game đã được cài và đang chạy như một ứng dụng rồi.'); return; }
    if (!deferred) return showGuide();
    var p = deferred; deferred = null;
    try {
      p.prompt();
      if (p.userChoice && p.userChoice.then) p.userChoice.then(function (c) { if (c && c.outcome === 'accepted') { done = true; hideButtons(); } });
    } catch (e) { showGuide(); }
  }

  function hideButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('.install-btn'), function (b) { b.hidden = true; });
  }

  /* Tạo nút cài; trả về null khi game đã chạy như ứng dụng */
  function button(cls, label) {
    if (installed()) return null;
    return TT.ui.btn(TT.ui.h('span', { html: TT.art.icon('install') + '<span>' + (label || 'Cài app') + '</span>' }), 'install-btn ' + (cls || ''), open,
      { 'aria-label': 'Cài game ra màn hình chính' });
  }

  TT.install = { button: button, open: open, installed: installed, guide: guide, device: device };
})(window);
