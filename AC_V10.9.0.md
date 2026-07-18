# AC V10.9.0 – Care Form Layout & Record Swipe Actions

## AC-01 Ngày/giờ cùng hàng
Given popup Ghi nhận chăm sóc đang mở trên mobile, When giao diện render, Then "Ngày bắt đầu" và "Từ giờ" phải nằm cùng một hàng, "Ngày kết thúc" và "Đến giờ" phải nằm cùng một hàng khác, kể cả trên màn hình nhỏ.

## AC-02 Loại chuyển lên tiêu đề
Given popup Ghi nhận chăm sóc đang mở, When người dùng chọn một loại chăm sóc (Bé bú, Hút sữa, Ngủ...), Then trường "Loại" không còn hiển thị dạng input trong thân form, thay vào đó tiêu đề form và caption popup phải hiển thị đúng loại đang chọn.

## AC-03 Nút Bắt đầu Bú / Bắt đầu Ngủ cùng hàng
Given chưa có Timer nào đang chạy, When mở form Ghi nhận chăm sóc, Then hai nút "⏱ Bắt đầu Bú" và "⏱ Bắt đầu Ngủ" phải hiển thị cùng một hàng, kể cả trên mobile.

## AC-04 Vuốt để Sửa/Xóa trong danh sách chi tiết
Given đang xem popup chi tiết của một loại chăm sóc theo ngày, When người dùng vuốt sang trái trên một bản ghi, Then hai nút "Sửa" và "Xóa" phải lộ ra; bấm Sửa mở đúng bản ghi để chỉnh sửa, bấm Xóa xóa đúng bản ghi sau khi xác nhận.

## AC-05 Quay lại danh sách sau khi sửa
Given người dùng vuốt và bấm Sửa một bản ghi từ popup chi tiết, When lưu thành công, Then app phải quay lại đúng popup chi tiết (đúng loại, đúng ngày) đang xem trước đó.

## AC-06 Regression Lock
Cloud, Realtime, Push, Smart Alert, localStorage key, cấu trúc dữ liệu và toàn bộ chức năng vuốt-hủy túi sữa (milk swipe) của V10.8.4 không được thay đổi hoặc phá vỡ.
