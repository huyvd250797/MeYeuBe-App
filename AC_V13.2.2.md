# Acceptance Criteria — MeYeuBe V13.2.2 · Bỏ chồng chéo Toast/Snackbar Hoàn tác

## Không còn chồng chéo
- [ ] Thêm mới 1 ghi nhận Bé bú: chỉ hiện Snackbar "✓ Đã ghi nhận Bé bú. [Hoàn tác]" — KHÔNG có Toast "Thêm ghi nhận thành công" nào khác xuất hiện cùng lúc.
- [ ] Xóa 1 ghi nhận bất kỳ (Bé bú/Hút sữa/Ngủ/Thay tã/Uống thuốc/Nhiệt độ/Trớ sữa): chỉ hiện Snackbar, không có Toast trùng.
- [ ] Thêm/Xóa Lịch khám, Milestone (cả qua Tìm kiếm), Nhật ký (cả qua Tìm kiếm), Sổ sức khỏe, Chỉ số thai kỳ/bé/mẹ, Hủy túi sữa: đều chỉ hiện Snackbar, không Toast trùng.
- [ ] Nút "Hoàn tác" hiển thị đúng dạng pill gọn, không bị tràn/vỡ hình do bị Toast đè lên.

## Toast vẫn hoạt động đúng cho các trường hợp còn lại
- [ ] **Sửa** một bản ghi đã có (bất kỳ loại nào): vẫn hiện Toast "Cập nhật ... thành công" như trước — không bị mất.
- [ ] Các Toast cảnh báo/lỗi (vd "Vui lòng chọn Loại nhật ký", "Không thể xóa lần hút sữa vì túi sữa đã được sử dụng một phần") vẫn hiện bình thường.
- [ ] Nếu 1 Toast cảnh báo/lỗi xuất hiện trong lúc Snackbar Hoàn tác (từ thao tác trước) vẫn còn hiển thị: cả 2 nhìn được rõ ràng, không đè hoàn toàn lên nhau khiến không đọc được nội dung nào.

## Không hồi quy
- [ ] Toàn bộ hành vi Undo (12 điểm, rollback đúng, live-refresh modal chi tiết/Tìm kiếm) từ V13.2.0–V13.2.1 không đổi.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V13.2.1 không thay đổi (đối chiếu `BASELINE_LOCK_V13.2.2.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
