# V15.0.34 — SmartAlertCronPush

- Bổ sung Smart Alert Cron Push qua Supabase Edge Function.
- Smart Alert vẫn gửi thông báo đúng giờ dù không thiết bị nào đang mở app.
- Cữ bú dùng đúng cấu hình “Nhắc sau (phút)”: ví dụ 08:00 + 15 phút = 08:15 báo.
- Gửi tới tất cả thiết bị đã bật Web Push cùng Sync ID.
- Chống gửi trùng bằng push_delivery_log.
