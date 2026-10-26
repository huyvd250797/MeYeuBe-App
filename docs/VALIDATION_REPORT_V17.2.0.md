# V17.2.0 — Kiểm tra

Module Health Planning và loading/update được kiểm tra bằng DOM/runtime mô phỏng. Bộ hồi quy SQL dùng PostgreSQL fixture qua PGlite, không phải production. Không có thay đổi Supabase hoặc migration mới. ZIP được kiểm CRC/checksum/đối chiếu byte.

Cần kiểm tra sau deploy trên iPhone: một loading/version; lỗi tải vẫn có retry; dashboard đầy đủ trước update notice; bộ lọc và hồ sơ khi có hai người cùng quan hệ; lưu lịch, đánh dấu đã khám, sửa vaccine và mở tệp; fullscreen/keyboard; nháp và swipe kho. Không xóa storage khi còn dữ liệu chưa xác nhận.

Kết quả cuối: 48/48 suite PASS, 0 lỗi baseline. Bộ Health Planning có 15 kiểm tra; planning runtime có 34 kiểm tra, gồm lưu/đọc native member và đánh dấu Đã khám bằng SQL fixture; care runtime 38 và UI Recovery 45 kiểm tra. Các lần chạy lại sau sửa harness chờ startup và cập nhật kỳ vọng loading/cascade được giữ trong TEST_RESULTS_V17.2.0.json. Không bỏ qua suite thất bại. 17 file Supabase giữ nguyên byte so với ZIP đầu vào.
