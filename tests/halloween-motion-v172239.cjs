'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ops=[];let now=0,next=1;const queued=new Map();
const gradient={addColorStop(){}};
const ctx=new Proxy({imageSmoothingEnabled:true,
 createLinearGradient(){return gradient},createRadialGradient(){return gradient},
 setTransform(...args){ops.push(['transform',...args])},clearRect(...args){ops.push(['clear',...args])},
 drawImage(img){ops.push(['image',img?.src||'canvas'])},
 setLineDash(){}},
 {get(target,field){if(field in target)return target[field];return (...args)=>{ops.push([field,...args.filter(a=>typeof a==='number')]);}},
 set(target,field,value){target[field]=value;return true;}});
class Img{constructor(){this.naturalWidth=this.width=548;this.naturalHeight=this.height=215;this._src=''}
 set src(v){this._src=v;queueMicrotask(()=>this.onload?.())}
 get src(){return this._src}}
const doc={createElement(tag){const el={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(c){this.children.push(c)},setAttribute(){},addEventListener(){},remove(){this.removed=true},
 getBoundingClientRect(){return {width:420,height:200}}};
 if(tag==='img')Object.assign(el,{naturalWidth:548,naturalHeight:215});
 if(tag==='canvas')Object.assign(el,{width:840,height:400,getContext:()=>ctx});
 return el;}};
const w={devicePixelRatio:2,setTimeout(cb){queueMicrotask(cb)},
 requestAnimationFrame(cb){const id=next++;queued.set(id,cb);return id},
 cancelAnimationFrame(id){queued.delete(id)}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8'),
 {window:w,document:doc,Image:Img,Math,Promise,Date,console});
const ill=w.mybSeasonalIllustration;
function tick(n){for(let i=0;i<n;i++){
 const pending=[...queued.values()];queued.clear();assert.ok(pending.length,'active Halloween requests frames');
 now+=1000/60;for(const fn of pending)fn(now);
}}
async function check(mode){
 ops.length=0;
 const scene=ill.create('halloween',mode);await new Promise(r=>setImmediate(r));
 assert.equal(scene.children.length,2,'original photo and one Canvas, no GIF/extra overlay');
 assert.ok(scene.children[0].src.endsWith('halloween-photo-hero-v3.webp'),'original purple Halloween image preserved');
 assert.equal(scene.children[1].tag,'canvas');
 ill.setRunning(scene,true);tick(8);
 const before=JSON.stringify(ops.filter(o=>['translate','rotate','moveTo','lineTo','ellipse'].includes(o[0])).slice(-100));
 ops.length=0;tick(150);
 const after=JSON.stringify(ops.filter(o=>['translate','rotate','moveTo','lineTo','ellipse'].includes(o[0])).slice(-100));
 assert.notEqual(before,after,'continuous animation geometry evolves over elapsed time');
 const fills=ops.filter(o=>o[0]==='fill').length;
 assert.ok(fills>1800,`${mode} produces visibly many moving shapes, got ${fills}`);
 if(mode==='pumpkin')assert.ok(ops.some(o=>o[0]==='image'&&String(o[1]).endsWith('halloween-piece-v2.webp')),'pumpkin mode uses art-matched bat sprite');
 else assert.ok(!ops.some(o=>o[0]==='image'&&String(o[1]).endsWith('halloween-piece-v2.webp')),'ghost mode never reuses large bat sticker');
 ill.setRunning(scene,false);assert.equal(queued.size,0,'motion stops immediately when hidden');
 ill.remove(scene);return fills;
}
(async()=>{
 const a=await check('pumpkin'),b=await check('bats');
 const still=ill.create('halloween','still');await new Promise(r=>setImmediate(r));
 ill.setRunning(still,true);assert.equal(queued.size,0,'still requests no RAF');ill.remove(still);
 const model=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
 for(const id of ['pumpkin','bats'])assert.ok(model.includes(`['${id}'`),'saved mode id unchanged');
 const out=JSON.parse(fs.readFileSync(path.join(root,'dist/build.json'),'utf8'));
 assert.equal(out.build,'17.22.39');
 const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(f=>f.startsWith('app.')&&f.endsWith('.js'));
 const code=fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8');
 assert.ok(code.includes('drawHalloween')&&code.includes('halloweenFriendlyGhost')&&code.includes('halloweenPumpkinFace'));
 console.log(`PASS Halloween V17.22.39 | 60Hz simulated | pumpkin ${a} fills | ghost ${b} fills | pause/still | art & modes preserved`);
})().catch(err=>{console.error(err);process.exitCode=1});
