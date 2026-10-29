# V17.14.0 — Query & Render Efficiency

Nền đúng ZIP V17.13.1(1).zip Boss cung cấp, không nhập nhánh rung V17.13.2. Không SQL, backend hoặc thư viện mới.

Care UI refresh trước đây gọi global render, nay await mybUI.updates.refresh(['care']) rồi refresh detail/transfer đang mở. Coordinator dùng mybVisibleRendering.run để defer view không hiện; dirty set gom nhiều invalidation, khi mở dùng load() hiện hành, không giữ snapshot cũ. Các chart đã có cơ chế defer vẫn giữ nguyên. Direct calls giữ hành vi cho editor và compatibility.

Read key sắp thuộc tính object đệ quy, giữ thứ tự array và nguyên giá trị. Giữ TTL 5s, clone, invalidation khi mutation, epoch chống response cũ, auth/target guards và request không tự retry.

Scoped summary force trước chỉ bỏ cache 15s ở repository nhưng vẫn trúng cache RPC 5s. Force nay invalidate cả hai; không phải auto refresh nền. Summary trả clone, key chứa anonKey, kiểm tra enabled/onLine trước cache, giới hạn 80 entry. Không đưa credential vào báo cáo timing.

Kiểm tra xác định: hai query khác thứ tự object cần 1 RPC thay 2; 20 yêu cầu cập nhật timeline đang ẩn cần 0 render trong lúc ẩn, 1 render dữ liệu mới nhất khi mở. Đây là số đếm local được kiểm thử, không phải cam kết tốc độ mạng/iPhone hoặc giảm mọi query 50%.

Giữ cold gate, refresh ấm, fullscreen, native ID, nhiều lần đo, tã +1, pending/lost ACK và Undo. Chi tiết kiểm chứng xem VALIDATION_REPORT_V17.14.0.md. Chưa deploy hoặc nghiệm thu iPhone.

Giới hạn: dashboard đang hiện vẫn dựng ở cấp module; bản này chưa diff từng thẻ/chỉ số bên trong dashboard. Không thay engine biểu đồ hoặc rút bớt lịch sử.
