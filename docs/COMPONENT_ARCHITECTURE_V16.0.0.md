# V16.0.0 — Component Architecture

Nền: ZIP MeYeuBe_v15.9.0.zip Boss đính kèm. Không có credentials/business rows production, không push/deploy.

## Trách nhiệm

| Module | Trách nhiệm |
| --- | --- |
| src/ui/runtime.js | Component registry; mount/update/destroy theo root; EventScope; ActionController; FormLock/status/snapshot; DOM-ready gate |
| src/ui/overlays.js | Theo dõi popup component, focus/Tab/Escape, timer hủy khi đóng, giữ scroll-lock khi còn popup cha/con |
| src/ui/components | Renderer thực đã chuyển khỏi app.js, component picker/source card và delegated list |
| src/ui/render-coordinator.js | Phụ thuộc render nền, dedupe renderer, giữ scroll bằng finally, cập nhật paged list |
| src/features/care/milk-selection-service.js | Tính capacity/pool/allocation từ số dư hiện có và snapshot nguồn đang sửa; không DOM/storage/RPC |
| src/features/care/milk-selection.js | Controller đọc form và gọi service/components; chọn nguồn chưa ghi database |
| src/features/*/ui.js | Điều phối nghiệp vụ, controller lưu chung, adapter cho nút/luồng hiện hữu |
| src/data + feature service | Giữ API/query/validation/ACK/OCC/operation UUID như15.9 |

Đã chuyển 15 function implementation (29727 byte source) khỏi app.js. Manifest COMPONENT_EXTRACTION liệt kê chính xác từng hàm. Đây là số byte chuyển vị trí, không phải giảm tổng bundle hoặc đo tốc độ. Thư viện component là JavaScript IIFE hiện hữu, không thêm framework/dependency/build mới.

## Component thực đang chạy

Dashboard; timeline gốc dự phòng, nv6 paged và tl8 hiện tại; care stats; thẻ/danh sách kho; loading show/hide; mở/đóng form chăm sóc; mở/đóng modal sức khỏe; reset form lịch hẹn; danh sách bản ghi. Global adapter gọi registry, các wrapper filter/swipe đang dùng vẫn được giữ để không đổi hành vi. Các template khác, đặc biệt nhiều phần của health/planning, vẫn còn trong app.js. Không tuyên bố toàn bộ monolith đã chuyển xong.

Milk picker/source card nhận model đã định dạng và phát named actions. Delegation được gắn một lần/root; render lại chỉ cập nhật props/markup. Unmount gỡ listener/timer; mở lại tạo đúng một owner. Không ghép bag ID vào JavaScript onclick cho các card mới. Các nút shell cũ vẫn gọi global adapter.

## Điều phối lưu và popup

ActionController chung cho care/health/planning/settings: một request đang chạy thì lần gửi tiếp trảfalse; khóa controls của owner, giữ disabled gốc (kể cả lock chồng), mở khóa trong finally. Chỉ success sau ACK; lỗi giữ input và nháp, dùng textContent để hiển thị. UUID command/pending vẫn do repository sở hữu, controller không xóa hoặc thay.

Feature giữ trạng thái editing/finishing để hoàn tất form, Undo và return context như cũ. Callback capture một số form sức khỏe và wrapper lịch sử vẫn cần cho các màn chưa chuyển. Không tự hủy request ghi đang chờ ACK khi đóng component.

Overlay manager giữ popup cha khi đóng picker con; clone/replace callback Save của modal sức khỏe vẫn giữ hợp đồng cũ. Component timer focus được hủy khi đóng; Escape gọi adapter nên vẫn kiểm tra busy của form. Không tự dọn tất cả listener global legacy ngoài phạm vi vì có gesture/scroll đang dùng.

## Startup và realtime

start() chờ DOMContentLoaded thông qua mybUI.ready để feature scripts parse xong, rồi bootstrap đầy đủ như15.8/15.9. Loading vẫn bị chặn đóng khi startup chưa ready. Realtime dùng coordinator, không đi qua global render. Draft/pending/modal và late response vẫn hoãn như15.9; SQL1590 nguyên trạng.

Local ACK vẫn dùng một số global render cũ để giữ behavior, được settings FormSnapshot bảo vệ khi có draft. Không tuyên bố mọi màn đã chuyển sang cập nhật granular hoặc tải app nhanh hơn. Việc thêm module làm thay số request asset, không phải bản performance16.2.

## Database và nâng cấp

Không thay schema, function hay business rows. Giữ nguyên từng byte migrations1530–1590. File1600 chỉ SELECT metadata8 API, không chạy business query. DB đã1590 chỉ cần cập nhật đầy đủ source và PWA, đặc biệt src/ui; không reset cache/file/queue/nháp. Rollback frontend15.9 dùng cùng database1590.

Giới hạn kiểm chứng: PGlite/jsdom và transport mock, chưa Supabase/WebSocket/đa session PostgreSQL thực/iPhone vật lý. Báo cáo TEST_RESULTS/VALIDATION_REPORT hiện tại ghi kết quả thực. Next16.1 Design System chưa bắt đầu.
