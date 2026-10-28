# V17.7.0 — Architecture Audit & Cleanup

Audit chi tiết: docs/ARCHITECTURE_AUDIT_V17.7.0.md và JSON. Số đo/danh sách file dư: docs/CLEANUP_METRICS_V17.7.0.json. Chỉ bỏ mã unreachable đã xác minh và file đóng gói dư; chưa tách hết app.js, chưa lazy load. Không migration mới; giữ loading, dashboard ngày, quiet save, native IDs/OCC/ledger. Không deploy/production test.

# V17.7.0 — Care Metrics Toolbar

Tiêu đề cố định Chỉ số chăm sóc, không dùng tên Hôm nay đã lưu trong cấu hình cũ. Thanh ngày gọn một hàng: nút trước, ngày + nhãn Hôm nay/thứ, nút sau. Bấm phần ngày để về hôm nay. Nút 44px, màu theo theme và ghi đè quy tắc màu nút cũ gây chìm icon. Chữ lớn có thể tự xuống dòng trong vùng giữa, không đè hai nút.

Không đổi nghiệp vụ, API hay schema. Giữ loading đã chốt. Không migration mới. Chưa deploy/kiểm tra trực tiếp iPhone.

# V17.7.0 — Dashboard Day Navigation & Quiet Save

- Khối chỉ số chăm sóc mặc định hôm nay, lùi/tiến ngày, nhãn ngày và Hôm nay, nút Về hôm nay. Ngày chọn giữ trong phiên, refresh lại về hôm nay; xem chi tiết đúng ngày chọn.
- Kho sữa ghi rõ hiện tại, không giả lập số dư lịch sử. Các phần khác của dashboard giữ thời gian hiện tại.
- Bỏ toast kết nối, thông báo ghi/lưu thành công dùng Lưu thành công; lỗi thao tác dùng Lưu thất bại. Giữ kiểm tra phản hồi, pending, retry và bảo vệ chống lưu trùng; chưa xác nhận không báo thành công.
- Không migration mới. Chưa deploy, chưa kiểm chứng trực tiếp iPhone.

# V17.7.0 — UI Consistency
- Loading dọc, bỏ card, giữ thương hiệu.
- Đồng nhất field, focus, footer, popup, theme và nhãn dài.
- Không đổi database, luồng kho sữa và API.

# V17.7.0 — Startup & Query Performance

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
