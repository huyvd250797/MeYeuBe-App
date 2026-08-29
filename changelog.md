# Changelog

## V15.0.79 — Realtime Reliability & Conflict Guard
- Guarded RPC `myb_relational_apply_changes_v1579`: idempotency + revision conflict protection.
- Guarded read `myb_relational_export_state_v1579`: state + revision trong một lần đọc.
- Realtime signal gắn revision, debounce 520 ms, reconnect backoff và safety refetch 45 giây.
- Retry cùng operation_id an toàn khi request timeout sau COMMIT.
- Chặn double-click save/confirm trong 1,2 giây.
- Presence nhẹ và integrity constraints cho write mới.
- Giữ nguyên relational-only, không khôi phục JSON migration/Doctor/Delta/Read Mode/Write Queue/Push Primary.

## V15.0.78 — RelationalCleanupWeightLocale
- Fix unit cân nặng relational: `5,2 kg` → `5200 g` DB → `5,2 kg` UI.
- Thêm SQL hotfix sửa hàm `myb_weight_g` và tự sửa bản ghi cân nặng mới nhất bị lưu sai đơn vị khi có thể xác định an toàn từ `health_members.weight_text`.
- Chuẩn hóa decimal comma cho số đo sức khỏe.
- Xóa 6 công cụ migration/cutover legacy khỏi Cloud Sync và app runtime.
- Xóa persistent Relational Write Queue; thao tác ghi đi thẳng relational RPC, sau COMMIT tải lại database.
- Giữ Realtime multi-device theo signal → refetch.

## V15.0.77 — RelationalRealtimeDatabaseFirst
- Relational tables là source of truth; Realtime báo thay đổi và thiết bị tự refetch TABLE.

## V15.0.76 — RelationalOnlyDirectTableCutover
- Cutover từ JSON DB sang relational tables.
