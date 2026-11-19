'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const ids=['tet','newyear','nguyentieu','womensday','hungking','reunification','beach','nationalday','children','birthday'];
const css=fs.readFileSync(path.join(base,'src/styles/splash-wave1.css'),'utf8');
const compiled=fs.readFileSync(path.join(base,'dist/assets',fs.readdirSync(path.join(base,'dist/assets')).find(n=>/^app\..+\.css$/.test(n))),'utf8');
const precache=fs.readFileSync(path.join(base,'dist/sw.js'),'utf8');
for(const id of ids){
  const name=id+'-splash-wave1.webp';
  assert.ok(css.includes('art/'+name),'Missing source themed CSS for '+id);
  assert.ok(compiled.includes('../src/features/seasonal/art/'+name),'Incorrect dist CSS asset reference for '+id);
  assert.ok(precache.includes('src/features/seasonal/art/'+name),'Missing PWA cache asset for '+id);
  assert.ok(fs.statSync(path.join(base,'dist/src/features/seasonal/art',name)).size>15000,'Tiny or missing '+name);
}
const boot=fs.readFileSync(path.join(base,'boot.js'),'utf8');
const first=boot.indexOf("  var SPLASH_CACHE='mybSeasonalSplashWave1_v1';");
const last=boot.indexOf('  var pendingUpdate=',first);
assert.ok(first>=0&&last>first);
const block=boot.slice(first,last);
function scenario(cache){
  const attributes={};let content=cache||'';
  const storage={getItem:()=>content,setItem:(k,v)=>{content=v}};
  const context={window:{},Date,localStorage:storage,
    document:{documentElement:{setAttribute(k,v){attributes[k]=v},removeAttribute(k){delete attributes[k]}}}};
  vm.runInNewContext(block,context);
  return {attributes,storage,context,getContent:()=>content};
}
const today=new Date(Date.now()+25200000).toISOString().slice(0,10);
const cached=scenario(JSON.stringify({day:today,id:'hungking'}));
assert.equal(cached.attributes['data-splash-theme'],'hungking','Same-day cache should appear at first paint');
assert.equal(cached.context.window.mybSplashApply('birthday'),'birthday');
assert.equal(cached.attributes['data-splash-theme'],'birthday');
assert.equal(JSON.parse(cached.getContent()).id,'birthday');
assert.equal(cached.context.window.mybSplashApply('school'),'school');
assert.equal(cached.attributes['data-splash-theme'],'school','Wave 2 is now supported in V17.22.47');
const stale=scenario(JSON.stringify({day:'2020-01-01',id:'tet'}));
assert.equal(stale.attributes['data-splash-theme'],undefined,'Stale cached theme must not display');
const ui=fs.readFileSync(path.join(base,'src/features/seasonal/ui.js'),'utf8');
assert.ok(ui.includes('splashConfigResolved = true')&&ui.includes('w.mybSplashApply(id || \'\')'),'Cloud-shared configuration must be authoritative');
console.log('Seasonal Splash Wave 1 regression: original 10 assets and extended Wave 2 bootstrap PASS');
