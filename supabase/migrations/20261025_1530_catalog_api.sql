-- V15.3.0, additive facade over the deployed relational RPC contract.
-- No table rebuild, no recovery, no JSON-cloud writes, no new login.
begin;
do $$ begin
  if to_regprocedure('public.myb_relational_export_state_v1576(text)') is null
     or to_regprocedure('public.myb_relational_apply_changes_v1576(text,text,jsonb)') is null then
    raise exception 'Missing deployed relational RPC contract. Do not reset the database; inspect existing definitions.';
  end if;
end $$;

create or replace function public.myb_catalog_list_v1530(p_sync_id text, p_kind text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare state jsonb; field text;
begin
  field:=case p_kind when 'milk_container' then 'milkContainers' when 'appointment_type' then 'appointmentTypes' when 'diary_type' then 'diaryTypes' end;
  if field is null or nullif(btrim(p_sync_id),'') is null then return jsonb_build_object('ok',false,'code','VALIDATION','message','Danh mục hoặc Sync ID không hợp lệ.'); end if;
  state:=public.myb_relational_export_state_v1576(p_sync_id)::jsonb;
  if state->>'ok' is distinct from 'true' then return jsonb_build_object('ok',false,'code','DATABASE_ERROR','message','Không tải được danh mục.'); end if;
  return jsonb_build_object('ok',true,'items',coalesce(state->'payload'->field,'[]'::jsonb));
end $$;

create or replace function public.myb_catalog_write_v1530(
 p_sync_id text,p_kind text,p_op text,p_id text,p_data jsonb,p_expected jsonb,p_device_key text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 state jsonb; db jsonb; field text; old jsonb; item jsonb; x jsonb; changes jsonb:='[]'::jsonb;
 result jsonb; used boolean:=false; allowed text[]; stamp text; rows jsonb;
begin
 field:=case p_kind when 'milk_container' then 'milkContainers' when 'appointment_type' then 'appointmentTypes' when 'diary_type' then 'diaryTypes' end;
 if field is null or p_op not in ('create','update','delete') or p_op is null or nullif(btrim(p_id),'') is null or length(p_id)>200 or nullif(btrim(p_sync_id),'') is null then
   raise exception using errcode='P0001', message='VALIDATION: Thao tác hoặc ID không hợp lệ.';
 end if;
 -- Serializes this facade's catalog writes. Legacy care writes still depend on existing DB constraints.
 perform pg_advisory_xact_lock(hashtextextended('myb_catalog_v1530:'||p_sync_id,0));
 state:=public.myb_relational_export_state_v1576(p_sync_id)::jsonb;
 if state->>'ok' is distinct from 'true' then raise exception 'DATABASE_ERROR: Không đọc được dữ liệu database.'; end if;
 db:=state->'payload'; rows:=coalesce(db->field,'[]'::jsonb);
 select value into old from jsonb_array_elements(rows) where value->>'id'=p_id limit 1;
 if p_op='create' and old is not null then raise exception 'CONFLICT: ID đã tồn tại. Tải lại danh sách để đối chiếu.'; end if;
 if p_op<>'create' and (old is null or p_expected is null or p_expected is distinct from old) then raise exception 'CONFLICT: Danh mục đã thay đổi. Tải lại và mở sửa lại.'; end if;
 if p_kind='milk_container' then
   select exists(select 1 from jsonb_array_elements(coalesce(db->'milkInventory','[]'::jsonb)) b where b->>'containerId'=p_id)
       or exists(select 1 from jsonb_array_elements(coalesce(db->'careEvents','[]'::jsonb)) e where e->'extra'->>'containerId'=p_id) into used;
 elsif p_kind='appointment_type' then
   select exists(select 1 from jsonb_array_elements(coalesce(db->'appointments','[]'::jsonb)) a where a->>'typeId'=p_id or a->>'typeName'=old->>'name') into used;
 else
   select exists(select 1 from jsonb_array_elements(coalesce(db->'diary','[]'::jsonb)) d where d->>'typeId'=p_id or d->>'diaryTypeId'=p_id or d->>'categoryId'=p_id or d->>'category'=p_id or d->>'category'=old->>'name') into used;
 end if;
 if p_op='delete' then
   if used then raise exception 'IN_USE: Danh mục đang được sử dụng. Có thể chuyển sang Tạm ẩn.'; end if;
   changes:=jsonb_build_array(jsonb_build_object('entity',p_kind,'op','delete','source_id',p_id,'data',jsonb_build_object('id',p_id)));
 else
   if jsonb_typeof(p_data) is distinct from 'object' then raise exception 'VALIDATION: Dữ liệu không hợp lệ.'; end if;
   allowed:=case when p_kind='milk_container' then array['name','kind','capacity','note','active'] else array['name','icon','desc','active'] end;
   if exists(select 1 from jsonb_object_keys(p_data) k where not(k=any(allowed))) then raise exception 'VALIDATION: Có trường không được phép thay đổi.'; end if;
   if jsonb_typeof(p_data->'name') is distinct from 'string' or length(btrim(p_data->>'name')) not between 1 and 150 then raise exception 'VALIDATION: Tên phải từ 1 đến 150 ký tự.'; end if;
   if jsonb_typeof(p_data->'active') is distinct from 'boolean' then raise exception 'VALIDATION: Trạng thái không hợp lệ.'; end if;
   if exists(select 1 from jsonb_array_elements(rows) v where v->>'id'<>p_id and lower(btrim(v->>'name'))=lower(btrim(p_data->>'name'))) then raise exception 'DUPLICATE: Tên này đã có trong danh mục.'; end if;
   if length(coalesce(p_data->>'note',''))>4000 or length(coalesce(p_data->>'desc',''))>4000 or length(coalesce(p_data->>'icon',''))>100 then raise exception 'VALIDATION: Nội dung danh mục quá dài.'; end if;
   if p_kind='milk_container' then
     if coalesce(p_data->>'kind','') not in ('binh','tui') or jsonb_typeof(p_data->'capacity') is distinct from 'number' then raise exception 'VALIDATION: Loại hoặc dung tích không hợp lệ.'; end if;
     if (p_data->>'capacity')::numeric<0 or (p_data->>'capacity')::numeric>100000 then raise exception 'VALIDATION: Dung tích ngoài giới hạn.'; end if;
     if used and old->>'kind' is distinct from p_data->>'kind' then raise exception 'IN_USE: Không đổi loại bình/túi đã được sử dụng.'; end if;
   end if;
   stamp:=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
   item:=coalesce(old,'{}'::jsonb)||p_data||jsonb_build_object('id',p_id,'name',btrim(p_data->>'name'),'createdAt',coalesce(old->>'createdAt',stamp),'updatedAt',stamp);
   if p_kind='milk_container' and item->>'kind'='tui' then item:=item||jsonb_build_object('capacity',0); end if;
   changes:=jsonb_build_array(jsonb_build_object('entity',p_kind,'op','upsert','source_id',p_id,'data',item));
   -- Preserve the existing bottle rename behavior in the same DB request/transaction.
   if p_kind='milk_container' and item->>'kind'='binh' and old is not null and old->>'name' is distinct from item->>'name' then
     for x in select value from jsonb_array_elements(coalesce(db->'milkInventory','[]'::jsonb)) where value->>'containerId'=p_id loop
       changes:=changes||jsonb_build_array(jsonb_build_object('entity','milk_item','op','upsert','source_id',x->>'id','data',x||jsonb_build_object('containerName',item->>'name','updatedAt',stamp)));
     end loop;
   end if;
 end if;
 result:=public.myb_relational_apply_changes_v1576(p_sync_id,p_device_key,changes)::jsonb;
 if result->>'ok' is distinct from 'true' then raise exception 'DATABASE_ERROR: Database chưa xác nhận lưu danh mục.'; end if;
 result:=public.myb_catalog_list_v1530(p_sync_id,p_kind);
 if result->>'ok' is distinct from 'true' then raise exception 'DATABASE_ERROR: Không đọc được kết quả sau khi lưu.'; end if;
 return result||jsonb_build_object('changes',changes);
exception when others then
 return jsonb_build_object('ok',false,'code',split_part(sqlerrm,':',1),'message',sqlerrm);
end $$;

-- SECURITY INVOKER: these functions do not add privilege over the deployed RPCs.
revoke all on function public.myb_catalog_list_v1530(text,text) from public;
revoke all on function public.myb_catalog_write_v1530(text,text,text,text,jsonb,jsonb,text) from public;
grant execute on function public.myb_catalog_list_v1530(text,text) to anon,authenticated;
grant execute on function public.myb_catalog_write_v1530(text,text,text,text,jsonb,jsonb,text) to anon,authenticated;
commit;
