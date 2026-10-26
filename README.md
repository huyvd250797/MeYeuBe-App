# Mẹ Yêu Bé V16.5.0 — Backup & Restore

Nâng từ ZIP `MeYeuBe_v16.4.0.zip` Boss gửi. Source + kiểm thử local; **chưa push/deploy, chưa chạy SQL lên Supabase của Boss**. Không thêm đăng nhập.

## Nội dung bản này

- Sao lưu trực tiếp các bảng nghiệp vụ quan hệ theo whitelist, giữ UUID native/legacy ID và liên kết. Đọc các bảng trong một câu SQL để cùng snapshot MVCC; không xuất browser credentials, queue, Auth, subscription hay operation/Undo logs.
- Hai lựa chọn: **Dữ liệu + file** và **Chỉ dữ liệu**. Gói `.myb-backup.json` có SHA-256 toàn gói và từng file. File gồm bucket `myb-media` và file sức khỏe IndexedDB trên máy xuất; file thiếu/omitted được liệt kê, không gắn nhãn đầy đủ giả.
- Kiểm tra format/protocol version, checksum, UUID, schema cột/kiểu, trường bắt buộc, liên kết và gia đình. Chỉ phục hồi vào **cùng Sync ID/gia đình hiện hữu**. Không phải công cụ dựng lại toàn bộ project Supabase hoặc chuyển dữ liệu sang gia đình khác.
- Xem trước số thêm/cập nhật/giữ/xung đột, tên bản ghi và báo cáo tải xuống. Mặc định chỉ bổ sung thiếu, giữ bản ghi khác nội dung; cập nhật theo bản sao cần chọn chế độ, xem trước lại và xác nhận. Không xóa bản ghi ngoài gói.
- Dữ liệu phục hồi **theo từng bản ghi trong một transaction**; kiểm tra lại revision sau xem trước. Constraint/ledger lỗi thì rollback toàn bộ dữ liệu của lần phục hồi. Số dư sữa tính lại từ giao dịch, kiểm tra liên kết feed/ledger; không tin remaining_ml trong gói.
- Nhật ký private có before-image và job ID; mất ACK thì tra trạng thái trước, không áp lại dữ liệu đã commit. Gói/tiến trình lưu IndexedDB để tiếp tục file còn lỗi trên đúng thiết bị/đích kết nối. Có nút tải dữ liệu trước phục hồi (không kèm file).
- File có bước upload/đọc lại/hash độc lập sau transaction DB. DB xong mà file lỗi sẽ hiện trạng thái còn thiếu, không báo toàn bộ hoàn tất. Storage không chung transaction với Postgres.
- Giữ ngày–giờ2x2, dark mode, splash phiên bản và cập nhật PWA chủ động. Feature mới tách thành `src/features/backup/service.js` và `ui.js`; không tuyên bố đã tách hết app.js.

**Cần chạy migration1650 và triển khai lại Edge Function `media-storage` từ ZIP này**. TXT1650 chỉ chứa ASCII để Boss mở/copy trên iPhone không lỗi mã hóa. Migration1640 trong source cũng đã dùng Unicode escape; thông báo chạy thật vẫn tiếng Việt có dấu.

## Cài và chạy local

Yêu cầu Node.js22.22.2+ dòng22 hoặc24.15.0+ dòng24 hoặc26+, npm và Python3.10+. Kiểm thử dùng Node24.22.1; dependency test ghim trong package-lock.json. App tĩnh, không cần transpile/build frontend.

1. Giải nén, mở terminal trong `MeYeuBe_v16.5.0` chứa index.html.
2. `npm ci`
3. `npm start`, mở http://127.0.0.1:8080. Windows có thể dùng `py -m http.server 8080 --bind 127.0.0.1`.
4. Cloud Sync: Supabase URL, anon/publishable key, Sync ID đúng gia đình và bật kết nối. Không nhập service-role vào frontend. PWA ngoài localhost cần HTTPS.

## Database và Storage

Backup DB và giữ file/nháp/pending trên các thiết bị. Hoàn tất/đối chiếu request chờ trước khi nâng cấp. Đóng các tab cũ sau khi đã xử lý pending.

| Thứ tự | Migration trong supabase/migrations | Ghi chú |
| --- | --- | --- |
| 1 | 20261025_1530_catalog_api.sql | Chỉ cài nếu chưa có |
| 2 | 20261025_1540_care_milk_api.sql | Khóa/OCC/ledger |
| 3 | 20261025_1550_health_growth_api.sql | Health theo bản ghi |
| 4 | 20261025_1560_diary_planning_api.sql | Planning |
| 5 | 20261025_1570_scoped_settings.sql | Scoped/settings |
| 6 | 20261025_1590_scoped_realtime.sql | Scoped signals |
| 7 | 20261026_1640_media_storage.sql | Private registry/bucket |
| 8 | 20261026_1650_backup_restore.sql | Backup/preview/apply/status/before-image |

Nếu DB đã1640, **chỉ chạy1650**. Supabase → SQL Editor → New query → copy toàn bộ `20261026_1650_backup_restore.txt` → Run. TXT và SQL1650 cùng byte; không chạy như hai migration khác nhau. Script chạy lại được, không reset/drop business tables hoặc xóa dữ liệu cũ. Không chạy lại1530 riêng lẻ sau1540 vì sẽ mất guard của bản sau; nếu phải cài lại, chạy đầy đủ các migration tiếp theo đúng thứ tự.

1650 tạo journal `myb_restore_jobs_v1650` bật RLS, revoke truy cập trực tiếp anon/auth; RPC scoped theo Sync ID. Không đổi chính sách Storage private của1640, không công khai bucket. Before-image/journal vẫn chiếm dung lượng DB và không tự purge; file mồ côi/byte đã xóa liên kết vẫn được giữ như1640. Chưa có retention/GC tự động.

Kiểm tra trên gia đình test:

```sql
select public.myb_backup_export_v1650('SYNC_ID_TEST');
select has_table_privilege('anon','public.myb_restore_jobs_v1650','select');
select has_function_privilege('anon','public.myb_backup_snapshot_v1650(uuid)','execute');
```

Hai kết quả quyền phải false. Lệnh export chứa dữ liệu gia đình; không chia sẻ output lên nơi công khai. Không tự bịa Sync ID production.

## Cập nhật Edge Function

Từ thư mục source, với Supabase CLI:

```bash
npx supabase login
npx supabase functions deploy media-storage --project-ref PROJECT_REF_CUA_BOSS --no-verify-jwt
```

Thay project ref đúng. Hoặc deploy lại function cùng tên trong Dashboard từ `supabase/functions/media-storage/index.ts`, giữ JWT verification tắt cho riêng function này theo mô hình1640. Hai function nhắc việc/push cũ không đổi. SDK Deno ghim2.57.4 như1640, không thêm dependency frontend.

| Cấu hình | Nơi dùng | Nguồn |
| --- | --- | --- |
| Supabase URL, anon/publishable key, Sync ID | Cloud Sync frontend | Project và Sync ID hiện hữu |
| SUPABASE_URL | Edge environment | Project Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Chỉ Edge environment | Supabase hosted cung cấp; không đưa vào app/Git/ZIP |
| VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT | Function push hiện hữu | Giữ cấu hình cũ; private chỉ server |

Không có `.env` frontend mới hoặc Auth callback mới. **Sync ID vẫn là capability truy cập hiện hữu, không phải tài khoản Auth được xác minh**; private bucket không thay mô hình này thành phân quyền tài khoản. URL ký2phút và không ghi URL vào backup. Không đổi sang service-role client để vượt lỗi401/permission.

## Sử dụng

Thêm → Sao lưu và dữ liệu phục hồi → **Sao lưu & Phục hồi**.

1. Chọn Dữ liệu + file để tạo bản sao từ database và gom file hỗ trợ; kiểm tra file tải về và cảnh báo thiếu. Chỉ dữ liệu giữ metadata, không chứa byte file ngoài DB.
2. Chọn gói `.myb-backup.json` V16.5 → chọn cách xử lý xung đột → Xem trước. Gói cũ chỉ có JSON UI state không đủ sổ ledger/file/schema để phục hồi an toàn; vẫn giữ lịch sử xem/xuất cũ, không mở lại whole-JSON import.
3. Tải báo cáo xem trước hoặc dữ liệu trước phục hồi nếu cần; xem tên/count và tình trạng file. Đánh dấu xác nhận → Xác nhận phục hồi.
4. Giữ app mở. Database có transaction và idempotent job; file xác minh riêng. Không đổi kết nối hoặc nhập nghiệp vụ khác trong lúc xử lý.
5. Nếu app đóng/mất ACK, mở lại cùng thiết bị và cấu hình → Tiếp tục / kiểm tra lần phục hồi trước. Nếu job chưa apply, app hiện lại bản xem trước để xác nhận; nếu đã commit chỉ tiếp tục file. Đã đổi dữ liệu sau preview thì phải xem trước lại.
6. Gói thiếu file không tự tạo lại bản gốc: lấy bản sao có byte, dùng máy còn giữ file hoặc tải lại file gốc. Gói không chứa file sẽ không tự được nâng thành gói đầy đủ chỉ nhờ bấm Tiếp tục.

Giới hạn chủ động:20.000 bản ghi,20MiB dữ liệu quan hệ,10MiB/file,50MiB tổng byte file,100MiB gói. Không có streaming/chia nhỏ gói trong bản này. Trình duyệt cần đủ RAM và dung lượng IndexedDB để lưu tiến trình trước khi ghi DB. File nhị phân base64 khiến gói lớn hơn byte gốc.

`completeFiles` chỉ nói về các file được liệt kê từ myb-media/đính kèm sức khỏe. Avatar/ảnh cột mốc/timeline đang nhúng data URL được giữ trong bản ghi đúng dữ liệu đã lưu; không khôi phục bản gốc đã bị nén/mất hoặc video chỉ còn thumbnail. URL bên ngoài chỉ được giữ như tham chiếu, không tự tải mọi website/bucket khác. Gia đình/table/Auth/schema/function/secret và cấu hình trình duyệt không nằm trong gói khôi phục hạ tầng.

Chi tiết thiết kế, giới hạn và checklist: `docs/BACKUP_RESTORE_V16.5.0.md`.

## Kiểm tra

```bash
npm run check
npm test
```

Không có test miễn trừ. Báo cáo: `docs/TEST_RESULTS_V16.5.0.json`, `docs/VALIDATION_REPORT_V16.5.0.md`. PGlite thực thi SQL với fixture quan hệ/constraint/trigger/view; client/UI chạy trong VM/jsdom và transport Storage giả lập. Chưa xác minh Supabase production, đa session PostgreSQL thật, WebSocket live, Safari/iPhone hoặc layout/pixel thực. Node stripTypeScriptTypes chạy handler Edge với adapter mock, không thay cho Deno deploy/typecheck thực.

## Push GitHub

Chưa push. Repo mới:

```bash
git init
git add .
git commit -m "Release MeYeuBe v16.5.0 Backup and Restore"
git branch -M main
git remote add origin URL_REPO_CUA_BOSS
git push -u origin main
```

Repo đã có source: clone repo → `git fetch origin` → tích hợp thay đổi/giữ công việc đang có → chép source mới → kiểm tra → commit → push. Nếu fetch-first: pull/rebase hoặc merge có xem xung đột, không force push ghi đè lịch sử. Không đưa `.env`, service keys, bản sao gia đình hoặc node_modules lên Git.

## Deploy Vercel / Netlify

Chưa deploy. Dùng hosting Boss đang dùng, không cần đổi nền tảng.

- Import/connect repo GitHub, chọn branch main và root có index.html.
- Framework Other/static; không cần frontend build, publish/output thư mục chứa index.html (`.` nếu hosting cho phép). Không publish riêng src/ hoặc functions/.
- Môi trường server Supabase đặt trong Edge, không phải biến frontend Vercel/Netlify. App nhận URL/key công khai qua Cloud Sync.
- Chạy SQL1650 và deploy lại Edge trước, rồi phát hành toàn bộ static source. Kiểm tra HTTPS, build.json=16.5.0, đủ module/SW assets.
- PWA cũ thông báo cập nhật chủ động; không xóa browser data để ép cập nhật vì có file/nháp/tiến trình. Commit sau tự deploy qua branch GitHub đã kết nối nếu đã thiết lập.
- Kiểm chứng gia đình test2thiết bị: tạo backup, phục hồi record/file, lost ACK, sửa/xóa/Undo kho/feed sau restore, không dùng production để thử mất dữ liệu.

## Quay lại và xử lý lỗi

Rollback frontend không hoàn tác record đã phục hồi. Before-image là dữ liệu quan hệ trước apply; muốn khôi phục giá trị trước, tải gói đó và preview update theo đúng chính sách. Nó không tự xóa record mới đã thêm bởi lần restore, không phải nút Undo toàn bộ database.

Có thể quay frontend16.4 để điều tra, giữ DB1650/bucket/byte/nhật ký. Không reset/drop business tables, không xóa queue/file hoặc chạy lại migration cũ. Request/operation cũ không được áp lại sau restore; dòng được cập nhật tăng version/updated_at, clear last_op_id để tránh Undo/pending cũ ghi chồng.

- API1650 thiếu: cài SQL đúng project. File API chưa có backup_open/restore_upload: deploy lại media-storage16.5, không mở public bucket.
- STALE_PREVIEW: dữ liệu đã đổi, tải và xem trước lại; không có force bỏ kiểm tra.
- Reference/schema/constraint/ledger: giữ gói, xem báo cáo; apply lỗi rollback toàn bộ dữ liệu của job, không xóa bản ghi để ép chạy.
- Database đã apply nhưng file thiếu: tiếp tục đúng job; gói data-only không có byte để upload. Dữ liệu đã commit không bị ghi lại khi thử file.
- IndexedDB quota: không bắt đầu apply nếu không lưu được gói/tiến trình. Giữ file tải về; đừng xóa file gốc.

## Phiên bản kế tiếp

**V16.6.0 — Notifications**: củng cố quy tắc nhắc việc, retry/chống trùng, kiểm tra nền/push thực tế. Chưa xây dựng. Gửi ZIP16.5 mới nhất khi Boss yêu cầu phiên bản tiếp theo.
