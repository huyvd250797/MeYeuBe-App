# V15.0.33 — PumpLinkIsolationFix

- Cô lập liên kết Hút sữa ↔ Kho sữa: mỗi lần hút chỉ được sở hữu một bình/túi riêng.
- Không cho form sửa Hút sữa lấy linkedBagId của lần hút khác.
- Tự phát hiện dữ liệu cũ bị trùng linkedBagId đang còn sữa và tách liên kết an toàn.
- Chặn lưu Hút sữa vào bình đang còn sữa của lần hút khác.
