# MeYeuBe V17.22.40 — Halloween GIF Scene Fidelity Refinement

## Purpose
Address the visual mismatch between the two approved Halloween motion GIFs and V17.22.39 runtime effects.

## GIF reference 1 — Pumpkin and flying bats (`pumpkin`)
- Enlarged and repositioned six recognizable flying-bat silhouettes with natural wing flaps and independent curved, oscillating paths in the nighttime sky.
- Increased photo-aligned pumpkin-eye and mouth illumination; added quick eye shutter blinks over the actual triangular apertures without distorting the original photo or witch hat.
- Made the lantern lighting brighter and the leaf drift and warm embers more visible.
- Removed the unrelated cute purple bat sticker so the scene resembles the approved black-bat preview.

## GIF reference 2 — Ghosts and glowing lantern (`bats`)
- Added three moving translucent ghosts using an image sprite carefully extracted from the SAME Halloween background art; no flat geometric emoji-style ghost.
- Added soft light trails and mist and increased photo-aligned lantern flicker and floating autumn leaves.
- Reduced the secondary bats to two silhouettes to keep this scene distinct.

## Runtime behavior
- All animation remains strictly clipped within the Bé Bún illustrated photo scene, never outside the card.
- Keeps original Halloween purple scene and static app UI unchanged.
- Native Canvas with requestAnimationFrame and maximum approximately 60 renders/second; not a GIF or video.
- Keeps existing `pumpkin` and `bats` mode IDs, still/off mode, visibility pause, and PWA asset cache.

## Delivery
- Source + built `dist/`; no SQL migration.
- Device FPS and visual parity need final verification after deployment on iPhone.
