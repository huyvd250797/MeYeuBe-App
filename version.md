# V15.0.67 — RelationalReadMode

- Thêm chế độ đọc thử dữ liệu từ relational tables trong Cloud Sync.
- Mặc định tắt; chỉ bật khi Migration Doctor đạt passed và Delta Sync = 0.
- Thêm RPC `myb_relational_read_preflight` và `myb_export_relational_legacy_payload`.
- Khi đọc relational, app dựng lại payload tương thích UI hiện tại, vẫn giữ `meyeube_sync` làm backup legacy.
- Chưa chuyển normal write sang relational: thêm/sửa/xóa vẫn đi qua JSON legacy/Cloud Queue để an toàn.
- Nếu phát sinh dữ liệu mới sau khi bật Read Mode, app tự đánh dấu pending delta và fallback legacy cho đến khi chạy Delta Sync + Doctor lại.

# V15.0.67 — RelationalReadMode

- Thêm công cụ Delta Sync để đồng bộ dữ liệu JSON legacy phát sinh sau migration sang relational tables.
- Thêm RPC preview/chạy delta: `myb_preview_relational_delta_sync`, `myb_sync_json_to_relational_delta`.
- Delta Sync giữ `meyeube_sync` làm backup legacy, không bật RelationalReadMode và không đổi normal app write mode.
- Hỗ trợ kiểm tra `missing_counts`, `changed_counts`, `total_delta` trước khi chạy.

# V15.0.67 — RelationalReadMode

- Sửa lỗi chạy `SUPABASE_SETUP.sql` trên Supabase project đã có bảng legacy thiếu cột `family_id`.
- Thêm compatibility repair block trước index/trigger/RLS để tự bổ sung `family_id`, `created_at`, `updated_at`, `deleted_at` khi cần.
- Vá riêng bảng legacy `push_subscriptions` để không còn lỗi policy `push_subscriptions_family_all`.
- Không thay đổi cơ chế app hiện tại; relational tables vẫn chưa là nguồn đọc/ghi chính.

# V15.0.67 — RelationalSchemaOrderFix

- Sửa lỗi chạy SQL schema trong Supabase bị `relation "public.family_users" does not exist`.
- Tạo bootstrap `families` và `family_users` trước hàm `myb_can_access_family`.
- Giữ nguyên phạm vi V15.0.62: chỉ chuẩn bị schema + migration tool, chưa chuyển app sang đọc/ghi relational tables.

# V15.0.67 — RelationalSchemaOrderFix

- Thêm công cụ migration JSON legacy `meyeube_sync.data` sang relational tables.
- Thêm RPC `myb_preview_json_migration`, `myb_migrate_json_to_relational`, `myb_relational_migration_status`.
- Thêm UI trong Cloud Sync để kiểm tra/chạy migration thủ công.
- Giữ `meyeube_sync` làm backup legacy, chưa đổi app sang đọc/ghi table mới.
- Dọn file setup Supabase trùng tên, chỉ giữ `SUPABASE_SETUP.sql`.

# V15.0.67 — RelationalSchemaOrderFix

- Tạo nền tảng database quan hệ nhiều table cho Supabase.
- Giữ `meyeube_sync` làm backup legacy, chưa cho app ghi table mới.
- Thêm schema, RLS theo `family_id`, trigger `updated_at`, `change_logs`, `media_files`.

# V15.0.67 — RelationalSchemaOrderFix

Nâng cấp module Tiêm chủng riêng trong Sổ sức khỏe, dữ liệu hiển thị lại trong phần Tiêm chủng hiện có.

# V15.0.67 — BabyMetricEntrySaveFix

- Fix chức năng khai báo chỉ số bé: lưu xong hiện dữ liệu ngay trong Sổ sức khỏe/Dashboard/Tăng trưởng.
- Ghi vào đúng hồ sơ đang chọn, mirror dữ liệu Bé sang db.baby để biểu đồ WHO và dashboard đọc được.
- Giữ nguyên Cloud Save Queue, không ảnh hưởng các luồng thêm/sửa/xóa khác.
