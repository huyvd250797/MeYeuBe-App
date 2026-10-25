const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let handler,respond,mode='hit';
const ctx={URL,Request,Response,Map,Promise,setTimeout,self:{addEventListener:(n,f)=>{if(n==='fetch')handler=f}},fetch:async()=>{throw new Error('offline')},caches:{match:async q=>{const url=typeof q==='string'?q:q.url;if(mode==='hit'&&url==='https://app.test/src/data/client.js')return new Response('javascript',{headers:{'Content-Type':'text/javascript'}});if(url==='./index.html')return new Response('<html>offline</html>');return null}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('sw.js','utf8'),ctx);
async function request(destination,url,requestMode='cors'){handler({request:{method:'GET',destination,url,mode:requestMode},respondWith:r=>{respond=r}});return await respond}
(async()=>{let n=0;function ok(name,f){f();n++;console.log('PASS '+name)}
let r=await request('script','https://app.test/src/data/client.js?v=15.3.0');let text=await r.text();ok('Offline versioned module uses canonical cached JS',()=>assert.equal(text,'javascript'));
mode='miss';r=await request('script','https://app.test/src/data/missing.js?v=15.3.0');ok('Missing module does not receive index HTML',()=>assert.equal(r.type,'error'));
r=await request('document','https://app.test/','navigate');text=await r.text();ok('Offline navigation retains app-shell fallback',()=>assert.match(text,/html/));console.log('RESULT '+n+' PASS / 0 FAIL')})().catch(e=>{console.error(e);process.exitCode=1});
