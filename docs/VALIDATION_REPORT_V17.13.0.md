# V17.13.0 — Validation

59/59 bước kiểm tra đạt ở source cuối cùng, không miễn trừ baseline. npm ci cài sạch38 package; build AST parity và guard dependency-lock đạt. Source integration72 và production integration75 PASS, gồm timer/pointer gesture, warm failure, DOM/CSS scope, thao tác theo native ID và cách ly số đo WHO.

Các ca mới: giữ tã1.2s chỉ+1; click phát sinh không cộng; press tiếp+1; cuộn hủy; trạng thái timer mở editor không sheet và giữ startedAt; Stop danger; body padding0 khihomevisible và không lan trang khác; warm refresh lỗi giữ ready/data không splash; timeline hai bản ghi cùng ngày có1heading; đảo thứ tự vẫn sửa đúng nativeID; WHO không dùng mirror của hồ sơ khác.

Health runtime56, realtime35, viewport/form/fullscreen, care/milk/ledger/Undo, lost ACK, backup, media, notifications và design-system đều đạt. Sau thay source WHO và các chi tiết layout đã chạy lại source/production integration, health runtime, feature hash audit và worker/build tests.

Startup regression ban đầu vẫn đòi lỗi refresh ấm phải quay về splash theo nghiệp vụ cũ, nên không phù hợp yêu cầu mới. Đã cập nhật rõ: warm fail giữ ready/data; giữ nguyên bài cold tải trễ4.7s không lộ dashboard; thêm cold fail vẫn khóa và retry khôi phục. Chạy riêng13/13 PASS, không bỏ case chặn dashboard rỗng. Báo cáo tổng hợp các lần chạy độc lập, không tuyên bố một lần npm test tuần tự đã chạy nguyên vẹn.

Đối chiếu17 tệp Supabase nguyên byte so với ZIP V17.12.1; dependency bên thứ ba giữ nguyên. Không migration SQL. Các root/module mới tham chiếu từ HTML/SW và được bundle, viewport.css vẫn cuối.

Giới hạn: jsdom/PGlite/worker mô phỏng, chưa native iPhone, Vercel hoặc database production. Số đo benchmark local không là bảo đảm thời gian mạng. Nguồn WHO/ledger không thay thuật toán, chỉ loại mirror khác chủ và chuẩn hóa hiển thị; biểu đồ gộp ngày nhưng lịch sử giữ từng lần đo.
