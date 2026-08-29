# V15.1.3 — Relational Always-On Realtime Fix

- Supabase relational tables tiếp tục là source of truth duy nhất.
- Cloud/Realtime luôn bật khi thiết bị online; không còn phụ thuộc `enabled` trong localStorage.
- Sync ID được khóa về `main`, đúng family đã cutover/restore ở V15.0.76, tránh mỗi thiết bị tạo/đọc family khác nhau.
- Thiết bị mới, PWA cài lại hoặc clear localStorage tự dùng URL/key mặc định + Sync ID `main` và tự bootstrap relational DB.
- Bỏ toggle Bật/Tắt đồng bộ khỏi giao diện; thay bằng trạng thái `Always-On`.
- Giữ Single-Channel Realtime: một family chỉ có một channel trong phiên, Supabase tự reconnect/rejoin.
- Realtime OFF chỉ xảy ra khi thiết bị offline hoặc thiếu URL/key thực sự.
- Không thay đổi schema database; không cần chạy SQL mới.
