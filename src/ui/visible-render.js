/* Defer expensive hidden charts; render the latest state when the page opens. */
(function(w){'use strict';var dirty=new Set(),flushing=false;
 var pages={renderPregnancyStats:'pregnancyStats',renderPregnancyChart:'pregnancyChart',renderGrowthChart:'growthChart',renderYearSummary:'yearSummary',renderStatsCompare:'statsCompare',renderMonthlyJourney:'monthlyJourney',renderMilestoneTimeline:'milestoneTimeline'},originals={};
 function visible(id){var p=document.getElementById(id);return p&&!p.classList.contains('hidden')}
 Object.keys(pages).forEach(function(name){var fn=w[name];if(typeof fn!=='function')return;originals[name]=fn;w[name]=function(){if(!visible(pages[name])){dirty.add(name);return}dirty.delete(name);return fn.apply(this,arguments)}});
 function flush(){if(flushing)return;flushing=true;try{Array.from(dirty).forEach(function(name){if(visible(pages[name])){dirty.delete(name);originals[name](load())}})}finally{flushing=false}}
 document.querySelectorAll('.page').forEach(function(p){new MutationObserver(flush).observe(p,{attributes:true,attributeFilter:['class']})});
 w.mybVisibleRendering={flush:flush,dirty:function(){return Array.from(dirty)}};
})(window);
/* Local diagnostics contain durations and RPC names only, never response rows/config. */
(function(w){var host=document.getElementById('cloudSync');if(!host)return;var section=document.createElement('section');section.className='card';var title=document.createElement('h3');title.textContent='Chẩn đoán tốc độ';var text=document.createElement('p');text.textContent='Đo trên thiết bị hiện tại; không gửi dữ liệu cá nhân.';var button=document.createElement('button');button.type='button';button.textContent='Xem thời gian tải';var output=document.createElement('pre');output.style.whiteSpace='pre-wrap';output.style.overflowWrap='anywhere';button.onclick=function(){output.textContent=w.mybPerf?JSON.stringify(mybPerf.report(),null,2):'Mở lại app để đo lần khởi động.'};section.append(title,text,button,output);host.appendChild(section)})(window);
