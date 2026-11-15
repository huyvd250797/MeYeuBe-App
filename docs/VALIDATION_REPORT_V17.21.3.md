# Kiểm tra V17.21.3 — Shared Seasonal Settings

- Kiểm thử lịch âm/dương, bản nháp xem trước, lưu cấu hình dùng chung, cập nhật chủ đề từ máy khác và bảo vệ khi bản nháp cũ. Cấu hình cục bộ của phiên bản trước chỉ làm bản nháp nếu Cloud chưa có lịch chung.
- Kiểm thử API trên PGlite. Cấu hình đọc được từ API cài đặt và payload khởi động. Phiên bản dữ liệu cũ bị từ chối khi cấu hình đã thay đổi. Các thiết lập khác trong nhóm được giữ.
- Mất mạng giữ cấu hình đã tải của kết nối hiện tại. Đổi kết nối xóa chủ đề của kết nối cũ khỏi giao diện. Hiệu ứng tiếp tục tuân theo giảm chuyển động trên thiết bị.
- Bản ZIP chưa triển khai. Kết nối Supabase production và hai điện thoại thật chưa được dùng trong kiểm thử.

Bản build production được kiểm tra với một thao tác ghi cấu hình qua API bằng mã thiết bị thứ hai và ứng dụng nhận cập nhật phạm vi settings. Trang đang mở đổi sang chủ đề mới mà không tải lại. Kiểm thử PWA xác nhận gói build và tài nguyên ngoại tuyến. Toàn bộ 21 tệp Supabase khớp từng byte với V17.21.2.
