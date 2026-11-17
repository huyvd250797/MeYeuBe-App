# MeYeuBe V17.22.33 — Mid-Autumn Card Motion Fidelity

Release details: `RELEASE_NOTES_V17.22.33.md`. This release is based on the supplied V17.22.31 source; preserves all app features and theme settings. No database migration.

## Deployment

Deploy the **complete `dist/` directory**, including `assets/`, `src/features/seasonal/art/`, `index.html`, `sw.js`, `build.json`, icons and `manifest.webmanifest`. Keep the entire directory structure so PWA cache and animated WebP paths remain valid.

## Testing

Run `npm ci && npm test` in an environment supporting the project's dependencies. The focused test can run without extra modules: `node tests/midautumn-card-motion-v172233.cjs`.

## Motion assets and user preview

- `src/features/seasonal/art/midautumn-star-motion-v33.webp` — star lantern (transparent animated WebP).
- `src/features/seasonal/art/midautumn-moon-motion-v33.webp` — moon, clouds and sky lanterns (transparent animated WebP).
- `previews/*.gif` — standalone scene previews with the source photo under the animated layer. Preview images are not used as the app UI.

The actual app overlays the transparent animation **inside the baby card only**, leaving its live labels, portrait, controls, header, other cards and navigation rendered by the application.
