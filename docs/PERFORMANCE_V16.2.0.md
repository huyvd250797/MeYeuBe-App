# V16.2.0 — Performance & UI fixes

Nền ZIP16.1 Boss gửi, ngày26/10/2026.

## Nguyên nhân và thay đổi

1. `.infoIcon` vốn16×16 nhưng rule button chung min-height44 làm hình bị dài xuống. Đặt kích thước32×32/flex-basis cố định và padding0. Nút close/menu vẫn44×44.
2. Input native Safari có intrinsic minimum, grid track và padding không tự co khi nội dung ngày dài. Các field dùng border-box/min-width0/max-width100%, track minmax(0,1fr), gap12px; không bỏ date/time picker hoặc đổi dữ liệu đầu vào. Width≤360 chuyển row về1cột; formGrid/row3/row4 gọn trên mobile.
3. boot.js trước tự reload khi controllerchange, ngay cả lần đầu SW claim, hoặc trì hoãn reload tới lúc đóng popup. SW cũng navigate client thiếu ACK. Bản này chặn cả hai đường tự navigation, build mismatch chỉ hiện thông báo. Không kết luận đã tái hiện lỗi trên iPhone của Boss, nhưng đường chạy tự reload trong source đã được loại bỏ và kiểm tra.
4. fetchServer trước đọc shell rồi lần lượt care→health→planning→settings. Nay sau shell, bốn nhóm read cùng chạy, await tất cả rồi hydrate đầy đủ; không giảm độ đầy đủ dashboard. Page/revision/retry của từng nhóm giữ nguyên, thêm guard đích sau await. Không thay ghi/transaction/ledger.
5. showPage bỏ delay500ms chỉ để giả loading. Các màn cần dữ liệu vẫn dùng repository và guard đang có.
6. text-display.js sửa các text node có thể đảo UTF-8/CP1252 và giảm dấu hiệu mojibake. Chạy theo node thay đổi, không quét cả app mỗi tick; không đổi model, database hoặc text đang nhập. Không đủ dữ liệu production để sửa bản ghi cụ thể, không thể đoán ký tự đã mất. Source được đọc UTF-8; không thêm font download.

## Phạm vi hiệu năng

PERFORMANCE_RESULTS_V16.2.0.json dùng code fetchServer thực trước/sau với shell và bốn nhóm delay25ms, cùng output và số request nhóm. Đây là phép đo controlled latency, không phải benchmark toàn app/iPhone/Supabase. Không đổi index DB hay lazy-load; không tuyên bố đã tách hết app.js. Module hiển thị mới nằm ngoài app.js.

## Kiểm tra trên thiết bị thật sau triển khai

Thay trọn source/SW rồi đóng mở lại PWA, không xóa browser data. Kiểm tra dashboard đủ dữ liệu; cấu hình dashboard icon vuông; form bú date/time/textbox ở320/390/768px và zoom; kho mở/đóngX nhiều lần không navigation; popup cha/con giữ scroll; gõ nháp khi có thông báo version mới; sửa/xóa/Undo cữ bú và đối chiếu số dư. Thử tiếng Việt/emoji, text mã hóa sai và file gốc trên gia đình test.

DB đã1590 giữ nguyên;1620 là metadata SELECT. Cơ chế theo Sync-ID/SECDEF cũ không đổi. File/nháp/pending trên thiết bị giữ nguyên. Quay frontend16.1 để điều tra nếu cần, giữ DB1590 và đối chiếu request chờ. Chưa push/deploy; tiếp16.3 PWA Reliability.
