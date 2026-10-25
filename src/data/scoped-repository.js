(function(w){'use strict';var full=true,loading=null,epoch=0,cache=new Map();
function target(){return mybDataClient.target(loadCloudConfig())}
async function summary(from,to,force){var key=target()+'|'+from+'|'+to,c=cache.get(key);if(!force&&c&&Date.now()-c.at<15000)return c.data;var dest=target(),started=epoch,r=await mybDataClient.request('myb_scoped_summary_v1570',{p_query:{from:from,to:to}});if(started!==epoch)throw new Error('Dữ liệu vừa thay đổi. Tải lại số liệu.');if(dest!==target())throw new Error('Kết nối đã đổi.');cache.set(key,{at:Date.now(),data:r.data});return r.data}
async function ensureFull(){if(w.load()._scopeComplete!==false){full=true;return}if(loading)return loading;full=true;loading=(async function(){try{await mybScopedBridge.loadFull();if(w.load()._scopeComplete===false)throw new Error('Chưa tải đủ lịch sử. Thử lại.')}catch(e){full=false;throw e}finally{loading=null}})();return loading}
function invalidate(){epoch++;cache.clear()}
w.mybScopedRepository={applyDevice:function(db){db.settings=db.settings||{};db.settings.themeMode=localStorage.getItem('mybThemeMode_v1570')||'auto';db.settings.theme=th7Resolve(db.settings.themeMode);return db},summary:summary,ensureFull:ensureFull,needsFull:function(){return full},reset:function(){full=true;invalidate()},invalidate:invalidate,epoch:function(){return epoch},isBusy:function(){return !!loading}};
})(window);
