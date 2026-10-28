# V17.9.0 — Build & Lazy Loading

## Phạm vi đã triển khai

- Gỡ hai thẻ Chẩn đoán tốc độ và Chẩn đoán hiển thị khỏi Cloud Sync. Gỡ API xuất chẩn đoán hiển thị; giữ nguyên bộ đo viewport phục vụ fullscreen của V17.8.2.
- Thêm build production vào `dist/`. Gộp 58 script nội bộ thành 2 bundle khởi động: viewport/boot ở head và phần ứng dụng ở cuối HTML. Script Supabase bên ngoài vẫn giữ riêng.
- Gộp 10 stylesheet theo đúng thứ tự cascade. Không loại rule hay đổi selector; giữ nền loading, dark/light mode, footer và fullscreen.
- Đưa service/UI sao lưu thành chunk riêng, chỉ thực thi khi vào trang Dữ liệu hoặc gọi thao tác sao lưu/khôi phục. Các lệnh đồng thời dùng chung một lần tải; lỗi mạng cho phép thử lại.
- Tên asset chứa hash nội dung. Worker tham chiếu đúng bundle, chunk sao lưu và module quy tắc thông báo được build riêng. Giữ cài cache trọn phiên bản, cập nhật có chủ động và bảo vệ form/giao dịch đang chờ.

## Build và chạy

Yêu cầu Node.js 24.x, npm và Python 3.10+. Đã kiểm tra với Node 24.22.1. Tại thư mục chứa package.json:

```bash
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Mở http://localhost:8080 để kiểm tra bản production. `npm start` vẫn phục vụ source chưa bundle cho phát triển. Không dùng kết quả source để khẳng định bản production đã được kiểm thử.

Build dùng bộ phân tích Acorn được nhúng trong Node 24; đây là phụ thuộc nội bộ Node. Nếu runtime không cung cấp parser, build dừng rõ lỗi, không xuất bản mã chưa xác minh. Ghim Node 24.x trong package.json; khi đổi major Node phải kiểm tra lại build.

Bộ thu gọn giữ nguyên token và newline cần cho ASI, bỏ comment/khoảng trắng dư, so sánh AST trước/sau và kiểm tra cú pháp. Không đổi tên hàm/biến. Script phải chạy từ thư mục source. `dist/` được tạo lại hoàn toàn khi build; không để bản ZIP hoặc tệp riêng trong thư mục đó.

## Vercel

`vercel.json` đặt Build Command `npm run build`, Output Directory `dist`. Framework Other; Root Directory là thư mục chứa package.json. Nếu project cũ có override Build/Output trên dashboard, đổi về các giá trị này. Dùng Node 24.x.

ZIP chứa source và công cụ build, không chứa node_modules/dist. Khi deploy từ Git, commit cả build_web.cjs, vercel.json, package.json và lockfile. Không upload nguyên thư mục source như một site không build rồi kỳ vọng có lazy loading. Hosting tĩnh khác cần chạy build trước và publish thư mục dist. Không đưa secret Supabase/VAPID private vào frontend.

## Số đo và giới hạn

`BUILD_RESULTS_V17.9.0.json` ghi byte nguồn và byte production trong cùng môi trường local. JavaScript khởi động giảm từ 1.258.783 xuống 1.091.922 byte, khoảng 13,3%; request script nội bộ giảm 58 → 2. Đây không phải số giây tải trên mạng hay iPhone thật. CSS chỉ gộp request, chưa giảm byte đáng kể.

Chỉ sao lưu/khôi phục được hoãn thực thi trong bản này. Care, kho sữa, sức khỏe, lịch và dashboard còn phụ thuộc globals/adapter nên vẫn nằm trong bundle chính. Không tuyên bố đã lazy toàn bộ module hoặc tách hết app.js.

Worker vẫn tải trước chunk sao lưu để dùng offline và xác nhận cài đủ phiên bản. Vì vậy lazy loading giảm parse/thực thi ban đầu, không loại toàn bộ lượt tải chunk trong lúc cài PWA. Thư viện Supabase CDN giữ cơ chế cũ; chưa bổ sung cam kết khởi động offline hoàn toàn khi thiếu dependency bên ngoài.

Không thay backend/schema, không migration mới, không cần redeploy Edge Functions. Chưa push/deploy hoặc kiểm chứng trực tiếp iPhone/Supabase production trong phiên này. Test bản build dùng jsdom, PGlite và môi trường worker giả lập với tệp dist thật.
