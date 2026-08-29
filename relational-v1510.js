/* ============================================================================
   Mẹ Yêu Bé V15.1.0 · RealtimeConnectionStabilityFix
   ---------------------------------------------------------------------------
   Source of truth: Supabase RELATIONAL TABLES ONLY.
   - No JSON migration / Doctor / Delta Sync / Read Mode / Write Queue / Push Primary.
   - No persistent business write queue on the device.
   - Save = direct RPC to relational tables, then refetch ONLY changed sections.
   - Realtime is a lightweight signal; catch-up reads only changed sections, never periodic full DB polling.
   - UI/cache uses Vietnamese decimal comma for health measurements (5,2 kg).
   ============================================================================ */
(function(){
  if(window.__MYB_RELATIONAL_REALTIME_V1510__)return;
  window.__MYB_RELATIONAL_REALTIME_V1510__=true;

  var V='15.1.0';
  var CACHE_META='meYeuBeRelationalOnlyMeta_v1510';
  var memory=null;
  var baseline=null;
  var booting=false;
  var saveChain=Promise.resolve();
  var saveInFlight=false;
  var legacyStopped=false;
  var serverReady=false;
  var stabilizing=true;
  var serverFamilyId='';
  var realtimeKey='';
  var realtimePullTimer=null;
  var realtimeRefreshing=false;
  var realtimePending=false;
  var realtimeLastEventAt='';
  var realtimeReconnectTimer=null;
  var realtimeReconnectAttempt=0;
  var realtimeGeneration=0;
  var realtimeReconnectCount=0;
  var realtimeIgnoredStaleCallbacks=0;
  var realtimeLastSubscribedAt='';
  var realtimeLastDisconnectReason='';
  var realtimeStopping=false;
  var pendingRealtimeRevision=null;
  var baselineRevision=0;
  var guardReady=false;
  var conflictCount=0;
  var lastConflictAt='';
  var lastAuthoritativeAt='';
  var onlineDeviceCount=0;
  var deviceCount=0;
  var presenceTimer=null;
  var lastOperationId='';
  var lastScheduledFingerprint='';
  var lastScheduledAt=0;
  var egressReady=false;
  var pendingLegacyRealtime=false;
  var fullPullCount=0;
  var incrementalPullCount=0;
  var catchupCheckCount=0;
  var fullPullBytes=0;
  var incrementalPullBytes=0;
  var lastIncrementalEntities=[];

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

  function uuid(){
    try{if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID()}catch(e){}
    var a=new Uint8Array(16);try{crypto.getRandomValues(a)}catch(e){for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256)}
    a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
    var h=Array.from(a,function(x){return x.toString(16).padStart(2,'0')}).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  }
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function isMissingV1580Rpc(e){var m=String(e&&e.message||e||'');return /404|PGRST202|Could not find the function|schema cache/i.test(m)}

  function decimalComma(v){
    if(v===undefined||v===null||v==='')return v==null?'':v;
    var s=String(v).trim();
    if(!s)return '';
    return s.indexOf('.')>=0?s.replace('.',','):s;
  }
  function localizeHealthDecimals(db){
    try{
      arr(db.hb&&db.hb.members).forEach(function(m){
        if(!m)return;
        if(m.weight!==undefined)m.weight=decimalComma(m.weight);
        if(m.height!==undefined)m.height=decimalComma(m.height);
        arr(m.meas).forEach(function(x){if(!x)return;if(x.weight!==undefined)x.weight=decimalComma(x.weight);if(x.height!==undefined)x.height=decimalComma(x.height);if(x.head!==undefined)x.head=decimalComma(x.head)});
      });
      arr(db.baby).forEach(function(x){if(!x)return;if(x.weight!==undefined)x.weight=decimalComma(x.weight);if(x.length!==undefined)x.length=decimalComma(x.length);if(x.height!==undefined)x.height=decimalComma(x.height);if(x.head!==undefined)x.head=decimalComma(x.head)});
      arr(db.mom).forEach(function(x){if(!x)return;if(x.weight!==undefined)x.weight=decimalComma(x.weight)});
    }catch(e){}
    return db;
  }

  // Defaults/shape only. No merge, dedupe, rescue or legacy repair.
  function shape(db){
    db=obj(db)?db:{};
    db.settings=obj(db.settings)?db.settings:{};
    db.hb=obj(db.hb)?db.hb:{};db.hb.members=arr(db.hb.members);
    ['pregnancy','baby','mom','diary','healthBook','appointments','milestones','careEvents','milkInventory','noiseLogs','luxLogs','members','activityLog','familyInvites'].forEach(function(k){db[k]=arr(db[k])});
    if(!Array.isArray(db.appointmentTypes)){try{db.appointmentTypes=defaultAppointmentTypes()}catch(e){db.appointmentTypes=[]}}
    if(!Array.isArray(db.diaryTypes)){try{db.diaryTypes=defaultDiaryTypes()}catch(e){db.diaryTypes=[]}}
    if(!Array.isArray(db.milkContainers)){try{db.milkContainers=defaultMilkContainers()}catch(e){db.milkContainers=[]}}
    db.monthlyNotes=obj(db.monthlyNotes)?db.monthlyNotes:{};
    db.permissions=obj(db.permissions)?db.permissions:{};
    db._relationalOnly=true;
    db._relationalVersion=V;
    return localizeHealthDecimals(db);
  }

  function stable(v){
    if(v===undefined)return 'u';if(v===null)return 'n';
    if(typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
    var ks=Object.keys(v).filter(function(k){
      return !/^_(cloud|sync|local|relational|lastCloud|cloudDb|merge|memberRepair|saveConflict)/i.test(k)&&k!=='updatedAt'&&k!=='_swipeOpen'&&k!=='_idx';
    }).sort();
    return '{'+ks.map(function(k){return JSON.stringify(k)+':'+stable(v[k])}).join(',')+'}';
  }

  function sourceId(item,kind,index){
    item=obj(item)?item:{};
    var id=trim(item.id);if(id)return id;
    var ca=trim(item.createdAt);if(ca)return ca;
    var ts=trim(item.ts);if(ts)return ts;
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
  function mapDef(def,db){var m=new Map();def.get(db).forEach(function(x,i){var k=sourceId(x,def.entity,i);if(k)m.set(k,x)});return m}
  function buildChanges(before,after){
    before=shape(clone(before||{}));after=shape(clone(after||{}));var out=[];
    if(stable(before.settings)!==stable(after.settings))out.push({entity:'settings',op:'upsert',source_id:'settings',data:clone(after.settings)});
    defs.forEach(function(def){var a=mapDef(def,before),b=mapDef(def,after);a.forEach(function(v,k){if(!b.has(k))out.push({entity:def.entity,op:'delete',source_id:k,data:{id:k}})});b.forEach(function(v,k){if(!a.has(k)||stable(a.get(k))!==stable(v))out.push({entity:def.entity,op:'upsert',source_id:k,data:clone(v)})})});
    if(stable(before.monthlyNotes)!==stable(after.monthlyNotes))out.push({entity:'monthly_notes',op:'upsert',source_id:'monthly_notes',data:clone(after.monthlyNotes)});
    return out;
  }

  function rpc(name,args,label){
    var c=cfg();if(!c.url||!c.anonKey||!c.syncId)return Promise.reject(new Error('Thiếu URL, Publishable key hoặc Sync ID'));
    var url=String(c.url).replace(/\/+$/,'')+'/rest/v1/rpc/'+name;
    var headers={'apikey':c.anonKey,'Authorization':'Bearer '+c.anonKey,'Content-Type':'application/json'};
    return fetch(url,{method:'POST',headers:headers,body:JSON.stringify(args||{})}).then(async function(res){
      var text=await res.text(),data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
      if(!res.ok)throw new Error((label||name)+' lỗi '+res.status+': '+(typeof data==='string'?data:JSON.stringify(data||{})));
      return data;
    });
  }
  function approxBytes(v){try{return new TextEncoder().encode(JSON.stringify(v==null?{}:v)).length}catch(e){try{return JSON.stringify(v||{}).length}catch(_e){return 0}}}
  function fmtBytes(n){n=Number(n||0);if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(2)+' MB'}
  function uniqueStrings(xs){var o=[],s={};arr(xs).forEach(function(x){x=trim(x);if(x&&!s[x]){s[x]=1;o.push(x)}});return o}
  function entitiesFromChanges(changes){return uniqueStrings(arr(changes).map(function(x){return x&&x.entity}))}

  function cachePut(db){
    memory=shape(clone(db||{}));memory._relationalCacheAt=now();window.__mybCloudDbMemory=memory;
    try{if(typeof window.mybCloudDbPutCacheV1554==='function')window.mybCloudDbPutCacheV1554(memory).catch(function(){})}catch(e){}
    try{localStorage.setItem(CACHE_META,JSON.stringify({version:V,mode:'relational-incremental-cache',syncId:cfg().syncId||'main',cachedAt:now(),revision:baselineRevision}))}catch(e){}
    return memory;
  }
  async function cacheGet(){
    try{if(typeof window.mybCloudDbGetCacheV1554==='function'){var c=await window.mybCloudDbGetCacheV1554();if(c)return shape(clone(c))}}catch(e){}
    return null;
  }
  function applyRuntimeMeta(res){
    if(!res)return;
    serverFamilyId=trim(res.family_id||serverFamilyId);
    conflictCount=Number(res.conflict_count||conflictCount||0)||0;
    lastConflictAt=trim(res.last_conflict_at||lastConflictAt);
    onlineDeviceCount=Number(res.online_device_count===undefined?onlineDeviceCount:res.online_device_count)||0;
    deviceCount=Number(res.device_count===undefined?deviceCount:res.device_count)||0;
    lastOperationId=trim(res.last_operation_id||lastOperationId);
  }

  async function fetchServerFull(){
    var c=cfg(),res=null;
    try{
      res=await rpc('myb_relational_export_state_v1580',{p_sync_id:c.syncId||'main'},'Relational full export V15.0.80');
      egressReady=true;guardReady=true;
    }catch(e){
      if(!isMissingV1580Rpc(e))throw e;
      res=await rpc('myb_relational_export_state_v1579',{p_sync_id:c.syncId||'main'},'Relational V15.0.79 fallback read');
      egressReady=false;guardReady=false;
    }
    fullPullCount++;fullPullBytes+=approxBytes(res);
    if(!res||res.ok!==true||!res.payload)throw new Error((res&&res.message)||'Server chưa có relational state');
    applyRuntimeMeta(res);
    baselineRevision=Number(res.revision||0)||0;
    var n=shape(clone(res.payload));
    n._relationalCounts=res.counts||{};n._relationalLoadedAt=now();n._relationalFamilyId=serverFamilyId;n._relationalRevision=baselineRevision;n._relationalGuardReady=guardReady;n._relationalEgressMode=egressReady?'incremental':'fallback_full';
    return n;
  }

  async function fetchRevision(){
    var r=await rpc('myb_relational_revision_v1580',{p_sync_id:cfg().syncId||'main'},'Relational revision check');
    catchupCheckCount++;egressReady=true;guardReady=true;applyRuntimeMeta(r);return r;
  }

  async function fetchChangesSince(sinceRevision){
    var r=await rpc('myb_relational_changes_since_v1580',{p_sync_id:cfg().syncId||'main',p_since_revision:Number(sinceRevision||0)},'Incremental change map');
    catchupCheckCount++;egressReady=true;guardReady=true;applyRuntimeMeta(r);return r;
  }

  async function fetchIncremental(entities){
    entities=uniqueStrings(entities);if(!entities.length)return null;
    var r=await rpc('myb_relational_export_incremental_v1580',{p_sync_id:cfg().syncId||'main',p_entities:entities},'Incremental relational export');
    incrementalPullCount++;incrementalPullBytes+=approxBytes(r);egressReady=true;guardReady=true;applyRuntimeMeta(r);return r;
  }

  async function refreshFull(reason,renderNow){
    var p=await fetchServerFull();cachePut(p);baseline=shape(clone(p));serverReady=true;lastAuthoritativeAt=now();
    var c=cfg();c.lastPulledAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){}
    if(renderNow!==false){try{render()}catch(e){}}
    try{renderCloudConfig()}catch(e){}
    return p;
  }

  function mergePartialPayload(partial,newRevision){
    var base=shape(clone(memory||baseline||{}));partial=obj(partial)?partial:{};
    Object.keys(partial).forEach(function(k){base[k]=clone(partial[k])});
    base=shape(base);base._relationalLoadedAt=now();base._relationalFamilyId=serverFamilyId;base._relationalRevision=Number(newRevision||baselineRevision)||0;base._relationalGuardReady=true;base._relationalEgressMode='incremental';
    baselineRevision=base._relationalRevision;cachePut(base);baseline=shape(clone(base));serverReady=true;lastAuthoritativeAt=now();
    return base;
  }

  async function refreshIncremental(entities,reason,renderNow,coveredRevision){
    entities=uniqueStrings(entities);if(!entities.length)return true;
    var r=await fetchIncremental(entities);
    if(!r||r.ok!==true||!r.payload)throw new Error((r&&r.message)||'Incremental export không hợp lệ');
    if(r.requires_full===true)return refreshFull((reason||'incremental')+'_server_full_fallback',renderNow);
    lastIncrementalEntities=entities.slice();
    var covered=(coveredRevision===undefined||coveredRevision===null)?(Number(r.revision||baselineRevision)||baselineRevision):(Number(coveredRevision)||baselineRevision);
    mergePartialPayload(r.payload,covered);
    var c=cfg();c.lastPulledAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){}
    if(renderNow!==false){try{render()}catch(e){}}
    try{renderCloudConfig()}catch(e){}
    return true;
  }

  async function catchUpSinceRevision(reason,renderNow){
    if(!enabled()||!navigator.onLine)return false;
    var from=Number(baselineRevision||0)||0;
    var m=await fetchChangesSince(from);
    var current=Number(m&&m.current_revision||0)||0;
    if(current<=from){applyRuntimeMeta(m);try{renderCloudConfig()}catch(e){};return true}
    if(m.requires_full===true){
      log('Incremental history không đủ ('+(m.reason||'unknown')+'); chỉ lần này tải full để tự phục hồi.','warn');
      return refreshFull((reason||'catchup')+'_gap_fallback',renderNow);
    }
    var entities=uniqueStrings(m.entities||[]);
    if(!entities.length)return refreshFull((reason||'catchup')+'_empty_map_fallback',renderNow);
    return refreshIncremental(entities,reason||'catchup',renderNow,current);
  }

  async function guardedWrite(changes,operationId,baseRevision){
    var args={p_sync_id:cfg().syncId||'main',p_device_key:dev(),p_operation_id:operationId,p_base_revision:baseRevision,p_changes:changes};
    var lastErr=null;
    for(var attempt=0;attempt<2;attempt++){
      try{return await rpc('myb_relational_apply_changes_v1580',args,'Guarded incremental relational save')}
      catch(e){lastErr=e;if(isMissingV1580Rpc(e))throw e;if(attempt===0){await sleep(420);continue}throw e}
    }
    throw lastErr||new Error('guarded_write_failed');
  }

  async function directSaveSnapshot(snapshot,reason){
    var next=shape(clone(snapshot||{}));next._relationalOnly=true;next._relationalVersion=V;
    if(!serverReady||stabilizing){log('Đang chờ Database First khởi tạo xong; không gửi cache cũ lên server.','warn');return true}
    if(!guardReady||!egressReady){
      if(baseline){cachePut(baseline);try{render()}catch(e){}}
      safeToast('Chưa lưu: cần chạy SUPABASE_EGRESS_V15.0.80.sql trước khi ghi dữ liệu.','error');
      throw new Error('v1580_sql_patch_required');
    }
    if(!enabled()||!navigator.onLine){
      if(baseline){cachePut(baseline);try{render()}catch(e){}}
      safeToast('Chưa lưu: thiết bị đang offline hoặc Cloud chưa bật. Dữ liệu server không bị thay đổi.','error');
      throw new Error('offline_or_cloud_disabled');
    }
    var before=baseline?shape(clone(baseline)):shape({});
    var changes=buildChanges(before,next);
    if(!changes.length)return true;
    var entities=entitiesFromChanges(changes),operationId=uuid(),baseRevision=baselineRevision;
    saveInFlight=true;
    try{
      var res=await guardedWrite(changes,operationId,baseRevision);
      if(res&&res.status==='conflict'){
        conflictCount=Math.max(conflictCount+1,Number(res.conflict_count||0)||0);lastConflictAt=now();
        await catchUpSinceRevision('conflict_guard_catchup',true);
        safeToast('Dữ liệu vừa thay đổi trên thiết bị khác. Đã tải phần thay đổi mới nhất và KHÔNG ghi đè thao tác cũ.','error');
        var ce=new Error('revision_conflict');ce.code='MYB_CONFLICT';throw ce;
      }
      if(!res||res.ok!==true)throw new Error((res&&res.message)||'Guarded relational apply trả trạng thái không hợp lệ');
      lastOperationId=trim(res.operation_id||operationId);
      var changed=uniqueStrings(res.changed_entities||entities);
      var c=cfg();c.lastPushedAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){}
      var appliedRevision=Number(res.revision||0)||Math.max(baseRevision+1,baselineRevision);
      await refreshIncremental(changed,'after_'+(reason||'save'),true,appliedRevision);
      return true;
    }catch(e){
      if(e&&e.code==='MYB_CONFLICT')throw e;
      log('Không lưu được vào relational database: '+(e.message||e),'error');
      try{if(navigator.onLine)await catchUpSinceRevision('save_error_recover',true);else if(baseline){cachePut(baseline);render()}}catch(_e){}
      throw e;
    }finally{saveInFlight=false}
  }

  function scheduleDirectSave(dbObj,reason){
    var snap=shape(clone(dbObj||{}));var fp=stable(snap),t=Date.now();
    if(fp===lastScheduledFingerprint&&(t-lastScheduledAt)<900)return true;
    lastScheduledFingerprint=fp;lastScheduledAt=t;
    cachePut(snap);try{render()}catch(e){}
    saveChain=saveChain.then(function(){return directSaveSnapshot(snap,reason||'save')}).catch(function(e){console.error('V15.1.0 guarded save failed',e)});
    return true;
  }

  function stopLegacy(){
    if(legacyStopped)return;legacyStopped=true;
    try{clearTimeout(window.__mybCloudDbFlushTimer)}catch(e){}
    try{clearTimeout(window.__mybRelationalQueueFlushTimer)}catch(e){}
    try{if(typeof cloudRealtimeStop==='function')cloudRealtimeStop()}catch(e){}
    try{CLOUD_TABLE='__meyeube_sync_RETIRED_V1580__'}catch(e){}
    try{var c=cfg();c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;saveCloudConfigToStorage(c)}catch(e){}
    try{localStorage.removeItem('mybRelationalReadMode_v1567');localStorage.removeItem('mybRelationalWriteQueue_v1568');localStorage.removeItem('mybRelationalProduction_v1569')}catch(e){}
  }

  async function bootstrap(manual){
    if(booting)return;booting=true;stopLegacy();
    var cached=null;
    try{
      if(manual)try{showAppLoading()}catch(e){}
      cached=await cacheGet();
      if(cached){
        cachePut(cached);baseline=shape(clone(cached));baselineRevision=Number(cached._relationalRevision||0)||0;serverFamilyId=trim(cached._relationalFamilyId||'');
        try{render()}catch(e){}
      }
      if(enabled()&&navigator.onLine){
        await saveChain.catch(function(){});
        if(cached&&baselineRevision>0){
          try{
            var meta=await fetchRevision();serverReady=true;
            if(Number(meta.revision||0)>baselineRevision)await catchUpSinceRevision('bootstrap_incremental',true);
            else{lastAuthoritativeAt=now();try{renderCloudConfig()}catch(e){}}
          }catch(e){
            if(isMissingV1580Rpc(e)){await refreshFull('bootstrap_v1579_fallback',true);egressReady=false;guardReady=false}
            else throw e;
          }
        }else await refreshFull('bootstrap_first_full',true);
        log('Database First V15.1.0: cache + revision check; Realtime connection stability guard đang hoạt động.','success');
        if(!egressReady)log('Đang READ-ONLY an toàn: hãy chạy SUPABASE_EGRESS_V15.0.80.sql để bật Incremental Realtime.','warn');
      }else if(cached){serverReady=false;log('Đang offline: hiển thị cache; không ghi local business DB.','warn')}
    }catch(e){
      console.error('V15.1.0 relational bootstrap failed',e);
      if(!cached){var cached2=await cacheGet();if(cached2){cachePut(cached2);baseline=shape(clone(cached2));baselineRevision=Number(cached2._relationalRevision||0)||0;try{render()}catch(_e){}}}
      log('Không kiểm tra được relational server: '+(e.message||e),'warn');
    }finally{booting=false;if(manual)try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}
  }

  var baseRealtimeStop=window.cloudRealtimeStop;
  function realtimeUiBusy(){
    try{
      var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName||''))return true;
      var b=document.body;if(b&&(b.classList.contains('careModalOpen')||b.classList.contains('menuOpen')||b.classList.contains('mybScrollLock')||b.classList.contains('mybBottomSheetLock')))return true;
      if(document.querySelector('.moreSheet.show,.tfOverlay.show,.streakOverlay.show,.milkBagPickerOverlay.show,.nmSheet.open,.tl8Sheet.show'))return true;
    }catch(e){}
    return false;
  }
  function clearReconnect(){if(realtimeReconnectTimer){clearTimeout(realtimeReconnectTimer);realtimeReconnectTimer=null}}
  function detachRealtimeChannel(reason){
    var oldClient=cloudRealtimeClient,oldChannel=cloudRealtimeChannel;
    realtimeGeneration++;
    cloudRealtimeChannel=null;cloudRealtimeClient=null;realtimeKey='';
    if(reason)realtimeLastDisconnectReason=String(reason);
    try{
      if(oldClient&&oldChannel){
        var rm=oldClient.removeChannel(oldChannel);
        if(rm&&typeof rm.catch==='function')rm.catch(function(){});
      }
    }catch(e){}
  }
  function stopRelationalRealtime(){
    clearTimeout(realtimePullTimer);realtimePullTimer=null;clearReconnect();realtimeReconnectAttempt=0;realtimeStopping=true;
    detachRealtimeChannel('intentional_stop');
    try{if(typeof baseRealtimeStop==='function')baseRealtimeStop()}catch(e){}
    realtimeStopping=false;
  }
  function scheduleReconnect(reason,sourceGeneration){
    if(!enabled()||!navigator.onLine||document.visibilityState==='hidden'||realtimeStopping)return;
    if(sourceGeneration!==undefined&&sourceGeneration!==null&&sourceGeneration!==realtimeGeneration){realtimeIgnoredStaleCallbacks++;return}
    if(realtimeReconnectTimer)return;
    realtimeReconnectAttempt=Math.min(realtimeReconnectAttempt+1,8);
    var delay=Math.min(15000,700*Math.pow(1.75,realtimeReconnectAttempt-1));
    realtimeLastDisconnectReason=String(reason||'retry');
    try{cloudSetRealtimeState('RETRYING')}catch(e){}
    var scheduledGeneration=realtimeGeneration;
    realtimeReconnectTimer=setTimeout(function(){
      realtimeReconnectTimer=null;
      if(!enabled()||!navigator.onLine||document.visibilityState==='hidden'||realtimeStopping)return;
      if(scheduledGeneration!==realtimeGeneration){realtimeIgnoredStaleCallbacks++;return}
      detachRealtimeChannel('reconnect_'+(reason||'retry'));
      realtimeReconnectCount++;
      startRelationalRealtime();
      scheduleRealtimePull('reconnect_'+(reason||'retry'),180,null);
    },delay);
  }
  function scheduleRealtimePull(reason,delay,revision){
    if(!enabled()||!navigator.onLine)return;
    if(revision!==undefined&&revision!==null&&revision!==''){
      var r=Number(revision)||0;if(r&&r<=baselineRevision)return;pendingRealtimeRevision=Math.max(Number(pendingRealtimeRevision||0),r)||null;
    }else pendingLegacyRealtime=true;
    realtimePending=true;clearTimeout(realtimePullTimer);
    realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime').catch(function(e){console.warn('[V15.1.0] realtime catch-up failed',e)})},delay==null?460:delay);
  }
  async function pullLatestAfterRealtime(reason){
    if(realtimeRefreshing){realtimePending=true;return false}
    if(pendingRealtimeRevision&&pendingRealtimeRevision<=baselineRevision&&!pendingLegacyRealtime){realtimePending=false;pendingRealtimeRevision=null;return true}
    if(realtimeUiBusy()){realtimePending=true;clearTimeout(realtimePullTimer);realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime_deferred').catch(function(){})},900);return false}
    realtimeRefreshing=true;realtimePending=false;
    try{
      await saveChain.catch(function(){});
      if(pendingLegacyRealtime){pendingLegacyRealtime=false;await refreshFull('legacy_realtime_signal_full_fallback',true)}
      else await catchUpSinceRevision(reason||'realtime_incremental',true);
      pendingRealtimeRevision=null;
      var c=cfg();c.lastRealtimeAt=realtimeLastEventAt||now();try{saveCloudConfigToStorage(c)}catch(e){}
      try{renderCloudConfig()}catch(e){};return true;
    }catch(e){log('Realtime nhận tín hiệu nhưng incremental catch-up thất bại: '+(e.message||e),'warn');scheduleReconnect('pull_failed');return false}
    finally{realtimeRefreshing=false;if(realtimePending)scheduleRealtimePull('coalesced_realtime',620,pendingRealtimeRevision)}
  }
  function realtimeHandleEvent(payload){
    try{
      var row=payload&&payload.new?payload.new:null;if(!row)return;
      realtimeLastEventAt=row.created_at||now();var rev=row.revision===null||row.revision===undefined?null:Number(row.revision)||0;
      if(rev&&rev<=baselineRevision)return;
      scheduleRealtimePull('database_change',460,rev);
    }catch(e){console.warn('[V15.1.0] realtime event error',e)}
  }
  function startRelationalRealtime(){
    var c=cfg();
    if(!c.enabled||!navigator.onLine){try{cloudSetRealtimeState(navigator.onLine?'OFF':'OFFLINE')}catch(e){};return null}
    if(!serverFamilyId)return null;
    if(!window.supabase||typeof window.supabase.createClient!=='function'){try{cloudSetRealtimeState('UNAVAILABLE')}catch(e){};log('Không tải được Supabase Realtime; presence/reconnect vẫn kiểm tra revision nhẹ.','warn');return null}
    var key=(c.syncId||'main')+'|'+serverFamilyId;
    if(cloudRealtimeChannel&&realtimeKey===key)return cloudRealtimeChannel;
    clearReconnect();realtimeKey=key;realtimeStopping=false;
    var myGeneration=++realtimeGeneration;
    try{
      cloudSetRealtimeState('CONNECTING');
      var client=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:10}}});
      var channel=client.channel('myb_rel_v1510_'+serverFamilyId).on('postgres_changes',{event:'INSERT',schema:'public',table:'myb_realtime_events',filter:'family_id=eq.'+serverFamilyId},realtimeHandleEvent);
      cloudRealtimeClient=client;cloudRealtimeChannel=channel;
      channel.subscribe(function(status){
        if(myGeneration!==realtimeGeneration||channel!==cloudRealtimeChannel||client!==cloudRealtimeClient){realtimeIgnoredStaleCallbacks++;return}
        if(status==='SUBSCRIBED'){
          clearReconnect();realtimeReconnectAttempt=0;realtimeLastSubscribedAt=now();realtimeLastDisconnectReason='';cloudSetRealtimeState('REALTIME');
          var c2=cfg();c2.realtime=true;c2.relationalOnly=true;c2.relationalOnlyVersion=V;saveCloudConfigToStorage(c2);
          scheduleRealtimePull('realtime_resubscribed',180,baselineRevision+1);
        }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
          scheduleReconnect(status.toLowerCase(),myGeneration);
        }else if(status==='CLOSED'){
          // CLOSED from an old/intentionally removed channel must never tear down the new channel.
          if(realtimeStopping)return;
          scheduleReconnect('closed',myGeneration);
        }
      });
      return channel;
    }catch(e){
      if(myGeneration===realtimeGeneration){try{cloudSetRealtimeState('ERROR')}catch(_e){};log('Không thể bật Incremental Realtime: '+(e.message||e),'warn');scheduleReconnect('start_error',myGeneration)}
      return null;
    }
  }

  async function sendPresence(){
    if(!egressReady||!enabled()||!navigator.onLine||document.visibilityState==='hidden')return false;
    try{
      var r=await rpc('myb_relational_presence_v1580',{p_sync_id:cfg().syncId||'main',p_device_key:dev()},'Presence + revision');
      catchupCheckCount++;applyRuntimeMeta(r);
      if(r&&r.ok){
        var rr=Number(r.revision||0)||0;if(rr>baselineRevision&&!saveInFlight)scheduleRealtimePull('presence_revision_gap',120,rr);
        try{renderCloudConfig()}catch(e){};return true;
      }
    }catch(e){console.warn('[V15.1.0] presence failed',e)}
    return false;
  }
  function startPresence(){if(presenceTimer)return;sendPresence();presenceTimer=setInterval(sendPresence,180000)}
  function stopPresence(){if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}}

  function installCommitButtonGuard(){
    try{document.addEventListener('click',function(ev){
      var b=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!b)return;
      var oc=String(b.getAttribute('onclick')||'');if(!/(save|confirm|bkConfirmImport|tfConfirm)/i.test(oc))return;
      var t=Date.now(),until=Number(b.dataset.mybCommitLockUntil||0);
      if(until>t){ev.preventDefault();ev.stopImmediatePropagation();safeToast('Đang xử lý, vui lòng chờ…','warn');return}
      b.dataset.mybCommitLockUntil=String(t+1200);b.classList.add('mybCommitLocked');
      setTimeout(function(){try{delete b.dataset.mybCommitLockUntil;b.classList.remove('mybCommitLocked')}catch(e){}},1250);
    },true)}catch(e){}
  }

  window.normalize=normalize=function(db){return shape(clone(db||{}))};
  window.load=load=function(){return shape(clone(memory||window.__mybCloudDbMemory||{}))};
  window.safeWriteDB=safeWriteDB=function(dbObj,reason){return scheduleDirectSave(dbObj,reason||'safeWriteDB')};
  window.save=save=function(dbObj){var next=shape(clone(dbObj||{}));try{pruneAutoMilestones(next)}catch(e){}try{checkAutoMilestones(next)}catch(e){}scheduleDirectSave(next,'save');try{maybeDispatchPushAlerts(next)}catch(e){};return true};
  window.cloudAutoPush=cloudAutoPush=function(dbObj){return scheduleDirectSave(dbObj||load(),'auto_save')};
  window.cloudDbFlush=async function(){await saveChain.catch(function(){});return true};
  window.cloudUpsertPayload=cloudUpsertPayload=async function(c,payload){scheduleDirectSave(payload||load(),'legacy_entry_redirect');await saveChain;return {result:true,payload:load(),relationalOnly:true}};
  window.cloudFetchRow=cloudFetchRow=async function(){await catchUpSinceRevision('legacy_cloud_fetch_redirect',false);return {syncId:cfg().syncId||'main',payload:load(),updatedAt:now(),relationalOnly:true,incremental:true}};
  window.cloudApplyRemotePayload=cloudApplyRemotePayload=function(){return false};
  window.cloudPersistMergedPayload=cloudPersistMergedPayload=function(){return load()};
  window.cloudMergePayloads=cloudMergePayloads=function(remote,local){return shape(clone(local||remote||{}))};
  window.cloudRealtimeStop=cloudRealtimeStop=stopRelationalRealtime;
  window.cloudRealtimeStart=cloudRealtimeStart=startRelationalRealtime;
  window.cloudRealtimeRestart=cloudRealtimeRestart=function(){stopRelationalRealtime();setTimeout(function(){startRelationalRealtime();scheduleRealtimePull('manual_realtime_restart',180,baselineRevision+1)},120)};
  window.cloudAutoPullOnBoot=cloudAutoPullOnBoot=function(){return bootstrap(false)};
  window.pushLocalToCloud=pushLocalToCloud=async function(){try{showAppLoading()}catch(e){};try{await saveChain;await catchUpSinceRevision('manual_incremental_sync',true);safeToast('Đã cập nhật các thay đổi mới nhất','success')}catch(e){safeToast('Làm mới relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.pullCloudToLocal=pullCloudToLocal=async function(){try{showAppLoading()}catch(e){};try{await saveChain;await refreshFull('manual_full_pull',true);safeToast('Đã tải toàn bộ dữ liệu từ TABLE','success')}catch(e){safeToast('Tải relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.smartCloudSync=smartCloudSync=async function(){return pushLocalToCloud()};
  window.testCloudConnection=testCloudConnection=async function(){try{showAppLoading()}catch(e){};try{var p=await fetchRevision();safeToast('Relational DB OK · Revision '+Number(p.revision||0)+' · Incremental Ready','success')}catch(e){safeToast('Test relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};

  var nativeRenderCloud=window.renderCloudConfig||renderCloudConfig;
  window.renderCloudConfig=renderCloudConfig=function(){
    try{nativeRenderCloud()}catch(e){}
    var c=cfg();var t=byId('cloudSyncTitle'),s=byId('cloudSyncSubtitle'),p=byId('cloudSyncPill');
    if(t)t.textContent=c.enabled?'Relational DB + Incremental Realtime':'Relational DB chưa bật';
    if(s)s.textContent=c.enabled?('Sync ID: '+(c.syncId||'main')+' · Không full polling · chỉ tải section thay đổi'):'Bật Cloud và nhập Supabase URL/key/Sync ID.';
    if(p){p.textContent=c.enabled?(cloudRealtimeState==='REALTIME'?'REALTIME':'TABLE'):'OFF';p.classList.toggle('off',!c.enabled)}
    ['rel62MigrationCard','rel65DoctorCard','rel66DeltaCard','rel67ReadCard','rel68WriteCard','rel69ProdCard','rel70MilkBox','rel72RescueBox','relOnly1579Box'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove()});
    var host=document.getElementById('cloudSync')||document.getElementById('cloudConfigExtra')||document.getElementById('cloudConfigBox');
    if(host&&!document.getElementById('relOnly1580Box')){
      var d=document.createElement('div');d.id='relOnly1580Box';d.className='cloudBlock rel67Block';
      d.innerHTML='<div class="rel67Head"><div><b>⚡ Realtime Connection Stability + Incremental Sync</b><small>V15.1.0 · 1 active channel · stale callback bị bỏ qua · incremental sync giữ nguyên.</small></div><span class="rel67Pill ok">V15.1.0</span></div><div class="rel67Actions"><button type="button" class="ok" onclick="smartCloudSync()">Làm mới thay đổi</button><button type="button" onclick="pullCloudToLocal()">Tải toàn bộ TABLE</button></div><pre id="relOnly1580Status" class="cloudLogBox">Incremental Realtime đang khởi tạo…</pre>';
      host.appendChild(d);
    }
    var rs=document.getElementById('relOnly1580Status');
    if(rs)rs.textContent='Nguồn chính: relational tables\nEgress SQL: '+(egressReady?'READY':'CHƯA CÀI V15.0.80')+'\nRevision: '+baselineRevision+'\nRealtime: '+(cloudRealtimeState||'OFF')+'\nKết nối gần nhất: '+(realtimeLastSubscribedAt||'--')+'\nReconnect phiên này: '+realtimeReconnectCount+'\nStale callback bỏ qua: '+realtimeIgnoredStaleCallbacks+'\nFull polling 45s: OFF\nFull pulls phiên này: '+fullPullCount+' · ~'+fmtBytes(fullPullBytes)+'\nIncremental pulls: '+incrementalPullCount+' · ~'+fmtBytes(incrementalPullBytes)+'\nChange checks nhẹ: '+catchupCheckCount+'\nSection gần nhất: '+(lastIncrementalEntities.join(', ')||'chưa có')+'\nThiết bị online: '+onlineDeviceCount+'/'+deviceCount+'\nConflict: '+conflictCount+'\nWrite: '+(saveInFlight?'đang COMMIT DB':'sẵn sàng');
  };

  window.saveCloudConfig=saveCloudConfig=function(){
    try{var c=cfg();c.enabled=(byId('cloudEnabled')&&byId('cloudEnabled').value==='1');c.url=(byId('cloudUrl')&&byId('cloudUrl').value.trim())||c.url||CLOUD_DEFAULT_URL;c.anonKey=(byId('cloudAnonKey')&&byId('cloudAnonKey').value.trim())||c.anonKey||CLOUD_DEFAULT_KEY;c.syncId=(byId('cloudSyncId')&&byId('cloudSyncId').value.trim())||c.syncId||'main';c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;saveCloudConfigToStorage(c);stopLegacy();renderCloudConfig();safeToast('Đã lưu cấu hình Incremental Realtime','success');if(c.enabled)bootstrap(true).then(function(){startRelationalRealtime();startPresence();sendPresence()})}catch(e){safeToast('Lưu cấu hình thất bại: '+(e.message||e),'error')}
  };

  window.mybRelationalRealtimeV1510={
    version:V,fetchServerFull:fetchServerFull,fetchRevision:fetchRevision,fetchIncremental:fetchIncremental,catchUp:catchUpSinceRevision,buildChanges:buildChanges,bootstrap:bootstrap,startRealtime:startRelationalRealtime,stopRealtime:stopRelationalRealtime,pullRealtime:pullLatestAfterRealtime,presence:sendPresence,
    status:async function(){return {version:V,enabled:enabled(),syncId:cfg().syncId||'main',familyId:serverFamilyId,pendingPersistentWrites:0,saveInFlight:saveInFlight,source:'relational_tables_only',egressMode:'incremental_sections',fullPolling:false,realtimeState:cloudRealtimeState,lastRealtimeAt:realtimeLastEventAt,realtimeLastSubscribedAt:realtimeLastSubscribedAt,realtimeReconnectCount:realtimeReconnectCount,realtimeIgnoredStaleCallbacks:realtimeIgnoredStaleCallbacks,realtimeLastDisconnectReason:realtimeLastDisconnectReason,realtimeGeneration:realtimeGeneration,legacyJsonUsed:false,guardReady:guardReady,egressReady:egressReady,revision:baselineRevision,conflictCount:conflictCount,lastConflictAt:lastConflictAt,onlineDevices:onlineDeviceCount,deviceCount:deviceCount,lastOperationId:lastOperationId,fullPullCount:fullPullCount,incrementalPullCount:incrementalPullCount,fullPullBytesApprox:fullPullBytes,incrementalPullBytesApprox:incrementalPullBytes,lastIncrementalEntities:lastIncrementalEntities}}
  };

  stopLegacy();installCommitButtonGuard();try{showAppLoading()}catch(e){}
  try{window.addEventListener('online',function(){bootstrap(false).then(function(){startRelationalRealtime();startPresence();sendPresence();scheduleRealtimePull('online_catchup',100,baselineRevision+1)}).catch(function(){})})}catch(e){}
  try{window.addEventListener('offline',function(){stopRelationalRealtime();try{cloudSetRealtimeState('OFFLINE')}catch(e){};stopPresence()})}catch(e){}
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){startRelationalRealtime();startPresence();sendPresence();scheduleRealtimePull('foreground_catchup',120,baselineRevision+1)}else{stopPresence()}})}catch(e){}
  setTimeout(function(){bootstrap(false).finally(function(){stabilizing=false;startRelationalRealtime();startPresence();try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}})},60);
  setTimeout(function(){if(stabilizing){stabilizing=false;try{hideAppLoading()}catch(e){}}},3600);
})();
