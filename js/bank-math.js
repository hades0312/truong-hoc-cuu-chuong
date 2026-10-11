/* bank-math.js: Toán lớp 4 (theo Chương trình GDPT 2018) ngoài bảng cửu chương.
 * Khác với Khoa học và Tiếng Anh, phần lớn câu hỏi được sinh ngẫu nhiên: mỗi chủ đề có hàm make() trả về
 * {q, a, wrong, why, hint}; vài chủ đề có thêm items là các câu cố định về khái niệm. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  TT.bank = TT.bank || {};

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = ri(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* Viết số theo sách giáo khoa: tách lớp bằng khoảng trắng (1 250 300) */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function frac(a, b) { return a + '/' + b; }

  /* Ba đáp án sai gần với đáp án đúng, khác nhau và khác đáp án */
  function near(ans, deltas) {
    var out = [], seen = {};
    seen[ans] = 1;
    shuffle(deltas).forEach(function (d) { var v = ans + d; if (v >= 0 && !seen[v] && out.length < 3) { seen[v] = 1; out.push(v); } });
    for (var k = 1; out.length < 3; k++) { var v2 = ans + k * 11; if (!seen[v2]) { seen[v2] = 1; out.push(v2); } }
    return out;
  }
  function item(q, ans, deltas, why, hint, unit) {
    var u = unit ? ' ' + unit : '';
    return { q: q, a: fmt(ans) + u, wrong: near(ans, deltas).map(function (v) { return fmt(v) + u; }), why: why, hint: hint };
  }
  /* Đáp án dạng chữ: lấy tối đa ba đáp án sai khác nhau và khác đáp án đúng */
  function text(q, a, wrongs, why, hint) {
    var out = [], seen = {};
    seen[a] = 1;
    shuffle(wrongs).forEach(function (w) { if (!seen[w] && out.length < 3) { seen[w] = 1; out.push(w); } });
    return { q: q, a: a, wrong: out, why: why, hint: hint };
  }

  var PLACES = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu'];
  var ROMAN = { 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI' };

  /* ---------- Số có nhiều chữ số ---------- */
  function soNhieuChuSo() {
    var kind = ri(0, 4), n, i;
    if (kind === 0) { // giá trị của chữ số
      var digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, ri(6, 7));
      n = +digits.join('');
      i = ri(1, digits.length - 1); // vị trí tính từ phải sang (0 = hàng đơn vị)
      var d = digits[digits.length - 1 - i], val = d * Math.pow(10, i);
      return text('Trong số ' + fmt(n) + ', chữ số ' + d + ' có giá trị là bao nhiêu?', fmt(val),
        [fmt(val * 10), fmt(val / 10), String(d), fmt(val * 100)],
        'Chữ số ' + d + ' đứng ở hàng ' + PLACES[i] + ' nên có giá trị ' + fmt(val) + '.', 'Đếm xem chữ số đó đứng ở hàng nào, tính từ hàng đơn vị.');
    }
    if (kind === 1) { // làm tròn
      var p = pick([3, 4, 5]), unit = Math.pow(10, p);
      do { n = ri(120000, 989999); } while (Math.floor(n / (unit / 10)) % 10 === 5 || n % unit === 0);
      var r = Math.round(n / unit) * unit, lo = Math.floor(n / unit) * unit, other = r === lo ? lo + unit : lo;
      return text('Làm tròn số ' + fmt(n) + ' đến hàng ' + PLACES[p] + ' được số nào?', fmt(r),
        [fmt(other), fmt(Math.round(n / (unit / 10)) * (unit / 10)), fmt(Math.round(n / (unit * 10)) * unit * 10 || unit * 10), fmt(r + unit * 2), fmt(lo + unit * 3)],
        'Chữ số đứng ngay sau hàng ' + PLACES[p] + ' là ' + (Math.floor(n / (unit / 10)) % 10) + ': ' + (r === lo ? 'bé hơn 5 nên làm tròn xuống.' : 'từ 5 trở lên nên làm tròn lên.'),
        'Nhìn chữ số đứng ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống.');
    }
    if (kind === 2) { // so sánh
      var base = ri(21, 97) * 10000, list = {};
      while (Object.keys(list).length < 4) list[base + ri(100, 9899)] = 1;
      var nums = Object.keys(list).map(Number), big = pick([true, false]);
      var best = big ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      return text('Số nào ' + (big ? 'lớn' : 'bé') + ' nhất?', fmt(best), nums.filter(function (v) { return v !== best; }).map(fmt),
        'So sánh từng cặp chữ số cùng hàng, lần lượt từ trái sang phải.', 'Các số có cùng số chữ số: so sánh từ hàng cao nhất.');
    }
    if (kind === 3) { // cấu tạo số
      var tr = ri(2, 9), ng = ri(2, 9), tm = ri(1, 9);
      n = tr * 1000000 + ng * 1000 + tm * 100;
      return text('Số gồm ' + tr + ' triệu, ' + ng + ' nghìn và ' + tm + ' trăm viết là:', fmt(n),
        [fmt(tr * 1000000 + ng * 100000 + tm * 100), fmt(tr * 1000000 + ng * 10000 + tm * 100), fmt(tr * 100000 + ng * 1000 + tm * 100)],
        'Lớp triệu có ' + tr + ', lớp nghìn có ' + ng + ' nghìn (viết là 00' + ng + '), lớp đơn vị có ' + tm + ' trăm.', 'Viết lần lượt lớp triệu, lớp nghìn, lớp đơn vị; mỗi lớp đủ ba chữ số.');
    }
    var even = pick([true, false]), ok = ri(1000, 9999) * 2 + (even ? 0 : 1), bad = {}; // chẵn, lẻ
    while (Object.keys(bad).length < 3) bad[ri(1000, 9999) * 2 + (even ? 1 : 0)] = 1;
    return text('Số nào là số ' + (even ? 'chẵn' : 'lẻ') + '?', fmt(ok), Object.keys(bad).map(Number).map(fmt),
      'Số ' + (even ? 'chẵn có chữ số tận cùng là 0, 2, 4, 6, 8.' : 'lẻ có chữ số tận cùng là 1, 3, 5, 7, 9.'), 'Chỉ cần nhìn chữ số tận cùng.');
  }

  /* ---------- Cộng, trừ số có nhiều chữ số ---------- */
  function congTru() {
    var a = ri(120000, 780000), b = ri(11000, 99000), dl = [1000, -1000, 100, -100, 10000, -10000, 10, -10];
    if (pick([true, false])) {
      return item('Tính: ' + fmt(a) + ' + ' + fmt(b), a + b, dl, fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) + '. Cộng từ hàng đơn vị, nhớ sang hàng bên trái khi đủ 10.', 'Đặt tính thẳng cột rồi cộng từ phải sang trái.');
    }
    return item('Tính: ' + fmt(a) + ' − ' + fmt(b), a - b, dl, fmt(a) + ' − ' + fmt(b) + ' = ' + fmt(a - b) + '. Thử lại: ' + fmt(a - b) + ' + ' + fmt(b) + ' = ' + fmt(a) + '.', 'Đặt tính thẳng cột rồi trừ từ phải sang trái; không trừ được thì mượn.');
  }

  /* ---------- Nhân, chia ---------- */
  function nhanChia() {
    var kind = ri(0, 4), a, b;
    if (kind === 0) {
      a = ri(1200, 9800); b = ri(3, 9);
      return item('Tính: ' + fmt(a) + ' × ' + b, a * b, [b, -b, 10 * b, -10 * b, 100, -100, 1000],
        fmt(a) + ' × ' + b + ' = ' + fmt(a * b) + '. Nhân lần lượt từ hàng đơn vị, nhớ thêm vào hàng bên trái.', 'Nhân từng chữ số của ' + fmt(a) + ' với ' + b + ', bắt đầu từ hàng đơn vị.');
    }
    if (kind === 1) {
      a = ri(12, 89);
      do { b = ri(11, 45); } while (b % 10 === 0);
      return item('Tính: ' + a + ' × ' + b, a * b, [a, -a, b, -b, 10, -10, 100, -100],
        a + ' × ' + b + ' = ' + a + ' × ' + (b % 10) + ' + ' + a + ' × ' + (b - b % 10) + ' = ' + (a * (b % 10)) + ' + ' + fmt(a * (b - b % 10)) + ' = ' + fmt(a * b) + '.',
        'Tách ' + b + ' thành ' + (b - b % 10) + ' và ' + (b % 10) + ' rồi nhân từng phần.');
    }
    if (kind === 2) {
      a = ri(12, 980); var k = pick([10, 100, 1000]);
      if (pick([true, false])) {
        return text('Tính nhẩm: ' + fmt(a) + ' × ' + fmt(k), fmt(a * k), [fmt(a * k * 10), fmt(a * k / 10), fmt(a + k)],
          'Nhân với ' + fmt(k) + ': viết thêm ' + (String(k).length - 1) + ' chữ số 0 vào bên phải số đó.', 'Đếm số chữ số 0 của ' + fmt(k) + '.');
      }
      return text('Tính nhẩm: ' + fmt(a * k) + ' : ' + fmt(k), fmt(a), [fmt(a * 10), fmt(a * 100), fmt(a + 1)],
        'Chia cho ' + fmt(k) + ': bỏ bớt ' + (String(k).length - 1) + ' chữ số 0 ở bên phải số đó.', 'Đếm số chữ số 0 của ' + fmt(k) + '.');
    }
    if (kind === 3) {
      b = ri(3, 9); var q = ri(112, 980);
      return item('Tính: ' + fmt(q * b) + ' : ' + b, q, [1, -1, 10, -10, 100, -100, 2, -2],
        fmt(q * b) + ' : ' + b + ' = ' + fmt(q) + '. Thử lại: ' + fmt(q) + ' × ' + b + ' = ' + fmt(q * b) + '.', 'Chia lần lượt từ trái sang phải.');
    }
    b = pick([11, 12, 14, 15, 16, 18, 21, 24, 25, 32]); var q2 = ri(12, 96);
    return item('Tính: ' + fmt(q2 * b) + ' : ' + b, q2, [1, -1, 10, -10, 2, -2, 5, -5],
      fmt(q2 * b) + ' : ' + b + ' = ' + q2 + '. Thử lại: ' + q2 + ' × ' + b + ' = ' + fmt(q2 * b) + '.', 'Ước lượng thương: ' + b + ' nhân với mấy thì gần ' + fmt(q2 * b) + '?');
  }

  /* ---------- Trung bình cộng, tổng và hiệu ---------- */
  function trungBinh() {
    if (pick([true, false])) {
      var n = pick([3, 4]), avg = ri(18, 95), nums = [], sum = 0, i;
      for (i = 0; i < n - 1; i++) { nums.push(avg + ri(-12, 12)); sum += nums[i]; }
      nums.push(avg * n - sum);
      if (nums[n - 1] <= 0) return trungBinh();
      return item('Trung bình cộng của các số ' + nums.join(', ') + ' là:', avg, [1, -1, 2, -2, n, -n, 10, -10],
        'Tổng là ' + (avg * n) + ', có ' + n + ' số hạng nên trung bình cộng là ' + (avg * n) + ' : ' + n + ' = ' + avg + '.', 'Cộng tất cả các số rồi chia cho số các số hạng.');
    }
    var small = ri(15, 140), dif = ri(2, 30) * 2, big = small + dif, total = small + big, askBig = pick([true, false]);
    return text('Tổng của hai số là ' + total + ', hiệu của hai số là ' + dif + '. Số ' + (askBig ? 'lớn' : 'bé') + ' là:', String(askBig ? big : small),
      [String(askBig ? small : big), String(total - dif), String(total / 2), String((askBig ? big : small) + dif / 2)],
      askBig ? 'Số lớn = (tổng + hiệu) : 2 = (' + total + ' + ' + dif + ') : 2 = ' + big + '.' : 'Số bé = (tổng − hiệu) : 2 = (' + total + ' − ' + dif + ') : 2 = ' + small + '.',
      'Bớt (hoặc thêm) phần hiệu thì hai số bằng nhau.');
  }

  /* ---------- Phân số ---------- */
  function phanSo() {
    var kind = ri(0, 5), a, b, n, k;
    if (kind === 0) { // rút gọn
      do { a = ri(1, 6); b = ri(a + 1, 9); } while (gcd(a, b) !== 1);
      k = ri(2, 6);
      return text('Rút gọn phân số ' + frac(a * k, b * k) + ' được phân số tối giản nào?', frac(a, b),
        [frac(a + 1, b + 1), frac(a, b + 1), frac(b, a), frac(a + 1, b)],
        'Chia cả tử số và mẫu số cho ' + k + ': ' + (a * k) + ' : ' + k + ' = ' + a + ', ' + (b * k) + ' : ' + k + ' = ' + b + '.', 'Tìm một số mà cả tử số và mẫu số cùng chia hết.');
    }
    if (kind === 1) { // so sánh cùng mẫu
      n = pick([7, 9, 11, 12, 13, 15]);
      var tops = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4), big = pick([true, false]);
      var best = big ? Math.max.apply(null, tops) : Math.min.apply(null, tops);
      return text('Phân số nào ' + (big ? 'lớn' : 'bé') + ' nhất?', frac(best, n), tops.filter(function (t) { return t !== best; }).map(function (t) { return frac(t, n); }),
        'Các phân số cùng mẫu số: phân số nào có tử số ' + (big ? 'lớn hơn thì lớn hơn.' : 'bé hơn thì bé hơn.'), 'Mẫu số giống nhau, chỉ cần so sánh tử số.');
    }
    if (kind === 2 || kind === 3) { // cộng, trừ cùng mẫu (mẫu là số nguyên tố để kết quả đã tối giản)
      n = pick([7, 11, 13, 17]);
      a = ri(1, n - 3); b = ri(1, n - 1 - a);
      if (kind === 2) {
        return text('Tính: ' + frac(a, n) + ' + ' + frac(b, n), frac(a + b, n), [frac(a + b, n * 2), frac(a * b, n), frac(a + b + 1, n), frac(a + b, n + n - 1)],
          'Cộng hai phân số cùng mẫu số: cộng hai tử số ' + a + ' + ' + b + ' = ' + (a + b) + ', giữ nguyên mẫu số ' + n + '.', 'Mẫu số giữ nguyên, chỉ cộng tử số.');
      }
      var top = a + b;
      return text('Tính: ' + frac(top, n) + ' − ' + frac(b, n), frac(a, n), [frac(a, 0 + n * 2), frac(top + b, n), frac(a + 1, n), frac(a, n - 1)],
        'Trừ hai phân số cùng mẫu số: trừ hai tử số ' + top + ' − ' + b + ' = ' + a + ', giữ nguyên mẫu số ' + n + '.', 'Mẫu số giữ nguyên, chỉ trừ tử số.');
    }
    if (kind === 4) { // phân số bằng nhau
      do { a = ri(1, 4); b = ri(a + 1, 6); } while (gcd(a, b) !== 1);
      k = ri(2, 4);
      return text('Phân số nào bằng phân số ' + frac(a, b) + '?', frac(a * k, b * k), [frac(a + k, b + k), frac(a * k, b * k + 1), frac(a * k + 1, b * k), frac(b * k, a * k)],
        'Nhân cả tử số và mẫu số của ' + frac(a, b) + ' với ' + k + ' được ' + frac(a * k, b * k) + '.', 'Nhân (hoặc chia) cả tử số và mẫu số với cùng một số thì được phân số bằng nó.');
    }
    var c, d; // nhân hai phân số (chọn số để kết quả đã tối giản)
    do { a = ri(1, 4); b = pick([5, 7]); c = ri(1, 4); d = pick([3, 5, 7, 9]); } while (gcd(a * c, b * d) !== 1 || (a === c && b === d));
    return text('Tính: ' + frac(a, b) + ' × ' + frac(c, d), frac(a * c, b * d), [frac(a + c, b + d), frac(a * c, b + d), frac(a * d, b * c), frac(a + c, b * d)],
      'Nhân hai phân số: tử số nhân tử số ' + a + ' × ' + c + ' = ' + (a * c) + ', mẫu số nhân mẫu số ' + b + ' × ' + d + ' = ' + (b * d) + '.', 'Lấy tử số nhân với tử số, mẫu số nhân với mẫu số.');
  }

  /* ---------- Đo lường ---------- */
  function doLuong() {
    var kind = ri(0, 6), x = ri(2, 48), y;
    if (kind === 0) return item(x + ' tấn = … kg', x * 1000, [x * 100 - x * 1000, x * 10000 - x * 1000, x * 10 - x * 1000], '1 tấn = 1 000 kg nên ' + x + ' tấn = ' + fmt(x * 1000) + ' kg.', '1 tấn = 10 tạ = 1 000 kg.', 'kg');
    if (kind === 1) return item(x + ' tạ = … kg', x * 100, [x * 10 - x * 100, x * 1000 - x * 100, x - x * 100 + 100], '1 tạ = 100 kg nên ' + x + ' tạ = ' + fmt(x * 100) + ' kg.', '1 tạ = 10 yến = 100 kg.', 'kg');
    if (kind === 2) return item(x + ' yến = … kg', x * 10, [x * 100 - x * 10, x * 1000 - x * 10, 5], '1 yến = 10 kg nên ' + x + ' yến = ' + fmt(x * 10) + ' kg.', '1 yến = 10 kg.', 'kg');
    if (kind === 3) { x = ri(2, 9); y = ri(1, 9); return item(x + ' tấn ' + y + ' tạ = … tạ', x * 10 + y, [x * 100 + y - x * 10 - y, x + y - x * 10 - y, 10], x + ' tấn = ' + (x * 10) + ' tạ; thêm ' + y + ' tạ nữa là ' + (x * 10 + y) + ' tạ.', 'Đổi phần tấn ra tạ trước: 1 tấn = 10 tạ.', 'tạ'); }
    if (kind === 4) { x = ri(2, 12); y = ri(5, 55); return item(x + ' phút ' + y + ' giây = … giây', x * 60 + y, [x * 100 + y - x * 60 - y, x * 10 + y - x * 60 - y, 60, -60], x + ' phút = ' + (x * 60) + ' giây; thêm ' + y + ' giây nữa là ' + (x * 60 + y) + ' giây.', '1 phút = 60 giây.', 'giây'); }
    if (kind === 5) {
      var year = ri(1010, 2024), cen = Math.ceil(year / 100);
      return text('Năm ' + year + ' thuộc thế kỉ nào?', 'Thế kỉ ' + ROMAN[cen], ['Thế kỉ ' + ROMAN[cen - 1 < 11 ? cen + 2 : cen - 1], 'Thế kỉ ' + ROMAN[cen + 1 > 21 ? cen - 2 : cen + 1], 'Thế kỉ ' + ROMAN[cen >= 13 ? cen - 2 : cen + 3]],
        'Thế kỉ ' + ROMAN[cen] + ' kéo dài từ năm ' + ((cen - 1) * 100 + 1) + ' đến năm ' + (cen * 100) + '.', 'Một thế kỉ là 100 năm. Thế kỉ XX từ năm 1901 đến năm 2000.');
    }
    x = ri(2, 36);
    if (pick([true, false])) return item(x + ' m² = … dm²', x * 100, [x * 10 - x * 100, x * 1000 - x * 100, x * 10000 - x * 100], '1 m² = 100 dm² nên ' + x + ' m² = ' + fmt(x * 100) + ' dm².', 'Hai đơn vị đo diện tích liền nhau hơn kém nhau 100 lần.', 'dm²');
    return item(x + ' dm² = … cm²', x * 100, [x * 10 - x * 100, x * 1000 - x * 100, x * 10000 - x * 100], '1 dm² = 100 cm² nên ' + x + ' dm² = ' + fmt(x * 100) + ' cm².', 'Hai đơn vị đo diện tích liền nhau hơn kém nhau 100 lần.', 'cm²');
  }

  /* ---------- Hình học ---------- */
  function hinhHoc() {
    var kind = ri(0, 3), a, b;
    if (kind === 0) {
      var deg = pick([30, 45, 60, 75, 90, 100, 120, 135, 150, 180]);
      var name = deg < 90 ? 'Góc nhọn' : (deg === 90 ? 'Góc vuông' : (deg === 180 ? 'Góc bẹt' : 'Góc tù'));
      return text('Góc có số đo ' + deg + '° là góc gì?', name, ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
        'Góc nhọn bé hơn 90°, góc vuông bằng 90°, góc tù lớn hơn 90° và bé hơn 180°, góc bẹt bằng 180°.', 'So số đo của góc với góc vuông (90°).');
    }
    a = ri(12, 60); b = ri(5, a - 3);
    if (kind === 1) return item('Hình chữ nhật có chiều dài ' + a + ' cm, chiều rộng ' + b + ' cm. Chu vi của hình là:', (a + b) * 2, [-(a + b), a * b - (a + b) * 2, 2, -2, 10], 'Chu vi hình chữ nhật = (dài + rộng) × 2 = (' + a + ' + ' + b + ') × 2 = ' + ((a + b) * 2) + ' cm.', 'Chu vi là tổng độ dài bốn cạnh.', 'cm');
    if (kind === 2) return item('Hình chữ nhật có chiều dài ' + a + ' m, chiều rộng ' + b + ' m. Diện tích của hình là:', a * b, [(a + b) * 2 - a * b, a + b - a * b, a, -b, 10], 'Diện tích hình chữ nhật = dài × rộng = ' + a + ' × ' + b + ' = ' + fmt(a * b) + ' m².', 'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng.', 'm²');
    a = ri(6, 45);
    if (pick([true, false])) return item('Hình vuông có cạnh ' + a + ' cm. Chu vi của hình là:', a * 4, [a * a - a * 4, -a * 2, 4, -4, a], 'Chu vi hình vuông = cạnh × 4 = ' + a + ' × 4 = ' + (a * 4) + ' cm.', 'Hình vuông có bốn cạnh bằng nhau.', 'cm');
    return item('Hình vuông có cạnh ' + a + ' m. Diện tích của hình là:', a * a, [a * 4 - a * a, a * 2 - a * a, a, -a, 10], 'Diện tích hình vuông = cạnh × cạnh = ' + a + ' × ' + a + ' = ' + fmt(a * a) + ' m².', 'Diện tích hình vuông bằng cạnh nhân cạnh.', 'm²');
  }

  /* ---------- Biểu thức, tìm thành phần chưa biết ---------- */
  function bieuThuc() {
    var kind = ri(0, 4), a, b, c, x;
    if (kind === 0) {
      a = ri(120, 900); b = ri(12, 60); c = ri(2, 9);
      return item('Giá trị của biểu thức a + b × c với a = ' + a + ', b = ' + b + ', c = ' + c + ' là:', a + b * c, [(a + b) * c - a - b * c, b, -b, c, 10, -10],
        'Nhân chia trước, cộng trừ sau: ' + b + ' × ' + c + ' = ' + (b * c) + ', rồi ' + a + ' + ' + (b * c) + ' = ' + fmt(a + b * c) + '.', 'Trong biểu thức có cả cộng và nhân, làm phép nhân trước.');
    }
    if (kind === 1) {
      x = ri(1200, 6400); b = ri(800, 3500);
      return item('Tìm số còn thiếu: … + ' + fmt(b) + ' = ' + fmt(x + b), x, [b * 2, 100, -100, 1000, -1000, 10], 'Muốn tìm số hạng chưa biết, lấy tổng trừ đi số hạng kia: ' + fmt(x + b) + ' − ' + fmt(b) + ' = ' + fmt(x) + '.', 'Lấy tổng trừ đi số hạng đã biết.');
    }
    if (kind === 2) {
      x = ri(112, 940); b = ri(3, 9);
      return item('Tìm số còn thiếu: … × ' + b + ' = ' + fmt(x * b), x, [1, -1, 10, -10, 100, -100], 'Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: ' + fmt(x * b) + ' : ' + b + ' = ' + fmt(x) + '.', 'Lấy tích chia cho thừa số đã biết.');
    }
    if (kind === 3) {
      a = pick([25, 125, 50, 20]); b = a === 125 ? 8 : (a === 25 ? 4 : (a === 50 ? 2 : 5)); c = ri(3, 19);
      return item('Tính bằng cách thuận tiện: ' + a + ' × ' + c + ' × ' + b, a * b * c, [a * b, -a * b, c, 10 * c, a], 'Đổi chỗ và nhóm các thừa số: (' + a + ' × ' + b + ') × ' + c + ' = ' + fmt(a * b) + ' × ' + c + ' = ' + fmt(a * b * c) + '.', 'Tìm hai thừa số nhân với nhau ra số tròn trăm, tròn nghìn.');
    }
    a = ri(12, 45); b = ri(3, 9); c = ri(2, 8);
    return item('Tính: ' + a + ' × (' + b + ' + ' + c + ')', a * (b + c), [a * b + c - a * (b + c), a, -a, b, 10], 'Nhân một số với một tổng: ' + a + ' × ' + b + ' + ' + a + ' × ' + c + ' = ' + (a * b) + ' + ' + (a * c) + ' = ' + fmt(a * (b + c)) + '.', 'Tính trong ngoặc trước, hoặc nhân số đó với từng số hạng rồi cộng lại.');
  }

  TT.bank.math = {
    id: 'math', name: 'Toán lớp 4',
    topics: [
      { id: 'so', name: 'Số có nhiều chữ số', icon: '🔢', make: soNhieuChuSo },
      { id: 'congtru', name: 'Cộng, trừ số lớn', icon: '➕', make: congTru },
      { id: 'nhanchia', name: 'Nhân, chia', icon: '✖️', make: nhanChia },
      { id: 'tbc', name: 'Trung bình cộng, tổng và hiệu', icon: '⚖️', make: trungBinh },
      { id: 'phanso', name: 'Phân số', icon: '🍕', make: phanSo },
      { id: 'doluong', name: 'Đo lường', icon: '📏', make: doLuong },
      { id: 'hinhhoc', name: 'Hình học', icon: '📐', make: hinhHoc, items: [
        { q: 'Hình bình hành có đặc điểm gì?', a: 'Hai cặp cạnh đối diện song song', wrong: ['Bốn góc đều là góc vuông', 'Chỉ một cặp cạnh song song'], why: 'Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.' },
        { q: 'Hình thoi có đặc điểm gì?', a: 'Bốn cạnh bằng nhau', wrong: ['Bốn góc vuông', 'Chỉ hai cạnh bằng nhau'], why: 'Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.' },
        { q: 'Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông?', a: '4 góc vuông', wrong: ['1 góc vuông', '2 góc vuông', '3 góc vuông'], why: 'Hai đường thẳng vuông góc cắt nhau tạo thành bốn góc vuông chung đỉnh.' },
        { q: 'Hai đường thẳng song song thì thế nào?', a: 'Không bao giờ cắt nhau', wrong: ['Cắt nhau tại một điểm', 'Vuông góc với nhau'], why: 'Hai đường thẳng song song kéo dài mãi cũng không cắt nhau.' },
        { q: 'Trong hình chữ nhật, hai cạnh kề nhau thì thế nào?', a: 'Vuông góc với nhau', wrong: ['Song song với nhau', 'Luôn bằng nhau'], why: 'Hình chữ nhật có bốn góc vuông nên hai cạnh kề nhau vuông góc với nhau.' },
        { q: 'Dụng cụ nào dùng để đo góc?', a: 'Thước đo góc', wrong: ['Com-pa', 'Cân đĩa'], why: 'Thước đo góc dùng để đo số đo của góc, đơn vị là độ (°).' },
        { q: 'Góc vuông có số đo bao nhiêu độ?', a: '90°', wrong: ['45°', '100°', '180°'], why: 'Góc vuông bằng 90°. Góc bẹt bằng hai góc vuông, tức 180°.' },
        { q: 'Hai đường chéo của hình thoi thì thế nào?', a: 'Vuông góc với nhau', wrong: ['Song song với nhau', 'Không cắt nhau'], why: 'Hai đường chéo của hình thoi vuông góc với nhau và cắt nhau tại trung điểm mỗi đường.' }
      ] },
      { id: 'bieuthuc', name: 'Biểu thức, tìm số chưa biết', icon: '🧩', make: bieuThuc }
    ]
  };
})(window);
