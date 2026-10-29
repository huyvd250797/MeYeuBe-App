# V17.13.1 — Validation

## Phạm vi

Sửa nhấn giữ trực tiếp hai ô Đi tè/Đi phân trên dashboard để ghi ngay 1 tã tương ứng; bỏ tăng số lượng khi giữ trong form. Nền là ZIP MeYeuBe_v17.13.0.zip Boss gửi.

## Đã xác minh

- npm ci --ignore-scripts --no-audit --no-fund: cài sạch 38 packages bằng Node 24.22.1. Lượt chỉ dùng cache trước đó không đủ cache; cài sạch qua registry sau đó thành công.
- Dependency lock: chỉ đổi version app ở root, giữ toàn bộ dependency bên thứ ba.
- Đối chiếu toàn bộ 17 file backend với ZIP đầu vào: nguyên byte; không có SQL mới.
- Source integration: 96 assertions PASS. Production integration: 99 assertions PASS.
- Các ca mới: giữ dài chỉ một bản ghi; thả rồi giữ lại thêm một bản ghi; tã bẩn theo quy tắc cũ; short tap xem chi tiết; click sau giữ bị chặn kể cả render lại; Undo đúng bản; cuộn/hủy/blur không ghi; ngày khác không ghi vào hôm nay; form không tăng bằng hold; nút ＋ thường vẫn tăng; chưa ACK chưa cộng; đang lưu chặn ghi tiếp; mất ACK giữ pending và verify phục hồi một bản ghi bằng operation ID cũ.

## Báo cáo hồi quy

npm test hoàn tất: 59/59 bộ kiểm tra PASS, 0 lỗi và 0 miễn trừ baseline. Kết quả từng bộ được ghi trong TEST_RESULTS_V17.13.1.json. Bộ test dùng PGlite/PostgreSQL fixture và jsdom; không kết nối dữ liệu gia đình thực.

## Giới hạn

Chưa deploy, push GitHub, kiểm tra trên database production hoặc kiểm chứng cảm ứng Safari/iPhone thật. Kiểm thử pointer mô phỏng không thay cho nghiệm thu trên máy Boss.
