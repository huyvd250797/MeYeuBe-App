-- Mẹ Yêu Bé V15.0.76 · VERIFY RELATIONAL CUTOVER
-- Read-only checks. Expected family Sync ID = main.

select public.myb_relational_export_state_v1576('main') as relational_state;

select
  (select count(*) from public.health_members where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as health_members,
  (select count(*) from public.care_events where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as care_events,
  (select count(*) from public.feed_events where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as feed_events,
  (select count(*) from public.pump_events where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as pump_events,
  (select count(*) from public.milk_items where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as milk_items,
  (select count(*) from public.feed_milk_sources where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as feed_milk_sources,
  (select count(*) from public.diary_entries where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as diary_entries,
  (select count(*) from public.milestones where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as milestones,
  (select count(*) from public.appointments where family_id=public.myb_stable_uuid('family:main') and deleted_at is null) as appointments;

-- Expected from clean backup:
-- health_members=3, care_events=1570, feed_events=550, pump_events=270,
-- milk_items=273, feed_milk_sources=602, diary_entries=158,
-- milestones=42, appointments=5.

select
  count(*) filter (where abs(coalesce(mi.remaining_ml,0)-coalesce(mb.remaining_ml,0)) > 0.001) as milk_balance_mismatch,
  count(*) filter (where mi.remaining_ml=0 and coalesce(mi.legacy_status,'')='Đã sử dụng hết') as used_up_zero_items
from public.milk_items mi
join public.milk_item_balances mb on mb.milk_item_id=mi.id
where mi.family_id=public.myb_stable_uuid('family:main') and mi.deleted_at is null;

-- Critical recent bags from the uploaded clean backup.
select legacy_id, short_code, amount_ml, remaining_ml, legacy_status, storage, container_name, expire_at
from public.milk_items
where family_id=public.myb_stable_uuid('family:main')
  and deleted_at is null
  and legacy_id in ('260828-02','260828-03','260828-04')
order by legacy_id;

select tgname as legacy_json_guard
from pg_trigger
where tgrelid='public.meyeube_sync'::regclass
  and tgname='trg_myb_v1576_block_legacy_json_write'
  and not tgisinternal;
