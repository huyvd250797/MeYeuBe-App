# AC V15.0.56 — HealthBookNormalizeGuardFix

- Mở app ở Supabase Cloud DB Mode không bị màn hình trống.
- Cloud/cache có `healthBook` dạng object/undefined vẫn normalize an toàn.
- Không còn lỗi `db.healthBook.map is not a function`.
- Nếu Cloud payload cũ sai cấu trúc Sổ sức khỏe, app giữ cache/dữ liệu hiện tại thay vì reset rỗng.
- Sổ sức khỏe vẫn mở được và không nhân bản hồ sơ Bé.
