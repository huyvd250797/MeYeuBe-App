module.exports=async function(w,ok){
 const fs=require('fs'),m=w.hb2Active(w.load()),db=w.load(),box=w.document.createElement('div');
 box.innerHTML=w.hb2ViewVaccine(db,m);
 ok('Vaccination has one compact header and no duplicate promotional hero',box.querySelectorAll('.vaxModuleHead').length===1&&!box.querySelector('.vaxHero')&&!box.textContent.includes('Module riêng'));
 ok('Vaccination overview has one Add Dose action',box.querySelectorAll('[onclick="hb2OpenVax()"]').length===1);
 w.hb2OpenQuickAdd();const modal=w.byId('hb2Modal');ok('Quick entry has one combined measurement action',modal.querySelectorAll('[onclick="hb2QuickMeas()"]').length===1&&modal.textContent.includes('Chiều cao'));w.hb2CloseModal();
 box.innerHTML=w.hb2ViewProfile(db,m);ok('Profile exposes birth certificate and social insurance Cloud attachment actions',box.innerHTML.includes('Giấy khai sinh')&&box.innerHTML.includes('BHXH')&&box.querySelector('.healthCloudHint'));
 const st=w.document.createElement('style');st.textContent=fs.readFileSync('src/styles/health-foundation.css','utf8');w.document.head.appendChild(st);const root=w.byId('hb2Root'),old=root.innerHTML;root.innerHTML=w.hb2ViewVaccine(db,m);
 ok('Vaccination container uses shrinkable grid rather than intrinsic minimum track',w.getComputedStyle(root.querySelector('.vaxModule')).gridTemplateColumns==='minmax(0,1fr)'&&parseFloat(w.getComputedStyle(root.querySelector('.vaxModule')).minWidth)===0);root.innerHTML=old;st.remove();
 if(w.mybMediaStorage){var kinds=true;for(const kind of ['Giấy khai sinh','BHXH']){w.hb2OpenAddFile(kind);kinds=kinds&&w.byId('hb2fKind').value===kind;w.hb2CloseModal()}ok('Real attachment form preselects birth certificate and social insurance correctly',kinds)}
 if(w.mybHealthPlanning){w.showPage('healthBook2');w.mybHealthProfileLayout.openPlan();ok('Planning exposes a working route back to profile',w.byId('healthPlanning').querySelector('[onclick="mybHealthPlanning.back()"]')&&await w.mybHealthPlanning.back()===true&&!w.byId('healthBook2').classList.contains('hidden'));w.mybHealthProfileLayout.openPlan();ok('Planning Close exits independently to the home route',w.mybHealthPlanning.close()===true&&w.byId('healthPlanning').classList.contains('hidden'))}
};
