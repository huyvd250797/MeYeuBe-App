# V16.1.0 — Design System

Nền: source ZIP16.0 Boss gửi. Ngày26/10/2026. Không dùng dữ liệu production.

## Phạm vi đã làm

| Lớp | Trách nhiệm |
| --- | --- |
| src/styles/legacy.css | 31 khối style nguyên byte/thứ tự từ HTML; giữ guard bố cục/ẩn hiện/scroll/z-index |
| src/styles/tokens.css | Màu ngữ nghĩa light/dark; font/size, spacing4–24px, radius10/14/20px, target44px, shadow; alias cho biến cũ |
| src/styles/components.css | Nút/form/card/modal/picker/filter/status; focus-visible; mobile wrapping; reduced-motion/forced-colors |
| src/ui/runtime.js | Chỉ thêm class mybStatus cho node status đang có; state/role/text không thay |
| milk-picker.js | Empty state có dsEmpty/role status; không thay service hoặc selection controller |
| docs/design-system.html | Trang mẫu cho thiết kế và kiểm tra thủ công; không persist/RPC |

Thứ tự tải: legacy → tokens → components, trong head. Không có CSS url tương đối cần rebase; các style ID đã tách không có caller trong source. Manifest `CSS_EXTRACTION_V16.1.0.json` ghi hash từng block để đối chiếu. Không xóa hàng loạt CSS override vì còn nhiều template lịch sử; skin mới chỉ phủ nhóm dùng chung, không tuyên bố đã chuyển toàn bộ màn cũ.

## Quy tắc mở rộng

Dùng `--ds-text`, `--ds-muted`, `--ds-accent` cho chữ; `--ds-brand` cho nền nút với `--ds-on-brand`. Không dùng brand nhạt cho đoạn chữ nhỏ trên trắng. Success/error/warning/info có cặp foreground/background riêng cho mỗi theme. `--brand`, `--line`, `--card`… là alias tương thích; thành phần mới ưu tiên semantic token.

Nút không chỉ phân biệt bằng màu: giữ nhãn Lưu/Hủy/Xác nhận/Xóa, status có nội dung chữ. Icon emoji cũ được giữ; chuẩn hóa container ở nav/card dùng chung, chưa thay toàn bộ hệ icon. Form không đổi ID/name/value/validation. `disabled` vẫn do controller xác nhận ghi quyết định; CSS không biến dữ liệu hết hạn thành khả dụng. Không đổi cơ chế đóng popup/khóa cuộn/focus hoặc ép dashboard hiện sớm.

Theme auto/light/dark dùng cơ chế boot và preference theo thiết bị hiện có. CSS đọc data-theme, không tạo cơ chế lưu theme thứ hai. Màu theme-color dark được đồng bộ nền#0c121d. Browser zoom được mở lại qua viewport; không đổi gesture nghiệp vụ.

## Kiểm chứng

`npm test` gồm hồi quy SQL/runtime và hợp đồng CSS/theme. Test contrast chỉ xác minh các cặp token được liệt kê (text, muted, accent, semantic status, primary/success button), tỷ lệ tối thiểu4.5:1; không chứng nhận toàn app đạt WCAG. jsdom không thực thi layout media-query như trình duyệt thật.

Checklist sau deploy trên thiết bị thật: mở dashboard đủ dữ liệu, theme auto/light/dark và đổi system khi auto; widths320/390/768/1280 và zoom200%; nhập form, popup care + picker lồng, focus Tab/Escape; thêm/sửa/xóa/Undo và lỗi mạng còn giữ nháp; kho hết/hủy/quá hạn không chọn được; CSS/PWA cập nhật không thiếu asset. Màn bảng rộng có scroll nội bộ được giữ.

## Dữ liệu và vận hành

Database1590 giữ nguyên. Preflight1610 chỉ đọc API metadata. Thay đầy đủ source có src/styles, giữ file/queue/browser data. Rollback frontend16.0 khi cần điều tra, giữ DB1590. Không push/deploy trong lần xây dựng. Kế tiếp16.2 Performance cần số đo trước-sau, không gộp vào lần refactor này.
