# AC V15.0.52 — HealthBookMemberMergeFix

- Mở app ở Supabase Cloud DB Mode.
- Vào Sổ sức khỏe.
- Danh sách hồ sơ không bị nhân nhiều chip “Bé” rỗng.
- Nếu cache/Cloud còn hồ sơ Ba/Mẹ trong archive, app tự phục hồi Ba/Mẹ.
- Merge Cloud không được bỏ qua `db.hb.members`.
- Thao tác thêm/sửa hồ sơ sức khỏe vẫn lưu và đồng bộ bình thường.
