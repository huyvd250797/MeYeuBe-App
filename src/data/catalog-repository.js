/* V15.3.0: stable-ID operations; no full-state diff or generic save(). */
(function(w){
  'use strict';
  var fields={milk_container:'milkContainers',appointment_type:'appointmentTypes',diary_type:'diaryTypes'};
  function field(kind){if(!fields[kind])throw new Error('Danh mục không hợp lệ.');return fields[kind]}
  var sequence={};
  async function list(kind){field(kind);var revision=mybCatalogBridge.revision(),seq=sequence[kind]=(sequence[kind]||0)+1;var r=await mybDataClient.request('myb_catalog_list_v1530',{p_kind:kind});if(sequence[kind]!==seq)throw new Error("Có truy vấn danh mục mới hơn.");if(!Array.isArray(r.data.items))throw new Error('Danh sách database không hợp lệ.');mybCatalogBridge.acceptList(field(kind),r.data.items,r.target,revision);return r.data.items}
  function confirmed(kind,op,id,data,items){
    if(!Array.isArray(items))return false;
    var x=items.find(function(row){return String(row.id)===String(id)});
    if(op==='delete')return !x;
    if(!x||String(x.name||'')!==String(data.name||'')||Boolean(x.active!==false)!==Boolean(data.active!==false))return false;
    if(kind==='milk_container'){
      var capacity=data.kind==='tui'?0:Number(data.capacity||0);
      if(x.kind!==data.kind||Number(x.capacity||0)!==capacity)return false;
      if(x.capacityMl!==undefined&&x.capacityMl!==null&&Number(x.capacityMl)!==capacity)return false;
      if(String(x.note||'')!==String(data.note||''))return false;
    }else if(kind==='appointment_type'||kind==='diary_type'){
      if(String(x.icon||'')!==String(data.icon||'')||String(x.desc||'')!==String(data.desc||''))return false;
    }
    return true;
  }
  function comparable(kind,record){
    if(!record)return null;
    var keys=kind==='milk_container'?['name','kind','capacity','note','active']:['name','icon','desc','active'];
    var result={};keys.forEach(function(k){
      if(k==='capacity')result[k]=Number(record[k]||0);
      else if(k==='active')result[k]=record[k]!==false;
      else result[k]=String(record[k]||'').trim();
    });return JSON.stringify(result);
  }
  async function fresh(kind){
    if(mybDataClient.invalidateReads)mybDataClient.invalidateReads();
    var read=await mybDataClient.request('myb_catalog_list_v1530',{p_kind:kind});
    if(!Array.isArray(read.data.items))throw new Error('Danh sách database không hợp lệ.');
    return read;
  }
  function conflict(){
    var e=new Error('Danh mục đã được thay đổi trên thiết bị khác. Vui lòng đóng bản sửa và mở lại để tránh ghi đè.');
    e.code='CONFLICT';return e;
  }
  async function write(kind,op,id,data,before){
    field(kind);var handle=await mybCatalogBridge.begin();
    try{
      // Fetch a fresh server record AFTER the bridge flush (the client cache may
      // be behind incoming realtime edits or contain older catalog metadata).
      var beforeRemote=await fresh(kind);
      var live=beforeRemote.data.items.find(function(row){return String(row.id)===String(id)});
      if(op==='create'&&live)throw conflict();
      if(op!=='create'&&(!live||!before||comparable(kind,live)!==comparable(kind,before)))throw conflict();
      var expected=op==='create'?null:live;
      var r;
      try{
        r=await mybDataClient.request('myb_catalog_write_v1530',{p_kind:kind,p_op:op,p_id:id,p_data:data||{},p_expected:expected,p_device_key:cloudDeviceId()});
      }catch(e){
        // Server conflict after the fresh read means a true race or another
        // process modified the record. Never overwrite by retrying blindly.
        if(e&&e.code==='CONFLICT')throw conflict();
        throw e;
      }
      if(!Array.isArray(r.data.items)||!Array.isArray(r.data.changes))throw new Error('Kết quả lưu không hợp lệ; tải lại danh sách để đối chiếu.');
      // A write ACK alone is insufficient: compare durable server state.
      var current=await fresh(kind);
      if(current.target!==r.target||!confirmed(kind,op,id,data||{},current.data.items)){
        var err=new Error('Database chưa xác nhận giá trị mới của danh mục. Nội dung nhập được giữ lại. Kiểm tra SQL migration V17.22.60 và thử lại.');
        err.code='CATALOG_NOT_CONFIRMED';throw err;
      }
      r.data.items=current.data.items;
      mybCatalogBridge.acceptWrite(kind,r.data,r.target,handle);return r.data;
    }finally{mybCatalogBridge.end(handle)}
  }
  w.mybCatalogRepository={field:field,list:list,write:write};
})(window);
