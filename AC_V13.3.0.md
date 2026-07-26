# Acceptance Criteria — MeYeuBe V13.3.0

## 🍼 Danh mục Bình/Túi & tự gắn túi theo số ml

Bản này **gỡ bỏ hoàn toàn** tính năng tự động điền của bản thử nghiệm trước
(điền sẵn lượng bú / lượng hút / thuốc / loại tã, nhãn `GỢI Ý`, chip ghi chú)
và làm lại theo hướng mới: **danh mục bình/túi** + **tự gắn túi tính lại live theo số ml**.

---

## 1. Danh mục Bình / Túi trữ sữa

Menu → Danh mục → **Bình / Túi trữ sữa**

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 1.1 | Khai báo được Bình và Túi | Thêm mục mới, chọn Loại = Bình hoặc Túi | ✅ |
| 1.2 | Loại Bình khai báo từng cái | Bình có ô Dung tích, hiện trạng thái Đang chứa sữa / Trống | ✅ |
| 1.3 | Loại Túi chỉ cần một dòng chung | Chọn Túi thì ẩn ô Dung tích, kèm ghi chú giải thích | ✅ |
| 1.4 | App có sẵn một dòng “Túi trữ sữa” | Cài mới hoặc dữ liệu cũ đều có sẵn, dùng được ngay | ✅ |
| 1.5 | Không cho trùng tên | Thêm trùng tên → báo lỗi, danh mục không nhân đôi | ✅ |
| 1.6 | Sửa được, đổi tên bình thì kho cập nhật theo | Đổi tên bình → các túi trong kho gắn bình đó đổi tên hiển thị | ✅ |
| 1.7 | Không cho xoá bình đang có sữa trong kho | Bấm Xoá → báo và gợi ý chuyển sang Tạm ẩn | ✅ |
| 1.8 | Trạng thái bận tính đúng | Bình còn sữa chưa dùng hết → “Đang chứa sữa”; túi dùng một lần không tính | ✅ |
| 1.9 | Thêm/Xoá có Hoàn tác | Snackbar Hoàn tác hiện như các danh mục khác | ✅ |

---

## 2. Hút sữa — chọn bình/túi thay vì gõ ghi chú

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 2.1 | Form Hút sữa có hàng chip chọn bình/túi | Mở form → thấy khối “Đựng vào bình / túi *” | ✅ |
| 2.2 | Bắt buộc chọn | Chưa chọn mà bấm Lưu → báo và không tạo túi trong kho | ✅ |
| 2.3 | Chọn Bình → kho hiển thị tên bình | Hút vào “Fatz 1️⃣” → kho hiện đúng “Fatz 1️⃣” | ✅ |
| 2.4 | Chọn Túi → app tự đặt mã theo ngày giờ hút | Hút 25/07/2026 lúc 23:30 → mã **260725-2330** | ✅ |
| 2.5 | Báo trước mã sẽ đặt | Chọn Túi → dòng gợi ý hiện sẵn mã trước khi lưu | ✅ |
| 2.6 | Cảnh báo khi chọn bình đang còn sữa | Chip bình bận bị làm mờ, chạm vào thì hỏi lại | ✅ |
| 2.7 | Ô Ghi chú vẫn giữ nguyên | Ghi chú dùng cho nội dung khác, không còn phải gõ tên bình | ✅ |
| 2.8 | Sửa ghi nhận hút cũ giữ đúng bình/túi | Mở Sửa → chip đang chọn đúng như đã lưu | ✅ |

---

## 3. Bé bú từ kho sữa — tự gắn túi, tính lại live

Thứ tự ưu tiên: **hạn dùng gần nhất → túi ít ml trước → túi tạo trước**.
Túi cuối chỉ lấy **đúng phần còn thiếu**.

Kho mẫu: Bình 1 (30ml, 1 ngày) · Bình 2 (50ml, 2 ngày) · Túi 1 (80ml, 3 ngày)

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 3.1 | Nhập 80ml | → Bình 1 (30) + Bình 2 (50) | ✅ |
| 3.2 | **Sửa thành 30ml** | → danh sách **tự co lại** còn Bình 1 | ✅ |
| 3.3 | **Sửa thành 90ml** | → **tự nới ra** Bình 1 + Bình 2 + Túi 1 (10ml, còn 70ml) | ✅ |
| 3.4 | **Sửa thành 70ml** | → Bình 1 (30) + Bình 2 (40), không để sót túi thừa | ✅ |
| 3.5 | Xoá trắng ô ml | → bỏ hết túi đã gắn | ✅ |
| 3.6 | Kho không đủ | Nhập 200ml → gắn hết 160ml + cảnh báo **thiếu 40ml** | ✅ |
| 3.7 | Cảnh báo tự tắt khi vừa kho | Sửa lại 80ml → cảnh báo biến mất | ✅ |
| 3.8 | Cùng hạn dùng → ưu tiên túi ít ml | Kho 90/20/50 cùng hạn, cần 60ml → lấy 20 + 40 | ✅ |
| 3.9 | Bỏ qua túi không dùng được | “Đã sử dụng hết” / “Đã bỏ” / còn 0ml → không gắn | ✅ |
| 3.10 | Chuyển sang Bú mẹ trực tiếp | Panel kho sữa ẩn, không giữ túi thừa | ✅ |
| 3.11 | Thanh tiến độ kho sữa vẫn đúng | “80 / 80 ml” khớp với số túi đã gắn | ✅ |

### Tôn trọng thao tác tay

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 3.12 | Bấm ✕ → chuyển sang THỦ CÔNG | Huy hiệu đổi từ TỰ ĐỘNG sang THỦ CÔNG | ✅ |
| 3.13 | Thủ công thì đổi ml không bị app chọn lại | Gỡ 1 bình rồi sửa ml → danh sách giữ nguyên | ✅ |
| 3.14 | Có nút quay lại tự động | “↻ Cho app tự chọn lại” → gắn lại từ đầu theo số ml hiện tại | ✅ |
| 3.15 | Tự thêm túi qua nút “＋ Thêm túi sữa” cũng chuyển thủ công | Chọn tay một túi → ngừng tự đổi | ✅ |
| 3.16 | **Sửa ghi nhận đã lưu thì khoá thủ công** | Mở Sửa → giữ nguyên túi đã lưu, đổi ml cũng không bị đè | ✅ |

### Túi mở dở

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 3.17 | Nhắc hủy phần còn lại | Túi dùng một lần bị mở dở → nhắc cân nhắc bỏ phần còn lại | ✅ |
| 3.18 | Nhắc đúng số ml | Túi 80ml lấy 10ml → nhắc “còn 70ml” | ✅ |
| 3.19 | Không mở dở thì không nhắc | Các túi đều dùng hết → không hiện nhắc | ✅ |

---

## 4. Chuyển đổi dữ liệu cũ (chạy tự động một lần)

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 4.1 | Ghi chú kho sữa cũ → tạo bình trong danh mục | Túi ghi chú “Fatz 1️⃣” → tạo bình “Fatz 1️⃣” | ✅ |
| 4.2 | Ghi chú trùng nhau chỉ tạo một bình | Hai túi cùng ghi chú → cùng một bình | ✅ |
| 4.3 | Gắn ngược vào túi cũ trong kho | Túi cũ nhận đúng containerId/containerName | ✅ |
| 4.4 | Túi không có ghi chú thì bỏ qua | Không tạo bình rác | ✅ |
| 4.5 | Ghi chú dài là mô tả thật, không biến thành tên bình | Ghi chú > 30 ký tự hoặc nhiều dòng → giữ nguyên | ✅ |
| 4.6 | Chỉ chạy một lần | Đánh dấu `settings.mcMigratedV1`, mở lại app không chạy lại | ✅ |

---

## 5. Gỡ bỏ & hồi quy

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 5.1 | Không còn vết tính năng tự động điền cũ | `ssApplyForType` / `ssSuggestBags` không tồn tại | ✅ |
| 5.2 | Không sửa hàm nào thuộc Baseline Lock | 26/26 hàm lõi khớp hash `BASELINE_LOCK_V13.2.3` | ✅ |
| 5.3 | Trừ kho sữa vẫn đúng | Bú 80ml → Bình 1 và Bình 2 về 0, Túi 1 không bị đụng | ✅ |
| 5.4 | Hoàn tác (V13.2.x) vẫn đúng | Hoàn tác → trả lại 30ml và 50ml, xoá bản ghi | ✅ |
| 5.5 | Tìm kiếm toàn app (V12.2.x) còn nguyên | Module `gs*` bình thường | ✅ |
| 5.6 | Backup & Version Control (V13.0.0) còn nguyên | Module `bk*` bình thường | ✅ |
| 5.7 | Khoá cuộn nền khi mở form vẫn đúng | `body.careModalOpen` | ✅ |

---

## 6. Kết quả kiểm thử

Chạy trên **đúng code thật** (`index.html` + `app.js` nạp trong jsdom, không gõ lại logic):

```
[1] Thuật toán gắn túi            20/20 PASS
[2] Tính lại live khi đổi ml      23/23 PASS
[3] Sửa ghi nhận cũ                 3/3 PASS
[4] Danh mục Bình/Túi             14/14 PASS
[5] Hút sữa gắn bình/túi          11/11 PASS
[6] Chuyển đổi dữ liệu cũ           9/9 PASS
[7] Hồi quy                       14/14 PASS
────────────────────────────────────────────
TỔNG                              94/94 PASS
```

`release_check.py` → **PASSED** · Baseline Lock **26/26** khớp.

---

## 7. Điểm cần Boss xác nhận

1. **Thứ tự trong mã túi tự sinh.** Bản này dùng **YYMMDD-HHMM**, tức hút ngày 25/07/2026
   lúc 23:30 → `260725-2330`. Đây là format app đang dùng sẵn cho mã túi (`shortMilkBagCodeFromDate`),
   nên dữ liệu cũ và mới đồng nhất. Ví dụ Boss đưa (`250726-2330` cho ngày 25/07/2026) đọc theo
   **DDMMYY**. Nếu Boss muốn theo DDMMYY thì sửa một hàm là xong, nhưng mã túi cũ trong kho
   sẽ khác hệ với mã mới.

2. **Bình đang chứa sữa mà hút mẻ mới**: hiện app chỉ làm mờ chip và hỏi lại rồi vẫn cho chọn.
   Nếu Boss muốn chặn hẳn thì báo.

3. **Ngưỡng ghi chú dài khi chuyển đổi dữ liệu cũ** đang đặt là **30 ký tự** — dài hơn thì coi là
   mô tả thật, không biến thành tên bình. Sau khi chạy, Boss xem lại danh mục và xoá/gộp thủ công
   nếu có dòng chưa đúng ý.
