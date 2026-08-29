# Mẹ Yêu Bé V15.0.79 — Realtime Reliability & Conflict Guard

## Thứ tự nâng cấp
1. Giữ nguyên database relational V15.0.78, **không restore lại dữ liệu**.
2. Supabase SQL Editor: chạy `SUPABASE_RELIABILITY_V15.0.79.sql`.
3. Kiểm tra 6 cột kết quả cuối đều `true`.
4. Deploy source V15.0.79 lên Vercel.
5. Mở lại app trên mọi thiết bị để Service Worker nhận build mới.

## Kiến trúc
`UI -> guarded RPC -> relational tables -> COMMIT -> revision + realtime signal -> authoritative refetch`

- `operation_id`: cùng request retry nhiều lần vẫn chỉ commit một lần.
- `base_revision`: nếu DB đã đổi sau lần client đọc gần nhất, server trả `conflict` và không ghi đè.
- Conflict: app tự tải bản server mới nhất; thao tác stale không được tự replay.
- Realtime: chỉ gửi metadata signal, không gửi dữ liệu nghiệp vụ.
- Không có persistent write queue / JSON merge / migration runtime.

## Test 2 thiết bị
- A và B cùng mở app, Realtime phải `REALTIME`.
- A thêm một cữ, B tự thấy sau vài giây.
- Cho A và B cùng mở cùng dữ liệu, ngắt Realtime B hoặc thao tác gần đồng thời; nếu B stale thì B phải báo conflict và tải lại DB, không âm thầm ghi đè.
- Bấm Save liên tục 2 lần: chỉ xử lý một lần ở UI; nếu HTTP retry thì operation ledger vẫn chặn commit lặp.

## Rollback
Rollback source về V15.0.78 không yêu cầu xóa các bảng guard. Tuy nhiên V15.0.78 không dùng revision guard. Không chạy `06_UNLOCK_LEGACY_JSON_WRITES_ROLLBACK.sql`; legacy JSON vẫn phải khóa.
