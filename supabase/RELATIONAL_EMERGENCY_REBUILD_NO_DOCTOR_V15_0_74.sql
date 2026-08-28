-- Mẹ Yêu Bé V15.0.74 · EmergencyRelationalRebuildNoDoctor
-- Mục tiêu: cứu dữ liệu khi Doctor/duplicate scan timeout 57014.
-- Không scan GROUP BY trên relational tables; backup JSON, dedupe JSON, reset relational, migrate lại từ JSON sạch.

-- Index hỗ trợ reset/rebuild theo family_id, tránh update full-table quá chậm khi dữ liệu đã bị double.
do $$
declare
  t text;
  has_family boolean;
  has_deleted boolean;
  has_created boolean;
  has_updated boolean;
begin
  foreach t in array array[
    'app_settings','media_files','health_labs','health_medications','health_allergies','health_visits','health_measurements',
    'vaccine_records','child_vaccine_plans','vaccine_catalog','feed_milk_sources','milk_transactions','feed_events','pump_events',
    'sleep_events','diaper_events','temperature_events','care_events','milk_items','milk_containers','appointments','diary_entries',
    'milestones','care_categories','health_members','relational_write_queue','change_logs','migration_batches','relational_recovery_backups'
  ] loop
    if to_regclass('public.'||t) is not null then
      select exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='family_id') into has_family;
      select exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='deleted_at') into has_deleted;
      select exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='created_at') into has_created;
      select exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='updated_at') into has_updated;

      if has_family and has_deleted then
        execute format('create index if not exists %I on public.%I(family_id, deleted_at)', 'idx_myb_'||t||'_family_deleted_v1574', t);
      elsif has_family and has_updated then
        execute format('create index if not exists %I on public.%I(family_id, updated_at)', 'idx_myb_'||t||'_family_updated_v1574', t);
      elsif has_family and has_created then
        execute format('create index if not exists %I on public.%I(family_id, created_at)', 'idx_myb_'||t||'_family_created_v1574', t);
      elsif has_family then
        execute format('create index if not exists %I on public.%I(family_id)', 'idx_myb_'||t||'_family_v1574', t);
      end if;
    end if;
  end loop;
end $$;

create or replace function public.myb_relational_light_status_v1574(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_data jsonb := '{}'::jsonb;
  v_clean jsonb := '{}'::jsonb;
  v_before jsonb;
  v_after jsonb;
  d_legacy int := 0;
begin
  select data into v_data from public.meyeube_sync where id = v_sync_id limit 1;
  v_data := coalesce(v_data, '{}'::jsonb);
  v_clean := public.myb_dedupe_legacy_payload_v1572(v_data);
  v_before := public.myb_dedupe_source_counts_v1572(v_data);
  v_after := public.myb_dedupe_source_counts_v1572(v_clean);

  select coalesce(sum((v_before->>k)::int - (v_after->>k)::int),0)::int into d_legacy
  from jsonb_object_keys(v_before) k
  where (v_before->>k) ~ '^\d+$' and (v_after->>k) ~ '^\d+$' and (v_before->>k)::int > (v_after->>k)::int;

  return jsonb_build_object(
    'ok', d_legacy = 0,
    'status', case when d_legacy=0 then 'legacy_json_clean_or_no_obvious_duplicate' else 'legacy_json_has_duplicates' end,
    'sync_id', v_sync_id,
    'family_id', v_family_id,
    'legacy_counts_before', v_before,
    'legacy_counts_after_dedupe', v_after,
    'legacy_rows_can_remove', d_legacy,
    'doctor_mode', 'emergency_light_json_only_no_relational_scan_v15_0_73',
    'message', 'V15.0.74 không scan relational tables để tránh timeout 57014. Nếu UI đã double, hãy chạy Cứu dữ liệu server để rebuild relational từ JSON đã dedupe.'
  );
end;
$$;

grant execute on function public.myb_relational_light_status_v1574(text) to anon, authenticated;

-- Override Fast Doctor: chỉ kiểm tra JSON legacy nhẹ, không query GROUP BY các bảng relational.
create or replace function public.myb_relational_fast_duplicate_doctor(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_light jsonb;
begin
  v_light := public.myb_relational_light_status_v1574(p_sync_id);
  return v_light || jsonb_build_object(
    'ok', false,
    'status', 'safe_mode_no_relational_scan',
    'recommendation', 'Không chạy duplicate scan trên relational vì project đang timeout. Hãy chạy Cứu dữ liệu server V15.0.74 để backup + dedupe legacy JSON + reset/rebuild relational.',
    'duplicate_summary', jsonb_build_object('relational_scan_skipped', true, 'reason', 'avoid_statement_timeout_57014'),
    'version', '15.0.74'
  );
end;
$$;

grant execute on function public.myb_relational_fast_duplicate_doctor(text) to anon, authenticated;

create or replace function public.myb_relational_milk_identity_doctor(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.myb_relational_fast_duplicate_doctor(p_sync_id) || jsonb_build_object(
    'compat_name','myb_relational_milk_identity_doctor',
    'version','15.0.74',
    'note','Emergency safe mode: bỏ scan bình/túi trên relational để tránh statement timeout 57014.'
  );
end;
$$;

grant execute on function public.myb_relational_milk_identity_doctor(text) to anon, authenticated;

create or replace function public.myb_emergency_rebuild_relational_from_legacy_v1574(p_sync_id text default 'main', p_write_clean_legacy boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_device_id uuid := public.myb_stable_uuid('device:emergency-rebuild:v15.0.74:' || coalesce(nullif(p_sync_id,''),'main'));
  v_op_id uuid := gen_random_uuid();
  v_original jsonb;
  v_clean jsonb;
  v_before jsonb;
  v_after jsonb;
  v_backup_id uuid;
  v_reset jsonb;
  v_migration jsonb;
  v_light jsonb;
begin
  perform pg_advisory_xact_lock(hashtext(v_family_id::text));

  select data into v_original from public.meyeube_sync where id = v_sync_id limit 1;
  if v_original is null then
    return jsonb_build_object('ok', false, 'status', 'missing_legacy_json', 'message', 'Không tìm thấy public.meyeube_sync.data để rebuild.', 'sync_id', v_sync_id);
  end if;

  v_before := public.myb_dedupe_source_counts_v1572(v_original);
  v_clean := public.myb_dedupe_legacy_payload_v1572(v_original);
  v_after := public.myb_dedupe_source_counts_v1572(v_clean);

  insert into public.relational_recovery_backups(family_id, sync_id, backup_type, backup_data, before_counts, after_counts, result, created_at)
  values(v_family_id, v_sync_id, 'before_emergency_rebuild_v15_0_73', v_original, v_before, v_after, jsonb_build_object('op_id', v_op_id, 'mode', 'no_doctor'), now())
  returning id into v_backup_id;

  if p_write_clean_legacy then
    update public.meyeube_sync
       set data = v_clean,
           updated_at = now()
     where id = v_sync_id;
  end if;

  -- Reset active relational rows then import from clean JSON.
  v_reset := public.myb_soft_reset_relational_family_for_snapshot(v_family_id);
  v_migration := public.myb_migrate_json_to_relational(v_sync_id, false);
  v_light := public.myb_relational_light_status_v1574(v_sync_id);

  update public.relational_recovery_backups
     set result = jsonb_build_object('reset', v_reset, 'migration', v_migration, 'light_status', v_light, 'write_clean_legacy', p_write_clean_legacy),
         after_counts = public.myb_dedupe_source_counts_v1572(coalesce((select data from public.meyeube_sync where id = v_sync_id),'{}'::jsonb))
   where id = v_backup_id;

  insert into public.change_logs(family_id, table_name, row_id, operation, op_id, device_id, payload)
  values(v_family_id, 'relational_recovery_backups', v_backup_id, 'emergency_rebuild_v15_0_73', v_op_id, v_device_id, jsonb_build_object('before', v_before, 'after', v_after, 'backup_id', v_backup_id));

  return jsonb_build_object(
    'ok', coalesce((v_migration->>'ok')::boolean, false),
    'status', case when coalesce((v_migration->>'ok')::boolean, false) then 'rebuilt_no_doctor' else 'rebuild_finished_check_migration_result' end,
    'sync_id', v_sync_id,
    'family_id', v_family_id,
    'backup_id', v_backup_id,
    'before_counts', v_before,
    'after_counts', v_after,
    'reset_result', v_reset,
    'migration_result', v_migration,
    'light_status_after', v_light,
    'legacy_backup', 'Bản JSON trước khi sửa đã lưu trong relational_recovery_backups.backup_data.',
    'important', 'Không chạy duplicate Doctor sau rebuild để tránh timeout 57014. Sau khi rebuild xong, hãy mở app kiểm tra UI và chạy Delta/Doctor nhẹ nếu cần.',
    'normal_app_write_mode', 'emergency_relational_rebuild_no_doctor_v15_0_73'
  );
exception when others then
  return jsonb_build_object('ok', false, 'status', 'failed', 'sync_id', v_sync_id, 'family_id', v_family_id, 'message', sqlerrm, 'sqlstate', sqlstate);
end;
$$;

grant execute on function public.myb_emergency_rebuild_relational_from_legacy_v1574(text, boolean) to anon, authenticated;

-- Giữ tên cũ để UI V15.0.72/V15.0.74 bấm Cứu dữ liệu server sẽ chạy bản không Doctor.
create or replace function public.myb_rebuild_relational_from_deduped_legacy(p_sync_id text default 'main', p_write_clean_legacy boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.myb_emergency_rebuild_relational_from_legacy_v1574(p_sync_id, p_write_clean_legacy);
end;
$$;

grant execute on function public.myb_rebuild_relational_from_deduped_legacy(text, boolean) to anon, authenticated;

comment on function public.myb_emergency_rebuild_relational_from_legacy_v1574(text, boolean) is 'V15.0.74 emergency rebuild: backup legacy JSON, dedupe JSON, reset relational and migrate without running timeout-prone duplicate doctor.';
comment on function public.myb_relational_fast_duplicate_doctor(text) is 'V15.0.74 safe-mode doctor: JSON-only no relational duplicate scan to avoid statement timeout 57014.';
