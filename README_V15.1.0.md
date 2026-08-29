# Mẹ Yêu Bé V15.1.0 — Realtime Connection Stability Fix

## Mục tiêu
Giữ nguyên kiến trúc Database First + Incremental Realtime của V15.0.80 nhưng sửa dứt điểm hiện tượng trạng thái Cloud Sync liên tục nhảy CONNECTING / RETRYING / REALTIME do vòng đời channel.

## Nguyên nhân lỗi
Ở V15.0.80, khi reconnect, app gọi `removeChannel()` cho channel cũ. Supabase có thể phát callback `CLOSED` cho channel đó. Callback cũ vẫn gọi `scheduleReconnect()`, có thể xóa tiếp channel mới vừa SUBSCRIBED và tạo vòng reconnect.

## Cách sửa V15.1.0
- Mỗi channel được gắn một `generation`.
- Callback chỉ được xử lý khi generation + client + channel đều còn là hiện hành.
- Trước khi remove channel, generation được tăng để vô hiệu hóa toàn bộ callback còn trễ.
- Chỉ một reconnect timer được phép tồn tại.
- `CHANNEL_ERROR`, `TIMED_OUT` và `CLOSED` thật sự của channel hiện hành vẫn được reconnect bằng backoff.
- Các lệnh start trùng khi channel hiện tại đã tồn tại chỉ trả lại channel đang chạy, không tạo channel mới.

## Database
Không có SQL mới. V15.1.0 tiếp tục dùng nguyên schema/RPC V15.0.80 đã cài trên Supabase. Không restore database và không unlock legacy JSON.

## Kiểm tra sau deploy
1. Mở Cloud Sync.
2. Chờ trạng thái `CONNECTING → REALTIME`.
3. Giữ app mở 3–5 phút: trạng thái phải đứng ở `REALTIME` khi mạng ổn định.
4. Tắt/bật Wi‑Fi để kiểm tra `RETRYING → CONNECTING → REALTIME` chỉ xảy ra khi mất kết nối thật.
5. Kiểm tra `Reconnect phiên này` và `Stale callback bỏ qua` trong Cloud status.
