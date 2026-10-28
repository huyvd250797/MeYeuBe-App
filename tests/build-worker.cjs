const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const meta=JSON.parse(fs.readFileSync('docs/BUILD_RESULTS_V17.11.0.json')),version=meta.version;
let checks=0;function ok(label,value){assert.ok(value,label);checks++;console.log('PASS '+label)}
function worker(){
 const events={},stores=new Map([['meyeube-v17.8.2',new Map()]]);let offline=false,missing=null,wrongBuild=false,skips=0,notification;
 const urlFor=p=>new URL(typeof p==='string'?p:p.url,'https://app.test/').href;
 const ctx={URL,Response,Request:class extends Request{constructor(p,options){super(urlFor(p),options)}},Map,Promise,Error,
 self:{location:{origin:'https://app.test',href:'https://app.test/sw.js'},addEventListener:(type,fn)=>events[type]=fn,skipWaiting:()=>skips++,clients:{claim:async()=>{},matchAll:async()=>[]},registration:{showNotification:async(title,options)=>{notification={title,...options}}}},
 fetch:async req=>{if(offline)throw Error('offline');const u=new URL(req.url),local=u.pathname==='/'?'index.html':u.pathname.slice(1);if(local===missing)return new Response('missing',{status:404});const p=path.join('dist',local);if(!fs.existsSync(p))return new Response('missing',{status:404});let body=fs.readFileSync(p);if(wrongBuild&&local==='index.html')body=Buffer.from(body.toString().replace('name="myb-build" content="'+version+'"','name="myb-build" content="99.0.0"'));return new Response(body,{headers:{'Content-Type':local.endsWith('.html')?'text/html':local.endsWith('.js')?'text/javascript':'application/octet-stream'}})},
 caches:{open:async name=>{if(!stores.has(name))stores.set(name,new Map());const s=stores.get(name);return {put:async(p,r)=>s.set(urlFor(p),r.clone()),match:async p=>s.get(urlFor(p))?.clone()}},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)}};
 vm.createContext(ctx);ctx.importScripts=p=>{const local=p.split('?')[0].replace(/^\.\//,'');ok('Worker import is a real production asset',fs.existsSync('dist/'+local));vm.runInContext(fs.readFileSync('dist/'+local,'utf8'),ctx)};
 vm.runInContext(fs.readFileSync('dist/sw.js','utf8'),ctx);
 return {ctx,events,stores,skips:()=>skips,notification:()=>notification,setOffline:v=>offline=v,setMissing:v=>missing=v,setWrongBuild:v=>wrongBuild=v,event:async name=>{let task;events[name]({waitUntil:p=>task=p});await task},request:async p=>{let result;events.fetch({request:{url:urlFor(p),method:'GET',destination:'script',mode:'cors'},waitUntil(){},respondWith:p=>result=p});return await result}};
}
(async()=>{
 let a=worker();await a.event('install');const cache=a.stores.get('meyeube-v'+version);
 ok('Every production shell and lazy asset installs from real dist files',cache.size===13);
 ok('Worker install preserves existing client and previous cache',a.skips()===0&&a.stores.has('meyeube-v17.8.2'));
 a.setOffline(true);const response=await a.request('./'+meta.backup.name);
 ok('Unopened backup chunk is available offline after installation',(await response.text())===fs.readFileSync('dist/'+meta.backup.name,'utf8'));
 let pending;a.events.push({data:{json:()=>({title:'Mẹ Yêu Bé',body:'Thông báo có dấu: đã đến giờ.'})},waitUntil:p=>pending=p});await pending;
 ok('Built worker push handler retains readable Vietnamese',a.notification().title==='Mẹ Yêu Bé'&&a.notification().body==='Thông báo có dấu: đã đến giờ.');
 a.events.message({data:{type:'MEYEUBE_SKIP_WAITING'}});ok('Waiting built worker activates only by explicit message',a.skips()===1);
 a=worker();a.setMissing(meta.backup.name);await assert.rejects(a.event('install'));
 ok('Missing lazy chunk rejects release without deleting previous cache',!a.stores.has('meyeube-v'+version)&&a.stores.has('meyeube-v17.8.2'));
 a=worker();a.setWrongBuild(true);await assert.rejects(a.event('install'));
 ok('Built worker refuses HTML from another release',!a.stores.has('meyeube-v'+version));
 console.log('RESULT '+checks+' PASS / 0 FAIL');
})().catch(e=>{console.error(e);process.exitCode=1});
