#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys
ROOT=Path(__file__).resolve().parent
errors=[]
def text(path):
    p=ROOT/path
    if not p.exists(): errors.append(f'MISSING {path}'); return ''
    return p.read_text(encoding='utf-8',errors='replace')
def need(path,needle,label=None):
    if needle not in text(path): errors.append(f'{label or path}: missing {needle!r}')
def forbid(path,needle,label=None):
    p=ROOT/path
    if p.exists() and needle in p.read_text(encoding='utf-8',errors='replace'): errors.append(f'{label or path}: forbidden {needle!r}')
def node_check(path):
    try:
        r=subprocess.run(['node','--check',str(ROOT/path)],capture_output=True,text=True,timeout=30)
        if r.returncode: errors.append(f'node --check {path}: {r.stderr.strip()}')
    except Exception as e: errors.append(f'node --check {path}: {e}')

need('app.js','APP_VERSION="15.1.2"','app version')
need('index.html','./relational-v1512.js?v=15.1.2','runtime load')
need('sw.js','./relational-v1512.js','service worker asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest']: need(f,'15.1.2',f)
try:
    b=json.loads(text('build.json'))
    if b.get('build')!='15.1.2': errors.append('build.json build != 15.1.2')
except Exception as e: errors.append(f'build.json invalid: {e}')

# V15.1.2 root-cause fixes
for token in [
    "var V='15.1.2'",
    'function installRealtimeStatusAuthority()',
    'function setRealtimeStateStable(state)',
    'function requestExistingSocketConnect(reason)',
    "if(cloudRealtimeChannel&&realtimeKey===key)",
    "channel('myb_rel_v1512_",
    "channel.subscribe(function(status,err)",
    "realtimePhase='REJOINING'",
    'Supabase JS automatically reconnects/rejoins with backoff. Do nothing.',
    'incremental catch-up failed; Realtime channel untouched',
    "scheduleDataRetry('incremental_data_retry')",
    'realtimeStatusCounts',
    'realtimeConnectRequests'
]: need('relational-v1512.js',token,'V15.1.2 single-channel state')

# Relational-only flag must be active before app.js and legacy runtimes must short-circuit.
need('index.html','window.__MYB_RELATIONAL_ONLY_RUNTIME__=true','relational-only early flag')
if text('index.html').find('window.__MYB_RELATIONAL_ONLY_RUNTIME__=true') > text('index.html').find('<script src="./app.js?v=15.1.2"></script>'):
    errors.append('relational-only flag must load before app.js')
if text('app.js').count('if(window.__MYB_RELATIONAL_ONLY_RUNTIME__)return;') < 2:
    errors.append('legacy QuietCloudToastFix/CloudSaveQueueFix are not both short-circuited')

# No app-owned forced recovery/recreate loop may remain in current runtime.
for token in [
    'function scheduleRecovery(',
    'forced_recovery_',
    "scheduleRecovery('closed'",
    'realtimeForcedRecoveryCount++',
    "detachRealtimeChannel('forced_start')",
    "setRealtimeStateStable('RETRYING');\n      detachRealtimeChannel",
    './relational-v1511.js?v=15.1.1',
    "channel('myb_rel_v1511_"
]: forbid('relational-v1512.js' if 'relational-v1511.js' not in token else 'index.html',token,'forced reconnect removed')

# Offline/foreground must not remove the channel.
for token in [
    "window.addEventListener('offline',function(){stopRelationalRealtime()",
    "visibilityState==='visible'){stopRelationalRealtime",
    "window.addEventListener('online',function(){setRealtimeStateStable('CONNECTING')"
]: forbid('relational-v1512.js',token,'lifecycle channel churn removed')

# Incremental/Database First retained.
for token in [
    'myb_relational_apply_changes_v1580','myb_relational_export_state_v1580',
    'myb_relational_revision_v1580','myb_relational_changes_since_v1580',
    'myb_relational_export_incremental_v1580','catchUpSinceRevision','refreshIncremental',
    'fullPolling:false',"egressMode:'incremental_sections'",'pendingPersistentWrites:0',
    "source:'relational_tables_only'",'setInterval(sendPresence,180000)'
]: need('relational-v1512.js',token,'incremental runtime retained')

for token in ['45000','realtime_safety_refresh','realtimeSafetyTimer','QUEUE_DB','qPut(','qAll(','qClear(']:
    forbid('relational-v1512.js',token,'egress/queue removal')
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('SUPABASE_EGRESS_V15.0.80.sql','add column if not exists revision bigint','self-healing v1580 SQL retained')
need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql','public.myb_num(p_text)','weight hotfix retained')

for f in ['relational-v1510.js','relational-v1580.js','relational-v1579.js','relational-v1578.js','relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js','script_inline_0.js','script_inline_1.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')
for f in ['app.js','boot.js','relational-v1512.js','sw.js']: node_check(f)
if text('SUPABASE_EGRESS_V15.0.80.sql').count('$$')%2: errors.append('SQL dollar quotes unbalanced')
if errors:
    print('RELEASE CHECK FAILED: V15.1.2')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.1.2')
