# Tết Nguyên đán — Motion Fidelity V17.22.9

Ảnh đã duyệt: `5D13...jpeg` cho đèn lồng, `4BE...jpeg` cho mai rơi. Ảnh được trích xuất đúng từ ảnh người dùng gửi.

| Chế độ | Nền | Đối tượng | Chuyển động |
| --- | --- | --- | --- |
| `blossoms` | `tet-mai-scene-v5.webp` | 3 sprite cánh mai được tách từ ảnh gốc | 13 cánh, hành trình liên tục ~9–13 giây, hướng gió nhẹ, không có đèn bay |
| `lantern` | `tet-lantern-scene-v5.webp` | 3 sprite đèn lồng gồm dây, thân, tua rua | Quay quanh neo 1.4–2.1°, lệch pha và chu kỳ, ánh đèn tự nhiên; không có mai rơi |
| `still` | `tet-mai-scene-v5.webp` | Không có | Tĩnh |

**Bảo toàn layout:** ảnh và canvas đều là position absolute, không chiếm flow; cảnh lệch phải để không đè thông tin em bé. Canvas dùng đúng tọa độ ảnh 816×381 và `contain/right/bottom` để đồng bộ mọi tỷ lệ.

**Ảnh đã được xử lý:** chỉ giữ phần phong cảnh, loại bỏ vùng text/bảng điều khiển trong ảnh mẫu; vùng nút chuông và lịch được đưa về trong suốt để hiển thị nút thật của app. Không dùng blur toàn cảnh. Ảnh đèn lồng được cắt và vẽ lại đúng vị trí khi chuyển động.

Ngoài hero, chế độ mai có 6 cánh mai ảnh thật bay thưa qua trang bằng lớp `position:fixed`, luôn `pointer-events:none`, không chiếm chiều cao. Chế độ đèn và Tĩnh xóa lớp này ngay.
