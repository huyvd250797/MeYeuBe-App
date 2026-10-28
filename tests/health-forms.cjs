module.exports=async function(w,ok){
 const pause=()=>new Promise(r=>setTimeout(r,0)),by=id=>w.document.getElementById(id);
 const before=JSON.stringify(w.load().hb.members),names=['hb2OpenAddMember','hb2OpenEditBasic','hb2OpenEditMedical','hb2OpenEditHistory','hb2OpenNote','hb2QuickMeas','hb2OpenVisit','hb2OpenMed','hb2OpenVax','hb2OpenLab'];
 if(w.mybMediaStorage)names.push('hb2OpenAddFile');
 let shells=0;for(const name of names){w[name]();await pause();const box=by('hb2Modal');if(box.querySelectorAll('.healthFormFooter').length===1&&box.querySelector('.healthFormFooter').firstElementChild.id==='hb2ModalCancel'&&by('hb2ModalOwner').textContent) shells++;w.hb2CloseModal()}
 ok('Every opened health form has one owner header and Cancel/Save footer',shells===names.length);
 w.hb2OpenAddMember();ok('New member form cannot be mistaken for the active profile',by('hb2ModalOwner').textContent==='Thành viên mới');w.hb2CloseModal();
 w.hb2QuickMeas();await pause();const input=by('h155weight');
 ok('Measurement IDs and decimal input survive grouping',input.closest('fieldset')&&input.step==='any'&&input.inputMode==='decimal'&&input.closest('label').htmlFor===input.id);
 ok('Manual health writer enables shared Save and Cancel wording',!by('hb2ModalSave').classList.contains('hidden')&&by('hb2ModalCancel').textContent==='Hủy');
 input.value='6.325';by('hb2ModalBody').appendChild(w.document.createElement('p'));await pause();ok('Body updates keep entered values and exactly one footer',by('h155weight').value==='6.325'&&by('hb2Modal').querySelectorAll('.healthFormFooter').length===1);w.hb2CloseModal();
 w.hb2Modal('Chỉ xem','<p>Nội dung hồ sơ</p>',null);await pause();ok('Read-only health panel has Close and no visible Save',by('hb2ModalCancel').textContent==='Đóng'&&by('hb2ModalSave').classList.contains('hidden'));w.hb2CloseModal();
 ok('Opening and cancelling unified health forms never changes records',JSON.stringify(w.load().hb.members)===before);
};
