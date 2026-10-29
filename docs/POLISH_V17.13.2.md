# V17.13.2 — Quick Diaper Haptics

Nền: MeYeuBe_v17.13.1(1).zip. Bổ sung callback axHaptic('success') sau run đã accept ACK, render và tạo Undo. Helper chung dùng pattern [12], thiết lập axPrefs().haptic và throttle 140ms nên toast success không rung thêm lần nữa. Gesture đã vượt ngưỡng tắt AX_PRESS.tracking để pointerup không phát rung light. Không đổi thời điểm commit, số tã, Undo hoặc retry.

Hủy cử chỉ trước ngưỡng không vào callback lưu. Lưu chưa ACK/UNKNOWN_OUTCOME không phát rung success; pending và verify giữ nguyên. Khi tắt Rung hoặc thiếu navigator.vibrate, dữ liệu vẫn lưu bình thường. Không cố kích hoạt rung qua control ẩn, không thêm bridge native chưa có app hỗ trợ.

Safari/iOS chưa hỗ trợ navigator.vibrate theo dữ liệu MDN và issue WebKit. Không hứa rung phần cứng trên iPhone/PWA; muốn bảo đảm đúng mốc ACK trên iPhone cần cơ chế native hợp lệ trong một bản app riêng.

Tham khảo đã kiểm tra ngày 29/10/2026:
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
- https://bugs.webkit.org/show_bug.cgi?id=288846

Kiểm tra hiện hành và giới hạn xem VALIDATION_REPORT_V17.13.2.md. Không SQL/backend/dependency mới. Chưa deploy hoặc kiểm chứng thiết bị thật.
