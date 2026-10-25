# V16.2.0 — Kiểm thử

Ngày26/10/2026. Nền ZIP16.1 Boss gửi. Node24.22.1 / jsdom30.1.3 / PGlite0.5.11 / fake-indexeddb6.2.6.

**27/27 suite PASS;0 baseline exemptions.** Full26 suite hồi quy PASS. Suite performance được thêm và chạy riêng14/14 PASS; đã thêm vào npm test cho lần chạy tiếp. Sau đổi điều hướng local, chạy lại giao diện51/51 và structure/syntax PASS. Không bỏ assertion cũ. Chi tiết output và targeted reruns trong TEST_RESULTS_V16.2.0.json.

## Bằng chứng

Hồi quy care/milk/catalog/health/planning/settings/scoped/startup/realtime/components đều PASS. Gồm bú từ kho/sửa/xóa/chuyển/hủy/Undo, ACK/timeout/pending/file/giữ nháp, startup vẫn khóa khi labs chưa về; popup/listener và UI rendering fixture vẫn giữ.

Kiểm tra mới: output đầy đủ trước–sau giống nhau; cùng số request nhóm; giảm thời gian chờ song song; reject khi một nhóm lỗi hoặc đổi đích; controllerchange rồi đóng stock không tạo timer reload; thông báo update không rời trang; mojibake có thể đảo được sửa hiển thị; Unicode/emoji đúng giữ nguyên, textbox/code không bị ghi lại; không có SW client.navigate; navigation local không chờ500ms; hợp đồng icon vuông/input intrinsic minimum.

Benchmark controlled latency25ms/shell hoặc nhóm, code fetchServer trước/sau thực: 129.4ms → 52.2ms;5 nhóm request cả hai. Đây là stub bundle nên không đồng nghĩa5 RPC production; repo thực vẫn phân trang/revision như cũ. Không benchmark tốc độ iPhone/network/database thật.

Tất cả file Supabase đã có trong ZIP16.1 byte-identical. Chỉ thêm1620 read-only preflight. Không migrate business rows. Không thay ledger/OCC/operation IDs/Undo, và không xóa pending/file/cache dữ liệu.

## Giới hạn

Chưa thử layout/pixel/scroll/native date controls trong Safari/iPhone vật lý hoặc Chromium. CSS parsing/theme được kiểm tra bằng jsdom; không coi đó là visual QA trên thiết bị thật. Chưa truy cập Supabase production/publication/RLS/WebSocket/đa session PostgreSQL thật. Mock transport + PGlite fixture; không có business rows từ ảnh để phục hồi DB.

Font: sửa hiển thị giới hạn ở text đảo mã được; không sửa textbox/ID/DB, không đoán ký tự đã mất. Reload: đã loại bỏ đường tự reload rõ ràng trong boot/SW; chưa tuyên bố tái hiện được phiên lỗi cụ thể trên iPhone Boss. App.js vẫn còn lớn, chưa full componentization/lazy-load. Không thay dependency/framework.

Chưa push/deploy. DB1590 không cần migration mới;TXT1620 chỉ metadata SELECT. Cập nhật toàn source/src/styles/src/ui/boot/SW, không xóa browser data. Có bản mới sẽ báo; lưu xong rồi đóng/mở lại app. Checklist thiết bị và rollback frontend16.1 nằm trong PERFORMANCE_V16.2.0.md. Tiếp16.3 PWA Reliability chưa triển khai.
