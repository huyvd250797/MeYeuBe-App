-- Reserve each record BEFORE destructive Drive work. A pending job blocks other writes.
create table if not exists public.myb_memory_jobs_v17181(
 id uuid primary key, memory_id uuid not null, fingerprint text not null,
 payload jsonb not null, base jsonb not null, result jsonb,
 worker uuid, lease_until timestamptz not null default '-infinity', created_at timestamptz not null default now()
);
create unique index if not exists myb_memory_job_active_v17181 on public.myb_memory_jobs_v17181(memory_id) where result is null;
alter table public.myb_memory_jobs_v17181 enable row level security;
revoke all on public.myb_memory_jobs_v17181 from anon,authenticated;
grant all on public.myb_memory_jobs_v17181 to service_role;
-- Old Edge instances must not bypass reservations; deploy the updated Edge after migration.
revoke execute on function public.myb_memory_commit_v17180(uuid,uuid,int,jsonb,boolean) from service_role;
create or replace function public.myb_memory_job_v17181(p_mode text,p_op uuid,p_payload jsonb default '{}',p_worker uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.myb_memory_jobs_v17181; m public.myb_memories_v17180; mid uuid; answer jsonb; doc jsonb;
begin
 if p_mode='begin' then
  mid=(p_payload->>'id')::uuid;
  perform pg_advisory_xact_lock(hashtextextended('memory:'||mid::text,0));
  select result into answer from myb_memory_ops_v17180 where id=p_op;
  if found then
   if answer->>'id'<>mid::text then return jsonb_build_object('ok',false,'message','Mã thao tác không khớp.'); end if;
   return answer;
  end if;
  select * into j from myb_memory_jobs_v17181 where id=p_op for update;
  if found then
   if j.memory_id<>mid or j.fingerprint<>p_payload->>'fingerprint' then return jsonb_build_object('ok',false,'message','Giữ nguyên nội dung lần lưu trước để thử lại.'); end if;
  else
   if exists(select 1 from myb_memory_jobs_v17181 where memory_id=mid and result is null) then return jsonb_build_object('ok',false,'code','BUSY','safeToEdit',true,'message','Kỷ niệm có thao tác chưa hoàn tất trên thiết bị khác. Tiếp tục trên thiết bị đã lưu.'); end if;
   select * into m from myb_memories_v17180 where id=mid;
   if coalesce(m.version,0)<>(p_payload->>'expected')::int or coalesce(m.deleted,false) then return jsonb_build_object('ok',false,'code','CONFLICT','safeToEdit',true,'message','Kỷ niệm đã thay đổi. Tải lại trước khi sửa.'); end if;
   if p_payload->>'action'='delete' and m.id is null then return jsonb_build_object('ok',false,'message','Kỷ niệm không tồn tại.'); end if;
   insert into myb_memory_jobs_v17181(id,memory_id,fingerprint,payload,base) values(p_op,mid,p_payload->>'fingerprint',p_payload,coalesce(to_jsonb(m),'{}')) returning * into j;
  end if;
  if j.lease_until>now() then return jsonb_build_object('ok',false,'code','BUSY','message','Đang xử lý. Nếu mất kết nối, chờ tối đa 10 phút rồi tiếp tục lần lưu trước.'); end if;
  update myb_memory_jobs_v17181 set worker=p_worker,lease_until=now()+interval '10 minutes' where id=p_op returning * into j;
  return jsonb_build_object('ok',true,'job',to_jsonb(j));
 end if;
 select * into j from myb_memory_jobs_v17181 where id=p_op for update;
 if not found then raise exception 'Missing job'; end if;
 if j.result is not null then return j.result; end if;
 if j.worker is distinct from p_worker then raise exception 'Worker changed'; end if;
 if p_mode='release' then update myb_memory_jobs_v17181 set lease_until='-infinity' where id=p_op;return jsonb_build_object('ok',true);end if;
 if p_mode<>'finish' or j.lease_until<now() then raise exception 'Lease expired'; end if;
 mid=j.memory_id;
 select * into m from myb_memories_v17180 where id=mid for update;
 if coalesce(m.version,0)<>(j.payload->>'expected')::int then raise exception 'Version changed';end if;
 doc=p_payload->'data';
 if j.payload->>'action'='delete' then doc='{}'::jsonb;end if;
 insert into myb_memories_v17180(id,version,data,deleted) values(mid,(j.payload->>'expected')::int+1,doc,j.payload->>'action'='delete')
 on conflict(id) do update set version=excluded.version,data=excluded.data,deleted=excluded.deleted,updated_at=now();
 answer=jsonb_build_object('ok',true,'id',mid,'version',(j.payload->>'expected')::int+1);
 insert into myb_memory_ops_v17180(id,result) values(p_op,answer);
 update myb_memory_jobs_v17181 set result=answer,payload='{}',base='{}',worker=null where id=p_op;
 return answer;
end $$;
revoke all on function public.myb_memory_job_v17181(text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.myb_memory_job_v17181(text,uuid,jsonb,uuid) to service_role;
