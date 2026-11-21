'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('boot.js','utf8');
function boot({server='17.22.55',htmlVersion=server,waiting=false}={}){
  const elements=new Map(),callbacks=[],timers=new Map(),store=new Map(),actions=[];
  let tid=0;
  function el(tag){
    const child={tag,id:'',textContent:'',disabled:false,children:[],attributes:{},classList:{contains(){return false}},
      setAttribute(k,v){this.attributes[k]=String(v)},appendChild(c){this.children.push(c);if(c.id)elements.set(c.id,c)},
      remove(){elements.delete(this.id)},querySelectorAll(tag){return this.children.filter(x=>x.tag===tag)}};
    return child;
  }
  const doc={documentElement:{setAttribute(){}},activeElement:null,
    body:{appendChild(n){if(n.id)elements.set(n.id,n)}},querySelector(){return null},
    getElementById(id){return elements.get(id)||null},addEventListener(){},createElement:el};
  const win={mybStartupGate:{ready:true,state:'ready'},addEventListener(){},matchMedia(){return null}};
  const nav={href:'https://app.test/dashboard',replace(url){actions.push(['replace',url])},reload(){actions.push(['reload'])}};
  const fetch=async(url)=>url.includes('build.json')?{ok:true,json:async()=>({build:server})}:
    {ok:true,text:async()=>'<meta name="myb-build" content="'+htmlVersion+'" />'};
  win.fetch=fetch;
  const sw={events:{},addEventListener(name,fn){this.events[name]=fn},getRegistration:async()=>reg,
    register:async()=>reg};
  const reg={waiting:waiting?{postMessage(msg){actions.push(['worker',msg.type])}}:null,
    addEventListener(){},update:async()=>{actions.push(['check-worker'])}};
  const navigator=waiting?{serviceWorker:sw}:{};
  const session={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)},removeItem(k){store.delete(k)}};
  const context={window:win,document:doc,navigator,sessionStorage:session,localStorage:{getItem(){return null}},
    location:nav,fetch,Date,Promise,URL,console,mybStartupGate:win.mybStartupGate,
    setTimeout(fn,ms){const id=++tid;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},
    setInterval(){return ++tid}};
  vm.runInNewContext(source,context);
  return {win,elements,actions,async settle(){await new Promise(setImmediate);await new Promise(setImmediate)},
    async pending(){await this.settle();return elements.get('mybUpdateNotice')},runTimer(ms){
      const timer=[...timers].find(([id,v])=>v.ms===ms);assert(timer,'expected timer '+ms);
      timers.delete(timer[0]);timer[1].fn();}};
}
(async()=>{
  let a=boot();await a.settle();
  assert(a.elements.has('mybUpdateNotice'),'new version popup visible');
  assert(a.elements.has('mybUpdateBackdrop'),'translucent modal overlay visible');
  let box=a.elements.get('mybUpdateNotice');
  assert.equal(box.attributes.role,'dialog');
  const button=box.querySelectorAll('button')[0];
  let update= a.win.mybPwaUpdate.apply();
  assert.equal(button.disabled,true,'button should visibly become busy before async completion');
  await update;
  assert.equal(a.actions.filter(x=>x[0]==='replace').length,1);
  assert.match(a.actions.find(x=>x[0]==='replace')[1],/myb_update=17\.22\.55/);
  console.log('PASS: fresh build click starts progress, verifies HTML, navigates cache-busted URL');

  a=boot({htmlVersion:'17.22.51'});await a.settle();
  await a.win.mybPwaUpdate.apply();
  assert.equal(a.actions.filter(x=>x[0]==='replace').length,0);
  assert(a.elements.has('mybUpdateNotice'),'failed update keeps retry popup');
  assert.match(a.elements.get('mybUpdateText').textContent,/chưa phát hành đủ/i);
  assert.equal(a.elements.get('mybUpdateNotice').querySelectorAll('button')[0].disabled,false);
  console.log('PASS: mismatch fails safe, retry remains available');

  a=boot({waiting:true});await a.settle();
  await a.win.mybPwaUpdate.apply();
  assert(a.actions.some(x=>x[0]==='worker'&&x[1]==='MEYEUBE_SKIP_WAITING'));
  assert(!a.actions.some(x=>x[0]==='replace'));
  a.runTimer(3500);
  assert.equal(a.actions.filter(x=>x[0]==='replace').length,1);
  console.log('PASS: iPhone-style missing controllerchange event falls back to verified navigation');

  a=boot();await a.settle();
  const notice=a.elements.get('mybUpdateNotice');
  notice.querySelectorAll('button').at(-1).onclick();
  assert(!a.elements.has('mybUpdateNotice'));
  assert(!a.elements.has('mybUpdateBackdrop'));
  console.log('PASS: dismiss closes both notice and dark overlay');
})().catch(e=>{console.error(e);process.exitCode=1});
