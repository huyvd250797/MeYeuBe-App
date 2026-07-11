# MeYeuBe V10.8.0

## Device Push Notification

- Đăng ký Web Push riêng cho từng thiết bị.
- Bật/tắt thông báo và lưu subscription trên Supabase.
- Chọn loại Smart Alert được phép gửi đến từng thiết bị.
- Edge Function `send-push` gửi thông báo Web Push.
- Nút gửi thông báo thử.
- Service Worker nhận push và mở Trung tâm cảnh báo khi bấm notification.
- Tự phát hiện subscription mất/hết hạn; Edge Function xóa endpoint trả về 404/410.
- Giữ nguyên Realtime JSON Sync, Cloud Sync thủ công và localStorage key `meYeuBePWA_v4`.

> Phiên bản được nâng từ V10.7.2 lên V10.8.0 vì đây là một tính năng mới có cả frontend, database và backend; không hạ version về V10.7.1.
