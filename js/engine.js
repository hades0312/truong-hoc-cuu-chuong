/* Trường học cửu chương
 * engine.js: toán học, theo dõi từng phép tính, lập lịch câu hỏi thích ứng.
 * Quy ước theo SGK Việt Nam: a × b nghĩa là "a được lấy b lần"
 * = b nhóm, mỗi nhóm a đồ vật. a là bảng nhân (2–9), b từ 1 đến 10.
 * Phép chia: c ÷ a = b với c = a × b (chia hết, thuộc bảng chia a).
 */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};

  var DAY = 24 * 60 * 60 * 1000;
  // Khoảng cách ôn (ngày) theo "hộp" Leitner 0..5
  var INTERVALS = [0, 1, 2, 4, 7, 14];

  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- Phép tính ---------- */
  function factKey(op, a, b) { return (op === 'div' ? 'd' : 'm') + a + 'x' + b; }

  function makeFact(op, a, b) {
    var c = a * b;
    var f = { op: op, a: a, b: b, c: c, key: factKey(op, a, b) };
    if (op === 'div') {
      // c ÷ a = b
      f.text = c + ' ÷ ' + a;
      f.answer = b;
    } else {
      f.text = a + ' × ' + b;
      f.answer = c;
    }
    return f;
  }

  function parseKey(key) {
    var op = key.charAt(0) === 'd' ? 'div' : 'mul';
    var parts = key.slice(1).split('x');
    return makeFact(op, parseInt(parts[0], 10), parseInt(parts[1], 10));
  }

  /* Đáp án nhiễu hợp lý, khác nhau, dương, chỉ một đáp án đúng. */
  function distractors(fact, count) {
    var ans = fact.answer, a = fact.a, b = fact.b;
    var tiers;
    if (fact.op === 'mul') {
      tiers = [
        [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b],   // hàng xóm trong bảng (lỗi hay gặp)
        [ans + 1, ans - 1, ans + 2, ans - 2],
        [ans + 10, ans - 10, a + b, a * (b + 2), a * (b - 2), ans + 3, ans - 3]
      ];
    } else {
      tiers = [[ans + 1, ans - 1], [ans + 2, ans - 2], [a, ans + 3, ans - 3]];
    }
    var seen = {}; seen[ans] = true;
    function valid(v) { return v > 0 && v <= 100 && !seen[v]; }
    var out = [];
    function takeFrom(list) {
      var l = shuffle(list);
      for (var i = 0; i < l.length; i++) if (valid(l[i])) { seen[l[i]] = true; out.push(l[i]); return true; }
      return false;
    }
    // Một đáp án nhiễu từ mỗi nhóm để đa dạng, sau đó bổ sung ngẫu nhiên
    for (var t = 0; t < tiers.length && out.length < count; t++) takeFrom(tiers[t]);
    var rest = tiers[0].concat(tiers[1], tiers[2]);
    while (out.length < count && takeFrom(rest)) { /* tiếp tục */ }
    var k = 3;
    while (out.length < count) {
      var v2 = ans + k; k = k > 0 ? -k : -k + 1;
      if (valid(v2)) { seen[v2] = true; out.push(v2); }
    }
    return out;
  }

  function makeChoices(fact, n) {
    return shuffle([fact.answer].concat(distractors(fact, n - 1)));
  }

  /* ---------- Hồ sơ phép tính (theo dõi riêng từng phép) ---------- */
  function emptyRecord() {
    return { seen: 0, firstTry: 0, wrong: 0, hinted: 0, streak: 0, box: 0, last: 0, boxDay: '' };
  }

  function getRec(profile, key) {
    if (!profile.facts[key]) profile.facts[key] = emptyRecord();
    return profile.facts[key];
  }

  /* outcome: 'self' (tự làm đúng lần đầu), 'retry' (đúng sau khi thử lại có gợi ý hình),
   * 'guided' (cùng làm từng bước), hint flag: có bấm gợi ý trước khi trả lời. */
  function recordAttempt(profile, fact, outcome, usedHint, now) {
    now = now || Date.now();
    var r = getRec(profile, fact.key);
    var today = dayKey(now);
    r.seen++;
    if (outcome === 'self' && !usedHint) {
      r.firstTry++;
      r.streak++;
      // Chỉ lên hộp tối đa 1 lần/ngày khi đã ở hộp ≥2, để "khá vững" cần nhiều ngày
      if (r.box < 2 || r.boxDay !== today) {
        if (r.box < 5) { r.box++; r.boxDay = today; }
      }
    } else {
      if (outcome !== 'self') r.wrong++;
      if (usedHint || outcome !== 'self') r.hinted++;
      r.streak = 0;
      if (outcome === 'guided') r.box = Math.max(0, r.box - 2);
      else if (outcome === 'retry') r.box = Math.max(0, r.box - 1);
    }
    r.last = now;
    return r;
  }

  /* Trạng thái hiển thị (ngôn ngữ tích cực) */
  function status(rec) {
    if (!rec || rec.seen === 0) return 'new';           // chưa luyện
    if (rec.box >= 3 && rec.firstTry >= 3 && rec.streak >= 2) return 'solid'; // khá vững
    if (rec.wrong > 0 && rec.streak < 2) return 'review'; // nên ôn thêm
    return 'learning';                                   // đang làm quen
  }
  var STATUS_LABEL = { 'new': 'Chưa luyện', learning: 'Đang làm quen', review: 'Nên ôn thêm', solid: 'Khá vững' };

  function isDue(rec, now) {
    if (!rec || rec.seen === 0) return false;
    return now - rec.last >= INTERVALS[rec.box] * DAY;
  }

  /* Định dạng trả lời: 3 lựa chọn → 4 lựa chọn → nhập số */
  function formatFor(rec) {
    if (!rec || rec.box <= 1) return 3;
    if (rec.box <= 3) return 4;
    return 'input';
  }

  /* ---------- Lập lịch câu hỏi ---------- */
  function allFacts(tables, op) {
    var list = [];
    tables.forEach(function (a) {
      for (var b = 1; b <= 10; b++) list.push(makeFact(op, a, b));
    });
    return list;
  }

  /* Tạo danh sách câu cho một nhiệm vụ.
   * opts: {tables, count, op ('mul'|'div'|'mix'), review(bool), now} */
  function buildMission(profile, opts) {
    var now = opts.now || Date.now();
    var count = opts.count || 6;
    var ops = opts.op === 'mix' ? ['mul', 'div'] : [opts.op || 'mul'];
    var pool = [];
    ops.forEach(function (op) { pool = pool.concat(allFacts(opts.tables, op)); });

    var scored = pool.map(function (f) {
      var r = profile.facts[f.key];
      var st = status(r);
      var s = Math.random() * 2;
      if (st === 'review') s += 10 + (r.wrong - r.firstTry * 0.3);
      if (isDue(r, now)) s += 6;
      if (st === 'new') s += opts.review ? -4 : 5 - f.b * 0.25; // thừa số nhỏ trước
      if (st === 'learning') s += 4;
      if (st === 'solid') s += isDue(r, now) ? 1 : -6;
      return { f: f, s: s, st: st };
    });
    scored.sort(function (x, y) { return y.s - x.s; });

    var easy = scored.filter(function (x) { return x.st === 'solid' || (x.f.b <= 2 || x.f.b === 10); });
    var main = scored.filter(function (x) { return easy.indexOf(x) === -1 || x.st === 'review'; });
    var chosen = [];
    var used = {};
    function take(list) {
      for (var i = 0; i < list.length; i++) {
        if (!used[list[i].f.key]) { used[list[i].f.key] = true; return list[i].f; }
      }
      return null;
    }
    for (var i = 0; i < count; i++) {
      // Xen kẽ 1 câu dễ sau mỗi 2–3 câu để giữ tự tin
      var wantEasy = (i % 3 === 2);
      var f = wantEasy ? (take(easy) || take(main) || take(scored)) : (take(main) || take(scored));
      if (f) chosen.push(f);
    }
    // Câu đầu tiên nên là câu dễ/đã biết khi có
    var firstEasyIdx = -1;
    for (var j = 0; j < chosen.length; j++) {
      var st2 = status(profile.facts[chosen[j].key]);
      if (st2 === 'solid' || chosen[j].b <= 2) { firstEasyIdx = j; break; }
    }
    if (firstEasyIdx > 0) { var e = chosen.splice(firstEasyIdx, 1)[0]; chosen.unshift(e); }
    return chosen;
  }

  /* Phần làm quen lần đầu: 5 câu nhẹ nhàng */
  function warmupMission() {
    return [makeFact('mul', 2, 3), makeFact('mul', 5, 2), makeFact('mul', 2, 5),
      makeFact('mul', 5, 4), makeFact('mul', 3, 2)];
  }

  /* ---------- Giải thích từng bước (khớp với hình minh họa) ----------
   * Trả về {steps:[text], highlight:[{from,to,cls}], ghost:number}
   * highlight chỉ số nhóm (0-based) cần tô; ghost = số nhóm "mờ" vẽ thêm (ví dụ 10 − 1). */
  function explain(fact) {
    var a = fact.a, b = fact.b, c = fact.c;
    if (fact.op === 'div') {
      return {
        steps: [
          'Mỗi khay xếp ' + a + ' cái. Mình đếm từng khay: ' + seq(a, b) + '.',
          'Xếp được ' + b + ' khay thì vừa hết ' + c + ' cái.',
          'Vì ' + a + ' × ' + b + ' = ' + c + ' nên ' + c + ' ÷ ' + a + ' = ' + b + '.'
        ],
        highlight: [{ from: 0, to: b - 1, cls: 'hl-a' }], ghost: 0
      };
    }
    if (b === 1) {
      return { steps: ['Chỉ có 1 nhóm, mỗi nhóm ' + a + '.', 'Vậy ' + a + ' × 1 = ' + a + '.'],
        highlight: [{ from: 0, to: 0, cls: 'hl-a' }], ghost: 0 };
    }
    if (b <= 5) {
      return {
        steps: ['Có ' + b + ' nhóm, mỗi nhóm ' + a + '.', 'Mình đếm thêm ' + a + ' cho mỗi nhóm: ' + seq(a, b) + '.',
          'Vậy ' + a + ' × ' + b + ' = ' + c + '.'],
        highlight: [{ from: 0, to: b - 1, cls: 'hl-a' }], ghost: 0
      };
    }
    if (b === 10) {
      return {
        steps: ['Có 10 nhóm, mỗi nhóm ' + a + '.', '10 nhóm ' + a + ' là ' + a + ' chục, tức là ' + c + '.',
          'Vậy ' + a + ' × 10 = ' + c + '.'],
        highlight: [{ from: 0, to: 9, cls: 'hl-a' }], ghost: 0
      };
    }
    if (b === 9) {
      return {
        steps: ['10 nhóm ' + a + ' là ' + (a * 10) + '.',
          'Bớt đi 1 nhóm ' + a + ' thì còn ' + (a * 10) + ' − ' + a + ' = ' + c + '.',
          'Vậy ' + a + ' × 9 = ' + c + '.'],
        highlight: [{ from: 0, to: 8, cls: 'hl-a' }], ghost: 1
      };
    }
    // b = 6, 7, 8: 5 nhóm rồi thêm phần còn lại
    var rest = b - 5;
    return {
      steps: ['5 nhóm ' + a + ' là ' + (a * 5) + '.',
        'Thêm ' + rest + ' nhóm ' + a + ' nữa là ' + (a * 5) + ' + ' + (a * rest) + ' = ' + c + '.',
        'Vậy ' + a + ' × ' + b + ' = ' + c + '.'],
      highlight: [{ from: 0, to: 4, cls: 'hl-a' }, { from: 5, to: b - 1, cls: 'hl-b' }], ghost: 0
    };
  }

  function seq(a, b) {
    var out = [];
    for (var i = 1; i <= b; i++) out.push(a * i);
    return out.join(', ');
  }

  /* Đọc phép tính thành lời (cho giọng nói) */
  function speakable(text) {
    return text.replace(/×/g, ' nhân ').replace(/÷/g, ' chia ').replace(/=/g, ' bằng ').replace(/\?/g, ' mấy');
  }

  TT.engine = {
    DAY: DAY, dayKey: dayKey, randInt: randInt, shuffle: shuffle, pick: pick,
    makeFact: makeFact, parseKey: parseKey, factKey: factKey,
    distractors: distractors, makeChoices: makeChoices,
    emptyRecord: emptyRecord, getRec: getRec, recordAttempt: recordAttempt,
    status: status, STATUS_LABEL: STATUS_LABEL, isDue: isDue, formatFor: formatFor,
    allFacts: allFacts, buildMission: buildMission, warmupMission: warmupMission,
    explain: explain, seq: seq, speakable: speakable
  };
})(typeof window !== 'undefined' ? window : globalThis);
