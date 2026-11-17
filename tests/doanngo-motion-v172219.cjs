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
const w={devicePixelRatio:1,Image:class{width=1536;height=1368;set src(s){this._src=s;fetched.push(s);queueMicrotask(()=>this.onload?.())}get src(){return this._src}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setTimeout(f){queueMicrotask(f)}};
vm.runInNewContext(source,{window:w,document:doc,Image:w.Image,Math,Promise,console});
vm.runInNewContext(model,{window:w,document:doc,Math,Promise,console,Date});
assert.deepEqual(Array.from(w.mybSeasonalModel.presets.doanngo.motions,x=>x[0]),['dragonflies','summerLeaves']);
assert.equal(w.mybSeasonalModel.presets.doanngo.motions[0][1],'Chuồn chuồn bay');
assert.equal(w.mybSeasonalModel.presets.doanngo.motions[1][1],'Lá xanh lay động và rơi');
async function scene(mode){
  const layer=w.mybSeasonalIllustration.create('doanngo',mode);
  await new Promise(resolve=>setImmediate(resolve));
  const canvas=layer.children.find(x=>x.tag==='canvas');
  assert(canvas,'transparent canvas overlay exists');
  return {layer,canvas,art:layer.children[0].src};
}
(async()=>{
  const a=await scene('dragonflies');
  const b=await scene('summerLeaves');
  const still=await scene('still');
  for(const x of [a,b,still]) assert.match(x.art,/doanngo-photo-hero-v3\.webp$/);
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const asset of ['doanngo-photo-hero-v3.webp','doanngo-photo-header-v3.webp','doanngo-photo-accent-v3.webp','doanngo-base-v2.webp','doanngo-piece-v2.webp']){
    assert(fs.existsSync(path.join(imgDir,asset)),asset+' exists');
    assert(sw.includes(asset),asset+' precached offline');
  }
  assert(fetched.some(s=>s.includes('doanngo-piece-v2.webp')),'motion piece loaded for animated modes');
  console.log('PASS: Tet Doan Ngo motions preserved, approved labels exposed, assets precached');
})().catch(err=>{console.error(err);process.exitCode=1});
