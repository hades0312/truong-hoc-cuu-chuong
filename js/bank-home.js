/* bank-home.js: Kỹ năng sống ở nhà và ở làng quê — nối thêm chủ đề vào TT.bank.life (bank-life.js).
 * Mỗi chủ đề gắn với một nơi trong cảnh "Nhà em" và do một người trong gia đình hướng dẫn:
 *   gian bếp (mẹ): phòng cháy chữa cháy · ao cá, bờ sông (bố): phòng tránh đuối nước, mưa bão sấm sét
 *   hiên nhà (bà, ông): an toàn ở nhà, gia đình em · chuồng trại (bà): vật nuôi · vườn rau (ông): vườn nhà, đồng quê.
 * Nội dung theo các khuyến cáo phổ biến cho học sinh tiểu học (thoát hiểm khi cháy, số khẩn cấp 111/113/114/115,
 * phòng đuối nước, an toàn điện…). Thầy cô, ba mẹ thấy câu nào chưa hợp thì sửa ngay trong file này. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  if (!TT.bank || !TT.bank.life) return;

  var TOPICS = [
    { id: 'pccc', name: 'Phòng cháy chữa cháy', icon: '🔥', teacher: 'me', tname: 'Mẹ', items: [
      { q: 'Số điện thoại nào để báo cháy?', a: '114', wrong: ['113', '115'], why: '114 là số của lực lượng cứu hoả, cứu nạn cứu hộ. Gọi 114 không mất tiền.', hint: 'Số của xe cứu hoả màu đỏ.', pic: '🚒' },
      { q: 'Phát hiện có cháy trong nhà, việc đầu tiên con làm là gì?', a: 'Hô to "Cháy! Cháy!" và chạy ra nơi an toàn', wrong: ['Tìm chỗ trốn thật kín trong tủ quần áo, chờ lửa tắt', 'Chạy đi lấy cặp sách'], why: 'Hô to để mọi người cùng biết, rồi thoát ngay ra chỗ an toàn. Đồ đạc không quý bằng tính mạng.' },
      { q: 'Khi gọi 114, con cần nói rõ điều gì?', a: 'Địa chỉ nơi cháy và đang cháy cái gì', wrong: ['Chỉ kêu "Cháy rồi, cứu với!" rồi cúp máy ngay', 'Kể chuyện ở lớp hôm nay'], why: 'Các chú cứu hoả cần biết cháy ở đâu, cháy cái gì thì mới tới nhanh được. Nói chậm, rõ và trả lời các câu hỏi.', pic: '📞' },
      { q: 'Phải đi qua chỗ có khói, con di chuyển thế nào?', a: 'Cúi thấp người hoặc bò sát sàn', wrong: ['Đứng thẳng người và chạy thật nhanh qua', 'Nhảy lên cao để thở'], why: 'Khói nóng và khí độc bốc lên cao. Càng sát sàn nhà, không khí càng dễ thở.', hint: 'Khói bay lên trên hay chìm xuống dưới?' },
      { q: 'Khi thoát qua khói, con lấy gì che mũi và miệng?', a: 'Khăn ướt', wrong: ['Túi ni lông', 'Tờ giấy khô'], why: 'Khăn ướt giúp lọc bớt khói và khí độc. Không trùm túi ni lông vì sẽ bị ngạt.' },
      { q: 'Quần áo đang mặc bị bắt lửa. Con làm gì?', a: 'Dừng lại, nằm xuống, lăn qua lăn lại', wrong: ['Chạy thật nhanh ra sân cho gió thổi tắt lửa', 'Lấy tay phủi lửa'], why: 'Chạy làm lửa cháy to hơn. Nằm xuống và lăn để dập lửa, lấy tay che mặt.', hint: 'Ba bước: dừng lại, nằm xuống, rồi…' },
      { q: 'Nhà cao tầng có cháy, con xuống bằng đường nào?', a: 'Cầu thang bộ', wrong: ['Thang máy', 'Trèo ra ngoài cửa sổ'], why: 'Khi cháy, thang máy có thể mất điện, kẹt lại và đầy khói. Luôn đi cầu thang bộ.' },
      { q: 'Đã thoát ra ngoài nhưng con để quên món đồ chơi yêu thích trong nhà đang cháy. Con làm gì?', a: 'Ở yên bên ngoài, không quay lại', wrong: ['Chạy vào lấy thật nhanh rồi ra ngay', 'Nhờ bạn vào lấy giúp'], why: 'Tuyệt đối không quay lại nơi đang cháy. Lửa và khói lan rất nhanh.' },
      { q: 'Khi có cháy, việc nào tuyệt đối KHÔNG làm?', a: 'Trốn trong tủ hoặc gầm giường', wrong: ['Chạy ra khỏi nhà', 'Hô to gọi người lớn'], why: 'Trốn trong tủ, gầm giường thì khói vẫn vào được mà các chú cứu hoả lại khó tìm thấy con.' },
      { q: 'Lúc có cháy, trước khi mở một cánh cửa đang đóng, con nên làm gì?', a: 'Sờ thử xem cửa có nóng không', wrong: ['Mở toang cửa ra ngay để chạy cho nhanh', 'Đạp thật mạnh vào cửa'], why: 'Sờ nhẹ bằng mu bàn tay. Cửa nóng nghĩa là lửa đang ở phía bên kia. Khi đó không mở, tìm lối khác.' },
      { q: 'Con bị kẹt trong phòng, bên ngoài cửa đầy khói. Con làm gì?', a: 'Đóng cửa, chèn khăn ướt vào khe cửa, ra cửa sổ kêu cứu', wrong: ['Mở cửa cho khói bay vào', 'Chui vào tủ ngồi im'], why: 'Chèn khe cửa để khói không vào. Ra cửa sổ hoặc ban công vẫy khăn, kêu to để mọi người biết con ở đâu.' },
      { q: 'Chảo dầu mỡ trên bếp bốc cháy. Người lớn nên làm gì?', a: 'Tắt bếp, lấy vung úp kín lên chảo', wrong: ['Đổ ngay một gáo nước lạnh vào chảo', 'Lấy quạt thổi cho tắt'], why: 'Đổ nước vào dầu đang cháy làm dầu bắn tung toé, lửa bùng to hơn. Úp vung để lửa hết không khí thì tắt.' },
      { q: 'Ổ cắm điện bị chập, bốc cháy. Việc đầu tiên người lớn làm là gì?', a: 'Ngắt cầu dao điện', wrong: ['Tạt nước vào ổ cắm', 'Lấy tay rút dây điện ra'], why: 'Phải ngắt điện trước. Nước dẫn điện, tạt nước vào sẽ bị điện giật.', pic: '⚡' },
      { q: 'Vào bếp con ngửi thấy mùi ga. Con làm gì?', a: 'Không bật điện, bật lửa; mở cửa và báo người lớn', wrong: ['Bật quạt điện cho bay mùi', 'Bật bếp lên xem có cháy không'], why: 'Một tia lửa nhỏ từ công tắc điện cũng có thể làm ga phát nổ. Mở cửa cho thoáng và báo ngay người lớn.' },
      { q: 'Diêm và bật lửa là gì đối với trẻ em?', a: 'Đồ của người lớn, trẻ em không nghịch', wrong: ['Đồ chơi rất vui', 'Đồ để mang đến lớp khoe với các bạn cho vui'], why: 'Nghịch diêm, bật lửa là nguyên nhân của rất nhiều vụ cháy. Thấy diêm, bật lửa thì đưa cho người lớn cất.' },
      { q: 'Sạc điện thoại thế nào là an toàn?', a: 'Sạc trên mặt bàn thoáng, đầy pin thì rút ra', wrong: ['Cắm sạc rồi để dưới gối, dưới chăn suốt cả đêm', 'Vừa sạc vừa ôm máy đi ngủ'], why: 'Khi sạc, pin nóng lên. Để dưới gối, dưới chăn thì nhiệt không thoát được, dễ gây cháy.', pic: '🔌' },
      { q: 'Thắp hương, đốt vàng mã cần chú ý điều gì?', a: 'Có người lớn trông cho tới khi tàn hẳn', wrong: ['Đốt xong đi chơi ngay', 'Đốt ngay cạnh rèm cửa cho kín gió, đỡ tạt lửa'], why: 'Tàn lửa bay vào rèm, giấy, quần áo rất dễ gây cháy. Phải trông cho tới khi lửa tắt hẳn.' },
      { q: 'Nấu ăn xong, người lớn cần làm gì?', a: 'Tắt bếp và khoá van ga', wrong: ['Để lửa nhỏ cho ấm bếp', 'Để nồi trên bếp đang bật rồi đi ngủ'], why: 'Quên tắt bếp, quên khoá ga là nguyên nhân gây cháy nổ thường gặp.' },
      { q: 'Thứ nào KHÔNG được để gần bếp lửa?', a: 'Chai xăng, giấy, vải', wrong: ['Nồi nhôm', 'Chảo gang'], why: 'Xăng dầu, giấy, vải rất dễ bắt lửa. Phải để xa bếp.' },
      { q: 'Gần cây rơm, đống lá khô, con cần nhớ điều gì?', a: 'Không nghịch lửa, không đốt pháo gần đó', wrong: ['Đó là chỗ nướng khoai, nướng ngô lý tưởng nhất', 'Đốt lên cho ấm khi trời lạnh'], why: 'Rơm và lá khô bén lửa rất nhanh, gió thổi là lửa lan sang nhà và chuồng trại.', pic: '🌾' },
      { q: 'Dùng ổ cắm điện thế nào cho an toàn?', a: 'Không cắm quá nhiều thiết bị vào một ổ', wrong: ['Cắm thật nhiều ổ nối dài chồng lên nhau cho tiện', 'Vẫn dùng khi phích lỏng, toé lửa'], why: 'Cắm quá nhiều thiết bị làm ổ cắm và dây điện nóng lên, dễ chập cháy.' },
      { q: 'Bình chữa cháy trong nhà dùng khi nào?', a: 'Khi đám cháy mới bắt đầu, còn nhỏ', wrong: ['Khi muốn tưới cây', 'Khi lửa đã cháy to cả căn nhà'], why: 'Bình chữa cháy chỉ dập được đám cháy nhỏ. Lửa to thì mọi người phải chạy ra ngoài và gọi 114.', pic: '🧯' },
      { q: 'Cả nhà nên chuẩn bị gì để thoát hiểm khi có cháy?', a: 'Biết lối thoát và hẹn sẵn một chỗ tập trung ngoài nhà', wrong: ['Khoá hết các cửa bằng nhiều ổ khoá', 'Để đồ chắn kín lối cầu thang'], why: 'Lối thoát phải luôn thông thoáng. Hẹn sẵn chỗ tập trung để biết ngay mọi người đã ra đủ chưa.' },
      { q: 'Bị bỏng nhẹ do lửa hoặc nước sôi, việc đầu tiên cần làm là gì?', a: 'Xả nước mát sạch lên chỗ bỏng khoảng 15 đến 20 phút', wrong: ['Bôi kem đánh răng', 'Chườm đá lạnh thẳng lên vết bỏng'], why: 'Nước mát làm dịu và giảm tổn thương. Không bôi kem đánh răng, nước mắm, không chườm đá. Sau đó báo người lớn.', hint: 'Dùng thứ có sẵn ở vòi nước.' },
      { q: 'Có được gọi 114 để trêu đùa không?', a: 'Không, vì làm chậm việc cứu người thật', wrong: ['Được, vì gọi không mất tiền và các chú rất vui tính', 'Được, nếu gọi thật nhanh'], why: 'Số khẩn cấp chỉ dùng khi có việc thật. Gọi trêu đùa có thể khiến người đang gặp nạn không được cứu kịp.' },
      { q: 'Trước khi cả nhà đi ngủ hoặc ra khỏi nhà, cần kiểm tra gì?', a: 'Tắt bếp và các thiết bị điện không dùng', wrong: ['Bật hết đèn cho sáng', 'Cắm sẵn bàn là cho nóng để sáng mai dùng luôn'], why: 'Tắt bếp, rút bàn là, tắt thiết bị điện không dùng giúp phòng cháy khi không có ai trông.' }
    ] },

    { id: 'duoinuoc', name: 'Phòng tránh đuối nước', icon: '🛟', teacher: 'bo', tname: 'Bố', items: [
      { q: 'Trời nóng, các bạn rủ con ra sông tắm mà không có người lớn. Con làm gì?', a: 'Từ chối và khuyên các bạn không đi', wrong: ['Đi cùng nhưng chỉ tắm gần bờ', 'Đi cùng vì con cũng biết bơi được một chút rồi'], why: 'Sông, ao, hồ có chỗ sâu và nước xoáy không nhìn thấy được. Không có người lớn thì không xuống nước.' },
      { q: 'Con chỉ được xuống nước bơi khi nào?', a: 'Có người lớn biết bơi đi cùng, ở nơi được phép bơi', wrong: ['Khi có nhiều bạn cùng đi', 'Khi trời thật nóng'], why: 'Phải có người lớn biết bơi trông và chỉ bơi ở nơi an toàn, được phép.', pic: '🏊' },
      { q: 'Thấy bạn bị ngã xuống ao, con làm gì?', a: 'Hô to gọi người lớn, ném phao hoặc đưa sào cho bạn bám', wrong: ['Nhảy ngay xuống cứu bạn', 'Chạy về nhà trốn'], why: 'Trẻ em nhảy xuống cứu rất dễ bị đuối theo. Hãy kêu cứu thật to và ném vật nổi cho bạn.', hint: 'Con cứu bạn từ trên bờ.' },
      { q: 'Vật nào có thể ném cho người đang chới với dưới nước?', a: 'Phao, can nhựa rỗng đậy kín nắp', wrong: ['Hòn gạch', 'Cái xẻng sắt'], why: 'Phao, can nhựa rỗng đậy kín, khúc gỗ đều nổi trên nước, giúp người gặp nạn bám vào.', pic: '🛟' },
      { q: 'Đi thuyền, đi đò, con cần làm gì?', a: 'Mặc áo phao và ngồi yên', wrong: ['Đứng lên cho mát', 'Thò tay xuống nghịch nước'], why: 'Áo phao giữ con nổi nếu chẳng may thuyền lật. Ngồi yên để thuyền không chòng chành.' },
      { q: 'Quả bóng của con rơi xuống ao. Con làm gì?', a: 'Gọi người lớn lấy giúp', wrong: ['Với tay cố vớt', 'Lội xuống lấy vì bóng ở gần bờ'], why: 'Mép ao trơn, với tay rất dễ ngã. Ao gần bờ vẫn có thể sâu.' },
      { q: 'Vì sao không chơi sát mép ao, bờ sông?', a: 'Đất trơn, dễ trượt chân ngã xuống chỗ sâu', wrong: ['Vì nước ở đó lạnh', 'Vì ở đó có nhiều cá'], why: 'Bờ ao, bờ sông trơn và dễ sạt. Trượt chân là rơi ngay xuống chỗ nước sâu.' },
      { q: 'Mùa mưa lũ, nước chảy xiết tràn qua đường. Con làm gì?', a: 'Không lội qua, chờ người lớn', wrong: ['Lội thật nhanh cho kịp giờ', 'Nắm chặt tay bạn rồi cùng lội qua cho chắc'], why: 'Nước chảy xiết có thể cuốn trôi cả người lớn. Tuyệt đối không lội qua.' },
      { q: 'Giếng, bể nước, chum vại ở nhà cần được làm gì?', a: 'Đậy nắp chắc chắn', wrong: ['Để mở cho mát', 'Bắc ghế cho em bé nhìn xuống'], why: 'Đậy nắp chắc chắn để trẻ nhỏ không ngã xuống và nước được sạch.' },
      { q: 'Trước khi xuống nước bơi, con cần làm gì?', a: 'Khởi động kĩ', wrong: ['Ăn thật no', 'Uống thật nhiều nước đá'], why: 'Khởi động giúp cơ thể làm quen, tránh bị chuột rút khi bơi.' },
      { q: 'Đang bơi thì bị chuột rút. Con làm gì?', a: 'Bình tĩnh, thả nổi người và gọi người giúp', wrong: ['Vùng vẫy thật mạnh', 'Lặn xuống dưới'], why: 'Vùng vẫy làm con mau mệt và chìm nhanh. Bình tĩnh thả nổi, kêu cứu.' },
      { q: 'Cách tốt nhất để phòng đuối nước là gì?', a: 'Học bơi và học kĩ năng an toàn dưới nước', wrong: ['Tập chạy thật nhanh', 'Tập nhịn thở thật lâu'], why: 'Biết bơi và biết cách giữ an toàn giúp con tự bảo vệ mình. Dù biết bơi vẫn phải có người lớn đi cùng.' },
      { q: 'Nơi nào con KHÔNG được xuống bơi?', a: 'Ao hồ, sông suối có biển báo nguy hiểm', wrong: ['Bể bơi có cứu hộ', 'Bể bơi trẻ em có người lớn trông'], why: 'Biển báo nguy hiểm cho biết nơi đó nước sâu, có xoáy hoặc từng có tai nạn.', pic: '⚠️' },
      { q: 'Gần đường có một hố nước sâu do đào đất. Con làm gì?', a: 'Tránh xa, không chơi gần', wrong: ['Ra mép hố thả thuyền giấy cho nó trôi', 'Xuống tắm vì nước trong'], why: 'Hố nước ở công trình, hố đào thường rất sâu, thành hố dễ sạt.' },
      { q: 'Khi chơi dưới nước, trò nào nguy hiểm?', a: 'Dìm bạn xuống nước', wrong: ['Tập thở theo thầy dạy bơi', 'Bơi cùng người lớn'], why: 'Dìm nhau, xô đẩy nhau dưới nước có thể làm bạn sặc nước và đuối.' },
      { q: 'Em bé đang chơi cạnh một xô nước đầy. Điều nào đúng?', a: 'Phải có người lớn trông, xô nước cũng nguy hiểm', wrong: ['Không sao vì nước nông', 'Cứ để em tự chơi'], why: 'Trẻ nhỏ có thể đuối nước ngay trong xô, chậu nước. Dùng xong nên đổ nước đi hoặc đậy lại.' },
      { q: 'Đang bơi thì trời nổi giông, có sấm chớp. Con làm gì?', a: 'Lên bờ ngay và vào chỗ trú an toàn', wrong: ['Bơi thêm một lúc nữa vì mưa chưa tới nơi', 'Lặn xuống cho đỡ sợ'], why: 'Sét rất nguy hiểm khi đang ở dưới nước. Phải lên bờ ngay.', pic: '⛈️' },
      { q: 'Người bị đuối nước đã được đưa lên bờ, cần xe cấp cứu. Gọi số nào?', a: '115', wrong: ['111', '113'], why: '115 là số cấp cứu y tế.', hint: 'Số của xe cứu thương.', pic: '🚑' },
      { q: 'Bơi xong lên bờ, con thấy lạnh run. Con làm gì?', a: 'Lau khô người và mặc ấm', wrong: ['Xuống bơi tiếp cho ấm', 'Ngồi trước quạt cho khô'], why: 'Lau khô, mặc ấm để cơ thể không bị nhiễm lạnh.' }
    ] },

    { id: 'antoannha', name: 'An toàn ở nhà', icon: '🏠', teacher: 'ba', tname: 'Bà', items: [
      { q: 'Tay đang ướt, con có được cắm phích điện không?', a: 'Không, phải lau khô tay trước', wrong: ['Được, nếu cắm thật nhanh rồi rút tay ra ngay', 'Được, nếu đi dép'], why: 'Nước dẫn điện. Tay ướt chạm vào phích cắm, ổ điện rất dễ bị điện giật.', pic: '⚡' },
      { q: 'Việc nào tuyệt đối không làm với ổ điện?', a: 'Chọc que, đinh hay ngón tay vào', wrong: ['Nhờ người lớn cắm giúp', 'Che ổ điện bằng nắp an toàn'], why: 'Chọc vật gì vào ổ điện cũng có thể bị điện giật, rất nguy hiểm.' },
      { q: 'Sau cơn bão, con thấy dây điện đứt rơi xuống sân. Con làm gì?', a: 'Tránh thật xa và báo người lớn', wrong: ['Nhặt lên cho gọn', 'Lấy que gạt sợi dây ra chỗ khác cho gọn'], why: 'Dây điện đứt có thể vẫn còn điện. Đứng gần cũng nguy hiểm, nhất là khi sân ướt.' },
      { q: 'Thấy một người bị điện giật, con làm gì?', a: 'Không chạm vào người đó, gọi ngay người lớn ngắt cầu dao', wrong: ['Chạy tới kéo tay người đó ra', 'Tạt nước vào'], why: 'Chạm vào người đang bị điện giật thì con cũng bị giật theo. Phải ngắt điện trước.' },
      { q: 'Thả diều ở đâu là an toàn?', a: 'Bãi rộng, xa đường dây điện', wrong: ['Dưới đường dây điện', 'Trên mái nhà'], why: 'Diều vướng vào dây điện có thể gây điện giật. Diều mắc trên dây thì không tự gỡ, báo người lớn.', pic: '🪁' },
      { q: 'Con thấy một lọ thuốc có những viên nhiều màu như kẹo. Con làm gì?', a: 'Không ăn, không uống; đưa cho người lớn', wrong: ['Ăn thử một viên', 'Chia cho em mỗi đứa một viên ăn thử cho vui'], why: 'Thuốc uống nhầm có thể gây ngộ độc. Con chỉ uống thuốc khi người lớn đưa.', pic: '💊' },
      { q: 'Trong bếp có một chai không nhãn đựng nước lạ. Con làm gì?', a: 'Không uống, không ngửi; hỏi người lớn', wrong: ['Uống thử một ngụm', 'Đổ một ít ra tay rồi nếm thử xem là gì'], why: 'Chai không nhãn có thể đựng xăng dầu, nước tẩy rửa hoặc thuốc trừ sâu.' },
      { q: 'Nhà có cất thuốc trừ sâu, thuốc diệt cỏ. Con cần nhớ gì?', a: 'Không chạm vào, tránh xa chỗ cất', wrong: ['Lấy ra xem cho biết', 'Rửa vỏ chai thật sạch để đựng nước uống'], why: 'Thuốc trừ sâu, thuốc diệt cỏ rất độc. Vỏ chai cũng không được dùng lại để đựng đồ ăn, nước uống.' },
      { q: 'Con muốn rót nước sôi từ phích. Con nên làm gì?', a: 'Nhờ người lớn rót giúp', wrong: ['Tự bê phích lên rót', 'Trèo lên ghế để với phích'], why: 'Phích nước sôi nặng và dễ đổ, có thể gây bỏng nặng.' },
      { q: 'Đưa kéo cho bạn thế nào là đúng?', a: 'Khép lưỡi kéo, quay tay cầm về phía bạn', wrong: ['Chĩa mũi kéo về phía bạn', 'Tung kéo cho bạn bắt'], why: 'Quay tay cầm về phía bạn để lưỡi kéo không làm ai bị thương.', pic: '✂️' },
      { q: 'Con ở nhà một mình. Người lạ gõ cửa nói là bạn của bố. Con làm gì?', a: 'Không mở cửa, gọi điện cho bố mẹ', wrong: ['Mở cửa mời vào nhà', 'Mở hé cửa ra nói chuyện xem có đúng không'], why: 'Không mở cửa cho người lạ khi ở nhà một mình, dù họ nói quen bố mẹ. Hãy gọi cho bố mẹ.' },
      { q: 'Người lạ gọi điện hỏi "Nhà cháu có ai ở nhà không?". Con trả lời thế nào?', a: 'Nói bố mẹ đang bận, rồi báo lại cho bố mẹ', wrong: ['Nói thật là con ở nhà một mình', 'Đọc địa chỉ nhà cho họ'], why: 'Không cho người lạ biết con ở nhà một mình và không đọc địa chỉ nhà.' },
      { q: 'Việc nào nguy hiểm khi ở ban công, cửa sổ?', a: 'Trèo lên lan can', wrong: ['Đứng xa lan can ngắm cảnh', 'Nhờ người lớn lấy đồ rơi'], why: 'Trèo lên lan can, cửa sổ rất dễ ngã từ trên cao xuống.' },
      { q: 'Sàn nhà vừa lau còn ướt. Con đi thế nào?', a: 'Đi chậm, hoặc chờ sàn khô', wrong: ['Chạy thật nhanh qua cho khỏi ướt chân', 'Trượt chơi cho vui'], why: 'Sàn ướt rất trơn, chạy nhảy dễ ngã đập đầu.' },
      { q: 'Con bị đứt tay chảy máu. Con làm gì?', a: 'Báo người lớn để rửa sạch và băng lại', wrong: ['Giấu đi vì sợ bị mắng', 'Lấy đất hoặc tro bếp rắc lên cho cầm máu'], why: 'Vết thương cần được rửa sạch và băng lại để không bị nhiễm trùng.', pic: '🩹' },
      { q: 'Thấy tổ ong trên cây trong vườn, con làm gì?', a: 'Tránh xa, không chọc phá', wrong: ['Lấy que chọc cho ong bay ra', 'Ném đá vào tổ'], why: 'Ong bị chọc phá sẽ bay ra đốt. Bị nhiều ong đốt rất nguy hiểm.', pic: '🐝' },
      { q: 'Gặp rắn trong vườn, con làm gì?', a: 'Đứng yên rồi từ từ lùi ra xa, gọi người lớn', wrong: ['Lấy que đánh', 'Bắt lên xem'], why: 'Rắn thường chỉ cắn khi bị trêu chọc. Bình tĩnh lùi ra xa và báo người lớn.', pic: '🐍' },
      { q: 'Bị chó cắn, việc cần làm ngay là gì?', a: 'Rửa vết thương bằng xà phòng 15 phút, báo người lớn', wrong: ['Giấu đi vì vết cắn nhỏ', 'Lấy lá cây đắp lên rồi thôi'], why: 'Rửa kĩ bằng xà phòng dưới vòi nước rồi báo người lớn để đi tiêm phòng bệnh dại.' },
      { q: 'Gặp con chó lạ đang gầm gừ, con làm gì?', a: 'Đứng yên, không nhìn thẳng vào mắt nó, từ từ lùi ra', wrong: ['Quay lưng chạy thật nhanh', 'Hét to và ném đá'], why: 'Chạy hoặc la hét làm chó đuổi theo. Bình tĩnh, lùi dần ra xa.', pic: '🐕' },
      { q: 'Viên bi, hạt nhựa nhỏ… con cần nhớ điều gì?', a: 'Không ngậm vào miệng, để xa em bé', wrong: ['Ngậm trong miệng cho khỏi rơi mất khi chạy chơi', 'Cho em bé cầm chơi'], why: 'Vật nhỏ ngậm trong miệng dễ rơi vào họng gây hóc, ngạt thở.' },
      { q: 'Có người đụng chạm làm con khó chịu và bảo con giữ bí mật. Con làm gì?', a: 'Nói "Không!", bỏ đi và kể ngay với bố mẹ hoặc thầy cô', wrong: ['Giữ bí mật như đã hứa', 'Im lặng vì sợ'], why: 'Cơ thể con là của con. Bí mật làm con sợ hay khó chịu thì phải kể với người lớn con tin tưởng.' },
      { q: 'Số 111 là số điện thoại của ai?', a: 'Tổng đài quốc gia bảo vệ trẻ em', wrong: ['Xe cứu hoả', 'Bưu điện'], why: 'Trẻ em cần giúp đỡ, bị bắt nạt hay bị làm hại có thể gọi 111 bất cứ lúc nào, không mất tiền.', pic: '📞' },
      { q: 'Con muốn sang nhà bạn chơi. Con cần làm gì trước?', a: 'Xin phép và nói rõ đi đâu, với ai, khi nào về', wrong: ['Cứ đi, lát về kể sau', 'Nhờ em nói lại với bố mẹ'], why: 'Bố mẹ cần biết con ở đâu để yên tâm và tìm được con khi cần.' },
      { q: 'Con bị lạc bố mẹ ở chợ. Con làm gì?', a: 'Đứng yên một chỗ, nhờ chú bảo vệ hoặc cô bán hàng gọi bố mẹ', wrong: ['Đi theo người lạ rủ đưa về', 'Chạy đi khắp nơi để tìm'], why: 'Đứng yên để bố mẹ dễ tìm thấy. Con nên thuộc số điện thoại của bố mẹ.' },
      { q: 'Túi ni lông dùng để đựng đồ. Trò nào với túi ni lông rất nguy hiểm?', a: 'Trùm túi lên đầu', wrong: ['Gấp túi cất gọn', 'Dùng túi đựng rác'], why: 'Trùm túi ni lông lên đầu làm con không thở được.' }
    ] },

    { id: 'vatnuoi', name: 'Vật nuôi trong nhà', icon: '🐔', teacher: 'ba', tname: 'Bà', items: [
      { q: 'Nhóm nào toàn là gia cầm?', a: 'Gà, vịt, ngan, ngỗng', wrong: ['Trâu, bò, lợn', 'Chó, mèo, thỏ'], why: 'Gia cầm là vật nuôi có hai chân, có cánh và lông vũ như gà, vịt, ngan, ngỗng.', pic: '🐔' },
      { q: 'Nhóm nào toàn là gia súc?', a: 'Trâu, bò, lợn', wrong: ['Gà, vịt, ngan', 'Cá chép, cá trắm'], why: 'Gia súc là vật nuôi có bốn chân như trâu, bò, lợn, dê.', pic: '🐄' },
      { q: 'Gà mẹ ấp trứng khoảng bao nhiêu ngày thì gà con nở?', a: 'Khoảng 21 ngày', wrong: ['Khoảng 7 ngày', 'Khoảng 60 ngày'], why: 'Trứng gà được ấp ấm khoảng 21 ngày thì nở thành gà con.', hint: 'Khoảng ba tuần.', pic: '🐣' },
      { q: 'Nhà nông nuôi gà để làm gì?', a: 'Lấy trứng và thịt', wrong: ['Để kéo cày', 'Để trông nhà'], why: 'Gà cho trứng và thịt, là nguồn chất đạm cho bữa ăn.' },
      { q: 'Con vật nào giúp bác nông dân kéo cày?', a: 'Con trâu', wrong: ['Con lợn', 'Con vịt'], why: 'Trâu khoẻ, kéo cày bừa giúp nhà nông. "Con trâu là đầu cơ nghiệp."', pic: '🐃' },
      { q: 'Sữa tươi con uống là từ con vật nào?', a: 'Bò sữa', wrong: ['Lợn', 'Gà'], why: 'Bò sữa cho sữa. Sữa được tiệt trùng rồi mới đóng hộp cho mình uống.', pic: '🥛' },
      { q: 'Vì sao vịt bơi giỏi?', a: 'Vì chân vịt có màng', wrong: ['Vì vịt có vây', 'Vì vịt nhẹ như bông'], why: 'Màng da giữa các ngón chân giúp vịt đạp nước như mái chèo.', pic: '🦆' },
      { q: 'Mèo nuôi trong nhà giúp việc gì?', a: 'Bắt chuột', wrong: ['Kéo cày', 'Đẻ trứng'], why: 'Mèo bắt chuột, bảo vệ thóc lúa trong nhà.', pic: '🐈' },
      { q: 'Chó nuôi trong nhà giúp việc gì?', a: 'Trông nhà', wrong: ['Cho sữa', 'Bắt sâu trong vườn'], why: 'Chó rất thính và trung thành, thấy người lạ là sủa báo cho chủ.' },
      { q: 'Cho gà vịt ăn hoặc chơi với chó mèo xong, con cần làm gì?', a: 'Rửa tay bằng xà phòng', wrong: ['Lau tay vào áo', 'Đi ăn cơm luôn vì tay trông vẫn sạch'], why: 'Lông và phân vật nuôi mang nhiều vi khuẩn. Rửa tay bằng xà phòng để phòng bệnh.' },
      { q: 'Con thấy mấy con gà chết trong vườn không rõ vì sao. Con làm gì?', a: 'Không chạm vào, báo ngay người lớn', wrong: ['Nhặt lên xem', 'Mang vào bếp để bà nấu cho khỏi phí'], why: 'Gia cầm ốm chết có thể mang bệnh lây sang người như cúm gia cầm. Không chạm vào, không ăn.' },
      { q: 'Chó, mèo nuôi trong nhà cần được làm gì để phòng bệnh dại?', a: 'Tiêm phòng', wrong: ['Tắm bằng nước nóng', 'Cho ăn thật nhiều'], why: 'Bệnh dại rất nguy hiểm. Chó, mèo phải được tiêm phòng dại đầy đủ.', pic: '💉' },
      { q: 'Khi chó đang ăn hoặc đang ngủ, con nên làm gì?', a: 'Để yên, không trêu chọc', wrong: ['Giật bát cơm của nó', 'Kéo đuôi cho nó dậy chơi với mình'], why: 'Chó đang ăn, đang ngủ hay đang nuôi con rất dễ cắn nếu bị trêu.' },
      { q: 'Lại gần trâu bò, con KHÔNG nên đứng ở đâu?', a: 'Sát ngay phía sau chân nó', wrong: ['Bên cạnh người lớn', 'Ở xa phía trước'], why: 'Trâu bò giật mình có thể đá hậu rất mạnh. Không đứng sát phía sau.' },
      { q: 'Trứng gà, trứng vịt nên ăn thế nào?', a: 'Nấu chín', wrong: ['Ăn sống cho bổ', 'Để thật lâu rồi ăn'], why: 'Trứng sống có thể có vi khuẩn gây đau bụng. Nấu chín mới an toàn.', pic: '🥚' },
      { q: 'Chuồng gà, chuồng lợn cần được làm gì?', a: 'Dọn sạch thường xuyên', wrong: ['Để bẩn cho ấm', 'Đóng kín không cho thoáng'], why: 'Chuồng sạch, thoáng thì vật nuôi khoẻ, ít bệnh và không gây mùi.' },
      { q: 'Thức ăn chính của trâu bò là gì?', a: 'Cỏ và rơm', wrong: ['Thịt và cá', 'Sâu bọ'], why: 'Trâu bò là động vật ăn cỏ. Mùa khô không có cỏ tươi thì ăn rơm.', pic: '🌾' },
      { q: 'Cá trong ao thở bằng gì?', a: 'Mang', wrong: ['Phổi', 'Mũi'], why: 'Cá thở bằng mang, lấy khí ô-xi hoà tan trong nước.', pic: '🐟' },
      { q: 'Việc nào thể hiện con yêu quý vật nuôi?', a: 'Cho ăn uống đủ, không đánh đập', wrong: ['Ném đá cho nó chạy', 'Buộc lon vào đuôi cho vui'], why: 'Vật nuôi cũng biết đau, biết sợ. Chăm sóc tốt thì chúng khoẻ mạnh và gắn bó với mình.' }
    ] },

    { id: 'vuonnha', name: 'Vườn nhà, đồng quê', icon: '🥬', teacher: 'ong', tname: 'Ông', items: [
      { q: 'Cây cần những gì để sống và lớn lên?', a: 'Nước, ánh sáng, không khí và chất khoáng', wrong: ['Chỉ cần đất', 'Chỉ cần nước'], why: 'Thiếu một trong các thứ đó, cây sẽ còi cọc hoặc chết.', pic: '🌱' },
      { q: 'Hạt gạo mình ăn hằng ngày là từ cây nào?', a: 'Cây lúa', wrong: ['Cây ngô', 'Cây khoai'], why: 'Hạt lúa gọi là thóc; xay bỏ vỏ trấu thì được hạt gạo.', pic: '🌾' },
      { q: 'Mình ăn bộ phận nào của cây cà rốt?', a: 'Rễ phình to thành củ', wrong: ['Lá', 'Hoa'], why: 'Củ cà rốt chính là rễ cây phình to, chứa chất dinh dưỡng.', pic: '🥕' },
      { q: 'Rau cải, rau muống, mình ăn phần nào của cây?', a: 'Lá và thân non', wrong: ['Rễ', 'Hạt'], why: 'Rau ăn lá cho nhiều vi-ta-min và chất xơ.', pic: '🥬' },
      { q: 'Tưới rau vào lúc nào là tốt nhất?', a: 'Sáng sớm hoặc chiều mát', wrong: ['Giữa trưa nắng gắt cho cây đỡ nóng', 'Nửa đêm'], why: 'Tưới lúc trời mát thì nước ít bốc hơi, cây hút được nhiều nước hơn.', pic: '💧' },
      { q: 'Con vật nào làm cho đất tơi xốp, giúp cây tốt hơn?', a: 'Giun đất', wrong: ['Châu chấu', 'Ốc sên'], why: 'Giun đất đào hang làm đất thoáng, phân giun còn làm đất thêm màu mỡ.', pic: '🪱' },
      { q: 'Ong và bướm giúp gì cho cây?', a: 'Thụ phấn cho hoa', wrong: ['Tưới nước cho cây', 'Ăn hết sâu bọ'], why: 'Ong bướm mang phấn hoa từ bông này sang bông khác, nhờ đó hoa kết thành quả.', pic: '🐝' },
      { q: 'Bù nhìn rơm ngoài ruộng để làm gì?', a: 'Đuổi chim ăn thóc', wrong: ['Trang trí cho cánh đồng thêm đẹp', 'Che nắng cho lúa'], why: 'Chim tưởng bù nhìn là người nên không dám sà xuống ăn thóc.' },
      { q: 'Thóc gặt về phải làm gì trước khi cất vào bồ?', a: 'Phơi thật khô', wrong: ['Ngâm vào nước', 'Để nguyên trong bao ướt'], why: 'Thóc còn ẩm sẽ bị mốc, nảy mầm. Phơi khô mới để được lâu.', pic: '☀️' },
      { q: 'Rau hái ngoài vườn về, trước khi nấu cần làm gì?', a: 'Rửa sạch nhiều lần dưới vòi nước', wrong: ['Nấu luôn cho tươi', 'Lau qua bằng khăn'], why: 'Rửa kĩ để sạch đất cát, trứng giun và bụi bẩn bám trên rau.' },
      { q: 'Ruộng rau vừa phun thuốc trừ sâu, có cắm biển cảnh báo. Con làm gì?', a: 'Không vào ruộng, không hái rau ăn', wrong: ['Hái ngay vì rau đang non', 'Vào chơi vì không có ai'], why: 'Thuốc trừ sâu rất độc. Phải chờ đủ số ngày quy định mới được thu hoạch.', pic: '⚠️' },
      { q: 'Mỗi cây chuối ra mấy buồng quả?', a: 'Một buồng', wrong: ['Ba buồng', 'Mỗi năm một buồng, ra mãi'], why: 'Mỗi cây chuối chỉ ra một buồng, sau đó cây mẹ tàn và cây con mọc lên thay.', pic: '🍌' },
      { q: 'Loại quả nào có nhiều vi-ta-min C?', a: 'Bưởi, cam', wrong: ['Dừa khô', 'Lạc'], why: 'Cam, chanh, bưởi, ổi rất giàu vi-ta-min C, giúp cơ thể khoẻ, ít ốm.', pic: '🍊' },
      { q: 'Lá rụng, vỏ rau củ có thể dùng làm gì cho vườn?', a: 'Ủ thành phân hữu cơ bón cây', wrong: ['Đốt cạnh cây rơm', 'Vứt xuống ao'], why: 'Rác hữu cơ ủ mục thành phân bón tốt cho cây, lại đỡ rác thải.', pic: '♻️' },
      { q: 'Trời nắng gắt, ra đồng con cần nhớ gì?', a: 'Đội nón mũ và uống đủ nước', wrong: ['Để đầu trần cho mát', 'Nhịn uống nước cho cơ thể quen dần với nắng'], why: 'Nắng gắt dễ làm con say nắng. Đội nón mũ, uống đủ nước và nghỉ ở chỗ râm.', pic: '👒' },
      { q: 'Con ếch có ích gì cho ruộng lúa?', a: 'Bắt sâu bọ hại lúa', wrong: ['Ăn hết lá lúa', 'Làm cạn nước ruộng'], why: 'Ếch nhái ăn sâu bọ, châu chấu, giúp bảo vệ lúa.', pic: '🐸' },
      { q: 'Trong chuỗi thức ăn "lúa → châu chấu → ếch", con ếch ăn gì?', a: 'Châu chấu', wrong: ['Lúa', 'Đất'], why: 'Mũi tên chỉ từ thức ăn tới con ăn nó: châu chấu ăn lúa, ếch ăn châu chấu.', hint: 'Nhìn xem mũi tên chỉ vào ếch đi ra từ đâu.' },
      { q: 'Hoa bưởi thường nở vào mùa nào?', a: 'Mùa xuân', wrong: ['Mùa hè', 'Mùa đông'], why: 'Ở miền Bắc và Bắc Trung Bộ, hoa bưởi nở vào mùa xuân, khoảng tháng Hai, tháng Ba.', pic: '🌸' }
    ] },

    { id: 'giadinh', name: 'Gia đình em', icon: '👨‍👩‍👧', teacher: 'ong', tname: 'Ông', items: [
      { q: 'Bố của bố, con gọi là gì?', a: 'Ông nội', wrong: ['Ông ngoại', 'Bác'], why: 'Bố mẹ của bố là ông bà nội. Bố mẹ của mẹ là ông bà ngoại.' },
      { q: 'Mẹ của mẹ, con gọi là gì?', a: 'Bà ngoại', wrong: ['Bà nội', 'Dì'], why: 'Bố mẹ của mẹ là ông bà ngoại.' },
      { q: 'Anh trai của bố, con gọi là gì?', a: 'Bác', wrong: ['Chú', 'Cậu'], why: 'Anh của bố gọi là bác, em trai của bố gọi là chú.' },
      { q: 'Em trai của bố, con gọi là gì?', a: 'Chú', wrong: ['Bác', 'Cậu'], why: 'Em trai của bố gọi là chú. Anh, em trai của mẹ gọi là cậu.' },
      { q: 'Em gái của mẹ, con gọi là gì?', a: 'Dì', wrong: ['Cô', 'Thím'], why: 'Em gái của mẹ gọi là dì. Em gái của bố gọi là cô.' },
      { q: 'Con trai, con gái của bác, chú, cô, cậu, dì là gì của con?', a: 'Anh chị em họ', wrong: ['Anh chị em ruột', 'Bạn cùng lớp'], why: 'Anh chị em ruột là cùng bố mẹ. Con của bác, chú, cô, cậu, dì là anh chị em họ.' },
      { q: 'Đi học về, gặp ông bà, con làm gì?', a: 'Khoanh tay chào "Cháu chào ông bà ạ!"', wrong: ['Đi thẳng vào phòng', 'Vứt cặp rồi chạy đi chơi'], why: 'Đi thưa về gửi là nếp nhà: đi đâu xin phép, về tới nhà chào hỏi người lớn.' },
      { q: 'Trước khi ăn cơm, con làm gì?', a: 'Mời ông bà, bố mẹ ăn cơm', wrong: ['Gắp ngay món mình thích', 'Bật ti vi lên rồi vừa ăn vừa xem hoạt hình'], why: 'Mời cơm là cách thể hiện sự kính trọng với người lớn trong nhà.', pic: '🍚' },
      { q: 'Ông bị mệt, đang nằm nghỉ. Con làm gì?', a: 'Đi nhẹ, nói khẽ, hỏi thăm và lấy nước cho ông', wrong: ['Mở nhạc thật to', 'Rủ bạn về nhà chạy nhảy'], why: 'Người ốm cần yên tĩnh. Một lời hỏi thăm, một cốc nước làm ông bà vui và mau khoẻ.' },
      { q: 'Việc nhà nào vừa sức với học sinh lớp 4?', a: 'Quét nhà, gấp quần áo, nhặt rau', wrong: ['Tự nấu bếp ga một mình', 'Bắc ghế trèo lên thay bóng điện bị cháy'], why: 'Con giúp việc vừa sức. Việc có lửa, có điện, phải trèo cao thì để người lớn làm.', pic: '🧹' },
      { q: 'Con lỡ tay làm vỡ cái bát. Con làm gì?', a: 'Nhận lỗi, xin lỗi và gọi người lớn dọn mảnh vỡ', wrong: ['Giấu mảnh vỡ đi', 'Đổ lỗi cho em'], why: 'Thật thà nhận lỗi là dũng cảm. Mảnh vỡ sắc, để người lớn dọn kẻo đứt tay.' },
      { q: 'Bố mẹ đi làm về mệt. Con làm gì?', a: 'Lấy nước mời bố mẹ, giúp việc vừa sức', wrong: ['Đòi bố mẹ dẫn đi chơi và mua quà ngay lập tức', 'Kêu đói thật to'], why: 'Bố mẹ làm việc vất vả để chăm lo cho con. Quan tâm tới bố mẹ là cách con thể hiện tình yêu thương.' },
      { q: 'Mẹ đang bận nấu cơm, em bé quấy khóc. Con làm gì?', a: 'Dỗ em, chơi cùng em', wrong: ['Mặc kệ em khóc', 'Quát thật to để em sợ mà nín khóc'], why: 'Anh chị lớn nhường nhịn, chăm sóc em nhỏ, giúp bố mẹ đỡ vất vả.', pic: '👶' },
      { q: 'Ông bà cho quà. Con nhận thế nào?', a: 'Nhận bằng hai tay và nói "Cháu cảm ơn ông bà ạ"', wrong: ['Giật lấy rồi chạy đi', 'Chê quà không đẹp'], why: 'Nhận bằng hai tay và nói lời cảm ơn là phép lịch sự.', pic: '🎁' },
      { q: 'Người lớn đang nói chuyện, con muốn nói một điều. Con làm gì?', a: 'Chờ người lớn nói xong rồi xin phép nói', wrong: ['Nói chen vào thật to', 'Kéo áo, giậm chân đòi nói ngay'], why: 'Không nói leo, không ngắt lời người khác. Việc gấp thì xin phép: "Con xin phép nói ạ."' },
      { q: 'Vì sao con cần kính trọng, yêu thương ông bà?', a: 'Vì ông bà sinh ra và nuôi dạy bố mẹ, rất thương con cháu', wrong: ['Vì ông bà hay cho quà', 'Vì sợ bị mắng'], why: 'Có ông bà mới có bố mẹ, có bố mẹ mới có con. Đó là đạo lí "uống nước nhớ nguồn".' }
    ] },

    { id: 'thientai', name: 'Mưa bão, sấm sét', icon: '⛈️', teacher: 'bo', tname: 'Bố', items: [
      { q: 'Đang ở ngoài đồng thì trời nổi giông, có sấm sét. Con làm gì?', a: 'Vào nhà hoặc nơi trú an toàn ngay', wrong: ['Chạy tới trú dưới gốc cây to nhất cho đỡ ướt', 'Đứng giữa đồng giơ ô lên'], why: 'Sét hay đánh vào chỗ cao giữa nơi trống trải. Nhà kiên cố là nơi trú an toàn nhất.', pic: '⚡' },
      { q: 'Vì sao không trú mưa dưới gốc cây to khi có sấm sét?', a: 'Vì sét hay đánh vào vật cao', wrong: ['Vì nước mưa từ lá cây rơi xuống làm ướt áo', 'Vì dưới gốc cây có kiến'], why: 'Cây cao đứng một mình rất dễ bị sét đánh, người đứng dưới gốc sẽ gặp nguy hiểm.', pic: '🌳' },
      { q: 'Trời đang sấm sét, việc nào nên làm?', a: 'Ở trong nhà, đóng cửa sổ', wrong: ['Ra sân tắm mưa', 'Mang diều ra bãi thả vì đang có gió to'], why: 'Khi có sấm sét nên ở trong nhà, tránh xa cửa sổ và các vật bằng kim loại.' },
      { q: 'Bão sắp về, cả nhà cần chuẩn bị gì?', a: 'Chằng chống nhà cửa, dự trữ nước sạch, thức ăn, đèn pin', wrong: ['Mở hết cửa cho thoáng gió', 'Ra bờ sông xem nước lên'], why: 'Chuẩn bị trước giúp cả nhà an toàn khi bão làm mất điện, mất nước.', pic: '🌀' },
      { q: 'Trong lúc bão đang đổ bộ, con làm gì?', a: 'Ở trong nhà chắc chắn, không ra ngoài', wrong: ['Ra sân xem gió thổi', 'Trèo lên mái nhà giữ ngói cho khỏi bay mất'], why: 'Gió bão có thể làm đổ cây, bay mái tôn. Ở trong nhà kiên cố, tránh xa cửa kính.' },
      { q: 'Sau bão, con thấy cột điện đổ, dây điện rơi xuống vũng nước. Con làm gì?', a: 'Tránh thật xa và báo người lớn', wrong: ['Lội tắt qua vũng nước cho nhanh về tới nhà', 'Lại gần xem'], why: 'Nước dẫn điện. Vũng nước có dây điện rơi vào có thể làm người lội qua bị điện giật.' },
      { q: 'Nước lũ đang lên nhanh. Cả nhà làm gì?', a: 'Lên chỗ cao, đi sơ tán theo hướng dẫn', wrong: ['Lội ra xem nước lên', 'Xuống bơi trong nước lũ'], why: 'Khi có lũ, phải lên chỗ cao và nghe theo hướng dẫn của người lớn, chính quyền.', pic: '🌊' },
      { q: 'Nước lũ có dùng để tắm, chơi đùa được không?', a: 'Không, vì nước rất bẩn và chảy xiết', wrong: ['Được, vì nước mát', 'Được, nếu chỉ chơi gần bờ'], why: 'Nước lũ cuốn theo rác, chất bẩn, có nhiều vi khuẩn gây bệnh và có thể cuốn trôi người.' },
      { q: 'Sau lũ, nước uống cần được làm thế nào?', a: 'Đun sôi rồi mới uống', wrong: ['Uống ngay nước giếng', 'Hứng nước mái nhà uống luôn'], why: 'Sau lũ, nguồn nước dễ bị nhiễm bẩn. Phải dùng nước sạch và đun sôi.' },
      { q: 'Đường ngập nước, không nhìn thấy mặt đường. Con làm gì?', a: 'Không đi qua, tìm đường khác hoặc chờ người lớn', wrong: ['Cứ lội qua vì nước nông', 'Đạp xe thật nhanh qua'], why: 'Dưới nước ngập có thể có hố sâu, nắp cống bị mở mà mình không nhìn thấy.' },
      { q: 'Mưa to kéo dài nhiều ngày, sạt lở đất dễ xảy ra ở đâu?', a: 'Sườn đồi dốc, bờ sông', wrong: ['Sân trường bằng phẳng', 'Giữa cánh đồng'], why: 'Đất ở sườn dốc, bờ sông ngấm no nước sẽ dễ sạt lở. Mưa lớn thì tránh xa những nơi đó.' },
      { q: 'Trời đổ mưa đá. Con làm gì?', a: 'Vào trú dưới mái nhà chắc chắn', wrong: ['Chạy ra nhặt đá chơi', 'Đứng dưới mái tôn mỏng xem đá rơi cho vui'], why: 'Viên đá rơi từ trên cao xuống có thể làm con bị thương.' },
      { q: 'Mùa hè nắng nóng gay gắt, con cần chú ý gì?', a: 'Đội mũ nón, uống đủ nước, tránh ra nắng giữa trưa', wrong: ['Chơi ngoài sân giữa trưa', 'Uống thật ít nước'], why: 'Nắng nóng dễ gây say nắng, mất nước. Giữa trưa nên ở chỗ râm mát.', pic: '☀️' },
      { q: 'Muốn biết bão có về không, cả nhà nghe ở đâu?', a: 'Bản tin dự báo thời tiết trên đài, ti vi, loa của xã', wrong: ['Nghe các bạn đoán', 'Nhìn màu áo mình mặc'], why: 'Bản tin dự báo thời tiết cho biết bão ở đâu, khi nào tới để mọi người kịp phòng tránh.', pic: '📻' },
      { q: 'Tan học gặp mưa to gió lớn, con làm gì?', a: 'Ở lại nơi an toàn, chờ ngớt mưa hoặc chờ người lớn đón', wrong: ['Chạy thật nhanh về nhà', 'Trú dưới cột điện'], why: 'Mưa to gió lớn dễ làm cây đổ, đường trơn và ngập. Chờ ở nơi an toàn là tốt nhất.' }
    ] }
  ];

  TOPICS.forEach(function (t) { TT.bank.life.topics.push(t); });
})(window);
