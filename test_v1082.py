from pathlib import Path
import re, subprocess, sys, threading, http.server, socketserver, time
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parent
idx=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
checks=[]
def ok(name,cond):
    checks.append((name,bool(cond)))

ok('AC V10.8.2 exists',(root/'AC_V10.8.2.md').exists())
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    ok('Version consistency: '+f,'10.8.2' in (root/f).read_text(encoding='utf-8'))
ok('Single business JavaScript source',idx.count('src="./app.js')==1 and not any((root/f).exists() for f in ['script0.js','script1.js','script2.js','script_inline_0.js']))
ok('Connection wording',"cloudSetRealtimeState('REALTIME','Đã kết nối')" in app and "showToast('Đã cập nhật dữ liệu','success')" in app)
ok('No old realtime toast','Realtime đã kết nối' not in app and 'Đã đồng bộ dữ liệu Cloud mới nhất' not in app)
ok('Alert safe-area CSS','max(72px, calc(env(safe-area-inset-top) + 56px))' in idx and '.smartAlertOverlay' in idx)
ok('Care form modal exists','id="careFormOverlay"' in idx and 'openCareFormModal' in app and 'handleCareTypeBlock' in app)
ok('Notification center exists','id="notificationOverlay"' in idx and 'openNotificationCenter' in app and 'unreadNotificationCount' in app)
ok('Notification badge','onclick="openNotificationCenter()"' in app and "<span class=\"bcBadge\">" in app)
ok('Milk storage filter','milkStorageFilter' in app and 'meYeuBeMilkFilter_v1' in app)
ok('Milk status filter','milkStatusFilter' in app)
ok('Milk edit action','editMilkBagFromInventory' in app and 'Sửa túi' in app)
ok('Pump storage starts empty','<option value="">-- Chọn nơi bảo quản --</option>' in app)
ok('Pump storage required',"Vui lòng chọn vị trí bảo quản" in app)
ok('Expiry empty without storage',"if(!storage){exp.value='';return}" in app)
for token in ['cloudRealtimeStart','pushLocalToCloud','pullCloudToLocal','evaluateSmartAlerts','openSmartAlertCenter','enableDevicePush','testAllDevicesPush','renderDashboard','renderMilkInventory','exportDB','importDB']:
    ok('Regression module: '+token,token in app)
ok('LocalStorage key preserved',"meYeuBePWA_v4" in app)
for f in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    ok('JavaScript syntax: '+f,r.returncode==0)

# Runtime browser smoke tests using an in-memory document.
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-crash-reporter','--disable-crashpad','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':390,'height':844})
        runtime_html=re.sub(r'<script[^>]+src="\./app\.js[^>]*></script>','',idx)
        page.set_content(runtime_html,wait_until='domcontentloaded')
        page.add_script_tag(content=app)
        page.wait_for_function("typeof openCareFormModal==='function' && typeof render==='function'",timeout=15000)
        page.evaluate("loadNotificationHistory=()=>[];saveNotificationHistory=()=>{};unreadNotificationCount=()=>0;")
        page.evaluate("document.getElementById('splashScreen')?.remove(); document.getElementById('appLoading')?.remove();")
        page.evaluate("openCareFormModal('pump')")
        ok('Runtime care popup opens',page.locator('#careFormOverlay').evaluate("e=>e.classList.contains('show')"))
        ok('Runtime pump storage blank',page.locator('#cStorage').input_value()=='')
        ok('Runtime expiry blank initially',page.locator('#cExpireDate').input_value()=='')
        page.select_option('#cStorage','Ngăn mát')
        page.dispatch_event('#cStorage','change')
        ok('Runtime expiry loads after selection',bool(page.locator('#cExpireDate').input_value()))
        page.evaluate("closeCareFormModal(); openNotificationCenter()")
        ok('Runtime notification popup opens',page.locator('#notificationOverlay').evaluate("e=>e.classList.contains('show')"))
        page.evaluate("closeNotificationCenter(); openSmartAlertCenter()")
        ok('Runtime alert popup opens',page.locator('#smartAlertOverlay').evaluate("e=>e.classList.contains('show')"))
        pad_left=page.locator('#smartAlertOverlay').evaluate("e=>getComputedStyle(e).paddingLeft")
        ok('Runtime alert horizontal padding',float(pad_left.replace('px',''))>=16)
        browser.close()
except Exception as e:
    checks.append(('Runtime browser tests',False))
    print('Runtime error:',repr(e))

failed=[n for n,v in checks if not v]
print('HVUS V1.0 RELEASE GATE: '+('PASSED' if not failed else 'FAILED'))
for n,v in checks: print(('- PASS: ' if v else '- FAIL: ')+n)
if failed: sys.exit(1)
