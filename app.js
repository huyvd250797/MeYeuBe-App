var APP_VERSION="14.6.0";
var KEY='meYeuBePWA_v4';
function localDateISO(date){
  var d=date||new Date();
  var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function today(){return localDateISO(new Date())}
function nowHM(){var d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
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
function normalize(db){db=db||{};db.settings=db.settings||{};db.pregnancy=db.pregnancy||[];db.baby=db.baby||[];db.mom=db.mom||[];db.diary=db.diary||[];db.healthBook=db.healthBook||[];db.appointments=db.appointments||[];db.milestones=dedupeMilestonesByKey((Array.isArray(db.milestones)?db.milestones:[]).map(normalizeMilestone));db.careEvents=Array.isArray(db.careEvents)?db.careEvents:[];db.milkInventory=Array.isArray(db.milkInventory)?db.milkInventory:[];db.noiseLogs=Array.isArray(db.noiseLogs)?db.noiseLogs:[];db.luxLogs=Array.isArray(db.luxLogs)?db.luxLogs:[];db.appointmentTypes=Array.isArray(db.appointmentTypes)?db.appointmentTypes:defaultAppointmentTypes();db.diaryTypes=Array.isArray(db.diaryTypes)?db.diaryTypes:defaultDiaryTypes();db.milkContainers=(Array.isArray(db.milkContainers)&&db.milkContainers.length)?db.milkContainers:defaultMilkContainers();db.monthlyNotes=(db.monthlyNotes&&typeof db.monthlyNotes==='object'&&!Array.isArray(db.monthlyNotes))?db.monthlyNotes:{};db.milkInventory=db.milkInventory.map(function(b){b=b||{};if(b.status==='Đã sử dụng')b.status='Đang bảo quản';return b});db.careEvents=db.careEvents.map(function(e){e=e||{};if(e.status==='Đã sử dụng')e.status='Đang bảo quản';return e});db.healthBook=db.healthBook.map(function(x){x=x||{};if(!Array.isArray(x.historyLogs))x.historyLogs=[];if(!Array.isArray(x.vaccines)){x.vaccines=[];if(x.vaccine||x.vaccinePurpose)x.vaccines.push({vaccine:x.vaccine||'',dose:'',purpose:x.vaccinePurpose||''})}return x});try{hb2Normalize(db)}catch(e){console.error(e)}return db}
function save(db){
  db=normalize(db);
  try{pruneAutoMilestones(db)}catch(e){console.error(e)}
  try{checkAutoMilestones(db)}catch(e){console.error(e)}
  db._localUpdatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(db));
  render();
  try{cloudAutoPush(db)}catch(e){}
  try{maybeDispatchPushAlerts(db)}catch(e){}
}
function byId(id){return document.getElementById(id)}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function daysBetween(a,b){if(!a||!b)return 0;var A=new Date(a+'T00:00:00'),B=new Date(b+'T00:00:00');return Math.floor((B-A)/86400000)}
function fmtDate(d){if(!d)return 'Chưa nhập';try{var _dt=new Date(d+'T00:00:00');if(isNaN(_dt.getTime()))return d;return String(_dt.getDate()).padStart(2,'0')+'/'+String(_dt.getMonth()+1).padStart(2,'0')+'/'+_dt.getFullYear()}catch(e){return d}}
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
function doShowPage(id,el){document.querySelectorAll('.page').forEach(function(p){p.classList.add('hidden')});var page=byId(id);if(page)page.classList.remove('hidden');document.querySelectorAll('.navItem').forEach(function(t){t.classList.remove('active')});var target=el||document.querySelector('.navItem[data-page="'+id+'"]');if(target)target.classList.add('active');if(id==='pregnancy'||id==='pregnancyStats'||id==='pregnancyChart')openPregnancyMenu();if(id==='baby'||id==='babyStats'||id==='babyChart')openBabyMenu();if(id==='healthBook2'){try{hb2Render()}catch(e){console.error(e)}}if(id==='scheduleAdd'||id==='scheduleList'||id==='scheduleCalendar')openScheduleMenu();if(id==='careAdd'||id==='careTimeline'||id==='careStats')openCareMenu();if(id==='milestoneAdd'||id==='milestoneTimeline'||id==='monthlyJourney'||id==='statsCompare'||id==='yearSummary')openMemoriesMenu();if(id==='milestoneTimeline')renderMilestoneTimeline(load());if(id==='monthlyJourney')renderMonthlyJourney(load());if(id==='statsCompare')renderStatsCompare(load());if(id==='yearSummary')renderYearSummary(load());if(id==='appointmentType'||id==='milkContainer')openCategoryMenu();if(id==='milkContainer')renderMilkContainers(load());if(typeof nmAbortIfRunning==='function'&&id!=='noiseMeter')nmAbortIfRunning();if(typeof lxAbortIfRunning==='function'&&id!=='luxMeter')lxAbortIfRunning();if(id==='noiseMeter'){openToolsMenu();if(typeof nmOnEnterPage==='function')nmOnEnterPage();}if(id==='luxMeter'){openToolsMenu();if(typeof lxOnEnterPage==='function')lxOnEnterPage();}if(id==='data')updateBackup();if(id==='dashboardConfig')renderDashboardConfig();if(id==='cloudSync'){renderCloudConfig();renderPushConfig();}closeMenu();window.scrollTo(0,0);syncBottomNav(id);hideAppLoading()}
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
function toggleMemoriesMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('memoriesParent');
  var sub=byId('memoriesSubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('memoriesOpen',willOpen);
}
function openMemoriesMenu(){
  var parent=byId('memoriesParent');
  var sub=byId('memoriesSubNav');
  if(parent)parent.classList.add('memoriesOpen');
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
function toggleToolsMenu(event){
  if(event&&event.preventDefault)event.preventDefault();
  var parent=byId('toolsParent'),sub=byId('toolsSubNav');
  if(!parent||!sub)return;
  var willOpen=!sub.classList.contains('open');
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('toolsOpen',willOpen);
}
function openToolsMenu(){
  var parent=byId('toolsParent'),sub=byId('toolsSubNav');
  if(parent)parent.classList.add('toolsOpen');
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
function saveSettings(){var db=load();db.settings=db.settings||{};db.settings.lmp=byId('lmp').value;db.settings.birthDate=byId('birthDate').value;db.settings.birthTimeFrom=byId('birthTimeFrom')?byId('birthTimeFrom').value:(db.settings.birthTime||'');db.settings.birthTimeTo=byId('birthTimeTo')?byId('birthTimeTo').value:'';db.settings.birthTime=db.settings.birthTimeFrom;db.settings.birthHospital=byId('birthHospital')?byId('birthHospital').value:'';db.settings.babyName=byId('babyName').value;db.settings.officialName=byId('officialName').value;db.settings.babySex=byId('babySex')?byId('babySex').value:(db.settings.babySex||'');db.settings.avatarDataUrl=byId('babyAvatarData')?byId('babyAvatarData').value:(db.settings.avatarDataUrl||'');db.settings.showOfficialName=!!(byId('showOfficialName')&&byId('showOfficialName').checked);db.settings.theme=document.documentElement.getAttribute('data-theme')||'';save(db);alert('Đã lưu thiết lập')}
function setVal(id,v){if(byId(id))byId(id).value=(v===undefined||v===null)?'':String(v)}

function renderBabyAvatarSetting(dataUrl){
  var preview=byId('babyAvatarPreview'),hidden=byId('babyAvatarData');
  if(hidden)hidden.value=dataUrl||'';
  if(preview)preview.innerHTML=dataUrl?'<img src="'+esc(dataUrl)+'" alt="Ảnh đại diện của bé">':'👧🏻';
}
function handleBabyAvatarUpload(event){
  var file=event&&event.target&&event.target.files&&event.target.files[0];
  if(!file)return;
  if(!/^image\//i.test(file.type||'')){alert('Vui lòng chọn đúng tệp hình ảnh.');return}
  if(file.size>12*1024*1024){alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 12 MB.');event.target.value='';return}
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var maxSide=512,scale=Math.min(1,maxSide/Math.max(img.width,img.height));
      var w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
      var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
      var dataUrl=canvas.toDataURL('image/jpeg',0.82);
      if(dataUrl.length>900000)dataUrl=canvas.toDataURL('image/jpeg',0.68);
      renderBabyAvatarSetting(dataUrl);
      showToast('Đã chọn ảnh. Bấm Lưu thiết lập để cập nhật.','success');
    };
    img.onerror=function(){alert('Không thể đọc ảnh đã chọn.')};
    img.src=reader.result;
  };
  reader.onerror=function(){alert('Không thể đọc tệp ảnh.')};
  reader.readAsDataURL(file);
}
function removeBabyAvatar(){
  renderBabyAvatarSetting('');
  var file=byId('babyAvatarFile');if(file)file.value='';
  showToast('Đã xóa ảnh tạm thời. Bấm Lưu thiết lập để xác nhận.','success');
}

function timeFromOf(x){return (x&&(x.timeFrom||x.fromTime||x.time))||''}
function timeToOf(x){return (x&&(x.timeTo||x.toTime))||''}
function timeRangeOf(x){var f=timeFromOf(x),t=timeToOf(x);return f?(t?f+' - '+t:f):''}
function timeRankOf(x){return timeFromOf(x)||''}
function birthTimeRange(s){var f=(s&&(s.birthTimeFrom||s.birthTime))||'',t=(s&&s.birthTimeTo)||'';return f?(t?f+' - '+t:f):''}

function resetPregnancyForm(){setVal('pregnancyEditIndex','');setVal('pDate',today());['pWeek','pWeight','pBpd','pHc','pAc','pFl','pAfi','pPosition','pNote'].forEach(function(id){setVal(id,'')});byId('pregnancyFormTitle').textContent='Thêm chỉ số thai kỳ';byId('pregnancyEditBadge').classList.add('hidden')}
function resetBabyForm(){setVal('babyEditIndex','');setVal('bDate',today());['bWeight','bLength','bHead','bFeed','bSleep','bNote'].forEach(function(id){setVal(id,'')});byId('babyFormTitle').textContent='Thêm chỉ số sau sinh';byId('babyEditBadge').classList.add('hidden')}
function savePregnancy(){var req=[['pDate','Ngày khám'],['pWeek','Tuần thai'],['pWeight','Cân nặng ước lượng'],['pBpd','BPD'],['pHc','HC'],['pAc','AC'],['pFl','FL'],['pAfi','Nước ối/AFI'],['pPosition','Ngôi thai']];var missing=[];req.forEach(function(r){if(!byId(r[0]).value.trim())missing.push(r[1])});if(missing.length){alert('Vui lòng nhập đủ thông tin bắt buộc:\n- '+missing.join('\n- '));return}var db=load();var __udBefore=JSON.stringify(db);var item={date:byId('pDate').value,week:byId('pWeek').value.trim(),weight:byId('pWeight').value.trim(),bpd:byId('pBpd').value.trim(),hc:byId('pHc').value.trim(),ac:byId('pAc').value.trim(),fl:byId('pFl').value.trim(),afi:byId('pAfi').value.trim(),position:byId('pPosition').value.trim(),note:byId('pNote').value.trim(),updatedAt:new Date().toISOString()};var idx=byId('pregnancyEditIndex').value;var __pWasAdd=(idx==='');if(idx!==''){item.createdAt=db.pregnancy[Number(idx)].createdAt||item.updatedAt;db.pregnancy[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.pregnancy.unshift(item)}save(db);if(__pWasAdd)udShow('Đã lưu chỉ số thai kỳ.',__udBefore);resetPregnancyForm()}
function saveBaby(){var db=load();var __udBefore=JSON.stringify(db);var item={date:byId('bDate').value||today(),weight:byId('bWeight').value,length:byId('bLength').value,head:byId('bHead').value,feed:byId('bFeed').value,sleep:byId('bSleep').value,note:byId('bNote').value,updatedAt:new Date().toISOString()};var idx=byId('babyEditIndex').value;var __bWasAdd=(idx==='');if(idx!==''){item.createdAt=db.baby[Number(idx)].createdAt||item.updatedAt;db.baby[Number(idx)]=item}else{item.createdAt=item.updatedAt;db.baby.unshift(item)}save(db);if(__bWasAdd)udShow('Đã lưu chỉ số bé.',__udBefore);resetBabyForm()}
function itemActions(type,i){var e=type==='pregnancy'?'editPregnancy':type==='baby'?'editBaby':type==='diary'?'editDiary':'editMom';var c=type==='pregnancy'?'copyPregnancy':type==='baby'?'copyBaby':type==='diary'?'copyDiary':'';var copyBtn=c?'<button class="secondary" onclick="'+c+'('+i+')">Sao chép</button>':'';return '<div class="itemActions"><button class="ghost" onclick="'+e+'('+i+')">Sửa</button>'+copyBtn+'<button class="danger" onclick="del(\''+type+'\','+i+')">Xóa</button></div>'}
function renderList(id,arr,type,fmt){byId(id).innerHTML=arr.length?arr.map(function(x,i){var actionIdx=(typeof x._idx==='number'?x._idx:i);return '<div class="item">'+fmt(x)+itemActions(type,actionIdx)+'</div>'}).join(''):'<p class="notice">Chưa có dữ liệu.</p>'}
function latestHtml(title, x, empty, fmt){if(!x)return '<div class="item"><b>'+title+'</b><p class="notice">'+empty+'</p></div>';return '<div class="item"><b>'+title+'</b>'+fmt(x)+'</div>'}



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
  try{if(typeof renderWhoGrowth==='function')renderWhoGrowth(db)}catch(e){console.error(e)}
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
  var __udBefore=JSON.stringify(db);
  var date=byId('aDate').value,typeId=byId('aType').value;
  if(!date){showToast('Vui lòng nhập Ngày lịch khám','warn');return}
  if(!typeId){showToast('Vui lòng chọn Loại lịch','warn');return}
  var now=new Date().toISOString();
  var timeFrom=byId('aTimeFrom')?byId('aTimeFrom').value:'';var timeTo=byId('aTimeTo')?byId('aTimeTo').value:'';if(!timeFrom){showToast('Vui lòng chọn Từ giờ','warn');return}if(timeTo&&timeTo<timeFrom){showToast('Đến giờ không được nhỏ hơn Từ giờ','warn');return}var item={date:date,time:timeFrom,timeFrom:timeFrom,timeTo:timeTo,typeId:typeId,typeName:typeLabel(db,typeId),title:byId('aTitle').value.trim(),place:byId('aPlace').value.trim(),doctor:byId('aDoctor').value.trim(),person:byId('aPerson').value,cost:byId('aCost').value.trim(),status:byId('aStatus').value,note:byId('aNote').value.trim(),updatedAt:now};
  var idx=byId('scheduleEditIndex').value;
  var __apptWasAdd=(idx==='');
  if(idx!==''){var old=db.appointments[Number(idx)]||{};item.createdAt=old.createdAt||now;db.appointments[Number(idx)]=item;window.__appointmentHighlightIndex=Number(idx);showToast('Cập nhật lịch khám thành công','success')}else{item.createdAt=now;db.appointments.unshift(item);window.__appointmentHighlightIndex=0;showToast('Thêm lịch khám thành công','success')}
  save(db);if(__apptWasAdd)udShow('Đã thêm lịch khám.',__udBefore);resetAppointmentForm();showPage('scheduleList');setTimeout(function(){var el=document.querySelector('[data-appt-idx="'+window.__appointmentHighlightIndex+'"]');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});},100);
}
function editAppointment(i){var db=load(),x=db.appointments[i];if(!x)return;fillAppointmentTypeOptions(db);setValSafe('scheduleEditIndex',i);setValSafe('aDate',x.date);setValSafe('aTimeFrom',timeFromOf(x));setValSafe('aTimeTo',timeToOf(x));setValSafe('aType',x.typeId);setValSafe('aTitle',x.title);setValSafe('aPlace',x.place);setValSafe('aDoctor',x.doctor);setValSafe('aPerson',x.person||'Mẹ');setValSafe('aCost',x.cost);setValSafe('aStatus',x.status||'Sắp tới');setValSafe('aNote',x.note);byId('scheduleFormTitle').textContent='Sửa lịch khám';byId('scheduleEditBadge').classList.remove('hidden');showPage('scheduleAdd')}
function copyAppointment(i){var db=load(),x=db.appointments[i];if(!x)return;fillAppointmentTypeOptions(db);setValSafe('scheduleEditIndex','');setValSafe('aDate',x.date||today());setValSafe('aTimeFrom',timeFromOf(x));setValSafe('aTimeTo',timeToOf(x));setValSafe('aType',x.typeId);setValSafe('aTitle',x.title||'');setValSafe('aPlace',x.place||'');setValSafe('aDoctor',x.doctor||'');setValSafe('aPerson',x.person||'Mẹ');setValSafe('aCost',x.cost||'');setValSafe('aStatus',x.status||'Sắp tới');setValSafe('aNote',x.note||'');byId('scheduleFormTitle').textContent='Sao chép lịch khám';byId('scheduleEditBadge').classList.add('hidden');showToast('Đã sao chép lịch, bấm Lưu để tạo lịch mới','success');showPage('scheduleAdd')}
function delAppointment(i){if(!confirm('Xóa lịch khám này?'))return;var db=load();var __udBefore=JSON.stringify(db);db.appointments.splice(i,1);save(db);udShow('Đã xóa lịch khám.',__udBefore);showToast('Xóa lịch khám thành công','success')}
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

/* ===================== 🧷 Thay tã — nâng cấp giao diện nhập nhanh (V11.2.0) ===================== */
function careTypeMeta(type){
  var map={feed:{icon:'🍼',label:'Bé bú'},pump:{icon:'🥛',label:'Hút sữa'},sleep:{icon:'😴',label:'Ngủ'},diaper:{icon:'🧷',label:'Thay tã'},pee:{icon:'💧',label:'Đi tè'},poop:{icon:'💩',label:'Đi phân'},milk:{icon:'🧊',label:'Kho sữa'},medicine:{icon:'💊',label:'Uống thuốc'},temperature:{icon:'🌡️',label:'Thân nhiệt'},spitup:{icon:'🤮',label:'Trớ sữa'},transfer:{icon:'🔄',label:'Chuyển sữa'}};
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
  syncCareFormTitle();
  syncCareDateTimeRowsForType(type);
  syncCareNoteCollapse(type);
  syncCareFormChromeForType(type);
}
function syncCareFormChromeForType(type){
  /* V13.1.0: banner "mô hình liên kết" và 2 nút Timer Bú/Ngủ chỉ còn ý nghĩa với
     Bé bú/Hút sữa/Ngủ — ẩn đi cho Thay tã/Uống thuốc/Thân nhiệt/Trớ sữa để form gọn hơn. */
  var show=(type==='feed'||type==='pump'||type==='sleep');
  var notice=byId('careFormLinkNotice');if(notice)notice.classList.toggle('hidden',!show);
  var timerBox=byId('careTimerBox');if(timerBox)timerBox.classList.toggle('hidden',!show);
}
function syncCareDateTimeRowsForType(type){
  var isDiaper=type==='diaper';
  var endRow=byId('careEndTimeRow'),durRow=byId('careDurationRow'),dateLabel=byId('cDateLabel'),timeLabel=byId('cTimeFromLabel');
  if(endRow)endRow.classList.toggle('hidden',isDiaper);
  if(durRow)durRow.classList.toggle('hidden',isDiaper);
  if(dateLabel)dateLabel.textContent=isDiaper?'Ngày *':'Ngày bắt đầu *';
  if(timeLabel)timeLabel.textContent=isDiaper?'Giờ *':'Từ giờ *';
}
function toggleCareNote(forceOpen){
  var body=byId('careNoteBody'),toggle=byId('careNoteToggle');
  if(!body||!toggle)return;
  var open=forceOpen===true||body.classList.contains('hidden');
  body.classList.toggle('hidden',!open);
  toggle.classList.toggle('hidden',open);
  if(open)setTimeout(function(){var n=byId('cNote');if(n)n.focus({preventScroll:true})},0);
}
function syncCareNoteCollapse(type){
  var body=byId('careNoteBody'),toggle=byId('careNoteToggle');
  if(!body||!toggle)return;
  var hasNote=!!(byId('cNote')&&byId('cNote').value.trim());
  var collapse=type==='diaper'&&!hasNote;
  body.classList.toggle('hidden',collapse);
  toggle.classList.toggle('hidden',!collapse);
  if(typeof syncCareNoteCount==='function')syncCareNoteCount();
}
function syncCareFormTitle(){
  var type=window.__careSelectedType||'feed';
  var meta=careTypeMeta(type);
  var isEdit=!!(byId('careEditIndex')&&byId('careEditIndex').value!=='');
  var isCopy=!!window.__careFormIsCopy;
  var titleEl=byId('careFormTitle');
  if(titleEl)titleEl.textContent=(isEdit?'Sửa ghi nhận':isCopy?'Sao chép ghi nhận':'Ghi nhận')+' · '+meta.icon+' '+meta.label;
  var cap=byId('careFormModalCaption');
  if(cap)cap.textContent=(isEdit?'✏️ Sửa ':isCopy?'📄 Sao chép ':'＋ Ghi nhận ')+meta.label;
}

function addMonthsISODateTime(base,months){var d=new Date(base.getTime());var day=d.getDate();d.setMonth(d.getMonth()+months);if(d.getDate()<day)d.setDate(0);return localDateTimeValue(d)}
function localDateTimeValue(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function careBaseDateTime(){var date=(byId('cDate')&&byId('cDate').value)||today();var time=(byId('cTimeFrom')&&byId('cTimeFrom').value)||'00:00';return new Date(date+'T'+time+':00')}
function milkStorageHours(storage){var s=storage||'';if(s==='Nhiệt độ phòng')return 4;if(s==='Túi giữ lạnh có đá')return 24;if(s==='Ngăn mát')return 96;if(s==='Ngăn đông')return 24*30*6;if(s==='Tủ đông sâu')return 24*30*12;return 96}
function milkExpireDateTimeFor(storage){var base=careBaseDateTime();var s=storage||'';if(!s)return '';if(s==='Ngăn đông')return addMonthsISODateTime(base,6);if(s==='Tủ đông sâu')return addMonthsISODateTime(base,12);var d=new Date(base.getTime()+milkStorageHours(s)*3600000);return localDateTimeValue(d)}
function fillMilkExpiryFromStorage(force){var exp=byId('cExpireDate');if(!exp)return;var storage=(byId('cStorage')&&byId('cStorage').value)||'';if(!storage){exp.value='';if(typeof syncPumpUI==='function')syncPumpUI();return}if(force||!exp.value)exp.value=milkExpireDateTimeFor(storage);if(typeof syncPumpUI==='function')syncPumpUI()}
function milkExpireAt(b){var raw=(b&&(b.expireDateTime||b.expireDate))||'';if(!raw)return 8640000000000000;var d=new Date(String(raw).indexOf('T')>-1?raw:(raw+'T23:59:00'));var t=d.getTime();return isNaN(t)?8640000000000000:t}
function milkTimeLeftText(b){var t=milkExpireAt(b);if(!isFinite(t)||t>8000000000000000)return 'Chưa có HSD';var diff=t-Date.now();if(diff<=0)return 'Đã quá hạn';var h=Math.floor(diff/3600000),d=Math.floor(h/24),rem=h%24;return d>0?('Còn '+d+' ngày '+rem+' giờ'):('Còn '+h+' giờ')}
function milkUrgencyIcon(b){var t=milkExpireAt(b),diff=(t-Date.now())/3600000;if(diff<=0)return '⚫️';if(diff<1)return '‼️';if(diff<6)return '🔴';if(diff<12)return '🟠';if(diff<24)return '🟡';return '🟢'}
function milkBagBaseDate(b){b=b||{};var raw=String(b.date||b.startDate||b.createdAt||b.createdDateTime||'');return raw?raw.slice(0,10):today()}
function shortMilkBagCodeFromDate(date){var d=String(date||today()).slice(0,10).split('-');if(d.length!==3)return 'SUA';return d[0].slice(2)+d[1]+d[2]}
/* V13.5.0 — nhãn loại dụng cụ chứa, để không gọi nhầm Bình thành Túi */
function milkBagKind(b){
  var k=(b&&b.containerKind)||'';
  if(k==='binh'||k==='tui')return k;
  return '';
}
/* '2 bình · 1 túi' — thay cho việc gọi tất cả là túi */
function milkKindCountText(arr){
  arr=arr||[];
  var b=0,t=0;
  arr.forEach(function(x){var k=milkBagKind(x);if(k==='tui')t++;else b++});
  if(b&&t)return b+' bình · '+t+' túi';
  if(t)return t+' túi';
  return b+' bình';
}
function milkBagKindLabel(b){var k=milkBagKind(b);return k==='tui'?'Túi':(k==='binh'?'Bình':'')}
function milkBagKindIcon(b){var k=milkBagKind(b);return k==='tui'?'🥛':(k==='binh'?'🍼':'🧊')}
function milkKindChipHtml(b){
  var k=milkBagKind(b);if(!k)return '';
  return '<span class="mkKind '+(k==='tui'?'t':'b')+'">'+(k==='tui'?'Túi':'Bình')+'</span>';
}
function milkBagDisplayId(b){return (b&&b.containerName)||(b&&(b.shortId||b.shortCode))||shortMilkBagCodeFromDate(milkBagBaseDate(b))}
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
function milkExpireBadge(b){
  var t=milkExpireAt(b);
  if(!isFinite(t)||t>8000000000000000)return {text:'Chưa có HSD',cls:'far'};
  if(t-Date.now()<=0)return {text:'Đã quá hạn',cls:'over'};
  var d0=new Date(),d1=new Date(t);
  var days=Math.round((new Date(d1.getFullYear(),d1.getMonth(),d1.getDate())-new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()))/86400000);
  if(days<=0)return {text:'HSD hôm nay',cls:'today'};
  if(days===1)return {text:'HSD ngày mai',cls:'soon'};
  if(days<=3)return {text:'HSD '+days+' ngày nữa',cls:'soon'};
  return {text:'HSD '+days+' ngày nữa',cls:'far'};
}
function milkFeedSourcesState(){window.__milkFeedSources=window.__milkFeedSources||[];return window.__milkFeedSources}
function resetMilkFeedSourcesState(){window.__milkFeedSources=[];window.__milkPickerActiveBagId=null;window.__milkPickerDraftMl=0}
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
function renderMilkSourceList(){
  var wrap=byId('milkSourceList');if(!wrap)return;
  var db=load(),arr=milkFeedSourcesState();
  if(!arr.length){wrap.innerHTML='<p class="notice milkSourceEmpty">Chưa chọn túi sữa nào. Bấm “＋ Thêm túi sữa” bên dưới.</p>';return}
  wrap.innerHTML='<div class="milkSourceListLabel">Túi sữa đã chọn ('+arr.length+')</div>'+arr.map(function(s,i){
    var b=findMilkBag(db,s.bagId);
    var badge=b?milkExpireBadge(b):{text:'',cls:'far'};
    var remainAfter=b?Math.max(0,Number(b.remaining||0)-Number(s.usedMl||0)):0;
    var discarding=s.remainderAction&&s.remainderAction!=='keep';
    return '<div class="milkChosenCard">'+
      '<div class="milkChosenMain"><div class="milkPickTop"><b>'+esc(b?milkBagDisplayId(b):s.bagId)+'</b>'+(badge.text?('<span class="milkPickBadge badge-'+badge.cls+'">'+esc(badge.text)+'</span>'):'')+'</div>'+
      '<small>'+(b&&b.note?esc(b.note):(b?('Tạo '+esc(milkCreatedText(b))):''))+'</small>'+
      '<small><b>'+Number(s.usedMl||0)+'ml</b> · Còn lại: '+remainAfter+'ml'+(discarding?' · <span class="milkChosenDiscardTag">sẽ hủy phần còn lại</span>':'')+'</small>'+
      (remainAfter>0?('<button type="button" class="milkChosenRemainderToggle" onclick="toggleMilkSourceRemainder('+i+')">'+(discarding?'↺ Giữ lại phần còn lại':'🗑 Hủy phần còn lại trong túi')+'</button>'):'')+
      '</div>'+
      '<button type="button" class="milkChosenRemove" onclick="removeMilkFeedSource('+i+')" aria-label="Xoá túi sữa">✕</button>'+
    '</div>';
  }).join('');
}
function toggleMilkSourceRemainder(idx){
  var s=milkFeedSourcesState()[idx];if(!s)return;
  var discarding=s.remainderAction&&s.remainderAction!=='keep';
  s.remainderAction=discarding?'keep':'discard';
  s.discardReason=discarding?'':'Đổ bỏ phần còn lại';
  renderMilkSourceList();
  if(typeof abSyncPartialHint==='function')abSyncPartialHint();
}
function removeMilkFeedSource(idx){if(typeof abDropBag==='function'){abDropBag(idx);return}milkFeedSourcesState().splice(idx,1);renderMilkSourceList();updateCareMilkSourceTotal()}
function updateCareMilkSourceTotal(){
  var source=byId('cFeedSource');
  var pb=byId('milkProgressBox');
  if(!source||source.value!=='stored'){if(pb)pb.classList.add('hidden');return}
  if(pb)pb.classList.remove('hidden');
  var arr=milkFeedSourcesState();
  var total=arr.reduce(function(t,s){return t+Number(s.usedMl||0)},0);
  var target=Number((byId('cAmount')&&byId('cAmount').value)||0);
  var txt=byId('milkProgressText');if(txt)txt.textContent=total+' / '+(target||0)+' ml';
  var fill=byId('milkProgressFill');
  var pct=target>0?Math.min(100,Math.round(total/target*100)):(total>0?100:0);
  if(fill){fill.style.width=pct+'%';fill.classList.toggle('full',target>0&&total>=target)}
  var status=byId('milkProgressStatus');
  if(status){
    if(target<=0)status.innerHTML='';
    else if(total>=target)status.innerHTML='<span class="milkStatusOk">✓ Đủ lượng'+(total>target?' (dư '+(total-target)+'ml)':'')+'</span>';
    else status.innerHTML='<span class="milkStatusWarn">Còn thiếu '+(target-total)+' ml</span>';
  }
  updateCareFeedWastePreview();
}
function updateCareFeedWastePreview(){
  var source=byId('cFeedSource');if(!source||source.value!=='stored')return;
  var total=milkFeedSourcesState().reduce(function(t,s){return t+Number(s.usedMl||0)},0);
  var wasteEl=byId('cFeedWasteMl');var waste=Number((wasteEl&&wasteEl.value)||0);
  if(!isFinite(waste)||waste<0)waste=0;
  if(waste>total)waste=total;
  if(wasteEl&&Number(wasteEl.value)!==waste)wasteEl.value=waste;
  var actualEl=byId('cFeedActualMl');if(actualEl)actualEl.value=Math.max(0,total-waste)+' ml';
}
function toggleFeedSourceFields(){
  var source=(byId('cFeedSource')&&byId('cFeedSource').value)||'direct';
  var panel=byId('milkSourcePanel');if(panel)panel.classList.toggle('hidden',source!=='stored');
  var lbl=byId('cAmountLabel');if(lbl)lbl.textContent=(source==='stored'?'Bé bú bao nhiêu? (ml)':'Số lượng ml');
  var amount=byId('cAmount');if(amount)amount.placeholder=(source==='stored'?'Ví dụ: 70':'Ví dụ: 80');
  updateCareMilkSourceTotal();
  if(typeof abOnFeedSourceChange==='function')abOnFeedSourceChange();
}
function collectMilkSourcesFromForm(){return milkFeedSourcesState().map(function(s){return Object.assign({},s)})}

/* V10.9.1: Bag picker overlay - tìm kiếm, sắp xếp, chọn túi + nhập ml theo bước */
function openMilkBagPicker(){
  window.__milkPickerActiveBagId=null;window.__milkPickerDraftMl=0;window.__milkPickerSort=window.__milkPickerSort||'expire';
  var ov=byId('milkBagPickerOverlay');if(!ov)return;
  var search=byId('milkBagPickerSearch');if(search)search.value='';
  var sortSel=byId('milkBagPickerSort');if(sortSel)sortSel.value=window.__milkPickerSort;
  renderMilkBagPickerList();
  ov.classList.add('show');document.body.classList.add('careModalOpen');
  setTimeout(function(){if(search)search.focus({preventScroll:true})},60);
}
function closeMilkBagPicker(){var ov=byId('milkBagPickerOverlay');if(ov)ov.classList.remove('show');document.body.classList.remove('careModalOpen');window.__milkPickerActiveBagId=null}
function sortMilkPickerList(list,mode){
  if(mode==='newest')return list.slice().sort(function(a,b){return String(b.date+b.timeFrom).localeCompare(String(a.date+a.timeFrom))});
  if(mode==='mostMl')return list.slice().sort(function(a,b){return Number(b.remaining||0)-Number(a.remaining||0)});
  return list.slice();
}
function milkBagPickerFilterAndRender(){window.__milkPickerActiveBagId=null;renderMilkBagPickerList()}
function milkBagPickerSortChange(){window.__milkPickerSort=(byId('milkBagPickerSort')&&byId('milkBagPickerSort').value)||'expire';window.__milkPickerActiveBagId=null;renderMilkBagPickerList()}
function renderMilkBagPickerList(){
  var wrap=byId('milkBagPickerList');if(!wrap)return;
  var db=load();
  var chosen={};milkFeedSourcesState().forEach(function(s){chosen[s.bagId]=true});
  var q=((byId('milkBagPickerSearch')&&byId('milkBagPickerSearch').value)||'').trim().toLowerCase();
  var list=activeMilkBags(db).filter(function(b){return !chosen[b.id]});
  list=sortMilkPickerList(list,window.__milkPickerSort||'expire');
  if(q)list=list.filter(function(b){return (milkBagDisplayId(b)+' '+(b.note||'')+' '+(b.storage||'')).toLowerCase().indexOf(q)>-1});
  if(!list.length){wrap.innerHTML='<p class="notice">'+(q?'Không tìm thấy túi sữa phù hợp.':'Bạn đã chọn hết túi sữa khả dụng trong kho.')+'</p>';return}
  wrap.innerHTML=list.map(function(b){return milkBagPickerCardHtml(b)}).join('');
}
function milkBagPickerCardHtml(b){
  var badge=milkExpireBadge(b);
  var active=window.__milkPickerActiveBagId===b.id;
  var maxMl=Number(b.remaining||0);
  var stepVal=active?Number(window.__milkPickerDraftMl||Math.min(maxMl,20)):0;
  var remainAfter=Math.max(0,maxMl-stepVal);
  return '<div class="milkPickCard'+(active?' active':'')+'">'+
    '<div class="milkPickCardHead" onclick="toggleMilkBagPickerStep(\''+esc(b.id)+'\','+maxMl+')">'+
      '<span class="milkPickRadio">'+(active?'✓':'')+'</span>'+
      '<div class="milkPickInfo"><div class="milkPickTop"><b>'+esc(milkBagDisplayId(b))+'</b><span class="milkPickBadge badge-'+badge.cls+'">'+esc(badge.text)+'</span></div>'+
      '<small>'+(b.note?esc(b.note)+' · ':'')+'Tạo '+esc(milkCreatedText(b))+'</small></div>'+
      '<div class="milkPickAmount">Còn '+maxMl+'ml</div>'+
    '</div>'+
    (active?('<div class="milkPickStep"><label>Dùng bao nhiêu?</label><div class="milkStepper"><button type="button" onclick="adjustMilkPickerDraft(-10,'+maxMl+')">−</button><input id="milkPickerDraftInput" type="number" min="0" max="'+maxMl+'" value="'+stepVal+'" oninput="onMilkPickerDraftInput('+maxMl+')"><button type="button" onclick="adjustMilkPickerDraft(10,'+maxMl+')">+</button></div><small id="milkPickRemainAfter">Còn lại sau khi dùng: '+remainAfter+' ml</small><button type="button" class="ok milkPickConfirmBtn" onclick="confirmMilkBagPick(\''+esc(b.id)+'\','+maxMl+')">Thêm vào túi này</button></div>'):'')+
  '</div>';
}
function toggleMilkBagPickerStep(bagId,maxMl){
  if(window.__milkPickerActiveBagId===bagId){window.__milkPickerActiveBagId=null}
  else{window.__milkPickerActiveBagId=bagId;var target=Number((byId('cAmount')&&byId('cAmount').value)||0);var remainToTarget=target>0?Math.max(0,target-milkFeedSourcesState().reduce(function(t,s){return t+Number(s.usedMl||0)},0)):maxMl;window.__milkPickerDraftMl=Math.max(0,Math.min(maxMl,remainToTarget>0?remainToTarget:maxMl))}
  renderMilkBagPickerList();
}
function adjustMilkPickerDraft(delta,maxMl){
  var v=Number(window.__milkPickerDraftMl||0)+delta;
  if(v<0)v=0;if(v>maxMl)v=maxMl;
  window.__milkPickerDraftMl=v;
  var input=byId('milkPickerDraftInput');if(input)input.value=v;
  var out=byId('milkPickRemainAfter');if(out)out.textContent='Còn lại sau khi dùng: '+Math.max(0,maxMl-v)+' ml';
}
function onMilkPickerDraftInput(maxMl){
  var input=byId('milkPickerDraftInput');var v=Number((input&&input.value)||0);
  if(!isFinite(v)||v<0)v=0;if(v>maxMl)v=maxMl;
  window.__milkPickerDraftMl=v;
  var out=byId('milkPickRemainAfter');if(out)out.textContent='Còn lại sau khi dùng: '+Math.max(0,maxMl-v)+' ml';
}
function confirmMilkBagPick(bagId,maxMl){
  var ml=Number(window.__milkPickerDraftMl||0);
  if(ml<=0){showToast('Vui lòng nhập số ml sử dụng','warn');return}
  if(ml>maxMl)ml=maxMl;
  milkFeedSourcesState().push({bagId:bagId,usedMl:ml,remainderAction:'keep',discardMl:0,discardReason:''});
  if(typeof abOnManualEdit==='function')abOnManualEdit();
  closeMilkBagPicker();
  renderMilkSourceList();
  updateCareMilkSourceTotal();
}

function selectDiaperType(value){
  setValSafe('cDiaperType',value||'wet');
  document.querySelectorAll('.diaperChoice').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-diaper')===value)});
}
/* V13.5.0: một ô số lượng duy nhất, mặc định 1, giới hạn 1–3 tã mỗi lần ghi */
var DIAPER_MAX=3;
function diaperSetAmount(v){
  v=Math.min(DIAPER_MAX,Math.max(1,Math.round(Number(v)||1)));
  setValSafe('cAmount',v);
  var disp=byId('diaperQtyDisplay');if(disp)disp.textContent=v;
  var m=byId('diaperMinus');if(m)m.disabled=(v<=1);
  var p=byId('diaperPlus');if(p)p.disabled=(v>=DIAPER_MAX);
}
function diaperStepAmount(delta){
  var cur=Number((byId('cAmount')&&byId('cAmount').value)||1)||1;
  diaperSetAmount(cur+(Number(delta)||0));
}
function diaperTypeLabel(value){var v=value||'wet';if(v==='wet'||v==='Tã ướt')return 'Tã ướt';if(v==='dirty'||v==='Tã bẩn'||v==='both'||v==='Cả hai')return 'Tã bẩn';return v}
function diaperPeeCount(x){var a=Number((x&&x.amount)||1)||1;return a}
function diaperPoopCount(x){var v=(x&&x.extra&&(x.extra.diaperType||x.extra.diaperKind))||'';var a=Number((x&&x.amount)||1)||1;var label=diaperTypeLabel(v);return (label==='Tã bẩn')?a:0}
function legacyPeePoopToDiaperType(type){return type==='poop'?'dirty':'wet'}
function normalizeCareInputType(type){return (type==='pee'||type==='poop')?'diaper':type}

/* ===================== 🥛 Hút sữa — nâng cấp giao diện nhập nhanh (V11.3.1) ===================== */
var PUMP_AMOUNT_PRESETS=[60,120,150,200];
function pumpSideLabel(v){var s=v||'Cả hai';return s==='Trái'?'Bên trái':(s==='Phải'?'Bên phải':'Cả hai')}
function pumpSetSide(v){setValSafe('cPumpSide',v||'Cả hai');syncPumpUI()}
function pumpCurrentAmount(){var el=byId('cAmount');var n=Number((el&&el.value)||0);return isFinite(n)&&n>0?Math.round(n):0}
function pumpSetAmount(v){var n=Math.max(0,Math.round(Number(v)||0));setValSafe('cAmount',n?String(n):'');syncPumpUI()}
function pumpStepAmount(delta){pumpSetAmount(pumpCurrentAmount()+(Number(delta)||0))}
function pumpExpireLeftText(){
  var raw=(byId('cExpireDate')&&byId('cExpireDate').value)||'';
  if(!raw)return 'Chưa có';
  var t=new Date(raw).getTime();if(isNaN(t))return 'Chưa có';
  var diff=t-Date.now();if(diff<=0)return 'Đã quá hạn';
  var h=diff/3600000;
  if(h>=24)return Math.max(1,Math.round(h/24))+' ngày tới';
  return Math.max(1,Math.round(h))+' giờ tới';
}
function pumpExpireShortText(){
  var raw=(byId('cExpireDate')&&byId('cExpireDate').value)||'';
  if(!raw)return '--';
  var d=new Date(raw);if(isNaN(d.getTime()))return '--';
  return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}
function syncPumpUI(){
  var seg=byId('pumpSideSeg');if(!seg)return;
  var side=(byId('cPumpSide')&&byId('cPumpSide').value)||'Cả hai';
  seg.querySelectorAll('.pumpSegBtn').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-side')===side)});
  var amount=pumpCurrentAmount();
  var presets=byId('pumpPresets');
  if(presets)presets.querySelectorAll('.pumpPreset').forEach(function(b){b.classList.toggle('active',Number(b.getAttribute('data-ml'))===amount&&amount>0)});
  var left=byId('pumpExpireLeft');if(left)left.textContent=pumpExpireLeftText();
  var storage=(byId('cStorage')&&byId('cStorage').value)||'';
  var sum=byId('pumpSummary');
  if(sum)sum.innerHTML='<div class="pumpSummaryItem"><b><span class="ico">💧</span>'+esc(amount?amount+' ml':'-- ml')+'</b><span>Số lượng</span></div>'+
    '<div class="pumpSummaryItem"><b><span class="ico">🤱</span>'+esc(pumpSideLabel(side))+'</b><span>Bên hút</span></div>'+
    '<div class="pumpSummaryItem"><b><span class="ico">❄️</span>'+esc(storage||'Chưa chọn')+'</b><span>Bảo quản</span></div>'+
    '<div class="pumpSummaryItem"><b><span class="ico">📅</span>'+esc(pumpExpireShortText())+'</b><span>HSD dự kiến</span></div>';
}
function syncCareNoteCount(){
  var note=byId('cNote'),out=byId('cNoteCount');if(!note||!out)return;
  out.textContent=String((note.value||'').length)+'/200';
}

function renderCareDynamicFields(type,db){
  var box=byId('careDynamicFields');if(!box)return;type=type||window.__careSelectedType||'feed';db=db||load();
  if(type==='feed'){
    box.innerHTML='<div class="row"><div><label>Hình thức bú *</label><select id="cFeedSource" onchange="toggleFeedSourceFields()"><option value="direct">Bú mẹ trực tiếp</option><option value="stored">Bú từ kho sữa đã hút</option><option value="formula">Sữa công thức</option></select></div><div><label id="cAmountLabel">Số lượng ml</label><input id="cAmount" type="number" min="0" placeholder="Ví dụ: 80" oninput="abOnAmountInput()"></div></div><div id="milkSourcePanel" class="milkSourcePanel hidden"><div class="abHead"><b>BÌNH / TÚI ĐƯỢC GẮN</b><span id="abModeBadge" class="abBadge">TỰ ĐỘNG</span></div><div id="milkProgressBox" class="milkProgressBox hidden"><div class="milkProgressHead"><span>Đã lấy từ kho</span><b id="milkProgressText">0 / 0 ml</b></div><div class="milkProgressBar"><div id="milkProgressFill" class="milkProgressFill"></div></div><div id="milkProgressStatus" class="milkProgressStatus"></div></div><div id="milkSourceList" class="milkSourceList"></div><div id="abWarnBox" class="abWarn hidden"></div><p id="abPartialHint" class="abPartial hidden"></p><button type="button" id="abReAutoBtn" class="abReBtn hidden" onclick="abReAuto()">↻ Cho app tự chọn lại</button><div class="btns"><button type="button" class="secondary milkAddBagBtn" onclick="openMilkBagPicker()">＋ Thêm túi sữa</button></div><div class="row"><div><label>Số ml bỏ (bé không bú hết)</label><input id="cFeedWasteMl" type="number" min="0" value="0" oninput="updateCareFeedWastePreview()" placeholder="0"></div><div><label>Số ml bé bú thực tế</label><input id="cFeedActualMl" readonly placeholder="Tự tính"></div></div><p class="notice">Nhập tổng lượng bé bú dự kiến ở ô “Số lượng ml” phía trên, sau đó chọn túi sữa cho đủ lượng. Số ml lấy ra khỏi túi chưa chắc bé bú hết — nhập “Số ml bỏ” nếu có để thống kê chính xác.</p></div><p class="notice">Nhập số ml bé bú, app tự gắn bình/túi theo hạn dùng gần nhất. Bấm ✕ để bỏ một bình — app sẽ chuyển sang chế độ thủ công.</p>';
    if(!window.__milkFeedSourcesKeep)resetMilkFeedSourcesState();
    renderMilkSourceList();toggleFeedSourceFields();
  }else if(type==='pump'){
    box.innerHTML='<div class="pumpForm">'+
      '<div class="pumpBlock"><div class="pumpLabel">Bên hút</div>'+
      '<div class="pumpSeg" id="pumpSideSeg">'+
      '<button type="button" class="pumpSegBtn" data-side="Cả hai" onclick="pumpSetSide(&quot;Cả hai&quot;)"><span class="ico">💧</span>Cả hai</button>'+
      '<button type="button" class="pumpSegBtn" data-side="Trái" onclick="pumpSetSide(&quot;Trái&quot;)"><span class="ico">💧</span>Bên trái</button>'+
      '<button type="button" class="pumpSegBtn" data-side="Phải" onclick="pumpSetSide(&quot;Phải&quot;)"><span class="ico">💧</span>Bên phải</button>'+
      '</div><input id="cPumpSide" type="hidden" value="Cả hai"></div>'+
      '<div class="pumpBlock"><div class="pumpLabel">Số lượng <i>*</i></div>'+
      '<div class="pumpAmountRow">'+
      '<button type="button" class="pumpStepBtn" onclick="pumpStepAmount(-10)" aria-label="Giảm 10ml">−</button>'+
      '<div class="pumpAmountVal"><input id="cAmount" type="number" min="0" step="5" inputmode="numeric" placeholder="0" oninput="syncPumpUI()"><span>ml</span></div>'+
      '<button type="button" class="pumpStepBtn plus" onclick="pumpStepAmount(10)" aria-label="Tăng 10ml">＋</button>'+
      '</div><div class="pumpPresets" id="pumpPresets"><span class="pumpPresetLabel">Gợi ý nhanh</span>'+
      PUMP_AMOUNT_PRESETS.map(function(v){return '<button type="button" class="pumpPreset" data-ml="'+v+'" onclick="pumpSetAmount('+v+')">'+v+' ml</button>'}).join('')+
      '</div></div>'+
      '<div class="pumpBlock"><div class="pumpLabel">Đựng vào bình / túi <i>*</i></div>'+
      '<input id="cContainerId" type="hidden" value="">'+
      '<div class="mcChips" id="cContainerChips"></div>'+
      '<p class="notice" id="cContainerHint"></p></div>'+
      '<div class="pumpDuo">'+
      '<div class="pumpBlock"><div class="pumpLabel">Vị trí bảo quản <i>*</i></div><div class="pumpFieldCard"><span class="ico">❄️</span>'+
      '<select id="cStorage" onchange="fillMilkExpiryFromStorage(true);syncPumpUI()"><option value="">-- Chọn nơi bảo quản --</option><option value="Nhiệt độ phòng">Nhiệt độ phòng · 4 giờ</option><option value="Túi giữ lạnh có đá">Túi giữ lạnh có đá · 24 giờ</option><option value="Ngăn mát">Ngăn mát (4°C) · 4 ngày</option><option value="Ngăn đông">Ngăn đông · 6 tháng</option><option value="Tủ đông sâu">Tủ đông sâu · 12 tháng</option></select></div></div>'+
      '<div class="pumpBlock"><div class="pumpLabel">Trạng thái</div><div class="pumpFieldCard"><span class="ico">🛡️</span>'+
      '<select id="cStatus" onchange="syncPumpUI()"><option value="Đang bảo quản">Đang bảo quản</option><option value="Đã sử dụng hết">Đã sử dụng hết</option><option value="Đã bỏ">Đã bỏ</option></select></div></div>'+
      '</div>'+
      '<div class="pumpBlock"><div class="pumpLabel">Hạn sử dụng dự kiến</div><div class="pumpFieldCard"><span class="ico">📅</span>'+
      '<input id="cExpireDate" type="datetime-local" readonly onchange="syncPumpUI()"><b id="pumpExpireLeft">--</b></div></div>'+
      '<div class="pumpTip"><span class="ico">💡</span><div><b>Gợi ý bảo quản</b><small>Nhiệt độ phòng 4 giờ · Túi giữ lạnh có đá 24 giờ · Ngăn mát 4 ngày · Ngăn đông 6 tháng · Tủ đông sâu 12 tháng</small></div></div>'+
      '<div class="pumpSummary" id="pumpSummary"></div>'+
      '</div>';
    syncPumpUI();
    mcRenderPumpChips();

  }else if(type==='sleep'){
    box.innerHTML='<div class="crossDayHint">Nhập Ngày bắt đầu/Từ giờ. Đến giờ không bắt buộc: nếu để trống, app hiểu bé đang ngủ; nếu nhập Đến giờ, app hiểu bé đã dậy.</div>';
  }else if(type==='diaper'){
    var prevDiaperType=(byId('cDiaperType')&&byId('cDiaperType').value)||'wet';
    var prevAmount=Number((byId('cAmount')&&byId('cAmount').value)||1)||1;
    box.innerHTML='<input id="cDiaperType" type="hidden" value="wet"><label>Loại tã</label><div class="diaperChoiceGrid diaperChoiceGrid2"><button type="button" class="diaperChoice active" data-diaper="wet" onclick="selectDiaperType(\'wet\')"><span class="ico">💧</span>Tã ướt<small>+1 tã, +1 đi tè</small><span class="diaperCheck">✓</span></button><button type="button" class="diaperChoice" data-diaper="dirty" onclick="selectDiaperType(\'dirty\')"><span class="ico">💩</span>Tã bẩn<small>+1 tã, +1 tè, +1 phân</small><span class="diaperCheck">✓</span></button></div><label>Số lượng</label><div class="diaperStep"><button type="button" id="diaperMinus" onclick="diaperStepAmount(-1)">−</button><div class="diaperStepVal"><b id="diaperQtyDisplay">1</b><small>tã · tối đa 3</small></div><button type="button" id="diaperPlus" onclick="diaperStepAmount(1)">＋</button></div><input id="cAmount" type="hidden" value="1"><p class="notice">Không cần nhập riêng Đi tè/Đi phân. Tã ướt tự cộng đi tè; tã bẩn tự cộng cả đi tè và đi phân.</p>';
    selectDiaperType(prevDiaperType);
    diaperSetAmount(prevAmount);
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
function resetCareForm(){setValSafe('careEditIndex','');setValSafe('careLinkedBagId','');setValSafe('cDate',today());setValSafe('cEndDate',today());setValSafe('cTimeFrom',nowHM());setValSafe('cTimeTo','');setValSafe('cDurationPreview','');setValSafe('cNote','');window.__careSelectedType='feed';window.__careFormIsCopy=false;window.__milkFeedSourcesKeep=false;resetMilkFeedSourcesState();if(typeof abReset==='function')abReset();selectCareType('feed');syncCareFormTitle();byId('careEditBadge').classList.add('hidden')}
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
      item.milkSources=sources;item.extra.milkSources=sources;item.milkBagId=sources[0].bagId;
      var wasteMl=Number((byId('cFeedWasteMl')&&byId('cFeedWasteMl').value)||0);
      if(!isFinite(wasteMl)||wasteMl<0)wasteMl=0;
      if(wasteMl>total)wasteMl=total;
      item.extra.takenMl=total;item.wasteMl=wasteMl;item.amount=Math.max(0,total-wasteMl);
    }else if(item.source!=='direct'&&item.amount<=0){showToast('Vui lòng nhập số ml bé bú','warn');return null}
  }
  if(type==='pump'){item.unit='ml';item.source='pump';item.extra.containerId=(byId('cContainerId')&&byId('cContainerId').value)||'';if(!item.extra.containerId){showToast('Vui lòng chọn bình hoặc túi đựng sữa','warn');return null}item.extra.side=(byId('cPumpSide')&&byId('cPumpSide').value)||'';item.storage=(byId('cStorage')&&byId('cStorage').value)||'';if(!item.storage){showToast('Vui lòng chọn vị trí bảo quản','warn');return null}item.status='Đang bảo quản';if(byId('cStatus'))byId('cStatus').value='Đang bảo quản';item.extra.expireDate=(byId('cExpireDate')&&byId('cExpireDate').value)||milkExpireDateTimeFor(item.storage);if(item.amount<=0){showToast('Vui lòng nhập số ml hút sữa','warn');return null}}
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
      item.extra.milkBagSnapshots.push({id:bag.id,amount:Number(bag.amount||0),used:used,discarded:discard,remainderAction:action,discardReason:src.discardReason||'',remainingBefore:beforeRemaining,remainingAfter:Number(bag.remaining||0),statusAfter:bag.status,storage:bag.storage||'',expireDateTime:bag.expireDateTime||bag.expireDate||'',note:bag.note||''});
    });
    item.milkSources=sources;item.extra.milkSources=sources;
    item.extra.milkBagSnapshot=item.extra.milkBagSnapshots[0]||null;
  }
  if(item.type==='pump'){
    var linked=(old&&old.linkedBagId)||byId('careLinkedBagId').value;
    if(linked){var b=findMilkBag(db,linked);if(b){var used=Math.max(0,Number(b.amount||0)-Number(b.remaining||0));b.amount=Number(item.amount||0);b.remaining=Math.max(0,Number(item.amount||0)-used);b.status=b.remaining>0?item.status:'Đã sử dụng hết';b.storage=item.storage;b.expireDate=item.extra.expireDate||'';b.expireDateTime=item.extra.expireDate||'';b.date=item.date;b.startDate=item.startDate;b.endDate=item.endDate;b.timeFrom=item.timeFrom;b.timeTo=item.timeTo;b.note=item.note;var __mcId2=(item.extra&&item.extra.containerId)||'';if(__mcId2){var __mcC2=mcFind(db,__mcId2);b.containerId=__mcId2;b.containerKind=(__mcC2&&__mcC2.kind)||'';b.containerName=mcBagLabel(db,__mcId2,item.date,item.timeFrom)}b.updatedAt=new Date().toISOString();item.linkedBagId=b.id}}
    else{var id=uniqueMilkBagId(db,item.date);var __mcId=(item.extra&&item.extra.containerId)||'';var __mcC=mcFind(db,__mcId);db.milkInventory.unshift({id:id,shortId:id,containerId:__mcId,containerKind:(__mcC&&__mcC.kind)||'',containerName:__mcId?mcBagLabel(db,__mcId,item.date,item.timeFrom):'',pumpEventId:item.id,date:item.date,startDate:item.startDate,endDate:item.endDate,timeFrom:item.timeFrom,timeTo:item.timeTo,amount:Number(item.amount||0),remaining:Number(item.amount||0),status:item.status||'Đang bảo quản',storage:item.storage||'Ngăn mát',expireDate:item.extra.expireDate||'',expireDateTime:item.extra.expireDate||'',note:item.note||'',createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});item.linkedBagId=id}
  }
  return true;
}
function saveCareEvent(){
  var db=load(),idx=byId('careEditIndex').value,old=null;
  var __udBefore=JSON.stringify(db); /* V13.2.0: snapshot trước khi sửa, dùng cho Undo nếu là bản ghi MỚI */
  var item=getCareEventFromForm(db);if(!item)return;
  var now=new Date().toISOString();
  if(idx!==''&&db.careEvents[Number(idx)]){old=JSON.parse(JSON.stringify(db.careEvents[Number(idx)]));item.id=old.id||newCareId('CE');item.createdAt=old.createdAt||now;releaseCareInventory(db,old);if(!applyCareInventory(db,item,old)){if(old)applyCareInventory(db,old,null);return}db.careEvents[Number(idx)]=item;showToast('Cập nhật chăm sóc thành công','success')}
  else{item.id=newCareId('CE');item.createdAt=now;if(!applyCareInventory(db,item,null))return;db.careEvents.unshift(item);showToast('Thêm ghi nhận thành công','success')}
  var wasEdit=!!old;var returnCtx=window.__careFormReturnContext?Object.assign({},window.__careFormReturnContext):null;save(db);if(!wasEdit)udShow('Đã ghi nhận '+careTypeMeta(item.type).label+'.',__udBefore);resetCareForm();if(window.__careFormModalOpen){closeCareFormModal(false);render();if(returnCtx){window.__careFormReturnContext=null;setTimeout(function(){renderCareStatDetail(returnCtx.type,returnCtx.date);if(!wasEdit)showToast('Đã thêm 1 ghi nhận mới','success')},40)}}else showPage('careTimeline')
}
function editCareEvent(i){openCareFormModal('feed',Number(i))}
function copyCareEvent(i){var x=load().careEvents[i];if(!x)return;editCareEvent(i);setValSafe('careEditIndex','');setValSafe('careLinkedBagId','');window.__careFormIsCopy=true;syncCareFormTitle();byId('careEditBadge').classList.add('hidden');showToast('Đã sao chép, bấm Lưu để tạo dòng mới','success')}
function deleteCareEvent(i){if(!confirm('Xóa ghi nhận chăm sóc này?'))return;var db=load(),old=db.careEvents[i];if(!old){showToast('Không tìm thấy dữ liệu','error');return}var __udBefore=JSON.stringify(db);if(old.type==='transfer'){if(!tfReleaseTransfer(db,old))return;db.careEvents.splice(i,1);save(db);udShow('Đã xóa giao dịch chuyển sữa.',__udBefore);showToast('Xóa ghi nhận thành công','success');return}if(old.type==='pump'&&old.linkedBagId){var bag=findMilkBag(db,old.linkedBagId);if(bag&&Number(bag.remaining)!==Number(bag.amount)){showToast('Không thể xóa lần hút sữa vì túi sữa đã được sử dụng một phần','warn');return}db.milkInventory=(db.milkInventory||[]).filter(function(b){return b.id!==old.linkedBagId})}else{releaseCareInventory(db,old)}db.careEvents.splice(i,1);save(db);udShow('Đã xóa '+careTypeMeta(old.type).label+'.',__udBefore);showToast('Xóa ghi nhận thành công','success')}
function eventDateRangeLabel(x){var sd=x.startDate||x.date||'',ed=x.endDate||sd;var tf=x.timeFrom||'',tt=x.timeTo||'';if(x&&x.type==='sleep'&&!tt)return (sd?fmtDate(sd)+' ':'')+tf+' → Bé đang ngủ';if(ed&&sd&&ed!==sd)return fmtDate(sd)+' '+tf+' → '+fmtDate(ed)+' '+tt;return (timeRangeOf(x)||tf||'')}
function careEventText(x){var m=careTypeMeta(x.type),txt='';if(x.type==='feed'){txt=(x.source==='direct'?'Bú mẹ trực tiếp':x.source==='stored'?'Bú từ kho sữa':'Sữa công thức')+(x.amount?(' · '+x.amount+'ml'):'');if(x.source==='stored'){var srcs=bagSourcesFromEvent(x),count=srcs.length,bagDiscard=srcs.reduce(function(t,s){return t+Number(s.discardMl||0)},0);var taken=Number((x.extra&&x.extra.takenMl)||0)||srcs.reduce(function(t,s){return t+Number(s.usedMl||0)},0);txt+=' · '+count+' túi sữa';if(taken>0)txt+=' · lấy ra '+taken+'ml';if(Number(x.wasteMl||0)>0)txt+=' · bỏ '+x.wasteMl+'ml (bé không bú hết)';if(bagDiscard>0)txt+=' · hủy '+bagDiscard+'ml còn lại trong túi'}}else if(x.type==='pump')txt='Hút '+(x.amount||0)+'ml · '+(x.storage||'')+' · '+(x.status||'');else if(x.type==='sleep')txt=(x.timeTo?'Ngủ '+fmtMinutes(x.amount||0):'Bé đang ngủ');else if(x.type==='diaper'){var pee=diaperPeeCount(x),poop=diaperPoopCount(x);txt=(x.amount||1)+' tã · '+diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet')+' · tự tính: 💧 '+pee+' / 💩 '+poop}else if(x.type==='pee')txt=(x.amount||1)+' lần tè (dữ liệu cũ)';else if(x.type==='poop')txt=(x.amount||1)+' lần phân (dữ liệu cũ)'+((x.extra&&x.extra.color)?' · '+x.extra.color:'')+((x.extra&&x.extra.texture)?' · '+x.extra.texture:'');else if(x.type==='medicine')txt=((x.extra&&x.extra.name)||'Thuốc')+' · '+(x.amount||0)+' '+(x.unit||'');else if(x.type==='temperature')txt=(x.amount||0)+'°C · '+((x.extra&&x.extra.site)||'');else if(x.type==='spitup')txt=((x.extra&&x.extra.kind)||'Trớ')+' · '+((x.extra&&x.extra.level)||'Ít')+((x.extra&&x.extra.afterFeedMin)?' · sau bú '+x.extra.afterFeedMin+' phút':'');else if(x.type==='transfer'){var tx=x.extra||{};txt=(tx.fromName||'--')+' → '+(tx.toName||'--')+' · '+(x.amount||0)+'ml'+(tx.storage?' · '+tx.storage:'')+(tx.sourceEmptied?' · nguồn đã chuyển hết':'')}return txt}
function sortedCareEvents(db){return (db.careEvents||[]).map(function(x,i){var y=Object.assign({},x);y._idx=i;return y}).sort(function(a,b){return (((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare((a.startDate||a.date||'')+(a.timeFrom||'')))})}
function renderCareTimeline(db){var box=byId('careTimelineBox');if(!box)return;var arr=sortedCareEvents(db);var fd=byId('careFilterDate')&&byId('careFilterDate').value,ft=byId('careFilterType')&&byId('careFilterType').value;if(fd)arr=arr.filter(function(x){return (x.startDate||x.date)===fd || (x.type==='sleep'&&careOverlapMinutesOnDate(x,fd)>0)});if(ft&&ft!=='all')arr=arr.filter(function(x){return x.type===ft});if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có ghi nhận chăm sóc.</p></div>';return}var groups={};arr.forEach(function(x){var k=x.startDate||x.date||'Không rõ ngày';(groups[k]=groups[k]||[]).push(x)});box.innerHTML=Object.keys(groups).sort(function(a,b){return b.localeCompare(a)}).map(function(d){return '<div class="careDayGroup"><h3>'+weekdayName(d)+', '+fmtDate(d)+'</h3>'+groups[d].map(function(x){var m=careTypeMeta(x.type);return '<div class="careEvent"><div class="careEventIcon">'+m.icon+'</div><div class="careEventBody"><b>'+esc(m.label)+' · '+esc(eventDateRangeLabel(x))+'</b><div class="careEventMeta">'+esc(careEventText(x))+(x.note?'<br>'+esc(x.note):'')+'</div><div class="careEventActions">'+(x.type==='transfer'?'':'<button class="ghost" onclick="editCareEvent('+x._idx+')">Sửa</button><button class="secondary" onclick="copyCareEvent('+x._idx+')">Sao chép</button>')+'<button class="danger" onclick="deleteCareEvent('+x._idx+')">Xóa</button></div></div></div>'}).join('')+'</div>'}).join('')}
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

/* ===================== 🍼 V11.5.0 · Giao diện modal chi tiết chăm sóc ===================== */
function careDetailSortMode(){try{return localStorage.getItem('meYeuBeCareDetailSort_v1')==='oldest'?'oldest':'newest'}catch(e){return 'newest'}}
function careDetailSortLabel(){return careDetailSortMode()==='oldest'?'Cũ nhất':'Mới nhất'}
function applyCareDetailSort(arr){return careDetailSortMode()==='oldest'?arr.slice().reverse():arr}
function toggleCareDetailSort(){
  try{localStorage.setItem('meYeuBeCareDetailSort_v1',careDetailSortMode()==='oldest'?'newest':'oldest')}catch(e){}
  var type=(byId('careDetailTypeSelect')&&byId('careDetailTypeSelect').value)||window.__careStatsSelectedType||'feed';
  var date=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||today();
  renderCareStatDetail(type,date);
}
function openCareChartFromDetail(){
  var box=byId('careChartBox');closeCareDetailModal();
  if(!box)return;
  box.classList.remove('hidden');renderCareCharts(load());syncCareChartToggleState();
  setTimeout(function(){try{box.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}},150);
}
function openMilkStockFromDetail(date){renderCareStatDetail('milk',date||today())}
function careDetailCountTitle(type){return type==='milk'?'Tổng số bình / túi':'Tổng số lần'}
function careDetailCountValue(type,arr){return arr.length+(type==='milk'?' túi':' lần')}
function careFeedSourceMeta(x){
  var s=x&&x.source;
  if(s==='direct')return {key:'direct',badge:'Trực tiếp',title:'Bú mẹ trực tiếp',icon:'🤱',tone:'pink'};
  if(s==='formula')return {key:'formula',badge:'Sữa công thức',title:'Sữa công thức',icon:'🥄',tone:'amber'};
  return {key:'stored',badge:'Từ sữa đã hút',title:'Bú từ kho sữa đã hút',icon:'🍼',tone:'blue'};
}
/* V11.5.0: bỏ careNoteDotColor / careNoteChipOne / careNoteChipHtml — thẻ ghi chú có viền
   và chấm màu tự nhận theo tên màu đã được thay bằng dòng phụ gộp (tên bình in màu tím). */
function milkBagSnapshotFor(x,bagId){
  var snaps=(x&&x.extra&&Array.isArray(x.extra.milkBagSnapshots))?x.extra.milkBagSnapshots:[];
  for(var k=0;k<snaps.length;k++){if(snaps[k].id===bagId)return snaps[k]}
  return null;
}
/* V11.5.0: ghi chú túi sữa (vd "Bình tím mập") lấy từ kho sữa, fallback về snapshot lúc bú nếu túi đã bị xoá */
function milkBagNoteText(db,bagId,snap){
  var bag=findMilkBag(db,bagId);
  var note=(bag&&bag.note)||(snap&&snap.note)||'';
  return String(note||'').trim();
}
function careFeedBagNotes(db,x){
  if(!x||x.type!=='feed'||x.source!=='stored')return [];
  var srcs=bagSourcesFromEvent(x),out=[],seen={};
  srcs.forEach(function(s){
    var note=milkBagNoteText(db,s.bagId,milkBagSnapshotFor(x,s.bagId));
    if(note&&!seen[note]){seen[note]=true;out.push(note)}
  });
  return out;
}
function careNoteChipOne(label,text,bottle){
  var dot=careNoteDotColor(text);
  return '<div class="careRecNote'+(bottle?' bottle':'')+'"><small>'+label+'</small><b>'+esc(text)+'</b>'+(dot?'<i class="careRecNoteDot" style="background:'+dot+'"></i>':'')+'</div>';
}
function careNoteChipHtml(db,x){
  if(!x)return '';
  var html='',bagNotes=careFeedBagNotes(db,x);
  if(bagNotes.length)html+=careNoteChipOne('🍼 Ghi chú bình:',bagNotes.join(' · '),true);
  var own=String((x.note||'')).trim();
  if(own&&bagNotes.indexOf(own)<0){
    var bottle=(x.type==='feed'&&x.source&&x.source!=='direct'&&!bagNotes.length);
    html+=careNoteChipOne(bottle?'🍼 Ghi chú bình:':'📝 Ghi chú:',own,bottle);
  }
  return html;
}
function milkStatusAfterMeta(status,remain){
  if(status==='Đã chuyển hết')return {label:'Đã chuyển hết',cls:'done',ico:'🔄'};
  if(status==='Đã sử dụng hết')return {label:'Đã sử dụng hết',cls:'done',ico:'✓'};
  if(status==='Đã bỏ')return {label:'Đã bỏ',cls:'gone',ico:'✕'};
  if(Number(remain||0)>0)return {label:'Đang dùng',cls:'live',ico:'○'};
  return {label:status||'Đang bảo quản',cls:'live',ico:'○'};
}
/* V13.6.0 — Bình/túi chứa của một lần hút sữa, dùng cho chi tiết Hút sữa */
function pumpContainerInfo(db,x){
  if(!x||x.type!=='pump')return null;
  var bag=(x.linkedBagId&&typeof findMilkBag==='function')?findMilkBag(db,x.linkedBagId):null;
  var cid=(x.extra&&x.extra.containerId)||(bag&&bag.containerId)||'';
  var kind=(bag&&bag.containerKind)||'';
  var name=(bag&&bag.containerName)||'';
  if((!kind||!name)&&cid){var c=mcFind(db,cid);if(c){if(!kind)kind=c.kind||'';if(!name)name=mcBagLabel(db,cid,x.startDate||x.date,x.timeFrom)}}
  if(!cid&&!kind&&!name)return null;
  var hasKind=(kind==='binh'||kind==='tui');
  return {kind:kind,name:name,icon:hasKind?mcKindIcon(kind):'🧊',label:hasKind?mcKindLabel(kind):'Bình/Túi'};
}
function pumpContainerText(db,x){var pc=pumpContainerInfo(db,x);if(!pc)return '';return pc.icon+' '+pc.label+(pc.name?' · '+pc.name:'')}
function careRecordHeadline(db,x,type,date){
  var t=x.type,h={ico:careTypeMeta(x._derivedType||t).icon,tone:'pink',badge:'',title:careTypeMeta(t).label,sub:'',dupBadge:false};
  if(t==='feed'){
    var m=careFeedSourceMeta(x);h.ico=m.icon;h.tone=m.tone;h.badge=m.badge;h.title=m.title;
    /* V11.5.0: nhãn "Từ sữa đã hút"/"Trực tiếp"/"Sữa công thức" nói lại đúng ý của tiêu đề → không hiện */
    h.dupBadge=true;
    h.sub=Number(x.amount||0)>0?(x.amount+' ml'):'Không có số ml';h.strongSub=Number(x.amount||0)>0;
  }else if(t==='pump'){
    h.ico='🥛';h.tone='blue';h.badge=((x.extra&&x.extra.side)||'Hút sữa');h.title='Hút '+(x.amount||0)+' ml';
    h.container=pumpContainerInfo(db,x);
    h.sub=[(x.storage||''),(x.status||'')].filter(Boolean).join(' · ')||'--';
  }else if(t==='sleep'){
    var mn=careOverlapMinutesOnDate(x,date)||Number(x.amount||0);
    h.ico='😴';h.tone='blue';h.badge=x.timeTo?'Đã dậy':'Đang ngủ';
    h.title=x.timeTo?('Giấc ngủ '+fmtMinutes(mn)):'Bé đang ngủ';h.sub=eventDateRangeLabel(x)||'--';
  }else if(t==='diaper'){
    h.ico='🧷';h.tone='amber';h.badge=(x.amount||1)+' tã';
    h.title=diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet');
    h.sub='Đi tè '+diaperPeeCount(x)+' · Đi phân '+diaperPoopCount(x);
  }else if(t==='medicine'){
    h.ico='💊';h.tone='rose';h.badge=(x.amount||0)+' '+(x.unit||'');
    h.title=((x.extra&&x.extra.name)||'Thuốc / vitamin');h.sub='';
  }else if(t==='temperature'){
    h.ico='🌡️';h.tone='amber';h.badge=(x.amount||0)+(x.unit||'°C');
    h.title='Đo thân nhiệt';h.sub='Vị trí: '+((x.extra&&x.extra.site)||'--');
  }else if(t==='spitup'){
    h.ico='🤮';h.tone='rose';h.badge=((x.extra&&x.extra.level)||'Ít');
    h.title=((x.extra&&x.extra.kind)||'Trớ sữa');
    h.sub=(x.extra&&Number(x.extra.afterFeedMin)>=0)?('Sau bú '+Number(x.extra.afterFeedMin||0)+' phút'):'--';
  }else if(t==='pee'||t==='poop'){
    h.ico=careTypeMeta(t).icon;h.badge=(x.amount||1)+' lần';h.title=careTypeMeta(t).label+' (dữ liệu cũ)';
    h.sub=[(x.extra&&x.extra.color)||'',(x.extra&&x.extra.texture)||''].filter(Boolean).join(' · ')||'--';
  }
  if(x._derivedType){h.badge='+'+Number(x._derivedAmount||0)+' '+careTypeMeta(x._derivedType).label.toLowerCase();h.tone='blue'}
  return h;
}
function careRecordMetrics(db,x,type){
  var t=x.type,out=[];
  if(t==='feed'&&(x.source==='stored')){
    var srcs=bagSourcesFromEvent(x),snaps=(x.extra&&Array.isArray(x.extra.milkBagSnapshots))?x.extra.milkBagSnapshots:[];
    var taken=Number((x.extra&&x.extra.takenMl)||0)||srcs.reduce(function(t2,s){return t2+Number(s.usedMl||0)},0);
    var drank=Number(x.amount||0);
    var waste=Number(x.wasteMl||0)||Math.max(0,taken-drank);
    /* V11.5.0: cữ bú bình thường (lấy ra bao nhiêu bú hết bấy nhiêu) không cần bảng số liệu —
       số ml đã nằm ở dòng phụ, số còn lại nằm ở hàng túi sữa. Chỉ khi bé bú không hết
       mới hiện đủ 3 số để thấy phần chênh. */
    if(waste>0)out=[{label:'Lấy từ kho',value:taken+' ml'},{label:'Bé bú thực tế',value:drank+' ml'},{label:'Bỏ đi',value:waste+' ml',tone:'warn'}];
  }
  /* V11.5.0: Hút sữa / Ngủ / Thay tã / Uống thuốc / Thân nhiệt / Trớ sữa trước đây có bảng số liệu
     nhắc lại y nguyên tiêu đề + dòng phụ (vd tiêu đề "Hút 120 ml" rồi bảng lại ghi "Số lượng hút 120 ml").
     Dòng phụ gộp đã mang đủ thông tin nên bỏ bảng, chỉ Bé bú giữ lại cho ca bú không hết. */
  return out;
}
function careRecordBagRowsHtml(db,x,date){
  if(!x||x.type!=='feed'||x.source!=='stored')return '';
  var srcs=bagSourcesFromEvent(x);if(!srcs.length)return '';
  var snaps=(x.extra&&Array.isArray(x.extra.milkBagSnapshots))?x.extra.milkBagSnapshots:[];
  var waste=Number(x.wasteMl||0);
  return srcs.map(function(s,i){
    var snap=null;for(var k=0;k<snaps.length;k++){if(snaps[k].id===s.bagId){snap=snaps[k];break}}
    var bag=findMilkBag(db,s.bagId);
    var code=milkBagDisplayId(bag||snap||{id:s.bagId});
    var remain=snap?Number(snap.remainingAfter||0):(bag?Number(bag.remaining||0):0);
    var st=milkStatusAfterMeta((snap&&snap.statusAfter)||(bag&&bag.status)||'',remain);
    var drop=Number(s.discardMl||0);
    var tags='';
    if(drop>0)tags+='<span class="careBagWarn">hủy '+drop+' ml trong túi</span>';
    /* V11.5.0: ml còn lại gộp vào đây thay cho ô "Còn lại sau bú" trong bảng số liệu */
    var leftTxt=(waste>0||drop>0)?'':('còn <b>'+remain+' ml</b>');
    var bagNote=milkBagNoteText(db,s.bagId,snap);
    var noteTxt=(srcs.length>1&&bagNote)?'<span class="careBagNote">'+esc(bagNote)+'</span>':'';
    return '<button type="button" class="careBagRow" onclick="event.stopPropagation();openMilkStockFromDetail(\''+esc(date)+'\')">'+
      '<span class="careBagName">'+milkKindChipHtml(bag||snap||{})+'<b>'+esc(code)+'</b></span>'+noteTxt+
      '<span class="careBagStatus '+st.cls+'"><i></i>'+esc(st.label)+'</span>'+
      (leftTxt?'<span>'+leftTxt+'</span>':'')+
      tags+'<span class="careBagChev">›</span></button>';
  }).join('');
}
function careRecordCardHtml(db,x,type,date){
  var idx=x._idx,h=careRecordHeadline(db,x,type,date);
  var metrics=careRecordMetrics(db,x,type);
  var time=(x.timeFrom||'--:--');
  /* V11.5.0 · bố cục A: giờ | icon | tiêu đề + 1 dòng phụ gộp (nhãn · giá trị · tên bình).
     Bỏ nhãn phân loại trùng tiêu đề, bỏ hộp ghi chú có viền, bỏ emoji ở nhãn số liệu. */
  var seg=[];
  if(h.badge&&!h.dupBadge)seg.push('<span>'+esc(h.badge)+'</span>');
  if(h.container)seg.push('<span class="careRecBottle">'+esc(h.container.icon+' '+h.container.label+(h.container.name?' · '+h.container.name:''))+'</span>');
  if(h.sub&&h.sub!=='--')seg.push('<span class="careRecVal'+(h.strongSub?' careRecStrong':'')+'">'+esc(h.sub)+'</span>');
  careFeedBagNotes(db,x).forEach(function(n){seg.push('<span class="careRecBottle">'+esc(n)+'</span>')});
  var sub=seg.length?('<div class="careRecSub">'+seg.join('<b class="careRecDot">·</b>')+'</div>'):'';
  var own=String((x.note||'')).trim();
  var noteLine=(own&&careFeedBagNotes(db,x).indexOf(own)<0)?('<p class="careRecNoteLine">'+esc(own)+'</p>'):'';
  var panel='';
  if(metrics.length)panel+='<div class="careRecMetrics">'+metrics.map(function(c){return '<div class="careRecMetric"><small>'+esc(c.label)+'</small><b'+(c.tone==='warn'?' class="warn"':'')+'>'+esc(c.value)+'</b></div>'}).join('')+'</div>';
  var bags=careRecordBagRowsHtml(db,x,date);
  var extra=(panel||bags)?('<div class="careRecPanel">'+panel+bags+'</div>'):'';
  var dirtyCls=(x.type==='diaper'&&diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet')==='Tã bẩn')?' careRecDirty':'';
  return '<div class="careRecordCard'+dirtyCls+'">'+
    '<div class="careRecTop">'+
      '<span class="careRecTime">'+esc(time)+'</span>'+
      '<span class="careRecIco tone-'+h.tone+'">'+h.ico+'</span>'+
      '<div class="careRecBody"><b>'+esc(h.title)+'</b>'+sub+noteLine+'</div>'+
      '<button type="button" class="careRecChev" aria-label="Sửa bản ghi" onclick="editCareRecordFromDetail('+idx+',\''+esc(type)+'\',\''+esc(date)+'\')">›</button>'+
    '</div>'+extra+
  '</div>';
}
function careOverviewCells(db,type,date,arr){
  var n=arr.length;
  if(type==='feed'){
    var total=arr.reduce(function(t,x){return t+Number(x.amount||0)},0),d=0,s=0,f=0;
    arr.forEach(function(x){if(x.source==='direct')d++;else if(x.source==='formula')f++;else s++});
    return [{ico:'💧',tone:'pink',v:total+' ml',l:'Tổng lượng'},{ico:'🤱',tone:'rose',v:d+' lần',l:'Bú trực tiếp'},{ico:'🧊',tone:'amber',v:s+' lần',l:'Bú từ sữa đã hút'},{ico:'🥄',tone:'blue',v:f+' lần',l:'Sữa công thức'}];
  }
  if(type==='pump'){
    var ml=arr.reduce(function(t,x){return t+Number(x.amount||0)},0);
    var keep=(db.milkInventory||[]).filter(function(b){return b.date===date&&(b.status||'Đang bảo quản')==='Đang bảo quản'}).reduce(function(t,b){return t+Number(b.remaining||0)},0);
    var both=arr.filter(function(x){return ((x.extra&&x.extra.side)||'')==='Cả hai'}).length;
    return [{ico:'🥛',tone:'pink',v:ml+' ml',l:'Tổng hút'},{ico:'🔁',tone:'rose',v:n+' lần',l:'Số lần hút'},{ico:'🧊',tone:'blue',v:keep+' ml',l:'Còn bảo quản'},{ico:'🤲',tone:'amber',v:both+' lần',l:'Hút cả hai bên'}];
  }
  if(type==='milk'){
    /* V11.6.0: 4 ô theo bản thiết kế — dung tích còn lại · số túi · dự kiến dùng hết · sắp hết hạn */
    var rem=arr.reduce(function(t,b){return t+Number(b.remaining||0)},0);
    var soon=arr.filter(function(b){return (b.status||'Đang bảo quản')==='Đang bảo quản'&&(milkExpireAt(b)-Date.now())<24*3600000}).length;
    return [{ico:'💧',tone:'rose',v:rem+' ml',l:'Tổng dung tích'},{ico:'❄️',tone:'blue',v:milkKindCountText(arr),l:'Bình / Túi'},{ico:'📅',tone:'pink',v:milkStockDaysLeftText(db,arr,rem),l:'Dự kiến dùng hết'},{ico:'⚠️',tone:'amber',v:soon+' túi',l:'Sắp hết hạn'}];
  }
  if(type==='sleep'){
    var mins=arr.reduce(function(t,x){return t+careOverlapMinutesOnDate(x,date)},0);
    var longest=arr.reduce(function(m,x){return Math.max(m,careOverlapMinutesOnDate(x,date))},0);
    var open=arr.filter(function(x){return !x.timeTo}).length;
    return [{ico:'😴',tone:'blue',v:fmtMinutes(mins),l:'Tổng ngủ'},{ico:'🔁',tone:'pink',v:n+' giấc',l:'Số giấc'},{ico:'⏱️',tone:'rose',v:fmtMinutes(longest),l:'Giấc dài nhất'},{ico:'🌙',tone:'amber',v:open+' giấc',l:'Đang ngủ'}];
  }
  if(type==='diaper'){
    var tot=arr.reduce(function(t,x){return t+Number(x.amount||1)},0);
    var pee=arr.reduce(function(t,x){return t+diaperPeeCount(x)},0);
    var poop=arr.reduce(function(t,x){return t+diaperPoopCount(x)},0);
    return [{ico:'🧷',tone:'pink',v:tot+' tã',l:'Tổng số tã'},{ico:'🔁',tone:'rose',v:n+' lần',l:'Số lần thay'},{ico:'💧',tone:'blue',v:pee+' lần',l:'Đi tè'},{ico:'💩',tone:'amber',v:poop+' lần',l:'Đi phân'}];
  }
  if(type==='pee'||type==='poop'){
    var c=arr.reduce(function(t,x){return t+Number(x._derivedAmount||x.amount||1)},0),m=careTypeMeta(type);
    return [{ico:m.icon,tone:'pink',v:c+' lần',l:'Tổng '+m.label.toLowerCase()},{ico:'🔁',tone:'rose',v:n+' bản ghi',l:'Số bản ghi'}];
  }
  if(type==='medicine')return [{ico:'💊',tone:'pink',v:n+' lần',l:'Số lần uống'},{ico:'🕐',tone:'rose',v:(arr[0]&&arr[0].timeFrom)||'--',l:'Gần nhất'}];
  if(type==='temperature'){
    var vals=arr.map(function(x){return Number(x.amount||0)}).filter(function(v){return v>0});
    var mx=vals.length?Math.max.apply(null,vals):0;
    return [{ico:'🌡️',tone:'pink',v:(vals.length?vals[0]:'--')+'°C',l:'Mới nhất'},{ico:'📈',tone:'amber',v:(mx||'--')+'°C',l:'Cao nhất'},{ico:'🔁',tone:'rose',v:n+' lần',l:'Số lần đo'}];
  }
  if(type==='spitup')return [{ico:'🤮',tone:'pink',v:n+' lần',l:'Số lần trớ'},{ico:'🕐',tone:'rose',v:(arr[0]&&arr[0].timeFrom)||'--',l:'Gần nhất'}];
  return [{ico:careTypeMeta(type).icon,tone:'pink',v:n+' lần',l:'Số bản ghi'}];
}
function careDetailSummaryHtml(db,type,date,arr){
  var cells=careOverviewCells(db,type,date,arr);
  return '<div class="careOverviewCard"><div class="careOverviewHead"><span class="careOverviewIco">📊</span><b>'+(type==='milk'?'Tổng quan kho sữa':'Tổng quan')+'</b><button type="button" class="careOverviewStatBtn" onclick="openCareChartFromDetail()">Xem thống kê ›</button></div><div class="careOverviewGrid g'+cells.length+'">'+cells.map(function(c){return '<div class="careOverviewCell"><span class="careOvIco tone-'+c.tone+'">'+c.ico+'</span><b>'+esc(c.v)+'</b><small>'+esc(c.l)+'</small></div>'}).join('')+'</div></div>';
}
function careDetailHtml(db,x){var displayType=x._derivedType||x.type;var meta=careTypeMeta(displayType);var rows=[];rows.push('Thời gian: '+eventDateRangeLabel(x));
  if(x.type==='feed'){rows.push('Hình thức: '+(x.source==='direct'?'Bú mẹ trực tiếp':x.source==='stored'?'Bú từ kho sữa đã hút':'Sữa công thức'));if(x.source==='stored'){var taken=Number((x.extra&&x.extra.takenMl)||0)||bagSourcesFromEvent(x).reduce(function(t,s){return t+Number(s.usedMl||0)},0);rows.push('Số ml lấy từ kho: '+taken+'ml');if(Number(x.wasteMl||0)>0)rows.push('Số ml bỏ (bé không bú hết): '+x.wasteMl+'ml');rows.push('Số ml bé bú thực tế: '+(x.amount||0)+'ml');rows.push('Nguồn túi sữa: '+milkSourcesLabel(db,x));}else if(x.amount)rows.push('Số lượng: '+x.amount+'ml');}
  if(x.type==='pump'){rows.push('Số lượng hút: '+(x.amount||0)+'ml');var __pcTxt=pumpContainerText(db,x);if(__pcTxt)rows.push('Bình / Túi chứa: '+__pcTxt);rows.push('Bên hút: '+((x.extra&&x.extra.side)||'--'));rows.push('Bảo quản: '+(x.storage||'--'));rows.push('Trạng thái: '+(x.status||'--'));if(x.linkedBagId)rows.push('Mã túi sữa: '+x.linkedBagId);if(x.extra&&x.extra.expireDate)rows.push('HSD: '+fmtMilkExpire({expireDateTime:x.extra.expireDate,expireDate:x.extra.expireDate}));}
  if(x.type==='sleep'){rows.push(x.timeTo?'Tổng ngủ: '+fmtMinutes(x.amount||0):'Trạng thái: Bé đang ngủ');}
  if(x.type==='diaper'){var pee=diaperPeeCount(x),poop=diaperPoopCount(x);rows.push('Số tã: '+(x.amount||1));rows.push('Loại tã: '+diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet'));rows.push('Tự động cộng: đi tè +'+pee+' / đi phân +'+poop);if(x._derivedType==='pee')rows.push('Chi tiết đang xem: Đi tè +'+pee);if(x._derivedType==='poop')rows.push('Chi tiết đang xem: Đi phân +'+poop);}
  if(x.type==='pee'){rows.push('Số lần tè: '+(x.amount||1)+' (dữ liệu cũ)');}
  if(x.type==='poop'){rows.push('Số lần phân: '+(x.amount||1)+' (dữ liệu cũ)');if(x.extra&&x.extra.color)rows.push('Màu phân: '+x.extra.color);if(x.extra&&x.extra.texture)rows.push('Tính chất: '+x.extra.texture);}
  if(x.type==='medicine'){rows.push('Tên thuốc / vitamin: '+((x.extra&&x.extra.name)||'--'));rows.push('Liều lượng: '+(x.amount||0));rows.push('Đơn vị: '+(x.unit||'--'));}
  if(x.type==='temperature'){rows.push('Nhiệt độ: '+(x.amount||0)+(x.unit||'°C'));rows.push('Vị trí đo: '+((x.extra&&x.extra.site)||'--'));}
  if(x.type==='spitup'){rows.push('Mức độ: '+((x.extra&&x.extra.level)||'--'));rows.push('Dạng: '+((x.extra&&x.extra.kind)||'Trớ'));if(x.extra&&Number(x.extra.afterFeedMin)>=0)rows.push('Sau bú: '+Number(x.extra.afterFeedMin||0)+' phút');}
  return '<div class="careDetailItem"><b>'+esc(meta.icon+' '+meta.label)+' · '+esc(fmtDate(x.startDate||x.date))+'</b><small>'+rows.map(esc).join('<br>')+'</small>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'</div>';
}
function careTypeOptionsHtml(selected){var types=['feed','pump','milk','sleep','diaper','pee','poop','medicine','temperature','spitup'];return types.map(function(t){var m=careTypeMeta(t);var label=m.icon+' '+m.label+((t==='pee'||t==='poop')?' (tự tính từ Thay tã)':'');return '<option value="'+esc(t)+'" '+(selected===t?'selected':'')+'>'+esc(label)+'</option>'}).join('')}
function closeCareDetailModal(){closeMilkBagDetail();var o=byId('careDetailOverlay');if(o)o.classList.remove('show');document.body.classList.remove('careModalOpen');var y=window.__careModalScrollY||0;document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';if(y)window.scrollTo(0,y)}
function changeCareDetailFromModal(){var type=(byId('careDetailTypeSelect')&&byId('careDetailTypeSelect').value)||'feed';var date=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());renderCareStatDetail(type,date)}
function shiftCareDetailDay(delta){
  var type=(byId('careDetailTypeSelect')&&byId('careDetailTypeSelect').value)||window.__careStatsSelectedType||'feed';
  var cur=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());
  var d=new Date(cur+'T00:00:00');if(isNaN(d.getTime()))d=new Date();
  d.setDate(d.getDate()+Number(delta||0));
  var iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  if(byId('careStatsDate'))byId('careStatsDate').value=iso;
  renderCareStatDetail(type,iso);
}
/* Giữ tên cũ để không vỡ chỗ nào còn gọi shiftCareDetailWeek */
function shiftCareDetailWeek(delta){return shiftCareDetailDay(delta)}
function openCareEventFromDashboard(idx){
  var db=load(),x=(db.careEvents||[])[Number(idx)];if(!x){showToast('Không tìm thấy bản ghi','error');return}
  var content='<div class="careModalSticky"><div class="careDetailModalHead"><div><h3>'+esc(careTypeDetailTitle(x.type))+'</h3><small>'+esc(weekdayName(x.startDate||x.date)+', '+fmtDate(x.startDate||x.date))+'</small></div><button class="careModalClose" onclick="closeCareDetailModal()">✕</button></div></div><div class="careDetailScroll">'+careDetailHtml(db,Object.assign({_idx:Number(idx)},x))+'<div class="btns"><button onclick="closeCareDetailModal();editCareEvent('+Number(idx)+')">Sửa bản ghi</button><button class="danger" onclick="closeCareDetailModal();deleteCareEvent('+Number(idx)+')">Xóa</button></div></div>';
  var modal=byId('careDetailModalContent'),overlay=byId('careDetailOverlay');if(modal)modal.innerHTML=content;if(overlay){window.__careModalScrollY=window.scrollY||document.documentElement.scrollTop||0;document.body.style.top='-'+window.__careModalScrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';overlay.classList.add('show');document.body.classList.add('careModalOpen')}
}
function milkInventoryFilterConfig(){try{return JSON.parse(localStorage.getItem('meYeuBeMilkFilter_v1')||'{"storage":"all","status":"all"}')}catch(e){return {storage:'all',status:'all'}}}
function milkInventoryFilterCollapsed(){return localStorage.getItem('meYeuBeMilkFilterCollapsed_v1')==='1'}
function toggleMilkInventoryFilters(){localStorage.setItem('meYeuBeMilkFilterCollapsed_v1',milkInventoryFilterCollapsed()?'0':'1');var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||today();renderCareStatDetail('milk',d)}
function setMilkInventoryFilter(){var cfg={storage:(byId('milkStorageFilter')&&byId('milkStorageFilter').value)||'all',status:(byId('milkStatusFilter')&&byId('milkStatusFilter').value)||'all'};localStorage.setItem('meYeuBeMilkFilter_v1',JSON.stringify(cfg));renderCareStatDetail('milk',(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||today())}
/* V11.6.0: bộ lọc kho sữa rút gọn thành 2 chip trên một hàng */
function milkFilterChipHtml(id,label,current,opts){
  var on=current&&current!=='all';
  return '<label class="milkFilterChip'+(on?' on':'')+'"><span>'+esc(on?current:label)+'</span><i>⌄</i>'+
    '<select id="'+id+'" aria-label="'+esc(label)+'" onchange="setMilkInventoryFilter()">'+
    '<option value="all">'+esc(label)+': Tất cả</option>'+
    opts.map(function(x){return '<option value="'+esc(x)+'" '+(current===x?'selected':'')+'>'+esc(x)+'</option>'}).join('')+
    '</select></label>';
}
function renderCareStatDetail(type,date){
  var db=load();date=date||((byId('careStatsDate')&&byId('careStatsDate').value)||today());window.__careStatsSelectedType=type;renderCareStats(db,true);
  var allMilk=(db.milkInventory||[]).map(function(b,i){var y=Object.assign({},b);y._idx=i;return y}).sort(function(a,b){return String((b.date||b.startDate||'')+(b.timeFrom||'')).localeCompare(String((a.date||a.startDate||'')+(a.timeFrom||'')))});
  var milkCfg=milkInventoryFilterConfig(),arr=(type==='milk'?allMilk:careEventsForDate(db,date,type)),meta=careTypeMeta(type),filterHtml='';
  if(type==='milk'){arr=arr.filter(function(b){return (milkCfg.storage==='all'||b.storage===milkCfg.storage)&&(milkCfg.status==='all'||(b.status||'Đang bảo quản')===milkCfg.status)});filterHtml='<div class="milkFilterRow"><span class="milkFilterLbl">🔎 Bộ lọc</span>'+milkFilterChipHtml('milkStatusFilter','Trạng thái',milkCfg.status,['Đang bảo quản','Đã sử dụng hết','Đã bỏ'])+milkFilterChipHtml('milkStorageFilter','Vị trí',milkCfg.storage,['Nhiệt độ phòng','Túi giữ lạnh có đá','Ngăn mát','Ngăn đông','Tủ đông sâu'])+'</div>'}
  var listArr=applyCareDetailSort(arr);
  var body='';
  if(!arr.length)body='<div class="careEmptyBox"><span>🍃</span><b>Chưa có dữ liệu</b><small>Không có bản ghi nào phù hợp bộ lọc hiện tại.</small></div>';
  else if(type==='milk')body='<div class="careMilkList">'+listArr.map(function(b){return milkBagHtml(b,b._idx)}).join('')+'</div>';
  else body='<div class="careRecordList">'+listArr.map(function(x){return careDetailRecordHtml(db,x,type,date)}).join('')+'</div>';
  var summary=careDetailSummaryHtml(db,type,date,arr);
  var addLabel=type==='milk'?'Thêm hút sữa':'Thêm ghi nhận';
  var hint=type==='milk'?'Vuốt sang trái để Sửa, Chuyển hoặc Huỷ. Bấm vào để xem chi tiết.':'Vuốt sang trái trên từng bản ghi để Sửa hoặc Xóa.';
  var listTitle=type==='milk'?'Danh sách bình / túi':'Danh sách ghi nhận';
  var head='<div class="careDetailModalHead">'+
    '<span class="careHeadAvatar">'+meta.icon+'</span>'+
    '<div class="careDetailTitleRow"><h3 id="careDetailModalTitle">'+esc(meta.label)+'</h3><small>'+esc(careDetailCountValue(type,arr))+'</small><i class="careHeadTypeChev">⌄</i>'+
      '<select id="careDetailTypeSelect" class="careHeadTypeSelect" aria-label="Đổi loại chăm sóc" onchange="changeCareDetailFromModal()">'+careTypeOptionsHtml(type)+'</select></div>'+
    '<div class="careDetailHeadActions"><button type="button" class="careModalClose" onclick="closeCareDetailModal()">✕</button></div></div>';
  var dateCard='<div class="carePickCard"><span class="carePickIco tone-pink">📅</span><span class="carePickBody"><small>Ngày</small><b>'+esc(fmtDate(date))+'</b></span><span class="carePickChev">›</span>'+
      '<input id="careDetailDateSelect" type="date" value="'+esc(date)+'" aria-label="Chọn ngày" onchange="changeCareDetailFromModal()"></div>';
  var dateCell=(type==='milk')?dateCard:
    '<div class="careDateNav">'+
      '<button type="button" class="careWeekNav" onclick="shiftCareDetailDay(-1)" aria-label="Ngày trước" title="Ngày trước">‹</button>'+
      dateCard+
      '<button type="button" class="careWeekNav" onclick="shiftCareDetailDay(1)" aria-label="Ngày sau" title="Ngày sau">›</button>'+
    '</div>';
  var picker='<div class="careDetailPicker">'+
    dateCell+
    '<button type="button" class="carePickCard carePickStat" onclick="openCareChartFromDetail()"><span class="carePickIco tone-rose">🕐</span><span class="carePickBody"><small>'+esc(careDetailCountTitle(type))+'</small><b>'+esc(careDetailCountValue(type,arr))+'</b></span><span class="carePickChev">›</span></button></div>';
  var listHead='<div class="careListHead"><b>'+esc(listTitle)+'</b><button type="button" class="careSortBtn" onclick="toggleCareDetailSort()">Sắp xếp: '+esc(careDetailSortLabel())+' ⌄</button></div>';
  var footer='<div class="careDetailFooter"><button type="button" class="careAddBigBtn" onclick="openCareAddFromDetail(\''+esc(type)+'\',\''+esc(date)+'\')"><span>＋</span> '+esc(addLabel)+'</button><p class="careFooterHint">💡 '+esc(hint)+'</p></div>';
  var content='<div class="careModalSticky">'+head+picker+filterHtml+'</div><div class="careDetailScroll">'+summary+listHead+body+'</div>'+footer;
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
/* ============================================================
   V13.9.0 · Nâng cấp giao diện Biểu đồ (Chart UX) — khu Chăm sóc
   Giữ nguyên toàn bộ hàm dữ liệu cũ: careChartRange, careChartDataForType,
   careChartMetric, careChartUnit, careTypeMeta, careEventsForDate,
   careAggValue, getDashboardConfig, careGoalDef, goalUnitFor...
   Chỉ thay TẦNG RENDER. Không đụng logic dữ liệu.
   ============================================================ */
window.CCX = window.CCX || {style:{}, compare:{}, series:{}, type:'feed', _init:false, _tipT:null};

var CCX_TYPES=['feed','pump','milk','sleep','diaper','pee','poop','medicine','temperature','spitup'];
var CCX_COLORS={feed:'#ec6f9e',sleep:'#9b7fe0',diaper:'#5b9be6',pee:'#4ec3d6',poop:'#a97b5d',pump:'#b9b0b6',milk:'#6fcbe8',medicine:'#e8546a',temperature:'#f0913e',spitup:'#c98fb4'};
function ccxColor(t){return CCX_COLORS[t]||'#e78aa3';}
function ccxNum(v){var n=Number(v);return isFinite(n)?n:0;}
/* Định dạng an toàn: smartNum() gốc cắt nhầm số 0 ở cuối khi làm tròn 0 chữ số (400 -> "4"). */
function ccxFmt(v,dec){v=Number(v);if(!isFinite(v))v=0;if(!dec){return String(Math.round(v));}var s=v.toFixed(dec);return s.replace(/\.?0+$/,'');}
function ccxStyle(t){var s=window.CCX.style[t];if(s)return s;return (careChartUnit(t)==='°C')?'line':'bar';}
function ccxModeLabel(m){return m==='week'?'Theo tuần':(m==='month'?'Theo tháng':'Theo ngày');}
function ccxPP(m){return m==='month'?32:(m==='week'?44:46);}
function ccxHeight(m){return m==='month'?300:(m==='week'?280:262);}

function ccxInit(){
  if(window.CCX._init)return;window.CCX._init=true;
  document.addEventListener('click',function(e){
    var t=e.target;var inHit=false,inBtn=false;
    while(t&&t!==document){if(t.className&&(''+t.className).indexOf('ccxHit')>-1)inHit=true;if(t.getAttribute&&t.getAttribute('data-ccxpop'))inBtn=true;t=t.parentNode;}
    if(!inHit)ccxHideTip();
    if(!inBtn){var pops=document.querySelectorAll('.ccxPop.show');for(var i=0;i<pops.length;i++)pops[i].classList.remove('show');}
  },true);
}

/* ---------- Goal (mục 10) ---------- */
function ccxGoal(db,type){
  var keyMap={feed:'feed',pump:'pump',sleep:'sleep',diaper:'diaper',pee:'pee',poop:'poop',medicine:'medicine',temperature:'temperature',milk:'storedMilk'};
  var key=keyMap[type];if(!key)return null;
  var cfg=getDashboardConfig(db);var g=(cfg.careGoals||{})[key];var def=careGoalDef(key);
  if(!g||!g.enabled||!def||!Number(g.target))return null;
  var mode=g.mode||def.defaultMode;var gunit=goalUnitFor(def,mode);var cunit=careChartUnit(type);
  var countUnits={'lần':1,'tã':1,'túi':1,'cữ':1,'mục':1};
  var ok=false;
  if(cunit==='ml'&&gunit==='ml')ok=true;
  else if(cunit==='giờ'&&gunit==='giờ')ok=true;
  else if(cunit!=='°C'&&countUnits[cunit]&&countUnits[gunit])ok=true;
  if(!ok)return null;
  return {target:Number(g.target)};
}

/* ---------- Series + meta (mục 3 tooltip) ---------- */
function ccxSeries(db,type,range){
  var pts=careChartDataForType(db,type,range);
  var out=[],i;
  for(i=0;i<pts.length;i++)out.push({v:ccxNum(pts[i].value),label:pts[i].label,short:pts[i].short,meta:null});
  if(range.mode==='day'){
    var arr=careEventsForDate(db,range.base,type);
    for(i=0;i<arr.length&&i<out.length;i++){
      var x=arr[i],kind='';
      if(type==='feed')kind=(x.source==='direct')?'Bú mẹ':(x.source==='stored'?'Từ kho sữa':'Sữa công thức');
      else if(type==='pump')kind=(x.storage||'');
      out[i].meta={kind:kind,time:(x.timeFrom||'')};
    }
    out.reverse();
    for(i=0;i<out.length;i++)if(out[i].meta)out[i].meta.idx=i+1;
  }
  return out;
}
function ccxStats(vals){var n=vals.length;if(!n)return{total:0,avg:0,max:0,min:0,n:0};var total=0,max=-Infinity,min=Infinity,i,v;for(i=0;i<n;i++){v=vals[i];total+=v;if(v>max)max=v;if(v<min)min=v;}return{total:total,avg:total/n,max:max,min:min,n:n};}

function ccxPrevRange(range){
  if(range.mode==='day'){var d=addDaysISO(range.base,-1);return{mode:'day',base:d,month:isoMonth(d),days:[d]};}
  if(range.mode==='week'){var s=addDaysISO(range.days[0],-7),days=[],i;for(i=0;i<7;i++)days.push(addDaysISO(s,i));return{mode:'week',base:s,month:isoMonth(s),days:days};}
  var lastPrev=addDaysISO(range.days[0],-1),pm=isoMonth(lastPrev),first=pm+'-01',last=lastDayOfMonthISO(pm),n=daysBetween(first,last),arr=[],j;for(j=0;j<=n;j++)arr.push(addDaysISO(first,j));return{mode:'month',base:first,month:pm,days:arr};
}
function ccxTotal(db,type,range){var s=ccxSeries(db,type,range),st=ccxStats(s.map(function(p){return p.v;}));return type==='temperature'?st.avg:st.total;}
function ccxTrend(db,type,range){var cur=ccxTotal(db,type,range),prev=ccxTotal(db,type,ccxPrevRange(range));if(!prev)return null;return Math.round((cur-prev)/prev*100);}
function ccxPrevVals(db,type,range){return ccxSeries(db,type,ccxPrevRange(range)).map(function(p){return p.v;});}

/* ---------- Insight tự động (mục 14) ---------- */
function ccxInsight(type,range,stats,delta){
  var unit=careChartUnit(type),per=range.mode==='day'?'hôm qua':(range.mode==='week'?'tuần trước':'tháng trước'),html='';
  if(delta!=null){
    var noun=type==='feed'?'Bé bú':'Chỉ số';
    html+='<p>'+(delta>=0?'📈':'📉')+' '+noun+' '+(delta>=0?'nhiều hơn':'ít hơn')+' <b>'+Math.abs(delta)+'%</b> so với '+per+'.</p>';
  }
  if(type==='feed')html+='<p>🍼 Cữ bú lớn nhất <b>'+ccxFmt(stats.max,0)+' '+unit+'</b>, trung bình <b>'+ccxFmt(stats.avg,0)+' '+unit+'/lần</b>.</p>';
  else if(type==='sleep')html+='<p>💤 Tổng thời gian ngủ <b>'+ccxFmt(stats.total,1)+' giờ</b>, giấc dài nhất khoảng <b>'+ccxFmt(stats.max,1)+' giờ</b>.</p>';
  else if(type==='pee')html+='<p>💧 Bé đi tè <b>'+ccxFmt(stats.total,0)+' lần</b> — theo dõi để đảm bảo bé đủ nước.</p>';
  else if(type==='diaper')html+='<p>🧷 Thay tã trung bình <b>'+ccxFmt(stats.avg,0)+' tã</b> mỗi '+(range.mode==='day'?'ngày':'kỳ')+'.</p>';
  else if(type==='pump'||type==='milk')html+='<p>🥛 Trung bình <b>'+ccxFmt(stats.avg,0)+' '+unit+'</b> mỗi mốc. Cân đối lịch hút để kho sữa luôn đủ dùng.</p>';
  else if(type==='temperature')html+='<p>🌡️ Thân nhiệt quanh mức <b>'+ccxFmt(stats.avg,1)+'°C</b> (cao nhất '+ccxFmt(stats.max,1)+'°C).</p>';
  else if(stats.n)html+='<p>📊 Cao nhất <b>'+ccxFmt(stats.max,0)+' '+unit+'</b>, trung bình <b>'+ccxFmt(stats.avg,1)+' '+unit+'</b>.</p>';
  if(!html)html='<p>Chưa đủ dữ liệu để đưa ra nhận định.</p>';
  return html;
}

/* ---------- Vẽ SVG (mục 1,3,5,6,7,8,10,11) ---------- */
function ccxBuildSvg(type,pts,o){
  var col=ccxColor(type),unit=careChartUnit(type),style=o.style,W=o.W,H=o.H,scope=o.scope||'',key=scope==='fs'?type+'@fs':type;
  var padL=36,padR=14,padT=18,padB=26,plotW=W-padL-padR,plotH=H-padT-padB;
  var vals=pts.map(function(p){return p.v;});
  var idSafe=(scope==='fs'?'fs':'in')+'-'+type;

  if(style==='donut')return ccxDonut(type,pts,o,col,unit,idSafe,key);

  var maxV=Math.max.apply(null,vals.concat([o.goal?o.goal.target:0,1]))*1.12;
  var minV=(unit==='°C')?Math.max(0,Math.min.apply(null,vals.concat([99]))-0.4):0;
  if(maxV<=minV)maxV=minV+1;
  function yOf(v){return padT+plotH-((v-minV)/(maxV-minV))*plotH;}
  function xOf(i){return pts.length<=1?padL+plotW/2:padL+(plotW/(pts.length-1))*i;}
  var s='<svg class="ccxSvg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">',g;
  for(g=0;g<=3;g++){var gy=padT+plotH*g/3;s+='<line class="ccxGrid" x1="'+padL+'" y1="'+gy.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+gy.toFixed(1)+'"/>';s+='<text class="ax" x="4" y="'+(gy+3).toFixed(1)+'" font-size="10">'+esc(ccxFmt(minV+(maxV-minV)*(1-g/3),1))+'</text>';}

  /* Goal line */
  if(o.goal){
    var gyv=yOf(o.goal.target);
    var over=o.mode==='day'?(ccxStats(vals).total>=o.goal.target):(ccxStats(vals).avg>=o.goal.target);
    var gc=over?'#4f9f73':'#b7a4ac';
    s+='<line x1="'+padL+'" y1="'+gyv.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+gyv.toFixed(1)+'" stroke="'+gc+'" stroke-width="1.5" stroke-dasharray="5 5"/>';
    s+='<text x="'+(W-padR)+'" y="'+(gyv-5).toFixed(1)+'" text-anchor="end" font-size="10" font-weight="800" fill="'+gc+'">Goal '+esc(ccxFmt(o.goal.target,0))+unit+'</text>';
  }

  if(style==='bar'){
    var bw=Math.min(ccxPP(o.mode)*0.5,30),i;
    for(i=0;i<pts.length;i++){
      var x=xOf(i)-bw/2,y=yOf(pts[i].v),h=Math.max(1,padT+plotH-y);
      s+='<rect class="ccxBar ccxHit" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="6" fill="'+col+'" style="transform-box:fill-box;transform-origin:bottom;transform:scaleY(0)" onclick="ccxTip(event,\''+key+'\','+i+')"><title>'+esc(pts[i].label)+': '+esc(smartNum(pts[i].v,2))+' '+esc(unit)+'</title></rect>';
    }
  }else{
    var d='',i2;for(i2=0;i2<pts.length;i2++)d+=(i2?'L':'M')+xOf(i2).toFixed(1)+','+yOf(pts[i2].v).toFixed(1)+' ';
    if(style==='area'){
      var ad=d+'L'+xOf(pts.length-1).toFixed(1)+','+(padT+plotH)+' L'+xOf(0).toFixed(1)+','+(padT+plotH)+' Z';
      s+='<defs><linearGradient id="ccxg-'+idSafe+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".4"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>';
      s+='<path class="ccxArea" d="'+ad+'" fill="url(#ccxg-'+idSafe+')" style="opacity:0"/>';
    }
    s+='<path class="ccxLine" d="'+d+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    var i3;for(i3=0;i3<pts.length;i3++)s+='<circle class="ccxDot ccxHit" cx="'+xOf(i3).toFixed(1)+'" cy="'+yOf(pts[i3].v).toFixed(1)+'" r="4.5" fill="#fff" stroke="'+col+'" stroke-width="2.5" style="opacity:0" onclick="ccxTip(event,\''+key+'\','+i3+')"><title>'+esc(pts[i3].label)+': '+esc(smartNum(pts[i3].v,2))+' '+esc(unit)+'</title></circle>';
  }

  /* Compare kỳ trước (mục 11) */
  if(o.cmp&&o.cmp.length){
    var cd='',ci,m=Math.min(o.cmp.length,pts.length);for(ci=0;ci<m;ci++)cd+=(ci?'L':'M')+xOf(ci).toFixed(1)+','+yOf(o.cmp[ci]).toFixed(1)+' ';
    s+='<path d="'+cd+'" fill="none" stroke="#c3b2ba" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"/>';
    for(ci=0;ci<m;ci++)s+='<circle cx="'+xOf(ci).toFixed(1)+'" cy="'+yOf(o.cmp[ci]).toFixed(1)+'" r="3.2" fill="#c3b2ba"/>';
  }

  var li;for(li=0;li<pts.length;li++){if(pts.length>10&&li%2)continue;s+='<text class="ax" x="'+xOf(li).toFixed(1)+'" y="'+(H-7)+'" text-anchor="middle" font-size="10">'+esc(pts[li].short||pts[li].label)+'</text>';}
  s+='</svg>';
  return s;
}

function ccxDonut(type,pts,o,col,unit,idSafe,key){
  var W=o.W,H=o.H,cx=W/2,cy=H/2,rad=Math.min(W,H)/2-24,thick=rad*0.42;
  var names=['Sáng','Trưa','Chiều','Tối'],buckets={Sáng:0,Trưa:0,Chiều:0,Tối:0},i;
  for(i=0;i<pts.length;i++){
    var b;var tm=pts[i].meta&&pts[i].meta.time;
    if(tm){var hh=parseInt((''+tm).slice(0,2),10)||0;b=hh<11?'Sáng':(hh<14?'Trưa':(hh<18?'Chiều':'Tối'));}
    else b=names[i%4];
    buckets[b]+=pts[i].v;
  }
  var cols={'Sáng':'#f6bfd0','Trưa':col,'Chiều':'#c98fb4','Tối':'#8a5b78'};
  var tot=0;for(i=0;i<names.length;i++)tot+=buckets[names[i]];if(!tot)tot=1;
  var s='<svg class="ccxSvg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">',acc=0;
  for(i=0;i<names.length;i++){
    var v=buckets[names[i]],frac=v/tot,dash=2*Math.PI*rad,off=dash*(1-frac),rot=acc*360-90;acc+=frac;
    s+='<circle class="ccxDon" cx="'+cx+'" cy="'+cy+'" r="'+rad.toFixed(1)+'" fill="none" stroke="'+cols[names[i]]+'" stroke-width="'+thick.toFixed(1)+'" stroke-dasharray="'+dash.toFixed(1)+'" stroke-dashoffset="'+dash.toFixed(1)+'" data-target="'+off.toFixed(1)+'" transform="rotate('+rot.toFixed(1)+' '+cx+' '+cy+')"><title>'+names[i]+': '+esc(ccxFmt(v,1))+' '+esc(unit)+'</title></circle>';
  }
  s+='<text x="'+cx+'" y="'+(cy-3)+'" text-anchor="middle" font-size="24" font-weight="900" fill="'+col+'">'+esc(ccxFmt(tot,0))+'</text>';
  s+='<text class="ax" x="'+cx+'" y="'+(cy+17)+'" text-anchor="middle" font-size="11">'+esc(unit)+' · phân bố</text>';
  var lx=14,ly=H-8,k;for(k=0;k<names.length;k++){s+='<rect x="'+(lx+k*(W-28)/4)+'" y="'+(ly-9)+'" width="9" height="9" rx="2" fill="'+cols[names[k]]+'"/><text class="ax" x="'+(lx+k*(W-28)/4+13)+'" y="'+(ly-1)+'" font-size="9.5">'+names[k]+'</text>';}
  s+='</svg>';return s;
}

function ccxAnimate(container){
  var svg=container.querySelector('svg');if(!svg)return;
  requestAnimationFrame(function(){
    var bars=svg.querySelectorAll('.ccxBar'),i;
    for(i=0;i<bars.length;i++){bars[i].style.transition='transform .55s cubic-bezier(.22,1,.36,1)';bars[i].style.transitionDelay=(i*0.04)+'s';bars[i].style.transform='scaleY(1)';}
    var line=svg.querySelector('.ccxLine');
    if(line&&line.getTotalLength){var len=line.getTotalLength();line.style.strokeDasharray=len;line.style.strokeDashoffset=len;line.getBoundingClientRect();line.style.transition='stroke-dashoffset 1s ease';line.style.strokeDashoffset='0';}
    var dots=svg.querySelectorAll('.ccxDot');for(i=0;i<dots.length;i++){dots[i].style.transition='opacity .3s';dots[i].style.transitionDelay=(0.45+i*0.05)+'s';dots[i].style.opacity='1';}
    var area=svg.querySelector('.ccxArea');if(area){area.style.transition='opacity .6s .3s';area.style.opacity='1';}
    var dons=svg.querySelectorAll('.ccxDon');for(i=0;i<dons.length;i++){dons[i].style.transition='stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)';dons[i].style.transitionDelay=(i*0.08)+'s';dons[i].style.strokeDashoffset=dons[i].getAttribute('data-target');}
  });
}

/* ---------- Tooltip (mục 3) ---------- */
function ccxTip(ev,key,i){
  if(ev&&ev.stopPropagation)ev.stopPropagation();
  var pts=window.CCX.series[key];if(!pts)return;var p=pts[i];if(!p)return;
  var base=key.split('@')[0],unit=careChartUnit(base),meta=careTypeMeta(base);
  var tip=byId('ccxTip');if(!tip){tip=document.createElement('div');tip.id='ccxTip';tip.className='ccxTip';document.body.appendChild(tip);}
  var html='<b>'+esc(p.label||p.short||'')+'</b><br>'+esc(smartNum(p.v,2))+' '+esc(unit);
  if(p.meta&&(p.meta.idx||p.meta.kind)){
    var line2=(p.meta.idx?('Lần '+meta.label.toLowerCase()+' thứ '+p.meta.idx):'')+((p.meta.idx&&p.meta.kind)?' · ':'')+(p.meta.kind||'');
    if(line2)html+='<br><span class="mut">'+esc(line2)+'</span>';
  }
  tip.innerHTML=html;
  var x=(ev.touches&&ev.touches[0])?ev.touches[0].clientX:ev.clientX;
  var y=(ev.touches&&ev.touches[0])?ev.touches[0].clientY:ev.clientY;
  if(x==null){var r=(ev.target.getBoundingClientRect?ev.target.getBoundingClientRect():{left:100,top:100,width:0});x=r.left+r.width/2;y=r.top;}
  tip.style.left=x+'px';tip.style.top=(y-14)+'px';tip.style.opacity='1';
  clearTimeout(window.CCX._tipT);window.CCX._tipT=setTimeout(ccxHideTip,2800);
}
function ccxHideTip(){var t=byId('ccxTip');if(t)t.style.opacity='0';}

/* ---------- Điều khiển ---------- */
function ccxSetMode(m){var sel=byId('careChartMode');if(sel)sel.value=m;if(typeof syncCareChartControls==='function')syncCareChartControls();renderCareCharts(load());}
function ccxSetStyle(type,style){window.CCX.style[type]=style;var pop=byId('ccxPop-'+type);if(pop)pop.classList.remove('show');ccxRenderOne(type);}
function ccxToggleCompare(type){window.CCX.compare[type]=!window.CCX.compare[type];ccxRenderOne(type);}
function ccxTogglePop(type,ev){if(ev&&ev.stopPropagation)ev.stopPropagation();var pop=byId('ccxPop-'+type);if(!pop)return;var open=pop.classList.contains('show');var all=document.querySelectorAll('.ccxPop.show');for(var i=0;i<all.length;i++)all[i].classList.remove('show');if(!open)pop.classList.add('show');}

/* ---------- Render 1 thẻ ---------- */
function ccxRenderOne(type){
  var db=load(),range=careChartRange(),pts=ccxSeries(db,type,range),meta=careTypeMeta(type),unit=careChartUnit(type),col=ccxColor(type);
  window.CCX.series[type]=pts;
  var head=byId('ccxHead-'+type),qs=byId('ccxQs-'+type),plot=byId('ccxPlot-'+type),leg=byId('ccxLeg-'+type),ins=byId('ccxIns-'+type),pop=byId('ccxPop-'+type);
  if(!head)return;
  document.documentElement.style.setProperty('--brand-live',col);

  if(!pts.length){
    head.innerHTML='<div class="ti"><div class="nm">'+esc(meta.icon+' '+meta.label)+'</div></div>';
    if(qs)qs.innerHTML='';if(leg)leg.innerHTML='';if(pop)pop.style.display='none';
    if(plot)plot.innerHTML='<div class="ccxEmpty"><div class="bg">'+esc(meta.icon)+'</div><b>Chưa có dữ liệu '+esc(meta.label.toLowerCase())+'</b><small>Hãy ghi nhận lần đầu tiên để xem biểu đồ.</small></div>';
    if(ins)ins.innerHTML='';
    return;
  }
  if(pop)pop.style.display='';

  var stats=ccxStats(pts.map(function(p){return p.v;}));
  var delta=ccxTrend(db,type,range);
  var goal=ccxGoal(db,type);
  var cmpOn=!!window.CCX.compare[type];
  var bigVal=(type==='temperature')?stats.avg:stats.total;
  var style=ccxStyle(type);

  var cntLbl=(type==='feed'&&range.mode==='day')?'cữ':(range.mode==='day'?'mốc':'ngày');
  var trCls=delta==null?'flat':(delta>=0?'up':'down');
  var trTxt=delta==null?'— chưa có kỳ trước':((delta>=0?'▲ +':'▼ ')+Math.abs(delta)+'% so với '+(range.mode==='day'?'hôm qua':range.mode==='week'?'tuần trước':'tháng trước'));

  head.innerHTML=''+
    '<div class="ti">'+
      '<div class="nm">'+esc(meta.icon+' '+meta.label)+'</div>'+
      '<div class="vl">'+esc(ccxFmt(bigVal,(unit==='°C'||unit==='giờ')?1:0))+'<small>'+esc(unit)+'</small></div>'+
      '<div class="sb"><b>'+pts.length+'</b> '+cntLbl+' · Trung bình <b>'+esc(ccxFmt(stats.avg,(unit==='ml'||unit==='lần'||unit==='tã')?0:1))+' '+esc(unit)+(type==='feed'?'/lần':'')+'</b></div>'+
      '<span class="ccxTrend '+trCls+'">'+esc(trTxt)+'</span>'+
    '</div>'+
    '<div class="ccxHBtns">'+
      '<button type="button" class="ccxIcon '+(cmpOn?'on':'')+'" title="So sánh kỳ trước" onclick="ccxToggleCompare(\''+type+'\')">⧉</button>'+
      '<button type="button" class="ccxIcon" data-ccxpop="1" title="Đổi loại biểu đồ" onclick="ccxTogglePop(\''+type+'\',event)">📊</button>'+
      '<button type="button" class="ccxIcon" title="Toàn màn hình" onclick="ccxFsOpen(\''+type+'\')">⛶</button>'+
    '</div>';

  if(pop){
    var opts=[['bar','Cột','▮'],['line','Đường','╱'],['area','Vùng','◣'],['donut','Donut','◕']],ph='',oi;
    for(oi=0;oi<opts.length;oi++)ph+='<button type="button" data-ccxpop="1" class="'+(style===opts[oi][0]?'on':'')+'" onclick="ccxSetStyle(\''+type+'\',\''+opts[oi][0]+'\')"><span class="rd"></span>'+opts[oi][2]+' '+opts[oi][1]+'</button>';
    pop.innerHTML=ph;
  }

  if(qs)qs.innerHTML='<div class="q"><small>Max</small><b>'+esc(ccxFmt(stats.max,1))+unit+'</b></div><div class="q"><small>TB</small><b>'+esc(ccxFmt(stats.avg,1))+unit+'</b></div><div class="q"><small>Min</small><b>'+esc(ccxFmt(stats.min,1))+unit+'</b></div>';

  var W=Math.max(pts.length*ccxPP(range.mode),(plot.clientWidth||320));var H=ccxHeight(range.mode);
  var cmp=cmpOn?ccxPrevVals(db,type,range):null;
  plot.innerHTML=ccxBuildSvg(type,pts,{style:style,goal:goal,cmp:cmp,W:W,H:H,scope:'',mode:range.mode});
  ccxAnimate(plot);

  if(leg)leg.innerHTML=cmpOn?('<span><i style="background:'+col+'"></i>'+(range.mode==='day'?'Hôm nay':range.mode==='week'?'Tuần này':'Tháng này')+'</span><span><i style="background:#c3b2ba"></i>'+(range.mode==='day'?'Hôm qua':range.mode==='week'?'Tuần trước':'Tháng trước')+'</span>'):'';

  if(ins)ins.innerHTML='<div class="ih">✨ NHẬN ĐỊNH TỰ ĐỘNG</div>'+ccxInsight(type,range,stats,delta);
}

/* ---------- Chọn loại dữ liệu bằng chip (V13.9.1) ---------- */
function ccxActiveType(){var t=window.CCX.type;return (CCX_TYPES.indexOf(t)>-1)?t:'feed';}

/* V13.9.2 · mục 2 — Đổi chip mà KHÔNG nhảy về đầu trang.
   Trước đây mỗi lần bấm chip là dựng lại toàn bộ #careChartsRender (kể cả hàng chip).
   Nút vừa bấm bị xoá khỏi DOM và chiều cao thẻ đổi theo từng loại dữ liệu, nên trình
   duyệt kẹp lại scrollTop -> văng lên trên cùng.
   Nay: hàng chip dựng đúng 1 lần, chỉ thay ruột thẻ biểu đồ, đồng thời khoá chiều cao
   trong lúc thay và khôi phục scrollY để mắt người dùng đứng yên tại chỗ. */
function ccxScrollEl(){return document.scrollingElement||document.documentElement||document.body;}
function ccxSwapHtml(host,html){
  if(!host){return}
  var se=ccxScrollEl(),y=(window.pageYOffset||se.scrollTop||0);
  var keepH=host.offsetHeight;
  if(keepH>0)host.style.minHeight=keepH+'px';
  host.innerHTML=html;
  if(se.scrollTop!==y)se.scrollTop=y;
  var release=function(){
    if(se.scrollTop!==y)se.scrollTop=y;
    host.style.minHeight='';
  };
  if(window.requestAnimationFrame)requestAnimationFrame(release);else setTimeout(release,0);
}
function ccxSetType(t){
  if(CCX_TYPES.indexOf(t)<0)return;
  if(window.CCX.type===t)return;
  var se=ccxScrollEl(),y=(window.pageYOffset||se.scrollTop||0);
  window.CCX.type=t;ccxHideTip();
  var pops=document.querySelectorAll('.ccxPop.show'),i;for(i=0;i<pops.length;i++)pops[i].classList.remove('show');
  ccxRenderAll(load());
  if(se.scrollTop!==y)se.scrollTop=y;
  if(window.requestAnimationFrame)requestAnimationFrame(function(){if(se.scrollTop!==y)se.scrollTop=y;});
}
function ccxSyncChips(){
  var wrap=byId('ccxChips');if(!wrap)return;
  var active=ccxActiveType(),btns=wrap.querySelectorAll('.ccxChip'),i,activeBtn=null;
  for(i=0;i<btns.length;i++){
    var t=btns[i].getAttribute('data-t'),on=(t===active);
    btns[i].classList.toggle('on',on);
    btns[i].style.background=on?ccxColor(t):'';
    btns[i].style.borderColor=on?'transparent':'';
    var dot=btns[i].querySelector('.ccxChipDot');if(dot)dot.style.background=on?'#fff':ccxColor(t);
    if(on)activeBtn=btns[i];
  }
  /* Chỉ cuộn hàng chip theo chiều NGANG, và chỉ khi chip đang chọn nằm ngoài tầm nhìn.
     Không dùng scrollIntoView vì hàm đó kéo cả trang theo chiều dọc. */
  if(activeBtn){
    var left=activeBtn.offsetLeft,right=left+activeBtn.offsetWidth;
    var vl=wrap.scrollLeft,vr=vl+wrap.clientWidth;
    if(left<vl+8||right>vr-8){
      var want=left-(wrap.clientWidth-activeBtn.offsetWidth)/2;
      wrap.scrollLeft=want>0?want:0;
    }
  }
}

/* ---------- Render: hàng chip + 1 biểu đồ đang chọn ---------- */
function ccxRenderAll(db){
  ccxInit();
  var target=byId('careChartsRender');if(!target)return;
  var range=careChartRange(),active=ccxActiveType(),i;
  var segBtns=document.querySelectorAll('#ccxSeg button');
  for(i=0;i<segBtns.length;i++)segBtns[i].classList.toggle('on',segBtns[i].getAttribute('data-p')===range.mode);
  var titleTxt=range.mode==='day'?('Theo ngày '+fmtDate(range.base)):(range.mode==='week'?('Theo tuần '+fmtDate(range.days[0])+' – '+fmtDate(range.days[6])):('Theo tháng '+range.month));

  var cardHtml='<div class="ccxCard" id="ccxCard-'+active+'">'+
      '<div class="ccxPop" id="ccxPop-'+active+'"></div>'+
      '<div class="ccxHead" id="ccxHead-'+active+'"></div>'+
      '<div class="ccxQs" id="ccxQs-'+active+'"></div>'+
      '<div class="ccxPlotWrap"><div class="ccxScroll" id="ccxPlot-'+active+'"></div><div class="ccxLegend" id="ccxLeg-'+active+'"></div></div>'+
      '<div class="ccxIns" id="ccxIns-'+active+'"></div>'+
    '</div>';

  /* Khung (hàng chip + dòng ghi chú + chỗ chứa thẻ) chỉ dựng 1 lần duy nhất. */
  if(!byId('ccxChips')||!byId('ccxCardHost')){
    var chips='<div class="ccxChips" id="ccxChips">';
    for(i=0;i<CCX_TYPES.length;i++){
      var t=CCX_TYPES[i],m=careTypeMeta(t);
      chips+='<button type="button" class="ccxChip" data-t="'+t+'" onclick="ccxSetType(\''+t+'\')">'+
        '<span class="ccxChipDot"></span>'+esc(m.icon+' '+m.label)+'</button>';
    }
    chips+='</div>';
    target.innerHTML=chips+
      '<p class="notice ccxRangeNote" id="ccxRangeNote">'+esc(titleTxt)+' · Chạm cột/điểm để xem chi tiết.</p>'+
      '<div id="ccxCardHost">'+cardHtml+'</div>';
  }else{
    var note=byId('ccxRangeNote');
    if(note)note.textContent=titleTxt+' · Chạm cột/điểm để xem chi tiết.';
    ccxSwapHtml(byId('ccxCardHost'),cardHtml);
  }

  ccxSyncChips();
  ccxRenderOne(active);
}

/* ---------- Fullscreen (mục 13) ---------- */
function ccxFsOpen(type){
  var range=careChartRange(),meta=careTypeMeta(type);
  var fs=byId('ccxFs');if(!fs){fs=document.createElement('div');fs.id='ccxFs';fs.className='ccxFs';document.body.appendChild(fs);}
  fs.innerHTML='<div class="ccxFsInner" id="ccxFsInner">'+
      '<div class="ccxFsBar">'+
        '<b>'+esc(meta.icon+' '+meta.label)+' · '+ccxModeLabel(range.mode)+'</b>'+
        '<span class="ccxFsBtns">'+
          '<button type="button" class="ccxIcon" title="Xoay ngang / dọc" onclick="ccxFsToggleRotate()">⟳</button>'+
          '<button type="button" class="ccxIcon" title="Đóng" onclick="ccxFsClose()">✕</button>'+
        '</span>'+
      '</div>'+
      '<div class="ccxFsPlot" id="ccxFsPlotBox"><div class="ccxScroll" id="ccxFsPlot"></div><div class="ccxLegend" id="ccxFsLeg" style="margin-top:10px"></div><div class="ccxHint">Chạm để xem chi tiết · vuốt ngang nếu nhiều dữ liệu</div></div>'+
    '</div>';
  fs.classList.add('show');document.body.classList.add('ccxFsOpen');
  window.CCX.fsType=type;
  window.CCX.fsRotUser=null;   /* null = để app tự quyết theo hướng máy */
  ccxFsTryNativeLandscape();
  ccxFsApplyRotation();
  ccxFsDraw(type);
}
/* V13.9.3 · mục 1 — Vào toàn màn hình là nằm ngang luôn, giống app xem chart tài chính.
   Hai tầng, tầng nào chạy được thì chạy:
   1. Chuẩn web: xin fullscreen thật rồi khoá hướng landscape. Android Chrome làm được,
      máy sẽ xoay vật lý; lúc đó khung nhìn thành ngang nên tầng 2 tự tắt.
   2. iOS Safari KHÔNG hỗ trợ khoá hướng (và không cho fullscreen thẻ div), nên khi khung
      nhìn còn dọc thì xoay chính lớp nội dung 90° bằng CSS, đảo chiều rộng/cao. Người
      dùng vẫn cầm máy dọc mà biểu đồ trải hết chiều dài màn hình.
   Nút ⟳ cho phép tự lật lại; xoay máy thật thì trả quyền về chế độ tự động. */
function ccxFsIsPortrait(){return window.innerHeight>window.innerWidth;}
function ccxFsTryNativeLandscape(){
  var el=byId('ccxFs');if(!el)return;
  try{
    var req=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
    if(!req)return;
    var p=req.call(el);
    if(p&&p.then)p.then(function(){
      try{
        if(window.screen&&screen.orientation&&screen.orientation.lock){
          var q=screen.orientation.lock('landscape');
          if(q&&q.catch)q.catch(function(){});
        }
      }catch(e){}
    },function(){});
  }catch(e){}
}
function ccxFsApplyRotation(){
  var fs=byId('ccxFs'),inner=byId('ccxFsInner');
  if(!fs||!inner)return;
  var auto=(!window.CCX||window.CCX.fsRotUser==null);
  var want=auto?ccxFsIsPortrait():!!window.CCX.fsRotUser;
  fs.classList.toggle('ccxRot',want);
  document.body.classList.toggle('ccxFsRot',want);
  if(want){
    /* Dùng innerWidth/innerHeight thay cho 100vw/100vh: trên iOS Safari 100vh tính cả
       thanh địa chỉ nên biểu đồ sẽ thò ra ngoài mép. */
    inner.style.width=window.innerHeight+'px';
    inner.style.height=window.innerWidth+'px';
  }else{
    inner.style.width='';inner.style.height='';
  }
}
function ccxFsToggleRotate(){
  if(!window.CCX)return;
  var auto=(window.CCX.fsRotUser==null);
  var cur=auto?ccxFsIsPortrait():!!window.CCX.fsRotUser;
  window.CCX.fsRotUser=!cur;
  ccxHideTip();
  ccxFsApplyRotation();
  ccxFsDraw(window.CCX.fsType);
}
/* V13.9.2 · mục 3 — Chiều cao biểu đồ toàn màn hình lấy đúng khoảng trống thật sự còn lại
   (đo #ccxFsPlotBox sau khi đã hiện), thay vì hằng số 460px cũ. Trừ hao đúng phần chú
   thích + dòng gợi ý nên vẽ kín màn hình mà không tràn viền. Xoay ngang máy thì vẽ lại. */
function ccxFsDraw(type){
  var fs=byId('ccxFs');if(!fs||!fs.classList.contains('show'))return;
  var db=load(),range=careChartRange();
  var box=byId('ccxFsPlotBox'),wrap=byId('ccxFsPlot'),leg=byId('ccxFsLeg');
  if(!wrap)return;
  var pts=ccxSeries(db,type,range);window.CCX.series[type+'@fs']=pts;
  var cmpOn=!!window.CCX.compare[type];
  if(leg)leg.innerHTML=cmpOn?('<span><i style="display:inline-block;width:14px;height:8px;border-radius:3px;background:'+ccxColor(type)+';margin-right:5px"></i>Hiện tại</span><span><i style="display:inline-block;width:14px;height:8px;border-radius:3px;background:#c3b2ba;margin-right:5px"></i>Kỳ trước</span>'):'';
  var avail=(box&&box.clientHeight)||(window.innerHeight-120);
  var legH=(leg&&leg.offsetHeight)?(leg.offsetHeight+10):0;   /* chú thích + margin-top */
  var hintH=30;                                              /* chừa chỗ cho dòng gợi ý dưới đáy */
  var H=Math.floor(avail-legH-hintH);
  if(H<260)H=260;
  var W=Math.max(pts.length*ccxPP(range.mode),(wrap.clientWidth||320));
  var goal=ccxGoal(db,type),cmp=cmpOn?ccxPrevVals(db,type,range):null;
  wrap.innerHTML=ccxBuildSvg(type,pts,{style:ccxStyle(type),goal:goal,cmp:cmp,W:W,H:H,scope:'fs',mode:range.mode});
  ccxAnimate(wrap);
}
function ccxFsRelayout(){
  var fs=byId('ccxFs');
  if(!fs||!fs.classList.contains('show'))return;
  var t=window.CCX&&window.CCX.fsType;if(!t)return;
  if(window.__ccxFsRz)clearTimeout(window.__ccxFsRz);
  window.__ccxFsRz=setTimeout(function(){ccxFsApplyRotation();ccxFsDraw(t)},160);
}
window.addEventListener('resize',ccxFsRelayout);
window.addEventListener('orientationchange',function(){
  if(window.CCX)window.CCX.fsRotUser=null;  /* xoay máy thật -> trả về chế độ tự động */
  ccxFsRelayout();
});
function ccxFsClose(){
  var fs=byId('ccxFs');if(fs){fs.classList.remove('show');fs.classList.remove('ccxRot');}
  var inner=byId('ccxFsInner');if(inner){inner.style.width='';inner.style.height='';}
  document.body.classList.remove('ccxFsOpen');
  document.body.classList.remove('ccxFsRot');
  if(window.CCX){window.CCX.fsType=null;window.CCX.fsRotUser=null;}
  ccxHideTip();
  try{
    if(window.screen&&screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();
    if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();
    else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();
  }catch(e){}
}

/* ---------- Shell (giữ tương thích careChartRange/mode/date) ---------- */
function renderCareCharts(db){
  var box=byId('careChartBox');if(!box)return;if(box.classList.contains('hidden'))return;
  if(!byId('careChartMode')){
    box.innerHTML='<div class="ccxWrap"><div class="ccxControls">'+
      '<div class="ccxSeg" id="ccxSeg">'+
        '<button type="button" data-p="day" onclick="ccxSetMode(\'day\')">Ngày</button>'+
        '<button type="button" data-p="week" onclick="ccxSetMode(\'week\')">Tuần</button>'+
        '<button type="button" data-p="month" onclick="ccxSetMode(\'month\')">Tháng</button>'+
      '</div>'+
      '<div id="careChartDateWrap"><input id="careChartDate" type="date" value="'+today()+'" onchange="renderCareCharts(load())"></div>'+
      '<div id="careChartMonthWrap" class="hiddenControl"><input id="careChartMonth" type="month" value="'+isoMonth(today())+'" onchange="renderCareCharts(load())"></div>'+
      '<select id="careChartMode" class="ccxHiddenSel" onchange="syncCareChartControls();renderCareCharts(load())"><option value="day">Theo ngày</option><option value="week">Theo tuần</option><option value="month">Theo tháng</option></select>'+
      '</div><div id="careChartsRender"></div></div>';
    if(typeof syncCareChartControls==='function')syncCareChartControls();
  }
  ccxRenderAll(db);
}

/* ===================== 🧊 V11.7.0 · Thẻ túi sữa trong Kho sữa (phương án B) ===================== */
/* Màu trong thẻ chỉ mang MỘT nghĩa: mức hạn dùng còn lại.
   🟢 ≥24h · 🟡 12–23h59 · 🟠 6–11h59 · 🔴 1–5h59 · ‼️ <1h · ⚫ quá hạn
   (cùng ngưỡng với milkUrgencyIcon để hai chỗ không lệch nhau).
   Phân biệt bình dựa vào chính tên bình người dùng gõ, không tô màu thêm. */
function milkUrgencyLevel(b){
  var diff=(milkExpireAt(b)-Date.now())/3600000;
  if(diff<=0)return 'dead';
  if(diff<1)return 'crit';
  if(diff<6)return 'hot';
  if(diff<12)return 'mid';
  if(diff<24)return 'warn';
  return 'ok';
}
/* Bản rút gọn của milkTimeLeftText để nhét vừa huy hiệu:
   sữa trữ đông có thể còn 179 ngày 10 giờ — quá dài cho một viên huy hiệu. */
function milkTimeLeftShort(b){
  var t=milkExpireAt(b);
  if(!isFinite(t)||t>8000000000000000)return 'Chưa có HSD';
  var diff=t-Date.now();
  if(diff<=0)return 'Đã quá hạn';
  var mins=Math.floor(diff/60000);
  if(mins<60)return 'Còn '+mins+' phút';
  var h=Math.floor(diff/3600000);
  if(h<24)return 'Còn '+h+' giờ';
  var d=Math.floor(h/24);
  if(d<30)return 'Còn '+d+' ngày';
  return 'Còn '+Math.floor(d/30)+' tháng';
}
/* Huy hiệu góc phải: túi còn dùng được thì hiện thời gian còn lại tô màu,
   túi đã đóng thì hiện trạng thái màu xám. "Đang bảo quản" là mặc định nên không in ra. */
function milkBagBadge(b){
  var st=(b&&b.status)||'Đang bảo quản';
  if(st==='Đã chuyển hết')return {cls:'dead',text:'Đã chuyển hết'};
  if(st==='Đã sử dụng hết')return {cls:'dead',text:'Đã dùng hết'};
  if(st==='Đã bỏ')return {cls:'dead',text:'Đã bỏ'};
  return {cls:milkUrgencyLevel(b),text:milkTimeLeftShort(b)};
}
function milkShortDT(dateISO,time){
  var d=String(dateISO||'').slice(0,10),p=d.split('-');
  var day=(p.length===3)?(Number(p[2])+'/'+Number(p[1])):(d||'--');
  return day+(time?(' '+String(time).slice(0,5)):'');
}
function milkCreatedShort(b){
  b=b||{};var raw=String(b.createdAt||b.createdDateTime||b.created||'');
  var d=(b.date||b.startDate||raw.slice(0,10)||''),t=(b.timeFrom||b.time||'');
  if(raw){var m=raw.match(/(?:T|\s)(\d{2}:\d{2})/);if(!t&&m)t=m[1]}
  return milkShortDT(d,t);
}
function milkExpireShort(b){
  var raw=String((b&&(b.expireDateTime||b.expireDate))||'');
  if(!raw)return '--';
  return milkShortDT(raw.slice(0,10),raw.indexOf('T')>-1?raw.slice(11,16):'');
}
/* Dự kiến dùng hết = lượng còn lại / lượng bú từ kho trung bình 7 ngày gần nhất */
function milkStockDaysLeftText(db,arr,rem){
  rem=Number(rem||0);
  if(rem<=0)return '0 ngày';
  var end=today(),start=addDaysISO(end,-6),used=0;
  (db&&db.careEvents||[]).forEach(function(x){
    if(!x||x.type!=='feed'||x.source!=='stored')return;
    var d=String(x.startDate||x.date||'').slice(0,10);
    if(d<start||d>end)return;
    used+=Number((x.extra&&x.extra.takenMl)||0)||bagSourcesFromEvent(x).reduce(function(t,sc){return t+Number(sc.usedMl||0)},0);
  });
  var perDay=used/7;
  if(perDay<=0)return '--';
  var days=rem/perDay;
  return days<1?'< 1 ngày':('~ '+Math.round(days)+' ngày');
}
/* V11.7.0: bỏ icon 💧 ❄️ 🕐 trong ô — nhãn chữ đã nói đủ. Bỏ ô "HSD còn lại" vì
   số giờ đã nằm ở huy hiệu góc phải. */
/* V13.5.0: bỏ ô "Dung tích" vì đã có ngay dòng ml phía trên, và bỏ ô "Vị trí"
   vì đã gộp vào dòng meta. Lưới chỉ còn dùng khi túi có ghi chú riêng. */
function milkBagCellsHtml(b){
  return b.note?('<div class="mbCell"><small>Ghi chú</small><b>'+esc(b.note)+'</b></div>'):'';
}
/* V11.7.0: bỏ icon 🗓 🍼 🕐; chỉ hiện "Hút" khi khác giờ tạo túi (thường hai giờ trùng nhau) */
function milkBagMetaHtml(b){
  var made=milkCreatedShort(b),pumped=milkShortDT(b.date,b.timeFrom);
  var html='<span>'+esc(b.storage||'--')+'</span><span>Tạo '+esc(made)+'</span>';
  if(pumped&&pumped!=='--'&&pumped!==made)html+='<span>Hút '+esc(pumped)+'</span>';
  return '<div class="mbMeta">'+html+'<span>HSD '+esc(milkExpireShort(b))+'</span></div>';
}
/* Dòng riêng cho loại dụng cụ + dung tích, thay cho việc nhét ml lên hàng tiêu đề */
function milkBagAmountRowHtml(b){
  return '<div class="mbAmtRow">'+milkKindChipHtml(b)+
    '<b>'+esc((b.remaining||0)+' / '+(b.amount||0)+' ml')+'</b></div>';
}
function milkBagHtml(b,idx){
  var isActive=(b.status||'Đang bảo quản')==='Đang bảo quản';
  var hi=Array.isArray(window.__milkAlertHighlightIds)&&window.__milkAlertHighlightIds.indexOf(String(b.id||b.shortId||''))>=0;
  var badge=milkBagBadge(b);
  var cls=((b.status==='Đã sử dụng hết'||b.status==='Đã chuyển hết')?'used finished ':'')+(milkExpireAt(b)<Date.now()?'expired ':'')+(isActive?'':'disabled ')+'u-'+badge.cls+(hi?' alertHighlight':'');
  var reason=(b.cancelReason||b.discardReason||'');
  var canTransfer=isActive&&Number(b.remaining||0)>0;
  var actions='<div class="milkSwipeActions">'+
    '<button type="button" class="milkSwipeEdit" onclick="event.stopPropagation();editMilkBagFromInventory('+idx+')"><i>✏️</i><span>Sửa</span></button>'+
    (canTransfer?'<button type="button" class="milkSwipeTransfer" onclick="event.stopPropagation();tfOpen('+idx+')"><i>🔄</i><span>Chuyển</span></button>':'')+
    (isActive?'<button type="button" class="milkSwipeCancel" onclick="event.stopPropagation();cancelMilkBag('+idx+')"><i>🗑</i><span>Huỷ túi</span></button>':'')+
    '</div>';
  return '<div class="milkSwipeShell'+(isActive?(canTransfer?' trio':''):' single')+'" data-milk-idx="'+idx+'" ontouchstart="milkSwipeStart(event,this)" ontouchmove="milkSwipeMove(event,this)" ontouchend="milkSwipeEnd(event,this)" onpointerdown="milkPointerStart(event,this)" onpointermove="milkPointerMove(event,this)" onpointerup="milkPointerEnd(event,this)" onpointercancel="milkPointerEnd(event,this)">'+actions+
    '<div class="milkBag '+cls+'" role="button" tabindex="0" onclick="openMilkBagDetail('+idx+')">'+
      '<div class="mbTop"><i class="mbDot"></i><b class="mbCode">'+esc(milkBagDisplayId(b))+'</b><span class="mbBadge">'+esc(badge.text)+'</span></div>'+
      milkBagAmountRowHtml(b)+
      milkBagMetaHtml(b)+
      (b.note?('<div class="mbGrid">'+milkBagCellsHtml(b)+'</div>'):'')+
      (reason?'<p class="mbReason">Lý do bỏ: '+esc(reason)+'</p>':'')+
      (typeof tfBagTraceHtml==='function'?tfBagTraceHtml(b):'')+
    '</div></div>';
}
/* --- Popup chi tiết 1 túi sữa (bấm vào thẻ túi) --- */
function milkDetailRow(label,value,cls){return value?('<div class="mbdRow'+(cls?' '+cls:'')+'"><small>'+esc(label)+'</small><b>'+esc(value)+'</b></div>'):''}
function openMilkBagDetail(idx){
  if(window.__milkSwipeLock)return;
  var opened=document.querySelector('.milkSwipeShell.open');
  if(opened){opened.classList.remove('open');return}
  var db=load(),b=(db.milkInventory||[])[Number(idx)];
  if(!b){showToast('Không tìm thấy túi sữa','error');return}
  var isActive=(b.status||'Đang bảo quản')==='Đang bảo quản';
  var badge=milkBagBadge(b),used=Math.max(0,Number(b.amount||0)-Number(b.remaining||0)-Number(b.discarded||0));
  var rows=milkDetailRow('Dung tích ban đầu',(b.amount||0)+' ml')+
    milkDetailRow('Còn lại',(b.remaining||0)+' ml')+
    milkDetailRow('Đã cho bé bú',used+' ml')+
    (Number(b.discarded||0)>0?milkDetailRow('Đã bỏ',b.discarded+' ml','warn'):'')+
    milkDetailRow('Vị trí bảo quản',b.storage||'--')+
    milkDetailRow('Trạng thái',b.status||'Đang bảo quản')+
    milkDetailRow('Thời điểm hút',milkCreatedText(b))+
    milkDetailRow('Hạn sử dụng',fmtMilkExpire(b)||'--')+
    milkDetailRow('HSD còn lại',milkTimeLeftText(b))+
    milkDetailRow('Ghi chú bình',b.note||'')+
    milkDetailRow('Lý do huỷ',b.cancelReason||b.discardReason||'','warn');
  var foot='<div class="mbdFoot"><button type="button" class="mbdEdit" onclick="closeMilkBagDetail();editMilkBagFromInventory('+Number(idx)+')">✏️ Sửa túi</button>'+
    (isActive?'<button type="button" class="mbdCancel" onclick="closeMilkBagDetail();cancelMilkBag('+Number(idx)+')">🗑 Huỷ túi</button>':'')+'</div>';
  var box=byId('milkBagDetailContent');
  if(box)box.innerHTML='<div class="mbdHead u-'+badge.cls+'"><i class="mbDot"></i><div class="mbdTitle"><b>'+esc(milkBagDisplayId(b))+'</b><small>'+esc((milkBagKindLabel(b)||'Kho sữa')+(b.note?(' · '+b.note):'')+' · '+(b.remaining||0)+'/'+(b.amount||0)+'ml')+'</small></div><span class="mbBadge">'+esc(badge.text)+'</span><button type="button" class="careModalClose" onclick="closeMilkBagDetail()">✕</button></div><div class="mbdBody">'+rows+'</div>'+foot;
  var ov=byId('milkBagDetailOverlay');if(ov)ov.classList.add('show');
}
function closeMilkBagDetail(){var ov=byId('milkBagDetailOverlay');if(ov)ov.classList.remove('show')}
function renderMilkInventory(db){var box=byId('milkInventoryBox');if(!box)return;var arr=(db.milkInventory||[]).map(function(b,i){var y=Object.assign({},b);y._idx=i;return y}).sort(function(a,b){var ar=(a.status==='Đang bảo quản'?0:(a.status==='Đã sử dụng hết'||a.status==='Đã chuyển hết')?1:2),br=(b.status==='Đang bảo quản'?0:(b.status==='Đã sử dụng hết'||b.status==='Đã chuyển hết')?1:2);return ar-br || milkExpireAt(a)-milkExpireAt(b)});if(!arr.length){box.innerHTML='<p class="notice">Chưa có kho sữa. Khi ghi nhận Hút sữa, app sẽ tự tạo túi sữa ở đây.</p>';return}box.innerHTML=arr.map(function(b){return milkBagHtml(b,b._idx)}).join('')}
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
function careDetailRecordHtml(db,x,type,date){
  var idx=x._idx;
  return '<div class="careTimelineRow"><span class="careTimelineRail"><i class="careTimelineDot"></i></span>'+
    '<div class="careRecordSwipe" data-care-idx="'+idx+'" ontouchstart="careRecordSwipeStart(event,this)" ontouchmove="careRecordSwipeMove(event,this)" ontouchend="careRecordSwipeEnd(event,this)" onpointerdown="careRecordPointerStart(event,this)" onpointermove="careRecordPointerMove(event,this)" onpointerup="careRecordPointerEnd(event,this)" onpointercancel="careRecordPointerEnd(event,this)">'+
      '<div class="careRecordActions"><button type="button" class="careRecordEdit" onclick="editCareRecordFromDetail('+idx+',\''+esc(type)+'\',\''+esc(date)+'\')">✏️ Sửa</button><button type="button" class="careRecordDelete" onclick="deleteCareRecordFromDetail('+idx+',\''+esc(type)+'\',\''+esc(date)+'\')">🗑 Xóa</button></div>'+
      careRecordCardHtml(db,x,type,date)+
    '</div></div>';
}
function closeOtherCareRecordSwipes(current){
  document.querySelectorAll('.careRecordSwipe.open').forEach(function(row){if(row!==current)row.classList.remove('open')});
}
function careRecordSwipeStart(e,el){
  var t=e.touches&&e.touches[0];if(!t)return;
  el.__sx=t.clientX;el.__sy=t.clientY;el.__swiping=false;el.__horizontal=false;
}
function careRecordSwipeMove(e,el){
  if(el.__sx==null)return;
  var t=e.touches&&e.touches[0];if(!t)return;
  var dx=t.clientX-el.__sx,dy=t.clientY-el.__sy;
  if(!el.__horizontal&&Math.abs(dx)>14){
    if(Math.abs(dx)<=Math.abs(dy)*1.25)return;
    el.__horizontal=true;
  }
  if(!el.__horizontal)return;
  el.__swiping=true;e.preventDefault();
  if(dx<=-42){closeOtherCareRecordSwipes(el);el.classList.add('open')}
  else if(dx>=32){el.classList.remove('open')}
}
function careRecordSwipeEnd(e,el){
  if(el.__swiping){window.__careRecordSwipeLock=true;setTimeout(function(){window.__careRecordSwipeLock=false},250)}
  el.__sx=null;el.__sy=null;el.__swiping=false;el.__horizontal=false;
}
function careRecordPointerStart(e,el){
  if(e.pointerType==='touch')return;
  el.__px=e.clientX;el.__py=e.clientY;el.__pdrag=false;el.__phorizontal=false;
}
function careRecordPointerMove(e,el){
  if(el.__px==null)return;
  var dx=e.clientX-el.__px,dy=e.clientY-el.__py;
  if(!el.__phorizontal&&Math.abs(dx)>14){
    if(Math.abs(dx)<=Math.abs(dy)*1.25)return;
    el.__phorizontal=true;
  }
  if(!el.__phorizontal)return;
  el.__pdrag=true;
  if(dx<=-42){closeOtherCareRecordSwipes(el);el.classList.add('open')}
  else if(dx>=32){el.classList.remove('open')}
}
function careRecordPointerEnd(e,el){
  el.__px=null;el.__py=null;el.__pdrag=false;el.__phorizontal=false;
}
function editCareRecordFromDetail(idx,type,date){
  if(window.__careRecordSwipeLock)return;
  document.querySelectorAll('.careRecordSwipe.open').forEach(function(el){el.classList.remove('open')});
  window.__careFormReturnContext=(type&&date)?{type:type,date:date}:null;
  closeCareDetailModal();
  editCareEvent(Number(idx));
}
function deleteCareRecordFromDetail(idx,type,date){
  if(window.__careRecordSwipeLock)return;
  deleteCareEvent(Number(idx));
  if(byId('careDetailOverlay')&&byId('careDetailOverlay').classList.contains('show'))renderCareStatDetail(type,date);
}
function cancelMilkBag(idx){var db=load();var bag=(db.milkInventory||[])[Number(idx)];if(!bag){showToast('Không tìm thấy túi sữa','error');return}if((bag.status||'Đang bảo quản')!=='Đang bảo quản'){showToast('Túi sữa này đã không còn khả dụng','warn');return}var reason=prompt('Nhập lý do huỷ túi sữa:');if(reason===null){document.querySelectorAll('.milkSwipeShell.open').forEach(function(el){el.classList.remove('open')});return}reason=String(reason||'').trim();if(!reason){showToast('Vui lòng nhập lý do huỷ túi','warn');return}var __udBefore=JSON.stringify(db);var now=new Date().toISOString();bag.cancelReason=reason;bag.discardReason=reason;bag.canceledAt=now;bag.discardedAt=now;bag.status='Đã bỏ';bag.discarded=Number(bag.discarded||0)+Number(bag.remaining||0);bag.remaining=0;bag.updatedAt=now;save(db);udShow('Đã huỷ túi sữa '+milkBagDisplayId(bag)+'.',__udBefore);showToast('Đã huỷ túi sữa '+milkBagDisplayId(bag),'success');render();if(byId('careDetailOverlay')&&byId('careDetailOverlay').classList.contains('show')&&window.__careStatsSelectedType==='milk'){var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());renderCareStatDetail('milk',d)}}
function openMilkInventoryAlert(ids){
  closeSmartAlertCenter();closeNotificationCenter();
  window.__milkAlertHighlightIds=(ids||[]).map(String);
  localStorage.setItem('meYeuBeMilkFilter_v1',JSON.stringify({storage:'all',status:'all'}));
  localStorage.setItem('meYeuBeMilkFilterCollapsed_v1','1');
  window.__careStatsSelectedType='milk';
  renderCareStatDetail('milk',today());
  setTimeout(function(){var el=document.querySelector('.milkBag.alertHighlight');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},180);
}
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
  {id:'alerts',label:'Trung tâm cảnh báo',icon:'⚠️',required:false,desc:'Smart Alert theo dữ liệu và cấu hình; có thể di chuyển vị trí'},
  {id:'growth',label:'Sự phát triển của bé',icon:'📈',required:false,desc:'Cân nặng, chiều dài, vòng đầu'},
  {id:'milestones',label:'Hành trình lớn khôn',icon:'🏆',required:false,desc:'Cột mốc đáng nhớ, tự động và thủ công'}
];
var DASHBOARD_REQUIRED=['babyInfo','appointment','todayCare','careJournal'];
var DEFAULT_DASH_ORDER=['babyInfo','appointment','todayCare','alerts','growth','milestones','careJournal'];
var BOTTOM_NAV_OPTIONS=[
  {id:'careTimeline',label:'Theo dõi',icon:'❤️'},
  {id:'careAdd',label:'Ghi nhận',icon:'＋'},
  {id:'scheduleCalendar',label:'Lịch',icon:'📅'},
  {id:'more',label:'Thêm',icon:'☰'},
  {id:'babyStats',label:'Phát triển',icon:'📈'},
  {id:'careStats',label:'Thống kê',icon:'📊'},
  {id:'healthBook2',label:'Sức khỏe',icon:'🩺'},
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
  {id:'medicine',label:'Uống thuốc',icon:'💊',modes:[{id:'count',label:'Theo lần',unit:'lần'}],defaultMode:'count'},
  {id:'temperature',label:'Thân nhiệt',icon:'🌡️',modes:[{id:'count',label:'Theo lần đo',unit:'lần'}],defaultMode:'count'},
  {id:'schedule',label:'Lịch hôm nay/mai',icon:'📅',modes:[{id:'count',label:'Theo mục',unit:'mục'}],defaultMode:'count'}
];
var CARE_METRIC_DEFS=[
  {id:'feed',label:'Bé bú',icon:'🍼'},
  {id:'sleep',label:'Ngủ',icon:'😴'},
  {id:'diaper',label:'Thay tã',icon:'🧷'},
  {id:'pee',label:'Đi tè',icon:'💧'},
  {id:'poop',label:'Đi phân',icon:'💩'},
  {id:'pump',label:'Hút sữa',icon:'🥛'},
  {id:'storedMilk',label:'Kho sữa',icon:'🧊'},
  {id:'medicine',label:'Uống thuốc',icon:'💊'},
  {id:'temperature',label:'Thân nhiệt',icon:'🌡️'},
  {id:'spitup',label:'Trớ sữa',icon:'🤮'},
  {id:'urgentMilk',label:'Sữa sắp hết hạn',icon:'🟡'},
  {id:'schedule',label:'Lịch hôm nay/mai',icon:'📅'}
];
function careMetricDef(id){return CARE_METRIC_DEFS.find(function(x){return x.id===id})}
function defaultCareMetrics(){return CARE_METRIC_DEFS.map(function(x){return {id:x.id,visible:true}})}
function normalizeCareMetrics(value){
  var known={};CARE_METRIC_DEFS.forEach(function(x){known[x.id]=x});
  var arr=Array.isArray(value)?value.filter(function(x){return x&&known[x.id]}).map(function(x){return {id:x.id,visible:x.visible!==false}}):[];
  CARE_METRIC_DEFS.forEach(function(x){if(!arr.some(function(m){return m.id===x.id}))arr.push({id:x.id,visible:true})});
  return arr;
}
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
  else if(key==='medicine')cur=currentMap.medicine;
  else if(key==='temperature')cur=currentMap.temperatureCount;
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

/* V14.1.0 · Sổ sức khỏe V1 đã gỡ bỏ: thanh dưới do người dùng cấu hình trước đây
   trỏ tới 'healthBookView'/'healthBook' được chuyển sang module 2.0 để không mất nút. */
var LEGACY_BOTTOM_NAV_MAP={healthBookView:'healthBook2',healthBook:'healthBook2',
  /* V14.2.0 · Nhật ký và Sức khỏe mẹ đã gỡ — nút cũ của người dùng được chuyển sang module thay thế */
  diaryBook:'careTimeline',diary:'careTimeline',diaryType:'appointmentType',health:'healthBook2'};
function migrateBottomNavId(id){return LEGACY_BOTTOM_NAV_MAP[id]||id}
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
    nextFeedHours:(Number(cfg.nextFeedHours)>0?Number(cfg.nextFeedHours):2.5),
    apptLookaheadDays:(Number(cfg.apptLookaheadDays)>=0?Number(cfg.apptLookaheadDays):7),
    modules:modules,
    bottomNav:(Array.isArray(cfg.bottomNav)&&cfg.bottomNav.length?cfg.bottomNav.slice(0,4):['careTimeline','careAdd','scheduleCalendar','more']).map(migrateBottomNavId),
    moduleTitles:(cfg.moduleTitles&&typeof cfg.moduleTitles==='object')?Object.assign({},cfg.moduleTitles):{},
    careMetrics:normalizeCareMetrics(cfg.careMetrics),
    careGoals:Object.assign(defaultCareGoals(), (cfg.careGoals&&typeof cfg.careGoals==='object')?cfg.careGoals:{}),
    smartAlerts:normalizeSmartAlertConfig(cfg.smartAlerts)
  };
}
function saveDashboardConfigObject(db,cfg){
  db.settings=db.settings||{};
  db.settings.dashboardConfig=cfg;
  db.settings.babyDescription=cfg.babyDescription||db.settings.babyDescription||'';
  db=normalize(db);
  db._localUpdatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(db));
  try{cloudAutoPush(db)}catch(e){}
}
function bottomNavMeta(id){return BOTTOM_NAV_OPTIONS.find(function(x){return x.id===id})||BOTTOM_NAV_OPTIONS[0]}
function latestCareEventByType(db,type){return (db.careEvents||[]).filter(function(x){return x&&x.type===type}).slice().sort(function(a,b){return String((b.startDate||b.date||'')+(b.timeFrom||'')).localeCompare(String((a.startDate||a.date||'')+(a.timeFrom||'')))} )[0]||null}
function formatDateTimeLine(date,time){if(!date||!time)return '';return time+', '+fmtDate(date)}
function addMinutesToDateTime(date,time,minutes){var d=new Date((date||today())+'T'+(time||'00:00')+':00');if(isNaN(d.getTime()))return null;d=new Date(d.getTime()+minutes*60000);return {date:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}}
function babySleepStatusText(db){var latest=latestCareEventByType(db,'sleep');return latest&&!latest.timeTo?'😴 Bé đang ngủ':'☺️ Bé đang thức'}
function babySleepElapsedSeconds(db){
  var latest=latestCareEventByType(db,'sleep');
  if(!latest||latest.timeTo)return null;
  var startMs=dateTimeMs(latest.startDate||latest.date,latest.timeFrom);
  if(startMs===null||isNaN(startMs))return null;
  return Math.max(0,Math.floor((Date.now()-startMs)/1000));
}
function fmtHHMMSSDuration(totalSeconds){
  totalSeconds=Math.max(0,Math.round(totalSeconds||0));
  var h=Math.floor(totalSeconds/3600),m=Math.floor((totalSeconds%3600)/60),s=totalSeconds%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function fmtHHMMDuration(totalSeconds){
  totalSeconds=Math.max(0,Math.round(totalSeconds||0));
  var h=Math.floor(totalSeconds/3600),m=Math.floor((totalSeconds%3600)/60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}
/* V13.9.2 · mục 1: "01:30" dễ bị đọc nhầm thành 1 giờ 30 sáng.
   Thẻ thông tin bé nói bằng chữ: "1 giờ 30 phút". */
function fmtDurationVN(totalSeconds){
  totalSeconds=Math.max(0,Math.round(totalSeconds||0));
  var totalMin=Math.floor(totalSeconds/60);
  if(totalMin<1)return 'chưa tới 1 phút';
  var h=Math.floor(totalMin/60),m=totalMin%60;
  if(h<=0)return m+' phút';
  if(m<=0)return h+' giờ';
  return h+' giờ '+m+' phút';
}
function syncSleepElapsedUI(){
  var el=byId('bcSleepElapsed');if(!el)return;
  var secs=babySleepElapsedSeconds(load());
  if(secs===null)return;
  el.textContent='Đã ngủ '+fmtDurationVN(secs);
}
function editLatestActiveSleepFromDashboard(){var db=load(),latest=null,latestIdx=-1;for(var i=0;i<(db.careEvents||[]).length;i++){var x=db.careEvents[i];if(!x||x.type!=='sleep'||x.timeTo)continue;if(!latest||String((x.startDate||x.date||'')+(x.timeFrom||'')).localeCompare(String((latest.startDate||latest.date||'')+(latest.timeFrom||'')))>0){latest=x;latestIdx=i}}if(latestIdx<0){showToast('Không có giấc ngủ đang diễn ra','warn');return}editCareEvent(latestIdx)}
function nextFeedText(db){var latest=latestCareEventByType(db,'feed');if(!latest)return '';var cfg=getDashboardConfig(db),hours=Number(cfg.nextFeedHours);if(!isFinite(hours)||hours<=0)hours=2.5;var next=addMinutesToDateTime(latest.startDate||latest.date,latest.timeFrom,Math.round(hours*60));return next?formatDateTimeLine(next.date,next.time):''}
/* V12.0 · Dòng "Cữ bú tiếp theo" 1 dòng trong Hero: giờ dự đoán + đếm ngược + màu mức khẩn */
function nextFeedInfo(db){
  var latest=latestCareEventByType(db,'feed');if(!latest)return null;
  var cfg=getDashboardConfig(db),hours=Number(cfg.nextFeedHours);if(!isFinite(hours)||hours<=0)hours=2.5;
  var next=addMinutesToDateTime(latest.startDate||latest.date,latest.timeFrom,Math.round(hours*60));
  if(!next)return null;
  var target=new Date(next.date+'T'+next.time+':00');if(isNaN(target.getTime()))return null;
  var remainMin=Math.round((target.getTime()-Date.now())/60000);
  var level=remainMin<0?'over':(remainMin<30?'soon':'ok');
  return {time:next.time,date:next.date,remainMin:remainMin,level:level};
}
function fmtRemainVerbose(min){
  var neg=min<0,a=Math.abs(min),h=Math.floor(a/60),m=a%60;function p(n){return (n<10?'0':'')+n;}
  var txt=(h>0?p(h)+' giờ ':'')+p(m)+' phút';
  return neg?('quá '+txt):txt;
}
function nextFeedLineHtml(db){
  var info=nextFeedInfo(db);
  if(!info)return '<div class="bcNextFeed nfLevel-none"><span class="nfIco">🍼</span><span class="nfMain">Cữ bú tiếp theo <span class="nfMuted">· chưa đủ dữ liệu để dự đoán</span></span></div>';
  var stateTxt=info.level==='over'?'Đã quá giờ':(info.level==='soon'?'Sắp đến giờ':'Còn nhiều thời gian');
  var remainPhrase=info.remainMin>=0?('còn '+fmtRemainVerbose(info.remainMin)):fmtRemainVerbose(info.remainMin);
  return '<div class="bcNextFeed nfLevel-'+info.level+'" title="'+esc(stateTxt)+'">'+
    '<span class="nfIco">🍼</span>'+
    '<span class="nfMain">Cữ bú tiếp theo <span class="nfTime">'+esc(info.time)+'</span> <span class="nfMuted">· '+esc(remainPhrase)+'</span></span>'+
    '<span class="nfDot"></span></div>';
}
/* V12.1 · Realtime dòng cữ bú — cập nhật mỗi khi sang phút mới, không cần load lại trang */
function syncNextFeedUI(){
  var el=byId('bcNextFeedWrap');if(!el)return;
  var mm=Math.floor(Date.now()/60000);
  if(el.__mm===mm)return;el.__mm=mm;
  el.innerHTML=nextFeedLineHtml(load());
}
/* V12.1 · Vòng trạng thái quanh avatar (mục 1) — hiện chỉ Thức/Ngủ; ốm/tiêm/quấy để sau */
function babyRingState(db){var latest=latestCareEventByType(db,'sleep');return (latest&&!latest.timeTo)?'ringSleep':'ringAwake'}

/* V12.1 · Daily Streak (mục 4) */
function careRecordDaySet(db){var set={};(db.careEvents||[]).forEach(function(x){var d=x&&(x.startDate||x.date);if(d)set[d]=true});return set}
function computeStreak(db){
  var set=careRecordDaySet(db),days=Object.keys(set).sort(),todayStr=today();
  var res={current:0,record:0,totalDays:0,recordedDays:days.length,rate:0,startDate:'',firstDay:days[0]||'',todayLogged:!!set[todayStr]};
  if(!days.length)return res;
  var best=1,run=1;
  for(var i=1;i<days.length;i++){run=(daysBetween(days[i-1],days[i])===1)?run+1:1;if(run>best)best=run}
  res.record=best;
  var anchor=null;
  if(set[todayStr])anchor=todayStr;else if(set[addDaysISO(todayStr,-1)])anchor=addDaysISO(todayStr,-1);
  if(anchor){var cur=0,d=anchor;while(set[d]){cur++;d=addDaysISO(d,-1)}res.current=cur;res.startDate=addDaysISO(anchor,-(cur-1))}
  res.totalDays=daysBetween(days[0],todayStr)+1;
  res.rate=res.totalDays>0?Math.round(res.recordedDays/res.totalDays*100):0;
  return res;
}
function syncStreakWidget(db){
  var el=byId('streakWidget');if(!el)return;
  var s=computeStreak(db||load()),n=el.querySelector('.streakNum');
  if(n)n.textContent=s.current;
  el.classList.toggle('streakZero',s.current===0);
  el.setAttribute('aria-label','Chuỗi ghi chép '+s.current+' ngày. Bấm để xem chi tiết.');
}
function streakBadgeHtml(record){
  var defs=[{m:'🥉',d:7},{m:'🥈',d:30},{m:'🥇',d:100},{m:'👑',d:365}];
  return '<div class="streakBadges">'+defs.map(function(b){var on=record>=b.d;return '<div class="streakBadge'+(on?' on':'')+'"><span class="med">'+b.m+'</span>'+b.d+' ngày</div>'}).join('')+'</div>';
}
function renderStreakSheet(db){
  var body=byId('streakSheetBody');if(!body)return;
  var s=computeStreak(db);
  var todayNote=s.todayLogged
    ? '<div class="streakToday ok">✅ Hôm nay đã ghi chép</div>'
    : (s.current>0
        ? '<div class="streakToday warn">⚠ Hôm nay chưa ghi chép. Hãy ghi ít nhất một hoạt động để giữ chuỗi.</div>'
        : (s.recordedDays>0
            ? '<div class="streakToday broken">💔 Chuỗi đã bị ngắt. Hãy bắt đầu lại từ hôm nay!</div>'
            : '<div class="streakToday warn">Hãy ghi hoạt động đầu tiên để bắt đầu chuỗi nhé!</div>'));
  var rows=''+
    (s.record?'<div class="streakRow"><span class="k">🏆 Kỷ lục dài nhất</span><span class="v">'+s.record+' ngày</span></div>':'')+
    (s.startDate&&s.current>0?'<div class="streakRow"><span class="k">🚩 Chuỗi bắt đầu từ</span><span class="v">'+esc(fmtDate(s.startDate))+'</span></div>':'')+
    '<div class="streakRow"><span class="k">📅 Tổng ngày dùng app</span><span class="v">'+s.totalDays+' ngày</span></div>'+
    '<div class="streakRow"><span class="k">📊 Tỷ lệ ngày có ghi chép</span><span class="v">'+s.rate+'%</span></div>';
  body.innerHTML=
    '<div class="streakBig"><div class="num">'+s.current+'</div><div class="cap">ngày ghi chép liên tục</div></div>'+
    todayNote+rows+streakBadgeHtml(s.record);
}
function openStreakSheet(){var db=load();renderStreakSheet(db);var ov=byId('streakOverlay');if(ov)ov.classList.add('show')}
function closeStreakSheet(){var ov=byId('streakOverlay');if(ov)ov.classList.remove('show')}

/* V12.1 · Xem ảnh avatar toàn màn hình + zoom (mục 1) — viewer riêng, không đụng openMilestonePhotoViewer (Baseline Lock) */
function openAvatarViewer(){
  var st=(load().settings||{});var src=st.avatarDataUrl||'';
  if(!src){goTab('setup');showToast('Chưa có ảnh đại diện. Thêm ảnh trong Thiết lập nhé.','info');return}
  var ov=byId('avatarViewerOverlay'),img=byId('avatarViewerImg');if(!ov||!img)return;
  img.src=src;avatarViewerResetZoom();ov.classList.add('show');
}
function closeAvatarViewer(){var ov=byId('avatarViewerOverlay');if(ov)ov.classList.remove('show');var img=byId('avatarViewerImg');if(img){img.src='';avatarViewerResetZoom()}}
var __avZoom=1;
function avatarViewerResetZoom(){__avZoom=1;var img=byId('avatarViewerImg');if(img)img.style.transform='scale(1)'}
function avatarViewerToggleZoom(){var img=byId('avatarViewerImg');if(!img)return;__avZoom=__avZoom>1?1:2;img.style.transform='scale('+__avZoom+')'}
(function(){
  function bind(){
    var ov=byId('avatarViewerOverlay'),img=byId('avatarViewerImg');if(!ov||!img)return;
    img.addEventListener('click',function(e){e.stopPropagation();avatarViewerToggleZoom()});
    // pinch zoom
    var startDist=0,startScale=1;
    img.addEventListener('touchstart',function(e){if(e.touches.length===2){startDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);startScale=__avZoom}},{passive:true});
    img.addEventListener('touchmove',function(e){if(e.touches.length===2&&startDist){var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);__avZoom=Math.max(1,Math.min(4,startScale*d/startDist));img.style.transform='scale('+__avZoom+')';e.preventDefault()}},{passive:false});
    // vuốt xuống để đóng (khi chưa zoom)
    var y0=null;
    ov.addEventListener('touchstart',function(e){if(e.touches.length===1)y0=e.touches[0].clientY},{passive:true});
    ov.addEventListener('touchend',function(e){if(y0!==null&&__avZoom<=1&&e.changedTouches[0].clientY-y0>80)closeAvatarViewer();y0=null},{passive:true});
  }
  if(document.body)bind();else document.addEventListener('DOMContentLoaded',bind);
})();
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

var NOTIFICATION_HISTORY_KEY='meYeuBeNotificationHistory_v1';
function loadNotificationHistory(){try{var x=JSON.parse(localStorage.getItem(NOTIFICATION_HISTORY_KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
function saveNotificationHistory(arr){localStorage.setItem(NOTIFICATION_HISTORY_KEY,JSON.stringify((arr||[]).slice(0,100)))}
function syncNotificationHistory(alerts){var history=loadNotificationHistory(),keys={};history.forEach(function(x){keys[x.eventKey]=true});var changed=false;(alerts||[]).forEach(function(a){if(!keys[a.eventKey]){history.unshift({eventKey:a.eventKey,ruleId:a.ruleId,severity:a.severity,icon:a.icon,title:a.title,message:a.message,actionLabel:a.actionLabel,action:a.action,detailType:a.detailType||'',detailDate:a.detailDate||'',createdAt:new Date().toISOString(),unread:true});keys[a.eventKey]=true;changed=true}});if(changed)saveNotificationHistory(history);return history}
function unreadNotificationCount(){return loadNotificationHistory().filter(function(x){return x.unread}).length}
function notificationTimeText(v){if(!v)return '';var d=new Date(v),now=new Date();if(d.toDateString()===now.toDateString())return d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});var y=new Date(now);y.setDate(y.getDate()-1);if(d.toDateString()===y.toDateString())return 'Hôm qua '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});return d.toLocaleDateString('vi-VN')+' '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}
function notificationRowHtml(x,idx){
  return '<div class="notificationItem '+(x.unread?'unread':'read')+'" role="button" tabindex="0" onclick="openNotificationRecordDetail('+idx+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openNotificationRecordDetail('+idx+')}">'+
    '<div class="notificationIcon">'+esc(x.icon||'🔔')+(x.unread?'<span class="notificationDot" aria-hidden="true"></span>':'')+'</div>'+
    '<div class="notificationTextWrap"><b>'+esc(x.title||'Thông báo')+(x.unread?' <span class="notificationBadgeNew">Mới</span>':'')+'</b><small>'+esc(x.message||'')+'</small></div>'+
    '<div class="notificationTime">'+esc(notificationTimeText(x.createdAt))+(x.unread?'':'<span class="notificationSeenLabel">Đã xem</span>')+'</div>'+
  '</div>';
}
function renderNotificationCenterBody(){
  var body=byId('notificationCenterBody');if(!body)return;
  var h=loadNotificationHistory();
  if(!h.length){body.innerHTML='<div class="notificationEmpty">🔔<br><b>Chưa có thông báo</b><br><small>Cảnh báo mới sẽ xuất hiện tại đây.</small></div>';return}
  var unread=[],read=[];
  h.forEach(function(x,i){(x.unread?unread:read).push({x:x,i:i})});
  var html='';
  if(unread.length)html+='<div class="notificationSectionLabel">🆕 Mới ('+unread.length+')</div>'+unread.map(function(o){return notificationRowHtml(o.x,o.i)}).join('');
  if(read.length)html+='<div class="notificationSectionLabel notificationSectionLabelMuted">Đã xem</div>'+read.map(function(o){return notificationRowHtml(o.x,o.i)}).join('');
  body.innerHTML=html;
}
function openNotificationCenter(){var overlay=byId('notificationOverlay');if(!overlay)return;renderNotificationCenterBody();overlay.classList.add('show');document.body.classList.add('careModalOpen');render()}
function closeNotificationCenter(){var o=byId('notificationOverlay');if(o)o.classList.remove('show');document.body.classList.remove('careModalOpen')}
function markAllNotificationsRead(){var h=loadNotificationHistory();var changed=false;h.forEach(function(x){if(x.unread){x.unread=false;changed=true}});if(changed){saveNotificationHistory(h);renderNotificationCenterBody();render()}}
function openNotificationRecordDetail(idx){
  var h=loadNotificationHistory(),x=h[idx];if(!x)return;
  if(x.unread){x.unread=false;saveNotificationHistory(h)}
  closeNotificationCenter();render();
  if(x.detailType){renderCareStatDetail(x.detailType,x.detailDate||today())}
  else if(x.action){try{(new Function(x.action))()}catch(e){}}
}
function careFormCard(){return byId('careFormCard')}
function openCareFormModal(type,editIndex){var overlay=byId('careFormOverlay'),body=byId('careFormModalBody'),card=careFormCard();if(!overlay||!body||!card)return;if(!window.__careFormHome){window.__careFormHome={parent:card.parentNode,next:card.nextSibling}}body.appendChild(card);window.__careFormModalOpen=true;overlay.classList.add('show');document.body.classList.add('careModalOpen');document.documentElement.style.overflowX='hidden';if(editIndex!==undefined&&editIndex!==null&&editIndex!=='')fillCareEditForm(Number(editIndex));else{resetCareForm();window.__careFormIsCopy=false;selectCareType(normalizeCareInputType(type||'feed'));syncCareFormTitle()}setTimeout(function(){var f=byId('cTimeFrom');if(f)f.focus({preventScroll:true})},80)}
function closeCareFormModal(returnToDetail){var overlay=byId('careFormOverlay'),card=careFormCard(),ctx=window.__careFormReturnContext?Object.assign({},window.__careFormReturnContext):null;if(window.__careFormHome&&card){var h=window.__careFormHome;if(h.next&&h.next.parentNode===h.parent)h.parent.insertBefore(card,h.next);else h.parent.appendChild(card)}if(overlay)overlay.classList.remove('show');window.__careFormModalOpen=false;document.body.classList.remove('careModalOpen');document.documentElement.style.overflowX='';if(returnToDetail!==false&&ctx){window.__careFormReturnContext=null;setTimeout(function(){renderCareStatDetail(ctx.type,ctx.date)},30)}else if(returnToDetail===false){return}else window.__careFormReturnContext=null}
function openCareAddFromDetail(type,date){var inputType=normalizeCareInputType(type==='milk'?'pump':type);window.__careFormReturnContext={type:type,date:date||today()};closeCareDetailModal();openCareFormModal(inputType);setValSafe('cDate',date||today());setValSafe('cEndDate',date||today())}
function handleCareTypeBlock(type){if(window.__careFormModalOpen)selectCareType(type);else openCareFormModal(type)}
function fillCareEditForm(i){var x=load().careEvents[i];if(!x)return;var originalType=x.type||'feed',inputType=normalizeCareInputType(originalType);setValSafe('careEditIndex',i);setValSafe('careLinkedBagId',x.linkedBagId||'');window.__careFormIsCopy=false;window.__careSelectedType=inputType;window.__milkFeedSourcesKeep=(inputType==='feed'&&(x.source||'direct')==='stored');if(window.__milkFeedSourcesKeep){window.__milkFeedSources=bagSourcesFromEvent(x).map(function(s){return Object.assign({},s)})}selectCareType(inputType);setValSafe('cDate',x.startDate||x.date);setValSafe('cEndDate',x.endDate||x.date||x.startDate);setValSafe('cTimeFrom',x.timeFrom);setValSafe('cTimeTo',x.timeTo);setValSafe('cNote',x.note);setValSafe('cAmount',x.amount||'');syncCareDurationPreview();if(inputType==='feed'){setValSafe('cFeedSource',x.source||'direct');renderCareDynamicFields('feed',load());setValSafe('cFeedSource',x.source||'direct');if((x.source||'direct')==='stored'){var takenTotal=milkFeedSourcesState().reduce(function(t,s){return t+Number(s.usedMl||0)},0);setValSafe('cAmount',takenTotal||(x.extra&&x.extra.takenMl)||x.amount||'');setValSafe('cFeedWasteMl',x.wasteMl||0);renderMilkSourceList();}else{setValSafe('cAmount',x.amount||'')}toggleFeedSourceFields();}if(inputType==='pump'){setValSafe('cContainerId',(x.extra&&x.extra.containerId)||'');if(typeof mcRenderPumpChips==='function')mcRenderPumpChips();setValSafe('cPumpSide',(x.extra&&x.extra.side)||'Cả hai');setValSafe('cStorage',x.storage||'');setValSafe('cStatus',x.status||'Đang bảo quản');setValSafe('cExpireDate',(x.extra&&x.extra.expireDate)||'');setValSafe('cAmount',x.amount||'');if(typeof syncPumpUI==='function')syncPumpUI()}if(inputType==='diaper'){setValSafe('cAmount',x.amount||1);selectDiaperType((x.extra&&x.extra.diaperType)||legacyPeePoopToDiaperType(originalType)||'wet');diaperSetAmount(x.amount||1)}if(originalType==='medicine'){setValSafe('cMedicineName',(x.extra&&x.extra.name)||'');setValSafe('cMedicineDose',x.amount||'');setValSafe('cMedicineUnit',x.unit||'')}if(originalType==='temperature'){setValSafe('cTemperature',x.amount||'');setValSafe('cTemperatureSite',(x.extra&&x.extra.site)||'Nách')}if(originalType==='spitup'){setValSafe('cSpitupLevel',(x.extra&&x.extra.level)||'Ít');setValSafe('cSpitupAfter',(x.extra&&x.extra.afterFeedMin)||'');setValSafe('cSpitupType',(x.extra&&x.extra.kind)||'Trớ')}syncCareFormTitle();syncCareDateTimeRowsForType(inputType);syncCareNoteCollapse(inputType);byId('careEditBadge').classList.remove('hidden');window.__milkFeedSourcesKeep=false;if(typeof abState==='function'){abReset();abState().manual=true;abSyncChrome()}}
function editMilkBagFromInventory(idx){var db=load(),bag=(db.milkInventory||[])[Number(idx)];if(!bag){showToast('Không tìm thấy túi sữa','error');return}var eventIdx=(db.careEvents||[]).findIndex(function(x){return x&&x.type==='pump'&&(x.linkedBagId===bag.id||x.id===bag.pumpEventId)});closeCareDetailModal();if(eventIdx>=0)openCareFormModal('pump',eventIdx);else showToast('Không tìm thấy lần hút sữa liên kết','warn')}
function openSmartAlertCareForm(type){closeSmartAlertCenter();openCareFormModal(normalizeCareInputType(type||'feed'))}
function smartAlertTemperatureValue(item){
  if(!item)return null;
  var candidates=[item.amount,item.temperature,item.value,item.extra&&item.extra.temperature];
  for(var i=0;i<candidates.length;i++){
    var n=Number(String(candidates[i]===undefined||candidates[i]===null?'':candidates[i]).replace(',','.'));
    if(isFinite(n)&&n>0)return n;
  }
  return null;
}
var SMART_ALERT_RULE_DEFS=[
  {id:'temperatureHigh',label:'Thân nhiệt vượt ngưỡng',icon:'🌡️',defaultEnabled:true,defaultSeverity:'critical'},
  {id:'feedOverdue',label:'Cữ bú quá giờ',icon:'🍼',defaultEnabled:true,defaultSeverity:'warning'},
  {id:'sleepTooLong',label:'Giấc ngủ kéo dài',icon:'😴',defaultEnabled:true,defaultSeverity:'warning'},
  {id:'milkExpired',label:'Túi sữa đã quá hạn',icon:'🧊',defaultEnabled:true,defaultSeverity:'critical'},
  {id:'milkExpiring',label:'Túi sữa sắp hết hạn',icon:'🧊',defaultEnabled:true,defaultSeverity:'warning'},
  {id:'appointmentSoon',label:'Lịch khám sắp tới',icon:'🩺',defaultEnabled:true,defaultSeverity:'info'}
];
function defaultSmartAlertConfig(){
  return {
    enabled:true,
    rules:{
      temperatureHigh:{enabled:true,severity:'critical',threshold:38},
      feedOverdue:{enabled:true,severity:'warning',graceMinutes:15},
      sleepTooLong:{enabled:true,severity:'warning',maxHours:4},
      milkExpired:{enabled:true,severity:'critical'},
      milkExpiring:{enabled:true,severity:'warning',beforeHours:24},
      appointmentSoon:{enabled:true,severity:'info',beforeHours:24}
    }
  };
}
function normalizeSmartAlertConfig(value){
  var base=defaultSmartAlertConfig(),v=value&&typeof value==='object'?value:{};
  base.enabled=v.enabled!==false;
  var src=v.rules&&typeof v.rules==='object'?v.rules:{};
  Object.keys(base.rules).forEach(function(id){
    if(src[id]&&typeof src[id]==='object')base.rules[id]=Object.assign({},base.rules[id],src[id]);
    base.rules[id].enabled=base.rules[id].enabled!==false;
    if(['critical','warning','info'].indexOf(base.rules[id].severity)<0){
      var def=SMART_ALERT_RULE_DEFS.find(function(x){return x.id===id});
      base.rules[id].severity=(def&&def.defaultSeverity)||'warning';
    }
  });
  return base;
}
function smartAlertSeverityMeta(level){
  var map={
    critical:{rank:3,label:'Quan trọng',icon:'🆘',cls:'critical'},
    warning:{rank:2,label:'Cần chú ý',icon:'⚠️',cls:'warning'},
    info:{rank:1,label:'Thông tin',icon:'ℹ️',cls:'info'}
  };
  return map[level]||map.warning;
}
function dateTimeMs(date,time){
  if(!date)return NaN;
  var d=new Date(date+'T'+(time||'00:00')+':00');
  return d.getTime();
}
function minutesSince(date,time){
  var ms=dateTimeMs(date,time);
  return isFinite(ms)?Math.floor((Date.now()-ms)/60000):null;
}
function smartAlertRuleConfig(db,id){
  var cfg=getDashboardConfig(db),smart=normalizeSmartAlertConfig(cfg.smartAlerts);
  return smart.rules[id]||{};
}
function evaluateSmartAlerts(db){
  db=db||load();
  var cfg=getDashboardConfig(db),smart=normalizeSmartAlertConfig(cfg.smartAlerts);
  if(!smart.enabled)return [];
  var alerts=[],now=Date.now(),todayStr=today();
  function add(id,title,message,actionLabel,action,eventKey,detailType,detailDate){
    var r=smart.rules[id]||{};
    if(r.enabled===false)return;
    var meta=smartAlertSeverityMeta(r.severity);
    alerts.push({
      id:id+'_'+alerts.length,
      ruleId:id,
      severity:r.severity,
      rank:meta.rank,
      icon:(SMART_ALERT_RULE_DEFS.find(function(x){return x.id===id})||{}).icon||'🔔',
      title:title,
      message:message||'',
      actionLabel:actionLabel||'',
      action:action||'',
      eventKey:eventKey||id,
      detailType:detailType||'',
      detailDate:detailDate||''
    });
  }

  var tempRule=smart.rules.temperatureHigh;
  if(tempRule&&tempRule.enabled!==false){
    var temps=(db.careEvents||[]).filter(function(x){return x&&x.type==='temperature'&&smartAlertTemperatureValue(x)!==null})
      .slice().sort(function(a,b){return dateTimeMs(b.startDate||b.date,b.timeFrom)-dateTimeMs(a.startDate||a.date,a.timeFrom)});
    var latestTemp=temps[0],latestTempValue=smartAlertTemperatureValue(latestTemp);
    var threshold=Number(String(tempRule.threshold===undefined?'':tempRule.threshold).replace(',','.'));
    if(latestTemp&&latestTempValue!==null&&isFinite(threshold)&&latestTempValue>=threshold){
      add('temperatureHigh','Thân nhiệt '+smartNum(latestTempValue,1)+'°C',
        'Vượt ngưỡng cảnh báo '+smartNum(threshold,1)+'°C đã cấu hình.',
        'Ghi nhận thân nhiệt',"openSmartAlertCareForm('temperature')",
        'temperatureHigh:'+(latestTemp.id||latestTemp.createdAt||((latestTemp.startDate||latestTemp.date||'')+'T'+(latestTemp.timeFrom||'')))+':'+smartNum(latestTempValue,1),
        'temperature',latestTemp.startDate||latestTemp.date||todayStr);
    }
  }

  var feedRule=smart.rules.feedOverdue;
  if(feedRule&&feedRule.enabled!==false){
    var latestFeed=latestCareEventByType(db,'feed');
    var feedHours=Number(cfg.nextFeedHours),grace=Number(feedRule.graceMinutes);
    if(latestFeed&&isFinite(feedHours)&&feedHours>0&&isFinite(grace)&&grace>=0){
      var next=addMinutesToDateTime(latestFeed.startDate||latestFeed.date,latestFeed.timeFrom,Math.round(feedHours*60));
      var overdue=next?minutesSince(next.date,next.time):null;
      if(overdue!==null&&overdue>grace){
        add('feedOverdue','Cữ bú đã quá '+overdue+' phút',
          'Cữ dự kiến lúc '+next.time+', ngưỡng nhắc sau '+grace+' phút.',
          'Ghi nhận bú',"openSmartAlertCareForm('feed')",
          'feedOverdue:'+(latestFeed.id||latestFeed.createdAt||((latestFeed.startDate||latestFeed.date||'')+'T'+(latestFeed.timeFrom||''))),
          'feed',latestFeed.startDate||latestFeed.date||todayStr);
      }
    }
  }

  var sleepRule=smart.rules.sleepTooLong;
  if(sleepRule&&sleepRule.enabled!==false){
    var activeSleep=latestCareEventByType(db,'sleep'),maxHours=Number(sleepRule.maxHours);
    if(activeSleep&&!activeSleep.timeTo&&isFinite(maxHours)&&maxHours>0){
      var sleepMin=minutesSince(activeSleep.startDate||activeSleep.date,activeSleep.timeFrom);
      if(sleepMin!==null&&sleepMin>maxHours*60){
        add('sleepTooLong','Bé đã ngủ '+fmtMinutes(sleepMin),
          'Vượt thời gian '+smartNum(maxHours,1)+' giờ đã cấu hình.',
          'Cập nhật giờ thức','editLatestActiveSleepFromDashboard()',
          'sleepTooLong:'+(activeSleep.id||activeSleep.createdAt||((activeSleep.startDate||activeSleep.date||'')+'T'+(activeSleep.timeFrom||''))),
          'sleep',activeSleep.startDate||activeSleep.date||todayStr);
      }
    }
  }

  var expiredRule=smart.rules.milkExpired,expiringRule=smart.rules.milkExpiring;
  var bags=(db.milkInventory||[]).filter(function(b){return b&&b.status==='Đang bảo quản'&&Number(b.remaining||0)>0});
  var expiredIds=[],expiringIds=[],beforeHours=Number(expiringRule&&expiringRule.beforeHours);
  bags.forEach(function(b){
    var remain=milkExpireAt(b)-now,id=String(b.id||b.shortId||'');
    if(remain<=0)expiredIds.push(id);
    else if(expiringRule&&expiringRule.enabled!==false&&isFinite(beforeHours)&&beforeHours>0&&remain<=beforeHours*3600000)expiringIds.push(id);
  });
  var expiredCount=expiredIds.length,expiringCount=expiringIds.length;
  if(expiredRule&&expiredRule.enabled!==false&&expiredCount>0){
    add('milkExpired',expiredCount+' túi sữa đã quá hạn',
      'Không nên tiếp tục sử dụng các túi đã quá hạn bảo quản.',
      'Mở kho sữa','openMilkInventoryAlert('+JSON.stringify(expiredIds)+')',
      'milkExpired:'+todayStr+':'+expiredCount,
      'milk',todayStr);
  }
  if(expiringRule&&expiringRule.enabled!==false&&expiringCount>0){
    add('milkExpiring',expiringCount+' túi sữa sắp hết hạn',
      'Sẽ hết hạn trong '+smartNum(beforeHours,1)+' giờ tới theo cấu hình.',
      'Mở kho sữa','openMilkInventoryAlert('+JSON.stringify(expiringIds)+')',
      'milkExpiring:'+todayStr+':'+expiringCount+':'+smartNum(beforeHours,1),
      'milk',todayStr);
  }

  var apptRule=smart.rules.appointmentSoon;
  if(apptRule&&apptRule.enabled!==false){
    var appt=upcomingAppointment(db),before=Number(apptRule.beforeHours);
    if(appt&&isFinite(before)&&before>=0){
      var at=dateTimeMs(appt.date,(timeRangeOf(appt)||'00:00').split(' - ')[0]),diff=(at-now)/3600000;
      if(diff>=0&&diff<=before){
        add('appointmentSoon',appt.title||typeLabel(db,appt.typeId)||'Có lịch sắp tới',
          (timeRangeOf(appt)||'Chưa nhập giờ')+' · '+fmtDate(appt.date),
          'Xem lịch','openScheduleFromDashboard()',
          'appointmentSoon:'+(appt.id||appt.createdAt||((appt.date||'')+'T'+(timeRangeOf(appt)||''))));
      }
    }
  }

  alerts.sort(function(a,b){return b.rank-a.rank||a.title.localeCompare(b.title,'vi')});
  return alerts;
}
function smartAlertSummary(alerts){
  alerts=alerts||[];
  if(!alerts.length)return {severity:'ok',icon:'💚',title:'Hôm nay mọi thứ đều ổn',sub:'Không có cảnh báo cần xử lý.'};
  var top=alerts[0],meta=smartAlertSeverityMeta(top.severity);
  return {
    severity:meta.cls,
    icon:top.severity==='critical'?'🆘':'⚠️',
    title:top.severity==='critical'?'Có việc cần xử lý ngay':'Có '+alerts.length+' việc cần chú ý',
    sub:top.title+(alerts.length>1?' · và '+(alerts.length-1)+' cảnh báo khác':'')
  };
}
function openSmartAlertCenter(){
  var overlay=byId('smartAlertOverlay'),content=byId('smartAlertCenterBody');
  if(!overlay||!content)return;
  var alerts=evaluateSmartAlerts(load());
  if(!alerts.length){
    content.innerHTML='<div class="smartAlertEmpty"><span>💚</span><b>Hôm nay mọi thứ đều ổn</b><small>Không có cảnh báo cần xử lý theo cấu hình hiện tại.</small></div>';
  }else{
    var groups=['critical','warning','info'],h='';
    groups.forEach(function(level){
      var items=alerts.filter(function(a){return a.severity===level});
      if(!items.length)return;
      var meta=smartAlertSeverityMeta(level);
      h+='<section class="smartAlertGroup '+meta.cls+'"><h4>'+meta.icon+' '+esc(meta.label)+' <span>'+items.length+'</span></h4>';
      items.forEach(function(a){
        h+='<div class="smartAlertItem"><div class="smartAlertItemIcon">'+esc(a.icon)+'</div><div class="smartAlertItemText"><b>'+esc(a.title)+'</b><small>'+esc(a.message)+'</small></div>'+(a.action?'<button type="button" onclick="'+a.action+'">'+esc(a.actionLabel||'Xem')+' ›</button>':'')+'</div>';
      });
      h+='</section>';
    });
    content.innerHTML=h;
  }
  overlay.classList.add('show');
  document.body.classList.add('careModalOpen');
}
function closeSmartAlertCenter(){
  var overlay=byId('smartAlertOverlay');
  if(overlay)overlay.classList.remove('show');
  document.body.classList.remove('careModalOpen');
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
  if(byId('appSubtitle'))byId('appSubtitle').textContent=name+' · '+ageText;
  var nextAppt=upcomingAppointment(db);
  var care=careSummaryForDate(db,todayStr);syncNotificationHistory(evaluateSmartAlerts(db));
  var scheduleToday=(db.appointments||[]).filter(function(x){return x&&x.date===todayStr}).length;
  var milkBags=(db.milkInventory||[]).filter(function(b){return b.status==='Đang bảo quản'&&Number(b.remaining||0)>0});
  var urgent=milkBags.filter(function(b){return milkExpireAt(b)-Date.now()<48*3600000}).length;
  var careToday=sortedCareEvents(db).filter(function(x){return (x.startDate||x.date)===todayStr || (x.type==='sleep'&&careOverlapMinutesOnDate(x,todayStr)>0)}).slice(0,5);
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
  var weight=latestB&&latestB.weight?latestB.weight:(!st.birthDate&&latestP&&latestP.weight?latestP.weight:'--');
  var length=latestB&&(latestB.length||latestB.height)?(latestB.length||latestB.height):'--';
  var head=latestB&&latestB.head?latestB.head:'--';
  var blocks={};
  function dashTitle(id,fallback){var t=cfg.moduleTitles&&cfg.moduleTitles[id];return (t&&String(t).trim())?String(t).trim():fallback}

  blocks.babyInfo=function(){
    var birthTimeText=(st.birthTimeFrom||st.birthTime)?(st.birthTimeFrom||st.birthTime)+(st.birthTimeTo?' - '+st.birthTimeTo:''):'--';
    var h='<section class="bcHero">';
    h+='<div class="bcHeroTop"><div class="bcAvatar bcAvatarRing '+babyRingState(db)+'" role="button" tabindex="0" onclick="openAvatarViewer()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openAvatarViewer()}" aria-label="Xem ảnh đại diện của '+esc(name)+'">'+(st.avatarDataUrl?'<img src="'+esc(st.avatarDataUrl)+'" alt="Ảnh đại diện của '+esc(name)+'">':'👧🏻')+'</div><div class="bcHeroInfo"><div class="bcName">'+esc(name)+'<span class="bcVerified">✓</span></div><div class="bcAge">'+esc(st.officialName||'Chưa khai báo tên chính thức')+'</div>';
    h+='<div class="bcOfficial">'+esc(cfg.babyDescription||'')+'</div></div>';
    var unread=unreadNotificationCount();h+='<div class="bcActions"><button class="bcIconBtn" type="button" onclick="openNotificationCenter()">🔔'+(unread?'<span class="bcBadge">'+unread+'</span>':'')+'</button><button class="bcIconBtn" type="button" onclick="goTab(\'scheduleCalendar\')">🗓️</button></div></div>';
    h+='<div class="bcBirthCompact"><div class="bcBirthBlock bcBirthDate"><span class="bcBirthIcon">🎂</span><span class="bcBirthText"><small>Ngày sinh</small><b>'+esc(st.birthDate?fmtDate(st.birthDate):'--')+'</b></span></div><details class="bcBirthMore" open><summary>Thông tin lúc sinh</summary><div class="bcBirthMoreGrid"><div><small>Giờ sinh</small><b>'+esc(birthTimeText)+'</b></div><div><small>Bệnh viện sinh</small><b>'+esc(st.birthHospital||'--')+'</b></div></div></details></div>';
    var sleepStatus=babySleepStatusText(db),isSleeping=sleepStatus.indexOf('đang ngủ')>=0,nextFeed=nextFeedText(db);h+='<div class="bcStatusBar"><div class="bcStatus '+(isSleeping?'bcStatusSleeping bcStatusClickable':'bcStatusAwake')+'" '+(isSleeping?'role="button" tabindex="0" onclick="editLatestActiveSleepFromDashboard()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){editLatestActiveSleepFromDashboard()}"':'')+'>'+esc(sleepStatus)+(isSleeping?'<span class="bcSleepHint" id="bcSleepElapsed">Đã ngủ '+esc(fmtDurationVN(babySleepElapsedSeconds(db)||0))+'</span>':'')+'</div><div class="bcClock"><span>🕘 <span id="vnClock">--:--:--</span></span><span class="bcTodayDate">'+esc(weekdayDateLine(todayStr))+'</span></div></div>';h+='<div class="bcStatusExtra" id="bcNextFeedWrap">'+nextFeedLineHtml(db)+'</div>';
    h+='</section>';return h;
  };
    blocks.appointment=function(){
    if(nextAppt){
      var ndAp=daysBetween(todayStr,nextAppt.date);
      var lookaheadDays=Number(cfg.apptLookaheadDays);if(!isFinite(lookaheadDays)||lookaheadDays<0)lookaheadDays=7;
      if(ndAp>lookaheadDays)return '';
      var apptTitle=nextAppt.title||typeLabel(db,nextAppt.typeId)||'Lịch khám';
      return '<section class="bcCard bcApptCard" onclick="openScheduleFromDashboard()"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">🩺</span><span>'+esc(dashTitle('appointment','Lịch khám sắp tới'))+'</span></div><button class="bcAction" onclick="event.stopPropagation();openScheduleFromDashboard()">Xem lịch ›</button></div><div class="bcApptBody"><div class="bcDateBox"><small>'+esc(apptWeekday(nextAppt.date))+'</small><b>'+esc(apptDay(nextAppt.date))+'</b><span>'+esc(apptMonth(nextAppt.date))+'</span></div><div class="bcApptMain"><b>'+esc(apptTitle)+'</b><span>🕘 '+esc(timeRangeOf(nextAppt)||'--')+'</span><span>📍 '+esc(nextAppt.place||nextAppt.location||nextAppt.hospital||'Chưa nhập địa điểm')+'</span></div><div class="bcPill">'+esc(appointmentDueText(nextAppt.date))+'</div></div></section>';
    }
    return '';
  };
  blocks.todayCare=function(){
    var scheduleTodayTomorrow=(db.appointments||[]).filter(function(x){return x&&(x.date===todayStr||x.date===addDaysISO(todayStr,1))}).length;
    var currentMap={feedMl:care.feedMl,feedCount:care.feedCount,sleepMin:care.sleepMin,diaper:care.diaper,pee:care.pee,poop:care.poop,pumpMl:care.pumpMl,storedMl:milkBags.reduce(function(t,b){return t+Number(b.remaining||0)},0),urgent:urgent,medicine:care.medicine,temperatureCount:care.temperatureCount,scheduleTodayTomorrow:scheduleTodayTomorrow};
    function metric(key,cls,icon,val,small,label,go){
      var gs=dashboardGoalStatus(cfg,key,currentMap);
      var style=gs?' style="--goal-progress:'+gs.ratio.toFixed(4)+'"':'';
      var done=gs&&gs.done?' done':'';
      var sub=gs?gs.label:label;
      return '<div class="bcMetric '+cls+done+'"'+style+' onclick="'+(go||'openCareStatsFromDashboard()')+'"><span class="bcDone">✓</span><div class="ico">'+icon+'</div><div class="val">'+val+(small?'<small>'+small+'</small>':'')+'</div><div class="lab">'+esc(label)+'</div>'+(gs?'<span class="bcGoal">'+esc(sub)+'</span>':'')+'</div>';
    }
    var renderers={
      feed:function(){return metric('feed','feed','🍼',care.feedMl,'ml',care.feedCount+' cữ bú','openCareStatsFromDashboard(\'feed\')')},
      sleep:function(){return metric('sleep','sleep','😴',fmtMinutes(care.sleepMin),'','Tổng giờ ngủ','openCareStatsFromDashboard(\'sleep\')')},
      diaper:function(){return metric('diaper','diaper','🧷',care.diaper,'','Tã đã thay','openCareStatsFromDashboard(\'diaper\')')},
      pee:function(){return metric('pee','pee','💧',care.pee,'','Đi tè','openCareStatsFromDashboard(\'pee\')')},
      poop:function(){return metric('poop','poop','💩',care.poop,'','Đi phân','openCareStatsFromDashboard(\'poop\')')},
      pump:function(){return metric('pump','pump','🥛',care.pumpMl,'ml','Hút sữa','openCareStatsFromDashboard(\'pump\')')},
      storedMilk:function(){return metric('storedMilk','milk','🧊',currentMap.storedMl,'ml','Kho sữa · '+milkBags.length+' túi','openCareStatsFromDashboard(\'milk\')')},
      medicine:function(){return metric('medicine','medicine','💊',care.medicine,'','Uống thuốc','openCareStatsFromDashboard(\'medicine\')')},
      temperature:function(){return metric('temperature','temperature','🌡️',care.latestTemperature===null?'--':care.latestTemperature,'°C','Đã đo '+care.temperatureCount+(dashboardGoalStatus(cfg,'temperature',currentMap)?(' / '+smartNum(dashboardGoalStatus(cfg,'temperature',currentMap).target,1)+' lần'):' lần'),'openCareStatsFromDashboard(\'temperature\')')},
      spitup:function(){return metric('spitup','spitup','🤮',care.spitup,'','Trớ sữa','openCareStatsFromDashboard(\'spitup\')')},
      urgentMilk:function(){return metric('urgentMilk','urgent','🟡',urgent,' túi','Sắp hết hạn <48h','openCareStatsFromDashboard(\'milk\')')},
      schedule:function(){return metric('schedule','schedule','📅',scheduleTodayTomorrow,'','Lịch hôm nay/mai','goTab(\'scheduleCalendar\')')}
    };
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">❤️</span><span>'+esc(dashTitle('todayCare','Chăm sóc hôm nay'))+'</span></div><button class="bcAction" onclick="openCareStatsFromDashboard()">Thống kê ›</button></div><div class="bcTodayGrid">';
    (cfg.careMetrics||defaultCareMetrics()).forEach(function(m){if(m.visible!==false&&renderers[m.id])h+=renderers[m.id]()});
    h+='</div></section>';return h;
  };
  blocks.alerts=function(){
    var alertList=evaluateSmartAlerts(db),summary=smartAlertSummary(alertList);
    return '<section class="smartAlertSummary '+esc(summary.severity)+'" role="button" tabindex="0" onclick="openSmartAlertCenter()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openSmartAlertCenter()}"><div class="smartAlertSummaryIcon">'+esc(summary.icon)+'</div><div class="smartAlertSummaryText"><b>'+esc(summary.title)+'</b><small>'+esc(summary.sub)+'</small></div><div class="smartAlertSummaryGo">Xem ›</div></section>';
  };
  blocks.growth=function(){
    if(st.birthDate&&!latestB)return '';
    return '<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">📈</span><span>'+esc(dashTitle('growth','Sự phát triển của bé'))+'</span></div><button class="bcAction" onclick="goTab(\'babyStats\')">Xem chi tiết ›</button></div><div class="bcGrowthGrid"><div class="bcGrowthItem"><div class="gi">⚖️</div><small>Cân nặng</small><b>'+esc(weight)+' '+(weight!=='--'?'kg':'')+'</b>'+deltaLabel(weight,prevB&&prevB.weight,'kg')+'</div><div class="bcGrowthItem"><div class="gi">📏</div><small>Chiều dài</small><b>'+esc(length)+' '+(length!=='--'?'cm':'')+'</b>'+deltaLabel(length,prevB&&(prevB.length||prevB.height),'cm')+'</div><div class="bcGrowthItem"><div class="gi">👶</div><small>Vòng đầu</small><b>'+esc(head)+' '+(head!=='--'?'cm':'')+'</b>'+deltaLabel(head,prevB&&prevB.head,'cm')+'</div></div></section>';
  };
  blocks.milestones=function(){
    var ms=(db.milestones||[]).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||''))});
    var latest=ms[0]||null;
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">🏆</span><span>'+esc(dashTitle('milestones','Hành trình lớn khôn'))+'</span></div><button class="bcAction" onclick="goTab(\'milestoneTimeline\')">Xem tất cả ›</button></div>';
    if(latest){
      var isRecent=daysBetween(latest.date,todayStr)>=0&&daysBetween(latest.date,todayStr)<=3;
      h+='<div class="msDashPreview'+(isRecent?' msDashNew':'')+'" role="button" tabindex="0" onclick="openMilestoneDetail(\''+latest.id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openMilestoneDetail(\''+latest.id+'\')}">';
      if(isRecent)h+='<div class="msDashBanner">🎉 Bé vừa đạt một cột mốc mới</div>';
      h+='<div class="msDashRow"><div class="msIcon">'+esc(latest.icon||'🏆')+'</div><div class="msBody"><b>'+esc(latest.title)+'</b><small>'+esc(fmtDate(latest.date))+'</small></div><div class="msChevron">'+(isRecent?'Xem ngay ›':'›')+'</div></div></div>';
    }else{
      h+='<div class="msDashEmpty">Chưa có cột mốc nào. Các mốc đáng nhớ của bé sẽ tự động xuất hiện ở đây 💗</div>';
    }
    h+='</section>';
    return h;
  };
  blocks.careJournal=function(){
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleMark" style="background:#62d99d"></span><span>'+esc(dashTitle('careJournal','Nhật ký chăm sóc'))+'</span></div><button class="bcAction" onclick="goTab(\'careTimeline\')">Xem tất cả ›</button></div><div class="bcTimeline">';
    if(careToday.length){
      careToday.forEach(function(x){var m=careTypeMeta(x.type);h+='<div class="bcTimeRow" onclick="openCareEventFromDashboard('+x._idx+')"><span class="bcDot"></span><div class="bcTime">'+esc(x.timeFrom||'--:--')+'</div><div class="bcActIcon">'+esc(m.icon)+'</div><div class="bcActText">'+esc(careEventText(x)||m.label)+'</div><div class="bcChevron">›</div></div>'});
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
  syncStreakWidget(db);
  syncVNClock();
  renderBottomNav(db);
}

function dashModuleDef(id){return DASHBOARD_MODULE_DEFS.find(function(d){return d.id===id})}
function renderDashboardConfig(){
  var db=load(),cfg=getDashboardConfig(db);
  if(byId('cfgFontScale'))byId('cfgFontScale').value=cfg.fontScale||'compact';
  if(byId('cfgNextFeedHours'))byId('cfgNextFeedHours').value=String(cfg.nextFeedHours);
  if(byId('cfgApptLookaheadDays'))byId('cfgApptLookaheadDays').value=String(cfg.apptLookaheadDays);
  if(byId('cfgBabyDescription'))byId('cfgBabyDescription').value=cfg.babyDescription||'';
  var list=byId('cfgModuleList');
  if(list){
    list.innerHTML=cfg.modules.map(function(m,idx){
      var def=dashModuleDef(m.id)||{label:m.id,icon:'▫️',desc:''};
      var locked=!!def.required;
      return '<div class="configModuleRow '+(locked?'locked':'')+'" data-mid="'+esc(m.id)+'"><input type="checkbox" '+(m.visible!==false||locked?'checked':'')+' '+(locked?'disabled':'')+'><div><b>'+esc(def.icon+' '+def.label)+' '+(def.desc?'<button type="button" class="infoIcon" data-info="'+esc(def.desc)+'" aria-label="Thông tin" onclick="event.stopPropagation();showInfoBubble(this)">i</button>':'')+'</b><label>Tên hiển thị</label><input class="cfgModuleTitle" placeholder="Để trống dùng tên gốc" value="'+esc((cfg.moduleTitles&&cfg.moduleTitles[m.id])||'')+'"></div><div class="configMoves"><button type="button" class="secondary" onclick="moveDashboardModule('+idx+',-1)">↑</button><button type="button" class="secondary" onclick="moveDashboardModule('+idx+',1)">↓</button></div></div>';
    }).join('');
  }
  var nav=byId('cfgBottomNavList');
  if(nav){
    var current=(cfg.bottomNav||['careTimeline','careAdd','scheduleCalendar','more']).slice(0,4);
    while(current.length<4)current.push(['careTimeline','careAdd','scheduleCalendar','more'][current.length]);
    nav.innerHTML=current.map(function(val,i){
      return '<div><label>Vị trí '+(i+2)+' trên taskbar</label><select id="cfgBottom_'+i+'">'+BOTTOM_NAV_OPTIONS.map(function(o){return '<option value="'+esc(o.id)+'" '+(o.id===val?'selected':'')+'>'+esc(o.icon+' '+o.label)+'</option>'}).join('')+'</select></div>';
    }).join('');
  }
  var metricBox=byId('cfgCareMetricsList');
  if(metricBox){
    metricBox.innerHTML=(cfg.careMetrics||defaultCareMetrics()).map(function(m,idx){var def=careMetricDef(m.id)||{label:m.id,icon:'▫️'};return '<div class="configModuleRow" data-care-metric="'+esc(m.id)+'"><input type="checkbox" '+(m.visible!==false?'checked':'')+'><div><b>'+esc(def.icon+' '+def.label)+'</b><small>Hiển thị trên block Chăm sóc hôm nay</small></div><div class="configMoves"><button type="button" class="secondary" onclick="moveCareMetric('+idx+',-1)">↑</button><button type="button" class="secondary" onclick="moveCareMetric('+idx+',1)">↓</button></div></div>'}).join('');
  }

  var smartBox=byId('cfgSmartAlertsList');
  if(smartBox){
    var smartCfg=normalizeSmartAlertConfig(cfg.smartAlerts);
    if(byId('cfgSmartAlertsEnabled'))byId('cfgSmartAlertsEnabled').checked=smartCfg.enabled!==false;
    function severityOptions(value){return ['critical','warning','info'].map(function(x){return '<option value="'+x+'" '+(x===value?'selected':'')+'>'+smartAlertSeverityMeta(x).label+'</option>'}).join('')}
    smartBox.innerHTML=SMART_ALERT_RULE_DEFS.map(function(def){
      var r=smartCfg.rules[def.id]||{},extra='';
      if(def.id==='temperatureHigh')extra='<div><label>Ngưỡng (°C)</label><input class="sarValue" data-field="threshold" type="number" min="35" max="45" step="0.1" value="'+esc(r.threshold)+'"></div>';
      if(def.id==='feedOverdue')extra='<div><label>Nhắc sau (phút)</label><input class="sarValue" data-field="graceMinutes" type="number" min="0" max="240" step="5" value="'+esc(r.graceMinutes)+'"></div>';
      if(def.id==='sleepTooLong')extra='<div><label>Tối đa (giờ)</label><input class="sarValue" data-field="maxHours" type="number" min="0.5" max="24" step="0.5" value="'+esc(r.maxHours)+'"></div>';
      if(def.id==='milkExpiring')extra='<div><label>Trước hạn (giờ)</label><input class="sarValue" data-field="beforeHours" type="number" min="1" max="168" step="1" value="'+esc(r.beforeHours)+'"></div>';
      if(def.id==='appointmentSoon')extra='<div><label>Trước lịch (giờ)</label><input class="sarValue" data-field="beforeHours" type="number" min="0" max="168" step="1" value="'+esc(r.beforeHours)+'"></div>';
      return '<div class="smartAlertRuleRow" data-rule-id="'+esc(def.id)+'"><label class="smartAlertRuleName"><input type="checkbox" '+(r.enabled!==false?'checked':'')+'> '+esc(def.icon+' '+def.label)+'</label><div><label>Mức độ</label><select class="sarSeverity">'+severityOptions(r.severity)+'</select></div>'+extra+'</div>';
    }).join('');
  }

  var goalsBox=byId('cfgCareGoalsList');
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
  var nextFeedInput=byId('cfgNextFeedHours');
  var nextFeedHours=nextFeedInput?Number(String(nextFeedInput.value).replace(',','.')):NaN;
  if(isFinite(nextFeedHours)&&nextFeedHours>=0.5&&nextFeedHours<=24){cfg.nextFeedHours=nextFeedHours;}
  var apptLookaheadInput=byId('cfgApptLookaheadDays');
  var apptLookaheadDays=apptLookaheadInput?Number(String(apptLookaheadInput.value).replace(',','.')):NaN;
  if(isFinite(apptLookaheadDays)&&apptLookaheadDays>=0&&apptLookaheadDays<=365){cfg.apptLookaheadDays=Math.round(apptLookaheadDays);}
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
  var metricRows=[].slice.call(document.querySelectorAll('#cfgCareMetricsList [data-care-metric]'));
  if(metricRows.length)cfg.careMetrics=metricRows.map(function(row){var cb=row.querySelector('input[type="checkbox"]');return {id:row.getAttribute('data-care-metric'),visible:!!(cb&&cb.checked)}});
  cfg.careGoals=defaultCareGoals();
  [].slice.call(document.querySelectorAll('#cfgCareGoalsList .careGoalRow')).forEach(function(row){
    var id=row.getAttribute('data-goal-id'),def=careGoalDef(id);
    if(!def)return;
    var cb=row.querySelector('input[type="checkbox"]'),mode=row.querySelector('.cgMode'),target=row.querySelector('.cgTarget');
    cfg.careGoals[id]={enabled:!!(cb&&cb.checked),mode:(mode&&mode.value)||def.defaultMode,target:(target&&target.value)||''};
  });

  var smartEnabled=byId('cfgSmartAlertsEnabled'),smart=normalizeSmartAlertConfig(cfg.smartAlerts);
  smart.enabled=smartEnabled?smartEnabled.checked:true;
  [].slice.call(document.querySelectorAll('#cfgSmartAlertsList .smartAlertRuleRow')).forEach(function(row){
    var id=row.getAttribute('data-rule-id'),r=Object.assign({},smart.rules[id]||{});
    var cb=row.querySelector('input[type="checkbox"]'),sev=row.querySelector('.sarSeverity');
    r.enabled=!!(cb&&cb.checked);r.severity=(sev&&sev.value)||r.severity||'warning';
    row.querySelectorAll('.sarValue').forEach(function(input){
      var field=input.getAttribute('data-field'),n=Number(String(input.value).replace(',','.'));
      if(isFinite(n))r[field]=n;
    });
    smart.rules[id]=r;
  });
  cfg.smartAlerts=smart;

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
function moveCareMetric(idx,dir){
  var db=load(),cfg=readDashboardConfigFromForm(),next=idx+dir;if(next<0||next>=cfg.careMetrics.length)return;
  var tmp=cfg.careMetrics[idx];cfg.careMetrics[idx]=cfg.careMetrics[next];cfg.careMetrics[next]=tmp;saveDashboardConfigObject(db,cfg);renderDashboardConfig();
}
function resetCareMetricConfig(){var db=load(),cfg=getDashboardConfig(db);cfg.careMetrics=defaultCareMetrics();saveDashboardConfigObject(db,cfg);renderDashboardConfig();toast('Đã khôi phục chỉ số mặc định','success')}
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
function render(){var db=load(),s=db.settings||{};['lmp','birthDate','birthTimeFrom','birthTimeTo','birthHospital','babyName','officialName','babySex'].forEach(function(id){setVal(id,s[id]||'')});if(byId('birthTimeFrom')&&!byId('birthTimeFrom').value&&s.birthTime)byId('birthTimeFrom').value=s.birthTime;if(byId('showOfficialName'))byId('showOfficialName').checked=s.showOfficialName!==false;renderBabyAvatarSetting(s.avatarDataUrl||'');document.documentElement.setAttribute('data-theme',s.theme||'');updateThemeButton();['pDate','bDate','aDate','calendarBaseDate','cDate','cEndDate','careStatsDate'].forEach(function(id){if(byId(id)&&!byId(id).value)byId(id).value=today()});renderDashboard(db);renderPregnancyStats(db);renderBabyStats(db);renderPregnancyChart(db);renderBabyChart(db);renderAppointmentList(db);renderAppointmentCalendar(db);renderAppointmentTypes(db);renderMilkContainers(db);renderCareTimeline(db);renderCareStats(db);renderMilestoneTimeline(db);renderMonthlyJourney(db);renderStatsCompare(db);renderYearSummary(db);renderList('pregnancyList',db.pregnancy,'pregnancy',function(x){return '<b>'+fmtDate(x.date)+' - '+esc(x.week||'')+'</b><small>EFW '+esc(x.weight)+' | BPD '+esc(x.bpd)+' | HC '+esc(x.hc)+' | AC '+esc(x.ac)+' | FL '+esc(x.fl)+' | AFI '+esc(x.afi)+' | Ngôi '+esc(x.position)+'</small><p>'+esc(x.note)+'</p>'});renderList('babyList',db.baby,'baby',function(x){return '<b>'+fmtDate(x.date)+'</b><small>Cân nặng '+esc(x.weight)+' | Dài '+esc(x.length)+' | Vòng đầu '+esc(x.head)+' | Bú '+esc(x.feed)+' | Ngủ '+esc(x.sleep)+'</small><p>'+esc(x.note)+'</p>'});updateBackup();renderCloudConfig()}
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

function closeInfoBubble(){var b=byId('infoBubblePopover');if(b)b.remove();document.removeEventListener('click',closeInfoBubbleOutside,true);window.removeEventListener('resize',closeInfoBubble);window.removeEventListener('scroll',closeInfoBubble,true)}
function closeInfoBubbleOutside(e){var b=byId('infoBubblePopover');if(b&&!b.contains(e.target))closeInfoBubble()}
function showInfoBubble(anchor){
  var existing=byId('infoBubblePopover');
  var wasOpenForThis=existing&&existing.__anchor===anchor;
  closeInfoBubble();
  if(wasOpenForThis)return;
  var text=anchor.getAttribute('data-info')||'';
  if(!text)return;
  var bubble=document.createElement('div');
  bubble.id='infoBubblePopover';
  bubble.className='infoBubble';
  bubble.setAttribute('role','tooltip');
  bubble.innerHTML='<div class="infoBubbleArrow"></div><div class="infoBubbleText"></div>';
  bubble.querySelector('.infoBubbleText').textContent=text;
  bubble.__anchor=anchor;
  document.body.appendChild(bubble);
  var r=anchor.getBoundingClientRect(),bw=bubble.offsetWidth;
  var maxLeft=window.scrollX+document.documentElement.clientWidth-bw-12;
  var left=Math.min(Math.max(12,r.left+window.scrollX-8),Math.max(12,maxLeft));
  var top=r.bottom+window.scrollY+8;
  bubble.style.left=left+'px';
  bubble.style.top=top+'px';
  var arrow=bubble.querySelector('.infoBubbleArrow');
  arrow.style.left=Math.max(10,(r.left+window.scrollX-left)+8)+'px';
  setTimeout(function(){document.addEventListener('click',closeInfoBubbleOutside,true);window.addEventListener('resize',closeInfoBubble);window.addEventListener('scroll',closeInfoBubble,true)},0);
}
function vnTimeString(){try{return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}catch(e){var d=new Date(Date.now()+7*3600000);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')+':'+String(d.getUTCSeconds()).padStart(2,'0')}}
function syncVNClock(){var el=byId('vnClock');if(el)el.textContent=vnTimeString();syncSleepElapsedUI();syncNextFeedUI()}
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
var cloudRealtimeClient=null;
var cloudRealtimeChannel=null;
var cloudRealtimeState='OFF';
var cloudApplyingRemote=false;
var CLOUD_DEVICE_KEY='meYeuBeDeviceId_v1';

function cloudDeviceId(){
  var id=localStorage.getItem(CLOUD_DEVICE_KEY);
  if(!id){
    id='dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
    localStorage.setItem(CLOUD_DEVICE_KEY,id);
  }
  return id;
}
function cloudSetRealtimeState(state,message){
  cloudRealtimeState=state||'OFF';
  var p=byId('cloudNetworkStatus');
  if(p){
    p.textContent=cloudRealtimeState;
    p.classList.toggle('off',cloudRealtimeState!=='REALTIME');
  }
  if(message)cloudLog(message,cloudRealtimeState==='REALTIME'?'success':undefined);
}

function cloudDefaultCfg(){
  return {enabled:false,url:CLOUD_DEFAULT_URL,anonKey:CLOUD_DEFAULT_KEY,syncId:'main',lastPulledAt:'',lastPushedAt:'',realtime:true,lastRevision:0};
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
  if(t)t.textContent=cfg.enabled?'Đang bật đồng bộ Realtime':'Chưa bật đồng bộ';
  if(s)s.textContent=cfg.enabled?('Sync ID: '+(cfg.syncId||'--')+' · Thiết bị: '+cloudDeviceId().slice(-6)+' · Push: '+(cfg.lastPushedAt?new Date(cfg.lastPushedAt).toLocaleString('vi-VN'):'chưa có')):'Nhập Supabase URL, Publishable key và Sync ID rồi bấm Lưu cấu hình.';
  if(p){p.textContent=cfg.enabled?'ON':'OFF';p.classList.toggle('off',!cfg.enabled)}
  cloudSetRealtimeState(cfg.enabled?(cloudRealtimeState||'CONNECTING'):'OFF');
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
    cloudRealtimeRestart();
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
async function cloudRequestJson(url,options,label){
  var res=await fetch(url,options||{});
  var text=await res.text();
  var data=null;
  try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!res.ok){
    var detail=typeof data==='string'?data:JSON.stringify(data||{});
    throw new Error((label||'Cloud request')+' lỗi '+res.status+': '+detail);
  }
  return data;
}
function cloudNormalizeRow(row){
  if(!row)return null;
  return {syncId:row.id!=null?row.id:row.sync_id,payload:row.data!=null?row.data:row.payload,updatedAt:row.updated_at||''};
}
function cloudIsMissingColumnError(err,column){
  var msg=String(err&&err.message||err||'');
  return msg.indexOf('PGRST204')>=0&&msg.indexOf("'"+column+"'")>=0;
}
async function cloudFetchRow(cfg){
  cloudValidateCfg(cfg);
  var base=cloudEndpoint(cfg);
  try{
    var url=base+'?id=eq.'+encodeURIComponent(cfg.syncId)+'&select=id,data,updated_at';
    var rows=await cloudRequestJson(url,{headers:cloudHeaders(cfg)},'Cloud fetch');
    return cloudNormalizeRow(rows&&rows[0]?rows[0]:null);
  }catch(e){
    if(!cloudIsMissingColumnError(e,'id')&&!cloudIsMissingColumnError(e,'data'))throw e;
    var legacyUrl=base+'?sync_id=eq.'+encodeURIComponent(cfg.syncId)+'&select=sync_id,payload,updated_at';
    var legacyRows=await cloudRequestJson(legacyUrl,{headers:cloudHeaders(cfg)},'Cloud fetch legacy');
    return cloudNormalizeRow(legacyRows&&legacyRows[0]?legacyRows[0]:null);
  }
}

function cloudRecordKey(item,index){
  if(!item||typeof item!=='object')return 'primitive_'+index+'_'+JSON.stringify(item);
  return String(item.id||item.uuid||item.createdAt||item.updatedAt||
    [item.type,item.date,item.startDate,item.startTime,item.time,item.title,item.name,item.bagCode,index].join('|'));
}
function cloudMergeArray(remoteArr,localArr){
  var map=new Map();
  (Array.isArray(remoteArr)?remoteArr:[]).forEach(function(item,index){map.set(cloudRecordKey(item,index),item)});
  (Array.isArray(localArr)?localArr:[]).forEach(function(item,index){
    var key=cloudRecordKey(item,index),old=map.get(key);
    if(!old){map.set(key,item);return}
    var oldTime=Date.parse(old.updatedAt||old.createdAt||0)||0;
    var newTime=Date.parse(item.updatedAt||item.createdAt||0)||0;
    map.set(key,newTime>=oldTime?item:old);
  });
  return Array.from(map.values());
}
function cloudMergePayloads(remote,local){
  remote=normalize(JSON.parse(JSON.stringify(remote||{})));
  local=normalize(JSON.parse(JSON.stringify(local||{})));
  var out=Object.assign({},remote,local);
  Object.keys(Object.assign({},remote,local)).forEach(function(key){
    if(Array.isArray(remote[key])||Array.isArray(local[key]))out[key]=cloudMergeArray(remote[key],local[key]);
  });
  out.settings=Object.assign({},remote.settings||{},local.settings||{});
  out._cloudRevision=Math.max(Number(remote._cloudRevision||0),Number(local._cloudRevision||0));
  out._localUpdatedAt=local._localUpdatedAt||remote._localUpdatedAt||new Date().toISOString();
  return normalize(out);
}

function cloudPreparePayload(payload,cfg){
  var out=normalize(JSON.parse(JSON.stringify(payload||{})));
  var currentRevision=Number((cfg&&cfg.lastRevision)||out._cloudRevision||0);
  out._cloudRevision=currentRevision+1;
  out._cloudDeviceId=cloudDeviceId();
  out._cloudUpdatedAt=new Date().toISOString();
  return out;
}
async function cloudUpsertPayload(cfg,payload){
  cloudValidateCfg(cfg);
  var prepared=cloudPreparePayload(payload,cfg);
  var now=prepared._cloudUpdatedAt;
  var headers=Object.assign({},cloudHeaders(cfg),{'Prefer':'resolution=merge-duplicates,return=representation'});
  var result;
  try{
    result=await cloudRequestJson(cloudEndpoint(cfg),{method:'POST',headers:headers,body:JSON.stringify({id:cfg.syncId,data:prepared,updated_at:now})},'Cloud upsert');
  }catch(e){
    if(!cloudIsMissingColumnError(e,'id')&&!cloudIsMissingColumnError(e,'data'))throw e;
    result=await cloudRequestJson(cloudEndpoint(cfg),{method:'POST',headers:headers,body:JSON.stringify({sync_id:cfg.syncId,payload:prepared,updated_at:now})},'Cloud upsert legacy');
  }
  cfg.lastRevision=prepared._cloudRevision;
  saveCloudConfigToStorage(cfg);
  return {result:result,payload:prepared};
}


function cloudRealtimeStop(){
  try{
    if(cloudRealtimeClient&&cloudRealtimeChannel)cloudRealtimeClient.removeChannel(cloudRealtimeChannel);
  }catch(e){}
  cloudRealtimeChannel=null;
  cloudRealtimeClient=null;
  cloudSetRealtimeState('OFF');
}
function cloudApplyRemotePayload(payload,updatedAt,source){
  if(!payload)return false;
  var cfg=loadCloudConfig();
  var remoteRevision=Number(payload._cloudRevision||0);
  var local=normalize(load());
  var localRevision=Number(local._cloudRevision||0);
  if(payload._cloudDeviceId===cloudDeviceId())return false;
  if(remoteRevision&&remoteRevision<=localRevision)return false;
  cloudApplyingRemote=true;
  try{
    var next=normalize(payload);
    next._cloudUpdatedAt=updatedAt||next._cloudUpdatedAt||new Date().toISOString();
    localStorage.setItem(KEY,JSON.stringify(next));
    cfg.lastPulledAt=new Date().toISOString();
    cfg.lastRevision=Math.max(Number(cfg.lastRevision||0),remoteRevision);
    saveCloudConfigToStorage(cfg);
    render();
    cloudLog('Đã nhận dữ liệu mới từ thiết bị khác'+(source?' · '+source:''),'success');
    return true;
  }finally{
    setTimeout(function(){cloudApplyingRemote=false},250);
  }
}
function cloudRealtimeHandlePayload(payload){
  try{
    var row=payload&&payload.new?payload.new:null;
    if(!row)return;
    var normalized=cloudNormalizeRow(row);
    if(normalized&&normalized.payload)cloudApplyRemotePayload(normalized.payload,normalized.updatedAt,'Realtime');
  }catch(e){
    cloudLog('Realtime xử lý dữ liệu thất bại: '+e.message,'error');
  }
}
function cloudRealtimeStart(){
  var cfg=loadCloudConfig();
  cloudRealtimeStop();
  if(!cfg.enabled||!navigator.onLine)return;
  if(!window.supabase||typeof window.supabase.createClient!=='function'){
    cloudSetRealtimeState('UNAVAILABLE');
    cloudLog('Không tải được thư viện Supabase Realtime. App vẫn dùng đồng bộ thủ công.','error');
    return;
  }
  try{
    cloudValidateCfg(cfg);
    cloudSetRealtimeState('CONNECTING');
    cloudRealtimeClient=window.supabase.createClient(cfg.url,cfg.anonKey,{
      auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
      realtime:{params:{eventsPerSecond:5}}
    });
    cloudRealtimeChannel=cloudRealtimeClient
      .channel('meyeube_'+cfg.syncId+'_'+cloudDeviceId())
      .on('postgres_changes',{
        event:'*',
        schema:'public',
        table:CLOUD_TABLE,
        filter:'id=eq.'+cfg.syncId
      },cloudRealtimeHandlePayload)
      .subscribe(function(status){
        if(status==='SUBSCRIBED')cloudSetRealtimeState('REALTIME','Đã kết nối');
        else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')cloudSetRealtimeState('RETRYING');
        else if(status==='CLOSED')cloudSetRealtimeState('OFF');
      });
  }catch(e){
    cloudSetRealtimeState('ERROR');
    cloudLog('Không thể bật Realtime: '+e.message,'error');
  }
}
function cloudRealtimeRestart(){
  setTimeout(cloudRealtimeStart,100);
}

async function testCloudConnection(){
  var cfg=loadCloudConfig();
  try{
    showAppLoading();
    await cloudFetchRow(cfg);
    cloudLog('Kết nối Supabase OK','success');
    cloudRealtimeRestart();
  }catch(e){
    cloudLog('Test thất bại: '+e.message,'error');
  }finally{hideAppLoading();renderCloudConfig()}
}
async function pushLocalToCloud(){
  var cfg=loadCloudConfig();
  var ok=confirm('⚠️ ĐẨY DỮ LIỆU LÊN CLOUD\n\nDữ liệu trên Cloud có cùng Sync ID "'+(cfg.syncId||'main')+'" sẽ bị thay thế bằng dữ liệu trên thiết bị này.\n\nChỉ tiếp tục khi thiết bị này đang có dữ liệu đầy đủ và mới nhất.\n\nBạn có chắc muốn đẩy lên Cloud?');
  if(!ok){cloudLog('Đã huỷ thao tác đẩy dữ liệu lên Cloud');return}
  try{
    showAppLoading();
    var db=normalize(load());
    db._localUpdatedAt=db._localUpdatedAt||new Date().toISOString();
    var pushed=await cloudUpsertPayload(cfg,db);
    if(pushed&&pushed.payload)localStorage.setItem(KEY,JSON.stringify(pushed.payload));
    cfg.lastPushedAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
    cloudLog('Đã đẩy dữ liệu local lên Cloud','success');
  }catch(e){cloudLog('Đẩy Cloud thất bại: '+e.message,'error')}
  finally{hideAppLoading();renderCloudConfig()}
}

async function pullCloudToLocal(){
  var cfg=loadCloudConfig();
  var ok=confirm('⚠️ TẢI DỮ LIỆU CLOUD VỀ THIẾT BỊ\n\nDữ liệu hiện tại trên thiết bị sẽ bị thay thế bằng dữ liệu trên Cloud của Sync ID "'+(cfg.syncId||'main')+'".\n\nNên Xuất JSON backup trước khi tiếp tục.\n\nBạn có chắc muốn tải Cloud về?');
  if(!ok){cloudLog('Đã huỷ thao tác tải dữ liệu Cloud về');return}
  try{
    showAppLoading();
    var row=await cloudFetchRow(cfg);
    if(!row||!row.payload){cloudLog('Cloud chưa có dữ liệu để kéo về','error');return}
    var db=normalize(row.payload);
    db._cloudUpdatedAt=row.updatedAt||new Date().toISOString();
    localStorage.setItem(KEY,JSON.stringify(db));
    cfg.lastRevision=Math.max(Number(cfg.lastRevision||0),Number(db._cloudRevision||0));
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
    if(!row||!row.payload){var firstPush=await cloudUpsertPayload(cfg,local);if(firstPush&&firstPush.payload)localStorage.setItem(KEY,JSON.stringify(firstPush.payload));cloudLog('Cloud trống: đã đẩy local lên Cloud','success');return}
    var localTime=Date.parse(local._localUpdatedAt||0)||0;
    var cloudTime=Date.parse(row.updatedAt||0)||0;
    if(cloudTime>localTime){
      localStorage.setItem(KEY,JSON.stringify(normalize(row.payload)));
      cfg.lastPulledAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
      cloudLog('Cloud mới hơn: đã cập nhật dữ liệu về máy','success');
      render();
    }else{
      var syncedPush=await cloudUpsertPayload(cfg,local);
      if(syncedPush&&syncedPush.payload)localStorage.setItem(KEY,JSON.stringify(syncedPush.payload));
      cfg.lastPushedAt=new Date().toISOString();saveCloudConfigToStorage(cfg);
      cloudLog('Local mới hơn hoặc bằng: đã đẩy lên Cloud','success');
    }
  }catch(e){cloudLog('Đồng bộ thất bại: '+e.message,'error')}
  finally{hideAppLoading();renderCloudConfig()}
}
function cloudAutoPush(db){
  var cfg=loadCloudConfig();
  if(cloudApplyingRemote||!cfg.enabled||!navigator.onLine)return;
  clearTimeout(cloudPushTimer);
  cloudPushTimer=setTimeout(async function(){
    try{
      var local=normalize(db||load());
      var row=await cloudFetchRow(cfg);
      if(row&&row.payload&&row.payload._cloudDeviceId!==cloudDeviceId()){
        var remoteRevision=Number(row.payload._cloudRevision||0);
        var localRevision=Number(local._cloudRevision||0);
        if(remoteRevision>localRevision){
          local=cloudMergePayloads(row.payload,local);
          cfg.lastRevision=Math.max(Number(cfg.lastRevision||0),remoteRevision);
          cloudLog('Đã gộp dữ liệu Cloud mới hơn trước khi tự động đẩy');
        }
      }
      var pushed=await cloudUpsertPayload(cfg,local);
      if(pushed&&pushed.payload)localStorage.setItem(KEY,JSON.stringify(pushed.payload));
      cfg.lastPushedAt=new Date().toISOString();
      saveCloudConfigToStorage(cfg);
    }catch(e){
      console.warn('Cloud auto push failed',e);
      cloudLog('Tự động đẩy Cloud thất bại: '+e.message,'error');
    }
  },1200);
}
async function cloudAutoPullOnBoot(){
  var cfg=loadCloudConfig();
  if(!cfg.enabled||!navigator.onLine)return;
  try{
    var row=await cloudFetchRow(cfg);
    if(row&&row.payload){
      var local=normalize(load());
      var localTime=Date.parse(local._localUpdatedAt||0)||0;
      var cloudTime=Date.parse(row.updatedAt||0)||0;
      if(cloudTime>localTime){
        localStorage.setItem(KEY,JSON.stringify(normalize(row.payload)));
        cfg.lastPulledAt=new Date().toISOString();
        cfg.lastRevision=Math.max(Number(cfg.lastRevision||0),Number(row.payload._cloudRevision||0));
        saveCloudConfigToStorage(cfg);
        render();
        showToast('Đã cập nhật dữ liệu','success');
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

/* V10.9.1: Pull-to-refresh (kéo xuống để xoá cache & làm mới dữ liệu, không reload lại app) */
function initPullToRefresh(){
  var indicator=byId('pullToRefreshIndicator');if(!indicator)return;
  var label=indicator.querySelector('.ptrLabel');
  var MAX_PULL=88,THRESHOLD=64,RESISTANCE=0.45;
  var startY=0,pullPx=0,dragging=false,pulling=false,refreshing=false;

  function lockedByUi(){
    return document.body.classList.contains('careModalOpen')||document.body.classList.contains('menuOpen');
  }
  function atTop(){
    return (window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0)<=0;
  }
  function applyPull(px,ready){
    document.body.style.transition='none';
    document.body.style.transform=px>0?'translateY('+px+'px)':'';
    indicator.style.opacity=String(Math.min(1,px/40));
    var spin=Math.min(1,px/THRESHOLD)*220;
    indicator.querySelector('.ptrSpinner').style.transform='rotate('+spin+'deg)';
    if(label)label.textContent=ready?'Thả để làm mới':'Kéo để làm mới';
    indicator.classList.toggle('ptrReady',!!ready);
  }
  function reset(){
    document.body.style.transition='transform .22s ease';
    document.body.style.transform='';
    indicator.style.transition='opacity .22s ease';
    indicator.style.opacity='0';
    setTimeout(function(){document.body.style.transition='';indicator.style.transition=''},240);
    pullPx=0;dragging=false;pulling=false;
  }
  function startLoading(){
    refreshing=true;pulling=false;dragging=false;
    indicator.classList.add('ptrLoading');
    indicator.classList.remove('ptrReady');
    if(label)label.textContent='Đang làm mới...';
    document.body.style.transition='transform .18s ease';
    document.body.style.transform='translateY(56px)';
    indicator.style.opacity='1';
    indicator.querySelector('.ptrSpinner').style.transform='';
    var minDelay=new Promise(function(res){setTimeout(res,550)});
    Promise.all([performPullToRefresh(),minDelay]).finally(function(){
      refreshing=false;
      indicator.classList.remove('ptrLoading');
      reset();
    });
  }

  document.addEventListener('touchstart',function(e){
    if(refreshing||lockedByUi()||!atTop())return;
    var t=e.touches&&e.touches[0];if(!t)return;
    startY=t.clientY;dragging=true;pulling=false;pullPx=0;
  },{passive:true});

  document.addEventListener('touchmove',function(e){
    if(!dragging||refreshing)return;
    var t=e.touches&&e.touches[0];if(!t)return;
    var delta=t.clientY-startY;
    if(delta<=0||!atTop()){if(pulling)reset();else dragging=false;return}
    pulling=true;
    pullPx=Math.min(MAX_PULL,delta*RESISTANCE);
    applyPull(pullPx,pullPx>=THRESHOLD);
    if(e.cancelable)e.preventDefault();
  },{passive:false});

  function onRelease(){
    if(!dragging){return}
    dragging=false;
    if(!pulling){return}
    if(pullPx>=THRESHOLD)startLoading();else reset();
    pulling=false;
  }
  document.addEventListener('touchend',onRelease,{passive:true});
  document.addEventListener('touchcancel',onRelease,{passive:true});
}
async function performPullToRefresh(){
  try{
    if('caches' in window){
      var keys=await caches.keys();
      await Promise.all(keys.map(function(k){return caches.delete(k)}));
    }
  }catch(e){}
  try{
    if('serviceWorker' in navigator){
      var reg=await navigator.serviceWorker.getRegistration();
      if(reg)await reg.update();
    }
  }catch(e){}
  try{await cloudAutoPullOnBoot()}catch(e){}
  try{render()}catch(e){}
  showToast('Đã làm mới dữ liệu','success');
}

function initMobileZoomGuard(){
  var lastTouchEnd=0;
  document.addEventListener('touchend',function(e){
    var now=Date.now();
    if(now-lastTouchEnd<=300)e.preventDefault();
    lastTouchEnd=now;
  },{passive:false});
  document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});
  document.addEventListener('dblclick',function(e){e.preventDefault()},{passive:false});
}

window.addEventListener('online',function(){cloudSetRealtimeState('CONNECTING');cloudAutoPullOnBoot().finally(cloudRealtimeStart)});
window.addEventListener('offline',function(){cloudRealtimeStop();cloudSetRealtimeState('OFFLINE')});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')cloudRealtimeStart()});

function normalizeMilestone(m){
  m=m||{};
  return {
    id:m.id||newCareId('MS'),
    key:m.key||null,
    category:m.category||'manual',
    icon:m.icon||'🏆',
    title:m.title||'',
    date:m.date||today(),
    time:m.time||'',
    description:m.description||'',
    note:m.note||'',
    photos:Array.isArray(m.photos)?m.photos.slice(0,20):[],
    auto:!!m.auto,
    createdAt:m.createdAt||new Date().toISOString(),
    updatedAt:m.updatedAt||m.createdAt||new Date().toISOString()
  };
}
var MILESTONE_CATEGORY_META={
  age:{label:'Theo tuổi',icon:'🎂'},
  feed:{label:'Bé bú',icon:'🍼'},
  sleep:{label:'Ngủ',icon:'😴'},
  pump:{label:'Hút sữa',icon:'🤱'},
  growth:{label:'Phát triển',icon:'📈'},
  vaccine:{label:'Vaccine',icon:'💉'},
  manual:{label:'Thủ công',icon:'🏆'}
};
function milestoneCategoryLabel(c){return (MILESTONE_CATEGORY_META[c]||{}).label||'Khác'}
function milestoneExists(db,key){if(!key)return false;return (db.milestones||[]).some(function(m){return m.key===key})}
function dedupeMilestonesByKey(list){
  var byKey={},order=[],result=[];
  (Array.isArray(list)?list:[]).forEach(function(m){
    if(!m)return;
    if(!m.key){result.push(m);return}
    if(!byKey[m.key]){byKey[m.key]=m;order.push(m.key);return}
    var kept=byKey[m.key];
    var keptTime=Date.parse(kept.createdAt||0)||0;
    var curTime=Date.parse(m.createdAt||0)||0;
    var canonical=curTime<keptTime?m:kept;
    var other=canonical===kept?m:kept;
    var photos=(canonical.photos||[]).slice();
    (other.photos||[]).forEach(function(p){if(photos.indexOf(p)<0)photos.push(p)});
    canonical.photos=photos.slice(0,20);
    if(!canonical.note&&other.note)canonical.note=other.note;
    byKey[m.key]=canonical;
  });
  order.forEach(function(k){result.push(byKey[k])});
  return result;
}
function pushMilestoneNotification(db,m){
  if(window.__msSilent)return; /* V13.9.2: đang tính thử trên bản sao, không bắn thông báo */
  try{
    var h=loadNotificationHistory();
    var name=(db.settings&&db.settings.babyName)||'Bé';
    h.unshift({eventKey:'milestone_'+m.id,ruleId:'milestone',severity:'info',icon:m.icon||'🎉',title:'Chúc mừng!',message:name+' vừa đạt "'+m.title+'"',actionLabel:'Xem ngay',action:"openMilestoneDetail('"+m.id+"')",detailType:'',detailDate:'',createdAt:new Date().toISOString(),unread:true});
    saveNotificationHistory(h);
  }catch(e){}
}
function addMilestone(db,m){
  db.milestones=db.milestones||[];
  var rec=normalizeMilestone(Object.assign({},m,{id:newCareId('MS'),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));
  db.milestones.unshift(rec);
  pushMilestoneNotification(db,rec);
  return rec;
}
function addCalendarUnits(dateISO,years,months,days){
  var d=new Date((dateISO||today())+'T00:00:00');
  if(years)d.setFullYear(d.getFullYear()+years);
  if(months)d.setMonth(d.getMonth()+months);
  if(days)d.setDate(d.getDate()+days);
  return localDateISO(d);
}
function milestoneAgeTargets(birthDate){
  var targets=[];
  targets.push({key:'age_w1',days:7,label:'Tròn 1 tuần'});
  targets.push({key:'age_w2',days:14,label:'Tròn 2 tuần'});
  for(var mo=1;mo<=11;mo++){targets.push({key:'age_m'+mo,months:mo,label:'Tròn '+mo+' tháng'})}
  var ageYears=birthDate?Math.floor(daysBetween(birthDate,today())/365.25):0;
  var maxYear=Math.max(1,ageYears+1);
  for(var y=1;y<=maxYear;y++){targets.push({key:'age_y'+y,years:y,label:'Tròn '+y+' tuổi'})}
  return targets;
}
function milestoneAgeTargetDate(birthDate,t){
  if(t.days)return addCalendarUnits(birthDate,0,0,t.days);
  if(t.months)return addCalendarUnits(birthDate,0,t.months,0);
  if(t.years)return addCalendarUnits(birthDate,t.years,0,0);
  return birthDate;
}
function checkAgeMilestones(db){
  var st=db.settings||{};if(!st.birthDate)return false;
  var changed=false,targets=milestoneAgeTargets(st.birthDate),todayStr=today();
  targets.forEach(function(t){
    if(milestoneExists(db,t.key))return;
    var targetDate=milestoneAgeTargetDate(st.birthDate,t);
    if(targetDate<=todayStr){addMilestone(db,{key:t.key,category:'age',icon:'🎂',title:t.label,date:targetDate,description:t.label+' rồi nè!',auto:true});changed=true}
  });
  return changed;
}
function sortedFeedEvents(db){return (db.careEvents||[]).filter(function(x){return x&&x.type==='feed'}).slice().sort(function(a,b){return String((a.startDate||a.date||'')+(a.timeFrom||'')).localeCompare(String((b.startDate||b.date||'')+(b.timeFrom||'')))})}
var MILESTONE_FEED_FIRST_ML=[60,80,100,120,150,180];
var MILESTONE_FEED_COUNT_MILESTONES=[100,500,1000];
function checkFeedMilestones(db){
  var events=sortedFeedEvents(db);if(!events.length)return false;
  var changed=false,maxSoFar=0;
  MILESTONE_FEED_FIRST_ML.forEach(function(ml){
    var key='feed_first_'+ml;if(milestoneExists(db,key))return;
    var hit=events.filter(function(x){return Number(x.amount||0)>=ml})[0];
    if(hit){addMilestone(db,{key:key,category:'feed',icon:'🍼',title:'Lần đầu bú '+ml+'ml',date:hit.startDate||hit.date,time:timeFromOf(hit),description:'Lần đầu tiên bé bú được '+ml+'ml trong một cữ.',auto:true});changed=true}
  });
  MILESTONE_FEED_COUNT_MILESTONES.forEach(function(n){
    var key='feed_count_'+n;if(milestoneExists(db,key))return;
    if(events.length>=n){var rec=events[n-1];addMilestone(db,{key:key,category:'feed',icon:'🍼',title:'Hoàn thành '+n+' cữ bú',date:rec.startDate||rec.date,time:timeFromOf(rec),description:'Bé đã hoàn thành tổng cộng '+n+' cữ bú.',auto:true});changed=true}
  });
  events.forEach(function(x){
    var amt=Number(x.amount||0);
    if(amt>maxSoFar){
      maxSoFar=amt;var key='feed_record_'+amt;
      if(!milestoneExists(db,key)&&amt>0){addMilestone(db,{key:key,category:'feed',icon:'🍼',title:'Kỷ lục bú nhiều nhất: '+amt+'ml',date:x.startDate||x.date,time:timeFromOf(x),description:'Cữ bú nhiều nhất từ trước đến nay: '+amt+'ml.',auto:true});changed=true}
    }
  });
  return changed;
}
function completedSleepEvents(db){return (db.careEvents||[]).filter(function(x){return x&&x.type==='sleep'&&x.timeTo}).slice().sort(function(a,b){return String((a.startDate||a.date||'')+(a.timeFrom||'')).localeCompare(String((b.startDate||b.date||'')+(b.timeFrom||'')))})}
var MILESTONE_SLEEP_FIRST_HOURS=[4,5];
var MILESTONE_SLEEP_COUNT_MILESTONES=[100,500];
function isOvernightSleep(x){
  var startHour=Number(String(x.timeFrom||'0:0').split(':')[0]);
  var dur=Number(x.amount||0);
  var startsAtNight=startHour>=19||startHour<=3;
  return dur>=360&&startsAtNight;
}
function checkSleepMilestones(db){
  var events=completedSleepEvents(db);if(!events.length)return false;
  var changed=false;
  MILESTONE_SLEEP_FIRST_HOURS.forEach(function(hh){
    var key='sleep_first_h'+hh;if(milestoneExists(db,key))return;
    var mins=hh*60,hit=events.filter(function(x){return Number(x.amount||0)>=mins})[0];
    if(hit){addMilestone(db,{key:key,category:'sleep',icon:'😴',title:'Lần đầu ngủ '+hh+' giờ',date:hit.startDate||hit.date,time:timeFromOf(hit),description:'Lần đầu tiên bé ngủ liên tục '+hh+' giờ.',auto:true});changed=true}
  });
  if(!milestoneExists(db,'sleep_overnight')){
    var hitO=events.filter(isOvernightSleep)[0];
    if(hitO){addMilestone(db,{key:'sleep_overnight',category:'sleep',icon:'🌙',title:'Lần đầu ngủ xuyên đêm',date:hitO.startDate||hitO.date,time:timeFromOf(hitO),description:'Lần đầu tiên bé ngủ một giấc dài xuyên đêm.',auto:true});changed=true}
  }
  MILESTONE_SLEEP_COUNT_MILESTONES.forEach(function(n){
    var key='sleep_count_'+n;if(milestoneExists(db,key))return;
    if(events.length>=n){var rec=events[n-1];addMilestone(db,{key:key,category:'sleep',icon:'😴',title:'Tổng '+n+' giấc ngủ',date:rec.startDate||rec.date,time:timeFromOf(rec),description:'Bé đã có tổng cộng '+n+' giấc ngủ được ghi nhận.',auto:true});changed=true}
  });
  return changed;
}
function sortedPumpEvents(db){return (db.careEvents||[]).filter(function(x){return x&&x.type==='pump'}).slice().sort(function(a,b){return String((a.startDate||a.date||'')+(a.timeFrom||'')).localeCompare(String((b.startDate||b.date||'')+(b.timeFrom||'')))})}
var MILESTONE_PUMP_FIRST_ML=[200];
var MILESTONE_PUMP_TOTAL_L=[10,50,100];
function checkPumpMilestones(db){
  var events=sortedPumpEvents(db);if(!events.length)return false;
  var changed=false,maxSoFar=0;
  MILESTONE_PUMP_FIRST_ML.forEach(function(ml){
    var key='pump_first_'+ml;if(milestoneExists(db,key))return;
    var hit=events.filter(function(x){return Number(x.amount||0)>=ml})[0];
    if(hit){addMilestone(db,{key:key,category:'pump',icon:'🤱',title:'Lần đầu hút '+ml+'ml',date:hit.startDate||hit.date,time:timeFromOf(hit),description:'Lần đầu tiên hút được '+ml+'ml trong một lần.',auto:true});changed=true}
  });
  events.forEach(function(x){
    var amt=Number(x.amount||0);
    if(amt>maxSoFar){
      maxSoFar=amt;var key='pump_record_'+amt;
      if(!milestoneExists(db,key)&&amt>0){addMilestone(db,{key:key,category:'pump',icon:'🤱',title:'Kỷ lục hút sữa: '+amt+'ml',date:x.startDate||x.date,time:timeFromOf(x),description:'Lần hút được nhiều nhất từ trước đến nay: '+amt+'ml.',auto:true});changed=true}
    }
  });
  MILESTONE_PUMP_TOTAL_L.forEach(function(l){
    var key='pump_total_'+l+'l';if(milestoneExists(db,key))return;
    var target=l*1000,acc=0,hit=null;
    for(var i=0;i<events.length;i++){acc+=Number(events[i].amount||0);if(acc>=target){hit=events[i];break}}
    if(hit){addMilestone(db,{key:key,category:'pump',icon:'🤱',title:'Tổng hút đủ '+l+' lít sữa',date:hit.startDate||hit.date,time:timeFromOf(hit),description:'Tổng lượng sữa đã hút đạt '+l+' lít.',auto:true});changed=true}
  });
  return changed;
}
function sortedBabyGrowth(db){return (db.baby||[]).slice().sort(function(a,b){return String(a.date||'').localeCompare(String(b.date||''))})}
function parseGrowthNum(v){var n=parseFloat(String(v||'').replace(',','.'));return isFinite(n)?n:null}
function checkGrowthMilestones(db){
  var arr=sortedBabyGrowth(db);if(!arr.length)return false;
  var changed=false;
  for(var w=3;w<=20;w++){
    (function(w){
      var key='growth_w'+w+'kg';if(milestoneExists(db,key))return;
      var hit=arr.filter(function(x){var n=parseGrowthNum(x.weight);return n!==null&&n>=w})[0];
      if(hit){addMilestone(db,{key:key,category:'growth',icon:'⚖️',title:'Đạt '+w+'kg',date:hit.date,description:'Cân nặng của bé đạt '+w+'kg.',auto:true});changed=true}
    })(w);
  }
  for(var c=45;c<=110;c+=5){
    (function(c){
      var key='growth_c'+c+'cm';if(milestoneExists(db,key))return;
      var hit=arr.filter(function(x){var n=parseGrowthNum(x.length||x.height);return n!==null&&n>=c})[0];
      if(hit){addMilestone(db,{key:key,category:'growth',icon:'📏',title:'Đạt '+c+'cm',date:hit.date,description:'Chiều dài/chiều cao của bé đạt '+c+'cm.',auto:true});changed=true}
    })(c);
  }
  return changed;
}
/* V14.1.0 · Nguồn mũi tiêm của bé giờ là Sổ sức khỏe 2.0 (db.hb.members[rel='Con'].vaccines).
   Vẫn đọc thêm db.healthBook (dữ liệu V1 cũ đã lưu trước đây) để không mất cột mốc đã có. */
function vaccineDatesOfBaby(db){
  var dates=[];
  (db.healthBook||[]).forEach(function(x){
    if(x&&Array.isArray(x.vaccines)&&x.vaccines.length&&(x.person==='Con'||!x.person)&&x.date)dates.push(String(x.date));
  });
  var members=(db.hb&&Array.isArray(db.hb.members))?db.hb.members:[];
  members.forEach(function(m){
    if(!m||m.rel!=='Con')return;
    (Array.isArray(m.vaccines)?m.vaccines:[]).forEach(function(v){
      if(v&&v.date&&(!v.status||v.status==='Đã tiêm'))dates.push(String(v.date));
    });
  });
  return dates.sort();
}
function checkVaccineMilestones(db){
  if(milestoneExists(db,'vaccine_first'))return false;
  var dates=vaccineDatesOfBaby(db);
  if(!dates.length)return false;
  addMilestone(db,{key:'vaccine_first',category:'vaccine',icon:'💉',title:'Mũi tiêm đầu tiên',date:dates[0],description:'Bé đã tiêm mũi vaccine đầu tiên.',auto:true});
  return true;
}
function checkVitaminDMilestone(db){
  if(milestoneExists(db,'vitaminD_100d'))return false;
  var days={};
  (db.careEvents||[]).forEach(function(x){if(x&&x.type==='medicine'&&x.extra&&/vitamin\s*d/i.test(x.extra.name||'')){var d=x.startDate||x.date;if(d)days[d]=true}});
  var list=Object.keys(days).sort();
  if(list.length>=100){addMilestone(db,{key:'vitaminD_100d',category:'vaccine',icon:'💊',title:'Vitamin D đủ 100 ngày',date:list[99],description:'Bé đã được bổ sung Vitamin D đủ 100 ngày (tính theo số ngày có ghi nhận).',auto:true});return true}
  return false;
}
function checkAutoMilestones(db){
  var changed=false;
  try{if(checkAgeMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkFeedMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkSleepMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkPumpMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkGrowthMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkVaccineMilestones(db))changed=true}catch(e){console.error(e)}
  try{if(checkVitaminDMilestone(db))changed=true}catch(e){console.error(e)}
  return changed;
}

/* ===== V13.9.2 · mục 4 — Xoá dữ liệu gốc thì cột mốc TỰ ĐỘNG cũng phải rút lại =====
   Trước đây cột mốc chỉ được THÊM, không bao giờ bị gỡ: test xong xoá bản ghi thì
   "Lần đầu bú 150ml" vẫn nằm lại trong Hành trình lớn khôn.
   Cách làm: chạy lại đúng bộ luật tự động trên một bản sao rỗng cột mốc để biết
   với dữ liệu HIỆN TẠI thì hệ thống sẽ sinh ra những key nào. Cột mốc auto nào có
   key không còn nằm trong danh sách đó nghĩa là dữ liệu nuôi nó đã bị xoá -> gỡ bỏ.
   Cột mốc THỦ CÔNG (auto=false / không có key) tuyệt đối không đụng tới. */
function autoMilestoneKeysNow(db){
  var shadow={
    settings:db.settings||{},
    careEvents:db.careEvents||[],
    baby:db.baby||[],
    healthBook:db.healthBook||[],
    hb:db.hb||{},
    milestones:[]
  };
  var prev=window.__msSilent;window.__msSilent=true;
  try{checkAutoMilestones(shadow)}catch(e){console.error(e)}
  window.__msSilent=prev;
  var keys={};
  (shadow.milestones||[]).forEach(function(m){if(m&&m.key)keys[m.key]=true});
  return keys;
}
function dropMilestoneNotification(id){
  try{
    var h=loadNotificationHistory(),k='milestone_'+id;
    var out=h.filter(function(n){return !n||n.eventKey!==k});
    if(out.length!==h.length)saveNotificationHistory(out);
  }catch(e){}
}
function pruneAutoMilestones(db){
  var list=db.milestones||[];
  if(!list.length)return false;
  var hasAuto=false,i;
  for(i=0;i<list.length;i++){if(list[i]&&list[i].auto&&list[i].key){hasAuto=true;break}}
  if(!hasAuto)return false;
  var valid=autoMilestoneKeysNow(db),kept=[],changed=false;
  for(i=0;i<list.length;i++){
    var m=list[i];
    if(!m)continue;
    if(m.auto&&m.key&&!valid[m.key]){changed=true;dropMilestoneNotification(m.id);continue}
    kept.push(m);
  }
  if(changed)db.milestones=kept;
  return changed;
}
function milestoneById(db,id){return (db.milestones||[]).filter(function(m){return m.id===id})[0]||null}
function milestoneSorted(db,filter){
  var arr=(db.milestones||[]).slice();
  if(filter&&filter!=='all')arr=arr.filter(function(m){return m.category===filter});
  arr.sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||''))});
  return arr;
}
function renderMilestoneTimeline(db){
  var box=byId('milestoneTimelineBox');if(!box)return;
  db=db||load();
  var filterSel=byId('milestoneFilterCategory'),filter=filterSel?filterSel.value:'all';
  var arr=milestoneSorted(db,filter);
  if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có cột mốc nào'+(filter&&filter!=='all'?' trong bộ lọc này':'')+'. Các mốc sẽ tự động xuất hiện khi bé lớn lên, hoặc bấm Thêm cột mốc để tự tạo kỷ niệm riêng. 💗</p></div>';return}
  var groups={},order=[];
  arr.forEach(function(m){var k=m.date||'Không rõ ngày';if(!groups[k]){groups[k]=[];order.push(k)}groups[k].push(m)});
  box.innerHTML=order.map(function(d){
    return '<div class="msDayGroup"><h3>'+weekdayName(d)+', '+fmtDate(d)+'</h3>'+groups[d].map(function(m){
      return '<div class="msItem" role="button" tabindex="0" onclick="openMilestoneDetail(\''+m.id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openMilestoneDetail(\''+m.id+'\')}"><div class="msIcon">'+esc(m.icon||'🏆')+'</div><div class="msBody"><b>'+esc(m.title)+'</b><small>'+esc(milestoneCategoryLabel(m.category))+(m.photos&&m.photos.length?' · 📷 '+m.photos.length:'')+(m.auto?'':' · Thủ công')+'</small></div><div class="msChevron">›</div></div>';
    }).join('')+'</div>';
  }).join('');
}
function refreshDetailOverlayScrollLock(){
  var ids=['monthDetailOverlay','milestoneDetailOverlay'];
  var open=ids.some(function(id){var el=byId(id);return el&&el.classList.contains('show')});
  if(open)document.body.classList.add('careModalOpen');else document.body.classList.remove('careModalOpen');
}
function openMilestoneDetail(id){
  var db=load(),m=milestoneById(db,id);
  if(!m){showToast('Không tìm thấy cột mốc này','error');return}
  window.__milestoneDetailId=id;
  var ov=byId('milestoneDetailOverlay');if(!ov)return;
  renderMilestoneDetail(m);
  ov.classList.add('show');
  refreshDetailOverlayScrollLock();
}
function openMilestonePhotoViewer(src){
  if(!src)return;
  var ov=byId('msPhotoViewerOverlay'),img=byId('msPhotoViewerImg');
  if(!ov||!img)return;
  img.src=src;
  ov.classList.add('show');
}
function closeMilestonePhotoViewer(){
  var ov=byId('msPhotoViewerOverlay');if(ov)ov.classList.remove('show');
  var img=byId('msPhotoViewerImg');if(img)img.src='';
}
function closeMilestoneDetail(){var ov=byId('milestoneDetailOverlay');if(ov)ov.classList.remove('show');window.__milestoneDetailId=null;refreshDetailOverlayScrollLock()}
function renderMilestoneDetail(m){
  if(!m)return;
  setValSafe('msDetailNote',m.note||'');
  if(byId('msDetailTitle'))byId('msDetailTitle').textContent=(m.icon||'🏆')+' '+m.title;
  if(byId('msDetailMeta'))byId('msDetailMeta').textContent=weekdayName(m.date)+', '+fmtDate(m.date)+(m.time?' · '+m.time:'')+' · '+milestoneCategoryLabel(m.category);
  if(byId('msDetailDesc'))byId('msDetailDesc').textContent=m.description||'';
  if(byId('msDetailEditBtn'))byId('msDetailEditBtn').classList.toggle('hidden',!!m.auto);
  if(byId('msDetailDeleteBtn'))byId('msDetailDeleteBtn').classList.toggle('hidden',!!m.auto);
  if(byId('msDetailAutoNote'))byId('msDetailAutoNote').classList.toggle('hidden',!m.auto);
  var photoBox=byId('msDetailPhotos');
  if(photoBox){
    var canAdd=(m.photos||[]).length<20;
    photoBox.innerHTML=(m.photos||[]).map(function(src,i){return '<div class="msPhotoThumb"><img src="'+esc(src)+'" alt="Ảnh cột mốc" onclick="openMilestonePhotoViewer(this.src)"><button type="button" class="msPhotoRemove" onclick="event.stopPropagation();removeMilestonePhoto('+i+')">✕</button></div>'}).join('')+(canAdd?'<label class="msPhotoAdd"><input type="file" accept="image/*" multiple onchange="addMilestonePhotos(event)" hidden>＋<span>Thêm ảnh</span></label>':'');
  }
}
function saveMilestoneNote(){
  var id=window.__milestoneDetailId;if(!id)return;
  var db=load(),m=milestoneById(db,id);if(!m)return;
  m.note=(byId('msDetailNote')&&byId('msDetailNote').value.trim())||'';
  m.updatedAt=new Date().toISOString();
  save(db);
  showToast('Đã lưu ghi chú','success');
}
function compressImageFile(file,maxSide,quality,maxLen,cb){
  if(!file||!/^image\//i.test(file.type||'')){cb(null);return}
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var scale=Math.min(1,maxSide/Math.max(img.width,img.height));
      var w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
      var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
      var q=quality,dataUrl=canvas.toDataURL('image/jpeg',q);
      while(dataUrl.length>maxLen&&q>0.35){q-=0.15;dataUrl=canvas.toDataURL('image/jpeg',q)}
      cb(dataUrl);
    };
    img.onerror=function(){cb(null)};
    img.src=reader.result;
  };
  reader.onerror=function(){cb(null)};
  reader.readAsDataURL(file);
}
function compressImageFiles(files,maxSide,quality,maxLen,onDone){
  var results=[],pending=files.length;
  if(!pending){onDone(results);return}
  files.forEach(function(file){
    compressImageFile(file,maxSide,quality,maxLen,function(dataUrl){
      if(dataUrl)results.push(dataUrl);
      pending--;if(pending<=0)onDone(results);
    });
  });
}
function addMilestonePhotos(event){
  var id=window.__milestoneDetailId;if(!id)return;
  var files=event&&event.target&&event.target.files?Array.prototype.slice.call(event.target.files):[];
  if(!files.length)return;
  var db=load(),m=milestoneById(db,id);if(!m)return;
  m.photos=m.photos||[];
  var remaining=20-m.photos.length;
  if(remaining<=0){showToast('Mỗi cột mốc tối đa 20 ảnh','warn');event.target.value='';return}
  compressImageFiles(files.slice(0,remaining),900,0.78,420000,function(results){
    m.photos=m.photos.concat(results);
    m.updatedAt=new Date().toISOString();
    save(db);
    renderMilestoneDetail(milestoneById(load(),id));
    showToast('Đã thêm '+results.length+' ảnh','success');
  });
  event.target.value='';
}
function removeMilestonePhoto(idx){
  var id=window.__milestoneDetailId;if(!id)return;
  var db=load(),m=milestoneById(db,id);if(!m)return;
  if(!confirm('Xóa ảnh này khỏi cột mốc?'))return;
  m.photos=(m.photos||[]).filter(function(_,i){return i!==idx});
  m.updatedAt=new Date().toISOString();
  save(db);
  renderMilestoneDetail(milestoneById(load(),id));
  showToast('Đã xóa ảnh','success');
}
function resetMilestoneForm(){
  setValSafe('milestoneEditIndex','');
  setValSafe('msIcon','🏆');
  setValSafe('msTitle','');
  setValSafe('msDate',today());
  setValSafe('msDescription','');
  setValSafe('msNote','');
  window.__milestoneFormPhotos=[];
  renderMilestoneFormPhotoPreview();
  if(byId('milestoneFormTitle'))byId('milestoneFormTitle').textContent='Thêm cột mốc';
  if(byId('milestoneEditBadge'))byId('milestoneEditBadge').classList.add('hidden');
}
function pickMilestoneIcon(icon){setValSafe('msIcon',icon)}
function renderMilestoneFormPhotoPreview(){
  var box=byId('msFormPhotoPreview');if(!box)return;
  var photos=window.__milestoneFormPhotos||[];
  box.innerHTML=photos.map(function(src,i){return '<div class="msPhotoThumb"><img src="'+esc(src)+'" alt="Ảnh cột mốc" onclick="openMilestonePhotoViewer(this.src)"><button type="button" class="msPhotoRemove" onclick="event.stopPropagation();removeMilestoneFormPhoto('+i+')">✕</button></div>'}).join('')+(photos.length<20?'<label class="msPhotoAdd"><input type="file" accept="image/*" multiple onchange="addMilestoneFormPhotos(event)" hidden>＋<span>Thêm ảnh</span></label>':'');
}
function removeMilestoneFormPhoto(i){window.__milestoneFormPhotos=(window.__milestoneFormPhotos||[]).filter(function(_,idx){return idx!==i});renderMilestoneFormPhotoPreview()}
function addMilestoneFormPhotos(event){
  var files=event&&event.target&&event.target.files?Array.prototype.slice.call(event.target.files):[];
  if(!files.length)return;
  window.__milestoneFormPhotos=window.__milestoneFormPhotos||[];
  var remaining=20-window.__milestoneFormPhotos.length;
  if(remaining<=0){showToast('Mỗi cột mốc tối đa 20 ảnh','warn');event.target.value='';return}
  compressImageFiles(files.slice(0,remaining),900,0.78,420000,function(results){
    window.__milestoneFormPhotos=window.__milestoneFormPhotos.concat(results);
    renderMilestoneFormPhotoPreview();
  });
  event.target.value='';
}
function saveMilestone(){
  var title=(byId('msTitle')&&byId('msTitle').value.trim())||'';
  var date=(byId('msDate')&&byId('msDate').value)||'';
  if(!title){showToast('Vui lòng nhập tiêu đề cột mốc','warn');return}
  if(!date){showToast('Vui lòng chọn ngày','warn');return}
  var db=load();
  var __udBefore=JSON.stringify(db);
  var icon=(byId('msIcon')&&byId('msIcon').value.trim())||'🏆';
  var description=(byId('msDescription')&&byId('msDescription').value.trim())||'';
  var note=(byId('msNote')&&byId('msNote').value.trim())||'';
  var photos=(window.__milestoneFormPhotos||[]).slice(0,20);
  var idx=byId('milestoneEditIndex')?byId('milestoneEditIndex').value:'';
  var __msWasAdd=(idx===''||!db.milestones[Number(idx)]);
  if(idx!==''&&db.milestones[Number(idx)]){
    var old=db.milestones[Number(idx)];
    if(old.auto){showToast('Không thể sửa cột mốc tự động theo cách này','error');return}
    old.icon=icon;old.title=title;old.date=date;old.description=description;old.note=note;old.photos=photos;old.updatedAt=new Date().toISOString();
    showToast('Cập nhật cột mốc thành công','success');
  }else{
    db.milestones=db.milestones||[];
    db.milestones.unshift(normalizeMilestone({icon:icon,title:title,date:date,description:description,note:note,photos:photos,category:'manual',auto:false,key:null}));
    showToast('Đã thêm cột mốc mới','success');
  }
  save(db);
  if(__msWasAdd)udShow('Đã thêm cột mốc mới.',__udBefore);
  resetMilestoneForm();
  goTab('milestoneTimeline');
}
function editMilestoneFromDetail(){
  var id=window.__milestoneDetailId;if(!id)return;
  var db=load(),idxFound=-1;
  (db.milestones||[]).some(function(m,i){if(m.id===id){idxFound=i;return true}return false});
  if(idxFound<0)return;
  var m=db.milestones[idxFound];
  if(m.auto){showToast('Cột mốc tự động không thể sửa theo cách này','warn');return}
  setValSafe('milestoneEditIndex',idxFound);
  setValSafe('msIcon',m.icon||'🏆');
  setValSafe('msTitle',m.title||'');
  setValSafe('msDate',m.date||today());
  setValSafe('msDescription',m.description||'');
  setValSafe('msNote',m.note||'');
  window.__milestoneFormPhotos=(m.photos||[]).slice();
  renderMilestoneFormPhotoPreview();
  if(byId('milestoneFormTitle'))byId('milestoneFormTitle').textContent='Sửa cột mốc';
  if(byId('milestoneEditBadge'))byId('milestoneEditBadge').classList.remove('hidden');
  closeMilestoneDetail();
  goTab('milestoneAdd');
}
function deleteMilestoneFromDetail(){
  var id=window.__milestoneDetailId;if(!id)return;
  var db=load(),idxFound=-1;
  (db.milestones||[]).some(function(m,i){if(m.id===id){idxFound=i;return true}return false});
  if(idxFound<0)return;
  if(db.milestones[idxFound].auto){showToast('Không thể xóa cột mốc tự động','warn');return}
  if(!confirm('Xóa cột mốc này?'))return;
  var __udBefore=JSON.stringify(db);
  db.milestones.splice(idxFound,1);
  save(db);
  udShow('Đã xóa cột mốc.',__udBefore);
  closeMilestoneDetail();
  showToast('Đã xóa cột mốc','success');
}
function roundRectPath(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function wrapText(ctx,text,x,y,maxWidth,lineHeight){
  var words=String(text||'').split(' '),line='',lines=[];
  for(var i=0;i<words.length;i++){
    var test=line?line+' '+words[i]:words[i];
    if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=words[i]}else{line=test}
  }
  if(line)lines.push(line);
  var startY=y-((lines.length-1)*lineHeight)/2;
  lines.forEach(function(l,i){ctx.fillText(l,x,startY+i*lineHeight)});
}
function shareMilestoneImage(){
  var id=window.__milestoneDetailId;if(!id)return;
  var db=load(),m=milestoneById(db,id);if(!m)return;
  var W=1000,H=1250,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext('2d');
  function finishShare(){
    canvas.toBlob(function(blob){
      if(!blob)return;
      function downloadBlob(){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='milestone-'+(m.date||today())+'.png';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
      try{
        var file=new File([blob],'milestone-'+(m.date||today())+'.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:m.title||'Cột mốc',text:m.title||''}).catch(downloadBlob)}
        else downloadBlob();
      }catch(e){downloadBlob()}
    },'image/png');
  }
  function draw(photoImg){
    var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fff7f9');g.addColorStop(1,'#f6bfd0');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    var pad=60,textTop=pad;
    if(photoImg){
      var ph=680,pw=W-pad*2,scale=Math.max(pw/photoImg.width,ph/photoImg.height);
      var sw=pw/scale,sh=ph/scale,sx=(photoImg.width-sw)/2,sy=(photoImg.height-sh)/2;
      ctx.save();roundRectPath(ctx,pad,pad,pw,ph,28);ctx.clip();
      ctx.drawImage(photoImg,sx,sy,sw,sh,pad,pad,pw,ph);
      ctx.restore();
      textTop=pad*2+680;
    }
    ctx.textAlign='center';
    ctx.fillStyle='#32242a';ctx.font='90px sans-serif';ctx.fillText(m.icon||'🏆',W/2,textTop+110);
    ctx.font='bold 54px sans-serif';wrapText(ctx,m.title||'',W/2,textTop+205,W-pad*2,64);
    ctx.font='34px sans-serif';ctx.fillStyle='#7d6870';ctx.fillText(weekdayName(m.date)+', '+fmtDate(m.date),W/2,textTop+300);
    var name=(db.settings&&db.settings.babyName)||'Bé';
    ctx.font='30px sans-serif';ctx.fillStyle='#e78aa3';ctx.fillText('🏆 Hành trình lớn khôn của '+name,W/2,H-70);
    finishShare();
  }
  if(m.photos&&m.photos.length){var img=new Image();img.onload=function(){draw(img)};img.onerror=function(){draw(null)};img.src=m.photos[0]}
  else draw(null);
}
window.addEventListener('load',function(){initMobileZoomGuard();resetPregnancyForm();resetBabyForm();resetAppointmentForm();resetAppointmentTypeForm();resetCareForm();resetMilestoneForm();render();try{var _bootDb=load();if(checkAutoMilestones(_bootDb))save(_bootDb)}catch(e){}initBackTopButton();initSplashScreen();initVNClock();initPushNotification();initPullToRefresh();setTimeout(function(){cloudAutoPullOnBoot().finally(cloudRealtimeStart)},800)});


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


/* V14.5.0 — Việc đăng ký Service Worker do boot.js đảm nhiệm (kèm updateViaCache
   'none' + tự nạp lại khi có bản mới) để không bao giờ mở lại giao diện cũ.
   Ở đây chỉ đăng ký dự phòng nếu vì lý do nào đó boot.js không chạy được. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    if (window.MYB_SW_REG || window.MYB_BUILD) return;
    navigator.serviceWorker.register('./sw.js', {scope: './'}).catch(function(){ /* offline cache optional */ });
  });
}

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



/* V10.8.4 Device Push Notification (giữ nguyên, tham chiếu lịch sử) */
var PUSH_CFG_KEY='meYeuBePush_v1';
var PUSH_SENT_KEY='meYeuBePushSent_v1';
var pushDispatchTimer=null;

function defaultPushAlertTypes(){
  var result={};
  SMART_ALERT_RULE_DEFS.forEach(function(def){result[def.id]=def.defaultSeverity!=='info'});
  return result;
}
function loadPushConfig(){
  var cfg={
    enabled:false,
    vapidPublicKey:'',
    functionName:'send-push',
    alertTypes:defaultPushAlertTypes(),
    endpoint:'',
    lastRegisteredAt:'',
    lastTestAt:'',
    expired:false
  };
  try{
    var saved=JSON.parse(localStorage.getItem(PUSH_CFG_KEY)||'{}');
    if(saved&&typeof saved==='object')cfg=Object.assign(cfg,saved);
  }catch(e){}
  cfg.alertTypes=Object.assign(defaultPushAlertTypes(),cfg.alertTypes||{});
  return cfg;
}
function savePushConfig(cfg){
  localStorage.setItem(PUSH_CFG_KEY,JSON.stringify(cfg||loadPushConfig()));
}
function pushLog(message,type){
  var line='['+(new Date()).toLocaleTimeString('vi-VN')+'] '+String(message||'');
  var box=byId('pushNotifyLog');
  if(box)box.textContent=(line+'\n'+(box.textContent||'')).slice(0,5000);
  if(type)showToast(message,type);
}
function pushIsIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent||'') ||
    (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function pushIsStandalone(){
  return !!(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone===true;
}
function pushSupported(){
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
function pushPermissionLabel(){
  if(!('Notification' in window))return 'Không hỗ trợ';
  if(Notification.permission==='granted')return 'Đã cho phép';
  if(Notification.permission==='denied')return 'Đã từ chối';
  return 'Chưa hỏi quyền';
}
function renderPushConfig(){
  var cfg=loadPushConfig(),cloud=loadCloudConfig();
  var key=byId('pushVapidPublicKey'),fn=byId('pushFunctionName');
  if(key)key.value=cfg.vapidPublicKey||'';
  if(fn)fn.value=cfg.functionName||'send-push';
  var list=byId('pushAlertTypeList');
  if(list){
    list.innerHTML=SMART_ALERT_RULE_DEFS.map(function(def){
      var enabled=cfg.alertTypes[def.id]!==false;
      return '<label class="pushAlertTypeItem"><input type="checkbox" data-push-rule="'+esc(def.id)+'" '+(enabled?'checked':'')+'><span>'+esc(def.icon+' '+def.label)+'<small>'+esc(smartAlertSeverityMeta(def.defaultSeverity).label)+'</small></span></label>';
    }).join('');
  }
  var pill=byId('pushStatusPill'),title=byId('pushStatusTitle'),sub=byId('pushStatusSubtitle');
  var status='CHƯA BẬT',off=true;
  if(!pushSupported()){
    status='KHÔNG HỖ TRỢ';
    if(title)title.textContent='Trình duyệt không hỗ trợ Web Push';
    if(sub)sub.textContent='Hãy dùng PWA trên thiết bị và trình duyệt có hỗ trợ Push API.';
  }else if(pushIsIOS()&&!pushIsStandalone()){
    status='CẦN PWA';
    if(title)title.textContent='Cần mở từ Màn hình chính';
    if(sub)sub.textContent='Safari → Chia sẻ → Thêm vào Màn hình chính, sau đó mở app từ biểu tượng.';
  }else if(Notification.permission==='denied'){
    status='BỊ CHẶN';
    if(title)title.textContent='Quyền thông báo đang bị từ chối';
    if(sub)sub.textContent='Mở Cài đặt của thiết bị để cho phép thông báo cho Mẹ Yêu Bé.';
  }else if(cfg.expired){
    status='HẾT HẠN';
    if(title)title.textContent='Subscription đã hết hạn';
    if(sub)sub.textContent='Bấm Bật thông báo để đăng ký lại thiết bị.';
  }else if(cfg.enabled&&cfg.endpoint){
    status='ĐÃ BẬT';off=false;
    if(title)title.textContent='Thông báo thiết bị đang hoạt động';
    if(sub)sub.textContent='Sync ID: '+(cloud.syncId||'--')+' · Quyền: '+pushPermissionLabel()+' · Thiết bị: '+cloudDeviceId().slice(-6);
  }else{
    if(title)title.textContent='Chưa đăng ký Web Push';
    if(sub)sub.textContent='Quyền: '+pushPermissionLabel()+' · Cần cấu hình VAPID public key.';
  }
  if(pill){pill.textContent=status;pill.classList.toggle('off',off)}
}
function pushReadFormConfig(){
  var cfg=loadPushConfig();
  var key=byId('pushVapidPublicKey'),fn=byId('pushFunctionName');
  cfg.vapidPublicKey=(key&&key.value.trim())||cfg.vapidPublicKey||'';
  cfg.functionName=(fn&&fn.value.trim())||'send-push';
  var boxes=document.querySelectorAll('[data-push-rule]');
  if(boxes.length){
    cfg.alertTypes={};
    boxes.forEach(function(box){cfg.alertTypes[box.getAttribute('data-push-rule')]=!!box.checked});
  }
  return cfg;
}
function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var raw=window.atob(base64),output=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)output[i]=raw.charCodeAt(i);
  return output;
}
async function pushServiceWorkerRegistration(){
  if(!('serviceWorker' in navigator))throw new Error('Thiết bị không hỗ trợ Service Worker');
  var reg=await navigator.serviceWorker.ready;
  if(!reg||!reg.pushManager)throw new Error('Thiết bị không hỗ trợ PushManager');
  return reg;
}
function pushRestHeaders(cloud,prefer){
  var h={
    'apikey':cloud.anonKey,
    'Authorization':'Bearer '+cloud.anonKey,
    'Content-Type':'application/json'
  };
  if(prefer)h.Prefer=prefer;
  return h;
}
async function pushSaveSubscriptionToCloud(subscription,cfg){
  var cloud=loadCloudConfig();
  if(!cloud.url||!cloud.anonKey||!cloud.syncId)throw new Error('Chưa cấu hình Cloud Sync đầy đủ');
  var data=subscription.toJSON(),keys=data.keys||{};
  if(!data.endpoint||!keys.p256dh||!keys.auth)throw new Error('Subscription không đầy đủ khóa mã hóa');
  var body={
    sync_id:cloud.syncId,
    device_id:cloudDeviceId(),
    endpoint:data.endpoint,
    p256dh:keys.p256dh,
    auth:keys.auth,
    enabled:true,
    alert_types:Object.keys(cfg.alertTypes||{}).filter(function(id){return cfg.alertTypes[id]!==false}),
    user_agent:navigator.userAgent||'',
    last_seen_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };
  var response=await fetch(cloud.url.replace(/\/$/,'')+'/rest/v1/push_subscriptions?on_conflict=endpoint',{
    method:'POST',
    headers:pushRestHeaders(cloud,'resolution=merge-duplicates,return=representation'),
    body:JSON.stringify(body)
  });
  if(!response.ok)throw new Error('Lưu subscription thất bại '+response.status+': '+await response.text());
  return body;
}
async function enableDevicePush(){
  try{
    if(!pushSupported())throw new Error('Trình duyệt này không hỗ trợ Web Push');
    if(pushIsIOS()&&!pushIsStandalone())throw new Error('Trên iPhone/iPad, hãy thêm app vào Màn hình chính và mở từ biểu tượng');
    var cfg=pushReadFormConfig(),cloud=loadCloudConfig();
    if(!cloud.enabled||!cloud.url||!cloud.anonKey||!cloud.syncId)throw new Error('Hãy bật và lưu Cloud Sync trước');
    if(!cfg.vapidPublicKey)throw new Error('Chưa nhập VAPID public key');
    var permission=Notification.permission;
    if(permission!=='granted')permission=await Notification.requestPermission();
    if(permission!=='granted')throw new Error(permission==='denied'?'Người dùng đã từ chối quyền thông báo':'Chưa được cấp quyền thông báo');
    var reg=await pushServiceWorkerRegistration();
    var subscription=await reg.pushManager.getSubscription();
    if(subscription&&cfg.vapidPublicKeyAtRegistration&&cfg.vapidPublicKeyAtRegistration!==cfg.vapidPublicKey){
      try{await subscription.unsubscribe()}catch(e){}
      subscription=null;
    }
    if(subscription){
      var current=subscription.options&&subscription.options.applicationServerKey;
      if(!current){try{await subscription.unsubscribe()}catch(e){}subscription=null}
    }
    if(!subscription){
      subscription=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(cfg.vapidPublicKey)
      });
    }
    var saved=await pushSaveSubscriptionToCloud(subscription,cfg);
    cfg.enabled=true;
    cfg.expired=false;
    cfg.endpoint=saved.endpoint;
    cfg.vapidPublicKeyAtRegistration=cfg.vapidPublicKey;
    cfg.lastRegisteredAt=new Date().toISOString();
    savePushConfig(cfg);
    renderPushConfig();
    pushLog('Đã bật thông báo cho thiết bị này','success');
  }catch(e){
    pushLog('Bật thông báo thất bại: '+e.message,'error');
    renderPushConfig();
  }
}
async function pushPatchCurrentSubscription(fields){
  var cfg=loadPushConfig(),cloud=loadCloudConfig();
  if(!cfg.endpoint||!cloud.url||!cloud.anonKey)return;
  var url=cloud.url.replace(/\/$/,'')+'/rest/v1/push_subscriptions?endpoint=eq.'+encodeURIComponent(cfg.endpoint);
  var response=await fetch(url,{
    method:'PATCH',
    headers:pushRestHeaders(cloud,'return=minimal'),
    body:JSON.stringify(Object.assign({updated_at:new Date().toISOString()},fields||{}))
  });
  if(!response.ok)throw new Error('Cập nhật subscription thất bại '+response.status+': '+await response.text());
}
async function savePushPreferences(){
  try{
    var cfg=pushReadFormConfig();
    savePushConfig(cfg);
    if(cfg.endpoint){
      await pushPatchCurrentSubscription({
        alert_types:Object.keys(cfg.alertTypes).filter(function(id){return cfg.alertTypes[id]!==false}),
        enabled:cfg.enabled!==false,
        last_seen_at:new Date().toISOString()
      });
    }
    renderPushConfig();
    pushLog('Đã lưu loại cảnh báo cho thiết bị này','success');
  }catch(e){pushLog('Lưu cấu hình thông báo thất bại: '+e.message,'error')}
}
async function disableDevicePush(){
  if(!confirm('Tắt thông báo trên thiết bị này? Các thiết bị khác không bị ảnh hưởng.'))return;
  try{
    var cfg=loadPushConfig();
    try{await pushPatchCurrentSubscription({enabled:false})}catch(e){}
    if(pushSupported()){
      var reg=await pushServiceWorkerRegistration(),sub=await reg.pushManager.getSubscription();
      if(sub)await sub.unsubscribe();
    }
    cfg.enabled=false;cfg.endpoint='';cfg.expired=false;
    savePushConfig(cfg);renderPushConfig();
    pushLog('Đã tắt thông báo trên thiết bị này','success');
  }catch(e){pushLog('Tắt thông báo thất bại: '+e.message,'error')}
}
async function pushInvokeFunction(body){
  var cloud=loadCloudConfig(),cfg=loadPushConfig();
  if(!cloud.url||!cloud.anonKey)throw new Error('Chưa cấu hình Supabase');
  var name=cfg.functionName||'send-push';
  var response=await fetch(cloud.url.replace(/\/$/,'')+'/functions/v1/'+encodeURIComponent(name),{
    method:'POST',
    headers:{
      'apikey':cloud.anonKey,
      'Authorization':'Bearer '+cloud.anonKey,
      'Content-Type':'application/json'
    },
    body:JSON.stringify(body||{})
  });
  var text=await response.text(),result=null;
  try{result=text?JSON.parse(text):{}}catch(e){result={message:text}}
  if(!response.ok)throw new Error('Edge Function '+response.status+': '+(result.error||result.message||text));
  return result;
}
async function testDevicePush(){
  try{
    var cfg=loadPushConfig(),cloud=loadCloudConfig();
    if(!cfg.enabled||!cfg.endpoint)throw new Error('Hãy bật thông báo trên thiết bị này trước');
    var result=await pushInvokeFunction({
      mode:'test',
      sync_id:cloud.syncId,
      target_endpoint:cfg.endpoint,
      payload:{
        title:'Mẹ Yêu Bé',
        body:'Thông báo thử đã hoạt động trên thiết bị này.',
        icon:'./icon-192.png',
        url:'./index.html?openAlertCenter=1',
        tag:'meyeube-test-'+Date.now()
      }
    });
    cfg.lastTestAt=new Date().toISOString();savePushConfig(cfg);
    var matched=Number(result.matched_subscriptions||0);
    var sent=Number(result.sent||0);
    var failed=Array.isArray(result.failures)?result.failures.length:Number(result.failed||0);
    var expired=Number(result.expired||0);
    if(sent<=0){
      throw new Error('Không gửi được thông báo. Phù hợp: '+matched+', gửi thành công: '+sent+', lỗi: '+failed+', hết hạn: '+expired);
    }
    pushLog('Gửi thử đến thiết bị này thành công · '+sent+' thiết bị','success');
  }catch(e){pushLog('Gửi thử thất bại: '+e.message,'error')}
}
async function testAllDevicesPush(){
  try{
    var cloud=loadCloudConfig();
    if(!cloud.enabled||!cloud.syncId)throw new Error('Hãy bật và lưu Cloud Sync trước');
    if(!confirm('Gửi thông báo thử đến tất cả thiết bị đang bật Push cùng Sync ID '+cloud.syncId+'?'))return;
    var result=await pushInvokeFunction({
      mode:'test',
      sync_id:cloud.syncId,
      payload:{
        title:'Mẹ Yêu Bé',
        body:'Thông báo thử đã được gửi đến tất cả thiết bị đang hoạt động.',
        icon:'./icon-192.png',
        url:'./index.html?openAlertCenter=1',
        tag:'meyeube-test-all-'+Date.now()
      }
    });
    var matched=Number(result.matched_subscriptions||0);
    var sent=Number(result.sent||0);
    var failed=Array.isArray(result.failures)?result.failures.length:Number(result.failed||0);
    var expired=Number(result.expired||0);
    if(sent<=0){
      throw new Error('Không có thiết bị nhận thành công. Phù hợp: '+matched+', lỗi: '+failed+', hết hạn: '+expired);
    }
    pushLog('Gửi thử tất cả thành công · '+sent+'/'+matched+' thiết bị','success');
  }catch(e){pushLog('Gửi thử tất cả thất bại: '+e.message,'error')}
}
async function refreshPushSubscriptionRegistration(){
  var cfg=loadPushConfig();
  if(!cfg.enabled||!pushSupported())return;
  try{
    if(Notification.permission!=='granted'){
      cfg.expired=Notification.permission==='denied';savePushConfig(cfg);renderPushConfig();return;
    }
    var reg=await pushServiceWorkerRegistration(),sub=await reg.pushManager.getSubscription();
    if(!sub){
      cfg.expired=true;cfg.endpoint='';savePushConfig(cfg);renderPushConfig();
      pushLog('Subscription không còn tồn tại. Hãy bật thông báo lại.','warn');
      return;
    }
    await pushSaveSubscriptionToCloud(sub,cfg);
    cfg.endpoint=sub.endpoint;cfg.expired=false;cfg.lastRegisteredAt=new Date().toISOString();
    savePushConfig(cfg);renderPushConfig();
  }catch(e){
    console.warn('Push subscription refresh failed',e);
  }
}
function pushAlertEventKey(alert){
  return String(alert&&alert.eventKey||alert&&alert.ruleId||'alert');
}
function loadPushSentMap(){
  try{return JSON.parse(localStorage.getItem(PUSH_SENT_KEY)||'{}')||{}}catch(e){return {}}
}
function savePushSentMap(map){
  var now=Date.now(),clean={};
  Object.keys(map||{}).forEach(function(k){if(now-Number(map[k]||0)<7*86400000)clean[k]=map[k]});
  localStorage.setItem(PUSH_SENT_KEY,JSON.stringify(clean));
}
function maybeDispatchPushAlerts(db){
  clearTimeout(pushDispatchTimer);
  pushDispatchTimer=setTimeout(async function(){
    var cloud=loadCloudConfig(),pushCfg=loadPushConfig();
    if(!cloud.enabled||!navigator.onLine)return;
    var alerts=evaluateSmartAlerts(db||load()).filter(function(a){
      return a.severity==='critical'||a.severity==='warning';
    });
    if(!alerts.length)return;
    var sent=loadPushSentMap(),fresh=[];
    alerts.forEach(function(a){
      var key=pushAlertEventKey(a);
      if(!sent[key])fresh.push(a);
    });
    if(!fresh.length)return;
    try{
      var result=await pushInvokeFunction({
        mode:'alert',
        sync_id:cloud.syncId,
        source_device_id:cloudDeviceId(),
        alerts:fresh.map(function(a){
          return {
            event_key:pushAlertEventKey(a),
            rule_id:a.ruleId,
            severity:a.severity,
            title:a.title,
            body:a.message,
            icon:a.icon,
            url:'./index.html?openAlertCenter=1'
          };
        })
      });
      var now=Date.now();
      fresh.forEach(function(a){sent[pushAlertEventKey(a)]=now});
      savePushSentMap(sent);
      if(Number(result.sent||0)>0)pushLog('Đã gửi '+result.sent+' push từ Smart Alert');
    }catch(e){
      console.warn('Smart Alert push dispatch failed',e);
    }
  },1800);
}
function initPushNotification(){
  renderPushConfig();
  setTimeout(refreshPushSubscriptionRegistration,1800);
  setInterval(function(){try{maybeDispatchPushAlerts(load())}catch(e){}},60000);
  if(navigator.serviceWorker){
    navigator.serviceWorker.addEventListener('message',function(event){
      var data=event.data||{};
      if(data.type==='MEYEUBE_NOTIFICATION_CLICK'){
        setTimeout(function(){openSmartAlertCenter()},250);
      }
    });
  }
  try{
    var params=new URLSearchParams(location.search);
    if(params.get('openAlertCenter')==='1')setTimeout(openSmartAlertCenter,900);
  }catch(e){}
}



/* ===================== ❤️ Kỷ niệm & Thống kê — V11.1.3 ===================== */
/* Hành trình theo tháng / Thống kê & So sánh / Tổng kết năm */

function babyMonthRanges(birthDate){
  var ranges=[];if(!birthDate)return ranges;
  var todayStr=today(),idx=1,guard=0;
  while(guard<600){
    var start=addCalendarUnits(birthDate,0,idx-1,0);
    if(start>todayStr)break;
    var end=addCalendarUnits(birthDate,0,idx,0);
    ranges.push({index:idx,start:start,end:end});
    idx++;guard++;
  }
  return ranges;
}
function babyYearRanges(birthDate){
  var ranges=[];if(!birthDate)return ranges;
  var todayStr=today(),idx=1,guard=0;
  while(guard<120){
    var start=addCalendarUnits(birthDate,idx-1,0,0);
    if(start>todayStr)break;
    var end=addCalendarUnits(birthDate,idx,0,0);
    ranges.push({index:idx,start:start,end:end});
    idx++;guard++;
  }
  return ranges;
}
function yearRangeLabel(idx){return idx===1?'Năm đầu tiên':'Năm thứ '+idx}
function rangeMilestones(db,start,end){return (db.milestones||[]).filter(function(m){return m&&m.date&&m.date>=start&&m.date<end})}
function rangePhotos(db,start,end){
  var photos=[];
  rangeMilestones(db,start,end).forEach(function(m){
    (m.photos||[]).forEach(function(p){photos.push({src:p,title:m.title||'',icon:m.icon||'🏆'})});
  });
  return photos;
}
function rangeCareTotals(db,start,end){
  var t={feedMl:0,feedCount:0,pumpMl:0,pumpCount:0,sleepMin:0,sleepCount:0,diaperCount:0,pee:0,poop:0,medicine:0,spitup:0,temperatureCount:0};
  (db.careEvents||[]).forEach(function(x){
    if(!x)return;
    var d=x.startDate||x.date;if(!d||d<start||d>=end)return;
    var a=Number(x.amount||0);
    if(x.type==='feed'){t.feedCount++;t.feedMl+=a}
    else if(x.type==='pump'){t.pumpCount++;t.pumpMl+=a}
    else if(x.type==='sleep'){
      t.sleepCount++;
      var s=careEventStartMs(x),e=careEventEndMs(x);
      if(s!==null&&e!==null&&e>s)t.sleepMin+=Math.round((e-s)/60000);
    }
    else if(x.type==='diaper'){t.diaperCount+=a||1;t.pee+=diaperPeeCount(x);t.poop+=diaperPoopCount(x)}
    else if(x.type==='pee')t.pee+=a||1;
    else if(x.type==='poop')t.poop+=a||1;
    else if(x.type==='medicine')t.medicine++;
    else if(x.type==='spitup')t.spitup+=a||1;
    else if(x.type==='temperature')t.temperatureCount++;
  });
  return t;
}
function rangeRecordCount(t){return t.feedCount+t.sleepCount+t.pumpCount+t.diaperCount+t.medicine+t.spitup+t.temperatureCount}

/* ---------- Hành trình theo tháng ---------- */
function renderMonthlyJourney(db){
  var box=byId('monthlyJourneyBox');if(!box)return;
  var birthDate=(db.settings||{}).birthDate;
  if(!birthDate){box.innerHTML='<div class="card"><p class="monthEmpty">Vui lòng nhập Ngày sinh của bé trong Thiết lập để xem Hành trình theo tháng.</p></div>';return}
  var ranges=babyMonthRanges(birthDate);
  if(!ranges.length){box.innerHTML='<div class="card"><p class="monthEmpty">Chưa có dữ liệu tháng nào.</p></div>';return}
  var html='<div class="monthGrid">';
  ranges.slice().reverse().forEach(function(r){
    var ms=rangeMilestones(db,r.start,r.end);
    var totals=rangeCareTotals(db,r.start,r.end);
    var photos=rangePhotos(db,r.start,r.end);
    var lastDay=addCalendarUnits(r.end,0,0,-1);
    html+='<div class="monthCard" role="button" tabindex="0" onclick="openMonthDetail('+r.index+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openMonthDetail('+r.index+')}">'+
      '<div class="monthCardHead"><b>Tháng '+r.index+'</b><span class="monthCardRange">'+fmtDate(r.start)+' – '+fmtDate(lastDay)+'</span></div>'+
      '<div class="monthCardStats"><span>🏆 '+ms.length+' Milestone</span><span>🧾 '+rangeRecordCount(totals)+' bản ghi</span><span>📷 '+photos.length+' ảnh</span></div>'+
    '</div>';
  });
  html+='</div>';
  box.innerHTML=html;
}
window.__monthDetailIndex=null;
function openMonthDetail(idx){
  var db=load();var birthDate=(db.settings||{}).birthDate;if(!birthDate)return;
  var r=babyMonthRanges(birthDate).filter(function(x){return x.index===idx})[0];
  if(!r){showToast('Không tìm thấy tháng này','error');return}
  window.__monthDetailIndex=idx;
  var lastDay=addCalendarUnits(r.end,0,0,-1);
  if(byId('monthDetailTitle'))byId('monthDetailTitle').textContent='📅 Tháng '+idx;
  if(byId('monthDetailRange'))byId('monthDetailRange').textContent=fmtDate(r.start)+' – '+fmtDate(lastDay);
  var totals=rangeCareTotals(db,r.start,r.end);
  if(byId('monthDetailStats'))byId('monthDetailStats').innerHTML=
    '<div class="careStatBox"><div class="ico">🍼</div><b>'+totals.feedMl+'ml</b><span>'+totals.feedCount+' cữ bú</span></div>'+
    '<div class="careStatBox"><div class="ico">😴</div><b>'+fmtMinutes(totals.sleepMin)+'</b><span>'+totals.sleepCount+' giấc ngủ</span></div>'+
    '<div class="careStatBox"><div class="ico">🤱</div><b>'+totals.pumpMl+'ml</b><span>'+totals.pumpCount+' lần hút</span></div>';
  if(byId('monthDetailCare'))byId('monthDetailCare').textContent='🍼 '+totals.feedCount+' cữ bú · 😴 '+totals.sleepCount+' giấc ngủ · 🤱 '+totals.pumpCount+' lần hút sữa · 🧷 '+totals.diaperCount+' lần thay tã · Tổng '+rangeRecordCount(totals)+' bản ghi trong tháng.';
  var ms=rangeMilestones(db,r.start,r.end).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))});
  if(byId('monthDetailMilestones'))byId('monthDetailMilestones').innerHTML=ms.length?ms.map(function(m){
    return '<div class="monthMsRow" role="button" tabindex="0" onclick="openMilestoneDetail(\''+m.id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openMilestoneDetail(\''+m.id+'\')}"><b>'+esc(m.icon||'🏆')+' '+esc(m.title||'')+'</b><small>'+fmtDate(m.date)+'</small></div>';
  }).join(''):'<p class="monthEmpty">Chưa có Milestone nào trong tháng này.</p>';
  var photos=rangePhotos(db,r.start,r.end);
  if(byId('monthDetailPhotos'))byId('monthDetailPhotos').innerHTML=photos.length?photos.map(function(p){
    return '<div class="msPhotoThumb"><img src="'+p.src+'" alt="'+esc(p.title)+'" onclick="openMilestonePhotoViewer(this.src)"></div>';
  }).join(''):'<p class="monthEmpty">Chưa có ảnh nào (ảnh được lưu qua Milestone).</p>';
  if(byId('monthDetailNote'))byId('monthDetailNote').value=(db.monthlyNotes||{})[String(idx)]||'';
  var ov=byId('monthDetailOverlay');if(ov)ov.classList.add('show');
  refreshDetailOverlayScrollLock();
}
function closeMonthDetail(){var ov=byId('monthDetailOverlay');if(ov)ov.classList.remove('show');window.__monthDetailIndex=null;refreshDetailOverlayScrollLock()}
function saveMonthNote(){
  var idx=window.__monthDetailIndex;if(!idx)return;
  var db=load();db.monthlyNotes=db.monthlyNotes||{};
  db.monthlyNotes[String(idx)]=(byId('monthDetailNote')&&byId('monthDetailNote').value)||'';
  save(db);showToast('Đã lưu ghi chú tháng '+idx,'success');
}

/* ---------- Thống kê & So sánh ---------- */
function statsCompareBaseline(db,range){
  var t=today();
  if(range==='7d'){var start=addCalendarUnits(t,0,0,-7);return {label:'So với trung bình 7 ngày gần nhất',totals:rangeCareTotals(db,start,t),days:7}}
  if(range==='30d'){var start=addCalendarUnits(t,0,0,-30);return {label:'So với trung bình 30 ngày gần nhất',totals:rangeCareTotals(db,start,t),days:30}}
  if(range==='lastMonth'){
    var d=new Date(t+'T00:00:00');d.setDate(1);d.setMonth(d.getMonth()-1);var start=localDateISO(d);
    var d2=new Date(t+'T00:00:00');d2.setDate(1);var end=localDateISO(d2);
    var days=Math.max(1,daysBetween(start,end));
    return {label:'So với trung bình tháng trước',totals:rangeCareTotals(db,start,end),days:days};
  }
  var y=addCalendarUnits(t,0,0,-1);return {label:'So với hôm qua',totals:rangeCareTotals(db,y,t),days:1};
}
function statsDeltaHtml(curVal,baseVal,unit){
  var d=curVal-baseVal;
  if(Math.abs(d)<0.5)return '<span class="bcDelta neutral">— Không đổi</span>';
  var cls=d>0?'':' down',sign=d>0?'+':'';
  var val=Math.round(d);
  return '<span class="bcDelta'+cls+'">'+(d>0?'↑ ':'↓ ')+sign+val+' '+unit+'</span>';
}
function renderStatsCompare(db){
  var box=byId('statsCompareBox');if(!box)return;
  var range=(byId('statsCompareRange')&&byId('statsCompareRange').value)||'yesterday';
  var t=today(),tomorrow=addCalendarUnits(t,0,0,1);
  var todayTotals=rangeCareTotals(db,t,tomorrow);
  var base=statsCompareBaseline(db,range);
  var avgFeed=base.totals.feedMl/base.days,avgSleep=base.totals.sleepMin/base.days,avgPump=base.totals.pumpMl/base.days;
  box.innerHTML='<div class="careStatsGrid">'+
    '<div class="careStatBox"><div class="ico">🍼</div><b>'+todayTotals.feedMl+'ml</b><span>Hôm nay · '+todayTotals.feedCount+' cữ</span>'+statsDeltaHtml(todayTotals.feedMl,avgFeed,'ml')+'</div>'+
    '<div class="careStatBox"><div class="ico">😴</div><b>'+fmtMinutes(todayTotals.sleepMin)+'</b><span>Hôm nay · tổng ngủ</span>'+statsDeltaHtml(todayTotals.sleepMin,avgSleep,'phút')+'</div>'+
    '<div class="careStatBox"><div class="ico">🤱</div><b>'+todayTotals.pumpMl+'ml</b><span>Hôm nay · đã hút</span>'+statsDeltaHtml(todayTotals.pumpMl,avgPump,'ml')+'</div>'+
    '</div><p class="sub" style="margin-top:12px">'+esc(base.label)+'. Sắp có: biểu đồ xu hướng bú／ngủ／hút sữa theo thời gian.</p>';
}

/* ---------- Tổng kết năm ---------- */
function renderYearSummary(db){
  var box=byId('yearSummaryBox'),sel=byId('yearSummarySelect');if(!box)return;
  var birthDate=(db.settings||{}).birthDate;
  if(!birthDate){box.innerHTML='<div class="card"><p class="monthEmpty">Vui lòng nhập Ngày sinh của bé trong Thiết lập để xem Tổng kết năm.</p></div>';if(sel)sel.innerHTML='';return}
  var ranges=babyYearRanges(birthDate);
  if(!ranges.length){box.innerHTML='<div class="card"><p class="monthEmpty">Bé chưa tròn năm đầu tiên — quay lại đây khi bé được 1 tuổi nhé!</p></div>';if(sel)sel.innerHTML='';return}
  if(sel){
    var curVal=sel.value;
    sel.innerHTML=ranges.slice().reverse().map(function(r){return '<option value="'+r.index+'">'+yearRangeLabel(r.index)+'</option>'}).join('');
    if(curVal&&ranges.some(function(r){return String(r.index)===curVal}))sel.value=curVal;
  }
  var idx=Number((sel&&sel.value)||ranges[ranges.length-1].index);
  var r=ranges.filter(function(x){return x.index===idx})[0]||ranges[ranges.length-1];
  var totals=rangeCareTotals(db,r.start,r.end);
  var msCount=rangeMilestones(db,r.start,r.end).length;
  var photoCount=rangePhotos(db,r.start,r.end).length;
  var name=(db.settings&&(db.settings.babyName||db.settings.officialName))||'Bé';
  window.__yearSummaryRange={index:idx,start:r.start,end:r.end,name:name,totals:totals,msCount:msCount,photoCount:photoCount};
  box.innerHTML='<div class="card yearSummaryHero">'+
    '<div class="ysIcon">🎉</div><h3>'+esc(yearRangeLabel(idx))+' của '+esc(name)+'</h3>'+
    '<small class="msDetailMeta">'+fmtDate(r.start)+' – '+fmtDate(addCalendarUnits(r.end,0,0,-1))+'</small>'+
    '<div class="ysStatsGrid">'+
      '<div class="ysStat"><div class="ico">🍼</div><b>'+totals.feedCount+'</b><span>cữ bú</span></div>'+
      '<div class="ysStat"><div class="ico">😴</div><b>'+totals.sleepCount+'</b><span>giấc ngủ</span></div>'+
      '<div class="ysStat"><div class="ico">🤱</div><b>'+(Math.round(totals.pumpMl/100)/10)+'</b><span>lít sữa mẹ</span></div>'+
      '<div class="ysStat"><div class="ico">📷</div><b>'+photoCount+'</b><span>ảnh</span></div>'+
      '<div class="ysStat"><div class="ico">🏆</div><b>'+msCount+'</b><span>Milestone</span></div>'+
      '<div class="ysStat"><div class="ico">🧷</div><b>'+totals.diaperCount+'</b><span>lần thay tã</span></div>'+
    '</div>'+
    '<p class="ysClosing">❤️ Một '+(idx===1?'năm đầu tiên':'năm')+' thật tuyệt vời!</p>'+
    '<div class="btns ysPrintHide">'+
      '<button class="secondary" onclick="shareYearSummaryImage()">📤 Chia sẻ hình ảnh</button>'+
      '<button class="secondary" onclick="exportYearSummaryPdf()">🖨️ Xuất PDF</button>'+
      '<button class="secondary" disabled title="Sắp ra mắt">🎬 Xuất video tổng kết (sắp có)</button>'+
    '</div>'+
  '</div>';
}
function shareYearSummaryImage(){
  var r=window.__yearSummaryRange;if(!r)return;
  var W=1000,H=1250,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext('2d');
  var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fff7f9');g.addColorStop(1,'#f6bfd0');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.font='90px sans-serif';ctx.fillStyle='#32242a';ctx.fillText('🎉',W/2,170);
  ctx.font='bold 52px sans-serif';wrapText(ctx,yearRangeLabel(r.index)+' của '+r.name,W/2,260,W-120,60);
  var rows=[
    ['🍼',r.totals.feedCount+' cữ bú'],
    ['😴',r.totals.sleepCount+' giấc ngủ'],
    ['🤱',(Math.round(r.totals.pumpMl/100)/10)+' lít sữa mẹ'],
    ['📷',r.photoCount+' ảnh'],
    ['🏆',r.msCount+' Milestone']
  ];
  var top=400,rowH=140;
  rows.forEach(function(row,i){
    var y=top+i*rowH;
    ctx.font='54px sans-serif';ctx.fillStyle='#32242a';ctx.fillText(row[0],W/2,y);
    ctx.font='bold 40px sans-serif';ctx.fillStyle='#7d6870';ctx.fillText(row[1],W/2,y+56);
  });
  ctx.font='bold 40px sans-serif';ctx.fillStyle='#bd526f';ctx.fillText('❤️ Một năm thật tuyệt vời!',W/2,H-110);
  ctx.font='30px sans-serif';ctx.fillStyle='#e78aa3';ctx.fillText('❤️ Kỷ niệm & Thống kê · '+r.name,W/2,H-60);
  canvas.toBlob(function(blob){
    if(!blob)return;
    function downloadBlob(){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tong-ket-nam-'+r.index+'.png';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
    try{
      var file=new File([blob],'tong-ket-nam-'+r.index+'.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'Tổng kết năm',text:yearRangeLabel(r.index)}).catch(downloadBlob)}
      else downloadBlob();
    }catch(e){downloadBlob()}
  },'image/png');
}
function exportYearSummaryPdf(){
  showToast('Chọn "Lưu dưới dạng PDF" trong hộp thoại in để xuất file','success');
  setTimeout(function(){window.print()},300);
}

/* ============ 🔒 V14.1.0 · Khoá cuộn nền dùng chung cho MỌI popup/modal ============
   Vấn đề của bản 12.0: chỉ dò `[class*="Overlay"].show`, nên các popup không đặt tên
   theo quy ước đó (Sổ sức khỏe 2.0 dùng `.hb2Modal` + lớp `hidden`, bảng "Thêm" dùng
   `.moreSheet.show`, các sheet công cụ…) không được khoá → nền vẫn cuộn được.

   Cách làm mới: không dựa vào tên lớp nữa mà dò theo BIỂU HIỆN thực tế — phần tử
   position:fixed, đang hiển thị, phủ gần kín màn hình. Nhờ vậy mọi popup hiện có và
   popup thêm sau này đều tự được khoá mà không phải khai báo thêm.

   Không sửa hàm nào trong Baseline Lock. */
(function(){
  var raf=null, lastY=0, locked=false;

  /* Ghi lại vị trí cuộn lúc CHƯA khoá, để trả về đúng chỗ cũ khi đóng popup */
  function curY(){return window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0}
  try{window.addEventListener('scroll',function(){if(!locked)lastY=curY()},{passive:true})}
  catch(e){window.addEventListener('scroll',function(){if(!locked)lastY=curY()})}

  var CAND='[class*="Overlay"],[class*="overlay"],[class*="Modal"],[class*="modal"],'+
           '[class*="Sheet"],[class*="sheet"],[class*="Popup"],[class*="popup"],'+
           '[class*="Viewer"],[class*="viewer"],[class*="Drawer"],[class*="drawer"]';

  function isBlockingPopup(el){
    /* body có thể mang class careModalOpen (chứa chữ "Modal") và đang position:fixed
       do chính cơ chế khoá cuộn → phải loại ra, nếu không sẽ tự dò trúng chính mình. */
    if(el===document.body||el===document.documentElement)return false;
    var st;
    try{st=getComputedStyle(el)}catch(e){return false}
    if(st.position!=='fixed')return false;
    if(st.display==='none'||st.visibility==='hidden')return false;
    if(parseFloat(st.opacity||'1')<0.05)return false;
    if(st.pointerEvents==='none')return false;              /* lớp phủ mờ chưa bật (drawerOverlay) */
    var r=el.getBoundingClientRect();
    var vw=window.innerWidth||document.documentElement.clientWidth;
    var vh=window.innerHeight||document.documentElement.clientHeight;
    return r.width>=vw*0.85 && r.height>=vh*0.6;            /* phủ gần kín màn hình mới tính là popup */
  }
  function anyPopupOpen(){
    var list=document.querySelectorAll(CAND);
    for(var i=0;i<list.length;i++){if(isBlockingPopup(list[i]))return true}
    return false;
  }
  function nativeLockActive(){
    return document.body.classList.contains('careModalOpen')||document.body.classList.contains('menuOpen');
  }

  function sync(){
    raf=null;
    var open=anyPopupOpen(), b=document.body;
    if(open&&!locked){
      locked=true;
      /* Giữ nguyên vị trí đang đọc: bù offset cho trường hợp body bị position:fixed */
      b.style.top='-'+lastY+'px';b.style.left='0';b.style.right='0';b.style.width='100%';
    }else if(!open&&locked){
      locked=false;
      b.style.top='';b.style.left='';b.style.right='';b.style.width='';
      window.scrollTo(0,lastY);
    }
    /* careModalOpen/menuOpen đã tự khoá (position:fixed). Chồng thêm mybScrollLock
       gây lỗi backdrop-filter trên iOS nên chỉ khoá bù cho popup chưa tự khoá. */
    b.classList.toggle('mybScrollLock', open && !nativeLockActive());
  }
  function schedule(){ if(raf)return; raf=requestAnimationFrame(sync); }
  function start(){
    lastY=curY();
    try{
      var obs=new MutationObserver(schedule);
      obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
      window.addEventListener('resize',schedule);
      sync();
    }catch(e){/* MutationObserver không hỗ trợ: bỏ qua, không ảnh hưởng chức năng */}
  }
  if(document.body)start();
  else document.addEventListener('DOMContentLoaded',start);
})();


/* ============================================================================
   🔍 V12.2.0 · TÌM KIẾM TOÀN APP (Global Search)
   Một ô tìm kiếm duy nhất quét toàn bộ dữ liệu: Bé bú, Hút sữa, Kho sữa, Thay tã,
   Ngủ, Thuốc, Nhiệt độ, Trớ sữa, Milestone (Hành trình phát triển), Nhật ký, Lịch khám.
   Toàn bộ hàm mới, prefix "gs", KHÔNG chỉnh sửa bất kỳ hàm nào trong Baseline Lock.
   Nền được khoá cuộn bằng class careModalOpen sẵn có (chỉ cuộn trong popup).
   ============================================================================ */

/* --- Bỏ dấu tiếng Việt, giữ độ dài 1:1 theo code-unit để highlight map đúng chỉ số --- */
function gsDeaccent(s){
  s=String(s==null?'':s);
  var out='';
  for(var i=0;i<s.length;i++){
    var c=s[i];
    if(c==='đ'||c==='Đ'){out+='d';continue;}
    var d;
    try{d=c.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){d=c;}
    out+=(d&&d.length?d:c);
  }
  return out.toLowerCase();
}
function gsPad2(n){return (n<10?'0':'')+n;}

/* --- Sinh nhiều biến thể chuỗi ngày cho một ISO để khớp "24/07", "24 Jul", "24-07-2026"... --- */
function gsDateForms(iso){
  if(!iso||!/^\d{4}-\d{2}-\d{2}/.test(iso))return [];
  var y=iso.slice(0,4),m=parseInt(iso.slice(5,7),10),d=parseInt(iso.slice(8,10),10);
  var mm=gsPad2(m),dd=gsPad2(d);
  var mon=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][m-1];
  var forms=[
    iso.slice(0,10),
    dd+'/'+mm+'/'+y, dd+'/'+mm, d+'/'+m+'/'+y, d+'/'+m,
    dd+'-'+mm+'-'+y, dd+'-'+mm, d+'-'+m+'-'+y, d+'-'+m,
    dd+'.'+mm+'.'+y, dd+'.'+mm,
    dd+' '+mon, d+' '+mon, mon+' '+dd, mon+' '+d,
    dd+' thang '+m, d+' thang '+m, 'thang '+m+' '+y, 'thang '+m,
    'ngay '+d
  ];
  try{forms.push(gsDeaccent(new Date(iso.slice(0,10)+'T00:00:00').toLocaleDateString('vi-VN',{weekday:'long'})));}catch(e){}
  return forms;
}
/* --- Hiển thị "24 Thg 7 · 14:00" --- */
function gsFmtWhen(iso,time){
  var out='';
  if(iso&&/^\d{4}-\d{2}-\d{2}/.test(iso)){
    try{out=new Date(iso.slice(0,10)+'T00:00:00').toLocaleDateString('vi-VN',{day:'2-digit',month:'short'});}
    catch(e){out=fmtDate(iso);}
  }
  if(time&&/^\d{1,2}:\d{2}/.test(time))out+=(out?' · ':'')+time;
  return out||'--';
}
function gsTimeForms(t){
  if(!t||!/^\d{1,2}:\d{2}/.test(t))return '';
  var s=t.slice(0,5),out=[s];
  if(s.charAt(0)==='0')out.push(s.slice(1));
  return out.join(' ');
}
function gsTs(iso,time){
  var s=(iso||'').slice(0,10);if(!s)return 0;
  var t=(time&&/^\d{1,2}:\d{2}/.test(time))?(time.length===4?('0'+time):time):'00:00';
  try{var v=new Date(s+'T'+t+':00').getTime();return isFinite(v)?v:0;}catch(e){return 0;}
}

/* --- Khoảng thời gian nhanh --- */
function gsMondayOf(dt){var x=new Date(dt);var day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);x.setHours(0,0,0,0);return x;}
function gsInRange(iso,range){
  if(!range||range==='all')return true;
  if(!iso)return false;
  var d=iso.slice(0,10),t=today();
  if(range==='today')return d===t;
  if(range==='yesterday'){var y=new Date();y.setDate(y.getDate()-1);return d===localDateISO(y);}
  if(range==='week'){var mon=gsMondayOf(new Date()),sun=new Date(mon);sun.setDate(mon.getDate()+6);return d>=localDateISO(mon)&&d<=localDateISO(sun);}
  if(range==='month')return d.slice(0,7)===t.slice(0,7);
  return true;
}
var GS_RANGE_WORDS=[['today','hom nay'],['yesterday','hom qua'],['week','tuan nay'],['month','thang nay']];
function gsParseQuery(raw){
  var norm=gsDeaccent(raw||'').replace(/\s+/g,' ').trim();
  var typedRange=null;
  for(var i=0;i<GS_RANGE_WORDS.length;i++){
    var pos=norm.indexOf(GS_RANGE_WORDS[i][1]);
    if(pos>-1){typedRange=GS_RANGE_WORDS[i][0];norm=(norm.slice(0,pos)+' '+norm.slice(pos+GS_RANGE_WORDS[i][1].length)).replace(/\s+/g,' ').trim();break;}
  }
  var tokens=norm.length?norm.split(' ').filter(Boolean):[];
  return {tokens:tokens,typedRange:typedRange};
}

var GS_TYPE_CHIPS=[
  ['feed','🍼','Bé bú'],['pump','🥛','Hút sữa'],['milk','🧊','Kho sữa'],
  ['sleep','😴','Ngủ'],['diaper','🧷','Thay tã'],['medicine','💊','Thuốc'],
  ['temperature','🌡️','Nhiệt độ'],['spitup','🤮','Trớ sữa'],
  ['milestone','🏆','Cột mốc'],['appt','📅','Lịch khám']
];

/* --- Dựng chỉ mục tìm kiếm từ toàn bộ dữ liệu --- */
function gsBuildIndex(){
  var db=load();var arr=[];
  (db.careEvents||[]).forEach(function(x,i){
    if(!x)return;
    var rawType=x.type||'feed',type=rawType,meta=careTypeMeta(rawType);
    var iso=(x.startDate||x.date||''),time=x.timeFrom||x.time||'';
    var title,syn='';
    if(rawType==='feed'){title=x.amount?(x.amount+' ml'):(x.source==='direct'?'Bú mẹ trực tiếp':x.source==='stored'?'Bú từ kho sữa':'Sữa công thức');syn='be bu cu bu bu me bu binh bu truc tiep sua cong thuc';}
    else if(rawType==='pump'){title=(x.amount||0)+' ml';syn='hut sua vat sua';}
    else if(rawType==='sleep'){title=(x.timeTo?('Ngủ '+fmtMinutes(x.amount||0)):'Bé đang ngủ');syn='ngu giac ngu';}
    else if(rawType==='diaper'){title=diaperTypeLabel((x.extra&&x.extra.diaperType)||'wet');syn='thay ta di te di phan ta uot ta ban te phan';}
    else if(rawType==='pee'){title='Đi tè';syn='di te thay ta';type='diaper';}
    else if(rawType==='poop'){title='Đi phân';syn='di phan thay ta';type='diaper';}
    else if(rawType==='medicine'){title=(x.extra&&x.extra.name)||'Thuốc';syn='thuoc uong thuoc';}
    else if(rawType==='temperature'){title=(x.amount||0)+'°C';syn='than nhiet nhiet do sot';}
    else if(rawType==='spitup'){title=(x.extra&&x.extra.kind)||'Trớ sữa';syn='tro sua no tro';}
    else{title=meta.label;}
    var info='';try{info=careEventText(x)||'';}catch(e){info='';}
    var amtBits=[];if(x.amount){amtBits.push(x.amount+'ml');amtBits.push(x.amount+' ml');amtBits.push(''+x.amount);}
    var extraBits=[];if(x.extra){extraBits=[x.extra.name,x.extra.site,x.extra.side,x.extra.kind,x.extra.level,x.extra.color,x.extra.texture,x.extra.diaperType];}
    var blobRaw=[meta.label,title,info,x.note,syn,x.source,x.storage,x.status].concat(amtBits).concat(extraBits).filter(Boolean).join(' ');
    var blob=gsDeaccent(blobRaw+' '+gsDateForms(iso).join(' ')+' '+gsTimeForms(time));
    arr.push({type:type,idx:i,icon:meta.icon,cat:meta.label,title:title,info:info,note:x.note||'',iso:iso,time:time,when:gsFmtWhen(iso,time),ts:gsTs(iso,time),blob:blob});
  });
  (db.milkInventory||[]).forEach(function(b,i){
    if(!b)return;
    var meta=careTypeMeta('milk'),iso=(b.date||b.startDate||''),time=b.timeFrom||b.time||'';
    var code=milkBagDisplayId(b);
    var statusTxt=(b.status&&b.status!=='Đang bảo quản')?(' · '+b.status):'';
    var info=((b.remaining||0)+'/'+(b.amount||0)+' ml')+(b.storage?(' · '+b.storage):'')+statusTxt;
    var codeVars=[code,String(code).replace(/-\d+$/,''),String(code).replace(/-/g,'')];
    var amtBits=[(b.remaining||0)+'ml',(b.amount||0)+'ml',''+(b.remaining||0),''+(b.amount||0)];
    var blobRaw=[meta.label,code,b.note,b.storage,b.status,'kho sua tui sua'].concat(codeVars).concat(amtBits).filter(Boolean).join(' ');
    var blob=gsDeaccent(blobRaw+' '+gsDateForms(iso).join(' ')+' '+gsTimeForms(time));
    arr.push({type:'milk',idx:i,icon:meta.icon,cat:meta.label,title:code,info:info,note:b.note||'',iso:iso,time:time,when:gsFmtWhen(iso,time),ts:gsTs(iso,time),blob:blob});
  });
  (db.milestones||[]).forEach(function(m){
    if(!m)return;
    var iso=m.date||'',time=m.time||'';
    var info=milestoneCategoryLabel(m.category)+(m.description?(' · '+m.description):'');
    var blobRaw=[m.title,info,m.note,'milestone cot moc hanh trinh phat trien lon khon',m.category].filter(Boolean).join(' ');
    var blob=gsDeaccent(blobRaw+' '+gsDateForms(iso).join(' ')+' '+gsTimeForms(time));
    arr.push({type:'milestone',id:m.id,icon:m.icon||'🏆',cat:'Cột mốc',title:m.title||'(Cột mốc)',info:info,note:m.note||'',iso:iso,time:time,when:gsFmtWhen(iso,time),ts:gsTs(iso,time),blob:blob});
  });
  (db.appointments||[]).forEach(function(a,i){
    if(!a)return;
    var iso=a.date||'',time=a.timeFrom||a.time||'';
    var ttl=a.title||typeLabel(db,a.typeId)||'Lịch khám';
    var info=[a.place,a.doctor,a.status,a.person].filter(Boolean).join(' · ');
    var blobRaw=[ttl,info,a.note,a.typeName,'lich kham tiem xet nghiem sieu am kham thai'].filter(Boolean).join(' ');
    var blob=gsDeaccent(blobRaw+' '+gsDateForms(iso).join(' ')+' '+gsTimeForms(time));
    arr.push({type:'appt',idx:i,icon:'📅',cat:'Lịch khám',title:ttl,info:info,note:a.note||'',iso:iso,time:time,when:gsFmtWhen(iso,time),ts:gsTs(iso,time),blob:blob});
  });
  window.__gsIndex=arr;return arr;
}

/* ===== V13.9.2 · mục 5 — Tìm kiếm gần đúng =====
   Bản cũ bắt buộc MỌI từ khoá phải khớp nguyên văn trong blob (AND tuyệt đối).
   Gõ "sữa mẹ" không ra "Bú mẹ trực tiếp" (blob không có chữ "sua"), gõ sai một
   chữ cái là trắng kết quả — nên cảm giác "không bấm chip thì không tìm được".
   Nay mỗi từ khoá được coi là khớp khi: nằm nguyên trong blob, HOẶC là tiền tố của
   một từ trong blob, HOẶC lệch tối đa 1–2 ký tự (Levenshtein) so với một từ trong blob.
   - Khớp đủ mọi từ khoá  -> nhóm "chính xác", hiện trước.
   - Chỉ khớp một phần    -> nhóm "gần đúng", chỉ hiện khi nhóm trên trống.
   Chip loại và khoảng thời gian vẫn lọc trước, nên chip + ô tìm kiếm luôn kết hợp với nhau. */
function gsWordsOf(it){
  if(it.__w)return it.__w;
  it.__w=String(it.blob||'').split(/[^a-z0-9]+/).filter(function(w){return w.length>0});
  return it.__w;
}
/* V13.9.3: bản dán liền, bỏ hết dấu cách và ký tự lạ.
   "80ml" phải tìm ra bản ghi ghi là "80 ml", "d3k2" phải ra "Vitamin D3 + K2". */
function gsBlobZ(it){
  if(it.__z==null)it.__z=String(it.blob||'').replace(/[^a-z0-9]/g,'');
  return it.__z;
}
function gsTol(tk){var n=tk.length;return n<=3?0:(n<=6?1:2);}
function gsLev(a,b,max){
  if(a===b)return 0;
  var la=a.length,lb=b.length;
  if(Math.abs(la-lb)>max)return max+1;
  if(!la)return lb;if(!lb)return la;
  var prev=new Array(lb+1),cur=new Array(lb+1),i,j;
  for(j=0;j<=lb;j++)prev[j]=j;
  for(i=1;i<=la;i++){
    cur[0]=i;var best=i;
    var ca=a.charAt(i-1);
    for(j=1;j<=lb;j++){
      var cost=(ca===b.charAt(j-1))?0:1;
      var v=prev[j]+1,v2=cur[j-1]+1,v3=prev[j-1]+cost;
      if(v2<v)v=v2;if(v3<v)v=v3;
      cur[j]=v;if(v<best)best=v;
    }
    if(best>max)return max+1;
    for(j=0;j<=lb;j++)prev[j]=cur[j];
  }
  return prev[lb];
}
/* 0 = không khớp · 1 = gần giống · 2 = tiền tố · 3 = khớp nguyên văn */
function gsTokenHit(it,tk){
  if(!tk)return 0;
  if(it.blob.indexOf(tk)>-1)return 3;
  var tkz=tk.replace(/[^a-z0-9]/g,'');
  if(tkz.length>=3&&gsBlobZ(it).indexOf(tkz)>-1)return 3;
  var tol=gsTol(tk);if(!tol)return 0;
  var words=gsWordsOf(it),i,w;
  for(i=0;i<words.length;i++){
    w=words[i];
    if(w.length>tk.length&&w.indexOf(tk)===0)return 2;
    if(Math.abs(w.length-tk.length)<=tol&&gsLev(w,tk,tol)<=tol)return 1;
    if(w.length>tk.length&&gsLev(w.slice(0,tk.length),tk,tol)<=tol)return 1;
  }
  return 0;
}

/* --- Chấm điểm liên quan --- */
function gsScore(it,tokens){
  if(!tokens.length)return it.ts;
  var score=(it.__hit||0)*3,t=gsDeaccent(it.title),cat=gsDeaccent(it.cat),inf=gsDeaccent(it.info),nt=gsDeaccent(it.note);
  tokens.forEach(function(tk){
    var pos=t.indexOf(tk);
    if(pos>-1){score+=6;if(pos===0)score+=3;}
    else if(cat.indexOf(tk)>-1)score+=4;
    else if(inf.indexOf(tk)>-1)score+=2;
    else if(nt.indexOf(tk)>-1)score+=2;
    else score+=1;
  });
  if(tokens.length>1&&t.indexOf(tokens.join(' '))>-1)score+=10;
  return score+it.ts/1e13;
}

/* --- Lọc + sắp xếp --- */
function gsFilter(){
  var st=gsState(),parsed=gsParseQuery(st.q),tokens=parsed.tokens;
  var idx=(window.__gsIndex&&window.__gsIndex.length)?window.__gsIndex:gsBuildIndex();
  var exact=[],fuzzy=[],partial=[];
  for(var k=0;k<idx.length;k++){
    var it=idx[k];
    if(st.types.size&&!st.types.has(it.type))continue;
    if(!gsInRange(it.iso,st.range))continue;
    if(parsed.typedRange&&!gsInRange(it.iso,parsed.typedRange))continue;
    if(!tokens.length){exact.push(it);continue;}
    var matched=0,strong=0,pts=0;
    for(var ti=0;ti<tokens.length;ti++){
      var h=gsTokenHit(it,tokens[ti]);
      if(h>0){matched++;pts+=h;if(h>=3)strong++;}
    }
    if(!matched)continue;
    it.__hit=pts;
    if(strong===tokens.length)exact.push(it);
    else if(matched===tokens.length)fuzzy.push(it);
    else partial.push(it);
  }
  /* Sắp xếp trong TỪNG nhóm rồi mới nối lại, để nhóm khớp chính xác luôn nằm trên. */
  var sortBucket=function(arr){
    if(st.sort==='relevant'&&tokens.length)arr.sort(function(a,b){return gsScore(b,tokens)-gsScore(a,tokens);});
    else if(st.sort==='oldest')arr.sort(function(a,b){return a.ts-b.ts;});
    else arr.sort(function(a,b){return b.ts-a.ts;});
    return arr;
  };
  sortBucket(exact);sortBucket(fuzzy);sortBucket(partial);
  /* Hiện CẢ HAI nhóm: khớp chính xác trước, gần đúng nối ngay sau kèm vạch ngăn.
     Nhóm "một phần" (chỉ khớp vài từ khoá) hay bị loãng nên chỉ dùng khi trên trống. */
  var out=exact.concat(fuzzy),approxFrom=fuzzy.length?exact.length:-1;
  if(!out.length&&partial.length){out=partial;approxFrom=0;}
  return {list:out,tokens:tokens,approxFrom:approxFrom};
}

/* --- Tô sáng từ khóa (escape an toàn, map theo chỉ số đã bỏ dấu) --- */
function gsHighlight(raw,tokens){
  raw=String(raw==null?'':raw);
  if(!tokens||!tokens.length)return esc(raw);
  var low=gsDeaccent(raw);
  if(low.length!==raw.length)return esc(raw);
  var marks=new Array(raw.length);
  var any=false;
  tokens.forEach(function(tk){
    if(!tk)return;
    var from=0,pos;
    while((pos=low.indexOf(tk,from))>-1){
      for(var j=pos;j<pos+tk.length;j++)marks[j]=true;
      any=true;from=pos+tk.length;
    }
  });
  if(!any)return esc(raw);
  var html='',i=0;
  while(i<raw.length){
    if(marks[i]){var j=i;while(j<raw.length&&marks[j])j++;html+='<mark class="gsMark">'+esc(raw.slice(i,j))+'</mark>';i=j;}
    else{var k=i;while(k<raw.length&&!marks[k])k++;html+=esc(raw.slice(i,k));i=k;}
  }
  return html;
}

/* --- Trạng thái --- */
function gsState(){if(!window.__gs)window.__gs={q:'',types:new Set(),range:'all',sort:'newest'};return window.__gs;}

/* --- Render một dòng kết quả (có vuốt trái Sửa/Xóa) --- */
function gsRowHtml(it,tokens){
  var idAttr=(it.id!=null)?(' data-gid="'+esc(String(it.id))+'"'):(' data-gidx="'+it.idx+'"');
  var actions='<div class="gsRowActions">'+
    '<button type="button" class="gsEdit" onclick="gsEditItem(this)">✏️ Sửa</button>'+
    '<button type="button" class="gsDel" onclick="gsDeleteItem(this)">🗑 Xóa</button></div>';
  var infoHtml=it.info?'<div class="gsInfo">'+gsHighlight(it.info,tokens)+'</div>':'';
  var noteHtml=it.note?'<div class="gsNote">📝 '+gsHighlight(it.note,tokens)+'</div>':'';
  return '<div class="gsRow" data-gtype="'+esc(it.type)+'"'+idAttr+' ontouchstart="gsSwipeStart(event,this)" ontouchmove="gsSwipeMove(event,this)" ontouchend="gsSwipeEnd(event,this)" onpointerdown="gsPointerStart(event,this)" onpointermove="gsPointerMove(event,this)" onpointerup="gsPointerEnd(event,this)" onpointercancel="gsPointerEnd(event,this)">'+
    actions+
    '<div class="gsCard" role="button" tabindex="0" onclick="gsOpenItem(this)" onkeydown="if(event.key===\'Enter\'){gsOpenItem(this)}">'+
      '<span class="gsIcon">'+esc(it.icon)+'</span>'+
      '<div class="gsBody">'+
        '<div class="gsCatRow"><span class="gsCat">'+esc(it.cat)+'</span><span class="gsWhen">'+esc(it.when)+'</span></div>'+
        '<div class="gsTitle">'+gsHighlight(it.title,tokens)+'</div>'+
        infoHtml+noteHtml+
      '</div>'+
      '<span class="gsChevron">›</span>'+
    '</div></div>';
}

function gsRender(){
  var box=byId('globalSearchResults');if(!box)return;
  var st=gsState(),countEl=byId('gsCount');
  var hasFilter=(st.q||'').trim().length>0||st.types.size>0||st.range!=='all';

  /* V13.9.4 — Chưa nhập gì và chưa chọn lọc gì thì KHÔNG đổ toàn bộ dữ liệu ra.
     Đổ cả nghìn dòng lúc vừa mở vừa nặng máy vừa không giúp được gì. Bấm chip loại
     hoặc chọn khoảng thời gian vẫn được coi là đã lọc -> vẫn hiện kết quả như cũ. */
  if(!hasFilter){
    var idx=(window.__gsIndex&&window.__gsIndex.length)?window.__gsIndex:gsBuildIndex();
    var total=idx.length;
    var totalTxt=String(total).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
    if(countEl)countEl.textContent=total?(totalTxt+' mục có thể tìm'):'Chưa có dữ liệu';
    box.innerHTML='<div class="gsEmpty"><span>🔍</span><b>'+
      (total?'Nhập từ khóa để bắt đầu tìm':'Chưa có dữ liệu để hiển thị')+'</b><small>'+
      (total?'Ví dụ: 80ml · mã túi sữa · tên thuốc · 24/07 · cột mốc…<br>Hoặc chọn nhanh một loại dữ liệu ở hàng chip phía trên.'
            :'Ghi nhận Bé bú, Hút sữa, Ngủ… để xem lại tại đây.')+
      '</small></div>';
    return;
  }

  var res=gsFilter(),list=res.list,tokens=res.tokens;
  var nExact=(res.approxFrom>0)?res.approxFrom:(res.approxFrom<0?list.length:0);
  if(countEl)countEl.textContent=list.length+' kết quả'+((res.approxFrom>-1&&nExact>0)?(' ('+nExact+' khớp đúng)'):'');
  if(!list.length){
    box.innerHTML='<div class="gsEmpty"><span>🔍</span><b>Không tìm thấy kết quả</b><small>'+
      'Thử từ khóa khác: mã túi sữa, số ml, ngày (24/07), loại (bú, ngủ, thuốc), tên thuốc, milestone…'+
      '</small></div>';
    return;
  }
  var cap=500;
  var shown=list.slice(0,cap);
  var rows='';
  shown.forEach(function(it,i){
    if(res.approxFrom>-1&&i===res.approxFrom){
      rows+='<div class="gsApproxLbl">🔎 '+(res.approxFrom>0?'Kết quả gần đúng':'Không có kết quả khớp hoàn toàn — đây là những dữ liệu gần đúng nhất')+'</div>';
    }
    rows+=gsRowHtml(it,tokens);
  });
  box.innerHTML=rows+
    (list.length>cap?'<div class="gsMore">Đang hiển thị '+cap+'/'+list.length+' kết quả — nhập thêm từ khóa để thu hẹp.</div>':'');
}

function gsRenderChips(){
  var box=byId('gsTypeChips'),st=gsState();
  if(box){box.innerHTML=GS_TYPE_CHIPS.map(function(c){var on=st.types.has(c[0]);return '<button type="button" class="gsChip'+(on?' on':'')+'" onclick="gsToggleType(\''+c[0]+'\',this)">'+c[1]+' '+esc(c[2])+'</button>';}).join('');}
  document.querySelectorAll('.gsRangeChip').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-range')===st.range&&st.range!=='all');});
  document.querySelectorAll('.gsSortBtn').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-sort')===st.sort);});
}

/* --- Điều khiển bộ lọc/sắp xếp --- */
function gsOnInput(el){var st=gsState();st.q=el.value||'';var clr=byId('gsClearBtn');if(clr)clr.classList.toggle('hidden',!st.q);if(window.__gsDeb)clearTimeout(window.__gsDeb);window.__gsDeb=setTimeout(gsRender,110);}
function gsClearQuery(){var st=gsState();st.q='';var inp=byId('globalSearchInput');if(inp){inp.value='';inp.focus({preventScroll:true});}var clr=byId('gsClearBtn');if(clr)clr.classList.add('hidden');gsRender();}
function gsToggleType(t,el){var st=gsState();if(st.types.has(t)){st.types.delete(t);if(el)el.classList.remove('on');}else{st.types.add(t);if(el)el.classList.add('on');}gsRender();}
function gsSetRange(r,el){var st=gsState();st.range=(st.range===r?'all':r);document.querySelectorAll('.gsRangeChip').forEach(function(b){b.classList.remove('on');});if(st.range!=='all'&&el)el.classList.add('on');gsRender();}
function gsSetSort(v,el){gsState().sort=v;document.querySelectorAll('.gsSortBtn').forEach(function(b){b.classList.remove('on');});if(el)el.classList.add('on');gsRender();}

/* --- Mở / đóng overlay --- */
function openGlobalSearch(){
  var ov=byId('globalSearchOverlay');if(!ov)return;
  var st=gsState();closeMenu();gsBuildIndex();
  var inp=byId('globalSearchInput');if(inp)inp.value=st.q||'';
  var clr=byId('gsClearBtn');if(clr)clr.classList.toggle('hidden',!(st.q||'').length);
  gsRenderChips();
  ov.classList.add('show');
  window.__gsScrollY=window.scrollY||document.documentElement.scrollTop||0;
  document.body.style.top='-'+window.__gsScrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';
  document.body.classList.add('careModalOpen');
  gsRender();
  setTimeout(function(){var f=byId('globalSearchInput');if(f)f.focus({preventScroll:true});},120);
}
function closeGlobalSearch(){
  var ov=byId('globalSearchOverlay');if(ov)ov.classList.remove('show');
  document.body.classList.remove('careModalOpen');
  document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';
  var y=window.__gsScrollY||0;if(y)window.scrollTo(0,y);
}
function gsAfterMutation(){try{render();}catch(e){}gsBuildIndex();gsRender();}

/* --- Vuốt sang trái để lộ Sửa/Xóa (mô phỏng đúng cơ chế các danh sách khác) --- */
function gsCloseOtherSwipes(cur){document.querySelectorAll('.gsRow.open').forEach(function(r){if(r!==cur)r.classList.remove('open');});}
function gsSwipeStart(e,el){var t=e.touches&&e.touches[0];if(!t)return;el.__sx=t.clientX;el.__sy=t.clientY;el.__sw=false;el.__hz=false;}
function gsSwipeMove(e,el){if(el.__sx==null)return;var t=e.touches&&e.touches[0];if(!t)return;var dx=t.clientX-el.__sx,dy=t.clientY-el.__sy;if(!el.__hz&&Math.abs(dx)>14){if(Math.abs(dx)<=Math.abs(dy)*1.25)return;el.__hz=true;}if(!el.__hz)return;el.__sw=true;e.preventDefault();if(dx<=-42){gsCloseOtherSwipes(el);el.classList.add('open');}else if(dx>=32){el.classList.remove('open');}}
function gsSwipeEnd(e,el){if(el.__sw){window.__gsSwipeLock=true;setTimeout(function(){window.__gsSwipeLock=false;},250);}el.__sx=null;el.__sy=null;el.__sw=false;el.__hz=false;}
function gsPointerStart(e,el){if(e.pointerType==='touch')return;el.__px=e.clientX;el.__py=e.clientY;el.__pd=false;el.__ph=false;}
function gsPointerMove(e,el){if(el.__px==null)return;var dx=e.clientX-el.__px,dy=e.clientY-el.__py;if(!el.__ph&&Math.abs(dx)>14){if(Math.abs(dx)<=Math.abs(dy)*1.25)return;el.__ph=true;}if(!el.__ph)return;el.__pd=true;if(dx<=-42){gsCloseOtherSwipes(el);el.classList.add('open');}else if(dx>=32){el.classList.remove('open');}}
function gsPointerEnd(e,el){if(el.__pd){window.__gsSwipeLock=true;setTimeout(function(){window.__gsSwipeLock=false;},250);}el.__px=null;el.__py=null;el.__pd=false;el.__ph=false;}

/* --- Định tuyến hành động theo loại dữ liệu --- */
function gsRowOf(node){return node&&node.closest?node.closest('.gsRow'):null;}
var GS_CARE_TYPES=['feed','pump','sleep','diaper','medicine','temperature','spitup','pee','poop'];
function gsOpenItem(node){
  if(window.__gsSwipeLock)return;
  var row=gsRowOf(node);if(!row)return;
  var opened=document.querySelector('.gsRow.open');if(opened){opened.classList.remove('open');return;}
  var t=row.getAttribute('data-gtype'),idx=Number(row.getAttribute('data-gidx')),id=row.getAttribute('data-gid');
  closeGlobalSearch();
  setTimeout(function(){
    if(t==='milk')openMilkBagDetail(idx);
    else if(t==='milestone')openMilestoneDetail(id);
    else if(t==='appt')editAppointment(idx);
    else openCareEventFromDashboard(idx);
  },80);
}
function gsEditItem(node){
  var row=gsRowOf(node);if(!row)return;
  var t=row.getAttribute('data-gtype'),idx=Number(row.getAttribute('data-gidx')),id=row.getAttribute('data-gid');
  closeGlobalSearch();
  setTimeout(function(){
    if(t==='milk')editMilkBagFromInventory(idx);
    else if(t==='milestone')openMilestoneDetail(id);
    else if(t==='appt')editAppointment(idx);
    else editCareEvent(idx);
  },80);
}
function gsDeleteItem(node){
  var row=gsRowOf(node);if(!row)return;
  var t=row.getAttribute('data-gtype'),idx=Number(row.getAttribute('data-gidx')),id=row.getAttribute('data-gid');
  if(t==='milk'){cancelMilkBag(idx);gsAfterMutation();return;}
  if(GS_CARE_TYPES.indexOf(t)>-1){deleteCareEvent(idx);gsAfterMutation();return;}
  if(t==='appt'){delAppointment(idx);gsAfterMutation();return;}
  if(t==='milestone'){var m=(load().milestones||[]).find(function(z){return String(z.id)===String(id);});if(m&&m.auto){showToast('Cột mốc tự động không thể xóa, chỉ có thể sửa ghi chú/ảnh','warn');return;}if(!confirm('Xóa cột mốc này?'))return;var db2=load();var __udBefore2=JSON.stringify(db2);db2.milestones=(db2.milestones||[]).filter(function(z){return String(z.id)!==String(id);});save(db2);udShow('Đã xóa cột mốc.',__udBefore2);showToast('Đã xóa cột mốc','success');gsAfterMutation();return;}
}


/* ============================================================================
   💾 V13.0.0 · BACKUP & VERSION CONTROL DỮ LIỆU
   Lưu nhiều phiên bản (Version) của toàn bộ DB trong IndexedDB RIÊNG — không đụng
   localStorage chính (KEY), không sửa exportDB/importDB/save/load (Baseline Lock
   + hàm gốc). Toàn bộ hàm mới dùng tiền tố bk*.
   - Backup thủ công + tự động (kiểm tra khi mở app, không chạy nền khi app đóng)
   - Danh sách Version dạng Timeline, Restore kèm Preview khác biệt
   - Export JSON / ZIP / SQLite / CSV (JSZip & sql.js tải lười qua CDN khi cần)
   - Import JSON / ZIP / SQLite, Ghi đè hoặc Gộp (trùng ID: Bỏ qua/Ghi đè/Giữ cả hai)
   ============================================================================ */
var BK_DB_NAME='meYeuBeBackupDB',BK_DB_VER=1,BK_STORE_V='versions',BK_STORE_M='meta';
var BK_AUTO_CAP=20; // giữ tối đa 20 bản TỰ ĐỘNG gần nhất; bản thủ công không tự xoá
var BK_SQLJS_VER='1.10.3',BK_JSZIP_VER='3.10.1';

function bkOpenDB(){
  return new Promise(function(resolve,reject){
    if(!window.indexedDB){reject(new Error('Trình duyệt không hỗ trợ IndexedDB'));return}
    var req=indexedDB.open(BK_DB_NAME,BK_DB_VER);
    req.onupgradeneeded=function(e){
      var db=e.target.result;
      if(!db.objectStoreNames.contains(BK_STORE_V)){
        var st=db.createObjectStore(BK_STORE_V,{keyPath:'id'});
        st.createIndex('createdAt','createdAt',{unique:false});
        st.createIndex('type','type',{unique:false});
      }
      if(!db.objectStoreNames.contains(BK_STORE_M))db.createObjectStore(BK_STORE_M,{keyPath:'key'});
    };
    req.onsuccess=function(e){resolve(e.target.result)};
    req.onerror=function(e){reject(e.target.error)};
  });
}
function bkPromise(req){return new Promise(function(res,rej){req.onsuccess=function(){res(req.result)};req.onerror=function(){rej(req.error)}})}
function bkTx(storeName,mode){return bkOpenDB().then(function(db){return db.transaction(storeName,mode).objectStore(storeName)})}

function bkGetMeta(key,def){return bkTx(BK_STORE_M,'readonly').then(function(st){return bkPromise(st.get(key))}).then(function(r){return r?r.value:def})}
function bkSetMeta(key,value){return bkTx(BK_STORE_M,'readwrite').then(function(st){return bkPromise(st.put({key:key,value:value}))})}
function bkNextVersionNumber(){return bkGetMeta('versionCounter',0).then(function(n){var next=(Number(n)||0)+1;return bkSetMeta('versionCounter',next).then(function(){return next})})}

function bkListVersions(){
  return bkTx(BK_STORE_V,'readonly').then(function(st){return bkPromise(st.getAll())}).then(function(list){
    return (list||[]).sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'')});
  });
}
function bkGetVersion(id){return bkTx(BK_STORE_V,'readonly').then(function(st){return bkPromise(st.get(id))})}
function bkDeleteVersionRow(id){return bkTx(BK_STORE_V,'readwrite').then(function(st){return bkPromise(st.delete(id))})}
function bkPutVersion(row){return bkTx(BK_STORE_V,'readwrite').then(function(st){return bkPromise(st.put(row))})}
function bkByteSize(str){try{return new Blob([str]).size}catch(e){return (str||'').length}}

function bkSummaryOf(db){
  db=db||{};
  var ce=db.careEvents||[];
  function cnt(t){return ce.filter(function(x){return x&&x.type===t}).length}
  return {
    feed:cnt('feed'),pump:cnt('pump'),sleep:cnt('sleep'),diaper:cnt('diaper'),medicine:cnt('medicine'),
    temperature:cnt('temperature'),spitup:cnt('spitup'),careTotal:ce.length,
    milk:(db.milkInventory||[]).length,milestone:(db.milestones||[]).length,
    appointment:(db.appointments||[]).length,diary:(db.diary||[]).length,
    healthBook:(db.healthBook||[]).length,pregnancy:(db.pregnancy||[]).length,
    baby:(db.baby||[]).length,mom:(db.mom||[]).length
  };
}

function bkCreateVersion(opts){
  opts=opts||{};
  var db=load(); // hàm gốc — chỉ đọc, không sửa dữ liệu hiện tại
  var json=JSON.stringify(db);
  return bkNextVersionNumber().then(function(vn){
    var row={
      id:'bk_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
      versionNumber:vn,
      createdAt:new Date().toISOString(),
      type:opts.type||'manual',
      creator:opts.type==='auto'?'Tự động':'Bạn',
      note:opts.note||'',
      sizeBytes:bkByteSize(json),
      summary:bkSummaryOf(db),
      data:json
    };
    return bkPutVersion(row).then(function(){return row});
  });
}

/* --- Định dạng hiển thị --- */
function bkFmtSize(bytes){
  if(bytes==null)return '--';
  if(bytes<1024)return bytes+' B';
  if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' KB';
  return (bytes/1024/1024).toFixed(2)+' MB';
}
function bkFmtDateTime(iso){
  try{var d=new Date(iso);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}catch(e){return iso||''}
}

/* --- So sánh khác biệt giữa 2 bản DB (cho Preview trước khi Restore/Nhập) --- */
function bkIdSet(arr){var s={};(arr||[]).forEach(function(x){if(x&&x.id!=null)s[x.id]=true});return s}
function bkDiffById(oldArr,newArr){
  var o=bkIdSet(oldArr),n=bkIdSet(newArr),added=0,removed=0;
  Object.keys(n).forEach(function(k){if(!o[k])added++});
  Object.keys(o).forEach(function(k){if(!n[k])removed++});
  return {added:added,removed:removed};
}
function bkDiffCareByType(oldCe,newCe,type){
  var o={},n={};
  (oldCe||[]).forEach(function(x){if(x&&x.type===type&&x.id!=null)o[x.id]=true});
  (newCe||[]).forEach(function(x){if(x&&x.type===type&&x.id!=null)n[x.id]=true});
  var added=0,removed=0;
  Object.keys(n).forEach(function(k){if(!o[k])added++});
  Object.keys(o).forEach(function(k){if(!n[k])removed++});
  return {added:added,removed:removed};
}
var BK_CARE_TYPE_LABELS=[['feed','Bé bú'],['pump','Hút sữa'],['sleep','Ngủ'],['diaper','Thay tã'],['medicine','Uống thuốc'],['temperature','Nhiệt độ'],['spitup','Trớ sữa']];
var BK_COUNT_ONLY_LABELS=[['appointments','Lịch khám'],['diary','Nhật ký'],['healthBook','Sổ sức khỏe'],['pregnancy','Chỉ số thai kỳ'],['baby','Chỉ số bé'],['mom','Chỉ số mẹ']];
function bkComputeDiff(oldDb,newDb){
  oldDb=oldDb||{};newDb=newDb||{};
  var lines=[];
  BK_CARE_TYPE_LABELS.forEach(function(pair){
    var d=bkDiffCareByType(oldDb.careEvents,newDb.careEvents,pair[0]);
    if(d.added||d.removed)lines.push({label:pair[1],added:d.added,removed:d.removed,kind:'id'});
  });
  var milk=bkDiffById(oldDb.milkInventory,newDb.milkInventory);
  if(milk.added||milk.removed)lines.push({label:'Túi sữa',added:milk.added,removed:milk.removed,kind:'id'});
  var ms=bkDiffById(oldDb.milestones,newDb.milestones);
  if(ms.added||ms.removed)lines.push({label:'Milestone',added:ms.added,removed:ms.removed,kind:'id'});
  BK_COUNT_ONLY_LABELS.forEach(function(pair){
    var oc=(oldDb[pair[0]]||[]).length,nc=(newDb[pair[0]]||[]).length;
    if(oc!==nc)lines.push({label:pair[1],delta:nc-oc,kind:'count'});
  });
  return lines;
}
function bkDiffHtml(diff){
  if(!diff.length)return '<p class="notice">Không có khác biệt về số lượng bản ghi so với dữ liệu hiện tại.</p>';
  return '<div class="bkDiffList">'+diff.map(function(d){
    if(d.kind==='count')return '<div class="bkDiffRow"><span>'+esc(d.label)+'</span><b class="'+(d.delta>0?'bkPos':'bkNeg')+'">'+(d.delta>0?'+':'')+d.delta+'</b></div>';
    var parts=[];if(d.added)parts.push('<b class="bkPos">+'+d.added+'</b>');if(d.removed)parts.push('<b class="bkNeg">−'+d.removed+'</b>');
    return '<div class="bkDiffRow"><span>'+esc(d.label)+'</span>'+parts.join(' ')+'</div>';
  }).join('')+'</div>';
}

/* --- Danh sách Version dạng Timeline --- */
function bkRenderVersionsPanel(){
  var el=byId('bkVersionList');if(!el)return;
  el.innerHTML='<p class="notice">Đang tải...</p>';
  bkListVersions().then(function(list){
    if(!list.length){el.innerHTML='<p class="notice">Chưa có Backup nào. Bấm "📸 Tạo Backup" để lưu phiên bản đầu tiên.</p>';return}
    var totalBytes=list.reduce(function(t,r){return t+(r.sizeBytes||0)},0);
    var head='<p class="notice">'+list.length+' phiên bản · Tổng dung lượng '+bkFmtSize(totalBytes)+'</p>';
    el.innerHTML=head+'<div class="bkTimeline">'+list.map(function(r){
      return '<div class="bkTimelineItem">'+
        '<div class="bkTimelineDot '+(r.type==='auto'?'bkDotAuto':'')+'"></div>'+
        '<div class="bkTimelineCard">'+
          '<div class="bkTimelineTop"><b>v'+r.versionNumber+'</b><span class="bkBadge '+(r.type==='auto'?'bkBadgeAuto':'bkBadgeManual')+'">'+(r.type==='auto'?'Tự động':'Thủ công')+'</span></div>'+
          '<small>'+bkFmtDateTime(r.createdAt)+' · '+bkFmtSize(r.sizeBytes)+' · '+esc(r.creator||'')+'</small>'+
          (r.note?'<p class="bkNote">📝 '+esc(r.note)+'</p>':'')+
          '<div class="btns bkRowBtns">'+
            '<button class="secondary" onclick="bkOpenRestorePreview(\''+r.id+'\')">↩️ Restore</button>'+
            '<button class="ghost" onclick="bkOpenExportMenu(\''+r.id+'\')">⬇️ Xuất</button>'+
            '<button class="danger" onclick="bkDeleteVersion(\''+r.id+'\')">🗑 Xoá</button>'+
          '</div>'+
        '</div>'+
      '</div>';
    }).join('')+'</div>';
  }).catch(function(e){el.innerHTML='<p class="notice">Không tải được danh sách Backup: '+esc(e&&e.message||e)+'</p>'});
}
function bkDeleteVersion(id){
  if(!confirm('Xoá phiên bản Backup này? Không thể hoàn tác.'))return;
  bkDeleteVersionRow(id).then(function(){showToast('Đã xoá phiên bản','success');bkRenderVersionsPanel()});
}
function bkCreateManualBackup(){
  var noteEl=byId('bkManualNote');
  var note=(noteEl&&noteEl.value||'').trim();
  bkCreateVersion({type:'manual',note:note}).then(function(row){
    if(noteEl)noteEl.value='';
    showToast('Đã tạo Backup v'+row.versionNumber,'success');
    bkRenderVersionsPanel();
  }).catch(function(e){showToast('Không tạo được Backup: '+(e&&e.message||e),'error')});
}

/* --- Restore kèm Preview khác biệt --- */
var __bkRestoreTargetId=null;
function bkOpenRestorePreview(id){
  __bkRestoreTargetId=id;
  bkGetVersion(id).then(function(row){
    if(!row){showToast('Không tìm thấy phiên bản','error');return}
    var newDb;try{newDb=JSON.parse(row.data)}catch(e){showToast('Dữ liệu phiên bản bị lỗi','error');return}
    var curDb=load();
    var diff=bkComputeDiff(curDb,newDb);
    var html='<p><b>Version v'+row.versionNumber+'</b> · '+bkFmtDateTime(row.createdAt)+'</p>';
    html+='<p>Dung lượng: '+bkFmtSize(row.sizeBytes)+' · Người tạo: '+esc(row.creator||'')+'</p>';
    if(row.note)html+='<p class="notice">📝 '+esc(row.note)+'</p>';
    html+=bkDiffHtml(diff);
    var body=byId('bkRestorePreviewBody');if(body)body.innerHTML=html;
    var txt=byId('bkRestoreConfirmText');if(txt)txt.value='';
    var ov=byId('bkRestoreOverlay');if(ov){ov.classList.add('show');document.body.classList.add('careModalOpen')}
  });
}
function bkCloseRestorePreview(){var ov=byId('bkRestoreOverlay');if(ov)ov.classList.remove('show');document.body.classList.remove('careModalOpen')}
function bkConfirmRestore(){
  var txt=((byId('bkRestoreConfirmText')&&byId('bkRestoreConfirmText').value)||'').trim().toUpperCase();
  if(txt!=='KHOIPHUC'){showToast('Nhập đúng KHOIPHUC để xác nhận','warn');return}
  var id=__bkRestoreTargetId;if(!id)return;
  bkGetVersion(id).then(function(row){
    if(!row)return;
    var newDb;try{newDb=JSON.parse(row.data)}catch(e){showToast('Dữ liệu phiên bản bị lỗi','error');return}
    save(newDb); // hàm gốc — ghi đè toàn bộ DB hiện tại + tự render()
    bkCloseRestorePreview();
    showToast('Đã khôi phục v'+row.versionNumber,'success');
    bkRenderVersionsPanel();
  });
}

/* --- Backup tự động: chỉ kiểm tra khi mở app (PWA không chạy nền khi đã đóng) --- */
function bkDefaultAutoConfig(){return {mode:'off',changeThreshold:20,lastAutoBackupAt:null}}
function bkGetAutoConfig(){return bkGetMeta('autoConfig',null).then(function(c){return c||bkDefaultAutoConfig()})}
function bkSaveAutoConfigFromForm(){
  var mode=(byId('bkAutoMode')&&byId('bkAutoMode').value)||'off';
  var th=Number((byId('bkAutoThreshold')&&byId('bkAutoThreshold').value)||20)||20;
  bkGetAutoConfig().then(function(cfg){
    cfg.mode=mode;cfg.changeThreshold=th;
    return bkSetMeta('autoConfig',cfg);
  }).then(function(){showToast('Đã lưu cấu hình Backup tự động','success');bkRenderAutoConfigForm()});
}
function bkAutoModeChanged(){var v=(byId('bkAutoMode')&&byId('bkAutoMode').value)||'off';var box=byId('bkAutoThresholdRow');if(box)box.classList.toggle('hidden',v!=='changes')}
function bkRenderAutoConfigForm(){
  bkGetAutoConfig().then(function(cfg){
    if(byId('bkAutoMode'))byId('bkAutoMode').value=cfg.mode||'off';
    if(byId('bkAutoThreshold'))byId('bkAutoThreshold').value=cfg.changeThreshold||20;
    var box=byId('bkAutoThresholdRow');if(box)box.classList.toggle('hidden',cfg.mode!=='changes');
    var info=byId('bkAutoLastInfo');
    if(info)info.textContent=cfg.lastAutoBackupAt?('Backup tự động gần nhất: '+bkFmtDateTime(cfg.lastAutoBackupAt)):'Chưa có Backup tự động nào.';
  });
}
function bkDaysBetween(a,b){return Math.abs(new Date(b)-new Date(a))/86400000}
function bkPruneAutoVersions(){
  return bkListVersions().then(function(list){
    var autos=list.filter(function(r){return r.type==='auto'}); // đã sort mới nhất trước
    var toRemove=autos.slice(BK_AUTO_CAP);
    return Promise.all(toRemove.map(function(r){return bkDeleteVersionRow(r.id)}));
  });
}
var BK_MODE_LABEL={daily:'hằng ngày',weekly:'hằng tuần',monthly:'hằng tháng'};
function bkAutoBackupCheck(){
  return bkGetAutoConfig().then(function(cfg){
    if(!cfg||cfg.mode==='off')return;
    if(cfg.mode==='changes'){
      return bkListVersions().then(function(list){
        var lastAuto=list.filter(function(r){return r.type==='auto'})[0];
        var baseline=lastAuto?JSON.parse(lastAuto.data):{};
        var cur=load();
        var diff=bkComputeDiff(baseline,cur);
        var totalChange=diff.reduce(function(t,d){return t+(d.kind==='id'?(d.added+d.removed):Math.abs(d.delta||0))},0);
        if(totalChange>=(cfg.changeThreshold||20)){
          return bkCreateVersion({type:'auto',note:'Tự động: đủ '+totalChange+' thay đổi'}).then(function(){
            cfg.lastAutoBackupAt=new Date().toISOString();
            return bkSetMeta('autoConfig',cfg);
          }).then(bkPruneAutoVersions);
        }
      });
    }
    var due=false,last=cfg.lastAutoBackupAt;
    if(!last)due=true;
    else{
      var days=bkDaysBetween(last,new Date().toISOString());
      var need=cfg.mode==='daily'?1:(cfg.mode==='weekly'?7:30);
      if(days>=need)due=true;
    }
    if(due){
      return bkCreateVersion({type:'auto',note:'Tự động ('+(BK_MODE_LABEL[cfg.mode]||cfg.mode)+')'}).then(function(){
        cfg.lastAutoBackupAt=new Date().toISOString();
        return bkSetMeta('autoConfig',cfg);
      }).then(bkPruneAutoVersions);
    }
  }).catch(function(e){console.error('bkAutoBackupCheck',e)});
}

/* --- Tải thư viện ngoài khi cần (không nạp sẵn để không làm nặng lúc mở app) --- */
function bkLoadScript(src){
  return new Promise(function(res,rej){
    if(document.querySelector('script[data-bk-lib="'+src+'"]')){res();return}
    var s=document.createElement('script');s.src=src;s.setAttribute('data-bk-lib',src);
    s.onload=function(){res()};s.onerror=function(){rej(new Error('Không tải được thư viện cần mạng: '+src))};
    document.head.appendChild(s);
  });
}
function bkEnsureJSZip(){if(window.JSZip)return Promise.resolve();return bkLoadScript('https://cdn.jsdelivr.net/npm/jszip@'+BK_JSZIP_VER+'/dist/jszip.min.js')}
function bkEnsureSqlJs(){if(window.initSqlJs)return Promise.resolve();return bkLoadScript('https://cdn.jsdelivr.net/npm/sql.js@'+BK_SQLJS_VER+'/dist/sql-wasm.js')}
function bkSqlJsInit(){return bkEnsureSqlJs().then(function(){return initSqlJs({locateFile:function(f){return 'https://cdn.jsdelivr.net/npm/sql.js@'+BK_SQLJS_VER+'/dist/'+f}})})}

/* --- Xuất dữ liệu: JSON / ZIP / SQLite / CSV --- */
function bkDownloadBlob(blob,filename){
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
}
var __bkExportTarget=null;
function bkOpenExportMenu(id){__bkExportTarget={kind:'version',id:id};var ov=byId('bkExportOverlay');if(ov){ov.classList.add('show');document.body.classList.add('careModalOpen')}}
function bkOpenExportMenuCurrent(){__bkExportTarget={kind:'current'};var ov=byId('bkExportOverlay');if(ov){ov.classList.add('show');document.body.classList.add('careModalOpen')}}
function bkCloseExportMenu(){var ov=byId('bkExportOverlay');if(ov)ov.classList.remove('show');document.body.classList.remove('careModalOpen')}
function bkRunExport(format){
  var t=__bkExportTarget;if(!t)return;
  bkCloseExportMenu();
  if(t.kind==='current'){bkExportData(load(),'hien-tai',format);return}
  bkGetVersion(t.id).then(function(row){
    if(!row)return;
    var db;try{db=JSON.parse(row.data)}catch(e){showToast('Dữ liệu phiên bản bị lỗi','error');return}
    bkExportData(db,'v'+row.versionNumber,format);
  });
}
function bkExportData(db,label,format){
  var base='me-yeu-be-'+label+'-'+today();
  if(format==='json'){
    var payload={__meyeube_backup__:true,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),summary:bkSummaryOf(db),data:db};
    bkDownloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),base+'.json');
    return;
  }
  if(format==='zip'){bkExportZip(db,base);return}
  if(format==='sqlite'){bkExportSqlite(db,base);return}
  if(format==='csv'){bkExportCsvZip(db,base);return}
}
function bkExportZip(db,base){
  showToast('Đang chuẩn bị ZIP...','info');
  bkEnsureJSZip().then(function(){
    var zip=new JSZip();
    zip.file('database.json',JSON.stringify(db,null,2));
    zip.file('manifest.json',JSON.stringify({app:'MeYeuBe',appVersion:APP_VERSION,exportedAt:new Date().toISOString(),summary:bkSummaryOf(db)},null,2));
    return zip.generateAsync({type:'blob'});
  }).then(function(blob){bkDownloadBlob(blob,base+'.zip')}).catch(function(e){showToast('Xuất ZIP thất bại: '+(e&&e.message||e),'error')});
}
function bkCsvEscape(v){
  if(v==null)return '';
  var s=typeof v==='object'?JSON.stringify(v):String(v);
  if(/[",\n]/.test(s))s='"'+s.replace(/"/g,'""')+'"';
  return s;
}
function bkArrayToCsv(arr){
  arr=arr||[];if(!arr.length)return '';
  var cols={};arr.forEach(function(r){Object.keys(r||{}).forEach(function(k){cols[k]=true})});
  var keys=Object.keys(cols);
  var lines=[keys.join(',')];
  arr.forEach(function(r){lines.push(keys.map(function(k){return bkCsvEscape(r?r[k]:'')}).join(','))});
  return lines.join('\n');
}
function bkExportCsvZip(db,base){
  showToast('Đang chuẩn bị CSV...','info');
  bkEnsureJSZip().then(function(){
    var zip=new JSZip();
    var tables={
      'be_bu_va_cham_soc':(db.careEvents||[]),'kho_sua':(db.milkInventory||[]),'milestone':(db.milestones||[]),
      'lich_kham':(db.appointments||[]),'nhat_ky':(db.diary||[]),'so_suc_khoe':(db.healthBook||[]),
      'chi_so_thai_ky':(db.pregnancy||[]),'chi_so_be':(db.baby||[]),'chi_so_me':(db.mom||[])
    };
    Object.keys(tables).forEach(function(name){zip.file(name+'.csv',bkArrayToCsv(tables[name]))});
    zip.file('_settings.json',JSON.stringify(db.settings||{},null,2));
    return zip.generateAsync({type:'blob'});
  }).then(function(blob){bkDownloadBlob(blob,base+'-csv.zip')}).catch(function(e){showToast('Xuất CSV thất bại: '+(e&&e.message||e),'error')});
}
function bkSqlVal(v){if(v==null)return null;if(typeof v==='object')return JSON.stringify(v);return v}
var BK_SQL_TABLES=[
  {name:'care_events',rows:function(db){return db.careEvents||[]},cols:[['id','id'],['type','type'],['start_date','startDate'],['time_from','timeFrom'],['end_date','endDate'],['time_to','timeTo'],['amount','amount'],['unit','unit'],['source','source'],['note','note']]},
  {name:'milk_inventory',rows:function(db){return db.milkInventory||[]},cols:[['id','id'],['code','code'],['status','status'],['storage','storage'],['amount','amount'],['remaining','remaining'],['created_at','createdAt'],['expires_at','expiresAt'],['note','note']]},
  {name:'milestones',rows:function(db){return db.milestones||[]},cols:[['id','id'],['title','title'],['type','type'],['date','date'],['note','note'],['auto','auto']]},
  {name:'appointments',rows:function(db){return db.appointments||[]},cols:[['type_id','typeId'],['type_name','typeName'],['date','date'],['time','time'],['note','note']]},
  {name:'diary',rows:function(db){return db.diary||[]},cols:[['date','date'],['title','title'],['note','note']]},
  {name:'health_book',rows:function(db){return db.healthBook||[]},cols:[['person','person'],['full_name','fullName'],['date','date'],['dob','dob'],['blood','blood'],['height','height'],['weight','weight'],['allergy','allergy']]},
  {name:'pregnancy_stats',rows:function(db){return db.pregnancy||[]},cols:[['date','date'],['week','week'],['weight','weight'],['note','note']]},
  {name:'baby_stats',rows:function(db){return db.baby||[]},cols:[['date','date'],['weight','weight'],['length','length'],['head','head'],['note','note']]},
  {name:'mom_stats',rows:function(db){return db.mom||[]},cols:[['date','date'],['weight','weight'],['bp','bp'],['note','note']]}
];
function bkExportSqlite(db,base){
  showToast('Đang chuẩn bị SQLite (cần mạng lần đầu để tải thư viện)...','info');
  bkSqlJsInit().then(function(SQL){
    var sdb=new SQL.Database();
    BK_SQL_TABLES.forEach(function(t){
      var colDefs=t.cols.map(function(c){return c[0]}).concat(['raw_json TEXT']).join(', '); // không ép TEXT để cột số (amount, weight, week…) giữ đúng kiểu số khi truy vấn ngoài
      sdb.run('CREATE TABLE '+t.name+' ('+colDefs+')');
      var rows=t.rows(db);
      if(rows.length){
        var placeholders=t.cols.map(function(){return '?'}).concat(['?']).join(',');
        var stmt=sdb.prepare('INSERT INTO '+t.name+' ('+t.cols.map(function(c){return c[0]}).join(',')+',raw_json) VALUES ('+placeholders+')');
        rows.forEach(function(r){
          var vals=t.cols.map(function(c){return bkSqlVal(r?r[c[1]]:null)});
          vals.push(JSON.stringify(r));
          stmt.run(vals);
        });
        stmt.free();
      }
    });
    sdb.run('CREATE TABLE app_settings (raw_json TEXT)');
    var s2=sdb.prepare('INSERT INTO app_settings (raw_json) VALUES (?)');s2.run([JSON.stringify(db.settings||{})]);s2.free();
    var binaryArray=sdb.export();
    sdb.close();
    return new Blob([binaryArray],{type:'application/x-sqlite3'});
  }).then(function(blob){bkDownloadBlob(blob,base+'.sqlite')}).catch(function(e){showToast('Xuất SQLite thất bại: '+(e&&e.message||e),'error')});
}

/* --- Nhập dữ liệu: JSON / ZIP / SQLite, Ghi đè hoặc Gộp --- */
function bkParseJsonPayload(text){
  var obj=JSON.parse(text);
  if(obj&&obj.__meyeube_backup__&&obj.data)return {meta:{appVersion:obj.appVersion,exportedAt:obj.exportedAt},db:obj.data};
  return {meta:null,db:obj}; // định dạng cũ (Xuất DB JSON gốc) — không có bọc envelope
}
var BK_SQLITE_TABLE_MAP={care_events:'careEvents',milk_inventory:'milkInventory',milestones:'milestones',appointments:'appointments',diary:'diary',health_book:'healthBook',pregnancy_stats:'pregnancy',baby_stats:'baby',mom_stats:'mom'};
function bkReadImportFile(file){
  var name=(file.name||'').toLowerCase();
  if(name.endsWith('.zip')){
    return bkEnsureJSZip().then(function(){return JSZip.loadAsync(file)}).then(function(zip){
      var dbFile=zip.file('database.json');
      if(!dbFile)throw new Error('File ZIP không đúng định dạng backup (thiếu database.json)');
      return dbFile.async('string').then(function(txt){
        var db=JSON.parse(txt);
        var mf=zip.file('manifest.json');
        if(!mf)return {db:db,meta:null};
        return mf.async('string').then(function(m){var meta=null;try{meta=JSON.parse(m)}catch(e){}return {db:db,meta:meta}});
      });
    });
  }
  if(name.endsWith('.sqlite')||name.endsWith('.db')){
    return file.arrayBuffer().then(function(buf){
      return bkSqlJsInit().then(function(SQL){
        var sdb=new SQL.Database(new Uint8Array(buf));
        var db={};
        Object.keys(BK_SQLITE_TABLE_MAP).forEach(function(tname){
          try{
            var res=sdb.exec('SELECT raw_json FROM '+tname);
            var rows=(res[0]&&res[0].values||[]).map(function(v){try{return JSON.parse(v[0])}catch(e){return null}}).filter(Boolean);
            db[BK_SQLITE_TABLE_MAP[tname]]=rows;
          }catch(e){/* bảng không có trong file này — bỏ qua */}
        });
        try{var s=sdb.exec('SELECT raw_json FROM app_settings');if(s[0]&&s[0].values[0])db.settings=JSON.parse(s[0].values[0][0]);}catch(e){}
        sdb.close();
        return {db:db,meta:{appVersion:'(khôi phục từ SQLite)'}};
      });
    });
  }
  return file.text().then(function(txt){return bkParseJsonPayload(txt)});
}
var __bkImportPayload=null;
function bkHandleImportFile(ev){
  var f=ev.target.files&&ev.target.files[0];if(!f){return}
  showToast('Đang đọc file backup...','info');
  bkReadImportFile(f).then(function(res){
    var db=res.db;
    if(!db||typeof db!=='object')throw new Error('File không hợp lệ');
    var norm=normalize(JSON.parse(JSON.stringify(db))); // hàm gốc — validate cấu trúc, không ghi vào localStorage
    __bkImportPayload={db:norm,meta:res.meta,sizeBytes:bkByteSize(JSON.stringify(db)),fileName:f.name};
    bkOpenImportPreview();
  }).catch(function(e){showToast('Nhập thất bại: '+(e&&e.message||e),'error')});
  ev.target.value='';
}
function bkOpenImportPreview(){
  var p=__bkImportPayload;if(!p)return;
  var cur=load();
  var diff=bkComputeDiff(cur,p.db);
  var sum=bkSummaryOf(p.db);
  var totalRecords=sum.careTotal+sum.milk+sum.milestone+sum.appointment+sum.diary+sum.healthBook+sum.pregnancy+sum.baby+sum.mom;
  var html='<p><b>File:</b> '+esc(p.fileName)+'</p>';
  html+='<p>Dung lượng: '+bkFmtSize(p.sizeBytes)+(p.meta&&p.meta.appVersion?(' · Phiên bản xuất: '+esc(p.meta.appVersion)):'')+'</p>';
  html+='<p>Tổng bản ghi trong file: '+totalRecords+'</p>';
  html+=bkDiffHtml(diff);
  var body=byId('bkImportPreviewBody');if(body)body.innerHTML=html;
  var row=byId('bkImportConflictRow');if(row)row.classList.add('hidden');
  window.__bkImportMode='overwrite';
  var ov=byId('bkImportOverlay');if(ov){ov.classList.add('show');document.body.classList.add('careModalOpen')}
}
function bkCloseImportPreview(){var ov=byId('bkImportOverlay');if(ov)ov.classList.remove('show');document.body.classList.remove('careModalOpen');__bkImportPayload=null}
function bkImportChooseMode(mode,el){
  window.__bkImportMode=mode;
  document.querySelectorAll('.bkImportModeBtn').forEach(function(b){b.classList.remove('on')});
  if(el)el.classList.add('on');
  var row=byId('bkImportConflictRow');if(row)row.classList.toggle('hidden',mode!=='merge');
}
function bkMergeArraysById(curArr,incArr,policy){
  curArr=curArr||[];incArr=incArr||[];
  var idxOf={};curArr.forEach(function(x,i){if(x&&x.id!=null)idxOf[x.id]=i});
  var result=curArr.slice();
  incArr.forEach(function(inc){
    if(inc&&inc.id!=null&&idxOf.hasOwnProperty(inc.id)){
      var i=idxOf[inc.id];
      if(policy==='overwrite')result[i]=inc;
      else if(policy==='keepBoth'){var clone=JSON.parse(JSON.stringify(inc));clone.id=inc.id+'_import_'+Date.now();result.push(clone)}
      // policy==='skip' -> giữ bản hiện tại, bỏ qua bản trong file
    }else{
      result.push(inc);
    }
  });
  return result;
}
function bkMergeDb(cur,inc,policy){
  var merged=JSON.parse(JSON.stringify(cur));
  merged.careEvents=bkMergeArraysById(cur.careEvents,inc.careEvents,policy);
  merged.milkInventory=bkMergeArraysById(cur.milkInventory,inc.milkInventory,policy);
  merged.milestones=bkMergeArraysById(cur.milestones,inc.milestones,policy);
  // Danh mục không có id ổn định trong dữ liệu gốc: luôn nối thêm để không mất dữ liệu
  ['appointments','diary','healthBook','pregnancy','baby','mom'].forEach(function(k){
    merged[k]=(cur[k]||[]).concat(inc[k]||[]);
  });
  return merged;
}
function bkConfirmImport(){
  var p=__bkImportPayload;if(!p)return;
  var mode=window.__bkImportMode||'overwrite';
  if(mode==='overwrite'){
    if(!confirm('Ghi đè sẽ thay thế TOÀN BỘ dữ liệu hiện tại bằng file backup. Tiếp tục?'))return;
    bkCreateVersion({type:'manual',note:'Tự động lưu trước khi Nhập (ghi đè)'}).then(function(){
      save(p.db);
      bkCloseImportPreview();
      showToast('Nhập dữ liệu (ghi đè) thành công','success');
      bkRenderVersionsPanel();
    });
    return;
  }
  var policy=(byId('bkConflictPolicy')&&byId('bkConflictPolicy').value)||'skip';
  bkCreateVersion({type:'manual',note:'Tự động lưu trước khi Nhập (gộp)'}).then(function(){
    var cur=load();
    var merged=bkMergeDb(cur,p.db,policy);
    save(merged);
    bkCloseImportPreview();
    showToast('Gộp dữ liệu thành công','success');
    bkRenderVersionsPanel();
  });
}

/* --- Khởi động: kiểm tra Backup tự động khi mở app (không chạy nền khi app đóng) --- */
(function(){
  function start(){setTimeout(function(){try{bkAutoBackupCheck()}catch(e){console.error(e)}},1500)}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();


/* ============================================================================
   ↩️ V13.2.0 · UNDO SAU KHI LƯU/XÓA
   Snapshot toàn bộ DB ngay TRƯỚC khi Thêm mới hoặc Xóa; hiển thị Snackbar 8 giây
   với nút "Hoàn tác" — bấm sẽ khôi phục đúng snapshot đó qua save() gốc (rollback
   toàn bộ, kể cả dữ liệu liên quan như kho sữa/Dashboard/Statistics/Timeline).
   KHÔNG áp dụng cho: Sửa dữ liệu, Import Database, Restore Backup, xoá hàng loạt.
   Chỉ 1 Snackbar tại 1 thời điểm — hành động mới sẽ thay thế hành động cũ.
   Prefix hàm: ud*
   ============================================================================ */
var UD_DURATION_MS=8000;
var __udState=null; // {snapshotJson, timerId}

function udEnsureEl(){
  var el=byId('undoSnackbar');
  if(!el){
    el=document.createElement('div');
    el.id='undoSnackbar';
    el.className='undoSnackbar';
    document.body.appendChild(el);
  }
  return el;
}

function udShow(message,snapshotJson){
  if(!snapshotJson)return;
  udClearTimerOnly();
  __udState={snapshotJson:snapshotJson};
  var el=udEnsureEl();
  el.innerHTML='<span class="udIcon">✓</span><span class="udMsg">'+esc(message)+'</span><button type="button" class="udBtn" onclick="udUndo()">Hoàn tác</button>';
  el.classList.remove('udHide');
  requestAnimationFrame(function(){el.classList.add('udShow')});
  __udState.timerId=setTimeout(udClear,UD_DURATION_MS);
}

function udUndo(){
  if(!__udState){return}
  var snap=__udState.snapshotJson;
  udClear();
  var db;
  try{db=JSON.parse(snap)}catch(e){showToast('Không thể hoàn tác','error');return}
  save(db);
  udRefreshOpenViews();
  showToast('Đã hoàn tác','success');
}
function udRefreshOpenViews(){
  /* save() đã tự render() Dashboard/Timeline/Thống kê..., nhưng modal "Xem chi tiết theo loại+ngày"
     và kết quả Tìm kiếm không nằm trong render() nên cần chủ động vẽ lại — để dòng vừa
     Thêm mới/Xóa hiện đúng ngay lập tức, không cần đóng rồi mở lại modal. */
  var detailOv=byId('careDetailOverlay');
  if(detailOv&&detailOv.classList.contains('show')&&window.__careStatsSelectedType){
    var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());
    renderCareStatDetail(window.__careStatsSelectedType,d);
  }
  var gsOv=byId('globalSearchOverlay');
  if(gsOv&&gsOv.classList.contains('show')&&typeof gsAfterMutation==='function'){
    gsAfterMutation();
  }
}

function udClearTimerOnly(){
  if(__udState&&__udState.timerId)clearTimeout(__udState.timerId);
}

function udClear(){
  udClearTimerOnly();
  __udState=null;
  var el=byId('undoSnackbar');
  if(el){el.classList.remove('udShow');el.classList.add('udHide')}
}

/* ============================================================
   V13.3.0 — DANH MỤC BÌNH/TÚI (mc*) + TỰ GẮN TÚI THEO SỐ ML (ab*)
   - mc*: danh mục dùng chung "Bình / Túi trữ sữa", chọn khi Hút sữa.
   - ab*: khi Bé bú từ kho sữa, nhập số ml -> tự gắn bình/túi phù hợp và
          TÍNH LẠI MỖI LẦN ĐỔI SỐ ML. Ưu tiên: hạn dùng gần nhất -> ml nhỏ trước.
   ============================================================ */

/* ---------------- 1. DANH MỤC BÌNH / TÚI ---------------- */
function defaultMilkContainers(){
  var now=new Date().toISOString();
  return [{id:'mc_tui_chung',name:'Túi trữ sữa',kind:'tui',capacity:0,note:'Túi dùng một lần — mỗi lần hút app tự đặt mã riêng theo ngày giờ.',active:true,createdAt:now,updatedAt:now}];
}
function mcAll(db){
  db=db||load();
  if(!Array.isArray(db.milkContainers)||!db.milkContainers.length)return defaultMilkContainers();
  return db.milkContainers;
}
function mcFind(db,id){
  if(!id)return null;
  return mcAll(db).find(function(c){return c.id===id})||null;
}
function mcKindLabel(k){return k==='tui'?'Túi':'Bình'}
/* V13.5.0 — Danh sách bình/túi được phép hiện ở MỌI chỗ chọn dữ liệu.
   Quy tắc tuyệt đối: khác "Đang dùng" thì không xuất hiện ở bất cứ đâu
   ngoài trang Danh mục. Không có ngoại lệ, kể cả khi đang sửa bản ghi cũ. */
function mcSelectableList(db,kind){
  return mcAll(db).filter(function(c){
    if(c.active===false)return false;
    return !kind||c.kind===kind;
  });
}
function mcIsSelectable(db,id){
  var c=mcFind(db,id);
  return !!(c&&c.active!==false);
}
function mcHiddenCount(db,kind){
  return mcAll(db).filter(function(c){
    if(c.active!==false)return false;
    return !kind||c.kind===kind;
  }).length;
}
function mcEmptyPickHtml(db,kind){
  var what=(kind==='tui')?'túi':(kind==='binh'?'bình':'bình/túi');
  return mcHiddenCount(db,kind)>0
    ? '<p class="notice">Tất cả '+what+' trong danh mục đang ở trạng thái <b>Tạm ẩn</b> nên không chọn được. Vào Danh mục → Bình / Túi trữ sữa để bật lại.</p>'
    : '<p class="notice">Chưa có '+what+' nào trong danh mục. Vào Danh mục → Bình / Túi trữ sữa để thêm.</p>';
}
function mcKindIcon(k){return k==='tui'?'🥛':'🍼'}

/* Mã tự sinh cho túi dùng một lần: YYMMDD-HHMM theo ngày giờ hút */
function mcAutoBagCode(date,time){
  var d=String(date||today()).slice(0,10).split('-');
  var base=(d.length===3)?(d[0].slice(2)+d[1]+d[2]):'SUA';
  var t=String(time||'').replace(':','')||'0000';
  return base+'-'+t;
}
/* Tên hiển thị của một túi/bình trong kho */
function mcBagLabel(db,containerId,date,time){
  var c=mcFind(db,containerId);
  if(!c)return mcAutoBagCode(date,time);
  if(c.kind==='tui')return mcAutoBagCode(date,time);
  return c.name||mcAutoBagCode(date,time);
}
/* Bình đang chứa sữa chưa dùng hết? (túi dùng một lần thì không tính) */
function mcIsBusy(db,containerId){
  if(!containerId)return false;
  var c=mcFind(db,containerId);
  if(!c||c.kind!=='binh')return false;
  return (db.milkInventory||[]).some(function(b){
    return b&&b.containerId===containerId&&Number(b.remaining||0)>0&&(b.status||'Đang bảo quản')==='Đang bảo quản';
  });
}

/* ---- CRUD ---- */
function resetMilkContainerForm(){
  setValSafe('mcEditIndex','');
  setValSafe('mcName','');
  setValSafe('mcCapacity','');
  setValSafe('mcNote','');
  setValSafe('mcActive','1');
  mcPickKind('binh');
  var t=byId('mcFormTitle');if(t)t.textContent='Bình / Túi trữ sữa';
  var b=byId('mcEditBadge');if(b)b.classList.add('hidden');
}
function mcPickKind(kind){
  setValSafe('mcKind',kind||'binh');
  document.querySelectorAll('#mcKindChips .mcKindChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-kind')===kind);
  });
  var cap=byId('mcCapacityWrap');
  if(cap)cap.classList.toggle('hidden',kind==='tui');
  var hint=byId('mcKindHint');
  if(hint)hint.textContent=(kind==='tui')
    ? 'Túi dùng một lần: khai báo một dòng chung (theo hãng cũng được). Mỗi lần hút vào túi, app tự đặt mã riêng theo ngày giờ, ví dụ 260726-0930.'
    : 'Bình dùng lại nhiều lần: khai báo từng bình riêng để app theo dõi bình nào đang chứa sữa.';
}
function saveMilkContainer(){
  var name=(byId('mcName')&&byId('mcName').value||'').trim();
  if(!name){showToast('Vui lòng nhập tên bình/túi','warn');return}
  var db=load();
  db.milkContainers=Array.isArray(db.milkContainers)&&db.milkContainers.length?db.milkContainers:defaultMilkContainers();
  var idx=(byId('mcEditIndex')&&byId('mcEditIndex').value)||'';
  var dup=db.milkContainers.some(function(x,i){
    return String(i)!==String(idx)&&String(x.name||'').trim().toLowerCase()===name.toLowerCase();
  });
  if(dup){showToast('Tên này đã có trong danh mục','warn');return}
  var now=new Date().toISOString();
  var item={
    id:'mc_'+Date.now().toString(36),
    name:name,
    kind:(byId('mcKind')&&byId('mcKind').value)||'binh',
    capacity:Number((byId('mcCapacity')&&byId('mcCapacity').value)||0)||0,
    note:(byId('mcNote')&&byId('mcNote').value||'').trim(),
    active:((byId('mcActive')&&byId('mcActive').value)||'1')==='1',
    createdAt:now,updatedAt:now
  };
  var __udBefore=JSON.stringify(db);
  var isAdd=true;
  if(idx!==''&&db.milkContainers[Number(idx)]){
    var old=db.milkContainers[Number(idx)];
    item.id=old.id||item.id;item.createdAt=old.createdAt||now;
    db.milkContainers[Number(idx)]=item;
    isAdd=false;
    /* đổi tên bình thì cập nhật tên hiển thị của các túi trong kho đang gắn bình đó */
    (db.milkInventory||[]).forEach(function(b){
      if(b&&b.containerId===item.id&&item.kind==='binh'){b.containerName=item.name;b.updatedAt=now}
    });
  }else{
    db.milkContainers.unshift(item);
  }
  save(db);
  if(isAdd&&typeof udShow==='function')udShow('Đã thêm vào danh mục bình/túi.',__udBefore);
  resetMilkContainerForm();
  showToast(isAdd?'Thêm bình/túi thành công':'Cập nhật bình/túi thành công','success');
}
function editMilkContainer(i){
  var db=load(),x=mcVisibleContainers(db)[i];if(!x)return;
  setValSafe('mcEditIndex',i);
  setValSafe('mcName',x.name||'');
  setValSafe('mcCapacity',x.capacity||'');
  setValSafe('mcNote',x.note||'');
  setValSafe('mcActive',x.active===false?'0':'1');
  mcPickKind(x.kind||'binh');
  var t=byId('mcFormTitle');if(t)t.textContent='Sửa bình / túi';
  var b=byId('mcEditBadge');if(b)b.classList.remove('hidden');
  showPage('milkContainer');
}
function delMilkContainer(i){
  var db=load();
  db.milkContainers=mcAll(db).slice();
  var vis=mcVisibleContainers(db),target=vis[i];
  var x=target?db.milkContainers.find(function(c){return c.id===target.id}):null;
  if(!x)return;
  var realIdx=db.milkContainers.indexOf(x);
  var used=(db.milkInventory||[]).some(function(b){return b&&b.containerId===x.id});
  if(used){alert('Không thể xoá vì đã có túi sữa trong kho dùng bình/túi này. Boss có thể chuyển sang "Tạm ẩn".');return}
  if(!confirm('Xoá "'+x.name+'" khỏi danh mục?'))return;
  var __udBefore=JSON.stringify(load());
  db.milkContainers.splice(realIdx,1);
  save(db);
  if(typeof udShow==='function')udShow('Đã xoá khỏi danh mục bình/túi.',__udBefore);
  renderMilkContainers(load());
  showToast('Xoá thành công','success');
}
function renderMilkContainers(db){
  var box=byId('mcList');if(!box)return;
  db=db||load();
  var all=mcAll(db),hidden=mcHiddenCount(db,''),onlyActive=mcOnlyActiveFilter();
  var bar=byId('mcFilterBar');
  if(bar)bar.innerHTML='<span class="mcCount">'+(all.length-hidden)+' đang dùng · '+hidden+' tạm ẩn</span>'+
    '<button type="button" class="mcFilterBtn'+(onlyActive?' on':'')+'" onclick="mcToggleOnlyActiveFilter()">'+(onlyActive?'✓ Chỉ hiện đang dùng':'Chỉ hiện đang dùng')+'</button>';
  var arr=mcVisibleContainers(db);
  box.innerHTML=arr.length?arr.map(function(x,i){
    var busy=mcIsBusy(db,x.id);
    var count=(db.milkInventory||[]).filter(function(b){return b&&b.containerId===x.id}).length;
    return '<div class="mcRow'+(x.active===false?' off':'')+'">'+
      '<div class="mcIco">'+mcKindIcon(x.kind)+'</div>'+
      '<div class="mcMain"><b>'+esc(x.name)+'</b>'+
        '<small>'+(x.kind==='tui'?'Túi dùng một lần':(x.capacity?('Dung tích '+x.capacity+'ml'):'Bình dùng lại'))+
        ' · đã dùng '+count+' lần'+(x.active===false?' · Tạm ẩn':'')+'</small></div>'+
      '<span class="mcKind '+(x.kind==='tui'?'tui':'binh')+'">'+mcKindLabel(x.kind)+'</span>'+
      (busy?'<span class="mcState busy">Đang chứa sữa</span>':(x.kind==='binh'?'<span class="mcState">Trống</span>':''))+
      '<div class="mcActs"><button type="button" class="'+(x.active===false?'secondary':'ghost')+'" onclick="mcToggleActive('+i+')">'+(x.active===false?'Bật lại':'Tạm ẩn')+'</button>'+
      '<button type="button" class="ghost" onclick="editMilkContainer('+i+')">Sửa</button>'+
      '<button type="button" class="danger" onclick="delMilkContainer('+i+')">Xoá</button></div>'+
    '</div>';
  }).join(''):'<p class="notice">'+(mcOnlyActiveFilter()?'Không có bình/túi nào đang dùng. Bỏ lọc để xem các mục đã Tạm ẩn.':'Chưa có bình/túi nào. Thêm ở form phía trên.')+'</p>';
}
/* Bật/tắt nhanh trạng thái ngay trong danh sách — khỏi phải mở form Sửa từng mục */
function mcToggleActive(i){
  var db=load();
  db.milkContainers=mcAll(db).slice();
  var arr=mcVisibleContainers(db),x=arr[i];
  if(!x)return;
  var real=db.milkContainers.find(function(c){return c.id===x.id});
  if(!real)return;
  var __udBefore=JSON.stringify(load());
  real.active=(real.active===false);
  real.updatedAt=new Date().toISOString();
  save(db);
  if(typeof udShow==='function')udShow((real.active?'Đã bật lại ':'Đã tạm ẩn ')+real.name+'.',__udBefore);
  showToast(real.active?('Đã bật lại '+real.name):('Đã tạm ẩn '+real.name),'success');
  renderMilkContainers(load());
}
function mcOnlyActiveFilter(){try{return localStorage.getItem('meYeuBeMcOnlyActive_v1')==='1'}catch(e){return false}}
function mcToggleOnlyActiveFilter(){
  try{localStorage.setItem('meYeuBeMcOnlyActive_v1',mcOnlyActiveFilter()?'0':'1')}catch(e){}
  renderMilkContainers(load());
}
function mcVisibleContainers(db){
  var arr=mcAll(db);
  return mcOnlyActiveFilter()?arr.filter(function(c){return c.active!==false}):arr;
}

/* ---- chuyển đổi dữ liệu cũ: ghi chú túi sữa -> danh mục ---- */
function mcMigrateFromNotes(){
  var db=load();
  db.settings=db.settings||{};
  if(db.settings.mcMigratedV1)return false;
  var bags=Array.isArray(db.milkInventory)?db.milkInventory:[];
  db.milkContainers=Array.isArray(db.milkContainers)&&db.milkContainers.length?db.milkContainers:defaultMilkContainers();
  var now=new Date().toISOString(),created=0,linked=0;
  var byName={};
  db.milkContainers.forEach(function(c){byName[String(c.name||'').trim().toLowerCase()]=c});
  bags.forEach(function(b){
    if(!b||b.containerId)return;
    var note=String(b.note||'').trim();
    /* ghi chú ngắn coi như tên bình; ghi chú dài là mô tả thật, không đụng vào */
    if(!note||note.length>30||note.indexOf('\n')>-1)return;
    var key=note.toLowerCase(),c=byName[key];
    if(!c){
      c={id:'mc_'+Date.now().toString(36)+'_'+created,name:note,kind:'binh',capacity:0,
         note:'Tự tạo từ ghi chú túi sữa cũ',active:true,createdAt:now,updatedAt:now};
      db.milkContainers.push(c);byName[key]=c;created++;
    }
    b.containerId=c.id;b.containerKind=c.kind;b.containerName=c.name;
    linked++;
  });
  db.settings.mcMigratedV1=true;
  db.settings.mcMigratedAt=now;
  db.settings.mcMigratedStat={created:created,linked:linked};
  save(db);
  if(created>0&&typeof showToast==='function'){
    setTimeout(function(){showToast('Đã tạo '+created+' bình/túi từ ghi chú kho sữa cũ','success')},1200);
  }
  return true;
}

/* ---- chip chọn bình/túi trong form Hút sữa ---- */
function mcRenderPumpChips(){
  var box=byId('cContainerChips');if(!box)return;
  var db=load();
  var cur=(byId('cContainerId')&&byId('cContainerId').value)||'';
  var list=mcSelectableList(db,'');
  if(!list.length){box.innerHTML=mcEmptyPickHtml(db,'');mcSyncPumpHint();return}
  box.innerHTML=list.map(function(c){
    var busy=mcIsBusy(db,c.id);
    return '<button type="button" class="mcChip'+(c.id===cur?' on':'')+(busy?' busy':'')+
      '" data-mc="'+esc(c.id)+'" onclick="mcPickPumpContainer(\''+esc(c.id)+'\')">'+
      mcKindIcon(c.kind)+' '+esc(c.name)+'<span class="mcChipK">'+mcKindLabel(c.kind)+'</span></button>';
  }).join('');
  mcSyncPumpHint();
}
function mcPickPumpContainer(id){
  var db=load(),c=mcFind(db,id);
  if(!mcIsSelectable(db,id)){showToast('Bình/túi này đang Tạm ẩn, không chọn được','warn');return}
  if(c&&c.kind==='binh'&&mcIsBusy(db,id)){
    if(!confirm('Bình "'+c.name+'" đang còn sữa chưa dùng hết. Vẫn dùng bình này cho mẻ hút mới?'))return;
  }
  setValSafe('cContainerId',id);
  document.querySelectorAll('#cContainerChips .mcChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-mc')===id);
  });
  mcSyncPumpHint();
}
function mcSyncPumpHint(){
  var out=byId('cContainerHint');if(!out)return;
  var db=load(),id=(byId('cContainerId')&&byId('cContainerId').value)||'';
  var c=mcFind(db,id);
  if(c&&c.active===false){
    /* bản ghi cũ đang gắn một mục nay đã Tạm ẩn: không hiện nó trong danh sách chọn,
       nhưng phải nói rõ để Boss biết mà chọn lại, tránh lưu nhầm mà không hay */
    out.innerHTML='⚠️ Bản ghi này đang gắn <b>'+esc(c.name)+'</b> — mục đó đã chuyển sang <b>Tạm ẩn</b> nên không còn trong danh sách. Chọn lại một bình/túi đang dùng nếu muốn đổi.';
    return;
  }
  if(!c){out.textContent='Chọn bình hoặc túi sẽ đựng mẻ sữa này.';return}
  if(c.kind==='tui'){
    var d=(byId('cDate')&&byId('cDate').value)||today();
    var t=(byId('cTimeFrom')&&byId('cTimeFrom').value)||'';
    out.innerHTML='Túi này sẽ được đặt mã <b>'+esc(mcAutoBagCode(d,t))+'</b> (ngày giờ hút) để phân biệt với các túi khác.';
  }else{
    out.textContent='Mẻ sữa này sẽ hiển thị trong kho với tên "'+c.name+'".';
  }
}

/* ============================================================
   2. TỰ GẮN BÌNH/TÚI THEO SỐ ML  (ab*)
   ============================================================ */
function abState(){
  window.__abState=window.__abState||{manual:false,excluded:{},lastNeed:null};
  return window.__abState;
}
function abReset(){window.__abState={manual:false,excluded:{},lastNeed:null}}

/* Thứ tự ưu tiên: hạn dùng gần nhất trước; cùng hạn thì túi ÍT ml trước
   (dọn sạch túi lẻ, đỡ để dở); cùng nữa thì túi tạo trước. */
function abSortBags(list){
  return list.slice().sort(function(a,b){
    var ea=milkExpireAt(a),eb=milkExpireAt(b);
    if(ea!==eb)return ea-eb;
    var ma=Number(a.remaining||0),mb=Number(b.remaining||0);
    if(ma!==mb)return ma-mb;
    return String((a.date||'')+(a.timeFrom||'')).localeCompare(String((b.date||'')+(b.timeFrom||'')));
  });
}
function abCompute(db,need,excluded){
  var res={picked:[],total:0,short:0,enough:false,poolMl:0};
  need=Math.max(0,Number(need||0));
  var pool=abSortBags((typeof activeMilkBags==='function'?activeMilkBags(db):[])
    .filter(function(b){return Number(b.remaining||0)>0&&!(excluded&&excluded[b.id])}));
  res.poolMl=pool.reduce(function(t,b){return t+Number(b.remaining||0)},0);
  if(!need||!pool.length)return res;
  var left=need;
  for(var i=0;i<pool.length&&left>0;i++){
    var av=Number(pool[i].remaining||0);
    var take=Math.min(av,left);
    if(take<=0)continue;
    res.picked.push({bagId:pool[i].id,usedMl:take,remainderAction:'keep',discardMl:0,discardReason:''});
    left-=take;
  }
  res.total=need-left;res.short=left;res.enough=(left<=0);
  return res;
}
/* Người dùng tự đụng vào danh sách -> ngừng tự chọn cho tới khi bấm chọn lại */
function abOnManualEdit(){
  if(window.__abApplying)return;
  abState().manual=true;
  abSyncChrome();
}
function abDropBag(idx){
  var arr=milkFeedSourcesState(),s=arr[idx];
  if(s)abState().excluded[s.bagId]=true;
  abState().manual=true;
  arr.splice(idx,1);
  renderMilkSourceList();
  updateCareMilkSourceTotal();
  abSyncChrome();
}
function abReAuto(){
  abState().manual=false;
  abState().excluded={};
  abApply(true);
}
function abIsFeedFromStore(){
  var s=byId('cFeedSource');
  return !!(s&&s.value==='stored');
}
/* Đang sửa một ghi nhận đã lưu -> tuyệt đối không tự đổi túi người dùng đã chọn.
   Lưu ý: toggleFeedSourceFields() được gọi giữa chừng trong fillCareEditForm nên
   phải chặn ngay tại đây, không thể đợi cuối hàm mới bật cờ thủ công. */
function abIsEditingSaved(){
  var el=byId('careEditIndex');
  return !!(el&&String(el.value||'')!=='');
}
function abApply(force){
  if(!abIsFeedFromStore())return;
  var st=abState();
  if(abIsEditingSaved()&&!force){st.manual=true;abSyncChrome();return}
  if(st.manual&&!force)return;
  var need=Number((byId('cAmount')&&byId('cAmount').value)||0);
  if(!force&&st.lastNeed===need)return;
  st.lastNeed=need;
  var db=load();
  var r=abCompute(db,need,st.excluded);
  window.__abApplying=true;
  var arr=milkFeedSourcesState();
  arr.length=0;
  r.picked.forEach(function(p){arr.push(p)});
  window.__abApplying=false;
  renderMilkSourceList();
  updateCareMilkSourceTotal();
  abSyncChrome(r);
}
function abSyncChrome(r){
  var badge=byId('abModeBadge');
  var reBtn=byId('abReAutoBtn');
  var warn=byId('abWarnBox');
  var st=abState();
  if(badge){
    badge.textContent=st.manual?'THỦ CÔNG':'TỰ ĐỘNG';
    badge.className='abBadge'+(st.manual?' manual':'');
  }
  if(reBtn)reBtn.classList.toggle('hidden',!st.manual);
  if(!warn)return;
  if(!r){
    var need=Number((byId('cAmount')&&byId('cAmount').value)||0);
    r=abCompute(load(),need,st.excluded);
    /* ở chế độ thủ công thì tính cảnh báo theo đúng những túi đang chọn */
    if(st.manual){
      var tot=milkFeedSourcesState().reduce(function(t,s){return t+Number(s.usedMl||0)},0);
      r={total:tot,short:Math.max(0,need-tot),poolMl:r.poolMl};
    }
  }
  if(r.short>0&&Number((byId('cAmount')&&byId('cAmount').value)||0)>0){
    warn.classList.remove('hidden');
    warn.innerHTML='<span>⚠️</span><span>Đã dùng hết sữa trong kho, vẫn thiếu <b>'+r.short+
      'ml</b>. Cho bé bú thêm sữa mẹ trực tiếp hoặc sữa công thức, rồi sửa lại số ml cho khớp.</span>';
  }else{
    warn.classList.add('hidden');warn.innerHTML='';
  }
  abSyncPartialHint();
}
/* Nhắc hủy phần còn lại khi một túi bị mở dở */
function abSyncPartialHint(){
  var box=byId('abPartialHint');if(!box)return;
  var db=load(),arr=milkFeedSourcesState(),msg='';
  arr.forEach(function(s){
    var b=findMilkBag(db,s.bagId);if(!b)return;
    var rest=Number(b.remaining||0)-Number(s.usedMl||0);
    var isBag=(b.containerKind||'')==='tui';
    var discarding=s.remainderAction&&s.remainderAction!=='keep';
    if(isBag&&rest>0&&!discarding&&!msg){
      msg='Túi '+milkBagDisplayId(b)+' bị mở dở, còn '+rest+'ml. Túi đã mở thường không giữ lại được lâu — bấm “🗑 Hủy phần còn lại trong túi” ở thẻ bên trên nếu Boss định bỏ.';
    }
  });
  box.classList.toggle('hidden',!msg);
  box.textContent=msg;
}

/* điểm vào phụ cho engine tự gắn túi */
function abOnAmountInput(){
  updateCareMilkSourceTotal();
  if(typeof abApply==='function')abApply();
}
function abOnFeedSourceChange(){
  if(window.__abApplying)return;
  if(!abIsFeedFromStore()){abSyncChrome();return}
  var st=abState();
  st.lastNeed=null;
  abApply();
}
/* chuyển đổi dữ liệu cũ một lần khi app khởi động */
try{mcMigrateFromNotes()}catch(e){}

/* ============================================================
   V13.4.0 — CHUYỂN SỮA (module tf*)
   Nguyên tắc: KHÔNG sửa bản ghi hút sữa cũ. Mỗi lần chuyển tạo thêm
   một giao dịch 'transfer' + một túi/bình mới trong kho, nguồn bị trừ đi.
   ============================================================ */
var TF_STORAGES=['Nhiệt độ phòng','Túi giữ lạnh có đá','Ngăn mát','Ngăn đông','Tủ đông sâu'];

function tfState(){
  window.__tfState=window.__tfState||{bagId:'',kind:'binh',targetId:'',open:false};
  return window.__tfState;
}
/* Hạn dùng tính từ một mốc thời gian bất kỳ (không phụ thuộc form ghi nhận) */
function tfExpireFrom(storage,date,time){
  var ms=dateTimeMs(date,time);
  var base=new Date(ms===null?Date.now():ms);
  if(storage==='Ngăn đông')return addMonthsISODateTime(base,6);
  if(storage==='Tủ đông sâu')return addMonthsISODateTime(base,12);
  return localDateTimeValue(new Date(base.getTime()+milkStorageHours(storage)*3600000));
}
/* Mốc hút gốc của một túi — truy ngược qua chuỗi chuyển sữa */
function tfOriginOf(b){
  if(!b)return {date:today(),time:'00:00'};
  return {date:b.originDate||b.date||today(),time:b.originTimeFrom||b.timeFrom||'00:00'};
}
/* Mã hiển thị cho túi mới tạo ra khi chuyển sang loại "Túi" */
function tfNewBagCode(db,srcBag){
  var o=tfOriginOf(srcBag);
  var base=mcAutoBagCode(o.date,o.time);
  var used={};
  (db.milkInventory||[]).forEach(function(x){if(x&&x.containerName)used[x.containerName]=true});
  if(!used[base])return base;
  var n=2,code='';
  do{code=base+'-'+n;n++}while(used[code]);
  return code;
}

/* ---------------- popup ---------------- */
function tfOpen(idx){
  /* Không chặn theo __milkSwipeLock: khoá đó chỉ để chặn cú chạm vào thẻ (mở chi tiết)
     sau khi vuốt, còn bấm thẳng vào nút hành động thì luôn là chủ ý của người dùng. */
  document.querySelectorAll('.milkSwipeShell.open').forEach(function(el){el.classList.remove('open')});
  var db=load(),b=(db.milkInventory||[])[Number(idx)];
  if(!b){showToast('Không tìm thấy túi sữa','error');return}
  if((b.status||'Đang bảo quản')!=='Đang bảo quản'||Number(b.remaining||0)<=0){
    showToast('Túi này không còn sữa để chuyển','warn');return;
  }
  var st=tfState();
  st.bagId=b.id;st.targetId='';st.open=true;
  st.kind=(b.containerKind==='binh')?'tui':'binh';   /* mặc định chuyển sang loại khác */
  setValSafe('tfDate',today());
  setValSafe('tfTime',nowHM());
  setValSafe('tfAmount',Number(b.remaining||0));
  setValSafe('tfStorage',b.storage||'Ngăn mát');
  /* V14.2.0 · mỗi lần mở lại đều bắt đầu từ gợi ý của hệ thống */
  tfManualState().on=false;
  setValSafe('tfExpValue','');
  tfSyncManualExpireUI(true);
  tfRenderSource(db,b);
  tfPickKind(st.kind);
  var ov=byId('tfOverlay');
  if(ov){ov.classList.add('show');document.body.classList.add('careModalOpen')}
}
function tfClose(){
  tfState().open=false;
  var ov=byId('tfOverlay');
  if(ov)ov.classList.remove('show');
  /* chỉ mở khoá cuộn nền khi không còn popup nào khác đang mở */
  if(!tfOtherOverlayOpen())document.body.classList.remove('careModalOpen');
}
function tfOtherOverlayOpen(){
  return ['careDetailOverlay','careFormOverlay','milkBagPickerOverlay','milkDetailOverlay','bkOverlay'].some(function(id){
    var el=byId(id);return !!(el&&el.classList.contains('show'));
  });
}
/* Sau khi chuyển xong, popup chi tiết Kho sữa đang mở phía sau phải vẽ lại */
function tfRefreshBehind(){
  var ov=byId('careDetailOverlay');
  if(ov&&ov.classList.contains('show')&&window.__careStatsSelectedType==='milk'){
    var d=(byId('careDetailDateSelect')&&byId('careDetailDateSelect').value)||((byId('careStatsDate')&&byId('careStatsDate').value)||today());
    renderCareStatDetail('milk',d);
  }
}
function tfSourceBag(db){
  db=db||load();
  return (db.milkInventory||[]).find(function(b){return b&&b.id===tfState().bagId})||null;
}
function tfRenderSource(db,b){
  var box=byId('tfSourceBox');if(!box)return;
  box.innerHTML=
    '<div class="tfSrcTop"><span>'+(b.containerKind==='tui'?'🥛':'🍼')+'</span>'+
      '<b>'+esc(milkBagDisplayId(b))+'</b>'+
      '<span class="tfSrcKind">'+esc(b.containerKind==='tui'?'Túi':'Bình')+'</span></div>'+
    '<div class="tfSrcGrid">'+
      '<div><small>Dung tích ban đầu</small><b>'+Number(b.amount||0)+' ml</b></div>'+
      '<div><small>Còn lại</small><b>'+Number(b.remaining||0)+' ml</b></div>'+
      '<div><small>Đang để ở</small><b>'+esc(b.storage||'--')+'</b></div>'+
      '<div><small>Hạn dùng</small><b>'+esc(fmtMilkExpire(b)||'--')+'</b></div>'+
    '</div>';
}
function tfPickKind(kind){
  var st=tfState();
  st.kind=(kind==='tui')?'tui':'binh';
  st.targetId='';
  document.querySelectorAll('#tfKindChips .tfKindChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-kind')===st.kind);
  });
  tfRenderTargets();
  tfSyncPreview();
}
function tfRenderTargets(){
  var box=byId('tfTargetChips');if(!box)return;
  var db=load(),st=tfState();
  var list=mcSelectableList(db,st.kind);
  if(!list.length){box.innerHTML=mcEmptyPickHtml(db,st.kind);return}
  box.innerHTML=list.map(function(c){
    var busy=mcIsBusy(db,c.id);
    return '<button type="button" class="mcChip'+(c.id===st.targetId?' on':'')+(busy?' busy':'')+
      '" data-tf="'+esc(c.id)+'" onclick="tfPickTarget(\''+esc(c.id)+'\')">'+
      mcKindIcon(c.kind)+' '+esc(c.name)+'</button>';
  }).join('');
}
function tfPickTarget(id){
  var db=load(),c=mcFind(db,id);
  if(!mcIsSelectable(db,id)){showToast('Bình/túi này đang Tạm ẩn, không chọn được','warn');return}
  if(c&&c.kind==='binh'&&mcIsBusy(db,id)){
    if(!confirm('Bình "'+c.name+'" đang còn sữa của mẻ khác. Vẫn chuyển vào bình này?'))return;
  }
  tfState().targetId=id;
  document.querySelectorAll('#tfTargetChips .mcChip').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-tf')===id);
  });
  tfSyncPreview();
}
/* Hạn dùng của phần sữa sau khi chuyển:
   - để nguyên nơi bảo quản        -> giữ đúng hạn cũ, không reset đồng hồ;
   - rã đông (đông -> mát/phòng)   -> tính lại từ lúc chuyển, tối đa 24 giờ;
   - đổi nơi bảo quản khác         -> tính lại từ thời điểm chuyển theo nơi mới;
   - người dùng tự nhập            -> ưu tiên giá trị người dùng nhập. */
function tfIsThaw(fromStorage,toStorage){
  var frozen=(fromStorage==='Ngăn đông'||fromStorage==='Tủ đông sâu');
  var warmer=(toStorage==='Ngăn mát'||toStorage==='Túi giữ lạnh có đá'||toStorage==='Nhiệt độ phòng');
  return frozen&&warmer;
}
/* Gợi ý của hệ thống — chưa tính phần người dùng tự nhập */
function tfAutoExpire(){
  var db=load(),src=tfSourceBag(db);
  if(!src)return {expire:'',changed:false,longer:false,storage:'',thaw:false};
  var storage=(byId('tfStorage')&&byId('tfStorage').value)||src.storage||'Ngăn mát';
  var date=(byId('tfDate')&&byId('tfDate').value)||today();
  var time=(byId('tfTime')&&byId('tfTime').value)||nowHM();
  if(tfIsThaw(src.storage||'',storage)){
    /* Sữa đã rã đông: đồng hồ chạy lại từ lúc chuyển và không quá 24 giờ */
    var ms=dateTimeMs(date,time);
    var base=new Date(ms===null?Date.now():ms);
    var hrs=Math.min(24,milkStorageHours(storage));
    return {expire:localDateTimeValue(new Date(base.getTime()+hrs*3600000)),
      changed:true,longer:false,storage:storage,thaw:true};
  }
  if(storage===(src.storage||'')){
    return {expire:src.expireDateTime||src.expireDate||'',changed:false,longer:false,storage:storage,thaw:false};
  }
  var exp=tfExpireFrom(storage,date,time);
  var longer=milkExpireAt({expireDateTime:exp})>milkExpireAt(src);
  return {expire:exp,changed:true,longer:longer,storage:storage,thaw:false};
}
function tfManualState(){
  if(!window.__tfManualExpire)window.__tfManualExpire={on:false};
  return window.__tfManualExpire;
}
function tfComputeExpire(){
  var auto=tfAutoExpire();
  if(tfManualState().on){
    var v=(byId('tfExpValue')&&byId('tfExpValue').value)||'';
    if(v){
      auto.expire=v;auto.changed=true;auto.manual=true;
      auto.longer=milkExpireAt({expireDateTime:v})>milkExpireAt(tfSourceBag());
      return auto;
    }
  }
  auto.manual=false;
  return auto;
}
/* Bật/tắt ô tự nhập hạn dùng */
function tfToggleManualExpire(){
  tfManualState().on=!tfManualState().on;
  tfSyncManualExpireUI(true);
  tfSyncPreview();
}
/* refill=true: nạp lại gợi ý của hệ thống vào ô nhập */
function tfSyncManualExpireUI(refill){
  var on=tfManualState().on;
  var box=byId('tfExpManualBox'),btn=byId('tfExpBtn'),inp=byId('tfExpValue');
  if(btn){btn.classList.toggle('on',on);btn.textContent=on?'🕒 Đang tự nhập hạn dùng':'🕒 Tự nhập hạn dùng'}
  if(box)box.classList.toggle('hidden',!on);
  if(inp&&(refill||!inp.value))inp.value=tfAutoExpire().expire||'';
}
/* Đổi ngày/giờ/nơi bảo quản thì gợi ý hạn dùng phải chạy theo */
function tfRecalcExpire(){
  tfSyncManualExpireUI(true);
  tfSyncPreview();
}
function tfSyncPreview(){
  var db=load(),src=tfSourceBag(db);
  var out=byId('tfPreview');if(!out||!src)return;
  var st=tfState();
  var ml=Number((byId('tfAmount')&&byId('tfAmount').value)||0);
  var remain=Number(src.remaining||0);
  var c=mcFind(db,st.targetId);
  var e=tfComputeExpire();
  var rows='';

  if(ml>remain){
    rows+='<div class="tfWarn"><span>⚠️</span><span>Chỉ còn <b>'+remain+'ml</b> trong '+esc(milkBagDisplayId(src))+', không chuyển được '+ml+'ml.</span></div>';
  }
  if(c){
    var newName=(c.kind==='tui')?tfNewBagCode(db,src):c.name;
    var left=Math.max(0,remain-Math.min(ml,remain));
    rows+='<div class="tfFlow"><div class="tfFlowBox"><small>Nguồn còn lại</small><b>'+left+' ml</b>'+
      (left<=0?'<span class="tfTag">Đã chuyển hết</span>':'')+'</div>'+
      '<div class="tfArrow">→</div>'+
      '<div class="tfFlowBox"><small>'+esc(mcKindLabel(c.kind))+' mới</small><b>'+esc(newName)+'</b>'+
      '<span class="tfTag ok">'+Math.min(ml,remain)+' ml</span></div></div>';
    var expWhy=e.manual?' <small>(bạn tự nhập)</small>'
      :(e.thaw?' <small>(sữa rã đông — tính lại 24 giờ từ lúc chuyển)</small>'
      :(e.changed?' <small>(tính lại theo nơi bảo quản mới)</small>':' <small>(giữ nguyên như túi gốc)</small>'));
    rows+='<div class="tfExp">Hạn dùng phần sữa chuyển đi: <b>'+esc(fmtMilkExpire({expireDateTime:e.expire})||'--')+'</b>'+expWhy+'</div>';
    if(e.thaw&&!e.manual){
      rows+='<div class="tfWarn"><span>❄️</span><span>Chuyển từ <b>'+esc(src.storage||'ngăn đông')+'</b> về <b>'+esc(e.storage)+'</b>: sữa đã rã đông chỉ nên dùng trong <b>24 giờ</b> và <b>không được cấp đông lại</b>. Bấm <b>Tự nhập hạn dùng</b> nếu muốn đặt mốc khác.</span></div>';
    }
    if(e.longer){
      rows+='<div class="tfWarn"><span>⚠️</span><span>Nơi bảo quản mới làm <b>hạn dùng dài hơn túi gốc</b>. Chỉ chọn ngăn đông nếu sữa này chưa từng rã đông — sữa đã rã đông thì không được cấp đông lại.</span></div>';
    }
  }else{
    rows+='<p class="notice">Chọn '+(st.kind==='tui'?'túi':'bình')+' sẽ nhận sữa ở trên.</p>';
  }
  out.innerHTML=rows;
}
function tfSetAll(){
  var src=tfSourceBag();
  if(src)setValSafe('tfAmount',Number(src.remaining||0));
  tfSyncPreview();
}
function tfConfirm(){
  var db=load(),st=tfState();
  var src=(db.milkInventory||[]).find(function(b){return b&&b.id===st.bagId});
  if(!src){showToast('Không tìm thấy túi nguồn','error');return}
  var c=mcFind(db,st.targetId);
  if(!c){showToast('Vui lòng chọn bình hoặc túi sẽ nhận sữa','warn');return}
  var ml=Number((byId('tfAmount')&&byId('tfAmount').value)||0);
  var remain=Number(src.remaining||0);
  if(!(ml>0)){showToast('Vui lòng nhập dung tích chuyển','warn');return}
  if(ml>remain){showToast('Chỉ còn '+remain+'ml, không chuyển được '+ml+'ml','warn');return}
  var date=(byId('tfDate')&&byId('tfDate').value)||today();
  var time=(byId('tfTime')&&byId('tfTime').value)||nowHM();
  var e=tfComputeExpire();
  var __udBefore=JSON.stringify(db);
  var now=new Date().toISOString();
  var origin=tfOriginOf(src);
  var newName=(c.kind==='tui')?tfNewBagCode(db,src):c.name;
  var srcLabel=milkBagDisplayId(src);

  /* 1. trừ nguồn — KHÔNG đụng vào bản ghi hút sữa gốc */
  src.remaining=remain-ml;
  if(src.remaining<=0){src.remaining=0;src.status='Đã chuyển hết'}
  src.updatedAt=now;

  /* 2. tạo túi/bình mới, giữ mốc hút gốc để truy vết và tính hạn */
  var newId=uniqueMilkBagId(db,origin.date);
  var evId=newCareId('TF');
  db.milkInventory.unshift({
    id:newId,shortId:newId,
    containerId:c.id,containerKind:c.kind,containerName:newName,
    date:origin.date,startDate:origin.date,timeFrom:origin.time,
    originDate:origin.date,originTimeFrom:origin.time,
    originPumpEventId:src.originPumpEventId||src.pumpEventId||'',
    transferEventId:evId,transferFromBagId:src.id,transferFromName:srcLabel,
    transferAt:date+'T'+time,
    amount:ml,remaining:ml,
    status:'Đang bảo quản',
    storage:e.storage,
    expireDate:e.expire,expireDateTime:e.expire,
    expireManual:!!e.manual,thawed:!!e.thaw||!!src.thawed,
    note:'',createdAt:now,updatedAt:now
  });

  /* 3. ghi một giao dịch Chuyển sữa vào timeline */
  db.careEvents.unshift({
    id:evId,type:'transfer',
    date:date,startDate:date,endDate:date,timeFrom:time,timeTo:'',
    amount:ml,unit:'ml',status:'',note:'',
    extra:{
      fromBagId:src.id,fromName:srcLabel,fromKind:src.containerKind||'',
      toBagId:newId,toName:newName,toKind:c.kind,toContainerId:c.id,
      storage:e.storage,expireDate:e.expire,expireManual:!!e.manual,thawed:!!e.thaw,
      sourceEmptied:src.remaining<=0
    },
    createdAt:now,updatedAt:now
  });

  save(db);
  udShow('Đã chuyển '+ml+'ml sang '+newName+'.',__udBefore);
  tfClose();
  showToast('Chuyển sữa thành công','success');
  render();
  tfRefreshBehind();
}

/* ---------------- xoá một giao dịch chuyển sữa ---------------- */
/* Trả sữa về nguồn và bỏ túi mới — chỉ cho phép khi túi mới chưa bị đụng tới */
function tfReleaseTransfer(db,ev){
  if(!ev||ev.type!=='transfer')return true;
  var ex=ev.extra||{};
  var made=findMilkBag(db,ex.toBagId);
  if(made){
    if(Number(made.remaining||0)!==Number(made.amount||0)){
      showToast('Không thể xoá vì '+milkBagDisplayId(made)+' đã được dùng một phần','warn');
      return false;
    }
    var usedElsewhere=(db.careEvents||[]).some(function(x){
      return x&&x.id!==ev.id&&x.type==='transfer'&&x.extra&&x.extra.fromBagId===ex.toBagId;
    });
    if(usedElsewhere){showToast('Không thể xoá vì sữa đã được chuyển tiếp sang nơi khác','warn');return false}
    db.milkInventory=(db.milkInventory||[]).filter(function(b){return b&&b.id!==ex.toBagId});
  }
  var src=findMilkBag(db,ex.fromBagId);
  if(src){
    src.remaining=Number(src.remaining||0)+Number(ev.amount||0);
    if(src.status==='Đã chuyển hết')src.status='Đang bảo quản';
    src.updatedAt=new Date().toISOString();
  }
  return true;
}

/* ---------------- hiển thị ---------------- */
function tfEventLine(db,x){
  var ex=(x&&x.extra)||{};
  return (ex.fromKind==='tui'?'🥛':'🍼')+' '+esc(ex.fromName||'--')+
    ' <span class="tfInline">→</span> '+(ex.toKind==='tui'?'🥛':'🍼')+' '+esc(ex.toName||'--');
}
function tfBagTraceHtml(b){
  if(!b||!b.transferFromName)return '';
  var when=b.transferAt?String(b.transferAt).replace('T',' '):'';
  return '<p class="mbTrace">🔄 Chuyển từ '+esc(b.transferFromName)+(when?(' lúc '+esc(when)):'')+'</p>';
}

/* =========================================================
   V13.7.0 · Đo tiếng ồn (Noise Meter)
   Dùng micro thiết bị đo độ ồn tham khảo (pseudo-SPL).
   ========================================================= */
var NM_CAL_OFFSET=90;   /* hiệu chỉnh ~ để phòng yên tĩnh đọc ~40dB */
var NM_MIN_DB=30, NM_MAX_DB=100;
var NM_TICK_MS=250;     /* nhịp lấy mẫu + cập nhật UI */
var NM_CHART_MAX=140;   /* số điểm tối đa trên biểu đồ realtime */
var nm={running:false,ctx:null,stream:null,src:null,analyser:null,buf:null,raf:null,
        tick:null,frameSum:0,frameCnt:0,min:null,max:null,sum:0,count:0,
        startTs:0,chart:[]};

function nmClamp(v){return v<NM_MIN_DB?NM_MIN_DB:(v>NM_MAX_DB?NM_MAX_DB:v)}

function nmLevel(d){
  if(d<40) return {q:1,emoji:'🟢',short:'Rất yên tĩnh',full:'Môi trường rất yên tĩnh, phù hợp cho bé ngủ.',fit:'Phù hợp cho bé ngủ',c:'#37a06a',soft:'rgba(55,160,106,.14)'};
  if(d<56) return {q:2,emoji:'🟢',short:'Yên tĩnh',full:'Môi trường yên tĩnh, phù hợp cho bé ngủ.',fit:'Phù hợp cho bé ngủ',c:'#37a06a',soft:'rgba(55,160,106,.14)'};
  if(d<66) return {q:3,emoji:'🟡',short:'Hơi ồn',full:'Hơi ồn — vẫn chấp nhận được, nếu kéo dài nên giảm tiếng ồn.',fit:'Nên hạn chế kéo dài',c:'#c99a1e',soft:'rgba(201,154,30,.16)'};
  if(d<76) return {q:4,emoji:'🟠',short:'Ồn',full:'Ồn — không nên duy trì lâu, có thể ảnh hưởng giấc ngủ của bé.',fit:'Không nên duy trì lâu',c:'#d17a2a',soft:'rgba(209,122,42,.16)'};
  return {q:5,emoji:'🔴',short:'Quá ồn',full:'Quá ồn — không phù hợp cho bé, nên chuyển sang nơi yên tĩnh hơn.',fit:'Không phù hợp cho bé',c:'#d75048',soft:'rgba(215,80,72,.16)'};
}

function nmPct(d){var p=(d-NM_MIN_DB)/(NM_MAX_DB-NM_MIN_DB)*100;return Math.max(0,Math.min(100,p))}

function nmToggle(){ if(nm.running) nmStop(); else nmStart(); }

function nmStart(){
  if(nm.running)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    if(typeof showToast==='function')showToast('Thiết bị/trình duyệt không hỗ trợ ghi âm để đo tiếng ồn.','warn');
    return;
  }
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(stream){
    var AC=window.AudioContext||window.webkitAudioContext;
    nm.ctx=new AC();
    if(nm.ctx.state==='suspended'&&nm.ctx.resume)nm.ctx.resume();
    nm.stream=stream;
    nm.src=nm.ctx.createMediaStreamSource(stream);
    nm.analyser=nm.ctx.createAnalyser();
    nm.analyser.fftSize=2048;
    nm.analyser.smoothingTimeConstant=0.2;
    nm.buf=new Float32Array(nm.analyser.fftSize);
    nm.src.connect(nm.analyser);
    nm.running=true;nm.frameSum=0;nm.frameCnt=0;nm.min=null;nm.max=null;nm.sum=0;nm.count=0;nm.chart=[];nm.startTs=Date.now();
    nmSetToggleBtn(true);
    nmLoop();
    nm.tick=setInterval(nmSample,NM_TICK_MS);
  }).catch(function(err){
    var msg='Không truy cập được micro. Vui lòng cấp quyền micro cho ứng dụng rồi thử lại.';
    if(err&&(err.name==='NotAllowedError'||err.name==='SecurityError'))msg='Quyền micro đã bị từ chối. Hãy bật lại quyền micro trong cài đặt trình duyệt.';
    else if(err&&err.name==='NotFoundError')msg='Không tìm thấy micro trên thiết bị.';
    if(typeof showToast==='function')showToast(msg,'warn');
  });
}

function nmLoop(){
  if(!nm.running||!nm.analyser)return;
  nm.analyser.getFloatTimeDomainData(nm.buf);
  var s=0,n=nm.buf.length,i;
  for(i=0;i<n;i++){s+=nm.buf[i]*nm.buf[i];}
  var rms=Math.sqrt(s/n);
  var spl=(rms>0)?(20*Math.log10(rms)+NM_CAL_OFFSET):NM_MIN_DB;
  spl=nmClamp(spl);
  nm.frameSum+=spl;nm.frameCnt++;
  nm.raf=requestAnimationFrame(nmLoop);
}

function nmSample(){
  if(!nm.running)return;
  var cur=nm.frameCnt?Math.round(nm.frameSum/nm.frameCnt):NM_MIN_DB;
  nm.frameSum=0;nm.frameCnt=0;
  if(nm.min===null||cur<nm.min)nm.min=cur;
  if(nm.max===null||cur>nm.max)nm.max=cur;
  nm.sum+=cur;nm.count++;
  var avg=Math.round(nm.sum/nm.count);
  nm.chart.push(cur);if(nm.chart.length>NM_CHART_MAX)nm.chart.shift();
  nmPaintLive(cur,nm.min,nm.max,avg);
}

function nmPaintLive(cur,mn,mx,avg){
  var lv=nmLevel(cur), card=byId('noiseMeter');
  if(card){card.style.setProperty('--nm-c',lv.c);card.style.setProperty('--nm-soft',lv.soft);}
  var set=function(id,v){var e=byId(id);if(e)e.textContent=v;};
  set('nmCurrent',cur);set('nmStatCur',cur+'');set('nmStatMin',(mn==null?'--':mn));
  set('nmStatMax',(mx==null?'--':mx));set('nmStatAvg',(avg==null?'--':avg));
  var bar=byId('nmBarFill');if(bar)bar.style.width=nmPct(cur).toFixed(1)+'%';
  var st=byId('nmStatus');if(st){st.className='nmStatus';st.textContent=lv.emoji+' '+lv.short;}
  var t=byId('nmStatTime');if(t)t.textContent=fmtHHMMSSDuration(Math.floor((Date.now()-nm.startTs)/1000));
  nmRenderChart();
}

function nmRenderChart(){
  var box=byId('nmChart');if(!box)return;
  var data=nm.chart;
  if(!data.length){box.innerHTML='<div class="nmChartEmpty">Biểu đồ sẽ hiện khi bắt đầu đo…</div>';return;}
  var W=320,H=150,padL=26,padR=8,padT=10,padB=16;
  var loBound=30,hiBound=90;
  var xw=W-padL-padR, yh=H-padT-padB;
  var xFor=function(i){return data.length<=1?padL:padL+(i/(data.length-1))*xw;};
  var yFor=function(v){var vv=Math.max(loBound,Math.min(hiBound,v));return padT+(1-(vv-loBound)/(hiBound-loBound))*yh;};
  var grid='',lines=[40,50,60,70,80],gi;
  for(gi=0;gi<lines.length;gi++){var gy=yFor(lines[gi]).toFixed(1);
    grid+='<line class="nmGrid" x1="'+padL+'" y1="'+gy+'" x2="'+(W-padR)+'" y2="'+gy+'"/>'+
          '<text class="nmGridTxt" x="2" y="'+(Number(gy)+3).toFixed(1)+'">'+lines[gi]+'</text>';
  }
  var pts=data.map(function(v,i){return xFor(i).toFixed(1)+','+yFor(v).toFixed(1);}).join(' ');
  var area='';
  if(data.length>1){
    area='<polygon class="nmArea" points="'+padL.toFixed(1)+','+(H-padB).toFixed(1)+' '+pts+' '+(xFor(data.length-1)).toFixed(1)+','+(H-padB).toFixed(1)+'"/>';
  }
  var cur=data[data.length-1], lv=nmLevel(cur);
  box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+grid+area+
    '<polyline class="nmLine" style="stroke:'+lv.c+'" points="'+pts+'"/></svg>';
}

function nmStop(){
  if(!nm.running){nmTeardown();return;}
  var endTs=Date.now();
  var min=nm.min,max=nm.max,count=nm.count,sum=nm.sum,startTs=nm.startTs,chart=nm.chart.slice();
  nmTeardown();
  if(!count){ if(typeof showToast==='function')showToast('Chưa đo đủ dữ liệu để lưu.','warn'); nmResetLiveUI(); return; }
  var avg=Math.round(sum/count);
  var durSec=Math.max(1,Math.round((endTs-startTs)/1000));
  var sd=new Date(startTs), ed=new Date(endTs);
  var spark=nmDownsample(chart,40);
  var rec={
    id:'noise_'+startTs,
    date:localDateISO(sd),
    startTime:nmHM(sd), endTime:nmHM(ed),
    startTs:startTs, endTs:endTs, durationSec:durSec,
    min:(min==null?avg:min), max:(max==null?avg:max), avg:avg,
    spark:spark,
    createdAt:new Date().toISOString()
  };
  var db=load(); db.noiseLogs=Array.isArray(db.noiseLogs)?db.noiseLogs:[]; db.noiseLogs.unshift(rec); save(db);
  nmRenderHistory(db);
  nmResetLiveUI();
  var lv=nmLevel(avg);
  if(typeof showToast==='function')showToast('Đã lưu: TB '+avg+' dB · '+lv.emoji+' '+lv.short,'success');
}

function nmTeardown(){
  nm.running=false;
  if(nm.tick){clearInterval(nm.tick);nm.tick=null;}
  if(nm.raf){cancelAnimationFrame(nm.raf);nm.raf=null;}
  try{if(nm.src)nm.src.disconnect();}catch(e){}
  try{if(nm.analyser)nm.analyser.disconnect();}catch(e){}
  try{if(nm.stream)nm.stream.getTracks().forEach(function(t){t.stop();});}catch(e){}
  try{if(nm.ctx&&nm.ctx.close)nm.ctx.close();}catch(e){}
  nm.ctx=null;nm.stream=null;nm.src=null;nm.analyser=null;nm.buf=null;
  nmSetToggleBtn(false);
}

/* Dừng ngay không lưu khi rời trang giữa chừng */
function nmAbortIfRunning(){ if(nm.running){ nmTeardown(); nmResetLiveUI(); } }

function nmSetToggleBtn(on){
  var b=byId('nmToggleBtn');if(!b)return;
  if(on){b.textContent='⏹ Dừng đo';b.className='nmStop';}
  else{b.textContent='▶ Bắt đầu đo';b.className='nmStart';}
}

function nmResetLiveUI(){
  var card=byId('noiseMeter');
  if(card){card.style.removeProperty('--nm-c');card.style.removeProperty('--nm-soft');}
  var set=function(id,v){var e=byId(id);if(e)e.textContent=v;};
  set('nmCurrent','--');set('nmStatCur','--');set('nmStatMin','--');set('nmStatMax','--');set('nmStatAvg','--');set('nmStatTime','00:00:00');
  var bar=byId('nmBarFill');if(bar)bar.style.width='0%';
  var st=byId('nmStatus');if(st){st.className='nmStatus nmStatusIdle';st.textContent='Chưa đo';}
  nm.chart=[];nmRenderChart();
  nmSetToggleBtn(false);
}

function nmOnEnterPage(){ if(!nm.running) nmResetLiveUI(); nmRenderHistory(load()); }

function nmRenderHistory(db){
  var box=byId('nmHistory');if(!box)return;
  db=db||load();var logs=Array.isArray(db.noiseLogs)?db.noiseLogs:[];
  if(!logs.length){
    box.innerHTML='<div class="nmLogEmpty"><span class="nmEmptyIco">🔊</span>'+
      '<b>Chưa có lần đo nào</b><small>Bấm “Bắt đầu đo” để kiểm tra độ ồn quanh bé.</small></div>';
    return;
  }
  /* gom nhóm theo ngày, giữ nguyên thứ tự mới nhất trước */
  var groups=[],map={};
  logs.forEach(function(r){
    var d=r.date||'';
    if(!map[d]){map[d]={date:d,items:[]};groups.push(map[d]);}
    map[d].items.push(r);
  });
  box.innerHTML=groups.map(function(g){
    var tag=nmDayTag(g.date);
    var head='<div class="nmDayHead">'+
        '<span class="nmDayDate">'+esc(fmtDate(g.date))+'</span>'+
        (tag?'<span class="nmDayTag">'+esc(tag)+'</span>':'')+
        '<span class="nmDayRule"></span>'+
        '<span class="nmDayCount">'+g.items.length+' lần đo</span>'+
      '</div>';
    var body=g.items.map(function(r){
      var lv=nmLevel(r.avg);
      var spark=nmSparkSvg(r.spark,lv.c);
      return '<div class="nmLog" style="--nm-c:'+lv.c+';--nm-soft:'+lv.soft+'">'+
        '<div class="nmLogTop">'+
          '<span class="nmLogIco">🔊</span>'+
          '<div class="nmLogHeadMain">'+
            '<div class="nmLogTime"><span>'+esc(r.startTime||'')+'</span>'+
              '<span class="nmLogArrow">→</span><span>'+esc(r.endTime||'')+'</span></div>'+
            '<div class="nmLogDur">⏱ '+esc(nmDurText(r.durationSec))+'</div>'+
          '</div>'+
          '<button type="button" class="nmLogDel" title="Xóa bản ghi" aria-label="Xóa bản ghi" onclick="nmDeleteLog(\''+esc(r.id)+'\')">🗑</button>'+
        '</div>'+
        '<div class="nmLogStats">'+
          '<div class="nmCell"><small>THẤP NHẤT</small><b>'+esc(r.min)+'<i>dB</i></b></div>'+
          '<div class="nmCell nmCellAvg"><small>TRUNG BÌNH</small><b>'+esc(r.avg)+'<i>dB</i></b></div>'+
          '<div class="nmCell"><small>CAO NHẤT</small><b>'+esc(r.max)+'<i>dB</i></b></div>'+
        '</div>'+
        (spark?('<div class="nmSpark">'+spark+'</div>'):'')+
        '<div class="nmLogBadge">'+lv.emoji+' <span>'+esc(lv.short)+' · '+esc(lv.fit)+'</span></div>'+
      '</div>';
    }).join('');
    return head+body;
  }).join('');
}

/* Nhãn ngày tương đối cho tiêu đề nhóm */
function nmDayTag(dstr){
  if(!dstr)return '';
  try{
    var t=new Date(today()+'T00:00:00'), d=new Date(dstr+'T00:00:00');
    if(isNaN(d.getTime())||isNaN(t.getTime()))return '';
    var diff=Math.round((t-d)/86400000);
    if(diff===0)return 'Hôm nay';
    if(diff===1)return 'Hôm qua';
    return '';
  }catch(e){return ''}
}

/* Sparkline diễn biến buổi đo */
function nmSparkSvg(arr,color){
  if(!arr||!arr.length||arr.length<2)return '';
  var W=300,H=34,lo=Math.min.apply(null,arr),hi=Math.max.apply(null,arr);
  if(hi-lo<6)hi=lo+6;
  var x=function(i){return (i/(arr.length-1))*W},
      y=function(v){return 3+(1-(v-lo)/(hi-lo))*(H-6)};
  var pts=arr.map(function(v,i){return x(i).toFixed(1)+','+y(v).toFixed(1)}).join(' ');
  var area=pts+' '+W+','+H+' 0,'+H;
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+
    '<polygon points="'+area+'" fill="'+color+'" opacity=".13"/>'+
    '<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2" '+
      'stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
}

function nmDeleteLog(id){
  if(!confirm('Xóa bản ghi đo tiếng ồn này?'))return;
  var db=load();db.noiseLogs=(db.noiseLogs||[]).filter(function(r){return r.id!==id;});save(db);nmRenderHistory(db);
  if(typeof showToast==='function')showToast('Đã xóa bản ghi.','success');
}

function nmOpenInfo(){var s=byId('nmInfoSheet');if(s){s.classList.add('open');s.setAttribute('aria-hidden','false');}}
function nmCloseInfo(e){if(e&&e.target&&e.target.classList&&!e.target.classList.contains('nmSheet')&&!e.target.classList.contains('nmSheetClose'))return;var s=byId('nmInfoSheet');if(s){s.classList.remove('open');s.setAttribute('aria-hidden','true');}}

/* helpers */
function nmHM(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function nmDurText(sec){sec=Math.max(0,Math.round(sec||0));var m=Math.floor(sec/60),s=sec%60;if(m<60)return m>0?(m+' phút'+(s?(' '+s+' giây'):'')):(s+' giây');var h=Math.floor(m/60);m=m%60;return h+' giờ'+(m?(' '+m+' phút'):'');}
function nmDownsample(arr,n){if(!arr||arr.length<=n)return (arr||[]).slice();var out=[],step=arr.length/n,i;for(i=0;i<n;i++){out.push(arr[Math.floor(i*step)]);}return out;}

/* =========================================================
   V13.8.0 · Đo ánh sáng (Lux Meter)
   Ưu tiên cảm biến ánh sáng thật (AmbientLightSensor),
   không có thì ước lượng qua camera. Chỉ mang tính tham khảo.
   ========================================================= */
var LX_CAM_K=1200;     /* hệ số quy đổi camera -> lux (hiệu chỉnh theo máy) */
var LX_GAMMA=2.2;
var LX_MAX=1000;       /* mốc đầy thanh (thang log) */
var LX_TICK_MS=400;
var LX_CHART_MAX=140;
var LX_THRESH=[10,40,150,500];
var lx={running:false,mode:'',sensor:null,stream:null,video:null,canvas:null,cctx:null,
        tick:null,last:0,min:null,max:null,sum:0,count:0,startTs:0,chart:[]};

function lxLevel(v){
  if(v<10)   return {q:1,emoji:'🌑',short:'Rất tối',      fit:'Phù hợp cho bé ngủ ban đêm', c:'#5a6ea8',soft:'rgba(90,110,168,.16)'};
  if(v<=40)  return {q:2,emoji:'🌙',short:'Ánh sáng dịu', fit:'Phù hợp cho bé ngủ, bú đêm', c:'#7a6fc4',soft:'rgba(122,111,196,.17)'};
  if(v<=150) return {q:3,emoji:'🟢',short:'Ánh sáng nhẹ', fit:'Sinh hoạt yên tĩnh, chơi nhẹ',c:'#37a06a',soft:'rgba(55,160,106,.15)'};
  if(v<=500) return {q:4,emoji:'☀️',short:'Đủ sáng',      fit:'Phù hợp hoạt động ban ngày', c:'#d99b2a',soft:'rgba(217,155,42,.16)'};
  return       {q:5,emoji:'⚠️',short:'Quá sáng',    fit:'Nên giảm sáng khi bé sắp ngủ',c:'#d75048',soft:'rgba(215,80,72,.16)'};
}
/* Thang log: lux trải 0→1000+, thang thẳng sẽ dìm mất vùng 10-40 lux (vùng bé ngủ) */
function lxPct(v){
  v=Math.max(0,v||0);
  return Math.max(0,Math.min(100,Math.log10(1+v)/Math.log10(1+LX_MAX)*100));
}
function lxDrawTicks(){
  var t=byId('lxTicks');if(!t)return;
  t.innerHTML=LX_THRESH.map(function(v){return '<i style="left:'+lxPct(v).toFixed(1)+'%">'+v+'</i>'}).join('');
}

function lxToggle(){ if(lx.running) lxStop(); else lxStart(); }

function lxStart(){
  if(lx.running)return;
  /* 1) thử cảm biến ánh sáng thật */
  if(typeof AmbientLightSensor!=='undefined'){
    try{
      var s=new AmbientLightSensor({frequency:5});
      s.addEventListener('reading',function(){ lx.last=Math.max(0,Math.round(s.illuminance||0)); });
      s.addEventListener('error',function(){ lxStopSensor(); if(lx.running)lxUseCamera(true); else lxUseCamera(false); });
      s.start();
      lx.sensor=s;lx.mode='sensor';
      lxBeginSession();
      return;
    }catch(e){ lx.sensor=null; }
  }
  /* 2) fallback camera */
  lxUseCamera(false);
}

function lxUseCamera(alreadyRunning){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    if(typeof showToast==='function')showToast('Thiết bị không có cảm biến ánh sáng và không dùng được camera để ước lượng.','warn');
    return;
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(stream){
    lx.stream=stream;lx.mode='camera';
    var v=document.createElement('video');
    v.srcObject=stream;v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');
    v.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px';
    document.body.appendChild(v);
    var p=v.play();if(p&&p.catch)p.catch(function(){});
    lx.video=v;
    var cv=document.createElement('canvas');cv.width=64;cv.height=48;
    lx.canvas=cv;lx.cctx=cv.getContext('2d',{willReadFrequently:true});
    if(!alreadyRunning)lxBeginSession();
  }).catch(function(err){
    var msg='Không truy cập được camera để ước lượng ánh sáng. Vui lòng cấp quyền camera rồi thử lại.';
    if(err&&(err.name==='NotAllowedError'||err.name==='SecurityError'))msg='Quyền camera đã bị từ chối. Hãy bật lại quyền camera trong cài đặt trình duyệt.';
    else if(err&&err.name==='NotFoundError')msg='Không tìm thấy camera trên thiết bị.';
    if(typeof showToast==='function')showToast(msg,'warn');
  });
}

function lxBeginSession(){
  lx.running=true;lx.min=null;lx.max=null;lx.sum=0;lx.count=0;lx.chart=[];lx.startTs=Date.now();
  lxSetToggleBtn(true);
  lxNoteMode();
  lx.tick=setInterval(lxSample,LX_TICK_MS);
  lxSample();
}

function lxReadCamera(){
  if(!lx.video||!lx.cctx||!lx.video.videoWidth)return null;
  try{
    lx.cctx.drawImage(lx.video,0,0,64,48);
    var d=lx.cctx.getImageData(0,0,64,48).data,s=0,i;
    for(i=0;i<d.length;i+=4){s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];}
    var Yavg=s/(d.length/4);
    return Math.max(0,Math.round(Math.pow(Yavg/255,LX_GAMMA)*LX_CAM_K));
  }catch(e){return null}
}

function lxSample(){
  if(!lx.running)return;
  var cur;
  if(lx.mode==='camera'){ var r=lxReadCamera(); if(r===null)return; cur=r; }
  else { cur=Math.max(0,Math.round(lx.last||0)); }
  if(lx.min===null||cur<lx.min)lx.min=cur;
  if(lx.max===null||cur>lx.max)lx.max=cur;
  lx.sum+=cur;lx.count++;
  lx.chart.push(cur);if(lx.chart.length>LX_CHART_MAX)lx.chart.shift();
  lxPaintLive(cur,lx.min,lx.max,Math.round(lx.sum/lx.count));
}

function lxPaintLive(cur,mn,mx,avg){
  var lv=lxLevel(cur),card=byId('lxCard');
  if(card){card.style.setProperty('--lx-c',lv.c);card.style.setProperty('--lx-soft',lv.soft);}
  var set=function(id,v){var e=byId(id);if(e)e.textContent=v;};
  set('lxCurrent',cur);set('lxStatCur',cur);set('lxStatMin',(mn==null?'--':mn));
  set('lxStatMax',(mx==null?'--':mx));set('lxStatAvg',(avg==null?'--':avg));
  var bar=byId('lxBarFill');if(bar)bar.style.width=lxPct(cur).toFixed(1)+'%';
  var st=byId('lxStatus');if(st){st.className='lxStatus';st.textContent=lv.emoji+' '+lv.short;}
  var t=byId('lxStatTime');if(t)t.textContent=fmtHHMMSSDuration(Math.floor((Date.now()-lx.startTs)/1000));
  lxRenderChart();
}

function lxRenderChart(){
  var box=byId('lxChart');if(!box)return;
  var data=lx.chart;
  if(!data.length){
    box.innerHTML='<div class="lxChartEmpty">Biểu đồ hiện khi bắt đầu đo.<br>Lưới ngang là 4 mốc đánh giá: 10 · 40 · 150 · 500 Lux.</div>';
    return;
  }
  var W=320,H=158,padL=30,padR=8,padT=10,padB=14;
  var xw=W-padL-padR,yh=H-padT-padB;
  var X=function(i){return data.length<=1?padL:padL+(i/(data.length-1))*xw};
  var Y=function(v){return padT+(1-lxPct(v)/100)*yh};
  var grid=LX_THRESH.map(function(v){
    var y=Y(v).toFixed(1);
    return '<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/>'+
           '<text x="3" y="'+(Number(y)+3).toFixed(1)+'" fill="var(--muted)" font-size="10" font-weight="700">'+v+'</text>';
  }).join('');
  var pts=data.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}).join(' ');
  var lv=lxLevel(data[data.length-1]);
  var area=(data.length>1)?('<polygon points="'+padL.toFixed(1)+','+(H-padB).toFixed(1)+' '+pts+' '+X(data.length-1).toFixed(1)+','+(H-padB).toFixed(1)+'" fill="'+lv.c+'" opacity=".13"/>'):'';
  box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+grid+area+
    '<polyline points="'+pts+'" fill="none" stroke="'+lv.c+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
}

function lxStop(){
  if(!lx.running){lxTeardown();return;}
  var endTs=Date.now();
  var min=lx.min,max=lx.max,count=lx.count,sum=lx.sum,startTs=lx.startTs,chart=lx.chart.slice(),mode=lx.mode;
  lxTeardown();
  if(!count){ if(typeof showToast==='function')showToast('Chưa đo đủ dữ liệu để lưu.','warn'); lxResetLiveUI(); return; }
  var avg=Math.round(sum/count);
  var durSec=Math.max(1,Math.round((endTs-startTs)/1000));
  var sd=new Date(startTs),ed=new Date(endTs);
  var rec={
    id:'lux_'+startTs,
    date:localDateISO(sd),
    startTime:lxHM(sd),endTime:lxHM(ed),
    startTs:startTs,endTs:endTs,durationSec:durSec,
    min:(min==null?avg:min),max:(max==null?avg:max),avg:avg,
    mode:mode,spark:nmDownsample(chart,40),
    createdAt:new Date().toISOString()
  };
  var db=load();db.luxLogs=Array.isArray(db.luxLogs)?db.luxLogs:[];db.luxLogs.unshift(rec);save(db);
  lxRenderHistory(db);
  lxResetLiveUI();
  var lv=lxLevel(avg);
  if(typeof showToast==='function')showToast('Đã lưu: TB '+avg+' Lux · '+lv.emoji+' '+lv.short,'success');
}

function lxStopSensor(){
  try{if(lx.sensor&&lx.sensor.stop)lx.sensor.stop();}catch(e){}
  lx.sensor=null;
}
function lxTeardown(){
  lx.running=false;
  if(lx.tick){clearInterval(lx.tick);lx.tick=null;}
  lxStopSensor();
  try{if(lx.stream)lx.stream.getTracks().forEach(function(t){t.stop();});}catch(e){}
  if(lx.video&&lx.video.parentNode)lx.video.parentNode.removeChild(lx.video);
  lx.stream=null;lx.video=null;lx.canvas=null;lx.cctx=null;lx.mode='';lx.last=0;
  lxSetToggleBtn(false);
  lxNoteMode();
}
/* Rời trang giữa chừng: tắt cảm biến/camera, không tạo bản ghi */
function lxAbortIfRunning(){ if(lx.running){ lxTeardown(); lxResetLiveUI(); } }

function lxSetToggleBtn(on){
  var b=byId('lxToggleBtn');if(!b)return;
  if(on){b.textContent='⏹ Dừng đo';b.className='lxStop';}
  else{b.textContent='▶ Bắt đầu đo';b.className='lxStart';}
}
function lxNoteMode(){
  var n=byId('lxNote');if(!n)return;
  if(lx.running&&lx.mode==='sensor')n.textContent='Đang đọc từ cảm biến ánh sáng của thiết bị. Giá trị chỉ mang tính tham khảo, không thay thế máy đo Lux chuyên dụng.';
  else if(lx.running&&lx.mode==='camera')n.textContent='Thiết bị không có cảm biến ánh sáng nên đang ước lượng qua camera. Hãy hướng camera sau về phía không gian cần đo và đừng che ống kính. Giá trị chỉ mang tính tham khảo.';
  else n.textContent='Lưu ý: Giá trị Lux được đo bằng cảm biến hoặc camera của điện thoại và chỉ mang tính tham khảo. Kết quả có thể khác nhau giữa các dòng thiết bị.';
}
function lxResetLiveUI(){
  var card=byId('lxCard');
  if(card){card.style.removeProperty('--lx-c');card.style.removeProperty('--lx-soft');}
  var set=function(id,v){var e=byId(id);if(e)e.textContent=v;};
  set('lxCurrent','--');set('lxStatCur','--');set('lxStatMin','--');set('lxStatMax','--');set('lxStatAvg','--');set('lxStatTime','00:00:00');
  var bar=byId('lxBarFill');if(bar)bar.style.width='0%';
  var st=byId('lxStatus');if(st){st.className='lxStatus lxStatusIdle';st.textContent='Chưa đo';}
  lx.chart=[];lxRenderChart();lxDrawTicks();lxSetToggleBtn(false);lxNoteMode();
}
function lxOnEnterPage(){ if(!lx.running)lxResetLiveUI(); lxDrawTicks(); lxRenderHistory(load()); }

function lxRenderHistory(db){
  var box=byId('lxHistory');if(!box)return;
  db=db||load();var logs=Array.isArray(db.luxLogs)?db.luxLogs:[];
  if(!logs.length){
    box.innerHTML='<div class="lxLogEmpty"><span class="lxEmptyIco">💡</span>'+
      '<b>Chưa có lần đo nào</b><small>Bấm “Bắt đầu đo” để kiểm tra ánh sáng phòng bé.</small></div>';
    return;
  }
  var groups=[],map={};
  logs.forEach(function(r){var d=r.date||'';if(!map[d]){map[d]={date:d,items:[]};groups.push(map[d]);}map[d].items.push(r);});
  box.innerHTML=groups.map(function(g){
    var tag=nmDayTag(g.date);
    var head='<div class="lxDayHead">'+
        '<span class="lxDayDate">'+esc(fmtDate(g.date))+'</span>'+
        (tag?'<span class="lxDayTag">'+esc(tag)+'</span>':'')+
        '<span class="lxDayRule"></span>'+
        '<span class="lxDayCount">'+g.items.length+' lần đo</span>'+
      '</div>';
    return head+g.items.map(function(r){
      var lv=lxLevel(r.avg);
      var sp=nmSparkSvg(r.spark,lv.c);
      var via=(r.mode==='camera')?' · 📷 ước lượng':'';
      return '<div class="lxLog" style="--lx-c:'+lv.c+';--lx-soft:'+lv.soft+'">'+
        '<div class="lxLogTop">'+
          '<span class="lxLogIco">💡</span>'+
          '<div class="lxLogMain">'+
            '<div class="lxLogTime"><span>'+esc(r.startTime||'')+'</span>'+
              '<span class="lxArrow">→</span><span>'+esc(r.endTime||'')+'</span></div>'+
            '<div class="lxLogDur">⏱ '+esc(nmDurText(r.durationSec))+esc(via)+'</div>'+
          '</div>'+
          '<button type="button" class="lxLogDel" title="Xóa bản ghi" aria-label="Xóa bản ghi" onclick="lxDeleteLog(\''+esc(r.id)+'\')">🗑</button>'+
        '</div>'+
        '<div class="lxLogStats">'+
          '<div class="lxCell"><small>THẤP NHẤT</small><b>'+esc(r.min)+'<i>lx</i></b></div>'+
          '<div class="lxCell lxCellAvg"><small>TRUNG BÌNH</small><b>'+esc(r.avg)+'<i>lx</i></b></div>'+
          '<div class="lxCell"><small>CAO NHẤT</small><b>'+esc(r.max)+'<i>lx</i></b></div>'+
        '</div>'+
        (sp?('<div class="lxSpark">'+sp+'</div>'):'')+
        '<div class="lxBadge">'+lv.emoji+' <span>'+esc(lv.short)+' · '+esc(lv.fit)+'</span></div>'+
      '</div>';
    }).join('');
  }).join('');
}

function lxDeleteLog(id){
  if(!confirm('Xóa bản ghi đo ánh sáng này?'))return;
  var db=load();db.luxLogs=(db.luxLogs||[]).filter(function(r){return r.id!==id;});save(db);lxRenderHistory(db);
  if(typeof showToast==='function')showToast('Đã xóa bản ghi.','success');
}
function lxOpenInfo(){var s=byId('lxInfoSheet');if(s){s.classList.add('open');s.setAttribute('aria-hidden','false');}}
function lxCloseInfo(e){if(e&&e.target&&e.target.classList&&!e.target.classList.contains('nmSheet')&&!e.target.classList.contains('nmSheetClose'))return;var s=byId('lxInfoSheet');if(s){s.classList.remove('open');s.setAttribute('aria-hidden','true');}}
function lxHM(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}


/* ==== WHO Child Growth Standards 2006 · bảng LMS theo tháng tuổi (0–60) ==== */
var WHO_LMS={};
WHO_LMS['wfa_b']=[[0.3487,3.3464,0.14602],[0.2297,4.4709,0.13395],[0.197,5.5675,0.12385],[0.1738,6.3762,0.11727],[0.1553,7.0023,0.11316],[0.1395,7.5105,0.1108],[0.1257,7.934,0.10958],[0.1134,8.297,0.10902],[0.1021,8.6151,0.10882],[0.0917,8.9014,0.10881],[0.082,9.1649,0.10891],[0.073,9.4122,0.10906],[0.0644,9.6479,0.10925],[0.0563,9.8749,0.10949],[0.0487,10.0953,0.10976],[0.0413,10.3108,0.11007],[0.0343,10.5228,0.11041],[0.0275,10.7319,0.11079],[0.0211,10.9385,0.11119],[0.0148,11.143,0.11164],[0.0087,11.3462,0.11211],[0.0029,11.5486,0.11261],[-0.0028,11.7504,0.11314],[-0.0083,11.9514,0.11369],[-0.0137,12.1515,0.11426],[-0.0189,12.3502,0.11485],[-0.024,12.5466,0.11544],[-0.0289,12.7401,0.11604],[-0.0337,12.9303,0.11664],[-0.0385,13.1169,0.11723],[-0.0431,13.3,0.11781],[-0.0476,13.4798,0.11839],[-0.052,13.6567,0.11896],[-0.0564,13.8309,0.11953],[-0.0606,14.0031,0.12008],[-0.0648,14.1736,0.12062],[-0.0689,14.3429,0.12116],[-0.0729,14.5113,0.12168],[-0.0769,14.6791,0.1222],[-0.0808,14.8466,0.12271],[-0.0846,15.014,0.12322],[-0.0883,15.1813,0.12373],[-0.092,15.3486,0.12425],[-0.0957,15.5158,0.12478],[-0.0993,15.6828,0.12531],[-0.1028,15.8497,0.12586],[-0.1063,16.0163,0.12643],[-0.1097,16.1827,0.127],[-0.1131,16.3489,0.12759],[-0.1165,16.515,0.12819],[-0.1198,16.6811,0.1288],[-0.123,16.8471,0.12943],[-0.1262,17.0132,0.13005],[-0.1294,17.1792,0.13069],[-0.1325,17.3452,0.13133],[-0.1356,17.5111,0.13197],[-0.1387,17.6768,0.13261],[-0.1417,17.8422,0.13325],[-0.1447,18.0073,0.13389],[-0.1477,18.1722,0.13453],[-0.1506,18.3366,0.13517]];
WHO_LMS['wfa_g']=[[0.3809,3.2322,0.14171],[0.1714,4.1873,0.13724],[0.0962,5.1282,0.13],[0.0402,5.8458,0.12619],[-0.005,6.4237,0.12402],[-0.043,6.8985,0.12274],[-0.0756,7.297,0.12204],[-0.1039,7.6422,0.12178],[-0.1288,7.9487,0.12181],[-0.1507,8.2254,0.12199],[-0.17,8.48,0.12223],[-0.1872,8.7192,0.12247],[-0.2024,8.9481,0.12268],[-0.2158,9.1699,0.12283],[-0.2278,9.387,0.12294],[-0.2384,9.6008,0.12299],[-0.2478,9.8124,0.12303],[-0.2562,10.0226,0.12306],[-0.2637,10.2315,0.12309],[-0.2703,10.4393,0.12315],[-0.2762,10.6464,0.12323],[-0.2815,10.8534,0.12335],[-0.2862,11.0608,0.1235],[-0.2903,11.2688,0.12369],[-0.2941,11.4775,0.1239],[-0.2975,11.6864,0.12414],[-0.3005,11.8947,0.12441],[-0.3032,12.1015,0.12472],[-0.3057,12.3059,0.12506],[-0.308,12.5073,0.12545],[-0.3101,12.7055,0.12587],[-0.312,12.9006,0.12633],[-0.3138,13.093,0.12683],[-0.3155,13.2837,0.12737],[-0.3171,13.4731,0.12794],[-0.3186,13.6618,0.12855],[-0.3201,13.8503,0.12919],[-0.3216,14.0385,0.12988],[-0.323,14.2265,0.13059],[-0.3243,14.414,0.13135],[-0.3257,14.601,0.13213],[-0.327,14.7873,0.13293],[-0.3283,14.9727,0.13376],[-0.3296,15.1573,0.1346],[-0.3309,15.341,0.13545],[-0.3322,15.524,0.1363],[-0.3335,15.7064,0.13716],[-0.3348,15.8882,0.138],[-0.3361,16.0697,0.13884],[-0.3374,16.2511,0.13968],[-0.3387,16.4322,0.14051],[-0.34,16.6133,0.14132],[-0.3414,16.7942,0.14213],[-0.3427,16.9748,0.14293],[-0.344,17.1551,0.14371],[-0.3453,17.3347,0.14448],[-0.3466,17.5136,0.14525],[-0.3479,17.6916,0.146],[-0.3492,17.8686,0.14675],[-0.3505,18.0445,0.14748],[-0.3518,18.2193,0.14821]];
WHO_LMS['lhfa_b']=[[1,49.8842,0.03795],[1,54.7244,0.03557],[1,58.4249,0.03424],[1,61.4292,0.03328],[1,63.886,0.03257],[1,65.9026,0.03204],[1,67.6236,0.03165],[1,69.1645,0.03139],[1,70.5994,0.03124],[1,71.9687,0.03117],[1,73.2812,0.03118],[1,74.5388,0.03125],[1,75.7488,0.03137],[1,76.9186,0.03154],[1,78.0497,0.03174],[1,79.1458,0.03197],[1,80.2113,0.03222],[1,81.2487,0.0325],[1,82.2587,0.03279],[1,83.2418,0.0331],[1,84.1996,0.03342],[1,85.1348,0.03376],[1,86.0477,0.0341],[1,86.941,0.03445],[1,87.8161,0.03479],[1,87.972,0.03542],[1,88.8065,0.03576],[1,89.6197,0.0361],[1,90.412,0.03642],[1,91.1828,0.03674],[1,91.9327,0.03704],[1,92.6631,0.03733],[1,93.3753,0.03761],[1,94.0711,0.03787],[1,94.7532,0.03812],[1,95.4236,0.03836],[1,96.0835,0.03858],[1,96.7337,0.03879],[1,97.3749,0.039],[1,98.0073,0.03919],[1,98.631,0.03937],[1,99.2459,0.03954],[1,99.8515,0.03971],[1,100.4485,0.03986],[1,101.0374,0.04002],[1,101.6186,0.04016],[1,102.1933,0.04031],[1,102.7625,0.04045],[1,103.3273,0.04059],[1,103.8886,0.04073],[1,104.4473,0.04086],[1,105.0041,0.041],[1,105.5596,0.04113],[1,106.1138,0.04126],[1,106.6668,0.04139],[1,107.2188,0.04152],[1,107.7697,0.04165],[1,108.3198,0.04177],[1,108.8689,0.0419],[1,109.417,0.04202],[1,109.9638,0.04214]];
WHO_LMS['lhfa_g']=[[1,49.1477,0.0379],[1,53.6872,0.0364],[1,57.0673,0.03568],[1,59.8029,0.0352],[1,62.0899,0.03486],[1,64.0301,0.03463],[1,65.7311,0.03448],[1,67.2873,0.03441],[1,68.7498,0.0344],[1,70.1435,0.03444],[1,71.4818,0.03452],[1,72.771,0.03464],[1,74.015,0.03479],[1,75.2176,0.03496],[1,76.3817,0.03514],[1,77.5099,0.03534],[1,78.6055,0.03555],[1,79.671,0.03576],[1,80.7079,0.03598],[1,81.7182,0.0362],[1,82.7036,0.03643],[1,83.6654,0.03666],[1,84.604,0.03688],[1,85.5202,0.03711],[1,86.4153,0.03734],[1,86.5904,0.03786],[1,87.4462,0.03808],[1,88.283,0.0383],[1,89.1004,0.03851],[1,89.8991,0.03872],[1,90.6797,0.03893],[1,91.443,0.03913],[1,92.1906,0.03933],[1,92.9239,0.03952],[1,93.6444,0.03971],[1,94.3533,0.03989],[1,95.0515,0.04006],[1,95.7399,0.04024],[1,96.4187,0.04041],[1,97.0885,0.04057],[1,97.7493,0.04073],[1,98.4015,0.04089],[1,99.0448,0.04105],[1,99.6795,0.0412],[1,100.3058,0.04135],[1,100.9238,0.0415],[1,101.5337,0.04164],[1,102.136,0.04179],[1,102.7312,0.04193],[1,103.3197,0.04206],[1,103.9021,0.0422],[1,104.4786,0.04233],[1,105.0494,0.04246],[1,105.6148,0.04259],[1,106.1748,0.04272],[1,106.7295,0.04285],[1,107.2788,0.04298],[1,107.8227,0.0431],[1,108.3613,0.04322],[1,108.8948,0.04334],[1,109.4233,0.04347]];
WHO_LMS['hcfa_b']=[[1,34.4618,0.03686],[1,37.2759,0.03133],[1,39.1285,0.02997],[1,40.5135,0.02918],[1,41.6317,0.02868],[1,42.5576,0.02837],[1,43.3306,0.02817],[1,43.9803,0.02804],[1,44.53,0.02796],[1,44.9998,0.02792],[1,45.4051,0.0279],[1,45.7573,0.02789],[1,46.0661,0.02789],[1,46.3395,0.02789],[1,46.5844,0.02791],[1,46.806,0.02792],[1,47.0088,0.02795],[1,47.1962,0.02797],[1,47.3711,0.028],[1,47.5357,0.02803],[1,47.6919,0.02806],[1,47.8408,0.0281],[1,47.9833,0.02813],[1,48.1201,0.02817],[1,48.2515,0.02821],[1,48.3777,0.02825],[1,48.4989,0.0283],[1,48.6151,0.02834],[1,48.7264,0.02838],[1,48.8331,0.02842],[1,48.9351,0.02847],[1,49.0327,0.02851],[1,49.126,0.02855],[1,49.2153,0.02859],[1,49.3007,0.02863],[1,49.3826,0.02867],[1,49.4612,0.02871],[1,49.5367,0.02875],[1,49.6093,0.02878],[1,49.6791,0.02882],[1,49.7465,0.02886],[1,49.8116,0.02889],[1,49.8745,0.02893],[1,49.9354,0.02896],[1,49.9942,0.02899],[1,50.0512,0.02903],[1,50.1064,0.02906],[1,50.1598,0.02909],[1,50.2115,0.02912],[1,50.2617,0.02915],[1,50.3105,0.02918],[1,50.3578,0.02921],[1,50.4039,0.02924],[1,50.4488,0.02927],[1,50.4926,0.02929],[1,50.5354,0.02932],[1,50.5772,0.02935],[1,50.6183,0.02938],[1,50.6587,0.0294],[1,50.6984,0.02943],[1,50.7375,0.02946]];
WHO_LMS['hcfa_g']=[[1,33.8787,0.03496],[1,36.5463,0.0321],[1,38.2521,0.03168],[1,39.5328,0.0314],[1,40.5817,0.03119],[1,41.459,0.03102],[1,42.1995,0.03087],[1,42.829,0.03075],[1,43.3671,0.03063],[1,43.83,0.03053],[1,44.2319,0.03044],[1,44.5844,0.03035],[1,44.8965,0.03027],[1,45.1752,0.03019],[1,45.4265,0.03012],[1,45.6551,0.03006],[1,45.865,0.02999],[1,46.0598,0.02993],[1,46.2424,0.02987],[1,46.4152,0.02982],[1,46.5801,0.02977],[1,46.7384,0.02972],[1,46.8913,0.02967],[1,47.0391,0.02962],[1,47.1822,0.02957],[1,47.3204,0.02953],[1,47.4536,0.02949],[1,47.5817,0.02945],[1,47.7045,0.02941],[1,47.8219,0.02937],[1,47.934,0.02933],[1,48.041,0.02929],[1,48.1432,0.02926],[1,48.2408,0.02922],[1,48.3343,0.02919],[1,48.4239,0.02915],[1,48.5099,0.02912],[1,48.5926,0.02909],[1,48.6722,0.02906],[1,48.7489,0.02903],[1,48.8228,0.029],[1,48.8941,0.02897],[1,48.9629,0.02894],[1,49.0294,0.02891],[1,49.0937,0.02888],[1,49.156,0.02886],[1,49.2164,0.02883],[1,49.2751,0.0288],[1,49.3321,0.02878],[1,49.3877,0.02875],[1,49.4419,0.02873],[1,49.4947,0.0287],[1,49.5464,0.02868],[1,49.5969,0.02865],[1,49.6464,0.02863],[1,49.6947,0.02861],[1,49.7421,0.02859],[1,49.7885,0.02856],[1,49.8341,0.02854],[1,49.8789,0.02852],[1,49.9229,0.0285]];

/* =========================================================================
   V13.10.0 · Biểu đồ tăng trưởng WHO (WHO Child Growth Standards 2006)
   -------------------------------------------------------------------------
   Bổ sung cho trang "Biểu đồ phát triển sau sinh": đối chiếu cân nặng,
   chiều dài/cao và vòng đầu của bé với chuẩn WHO cho trẻ 0–5 tuổi.

   Toàn bộ mã trong khối này là mã THÊM MỚI, không sửa hàm cũ nào ngoài
   một dòng gọi renderWhoGrowth() trong renderBabyChart().

   Nguồn dữ liệu: bảng LMS chính thức của WHO (weight-for-age,
   length/height-for-age, head-circumference-for-age), 0–60 tháng.
   Công thức z-score:  z = ((X/M)^L − 1) / (L·S),  với L = 0 thì z = ln(X/M)/S
   Giá trị tại một mức z: X = M·(1 + L·S·z)^(1/L)
   ========================================================================= */

var WHO_IND = {
  wfa:  {field:'weight', label:'Cân nặng theo tuổi',      short:'Cân nặng',     unit:'kg', icon:'⚖️'},
  lhfa: {field:'length', label:'Chiều dài/cao theo tuổi', short:'Chiều dài',    unit:'cm', icon:'📏'},
  hcfa: {field:'head',   label:'Vòng đầu theo tuổi',      short:'Vòng đầu',     unit:'cm', icon:'🧢'}
};
var WHO_MAX_MONTH = 60;
var whoState = {ind:'wfa', range:0}; /* range 0 = tự động theo tuổi bé */

/* App gọi render() ngay trong lúc nạp script (mcMigrateFromNotes → save → render),
   thời điểm đó khối WHO ở cuối file chưa gán xong biến. whoReady() chặn lần gọi sớm
   đó lại; bản dựng thật diễn ra ở sự kiện window load sau khi mọi thứ đã sẵn sàng. */
function whoReady(){
  if(!whoState)whoState={ind:'wfa',range:0};
  return (typeof WHO_LMS!=='undefined')&&!!WHO_LMS&&!!WHO_LMS.wfa_b&&!!WHO_IND;
}

/* ----- Giới tính bé: WHO có chuẩn riêng cho bé trai và bé gái ----- */
function whoSex(db){var s=((db&&db.settings)||{}).babySex;return (s==='b'||s==='g')?s:''}
function whoSexLabel(s){return s==='b'?'Bé trai':(s==='g'?'Bé gái':'Chưa chọn')}
function whoSetSex(s){
  if(s!=='b'&&s!=='g')return;
  var db=load();db.settings=db.settings||{};db.settings.babySex=s;
  save(db); /* save() gọi render() → renderBabyChart() → renderWhoGrowth() */
  toast('Đã chọn '+whoSexLabel(s)+' cho chuẩn WHO','success');
}
function whoSetIndicator(ind){if(!whoReady()||!WHO_IND[ind])return;whoState.ind=ind;renderWhoGrowth(load())}
function whoSetRange(m){if(!whoReady())return;whoState.range=Number(m)||0;renderWhoGrowth(load())}

/* ----- Tuổi theo tháng (số thực) ----- */
function whoAgeMonths(birthDate,date){
  if(!birthDate||!date)return null;
  var d=daysBetween(birthDate,date);
  if(d<0)return null;
  return d/30.4375;
}
function whoAgeText(months){
  if(months===null||months===undefined)return '--';
  var m=Math.floor(months),d=Math.round((months-m)*30.4375);
  if(m<=0)return d+' ngày';
  return m+' tháng'+(d>0?(' '+d+' ngày'):'');
}

/* ----- Tra bảng LMS, nội suy tuyến tính giữa hai tháng ----- */
function whoLmsAt(ind,sex,months){
  var tbl=WHO_LMS[ind+'_'+sex];
  if(!tbl||months===null||months===undefined||months<0)return null;
  var m=Math.min(months,WHO_MAX_MONTH);
  var lo=Math.floor(m),hi=Math.min(lo+1,WHO_MAX_MONTH),t=m-lo;
  var a=tbl[lo],b=tbl[hi];
  if(!a)return null;
  if(!b||t===0)return [a[0],a[1],a[2]];
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}

/* ----- Chuyển đổi giữa giá trị đo và z-score ----- */
function whoValueAtZ(z,L,M,S){
  if(L===0)return M*Math.exp(S*z);
  return M*Math.pow(1+L*S*z,1/L);
}
function whoRawZ(x,L,M,S){
  if(L===0)return Math.log(x/M)/S;
  return (Math.pow(x/M,L)-1)/(L*S);
}
/* WHO hiệu chỉnh phần đuôi ngoài ±3 SD cho các chỉ số dựa trên cân nặng.
   Chiều dài và vòng đầu phân phối gần chuẩn nên không hiệu chỉnh. */
function whoZScore(ind,x,lms){
  if(!lms||!(x>0))return null;
  var L=lms[0],M=lms[1],S=lms[2],z=whoRawZ(x,L,M,S);
  if(!isFinite(z))return null;
  if(ind!=='wfa')return z;
  if(z>3){var s3=whoValueAtZ(3,L,M,S),s2=whoValueAtZ(2,L,M,S);return 3+(x-s3)/(s3-s2)}
  if(z<-3){var n3=whoValueAtZ(-3,L,M,S),n2=whoValueAtZ(-2,L,M,S);return -3+(x-n3)/(n2-n3)}
  return z;
}
/* Bách phân vị = hàm phân phối tích luỹ chuẩn (Abramowitz & Stegun 7.1.26) */
function whoPercentile(z){
  var t=1/(1+0.2316419*Math.abs(z));
  var d=0.3989422804014327*Math.exp(-z*z/2);
  var p=d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  var c=z>0?1-p:p;
  return Math.max(0,Math.min(100,c*100));
}
function whoPercentileText(z){
  var p=whoPercentile(z);
  if(p<0.1)return '<0,1';
  if(p>99.9)return '>99,9';
  return smartNum(p,1);
}

/* ----- Đọc giá trị đo từ một bản ghi, tự quy đổi đơn vị ----- */
function whoMeasureValue(ind,rec){
  var v=numVal(rec[WHO_IND[ind].field]);
  if(v===null||!(v>0))return null;
  /* Ô "Cân nặng" cho nhập kg hoặc g — số lớn hơn 100 chắc chắn là gam */
  if(ind==='wfa'&&v>100)v=v/1000;
  /* Chiều dài / vòng đầu nhập nhầm bằng mét */
  if(ind!=='wfa'&&v<10)v=v*100;
  return v;
}

/* ----- Đánh giá theo ngưỡng WHO ----- */
function whoClassify(ind,z){
  if(z===null)return {label:'--',tone:'na'};
  if(ind==='wfa'){
    if(z< -3)return {label:'Suy dinh dưỡng thể nhẹ cân, mức nặng',tone:'danger'};
    if(z< -2)return {label:'Suy dinh dưỡng thể nhẹ cân',tone:'warn'};
    if(z<=2) return {label:'Cân nặng bình thường',tone:'ok'};
    return {label:'Cân nặng cao hơn chuẩn',tone:'high'};
  }
  if(ind==='lhfa'){
    if(z< -3)return {label:'Thấp còi mức nặng',tone:'danger'};
    if(z< -2)return {label:'Thấp còi',tone:'warn'};
    if(z<=2) return {label:'Chiều cao bình thường',tone:'ok'};
    return {label:'Cao hơn chuẩn',tone:'high'};
  }
  if(z< -2)return {label:'Vòng đầu nhỏ hơn chuẩn',tone:'warn'};
  if(z<=2) return {label:'Vòng đầu bình thường',tone:'ok'};
  return {label:'Vòng đầu lớn hơn chuẩn',tone:'high'};
}
function whoAdvice(ind,z){
  if(z===null)return '';
  if(z>=-2&&z<=2)return 'Chỉ số nằm trong khoảng bình thường của WHO. Cứ duy trì nhịp chăm sóc hiện tại và đo lại theo lịch khám định kỳ.';
  if(ind==='wfa')return z<-2
    ? 'Cân nặng thấp hơn chuẩn WHO. Nên cho bé khám dinh dưỡng để tìm nguyên nhân và điều chỉnh chế độ ăn.'
    : 'Cân nặng cao hơn chuẩn theo tuổi. Chỉ số này cần đọc cùng chiều cao — bác sĩ sẽ dùng cân nặng theo chiều dài để kết luận chính xác.';
  if(ind==='lhfa')return z<-2
    ? 'Chiều cao thấp hơn chuẩn WHO, thường phản ánh dinh dưỡng kéo dài. Nên cho bé khám dinh dưỡng.'
    : 'Bé cao hơn chuẩn. Thường không đáng lo nếu cân nặng và vòng đầu vẫn cân đối.';
  return z<-2
    ? 'Vòng đầu nhỏ hơn chuẩn. Nên cho bé khám nhi khoa để kiểm tra phát triển thần kinh.'
    : 'Vòng đầu lớn hơn chuẩn. Nên cho bé khám nhi khoa để loại trừ các nguyên nhân cần theo dõi.';
}

/* ----- Chuỗi điểm đo của bé ----- */
function whoSeries(db,ind){
  var st=db.settings||{},birth=st.birthDate;
  if(!birth)return [];
  return (db.baby||[]).slice()
    .sort(function(a,b){return (a.date||'').localeCompare(b.date||'')})
    .map(function(x){
      var ageM=whoAgeMonths(birth,x.date),val=whoMeasureValue(ind,x);
      if(ageM===null||val===null)return null;
      return {date:x.date,ageM:ageM,value:val};
    })
    .filter(function(p){return !!p});
}

/* ----- Vẽ biểu đồ ----- */
function whoAutoRange(pts){
  var maxAge=0;
  pts.forEach(function(p){if(p.ageM>maxAge)maxAge=p.ageM});
  var db=load(),birth=(db.settings||{}).birthDate;
  var nowAge=birth?(daysBetween(birth,today())/30.4375):0;
  var top=Math.max(maxAge,nowAge,1);
  if(top<=6)return 6;
  if(top<=12)return 12;
  if(top<=24)return 24;
  if(top<=36)return 36;
  return 60;
}
function whoChartSvg(ind,sex,pts,maxM){
  var W=720,H=384,padL=48,padR=34,padT=28,padB=44;
  var plotW=W-padL-padR,plotH=H-padT-padB;
  var zs=[-3,-2,0,2,3],curves={},m,i,lms;
  zs.forEach(function(z){curves[z]=[]});
  for(m=0;m<=maxM;m++){
    lms=whoLmsAt(ind,sex,m);if(!lms)continue;
    zs.forEach(function(z){curves[z].push({m:m,v:whoValueAtZ(z,lms[0],lms[1],lms[2])})});
  }
  if(!curves[0].length)return '<div class="chartEmpty">Chưa dựng được chuẩn WHO cho chỉ số này.</div>';
  var lo=Math.min.apply(null,curves[-3].map(function(c){return c.v})),
      hi=Math.max.apply(null,curves[3].map(function(c){return c.v}));
  pts.forEach(function(p){if(p.value<lo)lo=p.value;if(p.value>hi)hi=p.value});
  var span=(hi-lo)||1;lo-=span*0.06;hi+=span*0.06;
  function X(mm){return padL+(Math.min(mm,maxM)/maxM)*plotW}
  function Y(v){return padT+plotH-((v-lo)/(hi-lo))*plotH}
  function poly(arr){return arr.map(function(c){return X(c.m).toFixed(1)+','+Y(c.v).toFixed(1)}).join(' ')}

  /* Dải bình thường −2 → +2 và hai dải cảnh báo bên ngoài */
  function band(a,b){
    return '<polygon class="whoBand'+(a===-2?' whoBandCore':'')+'" points="'+poly(curves[a])+' '+
      curves[b].slice().reverse().map(function(c){return X(c.m).toFixed(1)+','+Y(c.v).toFixed(1)}).join(' ')+'"/>';
  }
  var svg='<svg class="whoChart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Biểu đồ '+esc(WHO_IND[ind].label)+' theo chuẩn WHO">';
  svg+=band(-3,-2)+band(2,3)+band(-2,2);

  /* Lưới ngang + nhãn trục dọc */
  var ticks=5;
  for(i=0;i<=ticks;i++){
    var v=lo+(hi-lo)*i/ticks,y=Y(v);
    svg+='<line class="whoGrid" x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'"/>'+
         '<text class="whoTick" x="'+(padL-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end">'+esc(smartNum(v,1))+'</text>';
  }
  /* Trục ngang: mốc tháng tuổi */
  var stepM=maxM<=6?1:(maxM<=12?2:(maxM<=24?3:(maxM<=36?6:12)));
  for(m=0;m<=maxM;m+=stepM){
    svg+='<line class="whoGrid" x1="'+X(m).toFixed(1)+'" y1="'+padT+'" x2="'+X(m).toFixed(1)+'" y2="'+(padT+plotH)+'"/>'+
         '<text class="whoTick" x="'+X(m).toFixed(1)+'" y="'+(padT+plotH+19)+'" text-anchor="middle">'+m+'</text>';
  }
  svg+='<text class="whoAxisName" x="'+(W-padR)+'" y="'+(H-7)+'" text-anchor="end">tháng tuổi</text>';
  svg+='<text class="whoAxisName" x="'+(padL-6)+'" y="'+(padT-13)+'" text-anchor="end">'+esc(WHO_IND[ind].unit)+'</text>';

  /* Đường chuẩn + nhãn SD ở mép phải */
  zs.forEach(function(z){
    var cls=z===0?'whoLineMid':(Math.abs(z)===2?'whoLine2':'whoLine3');
    svg+='<polyline class="whoLine '+cls+'" points="'+poly(curves[z])+'"/>';
    var last=curves[z][curves[z].length-1];
    svg+='<text class="whoSdLabel" x="'+(W-padR+4)+'" y="'+(Y(last.v)+3.5).toFixed(1)+'">'+(z>0?'+'+z:(z===0?'TB':'−'+Math.abs(z)))+'</text>';
  });

  /* Đường của bé */
  if(pts.length){
    if(pts.length>1)svg+='<polyline class="whoBabyLine" points="'+pts.map(function(p){return X(p.ageM).toFixed(1)+','+Y(p.value).toFixed(1)}).join(' ')+'"/>';
    svg+=pts.map(function(p){
      var lmsP=whoLmsAt(ind,sex,p.ageM),z=whoZScore(ind,p.value,lmsP);
      return '<circle class="whoDot" cx="'+X(p.ageM).toFixed(1)+'" cy="'+Y(p.value).toFixed(1)+'" r="5"><title>'+
        esc(fmtDate(p.date))+' · '+esc(whoAgeText(p.ageM))+'\n'+esc(WHO_IND[ind].short)+': '+esc(smartNum(p.value,2))+' '+esc(WHO_IND[ind].unit)+
        (z===null?'':('\nZ-score: '+esc(smartNum(z,2))+' · BPV '+esc(whoPercentileText(z))))+'</title></circle>';
    }).join('');
  }
  return svg+'</svg>';
}

/* ----- Các mảnh giao diện ----- */
function whoSexPicker(sex){
  return '<div class="whoSexPick" role="group" aria-label="Giới tính của bé">'+
    ['b','g'].map(function(s){
      return '<button type="button" class="whoSexBtn'+(sex===s?' active':'')+'" onclick="whoSetSex(\''+s+'\')">'+
        (s==='b'?'👦 Bé trai':'👧 Bé gái')+'</button>';
    }).join('')+'</div>';
}
function whoIndicatorTabs(ind){
  return '<div class="whoTabs" role="tablist">'+Object.keys(WHO_IND).map(function(k){
    return '<button type="button" role="tab" aria-selected="'+(ind===k?'true':'false')+'" class="whoTab'+(ind===k?' active':'')+
      '" onclick="whoSetIndicator(\''+k+'\')">'+WHO_IND[k].icon+' '+esc(WHO_IND[k].short)+'</button>';
  }).join('')+'</div>';
}
function whoRangePicker(current,auto){
  var opts=[{v:0,l:'Tự động'},{v:6,l:'6 tháng'},{v:12,l:'1 tuổi'},{v:24,l:'2 tuổi'},{v:60,l:'5 tuổi'}];
  return '<div class="whoRange">'+opts.map(function(o){
    return '<button type="button" class="whoRangeBtn'+(current===o.v?' active':'')+'" onclick="whoSetRange('+o.v+')">'+esc(o.l)+
      (o.v===0&&current===0?(' ('+auto+'t)'):'')+'</button>';
  }).join('')+'</div>';
}
function whoNotice(icon,title,body,action){
  return '<div class="whoNotice"><span class="whoNoticeIco">'+icon+'</span><div><b>'+esc(title)+'</b><small>'+body+'</small>'+(action||'')+'</div></div>';
}

/* ----- Hàm dựng chính ----- */
function renderWhoGrowth(db){
  var box=byId('whoGrowthBox');if(!box||!whoReady())return;
  db=db||load();
  var st=db.settings||{},ind=whoState.ind,meta=WHO_IND[ind],sex=whoSex(db);

  if(!st.birthDate){
    box.innerHTML=whoNotice('🎂','Cần ngày sinh của bé',
      'Chuẩn WHO đối chiếu theo tháng tuổi, nên app cần biết bé sinh ngày nào.',
      '<div class="btns"><button type="button" onclick="showPage(\'settings\')">Mở Thiết lập hồ sơ</button></div>');
    return;
  }
  if(!sex){
    box.innerHTML=whoNotice('👶','Chọn giới tính của bé',
      'WHO có bảng chuẩn riêng cho bé trai và bé gái. Chọn một lần, app sẽ nhớ.','')+whoSexPicker(sex);
    return;
  }

  var pts=whoSeries(db,ind);
  var auto=whoAutoRange(pts),maxM=whoState.range||auto;
  var head='<div class="whoControls">'+whoIndicatorTabs(ind)+
    '<div class="whoControlRow">'+whoSexPicker(sex)+whoRangePicker(whoState.range,auto)+'</div></div>';

  if(!pts.length){
    box.innerHTML=head+whoNotice('📝','Chưa có số đo '+meta.short.toLowerCase(),
      'Vào <b>Sau sinh → Thêm chỉ số</b> và nhập ô "'+esc(meta.short)+'" để bắt đầu so với chuẩn WHO.',
      '<div class="btns"><button type="button" onclick="showPage(\'baby\')">Nhập chỉ số cho bé</button></div>');
    return;
  }

  /* Điểm đo mới nhất */
  var last=pts[pts.length-1],lms=whoLmsAt(ind,sex,last.ageM),z=whoZScore(ind,last.value,lms);
  var cls=whoClassify(ind,z);
  var over=pts.filter(function(p){return p.ageM>WHO_MAX_MONTH}).length;

  var summary='<div class="whoSummary tone-'+cls.tone+'">'+
    '<div class="whoSumMain"><small>'+esc(meta.short)+' ngày '+esc(fmtDate(last.date))+' · '+esc(whoAgeText(last.ageM))+'</small>'+
      '<b>'+esc(smartNum(last.value,2))+' '+esc(meta.unit)+'</b>'+
      '<span class="whoBadge tone-'+cls.tone+'">'+esc(cls.label)+'</span></div>'+
    '<div class="whoSumGrid">'+
      '<div><small>Z-score</small><b>'+(z===null?'--':esc((z>0?'+':'')+smartNum(z,2))+' SD')+'</b></div>'+
      '<div><small>Bách phân vị</small><b>'+(z===null?'--':esc(whoPercentileText(z))+'%')+'</b></div>'+
      '<div><small>Trung bình WHO</small><b>'+(lms?esc(smartNum(lms[1],2))+' '+esc(meta.unit):'--')+'</b></div>'+
      '<div><small>Khoảng bình thường</small><b>'+(lms?(esc(smartNum(whoValueAtZ(-2,lms[0],lms[1],lms[2]),1))+'–'+esc(smartNum(whoValueAtZ(2,lms[0],lms[1],lms[2]),1))):'--')+'</b></div>'+
    '</div>'+
    (z===null?'':'<p class="whoAdvice">'+esc(whoAdvice(ind,z))+'</p>')+'</div>';

  var legend='<div class="whoLegend">'+
    '<span><i class="lgBandCore"></i> Bình thường (−2 → +2 SD)</span>'+
    '<span><i class="lgBand"></i> Cần theo dõi (±2 → ±3 SD)</span>'+
    '<span><i class="lgMid"></i> Trung bình WHO</span>'+
    '<span><i class="lgDot"></i> Số đo của bé</span></div>';

  var rows=pts.slice().reverse().map(function(p){
    var l=whoLmsAt(ind,sex,p.ageM),pz=whoZScore(ind,p.value,l),pc=whoClassify(ind,pz);
    return '<tr><td>'+esc(fmtDate(p.date))+'</td><td>'+esc(whoAgeText(p.ageM))+'</td>'+
      '<td>'+esc(smartNum(p.value,2))+'</td>'+
      '<td>'+(pz===null?'--':esc((pz>0?'+':'')+smartNum(pz,2)))+'</td>'+
      '<td>'+(pz===null?'--':esc(whoPercentileText(pz)))+'</td>'+
      '<td><span class="whoBadge sm tone-'+pc.tone+'">'+esc(pc.label)+'</span></td></tr>';
  }).join('');
  var table='<details class="whoTableWrap"><summary>Bảng chi tiết '+pts.length+' lần đo</summary>'+
    '<div class="tableWrap"><table class="statTable"><thead><tr><th>Ngày</th><th>Tuổi</th><th>'+esc(meta.short)+' ('+esc(meta.unit)+')</th>'+
    '<th>Z-score</th><th>BPV %</th><th>Đánh giá</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';

  box.innerHTML=head+summary+
    '<div class="whoChartWrap">'+whoChartSvg(ind,sex,pts,maxM)+'</div>'+legend+table+
    (over?'<p class="whoFoot">⚠️ Có '+over+' lần đo sau 5 tuổi — chuẩn WHO 2006 chỉ áp dụng đến 60 tháng, các điểm đó được tính theo mốc 60 tháng.</p>':'')+
    '<p class="whoFoot">Nguồn: WHO Child Growth Standards 2006 (bảng LMS 0–60 tháng). Kết quả chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ.</p>';
}

/* ==================== V14.0.0 · SỔ SỨC KHỎE 2.0 (Health Book 2.0) ====================
   Hồ sơ sức khỏe độc lập cho từng thành viên gia đình.
   Dữ liệu nằm trong db.hb → tự động đi kèm sao lưu/đồng bộ hiện có.
   Tái sử dụng bộ chuẩn WHO LMS (WHO_LMS/whoZScore/whoChartSvg) đã có từ V13.10.0.
==================================================================================== */
var HB2_RELS=['Con','Mẹ','Ba','Ông','Bà','Khác'];
var HB2_AVATARS=['👶','🧒','👦','👧','👩','👨','👵','👴','🧑'];
var HB2_RELAVA={'Con':'👶','Mẹ':'👩','Ba':'👨','Ông':'👴','Bà':'👵','Khác':'🧑'};
/* Tra avatar theo quan hệ — an toàn kể cả khi normalize() chạy trước lúc biến được gán */
function hb2RelAva(rel){var M={'Con':'👶','Mẹ':'👩','Ba':'👨','Ông':'👴','Bà':'👵','Khác':'🧑'};return M[rel]||'🧑'}
var HB2_VAXST=['Đã tiêm','Sắp tới','Quá hạn','Chưa lên lịch'];
var HB2_LABTYPES=['Máu','Nước tiểu','Xquang','MRI','CT','Siêu âm','Khác'];
var HB2_STATUS=[{txt:'Khỏe mạnh',tone:'ok'},{txt:'Đang điều trị',tone:'warn'},{txt:'Có thuốc đang uống',tone:'med'}];
var hb2State={view:'home',ind:'wfa',tlFilter:'all',rep:'thang'};

function hb2Uid(){return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function hb2Arr(v){return Array.isArray(v)?v:[]}
function hb2Split(s){return String(s||'').split(/[,;\n]/).map(function(x){return x.trim()}).filter(Boolean)}
function hb2Num(v){var n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:null}
function hb2Money(n){try{return Number(n||0).toLocaleString('vi-VN')+'đ'}catch(e){return (n||0)+'đ'}}

/* ---------- Khởi tạo & migration (gọi từ normalize) ---------- */
function hb2EmptyMember(rel){
  return {id:hb2Uid(),name:'',rel:rel||'Khác',avatar:hb2RelAva(rel||'Khác'),dob:'',gender:'',blood:'',
    height:'',weight:'',email:'',phone:'',linkBaby:false,status:{txt:'Khỏe mạnh',tone:'ok'},
    medical:{bhxh:'',bhyt:'',bhytExp:'',bhytPlace:'',hospital:'',doctor:'',emergency:''},
    history:{diseases:[],chronic:[],allergy:{drug:[],food:[],seafood:[],pollen:[],other:[]},surgery:[],family:[]},
    other:{notes:'',files:[]},meas:[],vaccines:[],visits:[],meds:[],labs:[],
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function hb2MemberFromHealthBook(x){
  var relMap={'Con':'Con','Mẹ':'Mẹ','Bố':'Ba','Ba':'Ba','Ông':'Ông','Bà':'Bà'};
  var rel=relMap[x.person]||'Khác';
  var m=hb2EmptyMember(rel);
  m.name=x.fullName||x.person||'Thành viên';
  m.dob=x.dob||'';m.blood=x.blood||'';m.height=x.height||'';m.weight=x.weight||'';
  m.gender=(rel==='Mẹ'||rel==='Bà')?'Nữ':((rel==='Ba'||rel==='Ông')?'Nam':'');
  if(x.allergy)m.history.allergy.other=hb2Split(x.allergy);
  if(x.history)m.history.diseases=hb2Split(x.history);
  if(x.medicine)m.meds.push({name:x.medicine,dose:'',from:x.date||'',to:'',active:true,remind:false,takenDate:''});
  m.vaccines=hb2Arr(x.vaccines).map(function(v){
    return {name:v.vaccine||'',dose:v.dose||'',status:'Đã tiêm',date:'',place:'',doctor:'',reaction:'',purpose:v.purpose||'',photo:''};
  }).filter(function(v){return v.name});
  if(x.doctor)m.medical.doctor=x.doctor;
  if(x.insurance)m.medical.bhyt=x.insurance;
  if(x.note)m.other.notes=x.note;
  if(x.date&&(x.height||x.weight))m.meas.push({date:x.date,weight:x.weight||'',height:x.height||'',head:''});
  m.migratedFrom='healthBook';
  return m;
}
function hb2Normalize(db){
  db.hb=(db.hb&&typeof db.hb==='object'&&!Array.isArray(db.hb))?db.hb:{};
  db.hb.members=hb2Arr(db.hb.members);
  /* Lần đầu: chuyển hồ sơ từ Sổ sức khỏe cũ sang, giữ nguyên dữ liệu cũ */
  if(!db.hb.migrated){
    hb2Arr(db.healthBook).forEach(function(x){db.hb.members.push(hb2MemberFromHealthBook(x||{}))});
    db.hb.migrated=true;
  }
  /* Luôn bảo đảm có hồ sơ của Bé, nối với dữ liệu sau sinh + ngày sinh trong Thiết lập */
  var st=db.settings||{};
  var kid=null,i;
  for(i=0;i<db.hb.members.length;i++){if(db.hb.members[i].rel==='Con'){kid=db.hb.members[i];break}}
  if(!kid){
    kid=hb2EmptyMember('Con');
    kid.name=st.babyName||'Bé';
    db.hb.members.unshift(kid);
  }
  if(!kid.linkBaby)kid.linkBaby=true;
  if(!kid.dob&&st.birthDate)kid.dob=st.birthDate;
  if(!kid.gender&&st.babySex)kid.gender=(st.babySex==='b'?'Nam':'Nữ');
  if(!kid.name)kid.name=st.babyName||'Bé';
  /* Chuẩn hoá từng thành viên để không vỡ khi thiếu trường */
  db.hb.members=db.hb.members.map(function(m){
    var base=hb2EmptyMember(m&&m.rel);m=m||{};
    var out={};for(var k in base)out[k]=base[k];for(var k2 in m)out[k2]=m[k2];
    out.id=m.id||base.id;
    out.status=(m.status&&m.status.txt)?m.status:base.status;
    out.medical=Object.assign({},base.medical,m.medical||{});
    var h=m.history||{};
    out.history={diseases:hb2Arr(h.diseases),chronic:hb2Arr(h.chronic),
      allergy:Object.assign({drug:[],food:[],seafood:[],pollen:[],other:[]},h.allergy||{}),
      surgery:hb2Arr(h.surgery),family:hb2Arr(h.family)};
    out.other=Object.assign({notes:'',files:[]},m.other||{});
    out.other.files=hb2Arr(out.other.files);
    ['meas','vaccines','visits','meds','labs'].forEach(function(k3){out[k3]=hb2Arr(m[k3])});
    out.avatar=m.avatar||hb2RelAva(out.rel);
    return out;
  });
  var ids=db.hb.members.map(function(m){return m.id});
  if(ids.indexOf(db.hb.activeId)<0)db.hb.activeId=ids[0]||'';
  return db;
}
function hb2Members(db){return hb2Arr((db.hb||{}).members)}
function hb2Active(db){
  var arr=hb2Members(db),id=(db.hb||{}).activeId;
  for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];
  return arr[0]||null;
}
function hb2Find(db,id){var a=hb2Members(db);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function hb2Commit(db,msg){
  var m=hb2Active(db);if(m)m.updatedAt=new Date().toISOString();
  save(db);
  if(msg)showToast(msg,'success');
  hb2Render();
}
function hb2SetActive(id){var db=load();db.hb.activeId=id;hb2State.view='home';save(db);hb2Render()}

/* ---------- Tuổi & WHO ---------- */
function hb2Dob(db,m){return m.dob||((m.linkBaby&&(db.settings||{}).birthDate)||'')}
function hb2AgeText(db,m){
  var dob=hb2Dob(db,m);if(!dob)return 'Chưa có ngày sinh';
  var d=daysBetween(dob,today());if(d<0)return 'Chưa sinh';
  var mo=Math.floor(d/30.4375);
  if(mo<24)return mo+' tháng tuổi';
  var y=Math.floor(mo/12),r=mo%12;
  return y+' tuổi'+(r?' '+r+' tháng':'');
}
function hb2IsChild(m){return m&&m.rel==='Con'}
function hb2Sex(db,m){
  if(m.gender==='Nam')return 'b';
  if(m.gender==='Nữ')return 'g';
  return whoSex(db)||'g';
}
function hb2IndField(ind){return ind==='wfa'?'weight':(ind==='lhfa'?'height':'head')}
function hb2FixUnit(ind,v){
  if(v===null||!(v>0))return null;
  if(ind==='wfa'&&v>100)return v/1000;
  if(ind!=='wfa'&&v<10)return v*100;
  return v;
}
function hb2WhoPoints(db,m,ind){
  var dob=hb2Dob(db,m);if(!dob)return [];
  var f=hb2IndField(ind),rows=[];
  hb2Arr(m.meas).forEach(function(x){if(x&&x.date)rows.push({date:x.date,v:hb2Num(x[f])})});
  if(m.linkBaby){
    hb2Arr(db.baby).forEach(function(x){
      if(!x||!x.date)return;
      var raw=(ind==='lhfa')?x.length:((ind==='hcfa')?x.head:x.weight);
      rows.push({date:x.date,v:hb2Num(raw)});
    });
  }
  var seen={},out=[];
  rows.sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});
  rows.forEach(function(r){
    var v=hb2FixUnit(ind,r.v);if(v===null)return;
    var ageM=whoAgeMonths(dob,r.date);if(ageM===null)return;
    seen[r.date]={date:r.date,ageM:ageM,value:v};
  });
  Object.keys(seen).sort().forEach(function(k){out.push(seen[k])});
  return out;
}
function hb2WhoEval(db,m,ind){
  var pts=hb2WhoPoints(db,m,ind);if(!pts.length)return null;
  var last=pts[pts.length-1],sex=hb2Sex(db,m);
  var lms=whoLmsAt(ind,sex,last.ageM);if(!lms)return null;
  var z=whoZScore(ind,last.value,lms);if(z===null)return null;
  return {pt:last,z:z,pct:whoPercentileText(z),cls:whoClassify(ind,z),advice:whoAdvice(ind,z)};
}

/* ---------- Tiện ích hiển thị ---------- */
function hb2Tone(t){return t==='ok'?'ok':(t==='warn'?'warn':(t==='danger'?'danger':(t==='med'?'med':'info')))}
function hb2Pill(txt,tone){return '<span class="hb2Pill hb2-'+hb2Tone(tone)+'">'+esc(txt)+'</span>'}
function hb2KV(k,v){return '<div class="hb2KV"><span>'+esc(k)+'</span><b>'+(v?esc(v):'--')+'</b></div>'}
function hb2Tags(arr,tone){
  arr=hb2Arr(arr);
  if(!arr.length)return '<span class="hb2Muted">— Chưa ghi nhận —</span>';
  return arr.map(function(t){return '<span class="hb2Tag hb2-'+hb2Tone(tone)+'">'+esc(t)+'</span>'}).join('');
}
function hb2VaxTone(st){return st==='Đã tiêm'?'ok':(st==='Quá hạn'?'danger':(st==='Sắp tới'?'info':'na'))}
function hb2CountVax(m){
  var o={};HB2_VAXST.forEach(function(s){o[s]=hb2Arr(m.vaccines).filter(function(v){return v.status===s}).length});return o;
}
function hb2ActiveMeds(m){return hb2Arr(m.meds).filter(function(x){return x.active!==false})}
function hb2SortedVisits(m){return hb2Arr(m.visits).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')})}

/* ---------- Render khung ---------- */
function hb2Render(){
  var root=byId('hb2Root');if(!root)return;
  var db=load(),m=hb2Active(db);
  if(!m){root.innerHTML='<div class="card"><p class="notice">Chưa có hồ sơ nào.</p></div>';return}
  if(hb2State.view==='growth'&&!hb2IsChild(m))hb2State.view='home';
  var views={home:hb2ViewHome,profile:hb2ViewProfile,growth:hb2ViewGrowth,timeline:hb2ViewTimeline,
    report:hb2ViewReport,vaccine:hb2ViewVaccine,visits:hb2ViewVisits,meds:hb2ViewMeds,labs:hb2ViewLabs,future:hb2ViewFuture};
  var fn=views[hb2State.view]||hb2ViewHome;
  root.innerHTML=hb2ChipsHtml(db)+hb2TabsHtml(m)+'<div class="hb2Body">'+fn(db,m)+'</div>';
  if(hb2State.view==='growth')hb2DrawChart(db,m);
}
function hb2ChipsHtml(db){
  var arr=hb2Members(db),act=(db.hb||{}).activeId;
  return '<div class="card hb2Head"><div class="hb2HeadTop">'+
    '<h2>🩺 Sổ sức khỏe <span class="hb2Ver">2.0</span></h2>'+
    '<button class="hb2QuickBtn" onclick="hb2OpenQuickAdd()">＋ Thêm nhanh</button>'+
    '</div><div class="hb2Chips">'+
    arr.map(function(m){
      return '<button class="hb2Chip'+(m.id===act?' on':'')+'" onclick="hb2ChipClick(\''+m.id+'\')">'+
      '<span class="hb2Ava">'+esc(m.avatar||'🧑')+'</span><span class="hb2ChipName">'+esc(m.name||m.rel)+'</span></button>';
    }).join('')+
    '<button class="hb2Chip add" onclick="hb2OpenAddMember()"><span class="hb2Ava">＋</span><span class="hb2ChipName">Thêm</span></button>'+
    '</div></div>';
}
function hb2ChipClick(id){
  var db=load();
  if((db.hb||{}).activeId===id){hb2ShowAvatar(id);return}
  hb2SetActive(id);
}
function hb2TabsHtml(m){
  var tabs=[['home','🏠','Tổng quan'],['profile','🗂️','Hồ sơ']];
  if(hb2IsChild(m))tabs.push(['growth','📈','Tăng trưởng']);
  tabs.push(['timeline','🗓️','Timeline'],['report','📊','Báo cáo']);
  return '<div class="hb2Tabs">'+tabs.map(function(t){
    return '<button class="hb2Tab'+(hb2State.view===t[0]?' on':'')+'" onclick="hb2Go(\''+t[0]+'\')"><i>'+t[1]+'</i>'+t[2]+'</button>';
  }).join('')+'</div>';
}
function hb2Go(v){hb2State.view=v;hb2Render();window.scrollTo(0,0)}

/* ---------- Tổng quan ---------- */
function hb2ViewHome(db,m){
  var child=hb2IsChild(m),vc=hb2CountVax(m),meds=hb2ActiveMeds(m),visits=hb2SortedVisits(m);
  var wEval=child?hb2WhoEval(db,m,'wfa'):null,hEval=child?hb2WhoEval(db,m,'lhfa'):null,cEval=child?hb2WhoEval(db,m,'hcfa'):null;
  var wTxt=wEval?smartNum(wEval.pt.value,2)+' kg':(m.weight?esc(m.weight):'--');
  var hTxt=hEval?smartNum(hEval.pt.value,1)+' cm':(m.height?esc(m.height):'--');
  var bmi='--',bmiSub='';
  if(!child){
    var w=hb2Num(m.weight),h=hb2Num(m.height);
    if(w&&h){var b=w/Math.pow(h/100,2);bmi=smartNum(b,1);bmiSub=b<18.5?'Gầy':(b<25?'Bình thường':(b<30?'Thừa cân':'Béo phì'))}
  }
  var next=hb2Arr(m.vaccines).filter(function(v){return v.status==='Quá hạn'||v.status==='Sắp tới'})
    .sort(function(a,b){return (a.date||'9999').localeCompare(b.date||'9999')})[0];
  var navs=[];
  if(child)navs.push(['📈','Biểu đồ WHO','Cân nặng · Chiều cao · Vòng đầu','growth']);
  navs.push(['💉','Tiêm chủng',vc['Đã tiêm']+' đã tiêm'+(vc['Quá hạn']?' · '+vc['Quá hạn']+' quá hạn':''),'vaccine'],
    ['🩺','Khám bệnh',visits.length+' lần khám','visits'],
    ['💊','Thuốc',meds.length+' loại đang dùng','meds'],
    ['🧪','Xét nghiệm',hb2Arr(m.labs).length+' kết quả','labs'],
    ['🗂️','Hồ sơ y tế','BHYT · Tiền sử · Dị ứng','profile'],
    ['🚀','Mở rộng','Huyết áp · SpO2 · AI…','future']);
  return '<div class="card hb2Status hb2-'+hb2Tone(m.status.tone)+'">'+
      '<div class="hb2StatusIco">'+(m.status.tone==='ok'?'✔':(m.status.tone==='med'?'💊':'🩹'))+'</div>'+
      '<div class="hb2StatusBody"><small>Tình trạng sức khỏe · '+esc(m.name||m.rel)+'</small><b>'+esc(m.status.txt)+'</b></div>'+
      '<button class="ghost" onclick="hb2OpenStatus()">Đổi</button></div>'+
    '<div class="hb2Grid">'+
      hb2Stat('⚖️','Cân nặng',wTxt,wEval?wEval.cls.label:'')+
      hb2Stat('📏','Chiều cao',hTxt,hEval?hEval.cls.label:'')+
      (child?hb2Stat('🧢','Vòng đầu',cEval?smartNum(cEval.pt.value,1)+' cm':'--',cEval?cEval.cls.label:'')
            :hb2Stat('📐','BMI',bmi,bmiSub))+
      hb2Stat('🩸','Nhóm máu',m.blood||'--',(m.gender||'')+(m.gender?' · ':'')+hb2AgeText(db,m))+
      hb2Stat('💉','Tiêm chủng',vc['Đã tiêm']+' mũi',vc['Quá hạn']?'⚠ '+vc['Quá hạn']+' quá hạn':(vc['Sắp tới']?vc['Sắp tới']+' mũi sắp tới':'Đủ lịch'))+
      hb2Stat('🩺','Khám gần nhất',visits.length?fmtDate(visits[0].date):'--',visits.length?(visits[0].diagnosis||''):'Chưa có')+
    '</div>'+
    '<div class="card hb2MedSum"><div><small>💊 Thuốc đang dùng</small><b>'+meds.length+' loại</b>'+
      '<p>'+(meds.length?esc(meds.map(function(x){return x.name}).join(' · ')):'Không có')+'</p></div></div>'+
    (next?'<div class="card hb2Next hb2-'+(next.status==='Quá hạn'?'danger':'info')+'">'+
      '<b>'+(next.status==='Quá hạn'?'⚠ Quá hạn: ':'📌 Sắp tới: ')+esc(next.name)+(next.dose?' · '+esc(next.dose):'')+'</b>'+
      '<small>'+(next.date?fmtDate(next.date):'Chưa đặt lịch')+(next.place?' · '+esc(next.place):'')+'</small></div>':'')+
    '<div class="hb2SecTitle">Chức năng</div><div class="hb2Nav">'+
      navs.map(function(n){return '<button class="hb2NavCard" onclick="hb2Go(\''+n[3]+'\')"><i>'+n[0]+'</i><b>'+n[1]+'</b><small>'+esc(n[2])+'</small></button>'}).join('')+
    '</div>'+
    '<p class="notice hb2Note">Mỗi thành viên có hồ sơ độc lập (ID <code>'+esc(m.id)+'</code>), không dùng chung dữ liệu.'+
    (m.linkBaby?' Hồ sơ của bé tự lấy thêm chỉ số từ mục <b>Sau sinh</b>.':'')+'</p>';
}
function hb2Stat(ico,lab,val,sub){
  return '<div class="hb2Stat"><small>'+ico+' '+esc(lab)+'</small><b>'+val+'</b>'+(sub?'<i>'+esc(sub)+'</i>':'')+'</div>';
}

/* ---------- Hồ sơ ---------- */
function hb2ViewProfile(db,m){
  var md=m.medical,h=m.history,al=h.allergy||{};
  return '<div class="card"><div class="hb2CardHead"><b>👤 Thông tin cơ bản</b>'+
      '<button class="ghost" onclick="hb2OpenEditBasic()">Sửa</button></div>'+
      hb2KV('Họ tên',m.name)+hb2KV('Quan hệ',m.rel)+
      hb2KV('Ngày sinh',(hb2Dob(db,m)?fmtDate(hb2Dob(db,m))+' · '+hb2AgeText(db,m):''))+
      hb2KV('Giới tính',m.gender)+hb2KV('Nhóm máu',m.blood)+
      hb2KV('Chiều cao',m.height?m.height+' cm':'')+hb2KV('Cân nặng',m.weight?m.weight+' kg':'')+
      hb2KV('Email',m.email)+hb2KV('SĐT',m.phone)+'</div>'+
    '<div class="card"><div class="hb2CardHead"><b>🪪 Thông tin y tế</b>'+
      '<button class="ghost" onclick="hb2OpenEditMedical()">Sửa</button></div>'+
      hb2KV('Mã BHXH',md.bhxh)+hb2KV('Mã BHYT',md.bhyt)+
      hb2KV('Ngày hết hạn BHYT',md.bhytExp?fmtDate(md.bhytExp):'')+
      hb2KV('Nơi đăng ký khám BHYT',md.bhytPlace)+hb2KV('Bệnh viện thường khám',md.hospital)+
      hb2KV('Bác sĩ theo dõi',md.doctor)+hb2KV('Liên hệ khẩn cấp',md.emergency)+'</div>'+
    '<div class="card"><div class="hb2CardHead"><b>🩹 Tiền sử</b>'+
      '<button class="ghost" onclick="hb2OpenEditHistory()">Sửa</button></div>'+
      '<div class="hb2Sub">Tiền sử bệnh</div>'+hb2Tags(h.diseases,'warn')+
      '<div class="hb2Sub">Bệnh nền</div>'+hb2Tags(h.chronic,'danger')+
      '<div class="hb2Sub">Dị ứng</div>'+
      '<div class="hb2AlRow"><span>Thuốc</span>'+hb2Tags(al.drug,'warn')+'</div>'+
      '<div class="hb2AlRow"><span>Thực phẩm</span>'+hb2Tags(al.food,'warn')+'</div>'+
      '<div class="hb2AlRow"><span>Hải sản</span>'+hb2Tags(al.seafood,'warn')+'</div>'+
      '<div class="hb2AlRow"><span>Phấn hoa</span>'+hb2Tags(al.pollen,'warn')+'</div>'+
      '<div class="hb2AlRow"><span>Khác</span>'+hb2Tags(al.other,'warn')+'</div>'+
      '<div class="hb2Sub">Tiền sử phẫu thuật</div>'+hb2Tags(h.surgery,'med')+
      '<div class="hb2Sub">Tiền sử gia đình</div>'+hb2Tags(h.family,'info')+'</div>'+
    '<div class="card"><div class="hb2CardHead"><b>📝 Thông tin khác</b>'+
      '<button class="ghost" onclick="hb2OpenNote()">Sửa</button></div>'+
      '<p class="hb2Notes">'+(m.other.notes?esc(m.other.notes):'<span class="hb2Muted">Chưa có ghi chú sức khỏe</span>')+'</p>'+
      '<div class="hb2Sub">Tệp đính kèm ('+hb2Arr(m.other.files).length+')</div>'+
      (hb2Arr(m.other.files).map(function(f,i){
        return '<div class="hb2File"><span>'+esc(f.icon||'📄')+'</span><div><b>'+esc(f.name)+'</b><small>'+esc(f.kind||'Tệp')+'</small></div>'+
        '<button class="danger" onclick="hb2DelFile('+i+')">Xóa</button></div>';
      }).join('')||'<p class="notice">Chưa có tệp. Có thể lưu: ảnh toa thuốc, ảnh BHYT, ảnh BHXH, PDF khám bệnh.</p>')+
      '<div class="btns"><button class="secondary" onclick="hb2OpenAddFile()">＋ Thêm tệp đính kèm</button></div></div>'+
    '<div class="btns"><button onclick="hb2ExportProfile()">⬇︎ Xuất hồ sơ sức khỏe (in / PDF)</button>'+
      (m.rel!=='Con'||hb2Members(db).length>1?'<button class="danger" onclick="hb2DelMember()">Xóa hồ sơ này</button>':'')+'</div>';
}

/* ---------- Tăng trưởng WHO ---------- */
function hb2ViewGrowth(db,m){
  var inds=['wfa','lhfa','hcfa'];
  return '<div class="card"><div class="hb2CardHead"><b>📈 Biểu đồ tăng trưởng WHO</b></div>'+
    '<p class="sub">Chuẩn WHO theo giới tính và tháng tuổi của '+esc(m.name||'bé')+'.</p>'+
    '<div class="hb2Seg">'+inds.map(function(k){
      return '<button class="'+(hb2State.ind===k?'on':'')+'" onclick="hb2SetInd(\''+k+'\')">'+WHO_IND[k].icon+' '+WHO_IND[k].short+'</button>';
    }).join('')+'</div>'+
    '<div id="hb2ChartBox" class="hb2ChartBox"></div></div>'+
    '<div id="hb2ChartNote"></div>'+
    '<div class="card"><div class="hb2CardHead"><b>📋 Lịch sử đo</b>'+
      '<button class="secondary" onclick="hb2QuickMeas()">＋ Đo chỉ số</button></div>'+
      '<div id="hb2MeasList"></div></div>';
}
function hb2SetInd(k){hb2State.ind=k;hb2Render()}
function hb2DrawChart(db,m){
  var box=byId('hb2ChartBox');if(!box)return;
  var ind=hb2State.ind,dob=hb2Dob(db,m);
  if(!dob){box.innerHTML='<p class="notice">Chưa có ngày sinh. Vào Hồ sơ → Sửa để nhập ngày sinh cho '+esc(m.name||'bé')+'.</p>';
    byId('hb2ChartNote').innerHTML='';byId('hb2MeasList').innerHTML='';return}
  var pts=hb2WhoPoints(db,m,ind),sex=hb2Sex(db,m);
  var ageM=whoAgeMonths(dob,today())||0;
  var maxM=Math.min(WHO_MAX_MONTH,Math.max(6,Math.ceil(ageM)+3));
  box.innerHTML=pts.length?whoChartSvg(ind,sex,pts,maxM)
    :'<p class="notice">Chưa có số đo '+esc(WHO_IND[ind].short.toLowerCase())+'. Bấm “＋ Đo chỉ số” để thêm.</p>';
  var ev=hb2WhoEval(db,m,ind),note=byId('hb2ChartNote');
  if(ev&&note){
    note.innerHTML='<div class="card hb2Eval hb2-'+hb2Tone(ev.cls.tone)+'">'+
      '<b>'+(ev.cls.tone==='ok'?'✔ ':'⚠ ')+esc(ev.cls.label)+'</b>'+
      '<small>'+esc(WHO_IND[ind].short)+' mới nhất: <b>'+smartNum(ev.pt.value,2)+' '+WHO_IND[ind].unit+'</b>'+
      ' lúc '+whoAgeText(ev.pt.ageM)+' · Z-score '+smartNum(ev.z,2)+' · Bách phân vị '+ev.pct+'</small>'+
      '<p>'+esc(ev.advice)+'</p></div>';
  } else if(note){note.innerHTML=''}
  var list=byId('hb2MeasList');
  if(list){
    list.innerHTML=pts.length?pts.slice().reverse().map(function(p){
      var lms=whoLmsAt(ind,sex,p.ageM),z=lms?whoZScore(ind,p.value,lms):null,c=z===null?null:whoClassify(ind,z);
      return '<div class="item"><b>'+smartNum(p.value,2)+' '+WHO_IND[ind].unit+'</b>'+
        '<small>'+fmtDate(p.date)+' · '+whoAgeText(p.ageM)+(z===null?'':' · Z '+smartNum(z,2)+' · BPV '+whoPercentileText(z))+'</small>'+
        (c?'<p>'+hb2Pill(c.label,c.tone)+'</p>':'')+'</div>';
    }).join(''):'<p class="notice">Chưa có số đo nào.</p>';
  }
}

/* ---------- Tiêm chủng ---------- */
function hb2ViewVaccine(db,m){
  var html='<div class="card"><div class="hb2CardHead"><b>💉 Tiêm chủng</b>'+
    '<button class="secondary" onclick="hb2OpenVax()">＋ Thêm mũi</button></div>'+
    '<div class="btns"><button class="ghost" onclick="hb2Go(\'home\')">‹ Tổng quan</button></div></div>';
  var any=false;
  HB2_VAXST.forEach(function(st){
    var l=hb2Arr(m.vaccines).map(function(v,i){v._i=i;return v}).filter(function(v){return v.status===st});
    if(!l.length)return;any=true;
    html+='<div class="hb2SecTitle">'+st+' · '+l.length+'</div>';
    html+=l.map(function(v){
      return '<div class="item"><b>'+esc(v.name)+(v.dose?' · '+esc(v.dose):'')+'</b>'+
      '<small>'+(v.date?fmtDate(v.date):'Chưa có ngày')+(v.place?' · '+esc(v.place):'')+(v.doctor?' · '+esc(v.doctor):'')+'</small>'+
      '<p>'+hb2Pill(st,hb2VaxTone(st))+(v.reaction?' <span class="hb2Muted">Phản ứng: '+esc(v.reaction)+'</span>':'')+
      (v.photo?' <span class="hb2Muted">📷 '+esc(v.photo)+'</span>':'')+'</p>'+
      '<div class="itemActions"><button class="ghost" onclick="hb2OpenVax('+v._i+')">Sửa</button>'+
      '<button class="danger" onclick="hb2DelRow(\'vaccines\','+v._i+')">Xóa</button></div></div>';
    }).join('');
  });
  if(!any)html+='<p class="notice">Chưa có mũi tiêm nào.</p>';
  return html;
}
/* ---------- Khám bệnh ---------- */
function hb2ViewVisits(db,m){
  var arr=hb2Arr(m.visits).map(function(v,i){v._i=i;return v}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'')});
  return '<div class="card"><div class="hb2CardHead"><b>🩺 Lịch sử khám</b>'+
    '<button class="secondary" onclick="hb2OpenVisit()">＋ Thêm lần khám</button></div>'+
    '<div class="btns"><button class="ghost" onclick="hb2Go(\'home\')">‹ Tổng quan</button></div></div>'+
    (arr.length?arr.map(function(v){
      return '<div class="item"><b>'+esc(v.diagnosis||'Khám bệnh')+'</b>'+
      '<small>'+fmtDate(v.date)+(v.hospital?' · '+esc(v.hospital):'')+(v.doctor?' · '+esc(v.doctor):'')+'</small>'+
      (v.symptom?'<p><b>Triệu chứng:</b> '+esc(v.symptom)+'</p>':'')+
      (v.treatment?'<p><b>Điều trị:</b> '+esc(v.treatment)+'</p>':'')+
      (v.meds?'<p><b>Thuốc:</b> '+esc(v.meds)+'</p>':'')+
      (v.note?'<p><b>Ghi chú:</b> '+esc(v.note)+'</p>':'')+
      '<p>'+(v.cost?hb2Pill(hb2Money(v.cost),'info'):'')+' '+hb2Pill(v.insurance?'BHYT chi trả':'Tự túc',v.insurance?'ok':'na')+'</p>'+
      '<div class="itemActions"><button class="ghost" onclick="hb2OpenVisit('+v._i+')">Sửa</button>'+
      '<button class="danger" onclick="hb2DelRow(\'visits\','+v._i+')">Xóa</button></div></div>';
    }).join(''):'<p class="notice">Chưa có lần khám nào.</p>');
}
/* ---------- Thuốc ---------- */
function hb2ViewMeds(db,m){
  var arr=hb2Arr(m.meds).map(function(x,i){x._i=i;return x});
  var act=arr.filter(function(x){return x.active!==false}),off=arr.filter(function(x){return x.active===false});
  function row(x){
    var takenToday=(x.takenDate===today());
    return '<div class="item"><b>'+esc(x.name)+'</b><small>'+esc(x.dose||'--')+' · từ '+fmtDate(x.from)+
      (x.to?' đến '+fmtDate(x.to):'')+'</small>'+
      '<p>'+hb2Pill(x.active===false?'Đã ngừng':'Đang uống',x.active===false?'na':'med')+
      (x.remind?' '+hb2Pill('🔔 Nhắc uống','info'):'')+'</p>'+
      (x.active!==false?'<div class="itemActions">'+
        '<button class="'+(takenToday?'ok':'secondary')+'" onclick="hb2ToggleTaken('+x._i+')">'+(takenToday?'✓ Đã uống hôm nay':'Đánh dấu đã uống')+'</button>'+
        '<button class="ghost" onclick="hb2ToggleRemind('+x._i+')">'+(x.remind?'Tắt nhắc':'Bật nhắc')+'</button>'+
        '<button class="ghost" onclick="hb2StopMed('+x._i+')">Ngừng thuốc</button>'+
        '<button class="danger" onclick="hb2DelRow(\'meds\','+x._i+')">Xóa</button></div>'
      :'<div class="itemActions"><button class="danger" onclick="hb2DelRow(\'meds\','+x._i+')">Xóa</button></div>')+
      '</div>';
  }
  return '<div class="card"><div class="hb2CardHead"><b>💊 Thuốc</b>'+
    '<button class="secondary" onclick="hb2OpenMed()">＋ Thêm thuốc</button></div>'+
    '<div class="btns"><button class="ghost" onclick="hb2Go(\'home\')">‹ Tổng quan</button></div></div>'+
    (act.length?'<div class="hb2SecTitle">Đang dùng · '+act.length+'</div>'+act.map(row).join(''):'')+
    (off.length?'<div class="hb2SecTitle">Đã ngừng · '+off.length+'</div>'+off.map(row).join(''):'')+
    (arr.length?'':'<p class="notice">Chưa có thuốc nào.</p>');
}
/* ---------- Xét nghiệm ---------- */
function hb2ViewLabs(db,m){
  var arr=hb2Arr(m.labs).map(function(x,i){x._i=i;return x});
  var html='<div class="card"><div class="hb2CardHead"><b>🧪 Xét nghiệm</b>'+
    '<button class="secondary" onclick="hb2OpenLab()">＋ Thêm kết quả</button></div>'+
    '<div class="btns"><button class="ghost" onclick="hb2Go(\'home\')">‹ Tổng quan</button></div></div>';
  var any=false;
  HB2_LABTYPES.forEach(function(t){
    var l=arr.filter(function(x){return (x.type||'Khác')===t});if(!l.length)return;any=true;
    html+='<div class="hb2SecTitle">'+t+' · '+l.length+'</div>'+l.map(function(x){
      return '<div class="item"><b>'+esc(x.name)+'</b><small>'+fmtDate(x.date)+'</small>'+
      (x.result?'<p>'+esc(x.result)+'</p>':'')+
      (hb2Arr(x.indices).length?'<p class="hb2Muted">'+x.indices.map(function(k){return esc(k[0])+': '+esc(k[1])}).join(' · ')+'</p>':'')+
      '<p>'+hb2Pill(x.level==='warn'?'Cần lưu ý':'Bình thường',x.level==='warn'?'warn':'ok')+'</p>'+
      '<div class="itemActions"><button class="ghost" onclick="hb2OpenLab('+x._i+')">Sửa</button>'+
      '<button class="danger" onclick="hb2DelRow(\'labs\','+x._i+')">Xóa</button></div></div>';
    }).join('');
  });
  if(!any)html+='<p class="notice">Chưa có kết quả xét nghiệm.</p>';
  return html;
}
/* ---------- Timeline ---------- */
function hb2Timeline(db,m){
  var ev=[];
  hb2Arr(m.vaccines).forEach(function(v){if(v.date)ev.push({d:v.date,type:'Tiêm',ico:'💉',tone:'vax',
    t:'Tiêm '+(v.name||'')+(v.dose?' · '+v.dose:''),s:(v.place||'')+(v.reaction&&v.reaction!=='Không'?' · Phản ứng: '+v.reaction:'')})});
  hb2Arr(m.visits).forEach(function(v){if(v.date)ev.push({d:v.date,type:'Khám',ico:'🩺',tone:'info',
    t:'Khám: '+(v.diagnosis||''),s:(v.hospital||'')+(v.doctor?' · '+v.doctor:'')})});
  hb2Arr(m.meds).forEach(function(x){
    if(x.from)ev.push({d:x.from,type:'Thuốc',ico:'💊',tone:'med',t:'Bắt đầu uống '+(x.name||''),s:x.dose||''});
    if(x.to)ev.push({d:x.to,type:'Thuốc',ico:'⏹',tone:'na',t:'Ngừng '+(x.name||''),s:''});
  });
  hb2Arr(m.labs).forEach(function(l){if(l.date)ev.push({d:l.date,type:'Xét nghiệm',ico:'🧪',tone:'ok',t:l.name||'Xét nghiệm',s:l.result||''})});
  var dob=hb2Dob(db,m);
  hb2Arr(m.meas).forEach(function(x){
    if(!x.date)return;
    var bits=[];
    if(x.weight)bits.push('Cân nặng '+x.weight);
    if(x.height)bits.push('Chiều cao '+x.height);
    if(x.head)bits.push('Vòng đầu '+x.head);
    if(bits.length)ev.push({d:x.date,type:'Chỉ số',ico:'⚖️',tone:'baby',t:bits.join(' · '),s:dob?whoAgeText(whoAgeMonths(dob,x.date)):''});
  });
  if(m.linkBaby)hb2Arr(db.baby).forEach(function(x){
    if(!x.date)return;
    var bits=[];
    if(x.weight)bits.push('Cân nặng '+x.weight);
    if(x.length)bits.push('Chiều dài '+x.length);
    if(x.head)bits.push('Vòng đầu '+x.head);
    if(bits.length)ev.push({d:x.date,type:'Chỉ số',ico:'⚖️',tone:'baby',t:bits.join(' · '),s:'Từ mục Sau sinh'});
  });
  return ev.sort(function(a,b){return (b.d||'').localeCompare(a.d||'')});
}
function hb2ViewTimeline(db,m){
  var ev=hb2Timeline(db,m),fs=['all','Tiêm','Khám','Thuốc','Xét nghiệm','Chỉ số'];
  var sh=ev.filter(function(e){return hb2State.tlFilter==='all'||e.type===hb2State.tlFilter});
  return '<div class="card"><div class="hb2CardHead"><b>🗓️ Timeline sức khỏe</b></div>'+
    '<div class="hb2Filters">'+fs.map(function(f){
      return '<button class="'+(hb2State.tlFilter===f?'on':'')+'" onclick="hb2SetFilter(\''+f+'\')">'+(f==='all'?'Tất cả':f)+'</button>';
    }).join('')+'</div></div>'+
    (sh.length?'<div class="hb2TL">'+sh.map(function(e){
      return '<div class="hb2TLI"><span class="hb2TLNode hb2-'+hb2Tone(e.tone)+'">'+e.ico+'</span>'+
      '<div class="hb2TLBox"><small>'+fmtDate(e.d)+'</small><b>'+esc(e.t)+'</b>'+(e.s?'<p>'+esc(e.s)+'</p>':'')+'</div></div>';
    }).join('')+'</div>':'<p class="notice">Chưa có sự kiện nào.</p>');
}
function hb2SetFilter(f){hb2State.tlFilter=f;hb2Render()}
/* ---------- Báo cáo ---------- */
function hb2ViewReport(db,m){
  var days={tuan:7,thang:30,quy:90,nam:365}[hb2State.rep],lbl={tuan:'tuần này',thang:'tháng này',quy:'quý này',nam:'năm nay'}[hb2State.rep];
  var from=new Date();from.setDate(from.getDate()-days);var fromISO=from.toISOString().slice(0,10);
  var inRange=function(d){return d&&d>=fromISO};
  var nV=hb2Arr(m.visits).filter(function(x){return inRange(x.date)}).length;
  var nX=hb2Arr(m.vaccines).filter(function(x){return inRange(x.date)&&x.status==='Đã tiêm'}).length;
  var nL=hb2Arr(m.labs).filter(function(x){return inRange(x.date)}).length;
  var nM=hb2Arr(m.meds).filter(function(x){return x.active!==false||inRange(x.from)}).length;
  var cost=hb2Arr(m.visits).filter(function(x){return inRange(x.date)}).reduce(function(s,x){return s+(hb2Num(x.cost)||0)},0);
  var dW='--',dH='--',bmiTxt='--';
  var pw=hb2WhoPoints(db,m,'wfa'),ph=hb2WhoPoints(db,m,'lhfa');
  function delta(pts,unit){
    if(pts.length<2)return '--';
    var inR=pts.filter(function(p){return p.date>=fromISO});
    var base=inR.length?(pts[pts.indexOf(inR[0])-1]||inR[0]):pts[pts.length-2];
    var last=pts[pts.length-1],d=last.value-base.value;
    return (d>=0?'+':'')+smartNum(d,2)+' '+unit;
  }
  dW=delta(pw,'kg');dH=delta(ph,'cm');
  if(hb2IsChild(m)){
    var ev=hb2WhoEval(db,m,'wfa');
    bmiTxt=ev?('BPV '+ev.pct):'--';
  } else {
    var w=hb2Num(m.weight),h=hb2Num(m.height);
    if(w&&h)bmiTxt=smartNum(w/Math.pow(h/100,2),1);
  }
  return '<div class="card"><div class="hb2CardHead"><b>📊 Báo cáo sức khỏe</b></div>'+
    '<div class="hb2Seg">'+[['tuan','Tuần'],['thang','Tháng'],['quy','Quý'],['nam','Năm']].map(function(p){
      return '<button class="'+(hb2State.rep===p[0]?'on':'')+'" onclick="hb2SetRep(\''+p[0]+'\')">'+p[1]+'</button>';
    }).join('')+'</div></div>'+
    '<div class="hb2Grid">'+
      hb2Stat('🩺','Số lần khám',nV,lbl)+hb2Stat('💉','Số lần tiêm',nX,lbl)+
      hb2Stat('💊','Thuốc đã dùng',nM,'loại')+hb2Stat('🧪','Xét nghiệm',nL,lbl)+
      hb2Stat('⚖️','Tăng cân',dW,'')+hb2Stat('📏','Tăng chiều cao',dH,'')+
      hb2Stat('📐',hb2IsChild(m)?'Cân nặng/tuổi':'BMI',bmiTxt,hb2IsChild(m)?'theo chuẩn WHO':'')+
      hb2Stat('💰','Chi phí',hb2Money(cost),'khám chữa bệnh')+
    '</div>'+
    '<div class="btns"><button onclick="hb2ExportProfile()">⬇︎ Xuất báo cáo (in / PDF)</button></div>';
}
function hb2SetRep(p){hb2State.rep=p;hb2Render()}
/* ---------- Mở rộng ---------- */
function hb2ViewFuture(db,m){
  var it=[['🩸','Huyết áp'],['🍬','Đường huyết'],['🫁','SpO2'],['❤️','Nhịp tim'],['📉','ECG'],['🌡️','Nhiệt độ'],
    ['💡','Đo Lux'],['🔊','Đo dB'],['🤖','AI đánh giá sức khỏe'],['🍎','Đồng bộ Apple Health'],['🏃','Đồng bộ Google Fit']];
  return '<div class="card"><div class="hb2CardHead"><b>🚀 Mở rộng tương lai</b></div>'+
    '<p class="sub">Module thiết kế mở: bổ sung chỉ số y tế mới mà không đổi cấu trúc dữ liệu hiện có.</p>'+
    '<div class="btns"><button class="ghost" onclick="hb2Go(\'home\')">‹ Tổng quan</button></div></div>'+
    '<div class="hb2Nav">'+it.map(function(x){
      return '<button class="hb2NavCard soon" onclick="showToast(\''+x[1]+' — sắp có\',\'success\')"><i>'+x[0]+'</i><b>'+x[1]+'</b><small>Sắp có</small></button>';
    }).join('')+'</div>'+
    '<div class="card"><b>📄 Xuất toàn bộ hồ sơ</b><p class="sub">Đã hỗ trợ: xuất hồ sơ sức khỏe của thành viên để in hoặc lưu PDF mang đi khám.</p>'+
    '<div class="btns"><button onclick="hb2ExportProfile()">⬇︎ Xuất hồ sơ ngay</button></div></div>';
}

/* ==================== FORM / SHEET ==================== */
function hb2Modal(title,bodyHtml,onSaveFn){
  var wrap=byId('hb2Modal');
  if(!wrap){
    wrap=document.createElement('div');wrap.id='hb2Modal';wrap.className='hb2Modal hidden';
    wrap.innerHTML='<div class="hb2ModalScrim" onclick="hb2CloseModal()"></div><div class="hb2ModalCard">'+
      '<div class="hb2ModalHead"><b id="hb2ModalTitle"></b><button class="ghost" onclick="hb2CloseModal()">✕</button></div>'+
      '<div id="hb2ModalBody"></div>'+
      '<div class="btns"><button id="hb2ModalSave">Lưu</button><button class="ghost" onclick="hb2CloseModal()">Hủy</button></div></div>';
    document.body.appendChild(wrap);
  }
  byId('hb2ModalTitle').textContent=title;
  byId('hb2ModalBody').innerHTML=bodyHtml;
  var btn=byId('hb2ModalSave');
  var clone=btn.cloneNode(true);btn.parentNode.replaceChild(clone,btn);
  if(onSaveFn){clone.classList.remove('hidden');clone.onclick=onSaveFn}else{clone.classList.add('hidden')}
  wrap.classList.remove('hidden');
  /* V14.2.0 · mở hộp thoại thì luôn về mép trái + đầu nội dung, không giữ lại
     vị trí cuộn ngang của lần mở trước (CSS đã chặn cuộn ngang, đây là chốt chặn cuối). */
  var card=wrap.querySelector('.hb2ModalCard');
  if(card){card.scrollTop=0;card.scrollLeft=0}
}
function hb2CloseModal(){var w=byId('hb2Modal');if(w)w.classList.add('hidden')}
function hb2F(id,label,type,val,ph){
  return '<label class="hb2F"><span>'+esc(label)+'</span><input id="'+id+'" type="'+(type||'text')+'" value="'+esc(val==null?'':val)+'" placeholder="'+esc(ph||'')+'"></label>';
}
function hb2FSel(id,label,opts,val){
  return '<label class="hb2F"><span>'+esc(label)+'</span><select id="'+id+'">'+opts.map(function(o){
    return '<option value="'+esc(o)+'"'+(String(val)===String(o)?' selected':'')+'>'+esc(o)+'</option>';
  }).join('')+'</select></label>';
}
function hb2FArea(id,label,val,ph){
  return '<label class="hb2F"><span>'+esc(label)+'</span><textarea id="'+id+'" rows="3" placeholder="'+esc(ph||'')+'">'+esc(val||'')+'</textarea></label>';
}
function hb2V(id){var e=byId(id);return e?String(e.value||'').trim():''}

/* ----- Thành viên ----- */
function hb2OpenAddMember(){
  hb2Modal('＋ Thêm thành viên',
    '<div class="hb2AvaPick" id="hb2AvaPick">'+HB2_AVATARS.map(function(a,i){
      return '<button type="button" class="'+(i===8?'on':'')+'" onclick="hb2PickAva(this,\''+a+'\')">'+a+'</button>';
    }).join('')+'</div><input type="hidden" id="hb2NewAva" value="🧑">'+
    hb2F('hb2mName','Họ tên','text','','Ví dụ: Ông Nội')+
    hb2FSel('hb2mRel','Quan hệ',HB2_RELS,'Khác')+
    hb2F('hb2mDob','Ngày sinh','date','')+
    hb2FSel('hb2mGender','Giới tính',['','Nữ','Nam'],'')+
    hb2FSel('hb2mBlood','Nhóm máu',['','O+','O-','A+','A-','B+','B-','AB+','AB-','Chưa rõ'],'')+
    hb2F('hb2mHeight','Chiều cao (cm)','number','')+
    hb2F('hb2mWeight','Cân nặng (kg)','number','')+
    hb2F('hb2mEmail','Email','email','')+
    hb2F('hb2mPhone','Số điện thoại','tel','')+
    '<p class="notice">Mỗi thành viên được tạo một hồ sơ độc lập, dữ liệu không dùng chung.</p>',
    hb2SaveMember);
}
function hb2PickAva(btn,a){
  var box=byId('hb2AvaPick');if(box)Array.prototype.forEach.call(box.children,function(b){b.classList.remove('on')});
  btn.classList.add('on');byId('hb2NewAva').value=a;
}
function hb2SaveMember(){
  var name=hb2V('hb2mName');
  if(!name){showToast('Vui lòng nhập Họ tên','warn');return}
  var db=load(),rel=hb2V('hb2mRel');
  var m=hb2EmptyMember(rel);
  m.name=name;m.avatar=hb2V('hb2NewAva')||hb2RelAva(rel);
  m.dob=hb2V('hb2mDob');m.gender=hb2V('hb2mGender');m.blood=hb2V('hb2mBlood');
  m.height=hb2V('hb2mHeight');m.weight=hb2V('hb2mWeight');m.email=hb2V('hb2mEmail');m.phone=hb2V('hb2mPhone');
  db.hb.members.push(m);db.hb.activeId=m.id;hb2State.view='home';
  hb2CloseModal();hb2Commit(db,'Đã tạo hồ sơ '+name);
}
function hb2DelMember(){
  var db=load(),m=hb2Active(db);if(!m)return;
  if(!confirm('Xóa hồ sơ sức khỏe của "'+(m.name||m.rel)+'"? Toàn bộ dữ liệu y tế của thành viên này sẽ mất.'))return;
  db.hb.members=hb2Members(db).filter(function(x){return x.id!==m.id});
  db.hb.activeId=(db.hb.members[0]||{}).id||'';hb2State.view='home';
  hb2CloseModal();hb2Commit(db,'Đã xóa hồ sơ');
}
function hb2ShowAvatar(id){
  var db=load(),m=hb2Find(db,id);if(!m)return;
  hb2Modal(m.name||m.rel,'<div class="hb2AvaFull">'+esc(m.avatar||'🧑')+'</div>'+
    '<p class="hb2AvaCap">'+esc(m.rel)+' · '+hb2AgeText(db,m)+(m.blood?' · '+esc(m.blood):'')+'</p>',null);
}
function hb2OpenStatus(){
  var db=load(),m=hb2Active(db);
  hb2Modal('Tình trạng sức khỏe',HB2_STATUS.map(function(s){
    return '<button type="button" class="hb2Opt'+(m.status.txt===s.txt?' on':'')+'" onclick="hb2SetStatus(\''+s.txt+'\',\''+s.tone+'\')">'+s.txt+'</button>';
  }).join(''),null);
}
function hb2SetStatus(txt,tone){
  var db=load(),m=hb2Active(db);m.status={txt:txt,tone:tone};
  hb2CloseModal();hb2Commit(db,'Đã cập nhật tình trạng');
}
/* ----- Hồ sơ ----- */
function hb2OpenEditBasic(){
  var db=load(),m=hb2Active(db);
  hb2Modal('Sửa thông tin cơ bản',
    hb2F('hb2bName','Họ tên','text',m.name)+
    hb2FSel('hb2bRel','Quan hệ',HB2_RELS,m.rel)+
    hb2F('hb2bDob','Ngày sinh','date',hb2Dob(db,m))+
    hb2FSel('hb2bGender','Giới tính',['','Nữ','Nam'],m.gender)+
    hb2FSel('hb2bBlood','Nhóm máu',['','O+','O-','A+','A-','B+','B-','AB+','AB-','Chưa rõ'],m.blood)+
    hb2F('hb2bHeight','Chiều cao (cm)','number',m.height)+
    hb2F('hb2bWeight','Cân nặng (kg)','number',m.weight)+
    hb2F('hb2bEmail','Email','email',m.email)+
    hb2F('hb2bPhone','Số điện thoại','tel',m.phone),
    function(){
      var db2=load(),mm=hb2Active(db2);
      mm.name=hb2V('hb2bName')||mm.name;mm.rel=hb2V('hb2bRel');mm.dob=hb2V('hb2bDob');
      mm.gender=hb2V('hb2bGender');mm.blood=hb2V('hb2bBlood');
      mm.height=hb2V('hb2bHeight');mm.weight=hb2V('hb2bWeight');
      mm.email=hb2V('hb2bEmail');mm.phone=hb2V('hb2bPhone');
      hb2CloseModal();hb2Commit(db2,'Đã lưu thông tin cơ bản');
    });
}
function hb2OpenEditMedical(){
  var db=load(),m=hb2Active(db),md=m.medical;
  hb2Modal('Sửa thông tin y tế',
    hb2F('hb2xBhxh','Mã BHXH','text',md.bhxh)+
    hb2F('hb2xBhyt','Mã BHYT','text',md.bhyt)+
    hb2F('hb2xExp','Ngày hết hạn BHYT','date',md.bhytExp)+
    hb2F('hb2xPlace','Nơi đăng ký khám BHYT','text',md.bhytPlace)+
    hb2F('hb2xHosp','Bệnh viện thường khám','text',md.hospital)+
    hb2F('hb2xDoc','Bác sĩ theo dõi','text',md.doctor)+
    hb2F('hb2xEmg','Liên hệ khẩn cấp','text',md.emergency,'Tên · số điện thoại'),
    function(){
      var db2=load(),mm=hb2Active(db2);
      mm.medical={bhxh:hb2V('hb2xBhxh'),bhyt:hb2V('hb2xBhyt'),bhytExp:hb2V('hb2xExp'),bhytPlace:hb2V('hb2xPlace'),
        hospital:hb2V('hb2xHosp'),doctor:hb2V('hb2xDoc'),emergency:hb2V('hb2xEmg')};
      hb2CloseModal();hb2Commit(db2,'Đã lưu thông tin y tế');
    });
}
function hb2OpenEditHistory(){
  var db=load(),m=hb2Active(db),h=m.history,al=h.allergy||{};
  hb2Modal('Cập nhật tiền sử',
    '<p class="notice">Nhiều mục cách nhau bằng dấu phẩy.</p>'+
    hb2F('hb2hDis','Tiền sử bệnh','text',hb2Arr(h.diseases).join(', '),'Hen, viêm gan…')+
    hb2F('hb2hChr','Bệnh nền','text',hb2Arr(h.chronic).join(', '),'Tiểu đường, tim mạch…')+
    hb2F('hb2hA1','Dị ứng thuốc','text',hb2Arr(al.drug).join(', '))+
    hb2F('hb2hA2','Dị ứng thực phẩm','text',hb2Arr(al.food).join(', '))+
    hb2F('hb2hA3','Dị ứng hải sản','text',hb2Arr(al.seafood).join(', '))+
    hb2F('hb2hA4','Dị ứng phấn hoa','text',hb2Arr(al.pollen).join(', '))+
    hb2F('hb2hA5','Dị ứng khác','text',hb2Arr(al.other).join(', '))+
    hb2F('hb2hSur','Tiền sử phẫu thuật','text',hb2Arr(h.surgery).join(', '))+
    hb2F('hb2hFam','Tiền sử gia đình','text',hb2Arr(h.family).join(', '),'Cha bị tiểu đường…'),
    function(){
      var db2=load(),mm=hb2Active(db2);
      mm.history={diseases:hb2Split(hb2V('hb2hDis')),chronic:hb2Split(hb2V('hb2hChr')),
        allergy:{drug:hb2Split(hb2V('hb2hA1')),food:hb2Split(hb2V('hb2hA2')),seafood:hb2Split(hb2V('hb2hA3')),
          pollen:hb2Split(hb2V('hb2hA4')),other:hb2Split(hb2V('hb2hA5'))},
        surgery:hb2Split(hb2V('hb2hSur')),family:hb2Split(hb2V('hb2hFam'))};
      hb2CloseModal();hb2Commit(db2,'Đã cập nhật tiền sử');
    });
}
function hb2OpenNote(){
  var db=load(),m=hb2Active(db);
  hb2Modal('Ghi chú sức khỏe',hb2FArea('hb2Note','Nội dung',m.other.notes,'Ghi chú về sức khỏe…'),
    function(){var db2=load(),mm=hb2Active(db2);mm.other.notes=hb2V('hb2Note');hb2CloseModal();hb2Commit(db2,'Đã lưu ghi chú')});
}
function hb2OpenAddFile(){
  hb2Modal('Thêm tệp đính kèm',
    hb2FSel('hb2fKind','Loại tệp',['Ảnh toa thuốc','Ảnh BHYT','Ảnh BHXH','PDF khám bệnh','Ảnh sổ tiêm','Kết quả xét nghiệm','Khác'],'Ảnh toa thuốc')+
    hb2F('hb2fName','Tên/ghi chú tệp','text','','Ví dụ: Toa thuốc 07/2026')+
    '<p class="notice">Bản này lưu nhãn tệp trong hồ sơ. Ảnh/PDF gốc nên lưu kèm ở mục Sao lưu dữ liệu.</p>',
    function(){
      var db2=load(),mm=hb2Active(db2),kind=hb2V('hb2fKind'),name=hb2V('hb2fName')||kind;
      var icon=kind.indexOf('PDF')>=0?'📄':(kind.indexOf('BHYT')>=0||kind.indexOf('BHXH')>=0?'🪪':'📷');
      mm.other.files.push({icon:icon,name:name,kind:kind,addedAt:new Date().toISOString()});
      hb2CloseModal();hb2Commit(db2,'Đã thêm tệp đính kèm');
    });
}
function hb2DelFile(i){
  if(!confirm('Xóa tệp đính kèm này?'))return;
  var db=load(),m=hb2Active(db);m.other.files.splice(i,1);hb2Commit(db,'Đã xóa tệp');
}
function hb2DelRow(coll,i){
  if(!confirm('Xóa dòng dữ liệu này?'))return;
  var db=load(),m=hb2Active(db);hb2Arr(m[coll]).splice(i,1);hb2Commit(db,'Đã xóa');
}
/* ----- Tiêm chủng ----- */
function hb2OpenVax(i){
  var db=load(),m=hb2Active(db),v=(typeof i==='number')?(m.vaccines[i]||{}):{};
  hb2Modal((typeof i==='number'?'Sửa':'＋ Thêm')+' mũi tiêm',
    hb2F('hb2vName','Tên vaccine','text',v.name,'Sởi – Quai bị – Rubella')+
    hb2F('hb2vDose','Mũi số','text',v.dose,'Mũi 1')+
    hb2FSel('hb2vSt','Trạng thái',HB2_VAXST,v.status||'Đã tiêm')+
    hb2F('hb2vDate','Ngày tiêm','date',v.date)+
    hb2F('hb2vPlace','Nơi tiêm','text',v.place)+
    hb2F('hb2vDoc','Bác sĩ','text',v.doctor)+
    hb2F('hb2vReact','Phản ứng sau tiêm','text',v.reaction,'Không / Sốt nhẹ…')+
    hb2F('hb2vPhoto','Ảnh sổ tiêm (nhãn)','text',v.photo,'Ví dụ: Ảnh trang 3 sổ tiêm'),
    function(){
      var db2=load(),mm=hb2Active(db2);
      if(!hb2V('hb2vName')){showToast('Vui lòng nhập Tên vaccine','warn');return}
      var item={name:hb2V('hb2vName'),dose:hb2V('hb2vDose'),status:hb2V('hb2vSt'),date:hb2V('hb2vDate'),
        place:hb2V('hb2vPlace'),doctor:hb2V('hb2vDoc'),reaction:hb2V('hb2vReact'),photo:hb2V('hb2vPhoto'),
        updatedAt:new Date().toISOString()};
      if(typeof i==='number'&&mm.vaccines[i])mm.vaccines[i]=item;else mm.vaccines.push(item);
      hb2State.view='vaccine';hb2CloseModal();hb2Commit(db2,'Đã lưu mũi tiêm');
    });
}
/* ----- Khám bệnh ----- */
function hb2OpenVisit(i){
  var db=load(),m=hb2Active(db),v=(typeof i==='number')?(m.visits[i]||{}):{};
  hb2Modal((typeof i==='number'?'Sửa':'＋ Thêm')+' lần khám',
    hb2F('hb2kDate','Ngày khám','date',v.date||today())+
    hb2F('hb2kHosp','Bệnh viện','text',v.hospital)+
    hb2F('hb2kDoc','Bác sĩ','text',v.doctor)+
    hb2F('hb2kSym','Triệu chứng','text',v.symptom)+
    hb2F('hb2kDx','Chẩn đoán','text',v.diagnosis,'Viêm họng cấp')+
    hb2F('hb2kTx','Điều trị','text',v.treatment)+
    hb2F('hb2kMed','Thuốc','text',v.meds)+
    hb2F('hb2kCost','Chi phí (đ)','number',v.cost)+
    hb2FSel('hb2kBh','BHYT',['Tự túc','Có chi trả'],v.insurance?'Có chi trả':'Tự túc')+
    hb2FArea('hb2kNote','Ghi chú',v.note),
    function(){
      var db2=load(),mm=hb2Active(db2);
      if(!hb2V('hb2kDx')){showToast('Vui lòng nhập Chẩn đoán','warn');return}
      var item={date:hb2V('hb2kDate')||today(),hospital:hb2V('hb2kHosp'),doctor:hb2V('hb2kDoc'),
        symptom:hb2V('hb2kSym'),diagnosis:hb2V('hb2kDx'),treatment:hb2V('hb2kTx'),meds:hb2V('hb2kMed'),
        cost:hb2V('hb2kCost'),insurance:hb2V('hb2kBh')==='Có chi trả',note:hb2V('hb2kNote'),
        files:hb2Arr(v.files),updatedAt:new Date().toISOString()};
      if(typeof i==='number'&&mm.visits[i])mm.visits[i]=item;else mm.visits.push(item);
      hb2State.view='visits';hb2CloseModal();hb2Commit(db2,'Đã lưu lần khám');
    });
}
/* ----- Thuốc ----- */
function hb2OpenMed(i){
  var db=load(),m=hb2Active(db),x=(typeof i==='number')?(m.meds[i]||{}):{};
  hb2Modal((typeof i==='number'?'Sửa':'＋ Thêm')+' thuốc',
    hb2F('hb2dName','Tên thuốc','text',x.name,'Paracetamol 250mg')+
    hb2F('hb2dDose','Liều dùng','text',x.dose,'1 gói × 3 lần/ngày')+
    hb2F('hb2dFrom','Ngày bắt đầu','date',x.from||today())+
    hb2F('hb2dTo','Ngày kết thúc','date',x.to)+
    hb2FSel('hb2dRemind','Nhắc uống',['Bật','Tắt'],x.remind===false?'Tắt':'Bật'),
    function(){
      var db2=load(),mm=hb2Active(db2);
      if(!hb2V('hb2dName')){showToast('Vui lòng nhập Tên thuốc','warn');return}
      var item={name:hb2V('hb2dName'),dose:hb2V('hb2dDose'),from:hb2V('hb2dFrom')||today(),to:hb2V('hb2dTo'),
        active:(typeof i==='number'&&mm.meds[i])?mm.meds[i].active!==false:true,
        remind:hb2V('hb2dRemind')==='Bật',takenDate:(typeof i==='number'&&mm.meds[i])?mm.meds[i].takenDate:'',
        updatedAt:new Date().toISOString()};
      if(typeof i==='number'&&mm.meds[i])mm.meds[i]=item;else mm.meds.push(item);
      hb2State.view='meds';hb2CloseModal();hb2Commit(db2,'Đã lưu thuốc');
    });
}
function hb2ToggleTaken(i){
  var db=load(),m=hb2Active(db),x=m.meds[i];if(!x)return;
  var done=(x.takenDate===today());x.takenDate=done?'':today();
  hb2Commit(db,done?'Đã bỏ đánh dấu':'Đã đánh dấu uống '+x.name);
}
function hb2ToggleRemind(i){
  var db=load(),m=hb2Active(db),x=m.meds[i];if(!x)return;
  x.remind=!x.remind;hb2Commit(db,x.remind?'Đã bật nhắc uống':'Đã tắt nhắc uống');
}
function hb2StopMed(i){
  var db=load(),m=hb2Active(db),x=m.meds[i];if(!x)return;
  if(!confirm('Đánh dấu ngừng thuốc "'+x.name+'"?'))return;
  x.active=false;x.to=x.to||today();hb2Commit(db,'Đã ngừng '+x.name);
}
/* ----- Xét nghiệm ----- */
function hb2OpenLab(i){
  var db=load(),m=hb2Active(db),x=(typeof i==='number')?(m.labs[i]||{}):{};
  hb2Modal((typeof i==='number'?'Sửa':'＋ Thêm')+' kết quả xét nghiệm',
    hb2F('hb2lName','Tên xét nghiệm','text',x.name,'Công thức máu')+
    hb2FSel('hb2lType','Loại',HB2_LABTYPES,x.type||'Máu')+
    hb2F('hb2lDate','Ngày','date',x.date||today())+
    hb2F('hb2lRes','Kết quả','text',x.result,'Trong giới hạn bình thường')+
    hb2FSel('hb2lLevel','Đánh giá',['Bình thường','Cần lưu ý'],x.level==='warn'?'Cần lưu ý':'Bình thường')+
    hb2FArea('hb2lIdx','Chỉ số (mỗi dòng: Tên = Giá trị)',hb2Arr(x.indices).map(function(k){return k[0]+' = '+k[1]}).join('\n'),'Hb = 118 g/L'),
    function(){
      var db2=load(),mm=hb2Active(db2);
      if(!hb2V('hb2lName')){showToast('Vui lòng nhập Tên xét nghiệm','warn');return}
      var idx=String(byId('hb2lIdx')?byId('hb2lIdx').value:'').split('\n').map(function(line){
        var p=line.split('=');return p.length>1?[p[0].trim(),p.slice(1).join('=').trim()]:null;
      }).filter(Boolean);
      var item={name:hb2V('hb2lName'),type:hb2V('hb2lType'),date:hb2V('hb2lDate')||today(),result:hb2V('hb2lRes'),
        level:hb2V('hb2lLevel')==='Cần lưu ý'?'warn':'ok',indices:idx,files:hb2Arr(x.files),updatedAt:new Date().toISOString()};
      if(typeof i==='number'&&mm.labs[i])mm.labs[i]=item;else mm.labs.push(item);
      hb2State.view='labs';hb2CloseModal();hb2Commit(db2,'Đã lưu kết quả');
    });
}
/* ----- Đo chỉ số ----- */
function hb2QuickMeas(){
  var db=load(),m=hb2Active(db);
  hb2Modal('⚖️ Đo chỉ số',
    hb2F('hb2sDate','Ngày đo','date',today())+
    hb2F('hb2sW','Cân nặng (kg)','number','')+
    hb2F('hb2sH','Chiều cao / dài (cm)','number','')+
    (hb2IsChild(m)?hb2F('hb2sHc','Vòng đầu (cm)','number',''):'')+
    '<p class="notice">Bỏ trống ô nào thì không ghi nhận chỉ số đó.</p>',
    function(){
      var db2=load(),mm=hb2Active(db2);
      var w=hb2V('hb2sW'),h=hb2V('hb2sH'),hc=byId('hb2sHc')?hb2V('hb2sHc'):'';
      if(!w&&!h&&!hc){showToast('Nhập ít nhất một chỉ số','warn');return}
      var d=hb2V('hb2sDate')||today();
      var row=null;
      hb2Arr(mm.meas).forEach(function(x){if(x.date===d)row=x});
      if(!row){row={date:d,weight:'',height:'',head:''};mm.meas.push(row)}
      if(w){row.weight=w;mm.weight=w}
      if(h){row.height=h;mm.height=h}
      if(hc)row.head=hc;
      mm.meas.sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});
      if(hb2IsChild(mm))hb2State.view='growth';
      hb2CloseModal();hb2Commit(db2,'Đã lưu chỉ số');
    });
}
/* ----- Thêm nhanh ----- */
function hb2OpenQuickAdd(){
  var db=load(),m=hb2Active(db);
  var items=[['⚖️','Đo cân nặng','hb2QuickMeas()'],['📏','Đo chiều cao','hb2QuickMeas()'],
    ['💉','Tiêm chủng','hb2OpenVax()'],['🩺','Khám bệnh','hb2OpenVisit()'],['💊','Thuốc','hb2OpenMed()'],
    ['🧪','Xét nghiệm','hb2OpenLab()'],['📝','Ghi chú','hb2OpenNote()']];
  hb2Modal('Thêm nhanh · '+(m?esc(m.name||m.rel):''),
    '<div class="hb2QA">'+items.map(function(x){
      return '<button type="button" onclick="'+x[2]+'"><i>'+x[0]+'</i><b>'+x[1]+'</b></button>';
    }).join('')+'</div>',null);
}
/* ----- Xuất hồ sơ ----- */
function hb2ExportProfile(){
  var db=load(),m=hb2Active(db);if(!m)return;
  var h=m.history,al=h.allergy||{},md=m.medical;
  function sec(t,body){return '<h2>'+t+'</h2>'+body}
  function ul(arr){arr=hb2Arr(arr);return arr.length?'<ul>'+arr.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'<p>—</p>'}
  var html='<html><head><meta charset="utf-8"><title>Hồ sơ sức khỏe · '+esc(m.name)+'</title>'+
    '<style>body{font-family:system-ui,Arial,sans-serif;padding:24px;color:#111;line-height:1.55}'+
    'h1{margin:0 0 4px}h2{margin:20px 0 6px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px}'+
    'table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ddd;padding:6px;text-align:left}'+
    'ul{margin:4px 0;padding-left:18px}p{margin:4px 0}small{color:#666}</style></head><body>'+
    '<h1>'+esc(m.avatar||'')+' Hồ sơ sức khỏe · '+esc(m.name||m.rel)+'</h1>'+
    '<small>'+esc(m.rel)+' · '+hb2AgeText(db,m)+' · Xuất ngày '+fmtDate(today())+' · Mẹ Yêu Bé V'+APP_VERSION+'</small>'+
    sec('Thông tin cơ bản','<table>'+
      '<tr><th>Ngày sinh</th><td>'+fmtDate(hb2Dob(db,m))+'</td><th>Giới tính</th><td>'+esc(m.gender||'--')+'</td></tr>'+
      '<tr><th>Nhóm máu</th><td>'+esc(m.blood||'--')+'</td><th>Chiều cao</th><td>'+esc(m.height||'--')+'</td></tr>'+
      '<tr><th>Cân nặng</th><td>'+esc(m.weight||'--')+'</td><th>SĐT</th><td>'+esc(m.phone||'--')+'</td></tr></table>')+
    sec('Thông tin y tế','<table>'+
      '<tr><th>Mã BHXH</th><td>'+esc(md.bhxh||'--')+'</td><th>Mã BHYT</th><td>'+esc(md.bhyt||'--')+'</td></tr>'+
      '<tr><th>Hết hạn BHYT</th><td>'+(md.bhytExp?fmtDate(md.bhytExp):'--')+'</td><th>Nơi đăng ký</th><td>'+esc(md.bhytPlace||'--')+'</td></tr>'+
      '<tr><th>BV thường khám</th><td>'+esc(md.hospital||'--')+'</td><th>Bác sĩ theo dõi</th><td>'+esc(md.doctor||'--')+'</td></tr>'+
      '<tr><th>Liên hệ khẩn cấp</th><td colspan="3">'+esc(md.emergency||'--')+'</td></tr></table>')+
    sec('Tiền sử','<p><b>Tiền sử bệnh</b></p>'+ul(h.diseases)+'<p><b>Bệnh nền</b></p>'+ul(h.chronic)+
      '<p><b>Dị ứng</b></p>'+ul([].concat(hb2Arr(al.drug).map(function(x){return 'Thuốc: '+x}),
        hb2Arr(al.food).map(function(x){return 'Thực phẩm: '+x}),hb2Arr(al.seafood).map(function(x){return 'Hải sản: '+x}),
        hb2Arr(al.pollen).map(function(x){return 'Phấn hoa: '+x}),hb2Arr(al.other)))+
      '<p><b>Phẫu thuật</b></p>'+ul(h.surgery)+'<p><b>Gia đình</b></p>'+ul(h.family))+
    sec('Tiêm chủng',hb2Arr(m.vaccines).length?'<table><tr><th>Vaccine</th><th>Mũi</th><th>Trạng thái</th><th>Ngày</th><th>Nơi tiêm</th><th>Phản ứng</th></tr>'+
      m.vaccines.map(function(v){return '<tr><td>'+esc(v.name)+'</td><td>'+esc(v.dose||'')+'</td><td>'+esc(v.status||'')+'</td><td>'+(v.date?fmtDate(v.date):'')+'</td><td>'+esc(v.place||'')+'</td><td>'+esc(v.reaction||'')+'</td></tr>'}).join('')+'</table>':'<p>—</p>')+
    sec('Lịch sử khám',hb2SortedVisits(m).length?'<table><tr><th>Ngày</th><th>Bệnh viện</th><th>Bác sĩ</th><th>Chẩn đoán</th><th>Điều trị</th><th>Chi phí</th></tr>'+
      hb2SortedVisits(m).map(function(v){return '<tr><td>'+fmtDate(v.date)+'</td><td>'+esc(v.hospital||'')+'</td><td>'+esc(v.doctor||'')+'</td><td>'+esc(v.diagnosis||'')+'</td><td>'+esc(v.treatment||'')+'</td><td>'+(v.cost?hb2Money(v.cost):'')+'</td></tr>'}).join('')+'</table>':'<p>—</p>')+
    sec('Thuốc',hb2Arr(m.meds).length?'<table><tr><th>Tên thuốc</th><th>Liều dùng</th><th>Từ</th><th>Đến</th><th>Trạng thái</th></tr>'+
      m.meds.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+esc(x.dose||'')+'</td><td>'+fmtDate(x.from)+'</td><td>'+(x.to?fmtDate(x.to):'')+'</td><td>'+(x.active===false?'Đã ngừng':'Đang uống')+'</td></tr>'}).join('')+'</table>':'<p>—</p>')+
    sec('Xét nghiệm',hb2Arr(m.labs).length?'<table><tr><th>Tên</th><th>Loại</th><th>Ngày</th><th>Kết quả</th></tr>'+
      m.labs.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+esc(x.type||'')+'</td><td>'+fmtDate(x.date)+'</td><td>'+esc(x.result||'')+'</td></tr>'}).join('')+'</table>':'<p>—</p>')+
    (m.other.notes?sec('Ghi chú sức khỏe','<p>'+esc(m.other.notes)+'</p>'):'')+
    '</body></html>';
  /* V14.2.0 · Trước đây dùng window.open('','_blank'): trong PWA (thêm vào màn hình chính)
     cửa sổ mới không có thanh điều hướng nên người dùng bị kẹt, không đóng và không quay
     lại được. Nay báo cáo hiển thị trong một popup tách riêng ngay trong app, có nút ✕ và
     nút Đóng; muốn in/lưu PDF thì bấm nút In (in trực tiếp khung nội dung, vẫn ở trong app). */
  hb2ShowReport(html,'📄 Báo cáo sức khỏe · '+(m.name||m.rel||''));
}
/* ---- Popup xem trước báo cáo (tách riêng, luôn đóng được) ---- */
function hb2ShowReport(html,title){
  var ov=byId('hb2ReportOverlay'),fr=byId('hb2ReportFrame'),ttl=byId('hb2ReportTitle');
  if(!ov||!fr){showToast('Không mở được bản xem trước','error');return}
  if(ttl)ttl.textContent=title||'📄 Xem trước báo cáo';
  fr.setAttribute('srcdoc',html);
  ov.classList.add('show');ov.setAttribute('aria-hidden','false');
  showToast('Xem trước báo cáo — bấm In / Lưu PDF nếu cần','success');
}
function hb2CloseReport(){
  var ov=byId('hb2ReportOverlay'),fr=byId('hb2ReportFrame');
  if(!ov)return;
  ov.classList.remove('show');ov.setAttribute('aria-hidden','true');
  /* nhả nội dung để không giữ ảnh/bảng nặng trong bộ nhớ khi đã đóng */
  if(fr)fr.setAttribute('srcdoc','');
}
function hb2PrintReport(){
  var fr=byId('hb2ReportFrame');
  if(!fr||!fr.contentWindow){showToast('Chưa có nội dung để in','warn');return}
  try{fr.contentWindow.focus();fr.contentWindow.print()}
  catch(e){showToast('Thiết bị không hỗ trợ in trực tiếp','error')}
}



/* ============================================================================
   ✨ V14.3.0 · ANIMATION SYSTEM
   Toàn bộ hàm mới, tiền tố "ax". KHÔNG sửa một dòng nào của các hàm cũ:
   những chỗ cần can thiệp đều dùng axWrap() để BỌC hàm lúc chạy, nên mã nguồn
   của mọi hàm trong Baseline Lock giữ nguyên 100% (hash không đổi).

   Bảng thời lượng dùng chung — chỉ 4 kiểu: Fade · Slide · Scale · Spring.
     160ms  nhấn nút / nhấn thẻ
     190ms  đóng popup
     200ms  fade dữ liệu
     240ms  mở popup, chuyển trang, chạy số, thanh tiến trình
      36ms  khoảng cách giữa 2 dòng của danh sách (yêu cầu 30~50ms)
   Không dùng Rotate (trừ spinner), không nảy mạnh, không animation dài.
   ============================================================================ */

var AX_PREF_KEY='meYeuBeAnimPref_v1';
/* exit 220ms: đủ dài để hiệu ứng ĐÓNG popup chạy hết (CSS đóng dùng 200ms) */
var AX_DUR={fast:160,base:200,slow:240,exit:220,stagger:36,staggerMax:14};
var AX_ORIG={};
var AX_STATE={counters:{},lists:{},hero:{},queue:[],flush:false,pageTimer:null,lastHaptic:0,booted:false};
/* V14.4.0 — Bộ điều khiển NHẤN (press): chỉ block nằm trong cùng mới scale, và
   tự huỷ khi ngón tay bắt đầu cuộn. Các block có thể lồng nhau nên phải chọn
   phần tử gần điểm chạm nhất, đồng thời chặn tổ tiên scale theo. */
var AX_PRESS_SEL='.card,.item,.box,.bcCard,.bcHero,.bcMetric,.bcGrowthItem,.bcTimeRow,'+
  '.bcApptCard,.dashCareCell,.dashPanel,.dashCarePanel,.navItem,.careEvent,.healthBlock,'+
  '.moreItem,.scheduleDue,.msDashPreview,.smartAlertSummary,.careStatBox,.diaperChoice';
/* Chạm vào các phần tử này thì để chúng tự phản hồi (nút bấm, ô nhập, vùng vuốt) —
   KHÔNG cho block cha scale theo. */
var AX_PRESS_SKIP='button,a,input,select,textarea,label,[role=switch],.swipeActions,.swipeAction,.axNoPress';
/* Phần tử được coi là "bấm được" để rung phản hồi nhẹ khi chạm (không phải cuộn). */
var AX_TAP_SEL='button,a,[role=button],[onclick],'+
  '.bcMetric,.dashCareCell,.navItem,.careEvent,.moreItem,.careStatBox,.bcApptCard,.bcCard,.diaperChoice';
var AX_PRESS={el:null,x:0,y:0,timer:null,applied:false,appliedAt:0,moved:false,active:false,hosts:null,lastReplay:0};
var AX_PRESS_DELAY=24;   /* nhấn gần như tức thì: đủ để lọc cuộn nhanh, nhưng THẤY được trước khi popup mở */
var AX_PRESS_MOVE=10;    /* di quá 10px coi như cuộn → huỷ hiệu ứng nhấn */
var AX_PRESS_MINVIS=130; /* đã hiện thì giữ tối thiểu 130ms cho mắt kịp thấy */

/* Popup / bottom sheet được quản lý chuyển động. Mỗi mục: id + cách app bật tắt nó.
   'show'   → mở khi CÓ class show      (đa số popup)
   'hidden' → mở khi KHÔNG có class hidden (hộp thoại Sổ sức khỏe 2.0)
   'open'   → mở khi CÓ class open      (sheet của Đo ồn / Đo sáng) */
var AX_OVERLAYS=[
  ['smartAlertOverlay','show'],['notificationOverlay','show'],['milkBagPickerOverlay','show'],
  ['milestoneDetailOverlay','show'],['monthDetailOverlay','show'],['careDetailOverlay','show'],
  ['careFormOverlay','show'],['milkBagDetailOverlay','show'],['moreSheet','show'],
  ['streakOverlay','show'],['globalSearchOverlay','show'],['bkExportOverlay','show'],
  ['bkImportOverlay','show'],['bkRestoreOverlay','show'],['tfOverlay','show'],
  ['hb2ReportOverlay','show'],['avatarViewerOverlay','show'],['msPhotoViewerOverlay','show'],
  ['nmInfoSheet','open'],['lxInfoSheet','open'],['hb2Modal','hidden']
];
/* Hai trình xem ảnh có sẵn cơ chế phóng to bằng transform → chỉ fade lớp phủ,
   không đụng vào khung ảnh để khỏi giật khi người dùng đang zoom. */
var AX_OVERLAY_PLAIN={avatarViewerOverlay:1,msPhotoViewerOverlay:1};

/* Ô số được chạy dần. Bỏ qua đồng hồ và Timer vì chúng tự đổi mỗi giây. */
var AX_COUNT_SEL='.bcMetric .val,.bcGrowthItem b,.kpi .box b,.careStatBox b,.dashCareCell b,[data-ax-count]';
var AX_COUNT_SKIP='#careTimerBox,.careTimerRunning,.bcClock,#vnClock,#bcSleepElapsed,[data-ax-nocount]';
/* Danh sách được fade lần lượt */
var AX_LIST_SEL='#careTimelineBox,#appointmentList,#pregnancyList,#babyList,#milkInventoryBox,'+
  '#milestoneTimelineBox,#notificationCenterBody,#smartAlertCenterBody,#milkBagPickerList,'+
  '#monthlyJourneyBox,#statsCompareBox,#appointmentTypeList,#milkContainerList,'+
  '.bcTodayGrid,.bcTimeline,.bcGrowthGrid,.careStatsGrid';
/* Trang nặng: hiện Skeleton trong lúc dựng nội dung, thay cho spinner phủ kín màn hình */
var AX_HEAVY_PAGES={careStats:'stat',careTimeline:'list',healthBook2:'card',yearSummary:'stat',
  monthlyJourney:'card',statsCompare:'stat',milestoneTimeline:'list',milkInventory:'list',
  scheduleList:'list',scheduleCalendar:'card',babyStats:'stat',pregnancyStats:'stat',
  babyChart:'stat',pregnancyChart:'stat',data:'card',cloudSync:'card'};

/* ---------------------------------------------------------------- 0. Tuỳ chọn */
function axPrefs(){
  var p={anim:true,haptic:true};
  try{
    var raw=localStorage.getItem(AX_PREF_KEY);
    if(raw){
      var o=JSON.parse(raw);
      if(o&&typeof o==='object'){
        if(typeof o.anim==='boolean')p.anim=o.anim;
        if(typeof o.haptic==='boolean')p.haptic=o.haptic;
      }
    }
  }catch(e){}
  return p;
}
function axSavePrefs(p){try{localStorage.setItem(AX_PREF_KEY,JSON.stringify(p))}catch(e){}}
/* Hệ điều hành đang bật "Giảm chuyển động" thì tôn trọng, không cần hỏi lại */
function axReduceMotion(){
  try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
  catch(e){return false}
}
function axEnabled(){return axPrefs().anim&&!axReduceMotion()}
function axApplyMode(){
  var p=axPrefs();
  if(document.body)document.body.classList.toggle('axOff',!axEnabled());
  var a=byId('axAnimToggle');if(a)a.checked=p.anim;
  var h=byId('axHapticToggle');if(h)h.checked=p.haptic;
}
function axSetEnabled(on){
  var p=axPrefs();p.anim=!!on;axSavePrefs(p);axApplyMode();
  if(typeof showToast==='function')showToast(on?'Đã bật hiệu ứng chuyển động':'Đã tắt hiệu ứng chuyển động','success');
}
function axSetHaptic(on){
  var p=axPrefs();p.haptic=!!on;axSavePrefs(p);axApplyMode();
  if(on)axHaptic('success');
  if(typeof showToast==='function')showToast(on?'Đã bật rung phản hồi':'Đã tắt rung phản hồi','success');
}

/* ---------------------------------------------------------------- 1. Haptic */
var AX_HAPTIC_PATTERN={success:[12],warn:[16,52,16],error:[18,52,18],remove:[24],undo:[10,42,10],light:[8]};
function axHaptic(kind){
  if(!axPrefs().haptic)return false;
  /* Một thao tác thường bắn ra vài thông báo liền nhau (xoá → toast → undo bar).
     Chặn 140ms để máy chỉ rung MỘT nhịp, không rung dồn gây khó chịu. */
  var now=Date.now();
  if(now-AX_STATE.lastHaptic<140)return false;
  AX_STATE.lastHaptic=now;
  var pat=AX_HAPTIC_PATTERN[kind]||AX_HAPTIC_PATTERN.light;
  try{
    if(navigator&&typeof navigator.vibrate==='function'){navigator.vibrate(pat);return true}
  }catch(e){}
  return false;   /* máy không hỗ trợ (iOS Safari) → im lặng bỏ qua */
}

/* --------------------------------------------------- 2. Tiện ích dùng chung */
/* Bọc một hàm toàn cục mà KHÔNG sửa mã nguồn của nó (giữ nguyên Baseline hash) */
function axWrap(name,after,before){
  if(typeof window[name]!=='function')return false;
  if(AX_ORIG[name])return true;
  AX_ORIG[name]=window[name];
  window[name]=function(){
    if(typeof before==='function'){try{before.apply(this,arguments)}catch(e){}}
    var r=AX_ORIG[name].apply(this,arguments);
    if(typeof after==='function'){try{after.apply(this,arguments)}catch(e){}}
    return r;
  };
  return true;
}
/* Khoá định danh ổn định qua các lần vẽ lại, để nhớ giá trị cũ của từng ô số */
function axKeyOf(el){
  if(!el||el.nodeType!==1)return '';
  var fixed=el.getAttribute&&el.getAttribute('data-ax-key');
  if(fixed)return fixed;
  var parts=[],n=el,depth=0;
  while(n&&n.nodeType===1&&depth<7){
    if(n.id){parts.unshift('#'+n.id);break}
    var p=n.parentNode,idx=0;
    if(p&&p.children){for(var i=0;i<p.children.length;i++){if(p.children[i]===n){idx=i;break}}}
    parts.unshift(String(n.tagName||'').toLowerCase()+'.'+String(n.className||'').split(' ')[0]+':'+idx);
    n=p;depth++;
  }
  return parts.join('>');
}
function axVisible(el){
  if(!el||!el.getClientRects)return false;
  try{return el.getClientRects().length>0}catch(e){return false}
}
function axReflow(el){if(el)void el.offsetWidth}
/* Phát lại một animation đã gắn sẵn bằng cách gỡ rồi gắn lại class */
function axReplay(el,cls){
  if(!el||!axEnabled())return;
  el.classList.remove(cls);axReflow(el);el.classList.add(cls);
}
function axSwap(el){axReplay(el,'axSwap')}

/* --------------------------------------------------- 3. COUNTER ANIMATION */
function axEaseOut(t){return 1-Math.pow(1-t,5)}
function axFmtNum(n,dec,sep){
  var s=dec>0?Number(n).toFixed(dec):String(Math.round(n));
  return sep===','?s.replace('.',','):s;
}
/* Lấy đúng nút văn bản chứa số đầu tiên → giữ nguyên icon và thẻ <small> đơn vị */
function axFirstNumberNode(el){
  try{
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false),n;
    while((n=w.nextNode())){if(/\d/.test(n.nodeValue))return n}
  }catch(e){}
  return null;
}
/* Chạy số cho MỘT ô: 0 → 50 → 120 → 390 ml, không nhảy thẳng tới đích */
function axCount(el,to,opts){
  opts=opts||{};
  if(!el)return;
  var node=axFirstNumberNode(el);
  if(!node)return;
  var m=String(node.nodeValue).match(/^([\s\S]*?)(-?\d+(?:[.,]\d+)?)([\s\S]*)$/);
  if(!m)return;
  var pre=m[1],cur=m[2],post=m[3];
  var sep=cur.indexOf(',')>-1?',':'.';
  var dec=(cur.split(/[.,]/)[1]||'').length;
  var target=(to===undefined||to===null)?Number(String(cur).replace(',','.')):Number(to);
  var from=(opts.from===undefined||opts.from===null)?0:Number(opts.from);
  if(!isFinite(target))return;
  if(!isFinite(from))from=0;
  /* V14.4.2 — Ghi nhớ ĐÍCH của lượt chạy này ngay trên phần tử, kèm một mã lượt
     để lượt chạy mới tự huỷ lượt cũ (tránh hai vòng rAF cùng ghi vào một ô). */
  var tok=(el.__axCountTok=(Number(el.__axCountTok)||0)+1);
  el.__axCountTo=target;
  if(!axEnabled()||from===target){
    node.nodeValue=pre+axFmtNum(target,dec,sep)+post;
    el.__axCountTxt=node.nodeValue;el.__axCountBusy=false;return;
  }
  var dur=Math.max(120,Math.min(260,Number(opts.duration)||AX_DUR.slow));
  var t0=0;
  el.__axCountBusy=true;
  node.nodeValue=pre+axFmtNum(from,dec,sep)+post;
  el.__axCountTxt=node.nodeValue;
  requestAnimationFrame(function step(ts){
    if(el.__axCountTok!==tok)return;     /* đã có lượt chạy mới thay thế */
    if(!t0)t0=ts;
    var p=Math.min(1,(ts-t0)/dur);
    node.nodeValue=pre+axFmtNum(p>=1?target:from+(target-from)*axEaseOut(p),dec,sep)+post;
    el.__axCountTxt=node.nodeValue;
    if(p<1)requestAnimationFrame(step);
    else el.__axCountBusy=false;
  });
}
/* Quét mọi ô số trong phạm vi, so với giá trị lần vẽ trước rồi chạy dần tới đích */
function axCountScan(scope){
  var root=scope||document,list;
  try{list=root.querySelectorAll(AX_COUNT_SEL)}catch(e){return}
  for(var i=0;i<list.length;i++){
    var el=list[i];
    if(el.closest&&el.closest(AX_COUNT_SKIP))continue;
    var key=axKeyOf(el);
    var txt=String(el.textContent||'').trim();
    var node=txt?axFirstNumberNode(el):null;
    var m=node?String(node.nodeValue).match(/-?\d+(?:[.,]\d+)?/):null;
    var val=m?Number(String(m[0]).replace(',','.')):NaN;
    /* V14.4.2 — Ô đang chạy dở: chữ trên màn hình là giá trị TẠM (0, 12, 87…).
       Nếu đúng bằng thứ hiệu ứng vừa ghi ra thì lấy ĐÍCH thật đã nhớ, nếu không
       thì tin màn hình (dữ liệu vừa được vẽ lại thật sự). Không có bước này,
       lượt quét thứ hai trong cùng một lần mở Home sẽ tưởng số liệu đổi thành 0
       và cho chạy ngược về 0 rồi đứng yên. */
    if(el.__axCountBusy&&node&&el.__axCountTxt===node.nodeValue&&isFinite(el.__axCountTo)){
      val=Number(el.__axCountTo);
    }
    /* "2h05" hay "07:30" là mốc giờ chứ không phải số đo → để nguyên, không chạy */
    if(!m||!isFinite(val)||txt.indexOf(':')>-1||/\d\s*h\s*\d/i.test(txt)){
      delete AX_STATE.counters[key];
      continue;
    }
    var prev=AX_STATE.counters[key];
    AX_STATE.counters[key]=val;
    if(prev===val||!axEnabled())continue;
    if(!axVisible(el))continue;           /* trang đang ẩn: để dành, mở trang mới chạy */
    axCount(el,val,{from:prev===undefined?0:prev});
  }
}

/* -------------------------------------------------- 4. PROGRESS ANIMATION */
/* Thanh tiến trình không hiện sẵn ở đích: luôn chạy từ mốc cũ sang mốc mới. */
function axProgressScan(scope){
  if(!axEnabled())return;
  var root=scope||document,pending=[],i,list;
  try{list=root.querySelectorAll('.bcMetric[style*="--goal-progress"]')}catch(e){list=[]}
  for(i=0;i<list.length;i++)axProgressStage(list[i],'goal',pending);
  try{list=root.querySelectorAll('.milkProgressFill,[data-ax-progress]')}catch(e){list=[]}
  for(i=0;i<list.length;i++)axProgressStage(list[i],'width',pending);
  if(!pending.length)return;
  axReflow(document.body);               /* một lần ép tính lại bố cục cho cả lô */
  requestAnimationFrame(function(){
    pending.forEach(function(job){
      if(job.el.__axProgPend)delete job.el.__axProgPend[job.mode];   /* V14.4.2 — đã tới đích */
      if(job.mode==='goal'){
        job.el.style.setProperty('--goal-progress',job.target);
        /* Đạt mục tiêu: CSS đổi sang màu hoàn thành + một nhịp phóng rất nhẹ */
        if(job.el.classList.contains('done'))axReplay(job.el,'axGoalDone');
      }else{
        job.el.style.width=job.target;
      }
    });
  });
}
/* Đặt phần tử về mốc xuất phát và xếp vào hàng đợi chạy tới đích */
function axProgressStage(el,mode,pending){
  if(!el||!axVisible(el))return;
  var goal=(mode==='goal');
  var raw=goal?el.style.getPropertyValue('--goal-progress'):el.style.width;
  /* V14.4.2 — Thanh vừa bị ghim về mốc xuất phát để chờ chạy: giá trị đọc được
     là mốc TẠM chứ không phải số liệu mới. Lấy lại đích thật đã ghi nhớ, nếu
     không lượt quét thứ hai sẽ chốt đích = 0% và thanh nằm im ở 0. */
  var pend=el.__axProgPend&&el.__axProgPend[mode];
  var target=(pend&&pend.staged===raw)?pend.target:raw;
  if(!target)return;
  var key=axKeyOf(el)+'|'+mode;
  var prev=AX_STATE.lists[key];
  AX_STATE.lists[key]=target;
  if(prev===target)return;
  var start=(prev===undefined)?(goal?'0':'0%'):prev;
  if(goal)el.style.setProperty('--goal-progress',start);else el.style.width=start;
  if(!el.__axProgPend)el.__axProgPend={};
  el.__axProgPend[mode]={target:target,staged:start};
  pending.push({el:el,mode:mode,target:target});
}

/* ------------------------------------ 5+8. TIMELINE / DANH SÁCH FADE DẦN */
function axListSignature(box){
  var kids=box.children,parts=[],i;
  for(i=0;i<kids.length&&i<40;i++)parts.push(String(kids[i].textContent||'').slice(0,24));
  return kids.length+'|'+parts.join('~');
}
/* Các dòng không hiện cùng lúc: fade + trượt lên, cách nhau 36ms */
function axStaggerList(box,opts){
  if(!box||!box.children||box.children.length<2||!axEnabled())return;
  opts=opts||{};
  var step=Math.max(20,Math.min(60,Number(opts.step)||AX_DUR.stagger));
  var max=Math.max(1,Number(opts.max)||AX_DUR.staggerMax);
  var kids=[].slice.call(box.children),i,el;
  for(i=0;i<kids.length;i++){
    el=kids[i];
    if(el.nodeType!==1)continue;
    el.classList.remove('axItemIn');
    el.style.animationDelay=(i<max)?((i*step)+'ms'):'';
  }
  axReflow(box);
  for(i=0;i<kids.length&&i<max;i++){
    if(kids[i].nodeType===1)kids[i].classList.add('axItemIn');
  }
}
function axStaggerScan(scope){
  if(!axEnabled())return;
  var root=scope||document,boxes=[];
  try{
    boxes=[].slice.call(root.querySelectorAll(AX_LIST_SEL));
    if(root.nodeType===1&&root.matches&&root.matches(AX_LIST_SEL))boxes.push(root);
  }catch(e){return}
  boxes.forEach(function(box){
    if(!box||!box.children||!box.children.length)return;
    /* Đang ẩn thì KHÔNG ghi chữ ký — để lúc mở trang hiệu ứng còn được chạy */
    if(!axVisible(box))return;
    var key=axKeyOf(box)+'|list';
    var sig=axListSignature(box);
    var prev=AX_STATE.lists[key];
    AX_STATE.lists[key]=sig;
    if(prev===sig)return;
    axStaggerList(box);
  });
}

/* -------------------------------------------------------- 6. HERO FADE */
/* Thẻ Hero được renderDashboard() dựng lại toàn bộ, nhưng mắt người chỉ nên thấy
   phần DỮ LIỆU ĐỔI nhấp nháy nhẹ — ví dụ 🟢 Đang thức → 🟣 Đang ngủ. */
function axHeroFade(){
  var dash=byId('dashboard');
  if(!dash||!axEnabled())return;
  var hero=dash.querySelector('.bcHero');
  if(!hero)return;
  var status=hero.querySelector('.bcStatus');
  var info=hero.querySelector('.bcHeroInfo');
  var feed=hero.querySelector('#bcNextFeedWrap');
  var st=status?String(status.textContent||'').trim():'';
  var inf=info?String(info.textContent||'').trim():'';
  var fd=feed?String(feed.textContent||'').trim():'';
  if(!AX_STATE.hero.init){
    AX_STATE.hero.init=true;
    AX_STATE.hero.status=st;AX_STATE.hero.info=inf;AX_STATE.hero.feed=fd;
    axSwap(hero);
    return;
  }
  if(st!==AX_STATE.hero.status){AX_STATE.hero.status=st;axSwap(status)}
  if(inf!==AX_STATE.hero.info){AX_STATE.hero.info=inf;axSwap(info)}
  if(fd!==AX_STATE.hero.feed){AX_STATE.hero.feed=fd;axSwap(feed)}
}

/* --------------------------------------------------- 7. CHUYỂN MÀN HÌNH */
function axPageTransition(id){
  var page=byId(id);
  if(!page)return;
  if(axEnabled()){
    axReplay(page,'axPageIn');
    if(AX_STATE.pageTimer)clearTimeout(AX_STATE.pageTimer);
    AX_STATE.pageTimer=setTimeout(function(){page.classList.remove('axPageIn')},AX_DUR.slow+90);
  }
  axAfterRender(page);
}

/* ------------------------------------------------- 8. SKELETON LOADING */
function axSkeleton(target,kind){
  if(!target||!axEnabled())return null;
  axSkeletonClear(target,true);
  var rows=(kind==='stat')?['h','g','r','r']:(kind==='card'?['h','c','c']:['h','r','r','r']);
  var html='';
  rows.forEach(function(r){
    if(r==='h')html+='<div class="axSkel axSkelHead"></div>';
    else if(r==='g')html+='<div class="axSkelGrid"><i class="axSkel"></i><i class="axSkel"></i><i class="axSkel"></i></div>';
    else if(r==='c')html+='<div class="axSkel axSkelCard"></div>';
    else html+='<div class="axSkel axSkelRow"></div>';
  });
  var box=document.createElement('div');
  box.className='axSkeletonBox';
  box.setAttribute('aria-hidden','true');
  box.innerHTML=html;
  target.classList.add('axSkeletonHost');
  target.appendChild(box);
  return box;
}
function axSkeletonClear(target,instant){
  var hosts=target?[target]:[].slice.call(document.querySelectorAll('.axSkeletonHost'));
  hosts.forEach(function(host){
    if(!host)return;
    [].slice.call(host.children).forEach(function(k){
      if(!k.classList||!k.classList.contains('axSkeletonBox'))return;
      if(instant){if(k.parentNode)k.parentNode.removeChild(k);return}
      k.classList.add('axSkeletonOut');
      setTimeout(function(){if(k.parentNode)k.parentNode.removeChild(k)},AX_DUR.fast+40);
    });
    setTimeout(function(){
      if(!host.querySelector('.axSkeletonBox'))host.classList.remove('axSkeletonHost');
    },instant?0:AX_DUR.fast+70);
  });
}

/* ----------------------------- 9. POPUP: mở spring, đóng fade + trượt xuống */
function axOverlayMode(el){return (el.getAttribute&&el.getAttribute('data-ax-mode'))||'show'}
function axOverlayOpen(el){
  var mode=axOverlayMode(el);
  if(mode==='hidden')return !el.classList.contains('hidden');
  if(mode==='open')return el.classList.contains('open');
  return el.classList.contains('show');
}
/* Khung nội dung của popup = con trực tiếp cuối cùng không phải lớp phủ mờ */
function axTagOverlayCard(el){
  if(AX_OVERLAY_PLAIN[el.id])return;
  var kids=el.children,card=null,i;
  for(i=0;i<kids.length;i++){
    if(/scrim|backdrop/i.test(String(kids[i].className||'')))continue;
    card=kids[i];
  }
  if(!card)return;
  card.classList.add('axCard');
  var bottom=false;
  try{bottom=getComputedStyle(el).alignItems==='flex-end'}catch(e){}
  if(bottom)card.classList.add('axSheetCard');   /* bottom sheet → trượt từ dưới lên */
}
function axRegisterOverlay(el,mode){
  if(!el||el.__axReg)return;
  el.__axReg=true;
  el.classList.add('axOverlay');
  if(mode&&mode!=='show')el.setAttribute('data-ax-mode',mode);
  axTagOverlayCard(el);
  if(axOverlayOpen(el))el.classList.add('axOpen');
  try{
    var obs=new MutationObserver(function(){axOverlaySync(el)});
    obs.observe(el,{attributes:true,attributeFilter:['class']});
  }catch(e){}
}
/* CHỈ ĐỌC class của app (show / hidden / open) và CHỈ GHI class của riêng mình
   (axOpen / axClosing) → không đụng logic cũ, không thể tự kích hoạt vòng lặp.
   Khi đóng, CSS giữ khung hiển thị thêm đúng 190ms để chạy hết hiệu ứng, đồng
   thời đặt pointer-events:none nên bộ khoá cuộn nền coi như đã đóng ngay. */
function axOverlaySync(el){
  var open=axOverlayOpen(el);
  var marked=el.classList.contains('axOpen');
  var closing=el.classList.contains('axClosing');
  if(open){
    if(el.__axTimer){clearTimeout(el.__axTimer);el.__axTimer=null}
    if(closing){                          /* người dùng mở lại khi chưa đóng xong */
      el.classList.remove('axClosing');
      el.classList.remove('axOpen');axReflow(el);el.classList.add('axOpen');
      return;
    }
    if(!marked)el.classList.add('axOpen');
    return;
  }
  if(!marked||closing)return;
  if(!axEnabled()){el.classList.remove('axOpen');return}
  el.classList.add('axClosing');
  el.__axTimer=setTimeout(function(){
    el.__axTimer=null;
    el.classList.remove('axClosing');
    el.classList.remove('axOpen');
  },AX_DUR.exit);
}
function axModalWatch(){
  AX_OVERLAYS.forEach(function(cfg){axRegisterOverlay(byId(cfg[0]),cfg[1])});
  /* Hộp thoại Sổ sức khỏe 2.0 chỉ được tạo lúc dùng → theo dõi để đăng ký thêm */
  try{
    var obs=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var added=muts[i].addedNodes;
        for(var j=0;j<added.length;j++){
          var n=added[j];
          if(!n||n.nodeType!==1||!n.id)continue;
          for(var k=0;k<AX_OVERLAYS.length;k++){
            if(AX_OVERLAYS[k][0]===n.id)axRegisterOverlay(n,AX_OVERLAYS[k][1]);
          }
        }
      }
    });
    obs.observe(document.body,{childList:true});
  }catch(e){}
}

/* ---------------------------------------------------------- 10. NÚT BẤM */
function axBtnLoading(btn,on){
  if(typeof btn==='string')btn=byId(btn);
  if(!btn)return;
  if(on===false){btn.classList.remove('axBtnLoading');btn.disabled=false;return}
  btn.classList.remove('axBtnDone');
  btn.classList.add('axBtnLoading');
  btn.disabled=true;
}
function axBtnSuccess(btn,keepMs){
  if(typeof btn==='string')btn=byId(btn);
  if(!btn)return;
  btn.classList.remove('axBtnLoading');
  btn.disabled=false;
  axHaptic('success');
  if(!axEnabled())return;
  axReplay(btn,'axBtnDone');
  setTimeout(function(){btn.classList.remove('axBtnDone')},Math.max(400,Number(keepMs)||900));
}

/* --------------------------------------------- 11. Chạy sau mỗi lần vẽ lại */
/* render() gọi hàng chục hàm vẽ con. Gom hết vào MỘT lượt quét chạy ở cuối tác
   vụ (microtask) — vẫn trước khi trình duyệt vẽ ra màn hình nên không chớp. */
function axAfterRender(scope){
  if(!AX_STATE.booted)return;
  var root=(scope&&scope.querySelectorAll)?scope:document;
  if(AX_STATE.queue.indexOf(root)<0)AX_STATE.queue.push(root);
  if(AX_STATE.flush)return;
  AX_STATE.flush=true;
  var run=function(){
    AX_STATE.flush=false;
    var roots=AX_STATE.queue;AX_STATE.queue=[];
    if(roots.indexOf(document)>=0)roots=[document];
    roots.forEach(function(r){
      try{axCountScan(r)}catch(e){}
      try{axProgressScan(r)}catch(e){}
      try{axStaggerScan(r)}catch(e){}
    });
  };
  try{Promise.resolve().then(run)}catch(e){setTimeout(run,0)}
}

/* --------------------------- 12. Điều hướng: bỏ spinner phủ kín, dùng Skeleton */
function axShowPage(id,el,skipLoading){
  if(!axEnabled())return AX_ORIG.showPage(id,el,skipLoading);
  var navClick=(typeof isModuleNavClick==='function')&&isModuleNavClick(el);
  var kind=AX_HEAVY_PAGES[id];
  var page=byId(id);
  if(!navClick||skipLoading||!kind||!page){doShowPage(id,el);return}
  /* Hiện khung xương TRƯỚC, dựng nội dung ở khung hình kế tiếp: người dùng có
     phản hồi sau ~2 khung hình thay vì chờ 500ms spinner như bản cũ. */
  if(typeof hideAppLoading==='function')hideAppLoading();
  document.querySelectorAll('.page').forEach(function(p){p.classList.add('hidden')});
  page.classList.remove('hidden');
  axSkeleton(page,kind);
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    try{doShowPage(id,el)}
    finally{setTimeout(function(){axSkeletonClear(page)},120)}
  })});
}

/* --------------------------- 12b. NHẤN (press) đúng block + huỷ khi cuộn */
/* Danh sách block cha (matching AX_PRESS_SEL) tính từ phần tử được nhấn trở lên */
function axPressAncestors(el){
  var out=[],n=el&&el.parentElement;
  while(n&&n.nodeType===1){
    try{if(n.matches&&n.matches(AX_PRESS_SEL))out.push(n)}catch(e){}
    n=n.parentElement;
  }
  return out;
}
function axPressApply(){
  var el=AX_PRESS.el;
  if(!el||!axEnabled())return;
  el.classList.add('axPressing');
  AX_PRESS.hosts=axPressAncestors(el);
  for(var i=0;i<AX_PRESS.hosts.length;i++)AX_PRESS.hosts[i].classList.add('axPressHost');
  AX_PRESS.applied=true;AX_PRESS.appliedAt=Date.now();
}
function axPressClear(){
  var el=AX_PRESS.el;
  if(el)el.classList.remove('axPressing');
  if(AX_PRESS.hosts){for(var i=0;i<AX_PRESS.hosts.length;i++)AX_PRESS.hosts[i].classList.remove('axPressHost')}
  AX_PRESS.hosts=null;
}
/* Gỡ hiệu ứng nhấn, nhưng nếu vừa hiện thì giữ đủ 140ms cho mắt thấy rồi mới thả */
function axPressRelease(){
  if(AX_PRESS.timer){clearTimeout(AX_PRESS.timer);AX_PRESS.timer=null}
  if(!AX_PRESS.applied){axPressClear();axPressReset();return}
  var wait=Math.max(0,AX_PRESS_MINVIS-(Date.now()-AX_PRESS.appliedAt));
  var el=AX_PRESS.el,hosts=AX_PRESS.hosts;
  setTimeout(function(){
    if(el)el.classList.remove('axPressing');
    if(hosts)for(var i=0;i<hosts.length;i++)hosts[i].classList.remove('axPressHost');
  },wait);
  axPressReset();
}
/* Chỉ dọn phần "press thẻ"; KHÔNG đụng cờ cử chỉ (moved/tracking) — chúng do
   pointerdown/move/scroll quản để pointerup còn biết đây là CHẠM hay CUỘN. */
function axPressReset(){
  AX_PRESS.el=null;AX_PRESS.applied=false;AX_PRESS.active=false;AX_PRESS.hosts=null;
  if(AX_PRESS.timer){clearTimeout(AX_PRESS.timer);AX_PRESS.timer=null}
}
function axPressInit(){
  if(AX_PRESS.inited)return;AX_PRESS.inited=true;
  var opt={passive:true};   /* KHÔNG bao giờ preventDefault → không cản cuộn/vuốt */
  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    axPressReset();
    /* Theo dõi cử chỉ cho MỌI điểm chạm (kể cả nút) để pointerup còn rung được */
    AX_PRESS.x=e.clientX;AX_PRESS.y=e.clientY;AX_PRESS.moved=false;AX_PRESS.tracking=true;
    /* Press thẻ chỉ khi hiệu ứng đang bật và chạm vào block (không phải nút/ô nhập) */
    if(!axEnabled())return;
    var t=e.target;
    if(t&&t.closest&&t.closest(AX_PRESS_SKIP))return;   /* nút/ô nhập/vùng vuốt tự lo */
    var el=t&&t.closest?t.closest(AX_PRESS_SEL):null;    /* block gần điểm chạm nhất */
    if(!el)return;
    AX_PRESS.el=el;AX_PRESS.active=true;
    /* Chờ một nhịp: đứng yên → là CHẠM, mới hiện nhấn. Di chuyển (cuộn) → huỷ. */
    AX_PRESS.timer=setTimeout(function(){AX_PRESS.timer=null;if(AX_PRESS.active&&!AX_PRESS.moved)axPressApply()},AX_PRESS_DELAY);
  },opt);
  document.addEventListener('pointermove',function(e){
    if(!AX_PRESS.tracking||AX_PRESS.moved)return;
    var dx=e.clientX-AX_PRESS.x,dy=e.clientY-AX_PRESS.y;
    if(dx*dx+dy*dy>AX_PRESS_MOVE*AX_PRESS_MOVE){    /* bắt đầu cuộn → coi như CUỘN */
      AX_PRESS.moved=true;AX_PRESS.tracking=false;  /* pointerup sẽ KHÔNG rung, KHÔNG nhấn */
      if(AX_PRESS.timer){clearTimeout(AX_PRESS.timer);AX_PRESS.timer=null}
      if(AX_PRESS.applied)axPressClear();
      axPressReset();
    }
  },opt);
  document.addEventListener('pointerup',function(e){
    var tapped=AX_PRESS.tracking&&!AX_PRESS.moved;
    if(tapped){
      /* CHẠM thật (không cuộn): rung nhẹ ngay trong cử chỉ pointerup → đáng tin
         trên Android. axHaptic tự gate theo thiết lập rung (độc lập với hiệu ứng);
         iOS Safari không hỗ trợ rung thì im lặng bỏ qua. */
      var tgt=e&&e.target&&e.target.closest?e.target.closest(AX_TAP_SEL):null;
      if(tgt)axHaptic('light');
      if(AX_PRESS.active&&!AX_PRESS.applied&&axEnabled())axPressApply();  /* chạm nhanh vẫn thấy nhấn */
    }
    AX_PRESS.tracking=false;
    axPressRelease();
  },opt);
  document.addEventListener('pointercancel',function(){AX_PRESS.tracking=false;AX_PRESS.moved=true;if(AX_PRESS.applied)axPressClear();axPressReset()},opt);
  window.addEventListener('scroll',function(){        /* lỡ cuộn kiểu khác → dọn sạch, không rung */
    if(!AX_PRESS.tracking)return;
    AX_PRESS.moved=true;AX_PRESS.tracking=false;
    if(AX_PRESS.applied)axPressClear();
    axPressReset();
  },opt);
}

/* --------------------------- 12c. Chạy LẠI hiệu ứng số + thanh của Dashboard */
/* Mỗi khi mở Dashboard (và sau khi splash tắt lúc mở app): xoá mốc đã nhớ để
   con số và thanh tiến trình chạy lại từ 0 → giá trị hiện tại. */
function axResetDashState(scope){
  if(!scope)return;
  var i,list;
  try{list=scope.querySelectorAll(AX_COUNT_SEL)}catch(e){list=[]}
  for(i=0;i<list.length;i++){var k=axKeyOf(list[i]);if(k)delete AX_STATE.counters[k]}
  try{list=scope.querySelectorAll('.bcMetric[style*="--goal-progress"],.milkProgressFill,[data-ax-progress]')}catch(e){list=[]}
  for(i=0;i<list.length;i++){var kk=axKeyOf(list[i]);delete AX_STATE.lists[kk+'|goal'];delete AX_STATE.lists[kk+'|width']}
}
function axReplayDashboard(){
  if(!axEnabled())return;
  var now=Date.now();
  if(now-AX_PRESS.lastReplay<300)return;   /* tránh chạy trùng khi nhiều nguồn gọi cùng lúc */
  var dash=byId('dashboard');
  if(!dash||!axVisible(dash))return;
  AX_PRESS.lastReplay=now;
  axResetDashState(dash);
  requestAnimationFrame(function(){
    try{axCountScan(dash)}catch(e){}
    try{axProgressScan(dash)}catch(e){}
  });
}

/* ------------------------------------------------------------ 13. Khởi động */
function axInit(){
  if(AX_STATE.booted)return;
  AX_STATE.booted=true;
  axApplyMode();
  axModalWatch();
  axPressInit();   /* V14.4.0 — nhấn đúng block + huỷ khi cuộn + rung khi chạm */

  /* V14.4.0 — Mỗi lần trang Home hiện lại (điều hướng về Dashboard): chạy lại
     hiệu ứng số + thanh tiến trình từ 0. */
  try{
    var home=byId('home');
    if(home){
      var ho=new MutationObserver(function(){
        if(!home.classList.contains('hidden'))axReplayDashboard();
      });
      ho.observe(home,{attributes:true,attributeFilter:['class']});
    }
  }catch(e){}
  /* Lần mở app đầu tiên Dashboard đã hiện sẵn (không có mutation) và bị splash
     che 1 giây — chạy lại NGAY sau khi splash tắt để không phí hiệu ứng. */
  try{
    var sp=byId('splashScreen');
    if(sp&&!sp.classList.contains('hide')){
      var so=new MutationObserver(function(){
        if(sp.classList.contains('hide')){so.disconnect();setTimeout(axReplayDashboard,80)}
      });
      so.observe(sp,{attributes:true,attributeFilter:['class']});
    }else{
      setTimeout(axReplayDashboard,80);
    }
  }catch(e){setTimeout(axReplayDashboard,80)}

  /* --- Bọc các hàm vẽ: mã nguồn hàm gốc không đổi một ký tự nào --- */
  axWrap('doShowPage',function(id){axPageTransition(id)});
  axWrap('render',function(){axHeroFade();axAfterRender(document)});
  axWrap('renderDashboard',function(){axHeroFade();axAfterRender(byId('dashboard'))});
  ['renderCareTimeline','renderCareStats','renderCareStatDetail','renderMilestoneTimeline',
   'renderMonthlyJourney','renderStatsCompare','renderYearSummary','renderAppointmentList',
   'renderAppointmentCalendar','renderMilkInventory','renderMilkBagPickerList',
   'renderNotificationCenterBody','renderStreakSheet','renderAppointmentTypes',
   'renderMilkContainers','hb2Render','renderWhoGrowth'].forEach(function(fn){
    axWrap(fn,function(){axAfterRender(document)});
  });

  /* --- Điều hướng --- */
  if(typeof window.showPage==='function'&&!AX_ORIG.showPage){
    AX_ORIG.showPage=window.showPage;
    window.showPage=axShowPage;
  }

  /* --- Haptic: gắn vào các mốc phản hồi có sẵn, không đổi hành vi --- */
  ['deleteCareEvent','delAppointment','delAppointmentType','cancelMilkBag',
   'deleteMilestoneFromDetail','deleteCareRecordFromDetail'].forEach(function(fn){
    axWrap(fn,null,function(){axHaptic('remove')});
  });
  axWrap('udUndo',null,function(){axHaptic('undo')});
  axWrap('showToast',null,function(message,type){
    var t=type||'success';
    axHaptic(t==='error'?'error':(t==='warn'?'warn':'success'));
  });

  /* Máy đổi thiết lập "Giảm chuyển động" giữa chừng → cập nhật ngay */
  try{
    var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq&&mq.addEventListener)mq.addEventListener('change',axApplyMode);
    else if(mq&&mq.addListener)mq.addListener(axApplyMode);
  }catch(e){}

  /* Lần vẽ đầu tiên có thể đã chạy trước khi gắn wrapper → quét bù một lượt */
  setTimeout(function(){axApplyMode();axAfterRender(document);axHeroFade()},0);
}
if(document.body)axInit();
else document.addEventListener('DOMContentLoaded',axInit);

/* ============================================================================
   🌊 V14.5.0 · FLUID MOTION (phần điều khiển)
   Toàn bộ là hàm MỚI tiền tố "ax5" + một chỗ ĐẤU NỐI duy nhất: thay biến toàn
   cục axOverlaySync bằng bản có thêm bước chuẩn bị điểm phóng. Thân hàm gốc
   axOverlaySync() KHÔNG bị sửa một ký tự nào (hash Baseline Lock giữ nguyên) —
   bản mới gọi lại chính nó qua AX5.baseSync.
   ============================================================================ */
var AX5={tap:{x:0,y:0,t:0},baseSync:null,baseShowPage:null,drag:null,busyTimer:null,inited:false};
var AX5_DRAG_HANDLE=76;   /* chỉ vùng 76px trên cùng của sheet mới kéo được */
var AX5_DRAG_CLOSE=104;   /* kéo quá 104px → đóng */
var AX5_FLICK=0.55;       /* hoặc hất xuống nhanh hơn 0.55 px/ms → đóng */

/* ------------------------------------------------ 1. Nhớ điểm chạm gần nhất */
function ax5RememberTap(x,y){
  if(typeof x!=='number'||typeof y!=='number')return;
  AX5.tap={x:x,y:y,t:Date.now()};
}
function ax5TapInit(){
  var opt={passive:true,capture:true};
  document.addEventListener('pointerdown',function(e){ax5RememberTap(e.clientX,e.clientY)},opt);
  document.addEventListener('touchstart',function(e){
    var t=e&&e.touches&&e.touches[0];if(t)ax5RememberTap(t.clientX,t.clientY);
  },opt);
  /* Bấm bằng bàn phím / gọi bằng mã: dùng tâm của phần tử được kích hoạt */
  document.addEventListener('keyup',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var el=document.activeElement;if(!el||!el.getBoundingClientRect)return;
    var r=el.getBoundingClientRect();ax5RememberTap(r.left+r.width/2,r.top+r.height/2);
  },{passive:true});
}

/* --------------------------------------- 2. Khung popup của một lớp phủ */
function ax5CardOf(el){
  if(!el||!el.children)return null;
  for(var i=el.children.length-1;i>=0;i--){
    if(el.children[i].classList&&el.children[i].classList.contains('axCard'))return el.children[i];
  }
  return null;
}

/* ---------------------- 3. Chuẩn bị "phóng ra từ đúng chỗ ngón tay chạm" */
function ax5PrepareZoom(el){
  var card=ax5CardOf(el);
  if(!card)return;
  ax5Busy();
  if(card.classList.contains('axSheetCard')){ax5AddGrip(card);return}
  if(!axEnabled()){card.classList.remove('axZoom');return}
  var r;try{r=card.getBoundingClientRect()}catch(e){return}
  if(!r||!r.width||!r.height)return;
  var fresh=(Date.now()-AX5.tap.t)<2500;
  var ox=fresh?(AX5.tap.x-r.left):r.width/2;
  var oy=fresh?(AX5.tap.y-r.top):r.height/2;
  /* Điểm chạm có thể nằm ngoài khung popup (bấm ở đáy màn hình, popup ở giữa):
     cho phép lệch ra ngoài một khoảng vừa phải để hướng phóng vẫn đúng mà
     không tạo cảm giác văng quá xa. */
  var padX=r.width*0.85,padY=r.height*0.85;
  ox=Math.max(-padX,Math.min(r.width+padX,ox));
  oy=Math.max(-padY,Math.min(r.height+padY,oy));
  card.style.setProperty('--ax-ox',ox.toFixed(1)+'px');
  card.style.setProperty('--ax-oy',oy.toFixed(1)+'px');
  card.classList.add('axZoom');
}
/* Thanh nắm kéo cho bottom sheet (chỉ thêm một lần cho mỗi sheet) */
function ax5AddGrip(card){
  if(!card||card.__ax5Grip)return;
  card.__ax5Grip=true;
  var g=document.createElement('span');
  g.className='axGrip';g.setAttribute('aria-hidden','true');
  card.insertBefore(g,card.firstChild);
  card.classList.add('axHasGrip');
}
/* Cờ "đang có chuyển động lớn" → tạm dừng animation lặp cho đỡ giật */
function ax5Busy(){
  try{document.body.classList.add('axBusy')}catch(e){}
  if(AX5.busyTimer)clearTimeout(AX5.busyTimer);
  AX5.busyTimer=setTimeout(function(){
    AX5.busyTimer=null;
    try{document.body.classList.remove('axBusy')}catch(e){}
  },460);
}

/* --------------------------------- 4. Đóng một lớp phủ theo đúng cách của app */
function ax5CloseOverlay(el){
  if(!el)return;
  var attr=el.getAttribute&&el.getAttribute('onclick');
  if(attr&&/close|Close/.test(attr)){try{el.click();return}catch(e){}}
  var btn=el.querySelector&&el.querySelector('.closeBtn,[data-ax-close]');
  if(btn){try{btn.click();return}catch(e){}}
  try{el.click()}catch(e){}
}

/* ------------------------- 5. Kéo bottom sheet xuống để đóng (như sheet iOS) */
function ax5DragInit(){
  var opt={passive:true};
  document.addEventListener('pointerdown',function(e){
    AX5.drag=null;
    if(!axEnabled())return;
    var t=e.target;
    if(!t||!t.closest)return;
    if(t.closest('button,a,input,select,textarea'))return;
    var card=t.closest('.axSheetCard');
    if(!card)return;
    var overlay=card.parentElement;
    if(!overlay||!overlay.classList.contains('axOpen')||overlay.classList.contains('axClosing'))return;
    var r=card.getBoundingClientRect();
    /* Chỉ kéo từ vùng đầu sheet (thanh nắm/tiêu đề) → không cướp thao tác cuộn */
    if(e.clientY-r.top>AX5_DRAG_HANDLE)return;
    AX5.drag={card:card,overlay:overlay,y0:e.clientY,y:e.clientY,t0:Date.now(),tLast:Date.now(),dy:0,v:0,on:false,h:r.height||1};
  },opt);
  document.addEventListener('pointermove',function(e){
    var d=AX5.drag;if(!d)return;
    var dy=e.clientY-d.y0;
    if(!d.on){
      if(dy<6)return;                 /* chưa rõ ý định → chưa cầm lái */
      d.on=true;
      d.card.classList.add('axDragging');
      d.overlay.classList.add('axDragScrim');   /* tắt animation của lớp phủ để tay cầm lái */
    }
    var now=Date.now(),dt=Math.max(1,now-d.tLast);
    d.v=(e.clientY-d.y)/dt;d.y=e.clientY;d.tLast=now;
    d.dy=Math.max(0,dy);
    /* Kéo lên thì có sức cản như iOS: đi được rất ít */
    var shown=d.dy>0?d.dy:dy*0.18;
    /* Animation của CSS "đè" được cả inline style, nên phải ghi kèm !important
       trong lúc ngón tay đang cầm lái. */
    d.card.style.setProperty('transform','translate3d(0,'+shown.toFixed(1)+'px,0)','important');
    d.overlay.style.setProperty('opacity',String(Math.max(.25,1-(d.dy/(d.h*1.15)))),'important');
  },opt);
  function end(){
    var d=AX5.drag;AX5.drag=null;
    if(!d||!d.on)return;
    d.card.classList.remove('axDragging');
    var close=(d.dy>AX5_DRAG_CLOSE)||(d.v>AX5_FLICK&&d.dy>28);
    if(close){
      ax5Busy();
      d.card.classList.add('axDragSettle');
      d.card.style.setProperty('transform','translate3d(0,101%,0)','important');
      d.overlay.style.setProperty('transition','opacity var(--ax-sheet-out) var(--ax-exit)','important');
      d.overlay.style.setProperty('opacity','0','important');
      try{axHaptic('light')}catch(e){}
      setTimeout(function(){
        ax5CloseOverlay(d.overlay);
        setTimeout(function(){ax5ResetDragStyle(d)},260);
      },170);
    }else{
      d.card.classList.add('axDragSettle');
      d.card.style.setProperty('transform','translate3d(0,0,0)','important');
      d.overlay.style.setProperty('transition','opacity var(--ax-base) var(--ax-glide)','important');
      d.overlay.style.setProperty('opacity','1','important');
      setTimeout(function(){ax5ResetDragStyle(d)},280);
    }
  }
  document.addEventListener('pointerup',end,opt);
  document.addEventListener('pointercancel',end,opt);
}
function ax5ResetDragStyle(d){
  if(!d)return;
  d.card.classList.remove('axDragSettle');
  d.card.classList.remove('axDragging');
  d.card.style.removeProperty('transform');
  d.overlay.classList.remove('axDragScrim');
  d.overlay.style.removeProperty('transition');
  d.overlay.style.removeProperty('opacity');
}

/* --------------- 5b. Mở TRANG chức năng: phóng từ điểm chạm ra toàn màn hình */
function ax5PageZoom(id){
  var page=byId(id);
  if(!page||!axEnabled())return;
  var fresh=(Date.now()-AX5.tap.t)<1200;   /* chỉ khi vừa do người dùng chạm */
  if(!fresh){page.classList.remove('axPageZoom');return}
  var r;try{r=page.getBoundingClientRect()}catch(e){return}
  if(!r||!r.width){page.classList.remove('axPageZoom');return}
  var ox=AX5.tap.x-r.left;
  var oy=Math.max(0,Math.min(window.innerHeight,AX5.tap.y)-r.top);
  page.style.setProperty('--ax-ox',ox.toFixed(1)+'px');
  page.style.setProperty('--ax-oy',oy.toFixed(1)+'px');
  page.classList.add('axPageZoom');
}

/* ------------------------------------------------------- 6. Đấu nối & khởi động */
function ax5Init(){
  if(AX5.inited)return;AX5.inited=true;
  ax5TapInit();
  ax5DragInit();
  /* Bọc bộ đồng bộ lớp phủ: chuẩn bị điểm phóng NGAY TRƯỚC khi hiệu ứng chạy */
  if(typeof axOverlaySync==='function'&&!AX5.baseSync){
    AX5.baseSync=axOverlaySync;
    axOverlaySync=function(el){
      try{
        if(el&&typeof axOverlayOpen==='function'&&axOverlayOpen(el)&&!el.classList.contains('axOpen'))ax5PrepareZoom(el);
        else if(el&&el.classList.contains('axOpen'))ax5Busy();
      }catch(e){}
      return AX5.baseSync(el);
    };
  }
  /* Sheet/popup đã đăng ký từ trước khi mô-đun này chạy → gắn thanh nắm sẵn */
  try{
    (AX_OVERLAYS||[]).forEach(function(cfg){
      var el=byId(cfg[0]);if(!el)return;
      var card=ax5CardOf(el);
      if(card&&card.classList.contains('axSheetCard'))ax5AddGrip(card);
    });
  }catch(e){}
  /* Chuyển trang: cũng phóng ra từ đúng chỗ vừa chạm (mở chức năng toàn màn hình
     giống mở app trên iOS), đồng thời tạm dừng animation lặp cho đỡ giật. */
  /* axWrap() chỉ cho bọc MỘT lần cho mỗi hàm (doShowPage đã bị axInit bọc rồi),
     nên ở đây bọc thêm một lớp ngoài, giữ nguyên chuỗi gọi có sẵn bên trong. */
  try{
    if(typeof window.doShowPage==='function'&&!AX5.baseShowPage){
      AX5.baseShowPage=window.doShowPage;
      window.doShowPage=function(id){
        var r=AX5.baseShowPage.apply(this,arguments);
        try{ax5Busy();ax5PageZoom(id)}catch(e){}
        return r;
      };
    }
  }catch(e){}
}
if(document.body)setTimeout(ax5Init,0);
else document.addEventListener('DOMContentLoaded',function(){setTimeout(ax5Init,0)});

/* ============================================================================
   🩹 V14.6.0 · (1) Gợi ý ml khi bé bú · (2) Dung lượng App/DB · (3) Sửa lỗi
   treo/đứng màn hình khi mở chức năng từ nút "Thêm" trên thanh dưới.

   Nguyên tắc như các bản trước: TẤT CẢ đều là hàm MỚI (tiền tố fq6* / st6*
   / nv6*). Không sửa một ký tự nào trong thân các hàm cũ — chỗ nào cần đổi
   hành vi thì BỌC (wrap) lại đúng cách axWrap()/ax5* đang dùng, nên Baseline
   Lock giữ nguyên toàn bộ hash.
   ============================================================================ */

/* ==========================================================================
   1️⃣  BÉ BÚ — ô ml có nút −/＋ và dãy "Gợi ý nhanh" giống màn Hút sữa
   ========================================================================== */
var FEED_AMOUNT_PRESETS=[60,80,100,120,150,180,200];
var FQ6_STEP=10;
var FQ6={inited:false};

function fq6CurrentAmount(){
  var el=byId('cAmount');var n=Number((el&&el.value)||0);
  return isFinite(n)&&n>0?Math.round(n):0;
}
/* Ghi số ml vào đúng ô cũ rồi phát sự kiện input → mọi logic sẵn có
   (abOnAmountInput → tự gắn túi sữa, tính tổng…) chạy y như người dùng gõ tay. */
function fq6SetAmount(v){
  var el=byId('cAmount');if(!el)return;
  var n=Math.max(0,Math.round(Number(v)||0));
  el.value=n?String(n):'';
  var fired=false;
  try{el.dispatchEvent(new Event('input',{bubbles:true}));fired=true}catch(e){}
  if(!fired&&typeof abOnAmountInput==='function'){try{abOnAmountInput()}catch(e){}}
  fq6Sync();
  try{if(typeof abOnManualEdit==='function'&&n>0)abOnManualEdit()}catch(e){}
  try{axHaptic('light')}catch(e){}
}
function fq6StepAmount(delta){fq6SetAmount(fq6CurrentAmount()+(Number(delta)||0))}
function fq6Sync(){
  var box=byId('fq6Presets');if(!box)return;
  var v=fq6CurrentAmount();
  box.querySelectorAll('.fq6Preset').forEach(function(b){
    b.classList.toggle('active',Number(b.getAttribute('data-ml'))===v&&v>0);
  });
  var minus=byId('fq6Minus');if(minus)minus.disabled=(v<=0);
}
/* Dựng lại ô "Số lượng ml" của Bé bú thành khối −/số/＋ + gợi ý nhanh.
   Ô input vẫn là #cAmount cũ (chỉ được DI CHUYỂN vào khung mới), nên
   getCareEventFromForm()/fillCareEditForm() không đổi gì. */
function fq6Mount(){
  var input=byId('cAmount');if(!input)return;
  if((window.__careSelectedType||'feed')!=='feed')return;
  if(byId('fq6Presets'))return;
  var field=input.parentNode;if(!field)return;

  var wrap=document.createElement('div');
  wrap.className='fq6Amount';
  field.insertBefore(wrap,input);

  var minus=document.createElement('button');
  minus.type='button';minus.id='fq6Minus';minus.className='fq6Step';
  minus.setAttribute('aria-label','Giảm '+FQ6_STEP+' ml');minus.textContent='−';
  minus.onclick=function(){fq6StepAmount(-FQ6_STEP)};

  var plus=document.createElement('button');
  plus.type='button';plus.className='fq6Step fq6Plus';
  plus.setAttribute('aria-label','Tăng '+FQ6_STEP+' ml');plus.textContent='＋';
  plus.onclick=function(){fq6StepAmount(FQ6_STEP)};

  var unit=document.createElement('span');
  unit.className='fq6Unit';unit.textContent='ml';

  wrap.appendChild(minus);
  wrap.appendChild(input);          /* di chuyển chính ô cũ vào khung mới */
  wrap.appendChild(unit);
  wrap.appendChild(plus);

  var presets=document.createElement('div');
  presets.className='fq6Presets';presets.id='fq6Presets';
  var lbl=document.createElement('span');
  lbl.className='fq6PresetLabel';lbl.textContent='Gợi ý nhanh';
  presets.appendChild(lbl);
  FEED_AMOUNT_PRESETS.forEach(function(v){
    var b=document.createElement('button');
    b.type='button';b.className='fq6Preset';b.setAttribute('data-ml',String(v));
    b.textContent=v+' ml';
    b.onclick=function(){fq6SetAmount(v)};
    presets.appendChild(b);
  });
  field.insertBefore(presets,wrap.nextSibling);

  if(!input.__fq6Bound){
    input.__fq6Bound=true;
    input.addEventListener('input',function(){fq6Sync()});
  }
  fq6Sync();
}

/* ==========================================================================
   2️⃣  DUNG LƯỢNG — App (bộ nhớ đệm) · Dữ liệu (localStorage) · Backup (IndexedDB)
   ========================================================================== */
var ST6={busy:false,lastAt:0};

function st6Bytes(str){try{return new Blob([String(str==null?'':str)]).size}catch(e){return String(str||'').length*2}}
function st6Fmt(n){
  n=Number(n)||0;
  if(n<1024)return n+' B';
  if(n<1048576)return (n/1024).toFixed(1).replace('.',',')+' KB';
  if(n<1073741824)return (n/1048576).toFixed(2).replace('.',',')+' MB';
  return (n/1073741824).toFixed(2).replace('.',',')+' GB';
}
/* Dữ liệu chính + mọi khoá phụ trong localStorage */
function st6LocalUsage(){
  var main=0,other=0,keys=0,raw='';
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);if(k===null)continue;
      var v=localStorage.getItem(k)||'';
      var size=st6Bytes(k)+st6Bytes(v);
      keys++;
      if(k===KEY){main=size;raw=v}else other+=size;
    }
  }catch(e){}
  return {main:main,other:other,keys:keys,raw:raw};
}
/* Chia nhỏ dữ liệu chính theo từng nhóm để biết cái gì đang chiếm chỗ */
function st6DbBreakdown(raw){
  var rows=[];
  var LABEL={careEvents:'🍼 Ghi nhận chăm sóc',milkInventory:'🧊 Kho sữa',milestones:'🏆 Cột mốc / ảnh',
    healthBook2:'🩺 Sổ sức khỏe 2.0',healthBook:'🩺 Sổ sức khỏe (bản cũ)',settings:'⚙️ Thiết lập / ảnh đại diện',
    appointments:'📅 Lịch khám',pregnancy:'🤰 Chỉ số thai kỳ',baby:'👶 Chỉ số của bé',
    noiseLogs:'🔊 Nhật ký tiếng ồn',luxLogs:'💡 Nhật ký ánh sáng',diary:'📓 Nhật ký (bản cũ)',
    mom:'💗 Sức khỏe mẹ (bản cũ)',monthlyNotes:'🗓 Ghi chú theo tháng'};
  var db;try{db=JSON.parse(raw||'{}')}catch(e){return rows}
  Object.keys(db||{}).forEach(function(k){
    var size=st6Bytes(JSON.stringify(db[k]));
    if(size<200)return;
    var count=Array.isArray(db[k])?db[k].length:null;
    rows.push({key:k,label:LABEL[k]||('• '+k),bytes:size,count:count});
  });
  return rows.sort(function(a,b){return b.bytes-a.bytes}).slice(0,8);
}
/* Backup trong IndexedDB */
function st6BackupUsage(){
  if(typeof bkListVersions!=='function')return Promise.resolve(null);
  return bkListVersions().then(function(list){
    list=list||[];
    return {count:list.length,bytes:list.reduce(function(t,r){return t+(Number(r&&r.sizeBytes)||0)},0)};
  }).catch(function(){return null});
}
/* Dung lượng ứng dụng = tổng các file đang nằm trong Cache Storage của PWA */
function st6AppUsage(){
  if(!window.caches||!caches.keys)return Promise.resolve(null);
  return caches.keys().then(function(names){
    return Promise.all((names||[]).map(function(name){
      return caches.open(name).then(function(c){
        return c.keys().then(function(reqs){
          return Promise.all((reqs||[]).map(function(req){
            return c.match(req).then(function(res){
              if(!res)return 0;
              var len=res.headers&&res.headers.get('content-length');
              if(len&&Number(len))return Number(len);
              return res.clone().blob().then(function(b){return b.size||0}).catch(function(){return 0});
            }).catch(function(){return 0});
          })).then(function(sizes){
            return {name:name,count:(reqs||[]).length,bytes:sizes.reduce(function(t,x){return t+x},0)};
          });
        });
      }).catch(function(){return {name:name,count:0,bytes:0}});
    }));
  }).then(function(list){
    list=list||[];
    return {caches:list,count:list.reduce(function(t,x){return t+x.count},0),
            bytes:list.reduce(function(t,x){return t+x.bytes},0)};
  }).catch(function(){return null});
}
function st6Quota(){
  try{
    if(navigator.storage&&navigator.storage.estimate)
      return navigator.storage.estimate().then(function(e){return e||null}).catch(function(){return null});
  }catch(e){}
  return Promise.resolve(null);
}
function st6Row(icon,label,value,sub){
  return '<div class="st6Row"><span class="st6Ico">'+icon+'</span>'+
    '<div class="st6RowText"><b>'+esc(label)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</div>'+
    '<span class="st6Val">'+esc(value)+'</span></div>';
}
function st6Bar(part,total){
  var pct=total>0?Math.max(1,Math.min(100,Math.round(part/total*100))):0;
  return '<div class="st6Bar"><i style="width:'+pct+'%"></i></div>';
}
function st6Render(force){
  var body=byId('st6Body');if(!body)return;
  if(ST6.busy)return;
  if(!force&&Date.now()-ST6.lastAt<1500&&body.getAttribute('data-ready')==='1')return;
  ST6.busy=true;
  body.innerHTML='<p class="notice">Đang tính dung lượng…</p>';

  var ls=st6LocalUsage();
  var breakdown=st6DbBreakdown(ls.raw);

  Promise.all([st6AppUsage(),st6BackupUsage(),st6Quota()]).then(function(r){
    var app=r[0],bk=r[1],q=r[2];
    var dbBytes=ls.main+ls.other;
    var bkBytes=bk?bk.bytes:0;
    var appBytes=app?app.bytes:0;
    var known=dbBytes+bkBytes+appBytes;
    var used=(q&&Number(q.usage))||known;
    var quota=(q&&Number(q.quota))||0;

    var h='';
    h+='<div class="st6Total"><b>'+esc(st6Fmt(used))+'</b><small>tổng dung lượng ứng dụng đang chiếm trên máy'+
       (quota?' · hạn mức khoảng '+esc(st6Fmt(quota)):'')+'</small>'+
       (quota?st6Bar(used,quota)+'<small class="st6Pct">Đã dùng '+Math.max(0.1,(used/quota*100)).toFixed(1).replace('.',',')+'% hạn mức</small>':'')+
       '</div>';

    h+='<div class="st6List">';
    h+=st6Row('📦','Dung lượng App',app?st6Fmt(appBytes):'Không đọc được',
        app?(app.count+' tệp trong bộ nhớ đệm · '+app.caches.length+' vùng cache'):'Trình duyệt không cho đọc Cache Storage');
    h+=st6Row('💾','Dung lượng DB',st6Fmt(ls.main),
        'Dữ liệu chính của bé (localStorage · khoá '+KEY+')');
    if(ls.other>0)h+=st6Row('🧷','Cài đặt & bộ lọc',st6Fmt(ls.other),(ls.keys-1)+' khoá phụ khác trong localStorage');
    h+=st6Row('🗄','Backup phiên bản',bk?st6Fmt(bkBytes):'Không đọc được',
        bk?(bk.count+' bản đang lưu trong IndexedDB'):'Chưa mở được IndexedDB');
    h+='</div>';

    if(breakdown.length){
      h+='<div class="st6SubHead">Dữ liệu DB đang chiếm chỗ ở đâu</div><div class="st6List st6Sub">';
      breakdown.forEach(function(row){
        h+=st6Row('▸',row.label,st6Fmt(row.bytes),
          (row.count!==null?row.count+' mục':'')+(ls.main>0?(row.count!==null?' · ':'')+Math.round(row.bytes/ls.main*100)+'% của DB':''));
      });
      h+='</div>';
    }

    if(ls.main>3145728){
      h+='<p class="st6Warn">⚠️ Dữ liệu chính đã vượt 3 MB. Phần lớn dung lượng thường đến từ ảnh cột mốc và ảnh đại diện được lưu thẳng vào DB. Nên xuất DB JSON để giữ bản gốc, rồi xoá bớt ảnh cũ cho app nhẹ và mở nhanh hơn.</p>';
    }else if(quota&&used/quota>0.8){
      h+='<p class="st6Warn">⚠️ Đã dùng hơn 80% hạn mức lưu trữ trình duyệt cấp cho app. Nên xoá bớt bản Backup cũ trong "Lịch sử phiên bản".</p>';
    }
    h+='<p class="notice">Số liệu là ước tính do trình duyệt cung cấp; iOS thường làm tròn nên có thể lệch đôi chút so với phần Cài đặt của máy.</p>';

    body.innerHTML=h;
    body.setAttribute('data-ready','1');
    ST6.lastAt=Date.now();
  }).catch(function(e){
    body.innerHTML='<p class="notice">Không tính được dung lượng: '+esc((e&&e.message)||'lỗi không rõ')+'</p>';
  }).then(function(){ST6.busy=false});
}

/* ==========================================================================
   3️⃣  SỬA LỖI: bấm chức năng ở nút "Thêm" bị đứng màn hình / thoát app
   --------------------------------------------------------------------------
   Bốn nguyên nhân đã xác định, sửa từng cái một:
   (a) updateBackup() nối TOÀN BỘ database thành chuỗi JSON rồi đổ vào ô
       textarea — chạy lại ở MỌI lần render() và ngay khi mở trang Dữ liệu.
       Với DB vài MB (ảnh cột mốc, ảnh đại diện) iPhone đứng hình vài giây
       rồi Safari thoát app. → Chỉ dựng chuỗi khi người dùng thật sự bấm xem.
   (b) renderCareTimeline() dựng toàn bộ lịch sử thành một chuỗi HTML duy
       nhất. Càng dùng lâu càng nặng → phân trang 120 mục mỗi lần.
   (c) Bảng "Thêm" đóng sheet và chuyển trang trong cùng một khung hình, lại
       gọi bkRenderVersionsPanel() TRƯỚC khi trang kịp hiện (từ V14.3.0
       doShowPage bị hoãn 2 khung hình) → tách thứ tự cho đúng.
   (d) Hiệu ứng "nở trang từ điểm chạm" để lại transform + will-change vĩnh
       viễn trên cả trang; với trang dài (Timeline, Dữ liệu) iOS phải giữ một
       lớp vẽ khổng lồ → hết bộ nhớ. → Dọn sạch sau khi chạy xong và không
       áp dụng cho các trang nặng.
   ========================================================================== */
var NV6={backupShown:false,baseUpdateBackup:null,baseCopyBackup:null,basePageZoom:null,
         baseTimeline:null,timelineLimit:120,timelineSig:'',inited:false};

/* ---- (a) Ô sao lưu JSON chỉ dựng khi được yêu cầu ---- */
function nv6WrapBackupText(){
  if(typeof window.updateBackup!=='function'||NV6.baseUpdateBackup)return;
  NV6.baseUpdateBackup=window.updateBackup;
  window.updateBackup=function(){
    var el=byId('backupText');if(!el)return;
    if(!NV6.backupShown){
      el.value='';
      el.placeholder='Bấm “👁 Hiện dữ liệu JSON” bên dưới để nạp bản sao lưu vào ô này.';
      return;
    }
    return NV6.baseUpdateBackup.apply(this,arguments);
  };
  if(typeof window.copyBackup==='function'&&!NV6.baseCopyBackup){
    NV6.baseCopyBackup=window.copyBackup;
    window.copyBackup=function(){
      if(!nv6ShowBackupText(true))return;
      return NV6.baseCopyBackup.apply(this,arguments);
    };
  }
}
function nv6ShowBackupText(silent){
  var el=byId('backupText');if(!el)return false;
  if(!NV6.backupShown){
    var size=0;try{size=st6Bytes(localStorage.getItem(KEY)||'')}catch(e){}
    if(size>2097152&&!confirm('Dữ liệu hiện khoảng '+st6Fmt(size)+'. Hiển thị toàn bộ JSON có thể làm app khựng vài giây trên điện thoại.\n\nBoss vẫn muốn hiện chứ? (Nên dùng nút “Xuất DB JSON” cho nhẹ hơn)'))return false;
    NV6.backupShown=true;
  }
  try{(NV6.baseUpdateBackup||function(){})()}catch(e){}
  if(!silent)try{showToast('Đã nạp dữ liệu JSON vào ô sao lưu','success')}catch(e){}
  return true;
}

/* ---- (b) Timeline phân trang ---- */
function nv6TimelineSignature(){
  var fd=(byId('careFilterDate')&&byId('careFilterDate').value)||'';
  var ft=(byId('careFilterType')&&byId('careFilterType').value)||'';
  return fd+'|'+ft;
}
function nv6TimelineMore(){
  NV6.timelineSig=nv6TimelineSignature();
  NV6.timelineLimit+=120;
  try{nv6RenderCareTimeline(load())}catch(e){}
}
function nv6RenderCareTimeline(db){
  var box=byId('careTimelineBox');if(!box)return;
  var sig=nv6TimelineSignature();
  if(sig!==NV6.timelineSig){NV6.timelineSig=sig;NV6.timelineLimit=120}

  var arr=sortedCareEvents(db);
  var fd=byId('careFilterDate')&&byId('careFilterDate').value;
  var ft=byId('careFilterType')&&byId('careFilterType').value;
  if(fd)arr=arr.filter(function(x){return (x.startDate||x.date)===fd||(x.type==='sleep'&&careOverlapMinutesOnDate(x,fd)>0)});
  if(ft&&ft!=='all')arr=arr.filter(function(x){return x.type===ft});
  if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có ghi nhận chăm sóc.</p></div>';return}

  var total=arr.length,limit=Math.max(20,NV6.timelineLimit),shown=arr.slice(0,limit);
  var groups={};
  shown.forEach(function(x){var k=x.startDate||x.date||'Không rõ ngày';(groups[k]=groups[k]||[]).push(x)});
  var html=Object.keys(groups).sort(function(a,b){return b.localeCompare(a)}).map(function(d){
    return '<div class="careDayGroup"><h3>'+weekdayName(d)+', '+fmtDate(d)+'</h3>'+groups[d].map(function(x){
      var m=careTypeMeta(x.type);
      return '<div class="careEvent"><div class="careEventIcon">'+m.icon+'</div><div class="careEventBody">'+
        '<b>'+esc(m.label)+' · '+esc(eventDateRangeLabel(x))+'</b>'+
        '<div class="careEventMeta">'+esc(careEventText(x))+(x.note?'<br>'+esc(x.note):'')+'</div>'+
        '<div class="careEventActions">'+
        (x.type==='transfer'?'':'<button class="ghost" onclick="editCareEvent('+x._idx+')">Sửa</button><button class="secondary" onclick="copyCareEvent('+x._idx+')">Sao chép</button>')+
        '<button class="danger" onclick="deleteCareEvent('+x._idx+')">Xóa</button>'+
        '</div></div></div>';
    }).join('')+'</div>';
  }).join('');
  if(total>shown.length){
    html+='<div class="nv6More"><button type="button" class="secondary" onclick="nv6TimelineMore()">Xem thêm '+
      Math.min(120,total-shown.length)+' mục</button>'+
      '<small>Đang hiện '+shown.length+' / '+total+' ghi nhận. App chỉ dựng từng phần để mở trang nhanh và không bị đứng máy.</small></div>';
  }
  box.innerHTML=html;
}
function nv6WrapTimeline(){
  if(typeof window.renderCareTimeline!=='function'||NV6.baseTimeline)return;
  NV6.baseTimeline=window.renderCareTimeline;
  window.renderCareTimeline=function(db){
    try{
      nv6RenderCareTimeline(db);
      try{if(typeof axAfterRender==='function')axAfterRender(byId('careTimelineBox'))}catch(e){}
    }catch(e){
      try{NV6.baseTimeline.apply(this,arguments)}catch(e2){}
    }
  };
}

/* ---- (c) Điều hướng an toàn từ bảng "Thêm" ---- */
function nv6Go(id,after,delay){
  /* Chặn lối vào chết: id không ứng với một .page nào thì doShowPage() sẽ ẩn
     hết mọi trang và để lại màn hình TRẮNG (đúng triệu chứng "bấm vào không
     vào được chức năng"). Thà báo cho người dùng còn hơn treo màn hình. */
  var target=byId(id);
  if(!target||!target.classList||!target.classList.contains('page')){
    try{closeMoreSheet()}catch(e){}
    try{showToast('Chức năng này chưa có màn hình riêng','warn')}catch(e){}
    return;
  }
  try{closeMoreSheet()}catch(e){}
  var run=function(){
    try{goTab(id)}
    catch(e){try{doShowPage(id)}catch(e2){}}
    if(typeof after==='function')setTimeout(function(){try{after()}catch(e){}},Number(delay)||220);
  };
  if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(run)});
  else setTimeout(run,20);
}
function nv6AfterData(){
  try{if(typeof bkRenderVersionsPanel==='function')bkRenderVersionsPanel()}catch(e){}
  try{if(typeof bkRenderAutoConfigForm==='function')bkRenderAutoConfigForm()}catch(e){}
  try{st6Render(true)}catch(e){}
}
/* Kho sữa không có trang riêng — lối vào thật là bảng chi tiết kho sữa */
function nv6GoMilkStock(){
  try{closeMoreSheet()}catch(e){}
  setTimeout(function(){
    try{openMilkStockFromDetail(today())}
    catch(e){try{showToast('Không mở được kho sữa','error')}catch(e2){}}
  },180);
}
function nv6AfterHealthQuickAdd(){
  try{if(typeof hb2OpenQuickAdd==='function')hb2OpenQuickAdd()}catch(e){}
}

/* ---- (d) Dọn lớp vẽ sau khi chuyển trang + không phóng to trang nặng ---- */
function nv6CleanPage(id){
  var page=byId(id);if(!page)return;
  var wait=(typeof AX_DUR==='object'&&AX_DUR&&AX_DUR.slow?AX_DUR.slow:240)+160;
  if(page.__nv6Clean)clearTimeout(page.__nv6Clean);
  page.__nv6Clean=setTimeout(function(){
    page.__nv6Clean=null;
    page.classList.remove('axPageZoom');
    page.classList.remove('axPageIn');
    try{
      page.style.removeProperty('--ax-ox');
      page.style.removeProperty('--ax-oy');
      page.style.removeProperty('will-change');
      page.style.removeProperty('transform');
    }catch(e){}
  },wait);
}
function nv6WrapPageZoom(){
  if(typeof window.ax5PageZoom!=='function'||NV6.basePageZoom)return;
  NV6.basePageZoom=window.ax5PageZoom;
  window.ax5PageZoom=function(id){
    /* Trang dài (Timeline, Dữ liệu, Thống kê…) không phóng to cả trang:
       scale() trên một trang dài buộc iOS dựng một lớp vẽ rất lớn → dễ hết
       bộ nhớ và thoát app. Các trang này vẫn có hiệu ứng mờ/trượt như cũ. */
    if(typeof AX_HEAVY_PAGES==='object'&&AX_HEAVY_PAGES&&AX_HEAVY_PAGES[id]){
      var p=byId(id);
      if(p){p.classList.remove('axPageZoom');try{p.style.removeProperty('will-change')}catch(e){}}
      return;
    }
    return NV6.basePageZoom.apply(this,arguments);
  };
}

/* ---- Lưới an toàn: không bao giờ để khung xương đứng mãi trên màn hình ---- */
function nv6SkeletonWatchdog(){
  setInterval(function(){
    var hosts=document.querySelectorAll('.axSkeletonHost');
    if(!hosts.length)return;
    var now=Date.now();
    [].forEach.call(hosts,function(h){
      if(!h.__nv6SkelAt){h.__nv6SkelAt=now;return}
      if(now-h.__nv6SkelAt>2600){
        h.__nv6SkelAt=0;
        try{if(typeof axSkeletonClear==='function')axSkeletonClear(h,true)}catch(e){}
        h.classList.remove('axSkeletonHost');
      }
    });
  },700);
}
function nv6ClearAllSkeletons(){
  [].forEach.call(document.querySelectorAll('.axSkeletonHost'),function(h){
    h.__nv6SkelAt=0;
    try{if(typeof axSkeletonClear==='function')axSkeletonClear(h,true)}catch(e){}
    h.classList.remove('axSkeletonHost');
  });
}

/* Bọc sớm — chạy ngay lúc nạp app.js, không đợi DOM */
function nv6WrapEarly(){
  nv6WrapBackupText();
  nv6WrapTimeline();
  nv6WrapPageZoom();
}
try{nv6WrapEarly()}catch(e){}

/* ------------------------------------------------------ Khởi động V14.6.0 */
function nv6Init(){
  if(NV6.inited)return;NV6.inited=true;

  nv6WrapEarly();
  nv6SkeletonWatchdog();

  /* Lượt vẽ đầu tiên có thể đã chạy trước khi mô-đun này kịp bọc → vẽ bù một lượt
     để Timeline áp dụng phân trang và ô sao lưu JSON được dọn trống. */
  try{if(byId('careTimelineBox'))renderCareTimeline(load())}catch(e){}
  try{if(byId('backupText'))updateBackup()}catch(e){}

  /* Bé bú: gắn khối gợi ý ml ngay sau khi form dựng xong */
  try{
    if(typeof axWrap==='function')
      axWrap('renderCareDynamicFields',function(type){
        if((type||window.__careSelectedType||'feed')==='feed'){try{fq6Mount()}catch(e){}}
      });
  }catch(e){}

  /* Bọc thêm một lớp ngoài cùng cho doShowPage: dọn lớp vẽ + nạp bảng dung lượng */
  try{
    if(typeof window.doShowPage==='function'&&!NV6.baseShowPage){
      NV6.baseShowPage=window.doShowPage;
      window.doShowPage=function(id){
        var r=NV6.baseShowPage.apply(this,arguments);
        try{nv6CleanPage(id)}catch(e){}
        if(id==='data'){try{setTimeout(function(){st6Render()},60)}catch(e){}}
        return r;
      };
    }
  }catch(e){}

  /* Nếu có lỗi JavaScript giữa chừng thì cũng phải trả màn hình lại cho người dùng */
  try{
    window.addEventListener('error',function(){setTimeout(nv6ClearAllSkeletons,200)});
    window.addEventListener('unhandledrejection',function(){setTimeout(nv6ClearAllSkeletons,200)});
  }catch(e){}
}
if(document.body)setTimeout(nv6Init,0);
else document.addEventListener('DOMContentLoaded',function(){setTimeout(nv6Init,0)});
