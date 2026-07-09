# Changelog

## V10.2 - Care, Milk Inventory, Sleep Status UX Hotfix
- Khi bé bú từ kho sữa, danh sách túi sữa hiển thị mã ngắn, giờ tạo và ghi chú nếu có.
- Mã túi sữa mới dùng dạng ngắn theo ngày, ví dụ `260709`; nếu trùng ngày sẽ tự thêm hậu tố `-02`, `-03`.
- Chi tiết thống kê chăm sóc sắp xếp bản ghi mới nhất lên đầu.
- Kho sữa hỗ trợ vuốt trái trên túi đang bảo quản để huỷ túi, nhập lý do, chuyển trạng thái `Đã bỏ` và không cho dùng lại.
- Loại `Ngủ` cho phép bỏ trống `Đến giờ`; khi đó app xem là bé đang ngủ và hiển thị thời gian dậy dự kiến sau 3 giờ.

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
