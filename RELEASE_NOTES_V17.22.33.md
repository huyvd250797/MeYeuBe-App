# MeYeuBe V17.22.33 — Mid-Autumn Card Motion Fidelity

Nền nâng cấp: source V17.22.31 do người dùng cung cấp. Tiếp tục đánh số sau V17.22.32.

- **Đèn ông sao (starLantern)**: đèn phát sáng rõ theo nhịp, đung đưa, đom đóm chuyển động và ánh sáng lướt qua bánh Trung thu.
- **Trăng rằm (clouds)**: mặt trăng giữ nguyên hình tròn; mây trôi qua độc lập, đèn trời bay lên, đốm sáng lung linh và bánh phát sáng.
- Hai hoạt ảnh được dựng riêng từ artwork trong source và mẫu GIF đã duyệt, xuất WebP động RGBA để chạy sắc nét, tiết kiệm băng thông; kèm hai GIF trong thư mục previews.
- Hiệu ứng CHỈ nằm trong ảnh minh họa card Bé Bún (và khung xem thử ở phần cấu hình), không chạy ở header, các block khác, hoặc thanh điều hướng. Không nén chữ/ảnh avatar vào video.
- Bật/tắt thông qua công tắc hiệu ứng mùa, chế độ Tĩnh, cấu hình Cloud Sync và `prefers-reduced-motion`. Ẩn trang/thẻ thì ngừng giải mã ảnh động.
- Đổi phiên bản app, cache PWA và bundle thành V17.22.33. Không thay đổi lược đồ dữ liệu/SQL.

> Hai ảnh WebP trong `src/features/seasonal/art/midautumn-{star,moon}-motion-v33.webp` là layer trong suốt; chúng chồng lên `midautumn-photo-hero-v3.webp` hiện có, không tự chứa UI hay thông tin bé.
