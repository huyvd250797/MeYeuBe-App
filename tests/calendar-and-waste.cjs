const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const {readFileSync}=fs;
const html=readFileSync('index.html','utf8');
const {window:w}=new JSDOM(html,{url:'https://test.example',runScripts:'outside-only'});
const evalRange=(file,from,to)=>{
  const source=readFileSync(file,'utf8'),start=source.indexOf(from),end=source.indexOf(to,start);
  assert.ok(start>=0&&end>start);
  w.eval(source.slice(start,end));
};
let editIndex;
const dateString=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const rows=[
 {id:'a1',date:'2026-01-31',timeFrom:'08:30',timeTo:'10:10',title:'Lịch khám theo dõi định kỳ tháng thứ sáu và kiểm tra bổ sung tại phòng khám nhi'},
 {id:'a2',date:'2026-01-27',timeFrom:'13:45',title:'Nhận kết quả kiểm tra'}
];
const care={type:'feed',source:'stored'};
const careEvents=[15,8,15,120,20,0].map((wasteMl,i)=>({...care,wasteMl,updatedAt:`2026-01-0${9-i}T08:00:00Z`}));
const db={appointments:rows,careEvents};
const load=()=>db;
Object.assign(w,{
  byId:id=>w.document.getElementById(id),load,localDateISO:dateString,today:()=> '2026-01-31',
  fmtDate:date=>date.split('-').reverse().join('/'),weekdayName:()=> 'Thứ',
  timeRankOf:row=>row.timeFrom||'',timeRangeOf:row=>row.timeFrom||'', typeLabel:()=> 'Khám định kỳ',
  esc:text=>String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),
  startOfWeekISO:date=>{const d=new Date(date+'T00:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return dateString(d)},
  editAppointment:i=>{editIndex=i}, showToast:()=>{}, resetAppointmentForm:()=>{},
  showPage:async()=>{w.byId('scheduleAdd').classList.remove('hidden')},setValSafe:(id,value)=>{w.byId(id).value=value},
  milkFeedSourcesState:()=>[{usedMl:45}],renderMilkSourceList(){},toggleFeedSourceFields(){},resetMilkFeedSourcesState(){},syncCareDurationPreview(){}
});
(async()=>{
  try{
    evalRange('app.js','function addDaysISO','function monthStartISO');
    evalRange('src/features/planning/legacy-controller.js','function sortedAppointments','function upcomingAppointment');
    evalRange('app.js','function setCareFeedWaste','function toggleFeedSourceFields');
    evalRange('app.js','function renderCareDynamicFields','function newCareId');

    w.selectCalendarDate('2026-01-31',false);
    assert.equal(w.document.querySelectorAll('.calEvent').length,2);
    w.selectCalendarDate('2026-01-31',true);
    assert.equal(w.document.querySelectorAll('.calEvent').length,1);
    const button=w.document.querySelector('.calEvent');
    assert.equal(button.querySelector('strong').textContent,rows[0].title);
    db.appointments.reverse();
    w.editAppointmentFromCalendar(button);
    assert.equal(editIndex,1);
    w.setCalendarModeFromInline('month');
    w.shiftCalendar(1);
    assert.equal(w.byId('calendarBaseDate').value,'2026-02-28');
    assert.equal(w.document.querySelectorAll('.calDay').length,28);
    await w.addAppointmentFromCalendar();
    assert.equal(w.byId('aDate').value,'2026-02-28');
    console.log('PASS Calendar weekly and daily agenda, long labels, stable edit, month boundary and prefilled date');

    w.renderCareDynamicFields('feed',db);
    w.byId('cFeedSource').value='stored';
    w.byId('cFeedWasteMl').addEventListener('input',w.updateCareFeedWastePreview);
    w.updateCareFeedWastePreview();
    const chips=Array.from(w.byId('careWasteRecent').children);
    assert.deepEqual(chips.map(c=>[c.textContent,c.disabled]),[['15 ml',false],['8 ml',false],['120 ml',true],['20 ml',false]]);
    w.stepCareFeedWaste(1);
    assert.equal(w.byId('cFeedWasteMl').value,'5');
    w.setCareFeedWaste(Number(chips[0].dataset.waste));
    assert.equal(chips[0].getAttribute('aria-pressed'),'true');
    w.stepCareFeedWaste(-1);
    assert.equal(w.byId('cFeedActualMl').value,'35 ml');
    w.setCareFeedWaste(100);
    assert.equal(w.byId('cFeedWasteMl').value,'45');
    assert.equal(w.byId('careWasteMore').disabled,true);
    w.setCareFeedWaste(-5);
    assert.equal(w.byId('cFeedWasteMl').value,'0');
    assert.equal(w.byId('careWasteLess').disabled,true);
    console.log('PASS Stored feed recent suggestions, ± step, exact edit, clamping and actual milk preview');
  }finally{w.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
