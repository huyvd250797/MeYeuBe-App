/* V15.5: destination-bound record commands; no member snapshot writes. */
(function(w){'use strict';
 var KEY='mybHealthPending_v1550',busy=false;
 function pending(){return JSON.parse(localStorage.getItem(KEY)||'null')}
 async function query(q){return (await mybDataClient.request('myb_health_list_v1550',{p_query:q||{}})).data}
 async function pages(kind){var all=[],r,revision=null;do{r=await query({kind:kind,limit:500,offset:all.length,revision:revision});revision=r.revision;if(!Array.isArray(r.items))throw new Error('Danh sách sức khỏe không hợp lệ.');all=all.concat(r.items)}while(r.hasMore&&r.items.length);return {items:all,revision:revision}}
 async function fetchBundle(){for(var a=0;a<2;a++){try{var kinds=['member','meas','vaccines','visits','meds','labs','pregnancy'],out=await Promise.all(kinds.map(pages));if(out.some(function(r){return r.revision!==out[0].revision}))throw Object.assign(new Error('Hồ sơ vừa thay đổi; tải lại.'),{code:'CONFLICT'});var bundle={};kinds.forEach(function(k,i){bundle[k]=out[i].items});return bundle}catch(e){if(a||e.code!=='CONFLICT')throw e}}}
 async function write(command){if(busy)throw new Error('Đang lưu sức khỏe.');if(w.mybCareRepository&&mybCareRepository.pending())throw new Error('Kiểm tra thao tác chăm sóc chưa xác nhận trước.');busy=true;var handle;
 try{handle=await mybHealthBridge.begin();var target=mybDataClient.target(loadCloudConfig()),p=pending(),r;
 if(p&&p.target!==target)throw new Error('Còn thao tác sức khỏe của kết nối khác.');
 if(p){r=await mybDataClient.request('myb_health_operation_v1550',{p_op_id:p.id});if(r.data.status!=='not_found'){mybHealthBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);if(JSON.stringify(command)!==JSON.stringify(p.command))throw Object.assign(new Error('Thao tác trước đã lưu. Kiểm tra và mở lại form trước khi sửa tiếp.'),{code:'PREVIOUS_APPLIED'});return r.data}if(JSON.stringify(command)!==JSON.stringify(p.command))throw new Error('Giữ nguyên nội dung để kiểm tra thao tác trước.');}
 else{p={id:crypto.randomUUID(),target:target,command:command};localStorage.setItem(KEY,JSON.stringify(p))}
 try{r=await mybDataClient.request('myb_health_write_v1550',{p_op_id:p.id,p_device_key:cloudDeviceId(),p_command:p.command})}catch(e){if(e.code&&e.code!=='UNKNOWN_OUTCOME')localStorage.removeItem(KEY);else mybHealthBridge.uncertain('Chưa xác nhận lưu sức khỏe; giữ form và kiểm tra lại.');throw e}
 if(!r.data.operationId||!r.data.kind||!r.data.rowId)throw new Error('Chưa đủ phản hồi xác nhận lưu.');mybHealthBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);return r.data;
 }finally{if(handle)mybHealthBridge.end(handle);busy=false}}
 w.mybHealthRepository={query:query,fetchBundle:fetchBundle,write:write,pending:pending,recover:function(){var p=pending();return p?write(p.command):Promise.resolve(null)},isBusy:function(){return busy}};
})(window);
