# AC V14.4.1 — iOS-Smooth Tuning

Ngày phát hành: 2026-08-01
Phạm vi: Hiệu chỉnh cảm giác chuyển động cho mượt kiểu iPhone và làm rõ hiệu ứng nhấn trên từng khối chăm sóc. Không thêm/xoá dữ liệu, không đổi cấu trúc. So với `BASELINE_LOCK_V14.4.0.json`, chỉ **`axEaseOut`** đổi hash (đã khai báo); 121 hàm còn lại giữ nguyên.

---

## 1. Mượt như iPhone — hiệu chỉnh đường cong & thời lượng

**Thay đổi:**
- `--ax-ease` → `cubic-bezier(.22,1,.36,1)` (easeOutQuint): giảm tốc mượt, "trôi" nhẹ về đích thay vì dừng gấp — đặc trưng chuyển động iOS.
- `--ax-spring` → `cubic-bezier(.34,1.28,.64,1)`: dịu hơn bản trước (vượt đích ít hơn), pop nhẹ nhàng không giật.
- `--ax-slow` 0.24s → **0.25s** (kịch trần cho phép) để popup mở thong thả hơn một chút.
- `--ax-fast` 0.16s → **0.14s**: nút phản hồi tức thì hơn.
- Bộ đếm số dùng `axEaseOut` chuyển từ easeOutCubic sang **easeOutQuint** để con số chạy mượt, cùng ngôn ngữ với CSS.

**Tiêu chí nghiệm thu:**
- [x] Mở/đóng popup, chuyển trang: giảm tốc mượt, không khựng ở cuối.
- [x] Spring không nảy quá đà; cảm giác "cao cấp", nhẹ.
- [x] Số ở Dashboard/Thống kê chạy mượt, chậm dần tự nhiên về đích.
- [x] Mọi hiệu ứng vẫn ≤ 250ms; vẫn đúng 3 biến `--ax-fast/base/slow`; không thêm Rotate.

---

## 2. Nhấn khối chăm sóc — thấy rõ, đúng khối được bấm

**Vấn đề:** Bấm một ô "Chăm sóc hôm nay" sẽ mở ngay popup chi tiết đè lên Dashboard. Ở bản trước, hiệu ứng nhấn áp sau 62ms rồi mới bắt đầu transition 200ms, nên **lúc thả tay (popup mở) scale mới đi được ~1/3** → gần như không kịp thấy.

**Cách làm:**
- Hạ độ trễ áp hiệu ứng nhấn 62ms → **24ms** (nhấn gần như tức thì khi ngón tay chạm) và dùng transition riêng `--ax-press` **0.11s** — đủ nhanh để ô lún xuống **trước khi** popup mở đè lên.
- Tăng biên độ lún: scale **0.975 → 0.96** cho thấy rõ.
- Vẫn chỉ khối **gần điểm chạm nhất** được nhấn (đúng khối bấm), block cha vẫn bị chặn scale (`.axPressHost`).
- Vẫn huỷ hiệu ứng khi ngón tay bắt đầu cuộn (di > 10px); độ trễ 24ms vừa đủ để cuộn nhanh không nhấp nháy.

**Tiêu chí nghiệm thu:**
- [x] Chạm một ô chăm sóc: ô đó lún rõ (0.96) **ngay khi chạm**, thấy được trước khi popup mở.
- [x] Chỉ đúng ô được chạm lún; thẻ cha và ô khác đứng yên.
- [x] Thả tay: bật nhẹ trở lại (spring) rồi popup hiện.
- [x] Đặt tay lên ô rồi vuốt để cuộn: không nhấp nháy hiệu ứng nhấn.
- [x] Tắt hiệu ứng / Giảm chuyển động: không lún.

---

## 3. Tương thích & quy trình

- `BASELINE_LOCK_V14.4.1.json`: 122 hàm; chỉ `axEaseOut` đổi hash so với V14.4.0.
- `release_check.py`: `PREV_LOCK` → `BASELINE_LOCK_V14.4.0.json`; `INTENTIONAL_BASELINE_CHANGES={'axEaseOut':…}`; đồng bộ version 14.4.1.
- Thêm biến `--ax-press` (0.11s) — KHÔNG nằm trong bộ `--ax-fast/base/slow` nên vẫn giữ nguyên "đúng 3 biến thời lượng dùng chung".
- Module thuần giao diện; dữ liệu người dùng và tuỳ chọn bật/tắt (`localStorage meYeuBeAnimPref_v1`) không đổi.
