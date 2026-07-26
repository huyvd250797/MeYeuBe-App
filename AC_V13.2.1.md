# Acceptance Criteria — MeYeuBe V13.2.1 · Sửa giao diện Snackbar + Live-refresh Undo

## Bố cục Snackbar
- [ ] Thông báo (vd "Đã ghi nhận Bé bú.") luôn hiển thị gọn trên 1 dòng, không vỡ xuống từng chữ/từng ký tự.
- [ ] Có icon ✓ trong khung tròn riêng bên trái, tách biệt rõ với chữ thông báo.
- [ ] Nút "Hoàn tác" dạng pill (nền hồng thương hiệu, chữ trắng), nằm gọn bên phải, không bị đẩy lệch hoặc chồng chữ.
- [ ] Với thông báo dài (vd "Đã huỷ túi sữa 260726-01."), chữ tự rút gọn kèm "..." nếu không đủ chỗ, không làm vỡ bố cục.
- [ ] Test trên cả 2 theme sáng/tối: màu sắc rõ ràng, tương phản tốt.

## Live-refresh sau khi Hoàn tác
- [ ] Mở modal "Xem chi tiết theo loại" (vd Thay tã), vuốt xóa 1 bản ghi, bấm "Hoàn tác" ngay khi modal vẫn đang mở: bản ghi hiện lại đúng vị trí trong danh sách — không cần đóng/mở lại modal.
- [ ] Mở modal chi tiết, thêm mới 1 bản ghi (qua nút "+ Thêm ghi nhận" trong modal), bấm "Hoàn tác": bản ghi vừa thêm biến mất khỏi danh sách ngay trong modal đang mở — không cần đóng/mở lại.
- [ ] Mở màn Tìm kiếm toàn app, xóa 1 kết quả, bấm "Hoàn tác": kết quả hiện lại ngay trong danh sách Tìm kiếm đang mở.
- [ ] Không mở modal/Tìm kiếm nào (ở Dashboard hoặc trang khác) rồi Thêm/Xóa/Hoàn tác: hành vi vẫn như V13.2.0, không lỗi, không có phần tử nào bị thao tác nhầm.
- [ ] Dashboard/Thống kê/Timeline vẫn cập nhật đúng như trước (không hồi quy).

## Không hồi quy
- [ ] Toàn bộ phạm vi Undo V13.2.0 (12 điểm Thêm mới/Xóa) hoạt động y hệt, chỉ thêm khả năng live-refresh.
- [ ] Backup & Version Control, Global Search, Cloud Sync, Push Notification, Milestone Engine không bị ảnh hưởng.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V13.2.0 không thay đổi (đối chiếu `BASELINE_LOCK_V13.2.1.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
