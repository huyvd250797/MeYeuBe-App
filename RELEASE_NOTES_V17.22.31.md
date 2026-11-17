# MeYeuBe V17.22.31 — National Day Motion Fidelity

## Mục tiêu
Tích hợp 2 hoạt cảnh Quốc khánh đã duyệt trên ứng dụng Mẹ Yêu Bé thực tế, không tạo lại form app hoặc GIF mẫu mới.

## Hai hiệu ứng
- **A — Cờ Tổ quốc tung bay** (`flagWave`): ảnh vải cờ đỏ sao vàng lấy từ atlas 96 khung hình nguyên tấm; chuyển động nếp vải mượt, không chia lát dọc; nằm ở nửa phải banner.
- **B — Pháo hoa trên bầu trời** (`fireworks`): 4 lớp ảnh pháo hoa thật trong suốt, bung sáng và tàn dần theo chu kỳ riêng, không có cờ chuyển động.
- **Tĩnh** (`still`): không tải hoặc vẽ lớp hoạt cảnh.

## Thiết kế
- Giữ nguyên ảnh bé, tên bé, chuông, lịch, cữ bú, các block/card và thanh điều hướng.
- Không hiển thị chữ Quốc khánh hoặc 2/9 trong banner.
- Ảnh nền của cả hai chế độ là Lăng Chủ tịch Hồ Chí Minh; không có pháo hoa tĩnh; không bóp méo tòa nhà.
- Lớp chuyển động chỉ hiển thị trong hero, được giới hạn vùng sky; không tăng chiều cao layout.

## Phát hành
- Bản nguồn phát hành: **17.22.31**.
- Deploy toàn bộ thư mục `dist`, bao gồm `sw.js`, `index.html`, `build.json`, thư mục `assets` và ảnh trong `src/features/seasonal/art`.
- Không cần migration SQL. Cần kiểm chứng trực quan trên Safari iPhone thực tế sau deploy.
