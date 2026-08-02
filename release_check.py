from pathlib import Path
import re,sys,subprocess,hashlib,json
root=Path(__file__).resolve().parent
errors=[]
idx=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
sw=(root/'sw.js').read_text(encoding='utf-8')
sql=(root/'supabase_setup.sql').read_text(encoding='utf-8')
edge=(root/'supabase/functions/send-push/index.ts').read_text(encoding='utf-8')
boot_src=(root/'boot.js').read_text(encoding='utf-8')

if idx.count('src="./app.js')!=1: errors.append('index.html phải nạp đúng một app.js')
if re.search(r'<script>(?:(?!</script>).){200,}</script>',idx,re.S): errors.append('Không được chứa business JavaScript inline lớn')
for f in ['script0.js','script_inline_0.js','script1.js','script2.js']:
    if (root/f).exists(): errors.append('Còn file JavaScript trùng lặp: '+f)

required_app=[
 'cloudRealtimeStart','cloudMergePayloads','evaluateSmartAlerts','openSmartAlertCenter',
 'enableDevicePush','disableDevicePush','savePushPreferences','testDevicePush','testAllDevicesPush',
 'pushSaveSubscriptionToCloud','refreshPushSubscriptionRegistration',
 'maybeDispatchPushAlerts','urlBase64ToUint8Array','openCareFormModal','openNotificationCenter','setMilkInventoryFilter',
 'syncPumpUI','pumpSetSide','pumpSetAmount','pumpStepAmount','syncCareNoteCount',
 'checkAutoMilestones','addMilestone','milestoneExists','renderMilestoneTimeline','shareMilestoneImage','saveMilestone',
 'openMilestonePhotoViewer','closeMilestonePhotoViewer',
 'renderMonthlyJourney','openMonthDetail','saveMonthNote','renderStatsCompare','renderYearSummary',
 'WHO_LMS','whoReady','whoLmsAt','whoValueAtZ','whoZScore','whoPercentile','whoMeasureValue',
 'whoClassify','whoSeries','whoChartSvg','renderWhoGrowth','babySex',
 'shareYearSummaryImage','exportYearSummaryPdf','rangeCareTotals','toggleMemoriesMenu',
 'hb2Normalize','hb2Render','hb2Members','hb2Active','hb2WhoPoints','hb2WhoEval','hb2ExportProfile',
 'hb2OpenAddMember','hb2SaveMember','hb2OpenVax','hb2OpenVisit','hb2OpenMed','hb2OpenLab','hb2QuickMeas',
 'hb2Timeline','hb2ViewReport','hb2ToggleTaken','hb2ToggleRemind',
 # V14.2.0
 'hb2ShowReport','hb2CloseReport','hb2PrintReport',
 'tfIsThaw','tfAutoExpire','tfManualState','tfComputeExpire',
 'tfToggleManualExpire','tfSyncManualExpireUI','tfRecalcExpire',
 # V14.3.0 — Animation System
 'axInit','axEnabled','axSetEnabled','axSetHaptic','axHaptic','axReduceMotion',
 'axWrap','axKeyOf','axCount','axCountScan','axProgressScan','axProgressStage',
 'axStaggerList','axStaggerScan','axHeroFade','axPageTransition',
 'axSkeleton','axSkeletonClear','axModalWatch','axRegisterOverlay','axOverlaySync',
 'axBtnLoading','axBtnSuccess','axAfterRender','axShowPage',
 # V14.4.0 — Animation Refinements
 'axPressInit','axPressApply','axPressClear','axReplayDashboard','axResetDashState'
]
for token in required_app:
    if token not in app: errors.append('Thiếu chức năng bắt buộc: '+token)

for token in ["self.addEventListener('push'","self.addEventListener('notificationclick'"]:
    if token not in sw: errors.append('Service Worker thiếu: '+token)

for token in ['push_subscriptions','push_delivery_log','alert_types','endpoint text not null unique']:
    if token not in sql: errors.append('SQL thiếu: '+token)

for token in ['webpush.sendNotification','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','statusCode === 404','statusCode === 410']:
    if token not in edge: errors.append('Edge Function thiếu: '+token)

if 'care.feedMl<120' in app: errors.append('Còn cảnh báo bú hardcode <120 ml')
for key in ['wfa_b','wfa_g','lhfa_b','lhfa_g','hcfa_b','hcfa_g']:
    if "WHO_LMS['"+key+"']" not in app: errors.append('Thiếu bảng chuẩn WHO: '+key)
if 'id="babySex"' not in idx: errors.append('index.html thiếu ô chọn giới tính của bé')
if 'id="whoGrowthBox"' not in idx: errors.append('index.html thiếu khối biểu đồ WHO')
if 'id="hb2Root"' not in idx: errors.append('index.html thiếu khối Sổ sức khỏe 2.0')
if 'data-page="healthBook2"' not in idx: errors.append('index.html thiếu điều hướng Sổ sức khỏe 2.0')
if "latestB&&latestB.weight?latestB.weight:(latestP" in app: errors.append('Còn fallback cân nặng thai sau sinh')

# V14.1.0: Sổ sức khỏe V1 phải được gỡ sạch, không còn lối vào hoặc hàm chết
for token in ['saveHealthBook','editHealthBook','renderHealthBookView','resetHealthBookForm',
              'healthBookBlockHtml','addHealthVaccineRow','openHealthBookMenu']:
    if token in app: errors.append('Sổ sức khỏe V1 chưa gỡ hết khỏi app.js: '+token)
for token in ['id="healthBook"','id="healthBookView"','id="healthBookList"','id="healthBookBlocks"',
              'data-page="healthBook"','data-page="healthBookView"']:
    if token in idx: errors.append('Sổ sức khỏe V1 chưa gỡ hết khỏi index.html: '+token)
# Dữ liệu V1 phải được giữ lại cho migration + sao lưu
if 'db.healthBook' not in app: errors.append('Không được xoá dữ liệu db.healthBook (còn dùng cho migration/sao lưu)')
if 'hb2MemberFromHealthBook' not in app: errors.append('Thiếu migration từ Sổ sức khỏe V1 sang 2.0')
# Khoá cuộn nền dùng chung cho mọi popup
for token in ['mybScrollLock','isBlockingPopup','migrateBottomNavId','vaccineDatesOfBaby']:
    if token not in app: errors.append('Thiếu chức năng bắt buộc: '+token)
if ("goTab('healthBook2')" not in idx) and ("nv6Go('healthBook2')" not in idx):
    errors.append('Bảng Thêm ở thanh dưới thiếu module Sổ sức khỏe 2.0')

# V14.2.0 — hạng mục 1: popup chỉ cuộn dọc
for token in ['overflow-x:hidden!important','touch-action:pan-y']:
    if token not in idx: errors.append('index.html thiếu quy tắc khoá cuộn ngang trong popup: '+token)
# V14.2.0 — hạng mục 2: popup xem trước báo cáo phải tách riêng và đóng được
for token in ['id="hb2ReportOverlay"','id="hb2ReportFrame"','hb2CloseReport()','hb2PrintReport()']:
    if token not in idx: errors.append('index.html thiếu popup xem trước báo cáo: '+token)
if '=window.open(' in app.replace(' ',''): errors.append('Xuất báo cáo còn mở cửa sổ mới (kẹt trong PWA)')
# V14.2.0 — hạng mục 3: tự nhập hạn dùng khi chuyển sữa
for token in ['id="tfExpValue"','id="tfExpBtn"','tfToggleManualExpire()','tfRecalcExpire()']:
    if token not in idx: errors.append('index.html thiếu ô tự nhập hạn dùng khi chuyển sữa: '+token)
# V14.2.0 — hạng mục 4 + 6: gỡ sạch Sức khỏe mẹ và Nhật ký
for token in ['saveMom','resetMomForm','saveDiary','resetDiaryForm','renderDiaryBook','sortedDiary',
              'renderDiaryTypes','saveDiaryType','openDiaryBookHighlight','renderDiaryStatsPanel',
              'diaryTypeLabel','toggleDiaryMenu']:
    if token in app: errors.append('Module đã gỡ nhưng còn hàm trong app.js: '+token)
for token in ['id="diary"','id="diaryBook"','id="diaryType"','id="health"','id="momList"','id="diaryList"',
              'data-page="diary"','data-page="diaryBook"','data-page="diaryType"','data-page="health"']:
    if token in idx: errors.append('Module đã gỡ nhưng còn trong index.html: '+token)
# Dữ liệu cũ phải được giữ lại cho sao lưu / xuất file / đồng bộ
for token in ['db.diary','db.mom','db.diaryTypes']:
    if token not in app: errors.append('Không được xoá dữ liệu '+token+' (còn dùng cho sao lưu/xuất file)')
for token in ["diaryBook:'careTimeline'","health:'healthBook2'"]:
    if token not in app: errors.append('Thiếu chuyển đổi nút thanh dưới cũ: '+token)
# V14.2.0 — hạng mục 5: dòng phiên bản nằm sát thanh dưới
if 'padding-bottom:76px!important' not in idx: errors.append('index.html thiếu canh lề đáy mới cho menu trái')

# V14.3.0 — Animation System
# 2.1 CSS bắt buộc: bộ chuyển động dùng chung + skeleton + ô cài đặt
for token in ['@keyframes axCardIn','@keyframes axSheetIn','@keyframes axCardOut','@keyframes axSheetOut',
              '@keyframes axItemIn','@keyframes axPageIn','@keyframes axSwap','@keyframes axShimmer',
              '.axOverlay.axClosing','.axSkeletonBox','--ax-spring','--ax-ease',
              'id="axAnimToggle"','id="axHapticToggle"','axSetEnabled(this.checked)','axSetHaptic(this.checked)']:
    if token not in idx: errors.append('index.html thiếu phần Animation System: '+token)
# 2.2 Thanh tiến trình mục tiêu phải chạy theo dữ liệu thật, không ghim cứng
if 'var(--goal-progress,0))!important' not in idx:
    errors.append('index.html: thanh tiến trình mục tiêu chưa nối lại với --goal-progress')
# 2.3 Tôn trọng thiết lập giảm chuyển động của hệ điều hành
if 'prefers-reduced-motion' not in idx: errors.append('index.html thiếu quy tắc prefers-reduced-motion')
if 'prefers-reduced-motion' not in app: errors.append('app.js thiếu kiểm tra prefers-reduced-motion')
# 2.4 Animation phải THỐNG NHẤT: chỉ Fade/Slide/Scale/Spring, không animation dài
_ax_css=idx[idx.find('V14.3.0 · ANIMATION SYSTEM'):] if 'V14.3.0 · ANIMATION SYSTEM' in idx else ''
if not _ax_css: errors.append('index.html thiếu khối CSS Animation System V14.3.0')
for _bad in ['rotate(','Rotate(']:
    if _ax_css.count(_bad)>1: errors.append('Animation System lạm dụng Rotate (chỉ được dùng cho spinner)')
_ax_times=re.findall(r'(\d*\.?\d+)s\s+var\(--ax-ease',_ax_css)+re.findall(r'(\d*\.?\d+)s\s+var\(--ax-spring',_ax_css)
_ax_times+=re.findall(r'--ax-(?:fast|base|slow):(\d*\.?\d+)s',_ax_css)
if len(re.findall(r'--ax-(?:fast|base|slow):',_ax_css))!=3:
    errors.append('Animation System thiếu bảng thời lượng dùng chung --ax-fast/--ax-base/--ax-slow')
for _d in _ax_times:
    if float(_d)>0.25: errors.append('Animation dài quá 250ms trong Animation System: '+_d+'s')
# Khoảng cách fade lần lượt của danh sách phải nằm trong 30~50ms
_m=re.search(r'stagger:(\d+)',app)
if not _m or not (30<=int(_m.group(1))<=50):
    errors.append('Khoảng cách fade danh sách phải trong khoảng 30~50ms')
# 2.5 Không được sửa hàm cũ để gắn animation — bắt buộc bọc bằng axWrap
if 'axWrap(' not in app: errors.append('app.js thiếu cơ chế bọc hàm axWrap (không được sửa hàm cũ)')
# V14.4.0 — nhấn đúng block + huỷ khi cuộn + rung khi chạm
for token in ['.axPressing','.axPressHost','axPressInit()','axReplayDashboard()']:
    if token not in idx and token not in app: errors.append('Thiếu phần V14.4.0 (press/replay): '+token)
if 'AX_PRESS_SEL' not in app: errors.append('app.js thiếu bộ chọn block cho press V14.4.0')
if "axHaptic('light')" not in app: errors.append('app.js thiếu rung nhẹ khi chạm (haptic on tap) V14.4.0')

# V14.5.0 — Fluid Motion + chống mở lại giao diện cũ
for token in ['@keyframes axZoomIn','@keyframes axZoomOut','@keyframes axSheetIn','@keyframes axPageZoom',
              '--ax-modal:','--ax-sheet:','--ax-glide:','.axDragging','.axGrip','axPageZoom']:
    if token not in idx: errors.append('index.html thiếu phần Fluid Motion V14.5.0: '+token)
for token in ['ax5Init','ax5PrepareZoom','ax5PageZoom','ax5DragInit','ax5CloseOverlay','AX5.baseSync']:
    if token not in app: errors.append('app.js thiếu phần Fluid Motion V14.5.0: '+token)
# V14.6.0 — Gợi ý ml khi bé bú + Bảng dung lượng + Sửa lỗi treo khi mở từ nút "Thêm"
for token in ['FEED_AMOUNT_PRESETS','fq6Mount','fq6SetAmount','st6Render','st6AppUsage','st6LocalUsage',
              'nv6Go','nv6WrapBackupText','nv6ShowBackupText','nv6RenderCareTimeline','nv6WrapPageZoom',
              'nv6SkeletonWatchdog','nv6CleanPage','nv6GoMilkStock','nv6WrapEarly']:
    if token not in app: errors.append('app.js thiếu phần V14.6.0: '+token)
for token in ['id="st6Card"','id="st6Body"','nv6ShowBackupText()','st6Render(true)','.fq6Preset','.st6Row','.nv6More']:
    if token not in idx: errors.append('index.html thiếu phần V14.6.0: '+token)
# Bảng "Thêm" phải đi qua nv6Go (đóng sheet xong mới chuyển trang, không gọi hàm vẽ trước khi trang hiện)
if "closeMoreSheet();goTab(" in idx.replace(' ',''):
    errors.append('Bảng Thêm còn đóng sheet và chuyển trang trong cùng một khung hình (dùng nv6Go)')
if 'bkRenderVersionsPanel();bkRenderAutoConfigForm();' in idx.replace(' ',''):
    errors.append('Bảng Thêm còn gọi hàm vẽ trang Dữ liệu trước khi trang kịp hiện')
# Kho sữa không có trang riêng — nút cũ trỏ vào đó chỉ cho ra màn hình trắng
if "nv6Go('milkInventory')" in idx or "goTab('milkInventory')" in idx:
    errors.append('Bảng Thêm còn trỏ vào trang milkInventory không tồn tại (màn hình trắng)')
for _pid in re.findall(r"nv6Go\('([A-Za-z0-9]+)'", idx):
    if ('id="'+_pid+'" class="page') not in idx:
        errors.append('Bảng Thêm trỏ tới màn hình không tồn tại: '+_pid)
# Không được làm mờ nền bảng "Thêm" bằng backdrop-filter (thủ phạm khựng/thoát app trên iOS)
if '.moreSheet{backdrop-filter:none!important' not in idx:
    errors.append('index.html chưa gỡ backdrop-filter khỏi bảng Thêm')

# V14.7.0 — (1) Giao diện sáng/tối đúng ngay từ màn hình chờ (2) Gỡ module Sau sinh,
# Sổ sức khỏe thay chỗ trên Dashboard
# 1. Theme phải được chốt trong boot.js (chạy trong <head>) chứ không đợi render()
for token in ['mybThemeApply','prefers-color-scheme','themeMode','data-theme-mode',"setAttribute('data-theme'",'theme-color']:
    if token not in boot_src: errors.append('boot.js thiếu phần chốt giao diện sáng/tối V14.7.0: ' + token)
if "document.documentElement.setAttribute('data-theme',s.theme||'')" in app:
    errors.append('render() còn ghi đè giao diện bằng settings.theme thô (phải đi qua th7Apply)')
for token in ['th7Apply','th7Mode','th7Resolve','th7SetMode','th7Cycle','th7SyncButton','th7WrapUI','th7SystemDark']:
    if token not in app: errors.append('app.js thiếu phần giao diện sáng/tối V14.7.0: ' + token)
# 2. Module "Sau sinh" phải được gỡ sạch, không còn lối vào hoặc hàm chết
for token in ['function resetBabyForm','function saveBaby','function renderBabyStats',
              'function renderBabyChart','function showBabyChart','function toggleBabyMenu',
              'function openBabyMenu']:
    if token in app: errors.append('Module Sau sinh chưa gỡ hết khỏi app.js: ' + token)
for token in ['id="baby"', 'id="babyStats"', 'id="babyChart"', 'id="babyList"', 'id="babyStatsBox"',
              'id="babyChartBox"', 'id="babyFormTitle"', 'data-page="baby"', 'data-page="babyStats"',
              'toggleBabyMenu']:
    if token in idx: errors.append('Module Sau sinh chưa gỡ hết khỏi index.html: ' + token)
# Dữ liệu cũ phải được giữ lại cho sao lưu / xuất file / biểu đồ WHO
if 'db.baby' not in app: errors.append('Không được xoá dữ liệu db.baby (còn dùng cho sao lưu/biểu đồ WHO)')
# Nút thanh dưới cũ phải được chuyển sang màn hình thay thế, không để chết
for token in ["baby:'healthBook2'", "babyStats:'growthChart'", "babyChart:'growthChart'"]:
    if token not in app: errors.append('Thiếu chuyển đổi nút thanh dưới cũ V14.7.0: ' + token)
# 3. Biểu đồ WHO phải còn màn hình riêng và đọc được số đo của Sổ sức khỏe
if 'id="whoGrowthBox"' not in idx: errors.append('index.html mất khối biểu đồ WHO sau khi gỡ Sau sinh')
if 'id="growthChart" class="page"' not in idx.replace('class="page hidden"','class="page"'):
    errors.append('index.html thiếu màn hình Biểu đồ tăng trưởng (growthChart)')
if 'gw7WrapWhoSeries' not in app:
    errors.append('whoSeries chưa được bọc để đọc số đo Sổ sức khỏe (biểu đồ WHO sẽ đứng im)')
# 4. Block Dashboard "Sổ sức khỏe" thay chỗ block "Sự phát triển của bé"
for token in ['gw7DashCard','gw7Rows','gw7Latest','gw7Item','gw7Kid','gw7Fix','gw7GoMeasure','gw7MigrateConfig']:
    if token not in app: errors.append('app.js thiếu phần Sổ sức khỏe trên Dashboard V14.7.0: ' + token)
if "{id:'growth'," in app: errors.append('Cấu hình Dashboard còn module "growth" đã gỡ')
if "id:'healthBook'" not in app: errors.append('Cấu hình Dashboard thiếu module Sổ sức khỏe')
if "'alerts','healthBook','milestones'" not in app:
    errors.append('Thứ tự module mặc định của Dashboard chưa thay growth bằng healthBook')
for token in ['.gw7Grid','.gw7Delta','.gw7Pct','.gw7Warn','.gw7Stale']:
    if token not in idx: errors.append('index.html thiếu CSS block Sổ sức khỏe V14.7.0: ' + token)
# Dấu (!) phải mở được chú thích, không phải trang trí
if 'gw7Warn' in idx and 'showInfoBubble' not in app:
    errors.append('Dấu (!) của block Sổ sức khỏe không có hàm hiện chú thích')

# V15.0.0 — Timeline 2.0 (Unified Timeline)
# 1. Toàn bộ mô-đun mới phải có mặt trong app.js
for token in ['tl8RenderTimeline','tl8WrapTimeline','tl8DashCard','tl8DashRows','tl8OpenSheet','tl8Actions',
              'tl8Duplicate','tl8ToggleFav','tl8TogglePin','tl8AddPhotos','tl8AddVideos','tl8VideoThumb',
              'tl8RemoveMedia','tl8OpenNote','tl8SaveNote','tl8OpenShare','tl8ShareText','tl8ShareImage',
              'tl8ExportPdf','tl8ReportHtml','tl8Detail','tl8OpenViewer','tl8PressInit','tl8Collect',
              'tl8Match','tl8Hay','tl8SortArr','tl8SetSort','tl8ToggleFilter','tl8OnSearch','tl8Commit',
              'tl8Badges','tl8Index','tl8Prefs','tl8SavePrefs']:
    if token not in app: errors.append('app.js thiếu phần Timeline 2.0 V15.0.0: '+token)
# 2. index.html phải có thanh công cụ + các lớp phủ của Timeline 2.0
for token in ['id="tl8Search"','id="tl8Chips"','id="tl8SortBtn"','id="tl8Sheet"','id="tl8SheetGrid"',
              'id="tl8SortSheet"','id="tl8SortList"','id="tl8NoteSheet"','id="tl8NoteText"',
              'id="tl8Detail"','id="tl8DetailBody"','id="tl8Viewer"','id="tl8ViewerBody"',
              'id="tl8PhotoInput"','id="tl8VideoInput"','.tl8Chip','.tl8Badges','.tl8Strip','.tl8Act']:
    if token not in idx: errors.append('index.html thiếu phần Timeline 2.0 V15.0.0: '+token)
# 3. Không được sửa hàm cũ để gắn Timeline 2.0 — bắt buộc bọc renderCareTimeline
if 'TL8.baseTimeline' not in app:
    errors.append('renderCareTimeline chưa được bọc (Timeline 2.0 phải bọc, không sửa hàm cũ)')
# 4. Dashboard chỉ là Quick Timeline: KHÔNG được có ảnh/video/ghi chú/chia sẻ/PDF
_tl8_dash=app[app.find('function tl8Actions('):]
_tl8_dash=_tl8_dash[:_tl8_dash.find('function tl8OpenSheet(')]
if 'full=(mode!=' not in _tl8_dash.replace(' ',''):
    errors.append('Bảng thao tác chưa tách Dashboard (dash) với Unified Timeline (full)')
for token in ['tl8PickPhoto','tl8PickVideo','tl8OpenNote','tl8OpenShare','tl8ExportPdf']:
    if _tl8_dash.count(token)!=1:
        errors.append('Thao tác nặng phải nằm trong nhánh full, không được hiện trên Dashboard: '+token)
# 5. Đủ sáu chế độ sắp xếp và năm bộ lọc nhanh, có ghi nhớ lựa chọn
for token in ["'act_desc'","'act_asc'","'cre_desc'","'cre_asc'","'upd_desc'","'upd_asc'"]:
    if token not in app: errors.append('Timeline 2.0 thiếu chế độ sắp xếp: '+token)
for token in ["k:'fav'","k:'pin'","k:'photo'","k:'video'","k:'note'"]:
    if token not in app: errors.append('Timeline 2.0 thiếu bộ lọc nhanh: '+token)
if 'TL8_PREF_KEY' not in app: errors.append('Timeline 2.0 không ghi nhớ lựa chọn sắp xếp/lọc của người dùng')
# 6. Ghi dữ liệu phải an toàn: bộ nhớ đầy thì báo, không để localStorage ném lỗi ra ngoài
if 'function tl8Commit' not in app or 'try{save(db);returntrue}' not in app.replace(' ',''):
    errors.append('Timeline 2.0 thiếu lớp ghi an toàn tl8Commit (bộ nhớ đầy sẽ làm treo app)')
# 7. Dữ liệu cũ phải nguyên vẹn: chỉ THÊM trường phụ vào bản ghi, không xoá/đổi tên
for token in ['db.careEvents','x.media','.fav','.pin']:
    if token not in app: errors.append('Timeline 2.0 phải giữ nguyên bản ghi cũ và chỉ thêm trường phụ: '+token)
if 'delete db.careEvents' in app: errors.append('Timeline 2.0 không được xoá dữ liệu careEvents')
# 8. Xuất PDF phải đi qua popup xem trước có sẵn, không mở cửa sổ mới (kẹt trong PWA)
if 'hb2ShowReport(html' not in app:
    errors.append('Xuất PDF từng bản ghi phải dùng popup xem trước hb2ShowReport')
# 9. Ô tìm kiếm không được nuốt chuỗi base64 của ảnh/video (sẽ đứng máy)
_tl8_hay=app[app.find('function tl8Hay('):]
_tl8_hay=_tl8_hay[:_tl8_hay.find('function tl8Match(')]
if 'md.src' in _tl8_hay or 'm.src' in _tl8_hay:
    errors.append('Chuỗi tìm kiếm không được chứa dữ liệu ảnh/video (base64) — sẽ làm đứng máy')

# V15.0.1 — Thanh bộ lọc Timeline 2.0 thu gọn về một hàng
for token in ['id="tl8FilterBtn"','id="tl8FilterCount"','id="tl8FilterSheet"','id="tl8FilterApply"',
              'id="tl8Active"','id="tl8ActiveText"','class="tl8IconBtn"','.tl8Dot','.tl8Active']:
    if token not in idx: errors.append('index.html thiếu thanh bộ lọc thu gọn V15.0.1: '+token)
for token in ['tl8OpenFilter','tl8CloseFilter','tl8FilterCount','tl8ActiveParts']:
    if token not in app: errors.append('app.js thiếu phần thanh bộ lọc thu gọn V15.0.1: '+token)
# Lọc ngày / lọc loại phải nằm TRONG bảng ⚙ Bộ lọc, không còn chiếm chỗ trên trang
_tl8_card=idx[idx.find('<section id="careTimeline"'):]
_tl8_card=_tl8_card[:_tl8_card.find('id="careTimelineBox"')]
for token in ['id="careFilterDate"','id="careFilterType"','＋ Ghi nhận mới']:
    if token in _tl8_card:
        errors.append('Thẻ Timeline còn chiếm chỗ vì chưa chuyển vào bảng Bộ lọc: '+token)
# ...nhưng KHÔNG được xoá mất, vì renderCareTimeline vẫn đọc hai ô này
for token in ['id="careFilterDate"','id="careFilterType"']:
    if idx.count(token)!=1: errors.append('Ô lọc phải còn đúng một bản trong DOM: '+token)
# Chip phải tự đặt lại width, nếu không rule toàn cục button{width:100%} sẽ kéo dọc
if 'width:auto!important' not in idx[idx.find('.tl8Chip{'):idx.find('.tl8Chip{')+400]:
    errors.append('.tl8Chip chưa chặn rule toàn cục button{width:100%} (chip sẽ xếp dọc)')
if '.tl8IconBtn{width:40px!important' not in idx.replace(' ',''):
    errors.append('.tl8IconBtn chưa chặn rule toàn cục button{width:100%}')
# Thanh công cụ chỉ được một hàng: không bọc dòng
if '.tl8Bar{display:flex;gap:7px;align-items:center' not in idx:
    errors.append('Thanh công cụ Timeline phải nằm gọn một hàng (không flex-wrap)')

boot=(root/'boot.js').read_text(encoding='utf-8')
for token in ["updateViaCache","controllerchange","build.json","MEYEUBE_BUILD_ACK","location.replace"]:
    if token not in boot: errors.append('boot.js thiếu lớp chống giao diện cũ: '+token)
for token in ["MEYEUBE_BUILD_PING","c.navigate(c.url)","cache:'no-store'","caches.delete(k)"]:
    if token not in sw: errors.append('sw.js thiếu lớp chống giao diện cũ: '+token)
if 'src="./boot.js' not in idx: errors.append('index.html chưa nạp boot.js')
if "navigator.serviceWorker.register('./sw.js')" in app.replace(' ',''):
    errors.append('app.js còn đăng ký Service Worker kiểu cũ (bỏ qua boot guard)')

for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md','boot.js','build.json']:
    if '15.0.1' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')

for required_file in ['AC_V15.0.1.md','BASELINE_LOCK_V15.0.1.json','AC_V15.0.0.md','BASELINE_LOCK_V15.0.0.json','PUSH_NOTIFICATION_SETUP.md','supabase/functions/send-push/index.ts']:
    if not (root/required_file).exists(): errors.append('Thiếu file: '+required_file)

for js_file in ['app.js','sw.js','boot.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    if result.returncode!=0: errors.append(js_file+' lỗi cú pháp: '+result.stderr.strip())

# Baseline function hash verification (regression check vs. previous stable release).
# PREV_LOCK: cập nhật tên file này mỗi khi bump version, trỏ về BASELINE_LOCK của bản ổn định liền trước.
PREV_LOCK='BASELINE_LOCK_V15.0.0.json'
# INTENTIONAL_BASELINE_CHANGES: hàm trong Baseline Lock được phép đổi trong bản này,
# kèm lý do. Mọi hàm KHÔNG khai báo ở đây mà đổi hash vẫn bị coi là lỗi hồi quy.
# Khai báo phải được xoá sạch khi bump sang bản kế tiếp.
# V15.0.1: thu gon thanh bo loc cua Timeline 2.0 (ban A). Ba ham tl8* bi sua than,
# khai bao ben duoi. KHONG mot ham nao co tu truoc V15.0.0 bi dong toi.
INTENTIONAL_BASELINE_CHANGES={
    # Thanh cong cu cu chiem ~560px: o tim + 5 chip xep DOC (dinh rule toan cuc
    # button{width:100%}) + nut sap xep dai ca hang. Ban moi gom ve mot hang icon,
    # nen ham ve thanh phai viet lai: them so dem tren nut loc, dong tom tat va
    # so ket qua. Phan loc/tim/sap xep khong doi mot ky tu.
    'tl8SyncBar':'thu gon thanh bo loc: mot hang icon + so dem + dong tom tat',
    # Dem so ket qua phai co TRUOC khi ve thanh, nen doi thu tu goi tl8SyncBar.
    # Phan loc, sap xep, phan trang va dung dong khong doi.
    'tl8RenderTimeline':'goi tl8SyncBar(total) sau khi dem ket qua thay vi truoc',
    # Them mot lop phu moi (bang Bo loc) vao danh sach can dong.
    'tl8CloseAll':'dong them bang Bo loc moi',
}

def _extract_function(text,name):
    m=re.search(r'function\s+'+re.escape(name)+r'\s*\(',text)
    if not m: return None
    start=m.start(); brace_start=text.index('{',m.end()); depth=0; i=brace_start; in_str=None; escape=False
    while i<len(text):
        c=text[i]
        if in_str:
            if escape: escape=False
            elif c=='\\': escape=True
            elif c==in_str: in_str=None
        else:
            if c in ('"',"'",'`'): in_str=c
            elif c=='{': depth+=1
            elif c=='}':
                depth-=1
                if depth==0: return text[start:i+1]
        i+=1
    return None
intentional=[]
declared_unused=[]
if (root/PREV_LOCK).exists():
    prev=json.loads((root/PREV_LOCK).read_text(encoding='utf-8'))
    for fn_name,expected_hash in prev.items():
        fn_src=_extract_function(app,fn_name)
        if fn_src is None:
            errors.append('Baseline Lock: hàm bị xoá hoặc đổi tên: '+fn_name)
            continue
        actual_hash=hashlib.sha256(fn_src.encode('utf-8')).hexdigest()
        if actual_hash!=expected_hash:
            if fn_name in INTENTIONAL_BASELINE_CHANGES:
                intentional.append(fn_name+': '+INTENTIONAL_BASELINE_CHANGES[fn_name])
            else:
                errors.append('Baseline Lock: hàm "'+fn_name+'" đã thay đổi so với '+PREV_LOCK+' (có thể phá vỡ hành vi cũ)')
    for fn_name in INTENTIONAL_BASELINE_CHANGES:
        if fn_name not in prev: declared_unused.append(fn_name)
else:
    errors.append('Thiếu file baseline lock trước đó để đối chiếu: '+PREV_LOCK)
for fn_name in declared_unused:
    errors.append('Khai báo thay đổi có chủ ý cho hàm không có trong '+PREV_LOCK+': '+fn_name)

if intentional:
    print('THAY ĐỔI CÓ CHỦ Ý trong Baseline Lock (đã khai báo, không tính là lỗi):')
    [print('- '+x) for x in intentional]
if errors:
    print('RELEASE CHECK FAILED')
    [print('- '+e) for e in errors]
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.0.1')
