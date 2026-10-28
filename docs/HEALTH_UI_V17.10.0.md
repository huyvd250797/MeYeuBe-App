# Health UI Foundation — V17.10.0

## Nguồn và phạm vi

ZIP MeYeuBe_v17.9.0(1).zip là bản nền. 17 tệp Supabase giữ nguyên byte. Không thay schema/RPC/Edge, không cần SQL mới.

## Sửa chỉ số

hb2MeasureText trong health/model.js nhận chuỗi/số, đọc dấu chấm hoặc phẩy và định dạng vi-VN, tối đa 3 số lẻ, không phân cách hàng nghìn. Ví dụ 6.30000000 → 6,3 kg; 6.325 → 6,325 kg; 62.000000 → 62 cm. Dữ liệu thiếu/không hợp lệ hiện Chưa có. Profile, tổng quan, timeline đang dùng và fallback, bản in dùng formatter. Form đo và sửa hồ sơ hiển thị số gọn; dữ liệu gốc và expected OCC không bị format. Độ chính xác tính toán/WHO không đổi. Khi lưu hồ sơ, service so sánh số tương đương thay vì chỉ so sánh chuỗi để input rút gọn không ghi nhầm chỉ số dẫn xuất vào giá trị nền.

## Sửa timeline

Health service tạo db.baby từ child.meas và đánh dấu _fromHealthBook. Cả hbxTimeline đang dùng và hb2Timeline fallback trước đây đưa hai nguồn này lên lại khi linkBaby. Nay bộ chọn nguồn loại các bản chiếu đã đánh dấu, giữ lịch sử đo gốc. Legacy có cùng native/source ID với meas được loại khỏi phần thêm vào; không đoán trùng theo ngày, cân nặng hoặc tên. Hai bản ghi độc lập cùng ngày, cùng số vẫn giữ. Bản chiếu của người khác không xuất hiện trong timeline của thành viên đang xem. Không xóa dữ liệu database, không xử lý một bản ghi thật bị lưu trùng với ID khác bằng heuristic.

## Nền giao diện

health-foundation.css tải sau CSS cũ và trước viewport.css. Scope vào healthBook2/hb2Root/hb2Modal, không override height/top/bottom/inset của viewport. Chữ nội dung 1rem; nhãn .875rem; tiêu đề nhóm 1.0625rem; số chỉ số 1.375rem. Card padding 1rem, gap .75–1rem, nút min-height 44px (quy tắc accessibility có thể tăng), icon không co giãn theo hàng. Card chức năng/chỉ số hai cột, dưới 360px về một cột; nhãn dài được xuống dòng. Bổ sung quy chuẩn cho card/bản ghi tiêm chủng. Màu dùng biến theme hiện hành. Không đổi phong cách loading/kho sữa.

V17.11 sắp xếp lại toàn bộ thông tin và vị trí thao tác; V17.12 thay shell các form. Bản nền này không tuyên bố đã hoàn thành hai bước đó. Chưa dọn toàn bộ legacy CSS; chỉ lập chủ sở hữu nền sức khỏe.

## Kiểm chứng

Test health-foundation.cjs chạy trong cả components-runtime và production-runtime: số lẻ/dấu phẩy, thiếu dữ liệu, timeline native và legacy, hai đo cùng ngày, người khác, không mutate raw, profile và touch target. Toàn bộ suite nguồn/build được chạy hồi quy. Môi trường jsdom/PGlite/worker mô phỏng, chưa có iPhone thật hoặc backend production; cần nghiệm thu hình ảnh dark/light và bàn phím trên thiết bị sau deploy. Không push/deploy trong phiên này.
