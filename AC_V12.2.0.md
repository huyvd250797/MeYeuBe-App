# Acceptance Criteria — MeYeuBe V12.2.0 · Tìm kiếm toàn app

## Điểm vào
- [ ] Nút **🔍** hiển thị trên Header (giữa widget streak 🔥 và nút dark mode 🌙); bấm mở màn tìm kiếm.
- [ ] Menu chính có mục **🔍 Tìm kiếm** ngay dưới Dashboard; bấm mở màn tìm kiếm và tự đóng menu.
- [ ] Bấm ← (hoặc nút đóng) trở về màn trước, khôi phục đúng vị trí cuộn.

## Phạm vi & khả năng tìm
- [ ] Một ô tìm kiếm duy nhất quét toàn bộ: Bé bú, Hút sữa, Kho sữa, Thay tã (gồm đi tè/đi phân), Ngủ, Thuốc, Nhiệt độ, Trớ sữa, Milestone, Nhật ký, Lịch khám.
- [ ] Tìm theo **ngày**: "24/07", "24-07-2026", "24 jul", "24/7" đều ra bản ghi đúng ngày.
- [ ] Tìm theo **giờ**: "15:30" ra bản ghi có giờ tương ứng.
- [ ] Tìm theo **số ml**: "70ml", "70", "120" ra cữ bú/lần hút/túi sữa tương ứng.
- [ ] Tìm theo **loại hoạt động**: "bú", "hút", "ngủ", "thay tã", "đi tè", "đi phân", "thuốc" (và không dấu: "bu", "ngu", "thay ta") lọc đúng loại.
- [ ] Tìm theo **ghi chú**: gõ tên bình ("Fatz", "Tím mập") ra bản ghi/túi có ghi chú đó.
- [ ] Tìm theo **mã túi sữa**: "260724-03" và "260724" đều ra túi tương ứng.
- [ ] Tìm theo **tên thuốc**: "Paracetamol", "Vitamin D3".
- [ ] Tìm theo **tên cột mốc**: "Lật", "Biết cười", "Tròn 1 tháng".
- [ ] Không phân biệt dấu tiếng Việt và không phân biệt hoa/thường.

## Khoảng thời gian nhanh
- [ ] Chip **Hôm nay / Hôm qua / Tuần này / Tháng này** lọc đúng phạm vi; bấm lại để bỏ chọn.
- [ ] Gõ thẳng "hôm nay" / "tuần này"… trong ô tìm cũng áp bộ lọc thời gian tương ứng.

## Bộ lọc & sắp xếp
- [ ] Hàng chip loại dữ liệu cho **chọn nhiều loại cùng lúc**; kết quả chỉ còn các loại đã chọn.
- [ ] Sắp xếp **Mới nhất / Cũ nhất / Liên quan nhất** đổi đúng thứ tự; mặc định Mới nhất.
- [ ] Hiển thị số lượng kết quả.

## Hiển thị kết quả
- [ ] Mỗi dòng có: icon, loại dữ liệu, thời gian (ngày + giờ), tiêu đề, thông tin chính, ghi chú (nếu có).
- [ ] **Từ khóa khớp được tô sáng** trong tiêu đề/thông tin/ghi chú.
- [ ] Khi ô tìm trống và không có bộ lọc: hiện danh sách **Gần đây**.
- [ ] Không có kết quả: hiện trạng thái rỗng có gợi ý.

## Quick Action
- [ ] **Bấm** vào một kết quả mở đúng chi tiết: bản ghi chăm sóc → popup chi tiết; túi sữa → chi tiết túi; cột mốc → chi tiết mốc; nhật ký → mở cuốn nhật ký đúng mục; lịch khám → form lịch.
- [ ] **Vuốt sang trái** trên một kết quả lộ **✏️ Sửa** và **🗑 Xóa**.
- [ ] Sửa mở đúng form/màn sửa của bản ghi. Xóa hỏi xác nhận và cập nhật lại danh sách tìm kiếm ngay.
- [ ] Cột mốc tự động không cho xóa từ tìm kiếm (chỉ sửa ghi chú/ảnh qua chi tiết).

## Không hồi quy (regression)
- [ ] Nền phía sau overlay tìm kiếm bị khoá cuộn (chỉ cuộn trong danh sách kết quả); không khoá chồng gây lỗi modal khác.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V12.1.1 không thay đổi (đối chiếu `BASELINE_LOCK_V12.2.0.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
