# HVUS v1.0 — Release Checklist V10.8.0

## Acceptance Criteria
- [x] AC file created before release.
- [x] Web Push support detection.
- [x] iPhone/iPad Home Screen requirement.
- [x] Permission request only from user action.
- [x] Per-device subscription persistence.
- [x] Enable/disable notification.
- [x] Per-device alert type preferences.
- [x] Targeted test notification.
- [x] Smart Alert push dispatch.
- [x] Duplicate prevention.
- [x] Notification click opens Alert Center.
- [x] Expired subscription cleanup and re-register state.

## Backend
- [x] `push_subscriptions` SQL.
- [x] `push_delivery_log` SQL.
- [x] Edge Function `send-push`.
- [x] VAPID secret setup guide.
- [x] HTTP 404/410 cleanup.

## Regression
- [x] Realtime JSON Sync retained.
- [x] Manual Cloud Sync retained.
- [x] Smart Alert retained.
- [x] Dashboard, Timeline, Milk Inventory retained.
- [x] Avatar retained.
- [x] Export/Import retained.
- [x] localStorage key `meYeuBePWA_v4` retained.

## Release Gate
- [x] `release_check.py` PASS.
- [x] `test_v1080.py` PASS.
- [x] JavaScript syntax PASS.
- [x] Version consistency PASS.
- [ ] Manual production test: SQL run + Edge Function deployed + iPhone PWA notification received.
