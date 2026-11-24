/* V17.22.63: transient realtime settings write guard must wait; real family changes must fail. */
const assert=require('node:assert/strict');
const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync('relational-v1577.js','utf8');
const begin=source.indexOf('  function settingsWriteGateOpen(){');
const end=source.indexOf('  window.mybSettingsBridge={',begin);
assert(begin>0&&end>begin);
const code=source.slice(begin,end);
(async()=>{
 let calls=0,waits=0;
 const context={startup:{ready:true},serverReady:true,activeTarget:'family-a',enabled:()=>true,target:()=> 'family-a',
   booting:false,stabilizing:false,configChanging:false,categoryBusy:false,flushing:false,realtimeRefreshing:true,realtimeChecking:false,
   mybCatalogBridge:{begin:()=>{calls++;return Promise.resolve('bridge-handle')}},
   setTimeout(fn){waits++;context.realtimeRefreshing=false;Promise.resolve().then(fn)},Date,Promise,Error};
 vm.createContext(context);
 vm.runInContext(code,context);
 assert.equal(await context.beginSettings(),'bridge-handle');
 assert.equal(calls,1);assert.equal(waits,1);
 console.log('PASS settings write waits for transient realtime refresh and then begins safely');
 context.configChanging=true;
 await assert.rejects(context.beginSettings(),/Kết nối gia đình đã thay đổi/);
 assert.equal(calls,1);
 console.log('PASS family config switch still blocks write without stale target');
 context.configChanging=false;context.activeTarget='old-family';
 await assert.rejects(context.beginSettings(),/Kết nối gia đình đã thay đổi/);
 console.log('PASS changed Cloud destination cannot bypass save guard');
})().catch(e=>{console.error(e);process.exitCode=1});
