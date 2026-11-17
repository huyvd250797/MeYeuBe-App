'use strict';
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const sceneJs=fs.readFileSync(path.join(root,'src/features/seasonal/illustration.js'),'utf8');
const modelJs=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
const requested=[],raf=[];
const ctx={setTransform(){},clearRect(){}};
function node(tag){
 const attrs=new Map();let source='';
 const el={tag,children:[],dataset:{},style:{},hidden:false,className:'',
   setAttribute(n,v){attrs.set(n,v);if(n==='src')source=v},
   getAttribute(n){return n==='src'?source||null:attrs.get(n)||null},
   removeAttribute(n){attrs.delete(n);if(n==='src')source=''},
   append(n){this.children.push(n)},addEventListener(){},remove(){},
   getBoundingClientRect(){return {width:548,height:215}},
   classList:{toggle(){}}};
 Object.defineProperty(el,'src',{get(){return source},set(v){source=v;attrs.set('src',v);requested.push(v)}});
 if(tag==='canvas'){el.width=0;el.height=0;el.getContext=()=>ctx}
 return el;
}
const doc={createElement:node};
class Img{set src(v){requested.push(v);queueMicrotask(()=>this.onload?.())}get src(){return ''}}
const window={Image:Img,devicePixelRatio:2,setTimeout(fn){queueMicrotask(fn)},requestAnimationFrame(fn){raf.push(fn);return raf.length},cancelAnimationFrame(){}};
const context={window,document:doc,Image:Img,Math,Promise,Date,console};
vm.runInNewContext(modelJs,context);
vm.runInNewContext(sceneJs,context);
const runner=window.mybSeasonalIllustration;
const modes=window.mybSeasonalModel.presets.midautumn.motions;
assert.deepEqual(Array.from(modes,m=>m[0]),['starLantern','clouds']);
(async()=>{
  for(const [mode,asset] of [['starLantern','midautumn-star-motion-v33.webp'],['clouds','midautumn-moon-motion-v33.webp']]){
    const dom=runner.create('midautumn',mode);
    assert.equal(dom.className,'seasonScene seasonSceneReference');
    assert.equal(dom.dataset.art,'midautumn');
    assert.equal(dom.children[0].src,'./src/features/seasonal/art/midautumn-photo-hero-v3.webp');
    assert.equal(dom.children[2].className,'seasonMidautumnMotion');
    assert.equal(dom.children[2].getAttribute('src'),null);
    assert.equal(dom.children[2].hidden,true);
    runner.setRunning(dom,true);
    assert(dom.children[2].src.endsWith(asset));
    assert.equal(dom.children[2].hidden,false);
    assert.equal(raf.length,0,'native image animation should not waste Canvas frames');
    runner.setRunning(dom,false);
    assert.equal(dom.children[2].getAttribute('src'),null,'stops decoder when hidden');
    assert.equal(dom.children[2].hidden,true);
    runner.setRunning(dom,true);
    assert(dom.children[2].src.endsWith(asset),'resumes after visibility');
    runner.remove(dom);
    assert.equal(dom.children[2].getAttribute('src'),null);
  }
  const still=runner.create('midautumn','still');
  assert.equal(still.children.length,2,'static mode has no animated image');
  runner.setRunning(still,true);
  runner.remove(still);
  for(const f of ['midautumn-star-motion-v33.webp','midautumn-moon-motion-v33.webp']){
    assert(fs.existsSync(path.join(root,'src/features/seasonal/art',f)), 'source '+f);
    assert(fs.existsSync(path.join(root,'dist/src/features/seasonal/art',f)), 'production '+f);
    const sw=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8');assert(sw.includes(f),'offline precache '+f);
  }
  const css=fs.readFileSync(path.join(root,'src/styles/seasonal.css'),'utf8');
  assert(css.includes('.seasonSceneReference[data-art="midautumn"] .seasonMidautumnMotion'));
  assert(css.includes('seasonMidautumnMotion[hidden]'));
  const bundle=fs.readdirSync(path.join(root,'dist/assets')).find(s=>/^app\..*\.js$/.test(s));
  assert(fs.readFileSync(path.join(root,'dist/assets',bundle),'utf8').includes('midautumn-star-motion-v33.webp'));
  console.log('PASS Mid-Autumn V17.22.33: two exclusive card-only motion layers, still, lifecycle, no RAF, PWA source+dist assets');
})().catch(e=>{console.error(e);process.exitCode=1});
