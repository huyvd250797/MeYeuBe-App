# V17.1.1 — UI Recovery

46 bộ kiểm thử có kết quả PASS sau rerun đích. Lượt npm test ban đầu có2 lỗi ở lần lưu đầu của health/planning do harness dùng sleep cố định lúc khởi động. Harness được sửa chờ mybRelationalRealtimeV1577.start() hoàn tất; không đổi assertion/nghiệp vụ. Rerun health56 và planning30 PASS; output ban đầu và rerun được giữ trong TEST_RESULTS_V17.1.1.json.

Bộ ui-recovery45 kiểm tra: renderer kho cũ, tổng quan/bộ lọc cũ, không còn miFilters; các nút Sửa/Chuyển/Hủy và dispatch touchstart/move/end qua document để mở swipe. Bộ này cũng chạy lưu hút/bú, timeout/lostACK, transfer/cancel/Undo và dữ liệu liên quan như care runtime. Hai kiểm tra CSS contract xác minh overlay dùng100dvh, border-box, reset padding đáy và footer ngoài vùng cuộn; đây không phải phép đo hình học iPhone.

17 file backend giữ nguyên byte so với ZIP1710 đầu vào; không migration mới/redeploy Edge. Giữ API lịch sử1710 đã có. Gỡ giao diện lọc kho mới, không đổi bản ghi/số dư hoặc hard-delete sữa. Hủy sữa vẫn qua giao dịch nghiệp vụ và Undo hiện hữu.

Cấu trúc/cú pháp, stylesheet/offline assets, allowlist, checksum/CRC/byte ZIP được kiểm tra lúc phát hành. Chưa có Safari/iPhone thật, visual viewport/keyboard/safe-area thực hoặc Supabase production. Không push/deploy. Cần kiểm tra PWA thật sau nhận phiên bản mới: đáy footer, ngày giờ2x2, vuốt ngang và cuộn dọc, nháp/Lưu/Hủy và đóng form.
