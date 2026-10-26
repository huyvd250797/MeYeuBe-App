-- V16.4.0. Additive; private media registry. Run after 1590.
begin;
create table if not exists public.myb_media_v1640 (
 id uuid primary key, family_id uuid not null references public.families(id),
 member_id uuid not null,
 path text not null unique, sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 size_bytes bigint not null check(size_bytes between 1 and 10485760),
 mime text not null check(mime in ('image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
 file_name text not null check(length(file_name) between 1 and 200),
 status text not null default 'pending' check(status in ('pending','ready','deleted')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Registry retains archived bytes. It must not become an active child row that
-- the existing dynamic health-member deletion guard counts forever. Ownership
-- is validated against health_members on every server operation instead.
alter table public.myb_media_v1640 drop constraint if exists myb_media_v1640_member_id_fkey;
alter table public.myb_media_v1640 enable row level security;
revoke all on public.myb_media_v1640 from public,anon,authenticated;
create or replace function public.myb_media_access_v1640(p_sync_id text,p_member_id uuid,p_id uuid,p_op text,p_meta jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid; r public.myb_media_v1640; linked boolean;
begin
 if nullif(btrim(p_sync_id),'') is null then raise exception using message = U&'Sync ID kh\00F4ng h\1EE3p l\1EC7'; end if;
 f:=public.myb_stable_uuid('family:'||p_sync_id);
 if not exists(select 1 from public.families where id=f and deleted_at is null)
 or not exists(select 1 from public.health_members where id=p_member_id and family_id=f and deleted_at is null) then raise exception using message = U&'Kh\00F4ng c\00F3 quy\1EC1n truy c\1EADp h\1ED3 s\01A1';end if;
 perform pg_advisory_xact_lock(hashtextextended('media:'||p_id::text,0));
 select * into r from public.myb_media_v1640 where id=p_id for update;
 if r.id is not null and (r.family_id<>f or r.member_id<>p_member_id) then raise exception using message = U&'T\1EC7p thu\1ED9c h\1ED3 s\01A1 kh\00E1c';end if;
 if p_op='begin' then
  if r.id is null then
   insert into public.myb_media_v1640(id,family_id,member_id,path,sha256,size_bytes,mime,file_name)
   values(p_id,f,p_member_id,f::text||'/'||p_member_id::text||'/'||p_id::text,p_meta->>'sha256',(p_meta->>'size')::bigint,p_meta->>'type',p_meta->>'fileName') returning * into r;
  elsif r.status='deleted' or r.sha256 is distinct from p_meta->>'sha256' or r.size_bytes is distinct from (p_meta->>'size')::bigint or r.mime is distinct from p_meta->>'type' then raise exception using message = U&'ID t\1EC7p \0111\00E3 c\00F3 n\1ED9i dung kh\00E1c';end if;
 elsif p_op='ready' then
  if r.id is null or r.status='deleted' then raise exception using message = U&'Ch\01B0a chu\1EA9n b\1ECB t\1EC7p';end if;
  update public.myb_media_v1640 set status='ready',updated_at=now() where id=p_id returning * into r;
 elsif p_op in ('read','unlink_check','deleted') then
  if r.id is null or r.status<>'ready' then raise exception using message = U&'File ch\01B0a t\1EA3i l\00EAn ho\1EB7c \0111\00E3 b\1ECB x\00F3a';end if;
  select exists(select 1 from public.health_members h cross join lateral jsonb_array_elements(coalesce(h.extra#>'{other,files}','[]'::jsonb)) a where h.family_id=f and h.deleted_at is null and a->>'mediaId'=p_id::text) into linked;
  if p_op='read' and not linked then raise exception using message = U&'T\1EC7p ch\01B0a \0111\01B0\1EE3c l\01B0u v\00E0o h\1ED3 s\01A1';end if;
  if p_op<>'read' and linked then raise exception using message = U&'T\1EC7p v\1EABn \0111ang \0111\01B0\1EE3c s\1EED d\1EE5ng trong h\1ED3 s\01A1';end if;
  if p_op='deleted' then update public.myb_media_v1640 set status='deleted',updated_at=now() where id=p_id returning * into r;end if;
 else raise exception using message = U&'Thao t\00E1c kh\00F4ng h\1EE3p l\1EC7';end if;
 return jsonb_build_object('ok',true,'item',to_jsonb(r));
end $$;
revoke all on function public.myb_media_access_v1640(text,uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.myb_media_access_v1640(text,uuid,uuid,text,jsonb) to service_role;
-- No public storage policies: only the server may access object bytes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('myb-media','myb-media',false,10485760,array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists myb_media_server_only_v1640 on storage.objects;
create policy myb_media_server_only_v1640 on storage.objects as restrictive for all to anon,authenticated using (bucket_id <> 'myb-media') with check (bucket_id <> 'myb-media');
notify pgrst,'reload schema';
commit;
