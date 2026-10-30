# V17.18.2 — Validation

64/64 suites PASS: inherited 63-suite full run plus new memory-ux suite and final reruns of build, design-system, production-runtime, memories, release structure and packaging. No baseline exemptions. TEST_RESULTS_V17.18.2.json contains outputs.

- New tests cover tap vs scroll vs hold, reordering existing DOM nodes, launch suppression while arranging, outside-save and restoration in a fresh DOM/localStorage; no Cloud/event write.
- Memory UX tests cover Vietnamese search without accents, timeline/grid, scroll vs swipe, swipe-to-edit, no manual name/dob fields in either editor, auto payload from settings, refreshed official-name preference, no silent rewrite of existing rows, canceled deletion does not write.
- Production runtime 111 checks PASS, including the actual + grid opening memory editor, existing care/milk/packing flows.
- Actual Chromium headless mobile 390px and desktop 1100px. Screenshots inspected in light/dark for timeline, grid, detail, editor and quick order. Horizontal page width 390/390, no uncaught browser errors. Chromium CDP touch events successfully reveal/edit a swiped row and hold/drag a quick entry, saving the changed order. Fixture images and API only; no real family photos uploaded. Browser fonts lack some emoji; actual iPhone icon rendering remains to be checked.
- This is browser emulation, not a physical Safari/PWA iPhone test. No live Drive replacement/deletion, no push/deploy in this task.
- All 20 backend/config/migration files are byte-identical to the uploaded V17.18.1 source. No new SQL/Edge deployment required for an already updated V17.18.1 installation. Third-party dependencies unchanged.
- Build uses AST parity checks. Source ZIP excludes node_modules, dist, browser binaries, QA screenshots, logs and secrets; checksum/readback verification required by release builder.
