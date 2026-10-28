/* V17.13.0: atomic app-shell install; explicit activation; current-build offline fallback only. */
const BUILD='17.13.0';
const CACHE_NAME='meyeube-v'+BUILD;
const ASSETS=['./src/ui/components/dashboard-polish.js','./src/ui/components/health-polish.js','./src/styles/dashboard-polish.css','./src/ui/components/health-profile.js','./src/styles/health-foundation.css','./src/ui/viewport-core.js','./src/styles/viewport.css','./src/ui/visible-render.js','./src/styles/loading.css','./src/ui/form-viewport.js','./src/features/health/planning.js','./src/styles/health-planning.css','./src/features/care/milk-insights.js','./src/ui/form-footers.js','./src/styles/milk-insights.css','./src/features/care/workflow.js','./src/styles/care-workflow.css','./src/ui/accessibility.js','./src/styles/accessibility.css','./src/features/notifications/rules.js','./src/features/notifications/ui.js','./src/features/backup/service.js','./src/features/backup/ui.js','./src/features/media/storage.js','./src/features/media/ui.js','./src/styles/forms.css','./src/features/cloud/controls.js','./src/ui/text-display.js','./src/styles/legacy.css','./src/styles/tokens.css','./src/styles/components.css','./src/ui/components/health-modal.js','./src/ui/components/appointment-form.js','./src/ui/runtime.js','./src/ui/overlays.js','./src/ui/components/loading.js','./src/ui/components/dashboard.js','./src/ui/components/care-timeline.js','./src/ui/components/milk-inventory.js','./src/ui/components/record-list.js','./src/ui/components/care-form.js','./src/ui/components/milk-picker.js','./src/ui/render-coordinator.js','./src/features/care/milk-selection-service.js','./src/features/care/milk-selection.js','./src/data/realtime-repository.js','./src/features/realtime/ui.js','./src/data/health-repository.js','./src/features/health/service.js','./src/features/health/ui.js','./src/data/planning-repository.js','./src/features/planning/service.js','./src/features/planning/ui.js','./src/data/settings-repository.js','./src/data/scoped-repository.js','./src/features/scoped/ui.js','./src/data/care-repository.js','./src/features/care/service.js','./src/features/care/ui.js','./src/data/client.js','./src/data/cache.js','./src/data/catalog-repository.js','./src/features/catalog/service.js','./src/features/catalog/ui.js','./','./index.html','./boot.js',"./src/features/care/model.js","./src/features/care/form-controller.js","./src/features/health/model.js","./src/features/health/legacy-controller.js","./src/features/planning/legacy-controller.js","./src/features/dashboard/model.js",'./app.js','./relational-v1577.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'];
function isCode(req){return req.mode==='navigate'||['document','script','style','manifest'].includes(req.destination)||/\.(?:js|css|html|webmanifest|json)(?:\?|$)/i.test(req.url)}
function validResponse(response){if(!response||!response.ok)throw new Error('App asset unavailable');return response}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try{await Promise.all(ASSETS.map(async path=>{const response=validResponse(await fetch(new Request(path,{cache:'reload'})));const type=response.headers.get('Content-Type')||'';if(/\.(?:js|css)$/.test(path)&&/text\/html/i.test(type))throw new Error('HTML returned for code asset');if((path==='./'||path==='./index.html')&&/text\/html/i.test(type)){const body=await response.clone().text();if(!body.includes('name="myb-build" content="'+BUILD+'"'))throw new Error('App HTML build does not match worker')}await cache.put(path,response)}))}
  catch(error){await caches.delete(CACHE_NAME);throw error}
  // First install activates naturally. Existing clients retain the old worker until explicit approval.
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  // Keep the immediately previous cache as well: a second tab may still use that release.
  const keys=(await caches.keys()).filter(k=>k.startsWith('meyeube-v'));
  const versions=keys.filter(k=>k!==CACHE_NAME).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const previous=versions.pop();await Promise.all(versions.map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});clients.forEach(c=>c.postMessage({type:'MEYEUBE_BUILD_PING',build:BUILD}));
 })());
});
self.addEventListener('message',event=>{if((event.data||{}).type==='MEYEUBE_SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/build.json')){event.respondWith(fetch(req,{cache:'no-store'}));return}
 if(isCode(req)){
  event.respondWith((async()=>{
   const version=url.searchParams.get('v'),key=new URL(req.url);key.search='';
   const requested=version&&/^\d+\.\d+\.\d+$/.test(version)?'meyeube-v'+version:CACHE_NAME;
   const cache=await caches.open(requested);
   try{const net=await fetch(req,{cache:'no-store'});if(net&&net.ok){const type=net.headers.get('Content-Type')||'';if(/\.(?:js|css)$/.test(url.pathname)&&/text\/html/i.test(type))return await cache.match(key.href)||Response.error();let compatible=true;if((req.mode==='navigate'||req.destination==='document')&&/text\/html/i.test(type)){const body=await net.clone().text();compatible=body.includes('name="myb-build" content="'+BUILD+'"')}if(requested===CACHE_NAME&&compatible){const copy=net.clone();event.waitUntil(cache.put(key.href,copy).catch(()=>{}))}return net}
    const fallback=await cache.match(key.href);return fallback||net;
   }catch(error){const hit=await cache.match(req)||await cache.match(key.href);if(hit)return hit;
    if(req.mode==='navigate'||req.destination==='document')return await cache.match('./index.html')||Response.error();
    return Response.error();
   }
  })());return;
 }
 event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME),hit=await cache.match(req)||await cache.match(url.origin+url.pathname);if(hit)return hit;const response=await fetch(req);if(response&&response.ok)event.waitUntil(cache.put(req,response.clone()).catch(()=>{}));return response})());
});
importScripts('./src/features/notifications/rules.js?v=17.13.0');
self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?event.data.json():{}}catch(e){payload={body:event.data?event.data.text():'Bạn có cảnh báo mới'}}
  if(!payload||typeof payload!=='object')payload={};
  const title=MybNotificationRules.text(payload.title||'Mẹ Yêu Bé','Mẹ Yêu Bé');
  const options={
    body:MybNotificationRules.text(payload.body||'Có cảnh báo mới cần chú ý.'),
    icon:payload.icon||'./icon-192.png',
    badge:payload.badge||'./icon-192.png',
    tag:payload.tag||'meyeube-alert',
    renotify:payload.renotify!==false,
    data:{url:payload.url||'./index.html?openAlertCenter=1',ruleId:payload.ruleId||'',eventKey:payload.eventKey||''}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  let url=new URL('./index.html?openAlertCenter=1',self.location.href).href;
  try{const candidate=new URL((event.notification.data&&event.notification.data.url)||url,self.location.href);if(candidate.origin===self.location.origin)url=candidate.href}catch(e){}
  event.waitUntil((async()=>{
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clientsList){
      if('focus' in client){
        client.postMessage({type:'MEYEUBE_NOTIFICATION_CLICK',data:event.notification.data||{}});
        return client.focus();
      }
    }
    if(self.clients.openWindow)return self.clients.openWindow(url);
  })());
});
