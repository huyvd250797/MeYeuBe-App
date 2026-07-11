# HVUS v1.0 — Acceptance Criteria V10.8.0

## Phạm vi
Device Push Notification cho Smart Alert, triển khai trên source V10.7.2.

## AC-01 — Kiểm tra khả năng hỗ trợ
**Given** thiết bị hoặc trình duyệt không hỗ trợ Service Worker, PushManager hoặc Notification  
**When** người dùng mở phần Thông báo thiết bị  
**Then** app phải hiển thị trạng thái Không hỗ trợ và không tạo subscription lỗi.

## AC-02 — Điều kiện iPhone/iPad
**Given** người dùng đang mở app trong tab Safari thông thường trên iPhone/iPad  
**When** bấm Bật thông báo  
**Then** app phải hướng dẫn thêm app vào Màn hình chính và không tiếp tục đăng ký sai ngữ cảnh.

## AC-03 — Cấp quyền và đăng ký
**Given** Cloud Sync đã cấu hình, VAPID public key hợp lệ và người dùng cấp quyền  
**When** bấm Bật thông báo  
**Then** app phải đăng ký PushManager subscription và lưu endpoint, p256dh, auth, Sync ID, Device ID lên Supabase.

## AC-04 — Subscription từng thiết bị
**Given** hai thiết bị dùng cùng Sync ID  
**When** mỗi thiết bị bật thông báo  
**Then** Supabase phải lưu hai subscription riêng biệt theo endpoint và Device ID.

## AC-05 — Bật/tắt thông báo
**Given** thiết bị đã đăng ký  
**When** người dùng bấm Tắt thông báo và xác nhận  
**Then** subscription trên thiết bị phải unsubscribe và bản ghi Cloud phải chuyển `enabled=false`.

## AC-06 — Cấu hình loại cảnh báo
**Given** thiết bị đã đăng ký  
**When** người dùng bật/tắt các loại Smart Alert và bấm Lưu loại cảnh báo  
**Then** `alert_types` của đúng subscription phải được cập nhật và Edge Function chỉ gửi các loại được phép.

## AC-07 — Gửi thử
**Given** subscription đang hoạt động  
**When** người dùng bấm Gửi thử  
**Then** Edge Function phải gửi notification đến đúng Device ID, không gửi sang thiết bị khác.

## AC-08 — Push Smart Alert
**Given** một Smart Alert Critical hoặc Warning mới phát sinh  
**When** app lưu dữ liệu và Cloud/Push backend đang hoạt động  
**Then** Edge Function phải gửi push đến các subscription cùng Sync ID, trừ thiết bị nguồn và chỉ theo `alert_types`.

## AC-09 — Không gửi lặp
**Given** cùng một sự kiện cảnh báo được đánh giá lại nhiều lần  
**When** Edge Function nhận cùng `event_key`  
**Then** mỗi subscription chỉ được gửi thành công một lần.

## AC-10 — Notification click
**Given** người dùng nhận notification  
**When** bấm notification  
**Then** app phải được focus hoặc mở mới và hiển thị Trung tâm cảnh báo.

## AC-11 — Subscription hết hạn
**Given** push service trả về HTTP 404 hoặc 410  
**When** Edge Function gửi notification  
**Then** subscription hết hạn phải bị xóa khỏi `push_subscriptions`.

## AC-12 — Re-register
**Given** local config đang bật nhưng PushManager không còn subscription  
**When** app khởi động  
**Then** trạng thái phải hiển thị Hết hạn và yêu cầu người dùng bấm Bật thông báo để đăng ký lại.

## AC-13 — Regression
**Given** nâng cấp lên V10.8.0  
**When** chạy Release Gate  
**Then** Dashboard, Smart Alert, Realtime JSON Sync, Cloud Sync thủ công, Avatar, Kho sữa, Export/Import và key `meYeuBePWA_v4` phải được giữ nguyên.
