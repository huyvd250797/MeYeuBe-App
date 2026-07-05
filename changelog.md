# V9.0 - Milk Discard Transaction

- Bổ sung xử lý phần sữa còn lại khi bé bú từ kho sữa.
- Mỗi túi sữa có thể chọn: Giữ lại trong kho / Đổ bỏ phần còn lại / Hủy do hết hạn / Hủy do rơi đổ.
- Lượng bé bú chỉ tính phần `Dùng cho bé (ml)`.
- Phần sữa bị bỏ được ghi nhận vào túi sữa dưới dạng `discarded`, không cộng vào lượng bé bú.
- Túi sữa còn lại 0ml do hủy phần còn lại sẽ chuyển trạng thái `Đã bỏ`; còn lại 0ml do bé dùng hết sẽ chuyển `Đã sử dụng hết`.
- Khi sửa/xóa ghi nhận, lượng đã dùng và đã hủy được hoàn trả để tránh sai kho.
- Giữ nguyên dữ liệu `meYeuBePWA_v4`.

# V8.9.4 - Birth Info Verified Hotfix

- Sửa block Ngày sinh / Giờ sinh / Bệnh viện sinh thành một hàng ngang dạng 3 cột trong cùng một khối.
- Không cắt dấu ba chấm trong thông tin ngày sinh, giờ sinh, bệnh viện sinh khi còn đủ không gian.
- Danh sách kho sữa chỉ hiển thị ngày tạo - giờ tạo, bỏ nhãn "Ngày tạo/lưu trữ".
- Giữ nguyên dữ liệu `meYeuBePWA_v4`.

# Changelog

## V8.9.2 – Birth Info & Milk List Hotfix
- Hiệu chỉnh block Ngày sinh / Giờ sinh / Bệnh viện sinh hiển thị rõ hơn.
- Taskbar cố định thấp hơn, tránh dư khoảng trống dưới.
- Danh sách kho sữa hiển thị ngày tạo/lưu trữ và disable túi không còn đang bảo quản.

# V8.9.1 – Dashboard Refinement Hotfix

## Fixed
- Tối ưu 3 block thông tin sinh trên Dashboard để hiển thị rõ, không vỡ bố cục.
- Cấu hình Dashboard gom nhóm dạng accordion.
- Popup chi tiết Kho sữa trong Thống kê chăm sóc hiển thị tất cả túi, kể cả đã dùng hết.
