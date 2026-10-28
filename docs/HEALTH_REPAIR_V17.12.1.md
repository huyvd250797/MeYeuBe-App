# V17.12.1 — Health UI Repair

Nguồn: MeYeuBe_v17.12.0.zip và ảnh IMG_4419. Bản vá sửa các lỗi cụ thể, không triển khai phần roadmap17.13.

## Nguyên nhân và thay đổi

Renderer tiêm chủng trong app.js có header ngoài và hero bên trong phần tổng quan cùng nhắc lại module/nút thêm. Bỏ hero và nút thêm trùng trong lịch/sổ tiêm, giữ header chính cùng handler typed hiện hành. Không đổi số mũi, trạng thái hoặc quy tắc lịch.

hb2Body là grid với track auto; vaxModule con và vaxTabs có track tối thiểu86px theo CSS cũ. Nội dung/min-content có thể đẩy track ngoài màn nhỏ. Sheet foundation nay đặt minmax(0,1fr) ở body/module, min-width0 xuyên container, tab4 track co được (2 track dưới360), chữ xuống dòng và hàng hành động wrap. Không che tràn toàn trang bằng overflow:hidden. Chỉ vùng mốc tuổi/chọn thành viên được cuộn ngang có chủ đích. Không đổi viewport owner hoặc safe area.

Nút Đo cân nặng và Đo chiều cao vốn cùng gọi hb2QuickMeas, nay một Đo chỉ số. Cập nhật hash function trích xuất có lưu hash trước và lý do. Form/ID/writer không đổi.

Trang Kế hoạch có hai đường ra: back await navigation hồ sơ và close về home. Nếu hồ sơ chưa tải đủ hoặc mạng lỗi, thông báo trên trang và vẫn cho Đóng; không reset dữ liệu. Giữ busy guard khi đang cập nhật lịch.

Profile presentation thêm shortcut Giấy khai sinh và BHXH; không tạo hệ lưu file mới. Health ui.upload nhận file, upload private Cloud, kiểm tra kết quả rồi ghi metadata vào đúng member/OCC. Media UI mở bằng memberId/mediaId và URL có hạn. File pending/local được ghi rõ, không giả định đã đồng bộ; chuyển từ máy gốc bằng luồng migrate hiện có. Nút pending không còn chen dưới mọi view sức khỏe.

## Kiểm chứng và giới hạn

Health-repair chạy trong source/production: một header/nút thêm, một nút đo, shortcut giấy tờ, computed grid minmax/min-width và navigation trở về. Media-runtime tạo VM thiết bị mới, IDBFactory trống, xác nhận không có local bytes nhưng vẫn xin được Cloud URL cho cả hai loại giấy tờ. Transport giả; backend media/SQL fixture tiếp tục kiểm tra quyền/family.

38 dependency giữ nguyên; npm ci cài sạch. 17 tệp backend nguyên byte, không migration SQL mới. Chưa deploy hoặc kiểm tra trên Safari/iPhone thật; jsdom không tính bounding rect như browser và không chứng minh pixel ở320/390/430px. Cần đối chiếu ảnh thiết bị sau deploy; không tuyên bố đã xác minh hai máy thật. Media Storage cũ phải cấu hình sẵn để thực sự upload/open Cloud.
