# CHANGELOG

## V7.6.2 - Milk Status Simplification

### Changed
- Bỏ trạng thái túi sữa "Đã sử dụng" khỏi luồng quản lý kho sữa.
- Các túi sữa dùng một phần sẽ quay lại trạng thái "Đang bảo quản" nếu vẫn còn ml.
- Túi sữa chỉ chuyển sang "Đã sử dụng hết" khi remaining = 0.

### Migration
- Khi app load dữ liệu, các túi sữa cũ có trạng thái "Đã sử dụng" sẽ tự động chuyển về "Đang bảo quản".

### Data
- Giữ nguyên DB key `meYeuBePWA_v4`.
- Không xoá dữ liệu cũ.
