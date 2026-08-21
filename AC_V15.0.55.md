# AC V15.0.56 — CloudRealtimeAuthoritativeFix

- Máy A sửa Sổ sức khỏe, bấm Lưu, reload lại vẫn giữ dữ liệu mới.
- Máy A sửa Cấu hình Dashboard, bấm Lưu, reload lại vẫn giữ cấu hình mới.
- Máy B đang có dữ liệu cũ mở app/realtime không được ghi đè dữ liệu mới của máy A.
- Nếu 2 máy cùng lưu, app fetch Cloud mới nhất, merge theo section stamp rồi mới commit.
- Startup dùng cache + Cloud merge an toàn, không lấy Cloud cũ đè cache mới.
