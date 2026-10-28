/* V17.8 feature owner: care/form-controller. Original globals remain compatibility adapters.
   No initialization side effects; dependencies resolved when invoked. */
function careBaseDateTime(){var date=(byId('cDate')&&byId('cDate').value)||today();var time=(byId('cTimeFrom')&&byId('cTimeFrom').value)||'00:00';return new Date(date+'T'+time+':00')}

function careStartDateValue(){return (byId('cDate')&&byId('cDate').value)||today()}

function careEndDateValue(){return (byId('cEndDate')&&byId('cEndDate').value)||careStartDateValue()}

function diaperSetAmount(v){
  v=Math.min(DIAPER_MAX,Math.max(1,Math.round(Number(v)||1)));
  setValSafe('cAmount',v);
  var disp=byId('diaperQtyDisplay');if(disp)disp.textContent=v;
  var m=byId('diaperMinus');if(m)m.disabled=(v<=1);
  var p=byId('diaperPlus');if(p)p.disabled=(v>=DIAPER_MAX);
}

function diaperStepAmount(delta){
  var cur=Number((byId('cAmount')&&byId('cAmount').value)||1)||1;
  diaperSetAmount(cur+(Number(delta)||0));
}

function tfState(){
  window.__tfState=window.__tfState||{bagId:'',kind:'binh',targetId:'',open:false};
  return window.__tfState;
}

function tfExpireFrom(storage,date,time){
  var ms=dateTimeMs(date,time);
  var base=new Date(ms===null?Date.now():ms);
  if(storage==='Ngăn đông')return addMonthsISODateTime(base,6);
  if(storage==='Tủ đông sâu')return addMonthsISODateTime(base,12);
  return localDateTimeValue(new Date(base.getTime()+milkStorageHours(storage)*3600000));
}

function tfOriginOf(b){
  if(!b)return {date:today(),time:'00:00'};
  return {date:b.originDate||b.date||today(),time:b.originTimeFrom||b.timeFrom||'00:00'};
}

function tfNewBagCode(db,srcBag){
  var o=tfOriginOf(srcBag);
  var base=mcAutoBagCode(o.date,o.time);
  var used={};
  (db.milkInventory||[]).forEach(function(x){if(x&&x.containerName)used[x.containerName]=true});
  if(!used[base])return base;
  var n=2,code='';
  do{code=base+'-'+n;n++}while(used[code]);
  return code;
}

function tfOpen(idx){
  /* Không chặn theo __milkSwipeLock: khoá đó chỉ để chặn cú chạm vào thẻ (mở chi tiết)
     sau khi vuốt, còn bấm thẳng vào nút hành động thì luôn là chủ ý của người dùng. */
  document.querySelectorAll('.milkSwipeShell.open').forEach(function(el){el.classList.remove('open')});
  var db=load(),b=(db.milkInventory||[])[Number(idx)];
  if(!b){showToast('Không tìm thấy túi sữa','error');return}
  if(!milkCanTransferFromInventory(b)){
    showToast('Túi này không còn sữa để chuyển','warn');return;
  }
  if(String(b.status||'')==='Đã quá hạn'||milkExpireAt(b)<=Date.now()){
    showToast('Túi đã quá hạn: chỉ cho chuyển vị trí, không dùng cho Bé bú','warn');
  }
  var st=tfState();
  st.bagId=b.id;st.targetId='';st.open=true;
  st.kind=(b.containerKind==='binh')?'tui':'binh';   /* mặc định chuyển sang loại khác */
  setValSafe('tfDate',today());
  setValSafe('tfTime',nowHM());
  setValSafe('tfAmount',Number(b.remaining||0));
  setValSafe('tfStorage',b.storage||'Ngăn mát');
  /* V14.2.0 · mỗi lần mở lại đều bắt đầu từ gợi ý của hệ thống */
  tfManualState().on=false;
  setValSafe('tfExpValue','');
  tfSyncManualExpireUI(true);
  tfRenderSource(db,b);
  tfPickKind(st.kind);
  var ov=byId('tfOverlay');
  if(ov){
    ov.classList.add('show');
    ov.setAttribute('aria-hidden','false');
    document.body.classList.add('careModalOpen');
    setTimeout(function(){
      try{var b=byId('tfOverlay')&&byId('tfOverlay').querySelector('.tfBody');if(b)b.scrollTop=0;}catch(e){}
      try{var sh=byId('tfOverlay')&&byId('tfOverlay').querySelector('.tfSheet');if(sh)sh.scrollTop=0;}catch(e){}
      try{if(window.mybOverlayCore&&window.mybOverlayCore.sync)window.mybOverlayCore.sync();}
      catch(e){}
    },0);
  }
}

function tfClose(){
  tfState().open=false;
  var ov=byId('tfOverlay');
  if(ov){ov.classList.remove('show');ov.setAttribute('aria-hidden','true')}
  /* chỉ mở khoá cuộn nền khi không còn popup nào khác đang mở */
  if(!tfOtherOverlayOpen())document.body.classList.remove('careModalOpen');
  try{if(window.mybOverlayCore&&window.mybOverlayCore.schedule)window.mybOverlayCore.schedule();}
  catch(e){}
}

function tfOtherOverlayOpen(){
  return ['careDetailOverlay','careFormOverlay','milkBagPickerOverlay','milkDetailOverlay','bkOverlay'].some(function(id){
    var el=byId(id);return !!(el&&el.classList.contains('show'));
  });
}

function tfRefreshBehind(){
  var ov=byId('careDetailOverlay');
  if(ov&&ov.classList.contains('show')&&window.__careStatsSelectedType==='milk'){
    var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());
    renderCareStatDetail('milk',d);
  }
}

function tfSourceBag(db){
  db=db||load();
  return (db.milkInventory||[]).find(function(b){return b&&b.id===tfState().bagId})||null;
}

function tfRenderSource(db,b){
  var box=byId('tfSourceBox');if(!box)return;
  box.innerHTML=
    '<div class="tfSrcTop"><span>'+(b.containerKind==='tui'?'🥛':'🍼')+'</span>'+
      '<b>'+esc(milkBagDisplayId(b))+'</b>'+
      '<span class="tfSrcKind">'+esc(b.containerKind==='tui'?'Túi':'Bình')+'</span></div>'+
    '<div class="tfSrcGrid">'+
      '<div><small>Dung tích ban đầu</small><b>'+Number(b.amount||0)+' ml</b></div>'+
      '<div><small>Còn lại</small><b>'+Number(b.remaining||0)+' ml</b></div>'+
      '<div><small>Đang để ở</small><b>'+esc(b.storage||'--')+'</b></div>'+
      '<div><small>Hạn dùng</small><b>'+esc(fmtMilkExpire(b)||'--')+'</b></div>'+
    '</div>';
}

function tfPickKind(kind){
  var st=tfState();
  st.kind=(kind==='tui')?'tui':'binh';
  st.targetId='';
  document.querySelectorAll('#tfKindChips .tfKindChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-kind')===st.kind);
  });
  tfRenderTargets();
  tfSyncPreview();
}

function tfRenderTargets(){
  var box=byId('tfTargetChips');if(!box)return;
  var db=load(),st=tfState();
  var list=mcSelectableList(db,st.kind);
  if(!list.length){box.innerHTML=mcEmptyPickHtml(db,st.kind);return}
  box.innerHTML=list.map(function(c){
    var busy=mcIsBusy(db,c.id);
    return '<button type="button" class="mcChip'+(c.id===st.targetId?' on':'')+(busy?' busy':'')+
      '" data-tf="'+esc(c.id)+'" onclick="tfPickTarget(\''+esc(c.id)+'\')">'+
      mcKindIcon(c.kind)+' '+esc(c.name)+'</button>';
  }).join('');
}

function tfPickTarget(id){
  var db=load(),c=mcFind(db,id);
  if(!mcIsSelectable(db,id)){showToast('Bình/túi này đang Tạm ẩn, không chọn được','warn');return}
  if(c&&c.kind==='binh'&&mcIsBusy(db,id)){
    if(!confirm('Bình "'+c.name+'" đang còn sữa của mẻ khác. Vẫn chuyển vào bình này?'))return;
  }
  tfState().targetId=id;
  document.querySelectorAll('#tfTargetChips .mcChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-tf')===id);
  });
  tfSyncPreview();
}

function tfIsThaw(fromStorage,toStorage){
  var frozen=(fromStorage==='Ngăn đông'||fromStorage==='Tủ đông sâu');
  var warmer=(toStorage==='Ngăn mát'||toStorage==='Túi giữ lạnh có đá'||toStorage==='Nhiệt độ phòng');
  return frozen&&warmer;
}

function tfAutoExpire(){
  var db=load(),src=tfSourceBag(db);
  if(!src)return {expire:'',changed:false,longer:false,storage:'',thaw:false};
  var storage=(byId('tfStorage')&&byId('tfStorage').value)||src.storage||'Ngăn mát';
  var date=(byId('tfDate')&&byId('tfDate').value)||today();
  var time=(byId('tfTime')&&byId('tfTime').value)||nowHM();
  if(String(src.status||'')==='Đã quá hạn'||milkExpireAt(src)<=Date.now()){
    return {expire:src.expireDateTime||src.expireDate||'',changed:false,longer:false,storage:storage,thaw:false,sourceExpired:true};
  }
  if(tfIsThaw(src.storage||'',storage)){
    /* Sữa đã rã đông: đồng hồ chạy lại từ lúc chuyển và không quá 24 giờ */
    var ms=dateTimeMs(date,time);
    var base=new Date(ms===null?Date.now():ms);
    var hrs=Math.min(24,milkStorageHours(storage));
    return {expire:localDateTimeValue(new Date(base.getTime()+hrs*3600000)),
      changed:true,longer:false,storage:storage,thaw:true};
  }
  if(storage===(src.storage||'')){
    return {expire:src.expireDateTime||src.expireDate||'',changed:false,longer:false,storage:storage,thaw:false};
  }
  var exp=tfExpireFrom(storage,date,time);
  var longer=milkExpireAt({expireDateTime:exp})>milkExpireAt(src);
  return {expire:exp,changed:true,longer:longer,storage:storage,thaw:false};
}

function tfManualState(){
  if(!window.__tfManualExpire)window.__tfManualExpire={on:false};
  return window.__tfManualExpire;
}

function tfComputeExpire(){
  var auto=tfAutoExpire();
  if(tfManualState().on){
    var v=(byId('tfExpValue')&&byId('tfExpValue').value)||'';
    if(v){
      auto.expire=v;auto.changed=true;auto.manual=true;
      auto.longer=milkExpireAt({expireDateTime:v})>milkExpireAt(tfSourceBag());
      return auto;
    }
  }
  auto.manual=false;
  return auto;
}

function tfToggleManualExpire(){
  tfManualState().on=!tfManualState().on;
  tfSyncManualExpireUI(true);
  tfSyncPreview();
}

function tfSyncManualExpireUI(refill){
  var on=tfManualState().on;
  var box=byId('tfExpManualBox'),btn=byId('tfExpBtn'),inp=byId('tfExpValue');
  if(btn){btn.classList.toggle('on',on);btn.textContent=on?'🕒 Đang tự nhập hạn dùng':'🕒 Tự nhập hạn dùng'}
  if(box)box.classList.toggle('hidden',!on);
  if(inp&&(refill||!inp.value))inp.value=tfAutoExpire().expire||'';
}

function tfRecalcExpire(){
  tfSyncManualExpireUI(true);
  tfSyncPreview();
}

function tfSyncPreview(){
  var db=load(),src=tfSourceBag(db);
  var out=byId('tfPreview');if(!out||!src)return;
  var st=tfState();
  var ml=Number((byId('tfAmount')&&byId('tfAmount').value)||0);
  var remain=Number(src.remaining||0);
  var c=mcFind(db,st.targetId);
  var e=tfComputeExpire();
  var rows='';

  if(ml>remain){
    rows+='<div class="tfWarn"><span>⚠️</span><span>Chỉ còn <b>'+remain+'ml</b> trong '+esc(milkBagDisplayId(src))+', không chuyển được '+ml+'ml.</span></div>';
  }
  if(c){
    var newName=(c.kind==='tui')?tfNewBagCode(db,src):c.name;
    var left=Math.max(0,remain-Math.min(ml,remain));
    rows+='<div class="tfFlow"><div class="tfFlowBox"><small>Nguồn còn lại</small><b>'+left+' ml</b>'+
      (left<=0?'<span class="tfTag">Đã chuyển hết</span>':'')+'</div>'+
      '<div class="tfArrow">→</div>'+
      '<div class="tfFlowBox"><small>'+esc(mcKindLabel(c.kind))+' mới</small><b>'+esc(newName)+'</b>'+
      '<span class="tfTag ok">'+Math.min(ml,remain)+' ml</span></div></div>';
    var expWhy=e.manual?' <small>(bạn tự nhập)</small>'
      :(e.thaw?' <small>(sữa rã đông — tính lại 24 giờ từ lúc chuyển)</small>'
      :(e.changed?' <small>(tính lại theo nơi bảo quản mới)</small>':' <small>(giữ nguyên như túi gốc)</small>'));
    rows+='<div class="tfExp">Hạn dùng phần sữa chuyển đi: <b>'+esc(fmtMilkExpire({expireDateTime:e.expire})||'--')+'</b>'+expWhy+'</div>';
    if(e.thaw&&!e.manual){
      rows+='<div class="tfWarn"><span>❄️</span><span>Chuyển từ <b>'+esc(src.storage||'ngăn đông')+'</b> về <b>'+esc(e.storage)+'</b>: sữa đã rã đông chỉ nên dùng trong <b>24 giờ</b> và <b>không được cấp đông lại</b>. Bấm <b>Tự nhập hạn dùng</b> nếu muốn đặt mốc khác.</span></div>';
    }
    if(e.sourceExpired){
      rows+='<div class="tfWarn"><span>⚫</span><span>Nguồn sữa đã quá hạn. Phần chuyển sang bình/túi mới vẫn được đánh dấu <b>Đã quá hạn</b> và sẽ không xuất hiện trong chọn sữa cho Bé bú.</span></div>';
    }
    if(e.longer){
      rows+='<div class="tfWarn"><span>⚠️</span><span>Nơi bảo quản mới làm <b>hạn dùng dài hơn túi gốc</b>. Chỉ chọn ngăn đông nếu sữa này chưa từng rã đông — sữa đã rã đông thì không được cấp đông lại.</span></div>';
    }
  }else{
    rows+='<p class="notice">Chọn '+(st.kind==='tui'?'túi':'bình')+' sẽ nhận sữa ở trên.</p>';
  }
  out.innerHTML=rows;
}

function tfSetAll(){
  var src=tfSourceBag();
  if(src)setValSafe('tfAmount',Number(src.remaining||0));
  tfSyncPreview();
}

function tfConfirm(){
  var db=load(),st=tfState();
  var src=(db.milkInventory||[]).find(function(b){return b&&b.id===st.bagId});
  if(!src){showToast('Không tìm thấy túi nguồn','error');return}
  var c=mcFind(db,st.targetId);
  if(!c){showToast('Vui lòng chọn bình hoặc túi sẽ nhận sữa','warn');return}
  var ml=Number((byId('tfAmount')&&byId('tfAmount').value)||0);
  var remain=Number(src.remaining||0);
  if(!(ml>0)){showToast('Vui lòng nhập dung tích chuyển','warn');return}
  if(ml>remain){showToast('Chỉ còn '+remain+'ml, không chuyển được '+ml+'ml','warn');return}
  var date=(byId('tfDate')&&byId('tfDate').value)||today();
  var time=(byId('tfTime')&&byId('tfTime').value)||nowHM();
  var e=tfComputeExpire();
  var __udBefore=JSON.stringify(db);
  var now=new Date().toISOString();
  var origin=tfOriginOf(src);
  var newName=(c.kind==='tui')?tfNewBagCode(db,src):c.name;
  var srcLabel=milkBagDisplayId(src);

  /* 1. trừ nguồn — KHÔNG đụng vào bản ghi hút sữa gốc */
  src.remaining=remain-ml;
  if(src.remaining<=0){src.remaining=0;src.status='Đã chuyển hết'}
  src.updatedAt=now;

  /* 2. tạo túi/bình mới, giữ mốc hút gốc để truy vết và tính hạn */
  var newId=uniqueMilkBagId(db,origin.date);
  var evId=newCareId('TF');
  db.milkInventory.unshift({
    id:newId,shortId:newId,
    containerId:c.id,containerKind:c.kind,containerName:newName,
    date:origin.date,startDate:origin.date,timeFrom:origin.time,
    originDate:origin.date,originTimeFrom:origin.time,
    originPumpEventId:src.originPumpEventId||src.pumpEventId||'',
    transferEventId:evId,transferFromBagId:src.id,transferFromName:srcLabel,
    transferAt:date+'T'+time,
    amount:ml,remaining:ml,
    status:(e.sourceExpired||milkExpireAt({expireDateTime:e.expire})<=Date.now())?'Đã quá hạn':'Đang bảo quản',
    storage:e.storage,
    expireDate:e.expire,expireDateTime:e.expire,
    expireManual:!!e.manual,thawed:!!e.thaw||!!src.thawed,
    note:'',createdAt:now,updatedAt:now
  });

  /* 3. ghi một giao dịch Chuyển sữa vào timeline */
  db.careEvents.unshift({
    id:evId,type:'transfer',
    date:date,startDate:date,endDate:date,timeFrom:time,timeTo:'',
    amount:ml,unit:'ml',status:'',note:'',
    extra:{
      fromBagId:src.id,fromName:srcLabel,fromKind:src.containerKind||'',
      toBagId:newId,toName:newName,toKind:c.kind,toContainerId:c.id,
      storage:e.storage,expireDate:e.expire,expireManual:!!e.manual,thawed:!!e.thaw,
      sourceExpired:!!e.sourceExpired,sourceEmptied:src.remaining<=0
    },
    createdAt:now,updatedAt:now
  });

  save(db);
  udShow('Đã chuyển '+ml+'ml sang '+newName+'.',__udBefore);
  tfClose();
  showToast('Chuyển sữa thành công','success');
  render();
  tfRefreshBehind();
}

function tfReleaseTransfer(db,ev){
  if(!ev||ev.type!=='transfer')return true;
  var ex=ev.extra||{};
  var made=findMilkBag(db,ex.toBagId);
  if(made){
    if(Number(made.remaining||0)!==Number(made.amount||0)){
      showToast('Không thể xoá vì '+milkBagDisplayId(made)+' đã được dùng một phần','warn');
      return false;
    }
    var usedElsewhere=(db.careEvents||[]).some(function(x){
      return x&&x.id!==ev.id&&x.type==='transfer'&&x.extra&&x.extra.fromBagId===ex.toBagId;
    });
    if(usedElsewhere){showToast('Không thể xoá vì sữa đã được chuyển tiếp sang nơi khác','warn');return false}
    db.milkInventory=(db.milkInventory||[]).filter(function(b){return b&&b.id!==ex.toBagId});
  }
  var src=findMilkBag(db,ex.fromBagId);
  if(src){
    src.remaining=Number(src.remaining||0)+Number(ev.amount||0);
    if(src.status==='Đã chuyển hết')src.status=(milkExpireAt(src)<=Date.now()?'Đã quá hạn':'Đang bảo quản');
    src.updatedAt=new Date().toISOString();
  }
  return true;
}

function tfEventLine(db,x){
  var ex=(x&&x.extra)||{};
  return (ex.fromKind==='tui'?'🥛':'🍼')+' '+esc(ex.fromName||'--')+
    ' <span class="tfInline">→</span> '+(ex.toKind==='tui'?'🥛':'🍼')+' '+esc(ex.toName||'--');
}

function tfBagTraceHtml(b){
  if(!b||!b.transferFromName)return '';
  var when=b.transferAt?String(b.transferAt).replace('T',' '):'';
  return '<p class="mbTrace">🔄 Chuyển từ '+esc(b.transferFromName)+(when?(' lúc '+esc(when)):'')+'</p>';
}
