module.exports=function(w,ok){
 const fs=require('fs');if(!w.mybHealthProfileLayout)w.eval(fs.readFileSync('src/ui/components/health-profile.js','utf8'));
 const first=Object.assign(w.hb2EmptyMember('Con'),{id:'layout-first',name:'Bé <Bún>',meas:[{id:'a',date:'2026-07-01',weight:'6.3000000',height:'62'}]}),second=Object.assign(w.hb2EmptyMember('Mẹ'),{id:'layout-second',name:'Mẹ',weight:'55'}),db={hb:{members:[first,second],activeId:first.id},settings:{birthDate:'2026-06-25'}};
 const oldLoad=w.load,oldView=w.hb2State.view,oldActive=w.hb2State.activeId;w.load=()=>db;w.hb2State.activeId=first.id;
 try{
  const box=w.document.createElement('div');box.innerHTML=w.hb2ChipsHtml(db);
  ok('Profile header shows escaped identity, one entry action, no obsolete version badge',box.querySelector('h2').textContent==='Bé <Bún>'&&box.querySelectorAll('.hb2QuickBtn').length===1&&!box.querySelector('.hb2Ver'));
  ok('Member selector identifies exactly one selected member',box.querySelectorAll('[aria-pressed="true"]').length===1&&box.querySelectorAll('[aria-pressed]').length===2);
  w.hb2State.view='meds';box.innerHTML=w.hb2TabsHtml(first);
  ok('Clinical group selection stays explicit outside primary tabs',box.querySelector('#healthSection').value==='meds'&&box.querySelectorAll('.hb2Tab').length===4&&box.textContent.includes('Kế hoạch'));
  box.innerHTML=w.hb2TabsHtml(second);ok('Adult navigation omits child growth without losing reports',box.querySelectorAll('.hb2Tab').length===3&&!!box.querySelector('option[value="report"]'));
  const snapshot=JSON.stringify(db);box.innerHTML=w.hb2ViewHome(db,first);
  ok('Overview shows measurement date and only four clinical shortcuts',box.textContent.includes('Đo ngày')&&box.querySelectorAll('.hb2NavCard').length===4);
  box.innerHTML=w.hb2ViewProfile(db,first);
  ok('Profile regrouping preserves edit, attachment and export actions',box.querySelector('.healthProfileSections')&&box.innerHTML.includes('hb2OpenEditBasic')&&box.innerHTML.includes('hb2OpenAddFile')&&box.innerHTML.includes('hb2ExportProfile'));
  ok('Presentation leaves profile records unchanged',JSON.stringify(db)===snapshot);
  w.hb2Go('profile');ok('Actual health render uses new owner and current view',!!w.byId('hb2Root').querySelector('.healthProfileHead')&&!!w.byId('hb2Root').querySelector('[aria-current="page"]')&&w.byId('hb2Root').querySelector('[aria-current="page"]').textContent==='Hồ sơ');
 }finally{w.load=oldLoad;w.hb2State.view=oldView;w.hb2State.activeId=oldActive}
};
