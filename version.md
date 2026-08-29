# V15.1.1 — Realtime Stable State Fix

- Fix triệt để trạng thái CONNECTING / RETRYING / REALTIME nhảy liên tục.
- Không còn tự phá/recreate channel ngay khi Supabase phát TIMED_OUT, CHANNEL_ERROR hoặc CLOSED tạm thời.
- Cho Supabase Realtime v2 tự rejoin trong grace window; chỉ forced recovery nếu channel thật sự không phục hồi.
- RPC/incremental catch-up lỗi chỉ retry dữ liệu, tuyệt đối không restart WebSocket.
- Chặn toast legacy “Đã kết nối” tự bật lại trong relational-only mode.
- UI giữ REALTIME qua lỗi thoáng qua; chỉ hiện RETRYING khi mất kết nối kéo dài và cần forced recovery.
- Vẫn giữ Database First, Conflict Guard, Incremental Realtime và Egress Optimization.
- Không có thay đổi schema; không cần chạy SQL mới.
