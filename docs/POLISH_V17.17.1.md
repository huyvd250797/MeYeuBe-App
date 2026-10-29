# V17.17.1 — Packing Simple Lists

Hai cấp: chỉ danh sách chuyến khi vào module; chi tiết được mở khi chọn chuyến. CSS scope mạnh :root body #packingLists để override nút/card lớn từ legacy; input vẫn 16px, checkbox22px, dòng tối thiểu58px, header cột Đã chuẩn bị92px. Các thao tác chuyến gộp menu, item chỉ mở editor bằng tên; icon chọn từ danh sách emoji.

Trạng thái ngày dùng ISO date ordinal UTC để so lịch (không lệch DST), mốc hôm nay lấy helper today() Việt Nam. >7 chưa đi, 1–7 sắp tới, <=0 đang diễn ra; archived ưu tiên hoàn thành. Chỉ action complete của chuyến đang diễn ra được ghi. Chuyến không ngày giữ dữ liệu và hiển thị Chưa chọn ngày.

Drag giữ450ms, trước ngưỡng di chuyển10px thì hủy để cuộn. Tay nắm touch-action:none; cả dòng dùng pan-y và touchmove chỉ chặn khi đang kéo. Pointer capture, pointercancel/blur/ẩn trang hủy không lưu. Đánh dấu vị trí đích trong nhóm, scroll mép màn hình, lưu một lần khi thả; filter khác all không cho kéo. Đổi vị trí chỉ ghi IDs đúng chuyến qua writer OCC; lỗi không thay data confirmed. Không SQL mới; giới hạn Cloud/cơ chế tải lại kế thừa V17.17.0.
