# Validation Report — Mẹ Yêu Bé V15.0.79

## Build
- Version: `15.0.79`
- Codename: `RealtimeReliabilityConflictGuard`
- Baseline: V15.0.78 RelationalCleanupWeightCommaRealtime
- Database model: Relational tables are the only source of truth.

## Runtime checks
- `app.js`, `boot.js`, `relational-v1579.js`, `sw.js`: `node --check` PASSED.
- `index.html` loads `relational-v1579.js?v=15.0.79`.
- Service Worker precaches `relational-v1579.js` and uses build `15.0.79`.
- No V15.0.78/V15.0.77 relational runtime JS is shipped.
- Legacy UI handlers remain removed: Migration JSON, Doctor, Delta Sync, Read Mode, Write Queue, Production Push, Milk Doctor.
- No persistent relational write queue in V15.0.79 runtime.
- Weight decimal-comma fixes from V15.0.78 are retained.

## Reliability implementation
- Server idempotency ledger: `public.myb_idempotent_operations`.
- Per-family optimistic revision: `public.myb_family_runtime_state`.
- Guarded write: `myb_relational_apply_changes_v1579`.
- Guarded read: `myb_relational_export_state_v1579`.
- Presence: `myb_relational_presence_v1579`.
- One V15.0.79 realtime signal after guarded commit; signal carries revision metadata only.
- Old V15.0.78 writes remain detectable during transition through the compatibility device trigger.
- Realtime reconnect uses bounded exponential backoff and authoritative refetch.
- Realtime events are coalesced/debounced before fetch.
- Capture-phase commit-button guard blocks rapid repeat clicks.
- Same snapshot scheduled twice inside 900 ms is coalesced.

## Integrity guard
`SUPABASE_RELIABILITY_V15.0.79.sql` adds NOT VALID CHECK constraints. They enforce future INSERT/UPDATE without doing a full validation scan of historical rows during patch installation:
- milk item amount >= 0
- feed amounts >= 0
- feed milk source used/discard >= 0
- standard milk transactions >= 0 (`adjust` remains allowed to be signed)
- health weight >= 0

## Important behavior
Conflict protection is intentionally **family-revision based**, which is stricter than per-row conflict detection. If another device commits any business change after this device's authoritative read, a stale write is rejected and the client fetches the newest database instead of silently overwriting it.

## SQL prerequisite
Run `SUPABASE_RELIABILITY_V15.0.79.sql` before deploying the V15.0.79 client. If the client is deployed first, it can still read through the V15.0.76 fallback but guarded business writes are intentionally blocked until the V15.0.79 SQL RPCs exist.

## Release check
`release_check.py`: PASSED.
