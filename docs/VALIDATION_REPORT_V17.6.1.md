# V17.6.1 Validation

UI changes only, no migration/backend edits. Day selector is session-only and uses local civil dates/addDaysISO; only the metric block changes date. Current inventory is explicitly labeled as current, not historical stock. Detail drilldown receives selected day. No network read for changing day because complete care history is retained at bootstrap.

Connection toast scheduling disabled. Write outcome checks, operation IDs, retry/verification and pending guards remain. Save UI uses success/failure labels; diagnostics still retain errors internally. No success toast while pending.

Targeted regression results in TEST_RESULTS_V17.6.1.json. Actual iPhone visual checks and production not performed.
