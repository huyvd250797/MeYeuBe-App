# V17.8 — Feature Modules

6 feature owners extracted by JavaScript AST from top-level unique function declarations. JSON contains original names, source line and size. Source bodies preserved; no persistence/ledger change. Globals remain compatibility entry points; mybFeatures exposes late-bound calls so typed adapters installed later stay authoritative. Models and UI controllers split; controllers still use global helpers/DOM and are explicitly named legacy-controller. This is incremental modularization, not complete isolation or lazy loading. Remaining app.js wrappers, timers and closures require subsequent extraction.

Care model: time overlap, daily totals, diaper counts, stock presentation/availability. Care form-controller: transfer editor controls. Health model: member shape/units/points. Health legacy-controller: existing health editor/render callbacks. Planning legacy-controller: appointment, milestone and report entry points. Dashboard model: metric defaults/goals/config. Order: shared UI components → feature owners → app.js → relational/native adapters. Service worker precaches new files.

Fullscreen editors: care, health, transfer and feed completion share viewport sizing and final geometry; safe area remains inside footer, body scrolls independently. Standard record pages hide bottom navigation and remove reserved bottom padding; dashboard unchanged. Actual iOS keyboard/native viewport not verified on device.

No new SQL, no backend edits, no deploy. Total JS is not reduced just by extraction; defer bundling/lazy loading to17.9.
