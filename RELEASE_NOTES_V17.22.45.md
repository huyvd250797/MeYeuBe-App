# MeYeuBe V17.22.45 — Birthday Motion Rebuild

## Baseline and safety
- Built from the user-uploaded V17.22.41, not V17.22.42–44.
- Preserve all original image files (no recropping, re-encoding, sharpening, rewriting, or renaming).
- Preserve all CSS exactly as in V17.22.41, including image-fit behavior.
- No changes to other themes or modules.

## Birthday motion
- `candles`: gentle flickering on the four existing candle flames, warm highlights over the cake, subtle glints.
- `confetti`: floating pink balloons, confetti falling at independent speeds, and sparkles around teddy/gifts.
- Both draw in a dedicated overlay inside the baby card, without GIFs or new image resources.
- Canvas alignment matches the unmodified `object-fit:contain` photography, and preview uses right-center alignment.
- Per-frame rendering is capped near 60 fps; achieved fps depends on device.
- `still`/visibility pause/stop preserve existing behavior.

## Delivery
- Source and `dist/` production output.
- No SQL migration.
