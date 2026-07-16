# HVUS v1.1 — Acceptance Criteria V10.8.5

## AC-01 Smart Default
Given đã lưu một ghi nhận của từng loại, When mở form thêm mới cùng loại, Then các trường phù hợp được điền từ lần gần nhất; không tự điền ngày, giờ hoặc nơi bảo quản Hút sữa.

## AC-02 Recently Used
Given đã có lịch sử lượng bú hoặc thuốc, When mở form tương ứng, Then hiển thị tối đa 5 lượng bú và 6 thuốc dùng gần đây; bấm lựa chọn phải điền đúng dữ liệu.

## AC-03 Scroll Position
Given đang cuộn giữa danh sách chi tiết, When thêm/sửa/xóa và quay lại, Then danh sách giữ gần đúng vị trí trước thao tác, không nhảy về đầu.

## AC-04 Sticky Summary
Given danh sách chi tiết có dữ liệu, When cuộn danh sách, Then thẻ Tổng quan giữ ở đầu vùng cuộn và không che header Loại/Ngày.

## AC-05 Swipe Edit/Delete
Given một record chăm sóc, When vuốt trái, Then hiện Sửa và Xóa; Sửa mở đúng record; Xóa yêu cầu xác nhận và cập nhật danh sách.

## AC-06 Skeleton Loading
Given mở hoặc đổi Loại/Ngày trong chi tiết, When dữ liệu đang render, Then skeleton xuất hiện ngắn và được thay bằng dữ liệu thật.

## AC-07 Animation
Given mở popup, When popup xuất hiện, Then animation hoàn tất trong 150–200ms và không làm giật scroll.

## AC-08 Bottom Sheet Mobile
Given màn hình ≤640px, When mở popup chi tiết hoặc thêm mới, Then popup bám đáy, rộng 100%, cao tối đa 92dvh và chỉ cuộn dọc.

## AC-09 Haptic
Given thiết bị hỗ trợ vibration, When lưu thành công/vuốt/xóa, Then rung nhẹ phù hợp; thiết bị không hỗ trợ không phát sinh lỗi.

## AC-10 Auto Focus
Given mở form thêm mới, When popup sẵn sàng, Then focus trường chính của đúng loại chăm sóc.

## AC-11 Stable Baseline Lock
Cloud Sync, Realtime, Push, Smart Alert, Export/Import, schema và localStorage key không thay đổi.
