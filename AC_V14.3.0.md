# AC V14.3.0 — Animation System

Ngày phát hành: 2026-08-01
Phạm vi: Nâng cấp toàn bộ chuyển động trong app thành một bộ thống nhất — mượt, nhanh, tự nhiên, không gây khó chịu. Ưu tiên cảm giác cao cấp giống Apple Health. Mọi hiệu ứng 150~250ms, chỉ dùng Fade · Slide · Scale · Spring.

---

## 1. Nguyên tắc nâng cấp

| Nguyên tắc | Thực hiện |
|---|---|
| Không phá vỡ hành vi cũ | Đối chiếu `BASELINE_LOCK_V14.2.0.json` (75 hàm): **cả 75 hàm giữ nguyên hash**, không hàm nào bị sửa. `INTENTIONAL_BASELINE_CHANGES` rỗng. |
| Không sửa hàm cũ để gắn animation | Mọi can thiệp đi qua `axWrap()` — bọc hàm lúc chạy, không đụng mã nguồn. Ví dụ `render`, `doShowPage`, `showToast`, `deleteCareEvent`… được bọc thêm hành vi mà thân hàm giữ nguyên từng ký tự. |
| Một bộ chuyển động duy nhất | Toàn bộ dùng chung biến `--ax-fast` (160ms), `--ax-base` (200ms), `--ax-slow` (240ms), `--ax-exit` (190ms) và hai đường cong `--ax-ease` / `--ax-spring`. Không có kiểu lẻ nào nằm ngoài bảng này. |
| Chỉ 4 kiểu hiệu ứng | Fade · Slide · Scale · Spring. Không dùng Rotate (trừ spinner tải), không nảy mạnh. |
| Tôn trọng người dùng | Có ô bật/tắt trong Thiết lập; tự tắt khi hệ điều hành bật *Giảm chuyển động* (`prefers-reduced-motion`). |
| Không tự tạo vòng lặp | Bộ điều khiển popup chỉ ĐỌC class của app (`show`/`hidden`/`open`) và chỉ GHI class của riêng mình (`axOpen`/`axClosing`), nên không thể kích hoạt lại chính nó. |

---

## 2. Hạng mục 1 — Counter Animation

**Áp dụng:** Dashboard, Thống kê, Báo cáo, các thẻ số (ml bú, số cữ, giờ ngủ, cân nặng, số lần…).

**Cách làm:** `axCountScan()` quét các ô số sau mỗi lần vẽ, nhớ giá trị lần trước theo một khoá định danh ổn định (`axKeyOf`), rồi `axCount()` chạy dần từ mốc cũ tới mốc mới bằng ease-out trong 240ms. Chỉ đổi đúng nút văn bản chứa số đầu tiên nên icon 🍼 và đơn vị `<small>ml</small>` giữ nguyên.

**Tiêu chí nghiệm thu:**
- [x] Số ml bú, số cữ, giờ ngủ… tăng dần chứ không nhảy thẳng.
- [x] Icon và đơn vị đứng yên, chỉ con số chạy.
- [x] Mốc giờ dạng `07:30`, `2h05` **không** bị hiểu nhầm là số đo, giữ nguyên.
- [x] Đồng hồ giây và Timer chăm sóc (tự đổi mỗi giây) không bị chạy số.
- [x] Lần đầu vào app: chạy từ 0 lên giá trị thật.

---

## 3. Hạng mục 2 — Progress Animation

**Cách làm:** `axProgressScan()` đặt thanh về mốc cũ rồi ở khung hình kế tiếp cho nó chạy sang mốc mới (`transition: width var(--ax-slow)`), áp cho thanh mục tiêu chăm sóc (`.bcMetric:before`) và thanh dùng kho sữa (`.milkProgressFill`). Khi đạt mục tiêu, thanh đổi sang màu hoàn thành và thẻ có một nhịp phóng `axGoalDone` rất nhẹ.

**Sửa lỗi kèm theo:** Quy tắc CSS cũ ở khối V9.x ghim cứng `.bcMetric:before{width:42%!important}` đặt SAU quy tắc dùng `var(--goal-progress)`, nên thanh tiến trình mục tiêu trên Dashboard **luôn hiển thị 42% bất kể dữ liệu thật**. Nay trả lại đúng biến `--goal-progress` do `renderDashboard()` ghi ra, kèm transition để chạy mượt.

**Tiêu chí nghiệm thu:**
- [x] Thanh chạy từ trái sang phải, không hiện sẵn ở đích.
- [x] Thanh mục tiêu phản ánh đúng dữ liệu thật (không còn kẹt 42%).
- [x] Đạt goal: đổi màu hoàn thành + nhịp phóng nhẹ.

---

## 4. Hạng mục 3 — Modal Spring Animation

**Áp dụng:** cả 21 popup / bottom sheet / dialog của app.

**Cách làm:** Đăng ký mỗi overlay một lần (`axRegisterOverlay`), gắn `.axOverlay`, nhận diện khung nội dung và loại bottom-sheet. Khi mở: lớp phủ fade, khung scale nhẹ + fade in (bottom sheet trượt từ dưới lên) bằng đường cong spring — chỉ vượt đích một chút, không nảy cứng. Khi đóng: fade out + trượt xuống; CSS giữ khung hiển thị thêm đúng 190ms để chạy hết hiệu ứng, đồng thời `pointer-events:none` để bộ khoá cuộn nền coi như đã đóng ngay.

**Tương thích ba kiểu bật/tắt popup của app:** `show` (đa số), `hidden` (hộp thoại Sổ sức khỏe 2.0 — được tạo động, có bộ theo dõi để đăng ký thêm), `open` (sheet Đo ồn / Đo sáng).

**Tiêu chí nghiệm thu:**
- [x] Mọi popup mở bằng scale + fade, đóng bằng fade + trượt xuống, không "pop" cứng.
- [x] Hộp thoại Sổ sức khỏe 2.0 (`.hb2Modal`) và bảng Thêm (`.moreSheet`) cũng có hiệu ứng.
- [x] Đóng rồi mở lại thật nhanh không bị kẹt trạng thái nửa chừng.
- [x] Bộ khoá cuộn nền V14.1.0 và khoá cuộn ngang V14.2.0 giữ nguyên hành vi.

---

## 5. Hạng mục 4 — Hero Fade

**Cách làm:** `axHeroFade()` so nội dung ba vùng động của thẻ Hero (trạng thái ngủ/thức, tên–tuổi, dòng cữ bú kế tiếp) với lần trước; chỉ vùng nào ĐỔI mới fade + scale nhẹ (`axSwap`), không vẽ lại cả thẻ.

**Tiêu chí nghiệm thu:**
- [x] Đổi 🟢 Đang thức → 🟣 Đang ngủ: chỉ dòng trạng thái chuyển mượt.
- [x] Không nháy toàn bộ Hero Card khi chỉ một dữ liệu đổi.

---

## 6. Hạng mục 5 + 8 — Timeline Fade & List Animation

**Cách làm:** `axStaggerScan()` so chữ ký nội dung của từng danh sách; khi đổi thì `axStaggerList()` cho các dòng fade + trượt lên **lần lượt**, cách nhau 36ms (nằm trong khoảng yêu cầu 30~50ms), tối đa 14 dòng đầu để danh sách dài không lê thê.

**Tiêu chí nghiệm thu:**
- [x] Thêm record mới: xuất hiện bằng fade in + slide up.
- [x] Danh sách không hiện đồng loạt mà nối tiếp nhau.
- [x] Xoá / Hoàn tác: danh sách vẽ lại mượt (fade lần lượt).
- [x] Khoảng cách giữa hai dòng: 36ms.

---

## 7. Hạng mục 6 — Card Press

**Cách làm:** Thẻ (`.card`, `.item`, `.bcMetric`, `.navItem`, `.careEvent`…) đặt `transform: scale(.98)` khi `:active`, thả tay dùng đường cong spring nên nảy nhẹ về vị trí cũ.

**Tiêu chí nghiệm thu:**
- [x] Nhấn thẻ: thu còn ~98%.
- [x] Thả tay: nảy nhẹ, không giật.

---

## 8. Hạng mục 7 — Button

**Cách làm:** Nút scale nhẹ khi nhấn (spring). Thêm hai tiện ích tuỳ chọn: `axBtnLoading(btn)` hiện spinner nhỏ ngay trong nút và khoá nút; `axBtnSuccess(btn)` hiện dấu ✓ rồi tự trả lại trạng thái. Cả hai không thay đổi luồng lưu sẵn có — chỉ là công cụ dùng khi cần.

**Tiêu chí nghiệm thu:**
- [x] Nhấn nút: scale nhẹ.
- [x] Có sẵn spinner trong nút và dấu tích thành công.

---

## 9. Hạng mục 9 — Page Transition

**Cách làm:** `axPageTransition()` được gọi khi `doShowPage()` chạy xong (qua `axWrap`), phát hiệu ứng fade + trượt lên 8px cho trang vừa hiện.

**Tiêu chí nghiệm thu:**
- [x] Chuyển màn hình bằng fade + slide, không cắt cứng.

---

## 10. Hạng mục 10 — Loading (Skeleton)

**Cách làm:** Trước đây `showPage()` chờ **500ms spinner phủ kín màn hình** rồi mới dựng trang. Nay với các trang nặng, `axShowPage()` hiện ngay Skeleton shimmer (khung xương mờ) rồi dựng nội dung ở khung hình kế tiếp — người dùng thấy phản hồi sau ~2 khung hình (~30ms) thay vì 500ms. Spinner toàn màn hình chỉ còn dùng cho tác vụ thực sự cần chờ (đồng bộ đám mây, khôi phục sao lưu).

**Tiêu chí nghiệm thu:**
- [x] Trang nặng (Thống kê, Timeline, Sổ sức khỏe, Tổng kết năm…) hiện Skeleton, không còn spinner phủ kín.
- [x] Skeleton biến mất mượt (fade) khi nội dung sẵn sàng.
- [x] Tắt hiệu ứng: quay lại hành vi chuyển trang cũ.

---

## 11. Hạng mục 11 — Haptic

**Cách làm:** `axHaptic(kind)` rung theo `navigator.vibrate` với mẫu riêng cho Success / Warning / Error / Delete / Undo. Có chặn 140ms để một thao tác (xoá → toast → undo bar) chỉ rung MỘT nhịp, không rung dồn. Máy không hỗ trợ (iPhone dùng Safari) tự bỏ qua, không lỗi.

**Gắn vào các mốc có sẵn (qua axWrap, không đổi hành vi):** `showToast` (success/warn/error), `udUndo` (undo), và nhóm xoá `deleteCareEvent`/`delAppointment`/`cancelMilkBag`/…

**Tiêu chí nghiệm thu:**
- [x] Lưu / cảnh báo / xoá / hoàn tác đều rung nhẹ nếu máy hỗ trợ.
- [x] Không rung dồn nhiều nhịp trong một thao tác.
- [x] Máy không hỗ trợ rung: không phát sinh lỗi.

---

## 12. Thống nhất & giới hạn

- [x] Chỉ dùng Fade · Slide · Scale · Spring. Không Rotate (trừ spinner), không Bounce mạnh.
- [x] Mọi hiệu ứng 150~250ms (bảng `--ax-*` đều ≤240ms).
- [x] Khoảng cách fade danh sách 36ms (trong 30~50ms).
- [x] Có ô bật/tắt hiệu ứng và rung trong Thiết lập.
- [x] Tự tắt khi hệ điều hành bật *Giảm chuyển động*.

---

## 13. Tương thích & quy trình

- Không thêm/xoá dữ liệu người dùng; module thuần giao diện. Tuỳ chọn bật/tắt lưu riêng ở `localStorage` khoá `meYeuBeAnimPref_v1`.
- `BASELINE_LOCK_V14.3.0.json`: 114 hàm (75 hàm cũ giữ nguyên hash + 39 hàm `ax*` mới).
- `release_check.py`: `PREV_LOCK` trỏ `BASELINE_LOCK_V14.2.0.json`; bổ sung kiểm tra CSS animation, biến thời lượng dùng chung, ràng buộc ≤250ms, khoảng cách stagger 30~50ms, chống lạm dụng Rotate, và bắt buộc có `axWrap` (không được sửa hàm cũ). `INTENTIONAL_BASELINE_CHANGES` rỗng.
