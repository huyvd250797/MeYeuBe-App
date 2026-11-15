# V17.20.0 — Fast Start & Care UX

| Khu vực | Kiểm tra |
| --- | --- |
| Khởi động | Giữ phản hồi vaccine ở trạng thái chờ. Dashboard và form chăm sóc mở được. Lịch đợi dữ liệu. Nhập ghi chú trong lúc chờ, dữ liệu nền về không làm mất ghi chú, điều hướng cũ không ghi đè lựa chọn mới. Kiểm tra làm mới nếu mạng lỗi và mở lại sau khi thử lại. |
| Số ml bỏ | Kiểm tra bước 5 ml, tối đa 4 mốc từ cữ bú đã lưu, bỏ qua mốc trùng và 0, khóa mốc vượt tổng lấy, nhập trực tiếp, cập nhật ml thực bú. Test API chăm sóc kế thừa xác nhận lưu và hoàn tác tồn kho qua RPC. |
| Lịch | Kiểm tra tuần, ngày đã chọn, tháng, nội dung tên lịch dài, chuyển 31/01 sang 28/02, giữ đúng lịch để sửa khi thứ tự dữ liệu thay đổi và điền ngày khi thêm mới. Kiểm tra thứ tự và cú pháp CSS, kiểm tra service worker chứa stylesheet. |
| Phát hành | Build trên Node.js 24, kiểm tra cấu trúc ZIP bằng bộ đóng gói, đối chiếu SQL và Edge Function với ZIP V17.19.0. |

Test chạy cục bộ với PGlite, jsdom và kiểm tra build. Các số đo trong `STARTUP_BENCHMARK_V17.20.0.json` thuộc môi trường giả lập. Chưa đo thời gian và kiểm tra hiển thị trên iPhone PWA hay website đang triển khai.
