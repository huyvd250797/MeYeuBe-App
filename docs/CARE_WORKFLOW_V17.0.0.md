# Care Workflow hiện tại — cập nhật V17.2.2

Không còn tự lưu form, danh sách bản nháp hoặc lựa chọn khôi phục/bỏ nháp. Đóng/Hủy bỏ nội dung đang nhập; nhập lỗi hoặc lỗi lưu giữ form đang mở. Module drafts.js đã gỡ khỏi source/HTML/cache. Nháp cũ không được đọc hoặc tự xóa.

Giữ review nguồn sữa, OCC, ledger và Undo; timer chạy riêng có ID ổn định. Giao dịch đã gửi nhưng thiếu phản hồi giữ nguyên command/id trong outbox; xác minh chỉ đọc hoặc gửi lại cùng mã sau not_found. Đây là giao dịch đang chờ xác nhận, không phải bản nháp form. Nếu sửa trong form sau timeout thì xác nhận thao tác cũ trước và cập nhật cùng record ID. Không tự ghi đè bản khác.

Giữ vị trí và bộ lọc khi sửa xong. Không có mẫu ghi nhận.
