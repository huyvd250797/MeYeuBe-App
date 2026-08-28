# AC V15.0.67 — RelationalReadMode

- Có card `Relational Read Mode` trong Cloud Sync.
- Mặc định Read Mode tắt.
- Bấm `Kiểm tra Read Mode` gọi `myb_relational_read_preflight`.
- Chỉ cho bật khi Doctor passed và Delta = 0.
- Bấm `Đọc relational ngay` gọi `myb_export_relational_legacy_payload` và render app bằng dữ liệu relational.
- Nếu preflight lỗi hoặc có delta, không ghi đè dữ liệu hiện tại và fallback legacy JSON.
- Thêm/sửa/xóa vẫn ghi theo legacy JSON/Cloud Queue, chưa ghi relational tables.
- Khi có thao tác save sau khi bật Read Mode, app đánh dấu pending delta để yêu cầu Delta Sync trước lần đọc relational kế tiếp.
