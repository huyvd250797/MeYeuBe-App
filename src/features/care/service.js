(function(w){
 'use strict';
 function validate(ev){
  if(!ev||!ev.id||!ev.type||!/^\d{4}-\d{2}-\d{2}$/.test(ev.date||''))throw new Error('Thiếu ghi nhận hoặc ngày.');
  if(!Number.isFinite(ev.amount)||ev.amount<0||ev.amount>100000)throw new Error('Lượng không hợp lệ.');
  if(ev.type==='feed'&&ev.source==='stored'){
   var sources=ev.milkSources||[],seen={},total=0;
   sources.forEach(function(s){if(!s.bagId||seen[s.bagId]||!Number.isFinite(s.usedMl)||s.usedMl<=0)throw new Error('Nguồn sữa không hợp lệ.');seen[s.bagId]=true;total+=s.usedMl});
   if(!sources.length||ev.amount!==total-Number(ev.wasteMl||0))throw new Error('Lượng lấy ra và lượng bé bú không khớp.');
  }
  return ev;
 }
 w.mybCareService={validate:validate,
  save:function(ev,before){ev=JSON.parse(JSON.stringify(ev));delete ev.updatedAt;delete ev.version;validate(ev);return mybCareRepository.write({op:'save',event:ev,expected:mybCareRepository.expected(before)})},
  remove:function(before){return mybCareRepository.write({op:'delete',event:{id:before.id},expected:mybCareRepository.expected(before)})},
  undo:function(id){return mybCareRepository.write({op:'undo',operationId:id})}
 };
})(window);
