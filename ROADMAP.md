# Roadmap Mẹ Yêu Bé

| Phiên bản | Phạm vi | Trạng thái |
| --- | --- | --- |
| V17.10–V17.13.1 | Giao diện hồ sơ sức khỏe, dashboard, nhấn giữ +1 tã | Kế thừa từ source Boss gửi |
| V17.14.0 — Query & Render Efficiency | Scoped refresh, cache/query keys và defer view ẩn | Kế thừa, giữ hồi quy |
| V17.15.0 — Baby Supplies | Quản lý đồ tiêu hao | Đề xuất, chưa xây |
| V17.16.0 — Milk QR Labels | QR bình/túi sữa | Đề xuất, chưa xây |
| V17.18.0 — Baby Packing Lists | Checklist chuyến đi, món/số lượng/nhóm/ghi chú, filter/progress, archive/reopen/copy, Cloud OCC/recovery | Đã xây, xem báo cáo kiểm thử |
| V17.18.0 — Baby Memory Cards | Chọn ảnh và thông tin để tạo thẻ kỷ niệm, xuất ảnh chia sẻ | Đề xuất, chưa xây |

V17.18.0 được xây độc lập từ V17.14.0(1).zip Boss chọn. Không thêm đăng nhập, timer bú/ngủ, offline care hoặc thay tồn kho. Không có SQL mới; sử dụng API settings V15.7.0 hiện hành. Giới hạn 50 chuyến và 200 món/chuyến, xung đột ở nhóm settings.other; chưa realtime từng checkbox, dùng mở lại/Tải lại để cập nhật từ máy khác.

V17.18.0 — Packing Simple Lists: sửa UI theo phản hồi Boss. V17.18.0 — Baby Memory Cards vẫn là đề xuất, chưa xây.


## V17.18.0 — Source đã xây dựng, chờ cấu hình Google/deploy thật
| Phiên bản | Mục tiêu | Chức năng chính | Kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc |
|---|---|---|---|---|---|
| V17.18.0 | Kỷ niệm của bé | CRUD, ảnh, tuổi bé, 3 mẫu JPEG | Bảng riêng, Edge Drive owner, no family auth | Test source đạt; production cần smoke test A/B | V17.17.1 + Google OAuth/folder |
| V17.19.0 dự kiến | Memory Albums | Album, lọc tháng/năm | Bổ sung nhóm và truy vấn | Xem album trên nhiều thiết bị | V17.18.0 đã cấu hình |
