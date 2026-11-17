'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const script=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
const assetDir=path.join(root,'src/features/seasonal/art');
const images=[];const drawEvents=[];const transforms=[];const callbacks=[];
function context(){
  const ctx={
    clearRect(){drawEvents.length=0;},
    setTransform(...args){transforms.push(args);},
    drawImage(img,...args){drawEvents.push({src:img?.src||'',args})},
    save(){},restore(){},beginPath(){},rect(){},clip(){},translate(){},rotate(){},
    createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}
  };
  return new Proxy(ctx,{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});
}
const canvasCtx=context();
const doc={createElement(tag){
  const el={tag,style:{},dataset:{},classList:{toggle(){}},children:[],setAttribute(){},addEventListener(){},append(child){this.children.push(child)},remove(){},getBoundingClientRect(){return {width:360,height:190}}};
  if(tag==='canvas'){el.getContext=()=>canvasCtx;el.width=720;el.height=380;}
  return el;
}};
class MockImage{constructor(){this.width=72;this.height=60;this.naturalWidth=0;this.naturalHeight=0;}set src(v){this._src=v;images.push(v);if(v.includes('doanngo-photo-hero')){this.naturalWidth=548;this.naturalHeight=215;}if(v.includes('leaf')){this.width=70;this.height=105;}queueMicrotask(()=>this.onload?.());}get src(){return this._src}}
let now=0;
const w={devicePixelRatio:2,Image:MockImage,requestAnimationFrame(fn){callbacks.push(fn);return callbacks.length},cancelAnimationFrame(){},setTimeout(fn){queueMicrotask(fn)}};
vm.runInNewContext(script,{window:w,document:doc,Image:MockImage,Promise,Math,console});
function nextFrame(){const cb=callbacks.shift();assert(cb,'pending animation frame');now+=35;cb(now)}
async function scene(mode){const start=images.length;const el=w.mybSeasonalIllustration.create('doanngo',mode);await new Promise(r=>setImmediate(r));return {el,loaded:images.slice(start)}}
(async()=>{
  const a=await scene('dragonflies');
  assert(a.loaded.filter(x=>x.includes('dragonfly')).length===2);
  assert(!a.loaded.some(x=>x.includes('leaf-fall')));
  transforms.length=0;drawEvents.length=0;
  w.mybSeasonalIllustration.setRunning(a.el,true);nextFrame();
  assert.equal(drawEvents.length,2,'A draws exactly 2 independent photographic dragonflies');
  assert(drawEvents.every(e=>e.src.includes('dragonfly')));
  const transform=transforms.at(-1);const fit=360/548;
  assert(Math.abs(transform[0]-2*fit)<.002,'image and canvas use same X scale');
  assert(Math.abs(transform[3]-2*fit)<.002,'image and canvas use same Y scale');
  assert(Math.abs(transform[5]-2*(190-215*fit))<.1,'image and canvas share bottom anchor');
  const frame0=JSON.stringify(drawEvents.map(e=>e.args));
  for(let i=0;i<18;i++)nextFrame();
  assert.notEqual(JSON.stringify(drawEvents.map(e=>e.args)),frame0,'dragonflies really move after time advances');
  w.mybSeasonalIllustration.remove(a.el);callbacks.length=0;

  const b=await scene('summerLeaves');
  assert(b.loaded.filter(x=>x.includes('leaf-fall')).length===1);
  assert(!b.loaded.some(x=>x.includes('dragonfly')));
  drawEvents.length=0;
  w.mybSeasonalIllustration.setRunning(b.el,true);nextFrame();
  assert.equal(drawEvents.length,5,'B draws 2 leaves swaying and 3 leaves falling');
  assert(drawEvents.every(e=>e.src.includes('leaf-fall')));
  const leaves0=JSON.stringify(drawEvents.map(e=>e.args));
  for(let i=0;i<18;i++)nextFrame();
  assert.notEqual(JSON.stringify(drawEvents.map(e=>e.args)),leaves0,'leaves visibly move after time advances');
  w.mybSeasonalIllustration.remove(b.el);callbacks.length=0;

  const still=await scene('still');
  drawEvents.length=0;w.mybSeasonalIllustration.setRunning(still.el,true);
  assert.equal(drawEvents.length,0,'still mode remains static');
  assert(!still.loaded.some(x=>x.includes('dragonfly')||x.includes('leaf-fall')));
  w.mybSeasonalIllustration.remove(still.el);
  for(const asset of ['doanngo-photo-hero-v5.webp','doanngo-dragonfly-a-v4.png','doanngo-dragonfly-b-v4.png','doanngo-leaf-fall-v4.png']){
    assert(fs.existsSync(path.join(assetDir,asset)),'asset on disk '+asset);
    const sw=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');
    assert(sw.includes(asset),'asset in pre-cache '+asset);
  }
  console.log('PASS: Doan Ngo A/B/Still exclusive; sprite motion, image-size coordinate alignment, and offline assets');
})().catch(e=>{console.error(e);process.exitCode=1});
