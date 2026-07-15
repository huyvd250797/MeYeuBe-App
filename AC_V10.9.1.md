# HVUS v1.1 — Acceptance Criteria V10.9.1 Startup Hotfix

## AC-01 — Splash không treo
Given ứng dụng được mở trên iPhone/PWA
When một module khởi tạo phụ phát sinh lỗi
Then Splash phải tự đóng tối đa trong 3 giây
And Dashboard hoặc giao diện chính vẫn có thể sử dụng.

## AC-02 — Khởi tạo độc lập
Given một hàm reset, Storage Health, Push hoặc Cloud Sync lỗi
When ứng dụng khởi động
Then lỗi chỉ được ghi vào console
And không ngăn các bước khởi tạo còn lại.

## AC-03 — Cloud không chặn UI
Given Cloud đang chậm, mất mạng hoặc Supabase lỗi
When ứng dụng mở
Then giao diện phải render trước
And Cloud Auto Pull/Realtime chạy bất đồng bộ sau đó.

## AC-04 — Fallback toàn cục
Given sự kiện load bị trì hoãn
When quá 5 giây
Then Splash phải bị ẩn bằng global fallback.

## AC-05 — Regression
Given nâng cấp từ V10.9.0
When chạy Release Gate
Then Realtime, Push, Smart Alert, Dashboard, Export/Import, Kho sữa và localStorage key vẫn được giữ nguyên.
