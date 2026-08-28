# Mẹ Yêu Bé V15.0.77 — Relational Realtime Database First

## Nâng cấp từ V15.0.76

1. Giữ nguyên dữ liệu relational hiện tại. **Không restore lại DB.**
2. Supabase SQL Editor: chạy `SUPABASE_REALTIME_V15.0.77.sql`.
3. Kết quả cuối phải có `realtime_table_ok = true`, `trigger_ok = true`, `publication_ok = true`.
4. Deploy source V15.0.77 lên Vercel.
5. Mở/refresh tất cả thiết bị để chúng cùng lên V15.0.77.
6. Test: thiết bị A thêm một ghi nhận; thiết bị B đang mở sẽ tự tải state mới từ relational database.

`meyeube_sync` vẫn giữ read-only theo V15.0.76; **không chạy file unlock rollback**.

Realtime không thay database: nó chỉ là tín hiệu. Sau mỗi signal, thiết bị nhận gọi `myb_relational_export_state_v1576` để lấy dữ liệu thật từ table.
