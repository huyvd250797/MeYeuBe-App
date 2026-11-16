/* V17.22.6: atomic app-shell install; explicit activation; current-build offline fallback only. */
const BUILD='17.22.6';
const CACHE_NAME='meyeube-v'+BUILD;
const ASSETS=[
  './src/features/seasonal/art/tet-photo-hero-v3.webp',
  './src/features/seasonal/art/tet-photo-header-v3.webp',
  './src/features/seasonal/art/tet-photo-accent-v3.webp',
  './src/features/seasonal/art/beach-photo-hero-v3.webp',
  './src/features/seasonal/art/beach-photo-header-v3.webp',
  './src/features/seasonal/art/beach-photo-accent-v3.webp',
  './src/features/seasonal/art/reunification-photo-hero-v3.webp',
  './src/features/seasonal/art/reunification-photo-header-v3.webp',
  './src/features/seasonal/art/reunification-photo-accent-v3.webp',
  './src/features/seasonal/art/children-photo-hero-v3.webp',
  './src/features/seasonal/art/children-photo-header-v3.webp',
  './src/features/seasonal/art/children-photo-accent-v3.webp',
  './src/features/seasonal/art/birthday-photo-hero-v3.webp',
  './src/features/seasonal/art/birthday-photo-header-v3.webp',
  './src/features/seasonal/art/birthday-photo-accent-v3.webp',
  './src/features/seasonal/art/midautumn-photo-hero-v3.webp',
  './src/features/seasonal/art/midautumn-photo-header-v3.webp',
  './src/features/seasonal/art/midautumn-photo-accent-v3.webp',
  './src/features/seasonal/art/school-photo-hero-v3.webp',
  './src/features/seasonal/art/school-photo-header-v3.webp',
  './src/features/seasonal/art/school-photo-accent-v3.webp',
  './src/features/seasonal/art/halloween-photo-hero-v3.webp',
  './src/features/seasonal/art/halloween-photo-header-v3.webp',
  './src/features/seasonal/art/halloween-photo-accent-v3.webp',
  './src/features/seasonal/art/teachers-photo-hero-v3.webp',
  './src/features/seasonal/art/teachers-photo-header-v3.webp',
  './src/features/seasonal/art/teachers-photo-accent-v3.webp',
  './src/features/seasonal/art/christmas-photo-hero-v3.webp',
  './src/features/seasonal/art/christmas-photo-header-v3.webp',
  './src/features/seasonal/art/christmas-photo-accent-v3.webp',
  './src/features/seasonal/art/nationalday-photo-hero-v3.webp',
  './src/features/seasonal/art/nationalday-photo-header-v3.webp',
  './src/features/seasonal/art/nationalday-photo-accent-v3.webp',
  './src/features/seasonal/art/womenvn-photo-hero-v3.webp',
  './src/features/seasonal/art/womenvn-photo-header-v3.webp',
  './src/features/seasonal/art/womenvn-photo-accent-v3.webp',
  './src/features/seasonal/art/family-photo-hero-v3.webp',
  './src/features/seasonal/art/family-photo-header-v3.webp',
  './src/features/seasonal/art/family-photo-accent-v3.webp',
  './src/features/seasonal/art/vulan-photo-hero-v3.webp',
  './src/features/seasonal/art/vulan-photo-header-v3.webp',
  './src/features/seasonal/art/vulan-photo-accent-v3.webp',
  './src/features/seasonal/art/hungking-photo-hero-v3.webp',
  './src/features/seasonal/art/hungking-photo-header-v3.webp',
  './src/features/seasonal/art/hungking-photo-accent-v3.webp',
  './src/features/seasonal/art/culture-photo-hero-v3.webp',
  './src/features/seasonal/art/culture-photo-header-v3.webp',
  './src/features/seasonal/art/culture-photo-accent-v3.webp',
  './src/features/seasonal/art/womensday-photo-hero-v3.webp',
  './src/features/seasonal/art/womensday-photo-header-v3.webp',
  './src/features/seasonal/art/womensday-photo-accent-v3.webp',
  './src/features/seasonal/art/doanngo-photo-hero-v3.webp',
  './src/features/seasonal/art/doanngo-photo-header-v3.webp',
  './src/features/seasonal/art/doanngo-photo-accent-v3.webp',
  './src/features/seasonal/art/nguyentieu-photo-hero-v3.webp',
  './src/features/seasonal/art/nguyentieu-photo-header-v3.webp',
  './src/features/seasonal/art/nguyentieu-photo-accent-v3.webp',
  './src/features/seasonal/art/newyear-photo-hero-v3.webp',
  './src/features/seasonal/art/newyear-photo-header-v3.webp',
  './src/features/seasonal/art/newyear-photo-accent-v3.webp',
  './src/features/seasonal/art/tet-card-1.webp','./src/features/seasonal/art/tet-card-2.webp','./src/features/seasonal/art/tet-card-3.webp','./src/features/seasonal/art/tet-card-4.webp','./src/features/seasonal/art/tet-card-5.webp','./src/features/seasonal/art/tet-card-6.webp','./src/features/seasonal/art/tet-card-7.webp','./src/features/seasonal/art/tet-card-8.webp',
  './src/features/seasonal/art/beach-card-1.webp','./src/features/seasonal/art/beach-card-2.webp','./src/features/seasonal/art/beach-card-3.webp','./src/features/seasonal/art/beach-card-4.webp','./src/features/seasonal/art/beach-card-5.webp','./src/features/seasonal/art/beach-card-6.webp','./src/features/seasonal/art/beach-card-7.webp','./src/features/seasonal/art/beach-card-8.webp',
  './src/features/seasonal/art/reunification-card-1.webp','./src/features/seasonal/art/reunification-card-2.webp','./src/features/seasonal/art/reunification-card-3.webp','./src/features/seasonal/art/reunification-card-4.webp','./src/features/seasonal/art/reunification-card-5.webp','./src/features/seasonal/art/reunification-card-6.webp','./src/features/seasonal/art/reunification-card-7.webp','./src/features/seasonal/art/reunification-card-8.webp',
  './src/features/seasonal/art/children-card-1.webp','./src/features/seasonal/art/children-card-2.webp','./src/features/seasonal/art/children-card-3.webp','./src/features/seasonal/art/children-card-4.webp','./src/features/seasonal/art/children-card-5.webp','./src/features/seasonal/art/children-card-6.webp','./src/features/seasonal/art/children-card-7.webp','./src/features/seasonal/art/children-card-8.webp',
  './src/features/seasonal/art/birthday-card-1.webp','./src/features/seasonal/art/birthday-card-2.webp','./src/features/seasonal/art/birthday-card-3.webp','./src/features/seasonal/art/birthday-card-4.webp','./src/features/seasonal/art/birthday-card-5.webp','./src/features/seasonal/art/birthday-card-6.webp','./src/features/seasonal/art/birthday-card-7.webp','./src/features/seasonal/art/birthday-card-8.webp',
  './src/features/seasonal/art/midautumn-card-1.webp','./src/features/seasonal/art/midautumn-card-2.webp','./src/features/seasonal/art/midautumn-card-3.webp','./src/features/seasonal/art/midautumn-card-4.webp','./src/features/seasonal/art/midautumn-card-5.webp','./src/features/seasonal/art/midautumn-card-6.webp','./src/features/seasonal/art/midautumn-card-7.webp','./src/features/seasonal/art/midautumn-card-8.webp',
  './src/features/seasonal/art/school-card-1.webp','./src/features/seasonal/art/school-card-2.webp','./src/features/seasonal/art/school-card-3.webp','./src/features/seasonal/art/school-card-4.webp','./src/features/seasonal/art/school-card-5.webp','./src/features/seasonal/art/school-card-6.webp','./src/features/seasonal/art/school-card-7.webp','./src/features/seasonal/art/school-card-8.webp',
  './src/features/seasonal/art/halloween-card-1.webp','./src/features/seasonal/art/halloween-card-2.webp','./src/features/seasonal/art/halloween-card-3.webp','./src/features/seasonal/art/halloween-card-4.webp','./src/features/seasonal/art/halloween-card-5.webp','./src/features/seasonal/art/halloween-card-6.webp','./src/features/seasonal/art/halloween-card-7.webp','./src/features/seasonal/art/halloween-card-8.webp',
  './src/features/seasonal/art/teachers-card-1.webp','./src/features/seasonal/art/teachers-card-2.webp','./src/features/seasonal/art/teachers-card-3.webp','./src/features/seasonal/art/teachers-card-4.webp','./src/features/seasonal/art/teachers-card-5.webp','./src/features/seasonal/art/teachers-card-6.webp','./src/features/seasonal/art/teachers-card-7.webp','./src/features/seasonal/art/teachers-card-8.webp',
  './src/features/seasonal/art/christmas-card-1.webp','./src/features/seasonal/art/christmas-card-2.webp','./src/features/seasonal/art/christmas-card-3.webp','./src/features/seasonal/art/christmas-card-4.webp','./src/features/seasonal/art/christmas-card-5.webp','./src/features/seasonal/art/christmas-card-6.webp','./src/features/seasonal/art/christmas-card-7.webp','./src/features/seasonal/art/christmas-card-8.webp',
  './src/features/seasonal/art/culture-base-v2.webp',
  './src/features/seasonal/art/culture-card-1.webp',
  './src/features/seasonal/art/culture-card-2.webp',
  './src/features/seasonal/art/culture-card-3.webp',
  './src/features/seasonal/art/culture-card-4.webp',
  './src/features/seasonal/art/culture-card-5.webp',
  './src/features/seasonal/art/culture-card-6.webp',
  './src/features/seasonal/art/culture-card-7.webp',
  './src/features/seasonal/art/culture-card-8.webp',
  './src/features/seasonal/art/culture-piece-v2.webp',
  './src/features/seasonal/art/doanngo-base-v2.webp',
  './src/features/seasonal/art/doanngo-card-1.webp',
  './src/features/seasonal/art/doanngo-card-2.webp',
  './src/features/seasonal/art/doanngo-card-3.webp',
  './src/features/seasonal/art/doanngo-card-4.webp',
  './src/features/seasonal/art/doanngo-card-5.webp',
  './src/features/seasonal/art/doanngo-card-6.webp',
  './src/features/seasonal/art/doanngo-card-7.webp',
  './src/features/seasonal/art/doanngo-card-8.webp',
  './src/features/seasonal/art/doanngo-piece-v2.webp',
  './src/features/seasonal/art/family-base-v2.webp',
  './src/features/seasonal/art/family-card-1.webp',
  './src/features/seasonal/art/family-card-2.webp',
  './src/features/seasonal/art/family-card-3.webp',
  './src/features/seasonal/art/family-card-4.webp',
  './src/features/seasonal/art/family-card-5.webp',
  './src/features/seasonal/art/family-card-6.webp',
  './src/features/seasonal/art/family-card-7.webp',
  './src/features/seasonal/art/family-card-8.webp',
  './src/features/seasonal/art/family-piece-v2.webp',
  './src/features/seasonal/art/hungking-base-v2.webp',
  './src/features/seasonal/art/hungking-card-1.webp',
  './src/features/seasonal/art/hungking-card-2.webp',
  './src/features/seasonal/art/hungking-card-3.webp',
  './src/features/seasonal/art/hungking-card-4.webp',
  './src/features/seasonal/art/hungking-card-5.webp',
  './src/features/seasonal/art/hungking-card-6.webp',
  './src/features/seasonal/art/hungking-card-7.webp',
  './src/features/seasonal/art/hungking-card-8.webp',
  './src/features/seasonal/art/hungking-piece-v2.webp',
  './src/features/seasonal/art/nationalday-base-v2.webp',
  './src/features/seasonal/art/nationalday-card-1.webp',
  './src/features/seasonal/art/nationalday-card-2.webp',
  './src/features/seasonal/art/nationalday-card-3.webp',
  './src/features/seasonal/art/nationalday-card-4.webp',
  './src/features/seasonal/art/nationalday-card-5.webp',
  './src/features/seasonal/art/nationalday-card-6.webp',
  './src/features/seasonal/art/nationalday-card-7.webp',
  './src/features/seasonal/art/nationalday-card-8.webp',
  './src/features/seasonal/art/nationalday-piece-v2.webp',
  './src/features/seasonal/art/newyear-base-v2.webp',
  './src/features/seasonal/art/newyear-card-1.webp',
  './src/features/seasonal/art/newyear-card-2.webp',
  './src/features/seasonal/art/newyear-card-3.webp',
  './src/features/seasonal/art/newyear-card-4.webp',
  './src/features/seasonal/art/newyear-card-5.webp',
  './src/features/seasonal/art/newyear-card-6.webp',
  './src/features/seasonal/art/newyear-card-7.webp',
  './src/features/seasonal/art/newyear-card-8.webp',
  './src/features/seasonal/art/newyear-piece-v2.webp',
  './src/features/seasonal/art/nguyentieu-base-v2.webp',
  './src/features/seasonal/art/nguyentieu-card-1.webp',
  './src/features/seasonal/art/nguyentieu-card-2.webp',
  './src/features/seasonal/art/nguyentieu-card-3.webp',
  './src/features/seasonal/art/nguyentieu-card-4.webp',
  './src/features/seasonal/art/nguyentieu-card-5.webp',
  './src/features/seasonal/art/nguyentieu-card-6.webp',
  './src/features/seasonal/art/nguyentieu-card-7.webp',
  './src/features/seasonal/art/nguyentieu-card-8.webp',
  './src/features/seasonal/art/nguyentieu-piece-v2.webp',
  './src/features/seasonal/art/vulan-base-v2.webp',
  './src/features/seasonal/art/vulan-card-1.webp',
  './src/features/seasonal/art/vulan-card-2.webp',
  './src/features/seasonal/art/vulan-card-3.webp',
  './src/features/seasonal/art/vulan-card-4.webp',
  './src/features/seasonal/art/vulan-card-5.webp',
  './src/features/seasonal/art/vulan-card-6.webp',
  './src/features/seasonal/art/vulan-card-7.webp',
  './src/features/seasonal/art/vulan-card-8.webp',
  './src/features/seasonal/art/vulan-piece-v2.webp',
  './src/features/seasonal/art/womensday-base-v2.webp',
  './src/features/seasonal/art/womensday-card-1.webp',
  './src/features/seasonal/art/womensday-card-2.webp',
  './src/features/seasonal/art/womensday-card-3.webp',
  './src/features/seasonal/art/womensday-card-4.webp',
  './src/features/seasonal/art/womensday-card-5.webp',
  './src/features/seasonal/art/womensday-card-6.webp',
  './src/features/seasonal/art/womensday-card-7.webp',
  './src/features/seasonal/art/womensday-card-8.webp',
  './src/features/seasonal/art/womensday-piece-v2.webp',
  './src/features/seasonal/art/womenvn-base-v2.webp',
  './src/features/seasonal/art/womenvn-card-1.webp',
  './src/features/seasonal/art/womenvn-card-2.webp',
  './src/features/seasonal/art/womenvn-card-3.webp',
  './src/features/seasonal/art/womenvn-card-4.webp',
  './src/features/seasonal/art/womenvn-card-5.webp',
  './src/features/seasonal/art/womenvn-card-6.webp',
  './src/features/seasonal/art/womenvn-card-7.webp',
  './src/features/seasonal/art/womenvn-card-8.webp',
  './src/features/seasonal/art/womenvn-piece-v2.webp',
  './src/styles/seasonal.css','./src/features/seasonal/calendar.js','./src/features/seasonal/model.js','./src/features/seasonal/illustration.js','./src/features/seasonal/motion-canvas.js','./src/features/seasonal/ui.js','./src/features/seasonal/art/beach-base-v2.webp','./src/features/seasonal/art/beach-piece-v2.webp','./src/features/seasonal/art/birthday-base-v2.webp','./src/features/seasonal/art/birthday-piece-v2.webp','./src/features/seasonal/art/children-base-v2.webp','./src/features/seasonal/art/children-piece-v2.webp','./src/features/seasonal/art/christmas-base-v2.webp','./src/features/seasonal/art/christmas-piece-v2.webp','./src/features/seasonal/art/halloween-base-v2.webp','./src/features/seasonal/art/halloween-piece-v2.webp','./src/features/seasonal/art/midautumn-base-v2.webp','./src/features/seasonal/art/midautumn-piece-v2.webp','./src/features/seasonal/art/reunification-base-v2.webp','./src/features/seasonal/art/reunification-piece-v2.webp','./src/features/seasonal/art/school-base-v2.webp','./src/features/seasonal/art/school-piece-v2.webp','./src/features/seasonal/art/teachers-base-v2.webp','./src/features/seasonal/art/teachers-piece-v2.webp','./src/features/seasonal/art/tet-base-v2.webp','./src/features/seasonal/art/tet-piece-v2.webp',
  "./src/styles/calendar.css",'./src/features/planning/albums.js','./src/ui/quick-order.js','./src/styles/quick-order.css',
 './src/features/planning/memories.js?v=17.22.6', './src/styles/memories.css?v=17.22.6','./src/features/planning/packing.js','./src/styles/packing.css','./src/ui/components/dashboard-polish.js','./src/ui/components/health-polish.js','./src/styles/dashboard-polish.css','./src/ui/components/health-profile.js','./src/styles/health-foundation.css','./src/ui/viewport-core.js','./src/styles/viewport.css','./src/ui/visible-render.js','./src/styles/loading.css','./src/ui/form-viewport.js','./src/features/health/planning.js','./src/styles/health-planning.css','./src/features/care/milk-insights.js','./src/ui/form-footers.js','./src/styles/milk-insights.css','./src/features/care/workflow.js','./src/styles/care-workflow.css','./src/ui/accessibility.js','./src/styles/accessibility.css','./src/features/notifications/rules.js','./src/features/notifications/ui.js','./src/features/backup/service.js','./src/features/backup/ui.js','./src/features/media/storage.js','./src/features/media/ui.js','./src/styles/forms.css','./src/features/cloud/controls.js','./src/ui/text-display.js','./src/styles/legacy.css','./src/styles/tokens.css','./src/styles/components.css','./src/ui/components/health-modal.js','./src/ui/components/appointment-form.js','./src/ui/runtime.js','./src/ui/overlays.js','./src/ui/components/loading.js','./src/ui/components/dashboard.js','./src/ui/components/care-timeline.js','./src/ui/components/milk-inventory.js','./src/ui/components/record-list.js','./src/ui/components/care-form.js','./src/ui/components/milk-picker.js','./src/ui/render-coordinator.js','./src/features/care/milk-selection-service.js','./src/features/care/milk-selection.js','./src/data/realtime-repository.js','./src/features/realtime/ui.js','./src/data/health-repository.js','./src/features/health/service.js','./src/features/health/ui.js','./src/data/planning-repository.js','./src/features/planning/service.js','./src/features/planning/ui.js','./src/data/settings-repository.js','./src/data/scoped-repository.js','./src/features/scoped/ui.js','./src/data/care-repository.js','./src/features/care/service.js','./src/features/care/ui.js','./src/data/client.js','./src/data/cache.js','./src/data/catalog-repository.js','./src/features/catalog/service.js','./src/features/catalog/ui.js','./','./index.html','./boot.js',"./src/features/care/model.js","./src/features/care/form-controller.js","./src/features/health/model.js","./src/features/health/legacy-controller.js","./src/features/planning/legacy-controller.js","./src/features/dashboard/model.js",'./app.js','./relational-v1577.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png','./src/features/care/drafts.js'];
function isCode(req){return req.mode==='navigate'||['document','script','style','manifest'].includes(req.destination)||/\.(?:js|css|html|webmanifest|json)(?:\?|$)/i.test(req.url)}
function validResponse(response){if(!response||!response.ok)throw new Error('App asset unavailable');return response}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try{for(let i=0;i<ASSETS.length;i+=12){await Promise.all(ASSETS.slice(i,i+12).map(async path=>{const response=validResponse(await fetch(new Request(path,{cache:'reload'})));const type=response.headers.get('Content-Type')||'';if(/\.(?:js|css)$/.test(path)&&/text\/html/i.test(type))throw new Error('HTML returned for code asset');if((path==='./'||path==='./index.html')&&/text\/html/i.test(type)){const body=await response.clone().text();if(!body.includes('name="myb-build" content="'+BUILD+'"'))throw new Error('App HTML build does not match worker')}await cache.put(path,response)}))}}
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
importScripts('./src/features/notifications/rules.js?v=17.22.6');
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
