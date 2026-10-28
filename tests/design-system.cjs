const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),{JSDOM,VirtualConsole}=require('jsdom');
let count=0;function ok(name,fn){fn();console.log('PASS '+name);count++}
const html=fs.readFileSync('index.html','utf8'),files=['legacy','tokens','components','forms','accessibility','care-workflow','milk-insights','loading','health-planning','health-foundation','dashboard-polish','viewport'],css=Object.fromEntries(files.map(k=>[k,fs.readFileSync('src/styles/'+k+'.css','utf8')]));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://app.test/',runScripts:'outside-only',virtualConsole:vc}),w=dom.window;
try {
files.forEach(k=>{let s=w.document.createElement('style');s.textContent=css[k];w.document.head.appendChild(s)});
ok('Production CSS parses without errors',()=>assert.deepEqual(errors,[]));
ok('HTML references the complete stylesheet cascade in order',()=>{const links=[...w.document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.getAttribute('href').split('?')[0]);assert.deepEqual(links,files.map(k=>'./src/styles/'+k+'.css'))});
ok('All CSS assets survive offline precache',()=>files.forEach(k=>assert.ok(fs.readFileSync('sw.js','utf8').includes('./src/styles/'+k+'.css'))));
const manifest=JSON.parse(fs.readFileSync('docs/CSS_EXTRACTION_V16.1.0.json','utf8')),blocks=css.legacy.split(/\/\* Extracted block \d+ \*\/\n/).slice(1).map((s,i,a)=>i<a.length-1?s.slice(0,-1):s);
ok('All 31 historical style blocks remain byte-exact and ordered',()=>{assert.equal(blocks.length,31);assert.deepEqual(blocks.map(s=>crypto.createHash('sha256').update(s).digest('hex')),manifest.sha256_blocks)});
ok('Viewport allows user zoom',()=>{const viewport=w.document.querySelector('meta[name="viewport"]').content;assert.ok(!/user-scalable=no|maximum-scale=1/.test(viewport))});
const sheet=Array.from(w.document.styleSheets).find(s=>Array.from(s.cssRules).some(r=>r.selectorText===':root'&&r.style.getPropertyValue('--ds-text'))),root=[...sheet.cssRules].find(r=>r.selectorText===':root'),dark=[...sheet.cssRules].find(r=>r.selectorText===':root[data-theme="dark"]');
const tokens=rule=>Object.fromEntries(Array.from({length:rule.style.length},(_,i)=>rule.style[i]).map(k=>[k,rule.style.getPropertyValue(k).trim()]));const light=tokens(root),night={...light,...tokens(dark)};
function lum(hex){const rgb=hex.slice(1).match(/../g).map(h=>parseInt(h,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb.reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const [name,t] of [['light',light],['dark',night]]){
 ok(name+' text and semantic status pairs meet 4.5:1',()=>{for(const [fg,bg] of [['text','surface'],['muted','surface'],['accent','surface'],['success','success-soft'],['danger','danger-soft'],['warning','warning-soft'],['info','info-soft'],['on-brand','brand'],['on-success','success']])assert.ok(ratio(t['--ds-'+fg],t['--ds-'+bg])>=4.5,name+' '+fg+'/'+bg)});
}
let system=false;w.matchMedia=()=>({matches:system,addEventListener(){}});w.fetch=()=>new Promise(()=>{});w.navigator.serviceWorker={register:()=>new Promise(()=>{}),addEventListener(){}};w.eval(fs.readFileSync('boot.js','utf8'));
for(const [mode,sys,expected] of [['light',true,''],['dark',false,'dark'],['auto',true,'dark'],['auto',false,'']]){
 ok('Boot '+mode+' systemDark='+sys+' resolves before app rendering',()=>{system=sys;const db=JSON.stringify({settings:{themeMode:mode},careEvents:[{id:'keep'}]});w.localStorage.setItem('meYeuBePWA_v4',db);w.mybThemeApply();assert.equal(w.document.documentElement.dataset.theme,expected);assert.equal(w.localStorage.getItem('meYeuBePWA_v4'),db);assert.equal(w.getComputedStyle(w.document.documentElement).getPropertyValue('--ds-bg').trim(),expected?night['--ds-bg']:light['--ds-bg'])});
}
ok('Minimum target and keyboard focus are defined centrally',()=>{assert.equal(light['--ds-target'],'44px');assert.match(css.components,/button:focus-visible/);assert.match(css.components,/outline:3px solid var\(--ds-focus\)!important/)});
ok('Reduced-motion and high-contrast preferences have presentation rules',()=>{assert.match(css.components,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css.components,/@media\(forced-colors:active\)/)});
w.eval(fs.readFileSync('src/ui/runtime.js','utf8'));
let status=w.mybUI.status('designTest',w.document.body,'<kept draft>','error');
ok('Shared error status is readable text, announced and safely escaped',()=>{assert.equal(status.textContent,'<kept draft>');assert.equal(status.children.length,0);assert.equal(status.getAttribute('role'),'alert');assert.ok(status.classList.contains('mybStatus'));assert.equal(status.dataset.state,'error')});
w.mybUI.status('designTest',w.document.body,'Đã lưu','saved');
ok('Acknowledged status reuses the same live node',()=>{assert.equal(w.document.querySelectorAll('#designTest').length,1);assert.equal(status.getAttribute('role'),'status');assert.equal(status.dataset.state,'saved')});
console.log('RESULT '+count+' PASS / 0 FAIL');
}finally{w.close()}
