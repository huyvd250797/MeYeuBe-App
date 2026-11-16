const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const modules=['calendar','model','illustration','ui'].map(name=>'src/features/seasonal/'+name+'.js');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html,{url:'https://local.test/',runScripts:'outside-only',pretendToBeVisual:true});
const {window:w}=dom;
const doc=w.document;
const el=id=>doc.getElementById(id);
const tick=()=>new Promise(resolve=>w.setTimeout(resolve,0));
const input=(id,value)=>{
  const target=el(id);
  if(typeof value==='boolean') target.checked=value;
  else target.value=value;
  target.dispatchEvent(new w.Event('change',{bubbles:true}));
};
const save=()=>el('seasonForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
let reduce=false, motionChange;
w.matchMedia=()=>({get matches(){return reduce},addEventListener(type,handler){motionChange=handler}});
w.showPage=id=>doc.querySelectorAll('.page').forEach(page=>page.classList.toggle('hidden',page.id!==id));
const storageKey='mybSeasonalAppearance_v1';
let cloud={enabled:true,url:'https://example.test',anonKey:'fixture',syncId:'main'};
let cloudSettings={babyName:'Bé',packingLists:[{id:'keep'}]},writes=0;
w.loadCloudConfig=()=>cloud;
w.mybDataClient={target:c=>c.url+'|'+c.syncId};
w.mybSettingsRepository={
  pending:()=>null,
  get:async()=>({settings:cloudSettings,expected:{other:'fixture'}}),
  save:async(next,previous,expected)=>{
    assert.equal(previous,cloudSettings);
    assert.equal(expected.other,'fixture');
    assert.deepEqual(next.packingLists,cloudSettings.packingLists);
    cloudSettings=JSON.parse(JSON.stringify(next));writes++;
    return {settings:cloudSettings};
  }
};
const contexts=new WeakMap();
const queued=new Map();
let frameId=0;
w.requestAnimationFrame=callback=>{const id=++frameId;queued.set(id,callback);return id};
w.cancelAnimationFrame=id=>queued.delete(id);
function step(time){
  const entries=[...queued.values()];queued.clear();
  entries.forEach(callback=>callback(time));
}
w.HTMLCanvasElement.prototype.getContext=function(){
  if(!contexts.has(this)){
    let calls=[];
    const methods={
      createRadialGradient:()=>({addColorStop(){}}),
      createLinearGradient:()=>({addColorStop(){}}),
      clearRect(){calls=[]},
      trace:()=>JSON.stringify(calls)
    };
    contexts.set(this,new Proxy(methods,{
      get(target,key){return key in target ? target[key] : (...args)=>calls.push([key,...args.map(value=>value instanceof w.HTMLCanvasElement?'canvas':value)])},
      set(target,key,value){calls.push([key,value]);target[key]=value;return true}
    }));
  }
  return contexts.get(this);
};
w.Image=class {
  width=150;
  height=120;
  set src(value){this.file=value;queueMicrotask(()=>this.onload?.())}
};

(async()=>{
  try{
    modules.slice(0,2).forEach(file=>w.eval(fs.readFileSync(file,'utf8')));
    const {holidays,vietnamDate}=w.mybSeasonalCalendar;
    const {normalize,active,presets,ids}=w.mybSeasonalModel;
    const defaults=normalize(null);
    assert.equal(ids.length,20);
    assert.equal(defaults.motion,true);
    assert.equal(vietnamDate(Date.UTC(2026,11,23,17,0)),'2026-12-24');
    assert.equal(vietnamDate(Date.UTC(2026,11,23,16,59)),'2026-12-23');
    assert.equal(holidays(2025).midautumn[1],'2025-10-07');
    assert.equal(holidays(2026).tet[0],'2026-02-10');
    assert.deepEqual([...holidays(2026).nguyentieu],['2026-03-03','2026-03-03']);
    assert.deepEqual([...holidays(2026).hungking],['2026-04-26','2026-04-26']);
    assert.deepEqual([...holidays(2026).doanngo],['2026-06-19','2026-06-19']);
    assert.deepEqual([...holidays(2026).vulan],['2026-08-27','2026-08-27']);
    assert.equal(holidays(2030).tet[1],'2030-02-08');
    for(const [day,id] of [
      ['2026-02-09',null],['2026-02-10','tet'],['2026-02-23','tet'],['2026-02-24',null],
      ['2026-04-30','reunification'],['2026-05-01','reunification'],['2026-06-01','children'],
      ['2026-01-01','newyear'],['2026-03-03','nguyentieu'],
      ['2026-03-08','womensday'],['2026-04-26','hungking'],['2026-06-19','doanngo'],
      ['2026-06-28','family'],['2026-08-27','vulan'],['2026-09-02','nationalday'],
      ['2026-09-05','school'],['2026-09-25','midautumn'],['2026-10-20','womenvn'],['2026-10-31','halloween'],
      ['2026-11-20','teachers'],['2026-11-24','culture'],['2026-12-24','christmas'],['2026-12-26',null]
    ]) assert.equal(active(defaults,day),id,day);
    const configured=normalize({themes:{
      birthday:{from:'2026-12-24',to:'2026-12-24',recurring:true},
      beach:{from:'2026-12-23',to:'2027-01-02',recurring:true},
      christmas:{motion:'invalid'}
    }});
    assert.equal(active(configured,'2027-12-24'),'birthday');
    assert.equal(active(configured,'2027-12-25'),'beach');
    assert.equal(active(configured,'2028-01-02'),'beach');
    assert.equal(active(configured,'2028-01-03'),null);
    assert.equal(configured.themes.christmas.motion,'snow');
    assert.equal(normalize({motion:false}).motion,false);
    assert.equal(normalize({themes:{nationalday:{motion:'bad'}}}).themes.nationalday.motion,'flagWave');
    assert.equal(active(normalize(null),'2027-02-20'),'nguyentieu');
    assert.equal(active(normalize(null),'2027-04-16'),'hungking');
    assert.equal(normalize({themes:{birthday:{from:'2026-02-30',to:'2026-03-10'}}}).themes.birthday.from,'');
    console.log('PASS Vietnamese civil date, lunar windows, all defaults, custom years, invalid dates and overlaps');

    w.mybSeasonalCalendar.vietnamDate=()=> '2026-12-24';
    el('dashboard').innerHTML='<section class="bcHero"></section>';
    modules.slice(2).forEach(file=>w.eval(fs.readFileSync(file,'utf8')));
    const heroScene=()=>el('dashboard').querySelector('.seasonScene');
    assert.equal(doc.documentElement.dataset.season,'christmas');
    assert.equal(heroScene().dataset.motion,'snow');
    w.showPage('seasonSettings');
    await tick();
    assert.equal(el('seasonTheme').options.length,20);
    input('seasonTheme','christmas');
    input('seasonPreviewMotion',true);
    input('seasonPreviewTone','light');
    el('seasonSettings').classList.add('axTransition');
    await tick();
    assert.equal(el('seasonPreview').dataset.seasonTone,'light');
    assert.equal(el('seasonPreview').querySelector('.seasonScene').dataset.motion,'snow');
    assert.equal(el('seasonPreview').querySelectorAll('canvas').length,1);
    assert.equal(heroScene().dataset.motion,'snow');
    input('seasonTheme','birthday');
    input('seasonFrom','2026-12-24');
    save();
    await tick();
    assert.equal(w.localStorage.getItem(storageKey),null);
    assert.match(el('seasonStatus').textContent,/hai ngày/);
    input('seasonTo','2026-12-24');
    input('seasonRecurring',true);
    input('seasonMotionEnabled',true);
    save();
    await tick();
    assert.equal(doc.documentElement.dataset.season,'birthday');
    assert.equal(heroScene().dataset.motion,'confetti');
    assert.equal(writes,1);
    assert.equal(w.localStorage.getItem(storageKey),null);
    assert.match(el('seasonStatus').textContent,/cấu hình chung/);
    w.showPage('home');
    await tick();
    assert.equal(heroScene().dataset.running,'true');

    const live=heroScene(),canvas=live.querySelector('canvas');
    step(200);step(222);
    const drawing=canvas.getContext('2d').trace();
    el('dashboard').innerHTML='<section class="bcHero"></section>';
    w.mybSeasonal.paintHero();
    assert.equal(heroScene(),live);
    assert.equal(heroScene().querySelector('canvas'),canvas);
    assert.equal(canvas.getContext('2d').trace(),drawing);
    doc.body.classList.add('careModalOpen');
    await tick();
    assert.equal(heroScene().dataset.running,'false');
    doc.body.classList.remove('careModalOpen');
    await tick();
    assert.equal(heroScene().dataset.running,'true');
    reduce=true;
    motionChange();
    assert.equal(heroScene().dataset.motion,'still');
    reduce=false;
    motionChange();

    // A draft change is discarded when leaving without saving.
    w.showPage('seasonSettings');
    await tick();
    input('seasonEnabled',false);
    el('seasonCancel').click();
    await tick();
    assert.equal(doc.documentElement.dataset.season,'birthday');
    w.showPage('seasonSettings');
    await tick();
    assert.equal(el('seasonEnabled').checked,true);
    input('seasonEnabled',false);
    save();
    await tick();
    assert.equal(doc.documentElement.dataset.season,undefined);
    assert.equal(heroScene(),null);
    assert.equal(writes,2);
    // Remote application updates the current view while preserving an open form draft.
    input('seasonEnabled',true);
    cloudSettings={...cloudSettings,seasonalAppearance:{enabled:true,motion:false}};
    w.mybSeasonal.acceptShared(cloudSettings);
    assert.equal(doc.documentElement.dataset.season,'christmas');
    save();
    await tick();
    assert.equal(writes,2);
    assert.match(el('seasonStatus').textContent,/vừa đổi/);
    cloud={...cloud,enabled:false};
    w.mybSeasonal.acceptShared(null);
    save();
    await tick();
    assert.match(el('seasonStatus').textContent,/Bật Cloud Sync/);
    cloud={...cloud,enabled:true,syncId:'second'};
    w.localStorage.setItem(storageKey,JSON.stringify({enabled:false}));
    w.showPage('home');
    await tick();
    w.mybSeasonal.acceptShared({});
    assert.equal(doc.documentElement.dataset.season,'christmas');
    w.showPage('seasonSettings');
    await tick();
    assert.equal(el('seasonEnabled').checked,false);
    assert.match(el('seasonStatus').textContent,/bản nháp/);
    console.log('PASS shared settings save, remote application, stale-write protection, disconnected save and explicit legacy import');

    const worker=fs.readFileSync('dist/sw.js','utf8');
    for(const id of ids){
      for(const layer of ['base','piece']){
        const file=id+'-'+layer+'-v2.webp';
        assert.ok(fs.existsSync('dist/src/features/seasonal/art/'+file),file);
        assert.ok(worker.includes('art/'+file),file);
      }
      assert.equal(presets[id].motions.length,2,id);
      for(const mode of ['still',...presets[id].motions.map(([value])=>value)]){
        const scene=w.mybSeasonalIllustration.create(id,mode);
        const ctx=scene.querySelector('canvas').getContext('2d');
        doc.body.appendChild(scene);
        await tick();
        const initial=ctx.trace();
        assert.match(initial,/drawImage/,id+'/'+mode);
        w.mybSeasonalIllustration.setRunning(scene,true);
        for(let now=0;now<=500;now+=20)step(now);
        if(mode==='still')assert.equal(ctx.trace(),initial,id);
        else assert.notEqual(ctx.trace(),initial,id+'/'+mode);
        w.mybSeasonalIllustration.setRunning(scene,false);
        const held=ctx.trace();
        step(1500);
        assert.equal(ctx.trace(),held,id+'/'+mode);
        w.mybSeasonalIllustration.remove(scene);
      }
    }
    assert.ok(!html.includes('id="seasonPreviewName"'));
    assert.ok(doc.querySelector('header #vnClock'));
    assert.ok(doc.querySelector('header #vnClockDate'));
    for(const id of ['streakWidget','globalSearchBtn','themeToggle'])assert.ok(doc.querySelector('.sideHead + .drawerQuick #'+id));
    assert.equal((fs.readFileSync('src/ui/components/dashboard.js','utf8').match(/id="vnClock"/g)||[]).length,0);
    console.log('PASS all 40 artwork animations change their drawing, stop when paused, and precache both layers. Header actions moved to the drawer.');
  }finally{w.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
