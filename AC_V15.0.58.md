# AC V15.0.58 — CloudSaveQueueFix

- Thêm/sửa/xóa dữ liệu phải hiển thị ngay trên thiết bị hiện tại.
- Mỗi thao tác save được đưa vào hàng đợi ghi Cloud.
- Hàng đợi đẩy Supabase tuần tự theo thứ tự thao tác.
- Nếu Cloud có dữ liệu từ máy khác, app fetch Cloud mới nhất, apply thao tác local rồi commit lại.
- Realtime cũ không được ghi đè dữ liệu đang có queue hoặc vừa lưu.
- Xóa record tạo tombstone để máy khác không hồi sinh dữ liệu đã xóa.
- Khi online lại, queue tự flush.
