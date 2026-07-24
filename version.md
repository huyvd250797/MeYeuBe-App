# MeYeuBe V11.3.1

## 🔠 Cân đối cỡ chữ form Hút sữa (V11.3.1)
- Đối chiếu form Hút sữa với các form đang có và hạ cỡ chữ về đúng hệ chung: số ml 40px → tối đa 32px (bằng bộ đếm form Thay tã), nút −/＋ 52px/24px → 46px/22px, nút Bên hút 13.5px → 13px (cao 44px), chip gợi ý nhanh cao 36px → 34px.
- Thẻ Vị trí bảo quản / Trạng thái / Hạn sử dụng: hạ chiều cao 48px → 46px (ô bên trong 44px) cho ngang với ô nhập chuẩn của các form khác; icon 16px → 15px, nhãn thời gian còn lại 11.5px → 11px.
- Khối Gợi ý bảo quản: chữ mô tả 11.5px → 12px cho dễ đọc, icon 15px → 14px; khối Tóm tắt lần hút: giá trị 13px → 12.5px, icon 14px → 13px.
- Thanh tiêu đề popup Ghi nhận (áp dụng cho mọi loại chăm sóc): tiêu đề 17px → 16px (máy hẹp 16px → 15px), nút ✕ 44px → 40px, nút Lưu 14px/44px → 13.5px/42px để 3 thành phần cân nhau.
- Màn hình ≤430px: nút Bên hút 12px, nút −/＋ 44×44px (21px), giá trị tóm tắt 12px.
- Không đổi chức năng, dữ liệu lưu và hành vi so với V11.3.0; các form khác giữ nguyên cỡ chữ.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.3.0 không đổi — xem `BASELINE_LOCK_V11.3.1.json`.

# MeYeuBe V11.3.0

## 🥛 Nâng cấp giao diện Hút sữa (V11.3.0)
- Bên hút: thay dropdown bằng 3 nút chọn nhanh "Cả hai · Bên trái · Bên phải", nút đang chọn tô nền hồng chữ trắng. Giá trị lưu vào dữ liệu vẫn là "Cả hai"/"Trái"/"Phải" như cũ.
- Số lượng: bộ đếm lớn (− / số ml / ＋, bước 10ml) kèm hàng chip gợi ý nhanh 60 · 120 · 150 · 200 ml; vẫn cho nhập tay trực tiếp vào ô số.
- Vị trí bảo quản & Trạng thái: gộp thành 1 hàng 2 cột có icon, tự xếp dọc trên máy màn hình hẹp; nhãn nơi bảo quản hiển thị kèm thời hạn (Ngăn mát (4°C) · 4 ngày, Ngăn đông · 6 tháng...).
- Hạn sử dụng dự kiến: thẻ riêng có icon lịch và nhãn thời gian còn lại ("6 ngày tới", "4 giờ tới", "Đã quá hạn").
- Thêm khối "Gợi ý bảo quản" và "Tóm tắt lần hút" (Số lượng · Bên hút · Bảo quản · HSD dự kiến) cập nhật ngay khi nhập.
- Cân đối tỉ lệ: chuẩn hóa nhãn 11px in hoa, nút cao 44–52px, số ml tối đa 40px, bo góc 14–18px cho toàn bộ form Hút sữa — không còn chỗ chữ quá to, chỗ quá nhỏ; kiểm tra không tràn ngang ở màn hình 360px.
- Form Ghi nhận (mọi loại): thanh tiêu đề popup nay có ✕ bên trái, tên loại ở giữa và nút "Lưu" bên phải để lưu nhanh không cần cuộn xuống cuối.
- Ghi chú: giới hạn 200 ký tự kèm bộ đếm N/200 dưới ô nhập.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.2.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.3.0.json`.

# MeYeuBe V11.2.0

## 🧷 Nâng cấp giao diện Thay tã (V11.2.0)
- Loại tã: 2 thẻ lớn hơn, thẻ đang chọn tô nền hồng đậm kèm dấu ✓ góc trên bên phải, dễ nhận biết hơn thẻ viền mỏng cũ.
- Số lượng: thay ô nhập số bằng bộ đếm lớn (nút − / giá trị / nút ﹢) và hàng nút chọn nhanh 1 · 2 · 3 · ﹢ (bấm 1/2/3 để chọn thẳng, bấm ﹢ để tăng dần khi cần nhiều hơn 3).
- Thời gian: bản ghi Thay tã chỉ còn 1 dòng Ngày + Giờ (không hiển thị Ngày kết thúc/Đến giờ/Thời lượng vốn không áp dụng cho một lần thay tã); nhãn đổi thành "Ngày *" / "Giờ *". Các loại chăm sóc khác (Bé bú, Ngủ...) không đổi.
- Ghi chú: thu gọn mặc định sau nút "✎ Thêm ghi chú (tùy chọn)", bấm vào mới hiện ô nhập; nếu bản ghi đã có ghi chú (sửa bản ghi cũ) thì tự mở sẵn. Chỉ áp dụng khi đang nhập Thay tã.
- Fix: sửa một bản ghi "Tã bẩn" trước đó có thể tự chuyển hiển thị về "Tã ướt" ngay sau khi mở form sửa (do một setTimeout dựng lại giao diện chạy sau và ghi đè lựa chọn đã nạp từ dữ liệu). Nay mở sửa luôn hiển thị đúng loại tã và số lượng đã lưu.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.1.3 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.2.0.json`.

# MeYeuBe V11.1.3

## 🛠️ Hoàn thiện Hành trình theo tháng (V11.1.3)
- Sửa lỗi cuộn: mở chi tiết một tháng trong "Hành trình theo tháng" nay chỉ cuộn được bên trong popup chi tiết, không còn bị cuộn ra giao diện bên ngoài phía sau.
- Bố cục các dòng Milestone trong popup chi tiết tháng: tách tiêu đề và ngày thành 2 dòng rõ ràng, không còn bị dính sát vào nhau.
- Sửa lỗi đóng popup: bấm vào một Milestone trong chi tiết tháng để xem popup chi tiết Milestone, rồi đóng popup đó giờ chỉ đóng đúng popup Milestone và quay lại popup chi tiết tháng, không còn đóng luôn cả hai popup cùng lúc.

# MeYeuBe V11.1.0

## ❤️ Kỷ niệm & Thống kê (V11.1.0)
- Menu "🏆 Hành trình lớn khôn" được gộp vào nhóm mới "❤️ Kỷ niệm & Thống kê" cùng 3 mục mới: Hành trình theo tháng, Thống kê & So sánh, Tổng kết năm.
- Hành trình theo tháng: xem lại dữ liệu của bé theo từng tháng tuổi (Milestone, số bản ghi chăm sóc, ảnh), bấm vào một tháng để xem chi tiết kèm ghi chú riêng cho tháng đó.
- Thống kê & So sánh: so sánh cữ bú/giấc ngủ/lượng sữa hút hôm nay với hôm qua, trung bình 7 ngày, 30 ngày hoặc tháng trước, có mũi tên tăng/giảm.
- Tổng kết năm: tổng kết số cữ bú, giấc ngủ, lít sữa mẹ, ảnh và Milestone theo từng năm tuổi của bé; chia sẻ thành ảnh hoặc xuất PDF.
- Dashboard không đổi (giữ nguyên hành vi Block "Hành trình lớn khôn" đã khoá ở bản trước).

# MeYeuBe V11.0.1

## Milestone Photo Viewer, Lịch khám theo ngày, Giờ đạt mốc
- Hành trình lớn khôn: bấm vào ảnh trong Album mở ảnh toàn màn hình đúng tỉ lệ gốc (không crop vuông), đóng bằng nút ✕ hoặc chạm ra ngoài.
- Cấu hình Dashboard: thêm "Lịch khám sắp tới trong vòng (ngày)" — Block Lịch khám tự ẩn nếu không có lịch trong khoảng đã cấu hình.
- Milestone tự động (Bé bú/Ngủ/Hút sữa) lưu kèm giờ đạt được, hiển thị ở màn hình chi tiết.

## Hành trình lớn khôn (Milestone Timeline) (V11.0.0)
- Menu mới "🏆 Hành trình lớn khôn": Timeline các cột mốc đáng nhớ của bé, nhóm theo ngày, mới nhất lên đầu.
- Tự động tạo Milestone ngay khi lưu dữ liệu chăm sóc đạt điều kiện (bú/ngủ/hút sữa/cân nặng/chiều dài/mũi tiêm/Vitamin D), không cần chờ mở lại app; không tạo trùng, không tự xóa khi dữ liệu gốc thay đổi.
- Tự tạo Milestone thủ công với icon, mô tả, ghi chú và tối đa 20 ảnh; Milestone tự động khoá tiêu đề/loại/ngày, vẫn cho thêm ảnh, ghi chú và chia sẻ.
- Bộ lọc theo 8 loại mốc; chia sẻ Milestone thành ảnh PNG; Thông báo trong ứng dụng khi có mốc mới.
- Cấu hình Dashboard có thêm Block "Hành trình lớn khôn": bật/tắt, đổi tên, đổi vị trí bằng nút ↑/↓, cập nhật ngay không cần khởi động lại.
