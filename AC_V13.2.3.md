# Acceptance Criteria — MeYeuBe V13.2.3 · Toast + Hoàn tác song song, fix tràn nút

## Toast và Snackbar cùng hiện, không đè nhau
- [ ] Thêm mới 1 ghi nhận: Toast "Thêm ghi nhận thành công" hiện phía trên, Snackbar "✓ Đã ghi nhận... [Hoàn tác]" hiện phía dưới — cả 2 đọc được rõ ràng, không chồng lấn.
- [ ] Xóa 1 ghi nhận: tương tự, Toast "Xóa ghi nhận thành công" + Snackbar Hoàn tác cùng hiện, tách bạch.
- [ ] Áp dụng đúng cho cả 12 điểm Thêm mới/Xóa (7 loại chăm sóc, Lịch khám, Milestone kể cả qua Tìm kiếm, Nhật ký kể cả qua Tìm kiếm, Sổ sức khỏe, Chỉ số thai kỳ/bé/mẹ, Hủy túi sữa).
- [ ] Toast tự ẩn theo thời gian ngắn như cũ (~2.6s); Snackbar vẫn giữ 8 giây; khi Toast đã ẩn, Snackbar vẫn hiển thị bình thường không bị ảnh hưởng.

## Nút Hoàn tác không còn tràn viền
- [ ] Nút "Hoàn tác" hiển thị đúng dạng pill gọn (không full chiều ngang), có khoảng cách hợp lý với icon và chữ thông báo bên trái.
- [ ] Test trên màn hình nhỏ (iPhone SE, iPhone thường) lẫn màn hình lớn: nút luôn giữ kích thước gọn, không bị kéo giãn.

## Không hồi quy
- [ ] Toàn bộ hành vi Undo (rollback đúng, live-refresh modal chi tiết/Tìm kiếm) từ V13.2.0–V13.2.2 không đổi.
- [ ] Toast cho các trường hợp Sửa dữ liệu và cảnh báo/lỗi khác không bị ảnh hưởng.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V13.2.2 không thay đổi (đối chiếu `BASELINE_LOCK_V13.2.3.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
