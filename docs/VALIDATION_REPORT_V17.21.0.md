# V17.21.0 — Seasonal Themes & Motion

| Khu vực | Kiểm tra |
| --- | --- |
| Lịch | Giờ Việt Nam qua mốc nửa đêm, 8 lịch mặc định, Tết qua tháng âm lịch, Trung thu sau tháng nhuận, ưu tiên khi trùng lịch, ngày bắt đầu/kết thúc, lịch lặp qua năm và dữ liệu ngày không hợp lệ. |
| Cấu hình | 10 chủ đề, chọn tĩnh hoặc hai hiệu ứng, thử độc lập với Trang chủ, xem trước sáng/tối, dữ liệu chưa lưu, khôi phục khoảng mặc định và lưu trên thiết bị. |
| Chuyển động | Keyframes chỉ thay đổi `transform` và `opacity`. Mỗi vòng nối cùng tư thế hoặc chuyển tại điểm đã trong suốt. Kiểm tra giữ pha sau khi vẽ lại Trang chủ, tạm dừng khi mở form, rời Trang chủ và dùng Giảm chuyển động. |
| Tài nguyên | 10 ảnh WebP độc lập, nạp từ cùng địa chỉ trên source và bản build. Service worker lưu ảnh trong gói offline. |
| Nâng cấp | CSS, script, service worker và hai chế độ sáng/tối. Supabase SQL và Edge Function giữ nguyên. |

## Đo nhịp trình duyệt

Chromium Headless Shell, viewport 390 × 844 CSS px và Supabase giả lập. Mỗi hiệu ứng lấy mẫu bằng `requestAnimationFrame` trong khoảng 10 giây, vượt thời lượng một vòng lặp.

| Hiệu ứng | FPS trung bình | Khoảng cách khung p95 | Mẫu trên 25 ms |
| --- | ---: | ---: | ---: |
| Tuyết rơi trên Trang chủ | 59,1 | 16,8 ms | 4 |
| Pháo giấy trong bản xem trước | 59,4 | 16,8 ms | 3 |

Timeline của tuyết giữ nguyên pha trong lần kiểm tra vẽ lại toàn bộ Dashboard. Cũng đã kiểm tra mở form làm dừng hiệu ứng, chuyển màn, chế độ Giảm chuyển động, đổi màu sáng/tối trong bản xem trước và cuộn nút Lưu lên trên thanh điều hướng. Kết quả đo là nhịp gọi khung hình trên trình duyệt thử nghiệm. Tốc độ dựng hình trên iPhone PWA thật chưa được đo.

Quy tắc cho ngày âm lịch dựa trên [mô tả lịch Việt Nam của Hồ Ngọc Đức](https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html). Ngày dương cho Tết 2030 được đối chiếu với [lịch năm 2030](https://alodev.vn/lich-am/2030).
