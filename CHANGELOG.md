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
