# MeYeuBe V17.22.29 — Beach Natural Waves And Palm Motion

## Đã tích hợp trên app
- **Chế độ A / wave:** Sóng biển vỗ bờ tự nhiên, bọt sóng lấy từ chính ảnh cảnh biển, di chuyển tiến/lùi ở đường mép nước.
- **Chế độ B / clouds:** Lá dừa đung đưa, giữ nguyên gốc cành, không có sóng hoặc mây giả.
- **Tĩnh / still:** Không hiển thị lớp động.

## Phạm vi an toàn
- Bảo toàn giao diện, bố cục, dữ liệu chăm sóc bé, chiều cao card và các 19 chủ đề còn lại.
- Ảnh nền không bị blur hoặc dịch chuyển. Hoạt cảnh chỉ nằm trong card bé.
- Bảo toàn mã lựa chọn để đồng bộ Cloud Sync trên các thiết bị.
- Không cần migration SQL.

## Triển khai
- Deploy toàn bộ thư mục `dist/` (index.html, build.json, manifest, sw.js, assets, ảnh WebP).
- PWA có thể đề nghị cập nhật; sau khi cập nhật kiểm tra phiên bản là 17.22.29 và thử A/B/Tĩnh ở cấu hình chủ đề.
- GIF duyệt là tài liệu tham chiếu hình ảnh; chuyển động thực tế phụ thuộc render Safari/WebView và cần QA trên iPhone.
