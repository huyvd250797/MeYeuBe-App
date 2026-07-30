# AC V14.1.0 — Khoá cuộn popup + gỡ Sổ sức khỏe V1

Ngày phát hành: 2026-07-30
Phạm vi: 3 hạng mục theo yêu cầu — (1) khoá cuộn nền khi mở popup/modal, (2) gỡ Sổ sức khỏe phiên bản đầu tiên, (3) bổ sung module Sổ sức khỏe vào bảng **Thêm** ở thanh dưới.

---

## 1. Nguyên tắc nâng cấp

| Nguyên tắc | Thực hiện |
|---|---|
| Không phá vỡ hành vi cũ | Không sửa bất kỳ hàm nào trong `BASELINE_LOCK_V14.0.0.json` (54 hàm, đối chiếu hash: 0 hàm thay đổi) |
| Không mất dữ liệu người dùng | `db.healthBook` giữ nguyên — chỉ gỡ giao diện V1, không gỡ dữ liệu |
| Sửa gốc, không vá điểm | Khoá cuộn dò theo biểu hiện thật của phần tử, không dò theo quy ước đặt tên class |
| Không mất cấu hình cũ | Nút thanh dưới trỏ `healthBookView` được tự chuyển sang `healthBook2` |

---

## 2. Hạng mục 1 — Mở popup/modal thì chỉ cuộn bên trong

### 2.1 Nguyên nhân gốc
Bộ khoá cuộn dùng chung của V12.0 nhận diện popup bằng một câu truy vấn duy nhất:

```js
document.querySelector('[class*="Overlay"].show')
```

Cách này phụ thuộc vào quy ước đặt tên. Các popup **không** theo quy ước đó không bao giờ được khoá:

| Popup | Lớp thực tế | Vì sao lọt |
|---|---|---|
| Toàn bộ hộp thoại Sổ sức khỏe 2.0 | `.hb2Modal` + lớp `hidden` | Tên không chứa `Overlay`, đóng/mở bằng `hidden` chứ không phải `show` |
| Bảng **Thêm** ở thanh dưới | `.moreSheet.show` | Tên không chứa `Overlay` |
| Sheet công cụ (đo ồn, streak…) | `.nmSheet`, `.streakSheet` | Tên không chứa `Overlay` |

Đây chính là lỗi người dùng gặp: mở hộp thoại trong Sổ sức khỏe 2.0 thì nền vẫn cuộn được.

### 2.2 Cách xử lý
Đổi sang nhận diện theo **biểu hiện thật** của phần tử, không theo tên:

- `position: fixed`, và
- đang hiển thị (`display ≠ none`, `visibility ≠ hidden`, `opacity ≥ 0.05`, `pointer-events ≠ none`), và
- phủ ≥ 85% chiều ngang và ≥ 60% chiều dọc màn hình.

Loại trừ `document.body` và `document.documentElement` (body mang class `careModalOpen` — chứa chữ "Modal" — và đang `position:fixed` do chính cơ chế khoá, nếu không loại sẽ tự dò trúng chính mình).

### 2.3 Tiêu chí nghiệm thu
- [x] Mở bất kỳ hộp thoại nào của Sổ sức khỏe 2.0 (Thêm thành viên, Thêm mũi tiêm, Khám bệnh, Thuốc, Xét nghiệm, Thêm nhanh, Đổi tình trạng, Sửa hồ sơ…) → nền **không** cuộn được, chỉ cuộn trong hộp thoại.
- [x] Mở bảng **Thêm** ở thanh dưới → nền không cuộn được.
- [x] Các popup vốn đã khoá đúng từ trước (chi tiết chăm sóc, chi tiết cột mốc, xem ảnh, streak, tìm kiếm, sao lưu…) giữ nguyên hành vi.
- [x] Mở popup khi đang cuộn giữa trang → trang nền **không** nhảy về đầu.
- [x] Đóng popup → trả về đúng vị trí cuộn trước đó.
- [x] Cuộn hết nội dung trong popup → không "kéo lây" ra trang nền (`overscroll-behavior: contain`).
- [x] Popup thêm mới về sau tự động được khoá, không cần khai báo thêm.
- [x] Lớp phủ mờ của menu bên trái (`.drawerOverlay`, luôn tồn tại nhưng `opacity:0` khi đóng) không bị nhận nhầm là popup đang mở.

---

## 3. Hạng mục 2 — Gỡ Sổ sức khỏe phiên bản đầu tiên

### 3.1 Đã gỡ
| Loại | Đối tượng |
|---|---|
| Trang | `#healthBook` (Thêm sổ sức khỏe), `#healthBookView` (Xem sổ sức khỏe) |
| Hàm CRUD | `saveHealthBook`, `editHealthBook`, `resetHealthBookForm`, `healthBookSnapshot` |
| Hàm hiển thị | `healthBookIdentityHtml`, `healthHistoryHtml`, `healthBookBlockHtml`, `renderHealthBookView` |
| Editor vaccine cũ | `addHealthVaccineRow`, `removeHealthVaccineRow`, `setHealthVaccineRows`, `getHealthVaccineRows`, `vaccineSummary`, `vaccineListHtml` |
| Menu | `toggleHealthBookMenu`, `openHealthBookMenu`, khối `#healthBookParent` + `#healthBookSubNav` |
| Lời gọi còn sót | nhánh `healthBook` trong `itemActions`, `renderHealthBookView(db)` và `renderList('healthBookList', …)` trong `render()`, ô ngày `hbDate`, điều hướng V1 trong `doShowPage` |

Menu bên trái: ba mục con gộp thành một mục **Sổ sức khỏe** trỏ thẳng `healthBook2`.

### 3.2 Dữ liệu
- `db.healthBook` **không bị xoá**. Lý do: đây vẫn là nguồn cho migration một lần sang `db.hb`; người dùng chưa mở app kể từ V14.0.0 sẽ mất hồ sơ nếu xoá. Dữ liệu vẫn có trong sao lưu, xuất file và đồng bộ đám mây.
- `normalize()` giữ nguyên phần chuẩn hoá `db.healthBook`; `hb2Normalize` (thuộc Baseline Lock) không đổi.

### 3.3 Cột mốc "Mũi tiêm đầu tiên"
V1 bị gỡ nghĩa là không còn bản ghi `db.healthBook` mới, nên cột mốc này sẽ "chết" nếu không đổi nguồn. Đã bổ sung `vaccineDatesOfBaby(db)`:
- đọc mũi tiêm từ `db.hb.members` có `rel = 'Con'`, lấy mũi có ngày và trạng thái *Đã tiêm*;
- đồng thời vẫn đọc `db.healthBook` cũ để không mất cột mốc đã sinh trước đây;
- `autoMilestoneKeysNow` bổ sung `hb` vào bản sao rỗng, nếu không cột mốc vừa sinh sẽ bị cơ chế rút gọn tự động gỡ ngay.

`checkVaccineMilestones` và `autoMilestoneKeysNow` đều **không** nằm trong Baseline Lock nên được phép sửa. `checkAutoMilestones`, `addMilestone`, `milestoneExists` (có trong lock) giữ nguyên.

### 3.4 Tiêu chí nghiệm thu
- [x] Không còn lối vào nào dẫn tới trang V1 (menu trái, bảng Thêm, thanh dưới, nút trong trang).
- [x] Dữ liệu sổ sức khỏe cũ vẫn hiện đủ trong hồ sơ 2.0 sau migration.
- [x] Sao lưu / khôi phục / xuất file vẫn chứa `healthBook` như cũ.
- [x] Cột mốc "Mũi tiêm đầu tiên" sinh được từ mũi tiêm nhập trong Sổ sức khỏe 2.0.
- [x] Cột mốc đã sinh từ dữ liệu V1 cũ không bị gỡ mất.

---

## 4. Hạng mục 3 — Module Sổ sức khỏe trong bảng **Thêm** ở thanh dưới

- [x] Mục **🩺 Sổ sức khỏe · Hồ sơ riêng từng thành viên** → mở module 2.0.
- [x] Bổ sung mục **➕ Ghi nhận sức khỏe · Đo, tiêm, khám, thuốc, xét nghiệm** → mở module 2.0 rồi bật thẳng hộp Thêm nhanh.
- [x] Tuỳ chọn thanh dưới đổi `healthBookView` → `healthBook2`; cấu hình cũ của người dùng được `migrateBottomNavId` chuyển tự động nên không mất nút.

---

## 5. Kết quả kiểm thử

| Hạng mục | Kết quả |
|---|---|
| `node --check app.js` / `sw.js` | PASS |
| `release_check.py` | PASS |
| Baseline Lock vs V14.0.0 (54 hàm) | PASS — 0 hàm bị thay đổi hoặc xoá |
| Không còn tham chiếu chết tới hàm/ID V1 | PASS |
| Đồng bộ version 14.1.0 (5 file) | PASS |
