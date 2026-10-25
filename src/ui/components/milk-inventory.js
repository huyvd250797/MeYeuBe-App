/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
function milkBagHtml(b,idx){
  var isActive=milkIsAvailable(b);
  var hi=Array.isArray(window.__milkAlertHighlightIds)&&window.__milkAlertHighlightIds.indexOf(String(b.id||b.shortId||''))>=0;
  var badge=milkBagBadge(b);
  var cls=((b.status==='Đã sử dụng hết'||b.status==='Đã chuyển hết')?'used finished ':'')+(milkExpireAt(b)<Date.now()?'expired ':'')+(isActive?'':'disabled ')+'u-'+badge.cls+(hi?' alertHighlight':'');
  var reason=(b.cancelReason||b.discardReason||'');
  var canTransfer=milkCanTransferFromInventory(b);
  var canCancel=isActive;
  var actionClass=canTransfer&&canCancel?' trio':((canTransfer||canCancel)?'':' single');
  var actions='<div class="milkSwipeActions">'+
    '<button type="button" class="milkSwipeEdit" onclick="event.stopPropagation();editMilkBagFromInventory('+idx+')"><i>✏️</i><span>Sửa</span></button>'+
    (canTransfer?'<button type="button" class="milkSwipeTransfer" onclick="event.stopPropagation();tfOpen('+idx+')"><i>🔄</i><span>Chuyển</span></button>':'')+
    (canCancel?'<button type="button" class="milkSwipeCancel" onclick="event.stopPropagation();cancelMilkBag('+idx+')"><i>🗑</i><span>Huỷ túi</span></button>':'')+
    '</div>';
  return '<div class="milkSwipeShell'+actionClass+'" data-milk-idx="'+idx+'" ontouchstart="milkSwipeStart(event,this)" ontouchmove="milkSwipeMove(event,this)" ontouchend="milkSwipeEnd(event,this)" onpointerdown="milkPointerStart(event,this)" onpointermove="milkPointerMove(event,this)" onpointerup="milkPointerEnd(event,this)" onpointercancel="milkPointerEnd(event,this)">'+actions+
    '<div class="milkBag '+cls+'" role="button" tabindex="0" onclick="openMilkBagDetail('+idx+')">'+
      '<div class="mbTop"><i class="mbDot"></i><b class="mbCode">'+esc(milkBagDisplayId(b))+'</b><span class="mbBadge">'+esc(badge.text)+'</span></div>'+
      milkBagAmountRowHtml(b)+
      milkBagMetaHtml(b)+
      (b.note?('<div class="mbGrid">'+milkBagCellsHtml(b)+'</div>'):'')+
      (reason?'<p class="mbReason">Lý do bỏ: '+esc(reason)+'</p>':'')+
      (typeof tfBagTraceHtml==='function'?tfBagTraceHtml(b):'')+
    '</div></div>';
}

function renderMilkInventory(db){var box=byId('milkInventoryBox');if(!box)return;var arr=(db.milkInventory||[]).map(function(b,i){var y=Object.assign({},b);y._idx=i;return y}).sort(function(a,b){var ar=(a.status==='Đang bảo quản'?0:(a.status==='Đã sử dụng hết'||a.status==='Đã chuyển hết')?1:2),br=(b.status==='Đang bảo quản'?0:(b.status==='Đã sử dụng hết'||b.status==='Đã chuyển hết')?1:2);return ar-br || milkExpireAt(a)-milkExpireAt(b)});if(!arr.length){box.innerHTML='<p class="notice">Chưa có kho sữa. Khi ghi nhận Hút sữa, app sẽ tự tạo túi sữa ở đây.</p>';return}box.innerHTML=arr.map(function(b){return mybUI.render('milk-card',b,b._idx)}).join('')}
mybUI.define('milk-card',{render:milkBagHtml});
w.milkBagHtml=function(){return mybUI.render.apply(null,['milk-card'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('milk-inventory',{render:renderMilkInventory});
w.renderMilkInventory=function(){return mybUI.render.apply(null,['milk-inventory'].concat(Array.prototype.slice.call(arguments)))};
})(window);
