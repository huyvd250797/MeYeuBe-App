# MeYeuBe V17.22.39 — Halloween Continuous Card Motion Fidelity

## Design and scope
- Retains original violet Halloween header, static pumpkin/witch-hat photograph, existing card layout, user content and controls.
- Animation is clipped to the original photo-scene inside the Bé Bún card and seasonal settings preview only.
- Header, cards below the hero and taskbar remain static.

## Two approved animations
1. `pumpkin` (Bí ngô nhấp nháy & dơi vỗ cánh): brighter pumpkin face / flickering eyes, bats with individually flapping wings, genuine theme-native bat cutout, windblown autumn leaves, warm firelight and glowing embers.
2. `bats` (Ma bay, đèn lồng & lá thu): three translucent floating ghosts with independent movement, lantern flame and halo, two smaller distant bats, autumn leaves and shimmering embers.

## Runtime
- Uses high-DPI Canvas and elapsed-time requestAnimationFrame with near-60 FPS drawing cap on high-refresh devices; actual achieved frame rate depends on device/browser.
- Each object has independent phase and opacity for seamless continuous motion, without animated GIF/WebP and without a shared replay pause.
- Keeps `pumpkin` / `bats` IDs unchanged to preserve prior saved and cloud-synced selections.
- Still mode and hidden-scene cancellation supported; reduced-motion CSS disables this visual layer.

## Deployment
- Static source + dist production build included in ZIP; no SQL migration.
- Run browser visual QA on actual iPhone before considering hardware FPS verified.
