# AC V15.0.74 — RelationalSetupIndexGuardFix

- Chạy `SUPABASE_SETUP.sql` không còn lỗi `column deleted_at does not exist` tại bảng `change_logs`.
- Index emergency rebuild chỉ được tạo khi bảng/cột thật sự tồn tại.
- `change_logs` dùng index theo `family_id` + `created_at/updated_at` thay vì ép dùng `deleted_at`.
- Không thay đổi dữ liệu người dùng.
- Không tự reset/rebuild relational tables.
- Không tự bật/tắt ReadMode hoặc RelationalWriteQueue.
