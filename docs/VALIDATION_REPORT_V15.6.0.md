# Kiểm thử V15.6.0

`npm test`: tất cả suite PASS, 0 lỗi, không miễn trừ baseline. `python3 release_check.py`: PASS cấu trúc, version, cú pháp JavaScript.

Planning SQL: 64 kiểm tra. Planning runtime: 30 kiểm tra form thật qua jsdom + RPC chạy trên PGlite. Bao gồm CRUD/Undo bốn nhóm, UUID, etag, sửa đồng thời, lọc, phân trang SQL, lost ACK, double click, khóa kết nối, chăm sóc/kho sữa/tăng trưởng cùng module mới.

Toàn bộ suite kế thừa gồm bình/túi, chuyển sữa, popup, giao diện, lọc, stored feed return, cold start, data safety, catalog SQL/runtime, service worker, care SQL/runtime và health SQL/runtime đều PASS. Không sửa logic nghiệp vụ để miễn trừ test; hai assertion version được cập nhật theo bản phát hành.

Chạy trong Node24, PGlite và jsdom; không truy cập database sản xuất. Chưa xác minh hai backend session thật, PostgREST/Realtime production, thiết bị iOS/Android, push thật, nén ảnh thật và PWA update trên thiết bị. Không cam kết mọi tình huống ngoài phạm vi đã kiểm tra đều không lỗi.

ZIP (1) và (2) Boss gửi có nội dung từng entry giống nhau. Bản1560 nâng cấp trên source đó. Chưa push hoặc deploy.
