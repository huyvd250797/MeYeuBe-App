# MeYeuBe V17.22.36 — School Opening Green Motion Fidelity

Release notes: `RELEASE_NOTES_V17.22.36.md`.

Based on the user's V17.22.35 source. The existing green Khai giảng photographic illustration remains unchanged; two distinct, continuous animations are layered inside the Bé Bún hero card. Mode IDs `chalk` and `plane` have not changed, preserving cloud-synchronized configuration.

## Khai giảng motion

- **Hoa phượng rơi & nắng sân trường** (`chalk`): independently falling phoenix-red petals, warm daylight beams and intermittent highlights.
- **Máy bay giấy lượn & cờ khai giảng** (`plane`): animated paper airplane cutouts following smooth paths, small fabric bunting and lighter petal fall.
- Native Canvas and `requestAnimationFrame` with a target of up to 60 render frames/second; visual motion has no single repeated GIF timeline or whole-scene reset.
- Only the illustration within the Bé Bún hero card moves. The header, labels, portrait, controls, other dashboard cards and bottom navigation remain static.
- `still`, reduced-motion preferences and visibility pause are respected.

## Deployment

Deploy the complete `dist/` directory, including the `assets/` bundle, `src/features/seasonal/art/`, icons, `sw.js`, `manifest.webmanifest`, `index.html` and `build.json`. PWA assets are versioned and cached for offline use.

## Testing

Run `npm ci && npm test` in a compatible environment. Focused tests without external modules:

```sh
node tests/school-green-motion-v172236.cjs
node tests/midautumn-rich-motion-v172235.cjs
node tests/seasonal-standalone.cjs
node tests/build-worker.cjs
python3 release_check.py
```

No SQL migration is required.
