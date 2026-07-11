# Acceptance Criteria — MeYeuBe V10.7.0 Smart Alert

## AC-01 — Rule Engine dùng cấu hình
Given người dùng đã cấu hình ngưỡng cảnh báo
When Dashboard được render
Then mọi cảnh báo phải được tính từ cấu hình đã lưu và không dùng ngưỡng nghiệp vụ rải rác.

## AC-02 — Ba mức ưu tiên
Given có nhiều cảnh báo
When Alert Center hiển thị
Then cảnh báo được phân loại và sắp xếp Critical → Warning → Info.

## AC-03 — Dashboard gọn
Given Smart Alert được bật
When mở Dashboard
Then chỉ hiển thị một thẻ tóm tắt nhỏ, không bung toàn bộ danh sách.

## AC-04 — Không có cảnh báo
Given không rule nào được kích hoạt
When mở Dashboard
Then hiển thị “Hôm nay mọi thứ đều ổn”.

## AC-05 — Có cảnh báo
Given có Warning hoặc Critical
When mở Dashboard
Then hiển thị mức cao nhất và tổng số việc cần chú ý.

## AC-06 — Xem chi tiết
Given người dùng bấm thẻ Smart Alert
When popup mở
Then hiển thị đầy đủ cảnh báo và hành động liên quan.

## AC-07 — Cấu hình rule
Given người dùng thay đổi rule
When lưu cấu hình
Then Dashboard tính lại cảnh báo ngay.

## AC-08 — Realtime
Given hai thiết bị cùng Sync ID
When thiết bị A cập nhật dữ liệu
Then thiết bị B tính lại cảnh báo sau khi nhận dữ liệu Cloud.

## AC-09 — Cảnh báo hết hiệu lực
Given điều kiện cảnh báo không còn đúng
When Dashboard render lại
Then cảnh báo tương ứng biến mất.

## AC-10 — Regression
Given nâng cấp từ V10.6.0
When kiểm tra release
Then Realtime, Cloud Sync, Dashboard, nhật ký, avatar, thuốc, thân nhiệt, kho sữa và Export/Import vẫn hoạt động.
