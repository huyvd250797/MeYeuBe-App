-- Mẹ Yêu Bé V15.0.75 · TimeoutSafeDoctorBypassFix
-- HOTFIX chạy độc lập trong Supabase SQL Editor.
-- Mục tiêu: chặn tuyệt đối Fast Doctor/Milk Doctor khỏi scan relational tables,
-- tránh lỗi 57014; server rescue dùng RPC riêng và KHÔNG chạy Doctor hậu kiểm.
-- Không CREATE INDEX trong file này.

-- 1) Override Doctor trước tiên bằng constant-time response, không đọc bảng nào.
create or replace function public.myb_relational_fast_duplicate_doctor(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object(
    'ok', false,
    'status', 'safe_mode_no_server_duplicate_scan',
    'sync_id', coalesce(nullif(p_sync_id,''),'main'),
    'version', '15.0.75',
    'doctor_mode', 'constant_time_no_table_access',
    'duplicate_summary', jsonb_build_object(
      'relational_scan_skipped', true,
      'reason', 'avoid_statement_timeout_57014'
    ),
    'message', 'V15.0.75 đã tắt duplicate scan trên server. Dùng kiểm tra local trong app; nếu dữ liệu Cloud/relational vẫn double thì chạy Cứu dữ liệu server V15.0.75.',
    'recommendation', 'Không dùng Doctor để quyết định rebuild trong giai đoạn recovery.'
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
    'compat_name', 'myb_relational_milk_identity_doctor',
    'version', '15.0.75',
    'note', 'Milk Identity Doctor bị bypass để tránh 57014.'
  );
end;
$$;

grant execute on function public.myb_relational_milk_identity_doctor(text) to anon, authenticated;

-- 2) Trạng thái timeout-safe, cũng không đọc bảng relational/legacy.
create or replace function public.myb_relational_timeout_safe_status_v1575(p_sync_id text default 'main')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object(
    'ok', true,
    'status', 'timeout_safe_ready',
    'sync_id', coalesce(nullif(p_sync_id,''),'main'),
    'version', '15.0.75',
    'server_duplicate_scan', 'disabled',
    'message', 'Doctor scan đã được vô hiệu hóa an toàn.'
  );
end;
$$;

grant execute on function public.myb_relational_timeout_safe_status_v1575(text) to anon, authenticated;

-- 3) Emergency rebuild V15.0.75.
--    Backup legacy JSON -> dedupe JSON -> reset relational -> migrate JSON sạch.
--    Không gọi Fast Doctor / Milk Doctor / GROUP BY duplicate scan sau migration.
create or replace function public.myb_emergency_rebuild_relational_from_legacy_v1575(
  p_sync_id text default 'main',
  p_write_clean_legacy boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '0'
as $$
declare
  v_sync_id text := coalesce(nullif(p_sync_id,''),'main');
  v_family_id uuid := public.myb_stable_uuid('family:' || coalesce(nullif(p_sync_id,''),'main'));
  v_device_id uuid := public.myb_stable_uuid('device:emergency-rebuild:v15.0.75:' || coalesce(nullif(p_sync_id,''),'main'));
  v_op_id uuid := gen_random_uuid();
  v_original jsonb;
  v_clean jsonb;
  v_before jsonb;
  v_after jsonb;
  v_backup_id uuid;
  v_reset jsonb;
  v_migration jsonb;
begin
  perform pg_advisory_xact_lock(hashtext(v_family_id::text));

  select data
    into v_original
    from public.meyeube_sync
   where id = v_sync_id
   limit 1;

  if v_original is null then
    return jsonb_build_object(
      'ok', false,
      'status', 'missing_legacy_json',
      'sync_id', v_sync_id,
      'message', 'Không tìm thấy public.meyeube_sync.data để rebuild.'
    );
  end if;

  v_before := public.myb_dedupe_source_counts_v1572(v_original);
  v_clean := public.myb_dedupe_legacy_payload_v1572(v_original);
  v_after := public.myb_dedupe_source_counts_v1572(v_clean);

  insert into public.relational_recovery_backups(
    family_id, sync_id, backup_type, backup_data,
    before_counts, after_counts, result, created_at
  )
  values(
    v_family_id, v_sync_id, 'before_timeout_safe_rebuild_v15_0_75', v_original,
    v_before, v_after,
    jsonb_build_object('op_id', v_op_id, 'mode', 'no_doctor_v15_0_75'),
    now()
  )
  returning id into v_backup_id;

  if p_write_clean_legacy then
    update public.meyeube_sync
       set data = v_clean,
           updated_at = now()
     where id = v_sync_id;
  end if;

  v_reset := public.myb_soft_reset_relational_family_for_snapshot(v_family_id);
  v_migration := public.myb_migrate_json_to_relational(v_sync_id, false);

  update public.relational_recovery_backups
     set result = jsonb_build_object(
           'reset', v_reset,
           'migration', v_migration,
           'write_clean_legacy', p_write_clean_legacy,
           'doctor_skipped', true,
           'version', '15.0.75'
         ),
         after_counts = v_after
   where id = v_backup_id;

  insert into public.change_logs(
    family_id, table_name, row_id, operation, op_id, device_id, payload
  )
  values(
    v_family_id,
    'relational_recovery_backups',
    v_backup_id,
    'timeout_safe_rebuild_v15_0_75',
    v_op_id,
    v_device_id,
    jsonb_build_object(
      'before', v_before,
      'after', v_after,
      'backup_id', v_backup_id,
      'doctor_skipped', true
    )
  );

  return jsonb_build_object(
    'ok', coalesce((v_migration->>'ok')::boolean, false),
    'status', case
      when coalesce((v_migration->>'ok')::boolean, false)
        then 'rebuilt_no_doctor_v15_0_75'
      else 'rebuild_finished_check_migration_result'
    end,
    'sync_id', v_sync_id,
    'family_id', v_family_id,
    'backup_id', v_backup_id,
    'before_counts', v_before,
    'after_counts', v_after,
    'reset_result', v_reset,
    'migration_result', v_migration,
    'doctor_skipped', true,
    'legacy_backup', 'JSON trước khi sửa đã được lưu trong relational_recovery_backups.backup_data.',
    'important', 'V15.0.75 không chạy duplicate Doctor sau rebuild.',
    'normal_app_write_mode', 'timeout_safe_rebuild_no_doctor_v15_0_75'
  );
exception when others then
  return jsonb_build_object(
    'ok', false,
    'status', 'failed',
    'sync_id', v_sync_id,
    'family_id', v_family_id,
    'message', sqlerrm,
    'sqlstate', sqlstate,
    'doctor_skipped', true,
    'version', '15.0.75'
  );
end;
$$;

grant execute on function public.myb_emergency_rebuild_relational_from_legacy_v1575(text, boolean) to anon, authenticated;

-- 4) Giữ tên RPC cũ nhưng trỏ sang bản V15.0.75 NO-DOCTOR.
create or replace function public.myb_rebuild_relational_from_deduped_legacy(
  p_sync_id text default 'main',
  p_write_clean_legacy boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.myb_emergency_rebuild_relational_from_legacy_v1575(p_sync_id, p_write_clean_legacy);
end;
$$;

grant execute on function public.myb_rebuild_relational_from_deduped_legacy(text, boolean) to anon, authenticated;

comment on function public.myb_relational_fast_duplicate_doctor(text) is 'V15.0.75 constant-time safe Doctor: no table access, avoids 57014.';
comment on function public.myb_relational_milk_identity_doctor(text) is 'V15.0.75 compatibility Doctor routed to timeout-safe constant response.';
comment on function public.myb_emergency_rebuild_relational_from_legacy_v1575(text, boolean) is 'V15.0.75 backup + dedupe + reset + migrate, no post-migration Doctor; statement_timeout disabled for explicit emergency operation.';
