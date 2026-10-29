# Mẹ Yêu Bé V17.13.1 — Dashboard Quick Diaper Fix

Bản nền: MeYeuBe_v17.13.0.zip Boss gửi. Không cần migration SQL hoặc redeploy Edge. Giữ sửa UI/Cloud giấy tờ và Database-first Realtime của V17.12.1.

- Nhấn giữ **ô Đi tè (💧)** trên dashboard khoảng 0,5 giây: lưu ngay **1 tã ướt** tại giờ hiện tại. Giữ **ô Đi phân (💩)**: lưu ngay **1 tã bẩn**. Không mở form; chỉ cập nhật sau xác nhận database, có Hoàn tác.
- Một lượt giữ chỉ ghi đúng 1 tã, giữ tiếp không lặp. Thả rồi giữ lại để ghi thêm, không giới hạn tổng ngày ở 3. Chạm ngắn vẫn mở chi tiết. Cuộn, hủy cử chỉ hoặc rời app trước ngưỡng không ghi.
- **Bỏ nhấn giữ trong form thêm tã**. Chọn loại tã không tự tăng lượng; nút ＋/− chỉ bấm thường, giữ giới hạn form hiện hành.
- Ghi nhanh chỉ áp dụng khi dashboard đang xem **Hôm nay**. Đang lưu/chưa xác nhận kết quả thì chặn ghi tiếp, dùng nút Kiểm tra kết quả lưu hiện có để phục hồi đúng mã thao tác.
- Giữ quy tắc dữ liệu cũ: tã ướt cộng 1 tã và 1 đi tè; tã bẩn cộng 1 tã, 1 đi tè và 1 đi phân.
- Chạm trạng thái bé đang bú mở full care editor, giữ startedAt của timer, không tự ghi event. Dừng đổi đỏ. Các thao tác ghi, kho sữa và Undo giữ writer hiện có.
- Refresh sau khi đã sẵn sàng không reset ready hoặc gọi splash. Lỗi refresh giữ dữ liệu đang xem; thay kết nối/gia đình vẫn khóa màn chờ đúng dữ liệu mới. Cold startup chỉ mở dashboard sau đủ dữ liệu cần cho dashboard và render.
- Bỏ delay cố định40ms khởi động bằng DOMContentLoaded, bỏ delay tối thiểu550ms của pull refresh. Không cắt lịch sử chăm sóc/kho để giả nhanh; lịch sử phụ giữ tải theo nhu cầu. Chưa cam kết số giây mạng thật.
- Dashboard gap24 →12px. Khoảng trống cuối bị cộng padding chừa nav ở body, wrap và babyDashCommand; nay chỉ chừa một lần ở wrap, scope home đang hiển thị. Giữ safe area và fullscreen.
- Icon ! gw7Warn và infoIcon tròn22px, không bị rule button kéo dài. Nút không có type được đặt button, tránh submit browser ngoài ý muốn; không vô hiệu hóa cập nhật phiên bản chủ động.
- Health timeline nhóm ngày, giữ hai lần đo thật cùng ngày, lọc loại, thao tác theo native ID và member; giữ swipe và có menu thao tác. Growth history giữ từng lần đo, graph giữ tổng hợp theo ngày và nói rõ. WHO không lấy bản chiếu của người khác.

Chi tiết: [Polish](docs/POLISH_V17.13.1.md), [Validation](docs/VALIDATION_REPORT_V17.13.1.md). Chưa deploy/kiểm chứng native iPhone.

## Cài, kiểm thử và build

Cần Node.js **24.x**, npm và Python 3.10+. Mở terminal trong thư mục có package.json:

```bash
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Mở http://localhost:8080 để xem bản production. `npm start` phục vụ source cho phát triển. `npm run check` kiểm tra cấu trúc và cú pháp. Test report lưu trong docs/TEST_RESULTS_V17.13.1.json.

Cloud Sync dùng URL Supabase, anon/publishable key và Sync ID đúng gia đình như bản cũ. Không nhập service-role/VAPID private/cron secret vào frontend. Không xóa storage/PWA khi còn giao dịch chờ.

## Deploy Vercel

Có sẵn **vercel.json**: Build Command `npm run build`, Output Directory `dist`; Framework Other, Node 24.x. Root Directory là thư mục chứa package.json. Project cũ có override Build/Output thì đổi về các giá trị trên. Commit đầy đủ build_web.cjs, vercel.json, package.json, package-lock.json và source.

Hosting khác: build rồi publish **dist**, không publish source chưa build. ZIP sạch không chứa dist/node_modules vì sẽ tạo lại khi build. Khi cập nhật PWA, đợi dashboard và dùng nút cập nhật khi form/giao dịch đã kết thúc. Không tự deploy hoặc push trong phiên xây dựng này.

## Đóng gói và kiểm chứng

```bash
python3 build_release.py --output /tmp/MeYeuBe_v17.13.1.zip
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


