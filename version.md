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
