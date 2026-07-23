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
 'checkAutoMilestones','addMilestone','milestoneExists','renderMilestoneTimeline','shareMilestoneImage','saveMilestone'
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
if "latestB&&latestB.weight?latestB.weight:(latestP" in app: errors.append('Còn fallback cân nặng thai sau sinh')

for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    if '11.0.0' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')

for required_file in ['AC_V11.0.0.md','BASELINE_LOCK_V11.0.0.json','PUSH_NOTIFICATION_SETUP.md','supabase/functions/send-push/index.ts']:
    if not (root/required_file).exists(): errors.append('Thiếu file: '+required_file)

for js_file in ['app.js','sw.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    if result.returncode!=0: errors.append(js_file+' lỗi cú pháp: '+result.stderr.strip())

# Baseline function hash verification (regression check vs. previous stable release).
# PREV_LOCK: cập nhật tên file này mỗi khi bump version, trỏ về BASELINE_LOCK của bản ổn định liền trước.
PREV_LOCK='BASELINE_LOCK_V10.9.2.json'
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
print('RELEASE CHECK PASSED: V11.0.0')
