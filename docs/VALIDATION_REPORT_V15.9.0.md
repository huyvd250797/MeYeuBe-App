# V15.9.0 — Kết quả kiểm thử

Ngày 25/10/2026. Node 24.22.1, PGlite0.5.11, jsdom30.1.3, fake-indexeddb6.2.6.

**23/23 suite PASS, không miễn trừ baseline.** Output trong TEST_RESULTS_V15.9.0.json. Sau regression, test cascade mới phát hiện fixture thiếu ON DELETE CASCADE so với schema Boss gửi; sửa2 FK trong fixture và chạy lại realtime SQL31/31. Runtime cuối35/35, cấu trúc/syntax cuối PASS. Không bỏ assertion thất bại.

- 31 kiểm tra SQL mới: trigger/coalesce/rollback/revision, quyền, scope isolation, canonical milk status/balance/NULL expiry, source native UUID, Undo/OCC/ambiguous alias, cascade delete, migration chạy lại.
- 35 kiểm tra runtime mới: scoped fetch, không render toàn app, mock family channel,40 tín hiệu thành1 care bundle, chọn kho tự động/thủ công/bỏ/chọn lại, lưu bú có lượng thừa, trả nguồn khi sửa, draft/late-response deferral, retry, bắt tín hiệu lỡ bằng revision, hết hạn/hủy không hồi sinh, unknown-signal fallback, theme và active member giữ nguyên.
- Bộ cũ: catalog, care/milk/transfer/Undo/timer, sức khỏe/vaccine/khám/thuốc/file/tăng trưởng/thai kỳ, nhật ký/lịch/cột mốc/ghi chú, settings/OCC, startup đủ dashboard, cache/queue/destination/pending, service worker và UI hiện hữu đều PASS.

Cùng fixture: full startup16 RPC; care realtime3 RPC (1 revision +2 list), ít hơn13 request ở tình huống này. Không suy ra tỷ lệ latency/bytes production. Health vẫn đọc7 list; care đọc cả kho để giữ liên kết.

Đang nhập/form/modal/pending thì hoãn toàn bộ cập nhật nền; không hứa mọi nhóm khác vẫn cập nhật tức thì. Không loại mọi echo cùng thiết bị. Legacy signal/thiếu1590 dùng full read. Startup vẫn full history.

Chưa xác minh Supabase publication/RLS thực tế, WebSocket mạng thật, multi-session PostgreSQL thực, iPhone/PWA vật lý hoặc521 hàng kho trong ảnh. Mock transport kiểm tra handler/coalescing, không chứng nhận live delivery. Không có credentials/business rows production. Chưa push/deploy.
