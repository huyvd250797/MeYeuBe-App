-- Albums are metadata and links only. No Drive copies or family authentication.
create table if not exists public.myb_albums_v17190(
 id uuid primary key,version int not null default 1,name text not null,note text not null default '',
 cover_id uuid references public.myb_memories_v17180(id),deleted boolean not null default false,updated_at timestamptz not null default now()
);
create table if not exists public.myb_album_items_v17190(
 album_id uuid references public.myb_albums_v17190(id) on delete cascade,
 memory_id uuid references public.myb_memories_v17180(id) on delete cascade,position bigint not null,
 primary key(album_id,memory_id)
);
create index if not exists myb_album_memory_v17190 on public.myb_album_items_v17190(memory_id);
create table if not exists public.myb_album_ops_v17190(id uuid primary key,command jsonb not null,result jsonb not null,created_at timestamptz not null default now());
alter table public.myb_albums_v17190 enable row level security;
alter table public.myb_album_items_v17190 enable row level security;
alter table public.myb_album_ops_v17190 enable row level security;
revoke all on public.myb_albums_v17190,public.myb_album_items_v17190,public.myb_album_ops_v17190 from anon,authenticated;
grant all on public.myb_albums_v17190,public.myb_album_items_v17190,public.myb_album_ops_v17190 to service_role;
create or replace function public.myb_album_doc_v17190(p_id uuid) returns jsonb language sql stable security definer set search_path=public as $$
 select to_jsonb(a)||jsonb_build_object('count',(select count(*) from myb_album_items_v17190 i join myb_memories_v17180 m on m.id=i.memory_id where i.album_id=a.id and not m.deleted),
 'cover',(select jsonb_build_object('id',m.id,'version',m.version,'data',jsonb_build_object('fileId',m.data->>'fileId')) from myb_album_items_v17190 i join myb_memories_v17180 m on m.id=i.memory_id where i.album_id=a.id and not m.deleted and coalesce(m.data->>'fileId','')<>'' order by (m.id=a.cover_id) desc nulls last,i.position,m.id limit 1))
 from myb_albums_v17190 a where a.id=p_id and not a.deleted;
$$;
create or replace function public.myb_album_read_v17190(p_query jsonb default '{}') returns jsonb language plpgsql stable security definer set search_path=public as $$
declare aid uuid; offn int=greatest(0,coalesce((p_query->>'offset')::int,0)); lim int=least(100,greatest(1,coalesce((p_query->>'limit')::int,40))); result jsonb; total bigint; ord text=coalesce(p_query->>'order','custom');
begin
 if coalesce(p_query->>'mode','albums')='albums' then
  select coalesce(jsonb_agg(myb_album_doc_v17190(id) order by updated_at desc,id),'[]') into result from myb_albums_v17190 where not deleted;
  return jsonb_build_object('ok',true,'albums',result);
 end if;
 if p_query->>'mode'='members' then
  aid=(p_query->>'id')::uuid;
  if not exists(select 1 from myb_albums_v17190 where id=aid and not deleted) then return jsonb_build_object('ok',false,'code','NOT_FOUND','safeToEdit',true,'message','Album không còn tồn tại.');end if;
  select count(*) into total from myb_album_items_v17190 i join myb_memories_v17180 m on m.id=i.memory_id where i.album_id=aid and not m.deleted;
  select coalesce(jsonb_agg(doc order by rn),'[]') into result from (
   select to_jsonb(m) as doc,row_number() over(order by case when ord='custom' then i.position end,case when ord='oldest' then m.data->>'date' end asc,case when ord='newest' then m.data->>'date' end desc,m.id) rn
   from myb_album_items_v17190 i join myb_memories_v17180 m on m.id=i.memory_id where i.album_id=aid and not m.deleted
   order by rn offset offn limit lim
  ) s;
  return jsonb_build_object('ok',true,'album',myb_album_doc_v17190(aid),'items',result,'total',total,'nextOffset',offn+jsonb_array_length(result));
 end if;
 if p_query->>'mode'='library' then
  select count(*) into total from myb_memories_v17180 m where not deleted and (coalesce(p_query->>'search','')='' or (m.data->>'title'||' '||coalesce(m.data->>'note','')) ilike '%'||(p_query->>'search')||'%');
  select coalesce(jsonb_agg(doc order by d desc,id desc),'[]') into result from (
   select to_jsonb(m)||jsonb_build_object('inAlbum',exists(select 1 from myb_album_items_v17190 i where i.album_id=nullif(p_query->>'albumId','')::uuid and i.memory_id=m.id)) doc,m.id,m.data->>'date' d
   from myb_memories_v17180 m where not deleted and (coalesce(p_query->>'search','')='' or (m.data->>'title'||' '||coalesce(m.data->>'note','')) ilike '%'||(p_query->>'search')||'%') order by m.data->>'date' desc,m.id desc offset offn limit lim
  ) s;
  return jsonb_build_object('ok',true,'items',result,'total',total,'nextOffset',offn+jsonb_array_length(result));
 end if;
 if p_query->>'mode'='membership' then
  select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'version',a.version,'name',a.name,'selected',exists(select 1 from myb_album_items_v17190 i where i.album_id=a.id and i.memory_id=(p_query->>'memoryId')::uuid)) order by a.name,a.id),'[]') into result from myb_albums_v17190 a where not deleted;
  return jsonb_build_object('ok',true,'albums',result);
 end if;
 return jsonb_build_object('ok',false,'message','Truy vấn album không hợp lệ.');
end $$;
create or replace function public.myb_album_write_v17190(p_op uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.myb_albums_v17190; aid uuid; mid uuid; target uuid; item jsonb; ids uuid[]; seq uuid[]; pos int; n int; result jsonb; previous public.myb_album_ops_v17190; act text=p_command->>'kind'; selected_ids uuid[];
begin
 perform pg_advisory_xact_lock(hashtextextended('myb-albums-write',0));
 select * into previous from myb_album_ops_v17190 where id=p_op;
 if found then
  if previous.command<>p_command then return jsonb_build_object('ok',false,'safeToEdit',true,'message','Mã thao tác đã dùng cho nội dung khác.');end if;
  return previous.result;
 end if;
 if act='assign' then
  mid=(p_command->>'memoryId')::uuid;
  if not exists(select 1 from myb_memories_v17180 where id=mid and not deleted) or exists(select 1 from myb_memory_jobs_v17181 j where j.memory_id=mid and j.result is null) then return jsonb_build_object('ok',false,'safeToEdit',true,'message','Kỷ niệm đang thay đổi hoặc đã xóa.');end if;
  if jsonb_typeof(p_command->'choices') is distinct from 'array' or jsonb_array_length(p_command->'choices')>200 then raise exception 'Invalid choices';end if;
  if (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(p_command->'choices')) then raise exception 'Album bị lặp trong lựa chọn';end if;
  for item in select value from jsonb_array_elements(p_command->'choices') loop
   if jsonb_typeof(item->'selected') is distinct from 'boolean' or item->>'version' is null then raise exception 'Lựa chọn album không hợp lệ';end if;
   select * into a from myb_albums_v17190 where id=(item->>'id')::uuid and not deleted;
   if not found or item->>'version' is null or a.version<>(item->>'version')::int then return jsonb_build_object('ok',false,'code','CONFLICT','safeToEdit',true,'message','Album đã thay đổi. Tải lại trước khi chọn.');end if;
  end loop;
  for item in select value from jsonb_array_elements(p_command->'choices') loop
   aid=(item->>'id')::uuid;
   if (item->>'selected')::boolean then
    insert into myb_album_items_v17190 values(aid,mid,coalesce((select max(position)+1 from myb_album_items_v17190 where album_id=aid),1)) on conflict do nothing;
   else delete from myb_album_items_v17190 where album_id=aid and memory_id=mid;end if;
   get diagnostics n=row_count;
   if n>0 then update myb_albums_v17190 set version=version+1,updated_at=now(),cover_id=case when cover_id=mid and not (item->>'selected')::boolean then null else cover_id end where id=aid;end if;
  end loop;
 else
  if p_command->>'expected' is null then raise exception 'Thiếu version album';end if;
  aid=(p_command->>'id')::uuid;
  select * into a from myb_albums_v17190 where id=aid;
  if coalesce(a.version,0)<>coalesce((p_command->>'expected')::int,0) or coalesce(a.deleted,false) then return jsonb_build_object('ok',false,'code','CONFLICT','safeToEdit',true,'message','Album đã thay đổi. Tải lại để đối chiếu.');end if;
  if act='save' then
   if length(trim(coalesce(p_command->>'name',''))) not between 1 and 120 or length(coalesce(p_command->>'note',''))>2000 then raise exception 'Tên album 1–120 ký tự, lời giới thiệu tối đa 2000.';end if;
   if a.id is null and (select count(*) from myb_albums_v17190 where not deleted)>=200 then raise exception 'Tối đa 200 album';end if;
   mid=nullif(p_command->>'coverId','')::uuid;
   if mid is not null and not exists(select 1 from myb_album_items_v17190 i join myb_memories_v17180 m on m.id=i.memory_id where i.album_id=aid and m.id=mid and not m.deleted and coalesce(m.data->>'fileId','')<>'') then raise exception 'Thumbnail phải là ảnh trong album.';end if;
   insert into myb_albums_v17190(id,name,note,cover_id) values(aid,trim(p_command->>'name'),coalesce(p_command->>'note',''),mid)
   on conflict(id) do update set name=excluded.name,note=excluded.note,cover_id=excluded.cover_id,version=myb_albums_v17190.version+1,updated_at=now();
  else
   if a.id is null then raise exception 'Album không tồn tại';end if;
   if act='delete' then
    delete from myb_album_items_v17190 where album_id=aid;
    update myb_albums_v17190 set deleted=true,name='',note='',cover_id=null,version=version+1,updated_at=now() where id=aid;
   elsif act in ('add','remove') then
    if jsonb_typeof(p_command->'ids') is distinct from 'array' or jsonb_array_length(p_command->'ids')>100 then raise exception 'Tối đa 100 kỷ niệm mỗi thao tác';end if;
    select coalesce(array_agg(distinct value::uuid),'{}') into ids from jsonb_array_elements_text(p_command->'ids');
    if act='add' then
     if exists(select 1 from unnest(ids) x where not exists(select 1 from myb_memories_v17180 m where m.id=x and not m.deleted) or exists(select 1 from myb_memory_jobs_v17181 j where j.memory_id=x and j.result is null)) then raise exception 'Kỷ niệm đã xóa hoặc đang xử lý. Tải lại.';end if;
     for mid in select unnest(ids) loop
      insert into myb_album_items_v17190 values(aid,mid,coalesce((select max(position)+1 from myb_album_items_v17190 where album_id=aid),1)) on conflict do nothing;
     end loop;
    else
     delete from myb_album_items_v17190 where album_id=aid and memory_id=any(ids);
     update myb_albums_v17190 set cover_id=null where id=aid and cover_id=any(ids);
    end if;
    update myb_albums_v17190 set version=version+1,updated_at=now() where id=aid;
   elsif act='move' then
    mid=(p_command->>'memoryId')::uuid;target=(p_command->>'targetId')::uuid;
    select array_agg(memory_id order by position,memory_id) into seq from myb_album_items_v17190 where album_id=aid;
    if mid=target or array_position(seq,mid) is null or array_position(seq,target) is null then raise exception 'Vị trí không hợp lệ';end if;
    seq=array_remove(seq,mid);pos=array_position(seq,target);if coalesce((p_command->>'after')::boolean,false) then pos=pos+1;end if;
    seq=coalesce(seq[1:pos-1],'{}')||array[mid]||coalesce(seq[pos:array_length(seq,1)],'{}');
    update myb_album_items_v17190 i set position=x.n from unnest(seq) with ordinality x(id,n) where i.album_id=aid and i.memory_id=x.id;
    update myb_albums_v17190 set version=version+1,updated_at=now() where id=aid;
   else raise exception 'Thao tác album không hợp lệ';end if;
  end if;
 end if;
 if exists(select 1 from myb_album_items_v17190 group by album_id having count(*)>1000) then raise exception 'Tối đa 1000 kỷ niệm/album';end if;
 result=jsonb_build_object('ok',true,'album',myb_album_doc_v17190(aid));
 insert into myb_album_ops_v17190(id,command,result) values(p_op,p_command,result);
 return result;
end $$;
-- Cleanup linked covers and membership when existing memory writer deletes/removes a photo.
create or replace function public.myb_album_memory_changed_v17190() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if (new.deleted and not old.deleted) or (coalesce(new.data->>'fileId','')='' and coalesce(old.data->>'fileId','')<>'') then
  perform pg_advisory_xact_lock(hashtextextended('myb-albums-write',0));
  update myb_albums_v17190 a set cover_id=case when a.cover_id=new.id then null else a.cover_id end,version=a.version+1,updated_at=now()
  where not a.deleted and (a.cover_id=new.id or (new.deleted and exists(select 1 from myb_album_items_v17190 i where i.album_id=a.id and i.memory_id=new.id)));
  if new.deleted then delete from myb_album_items_v17190 where memory_id=new.id;end if;
 end if;
 return new;
end $$;
drop trigger if exists myb_album_memory_changed_v17190 on public.myb_memories_v17180;
create trigger myb_album_memory_changed_v17190 after update on public.myb_memories_v17180 for each row execute function public.myb_album_memory_changed_v17190();
-- Attach selected albums inside the same transaction that confirms a saved memory.
-- If an album was deleted during upload, keep the memory and return a visible warning.
create or replace function public.myb_album_job_done_v17190() returns trigger language plpgsql security definer set search_path=public as $$
declare aid uuid; missing jsonb='[]'; n int;
begin
 if old.result is null and new.result is not null and old.payload->>'action'='save' and old.payload ? 'albumIds' then
  perform pg_advisory_xact_lock(hashtextextended('myb-albums-write',0));
  for aid in select distinct value::uuid from jsonb_array_elements_text(old.payload->'albumIds') loop
   if exists(select 1 from myb_albums_v17190 where id=aid and not deleted) and ((select count(*) from myb_album_items_v17190 where album_id=aid)<1000 or exists(select 1 from myb_album_items_v17190 where album_id=aid and memory_id=new.memory_id)) then
    insert into myb_album_items_v17190 values(aid,new.memory_id,coalesce((select max(position)+1 from myb_album_items_v17190 where album_id=aid),1)) on conflict do nothing;
    get diagnostics n=row_count;
    if n>0 then update myb_albums_v17190 set version=version+1,updated_at=now() where id=aid;end if;
   else missing=missing||jsonb_build_array(aid);end if;
  end loop;
  new.result=new.result||jsonb_build_object('albumWarnings',missing);
  update myb_memory_ops_v17180 set result=new.result where id=new.id;
 end if;
 return new;
end $$;
drop trigger if exists myb_album_job_done_v17190 on public.myb_memory_jobs_v17181;
create trigger myb_album_job_done_v17190 before update on public.myb_memory_jobs_v17181 for each row execute function public.myb_album_job_done_v17190();
revoke all on function public.myb_album_doc_v17190(uuid),public.myb_album_read_v17190(jsonb),public.myb_album_write_v17190(uuid,jsonb),public.myb_album_memory_changed_v17190(),public.myb_album_job_done_v17190() from public,anon,authenticated;
grant execute on function public.myb_album_doc_v17190(uuid),public.myb_album_read_v17190(jsonb),public.myb_album_write_v17190(uuid,jsonb) to service_role;
