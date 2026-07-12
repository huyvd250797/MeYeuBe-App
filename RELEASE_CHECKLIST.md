# HVUS v1.0 — Release Checklist V10.8.1

## Acceptance Criteria
- [x] Test current device targets endpoint.
- [x] Test all devices targets all enabled subscriptions in Sync ID.
- [x] sent=0 is treated as failure.
- [x] Delivery diagnostics returned and logged.
- [x] Expired subscriptions remain handled.

## Regression
- [x] Push registration.
- [x] Smart Alert Rule Engine.
- [x] Realtime JSON Sync.
- [x] Manual Cloud Sync.
- [x] Dashboard.
- [x] Export / Import.
- [x] localStorage key `meYeuBePWA_v4`.

## Manual deployment required
- [ ] Redeploy `supabase/functions/send-push/index.ts`.
- [ ] Verify test current device.
- [ ] Verify test all devices.
