# V17.2.3 — Loading Brand Polish

Chỉ thay trình bày loading; không business/database migration. Logo tròn, tên app, trạng thái với ba chấm, phiên bản; card và nền theo theme. Màn hình thấp giảm kích thước; lỗi/retry vẫn trong vùng cuộn, không chặn truy cập nút. Không progress phần trăm giả hoặc chờ thêm để trình diễn animation.

Kiểm tra trọng tâm: cấu trúc/asset/version/ZIP, CSS/theme, DOM loading, PWA/update gate, startup retry, form viewport. DOM/CSS mô phỏng không phải kiểm chứng pixel Safari/iPhone thật; không chạy lại toàn bộ 48 suite của bản trước. Không push/deploy.

Kết quả: 8/8 suite trọng tâm PASS. 17 file backend giữ nguyên byte so với ZIP đầu vào. Kiểm tra ZIP gồm allowlist, CRC, checksum và đối chiếu từng byte source.
