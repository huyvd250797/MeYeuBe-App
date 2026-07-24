# Acceptance Criteria — MeYeuBe V11.4.1

Chủ đề: **Tinh gọn giao diện chi tiết Bé bú + hiển thị ghi chú túi sữa**

## 1. Không gian xem dữ liệu

- [x] Modal chi tiết kéo dài hết chiều cao khả dụng: lề trên trên máy ≤640px giảm từ `max(54px, safe-area) + 6px` xuống `max(8px, safe-area) + 2px`, lề dưới `max(12px) + 8px` → `max(6px) + 4px`, lề ngang 8px → 6px.
- [x] Đo trên iPhone 390×844: vùng cuộn danh sách **530px → 635px** (+20%), tổng chiều cao nội dung **1580px → 1213px** (−23%).
- [x] Số bản ghi nhìn thấy cùng lúc không cần cuộn: **2 → 4** (dữ liệu mẫu 7 bản ghi Bé bú).
- [x] Modal không che mất status bar / tai thỏ (vẫn tôn trọng `env(safe-area-inset-top)`).

## 2. Cỡ chữ

- [x] Tiêu đề loại chăm sóc 24px → 19px (≤430px: 21px → 17.5px); avatar 52px → 40px (≤430px: 46px → 36px).
- [x] Thẻ Ngày / Tổng số lần: giá trị 15px → 13px, nhãn 11.5px → 10px, icon 34px → 28px.
- [x] Khối Tổng quan: tiêu đề 17px → 14.5px, giá trị 16px → 14px, nhãn 11px → 10px, icon ô 38px → 30px, nút "Xem thống kê ›" 12.5px → 11.5px.
- [x] Thẻ bản ghi: giờ 19px → 16px, tiêu đề 15px → 13.5px, dòng phụ 12.5px → 11.5px, nhãn phân loại 10.5px → 9.5px, icon 34px → 28px.
- [x] Bảng 3 số liệu: giá trị 14px → 12.5px, nhãn 10.5px → 9.5px; hàng túi sữa 11.5px → 10.5px.
- [x] Không có chữ nào nhỏ hơn 9px (trừ ký tự ✓/○ trang trí bên trong chấm trạng thái túi sữa).
- [x] Khoảng cách giữa các thẻ bản ghi 12px → 9px; padding thẻ 12px → 9px.

## 3. Chân modal

- [x] Nút "＋ Thêm ghi nhận" cao 54px → 44px (≤430px: 50px → 42px), chữ 16px → 14.5px, bo góc 20px → 15px.
- [x] Padding chân modal 12px/10px → 8px/6px; dòng gợi ý 11.5px → 10px và ép gọn đúng 1 dòng (không xuống 2 dòng như trước).
- [x] Tổng chiều cao footer **98px → 74px** (−25%).
- [x] Nút vẫn cố định ở chân modal khi cuộn, vẫn rộng hết chiều ngang, vùng chạm ≥ 40px.

## 4. Ghi chú túi sữa (yêu cầu mới)

- [x] Bản ghi "Bú từ kho sữa đã hút" hiển thị thẻ "🍼 Ghi chú bình:" lấy từ **ghi chú của túi sữa trong Kho sữa** (vd "Bình tím mập", "Bình tím cao") — trước đây chỉ lấy `note` của bản ghi nên luôn trống.
- [x] Chấm màu bên phải thẻ tự nhận theo màu nêu trong ghi chú (tím / hồng / xanh / đỏ / cam / vàng / trắng / đen / nâu / xám).
- [x] Bản ghi có ghi chú riêng khác với ghi chú túi → hiện thêm thẻ "📝 Ghi chú:"; hai ghi chú trùng nhau thì chỉ hiện một thẻ.
- [x] Bú mẹ trực tiếp / sữa công thức: giữ nguyên hành vi cũ (chỉ hiện ghi chú của bản ghi).
- [x] Cữ bú lấy từ nhiều túi: thẻ trên cùng gộp các ghi chú (`A · B`), đồng thời **mỗi hàng túi sữa có chip ghi chú riêng** để không lẫn túi nào là bình nào.
- [x] Ghi chú túi được ghi thêm vào `extra.milkBagSnapshots[].note` khi lưu cữ bú → xoá túi khỏi kho vẫn xem lại được đúng tên bình trong lịch sử.
- [x] Đọc ưu tiên: ghi chú hiện tại của túi trong kho → fallback snapshot lúc bú → không có thì không hiện thẻ.
- [x] Máy ≤430px: thẻ ghi chú xuống dòng riêng nhưng bố cục ngang 1 hàng (nhãn + nội dung + chấm màu).

## 5. Không hồi quy

- [x] Vuốt sang trái để Sửa/Xóa, nút "›" mở form sửa, bộ lọc kho sữa, thẻ túi sữa: giữ nguyên.
- [x] Cấu trúc dữ liệu lưu không đổi; chỉ **thêm** trường `note` vào snapshot túi sữa (backward-compatible, bản ghi cũ thiếu trường này vẫn đọc được qua kho sữa).
- [x] 9 tổ hợp màn hình/loại/theme không tràn ngang, không cắt chữ, footer không đè danh sách: 390/430/360/768px × Bé bú, Kho sữa, Ngủ, Thay tã, Hút sữa × light/dark.
- [x] Version đồng bộ 11.4.1: title, splash, appVersionInfo, cache-bust `app.js?v=`, `sw.js` CACHE_NAME, `manifest.webmanifest`, `APP_VERSION`.

## Stable Baseline Lock

- [x] 26 hàm lõi ở `BASELINE_LOCK_V11.4.0.json` (Cloud Sync/Realtime, Push, Smart Alert, Export/Import, Milestone Engine, Hành trình theo tháng / Thống kê / Tổng kết năm, Photo Viewer) — hash khớp **26/26**, không bị ảnh hưởng.
- [x] `BASELINE_LOCK_V11.4.1.json` giữ nguyên 26 hàm như V11.4.0.
- [x] Hàm sửa đổi ở bản này: `careNoteChipHtml` (đổi chữ ký thành `(db,x)`), `careRecordBagRowsHtml`, `careRecordCardHtml`, `applyCareInventory` (thêm 1 trường `note` vào snapshot) và các hàm mới `milkBagSnapshotFor` / `milkBagNoteText` / `careFeedBagNotes` / `careNoteChipOne` — đều thuộc lớp hiển thị chi tiết, không nằm trong nhóm hạ tầng lõi cần khoá.

## Release Gate

- [x] `node --check` PASS (app.js, sw.js).
- [x] Version consistency PASS.
- [x] Baseline function hashes PASS (đối chiếu `BASELINE_LOCK_V11.4.0.json`).
- [x] `release_check.py` PASSED.
- [x] Kiểm thử tự động bằng Playwright: 9 case (390/430/360/768px × 5 loại chăm sóc × light/dark) — không tràn ngang, không cắt chữ, footer không đè danh sách, vùng chạm nút đạt chuẩn; xác nhận thẻ "Ghi chú bình" hiện đúng "Bình tím mập" / "Bình tím cao" và chip ghi chú theo từng túi ở cữ bú nhiều túi.

## Known limitation

- Ghi chú túi sữa hiện lấy từ ô "Ghi chú" của lần hút sữa (đã có sẵn), chưa có trường riêng kiểu "Tên bình". Nếu muốn chọn bình từ danh sách cố định (Bình tím mập / Bình tím cao / Moyuum...) thay vì gõ tay thì cần bổ sung ở bản sau.
- Cữ bú lấy từ nhiều túi có nhiều ghi chú dài, thẻ trên cùng có thể phải xuống dòng trên máy rất hẹp (≤360px); chip theo từng hàng túi vẫn đảm bảo đọc đủ.
