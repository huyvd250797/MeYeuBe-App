# V15.5.0 — Health & Growth Data Access

Nền source: ZIP MeYeuBe V15.4.0 `(2)` Boss cung cấp; đã đối chiếu `(1)` và `(2)` giống nhau. Dựa trên schema PostgreSQL 17.6 đã cung cấp trong phiên làm việc. Không đọc/ghi business rows trên Supabase production.

## Phạm vi hoạt động

- `health_members`: hồ sơ cơ bản, y tế, tiền sử, tình trạng, ghi chú và metadata đính kèm.
- `health_measurements`: từng lần đo; UI nhập kg/cm, database lưu weight_g theo gram. Không thay toàn mảng khi sửa một lần đo.
- `vaccine_records` + `child_vaccine_plans` + `vaccine_catalog`: từng ghi nhận và lịch liên quan trong cùng transaction; giữ ID kế hoạch hiện có khi sửa. Ngày tiêm thực tế chỉ ghi khi trạng thái Đã tiêm. Xóa ghi nhận cuối của lịch chuyển lịch về pending, giữ lịch để theo dõi.
- `health_visits`, `health_medications`, `health_labs`: từng dòng; giữ các thông tin kê đơn, bảo hiểm, đã uống, đánh giá/chỉ số xét nghiệm trong extra khi schema chưa có cột riêng.
- `pregnancy_records`: từng lần khám, giữ phạm vi gia đình của schema hiện có.

Các bảng quan hệ hiện hữu là nơi lưu dữ liệu chính. Migration chỉ bổ sung extra/version/legacy_id khi thiếu; không xóa/rebuild business rows, không tạo một bảng JSON thay cho các bảng nghiệp vụ. Trường đã có cột riêng được ghi vào đúng cột; extra giữ thuộc tính UI chưa có cột riêng. Lịch tiêm theo tuổi và công thức WHO hiện có được giữ, không bổ sung tư vấn y tế hoặc lịch tiêm mới.

## API

| Endpoint | Hợp đồng |
| --- | --- |
| `myb_health_list_v1550(text,jsonb)` | kind: member/meas/vaccines/visits/meds/labs/pregnancy; id là UUID DB, memberId là UUID hồ sơ; from/to cho bảng có trường date; limit 1–500, offset và revision |
| `myb_health_write_v1550(text,text,uuid,jsonb)` | Một record command: kind, op save/delete, memberId, data, expected etag; Undo nhận op undo + operationId |
| `myb_health_operation_v1550(text,uuid)` | Đối chiếu mã thao tác sau timeout; trả trạng thái hiện tại của đúng record đã lưu |
| `myb_app_shell_v1550(text)` | Giữ phần chưa chuyển, loại truy vấn hồ sơ/record con và thai kỳ ra khỏi shell V15.4 |

`_dbId` luôn là UUID DB; `id` giữ legacy_id nếu có. Các hàng cũ không có legacy_id vẫn được truy cập đúng UUID. ID mới có mapping ổn định theo loại/gia đình/hồ sơ/source ID. Không ghép hồ sơ dựa vào họ tên. Không cho chuyển record sang thành viên/gia đình khác hoặc dùng UUID đã thuộc record của gia đình khác.

Migration kiểm tra cột mapping, chữ ký và anchor shell/apply hiện hữu. Nếu định nghĩa khác dự kiến, toàn migration rollback; cần đối chiếu thay vì xóa chốt kiểm tra để ép chạy. Fixture bao phủ các cột đang được đọc/ghi, không phải bản sao nguyên database production.

## An toàn thao tác

- Cùng khóa advisory theo gia đình với care/catalog/legacy; đặt trước metadata writes. Transaction rollback cả record, lịch tiêm, catalog mới, operation record và device signal khi lỗi.
- Etag tính từ toàn row thực tế, gồm cả row lịch liên quan với vaccine. Sửa/xóa phải gửi etag của record đã mở. Thay đổi con không yêu cầu ghi lại parent, nên sửa vaccine không xóa số đo.
- Bảng operations riêng, RLS bật, không policy/grant trực tiếp cho anon/authenticated/public. Helper nội bộ thu hồi EXECUTE; API definer giữ mô hình truy cập Sync ID hiện có, không thêm Auth.
- Một UUID thao tác cho một command; request hash ngăn tái dùng UUID với nội dung khác. Pending command/đích được ghi bền trên thiết bị trước request. Sau mất ACK, bấm lại sẽ lookup trước; chưa có thì gửi lại cùng UUID. Sau reload có nút kiểm tra kết quả. Không tự phát sinh write khi mất mạng.
- Undo lấy inverse từ DB, chỉ sửa/xóa/khôi phục record và lịch liên quan. Nếu row hoặc lịch đã thay đổi tiếp, từ chối. Không phục hồi snapshot toàn hồ sơ. Không tự xóa operations theo tuổi vì sẽ phá cửa sổ retry/Undo.
- Xóa member dùng kiểm tra FK đang có dữ liệu liên quan, không cascade xóa hồ sơ con. Soft delete các record; xóa dữ liệu đã dùng cần đối chiếu riêng.
- RPC apply cũ được chặn riêng entity health_member/pregnancy; các entity khác vẫn dùng được. Điều này ngăn client cũ xóa và tạo lại toàn bộ record con sau nâng cấp. Phải hoàn tất queue cũ trước khi cài migration và nâng tất cả thiết bị.

## Frontend và số đo

Client/repository/service/UI tách trong src/data và src/features/health. Các form đồng bộ cũ được adapter chạy trên context bất biến tại lúc mở để tạo **một command**, không gửi snapshot context đó lên server. Kết quả chỉ gộp record đã ACK vào cache/baseline. Form thuốc/khám/xét nghiệm giữ ID trước khi sort/realtime thay đổi danh sách. Mở form sẽ khóa chuyển hồ sơ; request đang gửi khóa controls/đóng form/config. Lỗi giữ form, không báo lưu thành công trước ACK.

Đo nhanh giữ hành vi ghép thông tin cùng ngày nếu trong context chỉ có một record; nếu ngày có nhiều lần đo thì yêu cầu mở đúng dòng để sửa. Editor lịch sử luôn giữ ID ngay cả khi đổi ngày. Biểu đồ/dash lấy các điểm từ measurement canonical. Header chỉ số tự cập nhật sau thêm/sửa/xóa; bỏ điểm cuối không giữ lại một số đo giả trong projection. Khi có lịch sử đo, ô chiều cao/cân nặng ở form hồ sơ cơ bản chỉ đọc; dùng Đo chỉ số để cập nhật.

Các thao tác generic save/import/Undo snapshot thay đổi health_member/pregnancy bị chặn. Member đang xem là lựa chọn local, không gửi thành một profile write. Reader hb2Members chỉ đọc danh sách DB; không gọi repair/merge placeholder cũ, không tự tạo hồ sơ hoặc ghép theo tên khi mở màn hình. Care/milk, danh mục và các module ngoài health giữ endpoint hiện hữu.

## Đọc dữ liệu và giới hạn

API hỗ trợ truy vấn theo UUID thành viên và khoảng thời gian. Để dashboard/biểu đồ/lịch sử cũ vẫn đầy đủ, bootstrap và realtime hiện tải hết các trang của từng bảng, ráp vào cache theo member UUID. Revision thiết bị chống trộn trang trong quá trình ghi qua API. Đây chưa phải lazy loading từng màn hoặc scoped realtime hoàn chỉnh; aggregate và tối ưu đọc tiếp tục ở V15.7/V15.9.

Tệp gốc dùng đúng IndexedDB `meYeuBeFiles_v1/health_docs` hiện hữu; DB profile chỉ nhận metadata. Ghi/đổi file giữ byte trước khi gửi metadata. Xóa/thay metadata không xóa byte cũ trước ACK, giúp Undo và phục hồi không mất file; có thể có byte không còn tham chiếu, chưa tự garbage-collect. File local không trở thành file online trên thiết bị khác; Storage/upload liên thiết bị thuộc V16.4. Không tự di chuyển file hoặc đổi chính sách media trong V15.5.

Không chứng nhận Supabase production, cạnh tranh nhiều backend session hoặc iOS/PWA/push/file vật lý. Nâng schema và app trên bản sao/test trước, đối chiếu dữ liệu hiện hữu rồi mới triển khai. Không tự chạy migration hoặc deploy lên project thật trong lần bàn giao source.
