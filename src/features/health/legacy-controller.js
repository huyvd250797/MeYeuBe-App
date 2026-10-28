/* V17.8 feature owner: health/legacy-controller. Original globals remain compatibility adapters.
   No initialization side effects; dependencies resolved when invoked. */
function hb2Active(db){
  var arr=hb2Members(db),id=(db.hb||{}).activeId;
  for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];
  return arr[0]||null;
}

function hb2Commit(db,msg){
  var m=hb2Active(db);if(m)m.updatedAt=new Date().toISOString();
  save(db);
  if(msg)showToast(msg,'success');
  hb2Render();
}

function hb2SetActive(id){var db=load();db.hb.activeId=id;hb2State.view='home';save(db);hb2Render()}

function hb2WhoEval(db,m,ind){
  var pts=hb2WhoPoints(db,m,ind);if(!pts.length)return null;
  var last=pts[pts.length-1],sex=hb2Sex(db,m);
  var lms=whoLmsAt(ind,sex,last.ageM);if(!lms)return null;
  var z=whoZScore(ind,last.value,lms);if(z===null)return null;
  return {pt:last,z:z,pct:whoPercentileText(z),cls:whoClassify(ind,z),advice:whoAdvice(ind,z)};
}

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

function hb2ViewHome(db,m){
  var child=hb2IsChild(m),vc=hb2CountVax(m),meds=hb2ActiveMeds(m),visits=hb2SortedVisits(m);
  var wEval=child?hb2WhoEval(db,m,'wfa'):null,hEval=child?hb2WhoEval(db,m,'lhfa'):null,cEval=child?hb2WhoEval(db,m,'hcfa'):null;
  var wTxt=wEval?hb2MeasureText(wEval.pt.value,'kg'):hb2MeasureText(m.weight,'kg');
  var hTxt=hEval?hb2MeasureText(hEval.pt.value,'cm'):hb2MeasureText(m.height,'cm');
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
      (child?hb2Stat('🧢','Vòng đầu',cEval?hb2MeasureText(cEval.pt.value,'cm'):'--',cEval?cEval.cls.label:'')
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

function hb2ViewProfile(db,m){
  var md=m.medical,h=m.history,al=h.allergy||{};
  return '<div class="card"><div class="hb2CardHead"><b>👤 Thông tin cơ bản</b>'+
      '<button class="ghost" onclick="hb2OpenEditBasic()">Sửa</button></div>'+
      hb2KV('Họ tên',m.name)+hb2KV('Quan hệ',m.rel)+
      hb2KV('Ngày sinh',(hb2Dob(db,m)?fmtDate(hb2Dob(db,m))+' · '+hb2AgeText(db,m):''))+
      hb2KV('Giới tính',m.gender)+hb2KV('Nhóm máu',m.blood)+
      hb2KV('Chiều cao',hb2MeasureText(m.height,'cm'))+hb2KV('Cân nặng',hb2MeasureText(m.weight,'kg'))+
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
    if(x.weight)bits.push('Cân nặng '+hb2MeasureText(x.weight,'kg'));
    if(x.height)bits.push('Chiều cao '+hb2MeasureText(x.height,'cm'));
    if(x.head)bits.push('Vòng đầu '+hb2MeasureText(x.head,'cm'));
    if(bits.length)ev.push({d:x.date,type:'Chỉ số',ico:'⚖️',tone:'baby',t:bits.join(' · '),s:dob?whoAgeText(whoAgeMonths(dob,x.date)):''});
  });
  if(m.linkBaby)hb2LegacyMeasureRows(db,m).forEach(function(x){
    if(!x.date)return;
    var bits=[];
    if(x.weight)bits.push('Cân nặng '+hb2MeasureText(x.weight,'kg'));
    if(x.length)bits.push('Chiều dài '+hb2MeasureText(x.length,'cm'));
    if(x.head)bits.push('Vòng đầu '+hb2MeasureText(x.head,'cm'));
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

function hb2OpenEditBasic(){
  var db=load(),m=hb2Active(db);
  hb2Modal('Sửa thông tin cơ bản',
    hb2F('hb2bName','Họ tên','text',m.name)+
    hb2FSel('hb2bRel','Quan hệ',HB2_RELS,m.rel)+
    hb2F('hb2bDob','Ngày sinh','date',hb2Dob(db,m))+
    hb2FSel('hb2bGender','Giới tính',['','Nữ','Nam'],m.gender)+
    hb2FSel('hb2bBlood','Nhóm máu',['','O+','O-','A+','A-','B+','B-','AB+','AB-','Chưa rõ'],m.blood)+
    hb2F('hb2bHeight','Chiều cao (cm)','number',hb2MeasureInput(m.height))+
    hb2F('hb2bWeight','Cân nặng (kg)','number',hb2MeasureInput(m.weight))+
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

function hb2OpenQuickAdd(){
  var db=load(),m=hb2Active(db);
  var items=[['⚖️','Đo chỉ số · Cân nặng / Chiều cao','hb2QuickMeas()'],
    ['💉','Tiêm chủng','hb2OpenVax()'],['🩺','Khám bệnh','hb2OpenVisit()'],['💊','Thuốc','hb2OpenMed()'],
    ['🧪','Xét nghiệm','hb2OpenLab()'],['📝','Ghi chú','hb2OpenNote()']];
  hb2Modal('Thêm nhanh · '+(m?esc(m.name||m.rel):''),
    '<div class="hb2QA">'+items.map(function(x){
      return '<button type="button" onclick="'+x[2]+'"><i>'+x[0]+'</i><b>'+x[1]+'</b></button>';
    }).join('')+'</div>',null);
}

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
      '<tr><th>Nhóm máu</th><td>'+esc(m.blood||'--')+'</td><th>Chiều cao</th><td>'+esc(hb2MeasureText(m.height,'cm'))+'</td></tr>'+
      '<tr><th>Cân nặng</th><td>'+esc(hb2MeasureText(m.weight,'kg'))+'</td><th>SĐT</th><td>'+esc(m.phone||'--')+'</td></tr></table>')+
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
