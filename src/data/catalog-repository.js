/* V15.3.0: stable-ID operations; no full-state diff or generic save(). */
(function(w){
  'use strict';
  var fields={milk_container:'milkContainers',appointment_type:'appointmentTypes',diary_type:'diaryTypes'};
  function field(kind){if(!fields[kind])throw new Error('Danh mục không hợp lệ.');return fields[kind]}
  var sequence={};
  async function list(kind){field(kind);var revision=mybCatalogBridge.revision(),seq=sequence[kind]=(sequence[kind]||0)+1;var r=await mybDataClient.request('myb_catalog_list_v1530',{p_kind:kind});if(sequence[kind]!==seq)throw new Error("Có truy vấn danh mục mới hơn.");if(!Array.isArray(r.data.items))throw new Error('Danh sách database không hợp lệ.');mybCatalogBridge.acceptList(field(kind),r.data.items,r.target,revision);return r.data.items}
  async function write(kind,op,id,data,before){
    field(kind);var handle=await mybCatalogBridge.begin();
    try{
      var r=await mybDataClient.request('myb_catalog_write_v1530',{p_kind:kind,p_op:op,p_id:id,p_data:data||{},p_expected:before||null,p_device_key:cloudDeviceId()});
      if(!Array.isArray(r.data.items)||!Array.isArray(r.data.changes))throw new Error('Kết quả lưu không hợp lệ; tải lại danh sách để đối chiếu.');
      mybCatalogBridge.acceptWrite(kind,r.data,r.target,handle);return r.data;
    }finally{mybCatalogBridge.end(handle)}
  }
  w.mybCatalogRepository={field:field,list:list,write:write};
})(window);
