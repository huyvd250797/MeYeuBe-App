# V17.2.4 — Loading Background Restore

Khôi phục nền từ rule splashScreen trong legacy.css: gradient hồng sáng, gradient hồng tím tối và hai mảng sáng chuyển động. Áp dụng vào appLoading; splashScreen cũ vẫn ẩn. Giữ card thương hiệu. Lớp trang trí không nhận input và đứng sau card; reduced motion dừng chuyển động.

Kiểm tra trọng tâm cấu trúc/version/asset/ZIP, CSS/theme, loading DOM, PWA/update gate, startup lỗi/retry và viewport form. Không đổi business/backend; không migration. Chưa kiểm chứng Safari/iPhone pixel thật hoặc Supabase production; không chạy lại toàn bộ 48 suite. Chưa push/deploy.

Kết quả: 8/8 suite trọng tâm PASS. 17 file backend giữ nguyên byte so với ZIP đầu vào. ZIP kiểm allowlist, CRC, checksum và đối chiếu byte.
