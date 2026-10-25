# V16.0.0 — Kiểm thử và giới hạn

Ngày 26/10/2026. Nền: ZIP MeYeuBe_v15.9.0.zip Boss gửi. Node24.22.1; PGlite0.5.11; jsdom30.1.3; fake-indexeddb6.2.6.

**25/25 suite PASS; 0 unexpected failures; 0 baseline exemptions.** Toàn bộ output: TEST_RESULTS_V16.0.0.json. Lượt regression cuối chạy sau khi tách component/controller và tích hợp các dependency mới. Sau đó bổ sung3 case modal/preflight và chạy lại riêng integration21/21 PASS; runtime không đổi.

## Kiểm tra mới:45 assertion

- 24 component contracts: nhiều update chỉ một listener; escape label/source ID; unmount/remount; input delegation; dispose timer; nested modal/focus/lock; lặp mở/đóng không giữ owner; Escape khi busy; chặn double submit; chờ ACK; giữ input khi lỗi; khôi phục disabled gốc/lock chồng; FormSnapshot và teardown.
- 21 integration với HTML/form/API thật nối fixture: registry renderer production được gọi, startup full;15 chu kỳ form; popup con giữ khóa cha;30 lần render picker vẫn một thao tác; gõ ml/chọn/xóa/chọn lại; chọn chưa ghi kho; lưu qua typed API, số dư/taken/waste; đóng overlay sau ACK; Undo; modal sức khỏe chỉ một Save callback sau nhiều lần dựng; preflight1600 không thay schema; loading không mở sớm và không lỗi uncaught.

## Hồi quy

Các suite cũ đều PASS: UI bình/túi/chuyển sữa/lọc; offline cache/outbox/destination/nháp; catalog SQL/runtime; service worker; care SQL/runtime (stored/direct, nhiều nguồn, sửa/chuyển/hủy/Undo/timer/timeout/lost ACK); health SQL/runtime (hồ sơ, số đo, vaccine, khám/thuốc/xét nghiệm, file, thai kỳ); planning SQL/runtime (nhật ký/lịch/cột mốc/tháng); settings/scoped SQL/runtime; startup và Scoped Realtime.

Đối chiếu byte với ZIP nguồn: toàn bộ file Supabase có từ bản15.9 giữ nguyên; chỉ thêm1600 SELECT preflight. Không sửa schema/business rows hoặc xóa cache/pending/file.15 function implementation chuyển sang component (29,727 byte source); đây không phải số byte giảm tổng bundle hay benchmark tốc độ.

## Giới hạn

Chưa chạy Supabase production, publication/RLS/WebSocket mạng thật, đa session PostgreSQL thực hoặc iPhone/PWA vật lý. Dữ liệu/mạng là fixture và mock transport. Chưa push/deploy. Một số template và wrapper legacy trong app.js còn giữ; local ACK vẫn dùng full render ở các màn cũ. Không tuyên bố chuyển xong toàn bộ ứng dụng hay đảm bảo không còn mọi lỗi.

Cài: DB đã1590 không cần migration mới. Cập nhật đầy đủ ZIP/src/ui/PWA; TXT1600 chỉ kiểm tra API metadata. Xem README cho cách chạy/test/deploy và quay frontend15.9 nếu cần. Next16.1 Design System chưa triển khai.
