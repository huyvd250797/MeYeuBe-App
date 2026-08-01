from pathlib import Path
import re,sys,subprocess,hashlib,json
root=Path(__file__).resolve().parent
errors=[]
idx=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
sw=(root/'sw.js').read_text(encoding='utf-8')
sql=(root/'supabase_setup.sql').read_text(encoding='utf-8')
edge=(root/'supabase/functions/send-push/index.ts').read_text(encoding='utf-8')

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
if "goTab('healthBook2')" not in idx: errors.append('Bảng Thêm ở thanh dưới thiếu module Sổ sức khỏe 2.0')

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

for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    if '14.4.1' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')

for required_file in ['AC_V14.4.1.md','BASELINE_LOCK_V14.4.1.json','AC_V14.4.0.md','BASELINE_LOCK_V14.4.0.json','PUSH_NOTIFICATION_SETUP.md','supabase/functions/send-push/index.ts']:
    if not (root/required_file).exists(): errors.append('Thiếu file: '+required_file)

for js_file in ['app.js','sw.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    if result.returncode!=0: errors.append(js_file+' lỗi cú pháp: '+result.stderr.strip())

# Baseline function hash verification (regression check vs. previous stable release).
# PREV_LOCK: cập nhật tên file này mỗi khi bump version, trỏ về BASELINE_LOCK của bản ổn định liền trước.
PREV_LOCK='BASELINE_LOCK_V14.4.0.json'
# INTENTIONAL_BASELINE_CHANGES: hàm trong Baseline Lock được phép đổi trong bản này,
# kèm lý do. Mọi hàm KHÔNG khai báo ở đây mà đổi hash vẫn bị coi là lỗi hồi quy.
# Khai báo phải được xoá sạch khi bump sang bản kế tiếp.
# V14.4.1: chi axEaseOut thay doi (easeOutCubic -> easeOutQuint cho bo dem muot hon).
# 121 ham con lai (gom axInit da chot o V14.4.0) giu nguyen hash so voi BASELINE_LOCK_V14.4.0.json.
INTENTIONAL_BASELINE_CHANGES={
 'axEaseOut':'V14.4.1 — doi easing bo dem sang easeOutQuint (1-(1-t)^5) cho cam giac muot kieu iOS; van la ham thuan, khong tac dung phu.',
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
print('RELEASE CHECK PASSED: V14.4.1')
