# V16.3.0 — PWA Reliability

Nền ZIP16.2.0 Boss cung cấp, ngày26/10/2026. Không credentials/business rows sản xuất.

## Luồng cập nhật

Worker cài đủ asset vào cache phiên bản, từ chối response lỗi/HTML sai loại/build. Lần cài đầu browser kích hoạt bình thường; các lần sau không skipWaiting tự động. boot thông báo bản mới, Boss lưu/đóng form rồi bấm Cập nhật ứng dụng. Guard kiểm tra repository pending/busy, generic queue, startup gate, modal và nháp của các form. Kiểm tra lại khi controllerchange trước reload. Nếu một tab khác cập nhật, các tab còn lại không bị navigate; cache bản trước còn để phục vụ mã cũ. Cache cũ hơn được dọn theo namespace app, không xóa cache ngoài app/IndexedDB/localStorage.

Offline chỉ phục vụ app shell tương ứng phiên bản đã cài. Không lấy JS từ cache phiên bản khác khi thiếu asset, không trả index.html cho module. build.json luôn thử mạng. Nếu chưa cài đầy đủ trước khi mất mạng hoặc API không kết nối, không giả nhận dashboard đã đầy đủ/database-ready. Cần kết nối lại và Thử tải lại. Không bổ sung ghi offline mới.

## JSON và Cloud

Gỡ UI JSON nhanh (copy/import/delete-local), importer snapshot và nút đồng bộ trùng. Giữ định dạng JSON trong menu xuất backup vì đó là định dạng file hợp lệ, không phải cơ chế ghi snapshot lên database. Lịch sử backup chỉ xem trước/xuất; không đưa nút restore cũ về trạng thái có vẻ hoạt động khi typed API không hỗ trợ thay cả DB.6 hàm gốc importDB/bkConfirmImport/bkConfirmRestore/startDeleteFlow/confirmDeleteText/clearDB trả ngừng hỗ trợ, adapter chặn thêm một lớp. Không xóa bất kỳ backup/file/record đã có.

Nút Tải lại dữ liệu dùng full bootstrap và guard form. Typed pending phải đối chiếu bằng chức năng của nghiệp vụ. Generic queue còn dữ liệu mới hiện nút Thử gửi dữ liệu chờ; thao tác gửi không tạo command ID mới cho typed pending. Kéo làm mới không xóa offline assets. Phục hồi kiểm soát theo record thuộc roadmap16.5, chưa triển khai.

## Giao diện

V16.2 bỏ sót careDateTimeRow vì chỉ sửa row/formGrid;163 thêm đúng class thực, native appearance/min-width/border-box và một cột dưới600px. Khắc phục theo lớp layout, không che lỗi bằng overflow:hidden toàn form. Giữ hàng conditional hidden/inline display none. Các field không đổi ID/value/onchange.

Quick add sức khỏe dùng nền raised và chữ text theo theme, không kế thừa chữ tối trên nền tối từ nút default. Config dashboard tách nội dung nhãn/tooltip, control có gap, nhóm/module/chỉ tiêu co được; mobile một cột. Splash/loader đều ghi V16.3.0, phiên bản tĩnh khớp build. Không thay logic lưu hoặc quy tắc kho vì CSS.

## Kiểm tra sau triển khai

Cập nhật đủ source qua HTTPS, mở PWA → kiểm tra version ở splash và chờ dashboard đủ. Trên gia đình test: mở care pump/edit milk, đổi ngày giờ, nhập ghi chú; form khác như health/appointment/diary/pregnancy/catalog; dark/light/auto; cấu hình chung + module/chỉ tiêu ở320/390/768px; không input chồng hoặc tràn; hidden rows còn ẩn. Mở/đóng kho nhiều lần không reload. Gõ nháp rồi có update phải chặn; save ACK/reset xong cập nhật được. Thử mạng yếu/mất mạng khi tải asset, offline shell, nhiều tab và giữ file/pending. Các bước Safari/iPhone cần thiết bị thật; chưa được xác nhận trong môi trường này.

## Cài đặt/rollback

Không cần migration; Supabase source byte-identical. Không có TXT mới. Hoàn tất/đối chiếu command chờ trước đổi frontend. Cập nhật toàn bộ root/src/styles/src/features/cloud, không chỉ app.js. Không xóa dữ liệu trình duyệt để ép update. Nếu cần quay frontend16.2, thay trọn source và giữ DB1590, file/nháp/pending. Không reset DB. Còn nhiều template/global adapter trong app.js; chưa hoàn tất tách toàn bộ component hoặc lazy-load. Tiếp16.4 Media Storage chưa triển khai. Chưa push/deploy.
