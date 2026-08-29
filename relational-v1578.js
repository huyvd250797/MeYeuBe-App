/* ============================================================================
   Mẹ Yêu Bé V15.0.78 · RelationalCleanupWeightLocale
   ---------------------------------------------------------------------------
   Source of truth: Supabase RELATIONAL TABLES ONLY.
   - No JSON migration / Doctor / Delta Sync / Read Mode / Write Queue / Push Primary.
   - No persistent business write queue on the device.
   - Save = direct RPC to relational tables, then refetch authoritative DB state.
   - Realtime is only a lightweight "database changed" signal.
   - UI/cache uses Vietnamese decimal comma for health measurements (5,2 kg).
   ============================================================================ */
(function(){
  if(window.__MYB_RELATIONAL_REALTIME_V1578__)return;
  window.__MYB_RELATIONAL_REALTIME_V1578__=true;

  var V='15.0.78';
  var CACHE_META='meYeuBeRelationalOnlyMeta_v1578';
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
  var realtimeSafetyTimer=null;

  function now(){return new Date().toISOString()}
  function clone(v){try{return JSON.parse(JSON.stringify(v==null?{}:v))}catch(e){return v||{}}}
  function arr(v){return Array.isArray(v)?v:[]}
  function obj(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
  function str(v){return String(v==null?'':v)}
  function trim(v){return str(v).trim()}
  function safeToast(msg,type){try{showToast(msg,type||'success')}catch(e){try{console.log('[V15.0.78]',msg)}catch(_e){}}}
  function log(msg,type){try{cloudLog(msg,type)}catch(e){if(type)safeToast(msg,type);else console.log('[V15.0.78]',msg)}}
  function cfg(){try{return loadCloudConfig()}catch(e){return {enabled:false,url:'',anonKey:'',syncId:'main'}}}
  function dev(){try{return cloudDeviceId()}catch(e){var k='meYeuBeDeviceId_v1',x=localStorage.getItem(k);if(!x){x='dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);localStorage.setItem(k,x)}return x}}
  function enabled(){var c=cfg();return !!(c&&c.enabled&&c.url&&c.anonKey&&c.syncId)}

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

  function cachePut(db){
    memory=shape(clone(db||{}));memory._relationalCacheAt=now();window.__mybCloudDbMemory=memory;
    try{if(typeof window.mybCloudDbPutCacheV1554==='function')window.mybCloudDbPutCacheV1554(memory).catch(function(){})}catch(e){}
    try{localStorage.setItem(CACHE_META,JSON.stringify({version:V,mode:'relational-only-cache',syncId:cfg().syncId||'main',cachedAt:now()}))}catch(e){}
    return memory;
  }
  async function cacheGet(){
    try{if(typeof window.mybCloudDbGetCacheV1554==='function'){var c=await window.mybCloudDbGetCacheV1554();if(c)return shape(clone(c))}}catch(e){}
    return null;
  }

  async function fetchServer(){
    var c=cfg();var res=await rpc('myb_relational_export_state_v1576',{p_sync_id:c.syncId||'main'},'Relational export');
    if(!res||res.ok!==true||!res.payload)throw new Error((res&&res.message)||'Server chưa có relational state V15.0.76+');
    serverFamilyId=trim(res.family_id||serverFamilyId);
    var n=shape(clone(res.payload));n._relationalCounts=res.counts||{};n._relationalLoadedAt=now();n._relationalFamilyId=serverFamilyId;return n;
  }

  async function refreshAuthoritative(reason,renderNow){
    var p=await fetchServer();cachePut(p);baseline=shape(clone(p));serverReady=true;
    var c=cfg();c.lastPulledAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){}
    if(renderNow!==false){try{render()}catch(e){}}
    return p;
  }

  async function directSaveSnapshot(snapshot,reason){
    var next=shape(clone(snapshot||{}));next._relationalOnly=true;next._relationalVersion=V;
    if(!serverReady||stabilizing){log('Đang chờ Database First khởi tạo xong; không gửi cache cũ lên server.','warn');return true}
    if(!enabled()||!navigator.onLine){
      if(baseline){cachePut(baseline);try{render()}catch(e){}}
      safeToast('Chưa lưu: thiết bị đang offline hoặc Cloud chưa bật. Dữ liệu server không bị thay đổi.','error');
      throw new Error('offline_or_cloud_disabled');
    }
    var before=baseline?shape(clone(baseline)):shape({});
    var changes=buildChanges(before,next);
    if(!changes.length)return true;
    saveInFlight=true;
    try{
      var res=await rpc('myb_relational_apply_changes_v1576',{p_sync_id:cfg().syncId||'main',p_device_key:dev(),p_changes:changes},'Direct relational save');
      if(!res||res.ok!==true)throw new Error('Relational apply trả trạng thái không hợp lệ');
      var c=cfg();c.lastPushedAt=now();c.relationalOnly=true;c.relationalOnlyVersion=V;c.cloudDbMode=false;c.realtime=true;try{saveCloudConfigToStorage(c)}catch(e){}
      await refreshAuthoritative('after_'+(reason||'save'),true);
      return true;
    }catch(e){
      log('Không lưu được vào relational database: '+(e.message||e),'error');
      try{if(navigator.onLine)await refreshAuthoritative('save_error_recover',true);else if(baseline){cachePut(baseline);render()}}catch(_e){}
      throw e;
    }finally{saveInFlight=false}
  }

  function scheduleDirectSave(dbObj,reason){
    var snap=shape(clone(dbObj||{}));
    // Optimistic UI only; server remains source of truth and is refetched after COMMIT.
    cachePut(snap);try{render()}catch(e){}
    saveChain=saveChain.then(function(){return directSaveSnapshot(snap,reason||'save')}).catch(function(e){console.error('V15.0.78 direct save failed',e)});
    return true;
  }

  function stopLegacy(){
    if(legacyStopped)return;legacyStopped=true;
    try{clearTimeout(window.__mybCloudDbFlushTimer)}catch(e){}
    try{clearTimeout(window.__mybRelationalQueueFlushTimer)}catch(e){}
    try{if(typeof cloudRealtimeStop==='function')cloudRealtimeStop()}catch(e){}
    try{CLOUD_TABLE='__meyeube_sync_RETIRED_V1578__'}catch(e){}
    try{var c=cfg();c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;saveCloudConfigToStorage(c)}catch(e){}
    try{localStorage.removeItem('mybRelationalReadMode_v1567');localStorage.removeItem('mybRelationalWriteQueue_v1568');localStorage.removeItem('mybRelationalProduction_v1569')}catch(e){}
  }

  async function bootstrap(manual){
    if(booting)return;booting=true;stopLegacy();
    try{
      if(manual)try{showAppLoading()}catch(e){}
      if(enabled()&&navigator.onLine){
        await saveChain.catch(function(){});
        await refreshAuthoritative('bootstrap',true);
        try{localStorage.removeItem(KEY)}catch(e){}
        log('Đã tải dữ liệu từ relational tables · Database là nguồn duy nhất','success');
      }else{
        var cached=await cacheGet();if(cached){cachePut(cached);baseline=shape(clone(cached));serverReady=false;try{render()}catch(e){};log('Đang offline: chỉ hiển thị cache, không ghi dữ liệu nghiệp vụ vào local DB.','warn')}
      }
    }catch(e){
      console.error('V15.0.78 relational bootstrap failed',e);
      var cached2=await cacheGet();if(cached2){cachePut(cached2);baseline=shape(clone(cached2));serverReady=false;try{render()}catch(_e){};log('Không tải được relational server, đang hiển thị cache: '+(e.message||e),'warn')}else log('Không tải được relational server: '+(e.message||e),'error');
    }finally{booting=false;if(manual)try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}
  }

  // ---- Database-first Realtime --------------------------------------------
  var baseRealtimeStop=window.cloudRealtimeStop;
  function realtimeUiBusy(){
    try{
      var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName||''))return true;
      var b=document.body;if(b&&(b.classList.contains('careModalOpen')||b.classList.contains('menuOpen')||b.classList.contains('mybScrollLock')||b.classList.contains('mybBottomSheetLock')))return true;
      if(document.querySelector('.moreSheet.show,.tfOverlay.show,.streakOverlay.show,.milkBagPickerOverlay.show,.nmSheet.open,.tl8Sheet.show'))return true;
    }catch(e){}
    return false;
  }
  function stopRelationalRealtime(){
    clearTimeout(realtimePullTimer);realtimePullTimer=null;
    if(realtimeSafetyTimer){clearInterval(realtimeSafetyTimer);realtimeSafetyTimer=null}
    realtimeKey='';
    try{if(typeof baseRealtimeStop==='function')baseRealtimeStop()}catch(e){try{if(cloudRealtimeClient&&cloudRealtimeChannel)cloudRealtimeClient.removeChannel(cloudRealtimeChannel)}catch(_e){}cloudRealtimeChannel=null;cloudRealtimeClient=null}
  }
  function scheduleRealtimePull(reason,delay){
    if(!enabled()||!navigator.onLine)return;
    realtimePending=true;clearTimeout(realtimePullTimer);
    realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime').catch(function(e){console.warn('[V15.0.78] realtime pull failed',e)})},delay==null?280:delay);
  }
  async function pullLatestAfterRealtime(reason){
    if(realtimeRefreshing){realtimePending=true;return false}
    if(realtimeUiBusy()){realtimePending=true;clearTimeout(realtimePullTimer);realtimePullTimer=setTimeout(function(){pullLatestAfterRealtime(reason||'realtime_deferred').catch(function(){})},900);return false}
    realtimeRefreshing=true;realtimePending=false;
    try{
      await saveChain.catch(function(){});
      await refreshAuthoritative(reason||'realtime',true);
      var c=cfg();c.lastRealtimeAt=realtimeLastEventAt||now();try{saveCloudConfigToStorage(c)}catch(e){}
      try{renderCloudConfig()}catch(e){}
      return true;
    }catch(e){log('Realtime nhận tín hiệu nhưng tải TABLE thất bại: '+(e.message||e),'warn');return false}
    finally{realtimeRefreshing=false;if(realtimePending)scheduleRealtimePull('coalesced_realtime',420)}
  }
  function realtimeHandleEvent(payload){try{var row=payload&&payload.new?payload.new:null;if(!row)return;realtimeLastEventAt=row.created_at||now();scheduleRealtimePull('database_change',220)}catch(e){console.warn('[V15.0.78] realtime event error',e)}}
  function startRelationalRealtime(){
    var c=cfg();
    if(!c.enabled||!navigator.onLine){try{cloudSetRealtimeState(navigator.onLine?'OFF':'OFFLINE')}catch(e){};return null}
    if(!serverFamilyId){scheduleRealtimePull('realtime_need_family',100);return null}
    if(!window.supabase||typeof window.supabase.createClient!=='function'){try{cloudSetRealtimeState('UNAVAILABLE')}catch(e){};log('Không tải được thư viện Supabase Realtime; app vẫn refetch khi foreground.','warn');return null}
    var key=(c.syncId||'main')+'|'+serverFamilyId;if(cloudRealtimeChannel&&realtimeKey===key)return cloudRealtimeChannel;
    stopRelationalRealtime();realtimeKey=key;
    try{
      cloudSetRealtimeState('CONNECTING');
      cloudRealtimeClient=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:10}}});
      cloudRealtimeChannel=cloudRealtimeClient.channel('myb_rel_v1578_'+serverFamilyId).on('postgres_changes',{event:'INSERT',schema:'public',table:'myb_realtime_events',filter:'family_id=eq.'+serverFamilyId},realtimeHandleEvent).subscribe(function(status){
        if(status==='SUBSCRIBED'){cloudSetRealtimeState('REALTIME');var c2=cfg();c2.realtime=true;c2.relationalOnly=true;c2.relationalOnlyVersion=V;saveCloudConfigToStorage(c2)}
        else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')cloudSetRealtimeState('RETRYING');else if(status==='CLOSED')cloudSetRealtimeState('OFF');
      });
      if(!realtimeSafetyTimer)realtimeSafetyTimer=setInterval(function(){if(document.visibilityState==='visible'&&navigator.onLine&&enabled())scheduleRealtimePull('realtime_safety_refresh',50)},60000);
      return cloudRealtimeChannel;
    }catch(e){cloudSetRealtimeState('ERROR');log('Không thể bật Relational Realtime: '+(e.message||e),'warn');return null}
  }

  // ---- Final runtime overrides --------------------------------------------
  window.normalize=normalize=function(db){return shape(clone(db||{}))};
  window.load=load=function(){return shape(clone(memory||window.__mybCloudDbMemory||{}))};
  window.safeWriteDB=safeWriteDB=function(dbObj,reason){return scheduleDirectSave(dbObj,reason||'safeWriteDB')};
  window.save=save=function(dbObj){
    var next=shape(clone(dbObj||{}));
    try{pruneAutoMilestones(next)}catch(e){}try{checkAutoMilestones(next)}catch(e){}
    scheduleDirectSave(next,'save');
    try{maybeDispatchPushAlerts(next)}catch(e){}
    return true;
  };
  window.cloudAutoPush=cloudAutoPush=function(dbObj){return scheduleDirectSave(dbObj||load(),'auto_save')};
  window.cloudDbFlush=async function(){await saveChain.catch(function(){});return true};
  window.cloudUpsertPayload=cloudUpsertPayload=async function(c,payload){scheduleDirectSave(payload||load(),'legacy_entry_redirect');await saveChain;return {result:true,payload:load(),relationalOnly:true}};
  window.cloudFetchRow=cloudFetchRow=async function(){var p=await fetchServer();return {syncId:cfg().syncId||'main',payload:p,updatedAt:now(),relationalOnly:true}};
  window.cloudApplyRemotePayload=cloudApplyRemotePayload=function(){return false};
  window.cloudPersistMergedPayload=cloudPersistMergedPayload=function(){return load()};
  window.cloudMergePayloads=cloudMergePayloads=function(remote,local){return shape(clone(local||remote||{}))};
  window.cloudRealtimeStop=cloudRealtimeStop=stopRelationalRealtime;
  window.cloudRealtimeStart=cloudRealtimeStart=startRelationalRealtime;
  window.cloudRealtimeRestart=cloudRealtimeRestart=function(){stopRelationalRealtime();setTimeout(startRelationalRealtime,120)};
  window.cloudAutoPullOnBoot=cloudAutoPullOnBoot=function(){return bootstrap(false)};
  window.pushLocalToCloud=pushLocalToCloud=async function(){try{showAppLoading()}catch(e){};try{await saveChain;await refreshAuthoritative('manual_wait_and_refresh',true);safeToast('Database đã đồng bộ xong','success')}catch(e){safeToast('Đồng bộ relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.pullCloudToLocal=pullCloudToLocal=async function(){try{showAppLoading()}catch(e){};try{await saveChain;await refreshAuthoritative('manual_pull',true);safeToast('Đã tải lại dữ liệu từ relational tables','success')}catch(e){safeToast('Tải relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};
  window.smartCloudSync=smartCloudSync=async function(){return pullCloudToLocal()};
  window.testCloudConnection=testCloudConnection=async function(){try{showAppLoading()}catch(e){};try{var p=await fetchServer();safeToast('Relational DB OK · '+((p.careEvents||[]).length)+' ghi nhận chăm sóc','success')}catch(e){safeToast('Test relational thất bại: '+(e.message||e),'error')}finally{try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}}};

  var nativeRenderCloud=window.renderCloudConfig||renderCloudConfig;
  window.renderCloudConfig=renderCloudConfig=function(){
    try{nativeRenderCloud()}catch(e){}
    var c=cfg();
    var t=byId('cloudSyncTitle'),s=byId('cloudSyncSubtitle'),p=byId('cloudSyncPill');
    if(t)t.textContent=c.enabled?'Relational DB + Realtime':'Relational DB chưa bật';
    if(s)s.textContent=c.enabled?('Sync ID: '+(c.syncId||'main')+' · TABLE là nguồn chính · Realtime chỉ báo thay đổi'):'Bật Cloud và nhập Supabase URL/key/Sync ID.';
    if(p){p.textContent=c.enabled?(cloudRealtimeState==='REALTIME'?'REALTIME':'TABLE'):'OFF';p.classList.toggle('off',!c.enabled)}
    ['rel62MigrationCard','rel65DoctorCard','rel66DeltaCard','rel67ReadCard','rel68WriteCard','rel69ProdCard','rel70MilkBox','rel72RescueBox'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove()});
    var host=document.getElementById('cloudSync')||document.getElementById('cloudConfigExtra')||document.getElementById('cloudConfigBox');
    if(host&&!document.getElementById('relOnly1578Box')){
      var d=document.createElement('div');d.id='relOnly1578Box';d.className='cloudBlock rel67Block';
      d.innerHTML='<div class="rel67Head"><div><b>⚡ Database First + Realtime</b><small>V15.0.78 đọc/ghi trực tiếp relational tables; runtime legacy đã được loại bỏ.</small></div><span class="rel67Pill ok">V15.0.78</span></div><div class="rel67Actions"><button type="button" onclick="pullCloudToLocal()">Tải lại từ TABLE</button><button type="button" class="ok" onclick="smartCloudSync()">Đồng bộ TABLE</button></div><pre id="relOnly1578Status" class="cloudLogBox">Nguồn chính: relational tables · Realtime signal -> refetch database.</pre>';
      host.appendChild(d);
    }
    var rs=document.getElementById('relOnly1578Status');
    if(rs)rs.textContent='Nguồn chính: relational tables\nRealtime: '+(cloudRealtimeState||'OFF')+'\nFamily: '+(serverFamilyId||'đang tải...')+'\nEvent gần nhất: '+(realtimeLastEventAt||'chưa có')+'\nWrite: '+(saveInFlight?'đang ghi trực tiếp DB':'sẵn sàng');
  };

  window.saveCloudConfig=saveCloudConfig=function(){
    try{
      var c=cfg();
      c.enabled=(byId('cloudEnabled')&&byId('cloudEnabled').value==='1');
      c.url=(byId('cloudUrl')&&byId('cloudUrl').value.trim())||c.url||CLOUD_DEFAULT_URL;
      c.anonKey=(byId('cloudAnonKey')&&byId('cloudAnonKey').value.trim())||c.anonKey||CLOUD_DEFAULT_KEY;
      c.syncId=(byId('cloudSyncId')&&byId('cloudSyncId').value.trim())||c.syncId||'main';
      c.cloudDbMode=false;c.realtime=true;c.relationalOnly=true;c.relationalOnlyVersion=V;c.legacyJsonRetired=true;
      saveCloudConfigToStorage(c);stopLegacy();renderCloudConfig();safeToast('Đã lưu cấu hình Database First + Realtime','success');if(c.enabled)bootstrap(true).then(function(){startRelationalRealtime()});
    }catch(e){safeToast('Lưu cấu hình thất bại: '+(e.message||e),'error')}
  };

  window.mybRelationalRealtimeV1578={
    version:V,fetchServer:fetchServer,buildChanges:buildChanges,bootstrap:bootstrap,startRealtime:startRelationalRealtime,stopRealtime:stopRelationalRealtime,pullRealtime:pullLatestAfterRealtime,
    status:async function(){return {version:V,enabled:enabled(),syncId:cfg().syncId||'main',familyId:serverFamilyId,pendingPersistentWrites:0,saveInFlight:saveInFlight,source:'relational_tables_only',realtimeState:cloudRealtimeState,lastRealtimeAt:realtimeLastEventAt,legacyJsonUsed:false}}
  };

  stopLegacy();
  try{showAppLoading()}catch(e){}
  try{setTimeout(function(){try{cloudRealtimeStop()}catch(e){}},350)}catch(e){}
  try{window.addEventListener('online',function(){bootstrap(false).then(function(){startRelationalRealtime();scheduleRealtimePull('online_refresh',80)}).catch(function(){})})}catch(e){}
  try{window.addEventListener('offline',function(){stopRelationalRealtime();try{cloudSetRealtimeState('OFFLINE')}catch(e){}})}catch(e){}
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){startRelationalRealtime();scheduleRealtimePull('foreground_refresh',120)}})}catch(e){}
  setTimeout(function(){bootstrap(false)},40);
  setTimeout(function finalCutoverReload(){if(booting){setTimeout(finalCutoverReload,300);return}bootstrap(false).finally(function(){stabilizing=false;startRelationalRealtime();try{hideAppLoading()}catch(e){};try{renderCloudConfig()}catch(e){}})},1200);
  setTimeout(function(){if(stabilizing){stabilizing=false;try{hideAppLoading()}catch(e){}}},3600);
})();
