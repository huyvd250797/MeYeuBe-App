const fs=require('fs'),assert=require('assert/strict');const {JSDOM,VirtualConsole}=require('jsdom');const {IDBFactory}=require('fake-indexeddb');const {fixture,list}=require('./catalog-sql.cjs');
(async()=>{
 const db=await fixture();let pass=0,calls=[],mode='',gate=null,errors=[];
 const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('Not implemented'))errors.push(e.message)});
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://app.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
 w.indexedDB=new IDBFactory();w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.alert=()=>{};w.confirm=()=>true;
 w.navigator.serviceWorker={register:()=>new Promise(()=>{}),ready:new Promise(()=>{}),addEventListener(){}};
 w.localStorage.setItem('meYeuBeCloudSync_v1',JSON.stringify({enabled:true,url:'https://mock.test',anonKey:'fake',syncId:'main',cloudDbMode:false}));
 w.fetch=async(url,opts={})=>{
  if(!String(url).includes('/rpc/'))return {ok:true,json:async()=>({build:'15.5.0'}),text:async()=> '{}'};
  const name=String(url).split('/').pop(),args=JSON.parse(opts.body||'{}');calls.push({name,args});
  if(name.startsWith('myb_catalog_')&&mode==='missing')return {ok:false,status:404,json:async()=>({code:'PGRST202'}),text:async()=> '{}'};
  if(name.startsWith('myb_catalog_')&&mode==='network')throw new TypeError('network');
  if(gate&&name==='myb_catalog_write_v1530')await gate;
  const order={myb_relational_export_state_v1576:['p_sync_id'],myb_relational_apply_changes_v1576:['p_sync_id','p_device_key','p_changes'],myb_catalog_list_v1530:['p_sync_id','p_kind'],myb_catalog_write_v1530:['p_sync_id','p_kind','p_op','p_id','p_data','p_expected','p_device_key']}[name];assert.ok(order,name);
  const vals=order.map(k=>typeof args[k]==='object'&&args[k]!==null?JSON.stringify(args[k]):args[k]);
  const result=(await db.query('select public.'+name+'('+order.map((k,i)=>'$'+(i+1)).join(',')+') as r',vals)).rows[0].r;
  if(mode==='commit-then-network'&&name==='myb_catalog_write_v1530')throw new TypeError('lost acknowledgement');
  return {ok:true,status:200,json:async()=>result,text:async()=>JSON.stringify(result)};
 };
 function ok(name,f){f();pass++;console.log('PASS '+name)}
 function fill(k,name){const ids=k==='milk_container'?['mcName','mcActive']:k==='appointment_type'?['typeName','typeActive']:['dtName','dtActive'];w.byId(ids[0]).value=name;w.byId(ids[1]).value='1';if(k==='milk_container'){w.mcPickKind('binh');w.byId('mcCapacity').value='150'}}
 try{
 for(const p of ['boot.js','app.js','relational-v1577.js','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js'])w.eval(fs.readFileSync(p,'utf8'));
 await new Promise(r=>setTimeout(r,2100));calls=[];
 for(const kind of ['milk_container','appointment_type','diary_type']){
  await w.mybCatalogUi.refresh(kind);fill(kind,kind+' A');let success=await w.mybCatalogUi.save(kind);ok(kind+' actual form saves after DB ack',()=>assert.equal(success,true));
  let rows=(await list(db,kind)).items,item=rows[0];ok(kind+' form created one record',()=>assert.equal(rows.length,1));
  w.mybCatalogUi.edit(kind,item.id);fill(kind,kind+' B');await w.mybCatalogUi.save(kind);rows=(await list(db,kind)).items;
  ok(kind+' form update preserves ID',()=>assert.equal(rows[0].id,item.id));ok(kind+' form update changes name',()=>assert.equal(rows[0].name,kind+' B'));
  await w.mybCatalogUi.action(kind,'toggle',item.id);rows=(await list(db,kind)).items;ok(kind+' toggle persisted',()=>assert.equal(rows[0].active,false));
  await w.mybCatalogUi.action(kind,'delete',item.id);rows=(await list(db,kind)).items;ok(kind+' delete persisted',()=>assert.equal(rows.length,0));
 }
 // Filtered index compatibility resolves the stable visible ID.
 w.mybCatalogUi.reset('milk_container');fill('milk_container','Hidden A');await w.mybCatalogUi.save('milk_container');
 let hidden=(await list(db,'milk_container')).items[0];await w.mybCatalogUi.action('milk_container','toggle',hidden.id);
 fill('milk_container','Visible B');await w.mybCatalogUi.save('milk_container');w.localStorage.setItem('meYeuBeMcOnlyActive_v1','1');
 w.editMilkContainer(0);fill('milk_container','Visible B edited');await w.mybCatalogUi.save('milk_container');
 let filtered=(await list(db,'milk_container')).items;
 ok('Filtered edit targets visible ID',()=>assert.ok(filtered.some(x=>x.name==='Visible B edited')));
 ok('Filtered edit cannot rename hidden item',()=>assert.equal(filtered.find(x=>x.id===hidden.id).name,'Hidden A'));
 w.localStorage.setItem('meYeuBeMcOnlyActive_v1','0');
 ok('Catalog UI never uses full-state cloud endpoints',()=>assert.ok(calls.every(c=>c.name.startsWith('myb_catalog_'))));
 fill('milk_container','');ok('Client rejects empty name',()=>assert.throws(()=>w.mybCatalogService.validate('milk_container',{name:'',kind:'binh',capacity:1}),/Tên danh mục/));
 const count=calls.length;let success=await w.mybCatalogUi.save('milk_container');ok('Empty name does not reach DB',()=>assert.equal(calls.length,count));ok('Invalid form returns false',()=>assert.equal(success,false));
 fill('milk_container','<img src=x onerror=alert(1)>');await w.mybCatalogUi.save('milk_container');
 ok('List escapes user content',()=>assert.equal(w.byId('mcList').querySelector('img'),null));
 let item=(await list(db,'milk_container')).items[0];
 w.mybCatalogUi.edit('milk_container',item.id);fill('milk_container','Keep this draft');mode='network';success=await w.mybCatalogUi.save('milk_container');mode='';
 ok('Network failure keeps form',()=>assert.equal(w.byId('mcName').value,'Keep this draft'));ok('Network failure does not reset edit state',()=>assert.equal(success,false));
 let release;gate=new Promise(r=>release=r);const pending=w.mybCatalogUi.save('milk_container');await new Promise(r=>setTimeout(r,30));
 ok('Save button disabled while request in flight',()=>assert.ok(w.document.querySelector('#milkContainer button').disabled));
 const callsNow=calls.length;await w.mybCatalogUi.save('milk_container');ok('Repeated save does not issue another request',()=>assert.equal(calls.length,callsNow));
 w.byId('cloudSyncId').value='other';w.byId('cloudEnabled').value='1';await w.saveCloudConfig();ok('Config cannot switch during catalog write',()=>assert.equal(w.loadCloudConfig().syncId,'main'));
 ok('Generic save blocked while catalog write in flight',()=>assert.throws(()=>w.save(w.load()),/Đang lưu danh mục/));release();await pending;gate=null;
 const d=w.load();d.milkContainers.push({id:'legacy-insert',name:'No'});ok('Legacy snapshot cannot write managed category',()=>assert.throws(()=>w.save(d),/Danh mục được quản lý riêng/));
 w.mybCatalogUi.reset('appointment_type');fill('appointment_type','Committed once');mode='commit-then-network';success=await w.mybCatalogUi.save('appointment_type');mode='';
 ok('Lost ack is not reported as saved',()=>assert.equal(success,false));await w.mybCatalogUi.refresh('appointment_type');await w.mybCatalogUi.save('appointment_type');
 ok('Retry after unknown outcome cannot create duplicate',()=>assert.equal((w.load().appointmentTypes||[]).length,1));
 mode='missing';success=await w.mybCatalogUi.refresh('diary_type');mode='';ok('Missing migration is an explicit error',()=>assert.equal(success,false));
 ok('Missing migration points to installation steps',()=>assert.match(w.byId('diaryTypeListStatus').textContent,/migration/));
 // An old scoped list cannot overwrite a later committed catalog state.
 const revision=w.mybCatalogBridge.revision();let current=w.load();
 fill('diary_type','Revision bump');await w.mybCatalogUi.save('diary_type');
 ok('Old scoped response rejected after write',()=>assert.throws(()=>w.mybCatalogBridge.acceptList('diaryTypes',[],'https://mock.test|main',revision),/đã thay đổi/));
 ok('Rejected list retains committed category',()=>assert.ok(w.load().diaryTypes.some(x=>x.name==='Revision bump')));
 ok('No uncaught full-runtime errors',()=>assert.deepEqual(errors,[]));console.log('RESULT '+pass+' PASS / 0 FAIL');
 }finally{w.close();await db.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
