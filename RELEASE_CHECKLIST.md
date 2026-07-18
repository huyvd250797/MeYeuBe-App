# HVUS v1.1 — Release Checklist V10.9.0

## Acceptance Criteria
- [x] "Ngày bắt đầu" cùng hàng với "Từ giờ" trong popup Ghi nhận chăm sóc.
- [x] "Ngày kết thúc" cùng hàng với "Đến giờ" trong popup Ghi nhận chăm sóc.
- [x] Trường "Loại" không còn hiển thị dạng field, chuyển lên tiêu đề form/popup.
- [x] Nút "Bắt đầu Bú" và "Bắt đầu Ngủ" nằm cùng một hàng, kể cả trên mobile.
- [x] Popup chi tiết từng loại chăm sóc hỗ trợ vuốt sang trái để Sửa hoặc Xóa bản ghi.
- [x] Sau khi lưu sửa từ thao tác vuốt, quay lại đúng danh sách chi tiết đang xem.

## Stable Baseline Lock
- [x] Cloud Sync không thay đổi.
- [x] Realtime không thay đổi.
- [x] Push Notification không thay đổi.
- [x] Smart Alert không thay đổi.
- [x] Export/Import không thay đổi.
- [x] localStorage key giữ nguyên.
- [x] Vuốt hủy túi sữa (milk swipe) của V10.8.4 giữ nguyên.

## Release Gate
- [x] JavaScript syntax PASS.
- [x] Version consistency PASS (10.9.0 đồng bộ 5 file).
- [x] Baseline function hashes PASS.
- [x] V10.9.0 automation PASS (34/34 checks).
- [x] release_check.py PASSED.
