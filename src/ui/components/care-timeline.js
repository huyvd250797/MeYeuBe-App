/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
function renderCareTimeline(db){var box=byId('careTimelineBox');if(!box)return;var arr=sortedCareEvents(db);var fd=byId('careFilterDate')&&byId('careFilterDate').value,ft=byId('careFilterType')&&byId('careFilterType').value;if(fd)arr=arr.filter(function(x){return (x.startDate||x.date)===fd || (x.type==='sleep'&&careOverlapMinutesOnDate(x,fd)>0)});if(ft&&ft!=='all')arr=arr.filter(function(x){return x.type===ft});if(!arr.length){box.innerHTML='<div class="card"><p class="notice">Chưa có ghi nhận chăm sóc.</p></div>';return}var groups={};arr.forEach(function(x){var k=x.startDate||x.date||'Không rõ ngày';(groups[k]=groups[k]||[]).push(x)});box.innerHTML=Object.keys(groups).sort(function(a,b){return b.localeCompare(a)}).map(function(d){return '<div class="careDayGroup"><h3>'+weekdayName(d)+', '+fmtDate(d)+'</h3>'+groups[d].map(function(x){var m=careTypeMeta(x.type);return '<div class="careEvent"><div class="careEventIcon">'+m.icon+'</div><div class="careEventBody"><b>'+esc(m.label)+' · '+esc(eventDateRangeLabel(x))+'</b><div class="careEventMeta">'+esc(careEventText(x))+(x.note?'<br>'+esc(x.note):'')+'</div><div class="careEventActions">'+(x.type==='transfer'?'':'<button class="ghost" onclick="editCareEvent('+x._idx+')">Sửa</button><button class="secondary" onclick="copyCareEvent('+x._idx+')">Sao chép</button>')+'<button class="danger" onclick="deleteCareEvent('+x._idx+')">Xóa</button></div></div></div>'}).join('')+'</div>'}).join('')}

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
mybUI.define('care-timeline-legacy',{render:renderCareTimeline});
w.renderCareTimeline=function(){return mybUI.render.apply(null,['care-timeline-legacy'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('care-stats',{render:renderCareStats});
w.renderCareStats=function(){return mybUI.render.apply(null,['care-stats'].concat(Array.prototype.slice.call(arguments)))};
var TL10_QUICK_FILTERS=[
  {value:'all',label:'Tất cả',icon:'◼'},
  {value:'feed',label:'Bé bú',icon:'🍼'},
  {value:'diaper',label:'Thay tã',icon:'🧷'},
  {value:'pump',label:'Hút sữa',icon:'🥛'},
  {value:'sleep',label:'Ngủ',icon:'🛏️'},
  {value:'medicine',label:'Thuốc',icon:'💊'}
];
function tl10FilterValue(){
  var el=byId('careFilterType');
  return (el&&el.value)||'all';
}
function tl10SetQuickFilter(v){
  var el=byId('careFilterType');
  if(el)el.value=v||'all';
  try{axHaptic('light')}catch(e){}
  try{renderCareTimeline(load())}catch(e){}
}
function tl10QuickFiltersHtml(db){
  var current=tl10FilterValue();
  return TL10_QUICK_FILTERS.map(function(item){
    var active=(current===item.value)||(!current&&item.value==='all');
    return `<button type="button" class="tl10QuickBtn${active?' on':''}" onclick="tl10SetQuickFilter('${esc(item.value)}')" aria-pressed="${active?'true':'false'}"><span class="tl10QuickIcon" aria-hidden="true">${item.icon}</span><span>${esc(item.label)}</span></button>`;
  }).join('');
}
function tl10SyncToolbar(db,total){
  var box=byId('tl10QuickFilters');
  if(box)box.innerHTML=tl10QuickFiltersHtml(db||load());
}
function tl10CreatedLabel(x){
  var s=String(tl8CreStamp(x)||'');
  if(/^\d{4}-\d{2}-\d{2}T/.test(s)){
    try{
      var d=new Date(s);
      if(!isNaN(d.getTime()))return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' - '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    }catch(e){}
  }
  var datePart=fmtDate(x.startDate||x.date||today());
  var timePart=x.timeFrom||'--:--';
  return datePart+' - '+timePart;
}
function tl10EventPills(x){
  var parts=[];
  var text='';
  try{text=String(careEventText(x)||'')}catch(e){text=''}
  if(text){
    text.split(' · ').forEach(function(part){
      part=String(part||'').trim();
      if(!part)return;
      if(parts.indexOf(part)===-1)parts.push(part);
    });
  }
  if(x.note&&parts.length<3)parts.push('Có ghi chú');
  return parts.slice(0,3).map(function(part){
    var icon='';
    var norm=tl8Norm(part);
    if(norm.indexOf('ml')>=0||norm.indexOf('hut')>=0)icon='🥛';
    else if(norm.indexOf('ngan mat')>=0||norm.indexOf('ngan dong')>=0||norm.indexOf('dong')>=0||norm.indexOf('bao quan')>=0||norm.indexOf('tu lanh')>=0)icon='❄️';
    else if(norm.indexOf('ta')>=0||norm.indexOf('uoc')>=0)icon='💧';
    else if(norm.indexOf('thuoc')>=0||norm.indexOf('vitamin')>=0||norm.indexOf('giot')>=0||norm.indexOf('vien')>=0)icon='💊';
    else if(norm.indexOf('ngu')>=0)icon='😴';
    else if(norm.indexOf('tui sua')>=0||norm.indexOf('kho sua')>=0)icon='👜';
    else if(norm.indexOf('tu tinh')>=0)icon='🧮';
    else if(norm.indexOf('te')>=0)icon='💧';
    else if(norm.indexOf('phan')>=0||norm.indexOf('ban')>=0)icon='💩';
    else if(norm.indexOf('nhiet')>=0)icon='🌡️';
    else if(norm.indexOf('tao ngay')>=0||norm.indexOf('ngay')>=0)icon='📅';
    return '<span class="tl10Pill">'+(icon?'<span class="tl10PillIcon" aria-hidden="true">'+icon+'</span>':'')+'<span>'+esc(part)+'</span></span>';
  }).join('');
}
function tl10Row(x){
  var m=careTypeMeta(x.type),id=x._key;
  var note=x.note?`<div class="tl10Note">${esc(x.note)}</div>`:'';
  return `<div class="tl10Item"><div class="tl10Node" aria-hidden="true"><span class="tl10NodeDot"></span><div class="tl10IconBubble">${m.icon}</div></div><div class="tl10Card" data-tl8-id="${esc(id)}" data-tl8-mode="full" onclick="tl8Detail('${esc(id)}')"><button type="button" class="tl10MoreBtn tl8NoPress" onclick="event.stopPropagation();tl8OpenSheet('${esc(id)}','full')" aria-label="Thao tác bản ghi">⋯</button><div class="tl10Title">${esc(m.label)} · ${esc(eventDateRangeLabel(x))}</div><div class="tl10Desc">${esc(careEventText(x)||m.label)}</div>${note}<div class="tl10Pills">${tl10EventPills(x)}</div><div class="tl10Footer"><span class="tl10Created"><span class="tl10CreatedIcon" aria-hidden="true">📅</span><span>${esc(tl10CreatedLabel(x))}</span></span></div></div></div>`;
}
function tl8RenderTimeline(db){
  var box=byId('careTimelineBox');if(!box)return;
  var sig=tl8Signature();
  if(sig!==TL8.sig){TL8.sig=sig;TL8.limit=TL8_PAGE}
  var arr=tl8Collect(db),total=arr.length;
  tl8SyncBar(total);
  tl10SyncToolbar(db,total);
  if(!total){
    var q=tl8Query(),f=tl8Filters(),fd=(byId('careFilterDate')&&byId('careFilterDate').value)||'',ft=(byId('careFilterType')&&byId('careFilterType').value)||'',sortChanged=tl8Sort()!=='act_desc';
    var any=TL8_FILTERS.some(function(o){return f[o.k]})||!!fd||(!!ft&&ft!=='all')||sortChanged;
    box.innerHTML='<div class="card"><p class="notice">'+
      (q?'Không tìm thấy ghi nhận nào khớp với “'+esc(q)+'”.':(any?'Không có ghi nhận nào khớp bộ lọc đang chọn.':'Chưa có ghi nhận chăm sóc.'))+
      '</p>'+((q||any)?'<div class="btns"><button type="button" class="secondary" onclick="tl8ResetView()">Xoá bộ lọc &amp; tìm kiếm</button></div>':'')+'</div>';
    return;
  }
  var limit=Math.max(20,TL8.limit),shown=arr.slice(0,limit),sort=tl8Sort();
  var order=[],groups={};
  shown.forEach(function(x){
    var k=tl8GroupKey(x,sort);
    if(!groups[k]){groups[k]=[];order.push(k)}
    groups[k].push(x);
  });
  var head=(sort.slice(0,3)==='cre')?'Ngày tạo: ':(sort.slice(0,3)==='upd'?'Ngày cập nhật: ':'');
  var html=order.map(function(d){
    return '<div class="careDayGroup tl10Group">'+
      '<div class="card tl10GroupCard">'+
        '<div class="tl10GroupHead">'+
          '<div class="tl10GroupTitleWrap"><span class="tl10GroupIcon" aria-hidden="true">📅</span><h3>'+esc(head)+weekdayName(d)+', '+fmtDate(d)+'</h3></div>'+
          '<span class="tl10GroupCount">'+groups[d].length+' hoạt động</span>'+
        '</div>'+
        '<div class="tl10Rows">'+groups[d].map(tl10Row).join('')+'</div>'+
      '</div>'+
    '</div>';
  }).join('');
  if(total>shown.length){
    html+='<div class="nv6More"><button type="button" class="secondary" onclick="tl8More()">Xem thêm '+
      Math.min(TL8_PAGE,total-shown.length)+' mục</button>'+
      '<small>Đang hiện '+shown.length+' / '+total+' ghi nhận. App chỉ dựng từng phần để mở trang nhanh và không bị đứng máy.</small></div>';
  }
  box.innerHTML=html;
}
mybUI.define('care-timeline',{render:tl8RenderTimeline});
w.tl8RenderTimeline=function(){return mybUI.render.apply(null,['care-timeline'].concat(Array.prototype.slice.call(arguments)))};
w.tl10SetQuickFilter=tl10SetQuickFilter;
w.tl10SyncToolbar=tl10SyncToolbar;
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
mybUI.define('care-timeline-paged',{render:nv6RenderCareTimeline});
w.nv6RenderCareTimeline=function(){return mybUI.render.apply(null,['care-timeline-paged'].concat(Array.prototype.slice.call(arguments)))};
})(window);
