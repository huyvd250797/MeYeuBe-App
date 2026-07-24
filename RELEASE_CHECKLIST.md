# HVUS v1.3 — Release Checklist V11.3.1

## Acceptance Criteria
- [x] Thẻ Loại tã (Tã ướt/Tã bẩn): thẻ đang chọn tô nền hồng đậm chữ trắng kèm dấu ✓, rõ ràng hơn kiểu viền mỏng cũ.
- [x] Chuyển Loại tã áp dụng ngay và không tự đổi ngược lại sau đó (cả thêm mới lẫn sửa bản ghi cũ).
- [x] Số lượng: bộ đếm lớn với nút −/＋ hoạt động đúng (không xuống dưới 1); hàng nút chọn nhanh 1/2/3/＋ đặt đúng giá trị và tô sáng đúng nút.
- [x] Thời gian Thay tã chỉ còn 1 dòng Ngày + Giờ cùng hàng (ẩn Ngày kết thúc/Đến giờ/Thời lượng); nhãn "Ngày *"/"Giờ *".
- [x] Các loại chăm sóc khác (Bé bú, Hút sữa, Ngủ, Uống thuốc, Thân nhiệt, Trớ sữa) không đổi bố cục Thời gian (vẫn 2 hàng như cũ).
- [x] Ghi chú Thay tã thu gọn mặc định sau nút "✎ Thêm ghi chú", mở ra khi bấm hoặc khi sửa bản ghi đã có ghi chú sẵn; các loại chăm sóc khác không đổi (luôn hiển thị).
- [x] Lưu bản ghi Thay tã đúng amount/diaperType đã chọn qua giao diện mới; đi tè/đi phân tự tính không đổi.
- [x] Fix: sửa bản ghi "Tã bẩn" không còn tự động hiển thị nhầm về "Tã ướt" sau khi mở form sửa.
- [x] Version đồng bộ 11.3.1 tại title, splash screen, appVersionInfo, script cache-bust, sw.js CACHE_NAME, manifest.webmanifest, APP_VERSION.

## Stable Baseline Lock
- [x] 26 hàm đã khoá ở BASELINE_LOCK_V11.2.0.json (Cloud Sync/Realtime/Push/Smart Alert/Export-Import + Milestone Engine + Hành trình theo tháng/Thống kê/Tổng kết năm/Photo Viewer) — hash khớp 100%, không bị ảnh hưởng bởi thay đổi giao diện Thay tã.
- [x] Toàn bộ tính năng bản V11.2.0 (Hành trình theo tháng, cuộn popup, bố cục Milestone) không bị ảnh hưởng.
- [x] Không bổ sung hàm mới vào Baseline Lock ở bản này — các hàm chỉnh sửa (`selectCareType`, `renderCareDynamicFields`, `selectDiaperType`, `fillCareEditForm` và các hàm mới `diaperSetAmount`/`diaperStepAmount`/`syncCareDateTimeRowsForType`/`toggleCareNote`/`syncCareNoteCollapse`) thuộc giao diện nhập liệu, không thuộc nhóm hạ tầng lõi cần khoá (BASELINE_LOCK_V11.3.1.json giữ nguyên 26 hàm như V11.2.0).

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Version consistency PASS (11.3.1 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V11.2.0.json trong release_check.py).
- [x] release_check.py PASSED.
- [x] Kiểm thử thủ công bằng trình duyệt tự động (Playwright): xác nhận ẩn/hiện đúng theo loại (Thay tã vs. loại khác), bộ đếm/nút chọn nhanh cập nhật đúng giá trị và trạng thái active, lưu bản ghi đúng dữ liệu, và sửa bản ghi "Tã bẩn" hiển thị đúng ngay từ đầu không bị ghi đè sau đó.

## Known limitation (đã ghi trong AC_V11.1.0.md / changelog.md, không đổi ở bản này)
- "Album ảnh" trong Hành trình theo tháng và số "ảnh" trong Tổng kết năm hiện chỉ lấy từ ảnh đã gắn vào Milestone.
- "Xuất video tổng kết" mới ở dạng nút placeholder (disabled), chưa có chức năng thật.
- "Thống kê & So sánh" hiện chưa có biểu đồ/xu hướng theo thời gian.
- Nút "＋" trong hàng chọn nhanh Số lượng ở Thay tã tăng dần từng đơn vị (không mở bàn phím nhập số tuỳ ý) — phù hợp phần lớn trường hợp thực tế (1–5 tã/lần); nếu cần nhập số lớn bất kỳ, có thể cân nhắc bổ sung ở bản sau.
