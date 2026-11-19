# MeYeuBe V17.22.50 — Validation

- `npm run build`: PASS.
- `python3 release_check.py`: PASS.
- `node tests/service-worker.cjs`: PASS (4/4).
- Specialized asset, theme label, and PWA cache checks: PASS.
- 19 other themes' artwork files match the user-supplied V17.22.49 archive byte-for-byte.
- Teacher-specific artwork was rebuilt from the approved standalone illustration, not a screenshot crop; image is 548×215 RGBA, WEBP lossless, with a transparent left fade.
- Full seasonal integration test not executed because `jsdom` is missing in this environment. Safari iPhone visual check remains necessary after deployment.
- No SQL migration.
