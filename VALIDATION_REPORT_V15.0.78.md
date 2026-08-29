# Validation Report — Mẹ Yêu Bé V15.0.78

## Result
PASS — release checker completed successfully.

## Weight fix
- Health decimal inputs accept both `5,2` and `5.2`.
- UI canonical display for health decimal values is Vietnamese comma, e.g. `5,2 kg`.
- `public.myb_weight_g()` now treats a unitless health weight <= 100 as kilograms.
- `5,2` / `5.2` -> `5200 g` in relational DB -> `5,2 kg` in UI.
- Hotfix includes a conservative repair of only the latest obviously invalid measurement when `health_members.weight_text` provides a safe kg reference.

## Legacy cleanup
Removed from Cloud Sync UI and app runtime:
- Migration JSON -> Relational DB
- Relational Migration Doctor
- Relational Delta Sync
- Relational Read Mode
- Relational Write Queue
- Production Push / “Đẩy dữ liệu chính thức”
- Milk Identity Doctor / Data Rescue legacy runtime

Historical migration/recovery SQL bundles, old runtime `relational-v1577.js`, backup JS copies and unused extracted scripts are not shipped in this release.

## Runtime architecture
`UI -> myb_relational_apply_changes_v1576 -> relational tables -> COMMIT -> authoritative refetch`

Realtime remains:
`myb_realtime_events -> device receives signal -> myb_relational_export_state_v1576 -> render`

No persistent business write queue is present in `relational-v1578.js`. Local cache is display-only.

## Automated checks
- `node --check app.js`: PASS
- `node --check boot.js`: PASS
- `node --check relational-v1578.js`: PASS
- `node --check sw.js`: PASS
- Legacy handler/UI string scan: PASS
- Service worker caches `relational-v1578.js`: PASS
- `release_check.py`: `RELEASE CHECK PASSED: V15.0.78`
