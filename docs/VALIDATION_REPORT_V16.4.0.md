# Kiểm thử V16.4.0

- `npm test`: **31/31 suite PASS**,0 miễn trừ. Sau lượt full, bổ sung kiểm tra registry không cản xóa hồ sơ rỗng; chạy lại media-sql **19 PASS** và release_check PASS. Chi tiết output/rerun trong TEST_RESULTS_V16.4.0.json.
- Media SQL:19 kiểm tra, gồm ownership/UUID, hash immutable, pending/unlinked, profile metadata ACK, Undo, rerun migration, private bucket/restrictive policy dù có policy rộng, oversized, profile xóa/Undo khi registry chỉ còn bản lưu.
- Edge source TypeScript được bỏ type bằng Node và chạy nguyên handler trong VM với Storage/RPC adapter giả lập:13 kiểm tra byte gốc/readback/hash, lost ACK retry, quyền theo Sync ID, URL120giây, giữ byte khi xóa liên kết, corrupt, commit failure, MIME/UUID. Chưa tải SDK Deno hoặc deploy function thật.
- Media client/DOM:19 kiểm tra byte IndexedDB, progress, stableID retry, network failure/recovery, tag đích, offline fallback, giới hạn size/MIME, order các trường2x2 và CSS constraints. Không phải kiểm tra render/geometry thực.
- Health runtime:56 kiểm tra với form thật+PostgreSQL fixture, upload transport giả lập. Upload lỗi giữ form/byte/pending; thử lại cùngID rồi lưu metadata, delete/Undo. Các suite chăm sóc, kho/feed ledger/transfer/Undo, catalog, health growth/vaccine, planning/settings/realtime/startup/PWA giữ nguyên gate và đã PASS.
- `python3 release_check.py`: PASS sau chỉnh code cuối. Kiểm tra ZIP và SHA256 thực hiện lúc đóng gói.

Không có quyền/kết nối Supabase production; không có live Storage/WebSocket, Safari/iPhone hay pixel/layout browser QA. Chưa push/deploy. Chỉ xác nhận source/local fixtures; Boss cần chạy hướng dẫn triển khai và kiểm chứng2thiết bị trước khi dùng Cloud files. Không hứa media các module khác đã chuyển: avatar/cột mốc/timeline vẫn giữ luồng cũ. File không có bản gốc không thể tự khôi phục.
