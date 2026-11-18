# MeYeuBe V17.22.44 — Seasonal Image Clarity System Fix

## Summary
- Fixed seasonal image clarity system-wide instead of only a subset of theme image files.
- Eliminated the common blurred / broken upper-right look by changing real display assets and rendering behavior.
- Shifted all actively used seasonal header and hero/scene assets to new versioned filenames to avoid stale-cache reuse.

## What changed
- Updated all theme header references to new versioned files.
- Updated all theme hero/scene references actually used by the baby card renderer.
- Switched seasonal hero scene art from edge-preserving contain mode to safe cover mode so broken edge zones no longer appear.
- Switched themed app-bar background art to cover mode and removed residual blur/backdrop softening.
- Regenerated versioned image copies for all actively used seasonal header / hero / scene assets.

## Result
- Theme images should now appear clearer overall.
- Top-right blur / cut-looking edge artifacts should no longer dominate the visible area.
- Tet and other special-scene themes are included in this fix.

## Notes
- No SQL migration.
- Production build included in dist/.
