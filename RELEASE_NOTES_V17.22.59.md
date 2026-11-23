# MeYeuBe V17.22.59 — Milk Container Save and Capacity Warning Fix

## Fix 1 — Bình/túi sửa nhưng không cập nhật
- SQL migration mới đồng bộ đồng thời `capacity` và `capacityMl` trước khi ghi danh mục, tránh việc giữ dung tích cũ trong record xuất từ relational database.
- Sau mỗi lần thêm/sửa/xóa/tạm ẩn, ứng dụng đọc lại danh mục từ Supabase và so sánh dữ liệu thực tế trước khi thông báo “Lưu thành công”.
- Nếu backend không lưu được hoặc chưa xác nhận, giữ nguyên form và hiển thị lỗi cụ thể để người dùng biết phải tải lại và kiểm tra.
- Không tự ý chỉnh sửa lượng sữa đã hút hoặc lịch sử tồn kho.

## Fix 2 — Lưu hút sữa vượt dung tích bình
- Trước khi lưu, nếu người dùng chọn bình dung tích 150 ml nhưng ghi hút 250 ml, cảnh báo nêu rõ tên bình, dung tích tối đa, lượng sữa đang nhập, số ml vượt và hướng xử lý.
- Cảnh báo áp dụng cả khi API Supabase từ chối do dung tích ở server. Form giữ nguyên để sửa; không tạo bản ghi lỗi hay ghi giả thành công.
- Vẫn giữ ràng buộc kiểm tra dung tích ở database.

## Triển khai
1. Chạy file `supabase/migrations/20261123_1759_catalog_capacity_consistency.sql` đúng một lần trên Supabase SQL Editor (cùng project đang dùng).
2. Deploy source V17.22.59 lên Vercel.
3. Mở ứng dụng, tải lại danh mục bình/túi, sửa dung tích và xác nhận giá trị đã cập nhật.

## Lưu ý
- Migration SQL bắt buộc để đồng bộ hai trường dung tích ở backend hiện tại. Triển khai giao diện riêng không đảm bảo xử lý hoàn toàn lỗi lưu danh mục.
- Không cần xóa hoặc reset database.
