# CHANGELOG

## V7.7 - Overnight Engine & Multi Milk Bag

### Added
- Multi Milk Bag: một cữ bú từ kho sữa có thể dùng nhiều túi sữa.
- Tự động tính tổng ml bé bú từ các dòng túi sữa.
- Overnight Engine: hoạt động ngủ hỗ trợ Ngày bắt đầu/Từ giờ và Ngày kết thúc/Đến giờ.
- Thống kê ngủ tự phân bổ theo ngày thực tế khi giấc ngủ qua ngày.
- Timeline vẫn giữ một record duy nhất cho giấc ngủ qua ngày.

### Changed
- Bú từ kho sữa không còn giới hạn một túi sữa.
- Khi sửa/xoá ghi nhận bú từ kho, app hoàn trả lại đúng ml cho từng túi.
- Biểu đồ chăm sóc lấy dữ liệu ngủ đã phân bổ theo ngày.

### Data
- Giữ nguyên DB key `meYeuBePWA_v4`.
- Tương thích với dữ liệu cũ chỉ có một `milkBagId`.
