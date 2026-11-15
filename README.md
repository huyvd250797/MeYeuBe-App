# Mẹ Yêu Bé V17.21.3 — Shared Seasonal Settings

## Đồng bộ chủ đề trên mọi thiết bị

1. Bật **Cloud Sync** trên từng máy. Các máy dùng cùng **Supabase URL** và **Sync ID** sẽ đọc cùng một cấu hình.
2. Từ thiết bị có lịch mong muốn, mở **Thêm → Thiết lập → Giao diện theo mùa** rồi bấm **Lưu cấu hình** một lần. Nếu gia đình chưa có cấu hình chung, trang tự nạp cấu hình cũ trên máy đó vào bản nháp.
3. Các máy khác nhận lịch, trạng thái bật/tắt và hiệu ứng từ Cloud khi mở app hoặc qua đồng bộ đang chạy. Khi mất mạng, app dùng cấu hình đã tải gần nhất của kết nối hiện tại. Cần kết nối mạng để lưu thay đổi chung.
4. Chủ đề vẫn áp dụng theo lịch giờ Việt Nam. Sáng/tối và tùy chọn giảm chuyển động vẫn theo thiết bị.

## Nâng cấp từ V17.21.2

- Dùng Node.js 24 và Python 3. Chạy `npm ci`, `npm test`, `npm run build`; bản build nằm tại `dist`.
- Triển khai frontend với cấu hình hiện có. PWA nhận phiên bản mới qua luồng cập nhật sẵn có. Dùng lại API cài đặt V15.7 và realtime hiện tại. Không cần migration mới.
- Phiên bản dự kiến tiếp theo là **V17.22.0 — Memory Highlights**.

---

# Mẹ Yêu Bé V17.21.2 — Festive Cards

Bản này đưa họa tiết, viền và màu chủ đề vào **Trang chủ**, **bảng ghi nhận dấu +** và **form ghi nhận chăm sóc**. Họa tiết nằm ở mép thẻ. Biểu tượng chức năng, số liệu, vùng nhập và thao tác giữ vị trí cũ.

## Dùng giao diện theo chủ đề

1. Mở **Thêm → Thiết lập → Giao diện theo mùa**.
2. Bật **Tự đổi giao diện theo lịch** và bật chủ đề muốn sử dụng. Chọn khoảng ngày riêng nếu cần. Chủ đề áp dụng đồng thời lên các thẻ, lưới dấu + và form ghi nhận trong ngày tương ứng.
3. **Hiệu ứng động theo mùa** điều khiển tranh ở Trang chủ. Họa tiết card hiển thị tĩnh và dùng được khi app đã tải để sử dụng ngoại tuyến.
4. Mở dấu **+** rồi chọn **Bé bú** để xem màu chủ đề trên nhóm trường, nút Bắt đầu bú và nút Lưu. Thứ tự các ô thao tác được lưu theo thiết bị. Mỗi ô giữ họa tiết của chức năng khi đổi vị trí.

Tết dùng hoa mai và đèn lồng. Nghỉ mát dùng sóng và vỏ sò. 30/04 dùng dải lụa và ngôi sao vàng. Thiếu nhi dùng bóng bay và đồ chơi. Sinh nhật dùng nơ, nến và quà. Trung thu dùng đèn ông sao và ánh trăng. Khai giảng dùng đồ dùng học tập. Halloween dùng bí ngô và dơi. 20/11 dùng hoa và cánh hoa hồng. Giáng sinh dùng xanh dương, trắng tuyết và họa tiết mùa đông.

## Nâng cấp từ V17.21.1

1. Giải nén ZIP. Dùng Node.js 24 và Python 3, chạy `npm ci`, `npm test` và `npm run build` tại thư mục có `package.json`.
2. Kiểm tra bản build với `python3 -m http.server 8080 --directory dist`. Mở Trang chủ, dấu + và một form ghi nhận trong một ngày có chủ đề.
3. Nếu dùng GitHub cho triển khai hiện có, cập nhật nhánh triển khai bằng mã nguồn mới. Dùng `npm run build` và thư mục xuất `dist` trong Vercel hoặc Netlify. Dùng lại biến môi trường hiện có.
4. Sau khi website lên bản mới, mở PWA và chọn **Cập nhật ứng dụng** khi thông báo xuất hiện. Bản này chỉ thay frontend, không cần migration Supabase. Khi cần quay lại, triển khai lại ZIP V17.21.1.

Bản kế tiếp dự kiến là **V17.22.0 — Memory Highlights**, hỗ trợ đánh dấu yêu thích và lọc kỷ niệm nổi bật.

---

# Mẹ Yêu Bé V17.21.1 — Header Clock & Living Scenes

Đồng hồ giờ Việt Nam và ngày hiện tại nằm ở góc phải thanh đầu trang. Mở **☰ Menu** để xem chuỗi ghi chép, tìm kiếm hoặc đổi chế độ sáng/tối. Khu vực bên phải thẻ chào bé dành cho hình minh họa và các thao tác của thẻ.

V17.21.1 làm lại hình minh họa và cả hai hiệu ứng của mỗi chủ đề. Cờ gợn dọc theo vải từ mép cột, nến chuyển động ngay trên bánh, đèn ông sao lắc qua lại dưới ánh trăng và tuyết rơi quanh người tuyết. Một canvas ghép ảnh và chuyển động thành một cảnh. Tùy chọn **Tĩnh** giữ cảnh ở một khung hình. Lịch và tùy chọn đã lưu được dùng lại khi nâng cấp.

## Cài đặt giao diện theo mùa

1. Mở **Thêm → Thiết lập → Giao diện theo mùa**.
2. Chọn một trong 10 chủ đề, bật riêng chủ đề cần dùng và chọn **Tĩnh** hoặc một trong hai hiệu ứng của chủ đề. Dùng **Xem trước** để thử chế độ sáng hoặc tối. Bật **Phát thử hiệu ứng đã chọn** để xem chuyển động trước khi lưu.
3. Bật **Tự đổi giao diện theo lịch**. Để trống hai ô ngày để dùng lịch mặc định. Điền hai ngày để dùng khoảng dương lịch tùy chỉnh, tính cả ngày cuối. Bật lặp hằng năm để lấy ngày/tháng của hai mốc. Sinh nhật và Nghỉ mát chỉ tự áp dụng sau khi có lịch.
4. Bật **Hiệu ứng động theo mùa** nếu muốn sử dụng chuyển động trên Trang chủ, rồi bấm **Lưu cấu hình**. Cấu hình lưu trên thiết bị đang dùng.

| Chủ đề | Lịch mặc định | Hiệu ứng đã tích hợp |
| --- | --- | --- |
| Tết Nguyên đán | 23 tháng Chạp đến mùng 7 tháng Giêng âm lịch | Mai rơi, đèn lồng đung đưa |
| Nghỉ mát | Người dùng chọn ngày | Sóng vỗ, mây trôi |
| 30/04 | 30/04–01/05 | Cờ bay nhẹ, dải lụa đỏ |
| Quốc tế Thiếu nhi | 01/06 | Bóng bay lên, sao sáng nhẹ |
| Sinh nhật | Người dùng chọn ngày | Pháo giấy, nến lung linh |
| Tết Trung thu | 13–16 tháng 8 âm lịch | Đèn ông sao đung đưa, mây qua trăng |
| Khai giảng | 05/09 | Máy bay giấy, nét phấn hiện dần |
| Halloween | 31/10 | Bí ngô sáng dịu, dơi bay qua |
| 20/11 | 20/11 | Cánh hoa trôi, trái tim nét phấn |
| Giáng sinh | 24–25/12 | Tuyết rơi, bông tuyết lấp lánh |

App tính lịch theo giờ Việt Nam. Tết và Trung thu tính lại theo âm lịch hằng năm. Nếu trùng lịch, ưu tiên Sinh nhật, Nghỉ mát, rồi chủ đề ngày lễ theo thứ tự trong màn hình cấu hình. Hết lịch, app tự về giao diện thường. Chủ đề Giáng sinh dùng nền xanh dương, trắng tuyết và người tuyết.

Chuyển động mặc định tắt. Trình duyệt vẽ từng khung qua `requestAnimationFrame` để bám nhịp làm tươi màn hình. Các hiệu ứng động chạy liên tục, so le thời gian và chuyển vòng ở vị trí đã mờ hẳn hoặc cùng một tư thế. Trang chủ giữ pha chuyển động khi cập nhật dữ liệu. App tạm dừng khi thẻ chào bé ra khỏi vùng nhìn thấy, khi mở menu, form hoặc đưa app xuống nền. Cài đặt Giảm chuyển động của hệ điều hành và công tắc chuyển động toàn app được ưu tiên.

## Nâng cấp từ V17.21.0

- Giải nén và chạy `npm ci`, `npm test`, `npm run build` với Node.js 24 và Python 3. Kết quả build nằm ở `dist`.
- Chạy thử bằng `python3 -m http.server 8080 --directory dist`. Mở app rồi thử đổi chủ đề và lịch trong Thiết lập.
- Triển khai bản frontend mới qua quy trình hiện tại. Sau khi cập nhật lên website, mở PWA và chọn **Cập nhật ứng dụng** khi thấy thông báo. Bản này dùng cấu hình Supabase hiện có, không cần chạy migration mới.
- Nếu muốn quay lại, triển khai lại bản frontend từ ZIP V17.21.0. Cấu hình chủ đề nằm trong local storage của phiên bản mới.

Bản kế tiếp dự kiến là **V17.22.0 — Memory Highlights**, bổ sung yêu thích và lọc kỷ niệm nổi bật. Gửi ZIP mới nhất khi cần nâng cấp tiếp.

---

# Mẹ Yêu Bé V17.20.0 — Fast Start & Care UX

Nâng cấp từ source V17.19.0. Trang chủ, các chỉ số chăm sóc và kho sữa mở ngay khi đã nhận dữ liệu chăm sóc. Lịch hẹn, sổ sức khỏe và cột mốc tải nền. Màn phụ thuộc dữ liệu đang tải sẽ hiển thị trạng thái và tự mở khi sẵn sàng. Realtime tải thư viện riêng sau khi ứng dụng đã mở. Nhật ký lịch sử đầy đủ vẫn tải theo nhu cầu.

- **Bé bú từ kho** — nhập số ml bỏ trực tiếp hoặc bấm trừ/cộng theo bước 5 ml. Các nút gợi ý lấy tối đa 4 giá trị dương khác nhau từ các cữ đã lưu gần đây. Giá trị vượt số ml lấy từ kho không chọn được. Số ml bé bú thực tế cập nhật khi đổi số ml bỏ.
- **Lịch** — chọn Tuần/Tháng, chuyển kỳ trước/sau, về Hôm nay hoặc đến ngày cụ thể. Dấu chấm báo ngày có hẹn. Tên lịch hẹn dài xuống dòng ở danh sách bên dưới. Bấm lịch để sửa. Nút Thêm lịch lấy ngày đang chọn.
- **Dữ liệu** — dùng lại API chăm sóc, lịch và album hiện có. SQL và Edge Function từ V17.19.0 được giữ để hỗ trợ cấu hình hiện có hoặc cài mới.

## Chạy và nâng cấp từ V17.19.0

1. Giải nén, mở terminal tại thư mục có `package.json`. Dùng Node.js 24 và Python 3.
2. Chạy `npm ci`, `npm test`, `npm run build`. Có thể chạy `python3 -m http.server 8080 --directory dist` rồi mở http://127.0.0.1:8080 để thử bản build.
3. **Không cần chạy migration mới.** Dùng project Supabase và cấu hình Cloud đang hoạt động. Nếu cài mới, xem hướng dẫn gốc ở dưới. Các biến máy chủ mẫu nằm tại `.env.example`.
4. Với Vercel, chọn repo và nhánh triển khai hiện có, dùng Node 24, lệnh build `npm run build`, output `dist` như cấu hình kèm theo. Với Netlify kết nối GitHub, đặt cùng lệnh build và thư mục publish.
5. Nếu cập nhật repo hiện có, lấy mã mới nhất từ nhánh triển khai, tích hợp các file thay đổi, kiểm tra build rồi commit/push theo luồng hiện có.
6. Trên PWA, mở Trang chủ rồi bấm **Cập nhật ứng dụng** khi thông báo xuất hiện. Trong lúc kiểm tra, mở Lịch ở Tuần/Tháng và một form Bé bú từ kho. Nếu cần quay lại, triển khai lại mã frontend V17.19.0 từ commit hoặc ZIP trước.
7. Nếu splash còn hiện lâu, kiểm tra kết nối Cloud. Nếu chỉ phần lịch hoặc sổ sức khỏe tải lỗi sau khi đã vào app, bấm **Thử lại** tại Trang chủ.


---

# Mẹ Yêu Bé V17.19.0 — Memory Albums

Nâng cấp từ ZIP V17.18.2 Boss gửi. Album lưu metadata/liên kết trong Supabase, ảnh giữ nguyên trên Google Drive. Không thêm đăng nhập.

## Chức năng
- Tab Tất cả kỷ niệm / Album. Tạo, đổi tên, lời giới thiệu, xóa album.
- Chọn **thumbnail hiển thị riêng cho từng album** từ các kỷ niệm có ảnh trong album; có lựa chọn tự động. Đổi thumbnail không đổi/tải lại ảnh gốc.
- Chọn nhiều kỷ niệm đã lưu, tìm và phân trang thư viện; một kỷ niệm có thể ở nhiều album. Bỏ khỏi album không xóa ảnh.
- Tạo kỷ niệm ngay từ album sẽ chọn sẵn album đó trong mục Thêm vào album của form.
- Trong chi tiết kỷ niệm có nút Album để thêm/bỏ ở nhiều album cùng một lần lưu.
- Album có lưới ảnh/dòng thời gian, thứ tự mới nhất/cũ nhất/tùy chỉnh. Bấm Sắp xếp, giữ một thẻ và kéo; mỗi lần thả lưu Cloud. Bấm Xong để rời chế độ.
- Xóa album giữ toàn bộ kỷ niệm và ảnh. Xóa kỷ niệm vẫn xóa Drive và gỡ khỏi mọi album; xóa ảnh làm thumbnail fallback ảnh hợp lệ khác.
- Version chống ghi đè; command UUID và IndexedDB phục hồi lưu khi mất ACK. Phân trang album/thư viện không phụ thuộc giới hạn 500 của danh sách Tất cả cũ.

## Nâng cấp từ V17.18.2
1. Supabase → SQL Editor → New query. Mở `supabase/migrations/20261030_17190_memory_albums.sql`, copy toàn bộ rồi Run. Không reset database.
2. Supabase → Edge Functions → memory-drive → Code → index.ts. Thay toàn bộ bằng `supabase/functions/memory-drive/index.ts` trong ZIP, Deploy. Giữ Verify JWT OFF.
3. Giữ nguyên Google Client ID/Secret/Refresh token, Folder ID, origin và giới hạn thao tác đang có. Không cần cấu hình lại Google.
4. Deploy frontend V17.19.0: `npm ci`, `npm run build`, output `dist`. Mở lại PWA và nhận cập nhật.
5. Tạo album, chọn từ thư viện, Sửa / Thumbnail → chọn một ảnh → Lưu album. Mở thiết bị khác và tải lại để xác nhận.

Phải cập nhật SQL + Edge + frontend. Backend vẫn tương thích API kỷ niệm 17181 cho thao tác cũ, bổ sung albumVersion 17190. Nếu album báo chưa sẵn sàng, kiểm tra bước 1–2. Source chưa push/deploy trong lần bàn giao này.

Chi tiết giới hạn, retry, backup/rollback và kiểm tra: `docs/ALBUMS_V17.19.0.md`. Hướng dẫn Drive nền giữ để cài mới; không chạy lại migrations cũ nếu đang hoạt động.

## Chạy và kiểm tra
Node 24.x, Python 3. Giải nén, mở terminal tại thư mục có package.json:
```sh
npm ci
npm start
# http://127.0.0.1:8080
npm test
npm run build
python3 build_release.py --output ../MeYeuBe_v17.19.0.zip
```
Build tĩnh nằm trong dist. Backend mới là Supabase Edge Function, không nằm trong dist; phải deploy riêng theo hướng dẫn. Token Google không nằm trong frontend/source ZIP.


---
## Hướng dẫn nền và các migration cũ
Các bước bên dưới giữ cho tính năng cũ. Phần Drive/Kỷ niệm mới lấy hướng dẫn tại docs/MEMORIES_V17.19.0.md làm chuẩn.

# Mẹ Yêu Bé V17.19.0 — Packing Simple Lists

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

Mở http://localhost:8080 để xem bản production. `npm start` phục vụ source cho phát triển. `npm run check` kiểm tra cấu trúc và cú pháp. Test report lưu trong docs/TEST_RESULTS_V17.19.0.json.

Cloud Sync dùng URL Supabase, anon/publishable key và Sync ID đúng gia đình như bản cũ. Không nhập service-role/VAPID private/cron secret vào frontend. Không xóa storage/PWA khi còn giao dịch chờ.

## Deploy Vercel

Có sẵn **vercel.json**: Build Command `npm run build`, Output Directory `dist`; Framework Other, Node 24.x. Root Directory là thư mục chứa package.json. Project cũ có override Build/Output thì đổi về các giá trị trên. Commit đầy đủ build_web.cjs, vercel.json, package.json, package-lock.json và source.

Hosting khác: build rồi publish **dist**, không publish source chưa build. ZIP sạch không chứa dist/node_modules vì sẽ tạo lại khi build. Khi cập nhật PWA, đợi dashboard và dùng nút cập nhật khi form/giao dịch đã kết thúc. Không tự deploy hoặc push trong phiên xây dựng này.

## Đóng gói và kiểm chứng

```bash
python3 build_release.py --output /tmp/MeYeuBe_v17.19.0.zip
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


