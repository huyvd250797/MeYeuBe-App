# Validation Report — Mẹ Yêu Bé V15.1.0

Date: 2026-09-12
Codename: CloudSyncCleanupMilkReturnFix

## Scope validated

- Cloud Sync UI no longer exposes legacy migration/cutover cards.
- Stored-milk feeding ledger returns milk to inventory when an edited feeding no longer consumes stored milk.
- Manual milk-bag cancellation remains authoritative.
- Transfer-derived depletion remains authoritative.
- Runtime JavaScript syntax is valid.
- `index.html` parses successfully and has balanced `<div>` tags.

## Regression test

`node test_v1510_stored_feed_return.js`

Result: **16 PASS / 0 FAIL**.

Key scenarios:

1. Stored feed consumes 100/100 ml → bag remains 0 ml / Đã sử dụng hết.
2. Edit the same feed to direct breastfeeding → bag returns to 100 ml / Đang bảo quản.
3. Previously stuck partial inventory is recalculated to the original available amount when no event consumes it.
4. Manually canceled bag (`cancelReason` / `canceledAt`) stays closed.
5. Feed-derived discard metadata is cleared when that feed no longer consumes the bag.
6. A bag depleted by a transfer remains Đã chuyển hết.
7. Removed Cloud Sync UI labels are absent from `index.html`.

## Syntax checks

Passed:

- `node --check app.js`
- `node --check boot.js`
- `node --check sw.js`
- `node --check relational-v1577.js`

## Legacy release checker note

`release_check.py` still reports pre-existing baseline inconsistencies from the provided V15.0.77 source: missing historical acceptance files (`AC_V15.0.74.md`, `AC_V15.0.75.md`, `docs/RELATIONAL_REALTIME_V15_0_77.md`) and a rule that forbids `supabase_setup.sql` even though that file is present in the supplied package. These are not introduced by V15.1.0 and were left untouched to avoid unrelated changes.
