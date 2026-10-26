# Kiểm chứng gói source sạch V16.6.0

40/40 bộ hồi quy hiện có đã chạy lại PASS trên source đã dọn. Bộ package-cleanup mới có9/9 check PASS độc lập, tổng cộng41 suite đã qua. `npm test` từ gói này bao gồm luôn suite mới.

Đối chiếu67 file runtime/Edge/migration nghiệp vụ với ZIP trước: nội dung byte không đổi; hash trong SOURCE_CLEANUP_V16.6.0.json. Xóa117 file dư/lịch sử/input; chuyển2 preflight chỉ phục vụ test về tests/fixtures. Không có migration mới.

Kiểm tra đóng gói: chặn backup/input-only/.env/script dư/module không tham chiếu; ZIP một thư mục gốc, tên đường dẫn không trùng hoa/thường, CRC và từng byte khớp source. Không chứa node_modules/.git/cache/dist hoặc dữ liệu backup. Chưa upload/push/deploy bằng Zipverra thực tế.

Các bằng chứng tính năng Notifications và giới hạn môi trường dưới đây vẫn áp dụng; không có thay đổi nghiệp vụ mới trong lần làm sạch.

# Kiểm chứng V16.6.0 — Notifications

Ngày26/10/2026. Source nền là ZIP V16.5 Boss gửi. Node24.22.1; dependency ghim trong package-lock.json.

**40 suite đã PASS, không miễn trừ baseline**:39 suite trong lượt chạy đầy đủ và suite runtime tích hợp mới được kiểm tra lại sau khi sửa teardown fixture. Lượt full ban đầu của test mới hết thời gian vì đóng PGlite khi callback IndexedDB/REST giả còn chờ; teardown nay dừng realtime, drain REST và callback trước close. Không đổi production để làm test qua. Hai lần chạy độc lập sau đó có8/8 assertion và thoát0 bình thường, không lỗi fatal.

Release structure/cú pháp PASS trong lượt full. Các nghiệp vụ cũ gồm chăm sóc/kho sữa/Undo/mất ACK, health/growth, planning, settings, scoped realtime, component/design system, performance/PWA, media và backup/restore. Test chăm sóc đổi ngày mẫu cố định đã hết hạn sang ngày hiện tại; giữ nguyên luật hết hạn production và38 check care-runtime qua.

| Nhóm Notifications mới | Check PASS |
| --- | --- |
| notifications-rules.cjs | 33 |
| notifications-sql.cjs | 25 |
| notifications-edge.cjs | 15 |
| notifications-scheduler.cjs | 9 |
| notifications-ui.cjs | 9 |
| notifications-runtime.cjs | 8 |

Bằng chứng chính:

- Rule: không gửi sớm; đúng số phút kể từ cữ bú gần nhất; không tự cộng interval; không gửi dồn mốc quá15 phút. Cữ mới, ngủ kết thúc, thân nhiệt mới bình thường, hủy/hoàn thành lịch và sữa đã dùng/hủy chặn cảnh báo. ISO UTC/local, lịch hẹn info, lead0 trong đúng phút hẹn, key từng bình/túi, Unicode/NFC/mojibake và tên Bảo Ân.
- SQL chạy thật trên PGlite/schema fixture: native projection thay JSON cũ, quyền server-only, heartbeat, token claim/ACK, chống trùng, stale token, lease recovery, backoff và4 attempt,410 disable; migration chạy lại không mất dữ liệu. Chưa dùng các session PostgreSQL độc lập nên chưa đo contention production.
- Handler Edge được Node strip TypeScript và thực thi với REST nối PGlite, Web Push transport giả. Không có window hoặc app: sự kiện đến hạn gửi đến2 subscription, lặp cron không gửi trùng,503 thử lại ở lần chạy kế, xóa sự kiện chặn retry; test mode tạo tiếng Việt ở server, mode alert cũ bị chặn409. Không phải Deno deploy/Push provider thật.
- Scheduler SQL kiểm tra với stub Vault/cron/net: cùng job mỗi phút, rerun không nhân đôi, header secret, URL/timeout, quyền private và phân biệt active job với worker thành công. Các extension hosted thật chưa được chạy; README có bước kiểm chứng riêng.
- Service Worker chạy trong VM: tiếng Việt/emoji đúng ở showNotification, sửa payload cũ và fallback nội dung hỏng, click chỉ cùng origin. Không phải giao diện lock screen Safari thật.
- Runtime nạp mọi script từ HTML: startup đầy đủ, Dashboard dùng shared evaluator, lưu42 phút từ form → settings API → native server nguồn đọc đúng42. All-off thiết bị gửi object false, khớp cấu hình sau ACK; không lỗi jsdom uncaught.

File TXT chứa hai migration1660→1661 theo thứ tự, chỉ ASCII không BOM; Unicode escape được thực thi thành tiếng Việt có dấu. Không có URL project hoặc secret thật. Backup JSON đầu vào giữ ngoài source phát hành, không đưa lên public.

**Chưa xác minh:** Supabase production, cron/pg_net/Vault hosted, Web Push/APNs, iPhone/Safari/lock screen, hình học giao diện, tải lớn hoặc concurrent sessions thật. Chưa push/deploy. Sau triển khai phải đóng app tất cả máy và kiểm tra đúng mốc trên thiết bị, đối chiếu Edge Logs/HTTP200/heartbeat. Provider ACK chưa chứng minh đã hiển thị/đã đọc.

Chi tiết: TEST_RESULTS_V16.6.0.json. Cài đặt và rollback: README.md. Tài liệu kỹ thuật: NOTIFICATIONS_V16.6.0.md.
