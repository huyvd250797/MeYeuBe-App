# MeYeuBe V17.22.23 — Childrens Day Realistic Motion Polish

## Base
V17.22.22 from the user-provided ZIP, no unrelated theme or care-data modifications.

## Motion A: balloon material and paper confetti
- Three independent glossy latex balloon sprites. No crude CSS gradients or triangle balloons.
- Small pendulum sway and bounded vertical bob, independently phased. No sudden coordinate jumps.
- Gently floating folded colored paper with front-side highlights rather than glowing fake points.

## Motion B: translucent bubbles and realistic foil pinwheels
- Physically motivated bubble optical film: almost transparent interior, thin iridescent rim and asymmetric highlights.
- Foil pinwheel rotor art with curved semi-translucent blades and highlights; two separate motor speeds. Stems stay attached and do not spin.
- Bubbles follow independent gentle rising paths and fade out before looping. No balloon resources are loaded.

## Constraints and migration
- Preserve actual hero scene (`children-photo-hero-v3.webp`) without blur; two motion layers stay inside the hero scene.
- Save IDs `balloons` and `stars` unchanged for Cloud Sync. Still loads no animated objects.
- Rebuild with Node 22-compatible script, precache all new assets in production SW, bump build metadata to 17.22.23.
- No SQL migration required; child care data is untouched.

## Validation
Static and JavaScript tests in source; final visual Safari iPhone validation remains required after deployment.
