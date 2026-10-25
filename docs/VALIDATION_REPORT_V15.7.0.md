# V15.7.0 — kiểm chứng

Toàn bộ `npm test` PASS, không lỗi và không miễn trừ baseline. `python3 release_check.py` PASS cấu trúc/version/cú pháp. Báo cáo chi tiết: TEST_RESULTS_V15.7.0.json.

Suite mới: scoped SQL và jsdom runtime chạy RPC trên PGlite. Kiểm tra nhóm cài đặt độc lập, stale conflict, chống ID trùng/khác payload, lookup lost ACK, rollback khi lỗi muộn, helper/log private, cutover legacy, migration lặp; light shell không lịch sử, summary có phạm vi/family, ngủ qua nửa đêm, số lượng tã, cache, lịch gửi ngày, navigation đợi lịch sử, chăm sóc/kho/tăng trưởng sau deferred load, form cài đặt/profile/dashboard, retry, conflict và theme riêng thiết bị.

Fixture 1000 bản ghi cũ: danh sách chi tiết 223175 byte; summary 203 byte. Đây là giảm kích thước response cho truy vấn thử, không phải đo tốc độ thực tế hay mức giảm tổng traffic toàn app. Light shell vẫn trả cài đặt (avatar nếu có) và danh mục. Sau khi nạp đầy đủ theo nhu cầu, session giữ history để không làm sai renderer/notification legacy. Chưa hoàn tất scoped toàn bộ màn hoặc Scoped Realtime.

Các suite kế thừa bình/túi, chuyển sữa, popup, giao diện, lọc, stored feed return, cold start, data safety, catalog SQL/runtime, service worker, care SQL/runtime, health SQL/runtime, planning SQL/runtime đều PASS. Các assertion version hiện hành đã cập nhật, giữ invariant nghiệp vụ.

Giới hạn: chưa kiểm tra Supabase production/PostgREST/Realtime thật, đa backend session thực, iOS/Android, PWA update trên thiết bị, push và ảnh/file thực. Không dùng business rows của Boss. Chưa push/deploy. Source nền: ZIP V15.6.0(1) Boss cung cấp.
