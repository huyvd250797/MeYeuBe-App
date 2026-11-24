# V17.22.63 — Validation Report

## Verified locally
- `npm run build`: successful production bundle for V17.22.63.
- `node tests/medication-reminder-v1761.cjs`: pass (independent reminders, snooze and completion).
- `node tests/medication-reminder-v1762.cjs`: pass (skip and global overlay).
- `node tests/medication-reminder-v1763.cjs`: pass (no Cloud read before Splash ready, silently defer during realtime, accept current settings).
- `node tests/settings-gate-v1763.cjs`: pass (wait for temporary realtime refresh, reject family changes).
- `node tests/service-worker.cjs`: 4/4 pass.
- `node tests/build-worker.cjs`: 13/13 pass.
- `package.json` / `package-lock.json` versions aligned.
- Seasonal source assets unchanged from V17.22.62.

## Existing limitations in this environment
- Browser-integrated test dependencies `jsdom`, `fake-indexeddb`, `@electric-sql/pglite` are not installed here; end-to-end browser/SQL test suites were not run.
- Existing release preflight flags four historical migration SQL files; these historical files were preserved.
- Existing PWA update test `tests/pwa-update-v172252.cjs` contains a hardcoded older version expectation and is not evidence of a V17.22.63 regression.
- Live Supabase reconciliation and iOS Safari device testing remain to be checked after deployment.

## Deployment
- No new database schema or migration. Deliver ZIP source only.
