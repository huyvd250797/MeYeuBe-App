# HVUS v1.3 — Release Checklist V11.7.0

## Acceptance Criteria (V11.7.0 · Kho sữa bỏ icon, màu theo hạn dùng — phương án B)
- [x] Bỏ 6 emoji app tự thêm trong thẻ túi (🗓 🍼 🕐 💧 ❄️ 🕐). Màn 7 túi: 45 emoji → 3, và 3 cái còn lại là emoji người dùng gõ trong tên bình.
- [x] Chấm màu đổi nghĩa từ "tên bình" sang "mức hạn dùng", 6 mức đúng thang quy ước (🟢≥24h · 🟡12–23h59 · 🟠6–11h59 · 🔴1–5h59 · ‼️<1h · ⚫ quá hạn/đã đóng), cùng ngưỡng với `milkUrgencyIcon`.
- [x] Bỏ vạch màu trái và bỏ tô màu tên bình — trong thẻ chỉ còn một tín hiệu màu duy nhất.
- [x] Huy hiệu góc phải đổi thành thời gian còn lại tô màu; "Đang bảo quản" không in ra; túi đã dùng hết / đã bỏ hiện trạng thái màu xám.
- [x] `milkTimeLeftShort` rút gọn cho huy hiệu (phút / giờ / ngày / tháng) — sữa trữ đông không còn hiện "Còn 179 ngày 10 giờ".
- [x] Hàng ô rút 4 → 3 (Ghi chú bình · Dung tích · Vị trí); bỏ ô "HSD còn lại" vì đã có ở huy hiệu.
- [x] Hàng meta chỉ hiện "Hút" khi khác giờ tạo túi.
- [x] Đo iPhone 390px: thẻ 113px → 102px (hết trường hợp nở lên 127px do wrap), danh sách 7 túi 897px → 794px (−11%).
- [x] Cỡ chữ lớn nhất trong thẻ 13px, huy hiệu 10.5px, nhỏ nhất 9px; không tràn ngang ở 360/390/430px.
- [x] Version đồng bộ 11.7.0 tại 7 vị trí.

## Acceptance Criteria (kế thừa V11.6.0 · Kho sữa gọn, modal kín màn hình)
- [x] Modal chi tiết chạm sát mép dưới: bỏ padding-bottom lớp phủ ≤640px, safe-area chuyển vào chân modal, chiều cao `100dvh`. Khoảng trống dưới modal 38px → 0px; vùng cuộn 497px → 598px (+20%).
- [x] Bỏ nút "Sửa túi" trong thẻ; vuốt sang trái mở 2 nút ✏️ Sửa + 🗑 Huỷ túi (148px). Túi đã dùng hết/đã bỏ chỉ có nút Sửa (84px) và vẫn vuốt được.
- [x] Thẻ túi sữa thiết kế lại theo bản mẫu: vạch màu bình + chấm màu · mã · dung tích · huy hiệu trạng thái; dòng meta 🗓/🍼/🕐; hàng 4 ô Ghi chú bình | Dung tích | Vị trí | HSD còn lại.
- [x] Màu nhận diện bình băm từ tên bình (8 màu cố định) — hợp mọi cách đặt tên, thay cách dò tên màu ở V11.4.1.
- [x] Bấm vào túi mở popup chi tiết túi sữa (11 dòng thông tin + nút Sửa túi / Huỷ túi).
- [x] Tổng quan kho sữa đổi 4 ô: Tổng dung tích · Tổng số túi · Dự kiến dùng hết · Sắp hết hạn.
- [x] Bộ lọc rút xuống 1 hàng chip (Trạng thái · Vị trí); thanh cố định 251px → 162px (−35%).
- [x] Tiêu đề modal đọc đúng đơn vị: "3 túi" ở Kho sữa, "5 lần" ở loại khác (thay "N record").
- [x] Đo iPhone 390px: thẻ túi 149px → 127px (−15%), danh sách 5 túi 890px → 661px (−26%), thấy 1 → 3 túi.
- [x] Cỡ chữ trong thẻ: lớn nhất 13px, nhỏ nhất 9px; không tràn ngang ở 360/390/430px.
- [x] Version đồng bộ 11.6.0 tại 7 vị trí.

## Acceptance Criteria (kế thừa V11.5.0 · dọn nhiễu — phương án A)
- [x] Bỏ toàn bộ emoji ở nhãn số liệu và hàng túi sữa; mỗi bản ghi chỉ còn 1 icon loại (một màn Bé bú: ~42 emoji → 5).
- [x] Bỏ nhãn phân loại trùng tiêu đề ở Bé bú; các loại khác chuyển nhãn vào dòng phụ gộp.
- [x] Gộp 1 dòng phụ duy nhất `nhãn · giá trị · tên bình`; bỏ hộp "Ghi chú bình" có viền.
- [x] Khối số liệu bỏ viền và vạch chia ô; bảng số liệu Bé bú chỉ hiện khi bé bú không hết.
- [x] Bỏ bảng số liệu của Hút sữa / Ngủ / Thay tã / Uống thuốc / Thân nhiệt / Trớ sữa vì lặp 100% tiêu đề + dòng phụ.
- [x] Hàng túi sữa rút gọn `Túi <mã> · <trạng thái> · còn <N> ml`, chấm trạng thái 6px.
- [x] Bỏ chấm màu tự nhận theo tên màu; thay bằng tên bình in màu tím (hợp mọi cách đặt tên).
- [x] Đo iPhone 390px: nội dung 1245px → 885px (−29%), thấy 4 → 5 bản ghi; khối có viền trong 1 thẻ 6 → 1.
- [x] Cỡ chữ nhỏ nhất 9.5px; không đổi dữ liệu lưu và các tính năng khác.
- [x] Version đồng bộ 11.5.0 tại 7 vị trí.

## Acceptance Criteria (kế thừa V11.4.1)
- [x] Modal chi tiết chăm sóc kéo dài hết chiều cao khả dụng; vùng cuộn danh sách trên iPhone 390px tăng 530px → 635px (+20%), thấy 4 bản ghi thay vì 2.
- [x] Cỡ chữ toàn khối modal chi tiết hạ về hệ chung: tiêu đề loại 24px → 19px, giờ bản ghi 19px → 16px, tiêu đề bản ghi 15px → 13.5px, bảng số liệu 14px → 12.5px, hàng túi sữa 11.5px → 10.5px; không còn chữ nhỏ hơn 9px.
- [x] Chân modal thu gọn: nút "＋ Thêm ghi nhận" 54px → 44px, chữ 16px → 14.5px, dòng gợi ý ép gọn 1 dòng; footer 98px → 74px (−25%) mà vùng chạm vẫn ≥ 40px.
- [x] Thẻ "🍼 Ghi chú bình:" lấy ghi chú của túi sữa trong Kho sữa (vd "Bình tím mập", "Bình tím cao") thay vì chỉ lấy ghi chú của bản ghi; chấm màu tự nhận theo màu trong ghi chú.
- [x] Ghi chú riêng của bản ghi hiện thành thẻ "📝 Ghi chú:" và không trùng lặp khi giống ghi chú túi.
- [x] Cữ bú lấy từ nhiều túi: mỗi hàng túi sữa có chip ghi chú riêng; thẻ trên cùng gộp các ghi chú.
- [x] Ghi chú túi lưu thêm vào `extra.milkBagSnapshots[].note` → xoá túi khỏi kho vẫn xem lại đúng tên bình.
- [x] Các loại chăm sóc khác (Hút sữa, Kho sữa, Ngủ, Thay tã, Đi tè/Đi phân, Uống thuốc, Thân nhiệt, Trớ sữa) dùng chung hệ cỡ chữ mới, không vỡ bố cục.
- [x] Không đổi chức năng, luồng lưu và cấu trúc dữ liệu cũ so với V11.4.0.
- [x] Version đồng bộ 11.4.1 tại title, splash screen, appVersionInfo, script cache-bust, sw.js CACHE_NAME, manifest.webmanifest, APP_VERSION.

## Stable Baseline Lock
- [x] 26 hàm đã khoá ở BASELINE_LOCK_V11.6.0.json (Cloud Sync/Realtime/Push/Smart Alert/Export-Import + Milestone Engine + Hành trình theo tháng/Thống kê/Tổng kết năm/Photo Viewer) — hash khớp 26/26, không bị ảnh hưởng bởi thay đổi giao diện.
- [x] Toàn bộ tính năng bản V11.6.0 không bị ảnh hưởng.
- [x] Không bổ sung hàm mới vào Baseline Lock ở bản này — các hàm chỉnh sửa (`milkBagHtml`, `milkBagCellsHtml`, `openMilkBagDetail`) và các hàm mới (`milkUrgencyLevel`, `milkBagBadge`, `milkTimeLeftShort`, `milkBagMetaHtml`); các hàm bỏ đi (`milkNoteAccent`, `milkStatusMeta`) thuộc lớp hiển thị chi tiết, không thuộc nhóm hạ tầng lõi cần khoá (BASELINE_LOCK_V11.7.0.json giữ nguyên 26 hàm).

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Version consistency PASS (11.7.0 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V11.6.0.json trong release_check.py).
- [x] release_check.py PASSED.
- [x] Kiểm thử bằng trình duyệt tự động (Playwright): 390/360/430px × dark/light — không tràn ngang, không lỗi JavaScript; xác minh đủ 6 mức màu hạn dùng trả đúng class và mã màu ở cả hai theme, đếm emoji trong thẻ = 0 (do app thêm), popup chi tiết đúng nút theo trạng thái túi, vuốt Sửa/Huỷ và modal chạm đáy (gap = 0px) của V11.6.0 vẫn nguyên vẹn.

## Known limitation (đã ghi trong AC_V11.7.0.md / changelog.md)
- Ghi chú túi sữa lấy từ ô "Ghi chú" của lần hút sữa, chưa có trường riêng kiểu "Tên bình" hay danh sách bình cố định để chọn nhanh.
- Việc phân biệt bình giờ hoàn toàn dựa vào chữ trong tên bình (kể cả emoji người dùng tự gõ) — app không tô màu riêng cho từng bình nữa, vì màu đã dành cho hạn dùng.
- Mức hạn dùng tính lúc dựng danh sách, không tự chạy lại theo thời gian thực; đóng mở lại modal sẽ cập nhật.
- "Dự kiến dùng hết" tính theo trung bình 7 ngày gần nhất, nên vài ngày đầu dùng app hoặc khi bé chỉ bú trực tiếp sẽ hiện "--".
- Huỷ túi vẫn dùng hộp thoại `prompt()` của trình duyệt để nhập lý do, chưa có form riêng trong app.
- "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm hiện chỉ lấy từ ảnh đã gắn vào Milestone.
- "Xuất video tổng kết" mới ở dạng nút placeholder (disabled), chưa có chức năng thật.
- "Thống kê & So sánh" hiện chưa có biểu đồ/xu hướng theo thời gian.
