(function(w){'use strict';
 w.openActiveFeedForm=function(){var t=activeFeedTimer();if(!t||(w.mybCareUi&&mybCareUi.isBusy()))return false;openCareFormModal('feed');var d=new Date(t.startedAt);setValSafe('cDate',localDateISO(d));setValSafe('cEndDate',localDateISO(d));setValSafe('cTimeFrom',String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'));setValSafe('cTimeTo','');syncCareDurationPreview();renderCareTimerState();return true};
 var timer=null,target=null,pointer=null,startX=0,startY=0,suppressed='',until=0;
 function tile(e){return e.target&&e.target.closest&&e.target.closest('#dashboard [data-quick-diaper]')}
 function visible(b){if(!b||!b.isConnected)return false;for(var n=b;n;n=n.parentElement)if(n.hidden||n.classList.contains('hidden'))return false;return true}
 function cancel(){clearTimeout(timer);timer=null;if(target)target.classList.remove('quickDiaperHolding');target=null;pointer=null}
 function suppress(b){suppressed=b.dataset.quickDiaper;until=Infinity}
 function down(e){
  var b=tile(e);if(!b||target||e.button>0||e.isPrimary===false||!visible(b)||(w.mybCareUi&&mybCareUi.isBusy()))return;
  suppressed='';until=0;target=b;pointer=e.pointerId;startX=e.clientX;startY=e.clientY;b.classList.add('quickDiaperHolding');
  var day=b.dataset.quickDate;
  timer=setTimeout(function(){
   timer=null;if(!visible(b)||target!==b){cancel();return}
   b.classList.remove('quickDiaperHolding');suppress(b);
   // The committed write owns haptics; do not also vibrate on pointer release.
   if(w.AX_PRESS)w.AX_PRESS.tracking=false;
   if(!w.mybCareUi)return;
   // No interval: a new pointerdown after release is required for another write.
   var nodes=Array.from(document.querySelectorAll('#dashboard [data-quick-diaper]'));
   nodes.forEach(function(n){n.setAttribute('aria-busy','true')});
   Promise.resolve(mybCareUi.quickDiaper(b.dataset.quickDiaper,day)).finally(function(){nodes.concat(Array.from(document.querySelectorAll('#dashboard [data-quick-diaper]'))).forEach(function(n){n.removeAttribute('aria-busy')})});
  },500);
 }
 document.addEventListener('pointerdown',down,true);
 function abort(){if(target)suppress(target);cancel()}
 document.addEventListener('pointermove',function(e){if(target&&e.pointerId===pointer&&(Math.abs(e.clientX-startX)>12||Math.abs(e.clientY-startY)>12))abort()},true);
 function release(e){if(e&&target&&e.pointerId!==pointer)return;if(suppressed&&until===Infinity)until=Date.now()+650;cancel()}
 document.addEventListener('pointerup',release,true);document.addEventListener('pointercancel',function(e){if(target&&e.pointerId===pointer)abort()},true);w.addEventListener('blur',abort);
 document.addEventListener('scroll',function(){if(target)abort()},true);
 document.addEventListener('visibilitychange',function(){if(document.hidden)abort()});
 document.addEventListener('click',function(e){var b=tile(e);if(b&&b.dataset.quickDiaper===suppressed&&Date.now()<until){e.preventDefault();e.stopImmediatePropagation();if(until!==Infinity){suppressed='';until=0}}},true);
 document.addEventListener('contextmenu',function(e){if(tile(e))e.preventDefault()},true);
 // Buttons in this application dispatch JavaScript; no business flow submits a browser form.
 document.querySelectorAll('button:not([type])').forEach(function(b){b.type='button'});
 new MutationObserver(function(records){records.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.matches('button:not([type])'))n.type='button';n.querySelectorAll('button:not([type])').forEach(function(b){b.type='button'})})})}).observe(document.body,{childList:true,subtree:true});
 w.mybDashboardPolish={cancelHold:release};
})(window);
