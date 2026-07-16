from pathlib import Path
import re, subprocess, sys, hashlib, json
W=Path(__file__).parent
app=(W/'app.js').read_text(encoding='utf-8')
html=(W/'index.html').read_text(encoding='utf-8')
checks=[]
def ck(name,cond):
    checks.append((name,bool(cond)))
ck('AC V10.8.5 exists',(W/'AC_V10.8.5.md').exists())
for fn in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    ck('Version '+fn,'10.8.5' in (W/fn).read_text(encoding='utf-8'))
ck('Smart default storage','meYeuBeCareSmartDefaults_v1' in app)
ck('Remember defaults','rememberCareSmartDefault(item)' in app)
ck('Recent feed amounts','feedAmounts' in app and 'Dùng gần đây' in app)
ck('Recent medicines','medicines' in app and 'Thuốc dùng gần đây' in app)
ck('Scroll preservation','restoreCareDetailScroll' in app and 'scrollTop' in app)
ck('Sticky summary CSS','.careDetailScroll>.careDetailItem:first-child{position:sticky' in html)
ck('Swipe edit delete','careRecordSwipeStart' in app and 'openCareEditFromDetail' in app and 'deleteCareFromDetail' in app)
ck('Skeleton loading','careDetailSkeleton' in app and 'skeletonMove' in html)
ck('Animation 180ms','sheetRise .18s' in html)
ck('Bottom sheet mobile','max-height:92dvh' in html and 'align-items:flex-end' in html)
ck('Haptic feedback','function careHaptic' in app and 'navigator.vibrate' in app)
ck('Auto focus','carePrimaryField' in app and '.focus({preventScroll:true})' in app)
ck('Pump storage not defaulted',"if(type==='pump'){setValSafe('cPumpSide'" in app and "setValSafe('cStorage'" not in app[app.index('function applyCareSmartDefault'):app.index('function carePrimaryField')])
ck('LocalStorage key preserved',"meYeuBePWA_v4" in app)
# Baseline functions still present and no backend schema changes
for name in ['cloudRealtimeStart','pushLocalToCloud','pullCloudToLocal','enableDevicePush','testAllDevicesPush','evaluateSmartAlerts','maybeDispatchPushAlerts','exportDB','importDB']:
    ck('Baseline '+name,('function '+name) in app)
ck('Supabase schema untouched','10.8.5' not in (W/'supabase_setup.sql').read_text(encoding='utf-8'))
# syntax
for fn in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(W/fn)],capture_output=True,text=True)
    ck('Syntax '+fn,r.returncode==0)
for n,v in checks: print(('- PASS: ' if v else '- FAIL: ')+n)
if not all(v for _,v in checks):
    print('HVUS V1.1 RELEASE GATE: FAILED');sys.exit(1)
print('HVUS V1.1 RELEASE GATE: PASSED')
