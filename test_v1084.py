from pathlib import Path
import re,sys,subprocess,json,hashlib
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name,cond): checks.append((name,bool(cond)))
def extract(s,name):
    start=s.find('function '+name+'(')
    if start<0:return None
    brace=s.find('{',start);depth=0
    for i in range(brace,len(s)):
        if s[i]=='{':depth+=1
        elif s[i]=='}':
            depth-=1
            if depth==0:return s[start:i+1]
    return None
check('AC V10.8.4 exists',(root/'AC_V10.8.4.md').exists())
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    check('Version '+f,'10.8.4' in (root/f).read_text(encoding='utf-8'))
check('Two-column detail picker','.careDetailPicker{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important' in idx)
check('Mobile picker stays two columns','@media(max-width:640px)' in idx and '.careDetailPicker{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important' in idx)
check('Detail add helper','function openCareAddFromDetail(type,date)' in app)
check('Detail add button','careDetailAddBtn' in app and 'openCareAddFromDetail' in app)
check('Correct date prefill',"setValSafe('cDate',date||today())" in app and "setValSafe('cEndDate',date||today())" in app)
check('Return context after save','window.__careFormReturnContext' in app and "renderCareStatDetail(returnCtx.type,returnCtx.date)" in app)
check('New record confirmation',"Đã thêm 1 ghi nhận mới" in app)
check('Horizontal scroll locked','overflow-x:hidden!important' in idx and 'overscroll-behavior-x:none' in idx)
check('Mobile modal expanded','width:min(100%,820px)!important' in idx and 'max-width:calc(100vw - 12px)' in idx)
check('Safe mobile padding','env(safe-area-inset-top)' in idx and 'env(safe-area-inset-bottom)' in idx)
check('LocalStorage key preserved',"meYeuBePWA_v4" in app)
# Baseline function lock
lock=json.loads((root/'BASELINE_LOCK_V10.8.3.json').read_text())
for n,h in lock.items():
    b=extract(app,n)
    check('Baseline lock '+n,b is not None and hashlib.sha256(b.encode()).hexdigest()==h)
for js in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(root/js)],capture_output=True,text=True)
    check('Syntax '+js,r.returncode==0)
failed=[n for n,v in checks if not v]
for n,v in checks:print(('- PASS: ' if v else '- FAIL: ')+n)
if failed:
    print('HVUS V1.1 RELEASE GATE: FAILED');sys.exit(1)
print('HVUS V1.1 RELEASE GATE: PASSED')
