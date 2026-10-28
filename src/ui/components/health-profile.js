/* Health Profile Layout: one late-bound presentation owner, preserves typed forms/writers. */
(function(w){'use strict';
 function action(name,value){return esc(name+'('+JSON.stringify(value)+')')}
 function head(db){
  var m=hb2Active(db),members=hb2Members(db);if(!m)return '';
  return '<div class="card hb2Head healthProfileHead"><div class="healthIdentity">'+
   '<span class="hb2Ava" aria-hidden="true">'+esc(m.avatar||hb2RelAva(m.rel))+'</span><div><small>Hồ sơ sức khỏe · '+esc(m.rel||'Thành viên')+'</small><h2>'+esc(m.name||m.rel)+'</h2><p>'+esc(hb2AgeText(db,m))+(hb2Dob(db,m)?' · '+esc(fmtDate(hb2Dob(db,m))):'')+'</p></div></div>'+
   '<button type="button" class="hb2QuickBtn" onclick="hb2OpenQuickAdd()">＋ Ghi nhận</button>'+
   '<div class="healthMembers" role="group" aria-label="Chọn thành viên">'+members.map(function(x){var selected=x.id===m.id;return '<button type="button" class="healthMember'+(selected?' on':'')+'" aria-pressed="'+selected+'" onclick="'+action('hb2ChipClick',x.id)+'"><span aria-hidden="true">'+esc(x.avatar||hb2RelAva(x.rel))+'</span><span>'+esc(x.name||x.rel)+'</span></button>'}).join('')+
   '<button type="button" class="healthMember" onclick="hb2OpenAddMember()">＋ Thêm hồ sơ</button></div></div>';
 }
 function tabs(m){
  var view=hb2State.view,primary=[['home','Tổng quan'],['profile','Hồ sơ']];if(hb2IsChild(m))primary.push(['growth','Tăng trưởng']);primary.push(['timeline','Lịch sử']);
  var groups=[['','Chọn nhóm thông tin'],['vaccine','Tiêm chủng'],['visits','Khám bệnh'],['meds','Thuốc'],['labs','Xét nghiệm'],['report','Báo cáo'],['future','Thông tin mở rộng']];
  return '<nav class="hb2Tabs healthPrimaryNav" aria-label="Mục hồ sơ">'+primary.map(function(x){return '<button type="button" class="hb2Tab'+(view===x[0]?' on':'')+'" aria-current="'+(view===x[0]?'page':'false')+'" onclick="'+action('hb2Go',x[0])+'">'+x[1]+'</button>'}).join('')+'</nav>'+
   '<div class="healthSectionBar"><label for="healthSection">Nhóm thông tin</label><select id="healthSection" onchange="if(this.value)hb2Go(this.value)">'+groups.map(function(x){return '<option value="'+x[0]+'"'+(view===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select><button type="button" class="ghost" onclick="mybHealthProfileLayout.openPlan()">Kế hoạch</button></div>';
 }
 var home=w.hb2ViewHome,profile=w.hb2ViewProfile;
 function overview(db,m){
  var box=document.createElement('div');box.innerHTML=home(db,m);
  // Primary navigation owns profile/growth; keep the clinical groups in overview.
  box.querySelectorAll('.hb2NavCard').forEach(function(b){if(/hb2Go\('(growth|profile|future)'\)/.test(b.getAttribute('onclick')||''))b.remove()});
  var note=box.querySelector('.hb2Note');if(note)note.remove();
  var stats=box.querySelectorAll('.hb2Stat');['weight','height','head'].forEach(function(field,i){if(i===2&&!hb2IsChild(m))return;var row=(m.meas||[]).filter(function(x){return x[field]!==''&&x[field]!=null&&x.date}).slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))||String(b.createdAt||'').localeCompare(String(a.createdAt||''))})[0];if(row&&stats[i]){var date=document.createElement('small');date.className='healthMeasureDate';date.textContent='Đo ngày '+fmtDate(row.date);stats[i].appendChild(date)}});
  return '<div class="healthOverview">'+box.innerHTML+'</div>';
 }
 function information(db,m){
  var box=document.createElement('div');box.innerHTML=profile(db,m);var grid=document.createElement('div');grid.className='healthProfileSections';
  Array.from(box.children).forEach(function(el){if(el.classList.contains('card'))grid.appendChild(el)});box.prepend(grid);
  var actions=box.querySelector(':scope > .btns');if(actions)actions.classList.add('healthProfileActions');
  return box.innerHTML;
 }
 w.hb2ChipsHtml=head;w.hb2TabsHtml=tabs;w.hb2ViewHome=overview;w.hb2ViewProfile=information;
 function openPlan(){var m=hb2Active(load());showPage('healthPlanning');var page=byId('healthPlanning');if(page&&!page.classList.contains('hidden')&&w.mybHealthPlanning){byId('hpMember').value=m&&m._dbId||'';w.mybHealthPlanning.render()}}
 w.mybHealthProfileLayout={head:head,tabs:tabs,overview:overview,information:information,openPlan:openPlan};
})(window);
