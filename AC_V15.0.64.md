# AC V15.0.64 — RelationalExistingTableCompatibilityFix

- Chạy `SUPABASE_SETUP.sql` trên project Supabase đã có bảng legacy `push_subscriptions` không còn lỗi `column family_id does not exist`.
- SQL tự bổ sung các cột relational còn thiếu cho bảng cũ trước khi tạo index, trigger và RLS policy.
- Không xóa dữ liệu legacy hiện có trong `meyeube_sync` hoặc `push_subscriptions`.
- Vẫn giữ phạm vi foundation/migration: app chưa chuyển sang đọc/ghi relational tables làm nguồn chính.
