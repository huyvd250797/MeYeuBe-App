# Xác minh V17.21.1 — Header Clock & Living Scenes

## Kiểm thử trình duyệt

- Dùng Chromium Headless Shell ở khung hình di động 390 × 844 và 320 × 640 CSS px, với dữ liệu Supabase giả lập.
- Giờ và ngày hiển thị đầy đủ ở cả hai chiều rộng, phía trên thẻ chào bé. Mở được chuỗi ghi chép và tìm kiếm từ menu trái, đồng thời đổi được chế độ sáng/tối.
- Kiểm tra 20 lựa chọn chuyển động, mỗi lựa chọn đều tải tranh và làm thay đổi điểm ảnh trên canvas xem trước. Kiểm tra Giáng sinh trực tiếp trên Trang chủ và 30/04 trong phần xem trước.
- Cảnh Trang chủ dùng lại canvas khi kết xuất lại. Mở menu làm cảnh dừng. Khi bật Giảm chuyển động, phần xem trước giữ một khung tĩnh.
- Mỗi cảnh đo 10 giây theo nhịp requestAnimationFrame. Giáng sinh đạt 60,0 lần/giây, khoảng cách P95 là 16,8 ms. Cờ 30/04 đạt 59,8 lần/giây, P95 là 16,7 ms. Đây là nhịp khung được Chromium lên lịch. Hiệu năng PWA trên iPhone thật chưa được đo.

## Build và dữ liệu

- Build production có kiểm tra cache PWA và 20 tài nguyên WebP.
- Các file trong thư mục Supabase khớp từng byte với ZIP V17.21.0 đầu vào. Nâng cấp này chỉ cần triển khai frontend.
- Chạy `npm test` với Node.js 24. Toàn bộ 68 nhóm kiểm thử đạt.
