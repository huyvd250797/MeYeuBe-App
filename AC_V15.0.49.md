# AC V15.0.49 — StartupFastFeedCardUX

- Mở app ở Supabase Cloud DB Mode: splash bắt đầu kéo Cloud ngay, không vào Dashboard với toàn 0 dữ liệu.
- Khi Cloud phản hồi bình thường, loading xong vào giao diện chính đã có dữ liệu mới nhất.
- Khi Cloud chậm/offline, app dùng cache IndexedDB gần nhất thay vì DB rỗng.
- Không chạy bootstrap Cloud lặp làm chậm lúc mở app.
- Vào chi tiết Bé bú: số ml hiển thị bên phải dưới giờ, chữ to màu trắng.
- Tiêu đề Bé bú chỉ còn hình thức bú, không lặp số ml ngay dưới tiêu đề.
