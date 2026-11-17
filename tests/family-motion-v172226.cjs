'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const drawn=[],requests=[],raf=[];
let clock=0;
const brush={
  clearRect(){drawn.length=0},setTransform(){},save(){},restore(){},translate(x,y){this.where=[x,y]},rotate(){},
  drawImage(img,...args){drawn.push({src:img?.src||'glow-texture',where:this.where||null,args})},
  beginPath(){},rect(){},clip(){},fill(){},fillRect(){},moveTo(){},lineTo(){},stroke(){},
  createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}
};
const doc={createElement(tag){
  const element={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
    append(item){this.children.push(item)},setAttribute(){},addEventListener(){},remove(){},
    getBoundingClientRect(){return {width:365,height:196}}};
  if(tag==='canvas') {element.width=730;element.height=392;element.getContext=()=>brush}
  return element;
}};
class ImageMock{
  constructor(){this.width=256;this.height=256;this.naturalWidth=0;this.naturalHeight=0}
  set src(value){this._src=value;requests.push(value);if(value.includes('family-photo-hero-v3')){this.naturalWidth=548;this.naturalHeight=215}queueMicrotask(()=>this.onload?.())}
  get src(){return this._src}
}
const win={Image:ImageMock,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
  requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const context={window:win,document:doc,Image:ImageMock,Math,Promise,console};
for(const name of ['calendar','model','illustration'])vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',name+'.js'),'utf8'),context);
const {mybSeasonalModel:model,mybSeasonalIllustration:art}=win;
assert.deepEqual(Array.from(model.presets.family.motions, row=>row[0]),['floatingHearts','homeGlow']);
assert.match(model.presets.family.motions[0][1],/Trái tim/);
assert.match(model.presets.family.motions[1][1],/Ánh đèn/);
function next(){const f=raf.shift();assert(f,'animation frame scheduled');clock+=34;f(clock)}
async function create(mode){
  drawn.length=0;const before=requests.length;
  const el=art.create('family',mode);
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(el.children[0].src,/family-photo-hero-v3\.webp$/,'original family photo remains unchanged');
  return {el,requests:requests.slice(before)};
}
(async()=>{
  const a=await create('floatingHearts');
  assert.equal(a.requests.filter(x=>x.includes('family-heart-light-v12.webp')).length,1);
  assert(!a.requests.some(x=>x.includes('family-home-light-v12')));
  art.setRunning(a.el,true);next();
  assert(drawn.filter(x=>x.src.includes('family-heart-light-v12')).length>=4,'A renders actual luminous hearts');
  const positions0=JSON.stringify(drawn.filter(x=>x.src.includes('family-heart-light-v12')).map(x=>x.where));
  for(let i=0;i<40;i++)next();
  const positions1=JSON.stringify(drawn.filter(x=>x.src.includes('family-heart-light-v12')).map(x=>x.where));
  assert.notEqual(positions0,positions1,'A hearts actually float');
  art.remove(a.el);raf.length=0;
  const b=await create('homeGlow');
  assert(b.requests.some(x=>x.includes('family-home-light-v12.webp')));
  assert(!b.requests.some(x=>x.includes('family-heart-light-v12.webp')));
  art.setRunning(b.el,true);next();
  assert(drawn.some(x=>x.src.includes('family-home-light-v12.webp')),'B renders photograph-matched local light');
  assert(!drawn.some(x=>x.src.includes('family-heart-light-v12.webp')),'B has no floating hearts');
  for(let i=0;i<40;i++)next();
  assert(drawn.some(x=>x.src.includes('family-home-light-v12.webp')),'B remains active as time advances');
  art.remove(b.el);raf.length=0;
  const still=await create('still');
  assert(!still.requests.some(x=>x.includes('family-heart-light-v12')||x.includes('family-home-light-v12')),'Still does not request motion assets');
  art.setRunning(still.el,true);assert.equal(drawn.length,0,'Still draws no movement');
  art.remove(still.el);
  const assets=['family-photo-hero-v3.webp','family-heart-light-v12.webp','family-home-light-v12.webp'];
  for(const name of assets){
    assert(fs.existsSync(path.join(root,'src/features/seasonal/art',name)),'source '+name);
    assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',name)),'production '+name);
    assert(fs.readFileSync(path.join(root,'dist/sw.js'),'utf8').includes(name),'PWA offline '+name);
  }
  for(const name of ['index.html','build.json','manifest.webmanifest','sw.js'])
    assert(fs.readFileSync(path.join(root,'dist',name),'utf8').includes('17.22.31'),'production '+name+' must be current');
  console.log('PASS V17.22.28: actual animated image hearts, exclusive warm home lighting, still empty, 20-theme photo preserved, PWA assets present');
})().catch(e=>{console.error(e);process.exitCode=1});
