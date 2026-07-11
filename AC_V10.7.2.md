# Acceptance Criteria — MeYeuBe V10.7.2

## AC-01 — Điều hướng từ Trung tâm cảnh báo
**Given** người dùng đang mở Trung tâm cảnh báo  
**When** bấm hành động Ghi nhận của cảnh báo Bú hoặc Thân nhiệt  
**Then** popup cảnh báo phải đóng  
**And** màn hình Ghi nhận chăm sóc phải được mở  
**And** đúng loại chăm sóc tương ứng phải được chọn sẵn.

## AC-02 — Không lỗi onclick
**Given** cảnh báo có action  
**When** action được render trong HTML  
**Then** thuộc tính `onclick` phải hợp lệ và không bị phá vỡ bởi dấu ngoặc kép lồng nhau.

## AC-03 — Block Smart Alert có thể cấu hình vị trí
**Given** người dùng mở Cấu hình Dashboard  
**When** xem danh sách block  
**Then** phải có block `Trung tâm cảnh báo`  
**And** block có thể di chuyển lên/xuống  
**And** có thể bật/tắt hiển thị.

## AC-04 — Giữ tương thích cấu hình cũ
**Given** dữ liệu cũ đang lưu module id `alerts`  
**When** nâng cấp lên V10.7.2  
**Then** cấu hình cũ vẫn hoạt động và không cần migration.

## AC-05 — Thông tin lúc sinh mặc định mở
**Given** người dùng mở Dashboard  
**When** block Thông tin bé được render  
**Then** phần `Thông tin lúc sinh` phải ở trạng thái mở mặc định  
**And** hiển thị giờ sinh và bệnh viện sinh nếu có.

## AC-06 — Regression
**Given** nâng cấp từ V10.7.1  
**When** chạy Release Gate  
**Then** Smart Alert Rule Engine, Realtime, Cloud Sync, Dashboard, Timeline, Avatar, Export/Import và localStorage key phải được giữ nguyên.
