(function(w){'use strict';var state=null,busy=false,KEY='mybSettingsPending_v1570';
function clone(x){return JSON.parse(JSON.stringify(x))}function pending(){return JSON.parse(localStorage.getItem(KEY)||'null')}
function groups(d){var p={},o={},keys=['lmp','babyName','officialName','babySex','birthDate','birthTime','birthTimeFrom','birthTimeTo','birthHospital','avatarDataUrl','showOfficialName','babyDescription'];Object.keys(d||{}).forEach(function(k){if(keys.indexOf(k)>=0)p[k]=d[k];else if(['dashboardConfig','theme','themeMode'].indexOf(k)<0)o[k]=d[k]});return {profile:p,dashboard:{dashboardConfig:d.dashboardConfig||{}},other:o}}
function stable(x){if(Array.isArray(x))return '['+x.map(stable).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(function(k){return JSON.stringify(k)+':'+stable(x[k])}).join(',')+'}';return JSON.stringify(x)}
async function get(){var r=await mybDataClient.request('myb_settings_get_v1570',{});state=clone(r.data);return r.data}
async function save(settings,base,version){if(!state)throw new Error('Chưa tải cài đặt từ database.');var old=groups(base||state.settings),next=groups(settings),patch={},expected=clone(version||state.expected);Object.keys(next).forEach(function(k){if(stable(old[k])!==stable(next[k]))patch[k]=next[k]});if(!Object.keys(patch).length)return null;return write({patch:patch,expected:expected})}
async function write(cmd){if(busy)throw new Error('Đang lưu cài đặt.');if([w.mybCareRepository,w.mybHealthRepository,w.mybPlanningRepository].some(function(r){return r&&r.pending()}))throw new Error('Kiểm tra thao tác chưa xác nhận trước khi lưu cài đặt.');busy=true;var handle;
try{handle=await mybSettingsBridge.begin();var target=mybDataClient.target(loadCloudConfig()),p=pending(),r;
if(p&&p.target!==target)throw new Error('Còn cài đặt chờ của kết nối khác.');
if(p){r=await mybDataClient.request('myb_settings_operation_v1570',{p_op_id:p.id});if(r.data.status!=='not_found'){state=clone(r.data);mybSettingsBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);if(stable(cmd)!==stable(p.command))throw new Error('Thao tác trước đã lưu. Tải lại và mở form trước khi sửa tiếp.');return r.data}if(stable(cmd)!==stable(p.command))throw new Error('Giữ nguyên nội dung để kiểm tra lần lưu trước.');}
else{p={id:crypto.randomUUID(),target:target,command:cmd};localStorage.setItem(KEY,JSON.stringify(p))}
try{r=await mybDataClient.request('myb_settings_write_v1570',{p_device_key:cloudDeviceId(),p_op_id:p.id,p_command:p.command})}catch(e){if(e.code&&e.code!=='UNKNOWN_OUTCOME')localStorage.removeItem(KEY);throw e}
if(!r.data.operationId||!r.data.expected)throw new Error('Chưa đủ phản hồi xác nhận cài đặt.');state=clone(r.data);mybSettingsBridge.accept(r.data,r.target,handle);localStorage.removeItem(KEY);return r.data;
}finally{if(handle)mybSettingsBridge.end(handle);busy=false}}
w.mybSettingsRepository={get:get,acceptState:function(s){state=clone(s)},state:function(){return clone(state)},save:save,pending:pending,isBusy:function(){return busy},recover:function(){var p=pending();return p?write(p.command):Promise.resolve(null)},groups:groups};
})(window);
