/* V17.22.45: theme before first paint; network build check; vu lan dedicated motion engine; offer updates without navigating active clients. */
(function(){
  var BUILD='17.22.45';
  window.MYB_BUILD=BUILD;
  try{document.documentElement.setAttribute('data-myb-build',BUILD)}catch(e){}

  /* --------------------------------------------------------------------------
     🌗 V17.22.45 · THEME BOOTSTRAP — chọn đúng sáng/tối TRƯỚC khi vẽ khung hình
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

  /* Đang ở 'auto' mà người dùng bật/tắt Dark Mode của máy → đổi theo ngay */
  try{
    var mq=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
    if(mq){
      var onChange=function(){if(readMode()==='auto')apply()};
      if(mq.addEventListener)mq.addEventListener('change',onChange);
      else if(mq.addListener)mq.addListener(onChange);
    }
  }catch(e){}


  var pendingUpdate='',targetBuild='',applyingUpdate=false,reloaded=false;
  function versionParts(x){return String(x||'').split('.').map(function(n){return Number(n)||0})}
  function isNewer(x,y){var a=versionParts(x),b=versionParts(y);for(var i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i]}return false}
  var attemptedKey='mybPwaAttemptedBuild_v172221',dismissedKey='mybPwaDismissedBuild_v172221';
  function stored(k){try{return sessionStorage.getItem(k)||''}catch(e){return ''}}
  function remember(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
  function clearStored(k){try{sessionStorage.removeItem(k)}catch(e){}}
  function closeUpdateNotice(){pendingUpdate='';clearNotice()}
  // Do not offer the identical update repeatedly after the user clicks Update
  // or Later in the SAME browser session. A different build remains eligible.
  function alreadyHandled(v){return !!v&&(stored(attemptedKey)===v||stored(dismissedKey)===v)}
  function clearNotice(){var box=document.getElementById('mybUpdateNotice');if(box)box.remove()}
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
  function reloadApproved(){
    if(reloaded)return;
    if(updateBlocked()){applyingUpdate=false;requestReload('Hãy lưu hoặc đóng nội dung đang sửa trước khi cập nhật.');return}
    closeUpdateNotice();reloaded=true;
    // Prevent repeated reload loops if a CDN/hosting node still serves stale HTML.
    if(targetBuild)remember(attemptedKey,targetBuild);
    location.reload();
  }
  async function applyUpdate(){
    if(applyingUpdate||reloaded)return false;
    try{if(window.mybRelationalRealtimeV1577&&(await mybRelationalRealtimeV1577.queueAll()).length){requestReload('Hãy đối chiếu dữ liệu chờ trước khi cập nhật.');return false}}catch(e){requestReload('Hãy kiểm tra dữ liệu chờ trước khi cập nhật.');return false}
    if(updateBlocked()){requestReload('Hãy lưu/đóng nội dung đang sửa và đối chiếu dữ liệu chờ trước khi cập nhật.');return false}
    // Trust the live server version, not an old worker waiting in the browser.
    await checkBuild();
    if(!isNewer(targetBuild,BUILD)){closeUpdateNotice();return false}
    applyingUpdate=true;
    try{
      var reg=window.MYB_SW_REG;
      if(reg){
        if(!reg.waiting)try{await reg.update()}catch(ignore){}
        if(reg.waiting){
          closeUpdateNotice();
          // Suppress repeated notices for this target while waiting for Safari's controllerchange.
          remember(attemptedKey,targetBuild);
          reg.waiting.postMessage({type:'MEYEUBE_SKIP_WAITING'});
          return true;
        }
      }
      // On Safari/PWA without a waiting worker, only reload after we have
      // independently verified index.html itself advertises the new build.
      var response=await fetch('./index.html?myb-update='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw Error('Không tải được trang cập nhật.');
      var html=await response.text();
      if(html.indexOf('name="myb-build" content="'+targetBuild+'"')<0)
        throw Error('Máy chủ chưa phát hành đủ các tệp phiên bản mới.');
      reloadApproved();return true;
    }catch(e){
      applyingUpdate=false;
      requestReload('Hãy thử cập nhật lại sau: '+(e.message||'chưa sẵn sàng'));
      return false;
    }
  }
  function requestReload(reason){
    var showWarning=reason&&reason.indexOf('Hãy ')===0;
    if(!showWarning&&(!isNewer(targetBuild,BUILD)||alreadyHandled(targetBuild)))return;
    pendingUpdate=reason||'update';
    function offer(){
      if(!window.mybStartupGate||!window.mybStartupGate.ready||window.mybStartupGate.state!=='ready')return;
      var home=document.getElementById('home');if(home&&home.classList.contains('hidden'))return;
      var box=document.getElementById('mybUpdateNotice');
      if(!box){
        box=document.createElement('div');box.id='mybUpdateNotice';box.className='mybStatus';box.setAttribute('role','status');
        var message=document.createElement('p');message.id='mybUpdateText';box.appendChild(message);
        var applyBtn=document.createElement('button');applyBtn.type='button';applyBtn.textContent='Cập nhật ứng dụng';applyBtn.onclick=applyUpdate;box.appendChild(applyBtn);
        var dismiss=document.createElement('button');dismiss.type='button';dismiss.className='ghost';dismiss.textContent='Để sau';
        dismiss.onclick=function(){if(targetBuild)remember(dismissedKey,targetBuild);closeUpdateNotice()};box.appendChild(dismiss);
        document.body.appendChild(box);
      }
      document.getElementById('mybUpdateText').textContent=showWarning?reason:'Có phiên bản mới. Lưu nội dung đang nhập trước khi cập nhật.';
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
