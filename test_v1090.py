from pathlib import Path
import re,sys,subprocess,json,tempfile
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def ok(name,cond):
    checks.append((name,bool(cond)))

# static acceptance checks
ok('AC V10.9.0 exists',(root/'AC_V10.9.0.md').exists())
ok('Release manifest exists',(root/'release-manifest.json').exists())
ok('Security audit exists',(root/'SECURITY_AUDIT.md').exists())
ok('Storage health UI','storageHealthText' in idx and 'refreshStorageHealth' in app)
ok('Safety backup before pull',"before-manual-cloud-pull" in app)
ok('Safety backup before realtime',"before-realtime-apply" in app)
ok('Safety backup download','downloadLatestSafetyBackup' in app)
ok('Cloud transaction id','_cloudTransactionId' in app and '_cloudParentRevision' in app)
ok('Avatar Storage migration','migrateAvatarToCloud' in app and 'baby-assets' in (root/'supabase_setup.sql').read_text())
ok('Advanced menu','advancedMenuToggle' in idx and 'toggleAdvancedMenu' in app)
ok('Adaptive alert CSS','max-height:min(78vh,760px)' in idx)
ok('Semantic Quick Add','<button type="button" class="careTypeBtn"' in idx and '<div class="careTypeBtn"' not in idx)
ok('Build hash','APP_BUILD_HASH' in app and 'appBuildInfo' in idx)
ok('Sync ID main blocked','Sync ID "main" không an toàn' in app)
ok('LocalStorage key preserved',"var KEY='meYeuBePWA_v4'" in app)
for token in ['cloudRealtimeStart','enableDevicePush','evaluateSmartAlerts','openSmartAlertCenter','renderDashboard','exportDB','importDB']:
    ok('Regression '+token,token in app)

# fail-closed runtime logic test using Node VM for selected executable functions.
node_test=r"""
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2],'utf8');
function extract(name){
 const start=src.indexOf('function '+name+'(');
 if(start<0)throw new Error('missing '+name);
 let brace=src.indexOf('{',start),depth=0,end=-1;
 for(let i=brace;i<src.length;i++){if(src[i]=='{')depth++;else if(src[i]=='}'){depth--;if(depth===0){end=i+1;break}}}
 return src.slice(start,end);
}
const ctx={console,Math,Date,Number,String,JSON,isFinite,Error,
 localStorage:{_d:{a:'123'},length:1,key:i=>i===0?'a':null,getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=String(v)}},
 cloudDeviceId:()=> 'dev_test_123456',showToast:()=>{},load:()=>({settings:{avatarUrl:'https://x/avatar.jpg'}})};
vm.createContext(ctx);
for(const n of ['formatBytes','resolveBabyAvatar','cloudTransactionMeta','cloudValidateCfg'])vm.runInContext(extract(n),ctx);
if(ctx.formatBytes(1024)!=='1.0 KB')throw new Error('formatBytes');
if(ctx.resolveBabyAvatar({avatarUrl:'u',avatarDataUrl:'d'})!=='u')throw new Error('avatar priority');
let o={};ctx.cloudTransactionMeta(o,7);if(o._cloudParentRevision!==7||!o._cloudTransactionId)throw new Error('transaction');
let blocked=false;try{ctx.cloudValidateCfg({url:'u',anonKey:'k',syncId:'main'})}catch(e){blocked=true}
if(!blocked)throw new Error('main sync id not blocked');
console.log('RUNTIME PASS');
"""
with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as f:
    f.write(node_test); node_file=f.name
r=subprocess.run(['node',node_file,str(root/'app.js')],capture_output=True,text=True)
ok('Runtime logic execution',r.returncode==0 and 'RUNTIME PASS' in r.stdout)
if r.returncode!=0: print('Runtime stderr:',r.stderr)

failed=[n for n,v in checks if not v]
for n,v in checks: print(('- PASS: ' if v else '- FAIL: ')+n)
if failed:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    sys.exit(1)
print('HVUS V1.0 RELEASE GATE: PASSED')
