## V17.22.26 — Family Day Approved Motion Fix (2026-11-17)

- Sửa lỗi V17.22.25 chưa nối engine hoạt cảnh riêng cho `family`: phần trước chỉ hiện bokeh rất mờ và không hiển thị trái tim thực tế như GIF.
- **A (`floatingHearts`)**: năm trái tim viền sáng lấy tông màu từ ảnh, di chuyển chậm theo quỹ đạo riêng quanh khung ảnh gia đình.
- **B (`homeGlow`)**: lớp ánh sáng ảnh mềm riêng cho ngôi nhà và khung chân dung, nhịp sáng/tối lệch pha; tuyệt đối không biến dạng hoặc làm mờ ảnh gốc.
- **Tĩnh**: không tải/vẽ ảnh động. Giữ nguyên ID chế độ để đồng bộ Cloud Sync.
- Thêm 2 sprite WebP trong suốt, căn tọa độ đúng 548×215 của ảnh, clip trong hero card; precache offline trong Service Worker.
- Đồng bộ version source/PWA/production thành V17.22.26; kiểm thử độc lập cho hai chế độ và đảm bảo ảnh nền không thay đổi.

## V17.22.25 — Family Day Motion Fidelity (2026-11-17)

- Áp dụng hoàn chỉnh chủ đề Ngày Gia đình Việt Nam với 2 hiệu ứng động đã duyệt.
- Hiệu ứng A: Floating Hearts — các trái tim ánh sáng bay nhẹ quanh khung ảnh gia đình.
- Hiệu ứng B: Home Glow — ánh đèn ngôi nhà và vùng khung ảnh ấm dần rồi dịu xuống.
- Làm mới metadata phiên bản/PWA để phát hành thành build V17.22.25.

## V17.22.24 — Childrens Day Natural Motion Fidelity (2026-11-17)

- **A / B / Tĩnh**: giữ ảnh hero gấu–thỏ–hộp quà–ngôi sao đã duyệt, không làm mờ hoặc biến dạng ảnh nền.
- A (`balloons`): ba bóng latex nhiều lớp sáng bóng, lớn hơn và đung đưa lệch pha nhẹ như treo trong gió; giấy màu có mặt trước/mặt sau, rơi chậm, không dùng nét sao giả.
- B (`stars`, legacy key): bong bóng màng mỏng có phản quang cầu vồng, nổi chậm; hai chong chóng mới dùng hình lá nhựa/foil tô sáng theo chiều gấp, quay quanh trục cố định, cán không nhảy.
- Phần ảnh động chỉ trong hero card; không đẩy layout và không đè lên tên/avatar/chuông của bé. Tải asset theo lựa chọn hiện tại, Tĩnh không tải sprite động.
- Bổ sung 5 sprite ảnh trong suốt WebP chất lượng cao; offline/PWA và metadata được làm mới theo build 17.22.24.

## V17.22.22 — Children Day Motion Fidelity (2026-11-17)

- Giữ nguyên ảnh gốc Quốc tế Thiếu nhi (gấu bông, thỏ, quà, ngôi sao), không làm mờ hoặc dời bố cục.
- A `balloons`: bóng bay ảnh tách nền, đung đưa từng quả theo nhịp riêng; giấy màu nhỏ rơi trong banner.
- B `stars` (ID lưu cũ): bong bóng xà phòng phản quang bay lên; chong chóng nhiều màu quay độc lập.
- Mỗi chế độ chỉ tải asset tương ứng; Tĩnh không vẽ chuyển động. Dùng tọa độ gốc của ảnh 548×215 và clip trong card.
- Loại bỏ đốm sáng CSS chung; cập nhật `build.json`, manifest, source, dist và precache Offline cho V17.22.22.

## V17.22.21 — Doan Ngo Motion and PWA Update Reliability (2026-11-17)

- Căn đúng tỉ lệ ảnh Tết Đoan Ngọ 548×215, 2 chế độ ảnh sprite không chồng lấn.
- Sửa vòng lặp popup cập nhật: so sánh version mới hơn, chờ SW hoặc xác thực index mới, chặn nhắc lại trong phiên.
- Đồng bộ version trong build, manifest, lockfile và gói production.

## V17.22.20 — Doan Ngo Motion Repair (2026-11-17)

- Sửa motion Tết Đoan Ngọ để khớp GIF đã chốt: **Chuồn chuồn bay** dùng sprite ảnh thật và **Lá xanh lay động và rơi** dùng lá ảnh thật rơi tự nhiên trên hero scene.
- Thêm asset motion riêng cho Đoan Ngọ và nối chúng vào lớp overlay ảnh của dashboard.
- Đồng bộ lại `build.json` / `boot.js` / `package.json` lên build **17.22.20** để máy nhận đúng bản mới.
- Sửa popup cập nhật: sau khi bấm cập nhật hoặc để sau sẽ không hiện lặp vô hạn trong cùng phiên.

## V17.22.19 — Doan Ngo Festival Motion Fidelity (2026-11-17)

- Chốt chủ đề Tết Đoan Ngọ với 2 hiệu ứng đã duyệt: A chuồn chuồn bay, B lá xanh lay động và rơi.
- Giữ form app như các chủ đề gần đây: scene nằm trong hero card, không thêm khung chữ ở giữa banner và không đẩy layout.
- Đồng bộ nhãn cấu hình hiển thị theo wording đã chốt để người dùng chọn đúng hiệu ứng trong app.
- Tăng build/PWA version lên 17.22.19 để thiết bị nhận bản mới.

## V17.22.18 — Reunification Day Daylight Motion Fix (2026-11-17)

- 30/04 bright daytime sky; roof flag visible even in still/fireworks mode.
- Smooth full-texture flag animation without vertical canvas-strip seams.
- Daylight firework image layers have true alpha transparency, no dark rectangular backdrops.
- No new banner/holiday title, no changed card sizing, no other theme changes.

## V17.22.16 — Hung Kings Commemoration: Photo-Matched Motion

- 2 độc lập: A cánh hoa đào rơi nhẹ trên cảnh đền, B cờ hội lay động nhỏ tại cột cờ thật; Tĩnh giữ cờ đứng yên.
- Dùng cảnh núi và cổng Đền Hùng từ ảnh mẫu đã duyệt, loại khung chữ/biểu tượng chụp sẵn, không bóp méo cổng hoặc đẩy giao diện xuống.
- Cờ, cánh hoa là ảnh thật tách nền; không còn nét vẽ tam giác hay mây vẽ giả của bản cũ.
- Ảnh mới và sprite precache qua service worker. Giữ nguyên các chủ đề và Cloud Sync đã chốt.

## V17.22.15 — Quốc tế Phụ nữ 08/03: Bướm bay & Cánh hồng rơi

- Tách 2 lớp hoạt cảnh riêng biệt A / B từ sprite ảnh thật (không dùng đốm CSS hay chung object).
- Thay cảnh hero thành bó hoa rõ nét, **không có khung vàng trang trí đầu banner**, không có chữ sự kiện baked-in.
- Giới hạn chuyển động trong card bé, bảo vệ tên bé / avatar / nút chuông / cữ bú, không đẩy các card xuống.
- Khởi tạo/tải ảnh riêng theo chế độ đã chọn, giữ tương thích mã cấu hình cũ `butterflies` / `petals` / `still`.
- Precache 3 ảnh WEBP mới, tăng build version để PWA nhận cập nhật.

## V17.22.14 — Nguyên Tiêu Photo Motion Fidelity (16/11/2026)

- Tạo cảnh hồ Nguyên Tiêu từ ảnh gốc sắc nét, không chép lại chữ/nút của giao diện mẫu.
- A: đèn trời ảnh thật bay lên; B: hoa đăng ảnh thật trôi trên nước; Tĩnh: không có animation.
- Đảm bảo lớp chuyển động cắt trong banner và không che thông tin bé; hỗ trợ giảm chuyển động, dừng khi ứng dụng chuyển nền như logic hiện có.
- Đưa 5 ảnh mới vào service-worker precache; bổ sung kiểm thử riêng A/B/Tĩnh.
- Sửa tham chiếu ảnh New Year v7 trong test/offline cache so với source V17.22.13.

## V17.22.13 — New Year card hero enlargement

- Crop lại newyear-city-scene cho card bé.
- Tăng kích thước hiển thị và giảm khoảng trống bên dưới.
- Giữ hình cân đối với card.
