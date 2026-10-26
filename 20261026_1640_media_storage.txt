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
 if nullif(btrim(p_sync_id),'') is null then raise exception 'Sync ID không hợp lệ'; end if;
 f:=public.myb_stable_uuid('family:'||p_sync_id);
 if not exists(select 1 from public.families where id=f and deleted_at is null)
 or not exists(select 1 from public.health_members where id=p_member_id and family_id=f and deleted_at is null) then raise exception 'Không có quyền truy cập hồ sơ';end if;
 perform pg_advisory_xact_lock(hashtextextended('media:'||p_id::text,0));
 select * into r from public.myb_media_v1640 where id=p_id for update;
 if r.id is not null and (r.family_id<>f or r.member_id<>p_member_id) then raise exception 'Tệp thuộc hồ sơ khác';end if;
 if p_op='begin' then
  if r.id is null then
   insert into public.myb_media_v1640(id,family_id,member_id,path,sha256,size_bytes,mime,file_name)
   values(p_id,f,p_member_id,f::text||'/'||p_member_id::text||'/'||p_id::text,p_meta->>'sha256',(p_meta->>'size')::bigint,p_meta->>'type',p_meta->>'fileName') returning * into r;
  elsif r.status='deleted' or r.sha256 is distinct from p_meta->>'sha256' or r.size_bytes is distinct from (p_meta->>'size')::bigint or r.mime is distinct from p_meta->>'type' then raise exception 'ID tệp đã có nội dung khác';end if;
 elsif p_op='ready' then
  if r.id is null or r.status='deleted' then raise exception 'Chưa chuẩn bị tệp';end if;
  update public.myb_media_v1640 set status='ready',updated_at=now() where id=p_id returning * into r;
 elsif p_op in ('read','unlink_check','deleted') then
  if r.id is null or r.status<>'ready' then raise exception 'File chưa tải lên hoặc đã bị xóa';end if;
  select exists(select 1 from public.health_members h cross join lateral jsonb_array_elements(coalesce(h.extra#>'{other,files}','[]'::jsonb)) a where h.family_id=f and h.deleted_at is null and a->>'mediaId'=p_id::text) into linked;
  if p_op='read' and not linked then raise exception 'Tệp chưa được lưu vào hồ sơ';end if;
  if p_op<>'read' and linked then raise exception 'Tệp vẫn đang được sử dụng trong hồ sơ';end if;
  if p_op='deleted' then update public.myb_media_v1640 set status='deleted',updated_at=now() where id=p_id returning * into r;end if;
 else raise exception 'Thao tác không hợp lệ';end if;
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
