# MeYeuBe V17.22.56 — Seasonal Featured Card Design

## Thay đổi
- Card chăm sóc nổi bật tự đổi bảng màu theo `html[data-season]` của 20 chủ đề đã được app hỗ trợ.
- Đồng bộ màu viền, nền, ánh sáng viền, badge **Đã bỏ**, thanh tiến trình và chữ số trong badge.
- Giữ nguyên bố cục compact từ V17.22.55, biểu tượng giọt sữa **màu trắng**, cơ chế chọn duy nhất một chỉ số nổi bật.
- Các chỉ số thông thường vẫn theo lưới ba cột, hàng thiếu không giãn; không sửa ảnh nền/card/hiệu ứng mùa.
- Chế độ Xem trước Dashboard và giao diện chủ đề thực tế dùng cùng biến `data-season`; khi không có chủ đề hoạt động, giao diện card nổi bật gốc được giữ.
- Không có SQL migration mới.

## Tài nguyên
- `src/styles/dashboard-featured-seasons-v56.css` (CSS bảng màu có phạm vi riêng).
- Đã bổ sung CSS vào entry HTML và danh sách cache PWA; thay đổi phiên bản để chống cache cũ.
