# Backup & Restore V16.5.0

## Mô hình

Gói version1 `MeYeuBe.Backup` gồm payload `myb.records.v1`, fingerprint cột/kiểu, family_id, các row native, manifest byte base64/SHA256 và checksum canonical toàn gói. Đây là checksum phát hiện hỏng/thay đổi, **không phải chữ ký chứng minh nguồn gốc**. Kiểm tra server không tin bảng/path do client gửi ngoài whitelist. JSON là định dạng file vận chuyển, không khôi phục đường whole-state save cũ.

Whitelist tối đa33bảng theo dependency: devices, health_members, milk_containers, care_categories, app_settings, vaccine_catalog, child_vaccine_plans, vaccine_records, care_events, pump_events, milk_items, feed_events, feed_milk_sources, milk_transactions, sleep_events, diaper_events, temperature_events, health_measurements, health_visits, health_medications, health_labs, health_allergies, appointments, diary_entries, milestones, pregnancy_records, app_members, sensor_logs, activity_logs, monthly_notes, smart_alert_rules, media_files, myb_media_v1640. Chỉ bảng thực sự tồn tại và có family_id được export, bao gồm soft-deleted rows. Không giả định bảng thiếu đã được backup.

Không xuất Auth/family_users, push subscriptions/tokens, queue, operation logs, change signals, secrets hoặc toàn bộ hạ tầng. Family phải tồn tại/còn hoạt động và Sync ID phải khớp; không tạo lại family/schema/project từ gói. Global vaccine catalog family_id=null không được ghi đè; các tham chiếu global cần tồn tại tại đích, nếu thiếu sẽ chặn. Đây là phục hồi nghiệp vụ cùng gia đình, không phải chuyển project/tenant tự động.

## Server

- Export xây một câu SQL đọc tất cả bảng để cùng snapshot MVCC; whitelist/quote identifiers cố định. Không ghi nghiệp vụ.
- Preview kiểm tra size/count, protocol, family, schema cột/kiểu, required fields, ép kiểu native không ghi, UUID và FK1cột. PK ở gia đình khác, file hash/path immutable khác đều bị từ chối. Constraint phức tạp/unique và trigger vẫn do PostgreSQL thực thi lúc apply; lỗi sẽ rollback, không cam kết preview mô phỏng mọi custom trigger. Preview chỉ ghi private job/before-image/plan.
- Missing mode: insert row thiếu, skip row giống, conflict giữ nguyên. Update mode: cho update row khác trong gói, giữ row ngoài gói. Devices hiện có được giữ để không ghi đè heartbeat. Mỗi plan có action, ID, label/currentLabel và beforeHash.
- Apply lấy khóa gia đình chung với các writer hiện hữu, khóa các bảng liên quan trong share-row-exclusive rồi so fingerprint toàn family. Chỉ job chưa apply và revision không đổi mới được ghi. Lock có thể chờ/block writer tạm thời; không tự force/deadlock retry. Quy mô giới hạn chủ động, chưa benchmarkproduction.
- Insert/upsert từng UUID theo dependency, tăng version khi có, cập nhật timestamp và clear last_op_id. Không delete row ngoài gói. FK/unique/check lỗi làm rollback cả job transaction.
- Số dư mỗi milk item active tính từ amount + transfer_in/adjust - feed_use/discard/transfer_out (bỏ giao dịch deleted); create không cộng hai lần. Âm hoặc feed-source/ledger use không khớp thì rollback. remaining_ml không được tin từ bản sao. Không tự sửa các nghiệp vụ legacy hỏng để ép restore.
- Job response và state applied commit cùng dữ liệu. Replay cùng job chỉ trả kết quả cũ, không apply lại. Pending ở thiết bị khác dùng etag/version cũ sẽ cần đối chiếu như các writer hiện có; bản sao không mang theo operation/Undo logs.
- Journal/before-image private RLS, không cho SELECT trực tiếp hoặc gọi internal snapshot helper từ anon. RPC public vẫn dựa capability Sync ID hiện hữu, không thêm Auth. Người biết Sync ID hợp lệ có cùng phạm vi dữ liệu như trước.

Không có transaction chung Postgres/Storage. Chưa có rollback tự động toàn bộ job sau khi DB đã commit và một file upload lỗi. Before-image không tự xóa row mới, không chứa byte file và không phải point-in-time DB recovery.

## File và tiếp tục

Bucket myb-media được đọc qua nhánh backup_open server-only (cho cả registry lưu trữ/chủ hồ sơ soft-deleted), URL ký120giây cùngorigin. Export download và kiểm tra đúng size/hash. Local health_docs đọc trên máy xuất, không xóa file gốc. Row chứa data URL được giữ nguyên bytes/chuỗi đã lưu; external URL chỉ là tham chiếu. Thumbnail/video thiếu bản gốc không được tự khôi phục.

Package.completeFiles chỉ đúng nếu mọi entry được liệt kê đều included. Missing/omitted có thông báo riêng. Bản data-only không chứa byte registry/IDB, dù ảnh nhúng vẫn nằm trong row. Không copy toàn bộ bucket khác hoặc file local không có liên kết nghiệp vụ. Không tuyên bố mọi media từng tồn tại đã được sao lưu.

Restore persist gói và jobId theo đích trong IndexedDB trước apply. Nếu đóng app lúc request, Tiếp tục tra trạng thái DB trước: preview cần xem/xác nhận lại, applied chỉ xử lý file. Completed file keys được giữ. Cloud upload dùng path/hash/size/type từ registry cùng family, upsert=false rồi đọc lại/hash; mất ACK sau upload thử lại bằng ID cũ, không tạo ID mới. Không ghi đè byte khác đã có.

Local file khôi phục đúng blobKey. Preview và trước apply kiểm tra byte cục bộ có sẵn; nếu khác thì chặn trước khi ghi DB. Khi DB đã applied và tiếp tục file, hash byte có sẵn vẫn phải trùng mới dùng/ghi; byte khác sẽ được giữ và báo xung đột. Gắn tag đích hiện tại để ngăn đọc nhầm giữa các cấu hình. Migration file local lên Cloud sau restore bỏ tag metadata cũ sau khi readLocal đã xác minh byte thuộc đích hiện tại. Không retag các file thiếu xác minh.

Nếu DB xong mà file lỗi: phase files-pending, giữ gói/manifest để thử lại; không báo toàn bộ hoàn tất. Gói không có byte không thể tự lấp thiếu, phải lấy bản gốc/gói đầy đủ. Không xóa object/local byte cũ, không purge registry/journal, chưa retention/GC.

Giới hạn:20MiB data,20.000rows,10MiB/file,50MiB tổng byte,100MiB gói; base64 làm tăng kích thước. Snapshot/journal và gói local chiếm dung lượng. Không streaming/chunk/partial-table restore trong bản này.

## UI/đồng thời

Màn Data có card mới, chọn gói, mode, preview counts/tên bản ghi, báo cáo, checkbox và confirm, resume và before-image export. Legacy backup vẫn xem/xuất, không khôi phục JSON cũ. Xuất gói mới hoặc đổi mode hủy xác nhận cũ. Resume một preview chưa apply hiển thị lại để xác nhận, không tự ghi.

Busy overlay chặn thao tác; Cloud/PWA update, config save, business write RPC và realtime refresh được defer/chặn khi backup đang bận. Sau restore dùng loader đầy đủ hiện hữu, không reload trang hoặc xóa cache/file. Không để resume của đích khác lấy journal local của gia đình trước. Guard ở client không thay cho locks/revision/FK trên server.

## Kiểm chứng môi trường thật cần thực hiện

1. Cài1650 trên staging sau1640; redeploy media-storage16.5 và static app, kiểm tra sourceversion/SW.
2. Gia đình test tạo pump200ml/feed40ml, growth/vax/visit/diary/appointment/milestone/month note và file PDF/ảnh. Export cả2chế độ, mở gói bằng app để validate. So hash bản gốc trên2thiết bị.
3. Preview missing/update: bản ghi ngoài gói giữ nguyên; unique/reference/type lỗi rõ. Sửa từ máy khác giữa preview/apply thì stale; không force.
4. Thử phục hồi bản ghi thiếu trên staging, đối chiếu native IDs và ledger160ml; thêm/sửa/xóa/Undo bằng form sau restore.
5. Cắt mạng sau DB commit và sau file upload, đóng/mở app, resume cùngjob không duplicate. File thiếu/khác hash không overwrite/không báo hoàn tất giả.
6. Đổi cấu hình/family, API access RPC/helper, private bucket, before-image, queue/draft/PWA update và realtime khi busy. Không dùng dữ liệu production cho bài test mất dữ liệu.
7. Kiểm tra iPhone Safari/PWA, download/upload gói, quota/RAM, font/ngàygiờ2x2 trên320–430px. VM/jsdom/PGlite không chứng minh hành vi vật lý/geometry/đa session thật.

Báo cáo tự động nằm trong TEST_RESULTS_V16.5.0.json và VALIDATION_REPORT_V16.5.0.md; source không kèm secret hoặc backup người dùng.
