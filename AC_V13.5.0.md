# Acceptance Criteria — MeYeuBe V13.5.0

## 🔄 Chuyển sữa giữa bình và túi

Nguyên tắc xuyên suốt: **không sửa bản ghi hút sữa**. Mỗi lần chuyển tạo thêm một
giao dịch `Chuyển sữa` trong dòng thời gian và một mục mới trong Kho sữa.

---

## 1. Nguyên tắc dữ liệu

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 1.1 | Không sửa bản ghi hút sữa gốc | So sánh nguyên văn bản ghi hút trước và sau khi chuyển → giống hệt | ✅ |
| 1.2 | Không đổi tên dụng cụ của bản ghi cũ | Bình tím mập vẫn là Bình tím mập trong lần hút 08:00 | ✅ |
| 1.3 | Chỉ tạo thêm một giao dịch Chuyển sữa | Timeline có thêm đúng 1 dòng loại `transfer` | ✅ |
| 1.4 | Kho sữa tự cập nhật số lượng còn lại | Nguồn bị trừ, bên nhận được cộng, tổng không đổi | ✅ |
| 1.5 | Timeline hiển thị đủ lịch sử | 08:00 Hút · 09:00 Chuyển · 11:00 Bé bú đều còn nguyên | ✅ |

---

## 2. Nút thao tác trong Kho sữa

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 2.1 | Vuốt trái hiện 3 nút | ✏️ Sửa · 🔄 Chuyển · 🗑 Huỷ túi | ✅ |
| 2.2 | Bố cục 3 nút không tràn | Thẻ dùng lớp `trio`, độ rộng khớp 3 nút | ✅ |
| 2.3 | Túi đã hết sữa không có nút Chuyển | Trạng thái “Đã sử dụng hết” → chỉ còn nút Sửa | ✅ |
| 2.4 | Túi đã hết không mở được popup | Gọi trực tiếp cũng bị chặn kèm thông báo | ✅ |

---

## 3. Popup chuyển sữa

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 3.1 | Hiện đủ thông tin nguồn | Tên, dung tích ban đầu, còn lại, nơi bảo quản, hạn dùng | ✅ |
| 3.2 | Chọn được Bình hoặc Túi | Đổi loại thì danh sách đích đổi theo | ✅ |
| 3.3 | Danh sách đích lấy từ danh mục | Chỉ hiện mục đang dùng, đúng loại đã chọn | ✅ |
| 3.4 | Nhập được ít hơn lượng hiện có | 160ml → nhập 80ml | ✅ |
| 3.5 | Nút “Tất cả” điền nhanh toàn bộ | Bấm → điền đúng lượng còn lại | ✅ |
| 3.6 | Xem trước kết quả trước khi lưu | Hiện nguồn còn lại bao nhiêu, bên nhận được bao nhiêu | ✅ |
| 3.7 | Nhập quá lượng còn lại → báo ngay | Kho còn 100ml, nhập 150ml → cảnh báo trên popup | ✅ |
| 3.8 | Không cho lưu khi vượt lượng | Bấm Xác nhận → chặn, kho không đổi | ✅ |
| 3.9 | Không cho lưu khi chưa chọn đích | Bấm Xác nhận → chặn kèm thông báo | ✅ |
| 3.10 | Cảnh báo khi bình đích đang chứa sữa mẻ khác | Hỏi lại trước khi chuyển vào | ✅ |
| 3.11 | Popup khoá cuộn nền, đóng thì mở lại | `body.careModalOpen` bật/tắt đúng | ✅ |

---

## 4. Kết quả sau khi xác nhận

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 4.1 | Chuyển toàn bộ → nguồn về 0ml | 160ml → 0ml | ✅ |
| 4.2 | Chuyển toàn bộ → trạng thái “Đã chuyển hết” | Badge riêng trong Kho sữa | ✅ |
| 4.3 | Tạo mới đúng lượng đã chuyển | Túi Unimom 160ml | ✅ |
| 4.4 | Chuyển một phần → nguồn giữ phần còn lại | 160ml → còn 80ml, vẫn Đang bảo quản | ✅ |
| 4.5 | Dung tích ban đầu của nguồn không bị đổi | Vẫn là 160ml | ✅ |
| 4.6 | Giao dịch ghi đúng nguồn/đích/lượng/giờ | Kiểm tra bản ghi `transfer` | ✅ |

---

## 5. Chuyển nhiều lần

Ví dụ trong tài liệu: hút 160ml vào Bình tím → 09:00 chuyển sang Túi Unimom →
20:00 chuyển tiếp 60ml sang Bình Fatz.

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 5.1 | Túi Unimom còn 100ml | ✅ |
| 5.2 | Bình Fatz có 60ml | ✅ |
| 5.3 | Bình tím vẫn 0ml | ✅ |
| 5.4 | Có đúng 2 giao dịch chuyển sữa | ✅ |
| 5.5 | Tổng sữa trong kho không đổi (160ml) | ✅ |

---

## 6. Hạn dùng & an toàn thực phẩm

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 6.1 | Giữ nguyên nơi bảo quản → giữ nguyên hạn cũ | Không reset đồng hồ về 0 | ✅ |
| 6.2 | Đổi nơi bảo quản → tính lại theo nơi mới | Ngăn mát → Ngăn đông: hạn tính lại | ✅ |
| 6.3 | Cảnh báo khi hạn dùng bị kéo dài | Hiện cảnh báo kèm nhắc “sữa đã rã đông thì không được cấp đông lại” | ✅ |
| 6.4 | Rã đông (đông → mát) thì hạn ngắn lại | Hạn mới còn vài ngày, không giữ hạn 6 tháng | ✅ |
| 6.5 | Lưu đúng nơi bảo quản mới | Mục mới mang đúng nơi đã chọn | ✅ |

---

## 7. Truy vết vòng đời

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 7.1 | Túi mới đặt mã theo **giờ hút gốc** | Hút 23:30, chuyển lúc 09:00 → mã vẫn theo 23:30 | ✅ |
| 7.2 | Giữ mốc hút gốc trong dữ liệu | `originDate` / `originTimeFrom` | ✅ |
| 7.3 | Ghi rõ chuyển từ đâu | `transferFromName` | ✅ |
| 7.4 | Thẻ Kho sữa hiện dấu vết | Dòng “🔄 Chuyển từ Bình tím mập lúc …” | ✅ |
| 7.5 | Chuyển 2 lần cùng nguồn không trùng mã | Mã thứ hai được thêm hậu tố | ✅ |

---

## 8. Quy tắc khi Bé bú

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 8.1 | Chỉ dùng nơi đang thực sự chứa sữa | Bình tím 0ml không còn trong danh sách khả dụng | ✅ |
| 8.2 | Tự gắn đúng nơi có sữa | Bé bú 80ml → chọn Túi Unimom, không chọn Bình tím | ✅ |

---

## 9. Xoá & Hoàn tác

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 9.1 | Hoàn tác trả sữa về nguồn | 160ml quay lại Bình tím, trạng thái về Đang bảo quản | ✅ |
| 9.2 | Hoàn tác xoá mục đã tạo | Kho trở lại đúng như trước | ✅ |
| 9.3 | Xoá giao dịch cũng trả sữa về nguồn | Xoá từ timeline → kho phục hồi | ✅ |
| 9.4 | Chặn xoá khi sữa đã được bú một phần | Báo rõ lý do, không xoá | ✅ |
| 9.5 | Chặn xoá khi đã chuyển tiếp sang nơi khác | Báo rõ lý do, không xoá | ✅ |
| 9.6 | Giao dịch chuyển sữa không cho Sửa/Sao chép | Timeline chỉ hiện nút Xoá | ✅ |

---

## 10. Thống kê & hồi quy

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 10.1 | Chuyển sữa không tính là bé bú | `feedMl` = 0 | ✅ |
| 10.2 | Chuyển sữa không tính là hút sữa | `pumpMl` = 0 | ✅ |
| 10.3 | Tổng sữa đang bảo quản vẫn đúng | 160ml | ✅ |
| 10.4 | Không sửa hàm nào thuộc Baseline Lock | 26/26 khớp `BASELINE_LOCK_V13.4.0` | ✅ |
| 10.5 | V13.3.0 danh mục bình/túi còn nguyên | Module `mc*` bình thường | ✅ |
| 10.6 | V13.3.0 tự gắn túi còn nguyên | Module `ab*` bình thường | ✅ |
| 10.7 | V13.2.x Hoàn tác còn nguyên | Module `ud*` bình thường | ✅ |
| 10.8 | V12.2.x Tìm kiếm còn nguyên | Module `gs*` bình thường | ✅ |
| 10.9 | V13.0.0 Backup còn nguyên | Module `bk*` bình thường | ✅ |

---

## 11. Kết quả kiểm thử

Chạy trên **đúng code thật** (`index.html` + `app.js` nạp trong jsdom, không gõ lại logic):

```
[1] Chuyển toàn bộ                15/15 PASS
[2] Chuyển một phần                 4/4 PASS
[3] Chuyển nhiều lần                5/5 PASS
[4] Truy vết & đặt tên              5/5 PASS
[5] Hạn dùng                        7/7 PASS
[6] Ràng buộc & lỗi                 7/7 PASS
[7] Bé bú sau khi chuyển            3/3 PASS
[8] Xoá & Hoàn tác                  8/8 PASS
[9] Thống kê & hồi quy             13/13 PASS
────────────────────────────────────────────
TỔNG                              67/67 PASS

Chạy lại toàn bộ bộ test V13.3.0    94/94 PASS
```

`release_check.py` → **PASSED** · Baseline Lock **26/26** khớp.

---

## 12. Điểm cần Boss xác nhận

1. **Hạn dùng khi đổi nơi bảo quản.** Tài liệu không nói tới phần này nhưng nó ảnh hưởng
   trực tiếp tới an toàn của bé nên em phải tự quyết một hướng: **giữ nguyên nơi bảo quản
   thì giữ nguyên hạn cũ** (không reset đồng hồ — đây là 90% trường hợp, chia sữa sang bình
   khác cho bé bú); **đổi nơi bảo quản thì tính lại từ thời điểm chuyển**, kèm cảnh báo nếu
   hạn bị kéo dài. Nếu Boss muốn luôn giữ nguyên hạn gốc bất kể đổi nơi bảo quản thì báo.

2. **Bình đích đang chứa sữa của mẻ khác**: hiện app hỏi lại rồi vẫn cho chuyển, và tạo
   **một mục riêng** trong kho chứ không gộp chung — vì gộp sữa hai mẻ khác giờ hút sẽ làm
   sai hạn dùng. Kho sẽ hiện hai dòng cùng tên bình. Nếu Boss muốn chặn hẳn thì báo.

3. **Không cho Sửa giao dịch chuyển sữa** (chỉ cho Xoá rồi làm lại), vì sửa một giao dịch
   đã kéo theo cả chuỗi chuyển tiếp phía sau sẽ rất dễ sai dữ liệu.

---

## 13. V13.4.1 — Fix: bấm "Chuyển" không thấy giao diện chuyển sữa

Bộ test tái hiện (`test_fix_popup_chuyen_sua.js`) **fail 6/14 trên bản V13.4.0** và
**pass 14/14** sau khi sửa.

| # | Lỗi | Nguyên nhân | Cách sửa | Kết quả |
|---|-----|-------------|----------|---------|
| 13.1 | Bấm 🔄 Chuyển trong popup chi tiết Kho sữa thì không thấy gì | Popup Chuyển sữa để `z-index:120`, popup chi tiết Kho sữa là `135` → popup mở đúng nhưng **nằm dưới lớp phủ**, bị che hoàn toàn | Nâng `.tfOverlay` lên `z-index:166` — trên mọi popup khác (chi tiết 135, form ghi nhận 155, chọn túi 160, backup 162, mốc 165) và vẫn dưới Toast | ✅ |
| 13.2 | Vừa vuốt xong bấm ngay vào Chuyển thì không ăn | `tfOpen()` kiểm tra `__milkSwipeLock`. Khoá này sinh ra chỉ để chặn cú *chạm vào thẻ* sau khi vuốt; hai nút Sửa và Huỷ túi vốn không kiểm tra nó | Bỏ kiểm tra, đồng thời tự đóng thẻ đang vuốt khi mở popup | ✅ |
| 13.3 | Chuyển xong, danh sách phía sau vẫn hiện số cũ | `tfConfirm()` chỉ gọi `render()`, không vẽ lại popup chi tiết đang mở | Thêm `tfRefreshBehind()`, dùng đúng cách nút Huỷ túi đang làm | ✅ |
| 13.4 | Đóng popup làm nền cuộn được dù popup chi tiết còn mở | `tfClose()` gỡ `careModalOpen` vô điều kiện | Chỉ gỡ khi không còn popup nào khác đang mở (`tfOtherOverlayOpen()`) | ✅ |

### Kiểm thử bổ sung

```
[A] Xếp lớp popup                   3/3 PASS
[B] Bấm Chuyển trong popup chi tiết 5/5 PASS
[C] Vừa vuốt xong bấm ngay          1/1 PASS
[D] Popup phía sau cập nhật         3/3 PASS
[E] Không phá khoá cuộn nền         2/2 PASS
────────────────────────────────────────────
TỔNG                              14/14 PASS

Chạy lại bộ Chuyển sữa V13.4.0      67/67 PASS
Chạy lại bộ Bình/Túi V13.3.0        94/94 PASS
```

---

## 14. V13.4.3 — Chỉ hiện bình/túi đang ở trạng thái "Đang dùng"

**Quy tắc**: khác “Đang dùng” thì không hiện ở bất cứ đâu ngoài trang Danh mục. Không ngoại lệ.

| # | Tiêu chí | Cách kiểm tra | Kết quả |
|---|----------|---------------|---------|
| 14.1 | Form Hút sữa chỉ hiện mục Đang dùng | Danh mục 7 mục (3 dùng, 4 ẩn) → chỉ 3 chip | ✅ |
| 14.2 | Mục rác do chuyển đổi dữ liệu cũ biến mất | Không còn “… —> Túi 1 250726-2306” | ✅ |
| 14.3 | Popup Chuyển sữa, đích loại Bình | Chỉ bình Đang dùng | ✅ |
| 14.4 | Popup Chuyển sữa, đích loại Túi | Chỉ túi Đang dùng | ✅ |
| 14.5 | Chặn cả khi gọi thẳng vào mục đã ẩn | `tfPickTarget` / `mcPickPumpContainer` đều từ chối | ✅ |
| 14.6 | **Sửa bản ghi cũ cũng không có ngoại lệ** | Bản ghi gắn mục đã ẩn → mục đó vẫn không hiện trong danh sách | ✅ |
| 14.7 | Nhưng dữ liệu đã lưu không bị mất | `cContainerId` giữ nguyên giá trị cũ | ✅ |
| 14.8 | Có báo rõ để biết mà chọn lại | Dòng gợi ý nêu tên mục và trạng thái Tạm ẩn | ✅ |
| 14.9 | Không cho quay lại mục đã ẩn sau khi đã đổi | ✅ |
| 14.10 | Danh sách rỗng do bị ẩn → báo đúng lý do | Không nói nhầm “Chưa có bình/túi nào” | ✅ |
| 14.11 | Danh sách rỗng do chưa khai báo → vẫn báo “chưa có” | ✅ |
| 14.12 | Trang Danh mục vẫn liệt kê đầy đủ | Để còn bật lại được | ✅ |
| 14.13 | Thanh tóm tắt đếm đúng | “3 đang dùng · 4 tạm ẩn” | ✅ |
| 14.14 | Nút Tạm ẩn / Bật lại một chạm | Không phải mở form Sửa | ✅ |
| 14.15 | Ẩn xong biến mất khỏi form Hút sữa ngay | ✅ |
| 14.16 | Bộ lọc “Chỉ hiện đang dùng” hoạt động | Ghi nhớ lựa chọn giữa các lần mở | ✅ |
| 14.17 | Đang bật lọc mà bấm Tạm ẩn vẫn đúng mục | Không lệch chỉ số | ✅ |
| 14.18 | Đang bật lọc mà bấm Sửa vẫn đúng mục | ✅ |
| 14.19 | Đang bật lọc mà bấm Xoá vẫn đúng mục | Không xoá nhầm mục khác | ✅ |
| 14.20 | Hút sữa và Chuyển sữa vẫn chạy bình thường | ✅ |

```
[1] Màn hình Hút sữa                6/6 PASS
[2] Popup Chuyển sữa                6/6 PASS
[3] Không có ngoại lệ khi Sửa       5/5 PASS
[4] Bật/tắt nhanh trong Danh mục   16/16 PASS
[5] Hồi quy                         5/5 PASS
────────────────────────────────────────────
TỔNG                              38/38 PASS

Chạy lại 3 bộ test cũ    14/14 · 67/67 · 94/94 PASS
```

---

## 15. V13.5.0 — Hiệu chỉnh giao diện (phương án A)

### 15.1 Thẻ trong Kho sữa

| # | Tiêu chí | Kết quả |
|---|----------|---------|
| 15.1.1 | Số ml chỉ xuất hiện đúng một lần trên thẻ | ✅ |
| 15.1.2 | Không còn ô “Dung tích” trùng lặp | ✅ |
| 15.1.3 | Không còn ô “Vị trí” riêng, đã gộp vào dòng meta | ✅ |
| 15.1.4 | Nơi bảo quản vẫn hiện đầy đủ ở dòng meta | ✅ |
| 15.1.5 | Hàng tiêu đề chứa thời gian còn lại | ✅ |
| 15.1.6 | Hàng tiêu đề không còn số ml | ✅ |
| 15.1.7 | Số ml nằm ở dòng riêng bên dưới | ✅ |
| 15.1.8 | Dòng ml kèm nhãn loại Bình / Túi đúng | ✅ |
| 15.1.9 | Mục loại Túi hiện nhãn Túi, không gọi nhầm là bình | ✅ |
| 15.1.10 | Có ghi chú thì hiện lưới ghi chú, không có thì bỏ hẳn cho gọn | ✅ |
| 15.1.11 | Ô tổng quan đếm tách “N bình · M túi” | ✅ |
| 15.1.12 | Tiêu đề đổi thành “Danh sách bình / túi” | ✅ |

### 15.2 Chi tiết Bé bú

| # | Tiêu chí | Kết quả |
|---|----------|---------|
| 15.2.1 | Bỏ chữ “Túi” ghi cứng trước tên | ✅ |
| 15.2.2 | Nguồn là bình → hiện nhãn Bình | ✅ |
| 15.2.3 | Nguồn là túi → hiện nhãn Túi | ✅ |
| 15.2.4 | Số ml của cữ bú được in đậm | ✅ |
| 15.2.5 | Bú trực tiếp không có ml thì không in đậm nhầm | ✅ |

### 15.3 Form Thay tã

| # | Tiêu chí | Kết quả |
|---|----------|---------|
| 15.3.1 | Có ô số lượng dạng − / + | ✅ |
| 15.3.2 | Bỏ hẳn dãy nút 1 / 2 / 3 / ＋ cũ | ✅ |
| 15.3.3 | Mặc định là 1 | ✅ |
| 15.3.4 | Nút − bị khoá ở mức 1 | ✅ |
| 15.3.5 | Nút ＋ bị khoá ở mức 3 | ✅ |
| 15.3.6 | Không vượt quá 3, không xuống dưới 1 | ✅ |
| 15.3.7 | Nhập thẳng số lớn cũng bị kẹp về 3 | ✅ |
| 15.3.8 | Có dòng nhắc giới hạn “tã · tối đa 3” | ✅ |
| 15.3.9 | Lưu đúng số lượng và loại tã | ✅ |
| 15.3.10 | Tã bẩn vẫn tự cộng đi tè và đi phân | ✅ |
| 15.3.11 | Bản ghi cũ số lượng > 3 vẫn mở Sửa được | ✅ |

```
[1] Thẻ kho sữa                    17/17 PASS
[2] Chi tiết Bé bú                   7/7 PASS
[3] Form thay tã                   18/18 PASS
[4] Hồi quy                          9/9 PASS
────────────────────────────────────────────
TỔNG                               51/51 PASS

Chạy lại 4 bộ test cũ   38/38 · 14/14 · 67/67 · 94/94 PASS
```
