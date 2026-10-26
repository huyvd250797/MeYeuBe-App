-- MeYeuBe V16.5.0. Run after 1640. Additive, same-family record restore.
begin;
create table if not exists public.myb_restore_jobs_v1650 (
 id uuid primary key, family_id uuid not null references public.families(id),
 payload jsonb not null, payload_hash text not null, before_image jsonb not null,
 expected_revision text not null, mode text not null check(mode in ('missing','update')),
 plan jsonb not null, state text not null default 'preview' check(state in ('preview','applied')),
 response jsonb, created_at timestamptz not null default now(), applied_at timestamptz
);
alter table public.myb_restore_jobs_v1650 enable row level security;
revoke all on public.myb_restore_jobs_v1650 from public,anon,authenticated;

create or replace function public.myb_backup_tables_v1650() returns text[]
language sql immutable set search_path=public,pg_temp as $$
 select array['devices','health_members','milk_containers','care_categories','app_settings',
 'vaccine_catalog','child_vaccine_plans','vaccine_records','care_events','pump_events',
 'milk_items','feed_events','feed_milk_sources','milk_transactions','sleep_events','diaper_events','temperature_events',
 'health_measurements','health_visits','health_medications','health_labs','health_allergies',
 'appointments','diary_entries','milestones','pregnancy_records','app_members','sensor_logs','activity_logs',
 'monthly_notes','smart_alert_rules','media_files','myb_media_v1640']::text[]
$$;
revoke all on function public.myb_backup_tables_v1650() from public,anon,authenticated;

create or replace function public.myb_backup_snapshot_v1650(f uuid) returns jsonb
language plpgsql set search_path=public,pg_temp as $$
declare t text; fields text:=''; schemas jsonb:='{}'; signature text; result jsonb;
begin
 foreach t in array public.myb_backup_tables_v1650() loop
  if to_regclass('public.'||t) is null then continue;end if;
  if not exists(select 1 from pg_attribute where attrelid=to_regclass('public.'||t) and attname='family_id' and not attisdropped) then continue;end if;
  select md5(string_agg(attname||':'||format_type(atttypid,atttypmod),',' order by attnum)) into signature from pg_attribute where attrelid=to_regclass('public.'||t) and attnum>0 and not attisdropped;
  schemas:=schemas||jsonb_build_object(t,signature);
  if fields<>'' then fields:=fields||',';end if;
  fields:=fields||format('%L,coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from public.%I x where x.family_id=$1),''[]''::jsonb)',t,t);
 end loop;
 -- One SQL statement gives one MVCC snapshot for every business table.
 execute 'select jsonb_build_object('||fields||')' into result using f;
 return jsonb_build_object('format','myb.records.v1','family_id',f,'tables',result,'schema',schemas);
end $$;
revoke all on function public.myb_backup_snapshot_v1650(uuid) from public,anon,authenticated;

create or replace function public.myb_backup_export_v1650(p_sync_id text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); payload jsonb;
begin
 if nullif(btrim(p_sync_id),'') is null or not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'INVALID_FAMILY';end if;
 payload:=public.myb_backup_snapshot_v1650(f);
 if pg_column_size(payload)>20971520 then raise exception 'BACKUP_DATA_LIMIT_20_MIB';end if;
 if (select coalesce(sum(jsonb_array_length(value)),0) from jsonb_each(payload->'tables'))>20000 then raise exception 'BACKUP_RECORD_LIMIT_20000';end if;
 return jsonb_build_object('ok',true,'payload',payload,'createdAt',clock_timestamp());
exception when others then return jsonb_build_object('ok',false,'code','BACKUP_ERROR','message',sqlerrm);end $$;

create or replace function public.myb_backup_preview_v1650(p_sync_id text,p_payload jsonb,p_mode text default 'missing') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); snap jsonb; t text; rows jsonb; rowdoc jsonb; old jsonb; refdoc jsonb; normalized jsonb; fk record; key text; kind text; plan jsonb:='[]'; job uuid:=gen_random_uuid(); n int:=0; inserts int:=0; updates int:=0; skipped int:=0; conflicts int:=0; v_record_id uuid; sig text;
begin
 if nullif(btrim(p_sync_id),'') is null or not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'INVALID_FAMILY';end if;
 if p_mode not in('missing','update') or p_mode is null or jsonb_typeof(p_payload) is distinct from 'object' or p_payload->>'format' is distinct from 'myb.records.v1' or p_payload->>'family_id' is distinct from f::text or jsonb_typeof(p_payload->'tables') is distinct from 'object' then raise exception 'INVALID_BACKUP_OR_DIFFERENT_FAMILY';end if;
 if pg_column_size(p_payload)>20971520 then raise exception 'BACKUP_DATA_LIMIT_20_MIB';end if;
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 snap:=public.myb_backup_snapshot_v1650(f);
 for t,rows in select k,v from jsonb_each(p_payload->'tables') as e(k,v) loop
  if not(t=any(public.myb_backup_tables_v1650())) or not(snap->'tables'?t) or jsonb_typeof(rows) is distinct from 'array' then raise exception 'UNSUPPORTED_TABLE: %',t;end if;
  if p_payload->'schema'->>t is distinct from snap->'schema'->>t then raise exception 'SCHEMA_MISMATCH: %',t;end if;
  if exists(select 1 from jsonb_array_elements(rows) a group by a->>'id' having count(*)>1) then raise exception 'DUPLICATE_RECORD: %',t;end if;
  for rowdoc in select value from jsonb_array_elements(rows) loop
   n:=n+1;if n>20000 then raise exception 'BACKUP_RECORD_LIMIT_20000';end if;
   if jsonb_typeof(rowdoc) is distinct from 'object' or rowdoc->>'family_id' is distinct from f::text then raise exception 'INVALID_RECORD_FAMILY: %',t;end if;
   v_record_id:=(rowdoc->>'id')::uuid;if v_record_id is null then raise exception 'MISSING_RECORD_ID';end if;
   if exists(select 1 from jsonb_object_keys(rowdoc) k where not exists(select 1 from pg_attribute where attrelid=to_regclass('public.'||t) and attnum>0 and not attisdropped and attname=k)) then raise exception 'UNKNOWN_RECORD_FIELD: %',t;end if;
   if (select count(*) from jsonb_object_keys(rowdoc))<>(select count(*) from pg_attribute where attrelid=to_regclass('public.'||t) and attnum>0 and not attisdropped) then raise exception 'INCOMPLETE_RECORD: %',t;end if;
   if exists(select 1 from pg_attribute a where a.attrelid=to_regclass('public.'||t) and a.attnum>0 and not a.attisdropped and a.attnotnull and rowdoc->>a.attname is null) then raise exception 'MISSING_REQUIRED_FIELD: %',t;end if;
   execute format('select to_jsonb(jsonb_populate_record(null::public.%I,$1))',t) into normalized using rowdoc;
   execute format('select to_jsonb(x) from public.%I x where id=$1',t) into old using v_record_id;
   if old is not null and old->>'family_id' is distinct from f::text then raise exception 'RECORD_ID_BELONGS_TO_ANOTHER_FAMILY';end if;
   if t='myb_media_v1640' and old is not null and (old->>'sha256' is distinct from rowdoc->>'sha256' or old->>'path' is distinct from rowdoc->>'path') then raise exception 'IMMUTABLE_MEDIA_CONFLICT';end if;
   -- Validate every FK, including family ownership of each referenced UUID.
   for fk in select ns.nspname schema_name,cl.relname table_name,a.attname field,b.attname ref_field from pg_constraint c join pg_class cl on cl.oid=c.confrelid join pg_namespace ns on ns.oid=cl.relnamespace join pg_attribute a on a.attrelid=c.conrelid and a.attnum=c.conkey[1] join pg_attribute b on b.attrelid=c.confrelid and b.attnum=c.confkey[1] where c.contype='f' and c.conrelid=to_regclass('public.'||t) and array_length(c.conkey,1)=1 loop
    key:=rowdoc->>fk.field;if key is null then continue;end if;
    refdoc:=null;
    if fk.table_name='families' then if key<>f::text then raise exception 'CROSS_FAMILY_REFERENCE';end if;continue;end if;
    if fk.schema_name<>'public' then raise exception 'UNSUPPORTED_REFERENCE_SCHEMA';end if;
    if p_payload->'tables'?fk.table_name then select value into refdoc from jsonb_array_elements(p_payload->'tables'->fk.table_name) where value->>fk.ref_field=key limit 1;end if;
    if refdoc is null then execute format('select to_jsonb(x) from public.%I x where to_jsonb(x)->>%L=$1 limit 1',fk.table_name,fk.ref_field) into refdoc using key;end if;
    if refdoc is null then raise exception 'MISSING_REFERENCE: %.%',t,fk.field;end if;
    if refdoc?'family_id' and refdoc->>'family_id' is distinct from f::text and not(fk.table_name='vaccine_catalog' and refdoc->>'family_id' is null) then raise exception 'CROSS_FAMILY_REFERENCE: %.%',t,fk.field;end if;
   end loop;
   if t='myb_media_v1640' then
    if rowdoc->>'path' is distinct from f::text||'/'||(rowdoc->>'member_id')||'/'||v_record_id::text then raise exception 'INVALID_MEDIA_PATH';end if;
    if not exists(select 1 from jsonb_array_elements(coalesce(p_payload->'tables'->'health_members','[]')) a where a->>'id'=rowdoc->>'member_id') and not exists(select 1 from health_members where id=(rowdoc->>'member_id')::uuid and family_id=f) then raise exception 'MISSING_MEDIA_MEMBER';end if;
   end if;
   if old is null then kind:='insert';inserts:=inserts+1;
   elsif (old-array['updated_at','version','last_op_id'])=(rowdoc-array['updated_at','version','last_op_id']) or t='devices' then kind:='skip';skipped:=skipped+1;
   elsif p_mode='update' then kind:='update';updates:=updates+1;
   else kind:='conflict';conflicts:=conflicts+1;end if;
   plan:=plan||jsonb_build_array(jsonb_build_object('table',t,'id',v_record_id,'action',kind,'label',left(coalesce(nullif(rowdoc->>'title',''),nullif(rowdoc->>'display_name',''),nullif(rowdoc->>'name',''),nullif(rowdoc->>'baby_nickname',''),nullif(rowdoc->>'legacy_id',''),rowdoc->>'id'),120),'currentLabel',left(coalesce(nullif(old->>'title',''),nullif(old->>'display_name',''),nullif(old->>'name',''),nullif(old->>'baby_nickname',''),old->>'legacy_id',old->>'id'),120),'beforeHash',case when old is null then null else md5(old::text) end));
  end loop;
 end loop;
 insert into public.myb_restore_jobs_v1650(id,family_id,payload,payload_hash,before_image,expected_revision,mode,plan)
 values(job,f,p_payload,md5(p_payload::text),snap,md5(snap::text),p_mode,plan);
 return jsonb_build_object('ok',true,'jobId',job,'state','preview','mode',p_mode,'counts',jsonb_build_object('insert',inserts,'update',updates,'skip',skipped,'conflict',conflicts),'records',plan,'message','PREVIEW_ONLY_NO_BUSINESS_WRITES');
exception when others then return jsonb_build_object('ok',false,'code','RESTORE_VALIDATION','message',sqlerrm);end $$;

create or replace function public.myb_backup_status_v1650(p_sync_id text,p_job_id uuid) returns jsonb
language sql security definer set search_path=public,pg_temp as $$
 select coalesce((select case when state='applied' then response else jsonb_build_object('ok',true,'state',state,'jobId',id,'payloadHash',payload_hash) end from public.myb_restore_jobs_v1650 where id=p_job_id and family_id=public.myb_stable_uuid('family:'||p_sync_id)),jsonb_build_object('ok',false,'code','NOT_FOUND','message','RESTORE_JOB_NOT_FOUND'))
$$;

create or replace function public.myb_backup_apply_v1650(p_sync_id text,p_job_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); job public.myb_restore_jobs_v1650; snap jsonb; t text; action jsonb; rowdoc jsonb; old jsonb; cols text; updates text; balance numeric; m record; applied int:=0; result jsonb; balances jsonb:='[]';
begin
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 select * into job from public.myb_restore_jobs_v1650 where id=p_job_id and family_id=f for update;
 if job.id is null then raise exception 'RESTORE_JOB_NOT_FOUND';end if;
 if job.state='applied' then return job.response;end if;
 -- Prevent direct table writers racing the preview check / record updates.
 foreach t in array public.myb_backup_tables_v1650() loop if job.payload->'tables'?t then execute format('lock table public.%I in share row exclusive mode',t);end if;end loop;
 snap:=public.myb_backup_snapshot_v1650(f);
 if md5(snap::text)<>job.expected_revision then raise exception 'STALE_PREVIEW_REVIEW_AGAIN';end if;
 foreach t in array public.myb_backup_tables_v1650() loop
  for action in select value from jsonb_array_elements(job.plan) where value->>'table'=t and value->>'action' in('insert','update') loop
   select value into rowdoc from jsonb_array_elements(job.payload->'tables'->t) where value->>'id'=action->>'id';
   execute format('select to_jsonb(x) from public.%I x where id=$1',t) into old using (rowdoc->>'id')::uuid;
   if rowdoc?'version' then rowdoc:=rowdoc||jsonb_build_object('version',coalesce((old->>'version')::int,(rowdoc->>'version')::int,0)+1);end if;
   if rowdoc?'updated_at' then rowdoc:=rowdoc||jsonb_build_object('updated_at',clock_timestamp());end if;
   if rowdoc?'last_op_id' then rowdoc:=rowdoc||jsonb_build_object('last_op_id',null);end if;
   select string_agg(format('%I',attname),',' order by attnum),string_agg(format('%I=excluded.%I',attname,attname),',' order by attnum) filter(where attname<>'id') into cols,updates from pg_attribute where attrelid=to_regclass('public.'||t) and attnum>0 and not attisdropped and attgenerated='' and attidentity='';
   execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) on conflict(id) do update set %s',t,cols,cols,t,updates) using rowdoc;
   applied:=applied+1;
  end loop;
 end loop;
 -- The ledger is authoritative. Do not trust remaining_ml from a backup.
 for m in select mi.* from public.milk_items mi where mi.family_id=f and mi.deleted_at is null loop
  select m.amount_ml+coalesce(sum(case when transaction_type in('feed_use','discard','transfer_out') then -ml when transaction_type in('transfer_in','adjust') then ml else 0 end) filter(where deleted_at is null),0) into balance from milk_transactions where milk_item_id=m.id and family_id=f;
  if balance<0 then raise exception 'MILK_LEDGER_NEGATIVE: %',m.id;end if;
  if m.remaining_ml is distinct from balance then update milk_items set remaining_ml=balance,updated_at=clock_timestamp(),version=version+1 where id=m.id and family_id=f;end if;
  balances:=balances||jsonb_build_array(jsonb_build_object('id',m.id,'remainingMl',balance));
 end loop;
 if exists(select 1 from feed_milk_sources s join feed_events e on e.id=s.feed_event_id where s.family_id=f and s.deleted_at is null and e.deleted_at is null group by e.care_event_id,s.milk_item_id having sum(s.used_ml) is distinct from (select coalesce(sum(mt.ml),0) from milk_transactions mt where mt.family_id=f and mt.care_event_id=e.care_event_id and mt.milk_item_id=s.milk_item_id and mt.transaction_type='feed_use' and mt.deleted_at is null)) then raise exception 'MILK_FEED_LEDGER_MISMATCH';end if;
 result:=jsonb_build_object('ok',true,'jobId',job.id,'state','applied','appliedRecords',applied,'milkBalances',balances,'filesState','VERIFY_FILES_SEPARATELY');
 update public.myb_restore_jobs_v1650 set state='applied',response=result,applied_at=clock_timestamp() where id=job.id;
 return result;
exception when others then return jsonb_build_object('ok',false,'code','RESTORE_FAILED','message',sqlerrm);end $$;

create or replace function public.myb_backup_before_v1650(p_sync_id text,p_job_id uuid) returns jsonb
language sql security definer set search_path=public,pg_temp as $$
 select coalesce((select jsonb_build_object('ok',true,'payload',before_image) from myb_restore_jobs_v1650 where id=p_job_id and family_id=myb_stable_uuid('family:'||p_sync_id)),jsonb_build_object('ok',false,'message','RESTORE_JOB_NOT_FOUND'))
$$;
revoke all on function public.myb_backup_before_v1650(text,uuid) from public;
grant execute on function public.myb_backup_before_v1650(text,uuid) to anon,authenticated,service_role;

-- Server-only path access for backup/archive bytes, including soft-deleted owners.
create or replace function public.myb_backup_media_v1650(p_sync_id text,p_id uuid,p_op text default 'read') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); r public.myb_media_v1640;
begin
 if nullif(btrim(p_sync_id),'') is null or not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'INVALID_FAMILY';end if;
 select * into r from myb_media_v1640 where id=p_id and family_id=f for update;
 if r.id is null then raise exception 'BACKUP_FILE_NOT_FOUND';end if;
 if p_op='ready' then update myb_media_v1640 set status=case when status='pending' then 'ready' else status end,updated_at=clock_timestamp() where id=r.id returning * into r;
 elsif p_op<>'read' then raise exception 'INVALID_MEDIA_ACTION';end if;
 return jsonb_build_object('ok',true,'item',to_jsonb(r));
end $$;
revoke all on function public.myb_backup_media_v1650(text,uuid,text) from public,anon,authenticated;
grant execute on function public.myb_backup_media_v1650(text,uuid,text) to service_role;
grant execute on function public.myb_backup_export_v1650(text),public.myb_backup_preview_v1650(text,jsonb,text),public.myb_backup_status_v1650(text,uuid),public.myb_backup_apply_v1650(text,uuid) to anon,authenticated,service_role;
revoke all on function public.myb_backup_export_v1650(text),public.myb_backup_preview_v1650(text,jsonb,text),public.myb_backup_status_v1650(text,uuid),public.myb_backup_apply_v1650(text,uuid) from public;
notify pgrst,'reload schema';
commit;
