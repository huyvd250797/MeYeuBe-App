// Zero-dependency suite for the seasonal model + Canvas + photo scenes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const sources=['calendar','model','illustration'].map(n=>fs.readFileSync(path.join(ROOT,'src/features/seasonal',n+'.js'),'utf8'));
const fakeCanvas=()=>{
  const actions=[];
  const gradient=()=>({addColorStop(){}});
  const proxy=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,clearRect:()=>{actions.length=0}},
    {get(target,key){return key in target?target[key]:(...args)=>{actions.push([key,...args.map(x=>typeof x==='number'?Math.round(x*10000)/10000:typeof x)])}},
      set(target,key,value){actions.push([key,value]);target[key]=value;return true}});
  return {tag:'canvas',width:0,height:0,style:{},className:'',setAttribute(){},addEventListener(){},getContext:()=>proxy,events:actions};
};
const images=[];
const doc={createElement(tag){if(tag==='canvas')return fakeCanvas();const classes=new Set();return {tag,children:[],dataset:{},className:'',style:{},classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)},contains(name){return classes.has(name)}},append(child){this.children.push(child)},remove(){this.removed=true},setAttribute(){},addEventListener(){},getBoundingClientRect(){return {width:816,height:381}}}}};
let raf=0;
const next=new Map();
const clock={requestAnimationFrame(callback){const id=++raf;next.set(id,callback);return id},cancelAnimationFrame(id){next.delete(id)}};
const win={...clock,devicePixelRatio:1,setTimeout(fn){queueMicrotask(fn);return 1},Image:class{width=200;height=185;set src(value){images.push(value);queueMicrotask(()=>this.onload?.())}}};
const sandbox={window:win,document:doc,console,Promise,Math,Date,Image:win.Image};
for(const source of sources)vm.runInNewContext(source,sandbox);
const cal=win.mybSeasonalCalendar,model=win.mybSeasonalModel,art=win.mybSeasonalIllustration;
function runFrame(ms){const batch=[...next.values()];next.clear();for(const callback of batch)callback(ms)}
(async()=>{
  const defaults=model.normalize(null);
  assert.equal(model.ids.length,20);
  assert.equal(defaults.motion,true);
  assert.equal(model.normalize({motion:false}).motion,false);
  const dates={
    '2026-01-01':'newyear','2026-03-03':'nguyentieu','2026-03-08':'womensday',
    '2026-04-26':'hungking','2026-06-19':'doanngo','2026-06-28':'family',
    '2026-08-27':'vulan','2026-09-02':'nationalday','2026-10-20':'womenvn',
    '2026-11-24':'culture','2027-02-20':'nguyentieu','2027-04-16':'hungking'
  };
  for(const [date,id] of Object.entries(dates))assert.equal(model.active(defaults,date),id,date);
  for(const id of model.ids){
    assert.equal(model.presets[id].motions.length,2);
    for(const kind of ['base-v2.webp','piece-v2.webp',...Array.from({length:8},(_,i)=>`card-${i+1}.webp`)]){
      assert.equal(fs.existsSync(path.join(ROOT,'src/features/seasonal/art',id+'-'+kind)),true,id+'/'+kind);
      assert.ok(fs.readFileSync(path.join(ROOT,'sw.js'),'utf8').includes(id+'-'+kind),id+'/'+kind+' SW');
    }
    for(const mode of ['still',...model.presets[id].motions.map(item=>item[0])]){
      const layer=art.create(id,mode);await new Promise(r=>setImmediate(r));
      const isPhoto=["tet", "beach", "reunification", "children", "birthday", "midautumn", "school", "halloween", "teachers", "christmas", "nationalday", "womenvn", "family", "vulan", "hungking", "culture", "womensday", "doanngo", "nguyentieu", "newyear"].includes(id);
      if(isPhoto){
        assert.equal(layer.children[0].tag,'img');
        if(id==='tet')assert.match(layer.children[0].src,/tet-(?:mai|lantern)-scene-v5\.webp$/);
        else if(id==='newyear')assert.match(layer.children[0].src,/newyear-city-scene-v7\.webp$/);
        else if(id==='nguyentieu')assert.match(layer.children[0].src,/nguyentieu-lake-scene-v7\.webp$/);
        else if(id==='womensday')assert.match(layer.children[0].src,/womensday-rose-scene-v8\.webp$/);
        else if(id==='hungking')assert.match(layer.children[0].src,/hungking-temple-scene-v9\.webp$/);
        else if(id==='reunification')assert.match(layer.children[0].src,/reunification-palace-scene-v10\.webp$/);
        else assert.match(layer.children[0].src,/photo-hero-v3\.webp$/);
        assert.equal(layer.children.filter(c=>c.tag==='canvas').length,1);
        for(const slot of ['hero','header','accent']){
          const photo=id+'-photo-'+slot+'-v3.webp';
          assert.ok(fs.existsSync(path.join(ROOT,'src/features/seasonal/art',photo)),photo);
          assert.ok(fs.readFileSync(path.join(ROOT,'sw.js'),'utf8').includes(photo),photo+' worker');
        }
        art.setRunning(layer,true);
        assert.equal(layer.classList.contains('scene-active'),mode!=='still');
        art.setRunning(layer,false);
        assert.equal(layer.classList.contains('scene-active'),false);
        art.remove(layer);
        assert.equal(layer.removed,true);
        continue;
      }
      const canvas=layer.children[0];const initial=JSON.stringify(canvas.events);
      assert.ok(initial.includes('drawImage'),id+'/'+mode+' draw image');
      art.setRunning(layer,true);
      for(let now=0;now<=800;now+=33)runFrame(now);
      const changed=JSON.stringify(canvas.events);
      if(mode==='still')assert.equal(changed,initial,id+'/'+mode);
      else assert.notEqual(changed,initial,id+'/'+mode);
      art.setRunning(layer,false);
      const stop=JSON.stringify(canvas.events);runFrame(1800);
      assert.equal(JSON.stringify(canvas.events),stop,id+'/'+mode);
      art.remove(layer);assert.equal(layer.removed,true);
    }
  }
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  assert.ok(!html.includes('id="seasonPreviewName"'),'holiday heading removed in preview');
  console.log('PASS: 20 themes, 40 animation modes, 260+ WebP assets, 12 calendar scenarios, preview without festival heading');
})().catch(e=>{console.error(e);process.exitCode=1});
