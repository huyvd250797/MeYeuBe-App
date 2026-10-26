# V17.0.0 — Care Workflow

## Phạm vi

Giữ nháp form chăm sóc trên thiết bị, cải thiện phần xem trước bú/hút, sửa đúng ID và quay lại nơi mở form, xác minh kết quả chưa nhận ACK bằng thao tác đọc, gửi lại có chủ đích bằng đúng operation ID. Giữ timer bú hiện có và nháp ngày/giờ kết thúc của popup timer. Không có chức năng mẫu ghi nhận. Nền SQL V15.4 đã có OCC, atomic milk ledger, journal và Undo; không tạo migration hoặc thay Edge Functions trong V17.0.

## Cách sử dụng

- ＋ → Bé bú/Hút sữa/loại chăm sóc khác → nhập nội dung. Khi có thay đổi, form hiện “Đã giữ bản nháp trên thiết bị. Chưa lưu lên Cloud.” Đóng form hoặc chuyển màn hình không ghi nghiệp vụ. Mở lại cùng loại/bản ghi → Tiếp tục bản nháp hoặc Bỏ nháp và nhập mới. Màn Ghi nhận chăm sóc có danh sách nháp để mở lại, kể cả nháp sửa bản ghi không còn trong danh sách đang tải.
- Nháp giữ nguyên ngày/giờ đã nhập, không tự đổi sang hôm nay. Kiểm tra trước khi lưu. Khi sao chép bản ghi, ngày/giờ là lần mới, nguồn sữa phải chọn lại, không tái sử dụng liên kết kho hoặc ID của cữ cũ. Sao chép hiện có không phải mẫu.
- Bú từ kho: ô lượng là lượng lấy ra; xem Tổng lấy từ bình/túi, Bé thực bú, Thừa/hủy sau bú. Nếu chọn hủy phần còn lại trong bình/túi, dòng hủy thêm riêng thể hiện số đó. Sữa thừa sau bú và hủy phần còn lại không được cộng chung rồi ghi sai lượng bé bú. Ví dụ lấy130 ml, thừa10 ml → bé bú120 ml. Nếu nguồn chỉ đủ100 ml nhưng ô yêu cầu130 ml, phải chọn thêm hoặc sửa lượng; không âm thầm lưu100 ml. Hạn dùng/trạng thái/số dư được kiểm tra lại ở server khi ghi. Nháp không giữ chỗ hoặc khóa sữa.
- Hút sữa: xem lại lượng, bình/túi và vị trí trước lưu. Luồng hiện hữu tạo mới vẫn dùng quy tắc Ngăn mát/24 giờ, không mở thêm cấu hình hạn dùng tùy ý. Không giảm tổng lượng xuống dưới phần đã dùng. Hút và kho được xác nhận bởi cùng thao tác SQL hiện có.
- Ngày bắt đầu | Từ giờ; Ngày kết thúc | Đến giờ giữ hai dòng hai cột theo CSS hiện hành. Ghi chú và các input được giữ theo loại form.
- Bấm Lưu: chỉ báo thành công khi ACK hợp lệ. Lưu thành công xóa nháp tương ứng, trả về trang/bộ lọc/vị trí đã mở form; sửa từ Kho sữa trở lại popup kho. Dùng thông tin ID/phiên bản đã chụp khi mở form, không lấy lại record bằng index sau realtime sắp xếp.
- Nếu timeout/mất mạng/HTTP5xx/phản hồi ghi không đọc được: giữ command, operation ID và nháp. Bấm Kiểm tra kết quả lưu: chỉ gọi RPC đọc. Nếu đã lưu, nhận kết quả và cập nhật kho. Nếu chưa thấy kết quả, cho bấm Gửi lại nguyên thao tác. Nút này gửi đúng command và operation ID đã giữ; không tự gửi nội dung mới vừa gõ. Việc chưa thấy kết quả không chứng minh request cũ đã ngừng chạy; SQL idempotency bảo vệ khi cả hai tới server.
- Nếu sửa nội dung sau timeout: khi xác nhận thao tác cũ đã lưu, giữ phần sửa thêm trong nháp. Nếu phiên bản server phù hợp đúng một lần ghi vừa xác nhận, chuyển thành nháp sửa của chính record đó, không tạo record thứ hai. Nếu có thay đổi xen kẽ/nháp sửa khác, giữ riêng nội dung và yêu cầu đối chiếu; không tự rebasing để ghi đè người khác.
- Timer bú: bắt đầu bằng timer hiện có. Popup kết thúc nhớ ngày/giờ đang nhập trên thiết bị theo kết nối. Lưu lỗi giữ timer. Chỉ xóa timer tương ứng khi database xác nhận. Timer không đồng bộ xuyên thiết bị và bản này không thêm timer hút/ngủ.
- Hoàn tác: giữ API nghiệp vụ hiện có. App chặn bấm lặp trong lúc xử lý; database kiểm tra dữ liệu phụ thuộc và phiên bản. Nếu sữa đã được dùng/chuyển tiếp, giải thích lỗi và giữ nguyên dữ liệu. Xác minh một thao tác Undo sau timeout không tạo nút hoàn tác Undo mới.

## Giới hạn nháp và bảo vệ dữ liệu

`src/features/care/drafts.js` dùng khóa localStorage `mybCareDraft_v1700:<target>:<new:type|edit:id>`. Target là URL Supabase đã chuẩn hóa và Sync ID; không chứa API key. Mỗi nháp có revision và schema1. Chặn tab cũ ghi đè/xóa revision mới từ tab khác. Đây là kiểm tra local best effort, không phải khóa giao dịch giữa các tab; ghi nghiệp vụ vẫn được bảo vệ bởi server OCC/idempotency.

Nháp mỗi mục giới hạn100.000 ký tự JSON. Khi quota/disabled storage hoặc dữ liệu hỏng, không báo đã giữ nháp, giữ form và cảnh báo trước khi đóng/chuyển form. Bỏ nháp hỏng chỉ thực hiện sau người dùng xác nhận. Có beforeunload cảnh báo best effort; iOS có thể không phát sự kiện khi OS đóng app. Nháp được lưu ngay theo input/change và sau chip/picker click; không đợi đóng app mới lưu.

Nháp không tự gửi, không tự hết hạn/xóa, không thay backup Cloud. Không bảo đảm tồn tại nếu người dùng xóa dữ liệu trình duyệt, OS thu hồi storage, đổi trình duyệt/thiết bị hoặc đang ở phiên riêng tư. Bản này chỉ lưu form chăm sóc chính và ngày/giờ popup kết thúc timer; không tuyên bố lưu nháp mọi màn hình khác/transfer popup/health/media. File đính kèm không được ghi vào nháp này.

`src/features/care/workflow.js` sở hữu nháp, tóm tắt và điều hướng; `src/features/care/ui.js` tiếp tục điều phối ACK; `src/data/care-repository.js` thêm verify chỉ đọc. Không tính lại kho bằng toàn bộ lịch sử trên client. Quy tắc lượng/nguồn/Undo chạy trên SQL hiện hữu.

## Kiểm thử và xác minh thực tế

`npm test` chạy toàn bộ hồi quy. Bộ care-workflow thực thi form/bridge/repository trong jsdom với PGlite, REST giả nối vào SQL thật của fixture, mô phỏng mất ACK sau commit/502/JSON hỏng trước khi UI nhận, resend cùng mã, nháp nhiều nguồn, sửa sau timeout, version xung đột, scroll, timer, quota và nháp hỏng. Một document độc lập nhận storage đã lưu để thử khởi tạo lại care runtime. Đây không phải WebKit/Safari hay production.

Trên gia đình test sau deploy: kiểm tra iPhone PWA sáng/tối, hai cột date/time khi mở bàn phím, đóng/mở app và nháp, mốc qua nửa đêm, back/đóng popup, hai thiết bị chọn cùng sữa, mạng ngắt trong lúc lưu, Undo khi đã có phụ thuộc, cập nhật PWA khi còn pending. Không dùng dữ liệu sản xuất để thử phá hủy. Các checklist này chưa được thực hiện trong môi trường thật ở phiên xây dựng.
