/* ============================================================================
   Mẹ Yêu Bé V15.1.0 · CloudSyncCleanupMilkReturnFix
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

  var V='15.1.0';
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

  function now(){return new Date().toISOString()}
  function clone(v){try{return JSON.parse(JSON.stringify(v==null?{}:v))}catch(e){return v||{}}}
  function arr(v){return Array.isArray(v)?v:[]}
  function obj(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
  function str(v){return String(v==null?'':v)}
  function trim(v){return str(v).trim()}
  function safeToast(msg,type){try{showToast(msg,type||'success')}catch(e){try{console.log('[V15.1.0]',msg)}catch(_e){}}}
  function log(msg,type){try{cloudLog(msg,type)}catch(e){if(type)safeToast(msg,type);else console.log('[V15.1.0]',msg)}}
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
    {entity:'health_member',get:function(d){return arr(d.hb&&d.hb.members)}},
    {entity:'care_event',get:function(d){return arr(d.careEvents)}},
    {entity:'milk_item',get:function(d){return arr(d.milkInventory)}},
    {entity:'milk_container',get:function(d){return arr(d.milkContainers)}},
    {entity:'diary_entry',get:function(d){return arr(d.diary)}},
    {entity:'milestone',get:function(d){return arr(d.milestones)}},
    {entity:'appointment',get:function(d){return arr(d.appointments)}},
    {entity:'pregnancy',get:function(d){return arr(d.pregnancy)}},
    {entity:'app_member',get:function(d){return arr(d.members)}},
    {entity:'noise_log',get:function(d){return arr(d.noiseLogs)}},
    {entity:'lux_log',get:function(d){return arr(d.luxLogs)}},
    {entity:'activity_log',get:function(d){return arr(d.activityLog)}},
    {entity:'appointment_type',get:function(d){return arr(d.appointmentTypes)}},
    {entity:'diary_type',get:function(d){return arr(d.diaryTypes)}}
  ];

  function mapDef(def,db){
    var m=new Map(); def.get(db).forEach(function(x,i){var k=sourceId(x,def.entity,i);if(k)m.set(k,x)}); return m;
  }
  function buildChanges(before,after){
    before=shape(clone(before||{})); after=shape(clone(after||{}));
    var out=[];
    if(stable(before.settings)!==stable(after.settings))out.push({entity:'settings',op:'upsert',source_id:'settings',data:clone(after.settings)});
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
    return fetch(url,{method:'POST',headers:headers,body:JSON.stringify(args||{})}).then(async function(res){
      var text=await res.text(),data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
      if(!res.ok)throw new Error((label||name)+' lỗi '+res.status+': '+(typeof data==='string'?data:JSON.stringify(data||{})));
      return data;
    });
  }

  function openQ(){return new Promise(function(resolve,reject){
    if(!window.indexedDB){reject(new Error('IndexedDB unavailable'));return}
    var r=indexedDB.open(QUEUE_DB,1);
    r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains(QUEUE_STORE))d.createObjectStore(QUEUE_STORE,{keyPath:'id'})};
    r.onsuccess=function(){resolve(r.result)};r.onerror=function(){reject(r.error||new Error('Không mở được direct queue'))};
  })}
  function qPut(op){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).put(op);tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}
  function qDel(id){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).delete(id);tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}
  function qAll(){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readonly'),r=tx.objectStore(QUEUE_STORE).getAll();r.onsuccess=function(){var x=arr(r.result).sort(function(a,b){return str(a.createdAt).localeCompare(str(b.createdAt))});try{d.close()}catch(e){}resolve(x)};r.onerror=function(){try{d.close()}catch(e){}reject(r.error)}})})}
  function qClear(){return openQ().then(function(d){return new Promise(function(resolve,reject){var tx=d.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).clear();tx.oncomplete=function(){try{d.close()}catch(e){}resolve(true)};tx.onerror=function(){try{d.close()}catch(e){}reject(tx.error)}})})}

  function cachePut(db){
    memory=shape(clone(db||{})); memory._relationalCacheAt=now(); window.__mybCloudDbMemory=memory;
    try{if(typeof window.mybCloudDbPutCacheV1554==='function')window.mybCloudDbPutCacheV1554(memory).catch(function(){})}catch(e){}
    try{localStorage.setItem(CACHE_META,JSON.stringify({version:V,mode:'relational-only',syncId:cfg().syncId||'main',cachedAt:now()}))}catch(e){}
    return memory;
  }
  async function cacheGet(){
    try{if(typeof window.mybCloudDbGetCacheV1554==='function'){var c=await window.mybCloudDbGetCacheV1554();if(c)return shape(clone(c))}}catch(e){}
    try{var r=localStorage.getItem(KEY);if(r)return shape(JSON.parse(r))}catch(e){}
    return null;
  }

  async function fetchServer(){
    var c=cfg();var res=await rpc('myb_relational_export_state_v1576',{p_sync_id:c.syncId||'main'},'Relational export');
    if(!res||res.ok!==true||!res.payload)throw new Error((res&&res.message)||'Server chưa có relational state V15.0.76+');
    serverFamilyId=trim(res.family_id||serverFamilyId);
    var n=shape(clone(res.payload));n._relationalCounts=res.counts||{};n._relationalLoadedAt=now();n._relationalFamilyId=serverFamilyId;return n;
  }

  async function enqueueChanges(changes,reason){
    if(!changes.length)return null;
    var op={id:'r1576_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),createdAt:now(),deviceKey:dev(),reason:reason||'save',changes:changes};
    await qPut(op);scheduleFlush(reason||'save',120);return op;
  }
  function scheduleFlush(reason,ms){clearTimeout(flushTimer);flushTimer=setTimeout(function(){flushQueue(reason).catch(function(e){console.error(e)})},ms==null?180:ms)}
  async function flushQueue(reason){
    if(!enabled()||!navigator.onLine)return false;
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
            var res=await rpc('myb_relational_apply_changes_v1576',{p_sync_id:cfg().syncId||'main',p_device_key:op.deviceKey||dev(),p_changes:op.changes},'Direct relational save');
            if(!res||res.ok!==true)throw new Error('Relational apply trả trạng thái không hợp lệ');
            await qDel(op.id);total++;
          }
        }
        if(total){var c=cfg();c.lastPushedAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){};log('Đã lưu trực tiếp '+total+' batch vào relational tables','success')}
        return true;
      }catch(e){log('Lưu relational trực tiếp thất bại: '+(e.message||e),'error');throw e}
    })();
    try{return await flushPromise}
    finally{flushing=false;flushPromise=null}
  }

  async function saveLocalAndQueue(dbObj,reason,renderNow){
    var next=shape(clone(dbObj||{}));next._localUpdatedAt=now();next._relationalOnly=true;next._relationalVersion=V;
    var before=baseline?shape(clone(baseline)):shape({});
    var changes=baseline?buildChanges(before,next):[];
    cachePut(next);
    if(renderNow!==false){try{render()}catch(e){}}
    // Until the first relational server state is loaded, never infer a delta from
    // an old/pre-cutover local cache. This prevents a corrupted V15.0.75 cache
    // from being uploaded during the first seconds after deployment.
    if(!serverReady||stabilizing){log('Đang chờ relational cutover ổn định; chưa gửi dữ liệu local cũ lên Cloud.','warn');return true}
    if(enabled()&&changes.length){
      try{await enqueueChanges(changes,reason||'save');baseline=shape(clone(next))}
      catch(e){log('Không ghi được direct queue: '+(e.message||e),'error');throw e}
    }else baseline=shape(clone(next));
    return true;
  }
  function scheduleLocalSave(dbObj,reason,renderNow){
    var snap=clone(dbObj||{});
    saveChain=saveChain.then(function(){return saveLocalAndQueue(snap,reason,renderNow)}).catch(function(e){console.error('V15.1.0 local save pipeline failed',e)});
    return true;
  }

  function stopLegacy(){
    if(legacyStopped)return;legacyStopped=true;
    try{clearTimeout(window.__mybCloudDbFlushTimer)}catch(e){}
    try{clearTimeout(window.__mybRelationalQueueFlushTimer)}catch(e){}
    try{if(typeof cloudRealtimeStop==='function')cloudRealtimeStop()}catch(e){}
    try{CLOUD_TABLE='__meyeube_sync_RETIRED_V1576__'}catch(e){}
    try{
      var c=cfg();c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;saveCloudConfigToStorage(c);
      localStorage.setItem('mybRelationalReadMode_v1567',JSON.stringify({enabled:false,pendingDelta:false,lastBlockedReason:'V15.1.0_relational_realtime'}));
      localStorage.setItem('mybRelationalWriteQueue_v1568',JSON.stringify({enabled:false,lastBlockedReason:'V15.1.0_relational_realtime'}));
    }catch(e){}
  }

  async function bootstrap(manual){
    if(booting)return;booting=true;stopLegacy();
    try{
      if(manual)try{showAppLoading()}catch(e){}
      // Never push the pre-cutover local cache on first boot. The freshly restored
      // relational server is authoritative. Only already queued V15.0.76 deltas
      // are allowed to flush.
      try{await flushQueue('bootstrap_pending_v1576')}catch(e){}
      if(enabled()&&navigator.onLine){
        var server=await fetchServer();cachePut(server);baseline=shape(clone(server));serverReady=true;try{localStorage.removeItem(KEY)}catch(e){};try{render()}catch(e){};
        var c=cfg();c.lastPulledAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;saveCloudConfigToStorage(c);
        log('Đã tải dữ liệu từ relational tables · JSON DB đã nghỉ','success');
      }else{
        var cached=await cacheGet();if(cached){cachePut(cached);baseline=shape(clone(cached));serverReady=false;try{render()}catch(e){};log('Đang dùng cache offline; Cloud chính vẫn là relational tables','warn')}
      }
    }catch(e){
      console.error('V15.1.0 relational bootstrap failed',e);
      var cached2=await cacheGet();if(cached2){cachePut(cached2);baseline=shape(clone(cached2));serverReady=false;try{render()}catch(_e){};log('Không tải được relational server, đang dùng cache offline: '+(e.message||e),'warn')}else log('Không tải được relational server: '+(e.message||e),'error');
    }finally{booting=false;if(manual)try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}
  }

  // ---- V15.1.0 Database-first Realtime ------------------------------------
  // Realtime carries only a tiny "database changed" signal. Business data is
  // NEVER copied through the websocket: every receiving device refetches the
  // authoritative relational state from Supabase before rendering.
  var baseRealtimeStop=window.cloudRealtimeStop;

  function realtimeUiBusy(){
    try{
      var a=document.activeElement;
      if(a&&/^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName||''))return true;
      var b=document.body;
      if(b&&(b.classList.contains('careModalOpen')||b.classList.contains('menuOpen')||b.classList.contains('mybScrollLock')||b.classList.contains('mybBottomSheetLock')))return true;
      if(document.querySelector('.moreSheet.show,.tfOverlay.show,.streakOverlay.show,.milkBagPickerOverlay.show,.nmSheet.open,.tl8Sheet.show'))return true;
    }catch(e){}
    return false;
  }

  function stopRelationalRealtime(){
    clearTimeout(realtimePullTimer);realtimePullTimer=null;
    if(realtimeSafetyTimer){clearInterval(realtimeSafetyTimer);realtimeSafetyTimer=null}
    realtimeKey='';
    try{if(typeof baseRealtimeStop==='function')baseRealtimeStop()}catch(e){
      try{if(cloudRealtimeClient&&cloudRealtimeChannel)cloudRealtimeClient.removeChannel(cloudRealtimeChannel)}catch(_e){}
      cloudRealtimeChannel=null;cloudRealtimeClient=null;
    }
  }

  function scheduleRealtimePull(reason,delay){
    if(!enabled()||!navigator.onLine)return;
    realtimePending=true;
    clearTimeout(realtimePullTimer);
    realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime').catch(function(e){console.warn('[V15.1.0] realtime pull failed',e)})},delay==null?280:delay);
  }

  async function pullLatestAfterRealtime(reason){
    if(realtimeRefreshing){realtimePending=true;return false}
    if(realtimeUiBusy()){
      realtimePending=true;
      clearTimeout(realtimePullTimer);
      realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime_deferred').catch(function(){})},900);
      return false;
    }
    realtimeRefreshing=true;realtimePending=false;
    try{
      // A local edit always wins its trip to the server first. If it cannot be
      // flushed we do NOT replace memory with remote state and risk losing it.
      try{await saveChain}catch(e){}
      var pending=await qAll().catch(function(){return []});
      if(pending.length)await flushQueue('before_'+(reason||'realtime_pull'));
      var p=await fetchServer();
      cachePut(p);baseline=shape(clone(p));serverReady=true;
      var c=cfg();c.lastPulledAt=now();c.lastRealtimeAt=realtimeLastEventAt||now();c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;saveCloudConfigToStorage(c);
      try{render()}catch(e){}
      try{renderCloudConfig()}catch(e){}
      return true;
    }catch(e){
      log('Realtime nhận tín hiệu nhưng tải TABLE thất bại: '+(e.message||e),'warn');
      return false;
    }finally{
      realtimeRefreshing=false;
      if(realtimePending)scheduleRealtimePull('coalesced_realtime',420);
    }
  }

  function realtimeHandleEvent(payload){
    try{
      var row=payload&&payload.new?payload.new:null;if(!row)return;
      realtimeLastEventAt=row.created_at||now();
      scheduleRealtimePull('database_change',220);
    }catch(e){console.warn('[V15.1.0] realtime event error',e)}
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
            cloudSetRealtimeState('REALTIME');
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
  window.load=load=function(){return shape(clone(memory||window.__mybCloudDbMemory||{}))};
  window.safeWriteDB=safeWriteDB=function(dbObj,reason){return scheduleLocalSave(dbObj,reason||'safeWriteDB',false)};
  window.save=save=function(dbObj){
    var next=shape(clone(dbObj||{}));
    try{pruneAutoMilestones(next)}catch(e){}
    try{checkAutoMilestones(next)}catch(e){}
    scheduleLocalSave(next,'save',true);
    try{maybeDispatchPushAlerts(next)}catch(e){}
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
  window.pullCloudToLocal=pullCloudToLocal=async function(){try{showAppLoading()}catch(e){};try{await flushQueue('before_manual_pull');var p=await fetchServer();cachePut(p);baseline=shape(clone(p));serverReady=true;render();safeToast('Đã tải lại dữ liệu trực tiếp từ relational tables','success')}catch(e){safeToast('Tải relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.smartCloudSync=smartCloudSync=async function(){try{showAppLoading()}catch(e){};try{await flushQueue('smart_sync');var p=await fetchServer();cachePut(p);baseline=shape(clone(p));serverReady=true;render();safeToast('Đã đồng bộ relational tables','success')}catch(e){safeToast('Đồng bộ relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
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
    // V15.1.0: bỏ card vận hành kỹ thuật 'Relational + Realtime' khỏi Cloud Sync; runtime vẫn tự đồng bộ nền.
  };

  window.saveCloudConfig=saveCloudConfig=function(){
    try{
      var c=cfg();
      c.enabled=(byId('cloudEnabled')&&byId('cloudEnabled').value==='1');
      c.url=(byId('cloudUrl')&&byId('cloudUrl').value.trim())||c.url||CLOUD_DEFAULT_URL;
      c.anonKey=(byId('cloudAnonKey')&&byId('cloudAnonKey').value.trim())||c.anonKey||CLOUD_DEFAULT_KEY;
      c.syncId=(byId('cloudSyncId')&&byId('cloudSyncId').value.trim())||c.syncId||'main';
      c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;
      saveCloudConfigToStorage(c);stopLegacy();renderCloudConfig();safeToast('Đã lưu cấu hình Cloud Sync','success');if(c.enabled)bootstrap(true).then(function(){startRelationalRealtime()});
    }catch(e){safeToast('Lưu cấu hình thất bại: '+(e.message||e),'error')}
  };

  // Old rescue/doctor buttons must never rebuild from legacy JSON again.
  window.rel72ServerRescue=async function(){safeToast('V15.1.0 đã khóa cứu từ JSON. Hãy restore bằng SQL direct-table nếu cần.','warn');return {ok:false,status:'retired',version:V,reason:'legacy_json_retired'}};
  window.rel72FastDoctor=async function(){var q=await qAll().catch(function(){return []});var r={ok:true,status:'relational_only',version:V,source:'relational_tables_only',legacy_json_used:false,pending_direct_batches:q.length,message:'V15.1.0 không chạy Duplicate Doctor và không scan meyeube_sync.'};try{var b=document.getElementById('rel72RescueResult');if(b)b.textContent=JSON.stringify(r,null,2)}catch(e){}return r};
  window.rel70MilkIdentityDoctor=window.rel72FastDoctor;
  window.rel72LocalDedupeNow=function(){safeToast('Dedupe local đã bị vô hiệu hóa ở V15.1.0 để không tự sửa dữ liệu sạch.','warn')};

  // Expose a small diagnostics API.
  window.mybRelationalRealtimeV1577={
    version:V,fetchServer:fetchServer,flush:flushQueue,queueAll:qAll,queueClear:qClear,
    buildChanges:buildChanges,bootstrap:bootstrap,startRealtime:startRelationalRealtime,stopRealtime:stopRelationalRealtime,pullRealtime:pullLatestAfterRealtime,
    status:async function(){var q=await qAll().catch(function(){return []});return {version:V,enabled:enabled(),syncId:cfg().syncId||'main',familyId:serverFamilyId,pending:q.length,source:'relational_tables_only',realtimeState:cloudRealtimeState,lastRealtimeAt:realtimeLastEventAt,legacyJsonUsed:false}}
  };

  stopLegacy();
  try{showAppLoading()}catch(e){}
  try{setTimeout(function(){try{cloudRealtimeStop()}catch(e){}},350)}catch(e){}
  try{window.addEventListener('online',function(){flushQueue('online').then(function(){return bootstrap(false)}).then(function(){startRelationalRealtime();scheduleRealtimePull('online_refresh',80)}).catch(function(){})})}catch(e){}
  try{window.addEventListener('offline',function(){stopRelationalRealtime();try{cloudSetRealtimeState('OFFLINE')}catch(e){}})}catch(e){}
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){startRelationalRealtime();scheduleRealtimePull('foreground_refresh',120)}})}catch(e){}
  try{window.addEventListener('beforeunload',function(){try{scheduleFlush('beforeunload',0)}catch(e){}})}catch(e){}
  // First authoritative load happens immediately. V15.0.74/V15.0.75 left two
  // one-shot local-repair timers at ~800ms/~1000ms, so do one FINAL server reload
  // after they have fired before allowing any row delta to leave this device.
  setTimeout(function(){bootstrap(false)},40);
  setTimeout(function finalCutoverReload(){
    if(booting){setTimeout(finalCutoverReload,300);return}
    bootstrap(false).finally(function(){stabilizing=false;startRelationalRealtime();try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}});
  },1600);
  setTimeout(function(){if(stabilizing){stabilizing=false;try{hideAppLoading()}catch(e){}}},4200);
})();
