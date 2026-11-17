# MeYeuBe V17.22.21 — Doan Ngo Motion and PWA Update Reliability

Source baseline: V17.22.20.

## Seasonal motion
- Corrects a real rendering defect: the Doan Ngo overlay used 816 × 381 coordinates while the actual photo is 548 × 215.
- Applies a shared right/bottom, contain-fit coordinate transform on dashboard and theme preview, maintaining layout and original image sharpness.
- Motion A **Chuồn chuồn bay**: two independent transparent photo sprites; no synthetic dragonfly geometry.
- Motion B **Lá xanh lay động và rơi**: anchored canopy leaves and falling photographic leaves. All motion stays inside the original baby hero canvas; the other mode's sprites do not load.
- Static mode draws no animated sprite. Other nineteen themes untouched.

## Update behavior
- Synchronizes build.json, manifest.webmanifest, package-lock.json, boot.js, service worker, source and production build to V17.22.21.
- Only a strictly newer server build creates an update notice; waiting old service workers alone are not considered proof of an update.
- Update action requires an up-to-date waiting worker or verified matching index.html before navigation; blocked drafts and pending writes remain protected.
- Same-target update attempts and dismissals do not show recurring prompts within the same browser session. A later version can still prompt.
- Does not clear IndexedDB or baby data.

## Validation
- Node targeted standalone animation, update lifecycle regression, 20-theme check, production build, release check, and ZIP integrity.
- Real device Safari verification remains necessary after deployment.

- Uses new hero asset v5 without the static baked-in dragonfly, ensuring B and Still cannot show the A insect by mistake.
