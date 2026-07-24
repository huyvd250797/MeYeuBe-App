# MeYeuBe V11.4.1

## 🔍 Tinh gọn giao diện chi tiết Bé bú + ghi chú túi sữa (V11.4.1)
- Kéo dài modal chi tiết: lề trên trên máy hẹp 54px → 8px (tính cả safe-area), lề dưới 20px → 10px, lề ngang 8px → 6px; vùng cuộn danh sách trên iPhone 390px tăng 530px → 635px (+20%), số bản ghi thấy cùng lúc 2 → 4.
- Hạ cỡ chữ toàn khối modal chi tiết về đúng hệ chung: tiêu đề loại 24px → 19px (máy ≤430px 17.5px), avatar 52px → 40px → 36px; thẻ Ngày/Tổng số lần 15px → 13px, icon 34px → 28px; khối Tổng quan tiêu đề 17px → 14.5px, số liệu 16px → 14px, icon ô 38px → 30px.
- Thẻ bản ghi gọn lại: giờ 19px → 16px, tiêu đề 15px → 13.5px, nhãn phân loại 10.5px → 9.5px, bảng 3 số liệu 14px → 12.5px, hàng túi sữa 11.5px → 10.5px; khoảng cách giữa các thẻ 12px → 9px.
- Chân modal thu gọn: nút "＋ Thêm ghi nhận" cao 54px → 44px (máy ≤430px 42px), chữ 16px → 14.5px, padding 12px → 8px; dòng gợi ý vuốt sang trái 11.5px → 10px và ép gọn 1 dòng. Tổng chiều cao footer 98px → 74px.
- Bổ sung ghi chú túi sữa trên bản ghi bú: thẻ "🍼 Ghi chú bình:" nay lấy ghi chú của túi sữa trong Kho sữa (vd "Bình tím mập", "Bình tím cao") thay vì chỉ lấy ghi chú của bản ghi như trước — dùng để phân biệt bé bú bình nào. Chấm màu tự nhận theo màu ghi trong ghi chú.
- Bản ghi có ghi chú riêng khác ghi chú túi sẽ hiện thêm thẻ "📝 Ghi chú:"; không hiện trùng khi hai ghi chú giống nhau.
- Cữ bú lấy từ nhiều túi: mỗi hàng túi sữa có chip ghi chú riêng để không lẫn túi nào là bình nào.
- Ghi chú túi được lưu thêm vào snapshot lúc bú (`extra.milkBagSnapshots[].note`), nên lịch sử vẫn hiển thị đúng tên bình sau khi túi bị xoá khỏi kho.
- Máy ≤430px: thẻ ghi chú xuống dòng riêng nhưng gói gọn 1 hàng ngang (trước là 2 dòng) để đỡ tốn chiều cao.
- Không đổi chức năng, luồng lưu và cấu trúc dữ liệu cũ so với V11.4.0; các loại chăm sóc khác (Hút sữa, Kho sữa, Ngủ, Thay tã...) dùng chung hệ cỡ chữ mới.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.4.0 không đổi — xem `BASELINE_LOCK_V11.4.1.json`.

# MeYeuBe V11.4.0

## 🍼 Nâng cấp giao diện chi tiết Bé bú (V11.4.0)
- Thanh tiêu đề modal chi tiết: avatar tròn chứa icon loại chăm sóc, tên loại cỡ lớn kèm số bản ghi, nút ✕ bên phải; bấm vào tên loại (dấu ⌄) để đổi loại chăm sóc thay cho ô "Loại" cũ.
- Thêm 2 thẻ tóm tắt ngay dưới tiêu đề: "📅 Ngày" (bấm mở bộ chọn ngày) và "🕐 Tổng số lần" (bấm mở biểu đồ thống kê); trên máy màn hình hẹp 2 thẻ vẫn nằm cùng một hàng.
- Khối "Tổng quan" dạng 4 ô có icon: với Bé bú là Tổng lượng · Bú trực tiếp · Bú từ sữa đã hút · Sữa công thức, kèm nút "Xem thống kê ›". Các loại khác (Hút sữa, Kho sữa, Ngủ, Thay tã, Đi tè/Đi phân, Uống thuốc, Thân nhiệt, Trớ sữa) đều có bộ 4 ô tương ứng.
- Danh sách ghi nhận hiển thị theo timeline: chấm tròn hồng và đường kẻ đứt nối các bản ghi, thêm nút "Sắp xếp: Mới nhất / Cũ nhất" và ghi nhớ lựa chọn cho lần mở sau.
- Thẻ bản ghi mới: giờ cỡ lớn màu hồng, nhãn phân loại ("Trực tiếp", "Từ sữa đã hút", "Sữa công thức"), icon, tiêu đề, dòng phụ số ml và thẻ ghi chú riêng ("Ghi chú bình:" khi bú bình) có chấm màu tự nhận theo màu ghi trong ghi chú.
- Bản ghi "Bú từ kho sữa đã hút" có bảng 3 số liệu "Lấy từ kho · Bé bú thực tế · Còn lại sau bú" và hàng "Túi sữa · Trạng thái" (Đã sử dụng hết / Đang dùng / Đã bỏ) kèm chấm màu; bấm vào hàng túi sữa để mở Kho sữa. Số ml bỏ do bé không bú hết hoặc ml hủy trong túi hiển thị thành nhãn cảnh báo.
- Nút "＋ Thêm ghi nhận" chuyển xuống chân modal, rộng hết chiều ngang và luôn cố định khi cuộn; dòng gợi ý vuốt sang trái nằm ngay dưới nút.
- Trạng thái rỗng có khối riêng ("Chưa có dữ liệu") thay cho dòng chữ nhỏ như trước.
- Giữ nguyên: vuốt sang trái để Sửa/Xóa (thêm nút "›" ở góc phải thẻ để mở form sửa), bộ lọc kho sữa, thẻ túi sữa và toàn bộ dữ liệu lưu.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.3.1 không đổi — xem `BASELINE_LOCK_V11.4.0.json`.

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
