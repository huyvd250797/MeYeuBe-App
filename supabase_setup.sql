-- MeYeuBe V10.8.0 Device Push Notification
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


-- V10.8.0 Device Push Notification
create extension if not exists pgcrypto;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  sync_id text not null,
  device_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  alert_types jsonb not null default '[]'::jsonb,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_sync_id_idx
  on public.push_subscriptions(sync_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select_all" on public.push_subscriptions;
create policy "push_subscriptions_select_all"
on public.push_subscriptions for select to anon using (true);

drop policy if exists "push_subscriptions_insert_all" on public.push_subscriptions;
create policy "push_subscriptions_insert_all"
on public.push_subscriptions for insert to anon with check (true);

drop policy if exists "push_subscriptions_update_all" on public.push_subscriptions;
create policy "push_subscriptions_update_all"
on public.push_subscriptions for update to anon using (true) with check (true);

drop policy if exists "push_subscriptions_delete_all" on public.push_subscriptions;
create policy "push_subscriptions_delete_all"
on public.push_subscriptions for delete to anon using (true);

create table if not exists public.push_delivery_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  event_key text not null,
  status text not null default 'sent',
  error_message text,
  sent_at timestamptz not null default now(),
  unique(subscription_id,event_key)
);

alter table public.push_delivery_log enable row level security;
-- Không tạo policy anon cho push_delivery_log. Edge Function dùng service role.


-- V10.9.0 Optional avatar storage.
-- NOTE: This preserves the existing single-family anon-key model.
-- Before public/multi-family use, migrate to Supabase Auth and family-scoped RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('baby-assets', 'baby-assets', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "baby_assets_anon_insert" on storage.objects;
create policy "baby_assets_anon_insert"
on storage.objects for insert to anon
with check (bucket_id = 'baby-assets');

drop policy if exists "baby_assets_anon_update" on storage.objects;
create policy "baby_assets_anon_update"
on storage.objects for update to anon
using (bucket_id = 'baby-assets')
with check (bucket_id = 'baby-assets');

drop policy if exists "baby_assets_anon_select" on storage.objects;
create policy "baby_assets_anon_select"
on storage.objects for select to anon
using (bucket_id = 'baby-assets');
