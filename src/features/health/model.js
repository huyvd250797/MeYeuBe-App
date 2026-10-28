/* V17.8 feature owner: health/model. Original globals remain compatibility adapters.
   No initialization side effects; dependencies resolved when invoked. */
function hb2RelAva(rel){var M={'Con':'👶','Mẹ':'👩','Ba':'👨','Ông':'👴','Bà':'👵','Khác':'🧑'};return M[rel]||'🧑'}

function hb2Uid(){return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

function hb2Arr(v){return Array.isArray(v)?v:[]}

function hb2Split(s){return String(s||'').split(/[,;\n]/).map(function(x){return x.trim()}).filter(Boolean)}

function hb2Num(v){var n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:null}

function hb2Money(n){try{return Number(n||0).toLocaleString('vi-VN')+'đ'}catch(e){return (n||0)+'đ'}}

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

function hb2Find(db,id){var a=hb2Members(db);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}

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
