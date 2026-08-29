# Validation Report — MeYeuBe V15.1.0

## Build
- Version: 15.1.0
- Codename: RealtimeConnectionStabilityFix
- Baseline: V15.0.80 Egress Optimization + Incremental Realtime
- Database schema change: No

## Realtime lifecycle fix
- Added monotonically increasing `realtimeGeneration`.
- Every channel callback validates generation + channel + client identity before changing state.
- `detachRealtimeChannel()` invalidates the generation before calling `removeChannel()`.
- Delayed `CLOSED` callbacks from removed channels are ignored as stale.
- Only one reconnect timer may exist at a time.
- Unexpected `CHANNEL_ERROR`, `TIMED_OUT`, and current-channel `CLOSED` still reconnect with exponential backoff.
- Duplicate `startRelationalRealtime()` calls reuse the current channel for the same family/sync key.

## Retained safety architecture
- Supabase relational tables remain the only source of truth.
- Incremental Realtime and change-map RPCs from V15.0.80 remain active.
- No 45-second full DB polling.
- No legacy JSON migration, Doctor, Delta Sync, Read Mode, persistent Write Queue, or Push Primary runtime.
- Conflict Guard/idempotent write path remains active.

## Static checks
- `node --check app.js`: PASS
- `node --check boot.js`: PASS
- `node --check relational-v1510.js`: PASS
- `node --check sw.js`: PASS
- `release_check.py`: PASS
- Service Worker asset list points to `relational-v1510.js`.
- No obsolete `relational-v1580.js` shipped.

## Expected status behavior
Normal network:
`CONNECTING → REALTIME` and stays `REALTIME`.

Actual disconnect:
`REALTIME → RETRYING → CONNECTING → REALTIME`.

Intentional/stale channel close:
No reconnect is scheduled by the stale callback.
