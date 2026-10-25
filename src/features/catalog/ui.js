(function(w){
  'use strict';
  var editing={},creating={},busy=false;
  var forms={milk_container:{list:'mcList',name:'mcName',active:'mcActive',fields:{kind:'mcKind',capacity:'mcCapacity',note:'mcNote'}},appointment_type:{list:'appointmentTypeList',name:'typeName',active:'typeActive',fields:{icon:'typeIcon',desc:'typeDesc'}},diary_type:{list:'diaryTypeList',name:'dtName',active:'dtActive',fields:{icon:'dtIcon',desc:'dtDesc'}}};
  function field(k){return mybCatalogRepository.field(k)}
  function rows(k){return load()[field(k)]||[]}
  function value(id){var el=byId(id);return el?el.value:''}
  function message(k,text){var el=byId(forms[k].list+'Status');if(el)el.textContent=text||''}
  function id(){return 'cat_'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'_'+Math.random().toString(36).slice(2))}
  function buttons(k,x){return ['edit','toggle','delete'].map(function(a){var label={edit:'Sửa',toggle:x.active===false?'Bật lại':'Tạm ẩn',delete:'Xóa'}[a];return '<button type="button" class="'+(a==='delete'?'danger':'ghost')+'" data-catalog-action="'+a+'" data-kind="'+k+'" data-id="'+esc(x.id)+'"'+(busy?' disabled':'')+'>'+label+'</button>'}).join('')}
  function render(k){
    var box=byId(forms[k].list);if(!box)return;
    var items=rows(k);if(k==='milk_container'&&mcOnlyActiveFilter())items=items.filter(function(x){return x.active!==false});
    box.innerHTML=items.length?items.map(function(x){return '<div class="item"><b>'+esc((x.icon||'')+' '+x.name)+'</b><small>'+esc(k==='milk_container'?(x.kind==='tui'?'Túi':('Bình · '+Number(x.capacity||0)+' ml')):'')+' · '+(x.active===false?'Tạm ẩn':'Đang dùng')+'</small><p>'+esc(x.note||x.desc||'')+'</p><div class="itemActions">'+buttons(k,x)+'</div></div>'}).join(''):'<p class="notice">Chưa có danh mục phù hợp.</p>';
    if(k==='milk_container'){var bar=byId('mcFilterBar');if(bar)bar.innerHTML='<button type="button" class="ghost" onclick="mcToggleOnlyActiveFilter()">'+(mcOnlyActiveFilter()?'✓ Chỉ hiện đang dùng':'Chỉ hiện đang dùng')+'</button>'}
    if(k==='appointment_type')fillAppointmentTypeOptions(load());
  }
  function lock(on){busy=on;document.querySelectorAll('#milkContainer button,#milkContainer input,#milkContainer textarea,#milkContainer select,#appointmentType button,#appointmentType input,#appointmentType textarea,#appointmentType select').forEach(function(b){b.disabled=on})}
  async function refresh(k){if(busy)return false;message(k,'Đang tải danh mục…');try{await mybCatalogService.list(k);render(k);message(k,'');return true}catch(e){message(k,e.message);return false}}
  function reset(k){editing[k]=null;creating[k]=null;if(k==='milk_container')nativeResetMilk();else if(k==='appointment_type')nativeResetType();else {['dtName','dtIcon','dtDesc'].forEach(function(x){setValSafe(x,'')});setValSafe('dtActive','1')} }
  async function run(k,fn){if(busy)return false;lock(true);message(k,'Đang lưu…');try{await fn();render(k);message(k,'Database đã xác nhận.');showToast('Database đã xác nhận lưu danh mục','success');return true}catch(e){message(k,e.message);showToast(e.message,'error');return false}finally{lock(false)}}
  function edit(k,recordId){if(busy)return;var x=rows(k).find(function(x){return String(x.id)===String(recordId)});if(!x)return;editing[k]=JSON.parse(JSON.stringify(x));creating[k]=null;var f=forms[k];setValSafe(f.name,x.name||'');setValSafe(f.active,x.active===false?'0':'1');Object.keys(f.fields).forEach(function(n){setValSafe(f.fields[n],x[n]===undefined?'':x[n])});if(k==='milk_container'){mcPickKind(x.kind||'binh');setValSafe('mcEditIndex',x.id);byId('mcFormTitle').textContent='Sửa bình / túi'}if(k==='appointment_type'){setValSafe('typeEditIndex',x.id);byId('typeFormTitle').textContent='Sửa loại lịch khám'}}
  async function save(k){var f=forms[k],input={name:value(f.name),active:value(f.active)==='1'};Object.keys(f.fields).forEach(function(n){input[n]=value(f.fields[n])});if(!creating[k])creating[k]=id();return run(k,async function(){await mybCatalogService.save(k,input,editing[k],creating[k]);reset(k)})}
  async function action(k,a,recordId){if(busy)return false;if(a==='edit'){edit(k,recordId);return true}var x=rows(k).find(function(x){return String(x.id)===String(recordId)});if(!x)return false;if(a==='delete'&&!confirm('Xóa danh mục "'+x.name+'"?'))return false;return run(k,function(){return a==='delete'?mybCatalogService.remove(k,x):mybCatalogService.toggle(k,x)})}
  var nativeResetMilk=w.resetMilkContainerForm,nativeResetType=w.resetAppointmentTypeForm,nav=w.doShowPage;
  w.resetMilkContainerForm=function(){reset('milk_container')};w.resetAppointmentTypeForm=function(){reset('appointment_type')};
  w.renderMilkContainers=function(){render('milk_container')};w.renderAppointmentTypes=function(){render('appointment_type');render('diary_type')};
  w.saveMilkContainer=function(){return save('milk_container')};w.saveAppointmentType=function(){return save('appointment_type')};
  // Compatibility entrypoints resolve the visible row to a stable ID immediately.
  w.editMilkContainer=function(i){var x=mcVisibleContainers(load())[i];if(x)edit('milk_container',x.id)};
  w.delMilkContainer=function(i){var x=mcVisibleContainers(load())[i];if(x)return action('milk_container','delete',x.id)};
  w.mcToggleActive=function(i){var x=mcVisibleContainers(load())[i];if(x)return action('milk_container','toggle',x.id)};
  w.editAppointmentType=function(i){var x=rows('appointment_type')[i];if(x)edit('appointment_type',x.id)};
  w.delAppointmentType=function(i){var x=rows('appointment_type')[i];if(x)return action('appointment_type','delete',x.id)};
  w.doShowPage=function(page,el){nav(page,el);if(page==='milkContainer')refresh('milk_container');if(page==='appointmentType'){refresh('appointment_type');refresh('diary_type')}};
  document.addEventListener('click',function(e){var el=e.target.closest('[data-catalog-action]');if(el&&forms[el.dataset.kind])action(el.dataset.kind,el.dataset.catalogAction,el.dataset.id)});
  w.mybCatalogUi={refresh:refresh,save:save,reset:reset,edit:edit,action:action,render:render};
})(window);
