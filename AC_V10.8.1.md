# Acceptance Criteria — MeYeuBe V10.8.1 Push Delivery Hotfix

## AC-01 — Gửi thử thiết bị hiện tại
Given thiết bị đã đăng ký Push và có endpoint hợp lệ
When người dùng bấm “Gửi thử thiết bị này”
Then app phải gửi `target_endpoint` của subscription hiện tại đến Edge Function
And chỉ subscription có endpoint đó được chọn.

## AC-02 — Gửi thử tất cả thiết bị
Given có một hoặc nhiều subscription đang bật cùng Sync ID
When người dùng bấm “Gửi thử tất cả”
Then Edge Function phải gửi đến toàn bộ subscription đang bật của Sync ID đó.

## AC-03 — Không báo thành công giả
Given Edge Function trả `sent = 0`
When app xử lý kết quả
Then app phải hiển thị lỗi kèm số lượng matched, failed và expired
And không được hiển thị thông báo thành công.

## AC-04 — Chẩn đoán delivery
Given Edge Function xử lý yêu cầu Push
When truy vấn subscription và gửi notification
Then log phải thể hiện target, số subscription matched và delivery summary.

## AC-05 — Subscription hết hạn
Given Push service trả 404 hoặc 410
When Edge Function gửi notification
Then subscription phải bị xóa
And số `expired` phải được trả về client.

## AC-06 — Regression
Given nâng cấp từ V10.8.0
When chạy Release Gate
Then Push registration, Smart Alert, Realtime, Cloud Sync thủ công, Dashboard, Export/Import và localStorage key phải được giữ nguyên.
