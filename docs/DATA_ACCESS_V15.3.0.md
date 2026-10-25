# V15.3.0 — Data Access Foundation

Tài liệu nền cho module danh mục. Các đoạn chuyển tiếp mô tả trạng thái V15.3; V15.4 đã thay care/milk và bổ sung khóa chung, xem DATA_ACCESS_V15.4.0.md. Báo cáo hiện hành nằm ở bộ V15.4.0.

Nền: MeYeuBe_v15.2.0_Minimal_Source(1).zip. Không thêm đăng nhập. Không phục hồi script/file thừa đã dọn. Không reset database.

## Luồng mới và file

- src/data/client.js: request RPC có timeout, bắt lỗi HTTP/kết quả, chống nhận phản hồi từ kết nối cũ; không tự retry write.
- src/data/catalog-repository.js: list và write theo loại danh mục + ID, quản lý kết quả query mới/cũ; không gọi generic save hoặc buildChanges.
- src/features/catalog/service.js: chuẩn hóa input, kiểm tra tên, trạng thái, loại/dung tích, giới hạn độ dài và whitelist trường.
- src/features/catalog/ui.js: form/danh sách cho milk_container, appointment_type và diary_type; dữ liệu theo ID; khóa form trong request, giữ form khi lỗi; DOM escape; event delegation.
- relational-v1577.js: bridge kiểm soát độc quyền trong lúc ghi danh mục, flush dữ liệu chờ cũ trước khi ghi mới; chỉ cập nhật mảng danh mục đã xác nhận và nhãn bình liên quan trong memory/baseline. Generic save từ chối snapshot làm thay đổi các danh mục đã chuyển, tránh hai đường ghi. Query cũ bị chặn theo revision.
- index.html: giữ form bình/túi và loại lịch hiện có, thêm phần Loại nhật ký trong cùng màn danh mục loại lịch; thêm trạng thái tải/lỗi và nạp bốn module mới sau lớp relational.
- sw.js: version và precache có đủ module mới; fallback cache bỏ query version để tìm đúng JS, không trả HTML thay cho module bị thiếu.

## Hợp đồng database

Migration supabase/migrations/20261025_1530_catalog_api.sql tạo hai RPC, không đổi bảng:

1. myb_catalog_list_v1530(p_sync_id text,p_kind text): chỉ trả `{ok,items}` của danh mục được chọn.
2. myb_catalog_write_v1530(p_sync_id,p_kind,p_op,p_id,p_data,p_expected,p_device_key): validate, kiểm tra snapshot bản ghi gốc khi sửa/xóa, trùng tên, sử dụng liên kết và loại/dung tích; chuyển thành entity deltas gửi RPC hiện có. Chỉ trả danh mục cùng các delta của thao tác.

Hai RPC mới dùng SECURITY INVOKER, không đưa service-role vào client. Quyền vẫn phụ thuộc RPC/RLS đang cài trên project; không coi Sync ID là mật khẩu và không tuyên bố đã bảo vệ production chỉ từ source. Không thêm Auth theo yêu cầu Boss.

SQL kiểm tra có đúng hai hàm nền `myb_relational_export_state_v1576(text)` và `myb_relational_apply_changes_v1576(text,text,jsonb)` trước khi cài. Nếu tên/chữ ký khác, transaction dừng; không tự dựng schema để chạy tiếp. Nếu trả lỗi trong mutation, exception block rollback các thay đổi trong RPC mới trước khi trả lỗi cho client.

## Giới hạn chuyển tiếp cần hiểu đúng

- Client danh mục không tải/gửi toàn trạng thái app. **Bên trong SQL facade vẫn gọi RPC export hiện có** để đọc payload và lọc loại danh mục, vì source không chứa schema thực tế để truy vấn bảng an toàn. Đây là scoped API ở ranh giới client, chưa phải tối ưu SELECT theo bảng ở server. RPC export có thể còn tốn chi phí theo tổng dữ liệu. Phiên bản sau cần schema thật để thay phần này.
- Các module còn lại vẫn bootstrap/refetch full state và dùng cơ chế V15.2.0. Chưa chuyển mọi nghiệp vụ sang repository.
- RPC ghi cùng loại danh mục được tuần tự bằng advisory lock theo Sync ID. Cạnh tranh với client cũ, tác vụ hoặc RPC khác còn phụ thuộc cơ chế khóa/FK/transaction của database thực tế. Chưa chứng minh bảo vệ mọi race production.
- Đổi tên bình giữ hành vi cập nhật tên trên milk items liên quan qua delta trong cùng RPC. Vì hợp đồng RPC cũ nhận nguyên object từng milk item, việc tránh lost update với tác vụ ngoài facade phải kiểm tra trên schema/RPC thực tế. Không tuyên bố đã giải quyết hết cạnh tranh của kho sữa.
- Timeout/lỗi mạng không được tự retry. ID tạo mới được giữ tới khi form reset; nếu request đã commit nhưng mất ACK, tải lại danh sách đối chiếu; retry cùng ID bị server từ chối thay vì tạo bản trùng.
- Import/Undo snapshot có thay đổi danh mục đã chuyển sẽ bị chặn, để không dùng dữ liệu cũ ghi đè lên danh mục. Undo chăm sóc/kho sữa không đổi danh mục vẫn giữ luồng hiện có. Hoàn tác danh mục theo ID là nâng cấp sau; không dùng generic Undo để xóa/khôi phục danh mục.
- Loại nhật ký có danh mục CRUD riêng; source hiện tại không có form CRUD loại nhật ký đầy đủ trước bản này. Không tự đổi các bản ghi nhật ký cũ sang ID mới.

## Kiểm tra

Bộ tests/catalog-sql.cjs chạy migration thật bằng PostgreSQL nhúng PGlite, với hai hàm relational nền được dựng làm fixture; kiểm tra CRUD ba loại, stale edit, tên trùng, dung tích âm, trường lạ, liên kết, đổi loại, đổi nhãn, giữ số dư, scoped response, family routing, chạy SQL hai lần và rollback khi RPC nền báo lỗi.

Bộ tests/catalog-runtime.cjs nạp đầy đủ 7 script trong jsdom, IndexedDB giả, request kết nối tới PostgreSQL nhúng thay vì chỉ trả kết quả cứng. Kiểm tra form CRUD/toggle/delete ba loại, ID khi lọc, DOM escape, validation trước network, lỗi mạng giữ form, chặn bấm lặp, chặn đổi cấu hình/generic save trong lúc ghi, chống snapshot cũ, mất ACK không tạo trùng, API chưa cài và query cũ sau write.

Các bộ V15.2 còn được chạy lại. Các test lịch sử chỉ nạp app.js được giữ để đối chiếu engine cũ; test data-safety/cold-start kiểm tra lớp V15.2 đã nâng version; test catalog-runtime bổ sung xác minh lớp cuối mới nhất.

Chưa truy cập Supabase production, chưa kiểm thử iPhone/Android/browser thật/PWA upgrade/push nền/cảm biến. PostgreSQL nhúng với fixture không chứng nhận schema hoặc quyền production. Kết quả thực tế của lần chạy cuối nằm trong docs/TEST_RESULTS_V15.5.0.json và docs/VALIDATION_REPORT_V15.5.0.md.

Bộ tests/service-worker.cjs bổ sung ba kiểm tra VM offline: module có version dùng cache canonical, module thiếu trả lỗi thay HTML, document vẫn có fallback app shell. Không thay thế thử PWA trên thiết bị thật.
