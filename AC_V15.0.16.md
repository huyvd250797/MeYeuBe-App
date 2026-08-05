# AC V15.0.16 — PumpLinkFix

- Sửa lỗi Hút sữa hiển thị sai bình/túi giữa màn sửa và danh sách.
- Đồng bộ `careEvent.extra.containerId` với `milkInventory.linkedBagId.containerId/containerName`.
- Khi dữ liệu cũ bị lệch, app tự repair lúc load/normalize.
- Màn danh sách Hút sữa ưu tiên bình/túi đang chọn trong record để tránh hiển thị nhầm Fatz/Tím mập.
