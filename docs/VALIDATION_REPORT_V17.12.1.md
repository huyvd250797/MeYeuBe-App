# V17.12.1 — Health UI Repair validation

59/59 bước đạt sau các lượt sửa/chạy lại phù hợp. npm ci cài sạch38 package; dependency-lock đạt, mọi entry thư viện bên thứ ba giữ nguyên. Build production có AST parity và hashed assets, worker/lazy/cache đạt. Backend17 tệp nguyên byte, không SQL mới.

## Kiểm tra bổ sung

Source/production integration mở renderer tiêm chủng hiện hành, xác nhận một header/nút thêm và không có hero lặp; menu ghi nhận có một nút đo chung; profile có shortcut giấy khai sinh/BHXH; computed grid có minmax(0,1fr) và min-width bằng0; production kiểm tra back/close kế hoạch và loại tệp chọn đúng trong form thật. Source fixture chỉ chạy phần có dependency hiện diện, production có đầy đủ Media Storage/Planning.

Media-runtime21 PASS: môi trường thiết bị mới với IndexedDB trống không có file local nhưng mở Cloud URL được cho Giấy khai sinh và BHXH, cùng các ca upload/retry/đổi đích/mất mạng/giữ bản gốc. Đây là mock transport; chưa phải hai điện thoại hoặc bucket production.

Hồi quy lưu/sửa/xóa/Undo, ledger, mất ACK, health/medication/vaccine/visit/lab/file, backup, notification, viewport, keyboard/pinch/rotation vẫn đạt.

Lượt đầu có assertion CSS so sánh chuỗi0 trong khi computed style trả0px; sửa so sánh số, không nới điều kiện grid. Bổ sung await đường back vì showPage có thể tải dữ liệu bất đồng bộ, thêm Đóng về home. Benchmark latency25ms lỗi dưới tải fixture song song; chạy riêng giữ assertion gốc đạt. Giữ log lần đầu và lần chạy lại trong TEST_RESULTS.

## Giới hạn và nghiệm thu

Không có phép đo bounding rect hoặc screenshot bằng Safari/WebKit native trong phiên này; jsdom không thực hiện layout mobile như browser. Các rule min-width0, track co được và wrap được kiểm tra ở mức DOM/CSS; chưa khẳng định hình ảnh320/390/430px đã nghiệm thu thực tế. Chưa deploy/push hoặc kết nối Supabase production. Cần so ảnh trên thiết bị sau deploy. Source không dùng overflow:hidden toàn trang để giấu tràn.

File Cloud dùng backend Media Storage cũ đã cấu hình. File chỉ cục bộ phải chuyển từ thiết bị có bản gốc; không tự có bytes trên thiết bị khác. Chỉ báo thành công sau upload và metadata ACK. ZIP kiểm tra allowlist, checksum và đọc lại toàn bộ tệp.
