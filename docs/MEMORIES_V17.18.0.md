# V17.18.0 — Drive tập trung, không xác thực gia đình

## Cấu hình cần có
- Supabase project đang dùng. Chạy migrations cũ như README nếu là cài mới. Với nâng cấp chỉ chạy `supabase/migrations/20261030_17180_memories.sql` trong SQL Editor. Migration không thay bảng cũ, chạy lại an toàn.
- Google Cloud project: bật Google Drive API; tạo OAuth consent screen, thêm email Boss làm test user khi đang Testing.
- Tạo OAuth Client loại Web application. Thêm redirect URI `http://localhost:8765/callback`. Tải JSON client về máy quản trị, không đưa vào thư mục source/git.
- Supabase CLI trên máy quản trị (`supabase --version`); đăng nhập và liên kết đúng project trước deploy. Cài theo https://supabase.com/docs/guides/cli .

## Kết nối Drive quản trị
Có thể dùng OAuth Playground (https://developers.google.com/oauthplayground/) với **Use your own OAuth credentials**, nhập Client ID/Secret của Boss và cấu hình callback Playground trong OAuth client.
1. Nếu muốn dùng **thư mục có sẵn** theo link Boss: scope `https://www.googleapis.com/auth/drive` để truy cập thư mục đó. Scope rộng chỉ dùng ở backend quản trị; không cấp token này cho thiết bị sử dụng app. `drive.file` không mặc nhiên được truy cập mọi thư mục cũ.
2. Authorize bằng tài khoản Boss, Exchange authorization code for tokens. Cần **refresh_token**, không chỉ access_token. Chọn offline access/consent; nếu không có refresh token, cấp quyền lại.
3. Lấy Folder ID từ link `https://drive.google.com/drive/folders/FOLDER_ID`. Chọn thư mục chuyên dùng; không dùng URL file ảnh hay Shared Drive không thuộc tài khoản.
4. Copy `.env.example` ra một file riêng ngoài source, chỉ giữ các biến GOOGLE_* và MEMORY_* rồi điền giá trị. Không gửi token vào chat.
5. Nếu OAuth app còn Testing với scope Drive, refresh token có thể hết hạn sau 7 ngày. Đưa consent app sang Production theo yêu cầu Google để vận hành lâu dài; Google vẫn có thể yêu cầu xác minh hoặc cấp quyền lại. Không hứa token tồn tại vĩnh viễn.

## Biến môi trường backend
| Biến | Giá trị |
|---|---|
| GOOGLE_CLIENT_ID | OAuth Client ID |
| GOOGLE_CLIENT_SECRET | Secret của OAuth client |
| GOOGLE_REFRESH_TOKEN | Token offline của chính Boss |
| GOOGLE_DRIVE_FOLDER_ID | ID thư mục đích cố định, không phải link đầy đủ |
| MEMORY_ALLOWED_ORIGINS | Các origin app ngăn bằng dấu phẩy, không có dấu / cuối; ví dụ https://app.example.com,http://127.0.0.1:8080 |
| MEMORY_DAILY_WRITES | Số thao tác save/delete tối đa mỗi ngày toàn project, mặc định 200 |
| SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY | Hosted Edge runtime cung cấp; chỉ backend |

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set --env-file /absolute/path/to/private-drive.env
supabase functions deploy memory-drive --no-verify-jwt
```
Không đặt secrets vào VITE_*, localStorage, settings, hoặc frontend. `.env.example` chỉ là mẫu. CLI có thể không cài sẵn trong source.

## Mở module trên các thiết bị
Cấu hình Supabase URL trong Cloud như trước. Module mới chỉ dùng URL, không yêu cầu Sync ID, anon key hay bật Cloud. Trong app chọn Thêm → Kỷ niệm của bé. Mọi thiết bị dùng cùng URL dùng chung danh sách. Mở lại/tải lại để cập nhật, chưa có realtime.
Chọn ảnh, nhập tiêu đề/ngày và lưu. App nén sang JPEG; Edge tải ảnh vào folder cố định, đặt quyền công khai và xác minh trước commit database. Hiển thị và xuất thẻ lấy ảnh qua Edge proxy có CORS để tránh lỗi canvas từ Drive. Proxy chỉ đọc file được tham chiếu bởi bản ghi chưa xóa; không nhận fileId tùy ý từ trình duyệt. Người có link Drive vẫn xem ảnh công khai trực tiếp. Ảnh công khai có thể bị chuyển tiếp.

## Quyền, giới hạn và tính nhất quán
Không có xác thực gia đình hay tài khoản người dùng cho module mới. Endpoint đọc/ghi công khai theo thiết kế Boss yêu cầu. CORS là giới hạn trình duyệt, không ngăn client ngoài trình duyệt. Bảng chỉ cho service_role truy cập trực tiếp. Mọi thiết bị truy cập app đều có thể sửa/xóa mọi kỷ niệm chung.
- 500 kỷ niệm mới nhất theo ngày, giới hạn có thông báo; chưa có phân trang lịch sử.
- OCC version chặn thiết bị cũ ghi đè, operation UUID phục hồi lần lưu bị mất ACK.
- Giới hạn 5 MiB áp dụng cả body streamed; quota 200 thao tác/ngày dùng bộ đếm database, không phải quota theo người. Đọc ảnh vẫn tạo băng thông qua Supabase Edge (không phải Supabase Storage).
- Lỗi tải/share/SQL giữ form; nếu lỗi không rõ kết quả hãy thử lưu lại **không đổi form** trước để truy vấn lại operation cũ. Chỉnh form sau kết quả chưa rõ có thể gặp conflict, cần tải lại đối chiếu.
- Hai yêu cầu tải cùng lúc sau mất ACK có thể tạo tệp dư ở Drive; commit database chỉ một kết quả. Ảnh đã upload nhưng share/SQL thất bại cũng có thể còn trong Drive. Không tự xóa file để tránh mất ảnh, quản trị dọn thư mục khi cần.
- Xóa kỷ niệm là soft delete, ảnh giữ trên Drive. Thay ảnh chỉ đổi tham chiếu sau lưu thành công. Không có xóa media vĩnh viễn trong app.
- Bản này không tự tải ảnh khi đóng PWA, không lưu bản nháp bền vững qua reload, không lưu video/HEIC/nhiều ảnh mỗi kỷ niệm.

## Kiểm tra sau deploy
1. Từ thiết bị A, tạo kỷ niệm có ảnh; kiểm tra file nằm đúng folder, quyền anyone reader.
2. Thiết bị B không đăng nhập Google, cùng URL Supabase: tải danh sách, xem ảnh và xuất JPEG.
3. Sửa/xóa giữa A và B để kiểm tra conflict. Tắt mạng lúc lưu rồi thử lại không đổi form, kiểm tra không trùng bản ghi.
4. Thu hồi quyền Google/thử ảnh vượt giới hạn: app báo lỗi và giữ nội dung.
5. Kiểm tra Safari/PWA iPhone thật: chọn ảnh, chiều ảnh, font tiếng Việt, tải/chia sẻ JPEG.

## Backup / rollback
Backup Supabase các bảng myb_memories_v17180, myb_memory_ops_v17180; backup Drive riêng. Backup cũ của app chưa bao gồm module kỷ niệm này. Giữ ảnh trên Drive khi rollback. Deploy frontend V17.17.1 để ẩn module; không drop bảng mới và không reset database. Có thể ngừng Edge Function riêng, không ảnh hưởng API cũ.

## Lỗi thường gặp
- Không có danh sách: kiểm tra migration, tên function, Supabase URL và origin.
- Drive 403: kiểm tra folder, scope, tài khoản sở hữu, dung lượng, chính sách chia sẻ Workspace.
- Cần cấp quyền lại: lấy refresh token mới và cập nhật secret backend; không kết nối từng thiết bị.
- Không export: kiểm tra proxy memory-drive, CORS, ảnh còn tồn tại và quyền Google backend.
- Lỗi trường đã đổi: tải lại sau khi ghi lại nội dung cần giữ để đối chiếu, không ghi đè tự động.

Source hoàn thành không có nghĩa Drive production đã hoạt động: cần cấu hình các thông tin trên và kiểm chứng tài khoản thật. Chưa push/deploy trong lần bàn giao này.
