# Acceptance Criteria — MeYeuBe V13.1.0 · Gọn form Ghi nhận + phân biệt Tã ướt/Tã bẩn

## Gọn form Ghi nhận theo loại
- [ ] Mở form Ghi nhận với loại **Bé bú**, **Hút sữa** hoặc **Ngủ**: banner "mô hình liên kết" và 2 nút "⏱ Bắt đầu Bú"/"⏱ Bắt đầu Ngủ" vẫn hiển thị như trước.
- [ ] Mở form Ghi nhận với loại **Thay tã**, **Uống thuốc**, **Thân nhiệt**, **Trớ sữa**: banner và 2 nút Timer đều ẩn hoàn toàn.
- [ ] Đổi loại ngay trong form (không đóng form) cập nhật đúng hiển thị banner/Timer theo loại mới chọn.
- [ ] Nếu đang có Timer Bú/Ngủ chạy nền, chuyển sang loại khác (Timer bị ẩn) rồi quay lại Bé bú/Ngủ: Timer vẫn chạy đúng, không bị mất trạng thái.

## Số lượng tã gọn hơn
- [ ] Form Thay tã không còn bộ đếm lớn (−/giá trị/﹢) riêng biệt; chỉ còn 1 hàng nút **1 · 2 · 3 · ﹢**.
- [ ] Bấm 1/2/3 chọn đúng số lượng, nút tương ứng được tô đậm (active).
- [ ] Bấm ﹢ liên tục từ 3 lên 4, 5...: nút ﹢ tự hiện đúng số hiện tại (vd "﹢4"), nút này được tô đậm thay vì nút 1/2/3.
- [ ] Giá trị lưu vào bản ghi (`cAmount`) đúng với số đã chọn, không đổi so với trước.
- [ ] Sửa lại một bản ghi Thay tã cũ (vd đã lưu 5 tã): mở form sửa hiển thị đúng ﹢5 được tô đậm.

## Phân biệt Tã ướt / Tã bẩn trong danh sách
- [ ] Trong "Danh sách ghi nhận" của Thay tã: mọi bản ghi **Tã bẩn** (có đi phân) có nền thẻ tô màu ấm nhạt (nâu/cam), khác rõ với nền mặc định.
- [ ] Bản ghi **Tã ướt** giữ nguyên nền mặc định như trước, không bị đổi màu.
- [ ] Test ở cả 2 theme sáng và tối: màu tô nhìn rõ, không đè chữ, không phá vỡ độ tương phản.
- [ ] Xem qua danh sách lọc theo "Đi phân"/"Đi tè" (dữ liệu tự tính từ Thay tã): thẻ vẫn tô đúng theo `diaperType` gốc của bản ghi, không phụ thuộc đang lọc theo loại nào.

## Không hồi quy
- [ ] Các loại chăm sóc khác (Bé bú, Hút sữa, Ngủ, Uống thuốc, Thân nhiệt, Trớ sữa) không đổi giao diện/hành vi ngoài phần banner/Timer đã nêu.
- [ ] Kho sữa, Global Search, Backup & Version Control (V13.0.0), Cloud Sync, Push Notification, Smart Alert, Milestone Engine không bị ảnh hưởng.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V13.0.0 không thay đổi (đối chiếu `BASELINE_LOCK_V13.1.0.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
