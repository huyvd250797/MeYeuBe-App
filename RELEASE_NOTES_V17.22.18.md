# MeYeuBe V17.22.18 — Reunification Day Daylight Motion Fix

## Source baseline
V17.22.17, upgraded without altering the other 19 seasonal themes or baby-care data workflows.

## Corrected scene
- Rebuilt a clear **daytime blue sky** and full Dinh Doc Lap from the previously approved screen, with the existing rooftop Vietnamese flag completely visible.
- Removed the former dark/rectangular sky band and replaced it with transparent image-edge fades, preserving legibility on the left.
- Isolated all overlay objects within the **original baby hero card**; no layout displacement.

## Two approved effects
A (`flag`): pre-rendered photographic cloth deformation as **96 continuous full-flag frames**; no slicing into vertical strips. A large red-star cloth flows across the upper right of the scene, and a smaller waving flag remains anchored to the rooftop pole. The building and garden never move.

B (`ribbon` legacy configuration key): transparent photography-derived **pink, gold, white, and blue fireworks** blooming on the actual daytime sky; no black background. Bursts are deliberately clipped to the upper sky **above the rooftop flag**. `ribbon` is retained as an internal saved configuration ID for backward compatibility, but users see "Pháo hoa trên bầu trời".

`still`: daytime palace photograph including its rooftop flag; no overlay motion.

## Compatibility
- Existing saved A/B/Tĩnh settings, cloud theme sync, cache/offline behavior, and all 20 preset definitions preserved.
- Removed the causes of visible cut lines and dark fireworks blocks.
- Images and atlases pre-cached in `sw.js` with build version 17.22.18.

## Validation scope
Production build, stand-alone theme test, targeted motion and alpha-matte tests, release structure and ZIP integrity. Not a substitute for Safari iPhone visual verification after deployment.
