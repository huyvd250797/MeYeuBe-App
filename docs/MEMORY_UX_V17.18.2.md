# V17.18.2 — Quick Arrange & Memory Experience

## Sắp xếp dấu +
Mở dấu + để thấy lưới ghi nhận. Nhấn giữ một ô khoảng 520 ms, các ô rung nhẹ và xuất hiện nút Xong. Giữ tay kéo ô ngang/dọc, thả ở vị trí mới. Chế độ sắp xếp vẫn mở để đổi thêm ô. Chạm ra ngoài lưới hoặc bấm Xong để lưu. Dữ liệu lưu localStorage `myb.quickEntryOrder.v1`, chỉ trên thiết bị/trình duyệt hiện tại; không đồng bộ qua Sync ID. Xóa dữ liệu trình duyệt sẽ mất thứ tự tùy chỉnh.

Nhấn ngắn giữ hành vi mở chức năng. Di chuyển quá 10px trước đủ thời gian giữ được coi là cuộn, không bật reorder. Trong chế độ sắp xếp, nhấn ô không mở form. Pointercancel hủy lần kéo đang dở, giữ các lần đổi vị trí trước đó trong phiên sắp xếp. Rời app/làm mờ cửa sổ sẽ kết thúc an toàn và cố lưu thứ tự đã chấp nhận. Nếu trình duyệt không cho ghi localStorage, báo chưa lưu và có thể thử Xong lại.

Bàn phím: focus vào ô, F2 bật sắp xếp, các phím mũi tên đổi vị trí; Enter/Escape hoặc Xong kết thúc. Người bật Reduce Motion thấy viền đánh dấu thay vì animation. Animation là rung hình ảnh, không phải rung vật lý điện thoại.

## Kỷ niệm
- Header gọn, nút Thêm kỷ niệm chính, tháng phân nhóm, ảnh có ngày và tuổi bé.
- Chuyển Dòng thời gian/Lưới ảnh, tìm tiêu đề hoặc lời nhắn (không phân biệt dấu), lọc tháng. Thao tác trở lại danh sách giữ bộ lọc, giữ vị trí cuộn khi bấm quay lại từ chi tiết.
- Vuốt trái một thẻ khoảng 56px trở lên để lộ Sửa/Xóa; vuốt phải hoặc chạm ra ngoài để đóng. Vuốt dọc để cuộn không mở thao tác. Không tự xóa bằng full swipe. Menu ⋯ cung cấp cùng hành động cho chuột/bàn phím.
- Form ảnh có preview, nút chọn/thay ảnh, tên kỷ niệm, ngày diễn ra, lời nhắn với số ký tự, mẫu thẻ. Không có input tên/ngày sinh bé.
- Tên lấy từ settings.officialName khi showOfficialName bật và có tên, nếu không dùng settings.babyName; fallback hồ sơ linkBaby rồi Bé. Ngày sinh dùng settings.birthDate, fallback hồ sơ linkBaby.dob. Không phụ thuộc hồ sơ người lớn đang được chọn trong sổ sức khỏe.
- Nếu chưa có ngày sinh, vẫn lưu kỷ niệm được, không tính tuổi sai; bổ sung ngày sinh ở màn Thiết lập.
- Hiển thị và xuất thẻ dùng thiết lập hiện tại, không ghi lại metadata lên Cloud nếu chỉ xem. Khi sửa/lưu, lấy lại thiết lập hiện tại trước khi tạo command; command pending vẫn giữ snapshot cũ để retry đúng operation.
- Giữ menu xóa ảnh riêng trong chi tiết, và xóa ảnh bằng checkbox khi sửa. Xóa vĩnh viễn trên Drive vẫn có xác nhận, không đổi backend.

## Nâng cấp
Từ V17.18.1 đã đầy đủ: chỉ deploy frontend. Backend memory-drive vẫn API 17181; không đổi SQL, OAuth, folder hoặc secrets. Nếu cập nhật app mà báo cần Edge V17.18.1 thì backend cũ chưa được nâng cấp đủ, thực hiện hướng dẫn backend nền trong MEMORY_EDITING_V17.18.2.md. Không reset database.

## Kiểm tra
- Trên PWA, giữ/kéo/chạm ra ngoài; đóng mở lại để kiểm tra thứ tự.
- Nhấn ngắn mở Bé bú/Tã/Kỷ niệm bình thường; cuộn dọc không kích hoạt giữ.
- Thiết lập tên và ngày sinh; thêm/sửa kỷ niệm không thấy hai input đó; tuổi và thẻ xuất dùng thiết lập đúng.
- Vuốt trái → Sửa, Hủy, menu ⋯; Xóa rồi Hủy không gọi backend. Xóa thật cần xác nhận và kiểm tra Drive sau deploy.
- Kiểm tra light/dark ở điện thoại/desktop. Kiểm tra Safari/PWA iPhone thật trước khi kết luận thao tác giống thiết bị thực.

## Giới hạn và rollback
Không thêm album/video/HEIC/phân trang, không đồng bộ layout các thiết bị. Giữ nguyên 500 kỷ niệm mới nhất và bộ phục hồi của V17.18.1. Không xóa Google secrets hay bảng khi rollback frontend V17.18.1; thứ tự local được bỏ qua bởi bản cũ nhưng giữ để quay lại V17.18.2. Nếu đang có command pending, hoàn tất bằng Tiếp tục lần lưu trước trước khi xóa dữ liệu trình duyệt.
