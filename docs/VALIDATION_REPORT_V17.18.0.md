# V17.18.0 — Validation

63 suites PASS sau cập nhật kiểm tra cascade stylesheet cho module mới và chạy lại các suite bị ảnh hưởng. Không miễn trừ baseline. Xem TEST_RESULTS_V17.18.0.json.

- npm ci bằng lockfile, không thêm dependency ứng dụng.
- Build Node 24 với kiểm tra AST parity, bản production chạy 110 kiểm tra tích hợp.
- New memory suite chạy handler TypeScript thực tế qua stripTypeScriptTypes và SQL migration thực tế trên PGlite. Google OAuth/Drive HTTP được mock: fixed folder multipart/related, share permission, SQL commit, replay lost ACK, conflict, read/image không Sync ID, share failure không commit, soft delete và quyền anon bảng.
- jsdom kiểm tra draft giữ lại khi lỗi và tính tuổi ngày nhuận. Không xác nhận pixel, canvas JPEG thật hoặc thao tác Safari/PWA iPhone.
- Schema/function mới cần deploy và Google secrets thật trước khi sử dụng. Chưa upload ảnh thật, chưa xác nhận Drive tài khoản Boss, chưa push/deploy.
- Migration nền và nghiệp vụ cũ được giữ. Không xóa dữ liệu cũ, không chuyển các attachment cũ từ Supabase Storage sang Drive.
- ZIP kiểm tra allowlist, syntax, checksum, không chứa node_modules/dist/secrets/dữ liệu cá nhân.
