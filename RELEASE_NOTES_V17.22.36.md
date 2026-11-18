# V17.22.36 — School Opening Green Motion Fidelity

## Scope
- Preserved the existing original `school-photo-hero-v3.webp` background, green UI palette, card layout and all saved data.
- Added two independent live animation rigs **inside the Bé Bún hero photo only**, also visible in the existing theme settings preview.
- Kept saved motion keys `chalk` and `plane` for cloud cross-device configuration compatibility.

## Mode 1 — Hoa phượng rơi & nắng sân trường (`chalk`)
- 26 staggered phoenix-red petals of varying shapes, rotation and wind drift.
- Three slow natural sunlight beams and 13 asynchronous golden glints.
- Uses a continuous clock with per-object fade-in/out; no scene-wide frame reset.

## Mode 2 — Máy bay giấy lượn & cờ khai giảng (`plane`)
- Two staggered paper airplane flights following curved paths using the existing alpha-cutout school paper plane asset.
- Seven small fabric pennants gently swaying on a fixed line, 10 phoenix petals and 8 sparkle points.
- Animated content is clipped within the original photograph; no header, text, buttons or other cards animated.

## Engineering
- Each mode draws on a dedicated high-DPI photo overlay canvas through `requestAnimationFrame` targeting display refresh (60Hz on supported screens). Actual frame rate depends on device performance.
- Drawing stops when the app hides the card or the user selects Still; honors `prefers-reduced-motion`.
- Assets remain local and the production `dist/` bundle keeps PWA pre-cache coverage.
- No new database schema or SQL migration.
