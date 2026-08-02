# AC — V15.0.1 · Thanh bộ lọc Timeline 2.0 thu gọn (bản A)
Ngày: 2026-08-02

Bản V15.0.0 làm đúng chức năng nhưng sai về diện tích: thanh bộ lọc chiếm **≈ 560px** — gần trọn màn hình điện thoại — trước khi thấy dòng ghi nhận đầu tiên. Bản này thu gọn xuống **≈ 132px** mà không bỏ một chức năng nào.

**Nguyên nhân gốc của lỗi xếp dọc:** app có rule toàn cục `button{width:100%}`. Chip lọc ở V15.0.0 không chặn rule đó nên bị kéo full-width, năm chip xếp thành năm hàng.

---

## 1. Thanh công cụ gọn về một hàng

- **AC1.1** Thẻ Timeline chỉ còn **một hàng công cụ**: ô tìm kiếm (co giãn) + **⚙ Bộ lọc** + **⇅ Sắp xếp** + **＋ Ghi nhận mới**. Ba nút sau là nút vuông 40×40, không phải nút chữ dài cả hàng.
- **AC1.2** Hàng này **không bao giờ xuống dòng** (`display:flex`, không `flex-wrap`). Màn hình hẹp thì ô tìm kiếm co lại, ba nút giữ nguyên kích thước.
- **AC1.3** `.tl8Chip` và `.tl8IconBtn` **tự đặt lại `width`** để chặn rule toàn cục `button{width:100%}`. Đây là điều kiện được kiểm tra tự động trong `release_check.py` — không để lỗi xếp dọc quay lại.
- **AC1.4** Nút **＋ Ghi nhận mới** được giữ nguyên lối vào, chỉ đổi từ nút chữ chiếm cả hàng thành nút vuông trong thanh — không ai mất đường vào màn hình ghi nhận.

## 2. Lọc ngày / lọc loại chuyển vào bảng ⚙ Bộ lọc

- **AC2.1** Hai ô **Lọc ngày** và **Lọc loại** không còn nằm trên trang; chúng chuyển vào bảng ⚙ Bộ lọc. Đây là phần lấy lại nhiều diện tích nhất.
- **AC2.2** Hai ô này **vẫn còn đúng một bản trong DOM và giữ nguyên `id`** (`careFilterDate`, `careFilterType`). `renderCareTimeline` và các hàm đã khoá vẫn đọc được như cũ — chuyển chỗ chứ **không** viết lại.
- **AC2.3** Bảng ⚙ Bộ lọc gồm: hai ô lọc trên, năm chip lọc nhanh (⭐ 📌 📷 🎥 📝) xếp ngang tự xuống dòng, và hai nút **Đặt lại** / **Xem N ghi nhận**.
- **AC2.4** Nút xác nhận hiện **số ghi nhận khớp bộ lọc ngay tại thời điểm đó** (*"Xem 12 ghi nhận"*), cập nhật theo từng lần chạm chip — bấm là biết trước sẽ ra bao nhiêu dòng, không phải đóng bảng ra đếm.

## 3. Biết đang lọc gì mà không cần mở bảng

- **AC3.1** Nút ⚙ mang **số đếm** ở góc: bao nhiêu điều kiện đang bật (tính cả lọc ngày và lọc loại). Không lọc gì thì số biến mất và nút về màu thường.
- **AC3.2** Đang lọc thì nút ⚙ đổi sang màu nhấn. Sắp xếp khác mặc định thì nút ⇅ cũng đổi màu, và `title` / `aria-label` ghi rõ đang sắp theo tiêu chí nào.
- **AC3.3** Dưới thanh công cụ có **dòng tóm tắt** liệt kê đúng những gì đang áp dụng, kèm số kết quả: *"📅 02/08/2026 · ⭐ Yêu thích · 🔎 "sữa" — 12 ghi nhận"*, kèm nút **Xoá**.
- **AC3.4** Dòng tóm tắt **chỉ hiện khi thực sự có lọc / tìm / đổi sắp xếp**. Trạng thái mặc định thì biến mất hoàn toàn, không chiếm một pixel nào.
- **AC3.5** Nút **Xoá** đặt lại cả bộ lọc nhanh lẫn từ khoá tìm kiếm trong một lần chạm.

## 4. Không mất chức năng nào

- **AC4.1** Đủ **năm chip lọc nhanh**, chọn nhiều cùng lúc, cộng dồn với lọc ngày và lọc loại — y như V15.0.0.
- **AC4.2** Đủ **sáu chế độ sắp xếp** trong bảng ⇅, vẫn ghi nhớ lựa chọn cuối cùng.
- **AC4.3** Tìm kiếm không dấu, nhiều từ khoá, hoãn 220ms — không đổi.
- **AC4.4** Nhấn giữ, bảng thao tác, ảnh/video/ghi chú, chia sẻ, xuất PDF — không đụng tới.
- **AC4.5** Đóng bảng ⚙ thì Timeline được vẽ lại một lượt, kết quả luôn khớp với bộ lọc vừa chọn.

## 5. Không phá vỡ hành vi cũ

- **AC5.1** So với `BASELINE_LOCK_V15.0.0.json`: **đúng ba hàm** bị sửa thân, tất cả đều là hàm `tl8*` sinh ra ở V15.0.0 và đều đã khai báo trong `INTENTIONAL_BASELINE_CHANGES`:

  | Hàm | Lý do |
  |---|---|
  | `tl8SyncBar` | vẽ thanh mới: số đếm trên nút ⚙, dòng tóm tắt, số kết quả |
  | `tl8RenderTimeline` | đổi thứ tự gọi `tl8SyncBar(total)` — phải đếm kết quả xong mới vẽ thanh |
  | `tl8CloseAll` | đóng thêm bảng ⚙ Bộ lọc |

- **AC5.2** **Không một hàm nào có từ trước V15.0.0 bị động tới.** Phần lọc, sắp xếp, phân trang và dựng dòng bên trong `tl8RenderTimeline` không đổi một ký tự — chỉ đổi vị trí một lời gọi.
- **AC5.3** Phần mới đều là hàm mới (`tl8OpenFilter`, `tl8CloseFilter`, `tl8FilterCount`, `tl8ActiveParts`), CSS mới và khối HTML mới.
- **AC5.4** Bảng ⚙ đặt tên chứa `Sheet` nên cơ chế khoá cuộn nền dùng chung của V14.1.0 tự nhận ra, không phải khai báo thêm.
- **AC5.5** `BASELINE_LOCK_V15.0.1.json` chốt **267 hàm** (263 hàm của V15.0.0 + 4 hàm mới).
