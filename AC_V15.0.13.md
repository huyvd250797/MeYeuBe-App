# AC V15.0.13 — DataSafeFix

- Lưu Bé bú rồi mở lại app không bị Cloud auto pull ghi đè mất dữ liệu local.
- Realtime từ thiết bị khác dùng merge an toàn thay vì replace toàn bộ DB.
- Smart Sync/Auto Pull dùng merge an toàn.
- Manual Pull Cloud vẫn thay thế dữ liệu nhưng có snapshot bảo vệ trước khi ghi đè.
- `node --check` và `release_check.py` pass.
