# V15.4.0 — Care & Milk Data Access

Nâng từ source V15.3.0 Boss cung cấp, dùng schema PostgreSQL 17.6 được Boss xuất ngày 25/10/2026. Không truy cập business rows của production.

## Đường ghi đang dùng

`form → care service → care repository → myb_care_write_v1540 → transaction bảng quan hệ`.

Một command chỉ có một care event, expected timestamp/version và UUID thao tác. Không gửi snapshot kho hoặc tính số dư trên client. Bridge gộp đúng các ID được ACK vào cache/baseline. Generic save/import/Undo snapshot bị chặn nếu thay đổi care/milk hoặc danh mục đã chuyển. Các module khác vẫn giữ pipeline V15.2/V15.3.

Các hàm UI mới thay `saveCareEvent`, `deleteCareEvent`, `tfConfirm`, `cancelMilkBag`, `saveFeedDonePopup` và Undo của thao tác mới. Mở sửa giữ bản ghi theo ID tại thời điểm mở form, không đọc lại ID từ vị trí mảng khi bấm Lưu. Form và nút được khóa trong lúc gửi; lỗi giữ form. Không chạy lại ledger từ lịch sử UI khi hiển thị kho.

## Transaction và số dư

- Cùng khóa `myb-v1576:<family UUID>` với RPC cũ, trước khi đọc/ghi; khóa row milk theo ID. Sửa danh mục V15.3 được bổ sung khóa chung trước khi đọc snapshot. RPC apply cũ được chuyển khóa hiện hữu lên trước ghi family/device, tránh đảo thứ tự khóa metadata giữa API cũ và mới; chữ ký và logic business giữ nguyên.
- Feed stored: trả các transaction dùng/bỏ của phiên bản cũ, kiểm tra đủ tất cả nguồn, ghi nguồn và ledger mới, cập nhật số dư trong cùng transaction. `taken = sum(usedMl)`, `actual = taken - wasteMl`; phần dư bỏ riêng không bị trừ hai lần. Snapshot từng nguồn ghi lại trước/sau.
- Sửa stored → direct/formula và xóa feed trả lượng đã lấy cùng phần dư đã bỏ. Không hoàn trả bằng toàn bộ lịch sử trên máy.
- Pump: UPSERT subtype có cùng ID; không DELETE pump làm FK kho thành NULL. Sửa lượng giữ nguyên phần đã dùng, không giảm dưới mức đã dùng. Sữa đã hủy không đổi lượng; sữa đã dùng không đổi bình gốc qua form sửa. Xóa/chuyển loại bị chặn nếu đã dùng/hủy/chuyển tiếp.
- Transfer: trừ nguồn, tạo đích và ghi sự kiện trong một transaction; không sửa lần hút gốc. Giữ ngày/giờ hút gốc, metadata chuyển và hạn không muộn hơn nguồn. Đích dùng `amount_ml` làm base + marker create; không cộng thêm transfer_in vì view hiện tại đã lấy amount_ml làm base. Tổng tồn không nhân đôi.
- Cancel: sự kiện hủy + ledger discard + lý do; xóa hoặc Undo trả lượng đã hủy. Không sửa/sao chép trực tiếp sự kiện hủy.
- Sleep: timestamp theo Asia/Ho_Chi_Minh, tính thời lượng qua ngày ở server; chặn giấc ngủ đang chạy thứ hai. Diaper/temperature có subtype; medicine/spitup và pee/poop cũ giữ loại và extra.
- Chỉ row đang được chạm mới được đối chiếu ledger với `remaining_ml` cũ. Nếu lệch do lịch sử, ghi adjustment bằng chênh lệch với biểu thức ledger **chưa clamp**, bảo toàn số dư hiện có trước thao tác. Không rebuild toàn kho.
- Lỗi ở bất kỳ bước nào rollback toàn command, kể cả device signal và operation record. SQL trả mã lỗi rõ ràng; không nuốt partial mutation rồi báo thành công.

## Idempotency, xung đột, Undo

`mybCarePending_v1540` chứa đúng command/UUID/đích, được ghi trước request đầu. Khi timeout/mất ACK, giữ command; lần bấm lưu tiếp theo lookup UUID trước. Đã commit thì nhận kết quả, chưa có thì gửi lại **cùng UUID**. Không phát sinh event mới cho lần retry. Sau reload có nút “Kiểm tra kết quả lưu”. Không đổi đích/key khi còn command chưa xác nhận. Xuất recovery có cả command này.

DB lưu request hash và ACK trong bảng riêng `myb_care_operations_v1540`. Cùng UUID khác nội dung bị chặn. Lookup/ACK lặp trả event và stock hiện tại của footprint, tránh hiển thị số dư cũ sau thao tác tiếp theo.

Expected `updatedAt` bắt buộc cho sửa/xóa, kiểm tra thêm version khi có. Timestamp vẫn bảo vệ record do client cũ chưa tăng version.

Undo tạo command mới, tra inverse ở DB, kiểm tra hash của event, subtype, milk và ledger liên quan với trạng thái ngay sau thao tác gốc. Nếu đã có thay đổi tiếp theo thì từ chối, kể cả số dư tình cờ trở lại như trước. Không phục hồi snapshot toàn app, không xóa event không liên quan. Undo thành công không cung cấp redo tự động.

## Đọc dữ liệu

`myb_care_list_v1540(text,jsonb)` hỗ trợ `kind: care|milk`, ID, type, from/to, available, limit 1–500 và offset. Date query tính cả giấc ngủ giao ngày. Mỗi trang mang revision thiết bị trong gia đình; revision đổi giữa các trang thì phải tải lại. Repository thử tải lại tối đa một lượt, không chấp nhận bundle care/kho khác revision.

`myb_app_shell_v1540` được tạo từ đúng export hiện hữu, bỏ hai SELECT care/milk. Migration kiểm tra anchor rồi mới thay, thay đổi ngoài dự kiến làm rollback. Shell giữ query của các module chưa chuyển.

Để các dashboard/biểu đồ và bộ lọc cũ vẫn đủ lịch sử, bootstrap/realtime hiện tải các trang care và milk tới hết rồi đưa vào cache. Đây là query bảng có phân trang, **chưa phải lazy loading màn hình hoặc scoped realtime hoàn chỉnh**. Aggregate/thống kê theo phạm vi và tối ưu realtime nằm ở V15.7/V15.9.

## Quyền và tương thích

Ba endpoint care cùng shell là SECURITY DEFINER, search_path public/pg_temp cho hàm mới, được EXECUTE bởi anon/authenticated/service_role như mô hình Sync ID hiện có. Bảng operations bật RLS, không policy client và thu hồi quyền trực tiếp anon/authenticated/public; helpers nội bộ cũng thu hồi EXECUTE. Không mở quyền ghi bảng mới cho frontend, không thêm login.

Sync ID vẫn là khả năng truy cập theo mô hình cũ; phiên bản này không chuyển sang phân quyền người dùng. Các RPC legacy vẫn tồn tại cho module khác/client cũ. Khóa chung giảm cạnh tranh, **không biến client cũ thành OCC/idempotent**; cần nâng tất cả thiết bị và hoàn tất hàng đợi cũ trước khi dùng bản mới. Không dùng lẫn app cũ để ghi kho.

Schema có legacy_id nullable và chỉ index không unique. Trường hợp thiếu liên kết, trùng mã kho hoặc ID đích thuộc bản ghi khác sẽ bị chặn thay vì tự đoán hoặc sửa dữ liệu. Bản này dành cho mapping ổn định của RPC V15.0.76 đang dùng; dữ liệu UUID gốc không có legacy ID cần đối chiếu riêng.

Không tự xóa bảng operations: nó bảo vệ retry/Undo. Khi cần retention, phải thiết kế cửa sổ retry/Undo và archive có kiểm soát, không dùng DELETE theo tuổi tùy ý.
