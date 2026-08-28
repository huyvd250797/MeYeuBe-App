# V15.0.76 · Relational Only Cutover

Run SQL in this order:

1. `supabase/v15.0.76-relational-only/01_SCHEMA_PATCH_V15.0.76_RELATIONAL_ONLY.sql`
2. `supabase/v15.0.76-relational-only/02_RESTORE_CLEAN_DB_2026-08-28_DIRECT_TABLES.sql`
3. `supabase/v15.0.76-relational-only/03_RUNTIME_RELATIONAL_ONLY_RPC_V15.0.76.sql`
4. Deploy V15.0.76 and verify the app reads correct data from tables.
5. `supabase/v15.0.76-relational-only/04_LOCK_LEGACY_JSON_WRITES_V15.0.76.sql`
6. `supabase/v15.0.76-relational-only/05_VERIFY_RELATIONAL_CUTOVER_V15.0.76.sql`

Do not run the old JSON Rescue/Migration tools after cutover.
