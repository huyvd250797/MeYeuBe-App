# MeYeuBe V17.22.34 — Mid-Autumn Seamless 60fps Motion

## Summary
- Replaced the Mid-Autumn card motion implementation from looping animated image overlays to native canvas animation inside the baby card only.
- Improved the visual quality of the moon in the Mid-Autumn clouds mode with a softer, more festive look and fewer heavy crater marks.
- Kept the rest of the dashboard completely static: header, avatar, profile text, action icons, lower cards and bottom navigation do not animate.

## Included behavior
- `starLantern`: bright star-lantern glow, stronger live sparkle, fireflies and mooncake shimmer.
- `clouds`: smooth full moon, drifting clouds, sky lantern rise, warm sparkles and mooncake shimmer.
- `still`: no motion.

## Technical changes
- Mid-Autumn no longer mounts `midautumn-star-motion-v33.webp` / `midautumn-moon-motion-v33.webp` as looped animation layers.
- Motion is now rendered directly on the existing photo overlay canvas.
- Mid-Autumn uses per-frame `requestAnimationFrame` drawing for smoother continuous playback, while other seasonal themes keep the existing mobile-friendly cap.
- Existing visibility pause and still/reduced-motion behavior remain supported.

## Notes
- No database migration.
- Deploy as static web build using the included `dist/` output.
