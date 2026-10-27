/* V17.6.2: size the fixed care layer from the visible viewport in CSS pixels.
   No persistence, navigation or business handlers. Pinch zoom retains layout sizing. */
(function(w){'use strict';var frame=0,layer=document.getElementById('careFormOverlay');if(!layer)return;
 function sync(){frame=0;if(!layer.classList.contains('show'))return;var v=w.visualViewport,normal=v&&Math.abs((v.scale||1)-1)<0.05,height=normal?v.height:w.innerHeight,top=normal?v.offsetTop:0;if(!Number.isFinite(height)||height<=0)return;
  layer.style.setProperty('position','fixed','important');layer.style.setProperty('top',Math.max(0,top||0)+'px','important');layer.style.setProperty('height',height+'px','important');layer.style.setProperty('bottom','auto','important');
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(sync)}
 new MutationObserver(schedule).observe(layer,{attributes:true,attributeFilter:['class']});w.addEventListener('resize',schedule,{passive:true});w.addEventListener('orientationchange',schedule,{passive:true});if(w.visualViewport){w.visualViewport.addEventListener('resize',schedule,{passive:true});w.visualViewport.addEventListener('scroll',schedule,{passive:true})}schedule();
 w.mybCareViewport={sync:sync};
})(window);
