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
  if(tag==='canvas'){element.width=730;element.height=392;element.getContext=()=>brush}
  return element;
}};
class ImageMock{
  constructor(){this.width=150;this.height=80;this.naturalWidth=0;this.naturalHeight=0}
  set src(value){this._src=value;requests.push(value);
    if(value.includes('vulan-photo-hero-v3.webp')){this.naturalWidth=548;this.naturalHeight=215}
    queueMicrotask(()=>this.onload?.())}
  get src(){return this._src}
}
const win={Image:ImageMock,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
  requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const context={window:win,document:doc,Image:ImageMock,Math,Promise,console};
for(const name of ['calendar','model','illustration'])
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',name+'.js'),'utf8'),context);
const {mybSeasonalModel:model,mybSeasonalIllustration:art}=win;
assert.deepEqual(Array.from(model.presets.vulan.motions, r=>r[0]),['floatingLotus','candlelight']);
function next(){const f=raf.shift();assert(f,'animation frame scheduled');clock+=34;f(clock)}
async function create(mode){
  drawn.length=0;const before=requests.length;
  const el=art.create('vulan',mode);
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(el.children[0].src,/vulan-photo-hero-v3\.webp$/,'sharp original image stays as static background');
  return {el,requests:requests.slice(before)};
}
const sourceIds=['vulan-floating-lotus-large-v28.webp','vulan-floating-lotus-medium-v28.webp',
  'vulan-floating-lotus-small-v28.webp'];
const candleIds=['vulan-hanging-lantern-v28.webp','vulan-falling-petal-v28.webp','vulan-photo-flame-v28.webp'];
(async()=>{
  const a=await create('floatingLotus');
  for(const x of sourceIds)assert(a.requests.some(y=>y.endsWith(x)),'A loads '+x);
  for(const x of candleIds)assert(!a.requests.some(y=>y.endsWith(x)),'A must never load '+x);
  art.setRunning(a.el,true);next();
  assert(drawn.filter(x=>sourceIds.some(n=>x.src.endsWith(n))).length>=3,'A must draw 3 photo lotuses');
  const p0=JSON.stringify(drawn.filter(x=>sourceIds.some(n=>x.src.endsWith(n))).map(x=>x.where));
  for(let i=0;i<55;i++)next();
  const p1=JSON.stringify(drawn.filter(x=>sourceIds.some(n=>x.src.endsWith(n))).map(x=>x.where));
  assert.notEqual(p0,p1,'A lotus positions must really change over time');
  art.remove(a.el);raf.length=0;

  const b=await create('candlelight');
  for(const x of candleIds)assert(b.requests.some(y=>y.endsWith(x)),'B loads '+x);
  for(const x of sourceIds)assert(!b.requests.some(y=>y.endsWith(x)),'B must never load '+x);
  art.setRunning(b.el,true);next();
  const count0=drawn.filter(x=>candleIds.some(n=>x.src.endsWith(n))).length;
  assert(count0>=8,'B must draw lantern, flames and petals');
  const lantern0=JSON.stringify(drawn.filter(x=>x.src.endsWith(candleIds[0])).map(x=>x.where));
  for(let i=0;i<55;i++)next();
  assert(drawn.filter(x=>candleIds.some(n=>x.src.endsWith(n))).length>=8,'B remains visibly animated');
  const lantern1=JSON.stringify(drawn.filter(x=>x.src.endsWith(candleIds[0])).map(x=>x.where));
  assert.notEqual(lantern0,lantern1,'B hanging lantern must sway over time');
  art.remove(b.el);raf.length=0;

  const still=await create('still');
  assert(!still.requests.some(x=>[...sourceIds,...candleIds].some(n=>x.endsWith(n))),'Still loads no motion assets');
  art.setRunning(still.el,true);
  assert.equal(drawn.length,0,'Still has no overlay movement');
  art.remove(still.el);

  const sw=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');
  for(const name of ['vulan-photo-hero-v3.webp',...sourceIds,...candleIds]){
    assert(fs.existsSync(path.join(root,'src/features/seasonal/art',name)),'source '+name);
    assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',name)),'production '+name);
    assert(sw.includes(name),'offline precache '+name);
  }
  for(const name of ['index.html','build.json','manifest.webmanifest','sw.js'])
    assert(fs.readFileSync(path.join(root,'dist',name),'utf8').includes('17.22.30'),'production '+name+' is current');
  console.log('PASS Vu Lan V17.22.28: A photo lotuses drift, B realistic lantern/flames/petals move, still empty, exact build and offline assets.');
})().catch(e=>{console.error(e);process.exitCode=1});
