# AC V15.0.69 — RelationalProductionPush

- Cloud Sync có khu vực **Đẩy dữ liệu chính thức**.
- Kiểm tra được trạng thái ReadMode/WriteQueue trên thiết bị hiện tại.
- Kiểm tra được local Write Queue trước khi chốt.
- RPC server kiểm tra Doctor passed, Delta = 0 và server Write Queue sạch.
- Có thể promote relational tables thành nguồn dữ liệu chính thức bằng `myb_relational_promote_primary`.
- Không xóa `meyeube_sync`; JSON legacy vẫn giữ làm backup/rollback.
- Chưa ẩn Migration/Doctor/Delta khỏi UI chính.
