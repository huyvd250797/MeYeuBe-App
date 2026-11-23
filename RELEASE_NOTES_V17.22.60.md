# MeYeuBe V17.22.60 — Catalog Conflict Resolution & Edit Sheet

## Fixed
- Edit bottle/bag opens a bottom sheet with original form fields. The page stays at its original scroll position, and form input is not duplicated.
- Preflight fetches a fresh server snapshot after pending writes flush, then writes against the live record. If another device changed name/kind/capacity/note/status, saving is rejected to avoid overwriting.
- SQL facade compares catalog user-editable fields instead of all JSON metadata, eliminating metadata-only false CONFLICT. The V17.22.59 capacity/capacityMl consistency safeguard remains intact.
- A successful UI message still requires a durable server read confirming the new record. On failure, the editor remains open with entered values.

## Deployment
- Run `supabase/migrations/20261123_1760_catalog_update_conflict_fix.sql` once via Supabase SQL Editor before deploying the new app.
- No destructive schema changes or milk data deletion.

## Known limitations
- Production Supabase cannot be reached from the provided source archive; live database update success must be verified after deploying the SQL migration.
