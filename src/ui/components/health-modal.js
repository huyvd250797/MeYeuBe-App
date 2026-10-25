/* V16.0: production form implementation; compatibility names delegate once. */
(function(w){'use strict';
function hb2Modal(title,bodyHtml,onSaveFn){
  var wrap=byId('hb2Modal');
  if(!wrap){
    wrap=document.createElement('div');wrap.id='hb2Modal';wrap.className='hb2Modal hidden';
    wrap.innerHTML='<div class="hb2ModalScrim" onclick="hb2CloseModal()"></div><div class="hb2ModalCard">'+
      '<div class="hb2ModalHead"><b id="hb2ModalTitle"></b><button class="ghost" onclick="hb2CloseModal()">✕</button></div>'+
      '<div id="hb2ModalBody"></div>'+
      '<div class="btns"><button id="hb2ModalSave">Lưu</button><button class="ghost" onclick="hb2CloseModal()">Hủy</button></div></div>';
    document.body.appendChild(wrap);
  }
  byId('hb2ModalTitle').textContent=title;
  byId('hb2ModalBody').innerHTML=bodyHtml;
  var btn=byId('hb2ModalSave');
  var clone=btn.cloneNode(true);btn.parentNode.replaceChild(clone,btn);
  if(onSaveFn){clone.classList.remove('hidden');clone.onclick=onSaveFn}else{clone.classList.add('hidden')}
  mybUI.overlays.open('hb2Modal',{hiddenClass:'hidden',canClose:function(){return !window.mybHealthUi||!mybHealthUi.isBusy()},onClose:function(){window.hb2CloseModal()}});
  /* V14.2.0 · mở hộp thoại thì luôn về mép trái + đầu nội dung, không giữ lại
     vị trí cuộn ngang của lần mở trước (CSS đã chặn cuộn ngang, đây là chốt chặn cuối). */
  var card=wrap.querySelector('.hb2ModalCard');
  if(card){card.scrollTop=0;card.scrollLeft=0}
}
function hb2CloseModal(){var w=byId('hb2Modal');mybUI.overlays.close('hb2Modal',true);if(w)w.classList.add('hidden')}
mybUI.define('health-modal-open',{render:hb2Modal});
w.hb2Modal=function(){return mybUI.render.apply(null,['health-modal-open'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('health-modal-close',{render:hb2CloseModal});
w.hb2CloseModal=function(){return mybUI.render.apply(null,['health-modal-close'].concat(Array.prototype.slice.call(arguments)))};
})(window);
