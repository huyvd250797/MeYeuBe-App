# HVUS v1.3 — Release Checklist V11.1.0

## Acceptance Criteria
- [x] Menu chính có nhóm mới "❤️ Kỷ niệm & Thống kê" với 4 mục con: Hành trình lớn khôn, Hành trình theo tháng, Thống kê & So sánh, Tổng kết năm.
- [x] Mục "🏆 Hành trình lớn khôn" không còn đứng riêng ở cấp cao nhất của menu.
- [x] Nút "＋ Thêm cột mốc" trong màn hình Hành trình lớn khôn vẫn hoạt động như cũ.
- [x] Hành trình theo tháng: danh sách thẻ theo tháng tuổi, đúng số Milestone/bản ghi/ảnh mỗi tháng, mới nhất lên đầu.
- [x] Chi tiết tháng: Thống kê tháng, Nhật ký chăm sóc, danh sách Milestone, Album ảnh, Ghi chú lưu riêng theo từng tháng.
- [x] Thống kê & So sánh: 3 thẻ (bú/ngủ/hút sữa) hôm nay, so sánh đúng với Hôm qua / TB 7 ngày / TB 30 ngày / TB tháng trước, mũi tên tăng/giảm đúng màu.
- [x] Tổng kết năm: chọn theo năm tuổi, đúng số liệu cữ bú/giấc ngủ/lít sữa/ảnh/Milestone; Chia sẻ hình ảnh (PNG) và Xuất PDF (in trình duyệt) hoạt động; nút Xuất video ở trạng thái sắp ra mắt (disabled).
- [x] Chưa nhập Ngày sinh: Hành trình theo tháng và Tổng kết năm hiển thị thông báo yêu cầu nhập Ngày sinh, không lỗi.
- [x] Dashboard (Block "Hành trình lớn khôn") không đổi hành vi/giao diện so với bản trước.
- [x] `db.monthlyNotes` được khởi tạo an toàn cho dữ liệu cũ, không mất dữ liệu hiện có.
- [x] Version đồng bộ 11.1.0 tại title, splash screen, appVersionInfo, script cache-bust, sw.js CACHE_NAME, manifest.webmanifest, APP_VERSION.

## Stable Baseline Lock
- [x] 17 hàm đã khoá ở BASELINE_LOCK_V11.0.1.json (Cloud Sync/Realtime/Push/Smart Alert/Export-Import + Milestone Engine + Photo Viewer) — hash khớp 100%, không bị ảnh hưởng bởi thay đổi menu/tính năng mới.
- [x] Toàn bộ tính năng bản V11.0.1 (Milestone Timeline, Photo Viewer, Lịch khám theo ngày, Giờ đạt mốc) không bị ảnh hưởng.
- [x] Bổ sung baseline lock mới cho các hàm lõi của tính năng V11.1.0: `rangeCareTotals`, `renderMonthlyJourney`, `renderStatsCompare`, `renderYearSummary` (BASELINE_LOCK_V11.1.0.json, tổng 21 hàm).

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Version consistency PASS (11.1.0 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V11.0.1.json trong release_check.py).
- [x] release_check.py PASSED.

## Known limitation (đã ghi trong AC_V11.1.0.md / changelog.md)
- "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm chỉ lấy từ ảnh đã gắn vào Milestone — ứng dụng chưa có tính năng đính ảnh trực tiếp vào Nhật ký chăm sóc hoặc Nhật ký, nên nếu bé không có ảnh gắn ở Milestone trong tháng/năm đó, số ảnh sẽ hiển thị 0 dù gia đình có thể đã lưu ảnh ở nơi khác (album điện thoại, Nhật ký...).
- "Xuất video tổng kết" mới ở dạng nút placeholder (disabled), chưa có chức năng thật — dự kiến ở bản sau.
- "Thống kê & So sánh" hiện chưa có biểu đồ/xu hướng theo thời gian như đề xuất mở rộng trong tương lai — chỉ so sánh số liệu hôm nay với một mốc được chọn.
