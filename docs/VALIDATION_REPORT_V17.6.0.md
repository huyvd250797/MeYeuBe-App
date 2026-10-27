# V17.6.0 — UI Consistency validation

Loading hierarchy matches the supplied reference: app logo above app name and version; animation above status. Brand colors/background remain Mẹ Yêu Bé. Critical inline CSS matches the external layout to avoid a horizontal-to-vertical flash.

Form styles standardize minimum heights, text/placeholder colors, focus visibility, wrapping actions, date-time two-column containment and popup theme. Existing form viewport tests simulate keyboard resize, orientation and zoom; these do not verify actual Safari pixel layout or iOS keyboard behavior. Actual large text and iPhone landscape must be checked after deployment.

No backend/SQL changes. Regression results are in TEST_RESULTS_V17.6.0.json. No production testing or deployment performed. Benchmark is local PGlite/jsdom with simulated latency, not a production guarantee.

Final: 51/51 local suites PASS. Media visibility guard restored as last form rule; targeted media rerun 19/19 PASS. No exemptions.
