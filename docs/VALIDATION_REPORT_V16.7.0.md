# Kiểm chứng V16.7.0 — Quality & Accessibility

Nguồn: ZIP V16.6.0 Boss đính kèm. Node24.22.1, PGlite0.5.11, jsdom30.1.3, fake-indexeddb6.2.6. Không thêm dependency hoặc schema mới.

- Lượt `npm test` đầy đủ:42/42 suite PASS, không baseline exemption. Gồm nghiệp vụ chăm sóc/kho/Undo/mất ACK, health/growth, planning/settings/realtime, media/backup/notifications, CSS/theme/PWA và packaging.
- Quality suite mới:26 check trong lượt full; bổ sung kiểm tra caption form thật và popup legacy, chạy lại28/28 PASS.
- Sau điều chỉnh focus/title cuối, chạy lại care-runtime38/38, health-runtime56/56, components24/24 và quality28/28. Báo cáo JSON lưu riêng validation_reruns, không trình bày các lượt chạy lại như suite mới.
- Kiểm tra semantic/behavior: Escape không bypass canClose khi có callback; Tab bỏ control hidden/disabled/tabindex âm; root rỗng giữ focus; nested close và delayed focus không giành focus; popup legacy không bị chặn; label tĩnh/động, icon close, Enter/Space, invalid marker, busy lock và state ACK, offline giữ dữ liệu form. CSS assertions xác minh2 cột bounded, token và visibility.
- Hồi quy business thực thi SQL trên fixture Postgres qua PGlite và giao diện jsdom. Web Push/Storage transport giả; không phải production provider. CSS parse/contrast token/DOM không đo layout hoặc chứng nhận accessibility.
- SQL và Edge Functions giữ nguyên byte so với source đầu vào; không cần migration hoặc redeploy Edge riêng cho16.7. Cài Notifications16.6 nếu trước đó chưa cấu hình vẫn cần backend cũ theo README.

**Chưa kiểm chứng:** iPhone/Safari/VoiceOver/keyboard mềm thật, hình học pixel/zoom/thao tác chạm, Supabase live, APNs/Web Push/Storage thật hoặc nhiều session PostgreSQL độc lập. Checklist thiết bị ở QUALITY_ACCESSIBILITY_V16.7.0.md. Không khẳng định mọi màn legacy đã đạt WCAG hoặc không còn lỗi.

Chưa push GitHub/deploy/kiểm tra upload Zipverra thực tế. Source ZIP dùng build_release.py kiểm tra asset, guard file dư/private, case collision, checksum, CRC và từng byte; giữ quy tắc source sạch.
