# Mẹ Yêu Bé V16.4.0 — Media Storage

Nâng cấp từ đúng ZIP `MeYeuBe_v16.4.0(1).zip` Boss gửi. Source và kiểm thử local; chưa push/deploy, chưa kết nối Supabase production.

- Tệp đính kèm **Sổ sức khỏe**: upload bản gốc lên bucket riêng tư `myb-media` qua Edge Function. Server đọc lại toàn bộ byte, kiểm tra SHA-256/dung lượng trước khi trả kết quả; sau đó client lưu metadata bằng API hồ sơ có OCC/ACK hiện hữu. Không lưu URL ký có hạn vào database.
- Hỗ trợ JPEG, PNG, WebP, HEIC/HEIF, PDF, TXT, DOCX, XLSX; tối đa **10 MiB/file**. Không nén/đổi byte gốc. HEIC được lưu nguyên bản; khả năng xem trước phụ thuộc trình duyệt, vẫn mở/tải được qua liên kết.
- File được giữ trong IndexedDB trước khi gửi. Tiến trình upload0–95%;100% khi server xác nhận byte, tiếp theo đợi ACK hồ sơ. Mất mạng/thất bại giữ form, cùng ID khi thử lại; màn **Kiểm tra file chờ lưu trên thiết bị** hỗ trợ khôi phục file upload chưa liên kết.
- Bấm tên file cục bộ → **Chuyển file này lên Cloud**. Chuyển từng file, đúng hồ sơ/đích kết nối; không xóa bản gốc. Thiết bị thiếu file sẽ báo rõ, cần thao tác từ máy còn giữ bản gốc. File đã mất không thể tự khôi phục.
- Thiết bị khác mở file đã upload và lưu hồ sơ bằng URL riêng tư hạn2phút. Mở lại để lấy URL mới. Khi mất kết nối và có bản gốc trên máy, viewer dùng bản cục bộ. Không tự tải tất cả file khi khởi động dashboard.
- Xóa/thay đính kèm chỉ cập nhật liên kết hồ sơ sau ACK; giữ byte cũ riêng tư để Undo/đối chiếu. **Chưa tự purge object/file mồ côi, chưa giải phóng dung lượng Storage tự động**. Không xóa hàng `storage.objects` bằng SQL để dọn byte.
- Ngày–giờ chăm sóc và popup hoàn tất bú: **Ngày bắt đầu | Từ giờ / Ngày kết thúc | Đến giờ**, hai dòng/hai cột cả mobile; minmax(0,1fr), gap12px, native input min-width0 và border-box. Ngày/giờ chuyển kho cùng2cột; giữ các điều kiện ẩn/hiện và giá trị input cũ. Không thêm ngày kết thúc mới vào nghiệp vụ lịch hẹn vốn chỉ có một ngày.
- Giữ dark mode, splash versionV16.4.0, startup đủ dữ liệu và cập nhật PWA chủ động từ16.3.

**Cần chạy migration1640 và deploy Edge Function `media-storage` trước khi dùng chức năng Cloud file.** Bàn giao TXT cùng nội dung SQL để Boss copy, không có TXT preflight vô nghĩa.

**Phạm vi:** V16.4 chuyển luồng file gốc của Sổ sức khỏe. Avatar, ảnh cột mốc và media timeline vẫn theo luồng hiện hữu (ảnh nén/data URL/thumbnail tùy màn); chưa chuyển tự động các nhóm này hay video lớn sang Storage. Không tuyên bố toàn bộ media cũ đã lên Cloud. Không có batch migration tự động hoặc dọn bản cục bộ.

Xem `docs/MEDIA_STORAGE_V16.4.0.md` cho triển khai, quyền và kiểm chứng thực tế.

## Cài và chạy local

Yêu cầu Node.js 22.22.2+ dòng 22, hoặc 24.15.0+ dòng 24, hoặc 26+; npm và Python 3.10+. Đã chạy kiểm thử bằng Node 24.22.1. npm dependencies chỉ phục vụ kiểm thử.

1. Giải nén, mở terminal trong thư mục `MeYeuBe_v16.4.0` chứa index.html.
2. Chạy `npm ci` để cài đúng dependency lockfile.
3. Chạy `npm start`, mở http://127.0.0.1:8080. Trên Windows nếu cần: `py -m http.server 8080 --bind 127.0.0.1`.
4. Trong Cloud Sync nhập Supabase URL, publishable/anon key và Sync ID đang dùng, bật kết nối rồi chờ sẵn sàng. Không nhập service-role key vào UI.
5. Thử thêm/sửa/xóa trên gia đình thử nghiệm; đối chiếu database và thiết bị thứ hai. Ngoài localhost, PWA/push cần HTTPS.

## Nâng cấp database

Dựa trên schema PostgreSQL 17.6 Boss cung cấp, hai RPC nền V15.0.76 và schema đang dùng. Media Storage cần migration1640 và Edge Function mới; không thêm tài khoản đăng nhập.

1. Backup database và bảo toàn nháp/queue trên mọi thiết bị. Hoàn tất dữ liệu chờ bằng bản cũ trước khi chạy SQL, đóng các tab cũ. Sau 1550, API cũ từ chối health_member/pregnancy. Nếu còn queue cũ, giữ/export recovery để đối chiếu và chuyển từng record; không xóa queue để ép app chạy.
2. Trên bản sao/test có schema giống DB đích, chạy SQL Editor theo thứ tự:

| Thứ tự | File | Tác động |
| --- | --- | --- |
| 1 | `supabase/migrations/20261025_1530_catalog_api.sql` | API danh mục; nếu đã cài không cần chạy lại |
| 2 | `supabase/migrations/20261025_1540_care_milk_api.sql` | API care/milk và khóa chung; nếu đã cài không cần chạy lại |
| 3 | `supabase/migrations/20261025_1550_health_growth_api.sql` | API sức khỏe và chặn whole-profile writer cũ |
| 4 | `supabase/migrations/20261025_1560_diary_planning_api.sql` | API planning, ghi chú từng tháng và khóa writer cũ |
| 5 | `supabase/migrations/20261025_1570_scoped_settings.sql` | Scoped summary/shell, cài đặt nhóm và khóa settings writer cũ |
| 6 | `supabase/migrations/20261025_1590_scoped_realtime.sql` | Tín hiệu theo nhóm, revision/slice APIs, projection kho và nguồn theo native UUID;1580 chỉ là preflight tùy chọn |

Sau1590, chạy `supabase/migrations/20261026_1640_media_storage.sql` (hoặc TXT tương ứng) rồi triển khai Edge Function theo tài liệu Media Storage. Không chạy cả SQL lẫn TXT như hai migration khác nhau.

3. Không chạy lại migration 1530 sau 1540: nó sẽ ghi đè phần khóa catalog đã bổ sung. Nếu cần cài lại migration cũ, phải chạy lại toàn bộ các migration sau nó theo thứ tự 1530 → 1540 → 1550 → 1560 → 1570 → 1590 để khôi phục các guard.
4. Script 1570 là một transaction, không drop/reset business table, chạy lại được. Nếu báo definition/anchor không khớp, dừng và đối chiếu SQL thực tế; không bỏ kiểm tra để ép chạy.
5. Kiểm tra đọc, thay Sync ID bằng gia đình test:

```sql
select public.myb_care_list_v1540('SYNC_ID_TEST', '{"kind":"care","limit":20}'::jsonb);
select public.myb_care_list_v1540('SYNC_ID_TEST', '{"kind":"milk","available":true,"limit":20}'::jsonb);
select public.myb_health_list_v1550('SYNC_ID_TEST', '{"kind":"member","limit":20}'::jsonb);
select public.myb_app_shell_v1570('SYNC_ID_TEST');
select public.myb_settings_get_v1570('SYNC_ID_TEST');
select public.myb_scoped_summary_v1570('SYNC_ID_TEST', '{}'::jsonb);
```

6. Trên test, thử CRUD từng nhóm sức khỏe, kiểm tra kg/gram, biểu đồ sau sửa/xóa, lịch tiêm đi cùng record, lỗi mạng/mất ACK, Undo và hai thiết bị cùng sửa một record. Sau đó thử feed nhiều nguồn, sửa stored → direct, sửa lượng hút, chuyển một phần/chuyển tiếp, hủy, xóa và Undo. Đối chiếu remaining_ml với view ledger; thử mất phản hồi sau commit và hai thiết bị sửa cùng ghi nhận.
7. Sau khi xác minh quyền/schema trên test, backup DB đích rồi áp dụng cùng migration và source mới. Nâng mọi thiết bị/PWA; không tiếp tục ghi kho bằng bản cũ.

RPC mới giữ mô hình truy cập Sync ID hiện hữu, dùng SECURITY DEFINER; bảng operations bật RLS và không mở truy cập trực tiếp cho client. Không bổ sung phân quyền tài khoản. Xem `docs/SCOPED_REALTIME_V15.9.0.md` cho invariant, quyền và giới hạn tương thích.

## Cấu hình

| Cấu hình | Nơi lấy/đặt | Phạm vi |
| --- | --- | --- |
| Supabase URL, publishable/anon key, Sync ID | Cloud Sync trên thiết bị; URL/key từ project của Boss | Frontend, key công khai |
| SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Secrets của Edge Functions đang dùng | Chỉ server |
| VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT | Cấu hình Web Push hiện hữu | Private key chỉ server |
| SMART_ALERT_TZ_OFFSET_MIN | Secrets cron hiện hữu | Server |

Hai Edge Functions cũ giữ nguyên; bổ sung `media-storage`. Không đóng gói secret/backup business rows. Không có file môi trường mới vì app đang dùng cấu hình Cloud Sync hiện hữu.

## Kiểm tra

```sh
npm run check
npm test
```

`npm test` chạy toàn bộ và thất bại nếu bất kỳ suite/assertion nào lỗi. V15.4 không còn danh sách miễn trừ 8 lỗi cũ; `npm run test:regression` cũng chạy gate đầy đủ. Có thể chạy riêng `node tests/components.cjs`, `node tests/components-runtime.cjs`, `node tests/health-sql.cjs` hoặc `node tests/health-runtime.cjs`. Các bộ care/milk/catalog vẫn chạy đầy đủ. `node tests/design-system.cjs` kiểm tra asset/CSS/theme/contrast và status. Màu text/semantic token được kiểm tra tỷ lệ4.5:1; không đồng nghĩa toàn bộ màn hình cũ đã đạt WCAG.

PGlite thực thi migration với fixture quan hệ/constraint/trigger/view theo schema cung cấp; jsdom chạy form thật nối tới DB fixture. Đây không phải kiểm chứng Supabase production, đa session PostgreSQL thực hay thiết bị vật lý. Báo cáo ở `docs/TEST_RESULTS_V16.4.0.json` và `docs/VALIDATION_REPORT_V16.4.0.md`. Chưa có kiểm thử pixel/layout trong trình duyệt thật hoặc iPhone. Các hợp đồng CSS/viewport/theme kiểm tra tự động không thay cho bước này. App tĩnh không cần transpile/build.

## Lỗi và phục hồi

- Thiếu API/migration: giữ nguyên form, cài SQL đúng project/thứ tự; không fallback ghi snapshot.
- Care/milk/health timeout: giữ form và bấm Lưu lại để kiểm tra mã thao tác cũ. Sau reload dùng “Kiểm tra kết quả lưu”. Không xóa dữ liệu trình duyệt trong lúc kết quả chưa rõ.
- Nếu thao tác trước đã lưu nhưng form đã đổi: app tải ACK, yêu cầu kiểm tra/mở lại trước khi gửi nội dung mới. Không gộp hai ý định thành một lệnh.
- Xung đột: tải lại dữ liệu và mở lại form. Undo bị từ chối nếu nguồn sữa/event đã thay đổi tiếp.
- Danh mục đang dùng: chuyển Tạm ẩn thay vì xóa. Bình/túi đã dùng không đổi loại.
- File đính kèm giữ byte ở IndexedDB trên thiết bị như bản trước; chỉ metadata được gửi DB. Xóa metadata không xóa byte cũ để hỗ trợ Undo. Chưa upload file gốc lên Storage hoặc tự dọn byte không còn tham chiếu.
- Generic import/Undo snapshot thay đổi sức khỏe, thai kỳ, care, kho hoặc danh mục sẽ bị chặn. Dùng thao tác theo ghi nhận; không dùng backup cũ để ghi chồng kho.
- Lệch mapping/trùng mã/thiếu liên kết: giữ dữ liệu và đối chiếu riêng; không tự dedupe/rebuild. Recovery xuất trong Cloud Sync chứa nháp/queue/command chờ, không phải file Nhập DB thông thường.
- Lần mở đầu tải lịch sử đầy đủ; realtime bình thường chỉ đọc nhóm thay đổi. Khi đang nhập/sửa, toàn bộ cập nhật nền có thể bị hoãn để giữ form và các chỉ số liên quan nhất quán.
- Bảng `myb_realtime_events` cần thuộc publication `supabase_realtime`. SQL1590 tự thêm khi publication có sẵn. Nếu kết quả `publication_ok=false`, bật Realtime cho đúng bảng tín hiệu trên Supabase; không cần bật tất cả bảng nghiệp vụ. Cấu hình cũ trên `meyeube_sync` không thay thế bước này.
- Nếu kho vẫn bị khóa sau khi cài SQL1590 và cập nhật PWA, giữ nguyên dữ liệu, kiểm tra đáp ứng `myb_care_list_v1540(..., {kind:milk})`: `_available`, `status`, `remaining`, `expireDateTime`. Ảnh không chứa hàng database nên không thể tự kết luận dữ liệu production sai hoặc tự khôi phục521 túi.

## Push GitHub

Chưa push/deploy trong lần bàn giao này. Với repository mới trống, tại thư mục source:

```sh
git init
git add .
git commit -m "Release MeYeuBe v16.4.0 Media Storage"
git branch -M main
git remote add origin <URL_REPO>
git push -u origin main
```

Với repository đã có: clone/fetch mới nhất, tạo branch nâng cấp, đối chiếu và áp dụng source, tích hợp thay đổi remote rồi commit/push. Không force push để vượt `fetch first`. Giữ thay đổi ngoài phạm vi; không đưa node_modules, recovery, .env hoặc backup vào Git.

## Deploy từ GitHub trên Vercel/Netlify

1. Import/connect repository, branch phát hành và root directory chứa index.html.
2. Chọn Other/static. Build command để trống; output/publish directory là thư mục chứa index.html (thường `.`). Không deploy thư mục cha của ZIP.
3. Không cần devDependencies để phục vụ app. Không công khai node_modules, tests, backup hoặc recovery; chỉ phục vụ tài nguyên runtime cần thiết theo cấu hình hosting của Boss.
4. Cấu hình Cloud Sync trên thiết bị, cùng project/Sync ID; không đưa secret server vào frontend. Không có Auth callback mới.
5. Sau deploy HTTPS kiểm tra build.json = 16.4.0, runtime/PWA nạp đúng module, thêm ghi nhận test, đối chiếu DB và thiết bị thứ hai; kiểm tra mất mạng, update và push hiện hữu. Bản sau phát hành qua push branch đã kết nối.

## Rollback

Hoàn tất/đối chiếu request và command chờ trước. Có thể quay frontend V16.3.0 để điều tra, giữ database1640/bucket và các guard hiện có. V16.3 chưa mở được Cloud file trên thiết bị khác. Không xóa queue/file/browser data hoặc chạy lại migration cũ để ép app hoạt động. Không reset, drop bảng operations hay phục hồi business rows chỉ để đổi frontend. Bản này không có rollback SQL phá hủy dữ liệu.

## Kiểm thử và giới hạn

Chạy `npm test` và `python3 release_check.py`. Báo cáo hiện tại: `docs/TEST_RESULTS_V16.4.0.json`, `docs/VALIDATION_REPORT_V16.4.0.md`. Không truy cập Supabase production/thiết bị thật trong lần xây dựng này. Chưa push/deploy.

## Nâng cấp từ V16.3.0

1. Giữ backup database và file/nháp/pending trên các thiết bị. Hoàn tất hoặc đối chiếu thao tác chưa xác nhận trước khi thay source.
2. Database đã cài1590: chạy migration1640 rồi deploy Edge Function media-storage theo docs/MEDIA_STORAGE_V16.4.0.md. Không reset hoặc chạy lại các migration cũ.
3. Cập nhật toàn bộ source, bao gồm `src/ui/` và `src/styles/`, lên hosting và nâng PWA trên mọi thiết bị. Không chỉ thay app.js: app có các dependency component bắt buộc và SW đã precache chúng.
4. Kiểm tra build.json=16.4.0. Không xóa browser data để ép cập nhật vì có file/nháp local. Khi code mới không tải được, kiểm tra đủ asset và cache/source version theo URL.
5. Thử hút sữa → chọn kho tự động/thủ công → bú có sữa thừa → sửa/xóa/Undo; thử mở/đóng popup, chuyển tab/lọc và nhận realtime khi đang nhập. Bộ fixture local đã kiểm tra, cần xác minh Supabase/iPhone thật sau triển khai.

Đổi về frontend16.3 nếu cần điều tra; giữ database1640 và Storage, không reset/drop bảng/operations. Chưa push/deploy trong lần bàn giao này.

## Phiên bản kế tiếp

**V16.5.0 — Backup & Restore**: sao lưu/khôi phục có kiểm soát theo bản ghi, preview/validate trước khi ghi, có kế hoạch kèm byte file Storage. Chưa triển khai. Gửi ZIP16.4 mới nhất và yêu cầu xây dựng khi Boss chọn tiếp.
