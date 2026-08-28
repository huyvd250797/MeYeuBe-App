# AC V15.0.71 — MilkIdentityDoctorUIFix

- Cloud Sync hiển thị trực tiếp card **Milk Identity Doctor** dưới khu vực Đẩy dữ liệu chính thức.
- Không phụ thuộc vào placeholder `cloudConfigExtra/cloudConfigBox` không tồn tại.
- Nút **Kiểm tra Milk Identity** gọi RPC `myb_relational_milk_identity_doctor`.
- Doctor vẫn là read-only, không sửa/xóa dữ liệu.
- Giữ logic V15.0.70: chống double ID legacy/UUID và chuẩn hóa Bình/Túi.
