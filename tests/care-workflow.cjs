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
 if(name==='myb_care_write_v1540'&&mode==='500')return {ok:false,status:502,json:async()=>({message:'proxy error'})};
 if(name==='myb_care_write_v1540'&&mode==='malformed')return {ok:true,status:200,json:async()=>{throw new SyntaxError('invalid JSON')}};
 if(name==='myb_care_write_v1540'&&mode==='lost')throw new TypeError('lost acknowledgement');
 return {ok:true,status:200,json:async()=>r,text:async()=>JSON.stringify(r)};
};
function ok(n,v){assert.ok(v,n);pass++;console.log('PASS '+n)}
function formPump(amount=150){w.openCareFormModal('pump');w.byId('cDate').value=fixtureDay;w.byId('cEndDate').value=fixtureDay;w.byId('cTimeFrom').value='10:30';w.mcPickPumpContainer('t1');w.byId('cAmount').value=String(amount);w.byId('cExpireDate').value='2099-10-26T10:00';w.byId('cStorage').value='Ngăn mát'}
try{
 const runtimePaths=['boot.js','src/ui/runtime.js','src/ui/components/health-modal.js','src/ui/components/appointment-form.js','src/ui/overlays.js','src/ui/components/loading.js','src/ui/components/dashboard.js','src/ui/components/care-timeline.js','src/ui/components/milk-inventory.js','src/ui/components/record-list.js','src/ui/components/care-form.js','src/ui/components/milk-picker.js','src/ui/render-coordinator.js','app.js','relational-v1577.js','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js','src/data/care-repository.js','src/features/care/service.js','src/features/care/ui.js','src/features/care/milk-selection-service.js','src/features/care/milk-selection.js','src/features/care/workflow.js'];for(const p of runtimePaths)w.eval(fs.readFileSync(p,'utf8'));
 assert.equal(await w.mybRelationalRealtimeV1577.start(),true);await new Promise(r=>setTimeout(r,50));
 const input=(id,value)=>{w.byId(id).value=value;w.byId(id).dispatchEvent(new w.Event('input',{bubbles:true}))};
 const careCount=async()=>Number((await db.query('select count(*) n from care_events where deleted_at is null')).rows[0].n);
 const draftKeys=()=>Object.keys(w.localStorage).filter(k=>k.startsWith('mybCareDraft_v1700:'));
 const stored=()=>{w.openCareFormModal('feed');w.byId('cFeedSource').value='stored';w.toggleFeedSourceFields()};
 // Previously persisted drafts are inert; no resume prompt, reads or writes.
 w.localStorage.setItem('mybCareDraft_v1700:old','old draft bytes');
 formPump(200);input('cNote','Nội dung mới');w.dispatchEvent(new w.Event('pagehide'));
 ok('Input and pagehide create no local draft',draftKeys().length===1&&w.localStorage.getItem('mybCareDraft_v1700:old')==='old draft bytes');
 ok('No resume or discard UI or draft store module',!w.mybCareDraftStore&&!w.byId('careDraftNotice')&&!w.byId('careDraftIndex'));
 w.closeCareFormModal();ok('Close discards input immediately',!w.__careFormModalOpen&&w.byId('cNote').value==='');
 formPump(200);ok('Reopening never restores a previous note or candidate',w.byId('cNote').value===''&&!w.mybCareWorkflow.state().candidate);
 let result=await w.saveCareEvent();ok('Pump saves without draft prompt',result===true&&await careCount()===1);
 let pumpRow=w.load().careEvents.find(e=>e.type==='pump'),bag=w.load().milkInventory.find(b=>b.pumpEventId===pumpRow.id);
 ok('Pump creates authoritative inventory',bag.remaining===200);
 formPump(44);input('cNote','Bỏ khi hủy');w.resetCareForm();ok('Reset has no draft confirmation',w.byId('cNote').value==='');w.closeCareFormModal();
 // Stored feed validation remains authoritative.
 stored();input('cAmount','130');w.abOnAmountInput();input('cFeedWasteMl','140');let writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;
 ok('Excess waste blocked before mutation',await w.saveCareEvent()===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 input('cFeedWasteMl','10');result=await w.saveCareEvent();ok('Stored feed deducts exact taken amount',result===true&&w.load().milkInventory.find(b=>b.id===bag.id).remaining===70);
 const feedRow=w.load().careEvents.find(e=>e.type==='feed');ok('Actual taken and waste remain distinct',feedRow.amount===120&&feedRow.extra.takenMl===130&&feedRow.wasteMl===10);
 ok('Undo restores exact milk balance',await w.udUndo()===true&&w.load().milkInventory.find(b=>b.id===bag.id).remaining===200);
 // Pending commands are operations already submitted, not draft forms.
 formPump(80);input('cNote','ACK chưa về');mode='lost';result=await w.saveCareEvent();mode='';const pending=w.mybCareRepository.pending();
 ok('Lost ACK keeps open form and submitted operation without draft storage',result===false&&!!pending&&w.byId('cNote').value==='ACK chưa về'&&draftKeys().length===1);
 writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;ok('Repeated Save cannot resend uncertain command',await w.saveCareEvent()===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 result=await w.mybCareWorkflow.verifyPending();ok('Read-only verification accepts committed result without another write',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes&&!w.mybCareRepository.pending());
 formPump(65);input('cNote','Gửi lần đầu');mode='network';await w.saveCareEvent();mode='';const retryOp=w.mybCareRepository.pending().id;
 ok('Retry requires a not-found check',await w.mybCareWorkflow.retryPending()===false);await w.mybCareWorkflow.verifyPending();input('cNote','Sửa sau timeout');result=await w.mybCareWorkflow.retryPending();
 ok('Retry uses same operation ID',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').at(-1).args.p_op_id===retryOp);
 ok('Post-timeout edits stay in current form as update',w.__careFormModalOpen&&w.byId('cNote').value==='Sửa sau timeout'&&!!w.mybCareUi.editing());let count=await careCount();result=await w.saveCareEvent();ok('Edited current form updates same event without duplicate',result===true&&await careCount()===count&&w.load().careEvents.some(e=>e.note==='Sửa sau timeout'));
 // Closing an unknown-result form still leaves its exact outbox command to verify.
 formPump(31);mode='lost';await w.saveCareEvent();mode='';w.closeCareFormModal();ok('Close clears fields but retains pending command',!w.__careFormModalOpen&&w.byId('cNote').value===''&&!!w.mybCareRepository.pending());writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;ok('Closed form operation can still be verified without resend',await w.mybCareWorkflow.verifyPending()===true&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 for(const m of ['500','malformed']){formPump(30);mode=m;result=await w.saveCareEvent();mode='';ok(m+' keeps exact pending operation',result===false&&!!w.mybCareRepository.pending());ok(m+' resolves by verification',await w.mybCareWorkflow.verifyPending()===true)}
 // Feed timer and stock continue to use stable business IDs.
 w.openCareFormModal('feed');w.startCareTimer();const timer=w.loadCareTimer();ok('Start feed timer sets stable event identity',timer&&timer.operationEventId&&w.mybCareUi.session().newId===timer.operationEventId);
 w.renderCareTimerState();ok('Timer shows full clock and both controls',w.document.querySelector('.careTimerLiveClock')&&w.document.querySelectorAll('.careTimerFeedCompact button').length===2);
 w.stopCareTimer();ok('Stop fills end time and retains current form for Save',!w.loadCareTimer()&&!!w.byId('cTimeTo').value&&w.__careFormModalOpen);w.startCareTimer();w.openFeedDonePopup();ok('Dashboard timer completion opens end-time form',w.byId('feedDoneOverlay').classList.contains('show'));ok('Timer completion saves with no duplicate or draft prompt',await w.saveFeedDonePopup()===true&&!w.loadCareTimer());w.closeCareFormModal();
 // Save lock prevents closing or second writes in flight.
 formPump(45);gate=new Promise(r=>release=r);let saving=w.saveCareEvent();await new Promise(r=>setTimeout(r,30));w.closeCareFormModal();writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;await w.saveCareEvent();ok('Busy save blocks close and repeat',w.__careFormModalOpen&&w.byId('cAmount').disabled&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);release();await saving;gate=null;
 // Stale open form OCC is still enforced without any draft restoration.
 const index=w.load().careEvents.findIndex(x=>x.id===pumpRow.id);w.openCareFormModal('pump',index);const old=w.mybCareUi.editing();const external=await require('./care-sql.cjs').write(db,{op:'save',event:{...old,note:'Thiết bị khác'},expected:{updatedAt:old.updatedAt,version:old.version}});assert.ok(external.ok);const h=await w.mybCareBridge.begin();w.mybCareBridge.accept(external,h,h);w.mybCareBridge.end(h);input('cNote','Nội dung form');writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;ok('Stale form cannot overwrite newer event',await w.saveCareEvent()===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes&&w.byId('cNote').value==='Nội dung form');w.closeCareFormModal();
 const css=fs.readFileSync('src/styles/care-workflow.css','utf8');ok('Timer layout has natural height and two rows with 44px controls',css.includes('grid-template-rows:auto auto!important')&&css.includes('min-height:44px!important')&&css.includes('overflow:visible!important'));
 ok('Workflow never uses legacy mutation RPC',calls.every(c=>c.name!=='myb_relational_apply_changes_v1576'));ok('No uncaught full runtime errors',errors.length===0);console.log('RESULT '+pass+' PASS / 0 FAIL');
}finally{w.close();await db.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
