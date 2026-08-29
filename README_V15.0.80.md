# Mẹ Yêu Bé V15.0.80 — Egress Optimization + Incremental Realtime

## Cài đặt
1. Database hiện tại phải đang chạy V15.0.79.
2. Chạy `SUPABASE_EGRESS_V15.0.80.sql`.
3. Kiểm tra 7 cột `*_ok` cuối file đều `true`.
4. Deploy source V15.0.80 lên Vercel và mở lại app trên tất cả thiết bị.

## Thay đổi
- Không full refresh mỗi 45 giây.
- Không bootstrap full DB hai lần.
- Có cache: boot = cache → revision check → incremental catch-up.
- Realtime = signal → change-map → incremental section export.
- Sau Save chỉ tải section vừa thay đổi.
- Presence 180 giây, response nhỏ và có revision.
- `care_event` tải `careEvents` + `milkInventory`; `health_member` tải `hb/healthBook/baby/mom`; các module khác chỉ tải section tương ứng.
- Full pull chỉ còn khi cache trống, manual full pull, legacy event/gap hoặc fallback an toàn.
