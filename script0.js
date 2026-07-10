var KEY='meYeuBePWA_v4';
function localDateISO(date){
  var d=date||new Date();
  var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function today(){return localDateISO(new Date())}
function load(){try{var db=JSON.parse(localStorage.getItem(KEY)); if(db) return normalize(db);}catch(e){}; try{var old=JSON.parse(localStorage.getItem('meYeuBePWA_v1')); if(old){localStorage.setItem(KEY,JSON.stringify(normalize(old))); return normalize(old)}}catch(e){}; return normalize({});}
function defaultAppointmentTypes(){return [
  {id:'default_kham_thai',name:'Khám thai',icon:'🤰',desc:'Lịch khám thai định kỳ',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'default_sieu_am',name:'Siêu âm',icon:'🩻',desc:'Lịch siêu âm, kiểm tra hình thái hoặc tăng trưởng',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'default_xet_nghiem',name:'Xét nghiệm',icon:'🧪',desc:'Lịch xét nghiệm máu, nước tiểu hoặc các xét nghiệm liên quan',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'default_tiem_ngua',name:'Tiêm ngừa',icon:'💉',desc:'Lịch tiêm cho mẹ hoặc bé',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'default_kham_nhi',name:'Khám nhi',icon:'👶',desc:'Lịch khám sau sinh hoặc khám nhi',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
]}
function defaultDiaryTypes(){return [
  {id:'diary_hospital',name:'Nhập viện',icon:'🏥',desc:'Các mốc nhập viện, phòng sinh, chuyển khoa',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'diary_checkup',name:'Khám',icon:'🩺',desc:'Khám, siêu âm, tư vấn bác sĩ',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'diary_moment',name:'Khoảnh khắc',icon:'📷',desc:'Khoảnh khắc đáng nhớ của mẹ và bé',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'diary_care',name:'Chăm sóc',icon:'🍼',desc:'Ăn uống, bú, ngủ, sinh hoạt',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
  {id:'diary_other',name:'Khác',icon:'❤️',desc:'Các ghi chú khác',active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
]}
function normalize(db){db=db||{};db.settings=db.settings||{};db.pregnancy=db.pregnancy||[];db.baby=db.baby||[];db.mom=db.mom||[];db.diary=db.diary||[];db.healthBook=db.healthBook||[];db.appointments=db.appointments||[];db.careEvents=Array.isArray(db.careEvents)?db.careEvents:[];db.milkInventory=Array.isArray(db.milkInventory)?db.milkInventory:[];db.appointmentTypes=Array.isArray(db.appointmentTypes)?db.appointmentTypes:defaultAppointmentTypes();db.diaryTypes=Array.isArray(db.diaryTypes)?db.diaryTypes:defaultDiaryTypes();db.milkInventory=db.milkInventory.map(function(b){b=b||{};if(b.status==='Đã sử dụng')b.status='Đang bảo quản';return b});db.careEvents=db.careEvents.map(function(e){e=e||{};if(e.status==='Đã sử dụng')e.status='Đang bảo quản';return e});db.healthBook=db.healthBook.map(function(x){x=x||{};if(!Array.isArray(x.historyLogs))x.historyLogs=[];if(!Array.isArray(x.vaccines)){x.vaccines=[];if(x.vaccine||x.vaccinePurpose)x.vaccines.push({vaccine:x.vaccine||'',dose:'',purpose:x.vaccinePurpose||''})}return x});return db}
function save(db){
  db=normalize(db);
  db._localUpdatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(db));
  render();
  try{cloudAutoPush(db)}catch(e){}
}
function byId(id){return document.getElementById(id)}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function daysBetween(a,b){if(!a||!b)return 0;var A=new Date(a+'T00:00:00'),B=new Date(b+'T00:00:00');return Math.floor((B-A)/86400000)}
function fmtDate(d){if(!d)return 'Chưa nhập';try{return new Date(d+'T00:00:00').toLocaleDateString('vi-VN')}catch(e){return d}}
function weekdayName(d){if(!d)return '--';try{return new Date(d+'T00:00:00').toLocaleDateString('vi-VN',{weekday:'long'})}catch(e){return '--'}}
function todayFullText(){return weekdayName(today())+', '+fmtDate(today())}
function pregnancyAgeAt(lmp,refDate){if(!lmp||!refDate)return null;var d=daysBetween(lmp,refDate);if(d<0)return null;return {w:Math.floor(d/7),day:d%7,total:d}}
function pregnancyAge(lmp){return pregnancyAgeAt(lmp,today())}
function dueDateISO(lmp){if(!lmp)return '';var d=new Date(lmp+'T00:00:00');d.setDate(d.getDate()+280);return d.toISOString().slice(0,10)}
function dueDate(lmp){var iso=dueDateISO(lmp);return iso?fmtDate(iso):''}
function dueDaysText(lmp){var iso=dueDateISO(lmp);if(!iso)return '--';var n=daysBetween(today(),iso);if(n>0)return 'Còn '+n+' ngày nữa';if(n===0)return 'Hôm nay là ngày dự sinh';return 'Đã qua dự sinh '+Math.abs(n)+' ngày'}
function babyAge(birth){if(!birth)return '';var d=daysBetween(birth,today());if(d<0)return '';var m=Math.floor(d/30.4375);var days=Math.max(0,Math.round(d-m*30.4375));return m+' tháng '+days+' ngày'}
function nextBirthdayInfo(birth){if(!birth)return null;var now=new Date(),parts=String(birth).split('-');if(parts.length<3)return null;var m=Number(parts[1])-1,day=Number(parts[2]);var target=new Date(now.getFullYear(),m,day);var todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(target<todayStart)target=new Date(now.getFullYear()+1,m,day);var days=Math.round((target-todayStart)/86400000);var age=target.getFullYear()-Number(parts[0]);return {days:days,age:age,date:localDateISO(target)}}
function showAppLoading(){
  var l=byId('appLoading');
  if(!l)return;
  l.classList.add('show');
  l.setAttribute('aria-hidden','false');
}
function hideAppLoading(){
  var l=byId('appLoading');
  if(!l)return;
  l.classList.remove('show');
  l.setAttribute('aria-hidden','true');
}
function showToast(message,type){
  var wrap=byId('toastWrap');if(!wrap)return;
  var node=document.createElement('div');
  var t=type||'success';
  node.className='toast '+t;
  node.textContent=message||((t==='error')?'Không thành công':'Thành công');
  wrap.appendChild(node);
  setTimeout(function(){node.style.animation='toastOut .22s ease forwards';setTimeout(function(){if(node.parentNode)node.parentNode.removeChild(node)},240)},2600);
}
function isModuleNavClick(el){
  return !!(el && el.classList && el.classList.contains('navItem') && el.getAttribute('data-page'));
}
function showPage(id,el,skipLoading){
  var shouldLoad=!skipLoading && isModuleNavClick(el);
  if(shouldLoad){showAppLoading();setTimeout(function(){doShowPage(id,el)},500);return}
  doShowPage(id,el);
}
function doShowPage(id,el){document.querySelectorAll('.page').forEach(function(p){p.classList.add('hidden')});var page=byId(id);if(page)page.classList.remove('hidden');document.querySelectorAll('.navItem').forEach(function(t){t.classList.remove('active')});var target=el||document.querySelector('.navItem[data-page="'+id+'"]');if(target)target.classList.add('active');if(id==='pregnancy'||id==='pregnancyStats'||id==='pregnancyChart')openPregnancyMenu();if(id==='baby'||id==='babyStats'||id==='babyChart')openBabyMenu();if(id==='diary'||id==='diaryBook')openDiaryMenu();if(id==='healthBook'||id==='healthBookView')openHealthBookMenu();if(id==='scheduleAdd'||id==='scheduleList'||id==='scheduleCalendar')openScheduleMenu();if(id==='careAdd'||id==='careTimeline'||id==='careStats')openCareMenu();if(id==='appointmentType'||id==='diaryType')openCategoryMenu();if(id==='data')updateBackup();if(id==='dashboardConfig')renderDashboardConfig();closeMenu();window.scrollTo(0,0);syncBottomNav(id);hideAppLoading()}
function goTab(id){showPage(id,document.querySelector('.navItem[data-page=\"'+id+'\"]'))}
function goHome(){showPage('home',document.querySelector('.navItem[data-page=\"home\"]'))}
function togglePregnancyMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('pregnancyParent');
  var sub=byId('pregnancySubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('pregOpen',willOpen);
}
function openPregnancyMenu(){
  var parent=byId('pregnancyParent');
  var sub=byId('pregnancySubNav');
  if(parent)parent.classList.add('pregOpen');
  if(sub)sub.classList.add('open');
}
function toggleBabyMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('babyParent');
  var sub=byId('babySubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('babyOpen',willOpen);
}
function openBabyMenu(){
  var parent=byId('babyParent');
  var sub=byId('babySubNav');
  if(parent)parent.classList.add('babyOpen');
  if(sub)sub.classList.add('open');
}
function toggleDiaryMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('diaryParent');
  var sub=byId('diarySubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('diaryOpen',willOpen);
}
function openDiaryMenu(){
  var parent=byId('diaryParent');
  var sub=byId('diarySubNav');
  if(parent)parent.classList.add('diaryOpen');
  if(sub)sub.classList.add('open');
}
function toggleHealthBookMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('healthBookParent');
  var sub=byId('healthBookSubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('healthBookOpen',willOpen);
}
function openHealthBookMenu(){
  var parent=byId('healthBookParent');
  var sub=byId('healthBookSubNav');
  if(parent)parent.classList.add('healthBookOpen');
  if(sub)sub.classList.add('open');
}
function toggleSettingsPanel(){goTab('settings')}
function toggleScheduleMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('scheduleParent'),sub=byId('scheduleSubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('scheduleOpen',willOpen);
}
function openScheduleMenu(){
  var parent=byId('scheduleParent'),sub=byId('scheduleSubNav');
  if(parent)parent.classList.add('scheduleOpen');
  if(sub)sub.classList.add('open');
}
function toggleCareMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('careParent'),sub=byId('careSubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('careOpen',willOpen);
}
function openCareMenu(){
  var parent=byId('careParent'),sub=byId('careSubNav');
  if(parent)parent.classList.add('careOpen');
  if(sub)sub.classList.add('open');
}
function toggleCategoryMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('categoryParent'),sub=byId('categorySubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('categoryOpen',willOpen);
}
function openCategoryMenu(){
  var parent=byId('categoryParent'),sub=byId('categorySubNav');
  if(parent)parent.classList.add('categoryOpen');
  if(sub)sub.classList.add('open');
}
function openMenu(){document.body.classList.add('menuOpen')}
function closeMenu(){document.body.classList.remove('menuOpen')}
document.addEventListener('touchmove',function(e){
  if(!document.body.classList.contains('menuOpen'))return;
  var side=document.querySelector('.sidebar');
  if(side && side.contains(e.target))return;
  e.preventDefault();
},{passive:false});
function saveSettings(){var db=load();db.settings=db.settings||{};db.settings.lmp=byId('lmp').value;db.settings.birthDate=byId('birthDate').value;db.settings.birthTimeFrom=byId('birthTimeFrom')?byId('birthTimeFrom').value:(db.settings.birthTime||'');db.settings.birthTimeTo=byId('birthTimeTo')?byId('birthTimeTo').value:'';db.settings.birthTime=db.settings.birthTimeFrom;db.settings.birthHospital=byId('birthHospital')?byId('birthHospital').value:'';db.settings.babyName=byId('babyName').value;db.settings.officialName=byId('officialName').value;db.settings.showOfficialName=!!(byId('showOfficialName')&&byId('showOfficialName').checked);db.settings.theme=document.documentElement.getAttribute('data-theme')||'';save(db);alert('Đã lưu thiết lập')}
function setVal(id,v){if(byId(id))byId(id).value=(v===undefined||v===null)?'':String(v)}
function timeFromOf(x){return (x&&(x.timeFrom||x.fromTime||x.time))||''}
function timeToOf(x){return (x&&(x.timeTo||x.toTime))||''}
function timeRangeOf(x){var f=timeFromOf(x),t=timeToOf(x);return f?(t?f+' - '+t:f):''}
function timeRankOf(x){return timeFromOf(x)||''}
function birthTimeRange(s){var f=(s&&(s.birthTimeFrom||s.birthTime))||'',t=(s&&s.birthTimeTo)||'';return f?(t?f+' - '+t:f):''}

function addHealthVaccineRow(data){
  var box=byId('hbVaccineRows');if(!box)return;
  data=data||{};
  var row=document.createElement('div');
  row.className='vaccineRow';
  row.innerHTML='<div><label>Vaccine</label><input class="hbVacName" placeholder="Ví dụ: Viêm gan B" value="'+esc(data.vaccine||'')+'"></div>'+
    '<div><label>Mũi thứ</label><input class="hbVacDose" placeholder="1" value="'+esc(data.dose||'')+'"></div>'+
    '<div><label>Ngừa bệnh / Mục đích</label><input class="hbVacPurpose" placeholder="Ví dụ: Phòng viêm gan B" value="'+esc(data.purpose||'')+'"></div>'+
    '<button type="button" class="danger" onclick="removeHealthVaccineRow(this)">Xóa</button>';
  box.appendChild(row);
}
function removeHealthVaccineRow(btn){var row=btn&&btn.closest?btn.closest('.vaccineRow'):null;if(row)row.remove()}
function setHealthVaccineRows(rows){var box=byId('hbVaccineRows');if(!box)return;box.innerHTML='';(rows||[]).forEach(function(r){addHealthVaccineRow(r)});}
function getHealthVaccineRows(){var box=byId('hbVaccineRows');if(!box)return [];return Array.prototype.slice.call(box.querySelectorAll('.vaccineRow')).map(function(row){return {vaccine:(row.querySelector('.hbVacName')||{}).value||'',dose:(row.querySelector('.hbVacDose')||{}).value||'',purpose:(row.querySelector('.hbVacPurpose')||{}).value||''}}).map(function(x){x.vaccine=x.vaccine.trim();x.dose=x.dose.trim();x.purpose=x.purpose.trim();return x}).filter(function(x){return x.vaccine||x.dose||x.purpose})}
function vaccineSummary(rows,field){rows=rows||[];return rows.map(function(v){return v[field]||''}).filter(Boolean).join('; ')}
function vaccineListHtml(rows){rows=rows||[];if(!rows.length)return '';return '<div class="vaccineList">'+rows.map(function(v){return '<div class="vaccineItem"><b>💉 '+esc(v.vaccine||'Vaccine')+(v.dose?' · Mũi '+esc(v.dose):'')+'</b><small>'+(v.purpose?'Ngừa bệnh/Mục đích: '+esc(v.purpose):'Chưa nhập ngừa bệnh/mục đích')+'</small></div>'}).join('')+'</div>'}

function resetPregnancyForm(){setVal('pregnancyEditIndex','');setVal('pDate',today());['pWeek','pWeight','pBpd','pHc','pAc','pFl','pAfi','pPosition','pNote'].forEach(function(id){setVal(id,'')});byId('pregnancyFormTitle').textContent='Thêm chỉ số thai kỳ';byId('pregnancyEditBadge').classList.add('hidden')}
function resetBabyForm(){setVal('babyEditIndex','');setVal('bDate',today());['bWeight','bLength','bHead','bFeed','bSleep','bNote'].forEach(function(id){setVal(id,'')});byId('babyFormTitle').textContent='Thêm chỉ số sau sinh';byId('babyEditBadge').classList.add('hidden')}
function resetMomForm(){setVal('momEditIndex','');setVal('mDate',today());['mWeight','mBp','mNote'].forEach(function(id){setVal(id,'')});byId('momFormTitle').textContent='Sức khỏe mẹ';byId('momEditBadge').classList.add('hidden')}
function resetDiaryFormCore(){setVal('diaryEditIndex','');setVal('dDate',today());setVal('dTimeFrom','');setVal('dTimeTo','');['dTitle','dNote'].forEach(function(id){setVal(id,'')});setVal('dCategory','');byId('diaryFormTitle').textContent='Thêm nhật ký';byId('diaryEditBadge').classList.add('hidden');var back=byId('diaryBackBookBtn');if(back)back.classList.add('hidden')}
function resetDiaryForm(){if(window.__diaryReturnToBook){var idx=byId('diaryEditIndex').value;window.__diaryReturnToBook=false;resetDiaryFormCore();openDiaryBookHighlight(idx)}else{resetDiaryFormCore()}}
function resetHealthBookForm(){setVal('healthBookEditIndex','');setVal('hbDate',today());setVal('hbPerson','Con');['hbFullName','hbDob','hbBlood','hbHeight','hbWeight','hbBodyMeasure','hbBmi','hbAllergy','hbHistory','hbMedicine','hbVaccine','hbVaccinePurpose','hbDoctor','hbInsurance','hbNote'].forEach(function(id){setVal(id,'')});setHealthVaccineRows([]);byId('healthBookFormTitle').textContent='Thêm sổ sức khỏe';byId('healthBookEditBadge').classList.add('hidden')}
function savePregnancy(){var req=[['pDate','Ngày khám'],['pWeek','Tuần thai'],['pWeight','Cân nặng ước lượng'],['pBpd','BPD'],['pHc','HC'],['pAc','AC'],['pFl','FL'],['pAfi','Nước ối/AFI'],['pPosition','Ngôi thai']];var missing=[];req.forEach(function(r){if(!byId(r[0]).value.trim())missing.push(r[1])});if(missing.length){alert('Vui lòng nhập đủ thông tin bắt buộc:\n- '+missing.join('\n- '));return}var db=load();var item={date:byId('pDate').value,week:byId('pWeek').value.trim(),weight:byId('pWeight').value.trim(),bpd:byId('pBpd').value.trim(),hc:byId('pHc').value.trim(),ac:byId('pAc').value.trim(),fl:byId('pFl').value.trim(),afi:byId('pAfi').value.trim(),position:byId('pPosition').value.trim(),note:byId('pNote').value.trim(),updatedAt:new Date().toISOString()};var idx=byId('pregnancyEditIndex').value;if(idx!==''){item.createdAt=db.pregnancy[Number(idx)].createdAt||item.updatedAt;db.pregnancy[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.pregnancy.unshift(item)}save(db);resetPregnancyForm()}
function saveBaby(){var db=load();var item={date:byId('bDate').value||today(),weight:byId('bWeight').value,length:byId('bLength').value,head:byId('bHead').value,feed:byId('bFeed').value,sleep:byId('bSleep').value,note:byId('bNote').value,updatedAt:new Date().toISOString()};var idx=byId('babyEditIndex').value;if(idx!==''){item.createdAt=db.baby[Number(idx)].createdAt||item.updatedAt;db.baby[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.baby.unshift(item)}save(db);resetBabyForm()}
function saveMom(){var db=load();var item={date:byId('mDate').value||today(),weight:byId('mWeight').value,bp:byId('mBp').value,note:byId('mNote').value,updatedAt:new Date().toISOString()};var idx=byId('momEditIndex').value;if(idx!==''){item.createdAt=db.mom[Number(idx)].createdAt||item.updatedAt;db.mom[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.mom.unshift(item)}save(db);resetMomForm()}
function saveDiary(){var title=byId('dTitle').value.trim(),note=byId('dNote').value.trim();var catId=byId('dCategory').value;var timeFrom=byId('dTimeFrom')?byId('dTimeFrom').value:'';var timeTo=byId('dTimeTo')?byId('dTimeTo').value:'';if(!catId){showToast('Vui lòng chọn Loại nhật ký','warn');return}if(!timeFrom){showToast('Vui lòng chọn Từ giờ','warn');return}if(timeTo&&timeTo<timeFrom){showToast('Đến giờ không được nhỏ hơn Từ giờ','warn');return}if(!title&&!note){showToast('Vui lòng nhập Tiêu đề hoặc Nội dung nhật ký','warn');return}var db=load();var type=(db.diaryTypes||[]).find(function(t){return t.id===catId})||{};var item={date:byId('dDate').value||today(),time:timeFrom,timeFrom:timeFrom,timeTo:timeTo,categoryId:catId,category:type.name||catId,categoryIcon:type.icon||'',title:title,note:note,updatedAt:new Date().toISOString()};var idx=byId('diaryEditIndex').value;var returnToBook=!!window.__diaryReturnToBook;if(idx!==''&&db.diary[Number(idx)]){item.createdAt=db.diary[Number(idx)].createdAt||item.updatedAt;db.diary[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.diary.unshift(item);idx=0}save(db);window.__diaryReturnToBook=false;resetDiaryFormCore();showToast(returnToBook?'Cập nhật nhật ký thành công':'Lưu nhật ký thành công','success');if(returnToBook){openDiaryBookHighlight(idx)}}
function healthBookSnapshot(item){
  return {
    date:item.date||today(),
    fullName:item.fullName||'',
    dob:item.dob||'',
    blood:item.blood||'',
    height:item.height||'',
    weight:item.weight||'',
    bodyMeasure:item.bodyMeasure||'',
    bmi:item.bmi||'',
    allergy:item.allergy||'',
    history:item.history||'',
    medicine:item.medicine||'',
    vaccine:item.vaccine||'',
    vaccinePurpose:item.vaccinePurpose||'',
    doctor:item.doctor||'',
    insurance:item.insurance||'',
    note:item.note||'',
    loggedAt:new Date().toISOString()
  };
}
function saveHealthBook(){var db=load();var person=byId('hbPerson').value||'Con';var now=new Date().toISOString();var vaccines=getHealthVaccineRows();var item={person:person,fullName:byId('hbFullName').value.trim(),dob:byId('hbDob').value,date:byId('hbDate').value||today(),blood:byId('hbBlood').value.trim(),height:byId('hbHeight').value.trim(),weight:byId('hbWeight').value.trim(),bodyMeasure:byId('hbBodyMeasure').value.trim(),bmi:byId('hbBmi').value.trim(),allergy:byId('hbAllergy').value.trim(),history:byId('hbHistory').value.trim(),medicine:byId('hbMedicine').value.trim(),vaccines:vaccines,vaccine:vaccineSummary(vaccines,'vaccine'),vaccinePurpose:vaccineSummary(vaccines,'purpose'),doctor:byId('hbDoctor').value.trim(),insurance:byId('hbInsurance').value.trim(),note:byId('hbNote').value.trim(),updatedAt:now};var idx=byId('healthBookEditIndex').value;if(idx!==''){var old=db.healthBook[Number(idx)]||{};item.createdAt=old.createdAt||now;item.historyLogs=Array.isArray(old.historyLogs)?old.historyLogs.slice():[];item.historyLogs.unshift(healthBookSnapshot(item));db.healthBook[Number(idx)]=item}else{item.createdAt=now;item.historyLogs=[healthBookSnapshot(item)];db.healthBook.unshift(item)}save(db);resetHealthBookForm();showToast('Lưu sổ sức khỏe thành công','success')}
function editPregnancy(i){var x=load().pregnancy[i];if(!x)return;setVal('pregnancyEditIndex',i);setVal('pDate',x.date);setVal('pWeek',x.week);setVal('pWeight',x.weight);setVal('pBpd',x.bpd);setVal('pHc',x.hc);setVal('pAc',x.ac);setVal('pFl',x.fl);setVal('pAfi',x.afi);setVal('pPosition',x.position);setVal('pNote',x.note);byId('pregnancyFormTitle').textContent='Sửa chỉ số thai kỳ';byId('pregnancyEditBadge').classList.remove('hidden');goTab('pregnancy');window.scrollTo(0,0)}
function editBaby(i){var x=load().baby[i];if(!x)return;setVal('babyEditIndex',i);setVal('bDate',x.date);setVal('bWeight',x.weight);setVal('bLength',x.length);setVal('bHead',x.head);setVal('bFeed',x.feed);setVal('bSleep',x.sleep);setVal('bNote',x.note);byId('babyFormTitle').textContent='Sửa chỉ số sau sinh';byId('babyEditBadge').classList.remove('hidden');goTab('baby');window.scrollTo(0,0)}
function editMom(i){var x=load().mom[i];if(!x)return;setVal('momEditIndex',i);setVal('mDate',x.date);setVal('mWeight',x.weight);setVal('mBp',x.bp);setVal('mNote',x.note);byId('momFormTitle').textContent='Sửa sức khỏe mẹ';byId('momEditBadge').classList.remove('hidden');goTab('health');window.scrollTo(0,0)}
function setDiaryCategoryValue(x){var db=load(),select=byId('dCategory');if(!select)return;fillDiaryTypeOptions(db,x&&x.categoryId);var target=(x&&x.categoryId)||'';if(!target&&x&&x.category){var found=(db.diaryTypes||[]).find(function(t){return t.name===x.category});target=found?found.id:'';if(!target){var opt=document.createElement('option');opt.value=x.category;opt.textContent=x.category+' (cũ)';select.appendChild(opt);target=x.category}}setVal('dCategory',target)}
function editDiary(i,fromBook){var x=load().diary[i];if(!x)return;setVal('diaryEditIndex',i);setVal('dDate',x.date);setVal('dTimeFrom',timeFromOf(x));setVal('dTimeTo',timeToOf(x));setDiaryCategoryValue(x);setVal('dTitle',x.title);setVal('dNote',x.note);byId('diaryFormTitle').textContent='Cập nhật nhật ký';byId('diaryEditBadge').classList.remove('hidden');var back=byId('diaryBackBookBtn');if(back)back.classList.toggle('hidden',!fromBook);goTab('diary');window.scrollTo(0,0)}
function editDiaryFromBook(i){window.__diaryReturnToBook=true;window.__diaryHighlightIndex=i;editDiary(i,true)}
function backToDiaryBookFromEdit(){var idx=byId('diaryEditIndex').value;window.__diaryReturnToBook=false;resetDiaryFormCore();openDiaryBookHighlight(idx)}
function editHealthBook(i){var x=load().healthBook[i];if(!x)return;setVal('healthBookEditIndex',i);setVal('hbPerson',x.person||'Con');setVal('hbFullName',x.fullName||'');setVal('hbDob',x.dob||'');setVal('hbDate',x.date);setVal('hbBlood',x.blood);setVal('hbHeight',x.height);setVal('hbWeight',x.weight);setVal('hbBodyMeasure',x.bodyMeasure);setVal('hbBmi',x.bmi);setVal('hbAllergy',x.allergy);setVal('hbHistory',x.history);setVal('hbMedicine',x.medicine);setVal('hbVaccine',x.vaccine);setVal('hbVaccinePurpose',x.vaccinePurpose||'');setHealthVaccineRows(Array.isArray(x.vaccines)?x.vaccines:(x.vaccine||x.vaccinePurpose?[{vaccine:x.vaccine||'',dose:'',purpose:x.vaccinePurpose||''}]:[]));setVal('hbDoctor',x.doctor);setVal('hbInsurance',x.insurance);setVal('hbNote',x.note);byId('healthBookFormTitle').textContent='Sửa sổ sức khỏe';byId('healthBookEditBadge').classList.remove('hidden');goTab('healthBook');window.scrollTo(0,0)}
function copyPregnancy(i){var x=load().pregnancy[i];if(!x)return;setVal('pregnancyEditIndex','');setVal('pDate',x.date||today());setVal('pWeek',x.week||'');setVal('pWeight',x.weight||'');setVal('pBpd',x.bpd||'');setVal('pHc',x.hc||'');setVal('pAc',x.ac||'');setVal('pFl',x.fl||'');setVal('pAfi',x.afi||'');setVal('pPosition',x.position||'');setVal('pNote',x.note||'');byId('pregnancyFormTitle').textContent='Sao chép chỉ số thai kỳ';byId('pregnancyEditBadge').classList.add('hidden');goTab('pregnancy');window.scrollTo(0,0)}
function copyBaby(i){var x=load().baby[i];if(!x)return;setVal('babyEditIndex','');setVal('bDate',x.date||today());setVal('bWeight',x.weight||'');setVal('bLength',x.length||'');setVal('bHead',x.head||'');setVal('bFeed',x.feed||'');setVal('bSleep',x.sleep||'');setVal('bNote',x.note||'');byId('babyFormTitle').textContent='Sao chép chỉ số sau sinh';byId('babyEditBadge').classList.add('hidden');goTab('baby');window.scrollTo(0,0)}
function copyDiary(i){var x=load().diary[i];if(!x)return;setVal('diaryEditIndex','');setVal('dDate',x.date||today());setVal('dTimeFrom',timeFromOf(x));setVal('dTimeTo',timeToOf(x));setDiaryCategoryValue(x);setVal('dTitle',x.title||'');setVal('dNote',x.note||'');byId('diaryFormTitle').textContent='Sao chép nhật ký';byId('diaryEditBadge').classList.add('hidden');var back=byId('diaryBackBookBtn');if(back)back.classList.add('hidden');goTab('diary');window.scrollTo(0,0);showToast('Đã sao chép nhật ký, bấm Lưu để tạo dòng mới','success')}
function del(type,idx){if(!confirm('Xóa dòng dữ liệu này?'))return;var db=load();if(db[type]&&db[type][idx]){db[type].splice(idx,1);save(db);showToast('Xóa dữ liệu thành công','success')}else{showToast('Không thành công','error')}}
function itemActions(type,i){var e=type==='pregnancy'?'editPregnancy':type==='baby'?'editBaby':type==='diary'?'editDiary':type==='healthBook'?'editHealthBook':'editMom';var c=type==='pregnancy'?'copyPregnancy':type==='baby'?'copyBaby':type==='diary'?'copyDiary':'';var copyBtn=c?'<button class="secondary" onclick="'+c+'('+i+')">Sao chép</button>':'';return '<div class="itemActions"><button class="ghost" onclick="'+e+'('+i+')">Sửa</button>'+copyBtn+'<button class="danger" onclick="del(\''+type+'\','+i+')">Xóa</button></div>'}
function renderList(id,arr,type,fmt){byId(id).innerHTML=arr.length?arr.map(function(x,i){var actionIdx=(typeof x._idx==='number'?x._idx:i);return '<div class="item">'+fmt(x)+itemActions(type,actionIdx)+'</div>'}).join(''):'<p class="notice">Chưa có dữ liệu.</p>'}
function latestHtml(title, x, empty, fmt){if(!x)return '<div class="item"><b>'+title+'</b><p class="notice">'+empty+'</p></div>';return '<div class="item"><b>'+title+'</b>'+fmt(x)+'</div>'}

function diaryTimeRank(t){
  if(!t)return '0000';
  t=String(t).trim();
  if(t==='Sau bú')return '0459';
  var first=t.split('-')[0].trim();
  if(first.indexOf('xx')>-1){
    var h=parseInt(first.split(':')[0],10);
    if(!isNaN(h))return String(h).padStart(2,'0')+'50';
  }
  var m=first.match(/^(\d{1,2}):(\d{2})/);
  if(m)return String(parseInt(m[1],10)).padStart(2,'0')+m[2];
  return '0000';
}
function diarySortDesc(a,b){
  var ak=(a.date||'')+diaryTimeRank(timeRankOf(a));
  var bk=(b.date||'')+diaryTimeRank(timeRankOf(b));
  return bk.localeCompare(ak);
}
function sortedDiary(db){
  return (db.diary||[]).map(function(x,i){var y=Object.assign({},x);y._idx=i;return y}).sort(diarySortDesc);
}


function showStatInfo(code){
  var map={
    EFW:'EFW (Estimated Fetal Weight): cân nặng thai ước lượng, thường tính theo gram.',
    BPD:'BPD (Biparietal Diameter): đường kính lưỡng đỉnh, tức chiều ngang đầu thai nhi.',
    HC:'HC (Head Circumference): chu vi vòng đầu thai nhi.',
    AC:'AC (Abdominal Circumference): chu vi vòng bụng thai nhi.',
    FL:'FL (Femur Length): chiều dài xương đùi thai nhi.',
    AFI:'AFI/Nước ối: chỉ số nước ối hoặc thông tin lượng nước ối.',
    POSITION:'Ngôi thai: tư thế/ngôi của thai nhi, ví dụ ngôi đầu, ngôi mông.',
    WEEK:'Tuần thai: tuổi thai tại thời điểm khám/siêu âm.'
  };
  var box=byId('statInfo');
  if(!box)return;
  box.innerHTML='<b>'+esc(code)+':</b> '+esc(map[code]||'Chưa có mô tả cho chỉ số này.');
  box.classList.remove('hidden');
}
function statHead(code,label){return '<button type="button" class="statHeadBtn" onclick="showStatInfo(\''+code+'\')">'+label+'</button>'}
function renderPregnancyStats(db){var box=byId('pregnancyStatsBox');if(!box)return;var arr=(db.pregnancy||[]).slice().sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});if(!arr.length){box.innerHTML='<p class="notice">Chưa có dữ liệu chỉ số thai kỳ để thống kê.</p>';return}var rows=arr.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+fmtDate(x.date)+'</td><td>'+esc(x.week)+'</td><td>'+esc(x.weight)+'</td><td>'+esc(x.bpd)+'</td><td>'+esc(x.hc)+'</td><td>'+esc(x.ac)+'</td><td>'+esc(x.fl)+'</td><td>'+esc(x.afi)+'</td><td>'+esc(x.position)+'</td></tr>'}).join('');var last=arr[arr.length-1];box.innerHTML='<div class="kpi"><div class="box"><small>Tổng mốc đã nhập</small><b>'+arr.length+'</b></div><div class="box"><small>Mốc mới nhất</small><b>'+esc(last.week||'--')+'</b></div><div class="box"><small>EFW mới nhất</small><b>'+esc(last.weight||'--')+'</b></div></div><div class="tableWrap"><table class="statTable"><thead><tr><th>#</th><th>Ngày</th><th>'+statHead('WEEK','Tuần thai')+'</th><th>'+statHead('EFW','EFW')+'</th><th>'+statHead('BPD','BPD')+'</th><th>'+statHead('HC','HC')+'</th><th>'+statHead('AC','AC')+'</th><th>'+statHead('FL','FL')+'</th><th>'+statHead('AFI','AFI')+'</th><th>'+statHead('POSITION','Ngôi thai')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
function renderBabyStats(db){var box=byId('babyStatsBox');if(!box)return;var arr=(db.baby||[]).slice().sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});if(!arr.length){box.innerHTML='<p class="notice">Chưa có dữ liệu sau sinh để thống kê.</p>';return}var rows=arr.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+fmtDate(x.date)+'</td><td>'+esc(x.weight||'--')+'</td><td>'+esc(x.length||'--')+'</td><td>'+esc(x.head||'--')+'</td><td>'+esc(x.feed||'--')+'</td><td>'+esc(x.sleep||'--')+'</td><td>'+esc(x.note||'')+'</td></tr>'}).join('');var last=arr[arr.length-1];box.innerHTML='<div class="kpi"><div class="box"><small>Tổng mốc đã nhập</small><b>'+arr.length+'</b></div><div class="box"><small>Cân nặng mới nhất</small><b>'+esc(last.weight||'--')+'</b></div><div class="box"><small>Chiều dài mới nhất</small><b>'+esc(last.length||'--')+'</b></div></div><div class="tableWrap"><table class="statTable"><thead><tr><th>#</th><th>Ngày</th><th>Cân nặng</th><th>Chiều dài</th><th>Vòng đầu</th><th>Cữ bú</th><th>Ngủ</th><th>Ghi chú</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}

function numVal(v){if(v===undefined||v===null)return null;var m=String(v).replace(',','.').match(/-?\d+(\.\d+)?/);return m?Number(m[0]):null}
function chartSvg(points,label){
  var vals=points.map(function(p){return p.value}).filter(function(v){return typeof v==='number'&&!isNaN(v)});
  if(points.length<2||vals.length<2)return '<div class="chartEmpty">Cần ít nhất 2 mốc có dữ liệu số để vẽ biểu đồ '+esc(label)+'.</div>';
  var min=Math.min.apply(null,vals),max=Math.max.apply(null,vals);if(min===max){min=min-1;max=max+1}
  var w=640,h=220,pad=34;
  var valid=points.filter(function(p){return typeof p.value==='number'&&!isNaN(p.value)});
  var step=valid.length>1?(w-pad*2)/(valid.length-1):0;
  var coords=valid.map(function(p,i){var x=pad+i*step;var y=h-pad-((p.value-min)/(max-min))*(h-pad*2);return {x:x,y:y,p:p}});
  var poly=coords.map(function(c){return c.x.toFixed(1)+','+c.y.toFixed(1)}).join(' ');
  var dots=coords.map(function(c){return '<circle cx="'+c.x.toFixed(1)+'" cy="'+c.y.toFixed(1)+'" r="4"><title>'+esc(c.p.date)+' · '+esc(label)+': '+esc(c.p.raw)+'</title></circle>'}).join('');
  var labels=coords.map(function(c,i){if(i!==0&&i!==coords.length-1&&i%2!==0)return '';return '<text x="'+c.x.toFixed(1)+'" y="'+(h-8)+'" text-anchor="middle">'+esc(c.p.shortDate)+'</text>'}).join('');
  return '<svg class="chartSvg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Biểu đồ '+esc(label)+'">'+
    '<line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" stroke="currentColor" opacity=".25"/>'+
    '<line x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(h-pad)+'" stroke="currentColor" opacity=".25"/>'+
    '<text x="'+(pad+2)+'" y="'+(pad-10)+'">'+esc(max.toFixed(1))+'</text>'+
    '<text x="'+(pad+2)+'" y="'+(h-pad-8)+'">'+esc(min.toFixed(1))+'</text>'+
    '<polyline fill="none" stroke="currentColor" stroke-width="3" points="'+poly+'"/>'+dots+labels+'</svg>';
}
function chartCard(title,arr,field){
  var points=arr.map(function(x){var raw=x[field]||'';return {date:fmtDate(x.date),shortDate:fmtDate(x.date).slice(0,5),raw:raw,value:numVal(raw)}});
  return '<div class="chartCard"><h3>'+esc(title)+'</h3><small>'+esc(arr.length)+' mốc dữ liệu</small>'+chartSvg(points,title)+'</div>';
}
function renderPregnancyChart(db){
  var box=byId('pregnancyChartBox');if(!box)return;
  var arr=(db.pregnancy||[]).slice().sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});
  if(!arr.length){box.innerHTML='<p class="notice">Chưa có dữ liệu thai kỳ để vẽ biểu đồ.</p>';return}
  box.innerHTML=chartCard('EFW - Cân nặng thai ước lượng',arr,'weight')+
    chartCard('BPD - Đường kính lưỡng đỉnh',arr,'bpd')+
    chartCard('HC - Chu vi đầu',arr,'hc')+
    chartCard('AC - Chu vi bụng',arr,'ac')+
    chartCard('FL - Chiều dài xương đùi',arr,'fl')+
    chartCard('AFI/Nước ối',arr,'afi');
}
function renderBabyChart(db){
  var box=byId('babyChartBox');if(!box)return;
  var arr=(db.baby||[]).slice().sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});
  if(!arr.length){box.innerHTML='<p class="notice">Chưa có dữ liệu sau sinh để vẽ biểu đồ.</p>';return}
  box.innerHTML=chartCard('Cân nặng',arr,'weight')+
    chartCard('Chiều dài',arr,'length')+
    chartCard('Vòng đầu',arr,'head')+
    chartCard('Cữ bú',arr,'feed')+
    chartCard('Thời gian ngủ',arr,'sleep');
}
function showPregnancyChart(){renderPregnancyChart(load());showPage('pregnancyChart')}
function showBabyChart(){renderBabyChart(load());showPage('babyChart')}

function renderDiaryBook(db){
  var box=byId('diaryBookList');if(!box)return;
  var arr=sortedDiary(db);
  if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có nhật ký. Boss có thể vào Nhật ký → Thêm nhật ký để ghi lại các mốc quan trọng.</p></div>';return}
  box.innerHTML=arr.map(function(x){
    var title=x.title||'Không tiêu đề';
    var selected=(Number(window.__diaryHighlightIndex)===Number(x._idx));
    var meta=(timeRangeOf(x)?'⏰ '+esc(timeRangeOf(x))+' · ':'')+'<span class="diaryTypeBadge">'+diaryTypeLabel(db,x)+'</span>';
    return '<div class="swipeShell '+(selected?'diarySelected':'')+'" data-diary-idx="'+x._idx+'" ontouchstart="diarySwipeStart(event,this)" ontouchmove="diarySwipeMove(event,this)" ontouchend="diarySwipeEnd(event,this)"><article class="diaryPage diaryEditable" role="button" tabindex="0" onclick="if(!window.__diarySwipeLock)editDiaryFromBook('+x._idx+')"><div class="diaryDate">'+weekdayName(x.date)+', '+fmtDate(x.date)+'</div><h3>'+esc(title)+'</h3><div class="diaryMeta">'+meta+'</div><p>'+esc(x.note||'')+'</p></article><button class="swipeDelete" onclick="confirmDeleteDiaryBook('+x._idx+')">Xóa</button></div>';
  }).join('');
  renderDiaryStatsPanel(db);
}


function diarySwipeStart(ev,el){var t=ev.touches&&ev.touches[0];if(!t)return;el.__sx=t.clientX;el.__sy=t.clientY;el.__dx=0;window.__diarySwipeLock=false}
function diarySwipeMove(ev,el){var t=ev.touches&&ev.touches[0];if(!t||typeof el.__sx==='undefined')return;var dx=t.clientX-el.__sx,dy=t.clientY-el.__sy;if(Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)){ev.preventDefault();el.__dx=dx;window.__diarySwipeLock=true;if(dx<0)el.classList.add('open');else el.classList.remove('open')}}
function diarySwipeEnd(ev,el){setTimeout(function(){window.__diarySwipeLock=false},180);if((el.__dx||0)<-46)el.classList.add('open');else el.classList.remove('open')}
function confirmDeleteDiaryBook(idx){
  if(!confirm('Xóa nhật ký này?')){var el=document.querySelector('.swipeShell[data-diary-idx="'+idx+'"]');if(el)el.classList.remove('open');return}
  var el=document.querySelector('.swipeShell[data-diary-idx="'+idx+'"]');if(el)el.classList.add('deleting');
  setTimeout(function(){var db=load();if(db.diary&&db.diary[idx]){db.diary.splice(idx,1);save(db);showToast('Xóa nhật ký thành công','success')}else{showToast('Không tìm thấy nhật ký cần xóa','error')}},260);
}
function diaryStatKey(text){return encodeURIComponent(String(text||''))}
function diaryStatToggle(type,key){
  window.__diaryStatsCollapsed=window.__diaryStatsCollapsed||{types:{},dates:{}};
  var bucket=type==='type'?window.__diaryStatsCollapsed.types:window.__diaryStatsCollapsed.dates;
  bucket[key]=!bucket[key];
  renderDiaryStatsPanel(load());
}
function toggleDiaryStats(){
  var p=byId('diaryStatsPanel');if(!p)return;
  var show=p.classList.contains('hidden');
  p.classList.toggle('hidden',!show);
  var btn=byId('diaryStatsToggleBtn');if(btn){btn.classList.toggle('statsActive',show);btn.textContent=show?'📊 Đang xem thống kê':'📊 Thống kê'}
  if(show)renderDiaryStatsPanel(load());
}
function renderDiaryStatsPanel(db){
  var p=byId('diaryStatsPanel');if(!p)return;
  var btn=byId('diaryStatsToggleBtn');if(btn){var active=!p.classList.contains('hidden');btn.classList.toggle('statsActive',active);btn.textContent=active?'📊 Đang xem thống kê':'📊 Thống kê'}
  var arr=sortedDiary(db);if(!arr.length){p.innerHTML='';return}
  window.__diaryStatsCollapsed=window.__diaryStatsCollapsed||{types:{},dates:{}};
  var groups={};
  arr.forEach(function(x){
    var label=diaryTypeLabel(db,x);
    var date=x.date||'Không rõ ngày';
    if(!groups[label])groups[label]={count:0,dates:{}};
    groups[label].count+=1;
    (groups[label].dates[date]=groups[label].dates[date]||[]).push(x);
  });
  var keys=Object.keys(groups).sort();
  p.innerHTML=keys.map(function(k){
    var g=groups[k], typeKey=diaryStatKey(k), typeCollapsed=!!window.__diaryStatsCollapsed.types[typeKey];
    var dateKeys=Object.keys(g.dates).sort(function(a,b){return b.localeCompare(a)});
    var dateHtml=dateKeys.map(function(d){
      var dateKey=diaryStatKey(k+'__'+d), dateCollapsed=!!window.__diaryStatsCollapsed.dates[dateKey];
      var items=g.dates[d].sort(function(a,b){return (timeRankOf(a)||'').localeCompare(timeRankOf(b)||'')});
      return '<div class="diaryStatDateGroup '+(dateCollapsed?'collapsed':'')+'"><div class="diaryStatDateHeader" onclick="diaryStatToggle(\'date\',\''+dateKey+'\')"><h4>📅 '+fmtDate(d)+' <small>('+items.length+')</small></h4><span class="diaryStatChevron">'+(dateCollapsed?'▶':'▼')+'</span></div><div class="diaryStatItems">'+items.map(function(x){
        return '<div class="diaryStatItem" onclick="openDiaryBookHighlight('+x._idx+')"><b>'+esc(x.title||'Không tiêu đề')+'</b><small>'+(timeRangeOf(x)?esc(timeRangeOf(x))+' · ':'')+esc((x.note||'').slice(0,90))+'</small></div>';
      }).join('')+'</div></div>';
    }).join('');
    return '<div class="diaryStatGroup '+(typeCollapsed?'collapsed':'')+'"><div class="diaryStatHeader" onclick="diaryStatToggle(\'type\',\''+typeKey+'\')"><h3>'+k+' <small>('+g.count+')</small></h3><span class="diaryStatChevron">'+(typeCollapsed?'▶':'▼')+'</span></div><div class="diaryStatDateWrap">'+dateHtml+'</div></div>';
  }).join('');
}

function healthBookIdentityHtml(x){
  var meta=[
    x.fullName?'👤 '+esc(x.fullName):'',
    x.dob?'🎂 '+fmtDate(x.dob):'',
    x.date?'📅 Cập nhật '+fmtDate(x.date):'',
    x.blood?'🩸 Nhóm máu '+esc(x.blood):'',
    x.height?'📏 '+esc(x.height):'',
    x.weight?'⚖️ '+esc(x.weight):'',
    x.bodyMeasure?'📐 '+esc(x.bodyMeasure):'',
    x.bmi?'BMI '+esc(x.bmi):''
  ].filter(Boolean).map(function(v){return '<span>'+v+'</span>'}).join('');
  return '<div class="healthIdentity">'+meta+'</div>';
}
function healthHistoryHtml(x){
  var logs=Array.isArray(x.historyLogs)?x.historyLogs:[];
  if(!logs.length)return '';
  return '<div class="healthHistory"><h4>Lịch sử ghi nhận</h4>'+logs.map(function(h,i){
    var details=[
      h.height?'Chiều cao: '+esc(h.height):'',
      h.weight?'Cân nặng: '+esc(h.weight):'',
      h.bodyMeasure?'Số đo: '+esc(h.bodyMeasure):'',
      h.bmi?'BMI: '+esc(h.bmi):'',
      h.blood?'Nhóm máu: '+esc(h.blood):'',
      h.allergy?'Dị ứng: '+esc(h.allergy):'',
      h.history?'Tiền sử: '+esc(h.history):'',
      h.medicine?'Thuốc: '+esc(h.medicine):'',
      h.vaccine?'Vaccine: '+esc(h.vaccine):'',
      h.note?'Ghi chú: '+esc(h.note):''
    ].filter(Boolean).join(' · ');
    return '<div class="healthHistoryItem"><small>'+(h.date?fmtDate(h.date):'Không rõ ngày')+(h.loggedAt?' · '+new Date(h.loggedAt).toLocaleString('vi-VN'):'')+'</small><p>'+(details||'Không có chi tiết')+'</p></div>';
  }).join('')+'</div>';
}
function healthBookBlockHtml(x,k,withActions,i){
  return '<div class="healthBlock"><h3>'+esc(x.fullName||x.person||k)+'</h3><small>'+esc(x.person||k)+'</small>'+healthBookIdentityHtml(x)
    +(x.allergy?'<p><b>Dị ứng:</b> '+esc(x.allergy)+'</p>':'')
    +(x.history?'<p><b>Tiền sử bệnh:</b> '+esc(x.history)+'</p>':'')
    +(x.medicine?'<p><b>Thuốc đang dùng:</b> '+esc(x.medicine)+'</p>':'')
    +(Array.isArray(x.vaccines)&&x.vaccines.length?'<p><b>Vaccine / Tiêm chủng:</b></p>'+vaccineListHtml(x.vaccines):(x.vaccine?'<p><b>Tiêm chủng:</b> '+esc(x.vaccine)+'</p>':''))
    +(!Array.isArray(x.vaccines)||!x.vaccines.length?(x.vaccinePurpose?'<p><b>Ngừa bệnh/Mục đích:</b> '+esc(x.vaccinePurpose)+'</p>':''):'')
    +(x.doctor?'<p><b>Bác sĩ/Bệnh viện:</b> '+esc(x.doctor)+'</p>':'')
    +(x.insurance?'<p><b>BHYT/Mã hồ sơ:</b> '+esc(x.insurance)+'</p>':'')
    +(x.note?'<p><b>Ghi chú:</b> '+esc(x.note)+'</p>':'')
    +healthHistoryHtml(x)
    +(withActions?itemActions('healthBook',i):'')+'</div>';
}
function renderHealthBookView(db){
  var target=byId('healthBookBlocks');if(!target)return;
  var arr=(db.healthBook||[]).slice().sort(function(a,b){return (a.person||'').localeCompare(b.person||'') || (b.date||'').localeCompare(a.date||'')});
  if(!arr.length){target.innerHTML='<div class="card"><p class="notice">Chưa có sổ sức khỏe. Boss có thể vào Sổ sức khỏe → Thêm sổ sức khỏe để tạo hồ sơ cho Bố, Mẹ hoặc Con.</p></div>';return}
  var groups={};
  arr.forEach(function(x){var k=x.person||'Khác';(groups[k]=groups[k]||[]).push(x)});
  var order=['Con','Mẹ','Bố','Khác'];
  target.innerHTML=order.filter(function(k){return groups[k]&&groups[k].length}).map(function(k){
    return '<div class="card"><h2 class="healthSectionTitle">'+esc(k)+'</h2><div class="healthBookGrid">'+groups[k].map(function(x){return healthBookBlockHtml(x,k,false,0)}).join('')+'</div></div>';
  }).join('');
}


function typeLabel(db,id){
  var arr=(db.appointmentTypes||[]);
  for(var i=0;i<arr.length;i++){if(arr[i].id===id)return (arr[i].icon?arr[i].icon+' ':'')+arr[i].name}
  return id||'Chưa phân loại'
}
function fillAppointmentTypeOptions(db){
  var sel=byId('aType');if(!sel)return;
  var current=sel.value;
  var active=(db.appointmentTypes||[]).filter(function(x){return x.active!==false});
  if(!active.length)active=db.appointmentTypes||[];
  sel.innerHTML=active.map(function(x){return '<option value="'+esc(x.id)+'">'+esc((x.icon?x.icon+' ':'')+x.name)+'</option>'}).join('');
  if(current)sel.value=current;
}
function setValSafe(id,val){var el=byId(id);if(el)el.value=(val===undefined||val===null)?'':String(val)}
function resetAppointmentForm(){['scheduleEditIndex','aTimeFrom','aTimeTo','aTitle','aPlace','aDoctor','aCost','aNote'].forEach(function(id){setValSafe(id,'')});setValSafe('aDate',today());setValSafe('aPerson','Mẹ');setValSafe('aStatus','Sắp tới');byId('scheduleFormTitle').textContent='Thêm lịch khám';byId('scheduleEditBadge').classList.add('hidden');fillAppointmentTypeOptions(load())}
function saveAppointment(){
  var db=load();fillAppointmentTypeOptions(db);
  var date=byId('aDate').value,typeId=byId('aType').value;
  if(!date){showToast('Vui lòng nhập Ngày lịch khám','warn');return}
  if(!typeId){showToast('Vui lòng chọn Loại lịch','warn');return}
  var now=new Date().toISOString();
  var timeFrom=byId('aTimeFrom')?byId('aTimeFrom').value:'';var timeTo=byId('aTimeTo')?byId('aTimeTo').value:'';if(!timeFrom){showToast('Vui lòng chọn Từ giờ','warn');return}if(timeTo&&timeTo<timeFrom){showToast('Đến giờ không được nhỏ hơn Từ giờ','warn');return}var item={date:date,time:timeFrom,timeFrom:timeFrom,timeTo:timeTo,typeId:typeId,typeName:typeLabel(db,typeId),title:byId('aTitle').value.trim(),place:byId('aPlace').value.trim(),doctor:byId('aDoctor').value.trim(),person:byId('aPerson').value,cost:byId('aCost').value.trim(),status:byId('aStatus').value,note:byId('aNote').value.trim(),updatedAt:now};
  var idx=byId('scheduleEditIndex').value;
  if(idx!==''){var old=db.appointments[Number(idx)]||{};item.createdAt=old.createdAt||now;db.appointments[Number(idx)]=item;window.__appointmentHighlightIndex=Number(idx);showToast('Cập nhật lịch khám thành công','success')}else{item.createdAt=now;db.appointments.unshift(item);window.__appointmentHighlightIndex=0;showToast('Thêm lịch khám thành công','success')}
  save(db);resetAppointmentForm();showPage('scheduleList');setTimeout(function(){var el=document.querySelector('[data-appt-idx="'+window.__appointmentHighlightIndex+'"]');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});},100);
}
function editAppointment(i){var db=load(),x=db.appointments[i];if(!x)return;fillAppointmentTypeOptions(db);setValSafe('scheduleEditIndex',i);setValSafe('aDate',x.date);setValSafe('aTimeFrom',timeFromOf(x));setValSafe('aTimeTo',timeToOf(x));setValSafe('aType',x.typeId);setValSafe('aTitle',x.title);setValSafe('aPlace',x.place);setValSafe('aDoctor',x.doctor);setValSafe('aPerson',x.person||'Mẹ');setValSafe('aCost',x.cost);setValSafe('aStatus',x.status||'Sắp tới');setValSafe('aNote',x.note);byId('scheduleFormTitle').textContent='Sửa lịch khám';byId('scheduleEditBadge').classList.remove('hidden');showPage('scheduleAdd')}
function copyAppointment(i){var db=load(),x=db.appointments[i];if(!x)return;fillAppointmentTypeOptions(db);setValSafe('scheduleEditIndex','');setValSafe('aDate',x.date||today());setValSafe('aTimeFrom',timeFromOf(x));setValSafe('aTimeTo',timeToOf(x));setValSafe('aType',x.typeId);setValSafe('aTitle',x.title||'');setValSafe('aPlace',x.place||'');setValSafe('aDoctor',x.doctor||'');setValSafe('aPerson',x.person||'Mẹ');setValSafe('aCost',x.cost||'');setValSafe('aStatus',x.status||'Sắp tới');setValSafe('aNote',x.note||'');byId('scheduleFormTitle').textContent='Sao chép lịch khám';byId('scheduleEditBadge').classList.add('hidden');showToast('Đã sao chép lịch, bấm Lưu để tạo lịch mới','success');showPage('scheduleAdd')}
function delAppointment(i){if(!confirm('Xóa lịch khám này?'))return;var db=load();db.appointments.splice(i,1);save(db);showToast('Xóa lịch khám thành công','success')}
function appointmentItemHtml(x,i,db){
  var d=daysBetween(today(),x.date),due=d>0?'Còn '+d+' ngày':(d===0?'Hôm nay':('Đã qua '+Math.abs(d)+' ngày'));
  var selected=(Number(window.__appointmentHighlightIndex)===Number(i));
  return '<div class="item '+(selected?'scheduleSelected':'')+'" data-appt-idx="'+i+'"><b>'+fmtDate(x.date)+(timeRangeOf(x)?' · '+esc(timeRangeOf(x)):'')+' · '+esc(x.title||typeLabel(db,x.typeId))+'</b><small>'+esc(typeLabel(db,x.typeId))+' | '+esc(x.person||'')+' | '+esc(x.status||'Sắp tới')+' | '+due+'</small><div class="scheduleMeta"><span class="pill">📍 '+esc(x.place||'Chưa nhập địa điểm')+'</span><span class="pill">👩‍⚕️ '+esc(x.doctor||'Chưa nhập BS/Khoa')+'</span>'+(x.cost?'<span class="pill">💰 '+esc(x.cost)+'</span>':'')+'</div>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'<div class="itemActions"><button class="ghost" onclick="editAppointment('+i+')">Sửa</button><button class="secondary" onclick="copyAppointment('+i+')">Sao chép</button><button class="danger" onclick="delAppointment('+i+')">Xóa</button></div></div>';
}
function sortedAppointments(db){return (db.appointments||[]).map(function(x,i){var y={};for(var k in x)y[k]=x[k];y._idx=i;return y}).sort(function(a,b){var ad=(a.date||'9999-12-31')+timeRankOf(a),bd=(b.date||'9999-12-31')+timeRankOf(b);return ad.localeCompare(bd)})}
function renderAppointmentList(db){var box=byId('appointmentList');if(!box)return;var arr=sortedAppointments(db);box.innerHTML=arr.length?arr.map(function(x){return appointmentItemHtml(x,x._idx,db)}).join(''):'<p class="notice">Chưa có lịch khám.</p>'}
function startOfWeekISO(d){
  var date=new Date(d+'T00:00:00');
  var day=date.getDay();
  var diff=(day===0?-6:1-day);
  date.setDate(date.getDate()+diff);
  return localDateISO(date);
}
function addDaysISO(d,n){
  var date=new Date(d+'T00:00:00');
  date.setDate(date.getDate()+n);
  return localDateISO(date);
}
function setCalendarModeFromInline(value){
  var select=byId('calendarMode');
  if(select)select.value=value||'week';
  renderAppointmentCalendar(load());
}
function calendarToday(){setValSafe('calendarBaseDate',today());renderAppointmentCalendar(load())}
function shiftCalendar(dir){
  var input=byId('calendarBaseDate');if(!input)return;
  var mode=(byId('calendarMode')&&byId('calendarMode').value)||'week';
  var base=input.value||today();
  var d=new Date(base+'T00:00:00');
  if(mode==='week'){d.setDate(d.getDate()+(dir*7));}
  else{d.setMonth(d.getMonth()+dir);}
  input.value=localDateISO(d);
  renderAppointmentCalendar(load());
}
function monthStartISO(d){
  var dt=new Date(d+'T00:00:00');
  return localDateISO(new Date(dt.getFullYear(),dt.getMonth(),1));
}
function renderAppointmentCalendar(db){
  var box=byId('appointmentCalendar');if(!box)return;
  var mode=(byId('calendarMode')&&byId('calendarMode').value)||'week';
  var base=(byId('calendarBaseDate')&&byId('calendarBaseDate').value)||today();
  if(byId('calendarBaseDate')&&!byId('calendarBaseDate').value)byId('calendarBaseDate').value=base;
  var arr=sortedAppointments(db);
  function inlineCalendarNav(label){
    var modeValue=(byId('calendarMode')&&byId('calendarMode').value)||'week';
    return '<div class="calendarBlockNav"><button class="ghost" onclick="shiftCalendar(-1)">← Trước</button><select class="calendarModeInline" onchange="setCalendarModeFromInline(this.value)"><option value="week" '+(modeValue==='week'?'selected':'')+'>Theo tuần</option><option value="month" '+(modeValue==='month'?'selected':'')+'>Theo tháng</option></select><button class="ghost" onclick="shiftCalendar(1)">Sau →</button></div>';
  }
  if(mode==='week'){
    var start=startOfWeekISO(base),days=[];for(var i=0;i<7;i++)days.push(addDaysISO(start,i));
    var title='Tuần từ '+fmtDate(start)+' đến '+fmtDate(days[6]);
    box.innerHTML='<h3>'+title+'</h3>'+inlineCalendarNav('Theo tuần')+'<div class="calendarWeekList">'+days.map(function(d){
      var items=arr.filter(function(x){return x.date===d});
      return '<div class="calendarDay '+(d===today()?'today':'')+'"><b>'+weekdayName(d)+' · '+fmtDate(d)+'</b>'+(items.length?items.map(function(x){return '<div class="calendarEvent">'+esc(timeRangeOf(x)||'--:--')+' · '+esc(x.title||typeLabel(db,x.typeId))+'<br><small>'+esc(typeLabel(db,x.typeId))+(x.place?' · '+esc(x.place):'')+'</small></div>'}).join(''):'<p class="notice">Không có lịch.</p>')+'</div>';
    }).join('')+'</div>';
  }else{
    var dt=new Date(base+'T00:00:00'),y=dt.getFullYear(),m=dt.getMonth();
    var first=new Date(y,m,1),last=new Date(y,m+1,0);
    var startPad=(first.getDay()+6)%7; // Monday-first calendar
    var totalCells=Math.ceil((startPad+last.getDate())/7)*7;
    var heads=['T2','T3','T4','T5','T6','T7','CN'];
    var cells=[];
    for(var c=0;c<totalCells;c++){
      var day=c-startPad+1;
      if(day<1||day>last.getDate()){cells.push({empty:true});}
      else{var iso=localDateISO(new Date(y,m,day));cells.push({date:iso,day:day});}
    }
    var monthTitle='Tháng '+(m+1)+'/'+y;
    box.innerHTML='<h3>'+monthTitle+'</h3>'+inlineCalendarNav('Theo tháng')+'<div class="calendarGrid">'+heads.map(function(h){return '<div class="calendarWeekday">'+h+'</div>'}).join('')+cells.map(function(cell){
      if(cell.empty)return '<div class="calendarDay empty"></div>';
      var items=arr.filter(function(x){return x.date===cell.date});
      return '<div class="calendarDay '+(cell.date===today()?'today':'')+'"><b>'+cell.day+'</b>'+(items.length?items.map(function(x){return '<div class="calendarEvent">'+esc(timeRangeOf(x)||'--:--')+'<br>'+esc(x.title||typeLabel(db,x.typeId))+'</div>'}).join(''):'')+'</div>';
    }).join('')+'</div>';
  }
}

function diaryTypeLabel(db,item){
  if(!item)return 'Nhật ký';
  var t=(db.diaryTypes||[]).find(function(x){return x.id===item.categoryId || x.name===item.category});
  return ((t&&t.icon)?t.icon+' ':'')+esc((t&&t.name)||item.category||'Nhật ký');
}
function fillDiaryTypeOptions(db,current){
  var select=byId('dCategory');if(!select)return;
  db=normalize(db||load());
  var active=(db.diaryTypes||[]).filter(function(x){return x.active!==false});
  if(current && !(active||[]).some(function(x){return x.id===current})){var cur=(db.diaryTypes||[]).find(function(x){return x.id===current});if(cur)active.push(cur)}
  if(!active.length)active=db.diaryTypes||[];
  select.innerHTML='<option value="">-- Chọn loại nhật ký --</option>'+active.map(function(x){return '<option value="'+esc(x.id)+'">'+esc((x.icon?x.icon+' ':'')+x.name)+'</option>'}).join('');
  if(current)select.value=current;
}
function resetDiaryTypeForm(){setValSafe('diaryTypeEditIndex','');setValSafe('diaryTypeName','');setValSafe('diaryTypeIcon','');setValSafe('diaryTypeDesc','');setValSafe('diaryTypeActive','1');byId('diaryTypeFormTitle').textContent='Loại nhật ký';byId('diaryTypeEditBadge').classList.add('hidden')}
function saveDiaryType(){
  var name=byId('diaryTypeName').value.trim();if(!name){alert('Vui lòng nhập Tên loại nhật ký.');return}
  var db=load(),idx=byId('diaryTypeEditIndex').value,now=new Date().toISOString();
  var dup=(db.diaryTypes||[]).some(function(x,i){return i!==Number(idx) && String(x.name||'').trim().toLowerCase()===name.toLowerCase()});
  if(dup){alert('Loại nhật ký này đã tồn tại.');return}
  var item={id:'diary_type_'+Date.now(),name:name,icon:byId('diaryTypeIcon').value.trim(),desc:byId('diaryTypeDesc').value.trim(),active:byId('diaryTypeActive').value==='1',updatedAt:now};
  if(idx!==''){var old=db.diaryTypes[Number(idx)]||{};item.id=old.id||item.id;item.createdAt=old.createdAt||now;db.diaryTypes[Number(idx)]=item;(db.diary||[]).forEach(function(d){if(d.categoryId===item.id){d.category=item.name;d.categoryIcon=item.icon;d.updatedAt=d.updatedAt||now}})}else{item.createdAt=now;db.diaryTypes.unshift(item)}
  save(db);resetDiaryTypeForm();
}
function editDiaryType(i){var x=load().diaryTypes[i];if(!x)return;setValSafe('diaryTypeEditIndex',i);setValSafe('diaryTypeName',x.name);setValSafe('diaryTypeIcon',x.icon);setValSafe('diaryTypeDesc',x.desc);setValSafe('diaryTypeActive',x.active===false?'0':'1');byId('diaryTypeFormTitle').textContent='Sửa loại nhật ký';byId('diaryTypeEditBadge').classList.remove('hidden');showPage('diaryType')}
function delDiaryType(i){var db=load(),x=db.diaryTypes[i];if(!x)return;var used=(db.diary||[]).some(function(d){return d.categoryId===x.id || d.category===x.name});if(used){alert('Không thể xoá loại nhật ký này vì đã có nhật ký đang sử dụng. Boss có thể chuyển trạng thái sang Tạm ẩn.');return}if(!confirm('Xóa loại nhật ký này?'))return;db.diaryTypes.splice(i,1);save(db)}
function renderDiaryTypes(db){var box=byId('diaryTypeList');if(!box)return;var arr=db.diaryTypes||[];box.innerHTML=arr.length?arr.map(function(x,i){return '<div class="item"><b>'+esc((x.icon?x.icon+' ':'')+x.name)+'</b><small>'+(x.active===false?'Tạm ẩn':'Đang dùng')+' · Cập nhật '+(x.updatedAt?new Date(x.updatedAt).toLocaleString('vi-VN'):'--')+'</small><p>'+esc(x.desc||'')+'</p><div class="itemActions"><button class="ghost" onclick="editDiaryType('+i+')">Sửa</button><button class="danger" onclick="delDiaryType('+i+')">Xóa</button></div></div>'}).join(''):'<p class="notice">Chưa có loại nhật ký.</p>';fillDiaryTypeOptions(db)}
function openDiaryBookHighlight(idx){window.__diaryHighlightIndex=(idx!==''&&idx!==null&&typeof idx!=='undefined')?Number(idx):null;renderDiaryBook(load());showPage('diaryBook',document.querySelector('.navItem[data-page="diaryBook"]'),true);setTimeout(function(){var el=document.querySelector('[data-diary-idx="'+window.__diaryHighlightIndex+'"]');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});},80)}
function openLatestDiaryFromDashboard(idx){openDiaryBookHighlight(idx)}
function resetAppointmentTypeForm(){setValSafe('typeEditIndex','');setValSafe('typeName','');setValSafe('typeIcon','');setValSafe('typeDesc','');setValSafe('typeActive','1');byId('typeFormTitle').textContent='Loại lịch khám';byId('typeEditBadge').classList.add('hidden')}
function saveAppointmentType(){
  var name=byId('typeName').value.trim();if(!name){alert('Vui lòng nhập Tên loại lịch khám.');return}
  var db=load(),now=new Date().toISOString(),idx=byId('typeEditIndex').value;
  var item={id:'type_'+Date.now(),name:name,icon:byId('typeIcon').value.trim(),desc:byId('typeDesc').value.trim(),active:byId('typeActive').value==='1',updatedAt:now};
  if(idx!==''){var old=db.appointmentTypes[Number(idx)]||{};item.id=old.id||item.id;item.createdAt=old.createdAt||now;db.appointmentTypes[Number(idx)]=item}else{item.createdAt=now;db.appointmentTypes.unshift(item)}
  save(db);resetAppointmentTypeForm();
}
function editAppointmentType(i){var x=load().appointmentTypes[i];if(!x)return;setValSafe('typeEditIndex',i);setValSafe('typeName',x.name);setValSafe('typeIcon',x.icon);setValSafe('typeDesc',x.desc);setValSafe('typeActive',x.active===false?'0':'1');byId('typeFormTitle').textContent='Sửa loại lịch khám';byId('typeEditBadge').classList.remove('hidden');showPage('appointmentType')}
function delAppointmentType(i){var db=load(),x=db.appointmentTypes[i];if(!x)return;var used=(db.appointments||[]).some(function(a){return a.typeId===x.id || a.typeName===x.name});if(used){alert('Không thể xoá loại lịch khám này vì đã có lịch khám đang sử dụng. Boss có thể chuyển trạng thái sang Tạm ẩn.');return}if(!confirm('Xóa loại lịch khám này?'))return;db.appointmentTypes.splice(i,1);save(db)}
function renderAppointmentTypes(db){var box=byId('appointmentTypeList');if(!box)return;var arr=db.appointmentTypes||[];box.innerHTML=arr.length?arr.map(function(x,i){return '<div class="item"><b>'+esc((x.icon?x.icon+' ':'')+x.name)+'</b><small>'+(x.active===false?'Tạm ẩn':'Đang dùng')+' · Cập nhật '+(x.updatedAt?new Date(x.updatedAt).toLocaleString('vi-VN'):'--')+'</small><p>'+esc(x.desc||'')+'</p><div class="itemActions"><button class="ghost" onclick="editAppointmentType('+i+')">Sửa</button><button class="danger" onclick="delAppointmentType('+i+')">Xóa</button></div></div>'}).join(''):'<p class="notice">Chưa có loại lịch khám.</p>';fillAppointmentTypeOptions(db)}
function upcomingAppointment(db){
  var arr=sortedAppointments(db).filter(function(x){return x.date>=today() && x.status!=='Đã hủy'});
  return arr.length?arr[0]:null;
}
function openScheduleFromDashboard(){
  var input=byId('calendarBaseDate');
  var next=upcomingAppointment(load());
  if(input && next && next.date)input.value=next.date;
  if(byId('calendarMode'))byId('calendarMode').value='week';
  renderAppointmentCalendar(load());
  showPage('scheduleCalendar',document.querySelector('.navItem[data-page="scheduleCalendar"]'),true);
}

function careTypeMeta(type){
  var map={feed:{icon:'🍼',label:'Bé bú'},pump:{icon:'🥛',label:'Hút sữa'},sleep:{icon:'😴',label:'Ngủ'},diaper:{icon:'🧷',label:'Thay tã'},pee:{icon:'💧',label:'Đi tè'},poop:{icon:'💩',label:'Đi phân'},milk:{icon:'🧊',label:'Kho sữa'},medicine:{icon:'💊',label:'Uống thuốc'},temperature:{icon:'🌡️',label:'Thân nhiệt'},spitup:{icon:'🤮',label:'Trớ sữa'}};
  return map[type]||{icon:'📝',label:'Ghi nhận'};
}
function selectCareType(type){
  if(type==='pee'||type==='poop'){
    type='diaper';
    if(typeof showToast==='function')showToast('Đi tè/Đi phân được tự động tính từ Thay tã. Vui lòng nhập Thay tã.','warn');
  }
  setValSafe('cTypeLabel',careTypeMeta(type).icon+' '+careTypeMeta(type).label);
  var grid=byId('careTypeGrid'); if(grid){grid.querySelectorAll('.careTypeBtn').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-type')===type)})}
  window.__careSelectedType=type;
  renderCareDynamicFields(type,load());
}

function addMonthsISODateTime(base,months){var d=new Date(base.getTime());var day=d.getDate();d.setMonth(d.getMonth()+months);if(d.getDate()<day)d.setDate(0);return localDateTimeValue(d)}
function localDateTimeValue(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function careBaseDateTime(){var date=(byId('cDate')&&byId('cDate').value)||today();var time=(byId('cTimeFrom')&&byId('cTimeFrom').value)||'00:00';return new Date(date+'T'+time+':00')}
function milkStorageHours(storage){var s=storage||'Ngăn mát';if(s==='Nhiệt độ phòng')return 4;if(s==='Túi giữ lạnh có đá')return 24;if(s==='Ngăn mát')return 96;if(s==='Ngăn đông')return 24*30*6;if(s==='Tủ đông sâu')return 24*30*12;return 96}
function milkExpireDateTimeFor(storage){var base=careBaseDateTime();var s=storage||'Ngăn mát';if(s==='Ngăn đông')return addMonthsISODateTime(base,6);if(s==='Tủ đông sâu')return addMonthsISODateTime(base,12);var d=new Date(base.getTime()+milkStorageHours(s)*3600000);return localDateTimeValue(d)}
function fillMilkExpiryFromStorage(force){var exp=byId('cExpireDate');if(!exp)return;var storage=(byId('cStorage')&&byId('cStorage').value)||'Ngăn mát';if(force||!exp.value)exp.value=milkExpireDateTimeFor(storage)}
function milkExpireAt(b){var raw=(b&&(b.expireDateTime||b.expireDate))||'';if(!raw)return 8640000000000000;var d=new Date(String(raw).indexOf('T')>-1?raw:(raw+'T23:59:00'));var t=d.getTime();return isNaN(t)?8640000000000000:t}
function milkTimeLeftText(b){var t=milkExpireAt(b);if(!isFinite(t)||t>8000000000000000)return 'Chưa có HSD';var diff=t-Date.now();if(diff<=0)return 'Đã quá hạn';var h=Math.floor(diff/3600000),d=Math.floor(h/24),rem=h%24;return d>0?('Còn '+d+' ngày '+rem+' giờ'):('Còn '+h+' giờ')}
function milkUrgencyIcon(b){var t=milkExpireAt(b),diff=(t-Date.now())/3600000;if(diff<0)return '⚫';if(diff<12)return '🔴';if(diff<24)return '🟠';if(diff<48)return '🟡';return '🟢'}
function milkBagBaseDate(b){b=b||{};var raw=String(b.date||b.startDate||b.createdAt||b.createdDateTime||'');return raw?raw.slice(0,10):today()}
function shortMilkBagCodeFromDate(date){var d=String(date||today()).slice(0,10).split('-');if(d.length!==3)return 'SUA';return d[0].slice(2)+d[1]+d[2]}
function milkBagDisplayId(b){return (b&&(b.shortId||b.shortCode))||shortMilkBagCodeFromDate(milkBagBaseDate(b))}
function uniqueMilkBagId(db,date){var base=shortMilkBagCodeFromDate(date||today());var used={};(db.milkInventory||[]).forEach(function(b){used[b.id]=true;used[b.shortId]=true});if(!used[base])return base;var n=2,id='';do{id=base+'-'+String(n).padStart(2,'0');n++}while(used[id]);return id}
function milkCreatedText(b){b=b||{};var raw=String(b.createdAt||b.createdDateTime||b.created||'');var d=(b.date||b.startDate||raw.slice(0,10)||'');var t=(b.timeFrom||b.time||'');if(raw){var m=raw.match(/(?:T|\s)(\d{2}:\d{2})/);if(!t&&m)t=m[1]}return (d?fmtDate(d):'--')+(t?(' '+t):'')}
function milkBagOptionText(b){var note=(b&&b.note)?(' · Ghi chú: '+b.note):'';return milkUrgencyIcon(b)+' '+milkBagDisplayId(b)+' · tạo '+milkCreatedText(b)+' · còn '+(b.remaining||0)+'ml · '+(b.storage||'')+note+' · '+milkTimeLeftText(b)}
function fmtMilkExpire(b){var raw=(b&&(b.expireDateTime||b.expireDate))||'';if(!raw)return '';if(String(raw).indexOf('T')>-1){try{return new Date(raw).toLocaleString('vi-VN')}catch(e){return raw}}return fmtDate(raw)}
function activeMilkBags(db){return (db.milkInventory||[]).filter(function(b){return (Number(b.remaining)||0)>0 && (b.status||'Đang bảo quản')==='Đang bảo quản'}).sort(function(a,b){return milkExpireAt(a)-milkExpireAt(b) || String(a.date+a.timeFrom).localeCompare(String(b.date+b.timeFrom))})}
function careStartDateValue(){return (byId('cDate')&&byId('cDate').value)||today()}
function careEndDateValue(){return (byId('cEndDate')&&byId('cEndDate').value)||careStartDateValue()}
function makeDateTimeISO(date,time){return (date||today())+'T'+(time||'00:00')+':00'}
function dateTimeMs(date,time){var d=new Date(makeDateTimeISO(date,time));var t=d.getTime();return isNaN(t)?null:t}
function addDaysToISODate(d,n){return addDaysISO(d,n)}
function minutesBetweenDateTimes(startDate,startTime,endDate,endTime){var a=dateTimeMs(startDate,startTime),b=dateTimeMs(endDate||startDate,endTime);if(a===null||b===null)return 0;return Math.max(0,Math.round((b-a)/60000))}
function syncCareDurationPreview(){var out=byId('cDurationPreview');if(!out)return;var sd=careStartDateValue(),ed=careEndDateValue(),st=(byId('cTimeFrom')&&byId('cTimeFrom').value)||'',et=(byId('cTimeTo')&&byId('cTimeTo').value)||'';if(!st||!et){out.value='';return}var min=minutesBetweenDateTimes(sd,st,ed,et);out.value=min>0?fmtMinutes(min):'Thời gian chưa hợp lệ'}
function bagSourcesFromEvent(x){
  if(!x)return [];
  var arr=Array.isArray(x.milkSources)?x.milkSources:(x.extra&&Array.isArray(x.extra.milkSources)?x.extra.milkSources:[]);
  if(arr.length)return arr.map(function(s){
    return {
      bagId:s.bagId||s.id||s.milkBagId||'',
      usedMl:Number(s.usedMl||s.used||s.amount||0),
      remainderAction:s.remainderAction||s.leftoverAction||'keep',
      discardMl:Number(s.discardMl||s.discardedMl||0),
      discardReason:s.discardReason||''
    }
  });
  if(x.milkBagId&&x.amount)return [{bagId:x.milkBagId,usedMl:Number(x.amount||0),remainderAction:'keep',discardMl:0,discardReason:''}];
  return [];
}
function milkSourceRowHtml(db,source){
  db=db||load();source=source||{};var active=activeMilkBags(db).slice();
  var selected=source.bagId||'', action=source.remainderAction||'keep';
  if(selected&&!active.some(function(b){return b.id===selected})){var old=findMilkBag(db,selected);if(old)active.unshift(old)}
  return '<div class="milkSourceRow milkSourceRowV9" data-source-row="1"><div><label>Túi sữa</label><select class="milkSourceBag" onchange="updateCareMilkSourceTotal()"><option value="">-- Chọn túi sữa --</option>'+active.map(function(b){return '<option value="'+esc(b.id)+'" '+(selected===b.id?'selected':'')+'>'+esc(milkBagOptionText(b))+'</option>'}).join('')+'</select></div><div><label>Dùng cho bé (ml)</label><input class="milkSourceMl" type="number" min="0" value="'+esc(source.usedMl||'')+'" oninput="updateCareMilkSourceTotal()" placeholder="ml"></div><div><label>Phần còn lại</label><select class="milkSourceRemainder" onchange="updateCareMilkSourceTotal()"><option value="keep" '+(action==='keep'?'selected':'')+'>Giữ lại trong kho</option><option value="discard" '+(action==='discard'?'selected':'')+'>Đổ bỏ phần còn lại</option><option value="expired" '+(action==='expired'?'selected':'')+'>Hủy do hết hạn</option><option value="spill" '+(action==='spill'?'selected':'')+'>Hủy do rơi/đổ</option></select></div><button type="button" class="danger" onclick="removeCareMilkSourceRow(this)">Xóa</button></div>';
}
function addCareMilkSourceRow(source){var rows=byId('milkSourceRows');if(!rows)return;rows.insertAdjacentHTML('beforeend',milkSourceRowHtml(load(),source||{}));updateCareMilkSourceTotal()}
function removeCareMilkSourceRow(btn){var row=btn&&btn.closest?btn.closest('.milkSourceRow'):null;if(row)row.remove();updateCareMilkSourceTotal()}
function updateCareMilkSourceTotal(){var rows=[].slice.call(document.querySelectorAll('#milkSourceRows .milkSourceRow'));var total=0;rows.forEach(function(r){var v=Number((r.querySelector('.milkSourceMl')||{}).value||0);if(v>0)total+=v});var el=byId('milkSourceTotal');if(el)el.textContent='Tổng dùng từ kho: '+total+'ml';var amount=byId('cAmount');var source=byId('cFeedSource');if(amount&&source&&source.value==='stored')amount.value=total||'';}
function toggleFeedSourceFields(){var source=(byId('cFeedSource')&&byId('cFeedSource').value)||'direct';var panel=byId('milkSourcePanel');if(panel)panel.classList.toggle('hidden',source!=='stored');var amount=byId('cAmount');if(amount){amount.readOnly=(source==='stored');amount.placeholder=(source==='stored'?'Tự tính từ các túi':'Ví dụ: 80')}updateCareMilkSourceTotal()}
function collectMilkSourcesFromForm(){var rows=[].slice.call(document.querySelectorAll('#milkSourceRows .milkSourceRow'));var out=[];rows.forEach(function(r){var bag=(r.querySelector('.milkSourceBag')||{}).value||'';var ml=Number((r.querySelector('.milkSourceMl')||{}).value||0);var action=(r.querySelector('.milkSourceRemainder')||{}).value||'keep';if(bag||ml)out.push({bagId:bag,usedMl:ml,remainderAction:action,discardMl:0,discardReason:action==='keep'?'':(action==='discard'?'Đổ bỏ phần còn lại':action==='expired'?'Hủy do hết hạn':'Hủy do rơi/đổ')})});return out}

function selectDiaperType(value){
  setValSafe('cDiaperType',value||'wet');
  document.querySelectorAll('.diaperChoice').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-diaper')===value)});
}
function diaperTypeLabel(value){var v=value||'wet';if(v==='wet'||v==='Tã ướt')return 'Tã ướt';if(v==='dirty'||v==='Tã bẩn'||v==='both'||v==='Cả hai')return 'Tã bẩn';return v}
function diaperPeeCount(x){var a=Number((x&&x.amount)||1)||1;return a}
function diaperPoopCount(x){var v=(x&&x.extra&&(x.extra.diaperType||x.extra.diaperKind))||'';var a=Number((x&&x.amount)||1)||1;var label=diaperTypeLabel(v);return (label==='Tã bẩn')?a:0}
function legacyPeePoopToDiaperType(type){return type==='poop'?'dirty':'wet'}
function normalizeCareInputType(type){return (type==='pee'||type==='poop')?'diaper':type}

function renderCareDynamicFields(type,db){
  var box=byId('careDynamicFields');if(!box)return;type=type||window.__careSelectedType||'feed';db=db||load();
  if(type==='feed'){
    box.innerHTML='<div class="row"><div><label>Hình thức bú *</label><select id="cFeedSource" onchange="toggleFeedSourceFields()"><option value="direct">Bú mẹ trực tiếp</option><option value="stored">Bú từ kho sữa đã hút</option><option value="formula">Sữa công thức</option></select></div><div><label>Số lượng ml</label><input id="cAmount" type="number" min="0" placeholder="Ví dụ: 80"></div></div><div id="milkSourcePanel" class="milkSourcePanel hidden"><b>Chọn túi sữa sử dụng</b><p class="notice">Có thể lấy từ nhiều túi sữa trong cùng một cữ. App sẽ tự trừ từng túi. Nếu bé dùng một phần và phần còn lại cần bỏ, chọn “Đổ bỏ/Hủy phần còn lại” trên từng túi để kho sữa giảm đúng nhưng lượng bé bú vẫn chỉ tính phần đã dùng.</p><div id="milkSourceRows"></div><div class="btns"><button type="button" class="secondary" onclick="addCareMilkSourceRow()">＋ Thêm túi sữa</button></div><div id="milkSourceTotal" class="milkSourceTotal">Tổng dùng từ kho: 0ml</div></div><p class="notice">Túi sữa được sắp xếp theo hạn dùng gần nhất để ưu tiên dùng trước.</p>';
    addCareMilkSourceRow();toggleFeedSourceFields();
  }else if(type==='pump'){
    box.innerHTML='<div class="row3"><div><label>Bên hút</label><select id="cPumpSide"><option value="Cả hai">Cả hai</option><option value="Trái">Trái</option><option value="Phải">Phải</option></select></div><div><label>Số lượng ml *</label><input id="cAmount" type="number" min="0" placeholder="Ví dụ: 120"></div><div><label>Vị trí bảo quản</label><select id="cStorage" onchange="fillMilkExpiryFromStorage(true)"><option value="Ngăn mát">Ngăn mát</option><option value="Nhiệt độ phòng">Nhiệt độ phòng</option><option value="Túi giữ lạnh có đá">Túi giữ lạnh có đá</option><option value="Ngăn đông">Ngăn đông</option><option value="Tủ đông sâu">Tủ đông sâu</option></select></div></div><div class="row"><div><label>Trạng thái</label><select id="cStatus"><option value="Đang bảo quản">Đang bảo quản</option><option value="Đã sử dụng hết">Đã sử dụng hết</option><option value="Đã bỏ">Đã bỏ</option></select></div><div><label>Hạn sử dụng dự kiến</label><input id="cExpireDate" type="datetime-local"></div></div><p class="notice">Mặc định trạng thái là Đang bảo quản. Hạn dùng tự điền theo loại bảo quản: nhiệt độ phòng 4h, túi lạnh 24h, ngăn mát 4 ngày, ngăn đông 6 tháng, tủ đông sâu 12 tháng.</p>';setTimeout(function(){fillMilkExpiryFromStorage(false)},0);
  }else if(type==='sleep'){
    box.innerHTML='<div class="crossDayHint">Nhập Ngày bắt đầu/Từ giờ. Đến giờ không bắt buộc: nếu để trống, app hiểu bé đang ngủ; nếu nhập Đến giờ, app hiểu bé đã dậy.</div>';
  }else if(type==='diaper'){
    box.innerHTML='<input id="cDiaperType" type="hidden" value="wet"><label>Loại tã</label><div class="diaperChoiceGrid diaperChoiceGrid2"><button type="button" class="diaperChoice active" data-diaper="wet" onclick="selectDiaperType(\'wet\')"><span class="ico">💧</span>Tã ướt<small>+1 tã, +1 đi tè</small></button><button type="button" class="diaperChoice" data-diaper="dirty" onclick="selectDiaperType(\'dirty\')"><span class="ico">💩</span>Tã bẩn<small>+1 tã, +1 tè, +1 phân</small></button></div><div class="row"><div><label>Số lượng tã</label><input id="cAmount" type="number" min="1" value="1"></div><div><label>Tự động thống kê</label><input readonly value="Tã ướt = tè; Tã bẩn = tè + phân"></div></div><p class="notice">Không cần nhập riêng Đi tè/Đi phân. Tã ướt tự cộng đi tè; tã bẩn tự cộng cả đi tè và đi phân.</p>';
    setTimeout(function(){selectDiaperType('wet')},0);
  }
  else if(type==='medicine') box.innerHTML='<div class="row3"><div><label>Tên thuốc / vitamin *</label><input id="cMedicineName" placeholder="Ví dụ: Vitamin D3"></div><div><label>Liều lượng *</label><input id="cMedicineDose" type="number" min="0" step="0.1" placeholder="Ví dụ: 1"></div><div><label>Đơn vị</label><input id="cMedicineUnit" placeholder="giọt / ml / viên"></div></div>';
  else if(type==='temperature') box.innerHTML='<div class="row"><div><label>Nhiệt độ (°C) *</label><input id="cTemperature" type="number" min="30" max="45" step="0.1" placeholder="Ví dụ: 37.2"></div><div><label>Vị trí đo</label><select id="cTemperatureSite"><option value="Nách">Nách</option><option value="Trán">Trán</option><option value="Tai">Tai</option><option value="Miệng">Miệng</option><option value="Hậu môn">Hậu môn</option></select></div></div>';
  else if(type==='spitup') box.innerHTML='<div class="row3"><div><label>Mức độ *</label><select id="cSpitupLevel"><option value="Ít">Ít</option><option value="Vừa">Vừa</option><option value="Nhiều">Nhiều</option></select></div><div><label>Sau bú (phút)</label><input id="cSpitupAfter" type="number" min="0" step="1" placeholder="Ví dụ: 15"></div><div><label>Dạng</label><select id="cSpitupType"><option value="Trớ">Trớ</option><option value="Nôn">Nôn</option></select></div></div>';
  ['cTimeFrom','cTimeTo','cDate','cEndDate'].forEach(function(id){var el=byId(id);if(el&&!el.__careSync){el.addEventListener('change',syncCareDurationPreview);el.__careSync=true}});syncCareDurationPreview();
}
var CARE_TIMER_KEY='meYeuBeCareTimer_v1';
function loadCareTimer(){try{return JSON.parse(localStorage.getItem(CARE_TIMER_KEY)||'null')}catch(e){return null}}
function saveCareTimer(t){if(t)localStorage.setItem(CARE_TIMER_KEY,JSON.stringify(t));else localStorage.removeItem(CARE_TIMER_KEY);renderCareTimerState()}
function startCareTimer(type){if(type!=='feed'&&type!=='sleep')return;var old=loadCareTimer();if(old&&!confirm('Đang có Timer khác. Dừng Timer cũ và bắt đầu Timer mới?'))return;var now=new Date();var t={type:type,startedAt:now.toISOString()};saveCareTimer(t);selectCareType(type);setValSafe('cDate',localDateISO(now));setValSafe('cEndDate',localDateISO(now));setValSafe('cTimeFrom',String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'));setValSafe('cTimeTo','');syncCareDurationPreview();showToast('Đã bắt đầu Timer '+careTypeMeta(type).label,'success')}
function stopCareTimer(){var t=loadCareTimer();if(!t){showToast('Chưa có Timer đang chạy','warn');return}var st=new Date(t.startedAt),now=new Date();selectCareType(t.type);setValSafe('cDate',localDateISO(st));setValSafe('cTimeFrom',String(st.getHours()).padStart(2,'0')+':'+String(st.getMinutes()).padStart(2,'0'));setValSafe('cEndDate',localDateISO(now));setValSafe('cTimeTo',String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'));syncCareDurationPreview();saveCareTimer(null);showToast('Đã dừng Timer. Kiểm tra và bấm Lưu ghi nhận.','success')}
function cancelCareTimer(){if(loadCareTimer()&&confirm('Hủy Timer đang chạy?')){saveCareTimer(null);showToast('Đã hủy Timer','success')}}
function renderCareTimerState(){var box=byId('careTimerBox');if(!box)return;var t=loadCareTimer();if(!t){box.innerHTML='<div class="careTimerActions"><button type="button" onclick="startCareTimer(&quot;feed&quot;)">⏱ Bắt đầu Bú</button><button type="button" class="secondary" onclick="startCareTimer(&quot;sleep&quot;)">⏱ Bắt đầu Ngủ</button></div>';return}var sec=Math.max(0,Math.floor((Date.now()-new Date(t.startedAt).getTime())/1000)),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),ss=sec%60;box.innerHTML='<div class="careTimerRunning"><b>⏱ '+esc(careTypeMeta(t.type).label)+' đang chạy</b><span>'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')+'</span><div><button type="button" class="ok" onclick="stopCareTimer()">Dừng & điền giờ</button><button type="button" class="danger" onclick="cancelCareTimer()">Hủy</button></div></div>'}
setInterval(renderCareTimerState,1000);
function resetCareForm(){setValSafe('careEditIndex','');setValSafe('careLinkedBagId','');setValSafe('cDate',today());setValSafe('cEndDate',today());setValSafe('cTimeFrom','');setValSafe('cTimeTo','');setValSafe('cDurationPreview','');setValSafe('cNote','');window.__careSelectedType='feed';selectCareType('feed');byId('careFormTitle').textContent='Ghi nhận chăm sóc hằng ngày';byId('careEditBadge').classList.add('hidden')}
function minutesBetweenTimes(f,t){if(!f||!t)return 0;var a=f.split(':').map(Number),b=t.split(':').map(Number);var m1=a[0]*60+a[1],m2=b[0]*60+b[1];if(m2<m1)m2+=1440;return Math.max(0,m2-m1)}
function fmtMinutes(min){min=Math.round(min||0);var h=Math.floor(min/60),m=min%60;return h? h+'h'+String(m).padStart(2,'0') : m+' phút'}
function newCareId(prefix){return (prefix||'CE')+'_'+Date.now()+'_'+Math.random().toString(16).slice(2,7)}
function getCareEventFromForm(db){
  var type=normalizeCareInputType(window.__careSelectedType||'feed'),timeFrom=byId('cTimeFrom').value,timeTo=byId('cTimeTo').value;
  var startDate=byId('cDate').value,endDate=(byId('cEndDate')&&byId('cEndDate').value)||startDate;
  if(!startDate){showToast('Vui lòng chọn ngày bắt đầu','warn');return null}
  if(!timeFrom){showToast('Vui lòng chọn Từ giờ','warn');return null}
  if(!endDate)endDate=startDate;
  if(timeTo&&endDate===startDate&&timeTo<timeFrom&&(type==='sleep'||type==='pump'||type==='feed')){
    if(confirm('Thời gian kết thúc sớm hơn thời gian bắt đầu. Tự động chuyển ngày kết thúc sang ngày hôm sau?')){endDate=addDaysISO(startDate,1);setValSafe('cEndDate',endDate)}
  }
  if(timeTo&&dateTimeMs(endDate,timeTo)<dateTimeMs(startDate,timeFrom)){showToast('Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu','warn');return null}
  var item={id:'',date:startDate,startDate:startDate,endDate:endDate,type:type,timeFrom:timeFrom,timeTo:timeTo,amount:Number((byId('cAmount')&&byId('cAmount').value)||0),unit:'',source:'',milkBagId:'',milkSources:[],storage:'',status:'',note:byId('cNote').value.trim(),extra:{},updatedAt:new Date().toISOString()};
  if(type==='feed'){
    item.unit='ml';item.source=(byId('cFeedSource')&&byId('cFeedSource').value)||'direct';
    if(item.source==='stored'){
      var sources=collectMilkSourcesFromForm().filter(function(s){return s.bagId||s.usedMl});
      if(!sources.length){showToast('Vui lòng chọn ít nhất một túi sữa trong kho','warn');return null}
      var seen={},total=0;
      for(var i=0;i<sources.length;i++){var s=sources[i];if(!s.bagId){showToast('Vui lòng chọn đầy đủ túi sữa','warn');return null}if(seen[s.bagId]){showToast('Không chọn trùng túi sữa','warn');return null}seen[s.bagId]=true;if(Number(s.usedMl||0)<=0){showToast('Vui lòng nhập ml sử dụng từ từng túi','warn');return null}total+=Number(s.usedMl||0)}
      item.milkSources=sources;item.extra.milkSources=sources;item.milkBagId=sources[0].bagId;item.amount=total;
    }
    if(item.source!=='direct'&&item.amount<=0){showToast('Vui lòng nhập số ml bé bú','warn');return null}
  }
  if(type==='pump'){item.unit='ml';item.source='pump';item.extra.side=(byId('cPumpSide')&&byId('cPumpSide').value)||'';item.storage=(byId('cStorage')&&byId('cStorage').value)||'Ngăn mát';item.status='Đang bảo quản';if(byId('cStatus'))byId('cStatus').value='Đang bảo quản';item.extra.expireDate=(byId('cExpireDate')&&byId('cExpireDate').value)||milkExpireDateTimeFor(item.storage);if(item.amount<=0){showToast('Vui lòng nhập số ml hút sữa','warn');return null}}
  if(type==='sleep'){item.unit='phút';if(timeTo){item.amount=minutesBetweenDateTimes(startDate,timeFrom,endDate,timeTo);item.status='Bé đã dậy'}else{item.timeTo='';item.endDate=startDate;item.amount=0;item.status='Bé đang ngủ'}}
  if(type==='diaper'){item.unit='tã';item.amount=item.amount||1;item.extra.diaperType=(byId('cDiaperType')&&byId('cDiaperType').value)||'wet';item.extra.pee=diaperPeeCount(item);item.extra.poop=diaperPoopCount(item)}
  if(type==='medicine'){item.extra.name=(byId('cMedicineName')&&byId('cMedicineName').value||'').trim();item.amount=Number((byId('cMedicineDose')&&byId('cMedicineDose').value)||0);item.unit=(byId('cMedicineUnit')&&byId('cMedicineUnit').value||'').trim();if(!item.extra.name||item.amount<=0){showToast('Vui lòng nhập tên thuốc và liều lượng','warn');return null}}
  if(type==='temperature'){item.amount=Number((byId('cTemperature')&&byId('cTemperature').value)||0);item.unit='°C';item.extra.site=(byId('cTemperatureSite')&&byId('cTemperatureSite').value)||'Nách';if(item.amount<30||item.amount>45){showToast('Nhiệt độ không hợp lệ','warn');return null}}
  if(type==='spitup'){item.amount=1;item.unit='lần';item.extra.level=(byId('cSpitupLevel')&&byId('cSpitupLevel').value)||'Ít';item.extra.afterFeedMin=Number((byId('cSpitupAfter')&&byId('cSpitupAfter').value)||0);item.extra.kind=(byId('cSpitupType')&&byId('cSpitupType').value)||'Trớ'}
  return item;
}
function findMilkBag(db,id){return (db.milkInventory||[]).find(function(b){return b.id===id})}
function releaseCareInventory(db,old){if(!old)return true;if(old.type==='feed'&&old.source==='stored'){var sources=bagSourcesFromEvent(old);sources.forEach(function(src){var bag=findMilkBag(db,src.bagId);if(bag){var restore=Number(src.usedMl||0)+Number(src.discardMl||0);bag.remaining=(Number(bag.remaining)||0)+restore;if(src.discardMl){bag.discarded=Math.max(0,Number(bag.discarded||0)-Number(src.discardMl||0));}bag.status=bag.remaining>0?'Đang bảo quản':'Đã sử dụng hết';bag.updatedAt=new Date().toISOString()}})}return true}
function applyCareInventory(db,item,old){
  if(item.type==='feed'&&item.source==='stored'){
    var sources=bagSourcesFromEvent(item);for(var i=0;i<sources.length;i++){var src=sources[i],bag=findMilkBag(db,src.bagId);if(!bag){showToast('Không tìm thấy túi sữa '+src.bagId,'error');return false}if((bag.status||'Đang bảo quản')!=='Đang bảo quản'){showToast('Túi sữa '+milkBagDisplayId(bag)+' không còn khả dụng','warn');return false}if(Number(src.usedMl||0)>Number(bag.remaining||0)){showToast('Số ml dùng từ túi '+milkBagDisplayId(bag)+' lớn hơn lượng còn lại','warn');return false}}
    item.extra=item.extra||{};item.extra.milkBagSnapshots=[];
    sources.forEach(function(src){
      var bag=findMilkBag(db,src.bagId), beforeRemaining=Number(bag.remaining||0), used=Number(src.usedMl||0);
      var discard=0, action=src.remainderAction||'keep';
      bag.remaining=beforeRemaining-used;
      if(action!=='keep'&&bag.remaining>0){discard=Number(bag.remaining||0);bag.discarded=Number(bag.discarded||0)+discard;bag.remaining=0;bag.status='Đã bỏ';bag.discardReason=src.discardReason||'Đổ bỏ phần còn lại';bag.discardedAt=new Date().toISOString();}
      else{bag.status=bag.remaining>0?'Đang bảo quản':'Đã sử dụng hết';}
      bag.usedAt=new Date().toISOString();bag.updatedAt=new Date().toISOString();
      src.discardMl=discard;src.discardReason=discard?(src.discardReason||'Đổ bỏ phần còn lại'):'';
      item.extra.milkBagSnapshots.push({id:bag.id,amount:Number(bag.amount||0),used:used,discarded:discard,remainderAction:action,discardReason:src.discardReason||'',remainingBefore:beforeRemaining,remainingAfter:Number(bag.remaining||0),statusAfter:bag.status,storage:bag.storage||'',expireDateTime:bag.expireDateTime||bag.expireDate||''});
    });
    item.milkSources=sources;item.extra.milkSources=sources;
    item.extra.milkBagSnapshot=item.extra.milkBagSnapshots[0]||null;
  }
  if(item.type==='pump'){
    var linked=(old&&old.linkedBagId)||byId('careLinkedBagId').value;
    if(linked){var b=findMilkBag(db,linked);if(b){var used=Math.max(0,Number(b.amount||0)-Number(b.remaining||0));b.amount=Number(item.amount||0);b.remaining=Math.max(0,Number(item.amount||0)-used);b.status=b.remaining>0?item.status:'Đã sử dụng hết';b.storage=item.storage;b.expireDate=item.extra.expireDate||'';b.expireDateTime=item.extra.expireDate||'';b.date=item.date;b.startDate=item.startDate;b.endDate=item.endDate;b.timeFrom=item.timeFrom;b.timeTo=item.timeTo;b.note=item.note;b.updatedAt=new Date().toISOString();item.linkedBagId=b.id}}
    else{var id=uniqueMilkBagId(db,item.date);db.milkInventory.unshift({id:id,shortId:id,pumpEventId:item.id,date:item.date,startDate:item.startDate,endDate:item.endDate,timeFrom:item.timeFrom,timeTo:item.timeTo,amount:Number(item.amount||0),remaining:Number(item.amount||0),status:item.status||'Đang bảo quản',storage:item.storage||'Ngăn mát',expireDate:item.extra.expireDate||'',expireDateTime:item.extra.expireDate||'',note:item.note||'',createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});item.linkedBagId=id}
  }
  return true;
}
function saveCareEvent(){
  var db=load(),idx=byId('careEditIndex').value,old=null;
  var item=getCareEventFromForm(db);if(!item)return;
  var now=new Date().toISOString();
  if(idx!==''&&db.careEvents[Number(idx)]){old=JSON.parse(JSON.stringify(db.careEvents[Number(idx)]));item.id=old.id||newCareId('CE');item.createdAt=old.createdAt||now;releaseCareInventory(db,old);if(!applyCareInventory(db,item,old)){if(old)applyCareInventory(db,old,null);return}db.careEvents[Number(idx)]=item;showToast('Cập nhật chăm sóc thành công','success')}
  else{item.id=newCareId('CE');item.createdAt=now;if(!applyCareInventory(db,item,null))return;db.careEvents.unshift(item);showToast('Thêm ghi nhận thành công','success')}
  save(db);resetCareForm();showPage('careTimeline')
}
function editCareEvent(i){
  var x=load().careEvents[i];if(!x)return;
  var originalType=x.type||'feed';
  var inputType=normalizeCareInputType(originalType);
  setValSafe('careEditIndex',i);setValSafe('careLinkedBagId',x.linkedBagId||'');
  window.__careSelectedType=inputType;selectCareType(inputType);
  setValSafe('cDate',x.startDate||x.date);setValSafe('cEndDate',x.endDate||x.date||x.startDate);setValSafe('cTimeFrom',x.timeFrom);setValSafe('cTimeTo',x.timeTo);setValSafe('cNote',x.note);setValSafe('cAmount',x.amount||'');syncCareDurationPreview();
  if(inputType==='feed'){
    setValSafe('cFeedSource',x.source||'direct');renderCareDynamicFields('feed',load());setValSafe('cFeedSource',x.source||'direct');setValSafe('cAmount',x.amount||'');toggleFeedSourceFields();
    if((x.source||'direct')==='stored'){
      var rows=byId('milkSourceRows');if(rows){rows.innerHTML='';bagSourcesFromEvent(x).forEach(function(s){addCareMilkSourceRow(s)});if(!bagSourcesFromEvent(x).length)addCareMilkSourceRow();updateCareMilkSourceTotal();}
    }
  }
  if(inputType==='pump'){setValSafe('cPumpSide',(x.extra&&x.extra.side)||'Cả hai');setValSafe('cStorage',x.storage||'Ngăn mát');setValSafe('cStatus',x.status||'Đang bảo quản');setValSafe('cExpireDate',(x.extra&&x.extra.expireDate)||'');setValSafe('cAmount',x.amount||'')}
  if(inputType==='diaper'){setValSafe('cAmount',x.amount||1);selectDiaperType((x.extra&&x.extra.diaperType)||legacyPeePoopToDiaperType(originalType)||'wet')}
  if(originalType==='medicine'){setValSafe('cMedicineName',(x.extra&&x.extra.name)||'');setValSafe('cMedicineDose',x.amount||'');setValSafe('cMedicineUnit',x.unit||'')}
  if(originalType==='temperature'){setValSafe('cTemperature',x.amount||'');setValSafe('cTemperatureSite',(x.extra&&x.extra.site)||'Nách')}
  if(originalType==='spitup'){setValSafe('cSpitupLevel',(x.extra&&x.extra.level)||'Ít');setValSafe('cSpitupAfter',(x.extra&&x.extra.afterFeedMin)||'');setValSafe('cSpitupType',(x.extra&&x.extra.kind)||'Trớ')}
  byId('careFormTitle').textContent='Sửa ghi nhận chăm sóc';byId('careEditBadge').classList.remove('hidden');showPage('careAdd');window.scrollTo(0,0)
}
function copyCareEvent(i){var x=load().careEvents[i];if(!x)return;editCareEvent(i);setValSafe('careEditIndex','');setValSafe('careLinkedBagId','');byId('careFormTitle').textContent='Sao chép ghi nhận chăm sóc';byId('careEditBadge').classList.add('hidden');showToast('Đã sao chép, bấm Lưu để tạo dòng mới','success')}
function deleteCareEvent(i){if(!confirm('Xóa ghi nhận chăm sóc này?'))return;var db=load(),old=db.careEvents[i];if(!old){showToast('Không tìm thấy dữ liệu','error');return}if(old.type==='pump'&&old.linkedBagId){var bag=findMilkBag(db,old.linkedBagId);if(bag&&Number(bag.remaining)!==Number(bag.amount)){showToast('Không thể xóa lần hút sữa vì túi sữa đã được sử dụng một phần','warn');return}db.milkInventory=(db.milkInventory||[]).filter(function(b){return b.id!==old.linkedBagId})}else{releaseCareInventory(db,old)}db.careEvents.splice(i,1);save(db);showToast('Xóa ghi nhận thành công','success')}
function eventDateRangeLabel(x){var sd=x.startDate||x.date||'',ed=x.endDate||sd;var tf=x.timeFrom||'',tt=x.timeTo||'';if(x&&x.type==='sleep'&&!tt)return (sd?fmtDate(sd)+' ':'')+tf+' → Bé đang ngủ';if(ed&&sd&&ed!==sd)return fmtDate(sd)+' '+tf+' → '+fmtDate(ed)+' '+tt;return (timeRangeOf(x)||tf||'')}
function careEventText(x){var m=careTypeMeta(x.type),txt='';if(x.type==='feed'){txt=(x.source==='direct'?'Bú mẹ trực tiếp':x.source==='stored'?'Bú từ kho sữa':'Sữa công thức')+(x.amount?(' · '+x.amount+'ml'):'');if(x.source==='stored'){var srcs=bagSourcesFromEvent(x),count=srcs.length,discard=srcs.reduce(function(t,s){return t+Number(s.discardMl||0)},0);txt+=' · '+count+' túi sữa';if(discard>0)txt+=' · bỏ '+discard+'ml'}}else if(x.type==='pump')txt='Hút '+(x.amount||0)+'ml · '+(x.storage||'')+' · '+(x.status||'');else if(x.type==='sleep')txt=(x.timeTo?'Ngủ '+fmtMinutes(x.amount||0):'Bé đang ngủ');else if(x.type==='diaper'){var pee=diaperPeeCount(x),poop=diaperPoopCount(x);txt=(x.amount||1)+' tã · '+diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet')+' · tự tính: 💧 '+pee+' / 💩 '+poop}else if(x.type==='pee')txt=(x.amount||1)+' lần tè (dữ liệu cũ)';else if(x.type==='poop')txt=(x.amount||1)+' lần phân (dữ liệu cũ)'+((x.extra&&x.extra.color)?' · '+x.extra.color:'')+((x.extra&&x.extra.texture)?' · '+x.extra.texture:'');else if(x.type==='medicine')txt=((x.extra&&x.extra.name)||'Thuốc')+' · '+(x.amount||0)+' '+(x.unit||'');else if(x.type==='temperature')txt=(x.amount||0)+'°C · '+((x.extra&&x.extra.site)||'');else if(x.type==='spitup')txt=((x.extra&&x.extra.kind)||'Trớ')+' · '+((x.extra&&x.extra.level)||'Ít')+((x.extra&&x.extra.afterFeedMin)?' · sau bú '+x.extra.afterFeedMin+' phút':'');return txt}
function sortedCareEvents(db){return (db.careEvents||[]).map(function(x,i){var y=Object.assign({},x);y._idx=i;return y}).sort(function(a,b){return (((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare((a.startDate||a.date||'')+(a.timeFrom||'')))})}
function renderCareTimeline(db){var box=byId('careTimelineBox');if(!box)return;var arr=sortedCareEvents(db);var fd=byId('careFilterDate')&&byId('careFilterDate').value,ft=byId('careFilterType')&&byId('careFilterType').value;if(fd)arr=arr.filter(function(x){return (x.startDate||x.date)===fd || (x.type==='sleep'&&careOverlapMinutesOnDate(x,fd)>0)});if(ft&&ft!=='all')arr=arr.filter(function(x){return x.type===ft});if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có ghi nhận chăm sóc.</p></div>';return}var groups={};arr.forEach(function(x){var k=x.startDate||x.date||'Không rõ ngày';(groups[k]=groups[k]||[]).push(x)});box.innerHTML=Object.keys(groups).sort(function(a,b){return b.localeCompare(a)}).map(function(d){return '<div class="careDayGroup"><h3>'+weekdayName(d)+', '+fmtDate(d)+'</h3>'+groups[d].map(function(x){var m=careTypeMeta(x.type);return '<div class="careEvent"><div class="careEventIcon">'+m.icon+'</div><div class="careEventBody"><b>'+esc(m.label)+' · '+esc(eventDateRangeLabel(x))+'</b><div class="careEventMeta">'+esc(careEventText(x))+(x.note?'<br>'+esc(x.note):'')+'</div><div class="careEventActions"><button class="ghost" onclick="editCareEvent('+x._idx+')">Sửa</button><button class="secondary" onclick="copyCareEvent('+x._idx+')">Sao chép</button><button class="danger" onclick="deleteCareEvent('+x._idx+')">Xóa</button></div></div></div>'}).join('')+'</div>'}).join('')}
function dayBoundsMs(date){var start=new Date(date+'T00:00:00').getTime();return {start:start,end:start+86400000}}
function careEventStartMs(x){return dateTimeMs(x.startDate||x.date,x.timeFrom)}
function careEventEndMs(x){return dateTimeMs(x.endDate||x.startDate||x.date,x.timeTo||x.timeFrom)}
function careOverlapMinutesOnDate(x,date){var s=careEventStartMs(x),e=careEventEndMs(x);if(s===null||e===null||e<=s)return 0;var b=dayBoundsMs(date);var ov=Math.max(0,Math.min(e,b.end)-Math.max(s,b.start));return Math.round(ov/60000)}
function careEventAmountForDate(type,x,date){if(type==='sleep')return careOverlapMinutesOnDate(x,date);if(type==='pee'&&x.type==='diaper')return diaperPeeCount(x);if(type==='poop'&&x.type==='diaper')return diaperPoopCount(x);return Number(x.amount||0)}
function careSummaryForDate(db,date){var ev=(db.careEvents||[]);var sum={feedMl:0,feedCount:0,pumpMl:0,diaper:0,pee:0,poop:0,sleepMin:0,medicine:0,temperatureCount:0,latestTemperature:null,spitup:0};ev.forEach(function(x){var type=x.type;if(type==='sleep'){var sm=careOverlapMinutesOnDate(x,date);if(sm>0)sum.sleepMin+=sm;return}if((x.startDate||x.date)!==date)return;var a=Number(x.amount||0);if(type==='feed'){sum.feedCount++;sum.feedMl+=a}if(type==='pump')sum.pumpMl+=a;if(type==='diaper'){sum.diaper+=a||1;sum.pee+=diaperPeeCount(x);sum.poop+=diaperPoopCount(x)}if(type==='pee')sum.pee+=a||1;if(type==='poop')sum.poop+=a||1;if(type==='medicine')sum.medicine++;if(type==='temperature'){sum.temperatureCount++;if(sum.latestTemperature===null)sum.latestTemperature=a}if(type==='spitup')sum.spitup+=a||1});sum.storedMl=(db.milkInventory||[]).filter(function(b){return b.status==='Đang bảo quản'}).reduce(function(t,b){return t+Number(b.remaining||0)},0);sum.usedStoredMl=(db.milkInventory||[]).reduce(function(t,b){return t+Math.max(0,Number(b.amount||0)-Number(b.remaining||0))},0);return sum}
function careEventsForDate(db,date,type){var mapped=(db.careEvents||[]).map(function(x,i){var y=Object.assign({},x);y._idx=i;return y});if(type==='pee'||type==='poop'){return mapped.filter(function(x){if((x.startDate||x.date)!==date)return false;if(x.type===type)return true;if(x.type==='diaper')return type==='pee'?diaperPeeCount(x)>0:diaperPoopCount(x)>0;return false}).map(function(x){if(x.type==='diaper'){var y=Object.assign({},x);y._derivedType=type;y._derivedAmount=type==='pee'?diaperPeeCount(x):diaperPoopCount(x);return y}return x}).sort(function(a,b){return ((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare((a.startDate||a.date||'')+(a.timeFrom||''))})}return mapped.filter(function(x){if(type&&x.type!==type)return false;if(x.type==='sleep')return ((x.startDate||x.date)===date)||careOverlapMinutesOnDate(x,date)>0;return (x.startDate||x.date)===date}).sort(function(a,b){return ((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare((a.startDate||a.date||'')+(a.timeFrom||''))})}
function careTypeDetailTitle(type){var m=careTypeMeta(type);return m.icon+' '+m.label}
function milkBagLabel(db,id,snapshot){if(!id)return '';if(snapshot){return milkBagDisplayId(snapshot)+' · '+(snapshot.amount||0)+'ml · dùng '+(snapshot.used||0)+'ml · còn sau bú '+(snapshot.remainingAfter||0)+'ml · '+(snapshot.statusAfter||'')+(snapshot.expireDateTime?' · HSD '+fmtMilkExpire({expireDateTime:snapshot.expireDateTime})+' · '+milkTimeLeftText({expireDateTime:snapshot.expireDateTime}):'')}var b=findMilkBag(db,id);return b?milkBagDisplayId(b)+' · '+(b.amount||0)+'ml · còn hiện tại '+(b.remaining||0)+'ml · '+(b.status||'')+(b.expireDate||b.expireDateTime?' · HSD '+fmtMilkExpire(b)+' · '+milkTimeLeftText(b):''):'Túi '+id}
function milkSourcesLabel(db,x){var sources=bagSourcesFromEvent(x),snaps=(x.extra&&Array.isArray(x.extra.milkBagSnapshots))?x.extra.milkBagSnapshots:[];if(!sources.length&&x.milkBagId)return milkBagLabel(db,x.milkBagId,x.extra&&x.extra.milkBagSnapshot);return sources.map(function(s,i){var snap=snaps.find(function(ss){return ss.id===s.bagId})||null;return milkBagLabel(db,s.bagId,snap||{id:s.bagId,used:s.usedMl})}).join(' | ')}

function careDetailSummaryHtml(db,type,date,arr){
  var total=arr.reduce(function(t,x){return t+careChartMetric(type,x,date)},0);
  var unit=careChartUnit(type);
  var meta=careTypeMeta(type);
  var extra='';
  if(type==='feed'){
    var stored=arr.filter(function(x){return x.source==='stored'}).length;
    var direct=arr.filter(function(x){return x.source==='direct'}).length;
    var formula=arr.filter(function(x){return x.source==='formula'}).length;
    extra=' · '+direct+' bú trực tiếp · '+stored+' bú kho · '+formula+' sữa công thức';
  }
  if(type==='pump'){
    var storedMl=(db.milkInventory||[]).filter(function(b){return b.date===date&&b.status==='Đang bảo quản'}).reduce(function(t,b){return t+Number(b.remaining||0)},0);
    extra=' · còn bảo quản '+storedMl+'ml';
  }
  return '<div class="careDetailItem" style="background:var(--soft)"><b>'+esc(meta.icon+' Tổng quan')+'</b><small>'+esc(arr.length+' record · Tổng '+total+' '+unit+extra)+'</small></div>';
}
function careDetailHtml(db,x){var displayType=x._derivedType||x.type;var meta=careTypeMeta(displayType);var rows=[];rows.push('Thời gian: '+eventDateRangeLabel(x));
  if(x.type==='feed'){rows.push('Hình thức: '+(x.source==='direct'?'Bú mẹ trực tiếp':x.source==='stored'?'Bú từ kho sữa đã hút':'Sữa công thức'));if(x.amount)rows.push('Số lượng: '+x.amount+'ml');if(x.source==='stored')rows.push('Nguồn túi sữa: '+milkSourcesLabel(db,x));}
  if(x.type==='pump'){rows.push('Số lượng hút: '+(x.amount||0)+'ml');rows.push('Bên hút: '+((x.extra&&x.extra.side)||'--'));rows.push('Bảo quản: '+(x.storage||'--'));rows.push('Trạng thái: '+(x.status||'--'));if(x.linkedBagId)rows.push('Mã túi sữa: '+x.linkedBagId);if(x.extra&&x.extra.expireDate)rows.push('HSD: '+fmtMilkExpire({expireDateTime:x.extra.expireDate,expireDate:x.extra.expireDate}));}
  if(x.type==='sleep'){rows.push(x.timeTo?'Tổng ngủ: '+fmtMinutes(x.amount||0):'Trạng thái: Bé đang ngủ');}
  if(x.type==='diaper'){var pee=diaperPeeCount(x),poop=diaperPoopCount(x);rows.push('Số tã: '+(x.amount||1));rows.push('Loại tã: '+diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet'));rows.push('Tự động cộng: đi tè +'+pee+' / đi phân +'+poop);if(x._derivedType==='pee')rows.push('Chi tiết đang xem: Đi tè +'+pee);if(x._derivedType==='poop')rows.push('Chi tiết đang xem: Đi phân +'+poop);}
  if(x.type==='pee'){rows.push('Số lần tè: '+(x.amount||1)+' (dữ liệu cũ)');}
  if(x.type==='poop'){rows.push('Số lần phân: '+(x.amount||1)+' (dữ liệu cũ)');if(x.extra&&x.extra.color)rows.push('Màu phân: '+x.extra.color);if(x.extra&&x.extra.texture)rows.push('Tính chất: '+x.extra.texture);}
  return '<div class="careDetailItem"><b>'+esc(meta.icon+' '+meta.label)+' · '+esc(fmtDate(x.startDate||x.date))+'</b><small>'+rows.map(esc).join('<br>')+'</small>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'</div>';
}
function careTypeOptionsHtml(selected){var types=['feed','pump','milk','sleep','diaper','pee','poop','medicine','temperature','spitup'];return types.map(function(t){var m=careTypeMeta(t);var label=m.icon+' '+m.label+((t==='pee'||t==='poop')?' (tự tính từ Thay tã)':'');return '<option value="'+esc(t)+'" '+(selected===t?'selected':'')+'>'+esc(label)+'</option>'}).join('')}
function closeCareDetailModal(){var o=byId('careDetailOverlay');if(o)o.classList.remove('show');document.body.classList.remove('careModalOpen');var y=window.__careModalScrollY||0;document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';if(y)window.scrollTo(0,y)}
function changeCareDetailFromModal(){var type=(byId('careDetailTypeSelect')&&byId('careDetailTypeSelect').value)||'feed';var date=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());renderCareStatDetail(type,date)}
function renderCareStatDetail(type,date){
  var db=load();date=date||((byId('careStatsDate')&&byId('careStatsDate').value)||today());
  window.__careStatsSelectedType=type;renderCareStats(db,true);
  var arr=(type==='milk')?(db.milkInventory||[]).map(function(b,i){var y=Object.assign({},b);y._idx=i;return y}).sort(function(a,b){return String((b.date||b.startDate||'')+(b.timeFrom||'')).localeCompare(String((a.date||a.startDate||'')+(a.timeFrom||'')))}):careEventsForDate(db,date,type);var title=careTypeDetailTitle(type);
  var body='';
  if(!arr.length){body='<p class="notice">Không có dữ liệu chi tiết cho loại này trong ngày đã chọn.</p>'}
  else if(type==='milk'){body='<div class="milkInventorySwipeHint">Vuốt sang trái trên túi đang bảo quản để huỷ túi.</div>'+arr.map(function(b){return milkBagHtml(b,b._idx)}).join('')}
  else{body=arr.map(function(x){return careDetailHtml(db,x)}).join('')}
  var summary=type==='milk'?'<div class="careDetailItem" style="background:var(--soft)"><b>🧊 Tổng quan</b><small>'+esc(arr.length+' túi tất cả trạng thái · Đang bảo quản '+arr.filter(function(b){return b.status==='Đang bảo quản'}).length+' túi · Tổng còn '+arr.reduce(function(t,b){return t+Number(b.remaining||0)},0)+' ml')+'</small></div>':careDetailSummaryHtml(db,type,date,arr);
  var content='<div class="careModalSticky"><div class="careDetailModalHead"><div><h3 id="careDetailModalTitle">'+esc(title)+'</h3><small>'+esc(weekdayName(date)+', '+fmtDate(date))+' · '+arr.length+' record</small></div><button class="careModalClose" onclick="closeCareDetailModal()">✕</button></div>'+
    '<div class="careDetailPicker"><div><label>Loại dữ liệu</label><select id="careDetailTypeSelect" onchange="changeCareDetailFromModal()">'+careTypeOptionsHtml(type)+'</select></div><div><label>Ngày</label><input id="careDetailDateSelect" type="date" value="'+esc(date)+'" onchange="changeCareDetailFromModal()"></div></div></div><div class="careDetailScroll">'+summary+body+'</div>';
  var modal=byId('careDetailModalContent'),overlay=byId('careDetailOverlay');if(modal)modal.innerHTML=content;if(overlay){window.__careModalScrollY=window.scrollY||document.documentElement.scrollTop||0;document.body.style.top='-'+window.__careModalScrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';overlay.classList.add('show');document.body.classList.add('careModalOpen')}
}
function renderCareStats(db,keepDetail){var box=byId('careStatsBox');if(!box)return;var date=(byId('careStatsDate')&&byId('careStatsDate').value)||today();if(byId('careStatsDate')&&!byId('careStatsDate').value)byId('careStatsDate').value=date;var s=careSummaryForDate(db,date);var selected=window.__careStatsSelectedType||'';box.innerHTML='<h3>'+weekdayName(date)+', '+fmtDate(date)+'</h3><div class="careStatsGrid">'+
  '<div class="careStatBox '+(selected==='feed'?'active':'')+'" onclick="renderCareStatDetail(\'feed\',\''+date+'\')"><div class="ico">🍼</div><b>'+s.feedMl+'ml</b><span>'+s.feedCount+' cữ bú</span></div>'+ 
  '<div class="careStatBox '+(selected==='pump'?'active':'')+'" onclick="renderCareStatDetail(\'pump\',\''+date+'\')"><div class="ico">🥛</div><b>'+s.pumpMl+'ml</b><span>sữa đã hút</span></div>'+ 
  '<div class="careStatBox '+(selected==='milk'?'active':'')+'" onclick="renderCareStatDetail(\'milk\',\''+date+'\')"><div class="ico">🧊</div><b>'+s.storedMl+'ml</b><span>đang bảo quản</span></div>'+ 
  '<div class="careStatBox '+(selected==='diaper'?'active':'')+'" onclick="renderCareStatDetail(\'diaper\',\''+date+'\')"><div class="ico">🧷</div><b>'+s.diaper+'</b><span>tã</span></div>'+ 
  '<div class="careStatBox '+(selected==='pee'?'active':'')+'" onclick="renderCareStatDetail(\'pee\',\''+date+'\')"><div class="ico">💧</div><b>'+s.pee+'</b><span>lần tè</span></div>'+ 
  '<div class="careStatBox '+(selected==='poop'?'active':'')+'" onclick="renderCareStatDetail(\'poop\',\''+date+'\')"><div class="ico">💩</div><b>'+s.poop+'</b><span>lần phân</span></div>'+ 
  '<div class="careStatBox '+(selected==='sleep'?'active':'')+'" onclick="renderCareStatDetail(&quot;sleep&quot;,&quot;'+date+'&quot;)"><div class="ico">😴</div><b>'+fmtMinutes(s.sleepMin)+'</b><span>tổng ngủ</span></div>'+ 
  '<div class="careStatBox '+(selected==='medicine'?'active':'')+'" onclick="renderCareStatDetail(&quot;medicine&quot;,&quot;'+date+'&quot;)"><div class="ico">💊</div><b>'+s.medicine+'</b><span>lần uống thuốc</span></div>'+ 
  '<div class="careStatBox '+(selected==='temperature'?'active':'')+'" onclick="renderCareStatDetail(&quot;temperature&quot;,&quot;'+date+'&quot;)"><div class="ico">🌡️</div><b>'+(s.latestTemperature===null?'--':s.latestTemperature+'°C')+'</b><span>'+s.temperatureCount+' lần đo</span></div>'+ 
  '<div class="careStatBox '+(selected==='spitup'?'active':'')+'" onclick="renderCareStatDetail(&quot;spitup&quot;,&quot;'+date+'&quot;)"><div class="ico">🤮</div><b>'+s.spitup+'</b><span>lần trớ</span></div></div>';
  if(byId('careDetailBox'))byId('careDetailBox').innerHTML='';
  if(byId('milkInventoryBox'))byId('milkInventoryBox').innerHTML='';if(byId('careChartBox')&&!byId('careChartBox').classList.contains('hidden'))renderCareCharts(db);
  syncCareChartToggleState();
}
function careChartMetric(type,x,date){var a=(date?careEventAmountForDate(type,x,date):Number(x.amount||0));if(type==='feed'||type==='pump')return a;if(type==='sleep')return Math.round((a||0)/60*10)/10;if(type==='diaper')return a||1;if(type==='medicine'||type==='spitup')return 1;if(type==='temperature')return a;if(type==='pee')return x.type==='diaper'?diaperPeeCount(x):(a||1);if(type==='poop')return x.type==='diaper'?diaperPoopCount(x):(a||1);return a}
function careChartUnit(type){if(type==='feed'||type==='pump')return 'ml';if(type==='sleep')return 'giờ';if(type==='diaper')return 'tã';if(type==='temperature')return '°C';return 'lần'}
function careAggValue(db,type,date){var arr=careEventsForDate(db,date,type);return arr.reduce(function(t,x){return t+careChartMetric(type,x,date)},0)}
function isoMonth(date){return (date||today()).slice(0,7)}
function lastDayOfMonthISO(ym){var p=ym.split('-').map(Number);return localDateISO(new Date(p[0],p[1],0))}
function careChartRange(){var mode=(byId('careChartMode')&&byId('careChartMode').value)||'day';var base=(byId('careChartDate')&&byId('careChartDate').value)||today();var month=(byId('careChartMonth')&&byId('careChartMonth').value)||isoMonth(base);var days=[];if(mode==='day'){days=[base];}
  else if(mode==='week'){var start=startOfWeekISO(base);for(var i=0;i<7;i++)days.push(addDaysISO(start,i));}
  else{var first=month+'-01',last=lastDayOfMonthISO(month),n=daysBetween(first,last);for(var j=0;j<=n;j++)days.push(addDaysISO(first,j));}
  return {mode:mode,base:base,month:month,days:days};
}
function careMiniChartSvg(points,label,unit){
  var chartType=(byId('careChartType')&&byId('careChartType').value)||'bar';
  var vals=points.map(function(p){return Number(p.value||0)});var max=Math.max.apply(null,vals.concat([1]));var w=640,h=190,pad=34;
  var stepBase=(w-pad*2)/Math.max(points.length,1);
  var labels=points.map(function(p,i){if(points.length>12 && i%Math.ceil(points.length/8)!==0)return '';var x=pad+i*stepBase+(chartType==='bar'?Math.max(8,stepBase-4)/2+2:0);return '<text x="'+x.toFixed(1)+'" y="'+(h-8)+'" text-anchor="middle">'+esc(p.short||p.label)+'</text>';}).join('');
  function valText(x,y,v){return '<text class="valueLabel" x="'+x.toFixed(1)+'" y="'+Math.max(16,y-6).toFixed(1)+'" text-anchor="middle">'+esc(v)+'</text>'}
  if(chartType==='line'){
    var stepLine=points.length>1?(w-pad*2)/(points.length-1):0;
    var coords=points.map(function(p,i){var x=pad+i*stepLine;var y=h-pad-(Number(p.value||0)/max)*(h-pad*2);return {x:x,y:y,p:p}});
    var poly=coords.map(function(c){return c.x.toFixed(1)+','+c.y.toFixed(1)}).join(' ');
    var dots=coords.map(function(c){return '<circle cx="'+c.x.toFixed(1)+'" cy="'+c.y.toFixed(1)+'" r="4"><title>'+esc(c.p.label)+': '+esc(c.p.value)+' '+esc(unit)+'</title></circle>'+valText(c.x,c.y,c.p.value)}).join('');
    return '<svg class="careMiniChart" viewBox="0 0 '+w+' '+h+'"><line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" opacity=".25"/><text x="'+pad+'" y="18">Max '+esc(max)+' '+esc(unit)+'</text><polyline points="'+poly+'"/>'+dots+labels+'</svg>';
  }
  var barW=Math.max(8,stepBase-4);var bars=points.map(function(p,i){var x=pad+i*stepBase+2;var bh=(Number(p.value||0)/max)*(h-pad*2);var y=h-pad-bh;var cx=x+barW/2;return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(1,bh).toFixed(1)+'" rx="5"><title>'+esc(p.label)+': '+esc(p.value)+' '+esc(unit)+'</title></rect>'+valText(cx,y,p.value);}).join('');
  return '<svg class="careMiniChart" viewBox="0 0 '+w+' '+h+'"><line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" opacity=".25"/><text x="'+pad+'" y="18">Max '+esc(max)+' '+esc(unit)+'</text>'+bars+labels+'</svg>';
}
function careChartDataForType(db,type,range){if(range.mode==='day'){var arr=careEventsForDate(db,range.base,type);return arr.map(function(x,i){return {label:(timeRangeOf(x)||x.timeFrom||('#'+(i+1))),short:(timeRankOf(x)||String(i+1)),value:smartNum(careChartMetric(type,x,range.base),2)}})}return range.days.map(function(d){return {label:fmtDate(d),short:d.slice(8,10),value:smartNum(careAggValue(db,type,d),2)}})}
function syncCareChartToggleState(){var box=byId('careChartBox'),btn=byId('careChartToggleBtn'),stats=byId('careStatsBox'),detail=byId('careDetailBox');var active=!!(box&&!box.classList.contains('hidden'));if(btn){btn.classList.toggle('active',active);btn.textContent=active?'📈 Đang xem biểu đồ':'📈 Xem biểu đồ'}if(stats)stats.classList.toggle('careStatsHidden',active);if(detail)detail.classList.toggle('careStatsHidden',active)}
function toggleCareCharts(){var box=byId('careChartBox');if(!box)return;box.classList.toggle('hidden');if(!box.classList.contains('hidden'))renderCareCharts(load());syncCareChartToggleState()}
function syncCareChartControls(){var mode=(byId('careChartMode')&&byId('careChartMode').value)||'day';var dateWrap=byId('careChartDateWrap'),monthWrap=byId('careChartMonthWrap');if(dateWrap)dateWrap.classList.toggle('hiddenControl',mode==='month');if(monthWrap)monthWrap.classList.toggle('hiddenControl',mode!=='month')}
function renderCareCharts(db){var box=byId('careChartBox');if(!box)return;if(box.classList.contains('hidden'))return;if(!byId('careChartDate')){box.innerHTML='<div class="careChartPanel"><h3>Biểu đồ chăm sóc</h3><div class="careChartControls"><div><label>Chế độ xem</label><select id="careChartMode" onchange="syncCareChartControls();renderCareCharts(load())"><option value="day">Theo ngày</option><option value="week">Theo tuần</option><option value="month">Theo tháng</option></select></div><div><label>Loại biểu đồ</label><select id="careChartType" onchange="renderCareCharts(load())"><option value="bar">Cột</option><option value="line">Đường</option></select></div><div id="careChartDateWrap"><label>Chọn ngày</label><input id="careChartDate" type="date" value="'+today()+'" onchange="renderCareCharts(load())"></div><div id="careChartMonthWrap" class="hiddenControl"><label>Chọn tháng</label><input id="careChartMonth" type="month" value="'+isoMonth(today())+'" onchange="renderCareCharts(load())"></div></div><div class="careChartTypeHelp"><b>Gợi ý:</b> Biểu đồ cột dễ so sánh tổng ml/lần theo từng mốc; biểu đồ đường phù hợp xem xu hướng tăng giảm theo ngày, tuần, tháng.</div><div id="careChartsRender"></div></div>';syncCareChartControls();}
  var target=byId('careChartsRender');if(!target)return;var range=careChartRange();var title=range.mode==='day'?'Theo ngày '+fmtDate(range.base):(range.mode==='week'?'Theo tuần '+fmtDate(range.days[0])+' - '+fmtDate(range.days[6]):'Theo tháng '+range.month);var types=['feed','pump','milk','sleep','diaper','pee','poop','medicine','temperature','spitup'];target.innerHTML='<p class="notice">'+esc(title)+'. Mỗi loại có một biểu đồ riêng để Boss đánh giá xu hướng chăm sóc của bé.</p>'+types.map(function(type){var meta=careTypeMeta(type),unit=careChartUnit(type),points=careChartDataForType(db,type,range);var total=points.reduce(function(t,p){return t+Number(p.value||0)},0);return '<div class="careChartPanel"><h3>'+esc(meta.icon+' '+meta.label)+'</h3><small>Tổng: '+esc(total)+' '+esc(unit)+' · '+esc(points.length)+' mốc</small>'+careMiniChartSvg(points,meta.label,unit)+'</div>';}).join('');}
function milkBagHtml(b,idx){
  var isActive=(b.status||'Đang bảo quản')==='Đang bảo quản';
  var cls=(b.status==='Đã sử dụng hết'?'used finished ':'')+(milkExpireAt(b)<Date.now()?'expired ':'')+(isActive?'':' disabled');
  var reason=(b.cancelReason||b.discardReason||'');
  var meta='Ngày tạo/lưu trữ: '+milkCreatedText(b)+' · Hút: '+fmtDate(b.date)+' '+(timeRangeOf(b)||b.timeFrom||'')+' · '+(b.storage||'')+(b.expireDate||b.expireDateTime?' · HSD '+fmtMilkExpire(b)+' · '+milkTimeLeftText(b):'')+(reason?' · Lý do bỏ: '+reason:'');
  return '<div class="milkSwipeShell'+(isActive?'':' disabled')+'" data-milk-idx="'+idx+'" ontouchstart="milkSwipeStart(event,this)" ontouchmove="milkSwipeMove(event,this)" ontouchend="milkSwipeEnd(event,this)" onpointerdown="milkPointerStart(event,this)" onpointermove="milkPointerMove(event,this)" onpointerup="milkPointerEnd(event,this)" onpointercancel="milkPointerEnd(event,this)"><button type="button" class="milkSwipeCancel" onclick="cancelMilkBag('+idx+')">Huỷ túi</button><div class="milkBag '+cls+'"><b>'+esc(milkUrgencyIcon(b)+' '+milkBagDisplayId(b)+' · '+(b.remaining||0)+'/'+(b.amount||0)+'ml · '+(b.status||''))+(isActive?'':' <span class="disabledTag">Không khả dụng</span>')+'</b><small>'+esc(meta)+'</small>'+(b.note?'<p>'+esc(b.note)+'</p>':'')+'</div></div>';
}
function renderMilkInventory(db){var box=byId('milkInventoryBox');if(!box)return;var arr=(db.milkInventory||[]).map(function(b,i){var y=Object.assign({},b);y._idx=i;return y}).sort(function(a,b){var ar=(a.status==='Đang bảo quản'?0:a.status==='Đã sử dụng hết'?1:2),br=(b.status==='Đang bảo quản'?0:b.status==='Đã sử dụng hết'?1:2);return ar-br || milkExpireAt(a)-milkExpireAt(b)});if(!arr.length){box.innerHTML='<p class="notice">Chưa có kho sữa. Khi ghi nhận Hút sữa, app sẽ tự tạo túi sữa ở đây.</p>';return}box.innerHTML=arr.map(function(b){return milkBagHtml(b,b._idx)}).join('')}
function closeOtherMilkSwipes(current){
  document.querySelectorAll('.milkSwipeShell.open').forEach(function(row){if(row!==current)row.classList.remove('open')});
}
function milkSwipeStart(e,el){
  if(el.classList.contains('disabled'))return;
  var t=e.touches&&e.touches[0];if(!t)return;
  el.__sx=t.clientX;el.__sy=t.clientY;el.__swiping=false;el.__horizontal=false;
}
function milkSwipeMove(e,el){
  if(el.classList.contains('disabled')||el.__sx==null)return;
  var t=e.touches&&e.touches[0];if(!t)return;
  var dx=t.clientX-el.__sx,dy=t.clientY-el.__sy;
  if(!el.__horizontal&&Math.abs(dx)>14){
    if(Math.abs(dx)<=Math.abs(dy)*1.25)return;
    el.__horizontal=true;
  }
  if(!el.__horizontal)return;
  el.__swiping=true;e.preventDefault();
  if(dx<=-42){closeOtherMilkSwipes(el);el.classList.add('open')}
  else if(dx>=32){el.classList.remove('open')}
}
function milkSwipeEnd(e,el){
  if(el.__swiping){window.__milkSwipeLock=true;setTimeout(function(){window.__milkSwipeLock=false},250)}
  el.__sx=null;el.__sy=null;el.__swiping=false;el.__horizontal=false;
}
function milkPointerStart(e,el){
  if(e.pointerType==='touch'||el.classList.contains('disabled'))return;
  el.__px=e.clientX;el.__py=e.clientY;el.__pdrag=false;el.__phorizontal=false;
}
function milkPointerMove(e,el){
  if(el.__px==null)return;
  var dx=e.clientX-el.__px,dy=e.clientY-el.__py;
  if(!el.__phorizontal&&Math.abs(dx)>14){
    if(Math.abs(dx)<=Math.abs(dy)*1.25)return;
    el.__phorizontal=true;
  }
  if(!el.__phorizontal)return;
  el.__pdrag=true;
  if(dx<=-42){closeOtherMilkSwipes(el);el.classList.add('open')}
  else if(dx>=32){el.classList.remove('open')}
}
function milkPointerEnd(e,el){
  el.__px=null;el.__py=null;el.__pdrag=false;el.__phorizontal=false;
}
function cancelMilkBag(idx){var db=load();var bag=(db.milkInventory||[])[Number(idx)];if(!bag){showToast('Không tìm thấy túi sữa','error');return}if((bag.status||'Đang bảo quản')!=='Đang bảo quản'){showToast('Túi sữa này đã không còn khả dụng','warn');return}var reason=prompt('Nhập lý do huỷ túi sữa:');if(reason===null){document.querySelectorAll('.milkSwipeShell.open').forEach(function(el){el.classList.remove('open')});return}reason=String(reason||'').trim();if(!reason){showToast('Vui lòng nhập lý do huỷ túi','warn');return}var now=new Date().toISOString();bag.cancelReason=reason;bag.discardReason=reason;bag.canceledAt=now;bag.discardedAt=now;bag.status='Đã bỏ';bag.discarded=Number(bag.discarded||0)+Number(bag.remaining||0);bag.remaining=0;bag.updatedAt=now;save(db);showToast('Đã huỷ túi sữa '+milkBagDisplayId(bag),'success');render();if(byId('careDetailOverlay')&&byId('careDetailOverlay').classList.contains('show')&&window.__careStatsSelectedType==='milk'){var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());renderCareStatDetail('milk',d)}}
function openCareStatsFromDashboard(type){
  var d=today();
  if(byId('careStatsDate'))byId('careStatsDate').value=d;
  var chart=byId('careChartBox');if(chart)chart.classList.add('hidden');
  if(type&&type!=='schedule'){
    window.__careStatsSelectedType=type;
    renderCareStatDetail(type,d);
    return;
  }
  window.__careStatsSelectedType='';
  renderCareStats(load(),false);
  showPage('careStats',document.querySelector('.navItem[data-page="careStats"]'),true);
  setTimeout(function(){
    var target=byId('careStatsBox');
    if(target&&target.scrollIntoView)target.scrollIntoView({behavior:'smooth',block:'start'});
  },80);
}
function renderCareDashboard(db){var s=careSummaryForDate(db,today());if(!(db.careEvents||[]).some(function(x){return (x.startDate||x.date)===today() || (x.type==='sleep'&&careOverlapMinutesOnDate(x,today())>0)}) && s.storedMl===0)return '';function cell(type,html){return '<div class="dashCareCell" role="button" tabindex="0" onclick="event.stopPropagation();openCareStatsFromDashboard(\''+type+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.stopPropagation();openCareStatsFromDashboard(\''+type+'\')}">'+html+'</div>'}return '<section class="dashSection"><div class="dashRowTitle"><b>Chăm sóc hôm nay</b><small>bấm từng loại để xem thống kê</small></div><div class="dashPanel dashCarePanel" role="button" tabindex="0" onclick="openCareStatsFromDashboard()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openCareStatsFromDashboard()}"><div class="dashCareGrid">'+cell('feed','<b>🍼 '+s.feedMl+'ml</b><span>'+s.feedCount+' cữ bú</span>')+cell('pump','<b>🥛 '+s.pumpMl+'ml</b><span>đã hút</span>')+cell('milk','<b>🧊 '+s.storedMl+'ml</b><span>kho sữa</span>')+cell('diaper','<b>🧷 '+s.diaper+'</b><span>tã</span>')+cell('pee','<b>💧 '+s.pee+'</b><span>tè</span>')+cell('poop','<b>💩 '+s.poop+'</b><span>phân</span>')+cell('sleep','<b>😴 '+fmtMinutes(s.sleepMin)+'</b><span>ngủ</span>')+cell('medicine','<b>💊 '+s.medicine+'</b><span>uống thuốc</span>')+cell('temperature','<b>🌡️ '+(s.latestTemperature===null?'--':s.latestTemperature+'°C')+'</b><span>thân nhiệt</span>')+cell('spitup','<b>🤮 '+s.spitup+'</b><span>trớ sữa</span>')+'</div></div></section>'}
function toggleOfficialName(show){var db=load();db.settings=db.settings||{};db.settings.showOfficialName=!!show;localStorage.setItem(KEY,JSON.stringify(normalize(db)));renderDashboard(db);if(byId('showOfficialName'))byId('showOfficialName').checked=!!show}

var DASHBOARD_MODULE_DEFS=[
  {id:'babyInfo',label:'Thông tin bé',icon:'👧',required:true,desc:'Hồ sơ, tuổi, trạng thái hôm nay'},
  {id:'appointment',label:'Lịch khám sắp tới',icon:'🩺',required:true,desc:'Lịch khám/tiêm gần nhất'},
  {id:'todayCare',label:'Chăm sóc hôm nay',icon:'❤️',required:true,desc:'Bú, ngủ, tã, phân, tè'},
  {id:'careJournal',label:'Nhật ký chăm sóc',icon:'🧾',required:true,desc:'Hoạt động gần đây trong ngày'},
  {id:'alerts',label:'Bố mẹ cần chú ý',icon:'🔔',required:false,desc:'Cảnh báo bú, kho sữa, lịch gần'},
  {id:'growth',label:'Sự phát triển của bé',icon:'📈',required:false,desc:'Cân nặng, chiều dài, vòng đầu'}
];
var DASHBOARD_REQUIRED=['babyInfo','appointment','todayCare','careJournal'];
var DEFAULT_DASH_ORDER=['babyInfo','appointment','todayCare','alerts','growth','careJournal'];
var BOTTOM_NAV_OPTIONS=[
  {id:'careTimeline',label:'Theo dõi',icon:'❤️'},
  {id:'careAdd',label:'Ghi nhận',icon:'＋'},
  {id:'scheduleCalendar',label:'Lịch',icon:'📅'},
  {id:'more',label:'Thêm',icon:'☰'},
  {id:'babyStats',label:'Phát triển',icon:'📈'},
  {id:'careStats',label:'Thống kê',icon:'📊'},
  {id:'diaryBook',label:'Nhật ký',icon:'📖'},
  {id:'healthBookView',label:'Sức khỏe',icon:'🩺'},
  {id:'dashboardConfig',label:'Cấu hình',icon:'🧩'},
  {id:'data',label:'Dữ liệu',icon:'💾'}
];

var CARE_GOAL_DEFS=[
  {id:'feed',label:'Bú sữa',icon:'🍼',modes:[{id:'ml',label:'Theo ml',unit:'ml'},{id:'count',label:'Theo cữ',unit:'cữ'}],defaultMode:'ml'},
  {id:'sleep',label:'Ngủ',icon:'😴',modes:[{id:'hours',label:'Theo giờ',unit:'giờ'}],defaultMode:'hours'},
  {id:'diaper',label:'Thay tã',icon:'🧷',modes:[{id:'count',label:'Theo lần',unit:'lần'}],defaultMode:'count'},
  {id:'pee',label:'Đi tè',icon:'💧',modes:[{id:'count',label:'Theo lần',unit:'lần'}],defaultMode:'count'},
  {id:'poop',label:'Đi phân',icon:'💩',modes:[{id:'count',label:'Theo lần',unit:'lần'}],defaultMode:'count'},
  {id:'pump',label:'Hút sữa',icon:'🥛',modes:[{id:'ml',label:'Theo ml',unit:'ml'}],defaultMode:'ml'},
  {id:'storedMilk',label:'Kho sữa',icon:'🧊',modes:[{id:'ml',label:'Theo ml',unit:'ml'}],defaultMode:'ml'},
  {id:'urgentMilk',label:'Sữa sắp hết hạn',icon:'🟡',modes:[{id:'count',label:'Theo túi',unit:'túi'}],defaultMode:'count'},
  {id:'schedule',label:'Lịch hôm nay/mai',icon:'📅',modes:[{id:'count',label:'Theo mục',unit:'mục'}],defaultMode:'count'}
];
function careGoalDef(id){return CARE_GOAL_DEFS.find(function(x){return x.id===id})}
function defaultCareGoals(){var o={};CARE_GOAL_DEFS.forEach(function(d){o[d.id]={enabled:false,mode:d.defaultMode,target:''}});return o}
function cleanNumber(v){var n=Number(v||0);return isFinite(n)?n:0}
function smartNum(n,maxDigits){n=cleanNumber(n);var p=typeof maxDigits==='number'?maxDigits:2;var s=(Math.round(n*Math.pow(10,p))/Math.pow(10,p)).toFixed(p);s=s.replace(/\.?0+$/,'');return s}
function goalUnitFor(def,mode){var m=(def.modes||[]).find(function(x){return x.id===mode})||(def.modes||[])[0]||{};return m.unit||''}
function dashboardGoalStatus(cfg,key,currentMap){
  var goals=(cfg&&cfg.careGoals)||{},g=goals[key],def=careGoalDef(key);
  if(!g||!g.enabled||!def||!Number(g.target))return null;
  var mode=g.mode||def.defaultMode,target=Number(g.target||0),cur=0,unit=goalUnitFor(def,mode);
  if(key==='feed')cur=mode==='count'?currentMap.feedCount:currentMap.feedMl;
  else if(key==='sleep')cur=(currentMap.sleepMin||0)/60;
  else if(key==='diaper')cur=currentMap.diaper;
  else if(key==='pee')cur=currentMap.pee;
  else if(key==='poop')cur=currentMap.poop;
  else if(key==='pump')cur=currentMap.pumpMl;
  else if(key==='storedMilk')cur=currentMap.storedMl;
  else if(key==='urgentMilk')cur=currentMap.urgent;
  else if(key==='schedule')cur=currentMap.scheduleTodayTomorrow;
  var ratio=target>0?Math.min(1,cur/target):0;
  return {current:cur,target:target,unit:unit,ratio:ratio,done:cur>=target,label:smartNum(cur, key==='sleep'?2:1)+' / '+smartNum(target, key==='sleep'?2:1)+(unit?(' '+unit):'')};
}
function weekdayDateLine(date){
  var d=date||today();
  return weekdayName(d)+', '+fmtDate(d);
}
function appointmentDueText(date){
  var d=daysBetween(today(),date);
  if(d===0)return 'Hôm nay';
  if(d===1)return 'Ngày mai';
  if(d>1)return 'Còn '+d+' ngày';
  return 'Đã qua '+Math.abs(d)+' ngày';
}

function getDashboardConfig(db){
  db=db||load();db.settings=db.settings||{};
  var cfg=db.settings.dashboardConfig||{};
  var modules=Array.isArray(cfg.modules)?cfg.modules.slice():DEFAULT_DASH_ORDER.map(function(id){return {id:id,visible:true}});
  var known={};DASHBOARD_MODULE_DEFS.forEach(function(d){known[d.id]=d});
  modules=modules.filter(function(m){return m&&known[m.id]}).map(function(m){return {id:m.id,visible:m.visible!==false||known[m.id].required}});
  DEFAULT_DASH_ORDER.forEach(function(id){if(!modules.some(function(m){return m.id===id}))modules.push({id:id,visible:true})});
  DASHBOARD_REQUIRED.forEach(function(id){var m=modules.find(function(x){return x.id===id});if(m)m.visible=true;else modules.unshift({id:id,visible:true})});
  return {
    fontScale:cfg.fontScale||'compact',
    babyDescription:cfg.babyDescription||db.settings.babyDescription||'Con gái của bố Huy & mẹ Sao 💗',
    modules:modules,
    bottomNav:Array.isArray(cfg.bottomNav)&&cfg.bottomNav.length?cfg.bottomNav.slice(0,4):['careTimeline','careAdd','scheduleCalendar','more'],
    moduleTitles:(cfg.moduleTitles&&typeof cfg.moduleTitles==='object')?Object.assign({},cfg.moduleTitles):{},
    careGoals:Object.assign(defaultCareGoals(), (cfg.careGoals&&typeof cfg.careGoals==='object')?cfg.careGoals:{})
  };
}
function saveDashboardConfigObject(db,cfg){
  db.settings=db.settings||{};
  db.settings.dashboardConfig=cfg;
  db.settings.babyDescription=cfg.babyDescription||db.settings.babyDescription||'';
  localStorage.setItem(KEY,JSON.stringify(normalize(db)));
}
function bottomNavMeta(id){return BOTTOM_NAV_OPTIONS.find(function(x){return x.id===id})||BOTTOM_NAV_OPTIONS[0]}
function latestCareEventByType(db,type){return (db.careEvents||[]).filter(function(x){return x&&x.type===type}).slice().sort(function(a,b){return String((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare(String((a.startDate||a.date||'')+(a.timeFrom||'')))} )[0]||null}
function formatDateTimeLine(date,time){if(!date||!time)return '';return time+', '+fmtDate(date)}
function addMinutesToDateTime(date,time,minutes){var d=new Date((date||today())+'T'+(time||'00:00')+':00');if(isNaN(d.getTime()))return null;d=new Date(d.getTime()+minutes*60000);return {date:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}}
function babySleepStatusText(db){var latest=latestCareEventByType(db,'sleep');return latest&&!latest.timeTo?'😴 Bé đang ngủ':'☺️ Bé đang thức'}
function nextFeedText(db){var latest=latestCareEventByType(db,'feed');if(!latest)return '';var next=addMinutesToDateTime(latest.startDate||latest.date,latest.timeFrom,150);return next?formatDateTimeLine(next.date,next.time):''}
function renderBottomNav(db){
  var nav=document.querySelector('.bottomNav');if(!nav)return;
  var cfg=getDashboardConfig(db||load());
  var items=[{id:'home',label:'Trang chủ',icon:'🏠'}].concat((cfg.bottomNav||[]).slice(0,4).map(bottomNavMeta));
  nav.innerHTML=items.map(function(it,i){
    var center=(it.id==='careAdd'||i===2)?' centerAdd':'';
    var click=it.id==='more'?'openMoreSheet()':'goTab(\''+it.id+'\')';
    return '<button id="bn_'+esc(it.id)+'" class="'+center.trim()+'" onclick="'+click+'"><span class="bnIcon">'+esc(it.icon)+'</span><span>'+esc(it.label)+'</span></button>';
  }).join('');
  syncBottomNav((document.querySelector('.page:not(.hidden)')||{}).id||'home');
}
function renderDashboard(db){
  var st=db.settings||{};
  if(typeof st.showOfficialName==='undefined')st.showOfficialName=true;
  var cfg=getDashboardConfig(db);
  var pa=(st.birthDate?pregnancyAgeAt(st.lmp,st.birthDate):pregnancyAge(st.lmp));
  var babySorted=(db.baby||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')});
  var latestB=babySorted[0]||null, prevB=babySorted[1]||null;
  var latestP=db.pregnancy&&db.pregnancy[0]||null;
  function numVal(v){var n=parseFloat(String(v||'').replace(',','.'));return isNaN(n)?null:n}
  function deltaLabel(cur,prev,unit){
    var c=numVal(cur),p=numVal(prev);
    if(c===null||p===null)return '';
    var d=c-p;
    if(Math.abs(d)<0.0001)return '';
    var cls=d>0?'':' down', sign=d>0?'+':'';
    var val=(Math.round(d*10)/10).toString().replace('.',',');
    return '<span class="bcDelta'+cls+'">'+(d>0?'↑ ':'↓ ')+sign+val+' '+unit+'</span>';
  }
  var name=st.babyName||st.officialName||'Bé Bún';
  var todayStr=today();
  var ageText=st.birthDate?babyAge(st.birthDate):(pa?('Thai '+pa.w+' tuần '+pa.day+' ngày'):'Chưa thiết lập');
  var weekText=st.birthDate?('('+Math.max(0,Math.floor(daysBetween(st.birthDate,todayStr)/7))+' tuần '+(Math.max(0,daysBetween(st.birthDate,todayStr))%7)+' ngày)'):(pa?('Dự sinh '+esc(st.dueDate||'')):'');
  var nextAppt=upcomingAppointment(db);
  var care=careSummaryForDate(db,todayStr);
  var scheduleToday=(db.appointments||[]).filter(function(x){return x&&x.date===todayStr}).length;
  var milkBags=(db.milkInventory||[]).filter(function(b){return b.status==='Đang bảo quản'&&Number(b.remaining||0)>0});
  var urgent=milkBags.filter(function(b){return milkExpireAt(b)-Date.now()<48*3600000}).length;
  var careToday=sortedCareEvents(db).filter(function(x){return (x.startDate||x.date)===todayStr || (x.type==='sleep'&&careOverlapMinutesOnDate(x,todayStr)>0)}).slice(0,4);
  function statusLine(){
    if(care.feedMl>0 && care.sleepMin>=600)return 'Bé hôm nay khỏe mạnh';
    if(care.feedCount||care.sleepMin||care.diaper)return 'Đã có ghi nhận hôm nay';
    if(nextAppt&&daysBetween(todayStr,nextAppt.date)>=0&&daysBetween(todayStr,nextAppt.date)<=1)return 'Có lịch cần chú ý';
    if(st.birthDate)return 'Chưa ghi nhận hôm nay';
    return 'Đang theo dõi thai kỳ';
  }
  function subStatus(){
    if(care.feedMl>0 && care.sleepMin>0)return 'Giấc ngủ và lượng bú đều tốt';
    if(care.feedMl>0)return 'Đã có dữ liệu bú hôm nay';
    if(care.sleepMin>0)return 'Đã có dữ liệu ngủ hôm nay';
    return 'Thêm ghi nhận để theo dõi chính xác hơn';
  }
  function apptWeekday(d){return d?weekdayName(d).replace('Thứ ','THỨ ').toUpperCase():'--'}
  function apptDay(d){return d?String(new Date(d+'T00:00:00').getDate()).padStart(2,'0'):'--'}
  function apptMonth(d){return d?('THÁNG '+String(new Date(d+'T00:00:00').getMonth()+1).padStart(2,'0')):'--'}
  var weight=latestB&&latestB.weight?latestB.weight:(latestP&&latestP.weight?latestP.weight:'--');
  var length=latestB&&(latestB.length||latestB.height)?(latestB.length||latestB.height):'--';
  var head=latestB&&latestB.head?latestB.head:'--';
  var blocks={};
  function dashTitle(id,fallback){var t=cfg.moduleTitles&&cfg.moduleTitles[id];return (t&&String(t).trim())?String(t).trim():fallback}

  blocks.babyInfo=function(){
    var birthTimeText=(st.birthTimeFrom||st.birthTime)?(st.birthTimeFrom||st.birthTime)+(st.birthTimeTo?' - '+st.birthTimeTo:''):'--';
    var h='<section class="bcHero">';
    h+='<div class="bcHeroTop"><div class="bcAvatar">👧🏻</div><div class="bcHeroInfo"><div class="bcName">'+esc(name)+'<span class="bcVerified">✓</span></div><div class="bcAge">'+esc(ageText)+' '+esc(weekText||'')+'</div>';
    h+='<div class="bcOfficial">'+esc(cfg.babyDescription||'')+'</div></div>';
    h+='<div class="bcActions"><button class="bcIconBtn" type="button" onclick="openScheduleFromDashboard()">🔔'+(urgent||scheduleToday?'<span class="bcBadge">'+(urgent||scheduleToday)+'</span>':'')+'</button><button class="bcIconBtn" type="button" onclick="goTab(\'scheduleCalendar\')">🗓️</button></div></div>';
    h+='<div class="bcBirthInfo bcBirthInfoWide"><div class="bcBirthBlock bcBirthDate"><span class="bcBirthIcon">🎂</span><span class="bcBirthText"><small>Ngày sinh</small><b>'+esc(st.birthDate?fmtDate(st.birthDate):'--')+'</b></span></div><div class="bcBirthBlock bcBirthTime"><span class="bcBirthIcon">🕘</span><span class="bcBirthText"><small>Giờ sinh</small><b>'+esc(birthTimeText)+'</b></span></div><div class="bcBirthBlock bcBirthHospital"><span class="bcBirthIcon">🏥</span><span class="bcBirthText"><small>Bệnh viện sinh</small><b>'+esc(st.birthHospital||'--')+'</b></span></div></div>';
    h+='<div class="bcStatusBar"><div class="bcStatus">😊 '+esc(statusLine())+'</div><div class="bcClock"><span>🕘 <span id="vnClock">--:--:--</span></span><span class="bcTodayDate">'+esc(weekdayDateLine(todayStr))+'</span></div></div>';var sleepStatus=babySleepStatusText(db),nextFeed=nextFeedText(db);h+='<div class="bcStatusExtra"><div class="bcStatusExtraRow"><b>Trạng thái:</b> '+esc(sleepStatus)+'</div>'+(nextFeed?'<div class="bcStatusExtraRow"><b>Cữ bú tiếp theo:</b> '+esc(nextFeed)+'</div>':'')+'</div>';
    h+='</section>';return h;
  };
    blocks.appointment=function(){
    if(nextAppt){
      var ndAp=daysBetween(todayStr,nextAppt.date);
      var apptTitle=nextAppt.title||typeLabel(db,nextAppt.typeId)||'Lịch khám';
      return '<section class="bcCard bcApptCard" onclick="openScheduleFromDashboard()"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">🩺</span><span>'+esc(dashTitle('appointment','Lịch khám sắp tới'))+'</span></div><button class="bcAction" onclick="event.stopPropagation();openScheduleFromDashboard()">Xem lịch ›</button></div><div class="bcApptBody"><div class="bcDateBox"><small>'+esc(apptWeekday(nextAppt.date))+'</small><b>'+esc(apptDay(nextAppt.date))+'</b><span>'+esc(apptMonth(nextAppt.date))+'</span></div><div class="bcApptMain"><b>'+esc(apptTitle)+'</b><span>🕘 '+esc(timeRangeOf(nextAppt)||'--')+'</span><span>📍 '+esc(nextAppt.place||nextAppt.location||nextAppt.hospital||'Chưa nhập địa điểm')+'</span></div><div class="bcPill">'+esc(appointmentDueText(nextAppt.date))+'</div></div></section>';
    }
    return '<section class="bcCard bcApptCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">🩺</span><span>'+esc(dashTitle('appointment','Lịch khám sắp tới'))+'</span></div><button class="bcAction" onclick="goTab(\'scheduleAdd\')">Thêm lịch ›</button></div><p class="notice">Chưa có lịch khám sắp tới.</p></section>';
  };
  blocks.todayCare=function(){
    var scheduleTodayTomorrow=(db.appointments||[]).filter(function(x){return x&&(x.date===todayStr||x.date===addDaysISO(todayStr,1))}).length;
    var currentMap={feedMl:care.feedMl,feedCount:care.feedCount,sleepMin:care.sleepMin,diaper:care.diaper,pee:care.pee,poop:care.poop,pumpMl:care.pumpMl,storedMl:milkBags.reduce(function(t,b){return t+Number(b.remaining||0)},0),urgent:urgent,scheduleTodayTomorrow:scheduleTodayTomorrow};
    function metric(key,cls,icon,val,small,label,go){
      var gs=dashboardGoalStatus(cfg,key,currentMap);
      var style=gs?' style="--goal-progress:'+gs.ratio.toFixed(4)+'"':'';
      var done=gs&&gs.done?' done':'';
      var sub=gs?gs.label:label;
      return '<div class="bcMetric '+cls+done+'"'+style+' onclick="'+(go||'openCareStatsFromDashboard()')+'"><span class="bcDone">✓</span><div class="ico">'+icon+'</div><div class="val">'+val+(small?'<small>'+small+'</small>':'')+'</div><div class="lab">'+esc(label)+'</div>'+(gs?'<span class="bcGoal">'+esc(sub)+'</span>':'')+'</div>';
    }
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">❤️</span><span>'+esc(dashTitle('todayCare','Chăm sóc hôm nay'))+'</span></div><button class="bcAction" onclick="openCareStatsFromDashboard()">Thống kê ›</button></div><div class="bcTodayGrid">';
    h+=metric('feed','feed','🍼',care.feedMl,'ml',care.feedCount+' cữ bú','openCareStatsFromDashboard(\'feed\')');
    h+=metric('sleep','sleep','😴',fmtMinutes(care.sleepMin),'','Tổng giờ ngủ','openCareStatsFromDashboard(\'sleep\')');
    h+=metric('diaper','diaper','🧷',care.diaper,'','Tã đã thay','openCareStatsFromDashboard(\'diaper\')');
    h+=metric('pee','pee','💧',care.pee,'','Đi tè','openCareStatsFromDashboard(\'pee\')');
    h+=metric('poop','poop','💩',care.poop,'','Đi phân','openCareStatsFromDashboard(\'poop\')');
    h+=metric('pump','pump','🥛',care.pumpMl,'ml','Hút sữa','openCareStatsFromDashboard(\'pump\')');
    h+=metric('storedMilk','milk','🧊',currentMap.storedMl,'ml','Kho sữa · '+milkBags.length+' túi','openCareStatsFromDashboard(\'milk\')');
    h+=metric('medicine','medicine','💊',care.medicine,'','Uống thuốc','openCareStatsFromDashboard(\'medicine\')');
    h+=metric('temperature','temperature','🌡️',care.latestTemperature===null?'--':care.latestTemperature,'°C','Thân nhiệt · '+care.temperatureCount+' lần','openCareStatsFromDashboard(\'temperature\')');
    h+=metric('spitup','spitup','🤮',care.spitup,'','Trớ sữa','openCareStatsFromDashboard(\'spitup\')');
    h+=metric('urgentMilk','urgent','🟡',urgent,' túi','Sắp hết hạn <48h','openCareStatsFromDashboard(\'milk\')');
    h+=metric("schedule","schedule","📅",scheduleTodayTomorrow,"","Lịch hôm nay/mai","goTab(\'scheduleCalendar\')");
    h+='</div></section>';return h;
  };
  blocks.alerts=function(){
    var alerts=[];
    if(care.feedCount>0&&care.feedMl<120){alerts.push({cls:'orange',icon:'🍼',title:'Lượng bú hôm nay',sub:'Có thể cần theo dõi thêm',go:'Gợi ý',click:'openCareStatsFromDashboard()'});}
    if(urgent>0){alerts.push({cls:'green',icon:'🧊',title:urgent+' túi sữa sắp hết hạn',sub:'Ưu tiên dùng túi gần hết hạn',go:'Kiểm tra',click:'openCareStatsFromDashboard()'});}
    if(!alerts.length)return '';
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">🔔</span><span>'+esc(dashTitle('alerts','Bố mẹ cần chú ý'))+'</span></div><button class="bcAction" onclick="openCareStatsFromDashboard()">Xem tất cả ›</button></div><div class="bcAlerts">';
    alerts.slice(0,3).forEach(function(a){h+='<div class="bcAlertRow '+a.cls+'" onclick="'+a.click+'"><div class="bcAlertIcon">'+a.icon+'</div><div class="bcAlertText"><b>'+esc(a.title)+'</b><span>'+esc(a.sub)+'</span></div><div class="bcAlertGo">'+esc(a.go)+' ›</div></div>'});
    h+='</div></section>';return h;
  };
  blocks.growth=function(){
    return '<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">📈</span><span>'+esc(dashTitle('growth','Sự phát triển của bé'))+'</span></div><button class="bcAction" onclick="goTab(\'babyStats\')">Xem chi tiết ›</button></div><div class="bcGrowthGrid"><div class="bcGrowthItem"><div class="gi">⚖️</div><small>Cân nặng</small><b>'+esc(weight)+' '+(weight!=='--'?'kg':'')+'</b>'+deltaLabel(weight,prevB&&prevB.weight,'kg')+'</div><div class="bcGrowthItem"><div class="gi">📏</div><small>Chiều dài</small><b>'+esc(length)+' '+(length!=='--'?'cm':'')+'</b>'+deltaLabel(length,prevB&&(prevB.length||prevB.height),'cm')+'</div><div class="bcGrowthItem"><div class="gi">👶</div><small>Vòng đầu</small><b>'+esc(head)+' '+(head!=='--'?'cm':'')+'</b>'+deltaLabel(head,prevB&&prevB.head,'cm')+'</div></div></section>';
  };
  blocks.careJournal=function(){
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleMark" style="background:#62d99d"></span><span>'+esc(dashTitle('careJournal','Nhật ký chăm sóc'))+'</span></div><button class="bcAction" onclick="goTab(\'careTimeline\')">Xem tất cả ›</button></div><div class="bcTimeline">';
    if(careToday.length){
      careToday.forEach(function(x){var m=careTypeMeta(x.type);h+='<div class="bcTimeRow" onclick="goTab(\'careTimeline\')"><span class="bcDot"></span><div class="bcTime">'+esc(x.timeFrom||'--:--')+'</div><div class="bcActIcon">'+esc(m.icon)+'</div><div class="bcActText">'+esc(careEventText(x)||m.label)+'</div><div class="bcChevron">›</div></div>'});
    }else{
      h+='<div class="bcTimeRow" onclick="goTab(\'careAdd\')"><span class="bcDot"></span><div class="bcTime">＋</div><div class="bcActIcon">👶</div><div class="bcActText">Chưa có ghi nhận hôm nay</div><div class="bcChevron">›</div></div>';
    }
    h+='</div></section>';return h;
  };

  var cls='babyDashCommand bcFont'+(cfg.fontScale==='large'?'Large':cfg.fontScale==='normal'?'Normal':'Compact');
  var html='<div class="'+cls+'">';
  cfg.modules.forEach(function(m){if((m.visible!==false||DASHBOARD_REQUIRED.indexOf(m.id)>=0)&&blocks[m.id])html+=blocks[m.id]()});
  html+='</div>';
  byId('dashboard').innerHTML=html;
  if(byId('latestCards'))byId('latestCards').innerHTML='';
  syncVNClock();
  renderBottomNav(db);
}

function dashModuleDef(id){return DASHBOARD_MODULE_DEFS.find(function(d){return d.id===id})}
function renderDashboardConfig(){
  var db=load(),cfg=getDashboardConfig(db);
  if(byId('cfgFontScale'))byId('cfgFontScale').value=cfg.fontScale||'compact';
  if(byId('cfgBabyDescription'))byId('cfgBabyDescription').value=cfg.babyDescription||'';
  var list=byId('cfgModuleList');
  if(list){
    list.innerHTML=cfg.modules.map(function(m,idx){
      var def=dashModuleDef(m.id)||{label:m.id,icon:'▫️',desc:''};
      var locked=!!def.required;
      return '<div class="configModuleRow '+(locked?'locked':'')+'" data-mid="'+esc(m.id)+'"><input type="checkbox" '+(m.visible!==false||locked?'checked':'')+' '+(locked?'disabled':'')+'><div><b>'+esc(def.icon+' '+def.label)+'</b><small>'+esc(def.desc||'')+'</small><label>Tên hiển thị</label><input class="cfgModuleTitle" placeholder="Để trống dùng tên gốc" value="'+esc((cfg.moduleTitles&&cfg.moduleTitles[m.id])||'')+'"></div><div class="configMoves"><button type="button" class="secondary" onclick="moveDashboardModule('+idx+',-1)">↑</button><button type="button" class="secondary" onclick="moveDashboardModule('+idx+',1)">↓</button></div></div>';
    }).join('');
  }
  var nav=byId('cfgBottomNavList');
  if(nav){
    var current=(cfg.bottomNav||['careTimeline','careAdd','scheduleCalendar','more']).slice(0,4);
    while(current.length<4)current.push(['careTimeline','careAdd','scheduleCalendar','more'][current.length]);
    nav.innerHTML=current.map(function(val,i){
      return '<div><label>Vị trí '+(i+2)+' trên taskbar</label><select id="cfgBottom_'+i+'">'+BOTTOM_NAV_OPTIONS.map(function(o){return '<option value="'+esc(o.id)+'" '+(o.id===val?'selected':'')+'>'+esc(o.icon+' '+o.label)+'</option>'}).join('')+'</select></div>';
    }).join('');
  }  var goalsBox=byId('cfgCareGoalsList');
  if(goalsBox){
    var goals=Object.assign(defaultCareGoals(), cfg.careGoals||{});
    goalsBox.innerHTML=CARE_GOAL_DEFS.map(function(def){
      var g=Object.assign({enabled:false,mode:def.defaultMode,target:''}, goals[def.id]||{});
      var modeOptions=(def.modes||[]).map(function(m){return '<option value="'+esc(m.id)+'" '+(m.id===g.mode?'selected':'')+'>'+esc(m.label)+'</option>'}).join('');
      return '<div class="careGoalRow" data-goal-id="'+esc(def.id)+'"><label class="cgName"><input type="checkbox" '+(g.enabled?'checked':'')+'> '+esc(def.icon+' '+def.label)+'</label><div><label>Cách tính</label><select class="cgMode">'+modeOptions+'</select></div><div><label>Chỉ tiêu</label><input class="cgTarget" type="number" min="0" step="0.1" value="'+esc(g.target||'')+'" placeholder="0"></div><div><label>Đơn vị</label><input class="cgUnit" readonly value="'+esc(goalUnitFor(def,g.mode||def.defaultMode))+'"></div></div>';
    }).join('');
    goalsBox.querySelectorAll('.careGoalRow .cgMode').forEach(function(sel){sel.addEventListener('change',function(){var row=sel.closest('.careGoalRow'),def=careGoalDef(row.getAttribute('data-goal-id')),unit=row.querySelector('.cgUnit');if(unit)unit.value=goalUnitFor(def,sel.value)})});
  }

}
function readDashboardConfigFromForm(){
  var db=load(),cfg=getDashboardConfig(db);
  cfg.fontScale=(byId('cfgFontScale')&&byId('cfgFontScale').value)||'compact';
  cfg.babyDescription=(byId('cfgBabyDescription')&&byId('cfgBabyDescription').value.trim())||'';
  var rows=[].slice.call(document.querySelectorAll('#cfgModuleList .configModuleRow'));
  cfg.moduleTitles={};
  if(rows.length){
    cfg.modules=rows.map(function(row){
      var id=row.getAttribute('data-mid'),def=dashModuleDef(id),cb=row.querySelector('input[type="checkbox"]'),titleEl=row.querySelector('.cfgModuleTitle');
      var title=titleEl?titleEl.value.trim():'';
      if(title)cfg.moduleTitles[id]=title;
      return {id:id,visible:(def&&def.required)?true:!!(cb&&cb.checked)};
    });
  }
  cfg.bottomNav=[0,1,2,3].map(function(i){var el=byId('cfgBottom_'+i);return el?el.value:['careTimeline','careAdd','scheduleCalendar','more'][i]});
  cfg.careGoals=defaultCareGoals();
  [].slice.call(document.querySelectorAll('#cfgCareGoalsList .careGoalRow')).forEach(function(row){
    var id=row.getAttribute('data-goal-id'),def=careGoalDef(id);
    if(!def)return;
    var cb=row.querySelector('input[type="checkbox"]'),mode=row.querySelector('.cgMode'),target=row.querySelector('.cgTarget');
    cfg.careGoals[id]={enabled:!!(cb&&cb.checked),mode:(mode&&mode.value)||def.defaultMode,target:(target&&target.value)||''};
  });
  return cfg;
}
function saveDashboardConfig(){
  try{
    var db=load(),cfg=readDashboardConfigFromForm();
    saveDashboardConfigObject(db,cfg);
    renderDashboardConfig();
    render();
    renderBottomNav(load());
    toast('Đã lưu thành công.','success');
  }catch(e){
    console.error(e);
    toast('Lưu thất bại. Vui lòng thử lại.','error');
  }
}
function resetDashboardModuleConfig(){
  var db=load(),cfg=getDashboardConfig(db);
  cfg.modules=DEFAULT_DASH_ORDER.map(function(id){return {id:id,visible:true}});
  saveDashboardConfigObject(db,cfg);
  renderDashboardConfig();
  toast('Đã khôi phục thứ tự block mặc định','success');
}
function moveDashboardModule(idx,dir){
  var db=load(),cfg=readDashboardConfigFromForm();
  var next=idx+dir;
  if(next<0||next>=cfg.modules.length)return;
  var tmp=cfg.modules[idx];cfg.modules[idx]=cfg.modules[next];cfg.modules[next]=tmp;
  saveDashboardConfigObject(db,cfg);
  renderDashboardConfig();
}

function toast(message,type){
  var wrap=byId('toastWrap');
  if(!wrap){alert(message);return;}
  var el=document.createElement('div');
  el.className='toast '+(type||'');
  el.textContent=message;
  wrap.appendChild(el);
  requestAnimationFrame(function(){el.classList.add('show')});
  setTimeout(function(){el.classList.remove('show');setTimeout(function(){el.remove()},260)},2600);
}

function updateThemeButton(){var btn=byId('themeToggle');if(btn){btn.textContent=document.documentElement.getAttribute('data-theme')==='dark'?'☀️':'🌙';btn.setAttribute('aria-label',document.documentElement.getAttribute('data-theme')==='dark'?'Chuyển sang light mode':'Chuyển sang dark mode')}}
function render(){var db=load(),s=db.settings||{};['lmp','birthDate','birthTimeFrom','birthTimeTo','birthHospital','babyName','officialName'].forEach(function(id){setVal(id,s[id]||'')});if(byId('birthTimeFrom')&&!byId('birthTimeFrom').value&&s.birthTime)byId('birthTimeFrom').value=s.birthTime;if(byId('showOfficialName'))byId('showOfficialName').checked=s.showOfficialName!==false;document.documentElement.setAttribute('data-theme',s.theme||'');updateThemeButton();['pDate','bDate','mDate','dDate','hbDate','aDate','calendarBaseDate','cDate','cEndDate','careStatsDate'].forEach(function(id){if(byId(id)&&!byId(id).value)byId(id).value=today()});renderDashboard(db);renderPregnancyStats(db);renderBabyStats(db);renderPregnancyChart(db);renderBabyChart(db);renderDiaryBook(db);renderHealthBookView(db);renderAppointmentList(db);renderAppointmentCalendar(db);renderAppointmentTypes(db);renderDiaryTypes(db);renderCareTimeline(db);renderCareStats(db);renderList('pregnancyList',db.pregnancy,'pregnancy',function(x){return '<b>'+fmtDate(x.date)+' - '+esc(x.week||'')+'</b><small>EFW '+esc(x.weight)+' | BPD '+esc(x.bpd)+' | HC '+esc(x.hc)+' | AC '+esc(x.ac)+' | FL '+esc(x.fl)+' | AFI '+esc(x.afi)+' | Ngôi '+esc(x.position)+'</small><p>'+esc(x.note)+'</p>'});renderList('babyList',db.baby,'baby',function(x){return '<b>'+fmtDate(x.date)+'</b><small>Cân nặng '+esc(x.weight)+' | Dài '+esc(x.length)+' | Vòng đầu '+esc(x.head)+' | Bú '+esc(x.feed)+' | Ngủ '+esc(x.sleep)+'</small><p>'+esc(x.note)+'</p>'});renderList('momList',db.mom,'mom',function(x){return '<b>'+fmtDate(x.date)+'</b><small>Cân nặng '+esc(x.weight)+' | Huyết áp '+esc(x.bp)+'</small><p>'+esc(x.note)+'</p>'});renderList('diaryList',sortedDiary(db),'diary',function(x){return '<b>'+fmtDate(x.date)+(timeRangeOf(x)?' · '+esc(timeRangeOf(x)):'')+'</b><small>'+diaryTypeLabel(db,x)+'</small><p><b>'+esc(x.title||'Không tiêu đề')+'</b><br>'+esc(x.note||'')+'</p>'});renderList('healthBookList',db.healthBook,'healthBook',function(x){return '<b>'+esc(x.fullName||x.person||'Đối tượng')+'</b><small>'+esc(x.person||'')+' · Cập nhật '+fmtDate(x.date)+' · Sinh ngày '+fmtDate(x.dob)+'</small><p>Nhóm máu '+esc(x.blood||'--')+' · Chiều cao '+esc(x.height||'--')+' · Cân nặng '+esc(x.weight||'--')+' · Dị ứng '+esc(x.allergy||'--')+((Array.isArray(x.vaccines)&&x.vaccines.length)?' · Vaccine '+esc(x.vaccines.length)+' dòng':(x.vaccinePurpose?' · Ngừa bệnh '+esc(x.vaccinePurpose):''))+'</p>'});updateBackup();renderCloudConfig()}
function toggleTheme(){var db=load();db.settings=db.settings||{};db.settings.theme=(document.documentElement.getAttribute('data-theme')==='dark')?'':'dark';save(db)}
function updateBackup(){var el=byId('backupText');if(el)el.value=JSON.stringify(load(),null,2)}
function exportDB(){var data=JSON.stringify(load(),null,2);var blob=new Blob([data],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='me-yeu-be-db-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function importDB(ev){var f=ev.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var db=normalize(JSON.parse(r.result));save(db);alert('Nhập DB thành công')}catch(e){alert('File DB không hợp lệ')}};r.readAsText(f)}
function copyBackup(){var el=byId('backupText');el.select();document.execCommand('copy');alert('Đã copy DB')}

var deleteTimer=null,deleteLeft=0;
function startDeleteFlow(){
  var box=byId('deleteGuard'),inp=byId('deleteConfirmText'),st=byId('deleteStatus');
  if(box)box.classList.add('show');
  if(inp){inp.value='';setTimeout(function(){inp.focus()},80)}
  if(st)st.textContent='Nhập XOADULIEU rồi bấm Đồng ý xoá. Sau đó Boss vẫn có 5 giây để huỷ.';
}
function confirmDeleteText(){
  var inp=byId('deleteConfirmText'),st=byId('deleteStatus');
  if(!inp||inp.value!=='XOADULIEU'){alert('Boss cần nhập chính xác XOADULIEU để xác nhận xoá dữ liệu.');return}
  if(deleteTimer)clearInterval(deleteTimer);
  deleteLeft=5;
  if(st)st.innerHTML='Sẽ xoá sau <span class="deleteCountdown">'+deleteLeft+'</span> giây. Bấm Huỷ nếu đổi ý.';
  deleteTimer=setInterval(function(){
    deleteLeft-=1;
    if(st)st.innerHTML='Sẽ xoá sau <span class="deleteCountdown">'+deleteLeft+'</span> giây. Bấm Huỷ nếu đổi ý.';
    if(deleteLeft<=0){
      clearInterval(deleteTimer);deleteTimer=null;
      localStorage.removeItem(KEY);
      if(st)st.textContent='Đã xoá dữ liệu trên thiết bị này.';
      render();
    }
  },1000);
}
function cancelDelete(){
  if(deleteTimer){clearInterval(deleteTimer);deleteTimer=null}
  var box=byId('deleteGuard'),inp=byId('deleteConfirmText'),st=byId('deleteStatus');
  if(inp)inp.value='';
  if(st)st.textContent='Đã huỷ thao tác xoá dữ liệu.';
  if(box)box.classList.remove('show');
}
function clearDB(){startDeleteFlow()}

function vnTimeString(){try{return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}catch(e){var d=new Date(Date.now()+7*3600000);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')+':'+String(d.getUTCSeconds()).padStart(2,'0')}}
function syncVNClock(){var el=byId('vnClock');if(el)el.textContent=vnTimeString()}
function updateClock(){syncVNClock()}
function initVNClock(){syncVNClock();if(window.__vnClockTimer)clearInterval(window.__vnClockTimer);window.__vnClockTimer=setInterval(syncVNClock,1000)}

function openMoreSheet(){var sh=byId('moreSheet');if(sh){sh.classList.add('show');document.body.classList.add('careModalOpen')}}
function closeMoreSheet(){var sh=byId('moreSheet');if(sh){sh.classList.remove('show');document.body.classList.remove('careModalOpen')}}
function syncBottomNav(page){
  document.querySelectorAll('.bottomNav button').forEach(function(el){el.classList.remove('active')});
  var target='home';
  if(page==='home')target='home';
  else if(page==='careAdd')target='careAdd';
  else if(page==='careTimeline'||page==='careStats')target='careTimeline';
  else if(page==='scheduleAdd'||page==='scheduleList'||page==='scheduleCalendar')target='scheduleCalendar';
  else if(page==='dashboardConfig')target='dashboardConfig';
  else target=page;
  var el=byId('bn_'+target);
  if(el)el.classList.add('active');
  else {
    var more=byId('bn_more');if(more)more.classList.add('active');
  }
}


/* V10.0 Supabase Cloud Sync Foundation */
var CLOUD_CFG_KEY='meYeuBeCloudSync_v1';
var CLOUD_DEFAULT_URL='https://srtkdexdsvdoraiwwcbe.supabase.co';
var CLOUD_DEFAULT_KEY='sb_publishable_qcuRm0vd589t_PCky1hsCg_CsmkQgn8';
var CLOUD_TABLE='meyeube_sync';
var cloudPushTimer=null;

function cloudDefaultCfg(){
  return {enabled:false,url:CLOUD_DEFAULT_URL,anonKey:CLOUD_DEFAULT_KEY,syncId:'main',lastPulledAt:'',lastPushedAt:''};
}
function loadCloudConfig(){
  var cfg=cloudDefaultCfg();
  try{var saved=JSON.parse(localStorage.getItem(CLOUD_CFG_KEY)||'{}');cfg=Object.assign(cfg,saved||{})}catch(e){}
  return cfg;
}
function saveCloudConfigToStorage(cfg){
  localStorage.setItem(CLOUD_CFG_KEY,JSON.stringify(cfg||loadCloudConfig()));
}
function cloudLog(msg,type){
  var box=byId('cloudSyncLog');
  var line='['+(new Date()).toLocaleTimeString('vi-VN')+'] '+(msg||'');
  if(box){box.textContent=(line+'\\n'+(box.textContent||'')).slice(0,4000)}
  if(type)showToast(msg,type);
}
function renderCloudConfig(){
  var cfg=loadCloudConfig();
  if(byId('cloudEnabled'))byId('cloudEnabled').value=cfg.enabled?'1':'0';
  if(byId('cloudUrl'))byId('cloudUrl').value=cfg.url||'';
  if(byId('cloudAnonKey'))byId('cloudAnonKey').value=cfg.anonKey||'';
  if(byId('cloudSyncId'))byId('cloudSyncId').value=cfg.syncId||'be-bun-main';
  var t=byId('cloudSyncTitle'),s=byId('cloudSyncSubtitle'),p=byId('cloudSyncPill');
  if(t)t.textContent=cfg.enabled?'Đang bật đồng bộ':'Chưa bật đồng bộ';
  if(s)s.textContent=cfg.enabled?('Sync ID: '+(cfg.syncId||'--')+' · Push: '+(cfg.lastPushedAt?new Date(cfg.lastPushedAt).toLocaleString('vi-VN'):'chưa có')):'Nhập Supabase URL, Publishable key và Sync ID rồi bấm Lưu cấu hình.';
  if(p){p.textContent=cfg.enabled?'ON':'OFF';p.classList.toggle('off',!cfg.enabled)}
}
function saveCloudConfig(){
  try{
    var cfg=loadCloudConfig();
    cfg.enabled=(byId('cloudEnabled')&&byId('cloudEnabled').value==='1');
    cfg.url=(byId('cloudUrl')&&byId('cloudUrl').value.trim())||CLOUD_DEFAULT_URL;
    cfg.anonKey=(byId('cloudAnonKey')&&byId('cloudAnonKey').value.trim())||CLOUD_DEFAULT_KEY;
    cfg.syncId=(byId('cloudSyncId')&&byId('cloudSyncId').value.trim())||'be-bun-main';
    saveCloudConfigToStorage(cfg);
    renderCloudConfig();
    showToast('Đã lưu cấu hình Cloud Sync','success');
  }catch(e){showToast('Lưu cấu hình thất bại','error')}
}
function cloudHeaders(cfg){
  return {'apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey,'Content-Type':'application/json'};
}
function cloudEndpoint(cfg){
  return String(cfg.url||'').replace(/\/+$/,'')+'/rest/v1/'+CLOUD_TABLE;
}
function cloudValidateCfg(cfg){
  if(!cfg.url||!cfg.anonKey||!cfg.syncId)throw new Error('Thiếu URL, key hoặc Sync ID');
}
async function cloudFetchRow(cfg){
  cloudValidateCfg(cfg);
  var url=cloudEndpoint(cfg)+'?sync_id=eq.'+encodeURIComponent(cfg.syncId)+'&select=sync_id,payload,updated_at';
  var res=await fetch(url,{headers:cloudHeaders(cfg)});
  if(!res.ok){throw new Error('Cloud fetch lỗi '+res.status+': '+await res.text())}
  var rows=await res.json();
  return rows&&rows[0]?rows[0]:null;
}
async function cloudUpsertPayload(cfg,payload){
  cloudValidateCfg(cfg);
  var body={sync_id:cfg.syncId,payload:payload,updated_at:new Date().toISOString()};
  var res=await fetch(cloudEndpoint(cfg),{
    method:'POST',
    headers:Object.assign({},cloudHeaders(cfg),{'Prefer':'resolution=merge-duplicates,return=representation'}),
    body:JSON.stringify(body)
  });
  if(!res.ok){throw new Error('Cloud upsert lỗi '+res.status+': '+await res.text())}
  return await res.json();
}
async function testCloudConnection(){
  var cfg=loadCloudConfig();
  try{
    showAppLoading();
    await cloudFetchRow(cfg);
    cloudLog('Kết nối Supabase OK','success');
  }catch(e){
    cloudLog('Test thất bại: '+e.message,'error');
  }finally{hideAppLoading();renderCloudConfig()}
}
async function pushLocalToCloud(){
  var cfg=loadCloudConfig();
  try{
    showAppLoading();
    var db=normalize(load());
    db._localUpdatedAt=db._localUpdatedAt||new Date().toISOString();
    await cloudUpsertPayload(cfg,db);
    cfg.lastPushedAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
    cloudLog('Đã đẩy dữ liệu local lên Cloud','success');
  }catch(e){cloudLog('Đẩy Cloud thất bại: '+e.message,'error')}
  finally{hideAppLoading();renderCloudConfig()}
}
async function pullCloudToLocal(){
  var cfg=loadCloudConfig();
  try{
    if(!confirm('Kéo dữ liệu Cloud về máy này sẽ ghi đè localStorage hiện tại. Boss nên xuất DB JSON trước. Tiếp tục?'))return;
    showAppLoading();
    var row=await cloudFetchRow(cfg);
    if(!row||!row.payload){cloudLog('Cloud chưa có dữ liệu để kéo về','error');return}
    var db=normalize(row.payload);
    db._cloudUpdatedAt=row.updated_at||new Date().toISOString();
    localStorage.setItem(KEY,JSON.stringify(db));
    cfg.lastPulledAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
    cloudLog('Đã kéo dữ liệu Cloud về máy','success');
    render();
  }catch(e){cloudLog('Kéo Cloud thất bại: '+e.message,'error')}
  finally{hideAppLoading();renderCloudConfig()}
}
async function smartCloudSync(){
  var cfg=loadCloudConfig();
  try{
    showAppLoading();
    var local=normalize(load());
    var row=await cloudFetchRow(cfg);
    if(!row||!row.payload){await cloudUpsertPayload(cfg,local);cloudLog('Cloud trống: đã đẩy local lên Cloud','success');return}
    var localTime=Date.parse(local._localUpdatedAt||0)||0;
    var cloudTime=Date.parse(row.updated_at||0)||0;
    if(cloudTime>localTime){
      localStorage.setItem(KEY,JSON.stringify(normalize(row.payload)));
      cfg.lastPulledAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
      cloudLog('Cloud mới hơn: đã cập nhật dữ liệu về máy','success');
      render();
    }else{
      await cloudUpsertPayload(cfg,local);
      cfg.lastPushedAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
      cloudLog('Local mới hơn hoặc bằng: đã đẩy lên Cloud','success');
    }
  }catch(e){cloudLog('Đồng bộ thất bại: '+e.message,'error')}
  finally{hideAppLoading();renderCloudConfig()}
}
function cloudAutoPush(db){
  var cfg=loadCloudConfig();
  if(!cfg.enabled||!navigator.onLine)return;
  clearTimeout(cloudPushTimer);
  cloudPushTimer=setTimeout(function(){
    cloudUpsertPayload(cfg,normalize(db||load())).then(function(){
      cfg.lastPushedAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
    }).catch(function(e){console.warn('Cloud auto push failed',e)});
  },1500);
}
async function cloudAutoPullOnBoot(){
  var cfg=loadCloudConfig();
  if(!cfg.enabled||!navigator.onLine)return;
  try{
    var row=await cloudFetchRow(cfg);
    if(row&&row.payload){
      var local=normalize(load());
      var localTime=Date.parse(local._localUpdatedAt||0)||0;
      var cloudTime=Date.parse(row.updated_at||0)||0;
      if(cloudTime>localTime){
        localStorage.setItem(KEY,JSON.stringify(normalize(row.payload)));
        cfg.lastPulledAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
        render();
        showToast('Đã đồng bộ dữ liệu Cloud mới nhất','success');
      }
    }
  }catch(e){console.warn('Cloud auto pull failed',e)}
}

function initBackTopButton(){
  var btn=byId('backTopBtn');if(!btn)return;
  function sync(){btn.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop||0)>window.innerHeight)}
  window.addEventListener('scroll',sync,{passive:true});sync();
}
function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'})}
function initSplashScreen(){
  var sp=byId('splashScreen');if(!sp)return;
  setTimeout(function(){sp.classList.add('hide');sp.setAttribute('aria-hidden','true')},1000);
}
window.addEventListener('load',function(){resetPregnancyForm();resetBabyForm();resetMomForm();resetDiaryForm();resetHealthBookForm();resetAppointmentForm();resetAppointmentTypeForm();resetDiaryTypeForm();resetCareForm();render();initBackTopButton();initSplashScreen();initVNClock();setTimeout(cloudAutoPullOnBoot,800)});


(function(){
  var ticking=false;
  function applyCompactHeader(){
    var h=document.querySelector('.appbar');
    if(!h)return;
    h.classList.toggle('compact', (window.scrollY||document.documentElement.scrollTop||0)>36);
  }
  window.addEventListener('scroll',function(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(function(){applyCompactHeader();ticking=false;});
  },{passive:true});
  document.addEventListener('DOMContentLoaded',applyCompactHeader);
})();
