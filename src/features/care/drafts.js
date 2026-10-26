/* V17.0: device-local drafts, isolated by database URL + Sync ID + stable record ID.
   No network, business writes or secrets. Per-draft revision avoids overwriting another tab. */
(function(w){'use strict';
 var PREFIX='mybCareDraft_v1700:';
 function key(target,id){return PREFIX+encodeURIComponent(target)+':'+encodeURIComponent(id)}
 function broken(raw){var e=new Error('Bản nháp không đọc được. Chưa ghi đè nội dung cũ.');e.code='DRAFT_CORRUPT';e.raw=raw;return e}
 function get(target,id){var raw=localStorage.getItem(key(target,id));if(!raw)return null;var row;try{row=JSON.parse(raw)}catch(e){throw broken(raw)}if(row.schema!==1||row.target!==target||row.key!==id||!row.data||!row.data.form||!row.data.session||!row.data.form.fields||!['feed','pump','sleep','diaper','medicine','temperature','spitup'].includes(row.data.form.type)||!row.revision)throw broken(raw);return row}
 function put(target,id,data,revision){var old=get(target,id);if((old&&old.revision||null)!==(revision||null))throw new Error('Bản nháp vừa được thay đổi ở tab khác. Giữ form này và kiểm tra tab còn lại.');var row={schema:1,target:target,key:id,revision:crypto.randomUUID(),savedAt:new Date().toISOString(),data:JSON.parse(JSON.stringify(data))},raw=JSON.stringify(row);if(raw.length>100000)throw new Error('Bản nháp quá lớn. Hãy giữ form và lưu khi có mạng.');try{localStorage.setItem(key(target,id),raw)}catch(e){throw new Error('Không giữ được nháp trên thiết bị. Hãy giữ form và lưu trước khi đóng app.')}return row}
 function remove(target,id,revision){var old=get(target,id);if(old&&(old.revision!==(revision||null)))throw new Error('Bản nháp vừa thay đổi ở tab khác; chưa xóa nháp đó.');localStorage.removeItem(key(target,id))}
 function list(target){var rows=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(PREFIX+encodeURIComponent(target)+':')===0){var raw=localStorage.getItem(k);try{var r=JSON.parse(raw);if(r.schema===1&&r.target===target&&r.data)rows.push(r)}catch(e){}}}return rows.sort(function(a,b){return b.savedAt.localeCompare(a.savedAt)})}
 function removeBroken(target,id,raw){if(localStorage.getItem(key(target,id))!==raw)throw new Error('Bản nháp đã thay đổi; chưa xóa nội dung mới.');localStorage.removeItem(key(target,id))}
 w.mybCareDraftStore={removeBroken:removeBroken,get:get,put:put,remove:remove,list:list};
})(window);
