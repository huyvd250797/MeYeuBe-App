# V17.10.0 — Validation

58/58 bước trong danh sách hồi quy đạt; không miễn trừ baseline. Build chạy trước, các suite độc lập chạy theo nhóm; các suite bị tác động được chạy lại sau sửa. Không phải đo trên database production.

- Health runtime 56 PASS: form chỉ số, tiêm, khám, thuốc, xét nghiệm, profile, lost ACK, đổi hồ sơ khi đang ghi, sửa đúng bản ghi, Undo, xóa lần đo cuối không giữ chỉ số dẫn xuất cũ, tệp và dữ liệu rỗng.
- Source và production integration đều 40 PASS: 31 kiểm tra cũ + 9 kiểm tra mới về format, không mutate dữ liệu, timeline bản chiếu và legacy, nhiều đo cùng ngày, cách ly thành viên, profile và min touch target.
- Design system 15 PASS: CSS parse/cascade đầy đủ, 31 style blocks cũ giữ byte, theme contrast và reduced motion. Sheet mới được đưa vào đúng trước viewport.css.
- Build/lazy 12 PASS, production worker 10 PASS; AST parity, chunk backup, dependency thông báo và atomic cache vẫn hoạt động.
- Giữ hồi quy care/milk, lưu/sửa/xóa/Undo, ledger, timeout, media, backup, notifications, keyboard/rotation/pinch, viewport recovery.
- Đối chiếu 17 tệp Supabase với ZIP đầu vào: nguyên byte. Không migration mới.

Phát hiện và sửa trong hồi quy: form profile số đo bị disabled nay hiển thị chuỗi gọn; so sánh chuỗi cũ có thể ghi nhầm số đo dẫn xuất thành số đo nền khi 5.8 khác chuỗi 5.800000. Service nay so sánh tương đương số cho các trường này và giữ baseline; bài xóa điểm đo cuối vẫn giữ kỳ vọng cũ, không nới điều kiện kiểm tra.

Giới hạn: jsdom/PGlite và worker mô phỏng; chưa chụp/so sánh native iPhone, chưa deploy/push hoặc truy cập backend production. Bố cục hồ sơ và shell form toàn diện nằm ở V17.11/V17.12, không tuyên bố hoàn thành trong bản nền này.
