# AC V10.8.4 – Care Detail & Mobile Form UX

## AC-01 Header chi tiết
Given popup chi tiết loại chăm sóc đang mở, When giao diện render, Then bộ lọc Loại và Ngày phải nằm cùng một hàng trên mobile và header thấp hơn bản V10.8.3.

## AC-02 Thêm ghi nhận đúng loại
Given đang xem chi tiết một loại chăm sóc, When bấm Thêm ghi nhận, Then popup thêm mới phải mở đúng loại và đúng ngày đang xem.

## AC-03 Quay lại danh sách
Given người dùng lưu thành công từ popup mở bởi màn hình chi tiết, When lưu hoàn tất, Then app phải quay lại popup chi tiết và số record tăng thêm một.

## AC-04 Mobile form ổn định
Given popup thêm mới mở trên mobile, When người dùng cuộn dọc, Then giao diện không được trượt ngang hoặc lệch sang hai bên.

## AC-05 Không gian nhập liệu
Given popup thêm mới mở trên mobile, Then popup phải sử dụng gần toàn bộ chiều rộng và chiều cao khả dụng, đồng thời không che bởi safe area.

## AC-06 Regression Lock
Cloud, Realtime, Push, Smart Alert, localStorage key và cấu trúc dữ liệu của V10.8.3 không được thay đổi.
