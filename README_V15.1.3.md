# MeYeuBe V15.1.3 — Relational Always-On Realtime Fix

## Mục tiêu
Loại bỏ cấu hình bật/tắt Cloud theo từng thiết bị. Sau cutover relational, database và Realtime là hạ tầng bắt buộc của app.

## Quy tắc runtime
- `enabled = true` luôn được chuẩn hóa khi đọc/ghi cấu hình.
- `syncId = main` luôn được chuẩn hóa để mọi thiết bị dùng cùng `family_id`.
- URL/key vẫn có thể cập nhật trong màn hình kỹ thuật, nhưng không thể tắt Database/Realtime.
- Mất mạng: UI chuyển `OFFLINE`; có mạng lại: tự bootstrap revision, kết nối channel hiện hữu và catch-up incremental.
- Thiết bị mới/cache trống: full pull một lần để lấy baseline; sau đó chỉ incremental.

## Không cần SQL
Bản này chỉ sửa client runtime/config. Giữ nguyên schema V15.0.80.
