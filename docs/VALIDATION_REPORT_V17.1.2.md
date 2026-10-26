# V17.1.2 — Fullscreen Viewport Fix

Form chăm sóc dùng một module trình bày mới đo visualViewport khi mở, resize/xoay/keyboard và viewport scroll; fallback innerHeight. Khi pinch zoom, không ép kích thước theo viewport đã phóng đại. Overlay dùng height/top pixel và bottom:auto để không bị overconstraint; card height:auto/stretch thay phần trăm chiều cao. Vẫn giữ padding safe-area trong footer và scroller riêng. Module không ghi dữ liệu, không thay handler lưu/hủy hoặc điều hướng.

Bộ form-viewport có 8 kiểm tra với viewport mô phỏng: mở 844px, keyboard 510px/offset 45px, xoay 390px, zoom, fallback, đóng và cấu trúc footer. Đây là logic DOM/style, không phải ảnh render hoặc đo màn hình iPhone thật.

Kết quả hồi quy: 47/47 suite PASS; 0 suite thất bại và 0 lỗi baseline. Chi tiết trong TEST_RESULTS_V17.1.2.json. Release check xác minh cú pháp/version/asset và cache; ZIP kiểm CRC, checksum và byte đối chiếu. 17 file backend giữ nguyên byte so với ZIP 17.1.1 đầu vào: không migration/redeploy Edge.

Chưa có Safari/iPhone hoặc Supabase production; không khẳng định đã kiểm chứng hết khoảng trống trên máy thật. Sau deploy cần xác nhận splash 17.1.2, mở form bú/hút ở đầu và sau khi cuộn trang, xem đáy footer khi chưa mở bàn phím/sau khi đóng bàn phím, xoay máy, lưu/nháp/đóng và swipe kho. Không xóa storage để cập nhật khi còn nháp/pending.

Không push/deploy trong phiên xây dựng. Chỉ bàn giao ZIP sạch.
