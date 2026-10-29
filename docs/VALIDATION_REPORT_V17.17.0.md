# V17.17.0 — Validation

Kết quả hiện hành trong TEST_RESULTS_V17.17.0.json. Test Packing dùng jsdom và adapter Cloud có ACK/OCC/lỗi mô phỏng; các suite settings hiện có dùng SQL/PGlite. Chưa deploy, DB production hoặc iPhone thật. Không SQL mới.

Cài sạch npm ci (38 packages), production build, 62 bộ kiểm tra PASS. Cuối cùng chạy lại build, Packing UI, production integration, CSS cascade và syntax sau khi khóa control trong lúc tải. Bộ Packing SQL xác nhận dữ liệu lên DB, giữ settings khác, replay operation không trùng, OCC chống máy cũ và tách gia đình.

Stylesheet Packing được đưa trước viewport; bộ kiểm tra cascade được cập nhật để vẫn giữ viewport cuối. 17 backend files và toàn bộ third-party lock entries giữ nguyên byte/nội dung. Chưa kiểm chứng ảnh Safari/iPhone thật; responsive được kiểm tra qua DOM/CSS và contract, không coi là nghiệm thu pixel.
