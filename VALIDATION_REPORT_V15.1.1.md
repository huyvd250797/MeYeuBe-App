# VALIDATION REPORT — MeYeuBe V15.1.1

## Scope
Realtime Stable State Fix trên baseline V15.1.0.

## Root causes found
1. Runtime V15.1.0 vẫn gọi manual reconnect/recreate channel ngay khi Supabase callback `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`. Supabase Realtime v2 đã có auto-rejoin, nên manual recovery có thể cạnh tranh với auto-rejoin và tạo vòng trạng thái.
2. Lỗi REST/RPC incremental catch-up bị coi nhầm là lỗi WebSocket (`pull_failed`) và kích hoạt reconnect channel.
3. Legacy `QuietCloudToastFix` vẫn tự lên lịch toast `Đã kết nối` mỗi khi state/render Cloud đi qua `REALTIME`.
4. Legacy `window.online` handler có thể ép UI từ `REALTIME` về `CONNECTING` dù relational channel hiện tại vẫn khỏe.

## Fixes verified
- Supabase channel có grace window để tự rejoin trước khi forced recovery.
- Chỉ 1 active channel + 1 recovery timer.
- Existing healthy channel được reuse; foreground/online không tạo channel cạnh tranh.
- Incremental REST/RPC failure chỉ retry data sau 3.2s; không restart socket.
- Relational runtime là final authority cho realtime state.
- Legacy CONNECTING downgrade bị bỏ qua khi relational channel đang REALTIME.
- Auto toast `Đã kết nối` bị disable khi `relationalOnly=true`.
- Không có full polling 45s.
- Incremental Realtime / Conflict Guard / idempotency vẫn giữ nguyên.
- Không có SQL/schema mới.

## Static checks
- `node --check app.js` PASS
- `node --check boot.js` PASS
- `node --check relational-v1511.js` PASS
- `node --check sw.js` PASS
- `release_check.py` PASS

## Expected state behavior
Normal startup:
`CONNECTING → REALTIME` và giữ ổn định.

Transient websocket hiccup recovered by Supabase:
`REALTIME` giữ nguyên trên UI; internal phase có thể `DEGRADED` rồi quay lại `SUBSCRIBED` mà không nhấp nháy.

Sustained disconnect:
`REALTIME` → grace window → `RETRYING` → `REALTIME`.

REST/RPC incremental failure:
Realtime socket vẫn giữ nguyên; chỉ data retry.

## Expected toast behavior
Không còn auto-toast `Đã kết nối` do realtime/render/online. Nút Test kết nối vẫn có phản hồi riêng `Relational DB OK ...`.
