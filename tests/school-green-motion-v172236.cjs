'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ops=[];let now=0;let nextId=1;const scheduled=new Map();
const grad={addColorStop(){}};
const cx=new Proxy({imageSmoothingEnabled:true,createLinearGradient(){return grad},createRadialGradient(){return grad},
 setTransform(...a){ops.push(['transform',...a])},clearRect(...a){ops.push(['clear',...a])},
 drawImage(...a){ops.push(['image',a.length,a[0]?.src||'canvas'])},setLineDash(a){ops.push(['dash',a.join(',')])}},
 {get(obj,key){if(key in obj)return obj[key];return (...a)=>{ops.push([key,...a.filter(x=>typeof x==='number')]);}},
  set(obj,key,val){obj[key]=val;return true}});
class ImageMock{
 constructor(){this.naturalWidth=548;this.naturalHeight=215;this.width=548;this.height=215;this._src=''}
 set src(v){this._src=v;queueMicrotask(()=>this.onload?.())}
 get src(){return this._src}
}
const doc={createElement(tag){const e={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(c){this.children.push(c)},setAttribute(){},addEventListener(){},remove(){this.removed=true},
 getBoundingClientRect(){return {width:420,height:210}}};
 if(tag==='img'){e.naturalWidth=548;e.naturalHeight=215;}
 if(tag==='canvas'){e.width=840;e.height=420;e.getContext=()=>cx;}
 return e;}};
const win={devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
 requestAnimationFrame(fn){const id=nextId++;scheduled.set(id,fn);return id},
 cancelAnimationFrame(id){scheduled.delete(id)}};
const sandbox={window:win,document:doc,Image:ImageMock,console,Promise,Math,Date};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8'),sandbox);
const drawing=win.mybSeasonalIllustration;
function tick(n){for(let i=0;i<n;i++){
 const batch=[...scheduled.values()];scheduled.clear();
 assert.ok(batch.length>0,'rAF must remain active on every display tick');
 now+=1000/60;for(const fn of batch)fn(now);
}}
async function run(mode){
 ops.length=0;
 const scene=drawing.create('school',mode);
 await new Promise(r=>setImmediate(r));
 assert.equal(scene.children.length,2,'no extra GIF/WebP layer');
 assert.ok(scene.children[0].src.endsWith('school-photo-hero-v3.webp'),'original green hero unchanged');
 assert.equal(scene.children[1].tag,'canvas','motion is canvas-only');
 drawing.setRunning(scene,true);
 tick(8);
 const early=JSON.stringify(ops.filter(o=>['moveTo','lineTo','translate','rotate','bezierCurveTo'].includes(o[0])).slice(-120));
 const f0=ops.filter(o=>o[0]==='fill').length;
 ops.length=0;
 tick(120);
 const late=JSON.stringify(ops.filter(o=>['moveTo','lineTo','translate','rotate','bezierCurveTo'].includes(o[0])).slice(-120));
 const count=ops.filter(o=>o[0]==='fill').length;
 assert.notEqual(early,late,`mode ${mode}: geometry changes over time`);
 assert.ok(count>1500,`mode ${mode}: visible shapes rendered, count=${count}`);
 if(mode==='plane')assert.ok(ops.some(o=>o[0]==='image'&&String(o[2]).endsWith('school-piece-v2.webp')),'real paper airplane asset drawn');
 else assert.equal(ops.filter(o=>o[0]==='image'&&String(o[2]).endsWith('school-piece-v2.webp')).length,0,'flower mode does not show planes');
 drawing.setRunning(scene,false);
 assert.equal(scheduled.size,0,'pause releases rAF immediately');
 drawing.remove(scene);
 return {mode,count,f0};
}
(async()=>{
 const a=await run('chalk'),b=await run('plane');
 assert.ok(a.count>b.count,'phoenix mode has more petals than plane mode');
 const still=drawing.create('school','still');await new Promise(r=>setImmediate(r));
 drawing.setRunning(still,true);assert.equal(scheduled.size,0,'still mode never schedules frames');
 drawing.remove(still);
 const model=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
 assert.ok(model.includes("['chalk','Hoa phượng rơi & nắng sân trường']"));
 assert.ok(model.includes("['plane','Máy bay giấy lượn & cờ khai giảng']"));
 assert.ok(fs.readFileSync(path.join(root,'dist/build.json'),'utf8').includes('17.22.36'));
 const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(f=>f.startsWith('app.')&&f.endsWith('.js'));
 const app=fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8');
 assert.ok(app.includes('schoolFlyingPlanes')&&app.includes('schoolPetalRain'),'rig present in production');
 console.log('PASS school V17.22.36:',a.count,'phoenix fills;',b.count,'paper-plane fills; 60-rAF ticks/second, still, pause, original green image, 2 independent modes');
})().catch(e=>{console.error(e);process.exitCode=1});
