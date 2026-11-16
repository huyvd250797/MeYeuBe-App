/* V17.22.14 — regression test against the REAL illustration engine. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const frames=new Map(),allImages=[],actions=[];let nextFrame=0;
function gradient(){return {addColorStop(){}}}
function makeCanvas(){
  const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient}, {
    get(t,k){return k in t?t[k]:(...args)=>{actions.push({key:k,args});return undefined}},
    set(t,k,v){t[k]=v;return true}
  });
  return {tag:'canvas',width:0,height:0,style:{},setAttribute(){},addEventListener(){},getContext(){return ctx}};
}
function el(tag){
  if(tag==='canvas')return makeCanvas();
  const classes=new Set();
  return {tag,style:{},dataset:{},children:[],className:'',
    classList:{toggle(n,enabled){enabled?classes.add(n):classes.delete(n)}},
    append(c){this.children.push(c)},remove(){this.removed=true},setAttribute(){},addEventListener(){},
    getBoundingClientRect(){return {width:816,height:381}},closest(){return null}};
}
const win={devicePixelRatio:2,
  requestAnimationFrame(fn){const id=++nextFrame;frames.set(id,fn);return id},
  cancelAnimationFrame(id){frames.delete(id)},setTimeout(fn){queueMicrotask(fn)},
  Image:class{width=72;height=56;set src(v){this._src=v;allImages.push(v);queueMicrotask(()=>this.onload?.())}get src(){return this._src}}
};
const sandbox={window:win,document:{createElement:el},Image:win.Image,Promise,Math,Date,console};
for(const file of ['calendar.js','model.js','illustration.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal',file),'utf8'),sandbox);
}
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve))};
function tick(t){const group=[...frames.values()];frames.clear();group.forEach(fn=>fn(t))}
(async()=>{
  const model=win.mybSeasonalModel,scene=win.mybSeasonalIllustration;
  assert.deepEqual(Array.from(model.presets.nguyentieu.motions, ([id])=>id),['lanternGlow','moonClouds']);
  assert.match(model.presets.nguyentieu.motions[0][1],/Đèn trời/);
  assert.match(model.presets.nguyentieu.motions[1][1],/Hoa đăng/);
  assert.equal(model.normalize({themes:{nguyentieu:{motion:'moonClouds'}}}).themes.nguyentieu.motion,'moonClouds');
  const required=['nguyentieu-lake-scene-v7.webp','nguyentieu-sky-lantern-large-v7.webp','nguyentieu-sky-lantern-small-v7.webp','nguyentieu-floating-lotus-large-v7.webp','nguyentieu-floating-lotus-small-v7.webp'];
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const name of required){
    assert.ok(fs.existsSync(path.join(root,'src/features/seasonal/art',name)),name+' asset missing');
    assert.ok(sw.includes(name),'offline precache missing '+name);
  }
  for(const [mode,requiredSprite,forbiddenSprite] of [
    ['lanternGlow','nguyentieu-sky-lantern-','nguyentieu-floating-lotus-'],
    ['moonClouds','nguyentieu-floating-lotus-','nguyentieu-sky-lantern-'],
    ['still',null,'nguyentieu-']
  ]){
    actions.length=0;
    const node=scene.create('nguyentieu',mode);
    assert.match(node.children[0].src,/nguyentieu-lake-scene-v7\.webp$/);
    await settle();
    scene.setRunning(node,true);
    for(let i=0;i<160;i++)tick(34*i);
    const draws=actions.filter(a=>a.key==='drawImage').map(a=>String(a.args[0]?.src||''));
    if(requiredSprite)assert.ok(draws.some(name=>name.includes(requiredSprite)),mode+' did not render own photo sprites');
    if(forbiddenSprite)assert.ok(draws.every(name=>!name.includes(forbiddenSprite)),mode+' mixed other motion');
    if(mode==='still')assert.equal(draws.length,0,'Still must render no moving images');
    else assert.ok(actions.some(a=>a.key==='rect' && a.args[0]===356),'motion not clipped to hero region');
    scene.setRunning(node,false);scene.remove(node);
  }
  assert.match(scene.create('tet','lantern').children[0].src,/tet-lantern-scene-v5\.webp$/);
  assert.match(scene.create('newyear','fireworks').children[0].src,/newyear-city-scene-v7\.webp$/);
  assert.equal(model.ids.length,20);
  console.log('PASS: Tết Nguyên Tiêu A/B/Tĩnh exclusive, correct assets/clip/offline; other festivals intact.');
})().catch(e=>{console.error(e);process.exitCode=1});
