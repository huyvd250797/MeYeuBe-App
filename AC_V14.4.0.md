# AC V14.4.0 — Animation Refinements

Ngày phát hành: 2026-08-01
Phạm vi: Tinh chỉnh 5 điểm trong bộ Animation System V14.3.0 theo phản hồi thực tế. Không thêm/xoá dữ liệu người dùng, không sửa thân bất kỳ hàm vẽ nào. Chỉ `axInit` được sửa (đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`); mọi thứ còn lại là hàm `ax*` mới + CSS `ax*`.

---

## 1. Nguyên tắc

| Nguyên tắc | Thực hiện |
|---|---|
| Không phá vỡ hành vi cũ | Đối chiếu `BASELINE_LOCK_V14.3.0.json` (114 hàm): **113 hàm giữ nguyên hash**. Chỉ `axInit` đổi hash, đã khai báo lý do. |
| Vẫn một bộ chuyển động duy nhất | Dùng lại `--ax-fast/base/slow/ease/spring`. Không thêm biến thời lượng mới, mọi hiệu ứng vẫn ≤250ms. |
| Không đụng mã nguồn hàm cũ | Bộ điều khiển nhấn và replay Dashboard là listener + observer độc lập; chỉ ĐỌC/GHI class của riêng mình. |

---

## 2. Hạng mục 1 — Dashboard chạy lại số + thanh mỗi lần mở

**Yêu cầu:** Mỗi khi mở Dashboard, con số và thanh tiến trình ở "Chăm sóc hôm nay" chạy từ **0 → giá trị hiện tại**; mở lại app (reload) cũng chạy lại.

**Cách làm:**
- `axResetDashState(scope)` xoá mốc đã nhớ (`AX_STATE.counters`, `AX_STATE.lists`) của các ô số và thanh trong `#dashboard`, để lần quét kế tiếp coi như chưa từng thấy → chạy từ 0.
- `axReplayDashboard()` gọi reset rồi cho `axCountScan`/`axProgressScan` chạy ở khung hình kế tiếp. Có chặn 300ms tránh chạy trùng.
- `axInit` gắn:
  - MutationObserver trên trang `#home`: mỗi lần Home hiện lại (điều hướng về Dashboard) → replay.
  - MutationObserver trên `#splashScreen`: bản V14.3.0 chạy hiệu ứng lần đầu **trong lúc splash còn che 1 giây** nên người dùng không thấy; nay đợi splash tắt rồi mới replay.

**Tiêu chí nghiệm thu:**
- [x] Mở app: số chạy từ 0 lên giá trị thật **sau khi splash tắt** (không bị phí sau màn chờ).
- [x] Rời Dashboard rồi quay lại: số + thanh chạy lại từ 0.
- [x] Thanh tiến trình mục tiêu cũng chạy lại từ 0 tới đúng tỉ lệ thật.
- [x] Tắt hiệu ứng hoặc bật *Giảm chuyển động*: không chạy lại, hiện thẳng giá trị.

---

## 3. Hạng mục 2 — Nhấn đúng block, không kéo theo block cha

**Vấn đề cũ:** Card press dùng `:active`. Theo chuẩn CSS, `:active` áp lên **cả tổ tiên** của phần tử được chạm, nên nhấn một `.bcMetric` làm cả `.bcCard` (block cha) cùng thu nhỏ → nhìn như "cả block chăm sóc" nhúc nhích.

**Cách làm:**
- Bộ điều khiển `axPressInit()` (listener `pointerdown/move/up/cancel`) tìm block **gần điểm chạm nhất** bằng `closest(AX_PRESS_SEL)` và chỉ gắn `.axPressing` lên đúng phần tử đó.
- Các block cha (tổ tiên khớp `AX_PRESS_SEL`) được gắn `.axPressHost{transform:none!important}` để **không** scale theo — chặn cả các quy tắc `:active` cũ còn sót (ví dụ `.dashCarePanel:active`).
- Chạm vào nút / ô nhập / vùng vuốt (`AX_PRESS_SKIP`) thì để chúng tự phản hồi, không cho block cha nhấn theo.

**Đánh giá "khi nào chỉ element, khi nào cả block cha":** phần tử được nhấn = block khớp `AX_PRESS_SEL` gần điểm chạm nhất. Chạm vào một ô số bên trong → chỉ ô đó nhấn. Chạm vào vùng trống của panel (không trúng ô con) → chính panel là phần tử gần nhất → panel nhấn. Đúng theo trực giác.

**Tiêu chí nghiệm thu:**
- [x] Nhấn một ô "Chăm sóc hôm nay": chỉ ô đó thu ~97.5%, thẻ cha đứng yên.
- [x] Nhấn vùng trống của thẻ cha (không trúng ô con): thẻ cha nhấn.
- [x] Nhấn nút trong thẻ: chỉ nút phản hồi, thẻ không nhấn.

---

## 4. Hạng mục 3 — Cuộn thì không nhấp nháy hiệu ứng nhấn

**Yêu cầu:** Khi bấm để cuộn (chưa thả tay), không hiện hiệu ứng nhấn.

**Cách làm:** Sau `pointerdown` chờ **62ms**; nếu ngón tay đứng yên mới hiện nhấn (là CHẠM). Nếu di chuyển quá **10px** trong lúc chờ (bắt đầu cuộn) → huỷ, không hiện gì. Đã hiện rồi mà cuộn thì gỡ ngay. Listener đều `passive:true`, không bao giờ `preventDefault` nên không cản cuộn/vuốt sẵn có. Chạm nhanh (<62ms) vẫn thấy nhấn nhờ áp lúc `pointerup` và giữ tối thiểu 140ms.

**Tiêu chí nghiệm thu:**
- [x] Đặt tay lên thẻ rồi vuốt để cuộn: không có scale.
- [x] Chạm–thả tại chỗ: có scale nảy nhẹ.
- [x] Cuộn dọc/vuốt ngang (sửa/xoá) không bị chặn.

---

## 5. Hạng mục 4 — Modal/popup thấy rõ hiệu ứng mở/đóng

**Vấn đề cũ:** Biên độ quá nhẹ (scale .965, trượt 10px) nên khó thấy.

**Cách làm:** Tăng biên độ trong ngưỡng 150~250ms:
- `axCardIn`: từ `translateY(26px) scale(.94)` + fade → rõ hơn khi mở.
- `axCardOut`: trượt xuống `24px` + `scale(.955)` + fade khi đóng.
- `axSheetIn/Out` (bottom sheet): trượt `58~62px` cho thấy rõ trượt lên/xuống.
- `AX_DUR.exit` nâng 190→**220ms** để hiệu ứng ĐÓNG (CSS 200ms) chạy hết, không bị cắt.

**Tiêu chí nghiệm thu:**
- [x] Mở popup: rõ ràng trượt lên + phóng nhẹ + hiện dần.
- [x] Đóng popup: rõ ràng trượt xuống + mờ dần, không bị cắt ngang.
- [x] Bottom sheet (bảng Thêm) trượt từ dưới lên thấy rõ.

---

## 6. Hạng mục 5 — Haptic áp dụng đúng thiết lập và cảm nhận được

**Vấn đề cũ:** Rung chỉ bắn ở lưu/cảnh báo/xoá/hoàn tác. Trên Android, các nhịp này thường phát **sau** cử chỉ (async) nên bị trình duyệt bỏ do "hết user-gesture"; trên iPhone Safari không có API rung. Kết quả: người dùng "không thấy rung dù đã bật".

**Cách làm:**
- Rung nhẹ (`axHaptic('light')`) ngay trong cử chỉ `pointerup` khi CHẠM thật (không cuộn) vào phần tử bấm được (`AX_TAP_SEL`). Vì nằm trong cử chỉ người dùng nên `navigator.vibrate` đáng tin trên Android.
- Vẫn gate theo thiết lập: `axHaptic` đọc `axPrefs().haptic` — tắt thì im hoàn toàn, bật mới rung; chặn 140ms giữ nguyên để không rung dồn.
- iPhone Safari không hỗ trợ rung → tự bỏ qua, không lỗi (ghi rõ trong mô tả thiết lập).

**Tiêu chí nghiệm thu:**
- [x] Bật "Rung phản hồi": chạm nút/thẻ có rung nhẹ (máy hỗ trợ).
- [x] Tắt: không rung ở bất kỳ thao tác nào.
- [x] Cuộn: không rung (chỉ CHẠM mới rung).
- [x] Máy không hỗ trợ: không phát sinh lỗi.

---

## 7. Tương thích & quy trình

- `BASELINE_LOCK_V14.4.0.json`: 122 hàm (114 cũ + 8 hàm mới `axPress*`, `axResetDashState`, `axReplayDashboard`).
- `release_check.py`: `PREV_LOCK` → `BASELINE_LOCK_V14.3.0.json`; `INTENTIONAL_BASELINE_CHANGES={'axInit':…}`; bổ sung kiểm tra `.axPressing`, `.axPressHost`, `axPressInit()`, `axReplayDashboard()`, `AX_PRESS_SEL`, `axHaptic('light')`.
- Không thêm Rotate, không vượt 250ms, giữ nguyên bảng `--ax-fast/base/slow` (đúng 3 biến), stagger 36ms.
- Chỉ dùng chung khoá `localStorage meYeuBeAnimPref_v1` cho bật/tắt hiệu ứng và rung.
