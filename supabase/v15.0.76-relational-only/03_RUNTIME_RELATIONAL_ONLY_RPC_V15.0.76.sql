-- Mẹ Yêu Bé V15.0.76 · RelationalOnlyDirectTableCutover runtime RPC
-- Storage source of truth: relational tables only.
-- p_changes is a transport batch of row-level deltas; it is NOT persisted as a monolithic JSON database.

begin;


create or replace function public.myb_v1576_local_timestamptz(p_text text)
returns timestamptz
language plpgsql
immutable
as $$
declare v text := btrim(coalesce(p_text,''));
begin
  if v='' then return null; end if;
  -- Legacy expiry fields were entered/displayed in Việt Nam local time. If no
  -- timezone is present, interpret them as Asia/Ho_Chi_Minh instead of the DB
  -- session timezone. ISO values ending Z / +/-offset keep their own timezone.
  if v ~ '^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$' then
    return (replace(v,'T',' ')::timestamp at time zone 'Asia/Ho_Chi_Minh');
  end if;
  return public.myb_safe_timestamptz(v);
exception when others then
  return public.myb_safe_timestamptz(p_text);
end;
$$;

create or replace function public.myb_v1576_reconcile_milk_balance(
  p_family_id uuid,
  p_milk_item_id uuid,
  p_device_id uuid default null
) returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_amount numeric := 0;
  v_target numeric := 0;
  v_used numeric := 0;
  v_discard numeric := 0;
  v_out numeric := 0;
  v_in numeric := 0;
  v_adjust numeric := 0;
  v_diff numeric := 0;
  v_tx_id uuid;
begin
  select coalesce(amount_ml,0), coalesce(remaining_ml,0)
  into v_amount, v_target
  from public.milk_items
  where id=p_milk_item_id and family_id=p_family_id and deleted_at is null;
  if not found then return; end if;

  v_tx_id := public.myb_stable_uuid('milk_tx:runtime_balance:' || p_milk_item_id::text);
  delete from public.milk_transactions where id=v_tx_id;

  select
    coalesce(sum(case when transaction_type='feed_use' then ml else 0 end),0),
    coalesce(sum(case when transaction_type='discard' then ml else 0 end),0),
    coalesce(sum(case when transaction_type='transfer_out' then ml else 0 end),0),
    coalesce(sum(case when transaction_type='transfer_in' then ml else 0 end),0),
    coalesce(sum(case when transaction_type='adjust' then ml else 0 end),0)
  into v_used,v_discard,v_out,v_in,v_adjust
  from public.milk_transactions
  where family_id=p_family_id and milk_item_id=p_milk_item_id and deleted_at is null;

  v_diff := v_target - (v_amount - v_used - v_discard - v_out + v_in + v_adjust);
  if abs(v_diff) > 0.001 then
    insert into public.milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,reason,created_at,created_by_device,deleted_at)
    values(v_tx_id,p_family_id,p_milk_item_id,null,'adjust',v_diff,'V15.0.76 runtime reconciliation to authoritative remaining_ml',now(),p_device_id,null)
    on conflict(id) do update set ml=excluded.ml,reason=excluded.reason,created_at=now(),created_by_device=p_device_id,deleted_at=null;
  end if;
end;
$$;

create or replace function public.myb_relational_export_state_v1576(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_payload jsonb := '{}'::jsonb;
  v_settings jsonb := '{}'::jsonb;
  v_hb jsonb := '{}'::jsonb;
  v_members jsonb := '[]'::jsonb;
  v_care jsonb := '[]'::jsonb;
  v_milk jsonb := '[]'::jsonb;
  v_cont jsonb := '[]'::jsonb;
  v_diary jsonb := '[]'::jsonb;
  v_ms jsonb := '[]'::jsonb;
  v_appt jsonb := '[]'::jsonb;
  v_preg jsonb := '[]'::jsonb;
  v_app_members jsonb := '[]'::jsonb;
  v_noise jsonb := '[]'::jsonb;
  v_lux jsonb := '[]'::jsonb;
  v_activity jsonb := '[]'::jsonb;
  v_monthly jsonb := '{}'::jsonb;
  v_appt_types jsonb := '[]'::jsonb;
  v_diary_types jsonb := '[]'::jsonb;
begin
  if not exists(select 1 from public.families where id=v_family_id and deleted_at is null) then
    return jsonb_build_object('ok',false,'status','family_not_found','sync_id',v_sync_id,'family_id',v_family_id);
  end if;

  select coalesce(aps.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
    'lmp', aps.lmp,
    'babyName', aps.baby_nickname,
    'officialName', aps.baby_official_name,
    'babySex', aps.baby_sex,
    'birthDate', aps.birth_date,
    'birthTime', aps.birth_time,
    'birthHospital', aps.birth_hospital,
    'themeMode', aps.theme_mode,
    'avatarDataUrl', aps.avatar_data_url,
    'showOfficialName', aps.show_official_name
  )) into v_settings
  from public.app_settings aps
  where aps.family_id=v_family_id and aps.deleted_at is null
  limit 1;
  v_settings := coalesce(v_settings,'{}'::jsonb);

  select coalesce(jsonb_agg(member_doc order by sort_key, created_at),'[]'::jsonb)
  into v_members
  from (
    select
      case hm.relation when 'Mẹ' then 1 when 'Ba' then 2 when 'Con' then 3 else 9 end sort_key,
      hm.created_at,
      coalesce(hm.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
        'id', coalesce(hm.legacy_id,hm.id::text),
        'name', hm.display_name,
        'rel', hm.relation,
        'gender', hm.gender,
        'dob', hm.dob,
        'blood', hm.blood_type,
        'height', hm.height_text,
        'weight', hm.weight_text,
        'phone', hm.phone,
        'email', hm.email,
        'medical', jsonb_build_object('bhyt',coalesce(hm.bhyt,''),'bhytExp',coalesce(hm.bhyt_exp::text,''),'bhytPlace',coalesce(hm.bhyt_place,''),'bhxh',coalesce(hm.bhxh,''),'hospital',coalesce(hm.hospital,''),'doctor',coalesce(hm.doctor,''),'emergency',coalesce(hm.emergency_contact,'')),
        'status', jsonb_build_object('txt',coalesce(hm.status_text,''),'tone',coalesce(hm.status_tone,'')),
        'meas', coalesce((
          select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
            'id', m.legacy_id,
            'date',m.measure_date,
            'weight',case when m.weight_g is null then null else (m.weight_g/1000.0)::text end,
            'height',case when m.height_cm is null then null else m.height_cm::text end,
            'head',case when m.head_cm is null then null else m.head_cm::text end,
            'note',m.note,
            'createdAt',m.created_at,
            'updatedAt',m.updated_at
          )) order by m.measure_date,m.created_at)
          from public.health_measurements m where m.member_id=hm.id and m.deleted_at is null
        ),'[]'::jsonb),
        'vaccines', coalesce((
          select jsonb_agg(coalesce(vr.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
            'id',coalesce(vr.legacy_id,vr.id::text),
            'name',vr.vaccine_name,
            'date',vr.injection_date,
            'place',vr.place,
            'manufacturer',vr.manufacturer,
            'lotNumber',vr.lot_number,
            'reaction',vr.reaction,
            'reactionLevel',vr.reaction_level,
            'note',vr.note,
            'createdAt',vr.created_at,
            'updatedAt',vr.updated_at
          )) order by vr.injection_date,vr.created_at)
          from public.vaccine_records vr where vr.member_id=hm.id and vr.deleted_at is null
        ),'[]'::jsonb),
        'visits', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('date',x.visit_date,'time',x.visit_time,'hospital',x.hospital,'doctor',x.doctor,'symptom',x.symptom,'diagnosis',x.diagnosis,'treatment',x.treatment,'medicine',x.medicine_note,'cost',x.cost,'note',x.note,'createdAt',x.created_at,'updatedAt',x.updated_at)) order by x.visit_date,x.created_at) from public.health_visits x where x.member_id=hm.id and x.deleted_at is null),'[]'::jsonb),
        'meds', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('name',x.name,'dose',x.dose,'from',x.from_date,'to',x.to_date,'active',x.active,'remind',x.remind,'note',x.note,'createdAt',x.created_at,'updatedAt',x.updated_at)) order by x.created_at) from public.health_medications x where x.member_id=hm.id and x.deleted_at is null),'[]'::jsonb),
        'labs', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('date',x.lab_date,'title',x.title,'place',x.place,'result',x.result_summary,'note',x.note,'createdAt',x.created_at,'updatedAt',x.updated_at)) order by x.lab_date,x.created_at) from public.health_labs x where x.member_id=hm.id and x.deleted_at is null),'[]'::jsonb)
      )) as member_doc
    from public.health_members hm
    where hm.family_id=v_family_id and hm.deleted_at is null
  ) s;

  select coalesce(jsonb_build_object(
    'members',v_members,
    'activeId',(select coalesce(legacy_id,id::text) from public.health_members where family_id=v_family_id and relation='Con' and deleted_at is null order by created_at limit 1),
    'migrated',true,
    '_relationalOnly',true
  ),'{}'::jsonb) into v_hb;

  select coalesce(jsonb_agg(coalesce(ce.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
      'id',coalesce(ce.legacy_id,ce.id::text),'type',ce.type,'date',ce.event_date,'timeFrom',ce.time_from,'timeTo',ce.time_to,
      'amount',ce.amount,'unit',ce.unit,'source',ce.source,'status',case when ce.status='active' then '' else ce.status end,'note',coalesce(ce.note,''),
      'createdAt',ce.created_at,'updatedAt',ce.updated_at
    )) order by ce.event_date,ce.time_from,ce.created_at),'[]'::jsonb)
  into v_care from public.care_events ce where ce.family_id=v_family_id and ce.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(mi.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
      'id',coalesce(mi.legacy_id,mi.id::text),'shortId',mi.short_code,'amount',mi.amount_ml,'remaining',coalesce(mi.remaining_ml,mb.remaining_ml),
      'containerId',mc.legacy_id,'containerKind',mi.container_kind,'containerName',mi.container_name,'storage',mi.storage,
      'expireDateTime',mi.expire_at,'expireDate',mi.expire_at,'status',coalesce(mi.legacy_status,public.myb_milk_status_vi(mb.computed_status)),
      'note',coalesce(mi.note,''),'pumpEventId',pce.legacy_id,'createdAt',mi.created_at,'updatedAt',mi.updated_at
    )) order by mi.created_at,mi.id),'[]'::jsonb)
  into v_milk
  from public.milk_items mi
  left join public.milk_item_balances mb on mb.milk_item_id=mi.id
  left join public.milk_containers mc on mc.id=mi.container_id and mc.deleted_at is null
  left join public.pump_events pe on pe.id=mi.pump_event_id and pe.deleted_at is null
  left join public.care_events pce on pce.id=pe.care_event_id and pce.deleted_at is null
  where mi.family_id=v_family_id and mi.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(mc.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
      'id',coalesce(mc.legacy_id,mc.id::text),'name',mc.name,'kind',mc.kind,'color',mc.color,'capacity',mc.capacity_ml,'capacityMl',mc.capacity_ml,
      'active',mc.active,'createdAt',mc.created_at,'updatedAt',mc.updated_at
    )) order by mc.sort_order,mc.created_at),'[]'::jsonb)
  into v_cont from public.milk_containers mc where mc.family_id=v_family_id and mc.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(de.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',de.legacy_id,'date',de.entry_date,'time',de.time_from,'timeFrom',de.time_from,'timeTo',de.time_to,'category',de.category,'title',de.title,'note',de.note,'createdAt',de.created_at,'updatedAt',de.updated_at)) order by de.entry_date,de.time_from,de.created_at),'[]'::jsonb)
  into v_diary from public.diary_entries de where de.family_id=v_family_id and de.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(ms.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',coalesce(ms.legacy_id,ms.id::text),'key',ms.milestone_key,'date',ms.milestone_date,'title',ms.title,'category',ms.category,'icon',ms.icon,'time',ms.milestone_time,'description',ms.description,'note',ms.note,'photos',ms.photos,'auto',ms.auto,'createdAt',ms.created_at,'updatedAt',ms.updated_at)) order by ms.milestone_date,ms.created_at),'[]'::jsonb)
  into v_ms from public.milestones ms where ms.family_id=v_family_id and ms.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(ap.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',ap.legacy_id,'date',ap.appointment_date,'time',ap.appointment_time,'timeFrom',ap.appointment_time,'timeTo',ap.time_to,'typeId',ap.legacy_type_id,'typeName',ap.type_name,'title',ap.title,'place',ap.place,'doctor',ap.doctor,'person',ap.person,'cost',ap.cost_text,'status',ap.status,'note',ap.note,'createdAt',ap.created_at,'updatedAt',ap.updated_at)) order by ap.appointment_date,ap.appointment_time,ap.created_at),'[]'::jsonb)
  into v_appt from public.appointments ap where ap.family_id=v_family_id and ap.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(pr.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',pr.legacy_id,'date',pr.exam_date,'week',pr.week_text,'weight',pr.estimated_weight,'bpd',pr.bpd,'hc',pr.hc,'ac',pr.ac,'fl',pr.fl,'afi',pr.afi,'position',pr.position,'note',pr.note,'createdAt',pr.created_at,'updatedAt',pr.updated_at)) order by pr.exam_date,pr.created_at),'[]'::jsonb)
  into v_preg from public.pregnancy_records pr where pr.family_id=v_family_id and pr.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(am.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',coalesce(am.legacy_id,am.id::text),'name',am.name,'icon',am.icon,'role',am.role,'pin',am.pin,'status',am.status,'addedAt',am.added_at,'addedBy',am.added_by)) order by am.added_at,am.created_at),'[]'::jsonb)
  into v_app_members from public.app_members am where am.family_id=v_family_id and am.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(sl.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',sl.legacy_id,'date',sl.log_date,'startTime',sl.start_time,'endTime',sl.end_time,'startTs',sl.start_ts,'endTs',sl.end_ts,'durationSec',sl.duration_sec,'min',sl.min_value,'max',sl.max_value,'avg',sl.avg_value,'mode',sl.mode,'spark',sl.samples,'createdAt',sl.created_at,'updatedAt',sl.updated_at)) order by sl.log_date,sl.start_ts),'[]'::jsonb)
  into v_noise from public.sensor_logs sl where sl.family_id=v_family_id and sl.sensor_type='noise' and sl.deleted_at is null;
  select coalesce(jsonb_agg(coalesce(sl.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',sl.legacy_id,'date',sl.log_date,'startTime',sl.start_time,'endTime',sl.end_time,'startTs',sl.start_ts,'endTs',sl.end_ts,'durationSec',sl.duration_sec,'min',sl.min_value,'max',sl.max_value,'avg',sl.avg_value,'mode',sl.mode,'spark',sl.samples,'createdAt',sl.created_at,'updatedAt',sl.updated_at)) order by sl.log_date,sl.start_ts),'[]'::jsonb)
  into v_lux from public.sensor_logs sl where sl.family_id=v_family_id and sl.sensor_type='lux' and sl.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(al.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',al.legacy_id,'ts',al.occurred_at,'type',al.activity_type,'action',al.action,'summary',al.summary,'memberId',al.member_legacy_id,'memberName',al.member_name,'memberIcon',al.member_icon)) order by al.occurred_at),'[]'::jsonb)
  into v_activity from public.activity_logs al where al.family_id=v_family_id and al.deleted_at is null;

  select coalesce(jsonb_object_agg(mn.month_index::text,mn.note),'{}'::jsonb) into v_monthly from public.monthly_notes mn where mn.family_id=v_family_id and mn.deleted_at is null;

  select coalesce(jsonb_agg(coalesce(cc.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',cc.legacy_id,'name',cc.name,'icon',cc.icon,'color',cc.color,'desc',cc.description,'active',cc.active,'createdAt',cc.created_at,'updatedAt',cc.updated_at)) order by cc.sort_order,cc.created_at),'[]'::jsonb)
  into v_appt_types from public.care_categories cc where cc.family_id=v_family_id and cc.category_type='appointment_type' and cc.deleted_at is null;
  select coalesce(jsonb_agg(coalesce(cc.extra,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('id',cc.legacy_id,'name',cc.name,'icon',cc.icon,'color',cc.color,'desc',cc.description,'active',cc.active,'createdAt',cc.created_at,'updatedAt',cc.updated_at)) order by cc.sort_order,cc.created_at),'[]'::jsonb)
  into v_diary_types from public.care_categories cc where cc.family_id=v_family_id and cc.category_type='diary_type' and cc.deleted_at is null;

  v_payload := jsonb_build_object(
    'settings',v_settings,'hb',v_hb,'mom','[]'::jsonb,'baby','[]'::jsonb,'healthBook','[]'::jsonb,
    'careEvents',v_care,'milkInventory',v_milk,'milkContainers',v_cont,
    'diary',v_diary,'milestones',v_ms,'appointments',v_appt,'pregnancy',v_preg,
    'members',v_app_members,'noiseLogs',v_noise,'luxLogs',v_lux,'activityLog',v_activity,
    'monthlyNotes',v_monthly,'appointmentTypes',v_appt_types,'diaryTypes',v_diary_types,
    'familyInvites','[]'::jsonb,'permissions','{}'::jsonb,
    '_relationalOnly',true,'_relationalVersion','15.0.76','_relationalSyncId',v_sync_id,'_relationalLoadedAt',now()
  );

  return jsonb_build_object(
    'ok',true,'status','relational_only','version','15.0.76','source','relational_tables_only',
    'sync_id',v_sync_id,'family_id',v_family_id,'payload',v_payload,
    'counts',jsonb_build_object(
      'careEvents',jsonb_array_length(v_care),'milkInventory',jsonb_array_length(v_milk),'milkContainers',jsonb_array_length(v_cont),
      'hb_members',jsonb_array_length(v_members),'diary',jsonb_array_length(v_diary),'milestones',jsonb_array_length(v_ms),'appointments',jsonb_array_length(v_appt)
    )
  );
end;
$$;

-- Row-level direct apply. Each change maps to one business entity/table; no full database snapshot is written.
create or replace function public.myb_relational_apply_changes_v1576(
  p_sync_id text,
  p_device_key text,
  p_changes jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_device_id uuid := public.myb_stable_uuid('device:runtime:v1576:' || coalesce(nullif(p_sync_id,''),'main') || ':' || coalesce(nullif(p_device_key,''),'device'));
  v_child_id uuid;
  v_change jsonb;
  v_data jsonb;
  v_entity text;
  v_op text;
  v_sid text;
  v_id uuid;
  v_care_id uuid;
  v_feed_id uuid;
  v_pump_id uuid;
  v_milk_id uuid;
  v_container_id uuid;
  v_member_id uuid;
  v_old_milk uuid;
  v_old_milks uuid[] := ARRAY[]::uuid[];
  v_sub jsonb;
  v_i int;
  v_count int := 0;
  v_now timestamptz := now();
  v_kind text;
  v_rel text;
  v_name text;
  v_vaccine_name text;
  v_vaccine_id uuid;
  v_plan_id uuid;
  v_rec_id uuid;
begin
  if jsonb_typeof(coalesce(p_changes,'[]'::jsonb)) <> 'array' then
    return jsonb_build_object('ok',false,'status','invalid_changes','message','p_changes must be a JSON array');
  end if;

  insert into public.families(id,sync_code,name,legacy_sync_id,created_at,updated_at,deleted_at)
  values(v_family_id,v_sync_id,'Mẹ Yêu Bé',v_sync_id,v_now,v_now,null)
  on conflict(id) do update set updated_at=v_now,deleted_at=null;
  insert into public.devices(id,family_id,device_name,device_type,platform,app_version,last_seen_at,created_at,updated_at,deleted_at)
  values(v_device_id,v_family_id,coalesce(nullif(p_device_key,''),'Web device'),'browser','web','15.0.76',v_now,v_now,v_now,null)
  on conflict(id) do update set last_seen_at=v_now,updated_at=v_now,deleted_at=null;

  select id into v_child_id from public.health_members where family_id=v_family_id and relation='Con' and deleted_at is null order by created_at limit 1;

  perform pg_advisory_xact_lock(hashtextextended('myb-v1576:' || v_family_id::text,0));

  for v_change in select value from jsonb_array_elements(coalesce(p_changes,'[]'::jsonb)) loop
    v_entity := lower(coalesce(v_change->>'entity',''));
    v_op := lower(coalesce(v_change->>'op','upsert'));
    v_data := coalesce(v_change->'data','{}'::jsonb);
    v_sid := coalesce(nullif(v_change->>'source_id',''),nullif(v_data->>'id',''),nullif(v_data->>'createdAt',''));
    if v_entity='' or v_sid is null and v_entity not in ('settings','monthly_notes') then continue; end if;

    -- SETTINGS --------------------------------------------------------------
    if v_entity='settings' then
      insert into public.app_settings(id,family_id,baby_nickname,baby_official_name,baby_sex,birth_date,birth_time,birth_hospital,theme_mode,dashboard_config,cloud_config,smart_alert_config,lmp,avatar_data_url,show_official_name,extra,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
      values(public.myb_stable_uuid('app_settings:'||v_sync_id),v_family_id,nullif(v_data->>'babyName',''),nullif(v_data->>'officialName',''),nullif(v_data->>'babySex',''),public.myb_safe_date(v_data->>'birthDate'),nullif(coalesce(v_data->>'birthTime',v_data->>'birthTimeFrom'),''),nullif(v_data->>'birthHospital',''),nullif(coalesce(v_data->>'themeMode',v_data->>'theme'),''),'{}'::jsonb,jsonb_build_object('relational_only',true,'sync_id',v_sync_id,'cutover_version','15.0.76'),'{}'::jsonb,public.myb_safe_date(v_data->>'lmp'),nullif(v_data->>'avatarDataUrl',''),public.myb_bool(v_data->>'showOfficialName',false),v_data,v_now,v_now,v_device_id,v_device_id,null)
      on conflict(family_id) do update set baby_nickname=excluded.baby_nickname,baby_official_name=excluded.baby_official_name,baby_sex=excluded.baby_sex,birth_date=excluded.birth_date,birth_time=excluded.birth_time,birth_hospital=excluded.birth_hospital,theme_mode=excluded.theme_mode,lmp=excluded.lmp,avatar_data_url=excluded.avatar_data_url,show_official_name=excluded.show_official_name,extra=excluded.extra,updated_at=v_now,updated_by_device=v_device_id,deleted_at=null;
      v_count := v_count+1;

    -- HEALTH MEMBER ---------------------------------------------------------
    elsif v_entity='health_member' then
      v_member_id := public.myb_stable_uuid('health_member:'||v_sync_id||':hb:'||v_sid);
      if v_op='delete' then
        update public.health_members set deleted_at=v_now,updated_at=v_now where id=v_member_id and family_id=v_family_id;
      else
        v_rel := public.myb_relation_norm(coalesce(v_data->>'rel',v_data->>'person'));
        v_name := nullif(coalesce(v_data->>'name',v_data->>'displayName',v_data->>'fullName'),'');
        insert into public.health_members(id,family_id,legacy_id,relation,display_name,full_name,gender,dob,blood_type,height_text,weight_text,phone,email,bhyt,bhyt_exp,bhyt_place,bhxh,hospital,doctor,emergency_contact,status_text,status_tone,notes,extra,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
        values(v_member_id,v_family_id,v_sid,v_rel,v_name,v_name,nullif(v_data->>'gender',''),public.myb_safe_date(v_data->>'dob'),nullif(v_data->>'blood',''),nullif(v_data->>'height',''),nullif(v_data->>'weight',''),nullif(v_data->>'phone',''),nullif(v_data->>'email',''),nullif(v_data#>>'{medical,bhyt}',''),public.myb_safe_date(v_data#>>'{medical,bhytExp}'),nullif(v_data#>>'{medical,bhytPlace}',''),nullif(v_data#>>'{medical,bhxh}',''),nullif(v_data#>>'{medical,hospital}',''),nullif(v_data#>>'{medical,doctor}',''),nullif(v_data#>>'{medical,emergency}',''),nullif(v_data#>>'{status,txt}',''),nullif(v_data#>>'{status,tone}',''),nullif(v_data#>>'{other,notes}',''),v_data - 'meas' - 'vaccines' - 'visits' - 'meds' - 'labs',coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null)
        on conflict(id) do update set legacy_id=v_sid,relation=excluded.relation,display_name=excluded.display_name,full_name=excluded.full_name,gender=excluded.gender,dob=excluded.dob,blood_type=excluded.blood_type,height_text=excluded.height_text,weight_text=excluded.weight_text,phone=excluded.phone,email=excluded.email,bhyt=excluded.bhyt,bhyt_exp=excluded.bhyt_exp,bhyt_place=excluded.bhyt_place,bhxh=excluded.bhxh,hospital=excluded.hospital,doctor=excluded.doctor,emergency_contact=excluded.emergency_contact,status_text=excluded.status_text,status_tone=excluded.status_tone,notes=excluded.notes,extra=excluded.extra,updated_at=v_now,updated_by_device=v_device_id,deleted_at=null;
        if v_rel='Con' then v_child_id:=v_member_id; end if;

        delete from public.health_measurements where member_id=v_member_id;
        v_i:=0;
        for v_sub in select value from jsonb_array_elements(public.myb_json_array(v_data->'meas')) loop
          v_i:=v_i+1;
          v_id:=public.myb_stable_uuid('measurement:'||v_member_id::text||':'||coalesce(nullif(v_sub->>'id',''),nullif(v_sub->>'createdAt',''),nullif(v_sub->>'date',''),v_i::text));
          insert into public.health_measurements(id,family_id,member_id,legacy_id,measure_date,weight_g,height_cm,head_cm,note,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
          values(v_id,v_family_id,v_member_id,coalesce(nullif(v_sub->>'id',''),nullif(v_sub->>'createdAt',''),nullif(v_sub->>'date',''),v_i::text),coalesce(public.myb_safe_date(v_sub->>'date'),current_date),public.myb_weight_g(v_sub->>'weight'),public.myb_num(v_sub->>'height'),public.myb_num(v_sub->>'head'),nullif(v_sub->>'note',''),coalesce(public.myb_safe_timestamptz(v_sub->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null);
        end loop;

        delete from public.vaccine_records where member_id=v_member_id;
        delete from public.child_vaccine_plans where member_id=v_member_id;
        v_i:=0;
        for v_sub in select value from jsonb_array_elements(public.myb_json_array(v_data->'vaccines')) loop
          v_i:=v_i+1; v_vaccine_name:=nullif(coalesce(v_sub->>'name',v_sub->>'vaccine'),'');
          if v_vaccine_name is not null then
            v_vaccine_id:=public.myb_stable_uuid('vaccine_catalog:'||v_family_id::text||':'||lower(v_vaccine_name));
            insert into public.vaccine_catalog(id,family_id,name,short_name,disease,manufacturer,is_required,is_service,active,created_at,updated_at,deleted_at)
            values(v_vaccine_id,v_family_id,v_vaccine_name,v_vaccine_name,nullif(coalesce(v_sub->>'disease',v_sub->>'purpose'),''),nullif(v_sub->>'manufacturer',''),public.myb_bool(v_sub->>'required',false),lower(coalesce(v_sub->>'source',''))='dịch vụ',true,v_now,v_now,null)
            on conflict(id) do update set name=excluded.name,disease=excluded.disease,manufacturer=excluded.manufacturer,is_required=excluded.is_required,is_service=excluded.is_service,updated_at=v_now,deleted_at=null;
            v_plan_id:=public.myb_stable_uuid('vaccine_plan:'||v_member_id::text||':'||coalesce(nullif(v_sub->>'planId',''),nullif(v_sub->>'scheduleKey',''),nullif(v_sub->>'templateId',''),v_vaccine_name||':'||coalesce(v_sub->>'dose','')||':'||v_i::text));
            insert into public.child_vaccine_plans(id,family_id,member_id,vaccine_id,dose_number,due_date,status,note,legacy_id,schedule_key,template_key,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
            values(v_plan_id,v_family_id,v_member_id,v_vaccine_id,public.myb_num(regexp_replace(coalesce(v_sub->>'dose',''),'[^0-9]+','','g'))::int,public.myb_safe_date(coalesce(v_sub->>'dueDate',v_sub->>'date')),case coalesce(v_sub->>'status','') when 'Đã tiêm' then 'done' when 'Sắp tới' then 'upcoming' when 'Quá hạn' then 'overdue' when 'Bỏ qua' then 'skipped' when 'Hoãn tiêm' then 'postponed' else 'pending' end,nullif(coalesce(v_sub->>'note',v_sub->>'disease',v_sub->>'purpose'),''),coalesce(v_sub->>'planId',v_sub->>'scheduleKey',v_sub->>'templateId'),nullif(v_sub->>'scheduleKey',''),nullif(v_sub->>'templateId',''),coalesce(public.myb_safe_timestamptz(v_sub->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null);
            v_rec_id:=public.myb_stable_uuid('vaccine_record:'||v_member_id::text||':'||coalesce(nullif(v_sub->>'id',''),nullif(v_sub->>'createdAt',''),v_vaccine_name||':'||coalesce(v_sub->>'date','')||':'||v_i::text));
            insert into public.vaccine_records(id,family_id,member_id,plan_id,vaccine_id,vaccine_name,dose_number,injection_date,injection_time,place,manufacturer,lot_number,reaction,reaction_level,note,legacy_id,extra,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
            values(v_rec_id,v_family_id,v_member_id,v_plan_id,v_vaccine_id,v_vaccine_name,public.myb_num(regexp_replace(coalesce(v_sub->>'dose',''),'[^0-9]+','','g'))::int,public.myb_safe_date(coalesce(v_sub->>'date',v_sub->>'injectionDate')),nullif(v_sub->>'time',''),nullif(v_sub->>'place',''),nullif(v_sub->>'manufacturer',''),nullif(v_sub->>'lotNumber',''),nullif(v_sub->>'reaction',''),nullif(v_sub->>'reactionLevel',''),nullif(v_sub->>'note',''),coalesce(nullif(v_sub->>'id',''),v_rec_id::text),v_sub,coalesce(public.myb_safe_timestamptz(v_sub->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null);
          end if;
        end loop;
      end if;
      v_count:=v_count+1;

    -- MILK CONTAINER --------------------------------------------------------
    elsif v_entity='milk_container' then
      v_id:=public.myb_stable_uuid('milk_container:'||v_sync_id||':'||v_sid);
      if v_op='delete' then
        update public.milk_containers set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        v_kind:=public.myb_norm_milk_container_kind(v_data->>'kind',v_data->>'name');
        insert into public.milk_containers(id,family_id,legacy_id,name,kind,color,capacity_ml,active,sort_order,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_sid,coalesce(nullif(v_data->>'name',''),'Bình/Túi'),v_kind,nullif(v_data->>'color',''),public.myb_num(coalesce(v_data->>'capacityMl',v_data->>'capacity')),public.myb_bool(v_data->>'active',true),coalesce(public.myb_num(v_data->>'sortOrder')::int,0),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set legacy_id=v_sid,name=excluded.name,kind=excluded.kind,color=excluded.color,capacity_ml=excluded.capacity_ml,active=excluded.active,sort_order=excluded.sort_order,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if;
      v_count:=v_count+1;

    -- MILK ITEM -------------------------------------------------------------
    elsif v_entity='milk_item' then
      v_milk_id:=public.myb_stable_uuid('milk_item:'||v_sync_id||':'||v_sid);
      if v_op='delete' then
        update public.milk_items set deleted_at=v_now,updated_at=v_now where id=v_milk_id and family_id=v_family_id;
      else
        select id into v_container_id from public.milk_containers where family_id=v_family_id and legacy_id=nullif(v_data->>'containerId','') and deleted_at is null limit 1;
        v_pump_id:=null;
        if nullif(v_data->>'pumpEventId','') is not null then
          select pe.id into v_pump_id from public.care_events ce join public.pump_events pe on pe.care_event_id=ce.id and pe.deleted_at is null where ce.family_id=v_family_id and ce.legacy_id=v_data->>'pumpEventId' and ce.deleted_at is null limit 1;
        end if;
        v_kind:=case
          when nullif(trim(coalesce(v_data->>'containerKind','')),'') is not null
            then public.myb_norm_milk_container_kind(v_data->>'containerKind',null)
          when v_container_id is not null
            then (select mc.kind from public.milk_containers mc where mc.id=v_container_id and mc.deleted_at is null limit 1)
          else null
        end;
        insert into public.milk_items(id,family_id,pump_event_id,short_code,container_id,container_kind,container_name,storage,amount_ml,remaining_ml,expire_at,status,legacy_status,note,legacy_id,extra,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
        values(v_milk_id,v_family_id,v_pump_id,nullif(coalesce(v_data->>'shortId',v_data->>'shortCode',v_data->>'id'),''),v_container_id,v_kind,nullif(v_data->>'containerName',''),nullif(v_data->>'storage',''),coalesce(public.myb_num(coalesce(v_data->>'amount',v_data->>'amountMl')),0),coalesce(public.myb_num(coalesce(v_data->>'remaining',v_data->>'remainingMl')),0),public.myb_v1576_local_timestamptz(coalesce(v_data->>'expireDateTime',v_data->>'expireAt',v_data->>'expireDate')),case when lower(trim(coalesce(v_data->>'status',''))) in ('đã quá hạn','quá hạn','expired') then 'expired' else coalesce(public.myb_status_en(v_data->>'status'),'storing') end,nullif(v_data->>'status',''),nullif(v_data->>'note',''),v_sid,v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null)
        on conflict(id) do update set pump_event_id=excluded.pump_event_id,short_code=excluded.short_code,container_id=excluded.container_id,container_kind=excluded.container_kind,container_name=excluded.container_name,storage=excluded.storage,amount_ml=excluded.amount_ml,remaining_ml=excluded.remaining_ml,expire_at=excluded.expire_at,status=excluded.status,legacy_status=excluded.legacy_status,note=excluded.note,legacy_id=v_sid,extra=excluded.extra,updated_at=v_now,updated_by_device=v_device_id,deleted_at=null;
        if not exists(select 1 from public.milk_transactions where id=public.myb_stable_uuid('milk_tx:create:'||v_milk_id::text)) then
          insert into public.milk_transactions(id,family_id,milk_item_id,transaction_type,ml,reason,created_at,created_by_device,deleted_at)
          values(public.myb_stable_uuid('milk_tx:create:'||v_milk_id::text),v_family_id,v_milk_id,'create',coalesce(public.myb_num(coalesce(v_data->>'amount',v_data->>'amountMl')),0),'V15.0.76 runtime milk item create',coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_device_id,null);
        end if;
        perform public.myb_v1576_reconcile_milk_balance(v_family_id,v_milk_id,v_device_id);
      end if;
      v_count:=v_count+1;

    -- CARE EVENT ------------------------------------------------------------
    elsif v_entity='care_event' then
      v_care_id:=public.myb_stable_uuid('care_event:'||v_sync_id||':'||v_sid);
      -- remember affected old milk items before removing old feed links/tx.
      -- Reconcile them again after the old feed transactions are removed, otherwise
      -- an edited/deleted feed could leave the milk ledger stale.
      select coalesce(array_agg(distinct milk_item_id), ARRAY[]::uuid[])
        into v_old_milks
      from public.milk_transactions
      where family_id=v_family_id and care_event_id=v_care_id and deleted_at is null;
      delete from public.feed_milk_sources where feed_event_id in (select id from public.feed_events where care_event_id=v_care_id);
      delete from public.milk_transactions where family_id=v_family_id and care_event_id=v_care_id;
      foreach v_old_milk in array v_old_milks loop
        perform public.myb_v1576_reconcile_milk_balance(v_family_id,v_old_milk,v_device_id);
      end loop;
      delete from public.feed_events where care_event_id=v_care_id;
      delete from public.pump_events where care_event_id=v_care_id;
      delete from public.sleep_events where care_event_id=v_care_id;
      delete from public.diaper_events where care_event_id=v_care_id;
      delete from public.temperature_events where care_event_id=v_care_id;
      if v_op='delete' then
        update public.care_events set deleted_at=v_now,updated_at=v_now where id=v_care_id and family_id=v_family_id;
      else
        insert into public.care_events(id,family_id,member_id,legacy_id,type,event_date,time_from,time_to,amount,unit,source,status,note,extra,created_at,updated_at,created_by_device,updated_by_device,deleted_at)
        values(v_care_id,v_family_id,v_child_id,v_sid,coalesce(nullif(v_data->>'type',''),'other'),public.myb_safe_date(coalesce(v_data->>'date',v_data->>'startDate')),nullif(coalesce(v_data->>'timeFrom',v_data->>'startTime',v_data->>'time'),''),nullif(coalesce(v_data->>'timeTo',v_data->>'endTime'),''),public.myb_num(coalesce(v_data->>'amount',v_data->>'ml',v_data->>'actualMl')),nullif(v_data->>'unit',''),nullif(v_data->>'source',''),coalesce(nullif(v_data->>'status',''),'active'),nullif(v_data->>'note',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,v_device_id,v_device_id,null)
        on conflict(id) do update set member_id=v_child_id,legacy_id=v_sid,type=excluded.type,event_date=excluded.event_date,time_from=excluded.time_from,time_to=excluded.time_to,amount=excluded.amount,unit=excluded.unit,source=excluded.source,status=excluded.status,note=excluded.note,extra=excluded.extra,updated_at=v_now,updated_by_device=v_device_id,deleted_at=null;

        if lower(coalesce(v_data->>'type',''))='feed' then
          v_feed_id:=public.myb_stable_uuid('feed_event:'||v_care_id::text);
          insert into public.feed_events(id,family_id,care_event_id,feed_type,milk_type,actual_ml,taken_ml,wasted_ml,formula_brand,count_as_feed,created_at,updated_at,deleted_at)
          values(v_feed_id,v_family_id,v_care_id,nullif(coalesce(v_data->>'feedType',v_data->>'source'),''),nullif(v_data->>'milkType',''),public.myb_num(coalesce(v_data->>'actualMl',v_data->>'amount')),coalesce(public.myb_num(v_data#>>'{extra,takenMl}'),public.myb_num(v_data->>'takenMl'),public.myb_num(v_data->>'amount')),coalesce(public.myb_num(v_data->>'wasteMl'),public.myb_num(v_data->>'wastedMl'),public.myb_num(v_data#>>'{extra,discardedMl}')),nullif(v_data#>>'{extra,formulaBrand}',''),public.myb_bool(v_data#>>'{extra,countAsFeed}',true),coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null);
          v_i:=0;
          for v_sub in select value from jsonb_array_elements(public.myb_json_array(coalesce(v_data->'milkSources',v_data#>'{extra,milkSources}'))) loop
            v_i:=v_i+1;
            if nullif(coalesce(v_sub->>'bagId',v_sub->>'id',v_sub->>'milkItemId'),'') is not null then
              select id into v_milk_id from public.milk_items where family_id=v_family_id and legacy_id=coalesce(v_sub->>'bagId',v_sub->>'id',v_sub->>'milkItemId') and deleted_at is null limit 1;
              if v_milk_id is not null then
                insert into public.feed_milk_sources(id,family_id,feed_event_id,milk_item_id,used_ml,discard_ml,remainder_action,order_index,created_at,updated_at,deleted_at)
                values(public.myb_stable_uuid('feed_source:'||v_feed_id::text||':'||v_milk_id::text||':'||v_i::text),v_family_id,v_feed_id,v_milk_id,coalesce(public.myb_num(coalesce(v_sub->>'usedMl',v_sub->>'used')),0),coalesce(public.myb_num(coalesce(v_sub->>'discardMl',v_sub->>'discardedMl')),0),coalesce(nullif(v_sub->>'remainderAction',''),'keep'),v_i,v_now,v_now,null);
                if coalesce(public.myb_num(coalesce(v_sub->>'usedMl',v_sub->>'used')),0)>0 then
                  insert into public.milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,reason,created_at,created_by_device,deleted_at)
                  values(public.myb_stable_uuid('milk_tx:feed_use:'||v_feed_id::text||':'||v_milk_id::text||':'||v_i::text),v_family_id,v_milk_id,v_care_id,'feed_use',coalesce(public.myb_num(coalesce(v_sub->>'usedMl',v_sub->>'used')),0),'V15.0.76 direct feed source use',v_now,v_device_id,null);
                end if;
                if coalesce(public.myb_num(coalesce(v_sub->>'discardMl',v_sub->>'discardedMl')),0)>0 then
                  insert into public.milk_transactions(id,family_id,milk_item_id,care_event_id,transaction_type,ml,reason,created_at,created_by_device,deleted_at)
                  values(public.myb_stable_uuid('milk_tx:discard:'||v_feed_id::text||':'||v_milk_id::text||':'||v_i::text),v_family_id,v_milk_id,v_care_id,'discard',coalesce(public.myb_num(coalesce(v_sub->>'discardMl',v_sub->>'discardedMl')),0),'V15.0.76 direct feed source discard',v_now,v_device_id,null);
                end if;
                perform public.myb_v1576_reconcile_milk_balance(v_family_id,v_milk_id,v_device_id);
              end if;
            end if;
          end loop;
        elsif lower(coalesce(v_data->>'type',''))='pump' then
          v_pump_id:=public.myb_stable_uuid('pump_event:'||v_care_id::text);
          select id into v_container_id from public.milk_containers where family_id=v_family_id and legacy_id=nullif(v_data#>>'{extra,containerId}','') and deleted_at is null limit 1;
          insert into public.pump_events(id,family_id,care_event_id,side,amount_ml,duration_min,storage,container_id,container_kind,container_name,expire_at,created_at,updated_at,deleted_at)
          values(v_pump_id,v_family_id,v_care_id,nullif(v_data#>>'{extra,side}',''),public.myb_num(v_data->>'amount'),public.myb_num(v_data#>>'{extra,durationMin}')::int,nullif(v_data->>'storage',''),v_container_id,
            case
              when nullif(trim(coalesce(v_data#>>'{extra,containerKind}','')),'') is not null
                then public.myb_norm_milk_container_kind(v_data#>>'{extra,containerKind}',null)
              when v_container_id is not null
                then (select mc.kind from public.milk_containers mc where mc.id=v_container_id and mc.deleted_at is null limit 1)
              else null
            end,
            nullif(v_data#>>'{extra,containerName}',''),public.myb_v1576_local_timestamptz(coalesce(v_data#>>'{extra,expireDate}',v_data->>'expireDate')),coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null);
        elsif lower(coalesce(v_data->>'type',''))='sleep' then
          insert into public.sleep_events(id,family_id,care_event_id,duration_min,quality,created_at,updated_at,deleted_at)
          values(public.myb_stable_uuid('sleep_event:'||v_care_id::text),v_family_id,v_care_id,coalesce(public.myb_num(v_data->>'durationMin')::int,public.myb_num(v_data->>'amount')::int),nullif(v_data#>>'{extra,quality}',''),coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null);
        elsif lower(coalesce(v_data->>'type',''))='diaper' then
          insert into public.diaper_events(id,family_id,care_event_id,wet,dirty,stool_color,stool_amount,note,created_at,updated_at,deleted_at)
          values(public.myb_stable_uuid('diaper_event:'||v_care_id::text),v_family_id,v_care_id,coalesce(public.myb_num(v_data#>>'{extra,pee}'),0)>0,coalesce(public.myb_num(v_data#>>'{extra,poop}'),0)>0,nullif(coalesce(v_data#>>'{extra,stoolColor}',v_data#>>'{extra,color}'),''),nullif(v_data#>>'{extra,stoolAmount}',''),nullif(v_data->>'note',''),coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null);
        elsif lower(coalesce(v_data->>'type','')) in ('temperature','temp','fever') then
          insert into public.temperature_events(id,family_id,care_event_id,temperature_c,measure_place,note,created_at,updated_at,deleted_at)
          values(public.myb_stable_uuid('temperature_event:'||v_care_id::text),v_family_id,v_care_id,public.myb_num(coalesce(v_data->>'amount',v_data->>'temperature',v_data->>'temperatureC')),nullif(coalesce(v_data#>>'{extra,site}',v_data#>>'{extra,measurePlace}'),''),nullif(v_data->>'note',''),coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null);
        end if;
      end if;
      v_count:=v_count+1;

    -- APPOINTMENT -----------------------------------------------------------
    elsif v_entity='appointment' then
      v_id:=public.myb_stable_uuid('appointment:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.appointments set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.appointments(id,family_id,member_id,title,appointment_date,appointment_time,time_to,place,doctor,note,status,legacy_id,legacy_type_id,type_name,person,cost_text,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,case when lower(coalesce(v_data->>'person','')) in ('con','bé','baby','child') then v_child_id else null end,nullif(v_data->>'title',''),public.myb_safe_date(v_data->>'date'),nullif(coalesce(v_data->>'timeFrom',v_data->>'time'),''),nullif(v_data->>'timeTo',''),nullif(v_data->>'place',''),nullif(v_data->>'doctor',''),nullif(v_data->>'note',''),coalesce(nullif(v_data->>'status',''),'Sắp tới'),v_sid,nullif(v_data->>'typeId',''),nullif(v_data->>'typeName',''),nullif(v_data->>'person',''),nullif(v_data->>'cost',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set title=excluded.title,appointment_date=excluded.appointment_date,appointment_time=excluded.appointment_time,time_to=excluded.time_to,place=excluded.place,doctor=excluded.doctor,note=excluded.note,status=excluded.status,legacy_id=v_sid,legacy_type_id=excluded.legacy_type_id,type_name=excluded.type_name,person=excluded.person,cost_text=excluded.cost_text,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- DIARY -----------------------------------------------------------------
    elsif v_entity='diary_entry' then
      v_id:=public.myb_stable_uuid('diary:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.diary_entries set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.diary_entries(id,family_id,member_id,legacy_id,entry_date,time_from,time_to,category,title,note,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_child_id,v_sid,public.myb_safe_date(v_data->>'date'),nullif(coalesce(v_data->>'timeFrom',v_data->>'time'),''),nullif(v_data->>'timeTo',''),nullif(v_data->>'category',''),nullif(v_data->>'title',''),nullif(v_data->>'note',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set entry_date=excluded.entry_date,time_from=excluded.time_from,time_to=excluded.time_to,category=excluded.category,title=excluded.title,note=excluded.note,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- MILESTONE -------------------------------------------------------------
    elsif v_entity='milestone' then
      v_id:=public.myb_stable_uuid('milestone:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.milestones set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.milestones(id,family_id,member_id,legacy_id,milestone_key,milestone_date,title,type,category,icon,milestone_time,description,note,photos,auto,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_child_id,v_sid,nullif(v_data->>'key',''),public.myb_safe_date(v_data->>'date'),nullif(v_data->>'title',''),nullif(coalesce(v_data->>'type',v_data->>'category'),''),nullif(v_data->>'category',''),nullif(v_data->>'icon',''),nullif(v_data->>'time',''),nullif(v_data->>'description',''),nullif(v_data->>'note',''),public.myb_json_array(v_data->'photos'),public.myb_bool(v_data->>'auto',false),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set milestone_key=excluded.milestone_key,milestone_date=excluded.milestone_date,title=excluded.title,type=excluded.type,category=excluded.category,icon=excluded.icon,milestone_time=excluded.milestone_time,description=excluded.description,note=excluded.note,photos=excluded.photos,auto=excluded.auto,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- PREGNANCY -------------------------------------------------------------
    elsif v_entity='pregnancy' then
      v_id:=public.myb_stable_uuid('pregnancy:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.pregnancy_records set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.pregnancy_records(id,family_id,legacy_id,exam_date,week_text,estimated_weight,bpd,hc,ac,fl,afi,position,note,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_sid,public.myb_safe_date(v_data->>'date'),nullif(v_data->>'week',''),nullif(v_data->>'weight',''),nullif(v_data->>'bpd',''),nullif(v_data->>'hc',''),nullif(v_data->>'ac',''),nullif(v_data->>'fl',''),nullif(v_data->>'afi',''),nullif(v_data->>'position',''),nullif(v_data->>'note',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set exam_date=excluded.exam_date,week_text=excluded.week_text,estimated_weight=excluded.estimated_weight,bpd=excluded.bpd,hc=excluded.hc,ac=excluded.ac,fl=excluded.fl,afi=excluded.afi,position=excluded.position,note=excluded.note,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- APP MEMBER ------------------------------------------------------------
    elsif v_entity='app_member' then
      v_id:=public.myb_stable_uuid('app_member:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.app_members set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.app_members(id,family_id,legacy_id,name,icon,role,pin,status,added_at,added_by,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_sid,nullif(v_data->>'name',''),nullif(v_data->>'icon',''),nullif(v_data->>'role',''),coalesce(v_data->>'pin',''),nullif(v_data->>'status',''),public.myb_safe_timestamptz(v_data->>'addedAt'),nullif(v_data->>'addedBy',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'addedAt'),v_now),v_now,null)
        on conflict(id) do update set name=excluded.name,icon=excluded.icon,role=excluded.role,pin=excluded.pin,status=excluded.status,added_at=excluded.added_at,added_by=excluded.added_by,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- SENSOR ----------------------------------------------------------------
    elsif v_entity in ('noise_log','lux_log') then
      v_kind:=case when v_entity='noise_log' then 'noise' else 'lux' end;
      v_id:=public.myb_stable_uuid('sensor:'||v_kind||':'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.sensor_logs set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.sensor_logs(id,family_id,legacy_id,sensor_type,log_date,start_time,end_time,start_ts,end_ts,duration_sec,min_value,max_value,avg_value,mode,samples,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_sid,v_kind,public.myb_safe_date(v_data->>'date'),nullif(v_data->>'startTime',''),nullif(v_data->>'endTime',''),public.myb_num(v_data->>'startTs')::bigint,public.myb_num(v_data->>'endTs')::bigint,public.myb_num(v_data->>'durationSec')::int,public.myb_num(v_data->>'min'),public.myb_num(v_data->>'max'),public.myb_num(v_data->>'avg'),nullif(v_data->>'mode',''),public.myb_json_array(v_data->'spark'),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set log_date=excluded.log_date,start_time=excluded.start_time,end_time=excluded.end_time,start_ts=excluded.start_ts,end_ts=excluded.end_ts,duration_sec=excluded.duration_sec,min_value=excluded.min_value,max_value=excluded.max_value,avg_value=excluded.avg_value,mode=excluded.mode,samples=excluded.samples,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- ACTIVITY --------------------------------------------------------------
    elsif v_entity='activity_log' then
      v_id:=public.myb_stable_uuid('activity:'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.activity_logs set deleted_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.activity_logs(id,family_id,legacy_id,occurred_at,activity_type,action,summary,member_legacy_id,member_name,member_icon,extra,created_at,deleted_at)
        values(v_id,v_family_id,v_sid,public.myb_safe_timestamptz(v_data->>'ts'),nullif(v_data->>'type',''),nullif(v_data->>'action',''),nullif(v_data->>'summary',''),nullif(v_data->>'memberId',''),nullif(v_data->>'memberName',''),nullif(v_data->>'memberIcon',''),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'ts'),v_now),null)
        on conflict(id) do update set occurred_at=excluded.occurred_at,activity_type=excluded.activity_type,action=excluded.action,summary=excluded.summary,member_legacy_id=excluded.member_legacy_id,member_name=excluded.member_name,member_icon=excluded.member_icon,extra=excluded.extra,deleted_at=null;
      end if; v_count:=v_count+1;

    -- CATEGORY --------------------------------------------------------------
    elsif v_entity in ('appointment_type','diary_type') then
      v_id:=public.myb_stable_uuid('category:'||v_entity||':'||v_sync_id||':'||v_sid);
      if v_op='delete' then update public.care_categories set deleted_at=v_now,updated_at=v_now where id=v_id and family_id=v_family_id;
      else
        insert into public.care_categories(id,family_id,legacy_id,category_type,name,icon,color,description,active,sort_order,extra,created_at,updated_at,deleted_at)
        values(v_id,v_family_id,v_sid,v_entity,nullif(v_data->>'name',''),nullif(v_data->>'icon',''),nullif(v_data->>'color',''),nullif(v_data->>'desc',''),public.myb_bool(v_data->>'active',true),coalesce(public.myb_num(v_data->>'sortOrder')::int,0),v_data,coalesce(public.myb_safe_timestamptz(v_data->>'createdAt'),v_now),v_now,null)
        on conflict(id) do update set name=excluded.name,icon=excluded.icon,color=excluded.color,description=excluded.description,active=excluded.active,sort_order=excluded.sort_order,extra=excluded.extra,updated_at=v_now,deleted_at=null;
      end if; v_count:=v_count+1;

    -- MONTHLY NOTES (single object replace) --------------------------------
    elsif v_entity='monthly_notes' then
      delete from public.monthly_notes where family_id=v_family_id;
      for v_sid,v_sub in select key,value from jsonb_each(coalesce(v_data,'{}'::jsonb)) loop
        if v_sid ~ '^[0-9]+$' then
          insert into public.monthly_notes(id,family_id,month_index,note,updated_at,deleted_at)
          values(public.myb_stable_uuid('month_note:'||v_sync_id||':'||v_sid),v_family_id,v_sid::int,v_sub#>>'{}',v_now,null)
          on conflict(family_id,month_index) do update set note=excluded.note,updated_at=v_now,deleted_at=null;
        end if;
      end loop; v_count:=v_count+1;
    end if;
  end loop;

  return jsonb_build_object('ok',true,'status','applied','version','15.0.76','source','direct_relational_tables','sync_id',v_sync_id,'family_id',v_family_id,'applied_changes',v_count,'at',v_now);
exception when others then
  raise;
end;
$$;

grant execute on function public.myb_v1576_local_timestamptz(text) to anon,authenticated;
grant execute on function public.myb_v1576_reconcile_milk_balance(uuid,uuid,uuid) to anon,authenticated;
grant execute on function public.myb_relational_export_state_v1576(text) to anon,authenticated;
grant execute on function public.myb_relational_apply_changes_v1576(text,text,jsonb) to anon,authenticated;

comment on function public.myb_relational_export_state_v1576(text) is 'V15.0.76 exports UI state from relational tables only; it never reads meyeube_sync.';
comment on function public.myb_relational_apply_changes_v1576(text,text,jsonb) is 'V15.0.76 applies row-level deltas directly to relational tables. p_changes is transport only, not a JSON database snapshot.';

commit;
