# AC — V15.0.0 · Timeline 2.0 (Unified Timeline)
Ngày: 2026-08-02

Timeline không còn chỉ để **xem lại**. Từ bản này, Timeline là **trung tâm quản lý** toàn bộ hoạt động: sửa, nhân bản, ghim, đánh dấu yêu thích, đính kèm ảnh/video/ghi chú, chia sẻ, xuất PDF, tìm kiếm, lọc và sắp xếp.

Đồng thời Timeline ngắn trên Dashboard được nâng cấp để hiển thị thông minh hơn **mà vẫn nhẹ** — Dashboard chỉ giữ những thao tác nhanh, mọi thứ nặng đều đẩy sang Unified Timeline.

---

## 1. Dashboard Timeline (Quick Timeline)

- **AC1.1** Block **Nhật ký chăm sóc** trên Dashboard hiển thị tối đa **8 hoạt động gần nhất** (`TL8_DASH_MAX`), sắp theo thời gian hoạt động mới nhất trước. Bản cũ chỉ liệt kê ghi nhận **trong ngày hôm nay**, nên buổi sáng sớm Dashboard thường trống trơn dù tối qua vừa ghi rất nhiều.
- **AC1.2** Dòng của **hôm nay** hiện giờ (`08:15`). Dòng của **ngày khác** hiện thêm ngày/tháng phía trước (`01/08 21:40`) để không ai nhầm việc hôm qua là việc hôm nay.
- **AC1.3** Bên phải tiêu đề là nút **Xem toàn bộ →**, mở thẳng Unified Timeline.
- **AC1.4** Chưa có ghi nhận nào → vẫn hiện một dòng mời ghi nhận đầu tiên, bấm vào mở màn hình ghi nhận. Không để một khoảng trắng khó hiểu.
- **AC1.5** Nếu vì bất kỳ lý do gì mô-đun mới lỗi, block Dashboard **rơi nguyên vẹn về cách vẽ cũ** (`try/catch` bao quanh lời gọi `tl8DashCard`). Dashboard không bao giờ trống vì Timeline 2.0.

## 2. Quick Action trên Dashboard (nhấn giữ)

- **AC2.1** **Nhấn giữ 450ms** một dòng Dashboard Timeline → rung nhẹ một nhịp (`axHaptic('press')`), dòng đó mờ đi để biết đang được chọn, rồi mở **Bottom Sheet** thao tác nhanh.
- **AC2.2** Bảng thao tác trên Dashboard **chỉ có 5 mục**: ✏️ Sửa · 📄 Nhân bản · ⭐ Đánh dấu yêu thích · 📌 Ghim · 📂 Xem chi tiết.
- **AC2.3** Dashboard **không** hiện: 📷 Thêm ảnh · 🎥 Thêm video · 📝 Ghi chú · 📤 Chia sẻ · 📄 Xuất PDF. Đây là điều kiện được kiểm tra tự động trong `release_check.py` (mỗi hàm nặng chỉ được xuất hiện đúng một lần, trong nhánh `full`).
- **AC2.4** Kéo tay quá 10px hoặc cuộn trang trong lúc đang giữ → **huỷ** nhấn giữ, không mở bảng. Cuộn Timeline không bao giờ bị bảng thao tác nhảy ra chặn.
- **AC2.5** Nhấn giữ xong, cú nhả tay **không** rơi tiếp thành một cú bấm mở màn hình chi tiết. Chặn đúng 600ms và chỉ chặn cú bấm rơi vào **chính dòng vừa nhấn giữ** — nút bên trong bảng thao tác vẫn bấm được ngay.
- **AC2.6** Trên điện thoại, trình duyệt bắn thêm một cặp `mousedown/mouseup` giả sau khi chạm. Mô-đun bỏ qua chuột trong 900ms sau lần chạm cuối → **không mở bảng thao tác oan**.
- **AC2.7** Nhấn giữ cũng chặn menu chuột phải / menu chọn văn bản của hệ điều hành trên đúng các dòng Timeline.

## 3. Hiển thị trạng thái

- **AC3.1** Bản ghi có dữ liệu mở rộng hiện biểu tượng nhỏ ngay cạnh tiêu đề: ⭐ đã yêu thích · 📌 đã ghim · 📷 có ảnh · 🎥 có video · 📝 có ghi chú.
- **AC3.2** Biểu tượng hiện ở **cả ba nơi**: dòng Dashboard, dòng Unified Timeline và đầu bảng thao tác nhanh.
- **AC3.3** Bản ghi đã ghim còn được viền nhấn quanh biểu tượng loại hoạt động (`.tl8Pinned`) để nhận ra từ xa.

## 4. Unified Timeline — bảng thao tác đầy đủ

- **AC4.1** Nhấn giữ một dòng trong Unified Timeline → bảng có **đủ 10 mục**: ✏️ Sửa · 📄 Nhân bản · ⭐ Yêu thích · 📌 Ghim · 📷 Thêm ảnh · 🎥 Thêm video · 📝 Thêm ghi chú · 📤 Chia sẻ · 📄 Xuất PDF · 📂 Xem chi tiết.
- **AC4.2** Nhấn giữ chưa quen tay thì vẫn còn lối vào tường minh: mỗi dòng có thêm nút **⋯ Thao tác** mở đúng bảng đó.
- **AC4.3** Nhãn của ⭐ và 📌 đổi theo trạng thái hiện tại (**Đánh dấu yêu thích** ⇄ **Bỏ yêu thích**, **Ghim** ⇄ **Bỏ ghim**).

## 5. Nhân bản record

- **AC5.1** **Nhân bản** copy toàn bộ dữ liệu của bản ghi, **thời gian mặc định chuyển sang thời điểm hiện tại** (ngày hôm nay + giờ phút lúc bấm), giờ kết thúc để trống.
- **AC5.2** Bản sao mở ra dưới dạng **form đang chờ Lưu**, người dùng chỉnh lại nếu cần rồi bấm Lưu để tạo dòng mới. Nhờ đi qua đúng luồng nhập liệu cũ (`copyCareEvent`), phần **kho sữa / túi sữa / hạn dùng** vẫn được tính lại đúng — không tạo ra bản ghi ma làm lệch tồn kho.
- **AC5.3** **Chuyển sữa** (`transfer`) không nhân bản được — nhân đôi một giao dịch chuyển kho sẽ làm sai tồn kho hai đầu. Bấm vào báo rõ bằng toast thay vì im lặng.

## 6. Ghim record

- **AC6.1** Ghim đánh dấu bản ghi quan trọng (tiêm vaccine, khám bệnh, sốt, thuốc đặc biệt…). Bản ghi hiện biểu tượng 📌.
- **AC6.2** Có bộ lọc nhanh **📌 Đã ghim** để chỉ xem những bản ghi đã ghim.

## 7. Yêu thích

- **AC7.1** Yêu thích đánh dấu bản ghi hay dùng lại. Bản ghi hiện biểu tượng ⭐.
- **AC7.2** Có bộ lọc nhanh **⭐ Yêu thích**.
- **AC7.3** Ghim và Yêu thích là **hai trạng thái độc lập**; một bản ghi có thể vừa ghim vừa yêu thích.

## 8. Thêm ảnh / video / ghi chú

- **AC8.1** Mỗi bản ghi hỗ trợ **nhiều ảnh** (tối đa 20) và **nhiều video** (tối đa 5), **không giới hạn riêng theo loại hoạt động** — bú, ngủ, thay tã, uống thuốc… đều đính kèm được.
- **AC8.2** Ảnh được **nén trước khi lưu** (cạnh dài tối đa 1280px, ~420KB/ảnh) bằng đúng hàm nén đang dùng cho ảnh cột mốc. Máy không phình bộ nhớ vì một tấm ảnh 8MB.
- **AC8.3** Video được lấy **một khung hình làm ảnh đại diện**. Video nhẹ hơn 2.5MB được lưu kèm và **xem lại được ngay trong app**.
- **AC8.4** Video nặng hơn 2.5MB: app **chỉ giữ ảnh đại diện + tên tệp**, kèm toast nói rõ lý do và một dòng chú thích trong lớp xem. Đây là lựa chọn có chủ ý — nhồi video vào bộ nhớ trình duyệt sẽ làm **hỏng cả lần lưu tiếp theo** của toàn bộ dữ liệu bé.
- **AC8.5** Ghi chú dùng chung trường `note` sẵn có của bản ghi — **một nguồn duy nhất**, không đẻ ra ghi chú thứ hai lệch với ghi chú nhập trong form.
- **AC8.6** Xoá từng tệp đính kèm được, có hỏi xác nhận.
- **AC8.7** Chạm vào ảnh/video mở lớp xem riêng. Đóng lớp xem thì nội dung được **nhả khỏi bộ nhớ** ngay (`innerHTML=''`), không giữ video nặng chạy ngầm.

## 9. Chia sẻ

- **AC9.1** Chia sẻ được ba dạng: **Văn bản** · **Ảnh đẹp** · **PDF**.
- **AC9.2** Văn bản dùng `navigator.share` nếu máy hỗ trợ; không thì **chép vào bộ nhớ tạm** kèm toast. Không có đường cụt.
- **AC9.3** Ảnh đẹp là thẻ 1000×1250 gồm ảnh đầu tiên (hoặc ảnh đại diện video), biểu tượng, loại hoạt động, thời gian, nội dung và ghi chú, ký tên "Nhật ký chăm sóc của \<tên bé\>". Máy hỗ trợ chia sẻ tệp thì mở bảng chia sẻ, không thì **tải về**.

## 10. Xuất PDF

- **AC10.1** Xuất riêng **từng bản ghi**, gồm: thời gian hoạt động · thông tin chi tiết · thời gian tạo · thời gian cập nhật · ghi chú · ảnh · **thumbnail video**.
- **AC10.2** Xuất PDF đi qua **popup xem trước có sẵn** (`hb2ShowReport`) — **không mở cửa sổ mới**, đúng ràng buộc từ V14.2.0 (cửa sổ mới bị kẹt khi chạy dạng PWA).

## 11. Filter & Sắp xếp

- **AC11.1** Năm bộ lọc nhanh dạng chip, **chọn được nhiều cùng lúc**: ⭐ Yêu thích · 📌 Đã ghim · 📷 Có ảnh · 🎥 Có video · 📝 Có ghi chú.
- **AC11.2** Bộ lọc mới **cộng dồn** với bộ lọc ngày và bộ lọc loại hoạt động đang có, không thay thế.
- **AC11.3** Sáu chế độ sắp xếp, hiện dưới dạng Bottom Sheet với dấu ✓ / ○:

  | # | Tiêu chí | Chiều |
  |---|---|---|
  | 1 | Thời gian hoạt động | Mới nhất trước *(mặc định)* / Cũ nhất trước |
  | 2 | Thời gian tạo record | Mới tạo trước / Cũ tạo trước |
  | 3 | Thời gian cập nhật | Mới cập nhật trước / Cũ cập nhật trước |

- **AC11.4** Sắp theo **thời gian tạo** hoặc **thời gian cập nhật** thì tiêu đề nhóm ngày đổi theo (`Ngày tạo: …` / `Ngày cập nhật: …`) và mỗi dòng hiện thêm dòng nhỏ `🆕 … · ✏️ …`. Nhìn là biết đang sắp theo mốc nào, không phải đoán.
- **AC11.5** Một hoạt động ngày 01/08 nhưng nhập bổ sung ngày 05/08 vẫn xem đúng theo thời gian tạo. Sửa lại bản ghi tuần trước thì nó lên đầu danh sách khi chọn "Mới cập nhật trước".
- **AC11.6** Ứng dụng **ghi nhớ lựa chọn cuối cùng** (sắp xếp + bộ lọc + từ khoá) trong `meYeuBeTimeline2_v1`, mở lại app vẫn còn.

## 12. Tìm kiếm

- **AC12.1** Ô tìm kiếm quét **toàn bộ dữ liệu** của bản ghi: nội dung ghi chú, loại hoạt động, tên bình/túi sữa, tên thuốc, tên vaccine, trạng thái bảo quản, mã túi và mọi trường phụ trong `extra`.
- **AC12.2** **Không phân biệt hoa thường và không phân biệt dấu**: gõ `binh sua` vẫn ra `Bình sữa`, gõ `thuoc` vẫn ra `Thuốc`.
- **AC12.3** Nhiều từ khoá cách nhau bằng dấu cách → phải khớp **tất cả** (AND).
- **AC12.4** Kết quả tìm kiếm **kết hợp** với bộ lọc và chế độ sắp xếp đang chọn.
- **AC12.5** Ô tìm kiếm **không bao giờ** nuốt chuỗi base64 của ảnh/video vào chuỗi so khớp — một tấm ảnh là vài trăm nghìn ký tự, đưa vào sẽ làm đứng máy ngay từ ký tự đầu tiên gõ. Điều này được kiểm tra tự động trong `release_check.py`.
- **AC12.6** Chuỗi so khớp được **nhớ tạm theo `id + updatedAt`**, gõ tiếp không phải dựng lại từ đầu.
- **AC12.7** Gõ phím có **hoãn 220ms** rồi mới vẽ lại, không vẽ lại sau từng ký tự.
- **AC12.8** Không tìm thấy gì → hiện đúng lý do (từ khoá hay bộ lọc) kèm nút **Xoá bộ lọc & tìm kiếm**, thay vì một danh sách trống vô nghĩa.

## 13. Mục tiêu UX

- **AC13.1** Dashboard Timeline: chỉ để xem nhanh và thao tác nhanh, không mở ảnh, không xuất PDF.
- **AC13.2** Unified Timeline: đầy đủ chỉnh sửa, lưu kỷ niệm, chia sẻ, xuất PDF, tìm kiếm, bộ lọc và nhiều chế độ sắp xếp.
- **AC13.3** Unified Timeline vẫn **dựng dần từng 120 dòng** như V14.6.0 — người dùng có 5.000 bản ghi vẫn mở trang nhanh, không đứng máy.
- **AC13.4** Đổi bộ lọc / sắp xếp / từ khoá thì bộ đếm phân trang **tự đặt lại về 120**, không giữ mức cuộn của bộ lọc cũ.

## 14. An toàn dữ liệu — không phá vỡ hành vi cũ

- **AC14.1** So với `BASELINE_LOCK_V14.7.0.json`: **không một hàm nào bị sửa thân**. `INTENTIONAL_BASELINE_CHANGES` trong `release_check.py` là **rỗng**.
- **AC14.2** Chỗ cần đổi hành vi đều được **bọc**, không sửa: `renderCareTimeline` → `tl8WrapTimeline`. Lớp bọc mới luôn nằm **ngoài cùng** (gọi `nv6Init()` trước khi bọc) nên lớp bọc của V14.6.0 không giành lại quyền vẽ.
- **AC14.3** Lớp bọc có `try/catch`: mô-đun mới lỗi thì **rơi về lớp bọc cũ**, người dùng vẫn thấy Timeline như bản 14.7.0.
- **AC14.4** Block Dashboard `careJournal` nằm trong `renderDashboard` — hàm này **không** thuộc Baseline Lock — và cũng chỉ thêm **một dòng uỷ quyền có `try/catch`**, phần mã cũ giữ nguyên bên dưới làm đường lui.
- **AC14.5** Toàn bộ trường dữ liệu mới đều là **trường phụ thêm vào bản ghi có sẵn**: `fav`, `pin`, `media`. Không đổi tên, không xoá, không ghi đè trường cũ → **sao lưu JSON, xuất file và đồng bộ Cloud tự động mang theo**, dữ liệu cũ không mất một ký tự.
- **AC14.6** Mọi thao tác đều bám theo **mã bản ghi** (`id`) chứ không phải chỉ số mảng. Thêm một ghi nhận mới sẽ `unshift` làm lệch toàn bộ chỉ số cũ; bám theo id nên ghim/yêu thích/ảnh **không bao giờ nhảy sang nhầm dòng**. Bản ghi cũ chưa có id được cấp id ngay lần đầu bị chạm tới.
- **AC14.7** Mọi lần ghi đi qua `tl8Commit()`. Bộ nhớ máy đầy thì báo rõ *"Bộ nhớ máy đã đầy — hãy xoá bớt ảnh/video đính kèm rồi thử lại"* và vẽ lại màn hình, **không** để `localStorage` ném lỗi ra giữa luồng làm treo app. Lần ghi hỏng thì dữ liệu trong máy vẫn là **bản cũ nguyên vẹn**.
- **AC14.8** Không đụng tới `localStorage` ngoài dữ liệu của chính người dùng và **một khoá thiết lập mới** `meYeuBeTimeline2_v1` (sắp xếp / bộ lọc / từ khoá).
- **AC14.9** Các lớp phủ mới đặt tên chứa `Sheet` / `Overlay` nên **cơ chế khoá cuộn nền dùng chung của V14.1.0 tự nhận ra**, không phải khai báo thêm và không sửa mã cũ.
- **AC14.10** Bảng thời lượng chuyển động `--ax-fast/base/slow`, `--ax-modal/--ax-sheet` giữ nguyên; vẫn tôn trọng "Giảm chuyển động" của hệ điều hành và ô tắt hiệu ứng trong app. Nhịp rung mới cho nhấn giữ được **thêm khoá mới** vào bảng `AX_HAPTIC_PATTERN`, **không sửa** `axHaptic()`.
- **AC14.11** `BASELINE_LOCK_V15.0.0.json` chốt **263 hàm** (185 hàm cũ + 78 hàm mới của V15.0.0).
