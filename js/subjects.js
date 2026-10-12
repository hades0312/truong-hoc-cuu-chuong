/* subjects.js: các môn học lớp 4 ngoài bảng cửu chương — Toán, Khoa học, Tiếng Anh.
 * Ngân hàng câu hỏi nằm ở bank-math.js, bank-science.js, bank-english.js (TT.bank.<môn>).
 * File này chọn câu cho mỗi lượt (ưu tiên câu mới và câu từng sai), chạy lượt hỏi đáp trắc nghiệm
 * với gợi ý hai mức như phần cửu chương, và ghi lại câu nào bé đã vững. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var U, h, btn, A;
  function init() { U = TT.ui; h = U.h; btn = U.btn; A = TT.art; }

  /* teacher: hình thầy cô trong art.js · amb: âm thanh nền */
  var LIST = [
    { id: 'math', name: 'Toán lớp 4', icon: '🔢', teacher: 'hang', tname: 'Cô Hằng' },
    { id: 'science', name: 'Khoa học', icon: '🔬', teacher: 'nam', tname: 'Thầy Nam' },
    { id: 'english', name: 'Tiếng Anh', icon: '🔤', teacher: 'lan', tname: 'Cô Lan' },
    { id: 'life', name: 'Kỹ năng sống', icon: '🚦', teacher: 'hang', tname: 'Cô Hằng' } // mỗi chủ đề có thầy cô riêng (xem bank-life.js)
  ];
  var PER_MISSION = 6;

  function get(id) {
    var s = LIST.filter(function (x) { return x.id === id; })[0];
    if (!s || !TT.bank || !TT.bank[id]) return null;
    var custom = TT.store.schoolCustom(); // ba mẹ đã đổi tên trường: ẩn chủ đề chỉ đúng với trường mặc định
    return { id: s.id, name: s.name, icon: s.icon, teacher: s.teacher, tname: s.tname, topics: TT.bank[id].topics.filter(function (t) { return !(custom && t.defaultSchool); }) };
  }
  function available() { return LIST.filter(function (s) { return !!(TT.bank && TT.bank[s.id]); }); }

  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* Mã ổn định của một câu cố định (theo nội dung, không theo thứ tự trong file) */
  function keyOf(topicId, it) {
    var s = it.q + '|' + it.a + '|' + (it.pic || '') + '|' + (it.say || ''), x = 0;
    for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0;
    return topicId + ':' + (x >>> 0).toString(36);
  }

  /* Tiến độ của một hồ sơ ở một môn: items[mã câu] = mức 0..3 (0 vừa sai, 3 đã vững); topics[chủ đề] = {r, w} */
  function prog(p, sid) {
    p.subj = p.subj || {};
    var s = p.subj[sid] = p.subj[sid] || {};
    s.items = s.items || {}; s.topics = s.topics || {};
    return s;
  }

  function usable(it) { return !it.listen || TT.audio.canSpeakEn(); } // câu nghe cần máy có giọng đọc tiếng Anh

  /* Thống kê cho bảng chọn chủ đề và Góc ba mẹ */
  function stats(p, sid, topicId) {
    var sub = get(sid), pr = prog(p, sid), out = { total: 0, seen: 0, solid: 0, review: 0, right: 0, wrong: 0 };
    if (!sub) return out;
    sub.topics.forEach(function (t) {
      if (topicId && t.id !== topicId) return;
      (t.items || []).forEach(function (it) {
        var b = pr.items[keyOf(t.id, it)];
        out.total++;
        if (b !== undefined) { out.seen++; if (b >= 2) out.solid++; if (b === 0) out.review++; }
      });
      var tp = pr.topics[t.id];
      if (tp) { out.right += tp.r || 0; out.wrong += tp.w || 0; }
    });
    return out;
  }

  /* Chọn n câu: câu từng sai trước, rồi câu chưa gặp, rồi câu đang học, sau cùng mới tới câu đã vững */
  function pickQuestions(p, sid, topicId, n) {
    var sub = get(sid), pr = prog(p, sid), out = [];
    var topics = sub.topics.filter(function (t) { return !topicId || t.id === topicId; });
    var groups = [[], [], [], []];
    topics.forEach(function (t) {
      (t.items || []).forEach(function (it) {
        if (!usable(it)) return;
        var k = keyOf(t.id, it), b = pr.items[k];
        groups[b === 0 ? 0 : (b === undefined ? 1 : (b < 3 ? 2 : 3))].push({ topic: t, item: it, key: k });
      });
    });
    var fixed = shuffle(groups[0]).slice(0, 2).concat(shuffle(groups[1]), shuffle(groups[0]).slice(2), shuffle(groups[2]), shuffle(groups[3]));
    var seen = {}, fi = 0;
    var makers = topics.filter(function (t) { return typeof t.make === 'function'; });
    for (var guard = 0; out.length < n && guard < 200; guard++) {
      // Chủ đề có hàm sinh đề: phần lớn là câu sinh ngẫu nhiên; chủ đề chỉ có câu cố định: lấy theo thứ tự ưu tiên
      var useMake = makers.length && (!fixed.length || Math.random() < 0.8);
      if (useMake) {
        var mt = makers[rnd(makers.length)], it = mt.make();
        if (seen[it.q]) continue;
        seen[it.q] = 1;
        out.push({ topic: mt, item: it, key: null });
      } else {
        while (fi < fixed.length && seen[fixed[fi].key]) fi++;
        if (fi >= fixed.length) { if (!makers.length) break; continue; }
        seen[fixed[fi].key] = 1; seen[fixed[fi].item.q] = 1;
        out.push(fixed[fi++]);
      }
    }
    return out;
  }

  function record(p, sid, q, self) {
    var pr = prog(p, sid), tp = pr.topics[q.topic.id] = pr.topics[q.topic.id] || { r: 0, w: 0 };
    if (self) tp.r++; else tp.w++;
    if (q.key) {
      var b = pr.items[q.key];
      pr.items[q.key] = self ? Math.min(3, (b === undefined ? 1 : b) + 1) : 0;
    }
  }

  /* ---------- Chạy một lượt học ----------
   * cfg: {subject, topic (null = trộn mọi chủ đề), onDone(result)} */
  function run(container, cfg) {
    init();
    var profile = TT.store.profile(), sub = get(cfg.subject);
    var queue = pickQuestions(profile, cfg.subject, cfg.topic, PER_MISSION);
    var total = queue.length;
    var state = { idx: 0, correct: 0, extra: 0, done: false, results: [] };
    var cur = null;

    container.innerHTML = '';
    var rootEl = h('div', { class: 'quiz subj subj-' + sub.id });
    var progress = h('div', { class: 'q-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total) });
    var stage = h('div', { class: 'q-stage' }), panel = h('div', { class: 'q-panel' });
    rootEl.appendChild(h('div', { class: 'q-top' }, [progress]));
    rootEl.appendChild(h('div', { class: 'q-main' }, [stage, panel]));
    container.appendChild(rootEl);

    function renderProgress() {
      progress.innerHTML = '';
      for (var i = 0; i < total; i++) progress.appendChild(h('span', { class: 'pdot' + (i < state.correct ? ' on' : '') + (i === state.correct ? ' cur' : '') }));
      progress.setAttribute('aria-valuenow', String(state.correct));
      progress.setAttribute('aria-label', 'Đã xong ' + state.correct + ' trên ' + total + ' câu');
    }

    function next() {
      if (state.done) return;
      if (state.idx >= queue.length) return finish();
      var q = queue[state.idx], it = q.item;
      cur = { q: q, it: it, attempt: 0, usedHint: false, locked: false, solved: false, choices: shuffle([it.a].concat(it.wrong)) };
      renderProgress();
      stage.innerHTML = '';
      stage.appendChild(h('div', { class: 'stage-npc' }, [h('div', { class: 'stage-avatar', html: A.adultSVG(q.topic.teacher || sub.teacher) }),
        h('div', { class: 'bubble', text: (q.topic.tname || sub.tname) + ': ' + q.topic.name + '. Câu ' + Math.min(state.correct + 1, total) + '/' + total + '.' })]));
      // Chỉ hiện hình của chính câu hỏi; không có thì hiện biểu tượng môn (hình của chủ đề có thể làm bé hiểu nhầm đáp án)
      stage.appendChild(h('div', { class: 'subj-pic' + (it.pic ? '' : ' plain'), 'aria-hidden': 'true', text: it.pic || sub.icon }));
      renderPanel();
      if (it.listen) setTimeout(function () { if (cur && cur.it === it && !state.done) TT.audio.speakEn(it.say); }, 450);
    }

    function renderPanel() {
      var it = cur.it;
      panel.innerHTML = '';
      var row = h('div', { class: 'subj-q-row' }, [h('p', { class: 'subj-q', text: it.q, 'aria-live': 'polite' })]);
      if (it.listen) row.appendChild(U.iconBtn('speak', 'Nghe lại', function () { TT.audio.speakEn(it.say); }, 'small'));
      else if (sub.id !== 'english' && TT.audio.canSpeak()) row.appendChild(U.iconBtn('speak', 'Nghe đọc câu hỏi', function () { TT.audio.speak(it.q); }, 'small'));
      panel.appendChild(row);
      var answers = h('div', { class: 'q-answers choices txt n' + cur.choices.length });
      cur.choices.forEach(function (v, i) {
        var b = h('button', { type: 'button', class: 'choice txt', 'data-i': String(i) }, [h('span', { class: 'cv', text: v }), h('kbd', { text: String(i + 1) })]);
        b.addEventListener('click', function () { submit(v, b); });
        answers.appendChild(b);
      });
      panel.appendChild(answers);
      panel.appendChild(h('div', { class: 'q-feedback', role: 'status', 'aria-live': 'polite' }));
      panel.appendChild(h('div', { class: 'subj-why', hidden: true }));
      var tools = h('div', { class: 'q-tools' });
      tools.appendChild(btn(h('span', { html: A.icon('hint') + ' Gợi ý' }), 'hint-btn', showHint));
      panel.appendChild(tools);
    }

    function setFeedback(text, kind) {
      var fb = panel.querySelector('.q-feedback');
      fb.className = 'q-feedback ' + (kind || ''); fb.textContent = text;
    }
    function showNote(text, cls) {
      var w = panel.querySelector('.subj-why');
      w.hidden = false; w.className = 'subj-why ' + (cls || ''); w.textContent = text;
    }
    function showHint() {
      if (cur.locked || cur.solved) return;
      cur.usedHint = true;
      showNote(cur.it.hint || 'Con đọc kĩ lại câu hỏi và loại dần những đáp án chắc chắn sai nhé.', 'hint');
      setFeedback('Gợi ý cho con đây.', 'info');
    }

    function submit(v, b) {
      if (state.done || cur.locked || cur.solved) return;
      var it = cur.it;
      if (v !== it.a) {
        cur.attempt++;
        TT.audio.play('soft');
        b.disabled = true; b.classList.add('tried');
        if (cur.attempt === 1) {
          setFeedback('Chưa đúng rồi, con thử lại nhé.', 'info');
          showNote(it.hint || 'Con đọc kĩ lại câu hỏi và loại dần những đáp án chắc chắn sai nhé.', 'hint');
        } else {
          // lần sai thứ hai: chỉ đáp án đúng và giải thích, bé chạm vào để đi tiếp
          setFeedback('Mình cùng xem nhé. Con chạm vào đáp án đang sáng.', 'info');
          var hb = panel.querySelector('.hint-btn'); if (hb) hb.hidden = true;
          showNote(it.why, 'why');
          Array.prototype.forEach.call(panel.querySelectorAll('.choice'), function (c) {
            if (c.querySelector('.cv').textContent === it.a) c.classList.add('guide'); else { c.disabled = true; c.classList.add('tried'); }
          });
        }
        return;
      }
      cur.solved = true;
      var self = cur.attempt === 0 && !cur.usedHint;
      record(profile, cfg.subject, cur.q, self);
      if (self) profile.stats.selfCorrect++; else if (cur.attempt >= 2) profile.stats.guided++; else profile.stats.hintCorrect++;
      TT.store.save();
      state.results.push({ self: self });
      if (!cur.q.isRepeat) state.correct = Math.min(total, state.correct + 1);
      TT.audio.play('correct');
      b.classList.remove('guide'); b.classList.add('right');
      Array.prototype.forEach.call(panel.querySelectorAll('.choice, .hint-btn'), function (c) { c.disabled = true; });
      setFeedback(self ? 'Đúng rồi!' : (cur.attempt >= 2 ? 'Mình đã cùng nhau làm xong. Lát nữa con thử lại nhé!' : 'Con đã tìm ra đáp án rồi!'), 'good');
      showNote(it.why, 'why');
      if (it.say && TT.audio.canSpeakEn()) {
        setTimeout(function () { if (cur && cur.it === it && !state.done) TT.audio.speakEn(it.say); }, 350);
        var row = panel.querySelector('.subj-q-row');
        if (!row.querySelector('.icon-btn')) row.appendChild(U.iconBtn('speak', 'Nghe tiếng Anh', function () { TT.audio.speakEn(it.say); }, 'small'));
      }
      renderProgress();
      // câu phải nhờ gợi ý sẽ được hỏi lại sau vài câu
      if (!self && !cur.q.isRepeat && state.extra < 2) {
        state.extra++;
        queue.splice(Math.min(queue.length, state.idx + 3), 0, { topic: cur.q.topic, item: it, key: cur.q.key, isRepeat: true });
      }
      state.idx++;
      var tools = panel.querySelector('.q-tools');
      tools.innerHTML = '';
      var go = btn('Tiếp tục', 'primary big', function () { next(); }, { id: 'btn-next' });
      tools.appendChild(go);
      go.focus({ preventScroll: true });
    }

    function finish() {
      if (state.done) return;
      state.done = true;
      var selfN = state.results.filter(function (r) { return r.self; }).length;
      cfg.onDone && cfg.onDone({ total: total, self: selfN, helped: state.results.length - selfN, theme: 'subj', results: state.results });
    }

    function onKey(e) {
      if (!document.body.contains(rootEl)) { document.removeEventListener('keydown', onKey); return; }
      if (state.done || !cur || cur.solved) return;
      if (document.getElementById('modal-root').firstChild) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= cur.choices.length) {
        var b = panel.querySelectorAll('.choice')[n - 1];
        if (b && !b.disabled) { b.click(); e.preventDefault(); }
      }
    }
    document.addEventListener('keydown', onKey);

    if (!total) { container.appendChild(h('p', { class: 'lead', text: 'Chủ đề này chưa có câu hỏi.' })); }
    else next();
    return { finish: finish, peek: function () { return cur && cur.it; }, // peek: câu đang hỏi (dùng khi kiểm thử)
      destroy: function () { state.done = true; document.removeEventListener('keydown', onKey); } };
  }

  TT.subjects = { LIST: LIST, get: get, available: available, stats: stats, run: run, keyOf: keyOf, PER_MISSION: PER_MISSION };
})(window);
