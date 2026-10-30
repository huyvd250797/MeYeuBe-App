# Mẹ Yêu Bé V17.18.0 — Baby Memory Cards

Nâng cấp từ ZIP V17.17.1 Boss cung cấp. Xem `docs/MEMORIES_V17.18.0.md` để cài Google Drive và backend mới. Chưa kết nối Google thật, chưa deploy production.

## Thay đổi
- Thêm → Kỷ niệm của bé: tạo/sửa/xóa, ảnh, ngày, tên/ngày sinh bé, lời nhắn, dòng thời gian, lọc tên bé.
- Một Drive của quản trị viên, cấu hình bằng biến môi trường backend. Các thiết bị không đăng nhập Google.
- Ảnh JPEG đã nén tối đa 1920px và 5 MiB; đầu vào JPEG/PNG/WebP tối đa 15 MiB. HEIC/video chưa hỗ trợ.
- Đặt `anyone/reader`, không cho phép tìm kiếm chủ động. Ba mẫu thẻ JPEG, tải xuống/chia sẻ nếu trình duyệt hỗ trợ.
- Module mới dùng chung theo Supabase project, không kiểm tra family_id/Sync ID, không có tài khoản hay vai trò gia đình. Ai truy cập endpoint đều có thể đọc/sửa/xóa kỷ niệm chung; giới hạn origin không phải xác thực.
- Source nền không có màn hình đăng nhập hoặc cơ chế xác thực gia đình riêng để gỡ. Sync ID và family_id kỹ thuật của dữ liệu cũ được giữ nhằm tránh làm hỏng schema/đồng bộ cũ, không được dùng làm điều kiện truy cập module mới. Không reset/xóa dữ liệu cũ.
- Ảnh chỉ lưu Drive; không đưa Base64 vào database. Kỷ niệm dùng bảng riêng.
- Xóa/gỡ/thay ảnh giữ file cũ trên Drive. Không có xóa file Drive trong phiên bản này.

## Chạy và kiểm tra
Node 24.x, Python 3. Giải nén, mở terminal tại thư mục có package.json:
```sh
npm ci
npm start
# http://127.0.0.1:8080
npm test
npm run build
python3 build_release.py --output ../MeYeuBe_v17.18.0.zip
```
Build tĩnh nằm trong dist. Backend mới là Supabase Edge Function, không nằm trong dist; phải deploy riêng theo hướng dẫn. Token Google không nằm trong frontend/source ZIP.

## Bản kế tiếp dự kiến
V17.19.0 — Memory Albums: nhóm kỷ niệm thành album và lọc theo tháng/năm. Chưa xây dựng.

---
## Hướng dẫn nền và các migration cũ
Các bước bên dưới giữ cho tính năng cũ. Phần Drive/Kỷ niệm mới lấy hướng dẫn tại docs/MEMORIES_V17.18.0.md làm chuẩn.

# Mẹ Yêu Bé V17.18.0 — Packing Simple Lists

Nền: ZIP V17.17.0(1).zip Boss gửi. Vào Thêm → Chuẩn bị đồ: danh sách chuyến đi xuất hiện trước. Chọn chuyến để xem bảng đồ theo nhóm, cột Đã chuẩn bị ở bên phải. Một nút Thêm món đồ; chạm tên món để sửa/xóa trong form, chọn icon. Giữ dòng 450ms rồi kéo lên/xuống trong cùng nhóm; kéo tay nắm ⠿ để thao tác thuận tiện trên cảm ứng. Cuộn trước ngưỡng/hủy cử chỉ không lưu vị trí; lọc Tất cả để sắp xếp. Menu ⋯ chứa sửa, nhân bản, xóa chuyến.

Trạng thái theo ngày Việt Nam: đã hoàn thành nếu xác nhận kết thúc; chưa đi khi còn hơn 7 ngày; sắp tới nếu còn 1–7 ngày; đang diễn ra nếu ngày đi là hôm nay hoặc đã qua. Chỉ chuyến đang diễn ra có checkbox hoàn thành. Chưa có ngày thì hiển thị Chưa chọn ngày và không cho hoàn thành. Các bản archived cũ được hiểu là đã hoàn thành; không tự hoàn thành khi đã chuẩn bị hết đồ. Mở lại ở menu chuyến đã hoàn thành nếu cần sửa nhầm.

Dữ liệu/icon/vị trí/hoàn thành vẫn lưu Cloud qua settings/OCC hiện có. Không SQL mới, không thay tồn kho. Chưa realtime từng checkbox: mở lại/Tải lại ở màn chuyến đi để nhận dữ liệu máy khác. Giữ dữ liệu cũ, thêm icon mặc định khi món chưa có icon.

## Cài, kiểm thử và build

Cần Node.js **24.x**, npm và Python 3.10+. Mở terminal trong thư mục có package.json:

```bash
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Mở http://localhost:8080 để xem bản production. `npm start` phục vụ source cho phát triển. `npm run check` kiểm tra cấu trúc và cú pháp. Test report lưu trong docs/TEST_RESULTS_V17.18.0.json.

Cloud Sync dùng URL Supabase, anon/publishable key và Sync ID đúng gia đình như bản cũ. Không nhập service-role/VAPID private/cron secret vào frontend. Không xóa storage/PWA khi còn giao dịch chờ.

## Deploy Vercel

Có sẵn **vercel.json**: Build Command `npm run build`, Output Directory `dist`; Framework Other, Node 24.x. Root Directory là thư mục chứa package.json. Project cũ có override Build/Output thì đổi về các giá trị trên. Commit đầy đủ build_web.cjs, vercel.json, package.json, package-lock.json và source.

Hosting khác: build rồi publish **dist**, không publish source chưa build. ZIP sạch không chứa dist/node_modules vì sẽ tạo lại khi build. Khi cập nhật PWA, đợi dashboard và dùng nút cập nhật khi form/giao dịch đã kết thúc. Không tự deploy hoặc push trong phiên xây dựng này.

## Đóng gói và kiểm chứng

```bash
python3 build_release.py --output /tmp/MeYeuBe_v17.18.0.zip
```

Chạy sau npm test và npm run build. Script kiểm tra allowlist, thiếu module, file riêng/backup/secret, checksum và đọc lại toàn bộ ZIP. Không để ZIP trong dist vì lần build sau tạo lại dist. Giữ source, kiểm thử, migration đang dùng và tài liệu cần cho bảo trì; không đóng dependencies, tệp người dùng hay output tạm.

Chưa kiểm chứng trên iPhone thật hoặc database production. Tệp backend/migration được giữ nguyên byte so với ZIP đầu vào; các migration cũ kèm source chỉ để bảo trì, không cần chạy lại cho V17.10.0.

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

1. Mở bản hiện hành từ biểu tượng PWA, nhận bản cập nhật Service Worker khi đã đóng form và đối chiếu giao dịch pending.
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


