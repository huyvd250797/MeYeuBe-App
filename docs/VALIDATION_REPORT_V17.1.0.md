# V17.1.0 — Kiểm thử local

43 bộ hồi quy hiện hữu PASS; thêm milk-insights9 kiểm tra và form-footers7 kiểm tra PASS: tổng45 bộ. Chi tiết lệnh/output trong TEST_RESULTS_V17.1.0.json. Hai bộ bổ sung chạy sau bộ hồi quy; tests/run.py đã đăng ký để lần sau chạy đủ45.

History SQL chạy trên PGlite fixture: số dư130 khi lấy70 từ200; liên kết care; cách ly family; phân trang; báo mismatch không repair; SQL TXT ASCII không BOM. Footer chạy trong jsdom với DOM thật: thứ tự Hủy/Lưu, handler thật chỉ chạy1 lần, disabled guard, giữ input và không nhân đôi qua MutationObserver. Release check xác minh version/cú pháp/assets; ZIP allowlist/CRC/byte compare khi đóng gói.

Chưa kiểm thử Supabase production, Safari/iPhone/keyboard/safe area hình học hoặc đa thiết bị thật. Không tuyên bố UI đã được xác minh pixel trên iPhone. Không push/deploy hoặc chạy migration trên DB của Boss. Danh sách kho vẫn lọc cache native hiện có; riêng lịch sử là RPC scoped và phân trang. Lịch sử là sổ hiện hành, không phải audit bất biến của các lần sửa/xóa trước đó. Không tự sửa lệch ledger.

Sau deploy cần kiểm tra: form chăm sóc, sức khỏe, chuyển sữa, timer và các form trang; footer không che input khi bật bàn phím; draft/pending/Undo; lọc kho/nguồn chuyển và lịch sử nhiều trang; không cho thao tác ảnh hưởng gia đình khác.
