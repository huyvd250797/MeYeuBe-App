# Mẹ Yêu Bé V15.1.1 — Realtime Stable State Fix

## Nguyên nhân gốc được xử lý
V15.1.0 vẫn chủ động phá/recreate channel khi callback Realtime báo lỗi hoặc khi incremental REST/RPC catch-up thất bại. Trong khi Supabase Realtime v2 đã có cơ chế tự rejoin, hai cơ chế có thể “đánh nhau” và tạo vòng CONNECTING → RETRYING → REALTIME. Ngoài ra patch QuietCloudToast legacy vẫn tự tạo toast “Đã kết nối” mỗi khi state/render Cloud đi qua REALTIME.

## Cách sửa
- Supabase channel có grace window để tự rejoin.
- Chỉ forced recovery sau khi channel không SUBSCRIBED lại trong grace window.
- Chỉ một channel và một recovery timer.
- Data pull lỗi không restart socket.
- Relational-only mode vô hiệu auto “Đã kết nối” toast legacy.
- Foreground/online chỉ ensure channel hiện có, không tạo channel cạnh tranh.

Không có SQL mới. Tiếp tục dùng schema/RPC V15.0.80 hiện tại.
