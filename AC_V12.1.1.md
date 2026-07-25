# Acceptance Criteria — V12.1.1 · Sửa lỗi khoá cuộn chồng ở modal chăm sóc (patch)

## Lỗi
- Từ Dashboard bấm xem một loại chăm sóc (mở modal chi tiết), đóng lại rồi bấm sang loại khác → màn hình chỉ còn nền tối mờ, modal không hiện (lỗi vẽ lớp `backdrop-filter` trên iOS do khoá cuộn 2 lớp).

## Nguyên nhân
- Các modal của app (chi tiết chăm sóc, form ghi nhận, thông báo, cảnh báo, chọn/chi tiết túi sữa, more sheet…) đã tự khoá cuộn bằng class `careModalOpen` (`position:fixed`).
- Cơ chế khoá cuộn chung `mybScrollLock` (V12.0) khoá **chồng thêm** `overflow:hidden` trên cùng một `body` có `backdrop-filter`, gây iOS không composite được lớp modal (chỉ còn nền mờ).

## Sửa
- [x] `mybScrollLock` chỉ áp khi **chưa có** khoá gốc của app (`careModalOpen`/`menuOpen`) — tức chỉ làm khoá nền cho các popup không tự khoá (xem ảnh Milestone, xem ảnh avatar, bottom sheet Daily Streak). Không còn khoá chồng ở mọi modal khác.
- [x] Kiểm chứng: modal chi tiết chăm sóc mở → không thêm `mybScrollLock`; avatar viewer mở → có `mybScrollLock`; đóng hết → gỡ sạch.
- [x] Chuỗi mở loại A → đóng → mở loại B hiển thị bình thường, không còn nền tối mờ.

## Kế thừa
- [x] Vẫn giữ nguyên yêu cầu: mọi popup/modal khi mở chỉ cuộn nội dung bên trong, khoá cuộn nền (nay do đúng một cơ chế đảm nhiệm: modal app dùng careModalOpen, popup khác dùng mybScrollLock).

## Release Gate
- [x] Version đồng bộ 12.1.1 tại 7 vị trí; JS syntax PASS; Baseline Lock 26/26 khớp BASELINE_LOCK_V12.1.0.json.
