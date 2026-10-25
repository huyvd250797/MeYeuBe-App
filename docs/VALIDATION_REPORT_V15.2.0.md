# Kiểm thử V15.2.0

Ngày: 25/10/2026. Node 24.22.1; jsdom 30.1.3; fake-indexeddb 6.2.6.

| Bộ kiểm tra | Đạt | Chưa đạt | Trạng thái |
| --- | ---: | ---: | --- |
| release_check.py | 0 | 0 | PASS |
| test_binh_tui.js | 89 | 5 | KNOWN_BASELINE_FAILURE |
| test_chuyen_sua.js | 64 | 3 | KNOWN_BASELINE_FAILURE |
| test_fix_popup_chuyen_sua.js | 14 | 0 | PASS |
| test_giao_dien.js | 51 | 0 | PASS |
| test_loc_dang_dung.js | 38 | 0 | PASS |
| test_v1510_stored_feed_return.js | 16 | 0 | PASS |
| cold-start.cjs | 9 | 0 | PASS |
| data-safety.cjs | 74 | 0 | PASS |

Tổng assertion nghiệp vụ: 355 đạt, 8 chưa đạt. Kiểm tra cấu trúc/cú pháp được tính riêng.
Không có failure mới so với các test lịch sử đã đối chiếu. 8 kiểm tra baseline vẫn là chưa đạt; không tính thành công.
Hai bộ runtime mới: 74 + 9 = 83 kiểm tra đạt.
Chưa kiểm thử production, RLS/RPC thật, iOS/PWA/push và thiết bị thật.
Xem DATA_SAFETY_V15.2.0.md cho phạm vi và checklist; TEST_RESULTS_V15.2.0.json cho log đầy đủ.
