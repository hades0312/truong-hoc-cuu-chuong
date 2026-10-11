/* activities.js: Lớp học (Cùng học), Thư viện (ghép thẻ), Bảng tin, Phòng Mỹ thuật,
 * Góc thú cưng, Đảo thú cưng và lời thoại NPC. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var E, A, U, h, btn;
  function init() { E = TT.engine; A = TT.art; U = TT.ui; h = U.h; btn = U.btn; }
  function P() { return TT.store.profile(); }
  function charName() { return P().name; }

  /* =================== LỚP HỌC: CÙNG HỌC =================== */
  function learn(container, opts) {
    init();
    var p = P();
    var a = (opts && opts.table) || p.lastTables[0] || p.settings.tables[0] || 2;
    var b = 3;
    var ctxIdx = 0;
    container.innerHTML = '';
    var wrap = h('div', { class: 'learn' });
    container.appendChild(wrap);

    function render() {
      var ctx = A.CONTEXTS[ctxIdx % A.CONTEXTS.length];
      if (ctx.icon === 'kid' && a > 6) ctx = A.CONTEXTS[0];
      var fact = E.makeFact('mul', a, b);
      wrap.innerHTML = '';
      // chọn bảng và thừa số
      var pick = h('div', { class: 'learn-pick' });
      var tRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Chọn bảng nhân' }, [h('span', { class: 'row-label', text: 'Bảng nhân' })]);
      for (var t = 2; t <= 9; t++) {
        (function (t) { tRow.appendChild(btn(String(t), 'chip-btn' + (t === a ? ' on' : ''), function () { a = t; p.lastTables = [t]; TT.store.save(); render(); }, { 'aria-pressed': t === a ? 'true' : 'false' })); })(t);
      }
      var bRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Chọn số nhóm' }, [h('span', { class: 'row-label', text: 'Số nhóm' })]);
      for (var k = 1; k <= 10; k++) {
        (function (k) { bRow.appendChild(btn(String(k), 'chip-btn small' + (k === b ? ' on' : ''), function () { b = k; render(); }, { 'aria-pressed': k === b ? 'true' : 'false' })); })(k);
      }
      pick.appendChild(tRow); pick.appendChild(bRow);
      wrap.appendChild(pick);

      var body = h('div', { class: 'learn-body' });
      var left = h('div', { class: 'learn-left' });
      var right = h('div', { class: 'learn-right chalkboard' }); // bảng lớp: phép tính viết bằng phấn
      body.appendChild(left); body.appendChild(right);
      wrap.appendChild(body);

      var storyText = 'Có ' + b + ' ' + ctx.group + ', mỗi ' + ctx.group + ' có ' + a + ' ' + ctx.unit + '. Con chạm vào từng ' + ctx.group + ' để đếm nhé!';
      var teacher = h('div', { class: 'stage-npc compact' }, [h('div', { class: 'stage-avatar', html: A.adultSVG('hang') }), h('div', { class: 'bubble', text: 'Cô Hằng: ' + storyText })]);
      left.appendChild(teacher);
      var tapped = {};
      var count = 0;
      var counter = h('div', { class: 'learn-counter', 'aria-live': 'polite', text: 'Đã đếm: 0 ' + ctx.group });
      var gview = TT.visual.groups(fact, {
        ctx: ctx, container: 'box',
        tapCount: function (idx, el) {
          if (tapped[idx]) return;
          tapped[idx] = true; count++;
          el.classList.add('counted');
          el.querySelector('.badge').textContent = String(count * a);
          el.querySelector('.badge').classList.remove('empty');
          TT.audio.play('pop');
          counter.textContent = 'Đã đếm: ' + count + ' ' + ctx.group + ' = ' + (count * a) + ' ' + ctx.unit;
          if (count === b) done();
        }
      });
      left.appendChild(gview);
      left.appendChild(counter);

      right.appendChild(h('p', { class: 'board-date', text: 'Toán · Bảng nhân ' + a }));
      var eq = h('div', { class: 'learn-eq' }, [h('div', { class: 'eq-line mul wait', text: a + ' × ' + b + ' = ?' })]);
      right.appendChild(eq);
      var dotsBox = h('div', { class: 'learn-dots' });
      right.appendChild(dotsBox);
      renderDots(dotsBox, a, b, false);

      var actions = h('div', { class: 'row-actions' });
      if (TT.audio.canSpeak()) actions.appendChild(btn(h('span', { html: A.icon('speak') + ' Nghe cô đọc' }), 'ghost', function () { TT.audio.speak(storyText); }));
      actions.appendChild(btn(b < 10 ? 'Phép tiếp theo: ' + a + ' × ' + (b + 1) : 'Học lại từ ' + a + ' × 1', 'primary', function () { b = b < 10 ? b + 1 : 1; ctxIdx++; render(); }));
      actions.appendChild(btn('Luyện bảng ' + a, 'secondary', function () { opts.onPractice && opts.onPractice([a]); }));
      wrap.appendChild(actions);

      function done() {
        var adds = []; for (var i = 0; i < b; i++) adds.push(a);
        eq.innerHTML = '';
        TT.audio.play('chalk');
        eq.appendChild(h('div', { class: 'eq-line add', text: adds.join(' + ') + ' = ' + fact.c }));
        eq.appendChild(h('div', { class: 'eq-line mul', text: a + ' × ' + b + ' = ' + fact.c }));
        eq.appendChild(h('p', { class: 'eq-note', html: '<b class="ci">' + a + '</b> là số ' + ctx.unit + ' trong mỗi ' + ctx.group + ' (được lấy ' + b + ' lần). <b class="cg">' + b + '</b> là số ' + ctx.group + '.' }));
        TT.audio.play('correct');
        p.stats.learnSeen++;
        if (p.stats.learnSeen % 3 === 0) { p.stars += 1; U.toast('Con học thêm được 3 phép tính bằng hình. Nhận 1 ngôi sao!'); }
        TT.store.save();
        opts.onChange && opts.onChange();
      }
    }

    function renderDots(box, a, b, rotated) {
      box.innerHTML = '';
      var rows = rotated ? a : b, cols = rotated ? b : a;
      box.appendChild(h('h3', { text: 'Bảng chấm' }));
      box.appendChild(TT.visual.dots(rows, cols, rotated ? 'alt' : ''));
      box.appendChild(h('p', { class: 'dots-cap', text: rows + ' hàng, mỗi hàng ' + cols + ' chấm: ' + cols + ' × ' + rows + ' = ' + (a * b) }));
      box.appendChild(btn(rotated ? 'Xoay lại' : 'Xoay bảng chấm', 'ghost small', function () {
        renderDots(box, a, b, !rotated);
        if (!rotated) box.appendChild(h('p', { class: 'dots-same', text: a + ' × ' + b + ' và ' + b + ' × ' + a + ' cùng bằng ' + (a * b) + '!' }));
      }));
    }
    render();
  }

  /* =================== THƯ VIỆN: GHÉP THẺ =================== */
  function library(container, opts) {
    init();
    var p = P();
    var tables = opts.tables;
    var rounds = 2, perRound = 3, round = 0;
    var results = [];
    container.innerHTML = '';
    var wrap = h('div', { class: 'match' });
    container.appendChild(wrap);
    var finished = false;

    function pickFacts() {
      var list = E.buildMission(p, { tables: tables, count: 10 });
      var used = {}, out = [];
      list.forEach(function (f) { if (out.length < perRound && !used[f.c]) { used[f.c] = true; out.push(f); } });
      // phòng khi trùng kết quả: bổ sung từ bảng
      for (var i = 1; out.length < perRound && i <= 10; i++) {
        var f2 = E.makeFact('mul', tables[i % tables.length], i);
        if (!used[f2.c]) { used[f2.c] = true; out.push(f2); }
      }
      return out;
    }

    function renderRound() {
      var facts = pickFacts();
      var state = {}; // key → {attempt, hint, done}
      facts.forEach(function (f) { state[f.key] = { attempt: 0, done: false }; });
      var sel = null;
      wrap.innerHTML = '';
      wrap.appendChild(h('div', { class: 'stage-npc compact' }, [h('div', { class: 'stage-avatar', html: A.adultSVG('hoa') }),
        h('div', { class: 'bubble', text: 'Cô Hoa: Con ghép mỗi thẻ phép tính với thẻ kết quả nhé. Chạm một thẻ bên trái, rồi chạm thẻ bên phải. (Lượt ' + (round + 1) + '/' + rounds + ')' })]));
      var board = h('div', { class: 'match-board' });
      var left = h('div', { class: 'match-col' }), right = h('div', { class: 'match-col' });
      board.appendChild(left); board.appendChild(right);
      wrap.appendChild(board);
      var fb = h('div', { class: 'q-feedback', role: 'status', 'aria-live': 'polite' });
      wrap.appendChild(fb);
      var hintBox = h('div', { class: 'q-hint', hidden: true });
      wrap.appendChild(hintBox);

      facts.forEach(function (f) {
        var c = h('button', { type: 'button', class: 'card expr', 'data-key': f.key, text: f.a + ' × ' + f.b });
        c.addEventListener('click', function () {
          if (state[f.key].done) return;
          left.querySelectorAll('.card').forEach(function (x) { x.classList.remove('sel'); });
          c.classList.add('sel'); sel = f; TT.audio.play('tap');
          fb.textContent = 'Bây giờ chạm vào kết quả của ' + f.a + ' × ' + f.b + '.'; fb.className = 'q-feedback info';
        });
        left.appendChild(c);
      });
      E.shuffle(facts).forEach(function (f) {
        var c = h('button', { type: 'button', class: 'card res', 'data-c': String(f.c), text: String(f.c) });
        c.addEventListener('click', function () {
          if (!sel || c.classList.contains('done') || finished) { if (!sel) { fb.textContent = 'Con chọn một thẻ phép tính bên trái trước nhé.'; fb.className = 'q-feedback info'; } return; }
          var s = state[sel.key];
          if (sel.c === f.c) {
            s.done = true;
            var outcome = s.attempt === 0 ? 'self' : (s.attempt === 1 ? 'retry' : 'guided');
            E.recordAttempt(p, sel, outcome, false);
            if (outcome === 'self') { p.stats.selfCorrect++; var d = TT.store.today(p); if (d.self.indexOf(sel.key) < 0) d.self.push(sel.key); }
            else if (outcome === 'retry') p.stats.hintCorrect++; else p.stats.guided++;
            TT.store.save();
            results.push({ key: sel.key, outcome: outcome, hint: false });
            var lc = left.querySelector('[data-key="' + sel.key + '"]');
            lc.classList.remove('sel'); lc.classList.add('done'); lc.disabled = true; c.classList.add('done'); c.disabled = true;
            lc.textContent = sel.a + ' × ' + sel.b + ' = ' + sel.c;
            right.querySelectorAll('.guide').forEach(function (x) { x.classList.remove('guide'); });
            TT.audio.play('correct');
            fb.textContent = outcome === 'self' ? 'Đúng rồi! ' + sel.a + ' × ' + sel.b + ' = ' + sel.c : 'Con biết dùng gợi ý để tìm ra đáp án rồi!';
            fb.className = 'q-feedback good';
            hintBox.hidden = true;
            sel = null;
            var allDone = facts.every(function (x) { return state[x.key].done; });
            if (allDone) {
              round++;
              var go = btn(round < rounds ? 'Lượt tiếp theo' : 'Xong rồi!', 'primary big', function () {
                if (round < rounds) renderRound(); else finish();
              });
              wrap.appendChild(h('div', { class: 'row-actions' }, [go]));
              go.focus({ preventScroll: true });
            }
          } else {
            s.attempt++;
            TT.audio.play('soft');
            c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
            hintBox.hidden = false; hintBox.innerHTML = '';
            if (s.attempt === 1) {
              fb.textContent = 'Gần rồi! Mình thử nhìn các nhóm nhé.';
              hintBox.appendChild(TT.visual.hintPanel(sel, A.CONTEXTS[0], false));
            } else {
              fb.textContent = 'Mình cùng làm từng bước nhé. Thẻ kết quả đúng đang sáng.';
              hintBox.appendChild(TT.visual.hintPanel(sel, A.CONTEXTS[0], true));
              var target = right.querySelector('[data-c="' + sel.c + '"]');
              if (target) target.classList.add('guide');
            }
            fb.className = 'q-feedback info';
          }
        });
        right.appendChild(c);
      });
    }

    function finish() {
      if (finished) return; finished = true;
      opts.onDone({ total: rounds * perRound, self: results.filter(function (r) { return r.outcome === 'self'; }).length,
        helped: results.filter(function (r) { return r.outcome !== 'self'; }).length, theme: 'library', results: results });
    }
    renderRound();
  }

  /* =================== BẢNG TIN =================== */
  var QUEST_GAMES = [
    { theme: 'feed', name: 'Cho thú ăn', zone: 'pets' },
    { theme: 'bridge', name: 'Xây cầu sang đảo', zone: 'portal' },
    { theme: 'treasure', name: 'Tìm kho báu trên đảo', zone: 'portal' },
    { theme: 'garden', name: 'Thu hoạch ở vườn toán học', zone: 'garden' },
    { theme: 'sports', name: 'Chuyền bóng ở sân thể thao', zone: 'sports' },
    { theme: 'library', name: 'Ghép thẻ ở thư viện', zone: 'library' }
  ];
  function todayQuest(p) {
    init();
    var d = new Date();
    var n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / E.DAY);
    var g = QUEST_GAMES[n % QUEST_GAMES.length];
    // bảng nên luyện: bảng được chọn có nhiều phép "nên ôn thêm" hoặc chưa luyện
    var tables = p.settings.tables.slice();
    var best = tables[0], bestScore = -1;
    tables.forEach(function (t) {
      var sc = 0;
      for (var b = 1; b <= 10; b++) { var s = E.status(p.facts['m' + t + 'x' + b]); sc += s === 'review' ? 3 : (s === 'new' ? 1 : (s === 'learning' ? 2 : 0)); }
      if (sc > bestScore) { bestScore = sc; best = t; }
    });
    return { game: g, table: best };
  }

  function tableProgress(p, t) {
    init();
    var solid = 0, seen = 0;
    for (var b = 1; b <= 10; b++) { var r = p.facts['m' + t + 'x' + b]; var s = E.status(r); if (s === 'solid') solid++; if (s !== 'new') seen++; }
    return { solid: solid, seen: seen };
  }

  function board(container, opts) {
    init();
    var p = P();
    var q = todayQuest(p);
    var day = TT.store.today(p);
    container.innerHTML = '';
    var wrap = h('div', { class: 'board' });
    var questCard = h('div', { class: 'card-block quest' }, [
      h('div', { class: 'stage-avatar small', html: A.adultSVG('nam') }),
      h('div', {}, [
        h('h3', { text: 'Nhiệm vụ hôm nay của thầy Nam' }),
        h('p', { text: q.game.name + ' với bảng nhân ' + q.table + '.' + (day.quest ? ' Con đã làm xong rồi!' : ' Làm xong được thêm 2 ngôi sao.') }),
        btn(day.quest ? 'Làm lại cho vui' : 'Làm nhiệm vụ', 'primary', function () { opts.onQuest(q); })
      ])
    ]);
    wrap.appendChild(questCard);
    var todayCard = h('div', { class: 'card-block' }, [
      h('h3', { text: 'Hôm nay' }),
      h('p', { text: day.self.length ? 'Con đã tự làm đúng ' + day.self.length + ' phép tính khác nhau.' : 'Hôm nay mình bắt đầu khám phá nhé!' }),
      day.remembered.length ? h('p', { text: 'Con nhớ thêm được ' + day.remembered.length + ' phép tính.' }) : null,
      btn(h('span', { html: A.icon('review') + ' Ôn lại cùng ' + A.PET_NAMES[p.pet] }), 'secondary', function () { opts.onReview(); })
    ]);
    wrap.appendChild(todayCard);
    var prog = h('div', { class: 'card-block' }, [h('h3', { text: 'Hành trình bảng cửu chương' })]);
    var grid = h('div', { class: 'table-progress' });
    for (var t = 2; t <= 9; t++) {
      var tp = tableProgress(p, t);
      grid.appendChild(h('div', { class: 'tp' }, [
        h('span', { class: 'tp-name', text: 'Bảng ' + t }),
        h('span', { class: 'tp-bar' }, [h('span', { class: 'tp-seen', style: 'width:' + tp.seen * 10 + '%' }), h('span', { class: 'tp-solid', style: 'width:' + tp.solid * 10 + '%' })]),
        h('span', { class: 'tp-n', text: tp.solid ? tp.solid + ' khá vững' : (tp.seen ? 'đang làm quen' : 'chưa khám phá') })
      ]));
    }
    prog.appendChild(grid);
    prog.appendChild(h('p', { class: 'muted', text: 'Thanh xanh nhạt: phép tính đã gặp. Thanh xanh đậm: phép tính đã làm khá vững qua nhiều ngày.' }));
    wrap.appendChild(prog);
    container.appendChild(wrap);
  }

  /* =================== PHÒNG MỸ THUẬT + ĐẢO =================== */
  var SLOTS = [
    { id: 's1', x: 150, y: 250 }, { id: 's2', x: 300, y: 200 }, { id: 's3', x: 470, y: 205 },
    { id: 's4', x: 610, y: 255 }, { id: 's5', x: 390, y: 300 }
  ];
  function islandSVG(p, opts) {
    opts = opts || {};
    var s = '<rect width="800" height="420" fill="#bde0fe"/><rect y="250" width="800" height="170" fill="#48cae4"/>' +
      '<path d="M0 270 Q100 255 200 270 T400 270 T600 270 T800 270" stroke="#90e0ef" stroke-width="6" fill="none"/>' +
      '<ellipse cx="400" cy="300" rx="340" ry="92" fill="#f2cc8f"/><ellipse cx="400" cy="285" rx="320" ry="80" fill="#95d5b2"/>' +
      '<g class="cloud c1"><ellipse cx="140" cy="70" rx="60" ry="20" fill="#fff"/></g><g class="cloud c2"><ellipse cx="620" cy="50" rx="70" ry="22" fill="#fff"/></g>';
    if (p.bridgeBuilt) s += '<path d="M0 330 L120 300" stroke="#c68b59" stroke-width="18"/><path d="M0 322 L120 292" stroke="#a0673b" stroke-width="3" stroke-dasharray="12 8"/>';
    SLOTS.forEach(function (sl) {
      var it = p.placed[sl.id];
      s += '<g class="slot' + (opts.edit ? ' editable' : '') + (opts.sel === sl.id ? ' sel' : '') + '" data-slot="' + sl.id + '" transform="translate(' + (sl.x - 50) + ' ' + (sl.y - 90) + ')">';
      if (opts.edit) s += '<rect x="2" y="2" width="96" height="96" rx="18" fill="#fff" fill-opacity=".35" stroke="#7b61ff" stroke-width="3" stroke-dasharray="8 6"/>';
      if (it && A.DECOR[it]) s += '<g transform="translate(10 10)">' + A.DECOR[it].svg + '</g>';
      else if (opts.edit) s += '<text x="50" y="60" text-anchor="middle" font-size="34" fill="#7b61ff">+</text>';
      s += '</g>';
    });
    s += '<g class="island-pet" transform="translate(470 230) scale(.8)"><g class="bob">' + A.pet(p.pet, p.petAcc[p.pet]) + '</g></g>';
    return A.svg('0 0 800 420', s, 'island-svg', 'Đảo thú cưng');
  }

  function art(container, opts) {
    init();
    var p = P();
    var sel = 's1';
    container.innerHTML = '';
    var wrap = h('div', { class: 'art' });
    container.appendChild(wrap);
    function render() {
      wrap.innerHTML = '';
      wrap.appendChild(h('p', { class: 'lead', text: 'Chạm một ô trên đảo, rồi chọn đồ trang trí. Con có ' + p.stars + ' ngôi sao để đổi đồ mới.' }));
      var view = h('div', { class: 'island-view', html: islandSVG(p, { edit: true, sel: sel }) });
      view.querySelectorAll('[data-slot]').forEach(function (g) {
        g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', 'Ô trang trí ' + g.getAttribute('data-slot').slice(1));
        var f = function () { sel = g.getAttribute('data-slot'); TT.audio.play('tap'); render(); };
        g.addEventListener('click', f);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
      });
      wrap.appendChild(view);
      var shelf = h('div', { class: 'shelf' });
      Object.keys(A.DECOR).forEach(function (id) {
        var d = A.DECOR[id], owned = p.owned.indexOf(id) >= 0;
        var label = owned ? d.name : d.name + ' · ' + d.price + ' sao';
        var b = btn(h('span', { class: 'shelf-item', html: A.decor(id) + '<span>' + label + '</span>' }), 'shelf-btn' + (owned ? ' owned' : '') + (p.placed[sel] === id ? ' on' : ''), function () {
          if (!owned) {
            if (p.stars < d.price) { U.toast('Cần ' + d.price + ' ngôi sao. Làm thêm một nhiệm vụ là có ngay!'); return; }
            p.stars -= d.price; p.owned.push(id); TT.audio.play('reward');
          }
          // một món chỉ đặt ở một ô
          Object.keys(p.placed).forEach(function (k) { if (p.placed[k] === id) delete p.placed[k]; });
          p.placed[sel] = id;
          TT.store.save(); opts.onChange && opts.onChange(); render();
        });
        shelf.appendChild(b);
      });
      wrap.appendChild(shelf);
      wrap.appendChild(h('div', { class: 'row-actions' }, [
        btn('Bỏ đồ ở ô này', 'ghost', function () { delete p.placed[sel]; TT.store.save(); render(); }),
        btn('Ngắm đảo', 'secondary', function () { opts.onIsland && opts.onIsland(); })
      ]));
    }
    render();
  }

  function island(container, opts) {
    init();
    var p = P();
    container.innerHTML = '';
    var wrap = h('div', { class: 'island' });
    wrap.appendChild(h('div', { class: 'island-view', html: islandSVG(p, {}) }));
    wrap.appendChild(h('p', { class: 'lead', text: p.bridgeBuilt ? 'Cây cầu con xây đã nối trường với đảo. ' + A.PET_NAMES[p.pet] + ' rất thích nơi này!' : 'Đây là đảo thú cưng. Mình cùng xây cầu và tìm kho báu nhé!' }));
    wrap.appendChild(h('div', { class: 'row-actions wrap' }, [
      btn('Xây cầu', 'primary', function () { opts.onMission('bridge'); }),
      btn('Tìm kho báu', 'primary', function () { opts.onMission('treasure'); }),
      btn('Trang trí đảo', 'secondary', function () { opts.onArt(); })
    ]));
    container.appendChild(wrap);
  }

  /* =================== GÓC THÚ CƯNG =================== */
  function pets(container, opts) {
    init();
    var p = P();
    container.innerHTML = '';
    var wrap = h('div', { class: 'pets' });
    container.appendChild(wrap);
    function render(anim) {
      wrap.innerHTML = '';
      var big = h('div', { class: 'pet-stage' + (anim ? ' ' + anim : '') }, [
        h('div', { class: 'pet-big', html: A.petSVG(p.pet, p.petAcc[p.pet]) }),
        anim === 'play' ? h('div', { class: 'pet-ball', html: A.obj('ball') }) : null,
        anim === 'eat' ? h('div', { class: 'pet-heart', text: '♥' }) : null,
        h('div', { class: 'bubble', text: petLine(anim) })
      ]);
      wrap.appendChild(big);
      var choose = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Chọn thú đồng hành' }, [h('span', { class: 'row-label', text: 'Bạn đồng hành' })]);
      ['mit', 'bong', 'dau'].forEach(function (k) {
        choose.appendChild(btn(h('span', { class: 'pet-chip', html: A.petSVG(k, p.petAcc[k]) + '<span>' + A.PET_NAMES[k] + '</span>' }), 'pet-pick' + (p.pet === k ? ' on' : ''), function () {
          p.pet = k; TT.store.save(); opts.onChange && opts.onChange(); render();
        }, { 'aria-pressed': p.pet === k ? 'true' : 'false' }));
      });
      wrap.appendChild(choose);
      wrap.appendChild(h('div', { class: 'row-actions wrap' }, [
        btn(h('span', { html: A.icon('treat') + ' Cho ăn bánh (' + p.treats + ')' }), 'secondary', function () {
          if (p.treats > 0) { p.treats--; TT.store.save(); opts.onChange && opts.onChange(); }
          TT.audio.play('reward'); TT.audio.pet(p.pet); render('eat');
        }),
        btn('Chơi bóng cùng bạn', 'secondary', function () { TT.audio.play('pop'); TT.audio.pet(p.pet); render('play'); }),
        btn('Nhiệm vụ: Cho thú ăn', 'primary', function () { opts.onMission('feed'); })
      ]));
      var accRow = h('div', { class: 'acc-row' }, [h('span', { class: 'row-label', text: 'Phụ kiện' })]);
      A.PET_ACC.forEach(function (ac) {
        var owned = ac.price === 0 || p.ownedAcc.indexOf(ac.id) >= 0;
        accRow.appendChild(btn(owned ? ac.name : ac.name + ' · ' + ac.price + ' sao', 'chip-btn' + (p.petAcc[p.pet] === ac.id ? ' on' : ''), function () {
          if (!owned) {
            if (p.stars < ac.price) { U.toast('Cần ' + ac.price + ' ngôi sao để đổi phụ kiện này.'); return; }
            p.stars -= ac.price; p.ownedAcc.push(ac.id); TT.audio.play('reward');
          }
          p.petAcc[p.pet] = ac.id; TT.store.save(); opts.onChange && opts.onChange(); render();
        }));
      });
      wrap.appendChild(accRow);
    }
    function petLine(anim) {
      var n = A.PET_NAMES[p.pet];
      if (anim === 'eat') return p.treats >= 0 ? 'Ngon quá! ' + n + ' cảm ơn bạn!' : '';
      if (anim === 'play') return 'Bắt được rồi! Chơi vui quá!';
      return n.charAt(0).toUpperCase() + n.slice(1) + ' luôn vui khi gặp bạn. Hôm nay mình chơi gì nhỉ?';
    }
    render();
  }

  /* =================== PHÒNG MỸ THUẬT: TÔ MÀU NHÂN VẬT ===================
   * Bé tô tóc, áo, váy/quần, giày, ba lô theo ý mình. Màu đầu tiên của mỗi hàng là màu đồng phục. */
  var PALETTE = {
    hc: [['', 'Đen nâu', '#3d2b2b'], ['#1f1f2e', 'Đen'], ['#6b4226', 'Nâu'], ['#a0522d', 'Hạt dẻ'], ['#c98a3b', 'Vàng nâu'], ['#e76f8a', 'Hồng'], ['#7b4bb7', 'Tím'], ['#2a9d8f', 'Xanh ngọc']],
    sh: [['', 'Trắng', '#ffffff'], ['#ffe5ec', 'Hồng phấn'], ['#e0f2ff', 'Xanh trời'], ['#fff3c4', 'Vàng kem'], ['#d8f3dc', 'Xanh bạc hà'], ['#ead7ff', 'Tím nhạt']],
    sk: [['', 'Xanh đồng phục', '#33508f'], ['#c1121f', 'Đỏ'], ['#7b4bb7', 'Tím'], ['#2a9d8f', 'Xanh ngọc'], ['#e76f8a', 'Hồng'], ['#3a3a4a', 'Đen']],
    so: [['', 'Tím than', '#5b4a8a'], ['#2b2f3a', 'Đen'], ['#f8f9fa', 'Trắng'], ['#e63946', 'Đỏ'], ['#4dabf7', 'Xanh'], ['#ff9f1c', 'Cam']],
    bag: [['#ff8fab', 'Hồng'], ['#7cc6fe', 'Xanh trời'], ['#ffd166', 'Vàng'], ['#95d5b2', 'Xanh lá'], ['#b8a1ff', 'Tím'], ['#ff9f1c', 'Cam']]
  };
  function studio(container, opts) {
    init();
    var p = P(), look = p.look;
    container.innerHTML = '';
    var wrap = h('div', { class: 'studio' });
    var view = h('div', { class: 'studio-view' });
    var tools = h('div', { class: 'studio-tools' });
    wrap.appendChild(view); wrap.appendChild(tools);
    container.appendChild(wrap);
    function commit() { TT.store.save(); opts.onChange && opts.onChange(); draw(); }
    function draw() {
      view.innerHTML = '<div class="studio-figs">' + A.girlSVG(look, 'char') + A.svg('0 0 120 200', A.girlBack(look), 'char') + '</div>';
      view.appendChild(h('p', { class: 'muted small', text: 'Nhìn từ trước và từ sau lưng' }));
      tools.innerHTML = '';
      function swatches(label, key) {
        var row = h('div', { class: 'chip-row', role: 'group', 'aria-label': label }, [h('span', { class: 'row-label', text: label })]);
        PALETTE[key].forEach(function (c) {
          var on = (look[key] || '') === c[0];
          row.appendChild(btn(h('span', { class: 'swatch', style: 'background:' + (c[2] || c[0]) }), 'chip-btn swatch-btn' + (on ? ' on' : ''), function () {
            if (c[0]) look[key] = c[0]; else delete look[key];
            commit();
          }, { 'aria-pressed': on ? 'true' : 'false', 'aria-label': c[1], title: c[1] }));
        });
        tools.appendChild(row);
      }
      function chips(label, key, items) {
        var row = h('div', { class: 'chip-row', role: 'group', 'aria-label': label }, [h('span', { class: 'row-label', text: label })]);
        items.forEach(function (name, i) {
          row.appendChild(btn(name, 'chip-btn' + ((look[key] || 0) === i ? ' on' : ''), function () { look[key] = i; commit(); }, { 'aria-pressed': (look[key] || 0) === i ? 'true' : 'false' }));
        });
        tools.appendChild(row);
      }
      swatches('Màu tóc', 'hc');
      chips('Kiểu tóc', 'hair', look.boy ? ['Tóc ngắn', 'Đầu đinh', 'Tóc mái lệch'] : ['Hai bím', 'Tóc ngắn', 'Tóc dài']);
      swatches('Màu áo', 'sh');
      swatches(look.boy ? 'Màu quần' : 'Màu váy', 'sk');
      swatches('Màu giày', 'so');
      swatches('Màu ba lô', 'bag');
      chips('Phụ kiện', 'acc', look.boy ? ['Không', 'Mũ lưỡi trai', 'Kính tròn', 'Huy hiệu sao'] : ['Không', 'Nơ hồng', 'Bờm vàng', 'Kẹp ngôi sao']);
      tools.appendChild(h('div', { class: 'row-actions wrap' }, [
        btn('Tô ngẫu nhiên', 'secondary', function () {
          ['hc', 'sh', 'sk', 'so', 'bag'].forEach(function (k) { var c = E.pick(PALETTE[k]); if (c[0]) look[k] = c[0]; else delete look[k]; });
          look.hair = Math.floor(Math.random() * 3); look.acc = Math.floor(Math.random() * 4);
          TT.audio.play('pop'); commit();
        }, { id: 'btn-random' }),
        btn('Về đồng phục', 'ghost', function () { delete look.hc; delete look.sh; delete look.sk; delete look.so; commit(); }),
        btn('Xong', 'primary big', function () { opts.onDone && opts.onDone(); }, { id: 'btn-studio-done' })
      ]));
    }
    draw();
  }

  /* =================== HƯỚNG DẪN CHƠI =================== */
  function guide(opts) {
    init();
    var touch = document.body.classList.contains('touch');
    var steps = [
      ['walk', 'Đi lại', touch ? 'Giữ ngón tay trên vòng tròn ở góc trái và nghiêng về hướng con muốn đi. Con cũng có thể chạm vào nơi muốn tới.' : 'Dùng phím mũi tên hoặc W A S D. Con cũng có thể nhấn giữ chuột, bạn nhỏ sẽ đi theo.'],
      ['door', 'Vào một nơi', 'Đứng gần cửa lớp, thư viện, vườn… sẽ hiện nút vàng. ' + (touch ? 'Chạm nút vàng để vào.' : 'Nhấn Enter hoặc bấm nút vàng để vào.') + ' Thanh “Đi nhanh” đưa con tới thẳng từng nơi.'],
      ['hint', 'Đường tới trường', 'Đi trên vỉa hè tới vạch sang đường. Đèn cho người đi bộ đỏ thì đứng chờ, đèn xanh thì nhìn hai bên rồi sang. Sang đúng luật được thưởng sao!'],
      ['book', 'Học và luyện', 'Chạm “Bảng lớp” hoặc “Môn học” để chọn Cửu chương, Toán, Khoa học, Tiếng Anh, Kỹ năng sống. Mỗi lượt có 6 câu.'],
      ['speak', 'Làm sai không sao cả', 'Sai lần đầu sẽ có gợi ý. Sai lần nữa, cô sẽ chỉ đáp án và giải thích. Câu đó lát sau được hỏi lại để con nhớ.'],
      ['star', 'Ngôi sao để làm gì?', 'Xong mỗi lượt con được ngôi sao và bánh cho thú. Dùng sao để trang trí đảo và mua phụ kiện cho thú cưng.'],
      ['art', 'Tô màu nhân vật', 'Vào Phòng Mỹ thuật để tô màu tóc, áo, váy, giày, ba lô cho nhân vật thật xinh theo ý con.'],
      ['pets', 'Trò chuyện và khám phá', 'Chạm vào thầy cô, các bạn, chú chim, cái cây, lá cờ, vòi rửa tay… Ai cũng có điều muốn nói với con.'],
      ['home', 'Nghỉ ngơi', 'Chơi một lúc thì cho mắt nghỉ nhé. Tiến độ của con được lưu lại, lần sau vào chơi tiếp.']
    ];
    var list = h('ol', { class: 'guide-list' });
    steps.forEach(function (st) {
      list.appendChild(h('li', {}, [h('span', { class: 'guide-ico', html: A.icon(st[0]) }), h('span', { class: 'guide-txt' }, [h('b', { text: st[1] }), h('span', { text: st[2] })])]));
    });
    var row = h('div', { class: 'row-actions' });
    if (TT.audio.canSpeak()) row.appendChild(btn(h('span', { html: A.icon('speak') + ' Nghe đọc' }), 'ghost', function () { TT.audio.speak(steps.map(function (st) { return st[1] + '. ' + st[2]; }).join(' ')); }));
    row.appendChild(btn('Con hiểu rồi', 'primary big', function () { opts && opts.onClose && opts.onClose(); }, { id: 'btn-guide-ok' }));
    return h('div', { class: 'guide' }, [h('h2', { text: 'Hướng dẫn chơi' }), list, row]);
  }

  /* =================== LỜI THOẠI NPC =================== */
  function npcLines(n, p) {
    init();
    var name = charName();
    var pet = A.PET_NAMES[p.pet];
    var lines = {
      binh: ['Chào ' + name + '! Chú Bình chúc con một ngày học vui nhé.', 'Nhớ rửa tay trước khi ăn nha con!', 'Cổng khám phá bên trái dẫn sang đảo thú cưng đó.',
        'Ra về nhớ chờ bố mẹ ở trong cổng trường, đừng chạy ra đường nhé.', 'Con thấy đồ rơi thì mang ra chốt bảo vệ, chú tìm người trả lại.', 'Hôm nay sân trường sạch quá, cảm ơn các con đã không xả rác.',
        'Trống trường là chú đánh đấy: tùng… tùng… tùng!', pet.charAt(0).toUpperCase() + pet.slice(1) + ' của con ngoan quá, đi đâu cũng theo.'],
      hang: ['Cô Hằng đây! Con lên bảng lớp, mình học phép nhân bằng hình nhé.', 'Phép nhân là cộng các nhóm bằng nhau đó con.', 'Sai cũng không sao, mình nhìn hình rồi thử lại.', 'Con về bàn học ngồi, cô trò mình cùng luyện vài câu nhé.',
        'Hôm nay ' + name + ' muốn học môn gì? Con chạm vào bảng lớp để chọn nhé.', 'Con nhớ đọc kĩ đề bài trước khi chọn đáp án.', 'Bảng 5 điều Bác Hồ dạy ở trên tường kia, con đọc thuộc chưa?',
        'Mỗi ngày học một ít, đều đặn thì nhớ rất lâu.', 'Cô thấy ' + name + ' tiến bộ từng ngày đấy!', 'Học xong con nhớ ra sân chơi cho mắt được nghỉ nhé.'],
      lan: ['Hello! Cô là cô Lan, dạy Tiếng Anh. How are you today?', 'Mỗi ngày học vài từ mới là con giỏi Tiếng Anh ngay thôi.', 'Con nhớ nghe máy đọc rồi đọc theo thật to nhé!',
        'Good morning, ' + name + '! Hôm nay mình học từ gì nào?', '"Thank you" là cảm ơn, "sorry" là xin lỗi. Hai từ này dùng mỗi ngày đấy.', 'Con thử đếm bằng tiếng Anh: one, two, three…',
        'What\'s your favourite subject? Môn con thích nhất là gì?', 'Đọc sai cũng không sao. Cứ mạnh dạn nói là tiến bộ.', 'See you later! Hẹn gặp lại con.'],
      nam: ['Thầy Nam dạy Khoa học đây. Con có biết vì sao có mưa không?', 'Hôm nay mình thử một nhiệm vụ mới nhé?', 'Mỗi nhiệm vụ chỉ vài câu thôi, làm xong mình nghỉ.',
        'Nước có ba thể: rắn, lỏng và khí. Con kể được ví dụ không?', 'Cây xanh quang hợp tạo ra khí ô-xi cho chúng ta thở.', 'Âm thanh sinh ra khi vật rung động. Con thử sờ vào cổ khi nói xem!',
        'Bóng của con dài nhất vào sáng sớm và chiều muộn đấy.', 'Thấy điều gì lạ thì cứ hỏi "Vì sao?". Đó là cách các nhà khoa học bắt đầu.', 'Xem bảng tin đi con, hôm nay thầy có nhiệm vụ mới.'],
      hoa: ['Thư viện có trò ghép thẻ phép tính đó con.', 'Cô Hoa thích nhất là bạn nào đọc kỹ câu hỏi.', 'Ghép đúng thẻ là con nhớ thêm một phép tính rồi!',
        'Vào thư viện mình đi nhẹ, nói khẽ nhé.', 'Đọc sách mỗi ngày giúp con biết thêm bao điều hay.', 'Đọc xong con nhớ để sách về đúng chỗ.', 'Con thích truyện cổ tích hay truyện khoa học?', 'Ngồi đọc sách thẳng lưng, đủ ánh sáng cho mắt khoẻ nhé.'],
      tam: ['Cô Tâm nấu bếp đây. Hôm nay nhà ăn có canh rau và cá kho, ngon lắm!', 'Con nhớ rửa tay bằng xà phòng trước khi ăn nhé.', 'Quà vặt không rõ nguồn gốc ở cổng trường, con đừng mua kẻo đau bụng.',
        'Ăn đủ cơm, thịt cá, rau và quả thì mới mau lớn.', 'Uống nước lọc tốt hơn nước ngọt nhiều lắm con ạ.', 'Ăn chậm, nhai kĩ, không vừa ăn vừa chạy nhảy nhé.', 'Ăn xong nhớ súc miệng và cất khay đúng chỗ.', 'Đồ ăn có mùi lạ hay hết hạn thì tuyệt đối không ăn, con nhé.'],
      congan: ['Chào con! Chú là cảnh sát giao thông, giữ cho đường phố an toàn.', 'Đèn đỏ dừng lại, đèn vàng đi chậm, đèn xanh mới được đi.', 'Sang đường thì đi trên vạch kẻ đường và nhìn kĩ hai bên, con nhé.',
        'Ngồi xe máy nhớ đội mũ bảo hiểm và cài quai cẩn thận.', 'Không chơi đùa dưới lòng đường, nguy hiểm lắm.', 'Đi bộ thì đi trên vỉa hè, sát mép đường.', 'Con muốn học thêm về an toàn giao thông không? Chú có vài câu đố đây.', 'Chúc con đi học vui! Qua đường nhớ chờ đèn xanh.'],
      nong: ['Chào cháu! Bác đang thăm đồng. Lúa năm nay tốt lắm.', 'Hạt gạo cháu ăn là từ cây lúa này đấy. Làm ra hạt gạo vất vả lắm.', 'Con trâu là bạn của nhà nông, giúp bác cày ruộng.',
        'Cò trắng hay về đồng bắt tôm tép.', 'Cháu ăn cơm nhớ ăn hết, đừng bỏ thừa nhé.', 'Trời nắng thì lúa mau chín, trời mưa thì lúa có nước.', 'Đi học chăm ngoan nhé cháu!'],
      kid: ['Chào ' + name + '! Mình cùng chơi nhé!', 'Mình hay nhớ bảng 5 bằng cách đếm 5, 10, 15...', 'Bảng 9 có mẹo hay lắm: 10 nhóm rồi bớt 1 nhóm!', 'Ra sân thể thao chuyền bóng với mình không?',
        'Cậu chạm vào chú chim trên sân chưa? Nó hót hay lắm!', 'Tớ vừa được 3 ngôi sao ở Vườn toán học đấy.', 'Cậu tô màu nhân vật ở Phòng Mỹ thuật chưa? Vui lắm!', 'Sáng nay tớ chờ đèn xanh mới sang đường, được chú Cảnh sát khen.',
        'Cô Lan dạy tớ nói "Good morning". Good morning, ' + name + '!', 'Tớ thích môn Khoa học nhất vì được biết vì sao có mưa.', 'Giờ ra chơi mình ra ghế đá ngồi nhé.', pet.charAt(0).toUpperCase() + pet.slice(1) + ' của cậu đáng yêu quá!'],
      seat: ['Chào ' + name + '! Bàn của bạn ở giữa hàng đầu đó.', 'Tớ đang chép bảng nhân trên bảng lớp nè.', 'Bảng 2 dễ lắm: cứ đếm cách 2 là ra!', 'Tí nữa ra chơi mình ra sân nghe chim hót nhé!',
        'Cậu thuộc 5 điều Bác Hồ dạy chưa? Tớ thuộc rồi đấy.', 'Tớ đố cậu: 7 × 8 bằng bao nhiêu?', 'Suỵt… cô Hằng đang nhìn kìa, mình học bài thôi.', 'Cho tớ mượn cục tẩy với!', 'Hôm nay có tiết Tiếng Anh của cô Lan, tớ thích lắm.']
    };
    if (n.seat) return lines.seat;
    return n.kind === 'kid' ? lines.kid : lines[n.id];
  }

  TT.act = { studio: studio, guide: guide, learn: learn, library: library, board: board, art: art, island: island, pets: pets,
    todayQuest: todayQuest, tableProgress: tableProgress, npcLines: npcLines, QUEST_GAMES: QUEST_GAMES };
})(window);
