# AC V14.4.2 — Dashboard Replay Fix

Ngày phát hành: 2026-08-01
Phạm vi: Sửa lỗi các ô "Chăm sóc hôm nay" và thanh tiến trình rơi về 0 khi mở lại Dashboard (bấm **Trang chủ** hoặc mở lại app). Chỉ đụng vào module hiệu ứng `ax*`, không sửa hàm vẽ, không đụng dữ liệu người dùng. So với `BASELINE_LOCK_V14.4.1.json`: **118/122 hàm giữ nguyên hash**, 4 hàm đổi đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`.

---

## 1. Lỗi: mở lại Home thì mọi thông số về 0 và nằm im

**Hiện tượng người dùng báo:** Lần mở app đầu tiên, số liệu và thanh tiến trình chạy đúng. Nhưng bấm **Trang chủ** (hoặc mở lại lần 2) thì tất cả ô về **0** và thanh tiến trình về **0%**, phải mở lại thêm một lần nữa mới thấy số thật.

**Nguyên nhân (đua giữa hai lượt quét trong cùng một lần mở Home):**

Mỗi lần Home hiện lại, có **hai** nguồn cùng yêu cầu chạy hiệu ứng, không biết đến nhau:

| Thứ tự | Nguồn | Việc làm |
|---|---|---|
| 1 | `MutationObserver` trên `#home` → `axReplayDashboard()` | Xoá mốc đã nhớ, đặt lịch quét ở khung hình kế tiếp (`rAF`) |
| 2 | `axPageTransition()` (bọc sau `doShowPage`) → `axAfterRender()` | Quét ngay ở microtask, **bắt đầu chạy số từ 0** và **ghim thanh về 0%** |

Microtask (2) chạy **trước** `rAF` (1). Khi (1) chạy tới nơi, màn hình đang hiển thị `0 ml` và `width:0%` — đó là **giá trị tạm của hiệu ứng đang chạy**, nhưng lượt quét lại đọc nó như **số liệu mới**:

- Bộ đếm: `prev = 310`, đọc được `val = 0` → coi là "số liệu vừa đổi thành 0" → chạy ngược `310 → 0` và **dừng ở 0**.
- Thanh tiến trình: đích được chốt lại thành `0%` → chạy về `0%` và **nằm im**.

Lần mở sau chỉ khôi phục được khi hàm vẽ dựng lại DOM, nên người dùng thấy phải "mở thêm một lần nữa".

**Cách sửa (không đổi kiến trúc, không sửa hàm vẽ):** phần tử tự nhớ **đích thật** của lượt hiệu ứng đang chạy; lượt quét sau đọc đích đó thay vì đọc con số đang nhảy.

- `axCount()` — ghi `__axCountTo` (đích), `__axCountTxt` (chữ hiệu ứng vừa ghi ra), `__axCountBusy` (đang chạy) và `__axCountTok` (mã lượt) lên phần tử. Lượt chạy mới tăng mã lượt, vòng `rAF` cũ tự thoát → không còn hai vòng cùng ghi vào một ô.
- `axCountScan()` — nếu ô đang chạy **và** chữ trên màn hình đúng bằng thứ hiệu ứng vừa ghi ra thì lấy `__axCountTo` làm giá trị so sánh. Nếu chữ khác đi (hàm vẽ vừa cập nhật số liệu thật) thì vẫn tin màn hình như cũ.
- `axProgressStage()` — ghi `__axProgPend[mode] = {target, staged}`. Khi đọc thấy thanh đang nằm đúng ở mốc xuất phát đã ghim thì dùng lại `target` thật thay vì `0%`.
- `axProgressScan()` — xoá dấu chờ ngay khi đã áp đích, để lượt sau đọc trực tiếp từ DOM.

**Tiêu chí nghiệm thu:**
- [x] Bấm **Trang chủ** từ trang khác: mọi ô "Chăm sóc hôm nay" chạy `0 → giá trị thật` rồi **dừng đúng ở giá trị thật** (310 ml, 6 cữ, 1h16…).
- [x] Thanh tiến trình chạy `0% → mốc thật` và giữ nguyên; ô đạt mục tiêu vẫn đổi màu hoàn thành kèm nhịp phóng nhẹ.
- [x] Mở lại app lần 2, lần 3…: kết quả giống lần 1, không có lần nào hiển thị 0.
- [x] Đang chạy hiệu ứng mà số liệu thật đổi (ghi nhận cữ bú mới): số chạy tiếp tới **giá trị mới**, không bị kẹt ở giá trị cũ.
- [x] Mốc giờ (`2h05`, `07:30`) và Timer vẫn không bị chạy số như trước.
- [x] Tắt "Hiệu ứng chuyển động" hoặc bật *Giảm chuyển động*: số và thanh hiện thẳng giá trị thật, không có 0 trung gian.

---

## 2. Không phá vỡ hành vi cũ

- 4 hàm đổi hash đều thuộc module `ax*` (thuần giao diện): `axCount`, `axCountScan`, `axProgressStage`, `axProgressScan`. 118 hàm còn lại giữ nguyên hash so với `BASELINE_LOCK_V14.4.1.json`.
- Không sửa thân bất kỳ hàm vẽ nào; mọi can thiệp vẫn đi qua `axWrap`.
- Không thêm/xoá dữ liệu người dùng, không đổi cấu trúc lưu trữ, không đổi bảng thời lượng (`--ax-fast/base/slow`), mọi hiệu ứng vẫn ≤ 250ms, không thêm Rotate.
