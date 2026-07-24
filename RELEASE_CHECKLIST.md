# HVUS v1.3 — Release Checklist V11.5.0

## Acceptance Criteria (V11.5.0 · dọn nhiễu — phương án A)
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
- [x] 26 hàm đã khoá ở BASELINE_LOCK_V11.4.1.json (Cloud Sync/Realtime/Push/Smart Alert/Export-Import + Milestone Engine + Hành trình theo tháng/Thống kê/Tổng kết năm/Photo Viewer) — hash khớp 26/26, không bị ảnh hưởng bởi thay đổi giao diện.
- [x] Toàn bộ tính năng bản V11.4.0 không bị ảnh hưởng.
- [x] Không bổ sung hàm mới vào Baseline Lock ở bản này — các hàm chỉnh sửa (`careNoteChipHtml`, `careRecordBagRowsHtml`, `careRecordCardHtml`, `applyCareInventory`) và các hàm mới (`milkBagSnapshotFor`, `milkBagNoteText`, `careFeedBagNotes`, `careNoteChipOne`) thuộc lớp hiển thị chi tiết, không thuộc nhóm hạ tầng lõi cần khoá (BASELINE_LOCK_V11.5.0.json giữ nguyên 26 hàm).

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Version consistency PASS (11.5.0 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V11.4.1.json trong release_check.py).
- [x] release_check.py PASSED.
- [x] Kiểm thử bằng trình duyệt tự động (Playwright): 9 tổ hợp 390/430/360/768px × Bé bú, Kho sữa, Ngủ, Thay tã, Hút sữa × light/dark — không tràn ngang, không cắt chữ, footer không đè danh sách; xác nhận thẻ "Ghi chú bình" hiện đúng "Bình tím mập"/"Bình tím cao" và chip ghi chú theo từng túi ở cữ bú nhiều túi.

## Known limitation (đã ghi trong AC_V11.5.0.md / changelog.md)
- Ghi chú túi sữa lấy từ ô "Ghi chú" của lần hút sữa, chưa có trường riêng kiểu "Tên bình" hay danh sách bình cố định để chọn nhanh.
- "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm hiện chỉ lấy từ ảnh đã gắn vào Milestone.
- "Xuất video tổng kết" mới ở dạng nút placeholder (disabled), chưa có chức năng thật.
- "Thống kê & So sánh" hiện chưa có biểu đồ/xu hướng theo thời gian.
