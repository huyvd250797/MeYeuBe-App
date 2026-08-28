# V15.0.74 — EmergencyRelationalRebuildNoDoctor

Bản này dùng khi dữ liệu relational bị nhân đôi toàn app và các Doctor cũ bị Supabase timeout `57014`.

Quy trình:
1. Đóng app trên thiết bị khác.
2. Chạy `SUPABASE_SETUP.sql` V15.0.74.
3. Deploy source V15.0.74.
4. Vào Cloud Sync → Emergency Data Rescue.
5. Bấm `Kiểm tra nhẹ`.
6. Bấm `Cứu dữ liệu server`.
7. Mở lại app, kéo dữ liệu relational và kiểm tra UI.

Cơ chế:
- Không scan duplicate trực tiếp trên relational tables.
- Backup `meyeube_sync.data` vào `relational_recovery_backups`.
- Dedupe JSON legacy.
- Soft reset relational rows theo `family_id`.
- Migrate lại từ JSON sạch.
- Không xóa JSON backup.
