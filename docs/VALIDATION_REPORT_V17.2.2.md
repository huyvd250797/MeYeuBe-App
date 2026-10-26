# V17.2.2 — Validation

Thay đổi workflow bỏ lưu/khôi phục nháp chăm sóc, gỡ module draft store. Giữ input trong form đang mở khi lỗi, giữ outbox của thao tác đã gửi/unknown outcome, xác minh read-only và retry cùng ID; test PostgreSQL fixture kiểm tra cân bằng sữa, không ghi trùng và OCC.

Splash dùng cùng loading surface hiện có; icon/version/text/ba chấm, nền sáng/tối gọn. Timer bỏ chiều cao cứng/overflow hidden, chia hai hàng, nút tối thiểu 44px. DOM/CSS assertions không thay thế kiểm chứng Safari/iPhone hoặc kích thước pixel thật. Không push/deploy; không migration mới.

Kết quả cuối: 48/48 suite PASS, 0 lỗi baseline. Care Workflow có 34 kiểm tra trên UI + SQL fixture, gồm bỏ nháp, close/reset, timer start/stop/save, kho/Undo, unknown outcome, retry cùng ID, sửa sau timeout, lock và OCC. Catalog chạy lại 39 kiểm tra sau đổi fixed sleep sang chờ startup; lịch sử lần lỗi được giữ trong báo cáo. Design System 15 kiểm tra chạy lại sau CSS responsive cuối. 17 file backend byte nguyên so với ZIP đầu vào.
