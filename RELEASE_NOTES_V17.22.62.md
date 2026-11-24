# MeYeuBe V17.22.62 — Medication Reminder Reliability & Fixed Taskbar

## Changes
- Adds **Bỏ qua** for an individual medication reminder, suppressing further reminders for that medication for the current local day without recording a care event.
- Maintains independent medication queues and separate 10-minute snoozes.
- Checks reminders globally on application startup, page navigation, visibility changes and periodic foreground checks, including Cloud settings refresh independent of the Settings page.
- Prevents medication overlays from applying the legacy body-fixed scroll lock that could displace the bottom navigation on iOS; the taskbar remains pinned to the bottom.
- Does not change any other themes or care history.

## Scope and limitations
- When the PWA is closed, no automatic full-screen modal can be presented. The schedule is checked when it is open again.
- Skipped/timed snoozes are stored per local device. No database migration is required.
