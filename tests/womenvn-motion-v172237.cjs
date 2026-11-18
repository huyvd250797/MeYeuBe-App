'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const calls=[];let now=0,next=1;const frames=new Map();
const grad={addColorStop(){}};
const brush=new Proxy({imageSmoothingEnabled:true,
 createLinearGradient(){return grad},createRadialGradient(){return grad},
 setTransform(...v){calls.push(['transform',...v])},clearRect(...v){calls.push(['clear',...v])},
 drawImage(img){calls.push(['image',img.src||'canvas'])},
 fillText(txt,x,y){calls.push(['text',txt,x,y])}},
 {get(o,p){if(p in o)return o[p];return (...v)=>{calls.push([p,...v.filter(x=>typeof x==='number')])}},
 set(o,p,v){o[p]=v;return true}});
class ImageMock{constructor(){this.naturalWidth=548;this.naturalHeight=215;this.width=548;this.height=215}
 set src(value){this._src=value;queueMicrotask(()=>this.onload?.())}
 get src(){return this._src}}
const doc={createElement(tag){const e={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(v){this.children.push(v)},setAttribute(){},addEventListener(){},remove(){this.removed=true},
 getBoundingClientRect(){return {width:420,height:210}}};
 if(tag==='img'){e.naturalWidth=548;e.naturalHeight=215}
 if(tag==='canvas'){e.width=840;e.height=420;e.getContext=()=>brush}
 return e}};
const win={devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
 requestAnimationFrame(fn){const id=next++;frames.set(id,fn);return id},
 cancelAnimationFrame(id){frames.delete(id)}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8'),{
 window:win,document:doc,Image:ImageMock,Math,Date,Promise,console
});
const ill=win.mybSeasonalIllustration;
function tick(n){for(let i=0;i<n;i++){
 const batch=[...frames.values()];frames.clear();
 assert.ok(batch.length>0,'rAF stays active through 60Hz display ticks');
 now+=1000/60;batch.forEach(fn=>fn(now));
}}
async function check(mode){
 calls.length=0;const scene=ill.create('womenvn',mode);
 await new Promise(r=>setImmediate(r));
 assert.equal(scene.children.length,2,'original photo and one canvas; no GIF or additional sprite sheets');
 assert.ok(scene.children[0].src.endsWith('womenvn-photo-hero-v3.webp'),'existing pink rose photograph retained');
 ill.setRunning(scene,true);tick(3);
 assert.ok(calls.some(x=>x[0]==='text'&&x[1]==='20/10'),'complete 20/10 remains on card');
 const early=JSON.stringify(calls.filter(x=>['translate','rotate','bezierCurveTo','moveTo','arc'].includes(x[0])).slice(-180));
 calls.length=0;tick(180);
 const late=JSON.stringify(calls.filter(x=>['translate','rotate','bezierCurveTo','moveTo','arc'].includes(x[0])).slice(-180));
 assert.notEqual(early,late,'animation geometry progresses with time; no static frame sequence');
 const fills=calls.filter(x=>x[0]==='fill').length;
 assert.ok(fills>1100,`visible continuous motion for ${mode}: ${fills} fills`);
 assert.ok(calls.some(x=>x[0]==='image'&&String(x[1]).endsWith('womenvn-piece-v2.webp')),'theme-native rose-petal sprite used');
 ill.setRunning(scene,false);assert.equal(frames.size,0,'pause cancels rAF');
 ill.remove(scene);return fills;
}
(async()=>{
 const petals=await check('rosePetals');const ribbon=await check('silkRibbon');
 assert.ok(petals>1500&&ribbon>1500,'both modes paint substantial continuous motion');
 calls.length=0;const still=ill.create('womenvn','still');
 await new Promise(r=>setImmediate(r));
 ill.setRunning(still,true);assert.equal(frames.size,0,'still does not schedule drawing');
 assert.ok(calls.some(x=>x[0]==='text'&&x[1]==='20/10'),'still photo retains full celebration date');
 ill.remove(still);
 const mod=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
 for(const id of ['rosePetals','silkRibbon'])assert.ok(mod.includes(`['${id}'`),'saved motion ID kept: '+id);
 const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(x=>x.startsWith('app.')&&x.endsWith('.js'));
 const app=fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8');
 assert.ok(app.includes('womenvnSilkRibbon')&&app.includes('womenvnPetalFall'),'new 20/10 rig present in production');
 assert.ok(fs.readFileSync(path.join(root,'dist/build.json'),'utf8').includes('17.22.37'));
 console.log('PASS womenvn V17.22.37: petals '+petals+', ribbon '+ribbon+'; 60Hz simulated ticks, original pink art, still, pause, full 20/10');
})().catch(e=>{console.error(e);process.exitCode=1});
