/* Planning records retain native UUIDs; auto milestones are a derived view plus saved annotations. */
(function(w){'use strict';
 var fields={diary:'diary',appointment:'appointments',milestone:'milestones',month:'_planningMonths'};
 function clean(x){var d=JSON.parse(JSON.stringify(x));Object.keys(d).forEach(function(k){if(k[0]==='_'&&k!=='_dbId'&&k!=='_memberId')delete d[k]});delete d.version;delete d.createdAt;delete d.updatedAt;return d}
 function save(k,d,b){if(k==='appointment'&&(!b||d.person!==b.person)){var rel={con:'Con','bé':'Con',baby:'Con',child:'Con','mẹ':'Mẹ',mother:'Mẹ','ba':'Ba',father:'Ba'}[String(d.person||'').toLowerCase()],member=(load().hb&&load().hb.members||[]).find(function(m){return m.rel===rel});d=Object.assign({},d,{_memberId:member&&member._dbId||null})}return mybPlanningRepository.write({kind:k,op:'save',data:clean(d),expected:b&&b._etag||null})}
 function remove(k,r){return mybPlanningRepository.write({kind:k,op:'delete',data:{id:r.id,_dbId:r._dbId},expected:r._etag})}
 function project(db){if(db._scopeComplete===false)return db;
  db._planningMilestones=db._planningMilestones||db.milestones||[];
  db._planningMonths=db._planningMonths||[];db.monthlyNotes={};db._planningMonths.forEach(function(x){db.monthlyNotes[String(x.monthIndex)]=x.note||''});
  var source=Object.assign({},db,{milestones:[]}),silent=w.__msSilent;w.__msSilent=true;
  try{checkAutoMilestones(source)}finally{w.__msSilent=silent}
  var stored=db._planningMilestones;
  db.milestones=stored.filter(function(x){return !x.auto}).concat(source.milestones.map(function(m){var old=stored.find(function(x){return x.auto&&x.key===m.key});return Object.assign({},old||{},m,{id:old?old.id:'auto:'+m.key,_dbId:old&&old._dbId,_etag:old&&old._etag,_derived:true,createdAt:old&&old.createdAt||m.date+'T00:00:00.000Z',updatedAt:old&&old.updatedAt||m.date+'T00:00:00.000Z',note:old&&old.note||'',photos:old&&old.photos||[]})}));
  return db;
 }
 function hydrate(db,b){db.diary=b.diary;db.appointments=b.appointment;db._planningMilestones=b.milestone;db._planningMonths=b.month;return project(db)}
 w.mybPlanningService={fields:fields,clean:clean,save:save,remove:remove,project:project,hydrate:hydrate,undo:function(id){return mybPlanningRepository.write({op:'undo',operationId:id})}};
})(window);
