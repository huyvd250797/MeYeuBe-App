/* V15.4: old renderers remain; all care/milk mutations await server ACK. */
(function(w){
 'use strict';
 var editing=null,newId='',busy=false,completing=false;
 function id(){return 'CE-'+crypto.randomUUID()}
 function val(k){var e=byId(k);return e?e.value:''}
 function clone(x){return JSON.parse(JSON.stringify(x))}
 function status(message,error,state){return mybUI.status('careWriteStatus',function(){var anchor=byId('cNote');return anchor?anchor.parentNode:document.body},message,error?'error':state||'saving')}

 async function refresh(){try{if(w.mybUI&&mybUI.updates)await mybUI.updates.refresh(['care']);else render();udRefreshOpenViews();tfRefreshBehind()}catch(e){console.warn(e)}}
 function showUndo(r){udShow('Lưu thành công', '{}');if(w.__udState)w.__udState.careOperation=r.operationId;else __udState.careOperation=r.operationId}
 var task=mybUI.action({
  controls:'#careFormOverlay button,#tfOverlay button,#feedDoneOverlay button,#careFormOverlay input,#careFormOverlay textarea,#careFormOverlay select,#tfOverlay input,#tfOverlay select,#feedDoneOverlay input,.udBtn',
  busy:function(on){busy=on;w.__careSaveBusy=on;if(w.mybCareWorkflow)mybCareWorkflow.syncPending()},status:function(text,state){status(text,state==='error',state)},
  success:async function(r,done){status('Lưu thành công',false,'saved');await refresh();showUndo(r);completing=true;try{if(done)await done(r)}finally{completing=false}showToast('Lưu thành công','success')},
  error:function(e){status('Lưu thất bại',true);showToast('Lưu thất bại','error');if(w.mybCareWorkflow)mybCareWorkflow.failed(e)}
 });
 function run(action,done){return task.run(action,done)}

 // Dashboard shortcut uses the same ACK, pending-operation and Undo pipeline as the form.
 function quickDiaper(kind,day){
  if((kind!=='wet'&&kind!=='dirty')||busy||mybCareRepository.isBusy())return Promise.resolve(false);
  if(!w.mybStartupGate||!mybStartupGate.ready||w.__careFormModalOpen||mybUI.overlays.count())return Promise.resolve(false);
  if(day!==today()||!w.mybDashboardDay||mybDashboardDay.date()!==day){showToast('Về Hôm nay để ghi nhanh tã.','warn');return Promise.resolve(false)}
  if(mybCareRepository.pending()){if(w.mybCareWorkflow)mybCareWorkflow.syncPending();showToast('Kiểm tra kết quả lưu trước khi ghi thêm tã.','warn');return Promise.resolve(false)}
  var ev={id:id(),type:'diaper',date:day,startDate:day,endDate:day,timeFrom:nowHM(),timeTo:'',amount:1,unit:'tã',note:'',extra:{diaperType:kind,pee:1,poop:kind==='dirty'?1:0}};
  return run(function(){return mybCareService.save(ev,null)});
 }

 var fill=w.fillCareEditForm;
 w.fillCareEditForm=function(i){var row=load().careEvents[Number(i)];editing=row?clone(row):null;newId='';return fill(i)};
 var reset=w.resetCareForm;
 w.resetCareForm=function(){if(busy&&!completing)return;editing=null;newId='';return reset.apply(this,arguments)};
 // Stop all historical event-history based stock reconstruction in the live app.
 w.recalculateMilkInventoryLedger=function(db){return db};w.repairPumpMilkLinks=function(db){return db};w.repairMilkInventoryDuplicatePumpBags=function(db){return db};w.repairPumpContainerLinks=function(db){return db};
 w.activeMilkBags=function(db){return (db.milkInventory||[]).filter(function(b){return milkIsAvailable(b)}).sort(function(a,b){return milkExpireAt(a)-milkExpireAt(b)})};
 w.saveCareEvent=function(){
  if(busy)return Promise.resolve(false);
  if(w.mybCareWorkflow&&!mybCareWorkflow.beforeSave())return Promise.resolve(false);
  var item=getCareEventFromForm(load());if(!item)return Promise.resolve(false);
  var before=val('careEditIndex')!==''&&!w.__careFormIsCopy?editing:null;
  // Never turn a stale array index into a different record after realtime reorder.
  if(val('careEditIndex')!==''&&!w.__careFormIsCopy&&!before){status('Mở lại form để sửa đúng ghi nhận.',true);return Promise.resolve(false)}
  item.id=before?before.id:(newId||(newId=id()));if(before)item.createdAt=before.createdAt;
  if(w.mybCareWorkflow)mybCareWorkflow.submitting();
  var ctx=w.__careFormReturnContext?clone(w.__careFormReturnContext):null;
  return run(function(){return mybCareService.save(item,before)},function(r){var nav=w.mybCareWorkflow?mybCareWorkflow.committed(r):null;if(w.mybCareWorkflow)mybCareWorkflow.finishForm(function(){resetCareForm();if(w.__careFormModalOpen)closeCareFormModal(false)});else{resetCareForm();if(w.__careFormModalOpen)closeCareFormModal(false)}if(nav&&mybCareWorkflow.restoreOrigin(nav))return;if(ctx){w.__careFormReturnContext=null;renderCareStatDetail(ctx.type,ctx.date)}else showPage('careTimeline')});
 };
 w.deleteCareEvent=function(i){var row=load().careEvents[Number(i)];if(!row||!confirm('Xóa ghi nhận chăm sóc này?'))return Promise.resolve(false);row=clone(row);return run(function(){return mybCareService.remove(row)})};
 w.tfConfirm=function(){if(busy)return Promise.resolve(false);var st=tfState(),src=(load().milkInventory||[]).find(function(b){return b.id===st.bagId}),e=tfComputeExpire();if(!src)return Promise.resolve(false);
  var ev={id:st.operationEventId||(st.operationEventId=id()),type:'transfer',date:val('tfDate')||today(),timeFrom:val('tfTime')||nowHM(),amount:Number(val('tfAmount')),unit:'ml',extra:{fromBagId:src.id,toContainerId:st.targetId,storage:e.storage,expireDate:e.expire,expireManual:!!e.manual,thawed:!!e.thaw}};
  return run(function(){return mybCareService.save(ev,null)},function(){tfClose()});
 };
 var tfOpen=w.tfOpen;w.tfOpen=function(i){tfState().operationEventId='';return tfOpen(i)};
 w.cancelMilkBag=function(i){var b=load().milkInventory[Number(i)];if(!b)return Promise.resolve(false);var reason=prompt('Nhập lý do huỷ túi sữa:');if(!reason||!reason.trim())return Promise.resolve(false);
  var ev={id:id(),type:'discard',date:today(),timeFrom:nowHM(),amount:Number(b.remaining),unit:'ml',note:reason.trim(),extra:{fromBagId:b.id,expectedUpdatedAt:b.updatedAt}};
  return run(function(){return mybCareService.save(ev,null)});
 };
 var meta=w.careTypeMeta;w.careTypeMeta=function(t){return t==='discard'?{icon:'🗑️',label:'Hủy sữa'}:meta(t)};
 var text=w.careEventText;w.careEventText=function(x){return x.type==='discard'?'Đã hủy '+x.amount+'ml':text(x)};
 var oldUndo=w.udUndo;w.udUndo=function(){if(__udState&&__udState.careOperation){var op=__udState.careOperation;return run(function(){return mybCareService.undo(op)},function(){udClear()})}return oldUndo()};
 w.saveFeedDonePopup=function(){if(busy)return Promise.resolve(false);var t=activeFeedTimer();if(!t)return Promise.resolve(false);var start=new Date(t.startedAt),sd=localDateISO(start),time=String(start.getHours()).padStart(2,'0')+':'+String(start.getMinutes()).padStart(2,'0');
  if(!(minutesBetweenDateTimes(sd,time,val('feedDoneEndDate'),val('feedDoneEndTime'))>=0))return Promise.resolve(false);
  var ev={id:t.operationEventId||(t.operationEventId=id()),type:'feed',source:'direct',date:sd,startDate:sd,timeFrom:time,endDate:val('feedDoneEndDate'),timeTo:val('feedDoneEndTime'),amount:0,unit:'ml',extra:{}};saveCareTimer(t);
  return run(function(){return mybCareService.save(ev,null)},function(){saveCareTimer(null);closeFeedDonePopup()});
 };
 ['closeCareFormModal','tfClose','closeFeedDonePopup','openCareFormModal'].forEach(function(name){var base=w[name];w[name]=function(){if(busy&&!completing)return;return base.apply(this,arguments)}});
 ['editCareEvent','copyCareEvent'].forEach(function(name){var base=w[name];w[name]=function(i){var row=load().careEvents[Number(i)];if(row&&row.type==='discard'){showToast('Hãy xóa thao tác hủy để trả lại sữa.','warn');return}return base.apply(this,arguments)}});
 w.mybCareUi={quickDiaper:quickDiaper,session:function(){return {before:editing?clone(editing):null,newId:newId}},restoreSession:function(s){if(busy)return false;editing=s.before?clone(s.before):null;newId=s.newId||'';return true},editing:function(){return editing?clone(editing):null},isBusy:function(){return busy},recover:function(){return w.mybCareWorkflow?mybCareWorkflow.verifyPending():run(function(){return mybCareRepository.recover()})}};
 // A reload after timeout offers explicit verification, retaining the exact command.
 setTimeout(function(){if(w.mybCareWorkflow){mybCareWorkflow.syncPending();return}if(mybCareRepository.pending()){var box=document.createElement('div');box.className='card';var p=document.createElement('p');p.textContent='Có thao tác chăm sóc chưa được xác nhận.';var b=document.createElement('button');b.textContent='Kiểm tra kết quả lưu';b.onclick=async function(){if(await w.mybCareUi.recover())box.remove()};box.append(p,b);(byId('careTimeline')||document.body).prepend(box)}},2300);
})(window);
