/* V15.4: old renderers remain; all care/milk mutations await server ACK. */
(function(w){
 'use strict';
 var editing=null,newId='',busy=false,completing=false;
 function id(){return 'CE-'+crypto.randomUUID()}
 function val(k){var e=byId(k);return e?e.value:''}
 function clone(x){return JSON.parse(JSON.stringify(x))}
 function status(message,error){var box=byId('careWriteStatus');if(!box){box=document.createElement('p');box.id='careWriteStatus';box.setAttribute('role','status');var anchor=byId('cNote');if(anchor)anchor.parentNode.appendChild(box);else document.body.appendChild(box)}box.textContent=message;box.dataset.state=error?'error':'saving'}
 function refresh(){try{render();udRefreshOpenViews();tfRefreshBehind()}catch(e){console.warn(e)}}
 function showUndo(r){udShow('Database đã lưu thay đổi.', '{}');if(w.__udState)w.__udState.careOperation=r.operationId;else __udState.careOperation=r.operationId}
 async function run(action,done){
  if(busy)return false;busy=true;w.__careSaveBusy=true;
  var buttons=Array.from(document.querySelectorAll('#careFormOverlay button,#tfOverlay button,#feedDoneOverlay button,#careFormOverlay input,#careFormOverlay textarea,#careFormOverlay select,#tfOverlay input,#tfOverlay select,#feedDoneOverlay input,.udBtn'));
  var states=buttons.map(function(b){var disabled=b.disabled;b.disabled=true;return disabled});status('Đang lưu…');
  try{var r=await action();status('Đã lưu');refresh();showUndo(r);if(done){completing=true;try{done(r)}finally{completing=false}};showToast('Database đã xác nhận lưu','success');return true}
  catch(e){status(e.message,true);showToast(e.message,'error');return false}
  finally{busy=false;w.__careSaveBusy=false;buttons.forEach(function(b,i){b.disabled=states[i]})}
 }
 var fill=w.fillCareEditForm;
 w.fillCareEditForm=function(i){var row=load().careEvents[Number(i)];editing=row?clone(row):null;newId='';return fill(i)};
 var reset=w.resetCareForm;
 w.resetCareForm=function(){if(busy&&!completing)return;editing=null;newId='';return reset.apply(this,arguments)};
 // Stop all historical event-history based stock reconstruction in the live app.
 w.recalculateMilkInventoryLedger=function(db){return db};w.repairPumpMilkLinks=function(db){return db};w.repairMilkInventoryDuplicatePumpBags=function(db){return db};w.repairPumpContainerLinks=function(db){return db};
 w.activeMilkBags=function(db){return (db.milkInventory||[]).filter(function(b){return Number(b.remaining)>0&&b.status==='Đang bảo quản'&&milkExpireAt(b)>Date.now()}).sort(function(a,b){return milkExpireAt(a)-milkExpireAt(b)})};
 w.saveCareEvent=function(){
  if(busy)return Promise.resolve(false);
  var item=getCareEventFromForm(load());if(!item)return Promise.resolve(false);
  var before=val('careEditIndex')!==''&&!w.__careFormIsCopy?editing:null;
  // Never turn a stale array index into a different record after realtime reorder.
  if(val('careEditIndex')!==''&&!w.__careFormIsCopy&&!before){status('Mở lại form để sửa đúng ghi nhận.',true);return Promise.resolve(false)}
  item.id=before?before.id:(newId||(newId=id()));if(before)item.createdAt=before.createdAt;
  var ctx=w.__careFormReturnContext?clone(w.__careFormReturnContext):null;
  return run(function(){return mybCareService.save(item,before)},function(){resetCareForm();if(w.__careFormModalOpen)closeCareFormModal(false);if(ctx){w.__careFormReturnContext=null;renderCareStatDetail(ctx.type,ctx.date)}else showPage('careTimeline')});
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
 w.mybCareUi={isBusy:function(){return busy},recover:function(){return run(function(){return mybCareRepository.recover()})}};
 // A reload after timeout offers explicit verification, retaining the exact command.
 setTimeout(function(){if(mybCareRepository.pending()){var box=document.createElement('div');box.className='card';var p=document.createElement('p');p.textContent='Có thao tác chăm sóc chưa được xác nhận.';var b=document.createElement('button');b.textContent='Kiểm tra kết quả lưu';b.onclick=async function(){if(await w.mybCareUi.recover())box.remove()};box.append(p,b);(byId('careTimeline')||document.body).prepend(box)}},2300);
})(window);
