# Changelog

## V8.5.1 - Boot Stability Hotfix

### Fixed
- Fixed app stuck on splash screen due to `updateClock()` being called while not defined in V8.5 dashboard render.
- Dashboard now calls `syncVNClock()` safely after render.
- Added `updateClock()` alias for backward compatibility.

### Compatibility
- No data structure changes.
- DB key remains `meYeuBePWA_v4`.
