# Backend nền V17.18.1 (giữ nguyên cho V17.19.0)

Không cần chạy lại SQL/deploy Edge nếu V17.18.1 đang sửa/xóa ảnh được. Nội dung bên dưới là hướng dẫn backend nền để cài mới hoặc nâng cấp từ V17.18.0. V17.19.0 chỉ thay frontend; xem MEMORY_UX_V17.19.0.md.

# V17.19.0 — Memory Editing & Drive Sync

## Hành vi
| Thao tác | App/database | Drive |
|---|---|---|
| + → Kỷ niệm | Form mới, không sinh careEvent | Upload một file khi lưu |
| Sửa chữ/ngày/tên bé/ngày sinh/mẫu | Tăng version sau ACK | Không upload ảnh |
| Chọn ảnh mới trong Sửa | Preview trước lưu, giữ cùng memory ID | PATCH đúng File ID cũ; giữ link/public permission |
| Xóa ảnh trong menu hoặc checkbox form | Bỏ fileId sau xác nhận | DELETE vĩnh viễn file hiện tại, không đưa vào Trash |
| Xóa kỷ niệm | Xóa nội dung, giữ tombstone ID/version cho replay | DELETE file hiện tại |

Các hành vi xóa/thay chỉ áp dụng tệp hiện được liên kết. Không tự tìm và xóa file dư tạo trước V17.19.0. Drive có thể giữ lịch sử revision của một file theo chính sách Google; thay nội dung không đồng nghĩa tạo file mới. Không có Undo phục hồi ảnh đã xóa.

## Nâng cấp qua Dashboard (không cần CLI)
1. Giải nén ZIP V17.19.0. Chọn đúng Supabase project app đang dùng.
2. SQL Editor → New query → mở file `supabase/migrations/20261030_17181_memory_edit.sql`, copy hết và Run. Nếu thiếu myb_memories_v17180, cài migration 17180 trước (cài mới); project đang upload được đã có.
3. Edge Functions → memory-drive → Code → index.ts: thay bằng file index.ts cùng tên trong ZIP, Deploy. Giữ Verify JWT OFF.
4. Không đổi GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID, MEMORY_ALLOWED_ORIGINS, MEMORY_DAILY_WRITES nếu trước đó đang chạy. Không đặt secret trên Vercel hay frontend.
5. Cập nhật website/PWA V17.19.0. Build `npm ci` rồi `npm run build`; Vercel cấu hình build/output giữ nguyên. Không tự push/deploy trong lần bàn giao source này.

## Lỗi mạng và ghi đồng thời
Job SQL khóa theo kỷ niệm trước khi gọi Google. Mỗi command có UUID, fingerprint, snapshot và lease executor 10 phút (dài hơn thời gian worker hosted Supabase). Lần gọi trùng khi worker còn chạy sẽ báo chờ; nếu worker chết đột ngột, chờ tối đa 10 phút rồi tiếp tục. Chỉ cùng thao tác cũ được tiếp tục; thiết bị khác không được vượt qua để thay/xóa tiếp.
IndexedDB trên thiết bị gửi giữ command cùng ảnh nén, theo Supabase URL, tới khi xác nhận xong. Dùng nút Tiếp tục lần lưu trước; không xóa dữ liệu trình duyệt hoặc thay URL khi đang có thao tác chờ. Khi backend từ chối trước khi reserve, command được gỡ để sửa form. Nếu bộ nhớ thiết bị không cho ghi, app chưa gửi thao tác.

Drive và PostgreSQL không có transaction chung: sau Drive thành công nhưng SQL lỗi, ảnh có thể đã thay/xóa trong Drive dù bản ghi app còn trạng thái cũ. App báo chưa hoàn tất, chặn thao tác khác và cho tiếp tục cùng command để hoàn tất SQL; không báo đã rollback ảnh. Proxy ảnh tạm chặn đọc khi job chưa xong. DELETE retry coi Drive 404 là đã xóa. Metadata thay đổi chỉ sau ACK database. Không có tự động xóa/ghi đè dữ liệu cũ khi conflict.

Nếu mất cả IndexedDB lẫn command trước khi hoàn tất job, cần quản trị đối chiếu job trong myb_memory_jobs_v17181 và trạng thái tệp; bản này chưa có trang quản trị hủy/giải phóng job. Không tự xóa job vì có thể Drive đã thực hiện thao tác. Tên miền/origin vẫn là giới hạn trình duyệt, không phải xác thực người dùng.

## Kiểm tra thật sau nâng cấp
- Bấm +: thấy Kỷ niệm cạnh các loại chăm sóc, mở đúng form.
- Upload ảnh A, ghi lại ID từ link Drive. Sửa toàn bộ thông tin và chọn ảnh B: ID giữ nguyên, folder không tăng thêm file.
- Tải lại thiết bị khác: tiêu đề/ảnh mới đúng. URL proxy có version tránh dùng ảnh cũ.
- Xóa ảnh: lời nhắn còn, tệp cũ không còn trong Drive và không mở được link cũ.
- Thêm lại ảnh rồi xóa kỷ niệm: ảnh bị xóa, kỷ niệm không còn danh sách.
- Tắt mạng khi lưu rồi kết nối lại: Tiếp tục lần lưu trước. Kiểm tra không tạo bản ghi trùng.
- Hai thiết bị sửa cùng version: thiết bị cũ bị conflict trước khi thay đổi Drive.

## Backup và rollback
Xóa ảnh là vĩnh viễn. Backup Drive riêng trước khi thử xóa. Backup cũ của app chưa bao gồm module này; database backup cần cả memories, ops và jobs. Không rollback backend cũ khi có job pending. Nếu cần ngừng tính năng, ẩn module/tạm dừng Edge và giữ bảng để xử lý tiếp, không drop bảng hoặc reset dữ liệu. Muốn dùng lại V17.18.0 phải đối chiếu/hoàn tất mọi job, khôi phục quyền execute writer cũ có chủ đích; việc đó không phục hồi file đã bị xóa.
