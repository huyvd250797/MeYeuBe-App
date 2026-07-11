from pathlib import Path
import re, subprocess, sys, json

root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
sw=(root/'sw.js').read_text(encoding='utf-8')
sql=(root/'supabase_setup.sql').read_text(encoding='utf-8')
edge=(root/'supabase/functions/send-push/index.ts').read_text(encoding='utf-8')
errors=[]
passes=[]

def check(cond,label):
    if cond: passes.append(label)
    else: errors.append(label)

check((root/'AC_V10.8.0.md').exists(),'AC V10.8.0 exists')
check((root/'PUSH_NOTIFICATION_SETUP.md').exists(),'Push setup guide exists')

for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    check('10.8.0' in (root/f).read_text(encoding='utf-8'), 'Version consistency: '+f)

check(idx.count('src="./app.js')==1,'Single business JavaScript source')
check('id="pushStatusPill"' in idx,'Push status UI')
check('id="pushVapidPublicKey"' in idx,'VAPID public key UI')
check('id="pushAlertTypeList"' in idx,'Alert type preferences UI')
check('onclick="enableDevicePush()"' in idx,'Enable push button')
check('onclick="disableDevicePush()"' in idx,'Disable push button')
check('onclick="testDevicePush()"' in idx,'Test push button')

check("Notification.requestPermission()" in app,'Notification permission request')
check("pushManager.subscribe" in app,'PushManager subscribe')
check("applicationServerKey:urlBase64ToUint8Array" in app,'VAPID key conversion')
check("push_subscriptions?on_conflict=endpoint" in app,'Subscription upsert')
check("device_id:cloudDeviceId()" in app,'Per-device subscription')
check("alert_types:" in app,'Per-device alert type preferences')
check("mode:'test'" in app and "target_device_id:cloudDeviceId()" in app,'Targeted test notification')
check("mode:'alert'" in app and "source_device_id:cloudDeviceId()" in app,'Smart Alert push dispatch')
check("a.severity==='critical'||a.severity==='warning'" in app,'Only Critical and Warning auto-push')
check("PUSH_SENT_KEY" in app,'Local duplicate prevention')
check("eventKey:eventKey||id" in app,'Stable alert event key')
check("cfg.expired=true" in app,'Expired subscription state')
check("refreshPushSubscriptionRegistration" in app,'Subscription refresh on boot')

check("self.addEventListener('push'" in sw,'Service Worker push event')
check("showNotification" in sw,'Service Worker displays notification')
check("self.addEventListener('notificationclick'" in sw,'Notification click event')
check("MEYEUBE_NOTIFICATION_CLICK" in sw and "MEYEUBE_NOTIFICATION_CLICK" in app,'Notification click opens app alert center')

check("create table if not exists public.push_subscriptions" in sql,'Push subscriptions table')
check("endpoint text not null unique" in sql,'Unique endpoint')
check("create table if not exists public.push_delivery_log" in sql,'Delivery log table')
check("unique(subscription_id,event_key)" in sql,'Server duplicate prevention')

check('webpush.setVapidDetails' in edge,'Edge Function VAPID setup')
check('webpush.sendNotification' in edge,'Edge Function sends Web Push')
check('.eq("sync_id", syncId)' in edge,'Edge Function filters Sync ID')
check('.neq("device_id", sourceDeviceId)' in edge,'Edge Function excludes source device')
check('!allowedTypes.includes(alert.rule_id)' in edge,'Edge Function filters allowed alert types')
check('statusCode === 404 || statusCode === 410' in edge,'Expired subscription handling')
check('.from("push_subscriptions").delete()' in edge,'Expired subscription deletion')
check('.from("push_delivery_log")' in edge,'Delivery idempotency log')

# Regression contracts
for token in [
 'cloudRealtimeStart','pushLocalToCloud','pullCloudToLocal','renderDashboard',
 'renderCareTimeline','renderCareStats','renderMilkInventory',
 'handleBabyAvatarUpload','exportDB','importDB','testCloudConnection',
 'evaluateSmartAlerts','openSmartAlertCenter'
]:
    check(token in app,'Regression module: '+token)

check("var KEY='meYeuBePWA_v4'" in app,'LocalStorage key preserved')
check('care.feedMl<120' not in app,'No legacy <120 ml alert')

for js_file in ['app.js','sw.js']:
    result=subprocess.run(['node','--check',str(root/js_file)],capture_output=True,text=True)
    check(result.returncode==0,'JavaScript syntax: '+js_file)
    if result.returncode!=0: errors.append(result.stderr.strip())

if errors:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    for item in errors: print('- FAIL:',item)
    sys.exit(1)

print('HVUS V1.0 RELEASE GATE: PASSED')
for item in passes: print('- PASS:',item)
print('- MANUAL REQUIRED: Deploy Supabase SQL + Edge Function, install PWA on real device, grant permission, and verify delivery.')
