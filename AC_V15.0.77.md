# Acceptance Criteria — V15.0.77 RelationalRealtimeDatabaseFirst

- [x] Dữ liệu nghiệp vụ tiếp tục INSERT/UPDATE/DELETE trực tiếp relational tables.
- [x] Không mở lại `meyeube_sync`; trigger khóa legacy JSON của V15.0.76 được giữ nguyên.
- [x] Realtime chỉ truyền signal không chứa payload nghiệp vụ.
- [x] Thiết bị nhận signal luôn refetch `myb_relational_export_state_v1576` từ database.
- [x] Trước realtime pull phải chờ local save chain và flush queue; không overwrite thay đổi chưa gửi.
- [x] Nhiều signal được debounce/coalesce để tránh nhiều full refetch liên tiếp.
- [x] Khi người dùng đang nhập liệu/modal mở, realtime pull được defer để không phá thao tác.
- [x] Foreground/online có refetch bù; safety refresh 60 giây.
- [x] V15.0.76 writes cũng phát signal nhờ trigger trên `devices.last_seen_at`.
- [x] SQL patch idempotent và có verification query.
