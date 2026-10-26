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
 const runtimePaths=['boot.js','src/ui/runtime.js','src/ui/components/health-modal.js','src/ui/components/appointment-form.js','src/ui/overlays.js','src/ui/components/loading.js','src/ui/components/dashboard.js','src/ui/components/care-timeline.js','src/ui/components/milk-inventory.js','src/ui/components/record-list.js','src/ui/components/care-form.js','src/ui/components/milk-picker.js','src/ui/render-coordinator.js','app.js','relational-v1577.js','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js','src/data/care-repository.js','src/features/care/service.js','src/features/care/ui.js','src/features/care/milk-selection-service.js','src/features/care/milk-selection.js','src/features/care/drafts.js','src/features/care/workflow.js'];for(const p of runtimePaths)w.eval(fs.readFileSync(p,'utf8'));
 assert.equal(await w.mybRelationalRealtimeV1577.start(),true);await new Promise(r=>setTimeout(r,50));
 const input=(id,value)=>{w.byId(id).value=value;w.byId(id).dispatchEvent(new w.Event('input',{bubbles:true}))};
 const draftCount=()=>w.mybCareDraftStore.list(w.mybDataClient.target(w.loadCloudConfig())).length;
 const stored=()=>{w.openCareFormModal('feed');if(w.mybCareWorkflow.state().candidate)w.mybCareWorkflow.discard();w.byId('cFeedSource').value='stored';w.toggleFeedSourceFields()};
 const careCount=async()=>Number((await db.query('select count(*) n from care_events where deleted_at is null')).rows[0].n);
 ok('No draft on untouched form',draftCount()===0);
 formPump(200);input('cNote','Nháp hút sữa tiếng Việt');w.mybCareWorkflow.stash();
 ok('Dirty form stored locally by destination/type',draftCount()===1&&w.mybCareWorkflow.state().key==='new:pump');
 w.closeCareFormModal();ok('Close preserves persisted draft',!w.__careFormModalOpen&&draftCount()===1);
 formPump(88);ok('Reopen offers explicit choice',!!w.mybCareWorkflow.state().candidate&&w.byId('careDraftNotice').textContent.includes('Tiếp tục'));
 ok('Cannot save over unresolved draft',await w.saveCareEvent()===false);
 w.mybCareWorkflow.resume();ok('Resume restores note, amount, container and captured dates',w.byId('cNote').value==='Nháp hút sữa tiếng Việt'&&w.byId('cAmount').value==='200'&&w.byId('cContainerId').value==='t1'&&w.byId('cDate').value===fixtureDay);
 ok('Resume is not a business write',await careCount()===0);
 let result=await w.saveCareEvent();ok('Pump saves through actual workflow',result===true&&await careCount()===1);
 ok('ACK clears draft and closes modal',draftCount()===0&&!w.__careFormModalOpen&&w.byId('cNote').value==='');
 let pumpRow=w.load().careEvents.find(e=>e.type==='pump'),bag=w.load().milkInventory.find(b=>b.pumpEventId===pumpRow.id);
 ok('Pump stock exact after workflow ACK',bag.remaining===200);
 // Per-type and per-destination isolation, no login/account or template feature.
 formPump(70);input('cNote','riêng loại hút');w.closeCareFormModal();w.openCareFormModal('diaper');ok('Feed/diaper never receives pump draft',!w.mybCareWorkflow.state().candidate&&w.byId('cNote').value==='');input('cNote','nháp tã');w.closeCareFormModal();ok('Different types retain separate drafts',draftCount()===2);
 const other=w.mybCareDraftStore.list('https://different.test|other');ok('Drafts isolated from another database/family',other.length===0);
 w.openCareFormModal('pump');w.mybCareWorkflow.resume();w.mybCareWorkflow.discard();w.closeCareFormModal();w.openCareFormModal('diaper');w.mybCareWorkflow.resume();w.mybCareWorkflow.discard();w.closeCareFormModal();ok('Explicit discard clears only chosen drafts',draftCount()===0);
 // Local reload: re-evaluate the workflow/store modules while preserving browser localStorage.
 w.openCareFormModal('medicine');input('cMedicineName','Thuốc thử');input('cMedicineDose','1');input('cNote','nháp qua khởi tạo lại');w.dispatchEvent(new w.Event('pagehide'));const persisted=w.localStorage.getItem('mybCareDraft_v1700:'+encodeURIComponent(w.mybDataClient.target(w.loadCloudConfig()))+':'+encodeURIComponent('new:medicine'));
 ok('pagehide flushes draft synchronously',!!persisted&&persisted.includes('nháp qua'));
 // Reset only in-memory UI session to emulate navigating away, then retrieve from persistent storage.
 w.closeCareFormModal();w.mybCareUi.restoreSession({before:null,newId:''});w.openCareFormModal('medicine');w.mybCareWorkflow.resume();ok('Persistent draft restores dynamic medicine controls',w.byId('cMedicineName').value==='Thuốc thử'&&w.byId('cMedicineDose').value==='1');w.mybCareWorkflow.discard();w.closeCareFormModal();
 // Stored feed integrity: do not clamp invalid waste or silently save partial sources.
 stored();input('cAmount','130');w.abOnAmountInput();input('cFeedWasteMl','10');w.mybCareWorkflow.review();
 ok('Review distinguishes taken, actual and waste',w.mybCareWorkflow.model().rows[1][1]==='120 ml'&&w.byId('careReview').textContent.includes('Thừa/hủy'));
 input('cFeedWasteMl','140');let writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;ok('Waste above source total rejected before mutation',await w.saveCareEvent()===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 input('cFeedWasteMl','10');w.__milkFeedSources[0].usedMl=100;ok('Partial source allocation cannot silently change requested amount',await w.saveCareEvent()===false);
 w.__milkFeedSources[0].usedMl=130;w.abState().manual=true;w.mybCareWorkflow.stash();w.closeCareFormModal();w.openCareFormModal('feed');w.mybCareWorkflow.resume();
 ok('Stored-feed draft restores source IDs, quantity and waste without auto-reallocation',w.milkFeedSourcesState().length===1&&w.milkFeedSourcesState()[0].usedMl===130&&w.byId('cFeedWasteMl').value==='10'&&w.abState().manual);
 result=await w.saveCareEvent();ok('Multi-field stored feed saves and deducts taken amount',result===true&&w.load().milkInventory.find(b=>b.id===bag.id).remaining===70);
 const feedRow=w.load().careEvents.find(e=>e.type==='feed');ok('Authoritative actual/taken/waste match review',feedRow.amount===120&&feedRow.extra.takenMl===130&&feedRow.wasteMl===10);
 result=await w.udUndo();ok('Undo restores source exact balance',result===true&&w.load().milkInventory.find(b=>b.id===bag.id).remaining===200);
 // Native busy guard and stable pending identity with a lost commit acknowledgement.
 formPump(80);input('cNote','ACK chưa về');mode='lost';result=await w.saveCareEvent();mode='';
 const pending=w.mybCareRepository.pending(),id=pending.id;
 ok('Lost ACK persists exact operation and draft',result===false&&!!pending&&draftCount()===1);
 writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;result=await w.saveCareEvent();ok('Save while pending asks verification without resending',result===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 const writeBegin=w.mybCareBridge.begin;w.mybCareBridge.begin=()=>{throw Error('write bridge must not run during verification')};try{result=await w.mybCareWorkflow.verifyPending()}finally{w.mybCareBridge.begin=writeBegin}ok('Explicit verification uses read only and accepts committed result',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 ok('Recovery clears matching draft and pending and closes form',draftCount()===0&&!w.mybCareRepository.pending()&&!w.__careFormModalOpen);
 // Before-server network failure: checking cannot mutate, retry requires checking first.
 formPump(65);input('cNote','chưa gửi được');mode='network';await w.saveCareEvent();mode='';const retryOp=w.mybCareRepository.pending().id;
 writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;ok('Retry requires a successful not-found check',await w.mybCareWorkflow.retryPending()===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 result=await w.mybCareWorkflow.verifyPending();ok('Not found check preserves draft and pending without mutation',result===false&&w.mybCareRepository.pending().id===retryOp&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 input('cNote','thay đổi sau timeout');result=await w.mybCareWorkflow.retryPending();
 ok('Explicit retry resends original command with same operation ID',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').at(-1).args.p_op_id===retryOp&&w.load().careEvents.some(e=>e.note==='chưa gửi được'));
 ok('Post-timeout edits remain a draft of the committed event',w.__careFormModalOpen&&w.byId('cNote').value==='thay đổi sau timeout'&&w.mybCareUi.editing()&&w.mybCareWorkflow.state().key.startsWith('edit:'));
 result=await w.saveCareEvent();ok('Post-timeout edited content saves as update, not another event',result===true&&w.load().careEvents.some(e=>e.note==='thay đổi sau timeout'));
 // Server/proxy errors and malformed success bodies are uncertain, even after a commit.
 for(const m of ['500','malformed']){formPump(30);mode=m;result=await w.saveCareEvent();mode='';const pp=w.mybCareRepository.pending();ok(m+' response retains unknown outcome and exact pending operation',result===false&&!!pp);writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;result=await w.mybCareWorkflow.verifyPending();ok(m+' committed result resolved without another write',result===true&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes)}
 // Saving from a filtered page returns to that page and nested scroll, no full reload.
 w.showPage('careTimeline');w.byId('tl8Search').value='giữ bộ lọc';w.byId('careTimelineBox').scrollTop=217;let scrollCalls=[];w.scrollTo=(x,y)=>scrollCalls.push([x,y]);
 w.openCareFormModal('pump',w.load().careEvents.findIndex(e=>e.id===pumpRow.id));input('cNote','sửa nhanh');result=await w.saveCareEvent();await new Promise(r=>setTimeout(r,70));
 ok('Edit returns to original page with filters and nested scroll',result===true&&!w.byId('careTimeline').classList.contains('hidden')&&w.byId('tl8Search').value==='giữ bộ lọc'&&w.byId('careTimelineBox').scrollTop===217&&scrollCalls.length>0);
 // Stale draft after another writer changes the row: preserve captured OCC baseline.
 const i=w.load().careEvents.findIndex(e=>e.id===pumpRow.id);w.openCareFormModal('pump',i);input('cNote','nháp sửa cũ');const captured=w.mybCareUi.editing();w.closeCareFormModal();
 let external=await require('./care-sql.cjs').write(db,{op:'save',event:{...captured,note:'thiết bị khác'},expected:{updatedAt:captured.updatedAt,version:captured.version}});assert.ok(external.ok);
 const h=await w.mybCareBridge.begin();w.mybCareBridge.accept(external,h,h);w.mybCareBridge.end(h);
 w.openCareFormModal('pump',w.load().careEvents.findIndex(e=>e.id===pumpRow.id));w.mybCareWorkflow.resume();writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;result=await w.saveCareEvent();
 ok('Stale edit draft cannot overwrite newer record',result===false&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes&&w.byId('cNote').value==='nháp sửa cũ'&&w.mybCareUi.editing().version===captured.version);
 w.mybCareWorkflow.discard();w.closeCareFormModal();
 // Save guard and form lock still prevent close/double-click during a database request.
 formPump(45);gate=new Promise(r=>release=r);let promise=w.saveCareEvent();await new Promise(r=>setTimeout(r,30));w.closeCareFormModal();writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;await w.saveCareEvent();ok('Busy save blocks close and repeated command',w.__careFormModalOpen&&w.byId('cAmount').disabled&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);release();await promise;gate=null;
 // Multiple sources remain explicit after draft resume and Undo restores both.
 const stock=w.load().milkInventory.filter(b=>w.milkIsAvailable(b)&&b.remaining>=30),a=stock[0],b=stock.find(x=>x.id!==a.id);assert.ok(b);
 stored();w.byId('cAmount').value='50';w.__milkFeedSources=[{bagId:a.id,usedMl:20,remainderAction:'keep'},{bagId:b.id,usedMl:30,remainderAction:'keep'}];w.abState().manual=true;input('cFeedWasteMl','5');w.mybCareWorkflow.stash();const balancesBefore=[a.remaining,b.remaining];w.closeCareFormModal();w.openCareFormModal('feed');w.mybCareWorkflow.resume();
 ok('Multiple source IDs and amounts survive close/resume',w.milkFeedSourcesState().length===2&&w.milkFeedSourcesState()[1].bagId===b.id);
 result=await w.saveCareEvent();ok('Multi-source workflow deducts each exactly once',result===true&&w.load().milkInventory.find(x=>x.id===a.id).remaining===balancesBefore[0]-20&&w.load().milkInventory.find(x=>x.id===b.id).remaining===balancesBefore[1]-30);
 const multiRow=w.load().careEvents.find(e=>e.type==='feed');w.copyCareEvent(w.load().careEvents.findIndex(e=>e.id===multiRow.id));ok('Copy uses fresh dates and requires sources again',w.byId('careEditIndex').value===''&&w.byId('cDate').value===fixtureDay&&w.milkFeedSourcesState().length===0&&w.mybCareUi.editing()===null);w.mybCareWorkflow.discard();w.closeCareFormModal();
 result=await w.udUndo();ok('Multi-source Undo restores both balances',result===true&&w.load().milkInventory.find(x=>x.id===a.id).remaining===balancesBefore[0]&&w.load().milkInventory.find(x=>x.id===b.id).remaining===balancesBefore[1]);
 // Inventory edit remembers the actual stock popup and its nested scroll position.
 w.showPage('home');w.renderCareStatDetail('milk',fixtureDay);let sc=w.document.querySelector('#careDetailOverlay .careDetailScroll');if(sc)sc.scrollTop=143;w.editMilkBagFromInventory(w.load().milkInventory.findIndex(x=>x.id===bag.id));input('cNote','sửa từ kho');result=await w.saveCareEvent();await new Promise(r=>setTimeout(r,70));sc=w.document.querySelector('#careDetailOverlay .careDetailScroll');ok('Save from stock returns to stock popup and scroll',result===true&&w.byId('careDetailOverlay').classList.contains('show')&&sc&&sc.scrollTop===143);w.closeCareDetailModal();
 // Feed timer remembers edited end time; a lost ACK clears it only after verification.
 w.startCareTimer('feed');const timerId=w.loadCareTimer().operationEventId;w.openFeedDonePopup();const end=w.byId('feedDoneEndTime').value;input('feedDoneEndTime',end);w.closeFeedDonePopup();w.openFeedDonePopup();ok('Timer popup resumes its device-local end-time draft',w.loadCareTimer().doneDraft.endTime===end&&w.byId('feedDoneEndTime').value===end);
 mode='lost';result=await w.saveFeedDonePopup();mode='';ok('Timer survives an unknown save outcome',result===false&&w.loadCareTimer().operationEventId===timerId);writes=calls.filter(c=>c.name==='myb_care_write_v1540').length;result=await w.mybCareWorkflow.verifyPending();ok('Read-only timer recovery clears matching timer without duplicate cữ',result===true&&!w.loadCareTimer()&&calls.filter(c=>c.name==='myb_care_write_v1540').length===writes);
 // Corrupt local data is not overwritten silently; only explicit discard removes it.
 const prefix='mybCareDraft_v1700:'+encodeURIComponent(w.mybDataClient.target(w.loadCloudConfig()))+':';w.localStorage.setItem(prefix+'new%3Atemperature','broken-json');w.openCareFormModal('temperature');ok('Corrupt draft is kept and warned about',w.mybCareWorkflow.hasUnsafeDraft()&&w.localStorage.getItem(prefix+'new%3Atemperature')==='broken-json');w.mybCareWorkflow.discard();ok('Explicit discard removes corrupt draft and starts clean',!w.mybCareWorkflow.hasUnsafeDraft()&&!w.localStorage.getItem(prefix+'new%3Atemperature'));w.closeCareFormModal();
 // Storage quota/disabled local storage must not pretend that a draft was persisted.
 formPump(40);const proto=Object.getPrototypeOf(w.localStorage),originalSet=proto.setItem;proto.setItem=function(k,v){if(k.startsWith('mybCareDraft_v1700:'))throw Error('quota');return originalSet.call(this,k,v)};try{input('cNote','giữ khi đầy bộ nhớ');w.closeCareFormModal();ok('Storage failure keeps form open and announces unsaved local draft',w.__careFormModalOpen&&w.mybCareWorkflow.hasUnsafeDraft()&&w.byId('cNote').value==='giữ khi đầy bộ nhớ')}finally{proto.setItem=originalSet}w.mybCareWorkflow.stash();ok('Draft persistence can recover when storage becomes available',!w.mybCareWorkflow.hasUnsafeDraft());w.mybCareWorkflow.discard();w.closeCareFormModal();
 // Other-tab draft revision cannot be overwritten by this tab.
 formPump(75);input('cNote','tab một');let st=w.mybCareWorkflow.state();const otherSaved=w.mybCareDraftStore.put(st.target,st.key,{form:{type:'pump',fields:{}},session:{before:null,newId:''}},st.revision);input('cNote','cố ghi đè');
 ok('Other-tab changed draft is retained and unsaved form is flagged',w.mybCareWorkflow.hasUnsafeDraft()&&w.mybCareDraftStore.get(st.target,st.key).revision===otherSaved.revision&&w.byId('cNote').value==='cố ghi đè');w.closeCareFormModal();ok('Failed local draft persistence prevents unsafe close',w.__careFormModalOpen);
 // Resolve fixture tab conflict explicitly without rewriting business data.
 w.localStorage.removeItem('mybCareDraft_v1700:'+encodeURIComponent(st.target)+':'+encodeURIComponent(st.key));
 // Reset revision via a new isolated UI test window; real reload retains storage bytes.
 const dom2=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://app.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),v=dom2.window;
 v.indexedDB=new IDBFactory();v.matchMedia=w.matchMedia;v.scrollTo=()=>{};v.HTMLElement.prototype.scrollIntoView=function(){};v.alert=()=>{};v.confirm=()=>true;v.prompt=()=>null;v.fetch=w.fetch;v.navigator.serviceWorker={register:()=>new Promise(()=>{}),ready:new Promise(()=>{}),addEventListener(){}};
 for(let j=0;j<w.localStorage.length;j++){let k=w.localStorage.key(j);v.localStorage.setItem(k,w.localStorage.getItem(k))}
 // Independent browser document loads a persisted draft from the same device storage.
 const meta={schema:1,target:st.target,key:'new:diaper',revision:'fixture-revision',savedAt:new Date().toISOString(),data:{form:{type:'diaper',fields:{cNote:{value:'sau reload',checked:false},cDate:{value:fixtureDay},cEndDate:{value:fixtureDay},cTimeFrom:{value:'10:00'},cAmount:{value:'2'},cDiaperType:{value:'wet'}},sources:[]},session:{before:null,newId:'CE-reload-stable'},origin:{page:'home'}}};v.localStorage.setItem('mybCareDraft_v1700:'+encodeURIComponent(st.target)+':new%3Adiaper',JSON.stringify(meta));
 const paths=runtimePaths;
 try{for(const path of paths)v.eval(fs.readFileSync(path,'utf8'));assert.equal(await v.mybRelationalRealtimeV1577.start(),true);await new Promise(r=>setTimeout(r,50));v.openCareFormModal('diaper');ok('Independent care-runtime document discovers persisted draft',!!v.mybCareWorkflow.state().candidate);v.mybCareWorkflow.resume();ok('Actual reload restores data and stable creation ID',v.byId('cNote').value==='sau reload'&&v.mybCareUi.session().newId==='CE-reload-stable');result=await v.saveCareEvent();if(result!==true)console.log('reload diagnostic',v.byId('careWriteStatus')?.textContent,v.byId('careDraftNotice')?.textContent,v.mybCareRepository.pending(),v.mybCareWorkflow.model(),v.mybCareUi.session());ok('Resumed reload draft saves one exact business ID',result===true&&v.load().careEvents.some(e=>e.id==='CE-reload-stable'));}finally{v.close()}
 ok('Workflow never uses legacy mutation RPC',calls.every(c=>c.name!=='myb_relational_apply_changes_v1576'));
 ok('No uncaught full runtime errors',errors.length===0);
 console.log('RESULT '+pass+' PASS / 0 FAIL');
}finally{w.close();await db.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
