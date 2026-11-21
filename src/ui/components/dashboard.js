/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
var selectedDay=null;
w.mybDashboardDay={date:function(){return selectedDay||today()},shift:function(delta){var next=addDaysISO(this.date(),delta);selectedDay=next===today()?null:next;w.renderDashboard(load());var el=byId('dashboardDayLabel');if(el)el.focus()},reset:function(){selectedDay=null;w.renderDashboard(load());var el=byId('dashboardDayLabel');if(el)el.focus()}};

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
  var care=careSummaryForDate(db,todayStr);if(!db._dashboardExtrasPending)syncNotificationHistory(evaluateSmartAlerts(db));
  var scheduleToday=(db.appointments||[]).filter(function(x){return x&&x.date===todayStr}).length;
  var milkBags=(db.milkInventory||[]).filter(function(b){return milkIsAvailable(b)});
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
  var blocks={};
  function dashTitle(id,fallback){var t=cfg.moduleTitles&&cfg.moduleTitles[id];return (t&&String(t).trim())?String(t).trim():fallback}

  blocks.babyInfo=function(){
    var birthTimeText=(st.birthTimeFrom||st.birthTime)?(st.birthTimeFrom||st.birthTime)+(st.birthTimeTo?' - '+st.birthTimeTo:''):'--';
    var h='<section class="bcHero">';
    h+='<div class="bcHeroTop"><div class="bcAvatar bcAvatarRing '+babyRingState(db)+'" role="button" tabindex="0" onclick="openAvatarViewer()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openAvatarViewer()}" aria-label="Xem ảnh đại diện của '+esc(name)+'">'+(st.avatarDataUrl?'<img src="'+esc(st.avatarDataUrl)+'" alt="Ảnh đại diện của '+esc(name)+'">':'👧🏻')+'</div><div class="bcHeroInfo"><button type="button" class="bcName bcNameBtn" onclick="openBabyInfoModal()" aria-label="Xem thông tin chi tiết của '+esc(name)+'">'+esc(name)+'<span class="bcVerified">✓</span></button><div class="bcAge">'+esc(st.officialName||'Chưa khai báo tên chính thức')+'</div>';
    h+='<div class="bcOfficial">'+esc(cfg.babyDescription||'')+'</div></div>';
    var unread=unreadNotificationCount();h+='<div class="bcActions"><button class="bcIconBtn" type="button" onclick="openNotificationCenter()">🔔'+(unread?'<span class="bcBadge">'+unread+'</span>':'')+'</button><button class="bcIconBtn" type="button" onclick="goTab(\'scheduleCalendar\')">🗓️</button></div></div>';
    /* V15.0.74: Ngày sinh / thông tin lúc sinh chuyển sang modal chi tiết bé, dashboard không hiển thị nữa. */
    var statusMeta=babyStatusMeta(db),statusClickable=statusMeta.click,nextFeed=nextFeedText(db);h+='<div class="bcStatusBar"><div class="bcStatus '+esc(statusMeta.cls)+(statusClickable?' bcStatusClickable':'')+'" '+(statusClickable?'role="button" tabindex="0" onclick="handleBabyStatusClick()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){handleBabyStatusClick()}"':'')+'>'+esc(statusMeta.text)+(statusMeta.hint?'<span class="bcSleepHint" id="bcSleepElapsed">'+esc(statusMeta.hint)+'</span>':'')+'</div></div>';h+='<div class="bcStatusExtra" id="bcNextFeedWrap">'+nextFeedLineHtml(db)+'</div>';
    h+='</section>';return h;
  };
    blocks.appointment=function(){
    if(db._dashboardExtrasPending)return '';
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
    var todayStr=w.mybDashboardDay.date(),care=careSummaryForDate(db,todayStr),isToday=todayStr===today();
    var scheduleTodayTomorrow=(db.appointments||[]).filter(function(x){return x&&(x.date===todayStr||x.date===addDaysISO(todayStr,1))}).length;
    var currentMap={feedMl:care.feedMl,feedCount:care.feedCount,sleepMin:care.sleepMin,diaper:care.diaper,pee:care.pee,poop:care.poop,pumpMl:care.pumpMl,storedMl:milkBags.reduce(function(t,b){return t+Number(b.remaining||0)},0),urgent:urgent,medicine:care.medicine,temperatureCount:care.temperatureCount,scheduleTodayTomorrow:scheduleTodayTomorrow};
    function metric(key,cls,icon,val,small,label,go){
      var gs=dashboardGoalStatus(cfg,key,currentMap);
      var style=gs?' style="--goal-progress:'+gs.ratio.toFixed(4)+'"':'';
      var done=gs&&gs.done?' done':'';
      var sub=gs?gs.label:label;
      var quick=key==='pee'||key==='poop'?' data-quick-diaper="'+(key==='pee'?'wet':'dirty')+'" data-quick-date="'+todayStr+'" title="Nhấn giữ để ghi nhanh 1 '+(key==='pee'?'tã ướt':'tã bẩn')+'"':'';
      return '<div class="bcMetric '+cls+done+'"'+style+quick+' onclick="'+(go||'openCareStatsFromDashboard()')+'"><span class="bcDone">✓</span><div class="ico">'+icon+'</div><div class="val">'+val+(small?'<small>'+small+'</small>':'')+'</div><div class="lab">'+esc(label)+'</div>'+(gs?'<span class="bcGoal">'+esc(sub)+'</span>':'')+'</div>';
    }
    var renderers={
      feed:function(){return metric('feed','feed','🍼',care.feedMl,'ml',care.feedCount+' cữ bú','openCareStatsFromDashboard(\'feed\')')},
      sleep:function(){return metric('sleep','sleep','😴',fmtMinutes(care.sleepMin),'','Tổng giờ ngủ','openCareStatsFromDashboard(\'sleep\')')},
      diaper:function(){return metric('diaper','diaper','🧷',care.diaper,'','Tã đã thay','openCareStatsFromDashboard(\'diaper\')')},
      pee:function(){return metric('pee','pee','💧',care.pee,'','Đi tè','openCareStatsFromDashboard(\'pee\')')},
      poop:function(){return metric('poop','poop','💩',care.poop,'','Đi phân','openCareStatsFromDashboard(\'poop\')')},
      pump:function(){return metric('pump','pump','🥛',care.pumpMl,'ml','Hút sữa','openCareStatsFromDashboard(\'pump\')')},
      storedMilk:function(){return metric('storedMilk','milk','🧊',currentMap.storedMl,'ml','Kho hiện tại · '+milkBags.length+' túi','openCareStatsFromDashboard(\'milk\')')},
      medicine:function(){return metric('medicine','medicine','💊',care.medicine,'','Uống thuốc','openCareStatsFromDashboard(\'medicine\')')},
      temperature:function(){return metric('temperature','temperature','🌡️',care.latestTemperature===null?'--':care.latestTemperature,'°C','Đã đo '+care.temperatureCount+(dashboardGoalStatus(cfg,'temperature',currentMap)?(' / '+smartNum(dashboardGoalStatus(cfg,'temperature',currentMap).target,1)+' lần'):' lần'),'openCareStatsFromDashboard(\'temperature\')')},
      spitup:function(){return metric('spitup','spitup','🤮',care.spitup,'','Trớ sữa','openCareStatsFromDashboard(\'spitup\')')},
      urgentMilk:function(){return metric('urgentMilk','urgent','🟡',urgent,' túi','Hiện tại · hết hạn <48h','openCareStatsFromDashboard(\'milk\')')},
      schedule:function(){if(db._dashboardExtrasPending)return '';return metric('schedule','schedule','📅',scheduleTodayTomorrow,'','Lịch ngày chọn/kế tiếp','goTab(\'scheduleCalendar\')')}
    };
    function renderFeaturedMetric(key){
      var specs={
        feed:{icon:'🍼',label:'Bé bú',value:care.feedMl,unit:'ml',desc:care.feedCount+' cữ bú',action:"openCareStatsFromDashboard('feed')"},
        sleep:{icon:'😴',label:'Ngủ',value:fmtMinutes(care.sleepMin),unit:'',desc:'Tổng giờ ngủ',action:"openCareStatsFromDashboard('sleep')"},
        diaper:{icon:'🧷',label:'Tã đã thay',value:care.diaper,unit:'',desc:'Tã đã thay',action:"openCareStatsFromDashboard('diaper')"},
        pee:{icon:'💧',label:'Đi tè',value:care.pee,unit:'',desc:'Số lần đi tè',action:"openCareStatsFromDashboard('pee')"},
        poop:{icon:'💩',label:'Đi phân',value:care.poop,unit:'',desc:'Số lần đi phân',action:"openCareStatsFromDashboard('poop')"},
        pump:{icon:'🥛',label:'Hút sữa',value:care.pumpMl,unit:'ml',desc:'Lượng sữa đã hút',action:"openCareStatsFromDashboard('pump')"},
        storedMilk:{icon:'🧊',label:'Kho hiện tại',value:currentMap.storedMl,unit:'ml',desc:milkBags.length+' túi sữa',action:"openCareStatsFromDashboard('milk')"},
        medicine:{icon:'💊',label:'Uống thuốc',value:care.medicine,unit:'',desc:'Số lần uống thuốc',action:"openCareStatsFromDashboard('medicine')"},
        temperature:{icon:'🌡️',label:'Thân nhiệt',value:care.latestTemperature===null?'--':care.latestTemperature,unit:'°C',desc:'Đã đo '+care.temperatureCount+' lần',action:"openCareStatsFromDashboard('temperature')"},
        spitup:{icon:'🤮',label:'Trớ sữa',value:care.spitup,unit:'',desc:'Số lần trớ sữa',action:"openCareStatsFromDashboard('spitup')"},
        urgentMilk:{icon:'🟡',label:'Sữa sắp hết hạn',value:urgent,unit:' túi',desc:'Hết hạn trong 48 giờ',action:"openCareStatsFromDashboard('milk')"},
        schedule:{icon:'📅',label:'Lịch hôm nay/mai',value:scheduleTodayTomorrow,unit:'',desc:'Lịch trong hai ngày',action:"goTab('scheduleCalendar')"}
      };
      var x=specs[key];if(!x)return '';
      var gs=dashboardGoalStatus(cfg,key,currentMap);
      var progress=gs?Math.max(0,Math.min(100,gs.ratio*100)):0;
      var pct=gs?Math.round(progress)+'%':'';
      var secondary=gs?gs.label:x.desc;
      var wasteHtml='';
      if(key==='feed'){
        var waste=(db.careEvents||[]).reduce(function(total,event){
          if(!event||event.type!=='feed'||(event.startDate||event.date)!==todayStr)return total;
          var amount=Number(event.wasteMl||0);
          return total+(isFinite(amount)&&amount>0?amount:0);
        },0);
        // V17.22.54: a milk-drop-with-discard badge, not the pee/hydration emoji.
        // SVG is a fixed icon; live waste data remains text, never embedded in artwork.
        wasteHtml='<span class="bcFeaturedWaste"><svg class="bcFeaturedDiscardIcon" viewBox="0 0 36 42" fill="none" aria-hidden="true" focusable="false"><path d="M18 2C12 12 6 20 6 26a12 12 0 0 0 24 0C30 20 24 12 18 2Z" fill="#FF87B6" stroke="#FFC1DB" stroke-width="1.5"/><path d="M13.2 26c.5-2.8 2.3-6.3 4.4-9" stroke="#FFE3EF" stroke-width="2.2" stroke-linecap="round"/><circle cx="26.5" cy="33" r="8" fill="#2B1836" stroke="#FFA6CE" stroke-width="1.5"/><path d="m23.8 30.3 5.4 5.4m0-5.4-5.4 5.4" stroke="#FFD0E3" stroke-linecap="round" stroke-width="1.8"/></svg><span>Đã bỏ<strong>'+esc(smartNum(waste,1))+' ml</strong></span></span>';
      }
      var title=esc(x.label),val=esc(x.value),units=esc(x.unit),goalText=esc(secondary);
      var attrs=key==='pee'||key==='poop'?' data-quick-diaper="'+(key==='pee'?'wet':'dirty')+'" data-quick-date="'+esc(todayStr)+'"':'';
      var wasteLabel=key==='feed'?', Đã bỏ '+smartNum(waste,1)+' ml':'';
      return '<div class="bcFeaturedMetric bcFeatured-'+esc(key)+'" role="button" tabindex="0" aria-label="'+title+' '+val+units+', '+goalText+wasteLabel+'"'+attrs+' onclick="'+x.action+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();'+x.action+'}">'+
        '<div class="bcFeaturedArtwork" aria-hidden="true">'+x.icon+'</div>'+
        '<div class="bcFeaturedBody"><div class="bcFeaturedHeading">'+title+'</div>'+
        '<div class="bcFeaturedValue">'+val+'<small>'+units+'</small></div><div class="bcFeaturedSub">'+(key==='feed'?esc(care.feedCount+' cữ bú')+(gs?' · '+goalText:''):goalText)+'</div></div>'+
        wasteHtml+'<div class="bcFeaturedFooter">'+
        '<div class="bcFeaturedProgress" role="progressbar" aria-label="Tiến độ '+title+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(progress)+'"><span style="width:'+progress.toFixed(2)+'%"></span></div>'+
        (pct?'<span class="bcFeaturedPercent">'+pct+'</span>':'')+'</div></div>';
    }
    var visibleCareMetrics=(cfg.careMetrics||defaultCareMetrics()).filter(function(m){return m.visible!==false&&renderers[m.id]&&!(db._dashboardExtrasPending&&m.id==='schedule')});
    var highlighted=visibleCareMetrics.some(function(m){return m.id===cfg.featuredCareMetric})?cfg.featuredCareMetric:null;
    var h='<section class="bcCard"><div class="bcCardHead"><div class="bcTitle"><span class="bcTitleIcon">❤️</span><span>'+'Chỉ số chăm sóc'+'</span></div><button class="bcAction" onclick="openCareStatsFromDashboard()">Thống kê ›</button></div><div class="dashboardDayNav" role="group" aria-label="Chọn ngày thống kê"><button type="button" aria-label="Ngày trước" onclick="mybDashboardDay.shift(-1)">‹</button><button type="button" id="dashboardDayLabel" aria-live="polite" aria-label="Về hôm nay" onclick="mybDashboardDay.reset()"><b>'+esc(fmtDate(todayStr))+'</b><span>'+(isToday?'Hôm nay':esc(weekdayName(todayStr)))+'</span></button><button type="button" aria-label="Ngày sau" onclick="mybDashboardDay.shift(1)">›</button></div>';
    if(highlighted)h+=renderFeaturedMetric(highlighted);
    h+='<div class="bcTodayGrid">';
    visibleCareMetrics.forEach(function(m){if(m.id!==highlighted)h+=renderers[m.id]()});
    h+='</div></section>';return h;
  };
  blocks.alerts=function(){
    if(db._dashboardExtrasPending)return '';
    var alertList=evaluateSmartAlerts(db),summary=smartAlertSummary(alertList);
    return '<section class="smartAlertSummary '+esc(summary.severity)+'" role="button" tabindex="0" onclick="openSmartAlertCenter()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){openSmartAlertCenter()}"><div class="smartAlertSummaryIcon">'+esc(summary.icon)+'</div><div class="smartAlertSummaryText"><b>'+esc(summary.title)+'</b><small>'+esc(summary.sub)+'</small></div><div class="smartAlertSummaryGo">Xem ›</div></section>';
  };
  /* V14.7.0 · Module "Sổ sức khỏe" thay cho "Sự phát triển của bé".
     Số đo lấy từ Sổ sức khỏe (hồ sơ của Bé), so với lần khai báo liền trước. */
  blocks.healthBook=function(){
    if(db._dashboardExtrasPending)return '';
    return gw7DashCard(db,cfg,dashTitle('healthBook','Sổ sức khỏe'));
  };
  blocks.milestones=function(){
    if(db._dashboardExtrasPending)return '';
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
    /* V15.0.0 · Quick Timeline. Dashboard chỉ hiện 5~8 hoạt động gần nhất kèm
       biểu tượng trạng thái (⭐📌📷🎥📝) và hỗ trợ nhấn giữ. Lỗi ở đâu thì rơi
       nguyên vẹn về cách vẽ cũ bên dưới — Dashboard không bao giờ trống. */
    try{if(typeof tl8DashCard==='function'){var __tl8=tl8DashCard(db,dashTitle('careJournal','Nhật ký chăm sóc'));if(__tl8)return __tl8}}catch(e){}
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
  w.mybSeasonal?.paintHero();
  if(byId('latestCards'))byId('latestCards').innerHTML='';
  syncStreakWidget(db);
  syncVNClock();
  renderBottomNav(db);
}
mybUI.define('dashboard',{render:renderDashboard});
w.renderDashboard=function(){return mybUI.render.apply(null,['dashboard'].concat(Array.prototype.slice.call(arguments)))};
})(window);
