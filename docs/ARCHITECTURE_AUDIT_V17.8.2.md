# V17.8.2 — Architecture Audit & Cleanup

## Phạm vi và bằng chứng
Source là ZIP Boss cung cấp (root GitHub export), không dùng bản làm việc cũ. Inventory tự sinh bởi `python3 tests/architecture-audit.py`: thứ tự script, khai báo hàm có dòng, các lần gán hàm global và inline handlers. Đây là kiểm kê lexical, có cả hàm lồng; KHÔNG phải call graph/coverage, không tự kết luận dead code từ số lần tham chiếu.

## Bản đồ nghiệp vụ và chủ sở hữu hiện tại
| Nhóm | Còn trong app.js | Chủ sở hữu runtime / phụ thuộc |
| --- | --- | --- |
| Nền dữ liệu | normalize, model helpers, load/save ban đầu | relational-v1577.js thay load/save, quản lý startup, outbox, bridge; health/ui.js bọc load để chiếu hồ sơ |
| Chăm sóc | parse/validate form, timer, careSummaryForDate, ngày/giờ | care/ui.js → care/service.js → care-repository.js → client.js → RPC; bridge nhận ACK rồi cập nhật cache |
| Kho sữa | form chuyển sữa, chi tiết, swipe, Undo UI, ledger helpers cũ | care service/RPC sở hữu ledger; milk-selection-service.js và picker UI quản lý lựa chọn chưa lưu |
| Hồ sơ sức khỏe | hb2 form, active member, vaccine, khám/thuốc/xét nghiệm | health/ui.js bọc hb2Commit và callbacks; health/service.js + repository quản lý bản ghi native/OCC |
| Thai kỳ / tăng trưởng | phép tính và render biểu đồ | health UI quản lý write; visible-render.js hoãn chart bị ẩn |
| Nhật ký / lịch / cột mốc | editor, lịch calendar, hàm thống kê | planning/ui.js/service.js/repository.js; scoped/ui.js guard dữ liệu đầy đủ |
| Dashboard | config, mục tiêu, helpers tính toán | components/dashboard.js sở hữu renderer; scoped/ui.js bọc readiness; ngày chọn nằm trong component |
| Cài đặt / theme | default config, form, thiết bị | settings-repository.js và scoped/ui.js lưu theo nhóm; theme thiết bị không ghi đè cài đặt gia đình |
| Cloud / realtime | API JSON và wrappers lịch sử còn khai báo | relational-v1577.js chặn đường ghi JSON; realtime/ui.js + render-coordinator.js cập nhật scope |
| Media / backup / notifications | form/hook tương thích và sensor | features/media, backup, notifications; backend Supabase giữ nguyên |
| Hiển thị | nhiều HTML/string/template cũ | runtime.js, overlays.js, form-footers, form-viewport, accessibility; CSS legacy còn giữ |

## Các chuỗi ghi đè đã rà
- `load`: app.js → relational-v1577.js → health/ui.js (chiếu dữ liệu health). Không xóa bản đầu chỉ vì có bản cuối: khởi tạo app chạy trước adapter.
- `save`: app.js và lớp bảo vệ tài liệu → relational-v1577.js. Guard và durable pending cần giữ.
- `saveCareEvent`: renderer/form cũ → care/ui.js; luồng thực tế await ACK, không được gọi save snapshot thay thế.
- `hb2Commit`: app.js active-member fix → health/ui.js các capture/commit adapters; có closures giữ bản trước.
- `renderDashboard`: component registry → scoped/ui.js readiness adapter. Tách file chưa đồng nghĩa bỏ phụ thuộc helper app.js.
- `cloudAutoPullOnBoot`, `cloudApplyRemotePayload`: các wrappers app.js → relational-v1577.js chặn JSON. Chưa xóa cả chuỗi vì còn capture bản trước và startup/shape guards.

Xem JSON để biết đầy đủ file/dòng và thứ tự. Trùng tên trong các scope khác nhau KHÔNG phải lỗi trùng global.

## Đã loại bỏ
- Thân thông báo kết nối nằm sau unconditional return; hai helper private chỉ phục vụ thân không thể chạy này. Giữ no-op adapter để các caller không thay đổi.
- Banner chú thích mô tả cơ chế snapshot/watchdog đã lỗi thời và khoảng trắng dư; không coi đây là loại bỏ toàn bộ logic Cloud.
- File ngoài allowlist bàn giao: backup dữ liệu cá nhân, script trích xuất, checksum/report cũ, SQL preflight lịch sử và module drafts không được HTML/SW tham chiếu. Danh sách đường dẫn/kích thước ở CLEANUP_METRICS. Không chứa nội dung backup trong báo cáo. Migration đang được builder hỗ trợ vẫn giữ nguyên; không chạy/xóa gì trên database.

## Chưa xóa / bước tiếp theo
- Chưa tách toàn bộ sức khỏe/kho/lịch khỏi app.js; làm trong V17.8 Feature Modules theo từng nhóm, xác minh capture/context và hooks trước khi chuyển.
- Chưa lazy load/bundle; V17.9 Build & Lazy Loading cần thay đồng thời cache SW và thứ tự khởi tạo.
- Chưa dọn toàn bộ CSS; V17.10 kiểm tra cascade ở hai theme và Safari trước khi xóa.
- Runtime vẫn nạp 51 script nội bộ. Giảm ZIP do bỏ file dư không làm giảm tương ứng thời gian mở app; chỉ lượng mã runtime bỏ được mới ảnh hưởng tải/phân tích.

## Kiểm chứng
Có số đo bytes/gzip/lines và V8 compile local trước/sau. Benchmark compile có cache engine, không đo DOM/network và không đại diện iPhone/Supabase. Không cam kết giảm loading production. Test lưu/sửa/xóa/Undo/kho nằm trong báo cáo hồi quy. Không migration mới, không deploy.
