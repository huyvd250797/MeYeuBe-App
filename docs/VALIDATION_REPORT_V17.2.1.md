# V17.2.1 — Loading Visual Restore

Khôi phục phần trình bày loading bằng CSS và asset sẵn có. Một loading có icon, phiên bản, Đang tải dữ liệu và ba chấm. Giữ reduced-motion hiện có, chặn dashboard thiếu dữ liệu và cập nhật sau khi vào dashboard. Backend không đổi.

Kiểm tra trọng tâm: cấu trúc/asset/version/ZIP, DOM loading và update gate, PWA, CSS, startup retry và fullscreen viewport. Chưa kiểm chứng giao diện Safari/iPhone thật; không chạy lại toàn bộ 48 suite của bản V17.2.0.

Kết quả cuối: 7/7 suite trọng tâm PASS, gồm 15 kiểm tra Health Planning/loading/update. 17 file backend giữ nguyên byte.
