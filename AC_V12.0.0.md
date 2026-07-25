# Acceptance Criteria — V12.0.0 · Nâng cấp UI/UX Dashboard (đợt 1)

Phạm vi đợt này: khoảng trắng (mục 2) + hệ màu chuẩn hoá (mục 3) + dòng "Cữ bú tiếp theo" trong Hero (mục 5) + khoá cuộn nền dùng chung cho mọi popup/modal. Các mục 1 (avatar ring/zoom), 4 (Daily Streak), 6 (kéo thả cấu hình) để các bản V12.1/V12.2.

## Mục 2 — Tăng khoảng trắng Dashboard
- [x] Khoảng cách giữa các block Dashboard tăng lên **24px** (`.babyDashCommand` gap).
- [x] Padding trong Hero và các thẻ (`bcHero`, `bcCard`) tăng lên **20px**.
- [x] Khoảng cách icon ↔ tiêu đề thẻ (`bcTitle` gap) tăng lên **13px** (+3px).
- [x] Không thay đổi bố cục, không đổi số cột lưới chỉ số, không tràn ngang ở 360/390/430px.

## Mục 3 — Chuẩn hoá hệ thống màu
- [x] Khai báo một bộ token màu chuẩn dùng chung: `--c-pink` (bú/bình/kho sữa/CTA) · `--c-purple` (ngủ) · `--c-blue` (tã/tè/chăm sóc) · `--c-orange` (milestone) · `--c-red` (cảnh báo/quá hạn/lỗi) · `--c-gray` (label/metadata); thêm `--c-green` cho trạng thái "còn nhiều thời gian".
- [x] `--c-pink` = `--brand` sẵn có; `--c-gray` = `--muted` — không thêm màu chủ đạo mới.
- [x] Áp quy chuẩn cho chỉ số "Chăm sóc hôm nay": feed→hồng, ngủ→tím, tã/tè/phân/lịch→xanh, kho sữa/hút→hồng, sắp hết hạn→đỏ.
- [ ] (Tiếp tục các bản sau) Rà soát nốt badge/chip/progress toàn app về đúng token — làm dần theo từng màn để tránh rủi ro một lần.

## Mục 5 — Widget "Cữ bú tiếp theo" (gộp 1 dòng trong Hero)
- [x] Gộp thành **1 dòng gọn nằm trong block Thông tin bé**, không tách block riêng, không dùng card lớn.
- [x] Hiển thị: `🍼 Cữ bú tiếp theo <giờ dự đoán> · còn 01 giờ 20 phút` — ghi rõ giờ/phút đầy đủ (2 chữ số).
- [x] Vạch màu bên trái + chấm màu theo mức khẩn: 🟢 còn nhiều thời gian · 🟠 sắp đến giờ (<30 phút) · 🔴 đã quá giờ (hiện "quá …").
- [x] Chưa đủ dữ liệu (chưa có cữ bú nào) → hiện "Cữ bú tiếp theo · chưa đủ dữ liệu để dự đoán" (màu xám), không lỗi.
- [x] Dùng lại logic dự đoán cũ (`nextFeedHours` mặc định 2.5h); không đổi cách tính, chỉ đổi cách hiển thị.

## Mới — Khoá cuộn nền cho mọi popup/modal
- [x] Khi mở bất kỳ overlay nào (mọi phần tử `*Overlay` có class `.show`), `body` bị khoá cuộn (`mybScrollLock`: `overflow:hidden` + `overscroll-behavior:none` + `touch-action:none`); chỉ cuộn được nội dung bên trong popup.
- [x] Đóng popup → tự mở lại cuộn nền. Nhiều popup chồng nhau vẫn khoá đúng, đóng hết mới mở.
- [x] Cơ chế dùng **MutationObserver** + class `mybScrollLock` riêng, **không sửa** `refreshDetailOverlayScrollLock` (thuộc Baseline Lock) — cộng dồn độc lập với `careModalOpen`/`menuOpen` sẵn có.
- [x] Áp cho cả popup trước đây chưa khoá: xem ảnh Milestone, trung tâm thông báo, cảnh báo thông minh, form ghi nhận, chi tiết chăm sóc, chọn/chi tiết túi sữa.

## Release Gate
- [x] Version đồng bộ **12.0.0** tại: title, splash (icon cache-bust + nhãn), appVersionInfo, `app.js?v=`, `sw.js` CACHE_NAME, manifest (name + start_url), APP_VERSION.
- [x] JavaScript syntax PASS (`node --check` app.js, sw.js).
- [x] Baseline Lock 26/26 khớp `BASELINE_LOCK_V11.7.0.json` — không hàm lõi nào đổi (chỉ thêm hàm hiển thị mới `nextFeedInfo`/`fmtRemainVerbose`/`nextFeedLineHtml` và IIFE khoá cuộn, không thuộc nhóm khoá).
- [x] `BASELINE_LOCK_V12.0.0.json` giữ nguyên 26 hàm.
