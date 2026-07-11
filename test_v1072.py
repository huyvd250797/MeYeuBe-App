
from pathlib import Path
import re, subprocess, sys

root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
errors=[]
passes=[]

def check(cond,label):
    if cond: passes.append(label)
    else: errors.append(label)

check((root/'AC_V10.7.2.md').exists(),'AC V10.7.2 exists')
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    check('10.7.2' in (root/f).read_text(encoding='utf-8'), 'Version consistency: '+f)

check(idx.count('src="./app.js')==1,'Single business JavaScript source')
check("function openSmartAlertCareForm(type)" in app,'Alert care navigation helper exists')
check("showPage('careAdd',document.querySelector('.navItem[data-page=\"careAdd\"]'),true)" in app,'Navigation opens careAdd directly')
check("selectCareType(normalized)" in app,'Navigation preselects requested care type')
check("\"openSmartAlertCareForm('feed')\"" in app,'Feed alert action has valid quoting')
check("\"openSmartAlertCareForm('temperature')\"" in app,'Temperature alert action has valid quoting')
check("onclick=\"'+a.action+'\"" in app,'Alert button uses action without duplicate close handler')
check("{id:'alerts',label:'Trung tâm cảnh báo'" in app,'Dashboard config exposes Smart Alert block')
check("DEFAULT_DASH_ORDER=['babyInfo','appointment','todayCare','alerts','growth','careJournal']" in app,'Smart Alert block remains movable in default order')
check("<details class=\"bcBirthMore\" open>" in app,'Birth information expanded by default')
check("meYeuBePWA_v4" in app,'LocalStorage key preserved')
for token in ['cloudRealtimeStart','pushLocalToCloud','pullCloudToLocal','renderDashboard','renderCareTimeline','handleBabyAvatarUpload','exportDB','importDB','evaluateSmartAlerts']:
    check(token in app,'Regression module: '+token)

node=subprocess.run(['node','--check',str(root/'app.js')],capture_output=True,text=True)
check(node.returncode==0,'JavaScript syntax')

if errors:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    for e in errors: print('- FAIL:',e)
    if node.stderr: print(node.stderr)
    sys.exit(1)
print('HVUS V1.0 RELEASE GATE: PASSED')
for p in passes: print('- PASS:',p)
