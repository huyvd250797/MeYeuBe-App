# Dọn file không cần thiết — V15.2.0

Runtime app.js/boot.js/index.html/relational-v1577.js/sw.js/manifest/build, icon, source functions và SQL Realtime được giữ nguyên byte so với gói đầu vào. Không xóa chức năng, không đổi phiên bản, không thêm đăng nhập.

## File đã loại bỏ trong lần này

- `AC_V15.0.77.md`
- `AC_V15.1.0.md`
- `BASELINE_LOCK_V15.0.1.json`
- `CHECKSUMS_V15.0.77.sha256`
- `CHECKSUMS_V15.1.0.sha256`
- `PUSH_NOTIFICATION_SETUP.md`
- `README_CUTOVER_V15.0.76.md`
- `README_V15.0.77_REALTIME.md`
- `RELEASE_CHECKLIST.md`
- `SUPABASE_HOTFIX_V15.0.75.sql`
- `VALIDATION_REPORT_V15.0.77.md`
- `VALIDATION_REPORT_V15.1.0.md`
- `docs/ADR/README.md`
- `docs/API/README.md`
- `docs/DATABASE/01_Data_Audit.md`
- `docs/DATABASE/02_JSON_to_Supabase_Mapping.md`
- `docs/DATABASE/03_Data_Dictionary.md`
- `docs/DATABASE/04_ERD.md`
- `docs/DATABASE/05_SUPABASE_SCHEMA_V11.sql`
- `docs/DATABASE/06_Migration_Guide.md`
- `docs/DATABASE/07_Sync_Architecture.md`
- `docs/JSON_TO_RELATIONAL_MIGRATION.md`
- `docs/RELATIONAL_DATA_RESCUE_DEDUPE_FIX.md`
- `docs/RELATIONAL_EMERGENCY_REBUILD_NO_DOCTOR.md`
- `docs/RELATIONAL_MIGRATION_DELTA_SYNC.md`
- `docs/RELATIONAL_MIGRATION_DOCTOR.md`
- `docs/RELATIONAL_MILK_DEDUPE_CONTAINER_FIX.md`
- `docs/RELATIONAL_ONLY_CUTOVER_V15_0_76.md`
- `docs/RELATIONAL_PRODUCTION_PUSH.md`
- `docs/RELATIONAL_READ_MODE.md`
- `docs/RELATIONAL_SCHEMA_FOUNDATION.md`
- `docs/RELATIONAL_SETUP_INDEX_GUARD_FIX.md`
- `docs/RELATIONAL_TIMEOUT_SAFE_DOCTOR_BYPASS_V15_0_75.md`
- `docs/RELATIONAL_WRITE_QUEUE.md`
- `docs/RELEASE/README.md`
- `docs/SMART_ALERT_CRON_SETUP.md`
- `docs/SOURCE_INVENTORY_V15.2.0.md`
- `docs/SUPABASE_CLOUD_DB_MODE.md`
- `docs/SUPABASE_DELETE_TOMBSTONE_FIX.md`
- `docs/archive/release_check_v1510.py`
- `relational-v1576.js`
- `script0.js`
- `script1.js`
- `script2.js`
- `script_inline_0.js`
- `version.md`

## Thành phần được giữ

- Source chạy app, PWA/icon và cấu hình build.
- Source hai Edge Functions và SQL Realtime hiện hành.
- package/lockfile, release checker, toàn bộ test, kể cả test đang có lỗi baseline.
- README, CHANGELOG, ROADMAP; tài liệu data safety và báo cáo kiểm thử.

Không đọc hay xóa dữ liệu trong database hoặc bộ nhớ trình duyệt. Bản source trước vẫn có trong lịch sử file. Các file SQL recovery và tài liệu chuyển đổi JSON lịch sử không được yêu cầu bởi runtime hiện tại.

Kiểm tra của lần dọn: tham chiếu tài nguyên, cú pháp, checksum, tên file không phân biệt hoa/thường và đối chiếu hash runtime. Kết quả nghiệp vụ trước đó (355 pass, 8 lỗi baseline) được giữ trong báo cáo; không đổi thành pass để dọn source.
