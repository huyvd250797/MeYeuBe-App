# Mẹ Yêu Bé V15.4.0 — Care & Milk Data Access

PWA chăm sóc bé, kho sữa, sức khỏe, thai kỳ, lịch hẹn, nhật ký/cột mốc và thống kê. Nâng trên source Minimal V15.3.0 Boss cung cấp; giữ cấu trúc tĩnh và không thêm đăng nhập.

V15.4 chuyển ghi nhận chăm sóc, hút/bú/chuyển/hủy sữa, timer bú và Undo sang transaction database theo từng ghi nhận. Sửa/xóa kiểm tra xung đột; retry dùng mã thao tác để không trừ sữa hai lần; giữ liên kết lần hút–kho. Các danh mục giữ lớp V15.3. Các module khác giữ luồng hiện hữu.

**Chạy migration trước khi phát hành source mới.** Gói nâng cấp database đã có, không phải bộ dựng Supabase từ đầu. Không reset bảng hoặc chạy recovery SQL.

## Cài và chạy local

Yêu cầu Node.js 22.22.2+ dòng 22, hoặc 24.15.0+ dòng 24, hoặc 26+; npm và Python 3.10+. Đã chạy kiểm thử bằng Node 24.22.1. npm dependencies chỉ phục vụ kiểm thử.

1. Giải nén, mở terminal trong thư mục `MeYeuBe_v15.4.0` chứa index.html.
2. Chạy `npm ci` để cài đúng dependency lockfile.
3. Chạy `npm start`, mở http://127.0.0.1:8080. Trên Windows nếu cần: `py -m http.server 8080 --bind 127.0.0.1`.
4. Trong Cloud Sync nhập Supabase URL, publishable/anon key và Sync ID đang dùng, bật kết nối rồi chờ sẵn sàng. Không nhập service-role key vào UI.
5. Thử thêm/sửa/xóa trên gia đình thử nghiệm; đối chiếu database và thiết bị thứ hai. Ngoài localhost, PWA/push cần HTTPS.

## Nâng cấp database

Dựa trên schema PostgreSQL 17.6 Boss cung cấp, hai RPC nền V15.0.76 và schema đang dùng. Không cần `.env`, Auth callback hay Storage mới cho tính năng này.

1. Backup database và bảo toàn nháp/queue trên mọi thiết bị. Hoàn tất dữ liệu chờ bằng bản cũ, đóng các tab cũ.
2. Trên bản sao/test có schema giống DB đích, chạy SQL Editor theo thứ tự:

| Thứ tự | File | Tác động |
| --- | --- | --- |
| 1 | `supabase/migrations/20261025_1530_catalog_api.sql` | API danh mục; nếu đã cài không cần chạy lại |
| 2 | `supabase/migrations/20261025_1540_care_milk_api.sql` | API care/milk, operation table, index ledger, shell đọc, khóa chung catalog và thứ tự khóa metadata của apply cũ |

3. Không chạy lại migration 1530 sau 1540: nó sẽ ghi đè phần khóa catalog đã bổ sung. Nếu cần cài lại 1530, phải chạy lại 1540 ngay sau đó.
4. Script 1540 là một transaction, không drop/reset business table, chạy lại được. Nếu báo definition/anchor không khớp, dừng và đối chiếu SQL thực tế; không bỏ kiểm tra để ép chạy.
5. Kiểm tra đọc, thay Sync ID bằng gia đình test:

```sql
select public.myb_care_list_v1540('SYNC_ID_TEST', '{"kind":"care","limit":20}'::jsonb);
select public.myb_care_list_v1540('SYNC_ID_TEST', '{"kind":"milk","available":true,"limit":20}'::jsonb);
select public.myb_app_shell_v1540('SYNC_ID_TEST');
```

6. Trên test, thử feed nhiều nguồn, sửa stored → direct, sửa lượng hút, chuyển một phần/chuyển tiếp, hủy, xóa và Undo. Đối chiếu remaining_ml với view ledger; thử mất phản hồi sau commit và hai thiết bị sửa cùng ghi nhận.
7. Sau khi xác minh quyền/schema trên test, backup DB đích rồi áp dụng cùng migration và source mới. Nâng mọi thiết bị/PWA; không tiếp tục ghi kho bằng bản cũ.

RPC mới giữ mô hình truy cập Sync ID hiện hữu, dùng SECURITY DEFINER; bảng operations bật RLS và không mở truy cập trực tiếp cho client. Không bổ sung phân quyền tài khoản. Xem `docs/DATA_ACCESS_V15.4.0.md` cho invariant, quyền và giới hạn tương thích.

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

`npm test` chạy toàn bộ và thất bại nếu bất kỳ suite/assertion nào lỗi. V15.4 không còn danh sách miễn trừ 8 lỗi cũ; `npm run test:regression` cũng chạy gate đầy đủ. Có thể chạy riêng `node tests/care-sql.cjs` hoặc `node tests/care-runtime.cjs`.

PGlite thực thi migration với fixture quan hệ/constraint/trigger/view theo schema cung cấp; jsdom chạy form thật nối tới DB fixture. Đây không phải kiểm chứng Supabase production, đa session PostgreSQL thực hay thiết bị vật lý. Báo cáo ở `docs/TEST_RESULTS_V15.4.0.json` và `docs/VALIDATION_REPORT_V15.4.0.md`. App tĩnh không cần transpile/build.

## Lỗi và phục hồi

- Thiếu API/migration: giữ nguyên form, cài SQL đúng project/thứ tự; không fallback ghi snapshot.
- Care/milk timeout: giữ form và bấm Lưu lại để kiểm tra mã thao tác cũ. Sau reload dùng “Kiểm tra kết quả lưu”. Không xóa dữ liệu trình duyệt trong lúc kết quả chưa rõ.
- Nếu thao tác trước đã lưu nhưng form đã đổi: app tải ACK, yêu cầu kiểm tra/mở lại trước khi gửi nội dung mới. Không gộp hai ý định thành một lệnh.
- Xung đột: tải lại dữ liệu và mở lại form. Undo bị từ chối nếu nguồn sữa/event đã thay đổi tiếp.
- Danh mục đang dùng: chuyển Tạm ẩn thay vì xóa. Bình/túi đã dùng không đổi loại.
- Generic import/Undo snapshot thay đổi care, kho hoặc danh mục sẽ bị chặn. Dùng thao tác theo ghi nhận; không dùng backup cũ để ghi chồng kho.
- Lệch mapping/trùng mã/thiếu liên kết: giữ dữ liệu và đối chiếu riêng; không tự dedupe/rebuild. Recovery xuất trong Cloud Sync chứa nháp/queue/command chờ, không phải file Nhập DB thông thường.
- Bootstrap/realtime vẫn tải hết lịch sử care/milk bằng các trang để dashboard cũ đủ dữ liệu. Lazy loading/aggregate/scoped realtime tiếp tục ở roadmap, chưa hoàn thành trong V15.4.

## Push GitHub

Chưa push/deploy trong lần bàn giao này. Với repository mới trống, tại thư mục source:

```sh
git init
git add .
git commit -m "Release MeYeuBe v15.4.0 Care Milk Data Access"
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
5. Sau deploy HTTPS kiểm tra build.json = 15.4.0, runtime/PWA nạp đúng module, thêm ghi nhận test, đối chiếu DB và thiết bị thứ hai; kiểm tra mất mạng, update và push hiện hữu. Bản sau phát hành qua push branch đã kết nối.

## Rollback

Đối chiếu/hoàn tất mọi request và command chờ trước. Có thể quay source về V15.3 để xử lý sự cố, nhưng không dùng các luồng ghi kho cũ cho tới khi đánh giá dữ liệu do API mới tạo (đặc biệt transfer và Undo). Không tự drop bảng operations hoặc restore database chỉ để quay frontend. Giữ API/migration additive và backup; phục hồi business rows chỉ theo phương án đã đối chiếu. Bản mới không có script rollback phá hủy dữ liệu tự động.

## Phiên bản kế tiếp

V15.5.0 — Health & Growth Data Access: hồ sơ thành viên, số đo, vaccine, khám và thai kỳ theo ID/người/thời gian, giữ liên kết và kiểm tra xung đột. Gửi ZIP V15.4.0 mới nhất và yêu cầu “Xây dựng phiên bản tiếp theo” để tiếp tục theo ROADMAP.md.
