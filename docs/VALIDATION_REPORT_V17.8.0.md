# V17.8.0 Validation

Input uploaded V17.7.0 ZIP. 148 top-level unique functions extracted to six feature owners, source bodies preserved. Inline/global compatibility remains; fixtures load the same pre-app feature modules as runtime. New function-body integrity test and late-bound adapter test included.

Viewport simulation covers visible height, keyboard offset, orientation, zoom, fallback, dynamic health modal and transfer modal. This does not prove actual iPhone/Safari pixel rendering. No real-device test, production connection or deployment. 17 retained backend files unchanged, no SQL migration.

Partial extraction: remaining app.js closures/wrappers and globals have not been removed. Total JS may grow due to compatibility APIs; app.js reduction is relocation, not proof of faster startup.

Final: 52/52 suites PASS; viewport simulation12/12 PASS; extraction integrity148/148 functions. Initial test-fixture loading failures and successful reruns retained.
