# V15.8.0 — Kiểm chứng

`npm test`: tất cả suite PASS, 0 suite lỗi, không miễn trừ baseline. `python3 release_check.py`: PASS cấu trúc/version/cú pháp. Chi tiết TEST_RESULTS_V15.8.0.json.

Đã gỡ 18 khối legacy trong app.js, giữ API hiện hành và các wrapper nghiệp vụ còn cần. Không DROP bảng/function hay xóa queue/pending/cache/file. Cache cũ giữ DB/store/key và data, có kiểm tra roundtrip IndexedDB.

Startup test cố tình giữ API chậm hơn watchdog4.2s cũ: loading không ẩn và dashboard không bị mở sớm; gọi hideAppLoading/hideSplash sớm cũng bị chặn. Chỉ mở khi full history và render xong. Test lỗi tải có nguyên nhân/retry, thử lại thành công không xóa dữ liệu. Test preflight1580 chạy trên schema fixture có API1530–1570.

Các suite cũ bình/túi, chuyển sữa, popup, UI/lọc, stored feed return, cold start, data safety, catalog/care/health/planning/scoped SQL và runtime, service worker đều PASS. Cập nhật assertion light-startup của15.7 thành full-startup theo yêu cầu15.8; giữ kiểm tra dữ liệu, lost ACK, conflict, theme và các form.

Môi trường Node24 + PGlite/jsdom. Chưa kiểm tra Supabase production/PostgREST/Realtime thật, hai session backend đồng thời, iOS/Android/PWA thật hoặc mạng của Boss. Không dùng dữ liệu sản xuất. Chưa push/deploy. Source nền ZIP15.7.0(1) Boss gửi.
