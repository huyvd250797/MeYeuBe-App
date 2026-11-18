# MeYeuBe V17.22.42 — Birthday Motion Fidelity

## Summary
- Implemented the approved Birthday motion modes directly in the app using Canvas.
- Preserved the existing pink-purple Birthday artwork and UI layout.
- Motion remains scoped to the Bé Bún card only.

## Included motion modes
- `candles`: candle flames flicker with warm glow around the cake and subtle sparkles.
- `confetti`: colorful confetti falls while balloons, gifts and the teddy area receive gentle sparkle and highlight motion.

## Technical notes
- No GIF or animated image loop used in-app.
- Birthday candlelight loads the existing `birthday-piece-v2.webp` flame sprite; confetti mode is drawn fully in Canvas.
- Existing saved motion keys remain unchanged for sync compatibility.

## Notes
- No SQL migration.
- Production build included in `dist/`.
