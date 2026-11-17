'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const imgDir=path.join(root,'src/features/seasonal/art');
const source=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
const model=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
const fetched=[];
const doc={createElement(tag){
  if(tag==='canvas'){
    const actions=[];
    const gradient=()=>({addColorStop(){}});
    const ctx=new Proxy({clearRect(){actions.length=0},createLinearGradient:gradient,createRadialGradient:gradient},{get(obj,key){
      return key in obj?obj[key]:(...args)=>{actions.push([key,...args.map(v=>typeof v==='number'?Number(v.toFixed(4)):(v&&v.src)||typeof v)])};
    },set(obj,key,val){obj[key]=val;return true}});
    return {tag,style:{},width:0,height:0,actions,getContext(){return ctx},setAttribute(){},addEventListener(){}};
  }
  return {tag,children:[],dataset:{},style:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},append(child){this.children.push(child)},remove(){},getBoundingClientRect(){return {width:816,height:381}}};
}};
let counter=0;const callbacks=new Map();
const w={devicePixelRatio:1,Image:class{width=193;height=140;set src(s){this._src=s;fetched.push(s);queueMicrotask(()=>this.onload?.())}get src(){return this._src}},requestAnimationFrame(fn){const n=++counter;callbacks.set(n,fn);return n},cancelAnimationFrame(n){callbacks.delete(n)},setTimeout(f){queueMicrotask(f)}};
vm.runInNewContext(source,{window:w,document:doc,Image:w.Image,Math,Promise,console});
vm.runInNewContext(model,{window:w,document:doc,Math,Promise,console,Date});
assert.deepEqual(Array.from(w.mybSeasonalModel.presets.reunification.motions,x=>x[0]),['flag','ribbon'],'save compatibility IDs preserved');
assert.match(w.mybSeasonalModel.presets.reunification.motions[1][1],/Pháo hoa/);
async function scene(mode){
  const layer=w.mybSeasonalIllustration.create('reunification',mode);
  await new Promise(resolve=>setImmediate(resolve));
  assert(layer.children[0].src.endsWith('reunification-palace-scene-v10.webp'));
  const canvas=layer.children.find(x=>x.tag==='canvas');
  assert(canvas,'animated overlay exists');
  return {layer,canvas,count:canvas.actions.filter(a=>a[0]==='drawImage').length};
}
(async()=>{
  const a=await scene('flag');
  const b=await scene('ribbon');
  const still=await scene('still');
  assert(a.count>20,'flag mode has multiple genuine cloth strips');
  assert(b.count>0&&b.count<a.count,'firework mode only draws photo bursts');
  assert.equal(still.count,0,'still mode does not paint any photo sprite');
  assert.equal(fetched.filter(s=>s.includes('reunification-firework-photo-v10')).length,1,'fireworks loaded only for B');
  assert.equal(fetched.filter(s=>s.includes('reunification-flag-cloth-v10')).length,1,'flags loaded only for A');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const assets=['reunification-palace-scene-v10.webp','reunification-flag-cloth-v10.webp','reunification-firework-photo-v10.webp',
    ...Array.from({length:7},(_,i)=>`reunification-photo-flag-${i+1}-v10.webp`)];
  for(const asset of assets){
    assert(fs.existsSync(path.join(imgDir,asset)),asset+' exists');
    assert(sw.includes(asset),asset+' cached offline');
  }
  for(const {layer} of [a,b,still])w.mybSeasonalIllustration.remove(layer);
  console.log('PASS: 30/04 A flag cloth, B photographic fireworks, still static; independent assets and offline cache');
})().catch(err=>{console.error(err);process.exitCode=1});
