# MeYeuBe V11.7.0

## 🎨 Kho sữa bỏ icon, màu theo hạn dùng — phương án B (V11.7.0)
- Bỏ toàn bộ **6 emoji app tự thêm** trong mỗi thẻ túi (🗓 Tạo · 🍼 Hút · 🕐 HSD · 💧 Dung tích · ❄️ Vị trí · 🕐 HSD còn lại) — nhãn chữ đã nói đủ ý. Đo màn Kho sữa 7 túi: **45 emoji → 3**, và 3 emoji còn lại đều là emoji người dùng tự gõ trong tên bình ("Bình bú 🍼", "Tím mập 🟣"), app không thêm cái nào.
- Chấm màu đầu thẻ đổi nghĩa: trước đây mã hoá **tên bình**, nay mã hoá **mức hạn dùng còn lại** theo đúng thang quy ước — 🟢 từ 24 giờ trở lên · 🟡 12–23 giờ 59 · 🟠 6–11 giờ 59 · 🔴 1–5 giờ 59 · ‼️ dưới 1 giờ · ⚫ quá hạn hoặc đã đóng. Cùng ngưỡng với `milkUrgencyIcon` nên hai chỗ không lệch nhau.
- Bỏ vạch màu bên trái thẻ vì nó lặp lại đúng thông tin của chấm màu.
- Huy hiệu góc phải đổi từ "Đang bảo quản" thành **thời gian còn lại tô màu theo mức hạn dùng** ("Còn 20 giờ", "Còn 35 phút"). "Đang bảo quản" là trạng thái mặc định nên không in ra nữa; túi đã dùng hết / đã bỏ thì huy hiệu hiện trạng thái đó, màu xám.
- Thêm `milkTimeLeftShort` cho huy hiệu: dưới 1 giờ đọc theo phút, dưới 1 ngày theo giờ, dưới 30 ngày theo ngày, còn lại theo tháng — sữa trữ đông không còn hiện "Còn 179 ngày 10 giờ" tràn cả hàng.
- Hàng ô rút từ 4 xuống **3 ô** (`Ghi chú bình · Dung tích · Vị trí`): ô "HSD còn lại" bỏ đi vì số giờ đã nằm ở huy hiệu góc phải. Ô canh trái, nhãn nhỏ trên, giá trị đậm dưới.
- Bỏ tô màu tên bình: việc phân biệt bình dựa vào chính tên bình người dùng gõ, để trong thẻ chỉ còn **một tín hiệu màu duy nhất** là hạn dùng.
- Dòng meta chỉ hiện "Hút" khi giờ hút khác giờ tạo túi — với dữ liệu thật hai giờ này gần như luôn trùng nhau nên hàng meta rút còn `Tạo … · HSD …`.
- Popup chi tiết túi dùng chung màu và huy hiệu hạn dùng với thẻ; phần nội dung 11 dòng giữ nguyên (vẫn có dòng "HSD còn lại" đầy đủ, không rút gọn).
- Đo iPhone 390px: chiều cao 1 thẻ 113px → **102px**, và không còn trường hợp thẻ nở lên 127px do chữ "Còn 1 ngày 3 giờ" xuống 2 dòng; tổng chiều cao danh sách 7 túi 897px → **794px (−11%)**. Cỡ chữ nhỏ nhất 9px, lớn nhất trong thẻ 13px.
- Không đổi dữ liệu lưu, luồng lưu, luồng huỷ túi, vuốt Sửa/Huỷ, bộ lọc và các tính năng khác so với V11.6.0.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.6.0 không đổi (26/26) — xem `BASELINE_LOCK_V11.7.0.json`.

# MeYeuBe V11.6.0

## 🧊 Kho sữa gọn, modal kín màn hình (V11.6.0)
- Modal chi tiết chăm sóc kéo xuống sát mép dưới màn hình: bỏ lề dưới của lớp phủ (safe-area chuyển vào chân modal), chiều cao dùng `100dvh` nên không còn hụt khi thanh công cụ trình duyệt ẩn/hiện. Đo iPhone 390×844: khoảng trống thừa dưới modal 38px (10px + safe-area) → **0px**, vùng cuộn danh sách 497px → **598px (+20%)**.
- Bỏ nút "Sửa túi" nằm trong mỗi thẻ túi sữa. Vuốt sang trái trên túi giờ mở 2 nút: **✏️ Sửa** (xanh) và **🗑 Huỷ túi** (đỏ). Túi đã dùng hết / đã bỏ chỉ hiện nút Sửa và vẫn vuốt được — trước đây các túi này bị khoá vuốt nên không sửa lại được sau khi đã đóng.
- Thiết kế lại thẻ túi sữa theo bản mẫu: vạch màu nhận diện bình bên trái + chấm màu · mã túi · dung tích · huy hiệu trạng thái; một dòng meta `🗓 Tạo · 🍼 Hút · 🕐 HSD`; và hàng 4 ô `Ghi chú bình | Dung tích | Vị trí | HSD còn lại`.
- Màu nhận diện bình băm từ tên bình trong ghi chú ra 1 màu cố định trong bảng 8 màu, nên hoạt động với mọi cách đặt tên ("Bình bú 🍼", "Fatz 1️⃣") — thay cho cách dò chữ tên màu ở V11.4.1 vốn không kích hoạt với dữ liệu thật.
- Bấm vào một túi mở popup chi tiết túi sữa: dung tích ban đầu, còn lại, đã cho bé bú, đã bỏ, vị trí bảo quản, trạng thái, thời điểm hút, HSD, HSD còn lại, ghi chú bình, lý do huỷ; chân popup có nút Sửa túi / Huỷ túi.
- Khối "Tổng quan kho sữa" đổi 4 ô thành: **Tổng dung tích (ml) · Tổng số túi · Dự kiến dùng hết · Sắp hết hạn**. "Dự kiến dùng hết" tính từ lượng còn lại chia cho lượng bú từ kho trung bình 7 ngày gần nhất; "Sắp hết hạn" đếm túi đang bảo quản còn dưới 24 giờ.
- Bộ lọc kho sữa rút từ khối 2 dòng có nút Ẩn/Hiện xuống **1 hàng chip**: `🔎 Bộ lọc · Trạng thái ⌄ · Vị trí ⌄`; chip đang lọc đổi viền hồng và hiện thẳng giá trị đang chọn. Thanh cố định phía trên modal 251px → **162px (−35%)**.
- Số bản ghi trên tiêu đề đọc đúng đơn vị: "3 record" → "3 túi" ở Kho sữa, "5 lần" ở các loại chăm sóc khác.
- Đo iPhone 390px màn Kho sữa: chiều cao 1 thẻ túi 149px → **127px (−15%)**, tổng chiều cao danh sách 5 túi 890px → **661px (−26%)**, số túi nhìn trọn vẹn cùng lúc 1 → **3**. Cỡ chữ nhỏ nhất 9px, lớn nhất trong thẻ 13px.
- Không đổi dữ liệu lưu, luồng lưu, luồng huỷ túi, bộ lọc và toàn bộ tính năng khác so với V11.5.0.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.5.0 không đổi (26/26) — xem `BASELINE_LOCK_V11.6.0.json`.

# MeYeuBe V11.5.0

## 🧹 Dọn nhiễu danh sách ghi nhận — phương án A (V11.5.0)
- Bỏ toàn bộ emoji ở nhãn số liệu và hàng túi sữa (📦 Lấy từ kho, 👶 Bé bú thực tế, 🍼 Còn lại sau bú, 🧊 Túi sữa, ⭕ Trạng thái…). Mỗi bản ghi giờ chỉ còn đúng 1 icon loại chăm sóc; một màn Bé bú giảm từ ~42 emoji xuống 5.
- Bỏ nhãn phân loại trùng tiêu đề ở Bé bú: "Từ sữa đã hút" / "Trực tiếp" / "Sữa công thức" nói lại đúng ý của tiêu đề nên không hiện nữa. Các loại khác vẫn giữ nhãn vì nó mang thông tin thật (Bên hút, Đã dậy, Số tã…), nhưng chuyển vào dòng phụ thay cho viên thuốc màu xếp dưới giờ.
- Gộp thành 1 dòng phụ duy nhất: `nhãn · giá trị · tên bình`. Số ml của cữ bú (vd "80 ml") in đậm màu chữ chính, tên bình in màu tím.
- Bỏ hộp "Ghi chú bình" có viền: tên bình chuyển vào dòng phụ. Ghi chú do người dùng nhập xuống một dòng riêng không viền, tối đa 2 dòng.
- Bỏ chấm màu tự nhận theo tên màu trong ghi chú (chỉ chạy khi ghi chú có chữ "tím", "hồng"… nên không dùng được với cách đặt tên bình theo số). Thay bằng tên bình in màu tím, hoạt động với mọi cách đặt tên.
- Khối số liệu bỏ viền và bỏ vạch chia ô, chỉ còn nền nhạt.
- Bảng số liệu Bé bú chỉ hiện khi bé bú không hết — lúc đó mới có 3 số "Lấy từ kho · Bé bú thực tế · Bỏ đi" và số "Bỏ đi" tô vàng. Cữ bú bình thường không cần bảng vì số ml đã nằm ở dòng phụ và số còn lại đã gộp vào hàng túi sữa.
- Hàng túi sữa rút gọn thành `Túi <mã> · <trạng thái> · còn <N> ml`, chấm trạng thái 6px thay cho huy hiệu tròn có ký tự ✓/○.
- Bỏ bảng số liệu của Hút sữa / Ngủ / Thay tã / Uống thuốc / Thân nhiệt / Trớ sữa: các bảng này nhắc lại y nguyên tiêu đề và dòng phụ (vd tiêu đề "Hút 120 ml" rồi bảng lại ghi "Số lượng hút 120 ml"). Dòng phụ gộp đã mang đủ thông tin.
- Kết quả đo trên iPhone 390px: tổng chiều cao nội dung 1245px → **885px (−29%)**, số bản ghi thấy cùng lúc 4 → **5**; số khối có viền trong 1 thẻ bú bình 6 → 1.
- Không đổi dữ liệu lưu, luồng lưu, vuốt sang trái để Sửa/Xóa, bộ lọc kho sữa và toàn bộ tính năng khác so với V11.4.1.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.4.1 không đổi — xem `BASELINE_LOCK_V11.5.0.json`.

# MeYeuBe V11.4.1

## 🔍 Tinh gọn giao diện chi tiết Bé bú + ghi chú túi sữa (V11.4.1)
- Kéo dài modal chi tiết: lề trên trên máy hẹp 54px → 8px (tính cả safe-area), lề dưới 20px → 10px, lề ngang 8px → 6px; vùng cuộn danh sách trên iPhone 390px tăng 530px → 635px (+20%), số bản ghi thấy cùng lúc 2 → 4.
- Hạ cỡ chữ toàn khối modal chi tiết về đúng hệ chung: tiêu đề loại 24px → 19px (máy ≤430px 17.5px), avatar 52px → 40px → 36px; thẻ Ngày/Tổng số lần 15px → 13px, icon 34px → 28px; khối Tổng quan tiêu đề 17px → 14.5px, số liệu 16px → 14px, icon ô 38px → 30px.
- Thẻ bản ghi gọn lại: giờ 19px → 16px, tiêu đề 15px → 13.5px, nhãn phân loại 10.5px → 9.5px, bảng 3 số liệu 14px → 12.5px, hàng túi sữa 11.5px → 10.5px; padding thẻ 12px → 9px.
- Khoảng cách giữa các bản ghi 12px → 16px (padding thẻ 12px → 9px): khoảng cách giữa 2 bản ghi nay gấp đúng 2× khoảng cách bên trong 1 bản ghi (8px) nên các thẻ không còn cảm giác "dính" vào nhau; đường timeline nét đứt vẫn nối liền các chấm.
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

# Changelog

## V11.2.0 – 🧷 Nâng cấp giao diện Thay tã
- Loại tã: đổi 2 thẻ chọn (Tã ướt/Tã bẩn) sang kiểu lớn hơn, thẻ đang chọn tô nền hồng đậm (gradient thương hiệu) chữ trắng, kèm dấu ✓ tròn ở góc trên bên phải — thay cho kiểu viền mỏng nền nhạt trước đây.
- Số lượng: thay ô nhập số bằng bộ đếm lớn giữa 2 nút − / ﹢, cùng hàng 4 nút chọn nhanh "1 · 2 · 3 · ﹢" ngay bên dưới — bấm 1/2/3 để chọn thẳng số lượng phổ biến, bấm ﹢ để tăng dần khi cần nhiều tã hơn. Nút đang khớp với số lượng hiện tại luôn được tô sáng.
- Thời gian: riêng bản ghi Thay tã chỉ hiển thị 1 dòng Ngày + Giờ trên cùng một hàng (ẩn Ngày kết thúc/Đến giờ/Thời lượng vì không áp dụng cho một lần thay tã điểm-thời-gian); nhãn đổi thành "Ngày *"/"Giờ *". Các loại chăm sóc khác (Bé bú, Hút sữa, Ngủ, Uống thuốc, Thân nhiệt, Trớ sữa) giữ nguyên bố cục 2 hàng như cũ.
- Ghi chú: với Thay tã, ô Ghi chú thu gọn mặc định phía sau nút "✎ Thêm ghi chú (tùy chọn)" để form gọn hơn; bấm vào mới hiện ô nhập và tự focus. Nếu sửa một bản ghi Thay tã đã có sẵn ghi chú, ô ghi chú tự mở sẵn. Các loại chăm sóc khác không đổi (ghi chú luôn hiển thị như cũ).
- Fix: sửa một bản ghi "Tã bẩn" trước đó, ngay sau khi mở form sửa giao diện tự động chuyển nhầm về hiển thị "Tã ướt" (do một `setTimeout` dựng lại giao diện chạy trễ hơn và ghi đè lựa chọn vừa nạp từ dữ liệu đã lưu) — người dùng bấm Lưu lúc này sẽ vô tình đổi loại tã đã ghi. Nay mở sửa hiển thị đúng loại tã và số lượng đã lưu ngay từ đầu, không còn bị ghi đè.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.1.3 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.2.0.json`.

## V11.1.3 – Hoàn thiện Hành trình theo tháng (Hotfix)
- Fix: popup chi tiết tháng (Hành trình theo tháng) bị lỗi cuộn — cuộn trang lại kéo cả giao diện bên ngoài thay vì chỉ cuộn nội dung popup. Nay đã khoá cuộn nền khi popup chi tiết tháng (hoặc chi tiết Milestone) đang mở, chỉ nội dung bên trong popup cuộn được.
- Fix: các dòng Milestone trong popup chi tiết tháng hiển thị tiêu đề và ngày dính sát nhau, khó đọc. Đổi sang bố cục 2 dòng (tiêu đề trên, ngày dưới) rõ ràng, dễ nhìn hơn.
- Fix: bấm vào một dòng Milestone trong popup chi tiết tháng để mở popup chi tiết Milestone, rồi đóng popup chi tiết Milestone lại đóng luôn cả popup chi tiết tháng phía sau. Nay mỗi popup đóng độc lập — đóng popup chi tiết Milestone sẽ quay lại đúng popup chi tiết tháng đang xem, không tắt toàn bộ.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.1.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.1.3.json`.

## V11.1.0 – ❤️ Kỷ niệm & Thống kê
- Menu: gộp "🏆 Hành trình lớn khôn" vào nhóm mới "❤️ Kỷ niệm & Thống kê" trong menu điều hướng chính, kèm 3 mục mới: "📅 Hành trình theo tháng", "📈 Thống kê & So sánh", "🎉 Tổng kết năm". Nút "＋ Thêm cột mốc" vẫn nằm trong màn hình "Hành trình lớn khôn" như cũ.
- Hành trình theo tháng: danh sách thẻ theo từng tháng tuổi của bé (từ Ngày sinh), mỗi thẻ hiển thị số Milestone / số bản ghi chăm sóc / số ảnh trong tháng đó, mới nhất lên đầu. Bấm vào thẻ mở chi tiết: Thống kê tháng (tổng ml bú, tổng giờ ngủ, tổng ml hút), Nhật ký chăm sóc (số lượng theo loại), danh sách Milestone trong tháng, Album ảnh (lấy từ ảnh Milestone), và Ghi chú riêng có thể lưu cho từng tháng.
- Thống kê & So sánh: so sánh cữ bú, tổng giờ ngủ và lượng sữa hút của hôm nay với Hôm qua / Trung bình 7 ngày gần nhất / Trung bình 30 ngày gần nhất / Trung bình tháng trước, hiển thị mũi tiêu tăng (↑, xanh) / giảm (↓, đỏ) / không đổi.
- Tổng kết năm: chọn theo từng năm tuổi của bé (Năm đầu tiên, Năm thứ 2...), hiển thị tổng số cữ bú, số giấc ngủ, số lít sữa mẹ đã hút, số ảnh và số Milestone trong năm đó, kèm lời chúc kết thúc. Có nút "📤 Chia sẻ hình ảnh" (xuất ảnh PNG tóm tắt, dùng Web Share API hoặc tải xuống) và "🖨️ Xuất PDF" (dùng hộp thoại in của trình duyệt, chọn Lưu dưới dạng PDF). Nút "🎬 Xuất video tổng kết" hiển thị ở trạng thái sắp ra mắt, chưa hoạt động.
- Dữ liệu: thêm `db.monthlyNotes` để lưu ghi chú riêng theo từng tháng tuổi.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.0.1 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine) — xem `BASELINE_LOCK_V11.1.0.json`.
- Known limitation: "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm hiện chỉ lấy từ ảnh đã gắn vào Milestone, vì bản này chưa có tính năng đính ảnh trực tiếp vào Nhật ký chăm sóc hay Nhật ký.

## V11.0.1 – Milestone Photo Viewer, Lịch khám theo ngày, Giờ đạt mốc
- Hành trình lớn khôn: bấm vào ảnh trong Album (màn hình chi tiết hoặc form thêm/sửa) mở ảnh toàn màn hình, giữ đúng tỉ lệ gốc thay vì bị crop vuông như thumbnail; bấm ✕ hoặc chạm ra ngoài để đóng.
- Cấu hình Dashboard: thêm "Lịch khám sắp tới trong vòng (ngày)" (mặc định 7, 0–365 ngày) — Block "Lịch khám sắp tới" tự ẩn hoàn toàn nếu không có lịch khám nào trong khoảng ngày đã cấu hình.
- Hành trình lớn khôn: Milestone tự động tạo từ Bé bú/Ngủ/Hút sữa nay lưu kèm giờ đạt được; màn hình chi tiết hiển thị thêm giờ bên cạnh ngày (vd "Thứ Năm, 23/07/2026 · 14:30 · Bé bú"). Milestone không có giờ (theo tuổi, phát triển, vaccine, hoặc tạo trước bản này) vẫn hiển thị bình thường.
- Regression Lock: xác nhận 12 hàm lõi ở BASELINE_LOCK_V11.0.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine) — xem `BASELINE_LOCK_V11.0.1.json`.

## V11.0.0 – Hành trình lớn khôn (Milestone Timeline)
- Thêm menu mới "🏆 Hành trình lớn khôn" với Timeline hiển thị cột mốc theo ngày, mới nhất lên đầu.
- Milestone Engine tự động tạo cột mốc từ dữ liệu chăm sóc sẵn có, chạy trên mọi lần lưu dữ liệu (không chỉ lúc mở app): theo tuổi (tuần/tháng/năm), bé bú (mốc ml đầu tiên, kỷ lục, tổng số cữ), ngủ (giờ đầu tiên, ngủ xuyên đêm, tổng số giấc), hút sữa (ml đầu tiên, kỷ lục, tổng lít), phát triển (cân nặng/chiều dài), mũi tiêm đầu tiên và Vitamin D đủ 100 ngày.
- Chống tạo trùng Milestone bằng key duy nhất cho mỗi mốc; Milestone tự động là sự kiện lịch sử — không tự xóa dù dữ liệu gốc sau đó bị sửa hoặc xóa.
- Cho phép tự tạo Milestone thủ công (icon, tiêu đề, ngày, mô tả, ghi chú, tối đa 20 ảnh) — thêm/sửa/xóa tự do. Milestone tự động khoá tiêu đề/loại/ngày, chỉ cho thêm ảnh và ghi chú.
- Bộ lọc Timeline theo 8 loại: Tất cả / Theo tuổi / Bé bú / Ngủ / Hút sữa / Phát triển / Vaccine / Thủ công.
- Chia sẻ Milestone thành ảnh PNG (icon, tiêu đề, ngày, ảnh đầu tiên, tên bé) qua Web Share API hoặc tải xuống.
- Milestone mới tự động đẩy vào Trung tâm thông báo (🎉 Chúc mừng!).
- Bổ sung Block "Hành trình lớn khôn" vào Cấu hình Dashboard: bật/tắt, đổi tên hiển thị, đổi vị trí bằng nút ↑/↓ — cập nhật ngay không cần khởi động lại app, dùng chung cơ chế với các Block khác.
- Dashboard hiển thị banner "🎉 Bé vừa đạt một cột mốc mới" khi Milestone mới nhất trong vòng 3 ngày gần đây.
- Regression Lock: Cloud Sync/Realtime, Push Notification, Smart Alert, Export/Import và toàn bộ tính năng Milk Bag Picker của bản trước không đổi (hash khớp — xem `BASELINE_LOCK_V11.0.0.json`).

## V10.9.3 – Milk Bag Picker UX Hotfix & Refinements
- Fix: sửa bản ghi "Bú từ kho sữa đã hút" cũ không còn hiển thị lại danh sách túi sữa đã chọn (do cờ giữ trạng thái bị xoá sớm khi form dựng lại 2 lần). Nay mở sửa sẽ nạp lại đúng túi + số ml đã lấy từ mỗi túi.
- Form ghi nhận chăm sóc: "Ngày bắt đầu/Từ giờ" và "Ngày kết thúc/Đến giờ" hiển thị 2 cột cùng hàng (class careDateTimeRow trước đó thiếu CSS nên vẫn xuống dòng); "Từ giờ" mặc định lấy giờ hiện tại khi tạo mới.
- Icon màu túi sữa theo HSD còn lại: 🟢 ≥24h · 🟡 12–23h59 · 🟠 6–11h59 · 🔴 1–5h59 · ‼️ dưới 1h · ⚫️ đã hết hạn.
- Cấu hình Dashboard "Cữ bú tiếp theo cách (giờ)": đổi input sang dạng text + inputmode decimal để nhập được số thập phân (vd 2.5) trên mọi bàn phím; logic tính giờ (đã hỗ trợ thập phân từ V10.3.4) không đổi.

## V10.9.2 – Milk Bag Picker UX
- Ghi nhận bú từ kho sữa: đổi luồng nhập sang "nhập mục tiêu ml trước → chọn túi sữa để đủ lượng", đúng theo thiết kế UX mới.
- Thêm thanh tiến độ "Đã lấy từ kho / mục tiêu" với trạng thái Còn thiếu / Đủ lượng theo thời gian thực.
- "+ Thêm túi sữa" mở màn hình chọn túi riêng: tìm kiếm, sắp xếp, thẻ túi có nhãn hạn dùng (HSD hôm nay/ngày mai/N ngày nữa/quá hạn), nhập ml bằng nút tăng giảm và xem trước "Còn lại sau khi dùng".
- Danh sách túi đã chọn hiển thị dạng thẻ, xoá nhanh từng túi, vẫn giữ tuỳ chọn "Hủy phần còn lại trong túi" cho từng túi khi cần.
- Giữ nguyên toàn bộ tính năng "Số ml bỏ" / "Số ml bé bú thực tế" đã thêm ở bản trước.

## V10.9.1 – Pull Refresh, Notification & Feed Waste
- Kéo giao diện xuống hết mức để hiện icon xoay tròn; thả ra sẽ xoá cache Service Worker + đồng bộ lại dữ liệu + vẽ lại toàn bộ giao diện, không reload lại trang.
- Popup Thông báo: tách nhóm Mới/Đã xem rõ ràng, có chấm đỏ + nhãn "Mới" cho thông báo chưa xem.
- Popup Thông báo: bỏ nút hành động trên từng dòng; bấm cả dòng để mở đúng popup chi tiết loại chăm sóc + ngày liên quan, đồng thời đánh dấu đã xem.
- Thêm nút "Đánh dấu đã đọc" cho toàn bộ thông báo.
- Ghi nhận bú từ kho sữa: thêm "Số ml bỏ (bé không bú hết)", tự tính "Số ml bé bú thực tế" để thống kê lượng bú chính xác hơn; lượng trừ trong kho sữa vẫn giữ nguyên theo số ml lấy ra thực tế.

## V10.9.0 – Care Form Layout & Record Swipe Actions
- Ngày bắt đầu đi cùng hàng với Từ giờ; Ngày kết thúc đi cùng hàng với Đến giờ trong popup Ghi nhận chăm sóc.
- Bỏ trường Loại khỏi thân form, hiển thị loại đang chọn ngay trên tiêu đề form/popup.
- Nút Bắt đầu Bú / Bắt đầu Ngủ (và Dừng/Hủy Timer) luôn nằm cùng một hàng trên mobile.
- Màn hình chi tiết từng loại chăm sóc hỗ trợ vuốt sang trái để Sửa hoặc Xóa bản ghi, tương tự thao tác vuốt hủy túi sữa.
- Sau khi lưu sửa từ thao tác vuốt, tự quay lại đúng danh sách chi tiết đang xem.

## V10.8.4 – Care Detail & Mobile Form UX
- Rút gọn header popup chi tiết bằng bố cục 2 cột Loại/Ngày.
- Bổ sung nút Thêm ghi nhận đúng loại trong popup chi tiết.
- Sau khi lưu, tự quay lại danh sách chi tiết và hiển thị bản ghi mới.
- Mở rộng popup thêm mới, khóa scroll ngang và tối ưu không gian mobile.

## V10.8.3
- Alert/Notification kho sữa mở đúng danh sách và highlight túi liên quan.
- Trang Ghi nhận chỉ còn các block; form mở trong popup theo loại.
- Bộ lọc kho sữa hỗ trợ ẩn/hiện và ghi nhớ trạng thái.

## V10.8.2 — UX Enhancement & Notification Center
- Rút gọn toast kết nối và cập nhật dữ liệu.
- Sửa safe-area Trung tâm cảnh báo.
- Popup thêm/sửa chăm sóc.
- Trung tâm thông báo và badge chưa đọc.
- Lọc kho sữa theo bảo quản/trạng thái.
- Hút sữa không mặc định vị trí bảo quản.

## V10.8.1 — Push Delivery Hotfix
- Gửi thử thiết bị hiện tại bằng `target_endpoint`.
- Bổ sung nút Gửi thử tất cả thiết bị cùng Sync ID.
- Không báo thành công khi không có thiết bị nhận.
- Trả và hiển thị matched, sent, failed, expired.
- Bổ sung log chẩn đoán trong Edge Function.

## V10.8.1 – Device Push Notification
- Bổ sung đăng ký Web Push trên từng thiết bị.
- Bổ sung nút bật/tắt, lưu cấu hình, gửi thử và trạng thái quyền thông báo.
- Lưu `push_subscriptions` theo Sync ID, Device ID và endpoint.
- Cho phép chọn từng loại Smart Alert được phép push.
- Bổ sung Supabase Edge Function `send-push`.
- Bổ sung chống gửi lặp bằng `push_delivery_log`.
- Tự xóa subscription hết hạn khi push service trả về HTTP 404/410.
- Notification click mở app và Trung tâm cảnh báo.
- Giữ nguyên Smart Alert, Realtime JSON Sync và Cloud Sync thủ công.

## V10.8.1 — Smart Alert Navigation & Dashboard Block Hotfix
- Sửa action Ghi nhận trong Trung tâm cảnh báo để mở đúng màn hình và đúng loại chăm sóc.
- Loại bỏ lỗi dấu ngoặc kép lồng nhau trong `onclick`.
- Đổi tên block cấu hình từ “Bố mẹ cần chú ý” thành “Trung tâm cảnh báo”.
- Giữ module id `alerts` để tương thích cấu hình cũ.
- Mặc định mở phần Thông tin lúc sinh trên Dashboard.

## V10.8.1 – Smart Alert Hotfix
- Nút hành động trong Trung tâm cảnh báo mở đúng màn hình ghi nhận tương ứng.
- Rule thân nhiệt đọc đúng trường `amount`, đồng thời tương thích dữ liệu legacy `temperature`, `value`, `extra.temperature`.
- Đổi icon trạng thái thành 💚 Hôm nay mọi thứ đều ổn, ⚠️ Có việc cần chú ý, 🆘 Có việc cần xử lý ngay.
- Regression toàn bộ rule: thân nhiệt, bú quá giờ, ngủ quá lâu, túi sữa quá hạn/sắp hết hạn và lịch khám.
- Giữ nguyên Realtime JSON Sync, Cloud Sync thủ công và localStorage key.

## V10.7.0 — Smart Alert
- Bổ sung Rule Engine dựa trên cấu hình người dùng.
- Bổ sung mức Critical / Warning / Info.
- Thêm thẻ Smart Alert gọn trên Dashboard và popup Trung tâm cảnh báo.
- Bổ sung cấu hình bật/tắt, mức độ và ngưỡng cho từng rule.
- Cảnh báo tự cập nhật sau Realtime.
- Không thêm cảnh báo y khoa mang tính chẩn đoán.

## V10.6.0 – Realtime JSON Sync
- Bổ sung Supabase Realtime Postgres Changes cho bảng `public.meyeube_sync`.
- Thiết bị đang mở app tự nhận thay đổi từ thiết bị khác dùng cùng Sync ID.
- Auto push sau khi lưu và auto pull khi nhận sự kiện Realtime.
- Chống phản hồi vòng lặp bằng `deviceId`, `_cloudRevision` và cờ áp dụng remote.
- Tự reconnect khi online hoặc khi app trở lại foreground.
- Bổ sung trạng thái REALTIME / CONNECTING / OFFLINE trên màn hình Cloud Sync.
- Bổ sung merge mảng dữ liệu khi Cloud mới hơn trước auto push.
- Cập nhật SQL để thêm bảng vào publication `supabase_realtime`.
- Giữ tương thích dữ liệu cũ và đồng bộ thủ công.

## V10.5.1 – Dashboard & Avatar UX Hotfix
- Ẩn hoàn toàn block lịch khám khi không có lịch sắp tới.
- Thay tuổi trong block Thông tin bé bằng tên chính thức từ Thiết lập.
- Chặn zoom mobile bằng viewport, touch-action và gesture guard.
- Bổ sung upload, nén, xem trước và xóa avatar bé.

## V10.5.0 – Dashboard Configuration & UX
- Refactor source JavaScript về một file chính.
- Thêm cấu hình chỉ số Dashboard và sắp xếp thứ tự.
- Mở đúng bản ghi từ nhật ký Dashboard.
- Loại bỏ cảnh báo lượng bú hardcode.
- Sửa fallback cân nặng sau sinh.
- Tinh chỉnh header, lịch khám, thông tin sinh và block phát triển.

## V10.4.8 – Menu Version Footer Fix
- Bỏ đoạn mô tả Thiết lập để giải phóng không gian cuối menu.
- Tăng khoảng cách an toàn phía dưới menu để phiên bản không bị taskbar che.
- Làm nổi bật dòng phiên bản hiện tại.

## V10.4.7 — UI Polish & Version Info
- Thiết kế lại màn hình khởi động với nền gradient, glass card, logo nổi và thanh tiến trình.
- Làm mới giao diện chờ xử lý để gọn, hiện đại và dễ nhận biết hơn.
- Đổi toàn bộ nội dung `Đang mở màn hình...` thành `Đang xử lý...`.
- Bổ sung thông tin phiên bản ở cuối menu bên trái.
- Cập nhật manifest, title và Service Worker cache lên V10.4.7.
- Giữ nguyên toàn bộ dữ liệu và chức năng V10.4.6.

## V10.4.6 — Cloud Sync Schema & Safety Hotfix
- Sửa lỗi `PGRST204: Could not find the payload column` bằng cách đồng bộ app với schema `id` / `data` của bảng `meyeube_sync`.
- Tự động fallback sang schema cũ `sync_id` / `payload` khi cần.
- Bổ sung cảnh báo xác nhận trước thao tác Đẩy lên Cloud.
- Bổ sung cảnh báo xác nhận trước thao tác Tải Cloud về.
- Ghi nhận thao tác hủy vào Nhật ký đồng bộ.
- Giữ nguyên dữ liệu, localStorage key và các chức năng Smart Care hiện có.

## V10.4.5 — Dashboard Care Goals & Medicine Detail
- Bổ sung mục tiêu chăm sóc **Uống thuốc** theo số lần trong ngày.
- Bổ sung mục tiêu chăm sóc **Thân nhiệt** theo số lần đo trong ngày.
- Hai chỉ tiêu mới xuất hiện trong Cấu hình Dashboard → Chỉ tiêu chăm sóc trong ngày và dùng chung cơ chế bật/tắt, mục tiêu, tiến độ.
- Popup chi tiết Uống thuốc hiển thị Tên thuốc / vitamin, Liều lượng và Đơn vị đã nhập.
- Không thay đổi localStorage key, Cloud Sync hoặc dữ liệu hiện có.

## V10.4.4 — Next Feed Configuration Fix
- Bổ sung đọc giá trị `cfgNextFeedHours` khi mở Cấu hình Dashboard.
- Bổ sung lưu `dashboardConfig.nextFeedHours` khi bấm Lưu cấu hình.
- Dashboard cập nhật ngay sau khi lưu và dùng đúng giá trị người dùng nhập.
- Hỗ trợ dấu chấm hoặc dấu phẩy cho số giờ thập phân.
- Giữ 2,5 giờ chỉ làm mặc định khi chưa có cấu hình hợp lệ.
- Không thay đổi localStorage key, Cloud Sync hoặc các chức năng khác.

## V10.4.3 — Next Feed & Sleep Status Hotfix
- Sửa Dashboard đọc đúng `dashboardConfig.nextFeedHours` khi tính Cữ bú tiếp theo.
- Thay giá trị cộng cố định 150 phút bằng số giờ người dùng cấu hình.
- Đổi màu trạng thái: Bé đang ngủ dùng tông xanh dương; Bé đang thức dùng tông vàng.
- Giữ nguyên khả năng bấm trạng thái Bé đang ngủ và loại bỏ underline.
- Không thay đổi dữ liệu, Cloud Sync hoặc các chức năng hiện có.

## V10.4.2 — Dashboard Care Popup Hotfix
- Bấm từng loại chăm sóc trên Dashboard mở trực tiếp popup chi tiết của loại tương ứng trong ngày hôm nay.
- Chỉ nút “Thống kê” ở tiêu đề block mới chuyển đến trang tổng quan Thống kê.
- Trạng thái “Bé đang ngủ” vẫn có thể bấm để sửa dữ liệu Ngủ mới nhất nhưng không còn underline.
- Không thay đổi dữ liệu, Cloud Sync hoặc các chức năng hiện có.

## V10.4.1 — Sleep Status Quick Edit Hotfix
- Trạng thái “Bé đang ngủ” trên Dashboard có thể bấm để mở form chỉnh sửa giấc ngủ đang diễn ra mới nhất.
- Thay dòng trạng thái tổng quát bằng trạng thái “Bé đang ngủ/Bé đang thức”, giữ cùng hàng với ngày giờ.
- Bỏ dòng trạng thái ngủ trùng phía dưới; giữ nguyên dòng Cữ bú tiếp theo.
- Tăng Nhật ký chăm sóc trên Dashboard từ 4 lên 5 dòng.
- Không thay đổi cấu trúc dữ liệu, Cloud Sync hoặc các chức năng Smart Care.

## V10.4.0 — Smart Care
- Thêm Timer Bú và Ngủ; dừng Timer tự điền thời gian vào form.
- Thêm Uống thuốc: tên, liều lượng, đơn vị.
- Thêm Thân nhiệt: nhiệt độ, vị trí đo.
- Thêm Trớ sữa: mức độ, thời gian sau bú, loại Trớ/Nôn.
- Tích hợp các loại mới vào Dashboard, Timeline, popup chi tiết và Thống kê.
- Không đổi cấu trúc dữ liệu gốc; dữ liệu mới lưu trong careEvents để Cloud Sync/Export DB tiếp tục hoạt động.

# Changelog

## V10.3.5 – Sleep Status Quick Edit & Five Care Journal Rows
- Khi trạng thái tại block Thông tin bé là **Bé đang ngủ**, cho phép bấm trực tiếp để mở giao diện sửa bản ghi Ngủ đang diễn ra mới nhất.
- Hỗ trợ cập nhật **Đến giờ** để xác định thời điểm bé thức dậy.
- Thay dòng trạng thái tổng quát “Đã có ghi nhận hôm nay” bằng trạng thái **Bé đang ngủ/Bé đang thức** ngay trên cùng hàng với đồng hồ và ngày hiện tại.
- Loại bỏ dòng trạng thái ngủ bị lặp ở phần thông tin bổ sung; giữ riêng dòng **Cữ bú tiếp theo** khi có dữ liệu.
- Nhật ký chăm sóc trên Dashboard tăng từ 4 lên 5 dòng gần nhất.

## V10.3.4 – Dashboard Care Detail Popup & Configurable Next Feed
- Khi bấm trực tiếp từng loại chăm sóc trên Dashboard, mở ngay popup chi tiết của đúng loại và ngày hiện tại; không chuyển qua trang Thống kê trước.
- Nút **Thống kê ›** ở tiêu đề block Chăm sóc hôm nay vẫn mở trang tổng quan Thống kê.
- Bổ sung cấu hình **Cữ bú tiếp theo cách (giờ)** trong Cấu hình Dashboard → Hiển thị chung.
- Cữ bú tiếp theo được tính từ thời gian bắt đầu của lần Bé bú mới nhất cộng số giờ đã cấu hình.
- Mặc định 2,5 giờ để tương thích dữ liệu cũ; hỗ trợ bước nhập 0,5 giờ.

## V10.3.3 – Milk Swipe UI Hotfix
- Sửa giao diện nút **Huỷ túi** bị hiển thị sẵn trong danh sách Kho sữa.
- Nút huỷ mặc định ẩn hoàn toàn, chỉ xuất hiện sau khi vuốt trái đủ ngưỡng.
- Chỉ cho phép mở một dòng túi sữa tại một thời điểm.
- Tăng phân biệt thao tác vuốt ngang và cuộn dọc để tránh kích hoạt nhầm trên iPhone.
- Giữ nguyên nghiệp vụ chuyển túi sang trạng thái **Đã bỏ**.

## V10.3.2-milk-inventory-cancel-swipe-hotfix
- Bổ sung swipe sang trái trực tiếp tại Thống kê → Kho sữa → Danh sách kho sữa.
- Chỉ túi ở trạng thái `Đang bảo quản` mới hiển thị hành động `Huỷ túi`.
- Khi huỷ, túi chuyển sang trạng thái `Đã bỏ`, số ml còn lại về 0 và lưu lý do/thời điểm huỷ.
- Danh sách kho sữa trong modal được làm mới ngay sau khi huỷ.

## V10.3.1-care-dashboard-swipe-status-hotfix
- Fix Dashboard: click vào Chăm sóc hôm nay / từng loại chăm sóc mở màn hình Thống kê chăm sóc.
- Fix Kho sữa: bổ sung style swipe-left để hiện nút Huỷ túi, giữ thao tác nhập lý do và chuyển trạng thái Đã bỏ.
- Dashboard Thông tin bé: thêm icon 😴 cho Bé đang ngủ và ☺️ cho Bé đang thức.
- Dãn dòng khu vực Trạng thái và Cữ bú tiếp theo để dễ đọc hơn trên mobile.


## V10.3-care-milk-sleep-dashboard-hotfix
- Rút gọn mã túi sữa theo định dạng YYMMDD và thêm hậu tố khi trùng ngày.
- Danh sách chọn túi sữa khi bé bú hiển thị giờ tạo và ghi chú.
- Chi tiết thống kê chăm sóc sắp xếp mới nhất đến cũ nhất.
- Kho sữa hỗ trợ vuốt trái để huỷ túi, nhập lý do và chuyển trạng thái Đã bỏ.
- Loại Ngủ cho phép bỏ trống Đến giờ để biểu thị Bé đang ngủ.
- Dashboard Thông tin bé hiển thị trạng thái ngủ và cữ bú tiếp theo.

# Changelog

## V10.1 - Cloud Sync Official
- Thêm module Cloud Sync trong menu Thêm.
- Cấu hình Supabase URL, Publishable key, Sync ID.
- Test kết nối, đẩy dữ liệu lên Cloud, tải Cloud về, đồng bộ 2 chiều.
- Đồng bộ auto push khi lưu và auto pull khi mở app nếu Cloud mới hơn.
- Cập nhật bảng Supabase `meyeube_sync` trong SUPABASE_SETUP.sql.
- Giữ nguyên `meYeuBePWA_v4`.

# Changelog

## V10.0 – Supabase Cloud Sync Foundation

### Added
- Module **Cloud Sync** trong menu Thêm.
- Cấu hình Supabase Project URL, Publishable key và Sync ID.
- Test kết nối Supabase.
- Đẩy toàn bộ dữ liệu local lên Supabase.
- Kéo dữ liệu Cloud về localStorage.
- Đồng bộ thông minh dựa trên thời gian cập nhật.
- Auto push khi lưu dữ liệu nếu đã bật Cloud Sync.
- Auto pull khi mở app nếu Cloud mới hơn.
- File `SUPABASE_SETUP.sql` để tạo bảng cloud sync.

### Compatibility
- Giữ nguyên DB local: `meYeuBePWA_v4`.
- Bản V10.0 lưu nguyên JSON hiện tại vào Supabase để an toàn trước khi tách bảng nghiệp vụ ở V10.1.
