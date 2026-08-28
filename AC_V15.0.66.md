# AC V15.0.67 — RelationalReadMode

- Cloud Sync có thêm card **Relational Delta Sync**.
- Có nút **Preview Delta** để kiểm tra dữ liệu JSON legacy phát sinh sau migration.
- Có nút **Chạy Delta Sync** để đồng bộ phần lệch sang relational tables bằng stable ID/upsert.
- RPC `myb_preview_relational_delta_sync` trả `missing_counts`, `changed_counts`, `total_delta`.
- RPC `myb_sync_json_to_relational_delta` không xóa `meyeube_sync.data` và không bật RelationalReadMode.
- Sau Delta Sync có thể chạy lại Doctor để kiểm tra 25/25 trước bản RelationalReadMode.
