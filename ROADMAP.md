# Mẹ Yêu Bé — Roadmap đã điều chỉnh

Ngày: 25/10/2026. Source chuẩn: Minimal V15.2.0; nâng cấp hiện tại V15.5.0.

Yêu cầu Boss: mở app để dùng, không đăng nhập/đăng ký, không xây module tài khoản hoặc cộng tác gia đình. Supabase là nguồn chính; bỏ dần snapshot/merge JSON khi đã có luồng thay thế. Giữ dữ liệu và source tinh gọn.

| Phiên bản | Mục tiêu | Chức năng chính | Công việc kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| V15.2.0 | Foundation & Data Safety | Bảo vệ offline/config/pending | Outbox có đích, giữ nháp, kiểm thử | Đã bàn giao; 8 baseline được sửa trong V15.4 | Hoàn thành source, chưa kiểm chứng production |
| V15.3.0 | Data Access Foundation | CRUD ba danh mục theo ID | Client/repository/service/UI; facade SQL, bridge chống ghi chồng | Source + SQL và test local; cần cài/kiểm chứng trên DB thật | Đã triển khai local; RPC nền hiện hữu |
| V15.4.0 | Care & Milk Data Access | Chăm sóc, kho, timer, chuyển/hủy và Undo theo ID | Transaction SQL theo schema cung cấp; OCC, idempotency, ledger, paged query và shell | Đã triển khai + kiểm thử local; còn xác minh Supabase/đa thiết bị thực | Hoàn thành source; migration 1530 → 1540 trước deploy |
| V15.5.0 | Health & Growth Data Access | Hồ sơ, số đo/biểu đồ, vaccine/lịch liên quan, khám, thuốc, xét nghiệm, thai kỳ | API theo record, UUID/legacy ID, etag, retry/Undo và shell riêng | Đã triển khai + kiểm thử local; cần đối chiếu Supabase và thiết bị thật | Hoàn thành source; migration 1530 → 1540 → 1550 |
| V15.6.0 | Diary & Planning Data Access | Nhật ký, lịch hẹn, cột mốc, ghi chú | CRUD/phân trang/kiểm tra liên kết | Tải đúng phạm vi, giữ vị trí sau sửa | Dự kiến sau V15.5 |
| V15.7.0 | Scoped Queries & Settings | Dashboard/thống kê/cài đặt | Aggregate, ID và nơi lưu rõ ràng; thay internal export khi có schema | Các màn không dùng full export hằng ngày | Dự kiến sau V15.6 |
| V15.8.0 | Legacy Removal | Bỏ snapshot/queue và wrapper cũ đã thay thế | Gỡ từng đường chạy, giữ backup/file | Không còn hai nguồn quyết định dữ liệu | Sau đối chiếu mọi module |
| V15.9.0 | Scoped Realtime | Tự làm mới khu vực thay đổi | Invalidation/query theo module, xử lý xung đột | Không tải lại toàn app, giữ form đang nhập | Dự kiến |
| V16.0.0 | Component Architecture | Tách form/thẻ/timeline/popup | Component dùng chung, cleanup listener | Hành vi cũ qua hồi quy | Dự kiến |
| V16.1.0 | Design System | UI/theme nhất quán | Token/CSS, giảm override | Kiểm tra theme và mobile | Dự kiến |
| V16.2.0 | Performance | Tải/scroll/render nhanh hơn | Đo baseline, index/cache/pagination | Báo cáo trước-sau với cùng dữ liệu | Dự kiến |
| V16.3.0 | PWA Reliability | Cài/cập nhật app ổn định | Asset version, update giữ nháp và phiên dữ liệu | Thử thiết bị thật | Dự kiến |
| V16.4.0 | Media Storage | File/ảnh truy cập giữa thiết bị đúng cấu hình | Upload, đối chiếu byte local, giới hạn | Không mất file gốc | Dự kiến |
| V16.5.0 | Backup & Restore | Phục hồi có kiểm soát | Backup có file, validate/preview/import theo phạm vi | Restore thử thành công | Dự kiến |
| V16.6.0 | Notifications | Củng cố nhắc việc hiện có | Rule nhất quán, retry, chống trùng | Thử nền/push thực tế | Dự kiến |
| V16.7.0 | Quality & Accessibility | Chất lượng toàn app | E2E/CI, lỗi/rỗng/loading, focus/nhãn | Không chỉ dựa vào syntax/build | Dự kiến |
| V17.0.0 | Care Workflow | Ghi nhận ít thao tác | Mẫu, nháp, sửa nhanh, Undo theo nghiệp vụ | Đo và giảm thao tác | Đề xuất sau nền tảng |
| V17.1.0 | Milk Insights | Tìm/lọc/truy vết kho | Nguồn–đích và lịch sử số dư | Tổng tồn đối chiếu khớp | Đề xuất |
| V17.2.0 | Health Planning | Kết nối lịch/hồ sơ/file | Trạng thái và lọc theo người/ngày | Dữ liệu liên kết đúng | Đề xuất |
| V17.3.0 | Reports & Personalization | Báo cáo theo nhu cầu | Bộ lọc/công thức/xuất nhất quán | Dashboard và báo cáo khớp | Đề xuất |
| V17.4.0 | Stable Maintenance | Bản ổn định và tài liệu | Rà soát, restore drill, dependency và rollback | Phát hành tái lập được | Đề xuất |

Không coi mock hoặc PostgreSQL fixture là database production đã hoạt động. Từng phiên bản có ZIP/README/migration cần thiết và báo cáo đúng giới hạn. Không tự deploy hoặc mở dịch vụ trả phí. Các mốc dự kiến có thể điều chỉnh theo schema và nhu cầu Boss; không tự bắt đầu phiên bản tiếp theo.
