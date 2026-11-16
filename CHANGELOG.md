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
