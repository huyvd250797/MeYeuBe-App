/* V17.22.62 — Medication & Vitamin Reminder: independent due/snooze/skip rules. */
(function(root,factory){
 'use strict';
 var api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.mybMedicationCore=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 var TEN_MINUTES=10*60*1000;
 function clock(value){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||''))}
 function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
 function minutes(t){var a=String(t).split(':');return Number(a[0])*60+Number(a[1])}
 function at(day,t){var a=day.split('-').map(Number);return new Date(a[0],a[1]-1,a[2],Math.floor(minutes(t)/60),minutes(t)%60,0,0).getTime()}
 function normalize(source){source=source&&typeof source==='object'?source:{};var raw=Array.isArray(source.items)?source.items:[];return {enabled:source.enabled===true,items:raw.filter(x=>x&&typeof x==='object').map(x=>({id:String(x.id||''),name:String(x.name||'').trim(),dose:Number(x.dose||0),unit:String(x.unit||'').trim(),start:String(x.start||''),end:String(x.end||''),active:x.active!==false}))};}
 function validate(item){
  if(!item.name||item.name.length>120)throw Error('Vui lòng nhập tên thuốc/Vitamin (tối đa 120 ký tự).');
  if(!Number.isFinite(item.dose)||item.dose<=0||item.dose>100000)throw Error('Liều lượng phải là số lớn hơn 0.');
  if(!item.unit||item.unit.length>30)throw Error('Vui lòng nhập đơn vị (giọt, ml, viên, gói...).');
  if(!clock(item.start))throw Error('Vui lòng chọn giờ nhắc bắt đầu hợp lệ.');
  if(item.end&&!clock(item.end))throw Error('Giờ kết thúc không hợp lệ.');
  if(item.end&&minutes(item.end)<minutes(item.start))throw Error('Giờ kết thúc phải bằng hoặc sau giờ bắt đầu trong cùng ngày.');
  return item;
 }
 function normalizedText(s){return String(s||'').trim().normalize('NFC').toLocaleLowerCase('vi-VN')}
 function matching(ev,rule,day){
  if(!ev||ev.type!=='medicine'||(ev.startDate||ev.date)!==day)return false;
  if(normalizedText(ev.extra&&ev.extra.name)!==normalizedText(rule.name))return false;
  if(normalizedText(ev.unit)!==normalizedText(rule.unit))return false;
  if(Math.abs(Number(ev.amount)-Number(rule.dose))>0.00001)return false;
  if(!clock(ev.timeFrom))return false;
  return minutes(ev.timeFrom)>=minutes(rule.start)&&(!rule.end||minutes(ev.timeFrom)<=minutes(rule.end));
 }
 // One record can complete at most one independent schedule. Prefer nearest earlier
 // start time; separate schedule IDs from the server always take precedence.
 function completed(config,events,day){
  var rules=normalize(config).items,done=new Set(),used=new Set(),items=(events||[]).filter(ev=>ev&&ev.type==='medicine'&&(ev.startDate||ev.date)===day);
  items.forEach(function(ev,i){var id=ev.extra&&(ev.extra.medicationReminderId||ev.extra.reminderId);if(id&&rules.some(r=>r.id===id)){done.add(String(id));used.add(i)}});
  items.forEach(function(ev,i){
   if(used.has(i))return;
   var marked=ev.extra&&(ev.extra.medicationReminderId||ev.extra.reminderId);
   if(marked)return; // Never let another schedule claim a tagged event.
   var candidates=rules.filter(r=>!done.has(r.id)&&matching(ev,r,day));
   candidates.sort((a,b)=>minutes(b.start)-minutes(a.start)||a.id.localeCompare(b.id));
   if(candidates.length){done.add(candidates[0].id);used.add(i)}
  });
  return done;
 }
 function due(config,events,state,now){
  now=now||new Date();var today=dayKey(now),ms=now.getTime(),cfg=normalize(config);
  if(!cfg.enabled)return [];
  var done=completed(cfg,events,today),loc=state&&state.records||{};
  return cfg.items.filter(r=>r.active&&r.id&&clock(r.start)&&(!r.end||clock(r.end))&&!done.has(r.id)).map(function(r){
   var key=today+'|'+r.id,rec=loc[key]||{},start=at(today,r.start),end=r.end?at(today,r.end):new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime()-1;
   return {rule:r,key:key,dueAt:Math.max(start,Number(rec.nextAt)||0),endAt:end,complete:!!rec.done};
  }).filter(x=>!x.complete&&!((loc[x.key]||{}).skipped===true)&&ms>=x.dueAt&&ms<=x.endAt).sort((a,b)=>a.dueAt-b.dueAt||minutes(a.rule.start)-minutes(b.rule.start)||a.rule.id.localeCompare(b.rule.id));
 }
 return {normalize:normalize,validate:validate,clock:clock,dayKey:dayKey,minutes:minutes,at:at,matching:matching,completed:completed,due:due,SNOOZE_MS:TEN_MINUTES};
});
