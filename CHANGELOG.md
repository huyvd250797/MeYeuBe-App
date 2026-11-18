## V17.22.36 — School Opening Green Motion Fidelity
- Preserved existing green school photo and themed UI; created two distinct card-scoped motion modes.
- Phoenix blossom rain with sunlight vs paper airplane, bunting and sparse petals.
- Continuous rAF frame rendering with visibility pause and still/reduced-motion support.
- No migration.

## V17.22.35 — Mid-Autumn Rich Continuous Motion
- More vivid and frequent card-only Mid-Autumn effects with smooth forever-style canvas motion.
- 3 star lanterns / 6 sky lanterns, 32 fireflies, brighter clouds, mooncake highlights, refined moon.
- Removed obsolete V17.22.33 animated WebP overlay assets; no database migration.

## V17.22.33 — Mid-Autumn Card Motion Fidelity (2026-11-18)

- Áp dụng hai hiệu ứng Trung thu đã duyệt vào **riêng lớp ảnh động bên trong card Bé Bún**, không chạy trên header và các card bên ngoài.
- Đèn ông sao: đung đưa, sáng tối nổi bật, đom đóm chuyển động, ánh sáng bánh Trung thu.
- Trăng rằm: trăng không biến dạng, mây thật trôi qua, đèn trời bay lên, hiệu ứng ánh sáng chuyển động.
- Giữ UI, avatar, nội dung/chỉ số động; cấu hình đồng bộ Cloud Sync, giảm chuyển động và kiểm soát lifecycle khi ẩn.
- Nâng PWA cache/build V17.22.33, không có migration SQL.

## V17.22.31 — National Day Motion Fidelity (2026-11-17)

- Hoàn thiện chủ đề Quốc khánh 2/9 với hai hiệu ứng đã duyệt: **Cờ Tổ quốc tung bay** và **Pháo hoa trên bầu trời**.
- Loại bỏ lớp cờ phẳng xoay nhẹ và pháo hoa vẽ nét mờ: chuyển sang atlas vải cờ 96 khung hình nguyên tấm và bộ ảnh pháo hoa trong suốt nhiều màu, chuyển động A/B độc lập.
- Dựng lại phần cảnh Lăng Chủ tịch Hồ Chí Minh không có pháo hoa/cờ tĩnh chồng lẫn, không thêm chữ ngày lễ trên banner, chỉ phát hiệu ứng bên trong card bé.
- Giữ nguyên 19 chủ đề khác, các chức năng chăm sóc bé, đồng bộ cấu hình và bản build offline/PWA.
- Đồng bộ metadata build V17.22.31, tài nguyên phiên bản v31 tránh cache cũ.

## V17.22.30 — Beach GIF Scene Fidelity Repair (2026-11-17)

- Replaced V17.22.29 foam stickers/rigid palm with mode-specific real surf sequence and flexible photo-frond atlases; scene photo enhanced, PWA rebuilt and offline assets refreshed.

## V17.22.29 — Beach Natural Waves And Palm Motion (2026-11-17)

- Nâng cấp từ source **V17.22.28**, chỉ tinh chỉnh chủ đề **Nghỉ mát** trên giao diện Mẹ Yêu Bé hiện có.
- **A — Sóng biển vỗ bờ (`wave`):** hai lớp bọt sóng lấy từ ảnh biển gốc, tiến vào bờ rồi rút nhẹ theo chu kỳ; không vẽ dải sóng phẳng hoặc để sóng bay qua card.
- **B — Lá dừa đung đưa (`clouds`):** lá dừa tách nền ảnh thật, giữ cuống cố định phía trên banner, đung đưa biên độ nhỏ theo gió. Không vẽ mây/những hạt giả.
- **Tĩnh:** không tải và không phát hoạt cảnh. Hai chế độ không lẫn ảnh/tài nguyên của nhau.
- Giữ nguyên ảnh nền bãi biển, ô che nắng, ghế biển, trái dừa, thông tin bé, các card và bottom navigation; không đổi chiều cao form.
- Giữ nguyên IDs `wave`/`clouds` cho Cloud Sync; đổi nhãn hiển thị cho đúng hiệu ứng.
- 3 WebP motion mới được precache bởi PWA ở source và production; metadata đồng bộ V17.22.29.
- Không thay đổi cơ sở dữ liệu; không cần SQL migration.

## V17.22.28 — Vu Lan Approved Motion Repair (2026-11-17)

- Sửa gốc: V17.22.27 vẫn dùng `photoPaint()` với hiệu ứng chung, không tải sprite thực cho Vu Lan.
- Tích hợp `drawVulan()` dùng ảnh thật, tọa độ canvas đồng nhất với `vulan-photo-hero-v3.webp` 548x215 và hiệu ứng nằm trong hero card.
- **A — Hoa đăng trôi (`floatingLotus`):** ba ảnh hoa đăng tách nền từ mẫu Vu Lan, trôi và nhấp nhô chậm độc lập, kèm phản chiếu cục bộ trên mặt hồ.
- **B — Ánh nến lung linh (`candlelight`):** đèn lồng ảnh thật đung đưa, ánh nến hoa đăng ấm lên rồi dịu xuống, cánh hoa ảnh thật rơi chậm.
- **Tĩnh:** không tải hay vẽ hiệu ứng; không thay đổi các card, ngôi chùa, ảnh bé hoặc tên bé.
- Giữ nguyên `floatingLotus`/`candlelight` để không làm mất cài đặt Cloud Sync. Đưa 6 WebP mới vào precache của Service Worker.
- Cập nhật toàn bộ build metadata thành V17.22.28; không thay đổi cơ sở dữ liệu.

## V17.22.27 — Vu Lan Motion Fidelity (2026-11-17)

- Sửa lỗi V17.22.25 chưa nối engine hoạt cảnh riêng cho `family`: phần trước chỉ hiện bokeh rất mờ và không hiển thị trái tim thực tế như GIF.
- **A (`floatingHearts`)**: năm trái tim viền sáng lấy tông màu từ ảnh, di chuyển chậm theo quỹ đạo riêng quanh khung ảnh gia đình.
- **B (`homeGlow`)**: lớp ánh sáng ảnh mềm riêng cho ngôi nhà và khung chân dung, nhịp sáng/tối lệch pha; tuyệt đối không biến dạng hoặc làm mờ ảnh gốc.
- **Tĩnh**: không tải/vẽ ảnh động. Giữ nguyên ID chế độ để đồng bộ Cloud Sync.
- Thêm 2 sprite WebP trong suốt, căn tọa độ đúng 548×215 của ảnh, clip trong hero card; precache offline trong Service Worker.
- Đồng bộ version source/PWA/production thành V17.22.27; kiểm thử độc lập cho hai chế độ và đảm bảo ảnh nền không thay đổi.

## V17.22.25 — Family Day Motion Fidelity (2026-11-17)

- Áp dụng hoàn chỉnh chủ đề Ngày Gia đình Việt Nam với 2 hiệu ứng động đã duyệt.
- Hiệu ứng A: Floating Hearts — các trái tim ánh sáng bay nhẹ quanh khung ảnh gia đình.
- Hiệu ứng B: Home Glow — ánh đèn ngôi nhà và vùng khung ảnh ấm dần rồi dịu xuống.
- Làm mới metadata phiên bản/PWA để phát hành thành build V17.22.25.

## V17.22.24 — Childrens Day Natural Motion Fidelity (2026-11-17)

- **A / B / Tĩnh**: giữ ảnh hero gấu–thỏ–hộp quà–ngôi sao đã duyệt, không làm mờ hoặc biến dạng ảnh nền.
- A (`balloons`): ba bóng latex nhiều lớp sáng bóng, lớn hơn và đung đưa lệch pha nhẹ như treo trong gió; giấy màu có mặt trước/mặt sau, rơi chậm, không dùng nét sao giả.
- B (`stars`, legacy key): bong bóng màng mỏng có phản quang cầu vồng, nổi chậm; hai chong chóng mới dùng hình lá nhựa/foil tô sáng theo chiều gấp, quay quanh trục cố định, cán không nhảy.
- Phần ảnh động chỉ trong hero card; không đẩy layout và không đè lên tên/avatar/chuông của bé. Tải asset theo lựa chọn hiện tại, Tĩnh không tải sprite động.
- Bổ sung 5 sprite ảnh trong suốt WebP chất lượng cao; offline/PWA và metadata được làm mới theo build 17.22.24.

## V17.22.22 — Children Day Motion Fidelity (2026-11-17)

- Giữ nguyên ảnh gốc Quốc tế Thiếu nhi (gấu bông, thỏ, quà, ngôi sao), không làm mờ hoặc dời bố cục.
- A `balloons`: bóng bay ảnh tách nền, đung đưa từng quả theo nhịp riêng; giấy màu nhỏ rơi trong banner.
- B `stars` (ID lưu cũ): bong bóng xà phòng phản quang bay lên; chong chóng nhiều màu quay độc lập.
- Mỗi chế độ chỉ tải asset tương ứng; Tĩnh không vẽ chuyển động. Dùng tọa độ gốc của ảnh 548×215 và clip trong card.
- Loại bỏ đốm sáng CSS chung; cập nhật `build.json`, manifest, source, dist và precache Offline cho V17.22.22.

## V17.22.21 — Doan Ngo Motion and PWA Update Reliability (2026-11-17)

- Căn đúng tỉ lệ ảnh Tết Đoan Ngọ 548×215, 2 chế độ ảnh sprite không chồng lấn.
- Sửa vòng lặp popup cập nhật: so sánh version mới hơn, chờ SW hoặc xác thực index mới, chặn nhắc lại trong phiên.
- Đồng bộ version trong build, manifest, lockfile và gói production.

## V17.22.20 — Doan Ngo Motion Repair (2026-11-17)

- Sửa motion Tết Đoan Ngọ để khớp GIF đã chốt: **Chuồn chuồn bay** dùng sprite ảnh thật và **Lá xanh lay động và rơi** dùng lá ảnh thật rơi tự nhiên trên hero scene.
- Thêm asset motion riêng cho Đoan Ngọ và nối chúng vào lớp overlay ảnh của dashboard.
- Đồng bộ lại `build.json` / `boot.js` / `package.json` lên build **17.22.20** để máy nhận đúng bản mới.
- Sửa popup cập nhật: sau khi bấm cập nhật hoặc để sau sẽ không hiện lặp vô hạn trong cùng phiên.

## V17.22.19 — Doan Ngo Festival Motion Fidelity (2026-11-17)

- Chốt chủ đề Tết Đoan Ngọ với 2 hiệu ứng đã duyệt: A chuồn chuồn bay, B lá xanh lay động và rơi.
- Giữ form app như các chủ đề gần đây: scene nằm trong hero card, không thêm khung chữ ở giữa banner và không đẩy layout.
- Đồng bộ nhãn cấu hình hiển thị theo wording đã chốt để người dùng chọn đúng hiệu ứng trong app.
- Tăng build/PWA version lên 17.22.19 để thiết bị nhận bản mới.

## V17.22.18 — Reunification Day Daylight Motion Fix (2026-11-17)

- 30/04 bright daytime sky; roof flag visible even in still/fireworks mode.
- Smooth full-texture flag animation without vertical canvas-strip seams.
- Daylight firework image layers have true alpha transparency, no dark rectangular backdrops.
- No new banner/holiday title, no changed card sizing, no other theme changes.

## V17.22.16 — Hung Kings Commemoration: Photo-Matched Motion

- 2 độc lập: A cánh hoa đào rơi nhẹ trên cảnh đền, B cờ hội lay động nhỏ tại cột cờ thật; Tĩnh giữ cờ đứng yên.
- Dùng cảnh núi và cổng Đền Hùng từ ảnh mẫu đã duyệt, loại khung chữ/biểu tượng chụp sẵn, không bóp méo cổng hoặc đẩy giao diện xuống.
- Cờ, cánh hoa là ảnh thật tách nền; không còn nét vẽ tam giác hay mây vẽ giả của bản cũ.
- Ảnh mới và sprite precache qua service worker. Giữ nguyên các chủ đề và Cloud Sync đã chốt.

## V17.22.15 — Quốc tế Phụ nữ 08/03: Bướm bay & Cánh hồng rơi

- Tách 2 lớp hoạt cảnh riêng biệt A / B từ sprite ảnh thật (không dùng đốm CSS hay chung object).
- Thay cảnh hero thành bó hoa rõ nét, **không có khung vàng trang trí đầu banner**, không có chữ sự kiện baked-in.
- Giới hạn chuyển động trong card bé, bảo vệ tên bé / avatar / nút chuông / cữ bú, không đẩy các card xuống.
- Khởi tạo/tải ảnh riêng theo chế độ đã chọn, giữ tương thích mã cấu hình cũ `butterflies` / `petals` / `still`.
- Precache 3 ảnh WEBP mới, tăng build version để PWA nhận cập nhật.

## V17.22.14 — Nguyên Tiêu Photo Motion Fidelity (16/11/2026)

- Tạo cảnh hồ Nguyên Tiêu từ ảnh gốc sắc nét, không chép lại chữ/nút của giao diện mẫu.
- A: đèn trời ảnh thật bay lên; B: hoa đăng ảnh thật trôi trên nước; Tĩnh: không có animation.
- Đảm bảo lớp chuyển động cắt trong banner và không che thông tin bé; hỗ trợ giảm chuyển động, dừng khi ứng dụng chuyển nền như logic hiện có.
- Đưa 5 ảnh mới vào service-worker precache; bổ sung kiểm thử riêng A/B/Tĩnh.
- Sửa tham chiếu ảnh New Year v7 trong test/offline cache so với source V17.22.13.

## V17.22.13 — New Year card hero enlargement

- Crop lại newyear-city-scene cho card bé.
- Tăng kích thước hiển thị và giảm khoảng trống bên dưới.
- Giữ hình cân đối với card.
## V17.22.34 — Mid-Autumn Seamless 60fps Motion
- Replaced looped Mid-Autumn animated-image overlays with card-only canvas motion for continuous, smoother playback.
- Refined the Mid-Autumn moon to appear softer and more festive.
- Preserved static UI outside the baby card and retained still/visibility handling.


## V17.22.37 — Vietnamese Women's Day Motion Fidelity
- Added distinct 20/10 rose-petal and pink-silk canvas animation modes inside the Bé Bún card only.
- Completed the 20/10 date display; retained the original pink rose art and cross-device theme settings.
- Continuous 60fps-targeted rAF motion, no new GIF or SQL migration.
## V17.22.38 — Vietnamese Womens Day Elegant Card & Silk Refinement
- Replaced the rough 20/10 sign with a prettier greeting card inside the Vietnamese Women's Day illustration.
- Extended and brightened the silk ribbon light effect for a more premium look.
- Preserved the existing pink Women's Day theme and card-only motion scope.


## V17.22.39 — Halloween Continuous Card Motion Fidelity
- Preserved original purple Halloween theme and added two continuous card-only animation rigs.
- Pumpkin: blinking light, wing-flapping bats, leaf fall and fire embers.
- Ghosts: floating ghosts, flickering lantern, windblown leaves, limited bats.
- 60fps-targeted Canvas animation; still/reduced-motion and existing mode IDs preserved. No GIFs or migrations.
