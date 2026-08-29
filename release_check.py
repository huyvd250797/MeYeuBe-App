#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys
ROOT=Path(__file__).resolve().parent
errors=[]

def text(path):
    p=ROOT/path
    if not p.exists():
        errors.append(f'MISSING {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='replace')

def need(path,needle,label=None):
    s=text(path)
    if needle not in s: errors.append(f'{label or path}: missing {needle!r}')

def forbid(path,needle,label=None):
    p=ROOT/path
    if p.exists() and needle in p.read_text(encoding='utf-8',errors='replace'):
        errors.append(f'{label or path}: forbidden {needle!r}')

def node_check(path):
    p=ROOT/path
    try:
        r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True,timeout=30)
        if r.returncode: errors.append(f'node --check {path}: {r.stderr.strip()}')
    except Exception as e: errors.append(f'node --check {path}: {e}')

# Version / assets
need('app.js','APP_VERSION="15.0.79"','app version')
need('index.html','./relational-v1579.js?v=15.0.79','runtime load')
need('sw.js','./relational-v1579.js','service worker asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest']:
    need(f,'15.0.79',f)
try:
    b=json.loads(text('build.json'))
    if b.get('build')!='15.0.79': errors.append('build.json build != 15.0.79')
except Exception as e: errors.append(f'build.json invalid: {e}')

# Guarded DB-first runtime
for token in [
    'myb_relational_apply_changes_v1579','myb_relational_export_state_v1579',
    'p_operation_id','p_base_revision','revision_conflict','guardReady',
    'scheduleReconnect','pendingRealtimeRevision','myb_relational_presence_v1579',
    'installCommitButtonGuard','pendingPersistentWrites:0','source:\'relational_tables_only\''
]: need('relational-v1579.js',token,'v1579 runtime')
for token in ['QUEUE_DB','indexedDB.open','qPut(','qAll(','qClear(']:
    forbid('relational-v1579.js',token,'persistent queue removed')

# Server patch
for token in [
    'myb_family_runtime_state','myb_idempotent_operations','myb_relational_apply_changes_v1579',
    'myb_relational_export_state_v1579','myb_relational_presence_v1579',
    "set_config('myb.v1579_operation_id'",'revision=revision+1',
    "'relational_write_v1579'",'not valid','chk_myb_health_weight_nonnegative_v1579'
]: need('SUPABASE_RELIABILITY_V15.0.79.sql',token,'v1579 SQL')

# Legacy UI remains removed.
legacy_symbols=['rel62PreviewMigration','rel65RunDoctor','rel66RunDelta','rel67ToggleReadMode','rel68ToggleWriteMode','rel69PromotePrimary','rel70MilkIdentityDoctor']
for sym in legacy_symbols:
    for f in ['app.js','index.html']:
        forbid(f,sym,f'{f} legacy handler')
for txt in ['Migration JSON → Relational DB','Relational Migration Doctor','Relational Delta Sync','Relational Read Mode','Relational Write Queue','Đẩy dữ liệu chính thức','Milk Identity Doctor']:
    forbid('index.html',txt,'index legacy UI')

# Weight comma fix must remain intact.
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql','public.myb_num(p_text)','weight hotfix retained')

# Obsolete runtime file should not ship.
for f in ['relational-v1578.js','relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js','script_inline_0.js','script_inline_1.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')

for f in ['app.js','boot.js','relational-v1579.js','sw.js']:
    node_check(f)

if errors:
    print('RELEASE CHECK FAILED: V15.0.79')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.0.79')
