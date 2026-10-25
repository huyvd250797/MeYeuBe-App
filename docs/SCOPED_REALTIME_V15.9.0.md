# V15.9.0 — Thiết kế và giới hạn

Nền: ZIP MeYeuBe_v15.8.0(1) Boss gửi. Không truy cập DB business/credentials production.

## Luồng

1. Lưu qua typed RPC cũ, giữ family lock/OCC/operation UUID/ledger.
2. Trigger nghiệp vụ tạo tín hiệu trong cùng transaction. Duy nhất `(family_id, transaction_key, scope)` gom nhiều hàng; chỉ commit mới nhận tín hiệu.
3. Client gom tín hiệu220ms, so revision rồi đọc các scope cần thiết, ghép vào state hiện có. Không truyền business payload qua websocket và không ghi whole JSON.
4. Đọc/staging xong mới accept; target/epoch khác thì bỏ kết quả và giữ scope để thử lại. Cache/baseline cùng cập nhật; theme thiết bị giữ riêng.
5. Render đúng nhóm và các số liệu phụ thuộc (dashboard/cột mốc tự động). Không gọi render toàn app; khôi phục scroll. List planning giữ filter/tab và số bản ghi đã nạp.

## Scope

| Scope | API đọc | Phụ thuộc hiển thị |
| --- | --- | --- |
| care | care/milk bundle1540 | timeline, kho, dashboard, cột mốc/thống kê |
| health | health bundle1550 | sổ sức khỏe, biểu đồ, thai kỳ, dashboard/cột mốc |
| diary/appointment/milestone/month | pages từng kind1560 | danh sách/lịch/cột mốc/tháng tương ứng |
| settings | settings_get1570 | dashboard/nav và dữ liệu suy ra; form cũ giữ OCC baseline |
| catalogs | slice1590 đọc bảng trực tiếp | danh mục và nhãn/lịch phụ thuộc |
| members/sensors/activity | slice1590 đọc bảng trực tiếp | state mới khi mở lại khu vực tương ứng |

Khi đang mở form/modal, focus input, có draft hoặc command chưa xác nhận, toàn bộ cập nhật nền được hoãn. Không hứa các nhóm không liên quan vẫn cập nhật tức thì trong khi đang sửa. Khi đóng/hoàn tất, scope giữ lại được đọc lại. Lưu gặp xung đột vẫn trả lỗi và giữ form như các bản trước; không tự merge ý định người dùng.

## Bù tín hiệu và fallback

Revision mỗi scope là count:max(id), không chỉ max(id) vì transaction có thể commit sai thứ tự sequence. Client checkpoint lấy TRƯỚC khi đọc dữ liệu; thay đổi đến giữa lượt đọc sẽ được phát hiện ở lượt sau. Foreground, SUBSCRIBED/reconnect và online chạy reconcile; mỗi60s khi visible/online so revision nhẹ. Mất mạng không được báo đã cập nhật. Gỡ timer legacy350ms có thể đóng nhầm kênh mới khi tải nhanh. Nếu form được mở giữa lượt request thì staging được hoãn, checkpoint không tiến. Lỗi scope giữ bản đã xác nhận và retry1200ms; realtime tắt/offline không xóa pending business commands.

Tín hiệu cũ/không rõ hoặc thiếu API1590 dùng full refresh an toàn. Khi bundle/module chuẩn có mặt, không gọi global render, kể cả fallback full read. Bộ runtime đứng riêng trong diagnostics không có module UI thì vẫn dùng global render để tương thích. Khi đang nhập, độ trễ cập nhật chủ động chấp nhận để tránh mất nháp.

## Kho sữa

Source cũ còn nhiều lớp pool/selection, một số dùng lịch sử để dựng lại số dư. Module milk-selection mới thay các entry points cuối: tự chọn, picker, bỏ/chọn lại, nguồn đã chọn. Giá trị database `remaining` là nguồn duy nhất. Sửa record chỉ cộng trả used/discard của nguồn trong snapshot đang sửa; không quét tổng lịch sử để quyết định stock.

Một quy tắc `milkIsAvailable`: remaining>0, thời gian chưa hết, chưa hủy/đóng; có thể dùng `_available` do SQL xuất. Alias native storing/stored/available được hiểu thống nhất. `_available=false` không được hồi sinh bằng số dư local. Projection SQL xóa expiry JSON cũ trước khi ghép expiry native, tránh column NULL nhưng UI lại dùng expiry cũ. Không sửa balance/status/expiry trong bảng.

Milk doc xuất `_dbId` và id legacy-or-UUID. Care writer phân giải source trong đúng family bằng legacy ID hoặc UUID. Nếu nhiều hàng nhận cùng alias thì từ chối. Native ID không tạo bản sao và không chuyển quyền gia đình. Trừ kho/Undo vẫn do transaction API1540, không do client.

Ảnh Boss gửi cho thấy thẻ bị khóa dù còn ml/HSD; không có business rows để xác định chính xác trạng thái deployed SQL/các hàng521 túi. Những lỗi tương thích và nguồn chọn được xử lý/test trên fixture; chưa kết luận dữ liệu production đã được sửa. Không chạy rebuild/dedupe/reset hoặc khôi phục hàng đã hủy.

## Cài đặt và quyền

Chạy SQL1590 sau1570, bản TXT đính kèm byte-identical.27 trigger,2 RPC đọc SECURITY DEFINER,1 helper phân giải nguồn bị revoke trực tiếp; RLS bảng tín hiệu chỉ SELECT cho client theo mô hình SyncID cũ. Vẫn chưa có xác thực/phân quyền gia đình mới. Không mở quyền sửa tín hiệu; không có dữ liệu sức khỏe trong event metadata. `transaction_key` chỉ metadata DB, không phải device identity. Cơ chế này không bỏ mọi echo trên cùng thiết bị; echo được gom và chỉ tải scope.

Realtime chỉ cần bật cho myb_realtime_events. SQL tự thêm publication nếu có; production publication/RLS/WebSocket/iPhone phải xác minh trên môi trường thật. Không cần bật mọi business table. Startup vẫn đầy đủ như15.8, không dùng timer đóng loading sớm. Không push/deploy trong phạm vi bàn giao.
