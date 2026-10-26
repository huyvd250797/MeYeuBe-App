> V17.1.1: phần bộ lọc mới được rút lại theo yêu cầu Boss; giao diện kho trở về renderer cũ, vẫn giữ lịch sử phía dưới. Không migration mới.

# Milk Insights V17.1.0

Chạy20261026_1710_milk_insights.txt sau các migration hiện hữu đến1661. SQL1710 chỉ thêm index và myb_milk_history_v1710; không reset/sửa bản ghi, không redeploy Edge. Giữ mô hình quyền Sync ID hiện có; không phải nâng cấp authentication.

Kho: mặc định Khả dụng; tìm mã/tên/ghi chú, lọc loại, trạng thái, vị trí, khoảng ngày nguồn (originDate/date/createdAt fallback), sắp xếp hạn/ngày/lượng. Danh sách dùng stock native đã tải bởi app; chưa có server-side paging/search danh sách kho. Lịch sử riêng theo một ID, mỗi trang50 với lookahead; đọc các giao dịch còn hiệu lực. Không phải audit bất biến: sửa/xóa/Undo có thể soft-delete hoặc thay giao dịch, dữ liệu cũ có thể thiếu. Không dựng lịch sử giả hoặc sửa số dư để ép khớp. Tạo nguồn không cộng lại vào amount ban đầu; ledger đọc theo cùng công thức runtime. Chưa đủ dữ liệu hoặc mismatch được báo rõ. Link nguồn/đích có ở giao dịch liên quan và mở lịch sử bằng ID. Ghi nhận được xem dưới dạng tóm tắt trong panel.

Form chăm sóc: header giữ tiêu đề/đóng; Hủy và Lưu dưới footer cố định trong modal, safe area. Hủy tiếp tục dùng cơ chế giữ nháp17.0. Các nhóm nút cuối trực tiếp ở form sức khỏe/timer/chuyển sữa và form trang được gắn footer; giữ nút thật/handler/ID để lock khi đang lưu. Form trang dùng sticky cuối card; không biến trang thành modal. Không thay các thanh hành động của màn xem/bộ chọn thành form lưu. Ngày giờ vẫn2x2.

Kiểm tra local theo VALIDATION_REPORT_V17.1.0.md. Chưa test iPhone/WebKit, bàn phím/viewport hoặc Supabase production; kiểm tra thiết bị thật sau deploy. Không đảm bảo lịch sử quá khứ đầy đủ nếu database cũ không có giao dịch. Không thực hiện migration trên database của Boss trong phiên này.
