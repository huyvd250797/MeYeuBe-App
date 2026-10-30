# V17.19.0 — Memory Albums

## Thao tác
- Kỷ niệm → Album → Tạo album. Nhập tên (1–120 ký tự), lời giới thiệu (tối đa 2000), Lưu.
- Mở album → Chọn từ thư viện. Đánh dấu nhiều kỷ niệm, có tìm kiếm và Xem thêm, rồi Thêm. Ảnh không tải lại/nhân đôi.
- Mở album → Sửa / Thumbnail. Chọn Tự động hoặc bấm thumbnail một ảnh có trong album, Lưu album. Nếu album chưa có ảnh, thêm kỷ niệm có ảnh trước. Bộ chọn thumbnail cũng có Xem thêm cho album nhiều kỷ niệm.
- Thumbnail được chọn độc lập thứ tự. Tự động dùng ảnh hợp lệ đầu tiên theo thứ tự tùy chỉnh, không phải ảnh đầu tiên của trang đang mở. Khi ảnh bìa bị xóa trong app, chuyển về tự động. Nếu tệp bị xóa trực tiếp ngoài Drive mà database không biết, có thể hiện ảnh lỗi; chọn lại thumbnail hoặc sửa kỷ niệm.
- Tạo kỷ niệm từ album: form mở với album chọn sẵn. Mục Thêm vào album cho chọn thêm tối đa 20 album; không phải nhập tên/ngày sinh bé.
- Kỷ niệm đã có: mở chi tiết → Album → bật/tắt các album → Lưu lựa chọn. Gỡ ở đây chỉ bỏ liên kết.
- Menu ⋯ trong album có Bỏ khỏi album, bên cạnh Sửa/Xóa kỷ niệm. Xóa kỷ niệm là xóa thật cả ảnh Drive, khác Bỏ khỏi album và Xóa album.
- Sắp xếp: chọn kiểu mới nhất/cũ nhất/tùy chỉnh. Bấm Sắp xếp chuyển sang tùy chỉnh, giữ 450 ms rồi kéo giữa các thẻ đã tải. Mỗi lần thả lưu Cloud, Xong rời chế độ. Các kỷ niệm chưa tải giữ quan hệ thứ tự; thao tác move dùng ID nguồn/đích, không ghi đè toàn bộ danh sách theo trang. Pointercancel/blur/ẩn app hủy lần kéo đang dở.

## Dữ liệu và quyền
- myb_albums_v17190: tên, lời giới thiệu, cover_id, version, tombstone.
- myb_album_items_v17190: album_id + memory_id duy nhất, position.
- myb_album_ops_v17190: command UUID + kết quả để replay. Không lưu binary ảnh vào bảng này.
- RLS bật, anon/authenticated không được truy cập trực tiếp; Edge dùng service_role. Giữ mô hình dùng chung của app, không có login/family authentication mới. CORS không phải xác thực.
- Read/write album được dispatch trong memory-drive. Các thao tác album không gọi Google API để tạo/copy/delete file. Ảnh hiển thị vẫn qua proxy hiện có.
- API album đọc từng trang (mặc định 40, tối đa 100). Tối đa 200 album, 1000 kỷ niệm/album, 100 kỷ niệm mỗi lần thêm. Tab Tất cả giữ giới hạn 500 hiện tại; bộ chọn thư viện và chi tiết album dùng truy vấn riêng có phân trang.
- Không đồng bộ realtime. Thiết bị khác mở lại/tải lại để thấy cập nhật. Thứ tự album-member trên Cloud, thứ tự dấu + vẫn riêng thiết bị như V17.18.2.

## Tính nhất quán
- Writer album dùng transaction và lock chung cho metadata/liên kết; expected version chặn thiết bị cũ ghi đè. UUID replay cùng command không thêm trùng. Không tự merge thay đổi cũ.
- Thêm/bỏ nhiều album ở chi tiết kỷ niệm kiểm tra version các album thay đổi và ghi cùng transaction.
- Ghi kỷ niệm từ form với albumIds: IDs được giữ trong fingerprint/job payload trước upload. Trigger gắn album trong chính transaction xác nhận kỷ niệm. Album đã bị xóa/đầy lúc upload sẽ được bỏ qua và ACK có albumWarnings; kỷ niệm vẫn được lưu, UI báo rõ. Lần retry không gắn lại theo dữ liệu đã đổi.
- Khi backend chưa xác nhận, IndexedDB giữ command; bấm Tiếp tục lần lưu trước, không sửa/xóa dữ liệu trình duyệt. Lỗi validation/conflict đã xác định rollback cho phép sửa form lại. Nếu conflict ở album, quay lại album để tải version mới và đối chiếu trước khi chọn lại.
- Drive/SQL vẫn không có transaction chung cho thay/xóa ảnh: giữ cơ chế job của V17.18.1. Thao tác album thuần metadata không có vấn đề phân tán Drive này.
- Khi xóa kỷ niệm thật, trigger gỡ mọi liên kết và bỏ thumbnail liên quan. Xóa riêng ảnh giữ liên kết nhưng cover fallback. Thay ảnh giữ File ID cũ; album dùng bản ảnh mới sau tải lại.

## Cài đặt qua Dashboard
1. Backup Supabase và ảnh quan trọng trước nâng cấp.
2. Nếu dự án đã V17.18.2: chỉ chạy `20261030_17190_memory_albums.sql` trong SQL Editor. Cài mới: hoàn thành schema nền và migration 17180 → 17181 trước 17190. Không reset/drop bảng production.
3. Edge Functions → memory-drive → Code: thay index.ts bằng bản trong ZIP rồi Deploy. Verify JWT giữ OFF như bản trước.
4. Các secrets GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN/GOOGLE_DRIVE_FOLDER_ID/MEMORY_ALLOWED_ORIGINS/MEMORY_DAILY_WRITES giữ nguyên. Không chuyển sang frontend/Vercel env.
5. Deploy frontend với Node 24, npm ci, npm run build, dist. Nhận cập nhật PWA.
6. Có thể mở endpoint GET ?action=capabilities để xem albumVersion 17190. Không dán Google token vào URL.

## Kiểm tra sau deploy
- Tạo 2 album, thêm cùng kỷ niệm vào cả hai; folder Drive không tăng số file.
- Chọn thumbnail khác ảnh đầu, lưu, mở lại và trên thiết bị B kiểm tra đúng ảnh.
- Bỏ khỏi album/xóa album: ảnh và kỷ niệm vẫn xem được ở Tất cả/album khác.
- Sửa ảnh kỷ niệm: cover dùng ảnh mới, File ID giữ nguyên. Xóa ảnh: thumbnail đổi sang ảnh khác còn hợp lệ.
- Hủy xác nhận xóa không gọi writer. Xóa thật kỷ niệm gỡ khỏi mọi album và Drive.
- Hai thiết bị sửa album cùng version: một thiết bị bị conflict, không ghi đè. Mất ACK rồi Tiếp tục không tạo album/liên kết trùng.
- Kiểm tra cảm ứng Safari/PWA iPhone thật: thumbnail radio, nhiều checkbox, giữ/kéo và cuộn. Kiểm tra code mô phỏng không thay thế xác minh thiết bị thật.

## Backup / rollback
Backup các bảng memories/ops/jobs cũ và 3 bảng album mới. Backup chức năng cũ của app chưa bao gồm module memories/albums, cần backup database và Drive riêng. Rollback frontend về V17.18.2 có thể ẩn album, giữ bảng và Edge mới. Hoàn tất command pending trước rollback; không drop bảng album hoặc trigger cleanup vì có thể mất liên kết. Album xóa giữ tombstone để replay, không có Undo album trong bản này; ảnh/kỷ niệm không bị xóa theo.

## Chưa có
Video/HEIC, xuất cả album thành PDF, link chia sẻ nguyên album, upload ảnh bìa rời ngoài thư viện, crop thumbnail riêng và phân trang tab Tất cả. Thumbnail hiện tại chọn từ ảnh của kỷ niệm trong album và căn giữa khi hiển thị.
