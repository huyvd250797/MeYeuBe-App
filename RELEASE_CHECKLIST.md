# HVUS v1.1 — Release Checklist V10.9.1

## Acceptance Criteria
- [x] Splash tự đóng tối đa trong 3 giây.
- [x] Global fallback đóng Splash sau 5 giây nếu load bị trì hoãn.
- [x] Lỗi module phụ không chặn render.
- [x] Cloud/Realtime khởi tạo sau khi UI sử dụng được.
- [x] Storage Health, Push, Build Info và Advanced Menu được cô lập lỗi.

## Regression
- [x] Dashboard.
- [x] Realtime JSON Sync.
- [x] Device Push.
- [x] Smart Alert.
- [x] Kho sữa.
- [x] Export / Import.
- [x] localStorage key `meYeuBePWA_v4`.

## Release Gate
- [x] Node syntax.
- [x] Startup failure-isolation runtime model.
- [x] Version consistency.
- [x] Release manifest checksum.
