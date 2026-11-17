'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const commands=[],requests=[],raf=[];
let now=0;
const brush={
 clearRect(){commands.length=0},setTransform(){},save(){},restore(){},translate(){},rotate(){},
 drawImage(img,...args){commands.push({src:img?.src||'',args})},
 beginPath(){},rect(){},clip(){},fill(){},fillRect(){},closePath(){},moveTo(){},lineTo(){},stroke(){},
 createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}
};
const doc={createElement(tag){const e={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(x){this.children.push(x)},setAttribute(){},addEventListener(){},remove(){},
 getBoundingClientRect(){return {width:400,height:215}}};
 if(tag==='canvas'){e.width=800;e.height=430;e.getContext=()=>brush}return e}};
class ImageMock{constructor(){this.width=175;this.height=95;this.naturalWidth=0;this.naturalHeight=0}
 set src(v){this._src=v;requests.push(v);if(v.includes('beach-live-scene-v30.webp')){this.naturalWidth=548;this.naturalHeight=215}
 queueMicrotask(()=>this.onload?.())}get src(){return this._src}}
const win={Image:ImageMock,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
 requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const sandbox={window:win,document:doc,Image:ImageMock,Math,Promise,console};
for(const file of ['calendar','model','illustration'])
 vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',file+'.js'),'utf8'),sandbox);
const {mybSeasonalModel:model,mybSeasonalIllustration:ill}=win;
assert.deepEqual(Array.from(model.presets.beach.motions,x=>x[0]),['wave','clouds']);
const ART=path.join(root,'src/features/seasonal/art');
const surf='beach-surf-frame-atlas-v30.webp',palm='beach-palm-flex-atlas-v30.webp',scene='beach-live-scene-v30.webp';
async function create(mode){commands.length=0;const n=requests.length;const el=ill.create('beach',mode);
 await new Promise(resolve=>setImmediate(resolve));assert(el.children[0].src.endsWith(scene));
 return {el,loaded:requests.slice(n)};}
function tick(n=1){for(let i=0;i<n;i++){const callback=raf.shift();assert(callback,'frame scheduled');now+=34;callback(now)}}
function imgs(src){return commands.filter(x=>x.src.endsWith(src)).map(x=>x.args)}
(async()=>{
 const a=await create('wave');assert(a.loaded.some(x=>x.endsWith(surf)));assert(!a.loaded.some(x=>x.endsWith(palm)));
 ill.setRunning(a.el,true);tick(3);assert.equal(imgs(surf).length,2,'two crossfade frames of real photographic surf');
 const a0=JSON.stringify(imgs(surf));tick(54);const a1=JSON.stringify(imgs(surf));
 assert.notEqual(a0,a1,'A advances photographic wave frames');ill.remove(a.el);raf.length=0;
 const b=await create('clouds');assert(b.loaded.some(x=>x.endsWith(palm)));assert(!b.loaded.some(x=>x.endsWith(surf)));
 ill.setRunning(b.el,true);tick(3);assert.equal(imgs(palm).length,2,'two crossfade photo frond frames');
 const b0=JSON.stringify(imgs(palm));tick(54);const b1=JSON.stringify(imgs(palm));
 assert.notEqual(b0,b1,'B palm leaf bends across frames');ill.remove(b.el);raf.length=0;
 const c=await create('still');assert(!c.loaded.some(x=>x.endsWith(surf)||x.endsWith(palm)));
 ill.setRunning(c.el,true);assert.equal(commands.length,0,'still does not paint');ill.remove(c.el);
 const production=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');
 for(const file of [surf,palm,scene]){
  assert(fs.existsSync(path.join(ART,file)),file+' in source');
  assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',file)),file+' in dist');
  assert(production.includes(file),file+' in offline cache');
 }
 for(const file of ['index.html','build.json','manifest.webmanifest','sw.js'])
  assert(fs.readFileSync(path.join(root,'dist',file),'utf8').includes('17.22.30'),file+' updated');
 const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(x=>x.startsWith('app.')&&x.endsWith('.js'));
 const code=fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8');
 assert(code.includes('function drawBeach(')&&code.includes(surf)&&code.includes(palm),'production engine updated');
 console.log('PASS V17.22.30: 12 real surf frames, 12 flex palm frames, A/B exclusive, still inert, PWA cache and production verified');
})().catch(err=>{console.error(err);process.exitCode=1});
