from pathlib import Path
import re,sys,subprocess
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
 'maybeDispatchPushAlerts','urlBase64ToUint8Array','openCareFormModal','openNotificationCenter','setMilkInventoryFilter'
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
    if '10.9.3' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')

for required_file in ['AC_V10.9.2.md','PUSH_NOTIFICATION_SETUP.md','supabase/functions/send-push/index.ts']:
    if not (root/required_file).exists(): errors.append('Thiếu file: '+required_file)

for js_file in ['app.js','sw.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    if result.returncode!=0: errors.append(js_file+' lỗi cú pháp: '+result.stderr.strip())

if errors:
    print('RELEASE CHECK FAILED')
    [print('- '+e) for e in errors]
    sys.exit(1)
print('RELEASE CHECK PASSED: V10.9.3')
