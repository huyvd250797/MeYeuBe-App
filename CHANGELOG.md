# V17.2.0 — Health Planning

- Lịch khám/tiêm đã lưu trong một màn hình; lọc thành viên native ID, ngày và trạng thái.
- Mở đúng hồ sơ/tệp và bản ghi; đánh dấu lịch đã khám với OCC. Lịch cũ thiếu liên kết hiển thị rõ.
- Chọn hồ sơ cụ thể khi lưu lịch, không tự ghi đè bằng người đầu tiên cùng quan hệ.
- Một loading tối giản, thông báo cập nhật chỉ hiện khi dashboard sẵn sàng.
- Backend giữ nguyên; không SQL mới.

# V17.1.2 — Fullscreen Viewport Fix

- Đo visual viewport khi form mở, resize/xoay/keyboard, fallback innerHeight; không co form theo pinch zoom.
- Bỏ phần trăm chiều cao card, stretch theo overlay, reset padding đáy, footer an toàn.
- Không đổi database/API, không migration, giữ kho cũ và swipe.
- Kiểm thử viewport mô phỏng và hồi quy; chưa iPhone/Safari thật, chưa push/deploy.
