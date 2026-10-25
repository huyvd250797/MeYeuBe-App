-- V15.7.0 Scoped Queries & Settings. Apply after 1530..1560. No business reset.
begin;
create table if not exists public.myb_settings_operations_v1570(family_id uuid not null references families(id) on delete cascade,op_id uuid not null,request_hash text not null,response jsonb not null,created_at timestamptz not null default now(),primary key(family_id,op_id));
alter table myb_settings_operations_v1570 enable row level security;
revoke all on myb_settings_operations_v1570 from public,anon,authenticated;
create or replace function public.myb_settings_doc_v1570(f uuid) returns jsonb language plpgsql stable set search_path=public,pg_temp as $$
declare r app_settings;d jsonb;begin select * into r from app_settings where family_id=f and deleted_at is null;
 d:=coalesce(r.extra,'{}')||jsonb_strip_nulls(jsonb_build_object('lmp',r.lmp,'babyName',r.baby_nickname,'officialName',r.baby_official_name,'babySex',r.baby_sex,'birthDate',r.birth_date,'birthTime',r.birth_time,'birthHospital',r.birth_hospital,'avatarDataUrl',r.avatar_data_url,'showOfficialName',r.show_official_name));
 return d-'theme'-'themeMode';end$$;
create or replace function public.myb_settings_groups_v1570(d jsonb) returns jsonb language sql immutable set search_path=public,pg_temp as $$
 select jsonb_build_object('profile',coalesce((select jsonb_object_agg(key,value) from jsonb_each(d) where key=any(array['lmp','babyName','officialName','babySex','birthDate','birthTime','birthTimeFrom','birthTimeTo','birthHospital','avatarDataUrl','showOfficialName','babyDescription'])),'{}'::jsonb),'dashboard',jsonb_build_object('dashboardConfig',coalesce(d->'dashboardConfig','{}')),'other',d-array['lmp','babyName','officialName','babySex','birthDate','birthTime','birthTimeFrom','birthTimeTo','birthHospital','avatarDataUrl','showOfficialName','babyDescription','dashboardConfig','theme','themeMode']);
$$;
create or replace function public.myb_settings_get_v1570(p_sync_id text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare d jsonb;g jsonb;e jsonb;begin if nullif(btrim(p_sync_id),'') is null then raise exception 'VALIDATION: Sync ID không hợp lệ.';end if;
 d:=myb_settings_doc_v1570(myb_stable_uuid('family:'||p_sync_id));g:=myb_settings_groups_v1570(d);select jsonb_object_agg(key,md5(value::text)) into e from jsonb_each(g);return jsonb_build_object('ok',true,'settings',d,'groups',g,'expected',e);end$$;
create or replace function public.myb_settings_operation_v1570(p_sync_id text,p_op_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare o myb_settings_operations_v1570;begin select * into o from myb_settings_operations_v1570 where family_id=myb_stable_uuid('family:'||p_sync_id) and op_id=p_op_id;if not found then return jsonb_build_object('ok',true,'status','not_found');end if;return myb_settings_get_v1570(p_sync_id)||jsonb_build_object('operationId',p_op_id);end$$;
create or replace function public.myb_settings_write_v1570(p_sync_id text,p_device_key text,p_op_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);d jsonb;g jsonb;k text;patch jsonb;v jsonb;o myb_settings_operations_v1570;hash text:=md5(p_command::text);ans jsonb;dev uuid;begin
 if p_op_id is null or nullif(btrim(p_sync_id),'') is null or jsonb_typeof(p_command->'patch') is distinct from 'object' then raise exception 'VALIDATION: Yêu cầu không hợp lệ.';end if;
 perform pg_advisory_xact_lock(hashtextextended('myb-v1576:'||f::text,0));
 select * into o from myb_settings_operations_v1570 where family_id=f and op_id=p_op_id;
 if found then if o.request_hash<>hash then raise exception 'CONFLICT: Mã thao tác đã dùng cho nội dung khác.';end if;return myb_settings_operation_v1570(p_sync_id,p_op_id);end if;
 if not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'VALIDATION: Gia đình không tồn tại.';end if;
 d:=myb_settings_doc_v1570(f);g:=myb_settings_groups_v1570(d);patch:=p_command->'patch';
 if pg_column_size(patch)>5000000 then raise exception 'VALIDATION: Cài đặt quá lớn.';end if;
 for k,v in select key,value from jsonb_each(patch) loop
 if not(g ? k) or jsonb_typeof(v) is distinct from 'object' then raise exception 'VALIDATION: Nhóm cài đặt không hợp lệ.';end if;
 if p_command->'expected'->>k is distinct from md5((g->k)::text) then raise exception 'CONFLICT: Nhóm cài đặt đã thay đổi. Tải lại trước khi sửa.';end if;
 -- Group membership is checked to prevent overwriting another group through a patch.
 if (myb_settings_groups_v1570(v)->k)<>v then raise exception 'VALIDATION: Trường không thuộc nhóm cài đặt.';end if;
 g:=jsonb_set(g,array[k],v);end loop;
 d:=(g->'profile')||(g->'dashboard')||(g->'other');
 if length(coalesce(d->>'babyName',''))>150 or length(coalesce(d->>'officialName',''))>200 then raise exception 'VALIDATION: Tên quá dài.';end if;
 if d ? 'showOfficialName' and jsonb_typeof(d->'showOfficialName')<>'boolean' then raise exception 'VALIDATION: Trạng thái hiển thị tên không hợp lệ.';end if;
 if jsonb_typeof(d->'dashboardConfig') is distinct from 'object' then raise exception 'VALIDATION: Cấu hình dashboard không hợp lệ.';end if;
 insert into app_settings(id,family_id,lmp,baby_nickname,baby_official_name,baby_sex,birth_date,birth_time,birth_hospital,avatar_data_url,show_official_name,dashboard_config,extra)
 values(myb_stable_uuid('app_settings:'||p_sync_id),f,nullif(d->>'lmp','')::date,d->>'babyName',d->>'officialName',d->>'babySex',nullif(d->>'birthDate','')::date,d->>'birthTime',d->>'birthHospital',d->>'avatarDataUrl',coalesce((d->>'showOfficialName')::boolean,true),d->'dashboardConfig',d)
 on conflict(family_id) do update set lmp=excluded.lmp,baby_nickname=excluded.baby_nickname,baby_official_name=excluded.baby_official_name,baby_sex=excluded.baby_sex,birth_date=excluded.birth_date,birth_time=excluded.birth_time,birth_hospital=excluded.birth_hospital,avatar_data_url=excluded.avatar_data_url,show_official_name=excluded.show_official_name,dashboard_config=excluded.dashboard_config,extra=excluded.extra,updated_at=clock_timestamp(),version=app_settings.version+1,deleted_at=null;
 dev:=myb_stable_uuid('device:runtime:v1576:'||p_sync_id||':'||coalesce(nullif(p_device_key,''),'device'));
 insert into devices(id,family_id,device_name,device_type,platform,app_version,last_seen_at) values(dev,f,coalesce(p_device_key,'Web device'),'browser','web','15.7.0',clock_timestamp()) on conflict(id) do update set last_seen_at=clock_timestamp(),app_version='15.7.0',deleted_at=null;
 ans:=myb_settings_get_v1570(p_sync_id)||jsonb_build_object('operationId',p_op_id);
 insert into myb_settings_operations_v1570(family_id,op_id,request_hash,response) values(f,p_op_id,hash,ans);return ans;
exception when others then return jsonb_build_object('ok',false,'code',case when sqlerrm like '%:%' then split_part(sqlerrm,':',1) else 'DATABASE_ERROR' end,'message',sqlerrm);end$$;
create or replace function public.myb_scoped_summary_v1570(p_sync_id text,p_query jsonb default '{}') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);a date; b date;rows jsonb;counts jsonb;begin
 a:=coalesce(nullif(p_query->>'from','')::date,(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh')::date);b:=coalesce(nullif(p_query->>'to','')::date,a);
 if nullif(btrim(p_sync_id),'') is null or b<a or b-a>366 then raise exception 'VALIDATION: Khoảng ngày không hợp lệ (tối đa 367 ngày).';end if;
 -- Aggregate on the server; sleep is clipped to the requested calendar interval.
 with events as (select type,event_date,coalesce(amount,0) amount,
 case when type='sleep' and time_from ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then (coalesce(nullif(extra->>'startDate',''),event_date::text)||' '||time_from)::timestamp end starts,
 case when type='sleep' and time_to ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then (coalesce(nullif(extra->>'endDate',''),event_date::text)||' '||time_to)::timestamp end ends
 from care_events where family_id=f and deleted_at is null and (event_date between a and b or type='sleep'))
 select jsonb_build_object('feeds',count(*) filter(where type='feed' and event_date between a and b),'feedMl',coalesce(sum(amount) filter(where type='feed' and event_date between a and b),0),
 'pumps',count(*) filter(where type='pump' and event_date between a and b),'pumpMl',coalesce(sum(amount) filter(where type='pump' and event_date between a and b),0),
 'sleepMinutes',coalesce(sum(case when ends>starts then round(greatest(0,extract(epoch from (least(ends,(b+1)::timestamp)-greatest(starts,a::timestamp))))/60) else 0 end) filter(where type='sleep'),0),
 'diapers',coalesce(sum(case when amount=0 then 1 else amount end) filter(where type='diaper' and event_date between a and b),0)) into counts from events;
 return jsonb_build_object('ok',true,'from',a,'to',b,'summary',counts,'source','relational_tables','at',clock_timestamp());
exception when others then return jsonb_build_object('ok',false,'code','VALIDATION','message',sqlerrm);end$$;
create or replace function public.myb_app_shell_v1570(p_sync_id text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare f uuid:=myb_stable_uuid('family:'||p_sync_id);mc jsonb;atp jsonb;dtp jsonb;s jsonb;begin
 if not exists(select 1 from families where id=f and deleted_at is null) then raise exception 'VALIDATION: Gia đình không tồn tại.';end if;
 s:=myb_settings_get_v1570(p_sync_id);
 select coalesce(jsonb_agg(extra||jsonb_build_object('id',coalesce(legacy_id,id::text),'name',name,'kind',kind,'capacity',capacity_ml,'active',active) order by sort_order,created_at),'[]') into mc from milk_containers where family_id=f and deleted_at is null;
 select coalesce(jsonb_agg(extra||jsonb_build_object('id',coalesce(legacy_id,id::text),'name',name,'icon',icon,'desc',description,'active',active) order by sort_order,created_at),'[]') into atp from care_categories where family_id=f and category_type='appointment_type' and deleted_at is null;
 select coalesce(jsonb_agg(extra||jsonb_build_object('id',coalesce(legacy_id,id::text),'name',name,'icon',icon,'desc',description,'active',active) order by sort_order,created_at),'[]') into dtp from care_categories where family_id=f and category_type='diary_type' and deleted_at is null;
 return jsonb_build_object('ok',true,'family_id',f,'settingsState',s,'payload',jsonb_build_object('settings',s->'settings','milkContainers',mc,'appointmentTypes',atp,'diaryTypes',dtp,'_scopeComplete',false));end$$;
do $$declare def text;begin select pg_get_functiondef('myb_relational_apply_changes_v1576(text,text,jsonb)'::regprocedure) into def;
 if position('-- v1570 settings guard' in def)=0 then
 if position('insert into public.families(' in def)=0 then raise exception 'V15.7 unexpected legacy definition.';end if;
 def:=replace(def,'insert into public.families(',E'-- v1570 settings guard\n if exists(select 1 from jsonb_array_elements(p_changes) c where lower(c->>''entity'')=''settings'') then raise exception ''API_RETIRED: Please use V15.7 settings API.'';end if;\n insert into public.families(');execute def;end if;end$$;
revoke all on function myb_settings_doc_v1570(uuid),myb_settings_groups_v1570(jsonb) from public,anon,authenticated;
revoke all on function myb_settings_get_v1570(text),myb_settings_operation_v1570(text,uuid),myb_settings_write_v1570(text,text,uuid,jsonb),myb_scoped_summary_v1570(text,jsonb),myb_app_shell_v1570(text) from public;
grant execute on function myb_settings_get_v1570(text),myb_settings_operation_v1570(text,uuid),myb_settings_write_v1570(text,text,uuid,jsonb),myb_scoped_summary_v1570(text,jsonb),myb_app_shell_v1570(text) to anon,authenticated,service_role;
notify pgrst,'reload schema';commit;
