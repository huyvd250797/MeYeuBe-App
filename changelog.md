# Changelog

## V7.4.0 - Daily Care Stats & Charts

### Added
- Dashboard hiển thị giờ Việt Nam GMT+7 dạng HH:mm:ss và tự cập nhật realtime.
- Block Chăm sóc hôm nay trên Dashboard có thể bấm để mở Thống kê chăm sóc hằng ngày.
- Thống kê chăm sóc cho phép bấm từng loại để xem danh sách record chi tiết.
- Bổ sung biểu đồ chăm sóc theo ngày, theo tuần và theo tháng cho các loại: bé bú, hút sữa, ngủ, tã, tè, phân.

### Data
- Giữ nguyên DB key `meYeuBePWA_v4`.
- Không thay đổi cấu trúc dữ liệu `careEvents` và `milkInventory`.

## V7.3.0 - Daily Care & Milk Inventory

### Added
- Module Chăm sóc hằng ngày: Ghi nhận, Nhật ký chăm sóc, Thống kê.
- Ghi nhận Bé bú, Hút sữa, Ngủ, Thay tã, Đi tè, Đi phân.
- Kho sữa tự động tạo khi ghi nhận Hút sữa.
- Bé bú từ kho sữa sẽ tự trừ lượng sữa đang bảo quản.
- Dashboard hiển thị tổng chăm sóc hôm nay: bú, hút sữa, kho sữa, tã, phân, ngủ.

### Data
- Thêm `careEvents` và `milkInventory` vào localStorage hiện tại.
- Giữ nguyên DB key `meYeuBePWA_v4`.

# V7.2 - HealthBook Vaccine & Birthday

- Dashboard: nếu đã có ngày sinh bé thì hiển thị Ngày sinh thay cho Thai khi sinh.
- Dashboard: bổ sung dòng “Còn N ngày đến sinh nhật” và chỉ hiển thị khi N <= 7.
- Sổ sức khỏe điện tử: bổ sung Vaccine / Tiêm chủng dạng nhiều dòng gồm Vaccine, Mũi thứ, Ngừa bệnh / Mục đích.
- Sổ sức khỏe: vẫn tương thích dữ liệu vaccine cũ (`vaccine`, `vaccinePurpose`) và bổ sung mảng `vaccines` cho dữ liệu mới.
- Giữ nguyên DB key `meYeuBePWA_v4`.

# V7.1 - Dashboard Redesign

- Redesign Dashboard theo mẫu Option 3 Control Center.
- Gom thông tin hôm nay, tuổi bé, hồ sơ sinh, lịch khám sắp tới, thao tác nhanh và cập nhật mới nhất vào một giao diện gọn hơn.
- Bổ sung darkmode tương thích cho Dashboard mới.
- Giữ nguyên DB key `meYeuBePWA_v4`.
- Không thay đổi cấu trúc dữ liệu cũ.

# Changelog

## V7.0 - UX Polish
- Bổ sung splash screen logo Bé Bún nè trong 1 giây khi mở app.
- Bổ sung nút mũi tên lên đầu trang khi scroll xuống quá một màn hình.
- Màn hình Xem nhật ký: nút Thống kê có trạng thái active để nhận biết đang xem thống kê.
- Thống kê nhật ký mặc định Expand, cho phép Collapse/Expand theo Loại nhật ký và theo Ngày.
- Màn hình Xem lịch: bộ điều hướng Trước / Theo tuần-tháng / Sau nằm ngay trong block lịch, đổi chế độ xem trực tiếp tại đây.
- Giữ nguyên DB key meYeuBePWA_v4, không đổi cấu trúc dữ liệu.

## V6.9 - Calendar Navigation & Diary Stats by Date
- Di chuyển nút Trước/Sau vào block lịch tại màn hình Xem lịch.
- Thống kê nhật ký nhóm theo Loại nhật ký và tiếp tục nhóm theo Ngày.
- Giữ nguyên DB key meYeuBePWA_v4, không đổi cấu trúc dữ liệu.

# CHANGELOG

## V6.8 - UX & Diary Experience

- Dựa trên source V6.7 mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Màn hình Xem nhật ký: bổ sung thao tác vuốt sang trái để hiển thị nút Xóa.
- Xóa nhật ký có xác nhận Có/Không, có hiệu ứng trượt trái, mờ dần và danh sách tự đôn lên.
- Bổ sung Toast Messenger dùng chung cho thao tác thành công/thất bại/cảnh báo.
- Màn hình Xem nhật ký: bổ sung nút Thống kê, nhóm nhật ký theo Loại nhật ký.
- Màn hình Xem lịch khám: bổ sung mũi tên xem tuần/tháng trước và tuần/tháng sau.
- Danh sách lịch khám: bổ sung chức năng Sao chép lịch khám.
- Sổ sức khỏe: bổ sung trường `Ngừa bệnh / Mục đích` để ghi chú vaccine/phòng bệnh.
- Không thay đổi cấu trúc dữ liệu cũ; chỉ bổ sung trường mới và vẫn tương thích dữ liệu cũ.

## V6.7 - Time Range Inputs

- Dựa trên source V6.6 mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Hiệu chỉnh các trường chọn giờ sang dạng `Từ giờ` và `Đến giờ`.
- Bắt buộc nhập `Từ giờ` tại các màn hình nhập dữ liệu có giờ như Nhật ký và Lịch khám.
- Nếu dữ liệu cũ chỉ có trường `time`, hệ thống vẫn đọc và hiển thị như `Từ giờ` để không mất dữ liệu cũ.
- Khi lưu dữ liệu mới, hệ thống lưu thêm `timeFrom` và `timeTo`, đồng thời giữ `time` tương thích với dữ liệu cũ.
- Hiển thị khoảng giờ ở danh sách, dashboard, cuốn nhật ký và lịch tuần/tháng.
- Không thay đổi cấu trúc các module cũ ngoài việc bổ sung trường giờ kết thúc.

## V6.5 - Diary Book Edit

- Tại màn hình Xem nhật ký, cho phép chạm vào từng trang nhật ký để mở giao diện sửa.
- Tự động fill dữ liệu nhật ký đang chọn lên form Thêm/Sửa nhật ký.
- Khi lưu sẽ cập nhật đúng bản ghi nhật ký hiện tại, không tạo dòng mới.
- Sau khi lưu sẽ quay lại màn hình Xem nhật ký và hiển thị dữ liệu vừa cập nhật.
- Không đổi DB key `meYeuBePWA_v4`.
- Không thay đổi cấu trúc dữ liệu cũ.

## V6.4 - Lock Pregnancy Age After Birth

- Khi đã nhập ngày sinh bé, tuần thai trên Dashboard được chốt theo ngày sinh bé, không tiếp tục tăng theo ngày hiện tại.
- Không đổi DB key `meYeuBePWA_v4`.
- Không thay đổi cấu trúc dữ liệu cũ.

## V6.3 Birth Info & Girl Icon

- Dựa trên source V6.2 mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Bổ sung trường `Giờ sinh bé` trong Thiết lập hồ sơ.
- Bổ sung trường `Bệnh viện sinh` trong Thiết lập hồ sơ.
- Dashboard hiển thị giờ sinh và bệnh viện sinh nếu đã nhập dữ liệu.
- Đổi icon cạnh tên bé ở Dashboard thành icon bé gái.
- Đổi icon loading thành icon bé gái.
- Cập nhật manifest/service worker version để hạn chế cache bản cũ sau khi deploy.
- Không thay đổi cấu trúc các module cũ và không đổi DB key.

## V6.2 Schedule UX Stability Fixes

- Dựa trên source V6.1 mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Hiệu chỉnh Xem lịch theo tuần: tuần bắt đầu Thứ 2 và kết thúc Chủ nhật, dùng ngày local để tránh lệch ngày trên iPhone.
- Bổ sung/cập nhật `apple-touch-icon.png`, `favicon.png`, manifest và cache version để khắc phục lỗi Add to Home Screen không nhận logo.
- Khi mở navbar/sidebar, khóa scroll nền bên ngoài; chỉ cho scroll nội dung bên trong navbar.
- Block `Lịch khám sắp tới` trên Dashboard có thể tap để mở màn hình `Xem lịch`.
- Thêm hiệu ứng loading khoảng 0.5s khi chuyển màn hình từ navbar/submenu.
- Giữ nguyên các module và dữ liệu hiện có, không đổi cấu trúc DB.



## V6.1 Schedule UI Fixes

- Dựa trên source V6.0 mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Hiệu chỉnh UI Dashboard: tên lịch khám sắp tới xuống dòng riêng dưới tiêu đề.
- Di chuyển block Trạng thái nhanh xuống cuối Dashboard.
- Chặn xoá Loại lịch khám nếu đã được sử dụng trong dữ liệu lịch khám.
- Cho phép scroll navbar/sidebar khi nội dung vượt chiều cao màn hình.
- Fix lỗi sửa lịch khám bị tạo thêm dòng mới bằng cách giữ đúng hidden edit index, kể cả dòng đầu tiên index 0.
- Hiệu chỉnh Xem lịch theo tháng thành dạng calendar có thứ trong tuần và ô ngày.
# V6.0 - Schedule & Categories

- Dựa trên source mới nhất do Boss upload: V5.11 Copy Row.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Bổ sung module `Lịch khám` với submenu:
  - Thêm lịch
  - Danh sách
  - Xem lịch
- `Thêm lịch` có combobox `Loại lịch`, lấy dữ liệu từ module `Danh mục → Loại lịch khám`.
- `Danh sách` hiển thị lịch theo dạng dòng, có sửa/xóa.
- `Xem lịch` hỗ trợ xem theo tuần và theo tháng, không mở tab mới.
- Dashboard tự hiển thị lịch khám sắp tới và số ngày còn lại nếu có dữ liệu lịch.
- Nếu chưa có lịch khám sắp tới, dashboard không hiển thị block lịch.
- Bổ sung module `Danh mục` với submenu `Loại lịch khám`, cho phép thêm/sửa/xóa loại lịch khám.
- Cập nhật Service Worker cache version để giảm rủi ro publish vẫn dùng cache cũ.
- Không thay đổi dữ liệu/chức năng cũ ngoài việc bổ sung `appointments` và `appointmentTypes`.

# V5.11 - Copy Row

- Dựa trên source mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Bổ sung nút `Sao chép` cho:
  - Nhập chỉ số thai kỳ
  - Nhập chỉ số sau sinh
  - Thêm nhật ký
- Khi sao chép, dữ liệu của dòng được chọn được fill lên form thêm mới.
- Khi bấm lưu sau khi sao chép, hệ thống tạo một dòng mới.
- Khi bấm hủy/làm mới sau khi sao chép, không tạo dòng mới.
- Không thay đổi logic sửa/xóa và không thay đổi cấu trúc dữ liệu cũ.



## V5.9 Health Book History

- Dựa trên source mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Sổ sức khỏe bổ sung Họ tên và Ngày sinh cho từng đối tượng.
- Khi lưu/sửa sổ sức khỏe, hệ thống ghi nhận lịch sử cập nhật trong `historyLogs`.
- Sửa sổ sức khỏe là cập nhật bản ghi hiện tại, không tạo dòng mới.
- Màn hình Xem sổ sức khỏe hiển thị block theo đối tượng kèm lịch sử ghi nhận.
# V5.8 - Health Book

- Dựa trên source chuẩn V5.7 do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Bổ sung module `Sổ sức khỏe` tại navbar.
- `Sổ sức khỏe` có submenu:
  - Thêm sổ sức khỏe
  - Xem sổ sức khỏe
- Khi thêm sổ sức khỏe cho phép chọn đối tượng: Bố, Mẹ, Con.
- Bổ sung các trường sức khỏe: ngày cập nhật, nhóm máu, chiều cao, cân nặng, BMI/chỉ số liên quan, dị ứng, tiền sử bệnh, thuốc đang dùng, vaccine, bác sĩ/bệnh viện, BHYT/mã hồ sơ, ghi chú.
- Màn hình xem sổ sức khỏe hiển thị các block tương ứng theo từng đối tượng.
- Không thay đổi dữ liệu cũ; chỉ bổ sung mảng `healthBook`.

# V5.7 - New Logo

- Thay logo app/PWA bằng logo Bé Bún nè do Boss cung cấp.
- Cập nhật icon-192.png, icon-512.png, apple-touch-icon.png và favicon.png.
- Không thay đổi logic dữ liệu, không đổi localStorage key.

## V5.6 - Diary Book + Dark Charts

- Dựa trên source chuẩn V5.5 do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Hiệu chỉnh màu chữ/đường/dot trong biểu đồ để tương thích dark mode, tránh chữ đen khó nhìn.
- Chuyển module Nhật ký thành menu có submenu:
  - Thêm nhật ký
  - Xem nhật ký
- Bổ sung trang Xem nhật ký dạng cuốn sách, hiển thị nội dung liên tục từ trên xuống kèm ngày giờ/phân loại.
- Không đổi cấu trúc dữ liệu cũ; tiếp tục dùng mảng `diary` hiện tại.

## V5.5 - Safe Edit, Delete Guard, Growth Charts

- Fix lỗi sửa dữ liệu: xử lý đúng index 0, cập nhật dòng hiện tại thay vì thêm mới.
- Thêm quy trình xoá dữ liệu an toàn: cảnh báo, nhập XOADULIEU, đếm ngược 5 giây, có thể huỷ.
- Thêm màn hình biểu đồ phát triển cho Thai kỳ và Sau sinh, load nội bộ không mở tab mới.
- Giữ nguyên key dữ liệu localStorage: meYeuBePWA_v4.

## V5.2 Theme + Stat Info

- Thêm toggle dark/light ở góc phải header.
- Tap tên app “Mẹ Yêu Bé” để về Dashboard.
- Chỉnh màu countdown trong dark mode cho dễ nhìn.
- Trong Thống kê thai kỳ, tap tiêu đề chỉ số để xem giải thích.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Không xóa/chuyển đổi dữ liệu cũ.


## V5.3 Baby Stats + Official Name

- Dựa trên source chuẩn mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Bổ sung submenu cho mục Sau sinh:
  - Nhập chỉ số
  - Thống kê
- Bổ sung màn hình Thống kê chỉ số sau sinh.
- Dashboard hiển thị Tên chính thức và cho phép ẩn/hiện.
- Thêm tuỳ chọn hiển thị Tên chính thức trong Thiết lập.
- Không xoá/chuyển đổi dữ liệu cũ.


## V5.4 Diary

- Dựa trên source chuẩn mới nhất do Boss upload.
- Giữ nguyên localStorage key: `meYeuBePWA_v4`.
- Dashboard mục Hôm nay hiển thị thêm Thứ.
- Bổ sung menu Nhật ký trên navbar.
- Bổ sung màn hình Nhật ký để thêm/sửa/xóa sự kiện hằng ngày của mẹ và bé.
- Không đổi cấu trúc dữ liệu cũ; chỉ bổ sung mảng `diary` khi normalize dữ liệu.


## V6.5 DiarySort Data Update - 2026-06-28
- Bổ sung dữ liệu nhật ký ngày 27/06/2026 còn thiếu.
- Bổ sung dữ liệu đầu ngày 28/06/2026.
- Bỏ qua dữ liệu nhật ký trùng khi cập nhật DB.
- Sắp xếp nhật ký trong DB theo mới nhất → cũ nhất.
- Dashboard lấy đúng Nhật ký mới nhất theo ngày/giờ.
- Lịch sử nhật ký trong mục Thêm nhật ký hiển thị mới nhất → cũ nhất.
- Giữ nguyên key dữ liệu cũ, tương thích import V6.4/V6.5.


## V6.6 Diary Category & Navigation
- Bổ sung Danh mục → Loại nhật ký.
- Thêm/Sửa nhật ký bắt buộc chọn Loại nhật ký từ danh mục.
- Không cho xoá Loại nhật ký nếu đã có nhật ký sử dụng.
- Xem nhật ký: bỏ dòng hướng dẫn chạm để sửa, chạm trực tiếp vào nhật ký để cập nhật.
- Thêm nút quay lại từ màn hình cập nhật nhật ký về đúng Cuốn nhật ký và highlight bằng border.
- Dashboard: click Nhật ký mới nhất để mở Cuốn nhật ký và highlight đúng nhật ký.
- Giữ nguyên DB key meYeuBePWA_v4.
