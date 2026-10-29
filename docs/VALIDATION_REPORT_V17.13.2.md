# V17.13.2 — Validation

Các kiểm tra mới cho bản này được ghi trong TEST_RESULTS_V17.13.2.json. Không coi báo cáo 59 bộ của V17.13.1 là đã chạy lại ở V17.13.2. Performance/Startup benchmark kế thừa được đánh dấu trong từng JSON và không phải số đo mới.

Kiểm tra nguồn và production dùng jsdom + PGlite, giả lập navigator.vibrate để xác minh thứ tự: chỉ một pulse sau khi số tã tăng; không rung trước ACK; không rung success khi mất ACK; không rung lặp lúc thả; lần giữ mới có pulse mới; cài đặt Rung tắt hoặc thiếu API vẫn lưu an toàn. Kiểm tra giữ cử chỉ, ghi tã, Undo, tồn kho và hồi phục pending cũ được giữ.

Không kiểm chứng motor rung trên điện thoại thật. Safari/iPhone chưa có Vibration API; không cam kết rung trên máy Boss. Chưa push/deploy, không DB production. Không migration SQL.

Kết quả cuối: cài sạch 38 packages thành công, build thành công; source integration 107/107, production integration 110/110; 8/8 bộ kiểm tra được chọn PASS. Đã đối chiếu 17 file backend nguyên byte với ZIP đầu vào và giữ toàn bộ third-party dependency lock entries. Đóng ZIP qua allowlist và kiểm tra checksum/đọc lại bytes.
