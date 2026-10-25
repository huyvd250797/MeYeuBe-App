/* V15.4.0: one destination-bound operation, persisted before the first request.
   A timeout reuses that operation ID; it never creates a second business event. */
(function(w){
 'use strict';
 var KEY='mybCarePending_v1540',busy=false;
 function pending(){return JSON.parse(localStorage.getItem(KEY)||'null')}
 function expected(x){return x?{updatedAt:x.updatedAt,version:x.version}:null}
 async function query(q){return (await mybDataClient.request('myb_care_list_v1540',{p_query:q||{}})).data}
 async function pages(kind){var items=[],offset=0,r,revision=null;do{r=await query({kind:kind,limit:500,offset:offset,revision:revision});if(!Array.isArray(r.items))throw new Error('Danh sách không hợp lệ.');revision=r.revision;items=items.concat(r.items);offset+=r.items.length;}while(r.hasMore&&r.items.length);return {items:items,revision:revision}}
 async function fetchBundle(){for(var attempt=0;attempt<2;attempt++){try{var pair=await Promise.all([pages('care'),pages('milk')]);if(pair[0].revision!==pair[1].revision)throw new Error('Kho và chăm sóc vừa thay đổi; tải lại.');return {careEvents:pair[0].items,milkInventory:pair[1].items}}catch(e){if(attempt||e.code&&e.code!=='CONFLICT')throw e}}}
 async function write(command){
  if(busy)throw new Error('Đang lưu ghi nhận.');busy=true;var handle;
  try{
   handle=await mybCareBridge.begin();
   var target=mybDataClient.target(loadCloudConfig()),p=pending(),r;
   if(p&&p.target!==target)throw new Error('Còn thao tác chờ của kết nối khác. Giữ kết nối cũ để đối chiếu.');
   if(p){
    // Read-only verification is safe even after a commit acknowledgement was lost.
    r=await mybDataClient.request('myb_care_operation_v1540',{p_op_id:p.id});
    if(r.data.status!=='not_found'){
      mybCareBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);
      if(JSON.stringify(command)!==JSON.stringify(p.command)){var done=new Error('Thao tác trước đã lưu. Tải lại và kiểm tra trước khi lưu nội dung mới.');done.code='PREVIOUS_APPLIED';throw done}
      return r.data;
    }
    if(JSON.stringify(command)!==JSON.stringify(p.command))throw new Error('Thao tác trước chưa được đối chiếu. Giữ nguyên nội dung và bấm Lưu lại.');
   }else{p={id:crypto.randomUUID(),target:target,command:command};localStorage.setItem(KEY,JSON.stringify(p))}
   try{r=await mybDataClient.request('myb_care_write_v1540',{p_op_id:p.id,p_device_key:cloudDeviceId(),p_command:p.command})}
   catch(e){if(e.code==='UNKNOWN_OUTCOME')mybCareBridge.uncertain('Chưa xác nhận thao tác chăm sóc; giữ form để kiểm tra lại.');if(e.code&&e.code!=='UNKNOWN_OUTCOME')localStorage.removeItem(KEY);throw e}
   if(!r.data.operationId||!Array.isArray(r.data.milkItems))throw new Error('Phản hồi chưa đủ để xác nhận lưu.');
   mybCareBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);return r.data;
  }finally{if(handle)mybCareBridge.end(handle);busy=false}
 }
 async function recover(){var p=pending();if(!p)return null;return write(p.command)}
 w.mybCareRepository={query:query,fetchBundle:fetchBundle,write:write,recover:recover,pending:pending,expected:expected,isBusy:function(){return busy}};
})(window);
