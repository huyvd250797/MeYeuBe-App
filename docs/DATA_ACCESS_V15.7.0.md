# V15.7.0 — Scoped Queries & Settings

## Phạm vi hoàn thành
- Khởi động dùng shell1570 lấy cài đặt và danh mục; không tải care/milk/history sức khỏe, diary, lịch, cột mốc, sensor hoặc activity.
- Tổng quan nhẹ dùng summary SQL theo ngày, TTL15s + invalidation sau ACK; tổng bú lấy amount thực ăn, tã cộng số lượng, ngủ clip theo khoảng ngày, không tính giấc chưa kết thúc. Phạm vi ngày theo lịch Việt Nam. Không dùng danh sách vài trang để tính tổng lịch sử.
- Lịch tuần/tháng query đúng khoảng ngày, chống kết quả trả muộn; thay đúng cache phạm vi, kể cả xóa dòng từ thiết bị khác. Nhật ký/lịch danh sách giữ phân trang1560.
- Mở chức năng cần lịch sử (care, kho, sức khỏe/biểu đồ, thai kỳ, hành trình tháng/năm, cột mốc, backup...) đợi nạp đầy đủ qua API hiện có trước khi mở. Có nút xem dashboard đầy đủ để giữ mọi block/cấu hình cũ. Sau khi phiên đã nạp đầy đủ, giữ chế độ đầy đủ để không làm sai legacy render/notification/auto milestone. Đây là chuyển đổi tăng dần; chưa phải toàn bộ màn chỉ đọc scope. Scoped Realtime/loại toàn bộ wrapper còn ở roadmap15.8/15.9.
- Không tạo backup tự động hoặc đánh giá push rule lịch sử từ cache chưa đầy đủ; các tác vụ đó đợi chế độ đầy đủ. Export thủ công đợi tải đủ trước. Push nền trên server không thay đổi.
- Cài đặt lưu profile/dashboard/other độc lập; hash kiểm tra xung đột từng nhóm, transaction, mã thao tác chống trùng, durable pending theo đích + explicit recovery. Nhóm dashboard có thể kèm babyDescription(profile) do form cũ, kiểm tra cả hai nhóm nếu thay đổi.
- Lưu form chính và các reset/move dashboard qua adapter chờ ACK. Tải lại cài đặt bỏ draft là hành động riêng sau conflict. Unknown ACK giữ command để tra cứu trước khi gửi lại.
- Theme auto/light/dark lưu riêng thiết bị ở mybThemeMode_v1570, seed từ cache cũ nếu có, không ghi vào shared settings. Cloud URL/key/SyncID, timer, pending, notification history và file local giữ nơi lưu cũ; không tự đưa secret lên database.

## Database / nâng cấp
Chạy lần lượt 1530 → 1540 → 1550 → 1560 → `20261025_1570_scoped_settings.sql`. Nếu đã cài1560 chỉ cần1570. Hoàn tất pending trên mọi thiết bị và backup trước, cập nhật app trên mọi thiết bị sau migration. Không reset dữ liệu; native settings ID/family unique giữ nguyên. Khóa writer legacy entity settings để client cũ không thay toàn object. Cột cloud_config/smart_alert_config/theme_mode hiện hữu không bị xóa hoặc đổi. Dữ liệu setting app hiện có tiếp tục ở extra + cột chuẩn; dashboard_config được cập nhật đồng bộ. Giữ mô hình SyncID hiện có, không thêm tài khoản/Auth.

Helper + operation log private, endpoints SECDEF cấp anon/authenticated/service_role như API trước. Không coi đây là nâng cấp xác thực người dùng. Migration trong transaction, re-runnable. Không rollback bằng cách chỉ deploy client cũ vì writer cũ đã khóa; dùng sửa tiến hoặc restore DB backup đồng bộ app khi cần quay lại.

## Kiểm chứng / giới hạn
PGlite/schema fixture + jsdom. Không truy cập Supabase production hay dữ liệu thật. Không coi đây là đo tốc độ trên thiết bị. So sánh payload fixture có 1000 dòng cũ: xem output PAYLOAD_BYTES trong tests/scoped-sql.cjs và báo cáo JSON. Chưa benchmark mạng thật, iOS/PWA, hai backend session thật hoặc push nền.
