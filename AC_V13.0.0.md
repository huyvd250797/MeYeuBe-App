# Acceptance Criteria — MeYeuBe V13.0.0 · Backup & Version Control dữ liệu

## Backup thủ công
- [ ] Bấm "📸 Tạo Backup" trong màn 💾 Dữ liệu tạo ngay 1 Version mới (v1, v2, v3… tăng dần), lưu trong IndexedDB riêng, không ghi vào localStorage chính.
- [ ] Có thể nhập ghi chú trước khi tạo; ghi chú hiển thị lại đúng trong danh sách phiên bản.
- [ ] Mỗi Version lưu đủ: tên (số thứ tự), ngày giờ tạo, dung lượng, người tạo (Bạn/Tự động), ghi chú.

## Backup tự động
- [ ] Chọn được 1 trong 5 chế độ: Tắt / Hằng ngày / Hằng tuần / Hằng tháng / Khi có hơn X thay đổi; lưu cấu hình đúng khi bấm Lưu.
- [ ] Với chế độ theo ngày/tuần/tháng: mở app sau khi đã đủ thời gian cấu hình sẽ tự tạo 1 Version type=auto; chưa đủ thời gian thì không tạo.
- [ ] Với chế độ theo số thay đổi: tổng số bản ghi thêm/bớt (Bé bú, Hút sữa, Ngủ, Thay tã, Uống thuốc, Nhiệt độ, Trớ sữa, Kho sữa, Milestone) kể từ bản Backup tự động gần nhất đạt hoặc vượt X thì tự tạo Version mới.
- [ ] Chỉ kiểm tra khi mở app (không yêu cầu chạy nền khi app đã đóng).
- [ ] Số Version type=auto không vượt quá 20 bản — bản tự động cũ nhất tự bị xoá khi vượt; Version thủ công không bao giờ bị xoá tự động.

## Lịch sử phiên bản (Timeline)
- [ ] Danh sách hiển thị tất cả Version, mới nhất lên đầu, dạng timeline có chấm nối.
- [ ] Mỗi dòng phân biệt được Thủ công/Tự động bằng nhãn màu khác nhau.
- [ ] Xoá 1 Version chỉ xoá đúng bản đó, các bản khác không đổi.

## Restore
- [ ] Bấm Restore trên 1 Version mở Preview: hiển thị tên phiên bản, ngày, dung lượng, người tạo, ghi chú (nếu có).
- [ ] Preview hiển thị đúng khác biệt so với dữ liệu hiện tại: số bản ghi thêm/bớt theo Bé bú, Hút sữa, Ngủ, Thay tã, Uống thuốc, Nhiệt độ, Trớ sữa, Túi sữa, Milestone; các danh mục không có ID ổn định (Lịch khám, Nhật ký, Sổ sức khỏe, Chỉ số) hiển thị chênh lệch số lượng.
- [ ] Không nhập đúng "KHOIPHUC" thì không thể xác nhận khôi phục.
- [ ] Sau khi khôi phục, toàn bộ giao diện cập nhật ngay theo dữ liệu của Version đã chọn.

## Export
- [ ] Xuất được dữ liệu hiện tại HOẶC 1 Version cụ thể, ở cả 4 định dạng: JSON, ZIP, SQLite, CSV.
- [ ] File JSON xuất ra mở lại được bằng chính tính năng Nhập của bản này.
- [ ] File ZIP chứa database.json + manifest.json tóm tắt.
- [ ] File SQLite mở được bằng công cụ SQLite ngoài, có bảng theo từng loại dữ liệu kèm cột raw_json đầy đủ.
- [ ] File CSV (trong ZIP) mở được bằng Excel/Google Sheets, mỗi loại dữ liệu 1 file riêng.
- [ ] JSZip/sql.js chỉ tải khi bấm xuất ZIP/CSV/SQLite lần đầu (không tải sẵn lúc mở app).

## Import
- [ ] Chọn file .json/.zip/.sqlite hợp lệ hiển thị đúng Preview: dung lượng, tổng bản ghi, khác biệt so với dữ liệu hiện tại.
- [ ] Chọn file không hợp lệ (sai định dạng, JSON hỏng) báo lỗi rõ ràng, không làm hỏng dữ liệu hiện tại.
- [ ] Chế độ Ghi đè: yêu cầu xác nhận, sau đó thay thế toàn bộ dữ liệu hiện tại bằng dữ liệu trong file.
- [ ] Chế độ Gộp: chọn được 1 trong 3 cách xử lý trùng ID (Bỏ qua/Ghi đè/Giữ cả hai) áp dụng cho Bé bú/Hút sữa/Kho sữa/Milestone; Lịch khám/Nhật ký/Sổ sức khỏe/Chỉ số luôn được nối thêm.
- [ ] Trước khi Ghi đè hoặc Gộp, app tự tạo 1 Version an toàn — có thể Restore lại nếu Nhập sai.

## Không hồi quy
- [ ] Nút "Xuất DB JSON" / "Nhập DB JSON" gốc (exportDB/importDB) trong card "Dữ liệu & sao lưu (JSON nhanh)" vẫn hoạt động y hệt trước.
- [ ] Cloud Sync, Push Notification, Smart Alert, Milestone Engine, Global Search không bị ảnh hưởng.
- [ ] 26/26 hàm lõi trong BASELINE_LOCK_V12.2.1 không thay đổi (đối chiếu `BASELINE_LOCK_V13.0.0.json`).
- [ ] `node --check` app.js và sw.js không lỗi; `release_check.py` PASS.
