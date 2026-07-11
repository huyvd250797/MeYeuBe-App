# MeYeuBe V10.4.6 — Cloud Sync Schema & Safety Hotfix

- Sửa Cloud Sync dùng đúng schema hiện hành của bảng `public.meyeube_sync`: `id`, `data`, `updated_at`.
- Giữ cơ chế fallback tương thích schema cũ `sync_id`, `payload`, `updated_at` nếu dự án Supabase cũ vẫn sử dụng cấu trúc này.
- Bổ sung cảnh báo xác nhận trước khi **Đẩy lên Cloud** để tránh ghi đè nhầm dữ liệu Cloud.
- Bổ sung cảnh báo xác nhận trước khi **Tải Cloud về** để tránh ghi đè nhầm dữ liệu trên thiết bị.
- Hiển thị thao tác bị hủy trong Nhật ký đồng bộ.
- Không thay đổi localStorage key hoặc cấu trúc dữ liệu chăm sóc hiện có.
