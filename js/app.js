/* app.js: điều phối màn hình, luồng chơi, phần thưởng, nhịp nghỉ, toàn màn hình, PWA. */
(function (root) {
  'use strict';
  var TT = root.TT;
  var E = TT.engine, A = TT.art, U = TT.ui, h = U.h, btn = U.btn, S = TT.store;

  var app = {
    screen: 'title',
    selected: null,          // nhân vật đang chọn ở màn hình đầu
    sessionMs: 0,            // thời gian chơi trong lượt (chỉ tính khi đang hiển thị)
    currentRun: null,
    missionSeq: 0,
    rewarded: {},
    npcTalk: {},
    parentBack: 'title',
    scene: 'yard'            // cảnh đang đi lại: 'yard' (sân trường) hoặc 'classroom' (trong lớp)
  };
  TT.app = app;

  var el = {};
  function $(id) { return document.getElementById(id); }

  /* ---------------- Khung màn hình ---------------- */
  function show(name) {
    if (name === 'title' && app.updateReady) { app.updateReady = false; reloadForUpdate(); }
    app.screen = name;
    document.body.setAttribute('data-screen', name);
    ['title', 'setup', 'school', 'act', 'parent'].forEach(function (n) {
      var s = $('s-' + n);
      var visible = n === name || (name === 'act' && n === 'school');
      s.hidden = !visible;
      s.setAttribute('aria-hidden', visible && !(name === 'act' && n === 'school') ? 'false' : 'true');
    });
    document.body.classList.toggle('solving', name === 'act');
    U.closeModal();
    if (name === 'school' && TT.world.state) setTimeout(function () { TT.world.relayout(); }, 30);
    // âm thanh nền theo màn hình (màn hình hoạt động tự chọn trong openAct)
    if (name === 'title' || name === 'setup') TT.audio.scene('title');
    else if (name === 'school') TT.audio.scene(app.scene);
    else if (name === 'parent') TT.audio.scene(null);
  }

  function applyProfileSettings() {
    var p = S.profile();
    var reduced = p ? p.settings.reducedMotion : false;
    document.body.classList.toggle('reduced-motion', !!reduced);
    TT.audio.setEnabled(p ? p.settings.sound : S.data.sound !== false);
    TT.audio.setAmbience(p ? p.settings.ambience !== false : true);
  }

  /* Chuyển cảnh: mờ dần rồi mới dựng cảnh mới */
  function fade(fn) {
    if (U.reducedMotion()) return fn();
    var f = $('fade');
    if (!f) { f = h('div', { id: 'fade', class: 'fade' }); $('app').appendChild(f); }
    f.classList.add('on');
    setTimeout(function () { fn(); setTimeout(function () { f.classList.remove('on'); }, 80); }, 190);
  }

  function charName(id) { return S.nameOf(id || S.data.active); }
  function backLabel() { return app.scene === 'classroom' ? 'Về lớp học' : 'Về sân trường'; }

  /* ---------------- Màn hình đầu: cổng trường ---------------- */
  function renderTitle() {
    var s = $('s-title');
    s.innerHTML = '';
    var data = S.data;
    var ids = S.list();
    if (ids.indexOf(app.selected) < 0) app.selected = ids.indexOf(data.active) >= 0 ? data.active : 'tien';
    TT.audio.setEnabled(data.sound !== false);
    TT.audio.setAmbience(true);
    document.body.classList.remove('reduced-motion');

    var bg = h('div', { class: 'title-bg', html: '<svg viewBox="0 150 2400 1350" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + A.schoolScene() + '</svg>' });
    s.appendChild(bg);

    var topbar = h('div', { class: 'title-top' }, [
      U.iconBtn(data.sound !== false ? 'sound' : 'mute', data.sound !== false ? 'Tắt âm thanh' : 'Bật âm thanh', function () {
        data.sound = data.sound === false; S.save(); TT.audio.setEnabled(data.sound); renderTitle();
      }),
      U.iconBtn('fullscreen', 'Toàn màn hình', toggleFullscreen),
      btn(h('span', { html: A.icon('hint') + '<span>Hướng dẫn</span>' }), 'pill', guide, { id: 'btn-guide', 'aria-label': 'Hướng dẫn chơi' }),
      TT.install.button('pill'), // ẩn khi game đã chạy như một ứng dụng
      btn(h('span', { html: A.icon('parent') + '<span>Ba mẹ</span>' }), 'pill', function () { TT.parent.gate(function () { openParent('title'); }); })
    ]);
    s.appendChild(topbar);

    var card = h('div', { class: 'title-card' });
    card.appendChild(h('h1', { class: 'logo' }, [h('span', { class: 'logo-b', text: 'Trường học' }), h('span', { class: 'logo-a', text: 'Cửu chương' })]));
    card.appendChild(h('p', { class: 'pick-label', text: 'Hôm nay ai đi học nào?' }));
    // Hai nhân vật có sẵn, các nhân vật bé tự tạo, rồi tới ô "Tạo nhân vật"
    var canAdd = S.customIds().length < S.MAX_CUSTOM;
    var many = ids.length + (canAdd ? 1 : 0) > 2;
    var picks = h('div', { class: 'char-picks' + (many ? ' many' : ''), role: 'radiogroup', 'aria-label': 'Chọn nhân vật' });
    var selBtn = null;
    ids.forEach(function (id) {
      var prof = data.profiles[id];
      var look = prof ? prof.look : { hair: S.CHARACTERS[id].hair, bag: S.CHARACTERS[id].bag, acc: S.CHARACTERS[id].acc };
      var b = btn(h('span', { class: 'char-card', html: A.girlSVG(look) + '<b>' + escapeHtml(charName(id)) + '</b>' + (S.hasProgress(id) ? '<small>Đã có tiến độ</small>' : '<small>Bắt đầu mới</small>') }),
        'char-pick' + (app.selected === id ? ' on' : ''), function () { app.selected = id; renderTitle(); },
        { role: 'radio', 'aria-checked': app.selected === id ? 'true' : 'false', 'data-char': id });
      if (app.selected === id) selBtn = b;
      picks.appendChild(b);
    });
    if (canAdd) {
      picks.appendChild(btn(h('span', { class: 'char-card', html: '<span class="char-plus" aria-hidden="true">+</span><b>Tạo nhân vật</b><small>mang tên của con</small>' }),
        'char-pick add', function () { TT.audio.unlock(); renderSetup(true); }, { id: 'btn-new-char', 'aria-label': 'Tạo nhân vật mới mang tên của con' }));
    }
    card.classList.toggle('wide', many);
    card.appendChild(picks);
    if (many && selBtn) setTimeout(function () { picks.scrollLeft = selBtn.offsetLeft - (picks.clientWidth - selBtn.offsetWidth) / 2; }, 0);
    var actions = h('div', { class: 'title-actions' });
    actions.appendChild(btn('Vào trường', 'primary big', function () { enterAs(app.selected); }, { id: 'btn-enter' }));
    if (data.active && S.hasProgress(data.active)) {
      actions.appendChild(btn('Tiếp tục chơi (' + charName(data.active) + ')', 'secondary big', function () { enterAs(data.active); }, { id: 'btn-continue' }));
    }
    card.appendChild(actions);
    s.appendChild(card);
  }

  function enterAs(id) {
    TT.audio.unlock();
    S.setActive(id);
    var p = S.profile();
    applyProfileSettings();
    app.viaRoad = true; // vào từ cổng game: đi qua đường tới trường trước
    if (!p.setupDone) return renderSetup();
    enterRoad();
  }

  /* ---------------- Tạo/sửa nhân vật: tên, ngoại hình, thú đồng hành ----------------
   * create = true: bé tự tạo nhân vật mới mang tên mình; chỉ lưu khi bấm "Xong". */
  function renderSetup(create) {
    var p = create ? S.newProfile(S.newId(), { name: '', boy: false }) : S.profile();
    var s = $('s-setup');
    s.innerHTML = '';
    var draft = { name: p.name, nickname: p.nickname, look: Object.assign({}, p.look), pet: p.pet };
    var wrap = h('div', { class: 'setup' });
    var preview = h('div', { class: 'setup-preview' });
    function upd() {
      preview.innerHTML = A.girlSVG(draft.look, 'char wave-once') + A.petSVG(draft.pet, 0, 'pet small');
      preview.appendChild(h('b', { text: S.cleanName(draft.name) || 'Tên của con' }));
    }
    upd();
    var form = h('div', { class: 'setup-form' });
    form.appendChild(h('h1', { text: create ? 'Tạo nhân vật của con' : 'Chuẩn bị đi học cùng ' + p.name }));
    var nameInput = null;
    if (p.custom) {
      nameInput = h('input', { id: 'char-name', type: 'text', maxlength: '24', value: draft.name, autocomplete: 'off', autocapitalize: 'words', placeholder: 'Ví dụ: Ngọc Linh', 'aria-describedby': 'name-help' });
      nameInput.addEventListener('input', function () { draft.name = nameInput.value; upd(); });
      form.appendChild(h('label', { class: 'field', for: 'char-name' }, [h('span', { text: 'Tên của con' }), nameInput,
        h('small', { id: 'name-help', text: 'Con gõ tên mình để các bạn và cô gọi đúng tên. Tên chỉ lưu trên máy này.' })]));
    } else {
      var nick = h('input', { id: 'nick', type: 'text', maxlength: '16', value: draft.nickname, autocomplete: 'off', 'aria-describedby': 'nick-help' });
      nick.addEventListener('input', function () { draft.nickname = nick.value; });
      form.appendChild(h('label', { class: 'field', for: 'nick' }, [h('span', { text: 'Biệt danh của con' }), nick,
        h('small', { id: 'nick-help', text: 'Không cần tên thật. Để trống sẽ là "Bạn nhỏ".' })]));
    }

    function choiceRow(label, items, cur, onPick) {
      var row = h('div', { class: 'chip-row', role: 'group', 'aria-label': label }, [h('span', { class: 'row-label', text: label })]);
      items.forEach(function (it) {
        row.appendChild(btn(it.node || it.label, 'chip-btn' + (it.value === cur() ? ' on' : '') + (it.cls ? ' ' + it.cls : ''), function () {
          onPick(it.value); upd();
          row.querySelectorAll('.chip-btn').forEach(function (b, i) { b.classList.toggle('on', items[i].value === cur()); b.setAttribute('aria-pressed', items[i].value === cur() ? 'true' : 'false'); });
        }, { 'aria-pressed': it.value === cur() ? 'true' : 'false', 'aria-label': it.label }));
      });
      return row;
    }
    var colors = [['#ff8fab', 'Hồng'], ['#7cc6fe', 'Xanh trời'], ['#ffd166', 'Vàng'], ['#95d5b2', 'Xanh lá'], ['#b8a1ff', 'Tím']];
    var rows = h('div', { class: 'setup-rows' });
    /* Kiểu tóc và phụ kiện khác nhau giữa bạn nam và bạn nữ nên vẽ lại khi đổi */
    function drawRows(focusGender) {
      rows.innerHTML = '';
      var boy = !!draft.look.boy;
      if (p.custom) {
        var g = choiceRow('Con là', [{ label: 'Bạn nữ', value: false }, { label: 'Bạn nam', value: true }],
          function () { return !!draft.look.boy; }, function (v) { if (v !== !!draft.look.boy) { draft.look.boy = v; drawRows(true); } });
        rows.appendChild(g);
        if (focusGender) { var on = g.querySelector('.chip-btn.on'); if (on) on.focus({ preventScroll: true }); }
      }
      rows.appendChild(choiceRow('Kiểu tóc', boy ? [{ label: 'Tóc ngắn', value: 0 }, { label: 'Đầu đinh', value: 1 }, { label: 'Tóc mái lệch', value: 2 }]
        : [{ label: 'Hai bím', value: 0 }, { label: 'Tóc ngắn', value: 1 }, { label: 'Tóc dài', value: 2 }],
        function () { return draft.look.hair; }, function (v) { draft.look.hair = v; }));
      rows.appendChild(choiceRow('Màu ba lô', colors.map(function (c) { return { label: c[1], value: c[0], node: h('span', { class: 'swatch', style: 'background:' + c[0] }), cls: 'swatch-btn' }; }),
        function () { return draft.look.bag; }, function (v) { draft.look.bag = v; }));
      rows.appendChild(choiceRow('Phụ kiện', boy ? [{ label: 'Không', value: 0 }, { label: 'Mũ lưỡi trai', value: 1 }, { label: 'Kính tròn', value: 2 }, { label: 'Huy hiệu sao', value: 3 }]
        : [{ label: 'Không', value: 0 }, { label: 'Nơ hồng', value: 1 }, { label: 'Bờm vàng', value: 2 }, { label: 'Kẹp ngôi sao', value: 3 }],
        function () { return draft.look.acc; }, function (v) { draft.look.acc = v; }));
      rows.appendChild(choiceRow('Thú đồng hành', [{ label: 'Mèo Mít', value: 'mit' }, { label: 'Thỏ Bông', value: 'bong' }, { label: 'Rồng nhỏ Đậu', value: 'dau' }],
        function () { return draft.pet; }, function (v) { draft.pet = v; }));
    }
    drawRows();
    form.appendChild(rows);
    form.appendChild(h('div', { class: 'row-actions' }, [
      btn('Quay lại', 'ghost', function () { show('title'); renderTitle(); }),
      btn('Xong, vào trường!', 'primary big', function () {
        if (p.custom) {
          var name = S.cleanName(draft.name);
          if (!name) { U.toast('Con gõ tên của mình trước nhé.'); nameInput.focus(); return; }
          if (S.nameTaken(name, p.id)) { U.toast('Đã có nhân vật tên ' + name + ' rồi. Con chọn nhân vật đó ở cổng trường, hoặc gõ thêm một chữ nhé.', 4200); nameInput.focus(); return; }
          var renamed = name !== p.name;
          p.name = name; p.nickname = name;
          if (renamed) S.rollClassmates(p, true); // không gặp lại chính mình trong lớp
        } else {
          p.nickname = (draft.nickname || '').trim().slice(0, 16) || 'Bạn nhỏ';
        }
        p.look = draft.look; p.pet = draft.pet; p.setupDone = true;
        if (create) { S.addProfile(p); app.selected = p.id; }
        S.save();
        if (app.viaRoad) enterRoad(); else enterSchool();
      }, { id: 'btn-setup-done' })
    ]));
    wrap.appendChild(preview); wrap.appendChild(form);
    s.appendChild(wrap);
    show('setup');
    if (create && nameInput) nameInput.focus({ preventScroll: true });
  }

  /* ---------------- Sân trường và lớp học ---------------- */
  function buildWorld(at, resume) {
    TT.world.build($('map'), { scene: app.scene, at: at, resume: resume, onZone: openZone, onNpc: talkNpc, onEvent: worldEvent });
  }

  /* Sang đường đúng luật (chờ đèn xanh, đi trên vạch): lần đầu mỗi ngày được thưởng một ngôi sao */
  function worldEvent(name) {
    if (name !== 'crossed') return;
    var p = S.profile(), day = S.today(p);
    if (day.crossed) return U.toast('Con sang đường rất đúng luật!');
    day.crossed = true; p.stars += 1; S.save();
    TT.audio.play('reward');
    renderHud();
    U.toast('Con chờ đèn xanh và đi trên vạch kẻ đường: thưởng 1 ngôi sao!', 4200);
  }

  /* Đường tới trường: bé đi từ nhà, qua làng quê, chờ đèn xanh sang đường rồi mới vào cổng trường */
  function enterRoad() {
    var p = S.profile();
    S.rollClassmates(p);
    p.lastPlayed = Date.now(); S.save();
    applyProfileSettings();
    app.scene = 'road'; app.sessionMs = 0;
    show('school');
    renderHud(); renderQuickbar();
    buildWorld();
    setTimeout(function () { if (app.scene === 'road') TT.world.greet('Mình đi học thôi! Đi dọc vỉa hè tới vạch sang đường nhé.'); }, 600);
  }

  function enterSchool(skipGreeting) {
    var p = S.profile();
    S.rollClassmates(p); // hôm nay gặp những bạn nào
    p.lastPlayed = Date.now(); S.save();
    applyProfileSettings();
    app.scene = 'yard';
    show('school');
    renderHud();
    renderQuickbar();
    if (skipGreeting) return buildWorld(null, true);
    // Đi học: bạn nhỏ bước qua cổng trường trong tiếng trống, rồi đi vào giữa sân
    app.sessionMs = 0;
    buildWorld({ x: 1250, y: 1408, back: true });
    TT.audio.play('drum');
    setTimeout(function () { if (app.screen === 'school' && app.scene === 'yard') TT.world.walkTo(1250, 1020); }, 350);
    setTimeout(function () { TT.world.greet('Chào ' + charName() + '! Hôm nay mình khám phá điều gì nhỉ?'); }, 900);
    if (!p.warmupDone) {
      setTimeout(function () {
        if (app.screen !== 'school' || app.scene !== 'yard') return;
        U.say('Cô Hằng', A.adultSVG('hang'), 'Chào con! Cô Hằng đây. Mình làm quen với lớp học bằng 5 câu nhẹ nhàng nhé. Không phải kiểm tra đâu!',
          [{ label: 'Làm quen nào', fn: function () { startMission('warmup'); } }]);
      }, 2600);
    }
  }

  function changeScene(scene, at, after, sfx) {
    TT.audio.play(sfx || 'door');
    fade(function () {
      if (app.currentRun) { app.currentRun.destroy(); app.currentRun = null; }
      app.scene = scene;
      show('school');
      renderHud(); renderQuickbar();
      buildWorld(at);
      if (after) after();
    });
  }
  /* Vào lớp: bước qua cửa, chào cô rồi tự đi tới bảng, bàn học... */
  function enterRoom() {
    if (app.scene === 'classroom' && TT.world.state) return closeAct();
    changeScene('classroom', { x: 1450, y: 500 }, function () {
      setTimeout(function () { if (app.scene === 'classroom') TT.world.greet('Con chào cô ạ!'); }, 350);
    });
  }
  function leaveRoom() { changeScene('yard', { x: 1140, y: 735 }); }

  function renderHud() {
    var p = S.profile();
    var hud = $('hud');
    hud.innerHTML = '';
    var me = btn(h('span', { class: 'me', html: '<span class="me-av">' + A.girlSVG(p.look) + '</span><span class="me-txt"><b>' + escapeHtml(charName()) + '</b>' + (p.nickname !== p.name ? '<small>' + escapeHtml(p.nickname) + '</small>' : '') + '</span>' }), 'me-btn', function () { app.viaRoad = false; renderSetup(); }, { 'aria-label': 'Đổi trang phục của ' + charName() });
    hud.appendChild(me);
    hud.appendChild(h('span', { class: 'pill stars', 'aria-label': p.stars + ' ngôi sao', html: A.obj('star') + '<b id="star-count">' + p.stars + '</b>' }));
    hud.appendChild(h('span', { class: 'pill treats', 'aria-label': p.treats + ' bánh thưởng cho thú', html: A.icon('treat') + '<b>' + p.treats + '</b>' }));
    hud.appendChild(h('span', { class: 'spacer' }));
    hud.appendChild(U.iconBtn('home', 'Về cổng trường', function () { TT.world.destroy(); show('title'); renderTitle(); }));
    if (app.scene === 'classroom') hud.appendChild(btn(h('span', { html: A.icon('door') + '<span class="hud-out">Ra sân</span>' }), 'pill', leaveRoom, { id: 'btn-leave-room', 'aria-label': 'Ra sân trường' }));
    hud.appendChild(btn(h('span', { html: A.icon('walk') + '<span>Đi nhanh</span>' }), 'pill', quickMenu, { id: 'btn-quick', 'aria-label': 'Đi nhanh tới các khu' }));
    hud.appendChild(U.iconBtn(p.settings.sound ? 'sound' : 'mute', p.settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh', function () {
      p.settings.sound = !p.settings.sound; S.save(); applyProfileSettings(); renderHud();
    }));
    hud.appendChild(U.iconBtn('motion', p.settings.reducedMotion ? 'Bật lại chuyển động' : 'Giảm chuyển động', function () {
      p.settings.reducedMotion = !p.settings.reducedMotion; S.save(); applyProfileSettings(); renderHud();
      U.toast(p.settings.reducedMotion ? 'Đã giảm chuyển động.' : 'Đã bật lại chuyển động.');
    }, p.settings.reducedMotion ? 'on' : ''));
    hud.appendChild(U.iconBtn('fullscreen', 'Toàn màn hình', toggleFullscreen));
    hud.appendChild(U.iconBtn('parent', 'Góc ba mẹ', function () { TT.parent.gate(function () { openParent('school'); }); }));
  }

  function refreshCounters() {
    if (app.screen === 'school' || app.screen === 'act') renderHud();
    var sc = document.querySelector('.act-stars b'); if (sc) sc.textContent = S.profile().stars;
  }

  function renderQuickbar() {
    var q = $('quickbar');
    q.innerHTML = '';
    q.appendChild(h('span', { class: 'qb-label', text: 'Đi nhanh' }));
    var row = h('div', { class: 'qb-row' });
    quickEntries().forEach(function (e) {
      row.appendChild(btn(h('span', { class: 'qb', html: A.icon(e.icon) + '<span>' + e.name + '</span>' }), 'qb-btn', e.fn, { 'data-zone': e.id }));
    });
    q.appendChild(row);
  }

  /* Các nơi đi nhanh của cảnh đang đứng */
  function quickEntries() {
    var p = S.profile(), list = [];
    function add(id, icon, name, fn) { list.push({ id: id, icon: icon, name: name, fn: fn }); }
    if (app.scene === 'road') {
      add('rd-gate', 'classroom', 'Vào trường', function () { openZone('rd-gate'); });
      add('traffic', 'walk', 'An toàn giao thông', function () { startSubject('life', 'giaothong'); });
      add('guide', 'hint', 'Hướng dẫn chơi', guide);
      return list;
    }
    add('subjects', 'book', 'Môn học', subjectMenu);
    if (app.scene === 'classroom') {
      add('cls-desk', 'desk', 'Luyện cùng cô Hằng', function () { openZone('cls-desk'); });
    } else {
      TT.world.ZONES.forEach(function (z) {
        if (z.needDiv && !p.settings.division) return;
        add(z.id, z.icon, z.name, function () { openZone(z.id); });
      });
    }
    add('review', 'review', 'Ôn lại', function () { startMission('review'); });
    add('tour', 'map', 'Tham quan trường', startTour);
    if (app.scene === 'classroom') add('cls-door', 'door', 'Ra sân', leaveRoom);
    add('guide', 'hint', 'Hướng dẫn chơi', guide);
    return list;
  }

  function talkNpc(n) {
    var p = S.profile();
    var lines = TT.act.npcLines(n, p);
    var i = app.npcTalk[n.id] || 0; app.npcTalk[n.id] = i + 1;
    var line = lines[i % lines.length];
    var name = n.name || p.classmates[n.idx];
    var avatar = n.kind === 'adult' ? A.adultSVG(n.art) : A.kidSVG(name, n.idx);
    var actions = [];
    if (n.id === 'hang') {
      actions.push({ label: 'Chọn môn học', fn: subjectMenu });
      actions.push({ label: 'Luyện cửu chương', cls: 'secondary', fn: function () { startMission('classroom'); } });
    }
    if (n.id === 'lan') actions.push({ label: 'Học Tiếng Anh', fn: function () { startSubject('english'); } });
    if (n.id === 'nam') {
      actions.push({ label: 'Học Khoa học', fn: function () { startSubject('science'); } });
      actions.push({ label: 'Nhiệm vụ hôm nay', cls: 'secondary', fn: function () { openZone('board'); } });
    }
    if (n.id === 'hoa') actions.push({ label: 'Vào thư viện', fn: function () { openZone('library'); } });
    if (n.id === 'congan') actions.push({ label: 'Học an toàn giao thông', fn: function () { startSubject('life', 'giaothong'); } });
    if (n.id === 'tam') {
      actions.push({ label: 'Học ăn uống an toàn', fn: function () { startSubject('life', 'anuong'); } });
      if (p.settings.division) actions.push({ label: 'Chia phần bánh', cls: 'secondary', fn: function () { startMission('canteen'); } });
    }
    if (n.id === 'k1') actions.push({ label: 'Chuyền bóng', fn: function () { openZone('sports'); } });
    if (n.id === 'k0') actions.push({ label: 'Thu hoạch ở vườn', fn: function () { openZone('garden'); } });
    U.say(name, avatar, line, actions);
  }

  /* ---------------- Màn hình hoạt động ---------------- */
  /* amb: âm thanh nền của hoạt động; focus: đang giải toán nên âm thanh nền nhỏ và thưa hơn */
  function openAct(title, renderFn, amb, focus) {
    if (app.currentRun) { app.currentRun.destroy(); app.currentRun = null; }
    var s = $('s-act');
    s.innerHTML = '';
    var head = h('header', { class: 'act-head' }, [
      btn(h('span', { html: A.icon('back') + '<span>' + backLabel() + '</span>' }), 'back-btn', closeAct, { id: 'btn-back' }),
      h('h1', { text: title }),
      h('span', { class: 'pill act-stars', html: A.obj('star') + '<b>' + S.profile().stars + '</b>' })
    ]);
    var body = h('div', { class: 'act-body' });
    s.appendChild(head); s.appendChild(body);
    show('act');
    TT.audio.scene(amb || app.scene, { focus: !!focus, pet: S.profile().pet });
    renderFn(body);
    body.scrollTop = 0;
    var h1 = head.querySelector('h1'); h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true });
  }

  function closeAct() {
    if (app.currentRun) { app.currentRun.destroy(); app.currentRun = null; }
    show('school');
    renderHud(); renderQuickbar();
    if (!TT.world.state) buildWorld(null, true);
  }

  function openZone(id) {
    var p = S.profile();
    switch (id) {
      case 'classroom': return enterRoom();
      case 'cls-board': return subjectMenu();
      case 'cls-5dieu': return fiveTeachings();
      case 'cls-photo': return wallPhoto();
      case 'cls-desk': return startMission('classroom');
      case 'cls-door': return leaveRoom();
      case 'library': return startMission('library');
      case 'garden': return startMission('garden');
      case 'sports': return startMission('sports');
      case 'canteen': return canteenMenu();
      case 'tour': return startTour();
      case 'rd-gate': TT.audio.play('whoosh'); return fade(function () { enterSchool(); });
      case 'road': return changeScene('road', { x: 2250, y: 650 }, null, 'whoosh');
      case 'studio': return openAct('Tô màu nhân vật', function (body) {
        TT.act.studio(body, { onChange: function () { refreshCounters(); TT.world.destroy(); }, onDone: closeAct });
      }, 'yard');
      case 'art': return artMenu();
      case 'decor': return openAct('Phòng Mỹ thuật: trang trí đảo', function (body) { TT.act.art(body, { onChange: refreshCounters, onIsland: function () { openZone('portal'); } }); }, 'island');
      case 'pets': return openAct('Góc thú cưng', function (body) {
        TT.act.pets(body, { onChange: function () { refreshCounters(); TT.world.destroy(); }, onMission: function (t) { startMission(t); } });
      }, 'pets');
      case 'board': return openAct('Bảng tin', function (body) {
        TT.act.board(body, {
          onQuest: function (q) { startMission(q.game.theme, { tables: [q.table], quest: true }); },
          onReview: function () { startMission('review'); }
        });
      }, 'yard', true);
      case 'portal': return openAct('Đảo thú cưng', function (body) {
        TT.act.island(body, { onMission: function (t) { startMission(t); }, onArt: function () { openZone('decor'); } });
      }, 'island');
    }
  }

  /* ---------------- Các môn học lớp 4 (subjects.js) ---------------- */
  function openLearn() {
    openAct('Bảng lớp: cửu chương bằng hình', function (body) {
      TT.act.learn(body, { onPractice: function (tables) { startMission('classroom', { tables: tables }); }, onChange: refreshCounters });
    }, 'classroom', true);
  }

  /* Bảng "Hôm nay con học gì?" */
  function subjectMenu() {
    var box = h('div', { class: 'subj-menu' }, [h('h2', { text: 'Hôm nay con học gì?' })]);
    var grid = h('div', { class: 'subj-grid' });
    function card(id, em, name, note, fn) {
      grid.appendChild(btn(h('span', {}, [h('span', { class: 'em', text: em }), h('b', { text: name }), h('small', { text: note })]), 'subj-card',
        function () { U.closeModal(); fn(); }, { 'data-subj': id }));
    }
    card('learn', '✖️', 'Cửu chương', 'học bằng hình trên bảng', openLearn);
    TT.subjects.available().forEach(function (s) {
      card(s.id, s.icon, s.name, 'cùng ' + s.tname.charAt(0).toLowerCase() + s.tname.slice(1), function () { startSubject(s.id); });
    });
    box.appendChild(grid);
    box.appendChild(h('div', { class: 'row-actions' }, [btn('Để sau', 'ghost', U.closeModal)]));
    U.modal(box, { cls: 'wide' });
  }

  /* Chọn chủ đề của một môn (hoặc trộn tất cả) */
  function pickTopic(sub, cb) {
    var p = S.profile();
    var box = h('div', { class: 'topic-menu' }, [h('h2', { text: sub.icon + ' ' + sub.name }), h('p', { text: 'Con chọn một chủ đề, hoặc trộn tất cả nhé.' })]);
    var grid = h('div', { class: 'topic-grid' });
    function add(tid, em, name, note, cls) {
      grid.appendChild(btn(h('span', { class: 'topic-in' }, [h('span', { class: 'em', text: em }), h('span', { class: 'tn' }, [h('b', { text: name }), note ? h('small', { text: note }) : null])]),
        'topic-btn ' + cls, function () { U.closeModal(); cb(tid); }, { 'data-topic': tid || 'all' }));
    }
    add(null, '🎲', 'Trộn tất cả chủ đề', '', 'all');
    sub.topics.forEach(function (t) {
      var st = TT.subjects.stats(p, sub.id, t.id), done = st.right + st.wrong;
      add(t.id, t.icon, t.name, st.total && !t.make ? (st.seen ? 'đã gặp ' + st.seen + '/' + st.total + ' câu' : st.total + ' câu') : (done ? 'đã làm ' + done + ' câu' : 'đề mới mỗi lần'), '');
    });
    box.appendChild(grid);
    box.appendChild(h('div', { class: 'row-actions' }, [btn('Để sau', 'ghost', U.closeModal)]));
    U.modal(box, { cls: 'wide' });
  }

  /* topicId: undefined = hỏi bé chọn chủ đề; null = trộn tất cả */
  function startSubject(sid, topicId) {
    var sub = TT.subjects.get(sid);
    if (!sub) return;
    if (topicId === undefined) return pickTopic(sub, function (t) { startSubject(sid, t); });
    var topic = sub.topics.filter(function (t) { return t.id === topicId; })[0];
    var id = ++app.missionSeq;
    openAct(sub.name + (topic ? ' · ' + topic.name : ''), function (body) {
      app.currentRun = TT.subjects.run(body, { subject: sid, topic: topicId, onDone: function (res) {
        finishMission(id, 'subj', res, { again: function () { startSubject(sid, topicId); } });
      } });
    }, 'classroom', true);
  }

  /* Xem to bức tranh treo phía trên bảng */
  function wallPhoto() {
    U.modal(h('div', { class: 'photo-box' }, [
      h('img', { src: 'img/lop-hoc-tranh.jpg', alt: 'Bức tranh treo phía trên bảng lớp',
        onerror: function (e) { var im = e.target; if (!/tranh-mac-dinh/.test(im.src)) im.src = 'img/tranh-mac-dinh.svg'; } }),
      h('div', { class: 'row-actions' }, [btn('Đóng', 'primary', U.closeModal)])
    ]), { cls: 'wide' });
  }

  /* ---------------- Chơi ngang màn hình ---------------- */
  /* Thanh "Đi nhanh" dạng bảng chọn, dùng khi màn hình ngang thấp (điện thoại) không đủ chỗ cho thanh ở dưới */
  function quickMenu() {
    var box = h('div', { class: 'quick-menu' }, [h('h2', { text: 'Con muốn đi đâu?' })]);
    var grid = h('div', { class: 'quick-grid' });
    quickEntries().forEach(function (e) {
      grid.appendChild(btn(h('span', { class: 'qb', html: A.icon(e.icon) + '<span>' + e.name + '</span>' }), 'qb-btn', function () { U.closeModal(); e.fn(); }, { 'data-zone': e.id }));
    });
    box.appendChild(grid);
    box.appendChild(h('div', { class: 'row-actions' }, [btn('Đóng', 'ghost', U.closeModal)]));
    U.modal(box, { cls: 'wide' });
  }

  /* Android: vào toàn màn hình rồi khoá hướng ngang. iPhone, iPad không cho trang web khoá hướng. */
  function lockLandscape() {
    var de = document.documentElement, req = de.requestFullscreen || de.webkitRequestFullscreen;
    var lock = function () {
      try { var r = root.screen.orientation.lock('landscape'); if (r && r.catch) r.catch(function () { /* máy không cho khoá */ }); } catch (e) { /* */ }
    };
    try {
      if (!req || document.fullscreenElement) return lock();
      var p = req.call(de);
      if (p && p.then) p.then(lock, function () { /* */ }); else lock();
    } catch (e) { /* */ }
  }
  /* Bảng nhắc "xoay ngang màn hình" (hiện bằng CSS khi máy cảm ứng đang cầm dọc) */
  function initRotateWall() {
    var canLock = !!(root.screen && root.screen.orientation && root.screen.orientation.lock) && /Android/i.test(navigator.userAgent);
    var lockBtn = $('rotate-lock'), skip = $('rotate-skip');
    if (lockBtn) { lockBtn.hidden = !canLock; lockBtn.addEventListener('click', lockLandscape); }
    if (skip) skip.addEventListener('click', function () { document.body.classList.add('portrait-ok'); });
  }

  /* Bảng 5 điều Bác Hồ dạy treo trong lớp */
  function fiveTeachings() {
    var lines = ['Yêu Tổ quốc, yêu đồng bào', 'Học tập tốt, lao động tốt', 'Đoàn kết tốt, kỷ luật tốt', 'Giữ gìn vệ sinh thật tốt', 'Khiêm tốn, thật thà, dũng cảm'];
    var ol = h('ol', { class: 'five-list' });
    lines.forEach(function (t, i) { ol.appendChild(h('li', {}, [h('span', { class: 'five-n', text: String(i + 1) }), h('span', { text: t })])); });
    var board = h('div', { class: 'five-board' }, [
      h('div', { class: 'five-star', 'aria-hidden': 'true', html: A.obj('star') }),
      h('h2', { text: '5 điều Bác Hồ dạy' }),
      h('p', { class: 'five-sub', text: 'thiếu niên, nhi đồng' }),
      ol
    ]);
    var row = h('div', { class: 'row-actions' });
    if (TT.audio.canSpeak()) row.appendChild(btn(h('span', { html: A.icon('speak') + ' Nghe đọc' }), 'ghost', function () { TT.audio.speak('Năm điều Bác Hồ dạy. ' + lines.map(function (t, i) { return 'Điều ' + (i + 1) + '. ' + t; }).join('. ') + '.'); }));
    row.appendChild(btn('Con nhớ rồi', 'primary big', U.closeModal));
    U.modal(h('div', { class: 'five' }, [board, row]), { cls: 'wide' });
  }

  /* Hai bảng chọn nhỏ: Phòng Mỹ thuật và Nhà ăn */
  function choiceMenu(title, cards) {
    var grid = h('div', { class: 'subj-grid two' });
    cards.forEach(function (c) {
      grid.appendChild(btn(h('span', {}, [h('span', { class: 'em', text: c.em }), h('b', { text: c.name }), h('small', { text: c.note })]), 'subj-card', function () { U.closeModal(); c.fn(); }, { 'data-pick': c.id }));
    });
    U.modal(h('div', { class: 'subj-menu' }, [h('h2', { text: title }), grid, h('div', { class: 'row-actions' }, [btn('Để sau', 'ghost', U.closeModal)])]), { cls: 'wide' });
  }
  function artMenu() {
    choiceMenu('Phòng Mỹ thuật', [
      { id: 'studio', em: '🎨', name: 'Tô màu nhân vật', note: 'tóc, áo, váy, giày theo ý con', fn: function () { openZone('studio'); } },
      { id: 'decor', em: '🏝️', name: 'Trang trí đảo', note: 'đổi ngôi sao lấy đồ trang trí', fn: function () { openZone('decor'); } }
    ]);
  }
  function canteenMenu() {
    var cards = [{ id: 'food', em: '🥗', name: 'Ăn uống an toàn', note: 'cùng cô Tâm chọn món sạch, lành', fn: function () { startSubject('life', 'anuong'); } }];
    if (S.profile().settings.division) cards.push({ id: 'div', em: '🍪', name: 'Chia phần bánh', note: 'luyện phép chia', fn: function () { startMission('canteen'); } });
    if (cards.length === 1) return cards[0].fn();
    choiceMenu('Nhà ăn', cards);
  }

  /* ---------------- Tham quan trường (tour.js) ----------------
   * Cô giáo dẫn bé đi lần lượt qua các nơi trong sân trường; tới mỗi nơi cô kể vài câu. Cuối cùng là phần quê hương em. */
  function startTour() {
    if (app.scene !== 'yard' || !TT.world.state || app.screen !== 'school') {
      return changeScene('yard', { x: 1250, y: 1380 }, function () { setTimeout(startTour, 500); }, 'whoosh');
    }
    var T = TT.tour, i = -1;
    function next() {
      i++;
      if (app.scene !== 'yard' || !TT.world.state) return;
      if (i >= T.STOPS.length) return hometown();
      var s = T.STOPS[i], shown = false;
      var tell = function () {
        if (shown || app.scene !== 'yard' || app.screen !== 'school') return;
        shown = true;
        U.say(T.GUIDE.name, A.adultSVG(T.GUIDE.art), s.text, [{ label: i < T.STOPS.length - 1 ? 'Đi tiếp' : 'Kể về quê hương em', fn: next }]);
      };
      U.toast('Tham quan trường · điểm ' + (i + 1) + '/' + T.STOPS.length + ': ' + s.title, 2600);
      TT.world.walkTo(s.x, s.y, tell);
      setTimeout(tell, 14000); // bé tự đi chỗ khác giữa chừng thì cô vẫn kể tiếp
    }
    next();
  }
  /* Phần cuối chuyến tham quan: quê hương em và thông tin về trường (nếu ba mẹ đã bổ sung trong tour.js) */
  function hometown() {
    var T = TT.tour, lines = T.SCHOOL.concat(T.HOME);
    var ul = h('ul', { class: 'home-list' });
    lines.forEach(function (t) { ul.appendChild(h('li', { text: t })); });
    var row = h('div', { class: 'row-actions wrap' });
    if (TT.audio.canSpeak()) row.appendChild(btn(h('span', { html: A.icon('speak') + ' Nghe đọc' }), 'ghost', function () { TT.audio.speak(lines.join(' ')); }));
    row.appendChild(btn('Đố vui về trường em', 'secondary', function () { U.closeModal(); startSubject('life', 'truongem'); }, { id: 'btn-tour-quiz' }));
    row.appendChild(btn('Con nhớ rồi', 'primary big', U.closeModal));
    U.modal(h('div', { class: 'home-box' }, [h('h2', { text: 'Trường em, quê em' }), ul, row]), { cls: 'wide' });
  }

  /* Trang hướng dẫn chơi cho bé */
  function guide() { U.modal(TT.act.guide({ onClose: U.closeModal }), { cls: 'wide guide-modal' }); }

  var MISSION_TITLES = {
    warmup: 'Làm quen với lớp học', classroom: 'Luyện cùng cô Hằng', feed: 'Cho thú ăn', bridge: 'Xây cầu sang đảo',
    treasure: 'Tìm kho báu', garden: 'Vườn toán học', sports: 'Chuyền bóng', canteen: 'Nhà ăn chia phần',
    review: 'Ôn lại cùng bạn', library: 'Thư viện ghép thẻ'
  };
  /* Mỗi nhiệm vụ diễn ra ở một nơi: âm thanh nền theo nơi đó */
  var MISSION_AMB = {
    warmup: 'classroom', classroom: 'classroom', review: 'classroom', feed: 'pets', bridge: 'island', treasure: 'island',
    garden: 'garden', sports: 'sports', canteen: 'canteen', library: 'library'
  };

  /* Chọn bảng trước nhiệm vụ: mặc định theo ba mẹ chọn, bé có thể chọn bảng bất kỳ */
  function pickTables(theme, cb) {
    var p = S.profile();
    var chosen = p.settings.tables.slice();
    var box = h('div', { class: 'picker' }, [h('h2', { text: MISSION_TITLES[theme] }), h('p', { text: 'Con muốn luyện bảng nào? (Đã chọn sẵn các bảng ba mẹ đặt.)' })]);
    var row = h('div', { class: 'chip-row center' });
    function draw() {
      row.innerHTML = '';
      for (var t = 2; t <= 9; t++) {
        (function (t) {
          var on = chosen.indexOf(t) >= 0;
          row.appendChild(btn('Bảng ' + t, 'chip-btn' + (on ? ' on' : ''), function () {
            var i = chosen.indexOf(t);
            if (i >= 0) { if (chosen.length > 1) chosen.splice(i, 1); } else chosen.push(t);
            draw();
          }, { 'aria-pressed': on ? 'true' : 'false' }));
        })(t);
      }
    }
    draw();
    box.appendChild(row);
    box.appendChild(h('div', { class: 'row-actions' }, [
      btn('Để sau', 'ghost', U.closeModal),
      btn('Bắt đầu', 'primary big', function () { U.closeModal(); p.lastTables = chosen.slice(); S.save(); cb(chosen.slice().sort()); }, { id: 'btn-start' })
    ]));
    U.modal(box, { cls: 'picker-modal' });
  }

  function startMission(theme, opts) {
    opts = opts || {};
    var p = S.profile();
    if (theme === 'canteen' && !p.settings.division) return;
    if (!opts.tables && theme !== 'warmup' && theme !== 'review') {
      return pickTables(theme, function (tables) { opts.tables = tables; startMission(theme, opts); });
    }
    var facts;
    var count = 6;
    if (theme === 'warmup') facts = E.warmupMission();
    else if (theme === 'review') {
      var tbl = {};
      p.settings.tables.forEach(function (t) { tbl[t] = 1; });
      Object.keys(p.facts).forEach(function (k) { if (k.charAt(0) === 'm') tbl[E.parseKey(k).a] = 1; });
      var tables = Object.keys(tbl).map(Number).sort();
      var hasHistory = Object.keys(p.facts).length > 0;
      facts = E.buildMission(p, { tables: tables, count: 7, op: p.settings.division ? 'mix' : 'mul', review: hasHistory });
    } else if (theme !== 'library') {
      facts = E.buildMission(p, { tables: opts.tables, count: count, op: theme === 'canteen' ? 'div' : 'mul' });
    }
    var id = ++app.missionSeq;
    var title = MISSION_TITLES[theme];
    openAct(title, function (body) {
      var onDone = function (res) { finishMission(id, theme, res, opts); };
      if (theme === 'library') TT.act.library(body, { tables: opts.tables, onDone: onDone });
      else app.currentRun = TT.quiz.run(body, { theme: theme, facts: facts, onDone: onDone });
    }, MISSION_AMB[theme], true);
  }

  /* ---------------- Phần thưởng (chỉ trao một lần cho mỗi nhiệm vụ) ---------------- */
  function finishMission(id, theme, res, opts) {
    if (app.rewarded[id]) return;
    app.rewarded[id] = true;
    app.currentRun = null;
    var p = S.profile();
    var day = S.today(p);
    var stars = 3;
    var bonus = 0;
    var q = TT.act.todayQuest(p);
    if (!day.quest && (opts.quest || theme === q.game.theme)) { day.quest = true; bonus = 2; }
    p.stars += stars + bonus;
    p.treats += 1;
    p.stats.missions++;
    day.missions++;
    if (theme === 'warmup') p.warmupDone = true;
    if (theme === 'bridge') p.bridgeBuilt = true;
    S.save();
    TT.audio.play('reward');

    var s = $('s-act');
    var body = s.querySelector('.act-body');
    body.innerHTML = '';
    var breakTime = app.sessionMs >= p.settings.sessionMin * 60000;
    var box = h('div', { class: 'reward' + (breakTime ? ' break' : '') });
    box.appendChild(h('div', { class: 'reward-art', html: A.girlSVG(p.look, 'char cheer') + A.petSVG(p.pet, p.petAcc[p.pet], 'pet cheer') }));
    if (breakTime) {
      box.appendChild(h('h2', { text: p.nickname + ' đã học xong một chuyến phiêu lưu!' }));
    } else {
      box.appendChild(h('h2', { text: theme === 'warmup' ? 'Làm quen xong rồi!' : 'Hoàn thành nhiệm vụ!' }));
    }
    var gifts = h('div', { class: 'gifts' }, [
      h('span', { class: 'gift', html: A.obj('star') + '<b>+' + (stars + bonus) + '</b><small>ngôi sao</small>' }),
      h('span', { class: 'gift', html: A.icon('treat') + '<b>+1</b><small>bánh cho thú</small>' })
    ]);
    box.appendChild(gifts);
    var lines = h('ul', { class: 'praise' });
    if (res.self > 0) lines.appendChild(h('li', { text: 'Con đã tự làm đúng ' + res.self + ' câu ngay lần đầu.' }));
    if (res.helped > 0) lines.appendChild(h('li', { text: 'Con biết dùng gợi ý để tìm ra đáp án ở ' + res.helped + ' câu.' }));
    if (day.remembered.length > 0) lines.appendChild(h('li', { text: 'Hôm nay con nhớ thêm được ' + day.remembered.length + ' phép tính.' }));
    if (bonus) lines.appendChild(h('li', { text: 'Con đã xong nhiệm vụ hôm nay của thầy Nam: thêm 2 ngôi sao.' }));
    if (theme === 'bridge') lines.appendChild(h('li', { text: 'Cây cầu sang đảo thú cưng đã xây xong!' }));
    box.appendChild(lines);
    var acts = h('div', { class: 'row-actions wrap' });
    if (breakTime) {
      box.appendChild(h('p', { class: 'muted', text: 'Mình nghỉ một chút cho mắt và tay nhé. Thú cưng vẫn vui vẻ chờ con quay lại.' }));
      acts.appendChild(btn('Nghỉ thôi', 'primary big', function () { app.sessionMs = 0; TT.world.destroy(); show('title'); renderTitle(); }, { id: 'btn-rest' }));
      acts.appendChild(btn('Trang trí đảo một chút', 'secondary', function () { openZone('decor'); }));
      acts.appendChild(btn(backLabel(), 'ghost', closeAct));
    } else {
      acts.appendChild(btn('Trang trí đảo', 'secondary', function () { openZone('decor'); }, { id: 'btn-decorate' }));
      acts.appendChild(btn('Nghỉ một chút', 'ghost', function () { app.sessionMs = 0; TT.world.destroy(); show('title'); renderTitle(); }));
      if (theme !== 'warmup') acts.appendChild(btn('Chơi tiếp', 'primary', function () { if (opts.again) opts.again(); else startMission(theme, { tables: opts.tables }); }, { id: 'btn-again' }));
      acts.appendChild(btn(backLabel(), theme === 'warmup' ? 'primary' : 'ghost', closeAct, { id: 'btn-to-school' }));
    }
    box.appendChild(acts);
    body.appendChild(box);
    refreshCounters();
    var f = acts.querySelector('button'); if (f) f.focus({ preventScroll: true });
  }

  /* ---------------- Góc ba mẹ ---------------- */
  function openParent(from) {
    app.parentBack = from;
    var s = $('s-parent');
    s.innerHTML = '';
    var head = h('header', { class: 'act-head parent-head' }, [
      btn(h('span', { html: A.icon('back') + '<span>Quay lại</span>' }), 'back-btn', function () {
        if (app.parentBack === 'school' && S.data.active) { TT.world.destroy(); enterSchool(true); }
        else { show('title'); renderTitle(); }
      }, { id: 'btn-parent-back' }),
      h('h1', { text: 'Góc dành cho ba mẹ' })
    ]);
    var body = h('div', { class: 'act-body' });
    s.appendChild(head); s.appendChild(body);
    show('parent');
    TT.parent.render(body, { profileId: S.data.active || app.selected, onChange: function () { if (S.data.active) applyProfileSettings(); } });
  }

  /* ---------------- Toàn màn hình (chỉ sau thao tác của người dùng) ---------------- */
  function toggleFullscreen() {
    var d = document, de = d.documentElement;
    var isFs = d.fullscreenElement || d.webkitFullscreenElement;
    var fallback = function () {
      U.toast('Trình duyệt này chưa cho bật toàn màn hình. Game vẫn phủ kín vùng hiển thị. Trên iPad, ba mẹ có thể thêm game vào Màn hình chính (xem Góc ba mẹ).', 5200);
    };
    try {
      if (isFs) {
        var ex = d.exitFullscreen || d.webkitExitFullscreen;
        if (ex) { var r0 = ex.call(d); if (r0 && r0.catch) r0.catch(function () { /* */ }); }
        return;
      }
      var enabled = d.fullscreenEnabled || d.webkitFullscreenEnabled;
      var req = de.requestFullscreen || de.webkitRequestFullscreen;
      if (!enabled || !req) return fallback();
      var r = req.call(de);
      if (r && r.catch) r.catch(fallback);
      // trên máy cảm ứng, vào toàn màn hình thì giữ luôn hướng ngang (máy nào không cho thì thôi)
      if (document.body.classList.contains('touch') && r && r.then) r.then(lockLandscape, function () { /* */ });
    } catch (e) { fallback(); }
  }

  /* ---------------- Chiều cao động và đồng hồ lượt chơi ---------------- */
  function setVh() {
    var hgt = root.visualViewport ? root.visualViewport.height : root.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(hgt) + 'px');
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------------- Tự cập nhật ----------------
   * Game được lưu sẵn trong máy để chơi offline (sw.js), nên phải chủ động hỏi máy chủ xem có bản mới:
   * mỗi lần quay lại trang và mỗi 30 phút. Có bản mới thì tải lại ở cổng trường; đang chơi dở thì chờ bé về cổng. */
  function watchUpdates() {
    var sw = navigator.serviceWorker, had = !!sw.controller;
    sw.register('sw.js').then(function (reg) {
      var check = function () {
        if (document.visibilityState !== 'visible') return;
        try { var r = reg.update(); if (r && r.catch) r.catch(function () { /* đang mất mạng */ }); } catch (e) { /* */ }
      };
      document.addEventListener('visibilitychange', check);
      setInterval(check, 30 * 60000);
    }).catch(function () { /* không có offline cũng không sao */ });
    sw.addEventListener('controllerchange', function () {
      if (!had) { had = true; return; } // lần cài đầu tiên: không có gì để cập nhật
      if (app.screen === 'title') return reloadForUpdate();
      app.updateReady = true;
      U.toast('Game vừa có bản mới. Khi con về cổng trường, game sẽ tự cập nhật.', 5200);
    });
  }
  function reloadForUpdate() {
    var last = 0;
    try { last = +root.sessionStorage.getItem('tt-reloaded') || 0; root.sessionStorage.setItem('tt-reloaded', String(Date.now())); } catch (e) { /* */ }
    if (Date.now() - last > 20000) root.location.reload(); // không tải lại liên tục nếu có trục trặc
  }

  /* Màn hình cảm ứng thì hiện nút điều hướng; máy tính dùng bàn phím và chuột */
  function detectTouch() {
    var coarse = root.matchMedia && root.matchMedia('(any-pointer: coarse)').matches;
    if (coarse || 'ontouchstart' in root) document.body.classList.add('touch');
    document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') document.body.classList.add('touch'); }, true);
  }

  function boot() {
    setVh();
    detectTouch();
    initRotateWall();
    root.addEventListener('resize', setVh);
    root.addEventListener('orientationchange', function () { setTimeout(setVh, 200); });
    if (root.visualViewport) root.visualViewport.addEventListener('resize', setVh);
    setInterval(function () {
      if (document.visibilityState === 'visible' && (app.screen === 'school' || app.screen === 'act')) app.sessionMs += 1000;
    }, 1000);
    // Khi trình duyệt khôi phục từ bộ nhớ đệm, đọc lại dữ liệu đã lưu
    root.addEventListener('pageshow', function (e) { if (e.persisted) S.reload(); });
    document.addEventListener('tt-voices', function () { /* nút đọc xuất hiện ở câu hỏi tiếp theo */ });
    show('title');
    renderTitle();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) watchUpdates();
  }

  // Chủ đề "Luyện cùng cô Hằng" trong lớp học
  TT.quiz.THEMES.classroom = {
    stage: function (stageEl, q, info) {
      stageEl.innerHTML = '';
      stageEl.appendChild(h('div', { class: 'stage-npc' }, [h('div', { class: 'stage-avatar', html: A.adultSVG('hang') }),
        h('div', { class: 'bubble', text: 'Cô Hằng: Câu ' + Math.min(info.done + 1, info.total) + '/' + info.total + '. Con nhớ: ' + q.fact.a + ' được lấy ' + q.fact.b + ' lần.' })]));
      stageEl.appendChild(h('div', { class: 'chalkboard mini' }, [h('b', { text: 'Bảng nhân ' + q.fact.a }), h('span', { text: q.fact.a + ' được lấy ' + q.fact.b + ' lần' })]));
    }
  };

  app.subjectMenu = subjectMenu; app.startSubject = startSubject; app.guide = guide; app.enterRoad = enterRoad; app.startTour = startTour;
  app.openZone = openZone; app.startMission = startMission; app.enterAs = enterAs; app.toggleFullscreen = toggleFullscreen;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
