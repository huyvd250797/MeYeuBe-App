/* V17.22.9 — zero-dependency smoke test of the exclusive Tet modes. */
'use strict';
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const actions=[];
function makeContext(){
  const grad=()=>({addColorStop(){}});
  let state={};
  return new Proxy({createRadialGradient:grad,createLinearGradient:grad,clearRect(){},getImageData(){return {data:new Uint8Array(4)}}},{
    get(o,k){if(k in o)return o[k];return (...args)=>{if(k==='drawImage') actions.push({type:k,src:args[0]?.src||'',args:args.slice(1)});else if(k==='rotate')actions.push({type:k,value:args[0]});return null}},
    set(o,k,v){state[k]=v;o[k]=v;return true}
  });
}
function el(tag){
 const classes=new Set();return {
   tag,style:{},dataset:{},className:'',children:[],width:0,height:0,
   classList:{toggle(key,on){on?classes.add(key):classes.delete(key)},contains(key){return classes.has(key)}},
   append(child){this.children.push(child);child.parent=this},remove(){this.removed=true},
   getBoundingClientRect(){return {width:816,height:381}},
   setAttribute(){},addEventListener(){},
   getContext:()=>makeContext()
 };
}
const images=[];const callbacks=new Map();let seed=0;
const window={devicePixelRatio:1,
 requestAnimationFrame(fn){const id=++seed;callbacks.set(id,fn);return id},cancelAnimationFrame(id){callbacks.delete(id)},
 setTimeout(fn){queueMicrotask(fn);return ++seed},
 Image:class{width=52;height=38;set src(value){this._src=value;images.push(value);queueMicrotask(()=>this.onload?.())}get src(){return this._src}},
};
const document={createElement:el};
const source=fs.readFileSync(path.join(ROOT,'src/features/seasonal/illustration.js'),'utf8');
vm.runInNewContext(source,{window,document,console,Promise,Date,Math,Image:window.Image});
const art=window.mybSeasonalIllustration;
function runFrame(t){const batch=[...callbacks.values()];callbacks.clear();for(const fn of batch)fn(t)}
function ticks(n){for(let i=0;i<n;i++)runFrame(i*35)}
const settle=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve))};
(async()=>{
  const cases=[['blossoms','tet-mai-scene-v51.webp','tet-petal-','tet-lantern-'],
    ['lantern','tet-lantern-scene-v51.webp','tet-lantern-','tet-petal-'],
    ['still','tet-mai-scene-v51.webp',null,null]];
  for(const [mode,scene,allowed,denied] of cases){
    actions.length=0;const layer=art.create('tet',mode);layer.append;await settle();
    assert.equal(layer.children[0].src,'./src/features/seasonal/art/'+scene,mode+' scene');
    assert.equal(layer.children.filter(c=>c.tag==='canvas').length,1,'canvas overlay');
    art.setRunning(layer,true);ticks(200);
    const paths=actions.filter(x=>x.type==='drawImage').map(x=>x.src);
    if(mode==='still')assert.equal(paths.length,0,'still contains no dynamic image');
    else {
      assert.ok(paths.some(x=>x.includes(allowed)),mode+' should draw photographic '+allowed);
      assert.ok(paths.every(x=>!x.includes(denied)),mode+' must not mix in '+denied);
    }
    art.setRunning(layer,false);art.remove(layer);assert.equal(layer.removed,true);
  }
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const names=['tet-mai-scene-v51.webp','tet-lantern-scene-v51.webp','tet-photo-header-v5.webp',
    'tet-lantern-small-v5.webp','tet-lantern-large-v5.webp','tet-lantern-ivory-v5.webp',
    'tet-petal-a-v5.webp','tet-petal-b-v5.webp','tet-petal-c-v5.webp'];
  for(const name of names){
    assert.ok(fs.existsSync(path.join(ROOT,'src/features/seasonal/art',name)),name+' exists');
    assert.ok(sw.includes(name),name+' precached');
  }
  const model=fs.readFileSync(path.join(ROOT,'src/features/seasonal/model.js'),'utf8');
  assert.match(model,/\['blossoms','Cánh mai thật rơi nhẹ'\]/);
  assert.match(model,/\['lantern','Đèn lồng thật đung đưa'\]/);
  console.log('PASS: Tet mode A/B/Tĩnh exclusive; photo sprites, scene refs and SW cache valid.');
})().catch(e=>{console.error(e);process.exitCode=1});
