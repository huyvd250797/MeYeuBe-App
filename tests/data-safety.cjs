const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');const {IDBFactory}=require('fake-indexeddb');
let checks=0;function ok(name,fn){fn();checks++;console.log('PASS '+name)}
const fields={health_member:'hb',care_event:'careEvents',milk_item:'milkInventory',milk_container:'milkContainers',diary_entry:'diary',milestone:'milestones',appointment:'appointments',pregnancy:'pregnancy',app_member:'members',noise_log:'noiseLogs',lux_log:'luxLogs',activity_log:'activityLog',appointment_type:'appointmentTypes',diary_type:'diaryTypes'};
const copy=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const errors=[],calls=[],servers={main:{settings:{},hb:{members:[]},careEvents:[],milkInventory:[],milkContainers:[],diary:[]},other:{settings:{babyName:'Other'},careEvents:[]}};
 const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Not implemented/.test(e.message))errors.push(e.message)});
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://app.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;
 w.indexedDB=new IDBFactory();w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.navigator.serviceWorker={register:()=>new Promise(()=>{}),ready:new Promise(()=>{}),addEventListener(){}};
 w.alert=()=>{};w.confirm=()=>true;w.prompt=()=>null;
 w.localStorage.setItem('meYeuBeCloudSync_v1',JSON.stringify({enabled:true,url:'https://mock.test',anonKey:'fake',syncId:'main',cloudDbMode:false}));
 let fail=false,delayExport=null,afterExport=null;
 w.fetch=async(url,opts={})=>{
  if(!String(url).includes('/rest/v1/rpc/'))return {ok:true,text:async()=> '{}',json:async()=>({build:'15.5.0'})};
  const name=String(url).split('/').pop(),body=JSON.parse(opts.body||'{}');calls.push({name,body});
  if(fail)throw new Error('Simulated network error');
  if(name==='myb_relational_export_state_v1576'){
   const payload=copy(servers[body.p_sync_id]||{});if(delayExport)await delayExport;
   if(afterExport)afterExport();return {ok:true,text:async()=>JSON.stringify({ok:true,family_id:'family-'+body.p_sync_id,payload})};
  }
  assert.equal(name,'myb_relational_apply_changes_v1576','No legacy write RPC');
  let server=servers[body.p_sync_id];
  for(const c of body.p_changes){
   if(c.entity==='settings'){server.settings=copy(c.data);continue}
   if(c.entity==='monthly_notes'){server.monthlyNotes=copy(c.data);continue}
   let field=fields[c.entity];assert.ok(field,'Known entity');
   let arr=field==='hb'?(server.hb||(server.hb={members:[]})).members:(server[field]||(server[field]=[]));
   const idx=arr.findIndex(x=>String(x.id)===c.source_id);
   if(c.op==='delete'){if(idx>=0)arr.splice(idx,1)}else if(idx>=0)arr[idx]=copy(c.data);else arr.push(copy(c.data));
  }
  return {ok:true,text:async()=>JSON.stringify({ok:true})};
 };
 try{
 w.eval(fs.readFileSync('boot.js','utf8'));require('./ui-assets.cjs').loadLegacy(w);w.eval(fs.readFileSync('relational-v1577.js','utf8'));
 await new Promise(r=>setTimeout(r,2100));const api=w.mybRelationalRealtimeV1577;await api.bootstrap(false);
 ok('Full boot/app/relational runtime loads',()=>assert.equal(api.version,'17.18.2'));
 for(const [entity,field] of Object.entries(fields)){
  const id='test-'+entity;let d=w.load();let arr=field==='hb'?d.hb.members:(d[field]||(d[field]=[]));arr.push({id,name:'Test',type:entity==='care_event'?'temperature':undefined,amount:1,date:'2026-10-25'});
  w.save(d);await api.flush('test-create');
  ok(entity+' create',()=>assert.ok((field==='hb'?servers.main.hb.members:servers.main[field]).find(x=>x.id===id)));
  d=w.load();arr=field==='hb'?d.hb.members:d[field];arr.find(x=>x.id===id).name='Edited';w.save(d);await api.flush('test-edit');
  ok(entity+' update',()=>assert.equal((field==='hb'?servers.main.hb.members:servers.main[field]).find(x=>x.id===id).name,'Edited'));
  d=w.load();if(field==='hb')d.hb.members=d.hb.members.filter(x=>x.id!==id);else d[field]=d[field].filter(x=>x.id!==id);w.save(d);await api.flush('test-delete');
  ok(entity+' delete',()=>assert.ok(!(field==='hb'?servers.main.hb.members:servers.main[field]).some(x=>x.id===id)));
 }
 let d=w.load();d.monthlyNotes={'2026-10':'Note'};w.save(d);await api.flush('note');ok('Monthly notes persists',()=>assert.equal(servers.main.monthlyNotes['2026-10'],'Note'));
 // Exercise real UI handlers with the final relational layer installed.
 servers.main.milkContainers=[{id:'bottle',name:'Bottle',kind:'binh',capacity:200,active:true},{id:'bag',name:'Bag',kind:'tui',capacity:0,active:true}];
 servers.main.milkInventory=[{id:'milk-ui',amount:100,remaining:100,status:'Đang bảo quản',storage:'Ngăn mát',containerId:'bottle',containerName:'Bottle',containerKind:'binh',date:w.today(),startDate:w.today(),timeFrom:'08:00',expireDateTime:new Date(Date.now()+86400000).toISOString().slice(0,16)}];
 servers.main.settings.mcMigratedV1=true;await api.bootstrap(false);
 w.openCareFormModal('feed');w.byId('cFeedSource').value='stored';w.toggleFeedSourceFields();w.byId('cAmount').value='60';w.abOnAmountInput();w.saveCareEvent();await api.flush('ui-feed');
 ok('Actual feeding form creates stored feed in database',()=>assert.ok(servers.main.careEvents.some(x=>x.type==='feed'&&x.amount===60)));
 ok('Actual feeding form consumes exact milk amount',()=>assert.equal(servers.main.milkInventory.find(x=>x.id==='milk-ui').remaining,40));
 w.udUndo();await api.flush('ui-feed-undo');
 ok('Actual feeding undo returns milk',()=>assert.equal(servers.main.milkInventory.find(x=>x.id==='milk-ui').remaining,100));
 ok('Actual feeding undo removes event',()=>assert.ok(!servers.main.careEvents.some(x=>x.type==='feed')));
 w.tfOpen(0);w.tfPickKind('tui');w.tfPickTarget('bag');w.byId('tfAmount').value='40';w.tfSyncPreview();w.tfConfirm();await api.flush('ui-transfer');
 ok('Actual transfer form creates transfer event',()=>assert.ok(servers.main.careEvents.some(x=>x.type==='transfer')));
 ok('Actual transfer preserves total milk',()=>assert.equal(servers.main.milkInventory.reduce((n,x)=>n+Number(x.remaining),0),100));
 w.udUndo();await api.flush('ui-transfer-undo');
 ok('Actual transfer undo restores source',()=>assert.equal(servers.main.milkInventory.find(x=>x.id==='milk-ui').remaining,100));
 ok('Actual transfer undo removes new bag',()=>assert.equal(servers.main.milkInventory.length,1));
 // Synchronous memory prevents two immediate saves losing the first change.
 d=w.load();d.diary.push({id:'fast-1',title:'one'});w.save(d);d=w.load();d.diary.push({id:'fast-2',title:'two'});w.save(d);await api.flush('rapid');
 ok('Consecutive saves retain both records',()=>assert.equal(servers.main.diary.filter(x=>x.id.startsWith('fast-')).length,2));
 const before=w.load();Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});d=w.load();d.diary.push({id:'offline'});
 ok('Offline save rejects before success',()=>assert.throws(()=>w.save(d),/mất mạng/));
 ok('Offline attempt keeps durable draft',()=>assert.ok(JSON.parse(w.localStorage.getItem('mybSafetyDraft_v1520'))['https://mock.test|main']));
 ok('Offline attempt does not mutate current records',()=>assert.ok(!w.load().diary.some(x=>x.id==='offline')));
 Object.defineProperty(w.navigator,'onLine',{value:true,configurable:true});await api.bootstrap(false);
 ok('Reconnect preserves offline draft',()=>assert.ok(w.localStorage.getItem('mybSafetyDraft_v1520').includes('offline')));
 fail=true;d=w.load();d.diary.push({id:'pending-1',title:'Pending'});w.save(d);
 await assert.rejects(api.flush('fail'));checks++;console.log('PASS Failed write rejects flush');
 ok('Failed write stays durable',()=>assert.ok(JSON.parse(w.localStorage.getItem('mybBoundOutbox_v1520')).length));
 await api.bootstrap(false);ok('Failed flush cannot overwrite pending memory',()=>assert.ok(w.load().diary.some(x=>x.id==='pending-1')));
 w.byId('cloudSyncId').value='other';w.byId('cloudEnabled').value='1';await w.saveCloudConfig();
 ok('Config switch blocked with pending operations',()=>assert.equal(w.loadCloudConfig().syncId,'main'));
 // Even direct config tampering cannot redirect an operation.
 let cfg=w.loadCloudConfig();cfg.syncId='other';w.saveCloudConfigToStorage(cfg);fail=false;
 await assert.rejects(api.flush('wrong-target'),/gia đình khác/);checks++;console.log('PASS Queue cannot be redirected by configuration tampering');
 cfg.syncId='main';w.saveCloudConfigToStorage(cfg);await api.flush('retry');
 ok('Retry sends only to original family',()=>assert.ok(servers.main.diary.some(x=>x.id==='pending-1')));
 ok('Other family untouched',()=>assert.ok(!servers.other.diary));
 w.localStorage.setItem('mybBoundOutbox_v1520',JSON.stringify([{id:'unbound',changes:[],createdAt:new Date().toISOString()}]));
 await assert.rejects(api.flush('unbound'),/chưa xác định/);checks++;console.log('PASS Unbound legacy operation quarantined');
 await assert.rejects(api.queueClear(),/Không tự xóa/);checks++;console.log('PASS Destructive queue clear disabled');w.localStorage.setItem('mybBoundOutbox_v1520','[]');
 // Successful switch must clear old family data and load the new target.
 w.byId('cloudSyncId').value='other';await w.saveCloudConfig();
 ok('Clean config switch loads new family',()=>assert.equal(w.loadCloudConfig().syncId,'other'));
 ok('Old family records not displayed in new family',()=>assert.ok(!w.load().diary.some(x=>x.id==='fast-1')));
 ok('No legacy full JSON cloud paths',()=>assert.ok(calls.every(x=>/myb_relational_(export_state|apply_changes)_v1576/.test(x.name))));
 // Storage failure must reject before changing memory or announcing success.
 let draft=w.load();draft.diary.push({id:'quota'});const proto=Object.getPrototypeOf(w.localStorage),nativeSet=proto.setItem;
 proto.setItem=function(k,v){if(k==='mybBoundOutbox_v1520')throw new Error('quota');return nativeSet.call(this,k,v)};
 ok('Quota failure is visible',()=>assert.throws(()=>w.save(draft),/quota/));proto.setItem=nativeSet;
 ok('Quota failure leaves memory unchanged',()=>assert.ok(!w.load().diary.some(x=>x.id==='quota')));
 w.localStorage.setItem('mybBoundOutbox_v1520','broken');await api.bootstrap(false);
 ok('Corrupt journal blocks refresh without discarding memory',()=>assert.equal(w.load().settings.babyName,'Other'));w.localStorage.setItem('mybBoundOutbox_v1520','[]');
 afterExport=()=>{let c=w.loadCloudConfig();c.syncId='main';w.saveCloudConfigToStorage(c)};await api.bootstrap(false);afterExport=null;
 ok('Stale export cannot replace active data',()=>assert.equal(w.load().settings.babyName,'Other'));
 let reset=w.loadCloudConfig();reset.syncId='other';w.saveCloudConfigToStorage(reset);
 ok('No uncaught runtime errors',()=>assert.deepEqual(errors,[]));
 console.log('RESULT '+checks+' PASS / 0 FAIL');
 }finally{w.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
