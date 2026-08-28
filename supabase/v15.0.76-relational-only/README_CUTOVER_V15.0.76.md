# Mẹ Yêu Bé V15.0.76 — Relational Only Direct Table Cutover

## Mục tiêu

Bản này cắt `public.meyeube_sync.data` khỏi đường chạy chính. Cloud source of truth là các relational tables. JSON chỉ còn có thể xuất hiện như payload truyền qua RPC, `jsonb extra` theo từng row hoặc cache local để UI/offline hoạt động; không còn một JSON DB nguyên khối dùng làm database chính.

Nguồn phục hồi: `me-yeu-be-db-2026-08-28.json` do người dùng cung cấp, Sync ID `main`.

## Dữ liệu sẽ restore

- 3 thành viên Sổ sức khỏe
- 4 số đo sức khỏe
- 5 bản ghi vaccine
- 1.570 care events
- 550 feed events
- 270 pump events
- 141 sleep events
- 466 diaper events
- 5 temperature events
- 273 milk items
- 32 milk containers đã làm sạch
- 602 liên kết cữ bú ↔ nguồn sữa
- 158 nhật ký
- 42 cột mốc
- 5 lịch hẹn
- 5 pregnancy records
- 2 app members
- 7 sensor logs
- 2 activity logs

Không import `_sync`, tombstone, `dailyCareStats` và archive snapshot như dữ liệu nghiệp vụ.

## Kho sữa

`milk_items.remaining_ml` lấy trực tiếp từ backup sạch và là trạng thái chuẩn. Ledger được tạo từ các cữ bú biết chắc; nếu ledger chưa giải thích đủ số dư trong backup thì thêm transaction `adjust` để reconcile. Restore sẽ rollback nếu view `milk_item_balances` không khớp `milk_items.remaining_ml`.

Hai container giả do parser legacy hiểu nhầm chữ trạng thái (`Đã sử dụng hết.` và `Ngưng sử dụng/loại bỏ.`) không được restore. Những milk item từng trỏ tới chúng được đưa về container generic an toàn.

## Trình tự triển khai — bắt buộc theo thứ tự

1. **Đóng app trên tất cả thiết bị**. Không nhập/sửa dữ liệu trong lúc cutover.
2. Supabase → SQL Editor → chạy `01_SCHEMA_PATCH_V15.0.76_RELATIONAL_ONLY.sql`.
3. Chạy `02_RESTORE_CLEAN_DB_2026-08-28_DIRECT_TABLES.sql`.
   - Script dùng transaction.
   - Nếu count/balance sai, script chủ động lỗi và rollback, không để half-restore.
4. Chạy `03_RUNTIME_RELATIONAL_ONLY_RPC_V15.0.76.sql`.
5. Deploy source `MeYeuBe-V15.0.76-RelationalOnlyDirectTableCutover-Vercel-Ready.zip` lên Vercel.
6. Trên app mới, Cloud Sync phải dùng **Sync ID = `main`**. Mở app và kiểm tra Kho sữa, Bé bú, Sổ sức khỏe, Nhật ký.
7. Khi app V15.0.76 đã đọc đúng relational tables, chạy `04_LOCK_LEGACY_JSON_WRITES_V15.0.76.sql` để khóa mọi ghi cũ vào `meyeube_sync`.
8. Chạy `05_VERIFY_RELATIONAL_CUTOVER_V15.0.76.sql` và kiểm tra tất cả dòng `ok = true` / `milk_balance_mismatch = 0`.

## Rollback khóa JSON khẩn cấp

Chỉ khi cần mở lại write guard để điều tra, chạy `06_UNLOCK_LEGACY_JSON_WRITES_ROLLBACK.sql`. Không dùng rollback này để quay lại JSON DB làm nguồn chính.

## Các túi sữa quan trọng để đối chiếu sau restore

- `260828-02`: 200 ml ban đầu, còn 0 ml, `Đã sử dụng hết`.
- `260828-03`: 130 ml ban đầu, còn 0 ml, `Đã sử dụng hết`.
- `260828-04`: 100 ml ban đầu, còn 70 ml, `Đang bảo quản`.

## Lưu ý file Sổ sức khỏe

Backup JSON có metadata tài liệu nhưng một số file ảnh gốc được lưu bằng `blobKey` trong IndexedDB. Vì byte ảnh không nằm trong JSON backup này, restore chỉ có thể giữ metadata tương ứng; không thể tái tạo byte ảnh từ JSON.

## Quy tắc sau cutover

- Không chạy lại Emergency Rescue / Legacy JSON Migration.
- Không deploy V15.0.75 hoặc thấp hơn sau khi đã khóa legacy JSON.
- Không dùng `meyeube_sync.data` để rebuild relational tables lần nữa.
- Mọi dữ liệu nghiệp vụ mới được ghi trực tiếp theo row vào relational tables thông qua RPC `myb_relational_apply_changes_v1576`.
