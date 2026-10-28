/* V17.8: one viewport owner for full-height record editors. */
(function(w){'use strict';var frame=0;
 var targets={careFormOverlay:'show',tfOverlay:'show',feedDoneOverlay:'show',hb2Modal:'hidden',careDetailOverlay:'show',milkBagDetailOverlay:'show',milkBagPickerOverlay:'show',monthDetailOverlay:'show',milestoneDetailOverlay:'show',tl8Detail:'show',hb2ReportOverlay:'show'};
 function active(el,kind){return kind==='hidden'?!el.classList.contains('hidden'):el.classList.contains(kind)}
 function sync(){frame=0;var v=w.visualViewport,normal=v&&Math.abs((v.scale||1)-1)<.05,height=normal?v.height:w.innerHeight,top=normal?v.offsetTop:0;if(!Number.isFinite(height)||height<=0)return;
 var opened=false;Object.keys(targets).forEach(function(id){var layer=document.getElementById(id);if(!layer||!active(layer,targets[id]))return;opened=true;if(!layer.classList.contains('mybFullViewport'))layer.classList.add('mybFullViewport');var panel=Array.from(layer.children).find(function(el){return el.matches('.careFormModal,.tfSheet,.feedDoneCard,.hb2ModalCard,.careDetailModal,.milkBagDetailModal,.milkBagPickerModal,.monthDetailCard,.msDetailCard,.tl8DetailCard,.tl8SheetPanel,.hb2ReportCard')});if(panel&&!panel.classList.contains('mybViewportPanel'))panel.classList.add('mybViewportPanel');layer.style.setProperty('position','fixed','important');layer.style.setProperty('top',Math.max(0,top||0)+'px','important');layer.style.setProperty('height',height+'px','important');layer.style.setProperty('bottom','auto','important')});
 document.body.classList.toggle('mybViewportOpen',opened);
 var formPage=['careAdd','pregnancy','scheduleAdd','milestoneAdd'].some(function(id){var el=document.getElementById(id);return el&&!el.classList.contains('hidden')});document.body.classList.toggle('mybRecordPage',formPage);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(sync)}
 new MutationObserver(function(changes){if(changes.some(function(c){return c.target!==document.body}))schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 w.addEventListener('resize',schedule,{passive:true});w.addEventListener('orientationchange',schedule,{passive:true});if(w.visualViewport){w.visualViewport.addEventListener('resize',schedule,{passive:true});w.visualViewport.addEventListener('scroll',schedule,{passive:true})}schedule();w.mybCareViewport={sync:sync,targets:function(){return Object.keys(targets)}};
})(window);
