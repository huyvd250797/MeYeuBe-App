# Làm sạch source V16.6.0

Giữ nguyên runtime, Edge và migration nghiệp vụ. Không sửa dữ liệu DB hoặc tăng phiên bản. File test và fixture còn phục vụ xác minh nên được giữ. Không có migration mới.

Đã bỏ các file không được app nạp: script0/1/2, script_inline0/1 và relational-v1576. Đã bỏ báo cáo, checksum, tài liệu/SQL cứu dữ liệu lịch sử và TXT1640/1650 trùng migration SQL. Giữ migration1530/1540/1550/1560/1570/1590/1640/1650/1660/1661 đúng thứ tự nâng cấp.

Thư mục input-only đã lọt vào ZIP trước do lỗi đóng gói; bản sạch không chứa thư mục này hoặc backup JSON. Không đọc/sửa/đưa dữ liệu backup vào app. Kiểm tra build chặn cả thư mục lẫn mẫu tên file backup.

Hai preflight1580/1600 chỉ dùng trong kiểm thử được chuyển về tests/fixtures;1610/1620 không dùng đã xóa. CSS_EXTRACTION là chứng cứ31 blockCSS nguyên vẹn được test đọc, không phải JSON đồng bộ dữ liệu người dùng.

Build chuẩn: npm test, sau đó python3 build_release.py. ZIP chỉ có một thư mục gốc, một package.json và một entrypoint index.html; không node_modules, .git, cache, dist hoặc dữ liệu cá nhân. Các tài liệu kỹ thuật còn dùng được giữ ở docs cùng báo cáo mới nhất. Không tự sửa/push/deploy ứng dụng Zipverra.
