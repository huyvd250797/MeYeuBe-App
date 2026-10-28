/* Defer expensive hidden charts; render the latest state when the page opens. */
(function(w){'use strict';var dirty=new Set(),flushing=false;
 var pages={renderPregnancyStats:'pregnancyStats',renderPregnancyChart:'pregnancyChart',renderGrowthChart:'growthChart',renderYearSummary:'yearSummary',renderStatsCompare:'statsCompare',renderMonthlyJourney:'monthlyJourney',renderMilestoneTimeline:'milestoneTimeline'},originals={};
 function visible(id){var p=document.getElementById(id);return p&&!p.classList.contains('hidden')}
 Object.keys(pages).forEach(function(name){var fn=w[name];if(typeof fn!=='function')return;originals[name]=fn;w[name]=function(){if(!visible(pages[name])){dirty.add(name);return}dirty.delete(name);return fn.apply(this,arguments)}});
 function flush(){if(flushing)return;flushing=true;try{Array.from(dirty).forEach(function(name){if(visible(pages[name])){dirty.delete(name);originals[name](load())}})}finally{flushing=false}}
 document.querySelectorAll('.page').forEach(function(p){new MutationObserver(flush).observe(p,{attributes:true,attributeFilter:['class']})});
 w.mybVisibleRendering={flush:flush,dirty:function(){return Array.from(dirty)}};
})(window);
