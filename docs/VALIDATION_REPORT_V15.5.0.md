# V15.5.0 — Báo cáo kiểm thử

Ngày 25/10/2026. Node 24.22.1. Nền ZIP V15.4.0 `(2)` Boss gửi, đã đối chiếu `(1)` giống nhau.

| Bộ kiểm tra | Assertion đạt | Trạng thái |
| --- | ---: | --- |
| release_check.py | Gate cấu trúc/cú pháp | PASS |
| test_binh_tui.js | 94 | PASS |
| test_chuyen_sua.js | 67 | PASS |
| test_fix_popup_chuyen_sua.js | 14 | PASS |
| test_giao_dien.js | 51 | PASS |
| test_loc_dang_dung.js | 38 | PASS |
| test_v1510_stored_feed_return.js | 16 | PASS |
| cold-start.cjs | 9 | PASS |
| data-safety.cjs | 74 | PASS |
| catalog-sql.cjs | 27 | PASS |
| catalog-runtime.cjs | 39 | PASS |
| service-worker.cjs | 3 | PASS |
| care-sql.cjs | 61 | PASS |
| care-runtime.cjs | 38 | PASS |
| health-sql.cjs | 56 | PASS |
| health-runtime.cjs | 53 | PASS |

Tổng **640 assertion đạt, 0 thất bại**; gate cấu trúc/cú pháp đạt riêng. Lượt đầy đủ npm test trả exit 0. Sau thay đổi cuối trong health (đọc ghi chú native và Undo extra chính xác), hai bộ health SQL/runtime và release check đã được chạy lại, đạt như bảng. Không có baseline exemption.

SQL dùng PostgreSQL nhúng PGlite với bảng, kiểu dữ liệu, FK/trigger và mapper theo schema cung cấp. Kiểm tra CRUD/soft delete, kg↔gram, stale etag, membership/family isolation, UUID hijack, stable native/legacy ID, plan/record atomicity, late-error rollback, per-record Undo, extra-field rollback, retirement writer cũ, migration chạy lại và quyền API anon so với bảng/helper private.

Full runtime jsdom nạp 13 script thật; RPC nối tới PostgreSQL fixture. Kiểm tra form số đo/vaccine/khám/thuốc/xét nghiệm/hồ sơ/thai kỳ, empty state, record ID khi mở form, ngăn chuyển người/config, giữ form khi lỗi, lookup mất ACK, khóa controls và bấm lặp, Undo, tăng trưởng sau sửa/xóa điểm cuối, metadata file/IndexedDB, bảo toàn care/milk khi đổi health, chặn snapshot/generic writer. Các bộ nền của V15.4 vẫn đạt.

Chưa kiểm chứng Supabase production, nhiều backend session PostgreSQL đồng thời, HTTP/PostgREST/Reatime thực, iOS/Android/PWA update/push/cảm biến hoặc file gốc trên thiết bị vật lý. Fixture health tập trung cột sử dụng, không phải clone toàn schema hoặc business rows. PGlite tuần tự hóa request; không chứng nhận contention đa session. File test xác minh metadata và thao tác store cục bộ, không thay thế đối chiếu byte/PDF trên thiết bị thật.

Bootstrap/realtime vẫn tải hết lịch sử theo các trang để giữ dashboard/biểu đồ cũ đủ dữ liệu. Chưa hoàn tất lazy loading, aggregate hoặc scoped realtime toàn app. Phân quyền người dùng và upload file lên Storage không thuộc bản này; giữ mô hình Sync ID hiện hữu.

Migration thứ tự 1530 → 1540 → 1550, hoàn tất queue cũ trước khi cài 1550; source mới chặn whole-profile writer cũ. Không reset business rows. Chưa push GitHub hoặc deploy trong lần bàn giao source.
