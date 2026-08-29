-- Emergency rollback only. Do NOT run during normal V15.0.76 operation.
begin;
drop trigger if exists trg_myb_v1576_block_legacy_json_write on public.meyeube_sync;
commit;
