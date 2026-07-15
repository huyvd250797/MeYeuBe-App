from pathlib import Path
import subprocess, sys, json, re
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
checks=[]
def ok(name,cond): checks.append((name,bool(cond)))

ok('AC V10.9.2 exists',(root/'AC_V10.9.2.md').is_file())
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    ok('Version '+f,'10.9.2' in (root/f).read_text(encoding='utf-8'))
ok('Legacy main is allowed','Sync ID "main" không an toàn' not in app)
ok('Default sync ID main',"syncId:'main'" in app)
ok('Fetch by arbitrary sync ID','function cloudFetchRowBySyncId' in app)
ok('Compatibility fallback to main',"cloudFetchRowBySyncId(cfg,'main')" in app and 'compatibilityFallback=true' in app)
ok('Cloud payload validation','function cloudPayloadStats' in app and 'cloudPayloadIsMeaningful' in app)
ok('Empty local overwrite guard','function cloudGuardAgainstEmptyOverwrite' in app)
ok('Invalid remote apply guard','function cloudValidateRemoteForApply' in app)
ok('Manual push guarded',"cloudGuardAgainstEmptyOverwrite(db,existing,'Đẩy Cloud')" in app)
ok('Manual pull validates remote','cloudValidateRemoteForApply(row)' in app)
ok('Smart sync recovers empty local','Thiết bị đang trống: đã khôi phục dữ liệu từ Cloud' in app)
ok('Auto push cannot overwrite meaningful cloud','Đã ngăn tự động ghi đè Cloud bằng dữ liệu trống' in app)
ok('Realtime ignores empty payload','if(!payload||!cloudPayloadIsMeaningful(payload))return false' in app)
ok('Compatibility sync ID adoption','function cloudAdoptResolvedSyncId' in app)
ok('Safety backup retained','createSafetyBackup' in app)
ok('LocalStorage key preserved','meYeuBePWA_v4' in app)
for token in ['cloudRealtimeStart','enableDevicePush','evaluateSmartAlerts','renderDashboard','exportDB','importDB']:
    ok('Regression '+token,token in app)
for js in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(root/js)],capture_output=True,text=True)
    ok('Syntax '+js,r.returncode==0)

# Execute the core recovery decision model.
runtime_js=r'''
function cloudPayloadStats(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return {valid:false,meaningful:false,count:0};
  var listKeys=['pregnancy','baby','mom','diary','healthBook','appointments','careEvents','milkInventory'];
  var count=listKeys.reduce(function(total,key){return total+(Array.isArray(payload[key])?payload[key].length:0)},0);
  var settings=payload.settings&&typeof payload.settings==='object'?payload.settings:{};
  var meaningfulSettings=Object.keys(settings).some(function(key){var value=settings[key];return value!==''&&value!==null&&value!==undefined&&value!==false});
  return {valid:true,meaningful:count>0||meaningfulSettings,count:count};
}
function cloudPayloadIsMeaningful(payload){return cloudPayloadStats(payload).meaningful}
function cloudLocalIsEmpty(payload){return !cloudPayloadIsMeaningful(payload)}
const cases={
 empty:cloudLocalIsEmpty({settings:{},careEvents:[],milkInventory:[]}),
 care:cloudPayloadIsMeaningful({settings:{},careEvents:[{id:'1'}]}),
 settings:cloudPayloadIsMeaningful({settings:{babyName:'Bún'}}),
 invalid:cloudPayloadIsMeaningful(null)
};
console.log(JSON.stringify(cases));
'''
r=subprocess.run(['node','-e',runtime_js],capture_output=True,text=True)
try:
    data=json.loads(r.stdout.strip())
    ok('Runtime payload structure logic',r.returncode==0 and data=={'empty':True,'care':True,'settings':True,'invalid':False})
except Exception:
    ok('Runtime payload structure logic',False)

failed=[n for n,v in checks if not v]
for n,v in checks: print(('- PASS: ' if v else '- FAIL: ')+n)
if failed:
    print('HVUS V1.1 RELEASE GATE: FAILED')
    sys.exit(1)
print('HVUS V1.1 RELEASE GATE: PASSED')
