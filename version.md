# V15.0.5 — UXFix: SheetCore + Timeline gọn

- Chuẩn hóa thêm SheetCore cho bottom sheet/modal/popup để khóa scroll nền và pull-to-refresh nhất quán hơn.
- Timer chỉ còn nút **Bắt đầu bú**, chỉ hiển thị trong form Bé bú. Bỏ nút Bắt đầu ngủ.
- Khi Timer bú đang chạy, Dashboard hiển thị trạng thái **Bé đang bú** kèm thời lượng đã bú và avatar đổi vòng màu phù hợp.
- Timeline chỉ còn một nút **Thao tác** trên mỗi record; Sửa/Nhân bản/Xóa chuyển vào sheet thao tác.
- Xóa bộ lọc Timeline nay xóa cả ngày lọc, loại lọc, tìm kiếm và sort tạo/cập nhật.
- Giao diện chi tiết record Timeline gọn lại: nút thêm ảnh/video/ghi chú dạng icon nhỏ, action dạng icon chip.
- Giảm press animation cho container lớn không có click/event.

# V15.0.4 — Hotfix khóa scroll Timeline bottom sheet

- Fix case trong Timeline: mở Filter/Sắp xếp bottom sheet rồi kéo xuống vẫn làm nền phía sau bị kéo theo.
- Chặn Pull-to-refresh/reload khi đang có bottom sheet/modal/popup mở.
- Khóa scroll được áp dụng ngay tại thời điểm `tl8Show()` mở sheet, không chờ một frame `requestAnimationFrame`, nên iOS Safari không còn kịp nhận thao tác kéo nền.
- Khi mở sheet, reset trạng thái pull-to-refresh đang dở và ẩn indicator để tránh body bị transform.
- Chỉ cho cuộn trong vùng nội dung sheet; kéo tới đầu/cuối sheet sẽ không chain sang nền.

# V15.0.3 — Khóa scroll nền cho Bottom Sheet

- Fix lỗi khi Bottom Sheet đang mở mà kéo/scroll thì giao diện phía sau cũng bị cuộn theo, đặc biệt trên iOS/Safari.
- Áp dụng cho tất cả bottom sheet/popup/sheet hiện có: Timeline 2.0, bộ lọc, sắp xếp, ghi chú, menu Thêm, Streak, chọn túi sữa, sheet công cụ đo ồn/đo sáng và các overlay phát sinh.
- Bổ sung cơ chế khóa body kiểu `position: fixed` giữ nguyên vị trí trang, đồng thời chỉ cho phép cuộn trong vùng nội dung của sheet/modal.
- Chặn scroll chaining khi cuộn tới đầu/cuối bottom sheet để nền không bị kéo theo.

# V15.0.1 — Thanh bộ lọc Timeline gọn lại
Ngày: 2026-08-02

## Sửa lỗi
- **Thanh bộ lọc của Timeline 2.0 chiếm gần trọn màn hình.** Bản 15.0.0 làm đúng chức năng nhưng sai về diện tích: ô tìm kiếm, năm chip lọc **xếp dọc thành năm hàng**, nút sắp xếp dài cả hàng, cộng thêm Lọc ngày · Lọc loại · nút Ghi nhận mới — tổng cộng **≈ 560px** trước khi thấy dòng ghi nhận đầu tiên. Nguyên nhân xếp dọc: app có rule toàn cục `button{width:100%}` mà chip không chặn lại, nên mỗi chip bị kéo full-width.

## Nâng cấp
- **Thanh công cụ gom về một hàng, còn ≈ 132px.** Ô tìm kiếm co giãn, bên cạnh là ba nút vuông: **⚙ Bộ lọc** · **⇅ Sắp xếp** · **＋ Ghi nhận mới**. Hàng này không bao giờ xuống dòng; màn hình hẹp thì ô tìm kiếm co lại chứ nút không rớt xuống.
- **Lọc ngày và Lọc loại chuyển vào bảng ⚙ Bộ lọc**, cùng với năm chip lọc nhanh. Đây là phần lấy lại nhiều chỗ nhất. Hai ô này chỉ **đổi chỗ**, không viết lại — mọi thứ đọc chúng vẫn chạy như cũ.
- **Nút xác nhận trong bảng lọc hiện số kết quả ngay lúc đó** — *"Xem 12 ghi nhận"*, cập nhật theo từng lần chạm chip. Bấm là biết trước sẽ ra bao nhiêu dòng, không phải đóng bảng ra đếm.
- **Biết đang lọc gì mà không cần mở bảng.** Nút ⚙ mang số đếm ở góc (tính cả lọc ngày, lọc loại) và đổi màu khi đang lọc; nút ⇅ đổi màu khi sắp xếp khác mặc định. Dưới thanh có một dòng tóm tắt liệt kê đúng những gì đang áp dụng kèm số kết quả — *"📅 02/08/2026 · ⭐ Yêu thích · 🔎 "sữa" — 12 ghi nhận"* — và một nút **Xoá** dọn sạch cả bộ lọc lẫn từ khoá trong một chạm.
- **Dòng tóm tắt chỉ hiện khi thực sự đang lọc.** Trạng thái mặc định thì biến mất hoàn toàn, không chiếm một pixel nào.

## Không mất gì
- Đủ năm chip lọc nhanh, đủ sáu chế độ sắp xếp, tìm kiếm không dấu, nhấn giữ, ảnh/video/ghi chú, chia sẻ, xuất PDF — không đụng tới một chức năng nào.
- Nút **＋ Ghi nhận mới** vẫn còn nguyên lối vào, chỉ đổi từ nút chữ chiếm cả hàng thành nút vuông trong thanh.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V15.0.0.json`: đúng **ba hàm** bị sửa thân — `tl8SyncBar`, `tl8RenderTimeline`, `tl8CloseAll` — tất cả đều là hàm sinh ra ở V15.0.0 và đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`. **Không một hàm nào có từ trước V15.0.0 bị động tới.**
- Phần lọc, sắp xếp, phân trang và dựng dòng bên trong `tl8RenderTimeline` không đổi một ký tự — chỉ đổi vị trí một lời gọi để đếm kết quả xong mới vẽ thanh.
- `BASELINE_LOCK_V15.0.1.json` chốt **267 hàm** (263 hàm của V15.0.0 + 4 hàm mới).

---

# V15.0.0 — Timeline 2.0 (Unified Timeline)
Ngày: 2026-08-02

## Nâng cấp
- **Timeline không còn chỉ để xem lại.** Từ bản này Timeline là nơi quản lý toàn bộ hoạt động: sửa, nhân bản, ghim, đánh dấu yêu thích, đính kèm ảnh/video/ghi chú, chia sẻ, xuất PDF, tìm kiếm, lọc và sắp xếp — một cuốn nhật ký điện tử hoàn chỉnh thay vì một danh sách chỉ để cuộn.
- **Nhấn giữ một dòng là ra bảng thao tác nhanh.** Giữ 450ms, máy rung một nhịp nhẹ, dòng đó mờ đi rồi bảng hiện lên từ đáy màn hình. Kéo tay hoặc cuộn trang giữa chừng thì huỷ, không có chuyện đang cuộn mà bảng nhảy ra chặn. Nhả tay xong cú chạm đó cũng không rơi tiếp thành một cú bấm mở nhầm màn hình chi tiết.
- **Dashboard nhẹ, Unified Timeline đầy đủ.** Bảng thao tác trên Dashboard **chỉ có 5 mục**: Sửa · Nhân bản · Yêu thích · Ghim · Xem chi tiết. Những thứ nặng — thêm ảnh, thêm video, ghi chú, chia sẻ, xuất PDF — chỉ có trong Unified Timeline. Đây là ranh giới được kiểm tra tự động mỗi lần phát hành, không phải thoả thuận miệng.
- **Dashboard Timeline hiện 8 hoạt động gần nhất, không còn chỉ hôm nay.** Bản cũ chỉ liệt kê ghi nhận trong ngày, nên sáng sớm mở app là một khoảng trống dù tối qua vừa ghi rất nhiều. Nay dòng của hôm nay hiện giờ (`08:15`), dòng của ngày khác hiện thêm ngày tháng (`01/08 21:40`) để không nhầm việc hôm qua là việc hôm nay. Nút bên phải tiêu đề đổi thành **Xem toàn bộ →**.
- **Biểu tượng trạng thái ngay trên dòng.** ⭐ đã yêu thích · 📌 đã ghim · 📷 có ảnh · 🎥 có video · 📝 có ghi chú — hiện ở cả Dashboard, Unified Timeline và đầu bảng thao tác. Nhìn một lượt là biết bản ghi nào có gì, không phải mở từng cái ra dò.
- **Nhân bản để ghi nhanh việc lặp lại.** Copy toàn bộ dữ liệu bản ghi cũ, thời gian tự đặt về lúc này, mở ra dưới dạng form đang chờ Lưu. Vì đi qua đúng luồng nhập liệu cũ nên phần kho sữa / túi sữa / hạn dùng vẫn được tính lại đúng — không đẻ ra bản ghi ma làm lệch tồn kho. Riêng **Chuyển sữa** không nhân bản được, vì nhân đôi một giao dịch chuyển kho sẽ làm sai tồn ở cả hai đầu.
- **Ghim và Yêu thích là hai việc khác nhau.** Ghim để đánh dấu việc quan trọng (tiêm vaccine, khám bệnh, sốt, thuốc đặc biệt); Yêu thích để đánh dấu việc hay dùng lại. Một bản ghi có thể vừa ghim vừa yêu thích, và mỗi loại có một chip lọc riêng.
- **Mỗi bản ghi đính kèm được nhiều ảnh và nhiều video.** Tối đa 20 ảnh và 5 video, **không giới hạn riêng theo loại hoạt động** — bú, ngủ, thay tã, uống thuốc đều đính kèm được. Ảnh được nén trước khi lưu (cạnh dài 1280px) nên máy không phình vì một tấm ảnh 8MB. Video được lấy một khung hình làm ảnh đại diện.
- **Chia sẻ ba dạng: Văn bản · Ảnh đẹp · PDF.** Văn bản dùng bảng chia sẻ của máy, máy không hỗ trợ thì chép vào bộ nhớ tạm — không có đường cụt. Ảnh đẹp là một tấm thẻ 1000×1250 gồm ảnh, biểu tượng, loại hoạt động, thời gian, nội dung, ghi chú và ký tên "Nhật ký chăm sóc của \<tên bé\>". Đủ để gửi ông bà hoặc bác sĩ.
- **Xuất PDF riêng từng bản ghi**, gồm thời gian hoạt động, thông tin chi tiết, thời gian tạo, thời gian cập nhật, ghi chú, ảnh và **thumbnail video**. Vẫn đi qua popup xem trước có sẵn, **không mở cửa sổ mới** — cửa sổ mới bị kẹt khi chạy dạng PWA, đây là ràng buộc từ V14.2.0.
- **Sáu chế độ sắp xếp, ứng dụng nhớ lựa chọn cuối cùng.**

  | Tiêu chí | Chiều |
  |---|---|
  | Thời gian hoạt động | Mới nhất trước *(mặc định)* / Cũ nhất trước |
  | Thời gian tạo record | Mới tạo trước / Cũ tạo trước |
  | Thời gian cập nhật | Mới cập nhật trước / Cũ cập nhật trước |

  Một hoạt động ngày 01/08 nhưng nhập bổ sung ngày 05/08 vẫn xem đúng theo thời gian tạo. Sửa lại bản ghi tuần trước thì nó lên đầu danh sách khi chọn "Mới cập nhật trước". Sắp theo thời gian tạo hoặc cập nhật thì tiêu đề nhóm ngày đổi theo (`Ngày tạo: …`) và mỗi dòng hiện thêm `🆕 … · ✏️ …` — nhìn là biết đang sắp theo mốc nào, không phải đoán.
- **Năm chip lọc nhanh chọn được nhiều cùng lúc** (⭐ 📌 📷 🎥 📝), cộng dồn với bộ lọc ngày và bộ lọc loại hoạt động đang có chứ không thay thế.
- **Tìm kiếm toàn bộ dữ liệu, không phân biệt dấu.** Quét ghi chú, loại hoạt động, tên bình/túi sữa, tên thuốc, tên vaccine, trạng thái bảo quản, mã túi và mọi trường phụ. Gõ `binh sua` vẫn ra `Bình sữa`, gõ `thuoc` vẫn ra `Thuốc`. Nhiều từ khoá thì phải khớp tất cả. Kết quả kết hợp với bộ lọc và chế độ sắp xếp đang chọn. Không tìm thấy gì thì hiện đúng lý do kèm nút **Xoá bộ lọc & tìm kiếm**, thay vì một danh sách trống vô nghĩa.

## Vẫn nhanh
- Unified Timeline **dựng dần từng 120 dòng** như V14.6.0 — có 5.000 bản ghi vẫn mở trang nhanh. Đổi bộ lọc / sắp xếp / từ khoá thì bộ đếm tự đặt lại về 120.
- Ô tìm kiếm **không bao giờ** nuốt chuỗi base64 của ảnh/video vào chuỗi so khớp — một tấm ảnh là vài trăm nghìn ký tự, đưa vào sẽ đứng máy ngay ký tự đầu tiên gõ. Chuỗi so khớp được nhớ tạm theo `id + updatedAt`, gõ tiếp không dựng lại từ đầu, và có hoãn 220ms nên không vẽ lại sau từng ký tự.
- Đóng lớp xem ảnh/video thì nội dung được nhả khỏi bộ nhớ ngay, không giữ video nặng chạy ngầm.

## Không mất gì
- **Toàn bộ trường mới đều là trường phụ thêm vào bản ghi có sẵn**: `fav`, `pin`, `media`. Không đổi tên, không xoá, không ghi đè trường cũ → sao lưu JSON, xuất file và đồng bộ Cloud **tự động mang theo**, dữ liệu cũ không mất một ký tự.
- **Mọi thao tác bám theo mã bản ghi, không phải chỉ số mảng.** Thêm một ghi nhận mới sẽ đẩy toàn bộ chỉ số cũ lệch đi một; bám theo mã nên ghim / yêu thích / ảnh **không bao giờ nhảy sang nhầm dòng**. Bản ghi cũ chưa có mã được cấp mã ngay lần đầu bị chạm tới.
- **Bộ nhớ máy đầy thì app báo, không treo.** Mọi lần ghi đi qua một lớp an toàn: đầy thì hiện *"Bộ nhớ máy đã đầy — hãy xoá bớt ảnh/video đính kèm rồi thử lại"* và vẽ lại màn hình. Lần ghi hỏng thì dữ liệu trong máy vẫn là **bản cũ nguyên vẹn**. Cùng lý do đó, video nặng hơn 2.5MB chỉ giữ ảnh đại diện và tên tệp — nhồi video vào bộ nhớ trình duyệt sẽ làm hỏng cả lần lưu tiếp theo của toàn bộ dữ liệu bé.
- Ghi chú dùng chung trường ghi chú sẵn có của bản ghi — **một nguồn duy nhất**, không đẻ ra ghi chú thứ hai lệch với ghi chú nhập trong form.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.7.0.json`: **không một hàm nào bị sửa thân**. `INTENTIONAL_BASELINE_CHANGES` trong `release_check.py` là **rỗng** — lần đầu tiên kể từ V14.0.0.
- Chỗ cần đổi hành vi đều **bọc lại**, không sửa: `renderCareTimeline` → `tl8WrapTimeline`. Lớp bọc mới luôn nằm ngoài cùng nên lớp bọc của V14.6.0 không giành lại quyền vẽ, và có `try/catch` — mô-đun mới lỗi thì rơi về lớp cũ, người dùng vẫn thấy Timeline như bản 14.7.0.
- Block Dashboard `careJournal` nằm trong `renderDashboard` (hàm **không** thuộc Baseline Lock) và cũng chỉ thêm một dòng uỷ quyền có `try/catch`, phần mã cũ giữ nguyên bên dưới làm đường lui. Dashboard không bao giờ trống vì Timeline 2.0.
- Các lớp phủ mới đặt tên chứa `Sheet` / `Overlay` nên cơ chế khoá cuộn nền dùng chung của V14.1.0 tự nhận ra, không phải khai báo thêm và không sửa mã cũ. Nhịp rung mới cho nhấn giữ được **thêm khoá mới** vào bảng rung, **không sửa** `axHaptic()`.
- `BASELINE_LOCK_V15.0.0.json` chốt **263 hàm** (185 hàm cũ + 78 hàm mới của V15.0.0).
- Chỉ ghi thêm **một khoá thiết lập** của chính người dùng: `meYeuBeTimeline2_v1` (sắp xếp / bộ lọc / từ khoá).

---

# V14.7.0 — Theme & Sổ sức khỏe
Ngày: 2026-08-02

## Nâng cấp
- **Mở app ở Dark Mode không còn loé trắng.** Trước đây giao diện sáng/tối chỉ được gán trong `render()` của `app.js` — mà `app.js` nằm cuối trang, nên màn hình chờ và màn hình loading đã vẽ xong từ lâu, máy đang tối vẫn thấy loé sáng một nhịp rồi mới đổi. Nay việc này chuyển vào `boot.js`, tệp nằm trong `<head>` và chạy trước cả CSS, nên `<html>` đã đúng màu trước khi trình duyệt vẽ điểm ảnh đầu tiên.
- **Giao diện có ba chế độ: Tự động · Luôn sáng · Luôn tối.** Mặc định là **Tự động** — app tự đọc cài đặt Dark Mode của điện thoại. Đang bật Tự động mà đổi cài đặt của máy giữa chừng thì app đổi theo ngay, không cần khởi động lại. Nút 🌗 trên thanh tiêu đề bấm lần lượt qua ba chế độ, kèm toast nói rõ đang ở chế độ nào. Thanh trạng thái của PWA cũng đổi màu theo, không còn hồng chói trên nền tối.
- **Module "Sau sinh" đã gỡ, Sổ sức khỏe thay chỗ.** Cân nặng / chiều dài / vòng đầu trước đây nằm ở hai nơi, phải gõ hai lần và cho ra hai con số khác nhau. Nay chỉ còn một nguồn duy nhất. Menu trái: mục **🩺 Sổ sức khỏe** thành mục cha với hai mục con **Hồ sơ sức khỏe** và **Biểu đồ tăng trưởng**. Biểu đồ chuẩn WHO không mất theo module mà thành màn hình riêng, và giờ đọc được số đo khai báo trong Sổ sức khỏe chứ không chỉ dữ liệu cũ.
- **Dashboard có block "Sổ sức khỏe" thay cho block "Sự phát triển của bé".** Ba chỉ số hiện số mới nhất, mức tăng/giảm so với **lần khai báo liền trước có chỉ số đó**, kèm phần trăm:

  | | Cân nặng | Chiều dài | Vòng đầu |
  |---|---|---|---|
  | | 5,6 kg | 60 cm | 38 cm |
  | | ↑ 1 kg | ↑ 4 cm | ↑ 3 cm |
  | | +21,7% | +7,1% | +8,6% |

  Lần khai báo mới chỉ nhập một chỉ số thì hai chỉ số còn lại **lấy lại số của lần cũ** và gắn dấu **(!)**; chạm vào dấu (!) hiện chú thích ghi rõ lần khai báo mới chưa nhập chỉ số đó và số đang hiện được đo ngày nào. Dòng đầu block luôn ghi ngày của lần khai báo mới nhất để không nhầm số cũ là số hôm nay.
- **Cấu hình dashboard đổi theo.** Module "Sự phát triển của bé" được thay bằng module **Sổ sức khỏe**, bật/tắt · đổi tên · kéo thứ tự như cũ. Ai đã sắp xếp từ trước thì được chuyển tên **tại chỗ**, giữ nguyên vị trí và tên tự đặt, không bị đẩy xuống cuối.

## Không mất gì
- **Dữ liệu `db.baby` giữ nguyên, không xoá một bản ghi nào** — vẫn nằm trong sao lưu JSON, xuất SQLite, đồng bộ Cloud, dòng thời gian Sổ sức khỏe và biểu đồ WHO. Trùng ngày thì số đo trong Sổ sức khỏe được ưu tiên.
- **Không ai mất nút thanh dưới.** Nút "Phát triển" cũ (`babyStats`) tự chuyển sang màn hình Biểu đồ tăng trưởng; `baby` chuyển sang Sổ sức khỏe.
- Ô trống của biểu đồ WHO không còn nút trỏ vào màn hình đã gỡ (bấm vào sẽ trắng màn hình) — nay là nút **⚖️ Đo chỉ số cho bé**, mở thẳng ô đo.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.6.0.json`: **chỉ một hàm bị sửa thân** là `renderWhoGrowth`, và chỉ đúng hai dòng của ô trống (câu hướng dẫn + nút bấm) vì nút cũ trỏ tới màn hình đã gỡ. Phần tính toán và vẽ biểu đồ không đổi một ký tự. Đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`.
- Chỗ nào cần đổi hành vi của hàm đã khoá đều **bọc lại**, không sửa: `whoSeries` → `gw7WrapWhoSeries`, `updateThemeButton` / `toggleTheme` → `th7WrapUI`. Toàn bộ phần mới là hàm `th7*` / `gw7*`, CSS mới và khối HTML mới.
- `BASELINE_LOCK_V14.7.0.json` chốt 185 hàm (161 hàm cũ + 24 hàm mới).
- Dữ liệu của bé an toàn tuyệt đối: chỉ ghi thêm hai khoá thiết lập của chính người dùng (`settings.themeMode`, `settings.theme`) và một lần đổi tên module trong `dashboardConfig`.

---

# V14.6.0 — Storage & Stability
Ngày: 2026-08-02

## Nâng cấp
- **Ghi nhận Bé bú có ô ml bấm nhanh như màn Hút sữa.** Ô "Số lượng ml" giờ là một khối gồm nút **−**, con số ở giữa và nút **＋** (bước 10 ml), bên dưới là dãy **Gợi ý nhanh 60 · 80 · 100 · 120 · 150 · 180 · 200 ml** cuộn ngang. Chạm một mức là điền ngay, mức đang chọn sáng lên. Mọi thứ phía sau vẫn chạy y như gõ tay: app tự gắn bình/túi theo hạn dùng gần nhất, tự tính tổng ml lấy từ kho và số ml bé bú thực tế.
- **Trang Dữ liệu có bảng "📦 Dung lượng".** Xem được ngay app đang chiếm bao nhiêu chỗ trên máy và chỗ đó nằm ở đâu: **Dung lượng App** (các tệp giao diện PWA trong bộ nhớ đệm), **Dung lượng DB** (dữ liệu của bé trong trình duyệt), **Backup phiên bản** (các bản lưu trong IndexedDB), cùng tổng dung lượng và hạn mức trình duyệt cấp kèm thanh tiến trình. Có thêm bảng nhỏ "dữ liệu DB đang chiếm chỗ ở đâu" chia theo từng nhóm (ghi nhận chăm sóc, kho sữa, cột mốc/ảnh, sổ sức khỏe…) để biết chính xác thứ gì đang phình to. DB vượt 3 MB hoặc dùng quá 80% hạn mức thì app cảnh báo kèm hướng xử lý. Toàn bộ phép đo chỉ đọc, không đụng một byte dữ liệu nào.

## Sửa lỗi
- **Bấm chức năng trong bảng "Thêm" không còn đứng màn hình hay thoát app.** Bốn nguyên nhân, sửa từng cái:
  1. **Ô sao lưu JSON.** `updateBackup()` nối *toàn bộ* database thành một chuỗi JSON rồi đổ vào ô textarea — và nó chạy lại ở **mọi lần vẽ màn hình**, cộng thêm ngay khi mở trang Dữ liệu. Khi DB đã có ảnh cột mốc và ảnh đại diện (vài MB), riêng bước này đủ làm iPhone đứng hình vài giây rồi Safari thoát app. Nay ô để trống, chỉ nạp khi Boss bấm **👁 Hiện dữ liệu JSON**; DB trên 2 MB thì hỏi lại trước.
  2. **Timeline.** Trước đây dựng toàn bộ lịch sử thành một chuỗi HTML duy nhất — càng dùng lâu càng nặng. Nay dựng 120 mục mỗi lần, có nút "Xem thêm".
  3. **Thứ tự điều hướng.** Bảng "Thêm" đóng sheet và chuyển trang trong cùng một khung hình, lại gọi các hàm vẽ của trang Dữ liệu **trước** khi trang kịp hiện (từ V14.3.0 việc chuyển trang bị hoãn 2 khung hình). Nay đóng sheet xong mới chuyển trang, chuyển trang xong mới vẽ.
  4. **Lớp vẽ còn sót.** Hiệu ứng "nở trang từ điểm chạm" của V14.5.0 để lại `transform` + `will-change` vĩnh viễn trên cả trang; với hai trang dài nhất là Timeline và Dữ liệu, iOS phải giữ một lớp vẽ khổng lồ nên dễ hết bộ nhớ. Nay dọn sạch sau khi hiệu ứng chạy xong, và các trang dài không phóng to cả trang nữa (vẫn có hiệu ứng mờ/trượt).
- **Nút "🧊 Kho sữa" trong bảng "Thêm" bấm vào là màn hình trắng.** App chưa bao giờ có trang riêng cho kho sữa (chính nút đó cũng ghi "Nếu có màn hình kho"), nên bấm vào là ẩn sạch mọi trang rồi để lại màn hình trống. Nay nút mở đúng bảng chi tiết kho sữa. Đồng thời app chặn luôn mọi lối vào chết kiểu này về sau: chức năng nào chưa có màn hình riêng thì báo rõ thay vì ẩn hết trang.
- **Bảng "Thêm" nhẹ hơn.** Bỏ lớp làm mờ nền `backdrop-filter` — làm mờ nền đồng thời với hiệu ứng mở/đóng buộc iOS vẽ lại cả màn hình mỗi khung hình. Thay bằng lớp màu, nhìn gần như cũ.
- **Lưới an toàn.** Khung xương chờ nào đứng quá 2,6 giây sẽ tự bị gỡ, có lỗi JavaScript giữa chừng cũng gỡ sạch — không bao giờ còn cảnh kẹt ở màn hình lấp lánh trống rỗng.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.5.0.json`: **không sửa thân một hàm nào**. Phần mới đều là hàm `fq6*` / `st6*` / `nv6*`, CSS mới và khối HTML mới trong trang Dữ liệu; chỗ nào cần đổi hành vi thì bọc lại đúng cách `axWrap()` sẵn có.
- Ba hàm `ax5Init` / `ax5DragInit` / `ax5ResetDragStyle` báo lệch hash là sai lệch có sẵn của chính file lock V14.5.0 (chốt trước lần chỉnh cuối của bản đã phát hành) — mã nguồn của cả ba giống hệt V14.5.0 từng ký tự. Đã khai báo rõ và chốt lại đúng ở `BASELINE_LOCK_V14.6.0.json` (157 hàm).
- Dữ liệu của bé không bị đụng tới: bảng dung lượng chỉ đọc, phần sửa lỗi không ghi vào `localStorage`.

---

# V14.5.0 — Fluid Motion & Fresh Build Guard
Ngày: 2026-08-01

## Nâng cấp
- **Popup mở ra từ đúng chỗ ngón tay vừa chạm.** Bấm vào ô nào thì khung nội dung nở ra từ chính ô đó rồi lấp đầy màn hình, đóng lại thì thu về đúng điểm ấy — giống hệt cách iPhone mở một app từ màn hình chính. Mở một chức năng toàn màn hình (Thống kê, Timeline, Sổ sức khỏe…) cũng vậy. Nếu màn hình được mở KHÔNG phải do chạm (từ thông báo, từ mã) thì vẫn dùng hiệu ứng trượt nhẹ như cũ.
- **Hết khựng.** Ba nguyên nhân gây giật đã được xử lý: mọi khung chuyển động chuyển sang chạy bằng GPU (`translate3d`), không còn animate lớp làm mờ nền (`backdrop-filter` — thủ phạm nặng nhất trên iPhone), và các hiệu ứng lặp vô hạn (shimmer khung xương, nhịp thở của logo) được **tạm dừng** trong lúc mở/đóng popup hay chuyển trang để dành trọn khung hình cho thứ người dùng đang nhìn. Đường cong giảm tốc đổi sang easeOutExpo cho cảm giác "trôi" đúng chất iOS.
- **Nút "Thêm" ở thanh dưới trượt lên mượt như sheet gốc của iOS.** Bảng trượt lên trọn vẹn từ đáy màn hình (trước đây chỉ nhích 58px rồi dừng nên trông như bị khựng), có thanh nắm kéo ở đầu, và **kéo xuống để đóng**: sheet đi theo ngón tay, nền mờ dần theo quãng kéo; thả ra khi đã kéo đủ xa hoặc hất nhanh thì đóng, chưa đủ thì bật về chỗ cũ.

## Sửa lỗi
- **Không bao giờ mở lại giao diện cũ nữa.** Nguyên nhân: Service Worker cũ lấy mã nguồn qua bộ nhớ đệm HTTP của trình duyệt, nên iPhone thỉnh thoảng trả về đúng bản `index.html` đã cũ và app vẽ lại giao diện của phiên bản trước. Bản này khoá chặt bằng bốn lớp:
  1. Mã nguồn (html/js/css) **luôn lấy mới từ mạng** (`cache:'no-store'`); bộ nhớ đệm chỉ còn là phao cứu sinh khi mất mạng.
  2. Khi bản mới kích hoạt: xoá **sạch** mọi cache cũ và giành quyền điều khiển ngay.
  3. Service Worker hỏi từng tab/PWA đang mở "bạn đang chạy bản nào?" — tab nào không trả lời đúng trong 2,2 giây (tức là đang kẹt ở bản cũ) sẽ được **tự động nạp lại**. Đây là lớp gỡ được cả những cửa sổ đã mở từ trước.
  4. Mỗi lần mở app hoặc quay lại từ nền, app đối chiếu số hiệu bản dựng với `build.json` trên máy chủ; lệch nhau là dọn cache và nạp lại đúng một lần (có khoá chống lặp).
  Toàn bộ quá trình **không đụng tới `localStorage`**, nên dữ liệu của bé không hề bị ảnh hưởng.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.4.2.json` (122 hàm): **122/122 hàm giữ nguyên hash**, không có thay đổi có chủ ý nào — phần mới đều là hàm `ax5*`, CSS mới và hai file tách riêng `boot.js` / `build.json`.
- Bảng thời lượng dùng chung `--ax-fast/base/slow` giữ nguyên; riêng popup và sheet cần dài hơn 250ms để đủ mượt nên khai báo bằng biến mới `--ax-modal` / `--ax-sheet`, vẫn quản lý tập trung tại một chỗ. Không thêm Rotate. Vẫn tôn trọng "Giảm chuyển động" của hệ điều hành và ô tắt hiệu ứng trong app.

---

# V14.4.2 — Dashboard Replay Fix
Ngày: 2026-08-01

## Sửa lỗi
- **Mở lại Trang chủ không còn làm mọi thông số về 0.** Trước đây, mỗi lần Home hiện lại có hai lượt quét hiệu ứng chạy đua nhau: lượt sau đọc phải con số đang chạy dở (`0 ml`) và thanh vừa bị ghim về `0%`, tưởng đó là số liệu mới nên chốt đích = 0 rồi đứng im — phải mở thêm một lần nữa mới thấy số thật. Nay mỗi ô số và mỗi thanh tiến trình tự nhớ **đích thật** của lượt đang chạy, nên lượt quét sau không đọc nhầm giá trị tạm. Số vẫn chạy `0 → giá trị thật` mỗi lần mở Dashboard như thiết kế ở V14.4.0.
- **Không còn hai vòng hiệu ứng cùng ghi vào một ô.** Thêm mã lượt (token) cho bộ đếm: lượt chạy mới tự huỷ lượt cũ, tránh con số giật qua lại. Nếu số liệu thật đổi giữa lúc đang chạy (vừa ghi nhận cữ bú mới), số chạy tiếp tới giá trị mới thay vì kẹt ở giá trị cũ.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.4.1.json` (122 hàm): **118 hàm giữ nguyên hash**; chỉ `axCount`, `axCountScan`, `axProgressStage`, `axProgressScan` đổi, đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`. Không sửa thân hàm vẽ nào, không đụng dữ liệu người dùng.
- Vẫn ≤250ms, đúng 3 biến `--ax-fast/base/slow`, không thêm Rotate.

---

# V14.4.1 — iOS-Smooth Tuning
Ngày: 2026-08-01

## Hiệu chỉnh
- **Chuyển động mượt hơn, cảm giác iPhone.** Đổi đường cong giảm tốc sang easeOutQuint (`cubic-bezier(.22,1,.36,1)`) cho mọi hiệu ứng và làm spring dịu hơn: mở/đóng popup, chuyển trang, chạy số đều "trôi" mượt về đích thay vì dừng gấp. Nút phản hồi nhanh hơn (0.14s), popup mở thong thả hơn chút (0.25s). Bộ đếm số cũng dùng easeOutQuint để chạy mượt cùng ngôn ngữ.
- **Nhấn khối chăm sóc thấy rõ và đúng khối.** Trước đây bấm một ô "Chăm sóc hôm nay" mở ngay popup đè lên nên hiệu ứng lún chưa kịp hiện. Nay ô lún **ngay khi chạm** (độ trễ 24ms, transition riêng 0.11s) và lún rõ hơn (scale 0.96), nên thấy được trước khi popup mở. Vẫn chỉ đúng ô được chạm lún, thẻ cha đứng yên, và vẫn không nhấp nháy khi cuộn.

## Không phá vỡ hành vi cũ
- So với `BASELINE_LOCK_V14.4.0.json` (122 hàm): **121 hàm giữ nguyên hash**; chỉ `axEaseOut` đổi (easeOutCubic → easeOutQuint), đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`. Không sửa thân hàm vẽ nào, không đụng dữ liệu người dùng.
- Vẫn ≤250ms, đúng 3 biến `--ax-fast/base/slow` (biến `--ax-press` là token nhấn riêng), không thêm Rotate.

---

# V14.4.0 — Animation Refinements
Ngày: 2026-08-01

## Sửa & tinh chỉnh
- **Dashboard chạy lại hiệu ứng mỗi khi mở.** Con số và thanh tiến trình ở "Chăm sóc hôm nay" chạy từ 0 → giá trị hiện tại mỗi lần mở Dashboard, và chạy lại khi mở lại app. Bản trước chạy hiệu ứng lần đầu ngay lúc splash còn che 1 giây nên bị phí — nay đợi splash tắt mới chạy, và mỗi lần điều hướng về Home cũng chạy lại.
- **Nhấn đúng block, không kéo theo block cha.** Trước đây do dùng `:active` (áp lên cả tổ tiên) nên chạm một ô nhỏ làm cả thẻ cha thu nhỏ theo. Nay bộ điều khiển nhấn chỉ gắn hiệu ứng lên block gần điểm chạm nhất; chạm vào ô con thì chỉ ô đó nhấn, chạm vùng trống của thẻ thì thẻ nhấn, chạm nút trong thẻ thì chỉ nút phản hồi.
- **Bấm để cuộn thì không nhấp nháy hiệu ứng nhấn.** Chờ một nhịp ngắn (62ms) để phân biệt CHẠM với CUỘN; hễ ngón tay bắt đầu di chuyển là huỷ hiệu ứng nhấn. Không cản thao tác cuộn/vuốt sẵn có.
- **Modal/popup thấy rõ hiệu ứng mở/đóng.** Tăng biên độ trượt + phóng + mờ dần trong ngưỡng 150~250ms; nâng thời gian giữ khung lúc đóng để hiệu ứng không bị cắt ngang.
- **Rung phản hồi áp dụng đúng thiết lập và cảm nhận được.** Thêm rung nhẹ ngay khi chạm nút/thẻ (trong đúng cử chỉ chạm nên đáng tin trên Android); tôn trọng ô bật/tắt: tắt là im hoàn toàn. iPhone dùng Safari không hỗ trợ rung sẽ tự bỏ qua.

## Không phá vỡ hành vi cũ
- Đối chiếu `BASELINE_LOCK_V14.3.0.json` (114 hàm): **113 hàm giữ nguyên hash**; chỉ `axInit` đổi (thêm bộ điều khiển nhấn + chạy lại Dashboard), đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`. Tất cả phần thêm là hàm/CSS `ax*` mới, không sửa thân hàm vẽ nào.
- Vẫn dùng chung bảng thời lượng `--ax-fast/base/slow`, mọi hiệu ứng ≤250ms, không thêm Rotate. Module thuần giao diện, không đụng dữ liệu người dùng.

---

# V14.3.0 — Animation System
Ngày: 2026-08-01

## Thêm mới
- **Bộ chuyển động thống nhất cho toàn app** — mượt, nhanh, tự nhiên, cảm giác cao cấp giống Apple Health. Mọi hiệu ứng gói trong 150~250ms và chỉ dùng bốn kiểu: Fade · Slide · Scale · Spring (không Rotate, không nảy mạnh). Tất cả dùng chung một bảng thời lượng (`--ax-fast` 160ms, `--ax-base` 200ms, `--ax-slow` 240ms) nên không còn mỗi chỗ một kiểu.
  - **Chạy số (Counter).** Số ml bú, số cữ, giờ ngủ, cân nặng… ở Dashboard / Thống kê / Báo cáo tăng dần thay vì nhảy thẳng (0 → 50 → 120 → 390 ml). Icon và đơn vị đứng yên, chỉ con số chạy; mốc giờ kiểu `07:30`, `2h05` được nhận diện để không bị chạy nhầm.
  - **Thanh tiến trình (Progress).** Chạy từ trái sang phải, không hiện sẵn ở đích; đạt mục tiêu thì đổi màu hoàn thành kèm một nhịp phóng rất nhẹ.
  - **Popup / modal / bottom sheet (Spring).** Mở bằng scale nhẹ + fade in (bottom sheet trượt từ dưới lên), đóng bằng fade out + trượt xuống. Áp cho cả 21 popup, gồm cả hộp thoại Sổ sức khỏe 2.0 và bảng Thêm ở thanh dưới. Không còn "pop" cứng.
  - **Hero Fade.** Khi trạng thái bé đổi (🟢 Đang thức → 🟣 Đang ngủ) hoặc dữ liệu Hero thay đổi, chỉ phần đổi mới fade nhẹ — không nháy lại toàn bộ thẻ.
  - **Timeline & danh sách.** Record mới xuất hiện bằng fade in + slide up; các dòng trong danh sách hiện lần lượt cách nhau 36ms thay vì bật ra đồng loạt.
  - **Nhấn thẻ (Card press).** Thu còn ~98% khi nhấn, thả tay nảy nhẹ.
  - **Nút (Button).** Scale nhẹ khi nhấn; có sẵn spinner trong nút và dấu tích thành công để dùng khi cần.
  - **Chuyển màn hình.** Fade + trượt lên nhẹ, không cắt cứng.
  - **Loading dạng Skeleton.** Chuyển sang các trang nặng (Thống kê, Timeline, Sổ sức khỏe, Tổng kết năm…) hiện ngay khung xương mờ (shimmer) rồi dựng nội dung ở khung hình kế tiếp — phản hồi tức thì thay cho spinner phủ kín màn hình 500ms như trước. Spinner toàn màn hình chỉ còn dùng cho đồng bộ đám mây và khôi phục sao lưu.
  - **Rung phản hồi (Haptic).** Rung một nhịp nhẹ khi lưu, cảnh báo, xoá, hoàn tác — nếu máy hỗ trợ; có chặn để một thao tác không rung dồn nhiều nhịp. iPhone dùng Safari không hỗ trợ rung sẽ tự bỏ qua, không lỗi.
- **Ô cài đặt "✨ Hiệu ứng chuyển động"** trong trang Thiết lập: bật/tắt toàn bộ hiệu ứng và bật/tắt rung riêng. Nếu điện thoại đang bật *Giảm chuyển động* trong phần Trợ năng, ứng dụng tự tắt hiệu ứng để tôn trọng thiết lập của máy.

## Sửa lỗi
- **Thanh tiến trình mục tiêu trên Dashboard luôn hiển thị 42% bất kể dữ liệu thật.** Gốc lỗi: một quy tắc CSS cũ ở khối V9.x ghim cứng `.bcMetric:before{width:42%!important}` và đặt SAU quy tắc dùng biến `--goal-progress`, nên đè mất giá trị thật mà `renderDashboard()` ghi ra. Nay trả lại đúng biến và cho thanh chạy mượt tới mốc thật.

## Không phá vỡ hành vi cũ
- Toàn bộ Animation System là module mới độc lập (tiền tố `ax`). Không sửa mã nguồn của bất kỳ hàm cũ nào: mọi can thiệp đi qua cơ chế bọc hàm lúc chạy (`axWrap`). Đối chiếu `BASELINE_LOCK_V14.2.0.json` (75 hàm): **cả 75 hàm giữ nguyên hash**, `INTENTIONAL_BASELINE_CHANGES` rỗng.
- Module thuần giao diện, không thêm/xoá dữ liệu người dùng. Tuỳ chọn bật/tắt lưu riêng ở `localStorage`.

## Quy trình
- `BASELINE_LOCK_V14.3.0.json`: 114 hàm (75 hàm cũ + 39 hàm `ax*` mới).
- `release_check.py`: `PREV_LOCK` trỏ `BASELINE_LOCK_V14.2.0.json`; thêm kiểm tra CSS animation, bảng thời lượng dùng chung, ràng buộc mọi hiệu ứng ≤250ms, khoảng cách fade danh sách 30~50ms, chống lạm dụng Rotate, và bắt buộc dùng `axWrap` (không được sửa hàm cũ để gắn animation).

# V14.3.0 — Animation System
Ngày: 2026-07-31

## Thêm mới
- **Bộ chuyển động dùng chung cho toàn app.** Trước đây mỗi module tự viết hiệu ứng riêng (`careModalIn`, `nmSheetUp`, `ccxPopIn`, `splashPop`, `toastIn`…) với thời lượng và đường cong khác nhau, nên cảm giác không đồng nhất. Nay toàn app dùng chung một bảng thời lượng và hai đường cong duy nhất: `--ax-ease` (ease-out tự nhiên) và `--ax-spring` (spring nhẹ, chỉ vượt đích một chút). Chỉ còn 4 kiểu chuyển động: **Fade · Slide · Scale · Spring** — không Rotate (trừ spinner), không nảy mạnh.

  | Thời lượng | Dùng cho |
  |---|---|
  | 160ms | Nhấn nút, nhấn thẻ |
  | 190ms | Đóng popup |
  | 200ms | Fade dữ liệu đổi |
  | 240ms | Mở popup, chuyển trang, chạy số, thanh tiến trình |
  | 36ms | Khoảng cách giữa 2 dòng danh sách |

- **Chạy số (Counter).** Số trên Dashboard, Thống kê và các thẻ chỉ số không nhảy thẳng tới đích nữa mà tăng dần: `0 → 50 → 120 → 390 ml`. Hiệu ứng chỉ chạy phần **số**, giữ nguyên icon và đơn vị đi kèm, nên `🍼 390ml` vẫn hiện đúng trong lúc chạy. Ô nào là mốc giờ (`2h05`, `07:30`) hoặc chưa có dữ liệu (`--`) thì để nguyên, không chạy.
- **Thanh tiến trình (Progress).** Thanh mục tiêu chăm sóc và thanh dung tích túi sữa luôn chạy từ mốc cũ sang mốc mới thay vì hiện sẵn ở đích. Khi đạt mục tiêu, thanh đổi sang màu hoàn thành kèm một nhịp phóng rất nhẹ (1.8%).
- **Popup mở bằng Spring, đóng bằng Fade + trượt xuống.** Áp cho **21 popup / bottom sheet** đang có, gồm cả những loại không dùng quy ước `.show`: hộp thoại Sổ sức khỏe 2.0 (dùng `hidden`) và sheet của Đo ồn / Đo sáng (dùng `open`). Hộp thoại giữa màn hình thì scale nhẹ + fade; bảng kéo từ đáy thì trượt lên. Đóng thì trượt xuống chứ không tắt phụt.
- **Hero fade.** Thẻ Hero trên Dashboard không còn nháy toàn bộ mỗi lần có dữ liệu mới. Chỉ đúng phần vừa đổi mới fade + scale nhẹ — ví dụ trạng thái `🟢 Đang thức` → `🟣 Đang ngủ`, dòng cữ bú kế tiếp, hoặc tên bé.
- **Timeline và danh sách hiện lần lượt.** Ghi nhận mới xuất hiện bằng Fade In + Slide Up; các dòng không đổ ra cùng lúc mà cách nhau 36ms (tối đa 14 dòng đầu, các dòng sau hiện ngay để không phải chờ). Danh sách nào nội dung không đổi thì không chạy lại hiệu ứng, tránh nhấp nháy mỗi lần lưu.
- **Nhấn thẻ và nút.** Thẻ thu còn 98% khi nhấn, thả tay nảy nhẹ bằng spring. Nút thu 97%. Bổ sung `axBtnLoading()` (spinner trong nút) và `axBtnSuccess()` (dấu ✓ + rung nhẹ) cho các thao tác cần chờ.
- **Chuyển màn hình.** Trang mới vào bằng Fade + trượt lên 8px, không chuyển cứng.
- **Rung phản hồi (Haptic).** Máy nào hỗ trợ thì rung một nhịp rất nhẹ ở 4 mốc: **Success · Warning · Delete · Undo**. Một thao tác thường bắn ra vài thông báo liền nhau (xoá → toast → thanh hoàn tác) nên có bộ chặn 140ms để máy chỉ rung **một** nhịp, không rung dồn. iPhone chạy Safari không hỗ trợ rung web thì tự bỏ qua, không báo lỗi.
- **Ô cài đặt “✨ Hiệu ứng chuyển động”** trong trang Thiết lập: bật/tắt riêng phần chuyển động và phần rung. Nếu điện thoại đang bật **Giảm chuyển động** trong Trợ năng thì app tự tắt hiệu ứng, không cần chỉnh tay.

## Sửa lỗi
- **Thanh tiến trình mục tiêu trên Dashboard luôn hiển thị 42% bất kể dữ liệu thật.** Gốc lỗi: khối CSS “V9.x” khai báo `.bcMetric:before{width:42%!important}` nằm **sau** quy tắc dùng biến `--goal-progress` do `renderDashboard()` ghi ra. Hai quy tắc cùng độ ưu tiên và cùng `!important` thì quy tắc đứng sau thắng, nên giá trị 42% ghim cứng đè lên dữ liệu thật. Nay nối lại đúng biến (`width:calc((100% - 24px) * var(--goal-progress,0))`), khớp với vệt nền `:after` đang chừa 12px mỗi bên, và bổ sung một mục kiểm tra trong `release_check.py` để lỗi này không tái diễn.
- **Chuyển trang phải chờ 500ms spinner phủ kín màn hình.** Bản cũ cố tình trì hoãn `doShowPage()` nửa giây và phủ một lớp `appLoading` mờ toàn màn hình cho mỗi lần bấm menu — chờ lâu hơn thời gian dựng nội dung thật. Nay các trang nặng (Thống kê, Timeline, Sổ sức khỏe, Tổng kết năm, Hành trình theo tháng, Kho sữa, Lịch khám, Biểu đồ, Sao lưu, Đám mây) hiện **Skeleton** ngay tại chỗ trong lúc dựng nội dung — có phản hồi sau khoảng 2 khung hình thay vì 500ms. Spinner phủ kín màn hình chỉ còn dùng cho việc thật sự lâu và không đoán trước được: đẩy/kéo dữ liệu đám mây.

## Tương thích dữ liệu
- Không thêm, đổi hay xoá bất kỳ trường dữ liệu nào. Tuỳ chọn hiệu ứng nằm riêng ở khoá `meYeuBeAnimPref_v1` của trình duyệt, không nằm trong `db` nên không ảnh hưởng sao lưu, xuất file hay đồng bộ đám mây.
- Tắt hiệu ứng thì app quay đúng về hành vi của V14.2.0, kể cả spinner 500ms khi chuyển trang.

## Quy trình
- Đối chiếu `BASELINE_LOCK_V14.2.0.json` (75 hàm): **75/75 hàm giữ nguyên hash**, `INTENTIONAL_BASELINE_CHANGES` để rỗng. Lý do: Animation System không sửa một dòng nào của mã cũ — mọi chỗ cần can thiệp đều **bọc hàm lúc chạy** bằng `axWrap()`, nên văn bản mã nguồn của các hàm bị khoá không đổi.
- `BASELINE_LOCK_V14.3.0.json` khoá 114 hàm: 75 hàm cũ + 39 hàm mới của Animation System.
- `release_check.py` bổ sung 5 nhóm kiểm tra mới: (1) đủ 25 hàm bắt buộc của Animation System, (2) đủ keyframes và biến CSS dùng chung, (3) thanh tiến trình phải nối với `--goal-progress`, (4) mọi thời lượng ≤ 250ms và khoảng cách fade danh sách trong 30~50ms, (5) không lạm dụng Rotate và bắt buộc dùng `axWrap` thay vì sửa hàm cũ.

# V14.2.0 — Sửa cuộn ngang popup, xuất báo cáo, hạn dùng khi chuyển sữa + gỡ Nhật ký & Sức khỏe mẹ
Ngày: 2026-07-31

## Sửa lỗi
- **Hộp thoại kéo ngang qua lại được** (rõ nhất ở *Thêm mũi tiêm* và *Thêm nhanh*). Gốc lỗi: khung hộp thoại đặt `overflow-y:auto` còn `overflow-x` để mặc định, mà theo CSS khi một trục là `auto` thì trục kia tự nâng thành `auto` — nên khung luôn sẵn sàng cuộn ngang. Phần tử gây tràn là ô `input[type=date]` / `type=time`: trên iOS chúng có bề rộng tối thiểu nội tại, `width:100%` không ép nhỏ lại được. Nay khoá trục ngang ở khung (`overflow-x:hidden`, `touch-action:pan-y`) và ép nội dung con không tràn (`max-width:100%`, `min-width:0`), áp cho **toàn bộ** popup chứ không riêng hai hộp thoại bị báo lỗi. Mở hộp thoại cũng luôn về mép trái, không giữ vị trí cuộn của lần trước.
- **Xuất báo cáo bị kẹt, không đóng và không quay lại được.** Gốc lỗi: báo cáo mở bằng `window.open('','_blank')`; trên trình duyệt máy tính tab mới có nút đóng nên không sao, nhưng khi app chạy dạng PWA (đã Thêm vào màn hình chính) thì cửa sổ mới **không có thanh điều hướng, không có nút đóng, không có nút Back**. Nay báo cáo hiển thị trong một popup tách riêng ngay trong app: nút **✕** ở góc, nút **Đóng** ở chân, chạm ra ngoài cũng đóng được; muốn in hoặc lưu PDF thì bấm **🖨 In / Lưu PDF**, in thẳng khung nội dung mà vẫn ở trong app. Nội dung báo cáo giữ nguyên 100%, chỉ đổi cách hiển thị.
- **Chuyển sữa từ ngăn đông về ngăn mát bị cấp sai hạn dùng.** Công thức cũ cho sữa đã rã đông trọn 96 giờ của ngăn mát, trong khi sữa mẹ rã đông chỉ nên dùng trong 24 giờ và không được cấp đông lại. Nay app nhận diện trường hợp rã đông (đông / đông sâu → mát / túi đá / nhiệt độ phòng) và gợi ý hạn 24 giờ kể từ lúc chuyển, kèm cảnh báo rõ ràng.

## Thêm mới
- **Tự nhập hạn sử dụng khi chuyển sữa.** Popup Chuyển sữa có thêm nút **🕒 Tự nhập hạn dùng** mở ô chọn ngày giờ, đã điền sẵn gợi ý của app nên chỉ cần chỉnh phần muốn đổi. Đổi *Ngày chuyển* / *Giờ chuyển* / *Bảo quản ở* thì gợi ý được nạp lại theo. Khung xem trước ghi rõ hạn đang đến từ đâu: *bạn tự nhập* / *sữa rã đông — tính lại 24 giờ* / *tính lại theo nơi bảo quản mới* / *giữ nguyên như túi gốc*. Túi mới và giao dịch Chuyển sữa lưu thêm cờ `expireManual`, `thawed` để truy vết.

## Gỡ bỏ
- **Module Nhật ký đã gỡ hoàn toàn** — 26 hàm và 3 trang (`#diary` Thêm nhật ký, `#diaryBook` Cuốn nhật ký, `#diaryType` Loại nhật ký), mục Nhật ký ở menu trái, mục **Danh mục → Loại nhật ký**, chip lọc và chỉ mục **Nhật ký** trong Tìm kiếm toàn app, tuỳ chọn `📖 Nhật ký` của thanh dưới, cùng 21 quy tắc CSS chết đi kèm.
  - Lưu ý: mục **Nhật ký chăm sóc** (timeline bú / ngủ / tã) là module khác và **không** bị ảnh hưởng.
- **Sức khỏe mẹ đã gỡ** — trang `#health`, hai hàm `saveMom` / `resetMomForm` và mục ở menu trái. Sổ sức khỏe 2.0 đã có hồ sơ riêng cho Mẹ nên trang cũ chỉ còn trùng lặp.

## Thay đổi
- **Menu bên trái**: dòng *Phiên bản hiện tại* nay nằm sát ngay trên thanh dưới. Trước đó khoảng trống là do hai lớp đệm cộng dồn (`.sidebar` 16px + `.sideFoot` 84px, cộng thêm hai lần vùng an toàn của máy có thanh Home) tạo ra tới ~168px, trong khi thanh dưới chỉ chiếm 66px. Nay chừa đúng 76px — sát thanh dưới, còn một khe hở nhỏ, không đè lên nhau.
- Danh sách tuỳ chọn thanh dưới: nút cũ `diaryBook` / `diary` chuyển sang **Nhật ký chăm sóc**, `diaryType` sang **Loại lịch khám**, `health` sang **Sổ sức khỏe**. Cấu hình cũ của người dùng được chuyển tự động nên không mất nút.
- Bảng **Thêm** ở thanh dưới: mục Danh mục đổi phụ đề thành *Loại lịch khám / bình túi trữ sữa*.

## Tương thích dữ liệu
- `db.diary`, `db.diaryTypes`, `db.mom` **không bị xoá**. Chỉ giao diện bị gỡ; dữ liệu vẫn nằm trong sao lưu, xuất JSON / ZIP / SQLite / CSV và đồng bộ đám mây, khôi phục lại được nguyên vẹn.
- `normalize()` giữ nguyên phần chuẩn hoá cho cả ba nhóm dữ liệu trên.
- Đối chiếu `BASELINE_LOCK_V14.1.0.json` (61 hàm): 60 hàm giữ nguyên; riêng `hb2ExportProfile` thay đổi **có khai báo** để sửa lỗi kẹt màn hình báo cáo.

## Quy trình
- `release_check.py` bổ sung cơ chế `INTENTIONAL_BASELINE_CHANGES`: hàm nằm trong Baseline Lock chỉ được phép đổi khi khai báo kèm lý do, và được in ra mục *THAY ĐỔI CÓ CHỦ Ý* thay vì báo lỗi. Hàm không khai báo mà đổi vẫn báo lỗi hồi quy như cũ; khai báo thừa (trỏ vào hàm không có trong lock trước) cũng bị báo lỗi để buộc dọn sạch khi bump bản.

# V14.1.0 — Khoá cuộn popup + gỡ Sổ sức khỏe V1
Ngày: 2026-07-30

## Sửa lỗi
- **Mở popup/modal thì nền vẫn cuộn được.** Bộ khoá cuộn cũ (V12.0) chỉ nhận diện popup theo quy ước đặt tên `[class*="Overlay"].show`, nên các popup không theo quy ước đó — điển hình là toàn bộ hộp thoại của Sổ sức khỏe 2.0 (`.hb2Modal` dùng lớp `hidden`) và bảng **Thêm** ở thanh dưới (`.moreSheet.show`) — không bao giờ được khoá. Nay đổi sang nhận diện theo biểu hiện thật của phần tử: `position:fixed`, đang hiển thị (không `display:none`, không trong suốt, không `pointer-events:none`) và phủ ≥85% chiều ngang, ≥60% chiều dọc màn hình. Mọi popup hiện có và popup thêm về sau đều tự được khoá, không cần khai báo thêm.
- Khi mở popup, trang nền không còn nhảy về đầu: vị trí cuộn được ghi nhớ trước lúc khoá và trả về đúng chỗ cũ khi đóng.
- Cuộn hết nội dung trong popup không còn "kéo lây" ra trang nền (`overscroll-behavior:contain` cho các panel và lớp phủ).

## Gỡ bỏ
- **Sổ sức khỏe phiên bản đầu tiên (V1) đã gỡ hoàn toàn**, gồm cả chức năng "Thêm sổ sức khỏe" cũ:
  - Xoá 2 trang `#healthBook` (Thêm sổ sức khỏe) và `#healthBookView` (Xem sổ sức khỏe).
  - Xoá các hàm V1: `saveHealthBook`, `editHealthBook`, `resetHealthBookForm`, `healthBookSnapshot`, `healthBookIdentityHtml`, `healthHistoryHtml`, `healthBookBlockHtml`, `renderHealthBookView`, bộ editor vaccine cũ (`addHealthVaccineRow`, `removeHealthVaccineRow`, `setHealthVaccineRows`, `getHealthVaccineRows`, `vaccineSummary`, `vaccineListHtml`) và hai hàm menu `toggleHealthBookMenu`, `openHealthBookMenu`.
  - Menu bên trái: 3 mục con gộp lại thành một mục **Sổ sức khỏe** trỏ thẳng vào module 2.0.

## Thay đổi
- Bảng **Thêm** ở thanh dưới: mục Sổ sức khỏe nay mở module 2.0; bổ sung thêm mục **Ghi nhận sức khỏe** mở thẳng hộp Thêm nhanh (đo, tiêm, khám, thuốc, xét nghiệm, ghi chú).
- Danh sách tuỳ chọn thanh dưới: `healthBookView` đổi thành `healthBook2`. Người dùng đã cấu hình nút cũ được tự động chuyển sang module 2.0 (`migrateBottomNavId`) nên không mất nút.
- Cột mốc tự động **"Mũi tiêm đầu tiên"** đổi nguồn: đọc mũi tiêm từ Sổ sức khỏe 2.0 (`db.hb.members` có `rel = 'Con'`, trạng thái *Đã tiêm*), đồng thời vẫn đọc dữ liệu V1 cũ đã lưu để không mất cột mốc đã sinh trước đây.

## Tương thích dữ liệu
- `db.healthBook` (dữ liệu V1) **không bị xoá**. Chỉ giao diện V1 bị gỡ; dữ liệu vẫn nằm trong sao lưu, xuất file và đồng bộ đám mây, và vẫn là nguồn cho migration một lần sang `db.hb`.
- Người dùng chưa từng mở app kể từ V14.0.0 vẫn được migration đầy đủ khi mở bản này.
- Không sửa bất kỳ hàm nào trong `BASELINE_LOCK_V14.0.0.json`.

# V14.0.0 — Sổ sức khỏe 2.0 (Health Book 2.0)
Ngày: 2026-07-30

## Thêm mới
- **Sổ sức khỏe 2.0**: hồ sơ sức khỏe độc lập cho từng thành viên gia đình (Bé, Mẹ, Ba, Ông, Bà, Khác). Mỗi thành viên một hồ sơ khép kín, không dùng chung dữ liệu.
- Danh sách thành viên dạng chip ngang, bấm để chuyển hồ sơ, bấm lại để xem avatar lớn.
- Thêm thành viên: avatar, họ tên, quan hệ, ngày sinh, giới tính, nhóm máu, chiều cao, cân nặng, email, SĐT.
- Thông tin y tế: mã BHXH, mã BHYT, ngày hết hạn, nơi đăng ký khám, bệnh viện thường khám, bác sĩ theo dõi, liên hệ khẩn cấp.
- Tiền sử: tiền sử bệnh, bệnh nền, dị ứng (thuốc/thực phẩm/hải sản/phấn hoa/khác), phẫu thuật, tiền sử gia đình.
- Ghi chú sức khỏe và tệp đính kèm (ảnh toa thuốc, ảnh BHYT/BHXH, PDF khám bệnh, ảnh sổ tiêm).
- Dashboard thành viên: tình trạng sức khỏe, cân nặng, chiều cao, BMI (người lớn) / vòng đầu (bé), nhóm máu, tiêm chủng, khám gần nhất, thuốc đang dùng, cảnh báo mũi tiêm quá hạn.
- Biểu đồ tăng trưởng WHO cho thành viên là Con: cân nặng, chiều dài/cao, vòng đầu theo tuổi, kèm Z-score, bách phân vị và nhận xét tự động. Không hiển thị với Ba/Mẹ/Ông/Bà.
- Tiêm chủng: trạng thái Đã tiêm / Sắp tới / Quá hạn / Chưa lên lịch, kèm nơi tiêm, bác sĩ, phản ứng sau tiêm, ảnh sổ tiêm.
- Khám bệnh: bệnh viện, bác sĩ, triệu chứng, chẩn đoán, điều trị, thuốc, chi phí, BHYT, ghi chú.
- Thuốc: nhắc uống, đánh dấu đã uống theo ngày, ngừng thuốc.
- Xét nghiệm: nhóm theo Máu / Nước tiểu / Xquang / MRI / CT / Siêu âm / Khác, kèm chỉ số chi tiết.
- Timeline sức khỏe với bộ lọc Tất cả / Tiêm / Khám / Thuốc / Xét nghiệm / Chỉ số.
- Báo cáo theo Tuần / Tháng / Quý / Năm: số lần khám, số lần tiêm, thuốc, xét nghiệm, tăng cân, tăng chiều cao, BMI, chi phí. Xuất bản in / PDF.
- Nút thêm nhanh với 7 mục: đo cân nặng, đo chiều cao, tiêm chủng, khám bệnh, thuốc, xét nghiệm, ghi chú.
- Trang Mở rộng tương lai: huyết áp, đường huyết, SpO2, nhịp tim, ECG, nhiệt độ, Lux, dB, AI đánh giá, Apple Health, Google Fit.
- Xuất toàn bộ hồ sơ sức khỏe của thành viên để in hoặc lưu PDF mang đi khám.

## Cải tiến
- Tái sử dụng bộ chuẩn WHO LMS có sẵn từ V13.10.0 thay vì dựng bảng chuẩn mới, nên số liệu Z-score và bách phân vị thống nhất toàn app.
- Hồ sơ của bé tự lấy thêm số đo từ mục Sau sinh và ngày sinh từ Thiết lập.
- Giao diện dùng biến CSS sẵn có nên đồng bộ cả ba chế độ sáng / tối / hồng.

## Tương thích
- Dữ liệu Sổ sức khỏe cũ được tự động chuyển sang hồ sơ mới, đồng thời **giữ nguyên** dữ liệu và hai trang cũ (Thêm / Xem sổ sức khỏe).
- Dữ liệu mới nằm trong `db.hb` nên tự động có trong sao lưu và đồng bộ đám mây, không thay đổi `exportDB` / `importDB`.
- Baseline Lock đối chiếu với V13.10.0: 0 hàm cũ bị thay đổi.


# MeYeuBe V13.10.0

## 🌍 Biểu đồ tăng trưởng WHO
Trước đây trang **Biểu đồ phát triển sau sinh** chỉ vẽ lại đúng những con số Boss đã nhập: cân nặng đi lên, chiều dài đi lên — nhưng không trả lời được câu hỏi thật sự của một người mẹ: *lên như vậy là đủ chưa?*

Bản này bổ sung thẻ **Biểu đồ tăng trưởng WHO**, đặt số đo của bé cạnh Chuẩn tăng trưởng trẻ em WHO 2006 (0–5 tuổi) cho ba chỉ số: **cân nặng theo tuổi**, **chiều dài/cao theo tuổi** và **vòng đầu theo tuổi**.

### Cách đọc biểu đồ
- **Dải xanh** giữa hai đường −2 SD và +2 SD là khoảng bình thường. Đường hồng của bé nằm trong dải này là ổn.
- **Hai dải vàng** (±2 → ±3 SD) là vùng cần theo dõi.
- **Đường xanh đậm ở giữa** là mức trung bình của trẻ cùng tuổi, cùng giới.
- Chạm vào từng chấm để xem ngày đo, tuổi lúc đo, giá trị, z-score và bách phân vị.

### Ô tóm tắt
Ngay trên biểu đồ là kết quả của **lần đo mới nhất**: giá trị đo, z-score, bách phân vị, mức trung bình WHO ở đúng tháng tuổi đó, khoảng bình thường tương ứng, một nhãn đánh giá và một câu gợi ý nên làm gì.

Nhãn đánh giá theo đúng ngưỡng WHO:
- Cân nặng theo tuổi: dưới −3 SD → *suy dinh dưỡng thể nhẹ cân, mức nặng*; −3 đến −2 SD → *suy dinh dưỡng thể nhẹ cân*; −2 đến +2 SD → *bình thường*; trên +2 SD → *cao hơn chuẩn*.
- Chiều dài/cao theo tuổi: dưới −3 SD → *thấp còi mức nặng*; −3 đến −2 SD → *thấp còi*.
- Vòng đầu: ngoài ±2 SD → *nhỏ / lớn hơn chuẩn*, kèm gợi ý cho bé khám nhi khoa.

### Cần thiết lập gì
WHO có bảng chuẩn **riêng cho bé trai và bé gái**, nên bản này thêm trường **Giới tính của bé** vào Thiết lập hồ sơ. Chọn một lần là xong; cũng có thể chọn nhanh ngay trong thẻ biểu đồ. Ngoài ra cần **Ngày sinh bé** vì mọi thứ tính theo tháng tuổi — nếu thiếu, thẻ sẽ hiện lời nhắc kèm nút mở thẳng trang Thiết lập.

### Chuyện đơn vị
Ô "Cân nặng" trong app vốn cho nhập tự do `kg/g`. Thẻ WHO tự nhận diện: số lớn hơn 100 chắc chắn là gam nên chia 1000; `3,5kg` và `3.5` đều hiểu là 3,5 kg. Chiều dài và vòng đầu lỡ nhập bằng mét cũng tự quy về cm.

### Về số liệu
Nhúng thẳng bảng **LMS chính thức của WHO** — 61 mốc tháng (0–60) × 3 chỉ số × 2 giới tính, khoảng 8 KB. Z-score tính theo công thức LMS chuẩn, có áp dụng **hiệu chỉnh phần đuôi ngoài ±3 SD** mà WHO quy định riêng cho các chỉ số dựa trên cân nặng. Tuổi giữa hai mốc tháng được nội suy tuyến tính.

Để chắc chắn không sai một con số nào, bản dựng đã tự tính lại toàn bộ các đường −3/−2/0/+2/+3 SD từ công thức rồi đối chiếu với cột SD in sẵn trong bảng WHO: **1.830/1.830 giá trị khớp**.

Sau 60 tháng chuẩn WHO 2006 không còn áp dụng; các điểm đo muộn hơn được tính theo mốc 60 tháng và có ghi chú cảnh báo bên dưới biểu đồ.

### Lưu ý an toàn
Toàn bộ kết quả **chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ**. Ghi chú này nằm cố định dưới mỗi biểu đồ.

## 🐞 Sửa lỗi kèm theo
App gọi `render()` **ngay trong lúc nạp script** (`mcMigrateFromNotes` → `save` → `render`). Khối WHO nằm cuối `app.js` nên tại thời điểm đó các biến của nó chưa gán xong, gây `TypeError`. Đã thêm hàm chặn `whoReady()` ở mọi cửa vào của khối; lần gọi sớm bị bỏ qua, bản dựng thật diễn ra ở sự kiện `window load` khi mọi thứ đã sẵn sàng.

---

# MeYeuBe V13.9.4

## 🔎 Tìm kiếm mở ở trạng thái sạch
Trước đây vừa mở ô tìm kiếm là app dựng ngay danh sách **toàn bộ** dữ liệu (giới hạn 500 dòng) — vừa nặng máy vừa không giúp được gì, vì người dùng mở tìm kiếm là để tìm chứ không phải để duyệt.

Nay khi **chưa nhập từ khóa và chưa chọn bộ lọc nào**, màn hình hiện lời mời nhập kèm ví dụ (`80ml` · mã túi sữa · tên thuốc · `24/07` · cột mốc), ô đếm ghi tổng số mục có thể tìm (ví dụ `1.234 mục có thể tìm`).

Ranh giới "đã lọc hay chưa" tính theo cả ba yếu tố: **từ khóa**, **chip loại dữ liệu**, **khoảng thời gian**. Chỉ cần một trong ba có giá trị là hiện kết quả bình thường — nên thói quen bấm chip rồi xem luôn không cần gõ chữ vẫn giữ nguyên. Xóa hết từ khóa bằng nút ✕ thì quay về màn hình mời nhập.

Ngoài ra, nhánh này thoát sớm **trước khi** gọi `gsFilter()`, nên lúc mở tìm kiếm không còn tốn công quét và sắp xếp toàn bộ chỉ mục.

---

# MeYeuBe V13.9.3

## 🐞 Sửa lỗi nặng: danh sách kết quả tìm kiếm bị co dẹp / mất trắng
**Triệu chứng:** gõ `80ml` → ô đếm ghi "86 kết quả" nhưng bên dưới trắng trơn. Gõ `D3` → 12 kết quả có hiện nhưng mỗi dòng bị cắt cụt, chữ đứt ngang thân, icon bẹp dí.

**Nguyên nhân:** `.gsResults` khai báo `display:flex; flex-direction:column` và có chiều cao cố định (`flex:1` + `overflow-y:auto`). Trong flex container, con mặc định `flex-shrink:1` — nên khi danh sách dài hơn khung, trình duyệt **co tất cả các dòng lại cho vừa** thay vì để tràn ra rồi cuộn. Càng nhiều kết quả co càng dữ: 12 dòng thì cắt cụt, 86 dòng thì co về chiều cao ~0.

Đây là lỗi có sẵn từ trước, không phải do bản V13.9.2 — nhưng trước đây tìm kiếm khớp cứng nên hiếm khi ra quá nhiều kết quả, tới khi tìm gần đúng trả về hàng chục dòng thì lỗi mới lộ ra.

**Sửa:** `.gsResults>*{flex:0 0 auto}` — cấm co, danh sách dài mới cuộn đúng.

## ⛶ Toàn màn hình tự nằm ngang
Làm hai tầng, tầng nào chạy được thì chạy:
1. **Chuẩn web** — xin `requestFullscreen()` rồi `screen.orientation.lock('landscape')`. Android Chrome làm được, máy xoay vật lý; khung nhìn thành ngang nên tầng 2 tự tắt.
2. **iOS Safari** không hỗ trợ khoá hướng và không cho fullscreen thẻ `div`. Khi khung nhìn còn dọc thì xoay chính lớp `.ccxFsInner` 90° bằng CSS và đảo chiều rộng/cao. Cầm máy dọc vẫn xem được biểu đồ trải hết chiều dài màn hình.

Chi tiết đáng lưu ý:
- Kích thước lớp xoay lấy từ `innerWidth`/`innerHeight` chứ **không** dùng `100vw/100vh` — trên iOS Safari `100vh` tính cả thanh địa chỉ nên biểu đồ sẽ thò ra ngoài mép.
- Tooltip nằm ở `document.body` (ngoài lớp bị xoay) nên toạ độ `position:fixed` vẫn đúng; thêm `body.ccxFsRot .ccxTip{transform:...rotate(90deg)}` để chữ đọc cùng chiều với biểu đồ.
- Nút **⟳** trên thanh tiêu đề để tự lật lại. Xoay máy thật (`orientationchange`) thì trả quyền về chế độ tự động.
- Đóng toàn màn hình sẽ gỡ khoá hướng và thoát fullscreen.

## 🔎 Tìm kiếm gần đúng — vòng 2
- **Bỏ qua dấu cách và ký tự lạ**: so thêm một bản "dán liền" của chỉ mục. `80ml` ra bản ghi ghi là `80 ml`, `d3k2` ra `Vitamin D3 + K2`, `vitamind` ra `Vitamin D`. Chỉ áp dụng cho từ khoá từ 3 ký tự trở lên để tránh khớp bừa.
- **Hiện cả hai nhóm cùng lúc.** Bản V13.9.2 giấu nhóm gần đúng khi đã có kết quả khớp chính xác. Nay nối luôn: khớp chính xác trên, gần đúng ngay dưới kèm vạch ngăn "🔎 Kết quả gần đúng". Nhóm "một phần" (chỉ khớp vài từ khoá trong nhiều từ) vẫn chỉ dùng khi hai nhóm trên trống, vì rất dễ loãng.
- Ô đếm ghi rõ: `86 kết quả (72 khớp đúng)`.

---

# MeYeuBe V13.9.2

## 👶 Thẻ thông tin bé — thời lượng ngủ đọc bằng chữ
`01:30` dễ bị đọc nhầm thành 1 giờ 30 sáng, nhất là khi ngay cạnh nó là đồng hồ thời gian thực. Nay ghi thẳng **"Đã ngủ 1 giờ 30 phút"**. Dưới 60 phút chỉ ghi số phút, tròn giờ thì bỏ phần phút, dưới 1 phút ghi "chưa tới 1 phút". Hàm `fmtHHMMDuration` cũ giữ nguyên để không ảnh hưởng chỗ khác.

## 📊 Bấm chip biểu đồ không còn văng lên đầu trang
**Nguyên nhân:** mỗi lần bấm chip là dựng lại toàn bộ `#careChartsRender`, kể cả hàng chip. Nút vừa bấm bị xóa khỏi DOM và chiều cao thẻ đổi theo từng loại dữ liệu, nên trình duyệt kẹp lại `scrollTop` và văng lên trên cùng.

**Cách sửa:**
- Hàng chip + dòng ghi chú kỳ chỉ dựng **một lần**; đổi loại chỉ thay ruột `#ccxCardHost`.
- `ccxSwapHtml()` khóa chiều cao thẻ trong lúc thay rồi khôi phục `scrollY` (ngay lập tức và lặp lại trong `requestAnimationFrame`), nhả khóa sau khi vẽ xong.
- `ccxSyncChips` chỉ cuộn **ngang** và chỉ khi chip đang chọn nằm ngoài tầm nhìn — không dùng `scrollIntoView` vì hàm đó kéo cả trang theo chiều dọc.
- Đổi Ngày/Tuần/Tháng đi cùng đường này nên cũng giữ nguyên vị trí cuộn.

## ⛶ Biểu đồ toàn màn hình cao hết mức
Trước đây chiều cao bị chặn cứng `Math.min(innerHeight-190, 460)` nên trên máy màn hình lớn còn thừa rất nhiều khoảng trống. Nay đo đúng `clientHeight` thật của khung vẽ, trừ hao phần chú thích và dòng gợi ý, sàn tối thiểu 260px. Tách `ccxFsDraw()` riêng và gắn `resize` / `orientationchange` (debounce 160ms) nên xoay ngang máy là vẽ lại vừa khít. Thêm `overflow:hidden` cho `.ccxFsPlot` làm lưới an toàn chống tràn viền.

## 🏆 Cột mốc tự động biết rút lại khi xóa dữ liệu
**Vấn đề:** cột mốc chỉ được THÊM, không bao giờ bị gỡ. Test xong xóa bản ghi thì "Lần đầu bú 150ml" vẫn nằm lại trong Hành trình lớn khôn.

**Cách sửa:** `pruneAutoMilestones()` chạy lại đúng bộ luật tự động trên một bản sao rỗng cột mốc để biết với dữ liệu **hiện tại** thì hệ thống sẽ sinh ra những key nào. Cột mốc `auto` có key không còn trong danh sách đó nghĩa là dữ liệu nuôi nó đã bị xóa → gỡ bỏ, kèm xóa thông báo tương ứng trong Trung tâm cảnh báo.

- Cột mốc **thủ công** (`auto=false` hoặc không có key) tuyệt đối không bị đụng tới.
- Gọi ngay trong `save()` nên áp dụng cho **mọi** đường xóa: chăm sóc, tăng trưởng, sổ tiêm chủng — không phải vá riêng từng nút.
- Lưu ý: nếu bạn đã thêm ảnh hoặc ghi chú riêng vào một cột mốc tự động rồi sau đó xóa dữ liệu gốc, cột mốc đó cũng mất theo (đúng như yêu cầu "không giữ lại").

## 🔎 Tìm kiếm gần đúng
**Vấn đề:** bản cũ bắt buộc **mọi** từ khóa phải khớp nguyên văn trong chỉ mục (AND tuyệt đối). Gõ "sữa mẹ" không ra "Bú mẹ trực tiếp" vì chỉ mục không chứa chữ "sua"; gõ sai một chữ cái là trắng kết quả — nên có cảm giác "không bấm chip thì không tìm được".

**Cách sửa:** mỗi từ khóa được coi là khớp khi nằm nguyên trong chỉ mục, **hoặc** là tiền tố của một từ, **hoặc** lệch tối đa 1–2 ký tự (Levenshtein có cắt sớm, ngưỡng theo độ dài từ). Kết quả chia 3 rổ:

| Rổ | Điều kiện | Khi nào hiện |
|---|---|---|
| Chính xác | mọi từ khóa khớp nguyên văn | ưu tiên cao nhất |
| Gần đúng | mọi từ khóa khớp (có từ khớp mờ) | khi rổ trên trống |
| Một phần | chỉ một số từ khóa khớp | khi hai rổ trên trống |

Rơi xuống rổ dưới thì hiện nhãn *"Không có kết quả khớp hoàn toàn — đang hiển thị dữ liệu gần đúng nhất"*. Chip loại và khoảng thời gian vẫn lọc **trước**, nên chip và ô tìm kiếm luôn kết hợp với nhau.

Ví dụ đã kiểm thử: `sua me` → Bú mẹ trực tiếp · `vitmin` (sai chính tả) → Thuốc Vitamin D · `tha ta` → Thay tã · `150` → Cột mốc "Lần đầu bú 150ml".

---

# MeYeuBe V13.9.1

## 📊 Biểu đồ chọn theo chip (V13.9.1)
- Không còn cuộn dọc qua 10 biểu đồ. Chọn loại dữ liệu bằng hàng chip ở trên, màn hình chỉ hiện đúng 1 biểu đồ.
- Chip cuộn ngang, chip đang chọn tô đúng màu chuẩn của loại dữ liệu và tự cuộn vào giữa tầm nhìn.
- Đổi Ngày/Tuần/Tháng vẫn giữ nguyên loại dữ liệu đang xem.
- Nhẹ hơn: mỗi lần chỉ tính và vẽ 1 biểu đồ thay vì 10.

---

# MeYeuBe V13.9.0

## 📊 Nâng cấp giao diện Biểu đồ — Chart UX (V13.9.0)
- Biểu đồ lớn (262/280/300px theo Ngày/Tuần/Tháng), header thống kê + badge %.
- Tooltip khi chạm, đổi loại chart trên card (Cột/Đường/Vùng/Donut), Max/TB/Min.
- Đường Goal (đổi xanh khi đạt), so sánh kỳ trước, animation, màu chuẩn theo loại, empty state, toàn màn hình, nhận định tự động.

---

# MeYeuBe V13.8.0

## 💡 Công cụ Đo ánh sáng — Lux Meter (V13.8.0)
Giúp phụ huynh kiểm tra nhanh phòng bé đã đủ tối để ngủ hay đang quá sáng.

### Vị trí
Menu → **Công cụ** → **💡 Đo ánh sáng** (cùng nhóm với 🔊 Đo tiếng ồn).

### Nguồn dữ liệu
1. **Cảm biến ánh sáng thật** (`AmbientLightSensor`) nếu thiết bị/trình duyệt hỗ trợ — cho số Lux sát thực tế.
2. **Ước lượng qua camera sau** khi không có cảm biến (trường hợp iPhone và hầu hết trình duyệt hiện nay): lấy khung hình 64×48, tính độ sáng trung bình theo hệ số Rec.709, quy đổi qua gamma `LX_GAMMA=2.2` và hệ số `LX_CAM_K` (mặc định 1200).
   - `LX_CAM_K` là **hệ số cần hiệu chỉnh theo máy**. Muốn số sát hơn thì đo ở vài môi trường đã biết mức rồi chỉnh hằng số này.
   - Bản ghi lưu `mode` (`sensor` / `camera`); thẻ lịch sử hiện tag **📷 ước lượng** khi đo bằng camera để không gây hiểu nhầm là số đo chuẩn.

### Thang đo & biểu đồ
- **Thang log** (`log10(1+lux)/log10(1+1000)`): Lux trải 0→1000+, thang thẳng sẽ ép vùng 10–40 Lux (vùng bé ngủ) sát mép trái không đọc được. Với thang log, 18 Lux nằm ở ~43% thanh.
- **Lưới biểu đồ đặt đúng 4 ngưỡng đánh giá** (10 · 40 · 150 · 500) — đọc mức trực tiếp trên biểu đồ, không cần tra bảng.

### Thang đánh giá (theo Average)
🌑 &lt;10 Rất tối · 🌙 10–40 Ánh sáng dịu · 🟢 41–150 Ánh sáng nhẹ · ☀️ 151–500 Đủ sáng · ⚠️ &gt;500 Quá sáng. Nút ⓘ mở bottom-sheet giải thích.

### Màu sắc
Không dùng dải xanh→đỏ như Đo tiếng ồn, vì với bé thì tối là tốt (ngủ) mà sáng cũng tốt (chơi ban ngày). Màu ở đây thể hiện **tính chất** ánh sáng: chàm → tím → xanh → hổ phách → đỏ (đỏ chỉ để cảnh báo quá sáng lúc bé sắp ngủ).

### Lưu & Lịch sử
Bản ghi vào `db.luxLogs` (ngày, giờ bắt đầu–kết thúc, thời lượng, Min/Avg/Max, mode, sparkline). Lịch sử dùng chung khuôn với Đo tiếng ồn: gom nhóm theo ngày, 3 ô chỉ số, sparkline, vạch màu trái, nút xóa.

### An toàn/UX
Rời trang khi đang đo → tự tắt cảm biến và camera, gỡ thẻ video ẩn, không tạo bản ghi rác. Có xử lý lỗi quyền camera bằng thông báo thân thiện.

# MeYeuBe V13.7.1

## 🎨 Làm lại giao diện Lịch sử đo tiếng ồn (V13.7.1)

### Lỗi đã sửa
Trong `@media(max-width:640px)` app có quy tắc chung `button{width:100%}`. Nút “Xóa” của bản ghi dính quy tắc này nên bị kéo full chiều ngang, đẩy phần giờ vào một cột rất hẹp khiến chữ vỡ từng dòng và thẻ tràn khỏi màn hình. Khắc phục: nút Xóa chuyển thành nút icon 🗑 vuông 34px với `width:34px!important`, cộng `flex:0 0 auto` và `min-width:0` cho cột nội dung.

### Thiết kế mới
- **Timeline gom nhóm theo ngày**: tiêu đề ngày một lần, kèm nhãn *Hôm nay / Hôm qua* và số lần đo trong ngày.
- **Thẻ bản ghi**: vạch màu bên trái theo mức ồn; giờ bắt đầu → kết thúc làm điểm nhấn; thời lượng ở dòng dưới với ⏱.
- **Ba ô chỉ số cân bằng** (grid 3 cột): Thấp nhất / Trung bình / Cao nhất. Ô Trung bình tô theo màu mức ồn vì đánh giá dựa trên chỉ số này.
- **Sparkline** cho thấy diễn biến buổi đo (từ mảng `spark`); bản ghi cũ thiếu dữ liệu thì ẩn phần này, không lỗi.
- **Trạng thái trống** đổi thành lời mời hành động thay vì câu thông báo khô.

# MeYeuBe V13.7.0

## 🔊 Công cụ Đo tiếng ồn (V13.7.0)
Biến điện thoại thành máy đo độ ồn tham khảo để phụ huynh chủ động kiểm tra môi trường trước khi cho bé ngủ/nghỉ.

### Vị trí
Menu → **Công cụ** → **🔊 Đo tiếng ồn** (nhóm menu "Công cụ" mới, thu gọn/mở như các nhóm khác).

### Đo realtime
- Xin quyền micro khi bấm Bắt đầu; đọc dữ liệu thời gian thực bằng Web Audio (RMS → dB, có hệ số hiệu chỉnh `NM_CAL_OFFSET`).
- Cập nhật liên tục: giá trị hiện tại, Min, Max, Average, thời gian đo (hh:mm:ss), thanh mức và trạng thái màu.
- **Biểu đồ đường** cuộn theo thời gian (tối đa ~140 điểm), lưới mốc 40/50/60/70/80 dB.

### Lưu & Lịch sử
- Bấm **⏹ Dừng đo** tạo bản ghi vào `db.noiseLogs`: ngày, giờ bắt đầu–kết thúc, thời lượng, Min/Avg/Max, kèm sparkline gọn.
- Lịch sử hiển thị timeline, badge đánh giá theo màu, nút xóa từng dòng.

### Thang đánh giá (theo Average)
🟢 <40 Rất yên tĩnh · 🟢 40–55 Yên tĩnh · 🟡 56–65 Hơi ồn · 🟠 66–75 Ồn · 🔴 >75 Quá ồn. Nút ⓘ mở bottom-sheet giải thích.

### An toàn/UX
- Rời trang khi đang đo → tự tắt micro, không tạo bản ghi rác.
- Xử lý lỗi quyền/không có micro bằng thông báo thân thiện.
- Ghi chú rõ: dB đo bằng micro điện thoại chỉ mang tính tham khảo, khác nhau giữa thiết bị, không thay máy đo đã hiệu chuẩn.

# MeYeuBe V13.6.0

## 🎨 Trạng thái ngủ, định dạng ngày, chi tiết theo ngày (V13.6.0)
Bốn chỉnh nhỏ theo yêu cầu của Boss.

### 1. Trạng thái "Bé đang ngủ"
- **Đổi nền pill sang tím** thay cho tông xanh cũ: nền tím nhạt `#efe7ff`, viền `#b79ae0`, chữ tím đậm `#573a8f` (dark mode: nền `rgba(140,92,246,.24)`, viền `#9d7fd8`, chữ `#d3c2f2`) — đồng bộ với vòng avatar lúc bé ngủ.
- Dòng phụ "Đã ngủ" **ăn theo màu chữ của pill** (không tô màu riêng nữa).
- **Bỏ giây**, chỉ còn **hh:mm** vì đã có bộ đếm giờ riêng — sửa cả lần vẽ đầu và hàm cập nhật mỗi giây (`fmtHHMMDuration`).

### 2. Định dạng ngày
- Chuẩn hoá về **DD/MM/YYYY** có số 0 ở đầu (05/07/2026), không còn phụ thuộc locale máy nên hiển thị nhất quán ở mọi thiết bị.

### 3. Modal xem chi tiết chăm sóc
- Mũi tên trái/phải giờ đi **theo NGÀY** thay vì theo tuần: ‹ = ngày trước, › = ngày tiếp theo (`shiftCareDetailDay`, giữ alias `shiftCareDetailWeek`).
- Nhãn/aria đổi thành "Ngày trước / Ngày sau".
- **Nới rộng ô ngày**, thu hẹp ô tổng số lần bên phải (tỷ lệ cột 1.75 : 1) để thấy rõ ngày — áp dụng ở cả bản desktop lẫn mobile.

### 4. Chi tiết Hút sữa hiển thị bình/túi chứa
- Thêm hàm `pumpContainerInfo` (ưu tiên túi đã liên kết, fallback về `containerId`).
- Thẻ ghi nhận hiện chip **loại + tên** (vd 🍼 Bình · Fatz 1️⃣); popup chi tiết đầy đủ thêm dòng **"Bình / Túi chứa"**.
- Dữ liệu cũ không có container thì bỏ qua để tránh gắn nhãn sai.

## 🎨 Gọn lại kho sữa, bé bú và form thay tã (V13.5.0)
Theo **phương án A — Gọn tối giản** Boss đã chốt, kèm hai chỉnh nhỏ.

### 1. Thẻ trong Kho sữa
- **Bỏ hẳn chỗ lặp**: trước đây số ml hiện ở hàng tiêu đề *và* lại hiện thêm một lần nữa ở ô “Dung tích” phía dưới. Nay chỉ còn đúng một chỗ.
- **Đảo vị trí theo yêu cầu**: thời gian còn lại (“Còn 21 giờ”) lên hàng tiêu đề bên phải; **dung tích xuống dòng riêng bên dưới**, chữ to rõ, kèm **nhãn loại 🍼 Bình / 🥛 Túi**.
- Nơi bảo quản gộp vào dòng meta chung với Tạo / Hút / HSD, nên thẻ ngắn hơn hẳn. Lưới bên dưới chỉ còn xuất hiện khi mục đó có ghi chú riêng.
- Ô tổng quan đổi từ “Tổng số túi · 4 túi” thành **“Bình / Túi · 3 bình · 1 túi”**; tiêu đề danh sách đổi thành **“Danh sách bình / túi”**; popup chi tiết một mục cũng hiện đúng loại thay vì mặc định ghi “Túi sữa”.

### 2. Chi tiết Bé bú
- Không còn ghi cứng chữ “Túi” trước tên nữa. Mỗi dòng nguồn sữa hiện **nhãn loại đúng** (Bình màu xanh, Túi màu tím) rồi mới tới tên — “🍼 Bình · Fatz 1️⃣” thay vì “Túi Fatz 1️⃣”.
- **Số ml của cữ bú được in đậm** cho dễ liếc. Cữ bú mẹ trực tiếp không có số ml thì không in đậm nhầm.

### 3. Form Thay tã
- Bỏ dãy nút **1 / 2 / 3 / ＋** rối mắt, thay bằng **một ô số lượng duy nhất** với nút **− và ＋** hai bên, mặc định **1**.
- **Giới hạn 1–3 tã mỗi lần ghi**: chạm đáy thì nút − tự mờ đi, chạm trần thì nút ＋ tự mờ, có dòng nhắc “tã · tối đa 3”. Nhập thẳng số lớn hơn cũng bị kẹp về 3.
- Bản ghi cũ có số lượng lớn hơn 3 vẫn mở Sửa được bình thường, chỉ bị kẹp về mức tối đa mới.

- Test Node + jsdom trên đúng code thật: **51/51 PASS** cho bộ mới, và **38/38 · 14/14 · 67/67 · 94/94** khi chạy lại bốn bộ test cũ.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.4.3 không đổi — xem `BASELINE_LOCK_V13.5.0.json`.

# MeYeuBe V13.4.3

## 🎛 Chỉ hiện bình/túi đang ở trạng thái "Đang dùng" (V13.4.3)
> Bản này thay cho bản 13.4.2 gửi trước đó. Khác biệt: **bỏ hẳn ngoại lệ** — trước còn giữ lại mục đã ẩn khi mở Sửa bản ghi cũ, nay không hiện ở bất cứ đâu ngoài trang Danh mục.

- **Quy tắc tuyệt đối, không ngoại lệ.** Bình/túi khác trạng thái “Đang dùng” **không xuất hiện ở bất kỳ chỗ chọn dữ liệu nào** — cả form Ghi nhận Hút sữa lẫn popup Chuyển sữa, kể cả khi đang Sửa một bản ghi cũ vốn đã chọn mục đó.
- **Gom về một hàm dùng chung** `mcSelectableList()` để hai màn hình không thể lệch nhau, và về sau thêm màn hình mới cũng chỉ cần gọi đúng hàm này.
- **Chặn cả khi gọi thẳng**: chọn một mục đang Tạm ẩn đều bị từ chối kèm thông báo, không chỉ ẩn khỏi danh sách.
- **Không âm thầm lưu sai.** Nếu bản ghi cũ đang gắn một mục nay đã Tạm ẩn thì giá trị đã lưu **vẫn giữ nguyên** (không tự xoá), nhưng ô gợi ý bên dưới báo rõ: “Bản ghi này đang gắn X — mục đó đã chuyển sang Tạm ẩn nên không còn trong danh sách”.
- **Báo đúng lý do khi danh sách rỗng**: phân biệt “tất cả đang Tạm ẩn” với “chưa khai báo mục nào”, thay vì luôn nói “chưa có”.
- **Dọn danh mục nhanh hơn nhiều.** Trang Danh mục Bình / Túi trữ sữa nay có:
  - thanh tóm tắt **“N đang dùng · M tạm ẩn”**;
  - nút lọc **“Chỉ hiện đang dùng”** (ghi nhớ lựa chọn);
  - nút **Tạm ẩn / Bật lại một chạm** ngay trên từng dòng, không phải mở form Sửa rồi đổi ô trạng thái rồi bấm Lưu. Có Hoàn tác đầy đủ.
  - Sửa và Xoá vẫn trỏ đúng mục kể cả khi đang bật bộ lọc.
- Test Node + jsdom trên đúng code thật: **38/38 PASS** cho bộ mới, và **14/14 · 67/67 · 94/94** khi chạy lại ba bộ test cũ.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.4.1 không đổi — xem `BASELINE_LOCK_V13.4.3.json`.

# MeYeuBe V13.4.1

## 🐞 Fix: bấm "Chuyển" không thấy giao diện chuyển sữa (V13.4.1)
- **Lỗi chính — popup bị che hoàn toàn.** Popup Chuyển sữa để `z-index:120`, trong khi popup chi tiết Kho sữa là `135`, popup chọn túi là `160`, form ghi nhận là `155`. Khi bấm nút 🔄 Chuyển từ trong popup chi tiết Kho sữa, popup vẫn mở đúng nhưng **nằm bên dưới lớp phủ** nên nhìn như không có gì xảy ra. Đã nâng lên `166`, trên mọi popup khác và vẫn dưới thông báo Toast.
- **Lỗi 2 — vừa vuốt xong bấm ngay thì bị chặn.** `tfOpen()` kiểm tra `__milkSwipeLock`, nhưng khoá đó sinh ra chỉ để chặn cú *chạm vào thẻ* (mở chi tiết) ngay sau khi vuốt. Bấm thẳng vào nút hành động luôn là chủ ý nên không được chặn — hai nút Sửa và Huỷ túi vốn không hề kiểm tra khoá này. Đã bỏ, đồng thời tự đóng thẻ đang vuốt khi mở popup.
- **Lỗi 3 — popup phía sau không cập nhật.** Chuyển sữa xong, danh sách trong popup chi tiết Kho sữa vẫn hiện số liệu cũ cho tới khi đóng mở lại. Đã vẽ lại giống cách nút Huỷ túi đang làm.
- **Lỗi 4 — đóng popup làm mở khoá cuộn nền sớm.** `tfClose()` gỡ `careModalOpen` vô điều kiện, khiến nền cuộn được trong khi popup chi tiết vẫn đang mở. Nay chỉ gỡ khi không còn popup nào khác mở.
- Test Node + jsdom trên đúng code thật: **14/14 PASS** cho bộ test tái hiện lỗi (đã xác nhận fail 6/14 trên bản V13.4.0), **67/67** cho bộ Chuyển sữa và **94/94** cho bộ Bình/Túi.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.4.0 không đổi — xem `BASELINE_LOCK_V13.4.1.json`.

# MeYeuBe V13.4.0

## 🔄 Chuyển sữa giữa bình và túi (V13.4.0)
- **Chuyển sữa là một giao dịch mới, không sửa lịch sử.** Trước đây muốn đổi dụng cụ chứa thì phải sửa thẳng bản ghi hút sữa, làm toàn bộ lịch sử đổi theo và sai với thực tế (lúc hút là hút vào bình). Nay app tạo thêm một giao dịch **Chuyển sữa** — bản ghi hút sữa gốc **giữ nguyên tuyệt đối**.
- **Thao tác**: vào Kho sữa, vuốt sang trái trên một bình/túi → **✏️ Sửa · 🔄 Chuyển · 🗑 Huỷ túi**. Nút Chuyển chỉ hiện với túi đang còn sữa.
- **Popup chuyển sữa** hiện đầy đủ thông tin nguồn (dung tích ban đầu, còn lại, nơi bảo quản, hạn dùng), cho chọn **Bình** hoặc **Túi** rồi chọn đích trong danh mục, nhập dung tích chuyển (có nút “Tất cả”), ngày giờ chuyển và nơi bảo quản mới. Khung xem trước hiện ngay nguồn còn bao nhiêu và bên nhận được bao nhiêu.
- **Chuyển toàn bộ** → nguồn về 0ml, trạng thái **“Đã chuyển hết”**. **Chuyển một phần** → nguồn giữ phần còn lại, bên nhận là một mục mới trong kho.
- **Chuyển nhiều lần** thoải mái: hút 160ml vào Bình tím → chuyển sang Túi Unimom 160ml → chuyển tiếp 60ml sang Bình Fatz, kho còn Túi Unimom 100ml + Bình Fatz 60ml.
- **Hạn dùng xử lý cẩn thận**: giữ nguyên nơi bảo quản thì **giữ nguyên hạn cũ, không reset đồng hồ**; đổi nơi bảo quản thì tính lại theo nơi mới, và **cảnh báo rõ nếu hạn dùng bị kéo dài** kèm nhắc “sữa đã rã đông thì không được cấp đông lại”.
- **Truy vết trọn vòng đời**: túi mới giữ mốc **ngày giờ hút gốc** nên mã túi tự sinh vẫn đúng ý nghĩa; thẻ trong Kho sữa hiện dòng “🔄 Chuyển từ …”.
- **Bé bú sau khi chuyển** chỉ dùng nơi đang thực sự chứa sữa — bình đã chuyển hết không còn được tự gắn.
- **Xoá & Hoàn tác an toàn**: xoá giao dịch chuyển sữa sẽ trả sữa về nguồn và bỏ mục đã tạo; app **chặn xoá** nếu sữa đó đã được cho bé bú một phần hoặc đã chuyển tiếp sang nơi khác.
- Chuyển sữa **không bị tính vào** tổng bé bú hay tổng sữa hút trong thống kê ngày.
- Test bằng Node + jsdom trên đúng code thật: **67/67 PASS** cho tính năng mới, **94/94 PASS** khi chạy lại toàn bộ bộ test V13.3.0.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.3.0 không đổi — xem `BASELINE_LOCK_V13.4.0.json`.

# MeYeuBe V13.3.0

## 🍼 Danh mục Bình/Túi & tự gắn túi theo số ml (V13.3.0)
- **Danh mục dùng chung mới: Bình / Túi trữ sữa** (Menu → Danh mục → Bình / Túi trữ sữa). Mỗi mục khai báo Loại là **Bình** (dùng lại nhiều lần, khai báo từng cái) hoặc **Túi** (dùng một lần, chỉ cần một dòng chung). App theo dõi bình nào **đang chứa sữa / đang trống**, và không cho xoá bình đang có sữa trong kho.
- **Hút sữa chọn bình/túi bằng chip** thay vì gõ tên vào ô Ghi chú. Chọn Bình thì kho hiển thị đúng tên bình (vd "Fatz 1️⃣"); chọn Túi thì app tự đặt mã riêng theo ngày giờ hút dạng **YYMMDD-HHMM** (vd 260725-2330) để phân biệt từng túi. Ô Ghi chú vẫn giữ nguyên cho các nội dung khác.
- **Bé bú từ kho sữa: nhập số ml là app tự gắn bình/túi, và tính lại NGAY mỗi lần đổi số ml.** Đây là điểm khác căn bản so với bản trước — trước đây chỉ tính một lần nên sửa số ml thì danh sách túi cũ nằm lại gây sai dữ liệu.
- Thứ tự ưu tiên: **hạn dùng gần nhất trước**; cùng hạn thì **túi ít ml trước** (dọn sạch túi lẻ); cùng nữa thì túi tạo trước. Túi cuối chỉ lấy đúng phần còn thiếu, không lấy dư.
- Ví dụ với kho Bình 1 (30ml, 1 ngày) · Bình 2 (50ml, 2 ngày) · Túi 1 (80ml, 3 ngày): bú **80ml** → Bình 1 + Bình 2 · sửa **30ml** → chỉ Bình 1 · sửa **90ml** → Bình 1 + Bình 2 + Túi 1 (10ml, còn 70ml).
- **Kho không đủ** thì vẫn gắn hết mức có thể và cảnh báo rõ còn thiếu bao nhiêu ml.
- **Tôn trọng thao tác tay**: bấm ✕ bỏ một bình là app chuyển sang chế độ **THỦ CÔNG** và ngừng tự đổi; có nút **↻ Cho app tự chọn lại** để quay về tự động. Khi **Sửa** một ghi nhận đã lưu, app khoá ở chế độ thủ công, tuyệt đối không đè lên túi đã chọn.
- **Nhắc hủy phần còn lại** khi một túi dùng một lần bị mở dở, vì túi đã mở thường không giữ được lâu.
- **Tự chuyển đổi dữ liệu cũ** một lần: đọc ghi chú của các túi sữa đang có trong kho, tạo bình tương ứng trong danh mục rồi gắn ngược lại. Ghi chú dài (mô tả thật) được giữ nguyên, không biến thành tên bình.
- **Đã gỡ bỏ hoàn toàn tính năng tự động điền của bản thử nghiệm trước** (điền sẵn lượng bú/lượng hút/thuốc/loại tã, nhãn GỢI Ý, chip ghi chú) theo yêu cầu.
- Test bằng Node + jsdom trên đúng code thật: **94/94 PASS**.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.2.3 không đổi — xem `BASELINE_LOCK_V13.3.0.json`.

# MeYeuBe V13.2.3

## 🛠 Toast + Hoàn tác hiện song song, fix tràn nút (V13.2.3)
- **Khôi phục Toast "...thành công"**: theo phản hồi, chỉ hiện Snackbar Hoàn tác một mình gây khó hiểu. Nay khi Thêm mới/Xóa dữ liệu, **cả Toast xác nhận VÀ Snackbar Hoàn tác cùng hiện** — Toast phía trên, Snackbar Hoàn tác phía dưới, tách bạch rõ ràng, không đè lên nhau.
- **Sửa lỗi tràn viền nút Hoàn tác**: nguyên nhân là 1 rule CSS toàn cục `button{width:100%}` áp dụng cho mọi nút trên màn hình nhỏ, vô tình kéo giãn nút "Hoàn tác" full chiều ngang. Đã thêm `width:auto!important` riêng cho nút này (giống cách các nút khác trong app đã xử lý) — nút Hoàn tác nay đúng kích thước dạng pill gọn như thiết kế.
- Test bằng Node trên code thật: xác nhận cả Toast và Snackbar cùng xuất hiện đúng nội dung khi Thêm/Xóa; các test hồi quy rollback kho sữa và live-refresh modal (V13.2.0–V13.2.2) chạy lại vẫn PASS.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.2.2 không đổi — xem `BASELINE_LOCK_V13.2.3.json`.

# MeYeuBe V13.2.2

## 🛠 Bỏ chồng chéo Toast/Snackbar Hoàn tác (V13.2.2)
- **Sửa lỗi giao diện chồng chéo**: khi Thêm mới/Xóa dữ liệu, trước đây vừa hiện Toast "...thành công" (nền xanh/đỏ, z-index rất cao, gần vị trí thanh điều hướng) VỪA hiện Snackbar "Hoàn tác" cùng lúc — hai lớp đè lên nhau gây rối mắt, khiến nút Hoàn tác trông như bị vỡ/tràn.
- Nay với 12 điểm Thêm mới/Xóa có Undo, **chỉ còn Snackbar** làm xác nhận (không hiện thêm Toast trùng lặp). Toast ngắn vẫn giữ nguyên cho các trường hợp **Sửa** dữ liệu (không có Undo) và các thông báo cảnh báo/lỗi khác — không đổi.
- Tăng z-index của Snackbar lên trên Toast để phòng trường hợp hiếm hai lớp vẫn xuất hiện cùng lúc (vd Toast từ một thao tác không liên quan trong lúc Snackbar cũ chưa hết 8 giây).
- Test bằng Node trên code thật: xác nhận Thêm/Xóa qua `saveCareEvent`/`deleteCareEvent` không còn phát Toast trùng lặp, trong khi Sửa dữ liệu vẫn phát Toast như trước; các test hồi quy về rollback kho sữa và live-refresh modal chi tiết (V13.2.0–V13.2.1) vẫn PASS.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.2.1 không đổi — xem `BASELINE_LOCK_V13.2.2.json`.

# MeYeuBe V13.2.1

## 🛠 Sửa giao diện Snackbar Hoàn tác + Live-refresh sau Undo (V13.2.1)
- **Sửa lỗi bố cục Snackbar**: chữ thông báo bị vỡ dòng từng chữ một do thiếu `min-width:0` trên phần tử flex chứa chữ (lỗi flexbox kinh điển trên Safari/iOS). Nay chữ luôn nằm gọn 1 dòng, tự rút gọn kèm "..." nếu quá dài.
- **Thiết kế lại bố cục Snackbar**: thêm icon ✓ trong khung tròn riêng biệt bên trái, chữ thông báo ở giữa, nút "Hoàn tác" dạng pill màu hồng thương hiệu bên phải — rõ ràng, dễ bấm hơn.
- **Sửa lỗi Undo không cập nhật modal đang mở**: trước đây, xóa hoặc thêm dữ liệu trong modal "Xem chi tiết theo loại", rồi bấm Hoàn tác, dòng dữ liệu không hiện lại ngay — phải đóng rồi mở lại modal mới thấy. Nay `Hoàn tác` sẽ tự vẽ lại đúng modal đang mở (và kết quả Tìm kiếm nếu đang mở), dòng vừa Thêm mới/Xóa hiện lại ngay lập tức, không cần thao tác gì thêm.
- Test bằng Node+jsdom trên code thật: mô phỏng mở modal chi tiết Thay tã → xóa bản ghi → Hoàn tác → xác nhận dòng dữ liệu hiện lại ngay trong modal đang mở, không cần đóng/mở lại — PASS.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.2.0 không đổi — xem `BASELINE_LOCK_V13.2.1.json`.

# MeYeuBe V13.2.0

## ↩️ Undo sau khi Thêm mới/Xóa (V13.2.0)
- **Snackbar Hoàn tác**: sau khi Thêm mới hoặc Xóa dữ liệu, hiện Snackbar dưới màn hình "✓ Đã ghi nhận [loại]." / "✓ Đã xóa [loại]." kèm nút **Hoàn tác**, tự trượt lên từ dưới, tự biến mất sau **8 giây** bằng hiệu ứng fade out.
- Bấm **Hoàn tác**: khôi phục lại đúng như trước khi thao tác — rollback toàn bộ dữ liệu liên quan (vd Bé bú từ kho sữa: xóa record, trả sữa về túi, khôi phục trạng thái túi, Dashboard/Statistics/Timeline tự cập nhật theo).
- Chỉ 1 Snackbar tại 1 thời điểm; ghi nhận liên tục thì Snackbar mới thay Snackbar cũ (Undo chỉ hoàn tác được thao tác gần nhất).
- Áp dụng cho **Thêm mới** và **Xóa** ở: Bé bú, Hút sữa, Ngủ, Thay tã, Uống thuốc, Nhiệt độ, Trớ sữa, Lịch khám, Milestone (kể cả xóa qua Tìm kiếm), Nhật ký (kể cả xóa qua Tìm kiếm), Sổ sức khỏe, Chỉ số thai kỳ/bé/mẹ, Hủy túi sữa.
- **Không áp dụng** cho: Sửa dữ liệu, Import Database, Restore Backup, thao tác hàng loạt — đúng như phạm vi yêu cầu.
- Cơ chế: snapshot toàn bộ DB ngay trước khi Thêm/Xóa, Hoàn tác = khôi phục lại đúng snapshot đó qua `save()` gốc — đảm bảo đúng như chưa từng thao tác, không cần viết logic đảo ngược riêng cho từng loại dữ liệu.
- Test bằng Node + jsdom trên chính code đã build (không phải code viết lại riêng để test): mô phỏng đúng kịch bản xóa 1 lần bú từ kho sữa rồi Hoàn tác — xác nhận cả bản ghi và túi sữa khôi phục chính xác; mô phỏng luồng Thêm mới Thay tã qua đúng form thật rồi Hoàn tác — xác nhận xóa đúng bản ghi vừa tạo.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.1.0 không đổi — xem `BASELINE_LOCK_V13.2.0.json`.

# MeYeuBe V13.1.0

## 🧷 Gọn form Ghi nhận + phân biệt Tã ướt/Tã bẩn (V13.1.0)
- **Sửa lỗi hiển thị sai ngữ cảnh**: banner "Ghi nhận theo mô hình liên kết: hút sữa sẽ tự tạo kho sữa; bé bú từ sữa đã hút sẽ tự trừ kho đang bảo quản" trước đây luôn hiện ở MỌI loại chăm sóc (kể cả Thay tã, Uống thuốc, Thân nhiệt, Trớ sữa) dù chỉ liên quan Bé bú/Hút sữa. Tương tự, 2 nút "⏱ Bắt đầu Bú" / "⏱ Bắt đầu Ngủ" cũng luôn hiện dù chỉ có tác dụng với Bé bú/Ngủ.
- Nay banner và 2 nút Timer chỉ hiện khi đang chọn loại **Bé bú, Hút sữa hoặc Ngủ**; các loại còn lại (Thay tã, Uống thuốc, Thân nhiệt, Trớ sữa) ẩn cả hai — form gọn hẳn lại.
- **Số lượng tã**: bỏ bộ đếm lớn (nút −/giá trị/nút ﹢) vốn trùng chức năng với hàng nút chọn nhanh; giờ chỉ còn 1 hàng gọn **1 · 2 · 3 · ﹢**. Khi số lượng vượt quá 3, nút ﹢ tự hiện số đã chọn (vd "﹢4") thay vì luôn hiện số ở một khối riêng.
- **Phân biệt Tã ướt / Tã bẩn trong danh sách ghi nhận**: thẻ bản ghi "Tã bẩn" (có đi phân) được tô nền màu ấm nhạt (nâu/cam) để nổi bật ngay khi lướt nhanh qua danh sách, không cần đọc chữ; "Tã ướt" giữ nguyên nền mặc định. Áp dụng cho cả 2 theme sáng/tối.
- Không đổi dữ liệu lưu, luồng lưu, các loại chăm sóc khác, Kho sữa, Search, Backup & Version Control (V13.0.0) hay bất kỳ tính năng nào khác.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V13.0.0 không đổi — xem `BASELINE_LOCK_V13.1.0.json`.

# MeYeuBe V13.0.0

## 🗂 Backup & Version Control dữ liệu (V13.0.0)
- **Version Control cho toàn bộ dữ liệu**: mỗi lần bấm "📸 Tạo Backup" (hoặc khi Backup tự động chạy) app lưu một **phiên bản** (v1, v2, v3…) chứa trọn vẹn dữ liệu tại thời điểm đó — Bé bú, Hút sữa, Kho sữa, Milestone, Lịch khám, Nhật ký, Sổ sức khỏe, Chỉ số, Cấu hình. Lưu riêng trong **IndexedDB** của trình duyệt (không dùng chung ô nhớ với dữ liệu chính `meYeuBePWA_v4`) nên không lo đầy bộ nhớ như khi lưu nhiều bản trong localStorage.
- **Backup thủ công**: nút "📸 Tạo Backup" trong màn 💾 Dữ liệu, có thể ghi chú (vd "Trước khi cập nhật Dashboard").
- **Backup tự động**: cấu hình Tắt / Hằng ngày / Hằng tuần / Hằng tháng / Khi có hơn X thay đổi. Chỉ kiểm tra được khi mở app (PWA/iOS không chạy nền lúc app đã đóng) — mỗi khi mở app, hệ thống kiểm tra và tự tạo Backup nếu đến hạn. Giữ tối đa 20 bản tự động gần nhất, bản thủ công không bao giờ tự xoá.
- **Lịch sử phiên bản dạng Timeline**: mỗi Version hiển thị tên (v1, v2…), ngày giờ, dung lượng, người tạo (Bạn/Tự động) và ghi chú.
- **Restore kèm Preview khác biệt**: trước khi khôi phục, xem trước số bản ghi thêm/bớt theo từng loại (vd +20 Bé bú, −1 Milestone, +3 Túi sữa) so với dữ liệu hiện tại. Xác nhận bằng cách gõ đúng **KHOIPHUC** — không thể bấm nhầm.
- **Export dữ liệu hiện tại hoặc từng phiên bản** ra 4 định dạng: **JSON** (giữ nguyên cấu trúc, có thể Nhập lại), **ZIP** (kèm manifest tóm tắt), **SQLite** (bảng quan hệ có thể mở bằng DB Browser for SQLite hoặc công cụ khác — thư viện sql.js tải qua mạng ở lần xuất đầu tiên), **CSV** (mỗi loại dữ liệu 1 file trong ZIP, dùng cho Excel/Sheets — chỉ xuất, không hỗ trợ nhập lại).
- **Import dữ liệu** từ file .json / .zip / .sqlite: kiểm tra hợp lệ + dung lượng + phiên bản xuất, xem trước khác biệt, rồi chọn **Ghi đè toàn bộ** hoặc **Gộp dữ liệu**. Khi Gộp, nếu trùng ID (Bé bú, Hút sữa, Kho sữa, Milestone) được chọn 1 trong 3 cách áp dụng cho toàn bộ: Bỏ qua / Ghi đè / Giữ cả hai; Lịch khám, Nhật ký, Sổ sức khỏe, Chỉ số không có ID ổn định nên luôn được nối thêm, không mất dữ liệu. App tự tạo 1 Backup an toàn ngay trước khi Ghi đè/Gộp.
- Toàn bộ là hàm/giao diện mới (tiền tố `bk`), không sửa `exportDB`/`importDB` (thuộc Baseline Lock) hay `save`/`load` gốc — chỉ gọi lại để đọc/ghi. Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V12.2.1 không đổi — xem `BASELINE_LOCK_V13.0.0.json`.
- Chưa làm ở bản này: Cloud Backup (Google Drive/OneDrive/Firebase) — để dành cho bản sau khi có tài khoản đăng nhập.

# MeYeuBe V12.2.1

## 🐞 Search: hiển thị mặc định tất cả kết quả, không cần chọn điều kiện (V12.2.1)
- Sửa lỗi: mở màn Tìm kiếm mà chưa gõ từ khóa hoặc chưa chọn bộ lọc/khoảng thời gian nào thì không thấy kết quả nào, phải bấm chọn ít nhất 1 điều kiện mới ra dữ liệu.
- Nay khi vừa mở Tìm kiếm (chưa gõ gì, chưa chọn lọc), app hiển thị ngay **toàn bộ dữ liệu, sắp xếp mới nhất lên đầu** — không giới hạn 60 dòng như trước.
- Việc gõ từ khóa hoặc chọn bộ lọc vẫn hoạt động bình thường để thu hẹp kết quả.
- Thêm cơ chế tự dựng lại chỉ mục tìm kiếm nếu vì lý do nào đó chỉ mục rỗng khi lọc, tránh tình trạng màn hình trống dù đã có dữ liệu.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V12.2.0 không đổi — xem `BASELINE_LOCK_V12.2.1.json`.

# MeYeuBe V12.2.0

## 🔍 Tìm kiếm toàn app (V12.2.0)
- Thêm **một ô tìm kiếm duy nhất** quét toàn bộ dữ liệu của bé — không cần nhớ dữ liệu nằm ở module nào. Hai điểm vào: **nút 🔍 trên Header** và mục **Tìm kiếm** trong Menu chính (ngay dưới Dashboard).
- Phạm vi tìm: Bé bú, Hút sữa, Kho sữa, Thay tã (gồm cả đi tè/đi phân), Ngủ, Thuốc, Nhiệt độ, Trớ sữa, Milestone (Hành trình phát triển), Nhật ký và Lịch khám.
- Tìm được theo: **Ngày** (24/07 · 24 Jul · 24-07-2026), **Giờ** (15:30), **Số ml** (70ml · 120), **Loại hoạt động** (bú, hút, ngủ, thay tã, đi tè, đi phân, thuốc…), **Ghi chú** (tên bình, ghi chú tự do), **Mã túi sữa** (260724-03 hoặc 260724), **Tên thuốc** (Paracetamol, Vitamin D3), **Tên cột mốc** (Lật, Biết cười…). Không phân biệt dấu tiếng Việt để gõ nhanh trên điện thoại.
- **Khoảng thời gian nhanh**: Hôm nay · Hôm qua · Tuần này · Tháng này (bấm chip hoặc gõ thẳng trong ô tìm).
- **Bộ lọc theo loại** (chọn nhiều loại cùng lúc) và **Sắp xếp**: Mới nhất · Cũ nhất · Liên quan nhất.
- Mỗi kết quả hiển thị icon, loại dữ liệu, tiêu đề, thời gian, thông tin chính và ghi chú; **từ khóa khớp được tô sáng**.
- **Quick Action**: bấm để mở chi tiết đúng bản ghi; **vuốt sang trái** để Sửa hoặc Xóa ngay trong màn tìm kiếm.
- Overlay tìm kiếm dùng chung cơ chế khoá cuộn nền `careModalOpen` (chỉ cuộn trong popup, nền phía sau không cuộn), không khoá chồng với các popup khác.
- Toàn bộ là hàm/giao diện mới (prefix `gs`), không chạm vào 26 hàm lõi. Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V12.1.1 không đổi — xem `BASELINE_LOCK_V12.2.0.json`.

# MeYeuBe V12.1.1

## 🐞 Sửa lỗi khoá cuộn chồng ở modal chăm sóc (V12.1.1)
- Sửa lỗi: từ Dashboard bấm xem một loại chăm sóc rồi đóng và bấm sang loại khác thì màn hình chỉ còn nền tối mờ, modal không hiện. Nguyên nhân là khoá cuộn nền chung (mybScrollLock, V12.0) khoá chồng lên khoá sẵn có của modal (careModalOpen) trên body có backdrop-filter, gây iOS không vẽ được modal.
- Nay mybScrollLock chỉ khoá nền cho các popup không tự khoá (xem ảnh Milestone/avatar, bottom sheet Daily Streak); các modal app vẫn dùng khoá gốc careModalOpen như trước — không còn khoá chồng.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V12.1.0 không đổi — xem `BASELINE_LOCK_V12.1.1.json`.

# MeYeuBe V12.1.0

## ✨ Avatar trạng thái · Xem ảnh · Daily Streak — đợt 2 (V12.1.0)
- Vòng màu quanh avatar theo trạng thái bé: 🟢 đang thức · 💜 đang ngủ (các trạng thái đang bú/ốm/tiêm/quấy mở rộng sau).
- Bấm avatar để xem ảnh toàn màn hình đúng tỷ lệ, chạm 2 lần hoặc chụm 2 ngón để zoom (1×–4×), vuốt xuống / bấm ✕ để đóng.
- **Daily Streak**: widget 🔥 + số ngày ghi chép liên tục ngay trên header (dạng chữ, cạnh nút dark mode); bấm mở bảng chi tiết gồm trạng thái hôm nay, kỷ lục, ngày bắt đầu chuỗi, tổng ngày dùng app, tỷ lệ ngày có ghi chép và huy hiệu 🥉7/🥈30/🥇100/👑365. Tính theo ngày địa phương, mỗi ngày chỉ cần ≥1 bản ghi; bỏ lỡ 1 ngày thì chuỗi về 0.
- **Realtime "Cữ bú tiếp theo"**: thời gian còn lại và màu mức khẩn tự cập nhật theo phút, không cần load lại trang.
- Popup mới tự hưởng khoá cuộn nền chung. Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V12.0.0 không đổi — xem `BASELINE_LOCK_V12.1.0.json`.
- (Bản kế: V12.2 kéo thả sắp xếp block ở màn Cấu hình Dashboard.)

# MeYeuBe V12.0.0

## 🎨 Nâng cấp UI/UX Dashboard — đợt 1 (V12.0.0)
- Tăng khoảng trắng cho Dashboard thoáng và cao cấp hơn (không đổi bố cục): khoảng cách giữa các block lên **24px**, padding Hero/thẻ lên **20px**, khoảng cách icon–tiêu đề thẻ lên **13px**.
- Chuẩn hoá hệ màu dùng chung một bộ token: 🩷 hồng (bú/bình/kho sữa/CTA) · 💜 tím (ngủ) · 💙 xanh (tã/tè/chăm sóc) · 🟠 cam (milestone) · ❤️ đỏ (cảnh báo/quá hạn/lỗi) · 🩶 xám (label/metadata) — không thêm màu chủ đạo mới; áp trước cho các chỉ số "Chăm sóc hôm nay".
- "Cữ bú tiếp theo" gộp thành **1 dòng gọn ngay trong block Thông tin bé**: `🍼 Cữ bú tiếp theo <giờ> · còn 01 giờ 20 phút`, có vạch + chấm màu theo mức khẩn (🟢 còn nhiều thời gian · 🟠 sắp đến giờ <30 phút · 🔴 đã quá giờ); chưa đủ dữ liệu thì báo xám "chưa đủ dữ liệu để dự đoán".
- **Khoá cuộn nền cho mọi popup/modal**: khi mở bất kỳ overlay nào, giao diện nền phía sau không cuộn được, chỉ cuộn nội dung trong popup — áp cho cả các popup trước đây chưa khoá (xem ảnh Milestone, trung tâm thông báo, cảnh báo thông minh, form ghi nhận, chi tiết chăm sóc, túi sữa). Dùng MutationObserver + class riêng, không đụng hàm Baseline Lock.
- Regression Lock: 26/26 hàm lõi ở BASELINE_LOCK_V11.7.0 không đổi — xem `BASELINE_LOCK_V12.0.0.json`.
- (Các bản kế: V12.1 avatar vòng trạng thái + xem ảnh/zoom + Daily Streak; V12.2 kéo thả sắp xếp ở màn Cấu hình Dashboard.)

# MeYeuBe V11.7.0

## 🎨 Kho sữa bỏ icon, màu theo hạn dùng — phương án B (V11.7.0)
- Bỏ toàn bộ **6 emoji app tự thêm** trong mỗi thẻ túi (🗓 Tạo · 🍼 Hút · 🕐 HSD · 💧 Dung tích · ❄️ Vị trí · 🕐 HSD còn lại) — nhãn chữ đã nói đủ ý. Đo màn Kho sữa 7 túi: **45 emoji → 3**, và 3 emoji còn lại đều là emoji người dùng tự gõ trong tên bình ("Bình bú 🍼", "Tím mập 🟣"), app không thêm cái nào.
- Chấm màu đầu thẻ đổi nghĩa: trước đây mã hoá **tên bình**, nay mã hoá **mức hạn dùng còn lại** theo đúng thang quy ước — 🟢 từ 24 giờ trở lên · 🟡 12–23 giờ 59 · 🟠 6–11 giờ 59 · 🔴 1–5 giờ 59 · ‼️ dưới 1 giờ · ⚫ quá hạn hoặc đã đóng. Cùng ngưỡng với `milkUrgencyIcon` nên hai chỗ không lệch nhau.
- Bỏ vạch màu bên trái thẻ vì nó lặp lại đúng thông tin của chấm màu.
- Huy hiệu góc phải đổi từ "Đang bảo quản" thành **thời gian còn lại tô màu theo mức hạn dùng** ("Còn 20 giờ", "Còn 35 phút"). "Đang bảo quản" là trạng thái mặc định nên không in ra nữa; túi đã dùng hết / đã bỏ thì huy hiệu hiện trạng thái đó, màu xám.
- Thêm `milkTimeLeftShort` cho huy hiệu: dưới 1 giờ đọc theo phút, dưới 1 ngày theo giờ, dưới 30 ngày theo ngày, còn lại theo tháng — sữa trữ đông không còn hiện "Còn 179 ngày 10 giờ" tràn cả hàng.
- Hàng ô rút từ 4 xuống **3 ô** (`Ghi chú bình · Dung tích · Vị trí`): ô "HSD còn lại" bỏ đi vì số giờ đã nằm ở huy hiệu góc phải. Ô canh trái, nhãn nhỏ trên, giá trị đậm dưới.
- Bỏ tô màu tên bình: việc phân biệt bình dựa vào chính tên bình người dùng gõ, để trong thẻ chỉ còn **một tín hiệu màu duy nhất** là hạn dùng.
- Dòng meta chỉ hiện "Hút" khi giờ hút khác giờ tạo túi — với dữ liệu thật hai giờ này gần như luôn trùng nhau nên hàng meta rút còn `Tạo … · HSD …`.
- Popup chi tiết túi dùng chung màu và huy hiệu hạn dùng với thẻ; phần nội dung 11 dòng giữ nguyên (vẫn có dòng "HSD còn lại" đầy đủ, không rút gọn).
- Đo iPhone 390px: chiều cao 1 thẻ 113px → **102px**, và không còn trường hợp thẻ nở lên 127px do chữ "Còn 1 ngày 3 giờ" xuống 2 dòng; tổng chiều cao danh sách 7 túi 897px → **794px (−11%)**. Cỡ chữ nhỏ nhất 9px, lớn nhất trong thẻ 13px.
- Không đổi dữ liệu lưu, luồng lưu, luồng huỷ túi, vuốt Sửa/Huỷ, bộ lọc và các tính năng khác so với V11.6.0.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.6.0 không đổi (26/26) — xem `BASELINE_LOCK_V11.7.0.json`.

# MeYeuBe V11.6.0

## 🧊 Kho sữa gọn, modal kín màn hình (V11.6.0)
- Modal chi tiết chăm sóc kéo xuống sát mép dưới màn hình: bỏ lề dưới của lớp phủ (safe-area chuyển vào chân modal), chiều cao dùng `100dvh` nên không còn hụt khi thanh công cụ trình duyệt ẩn/hiện. Đo iPhone 390×844: khoảng trống thừa dưới modal 38px (10px + safe-area) → **0px**, vùng cuộn danh sách 497px → **598px (+20%)**.
- Bỏ nút "Sửa túi" nằm trong mỗi thẻ túi sữa. Vuốt sang trái trên túi giờ mở 2 nút: **✏️ Sửa** (xanh) và **🗑 Huỷ túi** (đỏ). Túi đã dùng hết / đã bỏ chỉ hiện nút Sửa và vẫn vuốt được — trước đây các túi này bị khoá vuốt nên không sửa lại được sau khi đã đóng.
- Thiết kế lại thẻ túi sữa theo bản mẫu: vạch màu nhận diện bình bên trái + chấm màu · mã túi · dung tích · huy hiệu trạng thái; một dòng meta `🗓 Tạo · 🍼 Hút · 🕐 HSD`; và hàng 4 ô `Ghi chú bình | Dung tích | Vị trí | HSD còn lại`.
- Màu nhận diện bình băm từ tên bình trong ghi chú ra 1 màu cố định trong bảng 8 màu, nên hoạt động với mọi cách đặt tên ("Bình bú 🍼", "Fatz 1️⃣") — thay cho cách dò chữ tên màu ở V11.4.1 vốn không kích hoạt với dữ liệu thật.
- Bấm vào một túi mở popup chi tiết túi sữa: dung tích ban đầu, còn lại, đã cho bé bú, đã bỏ, vị trí bảo quản, trạng thái, thời điểm hút, HSD, HSD còn lại, ghi chú bình, lý do huỷ; chân popup có nút Sửa túi / Huỷ túi.
- Khối "Tổng quan kho sữa" đổi 4 ô thành: **Tổng dung tích (ml) · Tổng số túi · Dự kiến dùng hết · Sắp hết hạn**. "Dự kiến dùng hết" tính từ lượng còn lại chia cho lượng bú từ kho trung bình 7 ngày gần nhất; "Sắp hết hạn" đếm túi đang bảo quản còn dưới 24 giờ.
- Bộ lọc kho sữa rút từ khối 2 dòng có nút Ẩn/Hiện xuống **1 hàng chip**: `🔎 Bộ lọc · Trạng thái ⌄ · Vị trí ⌄`; chip đang lọc đổi viền hồng và hiện thẳng giá trị đang chọn. Thanh cố định phía trên modal 251px → **162px (−35%)**.
- Số bản ghi trên tiêu đề đọc đúng đơn vị: "3 record" → "3 túi" ở Kho sữa, "5 lần" ở các loại chăm sóc khác.
- Đo iPhone 390px màn Kho sữa: chiều cao 1 thẻ túi 149px → **127px (−15%)**, tổng chiều cao danh sách 5 túi 890px → **661px (−26%)**, số túi nhìn trọn vẹn cùng lúc 1 → **3**. Cỡ chữ nhỏ nhất 9px, lớn nhất trong thẻ 13px.
- Không đổi dữ liệu lưu, luồng lưu, luồng huỷ túi, bộ lọc và toàn bộ tính năng khác so với V11.5.0.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.5.0 không đổi (26/26) — xem `BASELINE_LOCK_V11.6.0.json`.

# MeYeuBe V11.5.0

## 🧹 Dọn nhiễu danh sách ghi nhận — phương án A (V11.5.0)
- Bỏ toàn bộ emoji ở nhãn số liệu và hàng túi sữa (📦 Lấy từ kho, 👶 Bé bú thực tế, 🍼 Còn lại sau bú, 🧊 Túi sữa, ⭕ Trạng thái…). Mỗi bản ghi giờ chỉ còn đúng 1 icon loại chăm sóc; một màn Bé bú giảm từ ~42 emoji xuống 5.
- Bỏ nhãn phân loại trùng tiêu đề ở Bé bú: "Từ sữa đã hút" / "Trực tiếp" / "Sữa công thức" nói lại đúng ý của tiêu đề nên không hiện nữa. Các loại khác vẫn giữ nhãn vì nó mang thông tin thật (Bên hút, Đã dậy, Số tã…), nhưng chuyển vào dòng phụ thay cho viên thuốc màu xếp dưới giờ.
- Gộp thành 1 dòng phụ duy nhất: `nhãn · giá trị · tên bình`. Số ml của cữ bú (vd "80 ml") in đậm màu chữ chính, tên bình in màu tím.
- Bỏ hộp "Ghi chú bình" có viền: tên bình chuyển vào dòng phụ. Ghi chú do người dùng nhập xuống một dòng riêng không viền, tối đa 2 dòng.
- Bỏ chấm màu tự nhận theo tên màu trong ghi chú (chỉ chạy khi ghi chú có chữ "tím", "hồng"… nên không dùng được với cách đặt tên bình theo số). Thay bằng tên bình in màu tím, hoạt động với mọi cách đặt tên.
- Khối số liệu bỏ viền và bỏ vạch chia ô, chỉ còn nền nhạt.
- Bảng số liệu Bé bú chỉ hiện khi bé bú không hết — lúc đó mới có 3 số "Lấy từ kho · Bé bú thực tế · Bỏ đi" và số "Bỏ đi" tô vàng. Cữ bú bình thường không cần bảng vì số ml đã nằm ở dòng phụ và số còn lại đã gộp vào hàng túi sữa.
- Hàng túi sữa rút gọn thành `Túi <mã> · <trạng thái> · còn <N> ml`, chấm trạng thái 6px thay cho huy hiệu tròn có ký tự ✓/○.
- Bỏ bảng số liệu của Hút sữa / Ngủ / Thay tã / Uống thuốc / Thân nhiệt / Trớ sữa: các bảng này nhắc lại y nguyên tiêu đề và dòng phụ (vd tiêu đề "Hút 120 ml" rồi bảng lại ghi "Số lượng hút 120 ml"). Dòng phụ gộp đã mang đủ thông tin.
- Kết quả đo trên iPhone 390px: tổng chiều cao nội dung 1245px → **885px (−29%)**, số bản ghi thấy cùng lúc 4 → **5**; số khối có viền trong 1 thẻ bú bình 6 → 1.
- Không đổi dữ liệu lưu, luồng lưu, vuốt sang trái để Sửa/Xóa, bộ lọc kho sữa và toàn bộ tính năng khác so với V11.4.1.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.4.1 không đổi — xem `BASELINE_LOCK_V11.5.0.json`.

# MeYeuBe V11.4.1

## 🔍 Tinh gọn giao diện chi tiết Bé bú + ghi chú túi sữa (V11.4.1)
- Kéo dài modal chi tiết: lề trên trên máy hẹp 54px → 8px (tính cả safe-area), lề dưới 20px → 10px, lề ngang 8px → 6px; vùng cuộn danh sách trên iPhone 390px tăng 530px → 635px (+20%), số bản ghi thấy cùng lúc 2 → 4.
- Hạ cỡ chữ toàn khối modal chi tiết về đúng hệ chung: tiêu đề loại 24px → 19px (máy ≤430px 17.5px), avatar 52px → 40px → 36px; thẻ Ngày/Tổng số lần 15px → 13px, icon 34px → 28px; khối Tổng quan tiêu đề 17px → 14.5px, số liệu 16px → 14px, icon ô 38px → 30px.
- Thẻ bản ghi gọn lại: giờ 19px → 16px, tiêu đề 15px → 13.5px, nhãn phân loại 10.5px → 9.5px, bảng 3 số liệu 14px → 12.5px, hàng túi sữa 11.5px → 10.5px; padding thẻ 12px → 9px.
- Khoảng cách giữa các bản ghi 12px → 16px (padding thẻ 12px → 9px): khoảng cách giữa 2 bản ghi nay gấp đúng 2× khoảng cách bên trong 1 bản ghi (8px) nên các thẻ không còn cảm giác "dính" vào nhau; đường timeline nét đứt vẫn nối liền các chấm.
- Chân modal thu gọn: nút "＋ Thêm ghi nhận" cao 54px → 44px (máy ≤430px 42px), chữ 16px → 14.5px, padding 12px → 8px; dòng gợi ý vuốt sang trái 11.5px → 10px và ép gọn 1 dòng. Tổng chiều cao footer 98px → 74px.
- Bổ sung ghi chú túi sữa trên bản ghi bú: thẻ "🍼 Ghi chú bình:" nay lấy ghi chú của túi sữa trong Kho sữa (vd "Bình tím mập", "Bình tím cao") thay vì chỉ lấy ghi chú của bản ghi như trước — dùng để phân biệt bé bú bình nào. Chấm màu tự nhận theo màu ghi trong ghi chú.
- Bản ghi có ghi chú riêng khác ghi chú túi sẽ hiện thêm thẻ "📝 Ghi chú:"; không hiện trùng khi hai ghi chú giống nhau.
- Cữ bú lấy từ nhiều túi: mỗi hàng túi sữa có chip ghi chú riêng để không lẫn túi nào là bình nào.
- Ghi chú túi được lưu thêm vào snapshot lúc bú (`extra.milkBagSnapshots[].note`), nên lịch sử vẫn hiển thị đúng tên bình sau khi túi bị xoá khỏi kho.
- Máy ≤430px: thẻ ghi chú xuống dòng riêng nhưng gói gọn 1 hàng ngang (trước là 2 dòng) để đỡ tốn chiều cao.
- Không đổi chức năng, luồng lưu và cấu trúc dữ liệu cũ so với V11.4.0; các loại chăm sóc khác (Hút sữa, Kho sữa, Ngủ, Thay tã...) dùng chung hệ cỡ chữ mới.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.4.0 không đổi — xem `BASELINE_LOCK_V11.4.1.json`.

# MeYeuBe V11.4.0

## 🍼 Nâng cấp giao diện chi tiết Bé bú (V11.4.0)
- Thanh tiêu đề modal chi tiết: avatar tròn chứa icon loại chăm sóc, tên loại cỡ lớn kèm số bản ghi, nút ✕ bên phải; bấm vào tên loại (dấu ⌄) để đổi loại chăm sóc thay cho ô "Loại" cũ.
- Thêm 2 thẻ tóm tắt ngay dưới tiêu đề: "📅 Ngày" (bấm mở bộ chọn ngày) và "🕐 Tổng số lần" (bấm mở biểu đồ thống kê); trên máy màn hình hẹp 2 thẻ vẫn nằm cùng một hàng.
- Khối "Tổng quan" dạng 4 ô có icon: với Bé bú là Tổng lượng · Bú trực tiếp · Bú từ sữa đã hút · Sữa công thức, kèm nút "Xem thống kê ›". Các loại khác (Hút sữa, Kho sữa, Ngủ, Thay tã, Đi tè/Đi phân, Uống thuốc, Thân nhiệt, Trớ sữa) đều có bộ 4 ô tương ứng.
- Danh sách ghi nhận hiển thị theo timeline: chấm tròn hồng và đường kẻ đứt nối các bản ghi, thêm nút "Sắp xếp: Mới nhất / Cũ nhất" và ghi nhớ lựa chọn cho lần mở sau.
- Thẻ bản ghi mới: giờ cỡ lớn màu hồng, nhãn phân loại ("Trực tiếp", "Từ sữa đã hút", "Sữa công thức"), icon, tiêu đề, dòng phụ số ml và thẻ ghi chú riêng ("Ghi chú bình:" khi bú bình) có chấm màu tự nhận theo màu ghi trong ghi chú.
- Bản ghi "Bú từ kho sữa đã hút" có bảng 3 số liệu "Lấy từ kho · Bé bú thực tế · Còn lại sau bú" và hàng "Túi sữa · Trạng thái" (Đã sử dụng hết / Đang dùng / Đã bỏ) kèm chấm màu; bấm vào hàng túi sữa để mở Kho sữa. Số ml bỏ do bé không bú hết hoặc ml hủy trong túi hiển thị thành nhãn cảnh báo.
- Nút "＋ Thêm ghi nhận" chuyển xuống chân modal, rộng hết chiều ngang và luôn cố định khi cuộn; dòng gợi ý vuốt sang trái nằm ngay dưới nút.
- Trạng thái rỗng có khối riêng ("Chưa có dữ liệu") thay cho dòng chữ nhỏ như trước.
- Giữ nguyên: vuốt sang trái để Sửa/Xóa (thêm nút "›" ở góc phải thẻ để mở form sửa), bộ lọc kho sữa, thẻ túi sữa và toàn bộ dữ liệu lưu.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.3.1 không đổi — xem `BASELINE_LOCK_V11.4.0.json`.

# MeYeuBe V11.3.1

## 🔠 Cân đối cỡ chữ form Hút sữa (V11.3.1)
- Đối chiếu form Hút sữa với các form đang có và hạ cỡ chữ về đúng hệ chung: số ml 40px → tối đa 32px (bằng bộ đếm form Thay tã), nút −/＋ 52px/24px → 46px/22px, nút Bên hút 13.5px → 13px (cao 44px), chip gợi ý nhanh cao 36px → 34px.
- Thẻ Vị trí bảo quản / Trạng thái / Hạn sử dụng: hạ chiều cao 48px → 46px (ô bên trong 44px) cho ngang với ô nhập chuẩn của các form khác; icon 16px → 15px, nhãn thời gian còn lại 11.5px → 11px.
- Khối Gợi ý bảo quản: chữ mô tả 11.5px → 12px cho dễ đọc, icon 15px → 14px; khối Tóm tắt lần hút: giá trị 13px → 12.5px, icon 14px → 13px.
- Thanh tiêu đề popup Ghi nhận (áp dụng cho mọi loại chăm sóc): tiêu đề 17px → 16px (máy hẹp 16px → 15px), nút ✕ 44px → 40px, nút Lưu 14px/44px → 13.5px/42px để 3 thành phần cân nhau.
- Màn hình ≤430px: nút Bên hút 12px, nút −/＋ 44×44px (21px), giá trị tóm tắt 12px.
- Không đổi chức năng, dữ liệu lưu và hành vi so với V11.3.0; các form khác giữ nguyên cỡ chữ.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.3.0 không đổi — xem `BASELINE_LOCK_V11.3.1.json`.

# MeYeuBe V11.3.0

## 🥛 Nâng cấp giao diện Hút sữa (V11.3.0)
- Bên hút: thay dropdown bằng 3 nút chọn nhanh "Cả hai · Bên trái · Bên phải", nút đang chọn tô nền hồng chữ trắng. Giá trị lưu vào dữ liệu vẫn là "Cả hai"/"Trái"/"Phải" như cũ.
- Số lượng: bộ đếm lớn (− / số ml / ＋, bước 10ml) kèm hàng chip gợi ý nhanh 60 · 120 · 150 · 200 ml; vẫn cho nhập tay trực tiếp vào ô số.
- Vị trí bảo quản & Trạng thái: gộp thành 1 hàng 2 cột có icon, tự xếp dọc trên máy màn hình hẹp; nhãn nơi bảo quản hiển thị kèm thời hạn (Ngăn mát (4°C) · 4 ngày, Ngăn đông · 6 tháng...).
- Hạn sử dụng dự kiến: thẻ riêng có icon lịch và nhãn thời gian còn lại ("6 ngày tới", "4 giờ tới", "Đã quá hạn").
- Thêm khối "Gợi ý bảo quản" và "Tóm tắt lần hút" (Số lượng · Bên hút · Bảo quản · HSD dự kiến) cập nhật ngay khi nhập.
- Cân đối tỉ lệ: chuẩn hóa nhãn 11px in hoa, nút cao 44–52px, số ml tối đa 40px, bo góc 14–18px cho toàn bộ form Hút sữa — không còn chỗ chữ quá to, chỗ quá nhỏ; kiểm tra không tràn ngang ở màn hình 360px.
- Form Ghi nhận (mọi loại): thanh tiêu đề popup nay có ✕ bên trái, tên loại ở giữa và nút "Lưu" bên phải để lưu nhanh không cần cuộn xuống cuối.
- Ghi chú: giới hạn 200 ký tự kèm bộ đếm N/200 dưới ô nhập.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.2.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.3.0.json`.

# MeYeuBe V11.2.0

## 🧷 Nâng cấp giao diện Thay tã (V11.2.0)
- Loại tã: 2 thẻ lớn hơn, thẻ đang chọn tô nền hồng đậm kèm dấu ✓ góc trên bên phải, dễ nhận biết hơn thẻ viền mỏng cũ.
- Số lượng: thay ô nhập số bằng bộ đếm lớn (nút − / giá trị / nút ﹢) và hàng nút chọn nhanh 1 · 2 · 3 · ﹢ (bấm 1/2/3 để chọn thẳng, bấm ﹢ để tăng dần khi cần nhiều hơn 3).
- Thời gian: bản ghi Thay tã chỉ còn 1 dòng Ngày + Giờ (không hiển thị Ngày kết thúc/Đến giờ/Thời lượng vốn không áp dụng cho một lần thay tã); nhãn đổi thành "Ngày *" / "Giờ *". Các loại chăm sóc khác (Bé bú, Ngủ...) không đổi.
- Ghi chú: thu gọn mặc định sau nút "✎ Thêm ghi chú (tùy chọn)", bấm vào mới hiện ô nhập; nếu bản ghi đã có ghi chú (sửa bản ghi cũ) thì tự mở sẵn. Chỉ áp dụng khi đang nhập Thay tã.
- Fix: sửa một bản ghi "Tã bẩn" trước đó có thể tự chuyển hiển thị về "Tã ướt" ngay sau khi mở form sửa (do một setTimeout dựng lại giao diện chạy sau và ghi đè lựa chọn đã nạp từ dữ liệu). Nay mở sửa luôn hiển thị đúng loại tã và số lượng đã lưu.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.1.3 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.2.0.json`.

# MeYeuBe V11.1.3

## 🛠️ Hoàn thiện Hành trình theo tháng (V11.1.3)
- Sửa lỗi cuộn: mở chi tiết một tháng trong "Hành trình theo tháng" nay chỉ cuộn được bên trong popup chi tiết, không còn bị cuộn ra giao diện bên ngoài phía sau.
- Bố cục các dòng Milestone trong popup chi tiết tháng: tách tiêu đề và ngày thành 2 dòng rõ ràng, không còn bị dính sát vào nhau.
- Sửa lỗi đóng popup: bấm vào một Milestone trong chi tiết tháng để xem popup chi tiết Milestone, rồi đóng popup đó giờ chỉ đóng đúng popup Milestone và quay lại popup chi tiết tháng, không còn đóng luôn cả hai popup cùng lúc.

# MeYeuBe V11.1.0

## ❤️ Kỷ niệm & Thống kê (V11.1.0)
- Menu "🏆 Hành trình lớn khôn" được gộp vào nhóm mới "❤️ Kỷ niệm & Thống kê" cùng 3 mục mới: Hành trình theo tháng, Thống kê & So sánh, Tổng kết năm.
- Hành trình theo tháng: xem lại dữ liệu của bé theo từng tháng tuổi (Milestone, số bản ghi chăm sóc, ảnh), bấm vào một tháng để xem chi tiết kèm ghi chú riêng cho tháng đó.
- Thống kê & So sánh: so sánh cữ bú/giấc ngủ/lượng sữa hút hôm nay với hôm qua, trung bình 7 ngày, 30 ngày hoặc tháng trước, có mũi tên tăng/giảm.
- Tổng kết năm: tổng kết số cữ bú, giấc ngủ, lít sữa mẹ, ảnh và Milestone theo từng năm tuổi của bé; chia sẻ thành ảnh hoặc xuất PDF.
- Dashboard không đổi (giữ nguyên hành vi Block "Hành trình lớn khôn" đã khoá ở bản trước).

# MeYeuBe V11.0.1

## Milestone Photo Viewer, Lịch khám theo ngày, Giờ đạt mốc
- Hành trình lớn khôn: bấm vào ảnh trong Album mở ảnh toàn màn hình đúng tỉ lệ gốc (không crop vuông), đóng bằng nút ✕ hoặc chạm ra ngoài.
- Cấu hình Dashboard: thêm "Lịch khám sắp tới trong vòng (ngày)" — Block Lịch khám tự ẩn nếu không có lịch trong khoảng đã cấu hình.
- Milestone tự động (Bé bú/Ngủ/Hút sữa) lưu kèm giờ đạt được, hiển thị ở màn hình chi tiết.

## Hành trình lớn khôn (Milestone Timeline) (V11.0.0)
- Menu mới "🏆 Hành trình lớn khôn": Timeline các cột mốc đáng nhớ của bé, nhóm theo ngày, mới nhất lên đầu.
- Tự động tạo Milestone ngay khi lưu dữ liệu chăm sóc đạt điều kiện (bú/ngủ/hút sữa/cân nặng/chiều dài/mũi tiêm/Vitamin D), không cần chờ mở lại app; không tạo trùng, không tự xóa khi dữ liệu gốc thay đổi.
- Tự tạo Milestone thủ công với icon, mô tả, ghi chú và tối đa 20 ảnh; Milestone tự động khoá tiêu đề/loại/ngày, vẫn cho thêm ảnh, ghi chú và chia sẻ.
- Bộ lọc theo 8 loại mốc; chia sẻ Milestone thành ảnh PNG; Thông báo trong ứng dụng khi có mốc mới.
- Cấu hình Dashboard có thêm Block "Hành trình lớn khôn": bật/tắt, đổi tên, đổi vị trí bằng nút ↑/↓, cập nhật ngay không cần khởi động lại.
