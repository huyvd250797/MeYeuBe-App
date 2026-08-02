# AC — V14.7.0 · Giao diện sáng/tối đúng ngay từ đầu & Sổ sức khỏe thay module Sau sinh
Ngày: 2026-08-02

## 1. Màn hình chờ / màn hình loading hiện đúng sáng hay tối

**Nguyên nhân bản cũ bị loé trắng:** `data-theme` chỉ được gán trong `render()` của `app.js`, mà `app.js` nằm cuối `<body>`. Splash (`#splashScreen`) và màn hình loading (`.appLoading`) đã được vẽ xong từ trước đó nhiều khung hình, nên máy đang Dark Mode vẫn thấy loé sáng rồi mới đổi sang tối.

- AC1.1 Giao diện được chốt trong **`boot.js`** — tệp nằm trong `<head>`, chạy **đồng bộ trước cả khối CSS**, nên trình duyệt chưa vẽ khung hình nào thì `<html data-theme>` đã đúng. Mở app ở Dark Mode: splash, thẻ splash, thanh tiến trình, màn hình loading, nền app **tối ngay từ điểm ảnh đầu tiên**, không loé trắng một khung hình nào.
- AC1.2 Ba chế độ: **Tự động** (theo hệ điều hành) · **Luôn sáng** · **Luôn tối**. Người dùng **chưa từng chọn** thì mặc định là **Tự động** — đúng yêu cầu "app tự kiểm tra máy đang dùng dark hay light mode".
- AC1.3 Bản cũ chỉ lưu `settings.theme` với hai giá trị `''` và `'dark'`, trong đó `''` vừa nghĩa là "sáng" vừa nghĩa là "chưa từng chọn". V14.7.0 thêm `settings.themeMode` (`auto`/`light`/`dark`); hồ sơ cũ có `theme==='dark'` được hiểu là **Luôn tối**, còn lại quy về **Tự động**. `settings.theme` vẫn được ghi giá trị đã phân giải để mọi đoạn mã cũ đọc nó không vỡ.
- AC1.4 Nút 🌗 trên thanh tiêu đề bấm lần lượt **Tự động → Luôn sáng → Luôn tối → Tự động**. Biểu tượng đổi theo chế độ đang chọn (🌗 / ☀️ / 🌙), kèm toast nói rõ chế độ; ở chế độ Tự động toast ghi thêm máy đang tối hay đang sáng.
- AC1.5 Đang ở **Tự động** mà bật/tắt Dark Mode của điện thoại (kể cả khi app đang mở) → app đổi theo **ngay lập tức**, không cần khởi động lại. Đang ở Luôn sáng / Luôn tối thì không bị hệ điều hành kéo đi.
- AC1.6 Thẻ `<meta name="theme-color">` đổi theo giao diện (`#f8b8c8` khi sáng, `#1b1216` khi tối) → thanh trạng thái của PWA không còn hồng chói trên nền tối.
- AC1.7 Mở lại app từ nền (PWA trên iOS hay giữ trang cả tuần) → giao diện được kiểm tra và gán lại một lần nữa.
- AC1.8 Toàn bộ phần đọc trong `boot.js` là **chỉ đọc** `localStorage`, có `try/catch` từng lớp. Máy chặn `localStorage` hay không hỗ trợ `matchMedia` thì rơi về giao diện sáng như cũ, không văng lỗi, không chặn khởi động.

## 2. Gỡ module "Sau sinh" — Sổ sức khỏe thay chỗ

Cân nặng / chiều dài / vòng đầu trước đây nằm ở **hai** nơi, phải gõ hai lần và cho ra hai con số khác nhau. Nay chỉ còn một nguồn duy nhất là **Sổ sức khỏe**.

- AC2.1 Menu trái không còn mục **👶 Sau sinh**. Mục **🩺 Sổ sức khỏe** trở thành mục cha, có hai mục con: **Hồ sơ sức khỏe** (`healthBook2`) và **Biểu đồ tăng trưởng** (`growthChart`).
- AC2.2 Ba màn hình `baby` / `babyStats` / `babyChart` đã gỡ khỏi `index.html`. Bảy hàm `resetBabyForm` / `saveBaby` / `renderBabyStats` / `renderBabyChart` / `showBabyChart` / `toggleBabyMenu` / `openBabyMenu` đã gỡ khỏi `app.js` — không để lại hàm chết.
- AC2.3 **Dữ liệu `db.baby` được giữ nguyên**, không xoá một bản ghi nào: vẫn nằm trong sao lưu JSON, xuất SQLite (`baby_stats`), đồng bộ Cloud, dòng thời gian Sổ sức khỏe và biểu đồ WHO.
- AC2.4 Biểu đồ chuẩn **WHO** không bị mất theo module: chuyển thành màn hình riêng **Biểu đồ tăng trưởng** (`growthChart`), vào từ menu con của Sổ sức khỏe hoặc bảng **Thêm**.
- AC2.5 `whoSeries()` gốc chỉ đọc `db.baby`; gỡ module Sau sinh mà không xử lý thì biểu đồ WHO sẽ đứng im vì số đo mới nằm ở `hb.members[].meas`. Hàm được **bọc lại** (`gw7WrapWhoSeries`, mã hàm gốc không đổi một ký tự) để lấy chuỗi điểm đã gộp của hồ sơ Bé, không có mới rơi về hàm cũ.
- AC2.6 Ô trống của biểu đồ WHO không còn nút `showPage('baby')` — lối vào chết sẽ cho ra màn hình trắng. Nay là nút **⚖️ Đo chỉ số cho bé**, mở thẳng ô đo trong Sổ sức khỏe.
- AC2.7 Nút thanh dưới người dùng từng chọn là **Phát triển** (`babyStats`) được chuyển sang `growthChart`; `babyChart` → `growthChart`; `baby` → `healthBook2`. Không ai mất nút, không nút nào trỏ vào màn hình không tồn tại.
- AC2.8 Bảng **Thêm** đổi mục **📈 Chỉ số · Thai kỳ / sau sinh** thành **📈 Biểu đồ tăng trưởng · Đối chiếu chuẩn WHO**, vẫn đi qua `nv6Go()`.

## 3. Block "Sổ sức khỏe" trên Dashboard

- AC3.1 Trang **Cấu hình dashboard** không còn module **📈 Sự phát triển của bé**. Thay bằng module **🩺 Sổ sức khỏe** — bật/tắt, đổi tên hiển thị, di chuyển vị trí y như mọi module khác.
- AC3.2 Người dùng đã sắp xếp module `growth` từ trước sẽ được **chuyển tên tại chỗ** sang `healthBook` (`gw7MigrateConfig`) — **giữ nguyên thứ tự** đã kéo thả và cả tên hiển thị tự đặt, không bị đẩy xuống cuối danh sách.
- AC3.3 Block hiện đúng bốn dòng cho ba chỉ số:

  | | Cân nặng | Chiều dài | Vòng đầu |
  |---|---|---|---|
  | Số mới nhất | 5,6 kg | 60 cm | 38 cm |
  | So lần trước | ↑ 1 kg | ↑ 4 cm | ↑ 3 cm |
  | Phần trăm | +21,7% | +7,1% | +8,6% |

  Tăng hiện màu xanh kèm ↑, giảm hiện màu đỏ kèm ↓, bằng nhau ghi "→ không đổi · 0%". Chưa có lần đo trước thì ghi "— chưa có lần trước".
- AC3.4 Mốc so sánh là **lần khai báo liền trước có chỉ số đó**, không phải bản ghi liền trước theo ngày. Chỉ số bị bỏ trống vài lần vẫn so đúng với lần cuối cùng thực sự có số.
- AC3.5 **Lần khai báo mới thiếu chỉ số nào thì lấy lại số của lần cũ** và gắn dấu **(!)** ngay cạnh con số. Chạm vào dấu (!) hiện chú thích: *"Lần khai báo ngày 01/09/2026 chưa nhập vòng đầu. Số đang hiện là dữ liệu cũ, đo ngày 01/08/2026."* Dùng chung bong bóng `showInfoBubble()` sẵn có.
- AC3.6 Dòng đầu block ghi rõ **ngày của lần khai báo mới nhất**, để không ai nhầm số cũ là số hôm nay.
- AC3.7 Số đo lấy từ hồ sơ **Bé** trong Sổ sức khỏe, gộp thêm dữ liệu Sau sinh cũ (`db.baby`) để không mất lịch sử. Trùng ngày thì **Sổ sức khỏe được ưu tiên**.
- AC3.8 Nhập nhầm đơn vị vẫn hiểu đúng: cân nặng gõ bằng gam (> 100) tự đổi ra kg, chiều dài / vòng đầu gõ bằng mét (< 10) tự đổi ra cm — cùng quy ước với `hb2FixUnit` và `whoMeasureValue` đang dùng.
- AC3.9 Chưa có số đo nào → block hiện lời mời kèm nút **⚖️ Đo chỉ số cho bé**, mở thẳng ô đo, thay vì để trống một khoảng trắng khó hiểu.
- AC3.10 Nút **Xem chi tiết ›** của block mở **Sổ sức khỏe**.

## 4. Không phá vỡ hành vi cũ

- AC4.1 So với `BASELINE_LOCK_V14.6.0.json`: **chỉ một hàm** bị sửa thân là `renderWhoGrowth`, và chỉ đúng hai dòng của ô trống (câu hướng dẫn + nút bấm) vì nút cũ trỏ tới màn hình đã gỡ — để nguyên sẽ cho ra màn hình trắng. Phần tính toán và vẽ biểu đồ không đổi một ký tự. Đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`.
- AC4.2 Chỗ nào cần đổi hành vi của hàm đã khoá đều **bọc lại**, không sửa: `whoSeries` → `gw7WrapWhoSeries`, `updateThemeButton` / `toggleTheme` → `th7WrapUI`. Toàn bộ phần mới là hàm `th7*` / `gw7*`, CSS mới và khối HTML mới.
- AC4.3 `BASELINE_LOCK_V14.7.0.json` chốt 185 hàm (161 hàm cũ + 24 hàm mới của V14.7.0).
- AC4.4 Không đụng tới `localStorage` ngoài việc ghi hai khoá thiết lập của chính người dùng (`settings.themeMode`, `settings.theme`) và một lần đổi tên module trong `dashboardConfig` → **dữ liệu của bé an toàn tuyệt đối**.
- AC4.5 Bảng thời lượng chuyển động `--ax-fast/base/slow`, `--ax-modal/--ax-sheet` giữ nguyên; vẫn tôn trọng "Giảm chuyển động" của hệ điều hành và ô tắt hiệu ứng trong app.
