# V17.2.3 — Loading Brand Polish

- Thiết kế lại loading có nhận diện thương hiệu, logo tròn, tên app, trạng thái + ba chấm và badge phiên bản.
- Card/nền sáng tối có chiều sâu nhẹ; gọn trên màn hình ngang; giữ reduced motion, error/retry và update gate.
- Tách stylesheet loading riêng; không thay business logic hoặc backend. Không SQL mới.

# V17.2.2 — Care UI Cleanup

- Bỏ tự giữ/khôi phục bản nháp chăm sóc và các nút lựa chọn nháp; đóng form bỏ nội dung nhập.
- Splash phẳng theo sáng/tối, icon gọn không vòng sáng; giữ version, Đang tải dữ liệu, ba chấm.
- Timer hai hàng, chiều cao tự nhiên, đồng hồ rõ và hai nút Dừng/Hủy đầy đủ.
- Giữ outbox giao dịch chưa xác nhận, chống trùng, OCC và ledger; không thay backend/SQL.

# V17.2.1 — Loading Visual Restore

- Khôi phục icon app và ba chấm có animation trong loading; giữ tên phiên bản và Đang tải dữ liệu.
- Giữ một lớp loading, retry khi lỗi và cập nhật sau khi vào dashboard. Không đổi API/database; không SQL mới.

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
