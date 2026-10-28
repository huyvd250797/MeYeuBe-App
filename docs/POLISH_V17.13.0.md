# V17.13.0 — Dashboard & Health Polish

## Dữ liệu và khởi động

bootstrapRun phân biệt warm bằng ready + memory + cùng target. Warm không đổi ready=false, không gọi showAppLoading; thất bại giữ confirmed memory. Đổi family/target trong quá trình tải vẫn đặt gatefalse và báo lỗi qua splash để không dùng nhầm dữ liệu. Cold vẫn flush pending, đọc revision trước snapshot để tránh khoảng đua bỏ sót realtime, chờ dữ liệu dashboard, render và hai frame trước khi ready. Không đưa revision xuống sau snapshot chỉ để benchmark nhanh.

Khởi động theo DOMContentLoaded thay timer40ms: source script và bundle đều có đủ dependency trước chạy. Refresh không có delay550ms tối thiểu; spinner chờ công việc thật. loading-show cũng từ chối show khi startup.ready để action sau startup không gây flash cũ. Chưa đo latency trên Vercel/Supabase/iPhone thật; local benchmark không là cam kết số giây.

## Dashboard / gesture

Ba rule cũ chừa bottom nav ở body, wrap và babyDashCommand dẫn tới khoảng trống cộng dồn. dashboard-polish.css scope body:has(#home:not(.hidden)) vì dashboard nằm trong home, không tự có hidden class. Body padding0, inner dashboard padding0, chỉ outerwrap chừa88px + safe area. Không bỏ khoảng bảo vệ thanh nav hoặc viewport của form. Khoảng block24px giảm12px, bcCard margin0 để không nhân gap. gw7Warn là icon ! thực, được đặt22x22/max/min và flex cố định; infoIcon tương tự. Stop đỏ #b4233c / trắng, đủ tách nền cả hai theme.

Pointer hold450ms trên diaperChoice, một timeout không interval, sau phát chỉ nhả/press mới tái kích hoạt. Click tương thích sau giữ bị chặn, di chuyển12px hủy. Dùng chung selectDiaperType/diaperStepAmount và giới hạn DIAPER_MAX cũ; không tự ghi DB. Timer giữ startedAt khi mở full care form từ trạng thái, cTimeTo rỗng đến khi dừng; không tạo timer mới hoặc trừ kho khi chỉ mở.

Audit source không có location reload cho đóng popup/pull refresh; location.reload còn trong boot.js cho cập nhật phiên bản chủ động và giữ guard form/pending. Không chặn link tệp/backup hợp lệ. Button không type được chuẩn hóa type button, giữ type submit explicit nếu có. Không phải cam kết đã chạy mọi thao tác trên iPhone thật.

## Health

health-polish presentation owner tải sau health/profile, giữ collector và writer. Timeline nhóm ngày, lọc loại, giữ cả start/stop thuốc và mọi bản ghi thật. Sửa/xóa từ registry native ID + member + kind, tìm lại index hiện tại ngay trước gọi typed editor/hb2DelRow; bản đã xóa hoặc đổi người không được sửa nhầm. Swipe giữ cả touch/pointer, có details Thao tác để không phụ thuộc cử chỉ. Registry được thay theo view render, không tích lũy callback cũ.

Growth chart dùng WHO hiện có, history table dùng canonical m.meas và legacy chưa chiếu; giữ mọi lần đo, format3 số lẻ có nghĩa. Biểu đồ tổng hợp theo ngày, được ghi rõ trên màn hình; không đổi thuật toán WHO hoặc tự đoán số thiếu. hb2WhoPoints bỏ mirror db.baby đã có nguồn m.meas và mirror bé khác, hb2DrawChart note dùng formatter đo chung. Hai function hash được cập nhật có trace trong extraction audit.

17 tệp Supabase và toàn bộ entry dependency bên thứ ba nguyên với ZIP đầu vào; chỉ version app root thay. Không SQL mới. Source ZIP sạch, không dependencies/build/private input.

## Kiểm chứng và giới hạn

Xem TEST_RESULTS/VALIDATION hiện hành. Test mới chạy trên source và production bundle với timer event, PGlite RPC, CSS DOM scope và native ID thay thứ tự. Startup test giữ cold gate4.7s/failed cold và thêm warm failure không splash theo yêu cầu mới. Không coi test DOM là kiểm chứng pixel iPhone; chưa deploy/push, chưa truy cập DB production.
