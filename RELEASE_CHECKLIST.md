# HVUS v1.1 — Release Checklist V10.9.2

## Acceptance Criteria
- [x] Nhập mục tiêu ml bé bú trước khi chọn túi sữa.
- [x] Thanh tiến độ "Đã lấy từ kho / mục tiêu" cập nhật theo thời gian thực.
- [x] "+ Thêm túi sữa" mở màn hình chọn túi có tìm kiếm + sắp xếp + nhãn hạn dùng.
- [x] Nhập ml theo bước tăng giảm, xem trước "Còn lại sau khi dùng".
- [x] Danh sách túi đã chọn dạng thẻ, xoá nhanh, giữ tuỳ chọn hủy phần còn lại trong túi.
- [x] Giữ nguyên "Số ml bỏ" / "Số ml bé bú thực tế".
- [x] Sửa bản ghi cũ nạp lại đúng túi sữa, mục tiêu, số ml bỏ.

## Stable Baseline Lock
- [x] Cloud Sync / Realtime / Push / Smart Alert / Export-Import không đổi (hash khớp).
- [x] localStorage key giữ nguyên.
- [x] Vuốt Sửa/Xóa bản ghi chăm sóc, vuốt hủy túi sữa, kéo làm mới, phân loại thông báo Mới/Đã xem không bị ảnh hưởng.

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js).
- [x] Cân bằng thẻ HTML PASS.
- [x] Version consistency PASS (10.9.2 đồng bộ các file).
- [x] Baseline function hashes PASS.
- [x] release_check.py PASSED.
