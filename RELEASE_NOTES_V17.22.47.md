# MeYeuBe V17.22.47 — Complete 20-Theme Seasonal Splash Loading

## Integrated theme set (20)

| Theme ID | Label | Artwork source |
|---|---|---|
| tet | Tết Nguyên đán | Wave 1, retained |
| newyear | Tết Dương lịch | Wave 1, retained |
| nguyentieu | Tết Nguyên Tiêu | Wave 1, retained |
| womensday | Quốc tế Phụ nữ 08/03 | Wave 1, retained |
| hungking | Giỗ Tổ Hùng Vương | Wave 1, retained corrected brown/olive theme |
| reunification | 30/04 | Wave 1, retained |
| beach | Nghỉ mát / Biển | Wave 1, retained |
| nationalday | Quốc khánh 02/09 | Wave 1, retained |
| children | Quốc tế Thiếu nhi 01/06 | Wave 1, retained |
| birthday | Sinh nhật | Wave 1, retained |
| midautumn | Trung thu | Wave 2, supplied |
| school | Khai giảng | Wave 2, supplied |
| halloween | Halloween | Wave 2, supplied |
| teachers | 20/11 | Wave 2, supplied |
| christmas | Giáng sinh | Wave 2, supplied |
| womenvn | Phụ nữ Việt Nam 20/10 | Wave 2, supplied |
| family | Gia đình Việt Nam | Wave 2, supplied |
| vulan | Vu Lan | Wave 2, supplied |
| doanngo | Tết Đoan Ngọ | Wave 2, supplied |
| culture | Văn hóa Việt Nam | Wave 2, supplied |

## Behaviour
- The startup splash uses the most recently cloud-validated theme for the current Vietnam calendar day on devices that have connected before.
- Cloud settings remain authoritative and revalidate/update splash when they load, including scheduled themes, custom date ranges, recurrence and enabled/disabled status.
- No theme active: use the original default splash.
- Logo, version text, loading dots and loading status remain native HTML, never duplicated on the background image.
- All 20 assets are included in the PWA precache to support subsequent offline launches.

## Artwork safety
- No main card/background/theme assets were modified; existing 10 splash backgrounds were retained byte-for-byte.
- Wave 2 source images contain pre-rendered text and logos. Those central parts were replaced with clean, theme-matched backgrounds before being used as images, with the original decorations retained.

No database migration.
