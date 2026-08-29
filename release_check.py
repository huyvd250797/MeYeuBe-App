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

need('app.js','APP_VERSION="15.1.1"','app version')
need('index.html','./relational-v1511.js?v=15.1.1','runtime load')
need('sw.js','./relational-v1511.js','service worker asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest']: need(f,'15.1.1',f)
try:
    b=json.loads(text('build.json'))
    if b.get('build')!='15.1.1': errors.append('build.json build != 15.1.1')
except Exception as e: errors.append(f'build.json invalid: {e}')

# V15.1.1 root-cause fixes
for token in [
    "var V='15.1.1'",
    'function installRealtimeStatusAuthority()',
    'function setRealtimeStateStable(state)',
    "if(rel&&cloudRealtimeState==='REALTIME'&&cloudRealtimeChannel&&(state==='CONNECTING'||state==='RETRYING'||state==='OFF'))return",
    'function scheduleRecovery(reason,sourceGeneration,graceMs)',
    "if(realtimePhase==='SUBSCRIBED'&&cloudRealtimeChannel)",
    "if(cloudRealtimeChannel&&realtimeKey===key&&!force)return cloudRealtimeChannel",
    "channel('myb_rel_v1511_",
    "realtimePhase='DEGRADED'",
    "scheduleRecovery(String(status).toLowerCase(),myGeneration,realtimeEverSubscribed?8000:4500)",
    "scheduleRecovery('closed',myGeneration,realtimeEverSubscribed?6500:4000)",
    'incremental catch-up failed; socket kept alive',
    "scheduleDataRetry('incremental_data_retry')",
    'realtimeForcedRecoveryCount',
    'Supabase auto-rejoined during the grace period'
]: need('relational-v1511.js',token,'V15.1.1 stable state')

# Legacy auto-connected toast and online-state downgrade must be blocked in relational-only mode.
need('app.js','if(c&&c.relationalOnly)return false','legacy connected toast disabled')
need('app.js',"if(!(__c&&__c.relationalOnly))cloudSetRealtimeState('CONNECTING')",'legacy online connecting guard')

# Old aggressive reconnect patterns must not survive in current runtime.
for token in [
    'function scheduleReconnect(',
    "scheduleReconnect('pull_failed')",
    "scheduleReconnect(status.toLowerCase(),myGeneration)",
    "scheduleReconnect('closed',myGeneration)",
    './relational-v1510.js?v=15.1.0',
    "channel('myb_rel_v1510_"
]: forbid('relational-v1511.js' if 'relational-v1510.js' not in token else 'index.html',token,'aggressive reconnect removed')

# Incremental/Database First retained.
for token in [
    'myb_relational_apply_changes_v1580','myb_relational_export_state_v1580',
    'myb_relational_revision_v1580','myb_relational_changes_since_v1580',
    'myb_relational_export_incremental_v1580','catchUpSinceRevision','refreshIncremental',
    'fullPolling:false',"egressMode:'incremental_sections'",'pendingPersistentWrites:0',
    "source:'relational_tables_only'",'setInterval(sendPresence,180000)'
]: need('relational-v1511.js',token,'incremental runtime retained')

for token in ['45000','realtime_safety_refresh','realtimeSafetyTimer','QUEUE_DB','qPut(','qAll(','qClear(']:
    forbid('relational-v1511.js',token,'egress/queue removal')
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('SUPABASE_EGRESS_V15.0.80.sql','add column if not exists revision bigint','self-healing v1580 SQL retained')
need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql','public.myb_num(p_text)','weight hotfix retained')

for f in ['relational-v1510.js','relational-v1580.js','relational-v1579.js','relational-v1578.js','relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js','script_inline_0.js','script_inline_1.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')
for f in ['app.js','boot.js','relational-v1511.js','sw.js']: node_check(f)
if text('SUPABASE_EGRESS_V15.0.80.sql').count('$$')%2: errors.append('SQL dollar quotes unbalanced')
if errors:
    print('RELEASE CHECK FAILED: V15.1.1')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.1.1')
