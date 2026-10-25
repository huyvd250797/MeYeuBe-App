/* V16.0: production form implementation; compatibility names delegate once. */
(function(w){'use strict';
function resetAppointmentForm(){['scheduleEditIndex','aTimeFrom','aTimeTo','aTitle','aPlace','aDoctor','aCost','aNote'].forEach(function(id){setValSafe(id,'')});setValSafe('aDate',today());setValSafe('aPerson','Mẹ');setValSafe('aStatus','Sắp tới');byId('scheduleFormTitle').textContent='Thêm lịch khám';byId('scheduleEditBadge').classList.add('hidden');fillAppointmentTypeOptions(load())}
mybUI.define('appointment-form-reset',{render:resetAppointmentForm});
w.resetAppointmentForm=function(){return mybUI.render.apply(null,['appointment-form-reset'].concat(Array.prototype.slice.call(arguments)))};
})(window);
