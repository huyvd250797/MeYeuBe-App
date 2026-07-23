# Changelog

## V11.1.3 – Hoàn thiện Hành trình theo tháng (Hotfix)
- Fix: popup chi tiết tháng (Hành trình theo tháng) bị lỗi cuộn — cuộn trang lại kéo cả giao diện bên ngoài thay vì chỉ cuộn nội dung popup. Nay đã khoá cuộn nền khi popup chi tiết tháng (hoặc chi tiết Milestone) đang mở, chỉ nội dung bên trong popup cuộn được.
- Fix: các dòng Milestone trong popup chi tiết tháng hiển thị tiêu đề và ngày dính sát nhau, khó đọc. Đổi sang bố cục 2 dòng (tiêu đề trên, ngày dưới) rõ ràng, dễ nhìn hơn.
- Fix: bấm vào một dòng Milestone trong popup chi tiết tháng để mở popup chi tiết Milestone, rồi đóng popup chi tiết Milestone lại đóng luôn cả popup chi tiết tháng phía sau. Nay mỗi popup đóng độc lập — đóng popup chi tiết Milestone sẽ quay lại đúng popup chi tiết tháng đang xem, không tắt toàn bộ.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.1.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng/Thống kê/Tổng kết năm) — xem `BASELINE_LOCK_V11.1.3.json`.

## V11.1.0 – ❤️ Kỷ niệm & Thống kê
- Menu: gộp "🏆 Hành trình lớn khôn" vào nhóm mới "❤️ Kỷ niệm & Thống kê" trong menu điều hướng chính, kèm 3 mục mới: "📅 Hành trình theo tháng", "📈 Thống kê & So sánh", "🎉 Tổng kết năm". Nút "＋ Thêm cột mốc" vẫn nằm trong màn hình "Hành trình lớn khôn" như cũ.
- Hành trình theo tháng: danh sách thẻ theo từng tháng tuổi của bé (từ Ngày sinh), mỗi thẻ hiển thị số Milestone / số bản ghi chăm sóc / số ảnh trong tháng đó, mới nhất lên đầu. Bấm vào thẻ mở chi tiết: Thống kê tháng (tổng ml bú, tổng giờ ngủ, tổng ml hút), Nhật ký chăm sóc (số lượng theo loại), danh sách Milestone trong tháng, Album ảnh (lấy từ ảnh Milestone), và Ghi chú riêng có thể lưu cho từng tháng.
- Thống kê & So sánh: so sánh cữ bú, tổng giờ ngủ và lượng sữa hút của hôm nay với Hôm qua / Trung bình 7 ngày gần nhất / Trung bình 30 ngày gần nhất / Trung bình tháng trước, hiển thị mũi tiêu tăng (↑, xanh) / giảm (↓, đỏ) / không đổi.
- Tổng kết năm: chọn theo từng năm tuổi của bé (Năm đầu tiên, Năm thứ 2...), hiển thị tổng số cữ bú, số giấc ngủ, số lít sữa mẹ đã hút, số ảnh và số Milestone trong năm đó, kèm lời chúc kết thúc. Có nút "📤 Chia sẻ hình ảnh" (xuất ảnh PNG tóm tắt, dùng Web Share API hoặc tải xuống) và "🖨️ Xuất PDF" (dùng hộp thoại in của trình duyệt, chọn Lưu dưới dạng PDF). Nút "🎬 Xuất video tổng kết" hiển thị ở trạng thái sắp ra mắt, chưa hoạt động.
- Dữ liệu: thêm `db.monthlyNotes` để lưu ghi chú riêng theo từng tháng tuổi.
- Regression Lock: xác nhận các hàm lõi ở BASELINE_LOCK_V11.0.1 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine) — xem `BASELINE_LOCK_V11.1.0.json`.
- Known limitation: "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm hiện chỉ lấy từ ảnh đã gắn vào Milestone, vì bản này chưa có tính năng đính ảnh trực tiếp vào Nhật ký chăm sóc hay Nhật ký.

## V11.0.1 – Milestone Photo Viewer, Lịch khám theo ngày, Giờ đạt mốc
- Hành trình lớn khôn: bấm vào ảnh trong Album (màn hình chi tiết hoặc form thêm/sửa) mở ảnh toàn màn hình, giữ đúng tỉ lệ gốc thay vì bị crop vuông như thumbnail; bấm ✕ hoặc chạm ra ngoài để đóng.
- Cấu hình Dashboard: thêm "Lịch khám sắp tới trong vòng (ngày)" (mặc định 7, 0–365 ngày) — Block "Lịch khám sắp tới" tự ẩn hoàn toàn nếu không có lịch khám nào trong khoảng ngày đã cấu hình.
- Hành trình lớn khôn: Milestone tự động tạo từ Bé bú/Ngủ/Hút sữa nay lưu kèm giờ đạt được; màn hình chi tiết hiển thị thêm giờ bên cạnh ngày (vd "Thứ Năm, 23/07/2026 · 14:30 · Bé bú"). Milestone không có giờ (theo tuổi, phát triển, vaccine, hoặc tạo trước bản này) vẫn hiển thị bình thường.
- Regression Lock: xác nhận 12 hàm lõi ở BASELINE_LOCK_V11.0.0 không đổi (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine) — xem `BASELINE_LOCK_V11.0.1.json`.

## V11.0.0 – Hành trình lớn khôn (Milestone Timeline)
- Thêm menu mới "🏆 Hành trình lớn khôn" với Timeline hiển thị cột mốc theo ngày, mới nhất lên đầu.
- Milestone Engine tự động tạo cột mốc từ dữ liệu chăm sóc sẵn có, chạy trên mọi lần lưu dữ liệu (không chỉ lúc mở app): theo tuổi (tuần/tháng/năm), bé bú (mốc ml đầu tiên, kỷ lục, tổng số cữ), ngủ (giờ đầu tiên, ngủ xuyên đêm, tổng số giấc), hút sữa (ml đầu tiên, kỷ lục, tổng lít), phát triển (cân nặng/chiều dài), mũi tiêm đầu tiên và Vitamin D đủ 100 ngày.
- Chống tạo trùng Milestone bằng key duy nhất cho mỗi mốc; Milestone tự động là sự kiện lịch sử — không tự xóa dù dữ liệu gốc sau đó bị sửa hoặc xóa.
- Cho phép tự tạo Milestone thủ công (icon, tiêu đề, ngày, mô tả, ghi chú, tối đa 20 ảnh) — thêm/sửa/xóa tự do. Milestone tự động khoá tiêu đề/loại/ngày, chỉ cho thêm ảnh và ghi chú.
- Bộ lọc Timeline theo 8 loại: Tất cả / Theo tuổi / Bé bú / Ngủ / Hút sữa / Phát triển / Vaccine / Thủ công.
- Chia sẻ Milestone thành ảnh PNG (icon, tiêu đề, ngày, ảnh đầu tiên, tên bé) qua Web Share API hoặc tải xuống.
- Milestone mới tự động đẩy vào Trung tâm thông báo (🎉 Chúc mừng!).
- Bổ sung Block "Hành trình lớn khôn" vào Cấu hình Dashboard: bật/tắt, đổi tên hiển thị, đổi vị trí bằng nút ↑/↓ — cập nhật ngay không cần khởi động lại app, dùng chung cơ chế với các Block khác.
- Dashboard hiển thị banner "🎉 Bé vừa đạt một cột mốc mới" khi Milestone mới nhất trong vòng 3 ngày gần đây.
- Regression Lock: Cloud Sync/Realtime, Push Notification, Smart Alert, Export/Import và toàn bộ tính năng Milk Bag Picker của bản trước không đổi (hash khớp — xem `BASELINE_LOCK_V11.0.0.json`).

## V10.9.3 – Milk Bag Picker UX Hotfix & Refinements
- Fix: sửa bản ghi "Bú từ kho sữa đã hút" cũ không còn hiển thị lại danh sách túi sữa đã chọn (do cờ giữ trạng thái bị xoá sớm khi form dựng lại 2 lần). Nay mở sửa sẽ nạp lại đúng túi + số ml đã lấy từ mỗi túi.
- Form ghi nhận chăm sóc: "Ngày bắt đầu/Từ giờ" và "Ngày kết thúc/Đến giờ" hiển thị 2 cột cùng hàng (class careDateTimeRow trước đó thiếu CSS nên vẫn xuống dòng); "Từ giờ" mặc định lấy giờ hiện tại khi tạo mới.
- Icon màu túi sữa theo HSD còn lại: 🟢 ≥24h · 🟡 12–23h59 · 🟠 6–11h59 · 🔴 1–5h59 · ‼️ dưới 1h · ⚫️ đã hết hạn.
- Cấu hình Dashboard "Cữ bú tiếp theo cách (giờ)": đổi input sang dạng text + inputmode decimal để nhập được số thập phân (vd 2.5) trên mọi bàn phím; logic tính giờ (đã hỗ trợ thập phân từ V10.3.4) không đổi.

## V10.9.2 – Milk Bag Picker UX
- Ghi nhận bú từ kho sữa: đổi luồng nhập sang "nhập mục tiêu ml trước → chọn túi sữa để đủ lượng", đúng theo thiết kế UX mới.
- Thêm thanh tiến độ "Đã lấy từ kho / mục tiêu" với trạng thái Còn thiếu / Đủ lượng theo thời gian thực.
- "+ Thêm túi sữa" mở màn hình chọn túi riêng: tìm kiếm, sắp xếp, thẻ túi có nhãn hạn dùng (HSD hôm nay/ngày mai/N ngày nữa/quá hạn), nhập ml bằng nút tăng giảm và xem trước "Còn lại sau khi dùng".
- Danh sách túi đã chọn hiển thị dạng thẻ, xoá nhanh từng túi, vẫn giữ tuỳ chọn "Hủy phần còn lại trong túi" cho từng túi khi cần.
- Giữ nguyên toàn bộ tính năng "Số ml bỏ" / "Số ml bé bú thực tế" đã thêm ở bản trước.

## V10.9.1 – Pull Refresh, Notification & Feed Waste
- Kéo giao diện xuống hết mức để hiện icon xoay tròn; thả ra sẽ xoá cache Service Worker + đồng bộ lại dữ liệu + vẽ lại toàn bộ giao diện, không reload lại trang.
- Popup Thông báo: tách nhóm Mới/Đã xem rõ ràng, có chấm đỏ + nhãn "Mới" cho thông báo chưa xem.
- Popup Thông báo: bỏ nút hành động trên từng dòng; bấm cả dòng để mở đúng popup chi tiết loại chăm sóc + ngày liên quan, đồng thời đánh dấu đã xem.
- Thêm nút "Đánh dấu đã đọc" cho toàn bộ thông báo.
- Ghi nhận bú từ kho sữa: thêm "Số ml bỏ (bé không bú hết)", tự tính "Số ml bé bú thực tế" để thống kê lượng bú chính xác hơn; lượng trừ trong kho sữa vẫn giữ nguyên theo số ml lấy ra thực tế.

## V10.9.0 – Care Form Layout & Record Swipe Actions
- Ngày bắt đầu đi cùng hàng với Từ giờ; Ngày kết thúc đi cùng hàng với Đến giờ trong popup Ghi nhận chăm sóc.
- Bỏ trường Loại khỏi thân form, hiển thị loại đang chọn ngay trên tiêu đề form/popup.
- Nút Bắt đầu Bú / Bắt đầu Ngủ (và Dừng/Hủy Timer) luôn nằm cùng một hàng trên mobile.
- Màn hình chi tiết từng loại chăm sóc hỗ trợ vuốt sang trái để Sửa hoặc Xóa bản ghi, tương tự thao tác vuốt hủy túi sữa.
- Sau khi lưu sửa từ thao tác vuốt, tự quay lại đúng danh sách chi tiết đang xem.

## V10.8.4 – Care Detail & Mobile Form UX
- Rút gọn header popup chi tiết bằng bố cục 2 cột Loại/Ngày.
- Bổ sung nút Thêm ghi nhận đúng loại trong popup chi tiết.
- Sau khi lưu, tự quay lại danh sách chi tiết và hiển thị bản ghi mới.
- Mở rộng popup thêm mới, khóa scroll ngang và tối ưu không gian mobile.

## V10.8.3
- Alert/Notification kho sữa mở đúng danh sách và highlight túi liên quan.
- Trang Ghi nhận chỉ còn các block; form mở trong popup theo loại.
- Bộ lọc kho sữa hỗ trợ ẩn/hiện và ghi nhớ trạng thái.

## V10.8.2 — UX Enhancement & Notification Center
- Rút gọn toast kết nối và cập nhật dữ liệu.
- Sửa safe-area Trung tâm cảnh báo.
- Popup thêm/sửa chăm sóc.
- Trung tâm thông báo và badge chưa đọc.
- Lọc kho sữa theo bảo quản/trạng thái.
- Hút sữa không mặc định vị trí bảo quản.

## V10.8.1 — Push Delivery Hotfix
- Gửi thử thiết bị hiện tại bằng `target_endpoint`.
- Bổ sung nút Gửi thử tất cả thiết bị cùng Sync ID.
- Không báo thành công khi không có thiết bị nhận.
- Trả và hiển thị matched, sent, failed, expired.
- Bổ sung log chẩn đoán trong Edge Function.

## V10.8.1 – Device Push Notification
- Bổ sung đăng ký Web Push trên từng thiết bị.
- Bổ sung nút bật/tắt, lưu cấu hình, gửi thử và trạng thái quyền thông báo.
- Lưu `push_subscriptions` theo Sync ID, Device ID và endpoint.
- Cho phép chọn từng loại Smart Alert được phép push.
- Bổ sung Supabase Edge Function `send-push`.
- Bổ sung chống gửi lặp bằng `push_delivery_log`.
- Tự xóa subscription hết hạn khi push service trả về HTTP 404/410.
- Notification click mở app và Trung tâm cảnh báo.
- Giữ nguyên Smart Alert, Realtime JSON Sync và Cloud Sync thủ công.

## V10.8.1 — Smart Alert Navigation & Dashboard Block Hotfix
- Sửa action Ghi nhận trong Trung tâm cảnh báo để mở đúng màn hình và đúng loại chăm sóc.
- Loại bỏ lỗi dấu ngoặc kép lồng nhau trong `onclick`.
- Đổi tên block cấu hình từ “Bố mẹ cần chú ý” thành “Trung tâm cảnh báo”.
- Giữ module id `alerts` để tương thích cấu hình cũ.
- Mặc định mở phần Thông tin lúc sinh trên Dashboard.

## V10.8.1 – Smart Alert Hotfix
- Nút hành động trong Trung tâm cảnh báo mở đúng màn hình ghi nhận tương ứng.
- Rule thân nhiệt đọc đúng trường `amount`, đồng thời tương thích dữ liệu legacy `temperature`, `value`, `extra.temperature`.
- Đổi icon trạng thái thành 💚 Hôm nay mọi thứ đều ổn, ⚠️ Có việc cần chú ý, 🆘 Có việc cần xử lý ngay.
- Regression toàn bộ rule: thân nhiệt, bú quá giờ, ngủ quá lâu, túi sữa quá hạn/sắp hết hạn và lịch khám.
- Giữ nguyên Realtime JSON Sync, Cloud Sync thủ công và localStorage key.

## V10.7.0 — Smart Alert
- Bổ sung Rule Engine dựa trên cấu hình người dùng.
- Bổ sung mức Critical / Warning / Info.
- Thêm thẻ Smart Alert gọn trên Dashboard và popup Trung tâm cảnh báo.
- Bổ sung cấu hình bật/tắt, mức độ và ngưỡng cho từng rule.
- Cảnh báo tự cập nhật sau Realtime.
- Không thêm cảnh báo y khoa mang tính chẩn đoán.

## V10.6.0 – Realtime JSON Sync
- Bổ sung Supabase Realtime Postgres Changes cho bảng `public.meyeube_sync`.
- Thiết bị đang mở app tự nhận thay đổi từ thiết bị khác dùng cùng Sync ID.
- Auto push sau khi lưu và auto pull khi nhận sự kiện Realtime.
- Chống phản hồi vòng lặp bằng `deviceId`, `_cloudRevision` và cờ áp dụng remote.
- Tự reconnect khi online hoặc khi app trở lại foreground.
- Bổ sung trạng thái REALTIME / CONNECTING / OFFLINE trên màn hình Cloud Sync.
- Bổ sung merge mảng dữ liệu khi Cloud mới hơn trước auto push.
- Cập nhật SQL để thêm bảng vào publication `supabase_realtime`.
- Giữ tương thích dữ liệu cũ và đồng bộ thủ công.

## V10.5.1 – Dashboard & Avatar UX Hotfix
- Ẩn hoàn toàn block lịch khám khi không có lịch sắp tới.
- Thay tuổi trong block Thông tin bé bằng tên chính thức từ Thiết lập.
- Chặn zoom mobile bằng viewport, touch-action và gesture guard.
- Bổ sung upload, nén, xem trước và xóa avatar bé.

## V10.5.0 – Dashboard Configuration & UX
- Refactor source JavaScript về một file chính.
- Thêm cấu hình chỉ số Dashboard và sắp xếp thứ tự.
- Mở đúng bản ghi từ nhật ký Dashboard.
- Loại bỏ cảnh báo lượng bú hardcode.
- Sửa fallback cân nặng sau sinh.
- Tinh chỉnh header, lịch khám, thông tin sinh và block phát triển.

## V10.4.8 – Menu Version Footer Fix
- Bỏ đoạn mô tả Thiết lập để giải phóng không gian cuối menu.
- Tăng khoảng cách an toàn phía dưới menu để phiên bản không bị taskbar che.
- Làm nổi bật dòng phiên bản hiện tại.

## V10.4.7 — UI Polish & Version Info
- Thiết kế lại màn hình khởi động với nền gradient, glass card, logo nổi và thanh tiến trình.
- Làm mới giao diện chờ xử lý để gọn, hiện đại và dễ nhận biết hơn.
- Đổi toàn bộ nội dung `Đang mở màn hình...` thành `Đang xử lý...`.
- Bổ sung thông tin phiên bản ở cuối menu bên trái.
- Cập nhật manifest, title và Service Worker cache lên V10.4.7.
- Giữ nguyên toàn bộ dữ liệu và chức năng V10.4.6.

## V10.4.6 — Cloud Sync Schema & Safety Hotfix
- Sửa lỗi `PGRST204: Could not find the payload column` bằng cách đồng bộ app với schema `id` / `data` của bảng `meyeube_sync`.
- Tự động fallback sang schema cũ `sync_id` / `payload` khi cần.
- Bổ sung cảnh báo xác nhận trước thao tác Đẩy lên Cloud.
- Bổ sung cảnh báo xác nhận trước thao tác Tải Cloud về.
- Ghi nhận thao tác hủy vào Nhật ký đồng bộ.
- Giữ nguyên dữ liệu, localStorage key và các chức năng Smart Care hiện có.

## V10.4.5 — Dashboard Care Goals & Medicine Detail
- Bổ sung mục tiêu chăm sóc **Uống thuốc** theo số lần trong ngày.
- Bổ sung mục tiêu chăm sóc **Thân nhiệt** theo số lần đo trong ngày.
- Hai chỉ tiêu mới xuất hiện trong Cấu hình Dashboard → Chỉ tiêu chăm sóc trong ngày và dùng chung cơ chế bật/tắt, mục tiêu, tiến độ.
- Popup chi tiết Uống thuốc hiển thị Tên thuốc / vitamin, Liều lượng và Đơn vị đã nhập.
- Không thay đổi localStorage key, Cloud Sync hoặc dữ liệu hiện có.

## V10.4.4 — Next Feed Configuration Fix
- Bổ sung đọc giá trị `cfgNextFeedHours` khi mở Cấu hình Dashboard.
- Bổ sung lưu `dashboardConfig.nextFeedHours` khi bấm Lưu cấu hình.
- Dashboard cập nhật ngay sau khi lưu và dùng đúng giá trị người dùng nhập.
- Hỗ trợ dấu chấm hoặc dấu phẩy cho số giờ thập phân.
- Giữ 2,5 giờ chỉ làm mặc định khi chưa có cấu hình hợp lệ.
- Không thay đổi localStorage key, Cloud Sync hoặc các chức năng khác.

## V10.4.3 — Next Feed & Sleep Status Hotfix
- Sửa Dashboard đọc đúng `dashboardConfig.nextFeedHours` khi tính Cữ bú tiếp theo.
- Thay giá trị cộng cố định 150 phút bằng số giờ người dùng cấu hình.
- Đổi màu trạng thái: Bé đang ngủ dùng tông xanh dương; Bé đang thức dùng tông vàng.
- Giữ nguyên khả năng bấm trạng thái Bé đang ngủ và loại bỏ underline.
- Không thay đổi dữ liệu, Cloud Sync hoặc các chức năng hiện có.

## V10.4.2 — Dashboard Care Popup Hotfix
- Bấm từng loại chăm sóc trên Dashboard mở trực tiếp popup chi tiết của loại tương ứng trong ngày hôm nay.
- Chỉ nút “Thống kê” ở tiêu đề block mới chuyển đến trang tổng quan Thống kê.
- Trạng thái “Bé đang ngủ” vẫn có thể bấm để sửa dữ liệu Ngủ mới nhất nhưng không còn underline.
- Không thay đổi dữ liệu, Cloud Sync hoặc các chức năng hiện có.

## V10.4.1 — Sleep Status Quick Edit Hotfix
- Trạng thái “Bé đang ngủ” trên Dashboard có thể bấm để mở form chỉnh sửa giấc ngủ đang diễn ra mới nhất.
- Thay dòng trạng thái tổng quát bằng trạng thái “Bé đang ngủ/Bé đang thức”, giữ cùng hàng với ngày giờ.
- Bỏ dòng trạng thái ngủ trùng phía dưới; giữ nguyên dòng Cữ bú tiếp theo.
- Tăng Nhật ký chăm sóc trên Dashboard từ 4 lên 5 dòng.
- Không thay đổi cấu trúc dữ liệu, Cloud Sync hoặc các chức năng Smart Care.

## V10.4.0 — Smart Care
- Thêm Timer Bú và Ngủ; dừng Timer tự điền thời gian vào form.
- Thêm Uống thuốc: tên, liều lượng, đơn vị.
- Thêm Thân nhiệt: nhiệt độ, vị trí đo.
- Thêm Trớ sữa: mức độ, thời gian sau bú, loại Trớ/Nôn.
- Tích hợp các loại mới vào Dashboard, Timeline, popup chi tiết và Thống kê.
- Không đổi cấu trúc dữ liệu gốc; dữ liệu mới lưu trong careEvents để Cloud Sync/Export DB tiếp tục hoạt động.

# Changelog

## V10.3.5 – Sleep Status Quick Edit & Five Care Journal Rows
- Khi trạng thái tại block Thông tin bé là **Bé đang ngủ**, cho phép bấm trực tiếp để mở giao diện sửa bản ghi Ngủ đang diễn ra mới nhất.
- Hỗ trợ cập nhật **Đến giờ** để xác định thời điểm bé thức dậy.
- Thay dòng trạng thái tổng quát “Đã có ghi nhận hôm nay” bằng trạng thái **Bé đang ngủ/Bé đang thức** ngay trên cùng hàng với đồng hồ và ngày hiện tại.
- Loại bỏ dòng trạng thái ngủ bị lặp ở phần thông tin bổ sung; giữ riêng dòng **Cữ bú tiếp theo** khi có dữ liệu.
- Nhật ký chăm sóc trên Dashboard tăng từ 4 lên 5 dòng gần nhất.

## V10.3.4 – Dashboard Care Detail Popup & Configurable Next Feed
- Khi bấm trực tiếp từng loại chăm sóc trên Dashboard, mở ngay popup chi tiết của đúng loại và ngày hiện tại; không chuyển qua trang Thống kê trước.
- Nút **Thống kê ›** ở tiêu đề block Chăm sóc hôm nay vẫn mở trang tổng quan Thống kê.
- Bổ sung cấu hình **Cữ bú tiếp theo cách (giờ)** trong Cấu hình Dashboard → Hiển thị chung.
- Cữ bú tiếp theo được tính từ thời gian bắt đầu của lần Bé bú mới nhất cộng số giờ đã cấu hình.
- Mặc định 2,5 giờ để tương thích dữ liệu cũ; hỗ trợ bước nhập 0,5 giờ.

## V10.3.3 – Milk Swipe UI Hotfix
- Sửa giao diện nút **Huỷ túi** bị hiển thị sẵn trong danh sách Kho sữa.
- Nút huỷ mặc định ẩn hoàn toàn, chỉ xuất hiện sau khi vuốt trái đủ ngưỡng.
- Chỉ cho phép mở một dòng túi sữa tại một thời điểm.
- Tăng phân biệt thao tác vuốt ngang và cuộn dọc để tránh kích hoạt nhầm trên iPhone.
- Giữ nguyên nghiệp vụ chuyển túi sang trạng thái **Đã bỏ**.

## V10.3.2-milk-inventory-cancel-swipe-hotfix
- Bổ sung swipe sang trái trực tiếp tại Thống kê → Kho sữa → Danh sách kho sữa.
- Chỉ túi ở trạng thái `Đang bảo quản` mới hiển thị hành động `Huỷ túi`.
- Khi huỷ, túi chuyển sang trạng thái `Đã bỏ`, số ml còn lại về 0 và lưu lý do/thời điểm huỷ.
- Danh sách kho sữa trong modal được làm mới ngay sau khi huỷ.

## V10.3.1-care-dashboard-swipe-status-hotfix
- Fix Dashboard: click vào Chăm sóc hôm nay / từng loại chăm sóc mở màn hình Thống kê chăm sóc.
- Fix Kho sữa: bổ sung style swipe-left để hiện nút Huỷ túi, giữ thao tác nhập lý do và chuyển trạng thái Đã bỏ.
- Dashboard Thông tin bé: thêm icon 😴 cho Bé đang ngủ và ☺️ cho Bé đang thức.
- Dãn dòng khu vực Trạng thái và Cữ bú tiếp theo để dễ đọc hơn trên mobile.


## V10.3-care-milk-sleep-dashboard-hotfix
- Rút gọn mã túi sữa theo định dạng YYMMDD và thêm hậu tố khi trùng ngày.
- Danh sách chọn túi sữa khi bé bú hiển thị giờ tạo và ghi chú.
- Chi tiết thống kê chăm sóc sắp xếp mới nhất đến cũ nhất.
- Kho sữa hỗ trợ vuốt trái để huỷ túi, nhập lý do và chuyển trạng thái Đã bỏ.
- Loại Ngủ cho phép bỏ trống Đến giờ để biểu thị Bé đang ngủ.
- Dashboard Thông tin bé hiển thị trạng thái ngủ và cữ bú tiếp theo.

# Changelog

## V10.1 - Cloud Sync Official
- Thêm module Cloud Sync trong menu Thêm.
- Cấu hình Supabase URL, Publishable key, Sync ID.
- Test kết nối, đẩy dữ liệu lên Cloud, tải Cloud về, đồng bộ 2 chiều.
- Đồng bộ auto push khi lưu và auto pull khi mở app nếu Cloud mới hơn.
- Cập nhật bảng Supabase `meyeube_sync` trong SUPABASE_SETUP.sql.
- Giữ nguyên `meYeuBePWA_v4`.

# Changelog

## V10.0 – Supabase Cloud Sync Foundation

### Added
- Module **Cloud Sync** trong menu Thêm.
- Cấu hình Supabase Project URL, Publishable key và Sync ID.
- Test kết nối Supabase.
- Đẩy toàn bộ dữ liệu local lên Supabase.
- Kéo dữ liệu Cloud về localStorage.
- Đồng bộ thông minh dựa trên thời gian cập nhật.
- Auto push khi lưu dữ liệu nếu đã bật Cloud Sync.
- Auto pull khi mở app nếu Cloud mới hơn.
- File `SUPABASE_SETUP.sql` để tạo bảng cloud sync.

### Compatibility
- Giữ nguyên DB local: `meYeuBePWA_v4`.
- Bản V10.0 lưu nguyên JSON hiện tại vào Supabase để an toàn trước khi tách bảng nghiệp vụ ở V10.1.
