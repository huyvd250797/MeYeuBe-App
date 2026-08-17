# AC V15.0.43 — StorageQuotaFix

- DB lớn vẫn thêm được ghi nhận Hút sữa/Bé bú nếu lỗi do file đính kèm base64 làm đầy localStorage.
- DataGuard không còn ghi snapshot nguyên DB vào localStorage.
- File đính kèm Sổ sức khỏe được lưu riêng trong IndexedDB, DB chính chỉ giữ metadata.
- File cũ dạng dataUrl được tự migrate sang IndexedDB khi mở app.
- Thông báo “Thêm ghi nhận thành công” chỉ hiện sau khi dữ liệu đã lưu thành công.
