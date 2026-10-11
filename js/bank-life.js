/* bank-life.js: Kỹ năng sống — an toàn giao thông (chú Cảnh sát trên đường tới trường) và ăn uống an toàn
 * (cô Tâm ở nhà ăn). Cùng dạng câu hỏi với bank-science.js; mỗi chủ đề có thầy cô riêng (teacher, tname). */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  TT.bank = TT.bank || {};
  TT.bank.life = {
    id: 'life', name: 'Kỹ năng sống',
    topics: [
      { id: 'giaothong', name: 'An toàn giao thông', icon: '🚦', teacher: 'congan', tname: 'Chú Cảnh sát', items: [
        { q: 'Đèn tín hiệu cho người đi bộ đang đỏ. Con nên làm gì?', a: 'Đứng trên vỉa hè chờ đèn xanh', wrong: ['Chạy thật nhanh sang đường', 'Đi chậm ra giữa đường rồi chờ'], why: 'Đèn đỏ là lúc xe đang chạy. Đứng trên vỉa hè chờ đèn xanh mới an toàn.', pic: '🚦' },
        { q: 'Đèn giao thông màu vàng báo hiệu điều gì?', a: 'Đi chậm lại và chuẩn bị dừng', wrong: ['Đi thật nhanh cho kịp', 'Được đi như đèn xanh'], why: 'Đèn vàng báo sắp chuyển sang đèn đỏ, xe phải đi chậm lại và dừng trước vạch.' },
        { q: 'Muốn sang đường, con nên đi ở đâu?', a: 'Trên vạch kẻ đường cho người đi bộ', wrong: ['Chỗ nào gần nhất thì sang', 'Giữa hai chiếc xe đang đỗ'], why: 'Vạch kẻ đường là nơi dành cho người đi bộ, người lái xe sẽ chú ý và nhường đường.', hint: 'Đó là những vạch sơn trắng to, song song trên mặt đường.' },
        { q: 'Trước khi bước xuống đường, con cần làm gì?', a: 'Dừng lại, quan sát hai bên', wrong: ['Nhìn điện thoại cho đỡ sợ', 'Nhắm mắt đi thật nhanh'], why: 'Luôn dừng lại, nhìn bên trái, bên phải rồi mới sang đường khi không có xe tới gần.' },
        { q: 'Khi đi bộ trên đường có vỉa hè, con đi ở đâu?', a: 'Trên vỉa hè', wrong: ['Dưới lòng đường', 'Giữa hai làn xe'], why: 'Vỉa hè dành cho người đi bộ. Lòng đường là của xe cộ, rất nguy hiểm.' },
        { q: 'Đường không có vỉa hè thì con đi bộ thế nào?', a: 'Đi sát mép đường', wrong: ['Đi giữa lòng đường', 'Đi dàn hàng ngang với bạn'], why: 'Không có vỉa hè thì đi sát mép đường và không dàn hàng ngang để tránh xe.' },
        { q: 'Ngồi sau xe máy, con phải nhớ điều gì?', a: 'Đội mũ bảo hiểm, cài quai đúng cách', wrong: ['Cầm mũ trên tay cho mát', 'Đội mũ nhưng không cài quai'], why: 'Mũ bảo hiểm cài quai chắc chắn sẽ bảo vệ đầu nếu chẳng may bị ngã.', pic: '🛵' },
        { q: 'Ngồi sau xe máy thế nào là an toàn?', a: 'Ngồi ngay ngắn, bám chắc người lái', wrong: ['Đứng lên yên xe cho cao', 'Quay người ra sau vẫy bạn'], why: 'Ngồi ngay ngắn và bám chắc giúp con không bị ngã khi xe phanh hoặc rẽ.' },
        { q: 'Ngồi trên ô tô, con cần làm gì?', a: 'Thắt dây an toàn', wrong: ['Thò đầu ra ngoài cửa sổ', 'Đứng lên ghế để nhìn đường'], why: 'Dây an toàn giữ con ở yên trên ghế khi xe phanh gấp.', pic: '🚗' },
        { q: 'Xe buýt vừa tới trạm. Khi nào con lên xe?', a: 'Khi xe đã dừng hẳn', wrong: ['Khi xe còn đang chạy chậm', 'Chạy theo xe rồi nhảy lên'], why: 'Chỉ lên, xuống khi xe đã dừng hẳn; xếp hàng và không chen lấn.', pic: '🚌' },
        { q: 'Vừa xuống xe buýt, con muốn sang đường. Con nên làm gì?', a: 'Chờ xe đi khỏi rồi mới sang', wrong: ['Sang ngay trước đầu xe', 'Sang ngay sau đuôi xe'], why: 'Xe buýt che khuất tầm nhìn. Chờ xe đi khỏi, nhìn rõ hai bên rồi mới sang đường.', hint: 'Lúc xe còn đỗ, con có nhìn thấy xe khác đang tới không?' },
        { q: 'Chơi đá bóng ở đâu là an toàn?', a: 'Sân chơi, sân bóng', wrong: ['Dưới lòng đường', 'Trên vỉa hè đông người'], why: 'Không chơi đùa dưới lòng đường hay trên vỉa hè vì dễ gây tai nạn cho mình và người khác.', pic: '⚽' },
        { q: 'Quả bóng lăn ra giữa đường. Con nên làm gì?', a: 'Nhờ người lớn lấy giúp', wrong: ['Lao ngay ra nhặt bóng', 'Vừa chạy vừa gọi bạn'], why: 'Lao ra đường rất nguy hiểm vì người lái xe không kịp phanh. Hãy nhờ người lớn giúp.' },
        { q: 'Đi xe đạp trên đường, con đi ở đâu?', a: 'Bên phải, sát lề đường', wrong: ['Bên trái cho dễ nhìn xe', 'Giữa đường cho rộng'], why: 'Ở Việt Nam, xe đi bên phải. Xe đạp đi sát lề đường bên phải.', pic: '🚲' },
        { q: 'Việc nào KHÔNG được làm khi đi xe đạp?', a: 'Buông cả hai tay', wrong: ['Đi sát lề bên phải', 'Giơ tay xin đường khi rẽ'], why: 'Buông hai tay, đi hàng đôi hàng ba hay lạng lách đều rất dễ ngã và gây tai nạn.' },
        { q: 'Biển báo hình tam giác, viền đỏ, nền vàng có ý nghĩa gì?', a: 'Báo nguy hiểm phía trước', wrong: ['Cho phép đi nhanh hơn', 'Chỉ đường tới bệnh viện'], why: 'Biển tam giác viền đỏ là biển báo nguy hiểm, nhắc mọi người chú ý và đi chậm lại.', pic: '⚠️' },
        { q: 'Biển báo có hình trẻ em đặt ở gần đâu?', a: 'Gần trường học', wrong: ['Gần cây xăng', 'Gần sân bay'], why: 'Biển báo "Trẻ em" đặt gần trường học để xe cộ đi chậm lại.' },
        { q: 'Gặp đường ray có rào chắn đang hạ xuống, con làm gì?', a: 'Dừng lại, đứng xa rào chắn', wrong: ['Chui qua rào cho nhanh', 'Chạy thật nhanh qua đường ray'], why: 'Rào chắn hạ xuống là tàu sắp tới. Phải dừng lại và đứng cách xa đường ray.', pic: '🚂' },
        { q: 'Trời tối, đi bộ trên đường nên mặc áo thế nào?', a: 'Áo sáng màu, dễ nhìn thấy', wrong: ['Áo màu đen cho sạch', 'Áo màu tối cho ấm'], why: 'Áo sáng màu giúp người lái xe nhìn thấy con từ xa.' },
        { q: 'Số điện thoại nào gọi cấp cứu khi có người bị tai nạn?', a: '115', wrong: ['113', '114'], why: '115 là cấp cứu y tế, 113 là công an, 114 là cứu hoả.', hint: 'Đây là số của xe cứu thương.', pic: '🚑' },
        { q: 'Thấy xe cứu thương hú còi phía sau, mọi người cần làm gì?', a: 'Nhường đường cho xe', wrong: ['Chạy đua cùng xe', 'Đứng lại giữa đường xem'], why: 'Xe cứu thương, cứu hoả đang làm nhiệm vụ được ưu tiên. Mọi người phải nhường đường.' },
        { q: 'Vừa đi bộ sang đường vừa xem điện thoại thì thế nào?', a: 'Rất nguy hiểm vì không nhìn thấy xe', wrong: ['Không sao vì xe sẽ tự tránh', 'An toàn hơn vì đỡ sợ'], why: 'Khi sang đường phải tập trung quan sát, không xem điện thoại, không đeo tai nghe.' }
      ] },
      /* Trường em, quê em: chỉ hỏi những điều đã đối chiếu (xem ghi chú trong tour.js) */
      { id: 'truongem', name: 'Trường em, quê em', icon: '🏫', teacher: 'hang', tname: 'Cô Hằng', items: [
        { q: 'Trường của chúng mình tên là gì?', a: 'Trường Tiểu học Tân Trường', wrong: ['Trường Tiểu học Trường Lâm', 'Trường Tiểu học Nghi Sơn'], why: 'Trường mình là Trường Tiểu học Tân Trường.', pic: '🏫' },
        { q: 'Trường mình ở xã nào?', a: 'Xã Trường Lâm', wrong: ['Xã Thanh Kỳ', 'Phường Trúc Lâm'], why: 'Trường Tiểu học Tân Trường ở xã Trường Lâm, tỉnh Thanh Hoá.' },
        { q: 'Xã Trường Lâm thuộc tỉnh nào?', a: 'Tỉnh Thanh Hoá', wrong: ['Tỉnh Nghệ An', 'Tỉnh Ninh Bình'], why: 'Xã Trường Lâm nằm ở cửa ngõ phía đông nam của tỉnh Thanh Hoá.' },
        { q: 'Xã Trường Lâm ngày nay được lập từ hai xã nào?', a: 'Tân Trường và Trường Lâm', wrong: ['Tân Trường và Thanh Kỳ', 'Trường Lâm và Hải Bình'], why: 'Năm 2025, hai xã Tân Trường và Trường Lâm được nhập lại thành xã Trường Lâm.' },
        { q: 'Xã Trường Lâm mới được lập vào năm nào?', a: 'Năm 2025', wrong: ['Năm 2015', 'Năm 2020'], why: 'Xã Trường Lâm mới được thành lập năm 2025.', hint: 'Mới đây thôi, khi các xã được sắp xếp lại.' },
        { q: 'Phía tây và phía nam xã mình giáp tỉnh nào?', a: 'Tỉnh Nghệ An', wrong: ['Tỉnh Hà Tĩnh', 'Tỉnh Ninh Bình'], why: 'Xã Trường Lâm nằm sát tỉnh Nghệ An ở phía tây và phía nam.' },
        { q: 'Chữ "Tân Trường" trong tên trường mình cũng là tên của nơi nào trước đây?', a: 'Xã Tân Trường', wrong: ['Huyện Tân Trường', 'Tỉnh Tân Trường'], why: 'Trước năm 2025 có xã Tân Trường. Nay xã đã nhập vào xã Trường Lâm, còn trường vẫn giữ tên cũ.' },
        { q: 'Trước năm 2020, vùng quê mình thuộc huyện nào?', a: 'Huyện Tĩnh Gia', wrong: ['Huyện Nông Cống', 'Huyện Quảng Xương'], why: 'Vùng này trước thuộc huyện Tĩnh Gia, rồi thuộc thị xã Nghi Sơn từ năm 2020 đến năm 2025.' },
        { q: 'Con đường quốc lộ nào chạy qua xã mình?', a: 'Quốc lộ 1', wrong: ['Quốc lộ 5', 'Quốc lộ 6'], why: 'Quốc lộ 1 và đường cao tốc Bắc – Nam đều chạy qua xã Trường Lâm.', pic: '🛣️' },
        { q: 'Tuyến kênh cổ nào đi qua xã mình?', a: 'Kênh Nhà Lê', wrong: ['Kênh Vĩnh Tế', 'Kênh Chợ Gạo'], why: 'Kênh Nhà Lê là một tuyến đường thuỷ cổ của nước ta, có đoạn đi qua xã Trường Lâm.' },
        { q: 'Sáng thứ Hai đầu tuần, cả trường thường làm gì ở sân trường?', a: 'Chào cờ', wrong: ['Ăn trưa', 'Ngủ trưa'], why: 'Sáng thứ Hai, cả trường xếp hàng chào cờ và hát Quốc ca.', pic: '🇻🇳' },
        { q: 'Vào thư viện, con cần nhớ điều gì?', a: 'Đi nhẹ, nói khẽ, giữ gìn sách', wrong: ['Chạy nhảy cho vui', 'Nói thật to cho bạn nghe'], why: 'Thư viện là nơi đọc sách, cần yên tĩnh và giữ sách sạch đẹp.', pic: '📚' }
      ] },
      { id: 'anuong', name: 'Ăn uống an toàn', icon: '🥗', teacher: 'tam', tname: 'Cô Tâm', items: [
        { q: 'Cổng trường có hàng quà vặt không nhãn mác, không rõ ai làm. Con nên làm gì?', a: 'Không mua, không ăn', wrong: ['Mua vì rẻ và nhiều màu', 'Ăn thử một ít cho biết'], why: 'Đồ ăn không rõ nguồn gốc có thể bẩn hoặc chứa chất độc hại, ăn vào dễ đau bụng, ngộ độc.', pic: '🍡' },
        { q: 'Gói bim bim không ghi hạn sử dụng, chữ trên bao bì mờ nhoè. Có nên ăn không?', a: 'Không nên ăn', wrong: ['Nên ăn vì trông vẫn ngon', 'Ăn nhanh cho khỏi hỏng'], why: 'Thực phẩm an toàn phải có nhãn mác, nơi sản xuất và hạn sử dụng rõ ràng.' },
        { q: 'Trước khi mua một hộp sữa, con xem gì trên vỏ hộp?', a: 'Hạn sử dụng', wrong: ['Hình vẽ có đẹp không', 'Hộp có to không'], why: 'Hạn sử dụng cho biết thực phẩm còn dùng được đến ngày nào. Quá hạn thì không dùng.', pic: '🥛' },
        { q: 'Kẹo, que cay có màu sắc loè loẹt khác thường thường có gì?', a: 'Nhiều phẩm màu, không tốt cho cơ thể', wrong: ['Nhiều vi-ta-min hơn', 'Nhiều chất đạm hơn'], why: 'Màu loè loẹt thường do phẩm màu. Đồ không rõ nguồn gốc có thể dùng phẩm màu độc hại.', pic: '🍭' },
        { q: 'Người lạ cho con bánh kẹo, nước uống. Con nên làm gì?', a: 'Lễ phép từ chối, không nhận', wrong: ['Nhận và ăn ngay', 'Nhận rồi chia cho bạn'], why: 'Không nhận đồ ăn, thức uống của người lạ. Hãy từ chối và kể lại với bố mẹ, thầy cô.' },
        { q: 'Trước khi ăn, con cần làm gì?', a: 'Rửa tay bằng xà phòng', wrong: ['Lau tay vào áo', 'Thổi phù phù vào tay'], why: 'Rửa tay bằng xà phòng làm sạch vi khuẩn bám trên tay, phòng bệnh đường ruột.', pic: '🧼' },
        { q: 'Nước nào uống được ngay?', a: 'Nước đã đun sôi để nguội', wrong: ['Nước lấy thẳng từ vòi', 'Nước ao, nước giếng chưa đun'], why: 'Nước đun sôi đã diệt được vi khuẩn. Không uống nước lã.', pic: '💧' },
        { q: 'Thức ăn bị ruồi đậu vào, có mùi lạ thì con làm gì?', a: 'Không ăn, báo người lớn', wrong: ['Gạt ruồi đi rồi ăn', 'Ăn phần chưa có ruồi đậu'], why: 'Ruồi mang theo vi khuẩn, thức ăn có mùi lạ là đã hỏng. Ăn vào dễ bị ngộ độc.' },
        { q: 'Trái cây mua về, trước khi ăn cần làm gì?', a: 'Rửa sạch, gọt vỏ', wrong: ['Lau qua vào áo', 'Ăn ngay cho tươi'], why: 'Rửa sạch và gọt vỏ giúp loại bỏ bụi bẩn và hoá chất còn bám trên quả.', pic: '🍎' },
        { q: 'Món nào sau đây tốt cho bữa sáng của con?', a: 'Bánh mì, trứng và sữa', wrong: ['Một gói bim bim', 'Một cốc trà sữa'], why: 'Bữa sáng cần đủ chất bột đường, chất đạm để có sức học cả buổi.', pic: '🍳' },
        { q: 'Vì sao không nên bỏ bữa sáng?', a: 'Dễ mệt, đói bụng, khó tập trung học', wrong: ['Vì sẽ ngủ ngon hơn', 'Vì sẽ cao nhanh hơn'], why: 'Sau một đêm, cơ thể cần được nạp năng lượng. Bỏ bữa sáng làm con mệt và khó tập trung.' },
        { q: 'Khát nước, con nên chọn uống gì hằng ngày?', a: 'Nước lọc', wrong: ['Nước ngọt có ga', 'Nước tăng lực'], why: 'Nước lọc là tốt nhất. Nước ngọt nhiều đường dễ gây sâu răng, béo phì.', pic: '🥤' },
        { q: 'Ăn nhiều đồ chiên rán, xúc xích, mì tôm thì dễ bị gì?', a: 'Thừa cân, béo phì', wrong: ['Thông minh hơn', 'Cao lớn hơn'], why: 'Đồ chiên rán nhiều dầu mỡ và muối. Ăn nhiều dễ thừa cân, không tốt cho tim mạch.', pic: '🍟' },
        { q: 'Mỗi bữa ăn nên có những gì?', a: 'Cơm, thịt cá, rau và quả', wrong: ['Chỉ cơm với thịt', 'Chỉ bánh kẹo cho ngon'], why: 'Ăn đủ các nhóm chất: bột đường, đạm, béo, vi-ta-min và chất khoáng thì cơ thể mới khoẻ.', pic: '🍱' },
        { q: 'Vì sao con nên ăn rau xanh mỗi ngày?', a: 'Rau có nhiều vi-ta-min và chất xơ', wrong: ['Rau có nhiều chất béo', 'Rau có nhiều đường'], why: 'Rau xanh giúp cơ thể khoẻ mạnh, dễ tiêu hoá và phòng táo bón.', pic: '🥬' },
        { q: 'Ăn xong, con nên làm gì để bảo vệ răng?', a: 'Súc miệng, đánh răng', wrong: ['Ăn thêm cái kẹo', 'Đi ngủ luôn'], why: 'Thức ăn bám trên răng làm sâu răng. Đánh răng sau khi ăn và trước khi đi ngủ.', pic: '🪥' },
        { q: 'Khi đang ăn, con nên làm thế nào?', a: 'Nhai kĩ, ăn chậm', wrong: ['Vừa ăn vừa chạy nhảy', 'Vừa ăn vừa cười đùa to'], why: 'Vừa ăn vừa chạy nhảy, cười đùa rất dễ bị sặc, hóc.' },
        { q: 'Thức ăn sống và thức ăn chín nên để thế nào?', a: 'Để riêng', wrong: ['Để chung một đĩa', 'Để chồng lên nhau'], why: 'Thức ăn sống có thể mang vi khuẩn làm bẩn thức ăn chín.' },
        { q: 'Ăn xong mà đau bụng, buồn nôn. Con cần làm gì ngay?', a: 'Báo ngay cho người lớn', wrong: ['Giấu đi vì sợ bị mắng', 'Uống nước đá cho đỡ'], why: 'Đó có thể là dấu hiệu ngộ độc thức ăn, cần báo người lớn để được chăm sóc kịp thời.' },
        { q: 'Đồ ăn thừa từ hôm qua để ngoài bàn, đã có mùi chua. Con làm gì?', a: 'Bỏ đi, không ăn', wrong: ['Hâm nóng rồi ăn', 'Ăn nhanh cho khỏi phí'], why: 'Thức ăn đã có mùi chua là đã hỏng, hâm nóng lại cũng không an toàn.' },
        { q: 'Mua đồ ăn ở đâu thì yên tâm hơn?', a: 'Nơi sạch sẽ, có địa chỉ rõ ràng', wrong: ['Xe đẩy không che đậy, đầy bụi', 'Chỗ nào rẻ nhất'], why: 'Nơi bán sạch sẽ, có che đậy và địa chỉ rõ ràng thì đồ ăn an toàn hơn.' },
        { q: 'Con được cho tiền ăn quà. Lựa chọn nào tốt nhất?', a: 'Sữa hoặc trái cây', wrong: ['Que cay không nhãn mác', 'Nước màu đựng trong túi ni lông'], why: 'Sữa và trái cây rõ nguồn gốc vừa ngon vừa tốt cho sức khoẻ.', pic: '🍌' }
      ] }
    ]
  };
})(window);
