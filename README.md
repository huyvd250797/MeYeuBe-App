# Mẹ Yêu Bé V16.2.0 — Performance

Nâng cấp từ ZIP MeYeuBe_v16.1.0.zip Boss gửi. Không thêm đăng nhập; không đổi dữ liệu/ledger nghiệp vụ.

- Startup tải đồng thời các nhóm care/milk, health, planning và settings sau shell; chỉ công bố dữ liệu và đóng loading khi tất cả nhóm hoàn tất. Giữ kiểm tra revision trong từng repository, đích kết nối và startup gate.
- Bỏ chờ500ms giả lập khi chuyển module local. Benchmark cùng code fetchServer/cùng delay có báo cáo trước–sau; không tuyên bố đó là thời gian Supabase/iPhone thật.
- Sửa icon thông tin bị kéo thành bầu dục bởi min-height44px chung; giới hạn input/date/time theo border-box, min-width0, track minmax và gap; mobile nhỏ chuyển cột khi cần.
- Service Worker/controller/build mới không tự reload hoặc hẹn reload sau khi đóng popup. Có bản mới sẽ hiện thông báo, Boss lưu xong rồi đóng/mở lại app để cập nhật. Không xóa dữ liệu trình duyệt để cập nhật.
- Module text-display chỉ sửa text hiển thị khi đảo mã UTF-8/CP1252 hợp lệ và giảm dấu hiệu mojibake. Không sửa database, ID, attribute, textbox/textarea đang nhập, code hoặc file. Không thể phục hồi ký tự đã mất thành dấu hỏi/�; cần dữ liệu gốc để đối chiếu.

Chi tiết: docs/PERFORMANCE_V16.2.0.md. Vẫn còn code/wrapper cũ trong app.js; bản này không tuyên bố hoàn tất tách component hoặc lazy-load toàn app.

**Database đã1590 không cần migration mới.** TXT/SQL1620 là SELECT metadata tùy chọn, không thay schema/business rows. Cập nhật toàn bộ source gồm src/ui/text-display.js, src/styles, boot.js và sw.js.

## Cài và chạy local

Yêu cầu Node.js 22.22.2+ dòng 22, hoặc 24.15.0+ dòng 24, hoặc 26+; npm và Python 3.10+. Đã chạy kiểm thử bằng Node 24.22.1. npm dependencies chỉ phục vụ kiểm thử.

1. Giải nén, mở terminal trong thư mục `MeYeuBe_v16.2.0` chứa index.html.
2. Chạy `npm ci` để cài đúng dependency lockfile.
3. Chạy `npm start`, mở http://127.0.0.1:8080. Trên Windows nếu cần: `py -m http.server 8080 --bind 127.0.0.1`.
4. Trong Cloud Sync nhập Supabase URL, publishable/anon key và Sync ID đang dùng, bật kết nối rồi chờ sẵn sàng. Không nhập service-role key vào UI.
5. Thử thêm/sửa/xóa trên gia đình thử nghiệm; đối chiếu database và thiết bị thứ hai. Ngoài localhost, PWA/push cần HTTPS.

## Nâng cấp database

Dựa trên schema PostgreSQL 17.6 Boss cung cấp, hai RPC nền V15.0.76 và schema đang dùng. Không cần `.env`, Auth callback hay Storage mới cho tính năng này.

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

Hai Edge Functions giữ nguyên. Không đóng gói secret/backup business rows. Không có file môi trường mới vì app đang dùng cấu hình Cloud Sync hiện hữu.

## Kiểm tra

```sh
npm run check
npm test
```

`npm test` chạy toàn bộ và thất bại nếu bất kỳ suite/assertion nào lỗi. V15.4 không còn danh sách miễn trừ 8 lỗi cũ; `npm run test:regression` cũng chạy gate đầy đủ. Có thể chạy riêng `node tests/components.cjs`, `node tests/components-runtime.cjs`, `node tests/health-sql.cjs` hoặc `node tests/health-runtime.cjs`. Các bộ care/milk/catalog vẫn chạy đầy đủ. `node tests/design-system.cjs` kiểm tra asset/CSS/theme/contrast và status. Màu text/semantic token được kiểm tra tỷ lệ4.5:1; không đồng nghĩa toàn bộ màn hình cũ đã đạt WCAG.

PGlite thực thi migration với fixture quan hệ/constraint/trigger/view theo schema cung cấp; jsdom chạy form thật nối tới DB fixture. Đây không phải kiểm chứng Supabase production, đa session PostgreSQL thực hay thiết bị vật lý. Báo cáo ở `docs/TEST_RESULTS_V16.2.0.json` và `docs/VALIDATION_REPORT_V16.2.0.md`. Chưa có kiểm thử pixel/layout trong trình duyệt thật hoặc iPhone. Các hợp đồng CSS/viewport/theme kiểm tra tự động không thay cho bước này. App tĩnh không cần transpile/build.

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
git commit -m "Release MeYeuBe v16.2.0 Performance"
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
5. Sau deploy HTTPS kiểm tra build.json = 16.2.0, runtime/PWA nạp đúng module, thêm ghi nhận test, đối chiếu DB và thiết bị thứ hai; kiểm tra mất mạng, update và push hiện hữu. Bản sau phát hành qua push branch đã kết nối.

## Rollback

Hoàn tất/đối chiếu request và command chờ trước. Có thể quay frontend V16.1.0 để điều tra, giữ nguyên database1590 và các guard/API hiện có. Không xóa queue/file/browser data hoặc chạy lại migration cũ để ép app hoạt động. Không reset, drop bảng operations hay phục hồi business rows chỉ để đổi frontend. Bản này không có rollback SQL phá hủy dữ liệu.

## Kiểm thử và giới hạn

Chạy `npm test` và `python3 release_check.py`. Báo cáo hiện tại: `docs/TEST_RESULTS_V16.2.0.json`, `docs/VALIDATION_REPORT_V16.2.0.md`. Không truy cập Supabase production/thiết bị thật trong lần xây dựng này. Chưa push/deploy.

## Nâng cấp từ V16.1.0

1. Giữ backup database và file/nháp/pending trên các thiết bị. Hoàn tất hoặc đối chiếu thao tác chưa xác nhận trước khi thay source.
2. Database đã cài1590 thì không chạy lại migration1530–1590. Có thể chạy TXT/SQL `20261026_1620_performance_preflight` để kiểm tra `required_rpcs_present=true`, `missing_rpcs=[]`.
3. Cập nhật toàn bộ source, bao gồm `src/ui/` và `src/styles/`, lên hosting và nâng PWA trên mọi thiết bị. Không chỉ thay app.js: app có các dependency component bắt buộc và SW đã precache chúng.
4. Kiểm tra build.json=16.2.0. Không xóa browser data để ép cập nhật vì có file/nháp local. Khi code mới không tải được, kiểm tra đủ asset và cache/source version theo URL.
5. Thử hút sữa → chọn kho tự động/thủ công → bú có sữa thừa → sửa/xóa/Undo; thử mở/đóng popup, chuyển tab/lọc và nhận realtime khi đang nhập. Bộ fixture local đã kiểm tra, cần xác minh Supabase/iPhone thật sau triển khai.

Đổi về frontend16.1 nếu cần điều tra; giữ database1590, không reset hay drop bảng/operations. Chưa push/deploy trong lần bàn giao này.

## Phiên bản kế tiếp

V16.3.0 — PWA Reliability: củng cố quy trình cập nhật giữ nháp, kiểm tra asset và offline recovery; xác minh cài/cập nhật/nền trên thiết bị thật. Chưa triển khai. Gửi ZIP16.2 mới nhất khi chọn xây dựng tiếp.
