from pathlib import Path
import re, subprocess, sys, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
html=(root/'index.html').read_text(encoding='utf-8')
errors=[]
passes=[]
def check(name, cond):
    (passes if cond else errors).append(name)

check('AC file exists', (root/'AC_V10.7.1.md').exists())
check('Version consistency', all('10.7.1' in (root/f).read_text(encoding='utf-8') for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']))
check('Single business JavaScript source', html.count('src="./app.js')==1 and not any((root/f).exists() for f in ['script0.js','script1.js','script2.js','script_inline_0.js']))
check('Rule Engine exists', 'function evaluateSmartAlerts' in app)
check('Config normalization exists', 'function normalizeSmartAlertConfig' in app)
check('Critical Warning Info levels', all(x in app for x in ["critical:{rank:3","warning:{rank:2","info:{rank:1"]))
check('Dashboard summary exists', 'smartAlertSummary' in app and 'openSmartAlertCenter()' in app)
check('Alert Center popup exists', 'id="smartAlertOverlay"' in html and 'id="smartAlertCenterBody"' in html)
check('Rule configuration UI exists', 'id="cfgSmartAlertsList"' in html and 'id="cfgSmartAlertsEnabled"' in html)
check('Rule configuration persisted', 'cfg.smartAlerts=smart' in app and 'smartAlerts:normalizeSmartAlertConfig' in app)
check('No legacy <120 ml alert', 'care.feedMl<120' not in app and 'care.feedMl < 120' not in app)
check('Realtime render retained', 'cloudRealtimeStart' in app and 'cloudApplyRemotePayload' in app)
for token in ['renderDashboard','renderCareTimeline','renderCareStats','renderMilkInventory','handleBabyAvatarUpload','exportDB','importDB','testCloudConnection']:
    check('Regression module: '+token, token in app)
check('Manual Cloud Sync retained', all(x in app for x in ['pushLocalToCloud','pullCloudToLocal','smartCloudSync']))
check('LocalStorage key preserved', "meYeuBePWA_v4" in app)
check('Alert severity order', "alerts.sort(function(a,b){return b.rank-a.rank" in app)
check('Rules use config thresholds', all(x in app for x in ['tempRule.threshold','feedRule.graceMinutes','sleepRule.maxHours','expiringRule.beforeHours','apptRule.beforeHours']))
node=subprocess.run(['node','--check',str(root/'app.js')],capture_output=True,text=True)
check('JavaScript syntax', node.returncode==0)
if errors:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    for x in passes: print('- PASS:',x)
    for x in errors: print('- FAIL:',x)
    if node.stderr: print(node.stderr)
    sys.exit(1)
print('HVUS V1.0 RELEASE GATE: PASSED')
for x in passes: print('- PASS:',x)
