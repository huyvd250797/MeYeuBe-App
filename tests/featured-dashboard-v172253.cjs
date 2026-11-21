'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/ui/components/dashboard.js','utf8');
const begin=source.indexOf('  blocks.todayCare=function(){'),end=source.indexOf('  blocks.alerts=function(){',begin);
assert(begin>=0&&end>begin,'care section available');
const snippet=source.slice(begin,end);
let day='2026-11-21';
const metricIds=['feed','sleep','diaper','pee','poop','pump','storedMilk','medicine','temperature','spitup','urgentMilk','schedule'];
const data={settings:{},careEvents:[{type:'feed',startDate:'2026-11-21',amount:100,wasteMl:25},{type:'feed',date:'2026-11-21',amount:285,wasteMl:10},{type:'feed',date:'2026-11-20',amount:150,wasteMl:50},{type:'pump',date:'2026-11-21',amount:380}]};
let featured='feed',hidden=null;
const ctx={blocks:{},w:{mybDashboardDay:{date:()=>day}},db:data,cfg:{},milkBags:[{remaining:420}],urgent:0,
  today:()=> '2026-11-21',addDaysISO:()=> '2026-11-22',
  careSummaryForDate:(_db,date)=>({feedMl:date==='2026-11-21'?385:150,feedCount:date==='2026-11-21'?2:1,pumpMl:380,diaper:3,pee:3,poop:1,sleepMin:0,medicine:0,temperatureCount:0,latestTemperature:null,spitup:0}),
  milkIsAvailable:()=>true,fmtMinutes:()=> '0 phút',smartNum:(n,d=1)=>Number(n).toFixed(d).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1'),
  dashboardGoalStatus:(_cfg,id)=>id==='feed'?{label:'385 / 700 ml',ratio:385/700,done:false}:null,
  esc:v=>String(v??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),fmtDate:v=>v,weekdayName:()=> 'Thứ Bảy',
  defaultCareMetrics:()=>metricIds.map(id=>({id,visible:true})),isFinite,Number,Math};
vm.createContext(ctx);vm.runInContext(snippet,ctx);
function render(){ctx.cfg.featuredCareMetric=featured;ctx.cfg.careMetrics=metricIds.map(id=>({id,visible:id!==hidden}));return ctx.blocks.todayCare()}
const count=(html,regex)=>(html.match(regex)||[]).length;
let h=render();assert.equal(count(h,/class="bcFeaturedMetric /g),1);assert.equal(count(h,/class="bcTodayGrid"/g),1);assert.equal(count(h,/class="bcMetric /g),11);assert(h.includes('385')&&h.includes('Đã bỏ<strong>35 ml'));assert(!h.includes('Đã bỏ<strong>85 ml'));assert(h.indexOf('bcFeaturedMetric')<h.indexOf('bcTodayGrid'));
console.log('PASS Featured feed and date-specific waste, plus 11 original cards');
featured='diaper';h=render();assert(h.includes('bcFeatured-diaper'));assert.equal(count(h,/class="bcMetric /g),11);assert(!h.includes('Đã bỏ<strong>'));assert(h.includes('class="bcMetric feed'));console.log('PASS Other featured metric, remaining feed stays standard');
featured=null;h=render();assert.equal(count(h,/class="bcFeaturedMetric /g),0);assert.equal(count(h,/class="bcMetric /g),12);console.log('PASS No selected highlight restores 12 standard cards');
featured='feed';hidden='feed';h=render();assert.equal(count(h,/class="bcFeaturedMetric /g),0);assert.equal(count(h,/class="bcMetric /g),11);console.log('PASS Hidden featured metric is not duplicated');
hidden=null;day='2026-11-20';h=render();assert(h.includes('Đã bỏ<strong>50 ml')&&!h.includes('Đã bỏ<strong>35 ml'));console.log('PASS Changing selected day recalculates waste');
const css=fs.readFileSync('src/styles/dashboard-featured-v53.css','utf8');assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));assert(css.includes('grid-column:auto!important'));
console.log('PASS 3-column fixed tracks with non-stretched incomplete rows');
const app=fs.readFileSync('app.js','utf8');const a=app.indexOf('function toggleFeaturedCareMetric('),b=app.indexOf('function readDashboardConfigFromForm(',a);assert(a>=0&&b>a);
let rows=[];const checkbox=()=>({checked:false});for(let id of ['feed','sleep','diaper']){const visible=checkbox(),promote=checkbox();visible.checked=true;const row={getAttribute:()=>id,querySelector:q=>q==='.cfgMetricVisible'?visible:promote};visible.closest=()=>row;promote.closest=()=>row;rows.push({visible,promote,row})}
const doc={querySelectorAll:q=>q==='#cfgCareMetricsList .cfgMetricFeatured'?rows.map(r=>r.promote):[]};const cfgCtx={document:doc};vm.createContext(cfgCtx);vm.runInContext(app.slice(a,b),cfgCtx);
rows[0].promote.checked=true;cfgCtx.toggleFeaturedCareMetric(rows[0].promote);
rows[1].promote.checked=true;cfgCtx.toggleFeaturedCareMetric(rows[1].promote);assert(!rows[0].promote.checked&&rows[1].promote.checked);rows[1].visible.checked=false;cfgCtx.onCareMetricVisibilityChange(rows[1].visible);assert(!rows[1].promote.checked);
console.log('PASS Exclusive featured checkbox and hidden-selection clear');
