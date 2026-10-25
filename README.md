# Mẹ Yêu Bé V15.7.0 — Scoped Queries & Settings

PWA chăm sóc bé, kho sữa, sức khỏe, thai kỳ, lịch hẹn, nhật ký/cột mốc và thống kê. Nâng cấp trực tiếp từ ZIP V15.6.0 `(1)` Boss gửi; không thêm đăng nhập.

V15.7 khởi động với shell nhẹ, tổng hợp số liệu theo ngày trên database, lịch tuần/tháng theo phạm vi. Các màn cần lịch sử đợi nạp đủ dữ liệu trước khi mở. Có nút Xem dashboard đầy đủ để giữ mọi block cũ. Chưa chuyển tất cả màn sang truy vấn phạm vi hoặc Scoped Realtime.

Cài đặt lưu theo nhóm profile/dashboard/other có OCC và chống ghi trùng; theme lưu riêng thiết bị. Giữ các API chăm sóc/kho sữa, sức khỏe, planning và danh mục đã có. Mapping, quyền và giới hạn: `docs/DATA_ACCESS_V15.7.0.md`.

**Chạy migration trước khi phát hành source mới.** Gói nâng cấp database đã có, không phải bộ dựng Supabase từ đầu. Không reset bảng hoặc chạy recovery SQL.

## Cài và chạy local

Yêu cầu Node.js 22.22.2+ dòng 22, hoặc 24.15.0+ dòng 24, hoặc 26+; npm và Python 3.10+. Đã chạy kiểm thử bằng Node 24.22.1. npm dependencies chỉ phục vụ kiểm thử.

1. Giải nén, mở terminal trong thư mục `MeYeuBe_v15.7.0` chứa index.html.
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

3. Không chạy lại migration 1530 sau 1540: nó sẽ ghi đè phần khóa catalog đã bổ sung. Nếu cần cài lại migration cũ, phải chạy lại toàn bộ các migration sau nó theo thứ tự 1530 → 1540 → 1550 → 1560 → 1570 để khôi phục các guard.
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

RPC mới giữ mô hình truy cập Sync ID hiện hữu, dùng SECURITY DEFINER; bảng operations bật RLS và không mở truy cập trực tiếp cho client. Không bổ sung phân quyền tài khoản. Xem `docs/DATA_ACCESS_V15.7.0.md` cho invariant, quyền và giới hạn tương thích.

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

`npm test` chạy toàn bộ và thất bại nếu bất kỳ suite/assertion nào lỗi. V15.4 không còn danh sách miễn trừ 8 lỗi cũ; `npm run test:regression` cũng chạy gate đầy đủ. Có thể chạy riêng `node tests/health-sql.cjs` hoặc `node tests/health-runtime.cjs`. Các bộ care/milk/catalog vẫn chạy đầy đủ.

PGlite thực thi migration với fixture quan hệ/constraint/trigger/view theo schema cung cấp; jsdom chạy form thật nối tới DB fixture. Đây không phải kiểm chứng Supabase production, đa session PostgreSQL thực hay thiết bị vật lý. Báo cáo ở `docs/TEST_RESULTS_V15.7.0.json` và `docs/VALIDATION_REPORT_V15.7.0.md`. App tĩnh không cần transpile/build.

## Lỗi và phục hồi

- Thiếu API/migration: giữ nguyên form, cài SQL đúng project/thứ tự; không fallback ghi snapshot.
- Care/milk/health timeout: giữ form và bấm Lưu lại để kiểm tra mã thao tác cũ. Sau reload dùng “Kiểm tra kết quả lưu”. Không xóa dữ liệu trình duyệt trong lúc kết quả chưa rõ.
- Nếu thao tác trước đã lưu nhưng form đã đổi: app tải ACK, yêu cầu kiểm tra/mở lại trước khi gửi nội dung mới. Không gộp hai ý định thành một lệnh.
- Xung đột: tải lại dữ liệu và mở lại form. Undo bị từ chối nếu nguồn sữa/event đã thay đổi tiếp.
- Danh mục đang dùng: chuyển Tạm ẩn thay vì xóa. Bình/túi đã dùng không đổi loại.
- File đính kèm giữ byte ở IndexedDB trên thiết bị như bản trước; chỉ metadata được gửi DB. Xóa metadata không xóa byte cũ để hỗ trợ Undo. Chưa upload file gốc lên Storage hoặc tự dọn byte không còn tham chiếu.
- Generic import/Undo snapshot thay đổi sức khỏe, thai kỳ, care, kho hoặc danh mục sẽ bị chặn. Dùng thao tác theo ghi nhận; không dùng backup cũ để ghi chồng kho.
- Lệch mapping/trùng mã/thiếu liên kết: giữ dữ liệu và đối chiếu riêng; không tự dedupe/rebuild. Recovery xuất trong Cloud Sync chứa nháp/queue/command chờ, không phải file Nhập DB thông thường.
- Bootstrap/realtime vẫn tải hết lịch sử health/pregnancy/care/milk bằng các trang để dashboard cũ đủ dữ liệu. Lazy loading/aggregate/scoped realtime tiếp tục ở roadmap, chưa hoàn thành trong V15.5.

## Push GitHub

Chưa push/deploy trong lần bàn giao này. Với repository mới trống, tại thư mục source:

```sh
git init
git add .
git commit -m "Release MeYeuBe v15.7.0 Health Growth Data Access"
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
5. Sau deploy HTTPS kiểm tra build.json = 15.7.0, runtime/PWA nạp đúng module, thêm ghi nhận test, đối chiếu DB và thiết bị thứ hai; kiểm tra mất mạng, update và push hiện hữu. Bản sau phát hành qua push branch đã kết nối.

## Rollback

Đối chiếu/hoàn tất mọi request và command chờ trước. Có thể quay frontend V15.4 để điều tra, nhưng writer sức khỏe cũ đã bị chặn có chủ đích; không gỡ guard để ghi lại toàn hồ sơ nếu chưa đối chiếu dữ liệu. Không dùng luồng ghi kho cũ cho dữ liệu do API mới tạo. Không tự drop bảng operations hoặc restore database chỉ để quay frontend. Giữ API/migration additive và backup; phục hồi business rows chỉ theo phương án đã đối chiếu. Bản mới không có script rollback phá hủy dữ liệu tự động.

## Kiểm thử và giới hạn

Chạy `npm test` và `python3 release_check.py`. Báo cáo hiện tại: `docs/TEST_RESULTS_V15.7.0.json`, `docs/VALIDATION_REPORT_V15.7.0.md`. Không truy cập Supabase production/thiết bị thật trong lần xây dựng này. Chưa push/deploy.

## Nâng cấp V15.7

Đã cài1560 thì chỉ chạy thêm1570. Hoàn tất pending và backup trước; cập nhật mọi thiết bị sau migration. Không reset business rows. Không chỉ hạ frontend về bản cũ để tiếp tục ghi, vì writer legacy đã khóa; ưu tiên sửa tiến hoặc phục hồi DB backup cùng source tương ứng.

## Phiên bản kế tiếp

V15.8.0 — Legacy Removal: gỡ các đường snapshot/queue/wrapper đã có API thay thế, giữ dữ liệu và luồng phục hồi cần thiết. Gửi ZIP mới nhất để tiếp tục.
