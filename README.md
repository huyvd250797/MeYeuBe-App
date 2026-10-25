# Mẹ Yêu Bé V15.2.0 — Foundation & Data Safety

PWA theo dõi chăm sóc bé, kho sữa, hồ sơ sức khỏe, thai kỳ, lịch hẹn, nhật ký, cột mốc và thống kê. Nền nâng cấp là ZIP V15.1.0(2) Boss cung cấp; giao diện và nghiệp vụ hiện có được giữ, lớp bảo vệ dữ liệu được chỉnh trong relational-v1577.js (giữ tên file để tương thích).

## Cài và chạy local

Yêu cầu Node.js 22.22.2+ thuộc dòng 22, hoặc 24.15.0+ thuộc dòng 24, hoặc 26+ (đã kiểm tra bằng Node 24.22.1), npm và Python 3.10+. App là web tĩnh JavaScript thuần; dependency npm chỉ phục vụ kiểm thử, chưa chuyển framework.

1. Giải nén và mở terminal trong thư mục `MeYeuBe_v15.2.0` chứa index.html.
2. Chạy `npm ci` để cài đúng dependency trong lockfile.
3. Chạy `npm start`, mở http://127.0.0.1:8080. PWA/push ngoài localhost cần HTTPS. Lệnh dùng Python nên Python phải ở PATH; trên Windows có thể dùng `py -m http.server 8080 --bind 127.0.0.1`.
4. Trong Cloud Sync nhập URL, publishable key và Sync ID của database đang dùng. Key frontend phải là publishable/anon; không nhập service-role/private key.
5. Bật kết nối, chờ database sẵn sàng rồi thao tác. Xem trạng thái lưu ở Cloud Sync. Chưa kết nối không được coi là database đã lưu dữ liệu.

## Đổi mới ở V15.2.0

- Ghi bền vững thay đổi vào outbox có đích `project URL + Sync ID` trước khi đổi dữ liệu trong bộ nhớ và trả về luồng UI thành công. Đây là bảo vệ chuyển tiếp, không phải hệ thống merge JSON toàn app mới.
- Chặn lưu khi offline/chưa sẵn sàng/đang tải hoặc đổi cấu hình; giữ form, lưu bản nháp phục hồi trên thiết bị khi đủ dung lượng. Kết nối lại không tự upload bản nháp.
- Không đổi đích hoặc khóa kết nối khi còn thao tác chờ; không gửi queue chưa xác định đích hoặc thuộc gia đình khác.
- Flush lỗi thì giữ dữ liệu chờ, không dùng phản hồi server thay thế phần chưa gửi. Bỏ phản hồi từ cấu hình cũ, cache chỉ đọc khi khớp đích.
- Trạng thái phân biệt đang chờ và database đã xác nhận; thông báo liên quan dữ liệu phát sau lượt ghi thành công.
- Bổ sung cấu hình test, lockfile, release checker, kiểm thử full runtime và tài liệu hiện trạng.

## Database, SQL và file môi trường

Bản này dùng database hiện có và hai RPC hiện hành: `myb_relational_export_state_v1576` và `myb_relational_apply_changes_v1576`. Không yêu cầu migration hay reset database. ZIP đầu vào thiếu các SQL nền tảng định nghĩa hai RPC và một số bảng, do đó gói này **không phải bộ dựng mới Supabase từ đầu**. Không chạy các SQL recovery/hotfix lịch sử để nâng lên V15.2.0. Trước V15.3 phải lấy schema, RLS và định nghĩa RPC thực tế để kiểm tra.

Frontend chưa dùng `.env`: cấu hình ở Cloud Sync lưu trên thiết bị. Edge Functions hiện có dùng server secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`; cron có `SMART_ALERT_TZ_OFFSET_MIN`. Không đưa các secret này lên GitHub hoặc frontend. V15.2 không thay hay redeploy các function đó.

Không có quyền truy cập production trong lần nâng cấp này; chưa xác nhận RLS, transaction, tính idempotent của RPC hoặc kết quả trên database thật. V15.3 mới thực hiện Auth/Data Isolation theo phương thức đăng nhập được Boss chọn. Không mô tả publishable key + Sync ID là cơ chế phân quyền hoàn chỉnh.

## Kiểm tra

- `npm run check`: kiểm tra cấu trúc release và cú pháp JavaScript.
- `npm test`: chạy tất cả bài test; trả mã lỗi khi có bất kỳ kiểm tra thất bại, bao gồm 8 kiểm tra lịch sử đã thất bại trong V15.1.0.
- `npm run test:regression`: chạy cùng bộ test, chỉ cho phép đúng 8 lỗi baseline đã đối chiếu; lỗi mới hoặc tên/tập lỗi khác vẫn làm gate thất bại. Các lỗi baseline vẫn được ghi rõ là `KNOWN_BASELINE_FAILURE`, không được tính là pass.
- Kết quả chi tiết ở `docs/TEST_RESULTS_V15.2.0.json`; trạng thái và giới hạn ở `docs/DATA_SAFETY_V15.2.0.md`.

Bài test mới nạp boot.js + app.js + relational-v1577.js trong jsdom, dùng IndexedDB giả và RPC mock, không kết nối production. Test legacy tiếp tục kiểm tra engine/UI lịch sử. Không có build transpile ở bản web tĩnh này; check cú pháp không đồng nghĩa đã kiểm tra browser thật.

## Khi mất mạng hoặc lỗi lưu

Giữ nguyên form, chờ kết nối rồi bấm lưu lại. Các thao tác đã chấp nhận trên máy có trạng thái chờ sẽ được giữ trong outbox. Không bấm nhiều lần khi chưa rõ kết quả database. Khi cần đối chiếu, vào Cloud Sync → Xuất nháp và dữ liệu chờ. File recovery chứa dữ liệu riêng tư, nên lưu ở nơi riêng. File này là bản chụp điều tra gồm draft/journal/legacyQueue, **không phải file import DB thông thường**; không đưa nó vào nút Nhập DB.

Queue từ bản cũ không có thông tin đích sẽ được giữ nguyên và chặn gửi. Không tự đoán Sync ID để gán lại hoặc xóa queue. Xuất recovery và đối chiếu thao tác với database trước khi chuyển lại thành thao tác đúng đích. Gói không cung cấp nút tự xóa hoặc tự gán đích cho queue cũ.

Cache/nháp/outbox ở trình duyệt có giới hạn dung lượng. Nếu không ghi được, app báo lỗi và giữ form. Không xóa dữ liệu trình duyệt/IndexedDB khi chưa xuất file local và dữ liệu chờ; một số tài liệu sức khỏe vẫn chỉ có byte file trong IndexedDB.

## Push GitHub

Với repo mới: tạo repo trống, tại thư mục source chạy:

```sh
git init
git add .
git commit -m "Release MeYeuBe v15.2.0 Foundation and Data Safety"
git branch -M main
git remote add origin <URL_REPO>
git push -u origin main
```

Với repo đã có source: clone/fetch repo hiện tại, tạo branch nâng cấp từ branch mới nhất, áp dụng source đã đối chiếu rồi commit/push. Tích hợp thay đổi mới từ remote và giải quyết conflict; không dùng force push để vượt `fetch first`. Giữ cấu hình và thay đổi ngoài phạm vi. ZIP không chứa node_modules hoặc backup dữ liệu cá nhân.

## Deploy Vercel/Netlify từ GitHub

Đây là hướng dẫn, chưa push/deploy trong lần bàn giao này.

- Import repo, chọn branch phát hành và root directory chứa index.html.
- Framework chọn Other/static; không cần lệnh build; output/publish directory là thư mục chứa index.html. Không deploy cả thư mục cha của gói ZIP.
- Không cài devDependencies để chạy production nếu hosting không cần; không công khai node_modules, recovery hoặc backup cá nhân.
- Cấu hình Cloud Sync trên thiết bị; các thiết bị phải cùng đích database và Sync ID. Không chỉnh secret server vào UI.
- Sau deploy HTTPS, kiểm tra build.json, mở app, chờ sẵn sàng, thử một bản ghi thử có thể xóa, đối chiếu database và mở trên thiết bị thứ hai. Kiểm tra PWA cài Home Screen, theme, mất mạng và cập nhật.

Không cần thêm Supabase Auth callback ở V15.2 vì chưa xây luồng đăng nhập mới. Khi nâng V15.3 sẽ cấu hình callback theo phương thức Auth thực tế.

## Nâng cấp và quay lại

Sao lưu dữ liệu database và các file local trước khi cập nhật; giữ ZIP cũ. Không reset schema hoặc xóa cache để ép cập nhật. Version 15.2.0 được cập nhật trong boot, service worker, app, manifest, HTML và build.json. Boot/SW hiện có vẫn thực hiện cập nhật app; chưa thiết kế lại vòng đời PWA (V16.5).

Trước khi rollback, kiểm tra outbox/draft của V15.2.0 và xuất bản phục hồi; client cũ không hiểu outbox mới. Chỉ quay lại sau khi đối chiếu dữ liệu chờ, tránh tưởng đã lưu khi queue còn trên thiết bị. Không dùng rollback SQL recovery để quay lại app.

## Tiếp theo

V15.3.0 — Authentication & Data Isolation: đăng nhập, quyền family, RLS, bảo vệ RPC/Edge Functions và ánh xạ gia đình hiện có. Cần chốt phương thức đăng nhập và có schema/RPC thực tế. Gửi ZIP V15.2.0 vừa bàn giao khi yêu cầu xây tiếp.


## Gói source tinh gọn
Gói chỉ giữ mã frontend đang nạp, icon/PWA, cấu hình kiểm thử, các test, source hai Edge Functions và SQL Realtime hiện hành, cùng tài liệu sử dụng/kiểm chứng. Script standalone không dùng, SQL recovery cũ, checklist và tài liệu lịch sử riêng lẻ đã được bỏ. Chi tiết tại docs/SOURCE_CLEANUP_V15.2.0.md. Không có thay đổi nghiệp vụ, không cần chạy SQL hoặc reset database để dùng gói này.
