# V17.22.14 — Tết Nguyên Tiêu: Đèn Trời & Hoa Đăng

Nâng cấp riêng chủ đề **Tết Nguyên Tiêu** theo mẫu đã duyệt. Hai chế độ mới sử dụng ảnh thật cắt từ cảnh hồ/đình/đèn hoa đăng gốc độ phân giải cao:

- **A — Đèn trời bay lên**: sáu đèn giấy sáng, kích thước thay đổi theo khoảng cách, bay lên đều và lệch nhịp; chỉ trong vùng banner bé.
- **B — Hoa đăng trôi trên hồ**: ba hoa đăng ảnh thật lướt ngang nhẹ và phản chiếu ánh vàng lên mặt nước; không vẽ đèn trời.
- **Tĩnh**: giữ nguyên ảnh hồ, không có sprite chuyển động.

Giữ nguyên Tết Nguyên đán V17.22.9, Tết Dương lịch V17.22.13, 17 chủ đề còn lại, lịch âm/dương, Cloud Sync, dữ liệu ứng dụng và kích thước header/card/bottom nav. Kiểm thử riêng: `node tests/nguyentieu-motion-v172214.cjs`. Xem chi tiết `docs/NGUYENTIEU_MOTION_V17.22.14.md`.

---

# V17.22.13 — Tết Dương lịch: phóng to ảnh trong card

- Thay ảnh hero trong card của chủ đề Tết Dương lịch bằng bản crop mới để loại bỏ phần rỗng thừa.
- Phóng to và kéo xuống thấp hơn để lấp khoảng trống giữa ảnh và thanh cữ bú tiếp theo.
- Giữ bố cục trong card, không đẩy layout app.
