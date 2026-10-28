# V17.12.0 — Unified Health Forms validation

59/59 bước hồi quy đạt sau một lượt chạy lại riêng suite realtime, không đổi assertion hoặc miễn trừ lỗi. npm ci cài sạch 38 package thành công; dependency-lock so sánh đủ manifest package đã cài, không đổi dependency bên thứ ba. Build production có AST parity, hashed bundles và atomic worker cache.

- Source và production integration: 55 PASS mỗi suite. Bao gồm 7 kiểm tra form mới: mở/hủy nhóm biểu mẫu, một owner/header/footer, hồ sơ mới, ID/label và số thập phân, Save gắn sau khi mở, giữ nội dung khi cập nhật DOM, màn chỉ xem và không mutate records. Production còn mở form tệp Storage.
- Health runtime: 56 PASS, lưu/sửa/xóa/Undo, profile baseline, owner capture, typed IDs, lost ACK, chặn đóng khi đang ghi, tệp và lỗi upload bằng fixture.
- Design system: CSS parse/cascade/tokens vẫn đạt; viewport/fullscreen, keyboard/rotation/pinch và footer vẫn đạt. Kiểm tra care/milk/ledger, backup, media, notification và scoped reads giữ nguyên.
- Suite realtime ban đầu lỗi tại kiểm tra 150ms sau đóng form khi chạy fixture song song. Chạy lại riêng giữ nguyên assertion đạt35/35; lưu cả log ban đầu và log chạy lại trong TEST_RESULTS. Không sửa code realtime trong phiên này. Đây là giới hạn timing của lượt kiểm tra song song, không phải bằng chứng kiểm chứng mạng production.
- 17 tệp Supabase giữ nguyên byte với ZIP đầu vào, không migration mới. Viewport owner không đổi; CSS sức khỏe không thay top/height/bottom của overlay.

Giới hạn: jsdom/PGlite và worker/transport mô phỏng, chưa kiểm chứng native iPhone hoặc deploy/database production. Validation nghiệp vụ hiện hành được giữ, chưa bổ sung hệ thống báo lỗi từng trường mới; Thai kỳ là trang riêng không được viết lại trong phiên bản này. ZIP kiểm tra allowlist, checksum và đọc lại từng tệp sau đóng gói.
