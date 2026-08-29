# V15.1.2 — Realtime Single-Channel Stability Fix

- Fix triệt để vòng trạng thái CONNECTING / RETRYING / REALTIME do nhiều state machine Cloud cùng tồn tại.
- Vô hiệu runtime legacy `QuietCloudToastFix` trước khi nó đăng ký timer/listener nên không còn auto-toast “Đã kết nối”.
- Vô hiệu runtime legacy `CloudSaveQueueFix`; relational Database First tiếp tục là luồng ghi duy nhất.
- Một family chỉ giữ một Supabase Realtime client/channel trong suốt phiên.
- Không remove/recreate channel khi `TIMED_OUT`, `CHANNEL_ERROR` hoặc `CLOSED`; Supabase JS tự reconnect/rejoin.
- `online`, `visibilitychange`, `pageshow` chỉ yêu cầu socket hiện hữu connect và chạy revision catch-up nhẹ.
- Khi đã từng `SUBSCRIBED`, lỗi transport ngắn không làm badge công khai rời `REALTIME`; trạng thái transport thật được giữ trong diagnostics.
- RPC/incremental catch-up lỗi chỉ retry dữ liệu, không restart WebSocket.
- Không thay đổi schema; không cần chạy SQL mới.
