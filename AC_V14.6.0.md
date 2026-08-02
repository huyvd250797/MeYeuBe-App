# AC — V14.6.0 · Storage & Stability
Ngày: 2026-08-02

## 1. Bé bú: ô ml có nút −/＋ và dãy gợi ý nhanh (giống màn Hút sữa)
- AC1.1 Mở form ghi nhận, chọn **Bé bú** → ô "Số lượng ml" hiện thành một khối: nút **−**, số ml ở giữa, chữ **ml**, nút **＋** (bước 10 ml), y như bố cục của Hút sữa.
- AC1.2 Ngay dưới là dòng **"Gợi ý nhanh"** với các mức **60 · 80 · 100 · 120 · 150 · 180 · 200 ml**, cuộn ngang được, không làm vỡ khung form trên màn hình hẹp.
- AC1.3 Chạm một mức gợi ý → số ml điền ngay vào ô, nút đó sáng lên (trạng thái `active`). Gõ tay một con số trùng mức gợi ý thì mức đó cũng tự sáng.
- AC1.4 Nút **−** bị mờ (disabled) khi số ml đang là 0; không bao giờ cho ra số âm.
- AC1.5 Chọn mức gợi ý phải chạy đúng mọi logic sẵn có như khi gõ tay: tự gắn bình/túi sữa theo hạn dùng (`abOnAmountInput`), cập nhật tổng ml lấy từ kho, tính "số ml bé bú thực tế". Chuyển sang **Bú từ kho sữa đã hút** vẫn hoạt động y nguyên.
- AC1.6 Sửa một ghi nhận cũ (`fillCareEditForm`) → số ml cũ hiện đúng trong khối mới, mức gợi ý tương ứng sáng nếu trùng.
- AC1.7 Ô nhập vẫn là chính `#cAmount` cũ (chỉ được **di chuyển** vào khung mới), nên `getCareEventFromForm()` đọc dữ liệu không đổi một dòng nào.

## 2. Trang Dữ liệu: bảng dung lượng App / DB
- AC2.1 Mở **Thêm → 💾 Dữ liệu** → thẻ **📦 Dung lượng** nằm ngay đầu trang, tự tính khi vào trang, có nút **↻ Tính lại**.
- AC2.2 Thẻ hiển thị bốn dòng: **Dung lượng App** (tổng các tệp trong Cache Storage của PWA, kèm số tệp), **Dung lượng DB** (dữ liệu chính trong localStorage), **Cài đặt & bộ lọc** (các khoá phụ, chỉ hiện khi có), **Backup phiên bản** (tổng dung lượng các bản trong IndexedDB, kèm số bản).
- AC2.3 Trên cùng là **tổng dung lượng đang chiếm** lấy từ `navigator.storage.estimate()`, kèm hạn mức trình duyệt cấp, thanh tiến trình và phần trăm đã dùng. Máy nào không cho đọc thì cộng dồn từ ba nguồn trên thay thế.
- AC2.4 Bảng **"Dữ liệu DB đang chiếm chỗ ở đâu"**: tối đa 8 nhóm lớn nhất (Ghi nhận chăm sóc, Kho sữa, Cột mốc/ảnh, Sổ sức khỏe, Thiết lập/ảnh đại diện…), mỗi dòng có số mục và % của DB.
- AC2.5 DB vượt **3 MB** → cảnh báo kèm hướng xử lý (xuất DB JSON rồi xoá bớt ảnh cũ). Dùng quá **80% hạn mức** → cảnh báo xoá bớt Backup cũ.
- AC2.6 Không đọc được Cache Storage / IndexedDB thì ghi rõ "Không đọc được" thay vì để trống hoặc treo màn hình.
- AC2.7 Toàn bộ phép đo là **chỉ đọc**, không đụng tới một byte dữ liệu nào của bé.

## 3. Sửa lỗi: bấm chức năng ở nút "Thêm" bị đứng màn hình / thoát app
Bốn nguyên nhân đã xác định và xử lý từng cái:

- AC3.1 **Ô sao lưu JSON không còn tự dựng.** `updateBackup()` trước đây nối *toàn bộ* database thành chuỗi JSON rồi đổ vào textarea — và chạy lại ở **mọi lần `render()`** cộng thêm ngay khi mở trang Dữ liệu; với DB vài MB (ảnh cột mốc, ảnh đại diện) máy đứng hình vài giây rồi thoát app. Nay ô để trống kèm hướng dẫn, chỉ nạp khi bấm **👁 Hiện dữ liệu JSON**; DB trên 2 MB thì hỏi xác nhận trước. Bấm **Copy DB** vẫn hoạt động (tự nạp trước khi copy).
- AC3.2 **Timeline phân trang.** `renderCareTimeline()` trước đây dựng toàn bộ lịch sử thành một chuỗi HTML duy nhất. Nay dựng **120 mục mỗi lần**, kèm nút "Xem thêm 120 mục" và dòng "Đang hiện X / Y ghi nhận". Bộ lọc ngày/loại đổi thì số đếm quay lại 120. Nút Sửa / Sao chép / Xoá trỏ đúng bản ghi như cũ (giữ nguyên `_idx`).
- AC3.3 **Bảng "Thêm" điều hướng đúng thứ tự.** Mọi mục đi qua `nv6Go()`: đóng sheet trước, sang khung hình kế tiếp mới chuyển trang, rồi mới gọi các hàm vẽ phụ. Riêng mục **Dữ liệu** không còn gọi `bkRenderVersionsPanel()` / `bkRenderAutoConfigForm()` **trước** khi trang kịp hiện (từ V14.3.0 `doShowPage` bị hoãn 2 khung hình).
- AC3.4 **Không giữ lớp vẽ khổng lồ sau khi chuyển trang.** Hiệu ứng "nở trang từ điểm chạm" của V14.5.0 để lại `transform` + `will-change` vĩnh viễn trên cả trang; với trang dài (Timeline, Dữ liệu) iOS phải giữ một lớp vẽ rất lớn nên dễ hết bộ nhớ. Nay các lớp này được dọn sạch sau khi hiệu ứng chạy xong, và **các trang nặng không phóng to cả trang nữa** (vẫn có hiệu ứng mờ/trượt như cũ).
- AC3.5 **Bảng "Thêm" không làm mờ nền bằng `backdrop-filter`.** Làm mờ nền đồng thời với hiệu ứng mở/đóng buộc iOS vẽ lại cả màn hình mỗi khung hình. Thay bằng lớp màu, nhìn gần như cũ nhưng nhẹ hơn hẳn.
- AC3.6 **Lưới an toàn.** Khung xương (skeleton) nào đứng quá **2,6 giây** sẽ tự bị gỡ; có lỗi JavaScript giữa chừng cũng gỡ sạch khung xương — người dùng không bao giờ bị kẹt ở màn hình lấp lánh trống rỗng.
- AC3.7 **Nút "🧊 Kho sữa" không còn là lối vào chết.** App không hề có trang `milkInventory`, nên nút này ẩn hết mọi trang rồi để lại **màn hình trắng hoàn toàn**. Nay nút mở đúng bảng chi tiết kho sữa (`openMilkStockFromDetail`), và mô tả đổi từ "Nếu có màn hình kho" thành "Bình / túi đang bảo quản".
- AC3.8 **Chặn mọi lối vào chết về sau.** `nv6Go()` kiểm tra id có ứng với một `.page` thật hay không; không có thì báo "Chức năng này chưa có màn hình riêng" thay vì ẩn sạch mọi trang.
- AC3.9 Bấm lần lượt **cả 11 mục** trong bảng "Thêm" → tất cả đều mở được, không trắng màn hình, không đứng hình, không thoát app; không còn khung xương nào kẹt lại và không trang nào còn giữ lớp phóng to.

## 4. Không phá vỡ hành vi cũ
- AC4.1 So với `BASELINE_LOCK_V14.5.0.json`: **không sửa thân một hàm nào**. Toàn bộ phần mới là hàm `fq6*` / `st6*` / `nv6*`, CSS mới và khối HTML mới trong trang Dữ liệu. Chỗ nào cần đổi hành vi (`updateBackup`, `copyBackup`, `renderCareTimeline`, `ax5PageZoom`, `doShowPage`, `renderCareDynamicFields`) đều **bọc lại** đúng cách `axWrap()` / `ax5*` đang dùng.
- AC4.2 Ba hàm `ax5Init` / `ax5DragInit` / `ax5ResetDragStyle` bị báo lệch hash là **sai lệch có sẵn** của chính file `BASELINE_LOCK_V14.5.0.json` (chốt trước lần chỉnh cuối của khối `ax5*` trong bản đã phát hành). Đối chiếu trực tiếp `app.js` V14.5.0 với V14.6.0 thì mã của cả ba giống nhau từng ký tự. Đã khai báo trong `INTENTIONAL_BASELINE_CHANGES` và chốt lại đúng ở `BASELINE_LOCK_V14.6.0.json` (157 hàm).
- AC4.3 Bảng thời lượng `--ax-fast/base/slow` và `--ax-modal/--ax-sheet` giữ nguyên, không thêm Rotate, vẫn tôn trọng "Giảm chuyển động" của hệ điều hành và ô tắt hiệu ứng trong app.
- AC4.4 Không đụng tới `localStorage` ngoài việc **đọc** để đo dung lượng → dữ liệu của bé an toàn tuyệt đối.
