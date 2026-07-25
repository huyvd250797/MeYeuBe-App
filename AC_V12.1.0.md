# Acceptance Criteria — V12.1.0 · Avatar trạng thái, Xem ảnh, Daily Streak (đợt 2)

Phạm vi: mục 1 (vòng trạng thái quanh avatar + xem ảnh toàn màn hình/zoom) + mục 4 (Daily Streak) + fix realtime cho dòng "Cữ bú tiếp theo". Mục 6 (kéo thả cấu hình) để V12.2.

## Mục 1 — Avatar
- [x] Vòng màu quanh avatar theo trạng thái bé: 🟢 xanh khi **đang thức**, 💜 tím khi **đang ngủ** (dựa vào giấc ngủ đang mở). Trạng thái 🍼 đang bú / ốm / tiêm / quấy để mở rộng sau (app chưa có khái niệm "cữ bú đang diễn ra").
- [x] Bấm vào avatar → mở ảnh **toàn màn hình**, giữ đúng tỷ lệ (`object-fit:contain`).
- [x] Zoom: chạm 2 lần để phóng to/thu nhỏ; chụm 2 ngón (pinch) để zoom 1×–4×.
- [x] Vuốt xuống (khi chưa zoom) hoặc bấm ✕ / chạm nền để đóng.
- [x] Chưa có ảnh đại diện → đưa về Thiết lập kèm gợi ý, không lỗi.
- [x] Dùng viewer riêng (`avatarViewerOverlay`), **không sửa** `openMilestonePhotoViewer`/`closeMilestonePhotoViewer` (Baseline Lock).

## Mục 4 — Daily Streak
- [x] Widget 🔥 + số ngày hiện trên **header**, cạnh nút dark mode, **dạng chữ thuần** (không viền nút); màu theo màu chữ header (hợp cả light/dark); streak = 0 thì mờ đi.
- [x] Bấm widget → **bottom sheet**: số ngày liên tục, trạng thái hôm nay (✅ đã ghi / ⚠ chưa ghi / 💔 đã ngắt), 🏆 kỷ lục, 🚩 ngày bắt đầu chuỗi, 📅 tổng ngày dùng app, 📊 tỷ lệ ngày có ghi chép, huy hiệu 🥉7 · 🥈30 · 🥇100 · 👑365 (sáng khi kỷ lục đạt mốc).
- [x] Quy tắc tính: mỗi ngày chỉ cần ≥1 bản ghi chăm sóc (không phân biệt loại); theo ngày địa phương; bỏ lỡ 1 ngày → chuỗi hiện tại về 0, tính lại từ ngày có ghi nhận kế tiếp. Chuỗi vẫn "sống" nếu hôm nay chưa ghi nhưng hôm qua có (chưa mất).
- [x] Widget cập nhật lại mỗi lần render Dashboard (sau mọi lần lưu dữ liệu).

## Fix — Realtime "Cữ bú tiếp theo"
- [x] Dòng cữ bú trong Hero **tự cập nhật thời gian còn lại** khi sang phút mới, không cần load lại trang (gắn vào nhịp đồng hồ 1 giây sẵn có, chỉ dựng lại khi đổi phút để nhẹ máy).
- [x] Màu mức khẩn (🟢/🟠<30p/🔴 quá giờ) tự đổi theo thời gian thực.

## Kế thừa
- [x] Popup mới (streak sheet, avatar viewer) tự hưởng khoá cuộn nền chung (mybScrollLock) vì là `*Overlay.show`.

## Release Gate
- [x] Version đồng bộ **12.1.0** tại 7 vị trí (title, splash icon+nhãn, appVersionInfo, app.js?v=, sw.js CACHE_NAME, manifest name+start_url, APP_VERSION).
- [x] JS syntax PASS (`node --check`).
- [x] Baseline Lock **26/26 khớp** `BASELINE_LOCK_V12.0.0.json` — không hàm lõi nào đổi; các hàm mới (computeStreak, syncStreakWidget, renderStreakSheet, openStreakSheet/closeStreakSheet, openAvatarViewer/closeAvatarViewer, babyRingState, syncNextFeedUI, careRecordDaySet, streakBadgeHtml, avatarViewerToggleZoom…) thuộc lớp hiển thị, không khoá.
- [x] `BASELINE_LOCK_V12.1.0.json` giữ nguyên 26 hàm.
