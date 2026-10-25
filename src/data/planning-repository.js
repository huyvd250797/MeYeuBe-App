/* V15.5: destination-bound record commands; no member snapshot writes. */
(function(w){'use strict';
 var KEY='mybPlanningPending_v1560',busy=false;
 function pending(){return JSON.parse(localStorage.getItem(KEY)||'null')}
 async function query(q){return (await mybDataClient.request('myb_planning_list_v1560',{p_query:q||{}})).data}
 async function pages(kind,filter){var all=[],r,revision=null;do{r=await query(Object.assign({},filter||{},{kind:kind,limit:200,offset:all.length,revision:revision}));revision=r.revision;if(!Array.isArray(r.items))throw new Error('Danh sách không hợp lệ.');all=all.concat(r.items)}while(r.hasMore&&r.items.length);return all}
 async function fetchBundle(){var out={};for(var k of ['diary','appointment','milestone','month']){for(var attempt=0;attempt<2;attempt++){try{out[k]=await pages(k);break}catch(e){if(attempt||e.code!=='CONFLICT')throw e}}}return out}
 async function write(command){if(w.mybSettingsRepository&&mybSettingsRepository.pending())throw new Error('Kiểm tra cài đặt chưa xác nhận trước.');if(busy)throw new Error('Đang lưu nhật ký và kế hoạch.');if(w.mybHealthRepository&&mybHealthRepository.pending())throw new Error('Kiểm tra thao tác sức khỏe chưa xác nhận trước.');if(w.mybCareRepository&&mybCareRepository.pending())throw new Error('Kiểm tra thao tác chăm sóc chưa xác nhận trước.');busy=true;var handle;
 try{handle=await mybPlanningBridge.begin();var target=mybDataClient.target(loadCloudConfig()),p=pending(),r;
 if(p&&p.target!==target)throw new Error('Còn thao tác nhật ký và kế hoạch của kết nối khác.');
 if(p){r=await mybDataClient.request('myb_planning_operation_v1560',{p_op_id:p.id});if(r.data.status!=='not_found'){mybPlanningBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);if(JSON.stringify(command)!==JSON.stringify(p.command))throw Object.assign(new Error('Thao tác trước đã lưu. Kiểm tra và mở lại form trước khi sửa tiếp.'),{code:'PREVIOUS_APPLIED'});return r.data}if(JSON.stringify(command)!==JSON.stringify(p.command))throw new Error('Giữ nguyên nội dung để kiểm tra thao tác trước.');}
 else{p={id:crypto.randomUUID(),target:target,command:command};localStorage.setItem(KEY,JSON.stringify(p))}
 try{r=await mybDataClient.request('myb_planning_write_v1560',{p_op_id:p.id,p_device_key:cloudDeviceId(),p_command:p.command})}catch(e){if(e.code&&e.code!=='UNKNOWN_OUTCOME')localStorage.removeItem(KEY);else mybPlanningBridge.uncertain('Chưa xác nhận lưu nhật ký và kế hoạch; giữ form và kiểm tra lại.');throw e}
 if(!r.data.operationId||!r.data.kind||!r.data.rowId)throw new Error('Chưa đủ phản hồi xác nhận lưu.');mybPlanningBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);return r.data;
 }finally{if(handle)mybPlanningBridge.end(handle);busy=false}}
 w.mybPlanningRepository={query:query,pages:pages,fetchBundle:fetchBundle,write:write,pending:pending,recover:function(){var p=pending();return p?write(p.command):Promise.resolve(null)},isBusy:function(){return busy}};
})(window);
