# MeYeuBe V17.22.50 — Teachers Day Card Artwork Fix

## Phạm vi
- Dùng trực tiếp hình minh họa hoa hồng, quà và phong thư đã duyệt (nguồn ảnh gốc riêng, **không** sử dụng ảnh chụp màn hình app).
- Tạo lớp hình 548 × 215 px nền trong suốt, chuyển tiếp mềm bên trái để không che avatar/tên/trạng thái Bé Bún, giữ bó hoa và hộp quà bên phải.
- Dùng WEBP lossless, không áp dụng blur lên chủ thể.
- Thay đường dẫn ảnh hero riêng cho chủ đề `teachers` thành `teachers-photo-hero-v50.webp` để invalid cache.
- Thay ảnh fallback hero v3 và accent v3 đã bị trộn nội dung screenshot ở V17.22.49, chỉ riêng chủ đề `teachers`.
- Giữ nguyên 19 chủ đề khác, lịch 20/11, tên "Nhà giáo Việt Nam", hiệu ứng chuyển động, dashboard HTML và Splash Loading.

## Cơ sở dữ liệu
Không có SQL migration.
