# HVUS v1.0 — Release Checklist V10.7.1

## Acceptance Criteria
- [x] Alert Bú mở đúng form Bé bú.
- [x] Alert Thân nhiệt mở đúng form Thân nhiệt.
- [x] Ngưỡng 37.9°C và dữ liệu 38.0°C tạo Critical.
- [x] Dữ liệu 37.8°C không tạo cảnh báo ở ngưỡng 37.9°C.
- [x] Tương thích dữ liệu thân nhiệt mới và legacy.
- [x] Icon trạng thái dùng 💚 / ⚠️ / 🆘.
- [x] Regression toàn bộ rule hiện có.

## Regression
- [x] Realtime JSON Sync.
- [x] Cloud Sync thủ công.
- [x] Dashboard và Timeline.
- [x] Kho sữa.
- [x] Avatar.
- [x] Export / Import.
- [x] localStorage key `meYeuBePWA_v4`.

## Release Gate
- [x] `release_check.py` PASS.
- [x] `test_v1071.py` PASS.
- [x] JavaScript syntax PASS.
- [x] Version consistency PASS.
