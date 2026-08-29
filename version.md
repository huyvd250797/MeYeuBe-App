# V15.0.79 — RealtimeReliabilityConflictGuard

- Database First / Relational Only tiếp tục là kiến trúc duy nhất. JSON legacy không trở lại runtime.
- Thêm `operation_id` server-side để retry request không thể tạo duplicate commit.
- Thêm `family revision` + optimistic concurrency guard: thiết bị stale bị từ chối thay vì ghi đè dữ liệu mới hơn.
- Realtime event có revision; client bỏ qua event cũ/trùng và debounce thành một authoritative refetch.
- Realtime tự reconnect theo backoff khi socket timeout/closed, và luôn refetch sau reconnect/foreground/online.
- Anti-double-click cho các nút save/confirm ở capture phase.
- Presence nhẹ 90 giây để biết số thiết bị online; presence không tạo business realtime event.
- Integrity Guard bằng CHECK constraint cho lượng sữa và cân nặng mới.
- Không persistent write queue; save vẫn là direct DB transaction → authoritative refetch.
