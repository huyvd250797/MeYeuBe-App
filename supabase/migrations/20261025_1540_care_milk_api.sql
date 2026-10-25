-- V15.4.0; additive migration for the supplied PostgreSQL 17.6 schema.
-- No business rows are rebuilt. The existing Sync ID capability model is retained.
begin;
create index if not exists idx_myb_milk_tx_family_care_v1540 on public.milk_transactions(family_id,care_event_id) where care_event_id is not null;
create table if not exists public.myb_care_operations_v1540 (
 family_id uuid not null references public.families(id) on delete cascade,
 op_id uuid not null, request_hash text not null, response jsonb not null,
 before_event jsonb, affected_milk_ids uuid[] not null, after_hash text not null,
 undone boolean not null default false, created_at timestamptz not null default now(),
 primary key(family_id,op_id)
);
alter table public.myb_care_operations_v1540 enable row level security;
revoke all on public.myb_care_operations_v1540 from public,anon,authenticated;

create or replace function public.myb_care_doc_v1540(p public.care_events) returns jsonb
language sql stable set search_path=public,pg_temp as $$
 select coalesce(p.extra,'{}') || jsonb_strip_nulls(jsonb_build_object(
 'id',coalesce(p.legacy_id,p.id::text),'type',p.type,'date',p.event_date,
 'timeFrom',p.time_from,'timeTo',p.time_to,'amount',p.amount,'unit',p.unit,
 'source',p.source,'status',case when p.status='active' then '' else p.status end,
 'note',coalesce(p.note,''),'createdAt',p.created_at,'updatedAt',p.updated_at,'version',p.version))
$$;
create or replace function public.myb_milk_doc_v1540(p public.milk_items) returns jsonb
language sql stable set search_path=public,pg_temp as $$
 select coalesce(p.extra,'{}') || jsonb_strip_nulls(jsonb_build_object(
 'id',coalesce(p.legacy_id,p.id::text),'shortId',p.short_code,'amount',p.amount_ml,
 'remaining',coalesce(p.remaining_ml,b.remaining_ml,0),'containerId',c.legacy_id,
 'containerKind',p.container_kind,'containerName',p.container_name,'storage',p.storage,
 'expireDateTime',p.expire_at,'expireDate',p.expire_at,
 'status',case when p.status='discarded' then 'Đã bỏ' when p.expire_at<=now() then 'Đã quá hạn'
 when coalesce(p.remaining_ml,b.remaining_ml,0)<=0 then 'Đã sử dụng hết' else 'Đang bảo quản' end,
 'pumpEventId',ce.legacy_id,'note',coalesce(p.note,''),'createdAt',p.created_at,
 'updatedAt',p.updated_at,'version',p.version))
 from (select 1) q left join public.milk_item_balances b on b.milk_item_id=p.id
 left join public.milk_containers c on c.id=p.container_id
 left join public.pump_events pe on pe.id=p.pump_event_id
 left join public.care_events ce on ce.id=pe.care_event_id
$$;
-- Query parameters are typed/bounded; offset is only for browsing, never for identity.
create or replace function public.myb_care_list_v1540(p_sync_id text,p_query jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); a jsonb; n int; lim int; offst int; k text; revision text;
begin
 if nullif(btrim(p_sync_id),'') is null then raise exception 'VALIDATION: Sync ID trống.'; end if;
 select md5(coalesce(jsonb_agg(jsonb_build_array(id,last_seen_at) order by id)::text,'[]')) into revision from devices where family_id=f;
 if p_query->>'revision' is not null and p_query->>'revision'<>revision then raise exception 'CONFLICT: Dữ liệu đã thay đổi trong lúc tải; tải lại danh sách.';end if;
 k:=coalesce(p_query->>'kind','care'); lim:=least(500,greatest(1,coalesce((p_query->>'limit')::int,100))); offst:=greatest(0,coalesce((p_query->>'offset')::int,0));
 if k='care' then
 select coalesce(jsonb_agg(doc order by d desc,t desc,id),'[]'),count(*) into a,n from (
 select public.myb_care_doc_v1540(c) doc,c.event_date d,c.time_from t,c.id from public.care_events c
 where c.family_id=f and c.deleted_at is null
 and (p_query->>'id' is null or coalesce(c.legacy_id,c.id::text)=p_query->>'id')
 and (p_query->>'type' is null or c.type=p_query->>'type')
 and (p_query->>'from' is null or coalesce(nullif(c.extra->>'endDate','')::date,c.event_date)>= (p_query->>'from')::date or (c.type='sleep' and nullif(c.time_to,'') is null))
 and (p_query->>'to' is null or c.event_date<= (p_query->>'to')::date)
 order by c.event_date desc,c.time_from desc,c.id limit lim offset offst) s;
 elsif k='milk' then
 select coalesce(jsonb_agg(doc order by created_at,id),'[]'),count(*) into a,n from (
 select public.myb_milk_doc_v1540(m) doc,m.created_at,m.id from public.milk_items m where m.family_id=f and m.deleted_at is null
 and (p_query->>'id' is null or coalesce(m.legacy_id,m.id::text)=p_query->>'id')
 and (coalesce((p_query->>'available')::boolean,false)=false or (coalesce(m.remaining_ml,(select remaining_ml from milk_item_balances where milk_item_id=m.id),0)>0 and m.status<>'discarded' and (m.expire_at is null or m.expire_at>now())))
 order by m.created_at,m.id limit lim offset offst) s;
 else raise exception 'VALIDATION: Loại dữ liệu không hợp lệ.'; end if;
 return jsonb_build_object('ok',true,'items',a,'hasMore',n=lim,'offset',offst,'limit',lim,'revision',revision);
exception when others then return jsonb_build_object('ok',false,'code',split_part(sqlerrm,':',1),'message',sqlerrm); end $$;

-- Fingerprint ONLY the operation footprint. Includes ledger and subtypes, so Undo
-- refuses consumption, transfers or edits performed after the original operation.
create or replace function public.myb_care_hash_v1540(f uuid,e uuid,ids uuid[]) returns text
language sql stable set search_path=public,pg_temp as $$
 select md5(jsonb_build_object(
 'care',(select to_jsonb(c) from care_events c where c.id=e and c.family_id=f),
 'milk',(select coalesce(jsonb_agg(to_jsonb(m) order by m.id),'[]') from milk_items m where m.family_id=f and m.id=any(ids)),
 'tx',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from milk_transactions t where t.family_id=f and (t.care_event_id=e or t.milk_item_id=any(ids))),
 'feed',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from feed_events t where t.family_id=f and t.care_event_id=e),
 'sources',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from feed_milk_sources t where t.family_id=f and t.feed_event_id in(select id from feed_events where care_event_id=e)),
 'pump',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from pump_events t where t.family_id=f and t.care_event_id=e),
 'sleep',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from sleep_events t where t.family_id=f and t.care_event_id=e),
 'diaper',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from diaper_events t where t.family_id=f and t.care_event_id=e),
 'temp',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from temperature_events t where t.family_id=f and t.care_event_id=e)
 )::text)
$$;
-- Align only a touched legacy row to its current authoritative stored remaining.
-- This preserves historical balances; never replays client event history.
create or replace function public.myb_milk_align_v1540(f uuid,m uuid,d uuid) returns void
language plpgsql set search_path=public,pg_temp as $$
declare r numeric; b numeric;
begin
 select remaining_ml into r from milk_items where id=m and family_id=f;
 select mi.amount_ml+coalesce(sum(case when mt.transaction_type in('feed_use','discard','transfer_out') then -mt.ml when mt.transaction_type in('transfer_in','adjust') then mt.ml else 0 end) filter(where mt.deleted_at is null),0) into b from milk_items mi left join milk_transactions mt on mt.milk_item_id=mi.id where mi.id=m and mi.family_id=f and mi.deleted_at is null group by mi.id;
 if r is null then update milk_items set remaining_ml=b where id=m and family_id=f;
 elsif b is not null and r<>b then
 insert into milk_transactions(id,family_id,milk_item_id,transaction_type,ml,reason,created_by_device)
 values(gen_random_uuid(),f,m,'adjust',r-b,'V15.4 preserve existing remaining',d);
 end if;
end $$;
create or replace function public.myb_milk_refresh_v1540(f uuid,m uuid,d uuid,o uuid) returns void
language plpgsql set search_path=public,pg_temp as $$
declare r numeric;
begin
 select remaining_ml into r from milk_item_balances where milk_item_id=m;
 update milk_items set remaining_ml=r,status=case when status='discarded' then status when r<=0 then 'used_up' else 'storing' end,
 legacy_status=null,version=version+1,updated_at=clock_timestamp(),updated_by_device=d,last_op_id=o where id=m and family_id=f and deleted_at is null;
end $$;

create or replace function public.myb_care_operation_v1540(p_sync_id text,p_op_id uuid) returns jsonb
language sql security definer set search_path=public,pg_temp as $$
 select coalesce((select o.response||jsonb_build_object(
 'event',(select myb_care_doc_v1540(c) from care_events c where c.family_id=o.family_id and c.legacy_id=o.response->>'eventId' and c.deleted_at is null),
 'milkItems',(select coalesce(jsonb_agg(myb_milk_doc_v1540(m) order by m.id),'[]') from milk_items m where m.family_id=o.family_id and m.id=any(o.affected_milk_ids) and m.deleted_at is null),
 'deletedMilkIds',(select coalesce(jsonb_agg(m.legacy_id order by m.id),'[]') from milk_items m where m.family_id=o.family_id and m.id=any(o.affected_milk_ids) and m.deleted_at is not null))
 from myb_care_operations_v1540 o where o.family_id=myb_stable_uuid('family:'||p_sync_id) and o.op_id=p_op_id),jsonb_build_object('ok',true,'status','not_found'))
$$;

create or replace function public.myb_care_write_v1540(p_sync_id text,p_device_key text,p_op_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
 f uuid:=public.myb_stable_uuid('family:'||p_sync_id); d uuid; eid uuid; pid uuid; fid uuid; mid uuid; cid uuid; child uuid;
 cmd jsonb:=p_command; ev jsonb; old public.care_events; before_doc jsonb; expect jsonb; op text; sid text; typ text; h text:=md5(p_command::text);
 old_usage jsonb:='{}'; cached public.myb_care_operations_v1540; undone_op uuid; ids uuid[]:=array[]::uuid[]; r record; src jsonb; sources jsonb; normalized jsonb:='[]'; snapshots jsonb:='[]';
 label text; amount numeric; used numeric; disc numeric; remaining numeric; total numeric:=0; waste numeric; expire timestamptz; cont public.milk_containers;
 linked public.milk_items; target_sid text; stamp timestamptz:=clock_timestamp(); result jsonb; deleted text[]:=array[]::text[]; mi jsonb; ce jsonb; i int:=0;
begin
 if p_op_id is null or nullif(btrim(p_sync_id),'') is null or length(p_sync_id)>200 or jsonb_typeof(cmd) is distinct from 'object' then raise exception 'VALIDATION: Yêu cầu không hợp lệ.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 select * into cached from myb_care_operations_v1540 where family_id=f and op_id=p_op_id;
 if found then
 if cached.request_hash<>h then raise exception 'CONFLICT: Mã thao tác đã dùng cho nội dung khác.'; end if;
 return myb_care_operation_v1540(p_sync_id,p_op_id); end if;
 if not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'VALIDATION: Không tìm thấy gia đình.'; end if;
 if cmd->>'op'='undo' then
 undone_op:=(cmd->>'operationId')::uuid;
 select * into cached from myb_care_operations_v1540 where family_id=f and op_id=undone_op for update;
 if not found or cached.undone then raise exception 'CONFLICT: Thao tác không còn hoàn tác được.'; end if;
 sid:=cached.response->>'eventId'; eid:=myb_stable_uuid('care_event:'||p_sync_id||':'||sid);
 if public.myb_care_hash_v1540(f,eid,cached.affected_milk_ids)<>cached.after_hash then raise exception 'CONFLICT: Dữ liệu đã được sử dụng hoặc thay đổi sau đó. Không thể hoàn tác.'; end if;
 select * into old from care_events where id=eid and family_id=f;
 cmd:=jsonb_build_object('op',case when cached.before_event is null then 'delete' else 'save' end,'event',coalesce(cached.before_event,jsonb_build_object('id',sid)),
 'expected',jsonb_build_object('updatedAt',old.updated_at,'version',old.version));
 end if;
 op:=cmd->>'op'; ev:=cmd->'event'; sid:=ev->>'id'; expect:=nullif(cmd->'expected','null'::jsonb);
 if op is null or op not in ('save','delete') or nullif(btrim(sid),'') is null or length(sid)>200 then raise exception 'VALIDATION: Thao tác hoặc ID không hợp lệ.'; end if;
 eid:=myb_stable_uuid('care_event:'||p_sync_id||':'||sid);pid:=myb_stable_uuid('pump_event:'||eid::text);fid:=myb_stable_uuid('feed_event:'||eid::text);
 select * into old from care_events where id=eid and family_id=f for update;
 if old.id is not null then
 if old.deleted_at is not null and undone_op is null then raise exception 'CONFLICT: Ghi nhận đã bị xóa.'; end if;
 if expect is null or expect->>'updatedAt' is null or (expect->>'updatedAt')::timestamptz<>old.updated_at or (expect->>'version' is not null and (expect->>'version')::int<>old.version) then raise exception 'CONFLICT: Ghi nhận đã thay đổi. Tải lại và mở sửa lại.'; end if;
 if old.deleted_at is null then before_doc:=myb_care_doc_v1540(old); end if;
 elsif expect is not null or op='delete' then raise exception 'CONFLICT: Không tìm thấy ghi nhận.'; end if;
 if old.type='discard' and op='save' and undone_op is null then raise exception 'VALIDATION: Hãy xóa thao tác hủy rồi tạo lại.';end if;
 typ:=case when op='delete' then old.type else ev->>'type' end;
 if typ is null or typ not in ('feed','pump','transfer','sleep','diaper','pee','poop','temperature','medicine','spitup','discard') then raise exception 'VALIDATION: Loại chăm sóc không hợp lệ.'; end if;
 d:=myb_stable_uuid('device:runtime:v1576:'||p_sync_id||':'||coalesce(nullif(p_device_key,''),'device'));
 insert into devices(id,family_id,device_name,device_type,platform,app_version,last_seen_at) values(d,f,coalesce(p_device_key,'Web device'),'browser','web','15.4.0',stamp)
 on conflict(id) do update set last_seen_at=excluded.last_seen_at,app_version='15.4.0',deleted_at=null;
 -- Find every old/new stock row before taking ordered row locks.
 sources:=coalesce(ev->'milkSources',ev#>'{extra,milkSources}','[]');
 if jsonb_typeof(sources) is distinct from 'array' or jsonb_array_length(sources)>100 then raise exception 'VALIDATION: Nguồn sữa không hợp lệ.'; end if;
 select coalesce(array_agg(distinct id),array[]::uuid[]) into ids from milk_items where family_id=f and (
 pump_event_id=pid or id=myb_stable_uuid('milk_item:'||p_sync_id||':MILK-'||sid)
 or legacy_id in(select coalesce(value->>'bagId',value->>'milkItemId') from jsonb_array_elements(sources))
 or legacy_id in(ev#>>'{extra,fromBagId}',ev#>>'{extra,toBagId}',old.extra#>>'{extra,fromBagId}',old.extra#>>'{extra,toBagId}')
 or id in(select milk_item_id from milk_transactions where family_id=f and care_event_id=eid));
 target_sid:=case when typ='transfer' then coalesce(nullif(ev#>>'{extra,toBagId}',''),'MILK-'||sid) else coalesce(nullif(ev->>'linkedBagId',''),'MILK-'||sid) end;
 ids:=array_append(ids,myb_stable_uuid('milk_item:'||p_sync_id||':'||target_sid));
 if exists(select legacy_id from milk_items where family_id=f and id=any(ids) and deleted_at is null and legacy_id is not null group by legacy_id having count(*)>1) then raise exception 'CONFLICT: Trùng mã kho; cần đối chiếu trước khi sửa.';end if;
 perform id from milk_items where family_id=f and id=any(ids) order by id for update;
 if typ='discard' and op='save' and undone_op is null and not exists(select 1 from milk_items where family_id=f and legacy_id=ev#>>'{extra,fromBagId}' and deleted_at is null and updated_at=(ev#>>'{extra,expectedUpdatedAt}')::timestamptz) then raise exception 'CONFLICT: Kho đã thay đổi. Tải lại trước khi hủy.';end if;
 foreach mid in array ids loop perform myb_milk_align_v1540(f,mid,d); end loop;
 select coalesce(jsonb_object_agg(milk_item_id,n),'{}') into old_usage from (select milk_item_id,sum(ml) n from milk_transactions where care_event_id=eid and family_id=f and deleted_at is null and transaction_type='feed_use' group by milk_item_id) usage;
 -- Remove old feed effects only; return exactly ledger use/discard, not all history.
 if old.type='feed' and old.source='stored' and old.deleted_at is null and not exists(select 1 from feed_milk_sources where family_id=f and feed_event_id=fid and deleted_at is null) and not exists(select 1 from milk_transactions where family_id=f and care_event_id=eid and transaction_type='feed_use' and deleted_at is null) then raise exception 'CONFLICT: Thiếu liên kết sữa của cữ cũ; cần đối chiếu trước khi sửa.';end if;
 if old.type in('feed','discard') and old.deleted_at is null then
 if old.type='discard' then update milk_items set status='storing',extra=extra-'cancelReason'-'discardReason'-'canceledAt'-'discardedAt' where family_id=f and id=any(ids);end if;
 update milk_transactions set deleted_at=stamp,updated_at=stamp where family_id=f and care_event_id=eid and transaction_type in('feed_use','discard') and deleted_at is null;
 update feed_milk_sources set deleted_at=stamp where family_id=f and feed_event_id=fid and deleted_at is null;
 foreach mid in array ids loop perform myb_milk_refresh_v1540(f,mid,d,p_op_id); end loop;
 end if;
 -- A pump's linked row is retained on edits. Deleting/converting an already used
 -- pump is rejected, even when later feed deletion made its balance full again.
 if old.type in ('pump','transfer') and old.deleted_at is null then
 select * into linked from milk_items where family_id=f and deleted_at is null and
 (case when old.type='pump' then pump_event_id=pid else legacy_id=old.extra#>>'{extra,toBagId}' end) order by id limit 1;
 if linked.id is null then raise exception 'CONFLICT: Thiếu liên kết kho sữa; cần đối chiếu trước khi sửa.'; end if;
 if old.type='transfer' or op='delete' or typ<>'pump' then
 if exists(select 1 from milk_transactions where milk_item_id=linked.id and deleted_at is null and transaction_type in('feed_use','discard','transfer_out') and ml<>0)
 or exists(select 1 from feed_milk_sources where milk_item_id=linked.id and deleted_at is null) then raise exception 'IN_USE: Sữa đã được sử dụng hoặc chuyển tiếp. Không thể xóa.'; end if;
 if old.type='transfer' then
 update milk_transactions set deleted_at=stamp,updated_at=stamp where care_event_id=eid and family_id=f and transaction_type='transfer_out';
 end if;
 update milk_items set deleted_at=stamp,updated_at=stamp,version=version+1 where id=linked.id;
 deleted:=array_append(deleted,linked.legacy_id);
 end if;
 end if;
 if op='delete' then
 update care_events set deleted_at=stamp,updated_at=stamp,version=version+1,last_op_id=p_op_id where id=eid;
 else
 if jsonb_typeof(ev->'amount') is distinct from 'number' or (ev->>'amount')::numeric<0 or (ev->>'amount')::numeric>100000 then raise exception 'VALIDATION: Lượng ngoài giới hạn.'; end if;
 amount:=(ev->>'amount')::numeric;
 if coalesce(ev->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(ev->>'timeFrom','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'VALIDATION: Ngày giờ không hợp lệ.'; end if;
 perform (ev->>'date')::date;
 if nullif(ev->>'timeTo','') is not null and ev->>'timeTo' !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'VALIDATION: Giờ kết thúc không hợp lệ.'; end if;
 if length(coalesce(ev->>'note',''))>4000 or pg_column_size(ev)>100000 then raise exception 'VALIDATION: Nội dung quá dài.'; end if;
 if typ in('diaper','pee','poop') and (amount<1 or amount<>trunc(amount)) then raise exception 'VALIDATION: Số lần phải là số nguyên dương.';end if;
 if typ='temperature' and amount not between 30 and 45 then raise exception 'VALIDATION: Nhiệt độ phải từ 30 đến 45°C.'; end if;
 if typ in('pump','transfer') and amount<=0 then raise exception 'VALIDATION: Lượng sữa phải lớn hơn 0.'; end if;
 if nullif(ev->>'timeTo','') is not null and ((coalesce(nullif(ev->>'endDate',''),ev->>'date'))||' '||(ev->>'timeTo'))::timestamp < ((ev->>'date')||' '||(ev->>'timeFrom'))::timestamp then raise exception 'VALIDATION: Kết thúc trước bắt đầu.';end if;
 if typ='sleep' and nullif(ev->>'timeTo','') is null and exists(select 1 from care_events where family_id=f and id<>eid and type='sleep' and deleted_at is null and nullif(time_to,'') is null) then raise exception 'IN_USE: Đã có giấc ngủ đang diễn ra.';end if;
 if typ='sleep' and nullif(ev->>'timeTo','') is not null then
 amount:=extract(epoch from (((coalesce(nullif(ev->>'endDate',''),ev->>'date'))||' '||(ev->>'timeTo'))::timestamp-((ev->>'date')||' '||(ev->>'timeFrom'))::timestamp))/60;
 if amount<=0 or amount>10080 then raise exception 'VALIDATION: Khoảng ngủ không hợp lệ.'; end if;
 ev:=ev||jsonb_build_object('amount',amount);
 end if;
 if typ='discard' then
 select * into linked from milk_items where family_id=f and legacy_id=ev#>>'{extra,fromBagId}' and deleted_at is null;
 if linked.id is null or linked.status='discarded' or coalesce(linked.remaining_ml,0)<=0 then raise exception 'CONFLICT: Sữa không còn để hủy.';end if;

 amount:=linked.remaining_ml; ev:=ev||jsonb_build_object('amount',amount);
 end if;
 if typ='feed' then
 if ev->>'source' not in('stored','direct','formula') or ev->>'source' is null then raise exception 'VALIDATION: Nguồn bú không hợp lệ.'; end if;
 if ev->>'source'='stored' then
 if jsonb_array_length(sources)=0 or (select count(distinct coalesce(value->>'bagId',value->>'milkItemId')) from jsonb_array_elements(sources))<>jsonb_array_length(sources) then raise exception 'VALIDATION: Chọn nguồn sữa khác nhau.'; end if;
 for src in select value from jsonb_array_elements(sources) loop
 select m.id,coalesce(m.remaining_ml,0) rem,m.status,m.expire_at,m.amount_ml,m.container_name,m.storage,m.note into r from milk_items m where m.family_id=f and m.legacy_id=coalesce(src->>'bagId',src->>'milkItemId') and m.deleted_at is null;
 if not found then raise exception 'VALIDATION: Không tìm thấy sữa nguồn.'; end if;
 used:=(src->>'usedMl')::numeric;
 if used is null or used<=0 or used>r.rem or r.status='discarded' or (r.expire_at<=now() and used>coalesce((old_usage->>r.id::text)::numeric,0)) then raise exception 'INSUFFICIENT: Sữa nguồn không đủ hoặc không còn khả dụng.'; end if;
 if coalesce(src->>'remainderAction','keep') not in('keep','discard','discard_rest','dump') then raise exception 'VALIDATION: Cách xử lý phần dư không hợp lệ.'; end if;
 disc:=case when coalesce(src->>'remainderAction','keep')='keep' then 0 else r.rem-used end;
 snapshots:=snapshots||jsonb_build_array(jsonb_build_object('id',coalesce(src->>'bagId',src->>'milkItemId'),'amount',r.amount_ml,'used',used,'discarded',disc,'remainingBefore',r.rem,'remainingAfter',r.rem-used-disc,'statusAfter',case when disc>0 then 'Đã bỏ' when r.rem-used<=0 then 'Đã sử dụng hết' else 'Đang bảo quản' end,'containerName',r.container_name,'storage',r.storage,'expireDateTime',r.expire_at,'note',r.note));
 src:=src||jsonb_build_object('bagId',coalesce(src->>'bagId',src->>'milkItemId'),'discardMl',disc);normalized:=normalized||jsonb_build_array(src);total:=total+used;
 end loop;
 waste:=coalesce((ev->>'wasteMl')::numeric,0);
 if waste<0 or waste>total or amount<>total-waste then raise exception 'VALIDATION: Lượng lấy ra, bé bú và bỏ thừa không khớp.'; end if;
 ev:=jsonb_set(ev,'{extra}',coalesce(ev->'extra','{}')||jsonb_build_object('takenMl',total,'milkSources',normalized,'milkBagSnapshots',snapshots));ev:=ev||jsonb_build_object('milkSources',normalized);
 else ev:=ev||jsonb_build_object('milkSources','[]'::jsonb,'milkBagId',''); ev:=jsonb_set(ev,'{extra}',coalesce(ev->'extra','{}')-'milkSources'-'milkBagSnapshots'); end if;
 end if;
 if typ in('pump','transfer') then
 select * into cont from milk_containers where family_id=f and legacy_id=case when typ='pump' then ev#>>'{extra,containerId}' else ev#>>'{extra,toContainerId}' end and deleted_at is null and active;
 if not found then raise exception 'VALIDATION: Bình/túi không còn hoạt động.'; end if;
 if cont.kind='binh' and exists(select 1 from milk_items where family_id=f and container_id=cont.id and deleted_at is null and coalesce(remaining_ml,0)>0 and status<>'discarded' and id<>coalesce(linked.id,'00000000-0000-0000-0000-000000000000') and (expire_at is null or expire_at>now())) then raise exception 'IN_USE: Bình đang chứa sữa.'; end if;
 if cont.kind='binh' and cont.capacity_ml>0 and amount>cont.capacity_ml then raise exception 'VALIDATION: Vượt dung tích bình.'; end if;
 expire:=case when ev#>>'{extra,expireDate}' ~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then (ev#>>'{extra,expireDate}')::timestamptz else nullif(ev#>>'{extra,expireDate}','')::timestamp at time zone 'Asia/Ho_Chi_Minh' end;
 if expire is null then raise exception 'VALIDATION: Cần hạn sử dụng sữa.'; end if;
 if typ='transfer' then
 if old.id is not null and old.deleted_at is null then raise exception 'VALIDATION: Hãy xóa rồi tạo lại giao dịch chuyển sữa.'; end if;
 select * into linked from milk_items where family_id=f and legacy_id=ev#>>'{extra,fromBagId}' and deleted_at is null;
 if linked.id is null or amount>coalesce(linked.remaining_ml,0) or linked.status='discarded' then raise exception 'INSUFFICIENT: Sữa nguồn không đủ.'; end if;
 if linked.container_id=cont.id then raise exception 'VALIDATION: Nguồn và đích phải khác nhau.'; end if;
 if linked.expire_at is not null and expire>linked.expire_at then raise exception 'VALIDATION: Không kéo dài hạn sữa khi chuyển.'; end if;
 ev:=jsonb_set(ev,'{extra}',coalesce(ev->'extra','{}')||jsonb_build_object('toBagId',target_sid,'fromName',linked.container_name,'toName',cont.name,'toKind',cont.kind,'sourceEmptied',linked.remaining_ml=amount));
 else
 if linked.status='discarded' and amount<>linked.amount_ml then raise exception 'IN_USE: Không đổi lượng hút của sữa đã hủy.';end if;
 if linked.id is not null and linked.container_id<>cont.id and linked.amount_ml<>linked.remaining_ml then raise exception 'IN_USE: Sữa đã dùng; hãy chuyển sữa thay vì đổi bình gốc.';end if;
 if linked.id is not null and linked.deleted_at is null and amount<linked.amount_ml-coalesce(linked.remaining_ml,0) then raise exception 'IN_USE: Lượng hút không được nhỏ hơn lượng đã dùng.'; end if;
 target_sid:=coalesce(linked.legacy_id,target_sid);
 ev:=ev||jsonb_build_object('linkedBagId',target_sid);
 ev:=jsonb_set(ev,'{extra}',coalesce(ev->'extra','{}')||jsonb_build_object('containerKind',cont.kind,'containerName',cont.name));
 end if;
 label:=case when typ='transfer' then to_char(coalesce(nullif(linked.extra->>'originDate',''),nullif(linked.extra->>'date',''),ev->>'date')::date,'YYMMDD')||'-'||replace(coalesce(nullif(linked.extra->>'originTimeFrom',''),nullif(linked.extra->>'timeFrom',''),ev->>'timeFrom'),':','') else to_char((ev->>'date')::date,'YYMMDD')||'-'||replace(ev->>'timeFrom',':','') end;
 if exists(select 1 from milk_items where family_id=f and container_name=label and legacy_id<>target_sid) then label:=label||'-'||sid;end if;
 if cont.kind='binh' then label:=cont.name;end if;
 if typ='transfer' then ev:=jsonb_set(ev,'{extra,toName}',to_jsonb(label));end if;
 end if;
 select id into child from health_members where family_id=f and relation='Con' and deleted_at is null order by created_at limit 1;
 insert into care_events(id,family_id,member_id,legacy_id,type,event_date,time_from,time_to,amount,unit,source,status,note,extra,created_at,updated_at,created_by_device,updated_by_device,last_op_id)
 values(eid,f,child,sid,typ,(ev->>'date')::date,nullif(ev->>'timeFrom',''),nullif(ev->>'timeTo',''),amount,ev->>'unit',ev->>'source',coalesce(nullif(ev->>'status',''),'active'),ev->>'note',ev,coalesce(old.created_at,stamp),stamp,d,d,p_op_id)
 on conflict(id) do update set type=excluded.type,event_date=excluded.event_date,time_from=excluded.time_from,time_to=excluded.time_to,amount=excluded.amount,unit=excluded.unit,source=excluded.source,status=excluded.status,note=excluded.note,extra=excluded.extra,updated_at=stamp,updated_by_device=d,last_op_id=p_op_id,version=care_events.version+1,deleted_at=null;
 end if;
 -- Soft-delete subtypes; never DELETE a pump row that stock references.
 update feed_events set deleted_at=stamp where care_event_id=eid and family_id=f;
 update pump_events set deleted_at=stamp where care_event_id=eid and family_id=f;
 update sleep_events set deleted_at=stamp where care_event_id=eid and family_id=f;
 update diaper_events set deleted_at=stamp where care_event_id=eid and family_id=f;
 update temperature_events set deleted_at=stamp where care_event_id=eid and family_id=f;
 if op='save' and typ='discard' then
 insert into milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,reason,created_by_device) values(gen_random_uuid(),f,linked.id,eid,'discard',amount,ev->>'note',d);
 update milk_items set status='discarded',extra=extra||jsonb_build_object('cancelReason',ev->>'note','discardReason',ev->>'note','canceledAt',stamp,'discardedAt',stamp) where id=linked.id;
 elsif op='save' and typ='feed' then
 insert into feed_events(id,family_id,care_event_id,feed_type,milk_type,actual_ml,taken_ml,wasted_ml,formula_brand,count_as_feed)
 values(fid,f,eid,ev->>'source',ev->>'milkType',amount,case when ev->>'source'='stored' then total else amount end,coalesce(waste,0),ev#>>'{extra,formulaBrand}',coalesce((ev#>>'{extra,countAsFeed}')::boolean,true))
 on conflict(id) do update set feed_type=excluded.feed_type,milk_type=excluded.milk_type,actual_ml=excluded.actual_ml,taken_ml=excluded.taken_ml,wasted_ml=excluded.wasted_ml,formula_brand=excluded.formula_brand,count_as_feed=excluded.count_as_feed,deleted_at=null;
 if ev->>'source'='stored' then
 for src in select value from jsonb_array_elements(normalized) loop
 i:=i+1;select id into mid from milk_items where family_id=f and legacy_id=src->>'bagId' and deleted_at is null;
 insert into feed_milk_sources(id,family_id,feed_event_id,milk_item_id,used_ml,discard_ml,remainder_action,order_index)
 values(gen_random_uuid(),f,fid,mid,(src->>'usedMl')::numeric,(src->>'discardMl')::numeric,coalesce(src->>'remainderAction','keep'),i);
 insert into milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,created_by_device)
 values(gen_random_uuid(),f,mid,eid,'feed_use',(src->>'usedMl')::numeric,d);
 if (src->>'discardMl')::numeric>0 then insert into milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,created_by_device) values(gen_random_uuid(),f,mid,eid,'discard',(src->>'discardMl')::numeric,d);end if;
 end loop; end if;
 elsif op='save' and typ in('pump','transfer') then
 if typ='pump' then
 insert into pump_events(id,family_id,care_event_id,side,amount_ml,duration_min,storage,container_id,container_kind,container_name,expire_at)
 values(pid,f,eid,ev#>>'{extra,side}',amount,nullif(ev#>>'{extra,durationMin}','')::int,ev->>'storage',cont.id,cont.kind,cont.name,expire)
 on conflict(id) do update set side=excluded.side,amount_ml=excluded.amount_ml,duration_min=excluded.duration_min,storage=excluded.storage,container_id=excluded.container_id,container_kind=excluded.container_kind,container_name=excluded.container_name,expire_at=excluded.expire_at,deleted_at=null;
 else
 insert into milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,created_by_device) values(gen_random_uuid(),f,linked.id,eid,'transfer_out',amount,d);
 end if;
 mid:=myb_stable_uuid('milk_item:'||p_sync_id||':'||target_sid);
 if exists(select 1 from milk_items where id=mid and not coalesce((family_id=f and ((typ='pump' and pump_event_id=pid) or (typ='transfer' and extra->>'transferEventId'=sid and undone_op is not null))),false)) then raise exception 'CONFLICT: ID kho đã thuộc lần ghi khác.';end if;
 insert into milk_items(id,family_id,pump_event_id,legacy_id,short_code,container_id,container_kind,container_name,storage,amount_ml,remaining_ml,expire_at,status,note,extra,created_by_device,updated_by_device,last_op_id)
 values(mid,f,case when typ='pump' then pid else null end,target_sid,target_sid,cont.id,cont.kind,
 label,
 case when typ='pump' then ev->>'storage' else ev#>>'{extra,storage}' end,amount,amount,expire,'storing',ev->>'note',
 case when typ='pump' then coalesce(linked.extra,'{}')||jsonb_build_object('date',ev->>'date','timeFrom',ev->>'timeFrom') else coalesce(linked.extra,'{}')||jsonb_build_object('originDate',coalesce(linked.extra->>'originDate',linked.extra->>'date'),'originTimeFrom',coalesce(linked.extra->>'originTimeFrom',linked.extra->>'timeFrom'),'originPumpEventId',coalesce(linked.extra->>'originPumpEventId',linked.extra->>'pumpEventId',(select ce.legacy_id from pump_events pe join care_events ce on ce.id=pe.care_event_id where pe.id=linked.pump_event_id)),'thawed',coalesce((ev#>>'{extra,thawed}')::boolean,false) or coalesce((linked.extra->>'thawed')::boolean,false),'expireManual',coalesce((ev#>>'{extra,expireManual}')::boolean,false),'transferEventId',sid,'transferFromBagId',linked.legacy_id,'transferAt',(ev->>'date')||'T'||(ev->>'timeFrom')) end,d,d,p_op_id)
 on conflict(id) do update set pump_event_id=excluded.pump_event_id,container_id=excluded.container_id,container_kind=excluded.container_kind,container_name=excluded.container_name,storage=excluded.storage,amount_ml=excluded.amount_ml,expire_at=excluded.expire_at,note=excluded.note,extra=excluded.extra,deleted_at=null,updated_at=stamp,version=milk_items.version+1,updated_by_device=d,last_op_id=p_op_id;
 -- amount_ml is the balance base in the existing view. A new transfer target
 -- therefore gets a create marker, not transfer_in (which would double stock).
 if not exists(select 1 from milk_transactions where milk_item_id=mid and transaction_type='create') then
 insert into milk_transactions(id,family_id,milk_item_id,transaction_type,ml,reason,created_by_device) values(gen_random_uuid(),f,mid,'create',amount,'V15.4 stock origin',d); end if;
 elsif op='save' and typ='sleep' then
 insert into sleep_events(id,family_id,care_event_id,sleep_from,sleep_to,duration_min,quality)
 values(myb_stable_uuid('sleep_event:'||eid::text),f,eid,((ev->>'date')||' '||(ev->>'timeFrom'))::timestamp at time zone 'Asia/Ho_Chi_Minh',case when nullif(ev->>'timeTo','') is null then null else ((coalesce(nullif(ev->>'endDate',''),ev->>'date'))||' '||(ev->>'timeTo'))::timestamp at time zone 'Asia/Ho_Chi_Minh' end,amount::int,ev#>>'{extra,quality}')
 on conflict(id) do update set sleep_from=excluded.sleep_from,sleep_to=excluded.sleep_to,duration_min=excluded.duration_min,quality=excluded.quality,deleted_at=null;
 elsif op='save' and typ in('diaper','pee','poop') then
 insert into diaper_events(id,family_id,care_event_id,wet,dirty,stool_color,stool_amount,note)
 values(myb_stable_uuid('diaper_event:'||eid::text),f,eid,coalesce((ev#>>'{extra,pee}')::numeric,0)>0 or typ='pee',coalesce((ev#>>'{extra,poop}')::numeric,0)>0 or typ='poop',ev#>>'{extra,stoolColor}',ev#>>'{extra,stoolAmount}',ev->>'note')
 on conflict(id) do update set wet=excluded.wet,dirty=excluded.dirty,stool_color=excluded.stool_color,stool_amount=excluded.stool_amount,note=excluded.note,deleted_at=null;
 elsif op='save' and typ='temperature' then
 insert into temperature_events(id,family_id,care_event_id,temperature_c,measure_place,note)
 values(myb_stable_uuid('temperature_event:'||eid::text),f,eid,amount,ev#>>'{extra,site}',ev->>'note') on conflict(id) do update set temperature_c=excluded.temperature_c,measure_place=excluded.measure_place,note=excluded.note,deleted_at=null;
 end if;
 foreach mid in array ids loop perform myb_milk_refresh_v1540(f,mid,d,p_op_id); end loop;
 select coalesce(jsonb_agg(myb_milk_doc_v1540(m) order by m.id),'[]') into mi from milk_items m where m.family_id=f and m.id=any(ids) and m.deleted_at is null;
 select myb_care_doc_v1540(c) into ce from care_events c where c.id=eid and c.deleted_at is null;
 result:=jsonb_build_object('ok',true,'status','applied','operationId',p_op_id,'eventId',sid,'event',ce,'milkItems',mi,'deletedMilkIds',to_jsonb(deleted));
 insert into myb_care_operations_v1540(family_id,op_id,request_hash,response,before_event,affected_milk_ids,after_hash)
 values(f,p_op_id,h,result,before_doc,ids,myb_care_hash_v1540(f,eid,ids));
 if undone_op is not null then update myb_care_operations_v1540 set undone=true where family_id=f and op_id=undone_op;end if;
 return result;
exception when others then
 return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);
end $$;
-- Private helpers execute only through the definer endpoints.
revoke all on function public.myb_care_doc_v1540(public.care_events),public.myb_milk_doc_v1540(public.milk_items),public.myb_care_hash_v1540(uuid,uuid,uuid[]),public.myb_milk_align_v1540(uuid,uuid,uuid),public.myb_milk_refresh_v1540(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.myb_care_list_v1540(text,jsonb),public.myb_care_write_v1540(text,text,uuid,jsonb),public.myb_care_operation_v1540(text,uuid) from public;
grant execute on function public.myb_care_list_v1540(text,jsonb),public.myb_care_write_v1540(text,text,uuid,jsonb),public.myb_care_operation_v1540(text,uuid) to anon,authenticated,service_role;
-- Legacy runtime previously wrote family/device metadata BEFORE the family lock.
-- Move that existing lock before those writes to keep one lock order across APIs.
-- Otherwise a legacy transaction can hold a metadata row while waiting for the
-- family lock, and a new transaction can hold the family lock waiting for that row.
do $legacy_lock$ declare def text; lock_line text:=
 'perform pg_advisory_xact_lock(hashtextextended(''myb-v1576:'' || v_family_id::text,0));';
begin
 select pg_get_functiondef('public.myb_relational_apply_changes_v1576(text,text,jsonb)'::regprocedure) into def;
 if position('-- v1540 metadata lock order' in def)=0 then
 if position(lock_line in def)=0 or position('insert into public.families(' in def)=0 then raise exception 'Unexpected apply definition; review lock order migration.';end if;
 def:=replace(def,lock_line,'-- v1540 metadata lock order');
 def:=replace(def,'insert into public.families(',lock_line||E'\n  insert into public.families(');
 execute def;
 end if;
end $legacy_lock$;
-- V15.3 catalog validation must hold the same family lock BEFORE its snapshot.
-- Exact anchor is checked so a changed deployment cannot be silently patched.
do $$ declare def text; begin
 select pg_get_functiondef('public.myb_catalog_write_v1530(text,text,text,text,jsonb,jsonb,text)'::regprocedure) into def;
 if position('-- v1540 common lock' in def)=0 then
 if position('state:=public.myb_relational_export_state_v1576(p_sync_id)::jsonb;' in def)=0 then raise exception 'Unexpected catalog definition; review migration.'; end if;
 def:=replace(def,'state:=public.myb_relational_export_state_v1576(p_sync_id)::jsonb;',E'-- v1540 common lock\n perform pg_advisory_xact_lock(hashtextextended(''myb-v1576:''||public.myb_stable_uuid(''family:''||p_sync_id)::text,0));\n state:=public.myb_relational_export_state_v1576(p_sync_id)::jsonb;');execute def;
 end if;
end $$;
-- Derive the existing non-care module shell without reading care or milk rows.
do $shell$ declare def text; a int; b int; begin
 select pg_get_functiondef('public.myb_relational_export_state_v1576(text)'::regprocedure) into def;
 a:=position('select coalesce(jsonb_agg(coalesce(ce.extra' in def);
 b:=position('select coalesce(jsonb_agg(coalesce(mc.extra' in def);
 if a=0 or b<=a then raise exception 'Unexpected export definition; review shell migration.';end if;
 def:=left(def,a-1)||E'v_care := ''[]''::jsonb; v_milk := ''[]''::jsonb;\n '||substring(def from b);
 def:=replace(def,'public.myb_relational_export_state_v1576(', 'public.myb_app_shell_v1540(');
 execute def;
end $shell$;
revoke all on function public.myb_app_shell_v1540(text) from public;
grant execute on function public.myb_app_shell_v1540(text) to anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
