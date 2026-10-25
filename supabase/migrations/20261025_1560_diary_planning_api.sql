-- V15.6.0 Diary & Planning Data Access. Install after 1530, 1540, 1550.
-- No business rows are reset. Finish pending operations and update all clients.
begin;
alter table public.diary_entries add column if not exists version integer not null default 1;
alter table public.diary_entries add column if not exists extra jsonb not null default '{}';
alter table public.appointments add column if not exists version integer not null default 1;
alter table public.appointments add column if not exists extra jsonb not null default '{}';
alter table public.milestones add column if not exists version integer not null default 1;
alter table public.milestones add column if not exists extra jsonb not null default '{}';
alter table public.monthly_notes add column if not exists version integer not null default 1;
alter table public.monthly_notes add column if not exists extra jsonb not null default '{}';
alter table public.monthly_notes add column if not exists created_at timestamptz not null default now();
create index if not exists idx_diary_family_date_v1560 on public.diary_entries(family_id,entry_date desc,id) where deleted_at is null;
create index if not exists idx_appointments_family_date_v1560 on public.appointments(family_id,appointment_date desc,id) where deleted_at is null;
create index if not exists idx_milestones_family_date_v1560 on public.milestones(family_id,milestone_date desc,id) where deleted_at is null;
create table if not exists public.myb_planning_operations_v1560(
 family_id uuid not null references families(id) on delete cascade,op_id uuid not null,
 request_hash text not null,response jsonb not null,before_row jsonb,after_etag text not null,
 undone boolean not null default false,created_at timestamptz not null default now(),primary key(family_id,op_id));
alter table public.myb_planning_operations_v1560 enable row level security;
revoke all on public.myb_planning_operations_v1560 from public,anon,authenticated;
create or replace function public.myb_planning_config_v1560(k text) returns jsonb language sql immutable set search_path=public,pg_temp as $$
select '{"diary":{"table":"diary_entries","fields":{"date":"entry_date","timeFrom":"time_from","timeTo":"time_to","category":"category","title":"title","note":"note"}},"appointment":{"table":"appointments","fields":{"date":"appointment_date","timeFrom":"appointment_time","timeTo":"time_to","typeId":"legacy_type_id","typeName":"type_name","title":"title","place":"place","doctor":"doctor","person":"person","cost":"cost_text","status":"status","note":"note"}},"milestone":{"table":"milestones","fields":{"date":"milestone_date","key":"milestone_key","title":"title","type":"type","category":"category","icon":"icon","time":"milestone_time","description":"description","note":"note","photos":"photos","auto":"auto"}},"month":{"table":"monthly_notes","fields":{"monthIndex":"month_index","note":"note"}}}'::jsonb->k
$$;
do $$declare k text;c jsonb;col text;begin foreach k in array array['diary','appointment','milestone','month'] loop
 c:=myb_planning_config_v1560(k);for col in select value from jsonb_each_text(c->'fields') loop
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name=c->>'table' and column_name=col) then raise exception 'V15.6 schema mismatch: %.%',c->>'table',col;end if;end loop;end loop;end$$;
create or replace function public.myb_planning_doc_v1560(k text,r jsonb) returns jsonb language plpgsql stable set search_path=public,pg_temp as $$
declare d jsonb:=coalesce(r->'extra','{}');a text;b text;begin
 for a,b in select key,value from jsonb_each_text(myb_planning_config_v1560(k)->'fields') loop d:=d||jsonb_build_object(a,coalesce(nullif(r->b,'null'::jsonb),'""'::jsonb));end loop;
 if k in('diary','appointment') then d:=d||jsonb_build_object('time',coalesce(r->>(case k when 'diary' then 'time_from' else 'appointment_time' end),''));end if;
 if k='milestone' then d:=d||jsonb_build_object('photos',coalesce(r->'photos','[]'),'auto',coalesce(r->'auto','false'));end if;
 return d||jsonb_build_object('id',case when k='month' then r->>'month_index' else coalesce(nullif(r->>'legacy_id',''),r->>'id') end,'_dbId',r->>'id','_memberId',r->>'member_id','_etag',md5(r::text),'version',r->'version','createdAt',r->'created_at','updatedAt',r->'updated_at');
end$$;
create or replace function public.myb_planning_row_v1560(f uuid,k text,i uuid) returns jsonb language plpgsql stable set search_path=public,pg_temp as $$
declare r jsonb;t text:=myb_planning_config_v1560(k)->>'table';begin
 if t is null then raise exception 'VALIDATION: Loại dữ liệu không hợp lệ.';end if;
 execute format('select to_jsonb(t) from public.%I t where family_id=$1 and id=$2',t) into r using f,i;return r;end$$;
create or replace function public.myb_planning_list_v1560(p_sync_id text,p_query jsonb default '{}') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);k text:=coalesce(p_query->>'kind','diary');c jsonb;t text;flt text;dt text;lim int;offst int;rev text;a jsonb;begin
 c:=myb_planning_config_v1560(k);t:=c->>'table';if t is null or nullif(btrim(p_sync_id),'') is null then raise exception 'VALIDATION: Truy vấn không hợp lệ.';end if;
 -- Hash actual rows, not only device heartbeats: direct SQL edits invalidate pagination too.
 execute format('select md5(coalesce(jsonb_agg(to_jsonb(x) order by id)::text,''[]'')) from public.%I x where family_id=$1',t) into rev using f;
 if p_query->>'revision' is not null and p_query->>'revision'<>rev then raise exception 'CONFLICT: Dữ liệu vừa thay đổi. Tải lại danh sách.';end if;
 lim:=least(200,greatest(1,coalesce((p_query->>'limit')::int,50)));offst:=greatest(0,coalesce((p_query->>'offset')::int,0));
 flt:='family_id=$1 and deleted_at is null and ($2 is null or id=$2::uuid)';dt:=c->'fields'->>'date';
 if dt is not null then flt:=flt||format(' and ($3 is null or %I >= $3::date) and ($4 is null or %I <= $4::date)',dt,dt);end if;
 if k='month' then flt:=flt||' and ($5 is null or month_index=$5::int)';
 elsif k='appointment' then flt:=flt||' and ($5 is null or legacy_type_id=$5 or type_id::text=$5)';
 else flt:=flt||' and ($5 is null or category=$5)';end if;
 execute format('select coalesce(jsonb_agg(myb_planning_doc_v1560($6,to_jsonb(s)) order by %s),''[]'') from (select * from public.%I where %s order by %s limit $7 offset $8) s',case when dt is null then 's.month_index,s.id' else format('s.%I desc nulls last,s.id',dt) end,t,flt,case when dt is null then 'month_index,id' else format('%I desc nulls last,id',dt) end)
 into a using f,p_query->>'id',p_query->>'from',p_query->>'to',nullif(p_query->>'category',''),k,lim+1,offst;
 return jsonb_build_object('ok',true,'items',case when jsonb_array_length(a)>lim then a-(jsonb_array_length(a)-1) else a end,'hasMore',jsonb_array_length(a)>lim,'revision',rev,'offset',offst,'limit',lim);
exception when others then return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);end$$;
create or replace function public.myb_planning_operation_v1560(p_sync_id text,p_op_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare o myb_planning_operations_v1560;r jsonb;begin
 select * into o from myb_planning_operations_v1560 where family_id=myb_stable_uuid('family:'||p_sync_id) and op_id=p_op_id;
 if not found then return jsonb_build_object('ok',true,'status','not_found');end if;
 r:=myb_planning_row_v1560(o.family_id,o.response->>'kind',(o.response->>'rowId')::uuid);
 return o.response||jsonb_build_object('item',case when r is null or r->>'deleted_at' is not null then null else myb_planning_doc_v1560(o.response->>'kind',r) end);end$$;
create or replace function public.myb_planning_write_v1560(p_sync_id text,p_device_key text,p_op_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);cmd jsonb:=p_command;k text;op text;d jsonb;c jsonb;t text;i uuid;r jsonb;before jsonb;vals jsonb;doc jsonb;expected text;dev uuid;stamp timestamptz:=clock_timestamp();a text;b text;v jsonb;cat jsonb;existing uuid;used boolean;undo_id uuid;o myb_planning_operations_v1560;hash text:=md5(p_command::text);ans jsonb;mi int;begin
 if p_op_id is null or nullif(btrim(p_sync_id),'') is null or jsonb_typeof(cmd) is distinct from 'object' then raise exception 'VALIDATION: Yêu cầu không hợp lệ.';end if;
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 select * into o from myb_planning_operations_v1560 where family_id=f and op_id=p_op_id;
 if found then if o.request_hash<>hash then raise exception 'CONFLICT: Mã thao tác đã dùng cho nội dung khác.';end if;return myb_planning_operation_v1560(p_sync_id,p_op_id);end if;
 if not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'VALIDATION: Gia đình không tồn tại.';end if;
 if cmd->>'op'='undo' then
 undo_id:=(cmd->>'operationId')::uuid;select * into o from myb_planning_operations_v1560 where family_id=f and op_id=undo_id;
 if not found or o.undone then raise exception 'CONFLICT: Không còn hoàn tác được.';end if;
 r:=myb_planning_row_v1560(f,o.response->>'kind',(o.response->>'rowId')::uuid);
 if r is null or md5(r::text) is distinct from o.after_etag then raise exception 'CONFLICT: Bản ghi đã thay đổi sau đó.';end if;
 k:=o.response->>'kind';i:=(o.response->>'rowId')::uuid;t:=myb_planning_config_v1560(k)->>'table';before:=case when r->>'deleted_at' is null then r else null end;
 if o.before_row is null then execute format('update public.%I set deleted_at=$1,updated_at=$1,version=version+1 where id=$2 and family_id=$3',t) using stamp,i,f;
 else
 vals:=o.before_row||jsonb_build_object('updated_at',stamp,'version',(r->>'version')::int+1);
 perform myb_health_store_v1550(t,vals);
 end if;
 else
 k:=cmd->>'kind';op:=cmd->>'op';d:=cmd->'data';c:=myb_planning_config_v1560(k);t:=c->>'table';expected:=cmd->>'expected';
 if t is null or op is null or op not in('save','delete') or jsonb_typeof(d) is distinct from 'object' or nullif(d->>'id','') is null or length(d->>'id')>200 then raise exception 'VALIDATION: Loại, ID hoặc thao tác không hợp lệ.';end if;
 if pg_column_size(d)>10000000 then raise exception 'VALIDATION: Nội dung quá lớn.';end if;
 i:=nullif(d->>'_dbId','')::uuid;
 if i is null then
 if k='month' then
 if coalesce(d->>'monthIndex',d->>'id') !~ '^[0-9]{1,4}$' then raise exception 'VALIDATION: Chỉ số tháng không hợp lệ.';end if;mi:=coalesce(d->>'monthIndex',d->>'id')::int;
 select id into existing from monthly_notes where family_id=f and month_index=mi;
 if existing is not null then raise exception 'CONFLICT: Tháng đã có ghi chú. Tải lại trước khi sửa.';end if;
 i:=myb_stable_uuid('month_note:'||p_sync_id||':'||mi::text);
 elsif k='milestone' and coalesce((d->>'auto')::boolean,false) then
 if nullif(d->>'key','') is null then raise exception 'VALIDATION: Cột mốc tự động cần khóa nguồn.';end if;
 if exists(select 1 from milestones where family_id=f and milestone_key=d->>'key') then raise exception 'CONFLICT: Cột mốc nguồn đã tồn tại. Tải lại.';end if;
 i:=myb_stable_uuid('planning_auto:'||p_sync_id||':'||(d->>'key'));
 else i:=myb_stable_uuid('planning_v1560:'||k||':'||p_sync_id||':'||(d->>'id'));end if;
 end if;
 r:=myb_planning_row_v1560(f,k,i);
 if r is null then execute format('select exists(select 1 from public.%I where id=$1)',t) into used using i;if used then raise exception 'CONFLICT: ID thuộc gia đình khác.';end if;end if;
 if r is not null then
 if expected is null or expected<>md5(r::text) or r->>'deleted_at' is not null then raise exception 'CONFLICT: Bản ghi đã thay đổi. Tải lại và mở sửa lại.';end if;before:=r;
 elsif expected is not null or op='delete' then raise exception 'CONFLICT: Không tìm thấy bản ghi.';end if;
 if k='milestone' and r->>'auto'='true' and (op='delete' or coalesce((d->>'auto')::boolean,false)=false or d->>'key' is distinct from r->>'milestone_key') then raise exception 'IN_USE: Cột mốc tự động theo dữ liệu nguồn; chỉ sửa ghi chú và ảnh.';end if;
 if op='delete' then execute format('update public.%I set deleted_at=$1,updated_at=$1,version=version+1 where id=$2 and family_id=$3',t) using stamp,i,f;
 else
 if k<>'month' and (nullif(d->>'date','') is null or (d->>'date')::date is null) then raise exception 'VALIDATION: Cần nhập ngày hợp lệ.';end if;
 if k in('diary','milestone') and nullif(btrim(d->>'title'),'') is null then raise exception 'VALIDATION: Cần nhập tiêu đề.';end if;
 if length(coalesce(d->>'title',''))>500 or length(coalesce(d->>'note',''))>100000 or length(coalesce(d->>'description',''))>100000 then raise exception 'VALIDATION: Nội dung quá dài.';end if;
 if k in('diary','appointment') then
 foreach a in array array['timeFrom','timeTo'] loop if nullif(d->>a,'') is not null and d->>a !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'VALIDATION: Giờ không hợp lệ.';end if;end loop;
 if k='appointment' and nullif(d->>'timeFrom','') is null then raise exception 'VALIDATION: Cần nhập giờ bắt đầu.';end if;
 if nullif(d->>'timeTo','') is not null and (nullif(d->>'timeFrom','') is null or d->>'timeTo'<d->>'timeFrom') then raise exception 'VALIDATION: Giờ kết thúc trước giờ bắt đầu.';end if;
 end if;
 vals:=jsonb_build_object('id',i,'family_id',f,'created_at',coalesce(r->>'created_at',stamp::text),'updated_at',stamp,'version',coalesce((r->>'version')::int,0)+1,'deleted_at',null);
 if k<>'month' then vals:=vals||jsonb_build_object('legacy_id',case when r is null then d->>'id' else r->>'legacy_id' end);end if;
 for a,b in select key,value from jsonb_each_text(c->'fields') loop if d ? a then v:=d->a;if v='""'::jsonb and a not in('note','title','description') then v:='null'::jsonb;end if;vals:=vals||jsonb_build_object(b,v);end if;end loop;
 if k='month' then
 mi:=coalesce(d->>'monthIndex',d->>'id')::int;
 if mi<0 or mi>9999 or (r is not null and (r->>'month_index')::int<>mi) then raise exception 'VALIDATION: Không đổi tháng của ghi chú.';end if;
 vals:=vals||jsonb_build_object('month_index',mi);
 end if;
 if k='appointment' then
 select to_jsonb(x) into cat from care_categories x where family_id=f and category_type='appointment_type' and deleted_at is null and (legacy_id=d->>'typeId' or id::text=d->>'typeId') limit 1;
 if cat is null or (cat->>'active'='false' and (r is null or r->>'legacy_type_id' is distinct from d->>'typeId')) then raise exception 'VALIDATION: Loại lịch không tồn tại hoặc đã tạm ẩn.';end if;
 vals:=vals||jsonb_build_object('type_id',(cat->>'id')::uuid,'type_name',concat_ws(' ',nullif(cat->>'icon',''),cat->>'name'));
 end if;
 if k='diary' and nullif(d->>'category','') is not null then
 select to_jsonb(x) into cat from care_categories x where family_id=f and category_type='diary_type' and deleted_at is null and (legacy_id=d->>'category' or id::text=d->>'category' or name=d->>'category') limit 1;
 if cat is null or (cat->>'active'='false' and (r is null or r->>'category' is distinct from d->>'category')) then raise exception 'VALIDATION: Loại nhật ký không tồn tại hoặc đã tạm ẩn.';end if;
 end if;
 if d ? '_memberId' then
 if nullif(d->>'_memberId','') is not null and not exists(select 1 from health_members where id=(d->>'_memberId')::uuid and family_id=f and deleted_at is null) then raise exception 'VALIDATION: Hồ sơ liên kết không hợp lệ.';end if;
 vals:=vals||jsonb_build_object('member_id',nullif(d->>'_memberId','')::uuid);
 elsif r is null and k in('diary','milestone','appointment') then
 select id into existing from health_members where family_id=f and relation='Con' and deleted_at is null order by created_at limit 1;
 if k='appointment' and lower(coalesce(d->>'person','')) not in('con','bé','baby','child') then existing:=null;end if;
 vals:=vals||jsonb_build_object('member_id',existing);
 end if;
 if k='milestone' then
 if jsonb_typeof(d->'photos') is distinct from 'array' or jsonb_array_length(d->'photos')>20 or exists(select 1 from jsonb_array_elements(d->'photos') x where jsonb_typeof(x)<>'string' or length(x#>>'{}')>500000 or x#>>'{}' !~ '^(data:image/(jpeg|png|webp|gif);base64,|https://)') then raise exception 'VALIDATION: Ảnh cột mốc không hợp lệ (tối đa 20 ảnh).';end if;
 if r->>'auto'='true' then vals:=r||jsonb_build_object('note',d->>'note','photos',d->'photos','updated_at',stamp,'version',(r->>'version')::int+1);end if;
 end if;
 vals:=vals||jsonb_build_object('extra',coalesce(r->'extra','{}')||(d-'_dbId'-'_memberId'-'_etag'-'version'-'createdAt'-'updatedAt'-'_derived'));
 perform myb_health_store_v1550(t,vals);
 end if;
 end if;
 -- Signal in same transaction, including Undo; any later error rolls all writes back.
 dev:=myb_stable_uuid('device:runtime:v1576:'||p_sync_id||':'||coalesce(nullif(p_device_key,''),'device'));
 insert into devices(id,family_id,device_name,device_type,platform,app_version,last_seen_at) values(dev,f,coalesce(p_device_key,'Web device'),'browser','web','15.6.0',stamp) on conflict(id) do update set last_seen_at=stamp,app_version='15.6.0',deleted_at=null;
 r:=myb_planning_row_v1560(f,k,i);doc:=myb_planning_doc_v1560(k,r);
 ans:=jsonb_build_object('ok',true,'status','applied','operationId',p_op_id,'kind',k,'rowId',i,'sourceId',doc->>'id','monthIndex',r->'month_index','item',case when r->>'deleted_at' is null then doc else null end);
 insert into myb_planning_operations_v1560(family_id,op_id,request_hash,response,before_row,after_etag) values(f,p_op_id,hash,ans,before,md5(r::text));
 if undo_id is not null then update myb_planning_operations_v1560 set undone=true where family_id=f and op_id=undo_id;end if;
 return ans;
exception when others then return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);end$$;
-- Block legacy planning writes; keep all other entity routes.
do $$declare def text;begin
 select pg_get_functiondef('myb_relational_apply_changes_v1576(text,text,jsonb)'::regprocedure) into def;
 if position('-- v1560 planning writer guard' in def)=0 then
 if position('insert into public.families(' in def)=0 then raise exception 'V15.6 unexpected legacy writer definition.';end if;
 def:=replace(def,'insert into public.families(',E'-- v1560 planning writer guard\n if exists(select 1 from jsonb_array_elements(p_changes) c where lower(c->>''entity'') in (''diary_entry'',''appointment'',''milestone'',''monthly_notes'')) then raise exception ''API_RETIRED: Please use V15.6 planning API.'';end if;\n insert into public.families(');execute def;end if;end$$;
-- Remove only planning queries from the verified 1550 shell. No full export at runtime.
do $$declare def text;a int;b int;begin
 select pg_get_functiondef('myb_app_shell_v1550(text)'::regprocedure) into def;
 a:=position('select coalesce(jsonb_agg(coalesce(de.extra' in def);b:=position('v_preg := ' in def);
 if a=0 or b<=a then raise exception 'V15.6 unexpected shell planning anchors.';end if;
 def:=left(def,a-1)||E'v_diary := ''[]''::jsonb; v_ms := ''[]''::jsonb; v_appt := ''[]''::jsonb;\n '||substring(def from b);
 a:=position('select coalesce(jsonb_object_agg(mn.month_index::text,mn.note)' in def);
 b:=position('select coalesce(jsonb_agg(coalesce(cc.extra' in def);
 if a=0 or b<=a then raise exception 'V15.6 unexpected shell month anchors.';end if;
 def:=left(def,a-1)||E'v_monthly := ''{}''::jsonb;\n '||substring(def from b);
 def:=replace(def,'public.myb_app_shell_v1550(', 'public.myb_app_shell_v1560(');execute def;end$$;
revoke all on function myb_planning_config_v1560(text),myb_planning_doc_v1560(text,jsonb),myb_planning_row_v1560(uuid,text,uuid) from public,anon,authenticated;
revoke all on function myb_planning_list_v1560(text,jsonb),myb_planning_write_v1560(text,text,uuid,jsonb),myb_planning_operation_v1560(text,uuid),myb_app_shell_v1560(text) from public;
grant execute on function myb_planning_list_v1560(text,jsonb),myb_planning_write_v1560(text,text,uuid,jsonb),myb_planning_operation_v1560(text,uuid),myb_app_shell_v1560(text) to anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
