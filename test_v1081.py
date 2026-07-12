from pathlib import Path
import re, subprocess, sys
root=Path(__file__).resolve().parent
app=(root/"app.js").read_text(encoding="utf-8")
idx=(root/"index.html").read_text(encoding="utf-8")
edge=(root/"supabase/functions/send-push/index.ts").read_text(encoding="utf-8")
checks=[]

def ck(name, cond):
    checks.append((name, bool(cond)))

ck("AC V10.8.1 exists",(root/"AC_V10.8.1.md").exists())
for f in ["index.html","app.js","manifest.webmanifest","sw.js","version.md"]:
    ck("Version consistency: "+f,"10.8.1" in (root/f).read_text(encoding="utf-8"))
ck("Current device uses target_endpoint","target_endpoint:cfg.endpoint" in app)
ck("All devices helper exists","async function testAllDevicesPush()" in app)
ck("All devices button exists",'onclick="testAllDevicesPush()"' in idx)
ck("Current device button label","Gửi thử thiết bị này" in idx)
ck("sent=0 rejected","if(sent<=0)" in app)
ck("Diagnostics include matched","matched_subscriptions" in app)
ck("Edge reads target endpoint",'body.target_endpoint' in edge)
ck("Edge filters endpoint",'.eq("endpoint", targetEndpoint)' in edge)
ck("Edge logs matched",'subscriptions_matched' in edge)
ck("Edge logs summary",'delivery_summary' in edge)
ck("Edge reports failed",'failed: failures.length' in edge)
ck("Expired handling",'statusCode === 404 || statusCode === 410' in edge)
ck("Push registration retained","enableDevicePush" in app and "PushManager" in app)
ck("Realtime retained","cloudRealtimeStart" in app)
ck("Manual Cloud Sync retained","pushLocalToCloud" in app and "pullCloudToLocal" in app)
ck("Smart Alert retained","evaluateSmartAlerts" in app)
ck("LocalStorage key preserved","meYeuBePWA_v4" in app)
for js in ["app.js","sw.js"]:
    r=subprocess.run(["node","--check",str(root/js)],capture_output=True,text=True)
    ck("JavaScript syntax: "+js,r.returncode==0)

failed=[name for name,ok in checks if not ok]
if failed:
    print("HVUS V1.0 RELEASE GATE: FAILED")
    [print("- FAIL:",x) for x in failed]
    sys.exit(1)
print("HVUS V1.0 RELEASE GATE: PASSED")
[print("- PASS:",name) for name,ok in checks]
