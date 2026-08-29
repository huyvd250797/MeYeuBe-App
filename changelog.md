# V15.1.1 — Realtime Stable State Fix
- Sửa reconnect loop còn sót ở V15.1.0.
- Tách lỗi incremental data pull khỏi lỗi WebSocket.
- Dùng Supabase auto-rejoin + delayed forced recovery.
- Chặn auto toast “Đã kết nối” trong relational-only mode.
- Giữ Incremental Realtime / Egress Optimization.

# Changelog

## V15.1.0 — Realtime Connection Stability Fix
- Fix vòng lặp trạng thái Realtime do `CLOSED` callback của channel đã bị remove.
- Thêm channel generation/token để stale callback không thể thay đổi trạng thái channel mới.
- Chỉ duy trì tối đa 1 reconnect timer; lỗi lặp không reset timer liên tục.
- Invalidate channel trước khi `removeChannel()` để callback đóng cũ luôn bị bỏ qua.
- Giữ Incremental Realtime, không bật lại full polling và không thay đổi database schema.
- Cloud Sync hiển thị số reconnect và số stale callback đã bỏ qua để theo dõi độ ổn định.

## V15.0.80 — Egress Optimization + Incremental Realtime
- Tắt full-database polling 45 giây.
- Boot bằng cache + revision check nhẹ thay vì full export lặp.
- Thêm `changed_entities` cho realtime signal.
- Thêm change-map RPC theo revision và incremental section export RPC.
- Sau save/realtime chỉ refetch section bị thay đổi; full export chỉ là fallback/manual.
- Presence giảm xuống 180 giây và kèm revision.
- Giữ nguyên idempotency + optimistic conflict guard.

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
