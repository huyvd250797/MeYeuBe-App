# V15.0.53 — HealthBookSaveConflictFix

- Fix lỗi Sổ sức khỏe lưu thành công rồi bị Cloud/realtime kéo bản cũ ghi đè.
- Merge hồ sơ thành viên theo `id` trước để sửa tên không làm tách/trùng hồ sơ.
- Stamp `_hbLocalCommitAt` khi lưu hồ sơ để bản vừa sửa luôn thắng bản cũ.
- Giữ Ba/Mẹ khi merge Cloud DB và không hồi về dữ liệu cũ của Bé.

# V15.0.53 — HealthBookSaveConflictFix

- Fix Sổ sức khỏe bị nhân nhiều hồ sơ “Bé” khi Cloud DB/cache trống merge vào.
- Sửa merge cho `db.hb.members` vì đây là mảng lồng trong object `hb`, không phải top-level array.
- Thêm archive hồ sơ thành viên có dữ liệu để phục hồi Ba/Mẹ khi thiết bị khác đẩy bản thiếu.
- Dedupe các hồ sơ Bé rỗng sinh ra từ nhiều thiết bị, giữ hồ sơ Bé giàu dữ liệu nhất.
- Khi render Sổ sức khỏe, members được repair trước để không hiển thị sai toàn Bé.

# V15.0.53 — StartupLoadingWatchdogFix

- Fix lỗi kẹt loading khi mở app trong Supabase Cloud DB Mode.
- Preload cache IndexedDB nhanh, kéo Supabase có timeout an toàn.
- Nếu Cloud chậm, app mở cache trước và đồng bộ nền, không đứng mãi ở splash/loading.

# V15.0.53 — StoredFeedInventoryLinkFix

- Fix Bé bú từ kho: nhập ml tự động lấy bình/túi theo hạn dùng gần nhất.
- Fix picker thủ công không thấy bình/túi do đọc nhầm localStorage cũ thay vì Cloud DB/cache hiện tại.
- Tăng/giảm ml tự co/giãn lượng lấy từ kho; chỉ bấm ✕ túi mới chuyển sang thủ công.
- Túi vừa bỏ bằng ✕ được hoàn khả dụng để chọn lại thủ công.

# V15.0.53 — QuietCloudToastFix

- Tối ưu toast Cloud/merge lúc khởi động.
- Chỉ báo “Đã kết nối” khi Cloud hoàn tất và không lỗi.

# V15.0.53 — QuietCloudToastFix

- Fix lỗi xóa dữ liệu trên máy A nhưng máy B đồng bộ làm record xuất hiện lại.
- Thêm `_sync.tombstones` để ghi nhận thao tác xóa theo record.
- Khi merge Cloud DB, record cũ hơn tombstone sẽ bị loại bỏ, không bị hồi sinh.
- Trước khi lưu Cloud, app fetch bản Cloud mới nhất, merge rồi commit bằng CAS theo `updated_at`.
- Nếu Cloud vừa thay đổi trong lúc máy đang lưu, app tự fetch lại, merge lại và thử commit lại.

# V15.0.53 — SupabaseCloudDBMode

- Fix lưu ảnh trong tệp đính kèm Sổ sức khỏe → Hồ sơ.
- Hỗ trợ ảnh, PDF và file khác; ảnh nén lỗi sẽ tự fallback sang FileReader để không mất file.
- Cho phép xem/sửa/thay lại file đính kèm đã lưu.

# V15.0.53 — SupabaseCloudDBMode

- Fix Bé bú từ kho: hủy phần còn lại cập nhật kho ngay qua ledger.
- Fix bỏ túi bằng ✕ hoàn khả dụng để chọn lại thủ công.
- Fix scroll sidebar/modal và gom tệp đính kèm hồ sơ sức khỏe.

# V15.0.53 — SupabaseCloudDBMode

- Fix menu/sidebar trên mobile: nav group cuộn được, phần phiên bản sát đáy hơn, giảm khoảng trống dư bên dưới.
- Bổ sung đính kèm ảnh giấy khai sinh, BHYT/bảo hiểm và tệp khác trong Sổ sức khỏe → Hồ sơ.
- Ảnh đính kèm được nén, lưu kèm DB/backup và có thể bấm Xem lại.
- Modal Sổ sức khỏe khóa scroll nền, chỉ cho cuộn bên trong modal.
- Giữ các bản vá trước: Smart Alert Cron Push, StoredFeedFastAutoFix, PumpLinkIsolationFix, BabyProfileModalUX.
