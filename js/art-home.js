/* art-home.js: cảnh "Nhà em" ở làng quê (thế giới 3200×1300).
 * Từ trái sang phải: bờ sông và bến nước, ao cá, vườn rau và cây ăn quả, nhà chính với gian bếp, chuồng trại, cổng ra đường.
 * Cùng cách vẽ với art.js: nền là một SVG; vật cao (cây, giếng, cây rơm, gà vịt…) trả về riêng để world.js xếp theo chiều sâu. */
(function (root) {
  'use strict';
  var TT = root.TT, A = TT.art;
  var HOME = { w: 3200, h: 1300 };

  /* Một vật chạm vào được (xem POKES trong world.js) */
  function pk(id, x, y, inner, extra) {
    return '<g data-hit="poke" data-id="' + id + '" transform="translate(' + x + ' ' + y + ')' + (extra || '') + '">' + inner + '</g>';
  }

  /* ---------- Gia cầm, gia súc, chó mèo: gốc toạ độ ở chân con vật ---------- */
  function hen(c, c2, rooster) {
    return '<g class="hm-peck"><rect x="-34" y="-68" width="76" height="74" fill="transparent"/><ellipse cx="0" cy="4" rx="22" ry="5" fill="#000" opacity=".1"/>' +
      '<path d="M-6 2 V-10 M7 2 V-10" stroke="#f4a261" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-16 -30 Q-40 -' + (rooster ? 62 : 48) + ' -24 -' + (rooster ? 66 : 50) + ' Q-16 -44 -6 -36Z" fill="' + c2 + '"/>' +
      '<ellipse cx="0" cy="-24" rx="21" ry="16" fill="' + c + '"/><path d="M-10 -26 Q0 -14 12 -24" fill="none" stroke="' + c2 + '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="18" cy="-42" r="10" fill="' + c + '"/><path d="M12 -51 q3 -' + (rooster ? 12 : 7) + ' 6 -1 q3 -' + (rooster ? 11 : 6) + ' 6 1 Z" fill="#e63946"/>' +
      '<path d="M27 -43 l10 3 -10 4Z" fill="#ff9f1c"/><circle cx="21" cy="-44" r="2" fill="#2b2140"/><path d="M24 -35 q4 6 -1 9 q-3 -4 1 -9Z" fill="#e63946"/></g>';
  }
  function chick() {
    return '<g class="hm-hop"><rect x="-14" y="-26" width="34" height="30" fill="transparent"/><ellipse cx="0" cy="2" rx="9" ry="3" fill="#000" opacity=".1"/><circle cx="0" cy="-8" r="8" fill="#ffe066"/>' +
      '<circle cx="7" cy="-15" r="5.5" fill="#ffe066"/><path d="M12 -15 l5 2 -5 2Z" fill="#ff9f1c"/><circle cx="8.5" cy="-16" r="1.2" fill="#2b2140"/></g>';
  }
  function duck(swim) {
    return '<g class="' + (swim ? 'hm-swim' : 'hm-bob') + '"><rect x="-32" y="-52" width="70" height="58" fill="transparent"/>' +
      (swim ? '<ellipse cx="0" cy="0" rx="32" ry="6" fill="#fff" opacity=".5"/>'
        : '<ellipse cx="0" cy="4" rx="20" ry="4" fill="#000" opacity=".1"/><path d="M-4 2 V-6 M6 2 V-6" stroke="#ff9f1c" stroke-width="3.4" stroke-linecap="round"/>') +
      '<path d="M-22 -14 Q-32 -28 -16 -24Z" fill="#f1f3f5"/><ellipse cx="-2" cy="-14" rx="21" ry="12" fill="#fff" stroke="#dee2e6" stroke-width="2"/>' +
      '<path d="M12 -18 Q16 -32 14 -38" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="15" cy="-40" r="8.5" fill="#fff" stroke="#dee2e6" stroke-width="1.5"/>' +
      '<path d="M22 -43 h12 q2 3 -2 5 h-10Z" fill="#ff9f1c"/><circle cx="17" cy="-42" r="1.8" fill="#2b2140"/></g>';
  }
  function pig() {
    return '<rect x="-48" y="-62" width="106" height="68" fill="transparent"/><ellipse cx="0" cy="4" rx="38" ry="6" fill="#000" opacity=".1"/>' +
      '<rect x="-26" y="-12" width="9" height="16" rx="4" fill="#f4978e"/><rect x="14" y="-12" width="9" height="16" rx="4" fill="#f4978e"/>' +
      '<path d="M-36 -28 q-12 -4 -8 -12 q6 2 4 8" fill="none" stroke="#f4978e" stroke-width="3.4" stroke-linecap="round"/>' +
      '<ellipse cx="-2" cy="-26" rx="34" ry="21" fill="#ffb3c1"/><circle cx="30" cy="-32" r="17" fill="#ffc2cd"/>' +
      '<path d="M20 -46 l2 -12 9 8Z M36 -47 l6 -10 4 12Z" fill="#f4978e"/><ellipse cx="42" cy="-28" rx="9" ry="7" fill="#ff8fa3"/>' +
      '<circle cx="39.5" cy="-28" r="1.6" fill="#b5536a"/><circle cx="44.5" cy="-28" r="1.6" fill="#b5536a"/><circle cx="29" cy="-36" r="2" fill="#2b2140"/>';
  }
  function cow() {
    return '<rect x="-66" y="-98" width="154" height="106" fill="transparent"/><ellipse cx="0" cy="6" rx="62" ry="8" fill="#000" opacity=".12"/>' +
      '<rect x="-44" y="-24" width="12" height="30" rx="5" fill="#b9793f"/><rect x="26" y="-24" width="12" height="30" rx="5" fill="#b9793f"/>' +
      '<ellipse cx="-4" cy="-34" rx="52" ry="26" fill="#d9a066"/><path d="M-30 -54 q14 -6 26 2 q-4 14 -18 12 q-10 -2 -8 -14Z" fill="#fff3e0"/>' +
      '<path d="M-54 -40 q-14 6 -10 26" stroke="#b9793f" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="-46" rx="22" ry="18" fill="#e0ad78"/>' +
      '<path d="M40 -60 Q34 -72 42 -78 M62 -60 Q72 -70 66 -78" stroke="#e9e4d8" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="57" cy="-48" r="3" fill="#2b2140"/><ellipse cx="66" cy="-38" rx="8" ry="6" fill="#f6d5b0"/>';
  }
  function dog() {
    return '<rect x="-40" y="-72" width="90" height="80" fill="transparent"/><ellipse cx="0" cy="4" rx="30" ry="5" fill="#000" opacity=".1"/>' +
      '<path class="hm-wag" d="M-22 -14 Q-40 -22 -34 -42" fill="none" stroke="#e0a458" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-24 2 Q-28 -34 -4 -38 Q14 -38 14 2 Z" fill="#e9b872"/><rect x="4" y="-20" width="9" height="22" rx="4" fill="#e0a458"/>' +
      '<circle cx="12" cy="-48" r="17" fill="#e9b872"/><path d="M0 -58 q-10 2 -8 20 q8 -2 10 -12Z" fill="#b97a3a"/><ellipse cx="25" cy="-42" rx="11" ry="8" fill="#f6dcb4"/>' +
      '<circle cx="34" cy="-45" r="3" fill="#2b2140"/><circle cx="16" cy="-52" r="2.4" fill="#2b2140"/><path d="M24 -37 q4 4 8 0" fill="none" stroke="#2b2140" stroke-width="1.6" stroke-linecap="round"/>';
  }
  function cat() {
    return '<rect x="-34" y="-36" width="66" height="42" fill="transparent"/><ellipse cx="0" cy="-8" rx="24" ry="12" fill="#adb5bd"/><circle cx="16" cy="-14" r="10" fill="#adb5bd"/>' +
      '<path d="M9 -21 l2 -9 6 6Z M19 -23 l5 -8 2 10Z" fill="#adb5bd"/><path d="M12 -13 q2 2 4 0 M19 -13 q2 2 4 0" stroke="#495057" stroke-width="1.4" fill="none"/>' +
      '<path d="M-22 -4 Q-34 -6 -28 -18" fill="none" stroke="#adb5bd" stroke-width="6" stroke-linecap="round"/>';
  }

  /* ---------- Cây cối và đồ vật trong sân vườn ---------- */
  function banana(x, y) {
    return '<g class="tree" transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="4" rx="40" ry="8" fill="#000" opacity=".1"/><path d="M-7 0 Q-4 -60 0 -110 Q6 -60 9 0Z" fill="#8fbf6a"/>' +
      '<g class="crown"><path d="M0 -108 Q-50 -150 -92 -112 Q-50 -122 0 -108Z" fill="#57c27a"/><path d="M0 -108 Q50 -152 96 -116 Q50 -124 0 -108Z" fill="#57c27a"/>' +
      '<path d="M0 -108 Q-30 -176 -66 -178 Q-28 -150 0 -108Z" fill="#6ccf8e"/><path d="M0 -108 Q30 -180 70 -176 Q30 -150 0 -108Z" fill="#6ccf8e"/><path d="M0 -108 Q-4 -170 4 -196 Q10 -160 0 -108Z" fill="#4fb36e"/></g>' +
      '<g fill="#ffd60a" stroke="#e0a800" stroke-width="1.5"><path d="M6 -98 q14 6 12 24 q-8 -6 -12 -24Z"/><path d="M12 -98 q18 4 20 22 q-12 -4 -20 -22Z"/><path d="M2 -96 q6 12 0 26 q-6 -12 0 -26Z"/></g></g>';
  }
  function well(x, y) {
    return pk('gieng', x, y, '<ellipse cx="0" cy="4" rx="62" ry="10" fill="#000" opacity=".1"/><rect x="-50" y="-52" width="100" height="52" fill="#b0a394"/>' +
      '<path d="M-50 -34 H50 M-50 -16 H50 M-25 -52 V-34 M20 -52 V-34 M-5 -34 V-16 M32 -34 V-16 M-30 -16 V0 M10 -16 V0" stroke="#8c7f70" stroke-width="2"/>' +
      '<ellipse cx="0" cy="0" rx="50" ry="9" fill="#b0a394"/><ellipse cx="0" cy="-52" rx="50" ry="11" fill="#c9bdae"/><ellipse cx="0" cy="-55" rx="44" ry="9" fill="#9c6b4e"/><path d="M-30 -57 H30 M-38 -53 H38" stroke="#7f5539" stroke-width="2"/>' +
      '<path d="M-58 0 V-120 H58 V0" fill="none" stroke="#8d6e63" stroke-width="8" stroke-linecap="round"/><path d="M-70 -118 L0 -152 L70 -118Z" fill="#c8553d"/>' +
      '<path d="M0 -118 V-86" stroke="#8d6e63" stroke-width="3"/><path d="M-11 -86 H11 L8 -66 H-8Z" fill="#adb5bd"/>');
  }
  function hay(x, y) {
    return pk('rom', x, y, '<ellipse cx="0" cy="6" rx="78" ry="12" fill="#000" opacity=".1"/><path d="M0 -176 V-120" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-70 0 Q-80 -70 -40 -116 Q0 -150 40 -116 Q80 -70 70 0Z" fill="#f2cc60"/>' +
      '<path d="M-50 -20 q10 -40 30 -70 M-10 -10 q4 -50 10 -100 M30 -14 q4 -40 -6 -80 M54 -20 q0 -30 -14 -60" fill="none" stroke="#d9a93a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-70 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q6 6 12 0" fill="none" stroke="#d9a93a" stroke-width="3"/>');
  }
  function jar(x, y) {
    return pk('chum', x, y, '<ellipse cx="0" cy="4" rx="34" ry="7" fill="#000" opacity=".1"/><path d="M-22 0 Q-40 -34 -22 -62 H22 Q40 -34 22 0Z" fill="#9c6644"/>' +
      '<path d="M-28 -30 Q0 -22 28 -30" fill="none" stroke="#7f5539" stroke-width="3"/><ellipse cx="0" cy="-63" rx="27" ry="7" fill="#c68b59"/><ellipse cx="0" cy="-67" rx="10" ry="4" fill="#7f5539"/>');
  }
  /* Biển cảnh báo viền đỏ: hai dòng chữ */
  function dangerSign(id, x, y, l1, l2) {
    return pk(id, x, y, '<rect x="-4" y="-70" width="8" height="70" fill="#8d6e63"/><rect x="-68" y="-130" width="136" height="64" rx="8" fill="#fff" stroke="#e63946" stroke-width="7"/>' +
      '<text y="-104" text-anchor="middle" class="w-label" font-size="17" fill="#c1121f">' + l1 + '</text><text y="-82" text-anchor="middle" class="w-label" font-size="17" fill="#c1121f">' + l2 + '</text>');
  }
  /* Cọc treo phao cứu sinh và áo phao ở bến nước */
  function buoy(x, y) {
    return pk('phao', x, y, '<rect x="-4" y="-116" width="8" height="116" fill="#8d6e63"/><circle cx="0" cy="-84" r="23" fill="none" stroke="#fff" stroke-width="14"/>' +
      '<circle cx="0" cy="-84" r="23" fill="none" stroke="#e63946" stroke-width="14" stroke-dasharray="18 18.1"/>' +
      '<path d="M-24 -40 h18 v30 h-18Z M6 -40 h18 v30 h-18Z" fill="#ff9f1c"/><path d="M-24 -26 h48" stroke="#fff" stroke-width="3"/>');
  }

  /* ---------- Nền của cảnh ---------- */
  function homeScene() {
    var i, j, s = '<defs>' +
      '<linearGradient id="hmsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient>' +
      '<linearGradient id="hmsong" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4fb8e0"/><stop offset="1" stop-color="#8fdcf5"/></linearGradient>' +
      '<pattern id="hmlua" width="26" height="22" patternUnits="userSpaceOnUse"><rect width="26" height="22" fill="#b6e07a"/><path d="M5 20 q2 -9 0 -14 M13 20 q3 -10 0 -16 M21 20 q2 -9 0 -14" stroke="#8fc95a" stroke-width="2.4" fill="none" stroke-linecap="round"/></pattern>' +
      '<pattern id="hmgach" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#e9b99a"/><path d="M0 0 H60 M0 30 H60 M30 0 V30 M0 30 V60" stroke="#d79f7d" stroke-width="2.5"/></pattern>' +
      '</defs>';
    // Trời, mặt trời, mây, núi xa
    s += '<rect width="3200" height="560" fill="url(#hmsky)"/><circle cx="560" cy="120" r="58" fill="#fff3b0"/><circle cx="560" cy="120" r="42" fill="#ffe066"/>';
    s += '<g class="cloud c1"><ellipse cx="980" cy="96" rx="86" ry="28" fill="#fff"/><ellipse cx="1030" cy="76" rx="52" ry="32" fill="#fff"/></g><g class="cloud c2"><ellipse cx="1900" cy="70" rx="96" ry="28" fill="#fff"/><ellipse cx="1850" cy="54" rx="52" ry="30" fill="#fff"/></g><g class="cloud c3"><ellipse cx="2700" cy="140" rx="74" ry="24" fill="#fff"/></g>';
    s += '<g data-hit="poke" data-id="nui"><path d="M0 440 L170 260 L300 370 L480 190 L680 400 L860 250 L1040 410 L1230 215 L1450 400 L1640 255 L1880 410 L2090 270 L2300 415 L2520 235 L2760 410 L2960 280 L3200 420 V540 H0Z" fill="#b3c1ee"/>' +
      '<path d="M480 190 L520 242 L495 234 L478 256 L458 232 L442 244 Z M1230 215 L1270 266 L1244 260 L1228 280 L1210 256 L1194 266 Z M2520 235 L2560 288 L2536 280 L2520 300 L2502 278 L2486 290 Z" fill="#fff" opacity=".85"/>' +
      '<path d="M0 480 Q260 350 520 462 Q780 360 1080 462 Q1360 365 1660 466 Q1950 370 2240 462 Q2560 365 2860 458 Q3040 410 3200 452 V560 H0Z" fill="#9bd7a6"/>' +
      '<path d="M0 512 Q380 430 760 502 Q1140 424 1520 504 Q1900 432 2280 500 Q2700 436 3200 498 V580 H0Z" fill="#83cd92"/></g>';
    for (i = 0; i < 16; i++) s += A.tree(70 + i * 205, 524, 30 + (i % 3) * 5, 'bg');
    // Cánh đồng phía xa: lúa, cò, bù nhìn, luỹ tre bên sông
    s += '<rect y="518" width="3200" height="130" fill="#b6e07a"/>';
    s += '<g data-hit="poke" data-id="lua"><path d="M330 530 H1800 V642 H330Z" fill="url(#hmlua)"/><path d="M330 586 H1800 M620 530 L600 642 M930 530 L950 642 M1240 530 L1230 642 M1530 530 L1560 642" stroke="#8cbf5a" stroke-width="5" fill="none"/></g>';
    s += '<g data-hit="poke" data-id="cotrang"><g transform="translate(760 580)"><path d="M0 0 V-18" stroke="#f4a261" stroke-width="3"/><ellipse cx="0" cy="-26" rx="15" ry="9" fill="#fff"/><path d="M10 -30 Q20 -46 16 -52" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M16 -54 l14 3" stroke="#f4a261" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g transform="translate(1420 572) scale(-.9 .9)"><path d="M0 0 V-18" stroke="#f4a261" stroke-width="3"/><ellipse cx="0" cy="-26" rx="15" ry="9" fill="#fff"/><path d="M10 -30 Q20 -46 16 -52" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M16 -54 l14 3" stroke="#f4a261" stroke-width="3" stroke-linecap="round"/></g></g>';
    s += '<g data-hit="poke" data-id="bunhin" transform="translate(1090 624)"><path d="M0 0 V-74 M-30 -52 H30" stroke="#8d6e63" stroke-width="6" stroke-linecap="round"/><path d="M-26 -56 H26 L18 -20 H-18 Z" fill="#e76f51"/><circle cx="0" cy="-70" r="12" fill="#ffe8a3"/><path d="M-20 -78 L0 -98 L20 -78 Z" fill="#f2e2b0" stroke="#d9c38a" stroke-width="2"/></g>';
    // Mặt đất, lối đi
    s += '<rect y="640" width="3200" height="660" fill="#bfe8a0"/>';
    s += '<g fill="#cdeeb0"><ellipse cx="640" cy="1180" rx="170" ry="36"/><ellipse cx="1420" cy="1230" rx="210" ry="34"/><ellipse cx="2300" cy="1160" rx="230" ry="40"/><ellipse cx="2760" cy="1200" rx="190" ry="34"/><ellipse cx="1150" cy="720" rx="90" ry="26"/></g>';
    s += '<path d="M3200 1015 Q2850 1030 2560 970 Q2300 905 2000 930 Q1700 960 1420 1090 Q1150 1180 800 1150 Q560 1120 470 990" fill="none" stroke="#f0dfbd" stroke-width="76" stroke-linecap="round"/>';
    // Con sông bên trái: bờ cát, sóng, bến nước, thuyền
    s += '<g data-hit="poke" data-id="song"><path d="M130 518 Q250 610 290 760 Q340 1000 362 1300 H0 V518Z" fill="url(#hmsong)"/>' +
      '<path d="M130 518 Q250 610 290 760 Q340 1000 362 1300" fill="none" stroke="#f3e2c0" stroke-width="22" stroke-linecap="round"/>' +
      '<g class="hm-wave" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"><path d="M90 596 q10 -6 20 0 t20 0"/><path d="M40 700 q14 -8 28 0 t28 0"/><path d="M130 840 q14 -8 28 0 t28 0"/><path d="M40 930 q14 -8 28 0 t28 0"/><path d="M190 1140 q14 -8 28 0 t28 0"/><path d="M60 1230 q14 -8 28 0 t28 0"/></g></g>';
    s += '<g data-hit="poke" data-id="tre" transform="translate(330 30)" fill="none" stroke="#4fb36e" stroke-width="8" stroke-linecap="round"><path d="M40 622 Q30 540 52 470 M70 622 Q72 548 60 480 M100 622 Q110 556 96 496"/><path d="M52 470 q22 -6 34 8 M60 480 q-24 -4 -34 12 M96 496 q22 -8 36 6 M46 520 q-22 0 -30 16 M70 548 q24 -4 34 12" stroke-width="6" stroke="#6ccf8e"/></g>';
    s += '<g data-hit="poke" data-id="bennuoc"><rect x="244" y="972" width="9" height="30" fill="#7f5539"/><rect x="300" y="972" width="9" height="30" fill="#7f5539"/><rect x="236" y="950" width="214" height="24" rx="4" fill="#c68b59"/>' +
      '<path d="M270 950 V974 M304 950 V974 M338 950 V974 M372 950 V974 M406 950 V974" stroke="#a47148" stroke-width="3"/></g>';
    s += pk('thuyen', 130, 1040, '<path d="M30 -30 L112 -74" stroke="#adb5bd" stroke-width="3"/><path d="M-84 -24 Q0 14 100 -24 L80 8 Q0 28 -64 8Z" fill="#8d5a3b"/><path d="M-84 -24 Q0 -8 100 -24" stroke="#6b4226" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M-36 -18 L34 -56" stroke="#c9a27a" stroke-width="6" stroke-linecap="round"/><path d="M-50 -10 q-8 -10 -18 -4 l6 10Z" fill="#c9a27a"/>');
    // Ao cá: sen, cá quẫy, vịt bơi, cầu ao
    s += '<g data-hit="poke" data-id="ao"><ellipse cx="900" cy="934" rx="264" ry="132" fill="#d9c9a3"/><ellipse cx="900" cy="930" rx="250" ry="120" fill="#7fd0ee"/><ellipse cx="880" cy="914" rx="200" ry="84" fill="#a5e3f7" opacity=".6"/>' +
      '<g fill="#57c27a"><ellipse cx="740" cy="950" rx="30" ry="11"/><ellipse cx="790" cy="985" rx="24" ry="9"/><ellipse cx="1040" cy="890" rx="28" ry="10"/><ellipse cx="1075" cy="925" rx="22" ry="8"/><ellipse cx="960" cy="1010" rx="24" ry="9"/></g>' +
      '<path d="M740 948 q-9 -18 0 -25 q9 7 0 25 M1040 888 q-8 -16 0 -23 q8 7 0 23" fill="#ff8fab"/>' +
      '<rect x="868" y="1036" width="64" height="30" rx="4" fill="#c68b59"/><path d="M868 1046 H932 M868 1056 H932" stroke="#a47148" stroke-width="2.5"/></g>';
    s += '<g class="hm-fish" transform="translate(985 950)"><path d="M-16 0 Q0 -14 16 0 Q0 12 -16 0Z M-16 0 l-12 -9 v18Z" fill="#ff9f1c"/><circle cx="8" cy="-2" r="2" fill="#2b2140"/></g>';
    s += pk('vit', 810, 905, duck(true)) + pk('vit', 905, 965, duck(true), ' scale(-1 1)');
    // Vườn rau: ba luống
    s += '<g data-hit="poke" data-id="rau">';
    for (i = 0; i < 3; i++) {
      var by = 690 + i * 48;
      s += '<rect x="1270" y="' + by + '" width="432" height="38" rx="15" fill="#a47148"/>';
      for (j = 0; j < 12; j++) {
        var bx = 1294 + j * 35;
        if (i === 1) s += '<path d="M' + bx + ' ' + (by + 22) + ' q-9 -20 -2 -24 M' + bx + ' ' + (by + 22) + ' q0 -24 3 -28 M' + bx + ' ' + (by + 22) + ' q9 -18 6 -24" stroke="#4fb36e" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="' + bx + '" cy="' + (by + 23) + '" rx="6" ry="4.5" fill="#ff8c42"/>';
        else s += '<circle cx="' + bx + '" cy="' + (by + 15) + '" r="13" fill="' + (i ? '#8ee0a6' : '#57c27a') + '"/><circle cx="' + (bx - 2) + '" cy="' + (by + 13) + '" r="6" fill="' + (i ? '#b8f2c9' : '#7fd99b') + '"/>';
      }
    }
    s += '</g>';
    // Sân gạch, thóc phơi
    s += '<rect x="1810" y="640" width="770" height="258" rx="10" fill="url(#hmgach)"/><rect x="1810" y="640" width="770" height="258" rx="10" fill="none" stroke="#c98f6d" stroke-width="5"/>';
    s += '<g data-hit="poke" data-id="thoc"><rect x="2040" y="716" width="210" height="76" rx="14" fill="#f2cc60"/><path d="M2060 736 h170 M2060 754 h170 M2060 772 h170" stroke="#e0b445" stroke-width="5" stroke-dasharray="4 9" stroke-linecap="round"/>' +
      '<path d="M2262 700 L2236 786" stroke="#8d6e63" stroke-width="5" stroke-linecap="round"/><path d="M2222 782 h30" stroke="#8d6e63" stroke-width="8" stroke-linecap="round"/></g>';
    // Nhà chính: mái ngói, hiên, cửa, cửa sổ, cầu dao điện
    s += '<g data-hit="poke" data-id="nhaminh"><path d="M1806 452 L1872 346 H2308 L2374 452 Z" fill="#e76f51"/><path d="M1840 398 H2340 M1856 372 H2324 M1824 424 H2356" stroke="#c8553d" stroke-width="4"/><rect x="1868" y="338" width="444" height="12" rx="5" fill="#c8553d"/>' +
      '<rect x="1840" y="450" width="500" height="190" fill="#ffe5ec"/><rect x="1816" y="496" width="548" height="16" rx="5" fill="#c8553d"/>' +
      '<rect x="2048" y="524" width="84" height="116" rx="6" fill="#9c6644"/><path d="M2090 524 V640" stroke="#7f5539" stroke-width="3"/><circle cx="2082" cy="584" r="3.5" fill="#ffd166"/><circle cx="2098" cy="584" r="3.5" fill="#ffd166"/>' +
      A.windowRow(1890, 540, 1, 0, 96, 66, '#dff3ff') + A.windowRow(2194, 540, 1, 0, 96, 66, '#dff3ff') +
      '<g fill="#fff3e0" stroke="#e9d8c0" stroke-width="2"><rect x="1846" y="512" width="16" height="128"/><rect x="2010" y="512" width="16" height="128"/><rect x="2154" y="512" width="16" height="128"/><rect x="2318" y="512" width="16" height="128"/></g>' +
      '<rect x="1828" y="638" width="524" height="12" rx="3" fill="#d9cbb0"/></g>';
    s += '<g data-hit="poke" data-id="odien" transform="translate(2010 468)"><rect x="-17" y="-18" width="34" height="38" rx="5" fill="#ced4da" stroke="#868e96" stroke-width="2.5"/><path d="M3 -12 L-6 2 H1 L-3 14 L7 -2 H0 Z" fill="#ffb703"/></g>';
    s += pk('meo', 2262, 652, cat());
    // Gian bếp: mái thấp, ống khói, bếp đang đỏ lửa, bình chữa cháy treo ngoài cửa
    s += '<g class="hm-smoke" fill="#dee2e6"><circle cx="2513" cy="380" r="13"/><circle cx="2526" cy="352" r="16" opacity=".8"/><circle cx="2516" cy="318" r="19" opacity=".55"/></g>';
    s += '<g data-hit="poke" data-id="bep"><rect x="2500" y="396" width="26" height="70" fill="#b08968"/><rect x="2494" y="390" width="38" height="12" rx="3" fill="#8d6e63"/>' +
      '<path d="M2362 508 L2402 440 H2540 L2580 508 Z" fill="#b5651d"/><rect x="2380" y="506" width="184" height="134" fill="#fff3c4"/>' +
      '<rect x="2416" y="534" width="72" height="106" rx="6" fill="#5c4033"/><rect x="2428" y="596" width="48" height="44" rx="4" fill="#868e96"/><rect x="2424" y="590" width="56" height="9" rx="3" fill="#495057"/>' +
      '<path class="hm-flame" d="M2452 588 q-12 -12 -4 -22 q2 8 6 4 q-2 -10 6 -16 q-2 12 8 18 q4 10 -4 16Z" fill="#ff9f1c"/><ellipse cx="2452" cy="572" rx="17" ry="6" fill="#343a40"/><rect x="2437" y="556" width="30" height="16" rx="3" fill="#495057"/></g>';
    s += '<g data-hit="poke" data-id="binhcc" transform="translate(2528 596)"><rect x="-17" y="-52" width="34" height="76" fill="transparent"/><rect x="-10" y="-30" width="20" height="50" rx="7" fill="#e63946"/><rect x="-5" y="-40" width="10" height="12" rx="2" fill="#495057"/><path d="M5 -36 q14 0 12 16" fill="none" stroke="#2b2f3a" stroke-width="3.4" stroke-linecap="round"/><rect x="-10" y="-14" width="20" height="12" fill="#fff"/></g>';
    // Chuồng gà (lưới), chuồng lợn
    s += '<g data-hit="poke" data-id="chuongga"><path d="M2622 548 L2732 486 L2842 548 Z" fill="#d9a93a"/><path d="M2650 532 L2732 486 L2814 532" fill="none" stroke="#c08a1e" stroke-width="4"/><rect x="2640" y="546" width="184" height="94" fill="#e9d8a6"/>' +
      '<rect x="2654" y="560" width="96" height="80" fill="#f8f1d8" stroke="#8d6e63" stroke-width="4"/><path d="M2654 580 H2750 M2654 600 H2750 M2654 620 H2750 M2678 560 V640 M2702 560 V640 M2726 560 V640" stroke="#b9a37a" stroke-width="2"/>' +
      '<rect x="2766" y="584" width="44" height="56" rx="4" fill="#8d6e63"/><ellipse cx="2700" cy="630" rx="20" ry="9" fill="#f2cc60"/><ellipse cx="2694" cy="624" rx="7" ry="9" fill="#fff"/><ellipse cx="2708" cy="625" rx="7" ry="9" fill="#fdf0d5"/></g>';
    s += '<g><path d="M2868 530 L3000 462 L3132 530 Z" fill="#9c6644"/><rect x="2884" y="528" width="232" height="112" fill="#c68b59"/><path d="M2884 566 H3116 M2884 604 H3116" stroke="#a47148" stroke-width="3"/>' +
      '<rect x="2910" y="556" width="180" height="84" rx="6" fill="#5c4033"/><path d="M2910 612 H3090 M2940 612 V640 M2970 612 V640 M3000 612 V640 M3030 612 V640 M3060 612 V640" stroke="#e9c46a" stroke-width="6" stroke-linecap="round"/></g>';
    s += pk('lon', 2988, 612, pig(), ' scale(.9)');
    // Hàng rào dâm bụt và trụ cổng phía xa (trụ gần do homeProps vẽ, để che đúng chiều sâu)
    for (i = 0; i < 6; i++) s += A.bush(3172, 668 + i * 50, 34);
    s += '<rect x="3140" y="880" width="46" height="84" rx="6" fill="#e9c46a"/><rect x="3132" y="870" width="62" height="16" rx="5" fill="#d4a373"/>';
    // Bờ rào phía gần, hoa, bướm, chim
    for (i = 0; i < 17; i++) s += A.bush(430 + i * 172, 1286, 56 + (i % 3) * 6);
    s += A.flowerBed(2150, 1215, 190) + A.flowerBed(1090, 1236, 150) + A.butterfly(2140, 1180, '#f15bb5') + A.butterfly(1420, 660, '#ffd166', 'f2') + A.butterfly(1090, 1204, '#8ecae6') +
      A.bird(2470, 906, '#ffb703') + A.bird(1190, 1150, '#8ecae6', true, 'b2') + A.skyBird(0, 200, 0.9) + A.skyBird(0, 130, 0.7, 's2');
    return s;
  }

  /* Vật cao xếp theo chiều sâu cùng nhân vật: y = chân vật */
  function homeProps() {
    return [
      { y: 722, poke: 'cay', s: A.tree(560, 720, 70, 'shade') },
      { y: 762, s: dangerSign('biensong', 470, 760, 'SÔNG SÂU', 'NGUY HIỂM') },
      { y: 1100, s: buoy(452, 1100) },
      { y: 1012, s: dangerSign('bienao', 1186, 1012, 'AO SÂU', 'NGUY HIỂM') },
      { y: 1000, poke: 'chuoi', s: banana(1290, 1000) },
      { y: 905, poke: 'buoi', s: A.tree(1640, 905, 52, 'fruit', '#ffd60a') },
      { y: 1150, poke: 'cau', s: A.palm(1760, 1150, 150) },
      { y: 1162, s: well(1600, 1162) },
      { y: 708, s: jar(1822, 708) },
      { y: 962, s: pk('cho', 2320, 962, dog()) },
      { y: 762, s: pk('ga', 2680, 762, hen('#c97b4a', '#8d5524')) },
      { y: 832, s: pk('gatrong', 2800, 832, hen('#e76f51', '#1d3557', true), ' scale(-1.15 1.15)') },
      { y: 880, s: pk('ga', 2600, 880, hen('#f1e3c8', '#c9b28a'), ' scale(-1 1)') },
      { y: 872, s: pk('gacon', 2722, 872, chick()) }, { y: 900, s: pk('gacon', 2754, 900, chick(), ' scale(-1 1)') }, { y: 908, s: pk('gacon', 2700, 908, chick()) },
      { y: 1100, s: pk('vit', 2880, 1100, duck(false)) }, { y: 1132, s: pk('vit', 2936, 1132, duck(false), ' scale(-1 1)') },
      { y: 820, s: hay(3010, 820) },
      { y: 1150, s: pk('bo', 2700, 1150, cow(), ' scale(-1 1)') },
      { y: 1150, s: '<g><rect x="3140" y="1066" width="46" height="84" rx="6" fill="#e9c46a"/><rect x="3132" y="1056" width="62" height="16" rx="5" fill="#d4a373"/>' + A.bush(3172, 1186, 36) + A.bush(3172, 1236, 36) + '</g>' }
    ];
  }

  A.homeScene = homeScene; A.homeProps = homeProps; A.HOME = HOME;
})(window);
