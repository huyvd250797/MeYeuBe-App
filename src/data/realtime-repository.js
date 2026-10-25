/* V15.9: signal invalidation only. Every business value is read through an API. */
(function(w){'use strict';
 var scopes=['care','health','diary','appointment','milestone','month','settings','catalogs','members','sensors','activity'];
 async function revisions(){return (await mybDataClient.request('myb_realtime_revision_v1590',{})).data.versions}
 async function read(scope){
  if(scope==='care')return mybCareRepository.fetchBundle();
  if(scope==='health')return mybHealthRepository.fetchBundle();
  if(['diary','appointment','milestone','month'].indexOf(scope)>=0)return mybPlanningRepository.pages(scope);
  if(scope==='settings')return (await mybDataClient.request('myb_settings_get_v1570',{})).data;
  return (await mybDataClient.request('myb_realtime_slice_v1590',{p_scope:scope})).data.payload;
 }
 function apply(db,scope,data){
  if(scope==='care'){db.careEvents=data.careEvents;db.milkInventory=data.milkInventory;}
  else if(scope==='health'){db.hb=mybHealthService.hydrate(data,db.hb&&db.hb.activeId);db.pregnancy=data.pregnancy;mybHealthService.project(db);}
  else if(scope==='settings')db.settings=data.settings;
  else if(['diary','appointment','milestone','month'].indexOf(scope)>=0)db[{diary:'diary',appointment:'appointments',milestone:'_planningMilestones',month:'_planningMonths'}[scope]]=data;
  else Object.keys(data||{}).forEach(function(k){db[k]=data[k]});
 }
 w.mybRealtimeRepository={scopes:scopes,revisions:revisions,read:read,apply:apply};
})(window);
