# AC V14.0.0 — Sổ sức khỏe 2.0 (Health Book 2.0)

Ngày phát hành: 2026-07-30
Phạm vi: bổ sung module **Sổ sức khỏe 2.0** — hồ sơ sức khỏe độc lập cho từng thành viên gia đình.

---

## 1. Nguyên tắc nâng cấp

| Nguyên tắc | Thực hiện |
|---|---|
| Không phá vỡ hành vi cũ | Không sửa bất kỳ hàm nào trong `BASELINE_LOCK_V13.10.0.json` (đã đối chiếu hash: 0 hàm thay đổi) |
| Dữ liệu cũ được giữ | `db.healthBook` (Sổ sức khỏe V1) **không bị xoá**; trang "Thêm/Xem sổ sức khỏe" cũ vẫn chạy như trước |
| Sao lưu / đồng bộ | Dữ liệu mới nằm trong `db.hb` → tự động đi kèm `exportDB`/`importDB`/cloud sync mà **không phải sửa** hai hàm đang bị khoá |
| Tái sử dụng, không viết trùng | Biểu đồ tăng trưởng dùng lại bộ chuẩn **WHO LMS** có sẵn từ V13.10.0 (`WHO_LMS`, `whoZScore`, `whoPercentile`, `whoClassify`, `whoChartSvg`) |

---

## 2. Kiến trúc dữ liệu

```
db.hb = {
  activeId: "<id thành viên đang xem>",
  migrated: true,
  members: [ { ...hồ sơ độc lập... } ]
}
```

Mỗi phần tử `members[]` là một **hồ sơ khép kín**, không dùng chung dữ liệu:

| Nhóm | Trường |
|---|---|
| Cơ bản | `id, name, rel, avatar, dob, gender, blood, height, weight, email, phone` |
| Tình trạng | `status:{txt,tone}` — Khỏe mạnh / Đang điều trị / Có thuốc đang uống |
| Y tế | `medical:{bhxh, bhyt, bhytExp, bhytPlace, hospital, doctor, emergency}` |
| Tiền sử | `history:{diseases[], chronic[], allergy:{drug,food,seafood,pollen,other}, surgery[], family[]}` |
| Khác | `other:{notes, files[]}` |
| Dữ liệu y tế | `meas[], vaccines[], visits[], meds[], labs[]` |

`rel = 'Con'` → bật thêm chức năng biểu đồ tăng trưởng WHO.
Hồ sơ của bé có `linkBaby = true` → tự lấy thêm số đo từ `db.baby` và ngày sinh từ `db.settings.birthDate`.

---

## 3. Migration (tự động, một lần)

- Mỗi bản ghi `db.healthBook[]` được chuyển thành một thành viên trong `db.hb.members[]`.
- Ánh xạ: `person` → `rel` (Bố → Ba), `fullName` → `name`, `allergy` → `history.allergy.other`,
  `history` → `history.diseases`, `medicine` → `meds[]`, `vaccines[]` → `vaccines[]`,
  `insurance` → `medical.bhyt`, `doctor` → `medical.doctor`, `note` → `other.notes`.
- Luôn bảo đảm tồn tại hồ sơ của Bé (lấy tên/ngày sinh/giới tính từ Thiết lập nếu chưa có).
- Cờ `db.hb.migrated` chống chuyển đổi lặp lại.

---

## 4. Tiêu chí nghiệm thu

### 4.1 Danh sách thành viên
- [x] Header `🩺 Sổ sức khỏe`, avatar dạng chip ngang, cuộn ngang được.
- [x] Bấm chip → chuyển hồ sơ. Bấm lại chip đang chọn → xem avatar phóng to.
- [x] Nút `＋ Thêm` mở form tạo thành viên mới.

### 4.2 Thêm thành viên
- [x] Đủ trường: Avatar (9 lựa chọn), Họ tên, Quan hệ (Con/Mẹ/Ba/Ông/Bà/Khác), Ngày sinh, Giới tính, Nhóm máu, Chiều cao, Cân nặng, Email, SĐT.
- [x] Tạo xong sinh hồ sơ độc lập, tự chuyển sang hồ sơ mới.

### 4.3 Thông tin y tế & Tiền sử
- [x] Mã BHXH, Mã BHYT, Ngày hết hạn BHYT, Nơi đăng ký khám, Bệnh viện thường khám, Bác sĩ theo dõi, Liên hệ khẩn cấp.
- [x] Tiền sử bệnh, Bệnh nền, Dị ứng tách 5 nhóm (Thuốc / Thực phẩm / Hải sản / Phấn hoa / Khác), Tiền sử phẫu thuật, Tiền sử gia đình.
- [x] Ghi chú sức khỏe + Tệp đính kèm (Ảnh toa thuốc, Ảnh BHYT, Ảnh BHXH, PDF khám bệnh, Ảnh sổ tiêm…).

### 4.4 Dashboard thành viên
- [x] Card tình trạng sức khỏe (đổi được).
- [x] Card: Cân nặng, Chiều cao, BMI (người lớn) / Vòng đầu (bé), Nhóm máu, Tiêm chủng, Khám gần nhất, Thuốc đang dùng.
- [x] Cảnh báo mũi tiêm quá hạn / sắp tới.

### 4.5 Biểu đồ tăng trưởng WHO
- [x] **Chỉ hiển thị với `rel = Con`**; tab tự ẩn với Ba/Mẹ/Ông/Bà.
- [x] Chỉ số: Cân nặng theo tuổi, Chiều dài/cao theo tuổi, Vòng đầu theo tuổi.
- [x] Dùng chuẩn WHO LMS thật theo giới tính → hiển thị Z-score và bách phân vị.
- [x] Nhận xét tự động: `✔ Cân nặng bình thường` / `⚠ Suy dinh dưỡng thể nhẹ cân` … kèm lời khuyên.
- [x] Lịch sử đo từng lần kèm phân loại.

### 4.6 Tiêm chủng
- [x] Trạng thái: Đã tiêm / Sắp tới / Quá hạn / Chưa lên lịch, nhóm theo trạng thái.
- [x] Trường: Tên vaccine, Mũi số, Ngày tiêm, Nơi tiêm, Bác sĩ, Phản ứng sau tiêm, Ảnh sổ tiêm.

### 4.7 Khám bệnh
- [x] Ngày, Bệnh viện, Bác sĩ, Triệu chứng, Chẩn đoán, Điều trị, Thuốc, Chi phí, BHYT, Ghi chú.

### 4.8 Thuốc
- [x] Tên, Liều dùng, Ngày bắt đầu/kết thúc.
- [x] Nhắc uống (bật/tắt), Đánh dấu đã uống theo ngày, Ngừng thuốc.

### 4.9 Xét nghiệm
- [x] Nhóm theo loại: Máu, Nước tiểu, Xquang, MRI, CT, Siêu âm, Khác.
- [x] Ngày, Kết quả, Chỉ số (nhiều dòng `Tên = Giá trị`), đánh giá Bình thường / Cần lưu ý.

### 4.10 Timeline
- [x] Gộp toàn bộ sự kiện theo thứ tự thời gian giảm dần.
- [x] Bộ lọc: Tất cả / Tiêm / Khám / Thuốc / Xét nghiệm / Chỉ số.

### 4.11 Báo cáo
- [x] Kỳ: Tuần / Tháng / Quý / Năm.
- [x] Số lần khám, số lần tiêm, thuốc đã dùng, xét nghiệm, tăng cân, tăng chiều cao, BMI (hoặc bách phân vị WHO với bé), chi phí khám chữa bệnh.
- [x] Xuất bản in / PDF.

### 4.12 Thêm nhanh
- [x] Nút nổi `＋` với 7 mục: Đo cân nặng, Đo chiều cao, Tiêm chủng, Khám bệnh, Thuốc, Xét nghiệm, Ghi chú.

### 4.13 UI/UX
- [x] Dùng biến CSS sẵn có → đồng bộ cả 3 giao diện (sáng / tối / hồng).
- [x] Card bo góc lớn, hiệu ứng nhẹ, timeline dạng lịch sử.
- [x] Avatar bấm xem ảnh lớn.
- [x] Màu thống nhất: 💙 thông tin · 💚 bình thường · 🩷 bé · 🟠 tiêm chủng · 💜 thuốc · ❤️ cảnh báo.

### 4.14 Mở rộng tương lai
- [x] Trang liệt kê: Huyết áp, Đường huyết, SpO2, Nhịp tim, ECG, Nhiệt độ, Lux, dB, AI đánh giá, Apple Health, Google Fit.
- [x] Xuất toàn bộ hồ sơ sức khỏe để mang đi khám — **đã hỗ trợ** (in / PDF).

---

## 5. Kết quả kiểm thử

| Hạng mục | Kết quả |
|---|---|
| `node --check app.js` / `sw.js` | PASS |
| Lỗi JavaScript khi chạy | 0 |
| Migration từ `db.healthBook` | PASS — 2/2 hồ sơ chuyển đúng, giữ dị ứng/tiền sử/BHYT |
| Dữ liệu cũ sau nâng cấp | Nguyên vẹn (`db.baby`, `db.healthBook`, `db.settings`) |
| Biểu đồ WHO | PASS — Z-score −1.16, bách phân vị 12.3 với dữ liệu mẫu |
| Ẩn tab Tăng trưởng với người lớn | PASS |
| Baseline Lock vs V13.10.0 | PASS — 0 hàm cũ bị thay đổi |

## 6. Hiệu chỉnh giao diện (bản vá 14.0.0)

Nguyên nhân gốc: app có rule toàn cục `@media(max-width:640px){ button{width:100%} }` khiến mọi thẻ `<button>`
của module bị ép rộng 100% trên điện thoại.

| Lỗi trước khi vá | Cách xử lý |
|---|---|
| Nút ✕ đóng hộp thoại bị kéo dài hết dòng, tiêu đề xuống 2 dòng | `#hb2Root button,.hb2ModalCard button{width:auto}`; tiêu đề `flex:1`, nút đóng cố định 38×38 |
| Chip thành viên và tab chức năng bị giãn, mất dạng viên thuốc | Đặt lại `width:auto` + `flex:0 0 auto` cho `.hb2Chip`, `.hb2Tab` |
| Thẻ chức năng cao thấp lệch nhau (phụ đề 1–2 dòng) | `min-height:118px` + `-webkit-line-clamp:2` cho phụ đề → tất cả bằng 118px |
| Nút "Đổi" ở thẻ tình trạng chiếm hết dòng, chữ bị bóp cột hẹp | Nút `flex:none;width:auto`, phần chữ `flex:1;min-width:0` |
| Nút nổi ＋ của module trùng với nút ＋ Ghi nhận ở thanh dưới | Bỏ nút nổi; chuyển thành nút **＋ Thêm nhanh** trong đầu trang |
| Dòng chữ cuối bị thanh điều hướng dưới che | `#hb2Root{padding-bottom:96px}` |
| Thanh chức năng phải cuộn ngang mới thấy đủ 5 mục | Cho xuống dòng (`flex-wrap:wrap`) → hiện đủ, không cần cuộn |
| Hộp thoại có thể bị thanh dưới đè | `z-index:1200` (thanh dưới là 120) |

Kết quả đo trên màn 390px: thẻ chức năng đều 118px, thẻ chỉ số đều 93px, không tràn ngang
(`scrollWidth = 390`), tab hiển thị đủ ở cả 360/390/430px, tương phản chữ/nền đạt ở cả ba giao diện sáng/tối/ocean.
