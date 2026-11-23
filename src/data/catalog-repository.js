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
  async function write(kind,op,id,data,before){
    field(kind);var handle=await mybCatalogBridge.begin();
    try{
      var r=await mybDataClient.request('myb_catalog_write_v1530',{p_kind:kind,p_op:op,p_id:id,p_data:data||{},p_expected:before||null,p_device_key:cloudDeviceId()});
      if(!Array.isArray(r.data.items)||!Array.isArray(r.data.changes))throw new Error('Kết quả lưu không hợp lệ; tải lại danh sách để đối chiếu.');
      // Do not trust an optimistic ACK alone. Re-read the durable state before success.
      var current=await mybDataClient.request('myb_catalog_list_v1530',{p_kind:kind});
      if(current.target!==r.target||!confirmed(kind,op,id,data||{},current.data.items)){
        var e=new Error('Database chưa cập nhật đúng danh mục vừa sửa. Dữ liệu nhập được giữ lại; vui lòng kiểm tra kết nối và tải lại danh sách trước khi lưu tiếp.');
        e.code='CATALOG_NOT_CONFIRMED';throw e;
      }
      r.data.items=current.data.items;
      mybCatalogBridge.acceptWrite(kind,r.data,r.target,handle);return r.data;
    }finally{mybCatalogBridge.end(handle)}
  }
  w.mybCatalogRepository={field:field,list:list,write:write};
})(window);
