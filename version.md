# V15.0.13 — DataSafeFix

- Sửa nguy cơ dữ liệu mới nhập bị mất sau khi mở lại app khi Cloud Sync/Reatime kéo bản cloud cũ hoặc stale.
- Auto pull/realtime giờ gộp dữ liệu theo ID thay vì ghi đè toàn bộ local DB.
- Thêm snapshot bảo vệ `meYeuBeDataGuard_lastGood_v1` trước các thao tác cloud merge/replace.
- Bắt lỗi lưu localStorage để cảnh báo khi bộ nhớ trình duyệt đầy.
