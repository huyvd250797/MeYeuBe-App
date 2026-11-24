# MeYeuBe V17.22.61 — Medication & Vitamin Reminder

## Features
- In Settings, enable medication reminders and create/edit/delete multiple independently active daily schedules with medicine name, dose, unit, required start time and optional same-day end time.
- At the due time, an in-app modal asks whether the baby has taken the medication, showing exact name and dose. “Chưa uống” snoozes only that schedule for 10 minutes and immediately advances to other due schedules.
- “Đã uống” creates a medicine care record using the exact click time, not the scheduled time. Completion is acknowledged only after the existing Supabase care write API confirms, with a retained pending event for uncertain outcomes.
- Uses stable scheduled care-event IDs to avoid duplicate writes when two devices confirm the same reminder; manual medicine records matching dose/name/unit/day may also count once against the closest due schedule.
- Reminder rules sync using the existing versioned Supabase settings JSON API. Per-device snooze records persist locally for 7 days; completed records live in the shared care history. No SQL migration.

## Important runtime limitation
The modal is supported while the PWA is open and visible (including after resuming). iOS does not allow an ordinary website/PWA to force an in-app modal to appear while closed or suspended. V17.22.61 does not claim to implement background push scheduling.

## Deployment
Push the source ZIP to Vercel. No SQL migration file for V17.22.61.
