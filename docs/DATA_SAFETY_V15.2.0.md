# Tài liệu nền V15.2 — áp dụng cho các module chưa chuyển ở V15.3

Xem DATA_ACCESS_V15.3.0.md cho lớp danh mục mới. Nội dung bên dưới mô tả luồng nền trước khi có repository danh mục.

# V15.2.0 — Hiện trạng, phạm vi và kiểm chứng

## Luồng dữ liệu hiện hành

HTML nạp boot.js, Supabase SDK, app.js rồi relational-v1577.js. File cuối thay các hàm load/save/normalize để dùng relational RPC. app.js vẫn chứa các wrapper lịch sử; V15.2 chưa gỡ hàng loạt. Nhiều UI handler gọi save đồng bộ, do đó phiên bản này duy trì chữ ký đó, ghi journal localStorage đồng bộ trước khi cập nhật memory để tránh save liên tiếp đọc state cũ. RPC vẫn gửi delta theo entity, không gửi toàn database để ghi đè.

| Thành phần | Vai trò |
| --- | --- |
| Supabase relational tables | Nguồn dữ liệu chính, chưa truy cập trực tiếp để kiểm chứng trong lần bàn giao |
| myb_relational_export_state_v1576 | Tải trạng thái server; còn giữ export-state để tương thích UI trong giai đoạn nền tảng |
| myb_relational_apply_changes_v1576 | Gửi thay đổi từng entity; hợp đồng giữ nguyên |
| memory + __mybCloudDbMemory | Bản đang hiển thị; chỉ load từ memory đã được module hiện tại chấp nhận |
| meYeuBeCloudDBMode_v1 / state | IndexedDB cache của app hiện tại; cache được kiểm tra metadata đích trước khi đọc |
| meYeuBeRelationalDirectQueue_v1576 / ops | Queue phiên bản cũ; operation thiếu đích bị cách ly, không tự gửi/xóa |
| mybBoundOutbox_v1520 | Journal mới: ID, thời gian, project URL + Sync ID, thiết bị, lý do, entity deltas; không lưu API key trong operation |
| mybSafetyDraft_v1520 | Snapshot nháp bị chặn, chia theo đích; không tự upload, không tự phục hồi vào DB |
| meYeuBeRelationalOnlyMeta_v1577 | Metadata cache gồm target; cache cũ chưa xác định project sẽ không tự được dùng như dữ liệu đáng tin cậy |
| meYeuBeFiles_v1 / health_docs | Byte tài liệu local; giữ nguyên, chưa chuyển Storage |
| meYeuBeBackupDB | Phiên bản dự phòng local hiện có; giữ nguyên |

## Điều kiện bảo vệ

- Save bị chặn khi chưa bật database, offline, bootstrap/stabilizing/realtime fetch, đổi cấu hình hoặc target không khớp memory. Lỗi có mã MYB_SAVE_BLOCKED để dừng handler trước thông báo thành công và giữ form.
- Nháp là bản chụp dự phòng, không phải xác nhận dữ liệu đã lưu. Nếu localStorage lỗi/quota, báo rõ và yêu cầu giữ form.
- Outbox được ghi bền vững trước memory. Quota/corruption không được nuốt để trả thành công.
- Flush chỉ gửi operation có target bằng target hiện tại. Operation cũ thiếu target giữ nguyên và chặn, cần đối chiếu thủ công.
- Đổi config qua UI kiểm tra trạng thái in-flight và pending; đổi đích thành công xóa memory hiển thị của gia đình cũ rồi bootstrap đích mới. Không xóa byte tài liệu.
- Bootstrap/manual pull/realtime không ghi đè memory sau failed flush. Phản hồi request với target cũ bị loại. Trạng thái pending/saved/blocked hiển thị ở Cloud Sync.
- Không xóa tất cả queue qua API chẩn đoán. Có chức năng xuất recovery để đối chiếu.

## Kiểm tra và giới hạn

Xem TEST_RESULTS_V15.3.0.json để biết số liệu cuối và log. Bộ runtime mới kiểm tra CRUD các loại entity, ghi chú tháng, hai save liên tiếp, form Bé bú và Chuyển sữa thật cùng Undo khi đã nạp lớp relational, lỗi lưu, chặn đổi target, chống redirect queue, queue không định danh, quota, journal hỏng và phản hồi cũ. Bộ cold-start kiểm tra mở offline, cache đúng đích, giữ nháp qua reconnect và không tự upload nháp.

Sáu test nghiệp vụ legacy được chạy lại. Hai test có đúng 8 lỗi đã tái hiện trên V15.1.0 nguyên bản: lựa chọn/trạng thái sữa, thứ tự nguồn, nhãn tự động/thủ công, mã/tên túi và mô tả đích chuyển. Một số liên quan fixture bị ledger tính lại và kỳ vọng nhãn cũ; chưa thay các assertion để lấy kết quả xanh và chưa tuyên bố đã sửa nghiệp vụ đó. Danh sách chính xác nằm trong tests/run.py và log báo cáo. Version assertion của test V15.1.0 được cập nhật sang build hiện tại; phần kiểm tra nghiệp vụ giữ nguyên.

Đã kiểm tra source/local bằng jsdom + fake IndexedDB + mock RPC. Chưa kiểm tra database/RLS/RPC thật, transaction nhiều bảng, cạnh tranh nhiều thiết bị thật, trình duyệt/iOS/PWA rendering thật, push background, Storage, micro/camera/cảm biến phần cứng. Không khẳng định tất cả nghiệp vụ production không có lỗi.

## Checklist kiểm tra trên môi trường thật trước phát hành

1. Tạo môi trường test từ schema đúng production, dùng dữ liệu giả; không chạy recovery SQL lịch sử.
2. Thử bú kho/nhiều nguồn/sửa sang bú mẹ/xóa/undo; hút sữa và bình liên kết; chuyển sữa toàn phần/một phần/đã dùng tiếp; hủy thủ công và hết hạn.
3. Thử ngủ/timer, tã, nhiệt độ; số đo/khám/vaccine/thuốc/xét nghiệm; thai kỳ, nhật ký/cột mốc/ghi chú; lịch hẹn và biểu đồ/thống kê.
4. Thử file local cũ, mở/xuất/đính kèm; backup/import với dữ liệu test; kiểm tra byte file trước khi dọn thiết bị.
5. Thử lỗi mạng lúc bắt đầu/giữa request, timeout không biết đã commit hay chưa; không lặp thao tác mù. V15.2 chưa có server operation-id mới, nên chưa bảo đảm exactly-once ở server.
6. Thử đổi URL/key/Sync ID, queue cũ và mới, refresh/đóng mở; kiểm tra không có dữ liệu gia đình trước hiện ở đích mới.
7. Thử iPhone PWA, theme, overlay/scroll, cập nhật phiên bản, background/foreground; push và giờ nhắc trên thiết bị thật.
8. Đối chiếu quyền RPC/RLS/Edge Functions trước mở rộng sử dụng. Việc siết Auth/RLS nằm ở V15.3 và cần schema/quyền thực tế.

## Những phần chủ động chưa thay

Không reset hoặc migrate schema; không chạy JSON merge/recovery cũ; không thêm offline sync mới; chưa tách mọi component, chưa chuyển framework, chưa gỡ các lớp vá lịch sử; chưa thay boot/SW ngoài version. Backup JSON cá nhân từng có trong root được loại khỏi gói phát hành; bản gốc vẫn nằm trong ZIP đầu vào.
