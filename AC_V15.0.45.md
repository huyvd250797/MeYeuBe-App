# AC V15.0.45 — SupabaseCloudMergeGuardFix

- Thiết bị A thêm ghi nhận mới, thiết bị B đang stale mở app/lưu cấu hình/sync không được làm mất ghi nhận của A.
- Đẩy Cloud lên trong Cloud DB Mode phải fetch Cloud trước và merge, không overwrite nguyên DB.
- Tải Cloud về phải gộp với local, không thay thế một chiều.
- Realtime từ thiết bị khác phải gộp theo record, không replace local memory.
- Nếu bản chuẩn bị lưu có ít dữ liệu hơn Cloud, app phải chặn hoặc gộp lại trước khi upsert.
