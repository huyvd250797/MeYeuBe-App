(function(w){
  'use strict';
  function validate(kind,input){
    var item={},allowed=kind==='milk_container'?['name','kind','capacity','note','active']:['name','icon','desc','active'];
    allowed.forEach(function(k){if(input[k]!==undefined)item[k]=input[k]});item.name=String(item.name||'').trim();
    if(!item.name||item.name.length>150)throw new Error('Tên danh mục phải có từ 1 đến 150 ký tự.');
    item.active=item.active!==false;
    if(kind==='milk_container'){
      if(['binh','tui'].indexOf(item.kind)<0)throw new Error('Loại bình/túi không hợp lệ.');
      item.capacity=Number(item.capacity||0);if(!Number.isFinite(item.capacity)||item.capacity<0||item.capacity>100000)throw new Error('Dung tích phải từ 0 đến 100.000 ml.');
      if(item.kind==='tui')item.capacity=0;
    }
    ['note','desc','icon'].forEach(function(k){if(item[k]!==undefined){item[k]=String(item[k]).trim();if(item[k].length>(k==='icon'?100:4000))throw new Error('Nội dung danh mục quá dài.')}});
    return item;
  }
  w.mybCatalogService={list:function(k){return mybCatalogRepository.list(k)},save:function(k,input,before,id){var data=validate(k,input);return mybCatalogRepository.write(k,before?'update':'create',before?before.id:id,data,before)},remove:function(k,before){return mybCatalogRepository.write(k,'delete',before.id,{},before)},toggle:function(k,before){var item=Object.assign({},before,{active:before.active===false});return this.save(k,item,before)},validate:validate};
})(window);
