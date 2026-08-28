# Acceptance Criteria · V15.0.76 RelationalOnlyDirectTableCutover

- Cloud source of truth là relational tables; `meyeube_sync` không còn được app đọc/ghi.
- Restore clean backup 2026-08-28 trực tiếp vào từng table, transaction rollback nếu count/balance sai.
- Runtime write là row-level delta qua `myb_relational_apply_changes_v1576`, không gửi full JSON DB snapshot.
- Runtime read là `myb_relational_export_state_v1576`, dựng state UI từ table.
- Không chạy Rescue/Dedupe legacy trong runtime V15.0.76.
- Kho sữa giữ `remaining_ml` authoritative và ledger phải reconcile đúng.
- Legacy JSON write lock chạy cuối để thiết bị bản cũ không thể hồi sinh dữ liệu JSON.
