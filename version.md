# V15.0.45 — SupabaseCloudMergeGuardFix

- Chặn lỗi dữ liệu mới bị máy khác ghi đè trong Supabase Cloud DB Mode.
- Cloud DB save/fetch/pull/push/realtime dùng merge guard, không overwrite nguyên DB một chiều.
- Ưu tiên giữ record mới từ mọi thiết bị.

# V15.0.45 — SupabaseCloudDBMode

- Fix lưu ảnh trong tệp đính kèm Sổ sức khỏe → Hồ sơ.
- Hỗ trợ ảnh, PDF và file khác; ảnh nén lỗi sẽ tự fallback sang FileReader để không mất file.
- Cho phép xem/sửa/thay lại file đính kèm đã lưu.

# V15.0.45 — SupabaseCloudDBMode

- Fix Bé bú từ kho: hủy phần còn lại cập nhật kho ngay qua ledger.
- Fix bỏ túi bằng ✕ hoàn khả dụng để chọn lại thủ công.
- Fix scroll sidebar/modal và gom tệp đính kèm hồ sơ sức khỏe.

# V15.0.45 — SupabaseCloudDBMode

- Fix menu/sidebar trên mobile: nav group cuộn được, phần phiên bản sát đáy hơn, giảm khoảng trống dư bên dưới.
- Bổ sung đính kèm ảnh giấy khai sinh, BHYT/bảo hiểm và tệp khác trong Sổ sức khỏe → Hồ sơ.
- Ảnh đính kèm được nén, lưu kèm DB/backup và có thể bấm Xem lại.
- Modal Sổ sức khỏe khóa scroll nền, chỉ cho cuộn bên trong modal.
- Giữ các bản vá trước: Smart Alert Cron Push, StoredFeedFastAutoFix, PumpLinkIsolationFix, BabyProfileModalUX.
