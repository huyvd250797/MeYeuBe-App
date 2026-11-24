/* V17.22.61: theme before first paint; network build check; vu lan dedicated motion engine; offer updates without navigating active clients. */
(function(){
  var BUILD='17.22.61';
  window.MYB_BUILD=BUILD;
  try{document.documentElement.setAttribute('data-myb-build',BUILD)}catch(e){}

  /* --------------------------------------------------------------------------
     🌗 V17.22.61 · THEME BOOTSTRAP — chọn đúng sáng/tối TRƯỚC khi vẽ khung hình
     đầu tiên. boot.js nằm trong <head> và chạy đồng bộ, nên màn hình chờ
     (splash) và màn hình loading không bao giờ loé sáng rồi mới đổi sang tối.
     Ba chế độ: 'auto' (theo hệ điều hành) · 'light' · 'dark'.
     Người dùng chưa từng chọn → 'auto' = đúng ý "app tự biết máy đang tối hay sáng".
     Chỉ ĐỌC localStorage, không ghi, không đụng dữ liệu của bé.
     ------------------------------------------------------------------------ */
  var DB_KEY='meYeuBePWA_v4';
  var THEME_LIGHT='#f8b8c8', THEME_DARK='#2c1a23';

  function sysDark(){
    try{return !!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){return false}
  }
  /* Chế độ người dùng đã chọn. Bản cũ chỉ có settings.theme ('' | 'dark');
     '' vừa là "sáng" vừa là "chưa từng chọn" → quy về 'auto' cho đúng mong đợi. */
  function readMode(){
    try{var preference=localStorage.getItem('mybThemeMode_v1570');if(['auto','light','dark'].indexOf(preference)>=0)return preference}catch(ignore){}
    var s=null;
    try{var db=JSON.parse(localStorage.getItem(DB_KEY)||'null');s=(db&&db.settings)||null}catch(e){}
    if(!s)return 'auto';
    var mode=s.themeMode;
    if(mode==='light'||mode==='dark'||mode==='auto')return mode;
    return (s.theme==='dark')?'dark':'auto';
  }
  function resolve(mode){
    if(mode==='dark')return 'dark';
    if(mode==='light')return '';
    return sysDark()?'dark':'';
  }
  function apply(){
    var mode=readMode(), theme=resolve(mode);
    try{
      var el=document.documentElement;
      el.setAttribute('data-theme',theme);
      el.setAttribute('data-theme-mode',mode);
    }catch(e){}
    try{
      var meta=document.querySelector('meta[name="theme-color"]');
      if(meta)meta.setAttribute('content',theme==='dark'?THEME_DARK:THEME_LIGHT);
    }catch(e){}
    return theme;
  }
  window.mybThemeApply=apply;
  window.mybThemeMode=readMode;
  window.mybThemeSystemDark=sysDark;
  apply();
  /* V17.22.61 — Startup seasonal background with all 20 themes, BEFORE first paint.
     Cache contains only date + public theme ID, no child/family records or keys.
     After Cloud settings resolve, seasonal/ui.js revalidates the actual selection.
  */
  var SPLASH_CACHE='mybSeasonalSplashWave1_v1';
  var SPLASH_IDS={tet:1,newyear:1,nguyentieu:1,womensday:1,hungking:1,reunification:1,beach:1,nationalday:1,children:1,birthday:1,midautumn:1,school:1,halloween:1,teachers:1,christmas:1,womenvn:1,family:1,vulan:1,doanngo:1,culture:1};
  function splashToday(){return new Date(Date.now()+25200000).toISOString().slice(0,10)}
  function splashSet(id){
    var safe=Object.prototype.hasOwnProperty.call(SPLASH_IDS,id)?id:'';
    try{
      if(safe)document.documentElement.setAttribute('data-splash-theme',safe);
      else document.documentElement.removeAttribute('data-splash-theme');
      localStorage.setItem(SPLASH_CACHE,JSON.stringify({day:splashToday(),id:safe}));
    }catch(e){}
    return safe;
  }
  window.mybSplashApply=splashSet;
  try{
    var previous=JSON.parse(localStorage.getItem(SPLASH_CACHE)||'null');
    if(previous&&previous.day===splashToday()&&SPLASH_IDS[previous.id])
      document.documentElement.setAttribute('data-splash-theme',previous.id);
  }catch(e){}

  /* Đang ở 'auto' mà người dùng bật/tắt Dark Mode của máy → đổi theo ngay */
  try{
    var mq=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
    if(mq){
      var onChange=function(){if(readMode()==='auto')apply()};
      if(mq.addEventListener)mq.addEventListener('change',onChange);
      else if(mq.addListener)mq.addListener(onChange);
    }
  }catch(e){}


  var pendingUpdate='',targetBuild='',applyingUpdate=false,reloaded=false,updateFallbackTimer=null;
  function versionParts(x){return String(x||'').split('.').map(function(n){return Number(n)||0})}
  function isNewer(x,y){var a=versionParts(x),b=versionParts(y);for(var i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i]}return false}
  var attemptedKey='mybPwaAttemptedBuild_v172221',dismissedKey='mybPwaDismissedBuild_v172221';
  function stored(k){try{return sessionStorage.getItem(k)||''}catch(e){return ''}}
  function remember(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
  function clearStored(k){try{sessionStorage.removeItem(k)}catch(e){}}
  // Avoid infinite stale build loops but allow another attempt after 30 seconds.
  function alreadyHandled(v){
    if(!v||stored(dismissedKey)===v)return !!v&&stored(dismissedKey)===v;
    var a=stored(attemptedKey).split('|');
    return a[0]===v&&a[1]&&Date.now()-Number(a[1])<30000;
  }
  function clearUpdateTimer(){if(updateFallbackTimer){clearTimeout(updateFallbackTimer);updateFallbackTimer=null}}
  function clearNotice(){
    var box=document.getElementById('mybUpdateNotice');if(box)box.remove();
    var backdrop=document.getElementById('mybUpdateBackdrop');if(backdrop)backdrop.remove();
  }
  function closeUpdateNotice(){if(applyingUpdate&&!reloaded)return;pendingUpdate='';clearNotice()}
  function updateMessage(message,busy){
    var notice=document.getElementById('mybUpdateNotice');if(!notice)return;
    var text=document.getElementById('mybUpdateText');if(text)text.textContent=message;
    notice.setAttribute('aria-busy',busy?'true':'false');
    var buttons=notice.querySelectorAll?notice.querySelectorAll('button'):[];
    if(buttons[0]){buttons[0].disabled=!!busy;buttons[0].textContent=busy?'Đang cập nhật…':'Cập nhật ứng dụng'}
    if(buttons[1])buttons[1].disabled=!!busy;
  }
  function updateBlocked(){
    try{
      if(window.mybStartupGate&&!mybStartupGate.ready)return true;
      if(window.mybCloudControls&&mybCloudControls.isEditing())return true;
      if(window.mybCareWorkflow&&mybCareWorkflow.hasUnsafeDraft())return true;
      if(['mybCareRepository','mybHealthRepository','mybPlanningRepository','mybSettingsRepository'].some(function(k){var r=window[k];return r&&(r.isBusy()||r.pending())}))return true;
      if(window.mybPlanningUi&&mybPlanningUi.hasDraft())return true;
      if(window.mybScopedUi&&mybScopedUi.hasDraft())return true;
      if(document.querySelector('.careFormOverlay.show,.tfOverlay.show,.hb2Modal:not(.hidden),.feedDoneOverlay.show'))return true;
      var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return true;
    }catch(e){return true}return false;
  }
  // Avoid endless waits on iOS: allow a visible retry when a network/data check stalls.
  function bounded(promise,ms,message){
    return new Promise(function(resolve,reject){
      var finished=false;
      var timer=setTimeout(function(){if(!finished){finished=true;reject(Error(message||'Kiểm tra mất quá nhiều thời gian.'))}},ms);
      Promise.resolve(promise).then(function(value){if(!finished){finished=true;clearTimeout(timer);resolve(value)}},function(err){if(!finished){finished=true;clearTimeout(timer);reject(err)}});
    });
  }
  function reloadApproved(){
    if(reloaded)return;
    if(updateBlocked()){
      applyingUpdate=false;
      clearUpdateTimer();
      requestReload('Hãy lưu hoặc đóng nội dung đang sửa trước khi cập nhật.');
      return;
    }
    reloaded=true;clearUpdateTimer();
    if(targetBuild)remember(attemptedKey,targetBuild+'|'+Date.now());
    updateMessage('Đang mở phiên bản '+targetBuild+'…',true);
    // A cache-busted navigation is more reliable than reload() on iOS standalone PWA.
    // The service worker handles navigation network-first and retains offline fallback.
    try{
      if(location.href&&typeof location.replace==='function'){
        var url=new URL('./index.html',location.href);
        url.searchParams.set('myb_update',targetBuild);
        url.searchParams.set('_mybts',String(Date.now()));
        location.replace(url.href);return;
      }
    }catch(e){}
    location.reload();
  }
  function updateFailed(message){
    applyingUpdate=false;clearUpdateTimer();
    pendingUpdate=message;
    requestReload(message);
    updateMessage(message,false);
  }
  async function verifyHTML(build){
    var response=await bounded(fetch('./index.html?myb-update='+Date.now(),{cache:'no-store'}),9000,'Không kết nối được máy chủ cập nhật.');
    if(!response||!response.ok)throw Error('Không tải được bản ứng dụng mới.');
    var html=await bounded(response.text(),9000,'Không đọc được thông tin phiên bản mới.');
    if(html.indexOf('name="myb-build" content="'+build+'"')<0)
      throw Error('Máy chủ chưa phát hành đủ các tệp phiên bản '+build+'.');
    return true;
  }
  async function applyUpdate(){
    if(applyingUpdate||reloaded)return false;
    applyingUpdate=true;
    updateMessage('Đang kiểm tra phiên bản và dữ liệu chưa đồng bộ…',true);
    try{
      if(window.mybRelationalRealtimeV1577){
        var queue=await bounded(mybRelationalRealtimeV1577.queueAll(),10000,'Không thể kiểm tra dữ liệu đang chờ.');
        if(queue&&queue.length)throw Error('Hãy đối chiếu dữ liệu chờ trước khi cập nhật.');
      }
      if(updateBlocked())throw Error('Hãy lưu/đóng nội dung đang sửa và đối chiếu dữ liệu chờ trước khi cập nhật.');
      // Fetch fresh build metadata instead of trusting a stale SW waiting reference.
      await bounded(checkBuild(),10000,'Không thể kiểm tra phiên bản mới.');
      if(!isNewer(targetBuild,BUILD))throw Error('Chưa tìm thấy phiên bản mới hơn '+BUILD+'.');
      updateMessage('Đang chuẩn bị tải phiên bản '+targetBuild+'…',true);
      await verifyHTML(targetBuild);
      var reg=window.MYB_SW_REG;
      if(!reg&&navigator.serviceWorker&&navigator.serviceWorker.getRegistration){
        try{reg=await bounded(navigator.serviceWorker.getRegistration(),3500)}catch(ignore){}
      }
      if(reg){
        try{await bounded(reg.update(),4500)}catch(ignore){}
        if(reg.waiting){
          reg.waiting.postMessage({type:'MEYEUBE_SKIP_WAITING'});
          updateMessage('Đang kích hoạt phiên bản '+targetBuild+'…',true);
          // iOS Safari sometimes doesn't dispatch controllerchange to a
          // standalone window. New HTML was verified above, so hard-navigate
          // after a grace period rather than leaving Update looking inert.
          updateFallbackTimer=setTimeout(function(){if(applyingUpdate&&!reloaded)reloadApproved()},3500);
          return true;
        }
      }
      reloadApproved();return true;
    }catch(e){
      updateFailed((e&&e.message)||'Không thể cập nhật. Vui lòng thử lại.');
      return false;
    }
  }
  function requestReload(reason){
    var warning=!!reason&&(reason.indexOf('Hãy ')===0||reason.indexOf('Không ')===0||reason.indexOf('Chưa ')===0||reason.indexOf('Máy chủ ')===0);
    if(!applyingUpdate&&!warning&&(!isNewer(targetBuild,BUILD)||alreadyHandled(targetBuild)))return;
    pendingUpdate=reason||'update';
    function offer(){
      if(!window.mybStartupGate||!window.mybStartupGate.ready||window.mybStartupGate.state!=='ready')return;
      var home=document.getElementById('home');if(home&&home.classList.contains('hidden'))return;
      var box=document.getElementById('mybUpdateNotice');
      if(!box){
        // Modal layer darkens the app but keeps it visible behind the update popup.
        var layer=document.createElement('div');layer.id='mybUpdateBackdrop';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);
        box=document.createElement('div');box.id='mybUpdateNotice';box.className='mybStatus';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','mybUpdateText');
        var message=document.createElement('p');message.id='mybUpdateText';box.appendChild(message);
        var applyBtn=document.createElement('button');applyBtn.type='button';applyBtn.textContent='Cập nhật ứng dụng';applyBtn.onclick=applyUpdate;box.appendChild(applyBtn);
        var dismiss=document.createElement('button');dismiss.type='button';dismiss.className='ghost';dismiss.textContent='Để sau';
        dismiss.onclick=function(){if(targetBuild)remember(dismissedKey,targetBuild);closeUpdateNotice()};box.appendChild(dismiss);
        document.body.appendChild(box);
      }
      updateMessage(warning?reason:'Có phiên bản mới '+targetBuild+'. Lưu nội dung đang nhập trước khi cập nhật.',applyingUpdate);
    }
    if(document.body)offer();else document.addEventListener('DOMContentLoaded',offer,{once:true});
  }
  window.addEventListener('myb:dashboard-ready',function(){if(pendingUpdate)requestReload(pendingUpdate)});
  window.mybAppUpdateState=function(){return pendingUpdate};
  window.mybPwaUpdate={apply:applyUpdate,isBlocked:updateBlocked,offerPending:function(){if(pendingUpdate)requestReload(pendingUpdate)}};

  /* Xoá sạch mọi bộ nhớ đệm của app (không đụng localStorage = dữ liệu của bé) */
  function purge(){
    var jobs=[];
    try{
      if('caches' in window)jobs.push(caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){return caches.delete(k)}));
      }));
    }catch(e){}
    try{
      if('serviceWorker' in navigator)jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){
        return Promise.all(rs.map(function(r){return r.unregister()}));
      }));
    }catch(e){}
    return Promise.all(jobs).catch(function(){});
  }
  window.mybPurgeCaches=purge;

  /* ---- Lớp 2: đối chiếu build với máy chủ ---- */
  function checkBuild(){
    if(!window.fetch)return Promise.resolve();
    return fetch('./build.json?t='+Date.now(),{cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){
        if(!j||!j.build)return;
        targetBuild=String(j.build);
        if(isNewer(targetBuild,BUILD))requestReload('build '+BUILD+' → '+targetBuild);
        else{closeUpdateNotice();if(targetBuild===BUILD){clearStored(attemptedKey);clearStored(dismissedKey)}}
      }).catch(function(){});
  }

  /* ---- Lớp 1 + 3: Service Worker ---- */
  function registerSW(){
    if(!('serviceWorker' in navigator))return;
    var opt={scope:'./'};
    try{opt.updateViaCache='none'}catch(e){}
    navigator.serviceWorker.register('./sw.js',opt).then(function(reg){
      window.MYB_SW_REG=reg;
      try{reg.update()}catch(e){}
      setInterval(function(){try{reg.update()}catch(e){}},15*60*1000);
      if(reg.waiting)checkBuild();
      reg.addEventListener('updatefound',function(){
        var sw=reg.installing;if(!sw)return;
        sw.addEventListener('statechange',function(){
          if(sw.state==='installed'&&navigator.serviceWorker.controller)checkBuild();
        });
      });
    }).catch(function(){});

    /* Controller changes can be first installation; verify build without reloading. */
    navigator.serviceWorker.addEventListener('controllerchange',function(){if(applyingUpdate)reloadApproved();else checkBuild()});

    /* Service Worker hỏi \"bạn đang chạy bản nào?\" → trả lời để nó biết trang này
       có cần bị làm mới không. Trang bản cũ không biết trả lời → SW tự nạp lại hộ. */
    navigator.serviceWorker.addEventListener('message',function(ev){
      var d=(ev&&ev.data)||{};
      if(d.type==='MEYEUBE_BUILD_PING'&&navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage({type:'MEYEUBE_BUILD_ACK',build:BUILD});
      }
      if(d.type==='MEYEUBE_FORCE_RELOAD')checkBuild();
    });
  }

  registerSW();
  checkBuild();
  /* Mở lại app từ nền (PWA trên iOS hay giữ trang cả tuần) → kiểm tra lại */
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState!=='visible')return;
    try{apply()}catch(e){}
    checkBuild();
    try{if(window.MYB_SW_REG)window.MYB_SW_REG.update()}catch(e){}
  });
  window.addEventListener('pageshow',function(e){if(e&&e.persisted)checkBuild()});
})();
