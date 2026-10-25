/* V16.3: one manual refresh, honest pending retries, no legacy snapshot import. */
(function(w){'use strict';
 var inFlight=false,dirty=new Map();
 function visible(e){for(var n=e;n&&n!==document.body;n=n.parentElement){if(n.hidden||n.classList.contains('hidden'))return false}return true}
 function snapshot(root){if(root)root.querySelectorAll('input,select,textarea').forEach(function(e){dirty.delete(e)})}
 document.addEventListener('input',function(e){var root=e.target.closest('#pregnancy,#scheduleAdd,#careAdd,#milestoneAdd,#planningDiary,#settings,#dashboardConfig,#milkContainer,#appointmentType,#diaryType,#cloudSync');if(root)dirty.set(e.target,{value:e.target.value,checked:e.target.checked})});
 // Acknowledged writes/reset clear the corresponding local form draft markers.
 ['resetPregnancyForm','resetAppointmentForm','resetCareForm','resetMilestoneForm'].forEach(function(k){var base=w[k];if(base)w[k]=function(){var r=base.apply(this,arguments);var roots={resetPregnancyForm:'pregnancy',resetAppointmentForm:'scheduleAdd',resetCareForm:'careAdd',resetMilestoneForm:'milestoneAdd'};snapshot(document.getElementById(roots[k]));return r}});
 var acknowledgedForms={saveCloudConfig:['cloudSync'],saveSettings:['settings'],saveDashboardConfig:['dashboardConfig'],saveDashboardConfigObject:['dashboardConfig'],saveMilkContainer:['milkContainer'],saveAppointmentType:['appointmentType']};
 Object.keys(acknowledgedForms).forEach(function(k){var base=w[k];if(!base)return;w[k]=function(){var result=base.apply(this,arguments);function clear(value){if(value===true)acknowledgedForms[k].forEach(function(id){snapshot(document.getElementById(id))});return value}return result&&typeof result.then==='function'?result.then(clear):clear(result)}});
 function hasVisibleDraft(){var found=false;dirty.forEach(function(state,e){if(!e.isConnected){dirty.delete(e);return}if(visible(e)&&e.value===state.value&&e.checked===state.checked)found=true;else if(e.value!==state.value||e.checked!==state.checked)dirty.delete(e)});return found}
 function pending(){return ['mybCareRepository','mybHealthRepository','mybPlanningRepository','mybSettingsRepository'].some(function(k){return w[k]&&(w[k].isBusy()||w[k].pending())})}
 function editing(){return hasVisibleDraft()||pending()||(w.mybPlanningUi&&mybPlanningUi.hasDraft())||(w.mybScopedUi&&mybScopedUi.hasDraft())||!!document.querySelector('.careFormOverlay.show,.tfOverlay.show,.hb2Modal:not(.hidden),.feedDoneOverlay.show')}
 function sync(){var b=document.getElementById('retryPendingCloud');if(!b)return;var queue=w.mybRelationalRealtimeV1577&&mybRelationalRealtimeV1577.queueAll;if(queue)queue().then(function(rows){b.hidden=!rows.length;b.disabled=inFlight}).catch(function(){b.hidden=true})}
 async function refresh(){if(inFlight)return false;if(editing()){showToast('Hãy lưu hoặc đóng nội dung đang sửa và đối chiếu dữ liệu chờ trước khi tải lại.','warn');return false}inFlight=true;try{return await pullCloudToLocal()}finally{inFlight=false;sync()}}
 async function retryPending(){if(inFlight||pending())return false;inFlight=true;try{await mybRelationalRealtimeV1577.flush('manual_retry');return true}catch(e){showToast(e.message||'Chưa gửi được dữ liệu chờ.','error');return false}finally{inFlight=false;sync()}}
 function blocked(){showToast('Nhập hoặc ghi đè JSON cũ đã ngừng hỗ trợ. Bản sao lưu và dữ liệu gốc vẫn được giữ.','warn');return false}
 // Keep callable adapters for old links, but never claim a snapshot restore succeeded.
 ['importDB','bkConfirmImport','bkConfirmRestore','startDeleteFlow','confirmDeleteText','clearDB'].forEach(function(k){w[k]=blocked});
 w.mybCloudControls={refresh:refresh,retryPending:retryPending,isEditing:editing,sync:sync};
 var render=w.renderCloudConfig;if(render)w.renderCloudConfig=function(){var result=render.apply(this,arguments);sync();return result};sync();
})(window);
