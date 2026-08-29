# V15.0.78 — RelationalCleanupWeightLocale

- Fix lỗi cân nặng: nhập `5,2 kg` / `5.2 kg` sẽ lưu đúng `5200 g` trong relational DB và hiển thị `5,2 kg` trên UI.
- Chuẩn hóa ô cân nặng/chiều cao/vòng đầu dùng bàn phím decimal và dấu phẩy theo định dạng Việt Nam.
- Supabase relational tables là source of truth duy nhất; sau mỗi save app ghi trực tiếp RPC rồi refetch database.
- Realtime tiếp tục theo mô hình signal → refetch TABLE; không truyền business payload qua websocket.
- Xóa runtime/UI legacy: Migration JSON → Relational DB, Relational Migration Doctor, Relational Delta Sync, Relational Read Mode, Relational Write Queue, Đẩy dữ liệu chính thức.
- Xóa persistent relational write queue trên thiết bị. Cache local chỉ dùng để hiển thị; không tự đẩy dữ liệu offline lên server.
- Gỡ Milk Doctor/Data Rescue legacy khỏi runtime để tránh code cũ tự dedupe/rebuild dữ liệu sạch.
- `meyeube_sync` vẫn là archive khóa ghi ở Supabase nhưng V15.0.78 không đọc/ghi nó.
