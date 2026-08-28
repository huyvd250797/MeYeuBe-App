# V15.0.75 — Timeout Safe Doctor Bypass

## Vì sao V15.0.74 vẫn có 57014?

File emergency V15.0.74 tạo index trước khi override Fast Doctor. Với database đã double/lớn, CREATE INDEX có thể chạm statement timeout. Khi setup dừng ở đó, function Doctor cũ vẫn tồn tại và tiếp tục chạy GROUP BY trên relational tables.

## V15.0.75 thay đổi

1. UI Doctor không gọi server nữa; chỉ so sánh local/cache trước và sau dedupe.
2. SQL hotfix riêng không tạo index.
3. Fast Doctor server được redefine thành constant-time safe response, không SELECT/GROUP BY relational tables.
4. Server rescue dùng RPC V15.0.75 riêng và không chạy Doctor sau rebuild.

## Cách áp dụng

1. Deploy source V15.0.75.
2. Trong Supabase SQL Editor, chạy riêng file `supabase/RELATIONAL_TIMEOUT_SAFE_HOTFIX_V15_0_75.sql`.
3. Reload app/hard refresh để nhận Service Worker V15.0.75.
4. Vào Cloud Sync → Data Rescue & Dedupe.
5. Bấm `Kiểm tra an toàn (local)`. Thao tác này không gọi RPC Doctor.
6. Nếu app vẫn double, đóng app ở thiết bị khác, tắt Read/Write máy hiện tại rồi bấm `Cứu dữ liệu server`.
