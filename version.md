# MeYeuBe V10.6.0

## Realtime JSON Sync

- Auto push dữ liệu sau khi lưu khi Cloud Sync đang bật.
- Subscribe Supabase Realtime theo đúng `Sync ID`.
- Thiết bị khác đang mở app tự nhận dữ liệu mới và render lại Dashboard.
- Chống vòng lặp đồng bộ bằng `deviceId` và `revision`.
- Tự reconnect khi có mạng lại hoặc quay lại app.
- Gộp các mảng dữ liệu trước khi auto push nếu Cloud có revision mới hơn.
- Giữ nguyên nút Đẩy/Tải/Đồng bộ thủ công để sao lưu và khôi phục.
- Giữ nguyên localStorage key `meYeuBePWA_v4`.
