# AC V15.0.44 — SupabaseCloudDBMode

- Cloud Sync có lựa chọn chế độ `Supabase Cloud DB chính`.
- Khi bật Cloud DB Mode, DB chính không còn ghi vào localStorage key `meYeuBePWA_v4`.
- Khi thiết bị còn dữ liệu local cũ, app tự đưa dữ liệu lên Supabase rồi xoá DB chính khỏi localStorage.
- Khi mở app, dữ liệu được tải từ Supabase theo Sync ID.
- Khi thêm/sửa/xoá dữ liệu, app cập nhật bộ nhớ hiện tại, cache IndexedDB và đẩy lên Supabase.
- Khi offline, app cảnh báo dữ liệu đang được giữ cache tạm và sẽ đẩy khi có mạng.
- Nút Đẩy Cloud, Tải Cloud, Đồng bộ 2 chiều vẫn hoạt động trong Cloud DB Mode.
- File/media lớn không được nhúng lại vào DB chính/localStorage.
