# V16.1.0 — Kiểm thử và giới hạn

Ngày26/10/2026. Nền ZIP MeYeuBe_v16.0.0.zip Boss gửi; Node24.22.1, jsdom30.1.3, PGlite0.5.11, fake-indexeddb6.2.6. Không production rows/credentials.

**26/26 suite PASS, 0 unexpected failures, 0 baseline exemptions.** Output trong TEST_RESULTS_V16.1.0.json. Full regression sau thay đổi runtime/CSS/theme PASS; cuối cùng bổ sung kiểm tra offline stylesheet và chạy riêng service-worker4/4, design-system15/15, release-check PASS. Report có validation_reruns để phân biệt.

## Kiểm thử mới

15 hợp đồng:3 CSS parse được; HTML đúng cascade/đường dẫn; precache đủ CSS;31 style block giữ nguyên hash/thứ tự; viewport cho phép zoom; hai theme kiểm tra cặp token4.5:1; bốn tình huống boot light/dark/auto theo system không ghi dữ liệu;44px/focus; reduced-motion/forced-colors; status error safe text/alert; saved tái dùng live node. Service-worker thêm1 kiểm tra CSS versioned offline trả đúng stylesheet canonical.

Các test cũ vẫn giữ assertion nghiệp vụ. Lượt đầu có3 suite lỗi do expectation16.0 và test z-index còn đọc CSS trong index.html; đã cập nhật version và đọc CSS qua link production, không xóa assertion hoặc miễn trừ lỗi.

## Hồi quy

- Bình/túi, chuyển sữa/popup/khóa cuộn, lọc, stored/direct, dùng nhiều nguồn, sửa/xóa/Undo, timer, timeout/lost ACK.
- Catalog, sức khỏe/số đo/vaccine/khám/thuốc/lab/thai kỳ, file/IndexedDB, planning nhật ký/lịch/cột mốc/tháng, settings/scoped, startup đầy đủ và Scoped Realtime.
- Component lifecycle/focus/form locks/double submit/ACK/picker event delegation vẫn PASS trên HTML/controller thật với API tới fixture.
- Tất cả file Supabase có từ ZIP16.0 được đối chiếu byte và không thay. Chỉ thêm1610 SELECT preflight. src/data và feature service/controller không thay; UI runtime chỉ thêm status class; picker chỉ đổi empty-state markup. app.js chỉ version và dark theme-color.

Preflight1610 được thực thi thành công trên fixture và không đổi danh sách bảng. Fixture realtime thiếu catalog-list RPC1530 nên trả required_rpcs_present=false/missing catalog; đây là giới hạn fixture, không phải kết quả kiểm tra DB của Boss. Khi chạy trên DB đích, cần required_rpcs_present=true và missing_rpcs=[].

## Giới hạn và xác minh tiếp

Không có pixel/layout test trong trình duyệt thật hoặc iPhone/PWA vật lý. jsdom không thể chứng minh responsive/media-query/scroll/canvas thực tế. Đã thử chuẩn bị Chromium nhưng tải binary không thành công trong môi trường; không có screenshot giả hoặc tuyên bố visual QA đã hoàn thành. Token contrast không phải chứng nhận WCAG toàn app vì nhiều template/CSS lịch sử còn được giữ.

Database/mạng là fixture + mock transport. Chưa xác minh Supabase production/publication/RLS/WebSocket thật hay đa session PostgreSQL. Checklist manual trong DESIGN_SYSTEM_V16.1.0.md. Chưa push/deploy. Không cam kết không còn mọi lỗi.

## Cài và quay lại

DB đã1590 không cần migration;1610 TXT/SQL chỉ kiểm tra metadata. Cập nhật trọn source gồm src/styles và src/ui. Không xóa cache dữ liệu/nháp/pending/file để ép update. Nếu cần điều tra, quay frontend16.0, giữ database1590 và đối chiếu các thao tác chờ. Bản sau16.2 Performance chưa triển khai.
