/* tour.js: nội dung "Tham quan trường" — cô giáo dẫn bé đi một vòng quanh trường, rồi kể về quê hương.
 *
 * LƯU Ý VỀ ĐỘ CHÍNH XÁC
 * - Ngôi trường trong game được vẽ theo tưởng tượng và mang tên Trường Tiểu học Tân Trường; các điểm dừng (STOPS)
 *   giới thiệu những nơi có trong game, không khẳng định trường thật có đúng những phòng ấy.
 * - Phần quê hương (HOME) chỉ gồm thông tin đã đối chiếu với trang Wikipedia tiếng Việt về xã Trường Lâm
 *   (https://vi.wikipedia.org/wiki/Trường_Lâm, số liệu năm 2024–2025).
 * - Thông tin riêng về trường thật (năm thành lập, số lớp, số học sinh, thành tích, các điểm trường…) chưa tìm được
 *   nguồn công khai. Ba mẹ hoặc thầy cô biết thì thêm vào SCHOOL bên dưới, game sẽ tự hiện trong phần cuối chuyến tham quan. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};

  /* Thông tin thật về trường do ba mẹ, thầy cô bổ sung. Mỗi dòng là một câu ngắn bé đọc được, ví dụ:
   *   'Trường được thành lập năm …', 'Trường có … lớp với khoảng … học sinh.' */
  var SCHOOL = [];

  /* x, y: chỗ bạn nhỏ đứng trong sân trường (toạ độ của cảnh sân trong world.js) */
  var STOPS = [
    { x: 1250, y: 1335, title: 'Cổng trường', text: 'Chào mừng con đến với chuyến tham quan! Đây là cổng Trường Tiểu học Tân Trường. Mỗi sáng chú Bình bảo vệ đón các con ở đây. Vào cổng rồi mình đi chậm, không chen lấn nhé.' },
    { x: 1250, y: 960, title: 'Sân trường và cột cờ', text: 'Giữa sân là cột cờ với lá cờ đỏ sao vàng. Sáng thứ Hai đầu tuần, cả trường xếp hàng ở đây để chào cờ và hát Quốc ca. Giờ ra chơi, sân trường là nơi các con vui chơi.' },
    { x: 975, y: 885, title: 'Bảng tin', text: 'Bảng tin là nơi dán thông báo và nhiệm vụ mỗi ngày. Con nhớ ghé xem để biết hôm nay có gì mới nhé.' },
    { x: 1140, y: 735, title: 'Dãy lớp học', text: 'Đây là dãy nhà lớp học hai tầng. Trong lớp có bảng xanh, bàn ghế, bảng 5 điều Bác Hồ dạy. Con học cùng cô Hằng và các bạn ở đây.' },
    { x: 530, y: 735, title: 'Phòng Mỹ thuật', text: 'Phòng Mỹ thuật là nơi con tô màu, vẽ tranh và trang trí. Con có thể tô màu cho nhân vật của mình thật xinh ở đây.' },
    { x: 420, y: 1045, title: 'Nhà ăn', text: 'Nhà ăn là nơi các con ăn bữa trưa cùng nhau. Cô Tâm nhắc: rửa tay trước khi ăn, ăn đủ chất và không mua quà vặt không rõ nguồn gốc.' },
    { x: 640, y: 1230, title: 'Góc thú cưng', text: 'Góc thú cưng có mèo Mít, thỏ Bông và rồng nhỏ Đậu. Chăm sóc các bạn thú giúp con biết yêu thương và có trách nhiệm.' },
    { x: 1960, y: 1205, title: 'Sân thể thao', text: 'Sân thể thao là nơi học thể dục, đá bóng, chơi bóng rổ. Vận động mỗi ngày giúp cơ thể khoẻ mạnh, học tập tốt hơn.' },
    { x: 2140, y: 1075, title: 'Vườn trường', text: 'Vườn trường trồng cây ăn quả và hoa. Ở đây con học cách chăm cây, và nhớ là mình không bẻ cành, hái hoa nhé.' },
    { x: 1880, y: 735, title: 'Thư viện', text: 'Điểm cuối là thư viện, nơi có rất nhiều sách truyện. Vào thư viện mình đi nhẹ, nói khẽ và đọc xong thì xếp sách về đúng chỗ.' }
  ];

  /* Quê hương em: xã Trường Lâm, tỉnh Thanh Hoá (đã đối chiếu, xem ghi chú đầu file) */
  var HOME = [
    'Trường Tiểu học Tân Trường của chúng mình ở xã Trường Lâm, tỉnh Thanh Hoá.',
    'Xã Trường Lâm nằm ở cửa ngõ phía đông nam của tỉnh Thanh Hoá. Phía tây và phía nam xã mình giáp tỉnh Nghệ An.',
    'Xã Trường Lâm ngày nay được lập năm 2025 từ hai xã Tân Trường và Trường Lâm. Tên trường mình vẫn giữ tên xã Tân Trường trước đây.',
    'Trước đó, vùng này thuộc huyện Tĩnh Gia, rồi thuộc thị xã Nghi Sơn từ năm 2020 đến năm 2025.',
    'Xã rộng khoảng 68 ki-lô-mét vuông, có 24 thôn và hơn 21 nghìn người (số liệu năm 2024).',
    'Quốc lộ 1 và đường cao tốc Bắc – Nam chạy qua xã. Kênh Nhà Lê, một tuyến đường thuỷ cổ của nước ta, cũng đi qua đây.'
  ];

  TT.tour = { STOPS: STOPS, HOME: HOME, SCHOOL: SCHOOL, GUIDE: { name: 'Cô Hằng', art: 'hang' } };
})(window);
