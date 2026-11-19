# MeYeuBe V17.22.51 — Tet Hero Clean Artwork

## Changes
- Replaces the damaged Tết Nguyên đán card-scene pictures in both motion modes (`blossoms` and `lantern`) with new clean scene layers from the approved reference artwork: yellow apricot blossoms, traditional wooden house, lanterns, bánh chưng, watermelon and festive foliage.
- The clean scene contains **no baked-in avatar, child details, bell, calendar, feeding time, or circular notification cutouts**. All UI elements remain provided dynamically by the app.
- Preserves existing independent canvas animations (falling apricot petals / swaying lanterns) and the still mode.
- Uses new `v51` image filenames and a new PWA cache namespace to prevent stale-image reuse.
- Does not modify any other theme assets, color system, or UI layouts.

## Validation
- Production build and structure checks.
- Tết mode/asset smoke test and PWA precache reference checks.
- Full integration test coverage depends on locally installed devDependencies (see test output).

No SQL migration.
