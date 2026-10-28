# Unified Health Forms — V17.12.0

Bản nền: ZIP V17.11.0(1).zip. 17 tệp backend và mọi dependency bên thứ ba giữ nguyên. Chỉ cập nhật metadata phiên bản app ở root lockfile, không thay chuỗi trên dependency tree.

## Phạm vi và chủ sở hữu

Component health-modal.js sở hữu shell; health/ui.js truyền context memberName/kind từ snapshot khi mở. Không tạo thêm lớp override muộn cho từng form. Cơ chế compiler/capture native ID, expected OCC và writer hiện hành giữ nguyên. Phạm vi: hồ sơ mới, cơ bản/y tế, tiền sử, ghi chú, đo chỉ số, khám, thuốc, tiêm, xét nghiệm và tệp; menu thêm nhanh và màn xem dùng cùng khung nhưng không có Lưu khi chỉ đọc. Thai kỳ là trang riêng và không viết lại trong bản này.

## Bố cục

Header có tên thao tác và chủ hồ sơ. Thêm hồ sơ ghi Thành viên mới. Footer Hủy rồi Lưu được tạo sẵn, type button tránh submit/navigate ngoài ý muốn. Save node vẫn clone khi mở để loại callback cũ. Một observer giới hạn ở footer cập nhật nhãn Đóng/Hủy khi adapter đo chỉ số/tệp bật Lưu sau khi mở; không thay handler hoặc ghi dữ liệu. Quan sát tồn tại cùng shell duy nhất, không tạo thêm mỗi lần mở.

Các label.hb2F trực tiếp liên tiếp được chuyển nguyên node vào fieldset có legend; không parse/rebuild input sau khi người dùng nhập. Cấu trúc tùy biến bên trong widget có sẵn được giữ. Text, textarea và file đi cả hàng; date/time/number/select/email/tel chia cột khi đủ chỗ, dưới340px về một cột. Giữ nguyên ID/name/handler. Input số chưa có step được đặt any, inputmode decimal; không đổi step explicit. Không ép thêm trường bắt buộc hoặc thay validation nghiệp vụ hiện hành.

Màu dùng token theme, input16px, nhãn14px; khung body cuộn riêng và footer ngoài body. CSS form không thay top/height/bottom của overlay; viewport.css tiếp tục tải cuối. Reset body scroll khi mở form mới. Không thêm autosave/khôi phục bản nháp, không thay loading hoặc kho sữa.

## Kiểm tra

health-forms.cjs chạy trong components-runtime và production-runtime, mở/hủy đủ nhóm biểu mẫu, kiểm tra một shell, owner, thứ tự nút, số thập phân, ID label, cập nhật DOM không làm mất nội dung hoặc nhân footer, panel chỉ đọc và không mutate hồ sơ. Production bao gồm mở form tệp của module Storage hiện hành; hồi quy health-runtime tiếp tục lưu/sửa/xóa/Undo, mất ACK và file upload bằng fixture.

Chưa kiểm chứng pixel/bàn phím iPhone native hoặc production; kết quả mô phỏng không thay cho nghiệm thu thiết bị. Màn hình dùng widget tùy biến vẫn giữ cấu trúc riêng bên trong shell. Chưa nâng validation thành hệ thống lỗi từng trường mới hoặc viết lại toàn bộ thai kỳ/các form ngoài module sức khỏe.
