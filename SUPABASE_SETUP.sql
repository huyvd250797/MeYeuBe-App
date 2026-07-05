-- MeYeuBe V10.0 Supabase Cloud Sync Foundation
-- Run in Supabase SQL Editor before using Cloud Sync.

create table if not exists public.meyoube_cloud_data (
  sync_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.meyoube_cloud_data enable row level security;

-- Simple single-user PWA policy.
-- This allows the frontend publishable/anon key to read/write rows in this table.
-- For family/multi-user mode, replace with Supabase Auth policies in V10.1.
drop policy if exists "meyoube_cloud_data_select_all" on public.meyoube_cloud_data;
create policy "meyoube_cloud_data_select_all"
on public.meyoube_cloud_data
for select
to anon
using (true);

drop policy if exists "meyoube_cloud_data_insert_all" on public.meyoube_cloud_data;
create policy "meyoube_cloud_data_insert_all"
on public.meyoube_cloud_data
for insert
to anon
with check (true);

drop policy if exists "meyoube_cloud_data_update_all" on public.meyoube_cloud_data;
create policy "meyoube_cloud_data_update_all"
on public.meyoube_cloud_data
for update
to anon
using (true)
with check (true);
