/* world.js: các cảnh đi lại được — sân trường và bên trong lớp học.
 * Máy tính: phím mũi tên/WASD, hoặc giữ chuột để bạn nhỏ đi theo con trỏ; Enter/Space để vào nơi đang đứng gần.
 * Màn hình cảm ứng: nút điều hướng + nút hành động, chạm để đi tới, kéo để xem bản đồ.
 * Có vật cản, tự tìm đường vòng và che khuất theo chiều sâu. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var A, U, h;

  /* Các khu có hoạt động thật. Khu chỉ để trang trí không có điểm tương tác. */
  var ZONES = [
    { id: 'classroom', name: 'Lớp học', icon: 'classroom', mx: 1140, my: 590, tx: 1140, ty: 720, face: 'up' },
    { id: 'library', name: 'Thư viện', icon: 'library', mx: 1880, my: 570, tx: 1880, ty: 720, face: 'up' },
    { id: 'garden', name: 'Vườn toán học', icon: 'garden', mx: 2225, my: 790, tx: 2140, ty: 1070 },
    { id: 'sports', name: 'Sân thể thao', icon: 'sports', mx: 2140, my: 1265, tx: 1960, ty: 1200 },
    { id: 'canteen', name: 'Nhà ăn', icon: 'canteen', mx: 345, my: 880, tx: 320, ty: 1020 },
    { id: 'art', name: 'Phòng Mỹ thuật', icon: 'art', mx: 530, my: 580, tx: 530, ty: 720, face: 'up' },
    { id: 'pets', name: 'Góc thú cưng', icon: 'pets', mx: 450, my: 1200, tx: 600, ty: 1190 },
    { id: 'board', name: 'Bảng tin', icon: 'board', mx: 975, my: 700, tx: 975, ty: 880, face: 'up' },
    { id: 'portal', name: 'Đảo thú cưng', icon: 'island', mx: 760, my: 1320, tx: 760, ty: 1400 },
    { id: 'road', name: 'Ra đường', icon: 'walk', mx: 1250, my: 1338, tx: 1250, ty: 1410 },
    { id: 'tour', name: 'Tham quan trường', icon: 'map', mx: 1105, my: 1094, tx: 1105, ty: 1250, pill: true, face: 'up' }
  ];

  /* Đường tới trường: chỉ có một nơi để vào là cổng trường; còn lại là người và cảnh vật để trò chuyện */
  var ROAD_ZONES = [
    { id: 'rd-gate', name: 'Vào trường', icon: 'classroom', mx: 2250, my: 540, tx: 2250, ty: 650, face: 'up' }
  ];
  var ROAD_NPCS = [
    { id: 'congan', name: 'Chú Cảnh sát', kind: 'adult', art: 'congan', x: 1790, y: 958 },
    { id: 'nong', name: 'Bác nông dân', kind: 'adult', art: 'nong', x: 760, y: 662 }
  ];
  var CROSS = [1900, 692, 2060, 895];   // vạch sang đường
  /* Chu kì đèn: xe đi → đèn vàng → tất cả dừng → người đi bộ sang → sắp hết giờ (đèn xanh nhấp nháy) */
  var PHASES = [{ id: 'go', dur: 7 }, { id: 'slow', dur: 2 }, { id: 'stop', dur: 1.2 }, { id: 'walk', dur: 8, open: true }, { id: 'hurry', dur: 3, open: true }];
  var TRAFFIC = [ // lane 0: làn xa, xe chạy sang trái · lane 1: làn gần, xe chạy sang phải
    { k: 'car', c: '#ef476f', lane: 0, v: 215 }, { k: 'moto', c: '#118ab2', lane: 0, v: 240 }, { k: 'truck', c: '#06d6a0', lane: 0, v: 165 },
    { k: 'bus', c: '#ffd166', lane: 1, v: 175 }, { k: 'car', c: '#4dabf7', lane: 1, v: 220 }, { k: 'moto', c: '#9b5de5', lane: 1, v: 245 }, { k: 'car', c: '#ff9f1c', lane: 1, v: 200 }
  ];

  /* Trong lớp: nhãn dạng thẻ nhỏ đặt ngay trên đồ vật. seat: chỗ ngồi của bạn nhỏ. */
  var ROOM_ZONES = [
    { id: 'cls-board', name: 'Bảng lớp', icon: 'classroom', mx: 540, my: 414, tx: 800, ty: 505, pill: true, face: 'up' },
    { id: 'cls-photo', name: 'Xem tranh', icon: 'art', mx: 800, my: 60, tx: 800, ty: 505, noSpot: true, face: 'up' },
    { id: 'cls-5dieu', name: '5 điều Bác Hồ dạy', icon: 'star', mx: 306, my: 120, tx: 400, ty: 500, noSpot: true, face: 'up' },
    { id: 'cls-desk', name: 'Bàn học', icon: 'desk', mx: 730, my: 566, tx: 648, ty: 742, pill: true, seat: { x: 748, y: 732 } },
    { id: 'cls-door', name: 'Ra sân', icon: 'door', mx: 1450, my: 116, tx: 1450, ty: 480, pill: true, face: 'up' }
  ];

  var NPCS = [
    { id: 'binh', name: 'Chú Bình', kind: 'adult', art: 'binh', x: 1425, y: 1175 },
    { id: 'nam', name: 'Thầy Nam', kind: 'adult', art: 'nam', x: 1520, y: 925 },
    { id: 'hoa', name: 'Cô Hoa', kind: 'adult', art: 'hoa', x: 1760, y: 705 },
    { id: 'lan', name: 'Cô Lan', kind: 'adult', art: 'lan', x: 885, y: 990 },
    { id: 'tam', name: 'Cô Tâm', kind: 'adult', art: 'tam', x: 500, y: 990 },
    { id: 'k0', kind: 'kid', idx: 0, x: 2010, y: 1030 },
    { id: 'k1', kind: 'kid', idx: 1, x: 1880, y: 1350 },
    { id: 'k2', kind: 'kid', idx: 2, x: 720, y: 960 },
    { id: 'k3', kind: 'kid', idx: 3, x: 470, y: 1060 }
  ];

  /* blocks: [x0, y0, x1, y1] — chỗ chân nhân vật không bước vào được */
  var SCENES = {
    yard: {
      w: 2400, h: 1500, walk: { x0: 70, x1: 2330, y0: 700, y1: 1420 }, start: { x: 1250, y: 1010 },
      speed: 460, camDy: 120, bg: '#bfe8a0', top: '#aee2ff', step: 'step', zones: ZONES, depth: true,
      flock: [[1010, 985], [1495, 1195], [705, 1135], [1705, 1015]],
      blocks: [
        [30, 690, 472, 958], [100, 990, 262, 1040],                 // nhà ăn (cả mặt bên), bàn ăn ngoài trời
        [885, 800, 1065, 852], [1215, 866, 1285, 892],              // bảng tin, cột cờ
        [555, 850, 685, 938], [1815, 850, 1945, 938],               // cây bóng mát + ghế đá
        [980, 1040, 1140, 1082], [1360, 1040, 1520, 1082],          // bồn hoa giữa sân
        [70, 1105, 550, 1150], [392, 1238, 508, 1322],              // hàng rào và nhà của thú cưng
        [2030, 945, 2282, 980], [2124, 846, 2156, 866], [2222, 836, 2258, 856], [2314, 856, 2346, 876], // vườn
        [1000, 1236, 1070, 1421], [1430, 1236, 1500, 1421],         // trụ cổng
        [870, 1380, 992, 1421], [1508, 1380, 1632, 1421], [1568, 1296, 1712, 1402], // bồn hoa cổng, chòi bảo vệ
        [1050, 1190, 1160, 1222]                                                    // bảng sơ đồ trường
      ],
      label: 'Sân Trường Tiểu Học Tân Trường. Dùng phím mũi tên để đi, Enter để vào nơi đang đứng gần.'
    },
    road: {
      w: 2600, h: 1200, walk: { x0: 80, x1: 2520, y0: 632, y1: 985 }, start: { x: 470, y: 950 },
      speed: 440, camDy: 130, bg: '#bfe8a0', top: '#8fd3ff', step: 'step', zones: ROAD_ZONES, depth: true, flock: [],
      blocks: [[-200, 692, 1900, 895], [2060, 692, 2800, 895]], // mặt đường: chỉ sang được ở vạch kẻ
      label: 'Đường tới trường. Đi dọc vỉa hè tới vạch sang đường, chờ đèn xanh cho người đi bộ rồi sang đường vào cổng trường.'
    },
    classroom: {
      w: 1600, h: 1000, walk: { x0: 70, x1: 1530, y0: 470, y1: 975 }, start: { x: 1450, y: 500 },
      speed: 400, camDy: 150, bg: '#f5e4c8', top: '#fff7dc', step: 'stepWood', zones: ROOM_ZONES, flock: [], blocks: null,
      label: 'Bên trong lớp học. Dùng phím mũi tên để đi tới bảng lớp, bàn học hoặc cửa ra sân.'
    }
  };

  var st = null;      // trạng thái cảnh đang mở
  var saved = {};     // vị trí đứng gần nhất ở từng cảnh
  var hinted = false; // chỉ nhắc cách điều khiển một lần mỗi lượt chơi

  function init() {
    A = TT.art; U = TT.ui; h = U.h;
    if (!SCENES.classroom.blocks) {
      SCENES.classroom.blocks = [[118, 460, 362, 572]].concat(A.DESKS.map(function (d) { return [d[0] - 125, d[1] - 72, d[0] + 125, d[1] + 66]; }));
    }
  }

  /* Ở sân trường, người đứng xa (phía trên màn hình) nhỏ hơn người đứng gần: sân có chiều sâu như nhìn chếch từ trên xuống */
  function depthScale(sc, y) {
    if (!sc.depth) return 1;
    return 0.82 + 0.3 * (y - sc.walk.y0) / (sc.walk.y1 - sc.walk.y0);
  }

  /* ---------------- Dựng cảnh ---------------- */
  function wrap(y, cls, attrs, inner) { return '<g class="actor ' + cls + '" data-y="' + y + '"' + (attrs || '') + '>' + inner + '</g>'; }

  function nameTag(name, y) {
    return '<g transform="translate(60 ' + y + ')"><rect x="' + (-name.length * 7.5 - 12) + '" y="-20" width="' + (name.length * 15 + 24) + '" height="32" rx="16" fill="#fff" opacity=".92"/><text y="4" text-anchor="middle" class="w-label" font-size="20" fill="#3b2f63">' + name + '</text></g>';
  }
  function npcSvg(n, p) {
    var name = n.name || p.classmates[n.idx];
    if (n.seat) {
      return wrap(n.y, 'npc', ' data-hit="npc" data-id="' + n.id + '" transform="translate(' + (n.x - 46.8) + ' ' + (n.sy - 117) + ') scale(.78)"',
        '<rect x="14" y="20" width="92" height="130" fill="transparent"/>' + A.kidSeat(name, n.idx) + nameTag(name, n.hi ? -30 : 4));
    }
    var adult = n.kind === 'adult', hgt = adult ? 220 : 200, sc = (adult ? 0.85 : 0.78) * depthScale(st.sc, n.y);
    return wrap(n.y, 'npc', ' data-hit="npc" data-id="' + n.id + '" transform="translate(' + (n.x - 60 * sc) + ' ' + (n.y - hgt * sc) + ') scale(' + sc + ')"',
      '<rect x="0" y="0" width="120" height="' + hgt + '" fill="transparent"/>' + (adult ? A.adult(n.art) : A.kid(name, n.idx)) + nameTag(name, -14));
  }

  function hotspotSvg(z) {
    if (z.pill) {
      var w = z.name.length * 14 + 74;
      return '<g class="hotspot pill" style="color:#7b61ff" data-hit="zone" data-id="' + z.id + '" transform="translate(' + z.mx + ' ' + z.my + ')">' +
        '<rect class="hs-ring" x="' + (-w / 2 - 5) + '" y="-27" width="' + (w + 10) + '" height="54" rx="27"/>' +
        '<rect class="hs-box" x="' + (-w / 2) + '" y="-22" width="' + w + '" height="44" rx="22" fill="#fff" stroke="#7b61ff" stroke-width="4"/>' +
        '<g transform="translate(' + (-w / 2 + 9) + ' -16)">' + A.ICON[z.icon] + '</g>' +
        '<text x="' + (-w / 2 + 49) + '" y="7" class="w-label" font-size="21" fill="#3b2f63">' + z.name + '</text></g>';
    }
    return '<g class="hotspot" style="color:#7b61ff" data-hit="zone" data-id="' + z.id + '" transform="translate(' + z.mx + ' ' + z.my + ')">' +
      '<circle r="46" class="hs-ring"/><circle class="hs-box" r="38" fill="#fff" stroke="#7b61ff" stroke-width="5"/>' +
      '<g transform="translate(-24 -24) scale(1.5)">' + A.ICON[z.icon] + '</g>' +
      '<g transform="translate(0 72)"><rect x="' + (-z.name.length * 8.4 - 16) + '" y="-24" width="' + (z.name.length * 16.8 + 32) + '" height="38" rx="19" fill="#7b61ff"/>' +
      '<text y="3" text-anchor="middle" class="w-label" font-size="22" fill="#fff">' + z.name + '</text></g></g>';
  }

  function yardContent(p) {
    var list = A.yardProps().map(function (o) { return { y: o.y, s: wrap(o.y, 'prop', o.poke ? ' data-hit="poke" data-id="' + o.poke + '"' : '', o.s) }; });
    NPCS.forEach(function (n) { list.push({ y: n.y, s: npcSvg(n, p) }); });
    // Thú không đi cùng thì ở góc thú cưng
    var penPos = [[170, 1300], [270, 1360], [380, 1330]], pi = 0;
    ['mit', 'bong', 'dau'].forEach(function (k) {
      if (k === p.pet) return;
      var pp = penPos[pi++];
      var ps = 0.9 * depthScale(st.sc, pp[1]);
      list.push({ y: pp[1], s: wrap(pp[1], 'pen-pet', ' data-hit="zone" data-id="pets" transform="translate(' + (pp[0] - 50 * ps) + ' ' + (pp[1] - 100 * ps) + ') scale(' + ps + ')"', '<g class="bob">' + A.pet(k, p.petAcc[k]) + '</g>') });
    });
    // Chim sẻ nhặt thóc trên sân: lại gần là bay lên
    var colors = ['#ffb703', '#8ecae6', '#ff8fab', '#95d5b2'];
    SCENES.yard.flock.forEach(function (f, i) {
      list.push({ y: f[1], s: wrap(f[1], 'gbird', ' data-i="' + i + '"', A.bird(f[0], f[1], colors[i % colors.length], i % 2 === 1, i % 2 ? 'b2' : '')) });
    });
    return { ground: A.schoolScene({ noProps: true }), actors: list, npcs: NPCS };
  }

  function roadContent(p) {
    var list = A.roadProps().map(function (o) { return { y: o.y, s: wrap(o.y, 'prop', '', o.s) }; });
    ROAD_NPCS.forEach(function (n) { list.push({ y: n.y, s: npcSvg(n, p) }); });
    st.sim = { t: 0, pi: 0, warned: false, side: 'near', crossed: false, cars: [] };
    var next = [2500, -300]; // chỗ xuất phát của xe tiếp theo ở mỗi làn
    TRAFFIC.forEach(function (d, i) {
      var v = A.vehicle(d.k, d.c), y = d.lane ? 884 : 776, dir = d.lane ? 1 : -1;
      var x = next[d.lane]; next[d.lane] += -dir * (v.len + 260 + i * 37 % 190);
      st.sim.cars.push({ i: i, x: x, len: v.len, dir: dir, vmax: d.v, lane: d.lane, y: y, drawn: null });
      list.push({ y: y, s: wrap(y, 'veh', ' data-i="' + i + '"', v.s) });
    });
    return { ground: A.roadScene(), actors: list, npcs: ROAD_NPCS };
  }

  /* Xe cộ và đèn giao thông trên đường tới trường. Xe luôn dừng trước vạch khi đèn của xe không xanh
   * hoặc khi bé còn ở trên vạch sang đường, nên không bao giờ có va chạm. */
  function roadUpdate(dt) {
    var sim = st.sim, p = st.player, ph = PHASES[sim.pi];
    sim.t += dt;
    if (sim.t > ph.dur) {
      sim.t = 0; sim.pi = (sim.pi + 1) % PHASES.length; ph = PHASES[sim.pi]; sim.warned = false;
      st.el.world.setAttribute('data-light', ph.id);
      if (ph.id === 'walk' && nearCross(p)) { TT.audio.play('ding'); bubble('Đèn xanh rồi! Nhìn hai bên, rồi đi trên vạch kẻ đường nhé.'); }
    }
    st.gate = ph.open ? null : CROSS; // đèn đỏ: không bước xuống đường được
    if (!ph.open && !sim.warned && nearCross(p)) { sim.warned = true; bubble('Đèn đỏ rồi! Mình đứng trên vỉa hè chờ đèn xanh nhé.'); }
    var onRoad = p.y > 694 && p.y < 893;
    // sang tới vỉa hè bên kia: lần đầu được khen
    var side = p.y >= 893 ? 'near' : (p.y <= 694 ? 'far' : sim.side);
    if (side !== sim.side) { sim.side = side; if (!sim.crossed) { sim.crossed = true; if (st.opts.onEvent) st.opts.onEvent('crossed'); } }

    var stop = ph.id !== 'go' || onRoad, cars = sim.cars, i, j;
    for (i = 0; i < cars.length; i++) {
      var c = cars[i], front = c.dir > 0 ? c.x + c.len : c.x, room = 1e9;
      var toLine = c.dir > 0 ? 1868 - front : front - 2092;      // khoảng cách tới vạch dừng
      if (stop && toLine >= 0) room = toLine;
      for (j = 0; j < cars.length; j++) {                          // giữ khoảng cách với xe phía trước cùng làn
        var o = cars[j];
        if (o === c || o.lane !== c.lane) continue;
        var gap = c.dir > 0 ? o.x - front : front - (o.x + o.len);
        if (gap >= -10 && gap - 46 < room) room = Math.max(0, gap - 46);
      }
      var move = Math.min(Math.min(c.vmax, room * 3 + 6) * dt, room);
      if (move > 0.05) c.x += c.dir * move;
      // ra khỏi cảnh thì quay lại từ đầu bên kia, sau xe cuối cùng của làn
      if (c.dir > 0 && c.x > 2760) { c.x = Math.min.apply(null, cars.filter(function (q) { return q.lane === c.lane; }).map(function (q) { return q.x; }).concat([-200])) - c.len - 240 - Math.random() * 200; }
      if (c.dir < 0 && c.x + c.len < -160) { c.x = Math.max.apply(null, cars.filter(function (q) { return q.lane === c.lane; }).map(function (q) { return q.x + q.len; }).concat([2800])) + 240 + Math.random() * 200; }
      var key = c.x.toFixed(1);
      if (key !== c.drawn) {
        c.drawn = key;
        if (!c.el) c.el = st.el.actors.querySelector('.veh[data-i="' + c.i + '"]');
        c.el.setAttribute('transform', c.dir > 0 ? 'translate(' + key + ' ' + c.y + ')' : 'translate(' + (c.x + c.len).toFixed(1) + ' ' + c.y + ') scale(-1 1)');
      }
    }
  }
  function nearCross(p) {
    return p.x > 1880 && p.x < 2080 && ((p.y >= 893 && p.y < 962) || (p.y > 636 && p.y <= 694));
  }

  /* ---------------- Cảnh vật chạm vào được ----------------
   * Chạm vào cây, lá cờ, vòi rửa tay, con trâu… bạn nhỏ sẽ nói một câu (mỗi lần một câu khác). */
  var POKES = {
    co: { lines: ['Lá cờ đỏ sao vàng tung bay! Sáng thứ Hai đầu tuần cả trường chào cờ.', 'Quốc kỳ Việt Nam có nền đỏ và ngôi sao vàng năm cánh.'] },
    cay: { lines: ['Cây bàng cho bóng mát cả sân trường.', 'Cây xanh tạo ra khí ô-xi cho chúng mình thở đấy!', 'Mình không bẻ cành, hái lá nhé.'] },
    ghe: { lines: ['Ghế đá mát quá! Ngồi nghỉ một chút rồi học tiếp.', 'Giờ ra chơi các bạn hay ngồi đây đọc truyện.'] },
    cayqua: { lines: ['Cây trong vườn đang sai quả. Vào Vườn toán học để hái nhé!', 'Quả chín có nhiều vi-ta-min, ăn vào khoẻ người.'] },
    hoa: { lines: ['Hoa thơm quá! Mình ngắm thôi, không hái nhé.', 'Bướm đang hút mật trên hoa kìa!', 'Mỗi sáng các bạn trực nhật tưới hoa đấy.'] },
    dongho: { lines: [function () { var d = new Date(); return 'Đồng hồ chỉ ' + d.getHours() + ' giờ ' + d.getMinutes() + ' phút.'; }, 'Tùng… tùng… tùng! Trống trường báo giờ vào lớp.'] },
    ruatay: { sfx: 'splash', lines: ['Rửa tay bằng xà phòng trước khi ăn và sau khi đi vệ sinh nhé!', 'Lúc xoa xà phòng thì khoá vòi lại để tiết kiệm nước.'] },
    thungrac: { lines: ['Bỏ rác đúng thùng: thùng xanh đựng rác hữu cơ, thùng vàng đựng rác tái chế.', 'Sân trường sạch đẹp là nhờ không ai xả rác bừa bãi.'] },
    chot: { lines: ['Đây là chốt bảo vệ của chú Bình. Chú giữ cho trường mình an toàn.'] },
    nui: { lines: ['Núi non trập trùng phía xa. Trên đỉnh núi cao trời rất lạnh.', 'Rừng trên núi là nhà của rất nhiều loài chim thú.'] },
    lua: { lines: ['Cánh đồng lúa xanh mướt! Hạt gạo mình ăn hằng ngày là từ cây lúa đấy.', 'Lúa chín vàng óng thì bác nông dân gặt về.'] },
    trau: { sfx: 'moo', lines: ['Nghé ọ! Con trâu giúp bác nông dân cày ruộng.', 'Trâu ăn cỏ. Cỏ → trâu cũng là một mắt xích của chuỗi thức ăn.'] },
    cotrang: { lines: ['Đàn cò trắng đang bắt tôm tép ngoài đồng.', '"Con cò bay lả bay la, bay từ cửa phủ bay ra cánh đồng…"'] },
    bunhin: { lines: ['Bù nhìn rơm đứng canh cho chim khỏi ăn thóc.'] },
    aosen: { lines: ['Ao sen thơm ngát. Hoa sen được coi là quốc hoa của Việt Nam.', 'Không chơi gần ao hồ khi không có người lớn đi cùng nhé!'] },
    tre: { lines: ['Luỹ tre làng xanh mát quanh năm.'] },
    bienbao: { lines: ['Biển báo "Trẻ em": gần đây có trường học, xe cộ phải đi chậm lại.', 'Biển hình tam giác viền đỏ là biển báo nguy hiểm.'] },
    xebuyt: { lines: ['Trạm xe buýt đây. Chờ xe dừng hẳn rồi mới lên, xuống và nhớ xếp hàng nhé!', 'Trên xe buýt mình ngồi ngay ngắn, không thò đầu, thò tay ra ngoài.'] },
    nha: { lines: ['Con chào bố mẹ, con đi học ạ!', 'Đi học về, mình nhớ chào ông bà, bố mẹ nhé.'] },
    den: { lines: [function () { return st && st.sim && PHASES[st.sim.pi].open ? 'Đèn cho người đi bộ đang xanh: mình được sang đường, đi trên vạch kẻ.' : 'Đèn cho người đi bộ đang đỏ: mình đứng chờ trên vỉa hè.'; }, 'Đèn đỏ dừng lại, đèn vàng đi chậm, đèn xanh mới được đi.'] }
  };
  function poke(el) {
    var k = POKES[el.getAttribute('data-id')];
    if (!k) return;
    k.i = ((k.i === undefined ? -1 : k.i) + 1) % k.lines.length;
    var t = k.lines[k.i];
    TT.audio.play(k.sfx || 'pop');
    bubble(typeof t === 'function' ? t() : t);
  }

  function dateText() {
    var d = new Date(), days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[d.getDay()] + ', ngày ' + d.getDate() + ' tháng ' + (d.getMonth() + 1);
  }
  function roomContent(p) {
    var npcs = [{ id: 'hang', name: 'Cô Hằng', kind: 'adult', art: 'hang', x: 1270, y: 548 }];
    // [x chỗ ngồi, số thứ tự bàn, nhãn tên đặt cao hơn để hai bạn cùng bàn không đè tên nhau]
    // Chỗ bên trái bàn giữa hàng đầu để dành cho bạn nhỏ.
    [[852, 1], [308, 0], [412, 0, 1], [1188, 2], [1292, 2, 1], [308, 3], [748, 4], [852, 4, 1], [1188, 5], [1292, 5, 1]].forEach(function (s, i) {
      var dy = A.DESKS[s[1]][1];
      npcs.push({ id: 'c' + i, name: p.seatmates[i % p.seatmates.length], kind: 'kid', idx: i + 4, seat: true, hi: !!s[2], x: s[0], y: dy + 64, sy: dy + 42 });
    });
    var list = A.classroomProps().map(function (o) { return { y: o.y, s: wrap(o.y, 'prop', '', o.s) }; });
    npcs.forEach(function (n) { list.push({ y: n.y, s: npcSvg(n, p) }); });
    var table = p.lastTables[0] || p.settings.tables[0] || 2;
    return { ground: A.classroomScene({ table: table, date: dateText() }), actors: list, npcs: npcs };
  }

  /* opts: {scene, at:{x,y,back}, resume, onZone(id), onNpc(npc)} */
  function build(container, opts) {
    init();
    destroy();
    var p = TT.store.profile();
    var key = opts.scene || 'yard', sc = SCENES[key];
    var at = opts.at || (opts.resume && saved[key]) || sc.start;
    st = {
      opts: opts, key: key, sc: sc, profile: p, cam: { x: 0, y: 0 }, scale: 1,
      player: { x: at.x, y: at.y, dir: 1, back: !!at.back }, pet: { x: at.x - 70, y: at.y + 10 },
      target: null, keys: {}, joy: { x: 0, y: 0 }, drag: null, follow: true, seated: null,
      raf: 0, last: 0, stepT: 0, nearT: 0, near: null, nearId: '', moving: false, sig: '', el: {}
    };
    var content = key === 'classroom' ? roomContent(p) : (key === 'road' ? roadContent(p) : yardContent(p));
    st.npcs = content.npcs;
    container.innerHTML = '';
    container.style.background = sc.bg;
    var vp = h('div', { class: 'viewport', id: 'viewport', tabindex: '0', 'aria-label': sc.label });
    var world = h('div', { class: 'world scene-' + key, 'data-light': 'go', style: 'width:' + sc.w + 'px;height:' + sc.h + 'px' });
    var divOn = p.settings.division;

    var hot = '';
    sc.zones.forEach(function (z) {
      if (z.needDiv && !divOn) return; // không tạo điểm tương tác cho hoạt động đang tắt
      if (!z.noSpot) hot += hotspotSvg(z); // noSpot: đồ vật trong cảnh tự là chỗ để chạm
    });
    content.actors.sort(function (a, b) { return a.y - b.y; });
    world.innerHTML = '<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + sc.w + ' ' + sc.h + '" width="' + sc.w + '" height="' + sc.h + '">' +
      '<g class="ground" data-hit="ground">' + content.ground + '</g>' +
      '<g class="actors">' + content.actors.map(function (a) { return a.s; }).join('') +
      '<g class="actor companion" data-y="0"><g class="pet-inner">' + A.pet(p.pet, p.petAcc[p.pet]) + '</g></g>' +
      '<g class="actor player" data-y="0"><g class="player-flip"><g class="player-inner"><g class="pv-front">' + A.girl(p.look) + '</g><g class="pv-back">' + A.girlBack(p.look) + '</g></g></g></g>' +
      '</g><g class="hotspots">' + hot + '</g></svg>';
    // Nhà nào chưa có ảnh riêng (img/lop-hoc-tranh.jpg) thì treo tranh mặc định
    Array.prototype.forEach.call(world.querySelectorAll('image'), function (im) {
      im.addEventListener('error', function () { if (!/tranh-mac-dinh/.test(im.getAttribute('href'))) im.setAttribute('href', 'img/tranh-mac-dinh.svg'); });
    });
    var mark = h('div', { class: 'walk-mark', hidden: true });
    var bubble = h('div', { class: 'player-bubble', hidden: true });
    world.appendChild(mark); world.appendChild(bubble);
    vp.appendChild(world);
    container.appendChild(vp);

    var doBtn = U.btn(h('span', { class: 'do-in' }), 'do-btn', function () { if (st && st.near) interact(st.near); }, { id: 'btn-do', hidden: true });
    var pad = buildPad();
    container.appendChild(pad); container.appendChild(doBtn);

    st.el = { vp: vp, world: world, svg: world.querySelector('svg'), player: world.querySelector('.player'),
      flip: world.querySelector('.player-flip'), pet: world.querySelector('.companion'), actors: world.querySelector('.actors'),
      bubble: bubble, mark: mark, doBtn: doBtn, pad: pad };
    st.flock = sc.flock.map(function (f, i) { return { x: f[0], y: f[1], el: world.querySelector('.gbird[data-i="' + i + '"]'), away: 0 }; });

    if (!hinted) {
      hinted = true;
      var touch = document.body.classList.contains('touch');
      st.el.hint = h('div', { class: 'map-hint', text: touch ? 'Dùng nút điều hướng để đi, hoặc chạm vào nơi con muốn tới.' : 'Đi bằng phím mũi tên hoặc W A S D, hoặc giữ chuột để dẫn đường. Nhấn Enter để vào.' });
      container.appendChild(st.el.hint);
      st.hintT = setTimeout(hideHint, 9000);
    }

    bindPointer(vp);
    st.onKeyDown = onKeyDown; st.onKeyUp = onKeyUp;
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    st.onBlur = function () { if (st) { st.keys = {}; st.joy.x = st.joy.y = 0; } };
    root.addEventListener('blur', st.onBlur);
    st.onResize = function () { layout(true); };
    root.addEventListener('resize', st.onResize);
    if (root.visualViewport) root.visualViewport.addEventListener('resize', st.onResize);
    layout(false);
    placeActors();
    centerOn(st.player.x, st.player.y - camDy(), 1);
    st.raf = requestAnimationFrame(loop);
  }

  function destroy() {
    if (!st) return;
    saved[st.key] = { x: st.player.x, y: st.player.y };
    cancelAnimationFrame(st.raf);
    clearTimeout(st.hintT); clearTimeout(st.greetT);
    document.removeEventListener('keydown', st.onKeyDown);
    document.removeEventListener('keyup', st.onKeyUp);
    root.removeEventListener('blur', st.onBlur);
    root.removeEventListener('resize', st.onResize);
    if (root.visualViewport) root.visualViewport.removeEventListener('resize', st.onResize);
    st = null;
  }

  function hideHint() {
    if (!st || !st.el.hint) return;
    var el = st.el.hint; st.el.hint = null;
    clearTimeout(st.hintT);
    el.classList.add('off');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
  }

  /* ---------------- Tỉ lệ hiển thị và máy quay ---------------- */
  /* Sân trường: giữ chữ và nhân vật dễ nhìn, không thu nhỏ toàn bộ trường. Lớp học: phủ kín khung nhìn. */
  function fitScale(key, vw, vh) {
    if (key === 'classroom') return Math.max(0.42, Math.min(1.5, Math.max(vw / 1600, vh / 1000)));
    var s = Math.min(vh / 860, vw / 900);
    return Math.max(0.5, Math.min(1.15, Math.max(s, vh / 1100)));
  }
  function layout(keep) {
    if (!st) return;
    var r = st.el.vp.getBoundingClientRect();
    var vw = Math.max(1, r.width), vh = Math.max(1, r.height);
    var cx = st.cam.x + (st.vw || vw) / 2 / st.scale, cy = st.cam.y + (st.vh || vh) / 2 / st.scale;
    st.scale = fitScale(st.key, vw, vh); st.vw = vw; st.vh = vh;
    // Màn hình ngang thấp: thanh trên nổi đè lên bản đồ. Cho máy quay lùi thêm đúng chiều cao thanh đó
    // để mép trên của cảnh (mái trường, tranh trên bảng) không bị che.
    var hud = document.getElementById('hud');
    st.padTop = hud && root.getComputedStyle(hud).position === 'absolute' ? hud.offsetHeight : 0;
    st.el.vp.style.background = st.padTop ? 'linear-gradient(' + st.sc.top + ' 0 ' + st.padTop + 'px, ' + st.sc.bg + ' ' + st.padTop + 'px)' : '';
    if (keep) centerOn(cx, cy, 1); else applyCam();
  }

  function clampCam() {
    var W = st.sc.w, H = st.sc.h;
    var maxX = Math.max(0, W - st.vw / st.scale), maxY = Math.max(0, H - st.vh / st.scale);
    st.cam.x = Math.max(0, Math.min(maxX, st.cam.x));
    st.cam.y = Math.max(-(st.padTop || 0) / st.scale, Math.min(maxY, st.cam.y));
    // Khi màn hình rộng hơn thế giới: căn giữa
    st.offX = W * st.scale < st.vw ? (st.vw - W * st.scale) / 2 : 0;
    st.offY = H * st.scale < st.vh ? (st.vh - H * st.scale) / 2 : 0;
  }
  function applyCam() {
    clampCam();
    st.el.world.style.transform = 'translate(' + (st.offX - st.cam.x * st.scale).toFixed(1) + 'px,' + (st.offY - st.cam.y * st.scale).toFixed(1) + 'px) scale(' + st.scale + ')';
  }
  /* Điểm máy quay nhắm tới: phía trên đầu bạn nhỏ một đoạn (thêm phần bị thanh trên che, nếu có) */
  function camDy() { return st.sc.camDy + (st.padTop || 0) / st.scale; }

  /* k = 1: nhảy tới ngay; k nhỏ hơn: trượt dần tới */
  function centerOn(x, y, k) {
    var tx = x - st.vw / 2 / st.scale, ty = y - st.vh / 2 / st.scale;
    if (Math.abs(tx - st.cam.x) + Math.abs(ty - st.cam.y) < 0.05) return;
    st.cam.x += (tx - st.cam.x) * k; st.cam.y += (ty - st.cam.y) * k;
    applyCam();
  }
  function screenToWorld(cx, cy) {
    var r = st.el.vp.getBoundingClientRect();
    return { x: (cx - r.left - st.offX) / st.scale + st.cam.x, y: (cy - r.top - st.offY) / st.scale + st.cam.y };
  }

  /* ---------------- Vẽ nhân vật theo vị trí ---------------- */
  function yOf(el) { return el._y !== undefined ? el._y : (el._y = +el.getAttribute('data-y')); }
  /* Chỉ bạn nhỏ và thú đồng hành đổi chỗ, nên chỉ chèn lại hai phần tử này vào đúng thứ tự xa–gần */
  function sortActor(el, y) {
    el._y = y;
    var kids = st.el.actors.children, ref = null;
    for (var i = 0; i < kids.length; i++) { if (kids[i] !== el && yOf(kids[i]) > y) { ref = kids[i]; break; } }
    if (el.nextElementSibling !== ref) st.el.actors.insertBefore(el, ref);
  }

  function placeActors() {
    var p = st.player, e = st.el, s = st.seated;
    var k = 0.85 * depthScale(st.sc, p.y), kp = 0.72 * depthScale(st.sc, st.pet.y);
    var px = s ? s.x : p.x, top = s ? s.y - 136 : p.y - 200 * k, depth = s ? s.y + 23 : p.y;
    var sig = px.toFixed(1) + '|' + top.toFixed(1) + '|' + p.dir + '|' + (p.back ? 1 : 0) + '|' + st.pet.x.toFixed(1) + '|' + st.pet.y.toFixed(1);
    if (sig === st.sig) return;
    st.sig = sig;
    e.player.setAttribute('transform', 'translate(' + (px - 60 * k).toFixed(1) + ' ' + top.toFixed(1) + ') scale(' + k.toFixed(3) + ')');
    e.flip.setAttribute('transform', p.dir < 0 ? 'translate(120 0) scale(-1 1)' : '');
    e.player.classList.toggle('back', !!(p.back || s));
    e.player.classList.toggle('seated', !!s);
    e.pet.setAttribute('transform', 'translate(' + (st.pet.x - 50 * kp).toFixed(1) + ' ' + (st.pet.y - 100 * kp).toFixed(1) + ') scale(' + kp.toFixed(3) + ')');
    e.bubble.style.left = px + 'px';
    e.bubble.style.top = (top - 30) + 'px';
    sortActor(e.pet, st.pet.y);
    sortActor(e.player, depth);
  }

  /* ---------------- Vật cản và tìm đường ---------------- */
  function clampWalk(x, y) {
    var w = st.sc.walk;
    return { x: Math.max(w.x0, Math.min(w.x1, x)), y: Math.max(w.y0, Math.min(w.y1, y)) };
  }
  /* m: khoảng hở muốn giữ quanh vật cản (dùng khi tìm đường, để không đi sát mép rồi vướng góc) */
  function blocked(x, y, m) {
    var b = st.sc.blocks, g = st.gate;
    if (!m && g && x > g[0] && x < g[2] && y > g[1] && y < g[3]) return true; // cổng đang đóng (đèn đỏ ở vạch sang đường)
    m = m || 0;
    for (var i = 0; i < b.length; i++) { if (x > b[i][0] - m && x < b[i][2] + m && y > b[i][1] - m && y < b[i][3] + m) return true; }
    return false;
  }
  /* Bước một đoạn nhỏ; gặp vật cản thì trượt dọc theo cạnh (capX/capY: không trượt quá điểm đang nhắm tới).
   * Trả về true nếu có nhúc nhích. */
  function step(dx, dy, capX, capY) {
    var p = st.player, ox = p.x, oy = p.y, len = Math.hypot(dx, dy);
    var t = clampWalk(ox + dx, oy + dy);
    if (blocked(ox, oy) || !blocked(t.x, t.y)) { p.x = t.x; p.y = t.y; } // lỡ đứng trong vật cản thì cho đi ra
    else {
      var sx = Math.abs(dx) > len * 0.08 ? Math.min(len, capX === undefined ? len : capX) * (dx < 0 ? -1 : 1) : 0;
      var sy = Math.abs(dy) > len * 0.08 ? Math.min(len, capY === undefined ? len : capY) * (dy < 0 ? -1 : 1) : 0;
      var a = clampWalk(ox + sx, oy), b = clampWalk(ox, oy + sy);
      if (sx && !blocked(a.x, oy)) p.x = a.x;
      else if (sy && !blocked(ox, b.y)) p.y = b.y;
    }
    return Math.abs(p.x - ox) + Math.abs(p.y - oy) > 0.3;
  }
  function clearLine(x0, y0, x1, y1, m) {
    var n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
    for (var i = 1; i <= n; i++) { var k = i / n; if (blocked(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, m)) return false; }
    return true;
  }

  var CELL = 20; // ô lưới nhỏ hơn vật cản nhỏ nhất (gốc cây, cột cờ)
  function grid() {
    var sc = st.sc;
    if (sc.grid) return sc.grid;
    var cols = Math.ceil(sc.w / CELL), rows = Math.ceil(sc.h / CELL), free = new Uint8Array(cols * rows), w = sc.walk;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
        free[r * cols + c] = (x >= w.x0 && x <= w.x1 && y >= w.y0 && y <= w.y1 && !blocked(x, y, 9)) ? 1 : 0;
      }
    }
    return (sc.grid = { cols: cols, rows: rows, free: free });
  }
  function nearestFree(g, x, y) {
    var c0 = Math.floor(x / CELL), r0 = Math.floor(y / CELL), best = -1, bd = 1e9;
    for (var r = r0 - 10; r <= r0 + 10; r++) {
      for (var c = c0 - 10; c <= c0 + 10; c++) {
        if (r < 0 || c < 0 || r >= g.rows || c >= g.cols || !g.free[r * g.cols + c]) continue;
        var d = Math.hypot(c * CELL + CELL / 2 - x, r * CELL + CELL / 2 - y);
        if (d < bd) { bd = d; best = r * g.cols + c; }
      }
    }
    return best;
  }
  /* Đường đi từ (x0,y0) tới (x1,y1): thẳng nếu thoáng, không thì loang trên lưới ô rồi nắn cho gọn */
  function findPath(x0, y0, x1, y1) {
    if (clearLine(x0, y0, x1, y1, 3)) return [{ x: x1, y: y1 }];
    var g = grid(), s = nearestFree(g, x0, y0), e = nearestFree(g, x1, y1);
    if (s < 0 || e < 0) return [{ x: x1, y: y1 }];
    var prev = new Int32Array(g.cols * g.rows).fill(-1), q = [e], qi = 0;
    prev[e] = e;
    while (qi < q.length && prev[s] < 0) {
      var cur = q[qi++], cc = cur % g.cols, cr = (cur - cc) / g.cols;
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          var nc = cc + dc, nr = cr + dr;
          if (nc < 0 || nr < 0 || nc >= g.cols || nr >= g.rows) continue;
          var ni = nr * g.cols + nc;
          if (!g.free[ni] || prev[ni] >= 0) continue;
          if (dr && dc && (!g.free[cr * g.cols + nc] || !g.free[nr * g.cols + cc])) continue; // không cắt góc vật cản
          prev[ni] = cur; q.push(ni);
        }
      }
    }
    if (prev[s] < 0) return [{ x: x1, y: y1 }];
    var pts = [], i = s;
    while (true) {
      pts.push({ x: (i % g.cols) * CELL + CELL / 2, y: Math.floor(i / g.cols) * CELL + CELL / 2 });
      if (i === e) break;
      i = prev[i];
    }
    if (!blocked(x1, y1)) pts.push({ x: x1, y: y1 });
    var out = [], ax = x0, ay = y0, k = 0;
    while (k < pts.length) {
      var j = pts.length - 1;
      while (j > k && !clearLine(ax, ay, pts[j].x, pts[j].y, 6)) j--;
      out.push(pts[j]); ax = pts[j].x; ay = pts[j].y; k = j + 1;
    }
    return out;
  }

  /* ---------------- Đi lại ---------------- */
  function showMark(pt) {
    var m = st.el.mark;
    m.style.left = pt.x + 'px'; m.style.top = pt.y + 'px'; m.hidden = false;
  }
  function stand() { if (st.seated) { st.seated = null; st.sig = ''; } }

  /* Đi tới một điểm (tự vòng qua vật cản); tới nơi thì gọi cb */
  function walkTo(x, y, cb) {
    if (!st) return;
    var t = clampWalk(x, y), p = st.player;
    stand();
    st.follow = true;
    var pts = findPath(p.x, p.y, t.x, t.y), end = pts[pts.length - 1];
    if (U.reducedMotion()) {
      p.x = end.x; p.y = end.y; st.pet.x = p.x - 70; st.pet.y = p.y + 10;
      st.target = null; st.el.mark.hidden = true;
      placeActors(); centerOn(p.x, p.y - camDy(), 1);
      if (cb) setTimeout(cb, 60);
      return;
    }
    st.target = { pts: pts, i: 0, cb: cb, stuck: 0 };
    showMark(end);
  }
  /* Giữ chuột: bạn nhỏ đi thẳng về phía con trỏ */
  function chaseTo(cx, cy) {
    var w = screenToWorld(cx, cy), t = clampWalk(w.x, w.y);
    stand();
    st.follow = true;
    st.target = { pts: [t], i: 0, chase: true, stuck: 0 };
    showMark(t);
  }
  function reach() {
    var t = st.target;
    st.target = null; st.el.mark.hidden = true;
    if (t && t.cb) t.cb();
  }
  function face(dx, dy) {
    var p = st.player, len = Math.hypot(dx, dy) || 1;
    if (Math.abs(dx) > len * 0.3) p.dir = dx < 0 ? -1 : 1;
    if (dy < -len * 0.45) p.back = true;
    else if (dy > len * 0.2 || Math.abs(dx) > len * 0.85) p.back = false;
  }
  function setMoving(on) {
    if (on === st.moving) return;
    st.moving = on;
    st.el.player.classList.toggle('walking', on);
    st.el.pet.classList.toggle('walking', on);
    if (on) { st.stepT = 0; hideHint(); }
  }

  function onSchool() { return document.body.getAttribute('data-screen') === 'school'; }
  function modalOpen() { var m = document.getElementById('modal-root'); return !!(m && m.firstChild); }
  function activeScreen() { return onSchool() && !modalOpen(); }

  function loop(now) {
    if (!st) return;
    st.raf = requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - (st.last || now)) / 1000);
    st.last = now;
    if (!onSchool()) return; // đang ở màn hình hoạt động: cảnh đứng yên
    var p = st.player, sc = st.sc, moved = false;
    var ix = 0, iy = 0;
    if (!modalOpen()) {
      ix = (st.keys.right ? 1 : 0) - (st.keys.left ? 1 : 0) + st.joy.x;
      iy = (st.keys.down ? 1 : 0) - (st.keys.up ? 1 : 0) + st.joy.y;
    }
    var il = Math.hypot(ix, iy);
    if (il > 0.01) {
      // điều khiển trực tiếp bằng bàn phím hoặc nút điều hướng
      if (il > 1) { ix /= il; iy /= il; }
      if (st.target) { st.target = null; st.el.mark.hidden = true; }
      stand();
      st.follow = true;
      var v = sc.speed * depthScale(sc, p.y) * dt; // ở xa thì bước ngắn hơn trên màn hình
      step(ix * v, iy * v);
      face(ix, iy);
      moved = true; // chạm vật cản vẫn bước tại chỗ, để bé thấy phím có tác dụng
    } else if (st.target) {
      var t = st.target, pt = t.pts[t.i], dx = pt.x - p.x, dy = pt.y - p.y, d = Math.hypot(dx, dy);
      if (d < 5) {
        if (t.i < t.pts.length - 1) t.i++;
        else if (!t.chase) reach();
      } else {
        var last = t.i === t.pts.length - 1;
        var sp = Math.min(sc.speed * 1.15, last ? 110 + d * 5 : 1e9) * depthScale(sc, p.y) * dt;
        if (sp > d) sp = d;
        moved = step(dx / d * sp, dy / d * sp, Math.abs(dx), Math.abs(dy));
        face(dx, dy);
        if (moved) t.stuck = 0;
        else if (!t.chase && (t.stuck += dt) > 0.25) {
          // vướng vật cản: tìm lại đường một lần, vẫn vướng thì dừng (nơi đã chọn vẫn mở)
          var end = t.pts[t.pts.length - 1];
          if (!t.again) { t.again = true; t.stuck = 0; t.i = 0; t.pts = findPath(p.x, p.y, end.x, end.y); }
          else { if (Math.hypot(end.x - p.x, end.y - p.y) > 150) t.cb = null; reach(); } // còn xa đích (ví dụ bị đèn đỏ chặn) thì chỉ dừng lại
        }
      }
    }
    if (st.sim) roadUpdate(dt);
    setMoving(moved);
    if (moved) {
      st.stepT -= dt;
      if (st.stepT <= 0) { st.stepT = 0.29; TT.audio.play(sc.step); }
    }
    // thú đồng hành đi theo nhẹ nhàng
    var gx = p.x - 70 * p.dir, gy = p.y + 10, pk = Math.min(1, dt * 5);
    if (Math.abs(gx - st.pet.x) + Math.abs(gy - st.pet.y) > 0.4) { st.pet.x += (gx - st.pet.x) * pk; st.pet.y += (gy - st.pet.y) * pk; }
    placeActors();
    if (st.follow && !(st.drag && st.drag.pan)) centerOn(p.x, p.y - camDy(), 1 - Math.pow(0.88, dt * 60));
    updateFlock(now);
    updateNear(now);
  }

  /* Chim trên sân bay lên khi bạn nhỏ lại gần, lát sau đậu lại */
  function updateFlock(now) {
    var p = st.player;
    for (var i = 0; i < st.flock.length; i++) {
      var b = st.flock[i];
      if (!b.el) continue;
      var d = Math.hypot(b.x - p.x, b.y - p.y);
      if (!b.away && d < 125) { b.away = now + 7000; b.el.classList.add('away'); TT.audio.play('flutter'); }
      else if (b.away && now > b.away && d > 280) { b.away = 0; b.el.classList.remove('away'); }
    }
  }

  /* ---------------- Tương tác với nơi/người đang đứng gần ---------------- */
  function updateNear(now) {
    if (now - st.nearT < 120) return;
    st.nearT = now;
    var p = st.player, best = null, bd = 1e9;
    st.sc.zones.forEach(function (z) {
      if (z.needDiv && !st.profile.settings.division) return;
      var d = Math.hypot(z.tx - p.x, z.ty - p.y);
      if (d < 135 && d < bd) { bd = d; best = { kind: 'zone', id: z.id, z: z }; }
    });
    st.npcs.forEach(function (n) {
      var d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < 160 && d * 0.9 < bd) { bd = d * 0.9; best = { kind: 'npc', id: n.id, n: n }; }
    });
    var id = best ? best.kind + ':' + best.id : '';
    if (id === st.nearId) return;
    st.nearId = id; st.near = best;
    var old = st.el.svg.querySelector('.hotspot.near');
    if (old) old.classList.remove('near');
    var btn = st.el.doBtn;
    if (!best) { btn.hidden = true; return; }
    var label, icon;
    if (best.kind === 'zone') {
      var hs = st.el.svg.querySelector('.hotspot[data-id="' + best.id + '"]');
      if (hs) hs.classList.add('near');
      label = best.z.name; icon = best.z.icon;
    } else {
      label = 'Chào ' + (best.n.name || st.profile.classmates[best.n.idx]); icon = 'speak';
    }
    btn.firstChild.innerHTML = A.icon(icon) + '<span>' + label + '</span><kbd>Enter</kbd>';
    btn.hidden = false;
  }

  function zoneById(id) { return st.sc.zones.filter(function (z) { return z.id === id; })[0]; }
  function npcById(id) { return st.npcs.filter(function (x) { return x.id === id; })[0]; }

  function interact(nr) {
    if (!st) return;
    if (st.target) { st.target = null; st.el.mark.hidden = true; }
    if (nr.kind === 'zone') return arrive(nr.z);
    meet(nr.n);
  }
  /* Tới nơi: quay mặt lên bảng/cửa, hoặc ngồi vào bàn rồi mới mở hoạt động */
  function arrive(z) {
    if (!st) return;
    if (z.face === 'up') st.player.back = true;
    if (z.seat && !st.seated) {
      st.seated = z.seat; st.sig = '';
      TT.audio.play('sit');
      placeActors();
      setTimeout(function () { if (st && st.seated) st.opts.onZone(z.id); }, 420);
      return;
    }
    placeActors();
    st.opts.onZone(z.id);
  }
  function meet(n) {
    if (!n.seat) st.player.dir = st.player.x < n.x ? 1 : -1;
    st.player.back = !!n.seat && st.player.y > n.y;
    st.opts.onNpc(n);
  }

  function goZone(id) {
    if (!st) return;
    var z = zoneById(id);
    if (!z) return;
    if (z.needDiv && !st.profile.settings.division) return;
    walkTo(z.tx, z.ty, function () { arrive(z); });
  }

  function talkTo(id) {
    var n = npcById(id);
    if (!n) return;
    if (n.seat) return meet(n); // bạn đang ngồi trong bàn: nói chuyện từ chỗ mình đứng
    var side = st.player.x < n.x ? -1 : 1, w = st.sc.walk;
    var x = n.x + side * 110, y = Math.min(w.y1, n.y + 10);
    if (blocked(x, y) || x < w.x0 || x > w.x1) x = n.x - side * 110;
    walkTo(x, y, function () { meet(n); });
  }

  function sing(el) {
    TT.audio.play('bird');
    var b = el.querySelector('.bird-in');
    if (!b) return;
    b.classList.remove('sing'); void b.getBoundingClientRect(); b.classList.add('sing');
  }

  /* Bong bóng lời nói phía trên bạn nhỏ; wave = vừa nói vừa vẫy tay chào */
  function bubble(text, wave) {
    if (!st) return;
    var b = st.el.bubble;
    b.textContent = text; b.hidden = false;
    st.el.player.classList.toggle('waving', !!wave);
    clearTimeout(st.greetT);
    st.greetT = setTimeout(function () { if (st) { b.hidden = true; st.el.player.classList.remove('waving'); } }, 4600);
  }
  function greet(text) { bubble(text, true); }

  /* ---------------- Chuột và chạm ----------------
   * Chuột: nhấn giữ trên mặt đất là bạn nhỏ đi theo con trỏ; nhả ra thì đi nốt tới điểm đó.
   * Chạm: chạm là đi tới; kéo quá 10px là xem bản đồ, không mở nhiệm vụ. */
  function hitOf(target) { return target && target.closest ? target.closest('[data-hit]') : null; }

  function bindPointer(vp) {
    vp.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var hit = hitOf(e.target), kind = hit ? hit.getAttribute('data-hit') : 'ground';
      st.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: st.cam.x, cy: st.cam.y, moved: false, pan: false, hit: hit, kind: kind,
        chase: e.pointerType === 'mouse' && kind === 'ground' && activeScreen() };
      if (st.drag.chase) chaseTo(e.clientX, e.clientY);
      try { vp.setPointerCapture(e.pointerId); } catch (err) { /* */ }
    });
    vp.addEventListener('pointermove', function (e) {
      var d = st && st.drag; if (!d || d.id !== e.pointerId) return;
      var mx = e.clientX - d.x, my = e.clientY - d.y;
      if (!d.moved && Math.hypot(mx, my) > 10) {
        d.moved = true;
        if (!d.chase && e.pointerType !== 'mouse') { d.pan = true; st.follow = false; vp.classList.add('dragging'); }
      }
      if (d.chase) chaseTo(e.clientX, e.clientY);
      else if (d.pan) { st.cam.x = d.cx - mx / st.scale; st.cam.y = d.cy - my / st.scale; applyCam(); }
    });
    function end(e) {
      var d = st && st.drag; if (!d || d.id !== e.pointerId) return;
      st.drag = null; vp.classList.remove('dragging');
      if (d.chase) {
        var w = screenToWorld(e.clientX, e.clientY);
        if (e.type === 'pointercancel') { st.target = null; st.el.mark.hidden = true; } else walkTo(w.x, w.y);
        return;
      }
      if (d.moved || e.type === 'pointercancel') return;
      handleTap(d, e.clientX, e.clientY);
    }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
  }

  function handleTap(d, cx, cy) {
    if (d.kind === 'zone') return goZone(d.hit.getAttribute('data-id'));
    if (d.kind === 'npc') return talkTo(d.hit.getAttribute('data-id'));
    if (d.kind === 'bird') return sing(d.hit);
    if (d.kind === 'poke') return poke(d.hit);
    var w = screenToWorld(cx, cy);
    walkTo(w.x, w.y);
  }

  /* ---------------- Nút điều hướng trên màn hình cảm ứng ----------------
   * Giữ ngón tay trên vòng tròn và nghiêng về hướng muốn đi (đi chéo được). */
  function buildPad() {
    var arrow = A.icon('back');
    var pad = h('div', { class: 'pad', role: 'group', 'aria-label': 'Nút điều hướng: giữ và nghiêng về hướng muốn đi', html:
      '<span class="pad-ar up">' + arrow + '</span><span class="pad-ar right">' + arrow + '</span><span class="pad-ar down">' + arrow + '</span><span class="pad-ar left">' + arrow + '</span><span class="pad-knob"></span>' });
    var knob = pad.querySelector('.pad-knob'), active = null;
    function set(e) {
      var r = pad.getBoundingClientRect(), R = r.width / 2;
      var dx = (e.clientX - r.left - R) / R, dy = (e.clientY - r.top - R) / R, d = Math.hypot(dx, dy);
      if (d < 0.18) { st.joy.x = st.joy.y = 0; knob.style.transform = ''; pad.removeAttribute('data-dir'); return; }
      st.joy.x = dx / d; st.joy.y = dy / d;
      var k = Math.min(1, d) * R * 0.55;
      knob.style.transform = 'translate(' + (dx / d * k).toFixed(1) + 'px,' + (dy / d * k).toFixed(1) + 'px)';
      pad.setAttribute('data-dir', Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'));
    }
    function release(e) {
      if (active === null || (e && e.pointerId !== active)) return;
      active = null;
      if (st) st.joy.x = st.joy.y = 0;
      knob.style.transform = ''; pad.classList.remove('on'); pad.removeAttribute('data-dir');
    }
    pad.addEventListener('pointerdown', function (e) {
      if (!st || active !== null) return;
      active = e.pointerId; pad.classList.add('on');
      try { pad.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      set(e); e.preventDefault();
    });
    pad.addEventListener('pointermove', function (e) { if (st && e.pointerId === active) set(e); });
    pad.addEventListener('pointerup', release);
    pad.addEventListener('pointercancel', release);
    pad.addEventListener('lostpointercapture', release);
    pad.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    return pad;
  }

  /* ---------------- Bàn phím ---------------- */
  var KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down' };
  function onKeyDown(e) {
    if (!st || !activeScreen()) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = KEYMAP[e.key];
    if (k) { st.keys[k] = true; e.preventDefault(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && (e.target === document.body || e.target === st.el.vp)) {
      if (e.repeat) return;
      if (st.near) { e.preventDefault(); TT.audio.play('tap'); interact(st.near); }
    }
  }
  function onKeyUp(e) { if (!st) return; var k = KEYMAP[e.key]; if (k) st.keys[k] = false; }

  TT.world = {
    ZONES: ZONES, ROOM_ZONES: ROOM_ZONES, ROAD_ZONES: ROAD_ZONES, NPCS: NPCS, ROAD_NPCS: ROAD_NPCS, SCENES: SCENES, POKES: POKES,
    build: build, destroy: destroy, goZone: goZone, walkTo: walkTo, greet: greet, say: bubble,
    relayout: function () { layout(true); },
    get state() { return st; }
  };
})(window);
