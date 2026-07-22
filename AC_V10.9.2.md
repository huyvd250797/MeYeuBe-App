# AC V10.9.2 – Milk Bag Picker UX

## AC-01 Nhập mục tiêu ml trước
Given người dùng chọn hình thức bú "Bú từ kho sữa đã hút", When form hiển thị, Then trường "Số lượng ml" phải đổi nhãn thành "Bé bú bao nhiêu? (ml)" và cho phép nhập số ml dự kiến bé sẽ bú, làm mục tiêu để chọn túi sữa.

## AC-02 Thanh tiến độ Đã lấy từ kho
Given đã nhập mục tiêu ml, When chưa chọn đủ túi sữa, Then phải hiển thị thanh tiến độ "Đã lấy từ kho: X / mục tiêu ml" cùng trạng thái "Còn thiếu N ml"; khi đã đủ hoặc vượt mục tiêu, thanh chuyển màu xanh và hiển thị "✓ Đủ lượng".

## AC-03 Bấm "+ Thêm túi sữa" mở màn hình chọn túi
Given đang ở form ghi nhận bú từ kho sữa, When bấm "+ Thêm túi sữa", Then phải mở overlay "Chọn túi sữa" có ô tìm kiếm, dropdown sắp xếp, và danh sách túi sữa còn khả dụng (loại trừ túi đã chọn), mỗi túi hiển thị mã túi, nhãn hạn sử dụng (HSD hôm nay/ngày mai/N ngày nữa/đã quá hạn), ngày tạo và số ml còn lại.

## AC-04 Nhập số ml theo bước cho từng túi
Given đang ở overlay "Chọn túi sữa", When bấm vào một túi, Then phải mở rộng khối nhập "Dùng bao nhiêu?" với nút tăng/giảm (+/-), hiển thị "Còn lại sau khi dùng" theo thời gian thực, và nút "Thêm vào túi này" để xác nhận.

## AC-05 Quay lại form sau khi chọn túi
Given đã xác nhận số ml cho một túi trong overlay, When bấm "Thêm vào túi này", Then overlay phải đóng lại, túi sữa đó xuất hiện trong danh sách "Túi sữa đã chọn" trên form chính, và thanh tiến độ phải cập nhật ngay.

## AC-06 Xoá túi khỏi danh sách đã chọn
Given đã có túi sữa trong danh sách "Túi sữa đã chọn", When bấm nút ✕ trên thẻ túi, Then túi đó phải được gỡ khỏi danh sách và thanh tiến độ phải cập nhật lại.

## AC-07 Giữ nguyên chức năng hủy phần còn lại trong túi
Given một túi đã chọn còn dư sau khi dùng (còn lại sau khi dùng > 0ml), When bấm "Hủy phần còn lại trong túi" trên thẻ túi, Then túi đó phải được đánh dấu để hủy phần còn lại khi lưu, và có thể bấm lại để hoàn tác ("Giữ lại phần còn lại").

## AC-08 Giữ nguyên tính năng Số ml bỏ
Given đang ghi nhận bú từ kho sữa, When nhập "Số ml bỏ (bé không bú hết)", Then "Số ml bé bú thực tế" vẫn phải tự tính đúng bằng tổng ml đã lấy từ các túi đã chọn trừ đi số ml bỏ.

## AC-09 Sửa bản ghi cũ vẫn hoạt động
Given một bản ghi bú từ kho sữa đã lưu trước đó, When mở lại để sửa, Then danh sách túi sữa đã chọn, mục tiêu ml và số ml bỏ phải được nạp lại chính xác như lúc lưu.

## AC-10 Regression Lock
Cloud, Realtime, Push, Smart Alert, Export/Import, localStorage key, chức năng vuốt Sửa/Xóa bản ghi chăm sóc, vuốt hủy túi sữa, kéo làm mới (pull-to-refresh) và phân loại thông báo Mới/Đã xem của các bản trước không được thay đổi hoặc phá vỡ.
