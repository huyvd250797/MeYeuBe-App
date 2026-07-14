from pathlib import Path
import subprocess, sys
w=Path(__file__).parent
app=(w/'app.js').read_text()
html=(w/'index.html').read_text()
checks={
'AC file':(w/'AC_V10.8.3.md').exists(),
'Version app':'V10.8.3' in app,
'Version html':'V10.8.3' in html,
'Alert milk navigation':'openMilkInventoryAlert(' in app,
'Expired IDs':'expiredIds' in app,
'Expiring IDs':'expiringIds' in app,
'Highlight class':'alertHighlight' in app and '.milkBag.alertHighlight' in html,
'Notification action retained':'closeNotificationCenter();'+"'" not in '',
'Care add blocks only':'#careAdd #careFormCard> :not(.careTypeGrid)' in html,
'Modal hides type blocks':'.careFormModal .careTypeGrid{display:none!important}' in html,
'Filter toggle':'toggleMilkInventoryFilters' in app,
'Filter collapsed CSS':'.milkFilterBar.collapsed{display:none}' in html,
'LocalStorage key preserved':'meYeuBePWA_v4' in app,
'Realtime retained':'cloudRealtimeStart' in app,
'Push retained':'enableDevicePush' in app,
'Smart Alert retained':'evaluateSmartAlerts' in app,
'Cloud manual retained':'pushLocalToCloud' in app and 'pullCloudToLocal' in app,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('- PASS: ' if v else '- FAIL: ')+k)
for f in ['app.js','sw.js']:
 r=subprocess.run(['node','--check',str(w/f)],capture_output=True,text=True)
 ok=r.returncode==0
 print(('- PASS: ' if ok else '- FAIL: ')+f+' syntax')
 if not ok: failed.append(f+' syntax')
if failed:
 print('HVUS V1.0 RELEASE GATE: FAILED')
 sys.exit(1)
print('HVUS V1.0 RELEASE GATE: PASSED')
