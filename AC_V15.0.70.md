# AC V15.0.71 — MilkIdentityDoctorUIFix

- Bật ReadMode + WriteQueue không làm nhân đôi careEvents/milkInventory khi app nhận lại legacy JSON.
- Relational export giữ legacy id cho careEvents, milkInventory và milkContainers.
- Kho sữa hiển thị đúng loại Bình/Túi, không lẫn containerKind.
- Feed milk sources trỏ đúng mã túi/bình ổn định thay vì UUID mới mỗi lần export.
- Có RPC kiểm tra Milk Data Doctor để phát hiện double dữ liệu và container kind bất thường.
- App local normalize tự gộp bản trùng legacy/UUID và sửa containerId/containerKind trước khi render/save.
- Chưa xóa Migration / Doctor / Delta Sync / JSON legacy backup.
