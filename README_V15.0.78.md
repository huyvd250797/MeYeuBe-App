# Mẹ Yêu Bé V15.0.78 — Relational Cleanup + Weight Locale

## Nâng cấp
1. Chạy `SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql` trong Supabase SQL Editor.
2. Deploy source V15.0.78 lên Vercel.
3. Mở lại app trên tất cả thiết bị và refresh cache/PWA.
4. Kiểm tra Sổ sức khỏe: nhập cân nặng `5,2` → UI phải hiển thị `5,2 kg`.
5. Mở 2 thiết bị, ghi một cữ ở thiết bị A → thiết bị B phải tự refetch qua Realtime.

## Kiến trúc runtime
`UI → myb_relational_apply_changes_v1576 → relational tables → COMMIT → Realtime signal → myb_relational_export_state_v1576 → UI`

Không còn runtime cho Migration JSON, Migration Doctor, Delta Sync, Read Mode, Write Queue hoặc Production Push.
