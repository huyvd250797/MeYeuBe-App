# Thiết kế Notifications V16.6.0

README là hướng dẫn vận hành đầy đủ. Các thành phần:

- `src/features/notifications/rules.js`: UMD thuần, cùng byte với `_shared/notification-rules.js`. Kiểm thử parity chặn quy tắc khác nhau. Mặc định UTC+7, raw field timezoneOffsetMinutes nếu có được tôn trọng, chưa có UI chọn múi giờ.
- `_shared/notification-worker.ts`: transport, REST RPC, đọc lại native mỗi thiết bị, TTL phù hợp hạn nhắc, bộ đếm ACK provider và phản hồi lỗi.
- `smart-alert-cron/index.ts`: chỉ POST có MYB_CRON_SECRET, không được frontend gọi định kỳ. `send-push/index.ts`: chỉ gửi thử nội dung cố định, giữ mô hình Sync ID hiện hữu.
- 1660: snapshot scoped, trạng thái lease/cursor/heartbeat, delivery per subscription/event, atomic claim + token ACK, quyền server-only. Hạn lease worker90s, delivery60s. Tối đa4 attempt, backoff1/2/4 phút, không gửi quá hạn15phút.
- 1661: hạ tầng lịch mỗi phút, secret Vault và function configure/tick chỉ postgres; status kiểm tra actual cron.job active. Không tự cài được từ frontend.
- UI status không báo sẵn sàng chỉ vì cfg.enabled; kiểm tra lịch và lần xét gia đình gần nhất. Không có hệ thống tracking đọc; request accepted có thể chưa hiện trên máy.
- Worker có ngân sách xử lý, cursor vòng; chưa triển khai distributed queue hoặc exactly-once push. ACK thất lạc có thể retry; tag ổn định giảm lặp. Native query và provider send không cùng transaction, vẫn có race nhỏ khi dữ liệu đổi sau đọc.
- Không thay đổi backup whitelist1650: delivery/runtime là trạng thái vận hành, không đưa vào gói khôi phục nghiệp vụ. Không đưa endpoint/secret vào báo cáo trạng thái công khai.
- Thư mục chức năng mới tách riêng; app.js còn các renderer/compatibility cũ. Không tuyên bố đã tách toàn bộ app.js.

Kiểm tra Supabase live cần cron.job_run_details + net._http_response + Edge Logs. pg_cron thành công chỉ xác nhận request đã được xếp. Test cuối bắt buộc đóng app tất cả máy; hiện chỉ kiểm chứng logic bằng fixture, transport giả và jsdom.

Tài liệu tham khảo chính thức đã đối chiếu ngày26/10/2026:
- https://supabase.com/docs/guides/functions/schedule-functions
- https://supabase.com/docs/guides/cron
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
