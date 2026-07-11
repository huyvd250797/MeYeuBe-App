# Release checklist

1. Chạy `python release_check.py`.
2. Test import/export và Cloud Sync.
3. Test Dashboard ở light/dark mode.
4. Test thêm, sửa, xóa từng loại chăm sóc.
5. Test cấu hình chỉ số, thứ tự, mục tiêu và taskbar.
6. Kiểm tra version, manifest và service-worker cache.
7. Xuất JSON backup trước khi deploy production.


## V10.6.0 Realtime JSON Sync
- [x] AC được định nghĩa trong `AC_V10.6.0.md`.
- [x] Chỉ còn một business source `app.js`.
- [x] Supabase JS client được nạp.
- [x] Subscribe theo `Sync ID`.
- [x] Có device ID, revision và chống loop.
- [x] Có reconnect online/foreground.
- [x] Giữ manual push/pull và cảnh báo.
- [x] SQL publication Realtime đã được bổ sung.
- [x] `release_check.py` PASS.
- [x] `test_v1060.py` PASS.
- [ ] Manual test hai thiết bị thật sau khi chạy `supabase_setup.sql`.


## V10.7.0 Smart Alert Gate
- [x] AC_V10.7.0.md hoàn chỉnh
- [x] Rule Engine dùng cấu hình
- [x] Critical / Warning / Info
- [x] Dashboard summary gọn
- [x] Alert Center popup
- [x] Realtime render giữ nguyên
- [x] Regression modules PASS
- [x] JavaScript syntax PASS
