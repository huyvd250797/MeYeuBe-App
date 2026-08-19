# AC V15.0.34 — SmartAlertCronPush

- Bật Cloud Sync và Web Push trên ít nhất 2 thiết bị.
- Deploy `send-push` và `smart-alert-cron` lên Supabase.
- Tạo lịch chạy `smart-alert-cron` mỗi 1 phút.
- Ghi nhận Bé bú lúc 08:00, cấu hình Smart Alert nhắc sau 15 phút.
- Đóng toàn bộ app trên các thiết bị.
- Khoảng 08:15, tất cả thiết bị đã bật thông báo nhận được push.
- Cảnh báo không bị gửi lặp nhiều lần nhờ `push_delivery_log`.
