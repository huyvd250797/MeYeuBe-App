# V17.11.0 — Validation

59/59 bước kiểm tra đạt, không miễn trừ baseline. npm ci cài mới 38 package thành công trên Node24.22.1. dependency-lock kiểm tra toàn bộ manifest package đã cài; dependency tree giữ nguyên byte nội dung JSON so với bản nền (chỉ metadata phiên bản app đổi).

Source integration và production runtime đều 48 PASS: 31 kiểm tra tích hợp gốc, 9 foundation và 8 layout mới. Kiểm tra header/escaping, trạng thái người chọn, tab người lớn/trẻ, nhóm đang xem, ngày đo, giữ callback tệp/sửa/xuất, không mutate business records và hb2Render thực dùng presentation owner mới. Formatter và timeline chiếu lặp vẫn đạt.

Health runtime, care/milk/ledger/Undo, OCC/lost ACK, media, backup, notification scheduler, keyboard/rotation/pinch và viewport recovery đều đạt. Production CSS parse/cascade, touch target và contrast token qua design-system. Sau chỉnh màu tab chọn, build lại; build-lazy 12, production-worker10, design-system15 PASS.

17 tệp Supabase nguyên byte so với ZIP V17.10.1. Không migration SQL, không đổi backend hoặc lưu dữ liệu thật. Runtime health profile mới và stylesheet được tham chiếu trong index/SW, bundle có hash và giữ CSS viewport cuối cùng. ZIP kiểm tra allowlist/checksum và đọc lại nội dung khi đóng gói.

Giới hạn: jsdom/PGlite/worker mô phỏng, chưa kiểm chứng pixel native iPhone hoặc deploy/production. Không coi các kiểm tra này là xác nhận hình ảnh/bàn phím thực trên thiết bị. Chưa viết lại toàn bộ shell form hoặc bổ sung lưu vị trí cuộn riêng theo tab; V17.12 tiếp tục phần form.
