# Kiểm tra V17.21.2 — Festive Cards

## Giao diện

- Trên Chromium Headless với dữ liệu giả lập, bật lần lượt 10 chủ đề ở chiều rộng 390 px. Xác minh bảng dấu + có đủ tám ô với họa tiết riêng và biểu tượng chức năng, các ô thống kê Trang chủ có họa tiết và thanh tiến độ, form Bé bú dùng màu chủ đề cho card nhưng nền ô nhập vẫn đơn giản.
- Đo lại bố cục Giáng sinh, Halloween và Khai giảng ở 320 px. Kiểm tra form xếp **Hủy** bên trái, **Lưu** bên phải, màn hình không tràn ngang. Kiểm tra giao diện sáng và tối, quay về giao diện thường khi tắt chủ đề.
- Mở và kiểm tra ảnh chụp bản build của Trang chủ, bảng dấu + và form Bé bú ở chủ đề Giáng sinh. Môi trường này không đo được trên PWA iPhone thật.

## Tài nguyên và dữ liệu

- Chromium đọc được 80 họa tiết WebP. Artwork của card dung lượng khoảng 226 kB tổng cộng, lưu trước cùng build PWA. Kiểm thử worker xác minh URL tương đối từ stylesheet đã gộp và lấy được họa tiết khi giả lập mất mạng.
- 21 file Supabase khớp từng byte với ZIP V17.21.1. Không cần migration hay cập nhật Edge Functions.
- `npm test` hoàn thành với 68/68 nhóm kiểm thử đạt trên Node.js 24. Build production, test worker và test theme đã được chạy lại sau khi hoàn thiện CSS.
