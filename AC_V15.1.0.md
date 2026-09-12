# Acceptance Criteria — V15.1.0

1. Cloud Sync không còn hiển thị các card: Migration JSON → Relational DB, Relational Migration Doctor, Relational Delta Sync, Relational Read Mode, Relational Write Queue, Đẩy dữ liệu chính thức, Relational + Realtime.
2. Cloud Sync vẫn cho phép lưu cấu hình, test kết nối, đẩy/tải/đồng bộ và backup JSON; relational tables vẫn là nguồn chính.
3. Tạo cữ bú 100ml từ một bình/túi 100ml làm remaining = 0.
4. Sửa cữ đó sang Bú mẹ trực tiếp làm bình/túi trở lại remaining = 100 và status = Đang bảo quản (nếu chưa quá hạn/không hủy thủ công).
5. Trường hợp dùng một phần phải trả lại đúng phần đã tiêu thụ.
6. Túi bị hủy thủ công có cancelReason/canceledAt không được tự hồi lại.
