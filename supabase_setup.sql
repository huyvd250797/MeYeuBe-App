-- MeYeuBe V10.1 Cloud Sync Official
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


-- V15.0.46 SupabaseCloudDBMode
-- Bảng meyeube_sync là nguồn lưu DB chính ở chế độ Cloud DB Mode.
-- Cột data lưu toàn bộ DB JSONB; file/media lớn nên lưu ở Supabase Storage hoặc IndexedDB, không nhúng base64 vào data.
create index if not exists meyeube_sync_updated_at_idx on public.meyeube_sync(updated_at desc);


-- V15.0.46 SupabaseDeleteTombstoneFix
-- App dùng updated_at để commit kiểu CAS từ frontend:
-- 1) fetch row hiện tại
-- 2) merge local với cloud, bao gồm _sync.tombstones cho thao tác xoá
-- 3) PATCH row với điều kiện updated_at = bản vừa fetch
-- Nếu không match, app fetch lại và merge lại để tránh máy lưu sau ghi đè máy lưu trước.
create index if not exists meyeube_sync_id_updated_at_idx on public.meyeube_sync(id, updated_at);
