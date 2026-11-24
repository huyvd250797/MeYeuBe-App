/* V17.22.63 — no startup/realtime settings-read errors or false Cloud write toasts. */
const assert=require('node:assert/strict');
const fs=require('fs');
const vm=require('vm');
const core=require('../src/features/notifications/medication-core.js');
const src=fs.readFileSync('src/features/notifications/medication-ui.js','utf8');
const relational=fs.readFileSync('relational-v1577.js','utf8');
const scoped=fs.readFileSync('src/features/scoped/ui.js','utf8');
assert(relational.includes('function canRefreshSettings()'));
assert(relational.includes('function beginSettings()'));
assert(relational.includes('begin:beginSettings'));
assert(relational.includes('settingsWriteGateOpen'));
assert(scoped.includes('syncSettingsBaseline:function()'));
assert(src.includes('if(!canRefreshSettings())throw deferredReadError()'));
assert(src.includes('!w.mybStartupGate.ready)return'));
assert(src.includes("w.addEventListener('myb:dashboard-ready'"));
assert(!src.includes('w.setTimeout(function(){tick();maybeRefreshGlobal(true)},350)'));

const events={};let ready=false,realtimeBusy=false,serverReads=0,bridgeBegins=0,bridgeEnds=0,syncs=0,toasts=[];
const items={};
function node(id){if(!items[id])items[id]={id,hidden:false,disabled:false,checked:false,value:'',textContent:'',innerHTML:'',
 classList:{contains:()=>false,toggle:()=>{},add:()=>{},remove:()=>{}},addEventListener:()=>{},reset:()=>{},querySelector:()=>null};return items[id]}
const doc={readyState:'loading',visibilityState:'visible',body:{classList:{contains:()=>false}},getElementById:node,
 querySelector:()=>null,addEventListener:(type,cb)=>{(events['d:'+type]||=[]).push(cb)}};
let state={settings:{medicationReminders:{enabled:true,items:[]}},careEvents:[]};
const store={};let intervals=[];
const ctx={window:null,document:doc,mybMedicationCore:core,mybStartupGate:{ready:false},
 load:()=>state,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}},
 setInterval:(f)=>{intervals.push(f);return intervals.length},setTimeout:()=>0,
 showToast:(...args)=>{toasts.push(args)},showPage:()=>Promise.resolve(),
 mybDataClient:{request:async()=>{serverReads++;return {data:{settings:{medicationReminders:{enabled:true,items:[]}},expected:{profile:1,other:1}},target:'target'}}},
 mybSettingsBridge:{canRefresh:()=>ready&&!realtimeBusy,begin:async()=>{bridgeBegins++;if(!ready||realtimeBusy)throw Error('write guard blocked');return 'handle'},end:()=>{bridgeEnds++},accept:(r,t,h)=>{state.settings=r.settings}},
 mybSettingsRepository:{pending:()=>null,acceptState:()=>{},save:async()=>({operationId:'test'})},
 mybScopedUi:{syncSettingsBaseline:()=>{syncs++}},
 mybUI:{overlays:{count:()=>0}},
 loadCloudConfig:()=>({url:'https://example.test',syncId:'a'}),
 crypto:{randomUUID:()=> 'uuid'},navigator:{onLine:true},
 addEventListener:(type,cb)=>{(events['w:'+type]||=[]).push(cb)},
 console,Date,Math,JSON,Promise,Number,Object,String,Array,Set,Map,Error};
ctx.window=ctx;
vm.runInNewContext(src,ctx,{filename:'medication-ui.js'});
(async()=>{
 for(const cb of events['d:DOMContentLoaded']||[])cb();
 ctx.mybMedicationReminders.tick();
 assert.equal(await ctx.mybMedicationReminders.refresh(false),false);
 assert.equal(serverReads,0);assert.equal(bridgeBegins,0);assert.equal(toasts.length,0);
 console.log('PASS Splash Loading never starts a medication settings write guard');
 ctx.mybStartupGate.ready=true;ready=true;realtimeBusy=true;
 ctx.mybMedicationReminders.tick();
 assert.equal(await ctx.mybMedicationReminders.refresh(false),false);
 assert.equal(serverReads,0);assert.equal(bridgeBegins,0);assert.equal(toasts.length,0);
 console.log('PASS Realtime busy is silently deferred without double toast');
 realtimeBusy=false;
 assert.equal(await ctx.mybMedicationReminders.refresh(false),true);
 assert.equal(serverReads,1);assert.equal(bridgeBegins,1);assert.equal(bridgeEnds,1);
 assert.equal(syncs,1);assert.equal(toasts.length,0);
 console.log('PASS Ready idle app accepts fresh settings and keeps form baseline consistent');
 console.log('PASS V17.22.63 medication Cloud startup & transient sync guard regression');
})().catch(e=>{console.error(e);process.exitCode=1});
