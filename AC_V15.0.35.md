# AC V15.0.35 — StoredFeedAutoAdjustFix

- Mở Sửa một cữ Bé bú từ kho đã dùng nhiều bình/túi.
- Tăng số ml: các bình/túi đang gắn tự tăng lượng theo khả dụng; nếu thiếu thì app tự thêm bình/túi khả dụng tiếp theo.
- Giảm số ml: bình/túi phía sau tự giảm hoặc bị gỡ khỏi cữ; khi lưu, lượng sữa được trả lại kho theo ledger.
- Bấm ✕ trên một bình/túi: form mới chuyển sang THỦ CÔNG và bình/túi đó được loại khỏi cữ hiện tại.
- Khi bấm lưu sau khi bỏ túi, kho sữa tính lại đúng, không giữ cache lượng đã dùng cũ.
- Túi quá hạn/đã đóng vẫn không được auto chọn mới.
