# Acceptance Criteria — MeYeuBe V10.6.0 Realtime JSON Sync

## AC-01 — Kết nối Realtime
**Given** Cloud Sync đã bật và cấu hình URL, anon key, Sync ID hợp lệ  
**When** người dùng mở app khi có mạng  
**Then** app phải subscribe Realtime vào bảng `public.meyeube_sync` theo đúng Sync ID  
**And** trạng thái Cloud Sync phải hiển thị `REALTIME`.

## AC-02 — Auto push
**Given** Cloud Sync đang bật và Realtime có mạng  
**When** người dùng thêm, sửa hoặc xóa dữ liệu và thao tác được lưu  
**Then** app phải tự upsert JSON lên Cloud sau khoảng debounce  
**And** payload phải có `_cloudDeviceId`, `_cloudRevision`, `_cloudUpdatedAt`.

## AC-03 — Thiết bị khác tự nhận dữ liệu
**Given** hai thiết bị dùng cùng URL, key và Sync ID  
**And** cả hai đang mở app  
**When** thiết bị A lưu dữ liệu lên Cloud  
**Then** thiết bị B phải nhận sự kiện Realtime  
**And** cập nhật localStorage  
**And** render lại giao diện mà không cần bấm Tải Cloud về.

## AC-04 — Không tự phản hồi vòng lặp
**Given** thiết bị vừa nhận payload Realtime từ Cloud  
**When** app lưu payload vào localStorage và render lại  
**Then** app không được tự đẩy lại cùng payload chỉ vì vừa nhận remote  
**And** sự kiện do chính thiết bị tạo phải được bỏ qua.

## AC-05 — Revision
**Given** payload Cloud có `_cloudRevision`  
**When** thiết bị đẩy bản mới  
**Then** revision mới phải lớn hơn revision trước  
**And** thiết bị không áp dụng payload remote có revision cũ hơn hoặc bằng local.

## AC-06 — Reconnect
**Given** app đang mất mạng hoặc chuyển nền  
**When** mạng được khôi phục hoặc app trở lại foreground  
**Then** app phải pull bản Cloud mới hơn nếu có  
**And** subscribe lại Realtime.

## AC-07 — Merge trước auto push
**Given** Cloud có revision mới hơn local khi thiết bị chuẩn bị auto push  
**When** app kiểm tra Cloud trước khi ghi  
**Then** app phải gộp các mảng nghiệp vụ theo khóa bản ghi/thời gian cập nhật  
**And** không được âm thầm bỏ toàn bộ dữ liệu Cloud mới hơn.

## AC-08 — Đồng bộ thủ công
**Given** Realtime đã được bổ sung  
**When** người dùng bấm Đẩy lên Cloud, Tải Cloud về hoặc Đồng bộ 2 chiều  
**Then** các chức năng thủ công hiện có vẫn hoạt động  
**And** cảnh báo ghi đè vẫn hiển thị.

## AC-09 — Offline
**Given** thiết bị không có mạng  
**When** người dùng sử dụng app  
**Then** dữ liệu vẫn lưu local bình thường  
**And** trạng thái hiển thị `OFFLINE`  
**And** app không bị lỗi chặn nghiệp vụ.

## AC-10 — Tương thích dữ liệu
**Given** người dùng nâng cấp từ V10.5.1  
**When** mở V10.6.0  
**Then** localStorage key vẫn là `meYeuBePWA_v4`  
**And** toàn bộ module cũ vẫn tồn tại  
**And** Export/Import và Cloud Sync thủ công vẫn dùng được.
