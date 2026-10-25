# V16.3.0 — Kiểm thử và giới hạn

Ngày26/10/2026. Nền: ZIP MeYeuBe_v16.2.0.zip Boss gửi. Node24.22.1, jsdom30.1.3, PGlite0.5.11, fake-indexeddb6.2.6. Không business rows/credentials production.

## Kết quả phát hành

Bộ npm test có28 suite, không baseline exemptions. Output đầy đủ: TEST_RESULTS_V16.3.0.json. Kiểm tra mới PWA chạy26 assertion: install thiếu asset/HTML giả code/HTML khác build bị từ chối, giữ cache trước, không autoactivate, không forced navigation, activate chủ động, cache theo build/offline, không can thiệp cross-origin, theme thiết bị, chặn update khi form/generic pending, kiểm tra lại lúc controller đổi; guard tải lại/draft/save ACK; legacy import/restore không ghi; pull refresh không clear shell; JSON UI được gỡ; splash/loader có version.

Components-runtime chạy22 assertion với form/controller thật nối SQL fixture; gồm một case mới: Cloud refresh bị chặn khi form chăm sóc thực đang mở. Giữ tất cả assertion kho/nguồn/ACK/số dư/Undo và popup/listener. Design-system15 assertion parse đủ4 stylesheet, giữ31 khối legacy byte/order, viewport zoom, semantic contrast/theme/status. Test giao diện51 assertion PASS trong lượt kiểm tra sau cùng. Structure/syntax và service worker offline4 assertion cũng được chạy riêng sau thay đổi.

Lượt đầu full suite có service-worker fail vì mock CacheStorage chưa có open/scope cho API mới; đã cập nhật mock theo CacheStorage và chạy lại đầy đủ, không xóa assertion. Các lượt chạy riêng bổ sung đều có output được ghi cùng report nếu sau full run.

## Hồi quy dữ liệu

Care/milk/catalog/health/planning/settings/scoped/startup/realtime/components đều được chạy. Bao gồm stored/direct, nhiều nguồn, sửa/xóa/chuyển/hủy/Undo, ACK/timeout/lost ACK/pending, file/nháp, startup chưa đủ labs vẫn khóa và reconnect/scoped reads.

Tất cả file Supabase có từ ZIP16.2 được đối chiếu byte và giữ nguyên. Không DDL/DML migration mới, không sửa DB production, không xóa file/backup/queue. Các lệnh import/restore snapshot không còn đường ghi trong6 implementation gốc và adapter mới. Chưa triển khai import/restore theo từng bản ghi; backup history chỉ xem trước/xuất.

## Giao diện và giới hạn

Đã dùng đúng class careDateTimeRow và phần tử hb2QA từ source để sửa grid/native input/foreground. Mobile≤600px form về một cột; cấu hình dashboard có nhãn/help/field riêng; giữ conditional hidden/display none. CSS/DOM parse và hợp đồng được kiểm tra tự động, không phải đo hình học/layout thật.

Trình duyệt cloud không truy cập được server local (connection refused); URL preview nội bộ cũng không được môi trường cho phép. Đã dừng cách kiểm tra browser này, không có screenshot render được và không tuyên bố visual QA trên Chromium/Safari. Chưa thử Safari/iPhone/PWA vật lý, native date picker, offline nhiều tab trên thiết bị thực hoặc pixel/scroll. Checklist sau deploy ở PWA_RELIABILITY_V16.3.0.md.

Database/mạng là PGlite fixture và mock transport, chưa Supabase production/publication/RLS/WebSocket hoặc đa session PostgreSQL thật. Hành vi giữ một cache trước và không ép reload đã được kiểm tra mô phỏng worker, cần xác minh lifecycle thực khi phát hành. Còn app.js/global adapters lớn, chưa hoàn tất component hóa/lazy loading. Chưa push/deploy.

## Vận hành

Không cần chạy migration, không gửi TXT. Cập nhật toàn source gồm forms.css và Cloud controls/boot/SW, kiểm tra V16.3.0 trên splash và chờ dashboard đủ. Lưu/đóng form, đối chiếu pending trước cập nhật. Không xóa browser data để ép cập nhật. Rollback frontend16.2 giữ DB1590, file/nháp/operations. Tiếp16.4 Media Storage chưa triển khai.
