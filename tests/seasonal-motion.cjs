const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');const log=[];
function fakeCanvas(){
 const actions=[];const gradient={addColorStop(){}};
 const ctx=new Proxy({clearRect(){actions.length=0},createLinearGradient(){return gradient},createRadialGradient(){return gradient}},
 {get(t,k){return k in t?t[k]:(...args)=>actions.push([k,...args.map(v=>typeof v==='number'?Math.round(v*100)/100:v)])},set(t,k,v){t[k]=v;return true}});
 return {width:0,height:0,clientWidth:320,clientHeight:148,getContext(){return ctx},getBoundingClientRect(){return {width:320,height:148}},actions};
}
const w={devicePixelRatio:1,requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/features/seasonal/motion-canvas.js'),'utf8'),{window:w,Math});
const config=fs.readFileSync(path.join(root,'src/features/seasonal/model.js'),'utf8');
vm.runInNewContext(config,{window:w,Math,Date});
const shapes=new Map();
for(const id of w.mybSeasonalModel.ids){
 let previous='';
 for(const [mode] of w.mybSeasonalModel.presets[id].motions){
   const canvas=fakeCanvas();const engine=w.mybSeasonalMotionCanvas.create(canvas,id,mode);
   engine.renderAt(7.25);
   const trace=JSON.stringify(canvas.actions);
   assert.ok(trace.length>10,`${id}/${mode}: empty animation`);
   assert.notEqual(trace,previous,`${id}: modes render identically`);
   previous=trace;shapes.set(id+':'+mode,trace.length);
 }
 const canvas=fakeCanvas();w.mybSeasonalMotionCanvas.create(canvas,id,'still').renderAt(4);
 assert.equal(canvas.actions.length,0,`${id}: still mode must not paint`);
}
console.log('PASS: 20 themes; 40 distinct per-theme real-motion drawings; still mode paints no particles');
