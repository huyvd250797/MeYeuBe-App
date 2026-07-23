# HVUS v1.2 — Release Checklist V11.0.0

## Acceptance Criteria
- [x] Menu "🏆 Hành trình lớn khôn" với 2 mục con: Xem hành trình / Thêm cột mốc.
- [x] Timeline nhóm theo ngày, sắp xếp mới nhất → cũ nhất.
- [x] Milestone Engine tự động tạo mốc trên MỌI lần lưu dữ liệu (không chỉ lúc mở app): tuổi, bú, ngủ, hút sữa, phát triển, mũi tiêm, Vitamin D.
- [x] Không tạo trùng Milestone (key duy nhất/mốc); Milestone tự động là sự kiện lịch sử, không tự xóa khi dữ liệu gốc đổi/xóa.
- [x] Milestone thủ công: thêm/sửa/xóa tự do (icon, tiêu đề, ngày, mô tả, ghi chú, tối đa 20 ảnh).
- [x] Milestone tự động: khoá tiêu đề/loại/ngày; vẫn cho thêm/xóa ảnh, thêm/sửa ghi chú, chia sẻ.
- [x] Bộ lọc Timeline đủ 8 loại: Tất cả/Theo tuổi/Bé bú/Ngủ/Hút sữa/Phát triển/Vaccine/Thủ công.
- [x] Chia sẻ Milestone thành ảnh PNG qua Web Share API (fallback tải xuống).
- [x] Milestone mới đẩy vào Trung tâm thông báo (🎉 Chúc mừng!).
- [x] Cấu hình Dashboard có Block "Hành trình lớn khôn": bật/tắt, đổi tên, đổi vị trí (↑/↓), cập nhật ngay không cần khởi động lại.
- [x] Version đồng bộ 11.0.0 tại title, splash screen, appVersionInfo, script cache-bust, sw.js CACHE_NAME, manifest.webmanifest, APP_VERSION.

## Stable Baseline Lock
- [x] Cloud Sync / Realtime / Push / Smart Alert / Export-Import không đổi (hash khớp BASELINE_LOCK_V10.9.2.json — xác nhận bằng script).
- [x] localStorage key giữ nguyên.
- [x] Toàn bộ tính năng Milk Bag Picker (V10.9.2/V10.9.3), vuốt Sửa/Xóa, kéo làm mới, Trung tâm cảnh báo... không bị ảnh hưởng.
- [x] Bổ sung baseline lock mới cho Milestone Engine: `checkAutoMilestones`, `addMilestone`, `milestoneExists` (BASELINE_LOCK_V11.0.0.json), làm mốc bảo vệ cho các bản sau.

## Release Gate
- [x] JavaScript syntax PASS (app.js, sw.js) — `node --check`.
- [x] Cân bằng thẻ HTML PASS.
- [x] Version consistency PASS (11.0.0 đồng bộ các file).
- [x] Baseline function hashes PASS (đối chiếu tự động với BASELINE_LOCK_V10.9.2.json trong release_check.py).
- [x] release_check.py PASSED.

## Known limitation (đã ghi trong AC_V11.0.0.md)
- "Hoàn thành vaccine 6 tháng" (chỉ là ví dụ minh hoạ trong US, mục 7F) chưa tự động hoá do thiếu lịch tiêm chuẩn để đối chiếu. Không chặn release; cân nhắc làm AC riêng cho bản sau nếu cần.
