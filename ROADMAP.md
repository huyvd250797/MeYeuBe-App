# Mẹ Yêu Bé — Roadmap cải thiện và nâng cấp

Ngày lập: 25/10/2026. Nền source: MeYeuBe-App-V15.1.0(1).zip, build 15.1.0.

Trạng thái: V15.2.0 đã triển khai phần source và kiểm thử local; việc kiểm chứng production/schema thực tế còn chờ quyền truy cập. Các phiên bản sau là dự kiến. Đây là kế hoạch phát triển từ đúng source đã rà soát, không phải xác nhận các tính năng dự kiến đã tồn tại hoặc đã được kiểm thử.

## 1. Mục tiêu và nguyên tắc

- Supabase relational tables là nguồn dữ liệu chính. Đọc theo màn hình, ngày, đối tượng và phạm vi cần thiết; tạo/sửa/xóa theo ID.
- Một thao tác nghiệp vụ có thể cập nhật nhiều bảng trong một transaction tại backend/database. Client gọi API hoặc RPC theo nghiệp vụ; không cần tạo một server trung gian riêng cho mọi truy vấn đơn giản nếu quyền truy cập đã được bảo vệ đúng.
- Không gửi nguyên trạng thái app để so sánh, merge hoặc ghi đè toàn bộ dữ liệu. JSON request/response và JSON export dự phòng vẫn được dùng như định dạng truyền/xuất dữ liệu.
- Realtime chỉ làm mới phần bị ảnh hưởng; trạng thái form đang nhập và thao tác chưa xác nhận phải được bảo vệ.
- Tách component, nghiệp vụ, truy cập dữ liệu và hạ tầng; mỗi hành vi nền tảng có một nơi xử lý chính.
- Nâng cấp tăng dần trên source hiện tại, bảo toàn dữ liệu và các tính năng đang dùng. Schema thay đổi bằng migration bổ sung; không reset production hay chạy lại restore lịch sử.
- Giữ PWA. Giả định của kế hoạch: cần mạng để xác nhận ghi dữ liệu. Khi mất mạng, giữ bản nháp và báo chưa lưu; không tự gửi lại một thao tác chưa xác định kết quả. Nhập dữ liệu offline có queue đồng bộ là tùy chọn riêng, chưa nằm trong phạm vi mặc định.
- Không mặc định chuyển toàn bộ sang React hay nâng mọi dependency. Tổ chức ES modules và kiểu dữ liệu trước; chọn và kiểm tra phiên bản công cụ khi thực hiện. Có thể chuyển TypeScript từng module nếu đem lại lợi ích kiểm tra hợp đồng dữ liệu.
- Các chức năng mở rộng ở V17.x là đề xuất sau khi nền tảng ổn định, cần ưu tiên lại theo nhu cầu thực tế trước khi xây dựng.

## 2. Căn cứ từ source

- app.js: 16.625 dòng, gom UI, dữ liệu, nghiệp vụ, lưu trữ và nhiều lớp vá; có 12 lần gán ghi đè window.save và 7 lần gán ghi đè window.normalize trong riêng file này.
- index.html: 4.832 dòng, 29 khối style, 261 thuộc tính sự kiện trực tiếp và khoảng 2.398 lần !important.
- relational-v1577.js nạp sau app.js, thay các hàm nền tảng để dùng relational RPC. Ghi hiện tại đã chuyển sang entity deltas; đọc vẫn export trạng thái toàn app. Vì vậy đây là hoàn thiện kiến trúc database trực tiếp, không phải bắt đầu chuyển JSON sang Supabase từ đầu.
- Các kiểm tra cú pháp JavaScript đã chạy thành công; bài test V15.1.0 đạt 16/16. Những kết quả đó chưa xác minh database production.
- release_check.py hiện thất bại vì thiếu SQL/tài liệu và có quy tắc của các phiên bản cũ. Các test giao diện cũ nạp app.js mà chưa nạp file đồng bộ cuối cùng.
- Mô phỏng riêng module đồng bộ bằng dữ liệu giả đã tái hiện: thay đổi sau khi mở app offline có thể không vào queue và bị thay bởi dữ liệu server khi online; queue tạo ở Sync ID A có thể gửi sang B sau khi đổi cấu hình. Chưa tái hiện hai trường hợp này trên production.
- ZIP thiếu một số định nghĩa schema/RPC đang được client sử dụng. Cần thu thập định nghĩa thực tế trước khi viết migration; không suy đoán hoặc tự tạo lại database production.
- SQL hotfix còn chứa RPC phục hồi SECURITY DEFINER được cấp execute cho anon; cần kiểm tra quyền đang được cài trên database. Không thể kết luận cấu hình production chỉ từ ZIP.
- Tài liệu Sổ sức khỏe có thể chỉ chứa blobKey tới file trong IndexedDB. Phải bảo toàn byte file trên các thiết bị trước khi dọn cache hoặc bỏ cơ chế cũ.

## 3. Roadmap tổng thể — 24 phiên bản

Tất cả hàng dưới đây đều có trạng thái **Dự kiến**. Một phiên bản chỉ được đổi sang Hoàn thành sau khi có source, migration liên quan, tài liệu và bằng chứng kiểm tra.

| Phiên bản | Mục tiêu | Chức năng chính | Công việc kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc và thứ tự |
| --- | --- | --- | --- | --- | --- |
| V15.2.0 — Foundation & Data Safety | Có nền nâng cấp kiểm chứng được | Giữ luồng đang dùng; trạng thái chưa lưu rõ ràng; bảo vệ đổi cấu hình | Kiểm kê schema/RPC/cache/queue/file; test runtime thật; định danh queue theo đích; ngăn dữ liệu offline chưa gửi bị ghi đè; chuẩn hóa môi trường và release check | Dữ liệu thử không mất khi offline/online; queue không sang nhầm family/project; chạy được test nền và đối chiếu dữ liệu | Đầu tiên; cần schema/RPC thực tế để hoàn thiện phần database |
| V15.3.0 — Authentication & Data Isolation | Dữ liệu gia đình được bảo vệ ở server | Đăng nhập, phiên làm việc và quyền truy cập cơ bản | Supabase Auth, liên kết user–family, RLS, quyền RPC; siết RPC phục hồi và Edge Functions; ánh xạ dữ liệu cũ có kiểm chứng | Người ngoài không đọc/ghi được dữ liệu gia đình; chủ dữ liệu hiện tại vẫn truy cập đúng; service role không có ở frontend | Sau V15.2; chốt phương thức đăng nhập và cách gắn gia đình hiện có trước khi triển khai |
| V15.4.0 — Data Access Foundation | Có lớp truy cập dữ liệu thống nhất | CRUD trực tiếp cho danh mục bình/túi và loại lịch/nhật ký làm luồng mẫu | API/repository theo module; hợp đồng dữ liệu; ID ổn định; lỗi chuẩn; kiểm tra phiên; chống gửi lặp; dựng module/build và lockfile | CRUD mẫu chỉ tác động bản ghi đích; không gọi snapshot write; test được repository độc lập UI | Sau V15.3; bảo vệ luồng cũ của các module chưa chuyển |
| V15.5.0 — Care & Milk Transactions | Ghi nhận chăm sóc và kho sữa nhất quán | Thêm/sửa/xóa cữ bú, hút sữa, chuyển sữa; ngủ, tã, nhiệt độ; danh sách theo ngày | RPC transaction, ledger/số dư, kiểm tra quyền và số dư trên server; khóa hoặc kiểm soát cạnh tranh; idempotency key; đọc phân trang | Sửa/xóa cữ trả đúng sữa; không âm kho; lỗi giữa chừng rollback; hai thiết bị không trừ vượt; timeout không tạo trùng | Sau V15.4; care và milk được chuyển cùng một nhóm phụ thuộc |
| V15.6.0 — Health & Growth Direct Database | Hồ sơ sức khỏe và tăng trưởng dùng dữ liệu trực tiếp | Thành viên sức khỏe, số đo, vaccine, khám, thuốc, xét nghiệm; dữ liệu thai kỳ và số đo mẹ/bé hiện có | Repository theo thực thể; truy vấn theo người/thời gian; kiểm tra liên kết; bảo toàn ID, lịch sử và metadata file | Chỉnh một bản ghi không ghi lại cả hồ sơ; số liệu và biểu đồ đối chiếu khớp; không mất liên kết file | Sau V15.5; chuyển từng thực thể, không suy đoán schema thiếu |
| V15.7.0 — Diary, Appointments & Milestones | Các nội dung theo thời gian đọc/ghi theo phạm vi | Nhật ký, lịch hẹn, cột mốc, hành trình tháng, ghi chú tháng | CRUD và truy vấn theo khoảng ngày; tìm kiếm/phân trang; cấu trúc ghi chú tháng; giữ tham chiếu ảnh và nhắc lịch | CRUD và lọc khớp dữ liệu cũ; sửa/xóa không làm đổi dữ liệu ngoài phạm vi | Sau V15.6 |
| V15.8.0 — Profiles, Settings & Remaining Data | Mọi loại dữ liệu còn lại có nơi lưu rõ ràng | Hồ sơ, cài đặt, danh mục, dữ liệu cảm biến và lịch sử hoạt động đang có | Phân biệt tùy chọn thiết bị với dữ liệu dùng chung; rà soát đủ noise/lux/app members/activity log/permissions/invites; không đưa UI state vào bảng nghiệp vụ | Có ma trận đầy đủ từng trường–nơi lưu–API–quyền; không còn loại dữ liệu bị bỏ sót | Sau V15.7; quyền đã có nền ở V15.3 |
| V15.9.0 — Scoped Queries & Database Cutover | Toàn app hoạt động trên các truy vấn đúng phạm vi | Dashboard, thống kê ngày/tháng/năm, so sánh và các màn đọc còn lại | Aggregate theo family/người/ngày; index theo truy vấn thực tế; kiểm chứng toàn bộ module; chặn endpoint ghi snapshot cũ; thay export-state trong luồng sử dụng thường ngày | Mọi màn chính chạy không cần full-state export; tổng số và số dư khớp; không có đường ghi nguyên khối quay lại | Sau V15.8; mốc chuyển đổi database đầy đủ |
| V16.0.0 — Legacy Removal & Modular Core | Hoàn tất dọn kiến trúc lịch sử | App giữ các chức năng đã được kiểm chứng | Gỡ merge JSON, queue cũ, doctor/recovery khỏi runtime, chuỗi ghi đè hàm và script không dùng; tách entry/module; kiểm tra client cũ không còn ghi được | Không còn runtime phụ thuộc load/save toàn trạng thái; build từ source sạch; hồi quy đầy đủ; rollback tương thích schema mới | Sau V15.9; chỉ gỡ phần đã đối chiếu, không xóa dữ liệu legacy/backup tự động |
| V16.1.0 — Scoped Realtime | Thay đổi giữa thiết bị cập nhật đúng khu vực | Tự cập nhật dữ liệu liên quan khi thiết bị khác thao tác | Signal/invalidation theo entity/family; chống event trùng; phục hồi sau reconnect; quản lý vòng đời subscription; phát hiện xung đột sửa | Sửa một cữ không refetch toàn app; form đang nhập không bị thay; quyền subscription đúng gia đình | Sau V16.0; API và quyền đã ổn định |
| V16.2.0 — Component Architecture | Giao diện dễ sửa và tái sử dụng | Form/thẻ/timeline/picker và popup dùng cấu trúc chung | Tách UI theo feature; shared modal/bottom sheet/toast/loading/confirm; event binding thay inline; quản lý cleanup listener/timer | Tách được từng màn độc lập; không tăng listener theo số lần mở; hành vi cũ được giữ qua test | Sau V16.1; không gắn lại nghiệp vụ vào component |
| V16.3.0 — Design System & Theme | Giao diện nhất quán | Chuẩn hóa dark/light/system, màu cá nhân, font, spacing, form và trạng thái | Tách CSS, token giao diện, quy tắc component; giảm !important theo nhóm; xác định tùy chọn theo thiết bị hay tài khoản | Kiểm tra đủ theme và kích thước màn; không mất tương phản/chữ/nút; đổi theme không tải lại dữ liệu nghiệp vụ | Sau V16.2 |
| V16.4.0 — Performance & Efficient Rendering | Tải và thao tác mượt với dữ liệu lớn | Mở màn nhanh, cuộn lịch sử, biểu đồ và tìm kiếm gọn | Đo thời gian/truy vấn baseline; hạn chế tải thừa; hủy query cũ; cache có phạm vi; lazy loading; phân trang/virtualization khi đo thấy cần | Báo cáo trước–sau trên cùng bộ dữ liệu; mở một màn không truy vấn mọi module; kết quả cũ không ghi đè query mới | Sau V16.3; không cam kết số giây trước khi đo |
| V16.5.0 — PWA & Update Reliability | Cài đặt và cập nhật app tin cậy | Mở từ Home Screen; thông báo có bản mới; giữ nháp khi cập nhật | Cache app shell/assets có version; không trả HTML cho request JS; phạm vi cache/purge đúng app; tránh reload giữa thao tác | Update không xóa nháp/file/phiên; offline hiển thị trạng thái rõ; asset JS không nhận index.html; thử trên iOS/desktop | Sau V16.4 |
| V16.6.0 — Media & Attachment Storage | Ảnh/tài liệu truy cập được giữa thiết bị có quyền | Upload/xem/tải/xóa ảnh, file hồ sơ và tệp nhật ký | Supabase Storage private; đường dẫn theo family; signed URL; giới hạn và kiểm tra file; chuyển blob IndexedDB có đối chiếu; trạng thái upload | Thiết bị khác cùng quyền mở được file; ngoài gia đình bị chặn; file gốc chỉ được dọn sau khi đối chiếu upload thành công | Sau V16.5; giữ nguyên byte file local từ các mốc trước |
| V16.7.0 — Backup, Restore & Audit | Phục hồi dữ liệu có kiểm soát | Xuất dự phòng, xem trước import, đối chiếu và lịch sử thao tác | Backup có version; manifest ảnh/file; validate; import staging; transaction theo phạm vi; audit actor/thời gian/thực thể; quyền phục hồi riêng | Khôi phục thử được dữ liệu và tệp mẫu; file sai bị từ chối; không biến import thành merge/ghi đè toàn app tự động | Sau V16.6; hoàn thiện audit nền đã bắt đầu từ phiên bản ghi dữ liệu |
| V16.8.0 — Notifications & Reminder Reliability | Nhắc việc ổn định và dễ kiểm tra | Cấu hình loại nhắc, lịch sử gửi, thiết bị nhận, giờ yên lặng | Chung định nghĩa rule client/server; xác thực send/cron; chống gửi trùng; retry có giới hạn; dọn subscription hết hạn; truy vấn đúng phạm vi | Một sự kiện không gửi lặp ngoài cấu hình; lỗi tạm có thể retry; đổi dữ liệu hủy/điều chỉnh lịch nhắc; quyền endpoint được kiểm tra | Sau V16.7; nâng cấp hệ thống nhắc hiện có |
| V16.9.0 — Quality & Accessibility | Các luồng chính được bảo vệ bằng kiểm thử | Trải nghiệm bàn phím, đọc màn hình, lỗi/rỗng/loading thống nhất | Hồi quy tích hợp/E2E; RLS âm tính; cạnh tranh/timeout; kiểm tra focus, nhãn, giảm chuyển động; CI và kiểm soát secret | Các kiểm tra phát hành bắt buộc qua; có ma trận thiết bị và giới hạn đã xác minh; không chỉ kiểm tra token/chuỗi | Sau V16.8; test từng phần vẫn bắt buộc ngay từ V15.2 |
| V17.0.0 — Family Collaboration | Nhiều người chăm bé phối hợp rõ ràng | Mời thành viên, vai trò, thu hồi quyền, xem ai ghi nhận | UI quản lý thành viên trên nền quyền sẵn có; lời mời hết hạn; server recheck quyền; nhật ký thay đổi | Thu hồi quyền có hiệu lực với truy vấn/ghi/tệp mới; lời mời không tái sử dụng; tác giả bản ghi hiển thị đúng | Đề xuất sau V16.9; không phải bắt đầu bảo mật ở mốc này |
| V17.1.0 — Care Workflow Improvements | Ghi nhận hằng ngày ít thao tác hơn | Mẫu nhập, mặc định cá nhân, sửa nhanh, hoàn tác phù hợp, tiếp tục form nháp | Tận dụng component/API; undo bằng thao tác bù có điều kiện; tránh hoàn tác đè thay đổi mới từ người khác | Luồng bú/hút/ngủ/tã được đo và giảm thao tác; undo không sai kho; thông báo lưu đúng trạng thái | Sau V17.0; chốt những thao tác Boss dùng nhiều |
| V17.2.0 — Milk Inventory Insights | Quản lý kho và nguồn sữa rõ ràng | Tìm bình/túi, lọc trạng thái, lịch sử sử dụng/chuyển/đổ, nhắc hạn theo cấu hình | Aggregate ledger, tra cứu nguồn–đích, timeline số dư; tăng tốc picker theo số lượng thực tế | Báo cáo tồn bằng tổng nguồn dữ liệu chuẩn; truy vết được từng thay đổi; không tự sửa số dư từ giao diện | Sau V17.1; cải thiện module đã có, không tự đặt chỉ dẫn y tế |
| V17.3.0 — Health & Appointment Planning | Theo dõi sức khỏe và lịch dễ đối chiếu | Tìm hồ sơ theo người, lịch khám/tiêm đã khai báo, tài liệu liên quan, bộ lọc lịch sử | Liên kết appointment–record–file; trạng thái dự kiến/đã thực hiện; chuẩn hóa đơn vị và múi giờ; giữ lịch sử cập nhật | Lịch hẹn và hồ sơ liên quan khớp; nhắc lịch thay đổi đúng; không mất hồ sơ gốc khi sửa thông tin | Sau V17.2; các lịch/chỉ số chuyên môn cần nguồn được xác minh khi triển khai |
| V17.4.0 — Reports & Personalization | Tổng quan phản ánh đúng nhu cầu gia đình | Dashboard cá nhân, so sánh khoảng thời gian, báo cáo chia sẻ/xuất | Bộ lọc dùng chung, công thức thống kê thống nhất, tối ưu export; tùy chọn thiết bị/tài khoản rõ ràng | Số trên dashboard, báo cáo và danh sách khớp khi cùng phạm vi; export không lộ dữ liệu ngoài quyền | Sau V17.3; ưu tiên widget thực sự dùng |
| V17.5.0 — Stable Release & Maintenance | Có bản ổn định và quy trình bảo trì | Dọn điểm còn vướng, hướng dẫn sử dụng và phát hành | Đánh giá toàn hệ thống, restore drill, kiểm tra client cũ, tài liệu kiến trúc/API/database, dependency/secret scan và quy trình rollback | Phát hành tái lập được; các luồng cốt lõi qua kiểm tra; có hướng dẫn hỗ trợ và danh sách giới hạn thực tế | Sau các mốc V17.x đã chọn; phạm vi mở rộng có thể điều chỉnh theo nhu cầu |

## 4. Phạm vi chi tiết và kiểm tra bắt buộc theo nhóm

### 4.1 V15.2–V15.4: đặt nền trước khi thay luồng nghiệp vụ

**V15.2.0** là phiên bản nên xây dựng đầu tiên. Chưa xóa hàng loạt các lớp vá. Nạp đúng thứ tự boot.js, app.js và relational-v1577.js trong kiểm tra tích hợp. Lập bản đồ hành vi đang chạy sau các override, danh mục dữ liệu, quyền và file local. Sửa hai tình huống đã tái hiện mà không vô hiệu hóa cơ chế lưu hiện tại trước khi có thay thế. Queue tồn đọng phải gắn project/family/Sync ID; đổi tài khoản/đích có kiểm tra pending, không phát queue sang đích khác. Thiết bị offline giữ nháp và trạng thái chưa lưu, không tự báo dữ liệu đã vào database.

Kiểm tra: mở offline rồi nhập/sửa; mất mạng lúc gửi; reload khi pending; đổi Sync ID hoặc URL; lỗi IndexedDB; nhập liên tục; mở lại từ nền. Sao lưu có kiểm chứng trước các thay đổi dữ liệu.

**V15.3.0** đặt quyền tại database và backend. Sync ID dùng để định tuyến/tìm gia đình, không đóng vai trò mật khẩu. RLS phải kiểm tra thành viên và vai trò; RPC SECURITY DEFINER phải xác minh người gọi và khóa phạm vi. Các endpoint dùng service role phải tự xác thực người gọi hoặc khóa cron riêng; frontend không mang khóa đặc quyền. Chuyển người dùng hiện tại vào tài khoản gia đình theo quy trình đã xác minh, không tự chuyển quyền sở hữu khi chưa xác định danh tính.

Kiểm tra: chưa đăng nhập; thành viên gia đình khác; user hết phiên; quyền chỉ xem; RPC phục hồi; tệp và thông báo. Bao gồm đường gọi API trực tiếp, không chỉ kiểm tra ẩn nút.

**V15.4.0** xây lớp truy cập dữ liệu làm mẫu cho các phiên bản tiếp theo: repository, kiểu/hợp đồng request-response, phân loại lỗi, giới hạn truy vấn, ID và múi giờ. Bắt đầu với danh mục ít liên kết. Trong giai đoạn chuyển từng module, backend chặn đường snapshot cũ ghi lại những thực thể đã chuyển; không cho hai cơ chế cùng quyết định dữ liệu của một nghiệp vụ. Với thao tác timeout không rõ đã commit hay chưa, xác minh qua operation ID trước khi retry.

### 4.2 V15.5–V15.9: chuyển đầy đủ nghiệp vụ sang database trực tiếp

**V15.5.0** chuyển care và milk cùng nhau vì có liên kết số dư. Khi sửa từ sữa kho sang bú mẹ trực tiếp, server xử lý hoàn trả và ghi cữ trong một transaction. Xóa cữ, chuyển sữa, hủy thủ công, phân bổ nhiều nguồn, tăng/giảm lượng phải có test riêng. Số dư được bảo vệ ở server; giao diện không chạy một vòng sửa tất cả túi để tự suy ra trạng thái. Không dọn hoặc tái tạo ledger production từ dữ liệu cache cũ.

**V15.6.0** lập bản đồ các cấu trúc healthBook và hb.members cùng số đo baby/mom/pregnancy; xác định nguồn hiện hành trước khi chuyển. Tách thực thể phù hợp schema thực tế. Tài liệu gắn blobKey vẫn được giữ và được kiểm kê theo thiết bị; chưa xóa cache hoặc file dù metadata đã lên database.

**V15.7.0** nâng luồng nhật ký/lịch/cột mốc đang có. Phân trang theo thời gian ổn định; bộ lọc và trạng thái quay lại danh sách phải giữ đúng. Ghi chú tháng có nơi lưu rõ; thao tác xóa giữ tính nhất quán với thông báo và tham chiếu file.

**V15.8.0** hoàn thành ma trận các loại dữ liệu còn lại, bao gồm các trường có trong shape nhưng chưa nằm trong danh sách entity diff. Trạng thái đang mở popup, cuộn và bộ lọc không trở thành dữ liệu dùng chung mặc định. Theme và bố cục cá nhân được phân loại theo thiết bị/tài khoản theo lựa chọn sản phẩm.

**V15.9.0** chuyển các thống kê sang nguồn dữ liệu phù hợp thay vì tải hết để tính ở mọi lần mở màn. Có thể dùng view/RPC aggregate khi hữu ích. Kiểm tra múi giờ Việt Nam, khoảng ngày, đơn vị ml/phút/kg, trạng thái xóa và phạm vi gia đình. Giữ full export cho chức năng backup có quyền, không dùng nó để render toàn hệ thống hằng ngày.

### 4.3 V16.0–V16.5: dọn mã, giao diện và vận hành

**V16.0.0** chỉ tháo phần legacy đã được thay thế và qua đối chiếu. Dừng các timer sửa dữ liệu cũ; bỏ wrapper window.save/load/normalize lịch sử; bỏ script không được dùng khỏi gói chạy. Quyền server phải chặn frontend quá cũ ghi theo hợp đồng đã ngừng hỗ trợ. Rollback dùng bản app tương thích schema hiện tại, không quay về một client có thể ghi đè dữ liệu bằng snapshot. Database legacy và backup chỉ lưu trữ theo chính sách riêng, không tự xóa trong bản refactor.

**V16.1.0** thay subscription và refetch toàn trạng thái bằng cơ chế biết phần nào đã đổi. Khi hai người sửa cùng một bản ghi, dùng version/updated_at kiểm tra cạnh tranh và yêu cầu xem lại khi xung đột, thay vì tự ghi đè âm thầm. Quản lý reconnect, foreground, debounce và teardown.

**V16.2.0** tách component với ranh giới UI–nghiệp vụ rõ. Component nhận dữ liệu và phát hành động; không mở IndexedDB hoặc tự merge Cloud. Tách từng màn và kiểm tra sau mỗi lần tách, ưu tiên care/milk rồi health, dashboard và các màn khác. Không tạo quá nhiều file chỉ chứa một đoạn HTML mà không giúp quản lý trách nhiệm.

**V16.3.0** lập hệ thống token, kích thước chữ, trạng thái form, thẻ, popup và điều hướng. Thay CSS override theo nhóm có đối chiếu hình ảnh; không xóa toàn bộ !important một lượt. Kiểm tra thao tác chạm, chữ dài tiếng Việt và safe area iPhone.

**V16.4.0** đo trên bộ dữ liệu mẫu không chứa dữ liệu riêng tư; phân biệt thời gian mạng, database và render. Chỉ thêm virtualization/caching khi có điểm nghẽn thực tế. Không đặt KPI tải vài trăm mili giây khi chưa biết kết nối và dữ liệu; báo baseline, mục tiêu sau khi đo và kết quả thực tế.

**V16.5.0** quản lý version asset và cập nhật PWA an toàn. Cache phục vụ app shell hoặc dữ liệu đã được phép theo phạm vi tài khoản; không dùng cache URL làm nguồn xác nhận dữ liệu đã lưu. Logout/đổi gia đình phải làm sạch dữ liệu hiển thị theo quyền, đồng thời bảo toàn file/nháp chưa xử lý qua quy trình rõ ràng.

### 4.4 V16.6–V16.9: dữ liệu đính kèm, phục hồi, thông báo và chất lượng

**V16.6.0** di chuyển file local theo manifest có byte size/checksum khi phù hợp. Metadata thành công chưa đồng nghĩa upload byte thành công. Có trạng thái upload chưa xong/thử lại và đối chiếu trước khi dọn bản local. Dùng bucket private và chính sách theo gia đình; tránh để URL công khai lâu dài cho tài liệu sức khỏe.

**V16.7.0** phân biệt export JSON với backup đầy đủ có file. Import là công cụ có quyền: kiểm tra phiên bản, dữ liệu, phạm vi và bản xem trước, xác nhận thao tác phục hồi cụ thể. Không chạy import/merge trong khởi động hay mỗi lần nhận realtime. Kiểm tra phục hồi thử trên môi trường tách biệt trước khi tuyên bố backup có thể dùng.

**V16.8.0** giữ các rule nhắc hiện có, tổ chức lại để cấu hình và cách đánh giá không lệch giữa client với cron. Tình trạng failed/reserved không được làm mất vĩnh viễn cơ hội retry hợp lệ. Không hard-code kết luận y tế cá nhân; ngưỡng chuyên môn nếu thay đổi cần được đối chiếu nguồn và mô tả rõ.

**V16.9.0** là đợt rà soát rộng, không phải đợi tới đây mới thêm test. CI bắt buộc syntax/type/build, nghiệp vụ sữa/care, API/RLS và E2E luồng chính. Các thử nghiệm iOS/PWA/push cần ghi thiết bị thật đã thử và những phần chỉ mô phỏng. Tên test và báo cáo phải thể hiện runtime hiện tại.

### 4.5 V17.0–V17.5: mở rộng sau khi nền ổn định

Các mốc này ưu tiên lại sau V16.9. Những module như tiêm chủng, biểu đồ, theme, nhật ký và cảnh báo đã xuất hiện trong source; roadmap nâng trải nghiệm và độ tin cậy của chúng, không coi là xây mới toàn bộ.

- V17.0 mở giao diện cộng tác trên nền quyền đã bảo vệ từ V15.3. Không chờ tới V17 mới hạn chế dữ liệu giữa các gia đình.
- V17.1 ưu tiên thao tác Boss dùng hằng ngày. Undo là thao tác nghiệp vụ bù, có kiểm tra cạnh tranh và số dư.
- V17.2 làm rõ kho và lịch sử di chuyển; số liệu luôn truy ra các giao dịch chuẩn. Không tự tạo quy tắc an toàn sữa theo suy đoán.
- V17.3 kết nối các lịch và hồ sơ hiện có; lịch y tế chuyên môn chỉ được cập nhật khi có nguồn phù hợp ở thời điểm triển khai.
- V17.4 cá nhân hóa báo cáo có phạm vi nhất quán; tránh nhân thêm nhiều dashboard ít dùng.
- V17.5 chốt bản ổn định theo kiểm tra thực tế, tài liệu triển khai, phục hồi và vận hành; không tự áp dụng lệnh freeze dự án nếu Boss chưa yêu cầu.

## 5. Cấu trúc source mục tiêu

| Thư mục | Trách nhiệm |
| --- | --- |
| src/app/ | Khởi động, điều hướng, cấu hình và vòng đời ứng dụng |
| src/features/care/ | Form, timeline, nghiệp vụ điều phối chăm sóc |
| src/features/milk/ | Kho sữa, chọn nguồn, chuyển sữa, hiển thị ledger |
| src/features/health/ | Hồ sơ, số đo, vaccine, khám và tài liệu |
| src/features/pregnancy/ | Nội dung thai kỳ và biểu đồ liên quan |
| src/features/diary/ | Nhật ký và nội dung theo thời gian |
| src/features/appointments/ | Lịch hẹn, lịch tháng và liên kết nhắc |
| src/features/milestones/ | Cột mốc, hành trình và ghi chú tháng |
| src/features/dashboard/ | Tổng quan và cấu hình widget |
| src/features/settings/ | Hồ sơ, tùy chọn và cấu hình người dùng |
| src/features/sensors/ | Các công cụ noise/lux đang có nếu được giữ trong sản phẩm |
| src/data/ | Client, repository, query, hợp đồng dữ liệu, phiên và xử lý lỗi |
| src/shared/ui/ | Modal, bottom sheet, toast, loading, confirm và form dùng chung |
| src/shared/utils/ | Hàm thuần về ngày giờ, định dạng và kiểm tra đầu vào |
| src/styles/ | Token, theme, kiểu chung và CSS component |
| public/ | Icon, manifest và tài nguyên công khai; không có backup cá nhân/secret |
| supabase/migrations/ | Schema, RLS và RPC tăng dần, có thứ tự rõ |
| supabase/functions/ | Các tác vụ backend như push, cron, xử lý đặc quyền |
| tests/ | Unit nghiệp vụ, tích hợp database/quyền, E2E và fixture giả |
| docs/ | Kiến trúc, API, data dictionary, kiểm tra và hướng dẫn vận hành |

Đây là cấu trúc mục tiêu, sẽ tinh chỉnh theo số lượng code thực tế. Không ép chia file chỉ để khớp sơ đồ.

## 6. Quy tắc nghiệm thu mỗi phiên bản

1. Chốt phạm vi và luồng bị ảnh hưởng; đối chiếu dữ liệu trước/sau trên môi trường phù hợp.
2. Migration tăng dần, có kế hoạch hồi phục; không xóa/reset production để nâng app.
3. Kiểm tra liên quan: nghiệp vụ, quyền, lỗi mạng, dữ liệu rỗng và tương tác. Build pass không thay cho test dữ liệu.
4. Chỉ báo đã lưu khi database xác nhận. Nếu chỉ lưu nháp trên thiết bị thì ghi đúng trạng thái đó.
5. Không làm mất dữ liệu/file local chưa được xác minh đã chuyển lên server.
6. Cập nhật version, README, CHANGELOG và ROADMAP; ghi rõ hạn chế xác minh.
7. Bàn giao source ZIP theo phiên bản, đủ lockfile/config/migration và hướng dẫn; không kèm secret, backup cá nhân, node_modules hoặc cache.
8. Push GitHub/deploy chỉ theo yêu cầu và đích Boss giao; không mặc định đã triển khai khi chỉ bàn giao source.

## 7. Các mốc có thể đánh giá để dừng hoặc ưu tiên lại

| Mốc | Giá trị đạt được theo kế hoạch |
| --- | --- |
| Sau V15.5 | Luồng chăm sóc và kho sữa quan trọng nhất ghi database trực tiếp bằng transaction |
| Sau V15.9 | Toàn bộ module và thống kê chính không cần cơ chế full-state cho sử dụng thường ngày |
| Sau V16.0 | Có thể tháo sạch runtime JSON/override cũ đã được thay thế |
| Sau V16.4 | Component, giao diện và truy vấn được tổ chức lại, có đo hiệu năng |
| Sau V16.9 | PWA, file, backup, push và kiểm thử được củng cố đồng bộ |
| Sau V17.5 | Hoàn tất các nâng cấp trải nghiệm đã chọn và có bản ổn định để bảo trì |

Không cần chờ hết 24 phiên bản để dùng app. Mỗi phiên bản phải bàn giao được một cải thiện có thể kiểm chứng. Không đưa ước lượng thời gian thành cam kết khi chưa có schema production và môi trường kiểm thử.

## 8. Điểm cần chốt trước phiên bản phụ thuộc

- Phương thức đăng nhập và người sở hữu gia đình đang có: chốt trước V15.3.
- Xác nhận chính sách ghi khi offline: kế hoạch mặc định online để ghi, giữ nháp khi mất mạng. Nếu cần nhập offline hoàn chỉnh, thiết kế như phạm vi riêng có giải quyết xung đột; không tự giữ lại queue snapshot cũ.
- Schema/RPC/RLS/Storage thực tế và môi trường test: thu thập trước khi viết migration tương ứng.
- File còn nằm trên từng thiết bị: kiểm kê trước khi dọn IndexedDB hoặc triển khai V16.6.
- Nhu cầu thêm nhiều bé/nhiều gia đình hoặc các tích hợp mới: ngoài phạm vi mặc định; chỉ đưa vào phiên bản cụ thể khi Boss chọn.
- Ngân sách và dung lượng lưu trữ: đánh giá theo số file và sử dụng thực tế; không mặc định mở gói trả phí.

## 9. Phiên bản nên xây dựng tiếp theo

**V15.2.0 — Foundation & Data Safety.**

Kết quả mong đợi: có baseline đầy đủ của runtime đang chạy, test tái hiện và bảo vệ hai tình huống dữ liệu, bản đồ schema/luồng lưu/cache/queue/file, bộ kiểm tra phát hành phù hợp V15.1.0, cùng source và tài liệu đủ để bắt đầu bảo vệ truy cập ở V15.3.0. Chưa gỡ hàng loạt code cũ, chưa thay đổi toàn bộ giao diện và chưa reset database.

Sau khi xây dựng V15.2.0, phiên bản kế tiếp là **V15.3.0 — Authentication & Data Isolation** theo điều kiện truy cập và phương thức đăng nhập được chốt.


## Tiến độ V15.2.0
Đã sửa lớp dữ liệu, outbox gắn đích, chặn lưu offline với nháp dự phòng, bảo vệ refetch/config và thêm kiểm thử runtime đầy đủ. Có 8 kiểm tra lịch sử còn thất bại giống V15.1.0, không coi là đã sửa. Chưa đối chiếu schema/RPC production, chưa kiểm thử thiết bị iOS/push thật. Xem docs/TEST_RESULTS_V15.2.0.json và docs/DATA_SAFETY_V15.2.0.md.
