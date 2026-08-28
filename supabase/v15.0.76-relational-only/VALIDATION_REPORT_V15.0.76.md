# Validation Report — Mẹ Yêu Bé V15.0.76

## Source audit
- JSON source parses successfully.
- careEvents: 1,570; duplicate IDs: 0.
- milkInventory: 273; duplicate IDs: 0.
- milkContainers source: 85; cleaned relational catalog: 32.
- diary: 158; milestones: 42; appointments: 5.
- Obvious milk status/remaining mismatches in clean source: 0.
- Clean backup cutoff: 2026-08-28T09:10:54.828Z (about 16:10 VN time).

## Direct relational restore
- Restore SQL inserts directly into 28 relational tables and never reads `public.meyeube_sync.data`.
- Every INSERT column used by the generated restore was checked against `SUPABASE_SETUP.sql` + V15.0.76 schema patch: no unknown columns remain.
- `migration_batches` was aligned to the actual schema (`source_sync_id`, `source_app_version`, `summary`, etc.).
- Unknown milk container kind is preserved as NULL when the clean backup has no explicit kind/id; no inference from placeholder text `Cần chọn lại bình/túi`.
- Invalid legacy container rows whose names were actually statuses are excluded.
- Restore has count assertions and milk-balance assertions inside one transaction; failed checks roll back.

## Runtime cutover
- `relational-v1576.js`: JavaScript syntax check passed.
- `boot.js`, `app.js`, `sw.js`: JavaScript syntax checks passed.
- Runtime read: `myb_relational_export_state_v1576`.
- Runtime write: `myb_relational_apply_changes_v1576`.
- Front-end V15.0.76 direct runtime has no REST read/write to `meyeube_sync`.
- Smart Alert cron was changed to obtain state through the relational export RPC instead of reading `meyeube_sync`.
- Legacy JSON write lock is provided as step 04; the old row can remain as a read-only emergency archive.

## Release check
`release_check.py`: PASSED V15.0.76.

## Scope note
These validations are offline/static against the provided backup and the supplied application/schema source. They do not execute against the user's live Supabase project. The SQL scripts must still be run in order on Supabase and step 05 must report successful counts/balance before the cutover is considered live-complete.
