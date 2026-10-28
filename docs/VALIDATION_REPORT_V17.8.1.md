# V17.8.1 Validation

Regression for exact reported careDetailOverlay, full-height child panel, dynamically-created health modal vs scrim, visual viewport keyboard/landscape changes and body nav state restoration. Stylesheet loads last with ID specificity above legacy geometry. Registry11 full-screen layers, preserves menus/filter sheets.

The reported screenshot layer was missing from17.8 viewport owner. Legacy overlay bottom padding and88/90vh panel limits remain in historical CSS but are overridden by the final geometry stylesheet. Source reviewed across care/milk/health/planning modal roots. No production/iPhone pixel validation, no deploy. Cannot claim actual device gap eliminated without device observation. No migration/backend changes.

Final53/53 local suites PASS; viewport23/23 and reported-detail11/11. Repeated mutations settle without observer/frame loop. No actual iOS render claim.
