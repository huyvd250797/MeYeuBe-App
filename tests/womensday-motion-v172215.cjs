// Regression test: International Women's Day A/B/still use exclusive sprites.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const captures=[];const loaded=[];
const fakeCanvas=()=>{
  const actions=[];
  const ctx={setTransform(){},clearRect(){actions.length=0},save(){},restore(){},beginPath(){},rect(){},clip(){},translate(){},rotate(){},scale(){},drawImage(img,...args){actions.push({image:img.src,...{args}})}};
  return {tag:'canvas',width:0,height:0,style:{},setAttribute(){},getContext(){return ctx},actions};
};
const doc={createElement(tag){if(tag==='canvas')return fakeCanvas();return {tag,children:[],dataset:{},style:{},className:'',classList:{toggle(){}},append(el){this.children.push(el)},remove(){},addEventListener(){},setAttribute(){},getBoundingClientRect(){return {width:816,height:381}}}}};
const pending=new Map();let rid=0;
const win={devicePixelRatio:1,requestAnimationFrame(cb){const id=++rid;pending.set(id,cb);return id},cancelAnimationFrame(id){pending.delete(id)},setTimeout(fn){queueMicrotask(fn)},Image:class{width=100;height=78;set src(s){this._src=s;loaded.push(s);queueMicrotask(()=>this.onload&&this.onload())}get src(){return this._src}}};
const sandbox={window:win,document:doc,console,Promise,Date,Math,Image:win.Image};
for(const name of ['calendar','model','illustration'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/features/seasonal',name+'.js'),'utf8'),sandbox);
const art=win.mybSeasonalIllustration;
const frame=(ts)=>{const list=[...pending.values()];pending.clear();list.forEach(fn=>fn(ts))};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  const scenes={};
  for(const mode of ['butterflies','petals','still']){
    const layer=art.create('womensday',mode);
    await flush();await flush();
    assert.match(layer.children[0].src,/womensday-rose-scene-v8\.webp$/);
    art.setRunning(layer,true);
    frame(0);frame(40);frame(80);
    scenes[mode]=layer.children[1].actions.map(a=>a.image);
    if(mode==='butterflies'){
      assert.ok(scenes[mode].length>0,'Butterflies must render real sprites');
      assert.ok(scenes[mode].every(s=>s.endsWith('womensday-butterfly-v8.webp')),'Mode A draws only butterflies');
    }else if(mode==='petals'){
      assert.ok(scenes[mode].length>0,'Petals must render real sprites');
      assert.ok(scenes[mode].every(s=>s.endsWith('womensday-petal-v8.webp')),'Mode B draws only petals');
    }else assert.equal(scenes[mode].length,0,'Still must render nothing');
    art.setRunning(layer,false);art.remove(layer);
  }
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  for(const f of ['womensday-rose-scene-v8.webp','womensday-butterfly-v8.webp','womensday-petal-v8.webp']){
    assert.ok(fs.existsSync(path.join(ROOT,'src/features/seasonal/art',f)),'asset exists '+f);
    assert.ok(sw.includes(f),'SW precaches '+f);
  }
  const css=fs.readFileSync(path.join(ROOT,'src/styles/seasonal.css'),'utf8');
  assert.match(css,/html\[data-season="womensday"\].*\.seasonSceneReference/s);
  assert.match(css,/object-fit:contain!important/);
  console.log('PASS: Women 08/03 A uses butterfly sprites, B petals, Still empty; scene and offline assets present');
})().catch(e=>{console.error(e);process.exitCode=1});
