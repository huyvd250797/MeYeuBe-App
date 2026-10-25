/* V15.3.0: no automatic retries for writes with an unknown commit outcome. */
(function(w){
  'use strict';
  function target(c){return String(c.url||'').trim().replace(/\/+$/,'')+'|'+String(c.syncId||'').trim()}
  async function request(name,args){
    var c=loadCloudConfig(),destination=target(c);
    if(!c.enabled||!c.url||!c.anonKey||!c.syncId)throw new Error('Chưa cấu hình kết nối database.');
    if(!navigator.onLine)throw new Error('Mất mạng. Nội dung form được giữ để lưu lại.');
    var abort=new AbortController(),timer=setTimeout(function(){abort.abort()},20000);
    try{
      var res=await fetch(c.url.replace(/\/+$/,'')+'/rest/v1/rpc/'+name,{method:'POST',signal:abort.signal,headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey,'Content-Type':'application/json'},body:JSON.stringify(Object.assign({},args,{p_sync_id:c.syncId}))});
      var body=await res.json();
      if(destination!==target(loadCloudConfig())||!loadCloudConfig().enabled||loadCloudConfig().anonKey!==c.anonKey)throw new Error('Cấu hình đã thay đổi. Không sử dụng kết quả từ kết nối cũ.');
      if(!res.ok||!body||body.ok!==true){var e=new Error(body&&body.message||'Database từ chối thao tác.');e.code=body&&body.code||'DATABASE_ERROR';if(res.status===404||e.code==='PGRST202')e.message='Chưa cài API '+(name.indexOf('v1590')>=0?'Scoped Realtime V15.9.0':name.indexOf('v1570')>=0?'cài đặt và truy vấn V15.7.0':name.indexOf('v1560')>=0?'nhật ký và kế hoạch V15.6.0':name.indexOf('v1550')>=0?'sức khỏe V15.5.0':name.indexOf('v1540')>=0?'chăm sóc V15.4.0':'danh mục V15.3.0')+'. Hãy chạy migration theo README.';throw e}
      return {data:body,target:destination};
    }catch(e){if(e.name==='AbortError'||e instanceof TypeError){var writing=/(_write_|_apply_changes_)/.test(name),err=new Error(writing?'Chưa xác định được kết quả lưu. Giữ form và tải lại danh sách để đối chiếu trước khi thử lại.':'Không tải được dữ liệu từ database. Kiểm tra kết nối rồi thử lại.');err.code=writing?'UNKNOWN_OUTCOME':'NETWORK_ERROR';throw err}throw e}
    finally{clearTimeout(timer)}
  }
  w.mybDataClient={request:request,target:target};
})(window);
