# V15.0.77 — Relational Realtime / Database First

## Nguyên tắc

Supabase relational tables tiếp tục là **source of truth duy nhất**. Realtime không truyền care/milk/health data giữa thiết bị và không khôi phục JSON database.

Luồng ghi:

`Thiết bị A -> myb_relational_apply_changes_v1576 -> relational tables -> COMMIT`

Trong cùng transaction, `devices.last_seen_at` được cập nhật một lần và trigger V15.0.77 tạo một record rất nhỏ ở `myb_realtime_events`.

Luồng nhận:

`Thiết bị B nhận realtime signal -> flush local queue nếu có -> myb_relational_export_state_v1576 -> render state mới nhất từ database`.

## Vì sao dùng signal thay vì subscribe từng bảng

- Không merge row ở client.
- Không resurrect túi sữa/cữ bú từ cache cũ.
- Một batch lưu có thể thay đổi nhiều bảng nhưng chỉ cần một tín hiệu.
- Thiết bị nhận luôn tải state đã commit từ database.
- V15.0.76 còn mở trên thiết bị khác vẫn phát signal vì RPC V15.0.76 luôn cập nhật `devices.last_seen_at`.

## Fallback

V15.0.77 tải lại database khi app quay lại foreground, khi online trở lại và safety-refresh mỗi 60 giây trong lúc app đang hiển thị. Realtime bị mất kết nối không làm mất dữ liệu vì database vẫn là nguồn chính.
