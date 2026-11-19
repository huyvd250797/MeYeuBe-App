# MeYeuBe V17.22.46 — Seasonal Splash Loading Wave 1

## Ten seasonal splash themes
Tết Nguyên đán, Tết Dương lịch, Tết Nguyên Tiêu, 08/03, Giỗ Tổ Hùng Vương, 30/04, Nghỉ mát/biển, Quốc khánh 02/09, Quốc tế Thiếu nhi 01/06, Sinh nhật.

## Behavior
- Reuses the previously approved wave-1 splash illustrations as decorative full-screen backdrops.
- Original screenshots' baked-in splash UI was masked within decorative background derivatives, avoiding duplicate text and wrong hardcoded version numbers.
- Keeps the app logo, build/version, loading dots and status as live HTML.
- Uses the existing shared seasonal configuration after Cloud settings are available.
- Caches only the confirmed Vietnam-local day and theme ID for rapid first paint on subsequent launches; stale cached days are ignored.
- Falls back to the original standard splash outside wave-1 themes, or if no shared settings are available.
- Honors reduced motion preferences for loading indicators.

## Preservation
- Original 360 artwork files and all existing UI styles are unchanged; only ten *new* splash assets and isolated loading-screen CSS are added.
- No new GIFs and no SQL migration.

## Validation
- Static build/release checks, asset validation, and loading-screen smoke tests.
