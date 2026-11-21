
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/ui/components/dashboard.js','utf8');
const start=source.indexOf('  blocks.todayCare=function(){'),end=source.indexOf('  blocks.alerts=function(){',start);
assert(start>=0&&end>start);
const ctx={blocks:{},w:{mybDashboardDay:{date:()=> '2026-11-21'}},db:{careEvents:[{type:'feed',date:'2026-11-21',amount:415,wasteMl:95}]},cfg:{featuredCareMetric:'feed',careMetrics:['feed','sleep','diaper','pee','poop'].map(id=>({id,visible:true}))},milkBags:[],urgent:0,
today:()=> '2026-11-21',addDaysISO:()=> '2026-11-22',careSummaryForDate:()=>({feedMl:415,feedCount:4,sleepMin:0,diaper:3,pee:3,poop:1,pumpMl:0,medicine:0,temperatureCount:0,latestTemperature:null,spitup:0}),
fmtMinutes:()=> '0 phút',smartNum:n=>String(n),dashboardGoalStatus:(_cfg,id)=>id==='feed'?{label:'415 / 700 ml',ratio:415/700,done:false}:null,esc:x=>String(x??''),fmtDate:x=>x,weekdayName:()=> 'Thứ Bảy',
defaultCareMetrics:()=>[],isFinite,Number,Math};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
let h=ctx.blocks.todayCare();assert(h.includes('bcFeatured-feed'));assert(h.includes('bcFeaturedDiscardIcon'));assert(h.includes('Đã bỏ<strong>95 ml'));assert(!h.includes('<small>Nổi bật</small>'));assert(!h.includes('bcFeaturedDrop'));assert(h.includes('bcFeaturedFooter'));assert.equal((h.match(/class="bcMetric /g)||[]).length,4);
ctx.cfg.featuredCareMetric='sleep';h=ctx.blocks.todayCare();assert(h.includes('bcFeatured-sleep'));assert(!h.includes('bcFeaturedWaste'));
const css=fs.readFileSync('src/styles/dashboard-featured-v53.css','utf8');assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));assert(css.includes('grid-column:auto!important'));assert(!css.includes('min-height:168px'));assert(!css.includes('position:absolute;right:14px;top:15px'));
console.log('PASS V17.22.55 compact featured metric, milk discard icon, no feature label, fixed grid');
