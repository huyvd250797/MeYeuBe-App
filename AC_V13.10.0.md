# Acceptance Criteria — MeYeuBe V13.10.0 · Biểu đồ tăng trưởng WHO

## Thiết lập hồ sơ
- [ ] Trang **Thiết lập hồ sơ** có trường mới **Giới tính của bé** với 3 lựa chọn: *Chưa chọn* / *Bé trai* / *Bé gái*, kèm dòng giải thích vì sao cần.
- [ ] Chọn giới tính rồi bấm **Lưu thiết lập** → thoát app, mở lại vẫn giữ đúng lựa chọn (`db.settings.babySex`).
- [ ] Các trường cũ (Ngày kinh cuối, Ngày sinh bé, giờ sinh, bệnh viện, tên bé, tên chính thức, ảnh đại diện, chủ đề) lưu và hiển thị đúng như trước.

## Thẻ Biểu đồ tăng trưởng WHO — trạng thái chưa đủ điều kiện
- [ ] **Chưa nhập Ngày sinh bé**: thẻ hiện lời nhắc 🎂 kèm nút **Mở Thiết lập hồ sơ**, bấm vào chuyển đúng trang.
- [ ] **Đã có ngày sinh nhưng chưa chọn giới tính**: thẻ hiện lời nhắc 👶 kèm 2 nút *Bé trai* / *Bé gái*; bấm một nút thì thẻ dựng lại ngay và hiện toast xác nhận.
- [ ] **Đủ ngày sinh + giới tính nhưng chưa có số đo nào cho chỉ số đang chọn**: hiện lời mời 📝 kèm nút **Nhập chỉ số cho bé**, bấm vào mở đúng trang Sau sinh.
- [ ] Ba trạng thái trên không làm vỡ hay ẩn mất khối biểu đồ cũ bên dưới.

## Biểu đồ
- [ ] Có 3 tab chỉ số: **⚖️ Cân nặng · 📏 Chiều dài · 🧢 Vòng đầu**; bấm đổi tab thì biểu đồ, ô tóm tắt và bảng chi tiết đều đổi theo, tab đang chọn được tô sáng.
- [ ] Có hàng chọn khoảng tuổi: **Tự động / 6 tháng / 1 tuổi / 2 tuổi / 5 tuổi**. Chế độ *Tự động* hiển thị kèm mốc đang dùng, ví dụ `Tự động (24t)`, và tự nới rộng khi bé lớn lên.
- [ ] Biểu đồ vẽ đủ: dải xanh −2 → +2 SD, hai dải vàng ±2 → ±3 SD, đường trung bình WHO, nhãn `+3 / +2 / TB / −2 / −3` ở mép phải, tên đơn vị ở góc trên trái và `tháng tuổi` ở góc dưới phải — **không nhãn nào đè lên nhãn nào**.
- [ ] Đường của bé màu hồng nằm trên nền chuẩn, mỗi lần đo là một chấm tròn; chạm/di chuột vào chấm hiện tooltip có ngày đo, tuổi lúc đo, giá trị, z-score và bách phân vị.
- [ ] Trên điện thoại, biểu đồ cuộn ngang được và chữ vẫn đọc rõ; xoay ngang máy không vỡ bố cục.
- [ ] Đổi chủ đề sáng ↔ tối: màu dải, đường và chữ trong biểu đồ đều đọc được ở cả hai chế độ.

## Ô tóm tắt và đánh giá
- [ ] Ô tóm tắt lấy đúng **lần đo mới nhất** của chỉ số đang chọn, ghi rõ ngày đo và tuổi lúc đo.
- [ ] Hiện đủ 4 ô: **Z-score** (kèm dấu + / −, đơn vị SD), **Bách phân vị**, **Trung bình WHO**, **Khoảng bình thường**.
- [ ] Nhãn đánh giá đúng ngưỡng WHO và đổi màu viền trái theo mức độ:
  - Cân nặng: `< −3 SD` → *Suy dinh dưỡng thể nhẹ cân, mức nặng*; `−3 → −2` → *Suy dinh dưỡng thể nhẹ cân*; `−2 → +2` → *Cân nặng bình thường*; `> +2` → *Cân nặng cao hơn chuẩn*.
  - Chiều dài/cao: `< −3` → *Thấp còi mức nặng*; `−3 → −2` → *Thấp còi*; `−2 → +2` → *Chiều cao bình thường*; `> +2` → *Cao hơn chuẩn*.
  - Vòng đầu: `< −2` → *Vòng đầu nhỏ hơn chuẩn*; `−2 → +2` → *bình thường*; `> +2` → *Vòng đầu lớn hơn chuẩn*.
- [ ] Mỗi đánh giá kèm một câu gợi ý nên làm gì tiếp; trường hợp ngoài khoảng bình thường thì gợi ý đi khám.
- [ ] Dòng ghi chú **"chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ"** luôn hiện dưới biểu đồ.

## Bảng chi tiết
- [ ] Mục **Bảng chi tiết N lần đo** đóng sẵn, bấm mới mở.
- [ ] Bảng liệt kê **mới nhất lên trước**, đủ cột: Ngày · Tuổi · Giá trị · Z-score · BPV % · Đánh giá.
- [ ] Số dòng bằng đúng số lần đo có dữ liệu số cho chỉ số đang chọn (bản ghi bỏ trống ô đó thì không tính).

## Tính toán
- [ ] Bảng LMS phủ đủ 0–60 tháng cho cả 3 chỉ số × 2 giới tính (61 mốc mỗi bảng).
- [ ] Dựng lại các đường −3 / −2 / 0 / +2 / +3 SD từ công thức LMS phải khớp cột SD in sẵn của WHO — **1.830/1.830 giá trị**.
- [ ] Áp dụng hiệu chỉnh phần đuôi ngoài ±3 SD cho chỉ số **cân nặng theo tuổi**; chiều dài và vòng đầu **không** hiệu chỉnh.
- [ ] Tuổi lẻ giữa hai mốc tháng được nội suy tuyến tính (ví dụ 6,5 tháng nằm giữa mốc 6 và 7).
- [ ] Đơn vị: ô Cân nặng nhập `3500` → hiểu 3,5 kg; `3,5kg` và `3.5` → 3,5 kg; chiều dài / vòng đầu nhập nhầm bằng mét → tự quy về cm.
- [ ] Bản ghi có ngày đo **trước** ngày sinh bị bỏ qua, không làm vỡ biểu đồ.
- [ ] Có lần đo sau 60 tháng: vẫn vẽ được, tính theo mốc 60 tháng, và hiện dòng cảnh báo ⚠️ đếm đúng số điểm bị ảnh hưởng.

## Không hồi quy
- [ ] Khối **Biểu đồ theo số liệu đã nhập** (cân nặng, chiều dài, vòng đầu, cữ bú, thời gian ngủ) vẫn vẽ đúng như V13.9.4, nay nằm trong thẻ riêng bên dưới thẻ WHO.
- [ ] Trang Thống kê chỉ số sau sinh, nút *Xem biểu đồ phát triển* và nút *Quay lại thống kê sau sinh* hoạt động như cũ.
- [ ] Biểu đồ thai kỳ, biểu đồ khu Chăm sóc (kể cả chế độ toàn màn hình) không đổi hành vi.
- [ ] Không còn `TypeError` lúc nạp app do `render()` chạy sớm trong `mcMigrateFromNotes` — mở app bằng console sạch lỗi.
- [ ] Sao lưu / phục hồi / đồng bộ đám mây giữ nguyên trường `settings.babySex`.
- [ ] Toàn bộ hàm lõi trong `BASELINE_LOCK_V13.5.0.json` không thay đổi (đối chiếu bằng `release_check.py`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
- [ ] Version `13.10.0` đồng bộ ở index.html, app.js, manifest.webmanifest, sw.js, version.md.
