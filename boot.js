/* ============================================================================
   🛡️ V14.6.0 · BOOT GUARD — "không bao giờ mở lại giao diện cũ"
   Chạy TRƯỚC app.js. Ba lớp bảo vệ, độc lập nhau:
     1) Đăng ký Service Worker với updateViaCache:'none' → file sw.js luôn được
        tải mới, không bị bộ nhớ đệm HTTP của iOS giữ lại bản cũ.
     2) Đối chiếu số hiệu bản dựng (build) của trang đang mở với build.json trên
        máy chủ (no-store). Lệch nhau = trang này là bản CŨ → xoá sạch cache,
        gỡ Service Worker và nạp lại đúng MỘT lần.
     3) Nghe tín hiệu từ Service Worker mới kích hoạt → nạp lại ngay.
   Toàn bộ đều có khoá chống lặp vô hạn (sessionStorage), không đụng dữ liệu.
   ========================================================================== */
(function(){
  var BUILD='14.6.0';
  var RELOAD_FLAG='mybReloadGuard_v1';
  window.MYB_BUILD=BUILD;
  try{document.documentElement.setAttribute('data-myb-build',BUILD)}catch(e){}

  function reloadOnce(reason){
    var now=Date.now(),last=0;
    try{last=Number(sessionStorage.getItem(RELOAD_FLAG)||0)}catch(e){}
    if(now-last<20000)return;                       /* vừa nạp lại xong → thôi */
    try{sessionStorage.setItem(RELOAD_FLAG,String(now))}catch(e){}
    try{console.info('[MYB] reload:',reason)}catch(e){}
    var url=location.href.split('#')[0]
      .replace(/[?&]b=\d+/g,'')          /* bỏ tham số nạp lại của lần trước */
      .replace(/\?&/,'?').replace(/[?&]$/,'');
    url+=(url.indexOf('?')>=0?'&':'?')+'b='+now;
    location.replace(url);
  }

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
    if(!window.fetch)return;
    fetch('./build.json?t='+Date.now(),{cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){
        if(!j||!j.build)return;
        if(String(j.build)!==BUILD)purge().then(function(){reloadOnce('build '+BUILD+' → '+j.build)});
      })
      .catch(function(){});
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
      if(reg.waiting&&reg.waiting.postMessage)reg.waiting.postMessage({type:'MEYEUBE_SKIP_WAITING'});
      reg.addEventListener('updatefound',function(){
        var sw=reg.installing;if(!sw)return;
        sw.addEventListener('statechange',function(){
          if(sw.state==='installed'&&navigator.serviceWorker.controller)sw.postMessage({type:'MEYEUBE_SKIP_WAITING'});
        });
      });
    }).catch(function(){});

    /* Bản mới giành quyền điều khiển → trang đang mở là bản cũ → nạp lại */
    navigator.serviceWorker.addEventListener('controllerchange',function(){reloadOnce('controllerchange')});

    /* Service Worker hỏi \"bạn đang chạy bản nào?\" → trả lời để nó biết trang này
       có cần bị làm mới không. Trang bản cũ không biết trả lời → SW tự nạp lại hộ. */
    navigator.serviceWorker.addEventListener('message',function(ev){
      var d=(ev&&ev.data)||{};
      if(d.type==='MEYEUBE_BUILD_PING'&&navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage({type:'MEYEUBE_BUILD_ACK',build:BUILD});
      }
      if(d.type==='MEYEUBE_FORCE_RELOAD')reloadOnce('sw force');
    });
  }

  registerSW();
  checkBuild();
  /* Mở lại app từ nền (PWA trên iOS hay giữ trang cả tuần) → kiểm tra lại */
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState!=='visible')return;
    checkBuild();
    try{if(window.MYB_SW_REG)window.MYB_SW_REG.update()}catch(e){}
  });
  window.addEventListener('pageshow',function(e){if(e&&e.persisted)checkBuild()});
})();
