# V17.22.48 Validation Notes

- Production bundle build: PASS (`npm run build`).
- Source release structure and JavaScript syntax: PASS (`npm run check`).
- Isolated Chromium DOM test of 20 theme splash preview mappings: 20/20 PASS.
- Isolated Chromium DOM test: dashboard preview, return to settings with selected draft retained, restore active theme: PASS.
- Source media checksum comparison versus supplied V17.22.47: 380/380 existing seasonal art files identical; two new backdrop assets added.
- Both new backdrop images included in production `dist` and PWA precache.
- No SQL migration.

Limitations: Full-app page navigation via localhost/file was blocked by the test environment. Browser UI validation used an isolated DOM harness with the real seasonal model and UI controller and stubbed surrounding application services. FPS and visual verification in Safari/iOS after deployment remain unverified.
