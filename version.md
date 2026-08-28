# V15.0.61 — RelationalSchemaFoundation

- Tạo nền tảng database quan hệ nhiều table cho Supabase.
- Giữ `meyeube_sync` làm backup legacy, chưa cho app ghi table mới.
- Thêm schema, RLS theo `family_id`, trigger `updated_at`, `change_logs`, `media_files`.

# V15.0.61 — RelationalSchemaFoundation

Nâng cấp module Tiêm chủng riêng trong Sổ sức khỏe, dữ liệu hiển thị lại trong phần Tiêm chủng hiện có.

# V15.0.61 — BabyMetricEntrySaveFix

- Fix chức năng khai báo chỉ số bé: lưu xong hiện dữ liệu ngay trong Sổ sức khỏe/Dashboard/Tăng trưởng.
- Ghi vào đúng hồ sơ đang chọn, mirror dữ liệu Bé sang db.baby để biểu đồ WHO và dashboard đọc được.
- Giữ nguyên Cloud Save Queue, không ảnh hưởng các luồng thêm/sửa/xóa khác.
