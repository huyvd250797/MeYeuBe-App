# V17.13.1 — Dashboard Quick Diaper Fix

Nền: ZIP V17.13.0 Boss cung cấp. Chỉ sửa vị trí và hành vi nhấn giữ tã.

## Thao tác

Giữ 500ms trực tiếp ô Đi tè (💧) hoặc Đi phân (💩) trong Chỉ số chăm sóc trên dashboard để ghi ngay một tã ướt hoặc tã bẩn. Chỉ một timeout, không interval. Muốn ghi tiếp phải thả và giữ lại. Chạm ngắn vẫn mở chi tiết. Form thêm tã không có gesture tăng lượng; ＋/− giữ bấm thường.

Pointer primary được theo dõi theo ID; di chuyển quá 12px, cuộn, pointercancel, blur hoặc ẩn trang trước ngưỡng đều hủy. Theo dõi click sau giữ theo loại ô để vẫn chặn đúng sau dashboard render lại. Không preventDefault pointermove, giữ cuộn dọc tự nhiên; chặn callout ở hai ô dashboard.

## Lưu và dữ liệu

mybCareUi.quickDiaper tạo event mới amount=1, ngày/giờ hiện tại và loại wet/dirty, chạy chung action/writer mybCareService.save với form. Không dùng form ẩn hoặc gọi saveCareEvent nên không mất nội dung form, mở sheet hoặc điều hướng sang lịch sử. Đang có overlay/form, startup chưa sẵn sàng, ngày khác Hôm nay, busy hoặc pending đều chặn ghi nhanh.

Writer typed hiện có chịu trách nhiệm operation ID, ACK, chống trùng, pending và Undo. Số liệu chỉ đổi sau bridge.accept; không cộng số bằng DOM. Mất ACK giữ nguyên pending, chặn ghi mới và dùng Kiểm tra kết quả lưu. Quy tắc tã bẩn cũ vẫn tăng cả đi tè và đi phân; không thay lịch sử.

Không migration SQL, Edge mới, thay dependency hoặc thay nghiệp vụ kho sữa. Các chỉnh sửa dashboard, sức khỏe, timer và refresh của V17.13.0 được giữ.

## Kiểm chứng

Xem VALIDATION_REPORT_V17.13.1.md. Kiểm thử pointer bằng jsdom với RPC qua PGlite cả source và production bundle; chưa là kiểm chứng cảm ứng Safari/iPhone thật. Chưa deploy, push GitHub hoặc truy cập database production.
