# V17.0.0 — 26/10/2026 — Care Workflow

- Giữ nháp form chăm sóc trên thiết bị theo URL/Sync ID và ID bản ghi; tiếp tục/bỏ nháp, phát hiện thay đổi từ tab khác và lỗi storage. Không bổ sung mẫu ghi nhận.
- Tóm tắt bú từ kho: lượng lấy, bé thực bú, thừa/hủy và hủy thêm phần còn lại. Chặn nguồn thiếu, lượng không khớp và waste ngoài giới hạn trước khi gửi.
- Sửa giữ ID/OCC đã chụp; quay về trang/bộ lọc/popup Kho sữa và vị trí cuộn. Sao chép dùng ngày mới và yêu cầu chọn lại nguồn kho.
- Verify pending chỉ đọc; resend có chủ đích bằng nguyên command/operation ID. Giữ pending khi HTTP5xx/JSON ghi hỏng, xác minh ACK đúng operation. Giữ phần sửa thêm sau timeout, không xóa nháp đó khi xác nhận request cũ.
- Giữ nháp ngày/giờ kết thúc timer trên thiết bị; xóa timer đúng ID sau ACK. Khôi phục Undo/transfer sau mất ACK theo loại thao tác.
- Tách drafts/workflow/CSS thành module riêng; app.js chỉ cập nhật phiên bản. Không đổi SQL/Edge Functions, không migration mới.
- Loại124 file lịch sử/backup/unused được kèm lại trong ZIP đầu vào; bỏ báo cáo/checksum cũ, giữ dependencies/test/config/migration hiện dùng. ZIP có allowlist, kiểm CRC và đối chiếu byte.
- Kiểm thử local theo docs/VALIDATION_REPORT_V17.0.0.md. Chưa kiểm thử iPhone/WebKit, Supabase production, hai thiết bị thật; chưa push/deploy.
