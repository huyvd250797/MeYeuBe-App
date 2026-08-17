# AC V15.0.47 — StartupCloudPreloadFix

- Bật Supabase Cloud DB Mode, đóng app rồi mở lại.
- Trong splash/loading, app tải dữ liệu Supabase trước khi vào giao diện chính.
- Dashboard không còn hiển thị toàn số 0 trước rồi mới cập nhật sau.
- Khi Cloud tải xong, vào giao diện chính đã có đủ dữ liệu mới nhất.
- Nếu offline hoặc Cloud timeout, splash báo dùng cache tạm và vẫn mở app bằng cache gần nhất.
- Realtime bắt đầu sau khi dữ liệu boot đã sẵn sàng.
