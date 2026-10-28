# V17.11.0 — Health Profile Layout

- Presentation owner mới cho header, navigation, tổng quan và nhóm hồ sơ; giữ renderer biểu mẫu/tệp hiện hành.
- Chọn thành viên rõ trạng thái, nút ghi nhận cố định vị trí, nhóm lâm sàng cùng dropdown; kế hoạch theo native member ID.
- Giảm nhẹ typography sức khỏe, giữ input 16px và vùng chạm 44px.
- Kiểm tra layout tích hợp trên source và production bundle; cài sạch bằng npm ci và xác nhận lock metadata.
- Không đổi backend hoặc migration.

# V17.10.1 — Dependency Lock Fix

- Sửa whatwg-url range của jsdom và data-urls về metadata package công bố; giữ phiên bản package đã khóa.
- Cập nhật phiên bản app theo từng vị trí, không thay chuỗi trên dependency tree.
- Thêm kiểm tra lockfile so với manifest package thực đã cài; kiểm tra cài sạch và build trước bàn giao.
- Không sửa nghiệp vụ/UI, backend hoặc migration từ V17.10.0.

# V17.10.0 — Health UI Foundation

- Format chỉ số/profile/timeline/bản in, loại số lẻ 0 dư; giữ 3 số lẻ có nghĩa khi hiển thị kg/cm.
- Timeline bỏ bản chiếu health → baby và bản legacy trùng native ID; không xóa bản ghi hoặc gom theo ngày.
- Thêm health-foundation.css: thang chữ, icon, card, nút, khoảng cách dùng chung, scoped sức khỏe; viewport.css tiếp tục tải cuối.
- Normalize số chỉ trong input hiển thị của form đo/hồ sơ; giữ raw/OCC trước lưu.
- Bổ sung kiểm tra integration vào source và production runtime. Năm hàm trích xuất thay đổi có hash trước/sau và lý do trong audit.
- Không migration/backend mới. Chưa push/deploy hoặc kiểm tra trực tiếp iPhone.

# V17.9.0 — Build & Lazy Loading

- Thêm build production, hash assets và cấu hình Vercel xuất dist.
- Gộp script/CSS; hoãn thực thi service/UI backup, retry và chia sẻ lần tải.
- Worker build tham chiếu đúng dependency thông báo, cache cả lazy chunk.
- Gỡ hai thẻ chẩn đoán tốc độ/hiển thị khỏi Cloud Sync, giữ viewport recovery.
- Không đổi backend/migration; kiểm thử source và bundle production.

Ghi chú lịch sử bên dưới được giữ từ source V17.8.2. Công cụ chẩn đoán được nhắc trong lịch sử đã gỡ trong V17.9.0.

# V17.8.2 — PWA Viewport Recovery

Đổi quyền sở hữu hình học ở cấp gốc. viewport-core chạy trong head trước boot, phân biệt standalone từ navigator.standalone / display-mode. CSS browser100dvh (fallback100vh), standalone100vh. Probe CSS đo full layout height; loading và overlays dùng cùng geometry. Chỉ dùng visualViewport khi ô nhập đang focus và chênh lệch lớn gợi ý keyboard; không cộng bù chiều cao màn hình cố định. Pinch zoom không đổi layout. Root/body loading dùng cùng background, tránh dải màu nền khác; record pages không chừa thanh nav dashboard.

Chẩn đoán trên iPhone: mở Cloud Sync → Chẩn đoán hiển thị → Đo và sao chép. Nếu còn khoảng trống, gửi nội dung kết quả cùng ảnh. Chỉ lấy kích thước màn hình/viewport, rect và thuộc tính bố cục; không lấy key, dữ liệu bé hoặc gửi lên server. Biến mybViewportCore.report() chỉ đọc geometry.

Sau deploy kiểm tra V17.8.2 ở loading. Đóng/mở PWA, thử loading và chi tiết Bé bú/kho sữa, xoay ngang, mở/đóng bàn phím. Không yêu cầu xóa dữ liệu trình duyệt hoặc gỡ PWA. Nếu hệ điều hành giữ thông tin launch cũ, cần xem diagnostics mode và geometry trước khi quyết định xử lý.

Giới hạn: chưa kiểm chứng pixel trên iPhone Boss, chưa tái hiện WebKit standalone thật. Có test mô phỏng viewport rút ngắn, bàn phím và pinch; đây là phương án sửa có kiểm chứng local, không cam kết lỗi trên máy đã hết trước khi quan sát thực tế. Giữ nghiệp vụ/database nguyên; không SQL mới, chưa push/deploy.

# V17.8.2 — Fullscreen Detail & Editor Geometry

Sửa đúng màn ảnh lỗi: careDetailOverlay (Bé bú / Hút sữa / Ngủ / kho sữa và các loại chăm sóc). Trước đây bộ viewport chỉ quản lý 4 editor, bỏ sót khung chi tiết dùng padding-bottom cũ. Nay một registry gồm11 khung: care form/detail, milk detail/picker, transfer, feed completion, health modal/report, month/milestone detail và timeline detail. Menus/bộ lọc nhỏ không bị ép fullscreen.

src/ui/form-viewport.js sở hữu height/top theo visualViewport; src/styles/viewport.css tải cuối, có specificity theo ID để thắng geometry cũ. Bỏ margin/padding dưới khung ngoài; giữ safe area trong footer/nội dung. Danh sách giữa cuộn độc lập; dashboard giữ thanh điều hướng. Mở qua overlay manager đồng bộ viewport ngay, không đợi frame sau.

Không sửa dữ liệu, API hay nghiệp vụ, không migration. Chưa có kiểm chứng pixel/native iPhone. Các bài test giả lập viewport không thay thế kiểm tra iOS thực tế. Chưa push/deploy.

# V17.8.2 — Feature Modules

Six feature modules and late-bound compatibility APIs; full-height record forms. Details and extraction map: docs/FEATURE_MODULES_V17.8.2.md/json. No migration. No production/iPhone device test or deploy.

# V17.8.2 — Architecture Audit & Cleanup

Audit chi tiết: docs/ARCHITECTURE_AUDIT_V17.8.2.md và JSON. Số đo/danh sách file dư: docs/CLEANUP_METRICS_V17.8.2.json. Chỉ bỏ mã unreachable đã xác minh và file đóng gói dư; chưa tách hết app.js, chưa lazy load. Không migration mới; giữ loading, dashboard ngày, quiet save, native IDs/OCC/ledger. Không deploy/production test.

# V17.8.2 — Care Metrics Toolbar

Tiêu đề cố định Chỉ số chăm sóc, không dùng tên Hôm nay đã lưu trong cấu hình cũ. Thanh ngày gọn một hàng: nút trước, ngày + nhãn Hôm nay/thứ, nút sau. Bấm phần ngày để về hôm nay. Nút 44px, màu theo theme và ghi đè quy tắc màu nút cũ gây chìm icon. Chữ lớn có thể tự xuống dòng trong vùng giữa, không đè hai nút.

Không đổi nghiệp vụ, API hay schema. Giữ loading đã chốt. Không migration mới. Chưa deploy/kiểm tra trực tiếp iPhone.

# V17.8.2 — Dashboard Day Navigation & Quiet Save

- Khối chỉ số chăm sóc mặc định hôm nay, lùi/tiến ngày, nhãn ngày và Hôm nay, nút Về hôm nay. Ngày chọn giữ trong phiên, refresh lại về hôm nay; xem chi tiết đúng ngày chọn.
- Kho sữa ghi rõ hiện tại, không giả lập số dư lịch sử. Các phần khác của dashboard giữ thời gian hiện tại.
- Bỏ toast kết nối, thông báo ghi/lưu thành công dùng Lưu thành công; lỗi thao tác dùng Lưu thất bại. Giữ kiểm tra phản hồi, pending, retry và bảo vệ chống lưu trùng; chưa xác nhận không báo thành công.
- Không migration mới. Chưa deploy, chưa kiểm chứng trực tiếp iPhone.

# V17.8.2 — UI Consistency
- Loading dọc, bỏ card, giữ thương hiệu.
- Đồng nhất field, focus, footer, popup, theme và nhãn dài.
- Không đổi database, luồng kho sữa và API.

# V17.8.2 — Startup & Query Performance

- Critical paint/loading đầu HTML và launch metadata đồng bộ nền hồng, loading dạng header gọn.
- Shell nhẹ, tải song song phần cần cho dashboard cũ; deferred history theo nhu cầu, full/backup guard.
- Coalesce/cache đọc 5s có invalidation/đích/revision, bỏ đọc lặp popup; giữ write/idempotency/OCC.
- Vẽ biểu đồ khi mở trang, chẩn đoán thời gian thực trên thiết bị và benchmark fixture.
- Không migration mới. Chọn V17.5 trực tiếp; V17.3/V17.4 chưa thực hiện.

# V17.2.5 — Warm Loading Refinement

- Thu nhỏ card/logo và khoảng đệm của loading.
- Card, viền và chữ dùng màu hồng/hồng tím phù hợp nền; bỏ tông xanh đen trên card dark mode.
- Giữ nền splash, animation, startup/retry/update gate; không business/backend/SQL mới.

# V17.2.4 — Loading Background Restore

- Khôi phục gradient/mảng sáng của splash cũ cho loading hiện tại; có sáng/tối và reduced motion.
- Giữ một màn hình tải, card/logo/version, retry và dashboard/update gate. Không đổi business/backend; không SQL mới.

# V17.2.3 — Loading Brand Polish

- Thiết kế lại loading có nhận diện thương hiệu, logo tròn, tên app, trạng thái + ba chấm và badge phiên bản.
- Card/nền sáng tối có chiều sâu nhẹ; gọn trên màn hình ngang; giữ reduced motion, error/retry và update gate.
- Tách stylesheet loading riêng; không thay business logic hoặc backend. Không SQL mới.

# V17.2.2 — Care UI Cleanup

- Bỏ tự giữ/khôi phục bản nháp chăm sóc và các nút lựa chọn nháp; đóng form bỏ nội dung nhập.
- Splash phẳng theo sáng/tối, icon gọn không vòng sáng; giữ version, Đang tải dữ liệu, ba chấm.
- Timer hai hàng, chiều cao tự nhiên, đồng hồ rõ và hai nút Dừng/Hủy đầy đủ.
- Giữ outbox giao dịch chưa xác nhận, chống trùng, OCC và ledger; không thay backend/SQL.

# V17.2.1 — Loading Visual Restore

- Khôi phục icon app và ba chấm có animation trong loading; giữ tên phiên bản và Đang tải dữ liệu.
- Giữ một lớp loading, retry khi lỗi và cập nhật sau khi vào dashboard. Không đổi API/database; không SQL mới.

# V17.2.0 — Health Planning

- Lịch khám/tiêm đã lưu trong một màn hình; lọc thành viên native ID, ngày và trạng thái.
- Mở đúng hồ sơ/tệp và bản ghi; đánh dấu lịch đã khám với OCC. Lịch cũ thiếu liên kết hiển thị rõ.
- Chọn hồ sơ cụ thể khi lưu lịch, không tự ghi đè bằng người đầu tiên cùng quan hệ.
- Một loading tối giản, thông báo cập nhật chỉ hiện khi dashboard sẵn sàng.
- Backend giữ nguyên; không SQL mới.

# V17.1.2 — Fullscreen Viewport Fix

- Đo visual viewport khi form mở, resize/xoay/keyboard, fallback innerHeight; không co form theo pinch zoom.
- Bỏ phần trăm chiều cao card, stretch theo overlay, reset padding đáy, footer an toàn.
- Không đổi database/API, không migration, giữ kho cũ và swipe.
- Kiểm thử viewport mô phỏng và hồi quy; chưa iPhone/Safari thật, chưa push/deploy.
