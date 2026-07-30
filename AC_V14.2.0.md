# AC V14.2.0 — Sửa cuộn ngang popup, xuất báo cáo, hạn dùng khi chuyển sữa + gỡ Nhật ký & Sức khỏe mẹ

Ngày phát hành: 2026-07-31
Phạm vi: 6 hạng mục theo yêu cầu — (1) popup chỉ cuộn dọc, (2) xuất báo cáo tách riêng và đóng được, (3) tự cập nhật hạn dùng khi chuyển sữa, (4) gỡ Sức khỏe mẹ, (5) menu trái đưa dòng phiên bản xuống sát thanh dưới, (6) gỡ module Nhật ký.

---

## 1. Nguyên tắc nâng cấp

| Nguyên tắc | Thực hiện |
|---|---|
| Không phá vỡ hành vi cũ | Đối chiếu `BASELINE_LOCK_V14.1.0.json` (61 hàm): **1 hàm đổi có khai báo** (`hb2ExportProfile`), 60 hàm còn lại giữ nguyên hash |
| Thay đổi hàm bị khoá phải công khai | Bổ sung cơ chế `INTENTIONAL_BASELINE_CHANGES` trong `release_check.py`: hàm bị khoá chỉ được đổi khi khai báo kèm lý do; hàm không khai báo mà đổi vẫn báo lỗi như cũ |
| Không mất dữ liệu người dùng | `db.diary`, `db.diaryTypes`, `db.mom` giữ nguyên — chỉ gỡ giao diện, không gỡ dữ liệu |
| Sửa gốc, không vá điểm | Khoá cuộn ngang áp cho **mọi** popup chứ không riêng hộp thoại bị báo lỗi |
| Không mất cấu hình cũ | Nút thanh dưới trỏ `diaryBook` / `health` được `migrateBottomNavId` tự chuyển sang module thay thế |

---

## 2. Hạng mục 1 — Popup/modal chỉ cuộn dọc, không kéo ngang

### 2.1 Nguyên nhân gốc
Khung hộp thoại khai báo:

```css
.hb2ModalCard{ max-height:90vh; overflow-y:auto; }
```

`overflow-x` để mặc định (`visible`). Theo CSS, khi một trục đặt `auto` còn trục kia là `visible` thì trình duyệt **tự nâng trục còn lại thành `auto`**. Nghĩa là khung luôn sẵn sàng cuộn ngang; chỉ cần một phần tử con rộng hơn khung là kéo ngang được.

Phần tử gây tràn: các ô `input[type=date]` / `type=time` trên iOS có **bề rộng tối thiểu nội tại** theo định dạng ngày giờ, `width:100%` không ép nhỏ lại được. Hộp thoại **Thêm mũi tiêm** có ô *Ngày tiêm*, hộp **Thêm nhanh** có ô ngày — đúng hai chỗ người dùng báo lỗi.

### 2.2 Cách xử lý
Chốt cả hai đầu, không vá riêng một hộp thoại:

- Khoá trục ngang ở khung: `overflow-x:hidden` cho toàn bộ panel popup (`.hb2ModalCard`, `.moreSheetPanel`, `.careFormModalBody`, `.careDetailModalContent`, `.bkSheet`, `.streakSheetBody`, `.smartAlertModalBody`, `.notificationModal`, `.milkBagPickerModal`, `.nmSheetPanel`, `.tfSheet`, `.tfBody`, `.hb2ReportCard`).
- Chỉ nhận thao tác cuộn dọc: `touch-action:pan-y`.
- Ép nội dung không tràn: `.hb2ModalCard *{max-width:100%}`; ô nhập trong hộp thoại thêm `min-width:0`; riêng `input[type=date|time|datetime-local]` thêm `min-width:0;max-width:100%;box-sizing:border-box` để bỏ bề rộng tối thiểu nội tại.
- `hb2Modal()` đặt lại `scrollTop=0; scrollLeft=0` mỗi lần mở, không giữ vị trí cuộn của lần trước.

### 2.3 Tiêu chí nghiệm thu
- [x] Mở **Thêm mũi tiêm** → không kéo ngang được, chỉ cuộn dọc.
- [x] Mở **Thêm nhanh** (đo, tiêm, khám, thuốc, xét nghiệm, ghi chú) → không kéo ngang được.
- [x] Các hộp thoại còn lại của Sổ sức khỏe 2.0 (Thêm thành viên, Khám bệnh, Thuốc, Xét nghiệm, Sửa hồ sơ) → không kéo ngang được.
- [x] Bảng **Thêm** ở thanh dưới, popup Chuyển sữa, chi tiết chăm sóc, sao lưu, tìm kiếm → không kéo ngang được.
- [x] Cuộn dọc trong popup vẫn mượt; khoá cuộn nền của V14.1.0 giữ nguyên hành vi.
- [x] Ô ngày/giờ vẫn bấm mở được bộ chọn ngày của hệ điều hành.

---

## 3. Hạng mục 2 — Xuất báo cáo tách riêng và đóng được

### 3.1 Nguyên nhân gốc
`hb2ExportProfile()` dựng HTML báo cáo rồi mở bằng:

```js
var w=window.open('','_blank');
w.document.write(html); w.document.close();
setTimeout(function(){w.print()},400);
```

Trên trình duyệt máy tính, tab mới có thanh địa chỉ và nút đóng nên không sao. Nhưng khi app chạy dạng **PWA** (đã Thêm vào màn hình chính), cửa sổ mở ra **không có thanh điều hướng, không có nút đóng, không có nút Back** — người dùng bị kẹt ở màn hình mẫu đúng như báo cáo.

### 3.2 Cách xử lý
Báo cáo hiển thị trong một popup **tách riêng ngay trong app**:

- `#hb2ReportOverlay` — lớp phủ `position:fixed; inset:0`, bấm ra ngoài để đóng.
- Đầu popup: tiêu đề `📄 Báo cáo sức khỏe · <tên thành viên>` + nút **✕**.
- Thân popup: `<iframe>` nạp nội dung báo cáo bằng `srcdoc` — giữ nguyên 100% bố cục và CSS của bản in cũ, không viết lại nội dung.
- Chân popup: nút **🖨 In / Lưu PDF** (`hb2PrintReport()` in thẳng khung nội dung, vẫn ở trong app) và nút **Đóng**.
- Đóng popup thì `srcdoc` được nhả để không giữ bảng/ảnh nặng trong bộ nhớ.
- Popup nằm trong `[class*="Overlay"]` và phủ kín màn hình nên **tự được bộ khoá cuộn V14.1.0 nhận diện**, không cần khai báo thêm.

### 3.3 Thay đổi Baseline Lock có chủ ý
`hb2ExportProfile` nằm trong `BASELINE_LOCK_V14.1.0.json`. Không thể sửa lỗi này mà không đụng vào nó, và nhân đôi phần dựng HTML chỉ để né Baseline Lock sẽ tạo hai bản báo cáo lệch nhau về sau. Vì vậy bổ sung cơ chế khai báo:

```python
INTENTIONAL_BASELINE_CHANGES={
 'hb2ExportProfile':"V14.2.0 - thay window.open ... bang popup xem truoc tach rieng co nut dong",
}
```

`release_check.py` in ra mục *THAY ĐỔI CÓ CHỦ Ý* thay vì báo lỗi, và **chỉ** với hàm được khai báo. Khai báo phải xoá sạch khi bump sang bản kế tiếp (đã có kiểm tra khai báo thừa).

Phần dựng nội dung báo cáo **không đổi một ký tự** — chỉ đổi cách hiển thị.

### 3.4 Tiêu chí nghiệm thu
- [x] Bấm **Xuất báo cáo (in / PDF)** ở trang Báo cáo → hiện popup xem trước, không rời khỏi app.
- [x] Bấm **✕**, bấm **Đóng**, hoặc chạm ra ngoài → đóng được, quay lại đúng trang đang xem.
- [x] Bấm **🖨 In / Lưu PDF** → mở hộp thoại in của hệ điều hành, chọn *Lưu dưới dạng PDF* được.
- [x] Nội dung báo cáo giống hệt bản cũ (thông tin cơ bản, y tế, tiền sử, tiêm chủng, khám, thuốc, xét nghiệm, ghi chú).
- [x] Cả 3 lối vào đều dùng chung popup này: nút ở thẻ hồ sơ, nút ở trang Báo cáo, nút ở trang Mở rộng tương lai.
- [x] Nền không cuộn khi popup đang mở.

---

## 4. Hạng mục 3 — Cập nhật hạn dùng khi chuyển túi sữa

### 4.1 Nguyên nhân gốc
`tfComputeExpire()` chỉ có hai nhánh: giữ nguyên nơi bảo quản thì giữ hạn cũ, đổi nơi bảo quản thì tính lại theo bảng `milkStorageHours`. **Không có đường nào để người dùng tự đặt hạn.**

Riêng trường hợp **ngăn đông → ngăn mát** thì công thức cũ còn sai về mặt an toàn thực phẩm: nó cấp cho sữa đã rã đông trọn **96 giờ** của ngăn mát, trong khi sữa mẹ đã rã đông chỉ nên dùng trong **24 giờ** và không được cấp đông lại.

### 4.2 Cách xử lý
- Tách `tfAutoExpire()` (gợi ý của hệ thống) khỏi `tfComputeExpire()` (kết quả cuối, ưu tiên giá trị người dùng nhập).
- `tfIsThaw(from,to)` nhận diện rã đông: từ *Ngăn đông* / *Tủ đông sâu* về *Ngăn mát* / *Túi giữ lạnh có đá* / *Nhiệt độ phòng*.
- Khi rã đông: gợi ý mặc định = thời điểm chuyển + `min(24 giờ, hạn của nơi bảo quản mới)`, kèm cảnh báo trong khung xem trước.
- Thêm nút **🕒 Tự nhập hạn dùng** mở ô `datetime-local` (`#tfExpValue`). Ô này luôn được nạp sẵn gợi ý của hệ thống nên người dùng chỉ chỉnh phần cần đổi.
- Đổi *Ngày chuyển* / *Giờ chuyển* / *Bảo quản ở* → `tfRecalcExpire()` nạp lại gợi ý mới.
- Khung xem trước ghi rõ nguồn gốc của hạn: *(bạn tự nhập)* / *(sữa rã đông — tính lại 24 giờ từ lúc chuyển)* / *(tính lại theo nơi bảo quản mới)* / *(giữ nguyên như túi gốc)*.
- Túi mới lưu thêm `expireManual` và `thawed` để truy vết; giao dịch Chuyển sữa trong dòng thời gian cũng lưu hai cờ này.
- Cảnh báo cũ "nơi bảo quản mới làm hạn dùng dài hơn túi gốc" giữ nguyên, và **vẫn chạy** khi người dùng tự nhập một mốc dài hơn túi gốc.

### 4.3 Tiêu chí nghiệm thu
- [x] Chuyển túi từ **Ngăn đông** về **Ngăn mát** → gợi ý hạn dùng là 24 giờ kể từ lúc chuyển, kèm cảnh báo không cấp đông lại.
- [x] Bấm **Tự nhập hạn dùng** → hiện ô ngày giờ đã điền sẵn gợi ý, sửa được tự do.
- [x] Sửa hạn rồi bấm **Xác nhận chuyển** → túi mới mang đúng hạn người dùng nhập.
- [x] Bật ô tự nhập rồi để trống → tự quay về gợi ý của hệ thống, không tạo túi thiếu hạn.
- [x] Đổi *Bảo quản ở* sau khi đã bật ô tự nhập → gợi ý được nạp lại theo nơi bảo quản mới.
- [x] Đóng và mở lại popup Chuyển sữa → luôn bắt đầu ở chế độ gợi ý tự động.
- [x] Các đường chuyển khác (mát → đông, cùng nơi bảo quản, đổi bình/túi) giữ nguyên hành vi cũ.
- [x] Xoá giao dịch chuyển sữa (`tfReleaseTransfer`) vẫn trả sữa về túi nguồn như cũ.

---

## 5. Hạng mục 4 — Gỡ Sức khỏe mẹ

Sổ sức khỏe 2.0 đã có hồ sơ riêng cho Mẹ (cân nặng, chiều cao, BMI, khám, thuốc, xét nghiệm) nên trang cũ chỉ còn trùng lặp.

### 5.1 Đã gỡ
| Loại | Đối tượng |
|---|---|
| Trang | `#health` (Sức khỏe mẹ) |
| Hàm | `saveMom`, `resetMomForm` |
| Menu | Mục **❤️ Sức khỏe mẹ** ở menu bên trái |
| Lời gọi còn sót | `renderList('momList', …)` và ô ngày `mDate` trong `render()`, `resetMomForm()` lúc khởi động |

### 5.2 Dữ liệu
- `db.mom` **không bị xoá**: vẫn có trong sao lưu, xuất JSON / ZIP / SQLite (`mom_stats`) / CSV (`chi_so_me`) và đồng bộ đám mây.
- `normalize()` giữ nguyên phần chuẩn hoá `db.mom`.

### 5.3 Tiêu chí nghiệm thu
- [x] Không còn lối vào nào dẫn tới trang Sức khỏe mẹ.
- [x] Sao lưu / khôi phục / xuất file vẫn chứa đủ dữ liệu `mom` như cũ.
- [x] Nút thanh dưới cũ trỏ `health` được tự chuyển sang Sổ sức khỏe 2.0.

---

## 6. Hạng mục 5 — Menu trái: dòng phiên bản xuống sát thanh dưới

### 6.1 Nguyên nhân gốc
Khoảng trống là tổng của hai lớp đệm cộng dồn:

```css
.sidebar { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }
.sideFoot{ padding-bottom: calc(84px + env(safe-area-inset-bottom)); }
```

→ dưới dòng phiên bản luôn có `100px + 2 × safe-area-inset-bottom`, tức khoảng 168px trên iPhone có thanh Home. Trong khi thanh dưới thực tế chỉ chiếm `60px (cao) + 6px (cách đáy) = 66px`.

### 6.2 Cách xử lý
Bỏ đệm cộng dồn, chừa đúng một khoảng xác định:

```css
.sidebar { padding-bottom: 0 !important; }
.sideFoot{ padding-bottom: 76px !important; }
```

76px = 66px thanh dưới + 10px khe hở. Trên màn hình rộng (`min-width:900px`) thanh dưới không còn chắn menu nên trả về lề thường.

### 6.3 Tiêu chí nghiệm thu
- [x] Dòng **Phiên bản hiện tại** nằm ngay trên thanh dưới, cách một khe hở nhỏ.
- [x] Không bị thanh dưới che, cũng không đè lên thanh dưới.
- [x] Danh sách menu phía trên được thêm chỗ, cuộn vẫn bình thường.
- [x] Máy có và không có thanh Home đều không bị tràn ra ngoài màn hình.

---

## 7. Hạng mục 6 — Gỡ module Nhật ký

### 7.1 Đã gỡ
| Loại | Đối tượng |
|---|---|
| Trang | `#diary` (Thêm nhật ký), `#diaryBook` (Cuốn nhật ký), `#diaryType` (Loại nhật ký) |
| Hàm biểu mẫu | `resetDiaryFormCore`, `resetDiaryForm`, `saveDiary` |
| Hàm sắp xếp | `diaryTimeRank`, `diarySortDesc`, `sortedDiary` |
| Hàm hiển thị | `renderDiaryBook`, `renderDiaryStatsPanel`, `diaryTypeLabel`, `openDiaryBookHighlight`, `openLatestDiaryFromDashboard` |
| Thao tác vuốt | `diarySwipeStart`, `diarySwipeMove`, `diarySwipeEnd`, `confirmDeleteDiaryBook` |
| Thống kê | `diaryStatKey`, `diaryStatToggle`, `toggleDiaryStats` |
| Danh mục | `fillDiaryTypeOptions`, `resetDiaryTypeForm`, `saveDiaryType`, `editDiaryType`, `delDiaryType`, `renderDiaryTypes` |
| Menu | `toggleDiaryMenu`, `openDiaryMenu`, khối `#diaryParent` + `#diarySubNav`, mục **Danh mục → Loại nhật ký** |
| Tìm kiếm toàn app | Chip lọc `📔 Nhật ký`, phần dựng chỉ mục từ `db.diary`, ba nhánh mở / sửa / xoá |
| Thanh dưới | Bỏ tuỳ chọn `📖 Nhật ký` khỏi `BOTTOM_NAV_OPTIONS` |
| CSS chết | 21 quy tắc `.diaryBook`, `.diaryPage`, `.diaryStat*`, `.swipeShell`, `.swipeDelete`, `.diaryTypeBadge`, `.diaryBackBtn` |

Tổng cộng 26 hàm và 3 trang.

### 7.2 Dữ liệu
- `db.diary` và `db.diaryTypes` **không bị xoá**: vẫn có trong sao lưu, xuất JSON / ZIP / SQLite (bảng `diary`) / CSV (`nhat_ky`), trong bảng đếm bản ghi khi khôi phục, và trong đồng bộ đám mây.
- `normalize()` giữ nguyên phần chuẩn hoá `db.diary` / `db.diaryTypes` để dữ liệu cũ khôi phục được nguyên vẹn.

### 7.3 Chuyển đổi cấu hình cũ
`LEGACY_BOTTOM_NAV_MAP` bổ sung 4 lối chuyển, chạy qua `migrateBottomNavId` (hàm bị khoá, **không sửa**):

| Nút cũ | Chuyển sang |
|---|---|
| `diaryBook`, `diary` | `careTimeline` (Nhật ký chăm sóc) |
| `diaryType` | `appointmentType` (Loại lịch khám) |
| `health` | `healthBook2` (Sổ sức khỏe) |

### 7.4 Tiêu chí nghiệm thu
- [x] Không còn lối vào nào dẫn tới Nhật ký (menu trái, bảng Thêm, thanh dưới, Danh mục, tìm kiếm).
- [x] Tìm kiếm toàn app không còn chip **Nhật ký** và không trả kết quả nhật ký.
- [x] Sao lưu / khôi phục / xuất file vẫn chứa đủ dữ liệu `diary` như cũ.
- [x] Người dùng đang để nút **Nhật ký** ở thanh dưới không bị mất nút — tự chuyển sang Nhật ký chăm sóc.
- [x] Mục **Nhật ký chăm sóc** (module `careJournal` / timeline chăm sóc) **không** bị ảnh hưởng — đây là module khác.

---

## 8. Kết quả kiểm thử

| Hạng mục | Kết quả |
|---|---|
| `node --check app.js` / `sw.js` | PASS |
| `release_check.py` | PASS |
| Baseline Lock vs V14.1.0 (61 hàm) | PASS — 60 hàm nguyên vẹn, 1 hàm đổi có khai báo (`hb2ExportProfile`) |
| Không còn tham chiếu chết tới hàm/ID đã gỡ | PASS — quét toàn bộ `onclick` / `onchange` / `ontouch*` trong `index.html` đối chiếu hàm có thật trong `app.js` |
| Đồng bộ version 14.2.0 (5 file) | PASS |
| Số hàm trong `BASELINE_LOCK_V14.2.0.json` | 75 (61 cũ + 14 hàm mới của bản này) |

---

## 9. Ghi nhận ngoài phạm vi (chưa sửa trong bản này)

Trong lúc rà `itemActions`, phát hiện **lỗi có sẵn từ các bản trước**, không phát sinh do đợt sửa này:

- `itemActions()` sinh ra nút gọi `del(type,i)`, `editPregnancy(i)`, `editBaby(i)`, `copyPregnancy(i)`, `copyBaby(i)` — **cả 5 hàm này chưa từng tồn tại trong `app.js`**.
- Hệ quả: nút **Sửa / Sao chép / Xóa** trong *Lịch sử chỉ số thai kỳ* và *Lịch sử chỉ số bé* bấm vào không chạy (`ReferenceError`).
- Việc gỡ Nhật ký và Sức khỏe mẹ đã thu hẹp phạm vi lỗi (2 danh sách thay vì 4) nhưng chưa khắc phục gốc.
- `itemActions` nằm trong Baseline Lock; cách sửa an toàn là **chỉ bổ sung 5 hàm còn thiếu**, không đụng `itemActions`. Đề xuất tách thành bản V14.2.1 để giữ đúng phạm vi bản này.
