'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
const loads=[];
const doc={createElement(tag){
  if(tag==='canvas'){
    const actions=[];
    const gradient=()=>({addColorStop(){}});
    const context=new Proxy({clearRect(){actions.length=0},createLinearGradient:gradient,createRadialGradient:gradient},{get(obj,key){
      return key in obj?obj[key]:(...args)=>{actions.push([key,...args.map(v=>typeof v==='number'?Number(v.toFixed(4)):(v&&v.src)||typeof v)])};
    },set(obj,key,val){obj[key]=val;return true}});
    return {tag,style:{},width:0,height:0,actions,getContext(){return context},setAttribute(){},addEventListener(){}};
  }
  return {tag,children:[],style:{},dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},append(child){this.children.push(child)},remove(){},getBoundingClientRect(){return {width:816,height:381}}};
}};
let counter=0;const callbacks=new Map();
const w={devicePixelRatio:1,Image:class{width=100;height=100;set src(s){this._src=s;loads.push(s);queueMicrotask(()=>this.onload?.())}get src(){return this._src}},requestAnimationFrame(fn){const n=++counter;callbacks.set(n,fn);return n},cancelAnimationFrame(n){callbacks.delete(n)},setTimeout(f){queueMicrotask(f)}};
vm.runInNewContext(source,{window:w,document:doc,Image:w.Image,Math,Promise,console});
async function scene(mode){
  const layer=w.mybSeasonalIllustration.create('hungking',mode);
  await new Promise(resolve=>setImmediate(resolve));
  const calls=layer.children.find(x=>x.tag==='canvas').actions;
  const initial=JSON.stringify(calls.filter(e=>e[0]==='drawImage'));
  assert(layer.children[0].src.endsWith('hungking-temple-scene-v9.webp'));
  return {layer,initial,count:calls.filter(e=>e[0]==='drawImage').length};
}
(async()=>{
  const a=await scene('heritageClouds');
  const b=await scene('banners');
  const still=await scene('still');
  assert(a.count>b.count, 'A must render photographic petals, unlike B');
  assert.equal(b.count,still.count,'B and still share only the anchored photo flags');
  assert.notEqual(b.initial,still.initial,'B ripples the flag cloth; still does not');
  assert(loads.some(s=>s.includes('hungking-peach-petal-v9.webp')));
  assert.equal(loads.filter(s=>s.includes('hungking-peach-petal-v9.webp')).length,1,'petal sprite is never loaded for B/still');
  for(const s of ['hungking-temple-scene-v9.webp',...Array.from({length:4},(_,i)=>`hungking-flag-${i+1}-v9.webp`),'hungking-peach-petal-v9.webp']){
    assert(fs.existsSync(path.join(root,'src/features/seasonal/art',s)),s);
    assert(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes(s),s+' in SW cache');
  }
  console.log('PASS: Hung Kings A/B/still independent photographic layers and SW asset integrity');
})().catch(e=>{console.error(e);process.exitCode=1});
