# V17.14.0 — Validation

Kết quả hiện hành trong TEST_RESULTS_V17.14.0.json. Kiểm tra bằng PGlite/jsdom và Node; không dùng database production hoặc iPhone thật.

Cài sạch bằng npm ci: PASS; build production: PASS. Toàn bộ 60 bộ kiểm tra PASS, không miễn trừ baseline. Backend 17 file và third-party lock entries giữ nguyên so với ZIP đầu vào.

Các ca mới xác minh canonical query key, force refresh bỏ cả hai cache, bản sao dữ liệu và cách ly credential, 20 hidden updates chỉ render một lần khi mở bằng state mới nhất, care scope không render growth không liên quan. Source và production integration, cold/warm startup, lost ACK, Undo, kho sữa, viewport/fullscreen, health/realtime đều nằm trong báo cáo.

Không cam kết số giây cải thiện trên mạng thực. Dashboard hiện vẫn render cấp module, chưa diff từng card. Chưa push/deploy/iPhone thật.
