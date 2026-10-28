/* V17.8 feature owner: planning/legacy-controller. Original globals remain compatibility adapters.
   No initialization side effects; dependencies resolved when invoked. */
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

function appointmentItemHtml(x,i,db){
  var d=daysBetween(today(),x.date),due=d>0?'Còn '+d+' ngày':(d===0?'Hôm nay':('Đã qua '+Math.abs(d)+' ngày'));
  var selected=(Number(window.__appointmentHighlightIndex)===Number(i));
  return '<div class="item '+(selected?'scheduleSelected':'')+'" data-appt-idx="'+i+'"><b>'+fmtDate(x.date)+(timeRangeOf(x)?' · '+esc(timeRangeOf(x)):'')+' · '+esc(x.title||typeLabel(db,x.typeId))+'</b><small>'+esc(typeLabel(db,x.typeId))+' | '+esc(x.person||'')+' | '+esc(x.status||'Sắp tới')+' | '+due+'</small><div class="scheduleMeta"><span class="pill">📍 '+esc(x.place||'Chưa nhập địa điểm')+'</span><span class="pill">👩‍⚕️ '+esc(x.doctor||'Chưa nhập BS/Khoa')+'</span>'+(x.cost?'<span class="pill">💰 '+esc(x.cost)+'</span>':'')+'</div>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'<div class="itemActions"><button class="ghost" onclick="editAppointment('+i+')">Sửa</button><button class="secondary" onclick="copyAppointment('+i+')">Sao chép</button><button class="danger" onclick="delAppointment('+i+')">Xóa</button></div></div>';
}

function sortedAppointments(db){return (db.appointments||[]).map(function(x,i){var y={};for(var k in x)y[k]=x[k];y._idx=i;return y}).sort(function(a,b){var ad=(a.date||'9999-12-31')+timeRankOf(a),bd=(b.date||'9999-12-31')+timeRankOf(b);return ad.localeCompare(bd)})}

function renderAppointmentList(db){var box=byId('appointmentList');if(!box)return;var arr=sortedAppointments(db);box.innerHTML=arr.length?arr.map(function(x){return appointmentItemHtml(x,x._idx,db)}).join(''):'<p class="notice">Chưa có lịch khám.</p>'}

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

function upcomingAppointment(db){
  var arr=sortedAppointments(db).filter(function(x){return x.date>=today() && x.status!=='Đã hủy'});
  return arr.length?arr[0]:null;
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
