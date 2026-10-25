# V15.8.0 — Legacy Removal

## Đã làm
Gỡ 18 IIFE legacy khỏi app.js: Cloud DB Mode1544, theme guard1544, merge guard1545, tombstone1546, startup watchdog1551, health merge1552/save-conflict1553, data-authority1554/realtime1555, snapshot-save-queue1558, migration1562, doctor1565, delta1566, ReadMode1567, WriteQueue1568, production push1569, dedupe1570 và rescue1572. Danh sách và số byte: LEGACY_REMOVAL_V15.8.0.json. Các comment lịch sử ngoài block không ảnh hưởng runtime có thể còn.

Cache IndexedDB tách sang src/data/cache.js, giữ meYeuBeCloudDBMode_v1/state/main và đọc data của bản trước. Không merge/richness selection, không gửi cache lên server. Không xóa database/queue local hay file đính kèm.

Settings save/reset/move/toggle gọi repository trực tiếp, không thay global save/load/render trong callback. Nhóm hiện có và OCC/idempotency giữ nguyên.

Bootstrap dùng chung promise cho start; bỏ reload1600ms và unlock4200ms. Mở đầy đủ lịch sử qua API1530–1570 trước khi render dashboard và mới đóng cả splash/loading. hideAppLoading và hideSplash bị chặn trước ready, nên wrapper cũ không làm lộ dashboard trống. Request khởi động timeout20s; lỗi hiển thị nguyên nhân và retry/config. Không báo ready sau lỗi/offline, không xóa pending để ép chạy.

## Còn giữ có chủ đích
- Generic queue cho noise/lux/activity/app_member chưa có typed replacement; đọc và export queue/draft cũ, không tự xóa hay chuyển đích. So sánh snapshot của module typed chỉ để phát hiện/chặn bypass. Standalone diagnostics không nạp repository vẫn có delta compatibility.
- Health form callback adapters và các wrapper giao diện còn liên quan; chưa viết lại component toàn app. Không tuyên bố gỡ hết legacy.
- Các RPC cũ được API catalog/compatibility gọi; không DROP function/table, không xóa legacy_id/UUID hay đổi FK.
- Body/menu/renderers/dashboard cũ còn phục vụ chức năng đầy đủ. scoped SQL/calendar API1570 giữ để dùng khi cần; startup mặc định full theo yêu cầu Boss. Tải đầu có thể chậm hơn chế độ nhẹ15.7.

## Cài đặt
Đã có migration1530→1570 thì chỉ cập nhật source. 1580 là preflight chỉ đọc: xác nhận RPC cần thiết tồn tại; không DDL/DML business data. Nếu thiếu API, cài migration còn thiếu theo thứ tự và thử lại. Giữ nguyên Supabase URL/key/SyncID của gia đình. Không có Auth/Storage mới. Backend model SyncID hiện hữu không được coi là nâng cấp xác thực.

## Kiểm thử
Bộ hồi quy cũ cộng startup-v158: cố tình giữ API chậm hơn watchdog cũ, gọi hide sớm, đợi full/render, kiểm tra block cũ không khởi tạo, lỗi tải và retry. PGlite/jsdom là fixture, không phải Supabase/thiết bị thật. Báo cáo TEST_RESULTS_V15.8.0.json.
