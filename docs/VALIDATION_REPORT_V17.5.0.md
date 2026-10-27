# V17.5.0 — Validation

Startup tách dashboard-required và deferred history; có flag partial rõ ràng, không đánh dấu full giả. Giữ đủ care/milk/health core/appointments/milestones cho các phép tính dashboard. Editor và export cần full dùng guard; full load chỉ bù lịch sử thiếu.

Read cache/inflight tách target/key/query và revision; invalidation ghi/realtime, không cache write/operation verification, explicit refresh bỏ cache. Critical HTML chứa warm background và loader đầu body; manifest/status bar đồng bộ. Diagnostics chỉ time/RPC names.

Benchmark local dùng PostgreSQL fixture PGlite + jsdom với 600 diary rows và latency mô phỏng 25ms/RPC. Đọc dashboard vs full đều invalidated cache trước đo, không coi là thời gian Supabase thật. Không kiểm chứng Safari/iPhone pixel/native launch hoặc production. Không push/deploy; không SQL mới.

Final local validation: 50/50 suites PASS, no ignored baseline failures. Includes realtime 35 checks, care workflow 34 checks, read performance 12 checks and startup performance 7 checks. Initial failures and successful reruns are preserved in TEST_RESULTS. Date fixture was corrected to SQL YYMMDD; stylesheet tests now locate tokens by content rather than sheet position. Production realtime cache invalidation now occurs before querying.

Controlled benchmark: dashboard 9 requests versus full baseline 17 requests. Exact durations and environment are in STARTUP_BENCHMARK_V17.5.0.json. These are simulated local measurements, not a production latency guarantee.
