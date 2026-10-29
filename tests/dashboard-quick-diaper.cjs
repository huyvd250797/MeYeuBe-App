// Exercise real dashboard events through the typed writer and SQL fixture used by both runtimes.
module.exports=async function(w,ok){
 const fs=require('fs'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
 if(!w.mybCareWorkflow)w.eval(fs.readFileSync('src/features/care/workflow.js','utf8'));
 function press(el,type,x=10,y=10,id=1){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{clientX:x,clientY:y,button:0,pointerId:id,isPrimary:true});el.dispatchEvent(e)}
 async function settled(){for(let i=0;i<100&&w.mybCareUi.isBusy();i++)await sleep(20);ok('Quick write releases shared care lock',!w.mybCareUi.isBusy())}
 const tile=k=>w.document.querySelector('#dashboard [data-quick-diaper="'+k+'"]');
 const summary=()=>w.careSummaryForDate(w.load(),w.today());
 const count=()=>w.load().careEvents.length;
 const vibrations=[],vibrate=w.navigator.vibrate,prefs=w.axPrefs();
 w.navigator.vibrate=p=>{vibrations.push({pattern:Array.from(p),events:count()});return true};w.axSavePrefs(Object.assign({},prefs,{haptic:true}));w.AX_STATE.lastHaptic=0;
 async function hold(k,ms=620){const b=tile(k);press(b,'pointerdown');await sleep(ms);press(w.document,'pointerup');tile(k).click();await settled()}
 w.closeCareFormModal(false);w.showPage('home');w.mybDashboardDay.reset();
 ok('Only the two dashboard pee/poop tiles offer hold recording',w.document.querySelectorAll('#dashboard [data-quick-diaper]').length===2&&!w.document.querySelector('.bcMetric.diaper[data-quick-diaper]'));
 let taps=0,b=tile('wet');b.onclick=()=>taps++;
 press(b,'pointerdown');press(w.document,'pointerup');b.click();ok('Short dashboard tap opens details without writing',taps===1);
 let n=count(),s=summary();press(b,'pointerdown');await sleep(1250);press(tile('wet'),'pointerup');tile('wet').onclick=()=>taps++;tile('wet').click();await settled();
 ok('Sustained dashboard wet hold records exactly one acknowledged diaper',count()===n+1&&summary().diaper===s.diaper+1&&summary().pee===s.pee+1&&summary().poop===s.poop);
 ok('A committed wet hold vibrates exactly once, after the count increases',vibrations.length===1&&vibrations[0].events===n+1&&vibrations[0].pattern.join(',')==='12');
 ok('Consumed dashboard hold disables the generic release vibration',w.AX_PRESS.tracking===false);
 ok('Hold suppresses its generated detail click even after dashboard rerender',taps===1&&!w.__careFormModalOpen&&!w.byId('careDetailOverlay').classList.contains('show'));
 await hold('wet');ok('Release then hold creates a second distinct diaper',count()===n+2);ok('A second distinct hold gets one new success pulse',vibrations.length===2);
 const beforeDirty=summary();await hold('dirty');
 ok('Dirty hold uses the existing dirty diaper counting rule',summary().diaper===beforeDirty.diaper+1&&summary().pee===beforeDirty.pee+1&&summary().poop===beforeDirty.poop+1);
 ok('Dirty diaper confirmation gets one success pulse too',vibrations.length===3);
 ok('Quick recording stays on dashboard with no form',!w.__careFormModalOpen&&!w.byId('home').classList.contains('hidden'));
 ok('Undo removes only the latest acknowledged quick diaper',await w.udUndo()&&summary().diaper===beforeDirty.diaper&&summary().poop===beforeDirty.poop);
 n=count();b=tile('wet');press(b,'pointerdown');press(b,'pointermove',10,50);await sleep(620);press(w.document,'pointerup');ok('Scrolling gesture cancels dashboard hold',count()===n);
 b=tile('wet');press(b,'pointerdown');press(b,'pointercancel');await sleep(620);ok('Pointer cancellation never writes a diaper',count()===n);
 b=tile('wet');press(b,'pointerdown');w.dispatchEvent(new w.Event('blur'));await sleep(620);ok('Leaving the app cancels an unfinished hold',count()===n);
 w.mybDashboardDay.shift(-1);await hold('wet');ok('Historical dashboard never silently writes to today',count()===n);w.mybDashboardDay.reset();
 w.openCareFormModal('diaper');w.diaperSetAmount(1);b=w.document.querySelector('.diaperChoice[data-diaper="wet"]');press(b,'pointerdown');await sleep(620);press(w.document,'pointerup');b.click();ok('Holding a form type choice no longer increments quantity',Number(w.byId('cAmount').value)===1);
 b=w.byId('diaperPlus');press(b,'pointerdown');await sleep(620);press(w.document,'pointerup');ok('Form plus has no hold increment',Number(w.byId('cAmount').value)===1);w.diaperStepAmount(1);ok('Ordinary form quantity increment is retained',Number(w.byId('cAmount').value)===2);w.closeCareFormModal(false);
 const request=w.mybDataClient.request;let release,gate=new Promise(r=>release=r),writes=0;
 w.mybDataClient.request=async function(name,args){if(name==='myb_care_write_v1540'){writes++;await gate}return request(name,args)};
 try{n=count();let pulses=vibrations.length;b=tile('wet');press(b,'pointerdown');await sleep(620);press(w.document,'pointerup');ok('No optimistic count appears before database acknowledgement',count()===n&&w.mybCareUi.isBusy());ok('No success vibration fires while database acknowledgement is pending',vibrations.length===pulses);b=tile('dirty');press(b,'pointerdown');await sleep(620);press(w.document,'pointerup');ok('Another hold while saving cannot enqueue a second write',writes===1);release();await settled();ok('The delayed acknowledgement adds exactly one diaper',count()===n+1);ok('Delayed success vibrates once after the confirmed increment',vibrations.length===pulses+1&&vibrations.at(-1).events===n+1)}finally{release();w.mybDataClient.request=request}
 let lost=false,writeIds=[];
 w.mybDataClient.request=async function(name,args){const r=await request(name,args);if(name==='myb_care_write_v1540'){writeIds.push(args.p_op_id);if(!lost){lost=true;throw Object.assign(new Error('Simulated lost ACK'),{code:'UNKNOWN_OUTCOME'})}}return r};
 try{n=count();const successBefore=vibrations.filter(v=>v.pattern.join(',')==='12').length;await hold('wet');ok('Lost acknowledgement does not produce a success vibration',vibrations.filter(v=>v.pattern.join(',')==='12').length===successBefore);const pending=w.mybCareRepository.pending();ok('Lost ACK retains a recoverable operation without optimistic count',!!pending&&count()===n);await hold('dirty');ok('An unresolved operation blocks another dashboard write',writeIds.length===1&&w.mybCareRepository.pending().id===pending.id);ok('Read-only verification recovers the original quick record once',await w.mybCareWorkflow.verifyPending()&&count()===n+1&&!w.mybCareRepository.pending()&&writeIds.length===1)}finally{w.mybDataClient.request=request}
 let pulses=vibrations.length;w.axSavePrefs(Object.assign({},prefs,{haptic:false}));n=count();await hold('wet');ok('Disabling vibration preserves recording and stays silent',count()===n+1&&vibrations.length===pulses);
 w.axSavePrefs(Object.assign({},prefs,{haptic:true}));delete w.navigator.vibrate;n=count();await hold('dirty');ok('Devices without Vibration API still record safely',count()===n+1&&vibrations.length===pulses);
 w.navigator.vibrate=vibrate;w.axSavePrefs(prefs);
};
