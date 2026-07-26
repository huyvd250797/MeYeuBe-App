# Acceptance Criteria — MeYeuBe V13.3.0

## ✨ Smart Suggest — gợi ý thông minh khi ghi nhận

Giao diện theo **phương án B (điền sẵn inline)**: không thêm khối lớn nào vào form,
các ô được điền sẵn và đánh dấu bằng nền vàng nhạt + nhãn `GỢI Ý`.

---

## 1. Nguyên tắc chung (mục 8 của tài liệu)

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 1.1 | Smart Suggest chỉ gợi ý, không tự lưu | Mở form, không bấm gì, đóng lại → không có bản ghi nào được tạo | ✅ |
| 1.2 | Người dùng luôn có thể thay đổi | Gõ đè lên ô được gợi ý → giá trị mới được giữ nguyên | ✅ |
| 1.3 | Ô đã sửa tay thì hết là gợi ý | Gõ vào ô → mất nền vàng và mất nhãn `GỢI Ý` ngay lập tức | ✅ |
| 1.4 | Không bắt buộc phải dùng | Bấm **Xoá gợi ý** → mọi ô và mọi túi sữa do gợi ý điền vào bị xoá sạch | ✅ |
| 1.5 | Đã xoá thì không tự gợi ý lại | Sau khi Xoá gợi ý, đổi loại chăm sóc → không gợi ý lại trong phiên đó | ✅ |
| 1.6 | Tắt được hoàn toàn | Cấu hình Dashboard → ✨ Smart Suggest → bỏ tick → form trở lại y hệt V13.2.3 | ✅ |
| 1.7 | Không đè lên dữ liệu thật khi Sửa/Sao chép | Mở Sửa một ghi nhận cũ → không ô nào bị đổi, không thanh gợi ý, không tự thêm túi sữa | ✅ |

---

## 2. Đề xuất Kho sữa (mục 1 — ưu tiên triển khai)

Áp dụng khi **Bé bú → Hình thức bú → "Bú từ kho sữa đã hút"**.

Thứ tự ưu tiên: túi còn đủ lượng → hạn dùng gần nhất → đang ở trạng thái dùng được →
cùng điều kiện thì túi tạo trước.

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 2.1 | Chọn túi đủ lượng, HSD gần nhất | Kho 50ml (6 giờ) · 80ml (2 ngày) · 120ml (5 ngày), bé bú 70ml → gợi ý **túi 80ml** | ✅ |
| 2.2 | Chỉ lấy đúng lượng cần | Túi 80ml, bé bú 70ml → trừ đúng **70ml**, túi còn 10ml | ✅ |
| 2.3 | Không túi nào đủ → tự ghép nhiều túi | Kho 50 · 40 · 30, bé bú 70ml → ghép **50 + 20**, tổng đúng 70ml | ✅ |
| 2.4 | Dừng khi đã đủ | Trường hợp 2.3 không lôi thêm túi thứ 3 | ✅ |
| 2.5 | Có túi đơn đủ lượng thì không ghép nhiều túi | Kho 50 · 40 · 100, bé bú 70ml → chỉ mở **1 túi 100ml** | ✅ |
| 2.6 | Kho chỉ còn một túi → chọn sẵn | Kho 1 túi → chọn sẵn, chỉ cần xác nhận | ✅ |
| 2.7 | Bỏ qua túi không dùng được | Túi "Đã sử dụng hết" / "Đã bỏ" / còn 0ml → không bao giờ được đề xuất | ✅ |
| 2.8 | Cùng HSD thì ưu tiên túi tạo trước | Hai túi cùng hạn → chọn túi có giờ tạo sớm hơn | ✅ |
| 2.9 | Kho thiếu → báo rõ thiếu bao nhiêu | Kho 50ml, bé bú 100ml → gợi ý hết 50ml và báo **thiếu 50ml** | ✅ |
| 2.10 | Kho rỗng → không gợi ý, không lỗi | Kho trống → form hoạt động bình thường | ✅ |
| 2.11 | Có giải thích lý do chọn túi | Dưới danh sách túi có dòng "✨ Đủ lượng bú · hạn dùng gần nhất…" | ✅ |
| 2.12 | Không phá lựa chọn thủ công | Người dùng tự chọn túi → engine không xoá/đổi túi đó | ✅ |

### Cảnh báo hạn dùng dưới 24 giờ

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 2.13 | Túi được chọn sắp hết hạn → nhắc dùng ngay | Túi được đề xuất còn 5 giờ → "⚠️ Nên dùng túi … trước — còn 5 giờ là hết hạn." | ✅ |
| 2.14 | Túi **không** được chọn mà sắp hết hạn → vẫn nhắc | Kho có túi nhỏ còn 8 giờ nhưng thiếu lượng nên không được chọn → vẫn cảnh báo để cân nhắc | ✅ |
| 2.15 | Đúng ngưỡng 24 giờ | Túi còn 23 giờ → có cảnh báo · túi còn 30 giờ → không cảnh báo | ✅ |

---

## 3. Gợi ý theo lịch sử (mục 2–6)

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 3.1 | §2 Lượng bú = cữ gần nhất | Ba cữ gần nhất 120 · 120 · 110 (mới nhất 120) → điền sẵn **120** | ✅ |
| 3.2 | §2 Hình thức bú hay dùng nhất được chọn sẵn | Phần lớn các cữ là "kho sữa" → chọn sẵn "Bú từ kho sữa đã hút" | ✅ |
| 3.3 | §3 Lượng hút = trung bình các lần gần đây, làm tròn 5ml | 150 · 145 · 155 → điền sẵn **150** | ✅ |
| 3.4 | §3 Nơi bảo quản hay dùng được chọn sẵn, HSD tự tính theo đó | Chọn sẵn "Ngăn mát" → ô Hạn sử dụng tự điền | ✅ |
| 3.5 | §4 Thuốc theo liệu trình | Đang dùng Vitamin D3 1 giọt → điền sẵn cả tên, liều, đơn vị | ✅ |
| 3.6 | §5 Loại tã theo lần trước | Lần trước là "Tã bẩn" → chọn sẵn "Tã bẩn", nút được tô nền gợi ý | ✅ |
| 3.7 | §6 Chip ghi chú hay dùng | Các ghi chú lặp lại hiện thành chip dưới ô Ghi chú, chạm một lần để điền, chạm lại để bỏ | ✅ |
| 3.8 | Chip xếp theo tần suất | Ghi chú dùng nhiều lần đứng trước | ✅ |
| 3.9 | App mới chưa có dữ liệu → không gợi ý bừa | DB trống → không ô nào được điền, không thanh gợi ý | ✅ |

---

## 4. Giao diện (mục 7, theo phương án B)

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 4.1 | Thanh gợi ý nằm ở đầu form | Trên cùng phần nội dung form, dưới tiêu đề | ✅ |
| 4.2 | Thanh nêu rõ đã điền sẵn những gì | "✨ Gợi ý theo thói quen · N ô đã điền sẵn · M túi sữa đã chọn sẵn" | ✅ |
| 4.3 | Ô gợi ý phân biệt được bằng mắt | Nền vàng nhạt + viền vàng + nhãn `GỢI Ý` cạnh nhãn ô | ✅ |
| 4.4 | Túi sữa do gợi ý chọn cũng được tô nền vàng | Thẻ túi trong danh sách có nền vàng nhạt | ✅ |
| 4.5 | Hoạt động đúng ở Dark mode | Bộ màu vàng riêng cho dark mode, vẫn đọc rõ | ✅ |
| 4.6 | Nút "Xoá gợi ý" không bị tràn viền | Có `width:auto!important` để không dính rule `button{width:100%}` ở màn hình nhỏ | ✅ |
| 4.7 | Nhãn `GỢI Ý` không mất khi app vẽ lại nhãn ô | Đổi hình thức bú (làm nhãn ô đổi chữ) → nhãn `GỢI Ý` được gắn lại | ✅ |

---

## 5. An toàn & hồi quy

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 5.1 | Không sửa hàm nào thuộc Baseline Lock | 26/26 hàm lõi khớp hash `BASELINE_LOCK_V13.2.3` | ✅ |
| 5.2 | Cờ nội bộ không lọt vào dữ liệu lưu | Bản ghi lưu ra không chứa trường nào của module `ss*` | ✅ |
| 5.3 | Trừ kho sữa vẫn đúng | Lưu cữ bú 120ml từ kho → túi bị trừ đúng 120ml | ✅ |
| 5.4 | Hoàn tác (V13.2.x) vẫn đúng | Lưu rồi Hoàn tác → xoá bản ghi và trả lại đủ sữa vào kho | ✅ |
| 5.5 | Tìm kiếm toàn app (V12.2.x) còn nguyên | Module `gs*` hoạt động bình thường | ✅ |
| 5.6 | Backup & Version Control (V13.0.0) còn nguyên | Module `bk*` hoạt động bình thường | ✅ |
| 5.7 | Khoá cuộn nền khi mở form vẫn đúng | Mở form → `body.careModalOpen` | ✅ |
| 5.8 | Thanh tiến độ kho sữa vẫn tính đúng | "120 / 120 ml" đúng sau khi gợi ý điền vào | ✅ |

---

## 6. Kết quả kiểm thử

Chạy trên **đúng code thật** (`index.html` + `app.js` nạp trong jsdom, không gõ lại logic):

```
[1] Đề xuất kho sữa               32/32 PASS
[2] Gợi ý theo lịch sử            12/12 PASS
[3] Tích hợp thật vào form        39/39 PASS
[4] Hồi quy tính năng cũ          12/12 PASS
─────────────────────────────────────────────
TỔNG                              95/95 PASS
```

`release_check.py` → **PASSED** · Baseline Lock **26/26** khớp.

---

## 7. Điểm cần Boss xác nhận

1. **Mâu thuẫn trong tài liệu (mục 1)** — ví dụ "Nếu không có túi đủ lượng" liệt kê kho
   `50ml · 40ml · 100ml` với bé bú `70ml`, nhưng túi 100ml **thừa sức đủ** cho 70ml.
   Bản build này theo cách hiểu của **ví dụ 1** (có ghi rõ lý do "đủ lượng bú, hết hạn sớm
   nhất trong các túi đáp ứng"): **ưu tiên mở một túi đủ lượng**, chỉ ghép nhiều túi khi
   không túi nào đủ. Để không bỏ sót túi nhỏ sắp hỏng, app **cảnh báo riêng** những túi
   dưới 24 giờ dù không được chọn.
   *Nếu Boss muốn ngược lại (luôn vét túi sắp hết hạn trước, kể cả phải mở nhiều túi) thì
   báo, sửa khoảng 10 dòng là xong.*

2. **Giờ uống thuốc** — tài liệu gợi ý điền sẵn cả giờ (08:00). Bản này **cố ý không điền
   giờ**, chỉ điền tên/liều/đơn vị, vì điền sẵn giờ cũ dễ khiến bấm Lưu nhầm giờ trong quá
   khứ. Giờ vẫn mặc định là thời điểm đang ghi nhận.

3. **Chip ghi chú** — demo phương án B không có phần này, nhưng mục 6 của tài liệu yêu cầu.
   Đã thêm dạng chip nhỏ dưới ô Ghi chú. Nếu thấy rườm rà thì tắt riêng được trong
   Cấu hình Dashboard → ✨ Smart Suggest.
