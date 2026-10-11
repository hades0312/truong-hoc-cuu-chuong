/* quiz.js: bộ chạy nhiệm vụ dùng chung cho các trò chơi (cho thú ăn, xây cầu, tìm kho báu,
 * vườn toán học, chuyền bóng, nhà ăn chia phần, ôn lại, làm quen).
 * Xử lý: đáp án đúng/sai, gợi ý 2 mức, hỏi lại câu sai sau vài câu, chống ghi điểm lặp. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var E, A, U, h, btn;

  var PRAISE_SELF = ['Đúng rồi!', 'Chính xác!', 'Làm tốt lắm!'];

  function init() { E = TT.engine; A = TT.art; U = TT.ui; h = U.h; btn = U.btn; }

  /* ---------- Tạo câu hỏi ---------- */
  function makeQuestion(fact, kind, profile, ctxAvoid) {
    var rec = profile.facts[fact.key];
    var format = E.formatFor(rec);
    var ctxs = A.CONTEXTS.filter(function (c) { return c !== ctxAvoid; });
    var q = { fact: fact, kind: kind || 'normal', ctx: E.pick(ctxs), format: format };
    if (fact.op === 'div') {
      q.expr = fact.c + ' ÷ ' + fact.a + ' = ?';
      q.answer = fact.b;
      q.story = 'Có ' + fact.c + ' cái bánh, xếp đều mỗi khay ' + fact.a + ' cái. Xếp được mấy khay?';
      q.ctx = { group: 'khay', unit: 'cái bánh', icon: 'cookie' };
    } else if (q.kind === 'missing') {
      q.expr = fact.a + ' × ? = ' + fact.c;
      q.answer = fact.b;
      q.story = 'Tìm số còn thiếu để mở rương kho báu.';
    } else {
      q.expr = fact.a + ' × ' + fact.b + ' = ?';
      q.answer = fact.c;
      q.story = 'Mỗi ' + q.ctx.group + ' có ' + fact.a + ' ' + q.ctx.unit + '. Có ' + fact.b + ' ' + q.ctx.group +
        '. Có tất cả bao nhiêu ' + q.ctx.unit + '?';
    }
    q.choices = choicesFor(q, format === 'input' ? 3 : format);
    return q;
  }

  function choicesFor(q, n) {
    if (q.kind === 'missing' || q.fact.op === 'div') {
      var ans = q.answer, seen = {}, out = [];
      seen[ans] = true;
      [1, -1, 2, -2, 3, -3, 4, 5].forEach(function (d) {
        var v = ans + d;
        if (out.length < n - 1 && v >= 1 && v <= 10 && !seen[v]) { seen[v] = true; out.push(v); }
      });
      return E.shuffle([ans].concat(out));
    }
    return E.makeChoices(q.fact, n);
  }

  /* ---------- Chạy một nhiệm vụ ----------
   * cfg: {theme, facts:[fact], title, onDone(result), onExit} */
  function run(container, cfg) {
    init();
    var profile = TT.store.profile();
    var theme = THEMES[cfg.theme];
    var queue = cfg.facts.map(function (f, i) { return { fact: f, kind: theme.kind ? theme.kind(f, i) : 'normal' }; });
    var total = queue.length;
    var state = { idx: 0, correctCount: 0, extra: 0, done: false, results: [], solidBefore: {} };
    var cur = null; // câu hiện tại
    var token = 0;  // chống xử lý trùng giữa các câu

    container.innerHTML = '';
    var root = h('div', { class: 'quiz theme-' + cfg.theme });
    var top = h('div', { class: 'q-top' });
    var progress = h('div', { class: 'q-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total) });
    top.appendChild(progress);
    var main = h('div', { class: 'q-main' });
    var stage = h('div', { class: 'q-stage' });
    var panel = h('div', { class: 'q-panel' });
    main.appendChild(stage); main.appendChild(panel);
    root.appendChild(top); root.appendChild(main);
    container.appendChild(root);
    theme.setup && theme.setup(stage, { total: total, profile: profile });

    function renderProgress() {
      progress.innerHTML = '';
      for (var i = 0; i < total; i++) {
        progress.appendChild(h('span', { class: 'pdot' + (i < state.correctCount ? ' on' : '') + (i === state.correctCount ? ' cur' : '') }));
      }
      progress.setAttribute('aria-valuenow', String(state.correctCount));
      progress.setAttribute('aria-label', 'Đã xong ' + state.correctCount + ' trên ' + total + ' câu');
    }

    function next() {
      if (state.done) return;
      if (state.idx >= queue.length) return finish();
      token++;
      var item = queue[state.idx];
      var q = makeQuestion(item.fact, item.kind, profile, item.prevCtx);
      cur = { q: q, attempt: 0, usedHint: false, locked: false, token: token, item: item, wrongVals: {} };
      var st = E.status(profile.facts[q.fact.key]);
      state.solidBefore[q.fact.key] = state.solidBefore[q.fact.key] || (st === 'solid' ? 'y' : 'n');
      renderProgress();
      theme.stage(stage, q, { profile: profile, done: state.correctCount, total: total });
      renderPanel();
    }

    function renderPanel() {
      var q = cur.q;
      panel.innerHTML = '';
      var prompt = h('div', { class: 'q-prompt' });
      if (theme.showStory !== false && (theme.showStory === true || q.fact.op === 'div' || q.kind === 'missing' || state.idx % 2 === 1)) {
        prompt.appendChild(h('p', { class: 'q-story', text: q.story }));
      }
      var exprRow = h('div', { class: 'q-expr-row' }, [h('div', { class: 'q-expr', text: q.expr, 'aria-live': 'polite' })]);
      if (TT.audio.canSpeak()) {
        exprRow.appendChild(U.iconBtn('speak', 'Nghe đọc câu hỏi', function () {
          TT.audio.speak((prompt.querySelector('.q-story') ? q.story + '. ' : '') + q.expr);
        }, 'small'));
      }
      prompt.appendChild(exprRow);
      panel.appendChild(prompt);
      var answers = h('div', { class: 'q-answers' });
      panel.appendChild(answers);
      var fb = h('div', { class: 'q-feedback', role: 'status', 'aria-live': 'polite' });
      panel.appendChild(fb);
      var tools = h('div', { class: 'q-tools' });
      tools.appendChild(btn(h('span', { html: A.icon('hint') + ' Gợi ý' }), 'hint-btn', showHintVisual));
      panel.appendChild(tools);
      var hintBox = h('div', { class: 'q-hint', hidden: true });
      panel.appendChild(hintBox);
      renderAnswers();
    }

    function renderAnswers(forceChoices) {
      var q = cur.q;
      var answers = panel.querySelector('.q-answers');
      answers.innerHTML = '';
      var useInput = q.format === 'input' && !forceChoices;
      if (useInput) {
        answers.appendChild(numpad(function (v) { submit(v); }));
      } else {
        answers.className = 'q-answers choices n' + q.choices.length;
        q.choices.forEach(function (v, i) {
          var b = h('button', { type: 'button', class: 'choice', 'data-v': String(v), 'aria-label': 'Đáp án ' + v });
          b.innerHTML = (theme.choiceDeco ? theme.choiceDeco(v, i, profile) : '') + '<span class="cv">' + v + '</span><kbd>' + (i + 1) + '</kbd>';
          if (cur.wrongVals[v]) { b.disabled = true; b.classList.add('tried'); }
          if (cur.guide && v === q.answer) b.classList.add('guide');
          b.addEventListener('click', function () { submit(v, b); });
          answers.appendChild(b);
        });
      }
    }

    function numpad(onOk) {
      var val = '';
      var wrap = h('div', { class: 'numpad' });
      var disp = h('output', { class: 'np-display', 'aria-live': 'polite', text: '?' });
      wrap.appendChild(disp);
      var keys = h('div', { class: 'np-keys' });
      function upd() { disp.textContent = val || '?'; }
      function press(k) {
        if (cur.locked) return;
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'ok') { if (val) { var v = parseInt(val, 10); val = ''; upd(); onOk(v); } return; }
        else if (val.length < 3) val += k;
        TT.audio.play('pop');
        upd();
      }
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach(function (k) {
        var label = k === 'del' ? 'Xóa' : (k === 'ok' ? 'Xong' : k);
        var b = h('button', { type: 'button', class: 'np-key' + (k === 'ok' ? ' ok' : '') + (k === 'del' ? ' del' : ''), text: label, 'aria-label': k === 'del' ? 'Xóa số' : (k === 'ok' ? 'Xong, gửi đáp án' : 'Số ' + k) });
        b.addEventListener('click', function () { press(k); });
        keys.appendChild(b);
      });
      wrap.appendChild(keys);
      wrap._press = press;
      return wrap;
    }

    function showHintVisual() {
      if (cur.locked) return;
      cur.usedHint = true;
      var box = panel.querySelector('.q-hint');
      box.hidden = false;
      box.innerHTML = '';
      box.appendChild(TT.visual.hintPanel(hintFact(cur.q), cur.q.ctx, false));
      setFeedback('Mình cùng nhìn các nhóm nhé.', 'info');
    }

    function hintFact(q) { return q.fact; }

    function setFeedback(text, kind) {
      var fb = panel.querySelector('.q-feedback');
      fb.className = 'q-feedback ' + (kind || '');
      fb.textContent = text;
    }

    function submit(v, buttonEl) {
      if (state.done || cur.locked) return;
      var myToken = cur.token;
      cur.locked = true; // khóa ngay để chống bấm liên tục
      var q = cur.q;
      if (v === q.answer) {
        onCorrect(myToken, buttonEl);
      } else {
        onWrong(v, buttonEl);
      }
    }

    function onCorrect(myToken, buttonEl) {
      var q = cur.q;
      var outcome = cur.attempt === 0 ? 'self' : (cur.attempt === 1 ? 'retry' : 'guided');
      var prevRec = profile.facts[q.fact.key];
      var hadWrong = prevRec && prevRec.wrong > 0;
      var rec = E.recordAttempt(profile, q.fact, outcome, cur.usedHint);
      var day = TT.store.today(profile);
      var msg;
      if (outcome === 'self' && !cur.usedHint) {
        profile.stats.selfCorrect++;
        if (day.self.indexOf(q.fact.key) < 0) day.self.push(q.fact.key);
        msg = (hadWrong || Math.random() < 0.25) ? 'Con đã tự làm đúng phép tính này!' : E.pick(PRAISE_SELF);
      } else if (outcome === 'guided') {
        profile.stats.guided++;
        msg = 'Mình đã cùng nhau làm xong. Lát nữa con thử lại nhé!';
      } else {
        profile.stats.hintCorrect++;
        msg = 'Con biết dùng gợi ý để tìm ra đáp án rồi!';
      }
      if (E.status(rec) === 'solid' && state.solidBefore[q.fact.key] === 'n' && day.remembered.indexOf(q.fact.key) < 0) {
        day.remembered.push(q.fact.key);
      }
      TT.store.save();
      state.results.push({ key: q.fact.key, outcome: outcome, hint: cur.usedHint });
      state.correctCount = Math.min(total, state.correctCount + (cur.item.isRepeat ? 0 : 1));
      TT.audio.play('correct');
      var full = q.kind === 'missing' ? (q.fact.a + ' × ' + q.fact.b + ' = ' + q.fact.c)
        : (q.fact.op === 'div' ? (q.fact.c + ' ÷ ' + q.fact.a + ' = ' + q.fact.b) : (q.fact.a + ' × ' + q.fact.b + ' = ' + q.fact.c));
      panel.querySelector('.q-expr').textContent = full;
      setFeedback(msg, 'good');
      panel.querySelectorAll('.choice, .np-key, .hint-btn').forEach(function (b) { b.disabled = true; });
      if (buttonEl) buttonEl.classList.add('right');
      renderProgress();
      theme.onCorrect && theme.onCorrect(stage, q, { done: state.correctCount, total: total, button: buttonEl, profile: profile });
      // Câu sai sẽ được hỏi lại sau vài câu, đổi hình và thứ tự đáp án
      if (outcome !== 'self' && !cur.item.isRepeat && state.extra < 2) {
        state.extra++;
        var pos = Math.min(queue.length, state.idx + 3);
        queue.splice(pos, 0, { fact: q.fact, kind: cur.item.kind, isRepeat: true, prevCtx: q.ctx });
      }
      state.idx++;
      var tools = panel.querySelector('.q-tools');
      tools.innerHTML = '';
      var go = btn('Tiếp tục', 'primary big', function () { if (myToken === token) next(); });
      tools.appendChild(go);
      go.focus({ preventScroll: true });
      if (outcome === 'self' && !cur.usedHint) {
        setTimeout(function () { if (myToken === token && !state.done) next(); }, 1500);
      }
    }

    function onWrong(v, buttonEl) {
      var q = cur.q;
      cur.attempt++;
      cur.wrongVals[v] = true;
      TT.audio.play('soft');
      if (buttonEl) { buttonEl.disabled = true; buttonEl.classList.add('tried'); }
      var box = panel.querySelector('.q-hint');
      box.hidden = false; box.innerHTML = '';
      if (cur.attempt === 1) {
        setFeedback('Gần rồi! Mình thử nhìn các nhóm nhé.', 'info');
        box.appendChild(TT.visual.hintPanel(q.fact, q.ctx, false));
        cur.locked = false;
        if (q.format === 'input') renderAnswers();
      } else {
        cur.guide = true;
        setFeedback('Mình cùng làm từng bước nhé. Con chạm vào đáp án đang sáng.', 'info');
        box.appendChild(TT.visual.hintPanel(q.fact, q.ctx, true));
        // Đảm bảo đáp án đúng có trong lựa chọn và được làm nổi bật
        if (q.format === 'input' || q.choices.indexOf(q.answer) < 0) {
          q.format = 3; q.choices = choicesFor(q, 3);
        }
        cur.locked = false;
        renderAnswers(true);
      }
      box.scrollIntoView && box.scrollIntoView({ block: 'nearest', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
    }

    function finish() {
      if (state.done) return;
      state.done = true;
      token++;
      var res = {
        total: total,
        self: state.results.filter(function (r) { return r.outcome === 'self' && !r.hint; }).length,
        helped: state.results.filter(function (r) { return r.outcome !== 'self' || r.hint; }).length,
        theme: cfg.theme,
        results: state.results
      };
      cfg.onDone && cfg.onDone(res);
    }

    function onKey(e) {
      if (!document.body.contains(root)) { document.removeEventListener('keydown', onKey); return; }
      if (state.done || !cur || cur.locked) return;
      if (document.querySelector('.modal-wrap, .dialog-wrap')) return;
      var np = panel.querySelector('.numpad');
      if (np) {
        if (/^[0-9]$/.test(e.key)) { np._press(e.key); e.preventDefault(); }
        else if (e.key === 'Backspace') { np._press('del'); e.preventDefault(); }
        else if (e.key === 'Enter') { np._press('ok'); e.preventDefault(); }
        return;
      }
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) {
        var b = panel.querySelectorAll('.choice')[n - 1];
        if (b && !b.disabled) { b.click(); e.preventDefault(); }
      }
    }
    document.addEventListener('keydown', onKey);

    next();
    return { finish: finish, destroy: function () { state.done = true; token++; document.removeEventListener('keydown', onKey); } };
  }

  /* ---------- Chủ đề từng trò chơi (sân khấu tĩnh khi đang giải toán) ---------- */
  function npcBubble(avatarHTML, text) {
    return h('div', { class: 'stage-npc' }, [h('div', { class: 'stage-avatar', html: avatarHTML }), h('div', { class: 'bubble', text: text })]);
  }
  function petName(p) { return A.PET_NAMES[p.pet].split(' ').pop(); }

  var THEMES = {
    warmup: {
      showStory: false,
      stage: function (el, q, info) {
        el.innerHTML = '';
        el.appendChild(npcBubble(A.adultSVG('hang'), 'Cô Hằng: Mình làm quen với lớp học bằng vài câu nhẹ nhàng nhé. Con cứ bình tĩnh, sai thì mình thử lại!'));
      }
    },
    feed: {
      showStory: false,
      stage: function (el, q, info) {
        var p = info.profile;
        el.innerHTML = '';
        var box = h('div', { class: 'stage-feed' });
        box.appendChild(h('div', { class: 'feed-pet', html: A.petSVG(p.pet, p.petAcc[p.pet]) }));
        box.appendChild(h('div', { class: 'bubble', text: petName(p) + ' muốn ăn món ngon! Đĩa nào có số đúng nhỉ?' }));
        el.appendChild(box);
      },
      choiceDeco: function () { return '<span class="deco bowl">' + A.svg('0 0 60 30', '<ellipse cx="30" cy="10" rx="26" ry="8" fill="#ffd6a5"/><path d="M4 10 Q30 40 56 10 Z" fill="#ff8fab"/><circle cx="20" cy="7" r="4" fill="#e76f51"/><circle cx="34" cy="6" r="4" fill="#f4a261"/>') + '</span>'; },
      onCorrect: function (el) {
        var pet = el.querySelector('.feed-pet');
        if (pet) { pet.classList.remove('happy'); void pet.offsetWidth; pet.classList.add('happy'); }
        var bub = el.querySelector('.bubble'); if (bub) bub.textContent = 'Ngon quá! Cảm ơn bạn nhé!';
      }
    },
    bridge: {
      showStory: false,
      setup: function (el, info) { el._planks = 0; el._total = info.total; },
      stage: function (el, q, info) {
        var p = info.profile;
        el.innerHTML = '';
        var box = h('div', { class: 'stage-bridge' });
        box.appendChild(h('div', { class: 'bank left', html: A.girlSVG(p.look) }));
        var br = h('div', { class: 'planks' });
        for (var i = 0; i < info.total; i++) br.appendChild(h('span', { class: 'plank' + (i < info.done ? ' on' : '') }));
        box.appendChild(br);
        box.appendChild(h('div', { class: 'bank right', html: A.petSVG(p.pet, p.petAcc[p.pet]) }));
        box.appendChild(h('p', { class: 'stage-cap', text: 'Mỗi câu đúng đặt thêm 1 tấm ván. Cầu dẫn sang đảo thú cưng!' }));
        el.appendChild(box);
      },
      choiceDeco: function () { return '<span class="deco plank-deco"></span>'; },
      onCorrect: function (el, q, info) {
        var pl = el.querySelectorAll('.plank');
        if (pl[info.done - 1]) pl[info.done - 1].classList.add('on', 'pop');
        if (info.done >= info.total) { var c = el.querySelector('.stage-cap'); if (c) c.textContent = 'Cầu đã xong! Mình cùng sang đảo nhé!'; el.querySelector('.stage-bridge').classList.add('complete'); }
      }
    },
    treasure: {
      showStory: true,
      kind: function (f, i) { return i % 2 === 1 ? 'missing' : 'normal'; },
      stage: function (el, q, info) {
        el.innerHTML = '';
        var box = h('div', { class: 'stage-treasure' });
        var found = h('div', { class: 'found' });
        for (var i = 0; i < info.total; i++) found.insertAdjacentHTML('beforeend', '<span class="gem' + (i < info.done ? ' on' : '') + '">' + A.obj('star') + '</span>');
        box.appendChild(h('div', { class: 'map', html: A.svg('0 0 200 120', '<rect width="200" height="120" rx="12" fill="#fdf0d5"/><path d="M20 100 Q60 20 100 70 T180 30" fill="none" stroke="#c68b59" stroke-width="4" stroke-dasharray="8 8"/><path d="M170 20 l16 16 M186 20 l-16 16" stroke="#e63946" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="40" r="10" fill="#6ccf8e"/><circle cx="130" cy="96" r="12" fill="#6ccf8e"/>') }));
        box.appendChild(found);
        el.appendChild(box);
      },
      choiceDeco: function () { return '<span class="deco chest">' + A.svg('0 0 60 40', '<rect x="6" y="14" width="48" height="24" rx="4" fill="#c68b59"/><path d="M6 16 Q30 -4 54 16Z" fill="#a0673b"/><rect x="26" y="16" width="8" height="10" rx="2" fill="#ffd166"/>') + '</span>'; },
      onCorrect: function (el, q, info) {
        var g = el.querySelectorAll('.gem');
        if (g[info.done - 1]) g[info.done - 1].classList.add('on', 'pop');
      }
    },
    garden: {
      showStory: true,
      stage: function (el, q) {
        el.innerHTML = '';
        var ctx = { group: 'cây', unit: 'quả', icon: q.fact.a % 2 ? 'orange' : 'apple' };
        q.story = 'Có ' + q.fact.b + ' cây, mỗi cây có ' + q.fact.a + ' quả. Thu hoạch được tất cả bao nhiêu quả?';
        q.ctx = ctx;
        var box = h('div', { class: 'stage-garden' });
        box.appendChild(TT.visual.groups(q.fact, { ctx: ctx, container: 'tree' }));
        box.appendChild(h('div', { class: 'basket', html: A.svg('0 0 80 50', '<path d="M6 16 H74 L66 46 H14 Z" fill="#c68b59"/><path d="M14 16 Q40 -14 66 16" fill="none" stroke="#a0673b" stroke-width="5"/><path d="M12 26 H68 M16 36 H64" stroke="#a0673b" stroke-width="3"/>') + '<span class="basket-n"></span>' }));
        el.appendChild(box);
      },
      onCorrect: function (el, q) {
        el.querySelectorAll('.group').forEach(function (g) { g.classList.add('picked'); });
        var n = el.querySelector('.basket-n'); if (n) n.textContent = q.fact.c + ' quả';
      }
    },
    sports: {
      showStory: false,
      stage: function (el, q, info) {
        var p = info.profile;
        el.innerHTML = '';
        var box = h('div', { class: 'stage-sports' });
        box.appendChild(h('div', { class: 'sp-me', html: A.girlSVG(p.look) + '<span class="sp-ball">' + A.obj('ball') + '</span>' }));
        box.appendChild(h('p', { class: 'stage-cap', text: 'Chuyền bóng cho bạn cầm tấm thẻ có đáp án đúng!' }));
        el.appendChild(box);
      },
      choiceDeco: function (v, i, p) {
        var name = p.classmates[i % p.classmates.length];
        return '<span class="deco mate">' + A.kidSVG(name, i) + '</span><span class="mate-name">' + name + '</span>';
      },
      onCorrect: function (el, q, info) {
        if (info.button) info.button.classList.add('got-ball');
        var ball = el.querySelector('.sp-ball'); if (ball) ball.classList.add('thrown');
      }
    },
    canteen: {
      showStory: true,
      stage: function (el, q) {
        el.innerHTML = '';
        var box = h('div', { class: 'stage-canteen' });
        box.appendChild(h('p', { class: 'stage-cap', text: 'Có ' + q.fact.c + ' cái bánh:' }));
        box.appendChild(TT.visual.pile(q.fact.c, 'cookie'));
        el.appendChild(box);
      },
      choiceDeco: function () { return '<span class="deco tray-deco"></span>'; },
      onCorrect: function (el, q) {
        el.innerHTML = '';
        var box = h('div', { class: 'stage-canteen' });
        box.appendChild(h('p', { class: 'stage-cap', text: 'Xếp mỗi khay ' + q.fact.a + ' cái được ' + q.fact.b + ' khay:' }));
        box.appendChild(TT.visual.groups(q.fact, { ctx: { group: 'khay', unit: 'cái bánh', icon: 'cookie' }, container: 'tray' }));
        el.appendChild(box);
      }
    },
    review: {
      stage: function (el, q, info) {
        var p = info.profile;
        el.innerHTML = '';
        var lines = ['Mình ôn lại vài phép tính cùng nhau nhé!', 'Câu này mình đã gặp rồi, thử lại xem!', 'Từ từ thôi, mình có gợi ý mà.'];
        el.appendChild(npcBubble(A.petSVG(p.pet, p.petAcc[p.pet]), A.PET_NAMES[p.pet].replace(/^./, function (c) { return c.toUpperCase(); }) + ': ' + lines[info.done % lines.length]));
      }
    }
  };

  TT.quiz = { run: run, makeQuestion: function (f, k, p) { init(); return makeQuestion(f, k, p); }, THEMES: THEMES };
})(window);
