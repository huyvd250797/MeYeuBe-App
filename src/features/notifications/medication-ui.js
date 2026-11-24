/* MeYeuBe V17.22.62 — global medication reminders, independent snooze/skip, bottom-nav safe overlays. */
(function(w,d){
 'use strict';
 var core=w.mybMedicationCore;
 if(!core)return;
 var active=null,editor=null,saving=false,checking=false,refreshing=false,lastRemote=0,lastRemoteAttempt=0,lastFullAttempt=0,fullPending=false;
 var KEY='mybMedicationReminderLocal_v1761',snoozes=null,previousScope='';
 function el(id){return d.getElementById(id)}
 function message(t,isError){var p=el('med61Status');if(p){p.textContent=t||'';p.classList.toggle('error',!!isError)}if(isError&&w.showToast)w.showToast(t,'error')}
 function clone(v){return JSON.parse(JSON.stringify(v))}
 function settings(){return core.normalize((w.load&&w.load().settings||{}).medicationReminders)}
 function scope(){var target='';try{target=String(w.mybDataClient.target(w.loadCloudConfig()))}catch(ignore){}var hash=2166136261;for(var i=0;i<target.length;i++){hash^=target.charCodeAt(i);hash=Math.imul(hash,16777619)}return String(hash>>>0)}
 function storageKey(){return KEY+'_'+scope()}
 function local(){var id=storageKey();if(previousScope!==id){previousScope=id;snoozes=null}if(snoozes)return snoozes;try{snoozes=JSON.parse(localStorage.getItem(id)||'{}')}catch(ignore){snoozes={}}if(!snoozes||typeof snoozes!=='object')snoozes={};if(!snoozes.records||typeof snoozes.records!=='object')snoozes.records={};return snoozes}
 function persist(){var s=local(),cutoff=new Date();cutoff.setDate(cutoff.getDate()-7);var keyDay=core.dayKey(cutoff);Object.keys(s.records).forEach(function(k){if(k.slice(0,10)<keyDay)delete s.records[k]});localStorage.setItem(storageKey(),JSON.stringify(s))}
 function record(day,id){var s=local();return s.records[day+'|'+id]||(s.records[day+'|'+id]={})}
 function clock(t){return String(t||'').slice(0,5)}
 function humanDose(r){return String(r.dose).replace('.',',')+' '+r.unit}
 function label(text){return w.esc?esc(text):String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
 function buttonDisabled(flag){['med61Taken','med61NotYet','med61Skip','med61CheckPending'].forEach(function(id){var b=el(id);if(b)b.disabled=flag})}
 function updateList(){
  var cfg=settings(),master=el('med61Enabled'),list=el('med61List');if(!list)return;
  if(master)master.checked=cfg.enabled;
  var rows=cfg.items.slice().sort((a,b)=>a.start.localeCompare(b.start)||a.name.localeCompare(b.name));
  var done=core.completed(cfg,(w.load&&load().careEvents)||[],core.dayKey(new Date()));
  list.innerHTML=rows.length?rows.map(function(r){
   var todayState=local().records[core.dayKey(new Date())+'|'+r.id]||{},finished=done.has(r.id)||!!todayState.done,skipped=!!todayState.skipped;
   return '<div class="med61Rule"><div class="med61RuleInfo"><span class="med61Pill">💊 '+label(r.name)+'</span><strong>'+label(humanDose(r))+'</strong><small>Nhắc '+label(r.start)+(r.end?'–'+label(r.end):' · đến hết ngày')+'</small><small class="med61RuleState">'+(finished?'Đã uống hôm nay':skipped?'Bỏ qua hôm nay':r.active&&cfg.enabled?'Đang nhắc hằng ngày':'Đang tắt')+'</small></div><div class="med61RuleActions"><label><input type="checkbox" data-med61-toggle="'+label(r.id)+'" '+(r.active?'checked':'')+' aria-label="Kích hoạt '+label(r.name)+'"> Kích hoạt</label><button type="button" class="secondary" data-med61-edit="'+label(r.id)+'">Sửa</button><button type="button" class="ghost" data-med61-delete="'+label(r.id)+'">Xóa</button></div></div>';
  }).join(''):'<p class="notice">Chưa có lịch nhắc nào. Chọn “Thêm lịch nhắc” để tạo lịch uống thuốc/Vitamin.</p>';
 }
 async function fresh(){
  if(!w.mybSettingsRepository||!w.mybSettingsBridge)throw Error('Chưa sẵn sàng kết nối cài đặt.');
  var h;try{
   h=await mybSettingsBridge.begin();
   var r=await mybDataClient.request('myb_settings_get_v1570',{});
   if(!r||!r.data||!r.data.expected)throw Error('Chưa đọc được cấu hình nhắc thuốc từ máy chủ.');
   mybSettingsRepository.acceptState(r.data);mybSettingsBridge.accept(r.data,r.target,h);
   lastRemote=Date.now();return r.data;
  }finally{if(h)mybSettingsBridge.end(h)}
 }
 async function writeConfig(mutate){
  if(saving)throw Error('Đang lưu, vui lòng chờ.');saving=true;var oldSettings=clone((w.load&&load().settings)||{}),oldConfig=core.normalize(oldSettings.medicationReminders);
  try{
   if(mybSettingsRepository.pending())throw Error('Còn lần lưu cài đặt chưa xác nhận. Hãy kiểm tra kết quả lần lưu trước.');
   var remote=await fresh(),base=clone(remote.settings||{}),cfg=core.normalize(base.medicationReminders);
   var next=mutate(cfg);
   if(!next||!Array.isArray(next.items))throw Error('Cấu hình không hợp lệ.');
   next.items.forEach(core.validate);
   var all=Object.assign({},base,{medicationReminders:next});
   var r=await mybSettingsRepository.save(all,base,remote.expected);
   if(!r){ // No-op is acceptable only if server already holds the requested config.
    if(JSON.stringify(cfg)!==JSON.stringify(next))throw Error('Chưa xác nhận cấu hình trên server.');
   }
   updateList();message('Đã lưu cấu hình nhắc thuốc/Vitamin.');tick();return true;
  }catch(e){
   // A failed write must not alter the displayed server-confirmed configuration.
   updateList();message(e&&e.message||'Không lưu được cấu hình, hãy thử lại.',true);return false;
  }finally{saving=false}
 }
 function openEditor(id){
  if(saving)return;
  var r=settings().items.find(x=>x.id===id)||null;
  editor=id||null;
  var form=el('med61Form');if(!form)return;
  form.reset();
  el('med61EditorTitle').textContent=r?'Sửa lịch nhắc thuốc/Vitamin':'Thêm lịch nhắc thuốc/Vitamin';
  el('med61Name').value=r?r.name:'';el('med61Dose').value=r?r.dose:'';
  el('med61Unit').value=r?r.unit:'giọt';el('med61Start').value=r?r.start:'08:00';el('med61End').value=r?r.end:'';
  el('med61Active').checked=r?r.active:true;el('med61EditError').textContent='';
  mybUI.overlays.open('med61Editor',{focus:'med61Name',onClose:closeEditor,bodyLock:false});
 }
 function closeEditor(){if(saving)return;mybUI.overlays.close('med61Editor',true);editor=null}
 async function saveEditor(ev){
  if(ev)ev.preventDefault();
  if(saving)return;
  var rule={id:editor||('MR-'+(w.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36))),
   name:el('med61Name').value.trim(),dose:Number(el('med61Dose').value),unit:el('med61Unit').value.trim(),start:el('med61Start').value,end:el('med61End').value,active:el('med61Active').checked};
  try{core.validate(rule)}catch(e){el('med61EditError').textContent=e.message;return}
  el('med61EditError').textContent='';var submit=el('med61Save');if(submit)submit.disabled=true;
  var ok=await writeConfig(function(cfg){var i=cfg.items.findIndex(x=>x.id===rule.id);if(i>=0)cfg.items[i]=rule;else cfg.items.push(rule);return cfg});
  if(submit)submit.disabled=false;
  if(ok)closeEditor();else el('med61EditError').textContent=el('med61Status').textContent;
 }
 async function toggleMaster(value){var box=el('med61Enabled');if(box)box.disabled=true;await writeConfig(function(cfg){cfg.enabled=!!value;return cfg});if(box)box.disabled=false;tick()}
 async function toggleRule(id,value){await writeConfig(function(cfg){var r=cfg.items.find(x=>x.id===id);if(r)r.active=!!value;return cfg});tick()}
 async function deleteRule(id){
  var r=settings().items.find(x=>x.id===id);if(!r)return;
  if(!w.confirm('Xóa lịch nhắc “'+r.name+'”? Nhật ký Uống thuốc trước đây vẫn được giữ lại.'))return;
  await writeConfig(function(cfg){cfg.items=cfg.items.filter(x=>x.id!==id);return cfg});tick();
 }
 function completedToday(cfg,day){var db=(w.load&&load())||{};var ids=core.completed(cfg,db.careEvents||[],day);var state=local().records;
  cfg.items.forEach(function(r){if((state[day+'|'+r.id]||{}).done)ids.add(r.id)});return ids}
 function hidePrompt(){if(!active)return;active=null;mybUI.overlays.close('med61Prompt',true);var status=el('med61PromptStatus');if(status)status.textContent='';}
 function allOverlaysBusy(){return !!((w.mybUI&&mybUI.overlays&&mybUI.overlays.count()>0)||(d.body&&d.body.classList.contains('careModalOpen'))||d.querySelector('.careFormOverlay.show,.milkBagPickerOverlay.show,.milkContainerEditSheet.show,.careDetailOverlay.show,.tfOverlay.show,#milkBagDetailOverlay.show,#feedDoneOverlay.show'))}
 function showPrompt(candidate){
  active={id:candidate.rule.id,day:core.dayKey(new Date())};
  var r=candidate.rule;
  el('med61PromptName').textContent=r.name;el('med61PromptDose').textContent=humanDose(r);
  el('med61PromptTime').textContent=r.start+(r.end?'–'+r.end:'');
  el('med61PromptStatus').textContent='';
  el('med61CheckPending').hidden=!local().records[active.day+'|'+active.id]?.pendingEvent;
  mybUI.overlays.open('med61Prompt',{focus:'med61NotYet',escape:false,bodyLock:false,canClose:function(){return false}});
 }
 function availableRecords(now){return (w.load&&load().careEvents)||[]}
 function maybeRefreshGlobal(force){
  var now=Date.now();
  if(refreshing||saving||!w.mybDataClient||!w.mybSettingsBridge)return;
  if(!force&&lastRemote&&now-lastRemote<5*60*1000)return;
  if(now-lastRemoteAttempt<12000)return;
  lastRemoteAttempt=now;
  refreshIfOpen(true);
 }
 function tick(){
  if(!d.body||d.visibilityState==='hidden')return;
  maybeRefreshGlobal(false);
  var cfg=settings(),now=new Date(),day=core.dayKey(now);
  if(!cfg.enabled){hidePrompt();return}
  if(active){var rule=cfg.items.find(r=>r.id===active.id);var end=rule&&rule.end?core.at(day,rule.end):new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime()-1;
   if(active.day!==day||!rule||!rule.active||completedToday(cfg,day).has(active.id)||now.getTime()>end){hidePrompt()}
   else return;
  }
  if(checking||saving||allOverlaysBusy())return;
  var list=core.due(cfg,availableRecords(now),local(),now).filter(x=>!completedToday(cfg,day).has(x.rule.id));
  if(!list.length)return;
  // The scoped startup may load only dashboard summaries. Never conclude a drug
  // was not taken until full care records have been fetched at least once.
  var db=load();
  if(db._scopeComplete===false&&w.mybScopedRepository&&typeof mybScopedRepository.ensureFull==='function'){
   if(fullPending||Date.now()-lastFullAttempt<30000)return;
   lastFullAttempt=Date.now();fullPending=true;
   Promise.resolve(mybScopedRepository.ensureFull()).then(function(){fullPending=false;tick()}).catch(function(e){fullPending=false;message('Chưa tải được nhật ký để đối chiếu lịch nhắc: '+e.message,true)});
   return;
  }
  showPrompt(list[0]);
 }
 function snooze(){
  if(!active||saving)return;
  var key=active.day+'|'+active.id;record(active.day,active.id).nextAt=Date.now()+core.SNOOZE_MS;
  persist();hidePrompt();tick();
 }
 function skipToday(){
  if(!active||saving)return;
  var id=active.id,day=active.day,rec=record(day,id);
  // Do not discard an unverified write: the server might already have recorded it.
  if(rec.pendingEvent){var status=el('med61PromptStatus');if(status)status.textContent='Lần ghi nhận Đã uống trước chưa xác nhận. Hãy kiểm tra lần lưu trước rồi mới Bỏ qua.';return}
  delete rec.nextAt;rec.skipped=true;persist();hidePrompt();updateList();tick();
 }
 function makeEvent(r,day){
  var dt=new Date(),time=String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
  return {id:'CE-MR-'+day+'-'+r.id,type:'medicine',date:day,startDate:day,endDate:day,timeFrom:time,timeTo:'',amount:r.dose,unit:r.unit,source:'',note:'',extra:{name:r.name,medicationReminderId:r.id,medicationReminderSchedule:r.start}};
 }
 function done(activeSnapshot){
  var rec=record(activeSnapshot.day,activeSnapshot.id);delete rec.nextAt;delete rec.pendingEvent;delete rec.skipped;rec.done=true;
  persist();hidePrompt();updateList();if(w.showToast)showToast('Đã ghi nhận Uống thuốc thành công','success');tick();
 }
 async function taken(){
  if(!active||saving)return;
  var id=active.id,day=active.day, cfg=settings(),r=cfg.items.find(x=>x.id===id);
  if(!r){hidePrompt();return}
  if(completedToday(cfg,day).has(id)){done({id:id,day:day});return}
  saving=true;buttonDisabled(true);var out=el('med61PromptStatus');out.textContent='Đang lưu bản ghi Uống thuốc...';
  var rec=record(day,id);
  if(!rec.pendingEvent){rec.pendingEvent=makeEvent(r,day);persist()}
  try{
   // If an earlier ACK was lost, verify before attempting the exact same write.
   if(mybCareRepository.pending()){
    var verified=await mybCareRepository.verify();
    if(verified&&verified.status!=='not_found'&&verified.operationId){
     var same=(load().careEvents||[]).some(x=>x&&x.id===rec.pendingEvent.id);
     if(same){done({id:id,day:day});return}
     throw Error('Đã xác nhận một thao tác khác. Vui lòng kiểm tra Nhật ký chăm sóc trước khi thử lại.');
    }
   }
   var ack=await mybCareService.save(rec.pendingEvent,null);
   if(!ack||!ack.operationId||!Array.isArray(ack.milkItems))throw Error('Chưa nhận được xác nhận ghi nhận từ server.');
   done({id:id,day:day});
  }catch(e){
   if(e&&e.code==='CONFLICT'){
    try{if(w.mybScopedRepository)await mybScopedRepository.ensureFull();
     var existing=(load().careEvents||[]).find(x=>x&&x.id===rec.pendingEvent.id);
     if(existing){done({id:id,day:day});return}
    }catch(ignore){}
   }
   out.textContent='Chưa lưu được: '+(e&&e.message||'Vui lòng thử lại.');el('med61CheckPending').hidden=!mybCareRepository.pending();
   if(w.showToast)showToast('Không lưu được Uống thuốc. Chưa đánh dấu đã uống.','error');
  }finally{saving=false;buttonDisabled(false);tick()}
 }
 async function verifyPending(){
  if(!active||saving)return;
  var id=active.id,day=active.day,rec=record(day,id);if(!rec.pendingEvent)return;
  saving=true;buttonDisabled(true);
  try{var r=await mybCareRepository.verify();if(r&&r.operationId&&(load().careEvents||[]).some(x=>x.id===rec.pendingEvent.id)){done({id:id,day:day});return}
   el('med61PromptStatus').textContent='Lần lưu trước chưa được xác nhận. Chọn Đã uống để thử lại với cùng bản ghi.';
  }catch(e){el('med61PromptStatus').textContent=e.message||'Không thể kiểm tra lần lưu trước.'}finally{saving=false;buttonDisabled(false);tick()}
 }
 async function refreshIfOpen(silent){
  if(refreshing||saving)return false;refreshing=true;
  try{await fresh();updateList();tick();return true}
  catch(e){
   var page=el('settings');
   if(!silent&&page&&!page.classList.contains('hidden'))message('Không thể cập nhật lịch nhắc từ Cloud: '+e.message,true);
   return false;
  }finally{refreshing=false}
 }
 function attach(){
  var add=el('med61Add'),master=el('med61Enabled'),form=el('med61Form'),dismiss=el('med61Dismiss');
  if(!add||!master||!form)return;
  add.addEventListener('click',()=>openEditor());
  master.addEventListener('change',e=>toggleMaster(e.target.checked));
  form.addEventListener('submit',saveEditor);
  dismiss.addEventListener('click',closeEditor);
  el('med61Editor').addEventListener('click',e=>{if(e.target===e.currentTarget)closeEditor()});
  el('med61NotYet').addEventListener('click',snooze);
  el('med61Skip').addEventListener('click',skipToday);
  el('med61Taken').addEventListener('click',taken);
  el('med61CheckPending').addEventListener('click',verifyPending);
  el('med61List').addEventListener('click',e=>{
   var b=e.target.closest('button');if(!b)return;
   if(b.dataset.med61Edit)openEditor(b.dataset.med61Edit);
   if(b.dataset.med61Delete)deleteRule(b.dataset.med61Delete);
  });
  el('med61List').addEventListener('change',e=>{if(e.target.dataset.med61Toggle)toggleRule(e.target.dataset.med61Toggle,e.target.checked)});
  d.addEventListener('visibilitychange',()=>{if(d.visibilityState==='visible'){tick();maybeRefreshGlobal(false)}});
  w.addEventListener('focus',()=>{tick();maybeRefreshGlobal(false)});
  w.addEventListener('pageshow',()=>{tick();maybeRefreshGlobal(false)});
  var oldPage=w.showPage;
  w.showPage=function(id){var x=oldPage.apply(this,arguments);Promise.resolve(x).then(function(){tick();if(id==='settings')refreshIfOpen(false);else maybeRefreshGlobal(false)});return x};
  updateList();
  w.setInterval(tick,15000);
  // Global startup: settings are fetched regardless of the page the user opened.
  w.setTimeout(function(){tick();maybeRefreshGlobal(true)},350);
  w.setTimeout(function(){tick();maybeRefreshGlobal(true)},2800);
 }
 w.mybMedicationReminders={tick:tick,open:openEditor,close:closeEditor,refresh:refreshIfOpen,settings:settings,core:core,skipToday:skipToday};
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
})(window,document);
