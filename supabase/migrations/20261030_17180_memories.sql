-- Shared deployment memories. No family, Sync ID, login or per-user ownership checks.
create table if not exists public.myb_memories_v17180 (
 id uuid primary key, version integer not null default 1,
 data jsonb not null, updated_at timestamptz not null default now(), deleted boolean not null default false
);
create table if not exists public.myb_memory_ops_v17180 (
 id uuid primary key, result jsonb not null, created_at timestamptz not null default now()
);
create table if not exists public.myb_memory_budget_v17180(day date primary key, amount int not null);
alter table public.myb_memories_v17180 enable row level security;
alter table public.myb_memory_ops_v17180 enable row level security;
alter table public.myb_memory_budget_v17180 enable row level security;
revoke all on public.myb_memories_v17180, public.myb_memory_ops_v17180, public.myb_memory_budget_v17180 from anon,authenticated;
grant all on public.myb_memories_v17180, public.myb_memory_ops_v17180, public.myb_memory_budget_v17180 to service_role;
create or replace function public.myb_memory_commit_v17180(p_op uuid,p_id uuid,p_expected int,p_data jsonb,p_delete boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare old public.myb_memories_v17180; result jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended('memory:'||p_id::text,0));
 select o.result into result from myb_memory_ops_v17180 o where id=p_op;
 if found then return result; end if;
 select * into old from myb_memories_v17180 where id=p_id;
 if coalesce(old.version,0)<>p_expected or coalesce(old.deleted,false) then
  return jsonb_build_object('ok',false,'message','Kỷ niệm đã thay đổi. Tải lại để đối chiếu.','code','CONFLICT');
 end if;
 if not p_delete and (length(trim(p_data->>'title')) not between 1 and 120 or length(coalesce(p_data->>'note',''))>2000 or not (p_data->>'date' ~ '^\d{4}-\d{2}-\d{2}$')) then raise exception 'Invalid memory'; end if;
 insert into myb_memories_v17180(id,version,data,deleted) values(p_id,p_expected+1,p_data,p_delete)
 on conflict(id) do update set version=excluded.version,data=excluded.data,deleted=excluded.deleted,updated_at=now();
 result=jsonb_build_object('ok',true,'id',p_id,'version',p_expected+1);
 insert into myb_memory_ops_v17180(id,result) values(p_op,result);
 return result;
end $$;
create or replace function public.myb_memory_budget_v17180(p_limit int) returns boolean
language plpgsql security definer set search_path=public as $$
declare n int;
begin
 insert into myb_memory_budget_v17180(day,amount) values(current_date,1)
 on conflict(day) do update set amount=myb_memory_budget_v17180.amount+1 returning amount into n;
 return n<=p_limit;
end $$;
revoke all on function public.myb_memory_commit_v17180(uuid,uuid,int,jsonb,boolean), public.myb_memory_budget_v17180(int) from public,anon,authenticated;
grant execute on function public.myb_memory_commit_v17180(uuid,uuid,int,jsonb,boolean), public.myb_memory_budget_v17180(int) to service_role;
