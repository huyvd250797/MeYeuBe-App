# V17.0.0 — Báo cáo kiểm thử

Ngày26/10/2026. Nền nâng cấp: ZIP V16.7.0 Boss cung cấp, root GitHub `huyvd250797-MeYeuBe-App-f9dcd50`. Runtime được đối chiếu với bản16.7 sạch;124 file lịch sử/backup/unused kèm lại đã loại khỏi cây phát hành. Không chỉnh dữ liệu sản xuất.

## Kết quả

- `npm test`: **43/43 bộ PASS**, không exemption/baseline failure. Báo cáo đầy đủ từng lệnh và output: TEST_RESULTS_V17.0.0.json.
- Care Workflow: **58/58 kiểm tra PASS**. Thực thi UI form, service/repository/bridge và SQL fixture; mất ACK sau commit, retry cùng ID, HTTP502/JSON hỏng, giữ sửa thêm sau timeout, nháp theo target/type/ID, nhiều nguồn, copy mới, stock scroll, timer, stale OCC, quota/nháp hỏng/tab khác và document care runtime độc lập.
- Các bộ hồi quy tiếp tục kiểm tra native ledger, nhiều nguồn/Undo/transfer/delete, timer/ngủ qua đêm, health/growth/vaccine, planning/settings/realtime, media, backup/restore, notifications, PWA, design system/accessibility và package guard.
- Design-system kiểm tra đủ6 stylesheet theo thứ tự, parse CSS, semantic contrast và31 khối CSS lịch sử byte-exact. Đã cập nhật contract danh sách stylesheet cho module Care Workflow mới; không bỏ kiểm tra.
- `release_check.py`: cấu trúc, tham chiếu/version, JavaScript syntax và offline asset list; chạy lại khi đóng ZIP.
- `build_release.py`: allowlist, chặn backup/private environment/unknown module/case collision, checksum từng file, ZIP CRC và đối chiếu byte từng entry. Không đóng node_modules/cache/dist/.git.
- **16 file Supabase** giữ byte nguyên so với ZIP đầu vào: không migration mới, không redeploy Edge Functions.

## Môi trường và giới hạn

Node24.22.1, PGlite0.5.11, jsdom30.1.3, fake-indexeddb6.2.6. Fixture không phải database sản xuất. REST/Push transport và browser storage được mô phỏng; PGlite thực thi SQL của migration trên dữ liệu thử. Kiểm tra phiên bản xung đột là các lượt ghi có kiểm soát, chưa phải hai thiết bị thật chạy đồng thời.

Chưa có iPhone/Safari/VoiceOver, chưa đo hình học/keyboard thực, chưa kiểm chứng tốc độ mở app thực, Supabase production hoặc Web Push/APNs thật. Benchmark PERFORMANCE_RESULTS_V17.0.0.json giữ phép đo scoped read với độ trễ giả cố định; không dùng làm cam kết tăng tốc V17.0.0 trên điện thoại. Không chứng nhận WCAG toàn app.

Chưa push GitHub hoặc deploy. Đối chiếu README và CARE_WORKFLOW_V17.0.0.md khi triển khai/test thiết bị. Không chạy lại SQL cũ chỉ vì nâng frontend.

## Checklist thiết bị thật còn cần

1. PWA iPhone sáng/tối, ngày/giờ2x2 và bàn phím, Tab/Escape/VoiceOver khi có thiết bị phù hợp.
2. Nháp nhập → đóng → mở → reload; kiểm tra ngày cũ và trường động, chủ động bỏ nháp.
3. Bú nhiều nguồn/nhập thừa, hút rồi dùng sữa, sửa/xóa/Undo và stock popup trở lại vị trí cũ.
4. Hai thiết bị cùng sửa hoặc chọn sữa; xung đột phải giữ nội dung và không âm kho.
5. Mạng gián đoạn sau Lưu → Kiểm tra kết quả → chỉ gửi lại cùng thao tác khi cần; sửa thêm sau timeout vẫn là nháp.
6. Timer đang chạy/kết thúc, đóng app/mở lại, qua nửa đêm; xác nhận lưu mới kết thúc timer.
7. PWA cập nhật, backend/notifications/media/backup đang vận hành được giữ nguyên.
