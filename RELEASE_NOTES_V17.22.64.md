# MeYeuBe V17.22.64 — Push Delivery Diagnostics & Recovery

## Phạm vi
- Chuẩn hóa mã lỗi Web Push trên Edge Functions: `PUSH_AUTH_REJECTED` (401/403), `SUBSCRIPTION_EXPIRED` (404/410), `PUSH_RATE_LIMITED` (429), `PUSH_TIMEOUT`, `PUSH_NETWORK_ERROR`, và các trường hợp khác.
- Phân biệt `sent` (Push gateway chấp nhận), `failed`, `expired`, `skipped`, `filtered`; trong cùng phút có thể `ALREADY_PROCESSED`.
- Trả về mã lỗi HTTP và hướng khắc phục an toàn, không trả endpoint hay khóa nhạy cảm.
- Giao diện **Thông báo thiết bị**: Kiểm tra thiết bị, Đăng ký lại Push, Lịch sử gửi server, Sao chép nhật ký, Xóa nhật ký.
- Lưu tối đa 80 nhật ký chẩn đoán trên thiết bị; giữ nhật ký sau khi đóng app, không tự xóa dữ liệu chăm sóc.
- Sử dụng bảng `myb_notification_deliveries_v1660` có sẵn cho lịch sử server (20 lượt gần nhất).

## Điều kiện vận hành
- **BẮT BUỘC** triển khai lại 2 Edge Functions `send-push` và `smart-alert-cron` trên dự án Supabase đang dùng. Chỉ deploy Vercel sẽ không thay đổi logic Push phía server.
- Dùng lại VAPID secrets hiện có. Không gửi VAPID private key trong app hoặc nhật ký. Khi gặp lỗi 401/403, xác nhận cặp khóa VAPID phù hợp với subscription của thiết bị.
- Đóng PWA vẫn có thể nhận Web Push nếu subscription hợp lệ và cron hoạt động, nhưng bản này không xác nhận được thông báo đã hiển thị trên màn hình iPhone.
- Không có SQL migration mới. Không cần chạy lại các migration trước đó nếu database đang ở V17.22.63.

## Kiểm thử
- `node tests/push-delivery-diagnostics-v172264.cjs`
- `npm run build`
- `node tests/service-worker.cjs`
- Chưa test với Supabase production hoặc Push gateway thực tế; cần xác nhận sau khi triển khai.
