# V15.0.74 — RelationalSetupIndexGuardFix

## Mục tiêu

Sửa lỗi chạy `SUPABASE_SETUP.sql` khi bảng hiện hữu không có cột `deleted_at`, đặc biệt bảng `public.change_logs`.

## Nguyên nhân

Bản V15.0.73 tạo index chung dạng `(family_id, deleted_at)` cho nhiều bảng. Một số bảng log/server như `change_logs` có `family_id` nhưng không có `deleted_at`, nên Supabase báo `column deleted_at does not exist`.

## Cách sửa

- Index emergency rebuild kiểm tra schema thật trước khi tạo.
- Nếu bảng có `family_id` + `deleted_at`: tạo index `(family_id, deleted_at)`.
- Nếu không có `deleted_at` nhưng có `updated_at`: tạo index `(family_id, updated_at)`.
- Nếu không có `updated_at` nhưng có `created_at`: tạo index `(family_id, created_at)`.
- Nếu chỉ có `family_id`: tạo index `(family_id)`.
- Bỏ giả định mọi bảng đều có `deleted_at`.

## Phạm vi

Chỉ sửa SQL setup/index guard. Không đổi dữ liệu, không reset relational tables, không bật/tắt ReadMode hoặc WriteQueue.
