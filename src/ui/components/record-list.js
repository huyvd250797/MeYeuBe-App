/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
function renderList(id,arr,type,fmt){byId(id).innerHTML=arr.length?arr.map(function(x,i){var actionIdx=(typeof x._idx==='number'?x._idx:i);return '<div class="item">'+fmt(x)+itemActions(type,actionIdx)+'</div>'}).join(''):'<p class="notice">Chưa có dữ liệu.</p>'}
mybUI.define('record-list',{render:renderList});
w.renderList=function(){return mybUI.render.apply(null,['record-list'].concat(Array.prototype.slice.call(arguments)))};
})(window);
