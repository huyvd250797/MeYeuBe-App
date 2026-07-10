# Changelog

## V10.3.5 – Sleep Status Quick Edit & Five Care Journal Rows
- Khi trạng thái tại block Thông tin bé là **Bé đang ngủ**, cho phép bấm trực tiếp để mở giao diện sửa bản ghi Ngủ đang diễn ra mới nhất.
- Hỗ trợ cập nhật **Đến giờ** để xác định thời điểm bé thức dậy.
- Thay dòng trạng thái tổng quát “Đã có ghi nhận hôm nay” bằng trạng thái **Bé đang ngủ/Bé đang thức** ngay trên cùng hàng với đồng hồ và ngày hiện tại.
- Loại bỏ dòng trạng thái ngủ bị lặp ở phần thông tin bổ sung; giữ riêng dòng **Cữ bú tiếp theo** khi có dữ liệu.
- Nhật ký chăm sóc trên Dashboard tăng từ 4 lên 5 dòng gần nhất.

## V10.3.4 – Dashboard Care Detail Popup & Configurable Next Feed
- Khi bấm trực tiếp từng loại chăm sóc trên Dashboard, mở ngay popup chi tiết của đúng loại và ngày hiện tại; không chuyển qua trang Thống kê trước.
- Nút **Thống kê ›** ở tiêu đề block Chăm sóc hôm nay vẫn mở trang tổng quan Thống kê.
- Bổ sung cấu hình **Cữ bú tiếp theo cách (giờ)** trong Cấu hình Dashboard → Hiển thị chung.
- Cữ bú tiếp theo được tính từ thời gian bắt đầu của lần Bé bú mới nhất cộng số giờ đã cấu hình.
- Mặc định 2,5 giờ để tương thích dữ liệu cũ; hỗ trợ bước nhập 0,5 giờ.

## V10.3.3 – Milk Swipe UI Hotfix
- Sửa giao diện nút **Huỷ túi** bị hiển thị sẵn trong danh sách Kho sữa.
- Nút huỷ mặc định ẩn hoàn toàn, chỉ xuất hiện sau khi vuốt trái đủ ngưỡng.
- Chỉ cho phép mở một dòng túi sữa tại một thời điểm.
- Tăng phân biệt thao tác vuốt ngang và cuộn dọc để tránh kích hoạt nhầm trên iPhone.
- Giữ nguyên nghiệp vụ chuyển túi sang trạng thái **Đã bỏ**.

## V10.3.2-milk-inventory-cancel-swipe-hotfix
- Bổ sung swipe sang trái trực tiếp tại Thống kê → Kho sữa → Danh sách kho sữa.
- Chỉ túi ở trạng thái `Đang bảo quản` mới hiển thị hành động `Huỷ túi`.
- Khi huỷ, túi chuyển sang trạng thái `Đã bỏ`, số ml còn lại về 0 và lưu lý do/thời điểm huỷ.
- Danh sách kho sữa trong modal được làm mới ngay sau khi huỷ.

## V10.3.1-care-dashboard-swipe-status-hotfix
- Fix Dashboard: click vào Chăm sóc hôm nay / từng loại chăm sóc mở màn hình Thống kê chăm sóc.
- Fix Kho sữa: bổ sung style swipe-left để hiện nút Huỷ túi, giữ thao tác nhập lý do và chuyển trạng thái Đã bỏ.
- Dashboard Thông tin bé: thêm icon 😴 cho Bé đang ngủ và ☺️ cho Bé đang thức.
- Dãn dòng khu vực Trạng thái và Cữ bú tiếp theo để dễ đọc hơn trên mobile.


## V10.3-care-milk-sleep-dashboard-hotfix
- Rút gọn mã túi sữa theo định dạng YYMMDD và thêm hậu tố khi trùng ngày.
- Danh sách chọn túi sữa khi bé bú hiển thị giờ tạo và ghi chú.
- Chi tiết thống kê chăm sóc sắp xếp mới nhất đến cũ nhất.
- Kho sữa hỗ trợ vuốt trái để huỷ túi, nhập lý do và chuyển trạng thái Đã bỏ.
- Loại Ngủ cho phép bỏ trống Đến giờ để biểu thị Bé đang ngủ.
- Dashboard Thông tin bé hiển thị trạng thái ngủ và cữ bú tiếp theo.

# Changelog

## V10.1 - Cloud Sync Official
- Thêm module Cloud Sync trong menu Thêm.
- Cấu hình Supabase URL, Publishable key, Sync ID.
- Test kết nối, đẩy dữ liệu lên Cloud, tải Cloud về, đồng bộ 2 chiều.
- Đồng bộ auto push khi lưu và auto pull khi mở app nếu Cloud mới hơn.
- Cập nhật bảng Supabase `meyeube_sync` trong SUPABASE_SETUP.sql.
- Giữ nguyên `meYeuBePWA_v4`.

# Changelog

## V10.0 – Supabase Cloud Sync Foundation

### Added
- Module **Cloud Sync** trong menu Thêm.
- Cấu hình Supabase Project URL, Publishable key và Sync ID.
- Test kết nối Supabase.
- Đẩy toàn bộ dữ liệu local lên Supabase.
- Kéo dữ liệu Cloud về localStorage.
- Đồng bộ thông minh dựa trên thời gian cập nhật.
- Auto push khi lưu dữ liệu nếu đã bật Cloud Sync.
- Auto pull khi mở app nếu Cloud mới hơn.
- File `SUPABASE_SETUP.sql` để tạo bảng cloud sync.

### Compatibility
- Giữ nguyên DB local: `meYeuBePWA_v4`.
- Bản V10.0 lưu nguyên JSON hiện tại vào Supabase để an toàn trước khi tách bảng nghiệp vụ ở V10.1.
