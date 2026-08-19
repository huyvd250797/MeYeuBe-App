# AC V15.0.51 — StartupLoadingWatchdogFix

- Mở app ở Supabase Cloud DB Mode không bị kẹt mãi ở splash/loading.
- Nếu Cloud phản hồi nhanh: vào app với dữ liệu Supabase mới nhất.
- Nếu Cloud chậm hoặc mất mạng: app mở cache IndexedDB/local gần nhất trước, rồi kéo Cloud nền.
- Splash/loading có timeout an toàn và luôn tự ẩn sau khi app render được.
- Không hiển thị Dashboard rỗng lâu nếu đã có cache dữ liệu.
