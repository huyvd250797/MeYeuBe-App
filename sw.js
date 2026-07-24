const CACHE_NAME = 'meyeube-v11.4.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});


self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?event.data.json():{}}catch(e){payload={body:event.data?event.data.text():'Bạn có cảnh báo mới'}}
  const title=payload.title||'Mẹ Yêu Bé';
  const options={
    body:payload.body||'Có cảnh báo mới cần chú ý.',
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
  const url=(event.notification.data&&event.notification.data.url)||'./index.html?openAlertCenter=1';
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
