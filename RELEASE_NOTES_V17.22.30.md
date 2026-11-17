# MeYeuBe V17.22.30 — Beach GIF Scene Fidelity Repair

## Vấn đề phát hiện ở V17.22.29
- Hai mảnh ảnh bọt sóng nhỏ không tạo được các đợt nước lớn như GIF đã duyệt.
- Lá dừa cũ được xoay nguyên mảng, không uốn theo gió.
- Ảnh hero cũ trông nhạt hơn mẫu và không thay đổi cùng hoạt cảnh.

## Thay đổi
- Giữ giao diện Mẹ Yêu Bé, card, cữ bú và thanh điều hướng; nâng màu/độ nét ảnh Nghỉ mát.
- A (`wave`): thay mảnh bọt sóng bằng 12 khung hình sóng biển thật, trích từ cảnh động được duyệt; vẽ thành dải liên tục, có mặt nạ bảo vệ ô, dừa, ghế; nội suy khung để chuyển động mượt.
- B (`clouds`): thay xoay mảng lá bằng 12 khung ảnh lá dừa biến dạng liên tục, neo gốc lá, không cắt lát trong thời gian thực.
- Tĩnh (`still`): chỉ hiển thị ảnh, không tải atlas động.
- Giữ nguyên mã lựa chọn đã lưu và đồng bộ của 20 chủ đề; chỉ thay nội dung của Nghỉ mát.
- Asset mới được build và precache trong `dist` của PWA.

## Giới hạn
GIF được tạo từ hình động dựng sẵn và không cung cấp các lớp ảnh gốc riêng biệt. Bản này dùng các khung sóng được cắt từ mẫu cùng ảnh lá dừa xử lý biến dạng, do đó tăng độ tương đồng chuyển động, nhưng không thể cam kết giống từng pixel với GIF. Chưa kiểm thử trực tiếp trên Safari iPhone.
