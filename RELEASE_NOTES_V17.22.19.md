# MeYeuBe V17.22.19 — Doan Ngo Festival Motion Fidelity

## Source baseline
V17.22.18, upgraded to formalize the approved Tet Doan Ngo seasonal motion set.

## Approved theme package
- Theme: **Tet Doan Ngo** (`doanngo`) remains scheduled on **05/05 lunar**.
- Motion A: `dragonflies` — **Chuồn chuồn bay**.
- Motion B: `summerLeaves` — **Lá xanh lay động và rơi**.
- `still`: static Doan Ngo scene, no overlay motion.

## Visual scope
- Keeps the existing photo-based Doan Ngo hero/background/header assets already included in the seasonal package.
- Motion remains clipped to the baby hero scene, without affecting app bar, cards below, or bottom navigation.
- No extra title frame or text banner is introduced.

## Compatibility
- No changes to baby-care workflows, cloud sync, notification logic, or other seasonal presets.
- Existing `dragonflies` / `summerLeaves` saved configuration IDs are preserved.
- PWA build/version updated to **17.22.19** for cache refresh and update prompt detection.

## Validation
- Seasonal model label verification for Tet Doan Ngo.
- Targeted Doan Ngo standalone motion test.
- ZIP/release packaging only; Boss should still visually verify on device after deploy.
