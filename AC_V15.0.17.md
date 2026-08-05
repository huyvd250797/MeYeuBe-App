# AC V15.0.17 — PumpLinkFix2

- Sửa xung đột Hút sữa/Kho sữa: Kho sữa là nguồn đúng khi mở sửa từ chi tiết kho.
- Khi một mẻ hút có linkedBagId và pumpEventId lệch nhau, app tự chọn bản liên kết đúng theo milkInventory và đồng bộ lại record Hút sữa.
- Màn sửa Hút sữa hiển thị đúng bình/túi đang thấy ở Kho sữa, không còn bên ngoài bình A nhưng vào sửa bình B.
