# Mẹ Yêu Bé V17.22.16 — Giỗ Tổ Hùng Vương: Photo-Matched Motion

Bản này nâng cấp riêng chủ đề Giỗ Tổ Hùng Vương trên source V17.22.15. Hiệu ứng A = cánh hoa đào rơi nhẹ; B = cờ hội lay động gắn cột cờ; Tĩnh = ảnh đứng yên. Không động chạm Tết Nguyên đán, Dương lịch, Nguyên Tiêu hoặc Quốc tế Phụ nữ. Bộ source có thể build/deploy bằng luồng cũ.

# Mẹ Yêu Bé V17.22.15 — Quốc tế Phụ nữ 08/03: Bướm bay & Cánh hồng rơi

Phát hành theo 2 mẫu đã duyệt (không có khung trang trí vàng hoặc chữ sự kiện ở đầu banner bé):

- **A — Bướm bay quanh bó hoa** (`butterflies`): bướm ảnh thật tách nền, vỗ cánh và bay theo 3 quỹ đạo cong riêng trong banner.
- **B — Cánh hoa hồng rơi** (`petals`): những cánh hồng lấy từ preview đã duyệt, xoay, nghiêng và rơi theo gió, không chạy bướm.
- **Tĩnh**: giữ ảnh bó hoa sắc nét, không có hoạt cảnh.
- Giữ nguyên thông tin bé và card dashboard; hiệu ứng chỉ nằm trong banner (không chuyển động header hay các card dưới).
- Không thay đổi Tết Nguyên đán / Tết Dương lịch / Tết Nguyên Tiêu và 16 chủ đề còn lại; giữ nguyên lịch, đồng bộ cấu hình Cloud Sync và dữ liệu.
- `sw.js` precache ba ảnh WEBP mới để dùng được sau khi app đã cài bản phát hành.

Kiểm thử độc lập `node tests/womensday-motion-v172215.cjs`, kiểm thử toàn bộ seasonal `node tests/seasonal-standalone.cjs`, build `npm run build`, kiểm tra `python3 release_check.py`.

---

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
