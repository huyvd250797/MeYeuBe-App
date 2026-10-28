/* V16.0: production form implementation; compatibility names delegate once. */
(function(w){'use strict';
function arrangeFields(body,kind){
  var group=null,labels={meas:'Ngày đo và chỉ số',visits:'Thông tin lần khám',meds:'Thông tin thuốc',vaccines:'Thông tin mũi tiêm',labs:'Kết quả xét nghiệm',attachment:'Thông tin tệp đính kèm',newMember:'Thông tin hồ sơ',member:'Thông tin hồ sơ'};
  Array.from(body.children).forEach(function(el){
    if(!el.matches('label.hb2F')){group=null;return}
    if(!group){group=document.createElement('fieldset');group.className='healthFormFields';var legend=document.createElement('legend');legend.textContent=labels[kind]||'Thông tin ghi nhận';group.appendChild(legend);body.insertBefore(group,el)}
    var control=el.querySelector('input,select,textarea');
    if(control){
      if(control.id)el.htmlFor=control.id;
      if(control.matches('textarea,input[type="text"],input[type="file"]'))el.classList.add('healthFieldWide');
      if(control.type==='number'){if(!control.hasAttribute('step'))control.step='any';control.inputMode='decimal'}
      if(control.tagName==='TEXTAREA')control.rows=Math.max(3,control.rows||0);
    }
    group.appendChild(el);
  });
}
function syncFooter(wrap){var save=wrap.querySelector('#hb2ModalSave'),cancel=wrap.querySelector('#hb2ModalCancel');if(!save||!cancel)return;var label=save.classList.contains('hidden')?'Đóng':'Hủy';if(cancel.textContent!==label)cancel.textContent=label;}
function hb2Modal(title,bodyHtml,onSaveFn,context){
  var wrap=byId('hb2Modal');
  if(!wrap){
    wrap=document.createElement('div');wrap.id='hb2Modal';wrap.className='hb2Modal hidden';
    wrap.innerHTML='<div class="hb2ModalScrim" onclick="hb2CloseModal()"></div><div class="hb2ModalCard">'+
      '<div class="hb2ModalHead"><div class="healthFormHeading"><b id="hb2ModalTitle"></b><small id="hb2ModalOwner"></small></div><button type="button" class="ghost" aria-label="Đóng biểu mẫu" onclick="hb2CloseModal()">✕</button></div>'+
      '<div id="hb2ModalBody"></div>'+
      '<div class="btns mybFormFooter healthFormFooter"><button type="button" id="hb2ModalCancel" class="secondary" onclick="hb2CloseModal()">Hủy</button><button type="button" id="hb2ModalSave">Lưu</button></div></div>';
    document.body.appendChild(wrap);
    new MutationObserver(function(){syncFooter(wrap)}).observe(wrap.querySelector('.healthFormFooter'),{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  context=context||{};
  byId('hb2ModalTitle').textContent=title;
  byId('hb2ModalOwner').textContent=context.memberName||'';
  byId('hb2ModalBody').innerHTML=bodyHtml;
  arrangeFields(byId('hb2ModalBody'),byId('h155date')?'meas':(byId('hb2DocFile')?'attachment':context.kind));
  var btn=byId('hb2ModalSave');
  var clone=btn.cloneNode(true);btn.parentNode.replaceChild(clone,btn);
  if(onSaveFn){clone.classList.remove('hidden');clone.onclick=onSaveFn}else{clone.classList.add('hidden')}
  syncFooter(wrap);
  wrap.setAttribute('aria-labelledby','hb2ModalTitle');
  mybUI.overlays.open('hb2Modal',{hiddenClass:'hidden',canClose:function(){return !window.mybHealthUi||!mybHealthUi.isBusy()},onClose:function(){window.hb2CloseModal()}});
  /* V14.2.0 · mở hộp thoại thì luôn về mép trái + đầu nội dung, không giữ lại
     vị trí cuộn ngang của lần mở trước (CSS đã chặn cuộn ngang, đây là chốt chặn cuối). */
  var card=wrap.querySelector('.hb2ModalCard');
  if(card){card.scrollTop=0;card.scrollLeft=0}byId('hb2ModalBody').scrollTop=0;byId('hb2ModalBody').scrollLeft=0;
}
function hb2CloseModal(){var w=byId('hb2Modal');mybUI.overlays.close('hb2Modal',true);if(w)w.classList.add('hidden')}
mybUI.define('health-modal-open',{render:hb2Modal});
w.hb2Modal=function(){return mybUI.render.apply(null,['health-modal-open'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('health-modal-close',{render:hb2CloseModal});
w.hb2CloseModal=function(){return mybUI.render.apply(null,['health-modal-close'].concat(Array.prototype.slice.call(arguments)))};
w.mybHealthFormShell={arrange:arrangeFields,syncFooter:syncFooter};
})(window);
