# Media Storage V16.4.0

## Trạng thái và phạm vi

Triển khai source luồng đính kèm Sổ sức khỏe, không đổi ledger kho/care/health/planning/settings. Không có dữ liệu/khóa production để xác minh trên Supabase thật. SQL được thực thi trên PostgreSQL fixture bằng PGlite, Storage SDK/HTTP giả lập; không coi đây là kiểm thử bucket/Edge thật hay Safari/iPhone. Không có ảnh render/layout thật; kiểm tra CSS/DOM không chứng minh kích thước pixel trên Safari.

Ảnh avatar/cột mốc/timeline giữ luồng hiện hữu. Video và chuyển tất cả media các module không thuộc phần đã triển khai này. Tệp đính kèm sức khỏe được lưu nguyên byte; không nhận SVG/HTML/JS/EXE, không có quét virus. File cho phép dựa MIME được khai báo; hash xác minh tính nguyên vẹn, không thay việc xác minh nội dung an toàn. Người dùng mở tài liệu bằng trình xem phù hợp.

## Cấu hình database và bucket

1. Backup database; giữ nháp/pending và các bản file cục bộ. Trên môi trường test có schema giống đích, cài các migration1530 →1540 →1550 →1560 →1570 →1590 nếu chưa có.
2. Supabase Dashboard → SQL Editor → New query. Copy toàn bộ `20261026_1640_media_storage.txt` hoặc SQL cùng tên trong `supabase/migrations/`. Run một lần. Transaction tạo `myb_media_v1640`, server-only RPC và bucket `myb-media` riêng tư,10MiB, danh sách MIME. Có thể chạy lại, giữ metadata/file.
3. Migration không sửa/xóa business rows hiện có. Không drop `media_files` cũ. Registry mới tránh giả định schema bảng `media_files` chưa được đối chiếu đầy đủ.
4. Policy **restrictive** trên `storage.objects` loại bucket này khỏi quyền anon/authenticated, ngay cả khi project có policy permissive rộng. Chỉ server dùng service-role truy cập byte; client không được gọi RPC registry trực tiếp. Không tạo policy public true cho bucket này.
5. Kiểm tra:

```sql
select id,public,file_size_limit from storage.buckets where id='myb-media';
select has_function_privilege('anon','public.myb_media_access_v1640(text,uuid,uuid,text,jsonb)','execute');
select policyname,permissive,roles from pg_policies where schemaname='storage' and policyname='myb_media_server_only_v1640';
```

Kết quả lần lượt: public=false,10485760;false;RESTRICTIVE. Project phải có Storage schema và các role Supabase chuẩn; fixture không thay thế kiểm tra project đích.

## Deploy API phía server

Không cần đổi URL/key/Sync ID trong app. Không đưa service-role key vào trình duyệt, source ZIP, GitHub hoặc bảng cài đặt. `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` chỉ nằm trong Edge Function environment (Supabase hosted thường cung cấp sẵn); kiểm tra chúng trước khi dùng.

Từ thư mục source đã giải nén, nếu dùng Supabase CLI:

```bash
npx supabase login
npx supabase functions deploy media-storage --project-ref PROJECT_REF_CUA_BOSS --no-verify-jwt
```

Thay PROJECT_REF bằng project đúng. Hoặc tạo function tên `media-storage` trong Dashboard, dán `supabase/functions/media-storage/index.ts`, deploy và tắt JWT verification cho riêng function này. Không tắt JWT cho các function khác. SDK Storage phía Deno ghim `@supabase/supabase-js@2.57.4`; không thay dependency frontend hoặc lockfile npm chính.

Function không thêm tài khoản Auth. **Cổng truy cập giữ mô hình capability Sync ID của app hiện tại**: biết Sync ID hợp lệ là có thể dùng API gia đình đó; Sync ID không phải danh tính người dùng được xác minh. Bucket riêng tư không biến mô hình này thành phân quyền theo tài khoản. Không dùng `main` hay Sync ID dễ đoán cho tài liệu riêng tư khi triển khai; không chia sẻ Sync ID/URL ký. Chưa triển khai đăng nhập hoặc role người dùng trong bản này. App gửi anon/publishable key hiện có; key đặc quyền luôn chỉ ở server.

Sau deploy, upload file trên gia đình test. Nếu404/401/500, kiểm tra tên function, log server, JWT setting, môi trường server và migration; không mở public bucket để vượt lỗi.

## Luồng và giới hạn giao dịch

1. Client lưu byte gốc vào IndexedDB `meYeuBeFiles_v1/health_docs`, gắn đích kết nối/hồ sơ và stable ID.
2. Server giới hạn body stream trước parse10MiB+multipart overhead; MIME/size/name/UUID được kiểm tra. Registry xác minh family stable UUID từ Sync ID và member thật còn hoạt động. Đường dẫn do server tạo, không nhận path từ client.
3. Upload object không overwrite; nếu mất ACK, đọc lại object sẵn có và so SHA-256/size. Không khớp thì báo lỗi, không sửa file cũ. Registry ready chỉ sau đọc lại thành công.
4. Client lưu metadata mediaId/hash/size/type vào `other.files` bằng typed health writer OCC. Nếu conflict/mất ACK: giữ form và byte, dùng Kiểm tra kết quả lưu sức khỏe hoặc File chờ để đối chiếu; không xóa pending.
5. Storage và Postgres không chung transaction. Lỗi sau upload có thể để object chưa liên kết; được giữ riêng tư, có màn retry từ thiết bị chứa byte. Upload unlinked chưa được cấp URL download. Không báo toàn bộ hồ sơ đã lưu chỉ vì tiến trình đạt100%.
6. Xem file cần registry ready và ít nhất một liên kết metadata trong hồ sơ gia đình. Link120giây, không ghi URL vào database. Chỉ trả URL cùng Supabase origin; không cache vào service worker app shell.
7. Xóa/thay file gỡ liên kết sau ACK; không xóa byte Cloud hoặc byte local. Undo tiếp tục hoạt động. Dung lượng được giữ để phục hồi; chưa có GC tự động. Endpoint delete chỉ kiểm tra không còn dùng và báo retained, không xóa vật lý.
8. Đổi kết nối giữa request: bỏ kết quả cũ, không gắn metadata vào gia đình mới. Local bytes có tag đích chỉ đọc trong cùng đích; file local lịch sử chưa có tag cần Boss chủ động chọn chuyển từ đúng hồ sơ.

## Dùng và chuyển file cũ

Sổ sức khỏe → chọn hồ sơ → Thông tin khác → Thêm tệp đính kèm → chọn file → Lưu. Thất bại giữ file/form để thử lại; không bấm đóng nếu còn muốn giữ các trường form chưa lưu. File gốc vẫn còn trong File chờ trên cùng thiết bị khi có lỗi upload/liên kết.

Bấm tên file cũ → Chuyển file này lên Cloud. Nếu không còn file gốc trên thiết bị, app báo thiếu; hãy mở từ thiết bị đã tải file hoặc Sửa để chọn lại bản gốc. Chuyển từng file, không tự gom tất cả và không xóa local. Không có scan business rows tự động trên server.

Bấm **Kiểm tra file chờ lưu trên thiết bị** để thử lại upload đã gián đoạn hoặc metadata chưa ACK. Chỉ liệt kê các bản pending/uploaded mới có tag đúng hồ sơ/kết nối. File đã ACK sẽ được đối chiếu mediaId trước khi retry, tránh gắn trùng. File staged chưa có metadata đầy đủ có thể dùng tên gốc/loại Khác; có thể Sửa sau đó.

## Kiểm chứng trước dùng production

- Hai thiết bị, cùng Sync ID: upload JPEG/PDF/TXT, mở/tải trên máy khác, đối chiếu checksum/byte bản gốc. HEIC kiểm tra bằng iPhone; trình xem Windows có thể cần codec.
- Cắt mạng lúc upload và sau commit: thử lại, không duplicate; đóng/mở lại kiểm tra File chờ. Đổi Sync ID/hồ sơ không thấy file của đích khác.
- Thay file upload lỗi giữ liên kết file cũ; xóa/Undo và profile OCC hai thiết bị. Kiểm tra registry/object còn nguyên sau Undo.
- File quá10MiB/SVG/HTML/tên>200 bị từ chối; bucket không mở qua public URL; anon không gọi registry trực tiếp.
- Màn hút sữa/bé bú và hoàn tất bú trên320/375/390/430px, Safari portrait/landscape, font/zoom: đúng2x2, không tràn; form ẩn vẫn ẩn, thời lượng và cữ qua ngày vẫn đúng. Chưa chạy các kiểm tra màn hình này trên thiết bị thật.

Rollback frontend về16.3 không drop registry/bucket hay file;16.3 chưa biết mở Cloud file trên thiết bị khác. Muốn tiếp tục dùng đính kèm Cloud cần16.4. Không xóa dữ liệu để ép rollback. Backup DB không bao gồm object bytes; sao lưu kèm Storage riêng trước khi dọn/xóa. V16.5 dự kiến Backup & Restore có kiểm soát, chưa triển khai.
