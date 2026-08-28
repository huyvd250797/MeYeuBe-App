-- V15.0.77 verification. Does not modify business data.
select
  to_regclass('public.myb_realtime_events') as realtime_table,
  (select count(*) from pg_trigger where tgname='trg_myb_devices_realtime_v1577' and not tgisinternal) as trigger_count,
  (select count(*) from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='myb_realtime_events') as publication_count,
  (select count(*) from pg_policies where schemaname='public' and tablename='myb_realtime_events' and policyname='myb_realtime_events_read_signal') as read_policy_count,
  (select count(*) from public.myb_realtime_events where created_at > now() - interval '24 hours') as signals_last_24h;
