-- Mẹ Yêu Bé V15.0.76 · RETIRE LEGACY JSON DB
-- Run LAST, only after 01 + 02 + 03 succeed and V15.0.76 has been deployed.
-- Keeps the existing meyeube_sync row as a read-only emergency backup, but blocks
-- every future INSERT/UPDATE/DELETE so an old device cannot resurrect corrupted JSON.

begin;

create or replace function public.myb_v1576_block_legacy_json_write()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  raise exception using
    errcode='55000',
    message='Mẹ Yêu Bé V15.0.76 relational-only: public.meyeube_sync is retired/read-only. Update the device to V15.0.76.';
end;
$$;

drop trigger if exists trg_myb_v1576_block_legacy_json_write on public.meyeube_sync;
create trigger trg_myb_v1576_block_legacy_json_write
before insert or update or delete on public.meyeube_sync
for each row execute function public.myb_v1576_block_legacy_json_write();

comment on trigger trg_myb_v1576_block_legacy_json_write on public.meyeube_sync
is 'V15.0.76 cutover guard: prevents legacy monolithic JSON writes after relational-only cutover.';

commit;
