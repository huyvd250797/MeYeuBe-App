# MeYeuBe V17.22.35 — Mid-Autumn Rich Continuous Motion

## Business scope
- **Only the Bé Bún hero card's art layer animates.** The header, avatar, text, buttons, date, other dashboard cards, and bottom tab navigation stay static.
- **Đèn ông sao** (`starLantern`): 3 independently swaying luminous star lanterns, 32 moving fireflies/sparkles, 6 independent twinkling beams, 5 active light shafts, mooncake shine and warm hanging-lantern pulse.
- **Trăng rằm & mây trôi** (`clouds`): one round soft golden moon with minimal subtle marbling, 5 faster drifting cloud layers, 6 luminous rising sky lanterns, 32 fireflies/sparkles, 6 light bursts and mooncake highlights.
- Motion frequencies and amplitudes increased markedly from V17.22.34.

## Runtime
- Canvas with `requestAnimationFrame` synchronized with display refresh, targeting 60fps on capable devices (actual FPS depends on the browser and device). No GIF or animated WebP assets.
- Independent continuous sinusoidal motion, wraparound particles fade before reset (no hard loop seam).
- `still` / system reduced-motion disables the animation; visibility pause and scene removal stay integrated with the existing app.
- All existing festival settings and server synchronization contracts are unchanged.

## Delivery
- Source and production `dist/` build, ready for Vercel static deploy.
- No SQL migration.
