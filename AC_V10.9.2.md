# AC V10.9.2 — Cloud Compatibility Recovery Hotfix

- AC-01: Dữ liệu Cloud cũ tại Sync ID `main` phải được phát hiện khi cấu hình hiện tại không có dữ liệu hợp lệ.
- AC-02: App tự chuyển cấu hình về Sync ID thực tế đã tìm thấy và thông báo rõ.
- AC-03: Không cho phép local trống ghi đè Cloud đang có dữ liệu.
- AC-04: Không áp dụng payload Cloud rỗng hoặc sai cấu trúc lên local.
- AC-05: Khi local trống và Cloud hợp lệ, Smart Sync phải ưu tiên khôi phục Cloud.
- AC-06: Manual Pull tạo safety backup trước khi áp dụng.
- AC-07: Realtime không áp dụng payload rỗng.
- AC-08: Sync ID `main` vẫn được phép dùng để tương thích dữ liệu cũ; giao diện có thể khuyến nghị đổi sau.
- AC-09: Dashboard, Realtime, Push, Smart Alert, Export/Import và localStorage key không hồi quy.
