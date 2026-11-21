# MeYeuBe V17.22.53 — Selectable Featured Care Dashboard

- Added exclusive Nổi bật choice to each care metric in Dashboard configuration.
- User can promote one currently-visible metric to the top of the care section, or leave all unfeatured.
- Default promotion for existing accounts: Bé bú.
- Promoted card shows actual daily value, current goal if enabled, matching progress, and contextual details.
- When Bé bú is promoted, displays total Sữa đã bỏ from feed-event `wasteMl` for the selected calendar day (excluding milk-stock disposal).
- Normal care cards retain source V17.22.52 rendering and 3-column grid. Last one or two cards retain 1/3-column width, aligned left.
- Only dashboard component, Dashboard configuration, care-config model, and dedicated stylesheet were changed. All seasonal assets and motion assets are unchanged.
- No migration needed: new `dashboardConfig.featuredCareMetric` field persists in existing Cloud settings.
