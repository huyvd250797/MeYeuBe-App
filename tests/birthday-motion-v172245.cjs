'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
let now=0,next=1;const queue=new Map(),ops=[];
const gradient={addColorStop(){}};
const context=new Proxy({imageSmoothingEnabled:true,
 createLinearGradient(){return gradient},createRadialGradient(){return gradient},
 setTransform(...x){ops.push(['matrix',...x])},clearRect(...x){ops.push(['clear',...x])},
 drawImage(i){ops.push(['image',i?.src||'canvas'])}},
 {get(o,key){if(key in o)return o[key];return (...args)=>ops.push([key,...args.filter(a=>typeof a==='number')]);},
 set(o,key,v){o[key]=v;return true}});
class Img {constructor(){this.naturalWidth=this.width=548;this.naturalHeight=this.height=215;this._src=''}
 set src(x){this._src=x;queueMicrotask(()=>this.onload?.())}get src(){return this._src}}
const doc={createElement(tag){const el={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(x){this.children.push(x)},setAttribute(){},addEventListener(){},remove(){},
 closest(){return null},getBoundingClientRect(){return {width:420,height:210}}};
 if(tag==='img'){el.naturalWidth=548;el.naturalHeight=215}
 if(tag==='canvas'){el.width=840;el.height=420;el.getContext=()=>context}
 return el;}};
const w={devicePixelRatio:2,setTimeout(f){queueMicrotask(f)},requestAnimationFrame(f){const id=next++;queue.set(id,f);return id},cancelAnimationFrame(id){queue.delete(id)}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8'),{window:w,document:doc,Image:Img,Math,Promise,console});
const ill=w.mybSeasonalIllustration;
function tick(count){for(let n=0;n<count;n++){
 const callbacks=[...queue.values()];queue.clear();assert.ok(callbacks.length,'active mode must schedule frames');
 now+=1000/60;for(const cb of callbacks)cb(now);
}}
function geometry(){return JSON.stringify(ops.filter(a=>['translate','rotate','moveTo','ellipse','fillRect','arc'].includes(a[0])).slice(-150))}
async function test(mode){
 const scene=ill.create('birthday',mode);await new Promise(r=>setImmediate(r));
 assert.equal(scene.children.length,2,'only original image and one canvas');
 assert.ok(scene.children[0].src.endsWith('birthday-photo-hero-v3.webp'),'unaltered V41 hero filename');
 assert.equal(scene.children[1].tag,'canvas');
 ops.length=0;ill.setRunning(scene,true);tick(14);
 const first=geometry();assert.ok(ops.some(a=>a[0]==='matrix'&&a[1]>0),'image/photo-coordinate mapping applied');
 ops.length=0;tick(70);const second=geometry();
 assert.notEqual(first,second,'animation geometry must change over elapsed time');
 assert.ok(ops.filter(a=>a[0]==='fill').length>50,'enough visible drawn shapes');
 if(mode==='candles'){
  assert.ok(!ops.some(a=>a[0]==='fillRect'),'candlelight should not introduce confetti squares');
  assert.ok(ops.some(a=>a[0]==='ellipse'),'flame highlights should flicker');
 }else{
  assert.ok(ops.some(a=>a[0]==='fillRect'),'confetti renders colored papers');
  assert.ok(ops.some(a=>a[0]==='bezierCurveTo'),'balloons rendered with organic geometry');
 }
 ill.setRunning(scene,false);assert.equal(queue.size,0,'pause must clear rAF immediately');
 ill.remove(scene);
}
(async()=>{
 await test('candles');await test('confetti');
 const still=ill.create('birthday','still');await new Promise(r=>setImmediate(r));
 ops.length=0;ill.setRunning(still,true);assert.equal(queue.size,0,'still mode cannot run animation');
 assert.equal(ops.filter(a=>a[0]==='fill').length,0,'still image remains completely untouched');
 ill.remove(still);
 const model=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
 assert.ok(model.includes("['confetti','Pháo giấy dịu']")&&model.includes("['candles','Nến lung linh']"),'saved IDs retained');
 const code=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
 assert.ok(code.includes('drawBirthday(state)'));
 assert.ok(!code.includes('birthday-motion-v42.webp'),'no GIF/WebP animation');
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'dist/build.json'),'utf8')).build,'17.22.45');
 const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(f=>f.startsWith('app.')&&f.endsWith('.js'));
 assert.ok(fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8').includes('birthdayBalloon'));
 console.log('PASS Birthday V17.22.45: 2 modes, unique animation, 60Hz ticks, pause/still, preserved image, production bundle');
})().catch(e=>{console.error(e);process.exitCode=1});
