# AC V15.0.69 — RelationalWriteQueue

- Có bảng `public.relational_write_queue` để lưu trạng thái operation ghi relational.
- Có RPC `myb_relational_write_preflight` để kiểm tra Doctor/Delta trước khi bật Write Queue.
- Có RPC `myb_apply_relational_payload_snapshot` để áp snapshot app vào relational tables theo `family_id` lock.
- Có RPC `myb_relational_write_queue_status` để xem trạng thái queue server.
- Giao diện Cloud Sync có card “Relational Write Queue”.
- Write Queue mặc định tắt, không ảnh hưởng app nếu chưa bật.
- Khi bật, thao tác lưu được enqueue local trước rồi flush tuần tự lên Supabase.
- Nếu flush thất bại, dữ liệu vẫn còn local queue và JSON legacy backup.
- `meyeube_sync` vẫn được giữ làm backup legacy.
- Chưa xóa Migration / Doctor / Delta Sync.
