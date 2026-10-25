/* Feature adapter: layout/update dependencies are owned by the UI coordinator. */
(function(w){'use strict';
 async function refresh(scopes){await mybUI.updates.refresh(scopes);if(scopes.indexOf('settings')>=0){var page=document.querySelector('.page:not(.hidden)');if(page&&['settings','dashboardConfig'].indexOf(page.id)>=0){var note=byId('realtimeSettingsNote');if(!note){note=document.createElement('p');note.id='realtimeSettingsNote';note.className='notice';note.setAttribute('role','status');page.prepend(note)}note.textContent='Cài đặt vừa thay đổi trên thiết bị khác. Bấm Tải lại cài đặt để xem bản mới trước khi sửa.'}}}
 w.mybRealtimeUi={refresh:refresh};
})(window);
