from pathlib import Path
import re, sys, subprocess, tempfile, textwrap, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
errors=[]
passes=[]

def check(cond,label):
    (passes if cond else errors).append(label)

check((root/'AC_V10.7.1.md').exists(),'AC V10.7.1 exists')
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    check('10.7.1' in (root/f).read_text(encoding='utf-8'),'Version consistency: '+f)
check(idx.count('src="./app.js')==1,'Single business JavaScript source')
check('function openSmartAlertCareForm(type)' in app,'Alert care navigation helper exists')
check("'Ghi nhận bú','openSmartAlertCareForm(\"feed\")'" in app,'Feed alert opens feed form')
check("'Ghi nhận thân nhiệt','openSmartAlertCareForm(\"temperature\")'" in app,'Temperature alert opens temperature form')
check("candidates=[item.amount,item.temperature,item.value,item.extra&&item.extra.temperature]" in app,'Temperature supports current and legacy fields')
check("icon:'💚'" in app,'OK icon')
check("?'🆘':'⚠️'" in app,'Critical and warning summary icons')
check('cloudRealtimeStart' in app,'Realtime retained')
check('pushLocalToCloud' in app and 'pullCloudToLocal' in app,'Manual Cloud Sync retained')
check("var KEY='meYeuBePWA_v4'" in app or "KEY='meYeuBePWA_v4'" in app,'LocalStorage key preserved')
for token in ['renderDashboard','renderCareTimeline','renderCareStats','renderMilkInventory','handleBabyAvatarUpload','exportDB','importDB','testCloudConnection']:
    check(token in app,'Regression module: '+token)

# Extract and run actual Smart Alert engine functions in Node with controlled stubs.
start=app.find('function openSmartAlertCareForm(type)')
end=app.find('function renderDashboard(db)',start)
check(start>=0 and end>start,'Rule engine source extractable')
if start>=0 and end>start:
    chunk=app[start:end]
    node = r"""
const assert=require('assert');
let selected=null, shown=null, closed=false, reset=false;
global.window={scrollTo:()=>{}};
global.document={body:{classList:{add:()=>{},remove:()=>{}}}};
global.closeSmartAlertCenter=()=>{closed=true};
global.resetCareForm=()=>{reset=true};
global.selectCareType=(x)=>{selected=x};
global.showPage=(x)=>{shown=x};
global.setTimeout=(fn)=>fn();
global.byId=(id)=> id==='careFormTitle'?{textContent:''}:null;
global.careTypeMeta=(x)=>({label:x==='feed'?'Bé bú':x==='temperature'?'Thân nhiệt':x});
global.load=()=>({});
global.today=()=> '2026-07-11';
global.getDashboardConfig=(db)=>db.settings.dashboardConfig;
global.smartNum=(n,d)=>Number(n).toFixed(d).replace(/\.0$/,'');
global.fmtMinutes=(m)=>m+' phút';
global.latestCareEventByType=(db,type)=>(db.careEvents||[]).filter(x=>x.type===type).sort((a,b)=>(b.timeFrom||'').localeCompare(a.timeFrom||''))[0]||null;
global.addMinutesToDateTime=(date,time,min)=>{
  const d=new Date(date+'T'+time+':00'); d.setMinutes(d.getMinutes()+min);
  return {date:d.toISOString().slice(0,10),time:d.toTimeString().slice(0,5)};
};
global.milkExpireAt=(b)=>b.expireMs;
global.upcomingAppointment=(db)=>(db.appointments||[])[0]||null;
global.timeRangeOf=(a)=>a.time||'';
global.typeLabel=()=> 'Lịch khám';
global.fmtDate=(d)=>d;
global.openCareStatsFromDashboard=()=>{};
global.editLatestActiveSleepFromDashboard=()=>{};
global.openScheduleFromDashboard=()=>{};
global.esc=(x)=>String(x);
global.Date.now=()=>new Date('2026-07-11T10:00:00').getTime();
""" + chunk + r"""
function cfg(overrides={}){
 const base=defaultSmartAlertConfig();
 Object.keys(base.rules).forEach(k=>base.rules[k].enabled=false);
 Object.entries(overrides).forEach(([k,v])=>base.rules[k]=Object.assign({},base.rules[k],v,{enabled:true}));
 return {settings:{dashboardConfig:{nextFeedHours:2,smartAlerts:base}},careEvents:[],milkInventory:[],appointments:[]};
}
// Navigation
openSmartAlertCareForm('feed');
assert.equal(selected,'feed'); assert.equal(shown,'careAdd'); assert(reset);

// Temperature current field amount
let db=cfg({temperatureHigh:{severity:'critical',threshold:37.9}});
db.careEvents=[{type:'temperature',amount:38,startDate:'2026-07-11',timeFrom:'09:00'}];
let a=evaluateSmartAlerts(db); assert.equal(a.length,1); assert.equal(a[0].ruleId,'temperatureHigh'); assert(a[0].action.includes('temperature'));
db.careEvents[0].amount=37.8; assert.equal(evaluateSmartAlerts(db).length,0);

// Temperature legacy fields
for (const rec of [
 {type:'temperature',temperature:38,startDate:'2026-07-11',timeFrom:'09:00'},
 {type:'temperature',value:38,startDate:'2026-07-11',timeFrom:'09:00'},
 {type:'temperature',extra:{temperature:38},startDate:'2026-07-11',timeFrom:'09:00'}
]) { db.careEvents=[rec]; assert.equal(evaluateSmartAlerts(db).length,1); }

// Feed overdue and correct action
db=cfg({feedOverdue:{severity:'warning',graceMinutes:15}});
db.careEvents=[{type:'feed',startDate:'2026-07-11',timeFrom:'07:00'}];
a=evaluateSmartAlerts(db); assert.equal(a[0].ruleId,'feedOverdue'); assert(a[0].action.includes('openSmartAlertCareForm("feed")'));

// Sleep active
db=cfg({sleepTooLong:{severity:'warning',maxHours:2}});
db.careEvents=[{type:'sleep',startDate:'2026-07-11',timeFrom:'07:00',timeTo:''}];
assert.equal(evaluateSmartAlerts(db)[0].ruleId,'sleepTooLong');

// Milk expired
db=cfg({milkExpired:{severity:'critical'}});
db.milkInventory=[{status:'Đang bảo quản',remaining:100,expireMs:Date.now()-1}];
assert.equal(evaluateSmartAlerts(db)[0].ruleId,'milkExpired');

// Milk expiring
db=cfg({milkExpiring:{severity:'warning',beforeHours:24}});
db.milkInventory=[{status:'Đang bảo quản',remaining:100,expireMs:Date.now()+3600000}];
assert.equal(evaluateSmartAlerts(db)[0].ruleId,'milkExpiring');

// Appointment
db=cfg({appointmentSoon:{severity:'info',beforeHours:24}});
db.appointments=[{date:'2026-07-11',time:'11:00',title:'Khám bé'}];
assert.equal(evaluateSmartAlerts(db)[0].ruleId,'appointmentSoon');

// Severity ordering + icons
let summary=smartAlertSummary([]);
assert.equal(summary.icon,'💚');
summary=smartAlertSummary([{severity:'warning',rank:2,title:'x'}]); assert.equal(summary.icon,'⚠️');
summary=smartAlertSummary([{severity:'critical',rank:3,title:'x'}]); assert.equal(summary.icon,'🆘');
console.log('DYNAMIC SMART ALERT TESTS PASSED');
"""
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as f:
        f.write(node); tmp=f.name
    result=subprocess.run(['node',tmp],capture_output=True,text=True)
    check(result.returncode==0,'Dynamic Smart Alert rules and navigation')
    if result.returncode!=0:
        errors.append('Node detail: '+result.stderr.strip())

# Syntax
syntax=subprocess.run(['node','--check',str(root/'app.js')],capture_output=True,text=True)
check(syntax.returncode==0,'JavaScript syntax')

if errors:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    for x in passes: print('- PASS: '+x)
    for x in errors: print('- FAIL: '+x)
    sys.exit(1)
print('HVUS V1.0 RELEASE GATE: PASSED')
for x in passes: print('- PASS: '+x)
