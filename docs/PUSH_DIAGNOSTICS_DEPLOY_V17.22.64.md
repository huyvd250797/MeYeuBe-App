# V17.22.64 — Triển khai Push Diagnostics lên Supabase

## Thứ tự triển khai

1. Push ZIP V17.22.64 lên repository/Vercel bằng Zipverra như quy trình hiện tại.
2. Cập nhật **Supabase Edge Functions** từ cùng source trong ZIP (bước bắt buộc):

```bash
supabase login
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
supabase functions deploy send-push
supabase functions deploy smart-alert-cron
```

3. Kiểm tra Edge Secrets hiện có trên Supabase: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`; `MYB_CRON_SECRET` cho cron. Không copy secret vào client.
4. Kiểm tra cron hiện tại vẫn gọi `smart-alert-cron`, không đổi tần suất nếu không cần.
5. Trên iPhone mở PWA từ Màn hình chính → Thêm → Thông báo thiết bị → Kiểm tra thiết bị → Gửi thử thiết bị này.
6. Nếu lỗi 404/410: bấm **Đăng ký lại Push**, sau đó gửi thử vào phút tiếp theo.
7. Nếu lỗi 401/403: xác minh cặp khóa VAPID trên Supabase; cấu hình sai không thể sửa chỉ bằng đăng ký lại trên iPhone.
8. Nếu chức năng báo Edge Function định dạng cũ, chắc chắn `send-push` đã deploy đúng dự án.

## Quy tắc an toàn
- Không chạy lại migration/SQL nếu không cần. Phiên bản này dùng lại `myb_notification_deliveries_v1660`.
- Nhật ký cục bộ không chứa endpoint/token/khóa; không gửi ảnh chụp chứa VAPID private key hoặc thông tin xác thực.
- `sent` là Push gateway tiếp nhận, không có nghĩa người dùng đã thấy thông báo.
