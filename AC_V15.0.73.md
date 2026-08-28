# AC V15.0.74 — EmergencyRelationalRebuildNoDoctor

- Fast Doctor không còn scan duplicate trực tiếp trên relational tables, tránh lỗi Supabase `57014 statement timeout`.
- Nút Cứu dữ liệu server backup JSON hiện tại trước khi sửa.
- Rebuild relational từ JSON đã dedupe, không chạy Doctor nặng sau rebuild.
- Thêm index theo `family_id, deleted_at` cho các bảng lớn để reset/rebuild nhanh hơn.
- Giữ `meyeube_sync` làm backup legacy và giữ toàn bộ công cụ Migration/Doctor/Delta.
