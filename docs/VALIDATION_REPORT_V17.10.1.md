# V17.10.1 — Dependency Lock Fix

## Nguyên nhân và sửa

Lockfile đã bị thay range dependency khi cập nhật số phiên bản app. Hai vị trí whatwg-url trong jsdom và data-urls bị biến thành ^17.10.0; package ghim vẫn là 17.3.0 nên npm install không thỏa yêu cầu. Sửa theo metadata npm view của đúng jsdom@30.1.3 (^17.2.0) và data-urls@8.0.0 (^17.1.2). Không đổi thư viện trực tiếp hoặc phiên bản transitive đã khóa. Chỉ thay hai dependency entries và metadata phiên bản app trong lockfile.

## Cài đặt và build thực tế

- npm install với node_modules chưa tồn tại và npm cache riêng mới: thêm 38 package, exit 0, hết ETARGET.
- npm ci trên lockfile đã sửa: thêm 38 package, exit 0.
- Node 24.22.1, npm 11.9.0; npm run build thành công, xuất dist.
- dependency-lock.cjs so sánh đủ 38 package đã cài: version, dependencies, optionalDependencies, peerDependencies khớp lockfile. Đây là guard mới cho lỗi version substitution khi dùng dependencies cài sẵn.
- Root test phiên bản UI đọc build.json, không giữ phiên bản cũ viết cứng.
- 59/59 bước hồi quy đạt trên dependencies vừa cài sạch; kết quả chi tiết trong TEST_RESULTS_V17.10.1.json.
- 17 tệp backend nguyên byte so với ZIP V17.10.0. Không migration mới, không sửa business/UI ngoài nhãn phiên bản.

Chưa deploy Vercel hoặc kết nối database production. Thành công cài/build local không thay cho xác nhận deployment từ tài khoản Boss. Vercel tiếp tục Node 24.x, npm run build, Output Directory dist; không cần đổi dependency hoặc thêm overrides trên hosting.
