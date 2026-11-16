# Mẹ Yêu Bé V17.22.14 — Tết Nguyên Tiêu Motion Fidelity

## Bản mẫu đã chốt

- Đèn trời bay lên phía trên hồ và đình, có kích thước xa/gần, tốc độ lệch nhịp.
- Hoa đăng trôi trên mặt hồ và ánh sáng phản chiếu tự nhiên.
- Ảnh header có trăng tròn và hoa đào; ảnh banner ưu tiên đình/hồ/hoa đăng phía phải, không nướng sẵn tên bé/chữ/nút.

## Hai chế độ hoạt cảnh (ưu tiên tính độc lập)

| Lựa chọn | Mã cũ được giữ để tương thích Cloud Sync | Đối tượng chuyển động | Không xuất hiện |
|---|---|---|---|
| A — Đèn trời bay lên | `lanternGlow` | Đèn giấy từ chính ảnh thiết kế, trôi lên trên theo các chu kỳ lệch nhịp | Không có hoa đăng động |
| B — Hoa đăng trôi trên hồ | `moonClouds` | Hoa đăng từ ảnh thiết kế, lướt ngang êm và phản chiếu nhẹ | Không có đèn trời bay lên / mây giả |
| Tĩnh | `still` | Không vẽ bất cứ sprite chuyển động nào | Không có hoạt cảnh |

## Kiến trúc

- `src/features/seasonal/illustration.js`: `drawNguyentieu` vẽ qua một overlay Canvas trong suốt trên ảnh nền, có clip rectangle nội bộ.
- `src/features/seasonal/art/nguyentieu-lake-scene-v7.webp`: nền cảnh hồ gốc, giữ nguyên công trình và không chồng các nút chụp sẵn.
- Hai ảnh đèn trời `nguyentieu-sky-lantern-*`; hai ảnh hoa đăng `nguyentieu-floating-lotus-*` có alpha.
- `src/features/seasonal/model.js`: đổi tên hiển thị lựa chọn, giữ khóa `lanternGlow` và `moonClouds` để không mất cấu hình đã lưu.
- `sw.js`: precache tất cả asset mới để xem offline.

## Giới hạn và QA

Ảnh gốc của các vật thể vẫn được giữ trong cảnh nền tĩnh. Bản này làm chuyển động các đối tượng tách lớp bổ sung, không bóp méo cả ngôi đình hoặc mặt trăng. Chạy thử trên Safari iPhone thực tế sau khi deploy để xác nhận tỷ lệ hiển thị, tối ưu tiếp nếu cần.

**Đã chạy:** `node tests/nguyentieu-motion-v172214.cjs`, `node tests/seasonal-standalone.cjs`, `node tests/newyear-motion-standalone.cjs`, `python3 release_check.py`, `npm run build`.

### Kiểm thử tích hợp cần chạy tại môi trường có dependency

`npm test` chưa hoàn thành: 61 test suite của source yêu cầu các dependency (ví dụ `jsdom`) không được cài trong môi trường đóng gói. Điều này **không** đồng nghĩa 61 lỗi do thay đổi Nguyên Tiêu; các bài kiểm tra độc lập không cần dependency, kiểm tra offline, build và release structure đã PASS. Sau khi `npm ci` trên máy phát triển, cần chạy lại đầy đủ trước khi deploy production.
