'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const calls=[],requested=[],raf=[];let now=0;
const ctx={
  save(){},restore(){},setTransform(){},beginPath(){},rect(){},clip(){},clearRect(){calls.length=0},
  drawImage(image,...args){calls.push({src:image.src||'',args})},
  createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}},
  fillRect(){},fill(){},translate(){},rotate(){},moveTo(){},lineTo(){},stroke(){},closePath(){}
};
const document={createElement(tag){const el={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
    append(item){this.children.push(item)},setAttribute(){},addEventListener(){},remove(){},
    getBoundingClientRect(){return {width:520,height:230}}};
  if(tag==='canvas'){el.width=1040;el.height=460;el.getContext=()=>ctx}return el;
}};
class Picture{constructor(){this.width=1536;this.height=1368;this.naturalWidth=0;this.naturalHeight=0}
  set src(value){this._src=value;requested.push(value);
    if(value.includes('nationalday-mausoleum-clear-scene-v31.webp')){
      this.naturalWidth=548;this.naturalHeight=215;this.width=548;this.height=215
    }
    queueMicrotask(()=>this.onload?.())
  }
  get src(){return this._src}
}
const w={Image:Picture,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
 requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const sandbox={window:w,document,Image:Picture,Math,Promise,console,Date};
for(const file of ['calendar','model','illustration'])vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',file+'.js'),'utf8'),sandbox);
const scene=w.mybSeasonalIllustration;
const preset=w.mybSeasonalModel.presets.nationalday;
assert.equal(preset.motions[0][0],'flagWave');assert.equal(preset.motions[1][0],'fireworks');
const ASSET='src/features/seasonal/art/';
const bg='nationalday-mausoleum-clear-scene-v31.webp';
const flag='nationalday-photo-flag-cloth-atlas-v31.webp';
const fireworks=['pink','gold','white','blue'].map(x=>`nationalday-photo-firework-${x}-v31.webp`);
async function make(mode){
 const mark=requested.length, element=scene.create('nationalday',mode);
 await new Promise(resolve=>setImmediate(resolve));
 return {element,loaded:requested.slice(mark)};
}
function tick(n){for(let i=0;i<n;i++){
  const fn=raf.shift();assert(fn,'pending animation frame');now+=34;fn(now)
}}
(async()=>{
 const a=await make('flagWave');
 assert(a.element.children[0].src.endsWith(bg));
 assert(a.loaded.some(s=>s.endsWith(flag)));
 for(const p of fireworks)assert(!a.loaded.some(s=>s.endsWith(p)),'flag A should not fetch B fireworks '+p);
 scene.setRunning(a.element,true);tick(3);
 const aCalls=calls.filter(c=>c.src.endsWith(flag));
 assert.equal(aCalls.length,1,'one whole cloth frame, not sliced columns');
 assert.equal(aCalls[0].args.length,8,'full 192x114 tile drawn with source rect');
 const tile0=aCalls[0].args.slice(0,2).join(',');tick(42);
 const tile1=calls.find(c=>c.src.endsWith(flag)).args.slice(0,2).join(',');
 assert.notEqual(tile0,tile1,'flag frame advances during playback');
 scene.remove(a.element);raf.length=0;
 const b=await make('fireworks');
 assert(b.element.children[0].src.endsWith(bg));
 assert(b.loaded.some(s=>fireworks.some(p=>s.endsWith(p))));
 assert(!b.loaded.some(s=>s.endsWith(flag)),'B must never load A flag');
 scene.setRunning(b.element,true);tick(3);
 const fire0=calls.filter(c=>fireworks.some(p=>c.src.endsWith(p)));
 assert(fire0.length>=1,'photo fireworks visible in mode B');
 const first=JSON.stringify(fire0);tick(53);
 const second=JSON.stringify(calls.filter(c=>fireworks.some(p=>c.src.endsWith(p))));
 assert.notEqual(first,second,'firework image scale changes with time');
 scene.remove(b.element);raf.length=0;
 const still=await make('still');
 assert(still.element.children[0].src.endsWith(bg));
 assert(!still.loaded.some(s=>s.endsWith(flag)||fireworks.some(p=>s.endsWith(p))),'static loads no motion assets');
 scene.setRunning(still.element,true);
 assert.equal(calls.length,0,'static paints no motion layer');scene.remove(still.element);
 const art=root+'/'+ASSET,dist=root+'/dist/'+ASSET;
 const prod=fs.readFileSync(root+'/dist/sw.js','utf8');
 for(const n of [bg,flag,...fireworks]){
   assert(fs.existsSync(art+n),'source '+n);
   assert(fs.existsSync(dist+n),'dist '+n);
   assert(prod.includes(n),'SW precache '+n);
 }
 const prodBundle=fs.readdirSync(root+'/dist/assets').find(n=>/^app\..*\.js$/.test(n));
 const compiled=fs.readFileSync(root+'/dist/assets/'+prodBundle,'utf8');
 assert(compiled.includes('function drawNationalday('),'production contains special motion engine');
 assert(compiled.includes(flag),'production refers to new photo atlas');
 for(const name of ['index.html','build.json','manifest.webmanifest','sw.js'])
   assert(fs.readFileSync(root+'/dist/'+name,'utf8').includes(JSON.parse(fs.readFileSync(root+'/build.json','utf8')).build),'production version '+name);
 console.log('PASS National Day V17.22.31: photo flag 96 frames, fireworks A/B exclusive, no motion in still, dist+SW current');
})().catch(e=>{console.error(e);process.exitCode=1});
