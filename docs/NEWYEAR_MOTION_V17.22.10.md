# Mẹ Yêu Bé V17.22.10 — Tết Dương lịch: Pháo hoa & Ánh vàng

## Phạm vi
- Nâng từ V17.22.9, giữ nguyên hai chế độ Tết Nguyên đán đã được duyệt.
- Chỉ thay các hình ảnh và chuyển động Tết Dương lịch 01/01.
- Không đổi kích thước header, banner, card và thanh điều hướng.

## Hiệu ứng A — Pháo hoa đêm (`fireworks`)
- Pháo hoa được trích từ ảnh mẫu gốc thành lớp WebP alpha.
- Nở ra, sáng dần và tàn chậm, nhiều nhịp lệch pha, không vẽ các đường tia giả.
- Toàn bộ được clip trong banner bé, ưu tiên vùng bên phải, không vẽ ra header/các card.

## Hiệu ứng B — Ánh vàng (`confetti`)
- Giá trị cấu hình `confetti` được giữ để tương thích đồng bộ Cloud Sync cũ.
- Tên hiển thị đổi thành “Ánh vàng lấp lánh”.
- Chỉ những điểm sáng quanh thành phố, ly và hộp quà dao động lệch pha.
- Không tải hoặc vẽ hiệu ứng pháo hoa trong nhánh B.

## Tĩnh (`still`)
- Giữ ảnh thành phố không có pháo hoa động, Canvas được làm trống.

## Tài nguyên
- `newyear-city-scene-v6.webp`: cảnh nền WebP trong suốt không chứa text/icon hoặc pháo hoa động.
- `newyear-city-header-v6.webp`: lớp trang trí header tĩnh.
- `newyear-firework-*-v6.webp`: bốn lớp pháo hoa từ ảnh gốc, có alpha.
- `newyear-glint-v6.webp`: ánh phản chiếu vàng.

## QA cần kiểm tra sau deploy
- Chuyển đổi A/B/Tĩnh ở trang thiết lập, xác nhận thay đổi ngay khi lưu.
- Mở trên Safari iPhone, so sánh tỷ lệ ảnh; khung card không giãn hoặc xô lệch.
- Cuộn, mở các module khác và quay về; kiểm tra hiệu năng/tạm dừng khi app ở nền.
- Bản preview trong app và chế độ chạy thật sử dụng cùng engine.
