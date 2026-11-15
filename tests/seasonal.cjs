const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const modules=['calendar','model','ui'].map(name=>'src/features/seasonal/'+name+'.js');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('src/styles/seasonal.css','utf8');
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

(async()=>{
  try{
    modules.slice(0,2).forEach(file=>w.eval(fs.readFileSync(file,'utf8')));
    const {holidays,vietnamDate}=w.mybSeasonalCalendar;
    const {normalize,active,presets,ids}=w.mybSeasonalModel;
    const defaults=normalize(null);
    assert.equal(ids.length,10);
    assert.equal(defaults.motion,false);
    assert.equal(vietnamDate(Date.UTC(2026,11,23,17,0)),'2026-12-24');
    assert.equal(vietnamDate(Date.UTC(2026,11,23,16,59)),'2026-12-23');
    assert.equal(holidays(2025).midautumn[1],'2025-10-07');
    assert.equal(holidays(2026).tet[0],'2026-02-10');
    assert.equal(holidays(2030).tet[1],'2030-02-08');
    for(const [day,id] of [
      ['2026-02-09',null],['2026-02-10','tet'],['2026-02-23','tet'],['2026-02-24',null],
      ['2026-04-30','reunification'],['2026-05-01','reunification'],['2026-06-01','children'],
      ['2026-09-05','school'],['2026-09-25','midautumn'],['2026-10-31','halloween'],
      ['2026-11-20','teachers'],['2026-12-24','christmas'],['2026-12-26',null]
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
    assert.equal(normalize({themes:{birthday:{from:'2026-02-30',to:'2026-03-10'}}}).themes.birthday.from,'');
    console.log('PASS Vietnamese civil date, lunar windows, all defaults, custom years, invalid dates and overlaps');

    w.mybSeasonalCalendar.vietnamDate=()=> '2026-12-24';
    el('dashboard').innerHTML='<section class="bcHero"></section>';
    w.eval(fs.readFileSync(modules[2],'utf8'));
    const heroScene=()=>el('dashboard').querySelector('.seasonScene');
    assert.equal(doc.documentElement.dataset.season,'christmas');
    assert.equal(heroScene().dataset.motion,'still');
    w.showPage('seasonSettings');
    await tick();
    assert.equal(el('seasonTheme').options.length,10);
    input('seasonTheme','christmas');
    input('seasonPreviewMotion',true);
    input('seasonPreviewTone','light');
    el('seasonSettings').classList.add('axTransition');
    await tick();
    assert.equal(el('seasonPreview').dataset.seasonTone,'light');
    assert.equal(el('seasonPreview').querySelectorAll('.seasonParticle').length,9);
    assert.equal(heroScene().dataset.motion,'still');
    input('seasonTheme','birthday');
    input('seasonFrom','2026-12-24');
    save();
    assert.equal(w.localStorage.getItem(storageKey),null);
    assert.match(el('seasonStatus').textContent,/hai ngày/);
    input('seasonTo','2026-12-24');
    input('seasonRecurring',true);
    input('seasonMotionEnabled',true);
    save();
    assert.equal(doc.documentElement.dataset.season,'birthday');
    assert.equal(heroScene().dataset.motion,'confetti');
    w.showPage('home');
    await tick();
    assert.equal(heroScene().dataset.running,'true');

    const live=heroScene(), timeline={currentTime:1234};
    live.getAnimations=()=>[timeline];
    const snapshot=w.mybSeasonal.capture();
    el('dashboard').innerHTML='<section class="bcHero"></section>';
    timeline.currentTime=0;
    w.mybSeasonal.paintHero(snapshot);
    assert.equal(heroScene(),live);
    assert.equal(timeline.currentTime,1234);
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
    assert.equal(doc.documentElement.dataset.season,undefined);
    assert.equal(heroScene(),null);
    console.log('PASS configuration, isolated preview, save, no forced default motion, pause, phase restore and reduce motion');

    const keyframes=[...css.matchAll(/@keyframes\s+(\w+)\s*\{([\s\S]*?)\n\}/g)];
    assert.equal(keyframes.length,9);
    for(const [,name,body] of keyframes){
      const properties=[...body.matchAll(/(?:\{|;)\s*([\w-]+)\s*:/g)].map(([,property])=>property);
      assert.ok(properties.length>0 && properties.every(property=>['opacity','transform'].includes(property)),name);
      if(!/0%,100%/.test(body)){
        assert.match(body,/0%\s*\{[^}]*opacity:0\}/,name);
        assert.match(body,/100%\s*\{[^}]*opacity:0\}/,name);
      }
    }
    for(const id of ids){
      assert.ok(fs.existsSync('dist/src/features/seasonal/art/'+id+'.webp'),id);
      assert.ok(fs.readFileSync('dist/sw.js','utf8').includes('art/'+id+'.webp'),id);
      const rule=presets[id].motions;
      assert.equal(rule.length,2,id);
      assert.ok(rule.every(([motion])=>css.includes('data-motion="'+motion+'"')),id);
    }
    console.log('PASS all 20 effects, seamless boundaries, transform/opacity animation and 10 offline illustrations');
  }finally{w.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
