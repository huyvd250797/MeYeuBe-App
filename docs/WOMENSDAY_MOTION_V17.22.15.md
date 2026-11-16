# V17.22.15 — Chuyên đề Quốc tế Phụ nữ 08/03

## Thiết kế đã duyệt
- Nền gradient hồng tím, bó hoa hồng phía phải; không còn khung vàng trang trí hay tiêu đề ở mép trên card.
- Tách riêng các lớp ảnh: `womensday-rose-scene-v8.webp` (nền hoa bất động), `womensday-butterfly-v8.webp` (bướm trong suốt), `womensday-petal-v8.webp` (cánh hoa hồng).
- Đúng 2 lựa chọn hiện có của Cloud Sync: `butterflies` và `petals`. Chế độ `still` không vẽ sprite.

## Chuyển động
- A: 3 con bướm trong vùng phía phải card, đường cong lệch pha, wing flutter nhẹ, không đè chữ.
- B: 11 cánh hồng tối đa đồng thời theo nhiều độ sâu, rơi theo quỹ đạo cong, vận tốc lệch nhau và xoay; không chạy bướm.
- Canvas trong suốt, cắt lớp ảnh trong vùng hero và 30 FPS giới hạn ở engine; không thay đổi layout.

## QA
1. Chọn 08/03 và `Bướm bay quanh bó hoa`: xác nhận thấy bướm thực, không thấy cánh hoa động.
2. Chọn `Cánh hoa hồng rơi`: thấy cánh hồng chuyển động, không thấy bướm.
3. Chọn `Tĩnh`: không thấy các lớp động.
4. Thử preview và app thật trên iPhone; thử chuyển chế độ và reload trang; kiểm tra không che avatar, nút chuông, tên bé và thanh cữ bú.
5. Kiểm tra tất cả 20 theme và các theme đã chốt, deploy mới qua Service Worker.

Kiểm thử mã/production build không thay thế được kiểm chứng giao diện trực tiếp trên iPhone.
