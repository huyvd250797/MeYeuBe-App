# Health Profile Layout — V17.11.0

Bản nền là ZIP V17.10.1 đính kèm. Tất cả entry dependency trong package-lock (trừ metadata phiên bản app ở root) giữ nguyên. 17 tệp backend nguyên byte.

## Chủ sở hữu

health-profile.js tải sau health/planning và các adapter health, trước visible-render. Thay phần presentation của hb2ChipsHtml/hb2TabsHtml, bọc đúng renderer home/profile cuối cùng để giữ các bản sửa tệp Storage và profile mới nhất. Không sửa renderer legacy đầu file rồi để patch phía sau ghi đè lại. Không sao chép callback lưu/sửa/xóa sang module mới. Không thay store, RPC, native ID, OCC hoặc xử lý mất ACK.

## Trải nghiệm

- Header gọn: tên, quan hệ, tuổi/ngày sinh, ảnh đại diện, Ghi nhận. Chọn người có aria-pressed, tên dài cắt ở chip nhưng tên đầy đủ xuống dòng ở header. Thêm hồ sơ tách khỏi ghi nhận.
- Bốn tab chính, ba với người lớn. Nhóm khám/thuốc/tiêm/xét nghiệm/báo cáo/mở rộng nằm trong select có label. Không bỏ tính năng cũ. Kế hoạch mở trang đã có, lọc người đang xem nếu có ID; bản chưa liên kết không tự đoán tên.
- Tổng quan tập trung số đo và bốn nhóm lâm sàng; tăng trưởng/hồ sơ không lặp card bên dưới khi đã có tab. Giữ trạng thái, thuốc đang dùng và mũi tiêm tiếp theo. Ngày đo hiển thị khi tìm được lịch sử nguồn.
- Hồ sơ gom các card sẵn có vào grid: mobile một cột, từ 800px hai cột. Giữ tất cả button/callback của renderer profile hiện hành, bao gồm tệp, báo cáo và xóa; đây không phải viết lại logic hồ sơ.
- Typography giảm vừa phải: nội dung 15px thay 16px, nhãn 13 thay 14px, số đo 20 thay 22px, header18 thay20px. Input/select giữ16px. Nút min44px; rem vẫn hỗ trợ tăng cỡ chữ. Màu dùng biến theme hiện hành; không thay loading hoặc kho sữa.
- CSS không đặt height/top/bottom/inset cho overlay, giữ viewport recovery cuối cascade.

## Kiểm tra và giới hạn

health-layout.cjs được gọi trong cả components-runtime và production-runtime: danh tính/escaping, một nút thêm, trạng thái chọn, điều hướng người lớn/trẻ, nhóm đang xem, các shortcut, ngày đo, giữ nút sửa/tệp/xuất, không mutate dữ liệu và renderer thật dùng owner mới. Test foundation cũ tiếp tục kiểm tra định dạng và timeline không chiếu lặp.

Chưa kiểm chứng pixel trên iPhone native, chưa deploy/push hoặc truy cập production. Không tuyên bố toàn bộ form đã được viết lại; việc đó ở V17.12.0. Giữ cơ chế quay về view hiện hành của writer, chưa bổ sung lưu vị trí cuộn riêng theo từng tab.
