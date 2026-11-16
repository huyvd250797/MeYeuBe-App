// No external dependencies. Tests the real photo-mode engine, not a screenshot mock.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
let lastRAF=0, frames=new Map();
const images=[];
const contexts=new WeakMap();
function fakeCanvas(){
  const actions=[];
  const context=new Proxy({
    createLinearGradient:()=>({addColorStop(){}}),
    createRadialGradient:()=>({addColorStop(){}}),
    clearRect(){actions.push(['clearRect'])}
  },{get(target,k){return k in target?target[k]:(...args)=>{
      actions.push([k,...args.map(a=>a&&a.src?a.src:a)]);
    }},set(target,k,value){target[k]=value;return true}});
  const el={width:0,height:0,style:{},className:'',setAttribute(){},addEventListener(){},getContext:()=>context,actions};
  contexts.set(el,context);
  return el;
}
const document={
  createElement(tag){if(tag==='canvas')return fakeCanvas();const classes=new Set();return {
    tag,children:[],style:{},dataset:{},className:'',
    classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)},contains(name){return classes.has(name)}},
    append(child){this.children.push(child)},addEventListener(){},setAttribute(){},remove(){this.removed=true},
    getBoundingClientRect(){return {width:816,height:381}},closest(){return null}
  }}
};
const window={
  devicePixelRatio:2,requestAnimationFrame(cb){const id=++lastRAF;frames.set(id,cb);return id},
  cancelAnimationFrame(id){frames.delete(id)},setTimeout(cb){queueMicrotask(cb);return 1},
  Image:class {width=150;height=120;set src(path){this._src=path;images.push(path);queueMicrotask(()=>this.onload?.())}get src(){return this._src}}
};
const sandbox={window,document,Image:window.Image,console,Promise,Math,Date};
for(const name of ['calendar','model','illustration']){
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',name+'.js'),'utf8'),sandbox);
}
async function flush(){await new Promise(r=>setImmediate(r))}
function frame(time){const jobs=[...frames.values()];frames.clear();jobs.forEach(cb=>cb(time))}
(async()=>{
  const model=window.mybSeasonalModel,engine=window.mybSeasonalIllustration;
  assert.equal(model.presets.newyear.motions[0][0],'fireworks');
  assert.equal(model.presets.newyear.motions[1][0],'confetti');
  assert.match(model.presets.newyear.motions[1][1],/Ánh vàng/);
  assert.equal(model.normalize({themes:{newyear:{motion:'confetti'}}}).themes.newyear.motion,'confetti');
  const expected=['newyear-city-scene-v6.webp','newyear-city-header-v6.webp',
    'newyear-firework-rose-v6.webp','newyear-firework-pink-v6.webp',
    'newyear-firework-gold-v6.webp','newyear-firework-violet-v6.webp','newyear-glint-v6.webp'];
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const file of expected){
    assert.ok(fs.existsSync(path.join(root,'src/features/seasonal/art',file)),file);
    assert.ok(sw.includes(file),'SW cache missing '+file);
  }
  for(const [mode,expectDraw,denyDraw] of [
    ['fireworks','newyear-firework-','newyear-glint-'],
    ['confetti','newyear-glint-','newyear-firework-'],
    ['still',null,'newyear-']
  ]){
    const el=engine.create('newyear',mode);
    assert.equal(el.children[0].src,'./src/features/seasonal/art/newyear-city-scene-v6.webp');
    await flush();await flush();
    const canvas=el.children.find(c=>c.getContext);
    assert.ok(canvas.width>=816 && canvas.height>=381,mode+' retina canvas');
    engine.setRunning(el,true);
    for(let i=0;i<90;i++)frame(i*34);
    const drawPaths=canvas.actions.filter(a=>a[0]==='drawImage').map(a=>a[1]);
    if(expectDraw) assert.ok(drawPaths.some(x=>String(x).includes(expectDraw)),mode+' no expected art');
    if(denyDraw)assert.ok(!drawPaths.some(x=>String(x).includes(denyDraw)),mode+' mixed in wrong art');
    assert.ok(mode==='still'||canvas.actions.some(a=>a[0]==='rect'&&a[1]===344&&a[2]===23),'missing overlay clip');
    engine.setRunning(el,false);engine.remove(el);
  }
  // Verify previously approved Tết mode is untouched by New Year code.
  for(const mode of ['blossoms','lantern','still']){
    const el=engine.create('tet',mode);
    assert.match(el.children[0].src,mode==='lantern'?/tet-lantern-scene-v5/:/tet-mai-scene-v5/);
    engine.remove(el);
  }
  console.log('PASS: New Year A/B/Still are distinct, art is cached, motion is clipped, Tết Nguyên đán preserved.');
})().catch(err=>{console.error(err);process.exitCode=1});
