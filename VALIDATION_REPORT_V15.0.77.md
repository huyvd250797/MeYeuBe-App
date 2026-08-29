# Validation Report — Mẹ Yêu Bé V15.0.77

## Runtime
- `app.js`: syntax OK.
- `boot.js`: syntax OK.
- `sw.js`: syntax OK.
- `relational-v1577.js`: syntax OK.
- `release_check.py`: `RELEASE CHECK PASSED: V15.0.77`.

## Database-first guarantees
- Business writes still use `myb_relational_apply_changes_v1576` directly against relational tables.
- Business reads still use `myb_relational_export_state_v1576`.
- `meyeube_sync` is not restored to runtime and remains legacy/read-only under the V15.0.76 guard.
- Realtime subscribes only to `public.myb_realtime_events`, a no-business-payload signal table.
- A signal is created in the same transaction as the `devices.last_seen_at` upsert used by every V15.0.76+ direct write batch.
- After a signal, the client waits for the local save chain, drains the direct queue, then refetches the relational database.
- The flush pipeline now waits for an active flush and drains newly queued batches before realtime refetch, preventing a newer local edit from being overwritten by an earlier server snapshot.

## Realtime resilience
- Debounce/coalesce repeated signals.
- Defer refresh while a form/input/modal is active.
- Refetch on app foreground.
- Refetch after network reconnect.
- Safety refresh every 60 seconds while visible/online.
- Sender also refetches server canonical state after its committed signal.

## SQL patch
- `SUPABASE_REALTIME_V15.0.77.sql`: ~4 KB; suitable for Supabase SQL Editor.
- Idempotent table/index/policy/function/trigger/publication setup.
- Final verification query returns: `realtime_table_ok`, `trigger_ok`, `publication_ok`.
