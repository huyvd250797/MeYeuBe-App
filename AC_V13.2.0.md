# Acceptance Criteria — MeYeuBe V13.2.0 · Undo sau khi Thêm mới/Xóa

## Snackbar hiển thị đúng
- [ ] Thêm mới một ghi nhận Bé bú: Snackbar "✓ Đã ghi nhận Bé bú." + nút "Hoàn tác" hiện ngay, trượt lên từ dưới.
- [ ] Xóa một ghi nhận (bất kỳ loại nào trong 7 loại chăm sóc): Snackbar "✓ Đã xóa [loại]." + nút "Hoàn tác" hiện ngay.
- [ ] Snackbar tự biến mất sau đúng 8 giây, bằng hiệu ứng fade out (không trượt xuống lại).
- [ ] Đang hiện Snackbar mà thực hiện thêm/xóa 1 thao tác khác: Snackbar cũ bị thay bằng Snackbar mới (nội dung đổi đúng theo thao tác mới nhất).
- [ ] Đóng app/chuyển tab rồi quay lại sau khi Snackbar đã tự ẩn: bấm "Hoàn tác" (nếu còn thấy nút cũ do lỗi hiển thị) không có tác dụng — không được phục hồi dữ liệu ngoài cửa sổ 8 giây.

## Hoàn tác đúng và đầy đủ
- [ ] Thêm mới rồi Hoàn tác: bản ghi vừa tạo biến mất hoàn toàn, Dashboard/Thống kê/Timeline trở lại đúng như trước khi thêm.
- [ ] Xóa rồi Hoàn tác: bản ghi được khôi phục nguyên vẹn (đầy đủ field), xuất hiện lại đúng vị trí/thứ tự như trước khi xóa.
- [ ] Xóa 1 lần Bé bú lấy từ Kho sữa rồi Hoàn tác: bản ghi Bé bú quay lại VÀ túi sữa liên quan trở về đúng trạng thái/lượng còn lại trước khi xóa (không bị cộng dồn sai hay mất dấu).
- [ ] Hủy 1 túi sữa rồi Hoàn tác: túi sữa trở lại trạng thái "Đang bảo quản" với đúng lượng còn lại trước khi hủy.
- [ ] Thêm/Xóa Milestone, Lịch khám, Nhật ký (kể cả xóa qua màn Tìm kiếm), Sổ sức khỏe, Chỉ số thai kỳ/bé/mẹ: Hoàn tác đúng cho từng loại.

## Phạm vi áp dụng đúng (không thừa, không thiếu)
- [ ] **Sửa** một bản ghi đã có (không phải thêm mới): KHÔNG hiện Snackbar Hoàn tác.
- [ ] **Import Database** (JSON/ZIP/SQLite): KHÔNG hiện Snackbar Hoàn tác (dùng Restore Backup nếu cần khôi phục).
- [ ] **Restore Backup** (từ tính năng Backup & Version Control): KHÔNG hiện Snackbar Hoàn tác.
- [ ] Milestone tự động (auto): không tạo/xóa thủ công được nên không phát sinh Snackbar — đúng như hành vi cũ.

## Không hồi quy
- [ ] Các thông báo toast ngắn hiện có (vd "Thêm ghi nhận thành công", "Xóa lịch khám thành công") vẫn hiển thị như trước, không bị Snackbar Hoàn tác che mất hoặc thay thế sai.
- [ ] Global Search, Backup & Version Control (V13.0.0), form Ghi nhận gọn (V13.1.0), Cloud Sync, Push Notification, Smart Alert, Milestone Engine không bị ảnh hưởng.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V13.1.0 không thay đổi (đối chiếu `BASELINE_LOCK_V13.2.0.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.

## Known limitation
- Undo chỉ hoàn tác được thao tác **gần nhất** — không hỗ trợ nhiều mức Undo xếp chồng (giống Gmail/Google Photos).
- Cửa sổ Undo cố định 8 giây, không cấu hình được.
