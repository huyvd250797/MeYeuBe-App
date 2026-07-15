# HVUS v1.0 — Acceptance Criteria V10.9.0

## P0 — Release và độ tin cậy
- AC-01: ZIP phải chứa đầy đủ index.html, app.js, sw.js, manifest, SQL và Edge Function.
- AC-02: Release Gate phải FAIL khi runtime test không chạy hoặc có console error.
- AC-03: Version, Service Worker version, build hash và release manifest phải đồng nhất.
- AC-04: Ứng dụng phải cảnh báo và từ chối Sync ID mặc định `main`.
- AC-05: Có tài liệu audit bảo mật nêu rõ giới hạn anon-key và roadmap Auth/RLS.

## P1 — Ổn định dữ liệu
- AC-06: Hiển thị mức sử dụng storage và cảnh báo từ 65%/80%.
- AC-07: Trước Cloud Pull, Smart Pull hoặc Realtime Apply phải tạo safety backup.
- AC-08: Có thể tải safety backup gần nhất.
- AC-09: Cloud payload có transaction id và parent revision.
- AC-10: Avatar có thể chuyển từ base64 sang Supabase Storage, giữ fallback nếu upload lỗi.

## P3 — UX
- AC-11: Menu kỹ thuật được gom trong “Thiết lập nâng cao”.
- AC-12: Trung tâm cảnh báo dùng adaptive sheet, không sát cạnh và không chiếm toàn màn hình khi ít dữ liệu.
- AC-13: Các block Quick Add phải là button semantic.
- AC-14: Footer hiển thị version và build hash.
- AC-15: Toàn bộ Realtime, Push, Smart Alert, Cloud Sync và localStorage key được giữ nguyên.
