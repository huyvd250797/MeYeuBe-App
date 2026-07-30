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
 'hb2Timeline','hb2ViewReport','hb2ToggleTaken','hb2ToggleRemind'
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

for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    if '14.1.0' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')

for required_file in ['AC_V14.1.0.md','BASELINE_LOCK_V14.1.0.json','PUSH_NOTIFICATION_SETUP.md','supabase/functions/send-push/index.ts']:
    if not (root/required_file).exists(): errors.append('Thiếu file: '+required_file)

for js_file in ['app.js','sw.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    if result.returncode!=0: errors.append(js_file+' lỗi cú pháp: '+result.stderr.strip())

# Baseline function hash verification (regression check vs. previous stable release).
# PREV_LOCK: cập nhật tên file này mỗi khi bump version, trỏ về BASELINE_LOCK của bản ổn định liền trước.
PREV_LOCK='BASELINE_LOCK_V14.0.0.json'
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
if (root/PREV_LOCK).exists():
    prev=json.loads((root/PREV_LOCK).read_text(encoding='utf-8'))
    for fn_name,expected_hash in prev.items():
        fn_src=_extract_function(app,fn_name)
        if fn_src is None:
            errors.append('Baseline Lock: hàm bị xoá hoặc đổi tên: '+fn_name)
            continue
        actual_hash=hashlib.sha256(fn_src.encode('utf-8')).hexdigest()
        if actual_hash!=expected_hash:
            errors.append('Baseline Lock: hàm "'+fn_name+'" đã thay đổi so với '+PREV_LOCK+' (có thể phá vỡ hành vi cũ)')
else:
    errors.append('Thiếu file baseline lock trước đó để đối chiếu: '+PREV_LOCK)

if errors:
    print('RELEASE CHECK FAILED')
    [print('- '+e) for e in errors]
    sys.exit(1)
print('RELEASE CHECK PASSED: V14.1.0')
