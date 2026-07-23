# HVUS v1.3 — Release Checklist V11.0.1

## Acceptance Criteria
- [x] Bấm ảnh trong Album Milestone (chi tiết hoặc form thêm/sửa) mở toàn màn hình đúng tỉ lệ gốc, đóng bằng ✕ hoặc chạm ra ngoài.
- [x] Bấm nút xoá ảnh không mở nhầm ảnh toàn màn hình (event.stopPropagation).
- [x] Cấu hình Dashboard có ô "Lịch khám sắp tới trong vòng (ngày)" (0–365, mặc định 7).
- [x] Block "Lịch khám sắp tới" tự ẩn hoàn toàn khi không có lịch trong khoảng cấu hình.
- [x] Block hiển thị bình thường khi có lịch trong khoảng cấu hình (không đổi giao diện/nghiệp vụ khác).
- [x] Milestone tự động từ Bé bú/Ngủ/Hút sữa lưu kèm giờ đạt được (time).
- [x] Màn hình chi tiết Milestone hiển thị giờ kèm ngày khi có.
- [x] Milestone không có giờ (theo tuổi/phát triển/vaccine hoặc tạo trước bản này) vẫn hiển thị bình thường, không lỗi.
- [x] Version đồng bộ 11.0.1 tại title, splash screen, appVersionInfo, script cache-bust, sw.js CACHE_NAME, manifest.webmanifest, APP_VERSION.

## Stable Baseline Lock
- [x] 12 hàm đã khoá ở BASELINE_LOCK_V11.0.0.json (Cloud Sync/Realtime/Push/Smart Alert/Export-Import + Milestone Engine lõi) — hash khớp 100%, không bị ảnh hưởng.
- [x] Toàn bộ tính năng bản V11.0.0 (Timeline, bộ lọc, chia sẻ, thông báo, Dashboard Block) không bị ảnh hưởng.
- [x] Bổ sung baseline lock mới: `checkFeedMilestones`, `checkSleepMilestones`, `checkPumpMilestones`, `openMilestonePhotoViewer`, `closeMilestonePhotoViewer` (BASELINE_LOCK_V11.0.1.json).

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Version consistency PASS (11.0.1 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V11.0.0.json trong release_check.py).
- [x] release_check.py PASSED.

## Known limitation (đã ghi trong AC_V11.0.1.md)
- Milestone tự động tạo trước bản V11.0.1 không có giờ hồi tố (do quy tắc không tạo trùng/không ghi đè Milestone đã tồn tại). Chỉ áp dụng cho Milestone mới từ bản này trở đi.
