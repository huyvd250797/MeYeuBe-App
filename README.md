# Mẹ Yêu Bé V17.1.2 — Fullscreen Viewport Fix

Form chăm sóc đo visualViewport khi mở và khi resize/xoay/keyboard, dùng chiều cao pixel thực thay vì chỉ100dvh. Card stretch theo lớp phủ, không còn height100% cộng padding. Giữ safe area trong footer, UI kho cũ/swipe và nghiệp vụ nguyên trạng. **Không migration mới hoặc redeploy Edge.** Chưa xác minh iPhone thật trong môi trường xây dựng.

Nháp là dữ liệu trên thiết bị, chưa phải bản ghi Cloud. Chỉ báo Đã lưu khi database xác nhận. Nháp giữ nguyên ngày giờ đã nhập; khi tiếp tục hãy kiểm tra thời gian và nguồn sữa. Không ghi đè kết quả từ thiết bị khác. Giữ typed APIs, native IDs, milk ledger/OCC/Undo, health/growth/planning, media, backup/restore và server Notifications hiện có.

## Thông báo hiện có và cách tính giờ

| Nhắc việc | Thời điểm server xét gửi |
| --- | --- |
| Cữ bú | Giờ bắt đầu cữ bú mới nhất + đúng số phút “Nhắc sau” đã lưu. Không tự cộng thêm khoảng cách cữ bú trên Dashboard |
| Giấc ngủ | Giờ bắt đầu + số giờ đã cấu hình; chỉ khi chưa kết thúc |
| Thân nhiệt | Bản ghi mới nhất đạt ngưỡng cấu hình |
| Sữa sắp hết hạn | Hạn dùng native − số giờ báo trước; mỗi bình/túi có định danh riêng |
| Sữa quá hạn | Đến hạn dùng, còn sữa và chưa hủy |
| Lịch khám | Ngày/giờ hẹn − số giờ báo trước; bỏ lịch đã hủy/đã khám/hoàn thành |

Mặc định giờ Việt Nam UTC+7, không lấy múi giờ điện thoại hoặc server làm mặc định thay thế. Timestamp có Z/offset được đọc đúng instant; datetime local cũ được hiểu UTC+7. Backend và UI dùng cùng bộ quy tắc, đối chiếu byte trong kiểm thử. Mức `info` không tự chặn Push; loại nào được gửi còn phụ thuộc checkbox của từng thiết bị và bật/tắt quy tắc chung.

Server kiểm tra mỗi phút. Mốc gửi có thể chậm gần một phút cộng thời gian xử lý, mạng và hệ điều hành. Mỗi mốc chỉ có cửa sổ gửi 15 phút; quá cửa sổ sẽ bỏ qua thay vì dồn nhắc cũ sau sự cố. Mốc lịch hẹn báo trước 0 giờ có cửa sổ đúng phút hẹn. Dịch vụ Push chấp nhận yêu cầu chưa đồng nghĩa điện thoại đã hiển thị hoặc người dùng đã đọc. Focus/Không làm phiền và cài đặt iOS vẫn ảnh hưởng lúc hiển thị.

Nội dung mẫu dùng Unicode escape trong source ASCII nhưng lúc chạy là tiếng Việt có dấu. Payload được chuẩn hóa NFC, sửa UTF-8 bị đọc nhầm có thể khôi phục; chuỗi hỏng không khôi phục dùng câu tiếng Việt thay thế. Service Worker cũng xử lý để hỗ trợ payload cũ. Không ghi sửa tên/nội dung gốc trong database và không đổi ID. Thông báo đã có sẵn trong Notification Center không thể được sửa hồi tố; kiểm tra bằng một thông báo mới.

## Cài và chạy local

App tĩnh HTML/CSS/JS, không cần build frontend. Node.js 22.22.2+ dòng 22 hoặc 24.15.0+ dòng 24 hoặc 26+, npm, Python 3.10+. Test thực hiện bằng Node 24.22.1, PGlite 0.5.11, jsdom 30.1.3, fake-indexeddb 6.2.6; web-push giữ ghim 3.6.7.

1. Giải nén `MeYeuBe_v17.1.2.zip`, mở terminal trong thư mục có `index.html`.
2. `npm ci`
3. `npm start`, mở http://127.0.0.1:8080. Windows có thể dùng `py -m http.server 8080 --bind 127.0.0.1`.
4. `npm run check` kiểm tra cấu trúc/cú pháp; `npm test` chạy hồi quy, báo cáo trong `docs/TEST_RESULTS_V17.1.2.json`.
5. App → Cloud Sync: URL Supabase, anon/publishable key, Sync ID đúng gia đình. Không nhập service-role, VAPID private hoặc cron secret vào frontend.

Môi trường local không thể tự nhận Push nếu chưa cấu hình server. Bật PWA thật cần HTTPS. Trên iPhone, thêm app vào Màn hình chính, mở từ biểu tượng, rồi chủ động bấm Bật thông báo và cấp quyền. Mỗi thiết bị cần đăng ký riêng.

## Backend Notifications16.6: chỉ cài nếu chưa có

Sao lưu DB trước khi nâng cấp; giữ các file và request pending trên thiết bị. Nếu đã cài16.6 đầy đủ thì bỏ qua mục này. Từ DB16.5 mới bổ sung1660 →1661. Bản này nâng cấp DB hiện hữu, không dựng đầy đủ schema mới từ project trống. Thứ tự các migration nâng cấp: 1530 → 1540 → 1550 → 1560 → 1570 → 1590 → 1640 → 1650 → 1660 → 1661. Không reset DB và không chạy lại một migration cũ riêng lẻ sau bản mới.

1. Supabase → SQL Editor → New query.
2. Copy toàn bộ **`20261026_1660_notifications.txt`** → Run. TXT chứa lần lượt cả SQL 1660 và 1661, byte ASCII không BOM. Chạy TXT một lần tương đương chạy hai migration theo thứ tự; không cần chạy thêm lần nữa cả hai bản SQL.
3. Bước này tạo bảng/RPC và hàm cài lịch, nhưng **chưa bật lịch** khi chưa có URL và secret. Tiếp tục các bước Edge và kích hoạt bên dưới.

1660 tạo bảng private `myb_notification_runtime_v1660`, `myb_notification_checks_v1660`, `myb_notification_deliveries_v1660`, bật RLS, chặn truy cập trực tiếp anon/auth. Chỉ RPC trạng thái theo Sync ID được gọi từ app. Helper nguồn, claim/ACK và lease chỉ dành cho service_role. Giữ nguyên mô hình quyền Sync ID đã có; đây không phải hệ thống tài khoản mới. Không sửa bảng nghiệp vụ hoặc chính sách push_subscriptions cũ.

1661 cần Supabase có pg_cron, pg_net và Vault. Nếu tạo extension bị báo quyền/không khả dụng, bật các extension tương ứng trong Supabase Dashboard rồi chạy lại. Không thay bằng chạy interval từ thiết bị.

## Thiết lập Edge Functions và secret

Dùng Supabase CLI từ đúng thư mục giải nén để deploy cả thư mục `_shared`; không chỉ copy một entrypoint TypeScript vào function cũ.

```bash
npx supabase login
npx supabase functions deploy smart-alert-cron --project-ref PROJECT_REF --no-verify-jwt
npx supabase functions deploy send-push --project-ref PROJECT_REF --no-verify-jwt
```

Thay PROJECT_REF bằng project thật. V16.6 không sửa media-storage, không cần triển khai lại media-storage nếu V16.5 đã hoạt động. File `supabase/config.toml` chỉ tắt JWT verification cho các function được liệt kê; cron tự kiểm tra secret ở handler.

Supabase → Edge Functions → Secrets, đặt/giữ:

| Tên | Giá trị | Chỉ ở đâu |
| --- | --- | --- |
| SUPABASE_URL | URL project; có sẵn trong Edge runtime | Server |
| SUPABASE_SERVICE_ROLE_KEY | Service-role key của project; có sẵn trong Edge runtime | Server, tuyệt đối không frontend |
| VAPID_PUBLIC_KEY | Cặp VAPID hiện dùng | Server và ô public key trên app |
| VAPID_PRIVATE_KEY | Private key cùng cặp public | Server |
| VAPID_SUBJECT | `mailto:` email quản trị hợp lệ | Server |
| MYB_CRON_SECRET | Chuỗi ngẫu nhiên riêng 64 ký tự hex | Edge Secret và Vault cùng một giá trị |

Có thể tạo cron secret bằng `openssl rand -hex 32`. Không đổi cặp VAPID đang dùng nếu chưa cần; đổi cặp sẽ buộc các máy đăng ký lại. `.env.example` chỉ có tên biến mẫu; không đưa giá trị thật vào ZIP/Git hoặc chụp gửi lên nơi công khai.

Sau khi đặt MYB_CRON_SECRET và deploy function, chạy riêng trong SQL Editor:

```sql
select public.myb_notifications_configure_v1660(
  'https://PROJECT_REF.supabase.co',
  'PASTE_THE_SAME_MYB_CRON_SECRET_HERE'
);
```

Thay cả URL và secret bằng giá trị thật vừa đặt. Hàm này chỉ postgres gọi được, lưu bí mật trong Vault, cài một job tên `myb-notifications-v1660` với lịch `* * * * *`. Chạy lại cập nhật cùng job, không tạo lịch trùng. Job gọi Edge trực tiếp bằng header secret; không dùng anon/public key để bảo vệ cron. Secret không xuất hiện trong lệnh job nhưng pg_net sẽ giữ header trong hàng đợi trong lúc gửi; chỉ quản trị DB được thao tác phần này.

Kiểm tra và tắt các job nhắc việc cũ do Boss từng cài ngoài source nếu có. Không tắt/xóa job khác của project. Function cũ tên smart-alert-cron nay yêu cầu cron secret; request cũ thiếu header sẽ trả 401. `send-push` chỉ nhận gửi thử; client cũ gửi mode alert sẽ nhận 409 để tránh tái sinh vòng gửi theo app.

## Xác minh gửi tự động thật

```sql
select jobid,jobname,schedule,active from cron.job
where jobname='myb-notifications-v1660';
select jobid,status,start_time,end_time,return_message
from cron.job_run_details order by start_time desc limit 10;
select id,status_code,timed_out,created
from net._http_response order by created desc limit 10;
```

Job active chưa đủ: pg_net gọi HTTP bất đồng bộ, vì vậy cron báo thành công có thể chỉ nghĩa là đã xếp request. Phải thấy Edge HTTP 200, worker hoàn tất, và lượt kiểm tra gia đình cập nhật. Không chia sẻ nội dung hàng đợi/header secret. Nếu 401: kiểm tra MYB_CRON_SECRET có đúng cùng giá trị Vault và function đã deploy với verify_jwt=false. Nếu 500: xem Edge Logs, kiểm tra migration, service-role và VAPID; không copy secret vào log.

App → Cloud Sync → Thông báo thiết bị → **Kiểm tra lịch gửi tự động**. Màn hình phân biệt chưa cài lịch, chưa có heartbeat mới, lỗi worker và lượt kiểm tra gia đình. Bật ít nhất một thiết bị nhận; gia đình không có subscription bật sẽ không được quét. Tín hiệu kiểm tra cũ quá 3 phút hiện cảnh báo để quản trị xem lại tải/lịch.

Test bắt buộc trên gia đình test:

1. Mở bản hiện hành từ biểu tượng PWA, nhận bản cập nhật Service Worker khi không còn nháp/pending.
2. Bật Push từng máy, Lưu loại cảnh báo; bỏ chọn tất cả phải thật sự không nhận loại nào. Gửi thử để kiểm tra chữ: “Thông báo thử: tiếng Việt có dấu hiển thị chính xác.” Gửi thử giới hạn một lần mỗi thiết bị trong mỗi phút.
3. Dashboard → Smart Alert: chọn một mốc sắp tới vài phút, bật quy tắc và **Lưu cấu hình lên Cloud**. Chỉ gõ vào form chưa lưu sẽ chưa đổi lịch server.
4. **Đóng app trên tất cả thiết bị**, chờ đến mốc. Kiểm tra thông báo ở màn hình khóa/Notification Center, kiểm tra thêm lượt worker trong SQL/Edge Logs.
5. Trước mốc kế tiếp, ghi cữ bú mới/kết thúc ngủ/hủy lịch, lưu lên Cloud; xác nhận không còn gửi mốc đã mất hiệu lực. Kiểm tra qua nửa đêm và nhiều thiết bị.
6. Thử thiếu mạng/VAPID cấu hình sai trên project test; lần lỗi phải có dấu vết, không báo người dùng đã đọc. Trả cấu hình đúng và kiểm tra retry trong cửa sổ còn hạn.

Chưa có kết nối production hoặc iPhone thật ở phiên xây dựng này. Bộ test tự động thực thi handler server với Postgres fixture và transport giả, không có window/app; đây là bằng chứng logic, không thay thế test đóng app trên thiết bị thật.

## Chống trùng, retry và giới hạn vận hành

Khóa lease cho worker, khóa hàng theo subscription + event key cho từng lần gửi. Sự kiện đổi giờ/ngưỡng có key khác; không gộp các túi theo số lượng. Lỗi tạm thời/429/408 thử lại với backoff 1/2/4 phút, tối đa 4 lần tổng, chỉ trong cửa sổ còn hạn. 404/410 tắt subscription. Trước mỗi thiết bị, đọc lại dữ liệu/quy tắc, nên retry không sử dụng payload cũ đã hủy. Vẫn có khoảng đua rất nhỏ nếu bản ghi đổi sau lượt đọc và ngay trước request Push.

Mất ACK sau khi provider nhận có thể gây gửi lại sau lease; không thể bảo đảm exactly-once giữa Postgres và Push provider. Giữ tag ổn định và renotify=false để giảm thông báo lặp. Không tuyên bố “đã giao/đã đọc”. Khi provider lỗi sau gửi thử, lần gửi thử tiếp theo có thể cần chờ sang phút mới.

Mỗi worker có ngân sách khoảng 40 giây, tối đa 80 lần gửi thực, danh sách family theo cursor tối đa 100 và trang subscription 200. Cursor chỉ tiến khi xong family. Nếu nhiều family/thiết bị hoặc tải lớn khiến vòng quét quá 3 phút/cửa sổ 15 phút, cần worker queue/sharding ở phiên bản sau; không tuyên bố phục vụ không giới hạn. Bảng delivery/journal chưa tự purge lịch sử; cần theo dõi dung lượng trước khi thiết kế retention. Native inventory có thể nhiều bản ghi, nhưng không tải health/media hoặc whole-state export.

## GitHub và deploy frontend

Không có secret thật trong source. Bản GitHub ZIP đầu vào có một file backup JSON ở public root; đã giữ riêng ngoài source phát hành và không đóng gói/đưa lên public. Bản source sạch đã bỏ script/tài liệu/checksum lịch sử và mọi thư mục input-only; chi tiết trong docs/CARE_WORKFLOW_V17.0.0.md.

Repo mới: tạo repository riêng tư hoặc đúng mức hiển thị Boss muốn, rồi chạy trong thư mục source:

```bash
git init
git add .
git commit -m "MeYeuBe V17.0.0 Care Workflow"
git branch -M main
git remote add origin URL_REPO_CUA_BOSS
git push -u origin main
```

Repo đã có: clone/fetch repo trước, tạo nhánh nâng cấp, copy source vào working tree, xem diff và giữ các thay đổi mới trên remote. Nếu `fetch first`, fetch/rebase hoặc merge và giải quyết xung đột; không force push ghi đè lịch sử. Commit/push sau khi check/test qua.

Netlify hoặc Vercel → Import Git Repository → chọn repo/branch/thư mục có index.html. Framework Other, Build command để trống, Publish/Output là thư mục source (Netlify `.`). Không cấu hình secret backend trên hosting frontend; Edge Secrets ở Supabase. App tĩnh không cần callback Auth. Khi Git hosting liên kết xong, các lần push sau tự deploy; kiểm tra index, assets, build.json, PWA và Cloud sau deploy. Dùng hosting Boss đang dùng, không cần chuyển nhà cung cấp.

## Rollback và lỗi thường gặp

1660/1661 chỉ thêm bảng/hàm/hạ tầng nhắc. Không drop bảng nghiệp vụ hoặc restore JSON để quay lại. Tạm dừng lịch bằng:

```sql
select cron.unschedule('myb-notifications-v1660');
```

Giữ bảng delivery để không mất dấu chống trùng. Sửa secret/function rồi gọi configure lại để bật. Có thể trả frontend về ZIP trước khi cần, nhưng giữ server mới và kiểm tra tương thích; không tái triển khai vòng gửi cũ theo app. Ưu tiên sửa cấu hình khi lỗi 401/500 thay vì xóa đăng ký trên tất cả máy.

Nếu chữ ở thông báo cũ vẫn hỏng: cập nhật đúng function cùng `_shared`, cập nhật PWA/worker, gửi **thông báo mới**; DB không bị sửa nội dung để chữa hiển thị. Nếu iPhone không nhận: mở từ Màn hình chính, kiểm tra quyền thông báo/Focus/Internet/subscription/VAPID, rồi kiểm tra heartbeat server. “Đã kết nối Cloud” không đồng nghĩa cron đã hoạt động.

Gửi ZIP mới nhất cùng lỗi/luồng tái hiện khi xây dựng tiếp. Không gửi service-role hoặc secret. Phiên bản tiếp theo: **V17.2.0 — Health Planning**: kết nối lịch/hồ sơ/file; chưa xây dựng.

## Quy tắc đóng gói source sạch

Từ bản này và các lần build tiếp: chỉ giữ runtime được nạp, module/API/Edge còn dùng, migration thật, test/fixture và tài liệu hiện hành. Không giữ script đánh số, bản trích app, backup dữ liệu, báo cáo/checksum từng bản cũ hoặc README trùng. Hai preflight1580/1600 chỉ là fixture kiểm thử, không phải migration cần chạy.

`python3 build_release.py` kiểm tra và tạo ZIP trong `dist/`; `dist/` không được đóng vào ZIP hoặc commit. Chạy `npm test` trước khi phát hành. Script chặn file lạ trong root, private backup/input-only, tên đụng nhau không phân biệt hoa/thường, thiếu asset và module runtime không được tham chiếu. Khi thêm module hoặc tài liệu mới, cập nhật danh sách đóng gói có chủ đích.

Source17.0 tiếp tục cơ chế đóng gói sạch; Edge/migration giữ nguyên so với16.7. Không có migration mới; nếu Boss đã cài1660/1661 thì không chạy lại vì lần làm sạch này. Chưa trực tiếp upload/push qua Zipverra; ZIP đã được kiểm tra cục bộ.
