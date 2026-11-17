'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const commands=[],requests=[],raf=[];
let clock=0;
const brush={
  clearRect(){commands.length=0},setTransform(){},save(){},restore(){},translate(x,y){this.where=[x,y]},rotate(a){this.angle=a},
  drawImage(img,...args){commands.push({src:img?.src||'',where:this.where,angle:this.angle,args})},
  beginPath(){},rect(){},clip(){},fill(){},fillRect(){},moveTo(){},lineTo(){},stroke(){},
  createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}
};
const doc={createElement(tag){
  const e={tag,style:{},dataset:{},children:[],classList:{toggle(){}},
    append(x){this.children.push(x)},setAttribute(){},addEventListener(){},remove(){},
    getBoundingClientRect(){return {width:400,height:215}}};
  if(tag==='canvas'){e.width=800;e.height=430;e.getContext=()=>brush}
  return e;
}};
class ImageMock{
  constructor(){this.width=175;this.height=95;this.naturalWidth=0;this.naturalHeight=0}
  set src(value){this._src=value;requests.push(value);
    if(value.includes('beach-photo-hero-v3.webp')){this.naturalWidth=548;this.naturalHeight=215}
    queueMicrotask(()=>this.onload?.())}
  get src(){return this._src}
}
const win={Image:ImageMock,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},
  requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const context={window:win,document:doc,Image:ImageMock,Math,Promise,console};
for(const name of ['calendar','model','illustration'])
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',name+'.js'),'utf8'),context);
const {mybSeasonalModel:model,mybSeasonalIllustration:art}=win;
assert.deepEqual(Array.from(model.presets.beach.motions,v=>v[0]),['wave','clouds'],'saved cloud IDs preserved');
assert.equal(model.presets.beach.motions[0][1],'Sóng biển vỗ bờ tự nhiên');
assert.equal(model.presets.beach.motions[1][1],'Lá dừa đung đưa theo gió');
async function create(mode){
  commands.length=0;const before=requests.length;
  const el=art.create('beach',mode);
  await new Promise(r=>setImmediate(r));
  assert.match(el.children[0].src,/beach-photo-hero-v3\.webp$/,'unchanged approved sharp beach photo');
  return {el,requests:requests.slice(before)};
}
function tick(n=1){for(let i=0;i<n;i++){
  const f=raf.shift();assert(f,'animation rAF scheduled');clock+=34;f(clock);
}}
const waveFiles=['beach-foam-near-v29.webp','beach-foam-far-v29.webp'];
const palmFile='beach-palm-frond-v29.webp';
(async()=>{
  const a=await create('wave');
  for(const f of waveFiles)assert(a.requests.some(x=>x.endsWith(f)),'A requests '+f);
  assert(!a.requests.some(x=>x.endsWith(palmFile)),'A must not request palm');
  art.setRunning(a.el,true);tick(3);
  assert(commands.filter(x=>waveFiles.some(f=>x.src.endsWith(f))).length>=3,'A draws real photo wave layers');
  const a0=JSON.stringify(commands.filter(x=>waveFiles.some(f=>x.src.endsWith(f))).map(x=>x.args));
  tick(80);const a1=JSON.stringify(commands.filter(x=>waveFiles.some(f=>x.src.endsWith(f))).map(x=>x.args));
  assert.notEqual(a0,a1,'foam waves MUST advance and recede in real frames');
  art.remove(a.el);raf.length=0;
  const b=await create('clouds');
  assert(b.requests.some(x=>x.endsWith(palmFile)),'B loads palm sprite');
  assert(!b.requests.some(x=>waveFiles.some(f=>x.endsWith(f))),'B must not load foam or wave');
  art.setRunning(b.el,true);tick(3);
  const palm0=commands.filter(x=>x.src.endsWith(palmFile));
  assert.equal(palm0.length,1,'B draws one photo palm frond, not repeated generic particles');
  const rot0=palm0[0].angle;
  tick(70);
  const palm1=commands.filter(x=>x.src.endsWith(palmFile));
  assert.equal(palm1.length,1,'B still draws one anchored palm');
  assert.notEqual(rot0,palm1[0].angle,'B frond angle changes over time');
  art.remove(b.el);raf.length=0;
  const c=await create('still');
  assert(!c.requests.some(x=>[...waveFiles,palmFile].some(f=>x.endsWith(f))),'still does not load motion assets');
  art.setRunning(c.el,true);
  assert.equal(commands.length,0,'still never paints motion');
  art.remove(c.el);
  const prodWorker=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');
  for(const f of ['beach-photo-hero-v3.webp',...waveFiles,palmFile]){
    assert(fs.existsSync(path.join(root,'src/features/seasonal/art',f)),'src '+f);
    assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',f)),'dist '+f);
    assert(prodWorker.includes(f),'PWA precache '+f);
  }
  for(const f of ['index.html','build.json','manifest.webmanifest','sw.js'])
    assert(fs.readFileSync(path.join(root,'dist',f),'utf8').includes('17.22.29'),'dist build updated '+f);
  // Prove the code is actually bundled into production, not just edited in source.
  const js=fs.readdirSync(path.join(root,'dist/assets')).filter(x=>x.startsWith('app.')&&x.endsWith('.js'));
  assert(js.some(f=>{const s=fs.readFileSync(path.join(root,'dist/assets',f),'utf8');return s.includes('function drawBeach(')&&s.includes('beach-foam-near-v29.webp')}),'production app contains real beach rig');
  console.log('PASS V17.22.29: A animated real foam, B isolated palm, still empty, source/dist/offline version consistent');
})().catch(e=>{console.error(e);process.exitCode=1});
