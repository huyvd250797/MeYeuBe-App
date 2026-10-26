const fs=require('fs'),assert=require('assert/strict');const {JSDOM,VirtualConsole}=require('jsdom');const {IDBFactory}=require('fake-indexeddb');const {fixture,pump,feed}=require('./care-sql.cjs');
(async()=>{const fixtureDay=new Date().toISOString().slice(0,10),previousDay=new Date(Date.now()-86400000).toISOString().slice(0,10),bagCode=fixtureDay.slice(8,10)+fixtureDay.slice(5,7)+fixtureDay.slice(2,4)+'-1030';const db=await fixture();let pass=0,calls=[],mode='',release=null,gate=null,errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('Not implemented'))errors.push(e.message)});
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://app.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.indexedDB=new IDBFactory();w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.alert=()=>{};w.confirm=()=>true;w.prompt=()=> 'Cancel test';
w.navigator.serviceWorker={register:()=>new Promise(()=>{}),ready:new Promise(()=>{}),addEventListener(){}};
w.localStorage.setItem('meYeuBeCloudSync_v1',JSON.stringify({enabled:true,url:'https://mock.test',anonKey:'fake',syncId:'main',cloudDbMode:false}));
w.fetch=async(url,opts={})=>{
 if(!String(url).includes('/rpc/'))return {ok:true,json:async()=>({build:'15.5.0'}),text:async()=> '{}'};
 const name=String(url).split('/').pop(),args=JSON.parse(opts.body||'{}');calls.push({name,args});
 if(name==='myb_care_write_v1540'&&mode==='network')throw new TypeError('network');
 if(name==='myb_care_write_v1540'&&gate)await gate;
 if(mode==='missing'&&name.includes('v1540'))return {ok:false,status:404,json:async()=>({code:'PGRST202'}),text:async()=> '{}'};
 const keys={myb_app_shell_v1540:['p_sync_id'],myb_relational_export_state_v1576:['p_sync_id'],myb_care_list_v1540:['p_sync_id','p_query'],myb_care_write_v1540:['p_sync_id','p_device_key','p_op_id','p_command'],myb_care_operation_v1540:['p_sync_id','p_op_id']}[name];
 if(!keys)return {ok:true,status:200,json:async()=>({ok:true,items:[]}),text:async()=> '{"ok":true,"items":[]}'};
 const vals=keys.map(k=>typeof args[k]==='object'&&args[k]!==null?JSON.stringify(args[k]):args[k]);const r=(await db.query('select '+name+'('+keys.map((_,i)=>'$'+(i+1)).join(',')+') r',vals)).rows[0].r;
 if(name==='myb_care_write_v1540'&&mode==='lost')throw new TypeError('lost acknowledgement');
 return {ok:true,status:200,json:async()=>r,text:async()=>JSON.stringify(r)};
};
function ok(n,v){assert.ok(v,n);pass++;console.log('PASS '+n)}
function formPump(amount=150){w.openCareFormModal('pump');w.byId('cDate').value=fixtureDay;w.byId('cEndDate').value=fixtureDay;w.byId('cTimeFrom').value='10:30';w.mcPickPumpContainer('t1');w.byId('cAmount').value=String(amount);w.byId('cExpireDate').value='2099-10-26T10:00';w.byId('cStorage').value='Ngăn mát'}
try{
 for(const p of ['boot.js','src/ui/runtime.js','src/ui/components/health-modal.js','src/ui/components/appointment-form.js','src/ui/overlays.js','src/ui/components/loading.js','src/ui/components/dashboard.js','src/ui/components/care-timeline.js','src/ui/components/milk-inventory.js','src/ui/components/record-list.js','src/ui/components/care-form.js','src/ui/components/milk-picker.js','src/ui/render-coordinator.js','app.js','relational-v1577.js','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js','src/data/care-repository.js','src/features/care/service.js','src/features/care/ui.js','src/features/care/milk-selection-service.js','src/features/care/milk-selection.js'])w.eval(fs.readFileSync(p,'utf8'));
 await new Promise(r=>setTimeout(r,2300));ok('Full startup shell and repositories load',w.load().milkContainers.length===3);ok('Bootstrap avoids old whole-state export',calls.every(c=>c.name!=='myb_relational_export_state_v1576'));calls=[];
 formPump();let result=await w.saveCareEvent();ok('Actual pump form persists after ACK',result===true&&w.load().careEvents.length===1);let row=w.load().careEvents[0],bag=w.load().milkInventory[0];ok('Pump form receives authoritative balance',bag.remaining===150&&bag.pumpEventId===row.id);ok('Bag uses pump time code',bag.containerName===bagCode);
 w.openCareFormModal('feed');w.byId('cDate').value=fixtureDay;w.byId('cEndDate').value=fixtureDay;w.byId('cTimeFrom').value='11:00';w.byId('cFeedSource').value='stored';w.toggleFeedSourceFields();w.byId('cAmount').value='50';w.abOnAmountInput();w.byId('cFeedWasteMl').value='10';result=await w.saveCareEvent();ok('Actual stored feed form saves',result===true);ok('Stored form deducts taken amount',w.load().milkInventory[0].remaining===100);
 let f=w.load().careEvents.find(x=>x.type==='feed');ok('Form records actual versus waste',f.amount===40&&f.extra.takenMl===50);
 // Fill captures the record ID before the list is reordered.
 w.openCareFormModal('feed',w.load().careEvents.findIndex(x=>x.id===f.id));w.byId('cFeedSource').value='direct';w.toggleFeedSourceFields();w.byId('cAmount').value='20';
 const h=await w.mybCareBridge.begin();w.mybCareBridge.accept({eventId:'unrelated',event:{id:'unrelated',type:'diaper',date:fixtureDay,amount:1},milkItems:[],deletedMilkIds:[]},h,h);w.mybCareBridge.end(h);
 result=await w.saveCareEvent();ok('Reordered list edit targets captured stable ID',result===true&&w.load().careEvents.find(x=>x.id===f.id).source==='direct');ok('Stored to direct form returns milk',w.load().milkInventory[0].remaining===150);
 formPump(80);w.byId('cNote').value='Keep draft';mode='network';result=await w.saveCareEvent();mode='';ok('Network failure preserves actual form',result===false&&w.byId('cNote').value==='Keep draft');ok('Unknown request persists operation ID',!!w.mybCareRepository.pending());
 const pendingId=w.mybCareRepository.pending().id;result=await w.saveCareEvent();ok('Explicit retry verifies and reuses operation ID',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540'&&c.args.p_op_id===pendingId).length===2);ok('Acknowledgement clears pending command',!w.mybCareRepository.pending());
 formPump(90);mode='lost';result=await w.saveCareEvent();mode='';const count=w.load().careEvents.length;ok('Lost ACK does not announce success',result===false);let writeCount=calls.filter(c=>c.name==='myb_care_write_v1540').length;result=await w.saveCareEvent();ok('Lost ACK resolved by read without another mutation',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writeCount);ok('Lost ACK creates exactly one local row',w.load().careEvents.length===count+1);
 formPump(60);gate=new Promise(r=>release=r);const p=w.saveCareEvent();await new Promise(r=>setTimeout(r,30));ok('UI save stays busy until database response',w.mybCareUi.isBusy());ok('Form fields disabled until acknowledgement',w.byId('cAmount').disabled);w.closeCareFormModal(false);ok('Cannot close form during save',w.__careFormModalOpen===true);const before=calls.length;await w.saveCareEvent();ok('Double click sends no second command',calls.length===before);
 w.byId('cloudEnabled').value='1';w.byId('cloudSyncId').value='other';await w.saveCloudConfig();ok('Config cannot switch during care transaction',w.loadCloudConfig().syncId==='main');release();await p;gate=null;
 let last=w.load().careEvents[0];result=await w.udUndo();ok('UI Undo calls business operation',result===true&&!w.load().careEvents.some(x=>x.id===last.id));ok('Undo retains unrelated records',w.load().careEvents.some(x=>x.id===f.id));
 const sourceIndex=w.load().milkInventory.findIndex(x=>x.id===bag.id);
 w.tfOpen(sourceIndex);w.tfPickTarget('b2');w.byId('tfAmount').value='30';result=await w.tfConfirm();ok('Actual transfer popup saves transaction',result===true);let tx=w.load().careEvents.find(x=>x.type==='transfer');let target=w.load().milkInventory.find(x=>x.id===tx.extra.toBagId);ok('Transfer popup deducts and creates exact stock',target.remaining===30&&w.load().milkInventory.find(x=>x.id===bag.id).remaining===120);ok('Transfer bag retains original pump time',target.originDate===fixtureDay&&target.originTimeFrom==='10:30');
 result=await w.deleteCareEvent(w.load().careEvents.findIndex(x=>x.id===tx.id));ok('Transfer deletion restores source in actual UI',result===true&&w.load().milkInventory.find(x=>x.id===bag.id).remaining===150);
 let cancelIndex=w.load().milkInventory.findIndex(x=>x.id===bag.id);result=await w.cancelMilkBag(cancelIndex);ok('Cancel inventory uses ledger command',result===true&&w.load().milkInventory.find(x=>x.id===bag.id).remaining===0);result=await w.udUndo();ok('Cancel Undo restores inventory',result===true&&w.load().milkInventory.find(x=>x.id===bag.id).remaining===150);
 w.startCareTimer('feed');w.openFeedDonePopup();result=await w.saveFeedDonePopup();ok('Timer done awaits direct-care command',result===true&&w.loadCareTimer()===null);
 w.openCareFormModal('sleep');w.byId('cDate').value=previousDay;w.byId('cEndDate').value=fixtureDay;w.byId('cTimeFrom').value='23:00';w.byId('cTimeTo').value='01:00';result=await w.saveCareEvent();ok('Sleep form persists overnight duration',result===true&&w.load().careEvents.find(x=>x.type==='sleep').amount===120);
 const stale=w.load();stale.milkInventory[0].remaining=999;assert.throws(()=>w.save(stale),/quản lý riêng/);ok('Generic snapshots cannot modify stock',true);
 const balances=JSON.stringify(w.load().milkInventory);w.activeMilkBags(w.load());ok('Displaying stock does not reconstruct ledger',JSON.stringify(w.load().milkInventory)===balances);
 let page=await w.mybCareRepository.query({kind:'care',from:fixtureDay,to:fixtureDay,type:'pump',limit:1});ok('Scoped read filters and bounds care',page.items.length===1&&page.items[0].type==='pump');
 // No old mutation RPC may be used by new forms, transfer, timer or Undo.
 ok('New care UI never uses legacy write RPC',calls.every(c=>c.name!=='myb_relational_apply_changes_v1576'));
 mode='missing';await assert.rejects(w.mybCareRepository.query({kind:'milk'}),/migration/);mode='';ok('Missing migration is explicit',true);
 ok('No uncaught full-runtime errors',errors.length===0);console.log('RESULT '+pass+' PASS / 0 FAIL');
}finally{w.close();await db.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
