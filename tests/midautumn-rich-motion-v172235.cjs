'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const calls=[];let now=0,next=1;const frames=new Map();
const brush={
  setTransform(...xs){calls.push(['transform',...xs])},
  clearRect(...xs){calls.push(['clear',...xs])},
  save(){},restore(){},beginPath(){},closePath(){},rect(){},clip(){},
  moveTo(...xs){calls.push(['move',...xs])},lineTo(...xs){calls.push(['line',...xs])},
  stroke(){calls.push(['stroke'])},
  fill(){calls.push(['fill'])},fillRect(...xs){calls.push(['fillRect',...xs])},
  arc(...xs){calls.push(['arc',...xs])},ellipse(...xs){calls.push(['ellipse',...xs])},
  quadraticCurveTo(...xs){calls.push(['quad',...xs])},
  translate(...xs){calls.push(['translate',...xs])},rotate(...xs){calls.push(['rotate',...xs])},
  drawImage(){calls.push(['image'])},
  createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}},
  imageSmoothingEnabled:true,
};
class ImageMock{constructor(){this.width=548;this.height=215;this.naturalWidth=548;this.naturalHeight=215}
 set src(value){this._src=value;queueMicrotask(()=>this.onload?.())}
 get src(){return this._src}}
const doc={createElement(tag){const el={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
 append(x){this.children.push(x)},setAttribute(){},addEventListener(){},remove(){},
 getBoundingClientRect(){return {width:400,height:215}}};
 if(tag==='img'){el.naturalWidth=548;el.naturalHeight=215}
 if(tag==='canvas'){el.width=800;el.height=430;el.getContext=()=>brush}
 return el}};
const w={Image:ImageMock,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
 requestAnimationFrame(fn){let id=next++;frames.set(id,fn);return id},
 cancelAnimationFrame(id){frames.delete(id)}};
const ctx={window:w,document:doc,Image:ImageMock,Math,Promise,console};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8'),ctx);
const ill=w.mybSeasonalIllustration;
function tick(n){for(let i=0;i<n;i++){
 const callbacks=[...frames.values()];frames.clear();assert.ok(callbacks.length,'rAF active');
 now+=1000/60;callbacks.forEach(fn=>fn(now));
}}
async function render(mode){
 calls.length=0;
 const scene=ill.create('midautumn',mode);
 await new Promise(r=>setImmediate(r));
 assert.equal(scene.children.length,2,'only base art and canvas; no WebP/GIF overlay');
 assert.ok(scene.children[0].src.endsWith('midautumn-photo-hero-v3.webp'));
 ill.setRunning(scene,true);tick(2);
 let early=JSON.stringify(calls.filter(x=>x[0]==='arc'||x[0]==='ellipse'||x[0]==='translate').slice(-120));
 calls.length=0;tick(120);
 const late=JSON.stringify(calls.filter(x=>x[0]==='arc'||x[0]==='ellipse'||x[0]==='translate').slice(-120));
 assert.notEqual(early,late,'continuous motion advances geometries');
 const fills=calls.filter(x=>x[0]==='fill').length;
 assert.ok(fills>2000,'visible dense animation draws >2,000 filled shapes across two seconds');
 ill.setRunning(scene,false);
 assert.equal(frames.size,0,'pauses immediately on visibility off');
 ill.remove(scene);
 return fills;
}
(async()=>{
 const star=await render('starLantern');const moon=await render('clouds');
 assert.ok(moon>star,'moon mode includes six lanterns and drifting cloud shapes');
 calls.length=0;const still=ill.create('midautumn','still');
 await new Promise(r=>setImmediate(r));
 ill.setRunning(still,true);assert.equal(frames.size,0,'still mode never schedules rAF');
 assert.equal(calls.filter(x=>x[0]==='fill').length,0,'still draws no overlay');
 ill.remove(still);
 const src=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
 assert.ok(src.includes('length:32')&&src.includes('i<6')&&src.includes('drawMidautumn(state)'));
 for(const obsolete of ['midautumn-star-motion-v33.webp','midautumn-moon-motion-v33.webp']){
  assert.ok(!fs.existsSync(path.join(root,'src/features/seasonal/art',obsolete)));
  assert.ok(!fs.existsSync(path.join(root,'dist/src/features/seasonal/art',obsolete)));
 }
 const bundled=fs.readdirSync(path.join(root,'dist/assets')).filter(x=>x.startsWith('app.')&&x.endsWith('.js'))[0];
 assert.ok(fs.readFileSync(path.join(root,'dist/assets',bundled),'utf8').includes('midFireflies'),'production includes new 60fps rig');
 assert.ok(fs.readFileSync(path.join(root,'dist/build.json'),'utf8').includes('17.22.35'));
 console.log('PASS Mid-Autumn V17.22.35: star fills='+star+', moon fills='+moon+'; card only, forever rAF, pause and still mode');
})().catch(e=>{console.error(e);process.exitCode=1});
