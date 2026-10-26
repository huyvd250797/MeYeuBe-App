# V16.6.0 — 26/10/2026 — Notifications

- Bỏ phát nhắc tự động từ vòng lặp app; cron server độc lập app dùng cấu hình Dashboard đã lưu. Cài đặt hạ tầng pg_cron/pg_net/Vault, custom secret riêng cho worker; không mở cron bằng public key.
- Quy tắc chung browser/Edge; giữ phút nhắc cữ bú kể từ cữ gần nhất, xử lý UTC/local đúng, lịch hẹn info theo lựa chọn thiết bị. Nguồn native scoped, không full export sức khỏe/media.
- Lease worker và từng delivery, retry có giới hạn/backoff/hạn gửi, 404/410 vô hiệu subscription, checkbox tất cả tắt không còn thành []=tất cả. Re-evaluate trước mỗi thiết bị; không phát payload đã xóa/hủy khi retry.
- Nội dung mẫu ASCII Unicode escapes → tiếng Việt có dấu; sửa mojibake hiển thị và NFC trên server/worker; lỗi không khôi phục dùng câu thay thế. Không ghi sửa dữ liệu nguồn.
- Trạng thái cron/heartbeat theo gia đình và gửi thử có nội dung server tạo; không tuyên bố provider ACK là đã đọc/đã hiển thị.
- SQL1660+1661 trong TXT ASCII không BOM để copy iPhone. Bắt buộc deploy hai Edge Function và kích hoạt job với secret thật theo README; frontend tự nó không cài cron.
- Giữ nghiệp vụ cũ; test chăm sóc đổi ngày fixture cố định đã hết hạn sang ngày hiện tại, không nới kiểm tra hạn dùng production. Hai kiểm tra version cập nhật đúng16.6.
- Backup JSON đầu vào giữ ngoài thư mục phát hành; giải quyết changelog trùng hoa/thường. Không triển khai production/GitHub hoặc test iPhone thật trong phiên này.

## Làm sạch gói source V16.6.0

- Xóa script JS không còn nạp, relational-v1576, SQL legacy/reset, báo cáo/checksum/README lịch sử và bản TXT migration cũ trùng SQL.
- Loại hoàn toàn thư mục input-only/backup khỏi bản phát hành. Gói trước đóng nhầm thư mục này; bản sạch có kiểm tra chặn cả thư mục lẫn tên backup.
- Giữ nguyên byte tất cả runtime đang chạy, Edge Functions và migration nghiệp vụ hiện tại. Không đổi phiên bản, không cần migration mới.
- Giữ bộ test; chuyển hai truy vấn preflight chỉ dùng trong test vào tests/fixtures, bỏ khỏi thư mục migration production.
- Thêm build_release.py tạo ZIP theo danh sách hợp lệ và tự kiểm tra cấu trúc, checksum, trùng tên hoa/thường.
