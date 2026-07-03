# Changelog

## V7.7.2 - Diaper-centric Tracking Guard

### Fixed
- Chặn `selectCareType(pee/poop)` để không thể nhập mới Đi tè/Đi phân.
- Sửa record cũ `pee/poop` sẽ chuyển sang form Thay tã với loại tã tương ứng.
- Làm rõ trong thống kê: Đi tè/Đi phân là dữ liệu tự tính từ Thay tã.

### Compatibility
- Dữ liệu cũ `pee/poop` vẫn được đọc trong Dashboard/Thống kê.
- Không đổi DB key `meYeuBePWA_v4`.
