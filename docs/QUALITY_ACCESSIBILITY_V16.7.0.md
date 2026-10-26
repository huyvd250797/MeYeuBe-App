# V16.7.0 — Quality & Accessibility

Bản này củng cố UI hiện có, không đổi schema, ID, ledger, dữ liệu file hoặc cơ chế server Notifications. Không có migration mới.

- Modal do mybUI.overlays quản lý có role/dialog, tên từ heading (Sổ sức khỏe dùng hb2ModalTitle), focus đầu vào không tự mở bàn phím ở form chăm sóc. Tab/Shift+Tab bỏ qua trường ẩn, disabled, tabindex âm; dialog trống nhận focus trên root. Escape kiểm tra canClose trước callback. Đóng popup cấp dưới không cướp focus popup trên. Focus guard cho phép popup legacy chưa do manager quản lý nhận focus để không chặn date/file/detail picker hiện hữu.
- Module accessibility.js gắn label chỉ khi có một trường duy nhất trong nhóm và label rõ ràng; không suy đoán tên cho nhóm nhiều trường. Nút chỉ có dấu đóng/tăng/giảm có aria-label, custom role=button hỗ trợ Enter/Space khi chưa có handler bàn phím. Không thay giá trị/ID dữ liệu; ID DOM tự sinh chỉ cho trường chưa có id.
- Native validation khi phát invalid mới gắn aria-invalid, sửa hợp lệ mới xóa. Không tự chặn save hoặc thay quy tắc nghiệp vụ. Lỗi service/OCC vẫn giữ nháp theo các controller hiện hữu.
- Action controller thông báo aria-busy và giữ đúng trạng thái disabled/aria-busy ban đầu khi mở khóa, kể cả nhiều khóa chồng nhau. Live region lỗi assertive, trạng thái thường polite, đọc nguyên thông điệp.
- Thông báo mất kết nối không khẳng định đã lưu/đã đồng bộ; không gửi mạng hoặc viết dữ liệu. Online chỉ xóa cảnh báo, việc retry thuộc repository hiện có.
- CSS cuối dùng token theme, focus ring, placeholder rõ ràng, input bounded và scroll margin, info icon không co. Date/time vẫn2 dòng2 cột, giữ hidden controller.

Giới hạn: cải thiện tập trung vào form và modal chung đã quản lý; không tuyên bố mọi popup legacy đã chuyển kiến trúc hoặc đã đạt chứng nhận WCAG. Chưa kiểm thử hình học thật, Safari/iPhone/VoiceOver, bàn phím mềm hoặc Push thật trong môi trường này. Các kiểm tra CSS/DOM không thay thế đo layout trên thiết bị.

Checklist thiết bị cần thực hiện sau deploy:

1. Màn320/390/430px, zoom lớn, light/dark; mở thêm/sửa hút sữa, bé bú, cập nhật kho, sức khỏe, nhật ký/lịch và Dashboard config. Đối chiếu không tràn/chồng, ngày–giờ giữ2x2, bàn phím không che trường cuối.
2. Keyboard/VoiceOver: tên trường, nút đóng, Tab ngược/xuôi, Escape khi đang lưu, popup kho lồng trong form, đóng quay đúng chỗ, không tự mở bàn phím lúc mở form chăm sóc.
3. Mạng chậm/mất ACK: nhấn Lưu nhiều lần, lỗi xung đột, thử lại, giữ nháp và vị trí; xác minh số dư native/Undo. Không bấm reset hoặc nhập lại whole-state JSON.
4. PWA nâng cấp khi không có pending/nháp; kiểm tra splash16.7 và mọi asset, thông báo server16.6 vẫn chạy sau đóng app.

Source sạch: giữ runtime/test/migration cần thiết, một báo cáo hiện hành, không backup/input-only/node_modules. build_release.py chặn file không được duyệt và tạo checksum/CRC. Tiếp theo V17.0.0 — Care Workflow (đề xuất trong roadmap).
