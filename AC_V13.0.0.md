# Acceptance Criteria — MeYeuBe V13.0.0 · Family Sharing (Chia sẻ gia đình)

## Tương thích ngược
- [ ] Gia đình chưa từng bấm "Bật Chia sẻ gia đình": không có màn đăng nhập nào hiện ra, mọi thao tác hoạt động y hệt V12.2.1 (không giới hạn quyền gì).

## Bật Chia sẻ gia đình & hồ sơ Chủ tài khoản
- [ ] Vào Thiết lập → "Bật Chia sẻ gia đình" → nhập tên/biểu tượng/PIN (tuỳ chọn) → tạo hồ sơ Chủ tài khoản, tự bật Cloud Sync nếu chưa bật.
- [ ] Sau khi bật, menu xuất hiện nhóm "👪 Gia đình" (Thành viên/Nhật ký gia đình/Phân quyền) và nút "Đổi người dùng".

## Đăng nhập theo hồ sơ
- [ ] Mở lại app khi đã có ≥1 thành viên và thiết bị chưa chọn hồ sơ: hiện màn "Ai đang dùng MeYeuBe?" liệt kê các hồ sơ đang hoạt động.
- [ ] Chọn hồ sơ có đặt PIN: yêu cầu nhập đúng PIN mới vào được; sai PIN báo lỗi, không vào được.
- [ ] Chọn hồ sơ không đặt PIN: vào thẳng.
- [ ] "Đổi người dùng" quay lại màn chọn hồ sơ.

## Mời thành viên (Link/QR)
- [ ] Chủ tài khoản vào "Thành viên" → "+ Mời thành viên" → nhập tên + chọn vai trò → sinh Link và mã QR.
- [ ] Mở Link mời trên thiết bị khác (chưa cấu hình Cloud Sync): tự động cấu hình đồng bộ, tải dữ liệu gia đình, hiện màn xác nhận tham gia đúng vai trò được mời, cho đặt tên hiển thị + PIN riêng.
- [ ] Sau khi xác nhận tham gia: thành viên mới xuất hiện trong danh sách Thành viên trên mọi thiết bị (sau khi đồng bộ), lời mời chuyển trạng thái "đã chấp nhận".
- [ ] Lời mời hết hạn hoặc đã bị huỷ: mở link báo "không hợp lệ hoặc đã hết hạn".

## Phân quyền theo vai trò (mặc định đúng theo spec)
- [ ] Chủ tài khoản: toàn quyền (Thêm/Sửa/Xóa/Xem thống kê/Xem Kho sữa/Backup/Restore/Cấu hình/Quản lý thành viên).
- [ ] Cha, Mẹ: Thêm/Sửa/Xóa/Xem thống kê được; Backup và Cấu hình bị chặn (ẩn nav + chặn hành động nếu cố truy cập).
- [ ] Ông, Bà: Thêm được; Sửa và Xóa đều bị chặn (kể cả bản ghi họ vừa tạo); Xem thống kê/Kho sữa vẫn được trừ khi Chủ tài khoản tắt riêng.
- [ ] Người chăm bé: Thêm được, Sửa được **nhưng chỉ với bản ghi trong ngày hôm nay** (bản ghi ngày khác bị chặn sửa); Xóa bị chặn; không thấy trang Backup/Cloud Sync/Cấu hình Dashboard trong menu.
- [ ] Chủ tài khoản vào trang "Phân quyền" bật/tắt từng khả năng cho từng vai trò (ví dụ tắt "Xem thống kê" của Ông, tắt "Xem Kho sữa" của Bà) → lưu lại và áp dụng ngay.

## Nhật ký người thao tác & Audit Log gọn
- [ ] Mở chi tiết một bản ghi (Bé bú/Hút sữa/Kho sữa/Ngủ/Thay tã/Thuốc/Nhiệt độ/Trớ sữa/Milestone/Nhật ký/Lịch khám) đã có thành viên tạo: hiện dòng "[icon] [Tên] đã ghi nhận · [thời gian]"; nếu có người khác sửa sau đó, hiện thêm dòng "đã sửa gần nhất".
- [ ] Trang "Nhật ký gia đình" liệt kê các hoạt động gần đây, mới nhất lên đầu, dạng "[icon] [Tên] đã ghi nhận/đã sửa/đã xóa — [tóm tắt ngắn]" kèm thời gian tương đối.
- [ ] Sửa một giá trị số (ví dụ lượng bú) hiện tóm tắt dạng "70 → 80 ml" trong nhật ký.

## Thông báo đẩy hoạt động gia đình
- [ ] Khi bật Cloud Sync + Push trên ≥2 thiết bị cùng gia đình: thiết bị A ghi nhận, thiết bị B (không phải thiết bị vừa thao tác) nhận được thông báo đẩy "[icon] [Tên] vừa ghi nhận: [tóm tắt]".
- [ ] Thông báo hoạt động gia đình không bị chặn bởi cấu hình loại cảnh báo Smart Alert đã tắt trên thiết bị.

## Không hồi quy
- [ ] Toàn bộ chức năng Search (V12.2.x), Kho sữa, Milestone, Nhật ký, Lịch khám, Cloud Sync, Push Notification hoạt động như trước với gia đình chưa bật Chia sẻ.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V12.2.1 không thay đổi (đối chiếu `BASELINE_LOCK_V13.0.0.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
