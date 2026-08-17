#!/usr/bin/env python3
"""Release smoke check for Mẹ Yêu Bé V15.0.45."""
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
    if "15.0.45" not in txt and "V15.0.45" not in txt:
        errors.append(f"{name} chưa đồng bộ V15.0.45")

# Cache busting / boot guard
for token in ['src="./boot.js?v=15.0.45"', 'src="./app.js?v=15.0.45"', 'ME YEU BE · V15.0.45', '<b>V15.0.45</b>']:
    if token not in idx:
        errors.append("index.html thiếu token version/cache: " + token)
for token in ["var APP_VERSION=\"15.0.45\"", "V15.0.45 · PumpMilk24UI"]:
    if token not in app:
        errors.append("app.js thiếu token V15.0.45: " + token)
for token in ["var BUILD='15.0.45'", "build.json", "MEYEUBE_BUILD_ACK"]:
    if token not in boot:
        errors.append("boot.js thiếu boot guard/version: " + token)
for token in ["const BUILD='15.0.45'", "cache:'no-store'", "caches.delete(k)"]:
    if token not in sw:
        errors.append("sw.js thiếu SW guard/version: " + token)

# V15.0.45 scroll-lock acceptance checks
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
        errors.append("Thiếu cơ chế khóa scroll V15.0.45: " + token)


# V15.0.45 hotfix: Pull-to-refresh không được hoạt động khi sheet đang mở
for token in [
    "mybAnyBottomSheetOpen",
    "lockedByUi()",
    "body.mybBottomSheetLock #pullToRefreshIndicator",
    "window.__tl8ShowV1505",
]:
    if token not in (idx + app):
        errors.append("Thiếu hotfix V15.0.45: " + token)


# V15.0.45 UXFix acceptance checks
for token in [
    "mybOverlayCore",
    "feedTimerStart",
    "bcStatusFeeding",
    "ringFeed",
    "tl8OnlyAction",
    "tl8ActionOnlyBtn",
    "tl8ActDanger",
    "tl8RecordChipBar",
    "tl8ResetView",
    "AX_PRESS_SEL='.tl8Chip",
]:
    if token not in (idx + app):
        errors.append("Thiếu UXFix V15.0.45: " + token)


# V15.0.45 MilkFeedFix acceptance checks
for token in ["v1511-milk-feed-fix", "v1512-milk-scroll-swipe-fix", "milkChosenExpire", "window.abOnAmountInput=function", ".milkSwipeShell,.milkSwipeActions", "PumpMilk24UI"]:
    if token not in (idx + app):
        errors.append("Thiếu MilkFeedFix V15.0.45: " + token)


# V15.0.45 PumpMilk24UI acceptance checks
for token in ["careRecordSwipeStart=function", "mcIsBusyForPump", "v1514-pump-swipe-fix", "Bình/túi này đang Tạm ẩn"]:
    if token not in (idx + app):
        errors.append("Thiếu PumpMilk24UI V15.0.45: " + token)


# V15.0.45 PumpMilk24UI acceptance checks
for token in ["repairPumpContainerLinks", "findPumpBagForEvent", "syncPumpEventFromBag", "Kho sữa là nguồn đúng", "pumpContainerInfo(db,x)", "pumpFridgeExpire24hFrom", "v1518-milk-typography"]:
    if token not in (idx + app):
        errors.append("Thiếu PumpMilk24UI V15.0.45: " + token)

# Keep V15.0.2 requested features present
for token in ["hb2Swipe", "tl9Swipe", "hbxEdit", "hbxDelete", "tl9PatchCareTimeline"]:
    if token not in app + idx:
        errors.append("Thiếu feature V15.0.2 còn phải giữ: " + token)

for required in ["AC_V15.0.45.md", "PUSH_NOTIFICATION_SETUP.md", "supabase/functions/send-push/index.ts", "supabase/functions/smart-alert-cron/index.ts", "docs/SMART_ALERT_CRON_SETUP.md"]:
    if not (root / required).exists():
        errors.append("Thiếu file: " + required)

for js in ["app.js", "boot.js", "sw.js"]:
    result = subprocess.run(["node", "--check", str(root / js)], capture_output=True, text=True)
    if result.returncode != 0:
        errors.append(f"{js} lỗi cú pháp: {result.stderr.strip()}")


# V15.0.45 SmartAlertCronPush acceptance
for token in ["SmartAlertCronPush", "normalizePumpExclusiveLinks", "duplicate_pump_link", "linked_to_foreign_pump_bag", "Bình \"" ]:
    if token not in (idx + app):
        errors.append("Thiếu SmartAlertCronPush V15.0.45: " + token)
if not (root / "AC_V15.0.45.md").exists():
    errors.append("Thiếu file: AC_V15.0.45.md")


# V15.0.45 Smart Alert Cron Push acceptance
for token in ["smart-alert-cron", "VAPID_PRIVATE_KEY", "push_delivery_log", "Nhắc sau 15 phút", "không thiết bị nào đang mở app"]:
    if token not in (idx + app + read("PUSH_NOTIFICATION_SETUP.md") + read("docs/SMART_ALERT_CRON_SETUP.md") + read("supabase/functions/smart-alert-cron/index.ts")):
        errors.append("Thiếu Smart Alert Cron Push V15.0.45: " + token)


# V15.0.45 StoredFeedFastAutoFix acceptance
for token in ["StoredFeedFastAutoFix", "adjustedSourcesForNeed", "Chỉ bấm ✕ mới chuyển sang thủ công", "lượng sữa của túi sẽ được trả lại kho"]:
    if token not in (idx + app + changelog + version):
        errors.append("Thiếu StoredFeedFastAutoFix V15.0.45: " + token)
if not (root / "AC_V15.0.45.md").exists():
    errors.append("Thiếu file: AC_V15.0.45.md")

if errors:
    print("RELEASE CHECK FAILED")
    for e in errors:
        print("- " + e)
    sys.exit(1)
print("RELEASE CHECK PASSED: V15.0.45")


# V15.0.45 InventorySafeFix acceptance
for token in ["v1521-search-nav-loading-fix", "gsStrictTokenHitV1521", "body.menuOpen .bottomNav", "loadingLogo img", "rawType==='feed'||rawType==='pump'||rawType==='spitup'"]:
    if token not in (idx + app):
        errors.append("Thiếu InventorySafeFix V15.0.45: " + token)
