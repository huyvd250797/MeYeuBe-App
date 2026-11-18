# MeYeuBe V17.22.37 — Vietnamese Women's Day Motion Fidelity

## Scope
- Updated **Ngày Phụ nữ Việt Nam (20/10)** only, using the existing mauve/rose UI theme and original `womenvn-photo-hero-v3.webp` photograph.
- Animation runs exclusively within the **Bé Bún** hero artwork (and its corresponding settings preview); no animation of header, avatar, text, live feed reminder, lower cards or bottom navigation.
- Existing `rosePetals` and `silkRibbon` saved mode IDs remain stable for cloud configuration synchronization.

## Mode 1 — Cánh hồng bay & ánh sao (`rosePetals`)
- 25 source-native rose petals on asynchronous continuous fall paths with rotation, fading and variable speed.
- 18 warm sparkle/glint sources plus subtle light on the existing floral bouquet.

## Mode 2 — Dải lụa hồng & ánh vàng (`silkRibbon`)
- Three layered, translucent, continuously undulating rose-gold ribbon trails; three independently moving highlights.
- 25 warm sparkle sources, reflected bloom light around flowers, and nine lighter accent petals.
- Distinct dynamics from Mode 1 (ribbon-dominant versus petal-dominant).

## Visual fidelity
- Original photographic rose artwork remains stable, without distortion or background replacement.
- Completing `20/10` typography on a parchment card within the photo layer fixes previously clipped date text. Date remains legible even in Still mode.
- The animation uses Canvas and native requestAnimationFrame, no GIF or animated WebP; up to about 60 drawings/sec where the device can sustain it, stopping when the scene is hidden or set to Still.
- Photo assets, CSS and animation code are included in the production PWA build.

## Deployment
- No SQL schema changes or migrations.
- Use the `dist/` folder or deploy the static app source with existing Vercel configuration.
- Actual 60fps depends on display refresh and device performance; browser/mobile visual testing recommended after deployment.
