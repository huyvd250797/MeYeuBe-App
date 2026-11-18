# MeYeuBe V17.22.43 — Theme Hero Image Clarity Fix

## Summary
- Fixed the recurring blurry / cut-looking upper-right area seen across seasonal baby-card theme images.
- Cleaned recurring edge-strip corruption on the seasonal hero artwork set.
- Reinforced image rendering in CSS so seasonal hero images remain clear and stable on app display.

## What was updated
- Reprocessed all `*-photo-hero-*.webp` assets with a safe-framing rebuild so the displayed hero art avoids corrupted or blurry edge zones while keeping the main composition intact.
- Added rendering-stability CSS on seasonal hero art / overlay elements.
- Kept all seasonal motion systems and card-only animation logic intact.

## Coverage
- Applied to all seasonal hero themes currently bundled in the app, not just the two sample screens.

## Notes
- No SQL migration.
- Production build included in `dist/`.
