# Security Audit — V10.9.0

## Hiện trạng
MeYeuBe vẫn dùng mô hình single-family với Supabase publishable/anon key. `sync_id` chỉ là định danh dữ liệu, không phải mật khẩu.

## Hardening trong V10.9.0
- Từ chối `sync_id = main`.
- Hiển thị cảnh báo sử dụng Sync ID khó đoán.
- Tách avatar khỏi JSON sang Storage để giảm payload.
- Release manifest và build hash giúp xác minh artifact.

## Giới hạn còn lại
RLS hiện chưa gắn với `auth.uid()`. Không phù hợp để mở public cho nhiều gia đình.

## Bắt buộc trước khi public
- Supabase Auth.
- `families`, `family_members`.
- RLS theo `family_id` và `auth.uid()`.
- Bucket avatar private hoặc signed URL.
- Di chuyển dữ liệu JSON sang bảng theo từng record.
