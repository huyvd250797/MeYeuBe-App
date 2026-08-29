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
need('app.js','APP_VERSION="15.0.80"','app version')
need('index.html','./relational-v1580.js?v=15.0.80','runtime load')
need('sw.js','./relational-v1580.js','service worker asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest']: need(f,'15.0.80',f)
try:
    b=json.loads(text('build.json'))
    if b.get('build')!='15.0.80': errors.append('build.json build != 15.0.80')
except Exception as e: errors.append(f'build.json invalid: {e}')
for token in ['myb_relational_apply_changes_v1580','myb_relational_export_state_v1580','myb_relational_revision_v1580','myb_relational_changes_since_v1580','myb_relational_export_incremental_v1580','catchUpSinceRevision','refreshIncremental','fullPolling:false',"egressMode:'incremental_sections'",'pendingPersistentWrites:0',"source:'relational_tables_only'",'setInterval(sendPresence,180000)']:
    need('relational-v1580.js',token,'v1580 runtime')
for token in ['45000','realtime_safety_refresh','realtimeSafetyTimer','QUEUE_DB','qPut(','qAll(','qClear(']: forbid('relational-v1580.js',token,'egress/queue removal')
for token in ['changed_entities text[]','myb_relational_revision_v1580','myb_relational_changes_since_v1580','myb_relational_export_incremental_v1580','myb_relational_apply_changes_v1580','myb_relational_presence_v1580',"'relational_write_v1580'",'revision_gap_too_large','legacy_event_without_change_map',"'careEvents'", "'milkInventory'", "'healthBook'"]:
    need('SUPABASE_EGRESS_V15.0.80.sql',token,'v1580 SQL')
legacy_symbols=['rel62PreviewMigration','rel65RunDoctor','rel66RunDelta','rel67ToggleReadMode','rel68ToggleWriteMode','rel69PromotePrimary','rel70MilkIdentityDoctor']
for sym in legacy_symbols:
    for f in ['app.js','index.html']: forbid(f,sym,f'{f} legacy handler')
for txt in ['Migration JSON → Relational DB','Relational Migration Doctor','Relational Delta Sync','Relational Read Mode','Relational Write Queue','Đẩy dữ liệu chính thức','Milk Identity Doctor']:
    forbid('index.html',txt,'index legacy UI')
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql','public.myb_num(p_text)','weight hotfix retained')
for f in ['relational-v1579.js','relational-v1578.js','relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js','script_inline_0.js','script_inline_1.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')
for f in ['app.js','boot.js','relational-v1580.js','sw.js']: node_check(f)
if text('SUPABASE_EGRESS_V15.0.80.sql').count('$$')%2: errors.append('SQL dollar quotes unbalanced')
if errors:
    print('RELEASE CHECK FAILED: V15.0.80')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.0.80')
