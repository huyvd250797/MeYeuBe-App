const fs=require('fs'),assert=require('assert/strict'),{PGlite}=require('@electric-sql/pglite'),{randomUUID}=require('crypto');
const migration=()=>fs.readFileSync('supabase/migrations/20261025_1540_care_milk_api.sql','utf8');
async function fixture(){const db=new PGlite();await db.exec(fs.readFileSync('tests/care-fixture.sql','utf8'));await db.exec(migration());return db}
async function write(db,command,op=randomUUID(),sync='main'){return (await db.query('select myb_care_write_v1540($1,$2,$3,$4) r',[sync,'test',op,JSON.stringify(command)])).rows[0].r}
async function list(db,q={},sync='main'){return (await db.query('select myb_care_list_v1540($1,$2) r',[sync,JSON.stringify(q)])).rows[0].r}
const exp=e=>e?{updatedAt:e.updatedAt,version:e.version}:null;
const save=(db,e,b=null,op)=>write(db,{op:'save',event:e,expected:exp(b)},op);
const del=(db,e)=>write(db,{op:'delete',event:{id:e.id},expected:exp(e)});
const event=(id,type,amount=100,extra={})=>({id,type,amount,date:'2026-10-25',timeFrom:'10:00',storage:'Ngăn mát',extra});
const pump=(id,c='t1',amount=100)=>event(id,'pump',amount,{containerId:c,expireDate:'2099-10-26T10:00:00+07:00'});
const feed=(id,sources,waste=0)=>({...event(id,'feed',sources.reduce((t,s)=>t+s.usedMl,0)-waste),source:'stored',milkSources:sources,wasteMl:waste});
async function run(){let passed=0;const db=await fixture();function ok(n,v){assert.ok(v,n);passed++;console.log('PASS '+n)}function good(r){assert.equal(r.ok,true,JSON.stringify(r));return r}
async function milk(id){return (await list(db,{kind:'milk',id})).items[0]}
async function balance(id){return (await milk(id)).remaining}
try{
 let lockDef=(await db.query("select pg_get_functiondef('myb_relational_apply_changes_v1576(text,text,jsonb)'::regprocedure) d")).rows[0].d;ok('Legacy family lock precedes metadata writes',lockDef.indexOf('perform pg_advisory_xact_lock')<lockDef.indexOf('insert into public.families('));
 let p=good(await save(db,pump('p1','b1',200))),bag=p.event.linkedBagId;
 ok('Pump creates linked stock',p.milkItems[0].remaining===200);const pumpUuid=(await db.query('select pump_event_id from milk_items')).rows[0].pump_event_id;
 const op=randomUUID(),command={op:'save',event:feed('f1',[{bagId:bag,usedMl:70,remainderAction:'keep'}],10),expected:null};
 let f=good(await write(db,command,op));ok('Stored feed subtracts taken, not actual',await balance(bag)===130);ok('Feed actual/taken/waste preserved',f.event.amount===60&&f.event.extra.takenMl===70);
 let repeat=good(await write(db,command,op));ok('Same operation repeats same acknowledgement',JSON.stringify(repeat)===JSON.stringify(f));ok('Repeat does not deduct twice',await balance(bag)===130);
 ok('Operation ID cannot change payload',!(await write(db,{...command,event:{...command.event,note:'different'}},op)).ok);
 const lookup=(await db.query('select myb_care_operation_v1540($1,$2) r',['main',op])).rows[0].r;ok('Lost ACK can be verified',lookup.operationId===op);
 ok('Other family cannot read operation',(await db.query('select myb_care_operation_v1540($1,$2) r',['other',op])).rows[0].r.status==='not_found');
 let e=good(await save(db,{...f.event,milkSources:[{bagId:bag,usedMl:40,remainderAction:'keep'}],amount:40,wasteMl:0},f.event));ok('Edit feed returns old use before new deduction',await balance(bag)===160);
 ok('Stale care edit rejected',!(await save(db,{...f.event,amount:0,source:'direct'},f.event)).ok);ok('Stale edit changes no stock',await balance(bag)===160);
 let pe=good(await save(db,{...p.event,amount:250},p.event));ok('Pump edit keeps used amount',await balance(bag)===210);
 ok('Pump FK survives edit',(await db.query('select pump_event_id from milk_items where legacy_id=$1',[bag])).rows[0].pump_event_id===pumpUuid);
 ok('Pump below consumed rejected',!(await save(db,{...pe.event,amount:30},pe.event)).ok);ok('Failed pump edit rolls back stock',await balance(bag)===210);
 ok('Used pump deletion blocked',!(await del(db,pe.event)).ok);
 let direct=good(await save(db,{...e.event,source:'direct',amount:10},e.event));ok('Stored to direct restores full stock',await balance(bag)===250);
 good(await del(db,direct.event));ok('Deleting direct feed leaves stock unchanged',await balance(bag)===250);
 let f2=good(await save(db,feed('f2',[{bagId:bag,usedMl:30,remainderAction:'discard'}])));ok('Discard rest empties stock',await balance(bag)===0);good(await del(db,f2.event));ok('Deleting feed restores used plus discarded remainder',await balance(bag)===250);
 let p2=good(await save(db,pump('p2','t1',80))),b2=p2.event.linkedBagId;
 let multi=good(await save(db,feed('multi',[{bagId:bag,usedMl:20},{bagId:b2,usedMl:30}])));ok('Multi-source feed deducts each',await balance(bag)===230&&await balance(b2)===50);
 let bad=await save(db,feed('bad',[{bagId:bag,usedMl:10},{bagId:b2,usedMl:500}]));ok('Insufficient source rejects entire feed',!bad.ok);ok('Failed multi-source rolls back all sources',await balance(bag)===230&&await balance(b2)===50);
 ok('Duplicate source rejected',!(await save(db,feed('dup',[{bagId:bag,usedMl:10},{bagId:bag,usedMl:10}]))).ok);
 const transfer={...event('t1','transfer',50),extra:{fromBagId:bag,toContainerId:'b2',expireDate:'2099-10-26T09:00:00+07:00',storage:'Ngăn mát'}};
 let tr=good(await save(db,transfer)),target=tr.event.extra.toBagId;ok('Transfer conserves total remaining',await balance(bag)===180&&await balance(target)===50);
 const raw=(await db.query('select remaining_ml from milk_item_balances where milk_item_id=myb_stable_uuid($1)',['milk_item:main:'+target])).rows[0];ok('Transfer target is not double counted in ledger',Number(raw.remaining_ml)===50);
 let onward=good(await save(db,{...event('t2','transfer',10),extra:{fromBagId:target,toContainerId:'t1',expireDate:'2099-10-26T08:00:00+07:00',storage:'Ngăn mát'}}));
 ok('Cannot delete transfer with downstream use',!(await del(db,tr.event)).ok);ok('Cannot undo transfer after downstream use',!(await write(db,{op:'undo',operationId:tr.operationId})).ok);
 good(await del(db,onward.event));good(await del(db,tr.event));ok('Reverse transfer returns exact source amount',await balance(bag)===230);
 ok('Transfer cannot extend expiry',!(await save(db,{...transfer,id:'longlife',extra:{...transfer.extra,expireDate:'2100-01-01'}})).ok);
 ok('Undo refuses intervening stock changes',!(await write(db,{op:'undo',operationId:multi.operationId})).ok);good(await del(db,multi.event));let fresh=good(await save(db,feed('fresh',[{bagId:bag,usedMl:20},{bagId:b2,usedMl:30}])));let undoFeed=good(await write(db,{op:'undo',operationId:fresh.operationId}));ok('Undo feed restores both sources',await balance(bag)===250&&await balance(b2)===80);
 ok('Cannot undo same operation twice',!(await write(db,{op:'undo',operationId:fresh.operationId})).ok);
 // A new unrelated event must survive another event's undo.
 let temp=good(await save(db,event('temp','temperature',37.5,{site:'Nách'})));let diaper=good(await save(db,event('diaper','diaper',1,{pee:1,poop:1})));good(await write(db,{op:'undo',operationId:temp.operationId}));ok('Undo does not erase unrelated event',(await list(db,{id:'diaper'})).items.length===1);
 ok('Temperature validation runs server side',!(await save(db,event('hot','temperature',90))).ok);
 let sleep=good(await save(db,{...event('sleep','sleep',0),date:'2026-10-24',timeFrom:'23:30',endDate:'2026-10-25',timeTo:'01:00'}));ok('Overnight sleep duration computed server side',sleep.event.amount===90);ok('Date filter includes overlapping sleep',(await list(db,{from:'2026-10-25',to:'2026-10-25',type:'sleep'})).items.length===1);
 ok('Sleep subtype has actual timestamps',(await db.query('select duration_min,sleep_to-sleep_from gap from sleep_events where deleted_at is null')).rows[0].duration_min===90);
 let mb=await milk(b2);let discard=good(await save(db,event('discard','discard',80,{fromBagId:b2,expectedUpdatedAt:mb.updatedAt})));ok('Inventory cancel writes ledger and status',await balance(b2)===0&&(await milk(b2)).status==='Đã bỏ');good(await write(db,{op:'undo',operationId:discard.operationId}));ok('Undo cancel restores stock',await balance(b2)===80);
 ok('Other family scoped read isolated',(await list(db,{kind:'milk'},'other')).items.length===0);
 ok('Pagination bounded',(await list(db,{limit:1})).items.length===1);ok('Unknown query kind rejected',!(await list(db,{kind:'bad'})).ok);
 let shell=(await db.query('select myb_app_shell_v1540($1) r',['main'])).rows[0].r;ok('Shell omits care and milk payloads',shell.payload.careEvents.length===0&&shell.payload.milkInventory.length===0);
 await db.exec(migration());ok('Migration rerun preserves business rows',await balance(bag)===250);
 let oldPage=await list(db,{limit:1});let revEvent=good(await save(db,event('revision-event','diaper',1)));ok('Paging rejects changed database revision',!(await list(db,{limit:1,offset:1,revision:oldPage.revision})).ok);
 ok('Target ID cannot hijack existing milk',!(await save(db,{...pump('hijack'),linkedBagId:bag})).ok);ok('Hijack failure preserves source amount',await balance(bag)===250);
 let fresh2=good(await save(db,feed('ack-current',[{bagId:bag,usedMl:10}])));good(await save(db,feed('ack-next',[{bagId:bag,usedMl:20}])));let ackNow=(await db.query('select myb_care_operation_v1540($1,$2) r',['main',fresh2.operationId])).rows[0].r;ok('Old acknowledgement returns current stock after later writes',ackNow.milkItems.find(x=>x.id===bag).remaining===220);
 await db.query("update milk_items set remaining_ml=remaining_ml+3 where legacy_id=$1",[b2]);let drift=good(await save(db,feed('drift',[{bagId:b2,usedMl:10}])));ok('Touched legacy balance offset is preserved',await balance(b2)===73);good(await del(db,drift.event));ok('Returning feed restores preexisting offset',await balance(b2)===83);
 let openSleep=good(await save(db,event('open-sleep','sleep',0)));ok('Second active sleep rejected',!(await save(db,event('open-sleep-2','sleep',0))).ok);good(await del(db,openSleep.event));
 await db.exec("insert into milk_items(id,family_id,legacy_id,amount_ml,remaining_ml,status,extra) values(myb_stable_uuid('milk_item:main:orphan'),myb_stable_uuid('family:main'),'orphan',70,null,'storing','{}');");
 ok('Unlinked target cannot be overwritten by a new pump',!(await save(db,{...pump('hijack-orphan'),linkedBagId:'orphan'})).ok);ok('Available query uses ledger for nullable remaining',(await list(db,{kind:'milk',available:true})).items.some(x=>x.id==='orphan'));
 let orphan=await milk('orphan');let cancelNull=good(await save(db,event('cancel-null','discard',70,{fromBagId:'orphan',expectedUpdatedAt:orphan.updatedAt})));ok('Cancel nullable legacy balance has no false conflict',await balance('orphan')===0);good(await write(db,{op:'undo',operationId:cancelNull.operationId}));ok('Undo nullable legacy cancel restores ledger',await balance('orphan')===70);
 // Trigger a late SQL failure: earlier stock/ledger mutations must roll back.
 await db.exec("create function reject_feed() returns trigger language plpgsql as $$begin if new.feed_type='stored' then raise exception 'fixture late failure';end if;return new;end$$;create trigger reject before insert on feed_events for each row execute function reject_feed();");
 let before=await balance(bag);ok('Late database error returned',!(await save(db,feed('late',[{bagId:bag,usedMl:20}]))).ok);ok('Late failure transaction rolls back stock',await balance(bag)===before);ok('Late failure leaves no care event',(await list(db,{id:'late'})).items.length===0);
 const permissions=(await db.query("select has_table_privilege('anon','myb_care_operations_v1540','SELECT') a,has_function_privilege('anon','myb_care_hash_v1540(uuid,uuid,uuid[])','EXECUTE') b")).rows[0];ok('Operation table and helpers are private',!permissions.a&&!permissions.b);
 console.log('RESULT '+passed+' PASS / 0 FAIL');
}finally{await db.close()}}
module.exports={fixture,write,list,event,pump,feed,exp};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
