# AC V15.0.48 — QuietCloudToastFix

- Mở app khi Cloud DB Mode đang bật.
- Trong lúc splash tải Supabase/merge/cache/realtime, không hiện nhiều toast nội bộ.
- Sau khi boot + cloud/realtime hoàn tất và không có lỗi, chỉ hiện một toast: “Đã kết nối”.
- Realtime nhận dữ liệu mới từ thiết bị khác không hiện toast “Đã gộp dữ liệu...” nữa.
- Auto push/pull/merge Cloud DB không hiện toast thành công riêng lẻ.
- Nếu Cloud/Supabase lỗi, vẫn hiện toast lỗi để người dùng biết.
