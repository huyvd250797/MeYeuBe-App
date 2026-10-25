-- V15.5.0: per-record Health & Growth API. Apply after migrations 1530 and 1540.
-- Existing business rows and foreign keys are retained. No reset/rebuild.
begin;
alter table public.health_members add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.health_members add column if not exists version integer not null default 1;
alter table public.health_members add column if not exists legacy_id text;
alter table public.health_measurements add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.health_measurements add column if not exists version integer not null default 1;
alter table public.health_measurements add column if not exists legacy_id text;
alter table public.health_visits add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.health_visits add column if not exists version integer not null default 1;
alter table public.health_visits add column if not exists legacy_id text;
alter table public.health_medications add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.health_medications add column if not exists version integer not null default 1;
alter table public.health_medications add column if not exists legacy_id text;
alter table public.health_labs add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.health_labs add column if not exists version integer not null default 1;
alter table public.health_labs add column if not exists legacy_id text;
alter table public.vaccine_records add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.vaccine_records add column if not exists version integer not null default 1;
alter table public.vaccine_records add column if not exists legacy_id text;
alter table public.pregnancy_records add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.pregnancy_records add column if not exists version integer not null default 1;
alter table public.pregnancy_records add column if not exists legacy_id text;
alter table public.child_vaccine_plans add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.child_vaccine_plans add column if not exists version integer not null default 1;
alter table public.child_vaccine_plans add column if not exists legacy_id text;
create table if not exists public.myb_health_operations_v1550(
 family_id uuid not null references public.families(id) on delete cascade,
 op_id uuid not null,request_hash text not null,response jsonb not null,
 before_doc jsonb,before_extra jsonb,after_etag text not null,undone boolean not null default false,
 created_at timestamptz not null default now(),primary key(family_id,op_id)
);
alter table public.myb_health_operations_v1550 add column if not exists before_extra jsonb;
alter table public.myb_health_operations_v1550 enable row level security;
revoke all on public.myb_health_operations_v1550 from public,anon,authenticated;
create or replace function public.myb_health_config_v1550(k text) returns jsonb
language sql immutable set search_path=public,pg_temp as $config$
 select '{"member":{"table":"health_members","fields":{"name":"display_name","rel":"relation","gender":"gender","dob":"dob","blood":"blood_type","height":"height_text","weight":"weight_text","phone":"phone","email":"email"}},"meas":{"table":"health_measurements","fields":{"date":"measure_date","height":"height_cm","head":"head_cm","note":"note"}},"visits":{"table":"health_visits","fields":{"date":"visit_date","time":"visit_time","hospital":"hospital","doctor":"doctor","symptom":"symptom","diagnosis":"diagnosis","treatment":"treatment","meds":"medicine_note","cost":"cost","note":"note"}},"meds":{"table":"health_medications","fields":{"name":"name","dose":"dose","from":"from_date","to":"to_date","active":"active","remind":"remind","note":"note"}},"labs":{"table":"health_labs","fields":{"date":"lab_date","name":"title","place":"place","result":"result_summary","note":"note"}},"vaccines":{"table":"vaccine_records","fields":{"name":"vaccine_name","date":"injection_date","place":"place","manufacturer":"manufacturer","lotNumber":"lot_number","reaction":"reaction","reactionLevel":"reaction_level","note":"note"}},"pregnancy":{"table":"pregnancy_records","fields":{"date":"exam_date","week":"week_text","weight":"estimated_weight","bpd":"bpd","hc":"hc","ac":"ac","fl":"fl","afi":"afi","position":"position","note":"note"}}}'::jsonb->k
$config$;
-- Verify column mappings against the installed schema before installing writers.
do $check$ declare k text; c jsonb; col text;begin
 foreach k in array array['member','meas','visits','meds','labs','vaccines','pregnancy'] loop
 c:=myb_health_config_v1550(k);
 for col in select value from jsonb_each_text(c->'fields') loop
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name=c->>'table' and column_name=col) then raise exception 'V15.5 schema mismatch: %.%',c->>'table',col;end if;
 end loop;
 end loop;
end $check$;
create or replace function public.myb_health_doc_v1550(k text,r jsonb) returns jsonb
language plpgsql stable set search_path=public,pg_temp as $$
declare doc jsonb:=coalesce(r->'extra','{}');a text;b text;plan jsonb:='{}';begin
 for a,b in select key,value from jsonb_each_text(myb_health_config_v1550(k)->'fields') loop
 doc:=doc||jsonb_build_object(a,coalesce(nullif(r->b,'null'::jsonb),'""'::jsonb));end loop;
 if k='meas' then doc:=doc||jsonb_build_object('weight',case when nullif(r->>'weight_g','') is null then '' else ((r->>'weight_g')::numeric/1000)::text end);end if;
 if k='member' then
 doc:=doc||jsonb_build_object('medical',jsonb_build_object('bhyt',coalesce(r->>'bhyt',''),'bhytExp',coalesce(r->>'bhyt_exp',''),'bhytPlace',coalesce(r->>'bhyt_place',''),'bhxh',coalesce(r->>'bhxh',''),'hospital',coalesce(r->>'hospital',''),'doctor',coalesce(r->>'doctor',''),'emergency',coalesce(r->>'emergency_contact','')),
 'status',jsonb_build_object('txt',coalesce(r->>'status_text',''),'tone',coalesce(r->>'status_tone','')));
 doc:=doc-'meas'-'vaccines'-'visits'-'meds'-'labs';
 doc:=jsonb_set(doc,'{other}',(case when jsonb_typeof(doc->'other')='object' then doc->'other' else '{}'::jsonb end)||jsonb_build_object('notes',coalesce(r->>'notes',doc#>>'{other,notes}','')));
 end if;
 if k='vaccines' then
 select to_jsonb(p) into plan from child_vaccine_plans p where p.id=nullif(r->>'plan_id','')::uuid and p.family_id=(r->>'family_id')::uuid;
 plan:=coalesce(plan,'{}');
 doc:=doc||jsonb_build_object('_dbPlanId',r->>'plan_id','dueDate',coalesce(plan->>'due_date',doc->>'dueDate',''),'date',coalesce(r->>'injection_date',''),'status',coalesce(doc->>'status',case when plan->>'status'='done' then 'Đã tiêm' else 'Sắp tới' end));
 end if;
 return doc||jsonb_build_object('id',coalesce(nullif(r->>'legacy_id',''),r->>'id'),'_dbId',r->>'id','_memberId',r->>'member_id','createdAt',r->'created_at','updatedAt',r->'updated_at','version',r->'version','_etag',md5(r::text||plan::text));
end $$;
create or replace function public.myb_health_row_v1550(f uuid,k text,id uuid) returns jsonb
language plpgsql stable set search_path=public,pg_temp as $$
declare r jsonb;t text:=myb_health_config_v1550(k)->>'table';begin
 if t is null then raise exception 'VALIDATION: Loại dữ liệu không hợp lệ.';end if;
 execute format('select to_jsonb(t) from public.%I t where id=$1 and family_id=$2',t) into r using id,f;return r;
end $$;
create or replace function public.myb_health_list_v1550(p_sync_id text,p_query jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);k text:=coalesce(p_query->>'kind','member');c jsonb;t text;a jsonb;rev text;lim int;offst int;flt text;datecol text;begin
 c:=myb_health_config_v1550(k);t:=c->>'table';if t is null or nullif(btrim(p_sync_id),'') is null then raise exception 'VALIDATION: Truy vấn không hợp lệ.';end if;
 select md5(coalesce(jsonb_agg(jsonb_build_array(id,last_seen_at) order by id)::text,'[]')) into rev from devices where family_id=f;
 if p_query->>'revision' is not null and p_query->>'revision'<>rev then raise exception 'CONFLICT: Dữ liệu vừa thay đổi; tải lại danh sách.';end if;
 lim:=least(500,greatest(1,coalesce((p_query->>'limit')::int,100)));offst:=greatest(0,coalesce((p_query->>'offset')::int,0));
 flt:='family_id=$1 and deleted_at is null and ($2 is null or id=$2::uuid)';
 if k not in('member','pregnancy') then flt:=flt||' and ($3 is null or member_id=$3::uuid)';end if;
 datecol:=c->'fields'->>'date';
 if datecol is not null then flt:=flt||format(' and ($4 is null or %I >= $4::date) and ($5 is null or %I <= $5::date)',datecol,datecol);end if;
 execute format('select coalesce(jsonb_agg(public.myb_health_doc_v1550($6,to_jsonb(s)) order by s.id),''[]'') from (select * from public.%I where %s order by id limit $7 offset $8) s',t,flt)
 into a using f,p_query->>'id',p_query->>'memberId',p_query->>'from',p_query->>'to',k,lim,offst;
 return jsonb_build_object('ok',true,'items',a,'revision',rev,'hasMore',jsonb_array_length(a)=lim,'limit',lim,'offset',offst);
exception when others then return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);end $$;
-- Only mapped columns are writable; typed records enforce the installed column types.
create or replace function public.myb_health_store_v1550(t text,vals jsonb) returns void
language plpgsql set search_path=public,pg_temp as $$
declare cols text;sets text;begin
 select string_agg(format('%I',a.attname),',' order by a.attnum),string_agg(format('%I=excluded.%I',a.attname,a.attname),',' order by a.attnum) filter(where a.attname<>'id') into cols,sets
 from pg_attribute a where a.attrelid=format('public.%I',t)::regclass and a.attnum>0 and not a.attisdropped and a.attgenerated='' and vals ? a.attname;
 execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) on conflict(id) do update set %s',t,cols,cols,t,sets) using vals;
end $$;
create or replace function public.myb_health_operation_v1550(p_sync_id text,p_op_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare o myb_health_operations_v1550;r jsonb;begin
 select * into o from myb_health_operations_v1550 where family_id=myb_stable_uuid('family:'||p_sync_id) and op_id=p_op_id;
 if not found then return jsonb_build_object('ok',true,'status','not_found');end if;
 r:=myb_health_row_v1550(o.family_id,o.response->>'kind',(o.response->>'rowId')::uuid);
 return o.response||jsonb_build_object('item',case when r is null or r->>'deleted_at' is not null then null else myb_health_doc_v1550(o.response->>'kind',r) end);
end $$;
create or replace function public.myb_health_write_v1550(p_sync_id text,p_device_key text,p_op_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);cmd jsonb:=p_command;k text;op text;data jsonb;c jsonb;t text;v_id uuid;member uuid;device uuid;old jsonb;doc jsonb;before_doc jsonb;before_extra jsonb;inverse_extra jsonb;vals jsonb;extra jsonb;expect text;a text;b text;v jsonb;stamp timestamptz:=clock_timestamp();cached myb_health_operations_v1550;undo_id uuid;hash text:=md5(p_command::text);answer jsonb;pid uuid;vid uuid;plan jsonb;fk record;used boolean;begin
 if p_op_id is null or nullif(btrim(p_sync_id),'') is null or jsonb_typeof(cmd) is distinct from 'object' then raise exception 'VALIDATION: Yêu cầu không hợp lệ.';end if;
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 select * into cached from myb_health_operations_v1550 where family_id=f and op_id=p_op_id;
 if found then if cached.request_hash<>hash then raise exception 'CONFLICT: Mã thao tác đã dùng cho nội dung khác.';end if;return myb_health_operation_v1550(p_sync_id,p_op_id);end if;
 if not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'VALIDATION: Gia đình không tồn tại.';end if;
 if cmd->>'op'='undo' then
 undo_id:=(cmd->>'operationId')::uuid;select * into cached from myb_health_operations_v1550 where family_id=f and op_id=undo_id;
 if not found or cached.undone then raise exception 'CONFLICT: Không còn hoàn tác được.';end if;inverse_extra:=cached.before_extra;
 old:=myb_health_row_v1550(f,cached.response->>'kind',(cached.response->>'rowId')::uuid);
 doc:=myb_health_doc_v1550(cached.response->>'kind',old);
 if doc->>'_etag' is distinct from cached.after_etag then raise exception 'CONFLICT: Bản ghi đã thay đổi sau đó.';end if;
 cmd:=jsonb_build_object('kind',cached.response->>'kind','op',case when cached.before_doc is null then 'delete' else 'save' end,'memberId',old->>'member_id','data',coalesce(cached.before_doc,jsonb_build_object('_dbId',old->>'id','id',old->>'legacy_id')),'expected',doc->>'_etag');
 end if;
 k:=cmd->>'kind';op:=cmd->>'op';data:=cmd->'data';c:=myb_health_config_v1550(k);t:=c->>'table';expect:=cmd->>'expected';
 if t is null or op not in('save','delete') or op is null or jsonb_typeof(data) is distinct from 'object' or nullif(data->>'id','') is null then raise exception 'VALIDATION: Loại, ID hoặc thao tác không hợp lệ.';end if;
 if pg_column_size(data)>5242880 then raise exception 'VALIDATION: Nội dung quá lớn.';end if;
 v_id:=coalesce(nullif(data->>'_dbId','')::uuid,myb_stable_uuid('health_v1550:'||k||':'||p_sync_id||':'||coalesce(cmd->>'memberId','')||':'||(data->>'id')));
 old:=myb_health_row_v1550(f,k,v_id);
 if old is null then execute format('select exists(select 1 from public.%I where id=$1)',t) into used using v_id;if used then raise exception 'CONFLICT: ID đã thuộc dữ liệu khác.';end if;end if;
 if old is not null then
 doc:=myb_health_doc_v1550(k,old);
 if expect is null or expect<>doc->>'_etag' or (old->>'deleted_at' is not null and undo_id is null) then raise exception 'CONFLICT: Bản ghi đã thay đổi. Tải lại và mở sửa lại.';end if;
 if old->>'deleted_at' is null then before_doc:=doc;before_extra:=old->'extra';end if;
 elsif expect is not null or op='delete' then raise exception 'CONFLICT: Không tìm thấy bản ghi.';end if;
 if exists(select 1 from jsonb_object_keys(data) x where k='member' and x=any(array['meas','vaccines','visits','meds','labs'])) then raise exception 'VALIDATION: Hồ sơ không nhận thay thế danh sách con.';end if;
 if k not in('member','pregnancy') then
 member:=nullif(cmd->>'memberId','')::uuid;
 if member is null or not exists(select 1 from health_members where id=member and family_id=f and deleted_at is null) or (old is not null and old->>'member_id' is distinct from member::text) then raise exception 'CONFLICT: Hồ sơ thành viên không hợp lệ.';end if;
 end if;
 device:=myb_stable_uuid('device:runtime:v1576:'||p_sync_id||':'||coalesce(nullif(p_device_key,''),'device'));
 insert into devices(id,family_id,device_name,device_type,platform,app_version,last_seen_at) values(device,f,coalesce(p_device_key,'Web device'),'browser','web','15.5.0',stamp) on conflict(id) do update set last_seen_at=stamp,app_version='15.5.0',deleted_at=null;
 if op='delete' then
 if k='member' then
 for fk in select n.nspname,c.relname,a.attname from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=con.conkey[1] where con.contype='f' and con.confrelid='public.health_members'::regclass and array_length(con.conkey,1)=1 loop
 if exists(select 1 from information_schema.columns where table_schema=fk.nspname and table_name=fk.relname and column_name='deleted_at') then
 execute format('select exists(select 1 from %I.%I where %I=$1 and deleted_at is null)',fk.nspname,fk.relname,fk.attname) into used using v_id;
 else execute format('select exists(select 1 from %I.%I where %I=$1)',fk.nspname,fk.relname,fk.attname) into used using v_id;end if;
 if used then raise exception 'IN_USE: Hồ sơ còn dữ liệu liên quan; không thể xóa.';end if;end loop;
 end if;
 execute format('update public.%I set deleted_at=$1,updated_at=$1,version=version+1 where id=$2 and family_id=$3',t) using stamp,v_id,f;
 if k='vaccines' and old->>'plan_id' is not null and not exists(select 1 from vaccine_records where plan_id=(old->>'plan_id')::uuid and deleted_at is null) then update child_vaccine_plans set status='pending',updated_at=stamp,version=version+1 where id=(old->>'plan_id')::uuid and family_id=f;end if;
 else
 if k='member' and coalesce(data->>'rel','') not in('Con','Mẹ','Ba','Ông','Bà','Khác') then raise exception 'VALIDATION: Quan hệ không hợp lệ.';end if;
 if k='member' and (length(btrim(coalesce(data->>'name','')))=0 or length(data->>'name')>150) then raise exception 'VALIDATION: Họ tên phải từ 1 đến 150 ký tự.';end if;
 if k='meas' then
 if coalesce(data->>'weight','')='' and coalesce(data->>'height','')='' and coalesce(data->>'head','')='' then raise exception 'VALIDATION: Nhập ít nhất một chỉ số.';end if;
 foreach a in array array['weight','height','head'] loop if nullif(data->>a,'') is not null and ((data->>a)::numeric<=0 or (data->>a)::numeric>1000) then raise exception 'VALIDATION: Chỉ số phải là số dương trong giới hạn nhập.';end if;end loop;
 end if;
 if k in('meds','labs','vaccines') and nullif(btrim(data->>'name'),'') is null then raise exception 'VALIDATION: Cần nhập tên.';end if;
 if k='visits' and nullif(btrim(data->>'diagnosis'),'') is null then raise exception 'VALIDATION: Cần nhập chẩn đoán.';end if;
 if c->'fields' ? 'date' and nullif(data->>'date','') is null and k<>'vaccines' then raise exception 'VALIDATION: Cần nhập ngày.';end if;
 if k='meds' and nullif(data->>'to','') is not null and (data->>'to')::date<(data->>'from')::date then raise exception 'VALIDATION: Ngày kết thúc trước ngày bắt đầu.';end if;
 vals:=jsonb_build_object('id',v_id,'family_id',f,'legacy_id',case when old is null then data->>'id' else old->>'legacy_id' end,'created_at',coalesce(old->>'created_at',stamp::text),'updated_at',stamp,'deleted_at',null,'version',coalesce((old->>'version')::int,0)+1,'created_by_device',coalesce(old->>'created_by_device',device::text),'updated_by_device',device,'last_op_id',p_op_id);
 if member is not null then vals:=vals||jsonb_build_object('member_id',member);end if;
 for a,b in select key,value from jsonb_each_text(c->'fields') loop
 if data ? a then v:=data->a; if v='""'::jsonb then v:='null'::jsonb;end if;vals:=vals||jsonb_build_object(b,v);end if;end loop;
 extra:=data-'_dbId'-'_memberId'-'_etag'-'_dbPlanId'-'version'-'updatedAt'-'createdAt';
 if k='member' then
 vals:=vals||jsonb_build_object('full_name',data->>'name','bhyt',data#>>'{medical,bhyt}','bhyt_exp',nullif(data#>>'{medical,bhytExp}',''),'bhyt_place',data#>>'{medical,bhytPlace}','bhxh',data#>>'{medical,bhxh}','hospital',data#>>'{medical,hospital}','doctor',data#>>'{medical,doctor}','emergency_contact',data#>>'{medical,emergency}','status_text',data#>>'{status,txt}','status_tone',data#>>'{status,tone}','notes',data#>>'{other,notes}');
 end if;
 if k='meas' then vals:=vals||jsonb_build_object('weight_g',nullif(data->>'weight','')::numeric*1000);end if;
 if k='vaccines' then
 if data->>'status'='Đã tiêm' and nullif(data->>'date','') is null then raise exception 'VALIDATION: Cần ngày tiêm thực tế.';end if;
 vid:=myb_stable_uuid('vaccine_catalog:'||f::text||':'||lower(data->>'name'));
 insert into vaccine_catalog(id,family_id,name,short_name,disease,manufacturer,is_required,is_service,active,created_at,updated_at) values(vid,f,data->>'name',data->>'name',data->>'disease',data->>'manufacturer',coalesce((data->>'required')::boolean,false),coalesce(data->>'source','')='dịch vụ',true,stamp,stamp) on conflict(id) do nothing;
 pid:=coalesce(nullif(old->>'plan_id','')::uuid,nullif(data->>'_dbPlanId','')::uuid,myb_stable_uuid('vaccine_plan:'||member::text||':'||coalesce(nullif(data->>'planId',''),nullif(data->>'scheduleKey',''),data->>'id')));
 select to_jsonb(p) into plan from child_vaccine_plans p where p.id=pid;
 if plan is not null and (plan->>'family_id'<>f::text or plan->>'member_id'<>member::text or (old is null and exists(select 1 from vaccine_records where plan_id=pid and deleted_at is null))) then raise exception 'CONFLICT: Lịch tiêm không thuộc hồ sơ hoặc đã được ghi nhận.';end if;
 insert into child_vaccine_plans(id,family_id,member_id,vaccine_id,dose_number,due_date,status,note,legacy_id,schedule_key,template_key,created_at,updated_at,extra)
 values(pid,f,member,vid,nullif(regexp_replace(coalesce(data->>'dose',''),'[^0-9]','','g'),'')::int,nullif(data->>'dueDate','')::date,case data->>'status' when 'Đã tiêm' then 'done' when 'Hoãn tiêm' then 'postponed' when 'Bỏ qua' then 'skipped' else 'pending' end,data->>'note',data->>'planId',data->>'scheduleKey',data->>'templateId',stamp,stamp,jsonb_build_object('recordId',v_id))
 on conflict(id) do update set vaccine_id=excluded.vaccine_id,dose_number=excluded.dose_number,due_date=excluded.due_date,status=excluded.status,note=excluded.note,updated_at=stamp,version=child_vaccine_plans.version+1,deleted_at=null;
 vals:=vals||jsonb_build_object('plan_id',pid,'vaccine_id',vid,'dose_number',nullif(regexp_replace(coalesce(data->>'dose',''),'[^0-9]','','g'),'')::int,'injection_date',case when data->>'status'='Đã tiêm' then nullif(data->>'date','') else null end);
 end if;
 vals:=vals||jsonb_build_object('extra',case when undo_id is not null and cached.before_doc is not null then coalesce(inverse_extra,'{}'::jsonb) else coalesce(old->'extra','{}')||extra end);
 perform myb_health_store_v1550(t,vals);
 end if;
 old:=myb_health_row_v1550(f,k,v_id);doc:=myb_health_doc_v1550(k,old);
 answer:=jsonb_build_object('ok',true,'status','applied','operationId',p_op_id,'kind',k,'rowId',v_id,'memberId',member,'sourceId',coalesce(old->>'legacy_id',v_id::text),'item',case when op='delete' then null else doc end);
 insert into myb_health_operations_v1550(family_id,op_id,request_hash,response,before_doc,before_extra,after_etag) values(f,p_op_id,hash,answer,before_doc,before_extra,doc->>'_etag');
 if undo_id is not null then update myb_health_operations_v1550 set undone=true where family_id=f and op_id=undo_id;end if;
 return answer;
exception when others then return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);end $$;
-- Retire whole-profile writes from older clients; preserve other legacy entities.
do $legacy$ declare def text;begin
 select pg_get_functiondef('public.myb_relational_apply_changes_v1576(text,text,jsonb)'::regprocedure) into def;
 if position('-- v1550 health writer guard' in def)=0 then
 if position('insert into public.families(' in def)=0 then raise exception 'V15.5 unexpected legacy apply definition.';end if;
 def:=replace(def,'insert into public.families(',E'-- v1550 health writer guard\n if exists(select 1 from jsonb_array_elements(p_changes) c where lower(c->>''entity'') in (''health_member'',''pregnancy'')) then raise exception ''API_RETIRED: Please use the V15.5 health API.'';end if;\n insert into public.families(');
 execute def;
 end if;
end $legacy$;
-- New shell preserves modules outside health; old shell remains for older clients.
do $shell$ declare def text;a int;b int;begin
 select pg_get_functiondef('public.myb_app_shell_v1540(text)'::regprocedure) into def;
 a:=position('select coalesce(jsonb_agg(member_doc' in def);b:=position('v_care := ' in def);
 if a=0 or b<=a then raise exception 'V15.5 shell: unexpected member query definition.';end if;
 def:=left(def,a-1)||E'v_members := ''[]''::jsonb; v_hb := ''{}''::jsonb;\n '||substring(def from b);
 a:=position('select coalesce(jsonb_agg(coalesce(pr.extra' in def);b:=position('select coalesce(jsonb_agg(coalesce(am.extra' in def);
 if a=0 or b<=a then raise exception 'V15.5 shell: unexpected pregnancy query definition.';end if;
 def:=left(def,a-1)||E'v_preg := ''[]''::jsonb;\n '||substring(def from b);
 def:=replace(def,'public.myb_app_shell_v1540(', 'public.myb_app_shell_v1550(');execute def;
end $shell$;
revoke all on function myb_health_config_v1550(text),myb_health_doc_v1550(text,jsonb),myb_health_row_v1550(uuid,text,uuid),myb_health_store_v1550(text,jsonb) from public,anon,authenticated;
revoke all on function myb_health_list_v1550(text,jsonb),myb_health_write_v1550(text,text,uuid,jsonb),myb_health_operation_v1550(text,uuid),myb_app_shell_v1550(text) from public;
grant execute on function myb_health_list_v1550(text,jsonb),myb_health_write_v1550(text,text,uuid,jsonb),myb_health_operation_v1550(text,uuid),myb_app_shell_v1550(text) to anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
