# AC V15.0.75 — TimeoutSafeDoctorBypassFix

- Bấm **Kiểm tra an toàn (local)** không tạo request tới `myb_relational_fast_duplicate_doctor`.
- Không còn lỗi UI `Fast duplicate doctor lỗi 500 / 57014` khi kiểm tra.
- SQL hotfix có thể chạy độc lập và không tạo index trước khi override Doctor.
- `myb_relational_fast_duplicate_doctor` sau hotfix không query bất kỳ bảng relational nào.
- `myb_emergency_rebuild_relational_from_legacy_v1575` backup JSON, dedupe, reset, migrate và không chạy Doctor hậu kiểm.
- Không tự động rebuild/reset khi deploy source; chỉ chạy khi người dùng bấm Cứu dữ liệu server.
