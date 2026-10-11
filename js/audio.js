/* audio.js: âm thanh tạo bằng WebAudio (không file ngoài) — hiệu ứng vui nhộn, tiếng chim và âm thanh nền
 * riêng cho từng cảnh, vài câu nhạc ngũ cung nhẹ; đọc tiếng Việt nếu thiết bị hỗ trợ. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var ctx = null, sfxBus = null, ambBus = null, noiseBuf = null;
  var enabled = true;      // toàn bộ âm thanh
  var ambOn = true;        // nhạc nền và tiếng chim
  var unlocked = false;    // trình duyệt chỉ cho phát tiếng sau thao tác đầu tiên của người dùng

  function ac() {
    if (!unlocked) return null;
    if (!ctx) {
      var C = root.AudioContext || root.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch (e) { return null; }
      sfxBus = ctx.createGain(); sfxBus.connect(ctx.destination);
      ambBus = ctx.createGain(); ambBus.gain.value = 0.0001; ambBus.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && !document.hidden) { try { ctx.resume(); } catch (e) { /* bỏ qua */ } }
    return ctx;
  }
  function running() { return !!ctx && ctx.state === 'running' && !document.hidden; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* Nối ra loa, có thể lệch trái/phải (o.pan) hoặc đi vào kênh âm thanh nền (o.dest) */
  function out(node, o) {
    var dest = (o && o.dest) || sfxBus;
    if (o && o.pan && ctx.createStereoPanner) {
      var pn = ctx.createStereoPanner(); pn.pan.value = o.pan;
      node.connect(pn); pn.connect(dest);
    } else node.connect(dest);
  }

  /* Một nốt đơn; o.to: lượn tới tần số khác, o.attack: độ nhanh khi vào tiếng */
  function tone(freq, start, dur, type, vol, o) {
    var c = ac(); if (!c) return;
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = type || 'sine';
    var t = c.currentTime + start;
    osc.frequency.setValueAtTime(freq, t);
    if (o && o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + ((o && o.attack) || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); out(g, o);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  /* Tiếng huýt lượn qua nhiều cao độ — pts: [[giây, Hz], ...]. Dùng cho tiếng chim, mèo kêu... */
  function whistle(pts, start, vol, o) {
    var c = ac(); if (!c) return;
    var osc = c.createOscillator(), g = c.createGain();
    var t = c.currentTime + start, end = pts[pts.length - 1][0];
    osc.type = (o && o.type) || 'sine';
    osc.frequency.setValueAtTime(pts[0][1], t);
    for (var i = 1; i < pts.length; i++) osc.frequency.exponentialRampToValueAtTime(pts[i][1], t + pts[i][0]);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, end / 3));
    g.gain.setValueAtTime(vol, t + end * 0.65);
    g.gain.exponentialRampToValueAtTime(0.0001, t + end);
    osc.connect(g); out(g, o);
    osc.start(t); osc.stop(t + end + 0.05);
  }

  function noiseBuffer() {
    if (!noiseBuf) {
      var n = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }
  /* Tiếng xào xạc: nhiễu trắng qua bộ lọc (bước chân, phấn viết, vỗ cánh, sóng...) */
  function hiss(start, dur, vol, o) {
    var c = ac(); if (!c) return;
    o = o || {};
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + start;
    src.buffer = noiseBuffer(); src.loop = true;
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 0.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); out(g, o);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  }

  /* ---- Tiếng chim: mỗi loài một kiểu hót (t: giây kể từ bây giờ, v: độ to) ---- */
  var BIRDS = {
    se: function (t, v, o) {            // chim sẻ: chíp chíp ríu rít
      var n = 2 + Math.floor(Math.random() * 4), f = rnd(3100, 4000);
      for (var i = 0; i < n; i++) whistle([[0, f], [0.03, f * 1.32], [0.075, f * 0.84]], t + i * rnd(0.1, 0.14), v, o);
    },
    chich: function (t, v, o) {         // chích chòe: huýt sáo du dương
      var f = rnd(1800, 2400), steps = [1, 1.19, 1.33, 1.5, 1.33, 1.68], n = 3 + Math.floor(Math.random() * 4);
      for (var i = 0; i < n; i++) { var a = f * pick(steps); whistle([[0, a], [0.06, a * 1.1], [0.17, a * 0.95]], t + i * 0.2, v * 0.9, o); }
    },
    trill: function (t, v, o) {         // chim sâu: rung một tràng nhanh
      var f = rnd(2600, 3400), pts = [[0, f]];
      for (var i = 1; i <= 14; i++) pts.push([i * 0.028, i % 2 ? f * 1.22 : f * 0.96]);
      whistle(pts, t, v * 0.8, o);
    },
    tweet: function (t, v, o) {         // chim non: một tiếng "chiếp" vút lên
      var f = rnd(2300, 3000);
      whistle([[0, f], [0.09, f * 1.75]], t, v, o);
      if (Math.random() < 0.6) whistle([[0, f * 1.1], [0.08, f * 1.8]], t + 0.17, v * 0.8, o);
    },
    cu: function (t, v, o) {            // chim cu gáy: cúc cù cu trầm ấm
      whistle([[0, 640], [0.17, 610]], t, v * 1.3, o);
      whistle([[0, 560], [0.24, 530]], t + 0.27, v * 1.3, o);
      whistle([[0, 540], [0.34, 470]], t + 0.62, v * 1.3, o);
    },
    gull: function (t, v, o) {          // hải âu ngoài đảo
      var oo = { type: 'triangle', dest: o && o.dest, pan: o && o.pan }, n = 2 + Math.floor(Math.random() * 2);
      for (var i = 0; i < n; i++) whistle([[0, 1150], [0.07, 1500], [0.3, 950]], t + i * 0.36, v * 0.9, oo);
    }
  };

  /* ---- Vài tiếng động riêng của từng nơi ---- */
  var EXTRA = {
    bee: function (v, o) {              // ong bay ngang vườn
      whistle([[0, 190], [0.5, 215], [1.1, 180]], 0, v * 0.5, { type: 'sawtooth', dest: o.dest, pan: o.pan });
    },
    clink: function (v, o) {            // bát đĩa lanh canh ở nhà ăn
      var f = rnd(2200, 3200);
      tone(f, 0, 0.18, 'sine', v * 0.8, { dest: o.dest, pan: o.pan, attack: 0.004 });
      tone(f * 1.5, 0.05, 0.12, 'sine', v * 0.4, { dest: o.dest, pan: o.pan, attack: 0.004 });
    },
    page: function (v, o) { hiss(0, 0.2, v * 0.7, { freq: 2400, to: 5200, q: 1, dest: o.dest, pan: o.pan }); },
    bounce: function (v, o) {           // bóng nảy ở sân thể thao
      for (var i = 0; i < 3; i++) tone(210, i * (0.26 - i * 0.05), 0.12, 'sine', v * (1.6 - i * 0.4), { to: 85, dest: o.dest, pan: o.pan, attack: 0.005 });
    },
    whistle: function (v, o) {          // tiếng còi thể dục ở xa
      whistle([[0, 2050], [0.05, 2250], [0.1, 2050], [0.15, 2250], [0.2, 2050], [0.3, 2150]], 0, v * 0.35, { type: 'square', dest: o.dest, pan: o.pan });
    },
    splash: function (v, o) { hiss(0, 0.5, v * 1.1, { filter: 'lowpass', freq: 1800, to: 450, dest: o.dest, pan: o.pan, attack: 0.05 }); },
    pet: function (v, o) { petVoice(amb.pet || 'mit', v * 1.2, o); }
  };

  function petVoice(kind, v, o) {
    var d = { dest: o && o.dest, pan: o && o.pan };
    if (kind === 'bong') {              // thỏ: hai tiếng chít nhỏ
      whistle([[0, 1500], [0.05, 2100], [0.11, 1650]], 0, v * 0.8, d);
      whistle([[0, 1600], [0.05, 2250], [0.11, 1700]], 0.17, v * 0.8, d);
    } else if (kind === 'dau') {        // rồng nhỏ: gừ một tiếng rồi "éc" lên
      whistle([[0, 170], [0.14, 250], [0.34, 150]], 0, v * 1.2, { type: 'sawtooth', dest: d.dest, pan: d.pan });
      whistle([[0, 700], [0.1, 1250]], 0.36, v * 0.7, d);
    } else {                            // mèo: meo
      whistle([[0, 520], [0.12, 800], [0.42, 470]], 0, v, { type: 'triangle', dest: d.dest, pan: d.pan });
    }
  }

  /* ---- Nhạc: bốn câu ngũ cung ngắn, thỉnh thoảng vang lên ở cổng và sân trường ---- */
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  var TUNE = [[0, 2, 3, 2, 4, 3, 2], [3, 4, 3, 2, 1, 2, 0], [2, 3, 4, 5, 4, 3, 2], [1, 2, 3, 2, 1, 0, 0]];
  var tuneIdx = 0, tuneEnd = 0;
  function phrase(v, o) {
    var c = ac(); if (!c || c.currentTime < tuneEnd) return;
    var notes = TUNE[tuneIdx++ % TUNE.length], d = { dest: o.dest, attack: 0.006 }, t = 0;
    notes.forEach(function (n, i) {
      var len = i === notes.length - 1 ? 0.7 : 0.45;
      tone(PENTA[n], t, len, 'triangle', v, d);
      tone(PENTA[n] * 2, t, len * 0.5, 'sine', v * 0.35, d);
      t += (i === 3 || i === notes.length - 1) ? 0.44 : 0.22;
    });
    tone(PENTA[notes[0]] / 2, 0, 0.9, 'sine', v * 0.7, d);
    tuneEnd = c.currentTime + t + 2;
  }

  /* ---- Hiệu ứng ---- */
  var SFX = {
    tap: function () { tone(880, 0, 0.07, 'sine', 0.06, { to: 640, attack: 0.004 }); },
    pop: function () { tone(430, 0, 0.1, 'sine', 0.08, { to: 990, attack: 0.005 }); },
    correct: function () {
      tone(660, 0, 0.15); tone(880, 0.1, 0.2); tone(1320, 0.22, 0.3, 'sine', 0.09);
      tone(2640, 0.32, 0.22, 'sine', 0.03); tone(3520, 0.4, 0.2, 'sine', 0.02);
    },
    soft: function () { tone(440, 0, 0.2, 'triangle', 0.06, { to: 392 }); },   // khi sai: nhẹ nhàng, không gây sợ
    reward: function () {
      [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.32, 'triangle', 0.1); });
      [2093, 2637, 3136, 4186].forEach(function (f, i) { tone(f, 0.74 + i * 0.07, 0.22, 'sine', 0.025); });
    },
    step: function () {                 // bước chân trên sân
      hiss(0, 0.07, 0.03, { filter: 'lowpass', freq: rnd(700, 1100) });
      tone(rnd(120, 150), 0, 0.05, 'sine', 0.03, { attack: 0.004 });
    },
    stepWood: function () {             // bước chân trong lớp
      tone(rnd(170, 210), 0, 0.06, 'triangle', 0.05, { to: 105, attack: 0.004 });
      hiss(0, 0.03, 0.012, { freq: 2600 });
    },
    drum: function () {                 // trống trường: tùng… tùng… tùng
      [0, 0.5, 1].forEach(function (t) {
        tone(98, t, 0.55, 'sine', 0.3, { to: 50, attack: 0.005 });
        hiss(t, 0.13, 0.1, { filter: 'lowpass', freq: 480 });
      });
    },
    door: function () {
      tone(300, 0, 0.22, 'sawtooth', 0.012, { to: 430 });
      hiss(0, 0.24, 0.035, { freq: 800, to: 320 });
      tone(92, 0.24, 0.16, 'sine', 0.13, { to: 58, attack: 0.005 });
    },
    chalk: function () { for (var i = 0; i < 4; i++) hiss(i * 0.1, 0.075, 0.05, { freq: rnd(2800, 3800), q: 3 }); },
    sit: function () { tone(210, 0, 0.11, 'sine', 0.07, { to: 120, attack: 0.005 }); },
    whoosh: function () { hiss(0, 0.3, 0.05, { freq: 400, to: 2400, q: 1.2, attack: 0.08 }); },
    flutter: function () {              // chim vỗ cánh bay lên
      for (var i = 0; i < 6; i++) hiss(i * 0.055, 0.04, 0.04 - i * 0.004, { freq: 1700, q: 2 });
      BIRDS.tweet(0.05, 0.05);
    },
    bird: function () { BIRDS[pick(['se', 'chich', 'tweet', 'trill'])](0, 0.07); }
  };

  function play(name) {
    if (!enabled) return;
    try { if (SFX[name]) SFX[name](); } catch (e) { /* âm thanh lỗi không ảnh hưởng game */ }
  }
  function pet(kind) {
    if (!enabled) return;
    try { petVoice(kind, 0.07); } catch (e) { /* */ }
  }

  /* ---- Âm thanh nền theo cảnh ----
   * bed: nền gió / phòng yên tĩnh / sóng biển · gap: khoảng nghỉ (giây) giữa hai tiếng · ev: [tên, độ thường gặp]
   * muffle: tiếng chim vọng qua cửa sổ nên trầm và nhỏ hơn. */
  var AMB = {
    title: { vol: 1, bed: 'wind', gap: [1.1, 3.2], ev: [['se', 4], ['chich', 3], ['tweet', 2], ['cu', 1], ['music', 3]] },
    yard: { vol: 1, bed: 'wind', gap: [1, 3], ev: [['se', 5], ['chich', 4], ['trill', 2], ['cu', 2], ['tweet', 2], ['music', 2]] },
    classroom: { vol: 0.8, bed: 'room', tick: true, muffle: 2600, gap: [2.4, 6], ev: [['se', 3], ['cu', 2], ['chich', 2]] },
    library: { vol: 0.6, bed: 'room', tick: true, muffle: 1800, gap: [4, 9], ev: [['cu', 2], ['page', 3], ['se', 1]] },
    garden: { vol: 1, bed: 'wind', gap: [0.8, 2.4], ev: [['chich', 4], ['se', 4], ['trill', 3], ['tweet', 3], ['bee', 2]] },
    sports: { vol: 0.9, bed: 'wind', gap: [1.6, 4], ev: [['se', 3], ['tweet', 2], ['bounce', 2], ['whistle', 1]] },
    canteen: { vol: 0.8, bed: 'room', gap: [1.8, 4.5], ev: [['clink', 4], ['se', 2], ['cu', 1]] },
    pets: { vol: 0.9, bed: 'wind', gap: [1.6, 4], ev: [['se', 3], ['tweet', 3], ['chich', 2], ['pet', 2]] },
    island: { vol: 1, bed: 'sea', gap: [1.8, 4.5], ev: [['gull', 3], ['tweet', 2], ['chich', 1], ['splash', 1]] }
  };
  var amb = { key: null, conf: null, focus: false, on: false, timer: 0, tick: 0, bed: null, out: null, pet: null };

  function startBed(kind) {
    var c = ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    var base = kind === 'sea' ? 0.05 : (kind === 'wind' ? 0.016 : 0.006);
    src.buffer = noiseBuffer(); src.loop = true;
    f.type = 'lowpass'; f.frequency.value = kind === 'sea' ? 900 : (kind === 'wind' ? 520 : 300);
    g.gain.value = base;
    lfo.frequency.value = kind === 'sea' ? 0.13 : 0.08;   // sóng vỗ, gió thổi từng đợt
    lg.gain.value = base * (kind === 'sea' ? 0.85 : 0.5);
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(f); f.connect(g); g.connect(ambBus);
    src.start(); lfo.start();
    return { stop: function () { try { g.gain.setTargetAtTime(0, c.currentTime, 0.15); src.stop(c.currentTime + 0.8); lfo.stop(c.currentTime + 0.8); } catch (e) { /* */ } } };
  }

  function ambLevel() {
    if (!ctx) return;
    var v = amb.on && amb.conf ? amb.conf.vol * (amb.focus ? 0.45 : 1) : 0.0001;
    try { ambBus.gain.cancelScheduledValues(ctx.currentTime); ambBus.gain.setTargetAtTime(v, ctx.currentTime, 0.35); } catch (e) { /* */ }
  }

  function ambEvent() {
    var list = amb.conf.ev.filter(function (e) { return !(amb.focus && e[0] === 'music'); });
    var sum = 0, i;
    for (i = 0; i < list.length; i++) sum += list[i][1];
    var r = Math.random() * sum, name = list[0][0];
    for (i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) { name = list[i][0]; break; } }
    var o = { dest: amb.out, pan: rnd(-0.8, 0.8) }, v = rnd(0.028, 0.055);
    if (BIRDS[name]) BIRDS[name](0, v, o);
    else if (name === 'music') phrase(0.035, { dest: ambBus });
    else if (EXTRA[name]) EXTRA[name](v, o);
  }

  function queue(ms) {
    clearTimeout(amb.timer);
    amb.timer = setTimeout(function () {
      if (!amb.on) return;
      if (running()) { try { ambEvent(); } catch (e) { /* */ } }
      var g = amb.conf.gap;
      queue(rnd(g[0], g[1]) * 1000 * (amb.focus ? 1.8 : 1));
    }, ms);
  }

  function startAmb() {
    if (amb.on || !amb.conf || !enabled || !ambOn) return;
    var c = ac(); if (!c) return;
    amb.on = true;
    var conf = amb.conf;
    if (conf.muffle) {
      amb.out = c.createBiquadFilter(); amb.out.type = 'lowpass'; amb.out.frequency.value = conf.muffle; amb.out.connect(ambBus);
    } else amb.out = ambBus;
    amb.bed = startBed(conf.bed);
    if (conf.tick) amb.tick = setInterval(function () {   // đồng hồ treo tường tích tắc
      if (running()) tone(1900, 0, 0.025, 'sine', amb.focus ? 0.006 : 0.012, { dest: ambBus, attack: 0.002 });
    }, 1000);
    ambLevel();
    queue(500);
  }
  function stopAmb() {
    clearTimeout(amb.timer); clearInterval(amb.tick);
    if (amb.bed) amb.bed.stop();
    amb.bed = null; amb.on = false;
    ambLevel();
  }

  /* Đổi cảnh: name là khóa trong AMB (hoặc null để im lặng); o.focus: đang giải toán nên nhỏ và thưa hơn */
  function scene(name, o) {
    var focus = !!(o && o.focus), conf = (name && AMB[name]) || null;
    if (o && o.pet) amb.pet = o.pet;
    if (amb.key === name) {
      if (amb.focus !== focus) { amb.focus = focus; ambLevel(); }
      return;
    }
    stopAmb();
    amb.key = name; amb.conf = conf; amb.focus = focus;
    startAmb();
  }

  /* ---- Mở tiếng sau thao tác đầu tiên; tạm ngưng khi ẩn trang ---- */
  var GEST = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
  function gesture() {
    unlocked = true;
    var c = ac(); if (!c) return;
    if (c.state === 'running') {
      GEST.forEach(function (n) { document.removeEventListener(n, gesture, true); });
      startAmb();
    } else if (c.resume) {
      var r = c.resume();
      if (r && r.then) r.then(startAmb, function () { /* chờ thao tác sau */ });
    }
  }
  GEST.forEach(function (n) { document.addEventListener(n, gesture, true); });
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    try { if (document.hidden) ctx.suspend(); else if (enabled) ctx.resume(); } catch (e) { /* */ }
  });

  /* ---- Giọng đọc tiếng Việt ---- */
  var viVoice = null;
  var synth = root.speechSynthesis || null;
  function findVoice() {
    if (!synth || !synth.getVoices) return null;
    var vs = synth.getVoices() || [];
    for (var i = 0; i < vs.length; i++) {
      if (/^vi/i.test(vs[i].lang)) { viVoice = vs[i]; break; }
    }
    return viVoice;
  }
  if (synth) {
    findVoice();
    try { synth.addEventListener('voiceschanged', function () { findVoice(); findEn(); document.dispatchEvent(new Event('tt-voices')); }); } catch (e) { /* cũ */ }
  }

  /* Giọng tiếng Anh cho môn Tiếng Anh: ưu tiên giọng Anh-Anh như sách giáo khoa, không có thì giọng Anh-Mỹ */
  var enVoice = null;
  function findEn() {
    if (!synth || !synth.getVoices) return null;
    var vs = synth.getVoices() || [], gb = null, us = null, any = null;
    for (var i = 0; i < vs.length; i++) {
      if (/^en[-_]GB/i.test(vs[i].lang)) gb = gb || vs[i];
      else if (/^en[-_]US/i.test(vs[i].lang)) us = us || vs[i];
      else if (/^en/i.test(vs[i].lang)) any = any || vs[i];
    }
    enVoice = gb || us || any;
    return enVoice;
  }
  function canSpeakEn() { return enabled && !!(synth && (enVoice || findEn())); }
  function speakEn(text) {
    if (!canSpeakEn()) return false;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.voice = enVoice; u.lang = enVoice.lang; u.rate = 0.82;
      synth.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function canSpeak() { return !!(synth && (viVoice || findVoice())); }
  function speak(text) {
    if (!canSpeak()) return false;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(TT.engine.speakable(text));
      u.voice = viVoice; u.lang = viVoice.lang; u.rate = 0.9;
      synth.speak(u);
      return true;
    } catch (e) { return false; }
  }

  TT.audio = {
    play: play, pet: pet, scene: scene,
    setEnabled: function (v) {
      enabled = !!v;
      if (!enabled) { stopAmb(); if (synth) { try { synth.cancel(); } catch (e) { /* */ } } } else startAmb();
    },
    setAmbience: function (v) { ambOn = !!v; if (ambOn) startAmb(); else stopAmb(); },
    get enabled() { return enabled; },
    get state() { return { scene: amb.key, focus: amb.focus, on: amb.on, unlocked: unlocked }; },
    unlock: function () { unlocked = true; ac(); startAmb(); },
    canSpeak: canSpeak, speak: speak, canSpeakEn: canSpeakEn, speakEn: speakEn
  };
})(window);
