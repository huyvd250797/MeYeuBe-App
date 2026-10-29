/* Explicit dependencies for background rendering; never calls global render(). */
(function(w){'use strict';
 var groups={care:['renderCareTimeline','renderCareStats','renderMilkInventory'],health:['renderPregnancyStats','renderPregnancyChart','renderGrowthChart','hb2Render'],appointment:['renderAppointmentList','renderAppointmentCalendar'],catalogs:['renderAppointmentList','renderAppointmentCalendar','renderAppointmentTypes','renderMilkContainers'],settings:['renderBottomNav']};
 async function refresh(scopes){var db=load(),set=new Set(scopes),names=new Set(),scroll=Array.from(document.querySelectorAll('[id]')).filter(function(e){return e.scrollTop||e.scrollLeft}).map(function(e){return {id:e.id,top:e.scrollTop,left:e.scrollLeft}}),x=w.scrollX,y=w.scrollY;
  if(scopes.some(function(k){return ['care','health','settings','catalogs','appointment','milestone','month'].indexOf(k)>=0}))names.add('renderDashboard');
  scopes.forEach(function(k){(groups[k]||[]).forEach(function(name){names.add(name)})});
  if(['care','health','settings','milestone','month'].some(function(k){return set.has(k)}))['renderMilestoneTimeline','renderMonthlyJourney','renderStatsCompare','renderYearSummary'].forEach(function(name){names.add(name)});
  try{names.forEach(function(name){if(typeof w[name]==='function'){if(w.mybVisibleRendering&&mybVisibleRendering.run)mybVisibleRendering.run(name,db);else w[name](db)}});if(w.mybPlanningUi&&mybPlanningUi.refreshRealtime)await mybPlanningUi.refreshRealtime(scopes)}
  finally{scroll.forEach(function(p){var e=document.getElementById(p.id);if(e){e.scrollTop=p.top;e.scrollLeft=p.left}});w.scrollTo(x,y)}
 }
 mybUI.updates={refresh:refresh};
})(window);
