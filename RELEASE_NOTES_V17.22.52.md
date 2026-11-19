# MeYeuBe V17.22.52 — PWA Update Reliability & Tet Hero Scale

## PWA updates
- Visible pending update dialog centered over a dimmed but visible app.
- Update button immediately shows progress; checks pending offline data and active edits before proceeding.
- Verifies fresh build metadata and matching server HTML.
- Activates waiting service worker and waits briefly for `controllerchange`; falls back to cache-busted navigation on standalone iOS PWA.
- Network/check errors keep the dialog open with a retry action. No automatic destructive cache deletion.

## Tết Nguyên đán
- Removes empty transparent padding from both image-scene assets only, preserving unaltered subjects/aspect ratio.
- Makes the actual scene ~30–40% larger in the Bé Bún hero.
- Moves canvas motion coordinates to match the new art bounds and keeps mode keys `blossoms` / `lantern` unchanged.
- All other theme images remain byte-identical.

No SQL migration.
