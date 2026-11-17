# MeYeuBe V17.22.28 — Vu Lan Approved Motion Repair

Sửa hai hiệu ứng Lễ Vu Lan theo thiết kế đã duyệt, trên source V17.22.27 do người dùng cung cấp.

| Lựa chọn | Hiệu ứng mới |
|---|---|
| `floatingLotus` | Ảnh hoa đăng thực tế trên mặt hồ trôi nhè nhẹ, ba nhịp khác nhau; phản chiếu đi theo hoa đăng |
| `candlelight` | Đèn lồng chụp từ mẫu Vu Lan lay nhẹ, đốm lửa hoa đăng thay đổi độ sáng và cánh hồng rơi |
| `still` | Giữ nguyên ảnh nền Vu Lan, không tạo hoạt ảnh |

Bản này dùng riêng `drawVulan()`, giữ ảnh nền ngôi chùa, tên bé, tất cả card, taskbar và chế độ tiết kiệm chuyển động `prefers-reduced-motion`. Các lựa chọn A/B giữ nguyên ID và lưu Cloud Sync không bị thay đổi.

Không có database migration mới. Đã đưa vào bộ precache offline của PWA. Trước deploy cần sử dụng toàn bộ thư mục `dist`.
