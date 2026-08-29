# Mẹ Yêu Bé V15.1.2 – Realtime Single-Channel Stability Fix

## Root cause đã loại bỏ

1. Runtime legacy `QuietCloudToastFix` vẫn đăng ký listener/timer và có thể phát toast `Đã kết nối`.
2. Runtime legacy `CloudSaveQueueFix` vẫn được khởi tạo dù relational-only đã thay thế write queue.
3. Client V15.1.1 vẫn có forced recovery riêng trong khi Supabase Realtime đã tự reconnect/rejoin. Hai state machine có thể cạnh tranh.

## V15.1.2

- Đặt `__MYB_RELATIONAL_ONLY_RUNTIME__` trước khi `app.js` chạy.
- Không khởi tạo QuietCloudToastFix và CloudSaveQueueFix legacy.
- Một family chỉ có một Supabase client/channel.
- `TIMED_OUT`, `CHANNEL_ERROR`, `CLOSED` không remove/recreate channel. Supabase JS tự reconnect.
- `online`, `visibilitychange`, `pageshow` chỉ gọi `realtime.connect()` trên client hiện hữu và revision catch-up nhẹ.
- Offline không remove channel.
- Sau khi từng SUBSCRIBED, trạng thái công khai giữ `REALTIME` trong rejoin ngắn; phase socket nằm ở diagnostic.
- Không có auto-toast `Đã kết nối`.
- Không thay đổi schema/database; không cần chạy SQL.
