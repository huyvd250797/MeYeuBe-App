# MeYeuBe V17.22.63 — Medication Reminder Cloud Sync Guard Fix

## Fixes
1. **Splash Loading:** Medication schedule background refresh no longer calls the settings write guard before the Cloud dashboard has completed startup. No false “Cấu hình dữ liệu đã thay đổi” toast while loading.
2. **Concurrent realtime:** Medication refresh waits for an idle, ready, correct-family settings state and silently defers transient busy periods instead of showing “Đang cập nhật dữ liệu từ thiết bị khác” followed by a second read error.
3. **Save settings:** Interactive settings writes briefly wait for in-progress realtime reconciliation to finish rather than failing immediately on a temporary mutex conflict. Real family changes and pending writes remain protected.
4. **Settings consistency:** Apply Cloud responses only after verifying target, and refresh the baseline of non-dirty settings forms to avoid stale expected revisions after a safe background update.

## Preserved
- Multiple independent medication/vitamin schedules, snooze 10 minutes, skip for today without care entry, and medicine care entries only after acknowledged save.
- Existing fixed-bottom navigation, seasonal visual assets and dashboard.
- Existing Supabase schema; **no SQL migration**.

## Validation
- Medication regression suites V17.22.61, V17.22.62, V17.22.63.
- Source syntax and production build, PWA service worker, and archive integrity checks.
- Actual iPhone Safari + live Supabase production concurrency must be checked after deployment.
