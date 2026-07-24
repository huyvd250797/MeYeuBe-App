# Acceptance Criteria — MeYeuBe V11.5.0

Chủ đề: **Dọn nhiễu danh sách ghi nhận (phương án A)**

Bối cảnh: sau V11.4.1 vẫn thấy rối mắt. Nguyên nhân không nằm ở khoảng cách mà ở mật độ khối
bên trong mỗi thẻ: 7 emoji, 6 đường viền và 3 thông tin lặp trên mỗi bản ghi bú bình.

## 1. Bỏ emoji trang trí

- [x] Nhãn số liệu không còn emoji: 📦 Lấy từ kho → Lấy từ kho; 👶 Bé bú thực tế → Bé bú thực tế; 🍼 Còn lại sau bú → gộp vào hàng túi sữa.
- [x] Hàng túi sữa không còn 🧊 và huy hiệu tròn ✓/○ — thay bằng chấm tròn 6px cùng màu trạng thái.
- [x] Dòng phụ Thay tã bỏ 💧 💩 → "Đi tè 2 · Đi phân 2".
- [x] Mỗi bản ghi giữ đúng **1 emoji** là icon loại chăm sóc. Một màn Bé bú: ~42 emoji → **5**.

## 2. Bỏ thông tin lặp

- [x] Bé bú: bỏ nhãn "Từ sữa đã hút" / "Trực tiếp" / "Sữa công thức" vì trùng ý tiêu đề.
- [x] Dòng phụ đổi "Bé bú: 80 ml" → "80 ml" (bỏ chữ "Bé bú" vì tiêu đề đã nói rõ đang bú gì).
- [x] Bỏ ô "Còn lại sau bú" trong bảng, gộp vào hàng túi sữa thành "còn 120 ml".
- [x] Bảng số liệu Bé bú chỉ hiện khi **bé bú không hết** (`wasteMl > 0` hoặc lấy ra ≠ bú thực tế); khi đó hiện "Lấy từ kho · Bé bú thực tế · Bỏ đi", số "Bỏ đi" tô vàng.
- [x] Cảnh báo "bỏ N ml" không lặp ở cả bảng lẫn hàng túi sữa — chỉ còn ở bảng.
- [x] Bỏ bảng số liệu của Hút sữa / Ngủ / Thay tã / Uống thuốc / Thân nhiệt / Trớ sữa vì lặp 100% với tiêu đề + dòng phụ.
- [x] Uống thuốc: bỏ dòng phụ "Liều 5 ml" vì nhãn đã hiện "5 ml".
- [x] Các loại không phải Bé bú vẫn giữ nhãn phân loại (mang thông tin thật: Bên hút, Đã dậy, Số tã, Mức độ…) nhưng chuyển vào dòng phụ gộp.

## 3. Bỏ hộp lồng hộp

- [x] Thẻ "Ghi chú bình" có viền tím bị bỏ; tên bình chuyển vào dòng phụ, in đậm màu tím.
- [x] Ghi chú do người dùng nhập: 1 dòng riêng không viền, giới hạn 2 dòng (`-webkit-line-clamp`).
- [x] Khối số liệu bỏ viền và bỏ 2 vạch chia ô, chỉ còn nền nhạt.
- [x] Số khối có viền trong 1 thẻ bú bình: 6 → **1** (chỉ còn viền ngoài của thẻ).

## 4. Bố cục mới

- [x] Hàng đầu: `giờ (cột cố định 46px) | icon 26px | tiêu đề + dòng phụ | ›`.
- [x] Giờ dùng `tabular-nums` để các giờ thẳng cột khi quét dọc.
- [x] Dòng phụ gộp dạng `nhãn · giá trị · tên bình`, dấu · mờ 50%.
- [x] Icon loại chăm sóc đổi sang nền trung tính (trước là 4 màu theo tone) để bớt màu trên màn.

## 5. Bỏ chấm màu tự nhận

- [x] Bỏ `careNoteDotColor` / `careNoteChipOne` / `careNoteChipHtml` — cơ chế dò tên màu ("tím", "hồng"…) trong ghi chú chỉ chạy khi người dùng đặt tên bình theo màu, không dùng được với cách đặt tên theo số.
- [x] Thay bằng tên bình in màu tím, hoạt động với mọi cách đặt tên.
- [x] Cữ bú lấy từ nhiều túi: mỗi hàng túi vẫn có tên bình riêng để không lẫn.

## 6. Kết quả đo (iPhone 390×844, dark)

- [x] Tổng chiều cao nội dung **1245px → 885px (−29%)**.
- [x] Số bản ghi thấy cùng lúc **4 → 5**.
- [x] Cỡ chữ nhỏ nhất **9.5px** (trước 9px) — không có chữ nào nhỏ hơn.
- [x] Vùng cuộn 635px và footer 74px giữ nguyên như V11.4.1.

## 7. Không hồi quy

- [x] Vuốt sang trái Sửa/Xóa, nút "›" mở form sửa, bộ lọc kho sữa, thẻ túi sữa: giữ nguyên.
- [x] Không đổi cấu trúc dữ liệu lưu, luồng lưu, đồng bộ cloud.
- [x] 9 tổ hợp 390/430/360/768px × Bé bú, Kho sữa, Ngủ, Thay tã, Hút sữa × light/dark: không tràn ngang, không cắt chữ, footer không đè danh sách, vùng chạm đạt chuẩn.
- [x] Version đồng bộ 11.5.0 tại 7 vị trí.

## Stable Baseline Lock

- [x] 26 hàm lõi ở `BASELINE_LOCK_V11.4.1.json` — hash khớp **26/26**.
- [x] Hàm sửa ở bản này: `careRecordHeadline`, `careRecordMetrics`, `careRecordBagRowsHtml`, `careRecordCardHtml`; hàm bị bỏ: `careNoteDotColor`, `careNoteChipOne`, `careNoteChipHtml` — đều thuộc lớp hiển thị chi tiết, không nằm trong nhóm khoá.

## Release Gate

- [x] `node --check` PASS · Version consistency PASS · Baseline hashes PASS · `release_check.py` PASSED.
- [x] Playwright 9 case PASS; đối chiếu nội dung render của Bé bú / Hút sữa / Ngủ / Thay tã xác nhận không còn thông tin lặp.

## Known limitation

- Ghi chú túi sữa vẫn lấy từ ô "Ghi chú" của lần hút sữa, chưa có trường riêng "Tên bình" với danh sách chọn nhanh.
- Bảng số liệu Bé bú giờ chỉ xuất hiện ở ca bú không hết; nếu muốn luôn thấy "Lấy từ kho / Bé bú" kể cả ca bình thường thì cần bật lại ở `careRecordMetrics`.
