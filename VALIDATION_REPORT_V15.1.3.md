# Validation Report — MeYeuBe V15.1.3

## Baseline
- User supplied: `MeYeuBe-V15.1.1-Realtime-Stable-State-Fix-Vercel-Ready(4).zip`
- Target: `V15.1.3 — Relational Always-On Realtime Fix`
- Existing relational schema/RPC from V15.0.80 retained. No new SQL required.

## Always-On configuration
PASS — `cloudDefaultCfg()` defaults `enabled=true`.
PASS — `loadCloudConfig()` self-heals saved `enabled=false` to `true`.
PASS — `saveCloudConfigToStorage()` persists `enabled=true`.
PASS — Sync ID is normalized to `main` on every device.
PASS — Missing URL/key fall back to packaged Supabase project URL/publishable key.
PASS — Cloud UI no longer exposes a functional On/Off toggle.
PASS — Sync ID UI is read-only `main`.

## Multi-device / family safety
PASS — relational runtime independently forces `enabled=true` and `syncId=main`.
PASS — `enabled()` no longer depends on a localStorage toggle.
PASS — fresh devices automatically bootstrap relational DB when online.
PASS — cached family is compared with server `family_id` for Sync ID `main`.
PASS — mismatched/unknown family cache triggers one authoritative full pull instead of merging two families.

## Realtime stability carried forward
PASS — one family = one Realtime channel for the page lifetime.
PASS — Supabase owns socket reconnect/rejoin; no app forced channel recreation loop.
PASS — online/foreground/pageshow reuses the existing channel and performs lightweight catch-up.
PASS — Realtime data catch-up failure does not restart the socket.
PASS — no periodic 45-second full DB polling.

## Legacy runtime isolation
PASS — relational-only flag is set before `app.js`.
PASS — legacy Supabase JSON Cloud DB Mode is prevented from installing.
PASS — legacy JSON merge/tombstone authority is prevented from installing.
PASS — legacy QuietCloudToast runtime is prevented from installing.
PASS — legacy realtime data/cloud authority patches are prevented from installing.
PASS — legacy persistent Cloud Save Queue is prevented from installing.

## Data safeguards retained
PASS — V15.0.80 incremental RPC path retained.
PASS — V15.0.79 idempotency + revision conflict guard retained.
PASS — decimal weight UI fix retained (`5,2 kg`).
PASS — V15.0.80 self-healing SQL file retained in package for reference; no rerun required.

## Automated checks
- `node --check app.js` — PASS
- `node --check boot.js` — PASS
- `node --check relational-v1513.js` — PASS
- `node --check sw.js` — PASS
- Always-On old-config simulation (`enabled=false`, `syncId=be-bun-main`) → `enabled=true`, `syncId=main` — PASS
- `release_check.py` — PASS
