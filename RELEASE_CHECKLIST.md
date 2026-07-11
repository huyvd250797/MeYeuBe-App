# HVUS v1.0 — Release Checklist V10.7.2

## Acceptance Criteria
- [x] Nút Ghi nhận cảnh báo mở màn hình Ghi nhận.
- [x] Đúng loại Bú/Thân nhiệt được chọn sẵn.
- [x] Action HTML không lỗi dấu ngoặc lồng nhau.
- [x] Block Trung tâm cảnh báo xuất hiện trong Cấu hình Dashboard.
- [x] Block có thể bật/tắt và di chuyển lên/xuống.
- [x] Giữ module id `alerts` để tương thích dữ liệu cũ.
- [x] Thông tin lúc sinh mặc định mở.

## Regression
- [x] Smart Alert Rule Engine.
- [x] Realtime JSON Sync.
- [x] Cloud Sync thủ công.
- [x] Dashboard và Timeline.
- [x] Avatar.
- [x] Export / Import.
- [x] localStorage key `meYeuBePWA_v4`.

## Release Gate
- [x] `release_check.py` PASS.
- [x] `test_v1072.py` PASS.
- [x] JavaScript syntax PASS.
- [x] Version consistency PASS.
