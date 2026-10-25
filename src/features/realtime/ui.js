/* No global render(): do not refill forms or navigate on a remote change. */
(function(w){'use strict';
 async function refresh(scopes){
  var db=load(),s=new Set(scopes),scroll=Array.from(document.querySelectorAll('[id]')).filter(function(e){return e.scrollTop||e.scrollLeft}).map(function(e){return {id:e.id,top:e.scrollTop,left:e.scrollLeft}}),y=w.scrollY,x=w.scrollX;
  function call(name){if(typeof w[name]==='function')w[name](db)}
  if(scopes.some(function(k){return ['care','health','settings','catalogs','appointment','milestone','month'].indexOf(k)>=0}))call('renderDashboard');
  if(s.has('care'))['renderCareTimeline','renderCareStats','renderMilkInventory'].forEach(call);
  if(s.has('health')){['renderPregnancyStats','renderPregnancyChart','renderGrowthChart'].forEach(call);if(typeof w.hb2Render==='function')w.hb2Render();}
  if(s.has('appointment')||s.has('catalogs'))['renderAppointmentList','renderAppointmentCalendar'].forEach(call);
  if(s.has('catalogs'))['renderAppointmentTypes','renderMilkContainers'].forEach(call);
  if(['care','health','settings','milestone','month'].some(function(k){return s.has(k)}))['renderMilestoneTimeline','renderMonthlyJourney','renderStatsCompare','renderYearSummary'].forEach(call);
  if(s.has('settings')){call('renderBottomNav');var page=document.querySelector('.page:not(.hidden)');if(page&&['settings','dashboardConfig'].indexOf(page.id)>=0){var note=byId('realtimeSettingsNote');if(!note){note=document.createElement('p');note.id='realtimeSettingsNote';note.className='notice';note.setAttribute('role','status');page.prepend(note)}note.textContent='Cài đặt vừa thay đổi trên thiết bị khác. Bấm Tải lại cài đặt để xem bản mới trước khi sửa.';}/* settings editor keeps its captured OCC baseline until reopened/reloaded */}
  if(w.mybPlanningUi&&mybPlanningUi.refreshRealtime)await mybPlanningUi.refreshRealtime(scopes);
  scroll.forEach(function(p){var e=document.getElementById(p.id);if(e){e.scrollTop=p.top;e.scrollLeft=p.left}});w.scrollTo(x,y);
 }
 w.mybRealtimeUi={refresh:refresh};
})(window);
