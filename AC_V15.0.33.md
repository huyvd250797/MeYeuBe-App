# AC V15.0.33 — PumpLinkIsolationFix

- Mở danh sách Hút sữa có hai record đang trỏ cùng linkedBagId.
- Vào sửa một record Hút sữa không được lấy bình/túi thuộc pumpEventId khác.
- Đổi bình/túi của một lần Hút sữa không làm thay đổi lần Hút sữa còn lại.
- Nếu dữ liệu cũ bị trùng linkedBagId, app tách liên kết an toàn và yêu cầu chọn lại bình/túi khi bình đang bận.
- Không cho lưu Hút sữa vào bình đang còn sữa của lần hút khác.
