#!/usr/bin/env python3
"""Release smoke check for Mẹ Yêu Bé V15.0.3."""
from pathlib import Path
import subprocess, sys

root = Path(__file__).resolve().parent
errors = []

def read(name):
    p = root / name
    if not p.exists():
        errors.append(f"Thiếu file: {name}")
        return ""
    return p.read_text(encoding="utf-8", errors="ignore")

idx = read("index.html")
app = read("app.js")
boot = read("boot.js")
sw = read("sw.js")
manifest = read("manifest.webmanifest")
build = read("build.json")
version = read("version.md")
changelog = read("changelog.md")

# Version sync
for name, txt in {
    "index.html": idx,
    "app.js": app,
    "boot.js": boot,
    "sw.js": sw,
    "manifest.webmanifest": manifest,
    "build.json": build,
    "version.md": version,
    "changelog.md": changelog,
}.items():
    if "15.0.3" not in txt and "V15.0.3" not in txt:
        errors.append(f"{name} chưa đồng bộ V15.0.3")

# Cache busting / boot guard
for token in ['src="./boot.js?v=15.0.3"', 'src="./app.js?v=15.0.3"', 'ME YEU BE · V15.0.3', '<b>V15.0.3</b>']:
    if token not in idx:
        errors.append("index.html thiếu token version/cache: " + token)
for token in ["var APP_VERSION=\"15.0.3\"", "V15.0.3 · Boss patch — Khoá scroll nền cho TẤT CẢ bottom sheet"]:
    if token not in app:
        errors.append("app.js thiếu token V15.0.3: " + token)
for token in ["var BUILD='15.0.3'", "build.json", "MEYEUBE_BUILD_ACK"]:
    if token not in boot:
        errors.append("boot.js thiếu boot guard/version: " + token)
for token in ["const BUILD='15.0.3'", "cache:'no-store'", "caches.delete(k)"]:
    if token not in sw:
        errors.append("sw.js thiếu SW guard/version: " + token)

# V15.0.3 scroll-lock acceptance checks
for token in [
    "body.mybBottomSheetLock,body.mybScrollLock{position:fixed!important",
    "html.mybBottomSheetLock{overflow:hidden!important",
    "mybBottomSheetLock",
    "touchmove",
    "passive:false",
    "tl8Sheet.show",
    "moreSheet.show",
    "streakOverlay.show",
    "milkBagPickerOverlay.show",
    "nmSheet.open",
]:
    if token not in (idx + app):
        errors.append("Thiếu cơ chế khóa scroll V15.0.3: " + token)

# Keep V15.0.2 requested features present
for token in ["hb2Swipe", "tl9Swipe", "hbxEdit", "hbxDelete", "tl9PatchCareTimeline"]:
    if token not in app + idx:
        errors.append("Thiếu feature V15.0.2 còn phải giữ: " + token)

for required in ["AC_V15.0.3.md", "PUSH_NOTIFICATION_SETUP.md", "supabase/functions/send-push/index.ts"]:
    if not (root / required).exists():
        errors.append("Thiếu file: " + required)

for js in ["app.js", "boot.js", "sw.js"]:
    result = subprocess.run(["node", "--check", str(root / js)], capture_output=True, text=True)
    if result.returncode != 0:
        errors.append(f"{js} lỗi cú pháp: {result.stderr.strip()}")

if errors:
    print("RELEASE CHECK FAILED")
    for e in errors:
        print("- " + e)
    sys.exit(1)
print("RELEASE CHECK PASSED: V15.0.3")
