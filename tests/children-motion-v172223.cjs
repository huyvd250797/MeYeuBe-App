'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const events=[];
const requested=[];
const ticks=[];
let clock=0;
const context={
  clearRect(){events.length=0},setTransform(){},save(){},restore(){},translate(x,y){this.lastPos=[x,y]},rotate(){},
  drawImage(img,...args){events.push({src:img?.src,args,position:this.lastPos})},beginPath(){},rect(){},clip(){},
  ellipse(){},fill(){},fillRect(){},moveTo(){},lineTo(){},quadraticCurveTo(){},stroke(){},scale(){},
  createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}
};
const doc={createElement(tag){
  const e={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
    append(c){this.children.push(c)},setAttribute(){},addEventListener(){},remove(){},
    getBoundingClientRect(){return {width:360,height:190}}};
  if(tag==='canvas'){e.width=720;e.height=380;e.getContext=()=>context}
  return e;
}};
class Img {constructor(){this.width=80;this.height=90;this.naturalWidth=0;this.naturalHeight=0}
 set src(v){this._src=v;requested.push(v);if(v.includes('children-photo-hero')){this.naturalWidth=548;this.naturalHeight=215}queueMicrotask(()=>this.onload?.())}
 get src(){return this._src}}
const w={devicePixelRatio:2,Image:Img,requestAnimationFrame(fn){ticks.push(fn);return ticks.length},cancelAnimationFrame(){},setTimeout(fn){queueMicrotask(fn)}};
const ctx={window:w,document:doc,Image:Img,Math,Promise,console};
for(const part of ['calendar','model','illustration']){
 vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',part+'.js'),'utf8'),ctx);
}
const art=w.mybSeasonalIllustration;
const modes=Array.from(w.mybSeasonalModel.presets.children.motions);
assert.equal(modes[0][0],'balloons');assert.equal(modes[1][0],'stars');
assert.match(modes[0][1],/giấy màu/);assert.match(modes[1][1],/chong chóng/);
async function create(mode){
 const start=requested.length,el=art.create('children',mode);
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(el.children[0].src,/children-photo-hero-v3\.webp$/,'original Children Day photo is unchanged');
 return {el,loaded:requested.slice(start)};
}
function nextFrame(){const cb=ticks.shift();assert(cb,'frame scheduled');clock+=35;cb(clock)}
(async()=>{
 const a=await create('balloons');
 assert.equal(a.loaded.filter(s=>s.includes('children-real-balloon-')).length,3,'A loads three separate balloons');
 assert(!a.loaded.some(s=>s.includes('pinwheel')||s.includes('soap-bubble')));
 art.setRunning(a.el,true);nextFrame();
 assert.equal(events.length,3,'A displays three independent photographic balloons');
 assert(events.every(x=>x.src.includes('children-real-balloon-')));
 const a0=JSON.stringify(events.map(x=>[x.args,x.position]));for(let i=0;i<24;i++)nextFrame();
 assert.notEqual(JSON.stringify(events.map(x=>[x.args,x.position])),a0,'A balloons animate');
 art.remove(a.el);ticks.length=0;
 const b=await create('stars');
 assert(b.loaded.some(s=>s.includes('children-real-pinwheel-v8.webp')));
 assert(b.loaded.some(s=>s.includes('children-real-soap-bubble-v8.webp')));
 assert(!b.loaded.some(s=>s.includes('children-real-balloon-')));
 art.setRunning(b.el,true);nextFrame();
 assert.equal(events.filter(x=>x.src.includes('children-real-pinwheel')).length,2,'B shows two photorealistic foil pinwheels');
 assert.equal(events.filter(x=>x.src.includes('children-real-soap-bubble')).length,5,'B shows five optical bubbles');
 const b0=JSON.stringify(events.map(x=>[x.args,x.position]));for(let i=0;i<24;i++)nextFrame();
 assert.notEqual(JSON.stringify(events.map(x=>[x.args,x.position])),b0,'B bubbles/pinwheels animate');
 art.remove(b.el);ticks.length=0;
 const still=await create('still');art.setRunning(still.el,true);
 assert.equal(events.length,0,'still no animation');
 assert(!still.loaded.some(s=>s.includes('children-real-balloon-')||s.includes('pinwheel')||s.includes('soap-bubble')));
 art.remove(still.el);
 const sw=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');
 for(const name of ['children-photo-hero-v3.webp','children-real-balloon-pink-v8.webp','children-real-balloon-gold-v8.webp','children-real-balloon-blue-v8.webp','children-real-pinwheel-v8.webp','children-real-soap-bubble-v8.webp']){
  assert(fs.existsSync(path.join(root,'src/features/seasonal/art',name)),'source asset '+name);
  assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',name)),'compiled asset '+name);
  assert(sw.includes(name),'offline cache includes '+name);
 }
 for(const name of ['index.html','build.json','sw.js','manifest.webmanifest']){
  assert(fs.readFileSync(path.join(root,'dist',name),'utf8').includes('17.22.26'),'build '+name+' is up to date');
 }
 console.log('PASS Childrens Day regression V17.22.26: A natural latex + paper, B foil pinwheels + optical bubbles, Still empty, photo unchanged, offline assets');
})().catch(err=>{console.error(err);process.exitCode=1});
