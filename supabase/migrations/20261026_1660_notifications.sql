-- V16.6.0: scoped source, leased deliveries, server heartbeat. ASCII / no BOM.
begin;
create table if not exists public.myb_notification_runtime_v1660(
 id boolean primary key default true check(id),token uuid,lease_until timestamptz,
 cursor_sync text not null default '',started_at timestamptz,completed_at timestamptz,
 last_request_at timestamptz,last_request_id bigint,last_error text,summary jsonb not null default '{}');
insert into public.myb_notification_runtime_v1660(id) values(true) on conflict do nothing;
create table if not exists public.myb_notification_checks_v1660(
 family_id uuid primary key references public.families(id) on delete cascade,
 checked_at timestamptz not null default now(),summary jsonb not null default '{}');
create table if not exists public.myb_notification_deliveries_v1660(
 subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
 event_key text not null,state text not null default 'pending',attempts int not null default 0,
 token uuid,lease_until timestamptz,next_attempt_at timestamptz not null default now(),
 expires_at timestamptz not null,sent_at timestamptz,status_code int,
 updated_at timestamptz not null default now(),primary key(subscription_id,event_key),
 check(state in ('pending','sending','sent','failed','expired')));
create index if not exists myb_notification_retry_v1660 on public.myb_notification_deliveries_v1660(next_attempt_at) where state in ('pending','sending');
alter table public.myb_notification_runtime_v1660 enable row level security;
alter table public.myb_notification_checks_v1660 enable row level security;
alter table public.myb_notification_deliveries_v1660 enable row level security;
revoke all on public.myb_notification_runtime_v1660,public.myb_notification_checks_v1660,public.myb_notification_deliveries_v1660 from public,anon,authenticated;

create or replace function public.myb_notification_source_v1660(p_sync_id text) returns jsonb
language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('ok',true,'settings',jsonb_build_object('dashboardConfig',coalesce(myb_settings_doc_v1570(f.id)->'dashboardConfig','{}')),
 'careEvents',coalesce((select jsonb_agg(doc) from (
 select distinct on (case when ce.type in ('temp','fever') then 'temperature' else ce.type end)
 public.myb_care_doc_v1540(ce) doc from public.care_events ce
 where ce.family_id=f.id and ce.deleted_at is null and ce.type in ('feed','sleep','temperature','temp','fever')
 and coalesce(ce.status,'') not in ('cancelled','canceled',U&'\0110\00E3 h\1EE7y',U&'\0110\00E3 hu\1EF7')
 and (ce.event_date+(case when ce.time_from ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then ce.time_from else '00:00' end)::time
 -make_interval(mins=>case when myb_settings_doc_v1570(f.id)#>>'{dashboardConfig,smartAlerts,timezoneOffsetMinutes}' ~ '^-?[0-9]{1,3}$' then greatest(-840,least(840,(myb_settings_doc_v1570(f.id)#>>'{dashboardConfig,smartAlerts,timezoneOffsetMinutes}')::int)) else 420 end))<=now() at time zone 'UTC'
 order by case when ce.type in ('temp','fever') then 'temperature' else ce.type end,ce.event_date desc,ce.time_from desc,ce.updated_at desc,ce.id
 ) q),'[]'),
 'milkInventory',coalesce((select jsonb_agg(public.myb_milk_doc_v1540(mi)) from public.milk_items mi where mi.family_id=f.id and mi.deleted_at is null and mi.remaining_ml>0),'[]'),
 'appointments',coalesce((select jsonb_agg(coalesce(a.extra,'{}')||jsonb_build_object('id',coalesce(a.legacy_id,a.id::text),'_dbId',a.id,'title',a.title,'date',a.appointment_date,'timeFrom',a.appointment_time,'status',a.status))
 from public.appointments a where a.family_id=f.id and a.deleted_at is null and a.appointment_date>=((now() at time zone 'UTC')-interval '14 hours')::date),'[]'))
 from public.families f where f.id=public.myb_stable_uuid('family:'||p_sync_id) and f.deleted_at is null;
$$;

-- One global worker lease prevents overlapping scans. Cursor resumes after the last family.
create or replace function public.myb_notification_run_v1660(p_action text,p_token uuid default null,p_sync_id text default null,p_summary jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r myb_notification_runtime_v1660;t uuid;begin
 select * into r from myb_notification_runtime_v1660 where id for update;
 if p_action='begin' then
  if r.lease_until>clock_timestamp() then return jsonb_build_object('ok',false,'busy',true);end if;
  update myb_notification_deliveries_v1660 set state='expired',lease_until=null where expires_at<=clock_timestamp() and state in ('pending','sending');
  t:=gen_random_uuid();update myb_notification_runtime_v1660 set token=t,lease_until=clock_timestamp()+interval '90 seconds',started_at=clock_timestamp(),last_error=null where id;
  return jsonb_build_object('ok',true,'token',t,'cursor',r.cursor_sync);
 end if;
 if p_token is null or r.token is distinct from p_token or r.lease_until<=clock_timestamp() then raise exception 'LEASE_LOST';end if;
 if p_action='checkpoint' then
  insert into myb_notification_checks_v1660(family_id,checked_at,summary) values(myb_stable_uuid('family:'||p_sync_id),clock_timestamp(),p_summary) on conflict(family_id) do update set checked_at=excluded.checked_at,summary=excluded.summary;
  update myb_notification_runtime_v1660 set cursor_sync=p_sync_id where id;
 elsif p_action='finish' then
  update myb_notification_runtime_v1660 set completed_at=clock_timestamp(),lease_until=null,summary=p_summary,last_error=case when coalesce((p_summary->>'failed')::int,0)>0 then 'PARTIAL_FAILURE' end where id;
 elsif p_action='error' then
  update myb_notification_runtime_v1660 set completed_at=clock_timestamp(),lease_until=null,last_error='WORKER_FAILED',summary=p_summary where id;
 else raise exception 'INVALID_ACTION';end if;
 return jsonb_build_object('ok',true);
end$$;

create or replace function public.myb_notification_families_v1660(p_cursor text default '') returns jsonb
language sql security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(x),'[]') from (
 select f.sync_code sync_id from families f where f.deleted_at is null and nullif(btrim(f.sync_code),'') is not null and f.id=public.myb_stable_uuid('family:'||f.sync_code) and
 exists(select 1 from push_subscriptions s where s.sync_id=f.sync_code and s.enabled and s.deleted_at is null)
 order by case when f.sync_code>coalesce(p_cursor,'') then 0 else 1 end,f.sync_code limit 100) x;
$$;
create or replace function public.myb_notification_claim_v1660(p_subscription_id uuid,p_event_key text,p_expires_at timestamptz) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r myb_notification_deliveries_v1660;t uuid:=gen_random_uuid();begin
 if p_expires_at<=clock_timestamp() or length(p_event_key)>500 or p_expires_at>clock_timestamp()+interval '16 minutes' then return jsonb_build_object('ok',false,'reason','expired');end if;
 if not exists(select 1 from push_subscriptions where id=p_subscription_id and enabled and deleted_at is null) then return jsonb_build_object('ok',false,'reason','disabled');end if;
 insert into myb_notification_deliveries_v1660(subscription_id,event_key,expires_at) values(p_subscription_id,p_event_key,p_expires_at) on conflict do nothing;
 select * into r from myb_notification_deliveries_v1660 where subscription_id=p_subscription_id and event_key=p_event_key for update;
 if r.state in ('sent','failed','expired') or r.attempts>=4 or r.expires_at<=clock_timestamp() or r.next_attempt_at>clock_timestamp() or r.lease_until>clock_timestamp() then return jsonb_build_object('ok',false,'reason',r.state);end if;
 update myb_notification_deliveries_v1660 set state='sending',attempts=attempts+1,token=t,lease_until=clock_timestamp()+interval '60 seconds',updated_at=clock_timestamp() where subscription_id=p_subscription_id and event_key=p_event_key;
 return jsonb_build_object('ok',true,'token',t,'attempt',r.attempts+1);
end$$;
create or replace function public.myb_notification_ack_v1660(p_subscription_id uuid,p_event_key text,p_token uuid,p_status int) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r myb_notification_deliveries_v1660;begin
 select * into r from myb_notification_deliveries_v1660 where subscription_id=p_subscription_id and event_key=p_event_key for update;
 if not found or r.token is distinct from p_token or r.state<>'sending' then return jsonb_build_object('ok',false,'reason','lease_lost');end if;
 update myb_notification_deliveries_v1660 set
 state=case when p_status between 200 and 299 then 'sent' when r.expires_at<=clock_timestamp() then 'expired' when r.attempts>=4 or (p_status between 400 and 499 and p_status not in(408,429)) then 'failed' else 'pending' end,
 sent_at=case when p_status between 200 and 299 then clock_timestamp() else null end,
 status_code=p_status,lease_until=null,next_attempt_at=clock_timestamp()+make_interval(secs=>least(480,60*power(2,r.attempts-1)::int)),updated_at=clock_timestamp()
 where subscription_id=p_subscription_id and event_key=p_event_key;
 if p_status in(404,410) then update push_subscriptions set enabled=false,updated_at=clock_timestamp() where id=p_subscription_id;end if;
 return jsonb_build_object('ok',true);
end$$;

create or replace function public.myb_notification_status_v1660(p_sync_id text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);r myb_notification_runtime_v1660;c myb_notification_checks_v1660;active boolean:=false;begin
 if not exists(select 1 from families where id=f and deleted_at is null) then return jsonb_build_object('ok',false,'code','FAMILY_NOT_FOUND');end if;
 select * into r from myb_notification_runtime_v1660 where id;select * into c from myb_notification_checks_v1660 where family_id=f;
 if to_regclass('cron.job') is not null then execute 'select exists(select 1 from cron.job where jobname=''myb-notifications-v1660'' and active)' into active;end if;
 return jsonb_build_object('ok',true,'schedulerActive',active,'lastRequestAt',r.last_request_at,'lastCompletedAt',r.completed_at,'lastCheckedAt',c.checked_at,'errorCode',r.last_error,'summary',coalesce(c.summary,'{}'),
 'subscriptions',(select count(*) from push_subscriptions where sync_id=p_sync_id and enabled and deleted_at is null));
end$$;
-- Helpers restricted to the worker. Existing Sync ID capability model retained for health display.
do $$declare fn record;begin
 for fn in select oid::regprocedure s,proname from pg_proc where pronamespace='public'::regnamespace and proname like 'myb_notification_%_v1660' loop
  execute format('revoke all on function %s from public,anon,authenticated',fn.s);
  execute format('grant execute on function %s to service_role',fn.s);
 end loop;
end$$;
grant execute on function public.myb_notification_status_v1660(text) to anon,authenticated;
commit;
