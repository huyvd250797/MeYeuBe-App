# AC V15.0.65 — RelationalMigrationDoctor

- Sau khi chạy JSON → Relational migration, Cloud Sync có thêm card **Relational Migration Doctor**.
- Doctor gọi RPC `myb_relational_migration_doctor` để kiểm tra dữ liệu theo `sync_id`.
- Doctor chỉ đọc dữ liệu, không ghi/sửa/xóa row relational và không thay đổi `meyeube_sync`.
- Báo cáo trả về `summary`, `source_counts`, `target_counts`, `detail_counts`, `checks`.
- Kiểm tra các nhóm quan trọng: core/family, Sổ sức khỏe, Care events, Kho sữa ledger, Tiêm chủng, Media, duplicates, orphan rows.
- Nếu còn `errors > 0`, app chưa nên bật RelationalReadMode.
- App vẫn giữ normal write mode là `unchanged_legacy_json`.
