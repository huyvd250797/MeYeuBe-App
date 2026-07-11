# Acceptance Criteria — MeYeuBe V10.7.1

## AC-01 — Điều hướng cảnh báo Bú
Given Trung tâm cảnh báo có cảnh báo cữ bú quá giờ
When người dùng bấm Ghi nhận bú
Then popup phải đóng
And app phải mở màn hình Ghi nhận chăm sóc
And loại chăm sóc được chọn sẵn là Bé bú.

## AC-02 — Điều hướng cảnh báo Thân nhiệt
Given Trung tâm cảnh báo có cảnh báo thân nhiệt vượt ngưỡng
When người dùng bấm Ghi nhận thân nhiệt
Then app phải mở màn hình ghi nhận Thân nhiệt
And form Thân nhiệt phải hiển thị đúng trường nhập nhiệt độ và vị trí đo.

## AC-03 — Rule thân nhiệt đạt ngưỡng
Given ngưỡng thân nhiệt được cấu hình là 37.9°C
And bản ghi thân nhiệt mới nhất có amount = 38.0
When Rule Engine được tính lại
Then phải tạo cảnh báo Critical thân nhiệt.

## AC-04 — Rule thân nhiệt chưa đạt ngưỡng
Given ngưỡng thân nhiệt được cấu hình là 37.9°C
And bản ghi thân nhiệt mới nhất có amount = 37.8
When Rule Engine được tính lại
Then không được tạo cảnh báo thân nhiệt.

## AC-05 — Tương thích dữ liệu thân nhiệt cũ
Given bản ghi thân nhiệt cũ lưu ở temperature, value hoặc extra.temperature
When Rule Engine được tính lại
Then vẫn phải đọc đúng nhiệt độ.

## AC-06 — Icon trạng thái
Given không có cảnh báo
Then Dashboard hiển thị 💚 Hôm nay mọi thứ đều ổn.
Given cảnh báo cao nhất là Warning hoặc Info
Then Dashboard hiển thị ⚠️ Có X việc cần chú ý.
Given cảnh báo cao nhất là Critical
Then Dashboard hiển thị 🆘 Có việc cần xử lý ngay.

## AC-07 — Regression toàn bộ Rule Engine
Given source V10.7.1
When chạy automation test
Then các rule thân nhiệt, bú, ngủ, kho sữa và lịch khám phải đạt PASS.

## AC-08 — Không hồi quy
Then Realtime JSON Sync, Cloud Sync thủ công, Dashboard, Timeline, Kho sữa, Avatar, Export/Import và localStorage key phải được giữ nguyên.
