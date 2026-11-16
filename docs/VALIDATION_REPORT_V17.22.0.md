# Xác nhận kỹ thuật V17.22.0 — Vietnamese Cultural Themes & Motion

Ngày: 2026-11-16.

## Đã kiểm tra

- Build static `node build_web.cjs`: **PASS** (Node v22.16.0; dự án khai báo production Node 24.x).
- `python release_check.py`: **PASS** (kiểm tra cấu trúc, JS syntax, script references, version).
- `node tests/seasonal-standalone.cjs`: **PASS** — 20 chủ đề, 40 chế độ animation, 200 file WebP, 12 mốc lịch và không có tiêu đề ngày lễ trên preview.
- Kiểm tra Pillow `verify()` tất cả 100 WebP bổ sung: **PASS**.
- Có artwork mới cho scene, sprite và 8 card mỗi chủ đề. Service worker có cache tường minh, chế độ runtime dừng Canvas theo trạng thái hiển thị, `prefers-reduced-motion` giữ nguyên.

## Giới hạn kiểm thử cần nêu rõ

- `npm ci --offline` thiếu một số package trong cache; `npm ci` tiếp tục thất bại do môi trường npm. Vì vậy **chưa chạy được toàn bộ bộ test tích hợp dựa trên jsdom/PGlite**, chưa xác minh trực quan trên thiết bị iPhone hay production Supabase.
- Chưa thực hiện deploy; cần thử trực tiếp cập nhật PWA trên iOS, chuyển ngày cấu hình, Realtime settings hai thiết bị, thử chế độ giảm chuyển động và form ghi nhận.
- Artwork V17.22.0 là minh họa vector WebP được xây dựng cho ứng dụng; không phải bản cắt nguyên màn hình mockup. Không có chữ/ngày lễ trên hero.
