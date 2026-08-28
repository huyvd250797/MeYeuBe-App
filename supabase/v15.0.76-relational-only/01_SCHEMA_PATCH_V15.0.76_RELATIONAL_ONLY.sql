-- Mẹ Yêu Bé V15.0.76 · RelationalOnlyDirectTableCutover
-- Run AFTER SUPABASE_SETUP.sql V15.0.75.
-- Purpose: relational tables are the only cloud source of truth.
-- JSON is allowed only as row-level transport/extra metadata; public.meyeube_sync is not used by V15.0.76.

begin;
set local statement_timeout = '120s';

create extension if not exists pgcrypto;

alter table public.app_settings add column if not exists lmp date;
alter table public.app_settings add column if not exists avatar_data_url text;
alter table public.app_settings add column if not exists show_official_name boolean not null default false;
alter table public.app_settings add column if not exists extra jsonb not null default '{}'::jsonb;

alter table public.health_members add column if not exists legacy_id text;
alter table public.health_measurements add column if not exists legacy_id text;
alter table public.vaccine_records add column if not exists legacy_id text;
alter table public.vaccine_records add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.child_vaccine_plans add column if not exists legacy_id text;
alter table public.child_vaccine_plans add column if not exists schedule_key text;
alter table public.child_vaccine_plans add column if not exists template_key text;

alter table public.care_events add column if not exists legacy_id text;
alter table public.milk_containers add column if not exists legacy_id text;
alter table public.milk_containers add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.milk_items add column if not exists legacy_id text;
alter table public.milk_items add column if not exists remaining_ml numeric;
alter table public.milk_items add column if not exists legacy_status text;
alter table public.milk_items add column if not exists extra jsonb not null default '{}'::jsonb;

alter table public.appointments add column if not exists legacy_id text;
alter table public.appointments add column if not exists legacy_type_id text;
alter table public.appointments add column if not exists time_to text;
alter table public.appointments add column if not exists type_name text;
alter table public.appointments add column if not exists person text;
alter table public.appointments add column if not exists cost_text text;
alter table public.appointments add column if not exists extra jsonb not null default '{}'::jsonb;

alter table public.diary_entries add column if not exists legacy_id text;
alter table public.diary_entries add column if not exists extra jsonb not null default '{}'::jsonb;

alter table public.milestones add column if not exists legacy_id text;
alter table public.milestones add column if not exists milestone_key text;
alter table public.milestones add column if not exists category text;
alter table public.milestones add column if not exists icon text;
alter table public.milestones add column if not exists milestone_time text;
alter table public.milestones add column if not exists description text;
alter table public.milestones add column if not exists photos jsonb not null default '[]'::jsonb;
alter table public.milestones add column if not exists extra jsonb not null default '{}'::jsonb;

alter table public.care_categories add column if not exists legacy_id text;
alter table public.care_categories add column if not exists description text;
alter table public.care_categories add column if not exists extra jsonb not null default '{}'::jsonb;

create table if not exists public.pregnancy_records (
  id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  legacy_id text,
  exam_date date,
  week_text text,
  estimated_weight text,
  bpd text,
  hc text,
  ac text,
  fl text,
  afi text,
  position text,
  note text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.app_members (
  id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  legacy_id text,
  name text,
  icon text,
  role text,
  pin text,
  status text,
  added_at timestamptz,
  added_by text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.sensor_logs (
  id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  legacy_id text,
  sensor_type text not null,
  log_date date,
  start_time text,
  end_time text,
  start_ts bigint,
  end_ts bigint,
  duration_sec int,
  min_value numeric,
  max_value numeric,
  avg_value numeric,
  mode text,
  samples jsonb not null default '[]'::jsonb,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.activity_logs (
  id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  legacy_id text,
  occurred_at timestamptz,
  activity_type text,
  action text,
  summary text,
  member_legacy_id text,
  member_name text,
  member_icon text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.monthly_notes (
  id uuid primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  month_index int not null,
  note text,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(family_id, month_index)
);

create index if not exists idx_health_members_family_legacy_v1576 on public.health_members(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_health_measurements_family_legacy_v1576 on public.health_measurements(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_care_family_legacy_v1576 on public.care_events(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_milk_items_family_legacy_v1576 on public.milk_items(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_milk_containers_family_legacy_v1576 on public.milk_containers(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_appointments_family_legacy_v1576 on public.appointments(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_diary_family_legacy_v1576 on public.diary_entries(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_milestones_family_legacy_v1576 on public.milestones(family_id, legacy_id) where deleted_at is null and legacy_id is not null;
create index if not exists idx_pregnancy_family_date_v1576 on public.pregnancy_records(family_id, exam_date) where deleted_at is null;
create index if not exists idx_sensor_family_type_date_v1576 on public.sensor_logs(family_id, sensor_type, log_date) where deleted_at is null;

alter table public.pregnancy_records enable row level security;
alter table public.app_members enable row level security;
alter table public.sensor_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.monthly_notes enable row level security;

drop policy if exists family_rw on public.pregnancy_records;
create policy family_rw on public.pregnancy_records for all using (public.myb_can_access_family(family_id)) with check (public.myb_can_access_family(family_id));
drop policy if exists family_rw on public.app_members;
create policy family_rw on public.app_members for all using (public.myb_can_access_family(family_id)) with check (public.myb_can_access_family(family_id));
drop policy if exists family_rw on public.sensor_logs;
create policy family_rw on public.sensor_logs for all using (public.myb_can_access_family(family_id)) with check (public.myb_can_access_family(family_id));
drop policy if exists family_rw on public.activity_logs;
create policy family_rw on public.activity_logs for all using (public.myb_can_access_family(family_id)) with check (public.myb_can_access_family(family_id));
drop policy if exists family_rw on public.monthly_notes;
create policy family_rw on public.monthly_notes for all using (public.myb_can_access_family(family_id)) with check (public.myb_can_access_family(family_id));

grant select, insert, update, delete on public.pregnancy_records, public.app_members, public.sensor_logs, public.activity_logs, public.monthly_notes to anon, authenticated;

commit;
