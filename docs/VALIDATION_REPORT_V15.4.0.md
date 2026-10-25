# V15.4.0 — Báo cáo kiểm thử

Ngày 25/10/2026. Nền V15.3.0; schema PostgreSQL 17.6 do Boss cung cấp.

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

Tổng: **531 assertion đạt, 0 thất bại**; gate cấu trúc/cú pháp đạt riêng. `npm test` trả exit code 0. Không có baseline exemption. Cả 8 assertion lỗi kế thừa được sửa mà giữ kiểm tra nghiệp vụ gốc; các assertion nhãn phiên bản cập nhật sang 15.4.0.

SQL tests chạy migration thật trên PGlite, bảng quan hệ/constraint/trigger/view theo schema cung cấp; kiểm tra transaction, idempotency, stale write, ledger offset, nhiều nguồn, chuyển tiếp, ID hijack, Undo, pagination revision và rollback khi lỗi muộn. Runtime jsdom nạp đủ module thật và nối RPC tới PostgreSQL fixture, kiểm tra form pump/feed/transfer/cancel/timer/sleep, ổn định ID, mất mạng/mất ACK, giữ form, khóa controls, config và chặn snapshot cũ.

Phạm vi chưa kiểm chứng: Supabase production/RLS với role thật, nhiều backend session đồng thời, thiết bị iOS/Android/PWA update/push nền/cảm biến và dữ liệu nghiệp vụ thực. PGlite tuần tự hóa request; kiểm tra khóa chung và thứ tự khóa metadata không thay thế bài thử đa session PostgreSQL thực. Fixture danh mục vẫn dùng hợp đồng RPC cũ; cần đối chiếu danh mục cùng care trên bản sao Supabase trước khi phát hành.

Bootstrap/realtime vẫn tải toàn lịch sử care/milk qua các trang để giữ dashboard cũ đủ dữ liệu. Các module ngoài care/milk và danh mục chưa chuyển sang API mới. Không coi đây là bản đã hoàn tất tối ưu toàn app.

Migration cần chạy theo thứ tự 1530 rồi 1540. Không reset DB. Source chưa push GitHub/deploy trong lần bàn giao này.
