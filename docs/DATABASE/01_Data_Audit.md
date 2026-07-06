# 01_Data_Audit.md

## Mục đích

Tài liệu này dùng để kiểm kê toàn bộ cấu trúc dữ liệu hiện tại của MeYeuBe đang lưu trong localStorage, cụ thể là key:

`meYeuBePWA_v4`

Mục tiêu của Data Audit:

- Xác định app hiện đang lưu những nhóm dữ liệu nào.
- Liệt kê đầy đủ từng field trong từng nhóm dữ liệu.
- Xác định field nào cần migrate lên Supabase.
- Xác định field nào chỉ là dữ liệu tính toán, không nên lưu vào database.
- Làm nền tảng cho bước tiếp theo: JSON → Supabase Mapping.

## Nguyên tắc phân loại

| Nhóm | Ý nghĩa |
|---|---|
| MIGRATE | Cần đưa lên Supabase |
| DERIVED | Dữ liệu tính toán, không lưu DB |
| LOCAL_ONLY | Chỉ dùng local, không sync |
| LEGACY | Dữ liệu cũ, cân nhắc bỏ |
| CONFIG | Dữ liệu cấu hình |