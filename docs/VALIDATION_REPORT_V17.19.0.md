# V17.19.0 — Validation

66/66 suites PASS, no baseline exemptions. Full runner and affected final reruns: build, album SQL/runtime, prior memory UX, production runtime, design system, release syntax and packaging. Outputs in TEST_RESULTS_V17.19.0.json.

- New migration applied and reapplied on real PGlite PostgreSQL. Covers create/replay, OCC, add 105 records, paginated library/member retrieval, selected thumbnail and foreign-photo rejection, multi-album membership, custom independent order, unlink/delete album retaining memories, photo-delete cover fallback, memory-delete cleanup and service-only access.
- New memory save job with album IDs attaches in same commit; deleted album produces warning, memory kept.
- Source runtime uses actual memory-drive TypeScript handler and actual SQL. Tests create, multi-add, thumbnail persistence and second-device read, conflict with retained form, lost ACK replay via IndexedDB, create-from-album preselection and same-commit link, pointer reorder persisted in SQL, unlink/delete without any Google API request.
- Inherited production runtime 111 checks PASS, including + entry and prior care/milk/packing. Third-party lock unchanged.
- Actual Chromium mobile 390px and desktop 1100px, light/dark screenshots visually inspected. Tested choosing thumbnail via radio and persisted SQL, multi-select library, CDP touch hold/drag, membership checkbox. Browser images are fixture SVGs and image requests are mocked; no real baby photos or Drive data accessed. No uncaught browser errors or horizontal overflow at inspected sizes. Radio layout adjusted after visual review.
- This is not physical iPhone/Safari QA. No live Drive replace/delete test, no production Supabase migration, no push/deploy in task.
- Update SQL + Edge + frontend; Google secrets unchanged. No login added. Album operations only metadata; existing Google media workflow preserved.
- ZIP excludes node_modules/dist, logs, browser binaries/screenshots, and secrets. Release builder checks allowlist, syntax and checksum/readback.
