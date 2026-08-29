# V15.0.80 — EgressOptimizationIncrementalRealtime

- Relational tables tiếp tục là source of truth duy nhất.
- Bỏ hoàn toàn full-database safety refresh mỗi 45 giây.
- Boot ưu tiên cache + revision check nhẹ; chỉ full pull khi cache trống hoặc change-map không đủ.
- Realtime chỉ phát signal metadata; client đọc change-map theo revision rồi tải đúng section thay đổi.
- Save thành công chỉ refetch section bị thay đổi, không refetch toàn database.
- Presence giảm còn 180 giây và kèm revision để tự phục hồi nếu iOS bỏ lỡ websocket event.
- Giữ idempotency, conflict guard, anti-double-click và Database First của V15.0.79.
- Manual “Tải toàn bộ TABLE” vẫn còn như nút phục hồi chủ động, không tự chạy nền.
