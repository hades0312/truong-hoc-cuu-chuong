/* storage.js: hồ sơ từng nhân vật (Tiên Tiên, Khánh Huyền và các nhân vật bé tự tạo), lưu bằng localStorage (không gửi ra ngoài). */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var KEY = 'tientien-cuuchuong-v1';

  /* Cả lớp (hai chữ cuối của tên). Bạn nam liệt kê ở BOYS trong art.js để vẽ đúng hình.
   * Bé đang chơi không gặp lại chính mình trong lớp: xem matesOf. */
  var CLASSMATES = ['Hồng Anh', 'Bảo Trọng', 'Ngọc Linh', 'Vinh Chí', 'Đức Dũng', 'Huy Đăng', 'Phúc Lâm', 'Thanh Thanh',
    'Tiến Thành', 'Văn Thịnh', 'Quỳnh Trâm', 'Trung Trí', 'Bá Tùng', 'Quỳnh Ánh', 'Kiều Oanh', 'Văn Toàn', 'Diệp Vy',
    'Hưng Đạo', 'Hoàng Hải', 'Thanh Huyền', 'Minh Khang', 'Tiên Tiên', 'Khải Minh', 'Ánh Tuyết', 'Tường Vy', 'Linh Đan',
    'Đình Hậu', 'Bảo Hoà', 'Văn Phúc', 'Văn Hiếu', 'Văn Thành', 'Phương Uyên', 'Thiên An', 'Hoàng Ân', 'Bảo Châu'];

  /* Hai nhân vật có sẵn. Các bé khác tự tạo nhân vật mang tên mình (hồ sơ có custom: true, mã bắt đầu bằng "c"). */
  var CHARACTERS = {
    tien: { id: 'tien', name: 'Tiên Tiên', hair: 0, bag: '#ff8fab', acc: 1, pet: 'mit' },
    huyen: { id: 'huyen', name: 'Khánh Huyền', hair: 2, bag: '#7cc6fe', acc: 2, pet: 'bong' }
  };
  var MAX_CUSTOM = 8;

  function memoryStore() {
    var m = {};
    return { getItem: function (k) { return m[k] || null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } };
  }
  var store;
  try {
    store = root.localStorage;
    var t = '__tt_test__'; store.setItem(t, '1'); store.removeItem(t);
  } catch (e) { store = memoryStore(); }

  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  /* Tên nhân vật do bé gõ: bỏ ký tự lạ, gọn khoảng trắng, tối đa 24 chữ (đủ cho cả họ tên) */
  function cleanName(s) { return String(s || '').replace(/[<>&"'`\\\/]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); }
  /* Các bạn cùng lớp của một hồ sơ: cả lớp trừ chính bé (bé gõ cả họ tên thì so theo hai chữ cuối) */
  function matesOf(p) {
    var me = norm(p.name);
    return CLASSMATES.filter(function (c) { var n = norm(c); return me !== n && me.slice(-n.length - 1) !== ' ' + n; });
  }

  /* Mỗi ngày bé gặp một nhóm bạn khác: 4 bạn ngoài sân (cũng là các bạn chuyền bóng) và 10 bạn ngồi trong lớp.
   * Trả về true nếu vừa chọn lại (hồ sơ cũ mang tên không còn trong danh sách cũng được chọn lại). */
  function rollClassmates(p, force) {
    var day = TT.engine.dayKey(Date.now()), pool = matesOf(p);
    var known = function (list, n) { return !!list && list.length === n && list.every(function (x) { return pool.indexOf(x) >= 0; }); };
    if (!force && p.classDay === day && known(p.classmates, 4) && known(p.seatmates, 10)) return false;
    var all = TT.engine.shuffle(pool);
    p.classmates = all.slice(0, 4);
    p.seatmates = all.slice(4, 14);
    p.classDay = day;
    return true;
  }

  /* init: {name, boy} cho nhân vật bé tự tạo; nhân vật có sẵn lấy tên và dáng vẻ từ CHARACTERS */
  function newProfile(charId, init) {
    var c = CHARACTERS[charId] || { name: cleanName(init && init.name), hair: 0, bag: '#ffd166', acc: 0, pet: 'mit' };
    var p = {
      id: charId,
      name: c.name,
      custom: !CHARACTERS[charId],
      created: Date.now(),
      nickname: 'Bạn nhỏ',
      look: { hair: c.hair, bag: c.bag, acc: c.acc, boy: !!(init && init.boy) },
      pet: c.pet,
      petAcc: { mit: 0, bong: 0, dau: 0 },
      classmates: [], seatmates: [], classDay: '',   // xem rollClassmates
      facts: {},
      stars: 0,
      treats: 3,
      owned: ['flower'],              // đồ trang trí đã có
      placed: { s1: 'flower' },       // vị trí trên đảo → đồ trang trí
      ownedAcc: [0],
      settings: { sound: true, ambience: true, reducedMotion: false, tables: [2, 3, 4, 5], sessionMin: 6, division: false },
      warmupDone: false,
      stats: { missions: 0, selfCorrect: 0, hintCorrect: 0, guided: 0, learnSeen: 0 },
      daily: {},                      // dayKey → {quest done, remembered list}
      lastTables: [2],
      setupDone: false,
      lastPlayed: 0
    };
    rollClassmates(p);
    return p;
  }

  function load() {
    var raw = null;
    try { raw = store.getItem(KEY); } catch (e) { raw = null; }
    var data = null;
    if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
    if (!data || typeof data !== 'object') data = { version: 1, active: null, profiles: {}, sound: true };
    data.profiles = data.profiles || {};
    // Bổ sung trường mới nếu thiếu (an toàn khi nâng cấp)
    Object.keys(data.profiles).forEach(function (id) {
      var p = data.profiles[id], base = newProfile(id, { name: p.name, boy: p.look && p.look.boy });
      Object.keys(base).forEach(function (k) { if (p[k] === undefined) p[k] = base[k]; });
      Object.keys(base.settings).forEach(function (k) { if (p.settings[k] === undefined) p.settings[k] = base.settings[k]; });
      Object.keys(base.stats).forEach(function (k) { if (p.stats[k] === undefined) p.stats[k] = base.stats[k]; });
    });
    if (data.active && !data.profiles[data.active] && !CHARACTERS[data.active]) data.active = null;
    return data;
  }

  var data = load();

  function save() {
    try { store.setItem(KEY, JSON.stringify(data)); } catch (e) { /* bộ nhớ đầy: game vẫn chạy */ }
  }

  function profile(id) {
    id = id || data.active;
    if (!id) return null;
    if (!data.profiles[id]) {
      if (!CHARACTERS[id]) return null; // nhân vật tự tạo chỉ có khi bé đã tạo (addProfile)
      data.profiles[id] = newProfile(id); save();
    }
    return data.profiles[id];
  }

  /* Danh sách nhân vật: hai bạn có sẵn rồi tới các bạn tự tạo, theo thứ tự tạo */
  function customIds() {
    return Object.keys(data.profiles).filter(function (id) { return !CHARACTERS[id]; })
      .sort(function (a, b) { return data.profiles[a].created - data.profiles[b].created; });
  }
  function list() { return Object.keys(CHARACTERS).concat(customIds()); }
  function nameOf(id) { return data.profiles[id] ? data.profiles[id].name : (CHARACTERS[id] ? CHARACTERS[id].name : ''); }
  function nameTaken(name, exceptId) {
    return list().some(function (id) { return id !== exceptId && norm(nameOf(id)) === norm(name); });
  }
  function newId() { return 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  function addProfile(p) { data.profiles[p.id] = p; data.active = p.id; save(); }
  function removeProfile(id) {
    if (CHARACTERS[id] || !data.profiles[id]) return false;
    delete data.profiles[id];
    if (data.active === id) data.active = null;
    save();
    return true;
  }

  function hasProgress(id) {
    var p = data.profiles[id];
    return !!(p && (p.setupDone || Object.keys(p.facts).length));
  }

  function setActive(id) { data.active = id; profile(id); save(); }

  /* Xóa tiến độ nhưng giữ lại nhân vật (tên, bạn nam/bạn nữ) */
  function resetProfile(id) {
    var old = data.profiles[id];
    data.profiles[id] = newProfile(id, old ? { name: old.name, boy: old.look && old.look.boy } : null);
    if (old) data.profiles[id].created = old.created;
    save();
  }

  function today(p) {
    var k = TT.engine.dayKey(Date.now());
    if (!p.daily[k]) {
      p.daily = {}; // chỉ giữ ngày hiện tại, không phạt khi bỏ ngày
      p.daily[k] = { quest: false, remembered: [], self: [], missions: 0 };
    }
    return p.daily[k];
  }

  TT.store = {
    CHARACTERS: CHARACTERS, CLASSMATES: CLASSMATES, MAX_CUSTOM: MAX_CUSTOM,
    list: list, customIds: customIds, nameOf: nameOf, nameTaken: nameTaken, cleanName: cleanName, matesOf: matesOf,
    newId: newId, addProfile: addProfile, removeProfile: removeProfile,
    get data() { return data; },
    save: save, profile: profile, setActive: setActive, hasProgress: hasProgress,
    resetProfile: resetProfile, newProfile: newProfile, today: today, rollClassmates: rollClassmates,
    reload: function () { data = load(); return data; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
