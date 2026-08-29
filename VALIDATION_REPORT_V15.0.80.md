# Validation Report — MeYeuBe V15.0.80

## Build
- Version: `15.0.80`
- Codename: `EgressOptimizationIncrementalRealtime`
- Baseline: V15.0.79 user-provided source ZIP
- Source of truth: Supabase relational tables only

## Egress changes verified
- Removed the V15.0.79 `45,000 ms` full-database safety refresh.
- Removed duplicate full bootstrap behavior; runtime schedules one bootstrap only.
- With a valid relational cache, boot performs `myb_relational_revision_v1580` only.
- Realtime catch-up uses `myb_relational_changes_since_v1580` then `myb_relational_export_incremental_v1580`.
- Successful writes call `myb_relational_apply_changes_v1580` then refresh only changed sections.
- Presence reduced from 90s to 180s and includes revision for lightweight missed-event recovery.
- Manual full pull remains available intentionally as a recovery action.

## Server changes
- `myb_realtime_events.changed_entities text[]`
- `myb_relational_export_state_v1580`
- `myb_relational_revision_v1580`
- `myb_relational_changes_since_v1580`
- `myb_relational_export_incremental_v1580`
- `myb_relational_apply_changes_v1580`
- `myb_relational_presence_v1580`

## Consistency safeguards retained
- Idempotent `operation_id`
- Family revision conflict guard
- Capture-phase anti-double-click
- Relational tables only; no legacy JSON migration/doctor/delta/read-mode/write-queue/production-push runtime
- Vietnamese decimal comma health display retained

## Race-condition guard
Incremental refresh only advances the client's covered revision to the revision represented by the change-map/write result. If another device commits while the incremental export is running, that later revision remains eligible for the next catch-up instead of being silently skipped.

## Runtime tests
1. `node --check` passed for `app.js`, `boot.js`, `relational-v1580.js`, `sw.js`.
2. Cached boot mock:
   - Network calls: `myb_relational_revision_v1580`
   - Full export calls: `0`
3. Incremental catch-up mock:
   - `myb_relational_changes_since_v1580`
   - `myb_relational_export_incremental_v1580`
   - Partial diary payload merged correctly
   - Revision advanced from 5 -> 6
4. Empty-cache boot mock:
   - Exactly one `myb_relational_export_state_v1580` full pull
5. Release checker: `RELEASE CHECK PASSED: V15.0.80`

## Important behavior
The incremental export reuses the canonical V15.0.76 relational exporter internally so mapping remains compatible, but it returns only requested top-level sections over the network. This release targets **egress/network reduction** first; it does not claim to reduce database CPU by the same proportion.

A one-time full fallback may occur after upgrading if the missed revision range contains old V15.0.79 realtime events that do not have `changed_entities`. After all active devices run V15.0.80, new commits include change metadata and normal Realtime catch-up stays incremental.
