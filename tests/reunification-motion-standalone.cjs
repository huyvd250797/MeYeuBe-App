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
const w={devicePixelRatio:1,Image:class{width=1536;height=1368;set src(s){this._src=s;fetched.push(s);queueMicrotask(()=>this.onload?.())}get src(){return this._src}},requestAnimationFrame(fn){const n=++counter;callbacks.set(n,fn);return n},cancelAnimationFrame(n){callbacks.delete(n)},setTimeout(f){queueMicrotask(f)}};
vm.runInNewContext(source,{window:w,document:doc,Image:w.Image,Math,Promise,console});
vm.runInNewContext(model,{window:w,document:doc,Math,Promise,console,Date});
assert.deepEqual(Array.from(w.mybSeasonalModel.presets.reunification.motions,x=>x[0]),['flag','ribbon'],'saved motion IDs preserved');
assert.match(w.mybSeasonalModel.presets.reunification.motions[1][1],/Pháo hoa/);
async function scene(mode){
  const layer=w.mybSeasonalIllustration.create('reunification',mode);
  await new Promise(resolve=>setImmediate(resolve));
  const canvas=layer.children.find(x=>x.tag==='canvas');
  assert(canvas,'transparent canvas overlay exists');
  return {layer,canvas,art:layer.children[0].src,draws:canvas.actions.filter(a=>a[0]==='drawImage')};
}
(async()=>{
  const a=await scene('flag');
  const b=await scene('ribbon');
  const still=await scene('still');
  assert.match(a.art,/reunification-daytime-flagbase-v11\.webp$/,'A uses sky without frozen rooftop flag');
  assert.match(b.art,/reunification-daytime-scene-v11\.webp$/,'B uses daylight palace with a clearly visible rooftop flag');
  assert.match(still.art,/reunification-daytime-scene-v11\.webp$/,'Still leaves the real roof flag visible');
  assert.equal(a.draws.length,2,'A uses TWO WHOLE fabric images, not vertical strips');
  assert.equal(b.draws.length,4,'B has four separate fireworks bursts');
  assert.equal(still.draws.length,0,'Still draws no animation');
  assert.equal(fetched.filter(s=>s.includes('reunification-canopy-atlas-v11.webp')).length,1,'canopy atlas loads only for A');
  assert.equal(fetched.filter(s=>s.includes('reunification-roof-flag-atlas-v11.webp')).length,1,'rooftop atlas loads only for A');
  assert.equal(fetched.filter(s=>s.includes('reunification-dayfirework-pink-v11.webp')).length,1,'fireworks load only for B');
  assert.equal(fetched.filter(s=>s.includes('reunification-photo-flag-1-v10.webp')).length,0,'retired sliced flags not loaded');
  assert.equal(fetched.filter(s=>s.includes('reunification-firework-photo-v10.webp')).length,0,'old rectangle-backed firework not loaded');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const asset of [
    'reunification-daytime-scene-v11.webp','reunification-daytime-flagbase-v11.webp',
    'reunification-canopy-atlas-v11.webp','reunification-roof-flag-atlas-v11.webp',
    ...['pink','gold','white','blue'].map(n=>`reunification-dayfirework-${n}-v11.webp`)
  ]){
    assert(fs.existsSync(path.join(imgDir,asset)),asset+' exists');
    assert(sw.includes(asset),asset+' precached offline');
  }
  assert(source.includes('ctx.rect(330,12,485,133)'),'fireworks clipped to upper-right day sky, above rooftop flag');
  for(const {layer} of [a,b,still])w.mybSeasonalIllustration.remove(layer);
  console.log('PASS: 30/04 A whole-cloth flag, B daylight fireworks, still static; independent assets and offline cache');
})().catch(err=>{console.error(err);process.exitCode=1});
