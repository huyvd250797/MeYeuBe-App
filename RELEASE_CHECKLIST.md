# HVUS v1.1 — Release Checklist V10.9.2

## Cloud Compatibility Recovery
- [x] Cho phép Sync ID `main` để tương thích dữ liệu cũ.
- [x] Tự tìm dòng `main` khi Sync ID hiện tại rỗng hoặc không có payload hợp lệ.
- [x] Tự cập nhật cấu hình về Sync ID thực tế đã khôi phục.
- [x] Chặn local trống ghi đè Cloud có dữ liệu.
- [x] Chặn payload Cloud rỗng/sai cấu trúc ghi đè local.
- [x] Smart Sync ưu tiên phục hồi Cloud khi Dashboard/local trắng.
- [x] Manual Pull tạo safety backup.
- [x] Realtime bỏ qua payload rỗng.

## Regression
- [x] Startup isolation.
- [x] Realtime JSON Sync.
- [x] Device Push.
- [x] Smart Alert.
- [x] Export/Import.
- [x] localStorage key `meYeuBePWA_v4`.
