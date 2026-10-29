# V17.17.0 — Baby Packing Lists

Module mới src/features/planning/packing.js và packing.css. Dùng settings packingLists thuộc nhóm other với OCC hash, save ACK và pending operation của API1570. Không SQL hoặc dependency mới. Bố cục danh sách trái/nội dung phải trên màn rộng và một cột mobile; scope CSS riêng, input16px. Mẫu chỉ là gợi ý đồ đạc, người dùng tự điều chỉnh, không hướng dẫn y tế.

Danh sách và món có ID riêng; copied items có ID mới và done=false. Archive khóa thay đổi món. Filter và thứ tự không thay số lượng/tồn sữa. Tiến độ tính số mục done/tổng số mục. Editor giữ input nếu validation/conflict/save thất bại; checkbox chỉ phản ánh state confirmed sau render. Guard target/auth tránh ghi checklist gia đình cũ vào kết nối mới.

Giới hạn 50 danh sách, 200 món/danh sách. Xung đột ở nhóm settings.other (không per-item); không merge tự động, phải đối chiếu sau refresh. Thiết bị khác cùng config mở module/Tải lại để cập nhật, không push từng checkbox realtime. Không cần đăng nhập mới.
