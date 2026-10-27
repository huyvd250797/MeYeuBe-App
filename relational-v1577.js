/* ============================================================================
   Mẹ Yêu Bé V17.2.5 · Backup & Restore
   ---------------------------------------------------------------------------
   Cloud source of truth: Supabase RELATIONAL TABLES ONLY.
   - NEVER reads/writes public.meyeube_sync.
   - Full UI state may live in memory/IndexedDB as an offline cache only.
   - Saves are converted to row-level entity deltas and sent to
     myb_relational_apply_changes_v1576().
   - Server state is read from myb_relational_export_state_v1576().
   ============================================================================ */
(function(){
  if(window.__MYB_RELATIONAL_REALTIME_V1577__)return;
  window.__MYB_RELATIONAL_REALTIME_V1577__=true;

  var V='17.2.5';
  var startup=window.mybStartupGate={ready:false,state:'loading',error:''};var initialTask=null;var startPromise=null;function start(){if(!startPromise)startPromise=(async function(){if(window.mybUI)await mybUI.ready;var ok=await bootstrap(false);if(ok)startRelationalRealtime();return ok})();return startPromise}
  function startupStatus(state,message){startup.state=state;startup.error=state==='error'?message:'';if(document.body)document.body.dataset.startup=state;if(typeof mybStartupSplashStatus==='function')mybStartupSplashStatus(message);var loader=document.getElementById('appLoading'),host=loader&&(loader.querySelector('.appLoadingCard')||loader.firstElementChild||loader);if(loader)loader.style.zIndex='220';if(host&&state==='loading'){var phase=document.getElementById('startupPhase');if(!phase){phase=document.createElement('p');phase.id='startupPhase';host.appendChild(phase)}phase.hidden=true;}if(state==='error'&&host){var box=document.getElementById('startupFailure');if(!box){box=document.createElement('div');box.id='startupFailure';box.setAttribute('role','alert');host.appendChild(box)}box.textContent=message;var retry=document.createElement('button');retry.textContent='Thử tải lại';retry.onclick=function(){bootstrap(true)};box.appendChild(retry);var config=document.createElement('button');config.textContent='Kiểm tra kết nối';config.onclick=function(){startup.ready=true;hideAppLoading();if(typeof mybHideStartupSplash==='function')mybHideStartupSplash();showPage('cloudSync')};box.appendChild(config)}if(state==='ready'||state==='loading'){var box=document.getElementById('startupFailure');if(box)box.remove();}}
  var CACHE_META='meYeuBeRelationalOnlyMeta_v1577';
  var QUEUE_DB='meYeuBeRelationalDirectQueue_v1576';
  var QUEUE_STORE='ops';
  var memory=null;
  var baseline=null;
  var booting=false;
  var flushing=false;
  var flushPromise=null;
  var flushTimer=null;
  var saveChain=Promise.resolve();
  var legacyStopped=false;
  var serverReady=false;
  var stabilizing=true;
  var serverFamilyId='';
  var realtimeKey='';
  var realtimePullTimer=null;
  var realtimeRefreshing=false;
  var realtimePending=false;
  var realtimeLastEventAt='';
  var realtimeSafetyTimer=null;
  var realtimeChecking=false;var realtimeVersions=null,realtimeScopes=new Set(),realtimeLastScopes=[],realtimeRevisionError='';
  async function readRealtimeVersions(){if(!window.mybRealtimeRepository)return null;try{var v=await mybRealtimeRepository.revisions();if(!v||typeof v!=='object'||Array.isArray(v))return null;realtimeRevisionError='';return v}catch(e){realtimeRevisionError=e.message;return null}}

  // V15.2: a durable, destination-bound outbox. Never infer ownership of old ops.
  var JOURNAL='mybBoundOutbox_v1520', DRAFT='mybSafetyDraft_v1520';
  var categoryBusy=false,catalogRevision=0;
  var activeTarget='', configChanging=false, lastSaveError='';
  function target(c){c=c||cfg();return String(c.url||'').trim().replace(/\/+$/,'')+'|'+String(c.syncId||'').trim()}
  function readJournal(){var raw=localStorage.getItem(JOURNAL);var v=raw?JSON.parse(raw):[];if(!Array.isArray(v))throw new Error('Outbox không hợp lệ; hãy xuất dữ liệu để kiểm tra.');return v}
  function writeJournal(v){localStorage.setItem(JOURNAL,JSON.stringify(v))}
  function safetyState(state,message){
    window.mybSaveState={state:state,message:message||'',at:new Date().toISOString()};
    var el=document.getElementById('mybSaveStatus');if(el){el.textContent=message||state;el.dataset.state=state}
  }
  function exportRecovery(){
    var data={version:V,exportedAt:now(),journal:readJournal(),drafts:JSON.parse(localStorage.getItem(DRAFT)||'{}'),carePending:window.mybCareRepository?window.mybCareRepository.pending():null,healthPending:window.mybHealthRepository?window.mybHealthRepository.pending():null,planningPending:window.mybPlanningRepository?mybPlanningRepository.pending():null,settingsPending:window.mybSettingsRepository?mybSettingsRepository.pending():null};
    return qAllLegacy().then(function(legacy){data.legacyQueue=legacy;var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='MeYeuBe-recovery-'+Date.now()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);return true});
  }
  function guardSave(db){
    var error='';
    if(categoryBusy)error="Đang lưu danh mục. Vui lòng chờ hoàn tất.";
    else if(configChanging||activeTarget!==target())error='Cấu hình dữ liệu đã thay đổi; tải lại đúng gia đình trước khi lưu.';
    else if(!enabled())error='Chưa bật kết nối database. Dữ liệu chưa được lưu.';
    else if(!navigator.onLine)error='Đang mất mạng. Giữ bản nháp và thử lưu lại khi có mạng.';
    else if(!serverReady)error=lastSaveError||'Chưa tải được dữ liệu database. Kiểm tra kết nối và thử tải lại.';
    else if(stabilizing||booting)error='Đang tải dữ liệu ban đầu. Chờ dashboard sẵn sàng trước khi lưu.';
    else if(realtimeRefreshing)error='Đang cập nhật dữ liệu từ thiết bị khác. Thử lưu lại sau.';
    if(error){
      try{var drafts=JSON.parse(localStorage.getItem(DRAFT)||'{}');drafts[target()]={target:target(),savedAt:now(),data:clone(db)};localStorage.setItem(DRAFT,JSON.stringify(drafts))}catch(e){error+=' Không lưu được nháp trên thiết bị; hãy giữ nguyên form.'}
      safetyState('draft',error);safeToast(error,'warn');var blocked=new Error(error);blocked.code='MYB_SAVE_BLOCKED';throw blocked;
    }
  }
  function acceptServer(p,destination){
    if(destination!==target()||configChanging)throw new Error('Bỏ qua phản hồi từ cấu hình cũ.');
    cachePut(p);baseline=shape(clone(p));serverReady=true;activeTarget=destination;catalogRevision++;
  }
  function now(){return new Date().toISOString()}
  function clone(v){try{return JSON.parse(JSON.stringify(v==null?{}:v))}catch(e){return v||{}}}
  function arr(v){return Array.isArray(v)?v:[]}
  function obj(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
  function str(v){return String(v==null?'':v)}
  function trim(v){return str(v).trim()}
  function safeToast(msg,type){try{showToast(msg,type||'success')}catch(e){try{console.log('[V17.2.5]',msg)}catch(_e){}}}
  function log(msg,type){try{cloudLog(msg,type)}catch(e){if(type)safeToast(msg,type);else console.log('[V17.2.5]',msg)}}
  function cfg(){try{return loadCloudConfig()}catch(e){return {enabled:false,url:'',anonKey:'',syncId:'main'}}}
  function dev(){try{return cloudDeviceId()}catch(e){var k='meYeuBeDeviceId_v1',x=localStorage.getItem(k);if(!x){x='dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);localStorage.setItem(k,x)}return x}}
  function enabled(){var c=cfg();return !!(c&&c.enabled&&c.url&&c.anonKey&&c.syncId)}

  // Deliberately minimal: defaults/shape only. No cross-device merge, no business
  // dedupe and no "repair" that can resurrect used milk bags.
  function shape(db){
    db=obj(db)?db:{};
    db.settings=obj(db.settings)?db.settings:{};
    db.hb=obj(db.hb)?db.hb:{}; db.hb.members=arr(db.hb.members);
    ['pregnancy','baby','mom','diary','healthBook','appointments','milestones','careEvents','milkInventory','noiseLogs','luxLogs','members','activityLog','familyInvites'].forEach(function(k){db[k]=arr(db[k])});
    if(!Array.isArray(db.appointmentTypes)){try{db.appointmentTypes=defaultAppointmentTypes()}catch(e){db.appointmentTypes=[]}}
    if(!Array.isArray(db.diaryTypes)){try{db.diaryTypes=defaultDiaryTypes()}catch(e){db.diaryTypes=[]}}
    if(!Array.isArray(db.milkContainers)){try{db.milkContainers=defaultMilkContainers()}catch(e){db.milkContainers=[]}}
    db.monthlyNotes=obj(db.monthlyNotes)?db.monthlyNotes:{};
    db.permissions=obj(db.permissions)?db.permissions:{};
    db._relationalOnly=true;
    db._relationalVersion=V;
    return db;
  }

  function stable(v){
    if(v===undefined)return 'u'; if(v===null)return 'n';
    if(typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
    var ks=Object.keys(v).filter(function(k){
      return !/^_(cloud|sync|local|relational|lastCloud|cloudDb|merge|memberRepair|saveConflict)/i.test(k) &&
             k!=='updatedAt' && k!=='_swipeOpen' && k!=='_idx';
    }).sort();
    return '{'+ks.map(function(k){return JSON.stringify(k)+':'+stable(v[k])}).join(',')+'}';
  }

  function sourceId(item,kind,index){
    item=obj(item)?item:{};
    var id=trim(item.id); if(id)return id;
    var ca=trim(item.createdAt); if(ca)return ca;
    var ts=trim(item.ts); if(ts)return ts;
    if(kind==='pregnancy')return [item.date||'',item.week||'',item.weight||'',index||0].join('|');
    if(kind==='appointment_type'||kind==='diary_type')return trim(item.name)||String(index||0);
    return [item.date||'',item.timeFrom||item.time||item.startTime||'',item.type||item.category||'',item.title||item.name||'',index||0].join('|');
  }

  var defs=[
    {entity:'app_member',get:function(d){return arr(d.members)}},
    {entity:'noise_log',get:function(d){return arr(d.noiseLogs)}},
    {entity:'lux_log',get:function(d){return arr(d.luxLogs)}},
    {entity:'activity_log',get:function(d){return arr(d.activityLog)}}
  ];

  function mapDef(def,db){
    var m=new Map(); def.get(db).forEach(function(x,i){var k=sourceId(x,def.entity,i);if(k)m.set(k,x)}); return m;
  }
  function buildChanges(before,after){
    before=shape(clone(before||{})); after=shape(clone(after||{}));
    var modern=[['hb','health_member',window.mybHealthRepository],['pregnancy','pregnancy',window.mybHealthRepository],['careEvents','care_event',window.mybCareRepository],['milkInventory','milk_item',window.mybCareRepository],['milkContainers','milk_container',window.mybCatalogRepository],['appointmentTypes','appointment_type',window.mybCatalogRepository],['diaryTypes','diary_type',window.mybCatalogRepository],['diary','diary_entry',window.mybPlanningRepository],['appointments','appointment',window.mybPlanningRepository],['milestones','milestone',window.mybPlanningRepository]];
    var out=[];modern.forEach(function(m){if(stable(before[m[0]])===stable(after[m[0]]))return;if(m[2]){out.push({entity:m[1],op:'unsupported_snapshot',source_id:'guard',data:{}});return}var def={entity:m[1],get:function(d){return m[0]==='hb'?arr(d.hb&&d.hb.members):arr(d[m[0]])}},a=mapDef(def,before),b=mapDef(def,after);a.forEach(function(v,k){if(!b.has(k))out.push({entity:m[1],op:'delete',source_id:k,data:{id:k}})});b.forEach(function(v,k){if(!a.has(k)||stable(a.get(k))!==stable(v))out.push({entity:m[1],op:'upsert',source_id:k,data:clone(v)})});});

    if(stable(window.mybSettingsRepository?Object.assign({},before.settings,{theme:null,themeMode:null}):before.settings)!==stable(window.mybSettingsRepository?Object.assign({},after.settings,{theme:null,themeMode:null}):after.settings))out.push({entity:'settings',op:'upsert',source_id:'settings',data:clone(after.settings)});
    defs.forEach(function(def){
      var a=mapDef(def,before),b=mapDef(def,after);
      a.forEach(function(v,k){if(!b.has(k))out.push({entity:def.entity,op:'delete',source_id:k,data:{id:k}})});
      b.forEach(function(v,k){if(!a.has(k)||stable(a.get(k))!==stable(v))out.push({entity:def.entity,op:'upsert',source_id:k,data:clone(v)})});
    });
    if(stable(before.monthlyNotes)!==stable(after.monthlyNotes))out.push({entity:'monthly_notes',op:'upsert',source_id:'monthly_notes',data:clone(after.monthlyNotes)});
    return out;
  }

  function rpc(name,args,label){
    var c=cfg(); if(!c.url||!c.anonKey||!c.syncId)return Promise.reject(new Error('Thiếu URL, Publishable key hoặc Sync ID'));
    var url=String(c.url).replace(/\/+$/,'')+'/rest/v1/rpc/'+name;
    var headers={'apikey':c.anonKey,'Authorization':'Bearer '+c.anonKey,'Content-Type':'application/json'};
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort()},20000);return fetch(url,{method:'POST',signal:controller.signal,headers:headers,body:JSON.stringify(args||{})}).then(async function(res){
      var text=await res.text(),data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
      if(!res.ok)throw new Error((label||name)+' lỗi '+res.status+': '+(typeof data==='string'?data:JSON.stringify(data||{})));
      return data;
    }).catch(function(e){if(e.name==='AbortError')throw new Error((label||name)+': quá thời gian tải (20 giây). Kiểm tra mạng và API.');throw e}).finally(function(){clearTimeout(timer)});
  }

  function openQ(){return new Promise(function(resolve,reject){
    if(!window.indexedDB){reject(new Error('IndexedDB unavailable'));return}
    var r=indexedDB.open(QUEUE_DB,1);
    r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains(QUEUE_STORE))d.createObjectStore(QUEUE_STORE,{keyPath:'id'})};
    r.onsuccess=function(){resolve(r.result)};r.onerror=function(){reject(r.error||new Error('Không mở được direct queue'))};
  })}
  function qPut(op){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).put(op);tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}
  function qDel(id){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).delete(id);tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}
  function qAllLegacy(){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readonly'),r=tx.objectStore(QUEUE_STORE).getAll();r.onsuccess=function(){var x=arr(r.result).sort(function(a,b){return str(a.createdAt).localeCompare(str(b.createdAt))});try{d.close()}catch(e){}resolve(x)};r.onerror=function(){try{d.close()}catch(e){}reject(r.error)}})})}
  function qClearLegacy(){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).clear();tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}

  async function qAll(){return (await qAllLegacy()).concat(readJournal())}
  async function deleteAcknowledged(id){
    var journal=readJournal();
    if(journal.some(function(x){return x.id===id})){writeJournal(journal.filter(function(x){return x.id!==id}));return}
    await qDel(id);
  }
  function qClear(){return Promise.reject(new Error('Không tự xóa dữ liệu chờ. Hãy xuất bản phục hồi và đối chiếu database.'))}
  function cachePut(db){
    var previousMilestones=memory&&arr(memory.milestones);if(window.mybScopedRepository)mybScopedRepository.applyDevice(db);memory=shape(clone(db||{})); if(window.mybPlanningService){mybPlanningService.project(memory);if(previousMilestones)memory.milestones.filter(function(m){return m.auto&&!previousMilestones.some(function(x){return x.key===m.key})}).forEach(function(m){try{var history=loadNotificationHistory();if(!history.some(function(n){return n.eventKey==='milestone_'+m.id}))pushMilestoneNotification(memory,m)}catch(e){}});}memory._relationalCacheAt=now(); window.__mybCloudDbMemory=memory;
    try{if(typeof window.mybCloudDbPutCacheV1554==='function')window.mybCloudDbPutCacheV1554(memory).catch(function(){})}catch(e){}
    try{localStorage.setItem(CACHE_META,JSON.stringify({version:V,mode:'relational-only',syncId:cfg().syncId||'main',target:target(),cachedAt:now()}))}catch(e){}
    return memory;
  }
  async function cacheGet(){
    var meta;try{meta=JSON.parse(localStorage.getItem(CACHE_META)||'null')}catch(e){}
    if(!meta||meta.target!==target())return null;
    try{if(typeof window.mybCloudDbGetCacheV1554==='function'){var c=await window.mybCloudDbGetCacheV1554();if(c)return shape(clone(c))}}catch(e){}
    try{var r=localStorage.getItem(KEY);if(r)return shape(JSON.parse(r))}catch(e){}
    return null;
  }

  async function fetchServer(forceFull){
    if(window.mybScopedRepository&&!forceFull&&!mybScopedRepository.needsFull()){var c0=cfg(),d0=target(c0),light=await rpc('myb_app_shell_v1570',{p_sync_id:c0.syncId},'Scoped shell');if(d0!==target()||configChanging)throw new Error('Kết nối đã đổi trong khi tải.');if(!light||!light.ok||!light.payload)throw new Error(light&&light.message||'Chưa cài migration1570.');if(mybScopedRepository.needsFull())return fetchServer(true);mybSettingsRepository.acceptState(light.settingsState);serverFamilyId=light.family_id;var l=shape(clone(light.payload));l._scopeComplete=false;l._relationalFamilyId=serverFamilyId;return l;}
    var c=cfg(),destination=target(c);var res=await rpc(window.mybPlanningRepository?'myb_app_shell_v1560':window.mybHealthRepository?'myb_app_shell_v1550':window.mybCareRepository?'myb_app_shell_v1540':'myb_relational_export_state_v1576',{p_sync_id:c.syncId||'main'},'Relational export');
    if(!res||res.ok!==true||!res.payload)throw new Error((res&&res.message)||'Server chưa có relational state V15.0.76+');
    if(destination!==target()||configChanging)throw new Error('Cấu hình đã đổi trong khi tải dữ liệu.');
    serverFamilyId=trim(res.family_id||serverFamilyId);
    var results=await Promise.all([
      window.mybCareRepository?mybCareRepository.fetchBundle():null,
      window.mybHealthRepository?mybHealthRepository.fetchBundle():null,
      window.mybPlanningRepository?mybPlanningRepository.fetchBundle():null,
      window.mybSettingsRepository?mybSettingsRepository.get():null
    ]);
    if(destination!==target()||configChanging)throw new Error('Cấu hình đã đổi trong khi tải dữ liệu.');
    var n=shape(clone(res.payload)),bundle=results[0],health=results[1];
    if(bundle){n.careEvents=bundle.careEvents;n.milkInventory=bundle.milkInventory;}
    if(health){n.hb=mybHealthService.hydrate(health,memory&&memory.hb&&memory.hb.activeId);n.pregnancy=health.pregnancy;mybHealthService.project(n);}
    if(results[2])mybPlanningService.hydrate(n,results[2]);
    n._relationalCounts=res.counts||{};
    if(results[2]){n._relationalCounts.diary=n.diary.length;n._relationalCounts.appointments=n.appointments.length;n._relationalCounts.milestones=n.milestones.length;}
    if(health){n._relationalCounts.hb_members=n.hb.members.length;n._relationalCounts.pregnancy=n.pregnancy.length;}
    if(bundle){n._relationalCounts.careEvents=n.careEvents.length;n._relationalCounts.milkInventory=n.milkInventory.length;}
    n._scopeComplete=true;if(results[3])n.settings=results[3].settings;
    n._relationalLoadedAt=now();n._relationalFamilyId=serverFamilyId;return n;
  }

  function enqueueChanges(changes,reason){
    if(!changes.length)return null;
    var op={id:'r1520_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),createdAt:now(),target:target(),deviceKey:dev(),reason:reason||'save',changes:changes};
    var journal=readJournal();journal.push(op);writeJournal(journal);
    safetyState('pending','Đã ghi trên máy · đang chờ database xác nhận');
    scheduleFlush(reason||'save',120);return op;
  }
  function scheduleFlush(reason,ms){clearTimeout(flushTimer);flushTimer=setTimeout(function(){flushQueue(reason).catch(function(e){console.error(e)})},ms==null?180:ms)}
  async function flushQueue(reason){
    if(!enabled()||!navigator.onLine)throw new Error('Chưa có kết nối database; dữ liệu chờ được giữ trên máy.');
    if(configChanging)throw new Error('Đang đổi cấu hình.');
    // If another flush is running, WAIT for it instead of returning early. This
    // is critical for realtime: a remote/same-device signal must never refetch
    // the DB while a newer local batch is still waiting behind the active flush.
    if(flushing&&flushPromise){
      try{await flushPromise}catch(e){}
      var leftAfterWait=await qAll().catch(function(){return []});
      if(leftAfterWait.length)return flushQueue((reason||'flush')+'_after_wait');
      return true;
    }
    flushing=true;
    flushPromise=(async function(){
      var total=0;
      try{
        // Drain until empty because a new save may enter IndexedDB while the
        // previous RPC is in flight.
        while(true){
          var ops=await qAll();
          if(!ops.length)break;
          for(var i=0;i<ops.length;i++){
            var op=ops[i];
            if(!op.target||op.target!==target())throw new Error('Có thao tác chờ chưa xác định đích hoặc thuộc gia đình khác. Đã giữ nguyên để đối chiếu; không gửi.');
            var destination=target();
            var res=await rpc('myb_relational_apply_changes_v1576',{p_sync_id:cfg().syncId||'main',p_device_key:op.deviceKey||dev(),p_changes:op.changes},'Direct relational save');
            if(!res||res.ok!==true)throw new Error('Relational apply trả trạng thái không hợp lệ');
            if(destination!==target())throw new Error('Cấu hình thay đổi khi đang ghi; cần đối chiếu kết quả.');
            await deleteAcknowledged(op.id);total++;
          }
        }
        if(total){var c=cfg();c.lastPushedAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){};log('Đã lưu trực tiếp '+total+' batch vào relational tables','success')}
        lastSaveError='';if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận lưu');if(total)try{maybeDispatchPushAlerts(load())}catch(e){};return true;
      }catch(e){lastSaveError=e.message||String(e);safetyState('pending',lastSaveError);log('Lưu relational trực tiếp thất bại: '+(e.message||e),'error');throw e}
    })();
    try{return await flushPromise}
    finally{flushing=false;flushPromise=null}
  }

  function saveLocalAndQueue(dbObj,reason,renderNow){
    guardSave(dbObj);
    var next=shape(clone(dbObj||{}));next._localUpdatedAt=now();
    var changes=buildChanges(baseline,next);
    if(window.mybSettingsRepository&&changes.some(function(x){return x.entity==='settings'})){if(changes.some(function(x){return x.entity!=='settings'}))throw new Error('Không lưu cài đặt cùng dữ liệu nghiệp vụ qua snapshot.');return mybSettingsRepository.save(next.settings,baseline.settings);}
    if(window.mybPlanningRepository&&changes.some(function(x){return ['diary_entry','appointment','milestone','monthly_notes'].indexOf(x.entity)>=0})){var err=new Error('Nhật ký và kế hoạch được quản lý theo bản ghi. Hãy dùng form tương ứng.');err.code='MYB_SAVE_BLOCKED';throw err}
    if(window.mybCatalogRepository&&changes.some(function(x){return ['milk_container','appointment_type','diary_type'].indexOf(x.entity)>=0})){var err=new Error('Danh mục được quản lý riêng. Hãy dùng màn hình danh mục; không ghi đè bằng snapshot cũ.');err.code='MYB_SAVE_BLOCKED';safeToast(err.message,'warn');throw err}
    if(window.mybCareRepository&&changes.some(function(x){return ['care_event','milk_item'].indexOf(x.entity)>=0})){var e=new Error('Chăm sóc và kho sữa được quản lý riêng. Hãy dùng form chăm sóc; không ghi đè snapshot.');e.code='MYB_SAVE_BLOCKED';safeToast(e.message,'warn');throw e}
    if(window.mybHealthRepository&&changes.some(function(x){return ['health_member','pregnancy'].indexOf(x.entity)>=0})){var e=new Error('Sức khỏe được quản lý theo bản ghi. Không ghi đè hồ sơ bằng snapshot.');e.code='MYB_SAVE_BLOCKED';safeToast(e.message,'warn');throw e}
    // Persist before exposing success or changing memory. Quota errors remain visible.
    try{enqueueChanges(changes,reason||'save')}catch(e){safetyState('error','Không ghi được trên máy: '+e.message);safeToast('Không lưu được; hãy giữ nguyên form.','error');e.code='MYB_SAVE_BLOCKED';throw e}
    cachePut(next);baseline=shape(clone(next));
    if(renderNow!==false){try{render()}catch(e){console.error(e)}}
    return true;
  }
  function scheduleLocalSave(dbObj,reason,renderNow){return saveLocalAndQueue(dbObj,reason,renderNow)}

  function stopLegacy(){
    if(legacyStopped)return;legacyStopped=true;
    try{clearTimeout(window.__mybCloudDbFlushTimer)}catch(e){}
    try{clearTimeout(window.__mybRelationalQueueFlushTimer)}catch(e){}
    try{if(typeof cloudRealtimeStop==='function')cloudRealtimeStop()}catch(e){}
    try{CLOUD_TABLE='__meyeube_sync_RETIRED_V1576__'}catch(e){}
    try{
      var c=cfg();c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;saveCloudConfigToStorage(c);
      localStorage.setItem('mybRelationalReadMode_v1567',JSON.stringify({enabled:false,pendingDelta:false,lastBlockedReason:'V17.2.5_relational_realtime'}));
      localStorage.setItem('mybRelationalWriteQueue_v1568',JSON.stringify({enabled:false,lastBlockedReason:'V17.2.5_relational_realtime'}));
    }catch(e){}
  }

  async function bootstrap(manual){
    if(initialTask&&!startup.ready)return initialTask;
    if(!startup.ready){initialTask=bootstrapRun(manual);try{return await initialTask}finally{initialTask=null}}return bootstrapRun(manual);
  }
  async function bootstrapRun(manual){
    if(booting||categoryBusy)return false;booting=true;stopLegacy();
    var destination=target();
    try{
      if(manual||!startup.ready){startup.ready=false;startupStatus('loading','Đang tải đầy đủ dữ liệu dashboard…');showAppLoading();}
      if(enabled()&&navigator.onLine){
        await flushQueue('bootstrap_pending');
        var revisionBefore=await readRealtimeVersions();var server=await fetchServer();acceptServer(server,destination);realtimeVersions=revisionBefore;
        try{localStorage.removeItem(KEY)}catch(e){};render();
        await new Promise(function(resolve){if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(resolve)});else setTimeout(resolve,0)});
        stabilizing=false;startup.ready=true;startupStatus('ready','Dashboard đã sẵn sàng');hideAppLoading();if(typeof mybHideStartupSplash==='function')mybHideStartupSplash();window.dispatchEvent(new Event('myb:dashboard-ready'));
        var c=cfg();c.lastPulledAt=now();saveCloudConfigToStorage(c);
        safetyState('ready','Đã kết nối database');return true;
      }
      if(!memory){var cached=await cacheGet();if(cached){cachePut(cached);baseline=shape(clone(cached));activeTarget=destination;render()}}
      startupStatus('error','Không có kết nối database. Kiểm tra mạng và cấu hình Cloud Sync rồi thử tải lại.');safetyState('offline','Đang offline · chưa xác nhận dashboard đầy đủ');return false;
    }catch(e){
      lastSaveError=e.message||String(e);
      // Never replace local pending changes after a failed flush.
      if(!memory){var cached2=await cacheGet();if(cached2){cachePut(cached2);baseline=shape(clone(cached2));activeTarget=destination;try{render()}catch(_e){}}}
      startupStatus('error',lastSaveError);safetyState('blocked',lastSaveError);log(lastSaveError,'warn');return false;
    }finally{booting=false;if(manual)try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}
  }

  // ---- V17.2.5 Database-first Realtime ------------------------------------
  // Realtime carries only a tiny "database changed" signal. Business data is
  // NEVER copied through the websocket: every receiving device refetches the
  // authoritative relational state from Supabase before rendering.
  var baseRealtimeStop=window.cloudRealtimeStop;

  function realtimeUiBusy(){
      if(window.mybBackupUi&&mybBackupUi.isBusy())return true;
    try{
      if([window.mybCareRepository,window.mybHealthRepository,window.mybPlanningRepository,window.mybSettingsRepository].some(function(r){return r&&(r.isBusy&&r.isBusy()||r.pending&&r.pending())}))return true;
      if(window.mybScopedUi&&mybScopedUi.hasDraft())return true;
      if(window.mybPlanningUi&&(mybPlanningUi.hasDraft()||mybPlanningUi.isBusy()))return true;var a=document.activeElement;
      if(a&&/^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName||''))return true;
      var b=document.body;
      if(b&&(b.classList.contains('careModalOpen')||b.classList.contains('menuOpen')||b.classList.contains('mybScrollLock')||b.classList.contains('mybBottomSheetLock')))return true;
      if(document.querySelector('.hb2Modal:not(.hidden),#careAdd:not(.hidden),#scheduleAdd:not(.hidden),#milestoneAdd:not(.hidden)'))return true;
      if(document.querySelector('.moreSheet.show,.tfOverlay.show,.streakOverlay.show,.milkBagPickerOverlay.show,.nmSheet.open,.tl8Sheet.show'))return true;
    }catch(e){}
    return false;
  }

  function stopRelationalRealtime(){
    clearTimeout(realtimePullTimer);realtimePullTimer=null;
    if(realtimeSafetyTimer){clearInterval(realtimeSafetyTimer);realtimeSafetyTimer=null}
    realtimeKey='';realtimePending=false;realtimeScopes.clear();
    try{if(typeof baseRealtimeStop==='function')baseRealtimeStop()}catch(e){
      try{if(cloudRealtimeClient&&cloudRealtimeChannel)cloudRealtimeClient.removeChannel(cloudRealtimeChannel)}catch(_e){}
      cloudRealtimeChannel=null;cloudRealtimeClient=null;
    }
  }

  function scheduleRealtimePull(reason,delay,scopes){
    if(!enabled()||!navigator.onLine)return;
    (scopes||[]).forEach(function(k){realtimeScopes.add(k)});realtimePending=true;
    clearTimeout(realtimePullTimer);
    realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime').catch(function(e){console.warn('[V17.2.5] realtime pull failed',e)})},delay==null?280:delay);
  }
  async function pullLatestAfterRealtime(reason,explicitScopes){
    (explicitScopes||[]).forEach(function(k){realtimeScopes.add(k)});
    if(!enabled()||!navigator.onLine)return false;
    if(realtimeRefreshing||realtimeChecking){scheduleRealtimePull('serialized_refresh',800);return false}
    if(realtimeUiBusy()||categoryBusy||configChanging||stabilizing||booting){scheduleRealtimePull('realtime_deferred',900);return false}
    var destination=target(),before;realtimeChecking=true;try{before=await readRealtimeVersions()}finally{realtimeChecking=false}
    if(destination!==target()||configChanging)return false;
    if(before&&realtimeVersions){Object.keys(Object.assign({},before,realtimeVersions)).forEach(function(k){if(before[k]!==realtimeVersions[k])realtimeScopes.add(k)})}
    else realtimeScopes.add('all');
    if(realtimeUiBusy()||categoryBusy||booting||configChanging){scheduleRealtimePull('realtime_deferred',900);return false}
    var requested=Array.from(realtimeScopes);realtimeScopes.clear();realtimePending=false;
    if(!requested.length)return true;
    realtimeRefreshing=true;
    try{
      try{await saveChain}catch(e){}
      var pending=await qAll();if(pending.length)await flushQueue('before_'+(reason||'realtime_pull'));
      // Unknown old signals and absent migration use a conservative full read.
      var repo=window.mybRealtimeRepository,full=!repo||!before||requested.some(function(k){return repo.scopes.indexOf(k)<0});
      var applied;
      if(full){var p=await fetchServer();if(realtimeUiBusy()){requested.forEach(function(k){realtimeScopes.add(k)});realtimePending=true;return false}acceptServer(p,destination);applied=repo?repo.scopes.slice():['all'];if(window.mybRealtimeUi)await mybRealtimeUi.refresh(applied);else render();}
      else{
        var epoch=catalogRevision;
        var values=await Promise.all(requested.map(function(k){return repo.read(k)}));
        if(destination!==target()||configChanging||epoch!==catalogRevision)throw new Error('Dữ liệu hoặc kết nối đã thay đổi khi tải.');
        if(realtimeUiBusy()){requested.forEach(function(k){realtimeScopes.add(k)});realtimePending=true;return false}
        var next=load();requested.forEach(function(k,i){repo.apply(next,k,values[i])});
        if(window.mybPlanningService)mybPlanningService.project(next);
        acceptServer(next,destination);
        requested.forEach(function(k,i){if(k==='settings')mybSettingsRepository.acceptState(values[i])});
        applied=requested;if(window.mybRealtimeUi)await mybRealtimeUi.refresh(applied);else render();
      }
      // A checkpoint taken BEFORE reads ensures a change arriving mid-read is retried.
      realtimeVersions=before;realtimeLastScopes=applied;
      if(window.mybScopedRepository)mybScopedRepository.invalidate();
      var c=cfg();c.lastPulledAt=now();c.lastRealtimeAt=realtimeLastEventAt||now();c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;saveCloudConfigToStorage(c);
      return true;
    }catch(e){requested.forEach(function(k){realtimeScopes.add(k)});realtimePending=true;log('Chưa cập nhật dữ liệu mới: '+(e.message||e),'warn');return false;}
    finally{realtimeRefreshing=false;if(realtimePending||realtimeScopes.size)scheduleRealtimePull('coalesced_realtime',1200);}
  }

  function realtimeHandleEvent(payload){
    try{
      var row=payload&&payload.new?payload.new:null;if(!row)return;
      if(serverFamilyId&&row.family_id!==serverFamilyId)return;
      realtimeLastEventAt=row.created_at||now();
      scheduleRealtimePull('database_change',220,[row.scope||'all']);
    }catch(e){console.warn('[V17.2.5] realtime event error',e)}
  }

  function startRelationalRealtime(){
    var c=cfg();
    if(!c.enabled||!navigator.onLine){try{cloudSetRealtimeState(navigator.onLine?'OFF':'OFFLINE')}catch(e){};return null}
    if(!serverFamilyId){scheduleRealtimePull('realtime_need_family',100);return null}
    if(!window.supabase||typeof window.supabase.createClient!=='function'){
      try{cloudSetRealtimeState('UNAVAILABLE')}catch(e){}
      log('Không tải được thư viện Supabase Realtime; app vẫn tự tải TABLE khi mở lại/foreground.','warn');return null;
    }
    var key=(c.syncId||'main')+'|'+serverFamilyId;
    if(cloudRealtimeChannel&&realtimeKey===key)return cloudRealtimeChannel;
    stopRelationalRealtime();realtimeKey=key;
    try{
      cloudSetRealtimeState('CONNECTING');
      cloudRealtimeClient=window.supabase.createClient(c.url,c.anonKey,{
        auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
        realtime:{params:{eventsPerSecond:10}}
      });
      cloudRealtimeChannel=cloudRealtimeClient
        .channel('myb_rel_v1577_'+serverFamilyId)
        .on('postgres_changes',{
          event:'INSERT',schema:'public',table:'myb_realtime_events',filter:'family_id=eq.'+serverFamilyId
        },realtimeHandleEvent)
        .subscribe(function(status){
          if(status==='SUBSCRIBED'){
            cloudSetRealtimeState('REALTIME');scheduleRealtimePull('subscribed_reconcile',100);
            var c2=cfg();c2.realtime=true;c2.relationalOnly=true;c2.relationalOnlyVersion=V;saveCloudConfigToStorage(c2);
          }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')cloudSetRealtimeState('RETRYING');
          else if(status==='CLOSED')cloudSetRealtimeState('OFF');
        });
      if(!realtimeSafetyTimer)realtimeSafetyTimer=setInterval(function(){
        if(document.visibilityState==='visible'&&navigator.onLine&&enabled())scheduleRealtimePull('realtime_safety_refresh',50);
      },60000);
      return cloudRealtimeChannel;
    }catch(e){
      cloudSetRealtimeState('ERROR');log('Không thể bật Relational Realtime: '+(e.message||e),'warn');return null;
    }
  }

  // ---- Final overrides: all old full-JSON cloud paths are retired. --------
  window.normalize=normalize=function(db){return shape(clone(db||{}))};
  window.load=load=function(){return shape(clone(memory||{}))};
  window.safeWriteDB=safeWriteDB=function(dbObj,reason){return scheduleLocalSave(dbObj,reason||'safeWriteDB',false)};
  window.save=save=function(dbObj){
    var next=shape(clone(dbObj||{}));
    if(!window.mybPlanningService){try{pruneAutoMilestones(next)}catch(e){}try{checkAutoMilestones(next)}catch(e){}}
    guardSave(next);
    scheduleLocalSave(next,'save',true);
    return true;
  };
  window.cloudAutoPush=cloudAutoPush=function(dbObj){return scheduleLocalSave(dbObj||load(),'auto_save',false)};
  window.cloudDbFlush=async function(reason){return flushQueue(reason||'manual_flush')};
  window.cloudUpsertPayload=cloudUpsertPayload=async function(c,payload){await saveLocalAndQueue(payload||load(),'legacy_upsert_redirect',false);await flushQueue('legacy_upsert_redirect');return {result:true,payload:load(),relationalOnly:true}};
  window.cloudFetchRow=cloudFetchRow=async function(){var p=await fetchServer();return {syncId:cfg().syncId||'main',payload:p,updatedAt:now(),relationalOnly:true}};
  window.cloudApplyRemotePayload=cloudApplyRemotePayload=function(){return false};
  window.cloudPersistMergedPayload=cloudPersistMergedPayload=function(){return load()};
  window.cloudMergePayloads=cloudMergePayloads=function(remote,local){return shape(clone(local||remote||{}))};
  window.cloudRealtimeStop=cloudRealtimeStop=stopRelationalRealtime;
  window.cloudRealtimeStart=cloudRealtimeStart=startRelationalRealtime;
  window.cloudRealtimeRestart=cloudRealtimeRestart=function(){stopRelationalRealtime();setTimeout(startRelationalRealtime,120)};
  window.cloudAutoPullOnBoot=cloudAutoPullOnBoot=function(){return bootstrap(false)};
  window.pushLocalToCloud=pushLocalToCloud=async function(){try{showAppLoading()}catch(e){};try{await flushQueue('manual_push');safeToast('Đã ghi các thay đổi trực tiếp vào relational tables','success')}catch(e){safeToast('Ghi relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.pullCloudToLocal=pullCloudToLocal=async function(){return bootstrap(true)};
  window.smartCloudSync=smartCloudSync=async function(){return bootstrap(true)};
  window.testCloudConnection=testCloudConnection=async function(){try{showAppLoading()}catch(e){};try{var p=await fetchServer();safeToast('Relational DB OK · '+((p.careEvents||[]).length)+' ghi nhận chăm sóc','success')}catch(e){safeToast('Test relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};

  var nativeRenderCloud=window.renderCloudConfig||renderCloudConfig;
  window.renderCloudConfig=renderCloudConfig=function(){
    try{nativeRenderCloud()}catch(e){}
    var c=cfg();
    try{if(byId('cloudDbMode')){byId('cloudDbMode').value='0';byId('cloudDbMode').disabled=true}}catch(e){}
    var t=byId('cloudSyncTitle'),s=byId('cloudSyncSubtitle'),p=byId('cloudSyncPill');
    if(t)t.textContent=c.enabled?'Cloud Sync đang bật':'Cloud Sync chưa bật';
    if(s)s.textContent=c.enabled?('Sync ID: '+(c.syncId||'main')+' · Supabase là nguồn chính · tự cập nhật giữa các thiết bị'):'Bật Cloud và nhập Supabase URL/key/Sync ID để đồng bộ dữ liệu.';
    if(p){p.textContent=c.enabled?(cloudRealtimeState==='REALTIME'?'REALTIME':'TABLE'):'OFF';p.classList.toggle('off',!c.enabled)}
    var old=document.getElementById('rel72RescueBox');if(old&&old.parentNode)old.parentNode.removeChild(old);
    var old2=document.getElementById('rel70MilkBox');if(old2&&old2.parentNode)old2.parentNode.removeChild(old2);
    // V17.2.5: bỏ card vận hành kỹ thuật 'Relational + Realtime' khỏi Cloud Sync; runtime vẫn tự đồng bộ nền.
  };

  window.saveCloudConfig=saveCloudConfig=async function(){
    if(configChanging)return false;
    var c=cfg(),previous=clone(c);
    c.enabled=!!(byId('cloudEnabled')&&byId('cloudEnabled').value==='1');
    c.url=(byId('cloudUrl')&&byId('cloudUrl').value.trim())||c.url||CLOUD_DEFAULT_URL;
    c.anonKey=(byId('cloudAnonKey')&&byId('cloudAnonKey').value.trim())||c.anonKey||CLOUD_DEFAULT_KEY;
    c.syncId=(byId('cloudSyncId')&&byId('cloudSyncId').value.trim())||c.syncId||'main';
    configChanging=true;
    try{
      if(window.mybSettingsRepository&&mybSettingsRepository.pending()&&(target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey))throw new Error('Còn cài đặt chưa xác nhận.');
      if(window.mybScopedUi&&mybScopedUi.settingsBusy())throw new Error('Đang lưu cài đặt.');
      if(window.mybPlanningRepository&&mybPlanningRepository.pending()&&(target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey))throw new Error('Còn thao tác nhật ký và kế hoạch chưa xác nhận.');
      if(window.mybPlanningUi&&mybPlanningUi.hasDraft()&&(target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey))throw new Error('Đóng hoặc lưu form kế hoạch trước khi đổi kết nối.');
      if(window.mybHealthRepository&&window.mybHealthRepository.pending()&&(target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey))throw new Error('Còn thao tác sức khỏe chưa xác nhận; kiểm tra trước khi đổi kết nối.');
      if(window.mybCareWorkflow&&mybCareWorkflow.hasUnsafeDraft())throw new Error('Giữ form và lưu nội dung trước khi đổi kết nối.');
      if(window.mybCareRepository&&window.mybCareRepository.pending()&&(target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey))throw new Error('Còn thao tác chăm sóc chưa xác nhận; kiểm tra kết quả trước khi đổi kết nối.');
      if(categoryBusy)throw new Error('Đang lưu danh mục; chờ hoàn tất trước khi đổi cấu hình.');
      if(flushing)throw new Error('Đang ghi database. Chờ hoàn tất trước khi đổi cấu hình.');
      if((target(c)!==target(previous)||c.enabled!==previous.enabled||c.anonKey!==previous.anonKey)&&(await qAll()).length)throw new Error('Còn dữ liệu chờ. Giữ cấu hình hiện tại và xử lý dữ liệu chờ trước.');
      stopRelationalRealtime();
      c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;
      saveCloudConfigToStorage(c);
      if(target(c)!==target(previous)){if(window.mybScopedRepository)mybScopedRepository.reset();memory=null;baseline=null;serverReady=false;serverFamilyId='';activeTarget='';window.__mybCloudDbMemory=null;render()}
      safeToast('Đã lưu cấu hình kết nối','success');
    }catch(e){safeToast(e.message||String(e),'error');return false}
    finally{configChanging=false;try{renderCloudConfig()}catch(e){}}
    if(c.enabled){await bootstrap(true);startRelationalRealtime()}return true;
  };

  // Old rescue/doctor buttons must never rebuild from legacy JSON again.
  window.rel72ServerRescue=async function(){safeToast('V17.2.5 đã khóa cứu từ JSON. Hãy restore bằng SQL direct-table nếu cần.','warn');return {ok:false,status:'retired',version:V,reason:'legacy_json_retired'}};
  window.rel72FastDoctor=async function(){var q=await qAll().catch(function(){return []});var r={ok:true,status:'relational_only',version:V,source:'relational_tables_only',legacy_json_used:false,pending_direct_batches:q.length,message:'V17.2.5 không chạy Duplicate Doctor và không scan meyeube_sync.'};try{var b=document.getElementById('rel72RescueResult');if(b)b.textContent=JSON.stringify(r,null,2)}catch(e){}return r};
  window.rel70MilkIdentityDoctor=window.rel72FastDoctor;
  window.rel72LocalDedupeNow=function(){safeToast('Dedupe local đã bị vô hiệu hóa ở V17.2.5 để không tự sửa dữ liệu sạch.','warn')};

  // Scoped catalog adapter: replaces only acknowledged category fields, never a full UI snapshot.
  var catalogFields={milk_container:'milkContainers',appointment_type:'appointmentTypes',diary_type:'diaryTypes'};
  window.mybCatalogBridge={
    begin:async function(){guardSave(load());categoryBusy=true;catalogRevision++;var handle=target();try{await flushQueue('before_catalog');return handle}catch(e){categoryBusy=false;throw e}},
    end:function(){categoryBusy=false},
    revision:function(){return catalogRevision},
    acceptList:function(field,items,destination,revision){
      if(revision!==catalogRevision)throw new Error("Danh mục đã thay đổi; tải lại danh sách.");
      if(!Object.keys(catalogFields).some(function(k){return catalogFields[k]===field})||destination!==target()||activeTarget!==destination||categoryBusy||booting||realtimeRefreshing)throw new Error('Dữ liệu đang thay đổi; tải lại danh mục.');
      var next=load();next[field]=clone(items);cachePut(next);if(baseline)baseline[field]=clone(items);
    },
    acceptWrite:function(kind,result,destination,handle){
      if(!categoryBusy||destination!==handle||destination!==target())throw new Error('Cấu hình đã đổi trong khi lưu. Hãy tải lại danh mục để đối chiếu.');
      var field=catalogFields[kind];if(!field)throw new Error('Danh mục không hợp lệ.');
      var next=load();next[field]=clone(result.items);baseline[field]=clone(result.items);
      result.changes.filter(function(x){return x.entity==='milk_item'&&x.op==='upsert'}).forEach(function(x){
        [next,baseline].forEach(function(d){var item=arr(d.milkInventory).find(function(b){return String(b.id)===String(x.source_id)});if(item){item.containerName=x.data.containerName;item.updatedAt=x.data.updatedAt}});
      });
      catalogRevision++;cachePut(next);if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận lưu danh mục');
    }
  };

  // The same mutex covers catalog, care, config and realtime. Only ACK rows merge.
  window.mybCareBridge={beginRead:async function(){guardSave(load());categoryBusy=true;catalogRevision++;return target()},uncertain:function(message){safetyState('pending',message)},begin:window.mybCatalogBridge.begin,end:window.mybCatalogBridge.end,
    accept:function(r,destination,handle){
      if(!categoryBusy||destination!==handle||destination!==target())throw new Error('Kết nối đã đổi; cần đối chiếu thao tác.');
      var next=load();
      [next,baseline].forEach(function(db){
        db.careEvents=arr(db.careEvents).filter(function(x){return x.id!==r.eventId});
        if(r.event)db.careEvents.unshift(clone(r.event));
        var deleted=r.deletedMilkIds||[],items=r.milkItems||[];
        db.milkInventory=arr(db.milkInventory).filter(function(x){return deleted.indexOf(x.id)<0&&!items.some(function(y){return y.id===x.id})}).concat(clone(items));
      });if(window.mybPlanningService){mybPlanningService.project(next);mybPlanningService.project(baseline);}catalogRevision++;cachePut(next);if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận lưu');
    }};
  window.mybHealthBridge={begin:window.mybCatalogBridge.begin,end:window.mybCatalogBridge.end,uncertain:function(m){safetyState('pending',m)},
    select:function(id){var next=load();if(!next.hb.members.some(function(m){return m.id===id}))return;next.hb.activeId=id;if(baseline)baseline.hb.activeId=id;cachePut(next)},
    accept:function(r,destination,handle){
      if(!categoryBusy||destination!==handle||destination!==target())throw new Error('Kết nối đã đổi trong khi lưu sức khỏe.');
      var next=load();
      [next,baseline].forEach(function(db){
        if(r.kind==='pregnancy'){db.pregnancy=arr(db.pregnancy).filter(function(x){return x._dbId!==r.rowId});if(r.item)db.pregnancy.unshift(clone(r.item))}
        else if(r.kind==='member'){var previous=db.hb.members.find(function(m){return m._dbId===r.rowId});db.hb.members=db.hb.members.filter(function(m){return m._dbId!==r.rowId});if(r.item){var item=mybHealthService.profile(clone(r.item));['meas','vaccines','visits','meds','labs'].forEach(function(k){item[k]=previous&&previous[k]||[]});db.hb.members.push(item);if(!previous){db.hb.activeId=item.id;try{hb2State.activeId=item.id}catch(e){}}}if(!db.hb.members.some(function(m){return m.id===db.hb.activeId}))db.hb.activeId=(db.hb.members[0]||{}).id||'';}
        else{var member=db.hb.members.find(function(m){return m._dbId===r.memberId});if(!member)throw new Error('Không tìm thấy hồ sơ nhận kết quả.');if(['meas','vaccines','visits','meds','labs'].indexOf(r.kind)<0)throw new Error('Loại dữ liệu không hợp lệ.');member[r.kind]=arr(member[r.kind]).filter(function(x){return x._dbId!==r.rowId});if(r.item)member[r.kind].push(clone(r.item));}
        mybHealthService.project(db);
      });if(window.mybPlanningService){mybPlanningService.project(next);mybPlanningService.project(baseline);}catalogRevision++;cachePut(next);if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận lưu sức khỏe');
    }};
  window.mybPlanningBridge={begin:window.mybCatalogBridge.begin,end:window.mybCatalogBridge.end,uncertain:function(m){safetyState('pending',m)},
    accept:function(r,destination,handle){
      if(!categoryBusy||destination!==handle||destination!==target())throw new Error('Kết nối đã đổi trong khi lưu kế hoạch.');
      var next=load();[next,baseline].forEach(function(db){
        var field={diary:'diary',appointment:'appointments',milestone:'_planningMilestones',month:'_planningMonths'}[r.kind];if(!field)throw new Error('Loại kế hoạch không hợp lệ.');
        db[field]=arr(db[field]).filter(function(x){return x._dbId!==r.rowId});if(r.item)db[field].push(clone(r.item));mybPlanningService.project(db);
      });if(window.mybPlanningService){mybPlanningService.project(next);mybPlanningService.project(baseline);}catalogRevision++;cachePut(next);if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận lưu kế hoạch');
    }};
  window.mybSettingsBridge={begin:mybCatalogBridge.begin,end:mybCatalogBridge.end,
    accept:function(r,destination,handle){if(!categoryBusy||destination!==handle||destination!==target())throw new Error('Kết nối đã đổi trong khi lưu cài đặt.');var next=load();[next,baseline].forEach(function(db){var theme=db.settings.theme,mode=db.settings.themeMode;db.settings=clone(r.settings);if(theme)db.settings.theme=theme;if(mode)db.settings.themeMode=mode});cachePut(next);catalogRevision++;if(window.mybScopedRepository)mybScopedRepository.invalidate();safetyState('saved','Database đã xác nhận cài đặt');}};
  window.mybScopedBridge={deviceTheme:function(){if(memory)mybScopedRepository.applyDevice(memory);if(baseline)mybScopedRepository.applyDevice(baseline)},loadFull:async function(){if(categoryBusy||flushing||configChanging)throw new Error('Đang lưu dữ liệu. Chờ hoàn tất.');var d=target(),n=await fetchServer(true);if(d!==target())throw new Error('Kết nối đã đổi.');cachePut(n);baseline=clone(n);try{render()}catch(e){}},
    mergeAppointments:function(rows,from,to){if(configChanging||categoryBusy)return;var next=load();[next,baseline].forEach(function(db){db.appointments=arr(db.appointments).filter(function(x){return !(x.date>=from&&x.date<=to)&&!rows.some(function(r){return r._dbId===x._dbId})}).concat(clone(rows))});cachePut(next)}};
  // Expose a small diagnostics API.
  window.mybRelationalRealtimeV1577={
    version:V,handleRealtimeEvent:realtimeHandleEvent,start:start,exportRecovery:exportRecovery,fetchServer:fetchServer,flush:flushQueue,queueAll:qAll,queueClear:qClear,
    buildChanges:buildChanges,bootstrap:bootstrap,startRealtime:startRelationalRealtime,stopRealtime:stopRelationalRealtime,pullRealtime:pullLatestAfterRealtime,
    status:async function(){var q=await qAll();return {saveState:window.mybSaveState||null,lastError:lastSaveError,unbound:q.filter(function(x){return !x.target}).length,version:V,enabled:enabled(),syncId:cfg().syncId||'main',familyId:serverFamilyId,pending:q.length,source:'relational_tables_only',realtimeState:cloudRealtimeState,lastRealtimeAt:realtimeLastEventAt,lastRealtimeScopes:realtimeLastScopes,pendingRealtimeScopes:Array.from(realtimeScopes),realtimeRevisionError:realtimeRevisionError,legacyJsonUsed:false}}
  };

  window.addEventListener('error',function(ev){if(ev.error&&ev.error.code==='MYB_SAVE_BLOCKED')ev.preventDefault()});
  var originalToast=window.showToast;
  window.showToast=showToast=function(message,type){
    if(type==='success'&&window.mybSaveState&&window.mybSaveState.state==='pending'&&/thành công|đã (lưu|cập nhật|xóa|xoá|ghi|thêm|chuyển|nhập|hoàn tác)/i.test(message||''))message='Đã ghi trên máy · chờ database xác nhận';
    if(originalToast)return originalToast(message,type);
  };
  stopLegacy();
  try{showAppLoading()}catch(e){}
  try{window.addEventListener('online',function(){flushQueue('online').then(function(){if(!startup.ready)return bootstrap(false);return true}).then(function(){startRelationalRealtime();scheduleRealtimePull('online_refresh',80)}).catch(function(){})})}catch(e){}
  try{window.addEventListener('offline',function(){stopRelationalRealtime();try{cloudSetRealtimeState('OFFLINE')}catch(e){}})}catch(e){}
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){startRelationalRealtime();scheduleRealtimePull('foreground_refresh',120)}})}catch(e){}
  try{window.addEventListener('beforeunload',function(){try{scheduleFlush('beforeunload',0)}catch(e){}})}catch(e){}
  // One startup owner; no delayed repair/reload or timer that exposes partial data.
  setTimeout(start,40);
})();
