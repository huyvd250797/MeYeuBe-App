# AC V15.0.61 — RelationalSchemaFoundation

- Source vẫn giữ bảng legacy `meyeube_sync` làm backup, chưa chuyển app sang ghi table mới.
- Có file schema mới `supabase/RELATIONAL_SCHEMA_V15_0_61.sql`.
- `SUPABASE_SETUP.sql` và `supabase_setup.sql` có đầy đủ schema relational foundation.
- Có nhóm table core: `families`, `family_users`, `devices`, `app_settings`.
- Có nhóm table Sổ sức khỏe: `health_members`, `health_measurements`, `health_visits`, `health_medications`, `health_allergies`, `health_labs`.
- Có nhóm table Tiêm chủng: `vaccine_catalog`, `vaccine_schedule_templates`, `child_vaccine_plans`, `vaccine_records`, `vaccine_reminders`.
- Có nhóm table Chăm sóc/Kho sữa: `care_events`, `feed_events`, `pump_events`, `milk_items`, `milk_transactions`, `feed_milk_sources`, view `milk_item_balances`.
- Có `change_logs` phục vụ realtime/operation queue sau này.
- Có `media_files` để lưu metadata file, file thật lưu Supabase Storage/IndexedDB.
- Các table mới có `updated_at`, `version`, `deleted_at`/tombstone theo nhu cầu.
- Có trigger cập nhật `updated_at`.
- Có RLS theo `family_id` qua helper `myb_can_access_family()` cho chế độ Auth/RPC migration sau này.
