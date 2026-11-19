'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const wave1=['tet','newyear','nguyentieu','womensday','hungking','reunification','beach','nationalday','children','birthday'];
const wave2=['midautumn','school','halloween','teachers','christmas','womenvn','family','vulan','doanngo','culture'];
const ids=[...wave1,...wave2];
const css=fs.readFileSync(path.join(ROOT,'src/styles/splash-all-v47.css'),'utf8');
const mainCSS=fs.readFileSync(path.join(ROOT,'dist/assets',fs.readdirSync(path.join(ROOT,'dist/assets')).find(n=>/^app\..+\.css$/.test(n))),'utf8');
const sw=fs.readFileSync(path.join(ROOT,'dist/sw.js'),'utf8');
const boot=fs.readFileSync(path.join(ROOT,'boot.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8');
assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT,'build.json'),'utf8')).build,'17.22.47');
assert.ok(!html.includes('splash-wave1.css'),'Deprecated Wave 1 CSS should not be loaded');
for(const id of ids){
  const suffix=wave1.includes(id)?'wave1':'wave2';
  const art=id+'-splash-'+suffix+'.webp';
  assert.ok(css.includes(`data-splash-theme="${id}"`),`Missing CSS ID ${id}`);
  assert.ok(css.includes(`art/${art}`),`Wrong asset mapping ${id}`);
  assert.ok(mainCSS.includes('../src/features/seasonal/art/'+art),`Wrong production CSS asset mapping: ${id}`);
  assert.ok(sw.includes('src/features/seasonal/art/'+art),`SW missing ${id}`);
  assert.ok(fs.statSync(path.join(ROOT,'src/features/seasonal/art',art)).size>15000,`Missing source asset ${id}`);
  assert.ok(fs.statSync(path.join(ROOT,'dist/src/features/seasonal/art',art)).size>15000,`Missing prod asset ${id}`);
  assert.ok(boot.includes(id+':1'),`Bootstrap whitelist missing ${id}`);
}
// Early paint must apply the same-day cached ID, preserve wave1 cache on upgrade, and erase disabled/stale states.
const begin=boot.indexOf("  var SPLASH_CACHE='mybSeasonalSplashWave1_v1';");
const end=boot.indexOf('  var pendingUpdate=',begin);
assert.ok(begin>0&&end>begin);
const block=boot.slice(begin,end);
function bootstrap(cache){
  const attrs={};let stored=cache||'';
  const localStorage={getItem(){return stored},setItem(_,v){stored=v}};
  const document={documentElement:{setAttribute(k,v){attrs[k]=v},removeAttribute(k){delete attrs[k]}}};
  const sandbox={window:{},document,localStorage,Date};
  vm.runInNewContext(block,sandbox);
  return {attrs,window:sandbox.window,getCached:()=>stored};
}
const day=new Date(Date.now()+25200000).toISOString().slice(0,10);
for(const id of ids){
  const b=bootstrap(JSON.stringify({day,id}));
  assert.equal(b.attrs['data-splash-theme'],id,'First paint failed: '+id);
  assert.equal(b.window.mybSplashApply(id),id);
}
const stale=bootstrap(JSON.stringify({day:'2020-01-01',id:'halloween'}));
assert.equal(stale.attrs['data-splash-theme'],undefined);
const disabled=bootstrap(JSON.stringify({day,id:'christmas'}));
assert.equal(disabled.window.mybSplashApply(''),'' );
assert.equal(disabled.attrs['data-splash-theme'],undefined);
assert.equal(JSON.parse(disabled.getCached()).id,'');
assert.equal(disabled.window.mybSplashApply('unknown-festival'),'');
const seasonCtx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/features/seasonal/calendar.js'),'utf8'),seasonCtx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/features/seasonal/model.js'),'utf8'),seasonCtx);
const seasonal=seasonCtx.window.mybSeasonalModel;
assert.equal(seasonal.ids.length,20);
assert.deepEqual([...seasonal.ids].sort(),[...ids].sort());
for(const id of ids){
 const cfg=seasonal.normalize({themes:{[id]:{from:day,to:day}}});
 assert.equal(seasonal.active(cfg,day),id,'Active selection does not match splash ID: '+id);
 cfg.themes[id].enabled=false;
 assert.notEqual(seasonal.active(cfg,day),id,'Disabled theme should not be selected: '+id);
}
const ui=fs.readFileSync(path.join(ROOT,'src/features/seasonal/ui.js'),'utf8');
assert.ok(ui.includes('splashConfigResolved = true')&&ui.includes('w.mybSplashApply(id || \'\')'));
console.log('PASS — 20 images, 20 canonical IDs, 20 first-paint cases, active/disabled/Cloud, production URLs and PWA');
