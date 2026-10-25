const fs=require('fs'),assert=require('assert/strict');const {PGlite}=require('@electric-sql/pglite');
const cp=x=>JSON.parse(JSON.stringify(x));
async function fixture(){
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated;
 create table public.fixture_state (sync_id text primary key,payload jsonb not null);
 create function public.myb_relational_export_state_v1576(p_sync_id text) returns jsonb language sql as $$ select jsonb_build_object('ok',true,'family_id',p_sync_id,'payload',payload) from public.fixture_state where sync_id=p_sync_id $$;
 create function public.myb_relational_apply_changes_v1576(p_sync_id text,p_device_key text,p_changes jsonb) returns jsonb language plpgsql as $$
 declare state jsonb; c jsonb; field text; a jsonb; begin
 select payload into state from fixture_state where sync_id=p_sync_id for update;
 for c in select value from jsonb_array_elements(p_changes) loop
 field:=case c->>'entity' when 'milk_container' then 'milkContainers' when 'appointment_type' then 'appointmentTypes' when 'diary_type' then 'diaryTypes' when 'milk_item' then 'milkInventory' end;
 if field is null then raise exception 'bad entity'; end if;
 select coalesce(jsonb_agg(value),'[]'::jsonb) into a from jsonb_array_elements(coalesce(state->field,'[]'::jsonb)) where value->>'id'<>c->>'source_id';
 if c->>'op'<>'delete' then a:=a||jsonb_build_array(c->'data'); end if;
 state:=jsonb_set(state,array[field],a);
 end loop;
 update fixture_state set payload=state where sync_id=p_sync_id;return jsonb_build_object('ok',true);end $$;`);
 const initial={settings:{babyName:'Private'},milkContainers:[],appointmentTypes:[],diaryTypes:[],milkInventory:[],appointments:[],diary:[],careEvents:[]};
 for(const key of ['main','other'])await db.query('insert into fixture_state values ($1,$2)',[key,JSON.stringify(initial)]);
 await db.exec(fs.readFileSync('supabase/migrations/20261025_1530_catalog_api.sql','utf8'));
 return db;
}
async function list(db,kind,sync='main'){return (await db.query('select public.myb_catalog_list_v1530($1,$2) as r',[sync,kind])).rows[0].r}
async function write(db,kind,op,id,data,before,sync='main'){return (await db.query('select public.myb_catalog_write_v1530($1,$2,$3,$4,$5,$6,$7) as r',[sync,kind,op,id,JSON.stringify(data||{}),before?JSON.stringify(before):null,'test-device'])).rows[0].r}
async function run(){let pass=0;const db=await fixture();function ok(n,f){f();console.log('PASS '+n);pass++}
 try{
 for(const k of ['milk_container','appointment_type','diary_type']){
  const data=k==='milk_container'?{name:'Bottle',kind:'binh',capacity:150,active:true}:{name:'Type',icon:'X',desc:'note',active:true};
  let r=await write(db,k,'create','id-'+k,data,null);ok(k+' SQL create',()=>assert.equal(r.ok,true));
  let before=r.items[0];r=await write(db,k,'update',before.id,{...data,name:'Changed'},before);ok(k+' SQL update',()=>assert.equal(r.items[0].name,'Changed'));
  let conflict=await write(db,k,'update',before.id,data,before);ok(k+' stale edit rejected',()=>assert.equal(conflict.ok,false));
  before=r.items[0];r=await write(db,k,'delete',before.id,{},before);ok(k+' SQL delete',()=>assert.equal(r.items.length,0));
 }
 let data={name:'Bottle',kind:'binh',capacity:150,active:true},r=await write(db,'milk_container','create','b1',data);let before=r.items[0];
 r=await write(db,'milk_container','create','b2',data);ok('Duplicate name rejected',()=>assert.equal(r.ok,false));
 r=await write(db,'milk_container','update','b1',{...data,capacity:-1},before);ok('Negative capacity rejected on server',()=>assert.equal(r.ok,false));
 r=await write(db,'milk_container','update','b1',{...data,service_role:'bad'},before);ok('Unexpected fields rejected',()=>assert.equal(r.ok,false));
 await db.query(`update fixture_state set payload=jsonb_set(payload,'{milkInventory}',$1::jsonb) where sync_id='main'`,[JSON.stringify([{id:'milk',containerId:'b1',containerName:'Bottle',remaining:80}])]);
 r=await write(db,'milk_container','delete','b1',{},before);ok('Referenced container cannot be deleted',()=>assert.equal(r.code,'IN_USE'));
 r=await write(db,'milk_container','update','b1',{...data,kind:'tui'},before);ok('Referenced container cannot change kind',()=>assert.equal(r.code,'IN_USE'));
 r=await write(db,'milk_container','update','b1',{...data,name:'Renamed'},before);ok('Container rename acknowledged',()=>assert.equal(r.ok,true));
 const state=(await db.query("select payload from fixture_state where sync_id='main'")).rows[0].payload;
 ok('Rename updates linked label',()=>assert.equal(state.milkInventory[0].containerName,'Renamed'));
 ok('Rename preserves milk balance',()=>assert.equal(state.milkInventory[0].remaining,80));
 let l=await list(db,'milk_container');ok('Scoped read returns no health/settings data',()=>assert.deepEqual(Object.keys(l).sort(),['items','ok']));
 r=await list(db,'invalid');ok('Invalid list kind returns explicit error',()=>assert.equal(r.ok,false));
 l=await list(db,'milk_container','other');ok('Family isolation routing',()=>assert.equal(l.items.length,0));
 // Run migration twice; no reset and no lost data.
 await db.exec(fs.readFileSync('supabase/migrations/20261025_1530_catalog_api.sql','utf8'));
 l=await list(db,'milk_container');ok('Migration repeat preserves records',()=>assert.equal(l.items.length,1));
 // The facade rolls back if the base RPC reports failure after a partial mutation.
 const beforeFailure=(await db.query("select payload from fixture_state where sync_id='main'")).rows[0].payload;
 await db.exec(`create or replace function public.myb_relational_apply_changes_v1576(p_sync_id text,p_device_key text,p_changes jsonb) returns jsonb language plpgsql as $$ begin update fixture_state set payload='{}'::jsonb where sync_id=p_sync_id;return jsonb_build_object('ok',false);end $$;`);
 r=await write(db,'diary_type','create','fail-case',{name:'Fail',active:true},null);
 ok('Base RPC failure is explicit',()=>assert.equal(r.ok,false));
 const afterFailure=(await db.query("select payload from fixture_state where sync_id='main'")).rows[0].payload;
 ok('Base RPC failure rolls back partial DB mutation',()=>assert.deepEqual(afterFailure,beforeFailure));
 const perms=(await db.query("select prosecdef from pg_proc where proname in ('myb_catalog_list_v1530','myb_catalog_write_v1530')")).rows;
 ok('Facade uses caller privileges',()=>assert.ok(perms.every(x=>x.prosecdef===false)));
 console.log('RESULT '+pass+' PASS / 0 FAIL');
 }finally{await db.close()}
}
module.exports={fixture,list,write};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
