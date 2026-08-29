# V15.1.0 — Realtime Connection Stability Fix

- Sửa vòng lặp `CONNECTING → RETRYING → REALTIME → CONNECTING` do callback `CLOSED` của channel Realtime cũ.
- Mỗi Realtime channel có generation riêng; callback từ channel cũ bị bỏ qua.
- Intentional `removeChannel()` không còn kích hoạt reconnect nhầm.
- Tại một thời điểm chỉ cho phép 1 active channel và 1 reconnect timer.
- Reconnect vẫn dùng exponential backoff khi `CHANNEL_ERROR`, `TIMED_OUT` hoặc `CLOSED` thật sự của channel hiện hành.
- Giữ Database First, relational tables, Conflict Guard và Incremental Realtime/Egress Optimization của V15.0.80.
- Không cần thay đổi schema/database; tiếp tục sử dụng các RPC V15.0.80 hiện tại.
