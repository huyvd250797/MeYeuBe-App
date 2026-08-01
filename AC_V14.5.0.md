# AC — V14.5.0 · Fluid Motion & Fresh Build Guard
Ngày: 2026-08-01

## 1. Hiệu ứng mượt, mở popup từ đúng chỗ ngón tay chạm
- AC1.1 Chạm vào một thẻ/nút mở popup → popup **nở ra từ chính điểm vừa chạm** (zoom-from-origin), không còn nhảy vào giữa màn hình.
- AC1.2 Đóng popup → thu nhỏ về đúng điểm đó rồi mờ dần, không bị cắt ngang.
- AC1.3 Chạm một thẻ mở **trang chức năng toàn màn hình** → trang nở ra từ điểm chạm (giống mở app trên màn hình chính iOS). Điều hướng KHÔNG do chạm (mở bằng mã, thông báo) → dùng hiệu ứng trượt nhẹ như cũ.
- AC1.4 Không còn khựng: mọi khung chuyển động chạy trên GPU (`translate3d`), không animate `backdrop-filter`, và các animation lặp vô hạn (shimmer khung xương, nhịp logo) **tạm dừng** trong lúc mở/đóng popup hoặc chuyển trang.
- AC1.5 Đường cong giảm tốc dùng easeOutExpo (`cubic-bezier(.16,1,.3,1)`) cho cảm giác "trôi" mượt của iOS.

## 2. Không bao giờ mở lại giao diện cũ
- AC2.1 `sw.js`: mã nguồn (html/js/css/webmanifest/json) **luôn lấy từ mạng** với `cache:'no-store'`; bộ nhớ đệm chỉ dùng khi mất mạng.
- AC2.2 Khi bản mới kích hoạt: xoá **toàn bộ** cache cũ, `clients.claim()`, gửi tín hiệu hỏi build tới mọi tab/PWA đang mở. Tab nào không trả lời đúng build trong 2,2 giây → Service Worker tự `client.navigate()` nạp lại giúp. Đây là lớp gỡ được cả những tab đang kẹt ở bản cũ (mã cũ không biết giao thức mới).
- AC2.3 `boot.js` (nạp trước `app.js`): đăng ký SW với `updateViaCache:'none'`, tự `update()` khi mở app, khi quay lại từ nền và mỗi 15 phút.
- AC2.4 Mỗi lần mở app / quay lại từ nền: đối chiếu build của trang với `build.json` trên máy chủ (`no-store`). Lệch → xoá cache + gỡ SW + nạp lại **đúng một lần** (khoá chống lặp 20 giây trong `sessionStorage`).
- AC2.5 Toàn bộ quá trình trên **không đụng `localStorage`** → dữ liệu của bé an toàn tuyệt đối.

## 3. Nút "Thêm" ở thanh dưới trượt lên mượt
- AC3.1 Sheet trượt lên **trọn vẹn từ đáy màn hình** (translateY 101% → 0) trong 0,4s easeOutExpo, không còn nhích 58px rồi dừng.
- AC3.2 Sheet có **thanh nắm kéo** kiểu iOS ở đầu.
- AC3.3 **Kéo xuống để đóng**: kéo từ vùng đầu sheet (76px trên cùng) → sheet đi theo ngón tay, lớp phủ mờ dần theo quãng kéo. Thả ra khi đã kéo quá 104px hoặc hất nhanh → đóng; chưa đủ → bật về chỗ cũ.
- AC3.4 Kéo lên có sức cản (chỉ đi ~18% quãng), không cướp thao tác cuộn nội dung bên trong sheet.

## 4. Không phá vỡ hành vi cũ
- AC4.1 So với `BASELINE_LOCK_V14.4.2.json` (122 hàm): **122/122 hàm giữ nguyên hash**, không có thay đổi có chủ ý nào. Toàn bộ phần mới là hàm `ax5*`, CSS mới và hai file tách riêng `boot.js` / `build.json`.
- AC4.2 Bảng thời lượng dùng chung `--ax-fast/base/slow` giữ nguyên; các mốc dài hơn của popup/sheet khai báo bằng biến mới `--ax-modal/--ax-sheet` để vẫn quản lý tập trung một chỗ.
- AC4.3 Tôn trọng thiết lập "Giảm chuyển động" của hệ điều hành và ô tắt hiệu ứng trong app: tắt là mọi thứ hiện ra tức thì.
