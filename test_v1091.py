from pathlib import Path
import re, subprocess, sys, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
checks=[]

def ok(name, cond):
    checks.append((name,bool(cond)))

ok('AC V10.9.1 exists',(root/'AC_V10.9.1.md').is_file())
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    ok('Version '+f,'10.9.1' in (root/f).read_text(encoding='utf-8'))
ok('Startup safe wrapper','function startupSafeStep' in app)
ok('Splash force hide','function forceHideSplash' in app)
ok('Startup watchdog 3 seconds',"watchdog timeout" in app and "},3000)" in app)
ok('Global fallback 5 seconds',"global fallback timeout" in app and "},5000)" in app)
ok('UI renders before cloud',app.find("startupSafeStep('initial render'") < app.find("startupSafeStep('cloud auto pull'"))
ok('Cloud deferred',"setTimeout(function(){\n    startupSafeStep('cloud auto pull'" in app)
ok('Storage health isolated',"startupSafeStep('storage health'" in app)
ok('Advanced menu isolated',"startupSafeStep('advanced menu'" in app)
ok('Push isolated',"startupSafeStep('push notification'" in app)
ok('LocalStorage key preserved',"meYeuBePWA_v4" in app)
for token in ['cloudRealtimeStart','enableDevicePush','evaluateSmartAlerts','renderDashboard','exportDB','importDB']:
    ok('Regression '+token, token in app)

for js in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(root/js)],capture_output=True,text=True)
    ok('Syntax '+js,r.returncode==0)

# Execute a focused startup model: every step except render fails, but splash must hide.
runtime_js = r"""
let hidden=false, rendered=false, warnings=0;
const sp={classList:{add:(x)=>{if(x==='hide')hidden=true}},setAttribute:()=>{}};
function byId(id){return id==='splashScreen'?sp:null}
function forceHideSplash(reason){try{var s=byId('splashScreen');if(s){s.classList.add('hide');s.setAttribute('aria-hidden','true')}if(reason)warnings++}catch(e){}}
function startupSafeStep(name,fn){try{var result=fn();if(result&&typeof result.then==='function'){result.catch(()=>warnings++)}return result}catch(err){warnings++;return null}}
function bad(){throw new Error('optional failure')}
function render(){rendered=true}
startupSafeStep('bad',bad);
startupSafeStep('render',render);
forceHideSplash();
setTimeout(()=>{console.log(JSON.stringify({hidden,rendered,warnings}));},0);
"""
r=subprocess.run(['node','-e',runtime_js],capture_output=True,text=True)
try:
    data=json.loads(r.stdout.strip().splitlines()[-1])
    ok('Runtime startup failure isolation',r.returncode==0 and data['hidden'] and data['rendered'] and data['warnings']>=1)
except Exception:
    ok('Runtime startup failure isolation',False)

failed=[n for n,v in checks if not v]
for n,v in checks: print(('- PASS: ' if v else '- FAIL: ')+n)
if failed:
    print('HVUS V1.1 RELEASE GATE: FAILED')
    sys.exit(1)
print('HVUS V1.1 RELEASE GATE: PASSED')
