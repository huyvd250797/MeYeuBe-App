# AC V15.0.54 — RealtimeDataAuthorityFix

- Sửa Sổ sức khỏe hoặc Cấu hình Dashboard trên máy A, lưu xong không bị realtime/cloud bản cũ kéo ngược lại.
- Dữ liệu Cloud DB merge theo section stamp: `settings`, `hb`, `healthBook`, `baby`, `mom`.
- Khi boot app, cache IndexedDB được đọc trước rồi merge với Cloud, không lấy Cloud cũ đè cache mới.
- Khi thiết bị khác đẩy dữ liệu cùng lúc, app fetch Cloud, merge theo section và commit lại.
- Realtime nhận dữ liệu mới chỉ được bổ sung/gộp, không thay thế field vừa sửa ở thiết bị hiện tại.
