(function(w){'use strict';
 w.openActiveFeedForm=function(){var t=activeFeedTimer();if(!t||(w.mybCareUi&&mybCareUi.isBusy()))return false;openCareFormModal('feed');var d=new Date(t.startedAt);setValSafe('cDate',localDateISO(d));setValSafe('cEndDate',localDateISO(d));setValSafe('cTimeFrom',String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'));setValSafe('cTimeTo','');syncCareDurationPreview();renderCareTimerState();return true};
 var timer=null,target=null,startX=0,startY=0,suppressed=null,until=0;
 function cancel(){clearTimeout(timer);timer=null;target=null}
 function down(e){var b=e.target.closest('.diaperChoice');if(!b||b.disabled||target||e.button>0||e.isPrimary===false)return;suppressed=null;until=0;target=b;startX=e.clientX;startY=e.clientY;timer=setTimeout(function(){if(!target||!b.isConnected||b.disabled)return;for(var n=b;n;n=n.parentElement)if(n.hidden||n.classList.contains('hidden'))return;selectDiaperType(b.dataset.diaper);diaperStepAmount(1);suppressed=b;until=Infinity;timer=null},450)}
 document.addEventListener('pointerdown',down,true);
 document.addEventListener('pointermove',function(e){if(target&&(Math.abs(e.clientX-startX)>12||Math.abs(e.clientY-startY)>12))cancel()},true);
 function release(){if(suppressed&&until===Infinity)until=Date.now()+650;cancel()}
 document.addEventListener('pointerup',release,true);document.addEventListener('pointercancel',release,true);w.addEventListener('blur',release);
 document.addEventListener('click',function(e){var b=e.target.closest('.diaperChoice');if(b&&b===suppressed&&Date.now()<until){e.preventDefault();e.stopImmediatePropagation()}},true);
 document.addEventListener('contextmenu',function(e){if(e.target.closest('.diaperChoice'))e.preventDefault()},true);
 // Buttons in this application dispatch JavaScript; no business flow submits a browser form.
 document.querySelectorAll('button:not([type])').forEach(function(b){b.type='button'});
 new MutationObserver(function(records){records.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.matches('button:not([type])'))n.type='button';n.querySelectorAll('button:not([type])').forEach(function(b){b.type='button'})})})}).observe(document.body,{childList:true,subtree:true});
 w.mybDashboardPolish={cancelHold:release};
})(window);
