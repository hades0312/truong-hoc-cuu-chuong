/* art.js: toàn bộ hình vẽ SVG tự vẽ (nhân vật, thú, đồ vật, trường học). Không dùng ảnh ngoài. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};

  var SKIN = '#ffd9bd', SKIN_SH = '#f5c3a0', HAIR = '#3d2b2b', CHEEK = '#ffadad';

  function svg(viewBox, inner, cls, label) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '"' + (cls ? ' class="' + cls + '"' : '') +
      (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"') + '>' + inner + '</svg>';
  }

  /* ---------- Khuôn mặt chung ---------- */
  function face(cx, cy, r, mood) {
    var ex = r * 0.38, ey = cy + r * 0.05;
    var s = '';
    s += '<g class="eyes">' +
      '<ellipse cx="' + (cx - ex) + '" cy="' + ey + '" rx="' + (r * 0.11) + '" ry="' + (r * 0.15) + '" fill="#2b2140"/>' +
      '<ellipse cx="' + (cx + ex) + '" cy="' + ey + '" rx="' + (r * 0.11) + '" ry="' + (r * 0.15) + '" fill="#2b2140"/>' +
      '<circle cx="' + (cx - ex + r * 0.04) + '" cy="' + (ey - r * 0.06) + '" r="' + (r * 0.045) + '" fill="#fff"/>' +
      '<circle cx="' + (cx + ex + r * 0.04) + '" cy="' + (ey - r * 0.06) + '" r="' + (r * 0.045) + '" fill="#fff"/></g>';
    s += '<ellipse cx="' + (cx - r * 0.58) + '" cy="' + (cy + r * 0.32) + '" rx="' + (r * 0.16) + '" ry="' + (r * 0.1) + '" fill="' + CHEEK + '" opacity=".8"/>';
    s += '<ellipse cx="' + (cx + r * 0.58) + '" cy="' + (cy + r * 0.32) + '" rx="' + (r * 0.16) + '" ry="' + (r * 0.1) + '" fill="' + CHEEK + '" opacity=".8"/>';
    if (mood === 'wow') {
      s += '<ellipse cx="' + cx + '" cy="' + (cy + r * 0.42) + '" rx="' + (r * 0.12) + '" ry="' + (r * 0.15) + '" fill="#c0392b"/>';
    } else {
      s += '<path d="M' + (cx - r * 0.22) + ' ' + (cy + r * 0.34) + ' Q' + cx + ' ' + (cy + r * 0.62) + ' ' + (cx + r * 0.22) + ' ' + (cy + r * 0.34) + '" fill="#e8505b" stroke="#b83b45" stroke-width="' + (r * 0.05) + '" stroke-linecap="round"/>';
    }
    return s;
  }

  /* ---------- Học sinh nữ (Tiên Tiên / Khánh Huyền) ----------
   * opts: {hair:0 tóc hai bím|1 tóc ngắn|2 tóc dài buộc, bag:màu ba lô, acc:0 không|1 nơ|2 bờm|3 kẹp sao}
   * Gốc tọa độ: chân ở (60,196) trong khung 120×200. */
  function girl(o) {
    o = o || {};
    if (o.boy) return boy(o); // nhân vật bé tự tạo có thể là bạn nam
    var bag = o.bag || '#ff8fab', hair = o.hair || 0, acc = o.acc || 0;
    var s = '<ellipse cx="60" cy="196" rx="30" ry="6" fill="#000" opacity=".12"/>';
    // ba lô phía sau
    s += '<rect x="30" y="96" width="60" height="54" rx="14" fill="' + bag + '"/><rect x="36" y="128" width="48" height="16" rx="6" fill="#fff" opacity=".35"/>';
    // tóc dài phía sau
    if (hair === 2) s += '<path d="M28 56 Q22 110 40 124 L80 124 Q98 110 92 56 Z" fill="' + HAIR + '"/>';
    // chân
    s += '<g class="leg leg-l"><rect x="46" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="42" y="182" width="18" height="10" rx="5" fill="#5b4a8a"/></g>';
    s += '<g class="leg leg-r"><rect x="63" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="60" y="182" width="18" height="10" rx="5" fill="#5b4a8a"/></g>';
    // váy xanh đậm
    s += '<path d="M38 130 L82 130 L92 160 L28 160 Z" fill="#33508f"/><path d="M48 130 L50 160 M60 130 L60 160 M72 130 L70 160" stroke="#26407a" stroke-width="2"/>';
    // áo trắng
    s += '<path d="M40 96 Q60 88 80 96 L84 134 L36 134 Z" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
    // khăn quàng đỏ
    s += '<path d="M48 96 L60 112 L72 96 Z" fill="#e63946"/><path d="M56 108 L52 124 L60 116 L66 124 L63 108 Z" fill="#d62839"/>';
    // dây ba lô
    s += '<path d="M42 98 L44 132 M78 98 L76 132" stroke="' + bag + '" stroke-width="6" stroke-linecap="round"/>';
    // tay
    s += '<g class="arm arm-l"><rect x="27" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="33" cy="134" r="6" fill="' + SKIN + '"/></g>';
    s += '<g class="arm arm-r"><rect x="81" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="87" cy="134" r="6" fill="' + SKIN + '"/></g>';
    // cổ + đầu
    s += '<rect x="54" y="84" width="12" height="12" fill="' + SKIN_SH + '"/>';
    s += '<g class="head">';
    if (hair === 0) { // hai bím
      s += '<circle cx="26" cy="62" r="13" fill="' + HAIR + '"/><circle cx="94" cy="62" r="13" fill="' + HAIR + '"/>' +
        '<circle cx="34" cy="56" r="5" fill="' + bag + '"/><circle cx="86" cy="56" r="5" fill="' + bag + '"/>';
    }
    if (hair === 2) s += '<path d="M60 24 Q100 18 100 60 Q104 86 92 100 Q96 70 84 48 Z" fill="' + HAIR + '"/>';
    s += '<circle cx="60" cy="56" r="32" fill="' + HAIR + '"/>';
    s += '<ellipse cx="60" cy="62" rx="27" ry="28" fill="' + SKIN + '"/>';
    // tóc mái
    if (hair === 1) {
      s += '<path d="M30 60 Q28 26 60 24 Q92 26 90 60 Q86 44 74 40 Q66 50 46 44 Q36 48 30 60 Z" fill="' + HAIR + '"/>' +
        '<path d="M28 58 Q26 80 34 86 L36 60 Z M92 58 Q94 80 86 86 L84 60 Z" fill="' + HAIR + '"/>';
    } else {
      s += '<path d="M32 58 Q30 28 60 26 Q90 28 88 58 Q80 40 62 42 Q60 34 52 44 Q40 42 32 58 Z" fill="' + HAIR + '"/>';
    }
    s += face(60, 62, 27);
    if (acc === 1) s += '<path d="M60 28 L44 18 L44 38 Z M60 28 L76 18 L76 38 Z" fill="#ff5d8f"/><circle cx="60" cy="28" r="5" fill="#ff8fab"/>';
    if (acc === 2) s += '<path d="M31 44 Q60 14 89 44" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/>';
    if (acc === 3) s += '<path d="M80 30 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#ffd166" stroke="#f4a261" stroke-width="1.5"/>';
    s += '</g>';
    return s;
  }

  /* ---------- Học sinh nam (nhân vật bé tự tạo): cùng khung, cùng các khớp tay chân với girl() ----------
   * hair: 0 tóc ngắn | 1 đầu đinh | 2 tóc mái lệch · acc: 0 không | 1 mũ lưỡi trai | 2 kính tròn | 3 huy hiệu sao */
  var BOY_LEGS = '<g class="leg leg-l"><rect x="46" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="42" y="182" width="18" height="10" rx="5" fill="#3f4a6b"/></g>' +
    '<g class="leg leg-r"><rect x="63" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="60" y="182" width="18" height="10" rx="5" fill="#3f4a6b"/></g>' +
    '<path d="M39 128 H81 L84 162 H63 L60 150 L57 162 H36 Z" fill="#33508f"/>';
  var BODY = '<path d="M40 96 Q60 88 80 96 L84 134 L36 134 Z" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
  var ARMS = '<g class="arm arm-l"><rect x="27" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="33" cy="134" r="6" fill="' + SKIN + '"/></g>' +
    '<g class="arm arm-r"><rect x="81" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="87" cy="134" r="6" fill="' + SKIN + '"/></g>';
  var SPIKES = '<path d="M38 36 l5 -11 5 8 5 -12 6 11 6 -12 5 12 5 -9 5 12 Z" fill="' + HAIR + '"/>';

  function boy(o) {
    var bag = o.bag || '#7cc6fe', hair = o.hair || 0, acc = o.acc || 0;
    var s = '<ellipse cx="60" cy="196" rx="30" ry="6" fill="#000" opacity=".12"/>';
    s += '<rect x="30" y="96" width="60" height="54" rx="14" fill="' + bag + '"/><rect x="36" y="128" width="48" height="16" rx="6" fill="#fff" opacity=".35"/>';
    s += BOY_LEGS + BODY;
    s += '<path d="M48 96 L60 112 L72 96 Z" fill="#e63946"/><path d="M56 108 L52 124 L60 116 L66 124 L63 108 Z" fill="#d62839"/>';
    s += '<path d="M42 98 L44 132 M78 98 L76 132" stroke="' + bag + '" stroke-width="6" stroke-linecap="round"/>';
    if (acc === 3) s += '<path transform="translate(70 121)" d="M0 -7 l2 4.4 4.8 .6 -3.5 3.3 .9 4.7 -4.2 -2.3 -4.2 2.3 .9 -4.7 -3.5 -3.3 4.8 -.6z" fill="#ffd166" stroke="#f4a261" stroke-width="1.2"/>';
    s += ARMS + '<rect x="54" y="84" width="12" height="12" fill="' + SKIN_SH + '"/>';
    s += '<g class="head"><circle cx="32" cy="65" r="5.5" fill="' + SKIN_SH + '"/><circle cx="88" cy="65" r="5.5" fill="' + SKIN_SH + '"/>';
    if (hair === 1) s += SPIKES;
    s += '<circle cx="60" cy="57" r="30" fill="' + HAIR + '"/><ellipse cx="60" cy="63" rx="27" ry="27.5" fill="' + SKIN + '"/>';
    if (hair === 1) s += '<path d="M33 53 Q36 31 60 31 Q84 31 87 53 Q74 44 60 45 Q46 44 33 53 Z" fill="' + HAIR + '"/>';
    else if (hair === 2) s += '<path d="M31 60 Q27 26 60 25 Q93 26 89 57 Q85 45 79 41 Q62 53 41 40 Q34 47 31 60 Z" fill="' + HAIR + '"/>';
    else s += '<path d="M32 56 Q34 28 60 28 Q88 28 88 56 Q76 40 60 44 Q46 40 32 56 Z" fill="' + HAIR + '"/>';
    s += face(60, 63, 27);
    if (acc === 1) s += '<path d="M30 45 Q31 13 60 13 Q89 13 90 45 Q60 35 30 45 Z" fill="' + bag + '"/><path d="M50 39 Q84 32 104 45 Q84 52 54 47 Z" fill="' + bag + '"/>' +
      '<path d="M50 39 Q84 32 104 45 Q84 52 54 47 Z" fill="#000" opacity=".16"/><circle cx="60" cy="15" r="4" fill="#fff" opacity=".85"/>';
    if (acc === 2) s += '<g fill="#fff" fill-opacity=".25" stroke="#3a3a5a" stroke-width="2.5"><circle cx="49.5" cy="65" r="8.5"/><circle cx="70.5" cy="65" r="8.5"/></g><path d="M58 65 H62" stroke="#3a3a5a" stroke-width="2.5"/>';
    return s + '</g>';
  }
  function boyBack(o) {
    var bag = o.bag || '#7cc6fe', hair = o.hair || 0, acc = o.acc || 0;
    var s = '<ellipse class="shadow" cx="60" cy="196" rx="30" ry="6" fill="#000" opacity=".12"/>';
    s += BOY_LEGS + BODY + ARMS + '<rect x="54" y="84" width="12" height="12" fill="' + SKIN_SH + '"/>';
    s += backpack(bag);
    s += '<g class="head"><circle cx="32" cy="65" r="5.5" fill="' + SKIN_SH + '"/><circle cx="88" cy="65" r="5.5" fill="' + SKIN_SH + '"/>';
    if (hair === 1) s += SPIKES;
    s += '<circle cx="60" cy="57" r="30" fill="' + HAIR + '"/><path d="M42 80 Q60 93 78 80 L76 87 Q60 97 44 87Z" fill="' + SKIN + '"/>';
    s += '<path d="M40 39 Q60 27 80 39" fill="none" stroke="#6e5656" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    if (acc === 1) s += '<path d="M30 47 Q31 13 60 13 Q89 13 90 47 Q60 38 30 47 Z" fill="' + bag + '"/><path d="M48 41 Q60 49 72 41" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="15" r="4" fill="#fff" opacity=".85"/>';
    return s + '</g>';
  }

  /* Ba lô nhìn từ sau lưng */
  function backpack(bag) {
    return '<path d="M50 97 Q60 82 70 97" fill="none" stroke="' + bag + '" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="31" y="94" width="58" height="60" rx="16" fill="' + bag + '"/>' +
      '<rect x="31" y="94" width="58" height="60" rx="16" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>' +
      '<path d="M37 114 H83" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="40" y="122" width="40" height="24" rx="9" fill="#fff" opacity=".35"/><circle cx="60" cy="134" r="4" fill="#fff" opacity=".75"/>';
  }

  /* Nhìn từ sau lưng (khi đi lên phía trên, đứng trước bảng hoặc ngồi vào bàn): thấy ba lô và mái tóc. */
  function girlBack(o) {
    o = o || {};
    if (o.boy) return boyBack(o);
    var bag = o.bag || '#ff8fab', hair = o.hair || 0, acc = o.acc || 0;
    var s = '<ellipse class="shadow" cx="60" cy="196" rx="30" ry="6" fill="#000" opacity=".12"/>';
    s += '<g class="leg leg-l"><rect x="46" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="43" y="182" width="17" height="10" rx="5" fill="#5b4a8a"/></g>';
    s += '<g class="leg leg-r"><rect x="63" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="60" y="182" width="17" height="10" rx="5" fill="#5b4a8a"/></g>';
    s += '<path d="M38 130 L82 130 L92 160 L28 160 Z" fill="#33508f"/><path d="M48 130 L50 160 M60 130 L60 160 M72 130 L70 160" stroke="#26407a" stroke-width="2"/>';
    s += '<path d="M40 96 Q60 88 80 96 L84 134 L36 134 Z" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
    s += '<g class="arm arm-l"><rect x="27" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="33" cy="134" r="6" fill="' + SKIN + '"/></g>';
    s += '<g class="arm arm-r"><rect x="81" y="98" width="12" height="34" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><circle cx="87" cy="134" r="6" fill="' + SKIN + '"/></g>';
    s += '<rect x="54" y="84" width="12" height="12" fill="' + SKIN_SH + '"/>';
    s += backpack(bag);
    s += '<g class="head">';
    if (hair === 0) {
      s += '<circle cx="26" cy="62" r="13" fill="' + HAIR + '"/><circle cx="94" cy="62" r="13" fill="' + HAIR + '"/>' +
        '<circle cx="34" cy="56" r="5" fill="' + bag + '"/><circle cx="86" cy="56" r="5" fill="' + bag + '"/>';
    }
    if (hair === 2) s += '<path d="M30 58 Q24 104 40 122 L80 122 Q96 104 90 58 Z" fill="' + HAIR + '"/>';
    s += '<circle cx="60" cy="56" r="32" fill="' + HAIR + '"/>';
    s += '<path d="M40 38 Q60 26 80 38" fill="none" stroke="#6e5656" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    if (hair === 2) s += '<rect x="50" y="84" width="20" height="7" rx="3.5" fill="' + bag + '"/>';
    if (acc === 1) s += '<path d="M60 28 L44 18 L44 38 Z M60 28 L76 18 L76 38 Z" fill="#ff5d8f"/><circle cx="60" cy="28" r="5" fill="#ff8fab"/>';
    if (acc === 2) s += '<path d="M31 44 Q60 14 89 44" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/>';
    if (acc === 3) s += '<path d="M40 30 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#ffd166" stroke="#f4a261" stroke-width="1.5"/>';
    s += '</g>';
    return s;
  }

  /* ---------- Bạn học NPC ---------- */
  /* Các bạn nam trong danh sách CLASSMATES (storage.js); những bạn còn lại vẽ hình bạn nữ */
  var BOYS = ['Bảo Trọng', 'Vinh Chí', 'Đức Dũng', 'Huy Đăng', 'Phúc Lâm', 'Tiến Thành', 'Văn Thịnh', 'Trung Trí', 'Bá Tùng',
    'Văn Toàn', 'Hưng Đạo', 'Hoàng Hải', 'Minh Khang', 'Khải Minh', 'Đình Hậu', 'Bảo Hoà', 'Văn Phúc', 'Văn Hiếu', 'Văn Thành'];
  var SHIRTS = ['#8ecae6', '#ffd6a5', '#caffbf', '#ffc6ff', '#bdb2ff', '#fdffb6'];
  function kid(name, colorIdx) {
    var boy = BOYS.indexOf(name) >= 0;
    var shirt = SHIRTS[colorIdx % SHIRTS.length];
    var s = '<ellipse cx="60" cy="196" rx="28" ry="6" fill="#000" opacity=".12"/>';
    s += '<rect x="47" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/><rect x="62" y="150" width="11" height="36" rx="5" fill="' + SKIN + '"/>';
    s += '<rect x="43" y="182" width="18" height="10" rx="5" fill="#444"/><rect x="60" y="182" width="18" height="10" rx="5" fill="#444"/>';
    if (boy) s += '<rect x="40" y="128" width="40" height="28" rx="6" fill="#33508f"/>';
    else s += '<path d="M40 130 L80 130 L90 160 L30 160 Z" fill="#33508f"/>';
    s += '<path d="M40 96 Q60 88 80 96 L84 134 L36 134 Z" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
    s += '<path d="M48 96 L60 112 L72 96 Z" fill="#e63946"/>';
    s += '<rect x="27" y="98" width="12" height="32" rx="6" fill="#fff"/><rect x="81" y="98" width="12" height="32" rx="6" fill="#fff"/>';
    s += '<circle cx="33" cy="132" r="6" fill="' + SKIN + '"/><circle cx="87" cy="132" r="6" fill="' + SKIN + '"/>';
    s += '<rect x="54" y="84" width="12" height="12" fill="' + SKIN_SH + '"/>';
    if (boy) {
      s += '<circle cx="60" cy="58" r="30" fill="' + HAIR + '"/><ellipse cx="60" cy="64" rx="27" ry="27" fill="' + SKIN + '"/>' +
        '<path d="M32 56 Q34 28 60 28 Q88 28 88 56 Q76 40 60 44 Q46 40 32 56 Z" fill="' + HAIR + '"/>';
    } else {
      s += '<circle cx="60" cy="58" r="32" fill="' + HAIR + '"/><path d="M30 60 Q26 92 40 98 L44 60 Z M90 60 Q94 92 80 98 L76 60Z" fill="' + HAIR + '"/>' +
        '<ellipse cx="60" cy="64" rx="27" ry="27" fill="' + SKIN + '"/>' +
        '<path d="M32 58 Q30 28 60 28 Q90 28 88 58 Q78 42 60 46 Q42 42 32 58 Z" fill="' + HAIR + '"/>' +
        '<circle cx="84" cy="40" r="6" fill="' + shirt + '"/>';
    }
    s += face(60, 64, 26);
    // phù hiệu màu riêng để phân biệt
    s += '<circle cx="72" cy="118" r="5" fill="' + shirt + '" stroke="#fff" stroke-width="2"/>';
    return s;
  }

  /* Bạn học đang ngồi trong lớp, quay mặt lên bảng: chỉ vẽ nửa người nhìn từ sau (y 26–150). */
  function kidSeat(name, colorIdx) {
    var boy = BOYS.indexOf(name) >= 0;
    var shirt = SHIRTS[colorIdx % SHIRTS.length];
    var s = '<path d="M38 98 Q60 88 82 98 L86 150 L34 150 Z" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
    s += '<path d="M45 95 Q60 108 75 95" fill="none" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>';
    s += '<rect x="26" y="100" width="12" height="30" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/><rect x="82" y="100" width="12" height="30" rx="6" fill="#fff" stroke="#e3e6f0" stroke-width="2"/>';
    s += '<rect x="54" y="82" width="12" height="14" fill="' + SKIN_SH + '"/>';
    if (boy) {
      s += '<circle cx="31" cy="62" r="5" fill="' + SKIN + '"/><circle cx="89" cy="62" r="5" fill="' + SKIN + '"/>' +
        '<circle cx="60" cy="58" r="29" fill="' + HAIR + '"/><path d="M42 80 Q60 92 78 80 L76 86 Q60 96 44 86Z" fill="' + SKIN + '"/>';
    } else {
      s += '<path d="M30 60 Q24 102 42 110 L78 110 Q96 102 90 60 Z" fill="' + HAIR + '"/><circle cx="60" cy="58" r="32" fill="' + HAIR + '"/>' +
        '<circle cx="84" cy="40" r="6" fill="' + shirt + '"/>';
    }
    s += '<path d="M42 40 Q60 28 78 40" fill="none" stroke="#6e5656" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    s += '<rect x="44" y="140" width="32" height="8" rx="4" fill="' + shirt + '"/>';
    return s;
  }

  /* ---------- Thầy cô và chú bảo vệ (khung 120×220) ---------- */
  function adult(kind) {
    var s = '<ellipse cx="60" cy="216" rx="32" ry="6" fill="#000" opacity=".12"/>';
    var conf = {
      hang: { top: '#a8dadc', bottom: '#a8dadc', hair: 'long', extra: 'glasses', dress: true },
      nam: { top: '#b7e4c7', bottom: '#4a5a7a', hair: 'short', extra: 'tie' },
      hoa: { top: '#cdb4db', bottom: '#6d597a', hair: 'bun', extra: 'book', dress: true },
      binh: { top: '#d4a373', bottom: '#5e503f', hair: 'cap', extra: 'whistle' }
    }[kind];
    s += '<rect x="46" y="160" width="12" height="46" rx="5" fill="' + (conf.dress ? SKIN : conf.bottom) + '"/><rect x="62" y="160" width="12" height="46" rx="5" fill="' + (conf.dress ? SKIN : conf.bottom) + '"/>';
    s += '<rect x="42" y="202" width="18" height="10" rx="5" fill="#3a3a3a"/><rect x="60" y="202" width="18" height="10" rx="5" fill="#3a3a3a"/>';
    if (conf.dress) s += '<path d="M38 98 Q60 90 82 98 L90 190 L30 190 Z" fill="' + conf.top + '"/><path d="M60 100 L60 190" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>';
    else s += '<rect x="40" y="140" width="40" height="28" rx="4" fill="' + conf.bottom + '"/><path d="M38 98 Q60 90 82 98 L84 148 L36 148 Z" fill="' + conf.top + '"/>';
    s += '<rect x="26" y="100" width="13" height="44" rx="6" fill="' + conf.top + '"/><rect x="81" y="100" width="13" height="44" rx="6" fill="' + conf.top + '"/>';
    s += '<circle cx="32" cy="146" r="7" fill="' + SKIN + '"/><circle cx="88" cy="146" r="7" fill="' + SKIN + '"/>';
    if (conf.extra === 'tie') s += '<path d="M56 98 L64 98 L62 104 L66 128 L60 134 L54 128 L58 104 Z" fill="#e76f51"/>';
    if (conf.extra === 'book') s += '<rect x="76" y="120" width="26" height="32" rx="3" fill="#e63946"/><rect x="80" y="124" width="18" height="4" fill="#fff" opacity=".7"/>';
    if (conf.extra === 'whistle') s += '<path d="M50 98 Q60 120 70 98" stroke="#e63946" stroke-width="2" fill="none"/><rect x="56" y="116" width="10" height="6" rx="3" fill="#bbb"/>';
    s += '<rect x="54" y="84" width="12" height="14" fill="' + SKIN_SH + '"/>';
    if (conf.hair === 'long') s += '<path d="M28 56 Q22 108 40 112 L80 112 Q98 108 92 56 Z" fill="' + HAIR + '"/>';
    if (conf.hair === 'bun') s += '<circle cx="60" cy="22" r="14" fill="' + HAIR + '"/>';
    s += '<circle cx="60" cy="56" r="30" fill="' + HAIR + '"/><ellipse cx="60" cy="62" rx="26" ry="27" fill="' + SKIN + '"/>';
    if (conf.hair === 'short' || conf.hair === 'cap') s += '<path d="M33 54 Q34 30 60 30 Q86 30 87 54 Q76 42 60 44 Q44 42 33 54 Z" fill="' + HAIR + '"/>';
    else s += '<path d="M33 56 Q32 30 60 30 Q88 30 87 56 Q74 38 58 44 Q44 40 33 56 Z" fill="' + HAIR + '"/>';
    if (conf.hair === 'cap') s += '<path d="M30 46 Q60 14 90 46 Z" fill="#34495e"/><rect x="28" y="42" width="66" height="8" rx="4" fill="#2c3e50"/><circle cx="60" cy="34" r="5" fill="#ffd166"/>';
    s += face(60, 62, 26);
    if (conf.extra === 'glasses') s += '<g fill="none" stroke="#5a4a6a" stroke-width="2.5"><circle cx="50" cy="64" r="8"/><circle cx="70" cy="64" r="8"/><path d="M58 64 L62 64"/></g>';
    return s;
  }

  /* ---------- Thú đồng hành (khung 100×100) ---------- */
  function pet(kind, accIdx) {
    var s = '<ellipse cx="50" cy="94" rx="26" ry="5" fill="#000" opacity=".12"/>';
    if (kind === 'mit') { // mèo cam
      s += '<path class="tail" d="M74 74 Q96 66 90 46" fill="none" stroke="#f4a261" stroke-width="8" stroke-linecap="round"/>';
      s += '<ellipse cx="50" cy="74" rx="26" ry="20" fill="#f4a261"/><ellipse cx="50" cy="80" rx="14" ry="11" fill="#ffe8d1"/>';
      s += '<path d="M26 40 L30 14 L46 30 Z M74 40 L70 14 L54 30 Z" fill="#f4a261"/><path d="M30 34 L32 20 L41 30Z M70 34 L68 20 L59 30Z" fill="#ffb4a2"/>';
      s += '<circle cx="50" cy="44" r="24" fill="#f4a261"/><path d="M42 24 L46 32 M50 22 L50 31 M58 24 L54 32" stroke="#e07a3f" stroke-width="3" stroke-linecap="round"/>';
      s += face(50, 46, 20);
      s += '<path d="M28 50 L16 48 M28 54 L16 56 M72 50 L84 48 M72 54 L84 56" stroke="#a0522d" stroke-width="1.5"/>';
    } else if (kind === 'bong') { // thỏ trắng
      s += '<ellipse class="ear" cx="38" cy="18" rx="8" ry="20" fill="#fff" stroke="#eadff0" stroke-width="2"/><ellipse cx="38" cy="20" rx="4" ry="14" fill="#ffc8dd"/>';
      s += '<ellipse class="ear" cx="62" cy="18" rx="8" ry="20" fill="#fff" stroke="#eadff0" stroke-width="2"/><ellipse cx="62" cy="20" rx="4" ry="14" fill="#ffc8dd"/>';
      s += '<ellipse cx="50" cy="74" rx="25" ry="20" fill="#fff" stroke="#eadff0" stroke-width="2"/><circle cx="76" cy="80" r="7" fill="#fff" stroke="#eadff0" stroke-width="2"/>';
      s += '<circle cx="50" cy="46" r="23" fill="#fff" stroke="#eadff0" stroke-width="2"/>';
      s += face(50, 48, 19);
    } else { // rồng nhỏ Đậu
      s += '<path class="tail" d="M72 80 Q94 84 92 64 L98 60 L88 58" fill="none" stroke="#6ccf8e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<path class="wing" d="M26 62 Q6 46 14 34 Q22 46 32 50 Z" fill="#b8f2c9"/><path class="wing" d="M74 62 Q94 46 86 34 Q78 46 68 50 Z" fill="#b8f2c9"/>';
      s += '<ellipse cx="50" cy="74" rx="25" ry="20" fill="#6ccf8e"/><ellipse cx="50" cy="80" rx="14" ry="12" fill="#e9ffd9"/>';
      s += '<path d="M38 24 L34 10 L44 20 Z M62 24 L66 10 L56 20 Z" fill="#ffd166"/>';
      s += '<circle cx="50" cy="44" r="23" fill="#6ccf8e"/><path d="M44 22 L50 14 L56 22" fill="#ffd166"/>';
      s += face(50, 46, 19);
    }
    // phụ kiện
    var ay = kind === 'bong' ? 30 : 26;
    if (accIdx === 1) s += '<path d="M50 ' + ay + ' L38 ' + (ay - 8) + ' L38 ' + (ay + 8) + ' Z M50 ' + ay + ' L62 ' + (ay - 8) + ' L62 ' + (ay + 8) + ' Z" fill="#ff5d8f"/><circle cx="50" cy="' + ay + '" r="4" fill="#ff8fab"/>';
    if (accIdx === 2) s += '<path d="M40 ' + (ay + 2) + ' L50 ' + (ay - 22) + ' L60 ' + (ay + 2) + ' Z" fill="#9b5de5"/><circle cx="50" cy="' + (ay - 22) + '" r="4" fill="#ffd166"/><circle cx="46" cy="' + (ay - 6) + '" r="2" fill="#fff"/><circle cx="54" cy="' + (ay - 2) + '" r="2" fill="#fff"/>';
    if (accIdx === 3) s += '<path d="M30 62 Q50 72 70 62 L70 68 Q50 78 30 68 Z" fill="#00bbf9"/><rect x="58" y="66" width="8" height="16" rx="3" fill="#00a6dd"/>';
    if (accIdx === 4) s += '<g fill="#fff" fill-opacity=".3" stroke="#3a3a5a" stroke-width="2.5"><circle cx="42" cy="48" r="7"/><circle cx="58" cy="48" r="7"/></g><path d="M49 48 L51 48" stroke="#3a3a5a" stroke-width="2.5"/>';
    return s;
  }
  var PET_NAMES = { mit: 'mèo Mít', bong: 'thỏ Bông', dau: 'rồng nhỏ Đậu' };
  var PET_ACC = [
    { id: 0, name: 'Không đeo', price: 0 },
    { id: 1, name: 'Nơ hồng', price: 3 },
    { id: 2, name: 'Mũ tiệc', price: 4 },
    { id: 3, name: 'Khăn xanh', price: 4 },
    { id: 4, name: 'Kính tròn', price: 5 }
  ];

  /* ---------- Đồ vật để đếm (khung 24×24), mỗi biểu tượng = đúng 1 đồ vật ---------- */
  var OBJ = {
    apple: '<circle cx="12" cy="14" r="8" fill="#ef476f"/><path d="M12 6 Q13 3 15 2" stroke="#6b4226" stroke-width="1.8" fill="none"/><path d="M13 6 Q18 3 19 6 Q15 8 13 6Z" fill="#6ccf8e"/><circle cx="9" cy="11" r="2" fill="#fff" opacity=".5"/>',
    kid: '<circle cx="12" cy="12" r="9" fill="' + HAIR + '"/><circle cx="12" cy="13.5" r="7.2" fill="' + SKIN + '"/><path d="M5 11 Q12 3 19 11 Q12 8 5 11Z" fill="' + HAIR + '"/><circle cx="9.5" cy="13.5" r="1.1" fill="#2b2140"/><circle cx="14.5" cy="13.5" r="1.1" fill="#2b2140"/><path d="M10 16.5 Q12 18 14 16.5" stroke="#c0392b" stroke-width="1.1" fill="none"/>',
    pencil: '<g transform="rotate(-40 12 12)"><rect x="9" y="2" width="6" height="15" fill="#ffd166"/><rect x="9" y="2" width="6" height="3" fill="#ef476f"/><path d="M9 17 L12 22 L15 17Z" fill="#f2cc8f"/><path d="M11 20 L12 22 L13 20Z" fill="#333"/></g>',
    cake: '<path d="M4 12 L20 12 L19 20 L5 20Z" fill="#ffc6ff"/><path d="M4 12 Q8 8 12 12 Q16 8 20 12Z" fill="#fff"/><circle cx="12" cy="7" r="2.6" fill="#ef476f"/>',
    flower: '<g fill="#ff8fab"><circle cx="12" cy="6.5" r="4"/><circle cx="17.2" cy="10.3" r="4"/><circle cx="15.2" cy="16.4" r="4"/><circle cx="8.8" cy="16.4" r="4"/><circle cx="6.8" cy="10.3" r="4"/></g><circle cx="12" cy="12" r="3.4" fill="#ffd166"/>',
    marble: '<circle cx="12" cy="12" r="8" fill="#4cc9f0"/><path d="M6 12 Q12 6 18 12" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/><circle cx="9" cy="9" r="2" fill="#fff" opacity=".7"/>',
    orange: '<circle cx="12" cy="13" r="8" fill="#ff9f1c"/><path d="M12 5 L13 2" stroke="#6b4226" stroke-width="1.6"/><path d="M13 5 Q17 2 18 5 Q15 7 13 5Z" fill="#6ccf8e"/><circle cx="9" cy="10" r="1.8" fill="#fff" opacity=".5"/>',
    cookie: '<circle cx="12" cy="12" r="9" fill="#e9c46a" stroke="#c99a3a" stroke-width="1"/><circle cx="9" cy="9" r="1.5" fill="#6b4226"/><circle cx="15" cy="10" r="1.3" fill="#6b4226"/><circle cx="11" cy="15" r="1.4" fill="#6b4226"/><circle cx="16" cy="15" r="1.1" fill="#6b4226"/>',
    dot: '<circle cx="12" cy="12" r="8" fill="#7b61ff"/>',
    star: '<path d="M12 2.5 l2.9 6 6.6 .9 -4.8 4.6 1.2 6.5 -5.9 -3.2 -5.9 3.2 1.2 -6.5 -4.8 -4.6 6.6 -.9z" fill="#ffd166" stroke="#f4a261" stroke-width="1.2"/>',
    ball: '<circle cx="12" cy="12" r="9" fill="#ff9f1c"/><path d="M3 12 H21 M12 3 V21 M5.5 5.5 Q12 12 5.5 18.5 M18.5 5.5 Q12 12 18.5 18.5" stroke="#8a4b08" stroke-width="1.1" fill="none"/>'
  };
  function obj(name, cls) { return svg('0 0 24 24', OBJ[name] || OBJ.dot, cls || 'obj'); }

  /* Ngữ cảnh bài toán: nhóm/đồ vật phải khớp hình vẽ */
  var CONTEXTS = [
    { group: 'giỏ', item: 'quả táo', unit: 'quả', icon: 'apple' },
    { group: 'bàn', item: 'bạn', unit: 'bạn', icon: 'kid' },
    { group: 'hộp', item: 'cây bút chì', unit: 'cây bút chì', icon: 'pencil' },
    { group: 'đĩa', item: 'cái bánh', unit: 'cái bánh', icon: 'cake' },
    { group: 'lọ', item: 'bông hoa', unit: 'bông hoa', icon: 'flower' },
    { group: 'túi', item: 'viên bi', unit: 'viên bi', icon: 'marble' }
  ];

  /* ---------- Đồ trang trí đảo ---------- */
  var DECOR = {
    flower: { name: 'Bồn hoa', price: 0, svg: '<ellipse cx="40" cy="64" rx="30" ry="10" fill="#8d6e63"/><g fill="#ff8fab"><circle cx="24" cy="52" r="8"/><circle cx="56" cy="52" r="8"/></g><circle cx="40" cy="46" r="9" fill="#ffd166"/><circle cx="24" cy="52" r="3" fill="#ffd166"/><circle cx="56" cy="52" r="3" fill="#ffd166"/><path d="M24 60 V56 M40 60 V54 M56 60 V56" stroke="#4caf50" stroke-width="3"/>' },
    tree: { name: 'Cây táo nhỏ', price: 4, svg: '<rect x="35" y="44" width="10" height="26" rx="3" fill="#8d6e63"/><circle cx="40" cy="34" r="24" fill="#6ccf8e"/><circle cx="30" cy="30" r="4" fill="#ef476f"/><circle cx="50" cy="38" r="4" fill="#ef476f"/><circle cx="42" cy="22" r="4" fill="#ef476f"/>' },
    bench: { name: 'Ghế gỗ', price: 3, svg: '<rect x="12" y="40" width="56" height="8" rx="3" fill="#c68b59"/><rect x="12" y="28" width="56" height="7" rx="3" fill="#c68b59"/><rect x="16" y="48" width="6" height="18" fill="#8d6e63"/><rect x="58" y="48" width="6" height="18" fill="#8d6e63"/>' },
    lamp: { name: 'Đèn lồng sao', price: 4, svg: '<rect x="38" y="20" width="4" height="50" fill="#5c677d"/><path d="M40 6 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5z" fill="#ffd166" stroke="#f4a261" stroke-width="2"/>' },
    kite: { name: 'Diều cầu vồng', price: 5, svg: '<path d="M40 6 L62 30 L40 54 L18 30 Z" fill="#9b5de5"/><path d="M40 6 L62 30 L40 30Z" fill="#f15bb5"/><path d="M40 30 L18 30 L40 54Z" fill="#00bbf9"/><path d="M40 54 Q30 62 44 66 Q34 72 40 78" stroke="#555" stroke-width="2" fill="none"/>' },
    castle: { name: 'Lâu đài cát', price: 6, svg: '<rect x="16" y="38" width="48" height="30" fill="#f2cc8f"/><rect x="12" y="28" width="16" height="40" fill="#e9c46a"/><rect x="52" y="28" width="16" height="40" fill="#e9c46a"/><path d="M12 28 L20 16 L28 28Z M52 28 L60 16 L68 28Z" fill="#ef476f"/><rect x="34" y="52" width="12" height="16" rx="6" fill="#8d6e63"/>' },
    fountain: { name: 'Đài phun nước', price: 6, svg: '<ellipse cx="40" cy="62" rx="32" ry="10" fill="#90e0ef"/><ellipse cx="40" cy="60" rx="32" ry="10" fill="none" stroke="#adb5bd" stroke-width="4"/><rect x="36" y="34" width="8" height="26" fill="#adb5bd"/><path d="M40 34 Q26 18 20 40 M40 34 Q54 18 60 40" stroke="#48cae4" stroke-width="4" fill="none"/>' },
    rainbow: { name: 'Cổng cầu vồng', price: 7, svg: '<path d="M8 66 A32 32 0 0 1 72 66" fill="none" stroke="#ef476f" stroke-width="6"/><path d="M14 66 A26 26 0 0 1 66 66" fill="none" stroke="#ffd166" stroke-width="6"/><path d="M20 66 A20 20 0 0 1 60 66" fill="none" stroke="#06d6a0" stroke-width="6"/><path d="M26 66 A14 14 0 0 1 54 66" fill="none" stroke="#118ab2" stroke-width="6"/>' },
    mushroom: { name: 'Nhà nấm', price: 6, svg: '<rect x="24" y="40" width="32" height="28" rx="6" fill="#fff3e0"/><path d="M8 44 Q40 0 72 44 Z" fill="#ef476f"/><circle cx="28" cy="30" r="5" fill="#fff"/><circle cx="50" cy="24" r="4" fill="#fff"/><rect x="34" y="50" width="12" height="18" rx="5" fill="#8d6e63"/>' },
    balloon: { name: 'Chùm bóng bay', price: 2, svg: '<path d="M40 70 L30 34 M40 70 L40 26 M40 70 L52 36" stroke="#888" stroke-width="1.5"/><ellipse cx="28" cy="26" rx="10" ry="12" fill="#f15bb5"/><ellipse cx="40" cy="18" rx="10" ry="12" fill="#00bbf9"/><ellipse cx="54" cy="28" rx="10" ry="12" fill="#fee440"/>' }
  };
  function decor(id) { return svg('0 0 80 80', DECOR[id] ? DECOR[id].svg : '', 'decor'); }

  /* ---------- Biểu tượng khu vực (cho thanh "Đi nhanh" và điểm tương tác) ---------- */
  var ICON = {
    classroom: '<rect x="4" y="5" width="24" height="16" rx="2" fill="#2d6a4f"/><path d="M8 10 H15 M8 14 H20" stroke="#fff" stroke-width="2" stroke-linecap="round"/><rect x="12" y="21" width="8" height="5" fill="#8d6e63"/>',
    library: '<rect x="5" y="6" width="6" height="20" rx="1" fill="#ef476f"/><rect x="12" y="4" width="6" height="22" rx="1" fill="#118ab2"/><rect x="19" y="8" width="7" height="18" rx="1" fill="#ffd166" transform="rotate(8 22 17)"/>',
    garden: '<path d="M16 28 V14" stroke="#4caf50" stroke-width="3"/><circle cx="16" cy="11" r="8" fill="#6ccf8e"/><circle cx="12" cy="10" r="2.4" fill="#ef476f"/><circle cx="19" cy="13" r="2.4" fill="#ef476f"/><circle cx="17" cy="7" r="2.4" fill="#ef476f"/>',
    sports: '<circle cx="16" cy="16" r="11" fill="#ff9f1c"/><path d="M5 16 H27 M16 5 V27 M8 8 Q16 16 8 24 M24 8 Q16 16 24 24" stroke="#8a4b08" stroke-width="1.4" fill="none"/>',
    canteen: '<ellipse cx="16" cy="20" rx="12" ry="5" fill="#e9ecef"/><path d="M6 18 Q16 4 26 18Z" fill="#ffd166"/><circle cx="16" cy="9" r="2" fill="#e76f51"/>',
    art: '<path d="M16 4 C6 4 3 13 5 19 C7 25 13 22 14 25 C15 29 26 28 28 20 C30 10 24 4 16 4Z" fill="#fff3c4" stroke="#e9c46a" stroke-width="1.5"/><circle cx="11" cy="11" r="2.4" fill="#ef476f"/><circle cx="17" cy="9" r="2.4" fill="#118ab2"/><circle cx="23" cy="13" r="2.4" fill="#06d6a0"/><circle cx="22" cy="20" r="2.4" fill="#9b5de5"/>',
    pets: '<circle cx="16" cy="19" r="7" fill="#f4a261"/><circle cx="8" cy="12" r="3.2" fill="#f4a261"/><circle cx="13" cy="7" r="3.2" fill="#f4a261"/><circle cx="19" cy="7" r="3.2" fill="#f4a261"/><circle cx="24" cy="12" r="3.2" fill="#f4a261"/>',
    board: '<rect x="4" y="4" width="24" height="18" rx="2" fill="#c68b59"/><rect x="7" y="7" width="8" height="6" fill="#fff"/><rect x="17" y="8" width="8" height="8" fill="#ffd6a5"/><rect x="8" y="15" width="7" height="5" fill="#caffbf"/><rect x="9" y="22" width="3" height="7" fill="#8d6e63"/><rect x="20" y="22" width="3" height="7" fill="#8d6e63"/>',
    review: '<path d="M16 5 A11 11 0 1 1 6 12" fill="none" stroke="#7b61ff" stroke-width="3.2" stroke-linecap="round"/><path d="M3 6 L6 13 L12 9" fill="none" stroke="#7b61ff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 11 V17 L20 19" stroke="#7b61ff" stroke-width="2.6" stroke-linecap="round" fill="none"/>',
    desk: '<rect x="3" y="12" width="26" height="6" rx="2" fill="#d6a877"/><rect x="5" y="18" width="3.5" height="10" fill="#a9774b"/><rect x="23.5" y="18" width="3.5" height="10" fill="#a9774b"/><rect x="10" y="5" width="12" height="7" rx="1.2" fill="#fff" stroke="#9fb7d1" stroke-width="1.2"/><path d="M12.5 8.5 H19.5" stroke="#9fb7d1" stroke-width="1.2"/>',
    door: '<rect x="8" y="3" width="17" height="26" rx="2" fill="#c68b59"/><rect x="11" y="6" width="11" height="9" rx="1" fill="#bde0fe"/><circle cx="21.5" cy="19" r="1.7" fill="#ffd166"/><path d="M5 29 H28" stroke="#8d6e63" stroke-width="2" stroke-linecap="round"/>',
    install: '<rect x="8" y="2.5" width="16" height="27" rx="4" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M16 9 V19 M11.5 15 L16 19.5 L20.5 15" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 25 H19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    share: '<path d="M10 13 H7.5 V28 H24.5 V13 H22" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 20 V4 M10.5 9 L16 3.5 L21.5 9" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    addbox: '<rect x="4.5" y="4.5" width="23" height="23" rx="6" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M16 10 V22 M10 16 H22" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
    dots: '<circle cx="16" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="16" cy="25" r="3" fill="currentColor"/>',
    pc: '<rect x="3.5" y="5" width="25" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M11 27.5 H21" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M16 8.5 V17 M12.5 14 L16 17.5 L19.5 14" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    walk: '<circle cx="17" cy="6" r="3.6" fill="currentColor"/><path d="M17 11 L14 19 L18 23 L17 29 M14 19 L9 28 M16 13 L10 16 M17 13 L23 17" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    island: '<ellipse cx="16" cy="24" rx="13" ry="4" fill="#48cae4"/><path d="M6 23 Q16 14 26 23Z" fill="#f2cc8f"/><path d="M16 21 Q15 12 17 8" stroke="#8d6e63" stroke-width="2" fill="none"/><path d="M17 8 Q10 5 7 10 M17 8 Q24 4 27 10 M17 8 Q14 2 10 3" stroke="#4caf50" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
    star: OBJ.star.replace('viewBox', ''),
    sound: '<path d="M5 12 H10 L17 6 V26 L10 20 H5 Z" fill="currentColor"/><path d="M21 11 Q24 16 21 21 M24 8 Q29 16 24 24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    mute: '<path d="M5 12 H10 L17 6 V26 L10 20 H5 Z" fill="currentColor"/><path d="M21 12 L28 20 M28 12 L21 20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    fullscreen: '<path d="M5 12 V5 H12 M20 5 H27 V12 M27 20 V27 H20 M12 27 H5 V20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    home: '<path d="M4 15 L16 5 L28 15" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13 V27 H24 V13" fill="currentColor" opacity=".9"/><rect x="13" y="18" width="6" height="9" fill="#fff"/>',
    motion: '<circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 16 Q13 11 16 16 T22 16" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
    parent: '<circle cx="11" cy="10" r="5" fill="currentColor"/><circle cx="22" cy="12" r="4" fill="currentColor"/><path d="M3 27 Q4 17 11 17 Q18 17 19 27Z M17 27 Q18 19 22 19 Q28 19 29 27Z" fill="currentColor"/>',
    speak: '<path d="M5 12 H10 L17 6 V26 L10 20 H5 Z" fill="currentColor"/><path d="M21 11 Q24 16 21 21" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    hint: '<path d="M16 3 A9 9 0 0 1 21 19 V22 H11 V19 A9 9 0 0 1 16 3Z" fill="#ffd166" stroke="#f4a261" stroke-width="1.5"/><rect x="11" y="23" width="10" height="3" rx="1.5" fill="#adb5bd"/><rect x="12" y="27" width="8" height="2.5" rx="1.2" fill="#adb5bd"/>',
    close: '<path d="M8 8 L24 24 M24 8 L8 24" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>',
    back: '<path d="M20 6 L10 16 L20 26" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    treat: '<path d="M6 12 Q16 2 26 12 L24 26 H8 Z" fill="#ffd6a5" stroke="#e9a35c" stroke-width="1.5"/><circle cx="12" cy="16" r="2" fill="#e76f51"/><circle cx="20" cy="18" r="2" fill="#e76f51"/>'
  };
  function icon(name, cls) { return svg('0 0 32 32', ICON[name] || '', cls || 'ico'); }

  /* ---------- Toàn cảnh Trường Tiểu Học Tân Trường (thế giới 2400×1500) ---------- */
  var WORLD = { w: 2400, h: 1500 };

  function windowRow(x, y, n, gap, w, h, color) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var wx = x + i * gap;
      s += '<rect x="' + wx + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + (color || '#bde0fe') + '" stroke="#fff" stroke-width="5"/>' +
        '<path d="M' + (wx + w / 2) + ' ' + y + ' V' + (y + h) + ' M' + wx + ' ' + (y + h / 2) + ' H' + (wx + w) + '" stroke="#fff" stroke-width="3"/>';
    }
    return s;
  }
  function tree(x, y, r, cls, fruit) {
    var s = '<g class="tree ' + (cls || '') + '" transform="translate(' + x + ' ' + y + ')">' +
      '<ellipse cx="0" cy="6" rx="' + r * 0.9 + '" ry="' + r * 0.22 + '" fill="#000" opacity=".1"/>' +
      '<rect x="' + (-r * 0.14) + '" y="' + (-r * 0.9) + '" width="' + (r * 0.28) + '" height="' + (r * 0.95) + '" rx="6" fill="#9c6b4e"/>' +
      '<g class="crown"><circle cx="0" cy="' + (-r * 1.25) + '" r="' + r * 0.8 + '" fill="#57c27a"/>' +
      '<circle cx="' + (-r * 0.55) + '" cy="' + (-r * 0.95) + '" r="' + r * 0.55 + '" fill="#6ccf8e"/>' +
      '<circle cx="' + (r * 0.55) + '" cy="' + (-r * 0.95) + '" r="' + r * 0.55 + '" fill="#4fb36e"/>' +
      '<circle cx="' + (-r * 0.2) + '" cy="' + (-r * 1.5) + '" r="' + r * 0.35 + '" fill="#8ee0a6" opacity=".8"/>';
    if (fruit) {
      [[-0.4, -1.1], [0.3, -1.4], [0.5, -0.9], [-0.1, -0.8], [-0.6, -1.5]].forEach(function (p) {
        s += '<circle cx="' + p[0] * r + '" cy="' + p[1] * r + '" r="' + r * 0.1 + '" fill="' + fruit + '"/>';
      });
    }
    return s + '</g></g>';
  }
  function bush(x, y, w) {
    return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="0" rx="' + w + '" ry="' + w * 0.5 + '" fill="#57c27a"/><ellipse cx="' + (-w * 0.4) + '" cy="' + (-w * 0.15) + '" rx="' + w * 0.5 + '" ry="' + w * 0.4 + '" fill="#6ccf8e"/><circle cx="' + (w * 0.3) + '" cy="' + (-w * 0.25) + '" r="' + w * 0.35 + '" fill="#7fd99b"/></g>';
  }
  function flowerBed(x, y, w) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2) + '" y="-14" width="' + w + '" height="34" rx="16" fill="#c9a37a"/><rect x="' + (-w / 2 + 6) + '" y="-20" width="' + (w - 12) + '" height="22" rx="11" fill="#6ccf8e"/>';
    var colors = ['#ff8fab', '#ffd166', '#f15bb5', '#ffffff', '#ff9f1c'];
    for (var i = 0; i < Math.floor(w / 26); i++) {
      s += '<circle cx="' + (-w / 2 + 18 + i * 26) + '" cy="' + (-14 + (i % 2) * 6) + '" r="7" fill="' + colors[i % colors.length] + '"/>';
    }
    return s + '</g>';
  }
  function label(x, y, text, size, color) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="w-label" font-size="' + (size || 26) + '" fill="' + (color || '#3b2f63') + '">' + text + '</text>';
  }
  function signBoard(x, y, w, text, bg, size) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2) + '" y="-24" width="' + w + '" height="44" rx="12" fill="' + (bg || '#fff') + '" stroke="#3b2f63" stroke-opacity=".15" stroke-width="3"/>' +
      label(0, 7, text, size || 24) + '</g>';
  }

  /* Chim nhỏ đậu: chạm vào là hót. Khung ngoài giữ vị trí, khung trong dành cho chuyển động. */
  function bird(x, y, color, flip, cls) {
    return '<g class="bird ' + (cls || '') + '" data-hit="bird" transform="translate(' + x + ' ' + y + ')' + (flip ? ' scale(-1 1)' : '') + '"><g class="bird-fly"><g class="bird-in">' +
      '<rect x="-30" y="-44" width="64" height="56" fill="transparent"/>' +
      '<path d="M-3 0 V7 M5 0 V7" stroke="#c97b2a" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M-12 -8 L-27 -15 L-22 -3 Z" fill="' + color + '"/>' +
      '<ellipse cx="0" cy="-10" rx="15" ry="12" fill="' + color + '"/><ellipse cx="3" cy="-6" rx="9" ry="7" fill="#fff" opacity=".55"/>' +
      '<path d="M-9 -15 Q0 -22 8 -12 Q0 -5 -9 -15Z" fill="#000" opacity=".16"/>' +
      '<circle cx="10" cy="-21" r="9.5" fill="' + color + '"/><circle cx="13.5" cy="-23" r="2.3" fill="#2b2140"/><circle cx="14.2" cy="-23.8" r=".8" fill="#fff"/>' +
      '<path d="M18.5 -21.5 L27 -18.5 L18.5 -16 Z" fill="#ff9f1c"/>' +
      '</g></g></g>';
  }
  function skyBird(x, y, sc, cls) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><g class="skybird ' + (cls || '') + '"><path d="M0 0 Q9 -13 18 0 Q27 -13 36 0" fill="none" stroke="#5c677d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></g>';
  }
  function butterfly(x, y, color, cls) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="bfly ' + (cls || '') + '"><g class="bfly-wing"><path d="M0 0 Q-15 -19 -17 -3 Q-15 10 0 0 Q15 -19 17 -3 Q15 10 0 0Z" fill="' + color + '"/><circle cx="-10" cy="-5" r="2.4" fill="#fff" opacity=".7"/><circle cx="10" cy="-5" r="2.4" fill="#fff" opacity=".7"/></g><path d="M0 -7 V6" stroke="#3b2f63" stroke-width="2.4" stroke-linecap="round"/></g></g>';
  }

  /* Vật cao trong sân. Ở bản đồ đi lại được, chúng nằm chung lớp với nhân vật để che khuất đúng theo chiều sâu (y = chân vật). */
  function yardProps() {
    var bench = function (x) {
      return '<g transform="translate(' + x + ' 900)"><rect x="-60" y="0" width="120" height="16" rx="8" fill="#adb5bd"/><rect x="-50" y="16" width="14" height="20" fill="#868e96"/><rect x="36" y="16" width="14" height="20" fill="#868e96"/></g>';
    };
    return [
      { y: 880, s: '<rect x="1244" y="640" width="10" height="240" rx="4" fill="#adb5bd"/>' +
        '<g class="flag"><rect x="1254" y="646" width="96" height="64" fill="#da251d"/><path d="M1302 660 l5.6 17.4 h18.3 l-14.8 10.8 5.6 17.4 -14.7 -10.8 -14.8 10.8 5.6 -17.4 -14.7 -10.8 h18.2z" fill="#ffde00" transform="translate(0 -4) scale(1)"/></g>' },
      { y: 862, s: tree(620, 860, 80, 'shade') }, { y: 936, s: bench(620) },
      { y: 862, s: tree(1880, 860, 80, 'shade') }, { y: 936, s: bench(1880) },
      { y: 852, s: '<g id="b-board" transform="translate(900 760)"><rect x="-8" y="0" width="12" height="90" fill="#8d6e63"/><rect x="146" y="0" width="12" height="90" fill="#8d6e63"/>' +
        '<rect x="-20" y="-110" width="190" height="120" rx="10" fill="#c68b59"/><rect x="-10" y="-100" width="170" height="100" rx="6" fill="#fdf0d5"/>' +
        '<rect x="0" y="-90" width="60" height="40" fill="#fff" transform="rotate(-4 30 -70)"/><rect x="80" y="-92" width="66" height="46" fill="#caffbf" transform="rotate(3 113 -69)"/><rect x="20" y="-40" width="70" height="32" fill="#ffd6a5"/>' +
        label(75, -120, 'Bảng tin', 24) + '</g>' },
      { y: 866, s: tree(2140, 860, 46, 'fruit', '#ef476f') }, { y: 856, s: tree(2240, 850, 50, 'fruit', '#ff9f1c') }, { y: 876, s: tree(2330, 870, 42, 'fruit', '#ef476f') },
      // cổng trường luôn che phía trước: bạn nhỏ đi qua bên dưới tấm biển
      { y: 1481, s: '<g id="gate-arch">' +
        '<rect x="1010" y="1240" width="50" height="240" rx="8" fill="#e9c46a"/><rect x="1440" y="1240" width="50" height="240" rx="8" fill="#e9c46a"/>' +
        '<rect x="1000" y="1228" width="70" height="20" rx="6" fill="#d4a373"/><rect x="1430" y="1228" width="70" height="20" rx="6" fill="#d4a373"/>' +
        '<path d="M1000 1214 Q1250 1120 1500 1214" fill="none" stroke="#ffd166" stroke-width="14" stroke-linecap="round"/>' +
        '<rect x="975" y="1196" width="550" height="78" rx="22" fill="#2a6f97" stroke="#fff" stroke-width="6"/>' +
        '<text x="1250" y="1247" text-anchor="middle" class="w-label gate-text" font-size="34" fill="#fff">Trường Tiểu Học Tân Trường</text>' + '</g>' },
      { y: 1420, s: '<g id="booth" transform="translate(1640 1300)"><rect x="-70" y="0" width="140" height="120" rx="8" fill="#e0fbfc"/><path d="M-84 4 L0 -44 L84 4Z" fill="#3d5a80"/><rect x="-50" y="22" width="56" height="44" rx="6" fill="#98c1d9" stroke="#fff" stroke-width="4"/><rect x="18" y="40" width="38" height="80" rx="6" fill="#3d5a80"/>' + label(0, -14, 'Bảo vệ', 18, '#fff') + '</g>' }
    ];
  }

  /* o.noProps: bỏ các vật cao (world.js tự xếp chúng theo chiều sâu cùng nhân vật) */
  function schoolScene(o) {
    var s = '';
    s += '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aee2ff"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient>' +
      '<linearGradient id="roofA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a261"/><stop offset="1" stop-color="#e07a3f"/></linearGradient>' +
      '<pattern id="grass" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#bfe8a0"/><path d="M8 30 l2 -6 2 6 M28 14 l2 -6 2 6" stroke="#a6d987" stroke-width="2" fill="none"/></pattern>' +
      '<pattern id="court" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#7ccf8a"/><rect width="30" height="60" fill="#74c482"/></pattern>' +
      '</defs>';
    // Bầu trời, núi xa, mặt trời, mây
    s += '<rect width="2400" height="560" fill="url(#sky)"/>';
    s += '<circle cx="200" cy="120" r="60" fill="#fff3b0"/><circle cx="200" cy="120" r="44" fill="#ffe066"/>';
    s += '<path d="M0 420 Q300 250 620 400 Q900 260 1250 390 Q1600 240 1950 380 Q2200 300 2400 360 V560 H0Z" fill="#cdeec0"/>';
    s += '<path d="M0 470 Q400 360 800 460 Q1200 370 1600 450 Q2000 360 2400 440 V560 H0Z" fill="#b4e3a2"/>';
    s += '<g class="cloud c1"><ellipse cx="520" cy="110" rx="80" ry="30" fill="#fff"/><ellipse cx="570" cy="90" rx="50" ry="34" fill="#fff"/></g>';
    s += '<g class="cloud c2"><ellipse cx="1500" cy="80" rx="90" ry="28" fill="#fff"/><ellipse cx="1450" cy="64" rx="50" ry="30" fill="#fff"/></g>';
    s += '<g class="cloud c3"><ellipse cx="2100" cy="150" rx="70" ry="24" fill="#fff"/><ellipse cx="2140" cy="134" rx="40" ry="26" fill="#fff"/></g>';
    // Mặt đất
    s += '<rect y="520" width="2400" height="980" fill="url(#grass)"/>';
    // Hàng cây hậu cảnh
    for (var i = 0; i < 13; i++) s += tree(60 + i * 190, 560, 70 + (i % 3) * 10, 'bg');
    // Lối đi và sân chính
    s += '<path d="M1110 1500 L1150 1080 L1350 1080 L1390 1500 Z" fill="#f3e2c0"/>';
    s += '<rect x="470" y="660" width="1560" height="440" rx="60" fill="#f6e7c8"/>';
    s += '<rect x="490" y="680" width="1520" height="400" rx="50" fill="none" stroke="#ead6ad" stroke-width="6" stroke-dasharray="20 18"/>';
    s += '<path d="M470 900 L260 1000 M2030 900 L2200 980 M600 1090 L420 1180 M1900 1090 L1950 1150" stroke="#f3e2c0" stroke-width="70" stroke-linecap="round"/>';

    // Phòng Mỹ thuật (trái)
    s += '<g id="b-art"><rect x="230" y="420" width="380" height="230" rx="10" fill="#ffd6e0"/>' +
      '<path d="M210 430 L420 330 L630 430 Z" fill="#ff8fab"/><rect x="210" y="424" width="420" height="16" rx="6" fill="#f2668b"/>' +
      windowRow(260, 470, 2, 110, 80, 70, '#ffe5ec') + '<rect x="490" y="520" width="80" height="130" rx="10" fill="#c9184a" opacity=".85"/><circle cx="555" cy="590" r="5" fill="#ffd166"/>' +
      '<g transform="translate(300 560)"><circle r="28" fill="#fff3c4"/><circle cx="-10" cy="-8" r="6" fill="#ef476f"/><circle cx="8" cy="-10" r="6" fill="#118ab2"/><circle cx="12" cy="8" r="6" fill="#06d6a0"/></g>' +
      signBoard(420, 395, 230, 'Phòng Mỹ thuật', '#fff') + '</g>';

    // Khối lớp học hai tầng (giữa)
    s += '<g id="b-class">' +
      '<rect x="700" y="270" width="880" height="390" rx="8" fill="#fff3c4"/>' +
      '<path d="M680 280 L1140 150 L1600 280 Z" fill="url(#roofA)"/><rect x="680" y="272" width="920" height="18" rx="6" fill="#d9692f"/>' +
      '<circle cx="1140" cy="225" r="34" fill="#fff" stroke="#3b2f63" stroke-width="5"/><path d="M1140 225 V202 M1140 225 L1156 233" stroke="#3b2f63" stroke-width="5" stroke-linecap="round"/>' +
      // tầng 2 + hành lang
      windowRow(740, 310, 6, 128, 84, 66) +
      '<rect x="700" y="400" width="880" height="16" fill="#e9c46a"/>' +
      '<g stroke="#e9c46a" stroke-width="6">' + (function () { var r = ''; for (var k = 0; k < 23; k++) r += '<path d="M' + (712 + k * 38) + ' 416 V446"/>'; return r; })() + '</g>' +
      '<rect x="700" y="444" width="880" height="10" fill="#e9c46a"/>' +
      // tầng 1
      windowRow(740, 490, 2, 128, 84, 70) + windowRow(1310, 490, 2, 128, 84, 70) +
      '<rect x="1040" y="470" width="200" height="190" rx="14" fill="#2d6a4f"/><rect x="1056" y="486" width="80" height="174" rx="8" fill="#40916c"/><rect x="1144" y="486" width="80" height="174" rx="8" fill="#40916c"/>' +
      // cầu thang bên phải
      '<g fill="#e9c46a">' + (function () { var r = ''; for (var k = 0; k < 7; k++) r += '<rect x="' + (1590 + k * 0) + '" y="' + (420 + k * 34) + '" width="' + (60 + k * 6) + '" height="12" rx="3"/>'; return r; })() + '</g>' +
      '<path d="M1590 420 L1680 660" stroke="#d4a373" stroke-width="8"/>' +
      // bảng tên lớp
      signBoard(782, 297, 96, 'Lớp 4A', '#fff', 20) + signBoard(1038, 297, 96, 'Lớp 4B', '#fff', 20) + signBoard(1294, 297, 96, 'Lớp 3A', '#fff', 20) + signBoard(1508, 297, 96, 'Lớp 5A', '#fff', 20) +
      signBoard(1140, 456, 290, 'Lớp học cửu chương', '#fff', 24) +
      '</g>';

    // Thư viện (phải)
    s += '<g id="b-lib"><rect x="1700" y="400" width="360" height="250" rx="10" fill="#d7ecff"/>' +
      '<path d="M1680 410 L1880 310 L2080 410 Z" fill="#5c9ded"/><rect x="1680" y="404" width="400" height="16" rx="6" fill="#3d7fd6"/>' +
      windowRow(1730, 450, 1, 0, 90, 80, '#eef7ff') + windowRow(1950, 450, 1, 0, 80, 80, '#eef7ff') +
      '<rect x="1840" y="510" width="80" height="140" rx="10" fill="#1d4e89"/><circle cx="1905" cy="585" r="5" fill="#ffd166"/>' +
      '<g transform="translate(1770 590)"><rect x="-26" y="-22" width="16" height="40" fill="#ef476f"/><rect x="-8" y="-28" width="16" height="46" fill="#ffd166"/><rect x="10" y="-18" width="16" height="36" fill="#06d6a0"/></g>' +
      signBoard(1880, 378, 160, 'Thư viện', '#fff') + '</g>';

    // Nhà vệ sinh + vòi rửa tay + thùng rác (chi tiết môi trường)
    s += '<g id="b-wc"><rect x="2120" y="470" width="190" height="170" rx="10" fill="#e9f5f2"/><path d="M2110 476 L2215 420 L2320 476Z" fill="#94d2bd"/>' +
      '<rect x="2140" y="530" width="56" height="110" rx="8" fill="#0a9396"/><rect x="2230" y="530" width="56" height="110" rx="8" fill="#ee6c4d"/>' +
      '<circle cx="2168" cy="510" r="11" fill="#0a9396"/><circle cx="2258" cy="510" r="11" fill="#ee6c4d"/>' +
      label(2215, 462, 'Nhà vệ sinh', 20) +
      '<g transform="translate(2060 660)"><rect x="-40" y="-6" width="80" height="34" rx="8" fill="#ced4da"/><rect x="-30" y="-2" width="60" height="16" rx="6" fill="#90e0ef"/><path d="M-14 -6 V-24 H0 M14 -6 V-24 H0" stroke="#868e96" stroke-width="5" fill="none"/></g>' +
      '<g transform="translate(2330 680)"><rect x="-20" y="-30" width="40" height="50" rx="6" fill="#06d6a0"/><rect x="-24" y="-36" width="48" height="10" rx="4" fill="#049a74"/><rect x="26" y="-30" width="40" height="50" rx="6" fill="#ffd166"/><rect x="22" y="-36" width="48" height="10" rx="4" fill="#e9b949"/></g>' +
      '</g>';

    // Vườn toán học (phải giữa)
    s += '<g id="b-garden"><rect x="2070" y="740" width="310" height="300" rx="24" fill="#cbeec0" stroke="#c68b59" stroke-width="8" stroke-dasharray="4 14" stroke-linecap="round"/>' +
      '<g transform="translate(2120 960)"><rect x="-90" y="-10" width="250" height="26" rx="12" fill="#a1785b"/>' +
      '<g fill="#ff8fab">' + (function () { var r = ''; for (var k = 0; k < 8; k++) r += '<circle cx="' + (-74 + k * 30) + '" cy="-12" r="9"/>'; return r; })() + '</g></g>' +
      '<g transform="translate(2300 1000)"><path d="M-26 -10 L26 -10 L20 18 L-20 18 Z" fill="#c68b59"/><circle cx="-10" cy="-14" r="8" fill="#ef476f"/><circle cx="8" cy="-16" r="8" fill="#ef476f"/></g>' +
      signBoard(2225, 728, 210, 'Vườn toán học', '#fff') + '</g>';

    // Nhà ăn (trái giữa)
    s += '<g id="b-canteen"><rect x="40" y="720" width="380" height="230" rx="10" fill="#ffe0b5"/>' +
      '<path d="M20 730 L230 640 L440 730Z" fill="#e76f51"/><rect x="20" y="724" width="420" height="16" rx="6" fill="#c8553d"/>' +
      '<path d="M40 760 H420" stroke="#ffd166" stroke-width="18" stroke-dasharray="30 20"/>' +
      windowRow(70, 790, 2, 110, 84, 66, '#fff4e0') + '<rect x="300" y="810" width="90" height="140" rx="10" fill="#9c6644"/>' +
      '<g transform="translate(180 1000)"><rect x="-80" y="-8" width="160" height="14" rx="6" fill="#c68b59"/><rect x="-70" y="6" width="10" height="30" fill="#8d6e63"/><rect x="60" y="6" width="10" height="30" fill="#8d6e63"/><ellipse cx="-30" cy="-12" rx="22" ry="6" fill="#e9ecef"/><ellipse cx="30" cy="-12" rx="22" ry="6" fill="#e9ecef"/></g>' +
      signBoard(230, 700, 150, 'Nhà ăn', '#fff') + '</g>';

    // Sân chính: chân cột cờ, bồn hoa (cột cờ, cây bóng mát, ghế đá, bảng tin nằm trong yardProps)
    s += '<g id="yard"><ellipse cx="1250" cy="880" rx="70" ry="22" fill="#e9d8b4"/>' +
      flowerBed(1060, 1060, 160) + flowerBed(1440, 1060, 160) + '</g>';

    // Góc thú cưng (trái dưới)
    s += '<g id="b-pets"><rect x="70" y="1120" width="480" height="270" rx="30" fill="#d8f3dc"/>' +
      '<g stroke="#c68b59" stroke-width="8" stroke-linecap="round">' + (function () { var r = ''; for (var k = 0; k < 13; k++) r += '<path d="M' + (86 + k * 37) + ' 1112 V1150"/>'; return r; })() + '<path d="M80 1126 H540"/></g>' +
      '<g transform="translate(450 1250)"><path d="M-60 -10 L0 -70 L60 -10Z" fill="#e76f51"/><rect x="-50" y="-12" width="100" height="80" rx="6" fill="#ffd6a5"/><path d="M-18 68 V20 A18 18 0 0 1 18 20 V68Z" fill="#8d6e63"/></g>' +
      '<ellipse cx="200" cy="1340" rx="44" ry="12" fill="#adb5bd"/><ellipse cx="200" cy="1336" rx="36" ry="8" fill="#ffd166"/>' +
      signBoard(310, 1105, 200, 'Góc thú cưng', '#fff') + '</g>';

    // Cổng khám phá sang đảo
    s += '<g id="b-portal" transform="translate(760 1290)"><ellipse cx="0" cy="80" rx="110" ry="20" fill="#90e0ef" opacity=".7"/>' +
      '<path d="M-100 80 A100 100 0 0 1 100 80" fill="none" stroke="#ef476f" stroke-width="14"/><path d="M-84 80 A84 84 0 0 1 84 80" fill="none" stroke="#ffd166" stroke-width="14"/>' +
      '<path d="M-68 80 A68 68 0 0 1 68 80" fill="none" stroke="#06d6a0" stroke-width="14"/><path d="M-52 80 A52 52 0 0 1 52 80" fill="none" stroke="#118ab2" stroke-width="14"/>' +
      '<g class="sparkle"><path d="M-110 -10 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff"/><path d="M110 0 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff"/></g>' +
      signBoard(0, -50, 220, 'Cổng khám phá', '#fff', 22) + '</g>';

    // Sân thể thao (phải dưới)
    s += '<g id="b-sports"><rect x="1700" y="1130" width="640" height="270" rx="20" fill="url(#court)"/>' +
      '<rect x="1720" y="1150" width="600" height="230" rx="10" fill="none" stroke="#fff" stroke-width="6"/><path d="M2020 1150 V1380" stroke="#fff" stroke-width="5"/><circle cx="2020" cy="1265" r="44" fill="none" stroke="#fff" stroke-width="5"/>' +
      '<g transform="translate(2290 1260)"><rect x="-6" y="-140" width="10" height="150" fill="#6c757d"/><rect x="-60" y="-160" width="70" height="50" rx="4" fill="#fff" stroke="#adb5bd" stroke-width="3"/><path d="M-50 -118 h30 l-4 26 h-22z" fill="none" stroke="#ef476f" stroke-width="4"/></g>' +
      '<g transform="translate(1760 1265)"><path d="M0 -50 h-40 v100 h40" fill="none" stroke="#fff" stroke-width="7"/><path d="M-36 -46 v92" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="6 6"/></g>' +
      '<g transform="translate(1860 1190)" font-size="20">' + (function () { var r = ''; var nums = [1, 2, 3, 4, 5, 6]; for (var k = 0; k < 6; k++) { var px = (k % 2) * 46, py = Math.floor(k / 2) * 46; r += '<rect x="' + px + '" y="' + py + '" width="42" height="42" rx="6" fill="#fff" fill-opacity=".85"/><text x="' + (px + 21) + '" y="' + (py + 29) + '" text-anchor="middle" class="w-label" fill="#e76f51">' + nums[k] + '</text>'; } return r; })() + '</g>' +
      signBoard(2020, 1118, 210, 'Sân thể thao', '#fff') + '</g>';

    // Hàng rào trước + cổng trường + chòi bảo vệ
    s += '<g id="b-gate">' +
      '<g stroke="#5c677d" stroke-width="7" stroke-linecap="round">' + (function () { var r = ''; for (var k = 0; k < 64; k++) { var fx = 10 + k * 38; if (fx > 1030 && fx < 1470) continue; r += '<path d="M' + fx + ' 1420 V1470"/>'; } return r; })() +
      '<path d="M0 1432 H1040 M1460 1432 H2400 M0 1460 H1040 M1460 1460 H2400"/></g>' +
      flowerBed(930, 1400, 120) + flowerBed(1570, 1400, 120) +
      '</g>';

    if (!(o && o.noProps)) yardProps().forEach(function (p) { s += p.s; });

    // Chim đậu trên mái nhà và hàng rào, chim bay ngang trời, bướm quanh bồn hoa
    s += bird(905, 217, '#ffb703') + bird(1962, 351, '#8ecae6', true, 'b2') + bird(318, 379, '#ff8fab', false, 'b3') +
      bird(640, 1432, '#95d5b2', false, 'b2') + bird(1820, 1432, '#ffd166', true) +
      skyBird(0, 215, 1) + skyBird(0, 120, 0.8, 's2') + skyBird(0, 300, 0.65, 's3') +
      butterfly(1030, 1022, '#f15bb5') + butterfly(1410, 1026, '#ffd166', 'f2') + butterfly(2110, 930, '#9b5de5', 'f3');

    // Tiền cảnh: bụi cây và cây lớn ở góc (tạo chiều sâu)
    s += '<g class="fg">' + bush(140, 1480, 70) + bush(420, 1490, 60) + bush(2000, 1485, 70) + bush(2300, 1480, 64) + '</g>';
    return s;
  }

  /* ---------- Bên trong lớp học (thế giới 1600×1000): tường và bảng ở phía trên, nền gạch phía dưới ---------- */
  var ROOM = { w: 1600, h: 1000 };
  /* Tâm ngang và mép trước của 6 bàn đôi; bạn nhỏ ngồi ở bàn giữa hàng đầu */
  var DESKS = [[360, 690], [800, 690], [1240, 690], [360, 870], [800, 870], [1240, 870]];

  function chalk(x, y, text, size, color, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" class="chalk" font-size="' + size + '" fill="' + (color || '#f8f9fa') + '">' + text + '</text>';
  }
  function roomWindow(x, y, w, hh) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="-10" y="-10" width="' + (w + 20) + '" height="' + (hh + 20) + '" rx="8" fill="#fff" stroke="#e3d5b0" stroke-width="3"/>' +
      '<rect width="' + w + '" height="' + hh + '" fill="#bfe6ff"/>' +
      '<circle cx="' + (w * 0.24) + '" cy="' + (hh * 0.26) + '" r="' + (hh * 0.11) + '" fill="#fff3b0"/>' +
      '<path d="M0 ' + (hh * 0.72) + ' Q' + (w * 0.3) + ' ' + (hh * 0.5) + ' ' + (w * 0.62) + ' ' + (hh * 0.7) + ' T' + w + ' ' + (hh * 0.62) + ' V' + hh + ' H0Z" fill="#b4e3a2"/>' +
      '<rect x="' + (w * 0.75) + '" y="' + (hh * 0.5) + '" width="' + (w * 0.07) + '" height="' + (hh * 0.5) + '" fill="#9c6b4e"/>' +
      '<circle cx="' + (w * 0.78) + '" cy="' + (hh * 0.42) + '" r="' + (hh * 0.2) + '" fill="#57c27a"/><circle cx="' + (w * 0.62) + '" cy="' + (hh * 0.5) + '" r="' + (hh * 0.13) + '" fill="#6ccf8e"/>' +
      '<path d="M' + (w / 2) + ' 0 V' + hh + ' M0 ' + (hh / 2) + ' H' + w + '" stroke="#fff" stroke-width="7"/>' +
      '<rect x="-18" y="' + (hh + 8) + '" width="' + (w + 36) + '" height="12" rx="5" fill="#e9d8b4"/></g>';
  }

  /* o: {table: bảng nhân đang viết trên bảng, date: dòng "Thứ..., ngày... tháng..."} */
  function classroomScene(o) {
    o = o || {};
    var t = o.table || 2, i, s = '';
    s += '<defs>' +
      '<linearGradient id="rwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7dc"/><stop offset="1" stop-color="#ffecbd"/></linearGradient>' +
      '<linearGradient id="rboard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7557"/><stop offset="1" stop-color="#235c44"/></linearGradient>' +
      '<pattern id="rfloor" width="160" height="160" patternUnits="userSpaceOnUse"><rect width="160" height="160" fill="#f5e4c8"/><rect width="80" height="80" fill="#f0dbb9"/><rect x="80" y="80" width="80" height="80" fill="#f0dbb9"/><path d="M0 1 H160 M0 80 H160 M1 0 V160 M80 0 V160" stroke="#e6cfa8" stroke-width="2"/></pattern>' +
      '</defs>';
    // Tường vàng, chân tường sơn xanh, nền gạch
    s += '<rect width="1600" height="452" fill="url(#rwall)"/><rect y="346" width="1600" height="106" fill="#c7e6d2"/><rect y="340" width="1600" height="8" fill="#a9d3ba"/>';
    s += '<rect y="452" width="1600" height="548" fill="url(#rfloor)"/><rect y="438" width="1600" height="14" fill="#9cc5ad"/>';
    // Dây cờ trang trí hai bên, băng rôn giữa
    var flags = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#ff9f1c'];
    s += '<path d="M0 10 Q270 44 540 14 M1060 14 Q1330 44 1600 10" fill="none" stroke="#c9b68a" stroke-width="3"/>';
    for (i = 0; i < 18; i++) {
      var fx = 34 + (i % 9) * 59, fy = 11 + 16 * Math.sin(Math.PI * fx / 540);
      if (i >= 9) fx += 1060;
      s += '<path d="M' + (fx - 15) + ' ' + fy.toFixed(1) + ' h30 l-15 32z" fill="' + flags[i % flags.length] + '"/>';
    }
    s += '<rect x="560" y="14" width="480" height="48" rx="8" fill="#da251d"/><text x="800" y="47" text-anchor="middle" class="w-label" font-size="25" fill="#ffde00">Thi đua dạy tốt — học tốt</text>';
    // Cửa sổ nhìn ra sân, nắng chiếu xuống nền, chú chim đậu bậu cửa
    s += roomWindow(64, 150, 136, 180) + roomWindow(236, 150, 136, 180);
    s += '<path d="M70 452 L196 452 L330 650 L170 650Z M242 452 L368 452 L530 650 L370 650Z" fill="#fff" opacity=".3"/>';
    s += bird(322, 338, '#ffb703');
    // Bảng xanh
    s += '<g data-hit="zone" data-id="cls-board" class="room-board">' +
      '<rect x="406" y="118" width="788" height="264" rx="10" fill="#a0673b"/><rect x="418" y="130" width="764" height="240" rx="4" fill="url(#rboard)"/>' +
      '<ellipse cx="560" cy="325" rx="90" ry="24" fill="#fff" opacity=".05"/><ellipse cx="1050" cy="215" rx="80" ry="30" fill="#fff" opacity=".04"/>' +
      chalk(436, 162, o.date || '', 19, '#f8f9fa', 'start') +
      chalk(800, 166, 'Toán', 28) + '<path d="M762 175 Q800 180 838 174" fill="none" stroke="#f8f9fa" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
      chalk(800, 213, 'Bảng nhân ' + t, 36, '#ffe08a');
    for (i = 1; i <= 10; i++) {
      s += chalk(i <= 5 ? 640 : 960, 247 + ((i - 1) % 5) * 25, t + ' × ' + i + ' = ' + (t * i), 22, i % 2 ? '#f8f9fa' : '#d8f3dc');
    }
    s += '<g fill="none" stroke="#ffe08a" stroke-width="3" stroke-linecap="round" opacity=".9"><circle cx="1128" cy="170" r="15"/><path d="M1128 146 V140 M1128 194 V200 M1104 170 H1098 M1152 170 H1158 M1111 153 L1107 149 M1145 153 L1149 149 M1111 187 L1107 191 M1145 187 L1149 191"/></g>' +
      '<path d="M468 318 l5 12 13 2 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -2z" fill="none" stroke="#ffc2d1" stroke-width="3" stroke-linejoin="round" opacity=".9"/>' +
      '<rect x="406" y="376" width="788" height="14" rx="5" fill="#8d5a33"/>' +
      '<rect x="470" y="369" width="26" height="8" rx="3" fill="#fff"/><rect x="504" y="369" width="22" height="8" rx="3" fill="#ffe08a"/><rect x="534" y="369" width="20" height="8" rx="3" fill="#ffadad"/>' +
      '<rect x="1076" y="362" width="56" height="15" rx="3" fill="#6d597a"/><rect x="1076" y="372" width="56" height="5" rx="2" fill="#e9ecef"/></g>';
    // Đồng hồ và bảng cửu chương treo tường
    s += '<circle cx="1272" cy="98" r="34" fill="#fff" stroke="#3b2f63" stroke-width="5"/><path d="M1272 98 V76 M1272 98 L1288 106" stroke="#3b2f63" stroke-width="5" stroke-linecap="round"/><circle cx="1272" cy="98" r="4" fill="#e63946"/>';
    s += '<g transform="translate(1210 166)"><rect width="126" height="156" rx="8" fill="#fff" stroke="#e3d5b0" stroke-width="3"/><rect x="8" y="8" width="110" height="28" rx="7" fill="#7b61ff"/>' +
      '<text x="63" y="28" text-anchor="middle" class="w-label" font-size="15" fill="#fff">Cửu chương</text>';
    for (i = 0; i < 8; i++) {
      var px = 10 + (i % 4) * 27, py = 46 + Math.floor(i / 4) * 30;
      s += '<rect x="' + px + '" y="' + py + '" width="24" height="24" rx="6" fill="' + flags[i % flags.length] + '" opacity=".85"/><text x="' + (px + 12) + '" y="' + (py + 18) + '" text-anchor="middle" class="w-label" font-size="16" fill="#fff">' + (i + 2) + '</text>';
    }
    s += '<path d="M63 112 l4.5 10 11 1.4 -8 7.6 2 11 -9.5 -5.4 -9.5 5.4 2 -11 -8 -7.6 11 -1.4z" fill="#ffd166" stroke="#f4a261" stroke-width="1.5"/></g>';
    // Cửa ra sân (đang mở)
    s += '<g data-hit="zone" data-id="cls-door">' +
      '<rect x="1374" y="140" width="152" height="312" rx="8" fill="#8d6e63"/><rect x="1386" y="152" width="128" height="300" fill="#bfe6ff"/>' +
      '<path d="M1386 352 Q1450 322 1514 344 V452 H1386Z" fill="#b4e3a2"/><rect x="1386" y="418" width="128" height="34" fill="#f6e7c8"/>' +
      '<rect x="1414" y="330" width="10" height="56" fill="#9c6b4e"/><circle cx="1419" cy="312" r="30" fill="#57c27a"/><circle cx="1440" cy="328" r="18" fill="#6ccf8e"/>' +
      '<path d="M1514 152 L1558 172 L1558 474 L1514 452 Z" fill="#c68b59" stroke="#a0673b" stroke-width="3"/><path d="M1524 180 L1548 190 V300 L1524 292Z" fill="#b77a4a"/><circle cx="1526" cy="330" r="5" fill="#ffd166"/></g>';
    // Bục giảng và chậu cây
    s += '<rect x="380" y="452" width="840" height="50" rx="6" fill="#e2c193"/><rect x="380" y="494" width="840" height="14" rx="5" fill="#c9a26f"/>';
    s += '<g transform="translate(38 486)"><ellipse cx="0" cy="-66" rx="30" ry="36" fill="#57c27a"/><ellipse cx="-14" cy="-84" rx="16" ry="20" fill="#6ccf8e"/><ellipse cx="14" cy="-50" rx="14" ry="18" fill="#4fb36e"/><path d="M-22 -36 L22 -36 L16 0 L-16 0Z" fill="#e07a3f"/><rect x="-25" y="-40" width="50" height="9" rx="4" fill="#c8553d"/></g>';
    return s;
  }

  function roomDesk(cx, dy, mine) {
    var book = '<rect x="-20" y="-10" width="40" height="20" rx="2" fill="#fff" stroke="#cfd8e3" stroke-width="1.5"/><path d="M-14 -3 H14 M-14 3 H8" stroke="#a8c4e0" stroke-width="1.5"/>';
    return '<g transform="translate(' + cx + ' ' + dy + ')">' +
      '<rect x="-98" y="-40" width="10" height="40" fill="#b98556"/><rect x="88" y="-40" width="10" height="40" fill="#b98556"/>' +
      '<rect x="-100" y="-42" width="200" height="18" rx="3" fill="#8a5a33"/>' +
      '<rect x="-106" y="-72" width="212" height="34" rx="7" fill="#e3b887" stroke="#c99b66" stroke-width="2"/>' +
      (mine ? '<rect x="-104" y="-70" width="104" height="30" rx="6" fill="#ff8fab" opacity=".3"/>' : '') +
      '<rect x="-100" y="-68" width="200" height="7" rx="3.5" fill="#fff" opacity=".28"/>' +
      '<g transform="translate(-52 -54) rotate(-6)">' + book + '</g><g transform="translate(52 -54) rotate(5)">' + book + '</g>' +
      '<rect x="-12" y="-58" width="26" height="5" rx="2.5" fill="#ffd166" transform="rotate(24 0 -56)"/></g>';
  }
  function roomBench(cx, dy) {
    return '<g transform="translate(' + cx + ' ' + dy + ')"><rect x="-88" y="46" width="9" height="18" fill="#a9774b"/><rect x="79" y="46" width="9" height="18" fill="#a9774b"/>' +
      '<rect x="-94" y="34" width="188" height="15" rx="6" fill="#d6a877" stroke="#bd8f5f" stroke-width="2"/></g>';
  }
  function teacherDesk(cx, y) {
    return '<g transform="translate(' + cx + ' ' + y + ')"><rect x="-104" y="-52" width="208" height="52" rx="6" fill="#b98556"/><rect x="-94" y="-42" width="188" height="34" rx="4" fill="#a9774b"/>' +
      '<rect x="-112" y="-84" width="224" height="36" rx="8" fill="#d6a877" stroke="#bd8f5f" stroke-width="2"/>' +
      '<g transform="translate(-68 -78)"><path d="M0 -22 V-46 M-3 -22 L-13 -40 M3 -22 L13 -40" stroke="#4caf50" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-50" r="9" fill="#ff8fab"/><circle cx="-15" cy="-43" r="8" fill="#ffd166"/><circle cx="15" cy="-43" r="8" fill="#f15bb5"/><circle cx="0" cy="-50" r="3.5" fill="#ffd166"/><path d="M-11 0 L11 0 L8 -26 L-8 -26Z" fill="#7cc6fe"/></g>' +
      '<rect x="4" y="-92" width="62" height="11" rx="2" fill="#118ab2"/><rect x="8" y="-102" width="56" height="10" rx="2" fill="#ef476f"/><rect x="12" y="-111" width="48" height="9" rx="2" fill="#ffd166"/>' +
      '<g transform="translate(74 -106) scale(1.15)">' + OBJ.apple + '</g></g>';
  }
  /* Bàn ghế trong lớp, xếp theo chiều sâu cùng nhân vật */
  function classroomProps() {
    var list = [{ y: 568, s: teacherDesk(240, 568) }];
    DESKS.forEach(function (d, i) {
      list.push({ y: d[1], s: roomDesk(d[0], d[1], i === 1) });
      list.push({ y: d[1] + 63, s: roomBench(d[0], d[1]) });
    });
    return list;
  }

  TT.art = {
    girlBack: girlBack, kidSeat: kidSeat, bird: bird, yardProps: yardProps,
    classroomScene: classroomScene, classroomProps: classroomProps, ROOM: ROOM, DESKS: DESKS,
    svg: svg, girl: girl, kid: kid, adult: adult, pet: pet, PET_NAMES: PET_NAMES, PET_ACC: PET_ACC,
    obj: obj, OBJ: OBJ, CONTEXTS: CONTEXTS, DECOR: DECOR, decor: decor, icon: icon, ICON: ICON,
    schoolScene: schoolScene, WORLD: WORLD, tree: tree, bush: bush, flowerBed: flowerBed,
    girlSVG: function (o, cls) { return svg('0 0 120 200', girl(o), cls || 'char'); },
    kidSVG: function (n, i, cls) { return svg('0 0 120 200', kid(n, i), cls || 'char'); },
    adultSVG: function (k, cls) { return svg('0 0 120 220', adult(k), cls || 'char'); },
    petSVG: function (k, a, cls) { return svg('0 0 100 100', pet(k, a), cls || 'pet'); }
  };
})(window);
