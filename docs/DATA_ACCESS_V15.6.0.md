# V15.6.0 — Diary & Planning Data Access

Nhật ký, lịch hẹn, cột mốc và ghi chú tháng dùng RPC list/write/operation v1560. Sửa/xóa dùng UUID `_dbId`, etag từ raw row; ID cũ/NULL legacy_id giữ nguyên. Ghi chú dùng khóa gia đình + chỉ số tháng tuổi hiện có. API cũ chặn bốn entity này. Helper và operation log không cấp quyền client trực tiếp; giữ mô hình truy cập bằng Sync ID hiện tại, không bổ sung đăng nhập.

## Cài đặt
Hoàn tất thao tác chờ trên mọi thiết bị, sao lưu database, cài lần lượt 1530 → 1540 → 1550 → 1560 trong Supabase SQL Editor, rồi cập nhật app trên mọi thiết bị. Không chạy lại client cũ ghi planning sau cutover. Migration kiểm tra schema/anchor và rollback nếu không khớp; không bỏ qua guard hay reset bảng. Sau migration, quay lại source cũ không khôi phục writer đã khóa; ưu tiên sửa tiến, hoặc phục hồi database từ backup tương ứng cùng app cũ khi cần rollback có kiểm soát.

## Hành vi
- Danh sách nhật ký/lịch hẹn/cột mốc truy vấn ngày/danh mục, 30 dòng/trang. Revision thay đổi thì yêu cầu tải lại.
- Form giữ before snapshot khi mở, tránh cập nhật nhầm dòng sau sắp xếp. Chỉ merge ACK vào bộ nhớ/baseline.
- Unknown outcome giữ UUID + command + đích trong localStorage. Thử lại tra cứu trước, không tự gửi lặp. Banner hỗ trợ kiểm tra sau reload. Chặn đổi kết nối khi form/thao tác chưa hoàn tất.
- Undo kiểm tra etag, khôi phục raw row/extra; không ghi đè sửa đổi tiếp theo.
- Cột mốc tự động tính từ dữ liệu nguồn bằng bộ luật sẵn có. Không tự ghi hàng loạt cột mốc khi đọc. Annotation được lưu theo key nguồn; khi nguồn không còn đạt điều kiện thì ẩn cột mốc, giữ annotation để khôi phục khi nguồn trở lại. Không thay số liệu chăm sóc/sức khỏe khi sửa annotation.
- Ảnh giữ cách nén/data URL hiện có, tối đa 20 ảnh; không tạo Supabase Storage hay xóa file dùng chung.

## Giới hạn hiện tại
Bootstrap/realtime vẫn lấy đủ lịch sử qua các API phân trang để giữ dashboard, lịch tuần/tháng, hành trình tháng, tổng kết năm và các luật cột mốc cũ đầy đủ. Danh sách riêng có lọc/phân trang server; chưa hoàn tất lazy loading toàn ứng dụng, aggregate và scoped realtime (roadmap 15.7/15.9). Revision hiện hash hàng của bảng, ưu tiên tính đúng hơn tối ưu dữ liệu lớn.

Kiểm thử dùng PGlite + jsdom/schema fixture; không thay thế xác minh Supabase production, hai session đồng thời, iOS/Android thật, push hoặc nén ảnh trên thiết bị thật.
