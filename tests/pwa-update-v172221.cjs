'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','boot.js'),'utf8');
const store=new Map();
async function boot(server,htmlVersion){
  const elements=new Map();
  const doc={
    documentElement:{setAttribute(){}},body:{appendChild(el){elements.set(el.id,el)}},activeElement:null,
    querySelector(selector){return null},getElementById(id){return elements.get(id)||null},addEventListener(){}
  };
  doc.createElement=tag=>({tag,id:'',children:[],textContent:'',className:'',classList:{contains(){return false}},setAttribute(){},appendChild(el){this.children.push(el);if(el.id)elements.set(el.id,el)},remove(){elements.delete(this.id)}});
  const win={mybStartupGate:{ready:true,state:'ready'},addEventListener(){},matchMedia(){return null}};
  const loc={reloadCount:0,reload(){this.reloadCount++}};
  const session={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)},removeItem(k){store.delete(k)}};
  const fetch=(url)=>Promise.resolve(url.includes('build.json')?{ok:true,json:async()=>({build:server})}:{ok:true,text:async()=>`<meta name="myb-build" content="${htmlVersion||server}" />`});
  win.fetch=fetch;
  vm.runInNewContext(source,{window:win,document:doc,mybStartupGate:win.mybStartupGate,localStorage:{getItem(){return null}},sessionStorage:session,navigator:{},location:loc,fetch,Date,Promise,console});
  await new Promise(r=>setImmediate(r));
  return {win,doc,elements,loc};
}
(async()=>{
  store.clear();
  let x=await boot('17.22.25');
  assert.equal(x.elements.has('mybUpdateNotice'),false,'older server version must not prompt');
  x=await boot('17.22.27');
  assert.equal(x.elements.has('mybUpdateNotice'),false,'same build must not prompt');
  x=await boot('17.22.27');
  assert(x.elements.has('mybUpdateNotice'),'new build must prompt');
  const later=x.elements.get('mybUpdateNotice').children.at(-1);later.onclick();
  assert(!x.elements.has('mybUpdateNotice'),'Later dismisses popup');
  x=await boot('17.22.27');
  assert(!x.elements.has('mybUpdateNotice'),'Later not repeated in same session');
  x=await boot('17.22.28');
  assert(x.elements.has('mybUpdateNotice'),'newer release can prompt again');
  await x.win.mybPwaUpdate.apply();
  assert.equal(x.loc.reloadCount,1,'verified newer HTML triggers one reload');
  x=await boot('17.22.28');
  assert(!x.elements.has('mybUpdateNotice'),'same updated release not prompted after reload attempt');
  store.clear();x=await boot('17.22.27','17.22.25');
  assert(x.elements.has('mybUpdateNotice'));
  await x.win.mybPwaUpdate.apply();
  assert.equal(x.loc.reloadCount,0,'mismatched/stale HTML must not trigger reload');
  console.log('PASS: PWA update notice older/same/newer builds, dismiss, repeat prevention, and HTML verification');
})().catch(e=>{console.error(e);process.exitCode=1});
