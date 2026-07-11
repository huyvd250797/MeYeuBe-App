-- MeYeuBe V10.6.0 Realtime JSON Sync
-- Run in Supabase SQL Editor before using Cloud Sync.
-- Table used by the PWA: public.meyeube_sync

create table if not exists public.meyeube_sync (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- V10.1 quick single-family mode: allow the frontend publishable/anon key to read/write this table.
-- For multi-user/family accounts later, enable Supabase Auth + stricter RLS policies.
alter table public.meyeube_sync enable row level security;

drop policy if exists "meyeube_sync_select_all" on public.meyeube_sync;
create policy "meyeube_sync_select_all"
on public.meyeube_sync
for select
to anon
using (true);

drop policy if exists "meyeube_sync_insert_all" on public.meyeube_sync;
create policy "meyeube_sync_insert_all"
on public.meyeube_sync
for insert
to anon
with check (true);

drop policy if exists "meyeube_sync_update_all" on public.meyeube_sync;
create policy "meyeube_sync_update_all"
on public.meyeube_sync
for update
to anon
using (true)
with check (true);

insert into public.meyeube_sync (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;


-- Enable Postgres Changes for Realtime JSON Sync.
-- Safe to run repeatedly: only add the table when it is not already in the publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'meyeube_sync'
  ) then
    alter publication supabase_realtime add table public.meyeube_sync;
  end if;
end $$;

-- UPDATE events include the new row used by the app.
alter table public.meyeube_sync replica identity full;
