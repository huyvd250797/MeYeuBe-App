#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys, re
ROOT=Path(__file__).resolve().parent
errors=[]

def text(path):
    p=ROOT/path
    if not p.exists():
        errors.append(f'MISSING {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='replace')

def need(path, needle, label=None):
    if needle not in text(path): errors.append(f'{label or path}: missing {needle!r}')

def forbid(path, needle, label=None):
    p=ROOT/path
    if p.exists() and needle in p.read_text(encoding='utf-8',errors='replace'):
        errors.append(f'{label or path}: forbidden {needle!r}')

def node_check(path):
    try:
        r=subprocess.run(['node','--check',str(ROOT/path)],capture_output=True,text=True,timeout=30)
        if r.returncode: errors.append(f'node --check {path}: {r.stderr.strip()}')
    except Exception as e: errors.append(f'node --check {path}: {e}')

# Version/package
need('app.js','APP_VERSION="15.1.3"','app version')
need('index.html','./relational-v1513.js?v=15.1.3','runtime load')
need('index.html','window.__MYB_RELATIONAL_ONLY_RUNTIME__=true','relational-only pre-app guard')
need('sw.js',"const BUILD='15.1.3'",'service worker build')
need('sw.js',"'./relational-v1513.js'",'service worker runtime asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest','version.md']:
    need(f,'15.1.3',f)
try:
    b=json.loads(text('build.json'))
    if b.get('build')!='15.1.3': errors.append('build.json build != 15.1.3')
    if b.get('codename')!='RelationalAlwaysOnRealtimeFix': errors.append('build.json codename mismatch')
except Exception as e: errors.append(f'build.json invalid: {e}')

# Always-on configuration: localStorage can no longer turn DB/Realtime off or split family.
for token in [
    'function cloudNormalizeAlwaysOnCfg(cfg)',
    'cfg.enabled=true;',
    "cfg.syncId='main';",
    'cfg.alwaysOn=true;',
    "relationalAlwaysOnVersion='15.1.3'",
    '<input id="cloudSyncId" value="main" readonly',
    '<input id="cloudEnabled" type="hidden" value="1">',
    'Luôn bật (Always-On)',
]: need('app.js' if token.startswith(('function ','cfg.')) or 'relationalAlwaysOnVersion' in token else 'index.html',token,'always-on config')

# All old JSON/cloud ownership layers must be inert before they install listeners/timers.
app=text('app.js')
for marker in [
    '__MYB_CLOUD_DB_MODE_V1544__',
    '__MYB_SUPABASE_CLOUD_MERGE_GUARD_V1545__',
    '__MYB_SUPABASE_DELETE_TOMBSTONE_FIX_V1546__',
    '__MYB_QUIET_CLOUD_TOAST_V1548__',
    '__MYB_REALTIME_DATA_AUTHORITY_FIX_V1554__',
    '__MYB_CLOUD_REALTIME_AUTHORITY_FIX_V1555__',
    '__MYB_CLOUD_SAVE_QUEUE_FIX_V1558__',
]:
    pos=app.find(marker)
    if pos<0: errors.append(f'legacy marker missing unexpectedly: {marker}')
    else:
        before=app[max(0,pos-180):pos]
        if '__MYB_RELATIONAL_ONLY_RUNTIME__' not in before:
            errors.append(f'legacy runtime not guarded: {marker}')

# Runtime: fixed family/main, no enabled toggle condition, single-channel retained.
for token in [
    "var V='15.1.3'",
    "c.enabled=true",
    "c.syncId='main'",
    'function enabled(){var c=cfg();return !!(c&&c.url&&c.anonKey&&c.syncId)}',
    "channel('myb_rel_v1513_",
    'One family = one channel for the whole page lifetime',
    'requestExistingSocketConnect',
    'myb_relational_revision_v1580',
    'myb_relational_changes_since_v1580',
    'myb_relational_export_incremental_v1580',
    'myb_relational_apply_changes_v1580',
    "window.mybRelationalRealtimeV1513={",
    'alwaysOn:true',
    "syncId:'main'",
    'setInterval(sendPresence,180000)',
    'Full polling 45s: OFF',
]: need('relational-v1513.js',token,'V15.1.3 relational runtime')

for token in [
    "if(!c.enabled)",
    "c.enabled=(byId('cloudEnabled')",
    "||'be-bun-main'",
    'function scheduleRecovery(',
    'function scheduleReconnect(',
    "channel('myb_rel_v1511_",
    "channel('myb_rel_v1512_",
    '45000',
    'realtime_safety_refresh',
    'QUEUE_DB', 'qPut(', 'qAll(', 'qClear('
]: forbid('relational-v1513.js',token,'always-on/single-channel cleanup')

# Ensure active top-level Cloud config has no old family default.
forbid('app.js',"||'be-bun-main'",'old sync id default')
need('app.js',"return {enabled:true,url:CLOUD_DEFAULT_URL,anonKey:CLOUD_DEFAULT_KEY,syncId:'main'",'default always-on config')

# Existing important fixes retained.
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('SUPABASE_EGRESS_V15.0.80.sql','add column if not exists revision bigint','self-healing egress SQL retained')
need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql','public.myb_num(p_text)','weight hotfix retained')

# Old active runtime files must not ship.
for f in ['relational-v1510.js','relational-v1511.js','relational-v1512.js','relational-v1580.js','relational-v1579.js','relational-v1578.js','relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')

for f in ['app.js','boot.js','relational-v1513.js','sw.js']:
    node_check(f)

if text('SUPABASE_EGRESS_V15.0.80.sql').count('$$')%2:
    errors.append('SQL dollar quotes unbalanced')

if errors:
    print('RELEASE CHECK FAILED: V15.1.3')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.1.3')
