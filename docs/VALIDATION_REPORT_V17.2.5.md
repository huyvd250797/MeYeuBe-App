# V17.2.5 — Warm Loading Refinement

Card tối đa 288px thay 344px, logo 72px thay 88px; giảm padding/spacing. Màu card/viền/chữ được định nghĩa riêng cho sáng và tối để khớp nền hồng/hồng tím, bỏ xanh đen. Giữ asset gốc, clipping tròn, nền chuyển màu và các animation hiện có; reduced motion không đổi. Chỉ sửa trình bày loading và metadata phiên bản, không business/backend/migration.

Kiểm tra trọng tâm cấu trúc/version/asset/ZIP, CSS/theme, loading DOM, PWA/update gate, startup lỗi/retry và form viewport. Chưa kiểm chứng pixel Safari/iPhone thật; không chạy lại toàn bộ 48 suite hoặc Supabase production. Chưa push/deploy.

Kết quả: 8/8 suite trọng tâm PASS; CSS/theme chạy lại sau chọn màu cuối. 17 file backend giữ nguyên byte so với ZIP đầu vào. ZIP kiểm allowlist/CRC/checksum/byte.
