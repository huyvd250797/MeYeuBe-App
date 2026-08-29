-- ============================================================================
-- Mẹ Yêu Bé V15.0.80 · Egress Optimization + Incremental Realtime
-- Relational tables remain the ONLY source of truth.
-- Requires SUPABASE_RELIABILITY_V15.0.79.sql. Safe to run more than once.
-- ============================================================================

begin;

-- V15.0.80 self-healing schema patch.
-- Some databases may still have the V15.0.77 shape of myb_realtime_events.
-- Add every metadata column required by V15.0.79/V15.0.80 BEFORE creating indexes/functions.
alter table public.myb_realtime_events
  add column if not exists revision bigint,
  add column if not exists operation_id uuid,
  add column if not exists changed_entities text[];

create index if not exists idx_myb_realtime_events_family_revision_v1580
  on public.myb_realtime_events(family_id, revision)
  where revision is not null;

-- Full export: only first load / manual / safety fallback. Lock keeps payload+revision consistent.
create or replace function public.myb_relational_export_state_v1580(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v jsonb;
begin
  perform pg_advisory_xact_lock(hashtext(v_family_id::text));
  v := public.myb_relational_export_state_v1579(v_sync_id);
  return coalesce(v,'{}'::jsonb) || jsonb_build_object(
    'runtime_version','15.0.80','egress_mode','incremental_sections','full_polling',false
  );
end;
$$;

-- Tiny revision check: does NOT build business payload.
create or replace function public.myb_relational_revision_v1580(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_revision bigint := 0;
  v_conflicts bigint := 0;
  v_last_changed timestamptz;
  v_last_conflict timestamptz;
  v_last_operation uuid;
  v_online int := 0;
  v_devices int := 0;
begin
  insert into public.myb_family_runtime_state(family_id,revision,created_at,updated_at)
  values(v_family_id,0,now(),now()) on conflict(family_id) do nothing;

  select revision,conflict_count,last_changed_at,last_conflict_at,last_operation_id
    into v_revision,v_conflicts,v_last_changed,v_last_conflict,v_last_operation
  from public.myb_family_runtime_state where family_id=v_family_id;

  select count(*)::int,
         count(*) filter(where last_seen_at>=now()-interval '3 minutes')::int
    into v_devices,v_online
  from public.devices where family_id=v_family_id and deleted_at is null;

  return jsonb_build_object(
    'ok',true,'runtime_version','15.0.80','sync_id',v_sync_id,'family_id',v_family_id,
    'revision',coalesce(v_revision,0),'conflict_count',coalesce(v_conflicts,0),
    'last_changed_at',v_last_changed,'last_conflict_at',v_last_conflict,
    'last_operation_id',v_last_operation,'device_count',coalesce(v_devices,0),
    'online_device_count',coalesce(v_online,0),'server_time',now()
  );
end;
$$;

-- Tiny change map since a known revision. Reads only myb_realtime_events metadata.
create or replace function public.myb_relational_changes_since_v1580(
  p_sync_id text default 'main',
  p_since_revision bigint default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_current bigint := 0;
  v_expected bigint := 0;
  v_seen bigint := 0;
  v_missing_meta boolean := false;
  v_entities text[] := array[]::text[];
  v_unknown boolean := false;
  v_conflicts bigint := 0;
  v_last_conflict timestamptz;
  v_last_operation uuid;
begin
  insert into public.myb_family_runtime_state(family_id,revision,created_at,updated_at)
  values(v_family_id,0,now(),now()) on conflict(family_id) do nothing;

  select revision,conflict_count,last_conflict_at,last_operation_id
    into v_current,v_conflicts,v_last_conflict,v_last_operation
  from public.myb_family_runtime_state where family_id=v_family_id;

  if coalesce(p_since_revision,0)>=coalesce(v_current,0) then
    return jsonb_build_object(
      'ok',true,'runtime_version','15.0.80','family_id',v_family_id,
      'since_revision',coalesce(p_since_revision,0),'current_revision',coalesce(v_current,0),
      'requires_full',false,'entities','[]'::jsonb,'event_count',0,
      'conflict_count',coalesce(v_conflicts,0),'last_conflict_at',v_last_conflict,
      'last_operation_id',v_last_operation
    );
  end if;

  v_expected := greatest(0,coalesce(v_current,0)-coalesce(p_since_revision,0));
  if v_expected>250 then
    return jsonb_build_object(
      'ok',true,'runtime_version','15.0.80','family_id',v_family_id,
      'since_revision',coalesce(p_since_revision,0),'current_revision',coalesce(v_current,0),
      'requires_full',true,'reason','revision_gap_too_large','entities','[]'::jsonb,
      'event_count',0,'expected_event_count',v_expected,
      'conflict_count',coalesce(v_conflicts,0),'last_conflict_at',v_last_conflict,
      'last_operation_id',v_last_operation
    );
  end if;

  select count(distinct revision),
         coalesce(bool_or(changed_entities is null or cardinality(changed_entities)=0),false)
    into v_seen,v_missing_meta
  from public.myb_realtime_events
  where family_id=v_family_id
    and revision>coalesce(p_since_revision,0)
    and revision<=v_current;

  select coalesce(array_agg(distinct u.e order by u.e),array[]::text[])
    into v_entities
  from public.myb_realtime_events r
  cross join lateral unnest(coalesce(r.changed_entities,array[]::text[])) as u(e)
  where r.family_id=v_family_id
    and r.revision>coalesce(p_since_revision,0)
    and r.revision<=v_current;

  select exists(
    select 1 from unnest(coalesce(v_entities,array[]::text[])) as u(e)
    where u.e not in (
      'settings','health_member','care_event','milk_item','milk_container','diary_entry',
      'milestone','appointment','pregnancy','app_member','noise_log','lux_log',
      'activity_log','appointment_type','diary_type','monthly_notes'
    )
  ) into v_unknown;

  return jsonb_build_object(
    'ok',true,'runtime_version','15.0.80','family_id',v_family_id,
    'since_revision',coalesce(p_since_revision,0),'current_revision',coalesce(v_current,0),
    'requires_full',(v_seen<>v_expected or v_missing_meta or v_unknown),
    'reason',case when v_seen<>v_expected then 'missing_revision_event'
                  when v_missing_meta then 'legacy_event_without_change_map'
                  when v_unknown then 'unknown_entity' else null end,
    'entities',to_jsonb(coalesce(v_entities,array[]::text[])),
    'event_count',v_seen,'expected_event_count',v_expected,
    'conflict_count',coalesce(v_conflicts,0),'last_conflict_at',v_last_conflict,
    'last_operation_id',v_last_operation
  );
end;
$$;

-- Canonical exporter is reused for mapping correctness, but response contains ONLY requested sections.
create or replace function public.myb_relational_export_incremental_v1580(
  p_sync_id text default 'main',
  p_entities text[] default array[]::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_full jsonb;
  v_source jsonb := '{}'::jsonb;
  v_out jsonb := '{}'::jsonb;
  v_revision bigint := 0;
  v_conflicts bigint := 0;
  v_last_conflict timestamptz;
  v_last_operation uuid;
  v_entities text[] := coalesce(p_entities,array[]::text[]);
begin
  if cardinality(v_entities)=0 then
    return jsonb_build_object('ok',false,'status','empty_entities','message','Không có entity cần tải');
  end if;

  perform pg_advisory_xact_lock(hashtext(v_family_id::text));
  v_full := public.myb_relational_export_state_v1576(v_sync_id);
  if coalesce((v_full->>'ok')::boolean,false) is not true then
    return coalesce(v_full,'{}'::jsonb) || jsonb_build_object('runtime_version','15.0.80');
  end if;
  v_source := coalesce(v_full->'payload','{}'::jsonb);

  if 'settings'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('settings',coalesce(v_source->'settings','{}'::jsonb));
  end if;
  if 'health_member'=any(v_entities) then
    v_out:=v_out||jsonb_build_object(
      'hb',coalesce(v_source->'hb','{}'::jsonb),
      'healthBook',coalesce(v_source->'healthBook','[]'::jsonb),
      'baby',coalesce(v_source->'baby','[]'::jsonb),
      'mom',coalesce(v_source->'mom','[]'::jsonb));
  end if;
  if 'care_event'=any(v_entities) then
    v_out:=v_out||jsonb_build_object(
      'careEvents',coalesce(v_source->'careEvents','[]'::jsonb),
      'milkInventory',coalesce(v_source->'milkInventory','[]'::jsonb));
  end if;
  if 'milk_item'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('milkInventory',coalesce(v_source->'milkInventory','[]'::jsonb));
  end if;
  if 'milk_container'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('milkContainers',coalesce(v_source->'milkContainers','[]'::jsonb));
  end if;
  if 'diary_entry'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('diary',coalesce(v_source->'diary','[]'::jsonb));
  end if;
  if 'milestone'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('milestones',coalesce(v_source->'milestones','[]'::jsonb));
  end if;
  if 'appointment'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('appointments',coalesce(v_source->'appointments','[]'::jsonb));
  end if;
  if 'pregnancy'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('pregnancy',coalesce(v_source->'pregnancy','[]'::jsonb));
  end if;
  if 'app_member'=any(v_entities) then
    v_out:=v_out||jsonb_build_object(
      'members',coalesce(v_source->'members','[]'::jsonb),
      'permissions',coalesce(v_source->'permissions','{}'::jsonb),
      'familyInvites',coalesce(v_source->'familyInvites','[]'::jsonb));
  end if;
  if 'noise_log'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('noiseLogs',coalesce(v_source->'noiseLogs','[]'::jsonb));
  end if;
  if 'lux_log'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('luxLogs',coalesce(v_source->'luxLogs','[]'::jsonb));
  end if;
  if 'activity_log'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('activityLog',coalesce(v_source->'activityLog','[]'::jsonb));
  end if;
  if 'appointment_type'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('appointmentTypes',coalesce(v_source->'appointmentTypes','[]'::jsonb));
  end if;
  if 'diary_type'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('diaryTypes',coalesce(v_source->'diaryTypes','[]'::jsonb));
  end if;
  if 'monthly_notes'=any(v_entities) then
    v_out:=v_out||jsonb_build_object('monthlyNotes',coalesce(v_source->'monthlyNotes','{}'::jsonb));
  end if;

  select revision,conflict_count,last_conflict_at,last_operation_id
    into v_revision,v_conflicts,v_last_conflict,v_last_operation
  from public.myb_family_runtime_state where family_id=v_family_id;

  return jsonb_build_object(
    'ok',true,'runtime_version','15.0.80','egress_mode','incremental_sections',
    'sync_id',v_sync_id,'family_id',v_family_id,'revision',coalesce(v_revision,0),
    'entities',to_jsonb(v_entities),'payload',v_out,
    'conflict_count',coalesce(v_conflicts,0),'last_conflict_at',v_last_conflict,
    'last_operation_id',v_last_operation,'server_time',now()
  );
end;
$$;

-- Guarded write V15.0.80: same idempotency/revision semantics + changed_entities metadata.
create or replace function public.myb_relational_apply_changes_v1580(
  p_sync_id text default 'main',
  p_device_key text default null,
  p_operation_id uuid default gen_random_uuid(),
  p_base_revision bigint default 0,
  p_changes jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_current_revision bigint := 0;
  v_new_revision bigint := 0;
  v_existing_status text;
  v_existing_result jsonb;
  v_result jsonb;
  v_change_count int := case when jsonb_typeof(p_changes)='array' then jsonb_array_length(p_changes) else 0 end;
  v_entities text[] := array[]::text[];
begin
  if p_operation_id is null then
    return jsonb_build_object('ok',false,'status','invalid_operation_id','message','operation_id không được null');
  end if;
  if jsonb_typeof(p_changes) is distinct from 'array' then
    return jsonb_build_object('ok',false,'status','invalid_changes','message','p_changes phải là JSON array');
  end if;

  select coalesce(array_agg(distinct s.e order by s.e),array[]::text[])
    into v_entities
  from (
    select nullif(trim(x->>'entity'),'') e
    from jsonb_array_elements(p_changes) x
  ) s where s.e is not null;

  perform pg_advisory_xact_lock(hashtext(v_family_id::text));

  insert into public.families(id,sync_code,name,legacy_sync_id,created_at,updated_at,deleted_at)
  values(v_family_id,v_sync_id,'Mẹ Yêu Bé',v_sync_id,now(),now(),null)
  on conflict(id) do update set updated_at=now(),deleted_at=null;

  insert into public.myb_family_runtime_state(family_id,revision,created_at,updated_at)
  values(v_family_id,0,now(),now()) on conflict(family_id) do nothing;

  select status,result into v_existing_status,v_existing_result
  from public.myb_idempotent_operations
  where family_id=v_family_id and operation_id=p_operation_id;

  if v_existing_status='applied' then
    return coalesce(v_existing_result,'{}'::jsonb)||jsonb_build_object(
      'ok',true,'status','already_applied','idempotent_replay',true,
      'operation_id',p_operation_id,'changed_entities',to_jsonb(v_entities));
  elsif v_existing_status='conflict' then
    return coalesce(v_existing_result,'{}'::jsonb)||jsonb_build_object(
      'ok',false,'status','conflict','idempotent_replay',true,
      'operation_id',p_operation_id,'changed_entities',to_jsonb(v_entities));
  end if;

  select revision into v_current_revision
  from public.myb_family_runtime_state where family_id=v_family_id for update;

  if coalesce(p_base_revision,0)<>coalesce(v_current_revision,0) then
    update public.myb_family_runtime_state
      set conflict_count=conflict_count+1,last_conflict_at=now(),updated_at=now()
    where family_id=v_family_id;

    v_result:=jsonb_build_object(
      'ok',false,'status','conflict',
      'message','Database đã thay đổi trên thiết bị khác. Không ghi đè dữ liệu mới hơn.',
      'sync_id',v_sync_id,'family_id',v_family_id,'operation_id',p_operation_id,
      'base_revision',coalesce(p_base_revision,0),'current_revision',coalesce(v_current_revision,0),
      'change_count',v_change_count,'changed_entities',to_jsonb(v_entities));

    insert into public.myb_idempotent_operations(
      family_id,operation_id,device_key,base_revision,change_count,status,result,error,attempt_count,created_at,updated_at)
    values(v_family_id,p_operation_id,p_device_key,p_base_revision,v_change_count,'conflict',v_result,'revision_conflict',1,now(),now())
    on conflict(family_id,operation_id) do update set
      status='conflict',result=excluded.result,error='revision_conflict',
      attempt_count=public.myb_idempotent_operations.attempt_count+1,updated_at=now();
    return v_result;
  end if;

  insert into public.myb_idempotent_operations(
    family_id,operation_id,device_key,base_revision,change_count,status,attempt_count,created_at,updated_at)
  values(v_family_id,p_operation_id,p_device_key,p_base_revision,v_change_count,'processing',1,now(),now())
  on conflict(family_id,operation_id) do update set
    status='processing',attempt_count=public.myb_idempotent_operations.attempt_count+1,
    updated_at=now(),error=null;

  -- Existing V15.0.77 trigger recognizes this setting and will not emit an early duplicate signal.
  perform set_config('myb.v1579_operation_id',p_operation_id::text,true);
  perform set_config('myb.v1580_operation_id',p_operation_id::text,true);

  v_result:=public.myb_relational_apply_changes_v1576(
    p_sync_id=>v_sync_id,p_device_key=>p_device_key,p_changes=>p_changes);

  if coalesce((v_result->>'ok')::boolean,false) is not true then
    update public.myb_idempotent_operations
      set status='failed',result=coalesce(v_result,'{}'::jsonb),
          error=coalesce(v_result->>'message','apply_failed'),updated_at=now()
    where family_id=v_family_id and operation_id=p_operation_id;
    return coalesce(v_result,'{}'::jsonb)||jsonb_build_object(
      'operation_id',p_operation_id,'base_revision',p_base_revision,
      'current_revision',v_current_revision,'changed_entities',to_jsonb(v_entities));
  end if;

  update public.myb_family_runtime_state
    set revision=revision+1,last_operation_id=p_operation_id,last_device_key=p_device_key,
        last_changed_at=now(),updated_at=now()
  where family_id=v_family_id returning revision into v_new_revision;

  v_result:=coalesce(v_result,'{}'::jsonb)||jsonb_build_object(
    'ok',true,'status','applied','runtime_version','15.0.80','operation_id',p_operation_id,
    'base_revision',p_base_revision,'revision',v_new_revision,'change_count',v_change_count,
    'changed_entities',to_jsonb(v_entities));

  update public.myb_idempotent_operations
    set status='applied',applied_revision=v_new_revision,result=v_result,error=null,
        applied_at=now(),updated_at=now()
  where family_id=v_family_id and operation_id=p_operation_id;

  insert into public.myb_realtime_events(
    family_id,event_kind,revision,operation_id,changed_entities,created_at)
  values(v_family_id,'relational_write_v1580',v_new_revision,p_operation_id,v_entities,now());

  if random()<0.01 then
    delete from public.myb_idempotent_operations
      where family_id=v_family_id and created_at<now()-interval '45 days';
    delete from public.myb_realtime_events
      where family_id=v_family_id and created_at<now()-interval '30 days';
  end if;

  return v_result;
exception when others then
  begin
    insert into public.myb_idempotent_operations(
      family_id,operation_id,device_key,base_revision,change_count,status,result,error,attempt_count,created_at,updated_at)
    values(v_family_id,p_operation_id,p_device_key,p_base_revision,v_change_count,'failed','{}'::jsonb,sqlerrm,1,now(),now())
    on conflict(family_id,operation_id) do update set
      status='failed',error=sqlerrm,
      attempt_count=public.myb_idempotent_operations.attempt_count+1,updated_at=now();
  exception when others then null;
  end;
  return jsonb_build_object(
    'ok',false,'status','failed','message',sqlerrm,'sync_id',v_sync_id,
    'family_id',v_family_id,'operation_id',p_operation_id,'changed_entities',to_jsonb(v_entities));
end;
$$;

-- Presence carries revision so iOS background websocket loss is recovered with a tiny response.
create or replace function public.myb_relational_presence_v1580(
  p_sync_id text default 'main',
  p_device_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base jsonb;
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_revision bigint := 0;
begin
  v_base:=public.myb_relational_presence_v1579(p_sync_id,p_device_key);
  select revision into v_revision
  from public.myb_family_runtime_state where family_id=v_family_id;
  return coalesce(v_base,'{}'::jsonb)||jsonb_build_object(
    'runtime_version','15.0.80','revision',coalesce(v_revision,0),'full_polling',false);
end;
$$;

grant execute on function public.myb_relational_export_state_v1580(text) to anon,authenticated;
grant execute on function public.myb_relational_revision_v1580(text) to anon,authenticated;
grant execute on function public.myb_relational_changes_since_v1580(text,bigint) to anon,authenticated;
grant execute on function public.myb_relational_export_incremental_v1580(text,text[]) to anon,authenticated;
grant execute on function public.myb_relational_apply_changes_v1580(text,text,uuid,bigint,jsonb) to anon,authenticated;
grant execute on function public.myb_relational_presence_v1580(text,text) to anon,authenticated;

comment on function public.myb_relational_export_incremental_v1580(text,text[]) is
'V15.0.80: canonical relational mapping, but response only contains requested changed sections to reduce egress.';
comment on function public.myb_relational_changes_since_v1580(text,bigint) is
'V15.0.80: lightweight revision change-map from realtime metadata; no business table scan.';

commit;

-- All *_ok should be true.
select
  exists(select 1 from pg_proc where proname='myb_relational_export_state_v1580') as full_export_ok,
  exists(select 1 from pg_proc where proname='myb_relational_revision_v1580') as revision_check_ok,
  exists(select 1 from pg_proc where proname='myb_relational_changes_since_v1580') as change_map_ok,
  exists(select 1 from pg_proc where proname='myb_relational_export_incremental_v1580') as incremental_export_ok,
  exists(select 1 from pg_proc where proname='myb_relational_apply_changes_v1580') as guarded_write_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='myb_realtime_events' and column_name='changed_entities') as realtime_change_metadata_ok,
  exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='myb_realtime_events') as realtime_publication_ok;
