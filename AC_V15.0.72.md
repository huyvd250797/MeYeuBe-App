# AC V15.0.72 — RelationalDataRescueDedupeFix

- Có Fast Duplicate Doctor, không gọi backfill nặng nên tránh timeout 500.
- Có backup dữ liệu trước khi sửa trong `relational_recovery_backups`.
- Có chức năng dedupe legacy JSON theo khóa nghiệp vụ.
- Có chức năng rebuild relational tables từ JSON đã dedupe.
- Snapshot write queue dedupe payload trước khi ghi vào legacy/relational.
- Có UI Data Rescue & Dedupe trong Cloud Sync.
- Có nút tắt ReadMode/WriteQueue cục bộ để ngăn tiếp tục ghi bẩn trong lúc cứu dữ liệu.
