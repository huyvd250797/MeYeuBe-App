/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
function openCareFormModal(type,editIndex){var overlay=byId('careFormOverlay'),body=byId('careFormModalBody'),card=careFormCard();if(!overlay||!body||!card)return;if(!window.__careFormHome){window.__careFormHome={parent:card.parentNode,next:card.nextSibling}}body.appendChild(card);window.__careFormModalOpen=true;mybUI.overlays.open('careFormOverlay',{focus:'cTimeFrom',focusDelay:80,canClose:function(){return !window.mybCareUi||!mybCareUi.isBusy()},onClose:function(){window.closeCareFormModal()}});if(editIndex!==undefined&&editIndex!==null&&editIndex!=='')fillCareEditForm(Number(editIndex));else{resetCareForm();window.__careFormIsCopy=false;selectCareType(normalizeCareInputType(type||'feed'));syncCareFormTitle()}/* focus timer belongs to the overlay lifecycle */}

function closeCareFormModal(returnToDetail){var overlay=byId('careFormOverlay'),card=careFormCard(),ctx=window.__careFormReturnContext?Object.assign({},window.__careFormReturnContext):null;if(window.__careFormHome&&card){var h=window.__careFormHome;if(h.next&&h.next.parentNode===h.parent)h.parent.insertBefore(card,h.next);else h.parent.appendChild(card)}mybUI.overlays.close('careFormOverlay',true);if(overlay)overlay.classList.remove('show');window.__careFormModalOpen=false;if(returnToDetail!==false&&ctx){window.__careFormReturnContext=null;setTimeout(function(){renderCareStatDetail(ctx.type,ctx.date)},30)}else if(returnToDetail===false){return}else window.__careFormReturnContext=null}
mybUI.define('care-form-open',{render:openCareFormModal});
w.openCareFormModal=function(){return mybUI.render.apply(null,['care-form-open'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('care-form-close',{render:closeCareFormModal});
w.closeCareFormModal=function(){return mybUI.render.apply(null,['care-form-close'].concat(Array.prototype.slice.call(arguments)))};
})(window);
