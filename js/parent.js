/* parent.js: Góc dành cho ba mẹ — tách riêng, cổng giữ nút để tránh bé bấm nhầm. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var E, A, U, h, btn;
  function init() { E = TT.engine; A = TT.art; U = TT.ui; h = U.h; btn = U.btn; }

  /* Cổng: giữ nút 2 giây */
  function gate(onPass) {
    init();
    var box = h('div', { class: 'gate' }, [
      h('h2', { text: 'Góc dành cho ba mẹ' }),
      h('p', { text: 'Ba mẹ nhấn và giữ nút bên dưới khoảng 2 giây để vào.' })
    ]);
    var hold = h('button', { type: 'button', class: 'btn primary big hold' }, [h('span', { class: 'hold-fill' }), h('span', { class: 'hold-text', text: 'Nhấn giữ để vào' })]);
    var timer = null, start = 0, raf = 0;
    function down(e) {
      e.preventDefault(); start = performance.now();
      var fill = hold.querySelector('.hold-fill');
      (function tick() {
        var k = Math.min(1, (performance.now() - start) / 2000);
        fill.style.width = (k * 100) + '%';
        if (k >= 1) { up(); U.closeModal(); onPass(); return; }
        raf = requestAnimationFrame(tick);
      })();
    }
    function up() { cancelAnimationFrame(raf); clearTimeout(timer); var f = hold.querySelector('.hold-fill'); if (f) f.style.width = '0'; }
    hold.addEventListener('pointerdown', down);
    hold.addEventListener('pointerup', up);
    hold.addEventListener('pointerleave', up);
    hold.addEventListener('pointercancel', up);
    hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    // Bàn phím: giữ phím Enter/Space
    hold.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) down(e); });
    hold.addEventListener('keyup', up);
    box.appendChild(hold);
    box.appendChild(btn('Quay lại', 'ghost', U.closeModal));
    U.modal(box, { cls: 'gate-modal' });
  }

  function render(container, opts) {
    init();
    var data = TT.store.data;
    var pid = opts.profileId || data.active || 'tien';
    if (TT.store.list().indexOf(pid) < 0) pid = 'tien';
    var pname = TT.store.nameOf(pid);
    container.innerHTML = '';
    var wrap = h('div', { class: 'parent' });
    container.appendChild(wrap);

    var tabs = h('div', { class: 'tabs', role: 'tablist' });
    TT.store.list().forEach(function (id) {
      tabs.appendChild(btn(TT.store.nameOf(id), 'tab' + (id === pid ? ' on' : ''), function () { opts.profileId = id; render(container, opts); }, { role: 'tab', 'aria-selected': id === pid ? 'true' : 'false' }));
    });
    wrap.appendChild(tabs);

    var started = TT.store.hasProgress(pid);
    var p = TT.store.profile(pid);
    if (data.active !== pid && !started) {
      // không đổi hồ sơ đang chơi, chỉ xem
    }
    // ---- Tổng quan ----
    var tot = p.stats.selfCorrect + p.stats.hintCorrect + p.stats.guided;
    var counts = { solid: 0, review: 0, learning: 0, 'new': 0 };
    var solidList = [], reviewList = [];
    for (var a = 2; a <= 9; a++) for (var b = 1; b <= 10; b++) {
      var key = 'm' + a + 'x' + b, s = E.status(p.facts[key]);
      counts[s]++;
      if (s === 'solid') solidList.push(a + ' × ' + b);
      if (s === 'review') reviewList.push(a + ' × ' + b);
    }
    wrap.appendChild(h('section', { class: 'p-card' }, [
      h('h2', { text: 'Tổng quan · ' + pname + (p.nickname && p.nickname !== 'Bạn nhỏ' && p.nickname !== pname ? ' (biệt danh: ' + p.nickname + ')' : '') }),
      started ? null : h('p', { class: 'muted', text: 'Hồ sơ này chưa bắt đầu chơi.' }),
      h('div', { class: 'stats' }, [
        stat(p.stats.selfCorrect, 'câu tự làm đúng ngay lần đầu'),
        stat(p.stats.hintCorrect, 'câu đúng sau khi xem gợi ý'),
        stat(p.stats.guided, 'câu cùng làm từng bước'),
        stat(p.stats.missions, 'nhiệm vụ đã hoàn thành'),
        stat(counts.solid, 'phép nhân khá vững')
      ]),
      h('p', { class: 'muted', text: 'Đang luyện: bảng ' + p.settings.tables.join(', ') + '. Tổng ' + tot + ' câu đã làm. "Khá vững" nghĩa là tự làm đúng nhiều lần, qua nhiều ngày; một lần đúng chưa được tính là vững.' })
    ]));

    // ---- Bản đồ phép tính ----
    var map = h('section', { class: 'p-card' }, [h('h2', { text: 'Bản đồ phép nhân' })]);
    var legend = h('div', { class: 'legend' });
    ['solid', 'learning', 'review', 'new'].forEach(function (k) { legend.appendChild(h('span', { class: 'lg st-' + k, text: E.STATUS_LABEL[k] })); });
    map.appendChild(legend);
    var grid = h('div', { class: 'fact-grid', role: 'table', 'aria-label': 'Trạng thái từng phép nhân' });
    grid.appendChild(h('span', { class: 'fg-h', text: '×' }));
    for (var bb = 1; bb <= 10; bb++) grid.appendChild(h('span', { class: 'fg-h', text: String(bb) }));
    for (var aa = 2; aa <= 9; aa++) {
      grid.appendChild(h('span', { class: 'fg-h', text: String(aa) }));
      for (var b2 = 1; b2 <= 10; b2++) {
        var r = p.facts['m' + aa + 'x' + b2], st = E.status(r);
        var tip = aa + ' × ' + b2 + ' = ' + (aa * b2) + ' · ' + E.STATUS_LABEL[st] + (r ? ' · tự đúng ' + r.firstTry + ', cần gợi ý ' + r.hinted + ', lần gần nhất ' + new Date(r.last).toLocaleDateString('vi-VN') : '');
        grid.appendChild(h('span', { class: 'fg-c st-' + st, title: tip, 'aria-label': tip, text: String(aa * b2) }));
      }
    }
    map.appendChild(grid);
    map.appendChild(h('div', { class: 'two-col' }, [
      h('div', {}, [h('h3', { text: 'Đã làm khá vững' }), h('p', { text: solidList.length ? solidList.join(', ') : 'Sẽ xuất hiện sau vài ngày luyện tập đều.' })]),
      h('div', {}, [h('h3', { text: 'Nên ôn thêm' }), h('p', { text: reviewList.length ? reviewList.join(', ') : 'Hiện chưa có phép tính nào cần ôn thêm.' })])
    ]));
    if (p.settings.division) {
      var divReview = [], divSolid = [];
      Object.keys(p.facts).forEach(function (k) {
        if (k.charAt(0) !== 'd') return; var f = E.parseKey(k), s2 = E.status(p.facts[k]);
        if (s2 === 'solid') divSolid.push(f.text); if (s2 === 'review') divReview.push(f.text);
      });
      map.appendChild(h('p', { class: 'muted', text: 'Phép chia — khá vững: ' + (divSolid.join(', ') || 'chưa có') + '. Nên ôn thêm: ' + (divReview.join(', ') || 'chưa có') + '.' }));
    }
    wrap.appendChild(map);

    // ---- Thiết lập ----
    // ---- Các môn học lớp 4 ----
    var subs = TT.subjects.available();
    if (subs.length) {
      var sc = h('section', { class: 'p-card' }, [h('h2', { text: 'Các môn học lớp 4' })]);
      var grid = h('div', { class: 'table-progress' });
      subs.forEach(function (s0) {
        var st = TT.subjects.stats(p, s0.id), done = st.right + st.wrong;
        var note = !done ? 'chưa học'
          : 'đúng ngay ' + st.right + ' câu, cần gợi ý ' + st.wrong + ' câu' + (st.total > 20 ? ' · đã gặp ' + st.seen + '/' + st.total + ' câu trong ngân hàng' + (st.review ? ', nên ôn ' + st.review + ' câu' : '') : '');
        grid.appendChild(h('div', { class: 'tp subj-row' }, [
          h('span', { class: 'tp-name', text: s0.icon + ' ' + s0.name }),
          h('span', { class: 'tp-bar' }, [h('span', { class: 'tp-solid', style: 'width:' + (done ? Math.round(st.right * 100 / done) : 0) + '%' })]),
          h('span', { class: 'tp-n', text: note })
        ]));
      });
      sc.appendChild(grid);
      sc.appendChild(h('p', { class: 'muted', text: 'Thanh xanh: tỉ lệ câu con tự làm đúng ngay lần đầu, không cần gợi ý. Câu phải nhờ gợi ý sẽ được hỏi lại ở các lượt sau.' }));
      wrap.appendChild(sc);
    }

    var set = h('section', { class: 'p-card' }, [h('h2', { text: 'Thiết lập cho ' + pname })]);
    var tRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Bảng nhân luyện tập' }, [h('span', { class: 'row-label', text: 'Bảng nhân luyện tập' })]);
    for (var t = 2; t <= 9; t++) {
      (function (t) {
        var on = p.settings.tables.indexOf(t) >= 0;
        tRow.appendChild(btn('Bảng ' + t, 'chip-btn' + (on ? ' on' : ''), function () {
          var i = p.settings.tables.indexOf(t);
          if (i >= 0) { if (p.settings.tables.length > 1) p.settings.tables.splice(i, 1); else U.toast('Cần chọn ít nhất một bảng.'); }
          else { p.settings.tables.push(t); p.settings.tables.sort(); }
          TT.store.save(); render(container, opts);
        }, { 'aria-pressed': on ? 'true' : 'false' }));
      })(t);
    }
    set.appendChild(tRow);
    var mRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Thời lượng một lượt' }, [h('span', { class: 'row-label', text: 'Thời lượng một lượt' })]);
    [5, 6, 8, 10, 15].forEach(function (m) {
      mRow.appendChild(btn(m + ' phút', 'chip-btn' + (p.settings.sessionMin === m ? ' on' : ''), function () { p.settings.sessionMin = m; TT.store.save(); render(container, opts); }, { 'aria-pressed': p.settings.sessionMin === m ? 'true' : 'false' }));
    });
    set.appendChild(mRow);
    set.appendChild(toggle('Luyện phép chia (mở Nhà ăn, chỉ chia hết theo bảng đang luyện)', p.settings.division, function (v) { p.settings.division = v; TT.store.save(); opts.onChange && opts.onChange(); }));
    set.appendChild(toggle('Âm thanh', p.settings.sound, function (v) { p.settings.sound = v; if (pid === data.active) TT.audio.setEnabled(v); TT.store.save(); opts.onChange && opts.onChange(); }));
    set.appendChild(toggle('Nhạc nền và tiếng chim theo từng cảnh', p.settings.ambience !== false, function (v) { p.settings.ambience = v; if (pid === data.active) TT.audio.setAmbience(v); TT.store.save(); opts.onChange && opts.onChange(); }));
    set.appendChild(toggle('Giảm chuyển động', p.settings.reducedMotion, function (v) { p.settings.reducedMotion = v; TT.store.save(); opts.onChange && opts.onChange(); }));
    wrap.appendChild(set);

    // ---- Tên trường trên cổng (dùng chung cho mọi nhân vật trên máy này) ----
    var S = TT.store;
    var schoolIn = h('input', { id: 'school-name', type: 'text', maxlength: '40', value: S.schoolName(), autocomplete: 'off', autocapitalize: 'words', placeholder: S.DEFAULT_SCHOOL, 'aria-describedby': 'school-help' });
    var saveSchool = function (name) {
      S.setSchool(name);
      TT.world.destroy(); // dựng lại cảnh để biển cổng hiện tên mới
      opts.onChange && opts.onChange();
      U.toast(S.schoolCustom() ? 'Đã đổi tên trường thành “' + S.schoolName() + '”.' : 'Đã dùng lại tên trường mặc định.');
      render(container, opts);
    };
    schoolIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveSchool(schoolIn.value); });
    var schoolRow = h('div', { class: 'row-actions wrap left' }, [btn('Lưu tên trường', 'primary', function () { saveSchool(schoolIn.value); }, { id: 'btn-school-save' })]);
    if (S.schoolCustom()) schoolRow.appendChild(btn('Dùng tên mặc định', 'ghost', function () { saveSchool(''); }, { id: 'btn-school-reset' }));
    wrap.appendChild(h('section', { class: 'p-card' }, [
      h('h2', { text: 'Tên trường của con' }),
      h('label', { class: 'field' }, [h('span', { text: 'Tên hiện trên cổng trường' }), schoolIn,
        h('small', { id: 'school-help', text: 'Ba mẹ gõ tên trường con đang học (tối đa 40 chữ) để game gần gũi hơn. Tên này dùng cho mọi nhân vật trên máy này.' })]),
      schoolRow,
      S.schoolCustom() ? h('p', { class: 'muted small', text: 'Khi dùng tên trường riêng, phần “Trường em, quê em” (kể về xã Trường Lâm, Thanh Hoá) trong chuyến tham quan và bộ câu đố đi kèm được ẩn đi, vì chỉ đúng với trường mặc định.' }) : null
    ]));

    // ---- Cài ra màn hình chính ----
    var isApp = TT.install.installed();
    wrap.appendChild(h('section', { class: 'p-card' }, [
      h('h2', { text: 'Cài game ra màn hình chính' }),
      h('p', { text: isApp ? 'Game đang chạy như một ứng dụng: con chạm vào biểu tượng Cửu chương trên màn hình là vào chơi, không cần gõ địa chỉ.'
        : 'Cài một lần, sau đó con chỉ cần chạm vào biểu tượng Cửu chương trên màn hình chính là vào chơi: toàn màn hình, không có thanh địa chỉ và dùng được cả khi không có mạng. Nút bên dưới tự nhận biết loại máy (iPhone, iPad, Android, máy tính) và chỉ đúng cách cài cho máy đó.' }),
      isApp ? null : TT.install.button('primary', 'Cài app trên máy này'),
      h('p', { class: 'muted small', text: 'Tiến độ lưu riêng trên từng máy. Trên iPhone/iPad, bản đã cài có kho lưu riêng với Safari, nên nên cài trước rồi cho con chơi trong bản đã cài.' })
    ]));

    // ---- Xóa tiến độ ----
    wrap.appendChild(h('section', { class: 'p-card danger-zone' }, [
      h('h2', { text: 'Xóa tiến độ' }),
      h('p', { text: 'Xóa toàn bộ tiến độ, ngôi sao, đồ trang trí và thiết lập của ' + pname + '. Hồ sơ còn lại không bị ảnh hưởng.' }),
      btn('Xóa tiến độ của ' + pname, 'danger', function () {
        U.confirmBox('Xóa tiến độ?', 'Toàn bộ tiến độ của ' + pname + ' sẽ bị xóa và không khôi phục được.', 'Xóa tiến độ', function () {
          TT.store.resetProfile(pid);
          U.toast('Đã xóa tiến độ của ' + pname + '.');
          opts.onChange && opts.onChange();
          render(container, opts);
        });
      })
    ]));
    if (p.custom) {
      wrap.appendChild(h('section', { class: 'p-card danger-zone' }, [
        h('h2', { text: 'Xóa nhân vật' }),
        h('p', { text: pname + ' là nhân vật do bé tự tạo. Xóa nhân vật sẽ xóa luôn tên, hình dáng và toàn bộ tiến độ của nhân vật này.' }),
        btn('Xóa nhân vật ' + pname, 'danger', function () {
          U.confirmBox('Xóa nhân vật?', 'Nhân vật ' + pname + ' cùng toàn bộ tiến độ sẽ bị xóa và không khôi phục được.', 'Xóa nhân vật', function () {
            TT.store.removeProfile(pid);
            U.toast('Đã xóa nhân vật ' + pname + '.');
            opts.profileId = null;
            opts.onChange && opts.onChange();
            render(container, opts);
          });
        })
      ]));
    }
    wrap.appendChild(h('p', { class: 'muted small', text: 'Mọi dữ liệu chỉ lưu trên thiết bị này (localStorage). Game không gửi dữ liệu ra ngoài, không quảng cáo, không mua hàng.' }));
  }

  function stat(n, label) { return h('div', { class: 'stat' }, [h('b', { text: String(n) }), h('span', { text: label })]); }

  function toggle(label, value, onChange) {
    var id = 'tg' + Math.random().toString(36).slice(2, 8);
    var input = h('input', { type: 'checkbox', id: id, role: 'switch' });
    input.checked = !!value;
    input.addEventListener('change', function () { onChange(input.checked); });
    return h('label', { class: 'toggle', for: id }, [input, h('span', { class: 'track' }), h('span', { class: 'tl', text: label })]);
  }

  TT.parent = { gate: gate, render: render };
})(window);
