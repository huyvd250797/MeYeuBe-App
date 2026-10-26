-- V17.1 read-only history using the existing Sync ID capability model.
begin;
create index if not exists idx_myb_milk_history_v1710 on public.milk_transactions(family_id,milk_item_id,created_at,id) where deleted_at is null;
create or replace function public.myb_milk_history_v1710(p_sync_id text,p_id text,p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=public.myb_stable_uuid('family:'||p_sync_id); m public.milk_items; rows jsonb; total numeric; offst integer:=greatest(0,coalesce(p_offset,0));
begin
 if nullif(btrim(p_sync_id),'') is null or nullif(btrim(p_id),'') is null then raise exception 'VALIDATION';end if;
 select * into m from public.milk_items where family_id=f and coalesce(legacy_id,id::text)=p_id and deleted_at is null;
 if not found then raise exception 'NOT_FOUND';end if;
 select coalesce(sum(case when transaction_type in ('feed_use','discard','transfer_out') then -ml when transaction_type in ('transfer_in','adjust') then ml else 0 end),0) into total from public.milk_transactions where family_id=f and milk_item_id=m.id and deleted_at is null;
 select coalesce(jsonb_agg(doc order by created_at,id),'[]') into rows from (
 select t.id,t.created_at,jsonb_build_object('id',t.id,'kind',t.transaction_type,'ml',t.ml,'at',t.created_at,'eventId',ce.legacy_id,'event',case when ce.id is not null then public.myb_care_doc_v1540(ce) else null end,'reason',t.reason,'balance',m.amount_ml+t.running) doc
 from (select tx.*,sum(case when transaction_type in ('feed_use','discard','transfer_out') then -ml when transaction_type in ('transfer_in','adjust') then ml else 0 end) over(order by created_at,id) running from public.milk_transactions tx where family_id=f and milk_item_id=m.id and deleted_at is null) t left join public.care_events ce on ce.id=t.care_event_id and ce.family_id=f and ce.deleted_at is null
 where t.family_id=f and t.milk_item_id=m.id and t.deleted_at is null order by t.created_at,t.id limit 51 offset offst) s;
 return jsonb_build_object('ok',true,'item',public.myb_milk_doc_v1540(m),'items',rows,'offset',offst,'hasMore',jsonb_array_length(rows)>50,'ledgerRemaining',m.amount_ml+total,'remaining',m.remaining_ml,'matches',m.remaining_ml is not null and m.remaining_ml=m.amount_ml+total);
exception when others then return jsonb_build_object('ok',false,'code',split_part(sqlerrm,':',1),'message',sqlerrm);end $$;
revoke all on function public.myb_milk_history_v1710(text,text,integer) from public;
grant execute on function public.myb_milk_history_v1710(text,text,integer) to anon,authenticated,service_role;
commit;
