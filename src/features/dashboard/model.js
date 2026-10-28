/* V17.8 feature owner: dashboard/model. Original globals remain compatibility adapters.
   No initialization side effects; dependencies resolved when invoked. */
function defaultCareMetrics(){return CARE_METRIC_DEFS.map(function(x){return {id:x.id,visible:true}})}

function dashboardGoalStatus(cfg,key,currentMap){
  var goals=(cfg&&cfg.careGoals)||{},g=goals[key],def=careGoalDef(key);
  if(!g||!g.enabled||!def||!Number(g.target))return null;
  var mode=g.mode||def.defaultMode,target=Number(g.target||0),cur=0,unit=goalUnitFor(def,mode);
  if(key==='feed')cur=mode==='count'?currentMap.feedCount:currentMap.feedMl;
  else if(key==='sleep')cur=(currentMap.sleepMin||0)/60;
  else if(key==='diaper')cur=currentMap.diaper;
  else if(key==='pee')cur=currentMap.pee;
  else if(key==='poop')cur=currentMap.poop;
  else if(key==='pump')cur=currentMap.pumpMl;
  else if(key==='storedMilk')cur=currentMap.storedMl;
  else if(key==='urgentMilk')cur=currentMap.urgent;
  else if(key==='medicine')cur=currentMap.medicine;
  else if(key==='temperature')cur=currentMap.temperatureCount;
  else if(key==='schedule')cur=currentMap.scheduleTodayTomorrow;
  var ratio=target>0?Math.min(1,cur/target):0;
  return {current:cur,target:target,unit:unit,ratio:ratio,done:cur>=target,label:smartNum(cur, key==='sleep'?2:1)+' / '+smartNum(target, key==='sleep'?2:1)+(unit?(' '+unit):'')};
}

function getDashboardConfig(db){
  db=db||load();db.settings=db.settings||{};
  var cfg=db.settings.dashboardConfig||{};
  var modules=Array.isArray(cfg.modules)?cfg.modules.slice():DEFAULT_DASH_ORDER.map(function(id){return {id:id,visible:true}});
  var known={};DASHBOARD_MODULE_DEFS.forEach(function(d){known[d.id]=d});
  modules=modules.filter(function(m){return m&&known[m.id]}).map(function(m){return {id:m.id,visible:m.visible!==false||known[m.id].required}});
  DEFAULT_DASH_ORDER.forEach(function(id){if(!modules.some(function(m){return m.id===id}))modules.push({id:id,visible:true})});
  DASHBOARD_REQUIRED.forEach(function(id){var m=modules.find(function(x){return x.id===id});if(m)m.visible=true;else modules.unshift({id:id,visible:true})});
  return {
    fontScale:cfg.fontScale||'compact',
    babyDescription:cfg.babyDescription||db.settings.babyDescription||'Con gái của bố Huy & mẹ Sao 💗',
    nextFeedHours:(Number(cfg.nextFeedHours)>0?Number(cfg.nextFeedHours):2.5),
    apptLookaheadDays:(Number(cfg.apptLookaheadDays)>=0?Number(cfg.apptLookaheadDays):7),
    timelineRows:(Number(cfg.timelineRows)>=3&&Number(cfg.timelineRows)<=10?Math.round(Number(cfg.timelineRows)):5),
    modules:modules,
    bottomNav:(Array.isArray(cfg.bottomNav)&&cfg.bottomNav.length?cfg.bottomNav.slice(0,4):['careTimeline','careAdd','scheduleCalendar','more']).map(migrateBottomNavId),
    moduleTitles:(cfg.moduleTitles&&typeof cfg.moduleTitles==='object')?Object.assign({},cfg.moduleTitles):{},
    careMetrics:normalizeCareMetrics(cfg.careMetrics),
    careGoals:Object.assign(defaultCareGoals(), (cfg.careGoals&&typeof cfg.careGoals==='object')?cfg.careGoals:{}),
    smartAlerts:normalizeSmartAlertConfig(cfg.smartAlerts)
  };
}
