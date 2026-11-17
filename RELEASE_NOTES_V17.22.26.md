# MeYeuBe V17.22.26 — Family Day Approved Motion Fix

## Nguyên nhân

V17.22.25 mới nâng metadata/build nhưng chưa có `drawFamily` riêng. `photoPaint` vẫn vẽ vài đốm sáng ở hệ tọa độ thiết kế 240×184, không có trái tim ảnh thật và không thay đổi ánh sáng theo khu vực trong ảnh; đó là nguyên nhân người dùng gần như không nhìn thấy hiệu ứng.

## Đã sửa

- **A / Trái tim ánh sáng bay nhẹ** (`floatingHearts`): năm trái tim phát sáng, độ lớn và tốc độ khác nhau; asset WebP độc lập.
- **B / Ánh đèn gia đình ấm áp** (`homeGlow`): đèn nhà và vùng chân dung dịu dần/sáng dần; ảnh nền không bị mờ hoặc biến dạng.
- **Tĩnh** (`still`): chỉ còn ảnh nền, không tải lớp sprite động.
- Ảnh gia đình, khung hình, gấu bông và giao diện card vẫn nguyên vẹn. Không tăng chiều cao banner hoặc đẩy app xuống.
- Căn chuẩn `548×215` trên cả màn hình nhỏ và lớn; giữ nguyên mã cấu hình A/B để Cloud Sync không mất lựa chọn.
- Build và precache qua Service Worker V17.22.26, asset mới được đặt tên mới để tránh giữ cache cũ.

## Triển khai

Deploy thư mục **dist** đầy đủ. Kiểm tra trên Safari iPhone thực sau deploy ở cả A/B/Tĩnh; test nguồn không thay thế test thiết bị thực.
