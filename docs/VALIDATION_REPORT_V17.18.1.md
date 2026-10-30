# V17.18.1 — Validation

63/63 suites PASS. Full inherited regression run followed by final reruns of affected memory, production-runtime, build, syntax and packaging suites. No baseline exemptions. Details: TEST_RESULTS_V17.18.1.json.

Production runtime: 111 checks, including the actual + care grid opening memory editor directly and existing diaper/feed/packing flows. Dependency lock unchanged except app version.

Memory tests run actual TypeScript handler and new SQL migration with mocked Google HTTP and PGlite. Covers repeat-safe migration, create/replay, editing all fields without upload, replacement PATCH with same File ID, failed Drive PATCH, DB failure after successful PATCH, blocked concurrent writer, stale version before Drive, permanent DELETE, delete retry on 404 after lost acknowledgement/DB failure, record content erased, lease expiry recovery, anon table restriction. UI test uses jsdom/fake-indexeddb: + entry, preserved immutable command, locked pending form and resume exact request. Watchdog and completion guard prevent unfinished async tests falsely passing.

No Google secrets accessed, no live Drive image replaced/deleted. User confirmed previous V17.18.0 upload works; this does not certify new backend. No Safari/PWA iPhone, screenshot/pixel or real canvas JPEG verification. Update migration and Edge Function before frontend and smoke-test on actual devices.

Drive and SQL are not one atomic transaction. Pending job/retry converges to confirmed state; no claim that deleted/replaced media can be rolled back. Permanent deletion cannot be undone. Older orphan files from V17.18.0 are not purged automatically.
